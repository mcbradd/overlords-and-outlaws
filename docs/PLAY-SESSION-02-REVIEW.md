# Play Session 02 — comprehension review

Reviewed: 15 September 2026. Baseline: V2, commit `4d617156cf01ff01e605ad5a3c48f7d90965a54f`.

Evidence: the entire supplied 60,210-character playthrough transcript, checked against the rules, UI, renderer, source knowledge base, and previous decision audit. The recording itself and exact game-state history were not supplied. Transcription errors are interpreted cautiously; uncertain incident diagnoses are labeled below. This document records findings and design requirements, not completed gameplay changes.

## 1. Main finding

The interface does not let a new player construct a reliable model of the game. It frequently suggests a different model from the one the rules execute. More explanatory text would leave that contradiction intact.

The clearest example is “CLAIM · 9 GOLD”: the player reasonably expects to receive nine gold, but the action spends nine. Another is selecting a suggested card and then pressing End turn: the player believes they have submitted a play, while the game has only selected something for inspection. In combat, the player predicts damage, an inadequately announced response changes the result, and a card disappears into a destination they cannot see. These experiences teach the player that the game is unpredictable.

The repeated use of Suggest a plan is therefore evidence of dependence, not successful learning. By the end, the player understands enough to question weak attacks and identify a likely dominant strategy, but still cannot reliably account for resources, card movement, or victory timing.

The previous automated checks established that legal actions could finish games and fit certain tested viewports. They did not establish that a person could discover those actions, predict their consequences, or understand the result. This session fails those latter requirements.

## 2. What the player learned over the session

| Stage                    | Understanding demonstrated                                                                                                                                                        | Remaining confusion / incorrect inference                                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrival                  | Recognizes a hand and battlefield; tries to inspect and manipulate cards.                                                                                                         | Cannot identify their own House confidently. Assumes cropping means the camera can be moved. Unexplained rectangles look like possible game objects.                                                       |
| First deployment         | Eventually discovers the side-panel play button; recognizes that a Steward improves income.                                                                                       | Initially treats a suggestion as a committed move. Cannot distinguish a Royal's identity from its concealed state. Gold appears sufficient, but an exhausted order budget blocks play without explanation. |
| First claim and attacks  | Finds the claim action and target-selection interaction.                                                                                                                          | Expects claim to award gold. Cannot identify damage, retaliation, defense responses, disappearance, or why a claim might fail.                                                                             |
| Development and marriage | Understands that estates should produce income and that foreign cards can enter play.                                                                                             | Cannot tell which card can arrange a marriage, who is marrying whom, why incomes differ, or whether three family cards already mean victory.                                                               |
| Rulebook investigation   | Discovers court and hand limits; begins connecting the two order markers with turn exhaustion.                                                                                    | Definitions introduce more undefined terms. Crown, stability, collapse, upkeep, tribute, history, and Witness timing remain unresolved.                                                                    |
| Later combat             | Learns Guardians restrict targets; recognizes Brace can negate two damage and Ambush can act during another player's turn. Notices that stronger attacks may overcome a response. | Response timing and math remain hard to observe. Seized cards appear missing. Readiness and capture conditions remain uncertain.                                                                           |
| Final claim              | Articulates the broad plan: establish three family Royals, claim, survive opposition. Identifies high-health Guardians as an attractive way to do it.                             | Opponents do not contest, so the lesson never validates that understanding. Other roles and investments appear secondary to stacking Guardians. Exact claim timing and crown protection remain unclear.    |

Two distinctions matter:

- **The player revised their position on interaction.** An early suggestion to remove off-turn responses is explicitly withdrawn after discovering Ambush. Preserve and teach interaction; do not implement the earlier remark in isolation.
- **The player did not ask for every rule to be repeated everywhere.** They asked for a stable home for each concept and relevant information at the moment of choice. A universal wall of tooltips would repeat the failure.

## 3. Root causes and design rules

### A. One concept has several names; one label hides several concepts

Examples: Founder becomes Anchor; the rules require a Queen but the visible role says Diplomat; Resolve is explained as “remaining endurance”; damage becomes pressure; Royal and Outlaw look like different card types. A collector number looks like a gameplay fraction. Gold and House heraldry change symbols between surfaces.

**Rule: one gameplay concept, one public name, one symbol, one rule definition.** Historical titles, flavor, role, ownership, and state must occupy distinct fields.

Recommended vocabulary for the next revision:

