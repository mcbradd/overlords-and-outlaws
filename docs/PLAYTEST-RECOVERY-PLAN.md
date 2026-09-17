# Playtest recovery plan: make the game readable, then prove its choices

**Owner:** the implementation team working on `prod`.

**Source:** the creator's September 16, 2026 narrated History Engine playtest and direct instruction to iterate on the game.

**Status:** actionable revision plan with local repair passes and retained evidence. Unperformed acceptance work remains open.

**Success:** a person can understand the table, make informed tactical decisions, follow rival actions, anticipate the ending and want to play again.

## 1. The problem to solve

The creator abandoned the tutorial during Inheritance because the interface obscured the hand, displaced the real controls, demanded repeated acknowledgments and failed to explain the visible state. The landing cards also failed basic composition and material consistency. This is an observed product failure, regardless of earlier passing software checks.

The transcript does not establish whether the underlying game is strategically good or bad: it prevented the player from reaching that question. Repair the interface enough to make the rules honestly playable; then investigate tactical quality and pacing using real decisions. Neither attractive screenshots nor completed automated matches establish that the game is fun.

The aspiration is exceptional craft. Completion must be demonstrated through observed behavior, actual visual inspection and human play, rather than a promise of flawless quality or guaranteed player preference. A defect discovered after a gate reopens that gate.

## 2. Authority and boundaries

- Preserve the physical, manufacturable card-and-board game. The browser presents the same legal game on a tangible three-dimensional table.
- Read [physical direction](PHYSICAL-GAME-DIRECTION.md), [the earlier comprehension review](PLAY-SESSION-02-REVIEW.md), [guided play](GUIDED-PLAY.md), [designer intent](knowledge-base/designer-intent.md) and [current rules](RULES.md) before the corresponding work.
- This transcript overrides older permission for scrolling hands, scrolling guide panels and required opponent acknowledgments. No gameplay scrollbar, hidden offscreen hand or scrolling lesson is acceptable in this revision.
- The ten-chapter tutorial teaches one person against computer rivals. Local multiplayer retains separate privacy behavior; its handoff screen does not belong in the solo lesson.
- Manufacturing/reference cards retain 63:88 geometry and complete operative rules. Simplified playing faces retain identity, portrait, role and relevant current state, with full inspection. Do not reintroduce legacy combat statistics into v4, which does not use them.
- Preserve original source art. Historical identity, sourced history and counterfactual game relationships remain distinguishable.
- Preserve deterministic rules, information-set privacy, legal action validation, keyboard/touch access, orientation, marriage links and inspectable components.
- Work on `prod` or a feature branch targeting `prod`. Follow [RELEASE.md](RELEASE.md); this request does not authorize promotion to Main.
- The creator's follow-up establishes delivery on the Prod site: publish each completed game change, wait for deployment, verify its source/build identity and real interaction, and return the testable URL. A local-only report does not count as delivery.
- Existing user edits and planning records are not cleanup targets. This document adds a plan without rewriting their history.

## 3. Confirmed baseline, before the repairs in this plan

These observations come from the transcript and source/evidence inspection. Capture and retain the exact source SHA plus dirty-diff identity when saving a visual baseline: an old commit SHA alone cannot identify uncommitted work.

| Finding | Evidence | What it establishes |
|---|---|---|
| Landing frames, portraits and names fail composition | Creator's narrated landing-page inspection; separate HTML and Canvas face paths in `src/history-engine/face.ts` | A shared card layout and actual optical review are necessary |
| Solo tutorial opens a private handoff | `app.ts` curtain rendering and teaching startup | Multiplayer ceremony is incorrectly imposed on the single player |
| Tutorial replaces normal interaction | `app.ts` guide-card selectors and lesson-action controls | Completing the lesson does not demonstrate learning normal controls |
| 59 does not describe the interaction burden | Tutorial audit: 59 legal micro-actions, 58 required Continues, 25 card-selection activations | **142 required in-game inputs**, excluding title/curtain entry; 23 commitments are human and 36 are rival actions |
| Hand, guide and controls require scrolling or leave the viewport | Executed baseline probe: desktop 1440×900 document height 1032, hand bottom 1014; landscape 844×390 hand begins at y592; 667×320 document height 1983 | Hiding scrollbars cannot repair the layout |
| Landscape receives inadequate distinct treatment | Width-based layout retains desktop assumptions at 844×390; existing landscape walkthrough covers settlement rather than the complete opening | Short landscape must be a first-class composition |
| Card faces and bodies do not share material response | Lit scene bodies with unlit CSS3D fronts; unlit board-image material in `scene.ts` | Matching scene lighting and contact are separate from merely adding thickness |
| Readiness orientation is weak | Scene audit finds a 7-degree card rotation | Restore the meaningful quarter-turn rather than decorative tilt |
| Generic explanations can misstate dependencies | `learning.ts` says losing one listed required Noble breaks a claim, while Alba legally retains either named candidate | Explanations must use the actual Law predicate |
| Final Pass omits important known consequences | `preview.ts` mentions round end and Crises; the engine can also settle a Crown, unveil covers and run start effects | Build one truthful consequence/deadline model |

### What the existing simulations actually show

The existing ignored `artifacts/history/simulation.json` records 132 complete games using the shipping deterministic heuristic over eleven module combinations and twelve seeds per combination. Aggregation during this audit found:

