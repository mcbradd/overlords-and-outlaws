> **Player correction, 17 September 2026:** Recall scaling correction: a Court person may face one Recall attempt per round across all rivals, not one per rival. The attempt is consumed when Recall is committed, regardless of defense, and resets at the next round. Preserve marriage-only foreign Court entry, Played-only Trade and the claim-and-hold victory.

> **Superseded candidate - player correction, 17 September 2026:** The user rejected unrestricted Court entry: foreign cards must enter through marriage. Trade may request only a rival's face-up Played/Resting cards. The any-card Add / no-marriage candidate below is historical planning evidence and must not be implemented as written. See [the current correction and regression tasks](reviews/BUILD-5-PLAYER-FOLLOWUP-2026-09-17.md). Its dependent tutorial, state and acceptance package requires redesign before implementation.

# Suit and rank — Build 6 binding evaluation rules

17 September 2026. **Selected for implementation planning and adversarial evaluation; not a claim of proven enjoyment.** This is the consolidated D-open/refill-to-two candidate with mandatory card play. The production plan, test contract, tutorial contract and frozen visual inventory must be committed before implementation. Previous Build 5 rules are archived in reviews/SUIT-AND-RANK-BUILD-5-SUPERSEDED.md. The panel's abandoned alternatives remain evidence in the review record, not optional rules.

## Player-facing core

- Goal: **Keep three ranks in a row until your next turn.**
- Turn: **Play one card.**
- Add: **Put this person in your Court.**
- Swap: **Offer this person for a rival of the same suit.**
- Answer: **Play a neighboring rank of that suit to keep your person.**

These lines require physical examples: a three-card run; the offered and targeted cards; the two possible answer ranks. They are not permission to omit a necessary rule from the example. If the visible example still needs a paragraph, reopen the mechanic.

## Components and meaning

Two to four players use that many selected thirteen-card Dynasty suits. Keep the existing 52 identity/rank allocations and original portraits. Ranks follow the printed ring A–2–3–4–5–6–7–8–9–10–J–Q–K–A. Adjacent means one step on this ring; A neighbors both K and 2. Rank is a game relation, not genealogy, historical worth or combat strength.

Each player has a public Court, private OUTLAW hand and public Resting area. Use a shared face-down supply, a physical active-seat marker and a Crown marker for each Court currently containing a run. Reference/production card geometry remains 63:88. A small printed rank-ring aid carries the common relation; no seals, health, resource points, successor markers, marriage cords, round counter or puzzle track.

A Court can contain people of any printed Dynasty. It represents a mixed political Court, not a claim that unrelated historical figures shared a biological lineage. Printed suits still determine threats and answers. Choosing a starting Dynasty chooses a founder and the included deck, not exclusive ownership of that suit. Identical procedures are a deliberate clarity-first evaluation choice. Historically asymmetric abilities, the missing proposed Dynasty sheet, marriages, Interregna and Eudoxia remain deferred; none is promised as implemented or proven unnecessary forever.

## Setup

Choose distinct starting Dynasties and a first seat. Each player exposes that Dynasty's Founder; it has no immunity or continuing ruler office. Shuffle all remaining cards of the selected suits together. Deal exactly two private cards per player clockwise. No prebuilt run or other component is silently placed. The tutorial uses a visibly labeled prepared deal with the same legal setup.

The engine uses a deterministic seed; ordinary setup supports rotating/choosing the first seat without exposing a prepared outcome. Normal solo policy and private local handoff use identical rules.

## Complete turn and availability

At the start of a seat's turn:

1. If that Court still has a Crown, that player wins immediately.
2. Return all of that player's Resting cards to their hand. These returned identities remain public knowledge.
3. Draw from the supply until that hand contains at least two cards or the supply is empty. A hand already containing two or more draws nothing. A newly drawn identity is private. This is a refill, not a hand ceiling.
4. The player must use one held card to Add or Swap. If no card is held after refill, advance automatically; do not require a meaningless Pass click.

Resolve any Swap answer completely before advancing clockwise. There is no end-turn draw, global round, rotating round starter, voluntary Pass or artificial turn cap. Canceling an uncommitted preview returns to the same required decision; it does not advance the turn. An incoming player may still choose not to answer even when a legal answer is held.

An all-empty terminal prevents an automatic loop: if supply, all hands and all Resting areas are empty and no Court has a Crown, end as **No Crown — draw**. Otherwise skip empty seats in order, preserving Crown checks and normal refill. This terminal reflects no remaining playable card, not an external clock. Other deliberately repeated play can cycle; no claim of guaranteed finite games is made. Repeated nonprogress under competitive policies fails the playtest gate.

Resting cards are face up, owned by the controller of that area, and unavailable until that controller's next turn begins. No card disappears or enters a discard pile. An empty supply never reshuffles. Full source deck conservation is required after every action and transition.

## Add and the Crown

Any held person may enter the acting player's Court, with printed rank/suit unchanged. Court cards do not initiate hand actions. Duplicate ranks are legal but do not count as different ranks in a run.

