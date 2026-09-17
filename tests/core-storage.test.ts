import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAction, createTutorial } from "../src/core-game/engine";
import { TEACHING, isTeachingAction } from "../src/core-game/tutorial";
import { legalActions, viewForSeat } from "../src/core-game/engine";
import { BY_ID } from "../src/core-game/content";
import {
  decodeSave,
  encodeSave,
  readSave,
  writeSave,
  saveKey,
} from "../src/core-game/storage";
test("APP06 first taught play names its actual printed person", () => {
  const introduced = new Set<string>();
  for (const step of TEACHING) {
    if (step.card && !introduced.has(step.card)) {
      assert.ok(
        step.explanation.includes(BY_ID[step.card].name),
        `First ${step.type} must introduce ${BY_ID[step.card].name}`,
      );
      introduced.add(step.card);
    }
    assert.doesNotMatch(
      step.explanation,
      /\bnative\b/i,
      "The lesson uses the already taught own-Dynasty concept",
    );
  }
});
test("U28/U30 current save restores exact state and preserves historical keys", () => {
  const values = new Map([
    ["prod:oando-v5-core", "untouched-v5"],
    ["prod:oando-v4-history", "untouched-v4"],
    ["prod:oando-v3", "untouched-v3"],
  ]);
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
  };
  const saved = {
    game: createTutorial(),
    lesson: { cursor: 0, done: false },
    mode: "tutorial" as const,
    names: ["You", "Rival"],
    motion: false,
  };
  writeSave(storage, saved, "prod:");
  assert.deepEqual(
    readSave(storage, "prod:").save,
    decodeSave(encodeSave(saved)),
  );
  assert.equal(values.get("prod:oando-v4-history"), "untouched-v4");
  assert.equal(values.get("prod:oando-v3"), "untouched-v3");
  assert.equal(values.get("prod:oando-v5-core"), "untouched-v5");
  assert.equal(saveKey("prod:"), "prod:oando-v5-played-trades");
});
test("R01 tutorial saves accept every reached boundary and reject mismatched progress", () => {
  let game = createTutorial();
  for (let cursor = 0; cursor < TEACHING.length; cursor++) {
    const save = {
      game,
      lesson: { cursor, done: false },
      mode: "tutorial" as const,
      names: ["You", "Rival"],
      motion: true,
    };
    assert.deepEqual(decodeSave(encodeSave(save)).game, game);
    assert.throws(() =>
      decodeSave(encodeSave({ ...save, lesson: { cursor, done: true } })),
    );
    const action = legalActions(
      viewForSeat(game, TEACHING[cursor].seat),
      TEACHING[cursor].seat,
    ).find((a) => isTeachingAction(a, cursor))!;
    game = applyAction(game, action);
    assert.deepEqual(
      decodeSave(encodeSave({ ...save, game, lesson: { cursor, done: true } }))
        .game,
      game,
    );
    assert.throws(() => decodeSave(encodeSave({ ...save, game })));
  }
  const changed = createTutorial();
  changed.players[0].hand.reverse();
  assert.throws(() =>
    decodeSave(
      encodeSave({
        game: changed,
        lesson: { cursor: 0, done: false },
        mode: "tutorial",
        names: ["You", "Rival"],
        motion: true,
      }),
    ),
  );
  const ordered = createTutorial();
  const reordered = Object.fromEntries(Object.entries(ordered).reverse());
  assert.deepEqual(
    decodeSave(
      encodeSave({
        game: reordered as typeof ordered,
        lesson: { cursor: 0, done: false },
        mode: "tutorial",
        names: ["You", "Rival"],
        motion: true,
      }),
    ).game,
    ordered,
  );
});
test("U29 corrupt and unknown saves fail without rewriting stored bytes", () => {
  const bytes = "{broken";
  const storage = { getItem: () => bytes };
  assert.equal(readSave(storage).save, null);
  assert.ok(readSave(storage).error);
  assert.throws(() => decodeSave('{"version":99}'));
  assert.equal(storage.getItem(), bytes);
});

test("Played-pile rules reject old hand-trade saves without modifying their bytes", () => {
  const original = JSON.stringify({
    version: 5,
    ruleset: "rank-core-v1",
    game: createTutorial(),
  });
  assert.throws(() => decodeSave(original), /different rules/);
  const values = new Map([["prod:oando-v5-core", original]]);
  const loaded = readSave(
    { getItem: (key) => values.get(key) ?? null },
    "prod:",
  );
  assert.equal(loaded.save, null);
  assert.match(loaded.error!, /older table is preserved/);
  assert.equal(values.get("prod:oando-v5-core"), original);
});
test("U29 invalid tutorial cursor and duplicate card state are rejected", () => {
  const saved = {
    game: createTutorial(),
    lesson: { cursor: -1, done: false },
    mode: "tutorial" as const,
    names: ["You", "Rival"],
    motion: true,
  };
  assert.throws(() => decodeSave(encodeSave(saved)));
  saved.lesson.cursor = 0;
  saved.game.players[0].hand.push(saved.game.players[0].court[0]);
  assert.throws(() => decodeSave(encodeSave(saved)));
});
