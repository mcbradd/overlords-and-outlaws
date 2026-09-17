import { chromium } from "@playwright/test";
import { createDenseFixture, createDemo } from "../src/history-engine/fixtures";
import { CONTENT_VERSION } from "../src/history-engine/content";
import { defaultPreferences } from "../src/history-engine/storage";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
mkdirSync("artifacts/history", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const reports = [];
for (const maximum of [false, true])
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [3840, 2160],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const game = createDenseFixture(maximum);
    await page.goto(base);
    await page.evaluate(
      (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
      {
        version: 4,
        rulesetId: "history-engine-v4",
        contentVersion: CONTENT_VERSION,
        game,
        tutorial: null,
        preferences: defaultPreferences(),
      },
    );
    await page.reload();
    await page.locator('[data-ui="resume"]').click();
    assert.equal(await page.locator(".h-card-face").count(), 0);
    await page.locator('[data-ui="unlock"]').click();
    await page.waitForFunction(
      (count) => document.querySelectorAll(".h-world-card").length === count,
      maximum ? 52 : 24,
    );
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page.screenshot({
      path: `artifacts/history/${maximum ? "maximum" : "dense"}-${width}.png`,
      fullPage: true,
    });
    await page.locator('[data-ui="focus-0"]').click();
    await page.screenshot({
      path: `artifacts/history/${maximum ? "maximum" : "dense"}-court-${width}.png`,
      fullPage: true,
    });
    await page.locator(".h-world-card").first().click({ force: true });
    assert.ok(await page.locator("dialog[open]").count());
    await page.keyboard.press("Escape");
    await page.locator('[data-ui="lock"]').click();
    assert.equal(
      await page.locator(".h-world-card,.h-card-face,dialog").count(),
      0,
    );
    assert.deepEqual(errors, []);
    reports.push({ maximum, width, height, errors });
    await page.close();
  }
// Actual hot-seat routes: packet locking switches to a curtain with no private DOM.
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base);
await page.locator('[data-ui="setup"]').click();
await page.locator("#h-mode").selectOption("local");
await page.locator('[data-ui="begin"]').click();
await page.locator('[data-ui="unlock"]').click();
for (let i = 0; i < 3; i++) await page.locator("[data-select]").nth(i).click();
await page.locator('[data-ui="lock-packet"]').click();
assert.ok(await page.locator(".h-curtain").count());
assert.equal(await page.locator(".h-card-face").count(), 0);
await page.reload();
await page.locator('[data-ui="resume"]').click();
assert.equal(await page.locator(".h-card-face").count(), 0);
await page.close();
await browser.close();
writeFileSync(
  "artifacts/history/layout-report.json",
  JSON.stringify(reports, null, 2),
);
console.log(
  `History layout: ${reports.length} dense/maximum scenes, inspection, handoff, hot-seat packet and reload privacy passed.`,
);
