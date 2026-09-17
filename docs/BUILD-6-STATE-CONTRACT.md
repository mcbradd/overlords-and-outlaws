> **Superseded candidate - player correction, 17 September 2026:** The user rejected unrestricted Court entry: foreign cards must enter through marriage. Trade may request only a rival's face-up Played/Resting cards. The any-card Add / no-marriage candidate below is historical planning evidence and must not be implemented as written. See [the current correction and regression tasks](reviews/BUILD-5-PLAYER-FOLLOWUP-2026-09-17.md). Its dependent tutorial, state and acceptance package requires redesign before implementation.

# Build 6 public state and transition boundary

Planning contract, 17 September 2026. This fixes the implementation seams before code. [Binding rules](SUIT-AND-RANK-DESIGN.md) govern behavior; this document defines representation without adding rules.

## Public operations

- `createGame({seed, dynasties, firstSeat})`: deterministic schema-6 setup, validated before return. Default first seat is 0 when omitted; ordinary UI offers every first seat explicitly. Seed is not retained in the projected seat view.
- `createTutorial()`: the exact declared fixture in the tutorial contract.
- `legalActions(view, seat)`: options from that viewer's own hand and public facts only.
- `applyAction(state, action)`: validate against the legal list and exact revision; return a new complete state. Rejection leaves input unchanged.
- `viewForSeat(state, seat)`: explicit public allowlist; hidden rival identities and supply order never cross this boundary.
- `assertInvariants(state)`: validate schema, conservation, ownership, pending references, Crowns and terminal consistency. Restore uses this same boundary.
- AI consumes `CoreView` and returns a legal `CoreAction`; it never receives full `CoreState`.

## Authoritative fields

`CoreState` has `schema: 6`, monotonic `revision`, diagnostic `turn` (ordinary seat opportunities, including empty skips), `first`, `active`, `phase` (`action`, `swap`, `terminal`), selected `dynasties`, `players`, private ordered `deck`, `crowns` (seat indices), `pending`, `result`, public `events`, `knownHands` and ordered `lastMoves` for the latest transition. There is no round, ruler, marriage, offer/attempt counter, Pass list or successor stage.

Each player has `seat`, `startingDynasty`, `hand`, `court` and `resting`. Starting Dynasty has no exclusive recruitment power. Every array contains canonical card IDs. Card metadata retains the immutable rank/suit/name/art/founder facts; historical Queen role is not a rule switch.

Actions are `add` with `card`; `swap` with `card` and `target`; `answer` with `card`; and `accept-swap` with no extra chosen identity. Every action includes `seat` and `revision`. No Pass, draw, end-turn or cursor action enters the reducer. Selection/preview/cancel remain application state.

`pending` is null or `{seat, other, card, target}`. The committed offered card is in the attacker's `resting` array exactly once while pending; it cannot return until the pending response resolves. `phase: swap` blocks every initiating action. Only `other` may answer or accept. On acceptance remove the offer from the attacker's Resting area before inserting it in the defender's; remove the target from Court before inserting it in the attacker's Resting area.

`result` is null or `{winner: seat-or-null, reason: 'held-run' | 'no-cards'}`. `crowns` exactly matches Courts containing at least one qualifying run. Several seats can have Crowns; the current start-of-turn check establishes a single winner. Empty-seat processing must check Crown first and the global all-empty/no-Crown terminal before looping. At most one complete seat traversal is needed to find a playable seat, a winner or the natural draw.

## Transitions and visible motion

Each successful action increments `revision` once, even if its completion includes ordered returns, refill and empty-seat skips. `turn` advances for each new ordinary opportunity. A response does not independently count as an ordinary turn. Saves store only complete reducer results, including a stable pending response; no artificial tutorial pause is inserted inside a turn-start procedure.

`lastMoves` records ordered `{card, from, to, reason}` entries. Locations identify `hand`, `court`, `resting` plus seat, or `supply`. Reasons distinguish commit, Add, Answer, exchange, return and refill. Motion can therefore show a captured person visit Resting then return at the next start in one reducer transaction. An entry is evidence of movement, not another owned card. The renderer animates these events while preserving the final authoritative state; Continue cannot cause or delay a rule transition. Reduced motion exposes the same ordered source/destination facts without requiring animation perception.

The authoritative move can identify a private refill card. Projection replaces its identity with null for every other viewer; all public movement identities remain visible. Public event strings never name a private draw. Private refills update hand counts only. Returned/exchanged/answered public cards update remembered ownership; Add removes a card from remembered hand. Forged remembered entries that are not actually in the claimed hand are rejected at restore.

## Application, settings and persistence

App settings are separate from rule state: player display names, local/solo mode, reduced motion and tutorial cursor. Names use 1–40 trimmed characters, default `You`; blank input produces `Enter a name.` without losing other values. The deal input accepts integers 1–999999, preserving entered data on invalid input. First-seat input covers 0 through N−1 using visible player labels. No extra keyboard input is required during tutorial.

Use a new schema-6 storage namespace under the existing Prod/Live separation. Preserve old schema-5 bytes. Import does not convert an old game into a different game. Offer recovery/export of the original data, without promising a playable archived Build 5 runtime. A valid import is validated atomically before replacing the current in-memory session. Saving failure does not stop legal in-memory play.

Local handoff covers the display before rendering a new private seat view, including incoming responses. Reload covers private data until the intended viewer takes the seat. Public history, offers, Resting cards and remembered identities remain public. Browser-side state is a physical-playtest implementation, not a claim of cryptographic hidden-state security.

## Tests and amendments

The explicit E/P/A/S cases and tutorial trace are the behavioral source of truth. Add tests for move ordering and redaction, blank/overlong names, invalid deal values, first-seat bounds and atomic old-save preservation. If an encoding change is necessary later, amend this contract before implementation and preserve the public behavior; do not use a representation choice to change the game.
