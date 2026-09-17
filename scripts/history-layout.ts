import { chromium } from "@playwright/test";
import { createDenseFixture } from "../src/history-engine/fixtures";
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
    [844, 390],
    [3840, 2160],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const game = createDenseFixture(maximum);
    // Exercise hot-seat privacy explicitly; solo intentionally opens its owner's view.
    game.players.forEach(player => player.ai = false);
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
      fullPage: false,
    });
    await page.locator('[data-ui="focus-0"]').click();
    await page.screenshot({
      path: `artifacts/history/${maximum ? "maximum" : "dense"}-court-${width}.png`,
      fullPage: false,
    });
    const viewport = await page.evaluate(() => {
      const hand = document.querySelector('.h-hand')!.getBoundingClientRect();
      const panel = document.querySelector('.h-decision')!;
      return { overflow: document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth,
        handVisible: hand.bottom <= innerHeight && hand.left >= 0 && hand.right <= innerWidth,
        panelOverflow: panel.scrollHeight > panel.clientHeight + 1 };
    });
    assert.equal(viewport.overflow, false, `document overflow at ${width}×${height}`);
    assert.equal(viewport.handVisible, true, `hand outside ${width}×${height}`);
    assert.equal(viewport.panelOverflow, false, `action controls overflow at ${width}×${height}`);
    await page.locator('.h-world-card[data-seat="0"]').first().click();
    assert.ok(await page.locator("dialog[open]").count());
    await page.keyboard.press("Escape");
    // Blur is the real hot-seat privacy guard at every responsive size.
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(
      await page.locator(".h-world-card,.h-card-face,dialog").count(),
      0,
    );
    assert.deepEqual(errors, []);
    reports.push({ maximum, width, height, errors, viewport });
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
