import {
  CONTENT_VERSION,
  FRAGMENTS,
  INTERREGNA,
  NOBLES,
  SOURCE,
  dynastyOf,
  nameOf,
  program,
} from "./content";
import {
  actionError,
  eventComplete,
  hasAbility,
  lawFor,
  nativeIds,
  restricted,
  supported,
} from "./rules";
import { viewForSeat, viewForSpectator } from "./view";
import {
  MODULES,
  type Action,
  type ChoiceRequest,
  type Effect,
  type GameState,
  type Phase,
  type Seat,
} from "./types";

const remove = (ids: string[], id: string) => {
  const i = ids.indexOf(id);
  if (i < 0) throw Error("Missing source card");
  ids.splice(i, 1);
};
const order = (s: GameState) =>
  s.players.map((_, i) => (s.first + i) % s.players.length);
function random(s: GameState): number {
  let x = s.rng | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  s.rng = x >>> 0;
  return s.rng / 4294967296;
}
function shuffle(s: GameState, ids: string[]): string[] {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function emit(
  s: GameState,
  type: string,
  text: string,
  cards: string[] = [],
  from?: string,
  to?: string,
  visibility: "public" | Seat[] = "public",
) {
  const event = {
    seq: s.events.length + 1,
    type,
    text,
    cards: [...cards],
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    visibility,
    round: s.round,
  };
  s.events.push(event);
  for (const p of s.players)
    if (
      cards.length &&
      (visibility === "public" || visibility.includes(p.seat))
    )
      s.observations[p.seat].push({
        event: event.seq,
        cards: [...cards],
        reason: type,
      });
  s.policy.observationRevision = event.seq;
}
export function createGame(
  options: {
    modules?: GameState["modules"];
    players?: { name: string; ai: boolean }[];
    seed?: number;
  } = {},
): GameState {
  const modules = options.modules ?? ["alba", "plantagenet", "tudor"];
  const players =
    options.players ??
    modules.map((_, i) => ({ name: `Seat ${i + 1}`, ai: i > 0 }));
  if (
    modules.length < 2 ||
    modules.length > 4 ||
    new Set(modules).size !== modules.length ||
    modules.some((m) => !MODULES.includes(m)) ||
    players.length !== modules.length
  )
    throw Error("Choose N distinct modules for N players, from two to four.");
  const s: GameState = {
    schema: 4,
    rulesetId: "history-engine-v4",
    contentVersion: CONTENT_VERSION,
    revision: 0,
    rng: (options.seed ?? 20260916) >>> 0 || 1,
    modules: [...modules],
    players: players.map((p, seat) => ({
      ...p,
      seat,
      dynasty: null,
      hand: [],
      court: [],
      leverage: [],
      ruler: null,
      seals: 3,
      rotated: [],
    })),
    first: 0,
    active: 0,
    round: 0,
    phase: "setup",
    setup: {
      step: "pass",
      pass: 0,
      locked: {},
      repairs: [],
      repairPacket: [],
      repairDraw: null,
    },
    dynastyDeck: [],
    historyDeck: [],
    noblePast: [],
    historyPast: [],
    marriages: [],
    nextMarriage: 1,
    crown: null,
    history: [],
    revealSequence: 0,
    fragments: [],
    petitioned: [],
    passes: [],
    claim: null,
    barter: null,
    choices: null,
    boundary: { step: 0, index: 0, events: [] },
    events: [],
    observations: Object.fromEntries(players.map((_, i) => [i, []])),
    result: null,
    policy: { version: "political-v1", budget: 64, observationRevision: 0 },
  };
  s.first = Math.floor(random(s) * players.length);
  s.active = s.first;
  s.dynastyDeck = shuffle(
    s,
    NOBLES.filter((c) => modules.includes(c.printed.dynasty)).map((c) => c.id),
  );
  s.historyDeck = shuffle(
    s,
    [...INTERREGNA, ...FRAGMENTS]
      .filter((c) => modules.includes(c.printed.dynasty))
      .map((c) => c.id),
  );
  for (let n = 0; n < 8; n++)
    for (const seat of order(s))
      s.players[seat].hand.push(s.dynastyDeck.shift()!);
  emit(
    s,
    "InheritanceOpened",
    "Inheritance begins. Lock and pass three, then two, then one Noble clockwise.",
  );
  assertInvariants(s);
  return s;
}
function drawNoble(s: GameState, seat: Seat) {
  const id = s.dynastyDeck.shift();
  if (!id) return;
  s.players[seat].hand.push(id);
  emit(
    s,
    "NobleDrawn",
    `${s.players[seat].name === "You" ? "You draw" : `${s.players[seat].name} draws`} one Noble into hand.`,
    [],
    "dynasty-deck",
    `hand-${seat}`,
  );
  emit(
    s,
    "PrivateDraw",
    `You draw ${nameOf(id)}.`,
    [id],
    "dynasty-deck",
    `hand-${seat}`,
    [seat],
  );
}
function commit(s: GameState, seat: Seat, id: string) {
  remove(s.players[seat].hand, id);
  s.players[seat].leverage.push(id);
  emit(
    s,
    "NobleCommitted",
    `${s.players[seat].name === "You" ? "You lend" : `${s.players[seat].name} lends`} ${nameOf(id)} until next round.`,
    [id],
    `hand-${seat}`,
    `leverage-${seat}`,
  );
}
function depart(
  s: GameState,
  seat: Seat,
  id: string,
  to: "past" | "hand",
  recipient = seat,
) {
  const p = s.players[seat];
  remove(p.court, id);
  p.rotated = p.rotated.filter((c) => c !== id);
  if (p.ruler === id) p.ruler = null;
  if (to === "past") s.noblePast.push(id);
  else s.players[recipient].hand.push(id);
  emit(
    s,
    to === "past" ? "RulerRetired" : "NobleTransferred",
    `${nameOf(id)} ${to === "past" ? "Retires to The Past" : `moves to ${s.players[recipient].name === "You" ? "your" : `${s.players[recipient].name}’s`} hand`}.`,
    [id],
    `court-${seat}`,
    to === "past" ? "noble-past" : `hand-${recipient}`,
  );
}
function finish(s: GameState, winner: Seat | "eudoxia", reason: string) {
  if (s.result) return;
  s.result = { winner, reason };
  s.phase = "terminal";
  if (s.crown?.sealed) {
    const id = s.crown.sealed;
    emit(s, "SealedHeirVerified", `The sealed heir was ${nameOf(id)}.`, [id]);
  }
  emit(
    s,
    winner === "eudoxia" ? "PaintingCompleted" : "DynastySettled",
    reason,
  );
}
function checkPainting(s: GameState) {
  for (const d of s.modules) {
    const pieces = s.fragments.filter((f) => f.dynasty === d && !f.veil);
    // Every revealed fragment carries its own printed completion instruction.
    const complete = pieces.find(
      (f) => pieces.length >= program(f.id).fragmentGoal!,
    );
    if (complete) {
      finish(
        s,
        "eudoxia",
        `Eudoxia completes ${d}’s painting. ${program(complete.id).fragmentGoal} fragments are uncovered; all players lose.`,
      );
      return;
    }
  }
}
function forfeit(s: GameState, reason: string) {
  const c = s.crown;
  if (!c) return;
  if (c.sealed) {
    s.players[c.seat].hand.push(c.sealed);
    emit(
      s,
      "SealedHeirReturned",
      `${nameOf(c.sealed)} is revealed for verification and returns to hand.`,
      [c.sealed],
      "act",
      `hand-${c.seat}`,
    );
  }
  s.crown = null;
  emit(s, "CrownForfeited", reason);
}
function crownValid(s: GameState): boolean {
  const c = s.crown;
  if (!c) return true;
  const p = s.players[c.seat];
  const law = lawFor(s, c.seat, c.route);
  const v = viewForSpectator(s);
  const ok = (id: string | null) => !!id && supported(v, c.seat, id);
  if (c.stage === "reigning")
    return (
      p.ruler === c.successor &&
      ok(c.successor) &&
      (law.keep !== "heir-witness" || ok(c.witness)) &&
      (law.keep !== "heir-marriage" ||
        s.marriages.some(
          (m) =>
            m.seat === c.seat &&
            m.queen === c.witness &&
            m.spouse === c.successor,
        ))
    );
  if (p.ruler !== c.oldRuler || !ok(c.oldRuler)) return false;
  if (law.keep === "any-heir") return c.heirs.some(ok);
  if (law.heir.zone === "hand") return !!c.sealed && c.heirs[0] === c.sealed;
  if (law.keep === "heir-witness") return c.heirs.every(ok) && ok(c.witness);
  if (law.keep === "heir-marriage")
    return (
      ok(c.heirs[0]) &&
      s.marriages.some(
        (m) =>
          m.seat === c.seat && m.queen === c.witness && m.spouse === c.heirs[0],
      )
    );
  return c.heirs.every(ok);
}
function cleanup(s: GameState) {
  s.marriages = s.marriages.filter((m) => {
    const p = s.players[m.seat];
    const valid =
      p.court.includes(m.queen) &&
      p.court.includes(m.spouse) &&
      dynastyOf(m.queen) === p.dynasty &&
      hasAbility(m.queen, "marry") &&
      dynastyOf(m.spouse) !== p.dynasty;
    if (!valid)
      emit(
        s,
        "MarriageBroken",
        `Marriage ${m.id} breaks; a remaining foreign spouse is unsupported.`,
        [m.queen, m.spouse],
      );
    return valid;
  });
  for (const p of s.players)
    if (p.ruler && !supported(s, p.seat, p.ruler)) p.ruler = null;
  if (!crownValid(s))
    forfeit(
      s,
      "The named succession arrangement no longer holds. The Crown is vacant.",
    );
  checkEvents(s);
  checkPainting(s);
}
function closeEvent(
  s: GameState,
  id: string,
  type: "Averted" | "Ended" | "Expired",
) {
  s.history = s.history.filter((e) => e.id !== id);
  s.historyPast.push(id);
  emit(
    s,
    `Interregnum${type}`,
    `${nameOf(id)} is ${type.toLowerCase()}.`,
    [id],
    "history-row",
    "history-past",
  );
}
function checkEvents(s: GameState) {
  for (const e of [...s.history])
    if (eventComplete(e) && (e.status === "pending" || program(e.id).end))
      closeEvent(s, e.id, e.status === "pending" ? "Averted" : "Ended");
}
function revealHistory(s: GameState) {
  if (s.result) return;
  const id = s.historyDeck.shift();
  if (!id) return;
  emit(
    s,
    "HistoryRevealed",
    `${nameOf(id)} is revealed.`,
    [id],
    "history-deck",
    SOURCE[id].kind === "fragment" ? "painting" : "history-row",
  );
  if (SOURCE[id].kind === "fragment") {
    const p = SOURCE[id].printed;
    s.fragments.push({
      id,
      dynasty: p.dynasty,
      slot: program(id).fragment!,
      onceVeiled: false,
      veil: null,
    });
    checkPainting(s);
    return;
  }
  const condition = program(id).condition;
  const obligated = s.players
    .filter((p) =>
      condition === "restore-marriage"
        ? p.court.some(
            (c) => dynastyOf(c) !== p.dynasty && !supported(s, p.seat, c),
          )
        : condition === "married-seats"
          ? s.marriages.some((m) => m.seat === p.seat)
          : true,
    )
    .map((p) => p.seat);
  s.history.push({
    id,
    order: ++s.revealSequence,
    status: "pending",
    revealed: s.round,
    activated: null,
    expires: null,
    obligated,
    fulfilled: [],
    contributions: [],
    attacks: [],
    restoreIds: Object.fromEntries(
      s.players.map((p) => [
        p.seat,
        p.court.filter(
          (c) => dynastyOf(c) !== p.dynasty && !supported(s, p.seat, c),
        ),
      ]),
    ),
  });
  checkEvents(s);
}
function choose(
  s: GameState,
  effect: Effect | "interim" | "succession",
  options: { seat: Seat; ids: string[] }[],
  resume: Phase,
  eventId?: string,
) {
  const requests: ChoiceRequest[] = options
    .filter((o) => o.ids.length)
    .map((o, i) => ({
      id: `choice-${s.revision}-${s.events.length}-${i}`,
      chooser: o.seat,
      kind: effect === "interim" || effect === "succession" ? effect : "effect",
      allowedIds: [...o.ids],
      min: 1,
      max: 1,
      snapshotId: `snapshot-${s.revision}-${s.events.length}`,
      optional: false,
      visibility:
        effect === "interim" || effect === "succession" ? "public" : "private",
      consequence: "reject",
      continuation: resume,
      selection: null,
    }));
  if (!requests.length) return false;
  s.choices = { effect, requests, resume, ...(eventId ? { eventId } : {}) };
  s.phase = "choice";
  emit(
    s,
    "ChoicesOpened",
    `${requests.length} player${requests.length === 1 ? "" : "s"} must choose before this effect resolves.`,
  );
  return true;
}
function interim(s: GameState, resume: Phase): boolean {
  const options = s.players
    .filter((p) => !p.ruler && p.dynasty)
    .map((p) => ({
      seat: p.seat,
      ids: p.court.filter((id) => dynastyOf(id) === p.dynasty),
    }));
  return choose(s, "interim", options, resume);
}
function runEffect(
  s: GameState,
  effect: Effect,
  resume: Phase,
  eventId: string,
) {
  const v = viewForSpectator(s);
  if (effect === "history") {
    revealHistory(s);
    return;
  }
  if (effect === "return-unsupported") {
    for (const p of s.players)
      for (const id of [...p.court])
        if (dynastyOf(id) !== p.dynasty && !supported(v, p.seat, id))
          depart(s, p.seat, id, "hand");
    cleanup(s);
    return;
  }
  const options = s.players.map((p) => {
    let ids: string[] = [];
    if (effect === "retire-supported" && p.ruler)
      ids = p.court.filter((id) => id !== p.ruler && supported(v, p.seat, id));
    if (effect === "return-native")
      ids = nativeIds(v, p.seat).filter((id) => id !== p.ruler);
    if (effect === "return-dependency" && s.crown?.seat === p.seat)
      ids = p.court.filter((id) => id !== p.ruler && supported(v, p.seat, id));
    if (effect === "break-marriage")
      ids = s.marriages
        .filter((m) => m.seat === p.seat)
        .map((m) => String(m.id));
    if (
      effect === "commit-unmarried" &&
      !s.marriages.some((m) => m.seat === p.seat)
    )
      ids = p.hand;
    if (effect === "blood-edict")
      ids = p.court.filter((id) =>
        s.players.some(
          (q) =>
            q.seat !== p.seat &&
            q.court.some((c) => dynastyOf(c) === dynastyOf(id)),
        ),
      );
    return { seat: p.seat, ids };
  });
  choose(s, effect, options, resume, eventId);
}
function transferCrown(s: GameState, heir: string) {
  const c = s.crown;
  if (!c) return;
  const p = s.players[c.seat];
  if (
    !crownValid(s) ||
    restricted(s, "succession") ||
    (lawFor(s, c.seat, c.route).heir.zone === "hand" &&
      (!c.sealed || dynastyOf(c.sealed) !== p.dynasty))
  ) {
    forfeit(
      s,
      "Succession cannot legally begin. The old Ruler remains in Court.",
    );
    return;
  }
  emit(
    s,
    "SuccessionOpened",
    `${nameOf(c.oldRuler)} will Retire; ${nameOf(heir)} will succeed.`,
    [c.oldRuler, heir],
  );
  depart(s, c.seat, c.oldRuler, "past");
  // Suppress ordinary succession and Crown checks until the atomic transfer ends.
  s.marriages = s.marriages.filter((m) => {
    if (m.queen === c.oldRuler || m.spouse === c.oldRuler) {
      emit(
        s,
        "MarriageBroken",
        `Marriage ${m.id} breaks at the Ruler’s departure.`,
        [m.queen, m.spouse],
      );
      return false;
    }
    return true;
  });
  if (c.sealed) {
    p.court.push(c.sealed);
    emit(
      s,
      "SealedHeirRevealed",
      `${nameOf(c.sealed)} is revealed and enters Court.`,
      [c.sealed],
      "act",
      `court-${c.seat}`,
    );
    c.sealed = null;
  }
  p.ruler = heir;
  c.successor = heir;
  c.stage = "reigning";
  c.reignRound = s.round;
  emit(
    s,
    "HeirInstalled",
    `${nameOf(heir)} is Ruler. The full contest round begins.`,
    [heir],
    `court-${c.seat}`,
    "ruler",
  );
  cleanup(s);
}
function resolveBatch(s: GameState) {
  const batch = s.choices!;
  if (batch.requests.some((c) => c.selection === null)) return;
  s.choices = null;
  s.phase = batch.resume;
  for (const c of batch.requests) {
    const id = c.selection![0];
    if (!id) continue;
    if (batch.effect === "interim") {
      s.players[c.chooser].ruler = id;
      emit(s, "InterimRulerChosen", `${nameOf(id)} becomes interim Ruler.`, [
        id,
      ]);
    } else if (batch.effect === "succession") transferCrown(s, id);
    else if (batch.effect === "commit-unmarried") commit(s, c.chooser, id);
    else if (batch.effect === "break-marriage") {
      const m = s.marriages.find((m) => String(m.id) === id)!;
      s.marriages = s.marriages.filter((m) => String(m.id) !== id);
      emit(s, "MarriageBroken", `Marriage ${id} breaks.`, [m.queen, m.spouse]);
    } else
      depart(
        s,
        c.chooser,
        id,
        ["retire-supported", "blood-edict"].includes(batch.effect)
          ? "past"
          : "hand",
      );
  }
  cleanup(s);
  if (!s.result) interim(s, batch.resume);
}
function stepSetup(s: GameState) {
  const setup = s.setup!;
  if (
    setup.step === "pass" &&
    Object.keys(setup.locked).length === s.players.length
  ) {
    for (const p of s.players)
      for (const id of setup.locked[p.seat]) remove(p.hand, id);
    for (const p of s.players) {
      const packet = setup.locked[p.seat];
      const next = (p.seat + 1) % s.players.length;
      s.players[next].hand.push(...packet);
      emit(
        s,
        "DraftPacketReceived",
        `You receive ${packet.length} Noble${packet.length === 1 ? "" : "s"}.`,
        packet,
        `hand-${p.seat}`,
        `hand-${next}`,
        [p.seat, next],
      );
    }
    emit(
      s,
      "DraftPassed",
      `All ${[3, 2, 1][setup.pass]}-card packets pass clockwise.`,
    );
    setup.locked = {};
    setup.pass++;
    if (setup.pass === 3) setup.step = "declare";
  }
  if (setup.step === "declare") {
    const failed = s.players
      .filter(
        (p) =>
          !p.hand.some(
            (id) =>
              p.hand.filter((c) => dynastyOf(c) === dynastyOf(id)).length >= 3,
          ),
      )
      .map((p) => p.seat);
    if (
      s.players.every(
        (p) => failed.includes(p.seat) || Object.hasOwn(setup.locked, p.seat),
      )
    ) {
      for (const p of s.players)
        if (!failed.includes(p.seat)) {
          const ids = setup.locked[p.seat];
          for (const id of ids) remove(p.hand, id);
          p.court.push(...ids);
          p.dynasty = dynastyOf(ids[0]);
          emit(
            s,
            "DynastyDeclared",
            `${p.name} declares ${p.dynasty}.`,
            ids,
            `hand-${p.seat}`,
            `court-${p.seat}`,
          );
        }
      setup.locked = {};
      setup.repairs = order(s).filter((seat) => failed.includes(seat));
      setup.step = failed.length ? "repair" : "ruler";
      for (const seat of failed)
        emit(
          s,
          "RepairHandRevealed",
          `${s.players[seat].name} reveals a verified 2/2/2/2 failed declaration.`,
          s.players[seat].hand,
        );
    }
  }
  if (setup.step === "repair" && !setup.repairDraw && setup.repairs.length) {
    const seat = setup.repairs[0];
    const id = s.dynastyDeck.shift()!;
    setup.repairDraw = id;
    s.players[seat].hand.push(id);
    emit(
      s,
      "RepairDrawn",
      `${s.players[seat].name} reveals ${nameOf(id)} for repair.`,
      [id],
    );
  }
  if (setup.step === "repair" && !setup.repairs.length) {
    s.dynastyDeck = shuffle(s, [...s.dynastyDeck, ...setup.repairPacket]);
    setup.repairPacket = [];
    setup.step = "ruler";
  }
  if (setup.step === "ruler" && s.players.every((p) => p.ruler)) {
    s.setup = null;
    s.round = 1;
    s.phase = "start";
    s.boundary = { step: 0, index: 0, events: [] };
    emit(s, "RoundOpened", "Round 1 begins.");
  }
}
function completeAction(s: GameState) {
  cleanup(s);
  if (s.result) return;
  s.active = (s.active + 1) % s.players.length;
  s.phase = "action";
  interim(s, "action");
}
function resolveClaim(s: GameState, countered: boolean) {
  const c = s.claim!;
  if (!countered && s.players[c.defender].court.includes(c.target))
    depart(s, c.defender, c.target, "hand", c.seat);
  s.petitioned.push(c.target);
  s.claim = null;
  emit(
    s,
    "ClaimResolved",
    countered
      ? "The Block prevents the transfer. Both commitments remain until next round."
      : "The dynastic Recall resolves.",
  );
  completeAction(s);
}
function endBarter(s: GameState, accepted: boolean) {
  const b = s.barter!;
  if (accepted) {
    for (const seat of [b.initiator, b.recipient])
      for (const id of b.packets[seat]) remove(s.players[seat].hand, id);
    s.players[b.initiator].hand.push(...b.packets[b.recipient]);
    s.players[b.recipient].hand.push(...b.packets[b.initiator]);
    s.players[b.initiator].seals--;
    s.passes = [];
    emit(
      s,
      "BarterCompleted",
      `${s.players[b.initiator].name} and ${s.players[b.recipient].name} complete their exchange.`,
      [],
      `hand-${b.initiator}`,
      `hand-${b.recipient}`,
    );
    emit(
      s,
      "PrivateBarterCompleted",
      "The locked packets exchange simultaneously.",
      [...b.packets[b.initiator], ...b.packets[b.recipient]],
      undefined,
      undefined,
      [b.initiator, b.recipient],
    );
    for (const e of s.history)
      if (
        (e.status === "pending" || program(e.id).end === "condition") &&
        program(e.id).condition === "barter-or-veil"
      )
        e.fulfilled = [...new Set([...e.fulfilled, b.initiator, b.recipient])];
  } else
    emit(
      s,
      "BarterDeclined",
      "The offer is declined. Packets return; no seal is spent.",
    );
  s.barter = null;
  s.phase = "action";
  if (accepted) completeAction(s);
}
/** Drive only automatic boundary work. Explicit human choices suspend the queue. */
function pump(s: GameState) {
  let steps = 0;
  while (!s.result && ["setup", "start", "end"].includes(s.phase)) {
    if (++steps > 512) throw Error("Bounded phase queue failed to progress");
    if (s.phase === "setup") {
      stepSetup(s);
      if (s.phase === "setup") break;
      continue;
    }
    const b = s.boundary;
    if (s.phase === "start") {
      if (b.step === 0) {
        for (const f of [...s.fragments].sort((a, b) =>
          a.id.localeCompare(b.id),
        ))
          if (f.veil && f.veil.until <= s.round) {
            f.veil = null;
            emit(
              s,
              "FragmentUnveiled",
              `${nameOf(f.id)} unveils in place.`,
              [f.id],
              "painting",
              "painting",
            );
            checkPainting(s);
            if (s.result) return;
          }
        for (const p of s.players) {
          for (const id of p.leverage)
            emit(
              s,
              "CommitmentReturned",
              `${nameOf(id)} returns to ${p.name === "You" ? "your" : `${p.name}’s`} hand.`,
              [id],
              `leverage-${p.seat}`,
              `hand-${p.seat}`,
            );
          p.hand.push(...p.leverage);
          p.leverage = [];
          p.seals = 3;
          p.rotated = [];
        }
        s.petitioned = [];
        s.passes = [];
        b.step = 1;
        continue;
      }
      if (b.step === 1) {
        b.step = 2;
        b.index = 0;
        b.events = s.history
          .filter((e) => e.status === "active")
          .map((e) => e.id);
        const c = s.crown;
        if (
          c?.stage === "proclaimed" &&
          s.round >= c.round + lawFor(s, c.seat, c.route).successionAfter
        ) {
          if (restricted(s, "succession") || !crownValid(s)) {
            forfeit(
              s,
              "Scheduled succession is forbidden or its arrangement has failed. No Ruler Retires.",
            );
            continue;
          }
          const heirs =
            lawFor(s, c.seat, c.route).heir.zone === "hand"
              ? [c.sealed!]
              : c.heirs.filter((id) => supported(s, c.seat, id));
          if (!heirs.length) {
            forfeit(s, "No lawful successor remains.");
            continue;
          }
          if (heirs.length > 1) {
            choose(s, "succession", [{ seat: c.seat, ids: heirs }], "start");
            break;
          }
          transferCrown(s, heirs[0]);
          if (!s.result && interim(s, "start")) break;
        }
        continue;
      }
      if (b.step === 2) {
        if (b.index < b.events.length) {
          const id = b.events[b.index++];
          const e = s.history.find((e) => e.id === id);
          if (e) {
            for (const i of program(id).instructions.filter(
              (i) => i.timing === "start",
            ))
              runEffect(s, i.effect, "start", id);
          }
          continue;
        }
        b.step = 3;
        b.index = 0;
        continue;
      }
      if (b.step === 3) {
        if (b.index < s.players.length) {
          b.index++;
          revealHistory(s);
          continue;
        }
        b.step = 4;
        b.index = 0;
        continue;
      }
      if (b.step === 4) {
        for (const seat of order(s))
          if (s.players[seat].hand.length < 5) drawNoble(s, seat);
        b.step = 5;
        s.active = s.first;
        s.phase = "action";
        cleanup(s);
        if (!s.result) interim(s, "action");
        break;
      }
    } else {
      if (b.step === 0) {
        if (b.index < b.events.length) {
          const id = b.events[b.index++];
          const e = s.history.find((e) => e.id === id);
          if (!e) continue;
          if (eventComplete(e)) {
            closeEvent(s, id, "Averted");
            continue;
          }
          const p = program(id);
          e.status = "active";
          e.activated = s.round;
          e.expires =
            p.expiry === "immediate" ? s.round : s.round + p.expiryAfter;
          if (!p.carry) {
            e.contributions = [];
            e.attacks = [];
            e.fulfilled = [];
          }
          emit(
            s,
            "InterregnumActivated",
            `${nameOf(id)} activates.`,
            [id],
            "pending",
            "active",
          );
          for (const instruction of p.instructions.filter(
            (i) => i.timing === "activation",
          ))
            runEffect(s, instruction.effect, "end", id);
          cleanup(s);
          continue;
        }
        b.step = 1;
        continue;
      }
      if (b.step === 1) {
        for (const e of [...s.history])
          if (
            e.status === "active" &&
            e.expires !== null &&
            e.expires <= s.round
          )
            closeEvent(s, e.id, "Expired");
        b.step = 2;
        cleanup(s);
        if (!s.result && interim(s, "end")) break;
        continue;
      }
      if (b.step === 2) {
        const c = s.crown;
        if (
          c?.stage === "reigning" &&
          c.reignRound !== null &&
          s.round >=
            c.reignRound + lawFor(s, c.seat, c.route).reignRounds - 1 &&
          crownValid(s)
        ) {
          finish(
            s,
            c.seat,
            `${s.players[c.seat].name === "You" ? "You win" : `${s.players[c.seat].name} wins`} under ${c.route === "regency" ? "Regency" : nameOf(`law-${s.players[c.seat].dynasty}`)}. ${nameOf(c.successor!)} stayed Ruler for ${lawFor(s, c.seat, c.route).reignRounds} full round${lawFor(s, c.seat, c.route).reignRounds === 1 ? "" : "s"}.`,
          );
          break;
        }
        s.round++;
        s.first = (s.first + 1) % s.players.length;
        s.phase = "start";
        s.boundary = { step: 0, index: 0, events: [] };
        emit(
          s,
          "RoundOpened",
          `Round ${s.round} begins. First seat rotates to ${s.players[s.first].name}.`,
        );
        continue;
      }
    }
  }
}
export function validateAction(
  s: GameState,
  a: Action,
): { ok: boolean; error?: string } {
  const error = actionError(viewForSeat(s, a.seat), a);
  return error ? { ok: false, error } : { ok: true };
}
export function applyAction(state: GameState, a: Action): GameState {
  const valid = validateAction(state, a);
  if (!valid.ok) throw Error(valid.error);
  const s = structuredClone(state);
  s.revision++;
  const p = s.players[a.seat];
  const card = a.card!;
  if (a.type === "setup-lock") {
    s.setup!.locked[a.seat] = [...a.cards!];
    emit(
      s,
      "PacketLocked",
      `${p.name === "You" ? "You confirm your" : `${p.name} confirms their`} ${s.setup!.step === "pass" ? "cards to pass" : "starting Court"}.`,
    );
  } else if (a.type === "repair") {
    const st = s.setup!;
    remove(p.hand, card);
    st.repairPacket.push(card);
    emit(
      s,
      "RepairReturned",
      `${nameOf(card)} enters the public repair packet.`,
      [card],
    );
    const d = dynastyOf(st.repairDraw!);
    const trio = p.hand.filter((id) => dynastyOf(id) === d);
    for (const id of trio) remove(p.hand, id);
    p.court.push(...trio);
    p.dynasty = d;
    emit(s, "DynastyDeclared", `${p.name} declares ${d}.`, trio);
    st.repairs.shift();
    st.repairDraw = null;
  } else if (a.type === "ruler") {
    p.ruler = card;
    emit(s, "RulerChosen", `${nameOf(card)} is ${p.name === "You" ? "your" : `${p.name}’s`} Ruler.`, [card]);
  } else if (a.type === "choice") {
    s.choices!.requests.find((c) => c.id === a.choiceId)!.selection = [
      ...a.cards!,
    ];
    resolveBatch(s);
  } else if (a.type === "decline") resolveClaim(s, false);
  else if (a.type === "counterclaim") {
    p.seals--;
    commit(s, a.seat, card);
    if (a.target) p.rotated.push(a.target);
    resolveClaim(s, true);
  } else if (a.type.startsWith("barter-")) {
    const b = s.barter!;
    if (a.type === "barter-cancel") endBarter(s, false);
    if (a.type === "barter-packet") {
      b.packets[a.seat] = [...a.cards!];
      b.stage = "inspection";
    }
    if (a.type === "barter-inspect") {
      b.consent[a.seat] = a.accept!;
      if (!a.accept) endBarter(s, false);
      else if (Object.keys(b.consent).length === 2) {
        b.inspected = true;
        b.stage = "decision";
        emit(
          s,
          "BarterInspected",
          "Both parties inspect the locked packets privately.",
          [...b.packets[b.initiator], ...b.packets[b.recipient]],
          undefined,
          undefined,
          [b.initiator, b.recipient],
        );
      }
    }
    if (a.type === "barter-decide") {
      b.decisions[a.seat] = a.accept!;
      if (Object.keys(b.decisions).length === 2)
        endBarter(s, Object.values(b.decisions).every(Boolean));
    }
  } else if (a.type === "barter") {
    s.barter = {
      initiator: a.seat,
      recipient: a.other!,
      stage: "packet",
      packets: { [a.seat]: [...a.cards!] },
      consent: {},
      decisions: {},
      inspected: false,
    };
    s.phase = "barter";
    emit(
      s,
      "BarterOffered",
      `${p.name === "You" ? "You offer" : `${p.name} offers`} ${a.cards!.length} hand Noble${a.cards!.length === 1 ? "" : "s"} to ${s.players[a.other!].name}.`,
    );
  } else if (a.type === "pass") {
    s.passes.push(a.seat);
    emit(
      s,
      "Passed",
      `${p.name === "You" ? "You pass" : `${p.name} passes`}. ${s.passes.length} consecutive pass${s.passes.length === 1 ? "" : "es"}.`,
    );
    if (s.passes.length === s.players.length) {
      s.phase = "end";
      s.boundary = {
        step: 0,
        index: 0,
        events: s.history
          .filter((e) => e.status === "pending")
          .map((e) => e.id),
      };
    } else s.active = (s.active + 1) % s.players.length;
  } else {
    p.seals--;
    s.passes = [];
    switch (a.type) {
      case "build":
        remove(p.hand, card);
        p.court.push(card);
        if (!p.ruler) p.ruler = card;
        emit(
          s,
          "NobleBuilt",
          `${nameOf(card)} enters ${p.name === "You" ? "your" : `${p.name}’s`} Court.`,
          [card],
          `hand-${a.seat}`,
          `court-${a.seat}`,
        );
        break;
      case "withdraw":
        depart(s, a.seat, card, "hand");
        break;
      case "petition":
        drawNoble(s, a.seat);
        break;
      case "marry": {
        const spouse = a.target!;
        const from = p.hand.includes(spouse)
          ? `hand-${a.seat}`
          : `court-${a.seat}`;
        if (p.hand.includes(spouse)) {
          remove(p.hand, spouse);
          p.court.push(spouse);
        }
        const id = s.nextMarriage++;
        s.marriages.push({ id, seat: a.seat, queen: card, spouse });
        emit(
          s,
          "MarriageFormed",
          `Marriage ${id}: ${nameOf(card)} supports ${nameOf(spouse)}.`,
          [card, spouse],
          from,
          `court-${a.seat}`,
        );
        for (const e of s.history)
          if (
            (e.status === "pending" || program(e.id).end === "condition") &&
            program(e.id).condition === "restore-marriage" &&
            e.restoreIds[a.seat]?.includes(spouse)
          )
            e.fulfilled = [...new Set([...e.fulfilled, a.seat])];
        break;
      }
      case "claim": {
        commit(s, a.seat, card);
        const defender = s.players.find((q) =>
          q.court.includes(a.target!),
        )!.seat;
        s.claim = { seat: a.seat, defender, target: a.target!, source: card };
        s.phase = "response";
        emit(
          s,
          "ClaimAnnounced",
          `${p.name === "You" ? "You try" : `${p.name} tries`} to take ${nameOf(a.target!)} with a Recall. ${s.players[defender].name} may Block.`,
          [card, a.target!],
          `leverage-${a.seat}`,
          `court-${defender}`,
        );
        break;
      }
      case "address": {
        const e = s.history.find((e) => e.id === a.event)!;
        if (program(e.id).condition === "seats-rotate") p.rotated.push(card);
        else commit(s, a.seat, card);
        e.fulfilled = [...new Set([...e.fulfilled, a.seat])];
        e.contributions.push({ seat: a.seat, card, dynasty: dynastyOf(card) });
        emit(
          s,
          "ConditionContributed",
          `${p.name === "You" ? "You help" : `${p.name} helps`} stop ${nameOf(e.id)} using ${nameOf(card)}.`,
          [card, e.id],
        );
        break;
      }
      case "attack": {
        const e = s.history.find((e) => e.id === a.event)!;
        p.rotated.push(card);
        e.attacks.push({ seat: a.seat, card });
        emit(
          s,
          "InterregnumAttacked",
          `${nameOf(card)} adds Challenge ${e.attacks.length} of ${program(e.id).requiredContributions} to ${nameOf(e.id)}.`,
          [card, e.id],
          `court-${a.seat}`,
          "history-row",
        );
        break;
      }
      case "veil": {
        const f = s.fragments.find((f) => f.id === a.target)!;
        remove(p.hand, card);
        s.noblePast.push(card);
        f.onceVeiled = true;
        f.veil = { seat: a.seat, until: s.round + 2 };
        emit(
          s,
          "OutlawDiscarded",
          `${nameOf(card)} is Discarded to The Past.`,
          [card],
          `hand-${a.seat}`,
          "noble-past",
        );
        emit(
          s,
          "FragmentVeiled",
          `${nameOf(f.id)} is Covered until the start of round ${s.round + 2}.`,
          [f.id],
          "painting",
          "painting",
        );
        for (const e of s.history)
          if (
            (e.status === "pending" || program(e.id).end === "condition") &&
            program(e.id).condition === "barter-or-veil"
          )
            e.fulfilled = [...new Set([...e.fulfilled, a.seat])];
        break;
      }
      case "proclaim": {
        const law = lawFor(s, a.seat, a.route!);
        const sealed = law.heir.zone === "hand" ? a.heirs![0] : null;
        if (sealed) remove(p.hand, sealed);
        s.crown = {
          seat: a.seat,
          route: a.route!,
          stage: "proclaimed",
          round: s.round,
          oldRuler: p.ruler!,
          heirs: [...a.heirs!],
          witness: a.witness ?? null,
          sealed,
          successor: null,
          reignRound: null,
        };
        emit(
          s,
          "CrownProclaimed",
          `${p.name === "You" ? "You claim" : `${p.name} claims`} the Crown. Change Ruler at the start of round ${s.round + law.successionAfter}; keep the new Ruler for ${law.reignRounds} full round${law.reignRounds === 1 ? "" : "s"} to win.`,
          [
            p.ruler!,
            ...(sealed ? [] : a.heirs!),
            ...(a.witness ? [a.witness] : []),
          ],
        );
        break;
      }
    }
    if (a.type !== "claim") completeAction(s);
  }
  pump(s);
  assertInvariants(s);
  return s;
}
export function resolveChoice(
  s: GameState,
  choiceId: string,
  selection: string[],
): GameState {
  const c = s.choices?.requests.find((c) => c.id === choiceId);
  if (!c) throw Error("No pending choice.");
  return applyAction(s, {
    type: "choice",
    seat: c.chooser,
    revision: s.revision,
    choiceId,
    cards: selection,
  });
}
export function advanceBoundary(state: GameState): GameState {
  const s = structuredClone(state);
  pump(s);
  assertInvariants(s);
  return s;
}
/** Typed, test-only adjudication seam. Production effects come from compiled cards. */
export function adjudicateEffectFixture(
  state: GameState,
  effect: Effect,
): GameState {
  const s = structuredClone(state);
  s.revision++;
  runEffect(s, effect, "action", "semantic-fixture");
  cleanup(s);
  if (s.phase !== "choice" && !s.result) interim(s, "action");
  assertInvariants(s);
  return s;
}
export function assertInvariants(s: GameState): void {
  const fail = (message: string) => {
    throw Error(`History invariant: ${message}`);
  };
  if (
    s.schema !== 4 ||
    s.rulesetId !== "history-engine-v4" ||
    s.contentVersion !== CONTENT_VERSION
  )
    fail("incompatible version");
  if (
    s.modules.length !== s.players.length ||
    new Set(s.modules).size !== s.modules.length ||
    s.modules.some((m) => !MODULES.includes(m))
  )
    fail("module/seat manifest");
  const locations = [
    ...s.dynastyDeck,
    ...s.noblePast,
    ...s.players.flatMap((p) => [...p.hand, ...p.court, ...p.leverage]),
    ...(s.crown?.sealed ? [s.crown.sealed] : []),
    ...(s.setup?.repairPacket ?? []),
  ];
  const expected = NOBLES.filter((c) =>
    s.modules.includes(c.printed.dynasty),
  ).map((c) => c.id);
  if (
    locations.length !== expected.length ||
    new Set(locations).size !== locations.length ||
    expected.some((id) => !locations.includes(id))
  )
    fail("Noble conservation");
  const history = [
    ...s.historyDeck,
    ...s.historyPast,
    ...s.history.map((e) => e.id),
    ...s.fragments.map((f) => f.id),
  ];
  const hexpected = [...INTERREGNA, ...FRAGMENTS]
    .filter((c) => s.modules.includes(c.printed.dynasty))
    .map((c) => c.id);
  if (
    history.length !== hexpected.length ||
    new Set(history).size !== history.length ||
    hexpected.some((id) => !history.includes(id))
  )
    fail("History conservation");
  if (
    s.players.some(
      (p, i) =>
        p.seat !== i ||
        !Number.isInteger(p.seals) ||
        p.seals < 0 ||
        p.seals > 3 ||
        new Set(p.rotated).size !== p.rotated.length ||
        p.rotated.some((id) => !p.court.includes(id)),
    )
  )
    fail("seat/seal/readiness");
  const married = s.marriages.flatMap((m) => [m.queen, m.spouse]);
  if (new Set(married).size !== married.length) fail("duplicate spouse");
  for (const m of s.marriages) {
    const p = s.players[m.seat];
    if (
      !p ||
      !p.court.includes(m.queen) ||
      !p.court.includes(m.spouse) ||
      dynastyOf(m.queen) !== p.dynasty ||
      !hasAbility(m.queen, "marry") ||
      dynastyOf(m.spouse) === p.dynasty
    )
      fail("invalid marriage");
  }
  for (const e of s.history)
    if (
      new Set(e.attacks.map((a) => a.card)).size !== e.attacks.length ||
      e.attacks.length > program(e.id).requiredContributions
    )
      fail("duplicate Challenge proof");
  for (const p of s.players)
    if (s.fragments.filter((f) => f.veil?.seat === p.seat).length > 1)
      fail("multiple Covers per seat");
  if (s.fragments.some((f) => f.veil && !f.onceVeiled))
    fail("Cover lacks once-ever proof");
  if (
    (s.phase === "response" && !s.claim) ||
    (s.phase === "choice" && !s.choices) ||
    (s.phase === "barter" && !s.barter) ||
    (s.phase === "terminal" && !s.result)
  )
    fail("phase continuation");
  if (s.events.some((e, i) => e.seq !== i + 1)) fail("event sequence");
}
