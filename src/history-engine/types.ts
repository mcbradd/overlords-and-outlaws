export const MODULES = ["alba", "plantagenet", "tudor", "habsburg"] as const;
export type Dynasty = (typeof MODULES)[number];
export type Seat = number;
export type CardId = string;
export type Route = "kindreds" | "charter" | "act" | "marriage" | "regency";
export type Condition =
  | "seats-native"
  | "attack"
  | "restore-marriage"
  | "seats-rotate"
  | "dynasties"
  | "seats-any"
  | "barter-or-veil"
  | "married-seats";
export type Restriction =
  | "proclaim"
  | "counterclaim-rotate"
  | "petition-with-hand"
  | "marry"
  | "succession";
export type Effect =
  | "retire-supported"
  | "return-unsupported"
  | "return-dependency"
  | "return-native"
  | "history"
  | "break-marriage"
  | "commit-unmarried"
  | "blood-edict";
export type Instruction = { timing: "activation" | "start"; effect: Effect };
export interface CardSource {
  id: CardId;
  revision: number;
  kind: "noble" | "law" | "interregnum" | "fragment";
  printed: {
    name: string;
    dynasty: Dynasty;
    queen?: boolean;
    founder?: boolean;
    branch?: string;
    collector?: number;
    slot?: number;
    historicalTitle?: string;
  };
  cardText: string;
  reminderRefs: string[];
  historicalNote: string;
  evidenceRefs: string[];
  artRef: string;
}
export interface Program {
  abilities?: string[];
  law?: LawProgram;
  requiredContributions: number;
  expiryAfter: number;
  condition?: Condition;
  restrictions: Restriction[];
  instructions: Instruction[];
  end?: "condition" | "attack";
  carry: boolean;
  expiry?: "immediate" | "next-end";
  route?: Route;
  fragment?: number;
  fragmentGoal?: number;
}
export interface LawProgram {
  entryNatives: number;
  heir: {
    count: number;
    zone: "court" | "hand" | "marriage";
    native: boolean;
    differentBranches: boolean;
  };
  witness: "native" | "marriage" | null;
  keep: "any-heir" | "heir" | "heir-witness" | "heir-marriage";
  successionAfter: number;
  reignRounds: number;
}
export interface CompiledCard {
  sourceId: string;
  sourceHash: string;
  languageVersion: string;
  dictionaryHash: string;
  compilerVersion: string;
  ast: Program;
  canonicalText: string;
  reminderRefs: string[];
}
export interface Player {
  seat: Seat;
  name: string;
  ai: boolean;
  dynasty: Dynasty | null;
  hand: CardId[];
  court: CardId[];
  leverage: CardId[];
  ruler: CardId | null;
  seals: number;
  rotated: CardId[];
}
export interface Marriage {
  id: number;
  seat: Seat;
  queen: CardId;
  spouse: CardId;
}
export interface Crown {
  seat: Seat;
  route: Route;
  stage: "proclaimed" | "reigning";
  round: number;
  oldRuler: CardId;
  heirs: CardId[];
  witness: CardId | null;
  sealed: CardId | null;
  successor: CardId | null;
  reignRound: number | null;
}
export interface HistoryEvent {
  id: CardId;
  order: number;
  status: "pending" | "active";
  revealed: number;
  activated: number | null;
  expires: number | null;
  obligated: Seat[];
  fulfilled: Seat[];
  contributions: { seat: Seat; card: CardId; dynasty: Dynasty }[];
  attacks: { seat: Seat; card: CardId }[];
  restoreIds: Record<string, CardId[]>;
}
export interface Fragment {
  id: CardId;
  dynasty: Dynasty;
  slot: number;
  onceVeiled: boolean;
  veil: { seat: Seat; until: number } | null;
}
export interface GameEvent {
  seq: number;
  type: string;
  text: string;
  visibility: "public" | Seat[];
  cards: CardId[];
  from?: string;
  to?: string;
  round: number;
}
export interface Observation {
  event: number;
  cards: CardId[];
  reason: string;
}
export interface Setup {
  step: "pass" | "declare" | "repair" | "ruler";
  pass: number;
  locked: Record<string, CardId[]>;
  repairs: Seat[];
  repairPacket: CardId[];
  repairDraw: CardId | null;
}
export interface ChoiceRequest {
  id: string;
  chooser: Seat;
  kind: "interim" | "succession" | "effect";
  allowedIds: CardId[];
  min: number;
  max: number;
  snapshotId: string;
  optional: boolean;
  visibility: "public" | "private";
  consequence: "reject";
  continuation: string;
  selection: CardId[] | null;
}
export interface ChoiceBatch {
  effect: Effect | "interim" | "succession";
  requests: ChoiceRequest[];
  resume: Phase;
  eventId?: string;
}
export interface Barter {
  initiator: Seat;
  recipient: Seat;
  stage: "packet" | "inspection" | "decision";
  packets: Record<string, CardId[]>;
  consent: Record<string, boolean>;
  decisions: Record<string, boolean>;
  inspected: boolean;
}
export interface Claim {
  seat: Seat;
  defender: Seat;
  target: CardId;
  source: CardId;
}
export type Phase =
  | "setup"
  | "start"
  | "action"
  | "response"
  | "choice"
  | "barter"
  | "end"
  | "terminal";
