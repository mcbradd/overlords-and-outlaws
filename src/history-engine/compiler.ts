import type {
  CardSource,
  CompiledCard,
  Condition,
  Effect,
  LawProgram,
  Program,
  Restriction,
  Route,
} from "./types";

// Finite, fail-closed English. The printed clauses are the executable source.
export const LANGUAGE_VERSION = "2.0.0";
export const COMPILER_VERSION = "2.0.0";
export const INTERPRETER_VERSION = "2.0.0";
export const REMINDERS: Record<string, string> = {
  attack:
    "Challenge spends 1 seal and turns 1 ready Court Noble in your Bloodline sideways. Each contribution needs a different Noble; players may cooperate.",
  commit:
    "Lend moves a hand Noble face up to Leverage. It returns to your hand at the next round start.",
  marriage:
    "Your Queen supports a foreign spouse. Both must be in your Court. Losing either breaks the marriage.",
  crown:
    "Claim the Crown, change Ruler after the printed wait, then keep the required people for the printed number of full rounds.",
  bloodline:
    "Your Bloodline is your Court Nobles of your Dynasty plus foreign Nobles married to your Queens. Hand Nobles are called Outlaws; Court Nobles are called Overlords.",
};
export const CONDITIONS: Record<Condition, string> = {
  "seats-native": "Each player Lends 1 hand Noble of their Dynasty using Help.",
  attack:
    "Together, Challenge with 2 different ready Court Nobles in your Bloodline, one per action.",
  "restore-marriage":
    "At reveal, mark players with foreign Court Nobles outside their Bloodline. Each must Marry one of those Nobles.",
  "seats-rotate":
    "Each player turns 1 ready Court Noble of their Dynasty sideways using Help.",
  dynasties:
    "Together, Lend 2 hand Nobles of different Dynasties using Help, one per action.",
  "seats-any": "Each player Lends 1 hand Noble using Help.",
  "barter-or-veil":
    "Each player completes Trade or Cover after this is revealed. A Trade counts for both players.",
  "married-seats":
    "At reveal, mark players with marriages. Each marked player Lends 1 hand Noble using Help.",
};
export const RESTRICTIONS: Record<Restriction, string> = {
  proclaim: "No player may Claim the Crown.",
  "counterclaim-rotate":
    "To Block, also turn 1 ready Court Noble of your Dynasty sideways.",
  "petition-with-hand": "Use the Draw action only with an empty hand.",
  marry: "No player may Marry.",
  succession:
    "When a Crown claim must change Ruler, it fails. Lose that Crown claim; keep the current Ruler.",
};
export const EFFECTS: Record<Effect, string> = {
  "retire-supported":
    "Each player with a Ruler chooses 1 other Court Noble in their Bloodline, if able. Retire those Nobles to The Past together.",
  "return-unsupported":
    "Return all foreign Court Nobles outside their Bloodlines to their controllers' hands together.",
  "return-dependency":
    "The Crown holder chooses 1 Court Noble in their Bloodline other than their Ruler, if able. Return that Noble to their hand.",
  "return-native":
    "Each player chooses 1 Court Noble of their Dynasty other than their Ruler, if able. Return those Nobles to their controllers' hands together.",
  history: "Reveal 1 extra History card.",
  "break-marriage":
    "Each player chooses 1 marriage they control, if able. Break those marriages together.",
  "commit-unmarried":
    "Each player with no marriage chooses 1 hand Noble, if able. Lend those Nobles together. These loans do not count as Help.",
  "blood-edict":
    "Each player chooses 1 Court Noble whose Dynasty matches a rival's Court Noble. Retire the chosen Nobles together.",
};
const nobleHand: [string, string][] = [
  ["build", "Recruit into your Court if this is your Dynasty"],
  ["claim", "Recall a rival's Court Noble of this Dynasty"],
  ["counterclaim", "Block a Recall against a Noble of this Dynasty"],
  ["barter", "Trade"],
  ["commit", "Lend when a Crisis asks"],
  ["veil", "discard to Cover a painting fragment"],
];
const nobleCourt: [string, string][] = [
  ["withdraw", "Withdraw to your hand"],
  ["attack", "Challenge a Crisis if in your Bloodline and ready"],
];
const marriageClause =
  "Marry: Pair this unmarried Queen in your Court with an unpaired foreign Noble in your hand or Court. This Queen must be of your Dynasty.";
