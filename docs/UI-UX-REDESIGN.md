# UI/UX redesign — 15 September 2026

## Outcome

The game now puts readable, front-facing cards in explicit House courts, with a compact contextual rail for actions, lessons, and optional details. It retains the historical portraits and House colors with thin frames and consistent card cells. The engine, saved-game format, modes, and private handoffs remain compatible.

The [research study](knowledge-base/digital-card-game-ux-research.md) compares 16 games, documents three guideline passes, scores six dimensions with explicit unknowns, and explains apparent outliers. Scores summarize scoped primary reports; they are not blinded validation, population sentiment, or proof that O&O is more enjoyable than competitors.

## Diagnosis and design decisions

The original screenshot combined three problems: fixed-height panels crowded the board, perspective and opponent multipliers shrank its cards again, and multiple frame-coordinate overrides competed with text and symbol placement. `npx tsx scripts/ux-layout.ts --baseline` reproduced the board/card failures before the fix. A temporary panel-budget probe increased the first lesson's arena from 250 to 407 pixels without fully correcting projected card size, confirming that a CSS-height fix alone was insufficient.

1. Replaced projected WebGL/CSS3D playing pieces with semantic HTML court lanes. Ownership, counts, readiness and marriage labels stay attached to pieces. The existing renderer interface still handles sync, motion and disposal.
2. Moved lessons and actions to a stable rail. Hover/focus detail stays in that rail on desktop; explicit full inspection works on every layout. Removed repeated idle instructional panels.
3. Removed decorative frame overlays. Names, portraits, roles and stats occupy explicit grid cells. Hiding the ability paragraph on glance cards cannot accidentally move stats into a zero-height row.
4. Collapsed empty hands. Public House summaries use a compact two-row grid. Dense courts and hands scroll rather than compressing every card. Narrow screens provide rival tabs, and short screens allow vertical scrolling.
5. Added text readiness states, visible hand counts, scroll discovery cues and selected `aria-pressed` state. Preserved focus and hand/lane scroll positions through updates. Escape cancels attack review without spending an order.
6. Kept mouse drag as an optional shortcut; touch movement scrolls rather than accidentally playing cards. Tap selection and explicit action buttons remain the primary touch path.
7. Shortened repeated feedback, preserved the detailed event history, and retained motion settings. Inspection now uses the current controller's ability and cost.

## Measured ordinary-play layout

Identical deterministic three-player positions, four Royals per court. Dimensions are CSS pixels. These are geometry checks, not player enjoyment scores.

| Viewport | Original arena height | Revised arena height | Representative smallest rival card height, before → after |
|---|---:|---:|---:|
| 1920 × 1080 | 401 | 641 | 62 → 204 |
| 1440 × 900 | 333 | 470 | 51 → 153 |
| 1024 × 768 | 201 | 370 | 31 → 110 |

The baseline failed the desktop board-share and card-size gates; the revised build passes them. These project gates (45% viewport board height, 90 × 105 minimum card bounds) are engineering choices derived from the observed failure, not universal research thresholds.

## Verification

- Build and TypeScript checks pass.
- All 40 rules tests and 3 UI integration tests pass.
- All ten lessons complete through browser controls, including capture, marriage, defensive responses, broken/successful claims and the shared loss.
- Eighteen dense cases cover 2/3/4 players at 3840×2160, 1920×1080, 1440×900, 1024×768, 844×390, and 390×844. Each has five cards per court and seven hand cards. Every court card is reachable, stats stay inside cards, summaries stay inside their header, and keyboard selection, full inspection and cancellation work without spending orders.
- All 84 card faces at widths 200, 280 and 384 pixels (252 cases), including two-digit health, pass ability/role/stat containment checks.
- Mouse-drag deployment, touch-hold inspection and outside modal dismissal pass. Compact four-player family testing covers an estate attack, private defensive response, modal keyboard focus and private save/resume.
- A 200% root-text-size probe can open the inspector, with no horizontal modal overflow and vertical scrolling retained. This is a text enlargement probe, not comprehensive browser zoom or accessibility certification.
- Screenshots were inspected after each layout iteration. This caught low-contrast role labels, hidden compact inspection controls, oversized summary content, and a 4K stat-row mismatch beyond the first geometry checks; all were corrected.

Reproduction commands: `npm run test:layout`, `npm run test:browser`, `npm run test:cards`, `npx tsx scripts/session02-browser.ts`, `npx tsx scripts/interaction-v3.ts`, `npx tsx scripts/family-browser.ts --compact --four --estate` (development server on port 5173).

Machine-readable evidence is under [testing/ui-ux](testing/ui-ux/). Local screenshots are in ignored `artifacts/ux/` and `artifacts/v3/`. The older `scripts/full-table.ts` specifically tests the superseded projected-table assumption that every viewport fits without scrolling; `test:browser` now points to the readable-layout checks.

## Practical limits and next evidence

The desktop layout is the primary simultaneous-board experience. On narrow screens, one rival court is visible at a time and dense rows require scrolling; the tabs retain ownership/count context. On very short screens the page scrolls. This is deliberate prioritization of readable targets over a miniature all-at-once board.

The redesign has not been tested with a representative panel of human players. First-glance comprehension, touch comfort on physical devices, screen-reader usability and relative enjoyment remain human-testing questions. The study's proposed next round is a counterbalanced old/new O&O task comparison: identify the turn and resources, inspect/play a card, cancel an attack, explain a result, and continue a lesson. Measure task errors and searching separately from enjoyment. Do not claim superiority from automated checks.
