# Tutorial, table presentation and succession revision

18 September 2026. Evaluation work on Prod only; no Main promotion. Reviewer: Codex, with actual rendered-image inspection.

## Changes

The teaching guide is a separate nonmodal body overlay. It does not participate in the game grid or change board/hand dimensions. During action play it occupies the ordinary instruction region, leaving the real response controls and table visible. During setup it chooses a free region around hands and public components. Scripted rival actions run through the legal reducer before the response lesson appears; motion gets time to complete. There are no Watch-the-table gates. Yellow attention now illuminates the entire space beneath the card and pulses; selected cards remain green. Reduced motion disables the pulse and traveling arrow beads.

The environment is a generated council chamber around the native 3D board. Original card art is unchanged. Ruler/Heir labels are outside portraits, screen-scaled for readability; 4K gets larger labels. The draw pile occupies the unused lower-left table space instead of crossing the three-player ruler label. Played cards are smaller and desaturated with a brass separator; inspection retains the full-color face. Sorting is immediately beneath the hand. Disabled Defend is grey.

Dragging uses a lit Three.js arc from the source card to the pointer or unique legal target, with beads moving source to destination. No enlarged card ghost obscures the table. The same arc presents pending challenges. Existing click/touch alternatives remain. Existing stable physical card slots and manual camera focus remain unchanged by legal actions.

Computer plans use each computer's own private view while the human thinks. Changed public state invalidates the cached plan; actions still pass through the deterministic reducer at the current revision. The old 1.3-second turn delay is replaced by a short 180ms motion cadence. Draft packets continue to be prepared privately in advance.

## Rules and confirmation

No gameplay dependency required a separate supporter: it was an additional failure point rather than a necessary part of the requested two-person succession. Native Claim now names the hand card as heir directly. The existing ruler and heir must remain through the entire next round. The ruler retains office during that hold; only successful completion transfers office and wins. Removing an unrelated Court card does not break the claim. A foreign heir still needs the actual marriage link that made its Court entry legal; there is no separate supporter role. The legacy action field named `supporter` remains only as the marrying Queen identifier, not as a Crown dependency.

The win condition is visible before a claim and shows the required round and both names afterward. Completion triggers a congratulatory crown, gold rays and falling petals, the winning pair, and Play again. Three-Noble declaration stays local and reversible until Declare explicitly commits the three ordinary setup actions.

Saves use ruleset `rank-core-succession-v4`; old saves are preserved and rejected with an explanation rather than silently changing their rules. Start a fresh table/tutorial for this revision.

## Verification and actual revision passes

- Initial reproduction measured a tutorial-induced board-height change from 392.078125 to 296.890625 at 1440×900. After separation, the guide-open/closed geometry matched. Formal tests compare normal-game and tutorial board/hand bounds at draft, declaration and defense: 1440×900, 3840×2160, 390×844 and 844×390. They also check nonmodal body placement, viewport fit and non-overlap with hand cards and response buttons.
- Build/typecheck, 180 unit tests and 3 UI tests passed. Succession tests cover no premature victory, both required people, unrelated-card removal, marriage dependencies and the complete legal tutorial.
- The broader desktop browser regression passed all scenarios, with 56 captures and a completed tutorial. Its old hand-only Inspect selector was updated to the actual selected-card Inspect action.
- Complete tutorial passed at 1440×900, 390×844 and 844×390. Declaration/deselection/confirmation plus all three draft rounds passed for 2/3/4 players at desktop and phone sizes.
- Draft presentation and card-back flights passed 17 viewport sizes: 1920×1080, 1536×864, 1366×768, 1440×900, 2560×1440, 360×800, 375×667, 390×844, 412×915, 430×932, 844×390, 414×896, 384×832, 1280×720, 1366×1366, 393×873 and 360×780.
- Defense by click, hover button and direct drag; invalid drop; forced Retreat; unambiguous/ambiguous action handling; grey disabled state: nine viewport sizes, each with 2/3/4 players. Drag screenshots show the arc without a card-image ghost.
- Stable-table checks passed desktop and phone: removing/adding cards preserves existing slots and scale; manual focus survives turns. Hand-sort checks passed four desktop/phone/landscape sizes without changing game state.
- AI readiness measured 264ms, 263ms and 250ms from human Pass to a committed computer move for 2/3/4 players on the local static build. This is observed latency, not a guarantee on all hardware.
- Victory fits desktop, portrait, landscape and 4K; closing restores table input. The first draft overflowed because generic card width styles won the cascade; explicit victory-pair sizing fixed it.

Actual images inspected under `artifacts/core/`: `player-counts/2p-1440-action.png`, `2p-3840-dense.png`, `2p-390-dense.png`, `3p-3840-opening.png`, `3p-3840-dense.png`, `3p-1440-dense.png`, `4p-1440-action.png`, `4p-390-dense.png`, `4p-390-readable-focus.png`; `tutorial-popover/390-step-23-popover.png`; `tutorial-overlay/1440-draft.png`; `challenge/1920-drag-arc.png`; `victory/1440.png`, `390.png`, `844.png`. Screenshots are local verification artifacts, not automatically marked as inspected. The compact whole-table view still uses explicit Court focus/inspection to read card detail.

Inspection found and corrected: floating mobile response guide covering the heir/arrow; landscape setup guide touching the hand; oversized victory faces; tiny Ruler labels; draw caption crossing the three-player ruler; Played caption touching the office label. Final labels separate the Played caption toward its own pile, with a tested non-overlap assertion for public labels. Short landscape layouts place the full-height board on the left and the hand/controls on the right in both ordinary and tutorial play; the original stacked layout left too little board height. Actual final 844×390 draft and response overlay images were inspected, along with the 390×844 response after moving the draw pile lower-left. No claim of thousands of iterations or guaranteed player preference is made. The complete Main release suite was not run; this is a Prod evaluation.

Source blobs: app `cd10efae6886e7a3890a8f91c512dd06581af9d1`, scene `b4b6f02aa0b78b1771953968151630891bf35cc1`, style `07a5f03ca82c6f97987a7197902935d8e0234a9a`, engine `1c8b73606425b3e57a6302d5d5a708d9ee74f8a3`. Build publication is verified separately against the deployed `revision.json`.

Asset generation mode and complete prompt: [Council chamber asset](COUNCIL-CHAMBER-ASSET-2026-09-18.md).
