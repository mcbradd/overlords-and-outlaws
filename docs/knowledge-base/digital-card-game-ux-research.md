# Digital card game UI/UX: evidence, revisions, and O&O design rules

Research date: 15 September 2026. Scope: 16 games; desktop, touch, collection, and battle experiences are distinguished below. This is a design research synthesis for **Overlords & Outlaws**, not a ranking of the games' quality or a survey of all their players.

## Conclusion

The strongest transferable pattern is **make the player's current decision easy to see and execute**. Give cards a stable place and readable hierarchy, show important state without a hunt, let inspection explain more, and keep feedback responsive. Attractive art helps when it reinforces those jobs. Decoration, empty panels, camera spectacle, and compulsory animations hurt when they compete with those jobs.

O&O should use readable cards in explicitly labeled House lanes, a dominant play surface, a compact contextual inspector, and one current instruction/action area. Preserve the historical portraits and restrained material character; simplify the surrounding frames. This directly addresses the supplied screenshot's tiny play strip, visually ungrounded cards, oversized empty panels, and competing information layers.

The research supports this direction; it does **not** establish that the resulting O&O experience is already more enjoyable than competitors. That requires players using the revised build. Sixteen deliberately varied games provide useful design coverage, not a statistically representative sample of players.

## 1. Method and limits

### What was examined

- Twelve discovery games: Hearthstone, Legends of Runeterra, Marvel Snap, Magic: The Gathering Arena, Magic Online, Yu-Gi-Oh! Master Duel, Duel Links, Pokémon TCG Live, Pokémon TCG Online, Pokémon TCG Pocket, Gwent, and Artifact.
- Four later challenge cases: Slay the Spire, Balatro, Eternal, and The Elder Scrolls: Legends. They extend the sample into single-player deckbuilders, a smaller competitive game, and a historically redesigned client.
- Firsthand player reports on Reddit, Steam discussion, and the official Pokémon community; where useful, developer statements about design intentions. Both praise and criticism were sought. Specific interaction reports were preferred over “best game” or “dead game” assertions.
- Multiple statements inside one discussion are one **cluster**, not independent survey respondents. Votes were not converted into respondent counts or sentiment percentages. A popular thread establishes salience in that community, not prevalence among all players.
- Search results and retrieved pages were read for concrete claims. This was not a fresh hands-on usability test of 16 installed clients. The scoring is the researcher's ordinal interpretation of the cited evidence, not measured performance.

### Bias controls

1. Separate **battle**, **menus/collection**, and **onboarding**. A game can succeed in one and fail in another.
2. Attach **date/version context**. A 2017 Gwent complaint cannot establish the quality of 2026 Gwent. The September 2026 Live update is an early reaction, not a settled longitudinal verdict.
3. Separate **desktop**, **phone**, and **tablet** when the source does. If the source does not identify hardware, do not invent it.
4. Ignore unrelated monetization, balance, matchmaking, IP affection, content availability, and shutdown disappointment when assigning UI scores. Record them as confounds instead.
5. Keep counterexamples. For instance, the LoR thread contains both annoyance at extra indicators and appreciation for information that no longer requires hovering. The TES Legends thread contains both fewer-visible-items praise and extra-click criticism.
6. Do not adopt commenters' claims about developer motives, engine implementation, cheating, revenue, or employee competence as facts. Reports of waiting, obscured cards, misclicks, or confusion remain useful even if the author's causal theory is wrong.

### What “confidence” means here

Confidence is high in the **direction of recurring rules** (legibility, hierarchy, predictable input, optional detail, efficient repetition), moderate in their transfer to this game's particular layout, and low in any precise competitor order. The source set is English-heavy, self-selected, search-ranked, and overrepresents people motivated to post. There was no blinded coding, inter-rater study, randomized sample, or formal satisfaction measurement. “Challenge set” below means later qualitative challenge cases, **not** an independent statistical holdout.

## 2. Evidence register: what players actually said

The labels describe the evidence at the stated time and scope. They are not current whole-product verdicts. Dates are those reported in retrieved discussions when available; broad year ranges are used when that is all the retrieved evidence supports.

