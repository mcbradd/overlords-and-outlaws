# Build 5 explicit test contract

Written before implementation, 17 September 2026. This is the acceptance scenario specification; executable tests must use these independent expected outcomes. Rule freeze will resolve any marked candidate branch before implementation. Automated checks and actual visual/agent evidence are separate gates.

## Unit and transition tests

| ID | Given / action | Required outcome |
|---|---|---|
| U01 | Load four explicit rank mappings | Four complete unique A–K suits; 52 original IDs; founder Ace; printed roles independent of rank |
| U02 | Change collector index while retaining rank | Rule comparison unchanged |
| U03 | Start each 2/3/4-seat seeded game | Exactly one native Founder in each Court and two cards in each hand; no duplicated/lost cards; reproducible deck |
| U04 | Recruit native hand card | Card leaves hand and enters same Court; no other card/resource created |
| U05 | Recruit foreign card, absent card, spent card, or out of turn | Reject atomically, state unchanged |
| U06 | Recall matching-suit rival Court card | Lead face-up committed; target/controller identified; exactly one response stage; no premature target movement |
| U07 | Recall wrong suit, own Court or already-attempted target | Reject atomically |
| U08 | Defend with same suit strictly higher rank | Both lead and answer committed until boundary; target remains; turn returns to next ordinary player |
| U09 | Defend with equal/lower rank or wrong suit | Reject atomically; response remains pending |
| U10 | Ace versus J/Q/K, versus 2–10; 2 versus Ace | Ace succeeds only for face leads; 2 answers Ace; enumerate all rank/suit pairs |
| U11 | Decline valid Recall | Target moves to attacker's face-up committed area and stays unavailable this round; dependent offices fail immediately |
| U12 | Duplicate response, ordinary action or pass during response | Reject; no duplicated cost/round transition |
| U13 | All players pass consecutively | End once; resolve victory before next start; return committed cards to correct holders; replenish and transfer in specified order |
| U14 | Pass / pass / legal action with three seats | Pass count reset; first passer can later act; no boundary |
| U15 | Empty hand with defense pending elsewhere | Empty player cannot bypass response; on own normal opportunity Pass legal |
| U16 | Claim with ruler alone or ruler plus incoming heir only | Reject; requires prior distinct public supporter |
| U17 | Play native heir with ruler and prior native supporter | Exactly three distinct IDs; Crown notice begins; claim round is not reign |
| U18 | Reach next start with intact claim | Crown goes to same nominated heir; full new round must pass before victory |
| U19 | Remove old ruler/heir/supporter before transfer | Claim fails immediately in each independent case |
| U20 | Remove new ruler/supporter after transfer | Crown fails; later recruitment cannot restore attempt |
| U21 | Remove old ruler after valid transfer | Follow frozen dependency rule; no accidental dependency on retired office |
| U22 | Legitimate victory coincides with round cap | Legitimate completed reign wins; otherwise cap is explicit draw, never fabricated shared loss |
| U23 | Ruler removed then native recruitment | New native becomes ruler legally; no reset/extra card |
| U24 | Empty deck during refill | No reshuffle, no undefined card; deficit remains explicit |
| U25 | Every legal action from seeded states | Unique location + conserved total + valid office ownership; immutable input |
| U26 | Maximum hand and adversarial sequence | Each initiative consumes available hand capacity; accepted exchanges never re-enable same-round cards; bounded formal refusals |
| U27 | Permute other hidden hands and deck with same observable facts | Public view/DOM/AI observable input identical; no private rank inferred from errors |
| U28 | Reload each phase including response and tutorial | Exact rule state and cursor restored; no repeated action/cost/transfer |
| U29 | Corrupt JSON, unknown schema, duplicate IDs, invalid phase/office | Decoder rejects with recovery message; original stored bytes preserved |
| U30 | Current save write alongside old v3/v4 keys | Old keys byte-for-byte unchanged; current namespace explicitly versioned |
| U31 | Continue each tutorial explanation/outcome | Only guide cursor changes; compare whole game state |
| U32 | Invoke untaught legal move via UI callback | Tutorial rejects without changing game or turning guidance off |
| U33 | Execute exact tutorial actions through reducer | Every one legal in prior state; initial leader+two; refill ordinary; actual Crown result |
| U34 | Replay public/authoritative records appropriately | Authoritative replay deterministic; public record omits hidden identities and deck order |

### Cross-review freeze amendments

Added before implementation after the written panel selected Trade and integrated marriage succession. Other R4 verbs are explicitly deferred by the normative core.

