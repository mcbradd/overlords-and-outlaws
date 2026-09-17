# Build 5 scene and card implementation review

17 September 2026. Planning freeze: `3fbb734`. Source ownership: `src/core-game/face.ts`, `face.css`, `scene.ts`, `scene.css`. No original artwork changed; no Git commit made by this implementation agent.

## Implemented API

- `faceHTML(id, { reference?, back? })`: noninteractive inner markup; caller owns the outer button. Preloaded face uses the canonical canvas pixels and full name/suit/rank/role alternative text. `reference` currently enlarges the same reminder face; it is **not** a finished full-rules print face.
- `preloadCards(ids)`: decode portraits/fonts and prepare canonical images; failure rejects with the missing portrait rather than silently leaving an empty art aperture.
- `cardCanvas(id)`: shared 630×880 print composition for hand, inspection and WebGL. `cardBackCanvas`, `rankLabel`, `escapeHTML` also exported.
- `new CoreTable(host, onInspect)`, `update(projectedView): Promise<void>`, `ready`, `focus(seat | null)`, `setReducedMotion(boolean)`, `setInteractive(boolean)`, `pan(dx,dy)`, `dispose()`.
- Normal camera supports drag/arrow-key pan, Home/reset and Shift-drag tilt. Tutorial can disable incidental focus/pan/inspection with `setInteractive(false)` while still updating the camera through the app.
- Projected state only: public Court/Played, concealed counts, visible deck count, Crown, marriage and per-attacker attempt marks. Pending response correctly identifies the answering seat, while engine active remains the initiator.
- Procedural wood/rim/felt board, rounded cardstock and Crown card, aligned CSS3D hit areas, contact shadows, shared face textures, Played piles, source-target Recall arrow, marriage links and numbered attempt tokens. Successful Recall exchange movement follows the two publicly relocated IDs; the parent inspector describes the newly approved exchange rule.
- If WebGL creation fails, render public face cards and readable state in an inspectable semantic fallback. This code path was authored but has not yet been forced and visually verified in this subtask.

## Creative tools and asset choice

Discovered ImageGen, Adobe tools and Higgsfield’s Blender-backed scene tools. Native Tripo/Blender MCP were not exposed in this session. Read the ImageGen skill’s applicability boundary: deterministic code-native components fit Canvas/Three authoring. No generated raster editing was needed to correct layout geometry. Existing bespoke portraits remain unchanged and fill the entire intended aperture. The new restrained engraved silhouette does not reuse the earlier mismatched raster frame openings.

## Executed visual passes

These are actual local Chromium captures opened with `view_image`, not just generated files. They use the real scene, content and reducer through a temporary browser preview harness, not the entire app UI. Artifacts are ignored local evidence and need archival under the parent’s final candidate record if required.

1. `artifacts/core-scene-first.png`: found green playing surface buried by wood bevel, overbright ink, large empty vertical composition. Corrected surface depth and lighting.
2. `artifacts/core-faces-first.png`: inspected three prototype faces; enlarged name type from 53 to 70 canonical pixels and grew the name field. Full bleed portraits and consistent 63:88 stock visible.
3. `artifacts/core-scene-second.png`, `core-scene-short.png`: confirmed green surface correction, but 900×430 overview reduced cards too much. This failed readable scale and triggered a broad-layout revision.
4. `artifacts/core-scene-broad-final.png`, `core-scene-mobile-final.png`: broad short-board composition and mobile Court focus. Found Draw pile/seat-heading overlap and corrected it by moving shared pieces to the central gap. Centering focus on Court rather than empty seat space keeps the ruler and its office inside the mobile viewport.
5. `artifacts/core-scene-current-opening.png`, `core-scene-current-recall.png`, `core-scene-current-mobile-recall.png`: 1250×316 opening and first legal Recall, plus 390×250 focused response. Saw and removed a surviving redundant “Crown unclaimed” label crossing the opponent portrait. The remaining source arrow identifies the targeted card; mobile source is outside the focused Court and must also be explained by the visible guide.
6. Individually read every identity, portrait crop, rank, role and name in the four 13-card proof sheets: `artifacts/core-face-proof-alba.png`, `core-face-proof-plantagenet.png`, `core-face-proof-tudor-verified.png`, `core-face-proof-habsburg-verified.png`. The verified last two explicitly awaited HTML image decoding before capture; earlier captures were not accepted as final. All 52 intended portrait apertures are filled, titles stay in the parchment field, and long names wrap to two lines. At reduced play scale, the parent’s readable name/action caption remains necessary.

After final owned-file formatting, `npx tsc --noEmit --pretty false` passed. This is source validation, not proof of every screen, device or rule. No blind player observations or ten-game claims made here.

## Explicit remaining gates / defects

- Full operative printed reference faces are unfinished. Current face footer lists reminders; the parent’s inspector supplies rules prose. I13 cannot be considered passed on that basis. A print/reference composition or card plus physical rule aid must be designed and visually checked without unreadably compressing all six action rules into a portrait card.
- Complete action/claim/marriage/dense/fallback/motion/viewport matrix has not been executed by this subtask. Only the named opening and Recall states were visually inspected. In particular, dense four-seat courts require additional pan/focus/keyboard checks.
- The mobile focused view intentionally cannot show both distant Courts legibly in 390×250. The app must retain public rival information and an explicit incoming lead/target explanation while tutorial camera interaction is disabled. A source arrow entering from outside the viewport alone is insufficient instruction.
- The final removal of redundant Crown text followed the last opened state screenshots; the parent’s next actual app inspection must verify that exact final composition.
- Card IDs leaving Played at a boundary disappear into the updated hand rather than receiving a full travel animation in the scene. New private draws use a visible source pile and count change but do not expose a face. The app’s outcome text and hand presentation need verification for adequate causal clarity.
- Semantic fallback was implemented but not deliberately invoked during this subtask. Full parity for Crown relationships and attempt explanations still needs actual inspection alongside the parent’s goal/status surfaces.
- No physical device notch/keyboard or browser-wide acceptance is claimed. No production deployment by this agent.

## Final reference component handoff

The earlier missing full reference rules limitation is superseded at the component level by `BUILD-5-REFERENCE-AMENDMENT.md`:52 explicitly labeled character ability-index faces plus12 shared procedure faces cover the retained core. This is intentionally a physical reference set rather than unreadably dense individual character cards. All52 corrected indices and all12 procedures were actually visually inspected; the audit records rejected revisions and accepted proof paths. Final Crown-overlay removal was recaptured and opened. Parent app integration, full viewport matrix, fallback forcing, dense-court scenarios and blind observation remain separate gates; these are not claimed complete by this component handoff.
