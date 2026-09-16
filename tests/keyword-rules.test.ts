import { test } from "node:test";
import assert from "node:assert/strict";
import { CARDS, type HouseId, type Role } from "../src/content";
import {
  createDuel,
  act,
  respond,
  moves,
  spec,
  attackForce,
  validateDuel,
  income,
  type Royal,
} from "../src/duel";

const noble = (house: HouseId, role: Role, uid: string): Royal => {
  const card = CARDS.find((c) => c.house === house && c.role === role)!;
  return { uid, card: card.id, hp: spec(card.id).resolve, ready: true };
};

test("Spent Guardians protect all pieces; multiple Guardians remain legal targets until the last leaves", () => {
  const g = createDuel({ seed: 8, house: "alba", seats: 2 });
  const p = g.players[0],
    q = g.players[1];
  const a = noble(q.house, "Lawgiver", "guard-a"),
    b = noble(q.house, "Lawgiver", "guard-b");
  a.ready = b.ready = false;
  q.court.push(a, b);
  q.estates = 1;
  const targets = () =>
    moves(g)
      .filter((m) => m.type === "attack")
      .map((m) => (m.type === "attack" ? m.target : undefined));
  assert.deepEqual(new Set(targets()), new Set([a.uid, b.uid]));
  q.court = q.court.filter((r) => r !== a);
  assert.deepEqual(new Set(targets()), new Set([b.uid]));
  q.court = q.court.filter((r) => r !== b);
  assert.ok(targets().includes(`crown-${q.id}`));
  assert.ok(targets().includes(`estate-${q.id}`));
  assert.ok(targets().includes(q.court[0].uid));
  assert.ok(p.court[0].ready);
});

test("Commander bonuses stack for attacks, including self, without increasing retaliation", () => {
  const g = createDuel({ seed: 9, house: "alba", seats: 2 });
  const p = g.players[0],
    q = g.players[1];
  p.court.push(
    noble(p.house, "Warlord", "commander-a"),
    noble(p.house, "Warlord", "commander-b"),
  );
  const attacker = p.court[1];
  attacker.hp = 10;
  const defender = noble(q.house, "Warlord", "defender");
  defender.hp = 10;
  q.court = [defender];
  assert.equal(attackForce(p, attacker), 5);
  act(g, { type: "attack", uid: attacker.uid, target: defender.uid });
  if (g.pending) respond(g, "accept");
  assert.equal(defender.hp, 5);
  assert.equal(
    attacker.hp,
    7,
    "defender's own Commander bonus does not apply to retaliation",
  );
  p.court = p.court.filter((r) => r.uid !== "commander-b");
  assert.equal(attackForce(p, attacker), 4);
});

test("Founder entry funds setup from 9 to 12 and triggers again on a paid replay", () => {
  const g = createDuel({ seed: 10, house: "alba", seats: 2 });
  assert.ok(g.players.every((p) => p.stability === 12));
  assert.equal(
    g.events.filter((e) => e.kind === "founder" && e.amount === 3).length,
    2,
  );
  const p = g.players[0],
    founder = p.court[0];
  p.gold = 30;
  p.stability = 6;
  act(g, { type: "recall", uid: founder.uid });
  act(g, { type: "deploy", uid: founder.uid });
  assert.equal(p.stability, 9);
  assert.equal(founder.ready, false);
  p.stability = 11;
  g.orders = 2;
  act(g, { type: "recall", uid: founder.uid });
  act(g, { type: "deploy", uid: founder.uid });
  assert.equal(p.stability, 14);
});

test("Ambush discards its card and costs 2 gold without ending the defense window", () => {
  const g = createDuel({ seed: 11, house: "alba", seats: 2 });
  const p = g.players[0],
    q = g.players[1];
  const trap = noble(q.house, "Intriguer", "trap");
  q.hand = [trap];
  q.gold = 5;
  act(g, { type: "attack", uid: p.court[0].uid, target: `crown-${q.id}` });
  respond(g, "ambush");
  assert.equal(q.gold, 3);
  assert.ok(g.pending);
  assert.ok(q.discard.includes(trap));
  assert.ok(!q.hand.includes(trap) && !q.court.includes(trap));
  assert.equal(p.court[0].hp, 3);
});

