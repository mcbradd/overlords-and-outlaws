import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts/v2',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173');await page.screenshot({path:'artifacts/v2/home.png'});
await page.locator('[data-start="lesson"]').click();await page.locator('.modal .primary[data-close]').click();
await page.waitForTimeout(800);await page.screenshot({path:'artifacts/v2/board-1440.png'});
await page.locator('.hand-cards .royal-card').first().click();await page.screenshot({path:'artifacts/v2/selected-1440.png'});
for(const [w,h]of [[1024,600],[844,390],[667,375]]){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(150);await page.screenshot({path:`artifacts/v2/board-${w}.png`});console.log(JSON.stringify(await page.evaluate(()=>({w:innerWidth,h:innerHeight,docW:document.documentElement.scrollWidth,docH:document.documentElement.scrollHeight,scrolls:[...document.querySelectorAll('.arena,.hand-cards,.decision-panel,.piece-container')].filter(e=>e.scrollHeight>e.clientHeight+2&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>e.className),end:document.querySelector('[data-end]').getBoundingClientRect().toJSON(),decision:document.querySelector('.decision-panel').getBoundingClientRect().toJSON()}))));}
console.log(JSON.stringify({errors}));await browser.close();if(errors.length)process.exitCode=1;