| Concept                              | Presentation contract                                                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Royal                                | The person represented by a card, whether in hand or on the table.                                                                                                                         |
| Concealed / in play                  | Visible zone/state vocabulary. Introduce Outlaw and Overlord once as the game's thematic names for those states; never imply a separate creature type.                                     |
| Founder                              | Keep this familiar, source-grounded role. Explain its actual ability on the card; the title alone must not imply an unstated one-Founder limit.                                            |
| Queen / marriage eligibility         | If the rule requires a Queen, print Queen. If eligibility is redesigned, change the rule and all card text together. Do not ask players to infer eligibility from a portrait or a synonym. |
| Attack, damage, health               | Prefer these familiar terms for the current combat behavior. If the political meaning requires different mechanics, design that distinction before introducing different vocabulary.       |
| Gold, orders                         | Distinct spendable budgets with consistent coin and action markers. Every action displays both costs.                                                                                      |
| Claim the crown                      | An action, followed by a visible contest state. Label the payment explicitly: “Claim the crown — pay 9 gold.”                                                                              |
| Income / upkeep / coronation payment | Money received each turn / recurring expense / one-time claim expense. Never present these as interchangeable costs.                                                                       |

Rename the public model consistently before polishing individual sentences. Keep collectible numbering and historical detail in the full card/archive hierarchy, outside combat statistics. Use one House crest asset everywhere; color must have a matching emblem and label.

### B. Game state has no stable physical home

Estates are largely a count; the crown resembles a stat panel; shields have no obvious recipient. The player consequently interprets crown fortification as health added to the Founder. Draws have no visible origin. New captures can disappear onto another hand page. Floating readiness text substitutes for a physical state convention.

**Rule: every persistent rule state must have a physical component or a legible arrangement of components. Every change must have a visible origin and destination.**

| State                     | Physical and digital representation                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Court capacity            | Five deliberately designed card places if that limit survives the mechanics review. Empty places must look intentional, not like rendering artifacts.                                |
| Concealed hand            | Card backs for opponents; all owned cards accessible and arrivals immediately revealed to their owner. Never conceal an owned sixth or seventh card behind an unnoticed page change. |
| Draw and discard          | Separate visible piles. Animate the actual draw, capture, return, and discard destinations.                                                                                          |
| Gold and orders           | Treasury and two spendable action markers on the player's mat. Move/spend them when costs resolve.                                                                                   |
| Readiness                 | Standardized card orientation, taught through an action. Face-down must remain reserved for hidden information. Being unable to attack must not silently imply inability to defend.  |
| Persistent damage         | Damage counters on the piece, with original and current health accessible in inspection.                                                                                             |
| Estate                    | A component with its income printed on it, in an identifiable zone and available as a target.                                                                                        |
| Marriage                  | A paired arrangement plus a marriage token; inspection identifies the two people and the dependency. Avoid an unreadable network of crossing lines.                                  |
| Crown, shields, stability | If retained, a separate crown component with its own track and shield tokens. It cannot masquerade as the Founder.                                                                   |
| Claim contest             | A claim marker and named rival response markers. Remove each only after that House completes its actual contest turn.                                                                |
| History and Witness       | An event/round track and physical painting fragments; show the next trigger and outcome where the component lives.                                                                   |

Digital aids may calculate income, highlight legal targets, enlarge cards, and animate changes. Those aids explain physically reproducible state; they do not create extra rules or hidden bookkeeping. Numeric hand counts can supplement accessible representations, but must not replace the visible hand. Red/green “leaders” are inappropriate for quantities where more is not always better, such as an expensive exposed court.

### C. Inspection, intention, commitment, and advice are conflated

The player tries double-clicking and dragging because the obvious relationship is between the card and its destination. Actions instead live inside an information panel. A suggestion silently changes a distant strip also used for history. An unavailable action gives no reason.

**Rule: inspection is passive; taking an action has a clear actor, destination, cost, and commitment gesture.**

