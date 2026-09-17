# History engine Card Text language v1

`src/history-engine/content.ts` is the authoritative card source. It exports the exact production set and compiles each source through `compiler.ts`. A compiled card carries source, language and compiler versions, an operative source hash, a dictionary hash and a typed `Program`. These stable hashes are compatibility identifiers, not cryptographic authenticity signatures.

## Accepted forms

The language is deliberately closed: clauses must match the canonical strings exported as `CONDITIONS`, `RESTRICTIONS`, `EFFECTS` and `LAWS`. Each Interregnum clause occupies one line. The compiler recognizes these templates:

```text
Avert: <condition>
While active: <restriction>
On activation: <effect>
At the start of each round: <effect>
End: <attack condition>
End: Complete this card’s Avert condition through Address.
Carry pending contributions into active play.
Then Expire.
Expire at the end of the next round after activation.
```

Baseline Noble operative text is empty; printed Dynasty, Queen, founder and Alba branch metadata provide eligibility. A Law matches one canonical Law body. A fragment matches its numbered slot clause. `canonicalText(program, kind)` reconstructs these forms; round-trip fixtures cover all 92 sources.

The dictionaries bind exact quantities, controllers, zones, timing and legal purposes. Typed effects execute in the shared adjudicator; the engine does not dispatch effects by card ID. Production cards cannot inject JavaScript or an arbitrary selector. The redesigned Blood Edict is a test-only compiled effect and is excluded from the twelve production Interregna.

## Authoring and validation

Edit the source Card Text, then run:

```sh
npm run cards:compile
npm run lint:card-text
npm run test:card-semantics
npm run test:reminder-invariance
npm run cards:manifest
npm run cards:proof
```

Compilation is part of the ordinary build. Unknown, contradictory, incomplete or unsupported clauses fail closed with content ID, filename, line, column, diagnostic code and a suggested canonical form. Diagnostics include illegal zones/verbs, ambiguous quantities, missing simultaneous-choice wording, partial costs, prohibited recovery, legacy stats, absent operative text, unknown reminders, recursive triggers, eligibility omissions and unsupported modules/slots. Physical ink fit is checked separately by `test:history:print`; it requires a running app server and the generated proof.

Adding a new legal clause requires an explicit typed-program change, compiler mapping, generic adjudication behavior and independent behavior fixtures. Arbitrary paraphrases are not automatically accepted. The full extensible authoring grammar and every aspirational lint diagnostic in the design document are not claimed complete by this core-set implementation.

## Reminder and privacy boundaries

Reminder references resolve in the canonical registry and never feed the interpreter. Removing all reminders leaves operative hashes, compiled programs and tested game outcomes unchanged. Reminder wording changes the dictionary compatibility hash but cannot add an action or effect.

UI, advice and AI consume a `GameView`. Seat views whitelist known identities and private choices; spectator views omit them. Complete saves are intentionally private exports. Public records omit the seed, concealed packets, sealed Tudor identity and private observations. Public event proof remains after committed cards return from Leverage.

## Modules

- `rules.ts`: legality and projected available actions; previews never commit.
- `engine.ts`: sole state mutation boundary, round continuations and choice settlement.
- `view.ts`: explicit information projections and public export.
- `ai.ts` / `ai-worker.ts`: deterministic seat policy and off-thread execution.
- `storage.ts`: v4 envelope, namespace and validation.
- `tutorial.ts`: published initial fixture and legal action sequence.
- `face.ts` / `scene.ts`: manifest-driven faces and physical presentation.

The broader implementation status and evidence are recorded in [the report](HISTORY-ENGINE-IMPLEMENTATION-REPORT.md).
