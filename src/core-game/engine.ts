import { BY_ID, CARDS, DYNASTIES } from './content';
import type { CoreAction, CoreState, CoreView, Dynasty } from './types';
export type { CoreAction, CoreState, CoreView } from './types';

const clone = <T>(value: T): T => structuredClone(value);
const name = (id: string) => BY_ID[id].name;
const seatName = (s: CoreState, seat: number) => `Player ${seat + 1}`;
const native = (id: string, dynasty: Dynasty | null) => BY_ID[id]?.dynasty === dynasty;
const reject = (): never => { throw new Error('That action is unavailable or has changed. Choose again.'); };

function seedValue(seed: string | number): number {
  let value = 2166136261;
  for (const character of String(seed)) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return value >>> 0;
}
export function createGame(options: { seed: string | number; dynasties: readonly Dynasty[] }): CoreState {
  const dynasties = [...options.dynasties];
  if (dynasties.length < 2 || dynasties.length > 4 || new Set(dynasties).size !== dynasties.length ||
      dynasties.some(dynasty => !DYNASTIES.includes(dynasty))) throw new Error('Choose two to four distinct Dynasties.');
  const deck = CARDS.filter(card => dynasties.includes(card.dynasty)).map(card => card.id);
  let random = seedValue(options.seed);
  for (let i = deck.length - 1; i > 0; i--) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    const j = random % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const s: CoreState = {
    schema: 5, revision: 0, round: 1, first: 0, active: 0, phase: 'draft', dynasties, setup: { pass: 3, picks: {}, repairPile: [], repairCard: null },
    players: dynasties.map((dynasty, seat) => ({
      seat, dynasty: null, hand: [], court: [], played: [], ruler: null,
    })),
    deck, crown: null, marriages: [], passes: [], attempts: {}, offers: {}, pending: null,
    result: null, events: ['Round 1 begins. Eight cards each. Pass three, two, then one clockwise before declaring a Dynasty.'], knownHands: {},
  };
  for (let deal = 0; deal < 8; deal++) for (const player of s.players) player.hand.push(s.deck.shift()!);
  assertInvariants(s);
  return s;
}

export function createTutorial(): CoreState {
  const s = createGame({ seed: 'build-5-tutorial', dynasties: ['alba', 'plantagenet'] });
  s.players[0].hand = ['alba-0','alba-2','alba-4','alba-5','alba-6','plantagenet-6','plantagenet-7','plantagenet-8'];
  s.players[1].hand = ['plantagenet-0','plantagenet-2','plantagenet-3','plantagenet-4','plantagenet-5','alba-3','alba-7','alba-8'];
  const used=s.players.flatMap(p=>p.hand);
  s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!used.includes(c.id)).map(c=>c.id);
  s.events=['Prepared eight-card teaching deal. No player has declared a Dynasty.'];
  assertInvariants(s);
  return s;
}

export function canDefend(leadId: string, answerId: string): boolean {
  const lead = BY_ID[leadId], answer = BY_ID[answerId];
  return !!lead && !!answer && lead.dynasty === answer.dynasty &&
    (answer.rank > lead.rank || answer.rank === 1 && lead.rank >= 11);
}

/** Includes only identities actually disclosed by public actions or returns. */
export function viewForSeat(state: CoreState, seat: number): CoreView {
  // An explicit allowlist prevents future private state fields entering the view.
  return clone({ schema: state.schema, revision: state.revision, round: state.round,
    first: state.first, active: state.active, phase: state.phase, dynasties: state.dynasties,
    setup: state.setup ? { ...state.setup, picks: { [seat]: state.setup.picks[seat] ?? [] } } : null,
    crown: state.crown, marriages: state.marriages, passes: state.passes,
    attempts: state.attempts, offers: state.offers, pending: state.pending,
    result: state.result, events: state.events, knownHands: state.knownHands,
    viewer: seat, deckCount: state.deck.length,
    players: state.players.map(player => ({ seat: player.seat, dynasty: player.dynasty,
      court: player.court, played: player.played, ruler: player.ruler,
      hand: player.seat === seat ? player.hand : null, handCount: player.hand.length,
    })),
  });
}

