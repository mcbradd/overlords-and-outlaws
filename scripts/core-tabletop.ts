import { chromium, expect, type Page, type Locator } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { applyAction } from '../src/core-game/engine';
import { createGame } from '../tests/core-established-fixture';
import { CARDS } from "../src/core-game/content";
import { encodeSave } from "../src/core-game/storage";

export async function clickExposed(card: Locator) {
  await card.focus();
  await card.page().waitForTimeout(200);
  const point=await card.evaluate(el=>{
    const r=el.getBoundingClientRect();
    for(const y of [.2,.35,.5,.7]) for(const x of [.12,.2,.3,.5,.8]) {
      const px=r.left+r.width*x,py=r.top+r.height*y;
      if(el.contains(document.elementFromPoint(px,py))) return {x:px,y:py};
    }
    throw Error('Card has no exposed clickable area');
  });
  await card.page().mouse.click(point.x,point.y);
}

export async function playCard(
  page: Page,
  id: string,
  type: string,
  target?: string,
  drag = true,
  recruit = false,
) {
  const card = page.locator(`[data-do="select"][data-card="${id}"]`);
  await card.focus();
  if (["draft-pick","declare-pick","repair"].includes(type)) { await clickExposed(card); return; }
  if(type==='defend') {
    await clickExposed(card);await page.locator('[data-do="respond-defend"]').click();return;
  }
  await clickExposed(card);
  const action = page.locator(
    `[data-do="arm"][data-card="${id}"][data-type="${type}"][data-recruit="${recruit}"]`,
  );
  await action.click();
  if(["name-heir","recruit"].includes(type)) return;
  const destination = target
    ? page
        .locator(
          `[data-drop-card="${target}"],.valid-drop[data-table-card="${target}"]`,
        )
        .first()
    : page
        .locator(".valid-drop[data-table-card],.valid-drop[data-court-seat]")
        .first();
  await expect(destination).toBeVisible();
  if (drag) {
    // Let the physical placement/camera settle before choosing screen coordinates.
    await page.waitForTimeout(700);
    const from = await card.boundingBox(),
      to = await destination.boundingBox();
    assert.ok(from && to);
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
      steps: 12,
    });
    await page.mouse.up();
  } else await destination.click();
}
const base = process.env.BASE_URL ?? "http://localhost:5173";
const output = process.env.TABLETOP_OUTPUT ?? "artifacts/core/tabletop";
async function run() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      await page.goto(base);
      const fixture=createGame({seed:501,dynasties:['alba','plantagenet']});
      fixture.players[0].hand=['alba-2','alba-4'];fixture.players[1].hand=['alba-3','plantagenet-2'];
      const used=fixture.players.flatMap(p=>[...p.hand,...p.court]);fixture.deck=CARDS.filter(c=>fixture.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
      await page.locator('[data-do="setup"]').click();
      await page.locator('#save-file').setInputFiles({name:'actions.json',mimeType:'application/json',buffer:Buffer.from(encodeSave({game:fixture,mode:'local',names:['You','Player 2'],lesson:null,motion:false}))});
      await page.locator('[data-do="unlock"]').click();
      await expect(page.locator('[data-first-player="0"]')).toHaveCount(1);
      await expect(page.locator(".c-table-edge,.c-hand-heading")).toHaveCount(
        0,
      );
      assert.doesNotMatch(
        await page.locator(".c-game").innerText(),
        /concealed in hand|To act/i,
      );
      await page.screenshot({
        path: `${output}/${viewport.width}-opening.png`,
      });
      const board = page.locator("#core-table");
      const before = await page
        .locator('[data-table-card="alba-0"]')
        .boundingBox();
      const b = await board.boundingBox();
      assert.ok(b && before);
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(200);
      const zoomed = await page
        .locator('[data-table-card="alba-0"]')
        .boundingBox();
      assert.ok(
        zoomed && zoomed.width > before.width * 1.1,
        "ordinary wheel zooms",
      );
      await board.focus();
      await page.keyboard.press("Home");
      await page.waitForTimeout(200);
      const panBefore = await page
        .locator('[data-table-card="alba-0"]')
        .boundingBox();
      await page.mouse.move(b.x + 10, b.y + b.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x + 65, b.y + b.height / 2 + 20, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(200);
      const panAfter = await page
        .locator('[data-table-card="alba-0"]')
        .boundingBox();
      assert.ok(
        panBefore && panAfter && Math.abs(panAfter.x - panBefore.x) > 10,
        "empty-space drag pans the field",
      );
      await board.focus();
      await page.keyboard.press("Home");
      await page.locator('[data-do="select"][data-card="alba-2"]').hover();
      await expect(
        page.locator('[data-do="arm"][data-card="alba-2"]'),
      ).toBeVisible();
      await page.screenshot({ path: `${output}/${viewport.width}-hover.png` });
      await page.locator('[data-do="arm"][data-type="recruit"][data-card="alba-2"]').click();
      const held = await page.locator('[data-do="select"][data-card="alba-2"]').boundingBox();
      assert.ok(held);
      await page.mouse.move(held.x+held.width/2,held.y+held.height/2);
      await page.mouse.down();await page.mouse.move(5,5,{steps:8});await page.mouse.up();
      const unchanged = await page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.endsWith('oando-v9-inheritance'))![1]).game.revision);
      assert.equal(unchanged,0,'invalid drop changes nothing');
      await page.keyboard.press('Escape');
      await expect(page.locator('.valid-drop')).toHaveCount(0);
      await playCard(
        page,
        "alba-2",
        "recruit",
        undefined,
        viewport.width > 500,
      );
      await page.locator('[data-do="unlock"]').click();
      await expect(page.locator('[data-first-player="0"]')).toHaveCount(1);
      await expect(page.locator('[data-do="commit"]')).toHaveCount(0);
      await page.screenshot({
        path: `${output}/${viewport.width}-recruit.png`,
      });
      const state = createGame({
        seed: 501,
        dynasties: ["alba", "plantagenet"],
      });
      const once = applyAction(state, { type: "pass", seat: 0, revision: 0 });
      const next = applyAction(once, { type: "pass", seat: 1, revision: 1 });
      await page.goto(base);
      await page.locator('[data-do="setup"]').click();
      await page
        .locator("#save-file")
        .setInputFiles({
          name: "round.json",
          mimeType: "application/json",
          buffer: Buffer.from(
            encodeSave({
              game: next,
              mode: "local",
              names: ["You", "Rival"],
              motion: false,
              lesson: null,
            }),
          ),
        });
      await page.locator('[data-do="unlock"]').click();
      await expect(page.locator('[data-first-player="1"]')).toHaveCount(1);
      await page.screenshot({
        path: `${output}/${viewport.width}-round-two.png`,
      });
      await page.close();
    }
    console.log(
      "Tabletop: wheel zoom, contextual action, drag/tap target, first-player rotation, desktop and phone passed.",
    );
  } finally {
    await browser.close();
  }
}
if (process.argv[1]?.replaceAll("\\", "/").endsWith("/core-tabletop.ts"))
  await run();
