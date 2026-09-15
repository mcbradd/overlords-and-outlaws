import { chromium, expect } from "@playwright/test";
import { createDuel } from "../src/duel";
import { mkdirSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
mkdirSync("artifacts/v3", { recursive: true });
try {
  const p = await browser.newPage({ viewport: { width: 3840, height: 2160 } }),
    errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const game = createDuel({ seed: 811, house: "alba", seats: 4 });
  game.players[0].hand.push(...game.players[0].deck.splice(0, 2));
  await p.addInitScript(
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
  await p.goto("http://localhost:5173");
  await p.locator("[data-resume]").click();
  await expect(p.locator(".hand-card")).toHaveCount(7);
  await p.locator(".hand-card").last().hover();
  await p.waitForTimeout(500);
  const fit = await p.locator("#card-detail").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return (
      r.left >= 0 &&
      r.right <= innerWidth &&
      r.top >= 0 &&
      r.bottom <= innerHeight
    );
  });
  expect(fit).toBe(true);
  await p.screenshot({ path: "artifacts/v3/4k-seven-card-inspection.png" });
  await p.mouse.move(10, 160);
  await p.setViewportSize({ width: 1440, height: 900 });
  const source = p.locator(".hand-card").first(),
    a = (await source.boundingBox())!,
    arena = (await p.locator("#arena").boundingBox())!;
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(
    arena.x + arena.width * 0.9,
    arena.y + arena.height * 0.6,
    { steps: 12 },
  );
  await p.mouse.up();
  await expect
    .poll(() =>
      p.evaluate(
        () =>
          JSON.parse(localStorage.getItem("oando-v3")!).game.players[0].court
            .length,
      ),
    )
    .toBe(2);
  await expect
    .poll(() =>
      p.evaluate(
        () => JSON.parse(localStorage.getItem("oando-v3")!).game.orders,
      ),
    )
    .toBe(1);
  await p.locator(".hand-card").first().dispatchEvent("pointerdown", {
    pointerType: "touch",
    clientX: 300,
    clientY: 700,
  });
  await p.waitForTimeout(500);
  await expect(p.locator("#card-detail")).toBeVisible();
  await p.locator(".hand-card").first().dispatchEvent("pointerup", {
    pointerType: "touch",
    clientX: 300,
    clientY: 700,
  });
  await expect(p.locator("#card-detail")).toBeEmpty();
  await p.waitForTimeout(1100);
  await p.locator('[data-target="crown-0"]').click();
  await expect(p.locator(".modal")).toContainText("separate from every Royal");
  await p.locator(".modal-shade").click({ position: { x: 5, y: 5 } });
  await expect(p.locator(".modal")).toHaveCount(0);
  await p.screenshot({ path: "artifacts/v3/drag-deployed.png" });
  expect(errors).toEqual([]);
  console.log(
    JSON.stringify({
      sevenCardHand: true,
      inspectorWithin4kViewport: true,
      dragDeployment: true,
      touchHold: true,
      outsideDismissal: true,
      errors,
    }),
  );
} finally {
  await browser.close();
}
