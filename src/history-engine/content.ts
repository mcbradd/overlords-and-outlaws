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
        revision: 2,
        kind: "noble",
        printed: {
          name: c.name,
          dynasty,
          queen: queens[dynasty].includes(n),
          founder: n === 0,
          branch: dynasty === "alba" ? branch(n) : undefined,
          collector: index + 1,
        },
        cardText: [
          "Actions cost 1 seal.",
          "Hand: Recruit into your Court if this is your Dynasty; Recall a rival's Court Noble of this Dynasty; Block a Recall against a Noble of this Dynasty.",
          "Hand: Trade; Lend when a Crisis asks; discard to Cover a painting fragment.",
          "Court: Withdraw to your hand; Challenge a Crisis if in your Bloodline and ready.",
          queens[dynasty].includes(n)
            ? "Marry: Pair this unmarried Queen in your Court with an unpaired foreign Noble in your hand or Court. This Queen must be of your Dynasty."
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
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
  revision: 2,
  kind,
  printed: { name, dynasty },
  cardText,
  reminderRefs,
  historicalNote:
    "Counterfactual institutional game design; not an assertion that these people or events coexisted.",
  evidenceRefs: ["docs/HISTORY-ENGINE-IMPLEMENTATION-SPEC.md"],
  artRef: "",
});
// Authored operative English is the source; no card ID selects behavior.
export const LAW_CARDS: CardSource[] = [
  record(
    "law-alba",
    "alba",
    "Recognition of the Kindreds",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 2 other Court Nobles of your Dynasty from different branches as heirs.",
      "Keep your Ruler and at least 1 named heir until the Ruler changes.",
      "In 1 round, at its start: Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler in your Bloodline for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost.",
    ].join("\n"),
    ["crown"],
  ),
  record(
    "law-plantagenet",
    "plantagenet",
    "The Charter",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 1 other Court Noble of your Dynasty as heir.",
      "Choose a different Court Noble of your Dynasty, not your Ruler, as Witness.",
      "Keep your Ruler, heir and Witness until the Ruler changes.",
      "In 1 round, at its start: Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler and Witness in your Bloodline for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost.",
    ].join("\n"),
    ["crown"],
  ),
  record(
    "law-tudor",
    "tudor",
    "The Act of Succession",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 1 hand Noble of your Dynasty as heir. Set the heir aside face down.",
      "Keep your Ruler and hidden heir until the Ruler changes.",
      "In 1 round, at its start: Reveal your heir. Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler in your Bloodline for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost. Return any hidden heir face up to your hand.",
    ].join("\n"),
    ["crown"],
  ),
  record(
    "law-habsburg",
    "habsburg",
    "The Marriage Settlement",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 1 foreign Court Noble married to your Queen as heir. The Queen must be of your Dynasty, not your Ruler.",
      "Keep your Ruler, heir and their marriage until the Ruler changes.",
      "In 1 round, at its start: Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler in your Bloodline and the same marriage intact for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost.",
    ].join("\n"),
    ["crown", "marriage"],
  ),
];
const next = "Ends at round end, after 1 more round.";
const starts = "Starts at round end unless prevented.";
const carry = "Earlier help still counts.";
const end = "End early: Complete the Prevent condition.";
const attack =
  "Prevent: Together, Challenge with 2 different ready Court Nobles in your Bloodline, one per action.";
