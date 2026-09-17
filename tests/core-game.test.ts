import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, createTutorial, applyAction, legalActions, viewForSeat, assertInvariants, canDefend } from '../src/core-game/engine';
import { CARDS, BY_ID } from '../src/core-game/content';
import { CARDS as ORIGINAL_CARDS } from '../src/content';
import { chooseAction } from '../src/core-game/ai';

// Acceptance cases written before the core implementation. U28–U32 require
// storage/tutorial UI adapters and are deliberately not claimed by this file.
type State = ReturnType<typeof createGame>;
type Action = Parameters<typeof applyAction>[1];
type Dynasty = State['dynasties'][number];
const dynasties: Dynasty[] = ['alba', 'plantagenet', 'tudor', 'habsburg'];
const card = (dynasty: Dynasty, rank: number) => {
  const found = CARDS.find(c => c.dynasty === dynasty && c.rank === rank);
  assert.ok(found, `${dynasty} ${rank}`);
  return found.id;
};
const a = (rank: number) => card('alba', rank);
const p = (rank: number) => card('plantagenet', rank);
function fixture(count = 2): State {
  const state = createGame({ seed: 501, dynasties: dynasties.slice(0, count) });
  for (const player of state.players) {
    player.hand = [];
    player.played = [];
    player.court = [card(player.dynasty, 1)];
    player.ruler = player.court[0];
  }
  state.active = 0;
  state.first = 0;
  return conserve(state);
}
function conserve(state: State): State {
  const located = state.players.flatMap(player => [...player.hand, ...player.court, ...player.played]);
  assert.equal(new Set(located).size, located.length, 'fixture must never duplicate cards');
  state.deck = CARDS.filter(c => state.dynasties.includes(c.dynasty) && !located.includes(c.id)).map(c => c.id);
  assertInvariants(state);
  return state;
}
function act(state: State, action: Omit<Action, 'revision'>): State {
  const original = structuredClone(state);
  const next = applyAction(state, { ...action, revision: state.revision });
  assert.deepEqual(state, original, 'reducer input immutable');
  assertInvariants(next);
  return next;
}
function rejected(state: State, action: Omit<Action, 'revision'>, revision = state.revision) {
  const original = structuredClone(state);
  assert.throws(() => applyAction(state, { ...action, revision }));
  assert.deepEqual(state, original, 'invalid operation must not spend or disclose');
}
function passRound(state: State): State {
  const round = state.round;
  for (let count = 0; state.round === round && state.phase !== 'terminal' && count < state.players.length + 1; count++)
    state = act(state, { type: 'pass', seat: state.active });
  assert.ok(state.round !== round || state.phase === 'terminal');
  return state;
}
function nativeNotice(): State {
  const s = fixture();
  s.players[0].court.push(a(2));
  s.players[0].hand = [a(4)];
  conserve(s);
  return act(s, { type: 'name-heir', seat: 0, card: a(4), supporter: a(2) });
}
function removeByRecall(state: State, target: string, lead: string): State {
  // Legal adversarial position: assign an unused deck card to the opponent,
  // rebuild conserved fixture, and execute both real contest stages.
  state = structuredClone(state);
  assert.ok(state.deck.includes(lead), 'test lead must come from the deck');
  state.players[1].hand.push(lead);
  state.active = 1;
  conserve(state);
  state = act(state, { type: 'recall', seat: 1, card: lead, target });
  return act(state, { type: 'decline', seat: 0 });
}
function marriageNotice(): State {
  const s = fixture();
  assert.equal(BY_ID[a(12)].queen, true);
  s.players[0].court.push(a(12));
  s.players[0].hand = [p(11)];
  conserve(s);
  return act(s, { type: 'marry-heir', seat: 0, card: p(11), supporter: a(12) });
}

