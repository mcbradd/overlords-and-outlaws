// The exact legal demonstration is frozen in SUIT-AND-RANK-DESIGN.md.
// Guide progression never edits a game; the app submits these ordinary actions.
export interface TeachingStep {
  seat: number;
  type: string;
  card?: string;
  target?: string;
  supporter?: string;
  title: string;
  explanation: string;
  outcome: string;
}
const step = (
  seat: number,
  type: string,
  title: string,
  explanation: string,
  outcome: string,
  detail: Pick<TeachingStep, "card" | "target" | "supporter"> = {},
): TeachingStep => ({ seat, type, title, explanation, outcome, ...detail });
export const TEACHING: TeachingStep[] = [
  step(
    0,
    "recruit",
    "Give your ruler a supporter",
    "Kenneth MacAlpin is your ruler. A supporter is another member of your family on the table. Play Malcolm III from your hand to build toward a succession. Your other card stays hidden for now.",
    "Malcolm III now supports your family on the table. He is no longer available as a card in your hand.",
    { card: "alba-2" },
  ),
  step(
    1,
    "recall",
    "A rival can take your supporter",
    "Your rival uses David I (Alba 3) to Recall Malcolm III. Recall matches Dynasty, not target rank. If you let him go, you receive David I next round in exchange. Defend to keep your supporter in place. Each rival may try each person once per round.",
    "Malcolm III is threatened. You now get one chance to defend him.",
    { card: "alba-3", target: "alba-2" },
  ),
  step(
    0,
    "defend",
    "Keep Malcolm III at your side",
    "Defend with William the Lion (Alba 4). His rank is higher than the rival’s Alba 3. He goes face up to Played: unavailable for the rest of this round, then back to your hand next round.",
    "Your 4 defeats the rival’s 3. Malcolm III stays. Both played cards return to their current owners next round.",
    { card: "alba-4" },
  ),
  step(
    0,
    "pass",
    "Let play move around the table",
    "You have used both hand cards. Pass takes no card. Everyone gets a turn; when everyone passes in succession, the round ends. If someone plays instead, the pass count starts again.",
    "You passed. Your rival still has a card to play.",
  ),
  step(
    1,
    "recruit",
    "Your rival builds a family too",
    "Watch your rival place Richard I, a card of their own Dynasty, beside their ruler. Public cards show what a rival is building. Card backs show how many hidden options remain.",
    "The rival now has a supporter. Their play resets the pass count.",
    { card: "plantagenet-2" },
  ),
  step(
    0,
    "pass",
    "Finish the round together",
    "Pass again. One pass does not end a two-player round: your rival must also pass without playing a card between those passes.",
    "One consecutive pass. The rival has the next opportunity.",
  ),
  step(
    1,
    "pass",
    "Your cards return",
    "The rival passes too. At the next start, Played cards return and each player draws one new card from the visible Dynasty deck. The first player changes each round.",
    "Round 2 begins. You have your Alba 4 back and a new Alba 5.",
  ),
  step(
    1,
    "pass",
    "A pass can preserve a hidden answer",
    "Your rival goes first this round and passes. A passer can act later if you play a card and keep the round open.",
    "Your turn. The Crown is still available.",
  ),
  step(
    0,
    "name-heir",
    "Name your successor",
    "You have a ruler and Malcolm III as supporter. Play Alexander II (Alba 5) as your heir. Kenneth MacAlpin takes the Crown; Alexander II succeeds next round. Keep all three people until that transfer.",
    "The Crown is claimed. Your named heir must take over next round, then remain with Malcolm III for that entire round.",
    { card: "alba-5", supporter: "alba-2" },
  ),
  step(
    1,
    "recall",
    "The heir is now an exposed target",
    "A rival can break your claim by removing the heir or supporter. Watch the rival’s Alba 3 threaten your heir. Compare its rank with your answer, not with the person being taken.",
    "The claim is threatened. Your held Alba 4 can answer.",
    { card: "alba-3", target: "alba-5" },
  ),
  step(
    0,
    "defend",
    "Protect the succession",
    "Use your Alba 4 again: it returned at the round start. Saving this card gave you a higher same-Dynasty answer to the 3.",
    "The heir stays. Your answer is committed until the next round.",
    { card: "alba-4" },
  ),
  step(
    0,
    "pass",
    "Keep your claim intact",
    "Your hand is empty. Pass to give the rival their next opportunity. Your claim needs its people to stay on the table until the round changes.",
    "The rival may still act.",
  ),
  step(
    1,
    "recruit",
    "Observe another public commitment",
    "The rival recruits John. You can see his rank and Dynasty now; cards still in a hand remain concealed.",
    "The rival’s new person is in Court.",
    { card: "plantagenet-3" },
  ),
  step(
    0,
    "pass",
    "Approach the transfer",
    "Pass. When the rival also passes, the next round starts and your named heir takes over. That transfer begins the full round you must survive.",
    "One consecutive pass.",
  ),
  step(
    1,
    "pass",
    "The Crown passes to the heir",
    "The rival passes. Watch the Crown move from Kenneth MacAlpin to Alexander II. Kenneth MacAlpin stays on the table but is no longer required by this claim.",
    "Round 3 begins. Keep your new ruler and Malcolm III through this whole round to win.",
  ),
  step(
    0,
    "pass",
    "Keep an answer in hand",
    "You can win at this round’s end. Pass to keep your Alba 4 for a response. Passing does not prevent you from defending during the rival’s turn.",
    "You kept your hidden answer. The rival can still threaten the Crown.",
  ),
  step(
    1,
    "recall",
    "The new ruler must survive",
    "The rival plays Alba 3 against the new ruler. Losing the ruler would lose the Crown immediately. You get the same one-card defense opportunity.",
    "Answer the attack to keep the Crown.",
    { card: "alba-3", target: "alba-5" },
  ),
  step(
    0,
    "defend",
    "Use the card you saved",
    "Your Alba 4 is higher than the attacking Alba 3. Commit it to Played to keep your new ruler on the table.",
    "The Crown survives this attempt. Your supporter must also remain until the round ends.",
    { card: "alba-4" },
  ),
  step(
    0,
    "pass",
    "Let the last opportunities resolve",
    "Pass and keep your remaining card. The rival must still take their opportunity; the game does not end just because you defended once.",
    "The round is still in progress.",
  ),
  step(
    1,
    "recruit",
    "The rival takes their last play",
    "Watch the rival recruit Henry III, another card of their own Dynasty. This play resets consecutive passes, so both players must pass again.",
    "The rival’s play is complete.",
    { card: "plantagenet-4" },
  ),
  step(
    0,
    "pass",
    "Finish the full reign round",
    "Pass. Your new ruler and Malcolm III are both still on the table. If the rival passes too, you have kept them for the full required round.",
    "One consecutive pass; wait for the rival.",
  ),
  step(
    1,
    "pass",
    "A succession secured",
    "The rival passes. Your new ruler and named supporter have survived the entire round after the transfer.",
    "You win: claimed Crown, completed succession, and protected the new ruler with their supporter for one full round.",
  ),
];

export function isTeachingAction(
  action: {
    type: string;
    seat: number;
    card?: string;
    target?: string;
    supporter?: string;
  },
  cursor: number,
): boolean {
  const expected = TEACHING[cursor];
  return (
    !!expected &&
    ["type", "seat", "card", "target", "supporter"].every(
      (key) =>
        action[key as keyof typeof action] ===
        expected[key as keyof TeachingStep],
    )
  );
}
