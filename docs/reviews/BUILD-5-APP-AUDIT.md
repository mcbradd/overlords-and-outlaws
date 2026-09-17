# Build 5 app, save and tutorial audit

17 September 2026. Independent code audit of root-authored `src/core-game/app.ts`, `storage.ts` and `tutorial.ts` against the frozen Build 5 plan and approved attrition exchange. The reviewer authored the engine, not these three modules. No edits to the audited modules were made during this review.

Baseline HEAD: `3fbb7343110a6a067d5afeb18bab9f684c129191`; audited implementation is uncommitted work. File hashes at review capture: app `A5921CBF2126ADBFFEAA5426C9D8349047137AE81E2F79B99C47499511169676`; storage `04976FFB3676B72751FC1E18FA92FB6C20BEFD35E6F8BD07D16694440A27E618`; tutorial `D0EF7D9E3BC0E630AB86980B8A34CA6AA103FD9BC93175A4807024AA31746A62`. Concurrent formatting may change line numbers; function names identify each finding.

This review used source reading, three existing storage tests, one direct decoder reproduction and two instrumented headless Chrome cases against localhost port 5173. Browser DOM/runtime assertions below are not actual visual inspection. No whole-UI, device, blind-player or ten-game coverage is claimed.

## Concrete findings

### APP-01 — P1: denied storage prevents the application from opening

Location: `app.ts:28`, top-level `readSave(localStorage, namespace)`.

Accessing the browser's localStorage property happens before readSave enters its exception handler. If storage access itself throws a SecurityError, module initialization stops before home(). This is distinct from storage.getItem throwing, which the existing wrapper handles.

Reproduced in headless Chrome using a page initialization script that makes the localStorage getter throw a SecurityError. Result: page error `Storage blocked by policy`; the app element's text was empty. This models denied browser storage; it is not a claim that a particular user's browser currently denies it.

Required fix: acquire browser storage behind a guarded adapter and allow an unsaved session with a clear warning. Keep export/recovery available where possible. Guard both reads and writes without requiring storage merely to show the title.

Required tests: property getter throws; getItem throws; setItem/quota throws; normal adapter works; title and tutorial remain reachable in the first two cases, and no historical bytes are overwritten. Treat these as separate failure surfaces.

### APP-02 — P1: importing a game bypasses the asset preparation gate

Locations: `app.ts:375–387`, modal close listener and file-change handler; start and render lifecycle.

The import handler calls dialog.close() and then start(). The latter installs the incoming game and begins awaiting its portraits. The queued dialog close listener observes that game and independently calls render(), replacing the preparation screen before preload completes.

Reproduced by importing a four-Dynasty solo save while delaying character requests by 2.5 seconds. At 300 ms, before those requests resolved: the core-table element existed, two core-face-loading placeholders existed, and the Preparing your table heading count was zero. No page error was necessary for the failure. This directly violates B01/I12 even though the normal new-game path waits correctly.

Required fix: suppress the old modal's close-triggered render during navigation/import, and give asynchronous renders/loading completions a generation token. A stale continuation must not replace a newer screen, install another AI timer or clear the busy state of a newer load. The current success-only load token does not guard the catch path or render after its await.

Required tests: import delayed four-Dynasty portraits from title and from an existing game; preparation persists with zero card placeholders until readiness; close/import/home/retry races cannot repaint an old game; exactly one current AI continuation exists; failed or stale load cannot replace a newer successful screen. Inspect the eventual visible transition separately.

### APP-03 — P1: rival tutorial explanations disappear on a fixed reading deadline

Locations: `app.ts:253–256` (currentGuide) and `app.ts:307–321` (tutorial timer).

An unfinished rival teaching step automatically commits after 3.8 seconds. Commit sets lesson.done=true, and currentGuide replaces that step's explanation with its outcome. There is no reader-controlled action before the replacement and no way to reread the explanation afterward. For example, the first Recall step introduces the suit match, exchanged person, defense purpose and attempt limit in a substantial paragraph, then removes that paragraph on the timer.

This is a source-established control-flow defect, not a measured claim that every reader misses the lesson. It conflicts with the frozen requirement that teaching text remain until readable and that reduced motion not dictate reading time.

Required fix: either require an explicitly highlighted Watch the rival move action after the explanation, or retain the explanation and outcome together within the single guide until Continue. Continue must remain cursor-only; it cannot execute the game action. Do not add a second teaching modal.

Required tests: wait longer than the animation/timer duration on a rival step; its explanation remains readable until the learner advances; keyboard and touch use the same flow; no hidden timer commits twice; outcome and explanation still fit the required viewport matrix; exact reducer tutorial sequence remains unchanged.

### APP-04 — P2: accepted tutorial saves can have no legal next lesson action

Locations: `storage.ts:30–36`; `app.ts:166–180`; existing storage test U28.

The decoder checks the cursor's range but not whether the saved game is the state reached at that cursor. A fresh createTutorial() saved with cursor 2 and done false is accepted. Its actual phase is action, but cursor 2 expects defend; filtering the legal actions for that teaching step yields zero. Resuming that accepted save strands the learner with no taught continuation.

Direct reproduction returned an accepted cursor 2, phase action, and zero availableTeachingActions. The existing storage roundtrip test actually uses this mismatched fixture and therefore blesses the defect. Its three current tests passed during this review.

Required fix: validate tutorial progress against the exact legal prefix of the prepared tutorial, accounting for whether the current step is done. Reject inconsistent imported/restored progress with recovery text; do not silently change cards to match a cursor. Update the roundtrip fixture to a legitimately reached step.