test('U01/U02: explicit immutable rank allocation preserves original identities and names', () => {
  assert.equal(CARDS.length, 52);
  assert.equal(new Set(CARDS.map(c => c.id)).size, 52);
  for (const dynasty of dynasties) {
    assert.deepEqual(CARDS.filter(c => c.dynasty === dynasty).map(c => c.rank).sort((x,y) => x-y), Array.from({length:13}, (_,i) => i+1));
    assert.equal(BY_ID[card(dynasty, 1)].founder, true);
  }
  for (const c of CARDS) assert.equal(c.name, ORIGINAL_CARDS.find(original => original.id === c.id)?.name);
  assert.equal(a(13), 'alba-9', 'rank is not collector/id order');
  assert.equal(p(13), 'plantagenet-5');
  assert.ok(CARDS.some(c => c.queen && c.rank !== 12), 'Queen is a separate role');
  assert.equal(canDefend(a(12), a(13)), true);
  assert.equal(canDefend(a(13), a(12)), false);
});

test('U03/U47: seeded setup has one native Founder and two cards, selected suits only, no seals', () => {
  for (const count of [2,3,4]) {
    const options = { seed: 901, dynasties: dynasties.slice(0,count) };
    const state = createGame(options);
    assert.deepEqual(state, createGame(options));
    assertInvariants(state);
    for (const player of state.players) {
      assert.deepEqual(player.court, [card(player.dynasty,1)]);
      assert.equal(player.ruler, player.court[0]);
      assert.equal(player.hand.length, 2);
      assert.equal('seals' in player, false);
      assert.equal(player.played.length, 0);
    }
    const ids = [...state.deck,...state.players.flatMap(player => [...player.hand,...player.court])];
    assert.equal(ids.length,count*13);
    assert.equal(new Set(ids).size, count*13);
    assert.ok(ids.every(id => options.dynasties.includes(BY_ID[id].dynasty)));
  }
  assert.throws(() => createGame({seed:1,dynasties:['alba','alba']}));
});

test('U04/U05/U23: Recruit spends a native hand card, invalid zones/turns reject, rulerless recovery', () => {
  const s = fixture();
  s.players[0].hand = [a(2),p(2)];
  conserve(s);
  rejected(s,{type:'recruit',seat:0,card:p(2)});
  rejected(s,{type:'recruit',seat:0,card:a(3)});
  rejected(s,{type:'recruit',seat:1,card:p(2)});
  let next = act(s,{type:'recruit',seat:0,card:a(2)});
  assert.ok(next.players[0].court.includes(a(2)));
  assert.ok(!next.players[0].hand.includes(a(2)));
  next = fixture();
  next.players[0].court = [];
  next.players[0].ruler = null;
  next.players[0].played = [a(1)];
  next.players[0].hand = [a(2)];
  conserve(next);
  rejected(next,{type:'recruit',seat:0,card:a(1)});
  assert.equal(act(next,{type:'recruit',seat:0,card:a(2)}).players[0].ruler,a(2));
});

test('U06/U07/U08/U09/U11/U12: Recall commits before a single atomic response', () => {
  const s = fixture();
  s.players[0].hand = [p(3),a(3)];
  s.players[1].hand = [p(4),p(2),a(4)];
  conserve(s);
  rejected(s,{type:'recall',seat:0,card:a(3),target:p(1)});
  rejected(s,{type:'recall',seat:0,card:a(3),target:a(1)});
  const pending = act(s,{type:'recall',seat:0,card:p(3),target:p(1)});
  assert.equal(pending.phase,'recall');
  assert.ok(pending.players[0].played.includes(p(3)));
  assert.ok(pending.players[1].court.includes(p(1)));
  for (const answer of [p(2),a(4)]) rejected(pending,{type:'defend',seat:1,card:answer});
  rejected(pending,{type:'pass',seat:0});
  rejected(pending,{type:'pass',seat:1});
  rejected(pending,{type:'recruit',seat:1,card:p(4)});
  const defended = act(pending,{type:'defend',seat:1,card:p(4)});
  assert.equal(defended.phase,'action');
  assert.equal(defended.active,1);
  assert.ok(defended.players[1].played.includes(p(4)));
  assert.ok(defended.players[1].court.includes(p(1)));
  rejected(defended,{type:'defend',seat:1,card:p(4)});
  const declined = act(pending,{type:'decline',seat:1});
  assert.ok(declined.players[0].played.includes(p(1)));
  assert.equal(declined.players[1].ruler,null);
  assert.ok(!declined.players[1].court.includes(p(1)));
});

