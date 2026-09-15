# Overlords & Outlaws — The Weight of the Crown

A browser dynasty card-game prototype based on **Malachy Murray's** concept. Gather a family by blood or marriage, pay for coronation, and withstand every rival House's challenge. Growing power creates upkeep, vulnerable estates and dependent marriages.

## Play

- **Guided lesson:** a clearly labeled practice table, with protected learning and the real claim victory.
- **Skirmish:** one human with one to three AI Houses.
- **Family table:** two to four human players, choosing distinct Houses and passing a shared device privately.
- **Chronicle:** three branching courts with inherited rewards.
- **Daily table:** a fixed UTC-day seed and House.
- **Archive:** 84 named historical Royals across six Houses.

[Play the published game](https://overlords-and-outlaws-mcbradd.braddicus.chatgpt.site/) · [Private GitHub repository](https://github.com/mcbradd/overlords-and-outlaws)

Click or tap a card, read its action panel, and choose an order. Select a ready Royal and a highlighted target to review a challenge before committing. Inspect with ↗ or right-click. Keyboard controls use Tab, Enter and Escape. Sound, motion and strategic explanations can be adjusted. The table supports desktop browsers and landscape phones; full inspection provides readable detail on small displays.

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
```

With the dev server running on port 5173 and Chrome installed:

```sh
npm run test:browser
npx tsx scripts/playthrough.ts
npx tsx scripts/playthrough.ts normal
node scripts/visual-v2.mjs
npx tsx scripts/family-browser.ts
npx tsx scripts/family-browser.ts --compact --four --estate
```

`test:audit` performs 200 complete games plus counterfactual terminal rollouts. It is a diagnostic of choices, not a human enjoyment score. Reports and screenshots are written to ignored `artifacts/v2/`; checked-in summaries are under `docs/`.

## Project map

- `src/duel.ts`: deterministic **2–4-player** rules and AI; the filename is historical.
- `src/battlefield.ts`: lazy-loaded Three.js table and projected interactive cards.
- `src/cards.ts`: shared collectible card frame and portrait mapping.
- `src/main.ts`, `src/style.css`: interaction, teaching, private handoffs, modes and responsive presentation.
- `src/progress.ts`: versioned browser-local saves; `src/audio.ts`: synthesized sound.
- `src/content.ts`: historical identities and preserved source-era content.
- `src/engine.ts`, `src/storage.ts`, `tests/engine.test.ts`: retained V1 reference and regression coverage; unused by the V2 game.
- `docs/knowledge-base/`: complete source distillation, transcripts, visual exhibits, conflicts and designer correspondence.
- `docs/RULES.md`: current executable rules and adaptations.
- `docs/REVISION-2-PLAN.md`, `docs/DECISION-AUDIT.md`, `docs/QUALITY-REPORT.md`: iteration evidence and limitations.
- `docs/ART-DIRECTION.md`: generated-asset provenance and exact prompts.

## Source, privacy and rights

Original PDFs stay local in `SourceMaterial/` and are excluded from Git and deployment. Their Markdown knowledge base is preserved in the private repository. Only the built static game is publicly served. No runtime AI, purchases, accounts or cloud saves are required. Art, fonts and audio generation are local to the application.

V2 uses a new save key. V1 saves remain stored but cannot be resumed under incompatible rules. Historical figures meet across centuries; fictional abilities and generated paintings are interpretations. Some figures share House portrait archetypes. This is a tested prototype, not a verified AAA commercial release.

Original concept and supplied source: © 2025 Malachy Murray. This private repository grants no open-source license to the concept, implementation or art. Dependencies retain their own licenses; see [Third-party credits](docs/THIRD-PARTY.md).
