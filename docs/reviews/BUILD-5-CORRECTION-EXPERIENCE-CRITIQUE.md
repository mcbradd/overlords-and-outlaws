# Build 5 correction-cycle experience gauntlet

17 September 2026. Draft recommendation, not an implementation freeze. Reviewed candidate: 7e521f8b29d704291f00af3a9db245fddae00b94; browser 152.0.7977.83. This is an adversarial agent design exercise, not a panel of human experts or family validation. The ten-game cohort remains incomplete at this writing. No agency conclusion below overrides its pending evidence.

## Evidence actually inspected

I opened 1,060 individual rendered captures at legible resolution: six portrait phone sets (612 images), plus 112 each at 1366×768, 844×390, 768×1024 and 1024×768. Per-image candidate, path, verdict and finding live in artifacts/core/build5-visual-review/experience-portrait.json, experience-desktop1366.json, experience-landscape844.json, experience-tablet768.json and experience-tablet1024.json. The ledgers distinguish a visible control from an interaction actually exercised. Static screenshots do not prove animation, focus traversal, physical keyboards or player comprehension.

The strongest failures are information failures. The 768×1024 tutorial repeatedly corrupts portraits in ordinary states, including 010, 032, 036, 037, 039, 041, 042, 044 and 051; the 1024×768 lower Henry III corrupts in 059–064 and dense 074 blanks much of the upper Courts. Recall lines cross Draw labels and unrelated portraits. Returns labels cross neighboring card edges. On phones, Watch can name an unseen rival and teach absent card backs. At 844×390 the multi-line Recruit / Name heir caption falls below the viewport in 093 and 095. Terminal states still advertise future turns. Some raw import errors are below the modal fold. All these fail even when the corresponding automated viewport case passed.

## Competing design positions

### The conservator: keep the system; expose its physical facts

Claim: the current native succession, foreign Recall and reserved defense already produce recoveries and uncertainty. Fix corruption and frame the right cards, add visible pass markers and an inspectable public Played spread, then test before removing rules.

Defense: avoids losing evidence from the current cohort; a visible three-person claim and movable Crown can explain a temporal goal better than text. A remembered public card is not a new hidden-information rule.

Attack from the family-game reviewer: the current Trade contains an asymmetric lower-native immediate Recruit option; Queen means a role different from Q; marriage adds adjacency, native/foreign restrictions and support-collapse rules. Showing those branches clearly still leaves those branches to learn. A new paragraph, tooltip or additional lesson cursor does not meet the binding family gate.

Decision: support conservation of the uncertain lead/answer decision and identity circulation. Reject blanket retention of every special rule merely because an expert agent can navigate it.

### The simplifier: make each card move do one thing

Candidate Trade: “Swap these two cards; both return next round.” Show the offered and requested cards side by side. Remove the bundled lower-native Recruit option in the candidate experiment. This is not yet a binding change.

Defense: removes asymmetric timing and an extra mode from the same consent decision. The negotiation still trades exact ranks, suits, future access and public information.

Challenge: delayed exchange may be too weak versus passing or immediate Recruit, especially near a round boundary. Acceptance may lose most of its upside. Compare the same legal public situations with and without immediate Recruit; require at least one mutually rational exchange and one rational refusal explained without secret-hand access. Reject simplification if it produces a dead action unless a simpler replacement earns its place.

Candidate marriage: let a foreign heir pair with an existing native supporter of matching or adjacent rank, independent of the historical Queen role. “Pair this foreign heir with a matching or next-door rank.” The pair visibly carries its required relationship. Historical Queen labels remain accurate flavor.

Defense: removes the Queen/Q collision and gender-role bookkeeping, retaining rank compatibility, two-suit exposure and exact-card demand.

Challenge: it may make nearly every foreign card a free substitute for a native heir and erase distinctive requirements. Compare native and foreign claim alternatives, adjacency boundaries and post-capture recovery. Require examples in which both routes have a genuine tradeoff. This proposal is simpler than teaching Queen role and Q rank as separate operative categories; it is not acceptable solely because it adds more legal actions.

Decision: prefer these candidates for bounded paper/fixture comparison before freezing C07/C09. Do not silently repair only matching/adjacent wording and call the mechanic accepted.

### The round editor: end the repetition, keep the reservation choice

Candidate A retains reversible Pass, but uses one public pass marker per seat; a card play clears the line. “When everyone passes in a row, the round ends.” No new resource is spent.

Candidate B makes Pass end that player's initiatives for the round while retaining their right to Defend. “Pass to finish your turns; you can still defend.” Once all players have finished and the pending answer resolves, the round ends.

Defense of B: fewer resets and fewer repeated clicks; preserving a defense is still useful. Its cost is surrendering the possibility of acting after seeing later developments, an actual strategic commitment.

Counterattack: B changes the game substantially, may favor players acting later and may make an early defensive pass obviously wrong. It also needs a visible finished marker and distinction between initiative and response. A shorter sentence is not proof of a simpler choice.

Decision: prefer A unless the cohort and controlled 2/3/4-player comparisons show that resets create mostly empty waiting. Test B separately rather than adding it to production as a pacing patch.

## Succession: simplify its visible clock before collapsing its purpose

The Crown transfer is the theme's defining act. Replacing it with an immediate generic victory would remove the experience the user is trying to prove. Yet the existing old-ruler/heir/supporter dependency switch is expensive to teach.

Candidate presentation: a physical two-stage claim aid with the required people placed against it: “Name an heir, then protect their reign for one round.” The Crown itself changes owner at the round boundary; the old ruler visibly loses its required marker then. At any point only the current required people and next boundary are emphasized.

Acceptance is not the sentence alone. A fresh learner must point to who can be lost now, who succeeds next, and when a win occurs using the visible example without another explanation. If this fails, reopen the clock: compare immediate Crown transfer followed by one full protected round against the existing notice-plus-reign sequence. Record the lost window of counterplay before accepting the simpler timing. Do not automatically add more tutorial steps to teach the existing clock.

## Cross-review of the integrated correction plan

I support C02–C06, C10–C12 and C14 in principle, and the systems panel's public-knowledge parity. Known cards should be shown as publicly established, with a separate unknown count; do not imply that every hidden card is unknown or that a player's private hand was inspected.

C01/C13 must precede commitment to the current mechanics in C07–C09. Several existing tests presume the very rule being challenged: C07's immediate lower-native Recruit, COPY-01's Queen role and marriage range, and C08's 22-step curriculum. Make those conditional on the selected design; write the replacement state/boundary tests before implementation. The family gate must be able to reject a mechanic, not only its prose.

C05 needs named regressions for 844×390 093/095 captions and phone Trade Inspect clipping as well as the automated 360 failures. C02 needs ordinary tutorial snapshots at multiple layout heights, not only one dense screenshot. C04 needs visible post-Watch destination and arriving rank; framing the pre-action target alone does not pass. C06 must preserve the value and focus through resize, with a visible margin below the entire ring; a newly loaded shorter dialog is not the same test. C09 must remove terminal To act, pending-return labels and stale guide copy together.

## Prioritized proposed tasks and explicit acceptance

