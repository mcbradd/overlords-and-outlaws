# Build 5 production migration audit

17 September 2026. Read-only code audit and proposed production acceptance inventory by the production audit agent. This is input to the binding Build 5 plan, not implementation or completed playtest evidence. Baseline source HEAD: `ebca68b0e68c022b186cd4fb7e8ab8bc0e3b336e`; the workspace already contains user/document changes, so HEAD alone does not identify every working file examined.

## Findings that must shape the plan

The current active game is `src/history-engine`, selected by `src/main.ts`. The legacy combat game remains separately selected by `?legacy=1`. Existing R4 suit/rank design explicitly says it is unimplemented and retains three seals. The latest user rejects that economy. Adding rank checks to the existing design without replacing its resource and tutorial contracts would implement the wrong request.

Runtime `Player` has `seals`; printed Noble data has collector numbers but no rank; every Noble receives common action text. The reducer spends and refreshes seals, the AI values remaining seals, and invariants validate their range. This is a rules/data/compiler/projection/save/tutorial/presentation change, not a CSS repair. Do not derive ranks from collector sequence or introduce thirteen bespoke mechanics merely to make ranks different.

The existing scene uses Three.js WebGL and a real perspective camera with CSS3D interaction targets. The user's perception of a skewed image is a presentation failure, not proof no 3D exists. Repair camera, component scale, physical placement, lighting and interaction against actual rendered evidence before replacing the rendering architecture.

The viewport module responds to `visualViewport.height`, but source presence does not prove keyboard/cutout acceptance. It does not currently use viewport offsets in its layout synchronization. Many inherited rules specify 9–13px labels and centered paragraph surfaces; inspect computed styles and actual screens after replacing shared typography rules. Avoid adding another override layer without eliminating contradictory presentation ownership.

## Source and verification map

| Surface | Main sources | Required migration checks |
|---|---|---|
| Entrypoint and build identity | `src/main.ts`, `src/build-identity.ts`, `scripts/build-identity.mjs` | Correct default ruleset; preserved legacy isolation; deployed revision/build identity |
| Authored cards and executable language | `src/history-engine/content.ts`, `types.ts`, `compiler.ts`, `scripts/history-cards.ts` | Explicit rank/ability allocation, complete suit permutations, canonical clauses control legality |
| Rules and deterministic transitions | `rules.ts`, `engine.ts`, `deadlines.ts`, `fixtures.ts` | Card payments, responses, depletion/recovery, round/claim boundaries, conservation |
| Hidden information and AI | `view.ts`, `ai.ts`, `ai-worker.ts` | No opponent identities/deck order leak; rank-sensitive policy uses projected observations only |
| Saves | `storage.ts`, invariant schema in `engine.ts` | New rules/content version; old saves preserved and explicitly rejected or separately resumed |
| Tutorial | `tutorial.ts`, `learning.ts`, `app.ts`, `action-cues.ts` | One leader/two cards; dependency-ordered forced legal sequence; only taught interactions and Exit |
| Card art and physical references | `face.ts`, `scene.ts`, `print.ts`, `src/character-art.ts`, source assets | 63:88 faces, frame/art fit, full names, rank/suit visibility, reference/live agreement |
| UI and input | `app.ts`, `preview.ts`, `reading.ts`, `reader.ts`, `glossary.ts`, `style.css`, `viewport.ts`, `motion.ts` | Hand abilities drive actions; exact legal target cues; consistent vocabulary; desktop/touch/keyboard |
| Automated checks | `tests/history-*.test.ts`, `tests/card-language-runtime.test.ts`, `tests/card-reading-contract.test.ts`, `scripts/history-*.ts` | Replace superseded assertions; retain meaningful invariants and legacy regression coverage |
| Publication | `.github/workflows/prod-pages.yml`, `scripts/pages-smoke.mjs`, `docs/RELEASE.md` | Prod commit/push, workflow completion, actual site inspection, revision equality |

Paths abbreviated after the first history-engine path are within `src/history-engine`.

## Proposed task inventory, each with acceptance criteria

