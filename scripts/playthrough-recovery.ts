import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { createPreparedTutorial, lessonAction } from '../src/history-engine/tutorial';
import { applyAction } from '../src/history-engine/engine';
import { CONTENT_VERSION } from '../src/history-engine/content';
import { defaultPreferences } from '../src/history-engine/storage';

const base = process.env.HISTORY_BASE_URL ?? 'http://localhost:5178';
mkdirSync('artifacts/playthrough', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base);
  let game = createPreparedTutorial();
  for (let i = 15; i < 27; i++) game = applyAction(game, lessonAction(game, i)!);
  await page.evaluate(save => localStorage.setItem('oando-v4-history', JSON.stringify(save)), {
    version: 4, rulesetId: 'history-engine-v4', contentVersion: CONTENT_VERSION,
    game, tutorial: 27, preferences: defaultPreferences(),
  });
  await page.reload();
  await page.locator('[data-ui="resume"]').click();
  await page.locator('.h-table[data-scene-ready="true"]').waitFor();
  await page.screenshot({ path: 'artifacts/playthrough/pass.png' });
  await page.locator('[data-action][data-recommended="true"]').first().click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('oando-v4-history')!).game);
  assert.equal(saved.revision, game.revision + 1, 'One click on Pass must commit the action, without a second confirmation');
  assert.equal(await page.locator('[data-ui="commit"]').count(), 0);
  await page.locator('.h-opponent-preview').waitFor();
  assert.equal(await page.locator('.h-countdown').count(), 1, 'Rival preview must display its remaining reading time');
  await page.locator('.h-opponent-preview').hover();
  const before = await page.evaluate(() => localStorage.getItem('oando-v4-history'));
  await page.waitForTimeout(7000);
  assert.equal(await page.evaluate(() => localStorage.getItem('oando-v4-history')), before, 'Hover must pause rival execution');
  await page.locator('[data-ui="advance-ai"]').click();
  assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('oando-v4-history')!).game)).revision, saved.revision + 1);
  await page.locator('[data-ui="home"]').first().click();
  await page.locator('[data-ui="teach"]').click();
  await page.locator('[data-ui="enter-table"]').click();
  await page.locator('[data-ui="category-build"]').click();
  const alternative = page.locator('[data-action]').first();
  const chosen = JSON.parse((await alternative.getAttribute('data-action'))!);
  await alternative.click();
  const branched = await page.evaluate(() => JSON.parse(localStorage.getItem('oando-v4-history')!));
  assert.equal(branched.tutorial, null);
  assert.equal(branched.preferences.guidance, true, 'Choosing a different plan must retain guidance');
  assert.deepEqual(branched.game, JSON.parse(JSON.stringify(applyAction(createPreparedTutorial(), chosen))), 'An alternative must be the exact legal action, with no teaching reset');
  for (let i = 0; i < 8 && !await page.locator('.h-coach').count(); i++)
    await page.locator('[data-ui="advance-ai"]:not([disabled])').click();
  assert.match(await page.locator('.h-coach').innerText(), /Your next move/);
  await page.reload();
  await page.locator('[data-ui="resume"]').click();
  assert.match(await page.locator('.h-coach').innerText(), /Your next move/);
  console.log('PASS: single-click action, countdown, hover pause, explicit advance, legal alternative with retained guidance and resume');
} finally { await browser.close(); }
