# Card clarity audit — baseline 16 September 2026

## Scope and evidence

This is an editorial, code-grounded audit of the **92 cards in the default History engine**, not the legacy game behind ?legacy=1: 52 Nobles, four Laws, twelve Interregna and 24 painting fragments. Baseline repository commit: **606423e9fbba21f36b734fc413562c79f3f87a98**. Baseline content version: **r3-9b5cb4df**, language/compiler **1.0.0**. The per-card hashes below preserve the audited source identities before the current revision. The source hash also includes metadata and provenance; it is a compatibility checksum, not an authenticity signature.

The test perspective is a first-time player using approximately a 12-year-old reader's vocabulary and reasoning, after an introduction to the basic physical nouns (card, hand, Court, Dynasty, round). **No children were recruited, observed or tested. These scores are expert estimates of wording risk, not reading ages, success probabilities, measured usability, or guarantees.** Familiarity with ordinary card games does not imply familiarity with this game's invented vocabulary.

Inspected primary implementation evidence: [card sources](../../src/history-engine/content.ts), [compiler and dictionaries](../../src/history-engine/compiler.ts), [legality](../../src/history-engine/rules.ts), [state changes and round boundary](../../src/history-engine/engine.ts), [full/compact/canvas faces](../../src/history-engine/face.ts), [inspector/rules UI](../../src/history-engine/app.ts), and [print-kit generator](../../scripts/history-cards.ts). Governing context: [card-language direction](../knowledge-base/revision-planning/DF-002-card-language.md), [designer intent](../knowledge-base/designer-intent.md), [History specification](../HISTORY-ENGINE-IMPLEMENTATION-SPEC.md), [language v1](../HISTORY-ENGINE-LANGUAGE.md), [physical direction](../PHYSICAL-GAME-DIRECTION.md), and [observed earlier comprehension failures](../PLAY-SESSION-02-REVIEW.md). The last document describes an earlier ruleset: it supplies failure patterns, not evidence that current novices made those same errors.

This pass inspects text, code and layout-generation paths. It does not claim to have visually inspected rendered screenshots or printed components. The parent implementation task owns current rendered visual verification. No art generation is needed for the audit; all source portraits are preserved.

## Scoring method

Five axes, each 0–2, sum to 10. Scores concern the full card/reference face, not the intentionally simplified battlefield face. The axis order in the inventory is **V/T/I/O/C**:

| Axis             | Question                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Vocabulary (V)   | Are the verbs and nouns literal, familiar, or introduced locally?                               |
| Targets (T)      | Does the card identify who chooses, how many, whose pieces, and eligibility?                    |
| Timing (I)       | Are trigger, sequence, duration and repeat/expiry clear?                                        |
| Outcome (O)      | Are cost, physical movement/destination and consequence predictable?                            |
| Completeness (C) | Can the reader apply the rule without missing instructions or excessive memory/cross-reference? |

**0** = absent, contradictory or misleading. **1** = can be understood after lookup/inference. **2** = locally explicit and consistent for the introduced base nouns. A text/engine mismatch is a blocking defect regardless of total. Absence of text cannot earn brevity points. A compact face can omit rules under the user's explicit exception, but its full inspection and manufacturing face must carry the authoritative rules.

The audit applies a strict card-first standard. A well-written general rulebook remains necessary: no short card can independently teach the entire game. This requirement means all card-specific permissions, restrictions, selectors and consequences must be stated in parsed text or precisely defined shared keywords, with matching physical actions. It does not mean eliminating every repeated term or printing a rulebook on each card.

## Baseline inventory: all 92 cards

Misunderstanding codes refer to the detailed family and per-card findings below. All Noble operative texts are empty. Fragments share the same nineteen-word form with their slot number substituted. Word counts are whitespace-delimited editorial counts, not a readability formula.

