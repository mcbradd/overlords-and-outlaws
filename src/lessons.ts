import { CARDS, card, type HouseId, type Role } from "./content";
import {
  createDuel,
  spec,
  attackForce,
  claimCost,
  cost,
  income,
  moves,
  type Duel,
  type Move,
  type Royal,
} from "./duel";

// One match, nine milestones. Advancing changes only the guide cursor.
export const LESSONS = [
  {
    title: "Bring David I to court",
    text: "Your House is Alba, nearest you. Play David I for 2 gold and one order. As a Guardian, he enters Ready and protects your other Royals.",
    types: ["deploy"],
  },
  {
    title: "Capture a rival Royal",
    text: "Select Kenneth MacAlpin, then the rival Steward. Review the exchange before attacking. When your attacker survives and the defender falls, you capture the defender into your hand.",
    types: ["attack"],
  },
  {
    title: "Answer the challenge",
    text: "End your turn. Plantagenet will attack David I. Pay 2 gold to Brace and block 2 damage, then resolve combat. You may Brace again whenever you can pay its cost.",
    types: ["end"],
  },
  {
    title: "Welcome your Queen",
    text: "The rivals finish their turns. Your surviving Royals recover and become Ready; you receive income and draw. Play your Queen to prepare a marriage.",
    types: ["deploy"],
  },
  {
    title: "An alliance from a capture",
    text: "The Steward you captured is still in your hand. Marry him to your Queen: he joins your court and counts toward your family while she remains there.",
    types: ["marry"],
  },
  {
    title: "Build an estate",
    text: "End your turn to collect income, then spend 3 gold and one order on an estate. It adds 2 gold to each future income payment. Rivals can raid it.",
    types: ["estate", "end"],
  },
  {
    title: "Save for your claim",
    text: "End your turns to collect your income. Keep 4 gold beyond the claim price so you can Brace against both rival Houses.",
    types: ["end"],
  },
  {
    title: "Claim the crown",
    text: "Pay for your claim. Having three family Royals makes you eligible; you win only after every rival has had a complete turn to contest it. Losing your third family Royal breaks the claim.",
    types: ["claim"],
  },
  {
    title: "Hold against both Houses",
    text: "End your turn, then Brace against each rival. Keep your Guardian and family standing until both Houses finish their turns.",
    types: ["end"],
  },
];

export function createLesson(): Duel {
  const index = 0;
  const g = createDuel({
    seed: 1306,
    house: "alba",
    houses: ["alba", "plantagenet", "tudor"],
    seats: 3,
    mode: "lesson",
  });
  g.lesson = 1;
  g.tutorialVersion = 2;
  g.events = [];
  g.serial = 0;
  const used = new Set<string>();
  const royal = (h: HouseId, role: Role, n = 0): Royal => {
    const c = CARDS.filter(
      (c) => c.house === h && c.role === role && !used.has(c.id),
    )[n];
    if (!c) throw Error(`Lesson card missing: ${h} ${role}`);
    used.add(c.id);
    return {
      uid: `lesson-${index}-${c.id}`,
      card: c.id,
      hp: spec(c.id).resolve,
      ready: true,
    };
  };
  for (const p of g.players) {
    p.court = [];
    p.hand = [];
    p.deck = [];
    p.discard = [];
    p.gold = 0;
    p.estates = 0;
  }
  const p = g.players[0],
    q = g.players[1],
    v = g.players[2];
  p.court = [royal("alba", "Founder")];
  q.court = [royal("plantagenet", "Founder")];
  v.court = [royal("tudor", "Founder")];
  p.gold = 5;
  p.hand = [royal("alba", "Lawgiver"), royal("alba", "Queen")];
  q.court.push(royal("plantagenet", "Royal"));
  const inPlay = new Set(
    g.players.flatMap((p) => p.court.concat(p.hand)).map((r) => r.card),
  );
  for (const seat of g.players)
    seat.deck = CARDS.filter(
      (c) => c.house === seat.house && !inPlay.has(c.id),
    ).map((c) => ({
      uid: `lesson-${index}-${c.id}`,
      card: c.id,
      hp: spec(c.id).resolve,
      ready: false,
    }));
  const allocated = new Set(
    g.players.flatMap((p) => p.court.concat(p.hand, p.deck)).map((r) => r.card),
  );
  const extra = CARDS.filter((c) => !allocated.has(c.id));
  for (let n = allocated.size; n < 54; n++) {
    const c = extra.shift()!;
    g.players[n % 3].deck.unshift({
      uid: `lesson-${index}-${c.id}`,
      card: c.id,
      hp: spec(c.id).resolve,
      ready: false,
    });
  }
  // Deal rival hands during setup so their first turns need no catch-up draws.
  for (const rival of g.players.slice(1)) {
    while (rival.hand.length < 5 && rival.deck.length)
      rival.hand.push(rival.deck.pop()!);
  }
  return g;
}

