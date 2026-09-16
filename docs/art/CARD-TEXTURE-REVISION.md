# Card texture revision — 16 September 2026

## Current implementation

Character faces are composed in a fixed 630×880 coordinate system, rendered at 1260×1760. Canvas places raster art and kerned text; CSS does not lay out face contents. `src/card-texture.ts` owns the print geometry. The battlefield maps this canvas to a Three.js mesh on the physical card body. Transparent CSS3D buttons remain solely as keyboard/touch/inspection targets. Surrounding board labels and controls retain their existing implementation.

The hand, inspection and proof gallery use the same texture compositor. The published gallery at `/proof/` (local working gallery: `/artifacts/showcase-proof/index.html`) is live, with House, format and damaged-health controls; captured PNGs are exports, not its data source. Run `node scripts/showcase-proof.mjs` to recreate the gallery and export all cards.

Tool choice: the current tool inventory includes Adobe asset/edit/layout services and Higgsfield Blender scene operations; project context also lists Tripo. This deliverable needs generated raster ornament, exact runtime text and an existing flat card mesh, so built-in image generation plus the native Three.js texture pipeline is the direct fit. No Blender or Tripo modeling operation was needed to position printed information.

## v3 integrated frames (September 16)

The v2 shared plaque was stretched into the rules area, visibly changing its border density. The replacement uses one generated full-frame PNG per family and face format, drawn once at 630 × 880. The outer ornament, circular cost socket, full-width information panel and combat sockets belong to that same artwork. No cropped fitting is enlarged into another shape.

All families retain the same dynamic text coordinates. Full rules use x=54 through x=576, with name baseline 605 and functional keyword/reminder flow beginning at baseline 636. The complete panel spans almost the full card width. This supersedes the previous reserved right-hand strip in response to the latest user direction. A closed single-sword silhouette replaces the disconnected stroke icon. The canonical house SVG remains centered at the bottom; the right footer reads “O&O · PROTOTYPE” and is reserved for production credits.

Generated source files and extraction attempts are recorded in `frame-v3-prompts.json`. Painted checkerboard exports are rejected; only PNGs with actual alpha transparency are eligible for runtime use. Original v1/v2 art remains preserved.

## Previous v2 information areas (superseded)

All six families share exact cost, combat, title and icon coordinates. Generated fittings may be restyled in future, provided their usable interiors stay fixed. Current fitting art uses engraved antique gold and dark enamel.

- Gold socket: upper left, `(18,18,126,126)`.
- Combat plaque: bottom left, `(24,796,232,70)`. Large deterministic sword and heart silhouettes; attack and remaining health only. Damaged health and heart are red, never fractions.
- House icon: bottom center, `(265,780,100,100)`. Calls the exact `crest()` SVG used in selection, scoreboards, archive and handoff. The opaque socket fully covers generated pictorial heraldry; its decoration is not substituted for the canonical icon.
- Full text plaque: `(24,552,500,230)`. Board name/role plaque: `(24,680,500,102)`. The rightmost 16% contains no essential data. Faces remain unobstructed.
- Modified live costs have a distinct tint; the card tooltip reports current and printed costs. Damage counters remain, counter-rotating their numeral on exhausted cards. Orientation and marriage links remain engine-driven.

## Generated assets and provenance

Built-in `image_gen` created six new transparent perimeter assets and one shared fittings sheet. Runtime files are under `public/art/frames/`: `alba-perimeter-v2.png`, `plantagenet-perimeter-v2.png`, `tudor-perimeter-v2.png`, `valois-perimeter-v2.png`, `habsburg-perimeter-v2.png`, `bourbon-perimeter-v2.png`, `shared-fittings-v2.png`. Original v1 artwork is preserved. Sprite source rectangles are sampled directly by Canvas; no procedural replacement border or CSS gradient is used.

Exact family and portrait prompts: [texture-revision-prompts.json](texture-revision-prompts.json). The fittings prompt requested real alpha, two blank engraved fittings only, a top-left circular socket and a bottom-left dark enamel plaque, no numbers, icons, text, other border, or ornaments intruding into the usable interiors. The resulting source was `exec-ee5f5e8c-598e-48f8-99e8-dd7039594087.png` in the current Codex generated-images directory. Source crop coordinates were measured from its alpha and visually inspected.

## Portrait evidence

The live roster contains 84 distinct portrait files and 84 distinct SHA-256 digests. The former gallery was stale and still displayed shared archetypes. Henry III and Edward I also received new, visually distinct v2 portraits: seated, broad-faced Henry in a cropped Westminster interior; tall, narrow Edward in mail at whitewashed Conwy. Their generation records preserve previous versions in `character-generation.json`.

The [84-person evidence audit](../research/CHARACTER-PORTRAIT-EVIDENCE-AUDIT.md) distinguishes portrait evidence, later iconography and reconstruction. Specific sources support periods and material culture, not every generated facial feature. This revision does **not** certify all 84 images as historically authenticated likenesses. The audit records remaining source limitations, including Margaret Tudor's disputed identification and Louis XI's later statue reference.

## Executed revision passes

1. Replaced per-family CSS text coordinates with fixed texture composition and actual WebGL surfaces; generated quieter perimeter art.
2. Used shared raster sockets and the existing canonical house SVG, enlarged stat silhouettes, removed maximum-health fractions, and refreshed the gallery to render live data.
3. Inspected all six full-face contact sheets and damaged battlefield sheets. Moved name baselines inward; visual inspection then caught the longest Tudor rules too close to the lower rim despite passing the first bounds check. Adjusted body leading/weight and tightened the check.
4. Captured opening, legal deployment, dense courts and inspection at 1440×900, 3840×2160 and 390×844, including phone hand scrolling. Inspected rendered outputs; preserved keyboard/touch targets and selection/inspection behavior.

Verification exports live under ignored `artifacts/showcase-proof/` and `artifacts/showcase/`. Automated texture checks cover 84 cards × two formats × two health states (336), actual glyph bounds, current stats, red health pixels and duplicate portrait bytes. These checks measure correctness and containment, not artistic perfection or historical certainty.


## Final release checks (September 16)

- Generated twelve complete v3 frame assets, with actual RGBA transparency; all text uses the same fixed coordinates across families.
- Replaced narrative role opinions with shared functional keywords and italic parenthetical reminders. Corrected the Queen’s visible word spacing using glyph ink bounds. Added the same single-sword silhouette inline to Commander text.
- Visually reviewed all six full-rules sheets and all six damaged battlefield sheets (84 unique characters in each format). Automated checks passed 336 card/format/health combinations, including text ink bounds, frame clearance, red current-health pixels and unique portrait file hashes.
- Inspected opening, a legal deployment and expanded courts at desktop and phone sizes. The 12-Noble-per-House fixture exposed support-component overlap; Crown and Estate components now occupy a separate row below rival courts. Large Estate holdings use a counted physical stack.
- The complete nine-step guided match passed at 1440×900, 3840×2160 and 390×844, with 32 interactions and no browser errors in each run.
