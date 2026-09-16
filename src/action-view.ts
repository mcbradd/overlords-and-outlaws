import { card, house } from "./content";
import {
  moves,
  spec,
  attackForce,
  cost,
  claimCost,
  dynastyCount,
  active,
  income,
  type Duel,
  type Move,
} from "./duel";

export const COIN = "◉";
export const ACTION_NAMES: Record<Move["type"], string> = {
  deploy: "Play Royal",
  marry: "Arrange marriage",
  attack: "Attack",
  recall: "Return to hand",
  estate: "Build estate",
  fortify: "Fortify crown",
  restore: "Restore stability",
  recruit: "Renew hand",
  claim: "Claim the crown",
  end: "End turn",
};
export function describeAction(g: Duel, a: Move, viewer = g.turn) {
  const p = g.players[viewer];
  const r =
    "uid" in a
      ? [...p.hand, ...p.court].find((r) => r.uid === a.uid)
      : undefined;
  const gold =
    a.type === "deploy" || a.type === "marry"
      ? r
        ? cost(p, r, a.type === "marry")
        : 0
      : a.type === "claim"
        ? claimCost(p)
        : a.type === "estate"
          ? 3
          : ["fortify", "restore"].includes(a.type)
            ? 2
            : a.type === "recruit"
              ? p.house === "valois"
                ? 1
                : 2
              : 0;
  const orders = a.type === "end" ? 0 : 1;
  const allowed =
    g.turn === viewer &&
    moves(g).some((m) => JSON.stringify(m) === JSON.stringify(a));
  let reason = "";
  if (g.over) reason = "This game has ended.";
  else if (g.pending) reason = "Wait for the defender’s response.";
  else if (g.turn !== viewer)
    reason = `${house(g.players[g.turn].house).name} is taking a turn.`;
  else if (g.orders < orders) reason = "No orders left — end your turn.";
  else if (
    a.type === "marry" &&
    !p.court.some(
      (q) =>
        card(q.card).role === "Queen" &&
        active(p, q) &&
        !p.court.some((s) => s.marriedTo === q.uid),
    )
  )
    reason = "You need an unmarried Queen in your family.";
  else if (a.type === "claim" && dynastyCount(p) < 3)
    reason = `You need ${3 - dynastyCount(p)} more family Royal${3 - dynastyCount(p) === 1 ? "" : "s"} in play.`;
  else if (a.type === "claim" && p.claim)
    reason = "Your claim is already being contested.";
  else if (p.gold < gold) reason = `You need ${gold - p.gold} more gold.`;
  else if (a.type === "attack" && r && !r.ready)
    reason = `${card(r.card).name} can attack on your next turn.`;
  else if (a.type === "attack")
    reason = "Attack a Guardian first, or choose a highlighted target.";
  let effect =
    a.type === "end"
      ? g.orders === 0
        ? "Your two orders are spent. Pass to the next House."
        : `Keep your ${p.gold} gold. Unused orders do not carry over.`
      : a.type === "estate"
        ? `Income ${income(p)} → ${income(p) + 2} gold during your Readying phase. Pays from your next turn; rivals can raid it.`
        : a.type === "fortify"
          ? `Crown shields ${p.shield} → ${p.shield + 3}. Shields protect the crown, not Royals.`
          : a.type === "restore"
            ? `Crown stability ${p.stability} → ${p.stability + 3}. At zero, your claim breaks.`
            : a.type === "claim"
              ? `Pay ${gold} gold to the bank. Keep at least three family Royals while ${g.players
                  .filter((q) => q.id !== viewer)
                  .map((q) => house(q.house).name)
                  .join(" and ")} each take a full turn.`
              : a.type === "recruit"
                ? `Discard your ${p.hand.length} concealed cards, then draw five replacements. Give up saved Ambush and marriage options.`
                : a.type === "recall"
                  ? "Return this Noble to your hand at full health. It leaves your court and breaks its marriage."
                  : a.type === "marry"
                    ? `Pair with ${p.court.find((q) => card(q.card).role === "Queen" && active(p, q) && !p.court.some((s) => s.marriedTo === q.uid)) ? card(p.court.find((q) => card(q.card).role === "Queen" && active(p, q) && !p.court.some((s) => s.marriedTo === q.uid))!.card).name : "an unmarried Queen"}. Counts as family while that Queen remains supported in play.`
                    : a.type === "deploy" && r
                      ? `${card(r.card).house === p.house ? "Joins your family." : "Foreign Noble: does not count as family without a marriage."} ${card(r.card).role === "Lawgiver" ? (card(r.card).house === p.house ? "Enters Ready. Protects your entire court while Ready or Spent." : "Enters Ready but does not protect your court without family support.") : p.house === "plantagenet" && card(r.card).role === "Warlord" ? "Enters Ready and can attack immediately." : "Enters Spent. Can defend immediately; becomes Ready during your next Readying phase."}`
                      : "";
  let response = "";
  if (a.type === "attack" && r) {
    const q = g.players.find(
      (q) =>
        q.court.some((t) => t.uid === a.target) ||
        a.target === `crown-${q.id}` ||
        a.target === `estate-${q.id}`,
    );
    const t = q?.court.find((t) => t.uid === a.target);
    if (t)
      effect = `${card(r.card).name}: ${r.hp} → ${Math.max(0, r.hp - spec(t).force)} health. ${card(t.card).name}: ${t.hp} → ${Math.max(0, t.hp - attackForce(p, r))} health before a response.`;
    else if (q)
      effect = a.target?.startsWith("estate")
        ? `Destroy one ${house(q.house).name} estate and take up to 2 gold if damage gets through.`
        : `Deal ${attackForce(p, r)} damage to ${house(q.house).name}’s crown: shields first, then stability.`;
    response =
      q && q.gold >= 2
        ? "Defender may repeatedly pay 2 gold to block 2 damage, or pay 2 gold and discard a Conspirator from hand to deal 3 damage before combat."
        : "Defender cannot afford Brace or Ambush. The public result is certain.";
  }
  return {
    allowed,
    reason: allowed ? "" : reason || "This action is unavailable.",
    gold,
    orders,
    name: ACTION_NAMES[a.type],
    effect,
    response,
  };
}
