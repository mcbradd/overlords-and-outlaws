# History engine implementation report

Implemented on `prod`, September 16, 2026. This is the playable digital prototype of the R3 revision in the three HISTORY-ENGINE specification/content/contracts documents. It is not an M8 release candidate or manufacturing sign-off.

The user explicitly directed: **“Defer the gate; implement the full prototype.”** This defers M1b's six adversarial human paper games as a prerequisite to digital implementation. It does not invent results for those games or amend the designer's answer ledger.

## Delivered

- A separate deterministic v4 rules engine, used by the default application. All four modules, all eleven valid module combinations, two to four seats, simultaneous 3/2/1 Inheritance, four-seat repair, duplicate declarations, three-seal opportunities, consecutive passes, Claim/Counterclaim, staged private Barter, nontransitive marriages, all twelve Interregna, four Laws, Regency, Veil and terminal Eudoxia are represented.
- Explicit boundary continuations, frozen simultaneous choices, card conservation, atomic invalid-action rejection, public event records and seat-specific observation projections. Card Text compiles to typed payloads; reminders cannot create powers.
- A 92-card source manifest: 52 Nobles, four Laws, twelve Interregna and 24 fragments. Existing character identities and art remain intact. The old 84-card archive and v3 runtime are available through `?legacy=1`.
- Versioned saves under `oando-v4-history` (with the configured environment prefix). The v3 key is retained. Import rejection offers recovery instead of clearing storage. Reopening a save shows a privacy curtain.
- Solo opponents and advice use the relevant seat projection. Offer consideration is bounded to 64 candidates. AI turns execute in a worker, preserving the same deterministic result without blocking the UI. Policy version, budget and observation revision are saved.
- A continuous 59-action teaching match. Every action passes through the engine; Continue changes only the guide cursor. It teaches drafting, bargaining, defense, marriage, cooperative warning response, active conditions, Veil, a failed Crown attempt, rebuilding, actual succession and full-round settlement. Four prediction questions precede a clearly labeled new practice scenario whose first choice is unaided.
- A procedural Three.js tabletop with solid cards, mats, seals, Crown, four painting trays, expandable Courts, consistent 63:88 faces, public captions, inspection and seat cameras. Keyboard/touch controls, reduced motion, mute, larger text, quality settings and automatic semantic fallback retain the same game.
- Reproducible HTML card proofs and a 22-page print-and-play PDF with cards, actions, Laws, timing references, component registers, tokens, backs, reset procedure and manufacturing worksheet.

## Verification actually performed

| Check                           | Result                                                                                                                                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                      | 76 passed, including 26 history-engine tests and retained legacy tests                                                                                                                                                                        |
| `npm run test:ui`               | 3 retained UI tests passed                                                                                                                                                                                                                    |
| `npm run build`                 | Card compilation, lint, proofs, TypeScript and Vite passed                                                                                                                                                                                    |
| `npm run test:history:browser`  | 59-action tutorial compared with canonical engine state after every action; Continue neutrality; reload curtain; six viewport sizes; context-loss recovery; graphics-quality switching; prediction/practice flow; worker decision equivalence |
| `npm run test:history:layout`   | Six dense/maximum scenes (24 and 52 public Court cards at 390, 1440 and 3840 px); inspection; hot-seat draft locking; curtain/reload privacy                                                                                                  |
| `npm run test:history:simulate` | 132 complete deterministic policy games over all eleven module combinations; 128 player settlements, four Eudoxia outcomes, maximum round nine; no conservation failure or stuck phase                                                        |
| `npm run test:history:print`    | All 92 canonical faces passed browser ink-bound checks                                                                                                                                                                                        |
| Built Pages-path smoke          | `/overlords-and-outlaws-prod/` build with `prod:` save namespace passed; v3 sentinel remained unchanged; new tutorial/proof and retained six-House archive loaded without failed requests                                                     |
| PDF inspection                  | All 22 rendered pages examined in contact sheets; detailed Law, event and register pages inspected; card-row and token pagination corrected                                                                                                   |

