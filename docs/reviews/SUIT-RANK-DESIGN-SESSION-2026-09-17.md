# Suit/rank design session — Builds 5 and 6, 17 September 2026

## Final next-phase selection and requested stop

The completed published Build 5 cohort contains ten ordinary screen-only games, eight wins/two losses, all four Dynasties and 2/3/4-player tables. Its independent explanation identified meaningful defense/trade timing but also rule-level family comprehension failures. The complete release still failed 23 of 63 checks. All 2,228 captured matrix images were actually reviewed, with documented missing-state and display-scale limitations. These results do not approve Build 5.

Malachy's full supplied email was presented to the next panel as guidance. The user explicitly opened **every** mechanic to challenge. Experience and production agents cross-examined whole games; the primary agent supplied systems counterexamples and a four-case executed control probe. These are actual agent critiques, not human professional endorsement.

The review rejected role-set candidates with unearned complexity, ordered-target runs with an immune J/Q/K, neighbor-only attacks with excessive forced opening passes, and native-only runs with a structural acquisition lock. It retained conditional rank reservation as a desirable property, rather than retaining the old higher-card/Ace exception. A current-reducer probe showed a local reversal: Q heir/A reserve answers known K, whereas A heir/Q reserve answers known 10; this is not a proof of global optimality.

**Selected Build 6 evaluation game:** any person can Add to a mixed Court; keep three cyclic neighboring ranks until the next turn; offer a same-suit Swap; answer with a neighboring rank of that suit; return personal Resting cards then refill only to two; play one card per turn. Remove voluntary Pass, succession, marriage prerequisites, exact-name Trade, higher-card combat, global rounds and an external clock. Preserve all transferred power and the physical card/board presentation. A natural all-empty/no-Crown position draws. Historical asymmetry is explicitly deferred, not falsely represented by renamed symmetric machinery.

The mandatory-play choice received a final cross-defense with two concrete positions: it preserves conditional Add/reserve choices but can force unwanted exposure. That cost, repeated Swap cycles, hidden-answer shields, hoarding and draw luck remain falsification tests. Selection authorizes an experiment after the complete planning freeze; it is not proof of fun or balance.

Binding package: [rules](../SUIT-AND-RANK-DESIGN.md), [state boundary](../BUILD-6-STATE-CONTRACT.md), [production tasks](../BUILD-6-PRODUCTION-PLAN.md), [tests](../BUILD-6-TEST-CONTRACT.md), [six-commitment tutorial](../BUILD-6-TUTORIAL-CONTRACT.md), [literal visual inventory](../BUILD-6-VISUAL-INVENTORY.json) and [inventory interpretation](../BUILD-6-VISUAL-INVENTORY-README.md). The older selections below are historical records wherever they differ.

The user then instructed: finish until ready for the next implementation phase, stop, and write current knowledge to the knowledge base for another agent. Accordingly this task stops at the committed planning boundary. No Build 6 implementation or deployment is performed. The next agent should resume from the handoff only when the user resumes work.

## Binding follow-up: family play and explanation cost

The user's final clarification applies to **all mechanics** that obstruct fun and clear family play, not only Eudoxia. No existing mechanic is protected by implementation effort, prior decisions or correspondence. The next panel must review the entire core and defend each retained mechanism by its contribution to meaningful choices, clarity and fun. Earlier rule selections below document the tested candidate, not mandatory future design.

Subsequent clarification: the user explicitly permits pushback on suggested mechanics. Eudoxia began as a compromise and can be replaced or removed. Reviewers must distinguish the underlying goal from its proposed mechanism, defend decisions through logic and evidence of fun, and compare simpler alternatives, including no external clock. The email is not an immutable feature list.

