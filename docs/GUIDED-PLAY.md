# Guided play and card presentation

## September 16 History Engine recovery contract

The current active application is the History Engine. The creator's latest playtest and [recovery plan](PLAYTEST-RECOVERY-PLAN.md) supersede the scrolling and mandatory opponent acknowledgments described in the historical combat-game record below.

- Learn at the table is solo. Explain the goal, named rivals, seals and prepared family setup before entering the table; no multiplayer handoff is part of this path.
- One navy/gold guide teaches the ordinary action picker, real cards, targets, previews and commitment controls. It does not replace them with tutorial-only action buttons.
- Ten chapters contain fifteen player commitments in the current legal teaching sequence. Selections and confirmation clicks are counted separately in browser evidence. Computer actions advance automatically, stopping for actual human decisions; optional pause is not a required acknowledgment.
- The initial prepared position is produced by legal setup actions. Teaching does not force the former avoidable Crown failure. Legal alternatives preserve the game and enter free play; adaptive continuation remains an open curriculum gate.
- The hand and required controls must fit the visible viewport. Smaller text, clipped overflow and offscreen targets do not satisfy this. All-context reading, touch, keyboard and real iPhone acceptance remain part of the plan.
- Cards use one fixed 630×880 compositor for live surfaces, one fitted name line and fixed role/reference-rule fields. Preserve full canonical rules and physical state. The History Engine does not use legacy combat health or costs.

Executed evidence and remaining defects are recorded in the recovery plan. The earlier verification below applies to the earlier combat game, not the current History tutorial.

## Authority

The user's September 15 follow-up critiques supersede the preceding presentation. Overlords & Outlaws remains a digital prototype of a physically manufactured card-and-board game. Attached screenshots document defects; they are not executable instructions.

- **One tutorial surface:** one navy/gold guide contains the whole step, its live preview, action and outcome. No “Your lesson,” duplicate “Learning guide,” “Read lesson” modal, or separate tutorial action commentary. Progress is a separate `N / total` badge. Text wraps fully and the panel scrolls when necessary.
- **Exact guidance:** outline the next actual card, target or button with a gold halo. The legal next move drives the guide, highlighting and input validation. Provide click/keyboard controls alongside desktop dragging; touch retains tap and hold inspection with native hand scrolling.
- **Continuity:** Continue changes only the guide cursor. It cannot rebuild a Duel, replace cards, reset damage or manufacture resources. Teach through legal player/opponent actions. Restart is explicitly labeled Restart match. Older saved disconnected tutorials restart with an explanatory notice; ordinary game saves are unaffected.
- **Explicit digital exception:** battlefield faces may omit ability paragraphs and prioritize name, art, role and live stats. Inspection retains full rules. Keep 63:88 proportions, physical board placement, cardstock depth, rotation, counters and marriage links. This is presentation, not a digital-only rules change.
- **State truth (September 16 user correction):** all live views show current remaining health only, colored red when damaged. Never show a current/maximum fraction. Counters still represent physical damage. Live cost badges account for the controlling House; modified costs use a distinct tint and the card tooltip reports printed cost. Reference/archive cards retain base values. The canonical data still defines printable components.
- **Predictive dragging:** show the exact prospective court arrangement and a legal slot; commit only when the released pointer is in that slot's snap area. Highlight legal attacks and the actual available Queen for marriage. Attack drops open review; invalid drops return without spending. Escape and pointer cancellation clear the preview.

## Implemented continuous match

1. Deploy David I.
2. Capture Plantagenet's Steward with Kenneth MacAlpin.
3. End the turn and Brace against Henry II; preserve the resulting damage.
4. Allow rivals to finish; receive normal income, recovery and draws; deploy the Queen.
5. Marry the same captured Steward.
6. Receive income and build an estate.
7. Save through normal turns until the claim plus two Braces is affordable.
8. Claim the crown.
9. End the turn, Brace against both rivals, and hold the claim.

