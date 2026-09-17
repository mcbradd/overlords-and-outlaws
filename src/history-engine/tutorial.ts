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
    "Pass does not withdraw. Only consecutive passes from everyone close the round.",
    { type: "pass", seat },
  );
export const LESSONS: Lesson[] = [
  L(
    "An inheritance, shared",
    "Select and lock these three Nobles. Every packet moves clockwise only after all seats lock.",
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
    "You may pass received Nobles. Keep people who can support a coherent Dynasty.",
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
    "Kenneth, Margaret and David establish your Dynasty. Seat and Dynasty are distinct; another player could also declare Alba.",
    { type: "setup-lock", seat: 0, cards: ["alba-0", "alba-1", "alba-3"] },
  ),
  L("The Lion declares", "Declarations reveal together.", {
    type: "setup-lock",
    seat: 1,
    cards: ["plantagenet-0", "plantagenet-3", "plantagenet-4"],
  }),
  L(
    "The Rose declares",
    "Every remaining card becomes an Outlaw in its controller’s private hand.",
    { type: "setup-lock", seat: 2, cards: ["tudor-0", "tudor-5", "tudor-6"] },
  ),
  L(
    "Give Kenneth the Ruler marker",
    "Ruler is a counterfactual game office. The Crown is still vacant.",
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
    "Inspect Edward III. He could provide matching leverage or be bargained. Offer him to The Lion for a useful relative.",
    { type: "barter", seat: 0, cards: ["plantagenet-7"], other: 1 },
  ),
  L(
    "The Lion locks Richard",
    "The recipient chooses a real packet without seeing yours.",
    { type: "barter-packet", seat: 1, cards: ["plantagenet-2"] },
  ),
  L(
    "Authorize private inspection",
    "Both participants must authorize before either packet is shown.",
    { type: "barter-inspect", seat: 0, accept: true },
  ),
  L(
    "The Lion authorizes",
    "Now the two locked packets can be inspected privately.",
    { type: "barter-inspect", seat: 1, accept: true },
  ),
  L(
    "Accept this exchange",
    "Richard is foreign to Alba. A marriage can admit him, or you can keep him concealed as a Claim.",
    { type: "barter-decide", seat: 0, accept: true },
  ),
  L(
    "Two accepts",
    "The packets exchange simultaneously and only the initiator spends a seal.",
    { type: "barter-decide", seat: 1, accept: true },
  ),
  L(
    "A real rival Claim",
    "The Lion commits Alexander II to seize Margaret. Your reserved seal and Alba Outlaw matter.",
    { type: "claim", seat: 1, card: "alba-5", target: "alba-1" },
  ),
  L(
    "Counterclaim",
    "Commit William the Lion and spend one seal. Both proof cards remain in Leverage until next round; Margaret stays.",
    { type: "counterclaim", seat: 0, card: "alba-4" },
  ),
  L(
    "Muster against Border Rising",
    "The Rose rotates one supported Noble to fill the first Attack space. Progress stays on the event.",
    { type: "attack", seat: 2, card: "tudor-5", event: "A2" },
  ),
  L(
    "Choose the actual marriage",
    "Pair Margaret with Richard. Richard keeps his Plantagenet affiliation; Margaret is his only Bloodline support.",
    { type: "marry", seat: 0, card: "alba-1", target: "plantagenet-2" },
  ),
  L(
    "A different person Secures",
    "The Lion contributes John, a different person, to the second space. Border Rising is Averted immediately.",
    { type: "attack", seat: 1, card: "plantagenet-3", event: "A2" },
  ),
  L(
    "The Rose develops openly",
    "A native Outlaw can Build into Court at the cost of its concealment.",
    { type: "build", seat: 2, card: "tudor-3" },
  ),
  pass(0),
  pass(1),
  pass(2),
  L(
    "An unmet warning activates",
    "Contested Recognition activated at all-pass. No one may Proclaim while it is active. Its expiry is the end of this round.",
    { type: "address", seat: 1, card: "plantagenet-5", event: "A1" },
  ),
  L(
    "Shared public obligations",
    "The Rose contributes its native Outlaw. The event register retains proof even after commitments return.",
    { type: "address", seat: 2, card: "tudor-4", event: "A1" },
  ),
  L(
    "Eudoxia can be delayed",
    "Discard Malcolm to Veil Alba’s first fragment. It stays hidden through the next round, then unveils at start of round 4. This person is lost permanently.",
    { type: "veil", seat: 0, card: "alba-2", target: "painting-alba-1" },
  ),
  pass(1),
  pass(2),
  L(
    "Expose a second kindred",
    "Build Robert the Bruce. Alba’s two named heirs must be from different printed branches.",
    { type: "build", seat: 0, card: "alba-7" },
  ),
  pass(1),
  pass(2),
  L(
    "Complete the public condition",
    "Commit Alexander III to finish Contested Recognition. All three seats contributed; the active restriction ends.",
    { type: "address", seat: 0, card: "alba-6", event: "A1" },
  ),
  pass(1),
  pass(2),
  pass(0),
  pass(2),
  L(
    "Proclaim a vulnerable government",
    "Name David and Robert as the two branch candidates. Kenneth still has to survive the notice round.",
    {
      type: "proclaim",
      seat: 0,
      route: "kindreds",
      heirs: ["alba-3", "alba-7"],
    },
  ),
  L(
    "No tutorial immunity",
    "Alexander returned from Leverage last round. The Lion uses that lawful matching connection to contest Kenneth.",
    { type: "claim", seat: 1, card: "alba-5", target: "alba-0" },
  ),
  L(
    "Let this attempt fail",
    "Decline this response to see the consequence. Kenneth enters the rival hand; your Crown is forfeited, not banked.",
    { type: "decline", seat: 0 },
  ),
  // The choice ID is resolved from the engine at runtime; the selected identity is fixed.
  L(
    "Choose an interim Ruler",
    "David can govern because he is a remaining native Overlord. Ordinary succession does not win.",
    { type: "choice", seat: 0, cards: ["alba-3"] },
  ),
  pass(2),
  L(
    "Rebuild through a legal action",
    "Build the returned Alexander III. The previous failure does not reset cards, History or resources.",
    { type: "build", seat: 0, card: "alba-6" },
  ),
  pass(1),
  pass(2),
  L(
    "A new proclamation",
    "With David ruling, nominate Margaret and Robert from different branches. This is a new attempt with a new notice round.",
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
    "The due Veil unveils first. Then choose Robert: David Retires to The Past, and Robert must survive this entire public round.",
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
