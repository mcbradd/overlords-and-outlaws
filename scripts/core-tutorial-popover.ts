import {chromium,expect,type Page} from '@playwright/test';
import {TEACHING} from '../src/core-game/tutorial';
import {playCard} from './core-tabletop';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
export async function completePopoverTutorial(page:Page,capture:(name:string)=>Promise<void>) {
 const read=()=>page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.endsWith('oando-v9-inheritance'))![1]));
 await expect(page.locator('.c-draft-modal')).toBeVisible();
 await page.locator('[data-do="lesson-help"]').click();
 await expect(page.locator('.c-lesson-popover')).toBeVisible();
 const dock=await page.locator('.c-lesson-popover').evaluate(e=>({modal:e.matches(':modal'),top:e.getBoundingClientRect().top,boardBottom:document.querySelector('#core-table')!.getBoundingClientRect().bottom}));
 assert.equal(dock.modal,false);
 await expect(page.locator('.c-lesson-popover .primary')).toHaveText('Continue');
 const before=await read();await capture('opening-popover');
 await page.locator('.c-lesson-popover [data-do="close"]:visible').last().click();
 await expect(page.locator('.c-lesson-popover')).toHaveCount(0);
 assert.deepEqual((await read()).game,before.game,'dismiss does not mutate the game');
 await expect(page.locator('[data-do="lesson-help"]')).toHaveText('?');
 await expect(page.locator('[data-do="menu"]')).toBeVisible();
 await expect(page.locator('[data-do="focus"]')).toHaveCount(2);
 assert.ok(!(await page.locator('.c-game > .c-guide').innerText()).includes(TEACHING[0].explanation));
 await capture('standard-table');
 await page.locator('[data-do="lesson-help"]').click();
 await expect(page.locator('#lesson-title')).toHaveText(TEACHING[0].title);
 assert.deepEqual((await read()).game,before.game,'help does not mutate the game');
 await page.keyboard.press('Escape');await expect(page.locator('.c-lesson-popover')).toHaveCount(0);
 for(let guard=0;guard<80;guard++) {
  let save=await read();if(save.lesson.done&&save.lesson.cursor===TEACHING.length-1) break;
  const cursor=save.lesson.cursor,step=TEACHING[cursor];
  if(await page.locator('.c-lesson-popover').count()) {
   await expect(page.locator('#lesson-title')).toHaveText(step.title);
   await capture(`step-${cursor}-popover`);
   await page.locator('.c-lesson-popover [data-do="close"]:visible').last().click();
   await expect(page.locator('.c-lesson-popover')).toHaveCount(0);
  }
  save=await read();if(save.lesson.cursor!==cursor) continue;
  if(step.seat===0) {
   if(step.type==='draft-pick') {
     for(let i=0;i<save.game.setup.pass-(save.game.setup.picks[0]?.length??0);i++) {
       await playCard(page,TEACHING[cursor+i].card!,'draft-pick',undefined,false);
     }
     await page.locator('[data-do="draft-pass"]').click();
   }
   else if(step.type==='declare-pick') {
     const beforeGame=structuredClone(save.game);
     for(let i=0;i<3;i++) await playCard(page,TEACHING[cursor+i].card!,'declare-pick',undefined,false);
     assert.deepEqual((await read()).game,beforeGame,'Declaration stays private and reversible before confirmation');
     await page.locator('[data-do="declare-confirm"]').click();
   }
   else if(step.type==='decline') { await expect(page.locator('.c-response')).toContainText('Malcolm III must retreat');await capture('forced-retreat-at-button');await page.locator('[data-do="respond-retreat"]').click(); }
   else if(step.card) await playCard(page,step.card,step.type,step.target??step.supporter,false);
   else await page.locator('[data-do="generic"]').click();
  }
  await expect.poll(async()=>(await read()).game.revision).toBeGreaterThan(save.game.revision);
  if(cursor===0) await capture('grouped-draft-pick');
 }
 const final=await read();assert.equal(final.game.result?.winner,0);assert.equal(final.lesson.done,true);
 await expect(page.locator('.c-victory')).toBeVisible();await expect(page.locator('.c-victory')).toContainText('Long live your Dynasty');const victory=await page.locator('.c-victory-copy').boundingBox();assert.ok(victory&&victory.y>=0&&victory.y+victory.height<=page.viewportSize()!.height,'Victory fits the screen');await capture('victory');
 await page.locator('[data-do="victory-close"]').click();
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/core-tutorial-popover.ts')) {
 const out=process.env.POPOVER_OUTPUT??'artifacts/core/tutorial-popover';mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome'});const rows:unknown[]=[];
 try{for(const viewport of (process.env.POPOVER_VIEWPORTS?JSON.parse(process.env.POPOVER_VIEWPORTS):[{width:1440,height:900},{width:390,height:844},{width:844,height:390}])) {
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  await page.goto(process.env.BASE_URL??'http://localhost:5173');await page.locator('[data-do="intro"]').click();await page.locator('[data-do="teach"]').click();
  await completePopoverTutorial(page,async name=>{const path=`${out}/${viewport.width}-${name}.png`;await page.waitForTimeout(750);await page.screenshot({path});rows.push({viewport,name,path,inspected:false});});
  await page.close();console.log(`Popover tutorial passed ${viewport.width}x${viewport.height}`);
 }}finally{writeFileSync(`${out}/report.json`,JSON.stringify({rows},null,2));await browser.close();}
}