These tasks must be reconciled with the design panel and written into the complete binding production plan before implementation starts. Numeric rules not settled by the panel remain design decisions, not silently chosen implementation details.

1. **Freeze the minimum core rules and module boundary.** Document setup, card-to-ability mapping, payments/destinations, rank comparison for every action, turn/round boundaries, response timing, refill/depletion and win/loss. Specify whether History is outside only the tutorial or also the initial free-play core. Tests: every reachable empty-hand/no-target/exhausted-deck condition has an adjudicated next step; finite repeat-pass and reusable-card loops cannot stall indefinitely; all rank allocations have worked consequences; no seals remain in normative Build 5 procedures. Preserve historical records explicitly as superseded.

2. **Make rank and printed abilities authoritative.** Author 52 explicit IDs/ranks and a deliberately small shared grammar. Tests: each selected suit is exactly A–K; rank is immutable; duplicate/missing/out-of-range values fail compilation; removing/changing printed permission changes executable action availability; reminder-only changes leave behavior invariant; Queen role is distinct from Q rank; all thirteen ranks have a printed usable purpose.

3. **Replace seal payment and shared verb availability.** Implement card selection, printed ability, target and one atomic commitment. Tests: unavailable abilities cannot be invoked through direct reducer actions; card resources spend once at the correct stage; canceled previews spend nothing; valid resisted actions retain their declared costs; stale/invalid actions neither reveal nor mutate; no double-use of lent/discarded/played cards; conservation after every transition; setup starts one leader/two hand cards as specified.

4. **Implement counterplay and rank-sensitive objectives.** Encode panel-approved attacks/defenses and succession. Tests: lower/equal/higher and A/K boundary tables; all suit-match cases; response/decline windows survive save/restore; no counter-response recursion unless explicitly designed; losing actual dependencies changes Crown eligibility; goals remain achievable from rank extremes when the design promises recovery. Compare small-lead bait, high-card preservation and development against defensive commitment on matched public states.

5. **Reconcile the retained advanced system.** Either migrate History/Trade/loans/covers/laws to the new economy or remove unsupported actions from the shipped Build 5 mode with clear documentation. Tests: no active text says to pay seals; no publicly selectable mode runs half-migrated rules; event contribution uses real cards; returns do not erase retained public proofs; History origin/destination is visible; recurring effects, expiry and victory timing cannot bypass response order.

6. **Version storage, projection and AI together.** Tests: new save round trips all legal stages deterministically; old private saves are not silently rewritten; corrupt content/version rejected with readable recovery; exports distinguish public from private; identical public positions with different private cards produce identical opponent projections except legitimate observations; AI never imports authoritative hidden state; all AI actions legal across 2/3/4 players, empty hands and interrupted responses.

7. **Replace the curriculum with one continuous legal demonstration.** Create a concept dependency graph and introduction using full printed names and explicit victory timing. Tests: every term is defined before dependent use; one guide owns explanation/preview/action/outcome; only current interaction and Exit are actionable; unapproved card/keyboard/URL actions cannot derail learning; Continue changes only cursor; all board changes come from legal engine actions; fixed opening leader/two cards; no unexplained History/Eudoxia/seals/setup draft; no alternative strategy request before instruction; novice can explain why the prescribed action helps.

8. **Rebuild product typography and card craft.** Shared hierarchy, left-aligned paragraphs, coherent engraved title treatment and matched frames/art cropping. Tests: actual visual review of every authored face and all shared surface variants; 63:88 reference dimensions; complete portraits without accidental blank backgrounds; rounded art/frame/card edges align; rank/suit readable in a fan; longest names fit without becoming tiny; role labels consistent; source originals unchanged; reference clauses equal runtime behavior; proof manifest accounts for every asset.

9. **Repair table composition, motion and loading.** Tests: visible deck-to-table and hand-to-target origins; all active components fit their play area; no court labels cut across pieces; camera pan/focus provides useful views with eased transitions; reduced motion settles directly; webgl fallback remains operable; predecoded required assets precede transition; throttled cold start/asset failure never produces white flash or silently missing portrait; retry/error state is readable and exits cleanly.

