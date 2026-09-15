import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts/physical", { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true });
for (const [width, height] of [
  [1600, 1000],
  [3840, 2160],
  [390, 844],
]) {
  const p = await b.newPage({ viewport: { width, height } });
  await p.goto("http://localhost:5173");
  await p.screenshot({ path: `artifacts/physical/final-home-${width}.png` });
  await p.locator('[data-start="lesson"]').click();
  await p.waitForTimeout(800);
  await p.mouse.move(0, 0);
  await p.screenshot({
    path: `artifacts/physical/final-board-${width}.png`,
    fullPage: true,
  });
  await p.locator('[data-camera-seat="0"]').click();
  await p.waitForTimeout(300);
  await p.screenshot({
    path: `artifacts/physical/final-close-${width}.png`,
    fullPage: true,
  });
  await p.close();
}
await b.close();
