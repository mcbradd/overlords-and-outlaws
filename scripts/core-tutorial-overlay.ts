import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createTutorial,applyAction,legalActions,viewForSeat} from '../src/core-game/engine';
import {TEACHING,isTeachingAction} from '../src/core-game/tutorial';
import {encodeSave} from '../src/core-game/storage';
import {mkdirSync} from 'node:fs';
mkdirSync('artifacts/core/tutorial-overlay',{recursive:true});
const base=process.env.BASE_URL??'http://localhost:5173';
const browser=await chromium.launch({channel:'chrome'});
try {for(const viewport of [{width:1440,height:900},{width:3840,height:2160},{width:390,height:844},{width:844,height:390}]) {
 const page=await browser.newPage({viewport,reducedMotion:'reduce'});
 for(const cursor of [0,TEACHING.findIndex(s=>s.type==='declare-pick'),TEACHING.findIndex(s=>s.type==='defend')]) {
  let game=createTutorial();for(let i=0;i<cursor;i++)game=applyAction(game,legalActions(viewForSeat(game,TEACHING[i].seat),TEACHING[i].seat).find(a=>isTeachingAction(a,i))!);
  const load=async(tutorial:boolean)=>{await page.goto(base);await page.locator('[data-do="setup"]').click();await page.locator('#save-file').setInputFiles({name:'overlay.json',mimeType:'application/json',buffer:Buffer.from(encodeSave({game,mode:tutorial?'tutorial':'solo',names:['You','Rival'],lesson:tutorial?{cursor,done:false}:null,motion:false}))});await expect(page.locator('#core-table')).toBeVisible();await page.waitForTimeout(100);};
  await load(false);const normal={board:await page.locator('.c-board-wrap').boundingBox(),hand:await page.locator('.c-hand').boundingBox()};
  await load(true);await expect(page.locator('.c-lesson-popover')).toBeVisible();
  const taught={board:await page.locator('.c-board-wrap').boundingBox(),hand:await page.locator('.c-hand').boundingBox()};assert.deepEqual(taught,normal,'Tutorial must use the exact normal-game layout');
  const panel=await page.locator('.c-lesson-popover').boundingBox();assert.ok(panel&&panel.x>=0&&panel.y>=0&&panel.x+panel.width<=viewport.width&&panel.y+panel.height<=viewport.height,'Guide fits viewport');
  assert.equal(await page.locator('.c-lesson-popover').evaluate(e=>e.parentElement===document.body),true);
  assert.equal(await page.locator('.c-lesson-popover').evaluate(e=>e.matches(':modal')),false);
  for(const card of await page.locator('.c-held-card').all()) {const r=await card.boundingBox();assert.ok(r);assert.ok(panel.y+panel.height<=r.y||panel.y>=r.y+r.height||panel.x+panel.width<=r.x||panel.x>=r.x+r.width,'Guide does not cover a hand card');}
  if(game.pending){await expect(page.locator('.c-target-arcs')).toBeVisible();const buttons=await page.locator('.c-response-actions').boundingBox();assert.ok(buttons);assert.ok(panel.y+panel.height<=buttons.y||panel.x+panel.width<=buttons.x,'Guide does not cover response buttons');}
  await page.mouse.move(0,0);await page.waitForTimeout(200);await page.screenshot({path:`artifacts/core/tutorial-overlay/${viewport.width}-${game.phase}.png`});
  const labels=await page.locator('.core-played-label,.core-table-office,.core-table-caption').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,text:e.textContent};}));
  for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];assert.ok(a.right<=b.x||b.right<=a.x||a.bottom<=b.y||b.bottom<=a.y,`Public labels must not overlap: ${a.text} / ${b.text}`);}
  await page.locator('.c-lesson-popover > .c-close').click();assert.deepEqual(await page.locator('.c-board-wrap').boundingBox(),normal.board,'Dismissal does not resize the board');
 }
 await page.close();console.log(`PASS exact tutorial overlay ${viewport.width}x${viewport.height}`);
}}finally{await browser.close();}