test("multiple Ambushes can stop one attack and another Ambush remains usable on the next attack", () => {
  const g = createDuel({ seed: 12, house: "alba", seats: 2 });
  const p = g.players[0],
    q = g.players[1],
    first = p.court[0];
  const second = noble(p.house, "Royal", "second-attacker");
  p.court.push(second);
  q.hand = [0, 1, 2].map((i) => noble(q.house, "Intriguer", `trap-${i}`));
  q.gold = 10;
  act(g, { type: "attack", uid: first.uid, target: `crown-${q.id}` });
  respond(g, "ambush");
  assert.ok(g.pending);
  assert.equal(first.hp, 3);
  respond(g, "ambush");
  assert.equal(g.pending, null);
  assert.ok(p.discard.includes(first));
  assert.equal(q.stability, 12);
  assert.equal(q.gold, 6);
  act(g, { type: "attack", uid: second.uid, target: `crown-${q.id}` });
  respond(g, "ambush");
  assert.equal(g.pending, null);
  assert.equal(q.gold, 4);
  assert.equal(q.hand.length, 0);
  assert.equal(q.discard.length, 3);
});

test("Brace reductions accumulate only for the current attack and leave combat pending until resolved", () => {
  const g = createDuel({ seed: 13, house: "alba", seats: 2 });
  const p = g.players[0],
    q = g.players[1];
  q.gold = 10;
  act(g, { type: "attack", uid: p.court[0].uid, target: `crown-${q.id}` });
  respond(g, "brace");
  respond(g, "brace");
  assert.equal(g.pending?.blocked, 4);
  assert.equal(q.gold, 6);
  assert.equal(q.stability, 12);
  respond(g, "accept");
  assert.equal(q.stability, 12);
  assert.equal(g.pending, null);
  p.court[0].ready = true;
  act(g, { type: "attack", uid: p.court[0].uid, target: `crown-${q.id}` });
  respond(g, "accept");
  assert.equal(q.stability, 8);
});

test("Restore remains legal above twelve Stability and adds its full amount", () => {
  const g = createDuel({ seed: 14, house: "alba", seats: 2 });
  g.players[0].stability = 30;
  act(g, { type: "restore" });
  assert.equal(g.players[0].stability, 33);
  assert.equal(g.players[0].gold, 3);
});

test("holdings can grow beyond the former limits through paid legal actions", () => {
  const g = createDuel({ seed: 31, house: "alba", seats: 2 });
  const p = g.players[0];
  p.gold = 75;
  p.estates = 3;
  p.shield = 5;
  p.court.push(...p.deck.splice(0, 5));
  const next = p.hand[0];
  act(g, { type: "deploy", uid: next.uid });
  assert.equal(p.court.length, 7);
  act(g, { type: "estate" });
  assert.equal(p.estates, 4);
  g.orders = 2;
  act(g, { type: "fortify" });
  assert.equal(p.shield, 8);
  p.hand.push(...p.deck.splice(0, 4));
  const before = p.hand.length;
  act(g, { type: "recall", uid: next.uid });
  assert.equal(p.hand.length, before + 1);
  assert.ok(p.hand.length > 7);
  assert.ok(validateDuel(g));
  const held = p.hand.length,
    gold = p.gold,
    earned = income(p);
  act(g, { type: "end" });
  act(g, { type: "end" });
  assert.equal(p.gold, gold + earned);
  assert.ok(p.gold > 30);
  assert.equal(p.hand.length, held, "Readying does not discard excess cards");
  assert.ok(
    validateDuel(JSON.parse(JSON.stringify(g))),
    "large holdings survive save/load validation",
  );
});
