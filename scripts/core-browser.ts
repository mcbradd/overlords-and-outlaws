import { chromium, expect, type Locator, type Page } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { TEACHING } from '../src/core-game/tutorial';
import { CARDS, BY_ID } from '../src/core-game/content';
import { createGame, applyAction, assertInvariants, type CoreState } from '../src/core-game/engine';
import { encodeSave } from '../src/core-game/storage';

// Instrumented regression: authored lesson expectations and imported fixtures.
// This is expressly NOT a blind player or a human visual acceptance decision.
export interface Capture { state: string; path: string; inspected: false; measurements: unknown; }
export interface CoreReport {
  sourceSha: string; dirty: boolean; base: string; viewport: {width:number;height:number};
  browser: string; evidence: string; captures: Capture[]; failures: string[];
  stages: {name:string;passed:boolean;error?:string}[]; tutorialCompleted: boolean;
  startedAt: string; finishedAt?: string; passed?: boolean;
  sourceIdentityNote: string;
  servedAssets: {url:string;sha256:string;bytes:number;contentType:string}[];
}
export const FIXTURE_NAMES = ['sparse-table','dense-four-courts','maximal-hand','empty-deck','native-notice','native-reign','failed-claim','marriage-notice','foreign-reign','incoming-recall','recall-decline','trade-offer','trade-decline','cap-draw'] as const;
const dynastyList = ['alba','plantagenet','tudor','habsburg'] as const;
const id = (dynasty:string,rank:number) => CARDS.find(card=>card.dynasty===dynasty&&card.rank===rank)!.id;
const a = (rank:number)=>id('alba',rank), p=(rank:number)=>id('plantagenet',rank);
function baseFixture(count=2):CoreState {
  const state=createGame({seed:501,dynasties:dynastyList.slice(0,count)});
  for(const player of state.players){player.hand=[];player.played=[];player.court=[id(player.dynasty,1)];player.ruler=player.court[0];}
  return conserve(state);
}
function conserve(state:CoreState):CoreState {
  const used=state.players.flatMap(player=>[...player.hand,...player.court,...player.played]);
  assert.equal(new Set(used).size,used.length);
  state.deck=CARDS.filter(card=>state.dynasties.includes(card.dynasty)&&!used.includes(card.id)).map(card=>card.id);
  assertInvariants(state);return state;
}
const perform=(state:CoreState,action:Omit<Parameters<typeof applyAction>[1],'revision'>)=>applyAction(state,{...action,revision:state.revision});
function nextRound(state:CoreState):CoreState {const round=state.round;while(state.round===round&&state.phase!=='terminal')state=perform(state,{type:'pass',seat:state.active});return state;}
export function coverageFixtures():Map<string,CoreState>{
  const fixtures=new Map<string,CoreState>();
  fixtures.set('sparse-table',createGame({seed:501,dynasties:['alba','plantagenet']}));
  const dense=baseFixture(4);for(const player of dense.players)player.court=CARDS.filter(card=>card.dynasty===player.dynasty).map(card=>card.id);fixtures.set('dense-four-courts',conserve(dense));
  const full=baseFixture(4);full.players[0].hand=[...full.deck];fixtures.set('maximal-hand',conserve(full));
  const empty=baseFixture();empty.players[0].played=[...empty.deck];fixtures.set('empty-deck',conserve(empty));
  let notice=baseFixture();notice.players[0].court.push(a(2));notice.players[0].hand=[a(4),a(8)];notice.players[1].hand=[a(7)];conserve(notice);notice=perform(notice,{type:'name-heir',seat:0,card:a(4),supporter:a(2)});fixtures.set('native-notice',notice);fixtures.set('native-reign',nextRound(notice));
  let failed=perform(notice,{type:'recall',seat:1,card:a(7),target:a(2)});fixtures.set('incoming-recall',failed);fixtures.set('recall-decline',failed);failed=perform(failed,{type:'decline',seat:0});fixtures.set('failed-claim',failed);
  let marriage=baseFixture();marriage.players[0].court.push(a(12));marriage.players[0].hand=[p(11)];conserve(marriage);marriage=perform(marriage,{type:'marry-heir',seat:0,card:p(11),supporter:a(12)});fixtures.set('marriage-notice',marriage);fixtures.set('foreign-reign',nextRound(marriage));
  let trade=baseFixture();trade.players[0].hand=[a(8)];trade.players[1].played=[a(2)];conserve(trade);trade=perform(trade,{type:'trade',seat:0,card:a(8),other:1,request:a(2),recruit:true});fixtures.set('trade-offer',trade);fixtures.set('trade-decline',trade);
  const cap=baseFixture();cap.round=12;fixtures.set('cap-draw',nextRound(cap));
  for(const state of fixtures.values())assertInvariants(state);return fixtures;
}