10. **Complete responsive interaction acceptance.** Tests: execute the state/resolution matrix below; controls never obscure relevant targets; focused fields and submit/cancel remain visible above actual keyboard; safe-area padding covers all four sides and landscape orientation; zoom/large text reflows; focus ring survives movement; touch inspect and keyboard selection work; no clipped instructions, tiny required text, hidden hand cards or inaccessible modal exit. Automated geometry checks support but cannot replace opened screenshot review.

11. **Replace stale regression probes and add required gates.** Tests: baseline inventory retained or explicitly migrated to its ruleset; old tutorial assertions replaced by the new curriculum contract; all new tests registered in release inventory; compiler/lint/proofs/typecheck/bundle/unit/UI pass; no skipped failures presented as success; quality evidence identifies source SHA and dirty status; no test merely asserts implementation internals in place of behavior.

12. **Publish the candidate and verify it.** Tests: commit only reviewed intended changes on Prod; push; deployment workflow succeeds; fetched `revision.json` equals pushed SHA and expected build number; deep links/assets work under Prod base path; actual deployed tutorial/interaction works after cache refresh; report testable URL/build. Main stays locked. The existing allocation chooses the next evaluation number from the published revision; do not hard-code an inaccurate Build 5 badge if another publication intervened.

13. **Run blind tutorial and ten complete screen-only games; synthesize and repeat.** Tests: clean-context agent receives URL and observation task, no rules/source/fixtures/hidden-state access; observer records screenshots, visible decisions, delays/stalls and unsolicited explanation of victory/turn/round purpose; all ten games start through real UI and reach visible terminal outcomes; report actual completed count and interrupted games separately; at least two player-count configurations and all shipped dynasty options are represented where supported. Record two plausible alternatives, threat assessment, chosen action and outcome at substantive decisions; compare alternatives by visible opportunity cost rather than action count. Feed observed false choices, dominant moves and confusion into the next panel; no claim of enjoyment or balance from ten bot games alone.

## Visual evidence matrix

Use a maintained state inventory, not a claim to have visited every combinatorial game position. Review every distinct screen, interaction stage and asset surface; generate deterministic dense and edge states for coverage, separately from blind play.

Representative CSS viewports: PC 1366×768, 1536×864, 1920×1080, 2560×1440; compact PC 1280×720; phones 360×800, 375×667, 390×844, 412×915, 430×932 and landscape reversals; tablets 768×1024 and 1024×768. This is a declared representative matrix, not a researched market-share ranking. Record device pixel ratio and browser. Include Chromium and actual available iOS Safari/Android Chrome evidence; emulated dimensions must be labeled emulated and cannot establish actual hardware keyboard/cutout acceptance.

For every viewport inspect landing, intro, tutorial opening, each guide state, selected ability, target preview, confirmation, response/decline, inspection, dense court/large hand, round transition, Crown claim/succession/terminal, pause/resume, saves/errors and every retained settings/help/history surface outside tutorial. Include no legal targets, empty hand/deck, longest names, private hand handoff, stale input and loading/fallback. Cover retained advanced event/offer/choice windows individually. For text entry, inspect focused input with software keyboard open, orientation change and dismissal. Use all applicable safe-area sides. Include 200% text/zoom and reduced-motion checks.

Every evidence row records candidate SHA, route/mode, state, viewport, input method, screenshot path, reviewer, actual finding and pass/fail. Open images with visual tools; do not infer aesthetic quality from pixel statistics, bounds, alt text or test success. Contact sheets may triage assets, but open each questionable or unreadable face individually. A failing row creates a concrete fix and repeat inspection.

## Executed baseline evidence and limitations

- `npm test`: **135 passed, 0 failed**, 17 September 2026 during this audit.
- `npm run test:ui`: **3 files / 3 tests passed**, same audit. This small DOM suite does not prove active History Engine screen coverage.
- No build, release suite, deployment, image inspection or games were performed by this audit agent. Baseline success is not Build 5 success.
- `scripts/history-tutorial-driver.ts` reads private localStorage and imports authored lessons/engine. It is useful regression automation, not a novice test. `scripts/history-simulate.ts` imports engine/AI and is useful deterministic simulation, not screen-only gameplay. Keep these evidence classes separate.
- Release workflow includes broader browser/layout/simulation checks; Prod publishing currently requires only build/unit/UI. The requested acceptance must therefore be executed and recorded beyond the minimum publishing workflow.

