import { dynastyOf, noble, program } from "./content";
import type {
  Action,
  GameView,
  HistoryEvent,
  Restriction,
  Seat,
  Dynasty,
  Marriage,
} from "./types";

export function nativeIds(v: GameView, seat: Seat): string[] {
  const p = v.players[seat];
  return p.court.filter((id) => dynastyOf(id) === p.dynasty);
}
export function supported(
  v: {
    players: { court: string[]; dynasty: Dynasty | null }[];
    marriages: Marriage[];
  },
  seat: Seat,
  id: string,
): boolean {
  const p = v.players[seat];
  return (
    p.court.includes(id) &&
    (dynastyOf(id) === p.dynasty ||
      v.marriages.some(
        (m) =>
          m.seat === seat &&
          m.spouse === id &&
          p.court.includes(m.queen) &&
          dynastyOf(m.queen) === p.dynasty &&
          noble(m.queen).printed.queen,
      ))
  );
}
export const restricted = (v: Pick<GameView, "history">, r: Restriction) =>
  v.history.some(
    (e) => e.status === "active" && program(e.id).restrictions.includes(r),
  );
export const readyNatives = (v: GameView, seat: Seat) =>
  nativeIds(v, seat).filter((id) => !v.players[seat].rotated.includes(id));
export const paired = (v: GameView, id: string) =>
  v.marriages.some((m) => m.queen === id || m.spouse === id);