| ID                     | Printed name                   | V/T/I/O/C | /10 | Operative words | Misunderstanding / family       | Source hash |
| ---------------------- | ------------------------------ | --------- | --: | --------------: | ------------------------------- | ----------- |
| alba-0                 | Kenneth MacAlpin               | 1/0/0/0/0 |   1 |               0 | F; B: Alpin                     | c7e1b235    |
| alba-1                 | St Margaret                    | 1/0/0/0/0 |   1 |               0 | Q; B: Dunkeld                   | dc9ed683    |
| alba-2                 | Malcolm III                    | 1/0/0/0/0 |   1 |               0 | N; B: Dunkeld                   | 10b9a80e    |
| alba-3                 | David I                        | 1/0/0/0/0 |   1 |               0 | N; B: Dunkeld                   | fafa42f8    |
| alba-4                 | William the Lion               | 1/0/0/0/0 |   1 |               0 | N; B: Dunkeld                   | f838bd71    |
| alba-5                 | Alexander II                   | 1/0/0/0/0 |   1 |               0 | N; B: Dunkeld                   | 05092e53    |
| alba-6                 | Alexander III                  | 1/0/0/0/0 |   1 |               0 | N; B: Dunkeld                   | 60276e6d    |
| alba-7                 | Robert the Bruce               | 1/0/0/0/0 |   1 |               0 | N; B: Bruce–Stewart             | 9fb117bb    |
| alba-8                 | Marjorie Bruce                 | 1/0/0/0/0 |   1 |               0 | Q; B: Bruce–Stewart             | a4c8281f    |
| alba-9                 | Robert II                      | 1/0/0/0/0 |   1 |               0 | N; B: Bruce–Stewart             | 40952d5c    |
| alba-10                | Duncan I                       | 1/0/0/0/0 |   1 |               0 | N; B: Dunkeld                   | 1f2f2fdb    |
| alba-12                | Constantine II                 | 1/0/0/0/0 |   1 |               0 | N; B: Alpin                     | 50107036    |
| alba-13                | Matilda of Scotland            | 1/0/0/0/0 |   1 |               0 | Q; B: Dunkeld                   | 837aaee8    |
| plantagenet-0          | Henry II                       | 1/0/0/0/0 |   1 |               0 | F                               | 397c70fe    |
| plantagenet-1          | Eleanor of Aquitaine           | 1/0/0/0/0 |   1 |               0 | Q                               | bb68c53d    |
| plantagenet-2          | Richard I                      | 1/0/0/0/0 |   1 |               0 | N                               | d082445b    |
| plantagenet-3          | John                           | 1/0/0/0/0 |   1 |               0 | N                               | 628fb5d1    |
| plantagenet-4          | Henry III                      | 1/0/0/0/0 |   1 |               0 | N                               | 32d7d550    |
| plantagenet-5          | Edward I                       | 1/0/0/0/0 |   1 |               0 | N                               | 0d11a338    |
| plantagenet-6          | Edward II                      | 1/0/0/0/0 |   1 |               0 | N                               | 983bc1f8    |
| plantagenet-7          | Edward III                     | 1/0/0/0/0 |   1 |               0 | N                               | 97d6e2c2    |
| plantagenet-8          | Philippa of Hainault           | 1/0/0/0/0 |   1 |               0 | Q                               | b1da70f4    |
| plantagenet-9          | Richard II                     | 1/0/0/0/0 |   1 |               0 | N                               | b2048a94    |
| plantagenet-10         | Edward the Black Prince        | 1/0/0/0/0 |   1 |               0 | N                               | eb23ebe2    |
| plantagenet-11         | Joan of Kent                   | 1/0/0/0/0 |   1 |               0 | Q                               | 259a004f    |
| plantagenet-13         | Isabella of France             | 1/0/0/0/0 |   1 |               0 | Q                               | 1974758c    |
| tudor-0                | Henry VII                      | 1/0/0/0/0 |   1 |               0 | F                               | ec5ff63a    |
| tudor-1                | Elizabeth I                    | 1/0/0/0/0 |   1 |               0 | Q                               | fe1ecf03    |
| tudor-2                | Henry VIII                     | 1/0/0/0/0 |   1 |               0 | N                               | 4032fed9    |
| tudor-3                | Mary I                         | 1/0/0/0/0 |   1 |               0 | Q                               | 708c22b6    |
| tudor-4                | Edward VI                      | 1/0/0/0/0 |   1 |               0 | N                               | cfe812da    |
| tudor-5                | Elizabeth of York              | 1/0/0/0/0 |   1 |               0 | Q                               | d2a81f9e    |
| tudor-6                | Margaret Beaufort              | 1/0/0/0/0 |   1 |               0 | N                               | 90dd58d7    |
| tudor-7                | Edmund Tudor                   | 1/0/0/0/0 |   1 |               0 | N                               | 52e86e80    |
| tudor-8                | Jasper Tudor                   | 1/0/0/0/0 |   1 |               0 | N                               | a27dd497    |
| tudor-9                | Margaret Tudor                 | 1/0/0/0/0 |   1 |               0 | Q                               | 4a12f646    |
| tudor-11               | Arthur Tudor                   | 1/0/0/0/0 |   1 |               0 | N                               | 953f1595    |
| tudor-12               | Owen Tudor                     | 1/0/0/0/0 |   1 |               0 | N                               | 90c34d9b    |
| tudor-13               | Catherine of Aragon            | 1/0/0/0/0 |   1 |               0 | Q                               | 1a12b3b4    |
| habsburg-0             | Rudolf I                       | 1/0/0/0/0 |   1 |               0 | F                               | a31a886e    |
| habsburg-1             | Maria Theresa                  | 1/0/0/0/0 |   1 |               0 | Q                               | 6b796eb2    |
| habsburg-2             | Maximilian I                   | 1/0/0/0/0 |   1 |               0 | N                               | 16aa94b0    |
| habsburg-3             | Charles V                      | 1/0/0/0/0 |   1 |               0 | N                               | 616eeddf    |
| habsburg-4             | Philip I                       | 1/0/0/0/0 |   1 |               0 | N                               | b27bd6ed    |
| habsburg-5             | Ferdinand I                    | 1/0/0/0/0 |   1 |               0 | N                               | 83605285    |
| habsburg-6             | Philip II                      | 1/0/0/0/0 |   1 |               0 | N                               | 717527ee    |
| habsburg-7             | Anna of Austria                | 1/0/0/0/0 |   1 |               0 | Q                               | 6eae5480    |
| habsburg-8             | Margaret of Austria            | 1/0/0/0/0 |   1 |               0 | Q                               | 8d0a2b1c    |
| habsburg-9             | Ferdinand II                   | 1/0/0/0/0 |   1 |               0 | N                               | 532ff6b7    |
| habsburg-10            | Leopold I                      | 1/0/0/0/0 |   1 |               0 | N                               | a3e4d545    |
| habsburg-11            | Charles VI                     | 1/0/0/0/0 |   1 |               0 | N                               | 16282a95    |
| habsburg-13            | Mary of Hungary                | 1/0/0/0/0 |   1 |               0 | Q                               | 849e7fc4    |
| law-alba               | Recognition of the Kindreds    | 1/1/1/1/0 |   4 |              47 | law-alba                        | d1d90601    |
| law-plantagenet        | The Charter                    | 1/1/1/1/0 |   4 |              47 | law-plantagenet                 | 0972f48b    |
| law-tudor              | The Act of Succession          | 1/1/1/1/0 |   4 |              50 | law-tudor                       | 747a75fe    |
| law-habsburg           | The Marriage Settlement        | 1/1/1/1/0 |   4 |              46 | law-habsburg                    | 00df0899    |
| A1                     | Contested Recognition          | 1/2/1/1/0 |   5 |              39 | A1                              | cc75d3f0    |
| A2                     | Border Rising                  | 0/1/1/1/0 |   3 |              50 | A2                              | be7c2923    |
| A3                     | A Broken Recognition           | 0/1/1/1/0 |   3 |              34 | A3                              | d0ffa16a    |
| P1                     | The Barons’ Terms              | 1/1/1/1/0 |   4 |              30 | P1                              | d92d1f87    |
| P2                     | A Disputed Charter             | 0/0/1/1/0 |   2 |              29 | P2                              | 61ff7cf1    |
| P3                     | Closed Roads                   | 1/1/1/1/0 |   4 |              49 | P3                              | 9e3d2566    |
| T1                     | The Unsettled Church           | 1/2/1/1/0 |   5 |              24 | T1                              | 0c2bbd69    |
| T2                     | A Rival Proclamation           | 0/1/1/0/0 |   2 |              27 | T2                              | 4a846423    |
| T3                     | The Open Record                | 1/2/1/1/0 |   5 |              31 | T3                              | def18fd5    |
| H1                     | The Divided Inheritance        | 0/1/1/1/0 |   3 |              31 | H1                              | 8980f916    |
| H2                     | War of the Succession          | 0/1/1/0/0 |   2 |              41 | H2                              | 87285cd8    |
| H3                     | The Imperial Settlement        | 1/1/1/1/0 |   4 |              58 | H3                              | b6689792    |
| painting-alba-1        | The Kindreds at Scone · 1      | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 00d04763    |
| painting-alba-2        | The Kindreds at Scone · 2      | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 16f00b2f    |
| painting-alba-3        | The Kindreds at Scone · 3      | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 6b13eb1b    |
| painting-alba-4        | The Kindreds at Scone · 4      | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 48f3355f    |
| painting-alba-5        | The Kindreds at Scone · 5      | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | f82a71b3    |
| painting-alba-6        | The Kindreds at Scone · 6      | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 6cac8b47    |
| painting-plantagenet-1 | The Witness to the Charter · 1 | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 4a163ff1    |
| painting-plantagenet-2 | The Witness to the Charter · 2 | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 1d23d9cb    |
| painting-plantagenet-3 | The Witness to the Charter · 3 | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 54730c59    |
| painting-plantagenet-4 | The Witness to the Charter · 4 | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | f3ad55b7    |
| painting-plantagenet-5 | The Witness to the Charter · 5 | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | e5bc9eb9    |
| painting-plantagenet-6 | The Witness to the Charter · 6 | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | a7fa7813    |
| painting-tudor-1       | The Sealed Intention · 1       | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 35450580    |
| painting-tudor-2       | The Sealed Intention · 2       | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 6feea426    |
| painting-tudor-3       | The Sealed Intention · 3       | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 225eba6c    |
| painting-tudor-4       | The Sealed Intention · 4       | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 8c150b7e    |
| painting-tudor-5       | The Sealed Intention · 5       | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 1c9be550    |
| painting-tudor-6       | The Sealed Intention · 6       | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | ffa033e6    |
| painting-habsburg-1    | The Marriage Settlement · 1    | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 893b9108    |
| painting-habsburg-2    | The Marriage Settlement · 2    | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 097387d0    |
| painting-habsburg-3    | The Marriage Settlement · 3    | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 6f477ff0    |
| painting-habsburg-4    | The Marriage Settlement · 4    | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | 6cd88360    |
| painting-habsburg-5    | The Marriage Settlement · 5    | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | d12e5220    |
| painting-habsburg-6    | The Marriage Settlement · 6    | 1/2/1/1/1 |   6 |              19 | P: immediate loss / Veil timing | c33ad760    |

