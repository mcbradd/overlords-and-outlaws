# Build 5 attrition correction review

17 September 2026. Status: proposed amendment; no correction implemented. This follows the actual first projected-policy experiment on the frozen Build 5 candidate. Simulated systems, adversarial strategy and physical-game perspectives are used below; no human panel or screen-only playtest is claimed.

## Observed failure

Command: `npx tsx scripts/core-simulate.ts 8`. Twenty-four complete policy simulations, eight seeds each at two, three and four seats. Six games produced a succession winner; eighteen hit the round-12 cap. All eight four-seat games and seven of eight three-seat games drew. Several games used many Recalls and Crown attempts but no Defend actions. A separate all-balanced four-seat seed 101 trace ended with every Court empty and every ruler absent, while players held large foreign collections. These are engine/policy observations, not evidence from actual browser sessions.

The current successful Recall gives the attacker both its lead back next round and the captured target. It strips the defender of a public person and future native material simultaneously. Removing a lone ruler often carries little lasting cost for the attacker; the same lead can continue taking newly drawn replacements. In a four-seat game, three rivals may each try both current claim dependencies. The per-attacker attempt ledger correctly prevents ally-granted immunity, but does not address this accumulation loop.

The policy compounds the rule: it repeatedly spends the last native answer on a claim, deploys native cards after sufficient supporters exist, and rewards removal of a lone ruler even when that ruler is not a near-term Crown threat. Rule correctness and finite termination passed; the agency/pacing acceptance gate did not.

## Antagonistic options

1. **Raise or remove the round cap.** Rejected. More time permits more iterations of the demonstrated attrition loop and does not establish a believable winning path.
2. **Let only one player Recall each target each round.** Rejected as a cure. A cooperating player can lead weakly and thereby immunize another player's Crown against all remaining opponents. Keep per-attacker target marks.
3. **Return the captured target automatically to its original Court next round.** Rejected. It makes capture feel fictitious, repairs offices without an authored card action and complicates whether the failed Crown was actually defeated.
4. **Return captured targets to their former owner's hand or Played.** A viable displacement game, but it removes royal seizure as a meaningful ownership change. It gives no rank-dependent price for stealing a high-value person. Reserve as an alternative if the recommended exchange still fails.
5. **Discard the attacking lead permanently on every Recall.** Rejected for this amendment. It creates The Past and eventual scarce-suit starvation, introducing a second permanence vocabulary and recovery problem. The user's people should not become disposable generic attack ammunition.
6. **Make target rank resist the lead.** Rejected for this amendment. It adds target-versus-lead-versus-answer comparisons to the simplest interaction, and can create nearly immune Kings when the sole eligible answer is inaccessible. It weakens the expressly requested low lead drawing out a higher response.
7. **On successful Recall, exchange lead for target.** Adopt for parent approval. The attacker captures the target, but gives its played lead to the target's controller. Both stay unavailable in their new owners' Played areas until the normal boundary. An unsuccessful Recall still commits both attacking lead and answer in their current owners' Played areas. This uses the same cards and locations, preserves actual seizure, and makes the exact attacking rank a lasting price.

## Precise adopted candidate, pending approval

Change only the successful Recall ownership step:

- Attacker commits hand lead to its own Played area before the response, exactly as today.
- Target controller can Defend once under the unchanged same-suit/higher-rank/Ace rule.
- **If Defended:** lead remains in attacker's Played, answer in defender's Played, target in Court. Both committed cards return to those owners at next start.
- **If not Defended:** remove target from its controller's Court and put it in attacker's Played. At the same time remove the exact attacking lead from attacker's Played and put it in the target controller's Played. Both are unavailable until next start and return to their new owners. Resolve office and marriage consequences immediately after the exchange.
- Capturing a native ruler therefore guarantees that its former controller receives another card of its native suit at the next boundary. They may recruit it as a replacement or preserve it for a ranked answer. The replacement is not automatically recruited or crowned.
- Capturing a supported foreign spouse gives the former controller another card of that foreign suit. It does not guarantee an adjacent replacement marriage or permit foreign Recruit. The existing native recovery route remains available; no new support rule is inferred.
- A captured Queen still breaks her marriage and sends an unsupported spouse to the former controller's Played. The exchanged lead never inherits the Queen's marriage, witness role or crown office.
- Invalid actions remain atomic. No extra response or hand card becomes available this round. Attempt marks remain per attacker/target. Pass, draw, Crown timing, two-card setup and round cap are unchanged.

