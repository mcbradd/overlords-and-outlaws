# Suit and rank — R4 design candidate

17 September 2026. Normative design appendix to the [master design](HISTORY-ENGINE-IMPLEMENTATION-SPEC.md), **not yet implemented**. Original concept: Overlords & Outlaws © 2025 Malachy Murray. The [panel record](reviews/SUIT-RANK-DESIGN-SESSION-2026-09-17.md) records proposals, objections and actual revision rounds. These are simulated design perspectives, not consultations with named professionals or human playtests.

## Authority and purpose

The user's clarification establishes that each Dynasty is a thirteen-card suit, Ace (1) through King (13); rank creates concealed tactical choices, including playing small cards to draw out larger responses; and each Dynasty has a designed theme loosely grounded in its history. Every suit/rank combination is unique. These are design requirements. The procedures and numerical choices below are the panel's proposed implementation of those requirements, not further statements attributed to the user.

The existing history engine does not implement these ranks. Its collector numbers identify cards and its Noble instructions largely match suits without comparing ranks. This candidate supersedes R3's permission for same-suit mechanical interchangeability and its blanket exclusion of numerical comparisons. It does **not** restore health, damage, gold, total power or victory points. The objective remains lawful succession under a finite shared History clock.

Rank should change what a player can accomplish, expose, retain or threaten. A sub-game earns its place only if its outcome feeds Court development, defence, succession or the time left before Eudoxia wins. Nothing grants extra seals, draws History secretly, or creates an unlimited response chain. More choices and a panel's agreement do not establish greater enjoyment; the human tests below must measure that.

## 1. Card identity and the common language

- Each selected Dynasty contains exactly thirteen distinct ranks: A=1, 2–10, J=11, Q=12, K=13. Ace is low except for the explicitly printed Block exception. There is no wraparound adjacency: A and K are not neighbours.
- Suit is the immutable printed Dynasty. A marriage changes support, never printed suit or rank. Equal ranks can occur across suits, never twice within one suit.
- Rank is a game allocation, not chronology, direct descent, historical importance or combat strength. The Founder occupies Ace in this candidate. `Q` is a rank; **Queen** remains a separate printed marriage role. More than one historical person in a suit may have that role. The game does not imply only one woman, queen or king existed in a Dynasty.
- Exact suit/rank identity creates mechanical uniqueness without requiring 52 unrelated special abilities. A card also retains its name, role, and any branch tag. Dynasty Laws give the shared rank language different institutional purposes.
- Shared comparisons: **lower/higher**, **equal**, **neighbours** (difference exactly 1), and **low A–6 / high 7–K**. No rank sums, averages or spendable rank balances.
- A ready Court Noble is upright; a used Noble is sideways. Sideways does not remove offices or marriage support and does not forbid being an heir. It prevents actions that explicitly require readiness. Rank never changes during a game.

### Explicit paper-test rank allocation

This is an authored **provisional** mapping for reproducible paper scenarios. It preserves all 52 currently retained identities and portraits. It is not inferred by the engine from a collector number or ID suffix. The allocation is open to content review and balance tests; subsequent changes require a new content version. Names and source portraits remain in the [content inventory](HISTORY-ENGINE-CONTENT-AND-COMPONENTS.md).

