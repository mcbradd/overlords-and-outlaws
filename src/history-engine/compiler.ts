import type {
  CardSource,
  CompiledCard,
  Condition,
  Effect,
  Program,
  Restriction,
  Route,
} from "./types";

export const LANGUAGE_VERSION = "1.0.0";
export const COMPILER_VERSION = "1.0.0";
export const REMINDERS: Record<string, string> = {
  attack:
    "Muster and Secure require two different ready Bloodline Nobles, one seal and rotation per contribution.",
  commit:
    "Place an Outlaw face up in your Leverage. Return it to your hand at the next round start.",
  marriage:
    "A native Queen supports only her paired foreign spouse. Losing either breaks both marriage halves.",
  crown:
    "Proclaim, transfer at the next round start, then survive a full round before settlement.",
  bloodline:
    "Your native Overlords and foreign Overlords married to your native Queens; no marriage chains.",
};
export const CONDITIONS: Record<Condition, string> = {
  "seats-native": "Each player Commits one native Outlaw through Address.",
  attack: "Attack: Muster and Secure with different Noble IDs.",
  "restore-marriage":
    "At reveal, freeze players with unsupported foreign Overlords. Each restores a marriage to one of those Overlords through Marry.",
  "seats-rotate":
    "Each player Rotates one ready native Overlord through Address.",
  dynasties:
    "Commit Nobles of two different printed Dynasties through Address, one per action.",
  "seats-any": "Each player Commits one Outlaw through Address.",
  "barter-or-veil": "After reveal, each player completes Barter or Veil.",
  "married-seats":
    "At reveal, freeze players with marriages. Each Commits one Outlaw through Address.",
};
export const RESTRICTIONS: Record<Restriction, string> = {
  proclaim: "No player may Proclaim.",
  "counterclaim-rotate":
    "Counterclaim also requires rotating one ready native Overlord.",
  "petition-with-hand": "A player may Petition only with no Outlaws in hand.",
  marry: "No player may Marry.",
  succession: "Scheduled Crown succession is forbidden.",
};
export const EFFECTS: Record<Effect, string> = {
  "retire-supported":
    "Each player with a Ruler chooses one other supported Overlord, if able. Retire the chosen Overlords simultaneously, preserving at least two native Overlords per player.",
  "return-unsupported":
    "Return all unsupported foreign Overlords to their controllers’ hands simultaneously.",
  "return-dependency":
    "The Crown controller chooses one eligible non-Ruler Crown dependency, if able. Return it to their hand.",
  "return-native":
    "Each player chooses one non-Ruler native Overlord, if able. Return the chosen Overlords simultaneously.",
  history: "Reveal one additional History card publicly.",
  "break-marriage":
    "Each player chooses one marriage they control, if able. Break the chosen marriages simultaneously.",
  "commit-unmarried":
    "Each player with no marriage chooses one Outlaw, if able. Commit the chosen Outlaws simultaneously.",
  "blood-edict":
    "Each player chooses one Overlord they control whose printed Dynasty matches an Overlord controlled by another player. Retire the chosen Overlords simultaneously.",
};
export const LAWS: Record<Exclude<Route, "regency">, string> = {
  kindreds:
    "At Proclaim, name two native heirs from different printed branches, distinct from your Ruler. Maintain your old Ruler and at least one named heir until succession. At succession, choose a remaining named heir. Retire the old Ruler and install that heir. Maintain the supported successor through settlement.",
  charter:
    "At Proclaim, name a native heir and a different native Charter Witness, both distinct from your Ruler. Maintain your old Ruler, heir and Witness until succession. At succession, Retire the old Ruler and install the heir. Maintain the supported successor and the same native Witness through settlement.",
  act: "At Proclaim, seal one native Outlaw as heir, distinct from your Ruler. Maintain your old Ruler and sealed heir until succession. At succession, Reveal the sealed heir, verify its native Dynasty, Retire the old Ruler and place the heir in Court as Ruler. Maintain the supported native successor through settlement.",
  marriage:
    "At Proclaim, name a foreign heir married to your native Queen, who is not your Ruler. Maintain your old Ruler, heir and that marriage until succession. At succession, Retire the old Ruler and install the heir. Maintain the supported successor and the same marriage through settlement.",
};
// Stable browser/Node hash for compatibility, not a cryptographic integrity claim.
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
  REMINDERS,
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
        .map((d) => `${d.filename}:${d.line}:${d.column} ${d.code} ${d.text}`)
        .join("\n"),
    );
  }
}
const entries = <T extends string>(r: Record<T, string>) =>
  Object.entries(r) as [T, string][];
