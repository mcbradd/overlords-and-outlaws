import type { GameState, GameView, Seat } from "./types";
export function viewForSeat(state: GameState, seat: Seat | null): GameView {
  // Construct the whitelist explicitly: spreading state here would leak new fields.
  const s = state;
  const participant =
    s.barter &&
    seat !== null &&
    [s.barter.initiator, s.barter.recipient].includes(seat);
  return structuredClone({
    schema: s.schema,
    rulesetId: s.rulesetId,
    contentVersion: s.contentVersion,
    revision: s.revision,
    modules: s.modules,
    first: s.first,
    active: s.active,
    round: s.round,
    phase: s.phase,
    viewer: seat,
    players: s.players.map((p) => ({
      ...p,
      hand: seat === p.seat ? p.hand : null,
      handCount: p.hand.length,
    })),
    dynastyCount: s.dynastyDeck.length,
    historyCount: s.historyDeck.length,
    noblePast: s.noblePast,
    historyPast: s.historyPast,
    marriages: s.marriages,
    nextMarriage: s.nextMarriage,
    crown: s.crown
      ? {
          ...s.crown,
          sealed: s.crown.seat === seat ? s.crown.sealed : null,
          heirs:
            s.crown.route === "act" &&
            s.crown.stage === "proclaimed" &&
            s.crown.seat !== seat
              ? []
              : s.crown.heirs,
          sealedCount: s.crown.sealed ? 1 : 0,
        }
      : null,
    setup: s.setup
      ? {
          ...s.setup,
          locked: Object.fromEntries(
            Object.entries(s.setup.locked).map(([key, ids]) => [
              key,
              Number(key) === seat ? ids : null,
            ]),
          ),
        }
      : null,
    history: s.history,
    revealSequence: s.revealSequence,
    fragments: s.fragments,
    petitioned: s.petitioned,
    passes: s.passes,
    claim: s.claim,
    barter: s.barter
      ? {
          ...s.barter,
          packets: Object.fromEntries(
            Object.entries(s.barter.packets).map(([key, ids]) => [
              key,
              Number(key) === seat || (participant && s.barter!.inspected)
                ? ids
                : null,
            ]),
          ),
          counts: Object.fromEntries(
            Object.entries(s.barter.packets).map(([key, ids]) => [
              key,
              ids.length,
            ]),
          ),
          decisions: Object.fromEntries(
            Object.entries(s.barter.decisions).map(([key, value]) => [
              key,
              Number(key) === seat ? value : null,
            ]),
          ),
        }
      : null,
    choices: s.choices
      ? {
          ...s.choices,
          requests: s.choices.requests.map((c) => ({
            ...c,
            allowedIds: c.chooser === seat ? c.allowedIds : [],
            selection:
              c.chooser === seat
                ? c.selection
                : c.selection === null
                  ? null
                  : [],
          })),
        }
      : null,
    boundary: s.boundary,
    events: s.events.filter(
      (e) =>
        e.visibility === "public" ||
        (seat !== null && e.visibility.includes(seat)),
    ),
    observations: seat === null ? [] : (s.observations[seat] ?? []),
    result: s.result,
    policy: s.policy,
  });
}
export const viewForSpectator = (s: GameState) => viewForSeat(s, null);
export const publicReplay = (s: GameState) => ({
  rulesetId: s.rulesetId,
  contentVersion: s.contentVersion,
  events: structuredClone(s.events.filter((e) => e.visibility === "public")),
});