| Rank | Alba ID | Plantagenet ID | Tudor ID | Habsburg ID |
|---|---|---|---|---|
| A / 1 | alba-0 | plantagenet-0 | tudor-0 | habsburg-0 |
| 2 | alba-2 | plantagenet-2 | tudor-3 | habsburg-2 |
| 3 | alba-3 | plantagenet-3 | tudor-4 | habsburg-4 |
| 4 | alba-4 | plantagenet-4 | tudor-5 | habsburg-5 |
| 5 | alba-5 | plantagenet-6 | tudor-6 | habsburg-6 |
| 6 | alba-6 | plantagenet-7 | tudor-7 | habsburg-7 |
| 7 | alba-7 | plantagenet-8 | tudor-8 | habsburg-8 |
| 8 | alba-8 | plantagenet-9 | tudor-9 | habsburg-9 |
| 9 | alba-10 | plantagenet-10 | tudor-11 | habsburg-10 |
| 10 | alba-12 | plantagenet-11 | tudor-12 | habsburg-11 |
| J / 11 | alba-13 | plantagenet-13 | tudor-13 | habsburg-13 |
| Q / 12 | alba-1 | plantagenet-1 | tudor-1 | habsburg-1 |
| K / 13 | alba-9 | plantagenet-5 | tudor-2 | habsburg-3 |

## 2. Shared action economy, commitments and timing

Keep three seals per player per round, clockwise one action or Pass, no banking or transfers, and the existing round boundary order. Every legal committed paid order clears consecutive passes, including a Recall defeated by Block. Block spends from the defender's same three seals. No effect in this candidate refreshes seals.

**Lend** means place a hand card face up in your seat's Leverage area until next round start. It cannot be recruited, traded, used to Block, lent again, or discarded while there. It returns to its owner's hand at the ordinary commitment-return step. A lent card retains its exact rank and suit; no separate rank tokens can substitute for it. Tudor's sealed heir is a separate commitment and does not return with ordinary loans. Proof written on a Crisis persists when the actual loan returns.

Every order validates its entire selected payment and target before spending or revealing. Invalid choices do nothing. Once a valid paid action begins, its legal response or adverse result does not refund its costs. Only the target controller may answer Recall, once, with Block or decline; no counter-Block. Free negotiation is not an extra action window.

At start retain: due Covers unveil with immediate shared-loss checks; ordinary loans return; seals and readiness refresh; scheduled succession occurs; recurring Crises resolve; public History draws occur; normal below-five hand draws occur. Normal automatic hand draws remain one blind card: the patron procedure below applies only to the paid Draw order. At end, Crisis effects and expiries precede Crown victory checks. Rank cannot rescue an already completed painting or resurrect a failed Crown claim.

## 3. All orders and their rank decisions

The vocabulary contains **ten paid initiating orders, Pass, the Block response, and the Lend payment procedure**. Regency is a route within Claim the Crown, not another order.

### Recruit — small people can act sooner

Pay one seal to move a native hand Noble into Court. Compare with your Ruler immediately before the action: strictly lower enters ready; **equal or higher enters sideways**. Equality is possible with a foreign Ruler after Habsburg succession. With no Ruler, the new native Noble enters ready and becomes interim Ruler without another seal. Existing Court members are unchanged.

This is a timing choice, not a rank admission test. A low recruit can Challenge or supply a ready-Court Help on a later opportunity this round; a high recruit can supply a Law arrangement immediately but must wait for next-round readiness before those ready-only actions. Placing a native K as Ruler makes later native recruits ready, but exposes K and removes it from your hand's response options. An Ace Ruler does not bar recruitment: every other native recruit enters sideways.

### Draw — concealment or a declared patron

Pay one seal. Choose **blind Draw** (take the top card) or **patron Draw**, declared before touching the deck:

1. Patron Draw requires at least two cards in the deck and an available hand Noble. Lend that Noble face up as the patron.
2. Deal the top two cards face down into numbered first/second positions on the procedure aid **visible to the table**. Privately peek at each card without exchanging positions, then return it face down to the same slot. Do not move the packet behind a screen or mix it into your hand.
3. You may keep the original first card without revealing it. Alternatively, keep the original second card only if its rank is strictly lower than the patron's; reveal that second card so everyone can verify the comparison.
4. Announce which numbered slot you choose and visibly move that card into hand, revealing it first if it is the second. Put the other slot's card face down at the bottom of the deck. Other players know a revealed choice even though it joins the private hand.