function supported(view: CoreView | CoreState, seat: number, id: string | null): boolean {
  if (!id) return false;
  const player = view.players[seat];
  return player.court.includes(id) && (native(id, player.dynasty) ||
    view.marriages.some(link => link.seat === seat && link.spouse === id &&
      player.court.includes(link.queen) && native(link.queen, player.dynasty) && BY_ID[link.queen].queen));
}

/** Candidate generation never receives an opponent's private hand or deck order. */
export function legalActions(view: CoreView, seat: number): CoreAction[] {
  const player = view.players[seat];
  if (!player || view.viewer !== seat || !player.hand || view.phase === 'terminal') return [];
  const actions: CoreAction[] = [];
  if (view.setup) {
    if (seat !== view.active) return [];
    const picks = view.setup.picks[seat] ?? [];
    const available = player.hand.filter(id => !picks.includes(id));
    const type = view.phase === 'draft' ? 'draft-pick' : view.phase === 'repair' ? 'repair' : 'declare-pick';
    return available.filter(id => type === 'draft-pick' || (type === 'repair'
      ? BY_ID[id].dynasty !== BY_ID[view.setup!.repairCard!].dynasty
      : player.hand!.filter(other => BY_ID[other].dynasty === BY_ID[id].dynasty).length >= 3 &&
        (!picks.length || BY_ID[id].dynasty === BY_ID[picks[0]].dynasty)))
      .map(card => ({ type, card, seat, revision: view.revision }));
  }
  const add = (action: Omit<CoreAction, 'seat' | 'revision'>) => actions.push({ ...action, seat, revision: view.revision });
  if (view.pending) {
    if (view.pending.other !== seat) return [];
    add({ type: 'decline' });
    if (view.phase === 'recall') {
      for (const id of player.hand) if (canDefend(view.pending.card, id)) add({ type: 'defend', card: id });
    } else if (view.phase === 'trade' && player.played.includes(view.pending.request!)) add({ type: 'accept' });
    return actions;
  }
  if (view.phase !== 'action' || view.active !== seat) return [];
  add({ type: 'pass' });
  for(const card of player.court) add({ type: 'withdraw', card });
  for (const id of player.hand) {
    const card = BY_ID[id];
    if (native(id, player.dynasty)) {
      add({ type: 'recruit', card: id });
      if (!view.crown && supported(view, seat, player.ruler)) {
        for (const supporter of player.court) if (supporter !== player.ruler && native(supporter, player.dynasty))
          add({ type: 'name-heir', card: id, supporter });
      }
    } else if (!view.crown && player.ruler && native(player.ruler, player.dynasty)) {
      for (const queen of player.court) if (queen !== player.ruler && native(queen, player.dynasty) &&
        BY_ID[queen].queen && Math.abs(BY_ID[queen].rank - card.rank) <= 1 &&
        !view.marriages.some(link => link.queen === queen || link.spouse === queen))
        add({ type: 'marry-heir', card: id, supporter: queen });
    }
    for (const rival of view.players) if (rival.seat !== seat) {
      for (const target of rival.court) if (BY_ID[target].dynasty === card.dynasty &&
        !Object.values(view.attempts).some(targets => targets.includes(target))) add({ type: 'recall', card: id, target });
      if (view.offers[seat]?.includes(rival.seat)) continue;
      for (const requestedId of rival.played) {
        const requested = BY_ID[requestedId];
        add({ type: 'trade', card: id, other: rival.seat, request: requested.id });
        if (requested.dynasty === player.dynasty && requested.rank < card.rank)
          add({ type: 'trade', card: id, other: rival.seat, request: requested.id, recruit: true });
      }
    }
  }
  return actions;
}

