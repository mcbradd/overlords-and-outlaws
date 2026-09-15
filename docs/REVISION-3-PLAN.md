# Revision 3 — teach the game through its presentation

Status: main implementation and autonomous test loop completed on 15 September 2026; remaining gates are recorded below. Driven by [the complete Play Session 02 review](PLAY-SESSION-02-REVIEW.md). The V2 report remains a historical test record.

## Delivery status

Implemented: shared action descriptions driven by legal moves and engine values; consistent role/House card identity; passive hover/hold inspection; a bottom action dock; mouse/touch alternatives; named family and claim information; separate crown, estate, economy, pile and Witness explanations; ten deterministic lessons with genuine opponent attacks; seven-card hands; upright/sideways Guardian protection; one spouse per Queen; complete-hand renewal; own-turn recovery; rational response conservation; generated chamber/frame/Queen art; combat health transitions and dismissible announcements.

Validation: 200 final-rule games with counterfactual choice audits, an additional 216 held-out games with rotated assignments, targeted rule and UI tests, ten browser-completed lessons, full 2–4-House tables across seven viewport sizes, drag/hold/inspection and private family-response flows. See [the quality report](QUALITY-REPORT-V3.md) and [decision audit](DECISION-AUDIT-V3.md) for exact evidence and limits.

Partial foundations: role and action registries are shared, but this is not a complete standalone semantic registry. Combat events carry before/after health; other event types do not yet form a universal replayable state-transition model. Turn income uses a coin flight, not a separate flight from every producing estate. Chronicle history can be reread, but animated resolution replay is not implemented. Selected interaction state is explicit in application state, without a separate formal state-machine library.

Open gates: fresh human comprehension testing; actual iOS/Safari and low-end hardware testing; browser zoom/accessibility certification; hidden-hand resampling; explicit Guardian-only policy trials; removal/merge experiments for auxiliary crown actions; complete unused-gold/order-pressure instrumentation. The implemented policy comparisons do not substitute for these experiments. The final audit still contains many sampled losing positions, low response-choice diversity, and seat-order imbalance. No claim is made that the design space is maximized or competitive release balance is achieved.

The sections below preserve the intended design criteria so these outstanding items are not lost when this iteration is published.

## Outcome

A new player should be able to identify their House, take an action, predict its public consequences, recognize an opponent's intervention, locate every moved card, and explain the next step toward victory. Choices should concern expansion, exposure, defense, and concealed leverage, rather than deciphering the interface.

Preserve the two-to-four-House family game. Solo play uses opponents governed by the same rules. No further initial Q&A is required by this plan.

## 1. Establish a shared rules and presentation model

Implement these foundations before adding more independent UI explanations:

### Canonical vocabulary and components

- A single glossary/semantic registry supplies player-facing names, icons, concise definitions, and associated physical components.
- Separate historical identity, role, House, controller, zone, readiness, damage, and family membership. Do not overload one field with multiple meanings.
- A rules reference provides a canonical home for general rules. Context panels instantiate those rules with the actual named pieces and current values; they do not duplicate unrelated rulebook paragraphs.
- One full-card layout scales proportionally in hand inspection, archive, and enlarged views. A separate compact board representation shares the same identity and state.
- Record every persistent state as a physical component, counter, pile, or orientation. Reconsider mechanics that cannot be explained this way simply.

### Action description from the engine

Introduce one query used by the action dock, drag preview, keyboard path, lessons, and advice:

```ts
describeAction(state, action, viewer) => {
  availability,       // available, waiting for another player, or blocked
  blockers,           // concrete reasons and relevant remedies
  costs,              // gold, orders, cards, response opportunity
  source,
  legalTargets,
  publicOutcome,      // exact only where public information permits it
  possibleResponses,  // conditional possibilities, never leaked hidden cards
  victoryEffect,
}
```

These fields must come from the same rules that authorize and resolve the action. Eliminate separately handwritten eligibility checks and conflicting preview math. A hidden Ambush remains a possibility, not an assertion that the opponent has a Conspirator. Private local-family inspections and response handoffs must not reveal another player's hand.

### Explicit interaction states

Model inspect, select action, choose target, preview, commit, await response, resolve, and pass-device as distinct states. Selection alone never spends a resource. The same transition logic handles mouse, touch, and keyboard. A pinned inspector contains no gameplay actions.

### Causal event presentation

Rule resolution produces structured events with round, acting seat, source, target, costs, before/after values, destination, and consequence. Retain the before-state needed for presentation; do not redraw the final board before showing the cause. The renderer, event history, accessibility narration, and lesson steps consume the same events.

Newly captured or drawn cards become visible to their owner immediately. Full-hand rejection, mutual defeat, unsupported marriage, and collapse have distinct events. Do not emit “joined your hand” if the actual destination is discard.

**Gate:** every currently legal action has an accurate description; every blocked attempt has an accurate reason; every piece removed from a zone has an explicit destination. Tests must exercise real rules, not compare two copies of the same string.

## 2. Audit the smallest useful mechanics before expanding the UI

