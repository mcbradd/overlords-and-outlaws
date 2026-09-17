# Build 5 reference component amendment — I13

Written before reference compositor implementation, 17 September 2026. Authority: parent request to finish I13 using readable physical aids if a complete ruleset cannot fit a person card. Scope: face/scene implementation and review documents only. No rule change.

## Decision

A 63×88 mm prototype composed at 630×880 pixels needs at least 31.75 canvas pixels to represent 9pt type. At a 315px on-screen width that becomes 15.875 CSS pixels. Use a minimum operative body size of **32px**, with generous 41px leading, and no automatic font shrinking.

The complete core has too many procedures to fit beside a readable portrait/name at that size. Provide:

1. The existing collectible play face.
2. A distinct character reference face, same 63:88 size, with smaller portrait, full name/suit/rank/role, explicit ability index, and a statement that the shared rule aids supply complete procedures. This is an index face, not a pretended full rulebook.
3. Eight shared 63:88 rule-aid cards covering Recruit, Recall, Defend, Trade, native succession, marriage succession, rounds, and setup/public information. Each aid uses full operative instructions for its procedure, including the approved successful Recall exchange. Cross-references identify the few multi-card procedures explicitly.

This is a card-plus-rule-aid physical reference set. It replaces the current reference option merely enlarging the reminder face. The app must expose the shared aids in inspection/rules; they are not added as eight distracting objects to the first tutorial table. No tutorial rules change.

## Tasks and tests (before implementation)

| Task | Acceptance criteria |
|---|---|
| RF01 Freeze exact aid text and reference fields | All retained verbs, successful/defended Recall ownership, response ranks, Trade refusal/limits, Crown dependencies/timing, marriage support, round/deck/cap and chosen-suit setup covered; no retired seal/History vocabulary. Review against current normative rules. |
| RF02 Compose character index face | Exactly 630×880; full portrait aperture, distinct readable name/suit/rank/role; operative index text ≥32px; no clipping; declares use of shared aids rather than implying complete per-card rules. Preserve originals and normal face layout. |
| RF03 Compose shared aids | Exactly 630×880, rounded consistent silhouette, body ≥32px and left-aligned; all authored lines fit within measured printable bounds. Overflow throws a specific error rather than shrinking/clipping type. Each aid independently identifies its topic and referenced aid. |
| RF04 Runtime/reference API | `faceHTML(id,{reference:true})` uses the distinct preloaded reference image. Export shared aid markup/data/canvas API for parent rules/inspector integration. Full textual alternative includes each aid’s exact instruction. Normal hand/board API remains unchanged. |
| RF05 Actual visual audit | Open every new character reference face in readable 13-card proof sheets, plus every shared aid at actual315px width and enlarged630px. Read titles, line endings, paragraph gaps, last line and portrait crop. Typography metrics supplement this inspection. |
| RF06 Integration and Crown status | Confirm obsolete projected Crown status is absent from scene source, recapture actual current opening and open it. TypeScript passes. Parent confirms shared aid visibility in the actual app; no completion claim based only on exported functions. |

## Exact content baseline

Aid text will be authored directly from the frozen normative core without new numerical rules. If measured text exceeds the fixed body region, divide the procedure into another explicitly numbered aid before accepting the compositor. Do not abbreviate away an exception or shrink text below32px to force a page count. Any extra page is recorded here with its reason before acceptance.

### RF01 authored procedure text, frozen before compositor change

1. **Recruit.** Play a card of your Dynasty from hand into your Court. If you have no supported ruler, it becomes your ruler. Otherwise it is a supporter. A Court card cannot use hand abilities. Rank stays printed; a higher number grants no extra office. Playing removes this card from hand. Played cards cannot act and return to that area's owner next round. A captured card belongs to its new owner.
2. **Recall.** Play a hand card to Recall a rival Court person of the same printed Dynasty. Each rival may try each target once per round. Their controller gets one answer: Defend (aid 3) or let it happen. If undefended, exchange your lead for the target. Target goes to your Played; lead goes to their Played. Both return to their new owners next round. Resolve lost offices and marriage support immediately. An interrupted Crown does not resume.
3. **Defend.** Only the target's controller answers a Recall. Use a hand card matching the lead's Dynasty and strictly higher rank. Ace also answers J, Q or K. It cannot answer 2–10. Any 2–K answers Ace. Equal rank never answers. Lead goes to attacker's Played; answer goes to defender's Played. Target stays in Court. Both cards return next round. One answer only; no counter-answer. Declining gives you the attacking lead in exchange for the target (aid 2).
4. **Trade.** Offer a hand card to one rival and request an exact Dynasty/rank. Declare whether the received card will Recruit. One offer per recipient each round. They may decline without proving they have it. Keep your offer; this counts as Pass. On acceptance, both cards go to new owners' Played. A declared Recruit instead puts your received native card in Court only if lower than your offer. With no ruler, it becomes ruler. This never claims the Crown. You cannot retract an accepted offer.
5. **Name heir.** With vacant Crown, choose a supported ruler and a different native supporter already in your Court. Play a further native hand card as heir; all three must differ. Crown goes to old ruler. Keep all three until next start, then move Crown and ruler office to heir. Keep the new ruler and original supporter for that entire round to win at its end. Old ruler is no longer required. Losing a required person immediately ends the claim. Replacing them never restores it; a new attempt needs a new qualifying heir.
6. **Marriage heir.** With vacant Crown, a native ruler and a different unpaired native Queen already in Court, play a foreign heir equal or adjacent to the Queen's rank. A and K are not adjacent. Queen becomes supporter. Link the pair; follow aid 5's Crown clock. Either partner leaving breaks the pair. Capture sends that person to the captor's Played. If Queen leaves, an unsupported foreign spouse goes to its controller's Played and loses any office. The claim fails. Queen is a role, separate from rank Q.
7. **Round rhythm.** One card action or Pass per turn, clockwise. A legal action resets consecutive passes. Passing preserves later turns if play continues. N consecutive passes end the round; finish any pending answer first. At end: check Crown, then award a full successor reign. Otherwise round 12 ends in an Unsettled Crown draw. Next start: rotate first player; return Played; deal one card per seat starting there; transfer intact Crown; clear attempt/offer marks. Empty deck gives no draw. No reshuffle or hand limit.
8. **Set the table.** Choose 2–4 different Dynasties. Use only their thirteen-card suits. Put each native Founder in Court as ruler. Shuffle the rest; deal two private cards each, clockwise. A=1; J=11; Q=12; K=13. Rank is game allocation, not historical importance. Suit never changes with ownership or marriage. Courts, Played, Crown, marriage links, attempt and offer marks are public. Opponents' hand counts are public; unplayed identities stay private. Publicly revealed identities may be remembered.

