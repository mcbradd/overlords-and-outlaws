import { chromium,expect } from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chooseAction} from '../src/core-game/ai';
import {viewForSeat,applyAction,type CoreState} from '../src/core-game/engine';
const base=process.env.BASE_URL??'http://localhost:5173';
const out=process.env.INHERITANCE_OUTPUT??'artifacts/core/inheritance';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const rows: unknown[]=[];
try {
 for(const players of [2,3,4]) for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'reduce',hasTouch:width===390});
  const read=()=>page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.endsWith('oando-v9-inheritance'))![1]).game as CoreState);
  const capture=async(stage:string)=>{await page.waitForTimeout(450);const path=`${out}/${players}p-${width}-${stage}.png`;await page.screenshot({path});rows.push({players,width,stage,path,inspected:false});};
  await page.goto(base);await page.locator('[data-do="setup"]').click();
  await expect(page.locator('#dynasty')).toHaveCount(0);
  await page.locator('#players').selectOption(String(players));await page.locator('#mode').selectOption('local');await page.locator('#seed').fill('501');await page.locator('[data-do="begin"]').click();
  await page.locator('[data-do="unlock"]').click();await expect(page.locator('.c-held-card')).toHaveCount(8);await capture('opening');
  let s=await read();const seen=new Set<string>();
  while(s.setup) {
   const phase=`${s.phase}-${s.setup.pass}`;
   if(!seen.has(phase)) {seen.add(phase);await capture(phase);}
   const action=chooseAction(viewForSeat(s,s.active),s.active).action;
   const oldSeat=s.active, expected=applyAction(s,action);
   const card=page.locator(`[data-do="select"][data-card="${action.card}"]`);
   await card.focus();await card.click();
   await expect.poll(async()=>(await read()).revision).toBe(expected.revision);
   s=await read();assert.deepEqual(s,expected);
   if(s.active!==oldSeat) {await expect(page.locator('.c-hand')).toHaveCount(0);await page.locator('[data-do="unlock"]').click();}
  }
  assert.ok(s.players.every(p=>p.court.length===3&&p.hand.length===5));await expect(page.locator('[data-table-card]')).toHaveCount(players*3);await capture('declared');
  const id=s.players[s.active].court[1];
  await page.locator('[data-do="focus"][data-seat="0"]').click();
  const court=page.locator(`[data-table-card="${id}"]`);await court.focus();await page.waitForTimeout(350);
  if(width===390) {
    await court.tap();await expect(page.locator('dialog')).toBeVisible();await capture('court-action');
    await page.locator('dialog [data-do="withdraw"]').tap();
  } else {
    await expect(page.locator('.c-court-actions')).toBeVisible();await capture('court-action');
    await page.locator('.c-court-actions button').click();
  }
  await expect.poll(async()=>(await read()).revision).toBe(s.revision+1);
  s=await read();assert.ok(s.players[0].hand.includes(id));assert.equal(s.active,1);
  await page.locator('[data-do="unlock"]').click();await capture('returned');
  await page.close();console.log(`PASS ${players} players at ${width}`);
 }
} finally {writeFileSync(`${out}/report.json`,JSON.stringify({base,rows},null,2));await browser.close();}
