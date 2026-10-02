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
  step(seat,type,type==='draft-pick'?'Draft your starting hand':'Declare your Dynasty',seat !== 0 && type === 'draft-pick' ? explanation : `${explanation} ${seat === 0 ? 'For this example, select' : 'The rival selects'} ${BY_ID[card].name}.`,
    'Selection placed. The group moves automatically when all players finish.',{card}));
export const TEACHING: TeachingStep[] = [
  ...pickSteps(0,'draft-pick',['plantagenet-2','plantagenet-3','plantagenet-4'],'Keep Alba, including your Ace. Pass the three low Plantagenet cards: 2, 3 and 4. Tap again to change a pick; then PASS.'),
  ...pickSteps(1,'draft-pick',['alba-2','alba-3','alba-15'],'The rival chooses three cards privately. Both packets move together, face down.'),
  ...pickSteps(0,'draft-pick',['alba-14','alba-8'],'Received cards stay face down until the draft ends and cannot be passed again. For this example, pass Margaret of England and Marjorie Bruce from your original deal; keep your Ace and high defender.'),
  ...pickSteps(1,'draft-pick',['plantagenet-14','plantagenet-6'],'The rival also passes only cards from its original deal. Received cards stay face down.'),
  ...pickSteps(0,'draft-pick',['alba-5'],'Pass one last card from your original deal: Alexander II. The five received cards remain face down and cannot be selected.'),
  ...pickSteps(1,'draft-pick',['plantagenet-5'],'The rival passes its last example card from the original deal. Now reveal your six received cards. All eight cards are private from rivals; both Courts start empty.'),
  step(0,'recruit','Found your Dynasty','Your Court is empty. Recruit Kenneth MacAlpin: your first Noble sets House Alba and becomes Ruler. Keep cards in hand to defend him.','Kenneth rules House Alba.',{card:'alba-0'}),
  step(1,'recruit','A rival takes the table','The rival plays Henry II into an empty Court, founding House Plantagenet.','The rival has a Ruler.',{card:'plantagenet-0'}),
  step(0,'marry-heir','Marry your Ruler','Marry Yolande of Dreux to Kenneth. A spouse must be of the opposite gender. If Kenneth leaves Court, Yolande succeeds him. You need a spouse in play before you can play an Heir.','The marriage is in play. You may claim on a later turn.',{card:'alba-15',supporter:'alba-0'}),
  step(1,'pass','The rival waits','The rival keeps cards in hand.','Your turn.'),
  step(0,'recruit','Keep your succession ready','Recruit Malcolm III as another Noble. Rivals must defeat every other Court Noble before they can challenge your Ruler or named Heir.','Malcolm joins the Court.',{card:'alba-2'}),
  step(1,'recall','Challenge the Court first','The rival challenges Malcolm III with Constantine II, an Alba 9. Your Ruler is protected by the other Court Nobles. The rival must challenge one of them first.','Save your high defender by letting Malcolm III retreat.',{card:'alba-12',target:'alba-2'}),
  step(0,'decline','Retreat with honor','Constantine II has challenged Malcolm III. You could defend with Matilda of Scotland, but save her for your future Heir. Press Retreat: the two Nobles exchange owners and go to Played until next round.','Your ruler and spouse remain in Court. You can still claim the Crown.'),
  step(0,'name-heir','Claim the Crown','Play David I as your heir and claim the Crown. To win, keep BOTH Kenneth MacAlpin and David I in Court through the whole of next round. Keep cards in hand to defend them.', 'The Crown is claimed. Protect your ruler and heir.',{card:'alba-3'}),
  step(1,'recall','The spouse protects the Crown','Yolande of Dreux is the last Noble protecting your Ruler and Heir. The rival challenges her with Marjorie Bruce and must defeat her before challenging either one.','Yolande is challenged; the Ruler and Heir are still protected.',{card:'alba-8',target:'alba-15'}),
  step(0,'decline','The last protector retreats','Let Yolande retreat and save Matilda of Scotland to defend your Heir. With no other Nobles in Court, rivals can now challenge your Ruler or Heir.','The Ruler and Heir are now open to challenges.'),
  step(0,'pass','Your Crown is exposed','Pass while keeping Matilda of Scotland ready. A new Court Noble would protect the Ruler and Heir again.','The rival now has an open path to your Heir.'),
  step(1,'recall','A rival challenges the heir','The rival challenges your heir with Alexander II. With all other Court Nobles defeated, your Heir is exposed. A challenge matches Dynasty. Each person faces at most one attempt per round across all rivals.','Your heir is threatened.',{card:'alba-5',target:'alba-3'}),
  step(0,'defend','Defend with a higher rank','Alexander II has challenged your heir, David I. Defend with Matilda of Scotland: Alba 11 beats Alba 5. Tap Matilda then Defend, or drag her arrow onto the table.','The heir stays in Court.',{card:'alba-13'}),
  step(0,'pass','Keep your remaining cards','Pass to preserve the cards still in your hand. A round ends when every player passes in succession.','The rival can still act.'),
  step(1,'pass','Succession begins','The rival passes too. Played cards return, each player draws one, and the first-player emblem moves.','The full-round hold begins. Keep your ruler and heir through this whole round.'),
  step(1,'recall','Protect your succession','The rival goes first this round and challenges the heir. Losing either ruler or heir would break the claim.','Your returned Alba 11 can defend again.',{card:'alba-5',target:'alba-3'}),
  step(0,'defend','The heir is challenged again','Alexander II has challenged David I again. Your returned Matilda of Scotland can defend. Keep ruler and heir safe until this round ends to win.','The heir survives this attempt.',{card:'alba-13'}),
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