| Seats | Games | Ended in round 2 | Mean ending round | Eudoxia outcomes | Barter initiations |
|---:|---:|---:|---:|---:|---:|
| 2 | 72 | 47 | 2.597 | 2 | 0 |
| 3 | 48 | 29 | 2.708 | 1 | 0 |
| 4 | 12 | 10 | 2.583 | 1 | 0 |

Across all 132 games, 86 ended in round 2 (65.2%), 116 by round 3 (87.9%), 25 used Veil, and none initiated Barter. The aggregate contains 651 Claims and 215 Proclamations. The previously reported 128 player settlements and four Eudoxia outcomes therefore conceal a fast claim race and no negotiation exercise.

These are summaries of an existing artifact, not fresh human playtests or a new simulation run. Action counts include setup and procedural decisions; round counts cannot be converted into minutes. The artifact should be copied with its provenance before a later simulation overwrites it.

The heuristic in `ai.ts` strongly values immediate Proclamation and rates Barter below ordinary drawing or building. It always rates an available Counterclaim highly. This limits what the result can tell us about bargaining, calculated refusal and reservation decisions; it does not prove those choices lack value.

The separate [restricted clock study](research/HISTORY-ENGINE-PACING-ANALYSIS.md) uses 180,000 samples with inert Interregna, no Crown play and simplified cooperative Veil policies. Mean unprotected Eudoxia loss rounds are 7.781/7.327/7.016 for 2/3/4 seats. Its four-seat/no-Veil sample includes two losses by round 2 out of 20,000 decks. Its policies assume an affordable spare seal and Outlaw, and omit The Open Record's additional draws. It establishes a possible early ending tail and limited delay under those assumptions; it establishes neither full-game balance nor human duration.

## 4. Trace every playtest complaint to a deliverable

| Transcript issue | Required response | Work package / evidence |
|---|---|---|
| Cannot identify which build is running | Bottom-left build identifier, starting at 1; stable association with each pushed candidate | WP0; built-asset/revision check |
| Unrelated changes damage cards | Shared card geometry and narrow rendering/interaction boundaries | WP1; all-context face regression |
| Portrait/frame misalignment | One composed face with measured field bounds and optical crop review | WP1; every-card contact sheets |
| Cards look like paper-thin pictures in a different scene | Credible stock edges, shared illumination, contact shadows and consistent camera | WP1/WP5; resting and moving closeups |
| Names wrap and move other content | One fitted name line; fixed role and reference-rule regions | WP1; longest names and every Dynasty |
| Inconsistent/redundant family labels | One information hierarchy and canonical visible terminology | WP1/WP2; card/seat/inspector review |
| Green private handoff makes no sense in solo learning | Direct solo introduction, then prepared table with named rivals | WP3; fresh-start walkthrough |
| Hand is below screen | Reserved hand area and selectable fan/spread designed for the actual usable viewport | WP2; no-scroll bounds and hit tests |
| Guide covers controls and teaches a substitute interface | One guide adjacent to the same normal action flow; exact next target highlighted | WP2/WP3; lesson-to-free-play comparison |
| 1/59 is an immediate bounce; real count is higher | Ten honest chapters with measured total inputs and fewer procedures | WP3; interaction ledger and novice completion |
| Too much unexplained information | Purpose before transition; relevant state progressively introduced | WP2/WP3; cold comprehension checks |
| Must select arbitrary prescribed people | Show reason and alternatives; accept legal decisions or clearly enter free play | WP3/WP6; alternate-choice scenarios |
| Scrollbars are unacceptable | Fit the entire active interaction in the viewport, including inspection and setup | WP2; complete viewport matrix |
| iPhone landscape/browser chrome/keyboard are ignored | Dynamic usable-height contract, safe-area spacing and keyboard-aware composition | WP2; real-device checks remain mandatory |
| Changes occur where they cannot be seen | Visible source, destination and arrival highlight; readable result | WP4; action recording and reduced-motion check |
| Lion/Rose are unexplained abstractions | Introduce rival names, emblems, location and declared Dynasty together | WP3; player can identify the actors |
| Required clicks for opponent actions | Automatic causal presentation; pause only for a human decision | WP4; zero compulsory rival acknowledgments |
| Seals are unexplained and poorly represented | Explain three actions/defenses, label exact available count, show physical spent state | WP1/WP2/WP3; reserve-versus-spend task |
| Engine choice is questioned | First isolate material/layout/performance defects in the existing renderer | WP5; benchmark evidence before migration |
| Strategic value and intrigue are impossible to assess | Reach an unaided choice, then test tradeoffs and rival plans | WP6; decision and bargaining records |
| Resolution must not suddenly end the game | Public deadlines, truthful final-Pass preview, then isolated pacing experiments | WP4/WP7; terminal-transition scenarios |

## 5. WP0 — establish a reproducible candidate and build identity

1. Record baseline revision, relevant local changes, served URL, asset manifest, browser, viewport, scale and graphics preference. Preserve opening, first interaction, dense state and short-landscape captures before editing.
2. Keep build numbering separate from the rules/save schema. Start the new visible sequence at **Build 1**. Increment for each newly pushed build candidate; rebuilding or retrying the same candidate must not quietly assign another number.
3. Show the build at the bottom left on title, tutorial, normal table and terminal screens, clear of safe areas and game targets. Pair it with the source revision in build metadata and diagnostics; keep implementation detail out of ordinary game instructions.
4. Verify the number from served built assets rather than only the dev server. Prevent two different pushed candidates from claiming the same number. Preserve the number when promoting that exact artifact.
5. Keep a compact issue ledger: reproduction, screenshot, intended behavior, changed seam, check and remaining uncertainty. Reopen the specific defect when a later change regresses it.

