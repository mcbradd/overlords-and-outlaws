import { chromium, expect } from "@playwright/test";
import { createDuel } from "../src/duel";
import { mkdirSync, writeFileSync } from "node:fs";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const report: unknown[] = [];
mkdirSync("artifacts/ux/verified", { recursive: true });
try {
  for (const seats of [2, 3, 4]) {
    const game = createDuel({ seed: 811, house: "alba", seats });
    for (const p of game.players) {
      p.court.push(...p.hand.splice(0, 4));
      p.hand.push(...p.deck.splice(0, 7 - p.hand.length));
    }
    for (const [width, height] of [
      [3840, 2160],
      [1920, 1080],
      [1440, 900],
      [1024, 768],
      [844, 390],
      [390, 844],
    ]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.addInitScript("window.__name = (value) => value");
      await page.addInitScript(
        (game) =>
          localStorage.setItem(
            "oando-v3",
            JSON.stringify({
              version: 2,
              game,
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
      await page.goto("http://localhost:5173/?legacy=1");
      await page.locator("[data-resume]").click();
      await page.locator(".arena [data-royal]").first().waitFor();
      const summariesFit = await page.locator("#scoreboard").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return [...el.children].every((c) => {
          const b = c.getBoundingClientRect();
          return b.top >= r.top && b.bottom <= r.bottom + 1;
        });
      });
      expect(
        summariesFit,
        `House summaries overlap the board: ${seats}/${width}`,
      ).toBe(true);
      await expect(page.locator(".hand-cards [data-royal]")).toHaveCount(7);
      // Every dense court is reachable; small screens deliberately choose rivals.
      for (let owner = 0; owner < seats; owner++) {
        if (width <= 760 && owner > 0)
          await page.locator(`[data-view-court="${owner}"]`).click();
        const cards = page.locator(
          `.court-cards[data-owner="${owner}"] [data-royal]`,
        );
        await expect(cards).toHaveCount(5);
        for (let i = 0; i < 5; i++) {
          await cards.nth(i).scrollIntoViewIfNeeded();
          const good = await cards.nth(i).evaluate((el) => {
            const b = el.getBoundingClientRect(),
              row = el.closest(".court-cards")!.getBoundingClientRect();
            const stats = [...el.querySelectorAll(".card-foot b")].map((e) =>
              e.getBoundingClientRect(),
            );
            return {
              good:
                b.width >= 90 &&
                b.height >= 105 &&
                b.top >= row.top - 1 &&
                b.bottom <= row.bottom + 1 &&
                b.left >= row.left - 1 &&
                b.right <= row.right + 1 &&
                stats.every((s) => s.top >= b.top && s.bottom <= b.bottom),
              card: b.toJSON(),
              row: row.toJSON(),
              stats: stats.map((s) => s.toJSON()),
            };
          });
          expect(
            good.good,
            `card clipped: ${seats} seats ${width}px owner ${owner} index ${i}: ${JSON.stringify(good)}`,
          ).toBe(true);
        }
      }
      const hand = page.locator(".hand-card").last();
      await hand.focus();
      await page.keyboard.press("Enter");
      await expect(hand).toHaveClass(/selected/);
      await expect(hand).toBeFocused();
      if (width > 760) {
        await expect(page.locator("#card-detail")).not.toBeEmpty();
        await expect(page.locator("#hover-inspector")).toBeHidden();
      }
      const before = await page.evaluate(
        () => JSON.parse(localStorage.getItem("oando-v3")!).game.orders,
      );
      await page.locator(".inspect-trigger").click();
      await expect(page.locator(".inspect-layout")).toBeVisible();
      await page.screenshot({
        path: `artifacts/ux/verified/inspect-${seats}-${width}.png`,
        fullPage: true,
      });
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      await expect(page.locator(".royal-card.selected")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("oando-v3")!).game.orders,
        ),
      ).toBe(before);
      await page.evaluate(() => window.scrollTo(0, 0));
      const overflow = await page.evaluate(
        () =>
          document.querySelector(".battle-shell")!.getBoundingClientRect()
            .width >
          innerWidth + 1,
      );
      expect(overflow).toBe(false);
      expect(errors).toEqual([]);
      await page.screenshot({
        path: `artifacts/ux/verified/table-${seats}-${width}.png`,
        fullPage: true,
      });
      report.push({
        seats,
        width,
        height,
        reachableCourtCards: seats * 5,
        hand: 7,
        statsContained: true,
        keyboardSelection: true,
        inspectAndCancel: true,
        errors,
      });
      await page.close();
    }
  }
  writeFileSync(
    "artifacts/ux/verified/interaction-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    `Passed ${report.length} dense layout/interaction cases; all courts, seven-card hands, stats, keyboard selection, inspection and cancel.`,
  );
} finally {
  await browser.close();
}
