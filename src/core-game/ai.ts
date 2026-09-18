import { BY_ID, CARDS } from './content';
import { canDefend, legalActions } from './engine';
import type { CoreAction, CoreView } from './types';

export type CorePolicy = 'balanced' | 'aggressive' | 'builder' | 'conserver';
export interface CoreDecision {
  action: CoreAction;
  reason: string;
  considered: number;
  policyVersion: string;
}

function dependencies(view: CoreView): string[] {
  const crown = view.crown;
  if (!crown) return [];
  return [crown.oldRuler, crown.heir];
}
function handValue(view: CoreView, seat: number, id: string): number {
  const player = view.players[seat], card = BY_ID[id];
  let value = card.rank * 0.18 + (card.rank === 1 ? 1.5 : 0);
  if (card.dynasty === player.dynasty) {
    value += !player.ruler ? 12 : player.court.filter(person => BY_ID[person].dynasty === player.dynasty).length < 2 ? 8 : 4;
    if (card.queen) value += 2;
  } else {
    value += 2;
    if (!view.crown && player.court.some(queen => BY_ID[queen].dynasty === player.dynasty && BY_ID[queen].queen &&
      Math.abs(BY_ID[queen].rank - card.rank) <= 1 && !view.marriages.some(link => link.queen === queen))) value += 8;
  }
  return value;
}

function usefulDevelopment(view: CoreView, seat: number, id: string): boolean {
  const player = view.players[seat];
  if (!player.ruler || player.court.filter(person => BY_ID[person].dynasty === player.dynasty).length < 2) return true;
  return !view.crown && BY_ID[id].queen && (player.hand ?? []).some(spouse =>
    BY_ID[spouse].dynasty !== player.dynasty && Math.abs(BY_ID[spouse].rank - BY_ID[id].rank) <= 1) &&
    !player.court.some(queen => BY_ID[queen].queen && nativeQueen(view, seat, queen));
}
function nativeQueen(view: CoreView, seat: number, id: string): boolean {
  return BY_ID[id].dynasty === view.players[seat].dynasty &&
    !view.marriages.some(link => link.queen === id || link.spouse === id);
}

/** Estimate a response from public identities and remaining unknown cards only. */
function answerRisk(view: CoreView, targetSeat: number, lead: string): number {
  if ((view.knownHands[targetSeat] ?? []).some(id => canDefend(lead, id))) return 1;
  const visible = new Set(view.players.flatMap(player => [
    ...player.court, ...player.played, ...(player.hand ?? []), ...(view.knownHands[player.seat] ?? []),
  ]));
  const unknown = CARDS.filter(card => view.dynasties.includes(card.dynasty) && !visible.has(card.id));
  const answers = unknown.filter(card => canDefend(lead, card.id)).length;
  const heldUnknown = Math.max(0, view.players[targetSeat].handCount - (view.knownHands[targetSeat]?.length ?? 0));
  // Sampling without replacement: probability of at least one possible answer.
  let noAnswer = 1;
  for (let draw = 0; draw < heldUnknown && draw < unknown.length; draw++)
    noAnswer *= Math.max(0, unknown.length - answers - draw) / (unknown.length - draw);
  return 1 - noAnswer;
}

