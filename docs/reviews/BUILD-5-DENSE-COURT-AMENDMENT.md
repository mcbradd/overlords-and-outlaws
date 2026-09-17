# Build 5 dense Court correction: pre-implementation task/test amendment

Stable audit target: `dist/assets/app-DXK5LsTm.js` (written2026-09-17 11:03:49 local). Source face write11:03:34 and scene write10:50:53 preceded it. Authored fixture review, not blind play. Actual application captures are under `artifacts/core/experience-revision2`; all26 PNGs were opened. Opening, reference and rules are legible. Dense four Courts fail: a narrow vertical whole-board strip, then first-row-only focus without explicit traversal; parent camera nav overlaps Court name. Mobile fallback shows only portrait tops beneath overlapping navigation. Fallback omits explicit marriage pair and previous-attempt facts. The48-card hand fits horizontally with a clipped-next-card cue, but last-card keyboard traversal still needs exercise. Incoming Recall mobile guide reaches bottom edge; parent full viewport gate owns that layout.

## Frozen correction scope and acceptance tests

| Task | Tests required before acceptance |
|---|---|
| D01 Broad physical board | Choose Court columns using public Court size and host aspect rather than fixed3columns. Every Court/Played ID remains rendered exactly once. Dense13×4 whole board has a broad layout with visibly separated family groups at1440×900 and390×844; no tall narrow strip. Sparse opening, Recall arrow, marriage link and Crown placement retain proper physical positions. |
| D02 Explicit focused traversal | Court focus uses real camera bounds on a group of up to3 cards desktop and1 mobile. Add visible Previous, Next, exact group range/total and overview return controls; first/last disable boundaries correctly. Native keyboard activation and touch work; traverse every group to13thcard and back, open first/last actual card inspector. No hidden IDs dropped fromscene. Focused mobile may increase reserved board region to360px and allow ordinary document scroll; tutorial never expands or exposes controls. Keep existing seatnav in a separately reserved48px upper region, paging controls in44px lower region, card body and office between them. |
| D03 Semantic fallback equivalent public facts | Fallback gives explicit named marriage pairs, Crown office facts, and named per-attacker Recall attempt facts, alongside handcounts/deckcount/Played ownership. Existing family focus scrolls to that section. Host provides visible scroll guidance and full keyboard/touch scrolling. Last Court card and named marriage link are reachable at bothviewports. Reserve nav space; do not leave firstportrait partly clipped undercontrols. |
| D04 Regression and exact evidence | Before acceptance, run TypeScript and capture/open corrected denseoverview, first/last focused group, sparseopening, incoming Recall, marriage and forcedfallback atboth sizes. Exercise48thhandcard keyboardfocus on unchangedhand. No tutorial extra enabledinteraction, all legal action origins/destinations maintained. Record actual browser origin and revision; dev correction evidence does not substitute for rebuilt exactcandidate release audit. |

No rule, engine, app or general stylesheet edits. Scene-owned selectors may reserve focused board height within the existing parent layout; this is a view affordance outside the lesson. Assets and original art remain unchanged. Corrections start only after this task/test amendment.

### D01 reserved host correction before stylesheet change

The desktop grid allocates more height than the existing44vh board wrapper consumes, leaving a178px dead strip. Let the scene wrapper fill its allocated grid row for ordinary tables; retain explicit expanded focus/fallback height and the tutorial's existing compact contract. Reopen sparse and dense desktop states to verify no deadgap, and keep the table-edge hand/guide after the reserved board rather than overlaid.

### D03 fallback scroll-region refinement before revision

The first corrected fallback makes the lastcard reachable, but scrolling moves its content behind the stationary family navigation. Reserve navigation above a dedicated inner scroll region rather than adding only padding inside a scrollinghost. Native keyboard focus and ordinary scroll must keep focusedcard faces below navigation. Reopen finalcard and namedmarriage at both sizes.

## D01–D04 executed correction evidence

TypeScript passes. `artifacts/core/experience-revision3/final-audit.ts` completed on the actual development application atlocalhost:5188, at1440×900 and390×844; all24 final-manifest PNGs were actually opened.52 publiccards remain attached. The denseoverview is broad with four distinct Court groups. Explicit Next was activated by keyboard through the finalgroup, and the first/last Alba card inspectors opened and matched Kenneth MacAlpin/Robert II. An initial audit assertion mistook historical source ID alba-12 (Constantine II) for rank13; the fixture expectation was corrected to alba-9. Product IDs were unchanged.

Focused mode reserves real boardspace and Previous/Next/range/Whole table controls. Neighboring physicalcards can be partly visible at cameraedges; the focusedgroup itself is whole and inspectable. Final first/last capturedfiles demonstrate this. The ordinary action guide is allowed below the phone viewport only after deliberate Court focus. `exit-check.ts` clicked/tapped Next, exited to Whole table, asserted focusclass/pagerremoved and the ordinary Pass control restored inviewport atboth sizes. It entered the lesson and asserted no expandedfocus/pager, then captured/opened both tutorial screens and both exit screens.

Forced WebGL failure now has a dedicated scrollregion beneath stationary navigation. Both finalcard and chosenfamily were reached; explicit named marriage pair and per-attacker attempt facts were captured/opened. Longer fallbackfacts can require ordinary inner scrolling; no publiccards or facts are omitted. The fallback deliberately trades the unavailable3D presentation for a usable semantic rendition and is not the standard presentation.

The untouched48-card hand was traversed by94 native Tab presses from its first selection; Charles V, the48thcard, was inviewport with visible focus atbothsizes. Both `48th-hand-keyboard.png` proofs were opened. Incoming Recall arrow, marriage link, Crown, sparseopening and public Played retained their visible physical relationships. Some global overview text is intentionally small; Court focus/inspection exposes full detail. This is knowledgeable authored-fixture QA, not blindplay.

The final D proofs are development-source evidence after stable app-DXK5LsTm.js. Parent must rebuild and recheck the exact release candidate, particularly its independently edited shortlandscape layout. No Prod publication or full release-suite claim is made here.

### D04 observed hover correction before CSS edit

The final exit-focus desktop screenshot exposes a global button-hover style covering one underlying physical portrait when the pointer lands on its CSS3D hit surface. Override only the scene hit button's hover background with the existing near-transparent highlight so the physical face remains visible. Recapture the same pointer/exit scenario; do not change other app buttons.

The hover correction was recaptured in the same exit-focus scenario and actually opened: Alexander III's portrait remains visible beneath the highlight. Final TypeScript passes. Scene/face source ready for parent candidate build; no further changes pending in this bounded correction.