export function lessonComplete(g: Duel): boolean {
  const p = g.players[0],
    has = (kind: string) =>
      g.events.some((e) => e.kind === kind && e.actor === 0);
  switch (g.lesson) {
    case 1:
      return p.court.some((r) => card(r.card).role === "Lawgiver");
    case 2:
      return !g.pending && has("capture");
    case 3:
      return !g.pending && has("brace");
    case 4:
      return p.court.some((r) => card(r.card).role === "Queen");
    case 5:
      return p.court.some((r) => !!r.marriedTo);
    case 6:
      return p.estates > 0;
    case 7:
      return g.turn === 0 && p.gold >= claimCost(p) + 4;
    case 8:
      return p.claim > 0;
    case 9:
      return g.over && g.winner === 0;
    default:
      return false;
  }
}
export function nextLesson(g: Duel) {
  if (lessonComplete(g) && g.lesson < LESSONS.length) g.lesson++;
}
/** The same legal move drives the guide, its highlight, and input validation. */
export function lessonMove(g: Duel): Move | null {
  if (lessonComplete(g) || g.pending || g.turn !== 0 || g.over) return null;
  const p = g.players[0],
    legal = moves(g);
  const role = (uid: string, name: Role) =>
    card(p.hand.concat(p.court).find((r) => r.uid === uid)!.card).role === name;
  if (g.lesson === 1 || g.lesson === 4)
    return (
      legal.find(
        (a) =>
          a.type === "deploy" &&
          role(a.uid, g.lesson === 1 ? "Lawgiver" : "Queen"),
      ) ?? null
    );
  if (g.lesson === 2) {
    const target = g.players[1].court.find(
      (r) => card(r.card).role === "Royal",
    )?.uid;
    return (
      legal.find(
        (a) =>
          a.type === "attack" && role(a.uid, "Founder") && a.target === target,
      ) ?? null
    );
  }
  if (g.lesson === 5)
    return (
      legal.find(
        (a) =>
          a.type === "marry" &&
          card(p.hand.find((r) => r.uid === a.uid)!.card).house ===
            "plantagenet",
      ) ?? null
    );
  if (g.lesson === 6)
    return legal.find((a) => a.type === "estate") ?? { type: "end" };
  if (g.lesson === 8) return legal.find((a) => a.type === "claim") ?? null;
  return { type: "end" };
}
export function lessonText(g: Duel): string {
  const p = g.players[0];
  if (g.pending?.defender === 0) {
    if (g.pending.blocked)
      return `Brace blocks ${g.pending.blocked} damage from this attack. Resolve combat now to save your remaining gold.`;
    const attacker = g.players[g.pending.actor].court.find(
      (r) => r.uid === g.pending!.attacker,
    )!;
    const defender = p.court.find((r) => r.uid === g.pending!.target)!;
    const damage = attackForce(g.players[g.turn], attacker);
    return `${card(attacker.card).name} attacks ${card(defender.card).name} for ${damage}. David has ${defender.hp} health. Brace costs 2 gold and blocks 2 damage, leaving ${Math.max(0, defender.hp - Math.max(0, damage - 2))} health. Choose Brace below.`;
  }
  if (g.lesson === 7)
    return `Your claim costs ${claimCost(p)} gold. Save ${claimCost(p) + 4} to keep 4 for two Braces. You have ${p.gold}. End your turn to receive ${income(p)} income on your next turn. History is paused during this guided match.`;
  const move = lessonMove(g);
  if (move?.type === "deploy") {
    const r = p.hand.find((r) => r.uid === move.uid)!;
    return `${LESSONS[g.lesson - 1].text} ${g.lesson === 4 ? `Your Queen costs ${cost(p, r)} gold and one order.` : ""}`;
  }
  return LESSONS[g.lesson - 1].text;
}
export function lessonOutcome(g: Duel): string {
  const p = g.players[0],
    guard = p.court.find((r) => card(r.card).role === "Lawgiver");
  const outcomes = [
    `David I now protects your court. You have ${p.gold} gold and ${g.orders} order left.`,
    `The captured Steward is in your hand. Kenneth keeps the damage from that exchange until your next turn.`,
    `David I survived with ${guard?.hp} health. You spent 2 gold and your response. He remains in your court and recovers when your next turn begins.`,
    `Your Queen is in court. The captured Steward can now join your family through marriage.`,
    `The gold link marks the marriage. If your Queen leaves, her spouse stops counting toward your family.`,
    `Your estate is on the board. Each future income payment includes its extra 2 gold.`,
    `You have ${p.gold} gold: enough to claim and keep two Braces in reserve.`,
    `Your claim is active. Both rival Houses must finish a turn before you can win.`,
    `You held the crown through both rivals’ turns. In a full game, history also advances: secure your dynasty before Eudoxia completes a painting.`,
  ];
  return outcomes[g.lesson - 1];
}
export function lessonOpponent(g: Duel): Move {
  if (((g.lesson === 3 && g.turn === 1) || g.lesson === 9) && g.orders === 2) {
    const target = g.players[0].court.find(
      (r) => card(r.card).role === "Lawgiver",
    )?.uid;
    const attack = moves(g).find(
      (a) => a.type === "attack" && a.target === target,
    );
    if (attack) return attack;
  }
  return { type: "end" };
}
