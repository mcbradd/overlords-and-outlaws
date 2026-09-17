import { nameOf, SOURCE, program } from "./content";
import { legalActions, crownProgress, crownDependencies, nativeIds, lawFor } from "./rules";
import type { Action, GameView } from "./types";

/** Player-facing explanations consume the same private projection as the UI. */
export function learningGoal(view: GameView): string {
  if (view.phase === "setup")
    return "To win: claim the Crown, pass it to an heir (your chosen next Ruler), then keep that new Ruler for a full round. First, build a Court of 3 Nobles from one family.";
  if (view.crown) {
    const owner = view.players[view.crown.seat];
    const required = [...new Set([...(owner.ruler ? [owner.ruler] : []), ...crownDependencies(view)])];
    return `${owner.name === "You" ? "Your" : `${owner.name}’s`} Crown claim: ${crownProgress(view)}. Required Court Nobles: ${required.map(nameOf).join(", ")}. A rival can break the claim by taking one of them.`;
  }
  return "To win: claim the Crown, keep your Ruler until the heir takes over, then protect the new Ruler for the time on your Law. Any complete uncovered painting makes everyone lose.";
}

export function crownReadiness(view: GameView, seat: number): string {
  const player = view.players[seat];
  if (!player.dynasty) return "Choose 3 Nobles with the same family name to establish your Dynasty first.";
  if (view.crown) return learningGoal(view);
  const obstacle = view.history.find(event => event.status === "active" && program(event.id).restrictions.includes("proclaim"));
  if (obstacle) return `${nameOf(obstacle.id)} prevents Crown claims while active. Its card explains how and when it ends.`;
  const law = lawFor(view, seat, program(`law-${player.dynasty}`).route!);
  const number = nativeIds(view, seat).length;
  return `You have ${number} Court Nobles of your Dynasty. Your Law needs ${law.entryNatives}, including your Ruler, plus the heirs and any other people listed below. Claiming costs 1 seal; you have ${player.seals}. Regency is another path: 2 family Court Nobles, but 2 full rounds under the new Ruler.`;
}

export function requiredTeachingCards(view: GameView, action: Action): string[] {
  if (action.seat !== view.viewer) return [];
  const visible = new Set([
    ...view.players[action.seat].court,
    ...(view.players[action.seat].hand ?? []),
    ...view.fragments.map(fragment => fragment.id),
  ]);
  return [...new Set([
    ...(action.cards ?? []), ...(action.heirs ?? []),
    ...[action.card, action.target, action.witness].filter((id): id is string => !!id),
  ])].filter(id => visible.has(id));
}

export function teachingCardOptions(view: GameView, action: Action): string[] {
  if (action.type === "counterclaim" && action.seat === view.viewer)
    return [...new Set(legalActions(view, action.seat).filter(a => a.type === "counterclaim").map(a => a.card!))];
  return requiredTeachingCards(view, action);
}

/** The UI submits the player's selection. It cannot silently substitute cards. */
export function selectedTeachingAction(view: GameView, action: Action, selected: string[]): Action | null {
  if (action.seat !== view.viewer) return action;
  if (action.type === "counterclaim") {
    if (selected.length !== 1) return null;
    return legalActions(view, action.seat).find(a => a.type === "counterclaim" && a.card === selected[0]) ?? null;
  }
  const required = requiredTeachingCards(view, action);
  if (required.length !== selected.length || !required.every(id => selected.includes(id))) return null;
  return { ...action, ...(action.cards ? { cards: [...selected] } : {}) };
}

export function teachingCardLocation(view: GameView, id: string): string {
  const player = view.players[view.viewer ?? 0];
  const source = SOURCE[id];
  const place = player.hand?.includes(id) ? "in your hand" : player.court.includes(id) ? "in your Court" : "on the table";
  return `${source.printed.dynasty}${source.printed.branch ? ` · ${source.printed.branch}` : ""} · ${place}`;
}

export function describeOutcome(before: GameView, after: GameView, action: Action): string[] {
  const result: string[] = [];
  const own = after.viewer === null ? null : after.players[after.viewer];
  const old = before.viewer === null ? null : before.players[before.viewer];
  if (own && old && own.seals !== old.seals)
    result.push(`Your seals: ${old.seals} → ${own.seals}.${after.round > before.round ? " Everyone starts the new round with 3 seals." : " Keep a seal for Block if you need to defend."}`);
  if (after.round > before.round)
    result.push(`Round ${after.round} starts. Lent Nobles return to their hands and sideways Nobles turn upright. History reveals ${after.players.length} cards after any Ruler change and active Crisis effects.`);
  const last = before.events.at(-1)?.seq ?? 0;
  for (const event of after.events.filter(event => event.seq > last)) {
    if (["PolicyBudgetExceeded", "RoundOpened"].includes(event.type)) continue;
    if (event.type === "PacketReceived" || event.type === "PrivateDraw") {
      // Named arrivals are printed only if they are in this viewer's hand.
      const arrivals = event.cards.filter(id => own?.hand?.includes(id));
      result.push(arrivals.length ? `Added to your hand: ${arrivals.map(nameOf).join(", ")}.` : event.text);
    } else result.push(event.text);
  }
  if (result.length === 0) {
    if (action.type === "barter-packet") result.push("The offer is now set aside face down. Both players must agree before seeing it.");
    else if (action.type === "barter-inspect") result.push(after.barter?.inspected ? "Both players agreed. You can now see and inspect both offers below; the trade is not accepted yet." : "Your agreement to look is recorded. The other player must also agree before either offer is shown.");
    else if (action.type === "barter-decide") result.push("Your decision is recorded. The trade waits for the other player’s decision. No cards have moved yet.");
    else result.push("Your choice is recorded. Other affected players must choose before the cards move.");
  }
  return [...new Set(result)];
}