| ID | Deliverable before implementation | Pass/fail criteria |
|---|---|---|
| E01 | Close rules gauntlet after ten games; compare conservator, simple Trade/marriage and Pass alternatives. | Each ordinary move has one short sentence plus one actual visible example; record independent learner explanation; reject proposals requiring follow-up paragraphs. Include a conserved-state example, useful choice and counterexample for each candidate. No final agency decision before complete cohort. |
| E02 | Freeze selected rules and tutorial dependency path across all normative documents and aids. | Every changed move has legal/illegal, cancel, response, ownership, boundary and save/reload tests written before code. Deleted rule tests explicitly superseded. No contradictory card/menu/reference wording. |
| E03 | Reproduce and remove physical-card rendering corruption. | Open baseline and corrected exact scenes at 768×1024 010/032/036/041/051, 1024×768 059/074, and affected phones/desktops; repeat settled and moving camera. All face/rank/portrait pixels visually intact; original asset hashes unchanged. Diagnosis records hypothesis and evidence instead of presuming a depth cause. |
| E04 | Place physical public facts without obstruction. | Every Court/Played identity reachable; no Returns or Draw text overlaps cards or cords; Crown and per-attacker attempt markers distinct. Inspect first/last card in each Court and public pile by touch/keyboard; hidden contents never leak. |
| E05 | Show taught action in frame and preserve responsive control access. | For each legal tutorial transition, learner sees source, lead/answer ranks and destination before Continue; rival Watch cannot complete offscreen. Required 44px controls and full labels fit at all 21 sizes, safe-area variants, especially 360×780/800 and 844×390 093/095. No smaller text used to force a pass. |
| E06 | Replace redundant clicks with one guided decision at a time. | Count current and candidate interactions/duration; remove duplication only where it adds no new decision or observation. Continue never changes the board; no unexplained symbol or unsupported click is introduced. Fresh learner answers immediate consequence and objective without coaching. |
| E07 | Finish terminal/recovery/keyboard presentation. | Win/draw show no active-turn or future-return claims; restart accessible. Broken import focuses/announces a plain recovery message visible in the existing dialog. Name value, label, caret and full focus ring survive same-dialog resize with comfortable clearance; physical keyboard validation remains explicitly pending unless performed. |
| E08 | Re-run actual acceptance on exact candidate and publish Prod only. | Preserve all failed captures; complete full applicable suite and individually reviewed finite inventory. Distinguish static visual checks, browser interaction, blind agent play and unperformed family testing. Verify deployed SHA/build and actual actions; Main unchanged. |

These are proposed amendments to C01–C14, not a parallel permission to implement. The simplest proposal should win only when it preserves a meaningful uncertain choice and passes the family gate. Polished pictures cannot rescue a rule that needs a lecture; fewer rules cannot excuse a game with no worthwhile decisions.

## Reopened complete-game comparison after Malachy's full email

Read in full: knowledge-base/MALACHY-EMAIL-2026-09-17.md, including the scope note, and the updated FAMILY-GAME-DESIGN-GATE.md. This section supersedes my earlier claim that succession is a protected defining mechanism. It is not protected. Neither the published symmetric suits nor my previous conservative recommendation is settled.

The correspondence makes hidden hand leverage, exposed dynastic position, transferred power and historical composition valuable design questions. It does not require a particular clock, puzzle count, Queen rule or succession ritual. I therefore withdraw any argument that removing succession would necessarily remove the intended experience. We can test dynastic ambition through a much simpler public position.

### Shared minimal test kit for both complete candidates

These are complete abstract rule candidates for a paper or isolated fixture comparison, not instructions to change the shipping game. Historical composition cannot be finalized without the promised sheet and source checking. Use clearly labeled nonhistorical proxy suits while testing mechanisms; do not call them Malachy's selected four or attach invented historical powers.

Components: two to four thirteen-card suits; ranks A through K (A low); one ruler marker per player; shared face-down draw stack; public Court; private OUTLAW hand; public Resting area. Every card has one of three functional marks: Builder, Envoy or Raider. These are test functions, not claims about any historical person. Everyone uses the same three short procedures; different role distributions create strengths and deficiencies.

For a mechanical comparison only, two proxy compositions may be six Builders/four Envoys/three Raiders versus three Builders/four Envoys/six Raiders. Which actual historical people justify any function remains unresolved. Every suit must contain all three functions, and every rank must be assigned once. Freeze exact proxy allocation before testing so composition and starting deal can be reproduced. The asymmetric composition deliberately creates different access to the same verbs instead of thirteen unique exceptions.

Setup: each player exposes one native card as ruler and starts with two OUTLAW cards dealt from the shuffled remaining selected suits. The starting ruler does not fill a functional Court space. The goal uses three additional public people: one Builder, one Envoy and one Raider of the player's suit. Each turn starts by returning that player's Resting cards to their OUTLAW hand, then drawing one card if the shared stack has cards. Next choose one legal card action or Pass. Play moves clockwise. No permanent discard, round resets, consecutive-pass counters, special Ace defense, Queen-role marriage, named supporter or successor clock.

Card procedures:
- Any native OUTLAW card: “Place this person in your Court.” It can fill the matching functional space; extra people may remain public as reserves.
- Raider OUTLAW card: “Swap this card for a rival person of the same suit.” Choose an exposed rival person other than a setup ruler. The rival may answer with a higher same-suit OUTLAW card. If answered, lead and answer rest with their existing owners; otherwise lead rests with the defender and target rests with the attacker.
- Envoy OUTLAW card: “Offer this card for one card your rival chooses.” A recipient may reveal one proposed return or refuse. Initiator accepts or cancels. Accepted cards rest with their new owners; canceled offers leave hands unchanged. This avoids requesting a secret historical identity or secretly testing ownership.
- Any OUTLAW card can be the higher same-suit answer to a Raider. Builder's special opportunity is public development; retaining one still reserves its rank for defense.

Resting means face up and unavailable until its owner's next turn. Returning at each owner's turn is intentional: it replaces the old whole-round return/reset system. A player can inspect all resting identities. No private identity becomes public through an invalid or canceled defense. The setup ruler is protected only to avoid eliminating a player; challenge this protection as well if it becomes unnecessary baggage.

These procedures transfer every played attack, answer and bargain card between explicit zones without destroying power. Foreign Builders can defend their suit and be bartered; foreign Raiders threaten that suit's exposed people; foreign Envoys offer a bargain. Whether Builder's narrower initiating use is satisfying is a test question, not an assumed success.

### Candidate A: complete a public family, without an external clock

Win check occurs at the start of your turn, before returning Resting cards: “Keep a Builder, Envoy and Raider in your Court until your next turn.” Place a Crown marker when all three spaces are occupied; remove it if a required space empties. Having the marker at your next turn wins. There is no successor, marriage or separate notice stage.

Uncertain decision: exposing your native Raider completes your Court but removes that rank from your hand. A rival may have a same-suit Raider and force you to spend a higher answer. Keeping the Raider lets you threaten an opponent instead. A successful seizure grants a useful foreign tool while handing the defender your lead, changing the next threat rather than merely deleting progress.

Why it is teachable: the three spaces are the goal and the next-turn Crown is the entire clock. One visible attacker/answer pair teaches the rank contest. The initial lesson can show a legal native placement, a defended swap, and a three-space attempt; it need not reproduce an artificially long victory script.

Failure risks: attack/rest/return may still permit indefinite denial, a Raider-poor suit may lack interaction, a scarce Envoy/Builder may gate completion, and always building the cheapest person may dominate. This candidate intentionally has no artificial draw cap disguised as an intrinsic ending. Log and reject cycling or stalled sessions; do not claim guaranteed termination. The three-function completion may feel like collecting a set rather than building a dynasty. Ruler immunity may feel arbitrary. Removing succession loses a distinctive historical story; that cost must be weighed against comprehension, not treated as prohibition.

### Candidate B: the same public race under an independent warned deadline

Use Candidate A's exact setup, card actions, public spaces and next-turn Crown check. Add a shared six-space daylight track, beginning at zero. After the last seat finishes a turn, advance it once. At six, the game ends: an already crowned complete Court wins; if several remain complete, they share victory; if none does, everyone loses to the deadline. This final check deliberately differs from the ordinary next-turn check, and must be made visible before the last orbit. The first complete turn-start Crown still wins earlier.

The clock belongs to the game; no card targets it and no player owns it. The final space is face up from setup: “Build your family before daylight runs out.” This is a minimal independent-pressure candidate, not a claim about Eudoxia's historical identity. A single physical six-piece Eudoxia puzzle may represent the same clock, but only if players understand it as readily as the plain track. More puzzles add bookkeeping without an established decision benefit and should not be assumed.