Card wording: **Recall — Play this to take a rival person of this Dynasty. They may Defend. If they let the person go, give them this card in exchange. Both cards return to their new owners next round.** Response wording must tell the controller exactly which incoming lead they gain by accepting the exchange.

The expected new decision is concrete: risk a low lead that may draw a larger answer, or commit a high lead knowing successful capture gives that stronger native card to the family you attacked. The defender may rationally accept losing a weak ruler in exchange for a valuable future person. These are strategic hypotheses; the simulation comparison must verify whether the exchange improves actual winning opportunities rather than merely increasing activity.

## Policy correction under the same public-information contract

Do not protect the player through hidden pass instructions or ignore a legal winning threat. Amend the projected policy to:

1. Evaluate the exact card surrendered on a successful Recall and the card gained, including the recipient's native use. A lone ruler without a supporter is a weaker immediate threat than a person already required for a Crown.
2. Retain a native answer when sufficient Court development already exists; additional native recruitment must have an explicit near-term use, such as ruler recovery or a rank-matched Queen route. It is not automatically positive merely because it empties the hand.
3. Prefer a claim that leaves a useful legal response in hand over one that spends its last answer when opponents retain plausible matching leads. Assess only public facts and unknown-card possibilities, never actual hidden hands.
4. Continue to challenge a rival's required person when a succession could otherwise win. The correction cannot achieve prettier outcome statistics by teaching rivals to overlook real threats.
5. Keep aggressive/builder/conserver policies as disclosed evaluation variants. Do not erase adverse records or rerun only favorable seeds.

## Written tasks and tests before implementation

| Amendment task | Required tests and evidence |
|---|---|
| A01 Freeze rule/copy cascade | Update normative Recall ownership, physical reminder, test contract and production amendment before reducer edits; all descriptions distinguish successful exchange from blocked commitment |
| A02 Execute exact successful exchange | Capture fixture verifies target in attacker's Played, lead in defender's Played, both absent from hands; original input unchanged; one location per ID; invalid/duplicate decline does not exchange again |
| A03 Recovery is legal and earned | After native ruler capture, boundary returns the lead to defender; only their later Recruit makes it ruler; no direct Court return, office inheritance or restored Crown; test empty former hand and empty deck |
| A04 Preserve support/capture edge cases | Queen capture transfers lead once and moves unsupported spouse once; foreign spouse capture gives its lead to former controller and target to captor; retained Queen stays unpaired; no new marriage or rank adjacency inferred |
| A05 Preserve successful defense | Exact tutorial remains legal and ends round 3; defended lead stays attacker-owned; answer remains defender-owned; per-attacker marks still allow another rival to contest |
| A06 Price aggressive actions | Policy fixture with no imminent Crown compares costly high-for-low ruler capture against constructive development; changes in public threat can reverse preference; imminent Crown interruption remains selected; stronger valid answer retained when weaker answer suffices |
| A07 Reserve meaningful answers | Fixture with ruler/supporter and two native hand ranks favors a claim preserving the stronger response; no unsolicited extra supporter deployment while a current Crown needs that answer; own Crown incoming threat still Defends; identical hidden permutations yield identical decisions |
| A08 Re-run the same evidence | Run exactly the original 24-game seat/seed/policy set, plus all-balanced comparison and seating/suit rotations; report wins, cap draws, claims, Recalls, Defends, Trades, acceptances, practical rulerless periods and actual action totals; no statistical balance claim from this small sample |
| A09 Enforce the strategy gate | A result still dominated by cap draws, absent ranked responses or automatic native recruitment fails. Do not tune cap or suppress rival denial to pass. If failure persists, write the next amendment before any further change |
| A10 Observe the actual surface | On the integrated candidate, visually inspect lead, target and destinations for both outcomes; screen-only evaluator must explain the exchange before confirming; repeat tutorial and ten UI games under final candidate rather than counting these simulations |