- Hover or press-and-hold opens the same full inspector for any piece. A click can pin it. Touch release dismisses a held inspection; close and outside-click dismiss a pinned one. Position it inside the viewport and keep the close control fixed.
- Drag a hand card toward a court place to preview deployment. Drag a ready card toward another piece to preview an attack with a connecting arrow. Distinguish a hold from a drag so they cannot trigger each other accidentally.
- Provide an equivalent click/tap route and keyboard access. No essential function requires dragging, right-click, or a keyboard shortcut.
- Put actions in one stable dock: bottom center on desktop, within comfortable thumb reach on landscape mobile. The inspector remains read-only.
- Ordinary deployment may commit on a valid drop once its cost is visible. Choices with multiple meanings or major consequences use a local confirmation. Release outside a valid destination cancels safely.
- Every blocked attempt explains the actual blocker and remedy: “No orders left — end your turn”; “Court full — return a Royal before playing another”; “David can attack on your next turn.” Check all applicable blockers without burying the immediate one.
- At zero orders, the primary instruction is “End your turn.” Saving gold is a consequence of ending, not an invented action.
- Advice, lesson instructions, and resolved events have visibly different homes and headings. Advice stays beside the action it describes.

### D. The rules resolve faster than the player can see causality

The player repeatedly predicts an outcome, sees another, and cannot tell what intervened. Generic capture text immediately introduces marriage rules instead of explaining where the named card went. “2 pressure ↔ 2 retaliation” lacks explicit agents and destinations.

**Rule: presentation follows the causal order of the rules: announce → pay → respond → resolve → move pieces → explain the changed position.**

For example, an attack by a 2-attack Royal into a 2-attack defender should show:

1. The attacking card lifts and points toward its target.
2. The defender announces Brace; one coin and its available response marker are spent.
3. “2 incoming damage − 2 blocked = 0” appears at the defender.
4. “Defender deals 2 damage” appears at the attacker; health and counters change visibly.
5. If a piece leaves, show exactly which zone receives it and why.

Lessons wait for acknowledgement at a newly introduced response. Normal play uses a readable, dismissible announcement with a visible progress bar and adjustable pacing. Reduced motion preserves the same explanations and reading opportunity. Cosmetic animation time must not consume a player's decision window.

The event record uses round, acting House, named source and target, resource change, and immediate consequence. Newest-first order is explicit. Capture text should say “Edward IV joined your hand,” then show Edward IV. Marriage information belongs at marriage inspection or a marriage decision.

A two-damage probe can be strategically useful if it consumes a scarce response before a stronger attack. The advisor must show that follow-up and its cost. It must not call a blocked, self-damaging attack valuable merely because the defender has income.

### E. Victory is a paragraph instead of a visible procedure

“Three family Royals — need three” looks like a completed victory condition. Claim costs and contest timing are separate, weakly connected labels. The player cannot identify what actually threatens victory.

**Rule: show victory as an ordered procedure attached to the relevant pieces.**

1. **Build your family:** highlight which in-play Royals count and why. Show any marriage dependency.
2. **Claim the crown:** show eligibility and the exact payment, including its source. State that payment is spent even if the claim fails.
3. **Defend the claim:** show each named rival still entitled to a complete contest turn and the concrete ways the claim can break.
4. **Resolve:** show the last contest marker leave, recheck the required family state, then announce the winner and reason.

Do not substitute an unexplained “survive N turns” number. The count comes from the actual rival Houses. Do not imply a selection of exactly three claimants unless the engine actually has that rule; V2 currently counts the whole supported family. Defeating a Royal, breaking a claim, suffering collapse, and losing the game must have distinct presentations.

### F. The lesson teaches a different strategic reality

The ending is especially damaging: after the player finally predicts that rivals must attack their claim, those rivals fight each other. This is confirmed behavior, not merely a perception problem.

**Rule: lessons script situations and decisions, not immunity from the mechanic being taught.**

Curate hands, draws, targets, and opponent actions. Introduce only the components needed for the current lesson. Use the same legal action and resolution engine as normal play. A rival must actually threaten and break a claim before the learner successfully defends one. Explain omitted systems as later lessons without displaying their full interfaces or injecting development commentary.

Success means the learner can predict and execute an action without Suggest a plan. Finishing a protected match is not a sufficient learning outcome.

### G. Several choices may lack strategic value even after clarification

The transcript raises balance questions that presentation cannot settle:

- Gold accumulates while orders and court space constrain spending. A one-gold Brace can feel free, and investment can become irrelevant near a claim.
- Guardians contribute to the family victory requirement while also blocking access to all other assets. Stacking them may concentrate too much value in one role.
- Crown damage, fortification, recovery, and family removal create parallel defensive systems whose distinct purpose is not established.
- Extra draw and estates must justify their cost against simply advancing the claim.
- Marriage has potential as access bought with vulnerability, but concealed eligibility and complex support chains hide that exchange.

**Rule: every retained mechanic must create a distinct, understandable tradeoff that matters to reaching or preventing victory.**

