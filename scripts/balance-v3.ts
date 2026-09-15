import {
  createDuel,
  act,
  respond,
  chooseMove,
  aiResponse,
  validateDuel,
  type Policy,
} from "../src/duel";
import { HOUSES, card } from "../src/content";
import { mkdirSync, writeFileSync } from "node:fs";
const policies: Policy[] = ["rush", "economy", "defense", "adaptive"];
const report = {
  games: 0,
  witness: 0,
  rounds: 0,
  winsBySeat: {} as Record<number, number>,
  winsByPolicy: {} as Record<string, number>,
  gamesBySeats: {} as Record<number, number>,
  claims: 0,
  renewals: 0,
  royalsInWinningCourts: {} as Record<string, number>,
  samples: [] as unknown[],
};
for (let n = 0; n < 24; n++)
  for (const seats of [2, 3, 4])
    for (let rotate = 0; rotate < seats; rotate++) {
      const g = createDuel({
        seed: Number(process.argv[2] ?? 110000) + n,
        house: HOUSES[n % 6].id,
        seats,
      });
      g.players.forEach((p, i) => (p.policy = policies[(n + i) % 4]));
      g.players = [...g.players.slice(rotate), ...g.players.slice(0, rotate)];
      g.players.forEach((p, i) => (p.id = i));
      g.events = [];
      for (let step = 0; step < 800 && !g.over; step++) {
        if (g.pending) respond(g, aiResponse(g));
        else {
          const a = chooseMove(g);
          if (a.type === "claim") report.claims++;
          if (a.type === "recruit") report.renewals++;
          act(g, a);
        }
        if (!validateDuel(g))
          throw Error(`Invalid held-out state ${n}/${seats}/${rotate}`);
      }
      if (!g.over) throw Error("Nonterminal game");
      report.games++;
      report.rounds += g.round;
      report.gamesBySeats[seats] = (report.gamesBySeats[seats] ?? 0) + 1;
      if (g.winner === -1) report.witness++;
      else {
        const p = g.players[g.winner!];
        report.winsBySeat[g.winner!] = (report.winsBySeat[g.winner!] ?? 0) + 1;
        report.winsByPolicy[p.policy] =
          (report.winsByPolicy[p.policy] ?? 0) + 1;
        for (const r of p.court) {
          const role = card(r.card).role;
          report.royalsInWinningCourts[role] =
            (report.royalsInWinningCourts[role] ?? 0) + 1;
        }
      }
      report.samples.push({
        seed: g.seed,
        seats,
        rotation: rotate,
        rounds: g.round,
        winner: g.winner,
      });
    }
mkdirSync("artifacts/v3", { recursive: true });
writeFileSync(
  "artifacts/v3/held-out-balance.json",
  JSON.stringify(
    { ...report, averageRounds: report.rounds / report.games },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    ...report,
    samples: undefined,
    averageRounds: report.rounds / report.games,
  }),
);
