import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createTutorial,
  LESSONS,
  lessonAction,
  validateTutorial,
} from "../src/history-engine/tutorial";
import { createDemo, createDenseFixture } from "../src/history-engine/fixtures";
import { applyAction, assertInvariants } from "../src/history-engine/engine";
import {
  decodeSave,
  defaultPreferences,
  readSave,
  saveGame,
  SAVE_KEY,
  LEGACY_KEY,
} from "../src/history-engine/storage";
import { CONTENT_VERSION, MANIFEST } from "../src/history-engine/content";
import { viewForSeat, viewForSpectator } from "../src/history-engine/view";
import { chooseAction } from "../src/history-engine/ai";
test("continuous teaching match includes real opposition, History, protected succession and legal settlement", () => {
  const s = validateTutorial();
  assert.equal(s.result?.winner, 0);
  for (const type of [
    "BarterCompleted",
    "MarriageFormed",
    "ClaimAnnounced",
    "NobleCommitted",
    "InterregnumAverted",
    "InterregnumActivated",
    "FragmentVeiled",
    "HeirInstalled",
  ])
    assert.ok(
      s.events.some((e) => e.type === type),
      type,
    );
  assert.equal(s.round, 4);
  assert.equal(s.noblePast.includes("alba-0"), true);
  assert.equal(s.players[1].hand.includes("alba-0"), false);
  assert.equal(s.events.some(event => event.type === "CrownForfeited"), false);
});
test("every tutorial boundary round-trips through a versioned private save and preserves its continuation", () => {
  let s = createTutorial();
  for (let i = 0; i < LESSONS.length; i++) {
    const value = {
      version: 4,
      rulesetId: "history-engine-v4",
      contentVersion: CONTENT_VERSION,
      game: s,
      tutorial: i,
      preferences: defaultPreferences(),
    };
    const restored = decodeSave(JSON.stringify(value));
    const action = lessonAction(s, i)!;
    assert.deepEqual(
      JSON.parse(JSON.stringify(applyAction(s, action))),
      applyAction(restored.game, action),
    );
    s = applyAction(s, action);
  }
});
test("new storage cannot overwrite legacy bytes and rejects corrupted or incompatible saves", () => {
  const values = new Map([[LEGACY_KEY, "legacy-sentinel"]]);
  const store = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  assert.equal(
    saveGame(createTutorial(), 0, defaultPreferences(), store),
    null,
  );
  assert.equal(values.get(LEGACY_KEY), "legacy-sentinel");
  assert.ok(readSave(store).save);
  values.set(SAVE_KEY, '{"version":2}');
  assert.equal(readSave(store).save, null);
  assert.ok(readSave(store).error);
  values.set(SAVE_KEY, "broken");
  assert.ok(readSave(store).error);
  assert.equal(values.get(LEGACY_KEY), "legacy-sentinel");
});
test("demo and maximum density fixtures conserve exact manifests without capacity limits", () => {
  for (const s of [
    createDemo(),
    createDenseFixture(),
    createDenseFixture(true),
  ])
    assertInvariants(s);
  assert.equal(
    createDenseFixture(true).players.flatMap((p) => p.court).length,
    52,
  );
  assert.equal(createDenseFixture().marriages.length, 4);
});
test("AI is independent of hidden hand and deck permutations", () => {
  let s = validateTutorial();
  s.result = null;
  s.phase = "action";
  s.active = 1;
  const before = chooseAction(viewForSeat(s, 1), 1);
  const copy = structuredClone(s);
  const hands = copy.players.filter((p) => p.seat !== 1);
  if (hands[0].hand.length && hands[1].hand.length)
    [hands[0].hand[0], hands[1].hand[0]] = [hands[1].hand[0], hands[0].hand[0]];
  copy.dynastyDeck.reverse();
  copy.historyDeck.reverse();
  assert.deepEqual(viewForSeat(s, 1), viewForSeat(copy, 1));
  assert.deepEqual(chooseAction(viewForSeat(copy, 1), 1), before);
  assert.equal("rng" in viewForSpectator(s), false);
  assert.equal("historyDeck" in viewForSpectator(s), false);
});
test("reminder stripping preserves actual full-game outcomes", () => {
  const original = Object.values(MANIFEST).map(
    (c) => [c.sourceId, [...c.reminderRefs]] as const,
  );
  const before = validateTutorial();
  for (const c of Object.values(MANIFEST)) c.reminderRefs = [];
  try {
    assert.deepEqual(validateTutorial(), before);
  } finally {
    for (const [id, refs] of original) MANIFEST[id].reminderRefs = [...refs];
  }
});
