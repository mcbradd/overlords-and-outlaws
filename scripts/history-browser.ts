import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
  createTutorial,
  LESSONS,
  lessonAction,
} from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { CONTENT_VERSION } from "../src/history-engine/content";
import { defaultPreferences } from "../src/history-engine/storage";
import { createDemo } from "../src/history-engine/fixtures";
import { chooseAction } from "../src/history-engine/ai";
import { viewForSeat } from "../src/history-engine/view";
const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
mkdirSync("artifacts/history", { recursive: true });
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--disable-dev-shm-usage"],
});
const errors: string[] = [];
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base);
await page
  .getByRole("button", { name: "Learn at the table", exact: true })
  .click();
await page.getByRole("button", { name: "Open my view", exact: true }).click();
await page.screenshot({
  path: "artifacts/history/opening-draft.png",
  fullPage: true,
});
let expected = createTutorial();
let captures = 0;
for (let i = 0; i < LESSONS.length; i++) {
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  );
  assert.equal(before.revision, expected.revision);
  await page.locator('[data-ui="lesson-action"]').click();
  expected = applyAction(expected, lessonAction(expected, i)!);
  const actual = await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  );
  assert.deepEqual(
    actual,
    JSON.parse(JSON.stringify(expected)),
    `tutorial action ${i + 1}`,
  );
  if ([14, 24, 33, 45, 55].includes(i)) {
    await page.waitForFunction(
      () => document.querySelectorAll(".h-world-card").length > 0,
    );
    await page.screenshot({
      path: `artifacts/history/lesson-${i + 1}.png`,
      fullPage: true,
    });
    captures++;
  }
  if (i < LESSONS.length - 1) {
    await page.locator('[data-ui="lesson-next"]').click();
    const continued = await page.evaluate(
      () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
    );
    assert.deepEqual(actual, continued, "Continue changes only guide cursor");
  }
}
assert.equal(expected.result?.winner, 0);
await page.screenshot({
  path: "artifacts/history/settlement.png",
  fullPage: true,
});
await page.reload();
await page
  .getByRole("button", { name: "Resume saved game", exact: true })
  .click();
assert.equal(
  await page.locator(".h-card-face").count(),
  0,
  "reload curtain removes all hand faces",
);
await page.getByRole("button", { name: "Open my view", exact: true }).click();
for (const [width, height] of [
  [390, 844],
  [844, 390],
  [1024, 768],
  [1920, 1080],
  [3840, 2160],
]) {
  await page.setViewportSize({ width, height });
  await page.screenshot({
    path: `artifacts/history/settlement-${width}.png`,
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 2,
    ),
    false,
    `horizontal overflow ${width}`,
  );
}
await page.setViewportSize({ width: 1440, height: 900 });
const beforeContextLoss = await page.evaluate(
  () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
);
await page.locator("canvas.h-webgl").dispatchEvent("webglcontextlost");
assert.ok(await page.locator(".h-semantic-court").count());
assert.deepEqual(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  ),
  beforeContextLoss,
);
await page.locator('[data-ui="settings"]').click();
await page.locator("#h-quality").selectOption("compact");
await page.getByRole("button", { name: "Apply settings", exact: true }).click();
assert.equal(await page.locator("canvas.h-webgl").count(), 1);
await page.locator('[data-ui="settings"]').click();
await page.locator("#h-quality").selectOption("semantic");
await page.getByRole("button", { name: "Apply settings", exact: true }).click();
assert.ok(await page.locator(".h-semantic-court").count());
// The browser worker must commit the same policy result as the pure evaluator.
await page.locator('[data-ui="knowledge"]').click();
for (const question of await page.locator("[data-knowledge]").all())
  await question.selectOption("yes");
await page.locator('[data-ui="knowledge-check"]').click();
assert.match(await page.locator(".h-guide").innerText(), /4\/4 correct/);
assert.deepEqual(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  ),
  beforeContextLoss,
);
await page.locator('[data-ui="practice"]').click();
await page.locator('[data-ui="unlock"]').click();
assert.equal(await page.locator('[data-ui="advice"]').count(), 0);
const solo = createDemo();
solo.players[0].ai = true;
solo.players[1].ai = false;
const expectedSolo = applyAction(
  solo,
  chooseAction(viewForSeat(solo, 0), 0)!.action,
);
await page.evaluate(
  (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
  {
    version: 4,
    rulesetId: "history-engine-v4",
    contentVersion: CONTENT_VERSION,
    game: solo,
    tutorial: null,
    preferences: defaultPreferences(),
  },
);
await page.reload();
await page.locator('[data-ui="resume"]').click();
await page.locator('[data-ui="unlock"]').click();
await page.locator('[data-ui="ai-step"]').click();
await page.waitForFunction(
  (revision) =>
    JSON.parse(localStorage.getItem("oando-v4-history")!).game.revision ===
    revision,
  expectedSolo.revision,
);
assert.deepEqual(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  ),
  JSON.parse(JSON.stringify(expectedSolo)),
);
assert.deepEqual(errors, []);
writeFileSync(
  "artifacts/history/browser-report.json",
  JSON.stringify(
    {
      tutorialActions: LESSONS.length,
      captures,
      errors,
      terminal: expected.result,
      contentVersion: CONTENT_VERSION,
    },
    null,
    2,
  ),
);
await browser.close();
console.log(
  `History browser: ${LESSONS.length} legal teaching actions, state-neutral Continue, reload curtain, six viewports, semantic fallback passed.`,
);
