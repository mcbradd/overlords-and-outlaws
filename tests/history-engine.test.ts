import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  applyAction,
  assertInvariants,
  advanceBoundary,
  adjudicateEffectFixture,
} from "../src/history-engine/engine";
import {
  legalActions,
  supported,
  crownDependencies,
} from "../src/history-engine/rules";
import { chooseAction } from "../src/history-engine/ai";
import {
  viewForSeat,
  viewForSpectator,
  publicReplay,
} from "../src/history-engine/view";
import {
  CONTENT_VERSION,
  NOBLES,
  INTERREGNA,
  FRAGMENTS,
  dynastyOf,
} from "../src/history-engine/content";
import { previewAction } from "../src/history-engine/preview";
import type { Action, Dynasty, GameState } from "../src/history-engine/types";

export function fixture(
  modules: Dynasty[] = ["alba", "plantagenet", "tudor", "habsburg"],
): GameState {
  const s = createGame({ modules, seed: 27 });
  s.setup = null;
  s.phase = "action";
  s.round = 2;
  s.first = 0;
  s.active = 0;
  s.events = [];
  s.observations = Object.fromEntries(s.players.map((p) => [p.seat, []]));
  for (const p of s.players) {
    p.hand = [];
    p.court = [];
    p.leverage = [];
    p.dynasty = modules[p.seat];
    p.ruler = null;
  }
  s.dynastyDeck = NOBLES.filter((c) => modules.includes(c.printed.dynasty)).map(
    (c) => c.id,
  );
  s.historyDeck = [...INTERREGNA, ...FRAGMENTS]
    .filter((c) => modules.includes(c.printed.dynasty))
    .map((c) => c.id);
  return s;
}
export function place(
  s: GameState,
  seat: number,
  zone: "court" | "hand" | "leverage",
  ...ids: string[]
) {
  for (const id of ids) {
    s.dynastyDeck = s.dynastyDeck.filter((c) => c !== id);
    for (const p of s.players)
      for (const z of ["hand", "court", "leverage"] as const)
        p[z] = p[z].filter((c) => c !== id);
    s.players[seat][zone].push(id);
  }
}
function act(
  s: GameState,
  a: Omit<Action, "seat" | "revision"> & { seat?: number },
): GameState {
  return applyAction(s, {
    ...a,
    seat: a.seat ?? s.active,
    revision: s.revision,
  });
}
function passRound(s: GameState): GameState {
  const round = s.round;
  let guard = 0;
  while (s.round === round && !s.result && guard++ < 30) {
    if (s.phase === "choice") {
      const c = s.choices!.requests.find((c) => c.selection === null)!;
      s = act(s, {
        type: "choice",
        seat: c.chooser,
        choiceId: c.id,
        cards: [c.allowedIds[0]],
      });
    } else s = act(s, { type: "pass" });
  }
  return s;
}
function event(
  s: GameState,
  id: string,
  status: "pending" | "active" = "pending",
) {
  s.historyDeck = s.historyDeck.filter((c) => c !== id);
  s.history.push({
    id,
    order: ++s.revealSequence,
    status,
    revealed: s.round,
    activated: status === "active" ? s.round : null,
    expires: status === "active" ? s.round + 1 : null,
    obligated: s.players.map((p) => p.seat),
    fulfilled: [],
    contributions: [],
    attacks: [],
    restoreIds: {},
  });
}
function fragment(s: GameState, id: string) {
  s.historyDeck = s.historyDeck.filter((c) => c !== id);
  s.fragments.push({
    id,
    dynasty: dynastyOf(id),
    slot: Number(id.slice(-1)),
    onceVeiled: false,
    veil: null,
  });
}

