import { test, expect } from "vitest";
import { createDuel } from "../src/duel";
import { fresh, readProgress, saveProgress } from "../src/progress";

test("V3 keeps earned V2 progress without resuming a table under changed rules", () => {
  localStorage.clear();
  const old = {
    ...fresh(),
    wins: 7,
    renown: 12,
    seen: ["alba-0"],
    game: createDuel({ seed: 123, house: "alba" }),
  };
  const original = JSON.stringify(old);
  localStorage.setItem("oando-v2", original);
  const migrated = readProgress();
  expect(migrated.wins).toBe(7);
  expect(migrated.seen).toEqual(["alba-0"]);
  expect(migrated.game).toBeNull();
  expect(localStorage.getItem("oando-v2")).toBe(original);
  migrated.game = createDuel({ seed: 456, house: "tudor" });
  saveProgress(migrated);
  expect(readProgress().game?.seed).toBe(456);
});
