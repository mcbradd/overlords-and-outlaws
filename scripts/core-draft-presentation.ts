import {chromium,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome'});const out='artifacts/core/draft';mkdirSync(out,{recursive:true});
try {for(const [width,height] of (process.env.DRAFT_VIEWPORTS ? JSON.parse(process.env.DRAFT_VIEWPORTS) : [[1920,1080],[1536,864],[1366,768],[1440,900],[2560,1440],[360,800],[375,667],[390,844],[412,915],[430,932],[844,390],[414,896],[384,832],[1280,720],[1366,1366],[393,873],[360,780]])) {
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto(process.env.BASE_URL??'http://localhost:5173');await page.locator('[data-do="intro"]').click();await page.locator('[data-do="teach"]').click();
 for(const count of [3,2,1]) {
  await expect(page.locator('#draft-title')).toContainText(`Select ${count}`);
  await expect(page.locator('[data-do="draft-pass"]')).toHaveText(`Select ${count} More to Pass`);
  const bounds=await page.locator('.c-draft-modal').boundingBox();const hand=await page.locator('.c-hand').boundingBox();if(!bounds||!hand||bounds.y+bounds.height>hand.y)throw Error('Dialog overlaps hand');
  for(let i=0;i<count;i++) {
   const card=page.locator('.next-interaction [data-do="select"]');await card.focus();await card.click();
   await expect(page.locator('[data-do="draft-pass"]')).toHaveText(i===count-1?'PASS':`Select ${count-i-1} More to Pass`);
  }
  if(count===3) {await page.locator('.c-draft-selected [data-do="select"]').last().click();await expect(page.locator('[data-do="draft-pass"]')).toHaveText('Select 1 More to Pass');await page.locator('.next-interaction [data-do="select"]').click();}
  const layout=await page.evaluate(()=>({header:document.querySelector('.c-game > header')!.getBoundingClientRect().top,hand:Math.min(...[...document.querySelectorAll('.c-card-pick')].map(e=>e.getBoundingClientRect().top)),opponents:Math.max(...[...document.querySelectorAll('[data-draft-hand]')].map(e=>e.getBoundingClientRect().bottom))}));
  if(layout.header < -1 || layout.opponents>layout.hand) throw Error(`Clipped header or overlapping hands: ${JSON.stringify(layout)}`);
  await page.screenshot({path:`${out}/${width}-${count}-selected.png`});
  await page.locator('[data-do="draft-pass"]').click();
  await expect(page.locator('.c-draft-flight .c-card-back')).toHaveCount(count*2,{timeout:12000});
  await page.waitForTimeout(350);
  await page.screenshot({path:`${out}/${width}-${count}-flight.png`});
  await expect(page.locator('.c-draft-flight')).toHaveCount(0);
 }
 await expect(page.locator('.c-lesson-popover')).toBeVisible();await page.close();console.log(`PASS ${width}x${height}`);
}}finally{await browser.close();}
