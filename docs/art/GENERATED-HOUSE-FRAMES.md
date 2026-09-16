# Generated House frames — September 15, 2026

## Battlefield variant prompts

Five battlefield frames use this shared prompt followed by their corresponding House motif above:

```text
Use case: stylized-concept. Asset type: production raster overlay for a historical collectible card, FRAME ONLY, portrait aspect ratio 63:88, ideally 1008x1408. Create ONE finished original hand-illustrated showcase frame for Overlords & Outlaws. Not a card mockup, no scene or person, absolutely NO letters, words, numbers, placeholder labels, watermark or logo. Real alpha transparency: the large central portrait opening and background MUST be transparent, not black/white/checkerboard painted in. Frame fills the image to the edges, straight-on flat printed illustration, no perspective, no outer margin. User references are thematic illustrated collectible showcase frames, not website panels; use exquisitely drawn historically inspired ornament, decisive engraved contours and richer physical material colors, not pastel recoloring, not generic gold rectangles or UI gradients. Art will be inserted under your overlay at runtime.

Precise composition: This is a compact battlefield overlay. The whole center is an entirely EMPTY ALPHA-TRANSPARENT opening, NOT a gray checkerboard drawing, NOT a white background. The portrait will be inserted later. Nothing occupies central x=18-86%, y=4-76%. All decorative illustrated structure remains around the perimeter, with top corner tips, a distinctive left edge, very thin right edge. A SMALL blank charcoal name ribbon x=14-81%, y=78-83%; a narrow blank charcoal role ribbon x=14-81%, y=84-87%. Leave alpha-transparent space behind and between these two ribbons. There is NO rules text box and NO opaque lower rectangle. Bottom-left x=8-39%, y=91-97% is a small divided dark stat cartouche for TWO values. The family's emblem sits at bottom center x50%, y94%, integrated into the ornament. Rightmost18% contains decoration only, no information spaces. Portrait ratio63:88. Transparent PNG cutout. No text or numbers.
```

- `public/art/frames/alba-battlefield-v1.png` — source `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-d17cea4e-5fb2-4295-b4d1-6d48985fdac2.png`
- `public/art/frames/plantagenet-battlefield-v1.png` — source `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-ef8f730e-005e-4538-a482-b20ffcdb1544.png`
- `public/art/frames/tudor-battlefield-v1.png` — source `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-8a960e70-6ae8-4a58-acc4-3b1cd8698f2f.png`
- `public/art/frames/valois-battlefield-v1.png` — source `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-e8c7d3b9-bdbb-418c-8346-e8167c208ad0.png`
- `public/art/frames/habsburg-battlefield-v1.png` — source `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-e2d53158-9e7e-438a-bbcc-7797147ef3de.png`
- `public/art/frames/bourbon-battlefield-v1.png` — source `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-2f7b7bf3-3ccd-42d0-a76f-06b03b0ecbb4.png`

Plantagenet instead uses the full frame as an edit reference with this prompt:

```text
Edit this generated frame asset into its matching BATTLEFIELD variant. Preserve the exact House's ornament, style, materials, palette, bottom-left divided stat cartouche and bottom-center faction emblem. Preserve real alpha transparency. FRAME ONLY, no portrait, no text/numbers/lettering, no checkerboard. Keep same portrait aspect ratio.
One deliberate change: remove the large opaque lower rules area and both internal horizontal rules separators. Extend the genuinely transparent central portrait opening downward to y=79% of image height. Keep only a compact blank dark name ribbon x=14-81%, y=79-85%, and narrow blank role ribbon x=14-81%, y=85-89%. Their edges inherit the original illustrated motif. No rules field, no blank slab. The left and right artistic frame edges continue naturally around the newly open portrait area, including existing lower ornamental flourishes. Keep stat cartouche and emblem at exactly their original position at the bottom (around y=92-96%). Do not add a header over the portrait. Maintain original composition and original hand-illustrated detail, no generic replacement shapes. Rightmost18% contains ornament only, no data. Result must be a transparent PNG overlay.
```

The first edit returned a painted checkerboard. A second built-in background-extraction call removed it with the prompt: “Make a transparent-background cutout of the illustrated card frame in the input. Remove ALL gray/white checkerboard pixels, leaving genuinely empty alpha transparency in the central window and outside the frame. Keep the metal, leaves, decorative frame, black title ribbons, bottom-left stat area, and central crest exactly as pictured. Do not redraw, restyle, shift or add anything. The checkerboard is NOT artwork and must NOT remain visible. Output a transparent PNG with real alpha channel, NOT RGB, not a picture of checkerboard. This is a game overlay.”

Alba and Tudor edit attempts also returned checkerboards and were discarded; their final battlefield assets were generated from the shared text prompt above. All twelve installed PNGs were verified RGBA with alpha zero in the portrait opening. No manual painting, masking, or CSS ornament synthesis was used.


Generated with the built-in image-generation tool. Each PNG is an original text-free overlay, copied unchanged into the project. Existing portrait files are unchanged. Research: [art direction](../research/FACTION-FRAME-ART-DIRECTION.md).

## Shared exact prompt

