import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createGame} from '../src/core-game/engine';
import {DYNASTIES} from '../src/core-game/content';
import {encodeSave} from '../src/core-game/storage';
import {clickExposed} from './core-tabletop';
const browser=await chromium.launch({channel:'chrome'});
try {for(const players of [2,3,4]) {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const s=createGame({seed:501,dynasties:DYNASTIES.slice(0,players)});
 await page.goto(process.env.BASE_URL??'http://localhost:5173');await page.locator('[data-do="setup"]').click();
 await page.locator('#save-file').setInputFiles({name:'draft.json',mimeType:'application/json',buffer:Buffer.from(encodeSave({game:s,mode:'solo',names:s.players.map((_,i)=>i?'Player '+(i+1):'You'),lesson:null,motion:true}))});
 for(const pass of [3,2,1]) {
  await expect(page.locator('#draft-title')).toContainText(`Select ${pass}`);
  for(let i=0;i<pass;i++)await clickExposed(page.locator('.c-held-card:not(.c-draft-selected) .c-card-pick').first());
  await page.evaluate(()=>{
   const state={start:0,delay:-1,count:0};(window as any).draftTiming=state;
   document.querySelector('[data-do="draft-pass"]')!.addEventListener('click',()=>state.start=performance.now(),{capture:true,once:true});
   const observer=new MutationObserver(()=>{const count=document.querySelectorAll('.c-draft-flight .c-card-back').length;if(count){state.count=count;state.delay=performance.now()-state.start;observer.disconnect();}});
   observer.observe(document.body,{childList:true,subtree:true});
  });
  await page.locator('[data-do="draft-pass"]').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).draftTiming.count)).toBe(players*pass);
  const timing=await page.evaluate(()=>(window as any).draftTiming);
  assert.ok(timing.delay<500,`Computer packets delayed exchange ${timing.delay}ms`);
  await expect(page.locator('.c-draft-flight')).toHaveCount(0);
  console.log(`PASS ${players} players, ${pass} cards: exchange begins ${Math.round(timing.delay)}ms after PASS`);
 }
 await page.close();
}}finally{await browser.close();}
