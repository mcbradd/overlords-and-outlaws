> **Resume update - 17 September 2026:** The user has resumed iteration and rejected the unrestricted Add/no-marriage premise in this frozen package. Foreign Court entry must require marriage. Trade requests must target only a rival's face-up Played/Resting pile. See [the current player correction](../../reviews/BUILD-5-PLAYER-FOLLOWUP-2026-09-17.md). Preserve this handoff as evidence; do not execute its superseded replacement rules.

# Build 6 implementation handoff

17 September 2026. **Stop point: planning complete; implementation has not begun.** The user requested: “Work until you are ready to begin the next implementation phase, then stop, write all your current knowledge to the knowledge base, for another agent to resume later.” This task pauses at that boundary. A later agent receiving a resume/implementation instruction can execute the frozen package without asking for the same permission again.

## Read these first

1. [Binding rules](../../SUIT-AND-RANK-DESIGN.md).
2. [Complete production tasks and acceptance](../../BUILD-6-PRODUCTION-PLAN.md).
3. [State/public-interface contract](../../BUILD-6-STATE-CONTRACT.md).
4. [Explicit tests](../../BUILD-6-TEST-CONTRACT.md).
5. [Exact legal tutorial and 23 screens](../../BUILD-6-TUTORIAL-CONTRACT.md).
6. [Literal visual inventory](../../BUILD-6-VISUAL-INVENTORY.json) and [interpretation/hash](../../BUILD-6-VISUAL-INVENTORY-README.md).
7. [Completed Build 5 feedback](../../reviews/BUILD-5-CYCLE-1-FEEDBACK.md), [whole-game gauntlet](../../reviews/BUILD-5-WHOLE-GAME-GAUNTLET.md), and [session record](../../reviews/SUIT-RANK-DESIGN-SESSION-2026-09-17.md).

The inventory is planning data: **240 states × 21 baseline viewports = 5,040 baseline rows**, plus **1,239 supplemental rows = 6,279 required screen/profile rows**, plus **168 intrinsic asset reviews**. All are unexecuted/uninspected for Build 6. Hash and profile rules are in its README. Do not shrink the denominator after failures or count generation as review.

## Authority and unchanged scope

The original task is a continuous loop: antagonistic panel → complete plan/tasks/tests → implementation → Prod publication → code/art/actual UI audits, a fresh screen-only tutorial learner and ten complete UI games → feedback → repeat until interrupted. The user's latest instruction interrupts at the next implementation boundary. It does not ask to implement part of the plan before stopping.

The game is a physical manufactured card/board prototype, not a dashboard or solely digital game. Keep a real 3D board, tangible 63:88 cards, engraved collectible art, original portraits, legible information, private hands, touch/keyboard, inspection and reduced motion. The flat September 15 lane redesign was rejected. Read current creative direction, PLAY-SESSION-02-REVIEW and RELEASE before work in their areas.

User priorities, in order: meaningful uncertain interactions informed by visible threats/resources; clean intuitive presentation with public/hidden facts distinguished; clear game/round/turn objectives. Family/sixth-grade language and minimal text are binding. If an ordinary mechanic needs multiple explanatory sentences, redesign it; do not hide a paragraph in tooltips or more tutorial cursors. Every mechanic is open to removal, including succession, rank combat, marriage, Trade, Pass and the win condition. Do not preserve anything solely because already implemented.

