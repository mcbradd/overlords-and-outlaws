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
      { name: "Henry II · Plantagenet", ai: true },
      { name: "Henry VII · Tudor", ai: true },
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
    "alba-9",
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
    "painting-alba-2",
    "painting-alba-3",
    "painting-alba-4",
    "painting-alba-5",
    "painting-tudor-1",
    "painting-plantagenet-1",
    "painting-alba-6",
    "painting-tudor-2",
    "painting-plantagenet-2",
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
    "Pass and keep your remaining seals",
    "Pass costs nothing. You keep any seals for defense. If another player acts, you may act on your next turn. If everyone passes in a row, the round ends.",
    { type: "pass", seat },
  );
export const LESSONS: Lesson[] = [
  L(
    "Choose the cards to pass",
    "A Noble is a person card. A Dynasty is the family name on it. First, keep 3 Nobles from one Dynasty. Select Eleanor, Richard and Elizabeth to pass clockwise. This teaching deal follows set choices; you can play freely from the same table whenever you want.",
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
    "You can pass cards you just received. Keep Kenneth, Margaret and David: all three say Alba. This example passes Alexander II and Edward II. In a normal game, other choices may be better; extra Alba cards can help defend Alba later.",
    { type: "setup-lock", seat: 0, cards: ["alba-5", "plantagenet-6"] },
  ),
  L("The Lion passes two", "Locked packets cannot change.", {
    type: "setup-lock",
    seat: 1,
    cards: ["tudor-4", "tudor-1"],
  }),
  L(
    "The Rose passes two",
    "The other players cannot see which cards you kept. Only the person receiving a pass sees those cards.",
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
    "The last cards pass together. Next, each player puts 3 cards of one Dynasty face up on the table.",
    { type: "setup-lock", seat: 2, cards: ["alba-9"] },
  ),
  L(
    "Declare Alba",
    "Select Kenneth, Margaret and David. Their family name, Alba, becomes your Dynasty. Put them face up in front of you: this is your Court. Keep your other cards hidden in your hand.",
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
    "Your Ruler leads your Court. Select Kenneth for this example. Having a Ruler does not win the game: you must claim the Crown, pass it to an heir, then protect the new Ruler for a full round.",
    { type: "ruler", seat: 0, card: "alba-0" },
  ),
  L("The Lion appoints Henry", "Each player has their own Ruler marker.", {
    type: "ruler",
    seat: 1,
    card: "plantagenet-0",
  }),
  L(
    "History opens",
    "Every round, reveal 1 History card per player: 3 cards at this table. Crises threaten everyone; each gives you this round to stop it. Painting pieces are a shared danger: if any painting has all 6 pieces uncovered, everyone loses.",
    { type: "ruler", seat: 2, card: "tudor-0" },
  ),
  L(
    "Trade a family card for a new option",
    "You have 3 seals: tokens that pay for actions or Blocks. Your hand contains only Alba Nobles. Offer Robert II to The Lion. A card from another Dynasty could marry Margaret or help you take a rival’s Noble. Giving up Robert means one fewer Alba card for your own Court or defense.",
    { type: "barter", seat: 0, cards: ["alba-9"], other: 1 },
  ),
  L(
    "The Lion chooses a hidden offer",
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
    "Compare the two offers below. Richard is Plantagenet; Robert is Alba. Richard gives you a foreign spouse for Margaret or a way to Recall a Plantagenet rival. Robert is more useful for defending Alba. This example accepts; playing freely also lets you decline.",
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
    "Choose an Alba card from your hand to lend, and spend 1 seal. Margaret stays in your Court. A lent card sits face up in Loans and cannot be used again until it returns next round. Keeping a seal and an Alba card made this defense possible.",
    { type: "counterclaim", seat: 0, card: "alba-4" },
  ),
  L(
    "First contribution against Border Rising",
    "If Border Rising starts, each player must lose a Court Noble at round start. Two different Nobles can stop it together. The Rose pays 1 seal and turns a Noble sideways for the first Challenge. That Noble cannot Challenge again until next round.",
    { type: "attack", seat: 2, card: "tudor-5", event: "A2" },
  ),
  L(
    "Choose the actual marriage",
    "Select Margaret and Richard. Pay 1 seal and put them together in your Court. Your Bloodline is your own family plus married-in Nobles. Richard now belongs to it, but still says Plantagenet: he cannot fill an Alba-only heir slot. If Margaret leaves, he loses that support.",
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
    "Each player must help once",
    "The Rose lends a Noble of its Dynasty. Mark that player’s help on the Crisis. Keep the mark when the card returns next round.",
    { type: "address", seat: 2, card: "tudor-4", event: "A1" },
  ),
  L(
    "Remove the obstacle to claiming the Crown",
    "The Lion and The Rose have helped. Lend Alexander III and pay 1 seal to finish Contested Recognition now. You will have 2 seals left to Recruit and Claim the Crown this round. Waiting would save a seal, but delay your claim.",
    { type: "address", seat: 0, card: "alba-6", event: "A1" },
  ),
  pass(1),
  pass(2),
  L(
    "Bring in a different family branch",
    "Alba’s Law needs two heirs from different branches. Margaret and David both say Dunkeld. Robert the Bruce says Bruce–Stewart. Select Robert and pay 1 seal to move him into your Court. You will have 1 seal left.",
    { type: "build", seat: 0, card: "alba-7" },
  ),
  pass(1),
  pass(2),
  L(
    "Keep a seal and wait for the next round",
    "Claiming now would spend your last seal. Pass to keep a defense available. Once everyone passes, your seals refill and you can claim with protection.",
    { type: "pass", seat: 0 },
  ),
  pass(2),
  L(
    "Stop the painting before it is complete",
    "Alba now has 5 uncovered painting pieces. A sixth would make everyone lose immediately. Select Malcolm: pay 1 seal and discard him permanently to Cover the first piece until round 5 starts. You cannot wait until all 6 are uncovered; that would be too late.",
    { type: "veil", seat: 0, card: "alba-2", target: "painting-alba-1" },
  ),
  pass(1),
  pass(2),
  L(
    "Claim with a defense in reserve",
    "Kenneth leads your Court. Margaret and Robert provide two family branches as heirs. Claiming costs 1 seal, leaving your last seal for a Block.",
    {
      type: "proclaim",
      seat: 0,
      route: "kindreds",
      heirs: ["alba-1", "alba-7"],
    },
  ),
  L("Henry challenges your claim", "Henry tries to take Kenneth. You saved a seal and still have Alba cards in hand.", { type: "claim", seat: 1, card: "alba-5", target: "alba-0" }),
  L("Use the defense you saved", "Lend an Alba hand card and pay your last seal. Kenneth stays, protecting your claim. Any matching card can Block; the loan returns next round.", { type: "counterclaim", seat: 0, card: "alba-4" }),
  pass(2),
  pass(0),
  pass(1),
  L(
    "Pass the Crown to your heir",
    "Choose Robert as your new Ruler. Kenneth moves permanently to The Past. Protect Robert until this round ends to win. The covered painting piece stays covered until round 5.",
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
export const PREPARED_TUTORIAL_CURSOR = 15;
/** Set the teaching table by playing the published inheritance, never by resetting a live match. */
export function createPreparedTutorial(): GameState {
  let state = createTutorial();
  for (let cursor = 0; cursor < PREPARED_TUTORIAL_CURSOR; cursor++)
    state = applyAction(state, lessonAction(state, cursor)!);
  return state;
}
export const TUTORIAL_CHAPTERS = [
  { start: 15, title: "Your family and first move" },
  { start: 21, title: "Protect your family" },
  { start: 23, title: "Form a marriage" },
  { start: 27, title: "Read the round ending" },
  { start: 30, title: "Stop a shared Crisis" },
  { start: 35, title: "Build your succession" },
  { start: 38, title: "Keep protection in reserve" },
  { start: 40, title: "Delay the painting" },
  { start: 43, title: "Claim and defend" },
  { start: 49, title: "Pass the Crown" },
] as const;
const SHORT_PROMPTS: Record<number, string> = {
  15: "Your three face-up Nobles form your Court; your hand stays private. Three seals pay for actions or defense. Select Robert II in your hand, then offer him to Henry II: a foreign Noble could marry Margaret.",
  17: "Both players must agree before seeing the offers. Agree to inspect, then compare the actual cards before deciding whether to trade.",
  19: "Richard gives you a foreign spouse for Margaret. Robert is useful for Alba’s defense. Accept this exchange to follow the example, or decline and continue freely.",
  22: "Henry is trying to take Margaret. Block by lending an Alba hand card and spending one seal. Your lent card returns next round.",
  24: "Marry Margaret and Richard. Richard joins your Bloodline through Margaret, but remains Plantagenet. Losing Margaret would remove that support.",
  27: "Pass to keep your remaining seals. The round ends only after everyone passes in a row; another action resets that count.",
  32: "Both rivals helped stop Contested Recognition. Lend Alexander III to finish it. Removing this Crisis permits Crown claims; it costs one seal.",
  35: "Alba needs heirs from two family branches. Recruit Robert the Bruce: his branch differs from Margaret’s and David’s. You will have one seal left.",
  38: "Claiming now would spend your last seal. Pass to keep protection. Everyone’s seals refill when this round ends; then you can claim safely.",
  40: "Five Alba pieces are uncovered. A sixth would end the game. Cover one now, spending a seal and permanently discarding Malcolm; the cover lasts until round 5.",
  43: "Claim with Margaret and Robert as heirs. Kenneth remains Ruler until succession. This costs one seal and leaves one seal to protect your claim.",
  45: "Henry threatens Kenneth, your Ruler. Use the defense you saved: any matching Alba hand card can Block. Your Crown claim survives if Kenneth stays.",
  47: "Pass with the claim intact. The round marker shows who still has an opportunity before your heir takes over.",
  49: "Choose Robert as successor. Kenneth moves permanently to The Past. Keep Robert in your Bloodline through this round to win.",
  50: "Pass when ready. The Crown records the remaining hold period; the result follows only after the actual round closes.",
};
export function tutorialProgress(cursor: number) {
  let chapter = 0;
  TUTORIAL_CHAPTERS.forEach((item, index) => { if (item.start <= cursor) chapter = index; });
  const playerSteps = LESSONS.slice(PREPARED_TUTORIAL_CURSOR).filter(item => item.action.seat === 0).length;
  const completed = LESSONS.slice(PREPARED_TUTORIAL_CURSOR, cursor).filter(item => item.action.seat === 0).length;
  return { chapter: chapter + 1, chapters: TUTORIAL_CHAPTERS.length, title: TUTORIAL_CHAPTERS[chapter].title,
    completed, playerSteps, prompt: SHORT_PROMPTS[cursor] ?? "Watch the named source and destination. Rival actions continue automatically; your decisions always wait for you." };
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
