import {
  createGame,
  applyAction,
  assertInvariants,
} from "../src/history-engine/engine";
import { chooseAction } from "../src/history-engine/ai";
import { viewForSeat } from "../src/history-engine/view";
import { MODULES, type Dynasty } from "../src/history-engine/types";
import { combinations } from "../src/history-engine/rules";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const results = [];
const gamesPerGroup = Number(process.env.HISTORY_SAMPLES ?? 12);
for (const count of [2, 3, 4])
  for (const group of combinations([...MODULES], count))
    for (let run = 0; run < gamesPerGroup; run++) {
      const modules = group as Dynasty[];
      let s = createGame({ modules, seed: 91801 + run * 7919 });
      const stats = {
        modules,
        seed: 91801 + run * 7919,
        actions: 0,
        claims: 0,
        proclamations: 0,
        veils: 0,
        barters: 0,
        repairs: 0,
      };
      let maxDecisionMs = 0;
      while (!s.result && stats.actions < 1000) {
        let moved = false;
        for (const p of s.players) {
          const start = performance.now();
          const d = chooseAction(viewForSeat(s, p.seat), p.seat);
          maxDecisionMs = Math.max(maxDecisionMs, performance.now() - start);
          if (!d) continue;
          s = applyAction(s, d.action);
          stats.actions++;
          if (d.action.type === "claim") stats.claims++;
          if (d.action.type === "proclaim") stats.proclamations++;
          if (d.action.type === "veil") stats.veils++;
          if (d.action.type === "barter") stats.barters++;
          if (d.action.type === "repair") stats.repairs++;
          assertInvariants(s);
          moved = true;
          break;
        }
        assert.ok(moved, `No legal continuation at ${s.phase}`);
      }
      assert.ok(s.result);
      assert.ok(s.round < 22);
      results.push({
        ...stats,
        round: s.round,
        result: s.result,
        maxDecisionMs,
      });
    }
const summary = {
  games: results.length,
  playerWins: results.filter((r) => r.result?.winner !== "eudoxia").length,
  eudoxia: results.filter((r) => r.result?.winner === "eudoxia").length,
  maxRound: Math.max(...results.map((r) => r.round)),
  maxDecisionMs: Math.max(...results.map((r) => r.maxDecisionMs)),
  note: "Deterministic software policy coverage only; not human balance, preference, duration or paper-adjudication evidence.",
};
mkdirSync("artifacts/history", { recursive: true });
writeFileSync(
  "artifacts/history/simulation.json",
  JSON.stringify({ summary, results }, null, 2),
);
console.log(summary);