const actionFields = ['type', 'seat', 'revision', 'card', 'target', 'other', 'request', 'supporter'] as const;
function sameAction(a: CoreAction, b: CoreAction): boolean {
  return actionFields.every(field => a[field] === b[field]) && !!a.recruit === !!b.recruit;
}
function removeFromHand(s: CoreState, seat: number, id: string): void {
  const hand = s.players[seat].hand;
  const index = hand.indexOf(id);
  if (index < 0) reject();
  hand.splice(index, 1);
  s.knownHands[seat] = (s.knownHands[seat] ?? []).filter(known => known !== id);
}
function revealHand(s: CoreState, seat: number, id: string): void {
  const known = s.knownHands[seat] ??= [];
  if (!known.includes(id)) known.push(id);
}
function recruit(s: CoreState, seat: number, id: string): void {
  s.players[seat].court.push(id);
  if (!s.players[seat].ruler) s.players[seat].ruler = id;
}

/** Settle relationships before verifying offices and the exact Crown dependencies. */
function settle(s: CoreState): void {
  const intact = [] as CoreState['marriages'];
  for (const link of s.marriages) {
    const owner = s.players[link.seat];
    if (owner.court.includes(link.queen) && owner.court.includes(link.spouse)) intact.push(link);
    else if (owner.court.includes(link.spouse)) {
      owner.court.splice(owner.court.indexOf(link.spouse), 1);
      owner.played.push(link.spouse);
      s.events.push(`${name(link.spouse)} loses marriage support and moves to Played; returns next round.`);
    }
  }
  s.marriages = intact;
  for (const player of s.players) if (player.ruler && !supported(s, player.seat, player.ruler)) player.ruler = null;
  if (s.crown) {
    const crown = s.crown, player = s.players[crown.seat];
    const required = crown.stage === 'notice' ? [crown.oldRuler, crown.heir, crown.supporter] : [crown.heir, crown.supporter];
    const expectedRuler = crown.stage === 'notice' ? crown.oldRuler : crown.heir;
    if (player.ruler !== expectedRuler || required.some(id => !supported(s, crown.seat, id))) {
      s.crown = null;
      s.events.push('The Crown attempt fails because a required person has left. The Crown is available again.');
    }
  }
}
function nextTurn(s: CoreState, initiatingSeat: number): void {
  s.pending = null;
  s.phase = 'action';
  s.active = (initiatingSeat + 1) % s.players.length;
}
function boundary(s: CoreState): void {
  settle(s);
  if (s.crown?.stage === 'reign' && s.crown.reignRound === s.round) {
    s.result = { winner: s.crown.seat, reason: 'Succession secured: the new ruler and supporter stayed for one full round.' };
    s.events.push(`${seatName(s, s.crown.seat)} wins. ${s.result.reason}`);
    s.phase = 'terminal'; s.passes = []; return;
  }
  if (s.round === 12) {
    s.result = { winner: null, reason: 'Unsettled Crown — draw at the twelve-round prototype limit.' };
    s.events.push(s.result.reason); s.phase = 'terminal'; s.passes = []; return;
  }
  s.round++;
  s.first = (s.first + 1) % s.players.length;
  for (const player of s.players) {
    for (const id of player.played) { player.hand.push(id); revealHand(s, player.seat, id); }
    player.played = [];
  }
  for (let offset = 0; offset < s.players.length; offset++) {
    const player = s.players[(s.first + offset) % s.players.length];
    const drawn = s.deck.shift();
    if (drawn) player.hand.push(drawn);
  }
  s.events.push(`Round ${s.round}: Played cards return, each family draws one card if available, and the starting player rotates.`);
  if (s.crown?.stage === 'notice') {
    s.crown.stage = 'reign'; s.crown.reignRound = s.round;
    s.players[s.crown.seat].ruler = s.crown.heir;
    s.events.push(`${name(s.crown.heir)} inherits the Crown. Keep this ruler and ${name(s.crown.supporter)} through all of round ${s.round} to win.`);
  }
  s.attempts = {}; s.offers = {}; s.passes = []; s.active = s.first;
}
function pass(s: CoreState, seat: number): void {
  s.passes.push(seat);
  nextTurn(s, seat);
  if (s.passes.length === s.players.length) boundary(s);
}