The engine's finite measure remains valid: both successful and failed Recall remove the original lead from available hand; an answer also leaves hand; neither exchange adds to any hand before boundary. Successful capture redistributes two existing cards rather than increasing the attacker's total supply. This is a correction to the resource cost, not a new currency or per-turn numerical allowance.

No implementation of this amendment is authorized by this document alone. Parent review must approve the written candidate and ensure A01/test expectations are updated first. The retained 24-game failure is the baseline for the next comparison.

## Approved implementation and observed comparison

Parent production review approved A01–A10 on 17 September 2026. Normative rules, production tasks and test contract were amended first. Four executable correction groups were then added to `tests/core-game.test.ts`; the first run recorded four failures under the original implementation. The reducer and public-information policy were corrected afterward. The final core run passed 24/24 tests, including the unchanged round-three tutorial and projection/privacy cases. One response-choice fixture was clarified to compare a lower non-Queen answer against 10: the original lower card was a Queen with an additional marriage use, so retaining that Queen was a legitimate competing valuation rather than a broken rank comparator.

The exact successful Recall exchange is now implemented. Defended ownership, per-attacker attempts, setup, Crown clock and round cap remain unchanged. The AI values the exact success exchange, avoids gratuitous extra native development, favors an heir leaving a stronger answer, and continues interrupting imminent rival victories. No hidden hands, future draws or instructions to spare the player were added.

Command: `npx tsx scripts/core-simulate.ts 8 --extended`. Full machine-readable records: [BUILD-5-ATTRITION-RESULTS.json](BUILD-5-ATTRITION-RESULTS.json). The cohorts overlap in some seed/setup combinations; they are diagnostic comparisons, not 272 statistically independent human samples.

| Cohort | Games | Succession wins | Cap draws | Recalls | Defends |
|---|---:|---:|---:|---:|---:|
| Original mixed-policy cases before correction | 24 | 6 | 18 | Recorded in first command output | 34 |
| Same original mixed-policy cases after correction | 24 | 21 | 3 | 987 | 504 |
| All-balanced comparison | 24 | 20 | 4 | 887 | 445 |
| Every selected-suit subset and cyclic seat rotation | 224 | 202 | 22 | 8,529 | 4,172 |

Same-case winners by seat count changed from 5/8, 1/8 and 0/8 to 8/8, 7/8 and 6/8 for two, three and four seats respectively. The rotated cohort produced 95/96 two-seat winners, 84/96 three-seat winners and 23/32 four-seat winners. The return of actual defensive play and much lower capped-draw count support continuing to screen testing; they do not establish entertainment, fair faction balance or freedom from dominant lines.

**Remaining actionable evidence:** across the extended cohort the maximum was eleven consecutive round starts without a ruler for one seat, and the largest count of rulerless ordinary opportunities in one game was 134. The AI can repeatedly spend its native recovery card to interrupt a rival's imminent Crown instead of rebuilding. This is a concrete practical-elimination/kingmaking concern even when somebody eventually wins. Four-seat cap draws also remain more common than two-seat draws. Preserve these records and observe these cases in the next agency gauntlet; do not mark strategic acceptance complete on winner counts alone.

A10 actual visual explanation, successful-exchange movement and ten screen-observed games remain separate integration gates. This report does not claim they were performed by the systems agent.