No suit match is needed. If the second card does not qualify, the first is still yours; a legal patron Draw never takes nothing. With one deck card, only blind Draw is available; with none, Draw is unavailable. Empty hands can always choose blind Draw when otherwise legal. Existing Crisis restrictions on Draw apply to both modes.

A larger patron permits more substitutions but removes a stronger response from hand. An Ace can never authorize the second card; this is a deliberately unattractive patron, not a reason every rank must be equally good at every order. Private inspection is paid and physically ordered; it does not depend on trusting an unverifiable hidden rank comparison. Patron Draw removes exactly one card from the deck overall and never recycles The Past.

### Trade — an exact bargain that can buy deployment time

Replace the old sealed-packet inspection procedure entirely. R4 uses **one card for one card**, not the earlier one-or-two-card packets. Nobody must reveal a hand card in response to a request.

On your opportunity, with at least one seal, you may make one formal offer to a recipient you have not formally approached this round. Specify the exact two suit/rank cards, show the card you offer from your hand, and mark that recipient on your Trade row. The requested card must not be publicly known to be outside that recipient's hand. The recipient may simply decline, whether unable or unwilling; no distinction or proof is required.

- **Decline:** keep your offered card; spend no seal; this opportunity counts as Pass, including an immediate round end if it completes consecutive passes. You cannot take another action on that opportunity. You cannot formally approach that recipient again until next round. Voluntary conversation may precede a formal offer but cannot compel disclosures or create extra formal attempts.
- **Accept:** the recipient reveals the exact requested card from their hand and the exchange happens immediately. The initiator cannot withdraw the offer after that reveal. Only the initiator spends one seal. Acceptance clears consecutive passes. No inspection-then-decline stage exists. An invalid acceptance exchanges nothing and ends the offer as a decline; concealed cards cannot be substituted.
- **Rank benefit:** if the card received by the initiator is native and strictly lower than the card they gave away, the initiator may Recruit that received card immediately as part of this action. It always enters **sideways**, even if below the Ruler. With no Ruler, appoint it interim Ruler but leave it sideways. This admission must otherwise be legal. The recipient receives no bundled action. If recruitment is unavailable or unwanted, keep the card in hand.

An accepted exchange still satisfies applicable Trade-based Crisis obligations for both players, whether or not the optional Recruit is used. Resolve exchange, optional admission and resulting state checks before completing the action. No future promises are enforceable and no collection ownership changes permanently.

This gives the initiator a concrete possible benefit over Draw: certainty about one card plus Court development for one seal, purchased by surrendering a higher card and helping another player. It does not guarantee agreement, particularly in two-player play. Exact-rank needs in marriage, Laws, defence and Crises produce reasons to evaluate offers; refusal remains a legitimate strategy. The directed offer ledger has at most N−1 boxes per player per round (twelve boxes total at four players), so rejected offers cannot indefinitely stall a round.

### Marry — choose a relationship and its immediate availability

Keep the native unmarried Court Queen and foreign unmarried hand Noble/unsupported Court Noble requirements. Pay one seal; create the exact marriage and support the foreign spouse.

If the foreign spouse enters **from hand**, it enters ready when its rank equals the Queen's or is her neighbour; otherwise it enters sideways. A spouse already in Court retains its prior orientation. Marriage never readies either existing Court card. No chain of foreign sponsorship is created.

Any eligible ranks may marry. A close-rank match can help with a Crisis on a subsequent action this round and may prepare a faster Habsburg settlement. A distant match may still provide the person, suit or heir you need. All ordinary breakage and unsupported-survivor rules remain.

### Withdraw — exchange public authority for concealed leverage

Pay one seal to return one of your Court Nobles to hand. Break that Noble's relationships and offices and resolve succession and Crown failure **before** admitting anyone else. Those losses are not undone by a replacement.

