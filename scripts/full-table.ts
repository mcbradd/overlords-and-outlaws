import { chromium } from "@playwright/test";
import { createDuel } from "../src/duel";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results: unknown[] = [];
mkdirSync("artifacts/v3", { recursive: true });
try {
  for (const seats of [2, 3, 4]) {
    const g = createDuel({ seed: 2026, house: "alba", seats });
    for (const p of g.players) p.court.push(...p.hand.splice(0, 4));
    const page = await browser.newPage();
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
      g,
    );
    await page.goto("http://localhost:5173/?legacy=1");
    await page.locator("[data-resume]").click();
    for (const [w, h] of [
      [3840, 2160],
      [1920, 1080],
      [1440, 900],
      [1024, 600],
      [844, 390],
      [667, 375],
      [568, 320],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(100);
      const pieces = page.locator(".arena [data-royal]");
      for (let i = 0; i < (await pieces.count()); i++)
        await pieces.nth(i).click({ timeout: 2000 });
      const geometry = await page.evaluate(() => {
        const arena = document.querySelector(".arena")!.getBoundingClientRect();
        return {
          scroll:
            document.documentElement.scrollWidth > innerWidth ||
            document.documentElement.scrollHeight > innerHeight,
          clipped: [...document.querySelectorAll(".arena [data-royal]")]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.left < arena.left - 1 ||
                r.right > arena.right + 1 ||
                r.top < arena.top - 1 ||
                r.bottom > arena.bottom + 1
              );
            })
            .map((e) => (e as HTMLElement).dataset.royal),
        };
      });
      results.push({ seats, w, h, ...geometry });
      await page.screenshot({ path: `artifacts/v3/full-${seats}-${w}.png` });
      if (geometry.scroll || geometry.clipped.length)
        throw Error(JSON.stringify(results.at(-1)));
    }
    await page.close();
  }
  console.log(JSON.stringify(results));
  writeFileSync(
    "artifacts/v3/full-tables.json",
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