**Gate:** a screenshot and bug report identify the exact candidate. No deployment or Main promotion is implied by implementing the counter.

## 6. WP1 — one card composition and a coherent physical object

1. Use one fixed-coordinate compositor for all visible cards: title, private hand, table, inspector, archive and print proof. Use explicit compact/full profiles sharing identity geometry rather than unrelated CSS and Canvas implementations.
2. Keep 63:88 proportions without stretching. Allocate a single name line, portrait window, fixed role line and a bounded full-reference rules region. Reserve these fields before fitting ornament.
3. Measure rendered name width using the loaded typeface. Reduce type within a documented legibility floor; if a name still does not fit, revise the shared field/design rather than wrap, truncate or distort it.
4. Set the reference text line budget after checking all canonical clauses. Resolve overflow through layout/editorial review without removing operative text. Show complete rules through the same inspector and printable reference face.
5. Give Dynasty, historical title, Queen eligibility and current office distinct jobs. Do not repeat a family label just to fill space. A Founder title must not imply an unstated special power.
6. Design the compact exposed identity area around the actual fan direction. Every card has a distinguishable selectable part; lifting/selecting reveals its complete face without pushing the hand outside its reserved area.
7. Place the composed texture on the cardstock body under the table's light/camera. Match edge thickness, roughness, shadow softness and portrait exposure. Cards resting on the board must visibly contact it.
8. Keep semantic labels and keyboard/touch targets aligned with visible cards. Canvas is a rendering choice, not permission to lose readable accessible names or interaction.
9. Preserve genuine sideways readiness, numbered marriage pairs and live counters. Their positions must remain legible in both orientations and during motion.

**Gate:** inspect every Noble plus Law, Crisis and fragment reference face; inspect title/hand/table/inspector versions at their real sizes. Zero wrapping name lines, field displacement, hidden operative text, mismatched identity or portrait/frame intrusion. A passing rectangle test does not establish good typography or material quality.

## 7. WP2 — a viewport contract, followed across the whole interface

The composition budget is the usable browser viewport, not the monitor resolution. Use the current visual viewport and safe-area insets; respond to browser chrome expansion, rotation, zoom and onscreen keyboard changes without resizing cards into illegibility.

Desktop gives most space to the physical board with an anchored hand and stable action area at its edge. Short landscape uses a deliberate, compact arrangement of those same regions. Do not stack desktop-sized board, lesson and hand vertically. The guide receives a bounded slot and cannot cover its highlighted target.

| Region | Required behavior |
|---|---|
| Title | Clear primary entry; composed cards remain within their scene; build visible |
| Setup | Seat/module/name choices and confirmation stay visible; keyboard does not hide the edited value or submit control |
| Board | Court identities, Crown status and relevant shared threats remain represented; focusing one Court offers detail without losing turn/threat context |
| Own hand | Fan/spread stays inside its reserved bounds; selection raises within that space; new arrivals are visible and named |
| Rival hands | Concealed counts/backs only; no brief identity exposure during motion or handoff |
| Courts | All public holdings remain represented; controlled focus/spread reveals selectable people without scrolling or imposing a rules capacity |
| Action area | Current actor, cost, target, commit/cancel and reason an action is unavailable are local and visible |
| Guide | One navy/gold surface; concise instruction, preview and result; exact next real target remains uncovered |
| Crown | Current claimant, successor/dependencies and next meaningful deadline attached to the physical Crown procedure |
| History/paintings | Pending versus active status, contribution need, fragment progress and absolute cover expiry; relevant threat always visible |
| Inspector | Full face/rules with visible close/back; paged sections if necessary, without an overflowing panel or obscured control |
| Trade/forced choices | Actual selected packets/people and real decision controls fit; simultaneous/privacy semantics remain intact |
| Record/settings/archive | Deliberate pages/tabs within the viewport; returning preserves the game and selection |
| Result/recovery | Readable cause and next action; no stranded control below the screen |

Full finite holdings can exceed the space for every full face at once. Use visible overlapping cards and explicit court/hand focus or controlled spreads, as physical hands do. Every relevant target must be discoverable and reachable without scrolling; never claim that shrinking 52 faces into unreadability satisfies the requirement. No hand/Court cap is introduced to solve layout.

Acceptance checks:

- No document or gameplay panel overflow requiring scrolling in either axis; no custom scrollbar substituted for a native one. `overflow: hidden` is a clipping diagnosis until bounds and access prove otherwise.
- The current hand selection, target, guide, commit/cancel and build are contained in the usable viewport. Their visible actionable center passes hit testing and is not covered by another layer.
- Essential touch controls target at least 44×44 CSS pixels. Closely overlapped card strips also provide a focused spread with usable selection targets; do not confuse a visible pixel with an accessible control.
- Long names, large-text preference, empty hands, maximum legal holdings, two to four players and long outcome text do not change the shell's fundamental geometry.
- Keyboard focus is visible, follows sensible order and does not cause the page to scroll. Escape/cancel safely closes previews; inspection never spends a seal.
- No text entry is needed during a tactical turn. Where setup/import requires it, a shown keyboard triggers a composed edit view with the value, error and completion control visible. Dismissal restores the prior layout and focus.

