import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createDuel,
  act,
  respond,
  moves,
  reactions,
  chooseMove,
  aiResponse,
  nativeCount,
  claimCost,
  canHold,
  income,
  upkeep,
  spec,
  validateDuel,
  paintingCounts,
  WITNESS_LIMIT,
  guards,
  dynastyCount,
  active,
  type Duel,
  type Royal,
} from "../src/duel";
import { card, HOUSES, type Role } from "../src/content";
function expose(g: Duel, player: number, role: Role) {
  const p = g.players[player];
  let source = p.hand;
  let index = source.findIndex(
    (r) => card(r.card).role === role && card(r.card).house === p.house,
  );
  if (index < 0) {
    source = p.deck;
    index = source.findIndex(
      (r) => card(r.card).role === role && card(r.card).house === p.house,
    );
  }
  assert.ok(index >= 0);
  const r = source.splice(index, 1)[0];
  r.ready = true;
  p.court.push(r);
  return r;
}

test("opening treasuries are equal; income starts on the second circuit", () => {
  const g = createDuel({ seed: 1, house: "alba", seats: 4 });
  assert.ok(g.players.every((p) => p.gold === 5));
  for (let i = 0; i < 3; i++) {
    act(g, { type: "end" });
    assert.equal(g.players[g.turn].gold, 5);
  }
  act(g, { type: "end" });
  assert.equal(g.round, 2);
  assert.equal(g.players[0].gold, 9);
});

test("marriage creates legitimacy and loss of the root Queen breaks the whole dependent chain", () => {
  const g = createDuel({ seed: 1, house: "alba" }),
    p = g.players[0],
    queen = expose(g, 0, "Queen");
  const foreign = g.players[1].hand.find((r) => card(r.card).role === "Queen")!;
  const dependent = g.players[2].hand.find(
    (r) => card(r.card).role === "Royal",
  )!;
  for (const [owner, r] of [
    [g.players[1], foreign],
    [g.players[2], dependent],
  ] as const)
    owner.hand = owner.hand.filter((x) => x !== r);
  p.court.push(foreign, dependent);
  foreign.marriedTo = queen.uid;
  dependent.marriedTo = foreign.uid;
  assert.equal(nativeCount(p), 2);
  assert.equal(dynastyCount(p), 4);
  p.gold = 30;
  act(g, { type: "claim" });
  act(g, { type: "recall", uid: queen.uid });
  assert.equal(p.claim, 0);
  assert.equal(dynastyCount(p), 1);
  assert.equal(active(p, dependent), false);
  assert.ok(validateDuel(g));
});

