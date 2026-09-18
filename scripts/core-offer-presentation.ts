import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createGame} from '../tests/core-established-fixture';
import {applyAction} from '../src/core-game/engine';
import {CARDS} from '../src/core-game/content';
import {encodeSave} from '../src/core-game/storage';
const out='artifacts/core/offers';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try {for(const [width,height] of [[1440,900],[3840,2160],[375,667],[390,844],[844,390]]) {
 const page=await browser.newPage({viewport:{width,height}});
 for(const type of ['trade','recall'] as const) {
  const s=createGame({seed:501,dynasties:['alba','plantagenet']});s.active=1;s.players[0].hand=['alba-4'];s.players[0].played=['alba-5'];s.players[1].hand=['alba-3'];
  const used=s.players.flatMap(p=>[...p.hand,...p.court,...p.played]);s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
  const pending=applyAction(s,{type,seat:1,card:'alba-3',revision:0,...(type==='trade'?{other:0,request:'alba-5'}:{target:'alba-0'})});
  await page.goto(process.env.BASE_URL??'http://localhost:4174');await page.locator('[data-do="setup"]').click();await page.locator('#save-file').setInputFiles({name:'offer.json',mimeType:'application/json',buffer:Buffer.from(encodeSave({game:pending,mode:'solo',names:['You','Rival'],lesson:null,motion:true}))});
  const pair=page.locator(type==='trade'?'.c-trade-pair':'.c-challenge-pair');await expect(pair).toBeVisible();await page.waitForTimeout(800);
  assert.doesNotMatch(await page.locator('body').innerText(),/You[’']s/);
  const boxes=await pair.locator('.core-face').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width};}));assert.equal(boxes.length,2);assert.ok(boxes[0].right<=boxes[1].x);assert.ok(boxes.every(r=>r.x>=0&&r.right<=width&&r.y>=0&&r.bottom<=height));
  if(type==='recall') {
   const board=await page.locator('.c-board-wrap').boundingBox();assert.ok(board);assert.ok(Math.abs((boxes[0].x+boxes[1].right)/2-(board.x+board.width/2))<2,'Challenge pair is centered over the table');
   await expect(page.locator('[data-table-card="alba-3"]')).toHaveCount(0);
   const arc=await page.locator('.c-target-arcs').evaluate(e=>({...((e as HTMLElement).dataset)}));assert.ok(Math.abs(Number(arc.fromX)-(boxes[0].x+boxes[0].width/2))<2,'Arrow begins at visible Challenger');
   const hand=await page.locator('.c-hand').boundingBox();assert.ok(hand);assert.ok(boxes.every(r=>r.bottom<=hand.y||r.right<=hand.x),'Pair keeps hand usable');
  }
  await page.screenshot({path:`${out}/${width}-${type}.png`});
  await page.locator(type==='trade'?'.c-trade-controls [data-do="generic"]': '[data-do="respond-retreat"]').first().click();
  await expect(pair).toHaveCount(0);await expect(page.locator('.c-target-arcs')).toBeHidden();
 }
 await page.close();console.log(`PASS paired offers, hand access, grammar and arrow origin ${width}x${height}`);
}}finally{await browser.close();}
