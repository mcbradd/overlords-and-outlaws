export const DYNASTIES = ['alba', 'plantagenet', 'tudor', 'habsburg'] as const;
export type Dynasty = typeof DYNASTIES[number];
export interface CoreCard {
  id: string;
  dynasty: Dynasty;
  rank: number;
  name: string;
  gender: 'male' | 'female';
  queen: boolean;
  founder: boolean;
  artRef: string;
}
export interface CorePlayer {
  seat: number;
  dynasty: Dynasty | null;
  hand: string[];
  court: string[];
  played: string[];
  ruler: string | null;
}
export interface CoreCrown {
  seat: number;
  stage: 'notice' | 'reign';
  oldRuler: string;
  heir: string;

  reignRound: number | null;
}
/** queen is the legacy serialized name for the ruler who initiated this marriage. */
export interface CoreMarriage { seat: number; queen: string; spouse: string }
export interface CorePending {
  type: 'recall' | 'trade';
  seat: number;
  other: number;
  card: string;
  target?: string;
  request?: string;
  recruit?: boolean;
}
export interface CoreState {
  schema: 5;
  revision: number;
  round: number;
  first: number;
  active: number;
  phase: 'draft' | 'declare' | 'repair' | 'action' | 'recall' | 'trade' | 'terminal';
  /** Shared card pool, never assigned to seats. */
  dynasties: Dynasty[];
  setup: { pass: number; picks: Record<string, string[]>; repairPile: string[]; repairCard: string | null } | null;
  players: CorePlayer[];
  deck: string[];
  crown: CoreCrown | null;
  marriages: CoreMarriage[];
  passes: number[];
  attempts: Record<string, string[]>;
  offers: Record<string, number[]>;
  pending: CorePending | null;
  result: { winner: number | null; reason: string } | null;
  events: string[];
  /** Publicly disclosed identities still in a hand; never populated by blind draws. */
  knownHands: Record<string, string[]>;
}
export interface CoreViewPlayer extends Omit<CorePlayer, 'hand'> {
  hand: string[] | null;
  handCount: number;
}
export interface CoreView extends Omit<CoreState, 'players' | 'deck'> {
  viewer: number;
  players: CoreViewPlayer[];
  deckCount: number;
}
export interface CoreAction {
  type: 'withdraw' | 'draft-pick' | 'declare-pick' | 'repair' | 'recruit' | 'recall' | 'defend' | 'decline' | 'pass' |
    'name-heir' | 'marry-heir' | 'trade' | 'accept';
  seat: number;
  revision: number;
  card?: string;
  target?: string;
  other?: number;
  request?: string;
  recruit?: boolean;
  supporter?: string;
}