**Gate:** complete the opening and actual actions with ordinary clicks/taps/keyboard at all required sizes. Never use forced clicks, `scrollIntoView`, browser zoom reduction or full-page screenshots as evidence of viewport usability.

## 8. WP3 — ten chapters that teach the real game

Start with a short solo introduction before showing the table: the win condition, the shared loss threat, the named computer rivals and what the player will do first. The introduction explains that this lesson starts from a prepared table; it is not the multiplayer setup experience.

Create that prepared position through a verified sequence of legal setup actions. Keep the complete Inheritance procedure available in ordinary new-game setup; it is not required work before a beginner sees the central contest. Do not present a prepared position as though the learner personally drafted it.

The chapter sequence below is the implemented initial shortened path. Its legal replay currently measures fifteen human commitments and 31 required in-game clicks. It removes compulsory drafting ceremony and a deliberately failed Crown detour, rather than renumbering the old 59 actions. Human comprehension and adaptive continuation remain separate gates.

| Chapter | What the player learns through normal controls | Completion evidence |
|---:|---|---|
| 1. Your family and first move | Identify Court, hand and seals, then compare a real trade offer through mutual consent | Player can identify both sides' gain and the seal cost |
| 2. Defend your family | Respond to a named rival trying to take a visible Noble | Matching card and seal are visibly committed; target remains or moves |
| 3. A marriage with consequences | Choose a native Queen and foreign spouse; see their support dependency | Matching physical pair and supported status are legible |
| 4. Let the round end | Use normal Pass; understand consecutive passes and the boundary | Player predicts the immediate known consequences |
| 5. Remove the obstacle | Contribute to the specific Crisis preventing succession | Contribution, remaining need and changed permission are visible |
| 6. Prepare two heir branches | Expose people needed by Alba while retaining concealed options | Player distinguishes either-heir continuity from an all-required arrangement |
| 7. Choose when to claim | Weigh readiness, History and a reserved defense | Player can explain why advancing now or waiting changes risk |
| 8. Keep the painting incomplete | Pay a particular person and seal to Cover before completion | Permanent loss and exact R+2 expiry are understood |
| 9. Claim with protection | Commit a legal Crown arrangement through the ordinary interface | Claimant, candidates, retained defense and next deadline are public where appropriate |
| 10. Succession and the contest | Make the lawful succession choice and follow the full contest through resolution | Player predicts the required survivor/dependency and explains the outcome |

Curriculum rules:

- Show ten chapter milestones, not every engine micro-action. Count every required user activation separately; publish the measured count in verification evidence.
- Provisional input budget: at most 45 required in-game activations after the prepared-table introduction, including selections, confirmations and chapter advances. Also report the complete title-to-finish count. If exceeded, revise the teaching path rather than hide work behind the chapter count.
- Zero compulsory acknowledgments for rival actions without a human decision. Reading pause/resume remains optional and never advances rules by itself.
- Use normal card/target selectors and normal commit/cancel controls. Remove tutorial-only replacement card lists and action buttons. Guide progression observes legal state changes.
- A chapter may guide a recommended move, but must explain why. Permit meaningful alternatives wherever the lesson can continue. If an initial implementation cannot adapt, explicitly offer free play from the same state; never silently reset or substitute cards.
- Adaptive chapter continuation is a later acceptance requirement, not something the initial free-play escape automatically proves. Track where legal alternatives leave the guidance path.
- Implement adaptive continuation first for accepting/declining the trade and allowing/blocking the first Recall. Each chapter observes actual before/action/after state and recomputes its recommendation from legal actions. Declining may preserve the turn; losing Margaret may remove the required marriage pair. Mark an unavailable objective as not practiced and offer it later. Never claim it was learned, restore cards, replay an opponent action or promise the same scripted win from every choice.
- Continue changes the guide cursor only. No resources, cards, opponents or History are secretly replaced. Automatic rivals still submit legal actions through the engine.
- Do not force the learner to sabotage a Crown attempt just to demonstrate failure. Show a genuine rival threat and teach recovery where it occurs naturally or in clearly labeled optional practice.
- End with an unaided choice before advice. Brief prediction prompts should test comprehension at relevant moments, not create another long mandatory questionnaire after the match.

**Gate:** the novice reaches play without a privacy curtain, uses the same controls after the guide disappears, sees all selected cards and can explain a choice. Ten chapter labels over 142 required inputs fail.

## 9. WP4 — show cause, preserve decisions and reveal the approaching ending

Create a presentation sequence from public engine events: announce actor and intention; reveal committed source; show payment; open the actual response if one exists; resolve; move the specific object; display the consequential new state. A concealed card is not shown before the rules reveal it.

Automatic rival play must stop for a human Counterclaim, trade decision, succession choice or mandatory selection. It must not require the human to press Resolve on each rival turn. Pause/resume, replay of the last public action and reduced motion are presentation aids; none consume a decision window or alter the engine.

Use one state-derived consequence model for the normal action preview, guide, Crown indicator and History warnings. It must distinguish:

- Definite current costs and movements from contingent outcomes such as an opponent's unknown defense.
- Alba's surviving alternative candidate from Charter's exact persistent Witness and Habsburg's exact supporting marriage.
- A known pending Crisis/cover expiry from an unknown future History draw. Never peek at deck order to make a perfect forecast.
- Notice, scheduled succession, installed successor's contest round and settlement. Display the named people and the actual round boundary, not an unexplained progress percentage.
- A Pass that merely yields from one that ends the round. Before the latter, summarize known activations, potential settlement and scheduled next-start effects, while naming unresolved choices/unknown draws.