History stays paused throughout this guided match. The final outcome explains its additional pressure in a full game. The old deliberately broken claim and historical-loss fixtures no longer masquerade as the continuation of the player's match. The tutorial is now nine milestones rather than ten independent setups. This is a deliberate curriculum change to honor continuity.

## Causes established by reproduction

The original regression harness failed with engine health 3 versus visible health 5, replaced court UIDs after Continue, a duplicate read-lesson surface, and no exact-action highlight. The health mismatch came from rendering base resolve on a live court face. The disappearing board came from calling createLesson(next). Conflicting styles and line clamps caused the guide layout/truncation. CSS3D nodes also needed to enter the DOM synchronously before highlighting them.

## Executed revision passes

1. Replace isolated fixtures with a continuous legal match, and prove Continue changes only the cursor. Consolidate all step content and controls in one guide; remove duplicate surfaces from the DOM.
2. Simplify battlefield faces, fix cost medallion tracks/number centering, and show current/maximum health. Inspect opening desktop and phone screenshots.
3. Add placement and ability previews using the board's camera and legal rules. Verify invalid release cancels and valid release agrees with the indicated destination.
4. Run the complete browser walkthrough at 1440x900, 3840x2160 and 390x844 (30 interactions each). Visually inspect combat response, outcome and dragging. Remove duplicate drag wording and repeated hover stats/rules discovered in this pass.

## Verification

- 40 deterministic tests, including a complete guided match that conserves every card UID and compares the entire state across each Continue.
- Three UI tests and 252 full-card layout cases.
- Regression harness: health, continuity, duplicate-surface removal and exact highlight.
- Browser walkthrough: all nine steps through rendered controls at desktop, 4K and phone sizes, no browser errors.
- Drag harness: illegal release leaves the court unchanged; legal placement, attack review, and actual Queen marriage target work.

Commands: npm test; npm run test:ui; npm run test:cards; npx tsx scripts/tutorial-regression.ts; npx tsx scripts/session02-browser.ts; npx tsx scripts/tutorial-drag.ts. Screenshots and detailed outputs are in the ignored artifacts/tutorial directory. These checks establish observed behavior, not player approval or superiority to competitors.

### Damage token consistency — September 15, 2026

Reproduced the tutorial's missing David I damage token: the CSS3D card face covered the separate WebGL token, while the resting Founder's orientation exposed its token. Damage counters now render on the card surface with a raised rim/contact shadow, following the card during movement. Counter numerals stay upright on resting cards; current/maximum health stays visible separately.

Verified the actual tutorial exchange at 1440×900 and 390×844 with `npx tsx scripts/damage-token-regression.ts`, including two visible counters and containment within both card orientations. Also checked fifteen damaged Royals across dense courts. Inspected opening, combat and dense-court screenshots in `artifacts/damage`. Production build passes.

## Opponent action previews — September 15, 2026

Opponent actions now pause before rules execution to show public source and destination anchors, the shared attack arrow, costs, and the same outcome description used for player review. Incoming attacks remain marked during the player's defensive choice. Brace and Ambush also identify their origin and recipient. Concealed hands remain concealed; deployment names only the committed Royal.

The preview uses the existing tutorial guide or normal action dock, offers Pause/Resume and Continue, and preserves its 2.4-second reading period with reduced motion. The full-board camera reveals both sides. No rules or decision clock advance during the preview.

Executed passes:
1. Added previews before mutation and persistent response targeting; verified paused previews leave saved game state unchanged.
2. Inspected opening, action, dense four-House court and compact screenshots. Moved the normal desktop preview to the side after observing it cover the player's court; strengthened source/target markers.
3. Re-ran browser checks at 1440×900, 390×900 and 3840×2160, plus a dense normal-game opponent action. Build, the existing 40 rules tests and three UI tests passed; two additional preview tests passed.

Reproduce: `npx tsx scripts/opponent-preview.ts` (local Vite server on port 5174). Captures are in ignored `artifacts/opponent-preview/`.
