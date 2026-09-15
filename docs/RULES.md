# Revision 3 — the visible rules of the table

This is the executable digital adaptation of Malachy Murray's provisional concept. Original wording and conflicts remain in the [knowledge base](knowledge-base/README.md). The [designer correspondence](knowledge-base/designer-intent.md) prioritizes family play, historical identity and the vulnerability of growing power.

## Table and victory

Two to four Houses take turns clockwise. Solo supports one human and one to three AI Houses. Family mode supports two to four humans choosing distinct Houses and passing one device privately. People must look away during private handoffs; there is no online multiplayer.

**Gather at least three family Royals, pay to claim the crown, then keep that family intact through one full turn from every other House.** Native Royals count automatically. A foreign Royal counts while married through a Queen connected to your native family. An unsupported foreigner may attack, but does not count toward the family or gain active role abilities.

Claiming spends one order and gold equal to the sum of the play costs of **all** your exposed Royals, including House discounts. The family panel lists each contributor. A larger court costs more to crown. Gold remains spent if the claim breaks.

The claim lists each actual rival House still entitled to contest. Falling below three family Royals or suffering succession collapse breaks it immediately. Surviving every named rival's complete turn wins. No score threshold or fixed survival-round quota replaces these conditions.

At a round boundary, History resolves first, surviving claims second, and Eudoxia's deadline third. A valid claim therefore wins a simultaneous deadline if History did not break it.

## Turn, gold and physical state

- Begin with one native Founder, five gold and five concealed hand cards. Each House has 18 unique cards: 14 native archive figures and four foreigners from Houses not participating at the table. Historical identities are not duplicated within a game.
- At the start of your turn, surviving Royals recover full health and turn upright. Damage persists through all intervening rival turns.
- Opening treasuries are funded already. Income begins in round two: **4 base + 2 per estate + 1 per supported Steward − upkeep**. Upkeep can reduce the treasury; the resulting treasury stays between zero and 30 gold.
- Upkeep is 1 for each exposed Royal beyond three, plus 1 per supported foreign marriage.
- Draw toward five cards at the start of a turn. Maximum hand seven, maximum court five. Empty decks recycle discard piles. Card identities are conserved.
- Each turn supplies two orders. Every action below except End turn spends one. Unused orders expire; unspent gold stays. A spent response token refreshes for each new rival turn.
- Upright cards can attack. Attacking turns a card sideways. Sideways cards still retaliate when attacked, but a sideways Guardian does not guard other pieces.
- Cards, damage counters, gold, order/response tokens, estates, crown shields/stability, marriage links, claim markers and painting fragments represent persistent state. The Founder is a Royal card; the crown is a separate House component.

## Roles

| Card label  | Source role | Gold | Attack | Health | Ability while supported                                     |
| ----------- | ----------- | ---: | -----: | -----: | ----------------------------------------------------------- |
| Founder     | Founder     |    5 |      4 |      6 | Strong attack and endurance                                 |
| Queen       | Queen       |    3 |      2 |      4 | Supports one foreign spouse                                 |
| Commander   | Warlord     |    2 |      3 |      3 | Efficient attacking Royal                                   |
| Guardian    | Lawgiver    |    3 |      2 |      5 | Enters upright; guards while upright                        |
| Conspirator | Intriguer   |    2 |      2 |      2 | Sabotages on play; can instead be spent from hand on Ambush |
| Steward     | Royal       |    2 |      1 |      3 | Adds one recurring gold                                     |

The figure's historical name identifies the collectible; these fictional abilities do not describe documented conduct. Internal names such as force and resolve remain for source compatibility; the player sees **attack** and **health**.

## Actions and responses

**Play Royal:** pay its gold cost into a free court place. Most enter sideways and attack on their next own turn. Guardians enter upright; Plantagenet Commanders also enter upright. Unsupported foreign Guardians may attack immediately but cannot guard until supported.

**Arrange marriage:** play a foreign hand card through an unmarried Queen in your active family. Each Queen supports one spouse. The UI selects an eligible Queen and identifies the link. Supported foreign Queens can themselves support a spouse; severing an upstream connection disables dependent family membership and abilities. Losing the supporting Queen breaks her direct link. Foreign marriage adds upkeep.

**Attack:** select an upright Royal, then a legal rival target. Upright active Guardians must be attacked before any other piece in their House. Other Houses are unaffected by that protection. The preview shows damage and retaliation plus conditional hidden responses.

