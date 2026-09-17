import { test } from "node:test";
import assert from "node:assert/strict";
import { compileCard } from "../src/history-engine/compiler";
import {
  MANIFEST,
  SOURCE,
  NOBLES,
  INTERREGNA,
  FRAGMENTS,
} from "../src/history-engine/content";
import {
  createGame,
  applyAction,
  validateAction,
  assertInvariants,
} from "../src/history-engine/engine";
import { legalActions } from "../src/history-engine/rules";
import { viewForSeat } from "../src/history-engine/view";
import type { Action, Dynasty, GameState } from "../src/history-engine/types";

// These fixtures remove random History draws by putting unused History in its
// public past. Every Noble and History card still has exactly one location.
function table(modules: Dynasty[] = ["alba", "plantagenet"]): GameState {
  const s = createGame({ modules, seed: 602 });
  s.setup = null;
  s.phase = "action";
  s.round = 2;
  s.first = 0;
  s.active = 0;
  s.events = [];
  s.observations = Object.fromEntries(s.players.map((p) => [p.seat, []]));
  for (const p of s.players) {
    p.dynasty = modules[p.seat];
    p.hand = [];
    p.court = [];
    p.leverage = [];
    p.ruler = null;
  }
  s.dynastyDeck = NOBLES.filter((c) => modules.includes(c.printed.dynasty)).map(
    (c) => c.id,
  );
  s.historyPast = [...INTERREGNA, ...FRAGMENTS]
    .filter((c) => modules.includes(c.printed.dynasty))
    .map((c) => c.id);
  s.historyDeck = [];
  return s;
}

function put(
  s: GameState,
  seat: number,
  zone: "court" | "hand",
  ...ids: string[]
) {
  for (const id of ids) {
    assert(s.dynastyDeck.includes(id), `${id} must have a unique source`);
    s.dynastyDeck = s.dynastyDeck.filter((c) => c !== id);
    s.players[seat][zone].push(id);
  }
}

function action(
  s: GameState,
  a: Omit<Action, "seat" | "revision"> & { seat?: number },
): Action {
  return { ...a, seat: a.seat ?? s.active, revision: s.revision };
}

function act(
  s: GameState,
  a: Omit<Action, "seat" | "revision"> & { seat?: number },
) {
  return applyAction(s, action(s, a));
}

function nextRound(s: GameState): GameState {
  const round = s.round;
  for (let i = 0; s.round === round && !s.result && i < 20; i++) {
    assert.equal(
      s.phase,
      "action",
      "fixture needs explicit resolution of every mandatory choice",
    );
    s = act(s, { type: "pass" });
  }
  assert(
    s.result || s.round === round + 1,
    "passes must advance exactly one round",
  );
  return s;
}

function crisis(s: GameState, id: string) {
  assert(s.historyPast.includes(id));
  s.historyPast = s.historyPast.filter((c) => c !== id);
  s.history.push({
    id,
    order: ++s.revealSequence,
    status: "pending",
    revealed: s.round,
    activated: null,
    expires: null,
    obligated: s.players.map((p) => p.seat),
    fulfilled: [],
    contributions: [],
    attacks: [],
    restoreIds: {},
  });
}

function placeFragment(s: GameState, id: string) {
  assert(s.historyPast.includes(id));
  s.historyPast = s.historyPast.filter((c) => c !== id);
  s.fragments.push({
    id,
    dynasty: SOURCE[id].printed.dynasty,
    slot: SOURCE[id].printed.slot!,
    onceVeiled: false,
    veil: null,
  });
}

const earlyEnd =
  "End early: Complete the Prevent condition.\nEarlier help still counts.\nEnds at round end, after 1 more round.";

function changeText<T>(
  id: string,
  edit: (text: string) => string,
  run: () => T,
): T {
  const original = MANIFEST[id];
  const text = edit(SOURCE[id].cardText);
  assert.notEqual(
    text,
    SOURCE[id].cardText,
    `mutation must change ${id}'s actual printed source`,
  );
  MANIFEST[id] = compileCard({ ...SOURCE[id], cardText: text });
  try {
    return run();
  } finally {
    MANIFEST[id] = original;
  }
}

test("printed Law entry count changes the real Crown action from three to four native Nobles", () => {
  const s = table();
  put(s, 0, "court", "alba-0", "alba-3", "alba-7");
  s.players[0].ruler = "alba-0";
  const claim = action(s, {
    type: "proclaim",
    route: "kindreds",
    heirs: ["alba-3", "alba-7"],
  });
  assert(validateAction(s, claim).ok);
  changeText(
    "law-alba",
    (t) => t.replace(/\b3\b/, "4"),
    () => {
      assert.equal(validateAction(s, claim).ok, false);
      put(s, 0, "court", "alba-4");
      const result = applyAction(s, claim);
      assert.equal(result.crown?.seat, 0);
      assert.equal(result.players[0].seals, 2);
    },
  );
});

