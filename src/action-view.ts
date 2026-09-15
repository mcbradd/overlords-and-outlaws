import { card, house } from "./content";
import {
  moves,
  spec,
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
  else if (["deploy", "marry"].includes(a.type) && p.court.length >= 5)
    reason = "All five court places are full. Return a Royal first.";
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
  else if (a.type === "estate" && p.estates >= 3)
    reason = "All three estate places are full.";
  else if (a.type === "fortify" && p.shield >= 5)
    reason = "Your crown already has five shields.";
  else if (a.type === "restore" && p.stability >= 12)
    reason = "Your crown is already at full stability.";
  let effect =
    a.type === "end"
      ? g.orders === 0
        ? "Your two orders are spent. Pass to the next House."
        : `Keep your ${p.gold} gold. Unused orders do not carry over.`
      : a.type === "estate"
        ? `Income ${income(p)} → ${income(p) + 2} gold each turn. Pays from your next turn; rivals can raid it.`
        : a.type === "fortify"
          ? `Crown shields ${p.shield} → ${Math.min(5, p.shield + 3)}. Shields protect the crown, not Royals.`
          : a.type === "restore"
            ? `Crown stability ${p.stability} → ${Math.min(12, p.stability + 3)}. At zero, your claim breaks.`
            : a.type === "claim"
              ? `Pay ${gold} gold to the bank. Keep at least three family Royals while ${g.players
                  .filter((q) => q.id !== viewer)
                  .map((q) => house(q.house).name)
                  .join(" and ")} each take a full turn.`
              : a.type === "recruit"
                ? `Discard your ${p.hand.length} concealed cards, then draw five replacements. Give up saved Ambush and marriage options.`
                : a.type === "recall"
                  ? `${p.hand.length >= 7 ? "Your hand is full: this Royal goes to your discard pile" : "Return this Royal to your hand at full health"}. It leaves your family in play and breaks its marriage.`
                  : a.type === "marry"
                    ? `Pair with ${p.court.find((q) => card(q.card).role === "Queen" && active(p, q) && !p.court.some((s) => s.marriedTo === q.uid)) ? card(p.court.find((q) => card(q.card).role === "Queen" && active(p, q) && !p.court.some((s) => s.marriedTo === q.uid))!.card).name : "an unmarried Queen"}. Counts as family while that Queen remains supported in play.`
                    : a.type === "deploy" && r
                      ? `${card(r.card).house === p.house ? "Joins your family." : "Foreign Royal: does not count as family without a marriage."} ${card(r.card).role === "Lawgiver" ? (card(r.card).house === p.house ? "Enters upright and protects your court. Attacking gives up protection." : "Enters upright but does not protect your court without family support.") : p.house === "plantagenet" && card(r.card).role === "Warlord" ? "Can attack immediately." : "Turns upright next turn. Can defend immediately; a Guardian protects other pieces only while upright."}`
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
      effect = `${card(r.card).name}: ${r.hp} → ${Math.max(0, r.hp - spec(t).force)} health. ${card(t.card).name}: ${t.hp} → ${Math.max(0, t.hp - spec(r).force)} health before a response.`;
    else if (q)
      effect = a.target?.startsWith("estate")
        ? `Destroy one ${house(q.house).name} estate and take up to 2 gold if damage gets through.`
        : `Deal ${spec(r).force} damage to ${house(q.house).name}’s crown: shields first, then stability.`;
    response =
      q?.response && q.gold >= 2
        ? "Defender may pay 2 gold to block 2 damage, or 2 gold + a concealed Conspirator to deal 3 damage first."
        : "No paid response is available. The public result is certain.";
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
