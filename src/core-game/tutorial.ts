import { BY_ID } from "./content";
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
const pickSteps = (seat: number, type: string, cards: string[], explanation: string) => cards.map(card =>
  step(seat,type,type==='draft-pick'?'Draft your starting hand':'Declare your Dynasty',`${explanation} ${seat === 0 ? 'For this example, select' : 'The rival selects'} ${BY_ID[card].name}.`,
    'Selection placed. The group moves automatically when all players finish.',{card}));
export const TEACHING: TeachingStep[] = [
  ...pickSteps(0,'draft-pick',['plantagenet-6','plantagenet-7','plantagenet-8'],'Pass 3, then 2, then 1 clockwise. Keep three matching Nobles. Select the glowing cards, then PASS. Tap again to change a pick.'),
  ...pickSteps(1,'draft-pick',['alba-3','alba-7','alba-8'],'Your rival is shaping a starting hand too. Once everyone has chosen three cards to pass, each packet moves clockwise. You receive as many cards as you give, so your hand stays at eight.'),
  ...pickSteps(0,'draft-pick',['alba-3','alba-8'],'The second exchange is two cards each. Compare the cards you received with the hand you want to keep. Protect your matching trio; you may pass newly received cards. In this example, pass these two Alba Nobles while keeping your chosen trio.'),
  ...pickSteps(1,'draft-pick',['plantagenet-7','plantagenet-8'],'The rival also chooses two cards to pass. Each exchange is a chance to improve a starting hand; both packets move only when everyone is ready.'),
  ...pickSteps(0,'draft-pick',['plantagenet-8'],'The last exchange is one card each. Keep your matching trio and useful cards for claiming or defending the Crown. Pass this Plantagenet Noble to finish shaping your eight-card starting hand.'),
  ...pickSteps(1,'draft-pick',['alba-8'],'The final cards move together, completing the 3–2–1 draft. Next, each player will reveal three matching Nobles to establish a Dynasty; the other five cards stay private.'),
  ...pickSteps(0,'declare-pick',['alba-0','alba-2','alba-6'],'Choose three matching Alba Nobles. Your first pick will rule. Confirm with Declare after selecting all three. Tap a selected card to change your choice.'),
  ...pickSteps(1,'declare-pick',['plantagenet-0','plantagenet-2','plantagenet-4'],'The rival chooses a matching trio. Both Courts reveal together, leaving five private cards each.'),
  step(0,'pass','Keep an answer in hand','Pass once to see how a challenge works. Keeping a Noble in hand can let you defend your Dynasty’s honor.','The rival has an opportunity.'),
  step(1,'recall','A challenge you cannot answer','The rival challenges Alexander III with Constantine II, an Alba 10. None of your available Alba Nobles has a higher rank.','Alexander III must retreat.',{card:'alba-12',target:'alba-6'}),
  step(0,'decline','Retreat with honor','Constantine II has challenged Alexander III. You have no higher Alba card to defend. Press Retreat: the two Nobles exchange owners and go to Played until next round.','Your ruler and Malcolm III remain in Court. You can still claim the Crown.'),
  step(0,'name-heir','Claim the Crown','Play Alexander II as your heir and claim the Crown. To win, keep BOTH Kenneth MacAlpin and Alexander II in Court through the whole of next round. Keep cards in hand to defend them.', 'The Crown is claimed. Protect your ruler and heir.',{card:'alba-5'}),
  step(1,'recall','A rival challenges the heir','The rival challenges your heir with David I. A challenge matches Dynasty. Each person faces at most one attempt per round across all rivals.','Your heir is threatened.',{card:'alba-3',target:'alba-5'}),
  step(0,'defend','Defend with a higher rank','David I has challenged your heir, Alexander II. Defend with William the Lion: Alba 4 beats Alba 3. Tap William then Defend, or drag an arrow from William onto the table.','The heir stays in Court.',{card:'alba-4'}),
  step(0,'pass','Keep your remaining cards','Pass to preserve the cards still in your hand. A round ends when every player passes in succession.','The rival can still act.'),
  step(1,'pass','Succession begins','The rival passes too. Played cards return, each player draws one, and the first-player emblem moves.','The full-round hold begins. Keep your ruler and heir through this whole round.'),
  step(1,'recall','Protect your succession','The rival goes first this round and challenges the heir. Losing either ruler or heir would break the claim.','Your returned Alba 4 can defend again.',{card:'alba-3',target:'alba-5'}),
  step(0,'defend','The heir is challenged again','David I has challenged Alexander II again. Your returned William the Lion can defend. Keep ruler and heir safe until this round ends to win.','The ruler survives this attempt.',{card:'alba-4'}),
  step(0,'pass','Hold the succession','Pass, keeping your other cards. Your ruler and heir must both remain until this round ends. Then you win.','One consecutive pass.'),
  step(1,'pass','A succession secured','The rival passes. Your ruler and heir survived the entire round. Your succession is secure.','You win: draft, declare, claim, inherit, and hold.'),
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
