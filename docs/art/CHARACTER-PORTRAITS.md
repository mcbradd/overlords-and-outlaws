# Bespoke character portraits

This revision replaces the shared House archetypes with individual, researched portraits for the 84 playable characters in `src/content.ts`. Artwork is an interpretation, not proof of a sitter's appearance. House membership and gameplay roles remain the game's existing groupings.

## Sources and reproducibility

- [Full roster research](../research/CHARACTER-PORTRAIT-RESEARCH.md) distinguishes historical evidence from costume, setting and facial reconstruction.
- [Character briefs](character-briefs.json) identify the individual, period, clothing, setting, props, exclusions and institutional sources.
- [Generation manifest](character-generation.json) records exact submitted prompts, built-in image-generation provenance, original generated paths and installed assets. Entries are added only after an image is saved successfully.
- Original source portraits and family frame artwork remain untouched. New portraits live in `public/art/characters/`.
- The 84 installed WebP portraits total 33.7 MiB. All 90 generated PNG candidates, including six superseded first versions, are retained in `docs/art/character-masters/`. Original generation paths remain in the manifest; older public PNG paths in revision history describe their staging locations before archival.

## Composition

Each portrait is a standalone illustration behind the existing family overlay. Heads and headwear occupy the central upper opening; identity-bearing props sit near the chest. Background and clothing continue below the full-card information field so the same artwork supports the taller battlefield opening. No names, costs, rules or frame decorations are baked into the new portraits. Runtime cards retain 63:88 proportions, live statistics, counters, orientation and accessible inspection.

Family palettes complement the existing generated frames: Alba stone/silver/forest; Plantagenet oxblood/gold; Tudor ebony/garnet/ivory; Valois lapis/ivory/bronze; Habsburg black/old gold; Bourbon midnight blue/gilding. These palettes are composition choices, not claims about historical uniforms.

## Verification

`npx tsx scripts/portrait-audit.ts` renders all characters in both frame types and records loaded image dimensions and unique asset coverage in `artifacts/portraits/coverage.json`. The family contact sheets support visual inspection. `scripts/showcase-preview.ts` covers opening, action, dense courts and compact screens.

Completed September 16, 2026:

- Audited all 84 roster identities and wrote individual source-backed briefs. Resolved similarly named sitters explicitly and recorded uncertain medieval likenesses as reconstructions.
- Generated 84 individual portraits with the built-in image-generation tool. An initial framed Alba review exposed overly similar faces; revised Malcolm III, David I, Alexander II, Alexander III and Duncan I with distinct ages and facial structures. Revised Henry VII to remove a later Westminster tower. Six second versions are installed; their first versions remain archived.
- Visually inspected all twelve family sheets: 84 full reference faces and 84 battlefield faces. Faces, headwear, upper-body props and palette were checked against the existing frame openings. No frame or live-data layout changes were necessary in this portrait pass.
- Encoded WebP at quality 94 with unchanged pixel dimensions and retained PNG masters. Complete browser coverage passed: 84 IDs, 84 unique loaded assets, 84 bespoke paths. Shared House portrait fallback has been removed; House selection and campaign portraits use their named leaders.
- Captured and inspected opening, legal deployment, dense courts and inspection on desktop and phone, plus opening and dense courts at 3840×2160. The phone hand was also checked after scrolling into view. Captures are in ignored `artifacts/showcase/`; twelve portrait sheets and the asset report are in ignored `artifacts/portraits/`.
- Build passed; 42 rules tests, three UI tests and 252 reference-face layout checks passed. `git diff --check` passed. Vite retains its existing large Three.js chunk warning.

Reproduce complete portrait coverage with `npx tsx scripts/portrait-audit.ts --complete`; regenerate the registry with `npx tsx scripts/sync-character-art.ts --complete`. These checks verify coverage and rendering, not historical authenticity. Attire and settings remain source-informed artistic reconstructions, and early faces are invented. Print bleed, CMYK conversion and manufacturing proofs are outside these prototype image files.
