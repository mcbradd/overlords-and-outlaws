# Suit and rank design session — 17 September 2026

## Brief, participants and evidence limits

The user requested an update to the master game design and an iterative panel session: brainstorm how suits and A–K ranks interact with every action; defend proposals or support stronger alternatives; continue until each action meaningfully uses rank and the resulting sub-games contribute to player agency.

Executed **four rounds with three independently running simulated panelists**, facilitated and synthesized by the primary agent. Panelists read the existing rules and later the actual revised documents. They are disciplinary perspectives, not named real-world game designers, external consultations or human players. Their agreement establishes a coherent candidate for testing, not demonstrated fun, balance or historical accuracy.

| Panelist | Assigned perspective | Scope |
|---|---|---|
| `rank_tactics` | Tactical card systems | Low-card bait, high-card reservation, all-order rank choices, exact seal and card-identity examples |
| `rank_institutions` | Dynasty institutions and negotiation | Distinct themes, rank mapping, concealed succession, self-interested bargaining at two players |
| `rank_adversary` | Adversarial rules and physical usability | Exploits, information leakage, finite procedures, recovery states and paper-verifiable choices |
| Primary agent | Facilitator/editor | Compare independent proposals, synthesize one candidate, resolve objections, update master/appendices and check the finite manifest |

Inputs: the user's suit/rank clarification and preceding Trade critique; designer intent; current master R3; current authored cards and glossary; card-language corrections; content inventory; physical-game and release constraints. No new historical claims or asset generation were necessary. Dynasty themes here are counterfactual mechanical interpretations of the existing institutional concepts. The [candidate](../SUIT-AND-RANK-DESIGN.md) distinguishes the requirements supplied by the user from new panel-authored algorithms.

## Round 1 — independent proposals and self-critique

| Topic | Proposed alternatives | Argument or discovered weakness |
|---|---|---|
| Recall/Block | Higher-than-target petitions; lower-than-target petitions; any same-suit lead with higher answer | Both target thresholds risk making a unique extreme-rank person effectively immune. All three moved toward any same-suit target, rank governing the response instead |
| Ace | Answer only K; answer J/Q/K | K-only is simpler; the broader exception makes 10 and J strategically different and provides a more substantial low-card defence |
| Recruit | Below-Ruler ready, higher sideways | Creates immediate use for small cards without forbidding larger recruitment or rulerless recovery |
| Draw | Public two-card market; blind draw with optional rank-restricted search; unconditional choose-two | Market adds a new public zone; unconditional choose-two strengthens Draw without making rank causally relevant; restricted patron search offers an opportunity cost |
| Trade | Pay for private inspection; public exact binding offers; lower-for-higher bundled recruitment | Charging inspection closes fishing but worsens Trade versus Draw. Exact voluntary offers remove compelled revelation; bundled recruitment provides an actual tempo benefit |
| Withdraw | Ordinary return relying on downstream rank value; optional lower same-suit replacement | Replacement offers a deliberate change from high public person to high concealed response, provided departure consequences occur first |
| Marriage | Lower spouse ready; equal/neighbour spouse ready | Equal/neighbour matching creates demand for particular foreign ranks, but must not refresh a spouse already in Court |
| Crises | Rank sums; printed pairs/sequences; low/high spaces; distinct-rank contributions | Patterns retain card identity; sums create a generic power meter. Too many unrelated patterns would burden family play |
| Cover | Exact complementary rank/fragment mapping; rank changes duration with emergency fallback | Exact mappings could prohibit a lifesaving action and require arbitrary arithmetic. Duration permits any card while valuing the right one |
| Crown | Mandatory straddle, interval, lower-heir or adjacent-spouse requirements | Exact gates can make a Dynasty's victory unavailable after particular ranks leave circulation. All panelists withdrew hard eligibility gates |
| Pass/Lend | New numerical rewards; rank-dependent reservation/commitment without new actions | Free Pass rewards invite cycles and add bookkeeping. Existing state can make passing meaningful if a worked rank counterfactual demonstrates it |

The facilitator rejected rank-as-currency and 52 disconnected special powers. Card uniqueness is the suit/rank identity plus historical role and institutional context. The group retained the game's physical family, lawful succession, shared History and finite seal economy.

## Round 2 — synthesis B, defence and adoption

The facilitator circulated one complete candidate covering all thirteen glossary entries, rather than selecting isolated attractive mechanics. It combined ready small recruits, patron Draw, binding public Trade with optional lower native admission, near-rank marriage, lower replacement Withdraw, higher-response Recall/Block, ranked Crisis proof, variable Cover duration and optional shorter Crown settlement.

