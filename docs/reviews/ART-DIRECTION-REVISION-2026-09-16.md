# Art-direction revision — September 16, 2026

## Scope and evidence

The current default product is `src/history-engine`, not the legacy combat game. This revision preserves the History Engine rules, its stat-free Noble cards, private hands, executable reference text, 63:88 geometry, seals, Crown, marriages and inspection. No deployment or commit was performed by the art-direction agent.

I actually opened and viewed the deployed default opening and demo, and the deployed `?legacy=1` title as reference. Captures: `artifacts/art-direction/before-title.png`, `before-board.png`, `legacy-title.png`. The legacy screen established the missing visual vocabulary: authored family ornament, a rich chamber, collectible portraits and material depth. Its old combat values and mechanics were not imported.

## Diagnosis

The previous History Engine presentation used generic double-line card rectangles, 113px hand cards with 7px role text, a uniformly olive table, tiny projected labels, and large undifferentiated empty surfaces. Its enlarged 4K table was surrounded by much smaller controls. The illustrated House assets were already available but unused. Reference correctness alone did not preserve the visual identity.

## Implemented changes

- Restored the original chamber as the scene context and reused the existing engraved marble/map board as a texture on the real Three.js board, retaining solid edges and physical components. Original art files were not changed.
- Reused the four applicable generated **perimeter** overlays on Noble and reference faces. These have no obsolete cost or combat-stat fields. The old battlefield/full-frame fittings would falsely imply absent mechanics, so they were not used.
- Enlarged hand cards to 168px desktop, 160px phone and 200–250px at large displays. Rebalanced portrait/name/role fields; full names wrap; text clears the lower illustrated emblem.
- Enlarged two-player court cards, projected court names, counts and role markers. Ruler status now has a high-contrast physical label. A failed Recall attempt reads `SAFE FROM RECALL THIS ROUND` rather than implying successful removal.
- Increased compact card names and roles, removed developer qualifiers such as `historical label` from compact views, and retained exact reference instructions separately.
- Strengthened the navy/gold decision panel and scaled its typography, controls and supporting labels for 4K.
- Restored separate, balanced title cards with proportional typography and enough space for complete names and roles.
- Made court-camera fitting depend on the actual court dimensions. Focused narrow courts support native horizontal scrolling with a visible instruction. Whole-table view remains available. Private hands retain their own horizontal scroller.
- Limited the dense History rail's height with native scrolling so a dozen events cannot stretch the adjacent hand into an enormous empty panel.

## Actual revision passes

1. **Material and composition:** restored chamber, authored frames and textured board; enlarged hand/UI. Rendered title, opening, focused court, dense court, phone and 4K. Found title role clipping, hand role/crest collisions, dense History rail stretching, and narrow court-camera clipping.
2. **Optical corrections:** reserved the lower emblem area, fitted title typography to card width, constrained History, replaced the fixed camera zoom with court bounds, enlarged Ruler markers and restored the wider board silhouette. Re-rendered and viewed the affected scenes.
3. **Legibility and compact access:** increased compact canvas lettering, removed unnecessary qualifiers, added court panning, then found an intrinsic-width hand regression on the phone. Constrained the hand to its panel and verified the page is 390px wide while only table/hand scroll internally.
4. **Final review:** reran captures at 1440×1000, 390×844 and 3840×2160; viewed opening, dense/focused courts, a committed Recruit, its review, the actual inspection dialog, phone and 4K. Also viewed the 52-card maximum court fixture produced by the existing layout suite.

## Verification and reproduction

- `npx tsc --noEmit`: passes.
- `HISTORY_BASE_URL=http://localhost:5182 npx tsx scripts/history-layout.ts`: passes all six dense/maximum scenes, inspection, handoff, packet/reload privacy checks with no browser errors.
- `node scripts/art-direction-action.mjs`: executes a legal Recruit through rendered review/commit controls, captures the actual result and inspector, and checks all **92** canonical DOM reference faces at 340px for bottom overflow. Zero failures in `artifacts/art-direction/reference-fit.json`.
- `npx tsx scripts/art-direction-check.ts`: title, opening, court, dense and dense-court capture matrix.
- `node scripts/art-direction-pan.mjs`: verifies viewport/page width both 390px, independently scrollable 720px court and 526px hand, and captures the panned result.
- `node scripts/art-direction-capture.mjs`: before/default and legacy-reference captures from the deployed site. Use only to reproduce the historical comparison, not to test local changes.

