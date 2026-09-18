import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,applyAction,legalActions,viewForSeat,assertInvariants} from '../src/core-game/engine';
import {createGame as fixture} from './core-established-fixture';
import {chooseAction} from '../src/core-game/ai';
import {DYNASTIES,BY_ID,CARDS} from '../src/core-game/content';
import {encodeSave,decodeSave} from '../src/core-game/storage';
for(const count of [2,3,4]) test(`${count} players: simultaneous 3–2–1, private choices, three-card declaration and replay`,()=>{
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
  assert.ok(s.players.every(p=>p.hand.length===5&&p.court.length===3&&p.ruler===p.court[0]&&p.court.every(id=>BY_ID[id].dynasty===p.dynasty)));
  let replay=initial;for(const a of journal)replay=applyAction(replay,a);assert.deepEqual(replay,s);
 }
});
test('repair reveals 2/2/2/2 hand, requires a different-suit discard and conserves cards',()=>{
 let s=createGame({seed:8,dynasties:DYNASTIES});s.phase='declare';s.setup!.pass=0;
 s.players.forEach((p,i)=>p.hand=DYNASTIES.flatMap(d=>CARDS.filter(c=>c.dynasty===d).slice(i*2,i*2+2).map(c=>c.id)));
 const used=s.players.flatMap(p=>p.hand);s.deck=CARDS.filter(c=>!used.includes(c.id)).map(c=>c.id);
 // Start at the documented public top-draw boundary for the first failed hand.
 const drawn=s.deck.shift()!;s.players[0].hand.push(drawn);s.setup!.repairCard=drawn;s.phase='repair';s.knownHands[0]=[...s.players[0].hand];assertInvariants(s);
 assert.ok(legalActions(viewForSeat(s,0),0).every(a=>BY_ID[a.card!].dynasty!==BY_ID[drawn].dynasty));
 s=applyAction(s,legalActions(viewForSeat(s,0),0)[0]);
 while(s.setup) s=applyAction(s,chooseAction(viewForSeat(s,s.active),s.active).action);
 assert.equal(s.deck.length,20);assert.ok(s.players.every(p=>p.hand.length===5&&p.court.length===3));
});
test('return to hand spends the turn, discloses identity, clears passes and breaks a Crown dependency',()=>{
 let s=fixture({seed:1,dynasties:['alba','plantagenet']});
 s.players[0].court=['alba-0','alba-2'];s.players[0].hand=['alba-5'];s.players[1].hand=[];
 const used=s.players.flatMap(p=>[...p.hand,...p.court]);s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
 s=applyAction(s,{type:'name-heir',seat:0,card:'alba-5',supporter:'alba-2',revision:s.revision});
 s=applyAction(s,{type:'pass',seat:1,revision:s.revision});
 s=applyAction(s,{type:'withdraw',seat:0,card:'alba-2',revision:s.revision});
 assert.equal(s.active,1);assert.equal(s.crown,null);assert.deepEqual(s.passes,[]);assert.ok(s.players[0].hand.includes('alba-2'));assert.ok(s.knownHands[0].includes('alba-2'));
 assert.throws(()=>applyAction(s,{type:'withdraw',seat:1,card:'alba-0',revision:s.revision}));
});

test('two players may declare the same Dynasty without a seat assignment',()=>{
 let s=createGame({seed:1,dynasties:['alba','plantagenet']});s.phase='declare';s.setup!.pass=0;
 s.players[0].hand=['alba-0','alba-2','alba-4','plantagenet-0','plantagenet-2','plantagenet-3','plantagenet-4','plantagenet-5'];
 s.players[1].hand=['alba-5','alba-6','alba-7','alba-8','alba-9','plantagenet-6','plantagenet-7','plantagenet-8'];
 const used=s.players.flatMap(p=>p.hand);s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
 for(const card of ['alba-0','alba-2','alba-4','alba-5','alba-6','alba-7']) s=applyAction(s,{type:'declare-pick',seat:s.active,card,revision:s.revision});
 assert.deepEqual(s.players.map(p=>p.dynasty),['alba','alba']);assertInvariants(s);
});
test('returning a married Queen breaks the link and sends the foreign spouse to Played',()=>{
 let s=fixture({seed:1,dynasties:['alba','plantagenet']});
 const q=CARDS.find(c=>c.dynasty==='alba'&&c.rank===12)!.id,foreign=CARDS.find(c=>c.dynasty==='plantagenet'&&c.rank===11)!.id;
 s.players[0].court.push(q);s.players[0].hand=[foreign];s.players[1].hand=[];
 const used=s.players.flatMap(p=>[...p.hand,...p.court]);s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
 s=applyAction(s,{type:'marry-heir',seat:0,card:foreign,supporter:q,revision:s.revision});
 s=applyAction(s,{type:'pass',seat:1,revision:s.revision});
 s=applyAction(s,{type:'withdraw',seat:0,card:q,revision:s.revision});
 assert.ok(s.players[0].hand.includes(q));assert.ok(s.players[0].played.includes(foreign));assert.equal(s.marriages.length,0);assert.equal(s.crown,null);
});