## Asset capability discovery

Current tool inventory exposes Adobe asset/edit/render capabilities and Higgsfield scene-builder tools that can inspect/edit Blender-backed scenes. No dedicated Tripo or standalone Blender MCP tool was discovered by name/description in this audit; installed skills alone do not prove a callable connection. Before actual generation, read the selected Adobe/Tripo/game-asset/imagegen skills and rediscover exact capabilities. Use generated assets only where they improve the physical-game deliverable; no generation was necessary for this code audit. Preserve existing source art originals and record provenance/derivation for new frames, title art and components.

## Follow-up: isolated core module and retained probes

Reviewed `docs/BUILD-5-PRODUCTION-PLAN.md` before implementation. The parent design decision is a new active `src/core-game` with the prior History Engine preserved only for historical saves, not advertised as the current full game. The following is production advice, not implemented behavior. The codebase-design skill informs the proposed seam: substantial rules behavior behind a small interface, shared by UI and tests.

### Recommended core seam

Implement an independent deterministic core module rather than adapting `history-engine/GameState` with optional fields or a `coreMode` flag. The old state requires seals, History boundaries, barter packets and hidden loans; preserving that shape would distribute obsolete concepts through every caller. Do not create a generic engine abstraction merely to make both games fit it.

The core's external interface should be small: create a seeded game, project a seat view, list legal choices from that view, apply a revisioned action atomically, and encode/decode a versioned save. Internal implementation owns card allocation, zone conservation, turn/response continuations and goal timing. Application code selects cards and targets; it never decrements resources or rewrites courts. Rules tests invoke the same creation/action/projection interface as the UI. AI takes the seat view, not authoritative state, and chooses only from visible information. Snapshot fixtures can use explicit test-only construction followed by invariant validation; do not expose fixture injection in ordinary deployed navigation.

Suggested locality: `core-game/content.ts` owns explicit ranks and printed clauses; `engine.ts` owns state transitions; `view.ts` owns privacy; `storage.ts` owns new namespace/version; `tutorial.ts` owns legal authored sequence and cursor gating; `app.ts` owns UI orchestration. These filenames are implementation suggestions, not an instruction to split small cohesive behavior into shallow wrappers. Keep actual shared rendering/asset utility imports limited to existing `assetUrl`, `CHARACTER_ART`, font files, and suitable low-level image helpers. Importing History's content, face or scene currently imports its rules/types transitively and risks exposing obsolete rule text. A new core card compositor can reuse portrait paths without coupling to the old operative scripts.

`src/main.ts` should choose exactly one app before importing app-specific styles or viewport observers. Default imports core. Preserve `?legacy=1` for combat regression compatibility. Use a distinct explicit historical-save route, for example `?archive=history-v4`, for the old History app. Ensure route precedence is deterministic when both flags are supplied. Historical routes are not links labeled “Full game” or “Advanced Build 5.” New saves never use either previous namespace. Do not load both viewport observers or CSS systems in the same page.

Acceptance additions: default runtime/projected core state has no `seals` field; displayed instructions and operative content contain no seal payment; unauthorized actions cannot bypass printed abilities; historical saves remain byte-for-byte unchanged after new core start/play/save/exit; archive routing uses matching old decoder. Core baseline neither imports old reducers nor silently accepts old action types. Core card IDs retain portrait identities but receive ranks from an explicit mapping. Hash every source portrait and frame before work and compare after; derivative files get new names. A Git diff proves tracked originals unchanged, while the hash inventory also covers initially untracked originals. Generated derivatives need their own manifest and actual visual review; source hashes cannot prove visual quality.

### Exact retained test routing

