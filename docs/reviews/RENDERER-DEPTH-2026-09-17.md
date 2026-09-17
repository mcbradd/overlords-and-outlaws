# Deck and board surface flicker

Player report: deck z-fighting and intermittent board artifacts. Diagnose with
the real CoreTable renderer, original textures and seeded public state. Capture
baseline and controlled single-variable probes before choosing a fix.

Regression requirements: separated physical stock layers; printed faces above
stock caps; stable card faces/deck/board at overview and close camera distances,
including dense Courts and Played piles. Preserve shadows, 63:88 geometry,
engraved source art and camera controls. Inspect actual before/after images.
Do not declare the cause from source parameters alone or flatten the board.

## Observed cause and correction

Codex inspected the real Chromium captures. At distance 4500 with FOV 15,
`artifacts/core/depth-before/far-detail.png` shows cream horizontal stock stripes
cutting through both Court portraits and the deck. Changing only the near plane
from 1 to 50 removes those stripes (`depth-near/far-detail.png`). This isolates
camera depth precision; shadows remain enabled. Separately, constructed geometry
proved 1.5-unit deck and 1.7-unit Played spacing intersects 3.5-unit stock/face
bounds. Both piles now use 3.6-unit spacing. The near plane is safely below the
350-unit minimum camera distance. Original textures and shadows are unchanged.

The retained `core-depth-probe.ts` checks deck and Played separation and depth
precision at the farthest interactive zoom, capturing 450/1800/4500 views.
After inspection: `depth-after/far-detail.png`, full-browser
`1440x900/062-dense-four-courts.png` and
`1440x900/005-tutorial-01-recruit-outcome.png` have intact faces and board surfaces.
This is actual Chromium evidence, not a guarantee for every GPU.

## Played pile examination

Click/tap a public Played card to open that owner's pile as a spread of physical
reference faces. Every card is inspectable, with a Back to Played pile route;
closing returns to the board. The tray scrolls horizontally on small screens.
Inspection is read-only and pauses empty-hand automatic passing like other dialogs.
`core-played-fan.ts` tests both six-card piles at 1440×900 and 390×844, using mouse,
touch emulation and keyboard, inspecting all twelve cards without a revision change.
Codex opened `artifacts/core/played-fan/1440-pile-0.png` and `390-pile-1.png`:
faces and Close remain readable, with the next card visibly indicating the scroll.