## Mechanical intention and likely first readings

### Nobles: 52 identity cards with missing instructions

**N — ordinary Noble.** Intended utility is shared across the roster: conceal in hand for bargaining, a matching Claim/Counterclaim, event contribution or permanent payment to Veil; enter the Court if native; enter through a native Queen if foreign; serve as Ruler/heir where eligible; rotate while supported to help defeat certain events; Withdraw to hand. The printed Dynasty never changes when control changes. A player can understand the name and affiliation but cannot infer any of those verbs from a face that says only “Noble.” Concrete first reading: “Do I put this down? What does it do? Is its number strength?” The collector fraction 01/13 is inventory information, not a value. Native/foreign are relative to the controlling player, not permanent card types. Same-Dynasty opponents still control their own cards.

**Q — Queen.** All Noble uses apply. A native, unmarried Queen in your Court can pair with one unpaired foreign Noble you control, moving that spouse from hand into your Court if necessary. This supports that spouse; it does not import the whole foreign Dynasty. If either spouse leaves, the remaining foreign spouse stays in Court unsupported; an unsupported foreign Ruler loses the office. The Queen label gives a hint, but “marriage role” does not explain who may marry whom, where either card must be, or what support means. Concrete first reading: “Can she marry my own King, an opponent's card, or more than one person?” Historical identity is not eligibility: queens can marry foreign queens under these counterfactual game rules. The roster's original Warlord/Lawgiver/Intriguer roles are not History-engine abilities.

**F — Founder.** The four Founders have the same shared mechanics as ordinary Nobles. Their printed Founder label has **no special permission, immunity, strength or setup requirement** in the audited engine. Concrete first reading: “Must I start with the Founder? Is this my permanent Ruler?” The legacy engine gave Founders powers; the current label risks importing obsolete expectations. Preserve Founder as historical/collector metadata only if visually distinguished from rules, or explicitly teach that it has no extra power.

**B — Alba branch.** All thirteen Alba faces have a branch field because the Kindreds Law needs two heirs from different branches. Alpin: Kenneth MacAlpin, Constantine II. Bruce–Stewart: Robert the Bruce, Marjorie Bruce, Robert II. Dunkeld: all other retained Alba Nobles. The field is mechanically consequential even though its historical editorial verification is separate. First reading: “Does branch change my Dynasty? Is Bruce–Stewart foreign to Alpin?” No. It is only the Law's printed subgroup selector.

All 52 receive 1/10 for the baseline full card: identity words are legible, but the operative actions are absent. This is a systemic presentation/language failure, not 52 different mechanical failures. The bloodline reminder in HTML inspection partly helps Court membership; print faces omit that reminder, and it does not teach shared actions. The inspector's separate paragraph also relies on unexplained action names. Do not invent 52 unique powers to solve a shared-instruction problem. Put shared, parsed permissions on every full face, add the Queen-only parsed marriage permission where applicable, and keep historical labels separate. Each script clause should permit a real action; deleting it must remove that permission in a runtime test.

### Laws: four distinct institutions obscured by procedural terms

