# Overlords & Outlaws: The Witness

A single-player historical dynasty card game about exposed authority, concealed leverage, and the witness who records the cost. Based on the supplied game concept by **Malachy Murray**.

## Play

- **Learn to rule:** an interactive inheritance draft and guided opening encounter.
- **Chronicle:** choose a house, navigate three branching acts, collect heirlooms, and survive a final coronation.
- **Skirmish:** challenge two AI courts with your chosen house and difficulty.
- **Daily chronicle:** replay a fixed UTC-day inheritance, house, difficulty, and historical modifier.
- **Archive:** inspect all 84 Royals across six European archives and track discoveries.

The game runs in a desktop browser and includes a tactical layout for landscape phones. Click or tap to select cards, choose an action, select a target where needed, and **Commit move**. The in-game rulebook explains all mechanics. Settings provide sound, reduced motion, and save export. Progress saves in the current browser automatically.

## Run locally

Requires Node.js 22.12+ (or a compatible newer LTS).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Build and validate with:

```sh
npm run build
npm test
npm run test:ui
npm run test:simulate
npm run preview
```

## Project map

- `src/engine.ts`: deterministic rules, legal moves, history, and AI.
- `src/content.ts`: 84 historical figures, six house identities, eight events, nine encounters, and six heirlooms.
- `src/main.ts`: gameplay UI, campaign, onboarding, archive, and dialogs.
- `src/style.css`: court presentation and responsive tactical layouts.
- `src/audio.ts`: synthesized ambient sound and action feedback.
- `src/storage.ts`: browser-local versioned progress.
- `public/art/`: compressed generated paintings and court portraits.
- `tests/`: rule, conservation, save, and complete-match checks.
- `docs/knowledge-base/`: complete Markdown distillation, page transcripts, illustrated card text, and source conflicts.
- `docs/RULES.md`: executable decisions and departures from provisional source material.
- `docs/PRODUCTION-PLAN.md`: approved scope and release checks.
- `docs/QUALITY-REPORT.md`: actual validation results and remaining limits.
- `docs/ART-DIRECTION.md`: asset provenance and exact generation prompts.

## Source and historical interpretation

Original PDFs are deliberately excluded from this private repository. Their content has been preserved as a Markdown knowledge base. The supplied decks describe an unfinished, unbalanced tabletop design; this prototype makes explicit digital decisions for victory, card circulation, marriage, collapse, and AI play.

Historical figures meet asynchronously. Archive membership includes relatives, consorts, and allied lineages; Alba follows the source's broad Scottish grouping. Game abilities and attributed in-world lines are fiction, not claims about the moral character of historical people. Court portraits are generated artistic interpretations shared across some card archetypes.

## Hosting and privacy

The deployed game is static. No runtime AI API, purchase system, account, or cloud-save service is required. Fonts and art are bundled. Gameplay saves stay on the player's browser and device. Publishing uploads only the built game; source knowledge-base files and original PDFs are not served by the game host.

## Rights

Original game concept and supplied source material: © 2025 Malachy Murray, as credited in the source decks. This private development repository does not grant an open-source license to the game concept, artwork, or implementation. Third-party dependencies retain their respective licenses; see `docs/THIRD-PARTY.md`.