test('U10: every lead/answer rank and suit pair follows strict comparison with the Ace exception', () => {
  for (const lead of CARDS) for (const answer of CARDS) {
    const expected = lead.dynasty === answer.dynasty && (answer.rank > lead.rank || answer.rank === 1 && lead.rank >= 11);
    assert.equal(canDefend(lead.id,answer.id), expected, `${lead.id} answered by ${answer.id}`);
  }
});

test('U13/U14/U15/U24/U46: pass rhythm, return ownership and unconditional one-card refill', () => {
  let s = fixture(3);
  s.players[2].hand = [card('tudor',2)];
  conserve(s);
  s = act(s,{type:'pass',seat:0});
  s = act(s,{type:'pass',seat:1});
  s = act(s,{type:'recruit',seat:2,card:card('tudor',2)});
  assert.equal(s.round,1);
  assert.equal(s.active,0);
  assert.equal(s.passes.length,0);
  assert.ok(legalActions(viewForSeat(s,0),0).some(action => action.type === 'pass'));
  let r = fixture();
  r.players[0].hand = [a(2),a(3)];
  r.players[0].played = [p(3)];
  r.players[1].hand = [p(2),p(4)];
  conserve(r);
  const deck = [...r.deck];
  r = passRound(r);
  assert.equal(r.round,2);
  assert.equal(r.first,1);
  assert.equal(r.active,1);
  assert.deepEqual(r.players[0].hand,[a(2),a(3),p(3),deck[1]]);
  assert.deepEqual(r.players[1].hand,[p(2),p(4),deck[0]]);
  assert.equal(r.players[0].played.length,0);
  let empty = fixture();
  empty.players[0].hand = [...empty.deck];
  empty.deck = [];
  assertInvariants(empty);
  empty = passRound(empty);
  assert.equal(empty.deck.length,0);
  assert.equal(empty.players[1].hand.length,0);
  assert.ok(empty.players[0].hand.every(Boolean));
});

test('U16/U17/U18/U21: three distinct people, notice, next-start succession and full reign', () => {
  const s = fixture();
  s.players[0].hand = [a(4)];
  conserve(s);
  rejected(s,{type:'name-heir',seat:0,card:a(4),supporter:a(1)});
  rejected(s,{type:'name-heir',seat:0,card:a(4),supporter:a(2)});
  let claim = nativeNotice();
  assert.equal(claim.crown?.stage,'notice');
  assert.equal(claim.result,null);
  assert.equal(claim.players[0].ruler,a(1));
  claim = passRound(claim);
  assert.equal(claim.crown?.stage,'reign');
  assert.equal(claim.players[0].ruler,a(4));
  assert.equal(claim.result,null);
  claim = removeByRecall(claim,a(1),a(7));
  assert.equal(claim.crown?.heir,a(4));
  claim = passRound(claim);
  assert.equal(claim.result?.winner,0);
  assert.equal(claim.round,2);
});

test('U19/U20: each required dependency fails immediately and later development cannot restore it', () => {
  for (const target of [a(1),a(2),a(4)]) {
    const failed = removeByRecall(nativeNotice(),target,a(7));
    assert.equal(failed.crown,null, `notice loses ${target}`);
  }
  for (const target of [a(2),a(4)]) {
    let failed = removeByRecall(passRound(nativeNotice()),target,a(7));
    assert.equal(failed.crown,null, `reign loses ${target}`);
    failed.players[0].hand.push(a(8));
    failed.active = 0;
    conserve(failed);
    failed = act(failed,{type:'recruit',seat:0,card:a(8)});
    assert.equal(failed.crown,null);
    assert.equal(failed.result,null);
  }
});

