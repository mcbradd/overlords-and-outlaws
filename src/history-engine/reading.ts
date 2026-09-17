import { crownContinuity, publicRoundEndDeadlines } from "./deadlines";
import type { PublicDeadline } from "./deadlines";
import type { GameView } from "./types";
import type { Action } from "./types";
import { dynastyOf, nameOf, program } from "./content";
import {
  hasAbility,
  legalActions,
  paired,
  readyNatives,
  supported,
} from "./rules";
import { crownReadiness } from "./learning";
import { ACTION_LABELS, ACTION_PURPOSES, previewAction } from "./preview";

export interface DeadlinePage {
  id: string;
  title: string;
  body: string[];
}

const wordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

/**
 * Logical reading pages; the UI may split these further to fit its viewport.
 * Keep whole paragraphs when possible and never truncate a scheduled effect.
 * All titles and paragraphs are plain text, to be escaped by the renderer.
 */
function pagesFor(
  id: string,
  title: string,
  paragraphs: string[],
): DeadlinePage[] {
  const budget = 75 - wordCount(title) - 2; // reserve “· continued”
  const pages: DeadlinePage[] = [];
  let body: string[] = [];
  let used = 0;
  const flush = () => {
    if (!body.length) return;
    pages.push({
      id: `${id}-${pages.length + 1}`,
      title: pages.length ? `${title} · continued` : title,
      body,
    });
    body = [];
    used = 0;
  };
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length <= budget) {
      if (used + words.length > budget) flush();
      body.push(paragraph);
      used += words.length;
    } else {
      flush();
      for (let start = 0; start < words.length; start += budget) {
        body = [words.slice(start, start + budget).join(" ")];
        flush();
      }
    }
  }
  flush();
  return pages;
}

function titleFor(deadline: PublicDeadline): string {
  switch (deadline.kind) {
    case "crisis":
      return deadline.timing === "round-end"
        ? "Before settlement: Crisis"
        : "After succession: recurring Crisis";
    case "expiry":
      return "Before settlement: expiry";
    case "settlement":
      return "Crown settlement";
    case "unveil":
      return "First next round: uncover";
    case "succession":
      return "Then: succession";
    case "history":
      return "Then: unknown History";
  }
}

/** Public-only boundary reader. Opening it never commits Pass or advances time. */
export function deadlinePages(view: GameView): DeadlinePage[] {
  if (view.result)
    return pagesFor("result", "The game has ended", [
      view.result.reason,
      "No later round-boundary effects will run.",
    ]);
  if (view.phase === "setup")
    return pagesFor("setup", "Before the first round", [
      "Finish Inheritance and appoint each Ruler. Then the first round begins: ready the Courts and give each player three seals before revealing History.",
      "A completed uncovered painting ends the game immediately. Otherwise players begin taking one action or Pass at a time.",
    ]);

  const deadlines = publicRoundEndDeadlines(view);
  const pages = pagesFor("end-order", `When round ${view.round} ends`, [
    "These are the public conditions now. Later actions and unresolved choices can change them. Reading this schedule does not end the round.",
    "After everyone passes consecutively, unstopped Crises resolve in reveal order. Expiring Crises then end. Crown settlement is checked last, before the next round can begin.",
  ]);
  if (view.crown)
    pages.push(
      ...pagesFor("crown-continuity", "The Crown's required people", [
        crownContinuity(view),
      ]),
    );

  for (const [index, deadline] of deadlines.entries())
    if (deadline.timing === "round-end")
      pages.push(
        ...pagesFor(`end-${index}`, titleFor(deadline), [deadline.text]),
      );

  pages.push(
    ...pagesFor("start-order", `If round ${view.round + 1} begins`, [
      "If nobody wins, advance the round and first seat. Uncover due painting pieces before returning Loans or refreshing seals. A completed painting ends the game immediately.",
      "Then return Loans, refresh seals and readiness, perform scheduled succession, resolve recurring Crises and reveal History. Finally, each hand below five draws one Noble, if available. Required choices pause automatic resolution.",
    ]),
  );
  for (const [index, deadline] of deadlines.entries())
    if (deadline.timing === "next-start")
      pages.push(
        ...pagesFor(`start-${index}`, titleFor(deadline), [deadline.text]),
      );
  if (!view.historyCount)
    pages.push(
      ...pagesFor("empty-history", "The History Deck is empty", [
        "No further History cards can be drawn. Empty decks do not reshuffle. Existing Crisis effects, Crown deadlines and Cover expiries still apply.",
      ]),
    );
  return pages;
}

