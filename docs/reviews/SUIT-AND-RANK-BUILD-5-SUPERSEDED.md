# Suit and rank — Build 5 binding core

**Binding family-game constraint:** [Family-game design gate](FAMILY-GAME-DESIGN-GATE.md). Sixth-grade language, minimal text, and clear mechanics/intent are mandatory. Multiple explanatory sentences needed to make an ordinary move clear indicate a design failure; simplify the mechanic or its visible presentation. Existing rules below remain the published candidate under review, not exemptions from this gate.

17 September 2026. Implementation status: in verification; see the [execution log](reviews/BUILD-5-EXECUTION-LOG.md). This specification supersedes the R4 seal economy and governs Build 5. The user's Build 4 transcript and ordered priorities are authoritative. Numerical rules below are design selections for evaluation, not claims of proven balance. [Production plan](BUILD-5-PRODUCTION-PLAN.md), [explicit tests](BUILD-5-TEST-CONTRACT.md), and [session record](reviews/SUIT-RANK-DESIGN-SESSION-2026-09-17.md) govern delivery. R4 is preserved as [historical evidence](reviews/SUIT-AND-RANK-R4-SUPERSEDED.md).

## Product and scope

A physical card-and-board game about exposing a family to claim power, passing power to a successor and defending that successor. Build 5 presents a clearly labeled **Core succession prototype**. It implements Recruit, Recall, Defend, Trade, Name heir and Marry & name heir through cards. Pass is a free table procedure. There are no seals, gold, health, readiness or universal action toolbar.

History, Interregna, Eudoxia, separate institutional Laws, paid Draw, Withdraw, Help, Challenge and Cover are deferred from this smallest playable core. Their old design remains archived; none is presented as an implemented compatible full mode. Their eventual reintroduction requires a written task/test amendment and a seal-free interaction design. Removing the unnecessary verbs now follows the user's demand to establish a simple enjoyable core before expanding strategic complexity. No claim of complete advanced-game delivery is permitted.

## Components and immutable identities

Use N selected thirteen-card Dynasty suits for N players (2–4), a common face-down Dynasty deck, each player's private hand, public Court and face-up **Played** area, Crown, ruler/heir/supporter markers, marriage link, round marker and attempt/offer procedure aid. There is one of each rank A=1, 2–10, J=11, Q=12, K=13 per suit. Rank is game allocation, never historical worth, ancestry, chronology or combat power. Queen is a separately printed role and is not inferred from Q. Full names and source portraits remain unchanged. Faces remain 63:88.

| Rank | Alba | Plantagenet | Tudor | Habsburg |
|---|---|---|---|---|
| A | alba-0 | plantagenet-0 | tudor-0 | habsburg-0 |
| 2 | alba-2 | plantagenet-2 | tudor-3 | habsburg-2 |
| 3 | alba-3 | plantagenet-3 | tudor-4 | habsburg-4 |
| 4 | alba-4 | plantagenet-4 | tudor-5 | habsburg-5 |
| 5 | alba-5 | plantagenet-6 | tudor-6 | habsburg-6 |
| 6 | alba-6 | plantagenet-7 | tudor-7 | habsburg-7 |
| 7 | alba-7 | plantagenet-8 | tudor-8 | habsburg-8 |
| 8 | alba-8 | plantagenet-9 | tudor-9 | habsburg-9 |
| 9 | alba-10 | plantagenet-10 | tudor-11 | habsburg-10 |
| 10 | alba-12 | plantagenet-11 | tudor-12 | habsburg-11 |
| J | alba-13 | plantagenet-13 | tudor-13 | habsburg-13 |
| Q | alba-1 | plantagenet-1 | tudor-1 | habsburg-1 |
| K | alba-9 | plantagenet-5 | tudor-2 | habsburg-3 |

## Setup and finite rhythm

Choose distinct player Dynasties. Put each selected Founder into its player's Court as ruler. Shuffle the remaining cards of exactly those selected suits; deal two private cards per player, clockwise. Solo and local play use identical rules. The prepared tutorial is a declared fixed legal deal, not a shuffled game with undisclosed guarantees.

Players alternate one card action or Pass clockwise. A legal committed action clears consecutive passes, including a defended Recall. Passing does not withdraw a player: they may act when their next opportunity arrives. N consecutive passes end the round. Pending responses must finish first. A player with no initiating action can Pass; no automatic hidden choice is made for them.

An action puts its initiating card in Court or Played; it cannot act again this round. Played cards are face up, unavailable, and belong to the player whose Played area contains them. They return to that player's hand at the next start. Never call this permanent discard, retirement or The Past. A captured person returns to the captor, not the original controller. Publicly seen identities remain legitimate remembered information.