const costClause = "Actions cost 1 seal.";
const activationClause = "Starts at round end unless prevented.";
const carryClause = "Earlier help still counts.";
const failureClause =
  "Fail: Lose the Crown if a required Noble or marriage is lost.";
const witnessClause =
  "Choose a different Court Noble of your Dynasty, not your Ruler, as Witness.";
const keepClauses: Record<LawProgram["keep"], string> = {
  "any-heir":
    "Keep your Ruler and at least 1 named heir until the Ruler changes.",
  heir: "Keep your Ruler and hidden heir until the Ruler changes.",
  "heir-witness": "Keep your Ruler, heir and Witness until the Ruler changes.",
  "heir-marriage":
    "Keep your Ruler, heir and their marriage until the Ruler changes.",
};
function rounds(count: number) {
  return count + " round" + (count === 1 ? "" : "s");
}
function lawText(law: LawProgram): string {
  const h = law.heir;
  const choice =
    h.zone === "hand"
      ? "Choose " +
        h.count +
        " hand Noble of your Dynasty as heir. Set the heir aside face down."
      : h.zone === "marriage"
        ? "Choose " +
          h.count +
          " foreign Court Noble married to your Queen as heir. The Queen must be of your Dynasty, not your Ruler."
        : "Choose " +
          h.count +
          " other Court Noble" +
          (h.count === 1 ? "" : "s") +
          " of your Dynasty" +
          (h.differentBranches ? " from different branches" : "") +
          " as heir" +
          (h.count === 1 ? "" : "s") +
          ".";
  const win =
    law.witness === "native"
      ? "your new Ruler and Witness in your Bloodline"
      : law.witness === "marriage"
        ? "your new Ruler in your Bloodline and the same marriage intact"
        : "your new Ruler in your Bloodline";
  return [
    "Claim the Crown: Have " +
      law.entryNatives +
      " Court Nobles of your Dynasty, including your Ruler.",
    choice,
    law.witness === "native" ? witnessClause : "",
    keepClauses[law.keep],
    "In " +
      rounds(law.successionAfter) +
      ", at its start: " +
      (h.zone === "hand" ? "Reveal your heir. " : "") +
      "Retire your Ruler. Crown a remaining named heir.",
    "Win: Keep " +
      win +
      " for " +
      law.reignRounds +
      " full round" +
      (law.reignRounds === 1 ? "" : "s") +
      ".",
    failureClause +
      (h.zone === "hand"
        ? " Return any hidden heir face up to your hand."
        : ""),
  ]
    .filter(Boolean)
    .join("\n");
}
export const LAWS: Record<Exclude<Route, "regency">, string> = {
  kindreds: lawText({
    entryNatives: 3,
    heir: { count: 2, zone: "court", native: true, differentBranches: true },
    witness: null,
    keep: "any-heir",
    successionAfter: 1,
    reignRounds: 1,
  }),
  charter: lawText({
    entryNatives: 3,
    heir: { count: 1, zone: "court", native: true, differentBranches: false },
    witness: "native",
    keep: "heir-witness",
    successionAfter: 1,
    reignRounds: 1,
  }),
  act: lawText({
    entryNatives: 3,
    heir: { count: 1, zone: "hand", native: true, differentBranches: false },
    witness: null,
    keep: "heir",
    successionAfter: 1,
    reignRounds: 1,
  }),
  marriage: lawText({
    entryNatives: 3,
    heir: {
      count: 1,
      zone: "marriage",
      native: false,
      differentBranches: false,
    },
    witness: "marriage",
    keep: "heir-marriage",
    successionAfter: 1,
    reignRounds: 1,
  }),
};
// Compatibility fingerprint, not a cryptographic signature.
export function hash(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  let h = 2166136261;
  for (let i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}
export const DICTIONARY_HASH = hash({
  CONDITIONS,
  RESTRICTIONS,
  EFFECTS,
  LAWS,
  nobleHand,
  nobleCourt,
  marriageClause,
  costClause,
  activationClause,
  carryClause,
  keepClauses,
  failureClause,
});
export interface Diagnostic {
  code: string;
  severity: "error" | "warning";
  contentId: string;
  filename: string;
  line: number;
  column: number;
  text: string;
  suggestion: string;
}
export class CardTextError extends Error {
  constructor(public diagnostics: Diagnostic[]) {
    super(
      diagnostics
        .map(
          (d) =>
            d.filename +
            ":" +
            d.line +
            ":" +
            d.column +
            " " +
            d.code +
            " " +
            d.text,
        )
        .join("\n"),
    );
  }
}
const entries = <T extends string>(r: Record<T, string>) =>
  Object.entries(r) as [T, string][];
function conditionText(p: Program): string {
  if (!p.condition) return "";
  return ["attack", "dynasties"].includes(p.condition)
    ? CONDITIONS[p.condition].replace("2", String(p.requiredContributions))
    : CONDITIONS[p.condition];
}
export function canonicalText(p: Program, kind: CardSource["kind"]): string {
  if (kind === "noble") {
    const has = (a: [string, string]) => p.abilities?.includes(a[0]);
    const hand = [nobleHand.slice(0, 3), nobleHand.slice(3)].map((group) =>
      group
        .filter(has)
        .map(([, text]) => text)
        .join("; "),
    );
    const court = nobleCourt
      .filter(has)
      .map(([, text]) => text)
      .join("; ");
    return [
      costClause,
      ...hand.map((text) => (text ? "Hand: " + text + "." : "")),
      court ? "Court: " + court + "." : "",
      p.abilities?.includes("marry") ? marriageClause : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (kind === "law" && p.law) return lawText(p.law);
  if (p.fragment)
    return (
      "Reveal: Place this fragment in slot " +
      p.fragment +
      " of its painting.\nIf " +
      p.fragmentGoal +
      " fragments of this painting are uncovered, Eudoxia wins immediately. All players lose."
    );
  return [
    p.condition ? "Prevent: " + conditionText(p) : "",
    activationClause,
    ...p.restrictions.map((r) => "While active: " + RESTRICTIONS[r]),
    ...p.instructions.map(
      (i) =>
        (i.timing === "activation" ? "When this starts" : "At round start") +
        ": " +
        EFFECTS[i.effect],
    ),
    p.end
      ? p.end === "attack"
        ? "End early: " + conditionText(p)
        : "End early: Complete the Prevent condition."
      : "",
    p.carry ? carryClause : "",
    p.expiry === "immediate"
      ? "Then end this event."
      : p.expiry === "next-end"
        ? "Ends at round end, after " +
          p.expiryAfter +
          " more round" +
          (p.expiryAfter === 1 ? "" : "s") +
          "."
        : "",
  ]
    .filter(Boolean)
    .join("\n");
}
export function compileCard(
  source: CardSource,
  filename = "src/history-engine/content.ts",
): CompiledCard {
  const errors: Diagnostic[] = [];
  const fail = (
    code: string,
    text: string,
    line = 1,
    suggestion = "Use a supported clause and explicit game terms.",
  ) =>
    errors.push({
      code,
      severity: "error",
      contentId: source.id,
      filename,
      line,
      column: 1,
      text,
      suggestion,
    });
  const bounded = (
    raw: string,
    min: number,
    max: number,
    label: string,
    line: number,
  ) => {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < min || n > max)
      fail(
        "CT004",
        label + " must be an integer from " + min + " to " + max + ".",
        line,
      );
    return n;
  };
  for (const ref of source.reminderRefs)
    if (!REMINDERS[ref]) fail("CT012", "Unknown reminder: " + ref);
  const text = source.cardText.trim();
  const lines = text.split("\n");
  if (!text) fail("CT011", "Every card needs executable Card Text.");
  if (
    !["alba", "plantagenet", "tudor", "habsburg"].includes(
      source.printed.dynasty,
    )
  )
    fail("CT016", "This Dynasty is not in the core ruleset.");
  if (
    /\b(health|damage|gold|mana|Rank III|authority|power total)\b/i.test(text)
  )
    fail("CT010", "Combat statistics are not part of this ruleset.");
  if (/\b(some|several|a few)\b/.test(text))
    fail("CT004", "Use an exact quantity.");
  if (/Discard (an? |the )?(Overlord|Court Noble)/i.test(text))
    fail("CT002", "Only hand cards may be discarded.");
  if (/from The Past|refresh.*seal/i.test(text))
    fail(
      "CT009",
      "The Past is permanent and seals refresh only at round start.",
    );
  if (/change.*printed Dynasty/i.test(text))
    fail("CT005", "Printed Dynasty is immutable.");
  const ast: Program = {
    restrictions: [],
    instructions: [],
    carry: false,
    requiredContributions: 2,
    expiryAfter: 1,
  };
  if (source.kind === "noble") {
    ast.abilities = [];
    let cost = false;
    lines.forEach((line, index) => {
      if (line === costClause && !cost) {
        cost = true;
        return;
      }
      if (line === marriageClause && !ast.abilities!.includes("marry")) {
        ast.abilities!.push("marry");
        return;
      }
      const m = /^(Hand|Court): (.+)\.$/.exec(line);
      if (!m) {
        fail("CT001", line, index + 1);
        return;
      }
      const dictionary = m[1] === "Hand" ? nobleHand : nobleCourt;
      for (const clause of m[2].split("; ")) {
        const ability = dictionary.find(([, t]) => t === clause)?.[0];
        if (!ability || ast.abilities!.includes(ability))
          fail(
            "CT001",
            "Unknown or repeated " + m[1] + " clause: " + clause,
            index + 1,
          );
        else ast.abilities!.push(ability);
      }
    });
    if (!cost || !ast.abilities.length)
      fail("CT006", "A Noble needs the action cost and at least one action.");
    if (
      typeof source.printed.queen !== "boolean" ||
      typeof source.printed.founder !== "boolean" ||
      (source.printed.dynasty === "alba" && !source.printed.branch)
    )
      fail("CT015", "Missing printed role or branch.");
  } else if (source.kind === "law") {
    const law: Partial<LawProgram> = {};
    let declaredWitness = false,
      declaredFailure = false,
      revealHeir = false,
      hiddenRecovery = false;
    let winWitness: LawProgram["witness"] | undefined;
    lines.forEach((line, index) => {
      const ln = index + 1;
      let m: RegExpExecArray | null;
      if (
        (m =
          /^Claim the Crown: Have (\d+) Court Nobles of your Dynasty, including your Ruler\.$/.exec(
            line,
          )) &&
        law.entryNatives === undefined
      )
        law.entryNatives = bounded(m[1], 1, 6, "Entry Nobles", ln);
      else if (
        (m =
          /^Choose (\d+) other Court Nobles? of your Dynasty( from different branches)? as heirs?\.$/.exec(
            line,
          )) &&
        !law.heir
      )
        law.heir = {
          count: bounded(m[1], 1, 3, "Heirs", ln),
          zone: "court",
          native: true,
          differentBranches: !!m[2],
        };
      else if (
        (m =
          /^Choose (\d+) hand Noble of your Dynasty as heir\. Set the heir aside face down\.$/.exec(
            line,
          )) &&
        !law.heir
      )
        law.heir = {
          count: bounded(m[1], 1, 1, "Hidden heirs", ln),
          zone: "hand",
          native: true,
          differentBranches: false,
        };
      else if (
        (m =
          /^Choose (\d+) foreign Court Noble married to your Queen as heir\. The Queen must be of your Dynasty, not your Ruler\.$/.exec(
            line,
          )) &&
        !law.heir
      )
        law.heir = {
          count: bounded(m[1], 1, 1, "Married heirs", ln),
          zone: "marriage",
          native: false,
          differentBranches: false,
        };
      else if (line === witnessClause && !declaredWitness)
        declaredWitness = true;
      else if (
        entries(keepClauses).some(([key, value]) => {
          if (value !== line || law.keep) return false;
          law.keep = key;
          return true;
        })
      ) {
        /* parsed typed maintenance clause */
      } else if (
        (m =
          /^In (\d+) rounds?, at its start: (Reveal your heir\. )?Retire your Ruler\. Crown a remaining named heir\.$/.exec(
            line,
          )) &&
        law.successionAfter === undefined
      ) {
        law.successionAfter = bounded(m[1], 1, 3, "Succession delay", ln);
        revealHeir = !!m[2];
      } else if (
        (m =
          /^Win: Keep (your new Ruler in your Bloodline|your new Ruler and Witness in your Bloodline|your new Ruler in your Bloodline and the same marriage intact) for (\d+) full rounds?\.$/.exec(
            line,
          )) &&
        law.reignRounds === undefined
      ) {
        law.reignRounds = bounded(m[2], 1, 3, "Reign rounds", ln);
        winWitness = m[1].includes("Witness")
          ? "native"
          : m[1].includes("marriage")
            ? "marriage"
            : null;
      } else if (
        (line === failureClause ||
          line ===
            failureClause + " Return any hidden heir face up to your hand.") &&
        !declaredFailure
      ) {
        declaredFailure = true;
        hiddenRecovery = line !== failureClause;
      } else fail("CT001", "Unknown or repeated Law clause: " + line, ln);
    });
    if (
      !law.heir ||
      law.entryNatives === undefined ||
      !law.keep ||
      law.successionAfter === undefined ||
      law.reignRounds === undefined ||
      !declaredFailure
    )
      fail(
        "CT006",
        "A Law needs entry, heirs, maintenance, next Ruler, victory and failure clauses.",
      );
    else {
      law.witness = declaredWitness
        ? "native"
        : law.heir.zone === "marriage"
          ? "marriage"
          : null;
      const route =
        law.heir.zone === "hand"
          ? "act"
          : law.heir.zone === "marriage"
            ? "marriage"
            : declaredWitness
              ? "charter"
              : "kindreds";
      const expectedKeep: Record<typeof route, LawProgram["keep"]> = {
        act: "heir",
        marriage: "heir-marriage",
        charter: "heir-witness",
        kindreds: "any-heir",
      };
      if (
        law.keep !== expectedKeep[route] ||
        winWitness !== law.witness ||
        revealHeir !== (law.heir.zone === "hand") ||
        hiddenRecovery !== (law.heir.zone === "hand") ||
        (declaredWitness && law.heir.zone !== "court") ||
        (route === "charter" &&
          (law.heir.count !== 1 || law.heir.differentBranches)) ||
        (route === "kindreds" && !law.heir.differentBranches)
      )
        fail(
          "CT008",
          "Heir, maintenance, Witness, reveal and victory clauses must agree.",
        );
      ast.law = law as LawProgram;
      ast.route = route;
    }
  } else if (source.kind === "fragment") {
    const m =
      /^Reveal: Place this fragment in slot (\d+) of its painting\.\nIf (\d+) fragments of this painting are uncovered, Eudoxia wins immediately\. All players lose\.$/.exec(
        text,
      );
    if (!m)
      fail(
        "CT001",
        "A fragment needs its printed slot and explicit loss condition.",
      );
    else {
      ast.fragment = bounded(m[1], 1, 6, "Painting slot", 1);
      ast.fragmentGoal = bounded(m[2], 1, 6, "Painting goal", 2);
      if (ast.fragment !== source.printed.slot)
        fail("CT015", "Printed slot differs from executable slot.");
    }
  } else {
    let starts = false;
    lines.forEach((line, index) => {
      const ln = index + 1;
      const c = entries(CONDITIONS).find(([, t]) => line === "Prevent: " + t);
      const r = entries(RESTRICTIONS).find(
        ([, t]) => line === "While active: " + t,
      );
      const e = entries(EFFECTS).find(
        ([, t]) =>
          line === "When this starts: " + t || line === "At round start: " + t,
      );
      let m: RegExpExecArray | null;
      if (c && !ast.condition) ast.condition = c[0];
      else if (
        (m =
          /^Prevent: Together, Challenge with (\d+) different ready Court Nobles in your Bloodline, one per action\.$/.exec(
            line,
          )) &&
        !ast.condition
      ) {
        ast.condition = "attack";
        ast.requiredContributions = bounded(
          m[1],
          1,
          4,
          "Challenge contributions",
          ln,
        );
      } else if (
        (m =
          /^Prevent: Together, Lend (\d+) hand Nobles of different Dynasties using Help, one per action\.$/.exec(
            line,
          )) &&
        !ast.condition
      ) {
        ast.condition = "dynasties";
        ast.requiredContributions = bounded(
          m[1],
          1,
          4,
          "Dynasty contributions",
          ln,
        );
      } else if (line === activationClause && !starts) starts = true;
      else if (r && !ast.restrictions.includes(r[0]))
        ast.restrictions.push(r[0]);
      else if (e) {
        const timing = line.startsWith("When this starts")
          ? "activation"
          : "start";
        if (ast.instructions.some((i) => i.timing === timing))
          fail(
            "CT014",
            "Only one effect per timing is supported; split complex effects into separate cards.",
            ln,
          );
        else ast.instructions.push({ timing, effect: e[0] });
      } else if (
        line === "End early: Complete the Prevent condition." &&
        !ast.end
      )
        ast.end = "condition";
      else if (
        line === "End early: " + conditionText(ast) &&
        ast.condition === "attack" &&
        !ast.end
      )
        ast.end = "attack";
      else if (line === carryClause && !ast.carry) ast.carry = true;
      else if (line === "Then end this event." && !ast.expiry)
        ast.expiry = "immediate";
      else if (
        (m = /^Ends at round end, after (\d+) more rounds?\.$/.exec(line)) &&
        !ast.expiry
      ) {
        ast.expiry = "next-end";
        ast.expiryAfter = bounded(m[1], 1, 3, "Active rounds", ln);
      } else
        fail("CT001", "Unknown, repeated or misplaced clause: " + line, ln);
    });
    if (!ast.condition || !starts || !ast.expiry)
      fail("CT006", "A Crisis needs Prevent, start and expiry clauses.");
    if (
      ast.end &&
      (!ast.carry ||
        (ast.end === "attack" && ast.condition !== "attack") ||
        (ast.end === "condition" && ast.condition === "attack"))
    )
      fail("CT008", "Early ending requires matching retained contributions.");
    if (ast.end && ast.expiry === "immediate")
      fail(
        "CT008",
        "An immediate Crisis has no action window for early ending.",
      );
    if (
      ast.end === "condition" &&
      ast.condition === "restore-marriage" &&
      ast.restrictions.includes("marry")
    )
      fail("CT008", "A Crisis cannot forbid the marriage needed to end it.");
    if (ast.carry && !ast.end)
      fail("CT008", "Retained contributions need an early-ending clause.");
    if (
      ast.expiry === "immediate" &&
      (ast.restrictions.length ||
        ast.instructions.some((i) => i.timing === "start"))
    )
      fail("CT014", "An immediate Crisis cannot have ongoing effects.");
  }
  if (errors.length) throw new CardTextError(errors);
  const canonical = canonicalText(ast, source.kind);
  if (canonical !== text) {
    const line =
      lines.findIndex((value, i) => value !== canonical.split("\n")[i]) + 1;
    fail(
      "CT013",
      "Use canonical clause order and number agreement.",
      Math.max(1, line),
      "Compare with the compiler's canonical text.",
    );
  }
  if (errors.length) throw new CardTextError(errors);
  return {
    sourceId: source.id,
    sourceHash: hash({
      source: { ...source, reminderRefs: [] },
      language: LANGUAGE_VERSION,
      dictionary: DICTIONARY_HASH,
      compiler: COMPILER_VERSION,
      interpreter: INTERPRETER_VERSION,
    }),
    languageVersion: LANGUAGE_VERSION,
    dictionaryHash: DICTIONARY_HASH,
    compilerVersion: COMPILER_VERSION,
    ast,
    canonicalText: canonical,
    reminderRefs: [...source.reminderRefs],
  };
}
