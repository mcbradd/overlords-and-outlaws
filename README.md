> **Current product direction:** This is a digital prototype of a physically manufactured card-and-board game, presented on a real 3D board. See [current creative direction](/docs/PHYSICAL-GAME-DIRECTION.md). The flat September 15 lane presentation was rejected and is superseded; historical discussion below records its context, not current acceptance.

# Overlords & Outlaws — The Weight of the Crown

A **digital prototype of a physical card-and-board game intended for manufacture**, based on **Malachy Murray's** concept. Gather a family by blood or marriage, pay for coronation, and withstand every rival House's challenge. Growing power creates upkeep, vulnerable estates and dependent marriages.

## Play

- **Ten short lessons:** fixed practice positions teach actions, capture, marriage, income, broken and defended claims, hand renewal, and Eudoxia. Opponents use real legal attacks.
- **Skirmish:** one human with one to three AI Houses.
- **Family table:** two to four human players, choosing distinct Houses and passing a shared device privately.
- **Chronicle:** three branching courts with inherited rewards.
- **Daily table:** a fixed UTC-day seed and House.
- **Archive:** 84 named historical Royals across six Houses.

[Play the prototype on GitHub Pages](https://mcbradd.github.io/overlords-and-outlaws/) · [GitHub repository](https://github.com/mcbradd/overlords-and-outlaws)

Click or tap a card and use the contextual action panel. Desktop cards have a stable side inspector; on phones, selecting a card brings its actions into view. Mouse-drag a hand card to the table to play it, or drag a Ready Royal toward a target to preview an attack before committing. Touch scrolling never commits a drag action. Hover, touch-hold, or use Inspect card for detail. Click family, gold, crown, estates or forecast to explain their state. Keyboard controls use Tab, Enter and Escape. Sound, motion and coaching can be adjusted.

The game plays on a real Three.js board with shared camera geometry for its printed card faces. Cards have a fixed 63:88 prototype ratio, live battlefield stats and inspectable full rules, cardstock thickness and contact shadows. Crowns, coins, estates, action counters, damage and marriage links occupy the board. Resting cards rotate. Camera buttons move closer to individual courts; narrow screens can pan across the board. The hand and contextual actions remain accessible outside the 3D scene. See [current physical-game direction](docs/PHYSICAL-GAME-DIRECTION.md) and [project memory](MEMORY.md).

Research and verification: [16-game UI/UX study](docs/knowledge-base/digital-card-game-ux-research.md) · [redesign report](docs/UI-UX-REDESIGN.md). The study includes three model passes, scoped competitor scores, discrepancies, and outliers. These are qualitative judgments, not measured satisfaction rankings.

## Run and verify

Node.js 22.12+ or a compatible newer version:

```sh
npm ci
npm run dev
npm run build
npm test
npm run test:ui
npm run test:simulate
npm run test:audit
npm run test:physical
npm run test:cards
```

With the dev server running on port 5173 and Chrome installed:

```sh
npm run test:browser
npx tsx scripts/session02-browser.ts
npx tsx scripts/interaction-v3.ts
npx tsx scripts/playthrough.ts normal
npx tsx scripts/playthrough.ts normal --motion
npx tsx scripts/family-browser.ts
npx tsx scripts/family-browser.ts --compact --four --estate
```

`test:audit` performs 200 complete games plus counterfactual terminal rollouts. It is a diagnostic of choices, not a human enjoyment score. V3 reports and screenshots use ignored `artifacts/v3/`; some retained family scripts use `artifacts/v2/`. Checked-in audit evidence is under `docs/testing/`.

## GitHub Pages deployment

Work and verify locally, then push to `main`. The `Deploy prototype to GitHub Pages` workflow runs the rules and UI tests, builds the prototype, and publishes `dist/`. GitHub Pages must use **GitHub Actions** as its source. The workflow can also be started manually.

The build reads `PAGES_BASE_PATH` for the repository subfolder; ordinary local builds default to `/`. Runtime artwork URLs use the same base as Vite's generated scripts and styles. To preview the Pages build in PowerShell:

```powershell
$env:PAGES_BASE_PATH = '/overlords-and-outlaws/'
npm run build
npm run preview
# Open http://localhost:4173/overlords-and-outlaws/
Remove-Item Env:PAGES_BASE_PATH
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