Uncertain decision: with two daylight spaces left, holding a defense may keep you safe but fail to fill your missing function in time. A bargain that gives a rival their missing card can also get your missing card before the deadline. Denial that cannot lead to your own completion risks a shared loss. Compare this behavior to Candidate A using the same deals.

Failure risks: the final exception may cost too much teaching, and a common loss can reward spite rather than prevent it. Last-seat advantage, shared-victory collusion, fixed-time luck and role scarcity are serious objections. If the final rule needs a second explanation, replace it with a uniform start-of-turn deadline check giving each seat one last ordinary check; test the resulting fairness before accepting it. Six is only a test setting, not a tuned production value; compare four and eight after a baseline is recorded.

### Advance-warning Interregna: optional third experiment, not automatic scope

I oppose immediately adding a deck of unrelated calamities to either candidate. It would obscure whether the simple public race is good. After A/B establish their own value, compare one disclosed shared warning with no warning using identical state. The warning must identify a concrete exposed risk and permit two meaningful responses; it cannot simply demand the same obviously cheapest payment from everyone.

A possible laboratory warning is a forecast identifying one functional Court space that must be protected before the next orbit ends. Its exact protection rule is not specified here and therefore it is NOT implementation-ready. This is deliberately an open design question, matching Malachy's email. Reject it if it only adds a forced spend, arbitrary reversal, reading burden or an indirect weapon controlled by the leading player.

### Self-critique and cross-defense

My earlier simplified Trade still retained exact requests, public-memory bookkeeping and delayed exchange while removing the reward that may make Trade worth doing. The new Envoy proposal makes the other player choose their offer, letting bargaining emerge from visible cards. Its cost is an extra offer/acceptance exchange and potential repetitive refusal; measure this rather than calling it automatically simpler.

My earlier marriage proposal removed Queen-role confusion but retained adjacency, foreign support collapse and the entire succession clock. That is insufficient if the whole family objective remains hard to understand. Candidates A/B remove marriage entirely for the comparison. Historical marriages could later inform an Envoy's role without imposing a separate rule, but no invented roster is authorized.

The systems panel is right that the current cohort contains useful recovery and uncertain decisions. I support preserving that evidence, not preserving the rules by default. An expert agent's recovery from a failed three-person succession cannot certify a family-level explanation. Compare the current game as the control against A/B before rewriting production.

Between A and B, I provisionally favor A for the first comprehension test because it has one visible win clock. I favor B only if the independent deadline demonstrably reduces idle hoarding and denial without creating arbitrary loss or dominant last-seat play. I do not claim either candidate superior before tests. A renderer fix is necessary for all candidates, but cannot adjudicate their gameplay.

### Required additions before design freeze

1. **ALL-01 — Mechanic disposition table:** explicitly retain, replace or remove every old mechanism: succession, Crown timing, rank mapping, Ace exception, suit constraints, Queen role, marriage, exact Trade, bundled Recruit, attempt limits, Pass resets, shared return/draw, hand growth, ruler recovery, round cap, external pressure and event timing. Each decision cites a visible choice or a failure, not precedent.
2. **ASYM-01 — Composition evidence:** freeze labeled proxy distributions for mechanical tests; test rank/role overlap and shortages using those exact deals. Separately require the missing Dynasty sheet and verified sources before assigning production historical functions. Do not present proxy success as historical fidelity.
3. **PAIR-01 — Same-state comparisons:** author complete legal sequences showing build versus reserve, answered versus accepted seizure, accepted/refused barter and failed completion recovery for the current game and A/B. Include foreign cards and every role. Track card conservation and exact owners after each move; no silent discard.
4. **FAMILY-04 — Whole-game teach:** give a fresh reader only the goal board and current single-sentence move example. Ask what they can do, what they risk and how they win. Any extra paragraph needed reopens the rule. Test the complete loop, not isolated easy verbs.
5. **PACE-01 — Pressure earns its place:** compare A/no clock with B at six spaces using identical 2/3/4-player deals, then four/eight only if necessary. Record completed families, meaningful denials, idle passes, repeated states, offer refusals, seat advantage and perceived arbitrary deadline loss. Agent proxies do not establish family enjoyment.
6. **RANK-02 — Cheap-build dominance:** seek an actual position where exposing a higher native rank is preferable to the cheapest card, plus one where reserving it is preferable. If role availability merely forces the same choice, record it as constraint rather than strategic depth. Test every rank's attack/answer eligibility, including highest-rank impossibility of defense; reopen the rank rule if this dominates.
7. **POWER-01 — Transferred leverage:** after success and defense, independently name each resting card's owner and next availability from the physical arrangement. Verify all identities can be inspected, higher-ranked donated leads can be used by their new owner, and no hidden-hand leak occurs.
8. **WARN-01 — Optional warning gate:** no Interregna implementation until one concrete warned event, timing, alternatives and state tests are fully written. Compare to immediate resolution and no event; reject forced-payment or complexity-only variants.
9. **FREEZE-01 — Integrate one selected game:** after full cohort closure and comparative review, update normative rules, UI inventory, assets/reference requirements, tutorial dependency graph and all unit/browser boundary tests before implementation. Do not combine attractive fragments from incompatible candidates without replaying the complete game.

No code, content roster or production asset was changed by this review.

### Candidate procedure closures for reproducible comparison

In A/B, the setup ruler is each suit's Ace; its functional mark never fills a goal space. Thus the proxy functional composition must be assigned with that unavailable Ace accounted for. No other Ace-low exception exists. One turn permits one placement, one Raider attempt, one Envoy proposal or Pass. Refusal or cancellation ends that turn without moving either offered card. A recipient with no hand cards cannot receive an Envoy offer. Receiving a proposal does not consume the recipient's next turn. Only the targeted controller may defend; invalid choices do not reveal cards. A Raider may choose a reserve or goal-space person, but the setup ruler is not a legal target. Each missing functional space may be filled by another exposed native person with that same function; this happens visibly when a goal card leaves, rather than creating a second action. Crown completeness is checked after every resolved move. Newly acquired Resting cards return only when their current owner's next turn begins; the Crown win check comes first. A player whose hand and the draw stack are empty can Pass. These closures are part of the proposal, not hidden implementation choices.

## Second cross-challenge: A/B fail the rank gate as written

Read production-cross-review.md in the fixed release worktree. I accept the parent's objections. A/B should not be frozen: the Builder/Envoy/Raider distributions are only count asymmetry; low-ranked exposure is usually best; protected Aces are inert; exact Raider availability throttles interaction; owner-turn returns can feed repeated denial; and bargaining adds three decisions. More polished explanations do not repair those defects. The clock variant cannot repair them either.

### Bounded replacement C: a visible rank run with contested exchanges

This is a narrower comparison candidate, still NOT freeze-ready or a demonstrated family game. It borrows production's visible family-set idea, but rejects unspecified concessions and removes protected rulers, specialist attack roles and voluntary three-stage bargains.

Setup: two to four labeled proxy suits of thirteen unique ranks A–K; each player takes one suit, exposes one randomly dealt native card and receives two hidden cards from the remaining selected deck. The exposed card has no immunity or special office. Native means your suit. All cards can initiate; suits are not mechanically restricted by invented historical roles.

Goal: “Keep three next-door ranks of your suit until your next turn.” A–2–3 is valid; Q–K–A is not. Mark the exact three with a Crown when completed. If any one leaves, remove that Crown; a different qualifying three may immediately receive it. At the start of your next turn, an intact marked three wins. This one-turn delay creates a shared opportunity to interfere.

Start of turn: check Crown, return your Resting cards, draw one if available. Then either expose one native hand card, exchange, or Pass. No rounds or external clock. Empty draw stack stays empty.

Exchange: “Give a higher card to take a lower exposed card of its suit.” The defender can stop this with a still-higher hand card of that suit. Success sends the lead to the defender's Resting area and the target to the attacker's Resting area. Defense sends lead and answer to their existing owners' Resting areas. Both remain face up until their current owner's next turn. Any legal target is permitted, including the first exposed card. Only the target owner answers once; no counter-answer. Invalid choices do not expose a card. Passing or one resolved exchange ends the turn. There is no separate Trade or Queen/marriage procedure.

