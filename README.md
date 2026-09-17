# Overlords & Outlaws — The Weight of the Crown

A digital prototype of Malachy Murray's physical card-and-board game. Expose people to build a family, or keep their ranks concealed to answer rivals. Claim the Crown, pass it to an heir, then keep the new ruler and named supporter through a full round.

The default application is the **Build 5 core succession prototype**. It begins with one ruler and two hand cards. Cards fund actions; there are no seals. Recruit, Recall, Defend, exact-card Trade, Name heir and Marry & name heir share the same four thirteen-rank Dynasty suits. Pass ends a round only when everyone passes consecutively. Advanced History, Eudoxia and separate institutional Laws are deferred while the core is evaluated.

- **Learn at the table:** one guide, one taught interaction, legal actions and a controlled example. The learner chooses when to watch rival moves. Continue changes only the teaching cursor.
- **Play the core game:** two to four seats, selectable Dynasty, reproducible deal, computer rivals or private shared-device handoffs.
- **Physical table:** Three.js cards and components, Court cameras, Crown and marriage links; inspectable character references and shared printable rule aids. Public cards and concealed hand counts remain distinct.
- **Recovery:** separate versioned core saves; old History and combat saves preserved. Private exports explicitly contain every hand. The historical History runtime is at `?archive=history-v4`; combat is at `?legacy=1`. Neither is the current ruleset.

[Published Build 5 rules](docs/reviews/SUIT-AND-RANK-BUILD-5-SUPERSEDED.md) · [Next Build 6 rules](docs/SUIT-AND-RANK-DESIGN.md) · [Build 6 production plan](docs/BUILD-6-PRODUCTION-PLAN.md) · [Executed evidence and open gates](docs/reviews/BUILD-5-EXECUTION-LOG.md) · [Design session](docs/reviews/SUIT-RANK-DESIGN-SESSION-2026-09-17.md) · [Physical direction](docs/PHYSICAL-GAME-DIRECTION.md)

Build 6 is planned, not implemented. The user requested stopping at the next implementation boundary and leaving a knowledge-base handoff. Do not confuse the binding next-phase specification with the game currently served on Prod.

[Resume from the Build 6 knowledge-base handoff](docs/knowledge-base/build-6-handoff/README.md).

The planning freeze preceded implementation. Local code and passing automation do not establish publication, visual acceptance, strategic quality or learner comprehension. The evidence log records what actually ran; screen-only tutorial observation and ten actual UI games are separate from policy simulations. Main remains locked.

## Run and verify

Use Node 22.12+ and Chrome for browser checks.

```sh
npm ci
npm run dev -- --port 5178
npm run build
npm test
npm run test:ui
npm run test:history
npm run test:history:browser
npm run test:history:layout
npm run test:history:simulate
npm run test:history:print
```

Current core checks include `npx tsx scripts/core-browser.ts`, `core-browser-extended.ts`, `core-app-audit.ts`, `core-layout.ts` and `core-simulate.ts`. Set `BASE_URL` for the exact preview or deployed site. The release inventory includes core and historical checks; generated screenshots still require actual inspection.

Historical application probes require an explicit archive URL, such as `HISTORY_BASE_URL=http://localhost:5178/?archive=history-v4`. Historical proof probes use a query-free base when appending a file path. `cards:compile`, `lint:card-text`, `cards:manifest` and `cards:proof` retain the archived authored manifest. Open `/history-proof.html` for the old92canonical faces and physical references. `node scripts/history-export-pdf.mjs` exports that historical PDF from a running server.

Retained v3 audit/simulation/browser scripts explicitly exercise the legacy game. Their combat assertions do not validate the history engine. The release inventory runs both sets. Reports/screenshots are under ignored `artifacts/history/`.

The user deferred M1b's early human paper-play gate to enable the full digital prototype. Software checks do not establish human balance, historical clearance, accessibility certification or manufacturing readiness. No deployment or promotion is implied by implementation.

## GitHub Pages deployment

