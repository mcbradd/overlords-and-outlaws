import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts/components", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [3840, 2160],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await page.goto("http://localhost:5175/?legacy=1");
    await page.locator('[data-start="lesson"]').click();
    await expect(page.locator(".crown-card")).toHaveCount(3);
    await page.screenshot({
      path: `artifacts/components/opening-${width}.png`,
    });
    await page.locator("[data-tutorial-focus]").click();
    await page.locator("[data-tutorial-focus]").click();
    await page.waitForTimeout(350);
    await page.screenshot({ path: `artifacts/components/action-${width}.png` });
    await page.addInitScript(() => {
      const save = JSON.parse(localStorage.getItem("oando-v3")!);
      for (const p of save.game.players) {
        p.estates = 3;
        p.shield = 5;
        p.stability = 7;
        p.court.push(...p.deck.splice(0, 5 - p.court.length));
        p.court.forEach((r: any, i: number) => {
          r.ready = i % 2 === 0;
          r.hp = 1;
        });
      }
      save.game.players[0].claim = 0;
      save.game.players[0].challengers = [];
      localStorage.setItem("oando-v3", JSON.stringify(save));
    });
    await page.reload();
    await page.locator("[data-resume]").click();
    await page.locator('[data-camera-seat="all"]').click();
    await expect(page.locator(".estate-card")).toHaveCount(3);
    await expect(page.locator(".estate-card .number-token").first()).toHaveText(
      "3",
    );
    await page.screenshot({ path: `artifacts/components/dense-${width}.png` });
    await page.locator('[data-camera-seat="0"]').click();
    await page.screenshot({ path: `artifacts/components/court-${width}.png` });
    if (width === 390) {
      await page.locator(".arena").evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      await page.screenshot({ path: "artifacts/components/estate-phone.png" });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