Do not add currencies, exceptions, or new card classes to rescue weak decisions. Test the smallest rule set first. Compare Guardian stacking against coordinated contests, economic development, marriages, and concealed responses in two-, three-, and four-House games. Analyze whether Brace changes an outcome or creates a useful later opening before treating it as a decision.

One correction to the player's interpretation is useful here: Brace consumes both gold and the House's one paid response for that rival turn. The response opportunity can matter even with surplus gold. The current UI does not make that cost clear, and the AI often fails to use it intelligently. Both must improve.

### H. Visual polish must establish meaning before spectacle

Black rectangles are not merely unattractive when the player mistakes them for estates or hidden cards. Inconsistent projection suggests a movable camera. Mismatched crests misidentify ownership. Variable full-card proportions imply different objects.

**Rule: every visual distinction carries a consistent meaning; decoration cannot resemble unexplained game state.**

Use a coherent table projection, recognizable zones, and centered player seating. House frames share one physical silhouette and aspect ratio. Full-card layouts scale as a unit everywhere; simplified board pieces deliberately show only relevant combat information and always open the canonical full card. Protect faces from accidental cropping. Use House heraldry/frame treatment and clearly labeled roles, not different corner cuts.

Animate a physical lift, travel arc, impact, and settling motion. Use effects to point to the affected piece and resource, not as substitute feedback. Validate readability at the user's 3840×2160 desktop size as well as short landscape phones; fitting rectangles inside a viewport does not prove usable scale.

## 4. What the implementation confirms

| Finding                                                 | Evidence in V2                                                                                                                                           | Confidence / implication                                                                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opponents ignore the learner's claim                    | `chooseMove()` in `src/duel.ts` filters out AI claims and attacks against seat zero in lesson mode.                                                      | Confirmed structural teaching failure. Remove this policy in favor of actual scripted contests.                                                      |
| A captured card can be invisible                        | Combat appends captures to the hand; `renderBoard()` in `src/main.ts` slices five cards per page and does not bring an arrival into view.                | Confirmed failure path; likely explanation for the reported seized Edward IV. Exact session state is unavailable.                                    |
| Not every defeated defender is captured                 | Capture requires a surviving attacker and hand space; otherwise the defender goes to its discard.                                                        | Confirmed rule. Some other reported disappearances may involve this branch; do not assume all are pagination. Each branch needs a destination event. |
| Sufficient gold does not imply a legal deployment       | `moves()` returns only End when orders are exhausted and disallows deployment at five court cards; `order()` renders a disabled button without a reason. | Confirmed source of misleading affordability feedback.                                                                                               |
| Marriage eligibility is hidden behind another role name | Internal `Queen` is displayed as `DIPLOMAT`; marriage legality checks the internal role.                                                                 | Confirmed vocabulary mismatch.                                                                                                                       |
| Brace can be spent on a doomed defender                 | `aiResponse()` checks threatened health, claim status, estate targets, or gold surplus, without requiring the block to improve the outcome.              | Confirmed heuristic flaw. Exact value still depends on the whole attack sequence.                                                                    |
| Combat feedback is insufficient                         | Combat event title uses pressure/retaliation; the major announcement list in `main.ts` omits Brace.                                                      | Confirmed. An existing small effect does not explain the interruption.                                                                               |
| Card and board projections differ                       | Cards use a different tilt from the planar shadow meshes and table slots in `src/battlefield.ts`.                                                        | Confirmed mismatch; exact identity of every reported rectangle requires visual reproduction.                                                         |
| Existing checks missed comprehension                    | Prior UI/playthrough scripts choose legal actions directly; the audit samples terminal AI outcomes.                                                      | Confirmed test coverage gap. Neither establishes discoverability or informed human choice.                                                           |

## 5. Design direction and boundaries

Preserve the designer's central proposition: a growing dynasty gains power while exposing more ways to lose it. Keep two to four Houses, family-table accessibility, hidden cards with useful responses, historically identified Royals, marriage, and seizure. Three supported Royals and a contested claim remain the baseline to test, not evidence that current surrounding rules are balanced.

Physical reproducibility is a hard constraint. An accessible digital inspector and arithmetic preview are welcome conveniences; secret counters or unexplained state changes are not. Historical and production notes belong in the archive, credits, or repository documentation, not inside tactical instruction.

The next revision should first make a small, truthful contest comprehensible, then establish that its choices are worth making, then apply the final visual treatment. The detailed sequence and release gates are in [the revision 3 plan](REVISION-3-PLAN.md).
