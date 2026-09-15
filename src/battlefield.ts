import { cardFace, esc } from "./cards";
import { active, type Duel, type Moment } from "./duel";
import { card, house } from "./content";

/** Layout owns geometry; no camera may shrink interactive information. */
export class Battlefield {
  private reduced = true;
  private animations = new Set<Animation>();
  private rival: number | null = null;
  private resize: ResizeObserver;
  private frame = 0;
  constructor(private container: HTMLElement) {
    container.classList.add("court-table");
    container.addEventListener("click", this.chooseRival);
    this.resize = new ResizeObserver(this.measureOverflow);
    this.resize.observe(container);
  }
  private measureOverflow = () => {
    this.container
      .querySelectorAll<HTMLElement>(".court-cards")
      .forEach((row) => {
        row.closest<HTMLElement>(".court-lane")!.dataset.overflow = String(
          row.scrollWidth > row.clientWidth + 2,
        );
      });
  };
  private chooseRival = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-view-court]",
    );
    if (!button) return;
    this.rival = Number(button.dataset.viewCourt);
    this.markRival();
    this.measureOverflow();
  };
  private markRival() {
    this.container
      .querySelectorAll<HTMLElement>("[data-view-court]")
      .forEach((el) =>
        el.setAttribute(
          "aria-pressed",
          String(Number(el.dataset.viewCourt) === this.rival),
        ),
      );
    this.container
      .querySelectorAll<HTMLElement>(".rival-court")
      .forEach((el) =>
        el.classList.toggle(
          "shown-rival",
          Number(el.dataset.courtSeat) === this.rival,
        ),
      );
  }
  setMotion(on: boolean) {
    this.reduced = !on;
  }
  sync(g: Duel, selected: string | null, targets: string[] = [], viewer = 0) {
    const focus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement.dataset.royal
        : undefined;
    const positions = new Map(
      [...this.container.querySelectorAll<HTMLElement>(".court-cards")].map(
        (e) => [e.dataset.owner, e.scrollLeft],
      ),
    );
    const lane = (id: number) => {
      const p = g.players[id],
        own = id === viewer,
        h = house(p.house);
      return `<section class="court-lane ${own ? "your-court" : "rival-court"} ${g.turn === id && !g.over ? "acting" : ""}" data-court-seat="${id}" style="--house:${h.color}" aria-label="${h.name} court"><header class="court-lane-heading"><strong>${own ? "Your court" : h.name}</strong><span>${own ? h.name + " · " : ""}${p.court.length} / 5 Royals${g.turn === id && !g.over ? " · Acting" : ""}</span></header><div class="court-cards" data-owner="${id}" tabindex="0" aria-label="${h.name} Royals; scroll for more">${p.court.map((r) => `<div class="piece-container" data-owner="${id}">${cardFace(r, { owner: p, zone: "court", selected: selected === r.uid, target: targets.includes(r.uid) })}<span class="piece-state ${r.ready ? "ready" : ""}">${r.ready ? "Ready" : "Resting"}${!active(p, r) ? " · Foreign" : r.marriedTo ? " · Married" : ""}</span>${r.marriedTo ? `<span class="marriage-label" title="Married to ${esc(card(p.court.find((q) => q.uid === r.marriedTo)?.card ?? r.card).name)}">∞ ${esc(card(p.court.find((q) => q.uid === r.marriedTo)?.card ?? r.card).name)}</span>` : ""}</div>`).join("") || `<div class="empty-court">${own ? "Play a Royal from your hand" : "No Royals in court"}</div>`}</div></section>`;
    };
    const rivals = g.players.filter((p) => p.id !== viewer);
    if (!rivals.some((p) => p.id === this.rival)) this.rival = rivals[0].id;
    this.container.innerHTML = `<nav class="rival-tabs" aria-label="View rival court">${rivals.map((p) => `<button data-view-court="${p.id}">${house(p.house).name} <span>${p.court.length}/5</span></button>`).join("")}</nav><div class="rival-courts" data-rivals="${g.players.length - 1}">${rivals.map((p) => lane(p.id)).join("")}</div>${lane(viewer)}`;
    this.markRival();
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(this.measureOverflow);
    for (const row of this.container.querySelectorAll<HTMLElement>(
      ".court-cards",
    ))
      row.scrollLeft = positions.get(row.dataset.owner) ?? 0;
    if (focus)
      [...this.container.querySelectorAll<HTMLElement>("[data-royal]")]
        .find((e) => e.dataset.royal === focus)
        ?.focus({ preventScroll: true });
  }
  async animate(e: Moment) {
    if (this.reduced) return;
    const uid = e.kind === "defeat" ? e.target : e.source;
    const piece = [
      ...this.container.querySelectorAll<HTMLElement>("[data-royal]"),
    ].find((el) => el.dataset.royal === uid);
    if (!piece) return;
    const frames = ["deploy", "marry"].includes(e.kind)
      ? [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "none" },
        ]
      : [
          { transform: "none" },
          { transform: "translateY(-6px)", offset: 0.4 },
          { transform: "none" },
        ];
    const animation = piece.animate(frames, {
      duration: 220,
      easing: "ease-out",
    });
    this.animations.add(animation);
    try {
      await animation.finished;
    } catch {
      /* Disposed during navigation. */
    }
    this.animations.delete(animation);
  }
  dispose() {
    this.resize.disconnect();
    cancelAnimationFrame(this.frame);
    this.container.removeEventListener("click", this.chooseRival);
    this.animations.forEach((a) => a.cancel());
    this.animations.clear();
    this.container.innerHTML = "";
  }
}