test("all 2/3/4-seat drafts terminate, conserve the manifest, and keep locked packets private", () => {
  for (const modules of [
    ["alba", "plantagenet"],
    ["alba", "plantagenet", "tudor"],
    ["alba", "plantagenet", "tudor", "habsburg"],
  ] as Dynasty[][])
    for (let seed = 1; seed <= 12; seed++) {
      let s = createGame({ modules, seed });
      let steps = 0;
      while (s.phase === "setup" && steps++ < 80) {
        let done = false;
        for (const p of s.players) {
          const decision = chooseAction(viewForSeat(s, p.seat), p.seat);
          if (decision) {
            s = applyAction(s, decision.action);
            done = true;
            break;
          }
        }
        assert.ok(done, "setup must offer a legal continuation");
        assertInvariants(s);
      }
      assert.notEqual(s.phase, "setup");
      assert.equal(s.round, 1);
      assert.equal(
        s.players.every((p) => p.court.length === 3 && p.hand.length === 5),
        true,
      );
    }
});
test("preview is state-neutral, stale and illegal actions are atomic", () => {
  const s = fixture();
  place(s, 0, "hand", "alba-0");
  const a: Action = {
    type: "build",
    seat: 0,
    revision: s.revision,
    card: "alba-0",
  };
  const before = JSON.stringify(s);
  previewAction(viewForSeat(s, 0), a);
  assert.equal(JSON.stringify(s), before);
  assert.throws(() => applyAction(s, { ...a, revision: 99 }));
  assert.throws(() => applyAction(s, { ...a, card: "plantagenet-0" }));
  assert.equal(JSON.stringify(s), before);
});
test("pass does not withdraw and a committed action clears consecutive passes", () => {
  let s = fixture();
  place(s, 1, "hand", "plantagenet-0");
  s = act(s, { type: "pass" });
  s = act(s, { type: "build", card: "plantagenet-0" });
  assert.deepEqual(s.passes, []);
  assert.equal(s.players[0].seals, 3);
  s = act(s, { type: "pass" });
  s = act(s, { type: "pass" });
  assert.equal(s.active, 0);
  s = act(s, { type: "petition" });
  assert.deepEqual(s.passes, []);
});
test("Counterclaim spends both seals and proof once across reload; target register persists", () => {
  let s = fixture();
  place(s, 0, "hand", "plantagenet-1");
  place(s, 1, "court", "plantagenet-0");
  place(s, 1, "hand", "plantagenet-2");
  s.players[1].ruler = "plantagenet-0";
  s = act(s, { type: "claim", card: "plantagenet-1", target: "plantagenet-0" });
  const saved = JSON.parse(JSON.stringify(s));
  assert.equal(s.players[0].seals, 2);
  s = act(saved, { type: "counterclaim", seat: 1, card: "plantagenet-2" });
  assert.equal(s.players[1].seals, 2);
  assert.deepEqual(s.players[0].leverage, ["plantagenet-1"]);
  assert.deepEqual(s.petitioned, ["plantagenet-0"]);
  assert.equal(s.players[1].court.includes("plantagenet-0"), true);
});
test("marriage is nontransitive and loss leaves the foreign spouse unsupported", () => {
  let s = fixture();
  place(s, 0, "court", "alba-0", "alba-1");
  s.players[0].ruler = "alba-0";
  place(s, 0, "hand", "plantagenet-1");
  s = act(s, { type: "marry", card: "alba-1", target: "plantagenet-1" });
  assert.ok(supported(s, 0, "plantagenet-1"));
  s.active = 0;
  s = act(s, { type: "withdraw", card: "alba-1" });
  assert.equal(s.marriages.length, 0);
  assert.ok(s.players[0].court.includes("plantagenet-1"));
  assert.equal(supported(s, 0, "plantagenet-1"), false);
});
test("Alba retains one named alternative and wins only after the full successor round", () => {
  let s = fixture();
  place(s, 0, "court", "alba-0", "alba-3", "alba-7");
  s.players[0].ruler = "alba-0";
  place(s, 1, "hand", "alba-1");
  s = act(s, {
    type: "proclaim",
    route: "kindreds",
    heirs: ["alba-3", "alba-7"],
  });
  s = act(s, { type: "claim", card: "alba-1", target: "alba-3" });
  s = act(s, { type: "decline", seat: 0 });
  assert.ok(s.crown);
  s = passRound(s);
  assert.equal(s.round, 3);
  assert.equal(s.crown?.successor, "alba-7");
  assert.ok(s.noblePast.includes("alba-0"));
  assert.equal(s.result, null);
  // Avoid unrelated warning events in this isolated Crown expectation.
  for (const e of s.history) s.historyPast.push(e.id);
  s.history = [];
  s = passRound(s);
  assert.equal(s.result?.winner, 0);
});
test("Charter Witness is persistent; Habsburg sponsor loss forfeits before retirement", () => {
  let s = fixture();
  place(s, 1, "court", "plantagenet-0", "plantagenet-2", "plantagenet-3");
  s.players[1].ruler = "plantagenet-0";
  s.active = 1;
  s = act(s, {
    type: "proclaim",
    route: "charter",
    heirs: ["plantagenet-2"],
    witness: "plantagenet-3",
  });
  s.active = 1;
  s = act(s, { type: "withdraw", card: "plantagenet-3" });
  assert.equal(s.crown, null);
  assert.ok(s.players[1].court.includes("plantagenet-0"));
  s = fixture();
  place(s, 3, "court", "habsburg-0", "habsburg-1", "habsburg-2");
  s.players[3].ruler = "habsburg-0";
  place(s, 3, "hand", "plantagenet-1");
  s.active = 3;
  s = act(s, { type: "marry", card: "habsburg-1", target: "plantagenet-1" });
  s.active = 3;
  s = act(s, {
    type: "proclaim",
    route: "marriage",
    heirs: ["plantagenet-1"],
    witness: "habsburg-1",
  });
  s.active = 3;
  s = act(s, { type: "withdraw", card: "habsburg-1" });
  assert.equal(s.crown, null);
  assert.equal(supported(s, 3, "plantagenet-1"), false);
  assert.ok(s.players[3].court.includes("habsburg-0"));
});
test("Tudor sealed identity never enters public projections or replay; reveals at succession", () => {
  let s = fixture();
  place(s, 2, "court", "tudor-0", "tudor-2", "tudor-4");
  place(s, 2, "hand", "tudor-3");
  s.players[2].ruler = "tudor-0";
  s.active = 2;
  s = act(s, { type: "proclaim", route: "act", heirs: ["tudor-3"] });
  const publicJSON = JSON.stringify(viewForSpectator(s));
  assert.equal(publicJSON.includes("tudor-3"), false);
  assert.equal(JSON.stringify(publicReplay(s)).includes("tudor-3"), false);
  assert.equal(JSON.stringify(viewForSeat(s, 1)).includes("tudor-3"), false);
  assert.equal(viewForSeat(s, 2).crown?.sealed, "tudor-3");
  s = passRound(s);
  assert.equal(s.players[2].ruler, "tudor-3");
  assert.equal(s.crown?.stage, "reigning");
});
test("Regency needs two whole successor rounds", () => {
  let s = fixture();
  place(s, 0, "court", "alba-0", "alba-2");
  s.players[0].ruler = "alba-0";
  s = act(s, { type: "proclaim", route: "regency", heirs: ["alba-2"] });
  s = passRound(s);
  for (const e of s.history) s.historyPast.push(e.id);
  s.history = [];
  s = passRound(s);
  assert.equal(s.result, null);
  assert.equal(s.round, 4);
  for (const e of s.history) s.historyPast.push(e.id);
  s.history = [];
  s = passRound(s);
  assert.equal(s.result?.winner, 0);
});
test("active H2 preserves partial progress, needs distinct contributors and forbids succession", () => {
  let s = fixture();
  place(s, 0, "court", "alba-0", "alba-2");
  s.players[0].ruler = "alba-0";
  event(s, "H2");
  s = act(s, { type: "attack", event: "H2", card: "alba-2" });
  s = passRound(s);
  const h = s.history.find((e) => e.id === "H2")!;
  assert.equal(h.status, "active");
  assert.equal(h.attacks.length, 1);
  s.active = 0;
  assert.throws(() => act(s, { type: "attack", event: "H2", card: "alba-2" }));
  s = act(s, { type: "attack", event: "H2", card: "alba-0" });
  assert.ok(s.historyPast.includes("H2"));
  s = fixture();
  place(s, 0, "court", "alba-0", "alba-2");
  s.players[0].ruler = "alba-0";
  s = act(s, { type: "proclaim", route: "regency", heirs: ["alba-2"] });
  event(s, "H2", "active");
  s = passRound(s);
  assert.equal(s.crown, null);
  assert.ok(s.players[0].court.includes("alba-0"));
  assert.equal(s.noblePast.includes("alba-0"), false);
});
test("A3 with no obligated seats averts immediately before the next History reveal", () => {
  let s = fixture();
  s.phase = "start";
  s.boundary = { step: 3, index: 0, events: [] };
  s.historyDeck = ["A3", ...s.historyDeck.filter((id) => id !== "A3")];
  s = advanceBoundary(s);
  assert.ok(s.historyPast.includes("A3"));
  const index = s.events.findIndex(
    (e) => e.type === "InterregnumAverted" && e.cards.includes("A3"),
  );
  assert.ok(index >= 0);
  assert.equal(s.events[index + 1].type, "HistoryRevealed");
});
test("Veil uses absolute R+2, persists through settlement and cannot rescue a completed painting", () => {
  let s = fixture();
  place(s, 0, "hand", "alba-1");
  for (let n = 1; n <= 5; n++) fragment(s, `painting-alba-${n}`);
  s = act(s, { type: "veil", card: "alba-1", target: "painting-alba-1" });
  assert.equal(s.fragments[0].veil?.until, 4);
  fragment(s, "painting-alba-6");
  s = passRound(s);
  assert.equal(s.result, null);
  assert.ok(s.fragments[0].veil);
  s = passRound(s);
  assert.equal(s.result?.winner, "eudoxia");
  assert.equal(s.round, 4);
  assert.ok(s.noblePast.includes("alba-1"));
});
test("barter hides packets from spectators, locks inspection, reloads, and pays only on mutual acceptance", () => {
  let s = fixture();
  place(s, 0, "hand", "alba-1");
  place(s, 1, "hand", "plantagenet-1");
  s = act(s, { type: "barter", cards: ["alba-1"], other: 1 });
  s = act(s, { type: "barter-packet", seat: 1, cards: ["plantagenet-1"] });
  assert.equal(JSON.stringify(viewForSpectator(s)).includes("alba-1"), false);
  assert.equal(viewForSeat(s, 0).barter?.packets[1], null);
  s = act(s, { type: "barter-inspect", seat: 0, accept: true });
  s = act(s, { type: "barter-inspect", seat: 1, accept: true });
  assert.deepEqual(viewForSeat(s, 0).barter?.packets[1], ["plantagenet-1"]);
  assert.equal(
    JSON.stringify(viewForSpectator(s)).includes("plantagenet-1"),
    false,
  );
  s = JSON.parse(JSON.stringify(s));
  s = act(s, { type: "barter-decide", seat: 0, accept: true });
  assert.equal(viewForSeat(s, 1).barter?.decisions[0], null);
  s = act(s, { type: "barter-decide", seat: 1, accept: true });
  assert.deepEqual(s.players[0].hand, ["plantagenet-1"]);
  assert.equal(s.players[0].seals, 2);
  assert.equal(s.active, 1);
  assert.equal(
    JSON.stringify(publicReplay(s)).includes("plantagenet-1"),
    false,
  );
});
test("simultaneous choices use frozen options and reveal together", () => {
  let s = fixture();
  place(s, 0, "court", "alba-0", "alba-1");
  place(s, 1, "court", "plantagenet-0", "plantagenet-1");
  s.players[0].ruler = "alba-0";
  s.players[1].ruler = "plantagenet-0";
  event(s, "T2");
  s = act(s, { type: "pass" });
  s = act(s, { type: "pass" });
  s = act(s, { type: "pass" });
  s = act(s, { type: "pass" });
  assert.equal(s.phase, "choice");
  const requests = s.choices!.requests;
  s = act(s, {
    type: "choice",
    seat: 0,
    choiceId: requests[0].id,
    cards: ["alba-1"],
  });
  assert.ok(s.players[0].court.includes("alba-1"));
  assert.deepEqual(viewForSeat(s, 1).choices?.requests[0].selection, []);
  s = act(s, {
    type: "choice",
    seat: 1,
    choiceId: requests[1].id,
    cards: ["plantagenet-1"],
  });
  assert.ok(s.players[0].hand.includes("alba-1"));
  assert.ok(s.players[1].hand.includes("plantagenet-1"));
});
test("deterministic complete AI games conserve cards and terminate across all module combinations", () => {
  const groups: Dynasty[][] = [
    ["alba", "plantagenet"],
    ["alba", "tudor"],
    ["alba", "habsburg"],
    ["plantagenet", "tudor"],
    ["plantagenet", "habsburg"],
    ["tudor", "habsburg"],
    ["alba", "plantagenet", "tudor"],
    ["alba", "plantagenet", "habsburg"],
    ["alba", "tudor", "habsburg"],
    ["plantagenet", "tudor", "habsburg"],
    ["alba", "plantagenet", "tudor", "habsburg"],
  ];
  for (const modules of groups) {
    let s = createGame({ modules, seed: 712 });
    let steps = 0;
    while (!s.result && steps++ < 600) {
      let moved = false;
      for (const p of s.players) {
        const d = chooseAction(viewForSeat(s, p.seat), p.seat);
        if (d) {
          const restored = JSON.parse(JSON.stringify(s));
          assert.deepEqual(
            applyAction(restored, d.action),
            applyAction(s, d.action),
          );
          s = applyAction(s, d.action);
          moved = true;
          break;
        }
      }
      assert.ok(moved, `no continuation in ${s.phase}`);
      assertInvariants(s);
    }
    assert.ok(s.result, `game did not terminate: ${modules}`);
    assert.ok(s.round < 22);
  }
});