You may then admit one strictly lower-ranked native hand Noble of the departing Noble's printed suit, sideways, as part of the same action. That replacement must have been in your hand before the action and must otherwise be recruitable. No office or marriage transfers to it. If there is still no Ruler, appoint that native newcomer interim Ruler, remaining sideways. A foreign departure cannot bring in another foreign Noble through this permission.

Replacement is optional: an empty hand or Ace departure does not prohibit Withdraw. Returning a high native gives you a concealed response and can leave a smaller public contributor behind, but any lost marriage, Witness or required heir stays lost. Repeated Withdraw/Recruit cycles still consume seals and never create cards or free readiness.

### Recall and Block — small leads can draw large answers

**Recall:** pay one seal and Lend any hand Noble. Target a rival Court Noble of the **same printed suit**, at any rank, not already Recalled this round. Its controller gets one response. Without a successful Block, move the target to the initiator's hand and resolve all ordinary relationship/office losses.

**Block:** pay one seal and Lend a hand Noble of that same printed suit whose rank is **strictly higher than the Recall card**. Alternatively, an **Ace of that suit Blocks J, Q or K**. Ace does not Block 2–10. A 2–K card Blocks an Ace Recall. Resolve any additional active Crisis payment atomically. No response to a Block is allowed.

Both loans remain unavailable until next round whether or not Recall succeeds. Record the target as Recalled this round even if Blocked; a subsequent Recall must target another person. The target's own rank is not a defensive threshold: it matters through the person being removed and the uses of that card afterward. Rank-gating targets was rejected because the sole Ace or King could otherwise become effectively immune.

Example: your Plantagenet 2 Recalls an opponent's Plantagenet 6 Witness. They Lend K to save that Witness. On your next opportunity, Plantagenet 9 Recalls their Plantagenet 8 heir; K is still tied up. They need another legal response and another seal. They could instead have accepted the first loss or saved K by playing a smaller sufficient answer. This is a genuine choice under uncertainty, not a guaranteed combo. Each attacker Recall costs its own seal.

The Ace exception intentionally makes 10 a different kind of threat from J: Ace cannot answer 10, while J is higher against other responses but vulnerable to Ace. If the sole same-suit Ace is already the target in Court, it is not also available in the defender's hand. No example may invent duplicate cards.

### Help — negotiate which ranks to commit

Pay one seal and follow the Crisis's printed hand-loan or Court-readiness procedure. The complete R4 prevention table is in section 4. On an **all-different-ranks** Crisis, your contribution must have a rank not already recorded on that event, across all players. On an **equal-rank pair** Crisis, the first contribution fixes the required rank and the second must match it in a different suit. These are alternatives, never simultaneous tests.

Each contribution records card ID, rank, suit and credited seat. Loans return normally; the proof persists until the event leaves play. The same card cannot contribute again to the same event, even after returning next round. A player already credited for their personal obligation cannot contribute again to consume another rank. Earlier contributions never require the actual card to remain in its original zone unless a card expressly says so.

There is no refund or retroactive substitution if others do not cooperate. A contribution can deliberately preserve or occupy a scarce rank. If required cards are inaccessible, a particular Crisis may be unpreventable; it still follows its finite printed lifecycle. This is a pressure and negotiation hypothesis, not a promise that blocking another player's contribution is enjoyable.

### Challenge — a small contributor and a large contributor

Pay one seal and turn one ready supported Court Noble sideways. Fill one of that Crisis's two spaces: **low A–6** or **high 7–K**, according to its rank. Each space holds one retained proof; contributors must be different cards. Either space can be filled first; one player may supply both over separate actions. A filled space cannot be replaced or counted twice. Proof remains if its Noble later leaves Court or readies next round.

Both spaces avert a pending Challenge Crisis. An active Crisis can be ended this way only where its End text explicitly permits it. In this roster that is H2, War of the Succession; its earlier contributions still count. No rank total damages a Crisis or a person.

