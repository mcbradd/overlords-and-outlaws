# Reversible O&O card back — October 2, 2026

The card back uses one 63:88 vector master at `public/art/oando-card-back.svg`: navy stock, a restrained gold engraved frame, and two opposing O&O medallions. The lower monogram is a 180-degree rotation of the upper one; lattice and corner ornaments share that rotational symmetry. Letters are outlined paths so their appearance does not depend on a browser font.

The same artwork supplies DOM draft backs, received cards, concealed faces and the 3D deck/hand texture. Receipt explanations remain in the tutorial and accessible card label; they are not printed across the reversible artwork. No card identity or value is added to a back.

Adobe tools were available and considered. A vector master built from outlined type was chosen for precise rotational symmetry and scalable physical card proofs; no new 3D component was needed. A standalone Blender MCP and Tripo tools were not exposed in this session.

Validation: production build; rules and UI suites; 2/3/4-player desktop/compact opening, action, dense Court and focus captures; all draft exchanges and founding flows; rendered upright/inverted comparison. The browser proof (`scripts/core-card-back.ts`) checks 180-degree pixel equivalence allowing subpixel antialiasing and captures both orientations for actual inspection. Added it to the release inventory.

Executed visual pass: opened the 630×880 upright/inverted vector rendering, confirmed O&O remains readable upright from either end and ornaments do not introduce orientation. Prod candidate inspection and deployed revision evidence are retained under ignored `artifacts/card-backs/`. Main remains locked and is not promoted.
