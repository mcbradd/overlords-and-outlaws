# Playthrough 03 — actions, reading and the physical table

The September 16 first-playthrough transcript reports a failure to understand why moves matter, compounded by duplicate commitment clicks, unreadable/transient rival actions, a small blurry board and website-like card presentation. This record addresses that transcript; it is not a claim of player approval or proven strategic depth.

## Changed behavior

- Overlords & Outlaws is the main title. The designer's book title no longer replaces it. The counterfactual-relationships editorial note remains in source/history context, not the title screen. Buttons and notices use consistent rounded corners.
- The introduction states the win condition and explains three actions per round before introducing seals. Stage guidance explains benefits, payments, alternatives and risks before commitment. It no longer claims the player has remaining actions when their budget is zero, calls Richard a Queen, or promises claiming is safe after rivals also refresh.
- Marriage is described honestly as optional development: Richard can help challenge Crises, but cannot fill Alba-only heir slots. Blocking with equivalent matching cards is identified as the same defense with a different temporarily unavailable hand card. Regency's longer hold period is explained before choosing a Crown route.
- The action dock is shared by teaching and normal play, positioned at the bottom on desktop. Categories are visible buttons; compact screens use a labeled Other actions control. Action buttons carry costs and consequences and commit once. The private trade procedure retains its actual consent stages, without adding UI confirmations.
- Alternatives remain legal. Leaving the demonstration sequence preserves the exact resulting match and keeps position-based guidance, including after resume. It does not pretend every alternative follows the scripted curriculum.
- Rival announcements have a reading-time countdown (at least five seconds), hover/focus pause, explicit pause/resume and Continue now. Inspection stops execution. Source/target highlights and arrows persist for defensive responses. The last action's result remains inspectable. Travel animation requires actual visible anchors; arbitrary offscreen destination animations are removed.
- The full table uses a wide seating arrangement on wide displays. Card textures avoid the tone-mapping change that made them unlike their hand versions; cardstock, table lighting and shadows remain three-dimensional. Names have readable attached labels in the overview. Crisis cards now occupy the shared table; their floating panel no longer covers courts.
- Hands use a perspective fan, lifting the hovered/focused face while keeping Inspect stationary. Paging and arrow-key navigation retain access to all cards. Selecting a hand card exposes applicable moves; inspection can show that card's moves. Corners use a consistent physical radius, with a matching rounded cardstock silhouette. A fixed-coordinate printed title cartouche contains name and role. Original art is unchanged.

## Executed feedback loop and revisions

`scripts/playthrough-recovery.ts` first failed on the real Pass path: revision 27 remained 27 after clicking Pass. The same command now checks single-click commitment, the visible countdown, a seven-second hover pause, explicit advance and an alternate legal plan that retains guidance across reload.

Subsequent actual browser checks found and led to corrections for: long action choices overflowing the dock; equivalent Cover choices repeating; lifted faces obstructing adjacent cards; reduced-motion Inspect clicks lost when their hit target moved; empty hands collapsing the action dock; action pagination overlapping choices; warning overlays covering dense courts; and insufficient compact-screen room. These are executed revisions, not hypothetical iteration counts.

## Verification

- Production build; 135 unit/rules tests; three UI tests.
- Complete legal teaching flow at 1440×900, 3840×2160, 390×844 and 844×390, including solo resume, inspection pause and hot-seat privacy. Fifteen player commitments now take sixteen clicks (including the initial card selection), versus thirty-one previously. Tests use Continue now to expedite rival previews; this is optional in actual play and not counted as a player decision.
- Eight dense/maximum-court configurations across those sizes, with inspection, handoff and private reload checks.
- 184 face compositions: 92 canonical sources in compact/reference formats, glyph bounds, operative text and hydration.
- Actual screenshots inspected by Codex: `artifacts/playthrough/title.png`, `artifacts/history/opening-prepared-1440x900.png`, `decision-22-1440x900.png`, `decision-22-3840x2160.png`, `decision-22-390x844.png`, `dense-whole-1440.png`, and `maximum-court-3840.png`, plus the intermediate Pass/hand captures used to correct defects. These artifacts are local and ignored by Git.

The full Main release suite has not been run and Main promotion is not authorized. These changes do not rebalance the game or establish that marriage, trading, or the scripted example is competitively compelling. A new unaided playtest is still needed to judge comprehension and choice quality. Phone checks used Chrome viewport emulation, not a physical iPhone.
