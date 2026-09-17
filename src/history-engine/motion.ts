import type { GameEvent } from "./types";
import { nameOf } from "./content";
export type Anchors = Map<string, DOMRect>;
export function captureAnchors(): Anchors {
  const result: Anchors = new Map();
  document
    .querySelectorAll<HTMLElement>("[data-card-id],[data-select]")
    .forEach((el) => {
      const id = el.dataset.cardId ?? el.dataset.select;
      if (id) result.set(id, el.getBoundingClientRect());
    });
  return result;
}
export function clearMotion() {
  document.querySelectorAll(".h-motion-card,.h-skip-motion").forEach((el) => {
    el.getAnimations().forEach((a) => a.cancel());
    el.remove();
  });
}
export function animateEvents(
  events: GameEvent[],
  before: Anchors,
  enabled: boolean,
) {
  clearMotion();
  if (!enabled) return;
  const motions = events.filter(
    (e) =>
      e.visibility === "public" &&
      [
        "NobleBuilt",
        "NobleTransferred",
        "RulerRetired",
        "NobleCommitted",
        "SealedHeirRevealed",
        "MarriageFormed",
        "HeirInstalled",
        "FragmentVeiled",
      ].includes(e.type),
  );
  if (!motions.length) return;
  const table = document.querySelector("#h-table")?.getBoundingClientRect();
  if (!table) return;
  const hand = document.querySelector(".h-hand")?.getBoundingClientRect();
  const after = captureAnchors();
  let playing = 0;
  for (const e of motions.slice(-6))
    for (const id of e.cards.slice(0, 2)) {
      const from = before.get(id);
      const target = after.get(id);
      // A travel animation must connect actual visible components. Never invent
      // an offscreen hand or pile destination for a private or loaned card.
      if (!from || !target) continue;
      if (
        target.y > innerHeight ||
        target.x > innerWidth ||
        from.y > innerHeight
      )
        continue;
      const el = document.createElement("div");
      el.className = "h-motion-card";
      el.textContent =
        e.type === "MarriageFormed"
          ? `Marriage formed · ${nameOf(id)}`
          : nameOf(id);
      el.style.width = `${Math.max(55, Math.min(115, from.width))}px`;
      el.style.height = `${(Math.max(55, Math.min(115, from.width)) * 88) / 63}px`;
      el.setAttribute("aria-hidden", "true");
      document.body.append(el);
      playing++;
      const animation = el.animate(
        [
          {
            transform: `translate(${from.x}px,${from.y}px) rotate(-3deg)`,
            opacity: 1,
          },
          {
            transform: `translate(${(from.x + target.x) / 2}px,${Math.min(from.y, target.y) - 40}px) rotate(2deg) scale(1.08)`,
            opacity: 1,
          },
          {
            transform: `translate(${target.x}px,${target.y}px) rotate(0deg)`,
            opacity: 0,
          },
        ],
        {
          duration: e.type === "HeirInstalled" ? 1300 : 400,
          easing: "ease-in-out",
        },
      );
      animation.onfinish = () => {
        el.remove();
        if (--playing === 0) document.querySelector(".h-skip-motion")?.remove();
      };
      animation.oncancel = () => el.remove();
    }
  if (playing) {
    const skip = document.createElement("button");
    skip.className = "h-skip-motion";
    skip.textContent = "Skip motion";
    skip.onclick = clearMotion;
    document.body.append(skip);
  }
}
