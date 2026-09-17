import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { createGame } from "../src/core-game/engine";
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
  ]) {
    const page = await browser.newPage({
      viewport,
      hasTouch: viewport.width < 500,
    });
    await page.goto(base);
    await page.locator('[data-do="setup"]').click();
    await page
      .locator("#save-file")
      .setInputFiles({
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
      await page.screenshot({
        path: `${output}/${viewport.width}-pile-${seat}.png`,
      });
      for (const id of game.players[seat].played) {
        const card = page.locator(
          `[data-do="inspect-played"][data-card="${id}"]`,
        );
        await card.focus();
        await page.keyboard.press("Enter");
        await expect(page.locator(".c-inspection-card")).toBeVisible();
        await page.locator('[data-do="played-pile"]').click();
      }
      await page.locator('[data-do="close"]').click();
    }
    const revision = await page.evaluate(
      () =>
        JSON.parse(
          Object.entries(localStorage).find(([k]) =>
            k.endsWith("oando-v5-played-trades"),
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
