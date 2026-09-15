import { chromium, expect } from "@playwright/test";
import {
  createLesson,
  lessonComplete,
  lessonMove,
  lessonOpponent,
  nextLesson,
} from "../src/lessons";
import { act, respond } from "../src/duel";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts/tutorial", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const stage of [1, 2, 5]) {
    const g = createLesson();
    while (g.lesson < stage) {
      if (lessonComplete(g)) nextLesson(g);
      else if (g.pending)
        respond(g, g.pending.defender === 0 ? "brace" : "accept");
      else act(g, (g.turn === 0 ? lessonMove(g) : lessonOpponent(g))!);
    }
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
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
      g,
    );
    await page.goto("http://localhost:5173");
    await page.locator("[data-resume]").click();
    const move = lessonMove(g)!;
    if (!("uid" in move)) throw Error("Expected card action");
    const uid = move.uid;
    const source = page.locator(
      `${stage === 2 ? ".arena" : ".hand-cards"} [data-royal="${uid}"]`,
    );
    const start = async () => {
      await source.hover();
      const r = (await source.boundingBox())!;
      await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
      await page.mouse.down();
      await page.mouse.move(850, 400, { steps: 10 });
    };
    if (stage === 1) {
      await start();
      await page.mouse.move(600, 30, { steps: 5 });
      await page.mouse.up();
      expect(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("oando-v3")!).game.players[0].court
              .length,
        ),
      ).toBe(1);
      await start();
      await expect(page.locator(".drop-slot")).toBeVisible();
      const slot = (await page.locator(".drop-slot").boundingBox())!;
      await page.mouse.move(slot.x + slot.width / 2, slot.y + slot.height / 2, {
        steps: 10,
      });
      await expect(page.locator(".drop-slot.active")).toHaveCount(1);
      await page.screenshot({ path: "artifacts/tutorial/drag-placement.png" });
      await page.mouse.up();
      await expect(page.locator("[data-next-lesson]")).toBeVisible();
      await expect(page.locator(".drop-slot")).toHaveCount(0);
      await expect(page.locator(`.arena [data-royal="${uid}"]`)).toHaveCount(1);
    } else {
      await start();
      const target =
        stage === 2 && move.type === "attack"
          ? move.target
          : g.players[0].court.find(
              (r) =>
                r.card.includes("alba") &&
                r.card !== g.players[0].court[0].card &&
                r.card !== g.players[0].court[1].card,
            )!.uid;
      const el = page.locator(`.arena [data-royal="${target}"]`);
      const rect = (await el.boundingBox())!;
      await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2, {
        steps: 10,
      });
      await expect(el).toHaveAttribute("data-drop-current", "true");
      await page.screenshot({
        path: `artifacts/tutorial/drag-${stage === 2 ? "attack" : "marriage"}.png`,
      });
      await page.mouse.up();
      if (stage === 2) {
        await expect(page.locator("#lesson-coach [data-move]")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => JSON.parse(localStorage.getItem("oando-v3")!).game.orders,
          ),
        ).toBe(1);
      } else await expect(page.locator("[data-next-lesson]")).toBeVisible();
    }
    await page.close();
  }
  console.log(
    "Invalid drops cancel; legal placement, attack preview, and marriage targets pass.",
  );
} finally {
  await browser.close();
}
