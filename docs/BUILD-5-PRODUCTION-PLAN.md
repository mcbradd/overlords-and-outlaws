# Build 5 production plan

17 September 2026. Status: preimplementation plan frozen in `3fbb734`; implementation and verification in progress. Source baseline `ebca68b`. This is a binding production checklist for the user's Build 4 transcript. A checked task requires its stated evidence, not merely code written or screenshots captured. Normative rules are in `SUIT-AND-RANK-DESIGN.md`; explicit tests U01–U49/B01–B11/O01–O04 in `BUILD-5-TEST-CONTRACT.md` govern the selected core.

## Ordered goals

1. Make concealed cards create uncertain interactions whose outcomes depend on reading public relationships, available resources and competing uses for the same card.
2. Make the table and each card legible, tangible and immediately actionable, with public facts separated from hidden possibilities.
3. Make the path from the present move through the round to a succession victory explicit.
4. Teach the smallest playable core through controlled legal actions, starting with one leader and two hand cards. Remove seals and the universal verb toolbar. No unexplained History, paintings, loans or side navigation in the introduction.

These priorities are ordered. Added spectacle cannot excuse unreadable state; added sub-games cannot excuse compulsory choices or an incomprehensible core. Build 5 will be identified as a core succession prototype if advanced History is staged out. That is an explicit scope decision, never a claim to have completed all advanced systems.

## Before implementation

| Task | Deliverable | Required tests / completion criteria |
|---|---|---|
| P01 Baseline and authority | Preserve existing edits; record baseline SHA, served revision and rejection evidence; read release, physical direction, guided play and designer decisions | Existing changes enumerated; Main unchanged; actual opening and introduction visually inspected; baseline checks reported with actual counts; conflicts with R4 explicitly enumerated |
| P02 Antagonistic panels | Systems, experience and production reports; integrated candidate followed by cross-review | Every retained action has a suit/rank consequence and opportunity cost; rejected proposals have reasons; exploit objections get adjudication or named empirical gate; no simulated perspective presented as a human expert |
| P03 Binding design cascade | Replace obsolete normative seal economy in suit/rank, session record, master specification, tutorial and creative contracts; cross-reference earlier decisions | One authoritative core definition; precise setup, timing, response, circulation, marriage, victory, empty-state and privacy rules; advanced-mode boundaries explicit; no mutually governing contradictory rules |
| P04 Task and test freeze | This complete checklist plus concrete engine scenarios and screen/asset inventory | Every implementation task has acceptance criteria before code starts; record planning-freeze commit/hash; later discoveries require written task/test amendment before their implementation |

## Implementation tasks and acceptance criteria