[Live](https://mcbradd.github.io/overlords-and-outlaws/) runs the frozen `main` branch.
[Prod evaluation](https://mcbradd.github.io/overlords-and-outlaws-prod/) runs `prod`.
Work and push on `prod`. Promotion to Main requires your explicit command, the
full release suite, and actual visual inspection. See [the release procedure](docs/RELEASE.md).

The prod workflow publishes only built files to the separate evaluation repository.
Prod saves are isolated from Live. The Live workflow publishes after an authorized
promotion; Main remains locked between releases.

To preview the prod Pages build in PowerShell:

```powershell
$env:PAGES_BASE_PATH = '/overlords-and-outlaws-prod/'
$env:VITE_SAVE_NAMESPACE = 'prod:'
npm run build
npm run preview
# Open http://localhost:4173/overlords-and-outlaws-prod/
Remove-Item Env:PAGES_BASE_PATH, Env:VITE_SAVE_NAMESPACE
```

## Historical project map

Earlier iteration evidence: [Play Session 02 review](docs/PLAY-SESSION-02-REVIEW.md), [revision 3 plan and delivery status](docs/REVISION-3-PLAN.md), [V3 quality report](docs/QUALITY-REPORT-V3.md), and [V3 decision audit](docs/DECISION-AUDIT-V3.md). These records exposed comprehension failures that automated checks did not measure. They do not establish acceptance of the current core.

- `src/duel.ts`: deterministic **2–4-player** rules and AI; the filename is historical.
- `src/battlefield.ts`: semantic House lanes, rival tabs, scrolling, and brief card feedback.
- `src/cards.ts`: shared collectible card frame and portrait mapping.
- `src/action-view.ts`: shared action labels, costs, legality and consequence descriptions.
- `src/lessons.ts`: ten deterministic lessons using the real engine.
- `src/main.ts`, `src/table.css`: current table presentation, contextual inspection, actions, and responsive behavior. `src/v3.css` retains peripheral mode styles; `src/style.css` retains the older styles in a lower-priority CSS layer.
- `src/progress.ts`: versioned browser-local saves; `src/audio.ts`: synthesized sound.
- `src/content.ts`: historical identities and preserved source-era content.
- `src/engine.ts`, `src/storage.ts`, `tests/engine.test.ts`: retained V1 reference and regression coverage; unused by the V2 game.
- `docs/knowledge-base/`: complete source distillation, transcripts, visual exhibits, conflicts and designer correspondence.
- `docs/RULES.md`: current executable rules and adaptations.
- `docs/REVISION-2-PLAN.md`, `docs/DECISION-AUDIT.md`, `docs/QUALITY-REPORT.md`: iteration evidence and limitations.
- `docs/ART-DIRECTION.md`: generated-asset provenance and exact prompts.

## Source, privacy and rights

Original PDFs stay local in `SourceMaterial/` and are excluded from Git and deployment. Their Markdown knowledge base is preserved in the private repository. Only the built static game is publicly served. No runtime AI, purchases, accounts or cloud saves are required. Art, fonts and audio generation are local to the application.

V3 uses a new save key, preserves V2 collection/progression/settings, and leaves incompatible old matches under their old key. Historical figures meet across centuries; fictional abilities and generated paintings are interpretations. Some figures share House portrait archetypes. This is a tested prototype, not a verified AAA commercial release.

Original concept and supplied source: © 2025 Malachy Murray. This private repository grants no open-source license to the concept, implementation or art. Dependencies retain their own licenses; see [Third-party credits](docs/THIRD-PARTY.md).

### Legacy combat guided play

The tutorial is one continuous nine-step match. A single navy/gold guide holds each explanation, combat preview, action and outcome; gold outlines identify the next interaction. Advancing preserves all cards and consequences. Legal drag destinations preview the actual landing or ability target. Battlefield faces intentionally simplify the physical design; full cards remain available on inspection. See [the user-directed presentation exception and tutorial contract](docs/GUIDED-PLAY.md).