An all-high Court is no substitute for a low contributor. Recruiting a small Noble ready can therefore matter immediately, and turning that person sideways to Help can leave the Challenge unresolved. The two spaces are shared, so rival players can cooperate or leave each other to bear the cost.

### Cover — spend the right card to buy longer time

Pay one seal and discard one hand Noble permanently to The Past to cover one revealed, currently uncovered, never-before-covered fragment. You may still have only one active Cover. Use the fragment's existing printed position number 1–6.

- If the card's rank is **at most the fragment number**, or its printed suit **matches the painting**, keep the fragment covered until start of round **R+2**.
- Otherwise, it is an emergency Cover lasting until start of **R+1**.

Either condition grants the same duration; they never add. Any hand Noble remains usable for an emergency Cover. The duration is fixed when paid and recorded publicly; never extend, replace or repeat a fragment's Cover. Due fragments unveil before all other start operations and immediately check Eudoxia. You cannot act after the sixth uncovered fragment has already caused defeat.

Example: a foreign 3 covers fragment 4 for the long duration; a foreign 9 gives only the short duration; a 9 of that painting's suit gives the long duration. Ace can buy long time on any fragment but is also a valuable Block against court ranks. This makes sacrificing a low card consequential rather than automatically throwing away one's worst card.

### Claim the Crown — assemble an institution, then choose its pace

Pay one seal and meet the existing Dynasty Law's people, native-count, office and relationship requirements. All otherwise valid arrangements remain legal at **any ranks**. The named rank pattern earns a **one-full-reign-round** settlement; a nonmatching primary arrangement needs **two full reign rounds**. Both transfer the Crown at the next normal succession start. The remainder of the claim round is notice and never counts as a full reign round.

| Dynasty | Preserved institutional arrangement | Rank pattern for the shorter reign | Resulting planning problem |
|---|---|---|---|
| Alba | Two native heirs from different printed branches; either surviving candidate may succeed | One named heir strictly below the old Ruler and the other strictly above | Assemble alternatives on both sides of authority rather than only collect high relatives |
| Plantagenet | Native heir and distinct native Witness, neither old Ruler; Witness persists through settlement | Witness strictly lower than heir | A modest guarantor enables a higher successor, while that small person remains an exposed dependency |
| Tudor | A native heir sealed from hand; reveal and install at succession | Sealed heir strictly lower than old Ruler | Commit a concealed lower successor or accept a slower reign with a larger one; the sealed card cannot also defend |
| Habsburg | Foreign heir married to a native Queen who is not old Ruler; same marriage persists | Heir and Queen equal ranks or neighbours | Seek a specific foreign match, then defend both the supporting relationship and the new Ruler |

These are counterfactual mechanical interpretations of the existing Dynasty themes, not assertions about historical rank rules or marriages. Further historical verification is required before publishing new historical claims.

At Claim, record all named IDs and the old Ruler's rank. Freeze publicly checkable short/long qualification at that point. Alba's later loss of one candidate does **not** revoke an already-earned short schedule if its original Law still permits the other candidate to succeed. Loss of an actual required person or link fails the claim normally; later repairs never restore it.

**Tudor privacy:** record the sealed card physically face down. Before revelation, show both possible settlement dates; public previews, public legality results, public save exports and other-seat/AI projections must not disclose its rank or a precomputed short/long flag. The authoritative private save retains the original sealed identity for deterministic restoration and verification; the owning player may inspect their own commitment. At succession, reveal and verify the original sealed native card, compare against the recorded old Ruler rank, and set the short/long duration. A nonmatching rank is a legal longer reign, not an invalid heir. An invalid suit/identity is still a failed claim under the original Law. Never permit substitution after sealing.

If claimed during R3, succession occurs at start R4. A valid short arrangement settles at end R4; a long arrangement at end R5, after History effects and expiries. A blocked transfer still forfeits under the existing rules; extra duration is not permission to postpone that transfer.