Most unit tests import their engine directly and remain valid without URL migration. Existing `*.ui.ts` tests include direct `legacy-main` imports and test the combat game; their current three passes are retained regression evidence, not core UI coverage. Add separate core UI tests within the existing `tests/*.ui.ts` discovery pattern or explicitly extend the configuration; do not assume placing tests in an unconfigured subdirectory executes them.

Keep existing combat probes using `?legacy=1`; `ux-interactions.ts`, `tutorial-drag.ts` and `tutorial-regression.ts` already do so. Keep their names/evidence marked legacy. These checks cannot validate new default selectors.

The following History probes currently navigate the unqualified `HISTORY_BASE_URL` and must explicitly append the historical route: `history-browser.ts`, `history-layout.ts`, `history-reading.ts`, `history-face-geometry.ts`, `history-scene-inspection.ts`, `card-language-ui.ts`, `tutorial-preview-fit.ts`, and `tutorial-usability.ts`. Audit recovery/probe scripts beyond this list for additional default-root navigation before migration. Their localStorage/fixtures and selectors remain History-specific; route them instead of mechanically renaming selectors to core ones.

Do **not** add an archive query to the shared `HISTORY_BASE_URL` variable itself: `history-export-pdf.mjs` and `history-proof-check.mjs` build `${base}/history-proof.html`, which breaks if `base` already contains a query. Keep base origin/path separate from the app route; construct URLs through `new URL` plus `searchParams`. The standalone historical proof pages remain historical proof pages. Core needs its own proof/gallery route and coverage. Verify base paths with trailing slash and Prod subdirectory.

`pages-smoke.mjs` currently exercises History selectors at the default URL, historical print output and combat routing. Rewrite its default-app segment to core interactions and keep explicitly routed archive checks separate. Identity fetch still targets real `revision.json` beneath the site base. `release-suite.mjs` must add named core unit/UI/browser/visual/simulation checks, while preserving and accurately routing historical checks. Do not delete retained checks to make a default-app switch pass. `npm run build` currently compiles/proofs History cards before bundling; keep that historical artifact validation and add authoritative core content validation/proofs. A passing History compiler does not validate new core cards.

### Matrix feasibility and evidence accounting

V02 requires every listed state at every listed viewport. The plan lists 15 viewports and roughly 30 non-tutorial screens/stages, so expect at least 450 screenshot reviews before tutorial, dense/edge and failure variants. The plan must not claim these are all complete because an opening contact sheet looks correct. Create the state manifest and deterministic fixture/transition driver first; then produce and review each required row in batches. Include a rendered label in evidence metadata, not the product, to avoid confusing fixtures. Each image remains attributable to candidate/content version.

Separate the ordinary screen×viewport matrix from additional applicable interactions: text-entry states need keyboard testing; all navigable controls need keyboard and touch; animation needs reduced-motion checks; privacy handoff needs first-frame and transition checks. If the plan intends a full Cartesian product across all these dimensions, budget and execute it explicitly. A narrower pairwise supplement must be recorded as a plan amendment before implementation, not silently inferred after a long run. Actual visual inspection at unreadably reduced contact-sheet scale is insufficient for the legibility gate. Open native-size crops/screens for text and card faces.

Literal “maximal reachable Courts” should become a rule-derived number after P03. A finite 52-card deck makes a finite maximum, but different layouts and marriage configurations still need defined worst cases. Also specify maximum hand count, longest names, longest action descriptions and public-record pagination. For states the core does not support (for example a draw if its terminal rules cannot draw, or Trade if removed), record an explicit out-of-scope decision and remove the advertised flow; do not fabricate a passing screenshot or silently skip the row.

The matrix labels actual-device acceptance unperformed unless executed. Desktop Chromium with synthetic insets is useful but cannot pass real iOS keyboard/visualViewport behavior. Preserve that limitation honestly without blocking unrelated implementation. V04/V05 must use a fresh-context browser agent; the parent observer can have design knowledge, but must not coach the player. Scripted state fixtures and engine simulations remain separate coverage classes. Reuse of an informed agent across ten games is valid for sustained play but only its first tutorial encounter is novice evidence.

No files besides this audit were modified for this follow-up, and no implementation was started by this agent.
