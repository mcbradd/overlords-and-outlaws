import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await p.goto('http://localhost:5182');
await p.locator('[data-ui="demo"]').click();await p.locator('[data-ui="unlock"]').click();await p.waitForTimeout(1200);
await p.locator('[data-action]').first().click();await p.screenshot({path:'artifacts/art-direction/after-action-review.png',fullPage:true});await p.locator('[data-ui="commit"]').click();await p.waitForTimeout(1500);await p.screenshot({path:'artifacts/art-direction/after-action.png',fullPage:true});
await p.locator('[data-inspect]').first().click();await p.screenshot({path:'artifacts/art-direction/after-inspection.png',fullPage:true});await p.keyboard.press('Escape');
const fit=await p.evaluate(async()=>{
const {cardCanvas,HISTORY_FACE}=await import('/src/history-engine/face.ts');const {SOURCES}=await import('/src/history-engine/content.ts');
if(SOURCES.length!==92)throw new Error('Expected all 92 current History cards');
const failures=[];
for(const source of SOURCES){const canvas=await cardCanvas(source.id,false);const fields=JSON.parse(canvas.dataset.fields||'[]');if(!fields.some(f=>f.label==='name')||!fields.some(f=>f.label==='rules'))throw new Error(`Missing measured print fields: ${source.id}`);for(const field of fields){const box=HISTORY_FACE[field.label];if(field.x<box.x-1||field.x+field.width>box.x+box.width+1||field.y<box.y-1||field.y+field.height>box.y+box.height+1)failures.push({id:source.id,field});}if(canvas.dataset.textOverflow==='true')failures.push({id:source.id,overflow:true});}
return failures;
});writeFileSync('artifacts/art-direction/reference-fit.json',JSON.stringify(fit,null,2));console.log(fit);await b.close();
