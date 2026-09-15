import {test,expect,vi} from 'vitest';
import {createGame,draft,declare,chooseAI,applyAction,type Game} from '../src/engine';
import {card} from '../src/content';
import {emptyProfile} from '../src/storage';
vi.mock('../src/audio',()=>({setSound:vi.fn(),unlockAudio:vi.fn(),sfx:vi.fn()}));
test('winning a campaign court grants exactly one reward and carries it into the next act',async()=>{
 vi.useFakeTimers();document.body.innerHTML='<div id="app"></div><div id="overlay"></div><div id="announcer"></div>';
 let beforeWin:Game|undefined;
 for(let seed=1;seed<200&&!beforeWin;seed++){
  const g=createGame({seed,house:'alba',mode:'campaign',difficulty:'story'});
  while(g.phase==='draft')draft(g,[...g.players[0].hand].sort((a,b)=>Number(card(a).house==='alba')-Number(card(b).house==='alba')).slice(0,3-g.draftStep));
  declare(g,g.players[0].hand.filter(id=>card(id).house==='alba').slice(0,3));
  for(let i=0;i<180&&g.phase!=='over';i++){const prev=structuredClone(g);applyAction(g,chooseAI(g));if(g.winner===0&&prev.turn!==0){beforeWin=prev;break;}}
 }
 expect(beforeWin).toBeTruthy();
 const p=emptyProfile();p.motion=false;p.sound=false;p.game=beforeWin!;p.run={house:'alba',seed:1,act:0,relics:[],path:[0],difficulty:'story',awaitingReward:false};
 localStorage.setItem('oando-witness-v1',JSON.stringify(p));
 await import('../src/main');
 const click=(s:string)=>{const el=document.querySelector<HTMLButtonElement>(s);expect(el,s).toBeTruthy();el!.click();};
 const saved=()=>JSON.parse(localStorage.getItem('oando-witness-v1')!);
 click('[data-start="campaign"]');await vi.advanceTimersByTimeAsync(1000);
 expect(document.querySelector('.result-modal')).toBeTruthy();expect(saved().wins).toBe(1);expect(saved().run.awaitingReward).toBe(true);
 click('[data-result-next]');expect(document.querySelectorAll('[data-reward]').length).toBe(3);
 const reward=document.querySelector<HTMLElement>('[data-reward]')!.dataset.reward!;click('[data-reward]');
 expect(saved().run.act).toBe(1);expect(saved().run.relics).toEqual([reward]);
 click('[data-encounter]');expect(saved().game.players[0].relics).toEqual([reward]);
 expect(saved().wins).toBe(1);expect(saved().renown).toBe(100);
 vi.useRealTimers();
});