No promises, concession currencies, permanent discard, setup immunity or rank exceptions beyond ordered endpoints. Exposing and exchanging convert known ranked possibilities into public progress or transferred leverage. This is deliberately a stripped rank experiment, not yet a historically asymmetric product.

### Paired positions: where rank changes a voluntary choice

These examples are authored decision hypotheses; they have not been played. Both candidate actions are legal in each position. They must not be represented as observed strategy.

**Exposure pair:** Your native Court is 4 and 6; hand has 5 and 7. Both can be exposed, but 5 completes 4–5–6 while 7 leaves a gap. Change only the Court's 4 to 8: now exposing 7 completes 6–7–8 while 5 leaves a gap. Rank reverses immediate progress without restricting legal exposure. This meets a minimal rank relevance test; it does NOT establish an entertaining uncertain decision, because the completion is obvious. We need an actual counterexample where delaying that completion to keep a ranked answer has a better outcome.

**Exchange pair with the same target:** An opponent exposes native-to-them 4; you hold same-suit 5 and 9, either a legal lead. With their Court otherwise 6 and 7, donating 5 gives them a future 5–6–7 route while donating 9 does not; high lead can be worth surrendering. Change their other exposed pair to 7 and 8: donating 9 now supplies 7–8–9 while donating 5 does not. Low lead gains appeal. The captured 4 has the same value to you; the donation changes their future opportunities. These are competing values, not mathematical proof of a best move: hidden higher answers and alternate targets can reverse them.

**Defense pair:** You face lead 8 against exposed 6 and hold answer K. If your other exposed cards are 5 and 7 and your Crown is on 5–6–7, defend preserves a live win attempt. With Court instead 9 and 10 and no Crown, accepting gives you the lead 8 for next turn and a potential 8–9–10 route; defending preserves a less useful 6 and spends your K. Both answers are legal in both cases. Remaining opponent threats determine whether accepting is actually better. The point is to author and play both legal continuation trees, not assign a fixed protection score.

**Reserve counterexample still missing:** C does not yet prove a choice of higher versus lower exposed rank is uncertain rather than an obvious set-completion puzzle. No claim that all actions now have sufficient strategic depth is justified. This is a blocking empirical/design gap.

### Comparison with production's alternatives

Crown capture is promising because one public object makes the objective easy to point at. I do not support its proposed hold-to-advance track until a concrete state shows why holding is sometimes better and sometimes worse than a legal attack; otherwise it creates a compulsory scoring click. It also still lacks a complete protection/transfer procedure. C supplies a simpler victory position but may be more generic.

Family contest is closest to C. Its rival-choice-or-concession rule is presently incomplete; replacing it with an exchange plus one hidden answer makes the outcome defined and shows the exact transferred power. The higher-card donation creates a visible reason not to attack blindly. It also sacrifices freely negotiated Trade and may feel combative. Test rather than assume that is the right theme balance.

Succession duel should remain the control, not the automatic winner. It already has evidence of meaningful recovery; its dependency clock and low-heir preference remain unresolved family-gate costs.

### Remaining objections and recommendation

1. **Historical asymmetry is unresolved.** Rank runs with identical suits are symmetric machinery. Do not relabel C as historically differentiated. A proposed historical role distribution cannot be accepted without showing a qualitative choice unavailable to another composition and sourcing the actual people. The missing sheet prevents roster approval, not abstract comparison. Avoid quietly adding powers to C now.
2. **Ordered ranks create a dominant top end.** K cannot be taken by a higher lead and cannot be answered; exposure and attack power may concentrate around it. No Ace wrap patch is approved. Compare a bounded cyclic rank relation only if evidence shows this problem; it would add a teaching burden.
3. **Runs may amplify deal luck.** A missing middle rank can lock out completion. Exchanges only reach exposed targets, so hoarding that rank might stall the game. Do not add an unexplained deck clock to force an ending; reject or revise C if hoarding wins.
4. **Repeated denial remains possible.** Owner-turn return is simpler but not proven better. Log repeat-state exchange loops and compare acquisition to reserve. No claim of guaranteed finite completion.
5. **Target-rank and answer-rank are two comparisons.** The physical three-card example must explain both in one glance. If it requires a paragraph, this candidate fails too.
6. **Public asymmetry versus hidden uncertainty:** the concrete paired positions explain relevant rank values, but several are obvious tactical cases. They do not prove the user's top priority of uncertain choices. The next comparison must include unknown answers and actual competing continuations.
7. **Pass has no rank by design.** It is a turn procedure, not a card ability. If the requirement is that literally every action including Pass is rank-dependent, C does not satisfy it; do not manufacture a cosmetic rank cost to claim compliance.

Recommendation: withdraw A/B as proposed production bases. Compare current succession duel, a completed Crown capture rule and C on paper/fixtures, using C as the smallest rank-relevance probe. Keep no external clock as the default baseline. Do not freeze any candidate until the reserve counterexample, historical qualitative asymmetry, hoarding and family-teach gates are resolved. This is a bounded revision and a set of blockers, not an implementation request.

## Third cross-challenge: replace C's rank ordering with one ring relation

The J–Q–K counterexample is decisive. In C, every higher same-suit lead capable of attacking that set is already exposed inside it. The complete set is immune, not merely hard to attack. C's ordered-target rule is withdrawn without an exception.

### Comparison and selected bounded candidate

**Unrestricted target, defense-only rank:** any same-suit lead could take any exposed person; a higher answer blocks. This repairs the immune set and keeps attacks broadly available, but adds a separate numeric-strength relation beside the adjacency goal. K is an unanswered lead; exact target rank again has no role in targeting. The run goal can still make exposure contextual, so this is a valid comparison control, not disqualified solely because target rank is ignored.

**One cyclic neighbor relation:** arrange A–2–3–4–5–6–7–8–9–10–J–Q–K–A on a small printed ring. Adjacent ranks match. The same match builds a family, reaches a target and answers the reaching card. This eliminates higher/lower arithmetic and high-rank immunity rather than making another Ace exception.

I select the cyclic-neighbor version, **C-ring**, as the single next paper/fixture candidate. It is selected for a bounded falsification test, not approved for production. The unrestricted-target version is its one comparison control. Do not introduce another clock, bargaining rule or specialized card role during this test.

### C-ring: complete minimal rule proposal

Components and setup: two to four proxy suits, thirteen unique ranks per suit, shared shuffled draw stack, public Court, private hand labeled OUTLAWS and public Resting area. Each player exposes one random native card and starts with two hidden cards from the remaining selected suits. No ruler immunity, historical role power or external clock. Each selected rank exists exactly once. The printed ring is available to all.

Goal: “Keep three joined ranks of your suit until your next turn.” Three joined ranks are three consecutive positions on the ring: Q–K–A and K–A–2 are valid. Mark the exact three with the Crown. Any player whose marked three remain at the start of their turn wins. Check this before returning Resting cards or drawing. If a marked card leaves, remove that Crown; if another joined three is already exposed, mark that exact three immediately. Additional native exposed cards are allowed.

A turn: return your Resting cards to your hand, draw one if the stack has cards, then expose one native card, reach for one rival card, or Pass. Any one of these ends the turn after any response resolves. Empty draw stack stays empty. Clockwise order never changes. There is no reshuffle, global round, consecutive-pass count or rest limit.

Expose: “Add this person to your family.” Only a card of your own suit may be exposed. It may fill a gap, extend a run or sit apart; there is no legality requirement to join an existing rank. This preserves voluntary choices rather than making the goal dictate the sole legal placement.

Reach: “Offer a matching neighbor to take that person.” Play one hand card targeting an exposed rival card of the same suit and an adjacent ring rank. The rival may answer once with a hand card of that suit adjacent to the lead. The target itself is already exposed and cannot answer, so the other neighbor is the only possible answer. The aid shows lead between target and possible answer.

