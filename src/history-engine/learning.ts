import { nameOf, SOURCE, program, dynastyOf, noble } from "./content";
import {
  legalActions,
  crownProgress,
  nativeIds,
  lawFor,
} from "./rules";
import type { Action, GameView } from "./types";
import { crownContinuity } from "./deadlines";

/** Player-facing explanations consume the same private projection as the UI. */
export function learningGoal(view: GameView): string {
  if (view.phase === "setup")
    return "To win: claim the Crown, pass it to an heir (your chosen next Ruler), then keep that new Ruler for a full round. First, build a Court of 3 Nobles from one family.";
  if (view.crown) {
    const owner = view.players[view.crown.seat];
    return `${owner.name === "You" ? "Your" : `${owner.name}’s`} Crown claim: ${crownProgress(view)}. ${crownContinuity(view)}`;
  }
  return "To win: claim the Crown, keep your Ruler until the heir takes over, then protect the new Ruler for the time on your Law. Any complete uncovered painting makes everyone lose.";
}

export function crownReadiness(view: GameView, seat: number): string {
  const player = view.players[seat];
  if (!player?.dynasty)
    return "Choose 3 Nobles with the same family name to establish your Dynasty first.";
  if (view.result) return `The game has ended. ${view.result.reason}`;
  if (view.crown) {
    const holder = view.players[view.crown.seat];
    return `${view.crown.seat === seat ? "Your Crown claim is underway" : `The Crown is held by ${holder.name}; you cannot start another claim`}. ${crownProgress(view)}. ${crownContinuity(view)}`;
  }
  const route = program(`law-${player.dynasty}`).route!;
  const law = lawFor(view, seat, route);
  const natives = nativeIds(view, seat);
  const candidates = natives.filter((id) => id !== player.ruler);
  const nativeRuler = !!player.ruler && natives.includes(player.ruler);
  const sample = (ids: string[]) => ids.slice(0, 2).map(nameOf).join(" or ");
  const missing: string[] = [];
  if (!nativeRuler) missing.push("Appoint a native Court Ruler.");
  if (natives.length < law.entryNatives)
    missing.push(
      `Need ${law.entryNatives - natives.length} more native Court Noble${law.entryNatives - natives.length === 1 ? "" : "s"}.`,
    );
  let arrangement = "";
  if (law.heir.differentBranches) {
    const branches = new Set(candidates.map((id) => noble(id).printed.branch));
    if (branches.size < law.heir.count)
      missing.push(
        `Need two heirs from different printed branches.${
          candidates.length
            ? ` Current candidates: ${candidates
                .slice(0, 2)
                .map((id) => `${nameOf(id)} (${noble(id).printed.branch})`)
                .join(" and ")}.`
            : ""
        }`,
      );
    else {
      const first = candidates[0];
      const second = candidates.find(
        (id) => noble(id).printed.branch !== noble(first).printed.branch,
      )!;
      arrangement = `Example heirs: ${nameOf(first)} or ${nameOf(second)}.`;
    }
  } else if (law.witness === "native") {
    if (candidates.length < law.heir.count + 1)
      missing.push(
        "Need a native heir and a different native Witness, both other than the Ruler.",
      );
    else
      arrangement = `Example: heir ${nameOf(candidates[0])}; Witness ${nameOf(candidates[1])}.`;
  } else if (law.heir.zone === "hand") {
    if (view.viewer !== seat || !player.hand)
      missing.push(
        "A native hand heir is also required; that private hand is not visible here.",
      );
    else {
      const heirs = player.hand.filter(
        (id) => dynastyOf(id) === player.dynasty,
      );
      if (!heirs.length)
        missing.push(
          "Need a native Noble in hand to set aside as the sealed heir.",
        );
      else
        arrangement = `Choose one hand heir: ${sample(heirs)}. Set that one aside face down.`;
    }
  } else if (law.witness === "marriage") {
    const marriages = view.marriages.filter(
      (pair) =>
        pair.seat === seat &&
        natives.includes(pair.queen) &&
        player.court.includes(pair.spouse) &&
        dynastyOf(pair.spouse) !== player.dynasty,
    );
    const pair = marriages.find((pair) => pair.queen !== player.ruler);
    if (!pair) {
      missing.push(
        "Need a foreign Court heir married to a native Queen other than the Ruler.",
      );
      if (marriages.some((pair) => pair.queen === player.ruler))
        missing.push(
          `${nameOf(player.ruler!)} is Ruler and cannot sponsor this succession.`,
        );
    } else
      arrangement = `Example: heir ${nameOf(pair.spouse)}, married to ${nameOf(pair.queen)}.`;
  }
  const claims = legalActions(view, seat).filter(
    (action) => action.type === "proclaim",
  );
  const primaryNow = claims.some((action) => action.route === route);
  const lines = [
    `${nameOf(`law-${player.dynasty}`)}: ${natives.length}/${law.entryNatives} native Court Nobles; a native Ruler is required.`,
  ];
  const blockers = view.history.filter(
    (event) =>
      event.status === "active" &&
      program(event.id).restrictions.includes("proclaim"),
  );
  if (blockers.length)
    lines.push(
      `${blockers.map((event) => nameOf(event.id)).join(", ")} prevents all Crown claims while active.`,
    );
  if (missing.length) lines.push(...missing);
  else if (primaryNow)
    lines.push("You can claim under this Law now for 1 seal.", arrangement);
  else {
    lines.push(
      "The named arrangement is available in the current position.",
      arrangement,
    );
    if (player.seals < 1)
      lines.push("You have no seal to pay for a claim this round.");
    if (view.phase !== "action" || view.active !== seat || view.viewer !== seat)
      lines.push(
        "You must wait for your own action opportunity; the position may change.",
      );
  }
  lines.push(
    claims.some((action) => action.route === "regency")
      ? "Regency is available now: choose another native Court heir, then protect the successor for 2 full rounds."
      : nativeRuler && candidates.length
        ? "Regency's Court arrangement is present, but it also needs a legal action opportunity and 1 seal; its successor must survive 2 full rounds."
        : "Regency needs a native Ruler and one other native Court heir; its successor must survive 2 full rounds.",
  );
  return lines.filter(Boolean).join(" ");
}

