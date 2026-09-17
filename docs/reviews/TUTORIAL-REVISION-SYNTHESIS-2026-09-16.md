# Tutorial and art revision after observed play

16 September 2026. Prod candidate content `r4-e434ad9a`, Card Text compiler/language 2.1.0. Main remains frozen. This supersedes the earlier `r4-3ff12c6b` proposal for the default History game.

## What the playtest established

The [game-naive observer](BLIND-TUTORIAL-PLAYTEST-2026-09-16.md) completed all 59 steps and a round-four win using only visible player information, without hints or suggestions. It found no hard progression blocker. It did find a teaching failure: it could execute prescribed buttons without understanding the goal, selecting the pieces, or comparing strategic alternatives. Completion was not evidence that the game was intuitive.

The [separate familiar-player follow-up](TUTORIAL-FOLLOWUP-2026-09-16.md) used a frozen local build, completed the revised Trade lesson, then left the guide and made independent Recall, Challenge and Pass choices. It correctly anticipated costs, possible Blocks and crisis prevention. This is one adult AI surrogate, not a child study or a second blind test. Its uncertainty about long-term plans remains relevant.

## Observations translated into changes

| Observed problem | Revision | Evidence and limits |
| --- | --- | --- |
| The win goal appeared only after voluntary Law inspection at step 36. | Goal and Court/Dynasty/heir definitions precede the first selection. “How to win” shows the actual Law and current progress. | Follow-up could explain the goal at the start. |
| Most buttons silently chose cards, heirs and targets. | Required cards must be selected; confirmation remains disabled until selection is valid. Clicks on the actual Court card select it. Inspection remains separate. Block accepts any legal matching card. | Full 59-action browser checks; alternate Blocks all continue to a legal win. Most guided choices are still prescribed examples. |
| Same-family Trade seemed pointless; opponent offer name leaked before consent, then no cards appeared for comparison. | Trade exchanges an Alba defender for a foreign Plantagenet Recall/marriage option. Both consents precede actual “You give / You receive” cards. | Follow-up understood the sacrifice and opportunity and later used the received card for Recall. Automated privacy checks cover the consent boundary. |
| Results repeated stale text or only one of several changes. | “What changed” lists the current visible event batch, arrivals and seal/round changes. | Follow-up observed the simultaneous History changes and Trade settlement correctly. |
| Cover at two pieces and Help at round end looked wasteful. | Cover occurs with five pieces before the sixth appears. Help removes a Crown restriction while seals remain to exploit it. | Legal-state regression proves Cover prevents the next round's loss. |
| Forced Decline ignored an available Block. | First claim spends the last seal and suffers Recall; later claim reserves a seal for a real chosen Block. Removed a redundant Recruit. | Checks prove no Block exists at the first failure, and multiple legal Blocks work at the second. This teaches a concrete resource tradeoff. |
| Scripted victory gave no independent decision opportunity. | “Play freely from this position” keeps the entire current game and removes the guide. Normal action choices state source, target, cost, effect and risk. | State-equality browser test; follow-up made independent choices after exit. No claim that these were optimal choices. |
| “RECALLED THIS ROUND” suggested a successful transfer after a Block. | “SAFE FROM RECALL THIS ROUND.” | Reviewer correctly explained why Henry II was unavailable as a Recall target. |
| Familiar follow-up could not identify a claim's required Court Nobles. | Claim display names the public Ruler and required Court dependencies. | Uses the existing projected view and dependency rules; regression ensures a concealed heir is not named. Added after the frozen follow-up. |
| Follow-up saw “You can still Block” with zero seals. | Pass explicitly requires one seal and a matching hand card to Block later. | Contradictory unconditional promise removed after the frozen follow-up. |
| Selecting a card reset guide scroll. | Preserve scroll within the same lesson/state and focus without scrolling; reset for a new lesson/action. Shorten the repeated objective after opening. | Browser regression checks selection scroll retention. Added after the frozen follow-up. |
| Partial phrases and grammar obscured executable text. | Noble commands are complete sentences, with named actions, destinations and conditions. Law timing says “At the start of the next round.” Public events use correct You/verb and singular/plural forms. | All 92 sources compile and lint. Literal card sentences remain the parser input; no separate effect tables replace them. |

## Actual wording and visual iterations

The [art director's report](ART-DIRECTION-REVISION-2026-09-16.md) records the actual opening, action, dense Court, compact-screen and 4K inspections. The revised table restores the existing chamber, marble engraving and Dynasty frames. Hand names, roles and Ruler markings are larger. Dense Courts can be focused and panned, and descriptive action buttons no longer shrink beneath their text. Source art is unchanged.

An intermediate expansion of Noble text failed all 52 Noble faces. It was rejected. The next wording pass reduced ordinary Nobles to 80 words and Queens to 99, grouped complete sentences, and adjusted spacing and portrait crop. Final checks pass all 92 DOM, Canvas and 63:88 print faces with existing body fonts unchanged. These are fit checks, not proof that a child can read or understand every card unaided. The print footer clearance is tight and still needs physical prototype review.

## Verification

- 107 unit tests and 3 UI tests pass; all 92 sources compile/lint and production build passes.
- Full tutorial browser regression: 59 legal actions, exact expected state, Continue changes no game state, viewport/privacy/fallback/worker checks pass.
- Tutorial usability regression: explicit selection, no pre-consent offer leak, visible agreed offers, real Court selection, no misleading Inspect halo, scroll retention and state-neutral guide exit pass.
- Dense/maximum layout and privacy checks pass at desktop, phone and 4K. Card-language UI checks pass for Law inspection, original marked Nobles and state-neutral phone inspection.
- Art director inspected actual rendered opening, action, dense/compact Courts, Trade and Queen proofs; all 92 screen/Canvas/print faces fit.

This is a prod evaluation, not a Main release. The complete release suite and a real sixth-grade participant study are not claimed here. Existing saves from the earlier card language are preserved but rejected by the existing version check rather than silently interpreted with changed wording.

## Remaining design questions

The guided curriculum is long and mostly prescribed. The follow-up still could not confidently draft or compare long-term Crown plans. Historical Noble names do not imply unique abilities: Dynasty, branch and Queen role determine their mechanical differences, now explained in the rules. Dense whole-table cards remain overviews requiring focus or inspection. Card text still relies on a small shared vocabulary; this iteration does not establish the original ambition of perfect first-reading comprehension.

The next useful evidence is an unaided new human player making and explaining choices, particularly which Crown route to attempt, which card to keep for defense and when to stop a rival versus a shared crisis. One scripted win cannot settle balance, strategic depth or preference.