test("printed Law heir count controls actual selection and projected choices", () => {
  const s = table();
  put(s, 0, "court", "alba-0", "alba-3", "alba-7");
  s.players[0].ruler = "alba-0";
  const claim = action(s, {
    type: "proclaim",
    route: "kindreds",
    heirs: ["alba-3"],
  });
  assert.equal(validateAction(s, claim).ok, false);
  changeText(
    "law-alba",
    (t) =>
      t.replace(
        "Choose 2 other Court Nobles of your Dynasty from different branches as heirs.",
        "Choose 1 other Court Noble of your Dynasty from different branches as heir.",
      ),
    () => {
      assert(
        legalActions(viewForSeat(s, 0), 0).some(
          (a) => a.route === "kindreds" && a.heirs?.length === 1,
        ),
      );
      const result = applyAction(s, claim);
      assert.deepEqual(result.crown?.heirs, ["alba-3"]);
    },
  );
});

test("printed Law reign duration postpones actual victory until the second full round", () => {
  changeText(
    "law-plantagenet",
    (t) => t.replace("for 1 full round", "for 2 full rounds"),
    () => {
      let s = table(["plantagenet", "alba"]);
      put(s, 0, "court", "plantagenet-0", "plantagenet-2", "plantagenet-3");
      s.players[0].ruler = "plantagenet-0";
      s = act(s, {
        type: "proclaim",
        route: "charter",
        heirs: ["plantagenet-2"],
        witness: "plantagenet-3",
      });
      s = nextRound(s);
      assert.equal(s.players[0].ruler, "plantagenet-2");
      assert(s.noblePast.includes("plantagenet-0"));
      s = nextRound(s);
      assert.equal(s.round, 4);
      assert.equal(
        s.result,
        null,
        "one full reign round is insufficient for the edited Law",
      );
      s = nextRound(s);
      assert.equal(s.result?.winner, 0);
    },
  );
});

test("printed Law transfer delay changes which round installs the new Ruler", () => {
  changeText(
    "law-plantagenet",
    (t) => t.replace("In 1 round, at its start:", "In 2 rounds, at its start:"),
    () => {
      let s = table(["plantagenet", "alba"]);
      put(s, 0, "court", "plantagenet-0", "plantagenet-2", "plantagenet-3");
      s.players[0].ruler = "plantagenet-0";
      s = act(s, {
        type: "proclaim",
        route: "charter",
        heirs: ["plantagenet-2"],
        witness: "plantagenet-3",
      });
      s = nextRound(s);
      assert.equal(s.players[0].ruler, "plantagenet-0");
      assert.equal(s.crown?.stage, "proclaimed");
      s = nextRound(s);
      assert.equal(s.players[0].ruler, "plantagenet-2");
      assert.equal(s.crown?.stage, "reigning");
      assert(s.noblePast.includes("plantagenet-0"));
    },
  );
});

test("removing Recruit from a Noble script prevents the real Recruit action", () => {
  const s = table();
  put(s, 0, "hand", "alba-3");
  const recruit = action(s, { type: "build", card: "alba-3" });
  assert(validateAction(s, recruit).ok);
  changeText(
    "alba-3",
    (t) => t.replace("Recruit into your Court if this is your Dynasty; ", ""),
    () => {
      assert.equal(validateAction(s, recruit).ok, false);
      assert.throws(() => applyAction(s, recruit));
      assert(s.players[0].hand.includes("alba-3"));
      assert.equal(s.players[0].seals, 3);
    },
  );
  assert(applyAction(s, recruit).players[0].court.includes("alba-3"));
});

test("removing Marry from a Queen script removes its pairing permission", () => {
  const s = table();
  put(s, 0, "court", "alba-1");
  put(s, 0, "hand", "plantagenet-2");
  s.players[0].ruler = "alba-1";
  const marry = action(s, {
    type: "marry",
    card: "alba-1",
    target: "plantagenet-2",
  });
  assert(validateAction(s, marry).ok);
  changeText(
    "alba-1",
    (t) =>
      t
        .split("\n")
        .filter((line) => !line.startsWith("Marry:"))
        .join("\n"),
    () => {
      assert.equal(validateAction(s, marry).ok, false);
      assert.throws(() => applyAction(s, marry));
      assert.equal(s.marriages.length, 0);
    },
  );
  const result = applyAction(s, marry);
  assert.equal(result.marriages[0].spouse, "plantagenet-2");
});

