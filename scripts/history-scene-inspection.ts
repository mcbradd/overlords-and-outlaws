import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { createTutorial, lessonAction } from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { CONTENT_VERSION } from "../src/history-engine/content";
import { defaultPreferences } from "../src/history-engine/storage";

const output = "artifacts/playtest-recovery/scene";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const reports = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [844, 390],
    [3840, 2160],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await page.routeWebSocket("**/*", (socket) => socket.close());
    let boardRequests = 0;
    page.on('request', request => { if (new URL(request.url()).pathname.endsWith('/art/v2-table.webp')) boardRequests++; });
    await page.goto(process.env.HISTORY_BASE_URL ?? "http://localhost:5178");
    await page.locator('[data-ui="teach"]').click();
    await page.locator('[data-ui="enter-table"]').click();
    await page.waitForFunction(
      () => document.querySelector('.h-table[data-scene-ready="true"]'),
    );
    await page.locator('[data-ui="focus-0"]').click();
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const cards = await page
      .locator('.h-world-card[data-seat="0"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return {
            id: (node as HTMLElement).dataset.cardId,
            x: r.x,
            y: r.y,
            right: r.right,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
            tabIndex: (node as HTMLButtonElement).tabIndex,
            visible:
              r.x >= 0 &&
              r.y >= 0 &&
              r.right <= innerWidth &&
              r.bottom <= innerHeight,
          };
        }),
      );
    await page.screenshot({
      path: `${output}/court-${width}.png`,
      fullPage: false,
    });
    assert(
      cards.length > 0 && cards.every((card) => card.visible),
      `Focused Court is within ${width}×${height}`,
    );
    await page.locator('.h-world-card[data-seat="0"]').first().click();
    // During guided card-selection moments this control selects; otherwise it inspects.
    if (await page.locator("dialog[open]").count())
      await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.querySelector('.h-table[data-scene-ready="true"]'));
    await page.locator('[data-ui="focus-all"]').click();
    const beforeRebuild = boardRequests;
    const selectedCard = page.locator('.h-hand [data-select]').first();
    assert(await selectedCard.isVisible(), 'Exercise a real hand selection that rebuilds the table');
    await selectedCard.click();
    await page.waitForFunction(() => document.querySelector('.h-table[data-scene-ready="true"]'));
    await selectedCard.click();
    await page.waitForFunction(() => document.querySelector('.h-table[data-scene-ready="true"]'));
    assert.equal(boardRequests, beforeRebuild, 'Table rebuilds must reuse decoded board artwork without another image request');
    await page.screenshot({
      path: `${output}/table-${width}.png`,
      fullPage: false,
    });
    reports.push({ width, height, cards, boardRequests, boardReloadsOnSelection: boardRequests - beforeRebuild });
    await page.close();
  }
  // Reproduce the long-camera depth failure at the actual late teaching state.
  let late = createTutorial();
  for (let cursor = 0; cursor < 43; cursor++)
    late = applyAction(late, lessonAction(late, cursor)!);
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await page.routeWebSocket("**/*", (socket) => socket.close());
  await page.goto(process.env.HISTORY_BASE_URL ?? "http://localhost:5178");
  await page.evaluate(
    (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
    {
      version: 4,
      rulesetId: "history-engine-v4",
      contentVersion: CONTENT_VERSION,
      game: late,
      tutorial: null,
      preferences: defaultPreferences(),
    },
  );
  await page.reload();
  await page.locator('[data-ui="resume"]').click();
  if (await page.locator('[data-ui="unlock"]').count())
    await page.locator('[data-ui="unlock"]').click();
  await page.locator('[data-ui="focus-all"]').click();
  await page.waitForFunction(
    (count) => document.querySelectorAll(".h-world-card").length === count,
    late.players.reduce((total, player) => total + player.court.length, 0),
  );
  await page.waitForFunction(() => document.querySelector('.h-table[data-scene-ready="true"]'));
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.screenshot({
    path: `${output}/late-depth-1440.png`,
    fullPage: false,
  });
  await page.close();
  writeFileSync(`${output}/report.json`, JSON.stringify(reports, null, 2));
  console.log(JSON.stringify(reports));
} finally {
  await browser.close();
}
