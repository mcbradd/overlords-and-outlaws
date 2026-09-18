// Explicit post-setup fixtures for action regressions; not a playable opening.
import { createGame as draftGame, assertInvariants } from '../src/core-game/engine';
import { CARDS } from '../src/core-game/content';
import type { CoreState, Dynasty } from '../src/core-game/types';
export function createGame(options: { seed: string | number; dynasties: readonly Dynasty[] }) {
 const s = draftGame(options);
 s.setup = null; s.phase = 'action';
 s.players.forEach((p,i) => { p.dynasty=s.dynasties[i]; p.court=[`${p.dynasty}-0`]; p.ruler=p.court[0]; p.hand=[]; });
 s.deck=CARDS.filter(c=>s.dynasties.includes(c.dynasty)&&!c.founder).map(c=>c.id);
 let random=2166136261;
 for(const character of String(options.seed)) random=Math.imul(random ^ character.charCodeAt(0),16777619);
 for(let i=s.deck.length-1;i>0;i--) {random=(Math.imul(random,1664525)+1013904223)>>>0;const j=random%(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];}
 for(let deal=0;deal<2;deal++) for(const p of s.players) p.hand.push(s.deck.shift()!);
 assertInvariants(s);
 return s;
}
