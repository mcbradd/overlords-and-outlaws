import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,applyAction,legalActions,viewForSeat,assertInvariants} from '../src/core-game/engine';
import {createGame as fixture} from './core-established-fixture';
import {chooseAction} from '../src/core-game/ai';
import {DYNASTIES,BY_ID,CARDS} from '../src/core-game/content';
import {encodeSave,decodeSave} from '../src/core-game/storage';
for(const count of [2,3,4]) test(`${count} players: simultaneous 3–2–1, private choices, empty Courts and replay`,()=>{
 for(let seed=1;seed<=30;seed++) {
  let s=createGame({seed,dynasties:DYNASTIES.slice(0,count)});const initial=structuredClone(s);const journal=[];
  assert.ok(s.players.every(p=>p.dynasty===null&&p.hand.length===8&&!p.court.length&&!p.ruler));
  while(s.setup) {
   const before=structuredClone(s),seat=s.active;
   const a=chooseAction(viewForSeat(s,seat),seat).action;journal.push(a);
   for(let other=0;other<count;other++) if(other!==seat) {
    const view=viewForSeat(s,other);assert.equal(view.players[seat].hand,null);
    assert.equal(view.setup?.picks[seat],undefined);
   }
   s=applyAction(s,a);assertInvariants(s);
   if(before.phase==='draft'&&s.setup?.pass===before.setup?.pass) assert.deepEqual(s.players.map(p=>p.hand),before.players.map(p=>p.hand),'packets do not move early');
   if(s.setup) assert.ok(s.players.every(p=>!p.court.length&&p.dynasty===null),'no early declaration disclosure');
   assert.deepEqual(decodeSave(encodeSave({game:s,mode:'solo',names:s.players.map(p=>`Player ${p.seat+1}`),motion:false,lesson:null})).game,s);
  }
  assert.ok(s.players.every(p=>p.hand.length===8&&p.court.length===0&&p.ruler===null&&p.dynasty===null));
  let replay=initial;for(const a of journal)replay=applyAction(replay,a);assert.deepEqual(replay,s);
 }
});
test('return to hand spends the turn, discloses identity, clears passes and breaks a Crown dependency',()=>{
 let s=fixture({seed:1,dynasties:['alba','plantagenet']});
 s.players[0].court=['alba-0','alba-2','alba-1'];s.marriages=[{seat:0,queen:'alba-0',spouse:'alba-1'}];s.players[0].hand=['alba-5'];s.players[1].hand=[];
 const used=s.players.flatMap(p=>[...p.hand,...p.court]);s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
 s=applyAction(s,{type:'name-heir',seat:0,card:'alba-5',revision:s.revision});
 s=applyAction(s,{type:'pass',seat:1,revision:s.revision});
 s=applyAction(s,{type:'withdraw',seat:0,card:'alba-5',revision:s.revision});
 assert.equal(s.active,1);assert.equal(s.crown,null);assert.deepEqual(s.passes,[]);assert.ok(s.players[0].hand.includes('alba-5'));assert.ok(s.knownHands[0].includes('alba-5'));
 assert.throws(()=>applyAction(s,{type:'withdraw',seat:1,card:'alba-0',revision:s.revision}));
});

test('first Recruit sets the Dynasty of an empty Court; different players may share it',()=>{
 let s=createGame({seed:1,dynasties:['alba','plantagenet']});s.setup=null;s.phase='action';
 s.players[0].hand=['alba-0'];s.players[1].hand=['alba-2'];s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!['alba-0','alba-2'].includes(c.id)).map(c=>c.id);
 for(const card of ['alba-0','alba-2'])s=applyAction(s,{type:'recruit',seat:s.active,card,revision:s.revision});
 assert.deepEqual(s.players.map(p=>p.dynasty),['alba','alba']);assert.deepEqual(s.players.map(p=>p.ruler),['alba-0','alba-2']);assertInvariants(s);
});
test('Recall of a ruler promotes their spouse, including a foreign spouse',()=>{
 let s=fixture({seed:1,dynasties:['alba','plantagenet']});s.players[0].court.push('plantagenet-1');s.marriages=[{seat:0,queen:'alba-0',spouse:'plantagenet-1'}];s.players.forEach(p=>p.hand=[]);
 const used=s.players.flatMap(p=>p.court);s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
 s=applyAction(s,{type:'withdraw',seat:0,card:'alba-0',revision:s.revision});assert.equal(s.players[0].ruler,'plantagenet-1');assert.equal(s.players[0].dynasty,'alba');assert.equal(s.marriages.length,0);assertInvariants(s);
});
