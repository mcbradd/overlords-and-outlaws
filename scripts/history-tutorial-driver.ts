import assert from "node:assert/strict";
import type { Page, Locator } from "@playwright/test";
import {
  createPreparedTutorial,
  PREPARED_TUTORIAL_CURSOR,
  LESSONS,
  lessonAction,
} from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { followsTeachingAction } from "../src/history-engine/learning";
import { viewForSeat } from "../src/history-engine/view";
import type { Action, GameState } from "../src/history-engine/types";

export const readGame = (page: Page): Promise<GameState> =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  );
export async function clickReachable(target: Locator, label = "game control") {
  await target.page().evaluate(() => document.fonts.ready);
  await target
    .page()
    .evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  const geometry = await target.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0,
      top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? innerWidth,
      height = viewport?.height ?? innerHeight;
    const panel = element.closest(".h-decision")?.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    const controls = document.querySelector<HTMLElement>(".h-controls");
    const actionPanel = controls
      ?.closest(".h-decision")
      ?.getBoundingClientRect();
    const problems: string[] = [];
    if (controls && actionPanel) {
      const controlsBox = controls.getBoundingClientRect();
      if (
        controlsBox.top < actionPanel.top - 1 ||
        controlsBox.bottom > actionPanel.bottom + 1 ||
        controls.scrollHeight > controls.clientHeight + 1
      )
        problems.push(
          `controls panel overflows: ${JSON.stringify(controlsBox.toJSON())}, scroll/client ${controls.scrollHeight}/${controls.clientHeight}`,
        );
      for (const control of controls.querySelectorAll<HTMLElement>(
        "button,select",
      )) {
        const rect = control.getBoundingClientRect();
        if (
          !rect.width ||
          !rect.height ||
          getComputedStyle(control).visibility === "hidden"
        )
          continue;
        const point = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        if (
          rect.left < actionPanel.left - 1 ||
          rect.right > actionPanel.right + 1 ||
          rect.top < actionPanel.top - 1 ||
          rect.bottom > actionPanel.bottom + 1 ||
          rect.left < left - 1 ||
          rect.right > left + width + 1 ||
          rect.top < top - 1 ||
          rect.bottom > top + height + 1 ||
          !point ||
          !(point === control || control.contains(point))
        )
          problems.push(
            `${control.textContent?.trim().slice(0, 90)}: ${JSON.stringify(rect.toJSON())}, hit ${point?.tagName ?? "none"}`,
          );
      }
    }
    return {
      rect: box.toJSON(),
      viewport: { left, top, width, height },
      panel: panel?.toJSON(),
      inViewport:
        box.left >= left - 1 &&
        box.top >= top - 1 &&
        box.right <= left + width + 1 &&
        box.bottom <= top + height + 1,
      inPanel:
        !panel ||
        (box.left >= panel.left - 1 &&
          box.top >= panel.top - 1 &&
          box.right <= panel.right + 1 &&
          box.bottom <= panel.bottom + 1),
      hit: !!hit && (hit === element || element.contains(hit)),
      interceptedBy: hit?.outerHTML.slice(0, 180) ?? "nothing",
      problems,
    };
  });
  if (
    !(
      geometry.inViewport &&
      geometry.inPanel &&
      geometry.hit &&
      !geometry.problems.length
    )
  )
    await target
      .page()
      .screenshot({
        path: `artifacts/history/unreachable-${target.page().viewportSize()?.width}-${label.replace(/[^a-z0-9]+/gi, "-")}.png`,
      });
  assert.ok(
    geometry.inViewport &&
      geometry.inPanel &&
      geometry.hit &&
      !geometry.problems.length,
    `${label} or another visible control is not directly reachable: ${JSON.stringify(geometry)}`,
  );
  await target.click();
}
export async function startTeaching(page: Page) {
  await clickReachable(page.locator('[data-ui="teach"]'), "Learn at the table");
  assert.equal(
    await page.locator(".h-curtain").count(),
    0,
    "solo teaching has no handoff",
  );
  assert.match(
    await page.locator(".h-solo-intro").innerText(),
    /Henry II.*Henry VII/s,
  );
  const prepared = await readGame(page);
  assert.deepEqual(
    prepared,
    JSON.parse(JSON.stringify(createPreparedTutorial())),
  );
  await clickReachable(
    page.locator('[data-ui="enter-table"]'),
    "Take your seat",
  );
  assert.deepEqual(
    await readGame(page),
    prepared,
    "entering the table is presentation-only",
  );
  assert.equal(
    await page
      .locator(
        '[data-guide-card],[data-ui="lesson-action"],[data-ui="lesson-next"]',
      )
      .count(),
    0,
  );
  assert.match(
    await page.locator(".h-progress").innerText(),
    /AT YOUR TABLE/,
  );
}
export async function driveTeaching(
  page: Page,
  capture?: (cursor: number) => Promise<void>,
) {
  let expected = createPreparedTutorial();
  let humanDecisions = 0,
    automaticActions = 0,
    clicks = 0;
  for (
    let cursor = PREPARED_TUTORIAL_CURSOR;
    cursor < LESSONS.length;
    cursor++
  ) {
    await page.waitForFunction(
      (revision) =>
        JSON.parse(localStorage.getItem("oando-v4-history")!).game.revision ===
        revision,
      expected.revision,
    );
    assert.deepEqual(
      await readGame(page),
      JSON.parse(JSON.stringify(expected)),
      `before action ${cursor}`,
    );
    let action = lessonAction(expected, cursor)!;
    if (action.seat === 0) {
      humanDecisions++;
      if (capture) await capture(cursor);
      if (action.type === "barter") {
        for (const id of action.cards ?? []) {
          await clickReachable(
            page.locator(`[data-select="${id}"]`),
            `select ${id}`,
          );
          clicks++;
        }
        await clickReachable(
          page.locator(`[data-ui="offer-${action.other}"]`),
          "offer trade",
        );
      } else {
        const recommendation = page
          .locator('[data-action][data-recommended="true"]')
          .first();
        action = JSON.parse(
          (await recommendation.getAttribute("data-action"))!,
        );
        assert.ok(
          followsTeachingAction(
            viewForSeat(expected, 0),
            lessonAction(expected, cursor)!,
            action,
          ),
        );
        await clickReachable(
          recommendation,
          `decision ${cursor}: ${action.type}`,
        );
      }
      clicks++;
      assert.equal(await page.locator('[data-ui="commit"]').count(), 0, "No second confirmation");
    } else {
      automaticActions++;
      assert.equal(
        await page
          .getByRole("button", { name: "Resolve opponent action", exact: true })
          .count(),
        0,
      );
      if (cursor === 16)
        assert.doesNotMatch(
          await page.locator(".h-opponent-preview").innerText(),
          /Richard I/,
          "uninspected offer remains concealed",
        );
    }
    if (action.seat !== 0) await page.locator('[data-ui="advance-ai"]').click();
    expected = applyAction(expected, action);
    try {
      await page.waitForFunction(
        (revision) =>
          JSON.parse(localStorage.getItem("oando-v4-history")!).game
            .revision === revision,
        expected.revision,
        { timeout: 10000 },
      );
    } catch {
      await page.screenshot({
        path: `artifacts/history/flow-failure-${page.viewportSize()?.width}.png`,
      });
      throw Error(
        `Tutorial cursor ${cursor}, wanted revision ${expected.revision}, saved ${JSON.stringify(await readGame(page))}; visible ${(await page.locator("body").innerText()).slice(-2200)}`,
      );
    }
    assert.deepEqual(
      await readGame(page),
      JSON.parse(JSON.stringify(expected)),
      `after action ${cursor}`,
    );
  }
  assert.equal(expected.result?.winner, 0);
  assert.equal(humanDecisions, 15);
  assert.equal(automaticActions, 23);
  assert.equal(clicks, 16);
  return {
    humanDecisions,
    automaticActions,
    playerClicks: clicks,
    mandatoryContinues: 0,
    terminal: expected.result,
  };
}
