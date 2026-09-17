import {chromium} from '@playwright/test';
import {createTutorial,LESSONS,lessonAction} from '../src/history-engine/tutorial';
import {applyAction} from '../src/history-engine/engine';
import {CONTENT_VERSION} from '../src/history-engine/content';
import {defaultPreferences} from '../src/history-engine/storage';
const b=await chromium.launch({channel:'chrome',headless:true});
for (const [width,height] of [[1440,1000],[390,844],[3840,2160]]) for(const phase of ['select','trade']) {
 const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});let game=createTutorial();let cursor=phase==='select'?0:LESSONS.findIndex(l=>l.title==='Accept this exchange');for(let i=0;i<cursor;i++)game=applyAction(game,lessonAction(game,i)!);
 await p.goto('http://localhost:5182');await p.evaluate(save=>localStorage.setItem('oando-v4-history',JSON.stringify(save)),{version:4,rulesetId:'history-engine-v4',contentVersion:CONTENT_VERSION,game,tutorial:cursor,preferences:defaultPreferences()});await p.reload();await p.locator('[data-ui="resume"]').click();await p.locator('[data-ui="unlock"]').click();await p.waitForTimeout(700);
 await p.screenshot({path:`artifacts/art-direction/guide-${phase}-${width}.png`,fullPage:true});
 if(phase==='select'){await p.locator('[data-guide-card]').first().click();await p.screenshot({path:`artifacts/art-direction/guide-checked-${width}.png`,fullPage:true});}
 else {await p.locator('.h-guide').evaluate(e=>e.scrollTop=e.scrollHeight);await p.screenshot({path:`artifacts/art-direction/guide-trade-bottom-${width}.png`,fullPage:true});}
 await p.close();
}
await b.close();