function score(view: CoreView, action: CoreAction, policy: CorePolicy): [number, string] {
  const seat = action.seat, player = view.players[seat];
  const crown = view.crown, required = dependencies(view);
  switch (action.type) {
    case 'withdraw': return [-20, 'Keep a Court person in place unless retreat is useful.'];
    case 'draft-pick': {
      const hand=player.hand!;
      const count=hand.filter(id=>BY_ID[id].dynasty===BY_ID[action.card!].dynasty).length;
      return [-count*20-BY_ID[action.card!].rank*.1, 'Preserve the largest matching group for declaration.'];
    }
    case 'declare-pick': return [BY_ID[action.card!].rank, 'Place three matching Nobles; the first is ruler.'];
    case 'repair': return [-BY_ID[action.card!].rank, 'Set aside a different-Dynasty card to finish repair.'];
    case 'defend': {
      const target = view.pending!.target!;
      const critical = crown?.seat === seat && required.includes(target);
      const ruler = target === player.ruler;
      const supportsRuler = view.marriages.some(link => link.queen === target && link.spouse === player.ruler);
      return [(critical ? 200 : ruler || supportsRuler ? 30 : 9) - handValue(view, seat, action.card!) * 0.35,
        critical ? 'Spend a legal ranked answer to keep the person required for your Crown.' :
          'Protect this public person while spending the least valuable sufficient answer.'];
    }
    case 'decline':
      return [0, view.phase === 'recall' ? 'Let this person go and preserve the remaining concealed answers.' :
        'Keep the requested card in your Played pile.'];
    case 'accept': {
      const trade = view.pending!;
      const gain = handValue(view, seat, trade.card) - handValue(view, seat, trade.request!);
      const exposingCrownAnswer = crown?.seat === seat && required.some(id =>
        BY_ID[id].dynasty === BY_ID[trade.request!].dynasty);
      return [gain + 0.1 - (exposingCrownAnswer ? 7 : 0),
        'Compare the exact incoming person with the card surrendered, including the answers needed for your Crown.'];
    }
    case 'name-heir':
    case 'marry-heir': {
      const remaining = (player.hand ?? []).filter(id => id !== action.card);
      const requiredSuits = new Set([BY_ID[player.ruler!].dynasty, BY_ID[action.card!].dynasty]);
      const retained = remaining.filter(id => requiredSuits.has(BY_ID[id].dynasty));
      const strongest = retained.reduce((rank, id) => Math.max(rank, BY_ID[id].rank), 0);
      const exposed = !retained.length && view.players.some(other => other.seat !== seat && other.handCount > 0);
      return [70 + strongest * 0.6 - (exposed ? 22 : 0) - handValue(view, seat, action.card!) * 0.12,
        action.type === 'marry-heir' ? 'Use this matching foreign marriage to begin succession, exposing both partners to Challenge.' :
          'Begin the Crown attempt with the people already assembled; retain the remaining hand for answers.'];
    }
    case 'recruit': {
      const card = BY_ID[action.card!];
      const count = player.court.filter(id => BY_ID[id].dynasty === player.dynasty).length;
      const recovery = !player.ruler;
      const queenMatch = card.queen && (player.hand ?? []).some(id => BY_ID[id].dynasty !== player.dynasty &&
        Math.abs(BY_ID[id].rank - card.rank) <= 1);
      const useful = usefulDevelopment(view, seat, action.card!);
      return [(recovery ? 32 : count < 2 ? 15 : useful ? 3 : -7) + (queenMatch ? 5 : 0) + (policy === 'builder' && useful ? 3 : 0) -
        handValue(view, seat, action.card!) * 0.2 - (crown?.seat === seat ? 20 : 0),
        recovery ? 'Put a native ruler back in Court so your family can pursue succession again.' :
          queenMatch ? 'Expose this Queen to prepare a particular matching marriage from your hand.' :
            'Develop your public Court while giving up this card as a concealed answer.'];
    }
    case 'recall': {
      const targetSeat = view.players.find(other => other.court.includes(action.target!))!.seat;
      const critical = crown?.seat === targetSeat && required.includes(action.target!);
      const risk = answerRisk(view, targetSeat, action.card!);
      const ruler = view.players[targetSeat].ruler === action.target;
      const retrieveNative = BY_ID[action.target!].dynasty === player.dynasty;
      const developed = view.players[targetSeat].court.length >= 2;
      const value = critical ? 110 : ruler ? developed ? 8 : 1 : 3;
      const exchangeGain = handValue(view, seat, action.target!) - handValue(view, seat, action.card!);
      const giftedStrength = Math.max(0, BY_ID[action.card!].rank - BY_ID[action.target!].rank) * 0.25 +
        (BY_ID[action.card!].dynasty === view.players[targetSeat].dynasty ? 2 : 0);
      return [value * (1 - 0.45 * risk) + (1 - risk) * (exchangeGain - giftedStrength) + (retrieveNative ? 2 : 0) -
        handValue(view, seat, action.card!) * 0.1 + (policy === 'aggressive' && developed ? 3 : 0) - (crown?.seat === seat ? 12 : 0),
        critical ? 'Challenge a required Crown person before the rival completes succession; their answer remains uncertain.' :
          risk > 0.7 ? 'A public or possible ranked answer may stop this lead, but committing it can expose another target.' :
            'Price the exact person given in exchange against the captured person and the rival’s public threat.'];
    }
    case 'trade': {
      const gain = handValue(view, seat, action.request!) - handValue(view, seat, action.card!);
      const useful = usefulDevelopment(view, seat, action.request!);
      return [gain * 0.7 + (action.recruit ? useful ? 9 : -7 : -1) -
        (crown?.seat === seat ? 15 : 0),
        action.recruit ? 'Offer the higher card for exact lower native development; acceptance is voluntary.' :
          'Seek a face-up Played card that has greater use in this family.'];
    }
    case 'pass':
      return [crown?.seat === seat ? 8 : policy === 'conserver' ? 2 : 0,
        crown?.seat === seat ? 'Keep concealed answers and invite the next turn toward completing this reign.' :
          'Preserve the remaining hand; a later play can reopen your opportunity before all players pass.'];
  }
}

function tieBreaker(view: CoreView, action: CoreAction): number {
  let hash = 2166136261;
  for (const character of `${view.round}:${view.revision}:${JSON.stringify(action)}`)
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1000) / 10000;
}

/** Never accept CoreState here: decisions use exactly the player's observation. */
export function chooseAction(view: CoreView, seat: number, policy: CorePolicy = 'balanced'): CoreDecision {
  const actions = legalActions(view, seat);
  if (!actions.length) throw new Error('This seat has no current decision.');
  let best = actions[0], bestScore = -Infinity, reason = '';
  for (const action of actions) {
    const [value, explanation] = score(view, action, policy);
    const total = value + tieBreaker(view, action);
    if (total > bestScore) { best = action; bestScore = total; reason = explanation; }
  }
  return { action: best, reason, considered: actions.length, policyVersion: `core-5.0-${policy}` };
}

/** Lock a private draft packet using only this player's information. */
export function chooseDraftPacket(source: CoreView): string[] {
  if(source.phase !== 'draft' || !source.setup) return [];
  const view=structuredClone(source);
  view.active=view.viewer;
  const picks=view.setup!.picks[view.viewer] ??= [];
  while(picks.length<view.setup!.pass) {
    const action=chooseAction(view,view.viewer).action;
    if(!action?.card) break;
    picks.push(action.card);
  }
  return [...picks];
}