If answered, lead and answer go to their existing owners' Resting areas; target stays. If unanswered, lead goes to the defender's Resting area and target goes to the attacker's Resting area. All Resting cards stay face up and unavailable until their owner's next turn. Invalid choices spend and reveal nothing; no counter-answer. Only the target controller answers. Each person and lead retains its printed suit/rank after transfer. No discard pile.

Answer: “Play its other neighbor to keep your person.” Choosing not to answer is legal even when that neighbor is held. The target, lead and possible answer are displayed together using the one ring relation. No sentence about higher ranks or exceptional Aces exists.

There is no Trade verb. A successful Reach is the compulsory exact transfer; the defender's choice is whether to commit their hidden matching answer. There is no protected setup piece. Every suit can use the same procedures, and a foreign card can reach or answer its own suit. Historical asymmetry is explicitly not claimed by this abstract candidate.

### Fully legal paired positions

All cards below are of suit S unless another suit is specified; each appears in exactly one zone. These are authored tests, not observed games or proofs of enjoyment.

**P1 — Higher or lower exposure reverses without changing legality.** You own suit S; Court has 4 and 5; hand has 3 and 6. Expose 3 for 3–4–5 or expose 6 for 4–5–6: both are legal and both claim the same next-turn win window. In position P1a, the rival publicly showed S2 entering their hand and has one additional unknown card. S2 can reach exposed S3 but cannot reach S4/S5/S6. Exposing S6 removes that known attack. In P1b, change that remembered S2 to remembered S7; now S7 reaches S6 but not S3/S4/S5, so exposing S3 removes the known attack. The other hidden card remains unknown in both cases, so neither move is declared safe. For reproducible actual fixtures, its identity can be an off-suit card in both cases; the evaluating player must not be told it. This is a rank-dependent risk reversal, not a restriction on legal exposure or a numerical power advantage.

**P2 — The preferred attacking endpoint reverses with remembered answers.** Rival Court is S3/S4/S5 with a marked Crown; your hand has S2 and S6. You can reach S3 with S2, or S5 with S6, and either breaks the marked run if unanswered. The possible answers are SA to S2 and S7 to S6. In P2a the rival has publicly remembered SA and another unknown card: S6 attacks the less-certain defense. In P2b replace remembered SA with remembered S7: S2 attacks the less-certain defense. Again the hidden remainder is not disclosed. Both attacks are legal in both cases and use the same matching relation as P1. Card donation matters too: the defender receives your lead after success, changing their future gaps.

**P3 — The formerly immune J/Q/K set has legal counterplay.** Rival Crown marks SJ/SQ/SK. Your hand S10 can reach SJ, answered only by S9; alternatively your SA can reach SK, answered only by S2. None of these four outside ranks is already in the marked set. Both claims of immunity and guaranteed capture are false: the public run can be attacked, but a hidden answer may stop it. Repeat for all thirteen possible joined triples before accepting the rule; an automated exhaustive legality check supports but does not replace the shown physical examples.

**P4 — Defense can preserve or surrender public position.** Rival lead S6 reaches your exposed S5; your held S7 is the exact possible answer. With marked Court S3/S4/S5, answering preserves the current Crown. With no Crown and Court S5/S9, accepting acquires S6 next turn and preserves held S7, opening an S6/S7 path, while answering keeps S5 exposed and rests S7. Both responses are legal in both positions. This demonstrates different consequences, not proof acceptance is better: the draw, other player's Crown and public attacks must be included in played continuations. Do not convert this into an always-defend/always-accept heuristic.

### What this resolves, and what still blocks production

C-ring removes the concrete immune set, makes low/high exposure contextual, and uses rank as board position in goal, attack and answer. Suit determines which family grows and which exchange/answer can match. The three-card physical example is the teaching test: if the ring or 'other neighbor' needs another paragraph, reject this candidate instead of hiding explanatory text elsewhere.

It does not yet resolve meaningful historical asymmetry. Identical rings with different names are symmetric. Do not manufacture new role distributions or assign historical people powers to make the checklist pass. The next sourced composition design must produce genuinely different opportunities without breaking this simple interaction; until then C-ring is only the abstract interaction probe.

Exact neighbor access may still make too many turns inert with two starting cards. Test opening hands, missing ranks, off-suit usefulness and all four seat counts. Resting until the owner's next turn can still create denial loops. Test repeated states and opponent recovery; do not claim finite termination or add a cap as a hidden success criterion. Filling a three-card run may be too fast or overly dependent on luck. If the one-orbit response window is unfair by seat count, the candidate fails its complete-game test.

No-clock is the baseline. No Eudoxia/Interregna comparison should begin until this underlying interaction either earns continued work or is rejected.

### Bounded next decision

Author and physically play P1–P4 plus all thirteen triples with exact card conservation. Then compare C-ring and unrestricted-target/defense-only-rank on the same small set of two-, three- and four-seat deals. Record whether a fresh learner predicts the neighbor answer, whether both exposure choices receive serious consideration, whether transferred leads change later plans, and where play stalls. Select or reject C-ring after this comparison; do not respond to a failure by accumulating further untested variants. The full published ten-game cohort remains separate evidence.

Parent-reported control evidence, not executed by this reviewer: artifacts/core/rank-choice-probe.ts/json contains four invariant-valid existing-reducer states with ruler 2, supporter 3, hand A/Q and known rival K versus 10. Against K, Q heir/A reserve survives while A heir/Q reserve fails; against 10, the result reverses. This refutes universal lowest-heir dominance in that local constructed case. Reachability, frequency and whole-game optimality remain unproved. Preserve the conditional reservation principle when comparing C-ring; this does not justify retaining an Ace exception by precedent.
## Fourth cross-challenge: candidate D — open targets, neighboring answers

C-ring's target restriction is withdrawn as the next candidate. Production's reported opening analysis found 38.56% forced Pass with four players and two starting cards, and 23.47% even after an extra first draw. Those are parent-reported calculations, not tests executed by this reviewer. Giving a third card before the first decision would also abandon the requested two-card opening. Do not quietly tune around these failures.

Candidate D is a new complete proposal. It combines unrestricted same-suit targets with the ring-answer relation and a three-rank goal; it does not inherit unmentioned C-ring rules. It is not approved for implementation.

### Complete candidate D

Use two to four suits of thirteen unique cards, one of each rank A–K. The common printed ring joins A–2–3–4–5–6–7–8–9–10–J–Q–K–A. Each player owns one suit. Each has a public family (Court), private OUTLAW hand and face-up Resting area. A common shuffled stack contains the undealt selected cards. There is no discard pile.

Setup: randomly expose one card of each player's own suit in that player's family. Deal exactly two hidden cards per player from the shuffled remaining selected cards. Choose the starting seat randomly. There is no setup ruler office or immunity. The first decision has exactly two hand cards.

Win: “Keep three joined family ranks until your next turn.” The three must be consecutive on the ring and of the player's own suit, including Q–K–A or K–A–2. When a player's family contains such a triple, place their Crown marker. This marker records continuous possession of at least one complete triple, rather than one exact named trio. Remove it if their family ceases to contain any complete triple after an action resolves. At the start of their next turn, a still-present marker wins before any other procedure. Multiple simultaneous triples need no separate choice or marker. A later reforming triple starts a new wait; it cannot revive a lost marker's timing.

Start: check for that player's win, then return all their Resting cards to their hand. Do not draw here.

Choose exactly one:
- **Add:** “Add one of your suit's cards to your family.” Any native hand card is legal; it need not join an existing card.
- **Swap:** “Offer this card for a rival's exposed card of the same suit.” Any hand card can target any same-suit card in another player's family, regardless of either rank. Reveal the lead and target together. No consent negotiation follows; the target owner may answer once or allow the swap.
- **Pass:** take no card action.

Answer: “Play a neighbor of the offered rank to stop the swap.” The answer must be in the target owner's hand, of the same suit, and one step either way on the ring from the lead. The target is exposed, so it cannot itself answer even when adjacent. Show both possible neighbor ranks next to the lead, not next to the target. No higher/lower ranking or special Ace exception exists.