test('U22: completed legitimate reign precedes round 12 draw; otherwise no winner invented', () => {
  let win = passRound(nativeNotice());
  win.round = 12;
  assert.ok(win.crown);
  win.crown.reignRound = 12;
  win = passRound(win);
  assert.equal(win.result?.winner,0);
  let draw = fixture();
  draw.round = 12;
  draw = passRound(draw);
  assert.equal(draw.phase,'terminal');
  assert.equal(draw.result?.winner,null);
  assert.match(draw.result?.reason ?? '',/unsettled|draw/i);
  assert.equal(draw.round,12);
});

test('U27/U34: hidden hand/deck permutations produce identical seat observations', () => {
  const s = fixture(3);
  s.players[0].hand = [a(2)];
  s.players[1].hand = [p(2)];
  s.players[2].hand = [card('tudor',2)];
  conserve(s);
  const other = structuredClone(s);
  [other.players[1].hand[0],other.deck[0]] = [other.deck[0],other.players[1].hand[0]];
  other.deck.reverse();
  assertInvariants(other);
  assert.deepEqual(viewForSeat(s,0),viewForSeat(other,0));
  assert.deepEqual(legalActions(viewForSeat(s,0),0),legalActions(viewForSeat(other,0),0));
  const publicText = JSON.stringify(viewForSeat(s,0));
  assert.ok(!publicText.includes(p(2)));
  assert.ok(!publicText.includes(card('tudor',2)));
});

function tradePosition() {
  const s = fixture();
  s.players[0].hand = [a(8)];
  s.players[1].hand = [p(2)];
  s.players[1].played = [a(2)];
  return conserve(s);
}
test('U35/U36/U37/U39: Played Trade binds once, commits both and rejects forgery', () => {
  const s = tradePosition();
  rejected(s,{type:'trade',seat:0,card:a(8),other:1,request:p(1)});
  rejected(s,{type:'trade',seat:0,card:a(8),other:0,request:a(2)});
  rejected(s,{type:'trade',seat:0,card:a(8),other:1,request:card('tudor',2)});
  const pending = act(s,{type:'trade',seat:0,card:a(8),other:1,request:a(2)});
  assert.equal(pending.phase,'trade');
  rejected(pending,{type:'accept',seat:0});
  rejected(pending,{type:'accept',seat:1},pending.revision-1);
  const accepted = act(pending,{type:'accept',seat:1});
  assert.ok(accepted.players[0].played.includes(a(2)));
  assert.ok(accepted.players[1].played.includes(a(8)));
  assert.ok(!accepted.players[0].hand.includes(a(2)));
  assert.ok(!accepted.players[1].hand.includes(a(8)));
  assert.equal(accepted.passes.length,0);
  let declined = act(pending,{type:'decline',seat:1});
  assert.ok(declined.players[0].hand.includes(a(8)));
  assert.equal(declined.active,1);
  assert.deepEqual(declined.passes,[0]);
  declined = act(declined,{type:'recruit',seat:1,card:p(2)});
  rejected(declined,{type:'trade',seat:0,card:a(8),other:1,request:a(2)});
  const absent = tradePosition();
  absent.players[1].hand = [a(3),p(2)];
  conserve(absent);
  absent.players[1].played = [];
  conserve(absent);
  rejected(absent,{type:'trade',seat:0,card:a(8),other:1,request:a(2)});

});