At round end: (1) verify Crown dependencies; (2) award a legitimate completed full successor reign; (3) otherwise end round 12 as **Unsettled Crown — draw**; (4) begin next round. At start: rotate the starting seat one clockwise; return all Played cards; deal **one new card to each player**, beginning with that new starting seat, if the deck permits; transfer any intact scheduled Crown; reset offer/attempt marks and passes. There is no hand ceiling. The ordinary draw is one card even if a hand already has two, avoiding the same-card starvation defect. An empty deck gives no draws and never reshuffles. Round 12 is a prominently disclosed prototype limit; repeated cap draws fail the agency gate and require redesign.

Within each round every accepted initiative reduces total cards in hands by at least one, and no effect adds to a hand. Thus at most the round's starting total hand count of accepted initiations occur. Formal rejected offers are separately bounded by N(N−1) directed pairs and count as Pass. Ordinary passes cannot sustain an infinite round: absent finite intervening actions, N passes end it. The round cap bounds complete games without manufacturing a winner.

## Card actions

### Recruit

Play a hand card of your Dynasty into your Court. If you lack a ruler it becomes ruler. Otherwise it is an available public supporter. It has no automatic office just because its rank is high. Choosing whom to expose surrenders that person's exact ranked defense and trade value; no cosmetic ready/sideways rule is added. Native Court rank also affects an eligible Queen's possible marriage matches. Court cards do not initiate hand abilities.

### Recall and Defend

Play any hand card into your Played area to Recall a rival Court person of the **same printed Dynasty**. You may attempt each exact target once per round. This mark is **per attacker and target**, not table-wide: an ally's weak lead cannot grant immunity against other opponents. The target's rank does not resist removal. Compare the attacking lead to the defending answer, clearly separated from the target in the UI.

Only the target's controller answers once: either Defend or let the person go. Defend requires a hand card of that same printed suit whose rank is strictly higher than the lead, or an Ace against J/Q/K. Ace cannot answer 2–10; 2 answers Ace. Commit a valid answer to the defender's Played area; the target remains. No counter-Defend. Both lead and answer stay committed even if the outcome was unfavorable.

If undefended, exchange the two people: move the target to the attacker's Played area and move the exact attacking lead from there to the target controller's Played area. Both stay unavailable this round and return to their new owners at the next start. The target controller receives a person of the captured person's printed Dynasty; capturing a native ruler therefore supplies a native rebuilding card, but does not automatically recruit it or restore any office. Immediately resolve lost offices and marriage support. The lead does not inherit the target's office or marriage. An invalid response reveals/spends nothing and keeps the response pending. Public action messages never reveal an unplayed candidate defense.

This success-only exchange is the approved [attrition correction](reviews/BUILD-5-ATTRITION-REVIEW.md), following a 24-game policy run with eighteen capped draws. A Defended Recall remains unchanged: the lead and answer stay in their existing owners' Played areas. The exchange preserves capture while charging the attacker its exact ranked person, rather than allowing the same returned lead to accumulate an ever-growing captured supply. It does not change target-attempt limits, round cap or Crown timing.

### Trade

From a hand card, select a recipient with at least one card in their publicly counted hand and request one exact selected-suit rank in exchange for that offered card. An empty hand cannot receive a formal offer: it is already public that it cannot supply the requested card. The offered identity becomes public; the requested card cannot be publicly known outside the recipient's hand. A nonempty unknown hand remains requestable without checking its private identities. Each initiator may formally approach each recipient once per round. The recipient can decline without proving whether they hold the request. A decline returns the offer to hand, counts as Pass and ends the opportunity. No repeated probing of that recipient this round.

Acceptance requires the exact requested card. Transfer offered card into recipient's Played area and requested card into initiator's Played area. Both return next start. The initiator may instead immediately Recruit the received card if it is native and strictly lower ranked than the offered card; this choice is included in the binding offer. With no ruler it becomes ruler. This never also claims the Crown. The recipient gets no bundled recruitment. Acceptance removes both cards from available hands and clears passes. The initiator cannot retract after learning acceptance. Invalid/forged acceptances do nothing; the receiver may still decline.

This trades a high concealed tool and helps a rival to buy exact lower-ranked public development. Refusal is a real choice. Negotiation is voluntary; no future promises are enforceable. Public state must not reveal whether refusal meant inability or strategy.

### Name heir

With a vacant Crown, a supported ruler in your Court and another distinct native Court supporter, play a further native hand card as heir. Name the existing supporter explicitly. All three people are distinct. Put the incoming heir in Court and Crown on the old ruler: this is the notice stage, not victory. Any native rank may use this route; no unique rank can remove the ordinary victory path. A supported foreign ruler may start this native succession too, preventing a failed foreign claim from trapping recovery.

