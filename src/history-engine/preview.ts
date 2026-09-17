import { nameOf, program } from "./content";
import { actionError, lawFor } from "./rules";
import type { Action, GameView } from "./types";
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
    "barter-packet": "Lock offered packet",
    "barter-inspect": a.accept ? "Agree to look" : "Keep offers hidden",
    "barter-decide": a.accept ? "Accept exchange" : "Decline exchange",
    "barter-cancel": "Cancel exchange",
    "setup-lock": "Lock selection",
    repair: "Place in repair packet",
    ruler: "Appoint Ruler",
    choice: "Lock choice",
  };
  const title = labels[a.type] ?? a.type;
  let effect = "";
  let warning = "";
  switch (a.type) {
    case "build":
      effect = `${nameOf(a.card!)} moves from your hand to your Court and becomes public.`;
      break;
    case "withdraw":
      effect = `${nameOf(a.card!)} returns from Court to your hand.`;
      warning =
        "Its marriage and Ruler role end. If your Law needs this Noble, you lose your Crown claim.";
      break;
    case "petition":
      effect =
        "Draw one Noble from the shared Dynasty Deck into your private hand.";
      break;
    case "marry":
      effect = `Pair ${nameOf(a.card!)} with ${nameOf(a.target!)}. Only this foreign spouse joins your Bloodline.`;
      warning =
        "If this Queen leaves, the spouse leaves your Bloodline but stays in Court.";
      break;
    case "claim":
      effect = `Lend ${nameOf(a.card!)} face up until next round. If not Blocked, ${nameOf(a.target!)} moves into your hand.`;
      warning =
        "The rival may spend 1 seal and lend a matching hand Noble to Block. Your seal stays spent; your lent Noble returns next round.";
      break;
    case "counterclaim":
      effect = `Lend ${nameOf(a.card!)} until next round. Your Court Noble stays.${a.target ? ` Turn ${nameOf(a.target)} sideways too.` : ""}`;
      break;
    case "attack":
      effect = `Turn ${nameOf(a.card!)} sideways to add 1 of ${program(a.event!).requiredContributions} contributions to ${nameOf(a.event!)}. Each contribution needs a different Noble.`;
      break;
    case "address":
      effect =
        program(a.event!).condition === "seats-rotate"
          ? `Turn ${nameOf(a.card!)} sideways. Mark your help on ${nameOf(a.event!)}.`
          : `Lend ${nameOf(a.card!)}: put it face up in Loans until next round. Mark your help on ${nameOf(a.event!)}.`;
      break;
    case "veil":
      effect = `Discard ${nameOf(a.card!)} permanently to The Past. Cover ${nameOf(a.target!)} until start of round ${v.round + 2}.`;
      warning =
        "This fragment can never be Covered again. The discarded person cannot return.";
      break;
    case "proclaim": {
      const law = lawFor(v, a.seat, a.route!);
      effect = `${law.heir.zone === "hand" ? "Set the selected heir aside face down" : `Name ${names(a.heirs)} as ${a.heirs!.length > 1 ? "heirs" : "heir"}`}${a.witness ? `, with ${nameOf(a.witness)} as ${law.witness === "marriage" ? "the married Queen" : "Witness"}` : ""}. Change Ruler at the start of round ${v.round + law.successionAfter}. Keep the new Ruler for ${law.reignRounds} full round(s) to win.`;
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
      effect = `Lock ${names(a.cards)}. All packets or declarations resolve together.`;
      break;
    case "choice":
      effect = `Lock ${names(a.cards) || "no selection"}. Simultaneous choices wait for every participant.`;
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
      ? "No seal"
      : a.type === "barter"
        ? "One seal only if both accept"
        : "Spend one action seal",
    effect,
    warning: error ?? warning,
    legal: !error,
  };
}
