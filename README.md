# Overlords & Outlaws — The Weight of the Crown

A digital prototype of Malachy Murray's physical card-and-board game. Draft a Dynasty from a shared inheritance, keep Nobles concealed for bargaining and Claims, and establish a government that survives a lawful succession before Eudoxia completes a painting.

The default application now runs **history-engine-v4**, implementing the R3 History Engine rules. The old combat game and its saves remain available through **Legacy game** (`?legacy=1`). The original six-Dynasty archive remains intact. The new core contains the specified 52 Nobles in Alba, Plantagenet, Tudor and Habsburg.

## Play

- **Learn at the table:** one continuous 59-action guided match, from simultaneous 3–2–1 Inheritance to contested succession. Continue changes only the guide. Rivals legally defeat the learner's first Crown.
- **Set a new table:** two to four seats, selected shared modules, reproducible deal, solo AI or private hot-seat handoffs.
- **Five-minute preset demo:** a labeled public position using ordinary rules and real choices; no guaranteed win.
- **Archive and inspector:** canonical operative text, separate reminders, immutable printed Dynasty and current relationships.
- **Physical table:** shared-camera Three.js board and faces, Court cameras, Crown, seals, numbered marriages, Leverage, History and all selected paintings. Semantic mode supports the same game without WebGL.
- **Private saves:** environment-prefixed v4 storage, incompatible-save recovery/export, curtain on blur/reload/handoff, and untouched legacy bytes.

Use click/tap or keyboard selection, review the cost and consequence, then Commit. Inspection is passive. No action requires dragging. Public registers expose retained evidence. Local privacy protects ordinary shared-device play; a device owner can inspect full saves/devtools.

[Current rules](docs/RULES.md) · [Implementation and evidence](docs/HISTORY-ENGINE-IMPLEMENTATION-REPORT.md) · [R3 specification](docs/HISTORY-ENGINE-IMPLEMENTATION-SPEC.md) · [Physical direction](docs/PHYSICAL-GAME-DIRECTION.md)

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

History browser probes default to port 5178; override with `HISTORY_BASE_URL`. `cards:compile`, `lint:card-text`, `cards:manifest` and `cards:proof` consume the same authored manifest. Build runs compilation, lint and print-kit generation. Open `/history-proof.html` for 92 canonical faces and physical references. `node scripts/history-export-pdf.mjs` exports the PDF from a running server.

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

## Project map

Current iteration: [Play Session 02 review](docs/PLAY-SESSION-02-REVIEW.md), [revision 3 plan and delivery status](docs/REVISION-3-PLAN.md), [V3 quality report](docs/QUALITY-REPORT-V3.md), and [V3 decision audit](docs/DECISION-AUDIT-V3.md). The human playthrough exposed comprehension failures that automated checks did not measure. V3 addresses their causes; human comprehension and competitive balance remain unverified.

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

### Guided play

The tutorial is one continuous nine-step match. A single navy/gold guide holds each explanation, combat preview, action and outcome; gold outlines identify the next interaction. Advancing preserves all cards and consequences. Legal drag destinations preview the actual landing or ability target. Battlefield faces intentionally simplify the physical design; full cards remain available on inspection. See [the user-directed presentation exception and tutorial contract](docs/GUIDED-PLAY.md).