test('U38: binding lower-native Trade recruitment is optional and cannot claim', () => {
  let s = tradePosition();
  s = act(s,{type:'trade',seat:0,card:a(8),other:1,request:a(2),recruit:true});
  s = act(s,{type:'accept',seat:1});
  assert.ok(s.players[0].court.includes(a(2)));
  assert.ok(!s.players[0].played.includes(a(2)));
  assert.equal(s.crown,null);
  for (const [offer,request] of [[a(2),a(8)],[a(8),p(8)],[a(8),p(2)]]) {
    const invalid = fixture();
    invalid.players[0].hand = [offer];
    invalid.players[1].played = [request];
    conserve(invalid);
    rejected(invalid,{type:'trade',seat:0,card:offer,other:1,request,recruit:true});
  }
  const recovery = tradePosition();
  recovery.players[0].court = [];
  recovery.players[0].ruler = null;
  recovery.players[0].played = [a(1)];
  conserve(recovery);
  const offered = act(recovery,{type:'trade',seat:0,card:a(8),other:1,request:a(2),recruit:true});
  assert.equal(act(offered,{type:'accept',seat:1}).players[0].ruler,a(2));
});

test('U40/U41: foreign succession requires actual Queen role and equal/adjacent rank', () => {
  for (const rank of [11,12,13]) {
    const s = fixture();
    s.players[0].court.push(a(12));
    s.players[0].hand = [p(rank)];
    conserve(s);
    const next = act(s,{type:'marry-heir',seat:0,card:p(rank),supporter:a(12)});
    assert.equal(next.crown?.supporter,a(12));
    assert.equal(next.crown?.heir,p(rank));
    assert.ok(next.marriages.some(link => link.queen === a(12) && link.spouse === p(rank)));
  }
  const invalid = fixture();
  invalid.players[0].court.push(a(12));
  invalid.players[0].hand = [p(10),p(2)];
  conserve(invalid);
  rejected(invalid,{type:'marry-heir',seat:0,card:p(10),supporter:a(12)});
  rejected(invalid,{type:'marry-heir',seat:0,card:p(2),supporter:a(1)});
  const nonQueen = fixture();
  nonQueen.players[0].court.push(a(4));
  nonQueen.players[0].hand = [p(4)];
  conserve(nonQueen);
  assert.equal(BY_ID[a(4)].queen,false);
  rejected(nonQueen,{type:'marry-heir',seat:0,card:p(4),supporter:a(4)});
  const alreadyPaired = marriageNotice();
  alreadyPaired.crown = null;
  alreadyPaired.active = 0;
  alreadyPaired.players[0].hand.push(p(13));
  conserve(alreadyPaired);
  rejected(alreadyPaired,{type:'marry-heir',seat:0,card:p(13),supporter:a(12)});
});

test('U42/U43/U44: marriage support and captured ownership remain physically truthful', () => {
  for (const transfer of [false,true]) {
    const starting = transfer ? passRound(marriageNotice()) : marriageNotice();
    const failed = removeByRecall(starting,a(12),a(7));
    assert.equal(failed.crown,null);
    assert.ok(failed.players[0].played.includes(p(11)));
    assert.ok(!failed.players[0].court.includes(p(11)));
    assert.notEqual(failed.players[0].ruler,p(11));
    assert.equal(failed.marriages.length,0);
  }
  const captured = removeByRecall(marriageNotice(),p(11),p(7));
  assert.ok(captured.players[1].played.includes(p(11)));
  assert.ok(!captured.players[0].played.includes(p(11)));
  assert.equal(captured.marriages.length,0);
  const retained = removeByRecall(passRound(marriageNotice()),a(1),a(7));
  assert.equal(retained.crown?.heir,p(11));
  assert.equal(retained.players[0].ruler,p(11));
});

test('U45: a supported foreign ruler can initiate native succession after a failed claim', () => {
  let s = passRound(marriageNotice());
  // A failed earlier claim can leave an independently supported foreign ruler.
  s.crown = null;
  s.active = 0;
  s.players[0].court.push(a(8));
  s.players[0].hand.push(a(9));
  conserve(s);
  s = act(s,{type:'name-heir',seat:0,card:a(9),supporter:a(8)});
  assert.equal(s.crown?.oldRuler,p(11));
  assert.equal(s.crown?.heir,a(9));
});

