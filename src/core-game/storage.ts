import {
  applyAction,
  assertInvariants,
  createTutorial,
  legalActions,
  viewForSeat,
  type CoreState,
} from "./engine";
import { TEACHING, isTeachingAction } from "./tutorial";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return (
      "{" +
      entries
        .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value);
}

function validateLesson(
  game: CoreState,
  lesson: NonNullable<CoreSave["lesson"]>,
) {
  let expected = createTutorial();
  const count = lesson.cursor + Number(lesson.done);
  for (let cursor = 0; cursor < count; cursor++) {
    const seat = TEACHING[cursor].seat;
    const action = legalActions(viewForSeat(expected, seat), seat).find((a) =>
      isTeachingAction(a, cursor),
    );
    if (!action)
      throw new Error(
        "The lesson could not be restored. Your original save is preserved.",
      );
    expected = applyAction(expected, action);
  }
  if (canonical(expected) !== canonical(game))
    throw new Error(
      "The saved lesson does not match its teaching step. Your original save is preserved.",
    );
}

export interface CoreSave {
  game: CoreState;
  lesson: { cursor: number; done: boolean } | null;
  mode: "solo" | "local" | "tutorial";
  names: string[];
  motion: boolean;
}
export const saveKey = (namespace = "") => `${namespace}oando-v5-played-trades`;
export function encodeSave(save: CoreSave): string {
  return JSON.stringify({
    version: 5,
    ruleset: "rank-core-played-trades-v2",
    ...save,
  });
}
export function decodeSave(text: string): CoreSave {
  const value = JSON.parse(text);
  if (value?.version !== 5 || value.ruleset !== "rank-core-played-trades-v2")
    throw new Error(
      "This save uses different rules. Your original save is preserved; start a new table for Played-pile trades.",
    );
  assertInvariants(value.game);
  if (
    !["solo", "local", "tutorial"].includes(value.mode) ||
    typeof value.motion !== "boolean" ||
    !Array.isArray(value.names) ||
    value.names.length !== value.game.players.length ||
    value.names.some(
      (name: unknown) => typeof name !== "string" || name.length > 60,
    ) ||
    (value.lesson !== null &&
      (!value.lesson ||
        !Number.isInteger(value.lesson.cursor) ||
        value.lesson.cursor < 0 ||
        value.lesson.cursor >= TEACHING.length ||
        typeof value.lesson.done !== "boolean")) ||
    (value.mode === "tutorial") !== (value.lesson !== null)
  )
    throw new Error(
      "This save has invalid player or lesson information. The original is preserved.",
    );
  if (value.lesson) validateLesson(value.game, value.lesson);
  return {
    game: value.game,
    lesson: value.lesson,
    mode: value.mode,
    names: value.names,
    motion: value.motion,
  };
}
export function readSave(
  storage: Pick<Storage, "getItem">,
  namespace = "",
): { save: CoreSave | null; error: string | null } {
  try {
    const bytes = storage.getItem(saveKey(namespace));
    return {
      save: bytes ? decodeSave(bytes) : null,
      error:
        !bytes && storage.getItem(`${namespace}oando-v5-core`)
          ? "Your older table is preserved. Start a new table to use Played-pile trades."
          : null,
    };
  } catch (error) {
    return {
      save: null,
      error:
        error instanceof Error ? error.message : "The save could not be read.",
    };
  }
}
export function writeSave(
  storage: Pick<Storage, "setItem">,
  save: CoreSave,
  namespace = "",
): void {
  storage.setItem(saveKey(namespace), encodeSave(save));
}
