import { CARDS as ORIGINAL_CARDS } from '../content';
import { CHARACTER_ART } from '../character-art';
import { DYNASTIES, type CoreCard, type Dynasty } from './types';

/** Authored rank order from the Build 5 specification, not collector numbering. */
const RANK_IDS: Record<Dynasty, readonly number[]> = {
  alba: [0, 2, 3, 4, 5, 6, 7, 8, 10, 12, 13, 1, 9],
  plantagenet: [0, 2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 1, 5],
  tudor: [0, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 1, 2],
  habsburg: [0, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 1, 3],
};
export const CARDS: readonly CoreCard[] = Object.freeze(DYNASTIES.flatMap(dynasty =>
  RANK_IDS[dynasty].map((suffix, index) => {
    const id = `${dynasty}-${suffix}`;
    const source = ORIGINAL_CARDS.find(card => card.id === id);
    if (!source || !CHARACTER_ART[id]) throw new Error(`Missing core identity/art: ${id}`);
    return Object.freeze({
      id, dynasty, rank: index + 1, name: source.name,
      queen: source.role === 'Queen', founder: source.role === 'Founder',
      artRef: CHARACTER_ART[id],
    });
  }),
));
export const BY_ID: Readonly<Record<string, CoreCard>> = Object.freeze(
  Object.fromEntries(CARDS.map(card => [card.id, card])),
);
export { DYNASTIES };
export type { Dynasty, CoreCard } from './types';
