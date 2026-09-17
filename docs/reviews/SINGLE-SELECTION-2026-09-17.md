# One selection, one action

User instruction: "Once a player has made a selection, never also confirm it."

Choosing a complete legal action commits it immediately. This includes an
action button, a target/bargain in a selector, Pass, Accept and Decline, in
ordinary play and the tutorial. No Confirm/Cancel approval stage follows.
Selecting a hand card can still expose its different actions; it must not
guess which action or target the player intended. Inspection stays read-only.
This supersedes older confirmation requirements in the presentation contracts.

Regression boundary: actual rendered application and persisted reducer revision.
Card selection alone spends nothing; the action choice increments revision once,
advances to the legal outcome/handoff and renders no confirmation controls.
Tutorial Continue remains cursor-only. Existing full tutorial, marriage, Trade,
response, keyboard and touch routes must use the same direct action behavior.
Check opening/action/dense/compact renders and preserve unrelated user files.

## Empty-hand pass amendment

The user additionally requests a two-second draining fill on Pass when the hand
is empty, automatically activating at zero. Clicking sooner still passes once.
This is an ordinary action-turn convenience, not an engine rule: incoming
Trade/Recall responses still require their own choice. Never run through a
private handoff, terminal state, completed tutorial step or open dialog.
Starting a different session or manually passing must cancel the stale timer.
The visible countdown starts only once the rendered table is ready. Preserve
the same delay in reduced motion, using discrete fill changes.

Browser tests must assert the empty-hand timer, a decreasing computed fill,
no early pass, exactly one automatic pass, immediate manual pass, modal pause,
and no timer for held cards or pending offers. Inspect desktop and phone frames.

## Validation

Local build, 169 unit tests and 3 UI tests passed. Full core browser run passed
96 captures with the tutorial completed and no failures; app audit passed.
Single-selection revision check, extended primary hover/focus, keyboard first
move and touch first move passed. Empty-hand checks passed on desktop and phone,
including reduced motion and an empty-handed recipient's pending Trade decision.
Codex inspected the opening, Recruit outcome, dense Court, compact timer and
Played fan screenshots. The timer's gold fill visibly drains within the button.
These are instrumented browser checks and actual screenshot review, not blind
player validation or a claim that the full Main release suite was run.
