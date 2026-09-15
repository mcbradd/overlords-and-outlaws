import {
  createDuel,
  act,
  respond,
  chooseMove,
  aiResponse,
  validateDuel,
} from "../src/duel";
import { HOUSES } from "../src/content";
const report = { games: 600, witness: 0, rounds: 0 };
for (let n = 0; n < report.games; n++) {
  const g = createDuel({
    seed: 30000 + n,
    house: HOUSES[n % 6].id,
    seats: 2 + (n % 3),
  });
  for (let step = 0; step < 800 && !g.over; step++) {
    if (g.pending) respond(g, aiResponse(g));
    else act(g, chooseMove(g));
    if (!validateDuel(g))
      throw Error(`Invalid state: seed ${g.seed}, step ${step}`);
  }
  if (!g.over) throw Error(`Unfinished game ${g.seed}`);
  report.rounds += g.round;
  if (g.winner === -1) report.witness++;
}
console.log({ ...report, averageRounds: report.rounds / report.games });