**Regency remains available:** native Ruler plus another native Court heir, **three full successor reign rounds**, no rank pattern required. This explicitly changes R3's two-round Regency. The panel initially retained two, then found that it made a two-round unranked Plantagenet primary claim inferior to the same heir without a Witness. Three makes the tradeoff explicit: ranked primary 1, unranked primary 2, simpler Regency 3. Its selected person's rank still affects what the player exposes and removes from other uses. Neither an Ace/K Ruler nor the loss of a particular rank prohibits making a legal claim. Recovery is not guaranteed to beat History; the longer fallback must be tested against the finite clock. A Regency claimed in R3 transfers at start R4 and can settle at end R6, subject to all intervening checks.

### Pass — keep the right answer, at the risk of ending the round

Pass remains free and always available; it pays no card and reveals no rank. You may act later if another player acts before everyone has passed consecutively. All-pass immediately ends the round, including declined formal Trades counted as Passes.

Rank matters through the response you retain and the commitments that will return, not through an artificial Pass reward. With one seal left and a matching 10 in hand, you may Pass to keep the ability to Block a likely 9 Recall against your heir. If that hand card were 8, it could not Block 9: spending the seal on an available rescue or Cover may be preferable. A matching Ace instead protects against J/Q/K but not 9. Rivals can Pass in turn to trigger the round boundary, restore their lent cards and advance History. No waiting strategy guarantees another turn.

## 4. Complete Crisis prevention conversion

Replace the relevant Prevent/End contribution text, retaining the current executable card's active effects, frozen obligated seats, expiry and permission to end early unless specified here. This table supersedes the old unranked contribution counts; it does not revive the historical A2/P2 protected-selector rules removed in the card-language revision.

| ID | R4 prevention procedure | Rank consequence |
|---|---|---|
| A1 Contested Recognition | Each player uses Help to Lend one native hand Noble; all contributed ranks on this event must differ | A needed native rank can be committed here or saved for defence/another institution |
| A2 Border Rising | Challenge once with low and once with high | A large Court still needs a small ready contributor |
| A3 A Broken Recognition | Each originally obligated player Marries one of their originally marked unsupported foreign Court Nobles | Ranked marriage and Habsburg matching alter which relationship to form; existing Court orientation never refreshes |
| P1 The Barons' Terms | Each player uses Help to turn one ready native Court Noble sideways; all contributed ranks differ | Committing a Court rank here can consume readiness needed for a Challenge slot |
| P2 A Disputed Charter | Challenge once with low and once with high | Preserving either class for later can leave the Crown exposed to the event |
| P3 Closed Roads | Help to Lend two Nobles of different suits and the **same rank**, one per action | First contribution publicly proposes an exact rank; later participant chooses whether to complete that pair |
| T1 The Unsettled Church | Each player uses Help to Lend one hand Noble; all contributed ranks differ | Choose a contribution that leaves others a route, or risk the shared restriction |
| T2 A Rival Proclamation | Challenge once with low and once with high | A low Court member supplies something a second high member cannot |
| T3 The Open Record | Each player completes accepted Trade or Cover after reveal; a Trade counts for both | Trade's rank-dependent recruitment or Cover's duration adds a second benefit to fulfilling the obligation |
| H1 The Divided Inheritance | Each originally obligated player uses Help to Lend one hand Noble; all contributed ranks differ | Marriage protection competes with retaining exact-rank defence and partner cards |
| H2 War of the Succession | Challenge once with low and once with high; same condition may End the active event, retaining earlier proof | Players can decide which half to fund and who supplies the missing class |
| H3 The Imperial Settlement | Help to Lend two Nobles of different suits and the **same rank**, one per action | Matching across families creates bargaining value; recurring forced loans still do not count as Help |

No first-contributor monopoly can add more than the printed contributions: each personal obligation is credited once; the two-card events have exactly two slots. A first contribution can nevertheless choose a rank others cannot or will not match. Its consequences are part of the adversarial playtest, including purposeful obstruction, not evidence of a balanced cooperative system.

