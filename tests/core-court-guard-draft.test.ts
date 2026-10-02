import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, createTutorial, applyAction, legalActions, viewForSeat, assertInvariants, courtProtectors } from '../src/core-game/engine';
import { CARDS, DYNASTIES } from '../src/core-game/content';
import { chooseDraftPacket, chooseAction } from '../src/core-game/ai';
import { TEACHING, isTeachingAction } from '../src/core-game/tutorial';
import { encodeSave, decodeSave } from '../src/core-game/storage';

for (const count of [2, 3, 4]) test(`${count} players: received draft cards stay concealed, immutable and excluded from every later packet`, () => {
  let game = createGame({seed:501,dynasties:DYNASTIES.slice(0,count)});
  const original = game.players.map(p=>[...p.hand]);
  const passed = game.players.map(()=>[] as string[]);
  while(game.setup) {
    const seat=game.active, before=structuredClone(game), view=viewForSeat(game,seat);
    const received=game.setup.received[seat] ?? [];
    assert.equal(view.players[seat].hand!.length,8-received.length);
    assert.equal(view.players[seat].faceDownCount,received.length);
    for(const id of received) {
      assert.ok(!JSON.stringify(view).includes(`"${id}"`),'identity absent from the whole recipient view');
      assert.ok(!legalActions(view,seat).some(a=>a.card===id));
      assert.throws(()=>applyAction(game,{type:'draft-pick',card:id,seat,revision:game.revision}));
    }
    assert.deepEqual(game,before,'rejected repassing does not change any state');
    assert.ok(chooseDraftPacket(view).every(id=>original[seat].includes(id)));
    if(received.length) {
      const alternate=structuredClone(game), id=received[0], replacement=alternate.deck.shift()!;
      alternate.players[seat].hand[alternate.players[seat].hand.indexOf(id)]=replacement;
      alternate.setup!.received[seat][0]=replacement;alternate.deck.push(id);
      assertInvariants(alternate);
      assert.deepEqual(viewForSeat(alternate,seat),view,'concealed rank and Dynasty do not affect observation');
      assert.deepEqual(chooseDraftPacket(viewForSeat(alternate,seat)),chooseDraftPacket(view));
    }
    const action=chooseAction(view,seat).action;
    assert.ok(original[seat].includes(action.card!));passed[seat].push(action.card!);
    game=applyAction(game,action);
    assert.deepEqual(decodeSave(encodeSave({game,lesson:null,mode:'solo',names:game.players.map(p=>String(p.seat)),motion:false})).game,game);
  }
  for(const p of game.players) {
    assert.equal(new Set(passed[p.seat]).size,6);
    assert.equal(viewForSeat(game,p.seat).players[p.seat].faceDownCount,0);
    assert.deepEqual(viewForSeat(game,p.seat).players[p.seat].hand,p.hand,'all eight reveal at draft completion');
  }
});

for (const count of [2,3,4]) test(`${count} players: defeat every protector before challenging either office; defending does not unlock them`,()=>{
  let game=createGame({seed:1,dynasties:DYNASTIES.slice(0,count)});
  game.setup=null;game.phase='action';game.active=1;
  game.players.forEach(p=>{p.hand=[];p.court=[];p.played=[];});
  Object.assign(game.players[0],{dynasty:'alba',ruler:'alba-0',court:['alba-0','alba-3','alba-2','alba-8'],hand:['alba-9']});
  game.crown={seat:0,oldRuler:'alba-0',heir:'alba-3',stage:'notice',reignRound:null};
  game.marriages=[{seat:0,queen:'alba-0',spouse:'alba-8'}];
  game.players[1].hand=['alba-4','alba-5','alba-12'];
  const used=game.players.flatMap(p=>[...p.hand,...p.court]);
  game.deck=CARDS.filter(c=>game.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
  assertInvariants(game);
  const offices=['alba-0','alba-3'];
  const probe=()=>{
    const view=viewForSeat(game,1), actions=legalActions(view,1);
    for(const target of offices) {
      assert.ok(!actions.some(a=>a.target===target));
      const before=structuredClone(game);
      assert.throws(()=>applyAction(game,{type:'recall',card:game.players[1].hand[0],target,seat:1,revision:game.revision}));
      assert.deepEqual(game,before);
    }
  };
  probe();
  game=applyAction(game,{type:'recall',card:'alba-4',target:'alba-2',seat:1,revision:game.revision});
  game=applyAction(game,{type:'defend',card:'alba-9',seat:0,revision:game.revision});
  game.active=1;probe();assert.equal(courtProtectors(game,0).length,2);
  // A later round permits another attempt against the surviving protector.
  game.attempts={};
  game=applyAction(game,{type:'recall',card:'alba-5',target:'alba-2',seat:1,revision:game.revision});
  game=applyAction(game,{type:'decline',seat:0,revision:game.revision});game.active=1;probe();
  game=applyAction(game,{type:'recall',card:'alba-12',target:'alba-8',seat:1,revision:game.revision});
  game=applyAction(game,{type:'decline',seat:0,revision:game.revision});
  assert.ok(game.crown,'losing a spouse preserves a native ruler/heir claim');
  game.players[1].hand.push(game.deck.shift()!);game.active=1;
  // Give a conserved same-Dynasty challenger to test both now-open offices.
  const lead=game.deck.find(id=>id.startsWith('alba-'))!;
  game.deck.splice(game.deck.indexOf(lead),1);game.players[1].hand.push(lead);assertInvariants(game);
  const actions=legalActions(viewForSeat(game,1),1);
  for(const target of offices) assert.ok(actions.some(a=>a.type==='recall'&&a.target===target));
});

test('tutorial demonstrates the last protector retreating before an heir challenge, through ordinary actions',()=>{
  let game=createTutorial();let taughtProtection=false;
  for(let cursor=0;cursor<TEACHING.length;cursor++) {
    const step=TEACHING[cursor];
    if(step.type==='recall' && step.target===game.crown?.heir) {
      assert.equal(courtProtectors(game,0).length,0);taughtProtection=true;
    }
    const action=legalActions(viewForSeat(game,step.seat),step.seat).find(a=>isTeachingAction(a,cursor));
    assert.ok(action,`legal tutorial cursor ${cursor}: ${step.title}`);
    game=applyAction(game,action);
  }
  assert.ok(taughtProtection);assert.equal(game.result?.winner,0);
});
