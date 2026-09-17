import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {createDenseFixture} from '../src/history-engine/fixtures';
import {CONTENT_VERSION} from '../src/history-engine/content';
import {defaultPreferences} from '../src/history-engine/storage';
const b=await chromium.launch({channel:'chrome',headless:true});
for(const [w,h] of [[1440,1000],[390,844],[3840,2160]]) {
 const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:'reduce'});
 await p.goto('http://localhost:5182'); await p.waitForTimeout(1000); await p.screenshot({path:`artifacts/art-direction/after-title-${w}.png`,fullPage:true});
 await p.locator('[data-ui="demo"]').click();await p.locator('[data-ui="unlock"]').click();await p.waitForTimeout(1500);await p.screenshot({path:`artifacts/art-direction/after-opening-${w}.png`,fullPage:true});
 await p.locator('[data-ui="focus-0"]').click();await p.waitForTimeout(300);await p.screenshot({path:`artifacts/art-direction/after-court-${w}.png`,fullPage:true});
 await p.evaluate(save=>localStorage.setItem('oando-v4-history',JSON.stringify(save)),{version:4,rulesetId:'history-engine-v4',contentVersion:CONTENT_VERSION,game:createDenseFixture(),tutorial:null,preferences:defaultPreferences()});
 await p.reload();await p.locator('[data-ui="resume"]').click();await p.locator('[data-ui="unlock"]').click();await p.waitForTimeout(1500);await p.screenshot({path:`artifacts/art-direction/after-dense-${w}.png`,fullPage:true});await p.locator('[data-ui="focus-0"]').click();await p.waitForTimeout(300);await p.screenshot({path:`artifacts/art-direction/after-dense-court-${w}.png`,fullPage:true});await p.close();
}
await b.close();