[Malachy's supplied email](../MALACHY-EMAIL-2026-09-17.md) was given to the review agents in full. Hidden OUTLAW hands, exposed political position, transferred power, historical composition and anti-hoarding pressure informed the review. Eudoxia/Interregna and proposed puzzle count were guidance, not a required feature list. The promised new Dynasty sheet was not supplied. No meeting or email was sent; the invitation in the source was not an instruction to contact anyone.

Older CONTEXT.md, revision-planning files and historical paragraphs describe superseded mechanics. Preserve their source evidence; current user instructions and the new binding package govern this implementation. Do not overwrite unrelated user work to make those files appear consistent.

## Selected game and why

The final candidate is D-open/refill-to-two with mandatory one-card play:

- One Founder exposed and two private cards at setup, two to four selected thirteen-card suits.
- Any person can Add to a mixed political Court. Mixed Court is not an invented biological genealogy.
- Keep any three different consecutive ring ranks until your next turn to win. Ring: A–2–…–J–Q–K–A. Suits can differ; duplicate ranks do not count twice. Any surviving run preserves a Crown, not a secretly selected trio.
- Offer a held card to Swap for any rival Court person of the same printed suit. Target rank is not a strength test.
- Target controller may answer with either neighboring rank of that same suit. Answered offer/answer rest with their existing owners. Otherwise offer/target exchange owners and rest. Every card remains conserved.
- Start: win check, return own Resting cards, refill only until hand has at least two, then play one card. No end draw, voluntary Pass or global round. Empty hand after refill advances automatically. All cards unavailable to all players with no Crown gives a natural draw, not a time cap.
- No seals, health, special Ace/Queen mechanics, successor clock, marriage prerequisite, exact-name Trade or external puzzle/event clock. Historical asymmetry is deliberately deferred; it is not falsely claimed from identical procedures with different names.

The panel explicitly weighed mandatory exposure against retaining both defenses. It recommends this as an experiment, not a proven improvement. Cycles, late shields, draw luck, mixed-suit dominance, forced unwanted exposure and family comprehension are live falsification gates. Do not add a new clock to manufacture termination without another written review.

Rejected alternatives:

- Functional-role sets added availability restrictions and did not establish rank-dependent exposure choices.
- Ordered-target rank runs made J/Q/K immune because every higher attacker was already exposed in the run.
- Neighbor-only targeting repaired that immunity but gave no action with two cards in 16.30%/30.16%/38.56% of untouched 2/3/4-player openings. The extra first draw reduced those rates but violated the intended two-card first decision.
- Native-only runs prevented a player from actively acquiring missing native ranks after supply exhaustion against a rival who never initiated swaps. Consensual barter could restore acquisitions but refusal retained the lock. Any-card mixed Add removes that invariant.
- Higher-only defense with individual turn returns risks a permanent highest-card shield. Uniform neighbor answers avoid that special ordering.

The control was not dismissed blindly: the parent executed four invariant-valid current-reducer cases. With ruler2/supporter3 and hand A/Q, known enemy K favors Q heir/A reserve; known enemy10 favors A heir/Q reserve. [Probe results](evidence/rank-choice-probe.json) refute universal lowest-heir dominance locally, but do not prove reachability, frequency or global optimality. [Probe source](evidence/rank-choice-probe.ts.txt) is evidence, not Build 6 code.

## Current repository and delivery state

Workspace: `C:\Projects\Carlin\OandO`; PowerShell; branch `prod`. Production source baseline and still-served revision: **`7e521f8b29d704291f00af3a9db245fddae00b94`**. Prod remains **Build 5**, built `2026-09-17T18:34:13.279Z`, verified again by reading revision.json at handoff. URL: https://mcbradd.github.io/overlords-and-outlaws-prod/.

No Build 6 source, tests, renderer, assets or deployment have been implemented. The only executable probe added during review lived under ignored `artifacts/core/` and exercised the unchanged Build 5 reducer. `git diff --name-only -- src public scripts tests package.json package-lock.json` was empty before the planning commit. This handoff's commit is documentation/data only and is not pushed, avoiding a misleading numbered deployment of unchanged gameplay. Find the freeze with `git log --oneline` and the message `Freeze Build 6 plan and implementation handoff`.

Earlier milestones: Build 4 baseline `ebca68b0e68c022b186cd4fb7e8ab8bc0e3b336e`; Build 5 plan freeze `3fbb7343110a6a067d5afeb18bab9f684c129191`; implementation `f2e17818549a8b4e6ef01b25dfac61ebdadba4c5`; compact correction/published candidate `7e521f8...`. Source workflow35259566264 and Pages35259637484 passed. Deployed bounded checks are in `artifacts/core/deployed-build5/report.json`.

**Prod-only authority.** Read RELEASE.md before deployment or branch administration. Main is locked; no Main promotion was requested or performed. Commit/push completed implementation to prod, wait for deployment, verify exact served SHA/build/assets and actual site. The workflow allocates the next build number; report it rather than assuming a number. Passing deployment alone is not release acceptance.

Protected unrelated work at handoff: modified AGENTS.md, docs/knowledge-base/README.md and designer-intent.md; untracked CONTEXT.md, knowledge-base/revision-planning and unanswered-questions; existing HISTORY-ENGINE research scripts/results and numerous R1/R2/R3/R4 review/spec documents. They predated this planning phase. Do not stage, discard, reset, relocate or rewrite them as cleanup. The root README and docs/RULES changes in the freeze are deliberate published-versus-planned pointers.

## Build 5 testing evidence

The exact-source detached worktree is `tmp/build5-release-7e521f8` (absolute under the workspace). Full release ran all63 checks from18:34:18 to19:17:25UTC, about43 minutes: **40 passed,23 failed, zero runner timeouts**. [Copied report](evidence/release-report.json), [failure classification](evidence/release-failure-classification.json), [production cross-review](evidence/production-cross-review.md).

Classification is one current-core defect, thirteen stale contracts, two retained-mode defects, seven unclassified. No category waives a failure. Current core failure: layout at360×800/780. Retained real failures: a battle banner intercepted 3D canvas input, and dense courts clipped at1024×600. Unclassified cases involve tutorial preview commit, history-reading zero rectangles, hand visibility after Court focus, next tutorial highlight, drop slot, session02 focus and interaction-v3 drag result. Stale selectors/storage contracts must be repaired against the intended old route; do not reintroduce rejected current mechanics just to satisfy them.

The initial detached worktree was clean. Retained proof generation left line-ending-only tracked differences; do not call its final status wholly clean or erase it casually. The source code identity stayed at7e521f8. Earlier bounded verification passed165 unit tests,3 UI tests and build; those results do not negate the complete release failures.

All **2,228 captured images** in the21-size matrix were individually opened: primary560, experience1,060, production608. Complete copied ledgers are under [evidence](evidence/manifest.json). Primary covered112 each1280×720,1440×900,1536×864,1920×1080,2560×1440. Experience covered phones360×800/375×667/390×844/393×852/412×915/430×932 and1366×768,844×390,768×1024,1024×768. Production covered414×896,393×873,384×832,360×780,3840×2160 and1366×1366.

This is complete review of captured images, not complete acceptance: the two narrow failures truncated later captures, required ordinary states were missing from the old inventory, some large images were downscaled, and physical devices were not tested. In particular, default4K display was2048×1152; only one original4K004 was additionally opened. Native text coverage cannot be inherited from composition review. Screenshot files remain in local artifacts with paths in the ledgers; the copies preserve observations, not all image bytes.

Major visible defects: jagged cream/dark stripes over portraits/ranks; labels/arrows/cords across faces; tiny four-player board amid unused area; public Resting piles off-board or buried; Crown/attempt overlaps; required controls and badges colliding; rival tutorial moves offscreen; name-only Trade selector; contradictory decline confirmation; raw JSON error; terminal To act/Pass/return prose; small text and repetitive tutorial. The apparent Alexandra→You resize loss was withdrawn because the harness reloaded a new dialog. A real same-session resize test is required.

Renderer diagnosis is **not complete**. Current scene uses Three.js, PerspectiveCamera36, near1/far12000, PCF soft shadows, shadow map2048 and directional-light bias−.0004/normalBias.6. Extruded stock reaches roughlyz2.9; face plane sitsz3 and receives shadow. These facts suggest possible probes, not a diagnosed cause. Read diagnosing-bugs skill; establish a tight real-renderer reproduction, open baseline, write ranked falsifiable hypotheses, change one variable, then record actual corrected views. Never claim a depth or shadow fix from conjecture.

## Ten actual UI games and fresh learning

[Full copied observations](evidence/blind-build5-observations.md) include the learner's own explanation, exact displayed deals/results, estimates and separate sixth-grade assessment. The agent received only the deployed URL and screens—no source, stored state or solution. It completed the roughly75-click/ten-minute tutorial, then **ten complete ordinary games: eight wins/two losses**. Seven duels, two three-player games, one four-player; all four Dynasties; all seat1 because no seat control existed. Start player rotated. Deal numbers were accepted as displayed, not chosen for known outcomes.

Games: Alba235434 winR6; Tudor784704 three-player winR6; Habsburg444764 four-player winR5; Plantagenet177317 winR4; Habsburg337571 winR4; Tudor570002 lossR5; Alba942630 three-player winR5; Plantagenet355981 winR4; Habsburg607372 lossR3; Alba720054 winR4. Counts/durations are estimates, not telemetry.

Meaningful play included saving answers, allowing rivals to spend each other's defenses, recovering rulers, trading known threats away, and timing claims. Repeated low-heir/high-defense and reliably accepted exact trades deserve adversarial comparison. Game6 lost through timing/exposure; game9 lacked foreign-suit counterplay after native draws. Legal buttons did not imply a useful rescue.

The learner correctly described the succession goal but judged ordinary comprehension unsuitable for a fresh sixth-grade reader: Recall compares lead/answer rather than target and includes several conditions; Trade needs unfamiliar name lookup and an asymmetric timing exception; succession switches dependencies over two stages; Queen role differs fromQ rank; Pass resets obscure progress. This is an agent assessment, not actual child/adult family research.

Terminal screenshots were actually opened inline in the blind agent's tool transcript; CUA returned no saved paths. An early reported Matilda/Duncan rank mismatch remains **unconfirmed**: later ranks appeared correct, and game6 demonstrated accessibility/screenshot timing could straddle a transition. A settled recapture agreed. Do not report an engine identity bug from that evidence.

## Exact resume sequence

1. Confirm user has resumed implementation; inspect git status and the frozen docs. Preserve unrelated edits. Do not repeat the design debate from scratch or treat old candidate sections as current rules.
2. Read applicable TDD and diagnosing-bugs skills; the public seams and all criteria are already recorded under autonomous authorization. First meaningful red slice can assert a foreign held person has Add under schema6 (old core only permits native Recruit). Use worked fixtures and public APIs, not private-method mocks or tautologies.
3. Implement B602 schema6 engine, turn/response/order/conservation and privacy; then B603 AI and B604 versioned storage. Keep old schema5 bytes. Do not claim an archived playable Build5 route exists unless deliberately built/tested.
4. Implement shared art/real renderer/UI, exact six-human-commitment tutorial, keyboard/touch/private handoff and responsive fixes under B605–B610. Source originals remain immutable. Discover creative tools and read applicable skills before new asset work; Adobe/Tripo/Blender were project context, not guaranteed current connections.
5. Implement B611's finite inventory/evidence joins and repair B612's23 release failures. Every source/asset change needs its mapped tests and actual review; newly discovered cases are written before their fixes.
6. Complete B613 review, publish only Prod under B614, verify actual build, then fresh learner/ten ordinary UI games and the next gauntlet under B615. Use a fresh agent for the new tutorial; the prior blind player already knows Build5.

Do not mark unperformed tests passed, reuse earlier visual verdicts for changed assets, substitute simulations for ten UI games, or claim family/hardware validation from emulation. Empty/cycle failures are evidence to redesign, not permission to silently add a cap. The continuous objective is paused, not achieved.

## Environment and tools

PowerShell, unrestricted filesystem/network; tool policy was approval-never. Node/tsx, TypeScript, Vite, Three.js and Playwright are installed in the repo. Scripts/release-suite.mjs owns the full release. It expects free ports5173–5176 and4176. A prior local preview on4173/session42345 may be stale; inspect current handles/ports instead of assuming it is alive or restarting blindly.

For computer use after a context reset, call CUA rewriteDocumentation before continuing; native app APIs were disabled. Prior blind Chrome tab1551027061 remains a terminal deliverable unless closed externally. The parent IAB tab1 previously showed Prod. Treat current UI as unknown until inspected; don't operate the blind tab as though it were a fresh learner.

Agents completed their useful reviews, but later experience/production calls hit the account usage limit (reported retry Sept24,2026 10:33AM). No reset credit was consumed and no credits purchased. Do not retry unchanged failed agent work indefinitely. This stop is the user's requested handoff boundary, not a claim the product is finished.

## Evidence portability

[Evidence manifest](evidence/manifest.json) records source paths, original byte sizes and SHA-256 hashes for the copied notes, reports and complete review ledgers. The evidence directory disables Git text normalization to preserve copied bytes. Old screenshot files remain local ignored artifacts; if absent in another checkout, preserve the documented limitations and generate new evidence rather than claiming to have opened missing images. Source-art originals and SourceMaterial PDFs remain governed by existing repository rules.

## Executed handoff validation

Before committing, the parent validated unique inventory state/row IDs, every state/viewport/profile reference and all recorded counts; verified the normalized inventory SHA-256 and all19 copied evidence hashes; checked33 local contract links; and passed the staged whitespace check. Original CRLF evidence is recognized as CRLF rather than rewritten, preserving its recorded bytes. Staging contains46 documentation/data files, no production source or assets, and excludes the protected user edits above. No Build 6 engine/UI/build tests were run because no Build 6 implementation exists. Prod revision was read again and remains7e521f8, Build5. These are planning-integrity checks, not game acceptance.