export const INTERREGNA: CardSource[] = [
  record(
    "A1",
    "alba",
    "Contested Recognition",
    "interregnum",
    [
      "Prevent: Each player Lends 1 hand Noble of their Dynasty using Help.",
      starts,
      "While active: No player may Claim the Crown.",
      end,
      carry,
      next,
    ].join("\n"),
    ["commit"],
  ),
  record(
    "A2",
    "alba",
    "Border Rising",
    "interregnum",
    [
      attack,
      starts,
      "At round start: Each player with a Ruler chooses 1 other Court Noble in their Bloodline, if able. Retire those Nobles to The Past together.",
      next,
    ].join("\n"),
    ["attack"],
  ),
  record(
    "A3",
    "alba",
    "A Broken Recognition",
    "interregnum",
    [
      "Prevent: At reveal, mark players with foreign Court Nobles outside their Bloodline. Each must Marry one of those Nobles.",
      starts,
      "When this starts: Return all foreign Court Nobles outside their Bloodlines to their controllers' hands together.",
      "Then end this event.",
    ].join("\n"),
  ),
  record(
    "P1",
    "plantagenet",
    "The Barons’ Terms",
    "interregnum",
    [
      "Prevent: Each player turns 1 ready Court Noble of their Dynasty sideways using Help.",
      starts,
      "While active: To Block, also turn 1 ready Court Noble of your Dynasty sideways.",
      next,
    ].join("\n"),
  ),
  record(
    "P2",
    "plantagenet",
    "A Disputed Charter",
    "interregnum",
    [
      attack,
      starts,
      "When this starts: The Crown holder chooses 1 Court Noble in their Bloodline other than their Ruler, if able. Return that Noble to their hand.",
      "Then end this event.",
    ].join("\n"),
    ["attack"],
  ),
  record(
    "P3",
    "plantagenet",
    "Closed Roads",
    "interregnum",
    [
      "Prevent: Together, Lend 2 hand Nobles of different Dynasties using Help, one per action.",
      starts,
      "While active: Use the Draw action only with an empty hand.",
      end,
      carry,
      next,
    ].join("\n"),
    ["commit"],
  ),
  record(
    "T1",
    "tudor",
    "The Unsettled Church",
    "interregnum",
    [
      "Prevent: Each player Lends 1 hand Noble using Help.",
      starts,
      "While active: No player may Marry.",
      next,
    ].join("\n"),
    ["commit"],
  ),
  record(
    "T2",
    "tudor",
    "A Rival Proclamation",
    "interregnum",
    [
      attack,
      starts,
      "When this starts: Each player chooses 1 Court Noble of their Dynasty other than their Ruler, if able. Return those Nobles to their controllers' hands together.",
      "Then end this event.",
    ].join("\n"),
    ["attack"],
  ),
  record(
    "T3",
    "tudor",
    "The Open Record",
    "interregnum",
    [
      "Prevent: Each player completes Trade or Cover after this is revealed. A Trade counts for both players.",
      starts,
      "At round start: Reveal 1 extra History card.",
      next,
    ].join("\n"),
  ),
  record(
    "H1",
    "habsburg",
    "The Divided Inheritance",
    "interregnum",
    [
      "Prevent: At reveal, mark players with marriages. Each marked player Lends 1 hand Noble using Help.",
      starts,
      "When this starts: Each player chooses 1 marriage they control, if able. Break those marriages together.",
      "Then end this event.",
    ].join("\n"),
    ["commit"],
  ),
  record(
    "H2",
    "habsburg",
    "War of the Succession",
    "interregnum",
    [
      attack,
      starts,
      "While active: When a Crown claim must change Ruler, it fails. Lose that Crown claim; keep the current Ruler.",
      "End early: Together, Challenge with 2 different ready Court Nobles in your Bloodline, one per action.",
      carry,
      next,
    ].join("\n"),
    ["attack"],
  ),
  record(
    "H3",
    "habsburg",
    "The Imperial Settlement",
    "interregnum",
    [
      "Prevent: Together, Lend 2 hand Nobles of different Dynasties using Help, one per action.",
      starts,
      "At round start: Each player with no marriage chooses 1 hand Noble, if able. Lend those Nobles together. These loans do not count as Help.",
      end,
      carry,
      next,
    ].join("\n"),
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
      "painting-" + dynasty + "-" + (i + 1),
      dynasty,
      PAINTING_NAMES[dynasty] + " · " + (i + 1),
      "fragment",
      "Reveal: Place this fragment in slot " +
        (i + 1) +
        " of its painting.\nIf 6 fragments of this painting are uncovered, Eudoxia wins immediately. All players lose.",
    ),
    printed: {
      name: PAINTING_NAMES[dynasty] + " · " + (i + 1),
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
export const CONTENT_VERSION =
  "r4-" + hash(SOURCES.map((s) => MANIFEST[s.id].sourceHash));
export const noble = (id: string) => SOURCE[id];
export const dynastyOf = (id: string): Dynasty => SOURCE[id].printed.dynasty;
export const nameOf = (id: string) => SOURCE[id]?.printed.name ?? id;
export const program = (id: string) => MANIFEST[id].ast;