| Panelist | Defended | Adopted from the synthesis / withdrew |
|---|---|---|
| Tactics | One bounded Recall response; two-target low-bait sequence; comparisons without totals | Adopted patron Draw over a public market, bundled Trade, replacement Withdraw and duration-based Cover. Withdrew hard Crown gates. Retained a preference for Ace-versus-K only, while accepting the broader exception as a testable candidate |
| Institutions | Exact voluntary bargaining and lower-for-higher deployment; historically distinct Laws | Adopted universal target Recall, patron Draw with guaranteed original top fallback, and short/long Crown timing. Withdrew exact-only Cover and compulsory rank patterns |
| Adversary | Always-defined recovery, public proof, bounded opportunities and no nested stack | Supported public binding offers over paying to inspect; supported slower unmatched institutions rather than prohibited claims. Rejected unconditional Draw-two and artificial Pass rewards |

Round 2 produced concrete closure requirements, all incorporated before the next review:

- Trade must bind its initiator when the recipient accepts; no reveal-then-refuse stage. One formal offer consumes the opportunity; rejection is Pass; directed once-per-partner-per-round boxes bound refusal sequences. Only the initiator gets the optional lower-native admission, always sideways.
- Draw must distinguish zero/one/two-card decks; choose the original top even when the second fails the rank test; announce which position is selected and reveal any selected second card. Lend the patron before inspection, never after seeing the cards.
- Crown qualification must freeze for public arrangements, with the originally sealed Tudor comparison verified only at transfer. Losing one permitted Alba candidate must not silently recalculate a previously earned shorter schedule.
- Help rank uniqueness must be **across the event**, not within each player's single contribution. The equal-rank pair events are explicit alternatives to distinct-rank events. Record IDs, ranks, suits and credited seats so returning cards cannot erase or duplicate proof.
- Withdraw must resolve office/marriage/Crown loss before optional replacement; it cannot revive a failed attempt. Incoming replacements were already in hand, are native and strictly lower, and inherit no relationships.
- Marriage readiness applies only to the incoming hand spouse. No free refresh of existing Court cards.

The institutions panelist supplied a genuinely conditional two-player incentive example: Tudor Q exchanged for Plantagenet 4 gives the initiator exact native recruitment and gives the recipient a long matching-suit Cover rather than the former card's short Cover. This shows possible mutual utility, not a prediction of general trade acceptance.

## Round 3 — inspect the written specification, not just the pitch

All three panelists read the completed appendix and R4 master update. Review checked all thirteen vocabulary entries, the provisional rank mapping, examples, action timing, privacy and physical evidence. They found issues missed by the initial verbal synthesis:

| Finding | Concrete failure | Revision |
|---|---|---|
| Paid-action wording | “Successful paid order clears passes” could let a Blocked Recall preserve a pass streak | Every legal committed paid order clears passes, even when Block defeats it |
| Tudor saves | An unqualified prohibition on exposing rank “in saves” could prevent deterministic restoration | Authoritative private save retains original identity; public exports/other-seat projections redact it |
| Patron physical verification | Two cards behind a hand screen could be reordered invisibly; revealing the second's rank alone does not establish its original position | Two numbered face-down positions visible to the table; privately peek and return each to its same position; publicly select the slot |
| Foreign Ruler equality | A native card can equal a foreign Ruler's rank after Habsburg succession, despite within-suit uniqueness | Equal **or** higher enters sideways; only strictly lower enters ready |
| Regency dominance | A two-round unmatched Plantagenet primary requires a Witness; the same heir under two-round Regency avoids that dependency | Change candidate Regency to three full reign rounds; primary matched/unmatched remain one/two |

The last change is material, not editorial. The panel explicitly considered acknowledging dominated fallback routes versus changing the timing. The chosen 1/2/3 progression restores a reason to build an institution, while creating a new risk that the slow fallback loses too often to History. That risk is now a named test and revision trigger. The existing playable game's Regency remains two rounds; this is an unimplemented candidate change.

The broad Ace exception survived review as the selected version. Tactics' narrower alternative is preserved in the test plan, not mixed into the normative rules. The written 10-versus-J example makes the chosen discontinuity explicit.

## Round 4 — closure review and final amendment

All three reread the amended rules. Tactics and Institutions supported three-round Regency as a coherent alternative to the dominated route. Adversary confirmed closure of the equality, patron-order, pass-reset and privacy issues. Tactics found one remaining explanatory overstatement: a K Ruler does not ready every native recruit if that Ruler is foreign and the native K is still available. The final wording now says **native K Ruler**.

Final positions:

