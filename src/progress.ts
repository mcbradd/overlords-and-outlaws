import { validateDuel, type Duel, type Mode } from "./duel";
import { HOUSES, type HouseId } from "./content";
export interface Progress {
  version: 2;
  game: Duel | null;
  wins: number;
  renown: number;
  sound: boolean;
  motion: boolean;
  coaching: boolean;
  seen: string[];
  run: null | {
    house: HouseId;
    act: number;
    seed: number;
    relics: string[];
    reward: boolean;
  };
  processed: string[];
  daily: { date: string; rounds: number } | null;
}
export const fresh = (): Progress => ({
  version: 2,
  game: null,
  wins: 0,
  renown: 0,
  sound: true,
  motion: !matchMedia("(prefers-reduced-motion: reduce)").matches,
  coaching: true,
  seen: [],
  run: null,
  processed: [],
  daily: null,
});
export function readProgress(): Progress {
  try {
    const current = localStorage.getItem("oando-v3");
    const p = JSON.parse(current ?? localStorage.getItem("oando-v2") ?? "null");
    if (p && !current) p.game = null;
    if (!p || p.version !== 2) return fresh();
    if (p.game && !validateDuel(p.game)) p.game = null;
    if (
      !Number.isFinite(p.wins) ||
      !Number.isFinite(p.renown) ||
      !Array.isArray(p.seen) ||
      !Array.isArray(p.processed)
    )
      return fresh();
    if (
      p.run &&
      (!HOUSES.some((h) => h.id === p.run.house) ||
        p.run.act < 0 ||
        p.run.act > 2 ||
        !Array.isArray(p.run.relics))
    )
      p.run = null;
    return { ...fresh(), ...p };
  } catch {
    return fresh();
  }
}
export function saveProgress(p: Progress) {
  try {
    localStorage.setItem("oando-v3", JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
