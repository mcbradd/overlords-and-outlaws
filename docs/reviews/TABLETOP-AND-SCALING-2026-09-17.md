# Tabletop controls and player-count scaling — 17 September 2026

Current player requests supersede the previous bottom dashboard and per-rival
Recall limit. Deliver a board-dominant view, hand fan, contextual actions,
drag-to-target without confirmation, ordinary wheel zoom, empty-space pan,
a rotating first-player emblem and required 2/3/4-player verification.

## Rules decision

Each Court person may face **one Recall attempt per round across the whole table**.
Commitment consumes the attempt whether defended or accepted. A round boundary
clears it. The ruler remains vulnerable as a separate person. Thus a supporter
and heir face at most two attempts per round with 2, 3 or 4 players; the old
limits were two, four and six. Native recruitment, marriage, trades and the
claim-and-hold duration remain unchanged. A small crossed token marks a used
attempt. Existing saves retain their attack evidence; future legality takes the
union of all attackers' attempted targets.

This bounds exposure, not a guarantee of equal win probabilities. A weak early
attack can use a person's allowance and deny a later stronger attacker; that
political timing tradeoff needs human multiplayer testing. More players still
change suit supply, turn order, bargaining and competition.

Matched policy simulation: 64 seeds per cohort/suit-seat configuration, 2,176
games before and 2,176 after. See PLAYER-COUNT-SCALING-2026-09-17.json.

| Players | Games per candidate | Wins before → after | Mean rounds before → after | Recalls/game before → after |
|---|---:|---:|---:|---:|
| 2 | 896 | 896 → 896 | 4.94 → 4.94 | 9.42 → 9.42 |
| 3 | 896 | 889 → 896 | 5.54 → 5.25 | 21.81 → 18.41 |
| 4 | 384 | 382 → 384 | 6.08 → 5.47 | 35.86 → 26.25 |

Every two-player record is identical. The existing policies already usually
finished multiplayer games: these observations do not substantiate a claim
that victory was mathematically impossible. They do support reduced multiplayer
attack burden without altering two-player play. Deterministic rejection and
round-reset tests cover all three counts (red before correction, green after).

## Interaction and visibility

Hands overlap as tangible 63:88 cards; hovering/focusing lifts a card and reveals
its local actions. Choosing an action highlights legal targets. Dropping on one
commits exactly once; an invalid drop changes nothing. Touch and keyboard can
select the highlighted target instead. Trade spreads the eligible public Played
cards into a target tray. No private rival faces are exposed. Printed reference
faces remain inspectable. Menus pause automatic passing; the two-second empty
hand button remains. Tutorial instructions occupy one top strip; no bottom
information panels, repeated concealed-hand counts or To Act labels remain.

The first-player coin follows game.first, not the current actor. Camera pan is
available on empty space; wheel zoom needs no modifier. Courts stack on compact
screens with the viewer nearest the front. Court focus supports reading dense
positions; overview supplies spatial context.

## Required verification

The release inventory includes core-tabletop and core-player-counts. The latter
covers 2, 3 and 4 players at 1440×900 and 390×844, each with opening, a legal action,
nine-card-per-Court dense state and focused reading view. Capture generation is
not inspection: a reviewer must actually open them, record findings and fix
failures for each count. This requirement applies to Prod too; see RELEASE.md.

First local visual pass found hand corners touching the bottom edge and a stale
focus layout limiting compact Court height. Both were corrected before the next
capture pass. Final inspected files and served candidate identity are recorded
with deployment evidence under artifacts/core.

Final local visual review: Codex opened all 24 player-count screenshots in
`artifacts/core/player-counts/` (2p/3p/4p × 1440/390 × opening/action/dense/readable-focus).
Readable focused faces and controls passed; dense overview deliberately requires
Court focus or zoom for individual names. All fan corners stay on screen. Deck
and Crown now occupy the compact layout's side space. Capture hashes and reviewer
findings are in the artifact manifest. Keyboard, touch, invalid-drop cancellation,
first-player rotation, complete desktop/phone tutorials, marriage and Trade
browser routes passed. The build, 172 unit tests and 3 UI tests passed. This does
not claim a full Main release run, blind-player testing or hardware-device testing.