## 5. Sub-games and player-facing payoffs

| Sub-game | Choices and countermoves | Connection to winning |
|---|---|---|
| Lead and answer | Low Recall tempts a large Block; defender sacrifices target, gives smallest answer, or reserves an Ace; attacker changes next target | Opens or protects a real succession dependency within the shared three-seal budget |
| Court and hand | Recruit a low ready helper, expose a high Ruler, or Withdraw high authority for a lower replacement | Public structure and concealed defence compete for the same unique cards |
| Exact bargains | Offer high for a lower native piece and bundled admission; recipient values suit, response, matching pair or long Cover | Trading can save development time, but refusal and giving away leverage remain real costs |
| Patronage | Commit a larger hidden tool to seek a lower card; reveal a chosen second card or preserve the first card's identity | Search for a specific institutional/defensive need while exposing the patron and temporarily losing it |
| Succession arrangements | Complete the Dynasty's particular rank pattern or start the slower claim now | More preparation reduces the public reign that rivals and History can disrupt |
| Shared obligations | Supply low/high or nominate a matched rank; reserve scarce cards and bargain over the missing contribution | Avoid a restriction or departure that would undo your own Court and Crown |
| Buying time | Sacrifice a low card or a painting's own suit for longer Cover, or accept emergency duration | Extend the finite opportunity to finish succession without eliminating the shared clock |
| Passing and deadlines | Hold a specific ranked answer, invite a lead, or let the round close | Determines whether defence remains available and when History/loans/succession advance |

**Self-interested two-player Trade example:** the Plantagenet player offers Tudor Q for Plantagenet 4. Plantagenet receives its exact native 4 and Recruits it sideways for one seal total; that can complete the three-native Court needed for a primary Law. The Tudor player receives Q without a seal cost and can later discard it to Cover Tudor painting fragment 2 until R+2. Their former foreign 4 would have given only R+1. They are not compelled to help a rival: in this position they may value extra survival time more than keeping the 4. The initiator surrenders a strong Tudor response to buy exact development. A different board can make either party rationally refuse. Draw remains attractive when card quantity, secrecy or denying an opponent matters more.

## 6. Physical and information contract

Use the existing 63:88 reference dimensions and original source art. This task specifies rules, not finished visual assets. Rank needs an index readable in a physical fan, paired with a suit word/symbol; full card text distinguishes rank Q from Queen role. Preserve the board-first engraved direction, touch/keyboard inspection, private hands and reduced motion in future implementation.

Additional paper evidence: four Trade rows with up to three opponent boxes; two table-visible numbered face-down patron-inspection positions on each procedure aid; rank/suit/ID fields on Crisis proof registers; low/high labels on Challenge slots; Cover expiry R+1/R+2; Crown old-Ruler rank, original nominees, 1/2/3-round schedule and Tudor's unresolved alternatives. None needs a 3D prop to be playable. A marker on a private hand card must not expose its identity. Public exports must not encode deck order, unrevealed draws, sealed heirs or hidden speed qualifications.

A loan's return does not erase what other players legitimately saw. Patron choice, Trade disclosure and rank inference are legal information; reconstructing a private hand from engine-only state is not. Physical players may remember or use the game's public records; do not require software-only perfect memory to execute rules.

## 7. Validation, tuning and migration

### Executed design closure versus unproved experience

The panel's stopping condition is a complete, mutually consistent candidate: each of thirteen vocabulary entries has a causal rank decision or, for Pass/Lend, a worked consequence; all essential recovery actions remain possible without a specific rank; each contested proposal has a disposition; no open adjudication blocker remains. This is not a claim that every rank has equal value, all lines are optimal, or players find every sub-game entertaining.

Prioritize these paper tests before implementing or embellishing the candidate:

