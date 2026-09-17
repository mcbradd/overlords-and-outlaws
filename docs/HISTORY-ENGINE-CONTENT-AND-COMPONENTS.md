# History engine — normative content and physical inventory

**Next-design overlay, 17 September 2026:** [R4 suit and rank](SUIT-AND-RANK-DESIGN.md) supplies an explicit proposed A–K mapping for these same 52 IDs and the additional physical evidence requirements. Collector slots below remain identifiers, not runtime rank values. R4 is not yet implemented; preserve this baseline and source art until the coordinated content migration.

Companion to [the implementation spec](HISTORY-ENGINE-IMPLEMENTATION-SPEC.md), 16 September 2026. This is proposed implementation data, not a change to the current runtime, archive or source art. Preserve original `src/content.ts` IDs and portrait mapping through `src/character-art.ts`; every retained ID uses its existing mapped portrait as source, never overwrites that source. New derivatives receive ruleset/art revision IDs.

## The 52-person manifest

Every listed Noble now has executable Hand and Court instructions; Queens also print their marriage instruction. See the [sixth-grade card-language revision](CARD-LANGUAGE-REVISION.md), which supersedes the original blank-face baseline. `Queen` below is an explicit **game marriage-eligibility tag**, not a factual assertion of the person's historical title. Founder is a printed identity/concept tag and does not imply immunity or extra resources. All other old combat-role permissions are retired in the new ruleset. Full historical titles and identity sources come from the current portrait research records and require editor verification before print. An original role field is not historical evidence.

| ID | Name | Founder | Queen game tag | Alba branch |
|---|---|---|---|---|
| alba-0 | Kenneth MacAlpin | yes | no | Alpin |
| alba-1 | St Margaret | no | yes | Dunkeld |
| alba-2 | Malcolm III | no | no | Dunkeld |
| alba-3 | David I | no | no | Dunkeld |
| alba-4 | William the Lion | no | no | Dunkeld |
| alba-5 | Alexander II | no | no | Dunkeld |
| alba-6 | Alexander III | no | no | Dunkeld |
| alba-7 | Robert the Bruce | no | no | Bruce–Stewart |
| alba-8 | Marjorie Bruce | no | yes | Bruce–Stewart |
| alba-9 | Robert II | no | no | Bruce–Stewart |
| alba-10 | Duncan I | no | no | Dunkeld |
| alba-12 | Constantine II | no | no | Alpin |
| alba-13 | Matilda of Scotland | no | yes | Dunkeld |
| plantagenet-0 | Henry II | yes | no | — |
| plantagenet-1 | Eleanor of Aquitaine | no | yes | — |
| plantagenet-2 | Richard I | no | no | — |
| plantagenet-3 | John | no | no | — |
| plantagenet-4 | Henry III | no | no | — |
| plantagenet-5 | Edward I | no | no | — |
| plantagenet-6 | Edward II | no | no | — |
| plantagenet-7 | Edward III | no | no | — |
| plantagenet-8 | Philippa of Hainault | no | yes | — |
| plantagenet-9 | Richard II | no | no | — |
| plantagenet-10 | Edward the Black Prince | no | no | — |
| plantagenet-11 | Joan of Kent | no | yes | — |
| plantagenet-13 | Isabella of France | no | yes | — |
| tudor-0 | Henry VII | yes | no | — |
| tudor-1 | Elizabeth I | no | yes | — |
| tudor-2 | Henry VIII | no | no | — |
| tudor-3 | Mary I | no | yes | — |
| tudor-4 | Edward VI | no | no | — |
| tudor-5 | Elizabeth of York | no | yes | — |
| tudor-6 | Margaret Beaufort | no | no | — |
| tudor-7 | Edmund Tudor | no | no | — |
| tudor-8 | Jasper Tudor | no | no | — |
| tudor-9 | Margaret Tudor | no | yes | — |
| tudor-11 | Arthur Tudor | no | no | — |
| tudor-12 | Owen Tudor | no | no | — |
| tudor-13 | Catherine of Aragon | no | yes | — |
| habsburg-0 | Rudolf I | yes | no | — |
| habsburg-1 | Maria Theresa | no | yes | — |
| habsburg-2 | Maximilian I | no | no | — |
| habsburg-3 | Charles V | no | no | — |
| habsburg-4 | Philip I | no | no | — |
| habsburg-5 | Ferdinand I | no | no | — |
| habsburg-6 | Philip II | no | no | — |
| habsburg-7 | Anna of Austria | no | yes | — |
| habsburg-8 | Margaret of Austria | no | yes | — |
| habsburg-9 | Ferdinand II | no | no | — |
| habsburg-10 | Leopold I | no | no | — |
| habsburg-11 | Charles VI | no | no | — |
| habsburg-13 | Mary of Hungary | no | yes | — |

