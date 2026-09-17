import { chromium } from "@playwright/test";
import {
  chooseMove,
  aiResponse,
  createDuel,
  type Duel,
  type Move,
} from "../src/duel";
import { writeFileSync, mkdirSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }),
  errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://localhost:5173/?legacy=1");
  if (process.argv[2] === "normal") {
    const game = createDuel({ seed: 1306, house: "alba", seats: 4 });
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
            motion: true,
            coaching: true,
            seen: [],
            run: null,
            processed: [],
            daily: null,
          }),
        ),
      game,
    );
    await page.reload();
    await page.locator("[data-resume]").click();
  } else {
    await page.locator('[data-start="lesson"]').click();
    await page.locator(".modal .primary[data-close]").click();
  }
  await page.locator("[data-settings]").click();
  if (!process.argv.includes("--motion"))
    await page.locator('[data-toggle="motion"]').click();
  await page.locator("[data-close]").click();
  let actions = 0,
    waits = 0,
    lastSerial = -1;
  const screenshots = new Set<string>();
  let last: Duel | undefined;
  while (actions < 300 && waits < 3000) {
    const banner = page.locator("#battle-banner.show");
    if (await banner.isVisible()) await banner.click();
    const g = await page.evaluate(
      () => JSON.parse(localStorage.getItem("oando-v3")!).game as Duel,
    );
    last = g;
    // Limit inactivity, not the accumulated animation time of a whole match.
    if (g.serial !== lastSerial) {
      waits = 0;
      lastSerial = g.serial;
    }
    if (g.over) {
      await page.waitForTimeout(100);
      await page.screenshot({
        path: `artifacts/v3/${process.argv[2] ?? "lesson"}-result.png`,
      });
      break;
    }
    if (g.pending && g.players[g.pending.defender].human) {
      const r = aiResponse(g);
      const b = page.locator(`[data-response="${r}"]`);
      if ((await b.isVisible()) && (await b.isEnabled())) {
        await b.click();
        actions++;
      } else {
        await page.waitForTimeout(50);
        waits++;
      }
      continue;
    }
    if (g.turn !== 0 || g.pending) {
      await page.waitForTimeout(50);
      waits++;
      continue;
    }
    if (!(await page.locator("[data-end]").isEnabled())) {
      await page.waitForTimeout(40);
      waits++;
      continue;
    }
    const a = chooseMove(structuredClone(g), "adaptive");
    if ("uid" in a) {
      let source = page.locator(`.hand-cards [data-royal="${a.uid}"]`);
      if (a.type === "attack" || a.type === "recall")
        source = page.locator(`.arena [data-royal="${a.uid}"]`);
      else if (!(await source.count())) {
        await page.locator("[data-page]:not(:disabled)").click();
        source = page.locator(`.hand-cards [data-royal="${a.uid}"]`);
      }
      await source.click();
    }
    if (a.type === "attack") {
      const target =
        a.target!.startsWith("crown-") || a.target!.startsWith("estate-")
          ? page.locator(`[data-target="${a.target}"]`)
          : page.locator(`.arena [data-royal="${a.target}"]`);
      await target.first().click();
    }
    if (a.type === "end") await page.locator("[data-end]").click();
    else await page.locator(`[data-move='${JSON.stringify(a)}']`).click();
    actions++;
    if (!screenshots.has(a.type)) {
      screenshots.add(a.type);
      await page.waitForTimeout(70);
      await page.screenshot({ path: `artifacts/v3/play-${a.type}.png` });
    }
  }
  mkdirSync("artifacts/v3", { recursive: true });
  writeFileSync(
    `artifacts/v3/playthrough-${process.argv[2] ?? "lesson"}.json`,
    JSON.stringify(
      {
        actions,
        waits,
        errors,
        round: last?.round,
        over: last?.over,
        winner: last?.winner,
        reason: last?.reason,
        events: last?.events,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      actions,
      waits,
      errors,
      round: last?.round,
      over: last?.over,
      winner: last?.winner,
    }),
  );
  if (errors.length || !last?.over) process.exitCode = 1;
} catch (error) {
  await page.screenshot({ path: "artifacts/v3/failure.png" });
  writeFileSync(
    "artifacts/v3/failure.json",
    JSON.stringify(
      await page.evaluate(() => ({
        game: JSON.parse(localStorage.getItem("oando-v3")!).game,
        pieces: [...document.querySelectorAll(".arena [data-royal]")].map(
          (e) => {
            const r = e.getBoundingClientRect();
            return {
              id: (e as HTMLElement).dataset.royal,
              rect: r.toJSON(),
              at: document
                .elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2)
                .map((x) => x.className),
            };
          },
        ),
      })),
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
