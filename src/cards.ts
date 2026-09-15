import { card, house, type Role } from "./content";
import { ROLES, spec, cost, active, type Royal, type Court } from "./duel";
export const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export const portrait = (id: string) => {
  const special: Record<string, string> = {
    "plantagenet-2": "richard",
    "alba-3": "david",
    "tudor-6": "beaufort",
    "alba-7": "bruce",
    "habsburg-3": "charles",
    "bourbon-9": "conde",
  };
  if (card(id).name.includes("Margaret") && card(id).house === "alba")
    return "/art/v3-margaret.png";
  if (special[id]) return `/art/v2-${special[id]}.webp`;
  const c = card(id);
  if (c.role === "Queen")
    return `/art/${["alba", "valois", "bourbon"].includes(c.house) ? c.house + "-queen" : c.house}.webp`;
  return `/art/${["plantagenet", "tudor", "habsburg"].includes(c.house) ? c.house + "-king" : c.house}.webp`;
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
  if (controller === "plantagenet" && role === "Warlord")
    return "Swift · Can attack on the turn it enters.";
  if (controller === "tudor" && role === "Intriguer")
    return "In your family: destroy an estate, steal 2 gold. In hand: Ambush 3 damage.";
  if (controller === "bourbon" && role === "Founder")
    return "Sun court · From round 2, your crown gains 1 shield at your turn.";
  return spec(r).ability;
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
  return `<button class="royal-card house-${h.id} role-${c.role.toLowerCase()} ${opts.zone ?? ""} ${opts.selected ? "selected" : ""} ${opts.target ? "targetable" : ""} ${dormant ? "foreign" : ""} ${opts.zone === "court" && !r.ready ? "exhausted" : ""}" data-royal="${r.uid}" data-card-id="${r.card}" style="--house:${h.color};--role:${s.color}" aria-pressed="${!!opts.selected}" aria-label="${esc(c.name)}, ${h.name}, ${s.title}, ${opts.owner ? cost(opts.owner, r, !!r.marriedTo) : s.cost} gold, ${s.force} attack, ${r.hp} health. ${esc(ability)}"><div class="card-heading"><span class="coin-gem" title="Gold cost">${s.cost}</span><span class="card-name">${esc(c.name)}</span><span class="herald">${crest(r.card)}</span></div><div class="portrait-window"><img src="${portrait(r.card)}" alt="" draggable="false" loading="lazy"><span class="portrait-ornament"></span></div><div class="role-band"><span>${s.icon}</span><strong>${s.title}</strong><small>${h.name}</small></div><div class="card-ability">${abilityFor(r)}</div><div class="card-foot"><span class="force-stat" title="Attack: damage dealt to the other Royal">⚔ <b>${s.force}</b></span><span class="card-set">${h.name.toUpperCase()}</span><span class="resolve-stat ${r.hp < s.resolve ? "damaged" : ""}" title="Health: at zero this Royal leaves the court">♥ <b>${s.resolve}</b></span></div>${opts.zone === "court" && r.hp < s.resolve ? `<span class="damage-counter" aria-label="${s.resolve - r.hp} damage">−${s.resolve - r.hp}</span>` : ""}</button>`;
}
export const roleName = (role: Role) => ROLES[role].title;