test('U48: attempt mark is per attacker/target, not immunity from other players', () => {
  let s = fixture(3);
  s.players[0].hand = [p(2),p(3)];
  s.players[1].hand = [p(4)];
  s.players[2].hand = [p(5)];
  conserve(s);
  s = act(s,{type:'recall',seat:0,card:p(2),target:p(1)});
  s = act(s,{type:'defend',seat:1,card:p(4)});
  s = act(s,{type:'pass',seat:1});
  assert.ok(legalActions(viewForSeat(s,2),2).some(action => action.type === 'recall' && action.target === p(1)));
  s = act(s,{type:'pass',seat:2});
  rejected(s,{type:'recall',seat:0,card:p(3),target:p(1)});
});

test('U33/U49: the exact teaching deal and legal sequence win only at end of round three', () => {
  let s = createTutorial();
  assert.deepEqual(s.players[0].hand,[a(2),a(4)]);
  assert.deepEqual(s.players[1].hand,[a(3),p(2)]);
  assert.deepEqual(s.players[0].court,[a(1)]);
  assert.deepEqual(s.players[1].court,[p(1)]);
  const steps: Omit<Action,'revision'>[] = [
    {type:'recruit',seat:0,card:a(2)},
    {type:'recall',seat:1,card:a(3),target:a(2)},
    {type:'defend',seat:0,card:a(4)},
    {type:'pass',seat:0}, {type:'recruit',seat:1,card:p(2)}, {type:'pass',seat:0}, {type:'pass',seat:1},
    {type:'pass',seat:1}, {type:'name-heir',seat:0,card:a(5),supporter:a(2)},
    {type:'recall',seat:1,card:a(3),target:a(5)}, {type:'defend',seat:0,card:a(4)},
    {type:'pass',seat:0}, {type:'recruit',seat:1,card:p(3)}, {type:'pass',seat:0}, {type:'pass',seat:1},
    {type:'pass',seat:0}, {type:'recall',seat:1,card:a(3),target:a(5)}, {type:'defend',seat:0,card:a(4)},
    {type:'pass',seat:0}, {type:'recruit',seat:1,card:p(4)}, {type:'pass',seat:0}, {type:'pass',seat:1},
  ];
  const replayStart = structuredClone(s);
  for (const [index,action] of steps.entries()) {
    assert.equal(s.result,null,`premature result before move ${index+1}`);
    s = act(s,action);
  }
  assert.equal(s.result?.winner,0);
  assert.equal(s.round,3);
  assert.equal(s.players[0].ruler,a(5));
  let replay = replayStart;
  for (const action of steps) replay = act(replay,action);
  assert.deepEqual(replay,s,'U34 deterministic authoritative action replay');
});

test('U25/U26: seeded adversarial legal walks conserve every identity and terminate', () => {
  const originalContent = structuredClone(CARDS);
  for (const count of [2,3,4]) for (const seed of [52,501,5005]) {
    let s = createGame({seed,dynasties:dynasties.slice(0,count)});
    let step = 0;
    let random = seed;
    while (s.phase !== 'terminal' && step < 3000) {
      const available = s.players.flatMap(player => legalActions(viewForSeat(s,player.seat),player.seat));
      assert.ok(available.length,'every nonterminal position has a visible legal continuation');
      random = (Math.imul(random,1664525)+1013904223) >>> 0;
      const selected = available[random % available.length];
      s = act(s,selected);
      step++;
    }
    assert.equal(s.phase,'terminal',`seed ${seed}, ${count} players exceeded finite bound`);
    assert.ok(s.round <= 12);
  }
  assert.deepEqual(CARDS,originalContent,'gameplay never rewrites printed identities');
});

