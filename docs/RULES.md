# Current rules and historical archive

The currently published Build 5 core uses [archived succession rules](reviews/SUIT-AND-RANK-BUILD-5-SUPERSEDED.md). The next implementation is defined in [binding Build 6 suit/rank rules](SUIT-AND-RANK-DESIGN.md) and its [production package](BUILD-6-PRODUCTION-PLAN.md); it is not implemented yet. The older rules below apply only to the preserved `?archive=history-v4` runtime. Their seals, inheritance draft, History and paintings are not part of either core. See the [Build 5 evidence log](reviews/BUILD-5-EXECUTION-LOG.md) for the actual published status.

---

# History engine v4 — current prototype rules

**Design/runtime distinction (17 September 2026):** the [master design's R4 suit-and-rank candidate](SUIT-AND-RANK-DESIGN.md) proposes the next revision. It is not implemented by these current prototype rules. The R4 rank comparisons, Trade procedure and settlement durations must not be mixed into an existing game.

The complete rules authority is the [R3 specification](HISTORY-ENGINE-IMPLEMENTATION-SPEC.md), [content inventory](HISTORY-ENGINE-CONTENT-AND-COMPONENTS.md), and [delivery contracts](HISTORY-ENGINE-IMPLEMENTATION-CONTRACTS.md). The [v3 rulebook](legacy/RULES-V3.md) is historical; some of its old capacity claims were already superseded before this overhaul.

## Inheritance

Choose N different modules for N players, N = 2–4, from Alba, Plantagenet, Tudor and Habsburg. Modules belong to the shared pool, not individual seats. Each supplies 13 Nobles, three Interregna and six painting fragments. Shuffle Dynasty and History decks separately. Deal eight Nobles each.

Everyone locks three Nobles privately; pass packets clockwise simultaneously. Repeat with two, then one. Received cards may be passed. Lock and simultaneously reveal three matching-Dynasty Nobles to declare. Duplicate declarations are legal. Appoint a Ruler and retain five Outlaws.

Only a four-player 2/2/2/2 hand can lack a trio. Reveal failed hands. In first-seat order take the top Dynasty card publicly, place one different-Dynasty card in a public repair packet, and declare the resulting trio. After all repairs, shuffle repair packets into the remaining deck. Successful declarations remain untouched.

## People and relationships

A Noble in hand is an **Outlaw**; in Court, an **Overlord**. Printed Dynasty never changes. Your Bloodline contains native Overlords and foreign Overlords married to a native Queen in your Court. No transitive chains exist. Queen is an explicit game marriage tag, not a claim about historical titles or relationships.

Each person has at most one spouse. Losing either breaks both marriage halves. A foreign survivor stays in Court unsupported: no Ruler, heir, Witness or Bloodline action. Remarrying through an eligible native Queen can restore support.

When a Ruler leaves or loses support, finish the causing effect, then choose a remaining native interim Ruler. With none, there is no Ruler; a subsequent native Build may appoint its new Noble. Ordinary succession never wins. Hands and Courts have no capacity ceiling.

## Seals and actions

Each round supplies three seals per player. Every ordinary action and Counterclaim spends one from this same supply. No mid-round refresh, banking or transfer. Pass, bargaining consent and forced choices are free. Clockwise take one action or Pass. A committed action clears consecutive passes, even when countered. A passer can act later. All players passing consecutively ends the round immediately.

| Action                | Procedure                                                                                                                                                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build                 | Put one native Outlaw into Court, ready.                                                                                                                                                                                                                                |
| Withdraw              | Return your Overlord to hand; break relationships/offices and check succession.                                                                                                                                                                                         |
| Petition              | Draw one Noble if available and restrictions permit.                                                                                                                                                                                                                    |
| Barter                | Lock one or two Outlaws each. Both authorize inspection, privately inspect locked packets, then lock accept/decline independently. Two accepts exchange simultaneously and charge only the initiator's seal. Refusal spends nothing; learned information remains known. |
| Marry                 | Pair an unmarried native Queen already in Court with an unpaired foreign Outlaw or unsupported foreign Overlord you control.                                                                                                                                            |
| Press a Claim         | Commit a matching printed-Dynasty Outlaw; target an unpetitioned rival Overlord. If not Counterclaimed, transfer the person to your hand. Register the target ID even when countered.                                                                                   |
| Counterclaim          | Target controller spends a seal and Commits a matching printed-Dynasty Outlaw. Cancel the transfer. No nested response. Active restrictions may require rotation too.                                                                                                   |
| Address               | Follow the pending contribution or explicitly permitted active End procedure.                                                                                                                                                                                           |
| Attack an Interregnum | Rotate one ready supported Overlord to fill Muster or Secure. The two retained contributor IDs must differ. Both spaces Avert a pending event; active Attack requires explicit End permission.                                                                          |
| Veil                  | Discard an Outlaw permanently; conceal one never-veiled fragment until start R+2. One active Veil per initiator, once ever per fragment.                                                                                                                                |
| Proclaim              | Name the complete primary Law or Regency arrangement.                                                                                                                                                                                                                   |

Commitments remain public in seat-labeled Leverage until the next round start. Event registers retain evidence after cards return. Validate costs atomically. Invalid or stale previews spend nothing. Simultaneous mandatory choices use one snapshot, lock privately and execute together; never automatically pick the first eligible person.

## The Crown

There is one Crown. Primary Laws require a native Ruler and three native Overlords at entry only, plus their arrangement:

| Route                             | Required continuity                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alba: Recognition of the Kindreds | Two native heirs from different printed branches. Keep the old Ruler and at least one candidate before transfer. Choose a remaining candidate; afterward maintain that supported successor. |
| Plantagenet: The Charter          | Native heir and distinct native Charter Witness, both different from the Ruler. Keep the same Witness through settlement.                                                                   |
| Tudor: The Act of Succession      | Seal a native Outlaw as heir. It is unavailable for any other use. Reveal/verify at transfer and admit into Court. Invalid identity forfeits without substitution.                          |
| Habsburg: The Marriage Settlement | Foreign heir married to a native Queen who is not the departing Ruler. Maintain that exact supporting marriage through settlement.                                                          |
| Regency: any Dynasty              | A native Ruler and one other native Overlord as heir suffice, but the successor must survive two full rounds.                                                                               |

Proclamation's remaining round is notice; no victory then. At next start, verify permission, Retire the old Ruler to The Past, break its links, install the lawful successor and recheck support. A blocked precheck forfeits without retiring the old Ruler. The successor governs through a full public round, including refreshed rivals and History. After end effects/expiries a valid primary Law settles; Regency requires its second full reign round. Failed maintenance forfeits immediately; later repair never restores that attempt.

## History and Eudoxia

History draws are public. Pending Interregna initialize frozen obligations and check immediate completion before the next reveal. Contributions persist. At all-pass, recheck each pending condition in reveal order: Avert completed conditions; otherwise Activate and execute the printed initial effect. Active restrictions stack. Completing the old warning condition ends an active card only where End text explicitly permits it. The baseline's ongoing/recurring events expire at end of the following round. Inspect each of the twelve cards for exact text.

P2 selects only supported non-Ruler Crown dependencies: before succession, Alba candidates; Charter heir/Witness; Habsburg heir/sponsor; Regency heir. Never the sealed Tudor heir. After succession, only the same Charter Witness or Habsburg sponsor remains eligible.

Each selected module has one six-fragment painting. **When any painting has all six fragments unveiled, Eudoxia wins immediately and all players lose.** No ownership or score applies. A due Veil unveils in place before all other start operations. Nobody rescues an already completed painting. Crown controllers may pay the same Veil cost as everyone else.

## Exact boundary order

At start: advance round and first seat (except initial round one); unveil due fragments in stable order with immediate loss checks; return ordinary commitments; clear petitioned IDs; refresh seals/ready Overlords; conduct scheduled succession; resolve active recurring effects oldest first; reveal N History cards sequentially; in first-seat order draw one Noble for each hand below five, if available. Five is a draw threshold, not a holding limit.

At end: close actions; recheck/activate pending cards in reveal order; resolve end effects and expiries; check Crown settlement after Eudoxia; start the next round if no outcome. Empty decks never reshuffle. No card returns from either public Past pile. Forced historical Retire cannot reduce a Court below two native Overlords; voluntary departures and scheduled retirement are exceptions.

## Physical evidence and privacy

Use numbered matching marriage halves, reversible seals, distinct Crown/Ruler/heir markers, a Pass strip, event registers, petitioned IDs and absolute Veil expiry markers. Inspect The Past without changing order. Private cards/packets never carry identifying reminder markers.

The browser projects information before rendering and AI decisions. Handoff, blur and reload restore a curtain. Public exports omit hidden hands, deck order, reconstructible seeds and sealed identities. **Private full game save** deliberately includes the full local game. Device owners can inspect saves/devtools; this is ordinary shared-device privacy, not tournament anti-cheat.

Print at 100% from `/history-proof.html` or `output/pdf/history-engine-print-and-play.pdf`. These are prototype proofs, not supplier-certified files. The user deferred the early human paper-play gate for digital implementation. Actual-size handling, independent human adjudication and strategic viability remain unverified.