Keep old ruler, heir and named supporter until the next start. At that start move the Crown and ruler office to the named heir. The old ruler stays in Court, now an ordinary person and no longer required by this claim. Keep new ruler and original supporter through that entire round to win at its end. Losing a required person fails the attempt immediately; replacing them never revives it. To try again, play a new qualifying heir on a subsequent legal turn.

### Marry & name heir

Alternative card ability: with a vacant Crown, your native ruler and a **different native Queen already in Court**, play a foreign hand person as heir if their rank equals or neighbours the Queen's rank. Neighbours differ by exactly one; A/K do not wrap. The Queen becomes the named supporter and the exact pair receives a physical marriage link. The incoming spouse enters Court and the same Crown notice/reign procedure applies. Any historical gender may be a spouse; Queen is a printed game role, not a claim about historical marriage.

The Queen must not already be married. Either partner leaving breaks the pair immediately. If the Queen leaves, an unsupported foreign spouse remaining in that Court moves to its current controller's Played area; the Crown attempt fails. If the spouse is itself captured, it stays in the captor's Played area, never returns to the former controller. The Queen remains required throughout the successor reign; the former native ruler is not required after transfer. A foreign ruler who loses support loses their office. Recruit a native to recover if no supported ruler remains. A still-supported foreign ruler may begin the native Name heir route after a failed attempt.

There is no separate nonmatching marriage action with no strategic purpose. This route offers an exact foreign bargaining need and two suit vulnerabilities. The native route remains available at any rank. Broader marriages belong to later integrated History design.

## Presentation and public uncertainty

At the top level explain: **Claim the Crown, pass it to your heir, then keep your new ruler and their supporter on the table for a full round.** At each state show the missing concrete prerequisite or remaining boundary and which public people an opponent could target. Hidden hands show counts, never imagined contents. Inspection explains the particular suits/ranks that could answer a Recall, without implying they are held.

The ordinary interface starts with cards, not a list of verbs. Show only that selected card's available actions and short reasons for unavailable targets. Name each cost/destination before commitment. Played cards say **Returns next round**. Use full printed names in teaching. Multiline prose is left aligned. One navy/gold guide teaches only the current next legal interaction; all other gameplay navigation is unavailable except Exit tutorial. Read-only inspection of the currently taught card may be part of that interaction.

## Fixed legal tutorial fixture and sequence

Two seats, Alba and Plantagenet. Rulers alba-0 and plantagenet-0. Initial human hand alba-2 and alba-4. Rival hand alba-3 and plantagenet-2. Reserve next deal cards so round 2 gives plantagenet-3 to rival then alba-5 to human; round 3 gives alba-6 to human then plantagenet-4 to rival. Remaining selected-suit cards follow deterministically. No History or prebuilt supporters. Teach the goal, own ruler, two held cards, public opponent and concealed hand count first.

Exact legal action path (explanations/selection/confirmation can be separate guide cursors; Continue never changes state):

1. Human Recruits alba-2; explain public supporter and forfeited hand use.
2. Rival Recalls alba-2 with alba-3. Human Defends with alba-4; compare 4 over 3 and define Played/return before commitment.
3. Human Pass; rival Recruits plantagenet-2; human Pass; rival Pass. Boundary returns played cards and draws normally.
4. Rival (round-2 starting seat) Pass. Human Names alba-5 heir with alba-2 supporter.
5. Rival Recalls alba-5 using alba-3; human Defends alba-4. Human Pass; rival Recruits plantagenet-3; human Pass; rival Pass. New round transfers Crown to alba-5; old ruler ceases to be dependency.
6. Human Pass. Rival Recalls alba-5 with alba-3; human Defends alba-4. Human Pass; rival Recruits plantagenet-4; human Pass; rival Pass. End of full round 3 awards human succession win.

The rival's teaching actions are declared scripted legal examples, not the shipping AI and not proof of strategy. Explain why each prescribed human action is useful in its visible situation. Introduce only the required vocabularies in dependency order. Other native/foreign possibilities are learned in subsequent practice; do not call a choice blind if the guide supplied its answer. After the teach, the fresh evaluator explains the experience before any model answer, then plays ten ordinary games.

## Acceptance and iteration

All tasks/tests in the production plan and explicit contract precede implementation. New findings require an amendment first. Native rank opportunity cost, low-card bait, trade acceptance, marriage usefulness, practical elimination and capped games remain empirical questions. Test aggressive denial, largest-card hoarding, always-recruit and smallest-answer policies. Run actual UI games and inspect every screen/asset at the recorded viewport matrix. No simulation, generated screenshot or expert persona substitutes for those observations. Publish only Prod and verify exact build identity; Main remains locked.