| ID | Given / action | Required outcome |
|---|---|---|
| U35 | Offer exact selected-suit/rank card to rival | Offered card public, hidden ownership not disclosed; binding pending response; directed recipient mark consumed |
| U36 | Decline while holding request / without holding it | Indistinguishable public outcome; offer retained; Pass semantics including possible boundary; no repeated recipient this round |
| U37 | Accept valid Trade | Exactly two IDs transfer to opposite Played areas, unavailable until next start; no immediate re-trade or retraction |
| U38 | Trade declared lower-native Recruit | Received card enters Court only if native and strictly lower; equal/higher/foreign rejects option; rulerless recovery; no Crown |
| U39 | Forged/stale Trade acceptance | No transfer/disclosure; original pending response intact |
| U40 | Foreign heir equal/neighbour existing native Queen | Integrated marriage claim legal with distinct native ruler; exact pair/supporter; one Crown clock |
| U41 | Foreign heir two ranks apart, A/K wrap, Q without Queen role, paired Queen | Reject atomically |
| U42 | Queen captured before/after foreign succession | Claim fails; unsupported spouse goes to current controller's Played; no orphan foreign office |
| U43 | Foreign spouse captured | Captor owns it in Played; Queen remains unpaired; no duplicate return |
| U44 | Old native ruler removed after foreign transfer | Intact foreign ruler/Queen sustain claim; old ruler no longer required |
| U45 | Supported foreign ruler after failed claim plus native supporter/heir | Native recovery claim legal; no permanent office lock |
| U46 | Hands already contain two at next start | Played return plus one new card each, deck permitting; no below-two starvation |
| U47 | Two-seat setup | Exactly selected two suits anywhere |
| U48 | A attempts target then B attempts same target | B retains attempt; A cannot repeat; weak ally lead grants no table-wide immunity |
| U49 | Exact normative tutorial fixture and sequence | Every listed move legal; win only end round 3; no guide-created cards or immunity |

U03 uses selected suits only. U13 returns Played then deals one new card each. U21 permits old-ruler removal after transfer. U07 restricts each attacker separately. U16/U17 allow a supported foreign ruler with native supporter/heir. These precise amendments govern the abbreviated rows above.

## Browser and visible behavior tests

| ID | Exercise | Required outcome |
|---|---|---|
| B01 | Cold opening / intro / table under slow loading | Themed readable preparation; essential assets decoded before reveal; no white flash, incomplete scene or private hand flash |
| B02 | Select/cancel/target/confirm every card action | No spend on selection; one explicit commitment; source/destination and consequences visible |
| B03 | Keyboard-only and touch routes | Same legal outcome; visible focus; no hover-only instructions; 44px targets |
| B04 | Every guide step and intermediate selection | Exactly one navy/gold guide; only currently taught target and Exit tutorial interactive; complete readable text |
| B05 | Active player, hidden hand, ranked threat and Crown phase | Names/counts/public state truthful; no seal vocabulary; no hidden identity in labels/tooltips; concise explicit goal |
| B06 | Camera focus/pan/reset and reduced motion | Real changed perspective; hit targets align; contact shadows/depth; reduced motion same readable causal states |
| B07 | Every viewport × screen/state in production plan | Actual screenshots opened and read; none accepted solely by bounds or pixel analysis |
| B08 | Every input with keyboard visual viewport and safe insets | Focused text/caret/error/submit/cancel remain visible and comfortably usable; actual-device versus simulated evidence labeled |
| B09 | All 52 faces plus shared assets | Full names, rank/suit/ability readable; portrait fills intended aperture; frame/stock corners match; no clipping/empty painted fields; 63:88 |
| B10 | Reload, handoff, exit and saved-game recovery | No leaked private cards, stale action or silently lost progress |
| B11 | Prod base path and revision | All assets load at published subpath; exact SHA/build match; tutorial and new game exercised on actual site |

## Observational gates

O01: Fresh agent receives only URL and screen-only learning task. Record its unaided explanation of the experience, victory, round, hand uses and concealed threats. Design agents cannot substitute themselves.

O02: Observe ten complete ordinary UI games on the exact candidate, logging each start, actual decisions, misunderstandings, terminal result and foregone alternatives. Engine simulations are separately labeled. A game interrupted by a bug is a failure record, not one of ten completed games.

O03: Antagonistic policy review seeks always-recruit races, compulsory defense, always-largest leads, no-use lower cards, refused trade, permanent lockout and repeat capped draws. Each actual failure becomes the next iteration's written goal/task/test before a fix.

O04: Audit every changed module and every admitted asset. Report what passed, failed or was unavailable; never equate full line coverage with absence of bugs, visual correctness or player enjoyment.
