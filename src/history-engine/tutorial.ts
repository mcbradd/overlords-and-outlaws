import { createGame, applyAction, assertInvariants } from "./engine";
import { NOBLES } from "./content";
import type { Action, GameState } from "./types";
export type TeachingAction = Omit<Action, "revision">;
export interface Lesson {
  title: string;
  explanation: string;
  action: TeachingAction;
}
/** Published, fixed physical teaching deal. No runtime edits after this deal. */
export function createTutorial(): GameState {
  const s = createGame({
    modules: ["alba", "plantagenet", "tudor"],
    players: [
      { name: "You", ai: false },
      { name: "The Lion", ai: true },
      { name: "The Rose", ai: true },
    ],
    seed: 160926,
  });
  s.first = 0;
  s.active = 0;
  s.players[0].hand = [
    "alba-0",
    "alba-1",
    "alba-3",
    "plantagenet-1",
    "plantagenet-2",
    "alba-7",
    "tudor-1",
    "tudor-2",
  ];
  s.players[1].hand = [
    "plantagenet-0",
    "plantagenet-3",
    "plantagenet-4",
    "alba-2",
    "alba-4",
    "tudor-3",
    "tudor-4",
    "plantagenet-5",
  ];
  s.players[2].hand = [
    "tudor-0",
    "tudor-5",
    "tudor-6",
    "alba-5",
    "alba-6",
    "plantagenet-6",
    "plantagenet-7",
    "tudor-7",
  ];
  const dealt = s.players.flatMap((p) => p.hand);
  s.dynastyDeck = NOBLES.filter(
    (c) => s.modules.includes(c.printed.dynasty) && !dealt.includes(c.id),
  ).map((c) => c.id);
  const first = [
    "A1",
    "A2",
    "painting-alba-1",
    "painting-tudor-1",
    "painting-plantagenet-1",
    "painting-alba-2",
    "painting-tudor-2",
    "painting-plantagenet-2",
    "painting-alba-3",
    "painting-tudor-3",
    "painting-plantagenet-3",
    "painting-alba-4",
  ];
  s.historyDeck = [
    ...first,
    ...s.historyDeck.filter((id) => !first.includes(id)),
  ];
  assertInvariants(s);
  return s;
}
const L = (
  title: string,
  explanation: string,
  action: TeachingAction,
): Lesson => ({ title, explanation, action });
const pass = (seat: number) =>
  L(
    "The round belongs to everyone",
    "Pass costs nothing. You can act later if someone acts. The round ends when everyone passes in a row.",
    { type: "pass", seat },
  );
