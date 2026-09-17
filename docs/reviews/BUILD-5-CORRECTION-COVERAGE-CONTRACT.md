# Build 5 correction coverage contract

17 September 2026. Documentation-only proposal for integration into the correction plan before implementation. No harness behavior is changed by this document. It supplements C01–C14 and the family-game design gate. All mechanics remain open to replacement; coverage must follow the selected design rather than preserve a rule merely to preserve a test.

## Fixed viewport set

These are the exact 21 CSS-pixel dimensions read from `scripts/core-layout.ts`, in its current order. They are regression surfaces, not claims about device market share or actual hardware certification.

| ID | Width | Height |
|---|---:|---:|
| V01 | 1280 | 720 |
| V02 | 1366 | 768 |
| V03 | 1440 | 900 |
| V04 | 1920 | 1080 |
| V05 | 2560 | 1440 |
| V06 | 3840 | 2160 |
| V07 | 360 | 800 |
| V08 | 375 | 667 |
| V09 | 390 | 844 |
| V10 | 393 | 852 |
| V11 | 412 | 915 |
| V12 | 430 | 932 |
| V13 | 844 | 390 |
| V14 | 768 | 1024 |
| V15 | 1024 | 768 |
| V16 | 1536 | 864 |
| V17 | 1366 | 1366 |
| V18 | 414 | 896 |
| V19 | 393 | 873 |
| V20 | 384 | 832 |
| V21 | 360 | 780 |

Every ordinary required state below is crossed with all 21 viewports. Supplemental accessibility, loading and session sequences have explicit profiles below; they do not substitute for the base matrix.

## Finite inventory and denominator

Before a candidate is implemented, freeze a versioned inventory containing one row per required state/profile/viewport. Rows cannot be discovered only when screenshots happen to succeed. The normative inventory and its hash are inputs to the run; the runner cannot shrink them after a failure.

The candidate's final action names, tutorial steps, result types and modal names must be expanded into literal IDs before the planning freeze. Enumerations below define those expansions. A symbolic `every action` row is a planning obligation, not a completed finite manifest. Store the expanded list and its exact count with the plan; every row links to a task and acceptance criterion. Combinations that cannot legally exist need an explicit design decision and reason before freeze. They remain in the applicability record, not disguised as tests that passed.

The previous candidate captured 2,228 images across 21 viewports. That is not 21 complete sets of 112: two narrow tutorial runs failed early. Preserve those failures and missing later rows. The correction inventory may exceed the old 112 states because the earlier set did not cover every ordinary outgoing action.

### Universal product states

These obligations apply regardless of which mechanics the panel selects. Conditional language refers to a feature being present in the final design, not permission to omit its review.

| Family | Literal expansion required before freeze | Required evidence |
|---|---|---|
| U01 Entry | Opening settled; opening keyboard focus; learning introduction top; introduction deliberate scroll endpoint | Logo/card composition; legibility; usable next action; no blank flash. |
| U02 Setup | Defaults; each supported player count; each selectable Dynasty; longest supported name; valid input ready; invalid input; import error categories; cancel; begin | Fields, labels, selected values and errors readable; no silent state loss; navigation uses real controls. |
| U03 Teaching | For each final curriculum step: explanation, selected object if applicable, action preview if applicable, legal action result, next cursor; each rival step before action and after result; exit/reentry; completed reflection | One permitted next interaction; taught origin, target and result visible; Continue changes curriculum only. No paragraph is accepted as a clarity fix. |
| U04 Ordinary turn | For each final legal action: available, object selected, target selected, preview, cancel, confirmed result; forced/no-action opportunity | Each actual stage is a distinct row. If the final interface omits a stage, its omission is documented at freeze. Options and uncertainty must be understandable at play scale. |
| U05 Responses | For each final response type: incoming announcement, each legal answer selected, preview, cancel, result; no legal answer; handoff before/after if used | Source, threatened object, available resource and consequence together; no hidden-hand leak. |
| U06 Public board | Each supported seat count with sparse Court, second row occupied, maximum conserved Court distribution, maximum conserved public pile; each seat focused and overview | Tangible components remain in intended board regions; names/ranks/roles and relationships uncorrupted; every public identity reachable. |
| U07 Private hand | Empty, one, two, overflowing hand, maximum conserved hand; first/middle/last scrolled positions; selected last card | Scroll affordance, usable card/Inspect targets, private identities hidden during handoff. |
| U08 Camera | Overview, each seat focus, user pan endpoints and reset for sparse and dense boards | Operative objects remain discoverable; no misleading role associations or clipped labels. Actual sequence complements settled screenshots. |
| U09 Information | Each menu, rule aid, card inspector, public history/knowledge view present in the final product; top and intentional scroll endpoint | Reference agrees with active rules; public memory distinguished from unknown cards; opening details never needed to rescue unclear ordinary play. |
| U10 Session | Private handoff for every supported recipient position; save/export acknowledgement; resumed ordinary state; resumed pending response; denied storage recovery | No flash of another player's hand; values/state preserved; concise actionable recovery. |
| U11 Terminal | Every final result type, each winner position, no-winner result if supported, restart/setup and replay entry | Result and next-session action visible; no To act or future-turn instructions after ending. |
| U12 Faults | Initial asset loading, failed asset, retry, invalid save, unsupported/newer save, partial save, storage denied | Dark stable surface, readable recovery, existing valid state preserved; raw implementation errors excluded from primary copy. |