| Task | Deliverable | Required tests / completion criteria |
|---|---|---|
| I01 Ranked content | Explicit A–K mapping, operative abilities, full names, suit symbols and rule glossary, retaining original portrait IDs | Exactly 13 unique ranks per selected suit, 52 total identities; mapping independent of collector numbering; every card has a legal development or tactical use and response opportunity; operative text matches behavior; all cards have readable full reference faces |
| I02 Card economy | Versioned deterministic core reducer, card locations, legal actions, atomic responses and round boundaries | No seal field or cost in active core; conservation after each action; invalid/stale actions mutate nothing; every action's card source and destination explicit; finite progress proof; reversible pass / pass / action resets count; all-pass ends round exactly once; empty hand/deck and failed exchanges recover or terminate explicitly |
| I03 Rank contests and circulation | Shared suit/rank comparison, draw/trade/recall/withdraw semantics selected by P03 | Exhaustive comparison boundaries including Ace exception if retained; legal response once only; failed attack still spends card; low lead and high lead have different exploitable risks; no stolen/recruited card can fund an unbounded same-round loop; exact trade consent and privacy; withdrawal cannot repair an already failed Crown |
| I04 Institutions and objective | Core Court, relationship support, Crown claim, succession and full-round protection | Cannot claim without printed prerequisites; lose each dependency before/after transfer; transfer only at correct boundary; claim round never counts as reign; no simultaneous Crowns; marriage removal has explicit consequences; no unique required rank makes all victory routes impossible; objective UI matches engine in every phase |
| I05 Projected AI | Same legal public view as player, concealed uncertainty, seeded policy alternatives | Identical public states with permuted unseen hands/deck yield identical available observations and initial policy choices; no future draws/other hands in AI inputs; defensive and aggressive policies both have concrete counterexamples; no tutorial immunity; all decisions lawful |
| I06 Storage and recovery | New save namespace/schema, defensive decoder, replay, private handoff | Legacy saves preserved byte-for-byte; current saves reload at every decision and response stage; invalid/corrupt/newer saves explain recovery; public exports omit hands/deck/private commitments; handoff never flashes a private hand; seed/replay deterministic |
| I07 Legal controlled curriculum | Dependency graph, one guide, exact next target, fixed legal action sequence | Starts one leader and two hand cards; no unexplained advanced objects; every noun introduced before use; full card names match; only taught interaction and Exit tutorial operable; Continue never changes board state; incorrect choice cannot bypass gate; pointer/touch/keyboard complete same sequence; reload preserves lesson and actual state |
| I08 Product opening and assets | Single authored title treatment, coherent 63:88 card compositions, full portrait coverage and correct role labels | Inspect actual title and every card face; no duplicate title, redundant branch tag, exposed navy holes, mismatched rounded frame, clipped portrait or unreadable index; source art unchanged; derivative provenance and chosen tools recorded; fallback communicates failed asset without blank scene |
| I09 Physical board | Real 3D board/card bodies, material/contact shadows, deliberate component slots, useful camera | Opening/action/dense Courts visible without hand/dock occlusion; source and destination evident; pan/focus/reset accessible; eased moves and reduced-motion equivalence; no floating shaded panels impersonating components; Crown and relationships never obscure faces or labels; low-GPU fallback retains identical information |
| I10 Card-led interaction | Select card, read its small legal choice set, target and consequence before commitment | No permanent universal action toolbar; only available card abilities shown; unavailable targets explain visible reasons without leaking hidden facts; selection not mistaken for commitment; cancel costs nothing; inspected rules available with keyboard/touch; response consequences remain until read |
| I11 Responsive reading | Shared typography, spacing, safe-area and visual-viewport layout | Operative body text target at least 16 CSS px, ordinary guide text 18px desktop; no shrink-to-fit solution; multi-line text left aligned; 44px action targets; 200% zoom/reflow; every matrix screen visually read at actual size; phone landscape and simulated keyboard leave focused input and submission visible |
| I12 Load and motion | Predecoded next-screen assets, stable transition, announced movement | Cold/warm navigation has no white flash or missing pieces; unresolved assets keep readable loading state with retry; no illegal game mutation while loading/animating; reduced-motion conveys same cause/outcome; slow network and asset failure exercised |
| I13 Reference and coverage tools | Print/reference faces, card gallery, state fixtures, meaningful unit/property/browser tests and release inventory | 52 rank faces and all core components match current rule version; fixtures cover every finite UI state; browser tests do not depend on private solutions for blind claims; new checks included in release inventory; obsolete scripts explicitly retained for historical mode or migrated, never silently skipped |

## Publication and iteration tasks

| Task | Deliverable | Required tests / completion criteria |
|---|---|---|
| V01 Candidate audit | Independent code/rules/assets audit | Every changed source path reviewed; tests exercise behavior and failure paths, not mirrored implementation; P0/P1 issues fixed and retested; actual assets opened and checked; no claim that line coverage proves correctness |
| V02 Complete visual and input matrix | Actual screenshots opened and inspected with findings linked to candidate | Every screen/state row below at every required viewport; inspect actual rendered content, not just bounding boxes; keyboard, touch, reduced motion, zoom, safe areas and keyboard overlays; defects entered and revised screenshots inspected |
| V03 Prod publish | Commit only intended changes, push prod, wait for Pages | Required build/unit/UI gates pass; deployed `revision.json` SHA equals pushed SHA; actual site opens and operates; report actual allocated build number and URL; no Main changes |
| V04 Blind tutorial observation | Fresh agent with no source/history, only URL and screen-visible information | Agent uses screen/UI alone; logs each misunderstanding, failed action and prompt interpretation; explains objective, round, card cost and concealed threat without coaching; no localStorage/engine/solution access; tutorial completion alone insufficient |
| V05 Ten complete observed games | Ten real browser games with fresh agent playing from screen information | Each game's start/end, choices, interruptions, winner/draw, duration, confusion, alternative considered and meaningful interactions recorded; cover 2/3/4 seats and each Dynasty where supported; observe all ten to terminal state, not simulations counted as games; separately report simulations |
| V06 Agency gauntlet and repeat | Feedback ledger, next goals/plan/tasks/tests before next change | Seek forced optimal lines, hand starvation, pass abuse, mandatory defense, kingmaking, meaningless rank differences and unclear goals; actual observations distinguish from hypotheses; next cycle addresses ranked findings; repeat until user interrupts |

## Visual screen and state inventory

Required screens: opening, introduction, loading, new-table setup, private handoff, opening table, card selected, legal target, preview, committed move, incoming contest, each response outcome, passing, boundary/refill, claim, succession, failed claim, winning game, drawn game, inspection/reference, rules, settings, save/import/recovery and exit/restart. Include every tutorial guide step and outcome, not just first/last. Include sparse and maximal reachable Courts, long names, full hands, no hand, empty deck, multiple relationships and long public records. Advanced screens are absent in core mode and must not be advertised as implemented.

