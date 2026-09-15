import {
  CARDS,
  HOUSES,
  PAINTINGS,
  card,
  house,
  type HouseId,
  type Role,
} from "./content";

export type Policy = "rush" | "economy" | "defense" | "adaptive";
export type Mode = "lesson" | "chronicle" | "skirmish" | "daily" | "family";
export type Response = "accept" | "brace" | "ambush";
export interface Royal {
  uid: string;
  card: string;
  hp: number;
  ready: boolean;
  marriedTo?: string;
}
export interface Court {
  id: number;
  human: boolean;
  house: HouseId;
  gold: number;
  stability: number;
  shield: number;
  estates: number;
  claim: number;
  challengers: number[];
  response: boolean;
  hand: Royal[];
  deck: Royal[];
  court: Royal[];
  discard: Royal[];
  policy: Policy;
}
export interface Contest {
  actor: number;
  defender: number;
  attacker: string;
  target: string;
}
export interface Moment {
  id: number;
  kind: string;
  actor: number;
  source?: string;
  target?: string;
  amount?: number;
  title: string;
  why: string;
  changes?: { uid: string; before: number; after: number }[];
  round?: number;
  turn?: number;
}
export interface Duel {
  version: 2;
  seed: number;
  rng: number;
  mode: Mode;
  round: number;
  turn: number;
  orders: number;
  players: Court[];
  pending: Contest | null;
  winner: number | null;
  over: boolean;
  reason: string;
  events: Moment[];
  serial: number;
  turns: number;
  lesson: number;
  tutorialVersion?: number;
  witness: number;
  relics: string[];
}
export type Move =
  | {
      type: "deploy" | "marry" | "attack" | "recall";
      uid: string;
      target?: string;
    }
  | { type: "estate" | "fortify" | "restore" | "recruit" | "claim" | "end" };
export const ROLES: Record<
  Role,
  {
    icon: string;
    color: string;
    title: string;
    cost: number;
    force: number;
    resolve: number;
    ability: string;
  }
> = {
  Founder: {
    icon: "⚑",
    color: "#e8bc57",
    title: "FOUNDER",
    cost: 5,
    force: 4,
    resolve: 6,
    ability: "Founder · Strong in attack. Expensive to play again.",
  },
  Queen: {
    icon: "∞",
    color: "#ce94dc",
    title: "QUEEN",
    cost: 3,
    force: 2,
    resolve: 4,
    ability: "Marriage · Bring one foreign Royal into your family.",
  },
  Warlord: {
    icon: "⚔",
    color: "#ef8866",
    title: "COMMANDER",
    cost: 2,
    force: 3,
    resolve: 3,
    ability: "Attack · Strong offense for raids and captures.",
  },
  Lawgiver: {
    icon: "⛨",
    color: "#7dccde",
    title: "GUARDIAN",
    cost: 3,
    force: 2,
    resolve: 5,
    ability: "Guard · Enters upright. Protects other pieces while upright.",
  },
  Intriguer: {
    icon: "†",
    color: "#b99aee",
    title: "CONSPIRATOR",
    cost: 2,
    force: 2,
    resolve: 2,
    ability: "In play: destroy an estate. In hand: Ambush for 3 damage.",
  },
  Royal: {
    icon: "◉",
    color: "#a6cf83",
    title: "STEWARD",
    cost: 2,
    force: 1,
    resolve: 3,
    ability: "Income · Gain 1 extra gold each turn while in your family.",
  },
};
export const HOUSE_RULES: Record<
  HouseId,
  { trait: string; text: string; policy: Policy }
> = {
  alba: {
    trait: "Stone & steel",
    text: "Your Guardians cost 1 less gold. Hold the border while your court takes root.",
    policy: "defense",
  },
  plantagenet: {
    trait: "Lionheart",
    text: "Your Commanders can attack the turn they enter. Early pressure punishes investment.",
    policy: "rush",
  },
  tudor: {
    trait: "The hidden court",
    text: "Your Conspirators steal up to 2 gold when deployed. Keep one concealed for an Ambush.",
    policy: "rush",
  },
  valois: {
    trait: "Patronage",
    text: "Renew hand costs 1 gold instead of 2. Discard your hand and draw five replacements.",
    policy: "economy",
  },
  habsburg: {
    trait: "The marriage empire",
    text: "Married foreign Royals cost 1 less gold. Alliances field useful outsiders, but depend on a Queen.",
    policy: "economy",
  },
  bourbon: {
    trait: "The sun court",
    text: "From round two, while your Founder remains in court, gain 1 crown shield at the start of your turn.",
    policy: "adaptive",
  },
};
export const HISTORY = [
  {
    name: "The Crown’s Levy",
    text: "All courts pay 2 gold. Empty treasuries lose 1 stability instead.",
  },
  {
    name: "Disputed Succession",
    text: "Each court loses 1 stability for every Royal beyond three. Shields absorb the pressure.",
  },
  {
    name: "The Cost of an Oath",
    text: "Each living foreign marriage costs 2 gold, or the marriage breaks.",
  },
  {
    name: "The King’s Peace",
    text: "All courts recover 2 stability. Exposed power gets a moment to breathe.",
  },
];
export const RELICS = [
  {
    id: "purse",
    name: "The Treasurer’s Purse",
    text: "Start each court with 2 extra gold.",
    icon: "✧",
  },
  {
    id: "aegis",
    name: "The Border Charter",
    text: "Start with 2 shields.",
    icon: "⛨",
  },
  {
    id: "oath",
    name: "The Old Oath",
    text: "Your first estate begins already founded.",
    icon: "∞",
  },
];
export const random = (g: { rng: number }) =>
  (g.rng = (Math.imul(g.rng, 1664525) + 1013904223) >>> 0) / 4294967296;
