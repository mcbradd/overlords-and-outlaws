# Court protection and concealed draft — 2 October 2026

Every Court Noble other than its Ruler and named Heir protects those two offices, including a spouse. Remove all protectors before challenging either office. A defended challenge or an attempt marker does not remove protection. Adding another Noble restores protection. Matching Dynasty, defense ranks, exchanges, and one challenge attempt per person per round still apply.

Draft packets contain only cards from the original deal: 3, 2, then 1. Received cards remain face down and unavailable for selection, inspection, and AI evaluation until the final simultaneous exchange reveals all eight cards to their owner. Public views contain counts rather than concealed received identities. Draft saves retain the concealed packet metadata. The new ruleset rejects older saves with a request to start a new table; loading does not rewrite their stored bytes.

The continuous tutorial retains two original cards and uses its newly revealed cards to found, marry, recruit a protector, claim, lose the last protector, and defend the exposed Heir. Rival draft narration does not reveal packet identities. Continue still changes only the guide cursor. The AI prioritizes defeating Nobles who protect a rival Crown claim.

## Executed verification and revision passes

- Added deterministic engine/privacy/save/replay tests for two, three, and four players, including forged challenges against protected offices, defended protectors, the last spouse leaving, and received-card value permutations.
- Revised legacy succession fixtures to expose offices through legal withdrawals before challenging them. Spousal succession remains tested through the owner's Recall, since the spouse now prevents an opposing challenge against its Ruler.
- Added `core-court-guard.ts` to the release inventory: rendered target exclusion, legal protector defeat, office exposure, and actual Heir challenge at 1440x900 and 390x844 for all three player counts.
- Extended `core-inheritance.ts` to check concealed packet counts, absence of identifying DOM/inspection controls, and sorting without revealing or changing packets. Checked all private handoffs, all three exchanges, final reveal, founding, and Court Recall for two, three, and four players at desktop and compact sizes.
- Full tutorial browser walkthrough passed at 1440x900, 390x844, and 844x390. Draft readiness with motion passed all three exchanges for all player counts. Twenty-four projected-view simulations completed without invariant failures; these are not human playtest evidence.
- Printed Challenge aid overflow was found and repaired by splitting it into 2a/2b without shrinking type. Inspected both 630x880 cards and the revised inheritance aid.
- Fixed sorting's handling of anonymous received backs and a stale response ResizeObserver during private handoffs, both exposed by the new browser checks.

## Actual visual inspection

Reviewer: Codex. Local captures under `artifacts/core/player-counts/`: opened the opening, legal action, dense Court, and Court-focus screenshots at 1440x900 and 390x844 for each of two, three, and four players. Examined hand fan, ranks, Court placement, private rival backs, first-player emblem, controls and Court navigation. Dense whole-table views remain overviews; Court focus provides readable public card identities. No new overflow or overlap of required action controls was observed.

Opened draft stage-two desktop and compact screenshots under `artifacts/core/inheritance/`: original cards remain face up, received cards are anonymous backs, and PASS and sorting remain accessible. Opened tutorial exposure, defense and hold screenshots at desktop, portrait and landscape sizes under `artifacts/core/tutorial-popover/`: the single guide remains legible, leaves board geometry intact, and highlights the actual legal response.

The exact published SHA, deployed build identity, and final inspected live captures are recorded in the local verification artifacts after publication. This evaluation does not authorize a Main release; the complete Main promotion suite is separate.