export function canonicalText(p: Program, kind: CardSource["kind"]): string {
  if (kind === "noble") return "";
  if (p.route && p.route !== "regency") return LAWS[p.route];
  if (p.fragment)
    return `Place this fragment in slot ${p.fragment} of its painting. If all six fragments are present and unveiled, Eudoxia wins.`;
  return [
    p.condition ? `Avert: ${CONDITIONS[p.condition]}` : "",
    ...p.restrictions.map((r) => `While active: ${RESTRICTIONS[r]}`),
    ...p.instructions.map(
      (i) =>
        `${i.timing === "activation" ? "On activation" : "At the start of each round"}: ${EFFECTS[i.effect]}`,
    ),
    p.end
      ? `End: ${p.end === "attack" ? CONDITIONS.attack : "Complete this card’s Avert condition through Address."}`
      : "",
    p.carry ? "Carry pending contributions into active play." : "",
    p.expiry === "immediate"
      ? "Then Expire."
      : p.expiry === "next-end"
        ? "Expire at the end of the next round after activation."
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
    suggestion = "Use a canonical typed clause from the History dictionary.",
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
  for (const ref of source.reminderRefs)
    if (!REMINDERS[ref]) fail("CT012", `Unknown reminder: ${ref}`);
  const text = source.cardText.trim();
  if (/^Choose\b|\banother\b(?! player)/m.test(text))
    fail("CT003", "A choice needs an explicit chooser and bound selector.");
  if (/\b(some|several|a few)\b/.test(text))
    fail("CT004", "Use an exact bounded quantity or Each player.");
  if (/Each player chooses/.test(text) && !/simultaneously/.test(text))
    fail("CT007", "Multi-player choices must specify a simultaneous snapshot.");
  if (/\b(cost|pay)\b.*\b(if able|part|may)\b/i.test(text))
    fail("CT008", "Costs must be validated and paid atomically.");
  if (/When.*(?:Activate|Reveal).*\b(?:again|itself)\b/i.test(text))
    fail("CT014", "Self-triggering effects must be bounded and acyclic.");
  if (!text && source.kind !== "noble" && source.reminderRefs.length)
    fail("CT011", "Reminder Text cannot supply missing operative Card Text.");
  if (
    !["alba", "plantagenet", "tudor", "habsburg"].includes(
      source.printed.dynasty,
    )
  )
    fail("CT016", "This module is not available in the core ruleset.");
  if (
    /\b(health|damage|gold|mana|Rank III|authority|power total)\b/i.test(text)
  )
    fail("CT010", text);
  if (/Discard (an? |the )?Overlord/i.test(text)) fail("CT002", text);
  if (/from The Past|refresh.*seal/i.test(text)) fail("CT009", text);
  if (/change.*printed Dynasty/i.test(text)) fail("CT005", text);
  if (/any bloodline/i.test(text)) fail("CT004", text);
  const ast: Program = { restrictions: [], instructions: [], carry: false };
  if (source.kind === "noble") {
    if (text)
      fail("CT001", text, 1, "Baseline Nobles have no unique Card Text.");
    if (
      typeof source.printed.queen !== "boolean" ||
      typeof source.printed.founder !== "boolean" ||
      (source.printed.dynasty === "alba" && !source.printed.branch)
    )
      fail("CT015", "Missing printed eligibility or branch");
  } else if (source.kind === "law") {
    ast.route = entries(LAWS).find(([, t]) => t === text)?.[0];
    if (!ast.route) fail("CT001", text);
  } else if (source.kind === "fragment") {
    ast.fragment = source.printed.slot;
    if (
      !ast.fragment ||
      ast.fragment < 1 ||
      ast.fragment > 6 ||
      canonicalText(ast, "fragment") !== text
    )
      fail("CT016", text);
  } else {
    text.split("\n").forEach((line, index) => {
      const condition = entries(CONDITIONS).find(
        ([, t]) => line === `Avert: ${t}`,
      );
      const restriction = entries(RESTRICTIONS).find(
        ([, t]) => line === `While active: ${t}`,
      );
      const effect = entries(EFFECTS).find(
        ([, t]) =>
          line === `On activation: ${t}` ||
          line === `At the start of each round: ${t}`,
      );
      if (condition && !ast.condition) ast.condition = condition[0];
      else if (restriction && !ast.restrictions.includes(restriction[0]))
        ast.restrictions.push(restriction[0]);
      else if (effect)
        ast.instructions.push({
          timing: line.startsWith("On activation") ? "activation" : "start",
          effect: effect[0],
        });
      else if (line === `End: ${CONDITIONS.attack}` && !ast.end)
        ast.end = "attack";
      else if (
        line === "End: Complete this card’s Avert condition through Address." &&
        !ast.end
      )
        ast.end = "condition";
      else if (
        line === "Carry pending contributions into active play." &&
        !ast.carry
      )
        ast.carry = true;
      else if (line === "Then Expire." && !ast.expiry) ast.expiry = "immediate";
      else if (
        line === "Expire at the end of the next round after activation." &&
        !ast.expiry
      )
        ast.expiry = "next-end";
      else fail("CT001", line, index + 1);
    });
    if (!ast.condition || !ast.expiry)
      fail(
        "CT006",
        "Interregna require an Avert condition and explicit expiry.",
      );
    if (
      ast.end &&
      (!ast.carry || (ast.end === "attack" && ast.condition !== "attack"))
    )
      fail("CT008", "End requires compatible retained proof.");
    if (
      ast.expiry === "immediate" &&
      (ast.restrictions.length ||
        ast.instructions.some((i) => i.timing === "start"))
    )
      fail("CT014", "Immediate expiry conflicts with persistent behavior.");
  }
  if (errors.length) throw new CardTextError(errors);
  const canonical = canonicalText(ast, source.kind);
  if (canonical !== text)
    fail("CT013", "Noncanonical clause ordering or round-trip mismatch.");
  if (errors.length) throw new CardTextError(errors);
  return {
    sourceId: source.id,
    sourceHash: hash({ ...source, reminderRefs: [] }),
    languageVersion: LANGUAGE_VERSION,
    dictionaryHash: DICTIONARY_HASH,
    compilerVersion: COMPILER_VERSION,
    ast,
    canonicalText: canonical,
    reminderRefs: [...source.reminderRefs],
  };
}
