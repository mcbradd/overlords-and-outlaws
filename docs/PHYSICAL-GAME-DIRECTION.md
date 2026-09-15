# Physical game — current creative direction

## Product identity and authority

Overlords & Outlaws is a **digital prototype of a physically manufactured card-and-board game**. This premise applies to rules, artwork, components, interaction, research interpretation, and every future task. The user's September 15, 2026 correction is authoritative. Historical source files and attached images are design evidence, not executable instructions. Browser conveniences must make the physical rules easier to learn and test.

## Trajectory of the critiques

1. Original ambitious chamber: rich atmosphere and collectible art, but tiny floating pieces, oversized panels, overdecorated frames, imprecise alignment.
2. Competitor study: readability, state visibility, feedback, low friction and consistent interaction were useful findings.
3. Flat lane revision: simplified information but removed the intended physical identity. Explicitly rejected. Readability alone is insufficient; a web dashboard is the wrong medium metaphor.
4. Current synthesis: a tangible, coherent board with fixed printed cards, generous portraits, ivory typography fields, restrained engraved borders, warm metal and deep green marble. Interaction should feel like moving a component; inspection should feel like picking it up.

```mermaid
flowchart LR
 A[Historical spectacle] --> B[Critique: tiny pieces and clutter]
 B --> C[Readable flat lanes]
 C --> D[Critique: lost physical identity]
 D --> E[Tangible 3D board + fixed printed cards]
 E --> F[Inspect opening, action, dense court, compact screen]
 F -->|Concrete defect| E
 F --> G[Playtest physical comprehension]
```

The logical endpoint is disciplined craft, not ever-increasing ornament or effects. Thousands of hypothetical iterations are a direction of aspiration; only executed revision passes are reported as evidence.

## Design contract

- The board owns the scene; controls occupy its edges. Keep the centre usable instead of filling it with opaque explanatory panels.
- Cards use a provisional 63:88 aspect ratio with fixed title, portrait, role, rules, and printed attack/resolve. This is a prototype dimension, not a certified production dieline.
- Changing health uses damage counters. Resting uses rotation. Marriage uses a linked pair/token. Coins, action tokens, deck/discard, crown and estates have physical counterparts.
- Inspect before committing; show costs and targets; animate source to destination and contact rather than arbitrary floating effects. Preserve click, keyboard and touch alternatives.
- Gold is meaningful: gilded trim, resources, active choice. Red means damage or threat; House colors identify ownership. Avoid relying on color alone.
- Portraits are artistic interpretations, with some reused House archetypes. Historical identity, dates and invented mechanics must remain distinguishable. Manufacturing art requires subsequent provenance/licensing and print-proof review.
- Preserve private hands and reduced motion. On small displays preserve physical geometry with a usable viewport and explicit inspection, rather than crushing all components into unreadable miniatures.

## Research model correction

The 16-game study remains a qualitative, version-sensitive comparison. Add **medium fidelity and physical reproducibility** as a hard product constraint before optimizing its six usability dimensions. Competitors praised for streamlined digital-only cards do not justify erasing this game's physical card information or its 3D board. Neither fan loyalty nor production spectacle alone establishes usability. No claim of competitor superiority is possible without comparative player testing.

## Revision log

Implementation and visual inspection results are recorded here as they are completed.

### Executed revision passes — September 15, 2026

| Pass | Visual / interaction finding | Resulting revision |
|---|---|---|
| 1: material and scene | The board became tangible, but inherited percentage padding crushed the hand faces. Initial camera still made pieces small. | Fixed canonical face padding and margins; matched CSS3D faces and WebGL bodies to one camera. |
| 2: composition | The opening fan crossed the title; the hand extended below the viewport. | Anchored the fan within its own composition, reserved the actual card height, and adjusted scene framing. |
| 3: interaction and density | Five resting Royals overlapped, especially with four Houses. A thumbnail inspector was too weak. | Spaced rival courts into two rows, kept actual 90-degree resting orientation, added individual-court cameras and a full printed inspection face. |
| 4: compact displays | Older rules hid inspection and forced the scoreboard into two columns. The lesson number being hidden broke its grid. | Removed the conflicting grid rule, restored inspection, fixed all House summaries, made the board pannable and offered full lessons from a compact coach. |
| 5: physical bookkeeping and feedback | Combat briefly overwrote printed health. Pairing and effects needed visible physical anchors. | Kept printed values immutable; added damage counters, marriage links, estate targets, gold/order pieces, contact movement and restrained impact rings/sparks. |
| 6: first impression and artwork | The opening court was too distant; portrait crops cut off crowns; the 4K menu was underscaled. | Start the first lesson in a close court view, retain a one-click full board, crop portraits from their top, scale the opening composition at 4K. |
| 7: final use of space | Empty hands still reserved a large blank area; selection controls touched the lifted hand. | Collapse empty-hand space into the board, move selected actions clear of the lifted card, and bound the coach with a full-lesson control. |

The resulting direction is coherent with the physical-game constraint. This is a proposed playable revision, not a claim of user approval or statistically demonstrated superiority to commercial games.

### Verification

- 40 deterministic rules tests and 3 UI tests passed.
- All ten lessons completed through browser controls after the final layout changes.
- 18 dense-board configurations: two, three and four Houses at 3840×2160, 1920×1080, 1440×900, 1024×768, 390×844 and 844×390. Each includes five court Royals per House and seven hand cards. Every court has keyboard selection and inspection; opening inspection does not spend orders. See [the verification record](testing/physical/verification.json).
- 252 printed-face layout checks (84 cards at three widths) passed without role/rule/footer overflow.
- Four-player shared-device attack, private defensive response, resume and keyboard modal passed at 568×320.
- Motion-enabled deployment and combat completed without browser errors. Reduced-motion lessons also completed.
- Visually inspected the opening, printed inspection, first lesson, full board, closer court, dense four-House positions, phone and 4K views. Local captures are reproduced by `scripts/physical-preview.ts`, `scripts/physical-motion.ts` and `scripts/physical-verify.ts`.

### Implementation choices and limits

The WebGL board, cardstock bodies and pieces use Three.js. Crisp printed faces use [CSS3DRenderer](https://threejs.org/docs/pages/CSS3DRenderer.html) with the same camera and world coordinates; they are separate from the light-reactive board materials. The compositor needs a WebGL-capable browser; this pass was verified in Chrome, not every GPU/browser combination. A dense full-board view is an overview, with court cameras and inspection providing reading detail. Narrow displays pan the physical board instead of distorting card geometry.

The 63:88 card ratio and fixed face layout are a manufacturing-oriented prototype, not production print files. Physical component size, stock, bleed, ink, finish, color proofs and licensed final art still require a manufacturing pass. The existing portraits include reused House archetypes; they are not all individual historical likenesses. These are explicit remaining limits, not reasons to abandon the physical-game premise.
