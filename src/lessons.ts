import { CARDS, type HouseId, type Role } from "./content";
import {
  createDuel,
  spec,
  claimCost,
  dynastyCount,
  type Duel,
  type Move,
  type Royal,
} from "./duel";

export const LESSONS = [
  {
    title: "A seat at the table",
    text: "You are House Alba, nearest you. Your cards are Royals; those in your hand are concealed Outlaws. Select David I, then play him into your court. It costs 2 gold and one of your two orders. Guardians enter Ready and protect your other pieces.",
    task: "Play your Guardian",
    types: ["deploy"],
  },
  {
    title: "See the outcome before you act",
    text: "Ready Royals can attack. Most Royals enter Resting; Guardians and Swift Commanders enter Ready. Resting Royals wait until your next turn, but can still defend themselves. At the start of your turn, clear damage and ready your Royals. Select your Founder, then the rival Guardian. The preview shows damage to both cards. With no gold, this rival cannot interrupt.",
    task: "Attack the Guardian",
    types: ["attack"],
  },
  {
    title: "Your turn to intervene",
    text: "A rival is attacking your Guardian for 4 damage. Your Guardian has 3 health. Brace costs 2 gold and blocks 2 damage, leaving 1 health. The response marker is spent until the next rival’s turn.",
    task: "Brace to save your Guardian",
    types: [],
  },
  {
    title: "A Royal changes hands",
    text: "Defeat this Royal while your attacker survives to capture it. Watch it leave the rival court and arrive in your hand. If both Royals fall, both go to their owners’ discard piles instead.",
    task: "Capture the rival Steward",
    types: ["attack"],
  },
  {
    title: "A marriage builds a family",
    text: "A foreign Royal does not count toward your family alone. Your Queen can marry one foreign Royal from your hand. Select the foreign card and arrange the marriage. If the Queen leaves, her spouse loses family membership.",
    task: "Marry the captured Royal",
    types: ["marry"],
  },
  {
    title: "Invest now, earn later",
    text: "An estate costs 3 gold and one order. It adds 2 gold to each future income payment, but a rival can raid it. Build an estate, then end your turn. Watch your income arrive after both rivals have acted.",
    task: "Build an estate, then end your turn",
    types: ["estate", "end"],
  },
  {
    title: "A claim can be broken",
    text: "Three family Royals make you eligible to claim; they do not win automatically. Pay for the crown, then end your turn. Your exposed Steward has only 1 health. Watch the rival seize it and break your claim.",
    task: "Claim the crown, then end your turn",
    types: ["claim", "end"],
  },
  {
    title: "Hold the crown",
    text: "This time a Guardian protects your family. You have enough gold to claim and keep 4 gold in reserve. Claim, end your turn, then Brace against each rival. Your Guardian must survive both attacks. Every rival gets one complete turn.",
    task: "Claim, then defend against both Houses",
    types: ["claim", "end"],
  },
  {
    title: "A fresh inheritance",
    text: "A hand full of foreign Royals can leave you without a path to a family. Renew hand costs one order and 2 gold. Discard your entire concealed hand and draw five replacements. You give up the cards you were saving, including any Ambush.",
    task: "Renew your concealed hand",
    types: ["recruit"],
  },
  {
    title: "History waits for no House",
    text: "This practice position is one fragment away from Eudoxia completing a painting. Nobody has secured a crown. End the round to see the public history event and the shared loss. In a full game, secure your dynasty before a painting is complete.",
    task: "End the round and watch history",
    types: ["end"],
  },
];

export function createLesson(index = 0): Duel {
  const g = createDuel({
    seed: 1306 + index,
    house: "alba",
    houses: ["alba", "plantagenet", "tudor"],
    seats: 3,
    mode: "lesson",
  });
  g.lesson = index + 1;
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
  if (index === 0) p.hand = [royal("alba", "Lawgiver")];
  if (index === 1) {
    q.court = [royal("plantagenet", "Lawgiver")];
    q.court[0].hp = 3;
  }
  if (index === 2) {
    p.court = [royal("alba", "Lawgiver")];
    p.court[0].hp = 3;
    p.gold = 2;
    g.turn = 1;
    g.orders = 1;
    g.pending = {
      actor: 1,
      defender: 0,
      attacker: q.court[0].uid,
      target: p.court[0].uid,
    };
    q.court[0].ready = false;
  }
  if (index === 3) {
    q.court = [royal("plantagenet", "Royal")];
    q.court[0].hp = 1;
  }
  if (index === 4) {
    p.court.push(royal("alba", "Queen"));
    p.hand = [royal("plantagenet", "Royal")];
  }
  if (index === 6 || index === 7) {
    p.court.push(
      royal("alba", index === 6 ? "Royal" : "Lawgiver"),
      royal("alba", "Queen"),
    );
    if (index === 6) p.court[1].hp = 1;
    p.gold = claimCost(p) + (index === 7 ? 4 : 0);
    if (index === 7) v.court = [royal("tudor", "Warlord")];
  }
  if (index === 8)
    p.hand = [
      royal("plantagenet", "Royal"),
      royal("tudor", "Queen"),
      royal("tudor", "Royal"),
      royal("plantagenet", "Queen"),
      royal("tudor", "Intriguer"),
    ];
  if (index === 9) {
    g.round = 4;
    g.witness = 24;
  }
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
  return g;
}
export function lessonComplete(g: Duel) {
  const p = g.players[0],
    i = g.lesson - 1;
  if (i === 0) return p.court.length === 2;
  if (i === 1) return !g.pending && g.events.some((e) => e.kind === "combat");
  if (i === 2) return !g.pending && p.court.some((r) => r.hp === 1);
  if (i === 3)
    return g.events.some((e) => e.kind === "capture" && e.actor === 0);
  if (i === 4) return dynastyCount(p) === 3;
  if (i === 5) return p.estates === 1 && g.round === 2 && g.turn === 0;
  if (i === 6)
    return g.events.some((e) => e.kind === "broken" && e.actor === 0);
  if (i === 7) return g.over && g.winner === 0;
  if (i === 8) return g.events.some((e) => e.kind === "recruit");
  return g.over && g.winner === -1;
}
export function lessonOpponent(g: Duel): Move {
  if (g.lesson >= 7 && g.orders === 2 && g.players[0].claim) {
    const p = g.players[g.turn],
      t = g.players[0].court.find((r) =>
        g.lesson === 8
          ? CARDS.find((c) => c.id === r.card)?.role === "Lawgiver"
          : r.hp === 1,
      );
    if (t && p.court[0]?.ready)
      return { type: "attack", uid: p.court[0].uid, target: t.uid };
  }
  return { type: "end" };
}