test("redesigned Blood Edict freezes shared printed Dynasty choices and retires simultaneously", () => {
  let s = fixture(["alba", "plantagenet"]);
  place(s, 0, "court", "alba-0", "alba-1", "plantagenet-0");
  place(s, 1, "court", "plantagenet-1", "plantagenet-2", "alba-2");
  s.players[0].ruler = "alba-0";
  s.players[1].ruler = "plantagenet-1";
  s = adjudicateEffectFixture(s, "blood-edict");
  const choices = structuredClone(s.choices!.requests);
  assert.equal(choices.length, 2);
  assert.deepEqual(choices[0].allowedIds, [
    "alba-0",
    "alba-1",
    "plantagenet-0",
  ]);
  s = act(s, {
    type: "choice",
    seat: 0,
    choiceId: choices[0].id,
    cards: ["plantagenet-0"],
  });
  assert.ok(s.players[0].court.includes("plantagenet-0"));
  assert.deepEqual(s.choices!.requests[1].allowedIds, choices[1].allowedIds);
  s = act(s, {
    type: "choice",
    seat: 1,
    choiceId: choices[1].id,
    cards: ["alba-2"],
  });
  assert.deepEqual(s.noblePast.sort(), ["alba-2", "plantagenet-0"]);
  assert.equal(s.phase, "action");
  assertInvariants(s);
});
