import {chromium,expect,type Page} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createGame} from '../tests/core-established-fixture';
import {CARDS,DYNASTIES} from '../src/core-game/content';
import {applyAction,legalActions,viewForSeat,type CoreState} from '../src/core-game/engine';
import {encodeSave} from '../src/core-game/storage';
const base=process.env.BASE_URL??'http://localhost:5173';const out=process.env.CHALLENGE_OUTPUT??'artifacts/core/challenge';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
function fixture(players=2,challenge=true,ambiguous=false,noDefense=false){
 let s=createGame({seed:501,dynasties:DYNASTIES.slice(0,players)});
 s.players[0].hand=noDefense?['plantagenet-6','plantagenet-7']:['alba-4','alba-6'];s.players[1].hand=['alba-3'];
 s.players.slice(2).forEach(p=>p.hand=[]);
 if(challenge||ambiguous)s.players[0].court.push('alba-2');
 const used=s.players.flatMap(p=>[...p.hand,...p.court]);s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
 if(challenge){s.active=1;s=applyAction(s,legalActions(viewForSeat(s,1),1).find(a=>a.type==='recall'&&a.target==='alba-2')!);}
 return s;
}
const read=(page:Page)=>page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.endsWith('oando-v9-inheritance'))![1]).game as CoreState);
async function load(page:Page,s:CoreState){await page.goto(base);await page.locator('[data-do="setup"]').click();await page.locator('#save-file').setInputFiles({name:'challenge.json',mimeType:'application/json',buffer:Buffer.from(encodeSave({game:s,mode:'local',names:s.players.map((_,i)=>i?'Player '+(i+1):'You'),lesson:null,motion:false}))});await page.locator('[data-do="unlock"]').click();await expect(page.locator('#core-table')).toBeVisible();}
async function drag(page:Page,id:string,valid=true,touch=false){
 await page.waitForTimeout(300);
 const card=page.locator(`[data-do="select"][data-card="${id}"]`);const a=await card.boundingBox(),b=await page.locator('#core-table').boundingBox();assert.ok(a&&b);const from={x:a.x+a.width*.5,y:a.y+a.height*.45},to=valid?{x:b.x+b.width*.15,y:b.y+b.height*.7}:{x:4,y:4};
 if(touch){const c=await page.context().newCDPSession(page);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});for(let i=1;i<=12;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/12,y:from.y+(to.y-from.y)*i/12}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach();}
 else {await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:12});await page.mouse.up();}
}
try {
 for(const [width,height] of (process.env.CHALLENGE_VIEWPORTS?JSON.parse(process.env.CHALLENGE_VIEWPORTS):[[1920,1080],[1366,768],[1440,900],[360,800],[375,667],[390,844],[414,896],[430,932],[844,390]])) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,reducedMotion:'reduce'});
  for(const players of [2,3,4]) {
   const s=fixture(players);await load(page,s);
   await expect(page.locator('#challenge-title')).toHaveText('Player 2 Challenges with David I');
   await expect(page.locator('[data-do="respond-defend"]')).toBeDisabled();
   await page.locator('[data-do="select"][data-card="alba-4"]').click();assert.deepEqual(await read(page),s);
   await expect(page.locator('[data-do="respond-defend"]')).toBeEnabled();
   const geometry=await page.locator('.c-response').evaluate(e=>{const r=e.getBoundingClientRect();const hand=document.querySelector('.c-hand')!.getBoundingClientRect();return{top:r.top,bottom:r.bottom,hand:hand.bottom,screen:innerHeight,buttons:[...e.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return{h:r.height,hit:b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})};});
   assert.ok(geometry.top>=geometry.hand-1&&geometry.bottom<=geometry.screen);assert.ok(geometry.buttons.every(b=>b.h>=44&&b.hit));
   await page.screenshot({path:`${out}/${players}p-${width}x${height}-response.png`});
   await page.locator('[data-do="respond-defend"]').click();
   const defense=legalActions(viewForSeat(s,0),0).find(a=>a.type==='defend'&&a.card==='alba-4')!;
   await expect.poll(async()=>(await read(page)).revision).toBe(s.revision+1);assert.deepEqual(await read(page),applyAction(s,defense));
   await load(page,s);await drag(page,'alba-4',false,width<600);assert.deepEqual(await read(page),s);
   await drag(page,'alba-4',true,width<600);await expect.poll(async()=>(await read(page)).revision).toBe(s.revision+1);assert.deepEqual(await read(page),applyAction(s,defense));
   if(width>=600) {
    await load(page,s);
    await page.locator('[data-card="alba-4"][data-do="select"]').hover();
    const contextual=page.locator('[data-do="arm"][data-type="defend"][data-card="alba-4"]');
    await expect(contextual).toBeVisible();assert.deepEqual(await read(page),s);
    await contextual.click();await expect.poll(async()=>(await read(page)).revision).toBe(s.revision+1);assert.deepEqual(await read(page),applyAction(s,defense));
   }
   await load(page,s);await page.locator('[data-do="respond-retreat"]').click();await expect.poll(async()=>(await read(page)).revision).toBe(s.revision+1);assert.deepEqual(await read(page),applyAction(s,legalActions(viewForSeat(s,0),0).find(a=>a.type==='decline')!));
  }
  const forced=fixture(2,true,false,true);await load(page,forced);
  await expect(page.locator('#challenge-response-hint')).toContainText('You have no Nobles of House Alba to defend your honor. Malcolm III must retreat.');
  await expect(page.locator('[data-do="respond-retreat"]')).toHaveClass(/next-interaction/);
  await page.screenshot({path:`${out}/${width}x${height}-forced-retreat.png`});
  await page.locator('[data-do="respond-retreat"]').click();assert.deepEqual(await read(page),applyAction(forced,legalActions(viewForSeat(forced,0),0).find(a=>a.type==='decline')!));
  const single=fixture(2,false);await load(page,single);await drag(page,'alba-4',true,width<600);await expect.poll(async()=>(await read(page)).revision).toBe(single.revision+1);
  const multi=fixture(2,false,true);await load(page,multi);await drag(page,'alba-4',true,width<600);assert.deepEqual(await read(page),multi,'Ambiguous direct drag must not choose an action');
  await page.close();console.log(`PASS challenge click, drag, invalid drop, retreat, single/multiple options at ${width}x${height}, 2/3/4 players`);
 }
}finally{await browser.close();}
