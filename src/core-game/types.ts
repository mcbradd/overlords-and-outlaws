export const DYNASTIES = ['alba', 'plantagenet', 'tudor', 'habsburg'] as const;
export type Dynasty = typeof DYNASTIES[number];
export interface CoreCard {
  id: string;
  dynasty: Dynasty;
  rank: number;
  name: string;
  queen: boolean;
  founder: boolean;
  artRef: string;
}
export interface CorePlayer {
  seat: number;
  dynasty: Dynasty;
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
  supporter: string;
  reignRound: number | null;
}
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
  phase: 'action' | 'recall' | 'trade' | 'terminal';
  dynasties: Dynasty[];
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
  type: 'recruit' | 'recall' | 'defend' | 'decline' | 'pass' |
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
