# The Witness — executable prototype rules and decision ledger

These are new digital design decisions based on the source material. They do not claim to be the missing final tabletop rules. See `knowledge-base/` for original wording, unresolved branches, and illustrated card evidence.

## Match structure

One human and two AI-controlled courts play clockwise. Each encounter uses the fourteen cards belonging to each participating archive: 42 unique Royals total. Six playable archives exist, 84 figures in the collection. Archives are asynchronous historical groupings, including consorts and related lines. Alba intentionally follows the supplied broad Scottish grouping.

### Inheritance

Each player receives eight cards, seeded with five native Royals including a Founder and Queen, plus three cards from the mixed remainder. Every player simultaneously chooses three cards to pass clockwise, then two, then one. AI decisions use its own hand only. A no-triple recovery exchanges foreign cards for native cards from the available archive; the implementation must preserve uniqueness.

### Declaration

Choose three native Royals to reveal. Other players do the same. A declared Founder grants one protection, or two for Alba. Ordinary initial Royals do not fire Build abilities. The live concealed hand normalizes to five. The four-card public exchange is dealt. Interregna and Eudoxia only become active after declarations.

### One strategic action

| Action | Cost / eligibility | Outcome |
|---|---|---|
| Build | One native Royal, or a Royal of a house linked by a living marriage | Move it to your public court. Founder counts for two authority, other active Royals for one. A built Founder, Warlord, or Lawgiver grants protection. |
| Barter | One hand card and one selected public-exchange card | Swap them. The public exchange represents a standing, consenting market offer. This is the prototype's explicit consent rule; no AI hand is exposed. |
| Seize | Discard two same-house hand cards; Plantagenet may instead use a Warlord plus any card | Target a rival's non-Founder, or their Founder if it is their only card. Protection absorbs the move. Otherwise transfer the Royal to your court; a foreign captive requires marriage to count. |
| Marry | One active, unmarried Queen in your court plus a foreign hand card from a house not already joined | The Queen opens that house and the foreign Royal enters your court. One Queen supports one marriage. Multiple Queens allow multiple houses. |
| Betray | Discard an Intriguer; target a rival whose house is linked to yours | Remove a target Royal, subject to protection and Founder immunity. Tudor, the Velvet Veil, and the intrigue encounter bypass the marriage requirement. |
| Conceal / Scheme | Discard one hand card | Replenish and gain protection. If the hand is entirely empty, petition instead: take the first public Royal if available and gain protection. |

After a move, replenish the actor's hand to five if cards remain and refill the public exchange to four. Shuffle discards when the draw archive runs out. Never duplicate a figure. Exhaustion may temporarily leave a smaller hand; petition guarantees a legal turn while history continues.

## Protection, marriage, and collapse

Protection holds at most two charges (three with Saint's Medallion). Each charge absorbs one hostile action or historical card loss. A claim to the throne spends one protection, exposing the coronation to meaningful counterplay.

Removing a married Queen breaks her link immediately. Foreign cards remain in play but cease contributing authority unless another live marriage permits their house. If fewer than two native Royals remain, all the court's marriages break. The surviving core remains playable: a player can Build native Royals to recover. Founder immunity applies to Seize and Betray while the court has other Royals, but the Founder contributes no automatic supremacy.

## Victory and history

Default skirmish target: nine authority. Tutorial: seven. Campaign targets vary by encounter (eight to ten). Royal Charter lowers only its owner's target by one. Reaching the target starts a public claim and spends one protection. Falling below target immediately removes the claim. Secure it by remaining above the target until your next turn.

A new round reveals one Eudoxia fragment; from round ten, two. Three paintings contain nine fragments apiece. Completing any painting immediately ends the game: Eudoxia wins and all courts lose. Historical resolution precedes a pending start-of-turn claim check when a new round begins. Tutorial gives two early rounds of breathing room before history starts.

Every third round draws one of eight Interregna (every second in the Fractured Realm). Effects can remove Royals, break marriages, remove or grant protection, refresh the exchange, or accelerate paintings. The source's rank-based Blood Edict is preserved in the knowledge base; ranks were not adopted into this prototype because the deck does not reconcile that system.

## House identities

- Alba: Founders grant two protection when declared or built.
- Plantagenet: a Warlord can form a competing pair with any other card.
- Tudor: Intriguers can betray any court.
- Valois: building a Lawgiver removes one fragment from the most complete painting.
- Habsburg: every living marriage grants one additional authority.
- Bourbon: the house's active Founder grants one additional authority.

## Replay structure

Chronicles comprise three branching acts and a final coronation, four victories in total. Two routes are offered at each early act. Victories grant a choice of three available heirlooms; selected effects persist through the run. Failure ends that run; renown and discovered figures remain. A completed chronicle grants additional renown. The daily challenge fixes seed, house, difficulty, and encounter modifier using the UTC date; best score is stored locally. Repeating the same completed match does not repeatedly grant renown.

All houses are available immediately. Unlocks are run heirloom choices and archive discoveries, not paid cards or power purchases. No multiplayer, backend account, cloud save, native app binary, or historical specialist review is implied.

## AI and determinism

The AI uses the same enumerated legal moves as the UI. It values authority, new marriage access, defense, and disrupting imminent rival claims. It reads its own concealed hand and public courts/exchange, never another hand or future deck order. Difficulty changes decision noise and how strongly rivals prioritize disrupting claims. Seeded randomness drives drafts, shuffles, history, and AI choice; saves retain the random state.

## Deliberate departures from provisional source

| Source ambiguity | Prototype decision |
|---|---|
| Twelve-house branch; 14 Royals; counts provisional | Six-house collection, three-house encounters, 14 Royals each. |
| Approximately 24 Interregna | Eight distinct systemic event rules reused by seeded draws. |
| Founder treatment open | Two authority, protection, conditional seizure immunity. |
| Completion count open | Authority target plus a full circuit of rivals' turns. |
| No circulation procedure | Five-card replenishment, public exchange, discard recycling, exhaustion petition. |
| Seize pair grammar open | Matching pair, Founder restriction, foreign captive rules. |
| Marriage counting and succession open | Explicit live links, bonus authority for certain houses, dormant foreign cards after link loss. |
| Betray has no procedure | Intriguer removal with alliance eligibility and named exceptions. |
| Eudoxia frequency unknown | Public round-based reveals and late-round acceleration. |
| Outsiders future-facing | Excluded from this release. |

## Status

Rules are executable and simulation-tested. Balance remains prototype balance. Automated AI-vs-AI statistics are diagnostics, not a substitute for a representative human playtest study.
