# Whole-game gauntlet: no protected mechanics

17 September 2026. Design review in progress; **not an implementation freeze**. Published control: Build 5, `7e521f8b29d704291f00af3a9db245fddae00b94`. Seven of ten screen-only games are complete. Do not treat this partial cohort as the final comparison.

The user's permission to challenge mechanics applies to the entire game. Malachy's [email](../knowledge-base/MALACHY-EMAIL-2026-09-17.md) supplies design intent and hypotheses, not mandatory features. The [family gate](../FAMILY-GAME-DESIGN-GATE.md) applies to whole turns and the win condition, not only individual button labels. Succession, combat, suits, ranks, trading, marriage, passing, card circulation and external pressure must each earn their place.

## What the existing evidence establishes

The observer has used hidden defenses, timed attacks after a defense was spent, negotiated recovery and recovered from failed claims. One loss followed defended attacks against an earlier rival claim. These are specific instances of agency, not proof that every action is useful or the rules suit families. Seven expert-agent games and a lengthy tutorial cannot establish sixth-grade comprehension or human enjoyment. Rendering and interaction failures remain independently unacceptable.

## Parent's antagonistic challenge to the alternatives

The experience panel's three-function family race removes much succession bookkeeping. It does not yet establish that rank matters when building. If the lowest available person fills the same space while a higher card defends better in hand, selecting the lowest is an optimization rule rather than an interesting decision. Role scarcity that leaves only one legal card is not a counterexample. The panel must show a position where exposing the higher rank is preferable and another where reserving it is preferable.

The proposed Raider adds both a role restriction and a suit restriction before the player may interact. This can turn hidden leverage into waiting for the correct draw. The immutable setup Ace may be an ornament that adds a taught exception. A successful swap donates a card to the target just before that player's next turn; test whether this creates useful reversal or repetitive denial. None of these concerns proves the proposal fails, but each needs an explicit experiment.

The proposed Envoy removes secret-name guessing, but replaces a single consent decision with an offer, counteroffer and acceptance. A refused turn may create useful bargaining risk or simply waste family play time. Count meaningful choices and refusals; do not call the new procedure simpler merely because its opening prompt is shorter.

The production panel's Crown-capture proposal risks making Hold the obvious move whenever crowned. Its family-contest proposal risks becoming solitary set collection. The succession-duel proposal risks preserving the same clock lesson under fewer surrounding mechanics. Each needs a complete conserved-card sequence before comparison; attractive summaries cannot be combined into an untested hybrid.

Adding a deadline before establishing the no-clock baseline would conceal whether the core sustains play. Conversely, removing a clock does not excuse infinite denial. Track repeated states, idle decisions, available winning lines and reasons for delay. Shared loss may enable spite; it is not automatically a remedy for it.

## Required comparison evidence before selection

| Gate | Required artifact | Passing evidence |
|---|---|---|
| WHOLE-01 | Complete setup, turn, response, circulation and terminal rules for each finalist. | Every example has a legal next step; empty hands, empty supply, refusal, ties and multiplayer timing have explicit outcomes. No rules invented during implementation. |
| RANK-CHOICE-01 | Paired public positions for each retained card action. | Rank changes the relative value of at least two available choices; examples include both exposing and reserving a higher rank. Forced eligibility and decorative numbering do not pass. |
| SUIT-CHOICE-01 | Native and foreign uses with exact card destinations. | Each selected suit changes meaningful opportunities and vulnerabilities; hidden cards remain uncertain; no claim of historically grounded asymmetry without source support. |
| TURN-01 | One visible turn example followed by a nearby changed position. | An independent screen-only learner predicts the legal move, risk and purpose from the screen. A memorized tutorial click does not pass. Multiple explanatory sentences reopen the design. |
| POWER-02 | Ownership ledger for success, defense, exchange and recovery. | Every card remains in an explicit physical zone with an owner and visible availability rule. No destroyed or silently duplicated cards. |
| PRESSURE-02 | Matched no-clock and clock comparisons if pressure is proposed. | Record meaningful decisions, dead turns, refusal, cycles, seat effects and arbitrary endings; pressure must solve an observed problem without a new dominant or forced choice. |
| SELECT-01 | Cross-defense and final disposition of every current mechanic. | Selected game has complete normative documents, finite state inventory and all implementation tasks/tests written before code. Rejected rules have reasons and replacement coverage. |

The fixed Build 5 cohort continues unchanged. No candidate above is selected, implemented or claimed fun by this document.

## Written test before the current-rule rank probe

Question: is choosing the lowest native heir always preferable? Construct two invariant-valid control states with native 2 as ruler, native 3 as supporter and native A/Q in hand. The rival has either a publicly known native K or native 10. All other cards remain conserved outside those four occupied identities. Compare naming A versus Q, then the rival recalling that heir. Record legal defenses and the resulting claim after defense or decline. Expected local counterexample: Q heir/A reserve stops K; A heir/Q reserve stops 10. This tests a specific attack response, not whole-game optimality or how often the position occurs. A constructed valid state is not proof of a naturally reached play sequence. Execute only the existing reducer; no product code changes.

Executed `artifacts/core/rank-choice-probe.ts` successfully against the unchanged reducer; result saved to `artifacts/core/rank-choice-probe.json`. All four states passed the reducer's invariants and all subsequent actions came from its legal-action list.

| Known rival lead | Native heir | Held answer | Local result |
|---|---|---|---|
| K | A | Q | No legal answer; claim breaks. |
| K | Q | A | A answers K; claim survives. |
| 10 | A | Q | Q answers 10; claim survives. |
| 10 | Q | A | No legal answer; claim breaks. |

This refutes a universal claim that a lower heir always preserves the best defense. It does **not** establish how often the uncommon returned-founder position occurs, the value of other choices, uncertain optimality, family comprehension, or the merits of the succession clock. The useful design finding is conditional reserve value: the visible threat can reverse which rank belongs on the table. A replacement should seek this property with fewer special rules, and the current Ace exception still must earn its teaching cost.

## C-ring rejected for sparse-opening access

The panel replaced ordered attacks with cyclic neighbors, using A–2–…–K–A for both a three-card goal and attack/answer eligibility. This removes the immune J/Q/K set and supplies legal conditional exposure examples, but production review found excessive forced passing before a family can develop.

For the untouched opening board with N players, one native card exposed per player and a uniform remaining deck of 12N cards, exactly 12 own cards plus two neighbors per rival are eligible to expose or attack: 2N+10 eligible cards. The chance of holding no eligible card is `choose(10N−10,h) / choose(12N,h)` for hand size h. This is a first-seat opening calculation, not a distribution for later seats after intervening actions.

| Players | No action with the intended two cards | No action after an extra first-turn draw |
|---|---:|---:|
| 2 | 16.30% | 5.93% |
| 3 | 30.16% | 15.97% |
| 4 | 38.56% | 23.47% |

Concrete case: S-A and rival T-A are exposed; S player's hand T5/T7 cannot expose or reach either card. Drawing T9 still leaves only Pass. Unrestricted same-suit targeting allows both initial cards to contest T-A. The extra draw also changes the requested first decision from two cards to three; it cannot silently repair the failure.

Decision: reject C-ring as the next production base. Preserve its paired risk examples and conservation/response-window findings as evidence. Do not add a clock to compensate for unavailable actions. The next complete candidate must be separately written and tested; it cannot inherit approval from selected fragments.

Production also showed a legal repeating defended attack with an empty deck. That proves possible indefinite play, not forced repetition or rational optimality. A five-card monopoly can protect a three-card run; that is a contingent solved position, not the earlier universal top-rank immunity. These findings must keep their different evidential strengths.
