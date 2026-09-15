import { test } from "node:test";
import assert from "node:assert/strict";
import { createDuel, aiResponse, chooseMove, type Royal } from "../src/duel";
import { CARDS } from "../src/content";
import { act, respond, moves, validateDuel, guards } from "../src/duel";
import {
  createLesson,
  lessonComplete,
  lessonOpponent,
  lessonMove,
  nextLesson,
  LESSONS,
} from "../src/lessons";
import { describeAction } from "../src/action-view";

test("one guided match reaches every milestone through legal actions, preserving state between steps", () => {
  const g = createLesson();
  assert.deepEqual(g.players.slice(1).map((p) => p.hand.length), [5, 5]);
  const cards = () =>
    g.players
      .flatMap((p) => p.court.concat(p.hand, p.deck, p.discard))
      .map((r) => r.uid)
      .sort();
  const original = cards();
  for (let i = 1; i <= LESSONS.length; i++) {
    assert.equal(g.lesson, i);
    for (let step = 0; step < 60 && !lessonComplete(g); step++) {
      assert.ok(validateDuel(g), `valid stage ${i}`);
      if (g.pending) respond(g, g.pending.defender === 0 ? "brace" : "accept");
      else {
        const a = g.turn === 0 ? lessonMove(g) : lessonOpponent(g);
        assert.ok(a, `stage ${i} has a next action`);
        assert.ok(
          moves(g).some((m) => JSON.stringify(m) === JSON.stringify(a)),
          `stage ${i} action is legal`,
        );
        act(g, a!);
      }
    }
    assert.ok(lessonComplete(g), `completed stage ${i}`);
    assert.deepEqual(cards(), original, "No cards created, replaced or lost");
    const state = structuredClone(g);
    nextLesson(g);
    state.lesson = g.lesson;
    assert.deepEqual(g, state, "Continue changes only the guide cursor");
  }
  assert.equal(g.winner, 0);
  assert.ok(!g.events.some((e) => e.kind === "draw" && e.actor !== 0));
  assert.ok(g.events.filter((e) => e.kind === "brace").length >= 3);
});

test("action explanations distinguish gold, orders and court capacity", () => {
  const g = createDuel({ seed: 42, house: "alba" });
  const p = g.players[0];
  p.gold = 30;
  g.orders = 0;
  const a = { type: "deploy" as const, uid: p.hand[0].uid };
  assert.match(describeAction(g, a).reason, /No orders/);
  g.orders = 2;
  p.court.push(...p.hand.splice(1, 4));
  assert.match(describeAction(g, a).reason, /five court places/);
});

test("an unsupported foreign Guardian preview does not promise protection", () => {
  const g = createDuel({ seed: 90, house: "alba", seats: 2 });
  const p = g.players[0];
  const foreign = CARDS.find(
    (c) => c.house !== p.house && c.role === "Lawgiver",
  )!;
  p.hand = [{ uid: "preview-foreign", card: foreign.id, hp: 5, ready: false }];
  p.gold = 10;
  const move = { type: "deploy" as const, uid: p.hand[0].uid };
  assert.match(describeAction(g, move).effect, /does not protect/);
  act(g, move);
  assert.equal(guards(p).length, 0);
});

test("a full-hand return preview identifies the actual discard destination", () => {
  const g = createDuel({ seed: 91, house: "alba" });
  const p = g.players[0];
  p.hand.push(...p.deck.splice(0, 2));
  const uid = p.court[0].uid;
  const move = { type: "recall" as const, uid };
  assert.match(describeAction(g, move).effect, /discard/);
  act(g, move);
  assert.ok(p.discard.some((r) => r.uid === uid));
});

test("a full foreign hand can be renewed without creating or losing cards", () => {
  const g = createDuel({ seed: 10, house: "alba" }),
    p = g.players[0];
  p.gold = 8;
  p.hand.push(...p.deck.splice(0, 2));
  const before = g.players
    .flatMap((p) => p.hand.concat(p.deck, p.discard, p.court))
    .map((r) => r.uid)
    .sort();
  const old = p.hand.map((r) => r.uid);
  assert.equal(describeAction(g, { type: "recruit" }).allowed, true);
  act(g, { type: "recruit" });
  assert.equal(p.hand.length, 5);
  assert.equal(p.gold, 6);
  assert.equal(g.orders, 1);
  assert.ok(old.every((id) => p.discard.some((r) => r.uid === id)));
  assert.deepEqual(
    g.players
      .flatMap((p) => p.hand.concat(p.deck, p.discard, p.court))
      .map((r) => r.uid)
      .sort(),
    before,
  );
});

test("survivors recover health and turn upright when their House acts again", () => {
  const g = createDuel({ seed: 19, house: "alba", seats: 2 }),
    r = g.players[0].court[0];
  r.hp = 1;
  r.ready = false;
  act(g, { type: "end" });
  assert.equal(r.hp, 1);
  act(g, { type: "end" });
  assert.equal(r.hp, 6);
  assert.equal(r.ready, true);
});

test("a Guardian gives up protection when it attacks", () => {
  const g = createDuel({ seed: 10, house: "alba", seats: 2 });
  const p = g.players[0],
    guard = p.hand.find(
      (r) => CARDS.find((c) => c.id === r.card)?.role === "Lawgiver",
    )!;
  p.hand = p.hand.filter((r) => r !== guard);
  p.court.push(guard);
  guard.ready = true;
  g.turn = 1;
  assert.ok(
    moves(g)
      .filter((a) => a.type === "attack")
      .every((a) => a.type === "attack" && a.target === guard.uid),
  );
  guard.ready = false;
  assert.ok(
    moves(g).some((a) => a.type === "attack" && a.target === `crown-0`),
  );
});

test("a paid Brace is not wasted when the same Royal dies anyway", () => {
  const g = createDuel({ seed: 42, house: "alba", seats: 2 });
  const a = g.players[0].court[0];
  const d = g.players[1].court[0];
  d.hp = 1;
  g.players[1].gold = 20;
  g.players[1].hand = [];
  g.pending = { actor: 0, defender: 1, attacker: a.uid, target: d.uid };
  assert.equal(aiResponse(g), "accept");
});

test("a teaching opponent can contest an imminent player claim", () => {
  const g = createDuel({ seed: 42, house: "alba", seats: 2, mode: "lesson" });
  const p = g.players[0];
  const ids = CARDS.filter(
    (c) => c.house === "alba" && c.role === "Royal",
  ).slice(0, 2);
  p.court = [
    p.court[0],
    ...ids.map(
      (c, i): Royal => ({
        uid: "learner-" + i,
        card: c.id,
        hp: 1,
        ready: true,
      }),
    ),
  ];
  p.claim = 1;
  p.challengers = [1];
  g.turn = 1;
  g.orders = 2;
  g.players[1].court[0].ready = true;
  const a = chooseMove(g);
  assert.equal(a.type, "attack");
});