test("printed Challenge count requires four different real contributors", () => {
  changeText(
    "A2",
    (t) => t.replace(/\b2\b/, "4"),
    () => {
      let s = table();
      put(s, 0, "court", "alba-0", "alba-3");
      put(s, 1, "court", "plantagenet-0", "plantagenet-2");
      s.players[0].ruler = "alba-0";
      s.players[1].ruler = "plantagenet-0";
      crisis(s, "A2");
      for (const card of ["alba-0", "plantagenet-0", "alba-3"])
        s = act(s, { type: "attack", event: "A2", card });
      assert.equal(
        s.history[0].attacks.length,
        3,
        "three contributions do not complete a printed four-contribution goal",
      );
      assertInvariants(s);
      s = act(s, { type: "attack", event: "A2", card: "plantagenet-2" });
      assert.equal(s.history.length, 0);
      assert(s.historyPast.includes("A2"));
      assert.deepEqual(
        s.players.map((p) => p.seals),
        [1, 1],
      );
    },
  );
});

test("printed expiry duration keeps a restriction active for its second round", () => {
  changeText(
    "A1",
    (t) => t.replace("after 1 more round", "after 2 more rounds"),
    () => {
      let s = table();
      crisis(s, "A1");
      s = nextRound(s);
      assert.equal(s.history[0].status, "active");
      assert.equal(s.history[0].expires, 4);
      s = nextRound(s);
      assert.equal(s.round, 4);
      assert.equal(s.history[0].status, "active");
      s = nextRound(s);
      assert.equal(s.history.length, 0);
      assert(s.historyPast.includes("A1"));
    },
  );
});

test("printed shared Dynasty goal needs its third distinct contributed Dynasty", () => {
  changeText(
    "P3",
    (t) => t.replace(/\b2\b/, "3"),
    () => {
      let s = table(["alba", "plantagenet", "tudor"]);
      put(s, 0, "hand", "alba-3", "plantagenet-2", "tudor-2");
      crisis(s, "P3");
      for (const card of ["alba-3", "plantagenet-2"]) {
        s = act(s, { type: "address", event: "P3", card });
        s = act(s, { type: "pass" });
        s = act(s, { type: "pass" });
      }
      assert.equal(s.history[0].contributions.length, 2);
      s = act(s, { type: "address", event: "P3", card: "tudor-2" });
      assert.equal(s.history.length, 0);
      assert.equal(s.players[0].seals, 0);
      assert.deepEqual(s.players[0].leverage, [
        "alba-3",
        "plantagenet-2",
        "tudor-2",
      ]);
    },
  );
});

test("changing a fragment's printed goal makes the fifth revealed piece end the game", () => {
  const originals = FRAGMENTS.filter((c) => c.printed.dynasty === "alba").map(
    (c) => [c.id, MANIFEST[c.id]] as const,
  );
  try {
    for (const [id] of originals) {
      const text = SOURCE[id].cardText.replace(
        /\b6\b(?= (?:fragments|pieces))/,
        "5",
      );
      assert.notEqual(text, SOURCE[id].cardText);
      MANIFEST[id] = compileCard({ ...SOURCE[id], cardText: text });
    }
    let s = table();
    for (let slot = 1; slot <= 4; slot++) {
      const id = `painting-alba-${slot}`;
      s.historyPast = s.historyPast.filter((c) => c !== id);
      s.fragments.push({
        id,
        dynasty: "alba",
        slot,
        onceVeiled: false,
        veil: null,
      });
    }
    s.historyPast = s.historyPast.filter((c) => c !== "painting-alba-5");
    s.historyDeck = ["painting-alba-5"];
    assert.equal(s.result, null);
    s = nextRound(s);
    assert.equal(s.fragments.length, 5);
    assert.equal(s.result?.winner, "eudoxia");
    assert.match(s.result!.reason, /5/);
  } finally {
    for (const [id, manifest] of originals) MANIFEST[id] = manifest;
  }
});

test("Border Rising can retire a second-to-last native Noble under the simplified printed selector", () => {
  let s = table();
  put(s, 0, "court", "alba-0", "alba-3");
  s.players[0].ruler = "alba-0";
  crisis(s, "A2");
  s = nextRound(s);
  assert.equal(s.phase, "choice");
  const choice = s.choices!.requests.find((c) => c.chooser === 0)!;
  assert.deepEqual(choice.allowedIds, ["alba-3"]);
  s = act(s, {
    type: "choice",
    seat: 0,
    choiceId: choice.id,
    cards: ["alba-3"],
  });
  assert.deepEqual(s.players[0].court, ["alba-0"]);
  assert(s.noblePast.includes("alba-3"));
});

