import { playCard } from "./core-tabletop";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import {
  createGame,
  applyAction,
  assertInvariants,
  type CoreState,
} from "../src/core-game/engine";
import { CARDS, BY_ID } from "../src/core-game/content";
import { encodeSave } from "../src/core-game/storage";
import { clickReachable } from "./core-browser";

const base = process.env.BASE_URL ?? "http://localhost:5173";
const output = process.env.FEEDBACK_OUTPUT ?? "artifacts/core/player-feedback";
mkdirSync(output, { recursive: true });
const s = createGame({ seed: 501, dynasties: ["alba", "plantagenet"] });
s.players[0].hand = ["alba-6", "plantagenet-4"];
s.players[1].hand = ["alba-5"];
s.active = 1;
s.deck = CARDS.filter(
  (c) =>
    s.dynasties.includes(c.dynasty) &&
    !s.players.some((p) => [...p.hand, ...p.court].includes(c.id)),
).map((c) => c.id);
assertInvariants(s);
const pending = applyAction(s, {
  type: "recall",
  seat: 1,
  revision: 0,
  card: "alba-5",
  target: "alba-0",
});
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 360, height: 780 },
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    async function load(game: CoreState) {
      await page.goto(base);
      await clickReachable(page.locator('[data-do="setup"]'));
      await page.locator("#save-file").setInputFiles({
        name: "response.json",
        mimeType: "application/json",
        buffer: Buffer.from(
          encodeSave({
            game,
            mode: "local",
            names: ["You", "Rival"],
            lesson: null,
            motion: false,
          }),
        ),
      });
      await clickReachable(page.locator('[data-do="unlock"]'));
      await expect(page.locator(".c-card-pick").first()).toBeVisible();
    }
    const capture = async (name: string) =>
      page.screenshot({ path: `${output}/${viewport.width}-${name}.png` });
    await load(pending);
    const invalid = page.locator(
      '[data-do="select"][data-card="plantagenet-4"]',
    );
    const valid = page.locator('[data-do="select"][data-card="alba-6"]');
    await expect(invalid).toBeDisabled();
    await expect(valid).toBeEnabled();
    await capture("response");
    const style = await invalid.evaluate((e) => ({
      opacity: Number(getComputedStyle(e).opacity),
      filter: getComputedStyle(e).filter,
    }));
    const normal = await valid.evaluate((e) =>
      Number(getComputedStyle(e).opacity),
    );
    console.log({ style, normal });
    assert.ok(style.opacity < normal, "unusable card must visibly dim");
    assert.match(style.filter, /grayscale\(/);
    await invalid.locator("..").hover();
    await clickReachable(
      page.locator('[data-do="inspect"][data-card="plantagenet-4"]'),
    );
    await expect(page.locator("dialog")).toBeVisible();
    await clickReachable(page.locator('[data-do="close"]'));
    await playCard(page, "alba-6", "defend", undefined, viewport.width > 600);
    await expect(page.locator('[data-do="commit"]')).toHaveCount(0);
    await clickReachable(page.locator('[data-do="unlock"]'));
    await expect(invalid).toBeEnabled();
    assert.equal(
      await invalid.evaluate((e) => Number(getComputedStyle(e).opacity)),
      1,
    );
    await capture("usable-again");
    console.log("DIM-01 passed: illegal answer dimmed; inspection available.");

    const marriage = createGame({
      seed: 501,
      dynasties: ["alba", "plantagenet"],
    });
    marriage.players[0].court.push("alba-1");
    marriage.players[0].hand = ["plantagenet-13"];
    marriage.players[1].hand = ["alba-4"];
    marriage.deck = CARDS.filter(
      (c) =>
        marriage.dynasties.includes(c.dynasty) &&
        !marriage.players.some((p) =>
          [...p.hand, ...p.court, ...p.played].includes(c.id),
        ),
    ).map((c) => c.id);
    assertInvariants(marriage);
    await load(marriage);
    await page
      .locator('[data-do="select"][data-card="plantagenet-13"]')
      .locator("..")
      .hover();
    await clickReachable(
      page.locator('[data-do="inspect"][data-card="plantagenet-13"]'),
    );
    await expect(page.locator(".c-marriage-hint")).toContainText(
      `Can marry ${BY_ID["alba-1"].name}`,
    );
    await capture("marriage-inspection");
    await clickReachable(page.locator('[data-do="close"]'));
    await expect(
      page.locator(
        '[data-do="arm"][data-card="plantagenet-13"][data-type="recruit"]',
      ),
    ).toHaveCount(0);
    await playCard(
      page,
      "plantagenet-13",
      "marry-heir",
      "alba-1",
      viewport.width > 600,
    );
    await expect(page.locator('[data-do="commit"]')).toHaveCount(0);
    await clickReachable(page.locator('[data-do="unlock"]'));
    await expect(
      page.locator('[data-table-card="plantagenet-13"]'),
    ).toBeAttached();
    await capture("marriage-complete");
    const stored = await page.evaluate(
      () =>
        Object.entries(localStorage).find(([k]) =>
          k.endsWith("oando-v5-played-trades"),
        )?.[1],
    );
    const result = JSON.parse(stored!);
    assert.deepEqual(result.game.marriages, [
      { seat: 0, queen: "alba-1", spouse: "plantagenet-13" },
    ]);
    console.log(
      `MARRIAGE-01 passed at ${viewport.width}: ordinary UI commits foreign spouse and link.`,
    );
    marriage.players[0].court = ["alba-0"];
    marriage.deck.push("alba-1");
    assertInvariants(marriage);
    await load(marriage);
    await page
      .locator('[data-do="select"][data-card="plantagenet-13"]')
      .locator("..")
      .hover();
    await clickReachable(
      page.locator('[data-do="inspect"][data-card="plantagenet-13"]'),
    );
    await expect(page.locator(".c-marriage-hint")).toContainText(
      "First recruit an unpaired Queen",
    );
    await capture("marriage-unavailable");

    const trade = createGame({ seed: 501, dynasties: ["alba", "plantagenet"] });
    trade.players[0].hand = ["alba-8"];
    trade.players[1].hand = ["plantagenet-3"];
    trade.players[1].played = ["alba-2"];
    trade.deck = CARDS.filter(
      (c) =>
        trade.dynasties.includes(c.dynasty) &&
        !trade.players.some((p) =>
          [...p.hand, ...p.court, ...p.played].includes(c.id),
        ),
    ).map((c) => c.id);
    assertInvariants(trade);
    await load(trade);
    await page.locator('[data-do="select"][data-card="alba-8"]').focus();
    await page
      .locator('[data-do="arm"][data-type="trade"][data-recruit="false"]')
      .click();
    await expect(page.locator("[data-drop-card]")).toHaveCount(1);
    await expect(page.locator('[data-drop-card="alba-2"]')).toBeVisible();
    await playCard(page, "alba-8", "trade", "alba-2", viewport.width > 600);
    await capture("trade-selected-handoff");
    await expect(page.locator('[data-do="commit"]')).toHaveCount(0);
    await clickReachable(page.locator('[data-do="unlock"]'));
    await capture("trade-response");
    await clickReachable(
      page.locator('[data-do="generic"]').filter({ hasText: "Accept trade" }),
    );
    await expect(page.locator('[data-do="commit"]')).toHaveCount(0);
    await clickReachable(page.locator('[data-do="unlock"]'));
    await capture("trade-complete");
    const exchanged = await page.evaluate(
      () =>
        JSON.parse(
          Object.entries(localStorage).find(([k]) =>
            k.endsWith("oando-v5-played-trades"),
          )![1],
        ).game,
    );
    assert.deepEqual(exchanged.players[0].played, ["alba-2"]);
    assert.deepEqual(exchanged.players[1].played, ["alba-8"]);
    console.log(
      `TRADE-01/02 passed at ${viewport.width}: only Played targets, real UI acceptance.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