test("production AI choices do not depend on opponents concealed cards", () => {
  const g = createDuel({ seed: 91, house: "alba" }),
    copy = structuredClone(g);
  for (const p of copy.players.slice(1)) {
    const all = [...p.hand, ...p.deck].reverse();
    p.hand = all.slice(0, 5);
    p.deck = all.slice(5);
  }
  assert.deepEqual(chooseMove(g), chooseMove(copy));
});
test("tables support two to four players with conserved unique historical cards", () => {
  for (const seats of [2, 3, 4])
    for (let seed = 0; seed < 20; seed++) {
      const g = createDuel({ seed, house: "alba", seats, humans: seats });
      assert.equal(g.players.length, seats);
      assert.ok(g.players.every((p) => p.human));
      assert.ok(validateDuel(g));
      const cards = g.players
        .flatMap((p) => [...p.hand, ...p.deck, ...p.court])
        .map((r) => r.card);
      assert.equal(new Set(cards).size, cards.length);
    }
});
test("claim windows derive from actual rival Houses, and each closes only once", () => {
  for (const seats of [2, 3, 4]) {
    const g = createDuel({ seed: 1, house: "alba", seats, mode: "lesson" });
    expose(g, 0, "Royal");
    expose(g, 0, "Lawgiver");
    g.players[0].gold = 30;
    assert.ok(canHold(g.players[0]));
    act(g, { type: "claim" });
    assert.deepEqual(
      g.players[0].challengers,
      Array.from({ length: seats - 1 }, (_, i) => i + 1),
    );
    act(g, { type: "end" });
    for (let i = 1; i < seats; i++) {
      assert.equal(g.over, false);
      act(g, { type: "end" });
    }
    assert.equal(g.winner, 0);
    assert.match(g.reason, /every other House/);
  }
});
test("invalid orders are atomic", () => {
  const g = createDuel({ seed: 3, house: "tudor" }),
    before = JSON.stringify(g);
  assert.throws(() => act(g, { type: "claim" }));
  assert.equal(JSON.stringify(g), before);
});
test("Guard intercepts challenges only for its own House", () => {
  const g = createDuel({ seed: 3, house: "alba" }),
    guard = expose(g, 1, "Lawgiver");
  const attacks = moves(g).filter((a) => a.type === "attack");
  assert.ok(!attacks.some((a) => "target" in a && a.target === "crown-1"));
  assert.ok(attacks.some((a) => "target" in a && a.target === guard.uid));
  assert.ok(attacks.some((a) => "target" in a && a.target === "crown-2"));
});
test("Brace spends gold and blocks pressure", () => {
  const g = createDuel({ seed: 4, house: "alba" });
  const victim = expose(g, 1, "Warlord"),
    a = g.players[0].court[0];
  act(g, { type: "attack", uid: a.uid, target: victim.uid });
  assert.ok(reactions(g).includes("brace"));
  const gold = g.players[1].gold;
  respond(g, "brace");
  assert.equal(victim.hp, 1);
  assert.equal(g.players[1].gold, gold - 2);
  assert.equal(g.players[1].response, false);
  assert.ok(validateDuel(g));
});
test("Ambush spends a concealed Conspirator and can stop the attack before damage", () => {
  const g = createDuel({ seed: 9, house: "alba" }),
    q = g.players[1],
    a = g.players[0].court[0];
  const trap = q.deck.find((r) => card(r.card).role === "Intriguer")!;
  q.deck = q.deck.filter((r) => r !== trap);
  q.hand.push(trap);
  a.hp = 3;
  act(g, { type: "attack", uid: a.uid, target: "crown-1" });
  respond(g, "ambush");
  assert.equal(q.stability, 12);
  assert.ok(q.discard.includes(trap));
  assert.ok(!g.players[0].court.includes(a));
  assert.ok(validateDuel(g));
});
test("a Queen loss disables a foreign Guardian without deleting the ally", () => {
  const g = createDuel({ seed: 10, house: "alba" }),
    q = g.players[1],
    queen = expose(g, 1, "Queen");
  const foreign = g.players[2].hand.find(
    (r) => card(r.card).role === "Lawgiver",
  )!;
  g.players[2].hand = g.players[2].hand.filter((r) => r !== foreign);
  q.court.push(foreign);
  foreign.marriedTo = queen.uid;
  foreign.ready = true;
  assert.ok(guards(q).includes(foreign));
  g.turn = 1;
  act(g, { type: "recall", uid: queen.uid });
  assert.ok(q.court.includes(foreign));
  assert.ok(!guards(q).includes(foreign));
  assert.equal(foreign.marriedTo, undefined);
  assert.ok(validateDuel(g));
});
test("Witness victory comes from cyclic nine-fragment paintings, never real time", () => {
  const g = createDuel({ seed: 11, house: "alba", seats: 4 });
  for (let round = 0; round < WITNESS_LIMIT; round++) {
    for (let i = 0; i < 4; i++) act(g, { type: "end" });
    assert.deepEqual(
      paintingCounts(g).reduce((a, b) => a + b, 0),
      round + 1,
    );
    if (round < WITNESS_LIMIT - 1) assert.equal(g.over, false);
  }
  assert.deepEqual(paintingCounts(g), [9, 8, 8]);
  assert.equal(g.winner, -1);
  assert.match(g.reason, /nine-fragment/);
});
test("exhausted archives recycle displaced Royals without duplicating or losing cards", () => {
  const g = createDuel({ seed: 12, house: "alba" }),
    p = g.players[0];
  p.discard.push(...p.deck.splice(0), ...p.hand.splice(0));
  act(g, { type: "end" });
  act(g, { type: "end" });
  act(g, { type: "end" });
  assert.equal(p.hand.length, 5);
  assert.ok(validateDuel(g));
});
test("family players can choose every House without duplicates", () => {
  const houses = ["tudor", "alba", "bourbon", "habsburg"] as const;
  const g = createDuel({
    seed: 13,
    house: "tudor",
    seats: 4,
    humans: 4,
    houses: [...houses],
  });
  assert.deepEqual(
    g.players.map((p) => p.house),
    houses,
  );
  assert.throws(() =>
    createDuel({ seed: 13, house: "alba", seats: 2, houses: ["alba", "alba"] }),
  );
});
test("seizing a native Royal breaks a declared dynasty, with a specific cause", () => {
  const g = createDuel({ seed: 5, house: "alba", mode: "lesson" });
  expose(g, 0, "Royal");
  const target = expose(g, 0, "Warlord");
  g.players[0].gold = 30;
  target.hp = 1;
  act(g, { type: "claim" });
  act(g, { type: "end" });
  g.players[0].response = false;
  act(g, {
    type: "attack",
    uid: g.players[1].court[0].uid,
    target: target.uid,
  });
  assert.equal(g.players[0].claim, 0);
  assert.equal(nativeCount(g.players[0]), 2);
  assert.ok(
    g.events.some((e) => e.kind === "broken" && e.why.includes("Only 2")),
  );
  assert.ok(g.players[1].hand.some((r) => r.uid === target.uid));
});
test("upkeep and coronation cost grow with exposed obligations", () => {
  const g = createDuel({ seed: 6, house: "alba" });
  expose(g, 0, "Royal");
  expose(g, 0, "Warlord");
  expose(g, 0, "Queen");
  const p = g.players[0];
  assert.equal(upkeep(p), 1);
  assert.equal(income(p), 4);
  assert.equal(claimCost(p), 12);
});
test("normal games terminate with an explicit reason across all table sizes", () => {
  for (let n = 0; n < 100; n++) {
    const g = createDuel({
      seed: n + 10,
      house: HOUSES[n % 6].id,
      seats: 2 + (n % 3),
    });
    for (let step = 0; step < 700 && !g.over; step++) {
      if (g.pending) respond(g, aiResponse(g));
      else act(g, chooseMove(g));
      assert.ok(validateDuel(g), `invalid ${n}, step ${step}`);
    }
    assert.equal(g.over, true, `unterminated ${n}`);
    assert.ok(g.reason);
  }
});
