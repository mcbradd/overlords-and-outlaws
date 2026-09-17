import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { LESSONS, createTutorial, lessonAction } from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { viewForSeat } from "../src/history-engine/view";
import { requiredTeachingCards } from "../src/history-engine/learning";

// Engineering regression checks, separate from the blind visual playtest.
// These verify the specific interaction failures reported by that player.
const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5182";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const errors: string[] = [];
page.on("pageerror", error => errors.push(error.message));
mkdirSync("artifacts/tutorial-usability", { recursive: true });
try {
  await page.goto(base);
  await page.getByRole("button", { name: "Learn at the table", exact: true }).click();
  await page.locator('[data-ui="unlock"]').click();
  const guide = page.locator(".h-guide");
  assert.match(await guide.innerText(), /win/i, "explain the goal before asking for the first choice");
  assert.equal(await guide.locator('[data-ui="lesson-action"]').isDisabled(), true,
    "the tutorial must not silently choose the named cards for the player");
  let expected = createTutorial();
  for (let i = 0; i < LESSONS.length; i++) {
    if (i === 0) {
      const last = guide.locator('[data-guide-card="tudor-1"]');
      await last.scrollIntoViewIfNeeded();
      const scroll = await guide.evaluate(element => element.scrollTop);
      await last.click();
      assert.ok(Math.abs(await guide.evaluate(element => element.scrollTop) - scroll) < 3,
        "selecting a card must preserve the guide's scroll position");
      await last.click();
      assert.equal(await page.locator('[data-inspect].h-teaching-target').count(), 0,
        "inspection buttons cannot be highlighted as card-selection targets");
    }
    if (i === 16) {
      assert.doesNotMatch(await guide.innerText(), /Richard I/, "the rival's trade offer is still hidden");
      assert.equal(await page.locator("[data-trade-offer]").count(), 0);
    }
    if (i === 19) {
      assert.match(await page.locator("[data-trade-offer]").innerText(), /Richard I/,
        "after both agree, show the actual offered card before asking to accept");
      await page.screenshot({ path: "artifacts/tutorial-usability/trade-inspection.png", fullPage: true });
    }
    for (const id of requiredTeachingCards(viewForSeat(expected, 0), lessonAction(expected, i)!))
      if (i === 12) {
        await page.locator(`[data-card-id="${id}"]`).click();
        assert.equal(await guide.locator(`[data-guide-card="${id}"]`).getAttribute("aria-pressed"), "true",
          "the highlighted Court card must actually select, not open an unrelated inspection");
      } else await guide.locator(`[data-guide-card="${id}"]`).click();
    await guide.locator('[data-ui="lesson-action"]').click();
    expected = applyAction(expected, lessonAction(expected, i)!);
    if (i < LESSONS.length - 1) await guide.locator('[data-ui="lesson-next"]').click();
  }
  assert.match(await guide.innerText(), /win|won|prevails/i);
  assert.deepEqual(errors, []);
  await page.locator('[data-ui="home"]').first().click();
  await page.locator('[data-ui="teach"]').click();
  await page.locator('[data-ui="unlock"]').click();
  const stateBefore = await page.evaluate(() => localStorage.getItem("oando-v4-history"));
  await page.locator('[data-ui="leave-tutorial"]').click();
  const stateAfter = await page.evaluate(() => localStorage.getItem("oando-v4-history"));
  assert.deepEqual(JSON.parse(stateBefore!).game, JSON.parse(stateAfter!).game,
    "choosing free play preserves every card, seal, event and random state");
  assert.equal(JSON.parse(stateAfter!).tutorial, null);
  writeFileSync("artifacts/tutorial-usability/report.json", JSON.stringify({
    lessons: LESSONS.length, goalBeforeChoice: true, explicitCardSelection: true,
    concealedOfferUntilConsent: true, visibleTradeOfferBeforeAcceptance: true, errors,
  }, null, 2));
  console.log("Tutorial usability regression: goal, real selections, trade privacy and visible offers passed.");
} finally {
  await browser.close();
}
