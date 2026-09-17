import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('artifacts/art-direction',{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await p.goto('https://mcbradd.github.io/overlords-and-outlaws-prod/');await p.waitForTimeout(1500);await p.screenshot({path:'artifacts/art-direction/before-title.png'});
await p.locator('[data-ui="demo"]').click();await p.locator('[data-ui="unlock"]').click();await p.waitForTimeout(2000);await p.screenshot({path:'artifacts/art-direction/before-board.png',fullPage:true});
await p.goto('https://mcbradd.github.io/overlords-and-outlaws-prod/?legacy=1');await p.waitForTimeout(1700);await p.screenshot({path:'artifacts/art-direction/legacy-title.png'});
await b.close();