test('I05: AI decisions use only the projected view and always choose a legal action', () => {
  const s = fixture(3);
  s.players[0].hand = [a(2),p(3)];
  s.players[1].hand = [p(2)];
  conserve(s);
  const alternate = structuredClone(s);
  [alternate.players[1].hand[0],alternate.deck[0]] = [alternate.deck[0],alternate.players[1].hand[0]];
  alternate.deck.reverse();
  const first = chooseAction(viewForSeat(s,0),0);
  assert.deepEqual(first,chooseAction(viewForSeat(alternate,0),0));
  assert.ok(first);
  assert.ok(legalActions(viewForSeat(s,0),0).some(action => JSON.stringify(action) === JSON.stringify(first.action)));
  assert.ok(first.reason.length > 0);
  assert.ok(first.policyVersion.length > 0);
});

test('I05: AI contests an imminent rival succession and defends its own required person', () => {
  let s = passRound(nativeNotice());
  s.players[1].hand.push(a(7));
  s.active = 1;
  conserve(s);
  const chosen = chooseAction(viewForSeat(s,1),1);
  assert.ok(chosen);
  assert.equal(chosen.action.type,'recall');
  assert.ok([a(2),a(4)].includes(chosen.action.target!));
  s.players[0].hand.push(a(8));
  conserve(s);
  s = act(s,{type:'recall',seat:1,card:a(7),target:a(4)});
  const defense = chooseAction(viewForSeat(s,0),0);
  assert.ok(defense);
  assert.equal(defense.action.type,'defend');
  assert.equal(defense.action.card,a(8));
});

// A01–A10 attrition correction: written after approved amendment and before correction code.
test('A02/A03: successful Recall exchanges its exact lead and permits earned native recovery without a deck', () => {
  let s = fixture();
  s.players[0].hand = [p(3)];
  conserve(s);
  s.players[0].hand.push(...s.deck);
  s.deck = [];
  assertInvariants(s);
  s = act(s,{type:'recall',seat:0,card:p(3),target:p(1)});
  const pending = structuredClone(s);
  s = act(s,{type:'decline',seat:1});
  assert.ok(s.players[0].played.includes(p(1)));
  assert.ok(!s.players[0].played.includes(p(3)));
  assert.deepEqual(s.players[1].played,[p(3)]);
  assert.equal(s.players[1].hand.length,0);
  assert.equal(s.players[1].ruler,null);
  rejected(s,{type:'decline',seat:1});
  assert.ok(pending.players[0].played.includes(p(3)), 'pending input unchanged');
  s = passRound(s);
  assert.deepEqual(s.players[1].hand,[p(3)]);
  assert.equal(s.players[1].ruler,null,'boundary does not restore office');
  assert.equal(s.deck.length,0);
  s = act(s,{type:'recruit',seat:1,card:p(3)});
  assert.equal(s.players[1].ruler,p(3));
  assert.equal(s.crown,null,'a new ruler never repairs a failed claim');
});

test('A04/A05: capture exchanges lead without inheriting relationships; Defend retains both original owners', () => {
  const queenLost = removeByRecall(marriageNotice(),a(12),a(7));
  assert.ok(queenLost.players[0].played.includes(a(7)));
  assert.ok(queenLost.players[0].played.includes(p(11)));
  assert.ok(queenLost.players[1].played.includes(a(12)));
  assert.ok(!queenLost.players[1].played.includes(a(7)));
  assert.equal(queenLost.marriages.length,0);
  const spouseLost = removeByRecall(marriageNotice(),p(11),p(7));
  assert.ok(spouseLost.players[0].played.includes(p(7)));
  assert.ok(spouseLost.players[1].played.includes(p(11)));
  assert.ok(!spouseLost.players[1].played.includes(p(7)));
  assert.equal(spouseLost.marriages.length,0);
  let defended = fixture();
  defended.players[0].hand = [p(3)];
  defended.players[1].hand = [p(4)];
  conserve(defended);
  defended = act(defended,{type:'recall',seat:0,card:p(3),target:p(1)});
  defended = act(defended,{type:'defend',seat:1,card:p(4)});
  assert.deepEqual(defended.players[0].played,[p(3)]);
  assert.deepEqual(defended.players[1].played,[p(4)]);
  assert.ok(defended.players[1].court.includes(p(1)));
});