export const LESSONS: Lesson[] = [
  L(
    "An inheritance, shared",
    "Choose these 3 Nobles to pass left. Everyone chooses first, then all pass their cards together.",
    {
      type: "setup-lock",
      seat: 0,
      cards: ["plantagenet-1", "plantagenet-2", "tudor-1"],
    },
  ),
  L("The Lion locks three", "Opponents follow the same passing procedure.", {
    type: "setup-lock",
    seat: 1,
    cards: ["alba-2", "alba-4", "tudor-3"],
  }),
  L(
    "The Rose locks three",
    "The simultaneous pass gives everyone eight cards again.",
    {
      type: "setup-lock",
      seat: 2,
      cards: ["alba-5", "alba-6", "plantagenet-6"],
    },
  ),
  L(
    "Pass two",
    "You can pass cards you just received. Try to keep 3 Nobles with the same Dynasty name.",
    { type: "setup-lock", seat: 0, cards: ["alba-5", "plantagenet-6"] },
  ),
  L("The Lion passes two", "Locked packets cannot change.", {
    type: "setup-lock",
    seat: 1,
    cards: ["tudor-4", "tudor-1"],
  }),
  L(
    "The Rose passes two",
    "Cards remain private until an authorized inspection or declaration.",
    { type: "setup-lock", seat: 2, cards: ["alba-2", "alba-4"] },
  ),
  L("The last pass", "Lock one final Noble.", {
    type: "setup-lock",
    seat: 0,
    cards: ["tudor-2"],
  }),
  L("The Lion passes one", "This is the final inheritance exchange.", {
    type: "setup-lock",
    seat: 1,
    cards: ["plantagenet-1"],
  }),
  L(
    "The Rose passes one",
    "Each seat now declares three of the same printed Dynasty.",
    { type: "setup-lock", seat: 2, cards: ["plantagenet-7"] },
  ),
  L(
    "Declare Alba",
    "Kenneth, Margaret and David make Alba your Dynasty. Another player may also choose Alba; each keeps their own Court.",
    { type: "setup-lock", seat: 0, cards: ["alba-0", "alba-1", "alba-3"] },
  ),
  L("The Lion declares", "Declarations reveal together.", {
    type: "setup-lock",
    seat: 1,
    cards: ["plantagenet-0", "plantagenet-3", "plantagenet-4"],
  }),
  L("The Rose declares", "Keep your remaining cards hidden in your hand.", {
    type: "setup-lock",
    seat: 2,
    cards: ["tudor-0", "tudor-5", "tudor-6"],
  }),
  L(
    "Give Kenneth the Ruler marker",
    "Choose who leads your Court. This is a game role, not a claim about history. No one holds the Crown yet.",
    { type: "ruler", seat: 0, card: "alba-0" },
  ),
  L("The Lion appoints Henry", "Each player has their own Ruler marker.", {
    type: "ruler",
    seat: 1,
    card: "plantagenet-0",
  }),
  L(
    "History opens",
    "The first public History draw happens now, after Inheritance.",
    { type: "ruler", seat: 2, card: "tudor-0" },
  ),
  L(
    "A concealed person has uses",
    "Read Edward III. You can Trade him, or Lend him to Recall a rival’s Plantagenet Noble. Here, offer him to The Lion.",
    { type: "barter", seat: 0, cards: ["plantagenet-7"], other: 1 },
  ),
  L(
    "The Lion locks Richard",
    "The Lion chooses which card to offer without seeing yours.",
    { type: "barter-packet", seat: 1, cards: ["plantagenet-2"] },
  ),
  L(
    "Agree to look at the offers",
    "Both players must agree before either sees the other’s cards.",
    { type: "barter-inspect", seat: 0, accept: true },
  ),
  L(
    "The Lion agrees to look",
    "Now both players can look. Each still gets to decide whether to Trade.",
    { type: "barter-inspect", seat: 1, accept: true },
  ),
  L(
    "Accept this exchange",
    "Richard belongs to Plantagenet. Marry him to your Queen to bring him into your Court, or keep him in hand for a Recall.",
    { type: "barter-decide", seat: 0, accept: true },
  ),
  L(
    "Two accepts",
    "Both players accept, so swap the cards. Only you pay 1 seal because you started the Trade.",
    { type: "barter-decide", seat: 1, accept: true },
  ),
  L(
    "A real rival Recall",
    "The Lion lends an Alba Noble to Recall Margaret, who is also Alba. You can Block because you kept 1 seal and an Alba card in hand.",
    { type: "claim", seat: 1, card: "alba-5", target: "alba-1" },
  ),
  L(
    "Block",
    "Spend 1 seal and put William face up in Loans. Margaret stays in your Court. Both lent cards return to their hands next round.",
    { type: "counterclaim", seat: 0, card: "alba-4" },
  ),
  L(
    "First contribution against Border Rising",
    "The Rose spends 1 seal and turns a ready Bloodline Noble sideways. Mark the first contribution on Border Rising.",
    { type: "attack", seat: 2, card: "tudor-5", event: "A2" },
  ),
  L(
    "Choose the actual marriage",
    "Pair Margaret with Richard in your Court. Richard is still Plantagenet, but joins your Bloodline while their marriage lasts.",
    { type: "marry", seat: 0, card: "alba-1", target: "plantagenet-2" },
  ),
  L(
    "A different Noble finishes the Challenge",
    "The Lion turns John sideways for the second contribution. Border Rising is stopped: move it to The Past.",
    { type: "attack", seat: 1, card: "plantagenet-3", event: "A2" },
  ),
  L(
    "The Rose develops openly",
    "Spend 1 seal to Recruit a hand Noble of your Dynasty into your Court. Everyone can now see that card.",
    { type: "build", seat: 2, card: "tudor-3" },
  ),
  pass(0),
  pass(1),
  pass(2),
  L(
    "An unmet warning activates",
    "Everyone passed before this Crisis was stopped. It now blocks Crown claims. Lend a Noble of your Dynasty to help stop it early.",
    { type: "address", seat: 1, card: "plantagenet-5", event: "A1" },
  ),
  L(
    "Shared public obligations",
    "The Rose lends a Noble of its Dynasty. Mark that player’s help on the Crisis. Keep the mark when the card returns next round.",
    { type: "address", seat: 2, card: "tudor-4", event: "A1" },
  ),
  L(
    "Eudoxia can be delayed",
    "Put Malcolm in The Past to Cover Alba’s first painting piece. Uncover it at the start of round 4. Malcolm never returns.",
    { type: "veil", seat: 0, card: "alba-2", target: "painting-alba-1" },
  ),
  pass(1),
  pass(2),
  L(
    "Expose a second kindred",
    "Recruit Robert the Bruce. Alba’s two named heirs must be from different printed branches.",
    { type: "build", seat: 0, card: "alba-7" },
  ),
  pass(1),
  pass(2),
  L(
    "Complete the public condition",
    "Lend Alexander III to finish Contested Recognition. All three seats contributed; the active restriction ends.",
    { type: "address", seat: 0, card: "alba-6", event: "A1" },
  ),
  pass(1),
  pass(2),
  pass(0),
  pass(2),
  L(
    "Claim the Crown",
    "Name David and Robert as heirs from two different branches. Keep Kenneth as Ruler and at least one heir until next round starts.",
    {
      type: "proclaim",
      seat: 0,
      route: "kindreds",
      heirs: ["alba-3", "alba-7"],
    },
  ),
  L(
    "Rivals can break your Crown claim",
    "Alexander returned from Loans last round. The Lion uses that lawful matching connection to contest Kenneth.",
    { type: "claim", seat: 1, card: "alba-5", target: "alba-0" },
  ),
  L(
    "Let this attempt fail",
    "Choose not to Block. Kenneth moves to The Lion’s hand. You lose your Crown claim because your old Ruler left.",
    { type: "decline", seat: 0 },
  ),
  // The choice ID is resolved from the engine at runtime; the selected identity is fixed.
  L(
    "Choose an interim Ruler",
    "Choose a Court Noble of your Dynasty as Ruler. This replaces a missing leader; it does not win the Crown.",
    { type: "choice", seat: 0, cards: ["alba-3"] },
  ),
  pass(2),
  L(
    "Rebuild through a legal action",
    "Recruit Alexander III from your hand to rebuild your Court. Spend 1 seal.",
    { type: "build", seat: 0, card: "alba-6" },
  ),
  pass(1),
  pass(2),
  L(
    "Try for the Crown again",
    "With David ruling, choose Margaret and Robert as heirs from different branches. Start a new Crown claim.",
    {
      type: "proclaim",
      seat: 0,
      route: "kindreds",
      heirs: ["alba-1", "alba-7"],
    },
  ),
  pass(1),
  pass(2),
  pass(0),
  L(
    "Government outlives its Ruler",
    "First uncover the painting piece due now. Then choose Robert as Ruler and put David in The Past. Keep Robert in your Bloodline until this round ends to win.",
    { type: "choice", seat: 0, cards: ["alba-7"] },
  ),
  pass(0),
  pass(1),
  pass(2),
];
export function lessonAction(s: GameState, cursor: number): Action | null {
  const lesson = LESSONS[cursor];
  if (!lesson) return null;
  const a = { ...lesson.action, revision: s.revision };
  if (a.type === "choice")
    a.choiceId = s.choices?.requests.find(
      (c) => c.chooser === a.seat && c.selection === null,
    )?.id;
  return a;
}
export function validateTutorial(): GameState {
  let s = createTutorial();
  for (let i = 0; i < LESSONS.length; i++) {
    try {
      s = applyAction(s, lessonAction(s, i)!);
    } catch (error) {
      throw Error(`Lesson ${i + 1} ${LESSONS[i].title}: ${error}`);
    }
  }
  return s;
}
