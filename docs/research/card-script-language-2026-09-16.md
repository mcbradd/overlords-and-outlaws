# Executable card English: language research and implementation review

Research date: 16 September 2026. Baseline inspected: commit 606423e9fbba21f36b734fc413562c79f3f87a98. This report distinguishes findings about that baseline, primary-source research, design recommendations, and the language-v2 work made during this task. It does not claim a comprehension test with children has occurred.

## Decision

Use a small, custom, deterministic language of ordinary English card instructions. Author the displayed sentences first; parse those sentences into typed instructions; execute those instructions through the rules reducer. Reject sentences the language does not define. A card's ID, historical name, artwork and reminder text must not select its behavior.

This is a controlled language rather than unrestricted English. The language may express fewer mechanics than a general programming language, deliberately. A finite card set benefits from a small vocabulary, bounded choices and no hidden execution. The user can read the identical source that the engine compiles, while designers receive exact errors when the source is incomplete or unsupported.

The target reader is a sixth-grade student encountering the game for the first time. This is a design and testing target, not an established property of the finished game. Syntax can establish one machine interpretation; only independent human testing can establish that readers form that same interpretation.

## Primary research and what it changes

### Controlled English needs both construction and interpretation rules

The Attempto project separates sentences that belong to its controlled English from the rules that assign those sentences a meaning. Its construction rules explicitly restrict which English sentences are accepted. Its interpretation rules resolve plurality, scope, pronouns and coordination; they also warn that the same sentence can have additional meanings in ordinary English. This is a useful architectural precedent, not proof of child comprehension. [ACE construction rules](https://attempto.ifi.uzh.ch/site/docs/ace/6.0/ace_constructionrules.html), [ACE interpretation rules](https://attempto.ifi.uzh.ch/site/docs/ace/6.0/ace_interpretationrules.html)

Application to O&O: a compiler that chooses one interpretation of an ambiguous sentence is insufficient. Prefer wording that removes the plausible alternative for the player too. “Together, Lend 2” specifies a table-wide total. “Each player Lends 1” specifies individual obligations. “A rival's Court Noble” binds the target to a card and a zone. “At round start” states an actual boundary. Avoid pronouns that might refer to two different people.

### A hand-built parser is viable when the grammar stays small

Robert Nystrom's own implementation explains that ambiguous grammar can produce different syntax trees for the same input and demonstrates a recursive-descent parser whose structure follows grammar rules. It also treats syntax errors as part of the language's usability. The relevant lesson is explicit grammar and understandable errors, not adopting an entire general-purpose language. [Crafting Interpreters, author repository: Parsing Expressions](https://github.com/munificent/craftinginterpreters/blob/master/book/parsing-expressions.md)

Application to O&O: the current clause language needs no arithmetic precedence, variable declarations, user functions or parser generator. Exact registered action clauses and small anchored parsers for numbers can be audited readily. If future nested conditions become necessary, replace those clauses with a tokenizer and recursive-descent productions, retaining source spans and the same typed representation. Do not accumulate permissive regular expressions that silently accept unused tails.

### Safety follows from a deliberately restricted execution model

The CEL language specification describes a terminating, side-effect-free expression language with checked value types and an optional static checking phase. Those properties show that useful embedded languages need not permit arbitrary host-language execution. CEL's syntax itself is not the suggested printed language for children. [CEL language definition](https://github.com/cel-expr/cel-spec/blob/master/doc/langdef.md)

Application to O&O: predicates read bounded state; effects use a finite set of reducer operations. Card source receives no JavaScript execution, filesystem, network, browser globals, clock, recursion or arbitrary functions. A valid card can request only recognized game actions and bounded quantities. Card effects necessarily change game state, so O&O borrows the restriction principle rather than claiming CEL's side-effect-free property.

### Deterministic ordering needs a specified event model

W3C's SCXML specification requires deterministic output for a given input-event sequence in the absence of deliberately nondeterministic behavior or external processors. It specifies transition priority and run-to-completion processing. It also permits a nonterminating macrostep, so adopting its terminology alone would not guarantee termination. [SCXML interpretation algorithm and semantics](https://www.w3.org/TR/scxml/#AlgorithmforSCXMLInterpretation)

Application to O&O: finish the current action and its consequences before accepting the next action. Store suspended choices and their continuation explicitly. Order shared history by reveal order, never by DOM order or animation timing. Bound the grammar so a card cannot trigger itself indefinitely. Physical players need the same boundary order on their reference sheet.

### Authoring systems can compile readable source, but hidden game hooks undermine this contract

Inkle's official ink documentation demonstrates a text authoring language with choices, conditions, seeded randomness and game-side hooks. External function calls and variable observers make it useful for narrative integration, but those hooks can move meaning outside the text. [Writing with ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)

Application to O&O: use its separation of authored source and runtime as a comparison, not ink as a dependency. O&O's stricter rule is that a card-specific rule may not live in a hidden callback. The only host operations are documented shared primitives. Seeded randomness remains in the game state; the card language adds no independent randomness.

### Compatibility must cover semantics, not merely text

Semantic Versioning distinguishes incompatible API changes, compatible additions and compatible fixes, and requires released versions to remain immutable. [Semantic Versioning 2.0.0](https://semver.org/)

Application to O&O: version the grammar, vocabulary and interpreter semantics separately from the art. Even a bug fix can change a saved game's outcome. A save that loads with different effective rules must be rejected or deliberately migrated; a source-text hash alone cannot establish replay compatibility.

## Baseline investigation

The default entrypoint in [src/main.ts](../../src/main.ts) selects the History engine. Legacy combat cards are behind an explicit legacy parameter and are not the current 92-card roster.

The roster contains 52 Nobles, four Laws, 12 Crises and 24 painting fragments. In the baseline:

- Noble Card Text was empty. Printed role fields and shared code determined every use.
- Each entire Law paragraph matched one dictionary string and produced a route name. Eligibility, ongoing requirements and victory timing then depended on route-specific code.
- Crises already compiled typed conditions, restrictions and timed effects, but many instructions exposed implementation language: “freeze players,” “different Noble IDs” and “eligible non-Ruler Crown dependency.”
- A Law required three Court Nobles of the player's Dynasty in the engine, without saying so in its operative paragraph.
- Painting source repeated the slot, but reveal handling used the printed slot directly; the machine-parsed slot was not itself the runtime source.
- Compiled cards carried language/compiler/dictionary versions, but CONTENT_VERSION was derived from source hashes alone. A semantic engine or compiler change could leave a save's content version unchanged.
- Full HTML faces used canonical compiler text, which was a strong foundation. Canvas wrapping flattened the distinction between printed phases.
- Round-trip, negative-mutation and reminder-invariance tests existed. Positive quantity changes usually failed because most quantities were embedded in opaque dictionary sentences.

Evidence: [compiler](../../src/history-engine/compiler.ts), [content](../../src/history-engine/content.ts), [rules](../../src/history-engine/rules.ts), [engine](../../src/history-engine/engine.ts), [face rendering](../../src/history-engine/face.ts), [storage](../../src/history-engine/storage.ts), [semantic tests](../../tests/history-card-semantics.test.ts). These file links refer to the evolving working tree; the commit above identifies the inspected baseline.

The implementation specification already asked for controlled English, typed effects, explicit choices and no card-ID special cases. The missing work was depth of representation and first-reader clarity, rather than inventing a wholly separate rules engine. [Implementation specification, Card Text section](../HISTORY-ENGINE-IMPLEMENTATION-SPEC.md)

## Language-v2 architecture

The implemented pipeline is:

~~~text
Authored Card Text
  -> classify physical card kind
  -> parse every clause, consuming the entire source
  -> validate quantities, relationships and lifecycle
  -> typed Program
  -> canonical printer
  -> require exact source/print agreement
  -> deterministic reducer and source-linked presentation
~~~

Card kind is a physical class, not an ability ID. Printed Dynasty, branch and slot are visible data. Historical titles, notes and art are not instructions. The DSL remains custom and dependency-free.

### Nobles

Each action clause grants one capability. Removing the Recruit clause removes the build capability; removing the marriage clause removes marriage capability. Historical identity does not grant a replacement power.

The shared primitive “Actions cost 1 seal” is fixed in the grammar. A numeric cost parameter is deliberately not offered: ambiguous composition across a two-card Trade would introduce a mechanic the current game does not support. Unsupported cost changes must fail compilation.

Noble actions are grouped under Hand and Court so their source zone is visible. The marriage clause states that the Queen is unmarried, is in the player's Court, belongs to the player's Dynasty, and pairs with an unpaired foreign Noble in hand or Court. Action descriptions and the printed reference must use the same names as source: Recruit, Recall, Block, Trade, Lend, Cover, Withdraw, Challenge, Help, Draw and Claim the Crown.

### Laws

A Law parses independent clauses into the following data, instead of becoming an opaque paragraph alias:

~~~text
entryNatives
heir.count
heir.zone                 court | hand | marriage
heir.native
heir.differentBranches
witness                   native | marriage | none
keep                      any-heir | heir | heir-witness | heir-marriage
successionAfter
reignRounds
~~~

The existing route field is derived from these clauses as an identity for menus and legacy interfaces. Runtime eligibility and duration must consume the parsed values, not reintroduce hardcoded route quantities.

Each Law explicitly states entry requirements, the people selected, what must stay, when the Ruler changes, the full-round victory wait, and failure. The Tudor heir is set aside face down; it is not merely a face-down card that remains spendable in the hand. The marriage route requires the same marriage after the Ruler changes. The Charter retains its Witness after that change.

### Crises and painting fragments

Crises retain a small dictionary of typed effect primitives. A primitive is a documented reusable instruction, not a lookup by card name. Quantities that are currently intended to vary are parsed: collective Challenge/Lend quotas from 1–4 and ongoing duration from 1–3 rounds. An unsupported effect quantity is rejected rather than accepted and ignored.

Only one effect per timing is accepted. This is intentional: the current reducer can suspend on a choice, and a second simultaneous-choice effect in the same timing could overwrite that continuation. A general effect queue is a future language extension, not behavior to accept prematurely.

A fragment parses both its placement slot and its victory threshold. The source slot must equal the visibly printed slot. Goals are bounded from 1–6. A changed goal must affect actual game resolution, not merely the displayed paragraph.

### Partial grammar

This is the implemented language's structure, not an unrestricted English grammar:

~~~text
noble       := cost-clause hand-clause* court-clause? marriage-clause?
hand-clause := "Hand: " hand-action ("; " hand-action)* "."
court-clause:= "Court: " court-action ("; " court-action)* "."

law         := entry selection witness? maintenance succession victory failure
entry       := "Claim the Crown: Have " integer " Court Nobles of your Dynasty, including your Ruler."
succession  := "In " round-count ", at its start: " reveal? retirement coronation

crisis      := prevention activation restriction* effect* early-end? carry? expiry
prevention  := individual-condition | shared-challenge | shared-lending
effect      := ("When this starts: " | "At round start: ") typed-effect
expiry      := "Then end this event."
             | "Ends at round end, after " integer " more round(s)."

fragment    := placement immediate-loss
~~~

The actual parser and canonical emitter define singular/plural agreement and exact alternatives. Unknown words, repeated clauses, missing timing, contradictory maintenance, slot disagreement and unsupported quantities are errors. The canonical emitter checks that parsing has not swallowed or reordered meaningful text.

## Execution contract and drift prevention

The rules engine still defines shared verbs, just as a physical rulebook defines “draw” or “discard.” The requirement is that every card-specific selector, count, timing, exception and result is visible in its Card Text. No card can be literally understood without knowing any shared game nouns; therefore the physical quick reference must define Court, hand, Dynasty, Bloodline, ready, The Past and the core actions.

Each selectable effect should create a choice request with chooser, legal objects, quantity, snapshot, visibility and continuation. For “each player chooses … together,” compute all options before any selected card moves, collect choices, then apply the results and relationship cleanup. Do not let first-player ordering change who was eligible.

Costs should be validated with the intended action before payment. Rejecting an invalid command must leave the state unchanged. A cost cannot be partly paid, and explanatory tooltips cannot make an otherwise invalid action legal.

The reducer owns public/private boundaries. A script predicate must not reveal the identities of another player's hand, and a readable source listing available actions must not expose which hidden cards an opponent currently holds. AI uses the same legal-action rules and player view as a human.

The version-2 source hash includes language, compiler, dictionary and interpreter-semantic version identifiers as well as authored card source. Interpreter changes still require an explicit semantic-version bump: this fingerprint is a compatibility discipline, not an automatic proof that all engine edits were versioned. Reminder definitions are excluded from semantic hashing when they merely explain existing rules.

Rendering must use the same canonical source and preserve clause boundaries. It may add line wrapping, emphasis and accessibility markup, but may not replace a rule with an independently authored summary on the full reference face. Compact battlefield faces remain the user-authorized exception, with the full face available for inspection. Manufacture/reference dimensions remain 63:88.

## Mechanical changes made to reduce explanatory complexity

Two baseline effects were intentionally simplified during this pass:

1. Border Rising (A2) no longer protects an artificial minimum of two native Court Nobles. Each player with a Ruler retires one other eligible Bloodline Noble, if one exists. The consequence now follows the readable selector without an extra counting exception.
2. A Disputed Charter (P2) now allows the Crown holder to choose any other Court Noble in their Bloodline to return to hand. The old route-specific “Crown dependency” eligibility varied by succession stage and required an additional rule table.

These are new design choices, not historical claims or proof of better balance. Regression tests need to exercise the changed edge cases, and playtesting must evaluate whether the new effects create excessive loss or overly forgiving Crown defense.

The four Dynasty victory structures remain distinct. No combat statistics or health totals were added. Marriage, concealed hands, delayed succession, shared history and vulnerability of public rule remain the design's central relationships.

## Diagnostics and evidence

Errors include content ID, filename, printed line, column, stable code and a corrective suggestion. The current clause parser reports the relevant line and column 1; token-precise underlining is an editor improvement, not an implemented claim.

The language-specific tests executed during this task passed nine groups:

- All 92 authored sources compile deterministically and round-trip exactly.
- Removing every reminder preserves the program and operative hash.
- Changing Law entry count, heir count, succession delay or reign duration changes typed values.
- Removing Noble clauses removes capabilities; changing identity does not add abilities.
- Crisis contribution counts and lifetimes, plus painting goals, parse from source digits.
- Unknown, missing, conflicting, out-of-range and repeated-timing clauses fail closed.
- Diagnostics identify the exact failing printed line.
- Invalid combinations fail: Challenge with a generic Help ending, an instant Crisis with an early-ending action window, and an ending marriage forbidden by the same Crisis.
- The ambiguous historical Blood Edict source remains a failing fixture outside production content.

These compiler tests are necessary but insufficient. Separate reducer tests must demonstrate that a changed printed number changes actual legal actions and actual outcomes. Compiler-generated expected programs alone can reproduce the same mistake on both sides.

Required independent checks include entry 3→4 blocking a Crown attempt; one→two reign rounds delaying victory; removing Recruit or Marry preventing those actions; Challenge 2→3 requiring a third legal contribution; duration 1→2 surviving an extra round; painting goal 6→5 ending on the fifth uncovered fragment; and slot disagreement rejecting compilation. Also test the A2 and P2 revised selectors and H2 failing, rather than delaying, a due Crown change.

The separate runtime suite was subsequently executed: all 13 cases in [card-language-runtime.test.ts](../../tests/card-language-runtime.test.ts) passed, including a four-contributor Challenge, three-Dynasty Help requirement, succession delay, and the A2/P2/H2 edge cases. The combined compiler/runtime run passed all 22 tests after the final text corrections. TypeScript checking also passed during integration. These results establish the tested machine behaviors, not human comprehension or balance.

The final wording pass also made three existing consequences explicit: a failed Tudor Crown claim reveals and returns a hidden heir to hand; a completed Trade satisfies The Open Record for both parties; forced loans from The Imperial Settlement do not count as Help toward ending that Crisis. The compiler requires the hidden-heir recovery clause for a hand-selected heir.

## Human validation and iteration

For each representative card, show the actual full face and ask an unfamiliar reader to point to who acts, which physical cards may move, what is paid, when it happens, when it ends and how it can fail. Ask for a prediction on a concrete board state before revealing the engine's result. Use both a normal case and one tempting wrong interpretation.

Record the observed answer, time, rereads and requests for definitions. Score semantic agreement separately from sentence difficulty and card layout. A grade-level formula or reviewer estimate cannot establish comprehension of a game relationship.

Iterate wording or mechanics when the same alternative interpretation recurs. Prefer removing an exception before introducing another specialist noun to compress it. The stopping criterion is a documented, reviewable improvement with passing semantics and actual visual inspection; a claim of universal perfect first-read comprehension requires evidence this pass cannot supply.

## Remaining boundaries

This implementation is a finite clause language, not a general language for arbitrary card abilities. New primitives require documented semantics, parser support, source-driven runtime handling and independent scenarios. Localization would need its own surface grammar mapped to the same typed representation. Unbounded loops, callbacks and arbitrary host code remain outside the language.

First-time human comprehension, balance and enjoyment remain testable hypotheses. A compiled card can be internally exact while still being hard to read. The engineering contract prevents silent text/engine disagreement; the learning and play tests determine whether the design earns the user's “Reading the Card, Explains the Card” standard.
