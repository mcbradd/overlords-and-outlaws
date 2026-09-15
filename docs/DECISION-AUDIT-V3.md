# Revision 3 decision audit — 15 September 2026

## Conclusion

The final revision fixes specific degeneracies and completes matches faster than the first V3 candidate. It does **not** demonstrate a higher rate of meaningful choices than V2. Automated continuations find 621 plausible tradeoff opportunities in 5,372 audited opportunities (11.6%). Calling those 621 decisions truly interesting to a human would overstate the evidence.

## Method and reproducibility

`scripts/decision-audit.ts` runs complete seeded games and samples the first seat's discretionary orders and defensive responses. Zero-order turns are excluded. Up to nine representative orders and all available responses are rolled to terminal outcomes under four deterministic continuation policies: rush, economy, defense, adaptive. Candidates are grouped by action category to reduce duplicate gestures.

Own victory is 1; any loss, including another House or Eudoxia, is 0. Distinct non-dominated sets of winning continuations are **tradeoff candidates**. A sole sampled winning alternative is **forced**; a single strictly superior frontier is **dominant**; equivalent frontier vectors are **trivial**; no sampled winning alternative is labeled **unavoidableLoss** in raw JSON. That last name means only _no win in these sampled continuations_, not a proof that the real position is lost.

The final audit covers exactly seeds 20000–20199, split into four disjoint 50-game shards with offsets 0, 50, 100 and 150. All four use the same final mechanics. `scripts/aggregate-v3.ts` preserves the shards and combines their counts in [the release report](testing/v3-release-audit.json). Example command: `npx tsx scripts/decision-audit.ts 50 v3-release-100 100`.

Production AI uses public state and its own hand. Offline rollouts retain the actual fixture state; they do not resample possible hidden hands. These four deterministic policies are a narrow search, not perfect play, a family bargaining simulation, or a human enjoyment metric. Later seats participate in full games but their decisions are not included in the first-seat choice audit.

## Final 200-game results

| Classification             | Orders | Responses | Total |
| -------------------------- | -----: | --------: | ----: |
| Plausible tradeoff         |    597 |        24 |   621 |
| One sampled winning option |    649 |        87 |   736 |
| Dominant sampled option    |    412 |        18 |   430 |
| Equivalent/trivial         |    571 |       116 |   687 |
| No sampled winning route   |  2,238 |       660 | 2,898 |
| Audited opportunities      |  4,467 |       905 | 5,372 |

Mean game length: **12.035 rounds**. House victories: **145**. Eudoxia victories: **55 (27.5%)**. Policy wins: economy 40, adaptive 42, defense 36, rush 27. One House won on the deadline round; 56 games reached round 26 but only 55 ended with Eudoxia.

The game histories include 7,218 attacks, 1,223 claims, 825 marriages, 1,072 estates and 208 hand renewals. These are action counts, not counts of interesting decisions. Fortify appears only twice and Restore 58 times: their strategic marginal value remains weakly evidenced.

## Iteration comparison

| Candidate, same 200 seeds                    | Mean rounds | Eudoxia wins | Tradeoff candidates / opportunities |
| -------------------------------------------- | ----------: | -----------: | ----------------------------------: |
| Historical V2                                |        9.71 |           15 |               1,087 / 4,427 (24.6%) |
| First V3 candidate                           |       15.19 |           76 |                 849 / 6,372 (13.3%) |
| Recovery candidate, Guardians enter sideways |       14.33 |           67 |                 840 / 6,492 (12.9%) |
| Final V3, Guardians enter upright            |      12.035 |           55 |                 621 / 5,372 (11.6%) |

Raw rejected candidates are [first V3](testing/v3-first-candidate.json) and [recovery candidate](testing/v3-recovery-candidate.json). The latter's original filename contained “final”; it was superseded and deliberately renamed in the evidence archive. These comparisons reuse seeds, so they are not independent new datasets.

The final choice was driven by coherent teachable mechanics, recovery from foreign-hand deadlock, useful immediate defense and reduced stalling within V3. The lower tradeoff rate is a regression under this proxy and remains open. We did not relabel forced or losing states to manufacture improvement.

## Additional held-out validation

After selecting the rules, 216 additional games used seeds 110000–110023 and all rotations at two, three and four seats: 48 two-seat, 72 three-seat and 96 four-seat games. No mechanics were tuned against these results. [Raw held-out report](testing/v3-held-out-balance.json).

- 151 House wins; 65 Eudoxia wins (30.1%); mean 13.060 rounds.
- Policy wins: economy 42, rush 37, defense 34, adaptive 38.
- 1,464 claims and 300 renewals.
- Guardian cards appear 29 times across winning courts, versus 147 Stewards, 149 Founders, 70 Commanders, 71 Queens and 27 Conspirators. Winning courts do not require Guardian stacks under these policies; this does not prove every role is balanced.
- Seat wins: 64/216 opportunities for first seat, 46/216 second, 34/168 third, 7/96 fourth. These unequal-denominator rates still flag a substantial order effect. House/policy rotation does not erase structural seat advantage.

Repeated 600-game development comparisons reused seeds 30000–30599; a separate 216-game rotated development set used seeds 90000–90023. Those informed the candidate and are not held-out evidence. Lower base income and cheaper claim variants were rejected. [Rotated development evidence](testing/v3-rotated-development.json).

## Next design questions

The next mechanical investigation should prioritize recoverability after a failed claim, excessive shared-loss outcomes, seat-order compensation derived from turn structure, and whether crown-only actions justify their menu space. Hidden-information and multiplayer incentives need broader sampling and human play. A higher action count, a lower average duration, or wins by every policy cannot establish elegant or maximally meaningful play on its own.
