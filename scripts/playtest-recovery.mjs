import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const output = 'artifacts/playtest-recovery';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];
for (const [width, height] of [[1440,900],[844,390],[667,320],[390,844]]) {
  const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto(process.env.HISTORY_BASE_URL ?? 'http://localhost:5178');
  await page.getByRole('button',{name:'Learn at the table',exact:true}).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => { const faces = [...document.querySelectorAll('.h-title canvas[data-face-state]')]; return faces.length === 3 && faces.every(c => c.dataset.faceState === 'ready'); });
  await page.screenshot({path:`${output}/after-title-${width}.png`});
  await page.getByRole('button',{name:'Learn at the table',exact:true}).click();
  const curtain = await page.locator('.h-curtain').count();
  if (curtain) await page.locator('[data-ui="unlock"]').click();
  if (await page.locator('[data-ui="enter-table"]').count()) {
    await page.screenshot({path:`${output}/after-intro-${width}.png`});
    await page.locator('[data-ui="enter-table"]').click();
  }
  await page.locator('.h-hand-card').first().waitFor();
  await page.locator('.h-table[data-scene-ready="true"]').waitFor();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({path:`${output}/after-tutorial-${width}.png`});
  const bounds = await page.evaluate(() => {
    const rect = selector => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};
    };
    return {
      viewport:{width:innerWidth,height:innerHeight},
      document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},
      hand:rect('.h-hand'),guide:rect('.h-guide'),
      progress:document.querySelector('.h-progress')?.textContent,
      fakeActions:document.querySelectorAll('[data-guide-card],[data-ui="lesson-action"]').length,
      realControls:document.querySelectorAll('.h-controls [data-action], .h-controls [data-ui^="offer-"]').length,
      guideOverflow:document.querySelector('.h-guide').scrollHeight > document.querySelector('.h-guide').clientHeight + 1,
      cards:[...document.querySelectorAll('.h-hand-card:not([hidden])')].map(el=>{const r=el.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};}),
    };
  });
  report.push({width,height,curtain,...bounds});
  await page.close();
}
await browser.close();
writeFileSync(`${output}/recovery.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report.map(({width,height,curtain,guideOverflow,realControls,document})=>({width,height,curtain,guideOverflow,realControls,document})),null,2));
assert.ok(report.every(r=>r.curtain===0 && r.document.height<=r.height && r.hand.bottom<=r.height && r.fakeActions===0 && r.realControls>=1 && !r.guideOverflow && r.cards.every(c=>c.bottom<=r.height && c.left>=0 && c.right<=r.width)),
  'Single-player learning must use the real controls, without a handoff or off-screen hand.');
