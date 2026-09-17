/** Shared player-aid definitions. These explain the base rules; card effects
 * remain the compiled instructions printed on each full card face. */
export interface RuleTerm {
  term: string;
  explanation: string;
  matches?: string[];
}

export const SHARED_TERMS: RuleTerm[] = [
  {
    term: "Dynasty",
    explanation:
      "The family printed on a Noble. Your Dynasty is the family you chose at setup. A foreign Noble belongs to a different Dynasty.",
    matches: ["foreign"],
  },
  {
    term: "Court",
    explanation:
      "Your face-up Nobles on the table. A Noble in your hand is hidden from other players.",
    matches: ["hand"],
  },
  {
    term: "Bloodline",
    explanation:
      "Your Court Nobles of your Dynasty, plus foreign Nobles married to Queens of your Dynasty. A foreign spouse supports nobody else.",
  },
  {
    term: "Ruler",
    explanation:
      "The Noble marked as the leader of your Court. Your Law names the heir who can become your next Ruler.",
    matches: ["heir"],
  },
  {
    term: "Queen",
    explanation:
      "A printed marriage role. A Queen of your Dynasty can marry one foreign Noble you control. Each Noble can have only one spouse.",
    matches: ["marriage", "marry"],
  },
  {
    term: "Founder",
    explanation: "A historical label. It gives no extra power.",
  },
  {
    term: "Seal",
    explanation:
      "An action token. Pay 1 for each action or Block. You start each round with 3. Pass is free; Trade costs 1 only when both players accept.",
    matches: ["actions"],
  },
  {
    term: "Ready",
    explanation:
      "Upright, not turned sideways. Turn all your sideways Nobles upright at the next round's start.",
    matches: ["turn sideways", "turns sideways"],
  },
  {
    term: "The Past",
    explanation:
      "The public pile for cards removed from the game. They never return. Retire and discard both move a card here.",
    matches: ["retire", "discard"],
  },
  {
    term: "Crisis",
    explanation:
      "A shared History card. Players can prevent it before it starts. Follow its printed active rule and ending condition.",
  },
  {
    term: "Round",
    explanation:
      "Players take turns clockwise, choosing one action or Pass. The round ends when everyone passes in a row. An action breaks that row of passes.",
  },
  {
    term: "Next round",
    explanation:
      "The round after this one. At its start, lent Nobles return to their hands and players get 3 seals. Follow scheduled Ruler changes before recurring crises.",
  },
  {
    term: "Eudoxia",
    explanation:
      "The shared opponent represented by the paintings. If all 6 pieces of any one painting are present and uncovered, every player loses.",
    matches: ["painting"],
  },
];

export const ACTION_REFERENCE: RuleTerm[] = [
  {
    term: "Recruit",
    explanation:
      "Pay 1 seal. Move a Noble of your Dynasty from your hand into your Court, face up.",
  },
  {
    term: "Recall",
    explanation:
      "Pay 1 seal and Lend a hand Noble. Choose a rival's Court Noble of the same printed Dynasty. Unless the rival Blocks, move that Noble to your hand. A Noble can face only one Recall each round.",
  },
  {
    term: "Block",
    explanation:
      "When a rival Recalls your Noble, pay 1 seal and Lend a hand Noble of that same Dynasty. Your Court Noble stays. A crisis may add a cost.",
  },
  {
    term: "Trade",
    explanation:
      "Offer 1 or 2 hand Nobles to a rival for 1 or 2 of theirs. Both must agree before seeing the offer and again before swapping. Only the person who started an accepted Trade pays 1 seal.",
  },
  {
    term: "Lend",
    explanation:
      "Place a hand Noble face up beside your Court. It cannot be used again now. Return it to your hand at the next round's start.",
  },
  {
    term: "Cover",
    explanation:
      "Pay 1 seal and discard 1 hand Noble to The Past. Cover a painting piece until the start of the round after next. Each piece can be covered only once; you may have only 1 cover at a time.",
  },
  {
    term: "Withdraw",
    explanation:
      "Pay 1 seal. Return 1 of your Court Nobles to your hand. Its marriage and Ruler role end; losing a required Noble can break your Crown claim.",
  },
  {
    term: "Challenge",
    explanation:
      "Pay 1 seal and turn 1 ready Bloodline Noble sideways. Mark that Noble on the crisis. Use the number printed on the crisis, with a different Noble for each contribution. One player may contribute over several actions.",
  },
  {
    term: "Help",
    explanation:
      "Pay 1 seal and follow one contribution on the crisis. Your payment stays spent even if other players do not help.",
  },
  {
    term: "Draw",
    explanation:
      "Pay 1 seal. Draw the top Noble from the shared deck into your hand.",
  },
  {
    term: "Marry",
    explanation:
      "Pay 1 seal. Pair an unmarried Queen of your Dynasty in your Court with an unmarried foreign Noble in your hand or Court. Put both in your Court. If either leaves, the marriage ends.",
  },
  {
    term: "Claim the Crown",
    explanation:
      "Pay 1 seal when the Crown is free. Follow your Dynasty's Law to choose an heir and keep the required Nobles. The Law says when your next Ruler takes over and when you win.",
    matches: ["win", "fail", "next ruler"],
  },
  {
    term: "Pass",
    explanation:
      "Spend nothing and let the next player act. You can act on a later turn if someone takes an action before everyone passes.",
  },
];

const esc = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export function glossaryHTML(cardText?: string): string {
  const text = cardText?.toLowerCase();
  const relevant = (entry: RuleTerm) =>
    !text ||
    [entry.term, ...(entry.matches ?? [])].some((term) =>
      text.includes(term.toLowerCase()),
    );
  return `<dl class="h-glossary">${[...SHARED_TERMS, ...ACTION_REFERENCE]
    .filter(relevant)
    .map(
      ({ term, explanation }) =>
        `<div><dt>${esc(term)}</dt><dd>${esc(explanation)}</dd></div>`,
    )
    .join("")}</dl>`;
}
