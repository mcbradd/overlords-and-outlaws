import { chromium, expect, type Page } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { assertInvariants } from '../src/core-game/engine';
import { createGame } from '../tests/core-established-fixture';
import { CARDS, DYNASTIES } from "../src/core-game/content";
import { encodeSave } from "../src/core-game/storage";
import { playCard } from "./core-tabletop";
const base = process.env.BASE_URL ?? "http://localhost:5173";
const output =
  process.env.PLAYER_COUNTS_OUTPUT ?? "artifacts/core/player-counts";
mkdirSync(output, { recursive: true });
const report = {
  sourceSha: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  base,
  requiredPlayerCounts: [2, 3, 4],
  visualInspectionRequired: true,
  rows: [] as {
    players: number;
    width: number;
    state: string;
    path: string;
    inspected: boolean;
  }[],
  passed: false,
};
const browser = await chromium.launch({ channel: "chrome" });
async function capture(
  page: Page,
  players: number,
  width: number,
  state: string,
) {
  const path = `${output}/${players}p-${width}-${state}.png`;
  await page.screenshot({ path });
  report.rows.push({ players, width, state, path, inspected: false });
}
try {
  for (const players of [2, 3, 4])
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      const game = createGame({
        seed: 501,
        dynasties: DYNASTIES.slice(0, players),
      });
      game.players[0].hand = ["alba-2", "alba-4"];
      game.players.slice(1).forEach((p) => {
        p.hand = CARDS.filter((c) => c.dynasty === p.dynasty && !c.founder)
          .slice(0, 2)
          .map((c) => c.id);
      });
      game.deck = CARDS.filter(
        (c) =>
          game.dynasties.includes(c.dynasty) &&
          !game.players.some((p) => [...p.hand, ...p.court].includes(c.id)),
      ).map((c) => c.id);
      assertInvariants(game);
      async function load(state = game) {
        await page.goto(base);
        await page.locator('[data-do="setup"]').click();
        await page
          .locator("#save-file")
          .setInputFiles({
            name: "table.json",
            mimeType: "application/json",
            buffer: Buffer.from(
              encodeSave({
                game: state,
                mode: "local",
                names: state.players.map((p) =>
                  p.seat === 0 ? "You" : `Player ${p.seat + 1}`,
                ),
                lesson: null,
                motion: false,
              }),
            ),
          });
        await expect(page.locator('[data-do="unlock"]'))
          .toBeVisible({ timeout: 5000 })
          .catch(async (error) => {
            console.log(await page.locator("body").innerText());
            throw error;
          });
        await page.locator('[data-do="unlock"]').click();
        await expect(page.locator(".c-tabletop")).toBeVisible();
      }
      await load();
      await expect(page.locator("[data-table-card]")).toHaveCount(players);
      await expect(page.locator('[data-first-player="0"]')).toHaveCount(1);
      await capture(page, players, viewport.width, "opening");
      await playCard(
        page,
        "alba-2",
        "recruit",
        undefined,
        viewport.width > 600,
      );
      await page.locator('[data-do="unlock"]').click();
      await expect(page.locator("[data-table-card]")).toHaveCount(players + 1);
      await capture(page, players, viewport.width, "action");
      const dense = structuredClone(game);
      dense.players.forEach((p) => {
        const cards = CARDS.filter((c) => c.dynasty === p.dynasty);
        p.court = [
          p.ruler!,
          ...cards
            .filter((c) => c.id !== p.ruler)
            .slice(0, 8)
            .map((c) => c.id),
        ];
        p.hand = cards.filter((c) => !p.court.includes(c.id)).map((c) => c.id);
      });
      dense.deck = [];
      assertInvariants(dense);
      await load(dense);
      await expect(page.locator("[data-table-card]")).toHaveCount(players * 9);
      await capture(page, players, viewport.width, "dense");
      await page.locator('[data-do="focus"][data-seat="0"]').click();
      await capture(page, players, viewport.width, "readable-focus");
      const bounds = await page
        .locator('[data-table-card="alba-0"]')
        .boundingBox();
      assert.ok(
        bounds && bounds.width >= 110,
        "focused cards remain large enough to read",
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "no horizontal page overflow",
      );
      await page.close();
    }
  report.passed = true;
  console.log(
    "Required 2/3/4-player desktop and compact opening/action/dense/focus checks passed. Screenshots await actual inspection.",
  );
} finally {
  writeFileSync(`${output}/manifest.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
