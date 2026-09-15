import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const failures: string[] = [];
await p.goto("http://localhost:5173");
const health = await p.evaluate(async () => {
  const { createLesson } = await import(
    /* @vite-ignore */ String("/src/lessons.ts")
  );
  const { cardFace } = await import(/* @vite-ignore */ String("/src/cards.ts"));
  const g = createLesson(),
    r = g.players[0].court[0];
  r.hp = 3;
  const el = document.createElement("div");
  el.innerHTML = cardFace(r, { zone: "court", owner: g.players[0] });
  return {
    actual: r.hp,
    visible: Number(el.querySelector(".resolve-stat b")?.textContent),
  };
});
if (health.actual !== health.visible)
  failures.push(
    `Health mismatch: engine ${health.actual}, battlefield ${health.visible}`,
  );
await p.locator('[data-start="lesson"]').click();
await p.locator(".hand-card[data-tutorial-focus]").click();
await p.locator('#lesson-coach [data-move*=\'"type":"deploy"\']').click();
await p.locator("[data-next-lesson]").waitFor();
const before = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("oando-v3")!).game.players[0].court.map(
    (r: any) => r.uid,
  ),
);
await p.locator("[data-next-lesson]").click();
const after = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("oando-v3")!).game.players[0].court.map(
    (r: any) => r.uid,
  ),
);
if (!before.every((uid: string) => after.includes(uid)))
  failures.push("Tutorial transition discards the Royals just played");
if (
  (await p.locator("[data-lesson]").count()) > 1 ||
  (await p.locator(".lesson-read").count())
)
  failures.push("Duplicate read-lesson surface remains");
if (!(await p.locator("[data-tutorial-focus]").count()))
  failures.push("No exact next-action tutorial highlight");
console.log(JSON.stringify({ health, failures }, null, 2));
await b.close();
if (failures.length) process.exitCode = 1;