export const PAINTING_SIZE = 9;
// Cyclic strokes fill the first nine-piece painting after every other painting has eight.
export const WITNESS_LIMIT = PAINTINGS.length * (PAINTING_SIZE - 1) + 1;
export const paintingCounts = (g: Duel) =>
  PAINTINGS.map((_, i) =>
    Math.max(
      0,
      Math.floor((g.witness + PAINTINGS.length - 1 - i) / PAINTINGS.length),
    ),
  );
function shuffle<T>(g: { rng: number }, a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(g) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const spec = (r: Royal | string) =>
  ROLES[card(typeof r === "string" ? r : r.card).role];
export function active(p: Court, r: Royal, seen = new Set<string>()): boolean {
  if (card(r.card).house === p.house) return true;
  if (!r.marriedTo || seen.has(r.uid)) return false;
  seen.add(r.uid);
  const queen = p.court.find(
    (q) => q.uid === r.marriedTo && card(q.card).role === "Queen",
  );
  return !!queen && active(p, queen, seen);
}
export const dynastyCount = (p: Court) =>
  p.court.filter((r) => active(p, r)).length;
export const nativeCount = (p: Court) =>
  p.court.filter((r) => card(r.card).house === p.house).length;
export const upkeep = (p: Court) =>
  Math.max(0, p.court.length - 3) +
  p.court.filter((r) => r.marriedTo && active(p, r)).length;
export const income = (p: Court) =>
  4 +
  p.estates * 2 +
  p.court.filter((r) => card(r.card).role === "Royal" && active(p, r)).length -
  upkeep(p);
export const canHold = (p: Court) => dynastyCount(p) >= 3;
export const claimCost = (p: Court) =>
  p.court.reduce((sum, r) => sum + cost(p, r, !!r.marriedTo), 0);
export const cost = (p: Court, r: Royal, marry = false) =>
  Math.max(
    1,
    spec(r).cost -
      (p.house === "alba" && card(r.card).role === "Lawgiver" ? 1 : 0) -
      (marry && p.house === "habsburg" ? 1 : 0),
  );
export const guards = (p: Court) =>
  p.court.filter(
    (r) => card(r.card).role === "Lawgiver" && active(p, r) && r.ready,
  );
export const forecast = (g: Duel) =>
  g.mode === "lesson"
    ? {
        in: 0,
        name: "Teaching match",
        text: "History and the Witness are paused. Learn the claim-and-hold victory.",
      }
    : {
        in: 4 - ((g.round - 1) % 4),
        ...HISTORY[Math.floor((g.round - 1) / 4) % HISTORY.length],
      };
export function emit(g: Duel, event: Omit<Moment, "id">) {
  g.events.push({ id: ++g.serial, round: g.round, turn: g.turn, ...event });
  if (g.events.length > 160) g.events.shift();
}
function drawOne(p: Court) {
  if (!p.deck.length && p.discard.length) {
    p.deck = p.discard.splice(0).reverse();
    p.deck.forEach((r) => {
      r.hp = spec(r).resolve;
      r.ready = false;
      delete r.marriedTo;
    });
  }
  return p.deck.pop();
}
function draw(p: Court, g?: Duel) {
  while (p.hand.length < 5) {
    const r = drawOne(p);
    if (!r) break;
    p.hand.push(r);
    if (g)
      emit(g, {
        kind: "draw",
        actor: p.id,
        source: `deck-${p.id}`,
        target: `hand-${p.id}`,
        amount: 1,
        title: `${house(p.house).name} draws a Royal`,
        why: `A card moves from the draw pile into the concealed hand.`,
      });
  }
}
export function createDuel(opts: {
  seed: number;
  house: HouseId;
  rival?: HouseId;
  mode?: Mode;
  policy?: Policy;
  relics?: string[];
  seats?: number;
  humans?: number;
  houses?: HouseId[];
}): Duel {
  const rival =
    opts.rival && opts.rival !== opts.house
      ? opts.rival
      : (HOUSES.find((h) => h.id !== opts.house && h.id === "plantagenet")
          ?.id ?? HOUSES.find((h) => h.id !== opts.house)!.id);
  const g: Duel = {
    version: 2,
    seed: opts.seed,
    rng: opts.seed >>> 0,
    mode: opts.mode ?? "skirmish",
    round: 1,
    turn: 0,
    orders: 2,
    players: [],
    pending: null,
    winner: null,
    over: false,
    reason: "",
    events: [],
    serial: 0,
    turns: 0,
    lesson: 0,
    witness: 0,
    relics: opts.relics ?? [],
  };
  const count = Math.max(2, Math.min(4, opts.seats ?? 3));
  const houses =
    opts.houses ??
    [
      opts.house,
      rival,
      ...HOUSES.filter((h) => ![opts.house, rival].includes(h.id)).map(
        (h) => h.id,
      ),
    ].slice(0, count);
  if (
    houses.length !== count ||
    new Set(houses).size !== count ||
    houses.some((id) => !HOUSES.some((h) => h.id === id))
  )
    throw Error("Choose a distinct House for each seat.");
  const allies = HOUSES.filter((h) => !houses.includes(h.id));
  const foreignPool = shuffle(
    g,
    CARDS.filter((c) => allies.some((h) => h.id === c.house)),
  );
  houses.forEach((h, i) => {
    const make = (id: string): Royal => ({
      uid: `${i}:${id}`,
      card: id,
      hp: spec(id).resolve,
      ready: false,
    });
    const own = CARDS.filter((c) => c.house === h),
      founder = make(own[0].id);
    const deck = shuffle(g, [...own.slice(1), ...foreignPool.splice(0, 4)]).map(
      (c) => make(c.id),
    );
    const p: Court = {
      id: i,
      human: i < (opts.humans ?? 1),
      house: h,
      gold: 5 + (i === 0 && g.relics.includes("purse") ? 2 : 0),
      stability: 12,
      shield: i === 0 && g.relics.includes("aegis") ? 2 : 0,
      estates: i === 0 && g.relics.includes("oath") ? 1 : 0,
      claim: 0,
      challengers: [],
      response: true,
      hand: [],
      deck,
      court: [founder],
      discard: [],
      policy: i === 0 ? "adaptive" : (opts.policy ?? HOUSE_RULES[h].policy),
    };
    // A curated but shuffled opening always offers economy, defense, force, and a marriage route.
    const roles: Role[] = ["Royal", "Lawgiver", "Warlord", "Queen"];
    for (const role of roles) {
      const at = p.deck.findIndex(
        (r) => card(r.card).house === h && card(r.card).role === role,
      );
      if (at >= 0) p.hand.push(...p.deck.splice(at, 1));
    }
    const foreign = p.deck.findIndex((r) => card(r.card).house !== h);
    if (foreign >= 0) p.hand.push(...p.deck.splice(foreign, 1));
    draw(p);
    founder.ready = true;
    g.players.push(p);
  });
  emit(g, {
    kind: "begin",
    actor: 0,
    title: "A crown must be kept.",
    why: `Expose three family Royals, connected by blood or supported marriage, to establish a dynasty. Claim, then withstand one complete turn from each of the other ${count - 1} Houses.`,
  });
  return g;
}
export function moves(g: Duel): Move[] {
  if (g.over || g.pending) return [];
  const p = g.players[g.turn];
  const result: Move[] = [{ type: "end" }];
  if (g.orders < 1) return result;
  if (p.court.length < 5)
    for (const r of p.hand) {
      if (p.gold >= cost(p, r)) result.push({ type: "deploy", uid: r.uid });
      if (
        card(r.card).house !== p.house &&
        p.court.some(
          (x) =>
            card(x.card).role === "Queen" &&
            active(p, x) &&
            !p.court.some((spouse) => spouse.marriedTo === x.uid),
        ) &&
        p.gold >= cost(p, r, true)
      )
        result.push({ type: "marry", uid: r.uid });
    }
  const targets = g.players
    .filter((q) => q.id !== p.id)
    .flatMap((q) =>
      guards(q).length
        ? guards(q).map((r) => r.uid)
        : [
            ...q.court.map((r) => r.uid),
            `crown-${q.id}`,
            ...(q.estates ? [`estate-${q.id}`] : []),
          ],
    );
  for (const r of p.court) {
    result.push({ type: "recall", uid: r.uid });
    if (r.ready)
      for (const target of targets)
        result.push({ type: "attack", uid: r.uid, target });
  }
  if (p.gold >= 3 && p.estates < 3) result.push({ type: "estate" });
  if (p.gold >= 2 && p.shield < 5) result.push({ type: "fortify" });
  if (p.gold >= 2 && p.stability < 12) result.push({ type: "restore" });
  if (
    p.gold >= (p.house === "valois" ? 1 : 2) &&
    (p.deck.length || p.discard.length)
  )
    result.push({ type: "recruit" });
  if (p.gold >= claimCost(p) && !p.claim && canHold(p))
    result.push({ type: "claim" });
  return result;
}
const key = (a: Move) => JSON.stringify(a);
export function legal(g: Duel, a: Move) {
  return moves(g).some((b) => key(a) === key(b));
}
export function reactions(g: Duel): Response[] {
  if (!g.pending) return [];
  const p = g.players[g.pending.defender];
  return [
    "accept",
    ...(p.response && p.gold >= 2
      ? [
          "brace",
          ...(p.hand.some((r) => card(r.card).role === "Intriguer")
            ? ["ambush"]
            : []),
        ]
      : []),
  ] as Response[];
}
export function targetCourt(g: Duel, target: string) {
  return g.players.find(
    (p) =>
      target === `crown-${p.id}` ||
      target === `estate-${p.id}` ||
      p.court.some((r) => r.uid === target),
  )!;
}
function remove(g: Duel, p: Court, r: Royal) {
  p.court = p.court.filter((c) => c.uid !== r.uid);
  for (const c of p.court)
    if (c.marriedTo === r.uid) {
      delete c.marriedTo;
      emit(g, {
        kind: "marriage-broken",
        actor: p.id,
        source: r.uid,
        target: c.uid,
        title: "An alliance unravels",
        why:
          card(c.card).name +
          " loses royal support because " +
          card(r.card).name +
          " left the court. Guard and income stop.",
      });
    }
  delete r.marriedTo;
}
function breakClaims(g: Duel) {
  for (const p of g.players)
    if (p.claim && !canHold(p)) {
      p.claim = 0;
      p.challengers = [];
      emit(g, {
        kind: "broken",
        actor: p.id,
        title: `${house(p.house).name}: claim broken`,
        why: `Only ${dynastyCount(p)} family Royals remain. Your dynasty needs three, connected by blood or a supported marriage. Rebuild and claim again.`,
      });
    }
}
function damageCrown(g: Duel, p: Court, n: number, source?: string) {
  const absorb = Math.min(p.shield, n);
  p.shield -= absorb;
  p.stability = Math.max(0, p.stability - (n - absorb));
  emit(g, {
    kind: "crown-hit",
    actor: p.id,
    source,
    target: `crown-${p.id}`,
    amount: n - absorb,
    title: absorb
      ? `${absorb} absorbed · ${n - absorb} unrest`
      : `${n} stability lost`,
    why: "Military pressure causes unrest. At zero stability, succession collapses and a Royal is displaced.",
  });
  if (p.stability === 0) {
    const r =
      [...p.court].reverse().find((r) => card(r.card).role !== "Founder") ??
      p.court[0];
    if (r) {
      remove(g, p, r);
      r.hp = spec(r).resolve;
      r.ready = false;
      p.discard.push(r);
    }
    p.stability = 8;
    p.claim = 0;
    p.challengers = [];
    p.estates = Math.max(0, p.estates - 1);
    for (const c of p.court) delete c.marriedTo;
    emit(g, {
      kind: "collapse",
      actor: p.id,
      title: "Succession collapses",
      why: "One Royal and one estate are lost. Marriages break. Stability returns to 8; the contest continues.",
    });
  }
}
export function act(g: Duel, requested: Move) {
  if (!legal(g, requested)) throw Error("This order is not available.");
  const p = g.players[g.turn],
    a = requested;
  const q =
    a.type === "attack"
      ? targetCourt(g, a.target!)
      : [...g.players]
          .filter((q) => q.id !== p.id)
          .sort((a, b) => b.estates - a.estates || b.gold - a.gold)[0];
  if (a.type === "end") {
    endTurn(g);
    return;
  }
  g.orders--;
  if (a.type === "deploy" || a.type === "marry") {
    const r = p.hand.find((r) => r.uid === a.uid)!;
    p.gold -= cost(p, r, a.type === "marry");
    p.hand = p.hand.filter((x) => x.uid !== r.uid);
    r.hp = spec(r).resolve;
    r.ready =
      card(r.card).role === "Lawgiver" ||
      (p.house === "plantagenet" && card(r.card).role === "Warlord");
    if (a.type === "marry")
      r.marriedTo = p.court.find(
        (x) =>
          card(x.card).role === "Queen" &&
          active(p, x) &&
          !p.court.some((spouse) => spouse.marriedTo === x.uid),
      )!.uid;
    p.court.push(r);
    if (card(r.card).role === "Intriguer" && active(p, r)) {
      if (q.estates) {
        q.estates--;
        emit(g, {
          kind: "sabotage",
          actor: p.id,
          source: r.uid,
          target: `estate-${q.id}`,
          title: "An estate dismantled",
          why: `${house(q.house).name} loses an exposed estate and its recurring income.`,
        });
      }
      if (p.house === "tudor") {
        const stolen = Math.min(2, q.gold);
        q.gold -= stolen;
        p.gold = Math.min(30, p.gold + stolen);
      }
    }
    emit(g, {
      kind: a.type,
      actor: p.id,
      source: r.uid,
      target: r.uid,
      title:
        a.type === "marry"
          ? "An alliance is sworn"
          : `${card(r.card).name} enters court`,
      why: explain(g, a, p.id),
    });
  }
  if (a.type === "attack") {
    p.court.find((r) => r.uid === a.uid)!.ready = false;
    g.pending = {
      actor: p.id,
      defender: q.id,
      attacker: a.uid,
      target: a.target!,
    };
    emit(g, {
      kind: "challenge",
      actor: p.id,
      source: a.uid,
      target: a.target,
      title: "A challenge is declared",
      why: explain(g, a, p.id),
    });
    if (reactions(g).length === 1) respond(g, "accept");
    return;
  }
  if (a.type === "recall") {
    const r = p.court.find((r) => r.uid === a.uid)!;
    remove(g, p, r);
    r.hp = spec(r).resolve;
    r.ready = false;
    if (p.hand.length < 7) p.hand.push(r);
    else p.discard.push(r);
    emit(g, {
      kind: "recall",
      actor: p.id,
      source: r.uid,
      title: "A Royal returns to concealment",
      why: "Recall preserves a damaged Royal and frees a seat, but may break your three-Royal declaration.",
    });
  }
  if (a.type === "estate") {
    p.gold -= 3;
    p.estates++;
    emit(g, {
      kind: "estate",
      actor: p.id,
      target: `estate-${p.id}`,
      title: "+2 income · an estate founded",
      why: "Costs 3 gold now; earns 2 each future turn. Raids and Conspirators can dismantle it.",
    });
  }
  if (a.type === "fortify") {
    p.gold -= 2;
    p.shield = Math.min(5, p.shield + 3);
    emit(g, {
      kind: "fortify",
      actor: p.id,
      target: `crown-${p.id}`,
      title: "+3 shields",
      why: "Crown shields block damage to your crown. Your Royals do not receive these shields.",
    });
  }
  if (a.type === "restore") {
    p.gold -= 2;
    p.stability = Math.min(12, p.stability + 3);
    emit(g, {
      kind: "restore",
      actor: p.id,
      target: `crown-${p.id}`,
      title: "+3 stability",
      why: "Restore public trust to prevent a succession collapse at zero stability.",
    });
  }
  if (a.type === "recruit") {
    p.gold -= p.house === "valois" ? 1 : 2;
    const oldHand = p.hand.splice(0);
    p.discard.push(...oldHand);
    draw(p);
    emit(g, {
      kind: "recruit",
      actor: p.id,
      target: `hand-${p.id}`,
      title: "A new inheritance · hand renewed",
      why: `${oldHand.length} concealed Royals move to your discard pile. Draw ${p.hand.length} replacements. Saved ambushes and marriage options are given up.`,
    });
  }
  if (a.type === "claim") {
    const fee = claimCost(p);
    p.gold -= fee;
    p.challengers = g.players.filter((q) => q.id !== p.id).map((q) => q.id);
    p.claim = p.challengers.length;
    emit(g, {
      kind: "claim",
      actor: p.id,
      target: `crown-${p.id}`,
      title: "THE CROWN IS CLAIMED",
      why: `Your family has at least three Royals in play. ${p.challengers.map((id) => house(g.players[id].house).name).join(", ")} each get a complete challenge turn. Coronation tribute is the total play cost of your exposed Royals: ${fee} gold. A larger retinue asks for more.`,
    });
  }
  breakClaims(g);
}
export function respond(g: Duel, response: Response) {
  if (!g.pending || !reactions(g).includes(response))
    throw Error("That response is not available.");
  const c = g.pending,
    p = g.players[c.actor],
    q = g.players[c.defender],
    attacker = p.court.find((r) => r.uid === c.attacker)!;
  let reduce = 0;
  if (response !== "accept") {
    q.gold -= 2;
    q.response = false;
    if (response === "brace") reduce = 2;
    else {
      const trap = q.hand.find((r) => card(r.card).role === "Intriguer")!;
      q.hand = q.hand.filter((r) => r.uid !== trap.uid);
      q.discard.push(trap);
      attacker.hp -= 3;
    }
    emit(g, {
      kind: response,
      actor: q.id,
      source: c.target === "crown" ? `crown-${q.id}` : c.target,
      target: attacker.uid,
      amount: response === "brace" ? 2 : 3,
      title:
        response === "brace"
          ? "BRACE · 2 damage blocked"
          : "AMBUSH · 3 damage before combat",
      why:
        response === "brace"
          ? "Two gold and your response marker are spent. This defending House cannot buy another response during the same rival turn."
          : "A concealed Conspirator is spent. A surviving attacker still completes its challenge.",
    });
  }
  if (attacker.hp <= 0) {
    remove(g, p, attacker);
    p.discard.push(attacker);
    emit(g, {
      kind: "defeat",
      actor: q.id,
      target: attacker.uid,
      title: "The ambush stops the attack",
      why: "The attacker lost all health before dealing combat damage.",
    });
  } else {
    const hit = Math.max(0, spec(attacker).force - reduce);
    if (c.target.startsWith("crown-")) damageCrown(g, q, hit, attacker.uid);
    else if (c.target.startsWith("estate-")) {
      if (hit > 0) {
        q.estates = Math.max(0, q.estates - 1);
        p.gold = Math.min(30, p.gold + 2);
      }
      emit(g, {
        kind: "raid",
        actor: p.id,
        source: attacker.uid,
        target: `estate-${q.id}`,
        amount: hit,
        title: hit ? "Estate raided · +2 gold" : "The raid was repelled",
        why: hit
          ? "The rival loses an estate and its future income. You gain 2 gold."
          : "Brace blocked all damage; the estate survives.",
      });
    } else {
      const defender = q.court.find((r) => r.uid === c.target)!;
      const attackerBefore = attacker.hp,
        defenderBefore = defender.hp;
      defender.hp -= hit;
      attacker.hp -= spec(defender).force;
      emit(g, {
        kind: "combat",
        changes: [
          {
            uid: attacker.uid,
            before: attackerBefore,
            after: Math.max(0, attacker.hp),
          },
          {
            uid: defender.uid,
            before: defenderBefore,
            after: Math.max(0, defender.hp),
          },
        ],
        actor: p.id,
        source: attacker.uid,
        target: defender.uid,
        amount: hit,
        title: `${card(attacker.card).name} deals ${hit} · ${card(defender.card).name} deals ${spec(defender).force}`,
        why: `${card(attacker.card).name}: ${attackerBefore} → ${Math.max(0, attacker.hp)} health. ${card(defender.card).name}: ${defenderBefore} → ${Math.max(0, defender.hp)} health. Both Royals deal damage simultaneously.`,
      });
      if (defender.hp <= 0) {
        remove(g, q, defender);
        defender.hp = spec(defender).resolve;
        defender.ready = false;
        if (attacker.hp > 0 && p.hand.length < 7) {
          p.hand.push(defender);
          emit(g, {
            kind: "capture",
            actor: p.id,
            source: defender.uid,
            target: `hand-${p.id}`,
            title: `${card(defender.card).name} seized`,
            why: `${card(defender.card).name} moves from ${house(q.house).name}’s court into ${house(p.house).name}’s hand.`,
          });
        } else {
          q.discard.push(defender);
          emit(g, {
            kind: "defeat",
            actor: q.id,
            target: defender.uid,
            title: `${card(defender.card).name} goes to the discard pile`,
            why:
              attacker.hp <= 0
                ? "Both Royals were defeated. Neither is captured."
                : "The attacker’s hand is full, so the defender is discarded.",
          });
        }
      }
      if (attacker.hp <= 0) {
        remove(g, p, attacker);
        p.discard.push(attacker);
        emit(g, {
          kind: "defeat",
          actor: q.id,
          target: attacker.uid,
          title: "The attacker is displaced",
          why: "The defender’s damage reduced the attacker to zero health.",
        });
      }
    }
  }
  g.pending = null;
  breakClaims(g);
}
function endTurn(g: Duel) {
  const outgoing = g.players[g.turn];
  g.turns++;
  const next = g.players[(g.turn + 1) % g.players.length];
  if (next.id === 0) {
    g.round++;
    if (g.mode !== "lesson") {
      g.witness++;
      if ((g.round - 1) % 4 === 0) history(g);
    }
  }
  breakClaims(g);
  for (const claimant of g.players.filter(
    (p) => p.id !== outgoing.id && p.claim,
  )) {
    if (!claimant.challengers.includes(outgoing.id)) continue;
    claimant.challengers = claimant.challengers.filter(
      (id) => id !== outgoing.id,
    );
    claimant.claim = claimant.challengers.length;
    emit(g, {
      kind: "countdown",
      actor: claimant.id,
      target: `crown-${claimant.id}`,
      title: claimant.claim
        ? `${house(outgoing.house).name}'s challenge survived`
        : "THE DYNASTY HOLDS",
      why: claimant.claim
        ? `Still to contest: ${claimant.challengers.map((id) => house(g.players[id].house).name).join(", ")}.`
        : "Every rival received a full turn. Three family Royals remained through the challenges and forecast history.",
    });
    if (!claimant.claim) {
      g.over = true;
      g.winner = claimant.id;
      g.reason = `${house(claimant.house).name} kept its declared dynasty of at least three family Royals while every other House completed a challenge turn.`;
      return;
    }
  }
  if (g.witness >= WITNESS_LIMIT) {
    g.over = true;
    g.winner = -1;
    g.reason =
      "The Witness completed a nine-fragment painting before any House secured its dynasty. Her public, cyclic strokes filled the first painting.";
    emit(g, {
      kind: "witness",
      actor: -1,
      title: "THE WITNESS PREVAILS",
      why: g.reason,
    });
    return;
  }
  g.turn = next.id;
  g.orders = 2;
  for (const p of g.players) if (p.id !== next.id) p.response = true;
  const earned = g.round > 1 ? income(next) : 0;
  next.gold = Math.min(30, Math.max(0, next.gold + earned));
  next.court.forEach((r) => {
    r.ready = true;
    r.hp = spec(r).resolve;
  });
  if (
    g.round > 1 &&
    next.house === "bourbon" &&
    next.court.some((r) => card(r.card).role === "Founder")
  )
    next.shield = Math.min(5, next.shield + 1);
  draw(next, g);
  emit(g, {
    kind: "turn",
    actor: next.id,
    target: `crown-${next.id}`,
    amount: earned,
    title: `${house(next.house).name.toUpperCase()} TURN ${earned >= 0 ? "+" : ""}${earned} gold`,
    why: `Royals turn upright and recover full health. ${g.round === 1 ? "Opening gold is already funded." : `Receive ${earned} gold: 4 base + ${next.estates * 2} from estates + ${next.court.filter((r) => card(r.card).role === "Royal" && active(next, r)).length} from Stewards − ${upkeep(next)} upkeep.`} Two orders are available.`,
  });
}
function history(g: Duel) {
  const index = (Math.floor((g.round - 1) / 4) - 1) % 4;
  emit(g, {
    kind: "history",
    actor: -1,
    title: HISTORY[index].name,
    why: HISTORY[index].text,
  });
  for (const p of g.players) {
    if (index === 0) {
      if (p.gold >= 2) p.gold -= 2;
      else damageCrown(g, p, 1);
    }
    if (index === 1) damageCrown(g, p, Math.max(0, p.court.length - 3));
    if (index === 2)
      for (const r of p.court.filter((r) => r.marriedTo)) {
        if (p.gold >= 2) p.gold -= 2;
        else delete r.marriedTo;
      }
    if (index === 3) p.stability = Math.min(12, p.stability + 2);
  }
  breakClaims(g);
}
export function explain(g: Duel, a: Move, actor = g.turn): string {
  const p = g.players[actor],
    q =
      a.type === "attack"
        ? targetCourt(g, a.target!)
        : g.players.find((q) => q.id !== actor)!;
  if (a.type === "deploy" || a.type === "marry") {
    const r = [...p.hand, ...p.court].find((r) => r.uid === a.uid);
    if (!r) return "A new Royal changes the balance of power.";
    const role = card(r.card).role;
    if (a.type === "marry")
      return "A Queen brings this Royal into the family. Her fall removes its legitimacy, income and abilities, potentially breaking the claim.";
    if (card(r.card).house !== p.house)
      return "A foreign Outlaw supplies force, but no income or special abilities. A Queen can marry a foreign Royal from hand.";
    return role === "Royal"
      ? "A Steward adds 1 gold each turn while in your family. Its low attack makes it vulnerable."
      : role === "Lawgiver"
        ? "While upright, a Guardian protects your other pieces. Attacking gives up that protection until your next turn."
        : role === "Warlord"
          ? "A Commander develops cheap force. It can punish an investment before it repays its cost."
          : role === "Intriguer"
            ? "A Conspirator dismantles estates now, but can no longer be used as a concealed Ambush."
            : role === "Queen"
              ? "A Queen opens foreign alliances; those allies become dependent on her survival."
              : "A Founder brings strong attack and health, at a substantial gold cost.";
  }
  if (a.type === "attack") {
    if (a.target?.startsWith("crown-"))
      return q.claim
        ? "A succession collapse can break the rival’s claim. Shields and Brace may absorb it."
        : "At zero stability, succession collapses and a Royal is lost. A direct capture may break the dynasty sooner.";
    if (a.target?.startsWith("estate-"))
      return "Raiding removes recurring income and steals 2 gold. Punish greed before it compounds.";
    const r = q.court.find((r) => r.uid === a.target);
    const attacker = p.court.find((r) => r.uid === a.uid);
    if (q.claim && r)
      return "This House is claiming the crown. Removing family support now can prevent its victory; a Queen can be a more valuable target than a stronger Royal.";
    if (
      r &&
      attacker &&
      attacker.hp <= spec(r).force &&
      r.hp > spec(attacker).force
    )
      return "A costly probe: retaliation would defeat this attacker without capturing the target. The pressure only pays off if a later challenge finishes the job.";
    return r && card(r.card).role === "Lawgiver"
      ? "Clearing a Guardian opens the rest of the court. Expect retaliation and a possible Brace."
      : r && card(r.card).role === "Queen"
        ? "Taking a Queen also breaks dependent marriages. One capture can leave several foreign pieces unsupported."
        : r && card(r.card).role === "Royal"
          ? "This challenge threatens both a Royal and recurring income. A strong target against a growing economy."
          : "A capture removes a declared Royal and adds it to your concealed options.";
  }
  return a.type === "estate"
    ? "Invest now for +2 income each turn; a raid can destroy the investment."
    : a.type === "fortify"
      ? "Shields counter crown pressure, but cannot protect income or win a crown alone."
      : a.type === "recruit"
        ? "Discard your hand and draw five replacements. Trade your saved options for a fresh inheritance."
        : a.type === "claim"
          ? "Declare three family Royals and give every rival House a full turn to challenge the dynasty."
          : a.type === "restore"
            ? "Repair stability to prevent a succession collapse."
            : g.orders === 0
              ? "No orders left. End your turn."
              : "End your turn to keep unspent gold for responses or your next turn.";
}
export function aiResponse(g: Duel): Response {
  const available = reactions(g);
  if (available.includes("ambush")) {
    const a = g.players[g.pending!.actor].court.find(
      (r) => r.uid === g.pending!.attacker,
    )!;
    if (a.hp <= 3) return "ambush";
  }
  if (available.includes("brace")) {
    const q = g.players[g.pending!.defender],
      a = g.players[g.pending!.actor].court.find(
        (r) => r.uid === g.pending!.attacker,
      )!;
    const target = q.court.find((r) => r.uid === g.pending!.target);
    const hit = spec(a).force;
    const savesRoyal =
      target && target.hp <= hit && target.hp > Math.max(0, hit - 2);
    const savesEstate = g.pending!.target.startsWith("estate-") && hit <= 2;
    const savesCrown =
      g.pending!.target.startsWith("crown-") &&
      q.stability + q.shield <= hit &&
      q.stability + q.shield > hit - 2;
    if (
      savesRoyal ||
      savesEstate ||
      savesCrown ||
      (target && target.hp > Math.max(0, hit - 2) && (q.claim || q.gold >= 4))
    )
      return "brace";
  }
  return "accept";
}
export function chooseMove(g: Duel, policy = g.players[g.turn].policy): Move {
  const p = g.players[g.turn],
    available = moves(g);
  if (!available.length) throw Error("No moves during a response.");
  const value = (a: Move) => {
    const q =
      a.type === "attack"
        ? targetCourt(g, a.target!)
        : g.players
            .filter((q) => q.id !== p.id)
            .sort((a, b) => b.claim - a.claim || b.estates - a.estates)[0];
    let n = -10;
    if (a.type === "end")
      n =
        g.orders === 0
          ? 100
          : canHold(p) && !p.claim && p.gold < claimCost(p)
            ? 8
            : 0;
    if (a.type === "claim")
      n = g.players.some((q) => q.id !== p.id && q.claim) ? -4 : 100;
    if (a.type === "deploy" || a.type === "marry") {
      const r = p.hand.find((r) => r.uid === a.uid)!;
      const role = card(r.card).role;
      const valid = card(r.card).house === p.house || a.type === "marry";
      n =
        5 +
        (valid ? 3 : -3) +
        (p.court.length < 3 ? 2 : 0) +
        (role === "Royal" ? (g.round < 6 ? 4 : 1) : 0) +
        (role === "Lawgiver" && !guards(p).length ? 4 : 0) +
        (role === "Queen" && p.hand.some((r) => card(r.card).house !== p.house)
          ? 2
          : 0) +
        (role === "Intriguer" ? q.estates * 3 : 0);
      if (policy === "rush" && ["Warlord", "Founder"].includes(role)) n += 5;
      if (policy === "economy" && role === "Royal") n += 5;
      if (policy === "defense" && role === "Lawgiver") n += 5;
      if (p.claim && valid) n += 4;
      if (canHold(p) && !p.claim && role !== "Lawgiver") n -= 4;
    }
    if (a.type === "attack") {
      const r = p.court.find((r) => r.uid === a.uid)!,
        t = q.court.find((r) => r.uid === a.target);
      const force = spec(r).force;
      const givesUpGuard =
        card(r.card).role === "Lawgiver" && guards(p).length === 1;
      const canBrace = q.response && q.gold >= 2;
      const otherAttack =
        g.orders > 1 &&
        p.court.some(
          (other) =>
            other.uid !== r.uid && other.ready && spec(other).force > 2,
        );
      const blocked = canBrace && force <= 2;
      if (blocked && !otherAttack && !q.claim) return -12;
      if (t && r.hp <= spec(t).force && t.hp > force && !q.claim) return -14;
      n = givesUpGuard && !q.claim ? -6 : 2;
      if (t) {
        n += t.hp <= force ? 7 : 1;
        n +=
          card(t.card).role === "Royal"
            ? 3
            : card(t.card).role === "Queen" &&
                q.court.some((r) => r.marriedTo === t.uid)
              ? 5
              : 0;
        n -= r.hp <= spec(t).force ? 5 : 0;
        if (
          r.hp <= spec(t).force &&
          active(p, r) &&
          dynastyCount(p) <= 3 &&
          !q.claim
        )
          n -= 12;
        if (q.claim) n += 25 + (t.hp <= force ? 15 : 0);
        if (p.claim && r.hp <= spec(t).force) n -= 20;
      } else if (a.target?.startsWith("estate-")) n += q.estates ? 7 : 0;
      else {
        const collapse = q.stability + q.shield <= force;
        n += collapse ? 15 : 0;
        n -= q.shield;
        if (q.claim) n += collapse ? 35 : -6;
      }
      if (policy === "rush") n += 4;
      if (policy === "economy") n -= 1;
    }
    if (a.type === "estate")
      n =
        (g.round < 7 ? 9 : 0) +
        (policy === "economy" ? 8 : 0) -
        (q.court.some((r) => r.ready) && !guards(p).length ? 3 : 0) -
        p.estates;
    if (a.type === "recall") {
      const r = p.court.find((r) => r.uid === a.uid)!;
      const foreign = card(r.card).house !== p.house;
      if (
        foreign &&
        p.court.length === 5 &&
        dynastyCount(p) < 3 &&
        p.hand.some((x) => card(x.card).house === p.house)
      )
        n = 24;
      else if (
        !p.claim &&
        p.hand.length < 7 &&
        r.hp <= 2 &&
        p.court.length >= 3 &&
        p.gold >= cost(p, r) + 1
      )
        n = 7 + (card(r.card).role === "Lawgiver" ? 4 : 0);
    }
    if (a.type === "fortify")
      n = guards(p).length
        ? -8
        : (p.stability < 8 ? 8 : 1) +
          (policy === "defense" ? 4 : 0) +
          (p.claim ? 3 : 0);
    if (a.type === "restore")
      n = (p.stability < 6 ? 14 : 3) + (p.claim ? 12 : 0);
    if (a.type === "recruit")
      n = p.hand.some((r) => card(r.card).house === p.house)
        ? -4
        : dynastyCount(p) < 3
          ? 22
          : 4;
    return n;
  };
  return available
    .map((a) => ({ a, n: value(a) + random(g) * 1.5 }))
    .sort((a, b) => b.n - a.n)[0].a;
}
export function validateDuel(g: Duel) {
  try {
    if (
      !g ||
      g.version !== 2 ||
      !["lesson", "chronicle", "skirmish", "daily", "family"].includes(
        g.mode,
      ) ||
      !Array.isArray(g.players) ||
      g.players.length < 2 ||
      g.players.length > 4 ||
      !g.players[g.turn] ||
      !Number.isInteger(g.orders) ||
      g.orders < 0 ||
      g.orders > 2 ||
      !Number.isInteger(g.round) ||
      g.round < 1 ||
      !Number.isFinite(g.rng) ||
      !Array.isArray(g.events) ||
      !Array.isArray(g.relics) ||
      !Number.isInteger(g.witness) ||
      g.witness < 0 ||
      g.witness > WITNESS_LIMIT ||
      typeof g.reason !== "string"
    )
      return false;
    const all = g.players.flatMap((p) => [
      ...p.hand,
      ...p.court,
      ...p.deck,
      ...p.discard,
    ]);
    if (
      all.length !== g.players.length * 18 ||
      new Set(all.map((r) => r.uid)).size !== all.length ||
      new Set(all.map((r) => r.card)).size !== all.length ||
      !all.every(
        (r) =>
          !!card(r.card) &&
          Number.isFinite(r.hp) &&
          typeof r.ready === "boolean",
      )
    )
      return false;
    if (
      !g.players.every(
        (p, i) =>
          p.id === i &&
          typeof p.human === "boolean" &&
          HOUSES.some((h) => h.id === p.house) &&
          p.hand.length <= 7 &&
          p.court.length <= 5 &&
          p.court.every(
            (r) =>
              r.hp > 0 &&
              r.hp <= spec(r).resolve &&
              (!r.marriedTo ||
                p.court.some(
                  (q) => q.uid === r.marriedTo && card(q.card).role === "Queen",
                )),
          ) &&
          Number.isInteger(p.gold) &&
          p.gold >= 0 &&
          p.gold <= 30 &&
          p.stability > 0 &&
          p.stability <= 12 &&
          p.shield >= 0 &&
          p.shield <= 5 &&
          p.estates >= 0 &&
          p.estates <= 3 &&
          p.claim >= 0 &&
          p.claim <= g.players.length - 1 &&
          p.challengers.length === p.claim &&
          new Set(p.challengers).size === p.claim &&
          p.challengers.every((id) => id !== p.id && !!g.players[id]) &&
          (!p.claim || canHold(p)),
      )
    )
      return false;
    if (
      g.pending &&
      (!g.players[g.pending.actor]?.court.some(
        (r) => r.uid === g.pending!.attacker,
      ) ||
        !g.players[g.pending.defender] ||
        g.pending.actor !== g.turn ||
        g.pending.actor === g.pending.defender ||
        targetCourt(g, g.pending.target)?.id !== g.pending.defender)
    )
      return false;
    return !g.over
      ? g.winner === null
      : !!g.reason &&
          (g.winner === -1 || (g.winner !== null && !!g.players[g.winner]));
  } catch {
    return false;
  }
}
