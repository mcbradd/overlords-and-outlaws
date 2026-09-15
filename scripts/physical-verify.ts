import { chromium, expect } from "@playwright/test";
import { createDuel } from "../src/duel";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report: unknown[] = [];
mkdirSync("artifacts/physical", { recursive: true });
try {
  for (const seats of [2, 3, 4])
    for (const [width, height] of [
      [3840, 2160],
      [1920, 1080],
      [1440, 900],
      [1024, 768],
      [390, 844],
      [844, 390],
    ]) {
      const game = createDuel({ seed: 811, house: "alba", seats });
      for (const p of game.players) {
        p.court.push(...p.hand.splice(0, 4));
        p.hand.push(...p.deck.splice(0, 7 - p.hand.length));
      }
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.addInitScript(
        (g) =>
          localStorage.setItem(
            "oando-v3",
            JSON.stringify({
              version: 2,
              game: g,
              wins: 0,
              renown: 0,
              sound: false,
              motion: false,
              coaching: true,
              seen: [],
              run: null,
              processed: [],
              daily: null,
            }),
          ),
        game,
      );
      await page.goto("http://localhost:5173");
      await page.locator("[data-resume]").click();
      await expect(page.locator(".physical-card")).toHaveCount(seats * 5);
      await expect(page.locator(".hand-card")).toHaveCount(7);
      await page.waitForTimeout(250);
      const summaries = await page.locator("#scoreboard").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return [...el.children].every((c) => {
          const b = c.getBoundingClientRect();
          return (
            b.top >= r.top - 1 &&
            b.bottom <= r.bottom + 1 &&
            b.right <= r.right + 1
          );
        });
      });
      expect(summaries, `summaries ${seats}/${width}`).toBe(true);
      for (let owner = 0; owner < seats; owner++) {
        await page.locator(`[data-camera-seat="${owner}"]`).click();
        await page.waitForTimeout(50);
        const cards = page.locator(
          `.physical-card[data-owner="${owner}"] [data-royal]`,
        );
        await expect(cards).toHaveCount(5);
        // Every object has a keyboard equivalent and reveals its full printed face without spending an order.
        for (let i = 0; i < 5; i++) {
          await cards.nth(i).focus();
          await page.keyboard.press("Enter");
          await expect(cards.nth(i)).toHaveAttribute("aria-pressed", "true");
          await page.keyboard.press("Escape");
        }
      }
      await page.locator('[data-camera-seat="all"]').click();
      await page.mouse.move(0, 0);
      if (seats === 4)
        await page.screenshot({
          path: `artifacts/physical/verified-${seats}-${width}.png`,
          fullPage: true,
        });
      const hand = page.locator(".hand-card").last();
      await hand.focus();
      await page.keyboard.press("Enter");
      await expect(hand).toHaveClass(/selected/);
      await page.locator(".inspect-trigger").click();
      await expect(page.locator(".modal")).toBeVisible();
      await page.keyboard.press("Escape");
      expect(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("oando-v3")!).game.orders,
        ),
      ).toBe(game.orders);
      expect(errors).toEqual([]);
      report.push({
        seats,
        width,
        height,
        cards: seats * 5,
        inspectionPreservesOrders: true,
        errors,
      });
      await page.close();
    }
} finally {
  await browser.close();
  writeFileSync(
    "artifacts/physical/verification.json",
    JSON.stringify(report, null, 2),
  );
}
console.log(`Verified ${report.length} dense physical-board configurations`);