A near-complete painting needs a visible warning where it lives: uncovered pieces, whether an eligible Cover exists, its cost and expiry. The first such warning explains Eudoxia plainly. A Crown approaching settlement must visibly identify what rivals can still disrupt using their own visible information.

The engine currently makes a sixth unveiled fragment an immediate shared loss, including during automatic multi-draws or cover expiry before refresh. Presentation must explain that truth. A longer reaction window is a rules experiment under WP7, not an animation delay masquerading as counterplay.

**Gate:** after each representative action, the player can identify who acted, what was paid, which person moved, where they went and why it matters. The terminal screen cannot be the first time a known deadline was communicated.

## 10. WP5 — finish the scene after interaction geometry survives

Use the full available creative toolset according to the deliverable. Before asset work, discover current connections and read applicable skills. Project context includes Tripo for 3D, Adobe for visual production and Blender MCP for modeling/material/render work; report a missing connection when it affects the task. Pass this context to delegated asset workers.

First produce one finished scene slice: resting and selected cards, a three-seal supply with a clear spent state, Crown procedure, marriage pair and a threatening painting. Match portrait/frame composition, material scale, light direction and contact before commissioning broad replacements.

Judge each asset in the actual table camera, desktop and landscape compositions. A beautiful isolated render that becomes an unreadable token in play is rejected. Preserve authored historical ornament as a quiet frame; never add decorative pieces that resemble unexplained legal state.

Profile actual bottlenecks: frame-time distribution, input latency, texture memory, draw calls, loading and browser/device behavior. Compare the same dense scene with quality levels and motion disabled. Set named-device budgets from measurements before declaring them passed.

Do not migrate to Unity or Unreal because of the current embarrassment. Wrong viewport budgets, duplicated face layout and mismatched light/material paths are identifiable defects in the present implementation. Consider migration only after a small equivalent-scene experiment demonstrates a constraint the browser/renderer cannot satisfy and the migration preserves web/mobile access and the physical-game model.

**Gate:** designer review of matched before/after scenes plus actual viewport interaction. Technical success and aesthetic acceptance are recorded separately.

## 11. WP6 — prove there are worthwhile decisions and recognizable intrigue

A meaningful decision requires at least two legal options with materially different future consequences, understandable opportunity costs and a plausible reason to choose either in some state. Many interchangeable card buttons do not count as many strategic choices. A player must be able to explain an intention without merely repeating advice.

| Scenario | Competing commitments | Evidence to seek |
|---|---|---|
| Recruit versus conceal | Public eligibility versus a private matching response/Recall | A useful playable Noble is sometimes deliberately retained |
| Last seal | Build/help/advance versus preserving a Block | Both spending and reserving can be justified in different positions |
| Threatened person | Save an expendable Noble versus reserve defense for a dependency | Counterclaim is not automatic whenever available |
| Marriage | Gain Bloodline access versus expose the supporting Queen | Player predicts and exploits the dependency |
| Primary Law versus Regency | More specific arrangement versus longer survival | Both routes are considered for state-based reasons |
| Recall target | Disrupt ruler, heir, Witness or sponsor versus improve own hand | Chosen target follows a plan rather than generic removal |
| Bargain | Improve own options versus strengthen/reveal information to a rival | Real offers, informed refusals and reciprocal gains occur |
| Shared History | Pay to avert/cover versus pursue position or ask another to help | History changes the choice without becoming compulsory bookkeeping |
| Recovery | Rebuild after forfeiture versus pursue a different arrangement | Loss of the Crown does not create lengthy practical elimination |

Run small deterministic scenarios first so the interface can expose each tradeoff correctly. Then test adversarial policies: immediate-Crown, defensive reservation, negotiation, cooperative History and selfish denial. Use matched seed sets, all module combinations, seating rotations and duplicate declarations; keep policies restricted to each seat's legitimate observations.

Instrument offers, inspections, accepts/refusals, action classes, defense opportunities, first threats, Crown attempts/failures, recovery time, History interventions and resource starvation. Record a reasoned opportunity count separately from raw legal action count. Do not optimize toward an attractive AI win percentage.

Human sessions then test whether people form and revise plans. Ask what they wanted, which person mattered, what they kept secret, what a rival did that changed their mind and whether they wanted another game. Track confusion and abandonment without coaching it away. Sourced historical context and recognizable portraits can support attachment; 52 new bespoke powers are not the default remedy for shallow choices.

**Gate:** stop and revise if always claiming immediately dominates, negotiation is consistently irrelevant, marriage offers no meaningful dependency, or a player becomes helpless early. Software play cannot sign off fun or emotional investment.

## 12. WP7 — investigate mechanical pacing after comprehension

Measure notice and actual opportunity, not only elapsed rounds. Current primary Crown rules already require a notice remainder and a full installed-successor round; existing policy evidence shows these can still produce round-2 endings. Current Eudoxia rules can lose during a boundary before refreshed actions. Both mechanisms need examination.

For each game record: first credible win threat; human decisions before it; succession/settlement times; each rival's legal and affordable disruption opportunities; final available rescue opportunity; cover expiry; practical elimination; end cause; and observed minutes. Classify surprise caused by missing information separately from understood but unsatisfying mechanical speed.