```text
Use case: stylized-concept. Asset type: production raster overlay for a historical collectible card, FRAME ONLY, portrait aspect ratio 63:88, ideally 1008x1408. Create ONE finished original hand-illustrated showcase frame for Overlords & Outlaws. Not a card mockup, no scene or person, absolutely NO letters, words, numbers, placeholder labels, watermark or logo. Real alpha transparency: the large central portrait opening and background MUST be transparent, not black/white/checkerboard painted in. Frame fills the image to the edges, straight-on flat printed illustration, no perspective, no outer margin. User references are thematic illustrated collectible showcase frames, not website panels; use exquisitely drawn historically inspired ornament, decisive engraved contours and richer physical material colors, not pastel recoloring, not generic gold rectangles or UI gradients. Art will be inserted under your overlay at runtime.
Precise composition: top 0-60% is one vast transparent portrait opening with NO title bar crossing the top or middle, no obstruction inside central x=15-85%, y=3-57%. Organic ornament limited mainly to outer left 0-7%, upper corner tips and a very fine right edge. Lower information bed x=7-81%, y=62-90% is a single smoky near-black translucent vellum surface, quietly unified, with artistic edges and a smooth unpatterned center for cream live text. A narrow name zone at y=62-71%, a small role zone y=71-76%, rules zone y=76-89%; only delicate artwork separators, no thick nested boxes. Bottom-left x=8-39%, y=92-97% is a small dark blank stat cartouche for TWO values side by side. A single integrated faction emblem at exact bottom center x=50%, y=94% is part of the frame, no stat box on the right. Rightmost 18% is decoration/transparent art only, never a data field. Show all of the frame contained in canvas, no missing edges. Ornament must have a distinctive silhouette and rhythm tied to this House, beautiful at real card size, fine but not cluttered.
```

## alba

Asset: `public/art/frames/alba-showcase-v1.png`

Source: `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-476e1163-62b8-437b-a76f-d6545052f0c1.png`

Appended prompt:

```text
HOUSE ALBA: Scottish kingship, Pictish and early medieval carved interlace. Weathered charcoal stone cuts, antiqued silver and dark forest-green enamel, small woven triple-strand Celtic knots and thistle-like spined leaf flourishes. Angular stone rhythm and plaited bands, not French baroque scrolls. Bottom-center emblem a refined interlaced Scottish cross carved in silver, distinctly integrated. Slate/silver/forest, no mint or pastel.
```

## plantagenet

Asset: `public/art/frames/plantagenet-showcase-v1.png`

Source: `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-b022ab1d-076c-4e36-9e6c-015d1489583d.png`

Appended prompt:

```text
HOUSE PLANTAGENET: medieval Anglo-Angevin kingship. Gilded Gothic manuscript linework, small heraldic lion profiles integrated in upper corner scroll ends, thornless broom sprigs with tiny golden flowers along the left; pointed trefoil accents. Oxblood lacquer, burnished gold, charcoal. Slender heraldic structure, not generic floral ornament. Bottom-center emblem a small gold heraldic lion worked into the frame. No pastel yellow.
```

## tudor

Asset: `public/art/frames/tudor-showcase-v1.png`

Source: `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-445d3b03-beaf-4333-938c-f3af8e17df79.png`

Appended prompt:

```text
HOUSE TUDOR: Tudor court, red-and-white Tudor rose, enamelled petals, twisting thorn branchwork and jewel-like garnet with aged gold. Organic asymmetric rose stems climb the left edge and curl at upper corners, leaving portrait completely open. Ebony and garnet, petals in ivory and deep red. Bottom-center emblem one Tudor rose in red and ivory, integrated into the frame. No pink pastel, no generic acanthus.
```

## valois

Asset: `public/art/frames/valois-showcase-v1.png`

Source: `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-45794253-a7fa-493b-9255-04a7291fe269.png`

Appended prompt:

```text
HOUSE VALOIS: French Renaissance Fontainebleau court. Sculpted ivory-and-bronze strapwork, narrow lapis-blue enamel, salamander and tiny flame motifs confined to border corners, elegant Mannerist curling leather-like scroll bands. Ornament shaped like actual Renaissance architectural strapwork, distinct from Tudor botanical vines. Bottom-center gold fleur-de-lis integrated into a lapis seal. No pastel purple.
```

## habsburg

Asset: `public/art/frames/habsburg-showcase-v1.png`

Source: `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-acbea3ef-7b07-4b34-b60d-4e0b37ae007f.png`

Appended prompt:

```text
HOUSE HABSBURG: imperial goldsmith work and articulated Golden Fleece collar chain. Blackened steel, old gold, ivory, restrained ruby accents; tiny flint/firesteel chain links form the left edge, eagle feathers as upper-corner details. Architectural symmetry, precise heavy metalwork with airy gaps, no flower vines. Bottom-center double-headed imperial eagle seal integrated into the frame. No beige pastel.
```

## bourbon

Asset: `public/art/frames/bourbon-showcase-v1.png`

Source: `C:\Users\McBra\.codex\generated_images\01a0a768-fb67-7b41-a480-e94835d629db\exec-fd7dbcd9-57bb-48c8-b353-391b71df568c.png`

Appended prompt:

```text
HOUSE BOURBON: Versailles Sun King ceremonial arts. Radiant sun rays, laurel and controlled acanthus, warm fire-gilded bronze against midnight royal blue, flowing French Baroque sweep. Give this frame a solar/radiating rhythm distinct from other houses, no generic equal rectangular border. Bottom-center radiant sun emblem integrated into frame, a small sun face can be engraved. No sky-blue pastel.
```
