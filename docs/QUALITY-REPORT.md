# Quality report — 14 September 2026

## Delivered build

Playable single-player vertical slice with six houses, 84 named Royals, eight historical events, three Witness paintings, nine encounter definitions, six heirlooms, a guided opening, four-court branching chronicles, skirmish, UTC daily challenges, archive, automatic saves, synthesized audio, and landscape touch layouts. Seventeen generated paintings and portraits, plus fonts, ship locally.

This is a polished prototype. Commercial AAA release quality has not been established by these checks.

## Automated verification

- `npm run build`: strict TypeScript checking and production bundling pass. JavaScript is approximately 60 KB (22 KB gzip); CSS approximately 61 KB (14 KB gzip), before art and fonts.
- `npm test`: 13 rule tests pass. Coverage includes atomic invalid moves, deterministic replay, draft conservation, 500 hostile drafts, protection, marriage loss, delayed claims, all six action families, save validation, and 180 full matches with state validation after every action.
- `npm run test:ui`: two DOM integration scenarios pass. A tutorial runs from inheritance through results; rapid save/resume during rival turns preserves action count; campaign navigation, archive inspection, settings, fixed daily selection, and replacement work. A separate winning-court scenario verifies one-time rewards and heirloom transfer into the next act. Audio and animation are mocked; these checks do not measure visual rendering.
- `npm run test:simulate`: 600 diagnostic matches terminate, 100 per selected house. Mean duration ranges from 9.98 to 11.68 rounds. The Witness wins 24–39% depending on the tested selection. The player-slot draft policy differs from rival drafting, so these numbers are diagnostics, not a fair house-balance study or evidence of human win rates.
- Dependency installation reported zero audit vulnerabilities at validation time.

## Visual and interactive inspection

Chrome inspection covered the home screen, 1440×900 drafting and declaration, card selection, a committed move with both rival responses, and the 844×390 landscape board. No console errors were reported during those inspected flows. Portraits, card framing, typography, court lighting, and layered backgrounds were reviewed visually.

The small landscape board was reworked into a tactical layout. Measured document dimensions matched 844×390, and the commit control remained inside the viewport. A subsequent CSS adjustment compressed the Witness panel to expose more of the public exchange. That final adjustment, and the final desktop height correction, could not receive another browser screenshot before computer control stopped.

## Iterations completed

- Recovered embedded PDF exhibit text and preserved contradictions separately from executable rules.
- Made unsuccessful drafting recoverable without creating or losing cards.
- Added a legal petition action for exhausted hands to avoid deadlock.
- Reduced protection accumulation and made crown claims spend protection to retain counterplay.
- Added explicit card inspection, suggested moves, event logs, move feedback, and mobile rules/settings access.
- Fixed cancellation of old AI timers when saving and rapidly resuming.
- Bundled fonts and compressed artwork; removed runtime font-network dependence.

## Remaining limits

- No independent human playtest, complete multi-act campaign browser playthrough, Safari/WebKit test, physical mobile-device test, or long-duration performance soak has been completed.
- Portraits are shared court archetypes, not 84 unique historical likenesses. Audio is synthesized rather than a recorded orchestral score or voiced cast.
- Balance and tutorial comprehension need human evidence. Difficulty labels and session estimates are design targets.
- Saves are local to one browser. Export is available; cloud synchronization and import are not implemented.
- The private GitHub repository was created, but remains empty: existing CLI credentials failed, renewed authentication required a human sign-in step, and browser file uploads lacked extension access. Local source and the Git history remain available for a later push.
- Native computer control ended because it could not confidently verify the current browser URL for policy enforcement. No further browser or native UI automation was attempted after that stop.

## Handoff

The Markdown knowledge base includes page-by-page text from all three PDFs and a separate transcription of illustrated card exhibits. Original PDFs, credentials, temporary files, dependencies, and generated build directories are excluded from source control. Deployment status and its exact URL are reported separately in the final handoff, after the hosting service confirms them.
