import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {BY_ID,DYNASTIES} from '../src/core-game/content';
import {clickExposed} from './core-tabletop';
const browser=await chromium.launch({channel:'chrome'});
try {for(const [width,height] of [[1440,900],[390,844],[375,667],[844,390]]) {
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 await page.goto(process.env.BASE_URL??'http://localhost:5173');await page.locator('[data-do="intro"]').click();await page.locator('[data-do="teach"]').click();
 const sort=page.locator('[data-do="sort-hand"]');await expect(sort).toHaveText('Sorted by DYNASTY');
 const ids=()=>page.locator('.c-card-pick').evaluateAll(es=>es.map(e=>(e as HTMLElement).dataset.card!));
 const dynasty=(a:string,b:string)=>DYNASTIES.indexOf(BY_ID[a].dynasty)-DYNASTIES.indexOf(BY_ID[b].dynasty);
 const rank=(a:string,b:string)=>BY_ID[a].rank-BY_ID[b].rank;
 const original=await ids();assert.deepEqual(original,[...original].sort((a,b)=>dynasty(a,b)||rank(a,b)));
 await clickExposed(page.locator('.next-interaction .c-card-pick'));
 const save=()=>page.evaluate(()=>Object.entries(localStorage).find(([k])=>k.endsWith('oando-v9-inheritance'))![1]);const before=await save();
 await sort.click();await expect(sort).toHaveText('Sorted by RANK');assert.deepEqual(await ids(),[...original].sort((a,b)=>rank(a,b)||dynasty(a,b)));
 assert.equal(await save(),before);await expect(page.locator('.c-draft-selected')).toHaveCount(1);await expect(page.locator('[data-do="draft-pass"]')).toHaveText('Select 2 More to Pass');
 await sort.click();await expect(sort).toHaveText('Sorted by DYNASTY');assert.deepEqual(await ids(),original);assert.equal(await save(),before);
 await page.screenshot({path:`artifacts/core/sort-${width}.png`});await page.close();console.log(`PASS view-only hand sorting ${width}x${height}`);
}}finally{await browser.close();}
