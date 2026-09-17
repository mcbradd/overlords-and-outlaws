import { chromium, expect, type Page, type Locator } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { clickReachable } from './core-browser';
import { CARDS } from '../src/core-game/content';

// H01–H12 contract: docs/reviews/BUILD-5-BROWSER-HARNESS-AMENDMENT.md.
// Supplemental instrumented checks, never novice or actual-device evidence.
const base=process.env.BASE_URL??'http://localhost:5173/';
const output=process.env.CORE_EXTENDED_OUTPUT??'artifacts/core/extended';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
type Viewport={width:number;height:number};
type Row={name:string;viewport:Viewport;status:'running'|'passed'|'failed';error?:string;captures:{state:string;path:string;inspected:false}[];assets:{url:string;sha256:string;bytes:number}[];facts:Record<string,unknown>};
const report={base,browser:browser.version(),startedAt:new Date().toISOString(),evidence:'Chromium DOM/keyboard/touch/environment regression. Each screenshot remains visually uninspected. Hardware validation and blind play are separate.',rows:[] as Row[],finishedAt:'',passed:false};
const save=()=>writeFileSync(`${output}/manifest.json`,JSON.stringify(report,null,2));
async function geometry(target:Locator,insets={top:0,right:0,bottom:0,left:0}){
  await expect(target).toBeVisible();
  const value=await target.evaluate((element,insets)=>{const r=element.getBoundingClientRect(),v=visualViewport,l=v?.offsetLeft??0,t=v?.offsetTop??0;return {box:r.toJSON(),inside:r.width>0&&r.height>0&&r.left>=l+insets.left-1&&r.top>=t+insets.top-1&&r.right<=l+(v?.width??innerWidth)-insets.right+1&&r.bottom<=t+(v?.height??innerHeight)-insets.bottom+1};},insets);
  assert.ok(value.inside,`${target.toString()} leaves usable viewport: ${JSON.stringify(value)}`);return value;
}
async function tabTo(page:Page,selector:string){
  for(let count=0;count<60;count++){
    const target=page.locator(selector);
    if(await target.count()&&await target.evaluate(element=>element===document.activeElement)){await geometry(target);return;}
    await page.keyboard.press('Tab');
  }
  throw Error(`Keyboard cannot reach ${selector} in 60 Tab presses`);
}
// Explicit reader/form navigation only. Never call this for a game action,
// response or tutorial guide control to conceal an overflowing layout.
async function scrollReadingSurface(page:Page,selector:string,modal=false){
  for(let step=0;step<24;step++){
    const box=await page.locator(selector).boundingBox();assert.ok(box,`missing ${selector}`);
    const viewport=page.viewportSize()!;
    if(box.y>=0&&box.y+box.height<=viewport.height)return;
    if(modal){const panel=await page.locator('dialog').boundingBox();assert.ok(panel);await page.mouse.move(panel.x+panel.width-6,panel.y+panel.height/2);}
    else await page.mouse.move(viewport.width*.7,viewport.height*.6);
    await page.mouse.wheel(0,box.y<0?-180:180);
    await page.evaluate(()=>new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done()))));
  }
  throw Error(`Reading/form surface cannot scroll ${selector} into a comfortable region`);
}
const color=(css:string)=>{const channels=css.match(/[\d.]+/g)?.slice(0,3).map(Number);assert.equal(channels?.length,3,`opaque RGB required: ${css}`);return channels!;};
const luminance=(rgb:number[])=>rgb.map(value=>{const x=value/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
async function contrast(target:Locator){const css=await target.evaluate(element=>{const c=getComputedStyle(element);return{fg:c.color,bg:c.backgroundColor,height:element.getBoundingClientRect().height,outline:c.outlineStyle,outlineWidth:c.outlineWidth};});const x=luminance(color(css.fg)),y=luminance(color(css.bg));const ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);assert.ok(ratio>=4.5,`primary contrast ${ratio.toFixed(2)} from ${JSON.stringify(css)}`);assert.ok(css.height>=44);return{...css,ratio};}
async function stage(name:string,viewport:Viewport,work:(page:Page,capture:(state:string)=>Promise<void>,row:Row)=>Promise<void>,touch=false){
  if(process.env.CORE_EXTENDED_CASES&&!process.env.CORE_EXTENDED_CASES.split(',').includes(name))return;
  const row:Row={name,viewport,status:'running',captures:[],assets:[],facts:{touchEmulation:touch}};report.rows.push(row);save();
  const context=await browser.newContext({viewport,reducedMotion:'reduce',hasTouch:touch,isMobile:touch});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  const reads:Promise<void>[]=[],seen=new Set<string>(),errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.ok()&&!seen.has(response.url())){seen.add(response.url());reads.push(response.body().then(body=>{row.assets.push({url:response.url(),sha256:createHash('sha256').update(body).digest('hex'),bytes:body.length});}).catch(()=>{}));}});
  async function capture(state:string){await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done())));});const path=`${output}/${name}-${String(row.captures.length).padStart(2,'0')}-${state}.png`;await page.screenshot({path});row.captures.push({state,path,inspected:false});save();}
  try{await work(page,capture,row);assert.deepEqual(errors,[],'unexpected page exceptions');row.status='passed';}
  catch(error){row.status='failed';row.error=String(error);await capture('FAILED').catch(()=>{});}
  finally{await Promise.allSettled(reads);await context.close();save();console.log(`${name}: ${row.status}${row.error?` — ${row.error}`:''}`);}
}
const load=async(page:Page)=>{await page.goto(base,{waitUntil:'domcontentloaded'});await expect(page.locator('[data-do="intro"]')).toBeVisible();};
async function setup(page:Page){await load(page);await clickReachable(page.locator('[data-do="setup"]'));}
async function localStart(page:Page,dynasty='alba'){
  await setup(page);await page.locator('#mode').selectOption('local');await page.locator('#dynasty').selectOption(dynasty);await page.locator('#seed').fill('501');await clickReachable(page.locator('[data-do="begin"]'));await expect(page.locator('[data-do="unlock"]')).toBeVisible();await clickReachable(page.locator('[data-do="unlock"]'));await expect(page.locator('.c-game')).toBeVisible();
}
try{
  for(const dynasty of ['alba','plantagenet','tudor','habsburg'])await stage(`dynasty-${dynasty}`,{width:1440,height:900},async(page,capture)=>{
    await localStart(page,dynasty);await expect(page.locator('.c-hand-heading')).toContainText(new RegExp(dynasty,'i'));await expect(page.locator('.c-hand-heading')).toContainText('2 cards');const founder=CARDS.find(card=>card.dynasty===dynasty&&card.founder)!;await expect(page.locator(`[data-table-card="${founder.id}"]`)).toBeAttached();await capture('selected-native-family');
  });
  await stage('primary-hover-focus',{width:390,height:844},async(page,capture,row)=>{
    await load(page);const primary=page.locator('[data-do="intro"]');row.facts.normal=await contrast(primary);await primary.hover();row.facts.hover=await contrast(primary);await capture('hover');await page.mouse.move(0,0);await tabTo(page,'[data-do="intro"]');row.facts.focus=await contrast(primary);assert.notEqual((row.facts.focus as {outline:string}).outline,'none');await capture('keyboard-focus');
    await page.keyboard.press('Enter');await clickReachable(page.locator('[data-do="teach"]'));await expect(page.locator('.c-game')).toBeVisible();await clickReachable(page.locator('[data-do="select"][data-card="alba-2"]'));await clickReachable(page.locator('[data-do="choice"]'));const commit=page.locator('[data-do="commit"]');await commit.hover();row.facts.confirmHover=await contrast(commit);await capture('confirm-hover');
  });
  await stage('reference-rules',{width:1440,height:900},async(page,capture,row)=>{
    await localStart(page);await clickReachable(page.locator('[data-do="menu"]'));await clickReachable(page.locator('[data-do="rules"]'));
    const aids=page.locator('.core-reference-aid');await expect(aids).toHaveCount(12);row.facts.aids=await aids.locator('img').evaluateAll(images=>images.map(image=>({alt:(image as HTMLImageElement).alt,loaded:(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0})));
    assert.ok((row.facts.aids as {loaded:boolean}[]).every(aid=>aid.loaded));const text=(row.facts.aids as {alt:string}[]).map(aid=>aid.alt).join('\n');assert.match(text,/exchange/i);assert.match(text,/Ace/);assert.match(text,/12/);assert.match(text,/supporter/i);
    // Deliberate reader scrolling is allowed for a long reference, unlike
    // moving a clipped game commitment into view to hide layout failures.
    for(const aidId of ['1','2','3','4a','4b','5a','5b','6a','6b','7a','7b','8'])assert.ok((row.facts.aids as {alt:string}[]).some(aid=>aid.alt.startsWith(`Rule aid ${aidId}:`)),`missing rule topic/part ${aidId}`);
    for(let index=0;index<12;index++){await aids.nth(index).scrollIntoViewIfNeeded();await capture(`aid-${index+1}`);}
  });
  for(const [label,viewport,insets] of [
    ['portrait',{width:390,height:844},{top:47,right:0,bottom:34,left:0}],
    ['landscape',{width:844,height:390},{top:0,right:44,bottom:21,left:44}],
  ] as const)await stage(`safe-area-${label}`,viewport,async(page,capture,row)=>{
    const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets});row.facts.syntheticInsets=insets;
    await load(page);await capture('opening-first-screen');await scrollReadingSurface(page,'[data-do="intro"]');await capture('opening-action-after-deliberate-scroll');await clickReachable(page.locator('[data-do="intro"]'));await scrollReadingSurface(page,'[data-do="teach"]');await geometry(page.locator('[data-do="teach"]'),insets);await capture('introduction');
    await clickReachable(page.locator('[data-do="teach"]'));await expect(page.locator('.c-game')).toBeVisible();await geometry(page.locator('[data-do="exit"]'),insets);await geometry(page.locator('[data-do="select"][data-card="alba-2"]'),insets);await capture('table');
    row.facts.actualPadding=await page.locator('.c-game').evaluate(element=>{const c=getComputedStyle(element);return{top:parseFloat(c.paddingTop),right:parseFloat(c.paddingRight),bottom:parseFloat(c.paddingBottom),left:parseFloat(c.paddingLeft)};});
    for(const edge of ['top','right','bottom','left'] as const)assert.ok((row.facts.actualPadding as Record<string,number>)[edge]>=insets[edge],`${edge} safe inset not applied`);
  });
  for(const field of ['player-name','seed'])await stage(`keyboard-viewport-${field}`,{width:390,height:844},async(page,capture,row)=>{
    await setup(page);await tabTo(page,`#${field}`);await page.setViewportSize({width:390,height:464});row.facts.simulation='Viewport reduced to464px; not an OS keyboard';await geometry(page.locator(`#${field}`),{top:24,right:0,bottom:24,left:0});const original=await page.locator(`#${field}`).inputValue();await capture('focused-input-context');await scrollReadingSurface(page,'[data-do="begin"]',true);await geometry(page.locator('[data-do="begin"]'));assert.equal(await page.locator(`#${field}`).inputValue(),original);await capture('submit-after-deliberate-modal-scroll');await scrollReadingSurface(page,'[data-do="close"]',true);await geometry(page.locator('[data-do="close"]'));await capture('close-after-deliberate-modal-scroll');await clickReachable(page.locator('[data-do="close"]'));await expect(page.locator('dialog')).toHaveCount(0);
  });
  await stage('slow-required-art',{width:390,height:844},async(page,capture,row)=>{
    let release!:()=>void;const gate=new Promise<void>(done=>release=done);let held=0;
    await page.route('**/art/characters/**',async route=>{held++;await gate;await route.continue().catch(()=>{});});
    try{await load(page);await clickReachable(page.locator('[data-do="intro"]'));await clickReachable(page.locator('[data-do="teach"]'));await expect(page.locator('h1')).toHaveText('Preparing your table');await expect(page.locator('.c-game')).toHaveCount(0);assert.ok(held>0);await capture('held-loading');}
    finally{release();}
    await expect(page.locator('.c-game')).toBeVisible();await expect(page.locator('.c-hand .core-face img')).toHaveCount(2);row.facts.delayedRequests=held;await capture('completed-loading');
  });
  await stage('failed-art-retry',{width:390,height:844},async(page,capture,row)=>{
    let fail=true,blocked=0;await page.route('**/art/characters/alba-2-*',async route=>{if(fail){blocked++;await route.abort('failed');}else await route.continue();});
    await load(page);await clickReachable(page.locator('[data-do="intro"]'));await clickReachable(page.locator('[data-do="teach"]'));await expect(page.locator('[data-do="retry"]')).toBeVisible();await expect(page.locator('.c-game')).toHaveCount(0);await geometry(page.locator('[data-do="retry"]'));await capture('readable-failure');fail=false;await clickReachable(page.locator('[data-do="retry"]'));await expect(page.locator('.c-game')).toBeVisible();row.facts.expectedFailedRequests=blocked;assert.ok(blocked>0);await capture('retry-complete');
  });
  await stage('page-magnification-200',{width:1440,height:900},async(page,capture,row)=>{
    await load(page);const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});row.facts.visualViewport=await page.evaluate(()=>({scale:visualViewport?.scale,width:visualViewport?.width,height:visualViewport?.height}));assert.equal((row.facts.visualViewport as {scale:number}).scale,2);await tabTo(page,'[data-do="intro"]');await capture('scale-two-focused-opening');
  });
  await stage('text-reflow-200',{width:1440,height:900},async(page,capture,row)=>{
    await load(page);await page.addStyleTag({content:':root { font-size: 32px !important; }'});row.facts.simulation='Root font doubled from16 to32px; distinct from browser zoom';await capture('double-text-opening-first-screen');await scrollReadingSurface(page,'[data-do="intro"]');await capture('double-text-opening-action');await clickReachable(page.locator('[data-do="intro"]'));await scrollReadingSurface(page,'[data-do="teach"]');await geometry(page.locator('[data-do="teach"]'));await capture('double-text-introduction');
  });
  await stage('keyboard-first-move',{width:390,height:844},async(page,capture)=>{
    await load(page);for(const selector of ['[data-do="intro"]','[data-do="teach"]','[data-do="select"][data-card="alba-2"]','[data-do="choice"]','[data-do="commit"]']){await expect(page.locator(selector)).toBeAttached();await tabTo(page,selector);await capture(`focus-${selector.match(/data-do="([^"]+)/)?.[1]}`);await page.keyboard.press('Enter');}
    await expect(page.locator('[data-do="continue"]')).toBeVisible();await expect(page.locator('.c-guide')).toContainText('Malcolm III now supports');await tabTo(page,'[data-do="continue"]');await capture('keyboard-outcome');
  });
  await stage('touch-first-move',{width:390,height:844},async(page,capture)=>{
    await load(page);for(const selector of ['[data-do="intro"]','[data-do="teach"]','[data-do="select"][data-card="alba-2"]','[data-do="choice"]','[data-do="commit"]']){await geometry(page.locator(selector));await page.locator(selector).tap();}
    await expect(page.locator('[data-do="continue"]')).toBeVisible();await expect(page.locator('.c-guide')).toContainText('Malcolm III now supports');await capture('touch-outcome');
  },true);
}finally{await browser.close();report.finishedAt=new Date().toISOString();report.passed=report.rows.every(row=>row.status==='passed');save();}
if(!report.passed)process.exitCode=1;