export async function clickReachable(target:Locator):Promise<void>{
  await expect(target).toBeVisible();await expect(target).toBeEnabled();
  await target.page().evaluate(()=>new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done()))));
  const geometry=await target.evaluate(element=>{
    const r=element.getBoundingClientRect(),v=window.visualViewport;
    const x=r.left+r.width/2,y=r.top+r.height/2,left=v?.offsetLeft??0,top=v?.offsetTop??0;
    const hit=document.elementFromPoint(x,y);
    return {inside:r.left>=left-1&&r.top>=top-1&&r.right<=left+(v?.width??innerWidth)+1&&r.bottom<=top+(v?.height??innerHeight)+1,hit:!!hit&&(hit===element||element.contains(hit)),rect:r.toJSON()};
  });
  assert.ok(geometry.inside&&geometry.hit,`Required control ${target.toString()} is clipped or occluded: ${JSON.stringify(geometry)}`);
  // No force and no automatic offscreen rescue before measuring the real target.
  await target.click();
}

/** Deliberate introduction/form reading only; never rescues game controls. */
async function scrollReaderTo(target:Locator):Promise<void>{
  assert.ok(await target.evaluate(element=>!!element.closest('.c-intro,dialog')),'Scrolling exception applies only to introduction/forms');
  const page=target.page();
  for(let step=0;step<24;step++){
    const box=await target.boundingBox();assert.ok(box,'reading target is absent');
    const viewport=page.viewportSize()!;
    if(box.y>=0&&box.y+box.height<=viewport.height)return;
    const dialog=page.locator('dialog[open]');
    if(await dialog.count()){const panel=await dialog.boundingBox();assert.ok(panel);await page.mouse.move(panel.x+panel.width-6,panel.y+panel.height/2);}
    else await page.mouse.move(viewport.width*.8,viewport.height*.6);
    await page.mouse.wheel(0,box.y<0?-180:180);
    await page.evaluate(()=>new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done()))));
  }
  throw Error(`Introduction/form cannot be read through deliberate scrolling: ${target.toString()}`);
}

