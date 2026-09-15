# Decision audit — revision 2

## Result

The release ruleset completed **200 games**, seeds 20000–20199, cycling through six selected Houses, 2–4 seats, and rush/economy/defense/adaptive policies. The audit examined **3,638 order opportunities** and **789 defensive responses** for seat zero.

| Classification | Orders | Responses | Total |
|---|---:|---:|---:|
| Tradeoff candidate | 1,026 | 61 | **1,087** |
| Equivalent best sampled victory sets | 660 | 184 | 844 |
| Exactly one candidate ever wins | 477 | 157 | 634 |
| A single candidate dominates | 525 | 69 | 594 |
| No sampled candidate ever wins | 950 | 318 | 1,268 |
| Total | 3,638 | 789 | **4,427** |

Tradeoff candidates account for **24.6%** of sampled decisions, about **5.4 per game**. These are **not certified counts of genuinely interesting human choices**. The strict check excludes changes that merely decide which opponent wins, including shared Witness losses. Terminal outcomes under a small policy set cannot measure comprehension, bluffing credibility, preference, tension or enjoyment. Equivalent victory vectors also do not prove that the intervening experience is equivalent.

There were 185 House victories and 15 shared Witness losses. Mean duration was **9.71 rounds**. Winning policies: economy 65, defense 52, rush 36, adaptive 32. The run contained 5,075 challenges, 965 estate investments, 729 marriages, 902 claims and 132 recalls. These are all-seat actions, not player-only decision counts.

## Method

`npm run test:audit` reproduces the release run. At each seat-zero order opportunity with orders remaining, gather the moves preferred by four AI policies plus distinct estate/fortify/restore/recruit/end alternatives, capped at nine candidates. Recall is included when a policy proposes it. Deployments are grouped by role; attacks by target. This is a bounded sample, not exhaustive game-tree search.

For each candidate, run four counterfactual continuations to the actual terminal game state, using each policy for the whole continuation. A 650-action safety cap throws an error rather than substituting a heuristic. Record only **own victory = 1; any loss, including Witness = 0**. There is no arbitrary value-gap threshold.

- No candidate wins any continuation: no winning route found in the sample.
- Exactly one candidate wins any continuation: forced within the sample.
- Eliminate candidates whose victory set is a strict subset of another's.
- Multiple distinct remaining victory sets: tradeoff candidate. Each wins a continuation where another loses.
- One remaining victory set shared by multiple candidates: equivalent-best category.
- Otherwise: one candidate dominates the sample.

Defensive choices use the same classification. Accept-only challenges resolve automatically and are not counted as decisions. Production AI uses its own hand and public court state; a regression test changes opposing hidden cards without changing the chosen move. The offline audit retains the fixture's hidden state during rollouts. It does not model a human's belief distribution or sample alternative hidden hands.

## Iterations

| Revision | Games | Witness losses | Mean rounds |
|---|---:|---:|---:|
| Before recovery and marriage changes | 200 | 63 | 13.88 |
| Recovery-aware AI | 200 | 60 | 14.06 |
| Useful marriages, equal opening income, budget-aware AI | 200 | 15 | 9.71 |

The final iteration removes long low-agency tails. Earlier utility-based audits suggested increased choice density, but the stricter victory-set classifier gives a lower, more defensible final count. Its counts should not be compared directly with the earlier classifier. The earlier utility method counted 1,499 tradeoff candidates on the same release games; the stricter audit counts 1,087. Both reports are preserved. An even earlier short-horizon pilot mislabeled equivalent openings as interesting and was discarded.

## Concrete subgames

- **Commit or preserve gold:** exposing another Royal changes the court and increases tribute. Ending early can preserve coronation money and a defensive response. Seed 20001, round two, produced different preferred continuations for native Guardian development versus saving the order/gold.
- **Investment or military tempo:** an estate costs three and produces two per surviving income turn. A Commander can raid it; a Guardian blocks the route. Development, interception and attack sequencing interact without another score currency.
- **Marriage or bloodline resilience:** an allied Royal helps reach three and brings an ability. A Queen becomes the shared weak point, while upkeep and tribute rise with the retinue. Her removal can break multiple dependencies and a claim.
- **Brace now or keep the response:** only one paid answer is available per rival turn. A small probe can draw the response before a larger challenge; Ambush consumes a concealed card and can stop the attack before retaliation.
- **Recall or stay exposed:** healing costs an order now, a later deployment cost and lost presence. A poorly timed recall breaks your own claim.

## Limits and remaining design work

The run correlates House, policy, seat and seed. Seat-zero victories were 82/200; seat one 54/200; seat two 33/133; seat three 16/66. These are not clean balance estimates, but first-seat advantage warrants a counterbalanced study. Family setup explicitly shows who acts first.

A separate 600-game smoke test using default House policies and seeds 30000–30599 produced 133 Witness endings (22.2%), rather than 7.5%. This sensitivity is retained, not hidden. Fortify and Recruit were almost unused in the release policy mix, so their strategic value is not established by the tournament. A human family-table playtest, broader hidden-information agents and counterbalanced seats are needed before claiming commercial balance or exhausted design possibilities.

Policy sensitivity can reflect brittle AI behavior as well as sound strategy. A weak move that happens to exploit a continuation policy is still only a candidate for human review.

Raw reports: [earlier release utility audit](testing/audit-utility-release.json), [before recovery](testing/audit-before-recovery.json), [recovery](testing/audit-recovery.json), [release](testing/audit-release.json).
