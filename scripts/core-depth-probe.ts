import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createGame, viewForSeat } from "../src/core-game/engine";
import assert from "node:assert/strict";
const output = process.env.DEPTH_OUTPUT ?? "artifacts/core/depth-after";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
try {
  await page.goto("http://localhost:5173");
  await expect(page.locator('[data-do="intro"]')).toBeVisible();
  const game = createGame({ seed: 501, dynasties: ["alba", "plantagenet"] });
  game.players[0].played.push(...game.players[0].hand);
  game.players[0].hand = [];
  const view = viewForSeat(game, 0);
  await page.evaluate(async (view) => {
    const modulePath = "/src/core-game/scene.ts";
    const { CoreTable } = await import(modulePath);
    document.querySelector("#app")!.innerHTML =
      '<div id="probe-host" style="position:fixed;inset:0"></div>';
    const t = new CoreTable(document.querySelector("#probe-host"), () => {});
    t.setReducedMotion(true);
    await t.update(view);
    (window as any).depthProbe = t;
  }, view);
  await expect(page.locator("#probe-host canvas")).toBeVisible();
  await page.evaluate((mode) => {
    const t = (window as any).depthProbe;
    if (mode === "near") {
      t.camera.near = 50;
      t.camera.updateProjectionMatrix();
    }
    if (mode === "shadows") t.renderer.shadowMap.enabled = false;
    if (mode === "spacing")
      t.content.children
        .filter((g: any) => g.isGroup && g.position.y === 35)
        .forEach((g: any, i: number) => (g.position.z = 5 + i * 3.6));
  }, process.env.DEPTH_PROBE ?? "baseline");
  for (const distance of [450, 1800, 4500]) {
    await page.evaluate((distance) => {
      const t = (window as any).depthProbe;
      t.wantedDistance = distance;
      t.wantedTarget.set(0, 35, 0);
    }, distance);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${output}/${distance}.png` });
  }
  await page.evaluate(() => {
    const t = (window as any).depthProbe;
    t.camera.fov = 15;
    t.camera.updateProjectionMatrix();
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${output}/far-detail.png` });
  const facts = await page.evaluate(() => {
    const t = (window as any).depthProbe;
    return {
      near: t.camera.near,
      far: t.camera.far,
      shadowType: t.renderer.shadowMap.type,
      groups: t.content.children
        .filter((x: any) => x.isGroup)
        .map((g: any) => ({
          position: g.position.toArray(),
          meshes: g.children.map((m: any) => {
            m.geometry.computeBoundingBox();
            return {
              z: m.position.z,
              box: m.geometry.boundingBox,
              cast: m.castShadow,
              receive: m.receiveShadow,
            };
          }),
        })),
    };
  });
  writeFileSync(`${output}/facts.json`, JSON.stringify(facts, null, 2));
  console.log(
    JSON.stringify({
      output,
      near: facts.near,
      far: facts.far,
      groups: facts.groups.length,
    }),
  );
  const deck = facts.groups
    .filter((g: any) => g.position[1] === 35)
    .sort((a: any, b: any) => a.position[2] - b.position[2]);
  for (let i = 1; i < deck.length; i++)
    assert.ok(
      deck[i].position[2] + deck[i].meshes[0].box.min.z >=
        deck[i - 1].position[2] + deck[i - 1].meshes[1].z,
      "Deck layers intersect: upper stock crosses the printed face below",
    );
  const played = facts.groups
    .filter(
      (g: any) =>
        g.position[2] >= 9 &&
        g.position[2] !== 10 &&
        g.meshes.length === 2 &&
        g.meshes[0].box.max.x === 47.5,
    )
    .sort((a: any, b: any) => a.position[2] - b.position[2]);
  assert.ok(played.length >= 2, "Played pile fixture is present");
  for (let i = 1; i < played.length; i++)
    assert.ok(
      played[i].position[2] + played[i].meshes[0].box.min.z >=
        played[i - 1].position[2] + played[i - 1].meshes[1].z,
      "Played stock crosses the face below",
    );
  const farViewDepthStep =
    (4500 ** 2 * (facts.far - facts.near)) /
    (facts.far * facts.near * (2 ** 24 - 1));
  assert.ok(
    farViewDepthStep < 0.05,
    "Depth resolution must distinguish the 0.1-unit face gap at the farthest zoom",
  );
} finally {
  await browser.close();
}
