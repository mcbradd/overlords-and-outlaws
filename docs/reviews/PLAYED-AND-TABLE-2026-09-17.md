# Played cards and stable council table — 17 September 2026

Canonical 63:88 faces put names in Dynasty-colored top frames above portraits, preserving the large full-bleed rank/logo corner. Played cards sit immediately left of their owner's Court, with exposed name strips. Long piles use adjacent fixed stacks of eight so later cards do not push components across the table. Existing cards retain their slots when a card leaves. New Court cards fill vacant slots; new Played cards append. Camera scale and seating order survive ordinary turns and shared-device handoffs. Explicit focus, pan, zoom and viewport changes remain available.

The board is navy damask cloth inside a dimensional walnut/brass rim. Three-player desktop seating uses two rivals above the local Court; labels are inset clear of ornament. Asset and exact generation prompt: [council cloth](COUNCIL-TABLE-ASSET-2026-09-17.md).

Played inspection uses the dimmed viewport directly, with only cards and Close visible. Cards fit a viewport-sized grid without scrolling or an inner panel. Tap/click or keyboard activation enlarges one card. Clicking anywhere on the enlarged layer or Escape dismisses it and restores focus. Close dismisses the viewer. Entry, enlargement and dismissal have short transitions, disabled by reduced motion. Hidden overview cards are inert while enlarged.

## Verification

The build, 180 unit tests and 3 UI tests pass. Stateful renderer checks cover Court/Played removals, additions, stable coordinates, unchanged projected sizes, viewer handoff and retained manual focus on desktop and phone. Browser probes cover Played inspection at 1440×900, 390×844, 844×390 and 3840×2160, all twelve cards, keyboard/touch paths, viewport bounds, no panel styling/scroll overflow and no game mutation. An additional animated 14-card pile was checked. Full legal tutorial completion passes at 1440×900, 390×844 and 844×390.

Actual images inspected by Codex in this session:

- `artifacts/core/table-review-1440.jpg`, `table-review-390.jpg`, `table-review-3840.jpg`: 2/3/4-player openings, legal actions, dense Courts and manual Court focus.
- `artifacts/core/player-counts/3p-3840-dense.png` and `3p-390-dense.png` individually.
- `artifacts/core/played-fan/1440-table.png`: ownership, exposed Played names, left-of-Court placement.
- `artifacts/core/played-fan/390-pile-0.png`: only cards and Close, no inner panel, no scrolling.
- `artifacts/core/played-dense/390-zoom-0.png`: enlarged card at full usable width; `390-pile-0.png`: fourteen-card fit.
- `artifacts/core/all-name-frames.png` and `corner-proof.png`: all 52 names fit; rank 10 and Queen across four Dynasties retain proportion and suit identity.

Inspection fixes included the obsolete inner-panel CSS, the unclaimed Crown colliding with the local seat, explicit focus no longer fitting after the stability change, outcome text shifting Pass sideways, and mobile viewer handoffs rearranging seats. Compact whole-table views necessarily show small cards; deliberate Court focus and full-card inspection provide reading views. Checks use Chrome and emulated viewports/touch, not physical-device testing. Full Main release suite is not claimed; this is a Prod evaluation candidate.

## Tested implementation blobs

- `src/core-game/app.ts`: `ae2ab6b344e4a84cd02108ffa2c5f846bb271d0e`
- `src/core-game/scene.ts`: `a1e1a32312885bea39add183c73c783c154c05b4`
- `src/core-game/scene.css`: `027011bfac90aa44f5ce220f3e8a4155a10592ad`
- `src/core-game/face.ts`: `88efc3c48ce399a9b60323b613c0926068a36eed`
- `src/core-game/style.css`: `d88008a2f77a0c9df8aa6d46c5c5dcfd89f4a073`