Keep the unchanged-rules version as a control. Candidate experiments, one at a time:

| Experiment | Hypothesis | Reject it if |
|---|---|---|
| Longer public Crown preparation or contest | More ordinary decisions create development and counterplay before settlement | It merely adds empty passes or makes every claim impossible |
| Explicit impending painting completion with a defined public response interval | Shared loss becomes an approaching contest with an affordable choice | It creates indefinite rescue loops, trivial payment or excessive bookkeeping |
| Openly specified History collation | Reduce unavoidable early completion while retaining uncertainty | It relies on secret redraws or makes History irrelevant |
| Revised shared action/defense pressure | More viable reservation/bargaining without removing vulnerability | Extra resources eliminate meaningful scarcity or extend downtime |

These are proposed experiments, not adopted rules or permission to patch numbers without a specification. For each, write the exact procedure, physical marker/track, save/engine implications, public timing and regression fixtures before comparing it. Update rules, printed operative text and tutorial together if adopted.

The inherited 40–65 minute full-game target is a hypothesis to compare with observed human sessions, not an estimate inferred from software rounds. The short teaching experience has a different purpose. Decide acceptable ending distributions from recorded play rather than forcing a cosmetic Eudoxia share.

**Gate:** no known terminal transition occurs without clear warning when the rules provide one; adversarial probes disclose any absence of a real response window. Repeatedly unsatisfying understood endings require mechanical revision, even when every interface check passes.

## 13. Shared implementation seams and regression ownership

Keep each responsibility small enough that a card-art change cannot alter game legality or a tutorial change cannot invent a second action system. Reuse the existing separable engine instead of undertaking a broad rewrite before the experience can be played.

| Responsibility | Existing entry points | Contract |
|---|---|---|
| Rules/content and validation | `engine.ts`, `rules.ts`, `content.ts`, compiler/source cards | Only legal game actions change state; printed procedure agrees |
| Privacy projection | `view.ts`, storage/exports | UI, advice and opponents use the permitted view |
| Card composition | `face.ts` and canonical art | Shared geometry/data across every visible and printed context |
| Physical scene | `scene.ts`, motion/audio | Render and explain public state; never manufacture rules |
| Viewport and interaction | `app.ts`, `style.css` | Stable region budgets and one normal action/inspection path |
| Consequences and terminology | `preview.ts`, `learning.ts`, `glossary.ts` | One accurate vocabulary and state-derived explanation model |
| Tutorial orchestration | `tutorial.ts` plus guide state | Observe and guide normal legal actions; Continue is state-neutral |
| Opponent pacing | AI worker, app orchestration, motion | Automatically present rivals; suspend only for actual human choices |
| Candidate identity | Build metadata/workflow and visible footer | One stable build number per pushed candidate |
| Verification | History browser/layout/face scripts and release suite | Real viewport access, meaningful assertions and retained evidence |

Consolidate conflicting overrides while introducing the relevant seam. Do not add another final CSS block for every viewport bug. Keep rules changes separate from presentation experiments so a regression can be attributed to its cause.

## 14. Verification matrix and stop/redo rules

| Dimension | Required cases |
|---|---|
| Desktop browser content viewport | 3840×2160, 1920×1080, 1440×900, 1024×768; large text and non-default browser zoom |
| Phone/tablet geometry | 844×390 and 852×393 landscape; reduced usable heights representing expanded chrome; 390×844 portrait; compact stress case 568×320 |
| Actual mobile browser | iPhone Safari landscape with chrome shown/hidden, safe areas, rotation and keyboard shown/dismissed; record device/OS/browser |
| Match states | Title, solo introduction, prepared opening, normal Inheritance, action selection, preview, response, trade, marriage, History warning/activation, Crown claim/succession/settlement, near-complete painting/loss |
| Density | Two/three/four seats; 24-person dense courts and manifest-conserving maximum public/hand distributions; multiple pairs, sideways cards, Loans and pending/active History |
| Input/access | Pointer, keyboard-only, real touch; inspect/hold/cancel; large text, reduced motion, mute and graphics fallback |
| Persistence | Reload/resume during normal action, response, sealed heir, locked trade and handoff; no information leaks |

Every visual pass captures **viewport-only** opening, an action, dense courts and compact screens at minimum. Open and inspect the rendered images. Record filename, dimensions, candidate identity, defects found and the actual revision that addresses them. Screenshot generation is not visual inspection; full-page output is only supplemental diagnostic evidence.

Ordinary UI tests verify visible bounds and hit targets before interacting. Do not force clicks, scroll to hidden controls or use internal dispatch as proof of usability. Engine-level fixtures may prepare reproducible states, but the tested action itself must use the public interface. Test actual short-landscape opening and play, not merely a terminal screenshot.

Run appropriate unit, content/compiler, build, browser and layout checks for the change. Add new critical probes to the release inventory. Repair stale selectors instead of skipping them. Before any authorized Main promotion, the exact candidate must pass the complete [release procedure](RELEASE.md), including actual visual inspection.

Human gates begin with a small recorded cohort, proposed as five first-time players plus creator review. A provisional usability threshold is four of five completing the core tutorial and first unaided action without rescue, with **zero blocking clipping, unreachable-control, privacy or false-rules defects for any participant**. Report the small sample honestly; it is not a population-level success estimate. Investigate each failure, revise, then use fresh participants for the next comprehension pass.

