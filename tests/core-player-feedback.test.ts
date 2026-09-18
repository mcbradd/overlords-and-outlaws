import test from "node:test";
import assert from "node:assert/strict";
import { CARDS } from "../src/core-game/content";
import {
  legalActions,
  viewForSeat,
  applyAction,
  assertInvariants,
} from '../src/core-game/engine';
import { createGame } from '../tests/core-established-fixture';

function table() {
  const s = createGame({ seed: 501, dynasties: ["alba", "plantagenet"] });
  s.players[0].hand = ["alba-8"];
  s.players[1].hand = ["plantagenet-3"];
  s.players[1].played = ["alba-2"];
  s.deck = CARDS.filter(
    (c) =>
      s.dynasties.includes(c.dynasty) &&
      !s.players.some((p) =>
        [...p.hand, ...p.court, ...p.played].includes(c.id),
      ),
  ).map((c) => c.id);
  assertInvariants(s);
  return s;
}

test("TRADE-01: only a rival Played card can be requested", () => {
  const s = table();
  const trades = legalActions(viewForSeat(s, 0), 0).filter(
    (a) => a.type === "trade",
  );
  assert.ok(trades.length > 0);
  assert.deepEqual([...new Set(trades.map((a) => a.request))], ["alba-2"]);
  const before = structuredClone(s);
  for (const request of [
    "plantagenet-3",
    "plantagenet-0",
    s.deck[0],
    "alba-8",
  ]) {
    assert.throws(() =>
      applyAction(s, {
        type: "trade",
        seat: 0,
        revision: 0,
        card: "alba-8",
        other: 1,
        request,
      }),
    );
    assert.deepEqual(s, before);
  }
});

test("TRADE-02: acceptance exchanges with Played even with an empty rival hand", () => {
  const s = table();
  s.deck.push(...s.players[1].hand);
  s.players[1].hand = [];
  const pending = applyAction(s, {
    type: "trade",
    seat: 0,
    revision: 0,
    card: "alba-8",
    other: 1,
    request: "alba-2",
  });
  const accepted = applyAction(pending, {
    type: "accept",
    seat: 1,
    revision: 1,
  });
  assert.deepEqual(accepted.players[0].played, ["alba-2"]);
  assert.deepEqual(accepted.players[1].played, ["alba-8"]);
  assert.deepEqual(accepted.players[1].hand, []);
  assertInvariants(accepted);
  assert.throws(() =>
    applyAction(accepted, { type: "accept", seat: 1, revision: 1 }),
  );
  const declined = applyAction(pending, {
    type: "decline",
    seat: 1,
    revision: 1,
  });
  assert.deepEqual(declined.players[1].played, ["alba-2"]);
  assert.deepEqual(declined.players[0].hand, ["alba-8"]);
});

test("MARRIAGE-01: a foreign held card cannot enter Court without marriage", () => {
  const s = table();
  s.players[0].hand.push("plantagenet-13");
  s.deck = s.deck.filter((id) => id !== "plantagenet-13");
  const options = legalActions(viewForSeat(s, 0), 0);
  assert.ok(
    !options.some(
      (a) =>
        a.card === "plantagenet-13" &&
        ["recruit", "name-heir"].includes(a.type),
    ),
  );
  assert.throws(() =>
    applyAction(s, {
      type: "recruit",
      seat: 0,
      revision: 0,
      card: "plantagenet-13",
    }),
  );
  s.players[0].court.push("alba-1");
  s.deck = s.deck.filter((id) => id !== "alba-1");
  assertInvariants(s);
  const next = applyAction(s, {
    type: "marry-heir",
    seat: 0,
    revision: 0,
    card: "plantagenet-13",
    supporter: "alba-0",
  });
  assert.ok(next.players[0].court.includes("plantagenet-13"));
  assert.deepEqual(next.marriages, [
    { seat: 0, queen: "alba-0", spouse: "plantagenet-13" },
  ]);
});
