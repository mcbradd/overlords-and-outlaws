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
  step(seat,type,type==='draft-pick'?'Shape your inheritance':'Declare your Dynasty',`Select ${BY_ID[card].name}. ${explanation}`,
    'Selection placed. The group moves automatically when all players finish.',{card}));
export const TEACHING: TeachingStep[] = [
  ...pickSteps(0,'draft-pick',['plantagenet-6','plantagenet-7','plantagenet-8'],'Eight Nobles, no Dynasty yet. Keep a matching trio. Select these three Plantagenet cards to pass clockwise; all packets move together.'),
  ...pickSteps(1,'draft-pick',['alba-3','alba-7','alba-8'],'The rival also selects three cards privately. Neither packet moves until both players finish.'),
  ...pickSteps(0,'draft-pick',['alba-3','alba-8'],'Now pass two. You may pass cards just received. Keep three matching Nobles to establish your Court.'),
  ...pickSteps(1,'draft-pick',['plantagenet-7','plantagenet-8'],'The rival selects two, then both packets move clockwise.'),
  ...pickSteps(0,'draft-pick',['plantagenet-8'],'Pass one card to finish the 3–2–1 draft.'),
  ...pickSteps(1,'draft-pick',['alba-8'],'The final one-card packets move together.'),
  ...pickSteps(0,'declare-pick',['alba-0','alba-2','alba-6'],'Play three Nobles of one Dynasty to establish your Court. Your first choice is your ruler. In this teaching hand, choose Kenneth MacAlpin, then Malcolm III and Alexander III.'),
  ...pickSteps(1,'declare-pick',['plantagenet-0','plantagenet-2','plantagenet-4'],'The rival chooses a matching trio. Both Courts reveal together, leaving five private cards each.'),
  step(0,'name-heir','Claim the Crown','Your three played Alba Nobles established your Dynasty. Play Alexander II as heir, with Malcolm III as supporter. The Crown passes to the heir next round.', 'The Crown is claimed. Keep the ruler, heir and supporter until succession.',{card:'alba-5',supporter:'alba-2'}),
  step(1,'recall','A rival challenges the heir','The rival plays David I to Recall your heir. Recall matches Dynasty. Each person faces at most one attempt per round across all rivals.','Your heir is threatened.',{card:'alba-3',target:'alba-5'}),
  step(0,'defend','Defend with a higher rank','Play William the Lion: Alba 4 beats the attacking Alba 3. Both used cards rest in Played until next round.','The heir stays in Court.',{card:'alba-4'}),
  step(0,'pass','Keep your remaining cards','Pass to preserve the cards still in your hand. A round ends when every player passes in succession.','The rival can still act.'),
  step(1,'pass','Succession begins','The rival passes too. Played cards return, each player draws one, and the first-player emblem moves.','The heir inherits. Keep the heir and supporter through this full round.'),
  step(1,'recall','Protect the new ruler','The rival goes first this round and Recalls the new ruler. Losing the ruler would break the claim.','Your returned Alba 4 can defend again.',{card:'alba-3',target:'alba-5'}),
  step(0,'defend','Use your returned answer','Defend with William the Lion to keep your new ruler in Court.','The ruler survives this attempt.',{card:'alba-4'}),
  step(0,'pass','Hold the succession','Pass, keeping your other cards. The new ruler and supporter must remain until the round ends.','One consecutive pass.'),
  step(1,'pass','A succession secured','The rival passes. Your new ruler and supporter have stayed for the entire round after succession.','You win: draft, declare, claim, inherit, and hold.'),
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