Required tests: roundtrip every real before/after step; fresh state paired with a later cursor rejects; response-state paired with wrong cursor rejects; inconsistent done flag rejects; no accepted unfinished tutorial save has zero matching next actions. Preserve the original stored bytes on rejection.

**Recheck:** root implemented the written [resume/response amendment](BUILD-5-RESUME-RESPONSE-AMENDMENT.md) during this review. The systems reviewer reran the updated storage suite: 4/4 tests passed, including all 22 real before/after tutorial boundaries and mismatched progress rejection. APP-04's decoder defect is resolved by that correction; actual browser resume remains its own integration gate.

### APP-05 — P2: Trade feedback asserts hidden ownership and exposes knowingly impossible bargains

Location: `app.ts:248–250`, pending Trade description; card choices populated by renderChoices from legalActions.

The pending description always says the initiator offers a card “for your [requested person]” and instructs acceptance or decline. A formal request is permitted even when the recipient does not hold that person. On the recipient's private view, there is then only Decline, with no explanation that the requested person is absent. On the initiator's view, “your” refers to the wrong seat entirely. The description consequently asserts a possession that has not been established.

Separately, the current engine's candidates include exact requests to a recipient whose public hand count is zero. Every such bargain is known to be impossible; the app presents these as selectable alternatives. This last issue originates in engine.ts candidate generation and needs an explicitly assigned engine follow-up; this reviewer did not change engine scope during the app audit.

Required fix: describe the exact recipient/request neutrally. Only the recipient's own private view may explain that they do not hold the card; the initiator must see identical refusal feedback whether it was unavailable or unwanted. Suppress/reject formal offers to a publicly empty hand without revealing any private ownership.

Required tests: recipient holds request versus does not hold it; correct own-view explanation and controls; indistinguishable initiator rejection output; initiator and recipient copy use correct names; zero-hand recipient generates no selectable formal Trade; ordinary unknown nonempty recipients remain requestable.

### APP-06 — P2: the tutorial never names two central taught people in its guide

Locations: tutorial.ts first defense, heir introduction and subsequent successor references.

The operative fixture is correct, but the guide repeatedly calls William the Lion “your Alba 4” and Alexander II “the Alba 5” / “your named heir”. Neither person's full printed name is introduced in those teaching paragraphs. This repeats the exact card-to-prose identification problem the user requested fixing, even though Malcolm III and Kenneth MacAlpin are now named consistently.

Required fix: introduce William the Lion and Alexander II by their full printed names plus rank when first teaching their roles; use Alexander II by name at the actual Crown transfer. Rank can remain the concise comparison cue afterward. Names must continue to come from the retained content identities.

Required tests: the first teaching occurrence of each acted-on person identifies their full printed name; the succession explanation names the actual heir; no mismatched IDs/names; visually read the corrected guide at compact sizes rather than reducing type to absorb longer text.

## Checks that did not produce findings

- Ordinary normal-play AI receives viewForSeat(game, actor) and defaults to the balanced projected policy. The app does not pass full state to chooseAction.
- Hand rendering selects only the configured viewer. Local mode starts and returns to a private curtain before another hand is uncovered. These source checks do not substitute for actual privacy-transition captures.
- Commitment uses a revisioned engine payload; invalid/stale actions throw without mutation. Current selected actions are cleared when their revision differs. Existing response ownership and exact action fields match the engine API.
- The tutorial filters the current action and disables unrelated camera/card inspection; Continue changes only the lesson cursor. The reading-time and malformed-save defects above remain independent of that correct behavior.
- Recall descriptions and the first Recall teaching paragraph now explain the successful lead/target exchange. Private save export is explicitly labeled as containing all hands; it is not advertised as a public replay.

These findings reopen their named tasks. They do not establish that every other UI state, asset, mobile viewport, keyboard or full-game decision has passed.

## Correction verification — 17 September 2026

After root signaled the fixes were available on dev port 5173, the independent reviewer ran `npx tsx scripts/core-app-audit.ts`. All six instrumented Chrome cases passed; exact source hashes and runtime evidence are retained in [BUILD-5-APP-AUDIT-RESULTS.json](BUILD-5-APP-AUDIT-RESULTS.json).

- APP-01: throwing the storage property getter, getItem and setItem each left the title and tutorial reachable with a warning. No unhandled page errors occurred.
- APP-02: delayed four-suit imports from title and from a completed game retained the preparation heading at 300 ms with no table or unfinished card placeholders, then displayed the loaded table.
- APP-03: the rival explanation and saved game remained unchanged after 4.5 seconds; Watch the rival move executed exactly one legal Recall; a further 4.5 seconds produced no duplicate; Continue changed the cursor without advancing the game revision.
- APP-04: the updated storage suite passed 4/4, including real tutorial prefixes and mismatched progress rejection, as recorded above.
- APP-05 engine portion: after the written EMPTY-01–EMPTY-03 amendment and a failing test, public-zero-hand recipients are now omitted and rejected atomically. Nonempty unknown hands remain requestable regardless of concealed identity. Core suite passes 25/25. Same 24 policy cases now produce 22 wins and two capped draws, recorded separately in [BUILD-5-EMPTY-HAND-POLICY-RESULTS.json](BUILD-5-EMPTY-HAND-POLICY-RESULTS.json); the earlier 272-game file remains evidence of its earlier candidate.
- APP-06: the controlled browser route confirmed the first defense explanation includes William the Lion. The broader compact visual-readability proof remains the presentation review's responsibility.

These targeted regressions resolve the reproduced APP-01/02/03 failures and the engine portion of APP-05. They do not assert that all possible navigation races, every Trade wording variant or every visual viewport has been inspected. No screenshot was counted as human-visible acceptance in this verification script.
