# Read the card: sixth-grade language revision

16 September 2026. Candidate content: `r4-3ff12c6b`. Applies to the default History game on **prod**, not the preserved legacy game or Main.

The design target is a sixth-grade reader who can understand a card's immediate purpose and predict its result after learning the small shared rules reference. Short wording is useful only when it keeps the actor, target, timing, payment and destination clear. This revision is a playable proposal for review, not a claim of proven comprehension, optimal balance or player preference.

## Evidence and the complete card audit

- [Clarity research](research/card-language-clarity-2026-09-16.md): primary publisher design accounts, published rules and W3C cognitive guidance; a five-part rubric and a real-reader test protocol.
- [Language-system research](research/card-script-language-2026-09-16.md): primary sources on small languages, grammars, deterministic interpretation and language testing.
- [All 92 cards](research/card-clarity-audit-2026-09-16.md): mechanical intent, original wording weaknesses, before/after scores, word counts and content hashes. These are editorial scores, not measurements from children.

The audit covers the latest default game: 52 Nobles, 4 Laws, 12 Crises and 24 painting fragments. The separate legacy combat game's 84-person archive is not this ruleset. No portraits or source artwork were replaced.

## What changed in the game

Every Noble now prints executable actions. Hand and Court lines tell players which uses belong where. Queens state the marriage requirements. Founder is explicitly a historical label, not an extra ability. Compact battlefield cards retain inspection of the full reference face.

The public vocabulary now uses **Recruit, Recall, Block, Trade, Lend, Cover, Withdraw, Challenge, Help, Draw, Marry, Claim the Crown**. In particular, Recall and Claim the Crown no longer sound like the same action. A Noble in hand and a Noble in Court are described directly. Interregna are called Crises. Dynasty, Court, Bloodline, Ruler and heir remain stable relationship terms with a short shared reference. The underlying save/action identifiers retain their former names; those are not player instructions.

Laws state entry requirements, the exact heirs and Witness or marriage, what must remain, the round-start Ruler change, the full-round win requirement and failure. Tudor also explains revealing and returning an unused hidden heir when its claim fails. Crown progress uses the actual compiled schedule. The game exposes a **Your Law** inspection button.

Two mechanics were simplified deliberately:

1. **Border Rising:** each player with a Ruler retires one other Bloodline Noble, if possible. The hidden protection for the final two native Nobles is removed. Growing a Court creates options and exposes people to loss.
2. **A Disputed Charter:** the Crown holder returns one other Bloodline Noble to their hand, if possible. A special list of “Crown dependencies” is no longer required to resolve this card. The chosen departure can still break an actual Law requirement.

The remaining core mechanisms retain their existing behavior: shared draft, concealed hands, three action seals, marriage support without chains, competing succession Laws, public Crisis contributions and Eudoxia's painting threat. Crisis text now specifies start/round-start/end timing, shared contribution totals, and exact destinations. War of the Succession says that a due Crown claim fails rather than suggesting it is postponed. The Open Record credits both Trade participants. Forced loans from The Imperial Settlement explicitly do not count as Help. A Broken Recognition shows the originally marked Nobles in its inspection view.

## The printed text is executable source

`src/history-engine/content.ts` owns the authored English. The custom version-2 compiler reads those same strings and produces typed instructions. HTML faces, Canvas faces, the archive and print kit display that source through the canonical round trip; there is no second, shorter ability paraphrase.

The language is deliberately small and closed. It supports phase clauses, known physical actions and selectors, bounded numeric goals and durations, and named maintenance requirements. It does not accept arbitrary English or execute JavaScript. Unknown, repeated, conflicting or impossible clauses fail with a card ID and line diagnostic.

- Noble clauses grant the actual permitted actions. Removing Recruit or Marry removes that permission in legal play.
- Law clauses determine entry counts, heir selection, required relationships, transfer delay and winning duration. The old whole-paragraph-to-route shortcut no longer supplies those rules.
- Crisis digits set contribution totals and duration. Fragment digits set placement and immediate loss conditions.
- Shared action verbs still have core definitions, just as a physical game has a rulebook. Those definitions include payment, privacy and movement; the reference is available beside inspected cards and in the print kit. This is not a claim that every card reprints the entire game.
- Source, grammar, dictionary, compiler and interpreter versions contribute to save compatibility. A prior incompatible save is preserved for export instead of silently being played under new rules. Future engine-only semantic changes must bump `INTERPRETER_VERSION`.

## Executed revision passes

1. Reproduced 52 empty Noble instructions and four Laws without parsed requirements using a failing regression command. Audited all cards against actual rules, then added typed clauses and real-engine mutation tests.
2. Replaced overloaded or technical player vocabulary. Revised the action previews, tutorial, card archive, physical labels and shared action reference to use it consistently.
3. Independently reviewed source against behavior. Added precise timing, destinations, hidden-heir recovery and contribution-credit wording. Fixed active marriage/Trade/Cover credit for supported custom Crisis scripts and rejected impossible script combinations.
4. Reviewed fixed 63:88 faces. Longer Queen text overflowed; reduced the portrait area on full reference faces while retaining the body font. Printed Queen instructions also touched the collector footer; reduced print portrait height and added a footer-clearance check. Compact battlefield art remains large.
5. Replayed the teaching match and checked dense/maximum courts, compact screens, private handoffs, save reloads and the final card proofs. Inspected actual rendered images, not only automated measurements.

## Verification and its limits

Passed: 99 unit tests, 3 UI tests, and the production build. Commands: `npm test`, `npm run test:ui`, `npm run build`, `npx tsx scripts/history-simulate.ts`; with `HISTORY_BASE_URL` pointing to the local Vite server: `npx tsx scripts/history-browser.ts`, `npx tsx scripts/history-layout.ts`, `npx tsx scripts/card-language-proof.ts`, `npx tsx scripts/card-language-ui.ts`, `node scripts/history-proof-check.mjs`.

The compiler/runtime tests change actual authored text and check actual move legality and outcomes. The simulation completed 132 games across every two-, three- and four-Dynasty combination with card conservation and deterministic legal play; 128 ended in player wins and 4 in Eudoxia wins, at most 9 rounds. This is policy coverage, not evidence of balanced human play or a predicted session duration.

The browser walkthrough executes all 59 teaching actions, verifies that Continue changes only the guide, and checks six viewport sizes and privacy. The dense probe checks six full/maximum board configurations, including 52 Court Nobles. The card probe checks all 92 full faces at two widths (184 HTML cases) plus 92 Canvas faces. Print checks cover all 92 source cards, including footer clearance. A phone UI regression opens the player's own Law and A3's original marked Nobles, and proves inspection leaves all game state unchanged. The print kit now supplies 17 marriage pairs to match the actual 17 Queens.

Actual images inspected include `artifacts/history/opening-draft.png`, `lesson-25.png`, `dense-1440.png`, `maximum-390.png`, and the full/phone Noble, Queen, Law and Crisis proofs under `artifacts/card-language/`. Regenerate these ignored artifacts with the commands above. The reports identify the content version used.

The largest remaining evidence gap is a real first-time sixth-grade reader. Test prediction before action, not whether a guided click-through finishes: ask the reader to identify a legal target, explain what moves where, pay correctly, and say when a Law or Crisis resolves. Record unprompted mistakes and revise from those observations. Shared action lookup and multi-round Crown planning remain the chief comprehension risks; this pass does not certify that every child will understand every card unaided.