If answered, lead and answer enter their existing owners' Resting areas; target stays in its family. If unanswered, lead enters the defender's Resting area and target enters the attacker's Resting area. Each keeps its printed identity and belongs to the player whose Resting area contains it. All Resting cards are face up and unavailable until that owner's next turn begins. Only one answer; no counter-answer. The defender can allow the swap while holding an answer. Invalid actions spend and reveal nothing. Recheck every Crown marker after resolution.

End: the initiating player draws one card if the shared stack has cards, then play moves clockwise. No draw is granted for responding. Passing also receives the normal end-turn draw. No draw occurs after a win. Empty stack means no draw and no reshuffle. Losing the last exposed person does not eliminate a player; Add can rebuild from their returned cards. If no card action is legal, Pass remains available. No hand limit, global round, turn budget, forced discard, external clock or special role powers.

The end-turn draw and Pass are table procedures, not rank-bearing card abilities. State this honestly: rank governs the card decisions and visible goal, while the draw supplies the next choice. Calling compulsory draw a card power or adding a decorative rank cost would hide the design. If the user's intended standard forbids such neutral procedures, this candidate must be rejected openly rather than relabeled.

Historical asymmetry is deferred in this candidate to prioritize clear, meaningful interaction. It is not represented by cosmetic names or invented role counts. The correspondence's unanswered composition question stays in the design record. No absent Dynasty roster is assumed. A later asymmetric version must outperform this simpler baseline on decisions and teaching cost before its historical opportunities are implemented.

### Paired legal tests that reverse rank-based choices

All S cards below are the same suit and each occupies exactly one zone. These are authored tests requiring execution, not claimed playtest results. Other cards may be off-suit; no hidden identity is exposed to the evaluating player.

**D1: expose low versus high while retaining a response.** You own S; family S4/S5; hand S3/S6. Both Add choices form a triple and Crown. If the next rival has publicly remembered S2, adding S6 retains S3, a neighbor answer to S2; adding S3 leaves S6, which cannot answer S2. Thus the high exposure preserves a defense. Replace remembered S2 with remembered S7: adding S3 retains S6, which answers S7; adding S6 leaves S3, which cannot. Thus the low exposure preserves a defense. The rival may target any of your three exposed people; that does not erase this reversal. An unknown extra rival card can still defeat either plan, so the known lead changes risk without guaranteeing safety.

**D2: choose an offered rank against uncertain defense.** Rival's family is S3/S4/S5 with a Crown; your hand S2/S6. Both leads may target any one of the three. If rival publicly remembers SA, it can answer S2 but not S6; if instead it remembers S7, it can answer S6 but not S2. The unknown portion of the hand remains concealed. Each offered rank is therefore valuable against a different visible threat profile; neither is universally strongest.

**D3: target rank matters even though every target is legal.** Rival family S3/S4/S5; your lead S2. Taking S3 leaves S4/S5 and donates S2, which cannot rebuild a triple with those two on their next turn. Taking S5 leaves S3/S4 and donates S2, which can immediately rebuild S2/S3/S4 when added. Thus removing S3 denies the obvious donated-card recovery, while taking S5 can be worth it only if you value acquiring S5 more. Change your lead to S6: taking S5 now leaves S3/S4 plus returned S6 with no immediate triple, while taking S3 leaves S4/S5 and supplies their next S4/S5/S6. The preferred denial endpoint reverses with the offered rank without changing target legality. Defending can still foil either attack; the pair is a consequence comparison, not a proof of whole-game optimality.

**D4: J/Q/K is not immune and K is not a permanent shield.** A family SJ/SQ/SK may be targeted using any other S rank in a hand. Lead S6, for example, can take any member; possible answers are S5/S7. A held SK answers only SQ or SA leads, not S6. There is no universally blocking rank. A specific remembered answer can still block its two neighboring leads repeatedly after returning, which is a strategic/pacing risk to test.

### Direct attempts to falsify D

**Opening inactivity:** with one exposed card of each selected suit, every native hand card can Add, and every foreign hand card has at least one rival same-suit exposed target. Therefore a valid ordinary initial two-card hand has an initiating action without an extra draw, regardless of rank. This is a logical claim for setup only; exhaustively validate actual setup invariants before claiming a tested percentage. Later foreign cards can become inactive if their suit's owner has no family.

**Repeat-defense loop:** a player holding S7 can answer the same S6 lead each orbit because S7 returns before their next opponent acts. Swapping targets does not help because the answer depends on the lead. New end-turn draws may provide a different lead, but an empty stack removes that escape. This can produce a genuine repeated-state stalemate. D has no rule claiming guaranteed termination. A matched empty-stack loop test is mandatory; if ordinary play commonly reaches it, reject or revise the circulation before production. Do not use an arbitrary cap as proof of a successful ending.

**Hoarding:** the holder of a missing middle card can deny a rival's run indefinitely by keeping it hidden; Swap cannot touch a hand. End-turn draws reward Pass early and can inflate hands. No-clock baseline does not mean ignoring this problem. Compare Add, Swap and Pass policies, inspect held-key-rank states and record whether other ring triples permit credible alternative wins. An unbeatable key-card lock or a dominant Pass-until-stack-empty strategy blocks D.

**Answer coverage:** one card covers two lead ranks; several hidden cards may collectively cover most or all available leads. A late large hand could become an effective universal shield even though K alone is not. Test minimum covering hands with the public target cards excluded and compare whether growth creates untouchable Crowns.

**Immediate recovery:** D3 exposes a useful rank decision, but constant target removal and donated-card rebuilding may produce repetitive play instead of satisfying negotiation. Observe complete games, not only favorable two-move examples.

**Goal luck and seat count:** three joined ranks may appear too easily or too rarely, and a three-opponent response window may punish four-seat play excessively. Record starting deals, first Crown opportunity, interventions and turn count separately by seat count. Do not increase target count or add a clock before explaining the observed failure.

**Teaching:** Swap sounds voluntary in ordinary English but here has an Answer/Allow response rather than negotiation. Test the displayed lead/target pair and the one answer sentence. If learners expect the offerer's consent after seeing the response, change the verb or reject the procedure; do not add a negotiation paragraph. A ring aid that requires repeated searching also fails the clarity gate.

### Bounded next gate, before a production freeze

Execute D1–D4 with the real card identities mapped to a labeled test fixture, plus the opening-action proof, empty-stack repeat-defense, hidden-key-rank hoarding and late-hand answer-coverage attempts. Use invariant-preserving transitions and record whether authored states are reachable from a legal setup. Compare reachable small matches against the completed published cohort, keeping both evidence sets distinct. Freeze D only if it survives these failures and a fresh learner can explain its goal, current choice and answer from the visible example. Otherwise reject it; historical and external-pressure features do not rescue a broken base.

## Final bounded recommendation after cohort closure: reject D's native-only circulation; test D-open

I read the complete ten-game record and sixth-grade assessment in artifacts/core/blind-build5/observations.md. The observed 8 wins/2 losses are one adult agent cohort, not family validation. Games 1, 3, 5, 7, 8 and 10 give concrete evidence that acquiring held native cards and removing known threats through Trade mattered. Removing hand barter was not justified merely by counting its clicks. The assessment criticizes unfamiliar dropdown identities and asymmetric delayed/immediate effects; it does not establish that showing an offer, a return card and accepting is intrinsically too complicated.

### Exact D circulation lock

Consider a two-suit empty-stack position with no Resting cards:
- S player's family: SA, S3, S5, S7, S9, SJ, SK. S player's hand: T2, T4, T6, T8, T10, TQ.
- T player's family: TA, T3, T5, T7, T9, TJ, TK. T player's hand: S2, S4, S6, S8, S10, SQ.
All 26 unique cards occur once. Neither family contains three consecutive ring positions, including across K/A. Neither can Add under D because every held card is foreign.

S Passes; T Passes. With no stack or Resting cards, the exact position repeats after one orbit. Repeat indefinitely; no Crown appears.

