import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

mkdirSync("artifacts/damage", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await page.goto("http://localhost:5173");
    await page.locator('[data-start="lesson"]').click();
    await expect(page.locator(".physical-card")).toHaveCount(4);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `artifacts/damage/opening-${width}.png` });
    // Reach the actual tutorial exchange, including David's defensive damage.
    for (let action = 0; action < 25; action++) {
      const focus = page.locator("[data-tutorial-focus]");
      await expect(focus).toHaveCount(1);
      const game = await page.evaluate(
        () => JSON.parse(localStorage.getItem("oando-v3")!).game,
      );
      if (
        game.lesson === 3 &&
        (await focus.getAttribute("data-next-lesson")) !== null
      )
        break;
      await focus.click();
      await page.waitForTimeout(200);
    }
    await page.locator('[data-camera-seat="0"]').click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `artifacts/damage/action-${width}.png` });
    const damaged = page.locator(
      '.physical-card[data-owner="0"] .damage-counter',
    );
    await expect(damaged).toHaveCount(2);
    for (const counter of await damaged.all()) {
      await expect(counter).toBeVisible();
      const contained = await counter.evaluate((el) => {
        const token = el.getBoundingClientRect(),
          face = el.closest("button")!.getBoundingClientRect();
        return (
          token.left >= face.left &&
          token.right <= face.right &&
          token.top >= face.top &&
          token.bottom <= face.bottom
        );
      });
      expect(
        contained,
        "Damage token stays on its card in either orientation",
      ).toBe(true);
    }
    console.log(`${width}: both tutorial damage tokens visible`);
    // Stress the same renderer with five damaged Royals in every court.
    await page.addInitScript(() => {
      const save = JSON.parse(localStorage.getItem("oando-v3")!);
      for (const player of save.game.players) {
        player.court.push(...player.deck.splice(0, 5 - player.court.length));
        player.court.forEach(
          (royal: { hp: number; ready: boolean }, i: number) => {
            royal.hp = 1;
            royal.ready = i % 2 === 0;
          },
        );
      }
      localStorage.setItem("oando-v3", JSON.stringify(save));
    });
    await page.reload();
    await page.locator("[data-resume]").click();
    await page.locator('[data-camera-seat="0"]').click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
    await expect(page.locator(".physical-card .damage-counter")).toHaveCount(
      15,
    );
    for (const token of await page
      .locator(".physical-card .damage-counter")
      .all())
      await expect(token).toBeVisible();
    await page.screenshot({ path: `artifacts/damage/dense-${width}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