Text is split into paragraphs in the actual aid. “N” on aid 7 will be printed as “one pass per player” or defined as the number of players to avoid an unexplained algebraic symbol. This wording clarification does not change the all-pass rule.

### RF03 measured layout refinement (before corrective code)

The first fixed-size composition correctly rejected Trade, Name heir, Marriage heir and Round rhythm: last baselines reached836–850px versus the initial831px text bound. Body remains32px with41px leading. Reclaim16px of excess title-to-body gap (first baseline177 instead of193) and use a last-baseline bound840, still19px inside the inner bottom cut-safe line with glyph descenders accounted for in visual review. This adds no compression of font or line leading and preserves all frozen text. If the actual visual proof is cramped or any page still exceeds840, split the aid rather than reduce text size.

### RF03 continuation-face amendment (before split implementation)

The expanded bounds still reject later Trade lines at875px; the first overflow was not the final line. Reject the whitespace-only cure. Preserve all frozen text and32px body. Split four longer topics into two explicitly labeled faces:4a/4b Trade,5a/5b Name heir,6a/6b Marriage heir,7a/7b Round rhythm. The eight topic numbers remain stable for cross-references; the set now has12 printed faces and may be manufactured as eight aids with four double-sided topics. The first face explicitly says to continue on its matching b face. Restore generous first-body baseline193 and last-baseline831. Test all12 faces individually and as complete topic pairs. Reference index correctly continues to refer to topics1–8; it does not mislabel12 faces as12 unrelated procedures.

### RF05 portrait correction (before revision)

Opened all52 reference images. The first wide, shallow portrait band crops several people through the lower face. Reject that crop. Replace it with a narrower right-hand portrait aperture beside a clearly labeled reference-index header; retain full width for the name and operative index below. This preserves the complete head at the same fixed reference dimensions, without editing source art or reducing body type. Reinspect all52 revised reference faces.

### RF01 final copy clarification (before edit)

Split the Recruit aid sentence into 'Played cards cannot act. They return to that area''s owner next round.' This removes an unintended grammatical reading that Played cards cannot return, without changing the frozen rule. Recheck the rendered aid at315px after this copy edit.


## Executed component verification

Final TypeScript check passed (`npx tsc --noEmit --pretty false`). Rendered and actually opened every one of the52 corrected character reference faces at315px in `artifacts/core-reference-{alba,plantagenet,tudor,habsburg}-final.png`. Full names, role/rank, portrait heads and all index lines remain within the fixed rounded face. The rejected wide-band portrait proof is not the accepted revision.

Rendered and actually opened all12 rule faces at315px (`artifacts/core-reference-aids-315.png`) and630px (`artifacts/core-reference-aids-630-1.png`, `-2.png`, `-3.png`). Read each face and its continuation as a complete procedure; all body text is32px canonical (16px at315px), left aligned, with no font shrinking or truncation. The final Recruit copy clarification was separately re-opened at315px in `artifacts/core-reference-recruit-final.png` and included in the630px proofs. Paragraph endings and bottom clearance pass visual review. At63mm physical width,32px canonical text is approximately9.07pt; this is a geometric proof-size check, not an actual manufactured-print inspection.

Rendered and actually opened `artifacts/core-scene-crown-label-removed.png` at1250×316: no obsolete Crown status projects over Henry II's portrait. The physical Crown component remains.

Component exports ready for integration: `faceHTML(id,{reference:true})`, `cardCanvas(id,true)`, `referenceAidsHTML()`, `referenceAidCanvas(zeroBasedIndex)`, `RULE_AIDS`, and `REFERENCE_BODY_PX`. Stable physical aid labels are1,2,3,4a,4b,5a,5b,6a,6b,7a,7b,8. `preloadCards` loads reference variants and all rule aids. Parent owns app integration and must verify the actual rules/inspection flow before closing RF06. These component proofs do not certify the entire application viewport matrix, real printer output, or blind playtest.

### RF01 operative completeness clarification before copy edit

Trade4a must require a recipient with at least one card, matching the public empty-hand legality amendment. Round7a must distinguish completed card plays from refused offers: print 'Completed card plays reset consecutive passes; a declined Trade counts as Pass.' Preserve the existing one-action/Pass and pending-response sequence. Re-render and actually open4a and7a at315px; if either overflows32px text, split or rephrase without losing any operative rule.

Final operative completeness edits were rendered and actually opened at315px in `artifacts/core/experience-revision3/aid-copy-final.png`:4a now requires a rival with at least onecard;7a distinguishes completedplays resettingpasses from declinedTrade countingPass. Both fit at32px with complete final lines. No additional aids or rulechanges were needed.