test("A Disputed Charter may return a supported non-heir while preserving the actual succession", () => {
  let s = table(["plantagenet", "alba"]);
  put(
    s,
    0,
    "court",
    "plantagenet-0",
    "plantagenet-2",
    "plantagenet-3",
    "plantagenet-4",
  );
  s.players[0].ruler = "plantagenet-0";
  crisis(s, "P2");
  s = act(s, {
    type: "proclaim",
    route: "charter",
    heirs: ["plantagenet-2"],
    witness: "plantagenet-3",
  });
  s = act(s, { type: "pass" });
  s = act(s, { type: "pass" });
  assert.equal(s.phase, "choice");
  const choice = s.choices!.requests[0];
  assert(
    choice.allowedIds.includes("plantagenet-4"),
    "ordinary supported Court Noble is eligible",
  );
  assert(!choice.allowedIds.includes("plantagenet-0"), "Ruler is ineligible");
  s = act(s, {
    type: "choice",
    seat: choice.chooser,
    choiceId: choice.id,
    cards: ["plantagenet-4"],
  });
  assert(s.players[0].hand.includes("plantagenet-4"));
  assert.equal(s.players[0].ruler, "plantagenet-2");
  assert.equal(s.crown?.stage, "reigning");
});

test("War of the Succession cancels the due Crown claim instead of postponing its Ruler change", () => {
  let s = table(["plantagenet", "habsburg"]);
  put(s, 0, "court", "plantagenet-0", "plantagenet-2", "plantagenet-3");
  s.players[0].ruler = "plantagenet-0";
  crisis(s, "H2");
  s = act(s, {
    type: "proclaim",
    route: "charter",
    heirs: ["plantagenet-2"],
    witness: "plantagenet-3",
  });
  s = nextRound(s);
  assert.equal(s.crown, null);
  assert.equal(s.players[0].ruler, "plantagenet-0");
  assert(!s.noblePast.includes("plantagenet-0"));
  assert.equal(s.history[0].status, "active");
});

test("a compiled active Trade-ending Crisis credits both partners and actually ends", () => {
  changeText(
    "T3",
    (t) => t.replace("Ends at round end, after 1 more round.", earlyEnd),
    () => {
      let s = table(["alba", "tudor"]);
      put(s, 0, "hand", "alba-3");
      put(s, 1, "hand", "tudor-2");
      crisis(s, "T3");
      s = nextRound(s);
      assert.equal(s.history[0].status, "active");
      s = act(s, { type: "barter", other: 0, cards: ["tudor-2"] });
      s = act(s, { type: "barter-packet", seat: 0, cards: ["alba-3"] });
      s = act(s, { type: "barter-inspect", seat: 0, accept: true });
      s = act(s, { type: "barter-inspect", seat: 1, accept: true });
      s = act(s, { type: "barter-decide", seat: 0, accept: true });
      s = act(s, { type: "barter-decide", seat: 1, accept: true });
      assert.equal(s.history.length, 0);
      assert(s.historyPast.includes("T3"));
      assert(s.players[0].hand.includes("tudor-2"));
      assert(s.players[1].hand.includes("alba-3"));
      assert.deepEqual(
        s.players.map((p) => p.seals),
        [3, 2],
      );
    },
  );
});

test("a compiled active Cover-ending Crisis records each player's real Cover action", () => {
  changeText(
    "T3",
    (t) => t.replace("Ends at round end, after 1 more round.", earlyEnd),
    () => {
      let s = table(["alba", "tudor"]);
      put(s, 0, "hand", "alba-3");
      put(s, 1, "hand", "tudor-2");
      placeFragment(s, "painting-alba-1");
      placeFragment(s, "painting-alba-2");
      crisis(s, "T3");
      s = nextRound(s);
      s = act(s, { type: "veil", card: "tudor-2", target: "painting-alba-1" });
      assert.deepEqual(s.history[0].fulfilled, [1]);
      s = act(s, { type: "veil", card: "alba-3", target: "painting-alba-2" });
      assert.equal(s.history.length, 0);
      assert(s.historyPast.includes("T3"));
      assert(s.noblePast.includes("alba-3") && s.noblePast.includes("tudor-2"));
      assert(s.fragments.every((f) => f.veil));
    },
  );
});

test("a compiled active marriage-ending Crisis honors its original marked Noble", () => {
  changeText(
    "A3",
    (t) => t.replace("Then end this event.", earlyEnd),
    () => {
      let s = table();
      put(s, 0, "court", "alba-1", "plantagenet-2");
      s.players[0].ruler = "alba-1";
      crisis(s, "A3");
      s.history[0].obligated = [0];
      s.history[0].restoreIds = { 0: ["plantagenet-2"] };
      s = nextRound(s);
      assert.equal(s.history[0].status, "active");
      assert(
        s.players[0].hand.includes("plantagenet-2"),
        "activation returned the original unsupported Noble to hand",
      );
      s = act(s, { type: "pass" });
      s = act(s, { type: "marry", card: "alba-1", target: "plantagenet-2" });
      assert.equal(s.history.length, 0);
      assert(s.historyPast.includes("A3"));
      assert.equal(s.marriages[0].spouse, "plantagenet-2");
    },
  );
});