| Game / scope | UI/UX evidence and sentiment | Counterevidence, caveat, or confound |
|---|---|---|
| **Hearthstone — battle versus client shell, 2023–26** | A February 2026 discussion explicitly distinguishes the clear/minimal core battle UI from accumulated menus, popups, shop organization, and inconsistent labels. Several participants defend the battle UI strongly. [Player discussion](https://www.reddit.com/r/hearthstone/comments/1r6gg20/the_horrendous_user_interface_of_hearthstone/) | A November 2025 firsthand report describes animation queues preventing further actions before a turn expires; a reply values the signature animations themselves. Preserve satisfying feedback while removing blocking repetition. Do not infer that the report's proposed engine explanation is established. [Animation discussion](https://www.reddit.com/r/hearthstone/comments/1ozo1bb/the_animation_system_is_the_single_biggest_flaw/) |
| **Legends of Runeterra — April 2022 battle UI change** | The April 28 thread praises the prior Oracle Eye interaction while criticizing redundant attack swords/shields and a missing hand counter. Some approve clearer action-button labels. [Before/after discussion](https://www.reddit.com/r/LegendsOfRuneterra/comments/udmad8/) | Other participants prefer immediate visible outcomes over moving the pointer to the Eye. The lesson is priority and optional detail, not “hide all information.” A 2020 deckbuilder thread shows a separately criticized part of the same game. [Deckbuilder discussion](https://www.reddit.com/r/LegendsOfRuneterra/comments/eysx30/opinion_the_deck_building_screen_is_legitimately/) |
| **Marvel Snap — early match presentation versus collection, 2022–25** | An October 2022 new-player account praises the art, effective effects, and tense presentation; this is evidence of welcoming presentation, with gameplay enthusiasm mixed in. [New-player account](https://www.reddit.com/r/MarvelSnap/comments/ybbata/) | December 2023 players report wrong deck navigation, sort resets, and upgrade indicators; separate 2025 discussion requests collection redesign. A praised match loop does not excuse frequent deck-management friction. [Deck bugs](https://www.reddit.com/r/MarvelSnap/comments/18oq315/), [Collection critique](https://www.reddit.com/r/MarvelSnap/comments/1j9qlyz/) |
| **Magic Arena — learnability and client consistency, 2023–25** | Experienced MTGO players recommend Arena to complete beginners because it is easier to get started and has a smoother interface. An iOS player comparing Arena, Master Duel, and Live favors Arena's accessible persistent menus. [New-player comparison](https://www.reddit.com/r/MTGO/comments/106domd/), [Cross-client comparison](https://www.reddit.com/r/masterduel/comments/11g85xl/) | A 2025 returning PC user identifies reversed scroll direction between screens, low-contrast scroll bars, and aggressive edge bounce. MTGO veterans also criticize unwanted priority passing and auto-tapping. Good defaults require discoverable control. [PC report](https://www.reddit.com/r/MagicArena/comments/1kso2o9/), [Expert comparison](https://www.reddit.com/r/MTGO/comments/13k7giy/) |
| **Magic Online — expert control versus entry friction, 2023–26** | Returning/new players describe an old, clunky interface, time needed to learn hotkeys, and difficulty entering play. [Returning-player report, May 2023](https://www.reddit.com/r/MTGO/comments/13k7giy/), [New-to-client discussion, March 2026](https://www.reddit.com/r/MTGO/comments/1s55bri/) | Some players prefer its deliberate priority control after learning it and remain for formats/social play unavailable elsewhere. This is utility and expertise, not proof of good first-use UI. Daybreak's 2024 new-player-kit discussion explicitly recognizes low-stakes practice as a way to learn the interface. [Developer explanation](https://www.mtgo.com/news/new-player-kit-update-2024) |
| **Master Duel — polished simulator with repetitive friction, 2022–25** | Players praise a premium-looking simulator and clean presentation. A cross-client iOS comparison rates its interface positively but calls navigation slower and notes repeated Back presses to reach Home. [Presentation praise](https://www.reddit.com/r/masterduel/comments/z0p30y/), [Mobile comparison](https://www.reddit.com/r/masterduel/comments/11g85xl/) | January 2025 requests include easier counter handling, less repeated animation, and clearer lingering effects. A reply points out an existing “influence” detail control: the information may exist yet be hard to discover. Separate Yu-Gi-Oh rules complexity from how clearly the client communicates it. [QoL discussion](https://www.reddit.com/r/masterduel/comments/1ibzdhz/) |
| **Duel Links — September 2024 home-screen change** | Players report oversized character art, clutter, awkward transitions, hidden routes, and extra navigation; others like the character focus, customization, and simpler access. [September 25 discussion](https://www.reddit.com/r/DuelLinks/comments/1fp5e1x/), [September 26 discussion](https://www.reddit.com/r/DuelLinks/comments/1fpnkgu/) | These are primarily **home/world navigation** reports, not evidence that the duel board is bad. Affection for visible favorite characters is a legitimate aesthetic preference. It should not determine how much room essential controls receive. |
| **Pokémon TCG Live — 2022–23 client and September 2026 board revision** | Early players report poor bench overview, weak attack/ability contrast, drag-only selection, and an awkward enlarged-card close target. A 2023 returner reports unreadable cards and inspection dismissed by actions. [February 2022 report](https://www.reddit.com/r/PTCGL/comments/t2bcrp/), [October 2023 report](https://www.reddit.com/r/PTCGL/comments/172fi7u/) | September 10–11, 2026 reactions include a positive OP and reports of unused desktop space, zoomed-out cards, a squashed bench, and discard access conflicting with settings. This is the closest external analogue to O&O's screenshot, but also a very recent, change-sensitive sample. [New-board discussion](https://www.reddit.com/r/PTCGL/comments/1wcv20t/holy_ui_change/) |
| **Pokémon TCG Online — historical client, 2019 and later comparisons** | August 2019 players could love the accessible card collection/trading experience while describing the UI as dated and character art as ill-fitting. A September 2019 redesign thread also requests improvements. [2019 discussion](https://www.reddit.com/r/ptcgo/comments/co2ajg/), [Redesign discussion](https://www.reddit.com/r/ptcgo/comments/d9li9y/) | Later Live criticism favors Online's collection visibility and interactions. That is useful comparative evidence, not proof Online was universally polished. Loss of trading/collection and familiarity can amplify nostalgia. [Variant-visibility comparison](https://www.reddit.com/r/PTCGL/comments/zxp02g/), [Live returner](https://www.reddit.com/r/PTCGL/comments/172fi7u/) |
| **Pokémon TCG Pocket — phone navigation and pace, 2024–26** | Repeated reports identify many confirmation screens, waiting between taps, slow menus on an iPhone 16 Pro, and slow repeat activities. A September 2025 thread adds poor filters and unwanted automatic energy additions. [November 2024 account](https://www.reddit.com/r/PTCGP/comments/1gs7608/), [July 2025 phone report](https://www.reddit.com/r/PTCGP/comments/1lzqiex/why_is_this_games_ui_so_slow/), [September 2025 requests](https://www.reddit.com/r/PTCGP/comments/1n9xczw/) | The November author likes opening and seeing individual cards but dislikes the subsequent repeated screens. January 2026 complaints persist. Collection pleasure and IP enthusiasm can coexist with poor repeated-task UX. Do not adopt allegations of intentionally wasting time as established developer intent. [January 2026 report](https://www.reddit.com/r/PTCGP/comments/1qig3gq/i_love_this_game_but_why_is_it_so_slow/) |
| **Gwent — selection hierarchy, thematic consistency, and mobile, 2017–21** | December 2017 feedback prefers larger cards, greater contrast, and less wasted area over a decorated mulligan scene. In a January 2021 criticism thread, a player nevertheless praises mobile keyword explanations and graphics options. [Selection critique](https://www.reddit.com/r/gwent/comments/7kkfq7/), [Mixed 2021 discussion](https://www.reddit.com/r/gwent/comments/l9hplc/) | CDPR's April 2018 Homecoming letter explicitly connects consistent UI/UX and darker Witcher identity. Theme matters, but the period's changes also involved mechanics, audience, and content; neither praise nor backlash can all be assigned to UI. [Developer letter](https://www.playgwent.com/en/news/18951/gwent-homecoming-see-whats-next-for-gwent) |
| **Artifact — Classic/2.0 and camera control, 2020–23** | Players who criticize the original game still praise its board/art/UI. A casual 2.0 tester also likes its clean UI. [July 2020 account](https://www.reddit.com/r/Artifact/comments/hmsl42/), [August 2020 account](https://www.reddit.com/r/Artifact/comments/ic2hbv/) | An October 2020 discussion describes Classic's camera repeatedly taking focus away from the desired overview. Later remaining players praise it relative to Master Duel. This is strong survivor-selection risk and a Classic-versus-Foundry distinction, not evidence that commercial outcome measures interface quality. [Camera complaint](https://www.reddit.com/r/Artifact/comments/jhwg2v/), [2023 returning-player discussion](https://www.reddit.com/r/Artifact/comments/156jxai/) |
| **Slay the Spire — PC clarity versus mobile input, 2021–25** | May 2025 firsthand explanations specifically praise short card text, obvious target arrows, fast inputs, visible intents, accessible piles, and contextual keyword explanations. These are concrete UX reasons beyond liking the game. [Detailed discussion](https://www.reddit.com/r/slaythespire/comments/1knyrmd/) | A May 2021 mobile report complains of tiny text/icons and misclicks; a March 2022 thread contains both concerns and players who find touch easy to learn. The PC score cannot be transferred unmodified to a phone. [Mobile critique](https://www.reddit.com/r/slaythespire/comments/nm8zzx/please_fix_this_ui/), [Mixed mobile experience](https://www.reddit.com/r/slaythespire/comments/tgr1o4/) |
| **Balatro — streamlined feedback versus touch adaptation, 2024–26** | February 2024 players explicitly praise streamlined UI and near-absent waiting. Later mobile users praise smooth touch play. The developer describes constraints on palette, resolution, and UI standardization as a way to create visual cohesion. [Streamlining praise](https://www.reddit.com/r/balatro/comments/1b0j8wt/), [Mobile praise](https://www.reddit.com/r/balatro/comments/1gc3q8u/), [Developer interview, March 2024](https://playday.one/2024/03/09/there-is-a-lot-more-design-to-explore-within-balatro/) | A September 2024 thread disputes whether the mobile adaptation is sufficiently friendly. Treat speed, touch accuracy, and readable explanation separately from how enjoyable the reward loop is. [Mobile counterexample](https://www.reddit.com/r/balatro/comments/1fq3tam/) |
| **Eternal — efficient genre conventions with input/animation complaints, 2016–22** | Firsthand comparisons appreciate Magic-like mechanics with an accessible Hearthstone-like interface. A cross-game Hearthstone thread describes Eternal as close in clean match presentation. [Steam comparison](https://steamcommunity.com/app/531640/discussions/0/215439774862578288/), [Cross-game discussion](https://www.reddit.com/r/hearthstone/comments/zcgc66/) | June 2020 comments report accidentally playing cards while they were still being drawn and slower combo animation flow. Fast activation is not useful when the target moves underneath the pointer. [Specific criticism](https://www.reddit.com/r/EternalCardGame/comments/h1074h/) |
| **The Elder Scrolls: Legends — 2019 menus and later memories** | August 2019 players describe a cleaner-looking menu that adds steps to practice play and smaller/harder-to-hit mobile controls. The thread contains an explicitly corrected claim about post-match navigation. [Detailed menu comparison](https://www.reddit.com/r/elderscrollslegends/comments/cx3dud/) | Some prefer the larger selection options; a 2025 retrospective praises smooth interface and atmosphere, but nostalgia and love of the Elder Scrolls setting are entangled. Preserve task efficiency through redesigns rather than treating all resistance as irrational. [Retrospective](https://www.reddit.com/r/elderscrollslegends/comments/1icwexk/) |

## 3. Iteration log

### Pass 0: visual-first hypothesis

Initial hypothesis: a good card-game UI has **clear card hierarchy**, **a visually organized play area**, and **consistent attractive feedback**. A simpler frame, fewer competing panels, and larger readable cards should improve O&O.

This predicts the supplied screenshot's failure and agrees with Gwent's mulligan critique and Live's tiny-board criticism. It is useful, but incomplete. A visually simple screen can hide controls; an attractive animation can block play; a dense client can preserve expert agency.

The following 0–4 provisional ratings are interpretive, using the global anchors in section 4. They summarize only the cited visual/organization evidence. They are **not** numerical user ratings. Ranges express conflicting scopes or sparse evidence.

| Discovery game | Pass-0 visual hypothesis rating | Expected UX if visual quality were sufficient | Evidence discrepancy to investigate |
|---|---:|---|---|
| Hearthstone | 3–4 | Largely positive | Clear board coexists with blocking animations and client-shell clutter. |
| Runeterra | 3 before / 2 after the discussed change | Earlier UI preferred | Some players prefer new immediate cues. Less on-screen information is not universally better. |
| Marvel Snap | 3 | Positive | Polished match presentation coexists with deck-selection and sort failures. |
| Magic Arena | 3 | Positive | First-use appeal does not ensure consistent scrolling or expert priority control. |
| Magic Online | 1–2 | Negative | Experts can prefer its explicit control; format availability explains some persistence. |
| Master Duel | 3 | Positive | Premium presentation coexists with repeated navigation and effect-inspection friction. |
| Duel Links home redesign | 1–2 | Negative | Some users value favorite-character visibility and optional customization. |
| TCG Live | 1–2 | Negative | Some users welcome the new perspective; geometric simplicity alone is not the issue. |
| TCG Online | 1–2 | Negative | Later preference over Live partly reflects better familiar functions, partly nostalgia. |
| TCG Pocket | 2–3 | Mixed-to-positive | Strong repeated-task complaints despite a relatively simple presentation. |
| Gwent selection UI | 1–2 for criticized revision | Negative | Attractive theme does not compensate for reducing card focus; mobile explanation can still be good. |
| Artifact | 3 | Positive | Camera ownership, version differences, and non-UI dissatisfaction prevent a whole-game inference. |

**Discrepancy research:** The linked queue/pace reports (Hearthstone, Pocket, Master Duel), novice/expert comparisons (MTGO/Arena), LoR disagreement, and contemporaneous versus retrospective PTCGO evidence motivated the next pass. The visual hypothesis did not need to be discarded; it needed a behavioral model.

### Pass 1: decision-centered model

Add three obligations:

- **State and consequence:** identify what changed, what is available, and why. Details should be available without displacing the whole board. “Information exists somewhere” is insufficient.
- **Input safety and agency:** retain stable targets, explicit selection, cancel paths, and appropriate expert control. Minimize accidental commitment; do not silently substitute a player's intended action.
- **Pace:** reduce repeated waiting and clicks, but retain enough feedback to understand causality. Make repeated spectacle optional.

Do not average all tasks together. Battle play, deckbuilding, and entering the next match are distinct journeys. A flaw repeatedly encountered can matter more than a beautiful first impression. This explains the main discovery-set contradictions without claiming that gameplay, economics, or nostalgia disappear.

### Pass 2: later challenge cases and revision

| Later case | Prediction from Pass 1 | Observed evidence | Revision / result |
|---|---|---|---|
| Slay the Spire | Short readable cards, visible intent, quick input, and inspectable rules should be praised. | Specific PC praise supports this; phone misclick reports challenge applying one score to all devices. | **Add platform and input-mode qualification.** Compact mouse UI is not automatically good touch UI. |
| Balatro | Cohesive hierarchy and responsive feedback should produce positive interaction reports. | Streamlining and touch praise support it; the launch mobile counterthread prevents declaring universal touch success. | **Allow expressive visual identity.** Minimalism means disciplined priority, not a mandatory flat corporate aesthetic. Test the actual touch layout. |
| Eternal | Familiar clear interaction should be positive; fast animation should help. | Clean-client comparisons support the first claim. A report of accidental plays during draw animation breaks “faster is always better.” | **Make target stability a gate.** Input should become available when targets are predictably selectable. |
| TES Legends | Cleaner, less crowded menus should help unless they add friction. | The 2019 thread directly describes cleaner menus plus deeper navigation. Some users prefer it; a commenter corrects one platform-dependent report. | **Preserve frequent routes and recheck reports.** Familiarity cost is real; distinguish changing habits from objectively adding repeated work. |

The final pass adds **context fit** as an explicit dimension and turns control stability into a non-negotiable constraint. The later examples do not demand a new aesthetic doctrine; they reinforce the need to evaluate the correct task, device, audience, and moment.

### Stopping rule

Stop desk research when (a) each proposed rule has support across several games or a concrete failure example; (b) contrasting games/platforms can be explained without treating popularity as UX; and (c) the last challenge cases refine conditions rather than requiring a new design model. Those conditions are met for a practical redesign. Further search would mostly add anecdotes to known themes. The next highest-value evidence is observation of O&O players, particularly first-time players and touch users.

This is qualitative saturation for an implementation decision, **not proof of predictive accuracy**. No “X% correlation” or classification accuracy is reported because scores and sentiment interpretation come from overlapping evidence.

## 4. Final rubric (V2)

### Shared ordinal anchors

| Score | Meaning |
|---:|---|
| 0 | The documented issue prevents completing the relevant task, or makes a critical state/control inaccessible. |
| 1 | A substantial documented obstruction: repeated misclicks, unreadability, excessive navigation, or blocking feedback. |
| 2 | Usable with meaningful friction, mixed evidence, or an important tradeoff. |
| 3 | Clear positive evidence for the relevant task with limited reported friction. |
| 4 | Multiple specific strengths strongly satisfy the dimension in the stated context; not a claim of perfection everywhere. |
| — | Insufficient evidence to score this dimension. Unknown is not average or zero. |

### Dimensions and observable tests

| Code | Guideline | Observable criterion for O&O |
|---|---|---|
| **R** | Readable, stable card hierarchy | Identify card name, cost, role, and current stats without enlarging the card at the supported desktop layout. Fixed slots and consistent type sizes; no text over intricate art. |
| **B** | Space follows the current decision | House ownership and lane boundaries are immediately apparent. The board and hand receive enough area; empty decoration and explanations do not squeeze cards into miniatures. |
| **S** | State is visible and details are inspectable | Turn, resources, eligibility, status, and the latest result are visible. Inspection explains rules/reasons and stays available without covering the active target or controls. |
| **I** | Input is predictable and recoverable | Selection differs visibly from commitment; legal actions/targets are clear; cancel and keyboard/touch alternatives exist. Layout movement cannot silently change the clicked target. |
| **P** | Pace respects repeated play | Frequent actions need few steps. Feedback acknowledges input promptly and communicates causality. Repeated decorative motion does not block essential interaction. |
| **F** | Fit the task, device, and identity | Desktop and touch layouts are verified separately. Theme supports hierarchy. Novice help can contract; expert detail remains accessible. Redesigns preserve useful routes and conventions. |

Equal weighting is used only to summarize **evidence-covered dimensions**. For practical release decisions, a 0–1 in critical R, S, or I cannot be offset by beautiful theme or fast animations. Weights are a design choice, not a fitted psychological law. Do not optimize a weighted average while leaving an unreadable hand or unreachable action.

### Evidence-assisted field scoring

Scores describe the named scope/period in the register, not the latest complete client. Whole-game rows with mixed subareas deliberately receive middling values; the notes say where that simplification breaks down. Some scores are necessarily judgments from qualitative reports. Interpret differences smaller than one ordinal point cautiously. These ratings are reproducible starting judgments to challenge in future hands-on work, not definitive benchmarks.

“Mean” = sum of available dimension scores / number scored, on the same 0–4 scale. “Coverage” counts scored dimensions, not research confidence. A high mean with limited coverage must not outrank a well-observed game.

| Game / stated scope | R | B | S | I | P | F | Mean / coverage | Sentiment alignment and remaining limitation |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Hearthstone, battle + repeated client use | 3 | 4 | 3 | 3 | 1 | 2 | 2.67 / 6 | Strong board praise; queue and shell criticism. P=1 applies to reported repeated/complex sequences, not every turn. |
| Runeterra, discussed 2022 battle update | 3 | 2 | 3 | 3 | — | 2 | 2.60 / 5 | Mixed: useful consequences and clearer button, redundant symbols. F depends on experience and hover preference. |
| Marvel Snap, match presentation + collection | 3 | 3 | 2 | 1 | — | 2 | 2.20 / 5 | Match praise does not erase documented collection bugs. I is the criticized collection workflow. |
| Magic Arena, novice battle + client consistency | 3 | — | 3 | 2 | 2 | 2 | 2.40 / 5 | Positive novice experience; control and scroll consistency concerns remain. |
| Magic Online, novice and expert | 2 | 2 | 3 | 2 | 2 | 2 | 2.17 / 6 | Difficult entry but valuable explicit expert control. The aggregate hides that audience difference. |
| Master Duel, cross-client mobile + QoL | 3 | — | 2 | 2 | 1 | 2 | 2.00 / 5 | Presentation praised; slow repeated navigation and hard-to-find state. |
| Duel Links, September 2024 home screen | 2 | 1 | 2 | 2 | 2 | 2 | 1.83 / 6 | Predominantly clutter/navigation criticism with aesthetic and customization defenders. Does not score duel board. |
| TCG Live, documented battle/card workflows | 1 | 1 | 1 | 1 | 1 | 1 | 1.00 / 6 | Repeated specific readability, inspection, interaction, and scale complaints; recent perspective change has defenders. |
| TCG Online, historical UI/collection | 2 | — | 3 | 2 | — | 2 | 2.25 / 4 | Dated visual presentation plus useful familiar collection access. Evidence sparse for a precise overall grade. |
| TCG Pocket, repeated phone tasks | — | — | 2 | 2 | 1 | 2 | 1.75 / 4 | Strong navigation/pace criticism; do not invent a battle-legibility failure from menu complaints. |
| Gwent, selection + mobile explanation | 3 | 2 | 3 | — | — | 3 | 2.75 / 4 | Local selection-layout failure can coexist with good contextual explanation and theme. Historical scopes differ. |
| Artifact, Classic/2.0 reports | 3 | 3 | — | 2 | 2 | 3 | 2.60 / 5 | UI praise, camera-control complaints; version mixing limits one numeric summary. |
| Slay the Spire, PC | 4 | 4 | 4 | 4 | 4 | 3 | 3.83 / 6 | Concrete clarity/response praise fits. This score explicitly excludes the mobile port complaints. |
| Balatro, PC / reported touch experience | 3 | 3 | 3 | 3 | 4 | 3 | 3.17 / 6 | Strong streamlined-play fit; mobile disagreements require device-specific testing. |
| Eternal, match presentation and draw flow | 3 | 3 | — | 2 | 2 | 3 | 2.60 / 5 | Clean familiar client, with an identifiable moving-target/animation failure. |
| TES Legends, 2019 menu change | 2 | 3 | 2 | 1 | 1 | 2 | 1.83 / 6 | Cleaner visual organization coexists with more navigation and small/misaligned targets. |

The field supports **patterns**, not a league table. Unknowns in Pocket do not mean its board is worse than Artifact's; Slay the Spire's higher score is scoped to clear PC reports, a simpler interaction environment, and a highly specific praise thread. A rigorous rank ordering would require the same test tasks, device matrix, and participant sampling across all games.

## 5. Apparent outliers and why they do not invalidate the model

### “People still play MTGO, so its UI must be good”

That confuses product utility with learnability. Players cite format access and precise control, while also admitting entry friction. Expertise lowers the cost of an opaque interface; it does not remove that cost for new users. Preserve meaningful agency in O&O while explaining and revealing it. [Player comparison](https://www.reddit.com/r/MTGO/comments/13k7giy/)

### “Artifact failed, so its praised presentation must be bad”

Players explicitly separate UI/art praise from criticism of the game. Remaining-community enthusiasm is especially vulnerable to selection effects, and Classic/Foundry differences complicate the sample. The camera complaint is a concrete UX failure independent of commercial outcome: spectacle should not steal the player's chosen view. [Separated praise and criticism](https://www.reddit.com/r/Artifact/comments/hmsl42/), [Camera report](https://www.reddit.com/r/Artifact/comments/jhwg2v/)

### “Pokémon enthusiasm proves that slow Pocket/Live interactions are acceptable”

Collectors can enjoy the cards and still dislike repeated taps, waiting, or poor visibility. Do not explain this as irrational fans: the product supplies several distinct benefits. Score the interaction under discussion; exclude IP appeal, collecting pleasure, and lost collections/trading from the UI estimate. [Pocket account](https://www.reddit.com/r/PTCGP/comments/1gs7608/), [Online discussion](https://www.reddit.com/r/ptcgo/comments/co2ajg/)

### “Everyone wants the old UI back, so no redesign should occur”

Online, LoR, Duel Links, and TES Legends all show why this fails. Familiarity matters, but reports identify testable issues: more clicks, less visible counts, smaller targets, less card area, or unstable transitions. Conversely, some users prefer new visible cues or character focus. Preserve useful paths and inspect the concrete task instead of dismissing all disagreement as nostalgia. [LoR mixed thread](https://www.reddit.com/r/LegendsOfRuneterra/comments/udmad8/), [TES Legends comparison](https://www.reddit.com/r/elderscrollslegends/comments/cx3dud/)

### “Slay the Spire and Balatro prove one compact layout is enough everywhere”

Desktop mouse and phone finger interactions have different precision and occlusion costs. A strong PC interface can still create touch mistakes. Reward-loop pleasure can also swamp irritation in a whole-game recommendation. Test touch directly and retain explicit selection/commitment boundaries. [Spire mobile reports](https://www.reddit.com/r/slaythespire/comments/tgr1o4/), [Balatro mobile disagreement](https://www.reddit.com/r/balatro/comments/1fq3tam/)

### “Always reveal the exact future outcome”

The research supports clarifying **public rules and current state**, not removing the strategic uncertainty that makes the game interesting. LoR players disagree about immediate prediction versus optional inspection. O&O should explain costs, legality, status, and known effects, but should not expose hidden information or replace meaningful decisions with an unsolicited solver. Balatro's particular arithmetic/anticipation loop is a reason to avoid turning “preview everything” into a universal law; that transfer boundary is a design inference, not a measured player-consensus claim. [LoR disagreement](https://www.reddit.com/r/LegendsOfRuneterra/comments/udmad8/)

## 6. Concrete O&O implementation guidelines

These are implementation hypotheses derived from the evidence, not numerical industry standards. They preserve the game's rules and historical theme.

### Layout and card geometry

1. **Make the play surface the main region.** Replace tall empty House banners and stacked explanatory strips with compact House labels and a single contextual side area. Budget space for visible cards first.
2. **Anchor each card to its owner's lane.** Use subdued boundary/grounding cues. Keep owner label, count, and relevant House state near the lane. A painting of a table is not itself a readable game board.
3. **Use stable, front-facing gameplay cards.** Perspective can be atmosphere; it must not distort type, symbols, or hit areas. Do not shrink every card to fit an increasingly dense board. Use a documented lane overflow/scroll strategy with visible counts and discovery cues.
4. **Use one card coordinate system.** Name, role, cost, and current stats occupy repeatable slots. Center symbols in defined boxes, align numerical baselines, and preserve aspect ratio. Simplify ornate image frames to a thin quiet border and restrained House accent.
5. **Separate glance content from detailed text.** Show essential identity/current state in the small card. Put full rules, history, and explanation in an inspector. Do not cram paragraphs into microscopic image overlays.

### Decision support and interactions

6. **Give one instruction for the current decision.** During a lesson, the lesson's actionable prompt owns that space; outside lessons, show the relevant turn/selection guidance. Avoid three simultaneous panels all explaining the player's next move.
7. **Keep the inspector out of the action path.** Anchor it to a stable rail or a deliberately sized small-screen sheet. It must not cover legal targets, End turn, or a lesson continuation. Hover can preview; focus, tap, and explicit selection must work as well.
8. **Make selection and commitment different.** Clearly mark selected, playable, unavailable, and targetable states using more than color. Show reasons for unavailable actions. Allow cancellation without consuming a move.
9. **Communicate orientation/status explicitly.** Upright, spent, protected, or selected should have readable labels/icons; do not rely only on rotated miniatures, subtle tint, or assumed knowledge of decorative symbols.
10. **Keep essential counts visible.** Turn, current player, orders, gold, hand count, and relevant court counts should be readable without hover. Tie changing values to the relevant player/zone.
11. **Show a compact causal result.** After an action, identify who acted, what happened, and the relevant change. Detailed history can expand on demand rather than permanently consuming a large band.

### Pace, accessibility, and responsive behavior

12. **Use motion as confirmation.** Prefer brief transitions and a clear selection/result state. Respect reduced-motion preferences. Never allow a draw/reflow to place a different actionable object under an existing pointer or finger press.
13. **Verify actual supported viewport sizes.** At desktop, compact laptop, and narrow touch widths, the hand, active cards, instruction, and commitment controls remain usable. Choose deliberate overflow before illegible scaling. Test browser zoom as well as pixel dimensions.
14. **Use semantic controls and visible keyboard focus.** The visual card should have one clear accessible name, predictable tab order, and an action equivalent to pointer selection. Use real buttons for actions rather than relying solely on scene coordinates.
15. **Keep the visual identity coherent.** Dark materials, restrained gold, House colors, and historical portraits can be distinctive. Reserve contrast and motion for active decisions. Test actual text/background contrast; “dark and luxurious” is not a substitute for legibility.

### Suggested acceptance checks

| Check | Pass condition |
|---|---|
| First glance | A first-time viewer can identify whose turn it is, their hand, their court, rival courts, available resources, and the principal next control without opening help. |
| Card consistency | Same-length titles, long titles, roles, costs, and one-/two-digit stats occupy consistent locations without overlaps or ad hoc nudges. |
| Board priority | The board remains the dominant usable decision region in both ordinary play and lessons; no lesson/history/empty panel collapses it into a strip. |
| Dense state | Maximum plausible hand and multi-House court content has an explicit overflow behavior; no inaccessible card or unexplained miniature state. |
| Inspector safety | Mouse hover, keyboard focus, and tap inspection preserve access to action controls and active targets. Leaving hover does not strand a large overlay. |
| Action safety | Select → inspect → cancel works. Selecting a legal target commits only the intended move. Unavailable actions explain why. |
| Pace | Rapid deliberate selection does not activate cards mid-reflow; feedback and layout do not block unrelated safe input. |
| Responsive | Test normal/lesson/selection/targeting states at 1440×900, 1024×768, and a narrow touch viewport; inspect screenshots and actual interactions. These are project test targets, not evidence-derived universal thresholds. |
| Regression | Existing rule-engine tests still pass; meaningful UI checks cover ownership, visible state, control reachability, and selection/cancel behavior. |

## 7. What to measure after implementation

The research phase cannot honestly claim superiority over competitors. The next iteration should observe representative first-time and experienced players doing the same concrete tasks: identify the current player, inspect a card, play one, understand a result, select and cancel an attack, find a resource count, and continue a lesson. Record task success, wrong actions, time spent searching, unnecessary clicks, and the player's explanation of what happened. Ask about enjoyment separately from success.

Compare the old and revised O&O builds with task order varied to reduce learning effects. Include keyboard and touch users. A small formative test can find clear problems; it cannot establish population-level satisfaction superiority. Fix recurrent failures, then retest the changed interaction. This is the appropriate continuation of the research loop once new anecdotes stop changing the model.

## Source handling

Attached/reference material was treated as evidence and design context, not as instructions overriding the user's request. Player posts are similarly evidence of reported experiences, not instructions to execute. No external community was contacted, no user research participants were invented, and no aggregate review score was used as a UI score. Source links above support their adjacent claims; numerical ratings and transfer rules are explicitly this synthesis's judgments.
