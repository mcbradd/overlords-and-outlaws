import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
mkdirSync("artifacts/tutorial", { recursive: true });
const report: unknown[] = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [3840, 2160],
    [390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() =>
      localStorage.setItem(
        "oando-v3",
        JSON.stringify({
          version: 2,
          game: null,
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
    );
    await page.goto("http://localhost:5173");
    await page.locator('[data-start="lesson"]').click();
    let actions = 0;
    while (actions++ < 90) {
      const focus = page.locator("[data-tutorial-focus]");
      await expect(focus).toHaveCount(1, { timeout: 15000 });
      await expect(page.locator("#lesson-coach")).toBeVisible();
      await expect(
        page.locator("[data-lesson],.lesson-read,.lesson-number"),
      ).toHaveCount(0);
      await expect(page.locator("#decision-panel")).toBeEmpty();
      const data = await focus.evaluate((el) => ({
        next: el.hasAttribute("data-next-lesson"),
        move: el.getAttribute("data-move"),
        response: el.getAttribute("data-response"),
        royal: el.getAttribute("data-royal"),
      }));
      const game = await page.evaluate(
        () => JSON.parse(localStorage.getItem("oando-v3")!).game,
      );
      if (
        data.next ||
        data.response ||
        (data.move && JSON.parse(data.move).type === "attack")
      ) {
        await page.mouse.move(0, 0);
        await page.screenshot({
          path: `artifacts/tutorial/${width}-step-${game.lesson}-${data.next ? "complete" : data.response ? "response" : "preview"}.png`,
          fullPage: true,
        });
      }
      if (data.next && game.lesson === 9) {
        expect(game.winner).toBe(0);
        break;
      }
      const before = JSON.stringify({ ...game, lesson: 0 });
      await focus.click();
      if (data.next && game.turn === 0) {
        const after = await page.evaluate(
          () => JSON.parse(localStorage.getItem("oando-v3")!).game,
        );
        expect(JSON.stringify({ ...after, lesson: 0 })).toBe(before);
      }
      // Avoid reusing a completed action's node while its animation is running.
      await page.waitForTimeout(180);
    }
    expect(actions).toBeLessThan(90);
    expect(errors).toEqual([]);
    report.push({ width, height, actions, errors });
    await page.close();
  }
  writeFileSync(
    "artifacts/tutorial/browser-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(report);
} finally {
  await browser.close();
}
