# Card language clarity: research and design criteria

Research date: 16 September 2026. Scope: first-reading comprehension of a physical card game, with a reader around age 12 as the design target. This is primary-source research and an editorial evaluation framework, not a study conducted with children. Recommendations below are design inferences unless explicitly described as a source finding.

## Conclusion

Optimize the shortest **complete, predictable instruction**, not the smallest word count. A short card fails if the reader must guess its timing, legal target, payment, destination, or exception. The public text and the interpreter must share one meaning, but compiler acceptance alone does not prove that a new player understands that meaning.

Keep the game's distinct strategic premise: expansion creates exposed relationships; an heir, a witness, or a marriage makes authority vulnerable; players choose when to reveal information or help avert shared history. Simplify the bookkeeping and the language through which those decisions are expressed. Do not replace that premise with combat statistics or a race to an undifferentiated score. This follows the project's [designer intent](../knowledge-base/designer-intent.md) and [physical game direction](../PHYSICAL-GAME-DIRECTION.md).

## Primary-source findings

### 1. Separate three kinds of difficulty

Wizards' lead designer distinguishes understanding a card, understanding the interactions of the visible board, and finding the best strategy. A card can be easy to read while creating too many board dependencies. The design goal is to lower the first two burdens while retaining meaningful strategic decisions. This is a publisher's design account, not a controlled experiment establishing an age threshold. [Mark Rosewater, _New World Order_](https://magic.wizards.com/en/news/making-magic/new-world-order-2011-12-05).

**Application:** Count remembered dependencies as well as words. A foreign heir, the supporting Queen, the old Ruler, a successor, and a future settlement create substantial tracking work even if each sentence is individually simple. Place named people and obligation markers beside the Law; make the survival timeline visible. Do not remove the marriage risk merely because it creates strategy.

### 2. Give a novice an immediately sensible use

Wizards' discussion of lenticular design describes cards whose surface function is understandable while their deeper uses emerge with experience. It also gives a counterexample: a three-word instruction can confuse a beginner when its apparent purpose makes no sense. Unfamiliar vocabulary and multi-turn tracking can create barriers even without long paragraphs. [Mark Rosewater, _Lenticular Design_](https://magic.wizards.com/en/news/making-magic/lenticular-design-2014-03-31).

**Application:** A reader should see why revealing a concealed card helps stop a crisis and why a marriage supports a foreign Noble. Reserve deception, timing, negotiation, and opportunism for strategic discovery. Do not hide the immediate exchange or make sacrificing a card look like a free action.

### 3. Use common words, explain necessary terms, avoid private meanings

W3C's cognitive guidance favors common words, literal meanings, removal of vague wording, and immediate access to definitions for necessary unfamiliar terms. It warns against expecting users to learn newly invented meanings simply to understand content. This guidance addresses a broad range of cognitive and learning needs; it is not a claim that all 12-year-olds have a disability or identical abilities. [W3C, _Use Clear Words_](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p01-clear-words/).

**Application:** Keep historical identity in titles and art. Use concrete rules words in the operative text. “Freeze players,” “Noble IDs,” and “Crown dependency” describe internal representations. “Mark each player who has a marriage” and named heir/Witness/Queen selectors describe things people can do with cards.

### 4. Order instructions and preserve each necessary step

W3C recommends instructions near the activity, explicit steps, and examples or illustrations where useful. Its succinct-text pattern recommends one point per sentence and short, purposeful chunks. It also acknowledges that splitting a sentence can sometimes make it harder to understand; length is not an absolute quality measure. [W3C, _Clear Step-by-step Instructions_](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p07-step-instructions/); [W3C, _Keep Text Succinct_](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p05-succinct-text/).

**Application:** Use separate printed lines for distinct timings. Put the trigger before the action. Keep a condition with the instruction it limits. Do not put a global restriction between two steps of one physical move. Preserve line breaks in HTML, canvas, print output, and inspection.

### 5. A published game makes sequencing a shared convention

Dominion's official rules instruct players to follow card instructions from top to bottom and distinguish text below a dividing line that happens at another time. They also explicitly state what happens when an instruction cannot be fully completed. These are examples of defined conventions, not evidence that Overlords & Outlaws should inherit Dominion's exact partial-resolution rule. [Rio Grande Games, _Dominion, Second Edition Rules_, action phase](https://www.riograndegames.com/wp-content/uploads/2016/09/Dominion2nd.pdf).

**Application:** State a single rule for order, simultaneous choices, impossible effects, and payments. Payments should remain all-or-nothing; an optional effect must visibly say “may.” A failure to choose a required legal target must not silently become a free partial action. Every clause still needs its actual timing.

### 6. Precise reusable wording needs a precise rules contract

Pokémon's official advanced rules distinguish an ability used once for each card from a restriction on the ability name across the whole turn. The same document explains source zones and what happens when a card leaves and returns. These distinctions demonstrate why apparently natural wording can encode materially different rules. [Pokémon, _Advanced Player's Rulebook_, E-18](https://asia.pokemon-card.com/my/wp-content/uploads/sites/6/2025/10/EN_advanced_manual-2025.pdf).

**Application:** “Different Nobles” must mean distinct physical cards, not just different names or different players. “Each round” must say whether the activation round counts. “Your” must consistently mean the person currently controlling the card or taking the named action. Do not rely on an undocumented parser convention to answer these questions.

### 7. Reading age is not a guarantee

The Common Core framework combines qualitative text features, quantitative measurements, and the particular reader/task. Its grades 6–8 technical-reading expectations include following multistep procedures. That is an educational target, not evidence that every child can independently resolve complex competitive rules on a first reading. [Common Core, _English Language Arts Standards_, text complexity and technical-reading standards](https://corestandards.org/wp-content/uploads/2023/09/ELA_Standards1.pdf).

W3C's reading-level criterion excludes proper names and titles from its assessment and places its benchmark at lower-secondary education. It explicitly notes that no single easy-to-read text can suit every reader. This is an accessibility criterion for web content, not a 12-year-old card certification. [W3C, _Understanding Reading Level_](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html).

**Application:** Do not shorten historical names to improve a formula. Use word count and sentence length to locate likely trouble, then inspect the actual procedure. Report observed comprehension separately from predicted clarity.

### 8. Test usability, not only readability

Accessibility Standards Canada's published plain-language standard says readability formulas cannot establish conformance and calls for evaluation with intended audiences. The appropriate number and range of testers depends on the communication and audience. [Accessibility Standards Canada, _CAN-ASC-3.1:2025_, evaluation section](https://accessible.canada.ca/standards-and-technical-guides/standards-and-technical-guides-database/can-asc-312025-plain-language?mode=full-html).

Nielsen Norman Group's original usability guidance recommends visible recognition cues over requiring recall and language that matches the user's world. These are general usability heuristics, not card-game efficacy measurements. [NN/g, _Memory Recognition and Recall_](https://www.nngroup.com/articles/recognition-and-recall/); [NN/g, _Match Between the System and the Real World_](https://www.nngroup.com/articles/match-system-real-world/).

**Application:** Keep a stable, accessible shared-terms reference, physically reproducible markers, and visible countdowns. A hover glossary can help browser play, but a printed player aid must serve the same purpose at a table. A simulator verifies legality and balance hypotheses; it cannot establish first-reader comprehension.

## Findings from the current implementation

Baseline inspected: `src/history-engine/content.ts`, `compiler.ts`, `types.ts`, `rules.ts`, and `face.ts`, before this task's language revision. These findings concern the 92-card History Engine roster, not the superseded combat-game roster.

| Existing construction                                                              | First-reader problem                                                                                                          | Required design response                                                                                                           |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| All 52 Nobles have an empty `cardText`; role and Bloodline reminder supply context | Reading a Noble does not reveal what the concealed or tabled card can do; “Queen” alone does not explain marriage eligibility | Compile and display shared Noble instructions on full/reference faces. Compact battlefield faces may retain the approved omission. |
| Laws compress Proclaim, maintenance, succession, and settlement into one paragraph | The player cannot easily find the current stage or derive the interval between stages                                         | Print one named timing per line and explicitly state the survival requirement and winning endpoint.                                |
| “Attack: Muster and Secure with different Noble IDs”                               | Engine identifiers leak onto a physical card; action cost, rotation, and the two-contribution process are elsewhere           | Name physical cards and the two actions; state or visibly attach the common cost and eligibility.                                  |
| “At reveal, freeze players…”                                                       | “Freeze” sounds like a penalty applied to players, not a snapshot of who owes a contribution                                  | Use a physical mark and say the marked set is fixed when the card is revealed.                                                     |
| “Eligible non-Ruler Crown dependency”                                              | The target is a nested software category whose members change with Crown stage                                                | Name the heir, Witness, or supporting Queen and the stage that makes each eligible.                                                |
| “Return the chosen Overlords simultaneously”                                       | Destination omitted; cards might go to the hand, deck, original owner, or previous position                                   | State the current controller's hand and preserve simultaneous selection.                                                           |
| “Carry pending contributions into active play”                                     | Abstract bookkeeping looks like a new move or transfer                                                                        | Say earlier payments still count toward ending this same crisis.                                                                   |
| “Expire at the end of the next round after activation”                             | Potential confusion between this round's end and next round's end                                                             | Use a clear activation marker plus a named future round boundary.                                                                  |
| HTML replaces newlines with breaks; canvas wraps by spaces alone                   | The same canonical script loses its timing structure on some physical card surfaces                                           | Render authored line breaks in both, measure all text bounds, and use a full 63:88 reference layout.                               |

The [earlier physical-state review](../PLAY-SESSION-02-REVIEW.md) already records the relevant failure pattern: controls and labels can teach a model different from the executed game. That review is supplied play-session evidence for an earlier version. It does not prove the current language revision is understood.

## Shared card-writing contract

The following is the project's proposed editorial contract, inferred from the evidence above:

1. **One public name per concept.** Preserve Noble, hand, Court, Dynasty, Ruler, Queen, seal, and round where these refer to stable printed objects or rules. Use “hand Noble” and “Court Noble” in instructions; Outlaw and Overlord may remain thematic names without becoming extra concepts a first-time reader must memorize. Do not alternate names merely for style.
2. **Write physical operations.** Choose, pay, turn sideways, show, place, move, return, pair, mark, and remove communicate observable actions. Attach a destination to every move.
3. **Make the actor and target local.** Prefer “Each player chooses 1 of their…” over a bare “Choose.” Clarify whether a card can choose itself, its Ruler, a married Noble, or a concealed card.
4. **Keep payment separate from benefit.** “Pay 1 seal: …” is a cost. “Gain 1 seal” is a benefit. Do not let typography, punctuation, or an unexplained icon determine which interpretation wins.
5. **Use timing labels consistently.** A card's reveal, activation, continuing rule, round-start effect, and end condition are different events. Each gets its own clause; formatting must not reorder execution.
6. **Choose a small grammar.** A finite set of precise, composable phrases is preferable to accepting arbitrary English and guessing. Reject unrecognized text with a useful diagnostic. No hidden code path may give a card an ability because of its name or ID.
7. **Do not save words by removing information.** “Any,” “different,” “until,” “may,” and “if able” each change the legal outcome. Remove redundant words, not necessary selectors or timing.
8. **Keep reminders non-operative.** A reminder may explain a term already defined by the shared rules. It cannot secretly add a payment, restriction, duration, or winning condition omitted from the script.
9. **Make duration tangible.** A round marker, seal, sideways card, named heir marker, marriage pair, or painting veil should show every persistent state. Avoid remembering who qualified two turns ago without a token.
10. **Preserve collectible identity.** Historical names, portrait art, Dynasty and branch labels remain intact. The text is counterfactual game design and must remain distinguishable from verified biography.

### Mechanic-level revisions worth implementing first

- **Nobles:** Give every Noble the same concise base procedure, plus an explicitly printed Queen marriage clause where applicable. Let strategic identity emerge from Dynasty, branch, concealed information, and relationships. Avoid inventing 52 exceptions merely to fill empty text boxes.
- **Laws:** Preserve four different routes but share the same readable timeline. Identify the exact supporting cards physically; name the condition that breaks a claim. Every route states when it wins. Habsburg marriage risk and Tudor concealed succession remain meaningful differences.
- **History crises:** Use a common structure: prevent it, active consequence, end it, natural expiry. Only print relevant stages. Contributions are physical, bounded, and visible. The same type of contribution has one meaning across all crisis cards.
- **Painting fragments:** State the exact slot and painting, the shared adversary's completed-painting victory, and the effect of a veil. Avoid a reader mistaking “Eudoxia wins” for a personal score reward.
- **Shared actions:** Put definitions beside use and on one player aid. Repeating every base rule on every card creates a text wall; omitting all base function fails the stated first-reading objective. The full Noble face should supply immediate available use, and the player aid should supply turn structure and universal procedures.

## Editorial scoring rubric

Score each card on five axes, each from 0 to 2. Sum to a score out of 10. Score the full canonical operative face available to a first-time reader; separately record shared terms the reader is assumed to have learned. The score is an **editorial heuristic**. It is neither an age certificate, a probability of understanding, nor a result from real players.

| Axis         | 0                                                                   | 1                                                              | 2                                                                           |
| ------------ | ------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Vocabulary   | Opaque jargon, private meanings, or misleading words dominate       | Some necessary terms need a nearby definition                  | Common literal words and consistently introduced base nouns                 |
| Targets      | Actor, quantity, owner, or eligibility is absent or contradictory   | Rules lookup or inference resolves part of the selection       | Chooser, count, ownership, and restrictions are explicit locally            |
| Timing       | Trigger, duration, order, or frequency is missing or misleading     | Shared rules are needed to resolve an interval or order        | Relevant trigger, order, repeat limit, and endpoint are explicit            |
| Outcome      | Cost, action, result, or destination is absent or misrepresented    | The player can infer part of the physical consequence          | Payment and physical result are predictable from the text                   |
| Completeness | Operative behavior is missing or relies on untrackable dependencies | Complete only with one or more non-obvious shared-rule lookups | Full relevant instruction, with manageable and visibly tracked dependencies |

Interpretation: 0–3 requires redesign; 4–6 requires material revision; 7–8 is a plausible test candidate; 9–10 is a strong editorial candidate for human testing. These bands are project decisions, not externally validated cutoffs. An empty card receives no clarity credit for being short.

Independently flag any text/engine mismatch, illegal or physically unreproducible instruction, ambiguous hidden information, or missing operative rule. A high sum cannot waive a blocking flag. Report dimensions and specific defects, not only averages; an average can hide the one word that reverses an outcome.

Keep three evidence columns separate: **editorial score**, **execution conformance**, and **observed first-reader result**. Do not fill the third with simulation statistics or an agent's imagined child response.

## Iteration and real-player validation

Run three different reviews, with independently recorded results:

1. **Script review:** Parse every full card, verify a canonical round trip, reject unsupported clauses, and exercise each selected effect/target/timing against concrete states. Mutating meaningful script text must change executed behavior or produce an error.
2. **Physical and visual review:** Inspect full cards at the fixed 63:88 ratio, at actual printable size and enlarged inspection size. Check complete sentences, phase separation, long names, lower-edge clearance, selected targets, and visible markers. Check opening, an action, a dense Court, and compact display states. A text-fit check does not replace looking at the rendered result.
3. **First-reader review:** Give a person around the intended age the basic turn/reference aid and an unfamiliar card. Ask them to explain and perform the card with real pieces. Do not teach the answer during the attempt. Include readers with varied tabletop experience and reading confidence; seek assent and parent/guardian participation as appropriate to the session.

For each card, ask the same concrete questions: Who acts? When? Which card or player may be chosen? What is paid? Where do the pieces go? What stops or ends the effect? Then test one ordinary state and one relevant edge state. For a Law, include loss of a required supporter. For a crisis, include a player unable to contribute. For a fragment, include an incomplete painting and a complete but veiled painting.

Record correct predictions, incorrect predictions, rereads, reference lookups, and the player's own explanation. Revise the actual script or mechanic that caused the error, then use a fresh card or fresh reader to avoid measuring memorization. Any numerical success threshold should be agreed before the test and reported with the sample and procedure; do not infer universal understanding from a small convenience sample.

The deliverable can establish a well-tested interpreter and a substantially improved editorial candidate. “Perfectly clear to every first-time player” remains an aspiration that neither a compiler, a readability score, nor this research can prove.

## Executed presentation passes

For content candidate `r4-97bb98a5`, the card presentation was revised and inspected in three concrete passes:

1. Full reference faces gained the actual Noble script and line-separated phase instructions. All card kinds retained 63:88 geometry. Compact battlefield faces kept the existing portrait/name/role presentation. A first 92-card bound check passed against the first wording draft.
2. More explicit target and marriage wording made 17 Queen faces overflow. The revised check exposed the regression; no score or previous pass was used to waive it. The full-face portrait area was shortened to preserve the body font, and full canvas portraits were reframed to keep faces visible.
3. The complete 92-card check passed at both 340 px and 310 px widths (184 HTML faces), plus 92 full canvas renderings. The inspected captures include a Noble, Queen, Law, Crisis, painting piece, phone-sized Queen/Law, and full canvas Queen. This records layout and actual visual inspection, not human comprehension or manufacturing approval.

A later editorial pass produced `r4-3ff12c6b`: Tudor's Law now states where a failed hidden heir goes, The Open Record states that a Trade counts for both players, and The Imperial Settlement distinguishes forced loans from Help. The 184 HTML and 92 canvas checks passed again. All three revised faces were captured and visually inspected; no further layout correction was needed.

Reproduce with `HISTORY_BASE_URL=<Vite dev server> npx tsx scripts/card-language-proof.ts`. The report and captures are in `artifacts/card-language/`; the report records the content version. The separate printable production sheet, full game scenes, rules-engine tests, and actual player tests have their own checks.
