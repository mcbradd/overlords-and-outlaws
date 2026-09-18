import {chromium,expect} from '@playwright/test';
import {clickExposed} from './core-tabletop';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome'});const out=process.env.DRAFT_OUTPUT??'artifacts/core/draft';mkdirSync(out,{recursive:true});
try {for(const [width,height] of (process.env.DRAFT_VIEWPORTS ? JSON.parse(process.env.DRAFT_VIEWPORTS) : [[1920,1080],[1536,864],[1366,768],[1440,900],[2560,1440],[360,800],[375,667],[390,844],[412,915],[430,932],[844,390],[414,896],[384,832],[1280,720],[1366,1366],[393,873],[360,780]])) {
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto(process.env.BASE_URL??'http://localhost:5173');await page.locator('[data-do="intro"]').click();await page.locator('[data-do="teach"]').click();
 for(const count of [3,2,1]) {
  await expect(page.locator('#draft-title')).toContainText(`Select ${count}`);
  await expect(page.locator('[data-do="draft-pass"]')).toHaveText(`Select ${count} More to Pass`);
  const bounds=await page.locator('.c-draft-modal').boundingBox();const hand=await page.locator('.c-hand').boundingBox();if(!bounds||!hand||bounds.y<hand.y+hand.height-1||bounds.y+bounds.height>height)throw Error('Dialog must sit below the hand and inside the viewport');
  for(let i=0;i<count;i++) {
   const card=page.locator('.next-interaction [data-do="select"]');await expect(card).toHaveCSS('outline-color','rgb(255, 225, 146)');await card.focus();await clickExposed(card);
   await expect(page.locator('[data-do="draft-pass"]')).toHaveText(i===count-1?'PASS':`Select ${count-i-1} More to Pass`);
  }
  if(count===3) {await clickExposed(page.locator('.c-draft-selected [data-do="select"]').last());await expect(page.locator('[data-do="draft-pass"]')).toHaveText('Select 1 More to Pass');await clickExposed(page.locator('.next-interaction [data-do="select"]'));}
  await expect(page.locator('.c-draft-selected')).toHaveCount(count);
  for(const card of await page.locator('.c-draft-selected').all()) {
    await expect(card.locator('.c-card-pick')).toHaveCSS('outline-color','rgb(85, 217, 139)');
    const label=await card.evaluate(e=>getComputedStyle(e,'::after').content);
    if(label!=='none' && label!=='normal') throw Error('Redundant card selection label');
  }
  for(const card of await page.locator('.c-card-pick').all()) await expect(card).toHaveCSS('opacity','1');
  await expect(page.locator('[data-do="draft-pass"]')).toHaveCSS('animation-name','attention-button-pulse');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-do="draft-pass"]')).toHaveCSS('animation-name','none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  const layout=await page.evaluate(()=>({header:document.querySelector('.c-game > header')!.getBoundingClientRect().top,overlap:[...document.querySelectorAll('.c-card-pick')].some(card=>{const a=card.getBoundingClientRect();return [...document.querySelectorAll('[data-draft-hand]')].some(hand=>{const b=hand.getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});})}));
  if(layout.header < -1 || layout.overlap) throw Error(`Clipped header or overlapping hands: ${JSON.stringify(layout)}`);
  await page.screenshot({path:`${out}/${width}x${height}-${count}-selected.png`});
  await page.locator('[data-do="draft-pass"]').click();
  await expect(page.locator('.c-draft-flight .c-card-back')).toHaveCount(count*2,{timeout:12000});
  await page.waitForTimeout(350);
  await page.screenshot({path:`${out}/${width}x${height}-${count}-flight.png`});
  await expect(page.locator('.c-draft-flight')).toHaveCount(0);
 }
 await expect(page.locator('.c-lesson-popover')).toBeVisible();await page.close();console.log(`PASS ${width}x${height}`);
}}finally{await browser.close();}