1. **Counterplay:** play the two-target bait sequence with defenders choosing each legal response or decline; repeat with 10 versus J and a held Ace. Record whether small leads produce credible decisions or merely mandatory Blocks.
2. **Two-player Trade:** use the exact example above, then remove the urgent Cover need. Compare acceptance with an all-refuse policy and with Draw. Test reciprocal trading, repeated refusal, collusive feeding at three/four players and whether bundled admission dominates Recruit. Do not repair results by scripting acceptance.
3. **Rank extremes:** Ace/K Rulers, all-high hands, no hand, no Court, no seals, empty/one-card deck, all suitable short-pattern ranks in The Past, and a foreign unsupported survivor. Demonstrate the remaining legal recovery path and its actual History risk.
4. **Crisis obstruction:** duplicate native Dynasties, blocked distinct-rank contributions, impossible equal-rank pairs, the sole low contributor already sideways, first-player sabotage, and active H2 with one retained slot. Failure to avert an event is legal; perpetual victory lock is not.
5. **Crown privacy and timing:** Alba loses one heir after short qualification; Tudor sealed higher/lower than old Ruler with identical pre-reveal public views; Habsburg loses sponsor; Plantagenet loses Witness; short/long settlement coincides with Cover unveiling and Eudoxia. Check paper state after every boundary.
6. **Comprehension:** first-time players predict costs, card destinations and next legal responses using only physical cards/aids. Record unprompted mistakes, lookups, analysis time and whether they can explain a foregone alternative. Compare against the current unranked game without telling them which ought to be better.

Run complete games at 2, 3 and 4 players, including every Dynasty as a player, duplicate declarations and mixed modules. Record rank usage by action; successful and refused offers; seals spent on Draw/Trade/Recruit/defence; short versus long claims; Eudoxia versus player wins; first-seat outcomes; perceived meaningful choices and regret. Results must name actual sample counts and methods. No predicted win rates or enjoyment scores are supplied here.

**Revision triggers:** revise if small cards are always fodder, Kings are always hoarded, Ace is mandatory insurance, formal Trades are generally refused or compulsory, distinct-rank Help becomes predictable spite, two-round primary or three-round Regency claims almost never survive the existing clock, or players cannot execute patron/claim timing without a referee. First simplify/remove the offending bonus or comparison; do not add resources to compensate. If Regency is too slow, revise the whole 1/2/3 timing relationship and History pacing together rather than restoring a dominated institutional route. The narrow Ace-versus-K-only alternative remains a specific test variant, not an additional simultaneous rule.

### Implementation boundary

This documentation change does not alter runtime cards, compiler, saves, AI, tutorial or print kit. The deployed prototype remains the current unranked history engine until a separate implementation completes the following work:

- Add an explicit immutable rank to the authored manifest and validate a complete A–K permutation per suit against the 52 retained IDs. Preserve collector IDs, portraits, names and legacy game data independently.
- Extend the card-language compiler and deterministic reducer for comparisons, patron choice, public Trade binding, directed offer limits, optional admissions, retained rank proof, variable Cover expiry and frozen Crown schedules. Bump content/interpreter/save compatibility rather than silently treating collector index as rank.
- Replace all old Trade prompts and packet states. Save each legal choice stage; reject stale previews without costs or hidden disclosures. Update AI only through seat-projected information, including uncertain Tudor deadlines and learned public cards.
- Rewrite all twelve Crisis prevention clauses, four Laws, reference aids and tutorial examples together. Refresh print proofs and component counts; do not leave unranked printed text beside ranked behavior.
- Add meaningful engine tests for the cases above, conservation, repeat-loan proof, no free readiness, no invalid hidden comparison and trade deadlines. Validate AI with policies that refuse trade and preserve high cards, not only an accommodating baseline.
- For eventual gameplay delivery, run the repository checks and actual rendered opening/action/dense/compact/card inspections. Publish to Prod and verify its build. Main promotion still requires the user's separate explicit command and the complete release procedure.
