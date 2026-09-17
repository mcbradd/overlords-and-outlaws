import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAction, assertInvariants } from "../src/history-engine/engine";
import { createDemo, createDenseFixture } from "../src/history-engine/fixtures";
import {
  crownContinuity,
  passConsequences,
} from "../src/history-engine/deadlines";
import { nameOf } from "../src/history-engine/content";
import { previewAction } from "../src/history-engine/preview";
import { deadlinePages } from "../src/history-engine/reading";
import { viewForSeat, viewForSpectator } from "../src/history-engine/view";
import type {
  Action,
  GameState,
  HistoryEvent,
} from "../src/history-engine/types";

function act(
  state: GameState,
  action: Omit<Action, "seat" | "revision"> & { seat?: number },
): GameState {
  return applyAction(state, {
    seat: state.active,
    ...action,
    revision: state.revision,
  });
}

function clearCrises(state: GameState): void {
  state.historyPast.push(...state.history.map((event) => event.id));
  state.history = [];
}

function finalPass(state: GameState): void {
  state.active = state.players.length - 1;
  state.passes = state.players.slice(0, -1).map((player) => player.seat);
}

function addEvent(
  state: GameState,
  id: string,
  status: HistoryEvent["status"],
): HistoryEvent {
  state.historyPast = state.historyPast.filter((card) => card !== id);
  state.historyDeck = state.historyDeck.filter((card) => card !== id);
  const event: HistoryEvent = {
    id,
    status,
    order: ++state.revealSequence,
    revealed: state.round,
    activated: status === "active" ? state.round : null,
    expires: status === "active" ? state.round + 1 : null,
    obligated: state.players.map((player) => player.seat),
    fulfilled: [],
    contributions: [],
    attacks: [],
    restoreIds: {},
  };
  state.history.push(event);
  return event;
}

function coveredAlba(state: GameState): void {
  for (let slot = 5; slot <= 6; slot++) {
    const id = `painting-alba-${slot}`;
    state.historyDeck = state.historyDeck.filter((card) => card !== id);
    state.fragments.push({
      id,
      dynasty: "alba",
      slot,
      onceVeiled: false,
      veil: null,
    });
  }
  state.fragments[0].onceVeiled = true;
  state.fragments[0].veil = { seat: 0, until: state.round + 1 };
}

test("ordinary Pass has no boundary warning and inspection does not mutate state", () => {
  const state = createDemo();
  const before = structuredClone(state);
  const view = viewForSeat(state, 0);
  const preview = previewAction(view, {
    type: "pass",
    seat: 0,
    revision: state.revision,
  });
  assert.equal(preview.warning, "");
  assert.equal(passConsequences(view).endsRound, false);
  assert.deepEqual(state, before);
  assert.equal(act(state, { type: "pass" }).round, state.round);
});

test("final Pass warns of known lethal unveiling before refresh, and the engine follows that order", () => {
  const state = createDemo();
  clearCrises(state);
  coveredAlba(state);
  state.players.forEach((player) => {
    player.seals = 0;
  });
  finalPass(state);
  assertInvariants(state);
  const preview = previewAction(viewForSeat(state, state.active), {
    type: "pass",
    seat: state.active,
    revision: state.revision,
  });
  assert.match(preview.warning, /everyone loses before refresh or succession/);
  assert.match(preview.warning, /round 3/);
  const after = act(state, { type: "pass" });
  assert.equal(after.round, 3);
  assert.equal(after.result?.winner, "eudoxia");
  assert.deepEqual(
    after.players.map((player) => player.seals),
    [0, 0],
  );
  assert.equal(
    after.events.some((event) => event.type === "HistoryRevealed"),
    false,
  );
});

test("settlement is warned before a next-round lethal Cover and wins before that Cover expires", () => {
  const state = createDemo();
  clearCrises(state);
  coveredAlba(state);
  state.players[0].court = state.players[0].court.filter(
    (card) => card !== "alba-0",
  );
  state.noblePast.push("alba-0");
  state.players[0].ruler = "alba-3";
  state.crown = {
    seat: 0,
    route: "kindreds",
    stage: "reigning",
    round: 1,
    oldRuler: "alba-0",
    heirs: ["alba-3"],
    witness: null,
    sealed: null,
    successor: "alba-3",
    reignRound: state.round,
  };
  finalPass(state);
  assertInvariants(state);
  const forecast = passConsequences(viewForSpectator(state));
  const settlement = forecast.deadlines.findIndex(
    (deadline) => deadline.kind === "settlement",
  );
  const unveiling = forecast.deadlines.findIndex(
    (deadline) => deadline.kind === "unveil",
  );
  assert.ok(settlement >= 0 && settlement < unveiling);
  assert.match(forecast.deadlines[unveiling].text, /If no one wins this round/);
  const after = act(state, { type: "pass" });
  assert.equal(after.result?.winner, 0);
  assert.equal(after.round, 2);
  assert.ok(after.fragments[0].veil);
});