Exactly four of the original 56 identities in these modules are omitted from the **new playable 13-card manifests**: `alba-11` Donald II, `plantagenet-12` Geoffrey of Anjou, `tudor-10` Mary Tudor of France and `habsburg-12` Joseph II. This is a bounded prototype curation choice prioritizing the existing marriage access and core institutional examples, not a judgment of historical importance. Their archive entries, art, legacy playability and original files stay intact. Valois and Bourbon's 28 identities also remain preserved and unconverted. Replacing a retained identity later is a versioned content change requiring all setup/balance/print gates again.

Marjorie Bruce, Maria Theresa and other tags especially require the common reference note: “Game offices and marriages explore counterfactual arrangements; the archive distinguishes documented titles and relationships.” For example, Marjorie is not asserted to have been a reigning queen by giving her the game's marriage tag. A concise `Queen · marriage role` label can coexist with her verified historical title. Do not infer sex, age or marriage eligibility from art. If historical/editorial review changes game eligibility, revise the manifest and all component maxima explicitly.

Manifest validation: 13 unique IDs per selected module; exactly one Founder; Queen counts Alba 3, Plantagenet 4, Tudor 5, Habsburg 4; every portrait path resolves; no ID belongs to two manifest modules; all retained printed IDs match immutable originals. Collector slots 1–13 follow manifest order and never replace stable IDs. Law IDs `law-alba`, `law-plantagenet`, `law-tudor`, `law-habsburg`; Interregnum IDs A1–A3/P1–P3/T1–T3/H1–H3 as defined in the main spec. Painting IDs `painting-alba`, `painting-plantagenet`, `painting-tudor`, `painting-habsburg`, with fragment IDs suffixed `-1` through `-6`, arranged left-to-right across the top row then bottom row. Painting names/compositions are editorial art deliverables, not additional mechanics.

## Physical state-to-component inventory

The dimensions below are initial manufacturable-layout targets, not supplier-certified production specifications. Use flat printed/punchboard equivalents for all sculptural objects. Supplier acceptance and sample inspection remain required.

| Component | Quantity in four-module core | State/facts represented and reuse |
|---|---:|---|
| Nobles, 63×88 mm provisional trim | 52 | One instance of each listed ID; same opaque back |
| Interregna, 63×88 mm | 12 | Same opaque History back as fragments; full operative text and typed lifecycle |
| Painting fragments, 63×88 mm | 24 | Four 3×2 paintings, each 189×176 mm before spacing; all six identities public once drawn |
| Dynasty Law archive cards | 4 | Central collection/reference originals; not the only player-readable copies |
| Two-sided Dynasty selection/reference cards | 4 | One per module; shared opaque backs permit random module selection, faces identify the module and its reference information. Separate from Noble/History decks and Law archive cards; all operative Laws remain available in every player's booklet. |
| Player reference booklets | 4 | Each contains all four Laws, core actions, timing, Regency, Card Text glossary and reminders |
| Court/Leverage mats | 4 | Seat emblem, organizing rows and commitment area; extend onto table without cap |
| Crown/Act procedure mats | 4 | Old Ruler ID, named heir IDs, witness/Queen ID, sealed-heir space, route, round and maintenance reminder; wet/dry-erase surface tested for ordinary use |
| Sealed-heir opaque sleeves | 4 | One per seat, same opaque construction; no marked card backs |
| Ruler markers | 4 | One per seat, distinct from global Crown |
| Global Crown and stage tile | 1 each | Vacant/Proclaimed/Reigning; current claimant; transfer progress is not points |
| Regency duration tile | 1 | First/Second Reign for the one global Crown |
| Named heir markers | 8 | Maximum two named candidates for each of four Alba declarers; unused markers stay in tray |
| Action seals | 12 | Three per seat, available/spent sides; no ownership transfer |
| Pass markers and strip | 4 + 1 | Ordered consecutive passes, cleared by committed action |
| First-seat marker and round track | 1 each | Round track 1–24; no round count affects score; baseline bound fits |
| Numbered marriage pairs | 17 pairs / 34 halves | The 52-card manifest contains 17 marriage-eligible Queens; each pair uses one; keep spare halves in the tray |
| Petitioned ID register + optional Court reminder markers | 1 register + 52 markers | Public register lists targeted Noble instance IDs for the round. Court markers are removed before a card enters a private hand/packet and reapplied if it re-enters Court; never mark a hidden card or reveal a Barter selection. Register preserves eligibility across moves; clear all at round start. |
| Event register mats | 12, target 100×140 mm | Each has event ID, pending/active side, reveal/activation/expiry round boxes, frozen seat obligations, four printed Dynasty checkboxes, two Attack contributor-ID fields and completion marks. Erase only once event leaves active/pending play. All independent facts fit without reusing proof. |
| Event association markers | 12 | Match each register to its actual event card; sequenced row is reveal order |
| Reusable markers/pencils | 4 pens + cleaning cloth | Fill public register/procedure facts; no concealed writing except simultaneous selections |
| Fragment once-veiled rings | 24 | Persistent once-ever fact per fragment; remains after unveiling until game reset |
| Active Veil markers | 4 | One per initiator; seat emblem and erasable absolute start-of-round expiry (R+2 when begun in R), sits on fragment. Reuse only after that fragment unveils. |
| Private screens / hand racks | 4 | Hands/selection packets; physical line-of-sight privacy, not anti-cheat hardware |
| Simultaneous-choice slips | 4 erasable | One selected ID per seat; locked face down, reveal together; enough for the baseline's bounded choice batches |
| Separate labeled pile places | 4 | Dynasty Deck, History Deck, Noble Past, History Past; each Past order preserved on inspection |