- Royal versus Royal deals simultaneous damage. A surviving attacker captures a defender reduced to zero health into its hand. If that hand is full, the defender goes to its defender's discard instead. In mutual defeat, both go to their respective discards. No card is silently deleted.
- Any unblocked damage to an estate destroys one estate and steals up to two gold.
- Against a crown, shields absorb damage before stability. At zero stability, succession collapses: lose the newest non-Founder Royal (or the Founder when alone), one estate, marriages and any claim, then recover to eight stability. Collapse disrupts a dynasty; it is not a separate direct victory.

**Respond:** Accept costs nothing and preserves your response. Brace costs **2 gold** to block 2 incoming damage. Ambush costs **2 gold plus one concealed Conspirator**, dealing 3 damage before combat; a defeated attacker never lands its hit. One paid response is allowed per rival turn. Reserving it for a second attack or saving gold for the next House can matter. Production AI cannot inspect rival hands and no longer spends Brace when it cannot save the same doomed defender.

**Build estate:** 3 gold, maximum three estates. Each earns 2 from the next income turn onward and can be raided or sabotaged. Its second surviving payout exceeds its purchase cost.

**Fortify crown:** 2 gold adds 3 shields, capped at five. Shields protect only the crown.

**Restore stability:** 2 gold restores 3 stability, capped at twelve.

**Renew hand:** 2 gold (Valois: 1), discard your **entire hand**, then draw five. This remains available with a full seven-card hand, preventing captured foreigners from permanently blocking native draws. Recycled discards can be drawn again if the deck runs out.

**Return to hand:** withdraw a Royal, fully healed, to your hand, or to discard if the hand is full. Its marriages break. Playing it again costs gold. The order and temporary family loss are the cost of repositioning.

A supported Conspirator sabotages an estate of the rival with the most estates; gold, then seat order, break ties. Tudor also steals up to two gold. Keeping the card concealed preserves the Ambush option.

## House identities

- **Alba:** Guardians cost one less.
- **Plantagenet:** Commanders enter upright and may attack that turn.
- **Tudor:** supported Conspirators steal up to two gold on play.
- **Valois:** Renew hand costs one gold.
- **Habsburg:** married foreigners cost one less.
- **Bourbon:** gains one crown shield at the start of its turns from round two while its Founder remains, subject to the shield cap.

House color and crest identify lineage; the colored role band and icon identify function. Those identities remain distinct when a foreign Royal changes controller.

## History and Eudoxia

Every fourth completed round resolves the publicly forecast History event, cycling through: pay two gold or lose one stability; suffer one stability damage per Royal beyond three; pay two per marriage or break it; recover two stability. Shields can absorb historical stability damage.

Each completed round places one fragment, cycling among three paintings. A painting is a visible 3×3 grid: **nine fragments complete it**. The first completion is the 25th fragment, when the three paintings contain nine, eight and eight. If no House has secured a dynasty, Eudoxia wins and every House loses. This is turn-based pressure, never a real-time timer.

## Learning and replay

Ten short fixed lessons teach: playing, attacking, Brace, capture, marriage, estate income, a broken claim, a defended claim, hand renewal, and History/Eudoxia. Scripted opponents use legal engine actions; they can and do attack the learner. History and Eudoxia are explicitly paused in lessons 1–9 and enabled in lesson 10. Lessons have restartable setups and state-based completion conditions, not artificial victory timers.

Skirmish, daily, chronicle and family modes use the full rules. Chronicles contain three branching courts and two heirloom choices. Daily tables use a fixed UTC-day seed, House and three seats.

Saves are browser-local under oando-v3. Existing V2 collection/progression/settings migrate; incompatible in-progress V2 tables do not resume. The old save remains stored.

## Adaptation and limits

Three-Royal declaration, concealed/exposed states, Houses, marriage, seizure, Interregna, Eudoxia and nine-fragment paintings originate in the source. Gold, orders, combat values, recovery, upkeep, exact claim procedure and event cadence remain explicit prototype tuning choices. They have gameplay rationales, not historical authority. Original passing drafts and unimplemented expansions remain in the knowledge base.

See [V3 quality report](QUALITY-REPORT-V3.md) for the measured improvements and unresolved competitive-balance and human-comprehension limits.