test("legal Alba Proclamation warns of retirement, then successor choice precedes History", () => {
  let state = createDemo();
  clearCrises(state);
  state.players[0].hand = state.players[0].hand.filter(
    (card) => card !== "alba-7",
  );
  state.players[0].court.push("alba-7");
  state = act(state, {
    type: "proclaim",
    route: "kindreds",
    heirs: ["alba-3", "alba-7"],
  });
  state = act(state, { type: "pass" });
  const forecast = passConsequences(viewForSeat(state, 0));
  assert.match(
    forecast.deadlines.find((deadline) => deadline.kind === "succession")!.text,
    /Retires permanently at the start of round 3/,
  );
  assert.ok(forecast.warning.includes(nameOf("alba-0")));
  state = act(state, { type: "pass" });
  assert.equal(state.choices?.effect, "succession");
  const choice = state.choices!.requests[0];
  state = act(state, {
    type: "choice",
    seat: choice.chooser,
    choiceId: choice.id,
    cards: ["alba-7"],
  });
  assert.equal(state.players[0].ruler, "alba-7");
  assert.ok(state.noblePast.includes("alba-0"));
  assert.equal(state.crown?.stage, "reigning");
  assert.equal(state.phase, "action");
  assert.ok(
    state.events.findIndex((event) => event.type === "HeirInstalled") <
      state.events.findIndex((event) => event.type === "HistoryRevealed"),
  );
});

test("a succession restriction expiring now does not predict a blocked next succession", () => {
  const state = createDenseFixture();
  clearCrises(state);
  addEvent(state, "H2", "active").expires = state.round;
  finalPass(state);
  assertInvariants(state);
  const forecast = passConsequences(viewForSpectator(state));
  assert.match(
    forecast.deadlines.find((deadline) => deadline.kind === "expiry")!.text,
    /expire before Crown settlement and the next succession/,
  );
  assert.doesNotMatch(forecast.warning, /will forfeit/);
  const after = act(state, { type: "pass" });
  assert.equal(after.crown?.stage, "reigning");
  assert.ok(after.noblePast.includes("plantagenet-0"));
  assert.ok(
    after.events.findIndex((event) => event.type === "InterregnumExpired") <
      after.events.findIndex((event) => event.type === "HeirInstalled"),
  );
});

test("an unstopped pending succession restriction warns of forfeiture without retirement", () => {
  const state = createDenseFixture();
  clearCrises(state);
  addEvent(state, "H2", "pending");
  finalPass(state);
  const forecast = passConsequences(viewForSpectator(state));
  assert.match(
    forecast.warning,
    /succession fails if its blocking Crisis remains/,
  );
  assert.match(
    forecast.deadlines.find((deadline) => deadline.kind === "succession")!.text,
    /will not Retire/,
  );
  const after = act(state, { type: "pass" });
  assert.equal(after.crown, null);
  assert.equal(after.players[1].ruler, "plantagenet-0");
  assert.equal(after.noblePast.includes("plantagenet-0"), false);
});

test("recurring compulsory choices are scheduled after succession, never before it", () => {
  const state = createDenseFixture();
  clearCrises(state);
  addEvent(state, "A2", "active");
  finalPass(state);
  const forecast = passConsequences(viewForSpectator(state));
  assert.match(
    forecast.deadlines.find(
      (deadline) =>
        deadline.kind === "crisis" && deadline.timing === "next-start",
    )!.text,
    /If play continues after succession, Border Rising/,
  );
  const after = act(state, { type: "pass" });
  assert.equal(after.choices?.effect, "retire-supported");
  assert.equal(after.crown?.stage, "reigning");
  assert.ok(
    after.events.findIndex((event) => event.type === "HeirInstalled") <
      after.events.findIndex((event) => event.type === "ChoicesOpened"),
  );
});

test("extra History draws stay explicitly unknown and are bounded by the remaining deck", () => {
  const state = createDenseFixture();
  clearCrises(state);
  addEvent(state, "T3", "active");
  const returned = [
    "painting-alba-6",
    "painting-plantagenet-6",
    "painting-tudor-6",
    "painting-habsburg-6",
    "painting-tudor-5",
  ];
  state.fragments = state.fragments.filter(
    (fragment) => !returned.includes(fragment.id),
  );
  state.historyDeck = returned;
  finalPass(state);
  assertInvariants(state);
  const forecast = passConsequences(viewForSpectator(state));
  assert.match(forecast.warning, /up to 5 unknown History draws/);
  assert.match(
    forecast.deadlines.find((deadline) => deadline.kind === "history")!.text,
    /Their identities are unknown/,
  );
  const after = act(state, { type: "pass" });
  assert.equal(
    after.events.filter((event) => event.type === "HistoryRevealed").length,
    5,
  );
  assert.equal(after.historyDeck.length, 0);
  assert.equal(after.result, null);
});

