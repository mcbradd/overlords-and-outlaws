import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts/showcase", { recursive: true });
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
    await page.goto(process.env.BASE_URL ?? "http://localhost:5176");
    await page.locator('[data-start="lesson"]').click();
    await expect(page.locator(".crown-card")).toHaveCount(3);
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("canvas.card-texture")].every(
          (c) => (c as HTMLElement).dataset.paintState === "ready",
        ) &&
        [...document.querySelectorAll(".physical-card")].every(
          (c) => (c as HTMLElement).dataset.textureReady === "true",
        ),
    );
    await page.screenshot({
      path: `artifacts/showcase/opening-${width}.png`,
    });
    if (width === 390) {
      await page
        .locator(".hand-cards")
        .evaluate((el) => el.scrollIntoView({ block: "end" }));
      const visible = await page
        .locator(".hand-cards > .royal-card")
        .evaluateAll((cards) =>
          cards.every((card) => {
            const r = card.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= innerHeight;
          }),
        );
      expect(visible).toBe(true);
      await page.screenshot({ path: "artifacts/showcase/hand-phone.png" });
    }
    await page.locator(".hand-cards > .royal-card").first().hover();
    if (width > 760) {
      await page.locator(".hand-cards > .royal-card").first().click();
      await page.locator(".detail-inspect").click();
      await expect(page.locator(".inspect-layout .royal-card")).toBeVisible();
    } else {
      await expect(page.locator("#hover-inspector .royal-card")).toBeVisible();
    }
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("canvas.card-texture")].every(
          (c) => (c as HTMLElement).dataset.paintState === "ready",
        ) &&
        [...document.querySelectorAll(".physical-card")].every(
          (c) => (c as HTMLElement).dataset.textureReady === "true",
        ),
    );
    await page.screenshot({
      path: `artifacts/showcase/inspection-${width}.png`,
    });
    if (width > 760) {
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
    }
    await page.mouse.move(0, 0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator("[data-tutorial-focus]").click();
    await page.locator("[data-tutorial-focus]").click();
    await page.waitForTimeout(350);
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("canvas.card-texture")].every(
          (c) => (c as HTMLElement).dataset.paintState === "ready",
        ) &&
        [...document.querySelectorAll(".physical-card")].every(
          (c) => (c as HTMLElement).dataset.textureReady === "true",
        ),
    );
    await page.screenshot({ path: `artifacts/showcase/action-${width}.png` });
    await page.addInitScript(() => {
      const save = JSON.parse(localStorage.getItem("oando-v3")!);
      for (const p of save.game.players) {
        p.estates = 8;
        p.gold = 75;
        p.shield = 14;
        p.stability = 7;
        p.court.push(...p.deck.splice(0, 12 - p.court.length));
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
      "8",
    );
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("canvas.card-texture")].every(
          (c) => (c as HTMLElement).dataset.paintState === "ready",
        ) &&
        [...document.querySelectorAll(".physical-card")].every(
          (c) => (c as HTMLElement).dataset.textureReady === "true",
        ),
    );
    await page.screenshot({ path: `artifacts/showcase/dense-${width}.png` });
    await page.locator('[data-camera-seat="0"]').click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("canvas.card-texture")].every(
          (c) => (c as HTMLElement).dataset.paintState === "ready",
        ) &&
        [...document.querySelectorAll(".physical-card")].every(
          (c) => (c as HTMLElement).dataset.textureReady === "true",
        ),
    );
    await page.screenshot({ path: `artifacts/showcase/court-${width}.png` });
    if (width === 390) {
      await page.locator(".arena").evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll("canvas.card-texture")].every(
            (c) => (c as HTMLElement).dataset.paintState === "ready",
          ) &&
          [...document.querySelectorAll(".physical-card")].every(
            (c) => (c as HTMLElement).dataset.textureReady === "true",
          ),
      );
      await page.screenshot({ path: "artifacts/showcase/estate-phone.png" });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
