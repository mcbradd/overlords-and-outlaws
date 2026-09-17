import { createGame, assertInvariants } from "./engine";
import { NOBLES, FRAGMENTS, INTERREGNA } from "./content";
import type { GameState } from "./types";
/** Public, versioned preset. Every card still has exactly one location. */
export function createDemo(): GameState {
  const s = createGame({
    modules: ["alba", "plantagenet"],
    players: [
      { name: "You", ai: false },
      { name: "The Lion", ai: true },
    ],
    seed: 50001,
  });
  s.phase = "action";
  s.setup = null;
  s.round = 2;
  s.first = 0;
  s.active = 0;
  s.events = [];
  s.observations = { 0: [], 1: [] };
  s.players[0].dynasty = "alba";
  s.players[0].court = ["alba-0", "alba-1", "alba-3"];
  s.players[0].hand = ["alba-7", "alba-4", "plantagenet-2"];
  s.players[0].ruler = "alba-0";
  s.players[1].dynasty = "plantagenet";
  s.players[1].court = ["plantagenet-0", "plantagenet-1", "plantagenet-3"];
  s.players[1].hand = ["alba-2", "plantagenet-4", "plantagenet-7"];
  s.players[1].ruler = "plantagenet-0";
  const placed = s.players.flatMap((p) => [...p.hand, ...p.court]);
  s.dynastyDeck = NOBLES.filter(
    (c) => s.modules.includes(c.printed.dynasty) && !placed.includes(c.id),
  ).map((c) => c.id);
  s.fragments = Array.from({ length: 4 }, (_, i) => ({
    id: `painting-alba-${i + 1}`,
    dynasty: "alba" as const,
    slot: i + 1,
    onceVeiled: false,
    veil: null,
  }));
  s.history = [
    {
      id: "P2",
      status: "pending",
      order: 1,
      revealed: 2,
      activated: null,
      expires: null,
      obligated: [0, 1],
      fulfilled: [],
      contributions: [],
      attacks: [],
      restoreIds: {},
    },
  ];
  s.revealSequence = 1;
  s.historyDeck = [...INTERREGNA, ...FRAGMENTS]
    .filter(
      (c) =>
        s.modules.includes(c.printed.dynasty) &&
        c.id !== "P2" &&
        !s.fragments.some((f) => f.id === c.id),
    )
    .map((c) => c.id);
  assertInvariants(s);
  return s;
}
export function createDenseFixture(maximum = false): GameState {
  const s = createGame({
    modules: ["alba", "plantagenet", "tudor", "habsburg"],
    seed: 70001,
  });
  s.phase = "action";
  s.setup = null;
  s.round = 3;
  s.first = 0;
  s.active = 0;
  s.events = [];
  s.observations = { 0: [], 1: [], 2: [], 3: [] };
  for (const p of s.players) {
    p.dynasty = s.modules[p.seat];
    p.hand = [];
    p.court = [];
    p.leverage = [];
    p.ruler = null;
  }
  s.dynastyDeck = NOBLES.map((c) => c.id);
  const take = (
    seat: number,
    zone: "court" | "hand" | "leverage",
    id: string,
  ) => {
    s.dynastyDeck = s.dynastyDeck.filter((c) => c !== id);
    s.players[seat][zone].push(id);
  };
  for (const p of s.players) {
    const native = NOBLES.filter((c) => c.printed.dynasty === p.dynasty);
    for (const c of native.slice(0, 6)) take(p.seat, "court", c.id);
    p.ruler = native[0].id;
    for (const c of native.slice(6, 9)) take(p.seat, "leverage", c.id);
    for (const c of native.slice(9)) take(p.seat, "hand", c.id);
  }
  if (maximum) {
    for (const p of s.players) {
      p.court.push(...p.hand, ...p.leverage);
      p.hand = [];
      p.leverage = [];
    }
  }
  for (const [a, b] of [
    [0, 1],
    [2, 3],
  ]) {
    const ac = s.players[a].court[5],
      bc = s.players[b].court[5];
    s.players[a].court[5] = bc;
    s.players[b].court[5] = ac;
    s.marriages.push(
      {
        id: s.nextMarriage++,
        seat: a,
        queen: s.players[a].court[1],
        spouse: bc,
      },
      {
        id: s.nextMarriage++,
        seat: b,
        queen: s.players[b].court[1],
        spouse: ac,
      },
    );
  }
  s.crown = {
    seat: 1,
    route: "charter",
    stage: "proclaimed",
    round: 3,
    oldRuler: "plantagenet-0",
    heirs: ["plantagenet-3"],
    witness: "plantagenet-4",
    sealed: null,
    successor: null,
    reignRound: null,
  };
  // All twelve proof registers and 24 slots exist; one veil per completed painting
  // keeps this a nonterminal legal maximum-state presentation fixture.
  s.historyDeck = [];
  s.history = INTERREGNA.map((c, i) => ({
    id: c.id,
    status: i % 2 ? "active" : "pending",
    order: i + 1,
    revealed: 3,
    activated: i % 2 ? 3 : null,
    expires: i % 2 ? 4 : null,
    obligated: [0, 1, 2, 3],
    fulfilled: [],
    contributions: [],
    attacks: [],
    restoreIds: {},
  }));
  s.revealSequence = 12;
  s.fragments = FRAGMENTS.map((c) => ({
    id: c.id,
    dynasty: c.printed.dynasty,
    slot: c.printed.slot!,
    onceVeiled: c.printed.slot === 1,
    veil:
      c.printed.slot === 1
        ? { seat: s.modules.indexOf(c.printed.dynasty), until: 5 }
        : null,
  }));
  assertInvariants(s);
  return s;
}
