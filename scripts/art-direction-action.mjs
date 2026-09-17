import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await p.goto('http://localhost:5182');
await p.locator('[data-ui="demo"]').click();await p.locator('[data-ui="unlock"]').click();await p.waitForTimeout(1200);
await p.locator('[data-action]').first().click();await p.screenshot({path:'artifacts/art-direction/after-action-review.png',fullPage:true});await p.locator('[data-ui="commit"]').click();await p.waitForTimeout(1500);await p.screenshot({path:'artifacts/art-direction/after-action.png',fullPage:true});
await p.locator('[data-inspect]').first().click();await p.screenshot({path:'artifacts/art-direction/after-inspection.png',fullPage:true});await p.keyboard.press('Escape');
const fit=await p.evaluate(async()=>{
const {faceHTML}=await import('/src/history-engine/face.ts');const {SOURCES}=await import('/src/history-engine/content.ts');
document.body.innerHTML='<div id="proof" style="display:grid;grid-template-columns:repeat(4,340px);gap:20px"></div>';
const proof=document.querySelector('#proof');proof.innerHTML=SOURCES.map(c=>`<div data-id="${c.id}">${faceHTML(c.id,false)}</div>`).join('');await document.fonts.ready;
return [...proof.children].flatMap(wrapper=>{const face=wrapper.querySelector('article'),r=face.getBoundingClientRect();return [...face.querySelectorAll('.h-card-ink>*')].filter(e=>e.getBoundingClientRect().bottom>r.bottom-1).map(e=>({id:wrapper.dataset.id,tag:e.tagName,overflow:e.getBoundingClientRect().bottom-r.bottom}));});
});writeFileSync('artifacts/art-direction/reference-fit.json',JSON.stringify(fit,null,2));console.log(fit);await b.close();