test('A06: AI prices a costly high-for-low seizure differently when the target becomes a real Crown threat', () => {
  const s = fixture();
  s.players[0].hand = [p(13)];
  conserve(s);
  const quiet = chooseAction(viewForSeat(s,0),0);
  assert.ok(!(quiet.action.type === 'recall' && quiet.action.target === p(1)), 'do not pay a King merely to remove a lone nonclaiming Founder');
  s.players[1].court.push(p(2),p(4));
  s.players[1].ruler = p(4);
  s.crown = {seat:1,stage:'reign',oldRuler:p(1),heir:p(4),supporter:p(2),reignRound:1};
  conserve(s);
  const urgent = chooseAction(viewForSeat(s,0),0);
  assert.equal(urgent.action.type,'recall');
  assert.ok([p(2),p(4)].includes(urgent.action.target!));
});

test('A07: AI retains ranked answers instead of needless extra native deployment', () => {
  const s = fixture();
  s.players[0].court.push(a(2));
  s.players[0].hand = [a(3),a(10)];
  conserve(s);
  const claim = chooseAction(viewForSeat(s,0),0);
  assert.equal(claim.action.type,'name-heir');
  assert.equal(claim.action.card,a(3),'expose lower heir and keep the stronger native answer');
  const waiting = fixture();
  waiting.players[0].court.push(a(2));
  waiting.players[0].hand = [a(4)];
  waiting.players[1].court.push(p(2),p(4));
  waiting.crown = {seat:1,stage:'notice',oldRuler:p(1),heir:p(4),supporter:p(2),reignRound:null};
  conserve(waiting);
  const reserve = chooseAction(viewForSeat(waiting,0),0);
  assert.notEqual(reserve.action.type,'recruit');
  assert.ok(!(reserve.action.type === 'trade' && reserve.action.recruit), 'do not turn the last answer into an unnecessary extra supporter');
  let incoming = nativeNotice();
  incoming.players[0].hand = [a(6),a(10)];
  incoming.players[1].hand = [a(5)];
  conserve(incoming);
  incoming = act(incoming,{type:'recall',seat:1,card:a(5),target:a(4)});
  const defend = chooseAction(viewForSeat(incoming,0),0);
  assert.equal(defend.action.type,'defend');
  assert.equal(defend.action.card,a(6),'smaller non-Queen answer preserves 10');
});

test('EMPTY-01/02/03: Trade excludes empty Played piles without inspecting hidden hands', () => {
  const empty = fixture();
  empty.players[0].hand = [a(8)];
  conserve(empty);
  const emptyView = viewForSeat(empty, 0);
  assert.equal(emptyView.players[1].handCount, 0);
  assert.equal(emptyView.players[1].hand, null);
  assert.ok(!legalActions(emptyView, 0).some(action => action.type === 'trade' && action.other === 1));
  rejected(empty, { type: 'trade', seat: 0, card: a(8), other: 1, request: a(2) });
  assert.deepEqual(empty.offers, {});
  assert.deepEqual(empty.knownHands, {});

  const occupied = fixture();
  occupied.players[0].hand = [a(8)];
  occupied.players[1].hand = [p(2)];
  occupied.players[1].played = [a(2)];
  conserve(occupied);
  const occupiedView = viewForSeat(occupied, 0);
  assert.ok(legalActions(occupiedView, 0).some(action => action.type === 'trade' && action.other === 1 && action.request === a(2)));
  const requested = act(occupied, { type: 'trade', seat: 0, card: a(8), other: 1, request: a(2) });
  assert.ok(act(requested, { type: 'accept', seat: 1 }).players[0].played.includes(a(2)));

  const permuted = structuredClone(occupied);
  permuted.players[1].hand = [p(3)];
  conserve(permuted);
  assert.deepEqual(viewForSeat(permuted, 0), occupiedView);
  assert.deepEqual(legalActions(viewForSeat(permuted, 0), 0), legalActions(occupiedView, 0));
});
