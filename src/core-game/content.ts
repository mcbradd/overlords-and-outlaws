import { CARDS as ORIGINAL_CARDS } from '../content';
import { CHARACTER_ART } from '../character-art';
import { DYNASTIES, type CoreCard, type Dynasty } from './types';

/** Equal mechanical slots for the initial vertical slice; historical identities remain distinct. */
export const FEMALE_RANKS = Object.freeze([6,7,8,10,11,12]);
const RANK_IDS: Record<Dynasty, readonly number[]> = {
  alba: [0,2,3,4,5,14,15,8,12,16,13,1,9],
  plantagenet: [0,2,3,4,6,14,8,15,10,11,13,1,5],
  tudor: [0,7,4,8,11,3,5,9,12,6,13,1,2],
  habsburg: [0,2,4,5,6,7,8,14,10,15,13,1,3],
};
export const ROSTER_ADDITIONS: Record<string,{name:string;art:string}> = {
 'alba-14':{name:'Margaret of England',art:'margaret-england'},
 'alba-15':{name:'Yolande of Dreux',art:'yolande-dreux'},
 'alba-16':{name:'Euphemia de Ross',art:'euphemia-ross'},
 'plantagenet-14':{name:'Empress Matilda',art:'empress-matilda'},
 'plantagenet-15':{name:'Blanche of Lancaster',art:'blanche-lancaster'},
 'habsburg-14':{name:'Isabella of Portugal',art:'isabella-portugal'},
 'habsburg-15':{name:'Elisabeth of Austria',art:'elisabeth-austria'},
};
// Authored identities, independent of rank and the old Queen role.
const FEMALE_IDS = new Set(['alba-1','alba-8','alba-13','alba-14','alba-15','alba-16','plantagenet-1','plantagenet-8','plantagenet-11','plantagenet-13','plantagenet-14','plantagenet-15','tudor-1','tudor-3','tudor-5','tudor-6','tudor-9','tudor-13','habsburg-1','habsburg-7','habsburg-8','habsburg-13','habsburg-14','habsburg-15']);
export const CARDS: readonly CoreCard[] = Object.freeze(DYNASTIES.flatMap(dynasty =>
 RANK_IDS[dynasty].map((suffix,index)=>{
  const id=`${dynasty}-${suffix}`,addition=ROSTER_ADDITIONS[id],source=ORIGINAL_CARDS.find(card=>card.id===id);
  if(!addition && (!source || !CHARACTER_ART[id]))throw new Error(`Missing core identity/art: ${id}`);
  return Object.freeze({id,dynasty,rank:index+1,name:addition?.name??source!.name,
   gender:FEMALE_IDS.has(id)?'female':'male',queen:addition?true:source!.role==='Queen',founder:index===0,
   artRef:addition?`art/core-roster/${addition.art}.png`:CHARACTER_ART[id]});
 })
));
export const BY_ID: Readonly<Record<string, CoreCard>> = Object.freeze(
  Object.fromEntries(CARDS.map(card => [card.id, card])),
);
export { DYNASTIES };
export type { Dynasty, CoreCard } from './types';