More strongly, fix T's strategy to never initiate Swap. S's own Add cannot acquire a missing S card. Any S-initiated Swap moves only T-suit cards: it gives T a held T-even and receives an exposed T-odd. S's total controlled S cards therefore remains the odd set, regardless of which targets, answers or subsequent Adds T chooses. S cannot complete an S run unilaterally. The symmetric statement holds for T if S never initiates Swap. Both can ensure the other cannot force them to donate its missing native card, while neither can force its own win. This is a mutual nonprogress/nonloss strategy lock; it is not a claim that infinite play is a desirable utility outcome for a family.

A concrete attempted escape makes the problem visible:
1. S offers T2 to take exposed T7.
2. T has only S-suit cards in hand, so cannot answer T2; transfer succeeds. T2 rests with T; T7 rests with S.
3. At T's turn, T2 returns; T Adds it beside TA and T3 and marks TA/T2/T3.
4. At S's turn, acquired T7 returns, but it is foreign and cannot Add to an S goal. S must attack to delay or Pass. No S rank was acquired.
This target distinction changes how much S helps T; it never solves S's acquisition invariant. Under D, all S-initiated attempts remain trapped in T-suit circulation.

The state is invariant-valid. I have not established a legal shuffled-start path to it, and do not label it reachable without that proof. Its mechanism is nevertheless a structural circulation failure, not a vague hoarding possibility. A reachability probe is still required for frequency and production severity.

### Why simply restoring consensual Trade is not a proven cure

A visible hand bargain could restore active acquisition: show T2, receive a proposed S2, accept or refuse. Three physical choices can be intuitive. This deserves respect as an alternative, especially given the cohort.

But voluntary refusal still permits the exact partition lock, and offering each player an immediately completing card may give the next seat the first protected-win opportunity. Adding consent alone does not prove progress or eliminate coercive incentives. Immediate versus Resting transfer and timing would need another decision. I therefore do not recommend bolting barter onto D and declaring the circulation repaired.

### Selected minimal repair: D-open

Retain D's complete turn, unrestricted same-suit Swap, ring-neighbor answer, power transfer, Resting timing and no-clock baseline. Change exactly these two restrictions:
1. Any hand card may be Added to your family, regardless of its printed suit.
2. A winning family is three consecutive ring ranks, regardless of their printed suits.

The complete goal sentence becomes: “Keep three neighboring ranks in your family until your next turn.” Each card retains its Dynasty suit for Swap targeting and answering. A mixed family is a deliberate new design choice; it does not pretend to be the old native dynasty or add hidden marriage prerequisites. Remove 'native' ownership vocabulary from ordinary choices. The initially exposed card can still come from the chosen setup suit for identity, but it gains no immunity or mechanical privilege.

A turn still checks an existing Crown, returns that player's Resting cards, performs one Add/Swap/Pass, draws one at turn end if possible, then advances clockwise. Setup still gives one exposed person and exactly two starting decision cards. Swap may target any rival exposed card of the lead's printed suit; an adjacent-rank hand card of that suit may answer. Answered lead/answer rest with current owners; unanswered lead/target rest with new owners. No discarded power, external clock, new exception, negotiation subturn or protected ruler is added.

In the exact locked position above, S can now Add T2 and mark SA/T2/S3. T gets a genuine intervening chance to Swap or build; the no-attack strategy no longer prevents S's progress. This does not prove a forced win, and it should not: uncertain opposition is the purpose. It proves the former acquisition invariant no longer blocks the goal.

### Suit and rank still change decisions

D1's same-suit Court4/5, hand3/6 and remembered lead2 versus7 remains legal and still reverses which card preserves an answer. D2's lead2/6 versus remembered A/7 remains unchanged.

D-open adds a voluntary suit-risk choice: with exposed S4/S5 and hand S6/T6, both Adds complete ranks4/5/6. Against remembered T9, adding S6 gives that lead no matching target among the triple; adding T6 exposes the new third person. Against remembered S9, either line still leaves S4/S5 vulnerable, so claiming that T6 completely protects the goal would be false. Test full triples and remaining hand answers rather than rewarding superficial suit diversity. Mixed families can broaden vulnerability while also letting players use formerly dead cards; neither all-one-suit nor all-mixed is declared dominant.

Target rank still matters through D3's run removal and donated recovery, but the mixed-suit repair means acquired cards can now be Added by the attacker too. Re-execute the paired continuation trees under D-open; do not recycle D's consequence claims without checking the new legal options.

### Remaining objections

Mixed families may weaken the historical dynasty identity, and symmetric suits remain a deliberate clarity-first deferral rather than promised asymmetric fidelity. This is an honest cost to compare, not a reason to invent historical relationships.

Any-card Add could make the goal too easy or too lucky; multiple suits duplicate rank opportunities. It could also make Pass nearly irrelevant before the stack empties, which is acceptable only if Add versus holding/Swap remains meaningful. Repeated defense and large-hand cover shields can still stall. The ring example and three-card answer may still be harder than an ordered contest for families. None of these is repaired by the logical removal of the native lock.

### Final bounded experiment plan before selecting a production game

1. Freeze D-open's exact written rules and one control: D plus simple visible consensual hand barter, with a fully specified timing chosen before testing. Do not add role powers, Eudoxia, events or another candidate during this comparison.
2. Execute the exact partition state: verify D repeats under Pass, D-open permits Add to a threatened Crown, and the barter control only progresses when a bargain is accepted. Distinguish invariant-valid from reachable.
3. Establish at least one legal setup-to-late-game path for the partition mechanism or record failure to find it. Preserve actions and exact ownership.
4. Re-execute D1–D4 and mixed-suit Add choices with real physical card examples. Require a fresh learner to name the offered card, possible answer, new owners and goal without coaching. Separate tactical reversal from whole-game superiority.
5. Play a fixed small comparison of two-, three- and four-seat deals with two starting cards. Record Add/Swap/Pass choices, accepted/refused bargains for the control, first-Crown timing, repeated states, draw luck, attack opportunities and defended versus accepted transfers. Use identical ordered decks where procedures permit.
6. Try to break D-open using Pass-until-stack-empty, lowest-rank Add, all-one-suit, mixed-suit and repeat-defense strategies. Counterexample-focused sequences are required; an aggregate win percentage cannot pass the gate.
7. Select D-open only if the tradeoff is understandable and the matches contain meaningful alternatives. Otherwise reject it and retain the published game as evidence, not as an automatically approved fallback. Historical asymmetry remains deferred unless a sourced small change earns its teaching cost.

Recommendation: reject D as specified; choose D-open for this bounded next experiment, not production. Restoring barter is a legitimate comparison, not inherently a paragraph failure. No code or prototype has been written by this review.

## Consolidated final recommendation: D-open with refill-to-two

This supersedes the automatic end-turn draw in the preceding recommendation. It is one selected experimental candidate, not another parallel variant. The parent proposed refill-to-two; I support it because public development then creates new hidden options, while Pass does not grow a hoarded hand.

**Setup:** expose one random person per player and deal exactly two hidden cards each from two to four thirteen-rank suits. Every card remains unique within its suit. Use the cyclic A–K ring. Historical role powers and native-only ownership restrictions are absent.

**Turn:** check whether your Crown survived since your previous turn; if so, win. Otherwise return your Resting cards, then draw only until your hand contains two cards or the stack empties. If you already hold two or more, draw nothing. Choose one Add, Swap or Pass. Resolve any answer and transfers, update Crown markers, then advance clockwise. No end-turn draw. First-turn refill naturally does nothing because setup gave two cards. Two is a refill target, not a hard hand limit; never discard excess cards.

**Add:** put any hand card into your family, regardless of suit. **Goal:** keep any three consecutive ring ranks in your family until your next turn. The Crown tracks whether at least one triple remains continuously complete; losing all triples removes it. Suit does not limit family membership.