| Card                                   | Mechanical intention / exact baseline behavior                                                                                                                                                                                                                                                                                                     | Concrete first-reader misunderstanding                                                                                                      | Revision requirement                                                                                                                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| law-alba — Recognition of the Kindreds | Proclaim with native Ruler and at least three native Court Nobles. Name two other native Court Nobles of different branches. At least one must survive continuously. Next round start, retire the old Ruler and choose a surviving named heir; keep supported successor through that full round to win.                                            | “Can the heir be in hand? Do I need both heirs forever? When is succession? Does settlement give points?”                                   | Say Court eligibility, one surviving heir, next-round transfer and win; make entry count/selector/continuity/duration parsed parameters.                                                                                 |
| law-plantagenet — The Charter          | Same three-native entry. Name one native Court heir and a different native Court Witness, both different from Ruler. Keep old Ruler, heir and Witness to transfer; then keep same Witness and supported successor through the full reign round.                                                                                                    | “Witness sounds like Eudoxia. Can I replace the Witness? Must I keep the old Ruler after retiring them?”                                    | Call the named person a Witness in context; state named continuity and successor phase separately; specify win and timing.                                                                                               |
| law-tudor — The Act of Succession      | Three native Court Nobles at entry, plus a fourth native Noble secretly removed from hand as sealed heir. Keep old Ruler and sealed card. At next start reveal and verify it; old Ruler goes to The Past; heir enters Court as Ruler. Keep successor through full reign round. If the attempt fails, reveal sealed identity and return it to hand. | “Is the seal an action token? Do I need three cards including the hidden heir? Can I use my hidden heir in a trade? Is revealing optional?” | Distinguish face-down commitment from the action seal; include entry zone, next-round timing, custody and failure rule in printed shared procedure. Removing card-specific hidden-heir instruction must change behavior. |
| law-habsburg — The Marriage Settlement | Three native Court Nobles at entry. Name one supported foreign Court spouse as heir and their native Queen sponsor, who cannot be the old Ruler. Maintain the same marriage continuously through transfer and the full reign round.                                                                                                                | “Does ‘who is not your Ruler’ modify heir or Queen? Can I swap spouses after proclamation? Which dynasty wins when the foreign heir rules?” | Name the Queen and heir explicitly; show whose claim wins; state same-pair continuity and loss consequence; separate Court ownership from printed Dynasty.                                                               |

All four rely on global rules for empty Crown, seal cost, no active prohibition, Ruler/three-native entry, transfer timing, continuous forfeiture, old-Ruler destination and winning. Defined base rules may carry common mechanics, but omission of the win and exact clock from every Law is especially damaging because Laws explain the game's central objective. The baseline compiler recognizes each complete paragraph as an enum, so most of those details are not actually specified by parsed numbers/selectors. A deterministic enum interpreter is useful infrastructure, but round-trip text equality alone does not prove that written parameters drive behavior.

**Regency is outside the 92-card manifest but part of the cognitive task.** It is the fallback with two native Court Nobles and a two-round successor reign. Its special timing must be in a clear shared rule or generated reference card; it must not be introduced only by an action-menu label. Shared Crown behavior should explain that loss of a required arrangement immediately empties the Crown; restoring the arrangement later starts a new attempt.

### Interregna: all twelve cards

The intended common lifecycle is visible public warning, player actions during the round, immediate activation at consecutive all-pass if unfinished, then expiry or an explicit early end. Contribution proof is public. An event cannot be ended after activation unless its card explicitly permits that. A rulebook can teach this lifecycle once, but the baseline faces mix Avert/Address/Attack/End/Expire/activation/pending in very little space, leaving novices to reconstruct it.

| Card                         | Mechanical intention / exact baseline behavior                                                                                                                                                                                                                                                                                                                                                          | First-reader failure and priority revision                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 — Contested Recognition   | Every player separately spends an action and commits one native hand Noble to prevent activation. Active event blocks all Proclaim attempts. Players can finish the same obligation after activation; previously recorded contributions count. Expires at end of the next round.                                                                                                                        | “Commit” sounds permanent and “through Address” adds another verb without another physical operation. “End: Complete ...” may be read as an end-of-round trigger. Use one prevention instruction, a short explicit “You may also finish this while active” rule, and visible kept progress. Explain commitment return in the shared action.                                      |
| A2 — Border Rising           | Two separate attacks, each one seal and rotation of a different ready supported Court Noble, prevent it. They can come from one or multiple players. While active, at each round start players with a Ruler choose a different supported Court Noble to retire. Baseline protects the last two natives, even while a foreign spouse may be lost. No early active attack-ending permission.              | “Muster and Secure” imply two different powers; “different Noble IDs” is programmer language. “Preserving at least two” requires a second filter and can be mistaken for a guaranteed minimum even when a player already has fewer. Simplify to two different contributors and remove the special native floor as an explicitly documented design revision.                      |
| A3 — A Broken Recognition    | At reveal record only players currently controlling unsupported foreign Court Nobles and their eligible card IDs. Each recorded player must Marry one of those original people with any eligible native Queen. No recorded players means immediate prevention. On activation return **all currently** unsupported foreign Court Nobles to their controllers' hands, including later unsupported people. | “Freeze players” implies losing turns. Restoring a marriage may imply original spouse only. The obligation uses the reveal-time snapshot but the penalty uses activation-time state. Say “Mark players who ... now”; then “Each marked player marries one of those Nobles.” Preserve a physical marked-card record or simplify the condition; do not rely on a hidden event log. |
| P1 — The Barons’ Terms       | Each player uses one action to rotate one ready native Court Noble before activation. While active a Counterclaim requires its normal seal plus matching committed hand Noble **and** an additional rotation of a ready native Court Noble. Readiness resets at round start.                                                                                                                            | “Also” depends on knowing the complete normal Counterclaim cost; rotating means unavailable for what? Can I rotate a foreign supported spouse? Explicitly retain native scope and show the added cost in the local response preview. Shared ready/rotate terms need exact physical definitions.                                                                                  |
| P2 — A Disputed Charter      | Two different ready Bloodline contributors prevent it. On activation the Crown holder chooses one eligible non-Ruler dependency and returns it to their own hand. Before transfer, dependencies include named public heir(s)/Witness/Queen; afterward, Witness/Queen only. A sealed Tudor heir is excluded. No Crown/dependency means no effect.                                                        | “Dependency” is neither a visible card type nor a child-facing relation. Players cannot derive the correct target list without another table. Simplify to one supported non-Ruler Court Noble of the Crown holder, returned to their own hand. This deliberately changes effects after succession and under Tudor; mark it as a design revision, not a wording-only correction.  |
| P3 — Closed Roads            | Across the whole table, use separate actions to commit two hand Nobles with different printed Dynasties. One player can supply both. While active no Petition unless the acting player's hand is empty. Same prevention condition may be completed while active; previous proof counts.                                                                                                                 | “Commit Nobles of two Dynasties” can mean each player contributes two, or two cards in one action. Say shared goal and one card per action. Empty hand is a clear literal exception once Petition is defined as drawing.                                                                                                                                                         |
| T1 — The Unsettled Church    | Each player separately commits any one hand Noble before activation. While active nobody can Marry. No early ending clause: completing commitments afterward is not an available action. Expires after next round.                                                                                                                                                                                      | A1 permits late completion; T1 does not. Similar-looking cards encourage assuming a universal rule. Label prevention and active behavior consistently, and show active ending permission only where it actually exists.                                                                                                                                                          |
| T2 — A Rival Proclamation    | Two distinct ready Bloodline contributors prevent it. On activation every player who can chooses a native Court Noble other than their Ruler; all choices return simultaneously to their respective controllers' hands.                                                                                                                                                                                 | “Return the chosen Overlords” does not state any destination. Retire elsewhere means permanent removal, making this omission dangerous. Print “Return them to their controllers' hands.”                                                                                                                                                                                         |
| T3 — The Open Record         | After reveal every player must either participate in a **completed accepted** Barter or personally Veil a fragment. Both sides of one accepted Barter satisfy their obligations. A declined/inspected offer does not. While active reveal one extra History card per round start for the whole table, before normal History draws; terminal painting completion interrupts further draws.               | “Each ... completes Barter” may imply every player must initiate and spend a seal. The consequence might be misread as one extra card per player. State “takes part in a completed trade” and “Reveal 1 extra History card” at shared round start.                                                                                                                               |
| H1 — The Divided Inheritance | Record players with at least one marriage at reveal. Each recorded player commits any hand Noble through its own action. On activation **every player now** with a marriage chooses one of their own; all chosen links break together. Foreign spouses stay unsupported in Court, not automatically returned/discarded.                                                                                 | “Freeze” suggests paralysis. “Break marriage” may imply removing both people; players who married after reveal can avoid payment yet still suffer the penalty. Explicitly distinguish marked obligations from the current effect. Retain spouse pieces and remove the physical pair markers.                                                                                     |
| H2 — War of the Succession   | Two distinct ready supported Court Nobles prevent it; incomplete attacks carry forward and the same two-contributor goal can end it while active. While active an already scheduled Crown transfer **fails and forfeits the whole claim** when its due round start arrives. It is not delayed until the war ends.                                                                                       | “Succession is forbidden” most naturally implies waiting. Actual forfeiture changes the strategic effect drastically. Print the failed-claim consequence explicitly. Attack's early ending occurs during the action phase and cannot undo a forfeiture already resolved at the start.                                                                                            |
| H3 — The Imperial Settlement | Shared two-Dynasty committed-card goal prevents it and can finish while active, retaining earlier proof. At active round start, players currently without a marriage must commit one hand Noble if possible. Those mandatory commitments spend no seal and **do not** count toward the prevention/end goal.                                                                                             | Same verb “Commit” appears in a player action and a mandatory penalty, inviting assumptions of shared credit/payment. State one action per prevention contribution and distinguish the forced effect. A player without hand cards pays nothing; no debt is created.                                                                                                              |

