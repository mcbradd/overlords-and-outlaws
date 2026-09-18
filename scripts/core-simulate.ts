/** Supporting engine/policy evidence, never a substitute for screen-observed play. */
import { applyAction, viewForSeat, assertInvariants } from '../src/core-game/engine';
import { createGame } from '../src/core-game/engine';
import { chooseAction, type CorePolicy } from '../src/core-game/ai';
import { DYNASTIES } from '../src/core-game/content';
import type { Dynasty } from '../src/core-game/types';

const seeds = Number(process.argv[2] ?? 8);
if (!Number.isSafeInteger(seeds) || seeds < 1 || seeds > 1000) throw new Error('Choose 1–1000 seeds per seat count.');
const policies: CorePolicy[] = ['balanced', 'aggressive', 'builder', 'conserver'];
const extended = process.argv.includes('--extended');
const configurations: { cohort: string; dynasties: Dynasty[]; balanced: boolean }[] = [];
for (const seats of [2, 3, 4]) {
  configurations.push({ cohort: 'original-mixed', dynasties: DYNASTIES.slice(0, seats), balanced: false });
  if (extended) configurations.push({ cohort: 'all-balanced', dynasties: DYNASTIES.slice(0, seats), balanced: true });
}
if (extended) {
  // Every selected-suit subset and every cyclic seat rotation of that subset.
  for (let mask = 1; mask < 16; mask++) {
    const selected = DYNASTIES.filter((_, index) => mask & (1 << index));
    if (selected.length < 2) continue;
    for (let rotate = 0; rotate < selected.length; rotate++) configurations.push({
      cohort: 'suit-seat-rotation', dynasties: [...selected.slice(rotate), ...selected.slice(0, rotate)], balanced: false,
    });
  }
}
const games: {
  cohort: string; dynasties: Dynasty[]; seats: number; seed: number; actions: number;
  rounds: number; winner: number | null; claims: number; marriageClaims: number;
  recalls: number; defenses: number; trades: number; acceptances: number;
  rulerlessOpportunities: number; longestRulerlessRounds: number;
}[] = [];
for (const configuration of configurations) for (let sample = 0; sample < seeds; sample++) {
  const seats = configuration.dynasties.length;
  const seed = 101 + sample;
  let state = createGame({ seed, dynasties: configuration.dynasties });
  let actions = 0, claims = 0, recalls = 0, defenses = 0, trades = 0, acceptances = 0;
  let rulerlessOpportunities = 0, marriageClaims = 0, longestRulerlessRounds = 0;
  const rulerlessRounds = Array.from({ length: seats }, () => 0);
  while (state.phase !== 'terminal' && actions < 3000) {
    const seat = state.pending?.other ?? state.active;
    const policy = configuration.balanced ? 'balanced' : policies[(seat + sample) % policies.length];
    const decision = chooseAction(viewForSeat(state, seat), seat, policy);
    if (state.phase === 'action' && !state.players[seat].ruler) rulerlessOpportunities++;
    if (decision.action.type === 'name-heir' || decision.action.type === 'marry-heir') claims++;
    if (decision.action.type === 'marry-heir') marriageClaims++;
    if (decision.action.type === 'recall') recalls++;
    if (decision.action.type === 'defend') defenses++;
    if (decision.action.type === 'trade') trades++;
    if (decision.action.type === 'accept') acceptances++;
    const oldRound = state.round;
    state = applyAction(state, decision.action);
    if (state.round !== oldRound) for (const player of state.players) {
      rulerlessRounds[player.seat] = player.ruler ? 0 : rulerlessRounds[player.seat] + 1;
      longestRulerlessRounds = Math.max(longestRulerlessRounds, rulerlessRounds[player.seat]);
    }
    assertInvariants(state);
    actions++;
  }
  if (state.phase !== 'terminal') throw new Error(`Finite-game failure: ${seats} seats, seed ${seed}.`);
  games.push({ cohort: configuration.cohort, dynasties: configuration.dynasties, seats, seed, actions,
    rounds: state.round, winner: state.result!.winner, claims, marriageClaims, recalls, defenses, trades,
    acceptances, rulerlessOpportunities, longestRulerlessRounds });
}
const cohorts = [...new Set(games.map(game => game.cohort))].map(cohort => {
  const selected = games.filter(game => game.cohort === cohort);
  return { cohort, games: selected.length, wins: selected.filter(game => game.winner !== null).length,
    capDraws: selected.filter(game => game.winner === null).length,
    recalls: selected.reduce((sum, game) => sum + game.recalls, 0), defenses: selected.reduce((sum, game) => sum + game.defenses, 0),
    bySeats: [2, 3, 4].map(seats => ({ seats, games: selected.filter(game => game.seats === seats).length,
      wins: selected.filter(game => game.seats === seats && game.winner !== null).length })) };
});
console.log(JSON.stringify({ method: 'Projected-view policy simulation; not browser play or human evidence.',
  games: games.length, wins: games.filter(game => game.winner !== null).length,
  capDraws: games.filter(game => game.winner === null).length, cohorts, records: games }, null, 2));