A run consists of three different consecutive rank positions on the ring. Suits may differ. A–2–3, J–Q–K, Q–K–A and K–A–2 are examples. Any larger collection containing at least one such run qualifies. Mark the Court with a Crown immediately after the Add.

After every resolved action, remove a Court's Crown if it no longer contains any run. Removing one person need not break a Crown when another run or duplicate-rank person still supports it. The preview must state the actual public consequence. Do not bind the win to an arbitrarily chosen hidden or highlighted trio.

A new Crown is only created by the owner's Add. Opponent actions only remove Court cards, so they cannot secretly create a new qualifying run. Any run surviving to the owner's next turn existed throughout the response window. Each other player receives one ordinary turn, including any legal responses, before that check. Several Courts may show Crowns; clockwise turn order determines which intact Court wins first. No simultaneous hidden priority is introduced.

## Swap and Answer

From a held card, choose any person in a rival Court with the same printed Dynasty suit. Target rank is not an eligibility or strength test. The offered rank matters because it determines possible answers and the rank donated on success. Target rank matters because removing it changes public runs and taking it changes the attacker's future options.

Commit the offered person visibly; the target controller alone answers once. A legal Answer is a held card of the offered suit with either neighboring rank on the ring. No higher/lower comparison, special Ace rule, Queen-role exception or counter-answer exists. An invalid selection reveals and spends nothing.

If answered: offered person rests with the attacker; answer rests with the defender; target stays in Court.

If not answered: offered person rests with the defender; target leaves Court and rests with the attacker. Both cards keep their printed identities and become available at their new owners' respective next turns. The defender accepts this transfer through a button naming the incoming person, with the same meaning in preview, confirmation and outcome. Choosing not to answer must never be labeled with a contradictory verb.

No once-per-target counter is needed: the actor has only one card play this turn. A defender's answer does not spend their future ordinary turn. The public pending action exposes only the committed offer/target and possible answer ranks, never whether a hidden answer is actually held.

## Why both rank and suit matter

With Court 4/5 and hand 3/6 of suit S, Add 6 keeps S3 to answer a known S2 lead; Add 3 keeps S6 to answer known S7. Both Adds complete a run. Unknown cards remain uncertain. Changing a public threat can reverse which rank should be exposed without changing legality.

With rival Court S3/S4/S5, offered S2 can be answered by SA, while S6 can be answered by S7. A remembered answer changes the preferred offer. Taking an endpoint can deny the recipient an immediate rebuild using the donated lead; taking the middle can disrupt several overlapping runs. Test these consequences under mixed suits and all known defenses rather than assuming one target is best.

With Court S4/S5 and hand S6/T6, either Add completes a run. T6 admits T-suit attacks; S6 preserves one-suit exposure. Keeping an answer in hand can reverse that apparent preference. Suit spread has a visible cost and an additional route to completion, not an automatic diversity bonus.

Mandatory play means the player cannot preserve every hidden option. It replaces free hoarding with a choice of which person to expose or offer. Refill rewards spending into the Court without awarding more cards for waiting. These are testable design hypotheses; forced exposure, small-hand scarcity and shields remain explicit failure risks.

## Removed mechanics and reasons

| Former mechanism | Decision and reason |
|---|---|
| Succession notice/reign and original supporter | Replace with one visible run and one complete response window; current two-stage dependency lesson failed the family review. |
| Native-only recruitment and foreign marriage | Any-card Add supports active acquisition and avoids native-card circulation locks; mixed suits expose distinct threats without a separate marriage exception. |
| Queen role as a power; Ace beats faces | Remove mechanical exceptions; historical roles remain factual labels, ring adjacency is uniform. |
| Exact-name Trade and immediate lower-native recruitment | Remove from this candidate; all captured people can contribute to the captor's Court, so active progress does not require voluntary native-card bargains. Preserve the control's positive trade evidence for comparison. |
| Higher-rank combat | Neighbor answers create conditional matches without a permanent highest-card shield. |
| Seals, paid Draw, Cover/Help/Challenge/Withdraw | Remain absent; hand cards carry the two initiating moves and the response. |
| Consecutive Pass and round resets | Remove; one card play per turn, individual return/refill, ordinary clockwise order. |
| Voluntary Pass | Remove after explicit cross-defense; no cosmetic rank payment added. Empty-hand advance is a neutral procedure. |
| Round cap and external puzzle/event clock | Remove from the no-clock baseline. Test pressure from mandatory commitment and refill before adding any independent countdown. |
| Permanent discard | Absent; transfers preserve every card. |
| Dynasty-specific powers | Defer explicitly for this core comparison; do not invent historical rosters or asymmetric claims. |

## Required falsification before acceptance

Test initial two-card choices, all thirteen runs and wrap boundaries, conditional exposure/offer/answer positions, duplicate-rank resilience, mixed-suit vulnerabilities, no native-card acquisition lock, compulsory exposure recovery, answer-coverage shields, repeated Swap cycles, empty-supply/all-empty outcomes and 2/3/4-seat response windows. Policies must see only public information and their own hand. A fresh learner must explain the goal and immediate exchange using the rendered cards, then complete ten ordinary games. Physical-device and family-human validation remain separate evidence. The full production plan defines the tests and visual inventory before implementation.
