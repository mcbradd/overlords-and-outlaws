import { nameOf, program } from "./content";
import { actionError, lawFor } from "./rules";
import type { Action, GameView } from "./types";
export const ACTION_LABELS: Partial<Record<Action["type"], string>> = {
  build: "Recruit", withdraw: "Withdraw", petition: "Draw", marry: "Marry",
  claim: "Recall", counterclaim: "Block", attack: "Challenge", address: "Help",
  veil: "Cover", proclaim: "Claim the Crown", pass: "Pass", barter: "Trade",
};
export const ACTION_PURPOSES: Partial<Record<Action["type"], string>> = {
  build: "Put one of your family’s Nobles into your Court. It can help you claim the Crown, but rivals can now try to take it.",
  withdraw: "Bring a Noble back to your hidden hand. This can protect it from a Recall, but removes its Court role and ends its marriage.",
  petition: "Draw a Noble to gain another option. The card is random; spending this seal leaves less for your other actions or defense.",
  marry: "Bring a foreign Noble into your Bloodline through a Queen. That Noble depends on the marriage for support.",
  claim: "Try to take a rival’s Court Noble into your hand. Lend a hand card of the same Dynasty. Taking a Ruler or required heir can break a Crown claim.",
  attack: "Help prevent a Crisis by turning a ready Court Noble sideways. Follow the number on that Crisis. Other players can share the work.",
  address: "Pay your part of a Crisis’s printed condition. Your seal is spent even if the other players do not help.",
  veil: "Delay a painting before it reaches 6 uncovered pieces. You permanently lose the hand card used as payment; a completed painting is already too late.",
  proclaim: "Start your attempt to win. Compare your family’s Law with Regency: Regency needs fewer Nobles, but takes longer. Keep a seal and a matching hand card if you want to Block a rival.",
  barter: "Exchange hand cards by agreement. Compare what you gain with what you give the rival. You pay 1 seal only if you both accept.",
  pass: "Let the next player act. Keep any seals you have left. To Block later, you need 1 seal and a matching hand card. If everyone passes in a row, this round ends.",
};
export function previewAction(
  v: GameView,
  a: Action,
): {
  title: string;
  cost: string;
  effect: string;
  warning: string;
  legal: boolean;
} {
  const error = actionError(v, a);
  const names = (ids: string[] | undefined) =>
    ids?.map(nameOf).join(" and ") ?? "";
  const labels: Partial<Record<Action["type"], string>> = {
    build: "Recruit",
    withdraw: "Withdraw",
    petition: "Draw",
    marry: "Marry",
    claim: "Recall",
    counterclaim: "Block",
    attack: "Challenge a Crisis",
    address: "Help",
    veil: "Cover",
    proclaim: "Claim the Crown",
    pass: "Pass",
    barter: "Offer Trade",
    decline: "Decline Block",
    "barter-packet": "Confirm the hidden offer",
    "barter-inspect": a.accept ? "Agree to look" : "Keep offers hidden",
    "barter-decide": a.accept ? "Accept exchange" : "Decline exchange",
    "barter-cancel": "Cancel exchange",
    "setup-lock": "Confirm selected cards",
    repair: "Place in repair packet",
    ruler: "Appoint Ruler",
    choice: "Confirm your choice",
  };
  let title = labels[a.type] ?? a.type;
  let effect = "";
  let warning = "";
  switch (a.type) {
    case "build":
      title = `Recruit ${nameOf(a.card!)}`;
      effect = `${nameOf(a.card!)} moves from your hand to your Court and becomes public.`;
      break;
    case "withdraw":
      title = `Withdraw ${nameOf(a.card!)}`;
      effect = `${nameOf(a.card!)} returns from Court to your hand.`;
      warning =
        "Its marriage and Ruler role end. If your Law needs this Noble, you lose your Crown claim.";
      break;
    case "petition":
      effect =
        "Draw one Noble from the shared Dynasty Deck into your private hand.";
      break;
    case "marry":
      title = `Marry ${nameOf(a.card!)} and ${nameOf(a.target!)}`;
      effect = `Pair ${nameOf(a.card!)} with ${nameOf(a.target!)}. Only this foreign spouse joins your Bloodline.`;
      warning =
        "If this Queen leaves, the spouse leaves your Bloodline but stays in Court.";
      break;
    case "claim":
      title = `Recall ${nameOf(a.target!)} using ${nameOf(a.card!)}`;
      effect = `Lend ${nameOf(a.card!)} face up until next round. If not Blocked, ${nameOf(a.target!)} moves into your hand.`;
      warning =
        "The rival may spend 1 seal and lend a matching hand Noble to Block. Your seal stays spent; your lent Noble returns next round.";
      break;
    case "counterclaim":
      title = `Block with ${nameOf(a.card!)}`;
      effect = `Lend ${nameOf(a.card!)} until next round. Your Court Noble stays.${a.target ? ` Turn ${nameOf(a.target)} sideways too.` : ""}`;
      break;
    case "attack":
      title = `Challenge ${nameOf(a.event!)} with ${nameOf(a.card!)}`;
      effect = `Turn ${nameOf(a.card!)} sideways to add 1 of ${program(a.event!).requiredContributions} contributions to ${nameOf(a.event!)}. Each contribution needs a different Noble.`;
      break;
    case "address":
      title = `Help stop ${nameOf(a.event!)} with ${nameOf(a.card!)}`;
      effect =
        program(a.event!).condition === "seats-rotate"
          ? `Turn ${nameOf(a.card!)} sideways. Mark your help on ${nameOf(a.event!)}.`
          : `Lend ${nameOf(a.card!)}: put it face up in Loans until next round. Mark your help on ${nameOf(a.event!)}.`;
      break;
    case "veil":
      title = `Cover a painting using ${nameOf(a.card!)}`;
      effect = `Discard ${nameOf(a.card!)} permanently to The Past. Cover ${nameOf(a.target!)} until start of round ${v.round + 2}.`;
      warning =
        "This fragment can never be Covered again. The discarded person cannot return.";
      break;
    case "proclaim": {
      const law = lawFor(v, a.seat, a.route!);
      title = a.route === "regency" ? "Claim through Regency" : `Claim through ${nameOf(`law-${v.players[a.seat].dynasty}`)}`;
      effect = `${law.heir.zone === "hand" ? "Set the selected heir aside face down" : `Name ${names(a.heirs)} as ${a.heirs!.length > 1 ? "heirs" : "heir"}`}${a.witness ? `, with ${nameOf(a.witness)} as ${law.witness === "marriage" ? "the married Queen" : "Witness"}` : ""}. Your new Ruler takes over when round ${v.round + law.successionAfter} starts. Keep ${law.witness === "native" ? "the new Ruler and Witness" : law.witness === "marriage" ? "the new Ruler and their marriage" : "the new Ruler"} for ${law.reignRounds} full round${law.reignRounds === 1 ? "" : "s"} to win.`;
      warning =
        "The old Ruler goes to The Past. Lose a required person or marriage and this Crown attempt ends.";
      break;
    }
    case "pass":
      effect = `Spend nothing. ${v.passes.length + 1 === v.players.length ? "Everyone has now passed in a row: end the round and start unstopped Crises." : "If someone takes an action, you can act on a later turn."}`;
      break;
    case "barter":
      effect = `Offer ${names(a.cards)} to ${v.players[a.other!].name}. Both players agree to look at the offers, then each decides whether to swap.`;
      warning =
        "Pay 1 seal only if both accept. If either refuses, keep your cards; anything seen stays known.";
      break;
    case "setup-lock":
      effect = v.setup?.step === "declare"
        ? `Put ${names(a.cards)} face up in your Court once everyone has chosen. Their shared family name becomes your Dynasty.`
        : `Choose ${names(a.cards)} to pass clockwise. They stay in your hand until everyone has chosen, then all selected cards pass together.`;
      break;
    case "choice":
      effect = v.choices?.effect === "succession"
        ? `${names(a.cards)} becomes your new Ruler. Your old Ruler goes permanently to The Past.`
        : v.choices?.effect === "interim"
          ? `${names(a.cards)} becomes your Ruler. This is free, but you still need a new Crown claim to win.`
          : `Choose ${names(a.cards) || "no cards"}. The cards move after everyone affected has chosen.`;
      break;
    case "ruler":
      effect = `Mark ${nameOf(a.card!)} as the leader of your Court. The Crown is still free.`;
      break;
    case "decline":
      effect = v.claim ? `${nameOf(v.claim.target)} goes to ${v.players[v.claim.seat].name}’s hand. Its marriage and Ruler role end. Losing a required Noble also ends your Crown claim.` : "Let the Recall take its target. Spend no seal.";
      break;
    case "barter-packet":
      effect = "Set your selected offer aside face down. Neither player sees the other offer until both agree to look.";
      break;
    case "barter-inspect":
      effect = a.accept ? "Agree to reveal the two offers to each other. This does not accept the exchange or spend a seal. You can still refuse after looking." : "Keep your cards. The trade ends without revealing either offer or spending a seal.";
      break;
    case "barter-decide": {
      const trade = v.barter;
      const other = trade && (a.seat === trade.initiator ? trade.recipient : trade.initiator);
      const offered = trade?.inspected && other !== null && other !== undefined ? trade.packets[other] : null;
      effect = a.accept
        ? `Agree to swap ${names(trade?.packets[a.seat] ?? undefined)} for ${offered ? names(offered) : "the other offer"}. The swap waits for both players to accept.`
        : "Refuse the exchange. Both players keep their cards and spend no seal.";
      warning = a.accept ? `${trade?.initiator === a.seat ? "You pay" : `${v.players[trade?.initiator ?? a.seat].name} pays`} 1 seal only if you both accept.` : "Cards already seen remain known to the other player.";
      break;
    }
    case "barter-cancel":
      effect = "Cancel the trade. Both players keep their cards and spend no seal.";
      break;
    default:
      effect = title;
  }
  const free = [
    "pass",
    "decline",
    "barter-packet",
    "barter-inspect",
    "barter-decide",
    "barter-cancel",
    "setup-lock",
    "repair",
    "ruler",
    "choice",
  ].includes(a.type);
  return {
    title,
    cost: free
      ? "Free · no seal spent now"
      : a.type === "barter"
        ? "One seal only if both accept"
        : "Pay 1 seal",
    effect,
    warning: error ?? warning,
    legal: !error,
  };
}