### Painting fragments: all 24 cards

Each exact ID and slot is listed above. All six members of a given Dynasty assemble one 3×2 painting. Revealed fragments never enter a player's private hand. The sixth currently unveiled fragment immediately causes **all human/AI players to lose** to Eudoxia, even during a multi-card History draw and before Crown settlement. A fragment becoming unveiled at round start can likewise end the game. The phrase “Eudoxia wins” is short but does not tell a first reader whether Eudoxia is a selectable player, whose painting matters, or whether the game's players lose.

The first-read trap is timing: “Can I draw the sixth and then Veil it before it counts?” The engine says no. Players must Veil an existing fragment before completion. Veil costs an action seal and permanent hand discard, lasts until start of round R+2, applies once ever to that fragment, and each player may have one active Veil. Those shared response rules belong on the shared action reference, while the fragment itself should say immediate completion and collective loss. Proposed form: “Reveal: Place in slot N of this painting. When its 6 fragments are face up, all players lose.” A short keyword reminder can explain covered/veiled, but cannot redefine the operative trigger.

The baseline compiler validates the numbered slot against metadata, so a mismatched text number is rejected. However, actual placement and six-fragment winning threshold are read from metadata/hard-coded runtime logic rather than a flexible parsed instruction. Revised scripting must either parse the operative numbers into the executed program or explicitly reject unsupported changes; a word change must never compile successfully while being ignored by the engine.

## Systemic mismatches and practical consequences

| Priority | Evidence-backed issue                                                                                                    | Why it matters                                                                       | Required validation                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| P1       | All 52 full Noble faces lack operative script; compiler rejects adding Noble text.                                       | Reading the card cannot explain its shared functions.                                | Full face script exists; removing an action clause removes actual legality.                                 |
| P1       | Laws compile into complete-paragraph route enums; entry count, heir filters and reign duration are hard-coded elsewhere. | Text is a label selecting an implementation, not a parameterized source of behavior. | Change legal text from three to four natives / one to two reign rounds and observe changed engine behavior. |
| P1       | H2 wording omits Crown forfeiture.                                                                                       | Reader predicts delay while engine cancels the victory attempt.                      | A due claim loses Crown with the old Ruler retained; displayed warning predicts that exact result.          |
| P1       | T2 omits destination.                                                                                                    | Physical game cannot adjudicate “Return” without inference.                          | Both text and preview specify controller's hand; simultaneous execution preserves conservation.             |
| P1       | P2's eligibility is a hidden procedural table.                                                                           | A list labelled “eligible” prevents free tabletop adjudication.                      | Adopt a simpler printed selector or print the complete exact selector; test Tudor and reigning states.      |
| P2       | Freeze, IDs, dependency, scheduled, through Address, pending contributions, settlement.                                  | Dense vocabulary makes short scripts cognitively long.                               | Literal verbs, visible state labels and one short definition per necessary keyword.                         |
| P2       | A3/H1 mix reveal-time obligation snapshots with activation-time effects.                                                 | A later change can affect a player who was never obliged to contribute.              | Public marked players/cards persist as physical records and examples cover newly affected players.          |
| P2       | A2 conditional two-native floor.                                                                                         | Adds a special selection filter unrelated to most event text.                        | Deliberate simplification with before/after fixtures and no accidental immunity inherited from old code.    |
| P2       | HTML inspection, Canvas faces and print faces expose different instructions/reminders.                                   | A readable tooltip cannot repair missing physical rules.                             | Same canonical operative strings on every full face; compact omission only under permitted exception.       |
| P2       | Source and canonical output currently match by exact registry lookup.                                                    | Round trips can all pass while every player-facing term remains unclear.             | Behavioral mutation fixtures plus first-time prediction tasks; style/grammar tests alone are insufficient.  |
| P2       | Founder label suggests a unique power but grants none.                                                                   | Imports legacy or historical assumptions into action legality.                       | Label as historical distinction or consistently remove it from mechanical-role display.                     |