export interface Boundary {
  step: number;
  index: number;
  events: string[];
}
export interface GameState {
  schema: 4;
  rulesetId: "history-engine-v4";
  contentVersion: string;
  revision: number;
  rng: number;
  modules: Dynasty[];
  players: Player[];
  first: Seat;
  active: Seat;
  round: number;
  phase: Phase;
  setup: Setup | null;
  dynastyDeck: CardId[];
  historyDeck: CardId[];
  noblePast: CardId[];
  historyPast: CardId[];
  marriages: Marriage[];
  nextMarriage: number;
  crown: Crown | null;
  history: HistoryEvent[];
  revealSequence: number;
  fragments: Fragment[];
  petitioned: CardId[];
  passes: Seat[];
  claim: Claim | null;
  barter: Barter | null;
  choices: ChoiceBatch | null;
  boundary: Boundary;
  events: GameEvent[];
  observations: Record<string, Observation[]>;
  result: { winner: Seat | "eudoxia"; reason: string } | null;
  policy: { version: string; budget: number; observationRevision: number };
}
export interface Action {
  type:
    | "pass"
    | "build"
    | "withdraw"
    | "petition"
    | "marry"
    | "claim"
    | "counterclaim"
    | "decline"
    | "address"
    | "attack"
    | "veil"
    | "proclaim"
    | "barter"
    | "barter-packet"
    | "barter-inspect"
    | "barter-decide"
    | "barter-cancel"
    | "setup-lock"
    | "repair"
    | "ruler"
    | "choice";
  seat: Seat;
  revision: number;
  card?: CardId;
  target?: CardId;
  event?: CardId;
  other?: Seat;
  cards?: CardId[];
  route?: Route;
  heirs?: CardId[];
  witness?: CardId;
  accept?: boolean;
  choiceId?: string;
}
export interface PlayerView extends Omit<Player, "hand"> {
  handCount: number;
  hand: CardId[] | null;
}
export interface GameView
  extends Omit<
    GameState,
    | "rng"
    | "dynastyDeck"
    | "historyDeck"
    | "players"
    | "observations"
    | "crown"
    | "setup"
    | "barter"
    | "choices"
  > {
  viewer: Seat | null;
  dynastyCount: number;
  historyCount: number;
  players: PlayerView[];
  observations: Observation[];
  crown:
    | (Omit<Crown, "sealed" | "heirs"> & {
        sealed: CardId | null;
        sealedCount: number;
        heirs: CardId[];
      })
    | null;
  setup:
    | (Omit<Setup, "locked"> & { locked: Record<string, CardId[] | null> })
    | null;
  barter:
    | (Omit<Barter, "packets" | "decisions"> & {
        packets: Record<string, CardId[] | null>;
        counts: Record<string, number>;
        decisions: Record<string, boolean | null>;
      })
    | null;
  choices:
    | (Omit<ChoiceBatch, "requests"> & { requests: ChoiceRequest[] })
    | null;
}
