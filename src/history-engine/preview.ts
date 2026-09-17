import { nameOf } from "./content";
import { actionError } from "./rules";
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
    build: "Build",
    withdraw: "Withdraw",
    petition: "Petition",
    marry: "Marry",
    claim: "Press a Claim",
    counterclaim: "Counterclaim",
    attack: "Attack an Interregnum",
    address: "Address",
    veil: "Veil",
    proclaim: "Proclaim",
    pass: "Pass",
    barter: "Offer Barter",
    decline: "Decline Counterclaim",
    "barter-packet": "Lock offered packet",
    "barter-inspect": a.accept ? "Authorize inspection" : "Decline inspection",
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
        "Its marriage and office end. A dependent Crown can be forfeited.";
      break;
    case "petition":
      effect =
        "Draw one Noble from the shared Dynasty Deck into your private hand.";
      break;
    case "marry":
      effect = `Pair ${nameOf(a.card!)} with ${nameOf(a.target!)}. Only this foreign spouse joins your Bloodline.`;
      warning =
        "If the native Queen leaves, the foreign spouse becomes unsupported.";
      break;
    case "claim":
      effect = `Commit ${nameOf(a.card!)} face up until next round. If not Counterclaimed, ${nameOf(a.target!)} moves into your hand.`;
      warning =
        "The target’s controller may spend a seal and matching Outlaw to prevent the transfer. Committed costs remain spent.";
      break;
    case "counterclaim":
      effect = `Commit ${nameOf(a.card!)} until next round and prevent this transfer.${a.target ? ` Rotate ${nameOf(a.target)} too.` : ""}`;
      break;
    case "attack":
      effect = `Rotate ${nameOf(a.card!)} to fill one unfilled Attack space on ${nameOf(a.event!)}. The two contributors must be different people.`;
      break;
    case "address":
      effect = `Use ${nameOf(a.card!)} to record your contribution to ${nameOf(a.event!)}. Proof persists until the event leaves play.`;
      break;
    case "veil":
      effect = `Discard ${nameOf(a.card!)} permanently to The Past. Veil ${nameOf(a.target!)} until start of round ${v.round + 2}.`;
      warning =
        "This fragment can never be Veiled again. The discarded person cannot return.";
      break;
    case "proclaim":
      effect = `${a.route === "act" ? "Seal the selected native Outlaw privately" : `Name ${names(a.heirs)} as ${a.heirs?.length === 2 ? "candidates" : "heir"}`}${a.witness ? `, with ${nameOf(a.witness)} as ${a.route === "marriage" ? "sponsor" : "Witness"}` : ""}. Transfer at start of round ${v.round + 1}, then survive ${a.route === "regency" ? "two full rounds" : "one full round"}.`;
      warning =
        "The old Ruler must Retire to The Past. Failed maintenance forfeits this attempt permanently.";
      break;
    case "pass":
      effect = `Pass without withdrawing. ${v.passes.length + 1 === v.players.length ? "This ends the round immediately and activates unmet Interregna." : "An intervening committed action lets you act again."}`;
      break;
    case "barter":
      effect = `Lock ${names(a.cards)} for a private offer to ${v.players[a.other!].name}. Both parties must authorize inspection, then independently accept.`;
      warning =
        "Only an accepted exchange spends your seal. Revealed information cannot be unlearned after refusal.";
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
