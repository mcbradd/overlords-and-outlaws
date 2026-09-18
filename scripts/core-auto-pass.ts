import { chromium, expect, type Page } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { applyAction } from '../src/core-game/engine';
import { createGame } from '../tests/core-established-fixture';
import { CARDS } from "../src/core-game/content";
import { encodeSave } from "../src/core-game/storage";

const base = process.env.BASE_URL ?? "http://localhost:5173";
const output = process.env.AUTO_PASS_OUTPUT ?? "artifacts/core/auto-pass";
mkdirSync(output, { recursive: true });
const s = createGame({ seed: 501, dynasties: ["alba", "plantagenet"] });
s.players[0].played.push(...s.players[0].hand);
s.players[0].hand = [];
s.players[0].played.push(...s.players[0].court); s.players[0].court=[]; s.players[0].ruler=null;
async function load(page: Page, game = s, motion = true) {
  await page.goto(base);
  await page.locator('[data-do="setup"]').click();
  await page.locator("#save-file").setInputFiles({
    name: "empty.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      encodeSave({
        game,
        mode: "local",
        names: ["You", "Rival"],
        lesson: null,
        motion,
      }),
    ),
  });
  await page.locator('[data-do="unlock"]').click();
  await expect(page.locator(".c-game")).toBeVisible();
}
const revision = (page: Page) =>
  page.evaluate(
    () =>
      JSON.parse(
        Object.entries(localStorage).find(([k]) =>
          k.endsWith("oando-v9-inheritance"),
        )![1],
      ).game.revision,
  );
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    await load(page);
    const pass = page.locator(".c-auto-pass.is-draining");
    await expect(pass).toBeVisible();
    await page.waitForTimeout(700);
    assert.equal(await revision(page), 0, "does not pass early");
    const fill = await pass.evaluate(
      (e) => getComputedStyle(e, "::before").transform,
    );
    assert.notEqual(fill, "none");
    const scale = Number(fill.match(/matrix\(([^,]+)/)?.[1]);
    assert.ok(scale > 0 && scale < 0.9, `draining fill ${fill}`);
    await page.screenshot({ path: `${output}/${viewport.width}-draining.png` });
    await expect(page.locator('[data-do="unlock"]')).toBeVisible({
      timeout: 3500,
    });
    assert.equal(await revision(page), 1, "exactly one automatic pass");
    await page.waitForTimeout(2100);
    assert.equal(await revision(page), 1, "private handoff does not auto-play");
    await load(page);
    await page.locator(".c-auto-pass").click();
    assert.equal(await revision(page), 1, "manual pass is immediate");
    await page.waitForTimeout(2200);
    assert.equal(await revision(page), 1, "manual pass cancels timer");
    await load(page);
    await page.locator('[data-do="menu"]').click();
    await page.waitForTimeout(2200);
    assert.equal(await revision(page), 0, "menu pauses automatic play");
    await page.locator('[data-do="close"]').click();
    await expect(page.locator(".c-auto-pass.is-draining")).toBeVisible();
    await load(
      page,
      createGame({ seed: 501, dynasties: ["alba", "plantagenet"] }),
    );
    await expect(page.locator(".c-auto-pass")).toHaveCount(0);
    await page.waitForTimeout(2200);
    assert.equal(await revision(page), 0, "held cards never auto-pass");
    await load(page, s, false);
    await expect(page.locator(".c-auto-pass.reduced-countdown")).toBeVisible();
    await expect(page.locator('[data-do="unlock"]')).toBeVisible({
      timeout: 3500,
    });
    assert.equal(await revision(page), 1, "reduced motion still auto-passes");
    const offer = createGame({ seed: 501, dynasties: ["alba", "plantagenet"] });
    offer.players[0].hand = [];
    offer.players[0].played = ["alba-2"];
    offer.players[1].hand = ["plantagenet-8"];
    offer.active = 1;
    offer.deck = CARDS.filter(
      (c) =>
        offer.dynasties.includes(c.dynasty) &&
        !offer.players.some((p) =>
          [...p.hand, ...p.court, ...p.played].includes(c.id),
        ),
    ).map((c) => c.id);
    const pending = applyAction(offer, {
      type: "trade",
      seat: 1,
      revision: 0,
      card: "plantagenet-8",
      other: 0,
      request: "alba-2",
    });
    await load(page, pending);
    await expect(page.locator(".c-auto-pass")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Accept trade", exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(2200);
    assert.equal(
      await revision(page),
      1,
      "empty recipient retains trade decision",
    );
    const withCourt=structuredClone(s);
    withCourt.players[0].played=withCourt.players[0].played.filter(id=>id!=='alba-0');
    withCourt.players[0].court=['alba-0'];withCourt.players[0].ruler='alba-0';
    await load(page,withCourt);
    await expect(page.locator('.c-auto-pass')).toHaveCount(0);
    await page.waitForTimeout(2200);assert.equal(await revision(page),0,'Court withdrawal prevents forced pass');
    await page.close();
  }
  console.log(
    "Empty-hand pass: draining fill, two-second deadline, manual click, handoff and modal guards passed.",
  );
} finally {
  await browser.close();
}
