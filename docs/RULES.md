# Revision 2: a family of rivals

This is the executable digital adaptation, not a claim that the provisional PDF rules are finished. Original wording and conflicts remain in the [knowledge base](knowledge-base/README.md). The later [designer correspondence](knowledge-base/designer-intent.md) gives family play, historical identity and fragile power priority.

## Table and victory

Two to four Houses play clockwise. Solo defaults to one human and two AI Houses; local family mode supports two to four humans, each choosing a distinct House. Private handoffs conceal hands between turns and defensive responses. Shared-device privacy relies on people looking away. There is no online multiplayer.

**Gather three family Royals, claim the crown, and hold that family through one complete turn from every other House.** A family Royal is either native to your House or joined by a marriage supported through a Queen connected to your House. This extends the source's three-matching-Royal declaration to marriage, making alliances useful and vulnerable. Unsupported foreign Outlaws supply force but do not count toward the dynasty or receive active role abilities.

Claim costs one order and **tribute equal to the sum of the gold costs printed on every exposed Royal**, including House discounts. It is spent even if the claim fails. A larger retinue demands a larger coronation. Each actual rival is named in the challenge track; no fixed arbitrary number of rounds is assigned. A claim breaks immediately if fewer than three family Royals remain or succession collapses. Surviving all named turns wins. A broken claim may be rebuilt and declared again.

At a round boundary, forecast history resolves first, then surviving claims, then the Witness deadline. Claim victory therefore wins a simultaneous deadline if history did not break it. All endings include a specific reason.

## Turn and economy

- Start with one native Founder, five gold and a curated five-card concealed hand containing development, defense, pressure and alliance options. Deck order is seeded.
- Each House has 18 unique cards: its 14 archive figures plus four foreigners from nonparticipating Houses. No historical card is duplicated within a table.
- Opening treasuries are already funded. **Income begins in round two** for every seat. Base income is four, plus two per estate and one per supported Steward, minus upkeep.
- Upkeep is one for each exposed Royal beyond three, plus one per supported foreign marriage. Court capacity is five; hand capacity seven; gold capacity thirty.
- Draw toward five cards at the start of a turn. Exhausted archives recycle displaced cards without duplication. Captured Royals remain with their captor until played, lost or captured again.
- Each turn grants two orders. Every action below uses one. Unused orders expire; gold is retained. End turn explicitly, including after both orders are spent.

## Role vocabulary

| Printed subclass | Source role | Gold | Force | Resolve | Active ability |
|---|---|---:|---:|---:|---|
| Anchor | Founder | 5 | 4 | 6 | Strong force and endurance |
| Diplomat | Queen | 3 | 2 | 4 | Supports foreign marriages |
| Commander | Warlord | 2 | 3 | 3 | Efficient military pressure |
| Guardian | Lawgiver | 3 | 2 | 6 | Intercepts attacks on its court |
| Conspirator | Intriguer | 2 | 2 | 2 | Sabotage on exposure; hidden Ambush |
| Steward | Royal | 2 | 1 | 3 | One recurring income |

Force deals pressure; resolve is remaining endurance. The historical figure's name is an identity, not a claim that these fictional abilities describe that person's conduct.

## Orders and subgames

**Expose:** pay the Royal's cost, place it in a free seat resting. Readies next own turn. Plantagenet Commanders are immediately ready. Foreign deployment without marriage gives force but no supported abilities.

**Marry:** expose a foreign card from hand linked to an active Queen. It contributes to the family and receives its role ability while supported. Habsburg discounts the cost by one. Queen loss breaks her direct marriages; dependent chains also lose legitimacy and abilities if disconnected from a native root. This can break a claim without capturing every member.

**Challenge:** a ready Royal attacks once per own turn. Choose a rival House and a target. Any active Guardians in that House must be confronted first. They do not protect other Houses. Review outgoing pressure, retaliation, and possible responses before committing.

- Against a Royal, both deal force simultaneously. A surviving attacker captures a depleted defender into its concealed hand if there is room. Otherwise the defender is displaced to its owner's discard. An exhausted attacker is displaced.
- Against an estate, any unblocked pressure destroys one estate and steals two gold. Guardians prevent reaching the estate; Brace can repel low-force raids.
- Against a crown, shields absorb pressure before stability. At zero stability, succession collapses: lose the newest non-Founder Royal (or the Founder if alone), one estate, marriages, and any claim; recover to eight stability. This is a disruption, not a separate health-bar victory.

**Defense response:** accept free, keep resources; Brace for one gold to block two pressure; or spend one gold and a concealed Conspirator to Ambush for three pressure before combat. A defeated attacker never lands its hit. There is one paid response per opposing House's turn. Accept does not consume it. This makes order sequencing, reserve gold and concealed cards matter.

**Invest:** three gold establishes an estate, maximum three. It earns two on future turns and can be raided or sabotaged. It repays its cost during its second surviving income turn.

**Fortify:** two gold adds three crown shields, capped at five. These do not protect Royals or estates.

**Restore:** two gold restores three stability, capped at twelve.

**Recruit:** two gold draws one extra card if the hand has room; Valois pays one.

**Recall:** return an exposed Royal healed to hand (or discard if the hand is full). This costs tempo and exposed legitimacy. Its marriages break. A later exposure costs gold again.

A supported Conspirator sabotages an estate belonging to the rival with the most estates; gold, then seat order break ties. Tudor also steals up to two gold. An unsupported foreign Conspirator does not activate this ability. Keeping a Conspirator concealed preserves Ambush instead.

## Houses

Alba Guardians cost one less. Plantagenet Commanders enter ready. Tudor Conspirators steal gold on supported exposure. Valois recruits for one. Habsburg married foreigners cost one less. Bourbon gains one crown shield at the start of its turns from round two while its Founder remains.

## History and Eudoxia

History is public and forecast. Every fourth completed round cycles through: pay two gold or lose one stability; overextension pressure of one per Royal beyond three; pay two per marriage or break it; recover two stability. Shields can absorb historical stability pressure.

Each completed round adds one fragment, cycling among the source's three paintings. **Nine fragments complete a painting.** Consequently the first completion is the 25th stroke: the paintings contain nine, eight, and eight fragments. If no dynasty has held, Eudoxia wins and every House loses. This is a turn-based shared threat, never a real-time timer.

## Teaching and replay

The guided lesson explicitly pauses history and Eudoxia. Teaching opponents develop and challenge each other; they do not attack the learner or claim. The player still wins through the real family, tribute and named-rival-turn rules. Normal skirmish, daily and chronicle matches use competitive opponents and the full Witness/history systems. Local family play uses the same normal rules.

Chronicles contain three branching courts and two earned heirloom choices. Daily tables use a fixed UTC-day seed, House and three seats. Saves are browser-local. V1 saves remain stored under their old key; incompatible rules are not silently converted.

## Tuning versus source

Three-Royal declaration, concealed/exposed states, Houses, marriage, seizure, Interregna, Eudoxia and nine-fragment paintings originate in the source. Combat stats, gold, orders, upkeep, the exact claim procedure, marriage eligibility and deterministic event/fragment pace are explicit prototype design decisions. They have gameplay reasons and automated evidence, not historical authority. The original passing draft and expansion systems remain documented in the knowledge base rather than being inaccurately described as implemented in revision 2.
