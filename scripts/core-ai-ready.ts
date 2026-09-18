import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createGame} from '../tests/core-established-fixture';
import {encodeSave} from '../src/core-game/storage';
import {DYNASTIES} from '../src/core-game/content';
const browser=await chromium.launch({channel:'chrome'});
try{for(const count of [2,3,4]) {
 const page=await browser.newPage({viewport:{width:1440,height:900}});const game=createGame({seed:501,dynasties:DYNASTIES.slice(0,count)});
 await page.goto(process.env.BASE_URL??'http://localhost:5173');await page.locator('[data-do="setup"]').click();await page.locator('#save-file').setInputFiles({name:'ready.json',mimeType:'application/json',buffer:Buffer.from(encodeSave({game,mode:'solo',names:game.players.map((_,i)=>i?`Rival ${i}`:'You'),lesson:null,motion:true}))});
 const pass=page.locator('[data-do="generic"]').filter({hasText:/^Pass$/});await expect(pass).toBeVisible();await page.waitForTimeout(200);
 const start=Date.now();await pass.click();await expect.poll(()=>page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.endsWith('oando-v9-inheritance'))![1]).game.revision),{timeout:1100,intervals:[20]}).toBeGreaterThanOrEqual(2);
 const elapsed=Date.now()-start;assert.ok(elapsed<1100,'No old 1.3-second thinking delay');console.log(`PASS ${count} players: opponent committed in ${elapsed}ms`);await page.close();
}}finally{await browser.close();}