/** Explain actual availability from this seat's view; never infer another hand. */
export function actionAvailabilityPages(
  view: GameView,
  seat: number,
): DeadlinePage[] {
  const player = view.players[seat];
  if (!player || view.viewer !== seat || !player.hand)
    return pagesFor("actions-private", "Your private options", [
      "Open your own player view to inspect hand-dependent action choices. Another player's concealed cards are not public information.",
    ]);
  if (view.result)
    return pagesFor("actions-ended", "The game has ended", [
      "No further actions are legal. You can still inspect the public result and table record.",
    ]);
  const actions = legalActions(view, seat);
  const activeRestriction = (restriction: string) =>
    view.history.filter(
      (event) =>
        event.status === "active" &&
        program(event.id).restrictions.some((value) => value === restriction),
    );
  const hand = player.hand;
  if (view.phase === "response" && view.claim?.defender === seat) {
    const blocks = actions.filter((action) => action.type === "counterclaim");
    let reason = "You can Block now for 1 seal and a matching hand Noble.";
    if (!blocks.length) {
      if (!player.seals) reason = "You have no seal left to Block.";
      else if (
        !hand.some(
          (id) =>
            hasAbility(id, "counterclaim") &&
            dynastyOf(id) === dynastyOf(view.claim!.target),
        )
      )
        reason = `Your hand has no Noble that can Block a ${dynastyOf(view.claim.target)} Recall.`;
      else
        reason =
          "This Block also requires a ready native Court Noble; none is available.";
    }
    return pagesFor("actions-response", `Defend ${nameOf(view.claim.target)}`, [
      reason,
      "Declining spends nothing and lets the rival take this Noble. Ordinary actions wait until your own action opportunity.",
    ]);
  }
  if (view.phase !== "action" || view.active !== seat) {
    const context =
      view.phase === "setup"
        ? "Finish the current Inheritance selection before ordinary actions begin."
        : view.phase === "barter"
          ? "Finish the current locked Trade decision before ordinary actions resume."
          : view.phase === "choice"
            ? "Resolve the current required choices before ordinary actions resume. A submitted choice waits for other affected players."
            : "Ordinary actions are available only on your own action opportunity.";
    return pagesFor("actions-waiting", "Current procedure", [
      context,
      actions.length
        ? "Your available choices remain in the normal action area."
        : "There is no decision for this player right now.",
    ]);
  }

  const reasonFor = (type: Action["type"]): string => {
    if (type === "counterclaim")
      return "Block is a response to a rival's Recall, not an ordinary action. Reserve 1 seal and a matching hand Noble if you intend to defend.";
    if (type !== "pass" && !player.seals)
      return "No seals remain. Pass is free; actions and Blocks share the same three-seal allowance until next round.";
    switch (type) {
      case "build":
        return "No Noble in your hand can Recruit as a member of your Dynasty.";
      case "withdraw":
        return player.court.length
          ? "No Noble in your Court has permission to Withdraw."
          : "Your Court is empty.";
      case "petition":
        return !view.dynastyCount
          ? "The Dynasty Deck is empty; it does not reshuffle."
          : `${activeRestriction("petition-with-hand")
              .map((event) => nameOf(event.id))
              .join(
                ", ",
              )} requires an empty hand for Draw; your hand is not empty.`;
      case "marry": {
        const restrictions = activeRestriction("marry");
        if (restrictions.length)
          return `${restrictions.map((event) => nameOf(event.id)).join(", ")} forbids Marry while active.`;
        if (
          !player.court.some(
            (id) =>
              dynastyOf(id) === player.dynasty &&
              hasAbility(id, "marry") &&
              !paired(view, id),
          )
        )
          return "You need an unmarried native Queen already in your Court.";
        return "You need an unpaired foreign Noble in your hand or Court to marry that Queen.";
      }
      case "claim": {
        const rivals = view.players
          .filter((other) => other.seat !== seat)
          .flatMap((other) => other.court);
        if (!rivals.length) return "There are no rival Court Nobles to Recall.";
        if (rivals.every((id) => view.petitioned.includes(id)))
          return "Every rival Court Noble has already been targeted by Recall this round, even if it was Blocked.";
        return "No Recall-capable hand Noble matches the printed Dynasty of a rival Court Noble still eligible this round.";
      }
      case "barter":
        return !hand.some((id) => hasAbility(id, "barter"))
          ? "You need one or two Trade-capable Nobles in hand to make an offer."
          : "No rival currently has a hand card to offer in exchange.";
      case "veil": {
        const cover = view.fragments.find(
          (fragment) => fragment.veil?.seat === seat,
        );
        if (cover)
          return `You already have a Cover in progress until the start of round ${cover.veil!.until}. One player cannot maintain two Covers.`;
        if (
          !view.fragments.some(
            (fragment) => !fragment.veil && !fragment.onceVeiled,
          )
        )
          return "No revealed, uncovered painting piece remains eligible for its first Cover.";
        return "You need a Cover-capable Noble in hand to discard permanently as payment.";
      }
      case "attack": {
        const events = view.history.filter((event) =>
          event.status === "pending"
            ? program(event.id).condition === "attack"
            : program(event.id).end === "attack",
        );
        if (!events.length)
          return "No current Crisis permits Challenge now. An active Crisis needs explicit permission in its End instruction.";
        if (
          !player.court.some(
            (id) =>
              supported(view, seat, id) &&
              hasAbility(id, "attack") &&
              !player.rotated.includes(id),
          )
        )
          return "No ready Noble in your Bloodline can Challenge. Turned-sideways Nobles ready next round.";
        return "Your eligible ready Nobles have already contributed to the current Challenge conditions; each contribution needs a different Noble.";
      }
      case "address": {
        const conditions = [
          "dynasties",
          "seats-native",
          "seats-any",
          "married-seats",
          "seats-rotate",
        ];
        const events = view.history.filter(
          (event) =>
            (event.status === "pending" ||
              program(event.id).end === "condition") &&
            conditions.includes(program(event.id).condition ?? ""),
        );
        if (!events.length)
          return "No current Crisis accepts Help now. Read its Prevent or End instruction for the action it actually requires.";
        const remaining = events.filter(
          (event) =>
            program(event.id).condition === "dynasties" ||
            (event.obligated.includes(seat) && !event.fulfilled.includes(seat)),
        );
        if (!remaining.length)
          return "Your required Help is already complete, or you were not marked as owing a contribution.";
        if (
          remaining.every(
            (event) => program(event.id).condition === "seats-rotate",
          ) &&
          !readyNatives(view, seat).length
        )
          return "The remaining Help requires turning a ready native Court Noble sideways; none is ready.";
        return `None of your cards satisfies the remaining Help conditions. Inspect ${remaining.map((event) => nameOf(event.id)).join(", ")} for the required Dynasty, readiness or new contribution.`;
      }
      case "proclaim":
        return crownReadiness(view, seat);
      default:
        return "This action is not available during the current procedure.";
    }
  };
  const types: Action["type"][] = [
    "build",
    "withdraw",
    "petition",
    "marry",
    "claim",
    "barter",
    "attack",
    "address",
    "veil",
    "proclaim",
    "pass",
    "counterclaim",
  ];
  const available = types.filter((type) =>
    actions.some((action) => action.type === type),
  );
  const pages = pagesFor("actions-summary", "Your action choices", [
    `${player.seals} seals remain. Available now: ${available.map((type) => ACTION_LABELS[type] ?? type).join(", ")}.`,
    "A missing action has a cost, target, timing or relationship requirement. The following pages explain current availability without committing a move.",
  ]);
  for (const type of types) {
    const example = actions.find((action) => action.type === type);
    const body = example
      ? [
          "Available now.",
          ...(ACTION_PURPOSES[type] ? [ACTION_PURPOSES[type]!] : []),
          `Example: ${previewAction(view, example).title}.`,
        ]
      : [
          `Unavailable now. ${reasonFor(type)}`,
          ...(type !== "proclaim" &&
          type !== "counterclaim" &&
          ACTION_PURPOSES[type]
            ? [ACTION_PURPOSES[type]!]
            : []),
        ];
    pages.push(
      ...pagesFor(`availability-${type}`, ACTION_LABELS[type] ?? type, body),
    );
  }
  return pages;
}
