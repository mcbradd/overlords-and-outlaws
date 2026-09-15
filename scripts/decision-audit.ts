import { classifyChoices } from "./choice-classification";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  createDuel,
  act,
  respond,
  moves,
  reactions,
  chooseMove,
  aiResponse,
  validateDuel,
  type Duel,
  type Move,
  type Policy,
} from "../src/duel";
import { card, HOUSES } from "../src/content";
const count = Number(process.argv[2] ?? 200),
  tag = process.argv[3] ?? "latest";
const policies: Policy[] = ["rush", "economy", "defense", "adaptive"];
type Audit = {
  games: number;
  rounds: number;
  wins: Record<string, number>;
  seatWins: Record<string, number>;
  decisions: number;
  forced: number;
  dominant: number;
  tradeoffs: number;
  trivial: number;
  unavoidableLoss: number;
  responses: number;
  responseChoices: number;
  actions: Record<string, number>;
  examples: unknown[];
  histogram: Record<string, number>;
};
const responseAudit = {
  decisions: 0,
  forced: 0,
  dominant: 0,
  tradeoffs: 0,
  trivial: 0,
  unavoidableLoss: 0,
};
const result: Audit = {
  games: count,
  rounds: 0,
  wins: {},
  seatWins: {},
  decisions: 0,
  forced: 0,
  dominant: 0,
  tradeoffs: 0,
  trivial: 0,
  unavoidableLoss: 0,
  responses: 0,
  responseChoices: 0,
  actions: {},
  examples: [],
  histogram: {},
};
function evaluate(g: Duel, id: number) {
  if (!g.over) throw Error("Counterfactual did not terminate");
  return Number(g.winner === id);
}
function category(a: Move, g: Duel) {
  if (a.type === "deploy" || a.type === "marry")
    return (
      a.type +
      ":" +
      card(g.players[g.turn].hand.find((r) => r.uid === a.uid)!.card).role
    );
  if (a.type === "recall") return "recall:" + a.uid;
  if (a.type === "attack") return "attack:" + a.target;
  return a.type;
}
function examine(g: Duel) {
  const id = g.turn;
  const valid = moves(g);
  if (g.orders === 0) return;
  result.decisions++;
  const candidates = new Map<string, Move>();
  for (const policy of policies) {
    const a = chooseMove(structuredClone(g), policy);
    candidates.set(category(a, g), a);
  }
  for (const a of valid) {
    const key = category(a, g);
    if (
      !candidates.has(key) &&
      ["estate", "fortify", "restore", "recruit", "end"].includes(a.type)
    )
      candidates.set(key, a);
  }
  const options = [...candidates.values()].slice(0, 9);
  if (options.length < 2) {
    result.trivial++;
    return;
  }
  const scores = options
    .map((a) => {
      const outcomes = policies.map((policy) => {
        const copy = structuredClone(g);
        act(copy, a);
        let n = 0;
        while (!copy.over && n++ < 650) {
          if (copy.pending) respond(copy, aiResponse(copy));
          else act(copy, chooseMove(copy, policy));
        }
        return evaluate(copy, id);
      });
      return {
        move: a,
        mean: outcomes.reduce((a, b) => a + b, 0) / outcomes.length,
        outcomes,
      };
    })
    .sort((a, b) => b.mean - a.mean);
  const classification = classifyChoices(scores.map((s) => s.outcomes));
  result[classification.kind]++;
  if (classification.kind === "tradeoffs" && result.examples.length < 12)
    result.examples.push({
      seed: g.seed,
      round: g.round,
      house: g.players[id].house,
      orders: g.orders,
      first: scores[classification.frontier[0]],
      second: scores[classification.frontier[1]],
      explanation:
        "Each alternative wins a continuation where the other loses; neither dominates the other.",
    });
}
function examineResponse(g: Duel) {
  const id = g.pending!.defender;
  responseAudit.decisions++;
  const scores = reactions(g)
    .map((r) => {
      const outcomes = policies.map((policy) => {
        const copy = structuredClone(g);
        respond(copy, r);
        let n = 0;
        while (!copy.over && n++ < 650) {
          if (copy.pending) respond(copy, aiResponse(copy));
          else act(copy, chooseMove(copy, policy));
        }
        return evaluate(copy, id);
      });
      return {
        outcomes,
        mean: outcomes.reduce((a, b) => a + b, 0) / outcomes.length,
      };
    })
    .sort((a, b) => b.mean - a.mean);
  responseAudit[classifyChoices(scores.map((s) => s.outcomes)).kind]++;
}
for (let n = 0; n < count; n++) {
  if (n % 25 === 0) console.log(`Auditing ${n}/${count}`);
  const g = createDuel({
    seed: 20000 + n,
    house: HOUSES[n % 6].id,
    seats: 2 + (n % 3),
    policy: policies[n % 4],
  });
  g.players.forEach((p, i) => (p.policy = policies[(n + i) % 4]));
  let steps = 0;
  while (!g.over && steps++ < 800) {
    if (g.pending) {
      if (g.pending.defender === 0) examineResponse(g);
      result.responses++;
      const rs = reactions(g);
      if (rs.length > 1) result.responseChoices++;
      respond(g, aiResponse(g));
    } else {
      if (g.turn === 0) examine(g);
      const a = chooseMove(g);
      result.actions[a.type] = (result.actions[a.type] ?? 0) + 1;
      act(g, a);
    }
    if (!validateDuel(g)) throw Error(`Invalid ${n} at ${steps}`);
  }
  if (!g.over) throw Error(`Unfinished ${n}`);
  result.rounds += g.round;
  const winner = g.winner === -1 ? "Witness" : g.players[g.winner!].policy;
  result.wins[winner] = (result.wins[winner] ?? 0) + 1;
  result.seatWins[String(g.winner)] =
    (result.seatWins[String(g.winner)] ?? 0) + 1;
  result.histogram[g.round] = (result.histogram[g.round] ?? 0) + 1;
}
mkdirSync("artifacts/v2", { recursive: true });
writeFileSync(
  `artifacts/v2/audit-${tag}.json`,
  JSON.stringify(
    {
      ...result,
      responseAudit,
      averageRounds: result.rounds / count,
      method:
        "Strict victory-set proxy, not human enjoyment. Up to nine candidate orders and all available responses are rolled to termination under four continuation policies. Own victory=1; all losses, including Witness,=0. No winning candidate: unavoidableLoss. Exactly one: forced. Multiple distinct non-dominated victory sets: tradeoffs. One frontier vector shared by multiple candidates: trivial. Otherwise: dominant. Production AI never reads rival hands; offline diagnostic rollouts retain fixture state.",
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      ...result,
      responseAudit,
      examples: result.examples.slice(0, 1),
      averageRounds: result.rounds / count,
    },
    null,
    2,
  ),
);
