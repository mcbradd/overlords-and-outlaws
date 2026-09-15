import {test,expect,vi} from 'vitest';
import {card} from '../src/content';
import type {Profile} from '../src/storage';

vi.mock('../src/audio',()=>({setSound:vi.fn(),unlockAudio:vi.fn(),sfx:vi.fn()}));
test('tutorial, save during rival turns, archive, daily, and campaign navigation work through the UI',async()=>{
 vi.useFakeTimers();
 document.body.innerHTML='<div id="app"></div><div id="overlay"></div><div id="announcer"></div>';
 localStorage.clear();
 HTMLElement.prototype.animate=vi.fn(()=>({finished:Promise.resolve()} as unknown as Animation));
 const profile=()=>JSON.parse(localStorage.getItem('oando-witness-v1')!) as Profile;
 const click=(selector:string)=>{const el=document.querySelector<HTMLButtonElement>(selector);expect(el,selector).toBeTruthy();expect(el!.disabled,selector).toBe(false);el!.click();};
 await import('../src/main');
 expect(document.title!==undefined).toBe(true);
 click('[data-start="tutorial"]');
 for(let step=0;step<3;step++){
  const g=profile().game!;
  const ids=[...g.players[0].hand].sort((a,b)=>Number(card(a).house==='alba')-Number(card(b).house==='alba')).slice(0,3-step);
  ids.forEach(id=>click('[data-card="'+id+'"]'));
  click('[data-draft-confirm]');
 }
 expect(profile().game!.phase).toBe('declare');
 profile().game!.players[0].hand.filter(id=>card(id).house==='alba').slice(0,3).forEach(id=>click('[data-card="'+id+'"]'));
 click('[data-draft-confirm]');
 expect(profile().game!.phase).toBe('play');
 click('[data-hint]');click('[data-commit]');
 const firstActionCount=profile().game!.actions;
 click('[data-save-exit]');click('[data-resume]');
 await vi.advanceTimersByTimeAsync(1600);
 click('[data-save-exit]');click('[data-resume]');
 await vi.advanceTimersByTimeAsync(3500);
 expect(profile().game!.actions).toBe(firstActionCount+2);
 expect(profile().game!.turn).toBe(0);
 let turns=0;
 while(profile().game!.phase!=='over'&&turns++<70){click('[data-hint]');click('[data-commit]');await vi.advanceTimersByTimeAsync(3500);}
 expect(profile().game!.phase).toBe('over');
 expect(document.querySelector('.result-modal')).toBeTruthy();
 expect(profile().tutorial).toBe(true);
 const renown=profile().renown;
 click('[data-result-next]');
 expect(document.querySelectorAll('[data-house]').length).toBe(6);
 click('[data-launch]');expect(document.querySelectorAll('[data-encounter]').length).toBe(2);
 click('[data-encounter="0"]');expect(profile().game!.mode).toBe('campaign');
 click('[data-save-exit]');click('[data-nav="archive"]');
 expect(document.querySelectorAll('.archive-card').length).toBe(14);
 click('[data-archive-house="tudor"]');click('.archive-card');
 expect(document.querySelector('.inspect-modal')).toBeTruthy();click('[data-close]');
 click('[data-dialog="settings"]');click('[data-toggle="motion"]');
 expect(profile().motion).toBe(false);click('[data-close]');
 click('[data-nav="home"]');click('[data-start="daily"]');
 const dailyHouse=document.querySelector('.house-choice.chosen')!.getAttribute('data-house');
 click('[data-house="alba"]');expect(document.querySelector('.house-choice.chosen')!.getAttribute('data-house')).toBe(dailyHouse);
 click('[data-launch]');click('[data-confirm-launch]');
 expect(profile().game!.mode).toBe('daily');expect(profile().game!.difficulty).toBe('standard');
 expect(profile().renown).toBe(renown);
 vi.useRealTimers();
});
