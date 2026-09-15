import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createDuel } from "../src/duel";

const baseline = process.argv.includes("--baseline");
const dir = `artifacts/ux/${baseline ? "before" : "after"}`;
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results: unknown[] = [];
const failures: string[] = [];
try {
  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1024, 768],
    [844, 390],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.addInitScript("window.__name = (value) => value");
    const game = createDuel({ seed: 2026, house: "alba", seats: 3 });
    for (const p of game.players) p.court.push(...p.hand.splice(0, 3));
    await page.addInitScript(
      (game) =>
        localStorage.setItem(
          "oando-v3",
          JSON.stringify({
            version: 2,
            game,
            sound: false,
            motion: false,
            coaching: true,
            wins: 0,
            renown: 0,
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
    await page.locator(".arena [data-royal]").first().waitFor();
    await page.waitForTimeout(250);
    const geometry = await page.evaluate(() => {
      const rect = (s: string) => {
        const r = document.querySelector(s)!.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom };
      };
      return {
        arena: rect(".arena"),
        hand: rect(".hand-dock"),
        decision: rect(".decision-panel"),
        cards: [...document.querySelectorAll(".arena [data-royal]")].map(
          (e) => {
            const r = e.getBoundingClientRect();
            return { w: r.width, h: r.height };
          },
        ),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    const desktop = width >= 1024;
    if (desktop && geometry.arena.h < height * 0.45)
      failures.push(
        `${width}: board occupies under 45% of viewport (${Math.round(geometry.arena.h)}px)`,
      );
    if (desktop && geometry.cards.some((r) => r.w < 90 || r.h < 105))
      failures.push(`${width}: court cards too small to scan`);
    if (geometry.overflow)
      failures.push(`${width}: page overflows horizontally`);
    results.push({ width, height, ...geometry });
    await page.screenshot({ path: `${dir}/${width}.png`, fullPage: true });
    await page.close();
  }
  writeFileSync(
    `${dir}/measurements.json`,
    JSON.stringify({ results, failures }, null, 2),
  );
  console.log(JSON.stringify({ results, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
