import type { HouseId, Role } from "./content";

/** Printed keywords and their literal mechanical reminders, shared by all views. */
export interface CardRule {
  keyword: string;
  reminder: string;
}

export const ROLE_RULES: Record<Role, CardRule[]> = {
  Royal: [
    {
      keyword: "STEWARD",
      reminder: "At the start of your Readying phase, gain 1 gold.",
    },
  ],
  Queen: [
    {
      keyword: "QUEEN",
      reminder:
        "During your turn, spend 1 order and pay a foreign Noble’s gold cost to play it from your hand married to this Queen. One spouse at a time.",
    },
  ],
  Intriguer: [
    {
      keyword: "CONSPIRATOR",
      reminder: "When this enters your court, destroy 1 rival Estate.",
    },
    {
      keyword: "AMBUSH",
      reminder:
        "When attacked, pay 2 gold and discard this from hand: deal 3 damage to the attacker before combat.",
    },
  ],
  Lawgiver: [
    {
      keyword: "GUARDIAN",
      reminder:
        "Enters Ready. Your opponents may only attack your Nobles with GUARDIAN.",
    },
  ],
  Warlord: [
    {
      keyword: "COMMANDER",
      reminder: "Your Nobles gain +1 {attack} while attacking.",
    },
  ],
  Founder: [
    {
      keyword: "FOUNDER",
      reminder:
        "When this enters your court, including setup, gain 3 Stability.",
    },
  ],
};

export function cardRules(role: Role, controller: HouseId): CardRule[] {
  const rules = ROLE_RULES[role].map((rule) => ({ ...rule }));
  if (controller === "plantagenet" && role === "Warlord")
    rules.push({ keyword: "SWIFT", reminder: "Enters Ready." });
  if (controller === "tudor" && role === "Intriguer")
    rules[0].reminder =
      "When this enters your court, destroy 1 Estate and steal up to 2 gold from a rival.";
  if (controller === "bourbon" && role === "Founder")
    rules.push({
      keyword: "SUN COURT",
      reminder:
        "At the start of your Readying phase, from round 2, gain 1 Shield.",
    });
  return rules;
}

export const rulesText = (rules: CardRule[]) =>
  rules
    .map(
      (rule) =>
        `${rule.keyword} (${rule.reminder.replaceAll("{attack}", "Attack")})`,
    )
    .join("\n");