- **Tactics:** supports the integrated candidate over its earlier market and compulsory Crown-pattern proposals; accepts the selected broader Ace exception subject to testing; no remaining adjudication blocker after the native-K wording correction.
- **Institutions:** supports the manifest, differentiated rank patterns, two-player Trade example and 1/2/3 institutional timing; no further procedure blocker in its scope.
- **Adversary:** supports procedural convergence after checking binding Trade, finite refusal attempts, table-visible patron positions, retained Crisis proof, departure-before-replacement, Crown timing, equality and empty-state recovery; balance questions remain open.

No additional brainstorming rounds were claimed. Four executed rounds reached the stated design stopping condition. Further iterations should use actual paper-play observations, not repeated simulated votes until certainty is asserted.

## All-action agency audit

| Entry | Compare two ranks or ranked choices | Why the choice affects the larger game |
|---|---|---|
| Recruit | Below Ruler versus equal/higher | Ready contributor this round versus exposing another institutional piece |
| Draw | Large patron versus blind draw | Better eligible second-card selection versus concealed answer kept available |
| Trade | Give high for lower native versus retain high and Draw | Exact deployment in one action versus card quantity, denial and secrecy |
| Marry | Equal/neighbour pair versus distant pair | Immediate readiness from hand and a possible shorter Habsburg reign |
| Withdraw | High departure with lower replacement versus ordinary withdrawal | Recover a ranked hand tool while retaining some public presence, paying real relationship loss |
| Recall | Small lead versus high/face lead | Tempt a large answer, threaten removal, or expose oneself to an Ace response |
| Block | Lowest sufficient card versus scarce Ace/high card | Preserve a later response, patron or institutional piece within the same seal budget |
| Help | Unused rank versus rank needed for a matched pair | Determines which shared obligations others can complete and what the contributor relinquishes |
| Challenge | Low versus high available contributor | Fill the missing space; another high card cannot substitute for low |
| Cover | Low foreign or matching-suit card versus high foreign | Buy a longer window or accept an emergency cover, sacrificing the exact person permanently |
| Claim | Build rank pattern versus start unmatched or Regency | Preparation and dependency costs versus one/two/three rounds of exposure |
| Pass | Reserve matching 10 or Ace versus an inadequate 8 | Changes which future Recall can be stopped, while risking immediate all-pass |
| Lend | Commit the exact high/low card now versus keep it | That person cannot simultaneously provide another ranked action; proof persists after return |

Pass and Lend deliberately do not add separate numerical minigames. Their rank consequences are demonstrated through legal downstream actions. They are not an excuse to claim a meaningless “rank bonus” for every button.

## Executed documentary and finite checks

The primary agent ran a Node check against the actual new Markdown mapping and the retained content inventory:

- Exactly thirteen unique ranks/retained IDs in each of four suits; all 52 IDs preserved, no added or omitted people.
- Enumerated 1,716 distinct ordered same-suit target/lead/answer rank triples (13×12×11). Checked the named response boundary examples: Ace answers J but not 10; 2 answers Ace; 8 cannot answer 9. This is a small finite rule check, not a game simulation or implementation test.
- No target rank is excluded from being Recalled by the target rule; card location and response availability still matter.
- Counted possible short-pattern configurations in the full roster, before deal/state constraints: 171 Alba Ruler/branch-distinct bracketing heir pairs; 858 Plantagenet Ruler/heir/lower-Witness triples; 78 Tudor Ruler/lower-heir pairs; 36 Habsburg Queen/foreign equal-or-neighbour heir pairs across the other three suits. These establish existence, **not equal likelihood, in-game accessibility or Dynasty balance**. Counts describe different-sized structures and must not be compared as win odds.
- The directed offer bound is two/six/twelve formal offers per round at two/three/four players. Accepted Trades also consume seals; rejected offers consume opportunities as Passes.

The executable prototype has not been modified to implement R4. Current-engine automated tests cannot demonstrate the proposed rank interactions. The appendix specifies engine migration tests, real paper scenarios, comprehension checks and complete 2/3/4-player games required next.

## Remaining empirical questions

1. Does low-card bait create a choice, or merely force a predictable defence?
2. Does the broad Ace exception make Ace too valuable, or does its competing Cover use create a worthwhile sacrifice?
3. Will players voluntarily trade at two players, and does bundled recruitment over-reward reciprocal or collusive exchanges?
4. Does patron Draw justify its extra handling without overwhelming the simpler Draw action?
5. Are globally distinct Help ranks and equal-rank pairs interesting negotiation or merely frustrating obstruction?
6. Can two-round primary and three-round Regency claims survive the finite History clock often enough to be credible choices?
7. Can a first-time family table execute the rules without a software referee and explain why they chose one rank over another?

The session resolves the requested design coverage and documentation. It does not close these playtest questions or certify entertaining player agency.