### Conditional current-rule states

These are required if the relevant rule survives the panel. Each removed or replaced mechanic receives a decision record and replacement scenario mapping before implementation. They are not a mandate to keep succession, rounds, ranks, suits or any other rule.

| Family | Required state distinctions |
|---|---|
| R01 Recruit | Native/foreign eligibility, lowest/highest operative rank, selected card removed from hand, resulting Court placement. |
| R02 Crown/succession | Native notice and reign; foreign notice and reign; failed notice and failed reign; successful ordinary win; multiple attempt markers; former ruler's continuing role. |
| R03 Marriage | Same/adjacent rank, nonmatching rejection, A/K boundary, Queen role versus Q rank, visible link, spouse/supporter removal and broken claim. |
| R04 Recall | Own outbound target selection and rival incoming threat; higher/equal/lower defense boundaries; Ace versus J/Q/K and numeric; defended and undefended ruler/supporter/spouse; exchanged ownership, public pile and next-round return. |
| R05 Trade | Outbound offer/request chooser, accepted/declined/cancelled, exact public comparison; unknown nonempty versus known empty hand; immediate lower-native deployment if retained; per-recipient limit; public knowledge after each result. |
| R06 Rounds/circulation | Consecutive Pass boundary, intervening action reset, last card drawn, empty deck, returned pile, maximum pile, 12-round terminal if retained. |
| R07 Hidden knowledge | Newly public offer, declined offer, known card transferred, returned public card, private draw, obsolete ownership record; unknown-card count distinct from remembered identities. |
| R08 Alternative rules | Every selected new rule gets the same available/selected/preview/cancel/result/boundary expansion as U04/U05, plus a visible goal example. Eudoxia or another clock, if chosen, needs warning, response, advance and terminal states; no-clock is a legitimate comparison. |

State fixtures must conserve the actual deck and use supported public import/test entry points. Test fixtures are labeled; they are never presented as blind-play evidence. Unit boundary tests accompany visual cases but cannot replace them.

## Supplemental profiles and same-session sequences

1. **Keyboard and rotation:** For every base viewport, open the existing setup once, type a long supported name, retain the same page/dialog/session, focus the caret, then reduce the available height to simulate a keyboard. Record before/during/restored dimensions. Focused field, label and caret must remain comfortably visible; use real wheel/Tab to reach submission and Close where deliberate form scrolling is required. Restore size, then rotate to the swapped dimensions and back without navigation. Confirm identical entered value, focus where appropriate, and successful submission. Swapped and keyboard dimensions are supplemental profiles, not additions masquerading as the fixed 21 baseline sizes. Reloading to a fresh dialog invalidates persistence evidence.
2. **Safe areas:** Apply declared synthetic top/right/bottom/left inset profiles to opening, introduction, active action, response, setup and terminal at every base viewport. Record all four values and usable area. Fully visible required labels, focus rings and touch targets must clear these insets and overlays. Synthetic insets cannot certify real cutouts.
3. **Input/accessibility:** At each base viewport, run keyboard-only entry, setup, one complete action, response, inspector exit and terminal restart; run touch-equivalent card selection/hold/scroll. Repeat active action/response, setup and terminal at 200% browser zoom, recording actual CSS viewport and device scale rather than assuming screenshot dimensions prove zoom. Verify intentional scroll surfaces with real input, never force clicks.
4. **Motion:** For every action/response and taught rival action, capture settled before/after and retain a short transition recording under normal and reduced motion. At least sparse/dense overview and each seat focus repeat across all base viewports. Inspect actual animation for causal clarity; a screenshot pair alone cannot certify it.
5. **Loading/session faults:** At V01, V07, V09, V13 and V06, run cold/warm load, slow/failing art retry, navigation during pending load, and reload during a pending response. Record timing and completion identity. New failures expand the affected-size task before fixes; these representative fault profiles do not claim exhaustive hardware coverage.

Physical iOS/Android cutouts, actual browser chrome, OS keyboard occlusion, pointer ergonomics and text at real viewing distance remain explicitly **unverified** unless tested on actual devices and recorded with device/OS/browser identity. Browser emulation and proxy agents cannot certify family comprehension or device comfort.

