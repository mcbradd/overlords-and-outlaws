import { playCard } from './core-tabletop';
/** Instrumented app regressions. No screenshot or blind-player acceptance is claimed. */
import { chromium, expect, type Page } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { applyAction } from '../src/core-game/engine';
import { createGame } from '../tests/core-established-fixture';
import { encodeSave } from '../src/core-game/storage';

const base = process.env.BASE_URL ?? 'http://localhost:5173/';
const output = process.env.AUDIT_OUTPUT ?? 'docs/reviews/BUILD-5-APP-AUDIT-RESULTS.json';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const records: { name: string; passed: boolean; evidence?: unknown; error?: string }[] = [];
const hashes = Object.fromEntries(['app', 'storage', 'tutorial', 'engine'].map(file => [file,
  createHash('sha256').update(readFileSync(`src/core-game/${file}.ts`)).digest('hex')]));

async function run(name: string, operation: (page: Page) => Promise<unknown>): Promise<void> {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    const evidence = await operation(page);
    assert.deepEqual(errors, [], 'No unhandled runtime errors');
    records.push({ name, passed: true, evidence });
  } catch (error) {
    records.push({ name, passed: false, error: String(error), evidence: { pageErrors: errors } });
  } finally { await context.close(); }
}
async function teach(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Learn at the table', exact: true }).click();
  await page.getByRole('button', { name: 'Take your seat', exact: true }).click();
  await expect(page.locator('#core-table')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('[data-do="select"][data-card="plantagenet-6"]')).toBeEnabled({ timeout: 30000 });
}
async function savedProgress(page: Page) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(item => item.endsWith('oando-v9-inheritance'));
    if (!key) throw new Error('Expected generated test save');
    const save = JSON.parse(localStorage.getItem(key)!);
    return { revision: save.game.revision as number, phase: save.game.phase as string,
      cursor: save.lesson.cursor as number, done: save.lesson.done as boolean };
  });
}

for (const failure of ['getter', 'getItem', 'setItem'] as const) {
  await run(`APP-01 storage ${failure} denial`, async page => {
    await page.addInitScript(mode => {
      if (mode === 'getter') Object.defineProperty(window, 'localStorage', {
        get() { throw new DOMException('Storage unavailable', 'SecurityError'); },
      });
      else Storage.prototype[mode] = function () { throw new DOMException('Storage unavailable', 'SecurityError'); };
    }, failure);
    await page.goto(base);
    await expect(page.getByRole('button', { name: 'Learn at the table', exact: true })).toBeVisible();
    await teach(page);
    const warnings = await page.locator('[role="alert"]').allTextContents();
    assert.ok(warnings.some(text => /save|storage/i.test(text)), 'Unsaved-session warning remains available');
    return { titleReachable: true, tutorialReachable: true, warnings };
  });
}

for (const fromExistingGame of [false, true]) {
  await run(`APP-02 delayed import from ${fromExistingGame ? 'completed game' : 'title'}`, async page => {
    await page.goto(base);
    await page.getByRole('button', { name: 'Play the core game', exact: true }).click();
    if (fromExistingGame) {
      let terminal = createGame({ seed: 501, dynasties: ['alba', 'plantagenet'] });
      terminal.round = 12;
      for (let i = 0; i < 2; i++) terminal = applyAction(terminal, { type: 'pass', seat: terminal.active, revision: terminal.revision });
      const initial = encodeSave({ game: terminal, mode: 'solo', lesson: null, names: ['You', 'P'], motion: false });
      await page.locator('#save-file').setInputFiles({ name: 'completed.json', mimeType: 'application/json', buffer: Buffer.from(initial) });
      await page.getByRole('button', { name: 'Play another game', exact: true }).click({ timeout: 30000 });
    }
    await page.route('**/art/characters/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      try { await route.continue(); } catch { /* The context may close after an earlier assertion failure. */ }
    });
    const incoming = encodeSave({ game: createGame({ seed: 501, dynasties: ['alba', 'plantagenet', 'tudor', 'habsburg'] }),
      mode: 'solo', lesson: null, names: ['You', 'P', 'T', 'H'], motion: false });
    await page.locator('#save-file').setInputFiles({ name: 'four-suits.json', mimeType: 'application/json', buffer: Buffer.from(incoming) });
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: 'Preparing your table', exact: true })).toBeVisible();
    assert.equal(await page.locator('#core-table').count(), 0, 'No premature table');
    assert.equal(await page.locator('.core-face-loading').count(), 0, 'No unfinished card apertures');
    await expect(page.locator('#core-table')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.core-face-loading')).toHaveCount(0);
    return { preparationHeldAt300ms: true, placeholdersDuringLoad: 0, loadedTable: true };
  });
}

await run('APP-03 rival teaching has a reader-controlled legal action', async page => {
  await page.goto(base);
  await teach(page);
  for(const card of ['plantagenet-6','plantagenet-7','plantagenet-8']) await playCard(page,card,'draft-pick',undefined,false);
  await expect(page.locator('[data-do="commit"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Watch the rival move', exact: true })).toBeVisible();
  const before = await savedProgress(page);
  const explanation = await page.locator('.c-game .c-guide').innerText();
  await page.waitForTimeout(4500);
  assert.deepEqual(await savedProgress(page), before, 'No timed rival action');
  assert.equal(await page.locator('.c-game .c-guide').innerText(), explanation, 'Explanation persists for the reader');
  await page.getByRole('button', { name: 'Watch the rival move', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
  const after = await savedProgress(page);
  assert.equal(after.revision, before.revision + 1);
  assert.equal(after.phase, 'draft');
  assert.equal(after.cursor, before.cursor + 1);
  assert.equal(after.done, false);
  await page.waitForTimeout(4500);
  assert.deepEqual(await savedProgress(page), after, 'No duplicate timer after watched action');
  return { stableReadingMilliseconds: 4500, exactlyOneWatchedAction: true, noConfirmation: true };
});

await browser.close();
mkdirSync(dirname(output), { recursive: true });
const report = { method: 'Instrumented headless Chrome DOM/runtime tests; not visual or blind-player acceptance.',
  base, completedAt: new Date().toISOString(), sourceHashes: hashes, passed: records.every(record => record.passed), records };
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