/** Private packets stay in hand until every player finishes that pass. */
function setupPick(s: CoreState, action: CoreAction): void {
  const setup = s.setup!, player = s.players[action.seat];
  if (action.type === 'repair') {
    removeFromHand(s, action.seat, action.card!);
    setup.repairPile.push(action.card!);
    s.events.push(`${seatName(s, action.seat)} sets aside ${name(action.card!)} after publicly drawing ${name(setup.repairCard!)}.`);
    setup.repairCard = null;
    s.phase = 'declare';
    return;
  }
  const picks = setup.picks[action.seat] ??= [];
  picks.push(action.card!);
  const needed = s.phase === 'draft' ? setup.pass : 3;
  if (picks.length < needed) return;
  s.active++;
  if (s.active < s.players.length) { prepareDeclaration(s); return; }
  s.active = 0;
  if (s.phase === 'draft') {
    for (const p of s.players) for (const id of setup.picks[p.seat]) removeFromHand(s,p.seat,id);
    for (const p of s.players) s.players[(p.seat+1)%s.players.length].hand.push(...setup.picks[p.seat]);
    s.events.push(`Everyone passes ${setup.pass} cards clockwise at the same time.`);
    setup.pass--; setup.picks = {};
    if (!setup.pass) { s.phase = 'declare'; prepareDeclaration(s); }
  } else {
    for (const p of s.players) {
      const declared=setup.picks[p.seat];
      p.dynasty=BY_ID[declared[0]].dynasty;
      for(const id of declared) removeFromHand(s,p.seat,id);
      p.court=declared; p.ruler=declared[0];
      s.events.push(`${seatName(s,p.seat)} declares ${p.dynasty} with ${declared.map(name).join(', ')}; ${name(p.ruler)} is ruler.`);
    }
    if(setup.repairPile.length) {
      s.deck.push(...setup.repairPile);
      let random=seedValue(s.deck.join(',')+s.revision);
      for(let i=s.deck.length-1;i>0;i--) {random=(Math.imul(random,1664525)+1013904223)>>>0;const j=random%(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}
    }
    s.setup=null; s.phase='action'; s.active=s.first;
    s.events.push('All Courts are revealed. Round 1 begins with five cards in each hand.');
  }
}
function prepareDeclaration(s: CoreState): void {
  if(s.phase !== 'declare') return;
  const p=s.players[s.active];
  if(p.hand.some(id=>p.hand.filter(other=>BY_ID[other].dynasty===BY_ID[id].dynasty).length>=3)) return;
  const drawn=s.deck.shift()!;
  p.hand.push(drawn); s.setup!.repairCard=drawn; s.phase='repair';
  p.hand.forEach(id=>revealHand(s,p.seat,id));
  s.events.push(`${seatName(s,p.seat)} has no matching trio. Reveal that hand, draw ${name(drawn)}, then set aside a different-Dynasty card.`);
}

/** Atomic reducer: invalid actions throw before any input or observation changes. */
export function applyAction(state: CoreState, action: CoreAction): CoreState {
  if (!action || action.revision !== state.revision || !Number.isInteger(action.seat) ||
    !legalActions(viewForSeat(state, action.seat), action.seat).some(candidate => sameAction(candidate, action))) reject();
  const s = clone(state), player = s.players[action.seat];
  const id = action.card;
  switch (action.type) {
    case 'draft-pick': case 'declare-pick': case 'repair':
      setupPick(s, action); break;
    case 'withdraw':
      player.court.splice(player.court.indexOf(id!),1);
      player.hand.push(id!); revealHand(s,action.seat,id!);
      s.events.push(`${seatName(s,action.seat)} returns ${name(id!)} from Court to hand, spending their turn.`);
      settle(s); s.passes=[]; nextTurn(s,action.seat); break;
    case 'pass':
      s.events.push(`${seatName(s, action.seat)} passes.`);
      pass(s, action.seat);
      break;
    case 'recruit':
      removeFromHand(s, action.seat, id!); recruit(s, action.seat, id!);
      s.events.push(`${seatName(s, action.seat)} recruits ${name(id!)} from hand to Court.`);
      s.passes = []; nextTurn(s, action.seat);
      break;
    case 'name-heir':
    case 'marry-heir':
      removeFromHand(s, action.seat, id!); player.court.push(id!);
      if (action.type === 'marry-heir') s.marriages.push({ seat: action.seat, queen: action.supporter!, spouse: id! });
      s.crown = { seat: action.seat, stage: 'notice', oldRuler: player.ruler!, heir: id!, supporter: action.supporter!, reignRound: null };
      s.events.push(`${seatName(s, action.seat)} names ${name(id!)} heir, supported by ${name(action.supporter!)}. ${name(player.ruler!)} claims the Crown; succession begins next round.`);
      s.passes = []; nextTurn(s, action.seat);
      break;
    case 'recall': {
      const other = s.players.find(candidate => candidate.court.includes(action.target!))!.seat;
      removeFromHand(s, action.seat, id!); player.played.push(id!);
      (s.attempts[action.seat] ??= []).push(action.target!);
      s.pending = { type: 'recall', seat: action.seat, other, card: id!, target: action.target };
      s.phase = 'recall'; s.passes = [];
      s.events.push(`${seatName(s, action.seat)} plays ${name(id!)} to Recall ${name(action.target!)}. Its controller may Defend once or let the person go.`);
      break;
    }
    case 'defend': {
      const pending = s.pending!;
      removeFromHand(s, action.seat, id!); player.played.push(id!);
      s.events.push(`${name(id!)} defends against ${name(pending.card)}. ${name(pending.target!)} stays in Court.`);
      nextTurn(s, pending.seat);
      break;
    }
    case 'trade':
      (s.offers[action.seat] ??= []).push(action.other!);
      revealHand(s, action.seat, id!);
      s.pending = { type: 'trade', seat: action.seat, other: action.other!, card: id!, request: action.request, recruit: !!action.recruit };
      s.phase = 'trade';
      s.events.push(`${seatName(s, action.seat)} offers ${name(id!)} for ${name(action.request!)}${action.recruit ? ', to recruit the lower native on acceptance' : ''}. The recipient may accept or decline.`);
      break;
    case 'accept': {
      const pending = s.pending!;
      removeFromHand(s, pending.seat, pending.card);
      const source = s.players[pending.other].played;
      source.splice(source.indexOf(pending.request!), 1);
      s.players[pending.other].played.push(pending.card);
      if (pending.recruit) recruit(s, pending.seat, pending.request!);
      else s.players[pending.seat].played.push(pending.request!);
      s.events.push(`Trade accepted: ${name(pending.card)} and ${name(pending.request!)} change owners${pending.recruit ? '; the lower native enters Court' : ' in Played until next round'}.`);
      s.passes = []; nextTurn(s, pending.seat);
      break;
    }
    case 'decline': {
      const pending = s.pending!;
      if (pending.type === 'recall') {
        player.court.splice(player.court.indexOf(pending.target!), 1);
        const attacker = s.players[pending.seat];
        attacker.played.splice(attacker.played.indexOf(pending.card), 1);
        attacker.played.push(pending.target!);
        player.played.push(pending.card);
        s.events.push(`${name(pending.target!)} goes to ${seatName(s, pending.seat)} in exchange for ${name(pending.card)}, which goes to ${seatName(s, pending.other)}. Both enter Played and return to their new owners next round.`);
        settle(s); nextTurn(s, pending.seat);
      } else {
        s.events.push('Trade declined. The offer stays with its owner; this opportunity counts as Pass.');
        pass(s, pending.seat);
      }
      break;
    }
  }
  s.revision++;
  assertInvariants(s);
  return s;
}

/** This public boundary also validates restored authoritative saves. */
export function assertInvariants(s: CoreState): void {
  const require = (condition: unknown, message: string): void => { if (!condition) throw new Error(`Invalid core state: ${message}`); };
  require(s && s.schema === 5, 'schema');
  require(Number.isSafeInteger(s.revision) && s.revision >= 0, 'revision');
  require(Number.isInteger(s.round) && s.round >= 1 && s.round <= 12, 'round');
  require(Array.isArray(s.dynasties) && s.dynasties.length >= 2 && s.dynasties.length <= 4 &&
    new Set(s.dynasties).size === s.dynasties.length && s.dynasties.every(d => DYNASTIES.includes(d)), 'Dynasties');
  const count = s.dynasties.length;
  const seat = (value: number) => Number.isInteger(value) && value >= 0 && value < count;
  const record = (value: unknown) => !!value && typeof value === 'object' && !Array.isArray(value);
  require(seat(s.first) && seat(s.active), 'turn seats');
  require(Array.isArray(s.players) && s.players.length === count && Array.isArray(s.deck), 'players/deck');
  require(Array.isArray(s.marriages) && Array.isArray(s.passes) && record(s.attempts) && record(s.offers) && record(s.knownHands), 'procedure evidence');
  require(Object.keys(s.knownHands).every(key => String(Number(key)) === key && seat(Number(key))), 'known hand seats');
  require(Array.isArray(s.events) && s.events.every(event => typeof event === 'string'), 'events');
  const ids: string[] = [...s.deck, ...(s.setup?.repairPile ?? [])];
  for (const [index, player] of s.players.entries()) {
    require(player && player.seat === index && (player.dynasty === null ? !!s.setup : s.dynasties.includes(player.dynasty)), 'player identity');
    require(Array.isArray(player.hand) && Array.isArray(player.court) && Array.isArray(player.played), 'card zones');
    ids.push(...player.hand, ...player.court, ...player.played);
    require(player.ruler === null || typeof player.ruler === 'string' && player.court.includes(player.ruler), 'ruler location');
    const known = s.knownHands[index] ?? [];
    require(Array.isArray(known) && new Set(known).size === known.length && known.every(id => player.hand.includes(id)), 'known hand facts');
  }
  require(ids.length === count * 13 && new Set(ids).size === ids.length &&
    ids.every(id => BY_ID[id] && s.dynasties.includes(BY_ID[id].dynasty)), 'card conservation');
  require(s.setup === null || record(s.setup), 'setup');
  if(s.setup) {
    require(['draft','declare','repair'].includes(s.phase) && !s.pending && !s.crown && !s.marriages.length && !s.passes.length, 'setup phase');
    require(Array.isArray(s.setup.repairPile), 'repair packet');
    require(Number.isInteger(s.setup.pass) && s.setup.pass>=0 && s.setup.pass<=3 && record(s.setup.picks), 'draft pass');
    require(s.players.every(p=>p.dynasty===null && !p.court.length && !p.played.length && p.ruler===null), 'undeclared Courts');
    const needed=s.phase==='draft'?s.setup.pass:3;
    require(s.phase==='draft' ? needed>0 && s.setup.repairCard===null : s.setup.pass===0, 'setup stage');
    for(const [key,picks] of Object.entries(s.setup.picks)) {
      const owner=Number(key);
      require(seat(owner) && Array.isArray(picks) && new Set(picks).size===picks.length && picks.every(id=>s.players[owner].hand.includes(id)), 'private picks');
      require(owner<s.active ? picks.length===needed : owner===s.active ? picks.length<needed : !picks.length, 'packet order');
      if(s.phase!=='draft') require(picks.every(id=>BY_ID[id].dynasty===BY_ID[picks[0]].dynasty), 'matching declaration');
    }
    for(let seat=0;seat<s.active;seat++) require(s.setup.picks[seat]?.length===needed, 'completed packets');
    for(const p of s.players) require(p.hand.length===(s.phase==='repair'&&p.seat===s.active?9:8), 'setup hand size');
    require(s.phase==='repair' ? !!s.setup.repairCard && s.players[s.active].hand.includes(s.setup.repairCard) : s.setup.repairCard===null, 'repair draw');
  } else require(!['draft','declare','repair'].includes(s.phase), 'missing setup');
  const paired = new Set<string>();
  for (const link of s.marriages) {
    require(link && seat(link.seat), 'marriage seat');
    const player = s.players[link.seat];
    require(player.court.includes(link.queen) && player.court.includes(link.spouse) && link.queen !== link.spouse &&
      native(link.queen, player.dynasty) && BY_ID[link.queen].queen && !native(link.spouse, player.dynasty) &&
      Math.abs(BY_ID[link.queen].rank - BY_ID[link.spouse].rank) <= 1 &&
      !paired.has(link.queen) && !paired.has(link.spouse), 'marriage support');
    paired.add(link.queen); paired.add(link.spouse);
  }
  for (const player of s.players) {
    require(player.court.every(id => supported(s, player.seat, id)), 'unsupported Court person');
    require(player.ruler === null || supported(s, player.seat, player.ruler), 'unsupported ruler');
  }
  if (s.crown) {
    const c = s.crown;
    require(seat(c.seat) && ['notice', 'reign'].includes(c.stage), 'Crown stage');
    require(new Set([c.oldRuler, c.heir, c.supporter]).size === 3 &&
      [c.oldRuler, c.heir, c.supporter].every(id => !!BY_ID[id]), 'Crown identities');
    const player = s.players[c.seat];
    require(native(c.supporter, player.dynasty) && supported(s, c.seat, c.supporter) && supported(s, c.seat, c.heir), 'Crown dependencies');
    require(c.stage === 'notice' ? c.reignRound === null && player.ruler === c.oldRuler && supported(s, c.seat, c.oldRuler) :
      c.reignRound === s.round && player.ruler === c.heir, 'Crown timing');
  }
  require(['draft', 'declare', 'repair', 'action', 'recall', 'trade', 'terminal'].includes(s.phase), 'phase');
  require(s.passes.length < count && new Set(s.passes).size === s.passes.length && s.passes.every(seat), 'pass sequence');
  for (const [owner, targets] of Object.entries(s.attempts)) require(seat(Number(owner)) && Array.isArray(targets) &&
    new Set(targets).size === targets.length && targets.every(id => !!BY_ID[id]), 'Recall marks');
  for (const [owner, recipients] of Object.entries(s.offers)) require(seat(Number(owner)) && Array.isArray(recipients) &&
    new Set(recipients).size === recipients.length && recipients.every(other => seat(other) && other !== Number(owner)), 'Trade marks');
  if (s.pending) {
    const pending = s.pending;
    require((pending.type === 'recall' || pending.type === 'trade') && s.phase === pending.type &&
      seat(pending.seat) && seat(pending.other) && pending.seat !== pending.other && s.active === pending.seat, 'pending response');
    if (pending.type === 'recall') require(s.players[pending.seat].played.includes(pending.card) &&
      !!pending.target && s.players[pending.other].court.includes(pending.target) &&
      BY_ID[pending.card].dynasty === BY_ID[pending.target].dynasty && s.attempts[pending.seat]?.includes(pending.target), 'Recall evidence');
    else require(s.players[pending.seat].hand.includes(pending.card) && !!pending.request && !!BY_ID[pending.request] &&
      s.players[pending.other].played.includes(pending.request) &&
      s.offers[pending.seat]?.includes(pending.other) && (!pending.recruit ||
      native(pending.request, s.players[pending.seat].dynasty) && BY_ID[pending.request].rank < BY_ID[pending.card].rank), 'Trade evidence');
  } else require(!!s.setup || s.phase === 'action' || s.phase === 'terminal', 'missing response');
  require(s.phase === 'terminal' ? !!s.result && (s.result.winner === null || seat(s.result.winner)) &&
    typeof s.result.reason === 'string' && !s.pending : s.result === null, 'terminal result');
}