The maximum-state paper audit uses 52 Nobles, all 12 events/registers and all 24 fragments distributed consistently with card conservation, including duplicate Dynasties and a large single Court. A typical 24-Overlord screenshot is not the maximum legal layout. No fixed renderer array may cap membership. Public commitments use seat-labeled mat space; no per-card owner token is needed while in that clearly bounded space. Cards temporarily presented outside a mat use the seat emblem on the action/choice display. Never recolor a foreign card's Dynasty frame.

**Table layout:** target full game on a 1200×900 mm table, using a central board around 600×400 mm plus movable Court mats, four separate painting trays and event registers. Prove this in M1 using actual-size paper rectangles and legal dense states before committing to folding geometry. If the absolute maximum cannot fit, specify a 1500×900 mm extended setup and show it on packaging; do not pretend camera panning solves a physical footprint. A painting's six cards form a real image; a decorative easel may spotlight one painting, while all selected paintings remain simultaneously inspectable in persistent trays. Leverage and ongoing History are never stacked to hide required evidence. Scenic walls and digital easels are not required physical components.

Manufacturing worksheet required for each row: quantity, finished size, material, thickness, coating, color profile, bleed/safe area, orientation, punch/sleeve tolerances, tray cavity, supplier proof owner, unit/assembly cost and replacement policy. Obtain comparable standard and optional deluxe quotes; cost ceiling/MSRP are not invented in this spec. Standard print-and-punchboard materials must reproduce every rule and visual distinction. Verify residue/legibility for erasable registers, opaque sleeves, color/shape readability, setup/reset time, packing inventory and wear after repeated handling. Decoration cannot require miniature assembly before a family can play.

## Four institutional examples for paper tests

These are **counterfactual game situations**, not historical event reenactments. The sourced rationale is institutional, not a claim that these people actually exchanged the modeled office.

- **Alba:** Kenneth is Ruler; David (Dunkeld) and Robert the Bruce (Bruce–Stewart) are named candidates. David is seized into a rival's hand. Robert remains, so the Crown survives. A rival must change its bargaining target to the remaining claimant. The unused candidate is not a fragile mandatory token.
- **Plantagenet:** Henry II names Richard heir and John Charter Witness. Seizing John breaks the Charter route even if Richard is safe. A bargain for John's return restores an option for a new proclamation, never retroactively repairs the forfeited Crown. Institutional support has its own exposed person.
- **Tudor:** Henry VII seals Mary I under the Act. She cannot be spent for Counterclaim while committed; at the next round start she is revealed and becomes the new Ruler. Opponents receive a full round to contest Mary with matching Tudor leverage; secrecy is temporary, not permanent invulnerability.
- **Habsburg:** Rudolf rules; native Queen Maria Theresa supports foreign spouse Eleanor. Eleanor is the heir and Maria Theresa survives Rudolf's scheduled departure, so support can continue. If the sponsor were the departing Ruler the arrangement would be illegal at entry. This tests marriage continuity rather than awarding a marriage bonus.

For every example, swap the Law while preserving equivalent card access and compare the best offered exchange, concealed card and vulnerable target. If only the number of pieces collected changes, revise the institutional design. Source references for actual history are in the main spec and existing portrait evidence audit; these examples do not certify each title, date, portrait or a comprehensive genealogy.
