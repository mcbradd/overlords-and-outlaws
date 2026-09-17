import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { createDenseFixture } from "../src/history-engine/fixtures";
import { CONTENT_VERSION, MANIFEST, nameOf } from "../src/history-engine/content";
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
  const readerResults: Array<{label: string; pages: number}> = [];
  async function readPages(label: string) {
    const dialog = page.locator('dialog.h-dialog[open]');
    await dialog.locator('.h-reader-page:not([hidden])').waitFor();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const count = await dialog.locator('.h-reader-position option').count();
    assert(count > 0, 'The probe must visit real reader pages');
    const texts: string[] = [];
    for (let index = 0; index < count; index++) {
      const active = dialog.locator('.h-reader-page:not([hidden])');
      const fit = await active.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1 && element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1;
      });
      assert(fit, `${label} page ${index + 1} must fit without scrolling`);
      texts.push(await active.innerText());
      if (index === 0 || index === count - 1)
        await page.screenshot({path: `artifacts/card-language/${label}-phone-${index + 1}.png`, fullPage: false});
      if (index < count - 1) {
        const next = dialog.locator('[data-reader="next"]');
        assert(await next.evaluate(element => { const r = element.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && !!hit && (hit === element || element.contains(hit)); }), 'Reader next must be reachable before clicking');
        await next.click();
      }
    }
    readerResults.push({label, pages: count});
    return texts.join(' ').replace(/\s+/g, ' ').trim();
  }
  await page.routeWebSocket("**/*", (socket) => socket.close());
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
  // Solo resumes enter directly; shared-device fixtures still require privacy.
  if (await page.locator('[data-ui="unlock"]').count())
    await page.locator('[data-ui="unlock"]').click();
  await page.locator(".h-game").waitFor();
  await page.getByRole("button", { name: "How to win", exact: true }).click();
  const law = await readPages('own-law');
  assert(law.includes(MANIFEST['law-alba'].canonicalText.replace(/\s+/g, ' ').trim()), 'All of the Law must be visible through reader navigation');
  await page.keyboard.press("Escape");
  const crisisCard = page.locator('[data-inspect="A3"]');
  for (
    let pageIndex = 0;
    !(await crisisCard.isVisible()) && pageIndex < game.history.length;
    pageIndex++
  ) {
    await page
      .getByRole("button", { name: "Next History cards", exact: true })
      .click();
  }
  assert(
    await crisisCard.isVisible(),
    "A marked crisis must be reachable through visible History navigation",
  );
  await crisisCard.click();
  const inspection = await readPages('marked-crisis');
  assert(inspection.includes("Nobles marked when revealed"));
  assert(inspection.includes(nameOf(pair.spouse)));
  assert(inspection.includes("Marry one of these Nobles to help"));
  assert(inspection.includes(MANIFEST['A3'].canonicalText.replace(/\s+/g, ' ').trim()));
  await page.keyboard.press("Escape");
  const handCard = page.locator('.h-hand [data-inspect]').first();
  const handId = (await handCard.getAttribute('data-inspect'))!;
  await handCard.click();
  const noble = await readPages('own-noble');
  assert(noble.includes(MANIFEST[handId].canonicalText.replace(/\s+/g, ' ').trim()), 'Compact Noble art must still lead to complete visible instructions');
  await page.keyboard.press('Escape');
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
        readerResults,
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
