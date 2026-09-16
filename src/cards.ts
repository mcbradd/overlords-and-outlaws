import { assetUrl } from "./assets";
import { CHARACTER_ART } from "./character-art";
import { card, house, type Role } from "./content";
import { ROLES, spec, cost, active, type Royal, type Court } from "./duel";
import { cardRules, rulesText, type CardRule } from "./card-rules";
export const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export const portrait = (id: string) => {
  return assetUrl(CHARACTER_ART[card(id).id]);
};
export function crest(id: string) {
  const h = house(card(id).house);
  const paths: Record<string, string> = {
    alba: "M20 8v24M10 16l20 8M10 24l20-8M15 5l5 4 5-4M15 35l5-4 5 4",
    plantagenet: "M10 29l7-7-4-5 6-7 9 1-3 6 5 7-3 9M17 22l9 1M18 10l1-5",
    tudor:
      "M20 11C10 0 4 15 13 19C0 22 10 35 17 27C20 41 32 31 27 23C41 18 28 6 24 14Z",
    valois:
      "M20 4C9 15 24 16 20 30M20 4C31 15 16 16 20 30M20 21C0 2 1 33 18 24M20 21C40 2 39 33 22 24M13 29h14M17 34h6",
    habsburg:
      "M20 6v28M20 14L5 6l4 13 8 2-10 9 10-3 3 7 3-7 10 3-10-9 8-2 4-13-15 8",
    bourbon:
      "M20 8v-5M20 37v-5M8 20H3M37 20h-5M11 11L7 7M33 33l-4-4M29 11l4-4M7 33l4-4",
  };
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${paths[h.id]}" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>${h.id === "bourbon" ? '<circle cx="20" cy="20" r="9" fill="none" stroke="currentColor" stroke-width="2"/>' : ""}</svg>`;
}
export function abilityFor(r: Royal, owner?: Court) {
  const role = card(r.card).role,
    controller = owner?.house ?? card(r.card).house;
  return rulesText(cardRules(role, controller));
}
export interface CardFaceModel {
  id: string;
  house: string;
  name: string;
  role: string;
  ability: string;
  rules: CardRule[];
  portrait: string;
  cost: number;
  printedCost: number;
  attack: number;
  health: number;
  damaged: boolean;
  damage: number;
  counterTurned: boolean;
  face: "board" | "full";
}
export function cardFaceModel(
  r: Royal,
  owner?: Court,
  board = false,
): CardFaceModel {
  const c = card(r.card),
    s = spec(r);
  return {
    id: c.id,
    house: c.house,
    name: c.name,
    role: s.title,
    ability: abilityFor(r, owner),
    rules: cardRules(c.role, owner?.house ?? c.house),
    portrait: portrait(r.card),
    cost: owner ? cost(owner, r, !!r.marriedTo) : s.cost,
    printedCost: s.cost,
    attack: s.force,
    health: r.hp,
    damaged: r.hp < s.resolve,
    damage: Math.max(0, s.resolve - r.hp),
    counterTurned: board && !r.ready,
    face: board ? "board" : "full",
  };
}
export function cardFace(
  r: Royal,
  opts: {
    owner?: Court;
    zone?: string;
    selected?: boolean;
    target?: boolean;
    inspect?: boolean;
  } = {},
) {
  const c = card(r.card),
    h = house(c.house),
    s = spec(r),
    ability = abilityFor(r, opts.owner),
    dormant = opts.owner && opts.zone === "court" && !active(opts.owner, r);
  const model = cardFaceModel(r, opts.owner, opts.zone === "court");
  return `<button class="royal-card house-${h.id} role-${c.role.toLowerCase()} ${opts.zone ?? ""} ${opts.selected ? "selected" : ""} ${opts.target ? "targetable" : ""} ${dormant ? "foreign" : ""} ${opts.zone === "court" && !r.ready ? "exhausted" : ""}" data-royal="${r.uid}" data-card-id="${r.card}" data-face="${model.face}" style="--house:${h.color};--role:${s.color}" title="${opts.owner ? `Current cost: ${model.cost} gold (printed ${model.printedCost})` : `Printed cost: ${model.printedCost} gold`}" aria-pressed="${!!opts.selected}" aria-label="${esc(c.name)}, ${h.name}, ${s.title}, ${model.cost} gold, ${s.force} attack, ${r.hp} remaining health${model.damaged ? ", damaged" : ""}. ${esc(ability)}"><canvas class="card-texture" width="1260" height="1760" data-paint="${esc(JSON.stringify(model))}" aria-hidden="true"></canvas></button>`;
}
export const roleName = (role: Role) => ROLES[role].title;
