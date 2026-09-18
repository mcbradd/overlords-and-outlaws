import {chromium,expect} from '@playwright/test';
import {createGame} from '../tests/core-established-fixture';
import {CARDS} from '../src/core-game/content';
import {encodeSave} from '../src/core-game/storage';
import {clickExposed} from './core-tabletop';
const game=createGame({seed:501,dynasties:['alba','plantagenet']});
game.players[0].hand=['plantagenet-11','alba-9'];game.players[1].hand=[];
game.deck=CARDS.filter(c=>game.dynasties.includes(c.dynasty)&&!game.players.some(p=>[...p.hand,...p.court].includes(c.id))).map(c=>c.id);
const browser=await chromium.launch({channel:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(process.env.BASE_URL??'http://localhost:4174');await page.locator('[data-do="setup"]').click();
 await page.locator('#save-file').setInputFiles({name:'challenge.json',mimeType:'application/json',buffer:Buffer.from(encodeSave({game,mode:'solo',names:['You','Rival'],lesson:null,motion:true}))});
 const card=page.locator('[data-do="select"][data-card="plantagenet-11"]');await clickExposed(card);
 await page.locator('[data-do="arm"][data-type="recall"]').click();
 const from=await card.boundingBox(),to=await page.locator('[data-table-card="plantagenet-0"]').boundingBox();if(!from||!to)throw Error('Missing source/target');
 await page.mouse.move(from.x+from.width*.4,from.y+from.height*.4);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});await page.mouse.up();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.endsWith('oando-v9-inheritance'))![1]).game.pending)).toBe(null);
 await expect(page.locator('[data-played-owner]')).toHaveCount(2);
 await expect(page.locator('.c-target-arcs')).toBeHidden();
 console.log('PASS challenge resolves with visible Played piles and no abandoned arrow');
} finally {await browser.close();}
