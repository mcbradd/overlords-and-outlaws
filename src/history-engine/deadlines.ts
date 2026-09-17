import { EFFECTS, RESTRICTIONS } from "./compiler";
import { nameOf, program } from "./content";
import { eventComplete, lawFor, supported } from "./rules";
import type { GameView } from "./types";

export interface PublicDeadline {
  kind:
    | "crisis"
    | "expiry"
    | "settlement"
    | "unveil"
    | "succession"
    | "history";
  timing: "round-end" | "next-start";
  text: string;
}

export interface PassConsequences {
  endsRound: boolean;
  effect: string;
  warning: string;
  deadlines: PublicDeadline[];
}

/** Describe the Law's actual continuity, without naming a sealed heir. */
export function crownContinuity(view: GameView): string {
  const crown = view.crown;
  if (!crown) return "";
  const law = lawFor(view, crown.seat, crown.route);
  const person = (id: string | null) => (id ? nameOf(id) : "the named Noble");
  if (crown.stage === "reigning") {
    const ruler = `Keep ${person(crown.successor)} as Ruler and in the Bloodline.`;
    if (law.keep === "heir-witness")
      return `${ruler} The same Witness, ${person(crown.witness)}, must also stay in the Bloodline.`;
    if (law.keep === "heir-marriage")
      return `${ruler} Keep the same marriage to ${person(crown.witness)} intact.`;
    return ruler;
  }
  const ruler = `Keep ${person(crown.oldRuler)} as Ruler until succession.`;
  if (law.heir.zone === "hand")
    return `${ruler} Keep the sealed heir set aside; reveal and verify that same heir at succession.`;
  const heirs = crown.heirs.filter((id) => supported(view, crown.seat, id));
  if (law.keep === "any-heir")
    return heirs.length > 1
      ? `${ruler} Keep at least one named heir in the Bloodline: ${heirs.map(nameOf).join(" or ")}. Losing one candidate does not end the claim while another remains.`
      : `${ruler} Keep the remaining named heir, ${person(heirs[0] ?? null)}, in the Bloodline.`;
  const heir = person(crown.heirs[0] ?? null);
  if (law.keep === "heir-witness")
    return `${ruler} Both heir ${heir} and the same Witness, ${person(crown.witness)}, must stay in the Bloodline.`;
  if (law.keep === "heir-marriage")
    return `${ruler} Keep heir ${heir} in the Bloodline through the same marriage to ${person(crown.witness)}.`;
  return `${ruler} Keep heir ${heir} in the Bloodline.`;
}

/**
 * Public schedule, not a second rules simulation. Unknown draws and choices stay
 * conditional. Never inspect hands, sealed identities, observations or deck order.
 * Ordering follows pump: pending effects, expiries, settlement; then unveil,
 * refresh, succession, recurring effects and History.
 */
export function passConsequences(view: GameView): PassConsequences {
  const endsRound =
    view.phase === "action" && view.passes.length + 1 === view.players.length;
  if (!endsRound)
    return {
      endsRound: false,
      effect:
        "Spend nothing. Keep your seals and let the next player act. You may act again if the round continues.",
      warning: "",
      deadlines: [],
    };
  return projectRoundBoundary(view);
}

/** Look ahead from the current public conditions, even before the final Pass. */
export function publicRoundEndDeadlines(view: GameView): PublicDeadline[] {
  return projectRoundBoundary(view).deadlines;
}

