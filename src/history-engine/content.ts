import { CARDS } from "../content";
import { CHARACTER_ART } from "../character-art";
import { compileCard, hash } from "./compiler";
import { MODULES, type CardSource, type Dynasty } from "./types";

const excluded = new Set([
  "alba-11",
  "plantagenet-12",
  "tudor-10",
  "habsburg-12",
]);
const queens: Record<Dynasty, number[]> = {
  alba: [1, 8, 13],
  plantagenet: [1, 8, 11, 13],
  tudor: [1, 3, 5, 9, 13],
  habsburg: [1, 7, 8, 13],
};
const branch = (n: number) =>
  [0, 12].includes(n)
    ? "Alpin"
    : [7, 8, 9].includes(n)
      ? "Bruce–Stewart"
      : "Dunkeld";
export const NOBLES: CardSource[] = MODULES.flatMap((dynasty) =>
  CARDS.filter((c) => c.house === dynasty && !excluded.has(c.id)).map(
    (c, index) => {
      const n = Number(c.id.split("-")[1]);
      return {
        id: c.id,
        revision: 1,
        kind: "noble",
        printed: {
          name: c.name,
          dynasty,
          queen: queens[dynasty].includes(n),
          founder: n === 0,
          branch: dynasty === "alba" ? branch(n) : undefined,
          collector: index + 1,
        },
        cardText: "",
        reminderRefs: ["bloodline"],
        historicalNote:
          "Game offices and marriages explore counterfactual arrangements; the archive distinguishes documented titles and relationships. Historical titles require editorial verification before print.",
        evidenceRefs: ["docs/research/CHARACTER-PORTRAIT-EVIDENCE-AUDIT.md"],
        artRef: CHARACTER_ART[c.id],
      };
    },
  ),
);
const record = (
  id: string,
  dynasty: Dynasty,
  name: string,
  kind: CardSource["kind"],
  cardText: string,
  reminderRefs: string[] = [],
): CardSource => ({
  id,
  revision: 1,
  kind,
  printed: { name, dynasty },
  cardText,
  reminderRefs,
  historicalNote:
    "Counterfactual institutional game design; not an assertion that these people or events coexisted.",
  evidenceRefs: ["docs/HISTORY-ENGINE-IMPLEMENTATION-SPEC.md"],
  artRef: "",
});
// Authored operative English is the source. The compiler, never the card ID,
// selects executable conditions, restrictions and effects.
export const LAW_CARDS: CardSource[] = [
  record(
    "law-alba",
    "alba",
    "Recognition of the Kindreds",
    "law",
    "At Proclaim, name two native heirs from different printed branches, distinct from your Ruler. Maintain your old Ruler and at least one named heir until succession. At succession, choose a remaining named heir. Retire the old Ruler and install that heir. Maintain the supported successor through settlement.",
    ["crown"],
  ),
  record(
    "law-plantagenet",
    "plantagenet",
    "The Charter",
    "law",
    "At Proclaim, name a native heir and a different native Charter Witness, both distinct from your Ruler. Maintain your old Ruler, heir and Witness until succession. At succession, Retire the old Ruler and install the heir. Maintain the supported successor and the same native Witness through settlement.",
    ["crown"],
  ),
  record(
    "law-tudor",
    "tudor",
    "The Act of Succession",
    "law",
    "At Proclaim, seal one native Outlaw as heir, distinct from your Ruler. Maintain your old Ruler and sealed heir until succession. At succession, Reveal the sealed heir, verify its native Dynasty, Retire the old Ruler and place the heir in Court as Ruler. Maintain the supported native successor through settlement.",
    ["crown"],
  ),
  record(
    "law-habsburg",
    "habsburg",
    "The Marriage Settlement",
    "law",
    "At Proclaim, name a foreign heir married to your native Queen, who is not your Ruler. Maintain your old Ruler, heir and that marriage until succession. At succession, Retire the old Ruler and install the heir. Maintain the supported successor and the same marriage through settlement.",
    ["crown", "marriage"],
  ),
];
const next = "Expire at the end of the next round after activation.";
const carry = "Carry pending contributions into active play.";
const end = "End: Complete this card’s Avert condition through Address.";
const attack = "Avert: Attack: Muster and Secure with different Noble IDs.";
export const INTERREGNA: CardSource[] = [
  record(
    "A1",
    "alba",
    "Contested Recognition",
    "interregnum",
    `Avert: Each player Commits one native Outlaw through Address.\nWhile active: No player may Proclaim.\n${end}\n${carry}\n${next}`,
    ["commit"],
  ),
  record(
    "A2",
    "alba",
    "Border Rising",
    "interregnum",
    `${attack}\nAt the start of each round: Each player with a Ruler chooses one other supported Overlord, if able. Retire the chosen Overlords simultaneously, preserving at least two native Overlords per player.\n${next}`,
    ["attack"],
  ),
  record(
    "A3",
    "alba",
    "A Broken Recognition",
    "interregnum",
    "Avert: At reveal, freeze players with unsupported foreign Overlords. Each restores a marriage to one of those Overlords through Marry.\nOn activation: Return all unsupported foreign Overlords to their controllers’ hands simultaneously.\nThen Expire.",
  ),
  record(
    "P1",
    "plantagenet",
    "The Barons’ Terms",
    "interregnum",
    `Avert: Each player Rotates one ready native Overlord through Address.\nWhile active: Counterclaim also requires rotating one ready native Overlord.\n${next}`,
  ),
  record(
    "P2",
    "plantagenet",
    "A Disputed Charter",
    "interregnum",
    `${attack}\nOn activation: The Crown controller chooses one eligible non-Ruler Crown dependency, if able. Return it to their hand.\nThen Expire.`,
    ["attack"],
  ),
  record(
    "P3",
    "plantagenet",
    "Closed Roads",
    "interregnum",
    `Avert: Commit Nobles of two different printed Dynasties through Address, one per action.\nWhile active: A player may Petition only with no Outlaws in hand.\n${end}\n${carry}\n${next}`,
    ["commit"],
  ),
  record(
    "T1",
    "tudor",
    "The Unsettled Church",
    "interregnum",
    `Avert: Each player Commits one Outlaw through Address.\nWhile active: No player may Marry.\n${next}`,
    ["commit"],
  ),
  record(
    "T2",
    "tudor",
    "A Rival Proclamation",
    "interregnum",
    `${attack}\nOn activation: Each player chooses one non-Ruler native Overlord, if able. Return the chosen Overlords simultaneously.\nThen Expire.`,
    ["attack"],
  ),
  record(
    "T3",
    "tudor",
    "The Open Record",
    "interregnum",
    `Avert: After reveal, each player completes Barter or Veil.\nAt the start of each round: Reveal one additional History card publicly.\n${next}`,
  ),
  record(
    "H1",
    "habsburg",
    "The Divided Inheritance",
    "interregnum",
    "Avert: At reveal, freeze players with marriages. Each Commits one Outlaw through Address.\nOn activation: Each player chooses one marriage they control, if able. Break the chosen marriages simultaneously.\nThen Expire.",
    ["commit"],
  ),
  record(
    "H2",
    "habsburg",
    "War of the Succession",
    "interregnum",
    `${attack}\nWhile active: Scheduled Crown succession is forbidden.\nEnd: Attack: Muster and Secure with different Noble IDs.\n${carry}\n${next}`,
    ["attack"],
  ),
  record(
    "H3",
    "habsburg",
    "The Imperial Settlement",
    "interregnum",
    `Avert: Commit Nobles of two different printed Dynasties through Address, one per action.\nAt the start of each round: Each player with no marriage chooses one Outlaw, if able. Commit the chosen Outlaws simultaneously.\n${end}\n${carry}\n${next}`,
    ["commit"],
  ),
];
export const PAINTING_NAMES: Record<Dynasty, string> = {
  alba: "The Kindreds at Scone",
  plantagenet: "The Witness to the Charter",
  tudor: "The Sealed Intention",
  habsburg: "The Marriage Settlement",
};
export const PAINTING_ART: Record<Dynasty, string> = {
  alba: "art/court.webp",
  plantagenet: "art/wolves.webp",
  tudor: "art/witness.webp",
  habsburg: "art/last-witness.webp",
};
export const FRAGMENTS: CardSource[] = MODULES.flatMap((dynasty) =>
  Array.from({ length: 6 }, (_, i) => ({
    ...record(
      `painting-${dynasty}-${i + 1}`,
      dynasty,
      `${PAINTING_NAMES[dynasty]} · ${i + 1}`,
      "fragment",
      `Place this fragment in slot ${i + 1} of its painting. If all six fragments are present and unveiled, Eudoxia wins.`,
    ),
    printed: {
      name: `${PAINTING_NAMES[dynasty]} · ${i + 1}`,
      dynasty,
      slot: i + 1,
    },
    artRef: PAINTING_ART[dynasty],
  })),
);
export const SOURCES = [...NOBLES, ...LAW_CARDS, ...INTERREGNA, ...FRAGMENTS];
export const SOURCE = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
export const MANIFEST = Object.fromEntries(
  SOURCES.map((s) => [s.id, compileCard(s)]),
);
export const CONTENT_VERSION = `r3-${hash(SOURCES.map((s) => MANIFEST[s.id].sourceHash))}`;
export const noble = (id: string) => SOURCE[id];
export const dynastyOf = (id: string): Dynasty => SOURCE[id].printed.dynasty;
export const nameOf = (id: string) => SOURCE[id]?.printed.name ?? id;
export const program = (id: string) => MANIFEST[id].ast;