**Swap:** use a hand card against any rival exposed card of the same printed suit. The rival may stop it with a same-suit hand card adjacent to the lead on the rank ring. Answered lead and answer rest with their current owners; unanswered lead and target rest with their new owners. One answer only. All cards retain their printed identity; power is transferred, never discarded. No target-rank restriction, protected ruler, negotiation, round counter or external pressure.

**Pass:** ends the turn. It and refill are neutral procedures, not invented rank powers. Rank earns its place in goal construction, held answers, offered-card threats and target/donation consequences.

Economic consequences:
- Add from two leaves one; next turn, after returns, refill can provide one new hidden option.
- Swap or Defend usually rests the played card; its return restores the previous hand quantity, so the action does not automatically earn a draw.
- Pass from two earns no new cards next turn. Waiting cannot farm the stack.
- Losing an exposed person may give its owner an extra held/resting lead. That is legitimate transferred power, not a reason to delete cards at a cap.
- A player with more than two cards must expose some before drawing again. This discourages idle accumulation without a separate penalty or clock.
- Empty-stack repeat-defense remains possible; refill does not magically solve it.

I remove hand barter from this selected candidate because any-card Add already removes the missing-native acquisition invariant and lets every acquired person advance a possible family. The removed mechanism had earned value in the published native-only game; that evidence is respected. It does not prove bargaining must survive a game where its acquisition purpose changed. If actual play shows essential exact-card access is still missing, reject this candidate or reopen a documented barter amendment; do not slip it in during implementation.

I do not recommend the native-only/refill/immediate-barter combination as the selected repair. Refill stops free hoarding growth and direct hand exchange enables consensual recovery, but a refusing opponent still maintains the partition lock. The three physical choices can be clear; the objection is their inability to guarantee an active acquisition route, not their click count. No game must force an opponent to consent, but this particular native-only economy cannot treat optional consent as its only repair.

The bounded tests above now run this consolidated candidate. Use the published game as the empirical control rather than building an additional barter hybrid. Specifically verify the exact partition's Add escape, D1/D2 reservation reversal, D3 revised mixed-family target consequences, every opening card's legal initiation, Pass not increasing hand size, returned-card refill ordering, legitimate excess hand, repeated empty-stack defense and late hidden-answer coverage. Then run the fixed two-/three-/four-seat comparisons and fresh visible teach. No historical asymmetry or clock is appended before those findings.

This is the final candidate recommendation from this panel for the next bounded experiment. It is not yet evidence sufficient for a production freeze.

## Freeze recommendation: mandatory one-card play

**Yes: select mandatory one-card play for the consolidated D-open/refill-to-two candidate.** Remove voluntary Pass. This is approval to freeze one experimental rules specification and its tests, not a claim that its enjoyment or balance is established.

At turn start, check the existing Crown, return Resting cards, then refill toward two. If any card is held, choose one Add or legal Swap and resolve it. If none is held after refill, the turn ends automatically without a button. Any held card can Add, so no player is forced to invoke an unavailable verb. Answering a Swap remains optional; this change governs the player's initiating turn only. No new resource, rank cost, external clock or extra rule exception is added.

### Position M1: the constraint can preserve a meaningful two-card decision

Family S4/S5; hand S3/S6; next rival has publicly remembered S2 and an unknown extra card. Adding S6 creates ranks4/5/6 and retains S3 to answer S2. Adding S3 creates ranks3/4/5 but leaves S6 unable to answer S2. Both moves are legal. With remembered S7 instead, adding S3 retains S6 as the answer and reverses the preference. The unknown extra card keeps either line uncertain.

Voluntary Pass preserves both cards but makes no public progress and creates no refill slot. Mandatory play removes this cost-free postponement while preserving a concrete choice about which rank to expose. It does not prove that every opening has an equally rich choice.

### Position M2: mandatory exposure has a real cost

Three-player position. Your family S4/S5; hand SA/S7; no Crown. Both Add choices are legal but neither completes a run. The next rival has remembered S2; the following rival has remembered S8. Their exposed families contain only T/U cards, so neither of your S leads currently has a legal Swap target.

Under voluntary Pass, you can keep SA to answer S2 and S7 to answer S8. Against the specified sequence of S2 targeting S4 followed by S8 targeting S5, both answers preserve the two-person family. Both spent answers later return before refill, so this preservation also leaves no fresh draw slot. It can repeat while public position does not advance.

Under mandatory play, Add SA leaves S7 reserved: S2 can take S4, donating S2 to you, while S7 can answer the later S8. Add S7 instead preserves SA: SA can answer S2, but S8 can take S5 and donate S8. You choose which public rank to risk and which acquired lead/future layout to accept. Other legal targets and unknown cards can alter the outcome; this is one specified continuation, not a forced optimal attack tree.

This is genuinely forced exposure, not a free strategic benefit. A player may resent losing the ability to preserve both people. The reason to accept it for the experiment is that the protected voluntary line can preserve an unchanging position indefinitely, while the mandatory rule still leaves two different risk/circulation choices. Test whether those choices feel useful rather than rationalizing every forced loss as agency.

### Why this is the selected constraint

The user asked for two starting cards and a small visible A/B decision. Mandatory play puts the decision on those cards. Voluntary Pass was inherited as a procedural convenience; in refill-to-two it can keep the same protected hand indefinitely. Removing it earns its teaching cost: “Play one card” is simpler than explaining when a free Pass advances or stalls the game.

This does not remove the right to allow an incoming Swap. Nor does it mean a player must spend a defense during another player's turn. Automatic empty-hand advancement is a transparent table procedure, not an AI choosing a card.

Mandatory play removes the exact all-Pass repeat, but does not prove termination. Repeated Swap/answer/return sequences can still loop without any Add. Do not claim the cycle problem is solved or add an unannounced draw cap.

### Required cases in the frozen implementation/test plan

1. **M-01 Opening:** exactly two cards at the first decision; every held card can Add; no Pass action or extra first-turn draw. Inspect actual tutorial and ordinary opening.
2. **M-02 Ordering:** Crown win check precedes returns/refill; a player who has already won is not forced to play. Returned cards count toward the refill target; hands above two are preserved.
3. **M-03 Mandatory legality:** nonempty hands cannot submit an empty turn; one confirmed Add or resolved Swap advances once. Cancel/invalid target does not spend or advance. A canceled preview cannot smuggle in a Pass.
4. **M-04 Response freedom:** eligible defender may answer or allow; answering does not consume their next initiating turn. If that next turn starts with cards after returns/refill, one card play is still required.
5. **M-05 Empty turn:** truly empty hand after returns/refill advances once automatically, with no hidden action. A complete empty-table/empty-stack state must not create a busy-loop; terminal/stalemate disposition must be explicitly specified before shipping if reachable. Do not silently invent one in code.
6. **M-06 Rank choice:** execute M1's remembered2/7 pair, showing both legal Add choices and actual defended/undefended consequences. Preserve hidden-extra-card uncertainty.
7. **M-07 Forced exposure:** execute M2 and alternative legal target sequences; record retained ranks, received leads and next-turn recovery. Compare against the voluntary-Pass control solely as a diagnostic, not a second shipping ruleset.
8. **M-08 Dominance:** seek reachable hands where one Add is always better, two effectively identical cards, no useful Swap, or a forced Add supplies an opponent a trivial win. Distinguish occasional constrained decisions from a generally solved policy.
9. **M-09 Remaining cycles:** test repeated same-lead defenses, reciprocal Swaps, exhausted stack and large answer-covering hands under mandatory play. Preserve exact repeat-state traces; no inference of finite play from the absence of Pass.
10. **M-10 Visible teach and play:** one sentence plus the two actual card choices; fresh learner predicts what leaves hand and what stays as leverage. Compare two-/three-/four-seat completed games and explicitly record unwanted-exposure frustration. Agent evidence is not family preference certification.

Final recommendation: freeze this one mandatory-play D-open/refill candidate for implementation and bounded playtesting, with the above cases written first. Remaining failures may reject it during that cycle; they are not reasons to keep multiplying prose candidates now.