export function requiredTeachingCards(
  view: GameView,
  action: Action,
): string[] {
  if (action.seat !== view.viewer) return [];
  const visible = new Set([
    ...view.players[action.seat].court,
    ...(view.players[action.seat].hand ?? []),
    ...view.fragments.map((fragment) => fragment.id),
  ]);
  return [
    ...new Set([
      ...(action.cards ?? []),
      ...(action.heirs ?? []),
      ...[action.card, action.target, action.witness].filter(
        (id): id is string => !!id,
      ),
    ]),
  ].filter((id) => visible.has(id));
}

export function teachingCardOptions(view: GameView, action: Action): string[] {
  if (action.type === "counterclaim" && action.seat === view.viewer)
    return [
      ...new Set(
        legalActions(view, action.seat)
          .filter((a) => a.type === "counterclaim")
          .map((a) => a.card!),
      ),
    ];
  return requiredTeachingCards(view, action);
}

/** The UI submits the player's selection. It cannot silently substitute cards. */
export function selectedTeachingAction(
  view: GameView,
  action: Action,
  selected: string[],
): Action | null {
  if (action.seat !== view.viewer) return action;
  if (action.type === "counterclaim") {
    if (selected.length !== 1) return null;
    return (
      legalActions(view, action.seat).find(
        (a) => a.type === "counterclaim" && a.card === selected[0],
      ) ?? null
    );
  }
  const required = requiredTeachingCards(view, action);
  if (
    required.length !== selected.length ||
    !required.every((id) => selected.includes(id))
  )
    return null;
  return { ...action, ...(action.cards ? { cards: [...selected] } : {}) };
}

/** Recommendation matching never substitutes the player's legal action. */
export function followsTeachingAction(
  view: GameView,
  expected: Action,
  actual: Action,
): boolean {
  if (expected.type !== actual.type || expected.seat !== actual.seat)
    return false;
  if (expected.type === "counterclaim")
    return legalActions(view, actual.seat).some(
      (action) => action.type === "counterclaim" && action.card === actual.card,
    );
  return Object.entries(expected).every(([key, value]) => {
    if (key === "revision" || key === "choiceId") return true;
    const other = actual[key as keyof Action];
    return Array.isArray(value)
      ? Array.isArray(other) &&
          value.length === other.length &&
          value.every((item) => other.includes(item))
      : value === other;
  });
}

export function teachingCardLocation(view: GameView, id: string): string {
  const player = view.players[view.viewer ?? 0];
  const source = SOURCE[id];
  const place = player.hand?.includes(id)
    ? "in your hand"
    : player.court.includes(id)
      ? "in your Court"
      : "on the table";
  return `${source.printed.dynasty}${source.printed.branch ? ` · ${source.printed.branch}` : ""} · ${place}`;
}

export function describeOutcome(
  before: GameView,
  after: GameView,
  action: Action,
): string[] {
  const result: string[] = [];
  const own = after.viewer === null ? null : after.players[after.viewer];
  const old = before.viewer === null ? null : before.players[before.viewer];
  if (own && old && own.seals !== old.seals)
    result.push(
      `Your seals: ${old.seals} → ${own.seals}.${after.round > before.round ? " Everyone starts the new round with 3 seals." : " Keep a seal for Block if you need to defend."}`,
    );
  if (after.round > before.round)
    result.push(
      `Round ${after.round} starts. Lent Nobles return to their hands and sideways Nobles turn upright. History reveals ${after.players.length} cards after any Ruler change and active Crisis effects.`,
    );
  const last = before.events.at(-1)?.seq ?? 0;
  for (const event of after.events.filter((event) => event.seq > last)) {
    if (["PolicyBudgetExceeded", "RoundOpened"].includes(event.type)) continue;
    if (event.type === "PacketReceived" || event.type === "PrivateDraw") {
      // Named arrivals are printed only if they are in this viewer's hand.
      const arrivals = event.cards.filter((id) => own?.hand?.includes(id));
      result.push(
        arrivals.length
          ? `Added to your hand: ${arrivals.map(nameOf).join(", ")}.`
          : event.text,
      );
    } else result.push(event.text);
  }
  if (result.length === 0) {
    if (action.type === "barter-packet")
      result.push(
        "The offer is now set aside face down. Both players must agree before seeing it.",
      );
    else if (action.type === "barter-inspect")
      result.push(
        after.barter?.inspected
          ? "Both players agreed. You can now see and inspect both offers below; the trade is not accepted yet."
          : "Your agreement to look is recorded. The other player must also agree before either offer is shown.",
      );
    else if (action.type === "barter-decide")
      result.push(
        "Your decision is recorded. The trade waits for the other player’s decision. No cards have moved yet.",
      );
    else
      result.push(
        "Your choice is recorded. Other affected players must choose before the cards move.",
      );
  }
  return [...new Set(result)];
}