function projectRoundBoundary(view: GameView): PassConsequences {
  const deadlines: PublicDeadline[] = [];
  const add = (
    kind: PublicDeadline["kind"],
    timing: PublicDeadline["timing"],
    text: string,
  ) => {
    deadlines.push({ kind, timing, text });
  };
  const nextRound = view.round + 1;
  const pending = view.history.filter(
    (event) => event.status === "pending" && !eventComplete(event),
  );
  const expiring = view.history.filter(
    (event) =>
      event.status === "active" &&
      event.expires !== null &&
      event.expires <= view.round,
  );
  // A pending event may still be averted by an earlier boundary effect. Its
  // continuing effects are consequently phrased as conditional below.
  const continuing = view.history.filter((event) =>
    event.status === "active"
      ? event.expires === null || event.expires > view.round
      : !eventComplete(event) && program(event.id).expiry !== "immediate",
  );

  if (pending.length)
    add(
      "crisis",
      "round-end",
      `Before settlement, unstopped Crises activate: ${pending.map((event) => nameOf(event.id)).join(", ")}. Resolve any choices they require.`,
    );
  for (const event of pending) {
    const effects = program(event.id).instructions.filter(
      (instruction) => instruction.timing === "activation",
    );
    if (effects.length)
      add(
        "crisis",
        "round-end",
        `${nameOf(event.id)}, if it activates: ${effects.map((instruction) => EFFECTS[instruction.effect]).join(" ")}`,
      );
    const restrictions = program(event.id).restrictions.filter(
      (restriction) => restriction !== "succession",
    );
    if (restrictions.length)
      add(
        "crisis",
        "round-end",
        `${nameOf(event.id)}, if it activates: ${restrictions.map((restriction) => RESTRICTIONS[restriction]).join(" ")}`,
      );
  }
  if (expiring.length)
    add(
      "expiry",
      "round-end",
      `${expiring.map((event) => nameOf(event.id)).join(", ")} expire before Crown settlement and the next succession.`,
    );

  const crown = view.crown;
  const law = crown ? lawFor(view, crown.seat, crown.route) : null;
  const settlementDue = !!(
    crown &&
    law &&
    crown.stage === "reigning" &&
    crown.reignRound !== null &&
    view.round >= crown.reignRound + law.reignRounds - 1
  );
  if (settlementDue && crown)
    add(
      "settlement",
      "round-end",
      `${view.players[crown.seat].name} can win at this round's end if the Law still holds after the Crises. Settlement comes before next-round unveilings and draws.`,
    );

  const due = view.fragments.filter(
    (fragment) => fragment.veil && fragment.veil.until <= nextRound,
  );
  const lethal = view.modules.filter((dynasty) => {
    const pieces = view.fragments.filter(
      (fragment) =>
        fragment.dynasty === dynasty &&
        (!fragment.veil || fragment.veil.until <= nextRound),
    );
    return (
      due.some((fragment) => fragment.dynasty === dynasty) &&
      pieces.some(
        (fragment) =>
          pieces.length >= (program(fragment.id).fragmentGoal ?? Infinity),
      )
    );
  });
  if (lethal.length)
    add(
      "unveil",
      "next-start",
      `If no one wins this round, ${lethal.join(" and ")} completes when its Cover expires at the start of round ${nextRound}: everyone loses before seals refresh or Rulers change.`,
    );
  else if (due.length)
    add(
      "unveil",
      "next-start",
      `If play continues, ${due.length} Cover${due.length === 1 ? " expires" : "s expire"} at the start of round ${nextRound}, before seals refresh. The pieces become uncovered again.`,
    );

  if (
    crown &&
    law &&
    crown.stage === "proclaimed" &&
    nextRound >= crown.round + law.successionAfter
  ) {
    const blockers = continuing.filter((event) =>
      program(event.id).restrictions.includes("succession"),
    );
    if (blockers.length)
      add(
        "succession",
        "next-start",
        `At round ${nextRound}'s succession, ${blockers.map((event) => nameOf(event.id)).join(", ")} will forfeit this Crown claim if still active; ${nameOf(crown.oldRuler)} will not Retire.`,
      );
    else
      add(
        "succession",
        "next-start",
        `If play survives the opening unveilings and the claim still holds, ${nameOf(crown.oldRuler)} Retires permanently at the start of round ${nextRound}. The lawful heir becomes Ruler before recurring Crises and History draws.`,
      );
  }

  for (const event of continuing) {
    const instructions = program(event.id).instructions.filter(
      (instruction) => instruction.timing === "start",
    );
    if (instructions.length)
      add(
        "crisis",
        "next-start",
        `If play continues after succession, ${nameOf(event.id)}, if still active: ${instructions.map((instruction) => EFFECTS[instruction.effect]).join(" ")}`,
      );
  }

  const extraDraws = continuing.reduce(
    (count, event) =>
      count +
      program(event.id).instructions.filter(
        (instruction) =>
          instruction.timing === "start" && instruction.effect === "history",
      ).length,
    0,
  );
  const draws = Math.min(view.historyCount, view.players.length + extraDraws);
  const atRisk = view.modules.filter((dynasty) => {
    const pieces = view.fragments.filter(
      (fragment) => fragment.dynasty === dynasty,
    );
    if (
      pieces.some(
        (fragment) => fragment.veil && fragment.veil.until > nextRound,
      )
    )
      return false;
    const goal = pieces.length ? program(pieces[0].id).fragmentGoal : undefined;
    return (
      goal !== undefined &&
      pieces.length < goal &&
      pieces.length + draws >= goal
    );
  });
  if (draws)
    add(
      "history",
      "next-start",
      `If play continues, up to ${draws} History card${draws === 1 ? "" : "s"} will reveal. Their identities are unknown; a sixth uncovered painting piece ends the game immediately.${atRisk.length ? ` ${atRisk.join(" and ")} could complete within these draws.` : ""}`,
    );

  // The action dock has room for a decision, not every printed Crisis clause.
  // Keep the complete ordered schedule available to inspection surfaces while
  // leading the bounded preview with terminal and irreversible consequences.
  const summaries: string[] = [];
  if (settlementDue && crown)
    summaries.push(
      `${view.players[crown.seat].name} may win after Crises if the Law survives.`,
    );
  if (lethal.length)
    summaries.push(
      `If no one wins first, round ${nextRound} Cover expiry completes ${lethal.join("/")}: everyone loses before refresh or succession.`,
    );
  else if (atRisk.length)
    summaries.push(
      `If play continues, ${atRisk.join("/")} could complete during ${draws} unknown History draws.`,
    );
  if (
    !lethal.length &&
    crown &&
    law &&
    crown.stage === "proclaimed" &&
    nextRound >= crown.round + law.successionAfter
  ) {
    const blocked = continuing.some((event) =>
      program(event.id).restrictions.includes("succession"),
    );
    summaries.push(
      blocked
        ? `Round ${nextRound}: succession fails if its blocking Crisis remains; the old Ruler stays.`
        : `Round ${nextRound}: ${nameOf(crown.oldRuler)} Retires if the claim survives.`,
    );
  }
  if (pending.length)
    summaries.push(
      `${pending.length} unstopped ${pending.length === 1 ? "Crisis activates" : "Crises activate"} first; resolve any required choices.`,
    );
  if (!lethal.length && due.length)
    summaries.push(
      `${due.length} ${due.length === 1 ? "Cover expires" : "Covers expire"} before refresh.`,
    );
  const recurring = continuing.filter((event) =>
    program(event.id).instructions.some(
      (instruction) => instruction.timing === "start",
    ),
  );
  if (!lethal.length && recurring.length)
    summaries.push(
      `${recurring.length} recurring Crisis ${recurring.length === 1 ? "effect follows" : "effects follow"} succession.`,
    );
  if (expiring.length)
    summaries.push(
      `${expiring.length} active ${expiring.length === 1 ? "Crisis expires" : "Crises expire"} before settlement.`,
    );
  if (!lethal.length && !atRisk.length && draws)
    summaries.push(`If play continues: up to ${draws} unknown History draws.`);
  const effect = `Spend nothing. This final Pass ends round ${view.round}.`;
  const words = (text: string) => text.trim().split(/\s+/).length;
  const selected: string[] = [];
  let omitted = false;
  for (const summary of summaries) {
    if (words([effect, ...selected, summary].join(" ")) <= 45)
      selected.push(summary);
    else omitted = true;
  }
  if (omitted) selected.push("Other scheduled effects also apply.");
  return {
    endsRound: true,
    effect,
    warning: selected.join(" "),
    deadlines,
  };
}
