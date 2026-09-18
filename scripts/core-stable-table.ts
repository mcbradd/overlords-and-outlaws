import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.addInitScript("window.__name = (fn) => fn");
    await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
    const result = await page.evaluate(async () => {
      const modulePath = "/src/core-game/scene.ts";
      const { CoreTable } = (await import(
        modulePath
      )) as typeof import("../src/core-game/scene");
      document.body.innerHTML =
        '<div id="probe" style="position:fixed;inset:0"></div>';
      const host = document.querySelector<HTMLElement>("#probe")!;
      const table = new CoreTable(host, () => {});
      table.setReducedMotion(true);
      const view = {
        viewer:0,
        players: [
          {
            dynasty: "alba",
            court: ["alba-0", "alba-2", "alba-4"],
            played: ["alba-5", "alba-6", "alba-7"],
            ruler: "alba-0",
          },
          {
            dynasty: "plantagenet",
            court: ["plantagenet-0"],
            played: [],
            ruler: "plantagenet-0",
          },
        ],
        active: 0,
        round: 1,
      };
      const frame = () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
      const snapshot = (): Record<
        string,
        { x: string | undefined; y: string | undefined; width: number }
      > =>
        Object.fromEntries(
          [...host.querySelectorAll<HTMLElement>("[data-table-card]")].map(
            (el) => {
              const r = el.getBoundingClientRect();
              return [
                el.dataset.tableCard,
                { x: el.dataset.tableX, y: el.dataset.tableY, width: r.width },
              ];
            },
          ),
        );
      await table.update(view);
      await frame();
      const before = snapshot();
      view.players[0].court.splice(1, 1);
      view.players[0].played.splice(1, 1);
      await table.update(view);
      await frame();
      const removed = snapshot();
      view.players[0].court.push("alba-8");
      view.players[0].played.push("alba-9");
      await table.update(view);
      await frame();
      const added = snapshot();
      table.focus(0);
      await frame();
      const focused = snapshot();
      view.active = 1;
      view.viewer = 1;
      await table.update(view);
      await frame();
      const afterFocus = snapshot();
      table.dispose();
      return { before, removed, added, focused, afterFocus };
    });
    for (const state of [result.removed, result.added])
      for (const [id, p] of Object.entries(result.before))
        if (state[id]) {
          assert.equal(state[id].x, p.x, id + " x");
          assert.equal(state[id].y, p.y, id + " y");
          assert.ok(Math.abs(state[id].width - p.width) < 0.1, id + " scale");
        }
    for (const [id, p] of Object.entries(result.focused)) {
      assert.equal(result.afterFocus[id].x,p.x);assert.equal(result.afterFocus[id].y,p.y);
      assert.ok(
        Math.abs(result.afterFocus[id].width - p.width) < 0.1,
        id + " manual focus retained",
      );
    }
    assert.ok(
      Number(result.added["alba-5"].x) < Number(result.added["alba-0"].x),
      "Played is left of Court",
    );
    await page.close();
  }
  console.log(
    "Court and Played removals retain physical slots; additions preserve existing positions and scale; manual focus survives turns. Desktop and phone passed.",
  );
} finally {
  await browser.close();
}
