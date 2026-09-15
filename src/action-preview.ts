import { card, house } from "./content";
import { describeAction } from "./action-view";
import { active, type Duel, type Move, type Response } from "./duel";

/** Public endpoints only: never expose a concealed hand to explain an action. */
export function actionPreview(g: Duel, move: Move | Response) {
  const actor = typeof move === "string" ? g.pending!.defender : g.turn;
  const p = g.players[actor];
  const name = house(p.house).name;
  if (typeof move === "string") {
    if (move === "accept") return null;
    return {
      actor,
      source: `${move === "ambush" ? "hand" : "gold"}-${actor}`,
      target: move === "ambush" ? g.pending!.attacker : g.pending!.target,
      title: `${name} · ${move === "ambush" ? "Ambush" : "Brace"}`,
      detail:
        move === "ambush"
          ? "Spend 2 gold and a concealed Conspirator to deal 3 damage to the attacker first."
          : "Spend 2 gold to block 2 incoming damage at the marked defender.",
    };
  }
  if (move.type === "end") return null;
  const v = describeAction(g, move, actor);
  const r =
    "uid" in move
      ? [...p.hand, ...p.court].find((r) => r.uid === move.uid)
      : undefined;
  const queen =
    move.type === "marry"
      ? p.court.find(
          (q) =>
            card(q.card).role === "Queen" &&
            active(p, q) &&
            !p.court.some((s) => s.marriedTo === q.uid),
        )
      : undefined;
  const source =
    move.type === "attack" || move.type === "recall"
      ? r!.uid
      : move.type === "deploy" ||
          move.type === "marry" ||
          move.type === "recruit"
        ? `hand-${actor}`
        : `gold-${actor}`;
  const target =
    move.type === "attack"
      ? move.target!
      : move.type === "recall"
        ? `${p.hand.length >= 7 ? "discard" : "hand"}-${actor}`
        : move.type === "marry"
          ? queen!.uid
          : move.type === "deploy"
            ? `court-${actor}`
            : move.type === "estate"
              ? `estate-${actor}`
              : move.type === "recruit"
                ? `discard-${actor}`
                : `crown-${actor}`;
  const targetRoyal = g.players
    .flatMap((p) => p.court)
    .find((r) => r.uid === target);
  const targetOwner = g.players.find(
    (p) => target === `crown-${p.id}` || target === `estate-${p.id}`,
  );
  const targetName = targetRoyal
    ? card(targetRoyal.card).name
    : targetOwner
      ? `${house(targetOwner.house).name} ${target.startsWith("crown") ? "crown" : "estate"}`
      : "";
  return {
    actor,
    source,
    target,
    title: `${name} · ${v.name}${r ? ` · ${card(r.card).name}` : ""}${targetName ? ` → ${targetName}` : ""}`,
    detail: `${v.gold} gold · ${v.orders} order. ${v.effect}${v.response ? ` ${v.response}` : ""}`,
  };
}
