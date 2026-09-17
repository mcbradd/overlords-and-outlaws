import { CONTENT_VERSION } from "./content";
import { assertInvariants } from "./engine";
import type { GameState } from "./types";
export interface Preferences {
  quality: "high" | "standard" | "compact" | "semantic";
  motion: boolean;
  effects: number;
  music: number;
  largeText: boolean;
}
export interface SavedGame {
  version: 4;
  rulesetId: "history-engine-v4";
  contentVersion: string;
  game: GameState;
  tutorial: number | null;
  preferences: Preferences;
}
export const defaultPreferences = (): Preferences => ({
  quality: "standard",
  motion:
    typeof matchMedia === "function"
      ? !matchMedia("(prefers-reduced-motion: reduce)").matches
      : true,
  effects: 0.35,
  music: 0,
  largeText: false,
});
const prefix = import.meta.env?.VITE_SAVE_NAMESPACE ?? "";
export const SAVE_KEY = `${prefix}oando-v4-history`;
export const LEGACY_KEY = `${prefix}oando-v3`;
export function decodeSave(text: string): SavedGame {
  const value = JSON.parse(text);
  if (
    value?.version !== 4 ||
    value.rulesetId !== "history-engine-v4" ||
    value.contentVersion !== CONTENT_VERSION ||
    !value.game
  )
    throw Error(
      "This save uses a different ruleset or content version. Keep the original file and continue its matching game.",
    );
  assertInvariants(value.game);
  return {
    ...value,
    preferences: { ...defaultPreferences(), ...value.preferences },
  };
}
export function readSave(storage: Pick<Storage, "getItem"> = localStorage): {
  save: SavedGame | null;
  error: string | null;
  legacy: boolean;
} {
  try {
    const text = storage.getItem(SAVE_KEY);
    return {
      save: text ? decodeSave(text) : null,
      error: null,
      legacy: !!storage.getItem(LEGACY_KEY),
    };
  } catch (error) {
    return {
      save: null,
      error: error instanceof Error ? error.message : "Save unavailable.",
      legacy: false,
    };
  }
}
export function saveGame(
  game: GameState,
  tutorial: number | null,
  preferences: Preferences,
  storage: Pick<Storage, "setItem"> = localStorage,
): string | null {
  try {
    assertInvariants(game);
    const value: SavedGame = {
      version: 4,
      rulesetId: "history-engine-v4",
      contentVersion: CONTENT_VERSION,
      game,
      tutorial,
      preferences,
    };
    storage.setItem(SAVE_KEY, JSON.stringify(value));
    return null;
  } catch {
    return "This device could not save the game. Export a Private full game save before closing.";
  }
}