export async function runCoreBrowser(options:{base?:string;width?:number;height?:number;output?:string;tutorial?:boolean;fixtures?:boolean;fixtureNames?:string[]}={}):Promise<CoreReport>{
  const base=options.base??process.env.BASE_URL??'http://localhost:5173/';
  const viewport={width:options.width??1440,height:options.height??900};
  const output=options.output??`artifacts/core/browser/${viewport.width}x${viewport.height}`;mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});page.setDefaultTimeout(15000);
  const report:CoreReport={sourceSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),base,viewport,browser:browser.version(),evidence:'Scripted DOM regression and fixture captures; no blind-play or visual-inspection claim.',captures:[],failures:[],stages:[],tutorialCompleted:false,startedAt:new Date().toISOString(),sourceIdentityNote:'sourceSha/dirty identify the harness working tree, not necessarily the served build. servedAssets records SHA-256 of actual successfully loaded response bodies, including HTML, JS, CSS and artwork.',servedAssets:[]};
  const hashedUrls=new Set<string>(),assetReads:Promise<void>[]=[];
  page.on('pageerror',error=>report.failures.push(`pageerror: ${error.message}`));
  page.on('response',response=>{
    if(response.status()>=400)report.failures.push(`HTTP ${response.status()}: ${response.url()}`);
    else if(response.ok()&&!hashedUrls.has(response.url())){
      hashedUrls.add(response.url());
      assetReads.push(response.body().then(bytes=>{report.servedAssets.push({url:response.url(),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,contentType:response.headers()['content-type']??''});}).catch(error=>{report.failures.push(`Could not identify served asset ${response.url()}: ${String(error)}`);}));
    }
  });
  const save=()=>writeFileSync(`${output}/manifest.json`,JSON.stringify(report,null,2));
  async function capture(state:string){
    await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done())));});
    const path=`${output}/${String(report.captures.length).padStart(3,'0')}-${state}.png`;
    await page.screenshot({path,fullPage:false});
    const measurements=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight,visualHeight:visualViewport?.height??innerHeight,dpr:devicePixelRatio},document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},requiredText:[...document.querySelectorAll('.c-guide p,.c-objective')].map(element=>({text:element.textContent,size:getComputedStyle(element).fontSize,alignment:getComputedStyle(element).textAlign,box:element.getBoundingClientRect().toJSON()}))}));
    report.captures.push({state,path,inspected:false,measurements});save();
  }
  async function stage(name:string,work:()=>Promise<void>){try{await work();report.stages.push({name,passed:true});}catch(error){const message=String(error);report.failures.push(`${name}: ${message}`);report.stages.push({name,passed:false,error:message});await capture(`FAILED-${name.replace(/[^a-z0-9-]/gi,'-')}`).catch(()=>{});}save();}
  async function load(){await page.goto(base);await expect(page.locator('[data-do="intro"]')).toBeVisible();}
  async function tutorialContract(){
    await expect(page.locator('.c-game .c-guide')).toHaveCount(1);
    const text=await page.locator('.c-game').innerText();assert.doesNotMatch(text,/\bseals?\b/i);
    assert.equal(await page.locator('.c-game [data-do="menu"],.c-game [data-do="focus"],.c-game [data-do="inspect"]').count(),0);
    const unwanted=await page.locator('.c-game button:not([disabled]),.c-game select:not([disabled])').evaluateAll(elements=>elements.filter(element=>!element.closest('[inert]')).map(element=>(element as HTMLElement).dataset.do??(element as HTMLElement).dataset.choiceType).filter(action=>!['exit','select','choice','generic','continue','finish','watch'].includes(action??'')));
    assert.deepEqual(unwanted,[],'tutorial exposes only taught interaction/Exit');
  }
  try{
    await stage('opening-intro',async()=>{await load();await expect(page.locator('.c-showcase-card')).toHaveCount(3);await capture('opening');await clickReachable(page.locator('[data-do="intro"]'));await capture('introduction');await expect(page.locator('.c-intro')).toContainText('Kenneth MacAlpin');});
    if(options.tutorial!==false)await stage('complete-tutorial',async()=>{
      if(!(await page.locator('[data-do="teach"]').count())){await load();await clickReachable(page.locator('[data-do="intro"]'));}
      await scrollReaderTo(page.locator('[data-do="teach"]'));await capture('introduction-action-after-deliberate-scroll');
      await clickReachable(page.locator('[data-do="teach"]'));await expect(page.locator('.c-game')).toBeVisible();
      for(const [index,step] of TEACHING.entries()){
        const prefix=`tutorial-${String(index+1).padStart(2,'0')}-${step.type}`;
        await expect(page.locator('.c-guide h2')).toHaveText(step.title);await tutorialContract();await capture(`${prefix}-explanation`);
        if(step.seat===0){
          if(step.card){await clickReachable(page.locator(`[data-do="select"][data-card="${step.card}"]`));await capture(`${prefix}-selected`);await clickReachable(page.locator('[data-do="choice"]'));}
          else await clickReachable(page.locator('[data-do="generic"]'));
          await expect(page.locator('[data-do="commit"],[data-do="cancel"]')).toHaveCount(0);
        }else{
          if(index===1){await page.waitForTimeout(4200);await expect(page.locator('[data-do="continue"]')).toHaveCount(0);await expect(page.locator('.c-guide')).toContainText(step.explanation);await capture(`${prefix}-still-awaiting-watch`);}
          await clickReachable(page.locator('[data-do="watch"]'));
        }
        const advance=page.locator(index===TEACHING.length-1?'[data-do="finish"]':'[data-do="continue"]');
        await expect(advance).toBeVisible({timeout:15000});await expect(page.locator('.c-guide')).toContainText(step.outcome);await capture(`${prefix}-outcome`);
        if(index<TEACHING.length-1)await clickReachable(advance);
      }
      await expect(page.locator('.c-game header')).toContainText('Round 3');await expect(page.locator('.c-guide')).toContainText('You win');report.tutorialCompleted=true;
      await clickReachable(page.locator('[data-do="finish"]'));await capture('post-lesson-reflection');
    });
    await stage('setup-input',async()=>{await load();await clickReachable(page.locator('[data-do="setup"]'));await capture('new-table-setup');await page.locator('#player-name').fill('Alexandra of the Long Historical House');await page.locator('#player-name').focus();await capture('name-entry-focused');});
    await stage('simulated-keyboard',async()=>{
      await load();await clickReachable(page.locator('[data-do="setup"]'));await page.locator('#player-name').focus();
      try{await page.setViewportSize({width:viewport.width,height:Math.max(240,Math.round(viewport.height*.55))});await page.locator('#player-name').focus();await capture('name-entry-simulated-keyboard');await expect(page.locator('#player-name')).toBeInViewport();}
      finally{await page.setViewportSize(viewport);}
    });
    if(options.fixtures!==false)for(const [name,state] of coverageFixtures()){
      if(options.fixtureNames&&!options.fixtureNames.includes(name))continue;
      await stage(name,async()=>{
      await load();await clickReachable(page.locator('[data-do="setup"]'));
      const buffer=Buffer.from(encodeSave({game:state,mode:'local',lesson:null,names:state.players.map(player=>`${player.dynasty} player`),motion:false}));
      await page.locator('#save-file').setInputFiles({name:`${name}.json`,mimeType:'application/json',buffer});
      if(state.phase!=='terminal'){await expect(page.locator('[data-do="unlock"]')).toBeVisible();await capture(`${name}-private-handoff`);await clickReachable(page.locator('[data-do="unlock"]'));}
      await expect(page.locator('.c-game')).toBeVisible();await expect(page.locator('.core-table-card').first()).toBeAttached();await capture(name);
      assert.doesNotMatch(await page.locator('.c-game').innerText(),/\bseals?\b/i);
      if(name==='dense-four-courts') {
        await expect(page.locator('.c-guide')).toContainText('Your hand is empty. Pass');
        await expect(page.locator('.c-guide')).toContainText('automatically in 2 seconds');
        await expect(page.locator('[data-do="generic"]')).toHaveText('Pass');
      }
      if(name==='sparse-table'){
        await clickReachable(page.locator('[data-do="menu"]'));await capture('rules-and-table-menu');await clickReachable(page.locator('[data-do="close"]'));
        const inspect=page.locator('.c-hand [data-do="inspect"]').first();await clickReachable(inspect);await capture('reference-inspection');await clickReachable(page.locator('[data-do="close"]'));
      }
      if(['incoming-recall','recall-decline','trade-offer','trade-decline'].includes(name)){
        if(name==='incoming-recall'){
          await clickReachable(page.locator(`[data-do="select"][data-card="${a(8)}"]`));await capture('free-defense-selected');await clickReachable(page.locator('[data-do="choice"]'));
        }else{
          const text=name==='trade-offer'?'Accept trade':name==='trade-decline'?'Decline trade':'Let it happen';
          await clickReachable(page.locator('[data-do="generic"]').filter({hasText:text}));
        }
        await expect(page.locator('[data-do="commit"]')).toHaveCount(0);
        await expect(page.locator('[data-do="unlock"]')).toBeVisible();await capture(`${name}-response-handoff`);await clickReachable(page.locator('[data-do="unlock"]'));await capture(`${name}-resolved`);
      }
    });}
    await stage('invalid-save-recovery',async()=>{await load();await clickReachable(page.locator('[data-do="setup"]'));await page.locator('#save-file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{not valid')});await expect(page.locator('dialog [role="alert"]')).toBeVisible();await capture('invalid-save-recovery');});
  }finally{await Promise.allSettled(assetReads);report.servedAssets.sort((left,right)=>left.url.localeCompare(right.url));report.finishedAt=new Date().toISOString();report.passed=report.failures.length===0;save();await browser.close();}
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [width,height]=(process.env.CORE_VIEWPORT??'1440x900').split('x').map(Number);
  const result=await runCoreBrowser({width,height,output:process.env.CORE_OUTPUT});console.log(JSON.stringify({passed:result.passed,captures:result.captures.length,tutorialCompleted:result.tutorialCompleted,failures:result.failures},null,2));if(!result.passed)process.exitCode=1;
}