The simulation's maximum observed policy evaluation was approximately 12.25 ms on this host. That is not a named-device GPU benchmark or human decision-time measurement. Headless browser viewport tests do not substitute for real touch hardware or an accessibility audit. Vite reports the existing Three.js core chunk above 500 kB (about 136 kB gzip).

Evidence is generated under ignored `artifacts/history/`: `browser-report.json`, `layout-report.json`, `simulation.json`, `print-fit.json`, compiled manifest, screenshots and PDF renders. The baseline evidence file records the starting HEAD, served Live/prod information and document hashes. The initial HEAD was `992e93c21a221a1d638089169f237f3384f163bf`.

## Visual revision passes

1. Enlarged the board and Court faces, moved painting trays to the central corridor, and corrected long-name clipping in private hands.
2. Verified whole-table and Court cameras at desktop and compact sizes. Maximum Courts remain inspectable; compact overview text is intentionally read through inspection or a seat camera.
3. Found lower-right Court faces clipped despite correct DOM counts. Isolated Chromium's transformed-layer compositing behavior and promoted the card/label layers; fresh dense and maximum screenshots show the faces. Rendering waits also allow the final texture frame to complete.
4. Recreated the renderer when graphics quality changes. Forced a WebGL context-loss event and verified exact saved game preservation through semantic fallback and back to WebGL.
5. Replaced implicit print pagination with explicit nine-card sheets and non-splitting tokens. Downsampled PDF-only intermediate rasters to keep the export approximately 12.8 MB; original assets were not modified.

Reviewed evidence includes `opening-draft.png`, `lesson-25.png`, `lesson-46.png`, `settlement-390.png`, `dense-reviewed-1440.png`, `maximum-reviewed-390.png` and the PDF page contact sheets. These are actual revision passes, not claims of thousands of iterations or player preference.

## Prototype limits and outstanding gates

The digital core is playable across the full module set. The broader specification's production and human acceptance milestones remain open:

- M1a independent human adjudication and M1b paper games have not happened. The software fixtures and simulation are not human balance evidence. Blind teaching, coordinated denial, store demos and other M7 sessions remain unperformed.
- Card language v1 is a closed, canonical clause grammar supporting this complete core set and the redesigned Blood Edict adjudication fixture. It is not a general English interpreter. Unsupported authoring forms fail closed. See [the language reference](HISTORY-ENGINE-LANGUAGE.md).
- The shipping prototype opponent is a deterministic visible-information heuristic. It does not implement a stronger hidden-allocation sampling/search policy. Its action choices and learned information remain constrained by the seat projection.
- M5/M6 final asset production is not signed off. The Court/components use procedural prototype geometry; four paintings reuse existing scene art with new game-context titles. No new historical-composition research or provenance clearance is asserted. No Tripo/Adobe generation or Blender production asset pipeline was executed. The available creative tools were considered; a native Blender MCP connection was not exposed in this session.
- Audio uses original synthesized material/ceremonial cues and public captions. Finished music stems, recorded Foley, mastered mixes, export LODs, texture atlases and supplier-ready commercial print art remain production work.
- Physical handling, actual table fit, concealed sleeve/back opacity, die lines, commercial bleed, paper stock, manufacturing quotes and sample approval require real components and suppliers.
- The complete release suite is updated to include new history checks while retaining legacy regressions, but was not run as an exact clean committed release candidate. No commit, push, deployment or promotion was performed. Main remains untouched.

## Entry points

Run `npm run dev`, then open the displayed local URL. Choose **Learn at the table**, **Set a new table**, or the labeled demo. `public/history-proof.html` is regenerated by `npm run cards:proof`. With the dev server running, `node scripts/history-export-pdf.mjs` writes `output/pdf/history-engine-print-and-play.pdf`.

Implementation lives in `src/history-engine/`. `src/main.ts` chooses the new application or the preserved `src/legacy-main.ts`. [Current rules](RULES.md) describe v4; [legacy rules](legacy/RULES-V3.md) retain the earlier combat game.