Required viewport matrix (CSS pixels): 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440, 3840×2160; 360×800, 375×667, 390×844, 393×852, 412×915, 430×932; landscape 844×390; tablet 768×1024 and 1024×768. This is a representative acceptance matrix, not an unverified claim about current market-share rankings. Apply safe insets to all four edges, portrait/landscape cutouts, and a reduced visual viewport for an open on-screen keyboard. Simulations are labeled; actual physical-device validation remains unperformed unless executed.

Each inspection record contains candidate SHA/content version, viewport/DPR/browser, state, screenshot path, what reviewer actually saw, pass/fail, linked issue and corrected proof. CSS measurements, contrast checks, screenshot capture and pixel comparisons assist but never replace visual inspection. Any newly reachable screen is added before acceptance.

### Viewport coverage amendment, before expanded matrix

The August 2026 worldwide tables from [Statcounter desktop](https://gs.statcounter.com/screen-resolution-stats/desktop) and [Statcounter mobile](https://gs.statcounter.com/screen-resolution-stats/mobile), retrieved 17 September, additionally identify 1536×864, 1366×1366, 414×896, 393×873, 384×832 and 360×780 among reported leading dimensions. Add all six to the existing matrix, retaining the original boundary sizes. These are reported screen dimensions, not guarantees of available browser viewport or representative physical-device geometry; the unusual desktop classifications are kept as stress coverage without inferring device models. Acceptance remains actual rendered inspection of all defined states at each size, with separate safe-area and keyboard cases.

## Concrete correctness and regression gates

Unit scenarios must include: exact suit/rank mapping; below/equal/above response; Ace against 10/J/Q/K; wrong suit; no defender card; duplicate/stale response; illegal card zone; recruitment into correct dynasty; unsupported marriage; removal of each Crown dependency; claim/transfer/end timing; failed claim recovery; first player rotation; interrupted pass sequence; empty-hand pass; last deck card; exhausted deck; card conservation over seeded complete games; immutable printed identity; rejected trade does not leak; accepted trade transfers exact cards once; public projection indistinguishability; malformed saves; reload at a response; tutorial cursor nonmutation; unexpected tutorial action rejection; deterministic replay.

Before implementation starts, P03 will map these scenarios to the final retained rules and name any additional rule-specific tests. A removed rule is explicitly marked out of core scope with its reason, rather than allowing a test to silently disappear.

No finite suite guarantees elimination of every future error. A recurring observed defect requires a regression case at the appropriate layer plus another human-visible inspection of the failed surface. Coverage is tracked by requirement, rule transition, screen/state and asset identity; line coverage alone is not acceptance.

## Approved attrition correction tasks — before correction implementation

The first projected-policy run produced six winners and eighteen round-cap draws across 24 games. The detailed [attrition review](reviews/BUILD-5-ATTRITION-REVIEW.md) and test-contract amendment govern these additional tasks. Parent production review approved A01–A10; no claim of strategic acceptance follows from approval.

| Task | Deliverable | Required tests / completion criteria |
|---|---|---|
| A01 | Freeze success-only Recall exchange across rules/copy/tests | Written documents agree before reducer/AI correction; blocked lead/answer unchanged |
| A02 | Exchange exact lead for target on success | Original input immutable; target attacker-owned, lead defender-owned, both Played; no duplicated cards or immediate re-use |
| A03 | Make native loss recoverable through an earned action | Empty hand/deck boundary returns native lead to defender; later Recruit needed for ruler; no automatic repair |
| A04 | Preserve relationship consequences | Queen/spouse capture transfers and unsupported movement each occur once; no relationship inheritance or duplicate ownership |
| A05 | Preserve successful defense and curriculum | Frozen tutorial still legally wins round 3; Defend keeps existing ownership; per-attacker attempts retained |
| A06 | Price exact exchanges in public AI | High-for-low noncritical seizure versus constructive alternative; public Crown threat reverses choice; sufficient smaller answer can be preferred |
| A07 | Reserve useful responses | Claim choice accounts for remaining native answer; unnecessary extra supporters do not automatically beat reservation; projection privacy retained |
| A08 | Compare same and rotated policy experiments | Original 24 records plus all-balanced and seat/suit rotations; full outcome, action, response, claim, trade and rulerless-period counts |
| A09 | Apply the strategic rejection gate | Predominant cap draws or missing meaningful responses reopen design; never lengthen cap or hide legal rival threats to improve statistics |
| A10 | Verify correction on the actual screen | Both ownership paths visibly inspected; screen-only explanation and ten UI games on final candidate; no simulation counted as observed game |

### APP-05 follow-up — knowingly empty Trade recipients

Before implementation, adopt test-contract EMPTY-01–EMPTY-03: remove formal Trade candidates to publicly empty hands and reject direct submissions atomically. Continue allowing exact requests to nonempty unknown hands without checking concealed ownership. Verify the existing offer/accept/decline/privacy tests, then record any policy-simulation effect separately from actual UI evidence. This implements the independent app audit's false-choice finding without adding a new action or private-information permission.
