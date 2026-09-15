import { test, expect, vi } from "vitest";
import { createDuel, act, claimCost } from "../src/duel";
import { fresh } from "../src/progress";
vi.mock("../src/audio", () => ({
  setSound: vi.fn(),
  unlockAudio: vi.fn(),
  sfx: vi.fn(),
}));
vi.mock("../src/battlefield", () => ({
  Battlefield: class {
    sync() {}
    setMotion() {}
    dispose() {}
    async animate() {}
  },
}));
test("a won chronicle grants one heirloom and carries it into the next court", async () => {
  vi.useFakeTimers();
  const click = (s: string) => {
    const b = document.querySelector<HTMLButtonElement>(s);
    expect(b, s).toBeTruthy();
    expect(b!.disabled, s).toBe(false);
    b!.click();
  };
  const saved = () => JSON.parse(localStorage.getItem("oando-v3")!);
  // Resume a deterministic, legally declared crown with no rival orders left.
  const g = createDuel({
    seed: 71,
    house: "alba",
    seats: 3,
    mode: "chronicle",
  });
  const court = g.players[0];
  court.court.push(...court.hand.splice(0, 2));
  court.gold = 30;
  act(g, { type: "claim" });
  expect(court.gold).toBe(30 - claimCost(court));
  act(g, { type: "end" });
  act(g, { type: "end" });
  g.orders = 0;
  const profile = fresh();
  profile.sound = false;
  profile.motion = false;
  profile.game = g;
  profile.run = { house: "alba", act: 0, seed: 71, relics: [], reward: false };
  // UI module is intentionally one singleton; update by reloading it in a fresh document.
  document.body.innerHTML =
    '<div id="app"></div><div id="overlay"></div><div id="announcer"></div>';
  localStorage.setItem("oando-v3", JSON.stringify(profile));
  await import("../src/main");
  click("[data-resume]");
  // Coaching leaves the final contest announcement visible for 3.2 seconds.
  await vi.advanceTimersByTimeAsync(5000);
  expect(saved().game.winner).toBe(0);
  expect(saved().wins).toBe(1);
  expect(saved().run.reward).toBe(true);
  click("[data-result-next]");
  const reward =
    document.querySelector<HTMLElement>("[data-reward]")!.dataset.reward!;
  click("[data-reward]");
  expect(saved().run.act).toBe(1);
  expect(saved().run.relics).toEqual([reward]);
  click("[data-encounter]");
  expect(saved().game.relics).toEqual([reward]);
  expect(saved().wins).toBe(1);
  vi.useRealTimers();
});