Keep a reproducible V2 baseline. Separate lesson failures, AI failures, and rules failures; a protected tutorial cannot prove Guardian stacking dominates normal play.

| Question                                                      | Experiment                                                                                                                                                                                                                                                        | Keep/change criterion                                                                                                                                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does Guardian stacking crowd out every other plan?            | Explicit Guardian-heavy policies versus mixed courts, rush, economy, and marriage plans, with opponents able to coordinate against claims. Compare baseline to a small alternative such as limited interception or reduced offensive value, one change at a time. | Defense must have a real cost and an exploitable weakness. Do not introduce an unrelated anti-Guardian exception just to manufacture a counter.                                                            |
| Does gold create meaningful choices?                          | Record income, spending, unused gold, cap hits, turns constrained by orders rather than gold, and reserves at response windows. Compare income and commitment costs under actual game lengths.                                                                    | Investment should sometimes delay useful board development; spending on defense should sometimes forgo a credible alternative. More gold must not be automatically better or routinely irrelevant.         |
| Is Brace a decision or a mandatory click?                     | Compare accept/Brace/Ambush across whole attack sequences, including a later attack by another ready card and a later rival House. Audit the AI's saved resources and survival/claim changes.                                                                     | Retain a response when it can change an outcome or protect a valued future option. Do not prompt for an equivalent no-effect choice. Any automatic passing must be exact or an explicit player preference. |
| Do crown health, shields, and recovery earn their complexity? | Remove or merge one auxiliary layer in a controlled variant; compare distinct contest routes and comprehension burden.                                                                                                                                            | Keep a separate layer only if it creates a different relevant vulnerability from losing a family member. Renaming two similar bars is insufficient.                                                        |
| Is marriage legible and worth its dependency?                 | Test a simple one-Queen/one-spouse link, consistent with the source brief, against V2 support chains. Show family gain, upkeep, and consequences of losing that Queen.                                                                                            | Prefer the simpler relationship unless chains demonstrably improve decisions enough to justify their additional bookkeeping.                                                                               |
| Do Recruit and other management actions matter?               | Remove each from comparable scenarios and measure lost strategic options, not just usage count.                                                                                                                                                                   | Cut or consolidate actions that do not create a distinctive useful choice. Do not retain them to fill an action menu.                                                                                      |
| Do History and the Witness affect actual decisions?           | Compare visible event/fragments pacing against the distribution of claim and game lengths.                                                                                                                                                                        | They should create foreseeable pressure, without manufacturing a surprise ending or padding turns to make an event relevant.                                                                               |

Choose final tuning values after these comparisons. The source contains provisional rules; record adaptations in development documentation. Do not describe an untested numeric choice as historically inevitable or mechanically derived.

**Gate:** each retained mechanic has a documented scenario where it changes a worthwhile decision and a clearly represented physical state. Every supposed counter must operate in two-, three-, and four-House play. Reject variants that increase button count without improving decisions.

## 3. Build short, deterministic lessons

Each lesson has a fixed setup and draw order, scripted legal rival actions, a narrow objective, an observable success condition, and a repeatable recovery path. Use real engine resolution. New components appear when needed; no opening dashboard full of future systems.

| Lesson                         | What is introduced                                                                 | Required demonstration of understanding                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your House and your first play | Own mat, one hand card, gold, orders, court place, inspection and deployment.      | Player plays the card and can see both costs leave their respective supplies. On order exhaustion, End turn is the clear next action.                                                          |
| A Royal attacks                | Readiness orientation, targeting, attack and health, damage persistence.           | Before committing, player can identify who damages whom and which card will leave. The actual animation matches the prediction.                                                                |
| An opponent interrupts         | Response window, Brace, concealed Ambush, spent response marker.                   | A scripted Brace visibly changes the outcome. The player then uses or preserves a response in a setup where the choice has a visible consequence.                                              |
| Seizure and the family         | Capture destination, Queen eligibility, one foreign marriage and its dependency.   | Player locates the seized card and can identify which family membership would fail if the Queen leaves. No marriage lecture during the capture announcement.                                   |
| Invest or contest              | Estate component, recurring income, raid, opportunity cost.                        | Player sees the estate's next payout and compares that investment with an immediate board action. Income arrives from identifiable components.                                                 |
| Claim and defend               | Payment, family eligibility, named rival contest turns, claim failure and success. | A real rival first breaks a vulnerable claim. In a reset practice position, the learner defends a claim against genuine legal attacks and observes why the final contest turn ends in victory. |
| Shared history                 | Retained event and Witness rules, visible tracks and triggers.                     | Player sees the upcoming trigger, makes a relevant preparation, and observes its deterministic resolution before entering normal play.                                                         |

These are curriculum units, not seven mandatory long matches. Combine or shorten units when comprehension permits. Support skip, replay, and an uninterrupted practice match afterward. Retain accessible keyboard controls without making them an extra subject the player must learn.