test("deadline projection is invariant to private hands, deck order and a sealed Tudor heir", () => {
  const state = createDenseFixture();
  clearCrises(state);
  const hidden = state.players[2].hand.pop()!;
  state.crown = {
    seat: 2,
    route: "act",
    stage: "proclaimed",
    round: state.round,
    oldRuler: state.players[2].ruler!,
    heirs: [hidden],
    witness: null,
    sealed: hidden,
    successor: null,
    reignRound: null,
  };
  finalPass(state);
  const copy = structuredClone(state);
  const replacement = copy.players[2].hand.pop()!;
  copy.players[2].hand.push(hidden);
  copy.crown!.sealed = replacement;
  copy.crown!.heirs = [replacement];
  copy.dynastyDeck.reverse();
  copy.historyDeck.reverse();
  [copy.players[1].hand[0], copy.players[3].hand[0]] = [
    copy.players[3].hand[0],
    copy.players[1].hand[0],
  ];
  assertInvariants(state);
  assertInvariants(copy);
  const publicBefore = viewForSpectator(state);
  assert.deepEqual(
    passConsequences(publicBefore),
    passConsequences(viewForSpectator(copy)),
  );
  assert.equal(
    crownContinuity(publicBefore),
    crownContinuity(viewForSeat(copy, 2)),
  );
  assert.deepEqual(
    deadlinePages(publicBefore),
    deadlinePages(viewForSeat(copy, 2)),
  );
  const text =
    JSON.stringify(passConsequences(viewForSeat(state, 2))) +
    crownContinuity(viewForSeat(state, 2));
  assert.ok(!text.includes(nameOf(hidden)));
  assert.ok(!text.includes(nameOf(replacement)));
});

test("Alba explanation allows either candidate before succession, then requires the installed successor", () => {
  const state = createDemo();
  state.players[0].hand = state.players[0].hand.filter(
    (card) => card !== "alba-7",
  );
  state.players[0].court.push("alba-7");
  state.crown = {
    seat: 0,
    route: "kindreds",
    stage: "proclaimed",
    round: state.round,
    oldRuler: "alba-0",
    heirs: ["alba-3", "alba-7"],
    witness: null,
    sealed: null,
    successor: null,
    reignRound: null,
  };
  assert.match(
    crownContinuity(viewForSpectator(state)),
    /at least one named heir/,
  );
  state.players[0].court = state.players[0].court.filter(
    (card) => card !== "alba-3",
  );
  state.players[0].hand.push("alba-3");
  const remaining = crownContinuity(viewForSpectator(state));
  assert.match(remaining, /remaining named heir/);
  assert.ok(remaining.includes(nameOf("alba-7")));
  assert.ok(!remaining.includes(nameOf("alba-3")));
  state.crown.stage = "reigning";
  state.crown.successor = "alba-7";
  assert.equal(
    crownContinuity(viewForSpectator(state)),
    `Keep ${nameOf("alba-7")} as Ruler and in the Bloodline.`,
  );
});

test("dense Pass preview stays within fifty words while preserving the complete public schedule", () => {
  const state = createDenseFixture();
  finalPass(state);
  const forecast = passConsequences(viewForSpectator(state));
  assert.ok(
    `${forecast.effect} ${forecast.warning}`.trim().split(/\s+/).length <= 50,
  );
  assert.ok(forecast.deadlines.length > 5);
  assert.match(forecast.warning, /6 unstopped Crises activate first/);
  const firstStart = forecast.deadlines.findIndex(
    (deadline) => deadline.timing === "next-start",
  );
  assert.ok(
    forecast.deadlines
      .slice(firstStart)
      .every((deadline) => deadline.timing === "next-start"),
  );
});

test("possible painting completion is a draw risk, not a prediction from hidden deck order", () => {
  const state = createDemo();
  clearCrises(state);
  finalPass(state);
  const before = passConsequences(viewForSpectator(state));
  assert.match(
    before.warning,
    /alba could complete during 2 unknown History draws/,
  );
  state.historyDeck.reverse();
  assert.deepEqual(passConsequences(viewForSpectator(state)), before);
  state.fragments[0].veil = { seat: 0, until: state.round + 2 };
  state.fragments[0].onceVeiled = true;
  assert.doesNotMatch(
    passConsequences(viewForSpectator(state)).warning,
    /alba could complete/,
  );
});