The user also directs the next antagonistic panel to read [Malachy's email in full](../knowledge-base/MALACHY-EMAIL-2026-09-17.md). Its design guidance must be presented at the start of that round and addressed in the proposals and cross-defense. Eudoxia timing/puzzle count and Interregna warning are questions to investigate; historical asymmetry, hidden OUTLAW leverage and power transfer must not be dismissed because the current core omits advanced systems.

The user has clarified that this is a family game, understandable at a sixth-grade reading level, with minimal text and clear mechanics/intent. Multiple sentences needed to clarify ordinary gameplay are a design failure. The [family-game gate](../FAMILY-GAME-DESIGN-GATE.md) is binding on the next panel. Reopen existing mechanics that fail it; do not preserve rules merely because implemented, or move necessary paragraphs into inspection. Prior panel selection is not acceptance under this new gate.

This is the current binding design-session record. The prior four-round R4 session is preserved in [its archive](SUIT-RANK-DESIGN-SESSION-R4-ARCHIVE.md). The newest user transcript replaces its seals and expanded teaching grammar. Independent agent reports: [systems](BUILD-5-SYSTEMS-PANEL.md), [experience](BUILD-5-EXPERIENCE-PANEL.md), [production](BUILD-5-PRODUCTION-AUDIT.md). These are simulated disciplinary critiques, not human expert consultation or observed playtests.

## Executed gauntlet

Three agents independently reviewed systems, experience and production while the primary agent read authority/source files, inspected the actual baseline opening, introduction and tutorial table at 1280×720, and wrote the complete production/task/test framework. Baseline checks reported 135 unit tests and three UI tests passing; the visible tutorial still exhibited the user's problems. Passing tests did not resolve those problems.

The systems report records three initial proposal/defense rounds. A subsequent cross-review compared its complete candidate with the experience and production reports and challenged additional rank-band proposals. Final selected mechanics are in [the normative rules](../SUIT-AND-RANK-DESIGN.md). No code was implemented during this session.

| Objection | Disposition and binding action |
|---|---|
| R4 preserves three seals and ten paid verbs | Replace with hand-card commitments; no seals or universal toolbar |
| Thirteen disconnected abilities replace one overloaded menu with thirteen exceptions | Reject for first core; retain small card grammar with exact suit/rank choices |
| Rank-band gating of Recall or a unique Q/K Crown key makes actions a hand lottery | Reject essential-action gating; native succession always available by developing the required people |
| Low-ready/high-sideways has no useful effect under an Ace Founder and no ready-only core action | Remove readiness; do not add meaningless arithmetic to satisfy rank wording |
| Every native card may simply race to Court | Explicit unresolved empirical risk; retain exact-card Trade, ranked defense and foreign marriage route; test always-recruit and hoard policies and ten actual UI games |
| Pure simple core dropped prior priority for barter and relationship politics | Adopt binding exact-card Trade and one integrated Marry & name heir alternative; avoid decorative standalone marriage |
| Accepted trades could circulate the same cards indefinitely | Both received cards go to Played, except initiator's declared lower-native immediate Recruit; neither returns to hand this round |
| Refused offers become free hand probing | Once per recipient per round; decline consumes opportunity as Pass; inability and refusal indistinguishable |
| Returning used cards then refilling only below two traps foreign-only hands | Return Played then deal one new card to every player at each start, deck permitting; no hand cap; explicitly test starvation |
| Entire four-suit deck in two-player core yields unusable absent-suit cards | Exactly N selected suits for N players |
| Table-wide once-targeted immunity enables an ally to shield the Crown with a weak attack | Attempt mark is per attacker/target, so other rivals retain their own attempt |
| Tutorial native+foreign hand cannot defend first native recruit | Freeze two native starting cards and the exact legal two-seat sequence, including normal replenishment |
| Spent may mean permanent removal or return | Use Played with Returns next round; precise current entitled owner; stolen people stay unavailable until next start |
| Losing old ruler after transfer might fail the claim inconsistently | Old ruler remains an ordinary Court person and stops being required after transfer |
| Failed foreign reign may make another claim impossible while foreign ruler persists | Supported foreign ruler may initiate ordinary native heir succession |
| Existing tests read solution and state | Separate regression automation from fresh screen-only tutorial and ten observed normal games |
| Old source tests assume active History runtime | Use isolated new core seam; versioned saves; route historical application probes explicitly rather than presenting the old engine as current |

## Rank and agency closure

Recruit exposes a specific defensive/trade rank; native Court Queens set available foreign heir matches. Recall leads compete with a strictly higher same-suit answer or Ace against face ranks, making low leads and Ace/face thresholds different. Defend commits the exact answer until next round. Trade gives up a larger card for a smaller native development opportunity, while the recipient may value that high suit-linked tool or refuse. Marry & name heir requires equal/neighbour ranks and exposes two linked suits. Native Name heir preserves the universal development route while committing that rank and a named public supporter. Passing risks the round closing while retaining those particular responses.

This is causal rank use, not a claim that each action needs separate arithmetic or every card has equal value. Court versus hand choices, conditional bargains and matching relationships must actually matter in observed play. If always-lowest recruitment, always-highest defense or compulsory responses dominate, the next cycle revises them; panel agreement cannot certify enjoyment.

## Preimplementation closure

All initiative payments, target rules, response windows, native/foreign Crown dependencies, start/end order, card destinations, finite round measure, deck exhaustion, prototype cap, setup and tutorial IDs are now specified. The production plan and explicit test contract enumerate all tasks and gates before code begins. Historical R4 instructions are marked superseded in the master specification and current physical/tutorial contracts. Advanced History remains explicitly deferred and must not be presented as complete.

Final independent written-candidate checks completed: systems found rotation/dealing order ambiguous; rotation now occurs first and deals start at that seat. Experience verified the exact native 2 / attack 3 / answer 4 tutorial and round-2/3 refill/transfer path. Both found no remaining blocking inconsistency within their reviewed scope after that correction. This is procedural closure, not measured enjoyment.

Next: freeze the plan/test commit, implement the complete core, audit and visually inspect, publish Prod, verify deployed SHA/build, observe blind tutorial and ten complete games, collect failures, repeat. Main remains locked. No implementation, Build 5 deployment, blind session, ten-game sample, device validation or finished artwork is claimed by this document.

## Recorded continuation after the planning freeze

The complete plan was committed as `3fbb734` before implementation. Subsequent written amendments and their actual tests are recorded in [the execution log](BUILD-5-EXECUTION-LOG.md).

The first policy gauntlet rejected the original successful Recall: attackers kept their leads while accumulating captured cards, producing18cap draws in24games. The [attrition amendment](BUILD-5-ATTRITION-REVIEW.md) changed an undefended Recall into an exact exchange, with both people unavailable until the next round. Defended ownership stays unchanged. The defender can earn recovery by recruiting the returned native lead, while the attacker must price the rank being surrendered. The same24 experiments improved to21wins/3draws, followed by a separate empty-public-hand Trade correction yielding22wins/2draws. These outcomes justify further testing, not a declaration of strategic success.

Independent application and visual critique reopened storage recovery, loading transitions, tutorial reading control, printed reference completeness, compact Trade responses and dense Court navigation. Every correction has a written task/test amendment before its code. The blind tutorial and ten observed UI games remain distinct open acceptance gates until performed.
