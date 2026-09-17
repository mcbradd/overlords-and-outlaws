# Correction-cycle systems critique

17 September 2026. Parent review of `src/core-game/ai.ts`, previous reducer audit and the first five screen-only games. This is an adversarial design perspective, not a panel of human experts. Conclusions remain provisional until ten games complete and cross-review closes.

## Proposal: retain the core rules while making threats inspectable

The observed player has used failed claims, known-card trades, foreign attacks and reserved defenses to recover and win. That is evidence against discarding the core solely because the presentation fails. It is not evidence that the current policy offers sufficient opposition: the first five games are all player wins, and the player is an experienced reasoning agent rather than an ordinary new human player.

The highest-priority rules-facing correction is visibility of already-public information. The AI remembers `knownHands`; the player must currently reconstruct those cards from prior Played areas. Exact Trade then requires choosing a historical name from a list without the rank and Dynasty that make the choice valuable. This is avoidable interface difficulty rather than strategic uncertainty. Preserve uncertainty about genuinely hidden cards while exposing the provenance of already-known ones. Any memory display must update only from public events and visibly distinguish known cards from remaining unknown hand count.

## Antagonistic challenges requiring tests

1. **Premature claims may make the AI predictable.** The current claim score strongly rewards starting succession even when no defensive card remains. Prediction to test: at equal public states, the policy claims into an obvious known threat while a development or reserve line has a demonstrably better next-round prospect. A failing strategic fixture must precede any score change; inspect the full resulting sequence, not a preferred-action assertion alone.
2. **Automatic defense may create false opposition.** Noncritical defense starts with a positive protection value and discounts hand value. Prediction to test: it spends a useful answer protecting a low-value person when the successful exchange would give it a stronger card, or when a second visible dependency needs that answer. The test needs an explicit alternative outcome and no secret-state advantage.
3. **Repeated public attack patterns may be too easy to exploit.** Games 4 and 5 show the player preserving a higher answer against a known lead across boundaries. That can be legitimate memory-based planning. Test whether the rival has a meaningful alternative target, trade or timing option that it systematically ignores. Do not solve this by allowing AI knowledge of the player's hidden hand.
4. **Four-player pacing may dilute agency through waiting.** The four-player game lasted about 35 minutes with roughly 45–55 user actions. Distinguish reading/tool overhead, deliberate decisions, animation time and repeated pass/reset interactions before altering the round rule. A visible readiness/pass status may reduce uncertainty about timing without adding a new resource.
5. **A low heir plus high defense may dominate heir choice.** Rank already changes the opportunity cost of committing an heir, but the board role may make low rank the default whenever eligible. Seek a concrete counterexample using marriage compatibility, exact exchange value or known enemy resources. If none exists, reopen the rank-design session with alternatives and their added teaching/manufacturing cost; do not claim rank depth from the existence of 13 labels.

## Defense of the proposal

Changing the resource economy again before diagnosing these issues would discard useful evidence and make the completed games incomparable. Improving opponent policy alone could also conceal an underlying dominant line. First expose public facts, correct the renderer and controls, then compare the existing rules under specified alternatives. Any rule amendment must update the normative suit/rank design, session record, master specification, tutorial dependency graph, printed references and exact boundary tests before implementation.

I support the experience plan's consistent Trade verbs, automatic tutorial action framing and shorter redundant instruction. I reject removal of private information, automatic successful tutorial moves or weakening opponent responses to manufacture more wins. I also reject a purely numerical pass criterion for player agency: the report must contain actual choices and counterexamples.

## Required additions to the draft plan

## Family-game follow-up: competing simplification proposals

The user's new family/sixth-grade constraint supersedes the earlier preference to retain the core by default. Retention now needs a simple explanation and visible example. The following are proposals for cross-defense, not rule changes or implementation authorization.

| Proposal | Benefit | Objection and evidence needed |
|---|---|---|
| Keep the succession rule but represent its two stages with a physical Crown marker and a clear heir/supporter placement. Teach each move through one short line and visible movement. | Preserves claim, transfer and protection without asking the player to mentally track a paragraph. | A diagram cannot redeem needless timing complexity. A fresh learner must predict the next Crown movement and win boundary from the current board; if not, simplify the timing itself. |
| Remove Trade's special immediate lower-native Recruit; every accepted Trade uses the same exchange destination and return timing. | Removes a nested exception and makes exchanges consistent with card commitment. | May remove the strongest reason to offer a high card for a low one. Compare recovery, voluntary acceptance and pace using the same visible-state cases before adopting. |
| Limit exact Trade requests to cards publicly known in the other hand, presented directly as cards. | Removes guessing historical names and a large request list; makes offers concrete. | Changes bluffing and barter options and may shrink agency. Alternative: allow unknown requests through a simple rank/suit picker, with no implied ownership. Test both surfaces and their required explanation. |
| Remove the separate Queen-role requirement for the first family core; defer foreign marriage until it earns its explanation cost. | Removes the Q-versus-Queen ambiguity and relationship exception chain. | May make foreign cards feel useful only for attack/trade and flatten the theme. Compare a simple same-rank pair rule against complete deferral; neither is selected yet. |
| Keep passing and round reset, but make readiness/end-of-round visible through physical markers. | Could show why another play reopens turns without repeated prose. | Adds components and could reintroduce bookkeeping. If several sentences are still required, consider a simpler round procedure with explicit card commitments and test its defense opportunities. |

The preferred first candidate is consistent exchange timing plus a visible succession sequence, with marriage and passing required to demonstrate their own clarity. This is deliberately provisional. No amount of reduced copy passes FAMILY-01 if the ordinary rule still needs a paragraph to understand.

The one-line tests should use concrete examples: “Play a higher card of the same suit to block.” “Swap these two cards.” “Keep these two people safe until the round ends.” These are comprehension probes, not complete adopted rules; the panel must identify any hidden condition each line omits. An omitted important condition is a design objection, not a reason to print a smaller second paragraph.

- Add public-knowledge provenance and memory parity to C07, with tests that hidden cards never enter the display or policy observation.
- Add comparative public-state fixtures for the five challenges above to C13 before changing AI or rules. Preserve original policy outcomes for comparison.
- Distinguish human usability validation from agent play; neither the current blind learner nor simulated policies establishes human preference.
- Keep the correction cycle's rules decision open until the ten-game cohort and panel cross-defense finish. A presentation-only correction is a valid outcome if no rules change earns its added complexity.