## Evidence join schema

Keep immutable records joined by IDs; a screenshot filename is not an acceptance result.

| Record | Required fields |
|---|---|
| Inventory | schemaVersion, inventoryId, inventoryHash, planRevision, ruleDecisionIds, literal requirementId, stateId, viewportId, profileId, required/applicability decision, taskId, acceptanceCriterionId. |
| Candidate | candidateId, sourceCommit, sourceDirty flag and diff/hash if dirty, lockfileHash, build command/config, buildNumber, built artifact hashes, source-art manifest hash. |
| Served build | deployment URL, observedAt, served revision/build marker, entry HTML hash, loaded JS/CSS and relevant asset URLs plus hashes, service-worker/cache state where applicable. Source SHA alone does not identify a dirty rebuild or cached deployment. |
| Execution | runId, candidateId, inventoryHash, requirementId, attemptId, sessionId, browser/version/channel, OS, headless flag, viewport CSS width/height, screenshot pixel dimensions, deviceScaleFactor, zoom, motion, input mode, safe insets, keyboard profile, action trace, fixture provenance. |
| Automated result | executionId, status passed/failed/missing/not-run, assertion IDs and outcomes, failure text, console/network errors, screenshot/recording paths and hashes, timestamps. Do not collapse partial execution into pass. |
| Visual opening | executionId, screenshotHash, reviewerId, openedAt, tool, original dimensions, displayed dimensions, native/downscaled/crop mode, crop rectangle if used, observations, defect IDs, verdict passed/failed/limited. Every actual opening is recorded; generated images begin uninspected. |
| Acceptance join | requirementId, selected executionId, automatic verdict, all needed visual opening IDs, visual verdict, missing evidence, defect disposition, final accepted/rejected/pending. Any mismatch of candidate/assets/inventory leaves pending or rejected. |

The final denominator is the frozen required inventory, not captured count, test count, or inspected count. Report separately: required rows, executed rows, automatically passed rows, captured rows, actually opened rows, visually failed rows, missing rows, and accepted rows. A failed attempt remains immutable when a later attempt succeeds. A screenshot generated after a fix cannot inherit the old review verdict.

Native-size review is required for operative names, ranks, suit marks and action text. A downscaled 4K image can support composition findings but cannot alone approve small text. Open the original or explicit native-pixel crops covering every relevant region and retain the crop coordinates/hash. Contact sheets are navigation aids, not proof of reading each image. If tool display limits prevent adequate inspection, verdict is limited and the missing native evidence remains open.

## Integration tasks and acceptance tests

These are proposed additions to C01/C05/C06/C12/C14. They must be integrated and frozen before harness or product implementation.

| ID | Task | Must-pass tests |
|---|---|---|
| CV01 | Expand and freeze inventory after rule decisions. | Exactly the 21 baseline dimensions above; literal IDs unique; every final action/response/tutorial step/result maps to rows; conditional removals have explicit decisions and replacement mapping; expected row count and hash stored before run. |
| CV02 | Join capture and review evidence. | Missing screenshot produces missing row; early tutorial failure leaves all later required rows in denominator; duplicate capture cannot inflate coverage; uninspected or downscaled-only operative text cannot pass; failed visual verdict blocks final acceptance despite automatic pass. |
| CV03 | Bind every result to served candidate. | Deliberately mismatched source/served SHA, JS hash, screenshot hash or inventory hash rejects join; cached old bundle cannot inherit a new build's approval; dirty candidate is explicitly identified; successful matching join still requires actual review. |
| CV04 | Replace fake keyboard persistence evidence. | Same session/page/dialog ID before/during/after; exact typed value survives keyboard resize and rotation; focused input/label/caret visible; real Tab/wheel reaches submit; deliberate reload fails the persistence test rather than resetting expected value. |
| CV05 | Expand ordinary interaction and public-state coverage. | Each U/R row selected by the normative design has a legal conserved fixture or real action path; source/target/result visible; all public pile identities inspectable; privately drawn identity absent from other seats' public views; ordinary win and loss covered separately from tutorial win. |
| CV06 | Verify review scale and immutable reruns. | Native/crop evidence required for rank/text acceptance; crop coordinates lie within hashed original; retry creates new attempt; previous failure survives; report cannot mark generated images inspected automatically; review ledger references actual opening records. |
| CV07 | Close release honestly. | Required inventory has no missing, rejected or limited rows for claimed scope; every failed release check has repaired applicable coverage and rerun; hardware/family studies remain labeled unverified if absent; deployment verification identifies exact served candidate; no claim of complete coverage from captures alone. |

All acceptance above concerns evidence quality as well as implementation. A passing gate does not guarantee enjoyment; the separate screen-only cohort and family-game design review must still challenge whether choices are understandable and worth making.
