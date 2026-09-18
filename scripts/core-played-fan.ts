import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import {} from "../src/core-game/engine";
import { createGame } from "../tests/core-established-fixture";
import { encodeSave } from "../src/core-game/storage";
const base = process.env.BASE_URL ?? "http://localhost:5173";
const output = process.env.FAN_OUTPUT ?? "artifacts/core/played-fan";
mkdirSync(output, { recursive: true });
const game = createGame({ seed: 501, dynasties: ["alba", "plantagenet"] });
game.players.forEach((p) => p.played.push(...game.deck.splice(0, 6)));
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 3840, height: 2160 },
  ]) {
    const page = await browser.newPage({
      viewport,
      hasTouch: viewport.width < 500,
    });
    await page.goto(base);
    await page.locator('[data-do="setup"]').click();
    await page.locator("#save-file").setInputFiles({
      name: "piles.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        encodeSave({
          game,
          mode: "local",
          names: ["You", "Rival"],
          lesson: null,
          motion: false,
        }),
      ),
    });
    await page.locator('[data-do="unlock"]').click();
    await page.screenshot({ path: `${output}/${viewport.width}-table.png` });
    for (const seat of [0, 1]) {
      const pile = page.locator(`[data-played-pile="${seat}"]`).last();
      // Keyboard activation also verifies that each public pile is accessible.
      if (seat === 0) {
        if (viewport.width < 500) await pile.tap();
        else await pile.click();
      } else {
        await pile.focus();
        await page.keyboard.press("Enter");
      }
      await expect(page.locator(".c-played-fan button")).toHaveCount(6);
      const fit = await page.locator(".c-played-display").evaluate((e) => ({
        scroll:
          e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth,
        cards: [...e.querySelectorAll(".c-played-fan button")].map((c) => {
          const r = c.getBoundingClientRect();
          return (
            r.x >= 0 &&
            r.y >= 0 &&
            r.right <= innerWidth &&
            r.bottom <= innerHeight
          );
        }),
      }));
      assert.equal(fit.scroll, false);
      assert.ok(fit.cards.every(Boolean));
      const surface = await page
        .locator(".c-played-fan")
        .evaluate((e) => ({
          background: getComputedStyle(e).backgroundColor,
          border: getComputedStyle(e).borderWidth,
          shadow: getComputedStyle(e).boxShadow,
        }));
      assert.deepEqual(surface, {
        background: "rgba(0, 0, 0, 0)",
        border: "0px",
        shadow: "none",
      });
      await page.screenshot({
        path: `${output}/${viewport.width}-pile-${seat}.png`,
      });
      for (const id of game.players[seat].played) {
        const card = page.locator(
          `[data-do="inspect-played"][data-card="${id}"]`,
        );
        await card.focus();
        await page.keyboard.press("Enter");
        await expect(page.locator(".c-played-expanded")).toBeVisible();
        const enlarged = await page
          .locator(".c-played-expanded button")
          .boundingBox();
        assert.ok(
          enlarged &&
            enlarged.x >= 0 &&
            enlarged.y >= 0 &&
            enlarged.x + enlarged.width <= viewport.width &&
            enlarged.y + enlarged.height <= viewport.height,
        );
        await page
          .locator(".c-played-expanded")
          .click({ position: { x: 3, y: 3 } });
        await expect(page.locator(".c-played-expanded")).toHaveCount(0);
      }
      await page.locator('[data-do="close"]').click();
      await expect(page.locator(".c-played-display")).toHaveCount(0);
    }
    const revision = await page.evaluate(
      () =>
        JSON.parse(
          Object.entries(localStorage).find(([k]) =>
            k.endsWith("oando-v9-inheritance"),
          )![1],
        ).game.revision,
    );
    assert.equal(revision, 0, "examining either pile must not play cards");
    await page.close();
  }
  console.log(
    "Both Played piles fan out; all twelve cards inspectable; no game mutation. Desktop and compact passed.",
  );
} finally {
  await browser.close();
}
