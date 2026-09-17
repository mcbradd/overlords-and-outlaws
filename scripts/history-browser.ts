import { chromium, type Locator } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
  startTeaching,
  driveTeaching,
  readGame,
} from "./history-tutorial-driver";
import {
  createTutorial,
  createPreparedTutorial,
  lessonAction,
} from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { CONTENT_VERSION } from "../src/history-engine/content";
import { defaultPreferences } from "../src/history-engine/storage";
const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
const [width, height] = (process.env.HISTORY_VIEWPORT ?? "1440x900")
  .split("x")
  .map(Number);
const size = `${width}x${height}`;
mkdirSync("artifacts/history", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width, height },
  reducedMotion: "reduce",
});
await page.routeWebSocket("**/*", (socket) => socket.close());
const errors: string[] = [];
page.on("pageerror", (error) => errors.push(error.message));
async function captureScene(name: string) {
  await page
    .locator('.h-table[data-scene-ready="true"], .h-table.semantic')
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/history/${name}-${size}.png` });
}
async function readerControl(selector: string): Promise<Locator> {
  const dialog = page.locator("dialog.h-dialog[open]");
  await dialog.locator(".h-reader-page:not([hidden])").waitFor();
  const position = dialog.locator(".h-reader-position select");
  const values = await position
    .locator("option")
    .evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
  for (const value of values) {
    await position.selectOption(value);
    const control = dialog.locator(selector);
    if (await control.isVisible()) {
      assert.ok(
        await control.evaluate((element) => {
          const rect = element.getBoundingClientRect(),
            viewport = window.visualViewport;
          const hit = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          return (
            rect.left >= 0 &&
            rect.top >= 0 &&
            rect.right <= (viewport?.width ?? innerWidth) + 1 &&
            rect.bottom <= (viewport?.height ?? innerHeight) + 1 &&
            !!hit &&
            (hit === element || element.contains(hit))
          );
        }),
        `reader control ${selector} must be visible and directly reachable`,
      );
      return control;
    }
  }
  throw Error(`No reader page exposes ${selector}`);
}
try {
  await page.goto(base);
  await startTeaching(page);
  await captureScene("opening-prepared");
  const report = await driveTeaching(page, async (cursor) => {
    if ([19, 22, 24, 40, 43, 45, 49].includes(cursor))
      await captureScene(`decision-${cursor}`);
  });
  await captureScene("settlement");
  const settled = await readGame(page);
  await page.reload();
  await page.locator('[data-ui="resume"]').click();
  assert.equal(
    await page.locator(".h-curtain").count(),
    0,
    "solo resume opens directly",
  );
  assert.deepEqual(await readGame(page), settled);
  await page.locator('.h-table[data-scene-ready="true"]').waitFor();
  await page.locator("canvas.h-webgl").dispatchEvent("webglcontextlost");
  assert.ok(await page.locator(".h-semantic-table").count());
  assert.deepEqual(await readGame(page), settled);
  await page.locator('[data-ui="home"]').first().click();
  await page.locator('[data-ui="setup"]').click();
  await (await readerControl("#h-mode")).selectOption("local");
  await (await readerControl('[data-ui="begin"]')).click();
  assert.equal(await page.locator(".h-curtain").count(), 1);
  assert.equal(await page.locator(".h-card-face").count(), 0);
  await page.locator('[data-ui="unlock"]').click();
  for (let index = 0; index < 3; index++)
    await page.locator("[data-select]").nth(index).click();
  await page.locator('[data-ui="lock-packet"]').click();
  assert.equal(await page.locator(".h-curtain").count(), 1);
  assert.equal(await page.locator(".h-card-face").count(), 0);
  const prepared = createPreparedTutorial();
  const rivalDue = applyAction(prepared, lessonAction(prepared, 15)!);
  await page.evaluate(
    (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
    {
      version: 4,
      rulesetId: "history-engine-v4",
      contentVersion: CONTENT_VERSION,
      game: rivalDue,
      tutorial: 16,
      preferences: defaultPreferences(),
    },
  );
  await page.reload();
  await page.locator('[data-ui="resume"]').click();
  await page.locator('[data-inspect="alba-7"]').click();
  // This deliberate delay proves a reading pause exceeds the rival's 1.8-second timer.
  await page.waitForTimeout(2100);
  assert.equal(await page.locator("dialog[open]").count(), 1);
  assert.deepEqual(await readGame(page), JSON.parse(JSON.stringify(rivalDue)));
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    (revision) =>
      JSON.parse(localStorage.getItem("oando-v4-history")!).game.revision ===
      revision,
    rivalDue.revision + 1,
  );
  assert.deepEqual(
    await readGame(page),
    JSON.parse(
      JSON.stringify(applyAction(rivalDue, lessonAction(rivalDue, 16)!)),
    ),
  );
  // A late cursor from an obsolete teaching sequence cannot mutate its saved match.
  let late = createTutorial();
  for (let index = 0; index < 45; index++)
    late = applyAction(late, lessonAction(late, index)!);
  await page.evaluate(
    (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
    {
      version: 4,
      rulesetId: "history-engine-v4",
      contentVersion: CONTENT_VERSION,
      game: late,
      tutorial: 40,
      preferences: defaultPreferences(),
    },
  );
  await page.reload();
  await page.locator('[data-ui="resume"]').click();
  assert.equal(await page.locator(".h-guide").count(), 0);
  assert.match(
    await page.locator(".h-tutorial-notice").innerText(),
    /saved position is intact/,
  );
  assert.deepEqual(await readGame(page), JSON.parse(JSON.stringify(late)));
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("oando-v4-history")!).tutorial,
    ),
    40,
    "merely opening an old save does not rewrite its stored bytes",
  );
  assert.deepEqual(errors, []);
  writeFileSync(
    `artifacts/history/browser-report-${size}.json`,
    JSON.stringify(
      {
        ...report,
        width,
        height,
        directHitChecks: true,
        soloCurtain: false,
        hotSeatPrivacy: true,
        obsoleteTutorialPreserved: true,
        inspectionPausesRivals: true,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    `History browser: ${report.humanDecisions} real decisions, ${report.automaticActions} automatic rival actions, ${report.playerClicks} player clicks; solo resume and hot-seat privacy passed.`,
  );
} finally {
  await browser.close();
}
