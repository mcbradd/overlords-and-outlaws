import { test } from "node:test";
import assert from "node:assert/strict";
import { actionPreview } from "../src/action-preview";
import {
  act,
  moves,
  createDuel,
  chooseMove,
  respond,
  aiResponse,
} from "../src/duel";

test("opponent previews are read-only public explanations throughout a legal match", () => {
  const g = createDuel({ seed: 831, house: "alba", seats: 4 });
  const seen = new Set<string>();
  for (let i = 0; i < 400 && !g.over; i++) {
    const move = g.pending ? aiResponse(g) : chooseMove(g);
    const before = structuredClone(g);
    const view = actionPreview(g, move);
    assert.deepEqual(g, before);
    if (view) {
      const p = g.players[view.actor];
      const revealed =
        typeof move !== "string" && "uid" in move ? move.uid : "";
      // Only the committed deployment may be named; all other hidden card IDs stay private.
      for (const r of g.players.flatMap((p) => p.hand)) {
        if (r.uid !== revealed) {
          assert.notEqual(view.source, r.uid);
          assert.notEqual(view.target, r.uid);
        }
      }
      assert.equal(
        view.actor,
        typeof move === "string" ? g.pending!.defender : g.turn,
      );
      assert.ok(view.source && view.target && view.title && view.detail);
      assert.ok(p);
      seen.add(typeof move === "string" ? move : move.type);
    }
    if (typeof move === "string") respond(g, move);
    else act(g, move);
  }
  assert.ok(seen.has("attack") && seen.has("deploy") && seen.has("claim"));
});

test("attacks use exact Royal, estate and crown targets instead of a House-wide highlight", () => {
  const g = createDuel({ seed: 831, house: "alba", seats: 2 });
  g.turn = 1;
  g.players[0].estates = 1;
  const attacks = moves(g).filter((m) => m.type === "attack");
  assert.ok(attacks.length >= 3);
  for (const move of attacks) {
    const view = actionPreview(g, move)!;
    assert.equal(view.source, "uid" in move ? move.uid : undefined);
    assert.equal(view.target, "target" in move ? move.target : undefined);
  }
});