At least six adversarial physical games covering all Laws and 2/3/4 seats remain an outstanding viability test; the earlier user deferral permitted digital implementation, not a fabricated pass. Include selfish Eudoxia refusal, coordinated denial, Regency, real bargaining and recovery. Record physical bookkeeping and independent adjudication failures.

**Immediate stop/redo:** offscreen required card/control; covered highlighted target; unreadable identity; misrepresented legal consequence; hidden-information exposure; unexplained movement; forced non-decision acknowledgments; scene asset that obscures state; an ending before the planned teaching decision. Fix and repeat the affected interaction plus opening/action/dense/compact regression set.

## 15. Execution record and next iteration

This plan does not declare the repair complete. An initial local implementation now addresses the confirmed entry, control, composition and timing-explanation defects. The complete experience still has open visual, mobile, adaptive-teaching and human-play gates.

| Pass | Scope | Actual evidence | Status |
|---|---|---|---|
| Baseline audit | Transcript, source paths, tutorial input count, existing simulation aggregation | Sources and measured counts recorded above | Completed read-only analysis |
| Initial repair | Shared card compositor, lit scene faces, viewport shell, numbered-build pipeline, solo introduction and normal controls | Final production build passed; 135 deterministic tests and 3 UI tests passed; 184 face/form combinations verified | Implemented locally; not a publication or full UX acceptance |
| Visual correction | Removed guide/title collision; tightened Court camera; fixed distant card striping found in an action capture | Opened actual title, action, dense Court, compact Court and reference sheet; see inspected files below | Actual correction passes performed; compact legibility remains an open gate |
| Interaction | Full solo legal path, free-choice departure, responses, trade, solo resume and hot-seat privacy | Desktop and full 667×375 / 844×390 replays: 15 human commitments, 23 automatic rival actions, 31 player clicks, zero mandatory Continues; four-size opening/alternative-choice checks and eight dense/maximum scenes passed | Actual control bounds and hit targets checked before interaction; human understanding remains unproven |
| Fitted reading | Inspection, Rules, archive, settings, setup, table records, end-of-lesson questions and accessible fallback | 253 actual pages across 58 optional-reader visits at 1440×900, 844×390, 667×320 and 390×844; complete source sequence, text bounds and real controls verified | Passed browser probes, including held-card inspection and a focused form at 200px height; actual iPhone behavior remains unverified |
| Public choice explanations | Missing Law requirements, unavailable actions and ordered deadlines | Pure private-view-safe projections plus real reader entry points; Round indicator opens Look ahead | No rule changes; presentation alone cannot create an absent response window |
| Print consistency | Shared generated print runtime and preserved painting artwork studies | All 92 reference faces match runtime pixels at 63×88 mm; built subpath assets checked; actual reference/painting sheets inspected | Separate compositor removed; small printed rule text still needs physical-size editorial/legibility review |
| Tactical/pacing evaluation | Policy comparisons, novice sessions, adversarial/physical play | Report raw observations and limitations | Pending |
| Release candidate | Exact complete-suite candidate plus actual visual inspection | Follow release evidence process | Pending; Main remains locked |

For each subsequent iteration: reproduce the highest-impact failure; make the smallest coherent correction; run the relevant checks; inspect the actual rendered state; exercise the real interaction; record what improved and what remains; then proceed to the next gate. Do not expand art or rules scope to avoid an unresolved foundational defect.

### Initial implementation and reproduction

- `src/history-engine/face.ts`: one 630×880 compositor and loaded-font measurements; one name line and fixed role/rules regions. Original art bytes remain unchanged. DOM faces hydrate from the same Canvas output used by the Three.js card material.
- `scene.ts`: lit textured cardstock, quarter-turn orientation, fitted Court camera, transparent accessible hit targets and depth precision correction. Whole-table overview and focused inspection are separate reading scales.
- `style.css` and `viewport.ts`: one height-budgeted shell, visible private hand, bounded hand spreads and explicit pages for large holdings and History. This replaces accumulated overriding layout blocks. `visualViewport` resize feeds the shell; it has not yet been verified on a physical iPhone.
- `reader.ts`: one measured reading surface with fixed close/navigation controls. Paragraphs split at word boundaries, interactive form elements retain their values across pages and resize, and all source content stays available. Card inspection keeps a larger portrait next to complete instructions; glossary terms are an optional second reader. Holding or right-clicking a hand card opens inspection without selecting or playing it.
- `app.ts` / `tutorial.ts`: legal prepared setup, single-player introduction, named rivals, ten chapters/fifteen commitments, normal choices, automatic opponents and genuine human response stops. Other legal choices leave the fixed teaching path without changing or resetting the position. Old incompatible tutorial cursors preserve the saved game and allow free play.
- `deadlines.ts` / `reading.ts` / `preview.ts` / `learning.ts`: concise final-Pass risk summaries, precise missing Law requirements, action availability and public ordered deadline data. The round indicator opens Look ahead; the in-game Rules reader links to Available actions and costs. These explain current rules; no Crown duration, painting-completion rule or AI strategy was changed.
- `print.ts` / `history-cards.ts`: generated printable HTML uses the same compositor, waits for all fonts/art before enabling Print, and retains separate full-image painting studies. These studies do not add 24 required game components or silently settle the physical front/back arrangement.
- `scripts/build-identity.mjs`: first published number 1, increment for a new published source, retain identity on retries, refuse silent reset on an unreadable prior record. Local badge is explicitly labeled local. The publishing workflow has not been run during this task.