The baseline has helpful foundations: private hands, deterministic legality, public proof registers, explicit action opportunities, distinct hand discard/Court retirement, finite action seals, preserved printed Dynasty and real physical card identity. Those should survive language simplification. Confusion should be removed by reducing exceptions and making costs/actions concrete, not by stripping bargaining, concealed options or vulnerable succession from the game.

## Revised mechanical and scripting direction

The implementation task selected two narrowly scoped mechanical simplifications during this audit. These are **current assistant design decisions under the user's authorization to redesign**, not claims that Malachy had already approved them:

1. **A2 removes its special two-native floor.** A player with a Ruler retires one other supported Court Noble if possible. The Ruler remains protected; a smaller court can be more vulnerable. Print the exact selector, with no silent minimum.
2. **P2 returns one supported non-Ruler Court Noble of the Crown holder.** The choice is the Crown holder's and the destination their own hand. This replaces the dynamic heir/Witness/Queen dependency table. It can have an effect under Tudor or after succession even when no old-style dependency exists. It may or may not break a Crown attempt depending on the chosen card, which is an intentional strategic difference.

Other immediate revisions aim to preserve mechanics while explaining them: explicit H2 forfeiture; explicit T2 destination; numeric contribution/round/goal parameters; literal snapshot wording; visible shared goals; executable Noble abilities; law phases with clear entry, named commitment, transfer and win instructions. Novel wording should not introduce an unintended rule change merely to fit a sentence.

A controlled-English language should compile into a typed, bounded program. Common verbs implement physical rules; card text supplies permissions, timing, counts, selectors and exceptions. No JavaScript evaluation is needed. A registry of all complete card paragraphs is too coarse for the requested source-of-truth contract. Equally, an unbounded natural-language interpreter would make authoring non-deterministic. Reject unknown/contradictory instructions with actionable diagnostics; retain source locations and canonical printing.

Brevity target: minimize **unnecessary interpretation**, then remove redundant words. Counts, destinations, “your,” “different,” “after,” “until,” and the named loser often prevent major errors and are not expendable filler. A long rule that cannot fit legibly on a 63×88 mm face is a reason to simplify the mechanic or make a genuinely shared keyword, not shrink type until it becomes unreadable.

## Validation plan and honest stop condition

Required code evidence: compile all 92; full-card text equals compiled canonical text; reminders do not affect behavior; altered legal text changes actual legality/outcomes; unsupported text fails closed; real actions preserve hidden-information and card-conservation invariants; controlled numeric changes cannot silently retain old hard-coded counts. Tests should change source text, compile, install the program and take actual legal actions, not merely compare two AST objects.

Required physical/visual evidence: same operative text in print and inspection, actual-size 63:88 proof, opening/action/dense/compact captures opened for inspection, no clipped costs/triggers/targets. Actual screenshots are the parent implementation task's responsibility and must be recorded separately from this source audit.

Required human evidence still outstanding: first-time players predict at least one legal action and outcome per card family, explain native/foreign ownership, defend a Claim, identify the exact heir/Witness/Queen dependency, distinguish prevent/end/expiry, and state what happens when the sixth fragment appears. Include twelve-year-old readers with guardian consent through normal research arrangements, as well as adult novices. Record false predictions and rule lookups before teaching the answer. Scores after editing remain expert estimates until such evidence exists.

Do not claim “perfectly clear,” “masterfully designed,” universal age suitability or guaranteed preference from a grammar, simulation or agent review. The reviewable end product can make strong falsifiable improvements now; player comprehension and strategic quality remain hypotheses to test.

## Revised-source audit and executed iteration record

Final source candidate: **r4-3ff12c6b**, language/compiler/interpreter **2.0.0**. This is a source/engine evaluation; it does not substitute for the parent task's rendered verification or human testing. Per-card hashes below identify this candidate even if later revisions change it. The same five-axis rubric and base-noun assumptions are retained; scores have not been normalized upward to reach a desired grade.

Executed passes:

1. Inspected all 92 baseline cards against legality, state transitions and physical/full display paths; retained baseline hashes, word counts and misunderstandings.
2. Reviewed the first executable-language revision. Flagged missing Noble matching/zone selectors, ambiguous Queen ownership/zone, missing recurring start timing, ambiguous Ruler-change timing, unclear shared quotas and missing immediate fragment loss.
3. Reviewed the repaired source: explicit rival Court Noble/matching Dynasty; unmarried Queen in Court and hand/Court spouse; shared “Together” goals; “At round start” and “When this starts”; Ruler-change start timing; immediate collective painting loss. Scored all 92 sources at the intermediate candidate r4-97bb98a5.
4. Added and executed thirteen behavioral regression tests that change written source, compile it and exercise actual actions/round boundaries. Initial run passed thirteen; a subsequent timing-phrase change invalidated one test's text-edit literal (the no-op guard detected it). Updated that literal to the new canonical phrase and reran: 13/13 passed. This was a test adaptation, not an engine-failure claim.
5. Flagged three remaining specific text/behavior gaps: Tudor failed-claim hidden-heir reveal/return, both participants' Trade credit for T3, and H3 mandatory loans not counting as Help. All three were added explicitly to the final source. Tudor rises from 7 to 8; T3 from 7 to 8; H3 from 6 to 7 under the same rubric. Every final hash and word count was refreshed below.
6. The parent review identified an interpreter gap beyond the shipping cards: accepted custom scripts could permit an active Crisis to end through Trade, Cover or Marry, but those completion hooks only recorded pending events. Parent fixed those three hooks. Added three actual-action regression cases for those custom compiled scripts. Final suite: **16 passed, 0 failed**. No production card content changed in that interpreter repair.