**Gate:** lessons contain no AI immunity and no hidden exception to the taught mechanic. On completion, an unguided practice action must be discoverable without the advisor. Automated lesson completion verifies sequencing, not human comprehension; preserve that distinction in the report.

## 4. Compose the physical table and contextual UI

- Center the current player's court and treasury on their side; place other Houses in clearly separate positions. Support two, three, and four seats. Compact opponent views may simplify presentation while preserving all interactive pieces.
- Use coherent card/table projection and shadows. Remove unexplained rectangular planes. Give each actual estate, pile, and court place a deliberate identity.
- Unify House crests, role labels, card silhouette, proportional ornament scaling, and portrait framing. Separate historical detail from immediate tactical information.
- Make the action dock the stable location for cost, target, response, and next-action information. Keep the inspector passive and viewport-safe.
- Show victory steps at the crown and contested family pieces. Use named rival markers rather than an unexplained fraction or generic countdown.
- Show order use by moving/exhausting physical markers, and readiness through card orientation. Provide accessible text equivalents without adding permanent floating gameplay labels.
- Animate coins from the bank/estates to the treasury, cards from their actual piles, marriage pairing, declaration, attack, response, damage, capture, and claim resolution.
- Make major responses readable before combat continues. Allow click-to-dismiss announcements and replay of the last resolution. Reduced motion must retain explanatory sequencing.
- Test gesture thresholds and thumb reach on landscape touch, with a complete tap alternative. Right-click is never required. Modals always have a fixed close control and outside dismissal where appropriate.

**Gate:** no hidden hand arrivals, clipped inspectors, vertical card-area scrollbars, inconsistent full-card proportions, or decoration mistaken for a game component. Check 3840×2160, 1920×1080, 1440×900, 1024×600, 844×390, 667×375, and 568×320, including browser zoom and full courts/hands. Real-device comfort remains a separate check from emulated viewport geometry.

## 5. Test decisions and comprehension separately

### Behavioral and integration fixtures

Cover sufficient gold with zero orders; full court; multiple Founders; resting attacker versus valid defender; affordable and unaffordable responses; Brace that saves and Brace that does not; Ambush stopping the attacker; simultaneous defeat; capture with five, six, and seven cards already in hand; lost marriage support; interrupted claims; last-rival claim resolution; and event/claim/Witness timing.

For each fixture, check four things: visible available action, honest preview, rules result, visible explanation/destination. Include private family handoffs and resumable state. Do not rely solely on selectors driven by legal engine moves: separately check that the labeled interaction is discoverable.

### At least 200 full games after the mechanics revision

Run the revised rules across 2–4 seats, Houses, and strategic policies. Counterbalance first seat and House/policy assignment using matched seeds; use additional games where necessary for balanced comparisons. Use the same seeds for variant comparisons, plus a held-out set for the selected revision.

Preserve raw results and terminal outcomes. Separate forced survival, obviously superior actions, equivalent outcomes, no sampled winning route, and plausible tradeoffs. Group equivalent gestures and exclude turns with no discretionary action so interface minutiae cannot inflate the decision count. Keep order and response decisions separate.

Add explicit Guardian-heavy play, rational response conservation, and credible contesting of imminent claims. Sample possible hidden hands consistent with public knowledge for offline analysis; do not let production AI inspect rivals' secrets. Review multi-player externalities: blocking a leader may benefit a third House, so own-win binary rollouts alone do not explain every family-table decision.

Record time to victory, idle/order-limited turns, unused gold, response outcome changes, claim contest frequency, roles used in successful and failed claims, marriage dependence, and the marginal value of auxiliary actions. Do not optimize only the percentage labeled “interesting”; a prolonged game full of inconsequential choices is a regression.

### Human comprehension checks

At each first encounter, ask the tester to predict: who acts, what it costs, what can change the outcome, where the card will go, and how it affects victory. Observe whether they can locate that information without being told where to click. Record advisor dependence, attempted unavailable actions, incorrect predictions, lost-piece incidents, and misconceptions that persist after the result.

This session is the first such evidence and outweighs earlier claims of “clear” onboarding. Do not replace a real person's observations with an AI proxy for their understanding. Autonomous testing can prepare the build and document residual uncertainty without fabricating family playtest results.

## 6. Iteration and release order

1. Implement the shared vocabulary/action/event foundations and deterministic lesson scaffolding.
2. Run the minimal mechanics comparisons and select the smallest defensible ruleset.
3. Complete the physical presentation and lessons against those chosen rules.
4. Run behavioral fixtures, browser and responsive checks, then the 200-game audit. Inspect surprising outcomes and change their cause.
5. Repeat affected checks after changes; use held-out games for the final candidate. Update rules, source-adaptation notes, and the quality report together.
6. Commit and publish the verified candidate to the existing repository/site under the user's existing authorization. Report changes, evidence, and remaining human validation needs accurately.

Stop adding scope when retained mechanics have distinct purposes, no known high-impact comprehension contradictions remain, and independent validation supports the chosen design. Neither a clean test run nor any fixed simulation count establishes AAA quality or that all design possibilities have been exhausted.
