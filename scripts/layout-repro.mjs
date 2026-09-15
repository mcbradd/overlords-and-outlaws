// Historical V1 reproduction; requires the d3410b9 V1 UI. Current regressions are in full-table.ts and visual-v2.mjs.
import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1024,height:600}});
await page.goto('http://localhost:5173');
await page.evaluate(()=>{const raw=localStorage.getItem('oando-witness-v1');if(raw)localStorage.removeItem('oando-witness-v1');});
await page.reload();
await page.locator('[data-start="tutorial"]').click();
for(let step=0;step<3;step++) {for(let n=0;n<3-step;n++)await page.locator('.draft-card:not(.selected)').first().click();await page.locator('[data-draft-confirm]').click();}
for(let n=0;n<3;n++)await page.locator('.draft-card:not([disabled]):not(.selected)').first().click();
await page.locator('[data-draft-confirm]').click();
const result=await page.evaluate(()=>Array.from(document.querySelectorAll('.rival-cards,.own-cards,.hand-row,.board-sidebar')).map(e=>({area:e.className,height:e.clientHeight,content:e.scrollHeight,overflow:getComputedStyle(e).overflowY})).filter(e=>e.content>e.height&&['auto','scroll'].includes(e.overflow)));
console.log(JSON.stringify(result));await browser.close();if(result.length)process.exitCode=1;
