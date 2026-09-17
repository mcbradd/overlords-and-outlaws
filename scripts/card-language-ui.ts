import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { createDenseFixture } from "../src/history-engine/fixtures";
import { CONTENT_VERSION, nameOf } from "../src/history-engine/content";
import { assertInvariants } from "../src/history-engine/engine";
import { defaultPreferences } from "../src/history-engine/storage";

const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
const game = createDenseFixture();
const pair = game.marriages.find((m) => m.seat === 0)!;
game.marriages = game.marriages.filter((m) => m.id !== pair.id);
const crisis = game.history.find((e) => e.id === "A3")!;
crisis.obligated = [0];
crisis.restoreIds = { 0: [pair.spouse] };
assertInvariants(game);
mkdirSync("artifacts/card-language", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.evaluate(
    (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
    {
      version: 4,
      rulesetId: "history-engine-v4",
      contentVersion: CONTENT_VERSION,
      game,
      tutorial: null,
      preferences: defaultPreferences(),
    },
  );
  await page.reload();
  await page.locator('[data-ui="resume"]').click();
  await page.locator('[data-ui="unlock"]').click();
  await page.getByRole("button", { name: "How to win", exact: true }).click();
  assert.match(
    await page.locator("dialog .h-operative").innerText(),
    /Claim the Crown: Have 3/,
  );
  await page.screenshot({
    path: "artifacts/card-language/own-law-phone.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.locator('[data-inspect="A3"]').click();
  const inspection = await page
    .locator("dialog .h-inspection section")
    .innerText();
  assert(inspection.includes("Nobles marked when revealed"));
  assert(inspection.includes(nameOf(pair.spouse)));
  assert(inspection.includes("Marry one of these Nobles to help"));
  await page.screenshot({
    path: "artifacts/card-language/marked-crisis-phone.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  const after = await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  );
  assert.deepEqual(
    after,
    JSON.parse(JSON.stringify(game)),
    "inspection must not change any game state",
  );
  assert.deepEqual(errors, []);
  writeFileSync(
    "artifacts/card-language/ui.json",
    JSON.stringify(
      {
        contentVersion: CONTENT_VERSION,
        errors,
        ownLaw: true,
        markedNobles: true,
        stateNeutral: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Card language UI: own Law, original marked Nobles and state-neutral phone inspection passed.",
  );
} finally {
  await browser.close();
}