New-source meaning is more explicit, but a first reader still needs the short shared action reference for Recall's physical destination and response, Block's payment, Trade's consent, Lend's return, Cover's limits, readiness and Bloodline. Those are common named actions, not card-specific exceptions. The scores therefore do not certify every full card as independently teaching the whole game. The requirement that accepted card parameters execute is now supported by runtime mutation evidence, rather than only a round-trip compiler test.

| ID                     | Revised V/T/I/O/C | Revised /10 | Operative words | Revised source hash |
| ---------------------- | ----------------- | ----------: | --------------: | ------------------- |
| alba-0                 | 1/2/1/1/1         |           6 |              58 | 2f851fbb            |
| alba-1                 | 1/2/1/1/1         |           6 |              83 | 45baab7a            |
| alba-2                 | 1/2/1/1/1         |           6 |              58 | d4d478ca            |
| alba-3                 | 1/2/1/1/1         |           6 |              58 | 3a7fadc2            |
| alba-4                 | 1/2/1/1/1         |           6 |              58 | 2234487d            |
| alba-5                 | 1/2/1/1/1         |           6 |              58 | 9de1ab6f            |
| alba-6                 | 1/2/1/1/1         |           6 |              58 | 21fc5269            |
| alba-7                 | 1/2/1/1/1         |           6 |              58 | 0591d751            |
| alba-8                 | 1/2/1/1/1         |           6 |              83 | bfbc9b8a            |
| alba-9                 | 1/2/1/1/1         |           6 |              58 | ffcc6ea2            |
| alba-10                | 1/2/1/1/1         |           6 |              58 | 771dde1d            |
| alba-12                | 1/2/1/1/1         |           6 |              58 | 7fad651a            |
| alba-13                | 1/2/1/1/1         |           6 |              83 | 3e5e4ea7            |
| plantagenet-0          | 1/2/1/1/1         |           6 |              58 | 7438494a            |
| plantagenet-1          | 1/2/1/1/1         |           6 |              83 | 95826d76            |
| plantagenet-2          | 1/2/1/1/1         |           6 |              58 | ed8abc77            |
| plantagenet-3          | 1/2/1/1/1         |           6 |              58 | 2072ccf9            |
| plantagenet-4          | 1/2/1/1/1         |           6 |              58 | 67e764dc            |
| plantagenet-5          | 1/2/1/1/1         |           6 |              58 | 245ee464            |
| plantagenet-6          | 1/2/1/1/1         |           6 |              58 | d575e29c            |
| plantagenet-7          | 1/2/1/1/1         |           6 |              58 | ef56023a            |
| plantagenet-8          | 1/2/1/1/1         |           6 |              83 | de785a6d            |
| plantagenet-9          | 1/2/1/1/1         |           6 |              58 | 0718e47e            |
| plantagenet-10         | 1/2/1/1/1         |           6 |              58 | b8bbf116            |
| plantagenet-11         | 1/2/1/1/1         |           6 |              83 | c7b82b66            |
| plantagenet-13         | 1/2/1/1/1         |           6 |              83 | 3496355d            |
| tudor-0                | 1/2/1/1/1         |           6 |              58 | fd93833c            |
| tudor-1                | 1/2/1/1/1         |           6 |              83 | 52f51c10            |
| tudor-2                | 1/2/1/1/1         |           6 |              58 | 6e83edf5            |
| tudor-3                | 1/2/1/1/1         |           6 |              83 | 38e0f7d7            |
| tudor-4                | 1/2/1/1/1         |           6 |              58 | f2aa90a4            |
| tudor-5                | 1/2/1/1/1         |           6 |              83 | b61cf139            |
| tudor-6                | 1/2/1/1/1         |           6 |              58 | f0b1d7c5            |
| tudor-7                | 1/2/1/1/1         |           6 |              58 | db913f9a            |
| tudor-8                | 1/2/1/1/1         |           6 |              58 | 0913990b            |
| tudor-9                | 1/2/1/1/1         |           6 |              83 | 43573115            |
| tudor-11               | 1/2/1/1/1         |           6 |              58 | 319b886f            |
| tudor-12               | 1/2/1/1/1         |           6 |              58 | 3d00de4b            |
| tudor-13               | 1/2/1/1/1         |           6 |              83 | 608c97d5            |
| habsburg-0             | 1/2/1/1/1         |           6 |              58 | 02a62866            |
| habsburg-1             | 1/2/1/1/1         |           6 |              83 | 70fd5721            |
| habsburg-2             | 1/2/1/1/1         |           6 |              58 | 9bdedd1a            |
| habsburg-3             | 1/2/1/1/1         |           6 |              58 | 1e05205d            |
| habsburg-4             | 1/2/1/1/1         |           6 |              58 | a9ed85cf            |
| habsburg-5             | 1/2/1/1/1         |           6 |              58 | 34752697            |
| habsburg-6             | 1/2/1/1/1         |           6 |              58 | 574c88ee            |
| habsburg-7             | 1/2/1/1/1         |           6 |              83 | 53a23a8f            |
| habsburg-8             | 1/2/1/1/1         |           6 |              83 | e6046b8d            |
| habsburg-9             | 1/2/1/1/1         |           6 |              58 | 73d8bbe5            |
| habsburg-10            | 1/2/1/1/1         |           6 |              58 | 5ab7d475            |
| habsburg-11            | 1/2/1/1/1         |           6 |              58 | 51edb6b1            |
| habsburg-13            | 1/2/1/1/1         |           6 |              83 | 31f2b685            |
| law-alba               | 1/2/2/2/1         |           8 |              77 | 18655bff            |
| law-plantagenet        | 1/2/2/2/1         |           8 |              86 | 59fc1da0            |
| law-tudor              | 1/2/2/2/1         |           8 |              88 | d752b912            |
| law-habsburg           | 1/2/2/2/1         |           8 |              88 | 0e796434            |
| A1                     | 1/2/2/1/1         |           7 |              44 | 7ae4ceae            |
| A2                     | 1/2/2/2/1         |           8 |              54 | 4b490d3e            |
| A3                     | 1/1/2/2/1         |           7 |              45 | 61fb2594            |
| P1                     | 1/2/2/2/1         |           8 |              42 | 8b06c4df            |
| P2                     | 1/2/2/2/1         |           8 |              50 | 6977507c            |
| P3                     | 1/2/2/1/1         |           7 |              49 | 422b618e            |
| T1                     | 1/2/2/1/1         |           7 |              29 | 92ca5353            |
| T2                     | 1/2/2/2/1         |           8 |              51 | 59aaaa37            |
| T3                     | 1/2/2/2/1         |           8 |              39 | ae8a5a4b            |
| H1                     | 1/2/2/1/1         |           7 |              42 | 1106c473            |
| H2                     | 1/2/2/2/1         |           8 |              68 | 2b098ee1            |
| H3                     | 1/2/2/1/1         |           7 |              63 | 908f3c21            |
| painting-alba-1        | 2/2/2/2/1         |           9 |              24 | f744d4de            |
| painting-alba-2        | 2/2/2/2/1         |           9 |              24 | d5611032            |
| painting-alba-3        | 2/2/2/2/1         |           9 |              24 | cc093046            |
| painting-alba-4        | 2/2/2/2/1         |           9 |              24 | df85f462            |
| painting-alba-5        | 2/2/2/2/1         |           9 |              24 | 9a346f06            |
| painting-alba-6        | 2/2/2/2/1         |           9 |              24 | 829613ca            |
| painting-plantagenet-1 | 2/2/2/2/1         |           9 |              24 | feaffc58            |
| painting-plantagenet-2 | 2/2/2/2/1         |           9 |              24 | 04f1225e            |
| painting-plantagenet-3 | 2/2/2/2/1         |           9 |              24 | 1874eb94            |
| painting-plantagenet-4 | 2/2/2/2/1         |           9 |              24 | a4ee2f3e            |
| painting-plantagenet-5 | 2/2/2/2/1         |           9 |              24 | 04c4b040            |
| painting-plantagenet-6 | 2/2/2/2/1         |           9 |              24 | 7e0c4f06            |
| painting-tudor-1       | 2/2/2/2/1         |           9 |              24 | ce05fa45            |
| painting-tudor-2       | 2/2/2/2/1         |           9 |              24 | 0f30c8f7            |
| painting-tudor-3       | 2/2/2/2/1         |           9 |              24 | 7fbfdd65            |
| painting-tudor-4       | 2/2/2/2/1         |           9 |              24 | dd5a3bb3            |
| painting-tudor-5       | 2/2/2/2/1         |           9 |              24 | f5654805            |
| painting-tudor-6       | 2/2/2/2/1         |           9 |              24 | 8e96dd47            |
| painting-habsburg-1    | 2/2/2/2/1         |           9 |              24 | 2e1cb3e1            |
| painting-habsburg-2    | 2/2/2/2/1         |           9 |              24 | 84cd6039            |
| painting-habsburg-3    | 2/2/2/2/1         |           9 |              24 | 45d57741            |
| painting-habsburg-4    | 2/2/2/2/1         |           9 |              24 | 831ec991            |
| painting-habsburg-5    | 2/2/2/2/1         |           9 |              24 | 96881e61            |
| painting-habsburg-6    | 2/2/2/2/1         |           9 |              24 | b6337e19            |