Reproduce with a server on port 5178 (or `HISTORY_BASE_URL`): `npm run build`; `npm test`; `npm run test:ui`; `node scripts/playtest-recovery.mjs`; `npm run test:history:browser`; `npm run test:history:layout`; `npx tsx scripts/tutorial-usability.ts`; `npx tsx scripts/tutorial-preview-fit.ts`; `npx tsx scripts/history-reading.ts`; `npx tsx scripts/history-face-geometry.ts`; `npx tsx scripts/history-scene-inspection.ts`; `node scripts/history-proof-check.mjs`. Set `HISTORY_VIEWPORT=844x390` or `667x375` for the corresponding full browser replay. Leave it unset for the reading probe's four-size matrix. With a matching `PAGES_BASE_PATH` production build, run `node scripts/history-print-build-smoke.mjs`. New critical probes are in the release inventory. Full release-suite validation and Main promotion were not performed.

Actual root inspection included `artifacts/playtest-recovery/after-title-1440.png` (1440×900), `artifacts/history/decision-43.png` (1440×900), `artifacts/history/dense-court-844.png` (844×390), `artifacts/playtest-recovery/scene/court-844.png` (844×390), and `artifacts/playtest-recovery/faces/reference.png`. The action image exposed stripes on Tudor cards; the scene revision was reproduced at that same legal position. Subsequent inspected corrections include `scene/late-depth-1440.png` with complete board artwork and clear Tudor fronts; `artifacts/history/preview-43-667x375.png` with reachable 44px Confirm/Cancel and the restored Crown duration; `artifacts/history-reading/667x320-inspect-1.png` with portrait and full readable instructions; and `artifacts/history/print/built-sheet-01.png`. The presentation agent additionally inspected all eleven reference sheets and four assembled painting artwork studies.

The actual correction record includes: guide/title collision; offscreen hand; a non-recommended Crown option covered by pagination; trade acceptance covered by pagination; a five-pixel selected-preview overflow; lost Regency duration during copy shortening (restored without weakening its test); distant card depth fighting; font glyphs touching frame ornament; black board artwork during rebuilds; a 1.3px reading-page ink overrun; a too-short semantic table button; and portrait header controls wrapping outside their row. Compact options now paginate one at a time, reader measurement reserves ink clearance and responds to loaded fonts, semantic reading has a reserved entry, and portrait navigation has two explicit rows with 44px controls. These are recorded repair passes, not an invented iteration count or a claim of completed aesthetic acceptance.

Final evidence lives in `artifacts/history/browser-report-{1440x900,844x390,667x375}.json`, `artifacts/history-reading/report.json`, `artifacts/playtest-recovery/recovery.json`, `artifacts/playtest-recovery/scene/report.json`, `artifacts/history/print-fit.json`, and `artifacts/history/print/built.json`. Thirteen compact choice/confirmation pairs and eight dense/maximum-layout cases passed after the final layout changes. Screenshots now wait for current board/card artwork and a completed render frame where scene readiness is available. These are local evidence files, not proof that every planned viewport, input method or state has been inspected.

### Remaining blockers before calling the interface polished

1. Compact full-table cards and hand names are still too small for comfortable reading. Focus improves Court size, but a complete selected-card reading/spread interaction and a 44-pixel touch-target review remain necessary.
2. Validate fitted reading/editing pages and restored focus on an actual iPhone, including browser chrome and software keyboard. Desktop browser viewport simulations cannot establish physical-device input behavior. Continue the large-text and zoom matrix.
3. Complete the adaptive curriculum. The initial shortened path starts with a trade and lets a different legal choice enter free play. It does not yet teach every alternative through continuing chapter objectives.
4. Review the new Look ahead schedule with real players and strengthen the physical Crown/painting warnings where they live. A truthful schedule and concise Pass warning do not by themselves establish that players notice an impending ending.
5. Review dense reference wording and prove print-size legibility. The shared renderer closes composition drift, but some Noble rules remain around 7.4 pt at 63 mm. Decide the playable painting-front/reference arrangement from a physical proof without breaking the assembled image or changing component count accidentally.
6. Run the policy league, adversarial tactical/negotiation scenarios, real novice sessions and physical-game checks in WP6/WP7. No claim of fun, intrigue, balanced duration or absence of sudden mechanical endings is made by this repair.
7. Complete WP5's scene polish slice, including landing-card support/contact and lighting, seals, marriage markers and the approaching painting threat. Aligned faces and a stable board do not complete those material and composition decisions. Review optional reference length as well as whether every word technically fits.

The initial local repair was validated on `prod` from base revision `c344a83d18cd6953d12f90fab522b37f08006cd1`. That base SHA alone does not identify the modified candidate: `artifacts/playtest-recovery/candidate.json` records the pre-publication source and built asset hashes. Prior user planning/doc changes are preserved. The creator then required Prod publication as the completion criterion. The [evaluation site](https://mcbradd.github.io/overlords-and-outlaws-prod/) and its [revision record](https://mcbradd.github.io/overlords-and-outlaws-prod/revision.json) identify the published build; post-deployment checks and screenshots are retained in `artifacts/prod-smoke/`. Main promotion remains separately authorized and was not performed.

The next request for creator evaluation should present a concrete, runnable candidate with its build number, a short account of verified repairs and an honest list of remaining gates. The creator should be testing a readable game and its choices, not discovering whether the hand is on the screen.
