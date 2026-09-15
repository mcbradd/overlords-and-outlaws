# Overlords & Outlaws — The Weight of the Crown

A browser dynasty card-game prototype based on **Malachy Murray's** concept. Gather a family by blood or marriage, pay for coronation, and withstand every rival House's challenge. Growing power creates upkeep, vulnerable estates and dependent marriages.

## Play

- **Ten short lessons:** fixed practice positions teach actions, capture, marriage, income, broken and defended claims, hand renewal, and Eudoxia. Opponents use real legal attacks.
- **Skirmish:** one human with one to three AI Houses.
- **Family table:** two to four human players, choosing distinct Houses and passing a shared device privately.
- **Chronicle:** three branching courts with inherited rewards.
- **Daily table:** a fixed UTC-day seed and House.
- **Archive:** 84 named historical Royals across six Houses.

[Play the published game](https://overlords-and-outlaws-mcbradd.braddicus.chatgpt.site/) · [Private GitHub repository](https://github.com/mcbradd/overlords-and-outlaws)

Click or tap a card and use the contextual action panel. Desktop cards have a stable side inspector; on phones, selecting a card brings its actions into view. Mouse-drag a hand card to the table to play it, or drag a Ready Royal toward a target to preview an attack before committing. Touch scrolling never commits a drag action. Hover, touch-hold, or use Inspect card for detail. Click family, gold, crown, estates or forecast to explain their state. Keyboard controls use Tab, Enter and Escape. Sound, motion and coaching can be adjusted.

Courts use readable, front-facing cards in labeled House lanes. Dense lanes scroll horizontally; narrow screens have rival tabs. Short screens scroll vertically instead of shrinking the entire table. Empty hands collapse, and lessons share the contextual action rail. The historical portraits remain; intricate frame overlays and the projected 3D playing pieces have been removed.

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
npm run test:layout
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
