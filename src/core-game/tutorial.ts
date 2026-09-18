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
  ...pickSteps(0,'draft-pick',['plantagenet-2','plantagenet-3','plantagenet-4'],'Keep Alba, including your Ace. Pass the three low Plantagenet cards: 2, 3 and 4. Tap again to change a pick; then PASS.'),
  ...pickSteps(1,'draft-pick',['alba-2','alba-3','alba-15'],'The rival keeps a Plantagenet core and passes three Alba cards. Both packets move together.'),
  ...pickSteps(0,'draft-pick',['alba-2','alba-3'],'Now pass two. Keep the Ace and your higher Alba defenders. The Alba 2 and 3 you received are your weakest defenders; pass those two.'),
  ...pickSteps(1,'draft-pick',['plantagenet-2','plantagenet-3'],'The rival passes its two lowest Plantagenet cards, keeping stronger cards for its Court and defense.'),
  ...pickSteps(0,'draft-pick',['plantagenet-2'],'Pass one last card. You received Plantagenet 2 and 3. Neither defends House Alba; keep the stronger 3 and pass the 2.'),
  ...pickSteps(1,'draft-pick',['alba-2'],'The rival passes its lower Alba card. The draft is complete. All eight cards remain private; both Courts start empty.'),
  step(0,'recruit','Found your Dynasty','Your Court is empty. Recruit Kenneth MacAlpin: your first Noble sets House Alba and becomes Ruler. Keep cards in hand to defend him.','Kenneth rules House Alba.',{card:'alba-0'}),
  step(1,'recruit','A rival takes the table','The rival plays Henry II into an empty Court, founding House Plantagenet.','The rival has a Ruler.',{card:'plantagenet-0'}),
  step(0,'marry-heir','Marry your Ruler','Marry Marjorie Bruce to Kenneth. A spouse must be of the opposite gender. If Kenneth leaves Court, Marjorie succeeds him. You need a spouse in play before you can play an Heir.','The marriage is in play. You may claim on a later turn.',{card:'alba-8',supporter:'alba-0'}),
  step(1,'pass','The rival waits','The rival keeps cards in hand.','Your turn.'),
  step(0,'recruit','Keep your succession ready','Recruit Malcolm III as another Noble. Recruiting does not make him an Heir; Claim is a separate action.','Malcolm joins the Court.',{card:'alba-2'}),
  step(1,'recall','A challenge you cannot answer','The rival challenges Malcolm III with Constantine II, an Alba 9. None of your available Alba Nobles has a higher rank.','Malcolm III must retreat.',{card:'alba-12',target:'alba-2'}),
  step(0,'decline','Retreat with honor','Constantine II has challenged Malcolm III. You have no higher Alba card to defend. Press Retreat: the two Nobles exchange owners and go to Played until next round.','Your ruler and spouse remain in Court. You can still claim the Crown.'),
  step(0,'name-heir','Claim the Crown','Play Alexander II as your heir and claim the Crown. To win, keep BOTH Kenneth MacAlpin and Alexander II in Court through the whole of next round. Keep cards in hand to defend them.', 'The Crown is claimed. Protect your ruler and heir.',{card:'alba-5'}),
  step(1,'recall','A rival challenges the heir','The rival challenges your heir with David I. A challenge matches Dynasty. Each person faces at most one attempt per round across all rivals.','Your heir is threatened.',{card:'alba-3',target:'alba-5'}),
  step(0,'defend','Defend with a higher rank','David I has challenged your heir, Alexander II. Defend with William the Lion: Alba 4 beats Alba 3. Tap William then Defend, or drag an arrow from William onto the table.','The heir stays in Court.',{card:'alba-4'}),
  step(0,'pass','Keep your remaining cards','Pass to preserve the cards still in your hand. A round ends when every player passes in succession.','The rival can still act.'),
  step(1,'pass','Succession begins','The rival passes too. Played cards return, each player draws one, and the first-player emblem moves.','The full-round hold begins. Keep your ruler and heir through this whole round.'),
  step(1,'recall','Protect your succession','The rival goes first this round and challenges the heir. Losing either ruler or heir would break the claim.','Your returned Alba 4 can defend again.',{card:'alba-3',target:'alba-5'}),
  step(0,'defend','The heir is challenged again','David I has challenged Alexander II again. Your returned William the Lion can defend. Keep ruler and heir safe until this round ends to win.','The ruler survives this attempt.',{card:'alba-4'}),
  step(0,'pass','Hold the succession','Pass, keeping your other cards. Your ruler and heir must both remain until this round ends. Then you win.','One consecutive pass.'),
  step(1,'pass','A succession secured','The rival passes. Your ruler and heir survived the entire round. Your succession is secure.','You win: draft, found your Dynasty, marry, claim, and hold.'),
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