const unique = (ids: string[]) => new Set(ids).size === ids.length;
export function crownDependencies(v: GameView): string[] {
  const c = v.crown;
  if (!c) return [];
  const ids =
    c.stage === "proclaimed"
      ? c.route === "act"
        ? []
        : [...c.heirs, ...(c.witness ? [c.witness] : [])]
      : ["charter", "marriage"].includes(c.route) && c.witness
        ? [c.witness]
        : [];
  return ids.filter(
    (id) => id !== v.players[c.seat].ruler && supported(v, c.seat, id),
  );
}
export function eventComplete(e: HistoryEvent): boolean {
  const c = program(e.id).condition;
  return c === "attack"
    ? e.attacks.length === 2
    : c === "dynasties"
      ? new Set(e.contributions.map((c) => c.dynasty)).size >= 2
      : e.obligated.every((s) => e.fulfilled.includes(s));
}
export function actionError(v: GameView, a: Action): string | null {
  const p = v.players[a.seat];
  const no = "That action is not available in this view.";
  if (!p || v.viewer !== a.seat || a.revision !== v.revision || v.result)
    return no;
  const hand = p.hand ?? [];
  const card = a.card ?? "";
  const target = a.target ?? "";
  const ids = a.cards ?? [];
  if (a.type === "setup-lock") {
    if (
      v.phase !== "setup" ||
      !v.setup ||
      Object.hasOwn(v.setup.locked, a.seat) ||
      !unique(ids) ||
      ids.some((id) => !hand.includes(id))
    )
      return no;
    if (v.setup.step === "pass")
      return ids.length === [3, 2, 1][v.setup.pass]
        ? null
        : "Choose the exact packet size.";
    if (v.setup.step === "declare")
      return ids.length === 3 &&
        ids.every((id) => dynastyOf(id) === dynastyOf(ids[0]))
        ? null
        : "Declare three Nobles of one printed Dynasty.";
    return no;
  }
  if (a.type === "repair")
    return v.phase === "setup" &&
      v.setup?.step === "repair" &&
      v.setup.repairs[0] === a.seat &&
      hand.includes(card) &&
      v.setup.repairDraw &&
      dynastyOf(card) !== dynastyOf(v.setup.repairDraw)
      ? null
      : no;
  if (a.type === "ruler")
    return v.phase === "setup" &&
      v.setup?.step === "ruler" &&
      !p.ruler &&
      p.court.includes(card)
      ? null
      : no;
  if (a.type === "choice") {
    const c = v.choices?.requests.find(
      (c) => c.id === a.choiceId && c.chooser === a.seat,
    );
    return v.phase === "choice" &&
      c &&
      c.selection === null &&
      unique(ids) &&
      ids.length >= c.min &&
      ids.length <= c.max &&
      ids.every((id) => c.allowedIds.includes(id))
      ? null
      : no;
  }
  if (v.phase === "barter") {
    const b = v.barter!;
    if (![b.initiator, b.recipient].includes(a.seat)) return no;
    if (a.type === "barter-cancel") return b.stage !== "decision" ? null : no;
    if (a.type === "barter-packet")
      return b.stage === "packet" &&
        a.seat === b.recipient &&
        ids.length >= 1 &&
        ids.length <= 2 &&
        unique(ids) &&
        ids.every((id) => hand.includes(id))
        ? null
        : no;
    if (a.type === "barter-inspect")
      return b.stage === "inspection" &&
        !Object.hasOwn(b.consent, a.seat) &&
        typeof a.accept === "boolean"
        ? null
        : no;
    if (a.type === "barter-decide")
      return b.stage === "decision" &&
        !Object.hasOwn(b.decisions, a.seat) &&
        typeof a.accept === "boolean"
        ? null
        : no;
    return no;
  }
  if (v.phase === "response") {
    if (v.claim?.defender !== a.seat) return no;
    if (a.type === "decline") return null;
    if (
      a.type !== "counterclaim" ||
      p.seals < 1 ||
      !hand.includes(card) ||
      dynastyOf(card) !== dynastyOf(v.claim.target)
    )
      return no;
    if (
      restricted(v, "counterclaim-rotate") &&
      !readyNatives(v, a.seat).includes(target)
    )
      return "Counterclaim also requires a ready native Overlord.";
    return null;
  }
  if (v.phase !== "action" || v.active !== a.seat) return no;
  if (a.type === "pass") return null;
  if (p.seals < 1)
    return "No action seals remain. Pass still lets you act later if the round continues.";
  switch (a.type) {
    case "build":
      return hand.includes(card) && dynastyOf(card) === p.dynasty
        ? null
        : "Build requires a native Outlaw.";
    case "withdraw":
      return p.court.includes(card) ? null : no;
    case "petition":
      return v.dynastyCount > 0 &&
        (!restricted(v, "petition-with-hand") || hand.length === 0)
        ? null
        : "The Dynasty Deck is empty or Closed Roads prevents Petition.";
    case "marry":
      return !restricted(v, "marry") &&
        p.court.includes(card) &&
        dynastyOf(card) === p.dynasty &&
        noble(card).printed.queen &&
        !paired(v, card) &&
        (hand.includes(target) || p.court.includes(target)) &&
        dynastyOf(target) !== p.dynasty &&
        !paired(v, target)
        ? null
        : "Choose an unmarried native Queen and an unpaired foreign Noble you control.";
    case "claim": {
      const rival = v.players.find(
        (q) => q.seat !== a.seat && q.court.includes(target),
      );
      return rival &&
        hand.includes(card) &&
        dynastyOf(card) === dynastyOf(target) &&
        !v.petitioned.includes(target)
        ? null
        : "A Claim requires matching printed Dynasty and an unpetitioned rival Overlord.";
    }
    case "veil": {
      const f = v.fragments.find((f) => f.id === target);
      return hand.includes(card) &&
        f &&
        !f.onceVeiled &&
        !f.veil &&
        !v.fragments.some((f) => f.veil?.seat === a.seat)
        ? null
        : "Veil needs a never-veiled fragment, one Outlaw and no Veil already in progress.";
    }
    case "attack": {
      const e = v.history.find((e) => e.id === a.event);
      return e &&
        (e.status === "pending"
          ? program(e.id).condition === "attack"
          : program(e.id).end === "attack") &&
        supported(v, a.seat, card) &&
        !p.rotated.includes(card) &&
        !e.attacks.some((c) => c.card === card)
        ? null
        : "Attack requires a ready Bloodline Overlord who has not contributed to this event.";
    }
    case "address": {
      const e = v.history.find((e) => e.id === a.event);
      if (!e || (e.status === "active" && program(e.id).end !== "condition"))
        return no;
      const c = program(e.id).condition;
      if (c === "dynasties")
        return hand.includes(card) &&
          !e.contributions.some((c) => c.dynasty === dynastyOf(card))
          ? null
          : no;
      if (!e.obligated.includes(a.seat) || e.fulfilled.includes(a.seat))
        return no;
      if (c === "seats-rotate")
        return readyNatives(v, a.seat).includes(card) ? null : no;
      if (["seats-native", "seats-any", "married-seats"].includes(c ?? ""))
        return hand.includes(card) &&
          (c !== "seats-native" || dynastyOf(card) === p.dynasty)
          ? null
          : no;
      return no;
    }
    case "proclaim": {
      if (
        v.crown ||
        restricted(v, "proclaim") ||
        !p.ruler ||
        !nativeIds(v, a.seat).includes(p.ruler)
      )
        return "The Crown must be vacant and your Ruler native.";
      const heirs = a.heirs ?? [];
      const route = a.route;
      const ns = nativeIds(v, a.seat);
      const candidates = ns.filter((id) => id !== p.ruler);
      if (!route || !unique(heirs)) return no;
      if (route === "regency")
        return heirs.length === 1 && candidates.includes(heirs[0]) ? null : no;
      if (route !== program(`law-${p.dynasty}`).route || ns.length < 3)
        return "Your Law requires three native Overlords at entry.";
      if (route === "kindreds")
        return heirs.length === 2 &&
          heirs.every((id) => candidates.includes(id)) &&
          noble(heirs[0]).printed.branch !== noble(heirs[1]).printed.branch
          ? null
          : no;
      if (route === "charter")
        return heirs.length === 1 &&
          candidates.includes(heirs[0]) &&
          !!a.witness &&
          candidates.includes(a.witness) &&
          a.witness !== heirs[0]
          ? null
          : no;
      if (route === "act")
        return heirs.length === 1 &&
          hand.includes(heirs[0]) &&
          dynastyOf(heirs[0]) === p.dynasty
          ? null
          : no;
      if (route === "marriage")
        return heirs.length === 1 &&
          v.marriages.some(
            (m) =>
              m.seat === a.seat &&
              m.spouse === heirs[0] &&
              m.queen === a.witness &&
              m.queen !== p.ruler,
          )
          ? null
          : no;
      return no;
    }
    case "barter":
      return typeof a.other === "number" &&
        a.other !== a.seat &&
        !!v.players[a.other] &&
        v.players[a.other].handCount > 0 &&
        ids.length >= 1 &&
        ids.length <= 2 &&
        unique(ids) &&
        ids.every((id) => hand.includes(id))
        ? null
        : no;
    default:
      return no;
  }
}
export function combinations(ids: string[], n: number): string[][] {
  if (n === 0) return [[]];
  return ids.flatMap((id, i) =>
    combinations(ids.slice(i + 1), n - 1).map((rest) => [id, ...rest]),
  );
}
export function legalActions(v: GameView, seat: Seat): Action[] {
  if (v.viewer !== seat || !v.players[seat] || v.result) return [];
  const p = v.players[seat],
    hand = p.hand ?? [],
    actions: Action[] = [];
  const add = (a: Omit<Action, "seat" | "revision">) => {
    const full = { ...a, seat, revision: v.revision };
    if (!actionError(v, full)) actions.push(full);
  };
  if (v.phase === "setup" && v.setup) {
    if (v.setup.step === "pass")
      for (const cards of combinations(hand, [3, 2, 1][v.setup.pass]))
        add({ type: "setup-lock", cards });
    if (v.setup.step === "declare")
      for (const cards of combinations(hand, 3))
        add({ type: "setup-lock", cards });
    if (v.setup.step === "repair")
      for (const card of hand) add({ type: "repair", card });
    if (v.setup.step === "ruler")
      for (const card of p.court) add({ type: "ruler", card });
    return actions;
  }
  if (v.phase === "choice") {
    for (const c of v.choices?.requests ?? [])
      if (c.chooser === seat && c.selection === null) {
        if (c.min === 0) add({ type: "choice", choiceId: c.id, cards: [] });
        for (const card of c.allowedIds)
          add({ type: "choice", choiceId: c.id, cards: [card] });
      }
    return actions;
  }
  if (v.phase === "barter") {
    add({ type: "barter-cancel" });
    for (const cards of [...combinations(hand, 1), ...combinations(hand, 2)])
      add({ type: "barter-packet", cards });
    for (const accept of [true, false]) {
      add({ type: "barter-inspect", accept });
      add({ type: "barter-decide", accept });
    }
    return actions;
  }
  if (v.phase === "response") {
    add({ type: "decline" });
    for (const card of hand) {
      if (restricted(v, "counterclaim-rotate"))
        for (const target of readyNatives(v, seat))
          add({ type: "counterclaim", card, target });
      else add({ type: "counterclaim", card });
    }
    return actions;
  }
  if (v.phase !== "action" || v.active !== seat) return [];
  add({ type: "pass" });
  add({ type: "petition" });
  for (const card of hand) {
    add({ type: "build", card });
    for (const other of v.players) {
      if (other.seat !== seat) {
        for (const target of other.court) add({ type: "claim", card, target });
        add({ type: "barter", other: other.seat, cards: [card] });
      }
    }
    for (const f of v.fragments) add({ type: "veil", card, target: f.id });
  }
  for (const card of p.court) {
    add({ type: "withdraw", card });
    for (const target of [...hand, ...p.court])
      add({ type: "marry", card, target });
  }
  for (const e of v.history) {
    for (const card of [...hand, ...p.court]) {
      add({ type: "address", event: e.id, card });
      add({ type: "attack", event: e.id, card });
    }
  }
  if (p.dynasty) {
    const route = program(`law-${p.dynasty}`).route!;
    const ns = nativeIds(v, seat).filter((id) => id !== p.ruler);
    for (const id of ns)
      add({ type: "proclaim", route: "regency", heirs: [id] });
    if (route === "kindreds")
      for (const heirs of combinations(ns, 2))
        add({ type: "proclaim", route, heirs });
    if (route === "charter")
      for (const id of ns)
        for (const witness of ns)
          add({ type: "proclaim", route, heirs: [id], witness });
    if (route === "act")
      for (const id of hand) add({ type: "proclaim", route, heirs: [id] });
    if (route === "marriage")
      for (const m of v.marriages.filter((m) => m.seat === seat))
        add({ type: "proclaim", route, heirs: [m.spouse], witness: m.queen });
  }
  return actions;
}
