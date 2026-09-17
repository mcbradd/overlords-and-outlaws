import { chromium, expect } from "@playwright/test";
import {
  createLesson,
  lessonComplete,
  lessonMove,
  lessonOpponent,
  nextLesson,
} from "../src/lessons";
import { act, respond, createDuel } from "../src/duel";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts/opponent-preview", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const width of [1440, 390, 3840]) {
    const g = createLesson();
    while (g.lesson < 3) {
      if (lessonComplete(g)) nextLesson(g);
      else if (g.pending) respond(g, "accept");
      else act(g, (g.turn === 0 ? lessonMove(g) : lessonOpponent(g))!);
    }
    const page = await browser.newPage({
      viewport: { width, height: width === 3840 ? 2160 : 900 },
      reducedMotion: "reduce",
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
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
    await page.goto("http://localhost:5174/?legacy=1");
    await page.locator("[data-resume]").click();
    await expect(page.locator(".physical-card")).toHaveCount(4);
    await page.screenshot({
      path: `artifacts/opponent-preview/opening-${width}.png`,
    });
    await page.locator("[data-tutorial-focus]").click();
    await expect(page.locator(".opponent-action-preview")).toBeVisible();
    await page.locator("[data-preview-pause]").click();
    await expect(page.locator('[data-action-endpoint="source"]')).toHaveCount(
      1,
    );
    await expect(page.locator('[data-action-endpoint="target"]')).toHaveCount(
      1,
    );
    await expect(page.locator("#target-arrow > path")).toHaveCount(1);
    const state = await page.evaluate(() => localStorage.getItem("oando-v3"));
    await page.waitForTimeout(2700);
    expect(await page.evaluate(() => localStorage.getItem("oando-v3"))).toBe(
      state,
    );
    await page.screenshot({
      path: `artifacts/opponent-preview/attack-${width}.png`,
    });
    await page.locator("[data-preview-continue]").click();
    await expect(page.locator('[data-response="brace"]')).toBeVisible();
    await expect(page.locator("#target-arrow > path")).toHaveCount(1);
    await page.screenshot({
      path: `artifacts/opponent-preview/response-${width}.png`,
    });
    await page.locator('[data-response="brace"]').click();
    await expect(page.locator("[data-next-lesson]")).toBeVisible();
    await expect(page.locator("[data-action-endpoint]")).toHaveCount(0);
    expect(errors).toEqual([]);
    await page.close();
  }
  const game = createDuel({ seed: 811, house: "alba", seats: 4 });
  for (const p of game.players) p.court.push(...p.hand.splice(0, 4));
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
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
  await page.goto("http://localhost:5174/?legacy=1");
  await page.locator("[data-resume]").click();
  await expect(page.locator(".physical-card")).toHaveCount(20);
  await page.waitForTimeout(200);
  await page.screenshot({ path: "artifacts/opponent-preview/dense.png" });
  await page.locator("[data-end]").click();
  await expect(page.locator(".opponent-action-preview")).toBeVisible({
    timeout: 15000,
  });
  await page.locator("[data-preview-pause]").click();
  await expect(page.locator("[data-action-endpoint]")).toHaveCount(2);
  await page.screenshot({
    path: "artifacts/opponent-preview/dense-action.png",
  });
  console.log(
    "Opponent preview: pause preserves state, source/target arrow, incoming response, cleanup, desktop + compact passed.",
  );
} finally {
  await browser.close();
}
