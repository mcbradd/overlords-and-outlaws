# Hand, draft, challenge and tutorial presentation — 17 September 2026

Reviewer: Codex. This records performed browser checks and rendered-image inspection, not player preference research. Main was not promoted.

## Delivered behavior

- Opaque, right-edge-under hand fan; large full-bleed heraldic rank/Dynasty corner. Green selections rise without redundant text.
- Centered PASS below the hand, 3/2/1 packet selection and concealed backs in flight. Computer packets are privately planned before the human passes. Observed exchange start: 1–3 ms after PASS across two, three and four players.
- Dynasty/Rank display-order toggle, preserving cards and pending selections.
- Challenge/Defend/Retreat language; Recall returns your own Noble to hand. Short action labels have native plain-English hover tooltips.
- Desktop hover-then-Defend commits with one click; touch select-then-Defend and direct table drag also work. A single concrete action accepts any table destination; ambiguous actions do not auto-select.
- Yellow buttons pulse, with OS and in-game reduced-motion support.
- Tutorial guide occupies reserved footer space with no backdrop. Continue does not change game state. Table movement precedes the next guide. The tutorial legally demonstrates forced Retreat before claiming the Crown; the explanation sits at the actual response button. Normal play also names the Noble who must retreat.

## Verification

- Production build; 180 unit tests; three UI tests passed.
- Three draft rounds at 17 viewport sizes: 1920×1080, 1536×864, 1366×768, 1440×900, 2560×1440, 360×800, 375×667, 390×844, 412×915, 430×932, 844×390, 414×896, 384×832, 1280×720, 1366×1366, 393×873, 360×780. Checks include card opacity, selection colors, pass counts, concealed-flight counts, reduced-motion pulse and nonoverlapping hand anchors.
- Challenge matrix: click, desktop hover, touch/mouse drag, invalid drop, Retreat, unique and ambiguous actions at nine viewport sizes, with 2/3/4 players. Final compact/landscape checks include the named forced-Retreat explanation.
- Full legal tutorial to victory at 1440×900, 390×844 and 844×390. Sorting checks at four sizes; all three ordinary draft exchanges at 2/3/4 players; opening/action/dense courts and focus navigation at desktop and phone widths for 2/3/4 players.
- The obsolete immediate-draft-selection probe was updated to the requested reversible packet/PASS contract and passed.

## Actual visual inspection

Opened rendered images in this session:

- `artifacts/core/review-1440.jpg` and `review-390.jpg`: opening, action and dense courts for 2/3/4 players.
- `artifacts/core/final-layout-review.jpg`: desktop, compact portrait and landscape draft/guide states.
- `artifacts/core/corner-proof.png`: rank 10 and Queen across all four Dynasties, preserving 630×880 card proportions.
- Individual challenge response screenshots at 1920×1080, 1366×768 and 390×844; `challenge/375x667-forced-retreat.png`.
- Individual `draft/844x390-3-selected.png`, `sort-375.png` and `tutorial-popover/390-opening-popover.png`.

Revision passes corrected landscape opponent/hand overlap, an overly narrow tutorial text column caused by the floating Close button, and center-card test clicks hidden by the requested fan overlap. Tests now use exposed card corners. Compact tutorial explanations scroll within their reading area; Continue remains visible. Small landscape boards retain focus/zoom controls. Checks used desktop Chrome and emulated touch/viewport sizes; no claim of physical-device testing.

## Tested implementation identities

- `src/core-game/app.ts`: `c6868ade185423e0f365cb02d46d860238619ccd`
- `src/core-game/style.css`: `f4bf56d0ef0b6143e93a7e8edc666b5a78a53fb1`
- `src/core-game/face.ts`: `766abc19cd8b4284e0e4bdd9d1b0cac471599fab`
- `src/core-game/tutorial.ts`: `0ecb24cfecbd7b75237f93024bef98bdc5229a47`
