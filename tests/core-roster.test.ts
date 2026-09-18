import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,DYNASTIES,FEMALE_RANKS} from '../src/core-game/content';
import {createGame,applyAction,legalActions,viewForSeat,assertInvariants} from '../src/core-game/engine';
import {chooseAction} from '../src/core-game/ai';
test('Every Dynasty has the same gender at every rank and exactly six women and seven men',()=>{
 for(const dynasty of DYNASTIES){const cards=CARDS.filter(c=>c.dynasty===dynasty);assert.equal(cards.length,13);assert.deepEqual(cards.filter(c=>c.gender==='female').map(c=>c.rank),FEMALE_RANKS);assert.equal(cards.filter(c=>c.gender==='male').length,7);assert.deepEqual(cards.map(c=>c.rank),Array.from({length:13},(_,i)=>i+1));}
});
test('High-card draft cannot skip Ruler, Marriage, then Claim on three separate turns',()=>{
 let s=createGame({seed:42,dynasties:['alba','plantagenet']});
 while(s.setup)s=applyAction(s,chooseAction(viewForSeat(s,s.active),s.active).action);
 assert.ok(s.players.every(p=>!p.court.length&&p.ruler===null&&p.dynasty===null));
 const cards=CARDS.filter(c=>c.dynasty==='alba'),id=(rank:number)=>cards.find(c=>c.rank===rank)!.id;
 s.players[0].hand=[13,12,11,10].map(id);s.players[1].hand=[];s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!s.players[0].hand.includes(c.id)).map(c=>c.id);assertInvariants(s);
 const choices=()=>legalActions(viewForSeat(s,0),0);
 assert.ok(!choices().some(a=>['name-heir','marry-heir'].includes(a.type)));
 s=applyAction(s,choices().find(a=>a.type==='recruit'&&a.card===id(13))!);assert.equal(s.active,1);assert.equal(s.crown,null);assert.equal(choices().length,0);
 s=applyAction(s,{type:'pass',seat:1,revision:s.revision});assert.ok(!choices().some(a=>a.type==='name-heir'));
 s=applyAction(s,choices().find(a=>a.type==='marry-heir'&&a.card===id(12))!);assert.equal(s.active,1);assert.equal(s.crown,null);assert.equal(choices().length,0);
 s=applyAction(s,{type:'pass',seat:1,revision:s.revision});s=applyAction(s,choices().find(a=>a.type==='name-heir'&&a.card===id(11))!);assert.equal(s.active,1);assert.equal(s.crown?.stage,'notice');assert.equal(s.result,null);
});