### Three remaining comprehension risks

1. **Shared-action vocabulary and choice load.** All 52 Nobles now explain their permitted hand/Court uses and relevant Dynasty/Queen selectors, scoring 6/10 under this strict card-first rubric. They still name several defined shared actions. Recall's payment/destination/response, Trade's consent and Cover's limits need the adjacent short reference. This is a learning-load hypothesis, **not a demonstrated software bug or a child-test result**. Test a card alone and a card with the reference as separate conditions. Ask a first reader to show the physical source, cost, target and destination without prompting.
2. **Recorded earlier state versus current state.** A3 still asks players to act on one of the Nobles eligible when the card was revealed, while its later consequence uses current unsupported people. That temporal distinction is a real physical-record demand, reflected in A3's 7/10 estimate. Code inspection additionally found a **concrete UI omission**: the engine stores original eligible IDs in restoreIds, while the inspected registers originally rendered only obligated/fulfilled players, not those Noble names. The implementation owner repaired that omission by adding the original marked Noble names and each player's completed/outstanding status to the Crisis inspection. This audit independently confirmed the new source path in app.ts; rendered verification belongs to the parent task. Even with a visible list, first-time testing must establish whether players understand why a newly unsupported Noble may not satisfy the original condition. This is distinct from claiming the underlying snapshot rule is incorrectly executed.
3. **Crown and History boundary prediction.** Laws now make entry, named people, transfer timing, duration, failure and victory explicit (8/10). Fragments state immediate collective loss (9/10). A child must still predict a sequence involving expiring Covers, scheduled Ruler changes, active Crisis effects, new History and the final Crown check. This is a **human-validation need, not a demonstrated rules bug**. Ask whether the final uncovered fragment allows a last Cover, whether a blocked scheduled succession waits or loses its claim, and which named person must remain after the old Ruler retires. Record answers before giving the teach.

The per-card counts deliberately include necessary words added to repair omitted rules. A longer Law with an explicit win, failure and clock is better than an apparently concise Law that requires three undocumented inferences. Equal behavior receives equal scoring across different historical names; no history or portrait is treated as evidence that a child understands a mechanical permission.

### Behavioral evidence owned by this audit

[Runtime regression suite](../../tests/card-language-runtime.test.ts), executed with the command **npx tsx --test tests/card-language-runtime.test.ts**: **16 passed, 0 failed** on the final candidate. It verifies Law entry count, heir count, succession delay, reign duration, Noble Recruit permission, Queen marriage permission, four-contributor Challenge, expiry duration, three-Dynasty shared goal, five-fragment win threshold, A2's revised retirement selector, P2's revised return selector, H2's forfeiture consequence, and active completion of custom Trade/Cover/Marry-ending scripts. Every text mutation is checked to ensure it actually changed the source before compilation. Fixtures conserve the selected manifests; unused History is moved to its public past solely to isolate the tested rule. No private hand is exposed through a production UI by these tests.

No release, deployment, screenshot inspection, child study or manufacture approval is claimed by this audit document. Those have separate evidence owners and gates.
