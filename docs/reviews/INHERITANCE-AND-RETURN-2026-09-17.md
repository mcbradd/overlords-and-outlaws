# Inheritance restored and Court withdrawal — 17 September 2026

## User instructions and implemented behavior

Restore the original 3–2–1 draft and establish a Dynasty by playing three matching Nobles. Add returning a Court Noble to hand as a turn action. These instructions override the assigned-Dynasty/founder opening in Builds 5–8.

- Choose 2–4 players and that many shared Dynasty card sets. No seat owns a suit at setup. Deal eight Nobles, including Founders as ordinary draft cards.
- Each player selects three, then two, then one card privately. Each packet moves clockwise only after every player finishes that pass. Received cards may be passed again.
- Privately select three matching Nobles; the first is the chosen ruler. Reveal Courts together after all declarations. Five cards remain in hand. Duplicate Dynasties are legal.
- A failed matching-trio hand is revealed, draws the top card, and sets aside a different-Dynasty card. Repair in first-player order; shuffle the set-aside cards into the remaining deck after setup. This follows the repository's original repair procedure and needs no computer-only allocation solver.
- Draft choices commit immediately. There is no confirmation or tutorial Continue between those selections. The single guide advances to the next real card. Later succession teaching retains cursor-only Continue.
- Hover/focus a controlled Court card to use **Return to hand · uses turn**. Touch inspection exposes the same action. Returning clears consecutive passes, moves the card directly into hand, records the publicly known identity, settles marriage and Crown dependencies, and advances the turn. A returned ruler leaves the office vacant under the existing core rules.
- Empty hand plus an available Court withdrawal is not an automatic pass. The two-second draining Pass remains for a player with neither hand actions nor Court Nobles. Pending responses remain explicit decisions.
- Setup, tutorial, rival names, objective, empty-Court captions, reference aids and save messages no longer assign a Dynasty or Founder to the player. Shared deck selection is distinct from declaring a Dynasty.
- Saves use a new inheritance ruleset/key. Prior saves remain in storage and are not rewritten into the new opening. Start a new table.

## Verification and visual revisions

Actual browser flows are instrumented regression evidence, not blind human playtesting. The policy simulation completes 544 games across 2/3/4 players, all suit combinations and policy/seat rotations, with no unfinished or cap-draw games. This does not prove balance or rule out deliberate withdraw/recruit loops; the round limit advances only when players pass.

179 unit tests and three UI tests pass. Required coverage includes unit tests for packet privacy, conservation, legal declaration, duplicate Dynasties, the four-player no-trio repair, exact replay/save boundaries, Crown failure and marriage break on withdrawal. Existing action tests use an explicitly named post-setup fixture helper; real opening simulations and the new browser suite use production createGame.

Browser evidence lives under `artifacts/core/inheritance`, `artifacts/core/build9-counts`, `artifacts/core/build9-browser-final`, `artifacts/core/build9-browser-phone`, and the interaction-specific reports. Two full desktop/compact tutorials complete. The new full setup flow runs every player count at 1440×900 and 390×844. The Court matrix has 24 opening/action/dense/focus captures.

Actual review opened the 24 matrix views in per-player contact sheets (compact images at their original width), plus original draft/declaration and Court-action captures. The overview is a spatial map at high density; use Court focus/zoom to read individual names. All player configurations have that route. Hand cards retain 63:88 proportions and the available-width fan. The eight-card compact fan exposes each rank; focus/inspection reveals a whole card.

Fixes prompted by real captures and hit testing:

1. Remove the pre-declaration “No ruler · recruit to recover” caption. The top guide already explains declaration; repeated tiny empty-Court labels add no information.
2. Stop already-selected draft cards intercepting the next selection; prioritize the focused card and the tutorial's exact next card in the overlapping fan.
3. Keep the Court action beside its card while the camera moves, and retain it while keyboard focus moves to the action.
4. Split new reference material into separate readable aids; a detected overflow was shortened and re-rendered, not reduced to small type.

Prod publication and deployed revision checks are recorded in the task delivery. Main remains untouched.
