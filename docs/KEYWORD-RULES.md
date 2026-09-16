# Keyword and economy rules — September 16, 2026

Current designer decisions supersede earlier capacity and Response rules. Printed reminders are maintained in `src/card-rules.ts`; `src/duel.ts` is the live deterministic rules engine.

## Resources and holdings

Court size, hand size, Estates, gold, Shields and Stability have no gameplay ceiling. Deploying and marrying cost one order plus the displayed gold cost. Building an Estate costs one order and 3 gold. Fortify costs one order and 2 gold for 3 Shields. Restore costs one order and 2 gold for 3 Stability. Recall costs one order; the Noble returns to hand even when that hand already holds seven or more cards. Capture likewise adds the defeated defender to the surviving attacker's hand.

During Readying, Ready all Nobles, restore their health, collect income and draw toward five cards. A larger hand is retained. Base income is 4 gold, plus 2 per Estate and 1 per supported Steward, minus upkeep: 1 per Noble beyond three, plus 1 per foreign marriage. Opening treasuries are funded at setup; the normal income payment begins in round two. Most Nobles enter Spent.

## Keywords

- **Steward:** gain 1 gold at the start of your Readying phase, as part of the income payment. This is neither an activated ability nor income on another player's turn.
- **Queen:** during your turn, spend one order and pay a foreign Noble's displayed gold cost to play it from hand married to a supported, unmarried Queen. Each Queen supports one spouse. This is separate from playing the Queen. The current prototype selects the first eligible Queen in court order.
- **Conspirator:** on supported entry, destroy one rival Estate. The current deterministic target is the rival with the most Estates, then the most gold, then earliest player index. Tudor also steals up to 2 gold from that rival, even if no Estate remains. This is an entry trigger, not a repeatable action on a Ready Noble.
- **Ambush:** when your House is attacked, pay 2 gold and discard a Conspirator from hand to deal 3 damage to the attacker before combat. The card goes directly to discard, never to court. Additional Conspirators may be used if their costs can be paid.
- **Guardian:** enters Ready. Opponents may attack only your supported Guardians, protecting your other Nobles, Crown and Estates. Spent Guardians still protect. With several Guardians, any is a legal target. Protection ends when the last supported Guardian leaves or loses support. Non-attack effects such as Conspirator entry still resolve.
- **Commander:** your Nobles gain +1 Attack while attacking. Each supported Commander contributes separately; three give +3. The bonus does not change printed stats, persist after combat, or apply to defending retaliation.
- **Founder:** on supported entry, including setup, gain 3 Stability. Setup begins at 9 and the starting Founder raises it to 12. Paid recall/replay can trigger this repeatedly. Bourbon's supported Founder additionally gives 1 Shield during Readying from round two.

Native Nobles and foreign spouses connected through a supported Queen have active family abilities. Unsupported foreign Nobles retain their printed combat stats but do not supply family abilities or count toward a dynasty. Plantagenet Commanders enter Ready.

## Defending an attack

There is no Response token, per-turn allowance or per-attack action quota. Before combat, the defending player can Brace (2 gold, block 2 damage from this attack) and Ambush repeatedly. Brace reductions accumulate only on the current attack. Choose **Resolve combat** when finished. Combat resolves automatically after a paid defense if no further paid defense is affordable. If Ambush defeats the attacker, the attack ends immediately without combat damage. Otherwise attacker damage and defender retaliation resolve together.

At zero Stability, the succession-collapse rule still applies: lose a Noble and an Estate, break marriages/claims, and recover to 8 Stability. This is a consequence, not an upper limit.
