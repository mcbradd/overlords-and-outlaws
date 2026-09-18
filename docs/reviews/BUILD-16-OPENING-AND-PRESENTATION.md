# Empty-Court opening and presentation review — 18 September 2026

Implementation reviewed by Codex. Scope: the new Ruler → opposite-gender Spouse → Heir sequence, equal Dynasty composition, pending-card presentation and the associated tutorial. Main remains locked; this is a Prod evaluation candidate, not a full-release approval.

## Rules and roster

All four Dynasties have thirteen unique ranks: female 6, 7, 8, 10, J, Q; male A, 2, 3, 4, 5, 9, K. Seven additional portraits are recorded in [the art manifest](../art/CORE-ROSTER-PARITY.md). Original source art is unchanged. The separate rule actions expose the developing Court between founding, marriage and Claim. A surviving spouse succeeds the removed Ruler without changing the Court Dynasty. Ruler and Heir must still survive the complete next round.

## Verification and actual revision passes

- Unit suite: 181 passed; UI suite: 3 passed. Production build and TypeScript compilation passed.
- Seeded simulation: 24 games across 2/3/4 players. Dedicated rules regressions cover equal rank/gender assignments, the four-high-card opening, opposite-gender eligibility, spouse succession and a foreign widowed Ruler completing succession.
- Scripted draft/founding/Recall checks: 2/3/4 players, desktop and phone. Complete legal tutorial: desktop, portrait and landscape phone. Tutorial/ordinary-play board and hand rectangles are identical.
- Challenge interaction checks: 1920×1080, 1366×768, 1440×900, 360×800, 375×667, 390×844, 414×896, 430×932 and 844×390, with 2/3/4 players. Click, touch, drag, invalid drop, Retreat, single-option and multiple-option paths exercised.
- Offer presentation: 1440×900, 3840×2160, 375×667, 390×844 and 844×390. Both cards remain visible; Challenge leaves the hand accessible. Source coordinates follow the visible Challenger; resolution clears the arrow. Trade uses “your Played pile.”
- Browser smoke exercises introduction, complete tutorial, setup, inspection, dense Courts, Claim states, Challenge and Trade responses, and invalid import recovery at 1440×900 and 390×844.

Rendered revisions were actually opened during work. Findings corrected: room/board perspective mismatch, flat wood caused by incorrect texture repeat, stale arrow canvas after resolution, guide placement changing when an empty footer disappeared, overlapping mobile header text, Court name/role collisions and landscape guide dismissal obstruction. The surround now shares the physical board camera. Role and pile labels respect their physical widths, and cards have dedicated clearance below Court headings. Inspection uses the viewport directly rather than a nested panel.

## Evidence

Local artifacts under `artifacts/core/`: `revision16-*.log`, `player-counts/`, `inheritance/`, `tutorial-overlay/`, `offers/`, and `local-smoke16/`. Player-count captures include opening, action, dense and readable-focus views at 1440×900, 3840×2160 and 390×844 for every supported count. The signed-off candidate SHA and individually inspected capture paths are recorded in `artifacts/core/visual-review16.json` after the candidate commit; deployed identity and smoke results are recorded in `artifacts/core/prod-smoke16/`.

Compact whole-table views are spatial overviews; their small physical cards require the existing Court-focus controls for reading and inspection. No claim of full release-suite completion, blind human playtesting or universal visual preference is made.
