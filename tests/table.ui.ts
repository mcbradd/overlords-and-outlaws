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
test("family privacy, inspection, save/resume, and campaign inheritance through UI", async () => {
  vi.useFakeTimers();
  document.body.innerHTML =
    '<div id="app"></div><div id="overlay"></div><div id="announcer"></div>';
  localStorage.clear();
  const p = fresh();
  p.motion = false;
  p.sound = false;
  localStorage.setItem("oando-v3", JSON.stringify(p));
  await import("../src/main");
  const click = (s: string) => {
    const b = document.querySelector<HTMLButtonElement>(s);
    expect(b, s).toBeTruthy();
    expect(b!.disabled, s).toBe(false);
    b!.click();
  };
  const saved = () => JSON.parse(localStorage.getItem("oando-v3")!);
  click('[data-start="family"]');
  const select = document.querySelector<HTMLSelectElement>("#seats")!;
  select.value = "4";
  select.dispatchEvent(new Event("change", { bubbles: true }));
  click("[data-launch]");
  expect(saved().game.players).toHaveLength(4);
  expect(document.querySelectorAll(".hand-cards [data-royal]")).toHaveLength(0);
  click("[data-ready]");
  expect(document.querySelectorAll(".hand-cards [data-royal]")).toHaveLength(5);
  click("[data-end]");
  await vi.advanceTimersByTimeAsync(100);
  expect(saved().game.turn).toBe(1);
  expect(document.querySelectorAll(".hand-cards [data-royal]")).toHaveLength(0);
  click("[data-ready]");
  click("[data-save]");
  click("[data-resume]");
  expect(document.querySelectorAll(".hand-cards [data-royal]")).toHaveLength(0);
  click("[data-ready]");
  click("[data-save]");
  click("[data-archive]");
  expect(document.querySelectorAll(".archive-grid [data-royal]")).toHaveLength(
    14,
  );
  click(".archive-grid [data-royal]");
  expect(document.querySelector(".inspect-layout")).toBeTruthy();
  click("[data-close]");
  vi.useRealTimers();
});