Artifacts are ignored screenshots under `artifacts/art-direction/` and `artifacts/history/`; this report records work actually performed. App/tutorial wording is owned separately by the parent agent, so screenshots may precede its final wording pass.

## Tool choice and limits

The session exposed Adobe tools. No Tripo or Blender tool surfaced during discovery. This deliverable was composition, existing-art integration and typography; generating new models or images would not fix the diagnosed regression. The existing perimeter and board artwork suited the physical-game direction without editing source assets or adding external dependencies.

Dense whole-table views are still overviews: individual reference reading requires a court camera and/or inspection, especially on phones. Chrome/WebGL and existing semantic fallback were exercised; this is not a claim of validation on every browser, GPU or phone. A 390px screen scrolls vertically to reach the hand and horizontally within a focused court. This revision does not claim user approval, comparative player preference, a release-suite pass, or manufactured print readiness.

## Integrated guide and wording review

After the main art pass, styled the new guide objective, explicit card selections, checked states, result list, free-play exit and paired Trade inspection cards inside the existing navy/gold guide. Added `.h-teaching-target` halo styling for the application's exact-next-interaction markers. Viewed selection/Trade at phone, desktop and 4K using `npx tsx scripts/art-direction-guide.ts`.

The expanded Noble wording (`r4-e086ac2a`) **invalidates the earlier reference-face fit result**. Rechecked the actual DOM, Canvas and regenerated print proof: all 52 Noble faces overflow. At 340px, ordinary DOM bodies exceed the card by approximately 89px and Queens by 168px; Canvas exceeds available space even at its existing 26px floor. The print proof also fails. Viewed `artifacts/art-direction/queen-text-overflow.png`, confirming missing final actions and Marriage text. Requested a wording reduction before reducing font size. Final integrated face signoff remains pending the corrected canonical text; the guide presentation itself fits.

## Final integrated signoff — r4-e434ad9a

The parent agent reduced the repeated Noble wording to complete, shorter sentences (80 words ordinary, 99 words Queen). The presentation groups related middle action sentences into one paragraph while retaining bold DOM action labels and distinct cost/final clauses. Reference body fonts are unchanged: 4.4cqw in the DOM, the existing 26–28px Canvas range and 9pt in the print proof. Header/paragraph spacing was adjusted; full reference portraits occupy a smaller header, while compact hand/battlefield portraits remain generous.

Final checks on **r4-e434ad9a**:

- All 92 DOM reference faces fit at 340px, zero bottom-overflow failures.
- All 92 Canvas reference faces report no overflow.
- All 92 regenerated print faces pass the existing bounds and footer-clearance checks. The last failure was a 0.28125px shortage caused by collapsing paragraph margins; a small ink-padding adjustment resolved it without changing type size.
- Actually viewed `queen-reference-proof.png` and `queen-print-proof.png`: final Marriage sentences and footer are visible, and the corrected print crop shows the Queen's face instead of forehead or neck.
- Re-rendered and viewed integrated opening, legal Recruit result, dense/compact courts and selection/Trade guide. Desktop guide scrolls; mobile uses normal vertical document flow. Two-column Trade offers, inspection labels, chosen-card checks and exact-target halos remain visible. The parent hooked halos only to controls that actually select the next required piece.
- Fixed an additional descriptive-action regression found in the final dense phone capture: flexbox was shrinking action buttons beneath their explanatory text. Action buttons now keep intrinsic height inside the native list scroller.
- Final TypeScript check passes. Earlier dense/maximum/privacy checks remain as recorded above. The parent separately ran the revised full 59-action tutorial walkthrough and usability tests; those are not claimed as art-agent executions.

Final reproduction scripts additionally include `art-direction-canvas.mjs`, `art-direction-print.mjs` and `art-direction-guide.ts`. The earlier failure records are retained as evidence of actual iteration; this section supersedes their pending-fit status. No release, commit or deployment was performed by this agent.
