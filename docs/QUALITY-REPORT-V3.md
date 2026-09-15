# Revision 3 quality report — 15 September 2026

## Delivered iteration

The full Play Session 02 transcript was reviewed before implementation. Its recurring causes were inconsistent terminology, unclear component identity, actions separated from their consequences, a protected tutorial hiding real opposition, and animations that failed to explain state changes. [The review](PLAY-SESSION-02-REVIEW.md) and [plan with delivery status](REVISION-3-PLAN.md) preserve the reasoning and remaining gates.

V3 replaces that teaching approach with ten small deterministic lessons using legal engine actions. A claim first breaks under a real attack; a later lesson wins by defending against both actual rivals. The last lesson demonstrates History and Eudoxia's shared-loss condition explicitly.

The interface now provides a bottom action dock, passive hover/touch-hold inspection, drag-to-play and drag-to-preview attacks, visible seven-card hands, named claim challengers, and separate contextual explanations for family, treasury, crown, estates, piles and painting fragments. House crests and role bands are consistent. Cards turn sideways when spent; Guardians visibly give up protection when they attack. Combat presents health transitions and dismissible announcements before continuing.

New chamber art, an illuminated gold frame, a new Margaret portrait, unobscured portrait windows and proportional full-card layouts improve the collectible presentation. Tiny board cards intentionally omit ability text; full inspection supplies readable detail. The 3D court layout centers each House and removes ambiguous colored planes. Legacy CSS is isolated in a lower-priority layer so older viewport overrides cannot silently defeat the new layout.

## Mechanics selected

- Guardians have 2 attack/5 health, enter upright, and protect other pieces only while upright and supported. Attacking trades away that protection.
- Surviving Royals recover health at the beginning of their House's next turn, making the interval of rival attacks the damage window.
- Each Queen supports one spouse. Losing her can remove dependent family membership and break a claim.
- Renew hand replaces one-card Recruit: pay gold and an order to discard the whole hand and draw five. Captured foreigners cannot permanently block native draws.
- Brace and Ambush cost two gold. AI preserves a response when Brace cannot save the doomed defender, avoids some futile attacks and does not deliberately sacrifice the last eligible family without a contesting reason.
- The claim remains three active family Royals, payment for the entire exposed court, and one complete turn per actual rival. Base income remains four. Cheaper-claim and lower-income experiments were rejected.

These are prototype adaptations, documented in [the current rules](RULES.md), rather than assertions that tuning values are historically necessary.

## Automated and browser verification

- 40 rule/regression tests passed, including all ten legal lesson paths, gold versus order versus capacity blockers, hand-renewal card conservation, recovery timing, Guardian orientation, rational Brace, competitive tutorial AI behavior, unsupported foreign Guardian previews and full-hand return destinations.
- Three UI integration tests passed: a complete two-player turn, one-time chronicle reward/inheritance, and V2 progression migration without loading incompatible match rules.
- Every lesson completed through actual browser controls in isolated Chrome. No browser errors were recorded.
- Full courts at 2, 3 and 4 seats were checked at 3840×2160, 1920×1080, 1440×900, 1024×600, 844×390, 667×375 and 568×320: 21 configurations with no page overflow or clipped card hitboxes. Every court card was clicked without forcing the click.
- Seven-card hand visibility, viewport-safe 4K inspection, real mouse dragging, touch-hold inspection and outside-modal dismissal passed.
- Compact four-player family testing passed private defensive response handoff, reload/resume privacy, estate targeting and keyboard dialog handling.
- A complete four-House normal game reached the shared-loss deadline in 26 rounds and 91 human-side actions/responses, with no browser errors, both with reduced motion and with full motion. The first motion attempt was interrupted by development reload; the next exposed an aggregate-wait limit in the harness. The harness now times out on inactivity rather than total accumulated match animation time. Final lesson checks also assert that the scoreboard, turn label and action dock agree on terminal state.

Type checking and the Vite production build passed. The Sites build helper failed because its Windows npm invocation resolved a missing project-local npm executable; the project's existing `npm run build` completed successfully. The lazy-loaded Three.js core still triggers Vite's 500 kB chunk-size advisory (approximately 134 kB gzip); no bundle warning was suppressed.

Screenshots and local machine reports are under ignored `artifacts/v3/` (some retained family scripts write to `artifacts/v2/`). These checks use desktop Chrome with emulated viewport/touch settings, not real phones or human comprehension participants.

## Simulation evidence

The selected rules completed **200 audited games plus 216 additional held-out games**. Repeated development datasets were reused for tuning and are not counted as independent held-out games.

The release audit found 621 tradeoff candidates among 5,372 audited opportunities (11.6%), mean 12.035 rounds, 145 House victories and 55 Eudoxia outcomes. Held-out games produced wins by economy, rush, defense and adaptive policies, mean 13.060 rounds and 65 Eudoxia outcomes out of 216.

The first V3 candidate stalled more often and took longer, so the loop made measurable recovery and pacing improvements. **The meaningful-choice proxy remains below V2, and many sampled states have no winning continuation.** All four policies winning does not prove balance. Seat-order differences remain substantial. Full classifications, raw data, candidate comparisons and method limits are in the [decision audit](DECISION-AUDIT-V3.md).

## Remaining quality limits

This is a substantial playable iteration, not certification of award-winning presentation or AAA release quality. A fresh human session must establish whether the contextual teaching removes the original misconceptions. The strategic design has not exhausted its possibilities: shared-loss frequency, first-seat advantage, weakly used crown actions and response choice diversity remain open.

Not established: real iOS/Safari support, low-end mobile GPU performance, complete accessibility/zoom certification, perfect historical likenesses or 84 individual paintings. Several figures still share portrait archetypes. Native House marks are designed visual identifiers, not authenticated heraldry. There is no online multiplayer, cloud save or original passing-draft implementation.

Combat uses structured before/after health, but the entire application is not yet a universal replayable event model. The plan's hidden-hand resampling, dedicated Guardian-only policy trials and complete auxiliary-action removal experiments are also outstanding. These limits are retained explicitly instead of declaring the original ambitious quality target achieved by test count alone.
