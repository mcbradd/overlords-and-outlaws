> **Superseded candidate - player correction, 17 September 2026:** The user rejected unrestricted Court entry: foreign cards must enter through marriage. Trade may request only a rival's face-up Played/Resting cards. The any-card Add / no-marriage candidate below is historical planning evidence and must not be implemented as written. See [the current correction and regression tasks](reviews/BUILD-5-PLAYER-FOLLOWUP-2026-09-17.md). Its dependent tutorial, state and acceptance package requires redesign before implementation.

# Build 6 test contract

17 September 2026. Frozen normative acceptance contract for `SUIT-AND-RANK-DESIGN.md`. This document contains no implementation and claims no completed Build 6 tests. The production package includes the exact tutorial sequence, state boundary and expanded visual inventory; all precede implementation.

Use public seams `createGame`, `applyAction`, `legalActions`, `viewForSeat`, and `assertInvariants`; storage save/load boundaries; the actual application and renderer; generated face/reference output; and AI decisions from public views. API encoding may be settled in the freeze, but these observable outcomes cannot change silently to suit an implementation.

Encoding is fixed by [BUILD-6-STATE-CONTRACT.md](BUILD-6-STATE-CONTRACT.md). Task mapping: E/P→B602; A→B603; S→B604; V01/02→B605; V03/04→B606; V05/06/07→B607; V08/R→B609; T/B6-TUT→B608; private handoff/public memory also B610; Q01/02→B611; Q04→B612; Q03→B613; Q06→B614; Q05/fresh play→B615.

Additional frozen cases: **P04** ordered accepted-transfer moves visit Resting then hand when the next seat starts, without a cursor action; another viewer sees null identity for private refill but exact public returned identity. **S05** blank/overlong names and noninteger/out-of-range deal input reject with entered data preserved; default You and every valid first seat work. These supplement, rather than replace, E/P/S rows below.

## Fixtures and assertions

S/T/U/V denote distinct selected suits. A=1, J=11, Q=12, K=13. `S4` is one unique card, not four copies. Fixtures begin with the complete selected deck and relocate identities into named zones; all unspecified cards remain in a declared supply or hand. Cross-suit duplicates such as S4/T4 are distinct cards. Every case asserts conservation, one location per identity and valid ownership. Fixture construction must not omit cards or invent identities to manufacture a result.

Compare entire pre/post state for invalid actions, not only a resource counter. A committed pending offer must have exactly one authoritative location; a visual echo is not a second card. Tests may use deterministic fixtures and inspect engine state. Blind-play evidence may use neither.

## Engine task — B6-ENGINE

### Setup, legal options and cyclic ranks

| ID | Case and worked expected result |
|---|---|
| E01 | For 2/3/4 seats, `createGame` exposes each selected Dynasty's actual Founder, deals exactly two cards each and leaves supply 20/30/40. First decision still has two, not three. No starting Crown, immunity or prebuilt relationship. |
| E02 | Same seed, selected suits and first seat produce identical state; changing only first seat changes active seat without duplicating/deleting cards. Every selectable first seat gets the first ordinary decision. |
| E03 | Reject duplicate/unknown Dynasties, unsupported seat count and out-of-range first seat at setup without constructing a partial playable game. |
| E04 | On every nonempty hand, each held identity has Add regardless of suit. With S owner, Court SA and hand T5/U9, both Adds are legal; lack of native cards never forces an empty action list. No voluntary Pass, paid Draw or end-turn action is legal. |
| E05 | Neighbor table, all 13 independent expectations: A→K/2;2→A/3;3→2/4;4→3/5;5→4/6;6→5/7;7→6/8;8→7/9;9→8/10;10→9/J;J→10/Q;Q→J/K;K→Q/A. Rank itself and every other rank are nonneighbors. Test both directions. |
| E06 | All 13 qualifying rank sets: A23,234,345,456,567,678,789,89(10),9(10)J,(10)JQ,JQK,QKA,KA2. Each qualifies in all six card-order permutations and with mixed suits; labels are literal expected sets, not computed by the implementation under test. |
| E07 | Nonruns A24,235,JQA and Q A 2 do not qualify. S4/T4/U5 is not three distinct ranks. Adding V6 creates a run4/5/6. A/K wrapping is valid only through consecutive positions, not arbitrary endpoint inclusion. |
| E08 | Court S4/T5, hand U6: Add U6 moves exactly that card to Court, preserves its suit, creates Crown and ends turn. Court cards cannot be replayed as hand actions. |
| E09 | Add a disconnected rank is legal: Court S4/T5 plus U9 produces no Crown. Mandatory play does not force a completing rank merely because another held card completes. |

### Swap, answers and public consequences

| ID | Case and worked expected result |
|---|---|
| E10 | Offered S2 can target rival SA,S4,SK: target rank imposes no restriction. Offered T2 cannot target S4. Own Court and non-Court cards are invalid targets. The initial Founder is a valid same-suit target. |
| E11 | Commit offered S6 against rival S3. Public pending identifies S6/S3 and possible answers S5/S7; only target controller acts. Original actor cannot Add again; another player cannot answer. |
| E12 | Defender holding S5 answers S6: S6 rests with attacker, S5 rests with defender, S3 stays Court. Existing intact Crown stays. Response ends pending and advances to the next ordinary seat exactly once. Repeat independently with S7. |
| E13 | Defender declines S6 against S3: S6 rests with defender, S3 leaves Court and rests with attacker. Suit/rank unchanged, no discard, no immediate Add. Declining remains legal when S5 is held. |
| E14 | S5/T7 against S6: S5 legal, T7 illegal. S4 and S6 are illegal answers. Invalid answer leaves complete state and public knowledge unchanged. Already exposed S5 cannot answer. No counter-answer. |
| E15 | Endpoint examples: SA offer accepts SK or S2 answer; SK offer accepts SQ or SA. A has no special numeric-strength privilege and K is not automatically unstoppable. |
| E16 | Answer spends no future ordinary turn. If next clockwise seat is the defender, its Resting answer returns at that turn's start and it still plays one card. If not next, it remains unavailable until its own start. |
| E17 | Cancel uncommitted Add/Swap preview leaves state, active seat and knowledge identical. Repeated cancel cannot refill or advance. A committed offer cannot be canceled by the attacker to avoid the answer. |
| E18 | Tampered wrong-seat, missing-hand-card, wrong target controller, duplicate response and stale pending action all reject atomically. Replaying a response cannot transfer cards twice. |

### Crowns, order, duplicates and natural terminal

| ID | Case and worked expected result |
|---|---|
| E19 | Crown Court S3/T4/U5: remove T4 via unanswered T-suit Swap → no run, Crown removed. Answered Swap leaves target/Crown intact. Preview and result use this actual consequence. |
| E20 | Crown Court S3/S4/T4/U5: remove S4 → T4 still supplies rank4, Crown stays. Remove T4 later with no replacement → Crown removed. |
| E21 | Crown Court S3/T4/U5/V6: remove S3 →4/5/6 survives; Crown stays. Do not bind Crown to an arbitrarily selected3/4/5 trio. Remove T4 instead from original state →3/5/6 is not a run; Crown removed. |
| E22 | Any larger Court containing a qualifying set qualifies. Opponent removal cannot create a new Crown; invalid imported run/Crown combinations are handled by storage validation rather than silently granting victory. |
| E23 | For each first seat and N=2/3/4, Add completes a run. Exactly N−1 other ordinary turns precede claimant's next-start win check; intervening responses do not steal or add ordinary turns. Claimant does not return Resting or draw before winning. |
| E24 | Two Courts gain Crowns in order. If both survive, the first whose ordinary turn begins wins; second never receives a simultaneous victory. If first Crown breaks, its start does not win and second retains its own subsequent check. |
| E25 | All-empty terminal: supply/hands/Resting empty and no Crown → No Crown—draw, no automatic advance loop. A conserved example distributes only ranks A/3/5/7/9/J to one Court and2/4/6/8/10/Q/K to another, for each of two suits; neither has a three-rank run. |
| E26 | Supply and hands empty but one Resting card exists → not terminal. Skip preceding truly empty seats, return the card at its owner's start, then require Add or Swap. No Pass button/action. |
| E27 | Empty seat with Crown wins before being skipped. All hands/supply/Resting empty with a Crown must advance to the first clockwise crowned seat rather than declare draw. Bound empty-seat iteration by seat count while preserving turn order. |
| E28 | Natural draw and win are absorbing game states: every attempted card action rejects; no refill or next-turn instruction follows. Creating a fresh game requires explicit new-session operation. |

### Return, refill and invariant boundaries

| ID | Case and worked expected result |
|---|---|
| E29 | Start with hand0, Resting3, supply5 → return3, draw0, hand3. Start hand1/Resting1 →hand2, draw0. Start hand0/Resting1 →return1 then draw1. Return always precedes refill. |
| E30 | Start hand0/supply1 →draw1 and play; hand1/supply0 →play1; hand0/supply0/Resting0 →automatic skip. Empty supply never reshuffles. |
| E31 | Start hand5/Resting2 →hand7, draw0. No two-card ceiling, overflow discard or forced truncation. End-of-turn Add from hand2 leaves1 until that player's next start; no end-turn refill. |
| E32 | Run each legal branch across2/3/4 seats and source deck26/39/52: identity multiset constant; no negative counts; public/private/Resting/pending location unique; all referenced identities exist. Deliberate duplicate, missing, unknown or cross-deck card fails `assertInvariants`. |
| E33 | A valid pending serialization does not duplicate its committed offer. Reload/apply answer produces exactly E12/E13. Invalid pending controller/target/offer relation rejects before play resumes. |
| E34 | Repeated state is possible and must not silently invoke a turn cap, reshuffle or invented winner. A bounded repeat trace is logged as a playtest failure signal, not passed as guaranteed termination. |

## Public view and AI tasks — B6-ENGINE / B6-AI

| ID | Case and worked expected result |
|---|---|
| P01 | Seat view contains its own held identities, public Court/Resting/committed offer/target and hand counts. No rival hidden identities, supply order, seed capable of reconstructing the deal or private policy state is exposed. |
| P02 | Returned/disclosed cards remain publicly remembered with current owner and an unknown remainder count. Private draw updates count but not known identity. Public transfer moves knowledge; a later public Add removes that identity from remembered hand. No stale ownership claim. |
| P03 | Exchange two unknown rival cards or permute private supply order while preserving public facts. Other seat's view and legal options remain identical. Pending display always shows possible neighbor ranks, never confirms actual hidden answer possession. |
| A01 | Every AI action belongs to `legalActions` for its acting public view. During pending it chooses only target-controller answers/acceptance; ordinary mandatory play never returns Pass or no-op when a held card exists. |
| A02 | Hidden permutations from P03 produce identical deterministic decision, explanation and considered alternatives. Policy takes a public view, not full hidden state. |
| A03 | Risk pair: Court S4/T5, hand S3/S6; known rival S2 versus known rival S7. Both Adds create a run. Keeping S3 answers S2; keeping S6 answers S7. Policy evaluation must reflect the reversed defense coverage and cannot declare either globally safe because unknown cards remain. Record competing actions/reasons; do not hard-code lowest/highest rank preference. |
| A04 | Offer pair: rival crowned S3/T4/U5, own hand S2/S6; remembered defender SA versus S7. S2 attack is answerable by SA, S6 by S7 (other neighboring S3/S5 availability follows exact fixture). Holding public remainder equal, evaluation must distinguish exposed answer risk and legal alternative. Do not infer missing answers from unknown cards. |
| A05 | If an unanswered available Swap breaks the next player's Crown, its consequence must be recognized before a harmless Add. Construct no-own-immediate-win alternative and known absence of legal answers; chosen action stops the imminent win. Duplicate-rank/overlapping-run variants must not falsely report a broken Crown. |
| A06 | Cohort across2/3/4 seats and first-seat rotations records turn counts, cycling, forced replies, competing legal moves and recovery. Simulator outcomes are not UI-play evidence or proof of family enjoyment. Repeated nonprogress cannot be hidden behind a cap-draw success rate. |

## Storage task — B6-STORAGE

| ID | Required result |
|---|---|
| S01 | Schema6 save/load round-trips ordinary and pending states, active/first seat, Crowns, supply, complete cards and public knowledge. Loading does not take a turn, refill twice or reveal private cards. |
| S02 | Existing schema5 save remains byte-for-byte preserved when Build6 starts/saves. It is not interpreted under Build6 rules. Explicit old-save messaging permits export/recovery of the original data; do not promise a playable Build5 route unless one actually exists. No silent migration or overwrite. |
| S03 | Broken JSON, unsupported newer schema, invalid counts, duplicate/unknown cards, invalid Crowns, forged known-hand entries, pending mismatch and malformed tutorial cursor reject safely. Existing valid session remains unchanged. Error copy is concise player language. |
| S04 | Denied/quota-limited storage leaves the in-memory legal game usable and reports save failure. Retry does not duplicate actions. Fresh/reloaded session privacy curtain precedes any private hand render. |

## Asset, scene and app tasks — B6-ART / B6-SCENE / B6-UI

| ID | Required evidence and result |
|---|---|
| V01 | All52 source identities retain verified name, rank, printed Dynasty and original portrait hash. All generated card/reference faces retain63:88 geometry. Every changed face and shared aid is actually opened at readable scale; no distorted frame, empty portrait hole, tiny operative index or invented historical power. |
| V02 | Rank-ring aid shows all13 ranks exactly once, A adjacentK/2, and worked run/Swap/Answer examples. Actual rendered card and aid review confirms no remnants of seals, health, successor, marriage, old higher-rank defense or round cap. Source originals remain unchanged. |
| V03 | Real renderer regression reproduces existing portrait striping before correction. Corrected first/second Court rows, dense mixed-suit Courts, Resting stacks, rank indexes and camera angles remain intact in opened images. Source art passing alone cannot satisfy this test. |
| V04 | Active marker, per-Court Crown, public supply and Resting placement are distinct, physical and nonoverlapping. Duplicate ranks and several Crowns remain legible. Every public stacked identity can be inspected through pointer, touch and keyboard. |
| V05 | Real UI: select Add, preview/cancel, commit and see actual card movement; select Swap, pick same-suit rival, answer/accept transfer, see source and destination. Complete both branches and boundary cases; no force-click or private-state shortcut. All ordinary instructions satisfy one short sentence plus visible example. |
| V06 | Incoming offer, target and both possible answer ranks visible together. Accept-transfer label names the incoming person consistently through preview/confirmation/outcome. Unknown answers remain unknown; no misleading guarantee or contradictory Let it happen/Decline wording. |
| V07 | Court run preview accurately reports duplicate/overlapping protection; terminal removes active-turn/future-return instructions. New-game/replay accessible. Name/plural grammar correct. Menus/reference agree with selected rules. |
| V08 | Cold/warm/slow/failed art loading uses stable dark surface and retry. Stale completion cannot overwrite later screen. Existing imports recover with legible announced errors and no raw parser output. |

## Tutorial and responsive tasks — B6-TUTORIAL / B6-RESPONSIVE

| ID | Required result |
|---|---|
| T01 | Before implementation, exact prepared deal, tutorial cursor graph and legal action trace are frozen in the production plan. Start one exposed Founder and two held cards; identify prepared deal visibly. No prebuilt unexplained run. Every illustrated action is legal under ordinary reducer. |
| T02 | At each cursor only taught next interaction and Exit are available. Continue changes curriculum only; board changes require legal action. Rival action has visible source/target/result and readable explanation before execution. No offscreen Watch event. |
| T03 | Reload/exit/reentry during explanation, selection, preview, pending response and outcome cannot skip required action, refill twice or mutate game through cursor edits. Invalid cursor restores safely. |
| T04 | Fresh screen-only learner predicts immediate Add/Swap/Answer consequence and goal without coaching, source access or supplementary paragraphs. Record wrong answers and instruction burden. Scripted regression is separately labeled and cannot count as this learner. |
| R01 | Expand required state inventory from correction coverage contract into literal Build6 action/tutorial/result IDs before freeze, retaining exact21 viewports. Remove old-rule cases only with explicit replacement mapping. Every baseline row has screenshot, assertions and actual review; early failure leaves later rows missing in denominator. |
| R02 | Reproduce prior360×780/800 action clipping, badge overlap, phone response Inspect clipping and844×390 captions; corrected complete labels, focus rings and44px targets fit safe usable area. No shrinking operative text as a workaround. |
| R03 | Same page/dialog/session: type long name, keyboard-height resize, rotate and restore; value and appropriate focus preserved. Field/label/caret comfortable; real wheel/Tab reaches deliberate-scroll submission. Reloaded fresh setup is invalid persistence evidence. |
| R04 | Keyboard-only and touch routes,200% browser zoom, reduced motion, synthetic four-edge safe insets, hand overflow first/middle/last cards and dense focus/reset all verified. Actual OS keyboard/cutout/device comfort remains unverified without hardware evidence. |

## Evidence and release tasks — B6-EVIDENCE / B6-RELEASE

| ID | Required result |
|---|---|
| Q01 | Freeze inventory count/hash and task-to-case mapping before implementation. Evidence joins source SHA/dirty diff, served SHA/build and JS/CSS/asset hashes, browser/profile, fixture/trace, screenshot hash and individual actual opening record. Missing/mismatched/uninspected rows cannot pass. |
| Q02 | Operative names/ranks require native-scale or explicit native-pixel crop review with crop coordinates. Downscaled4K/contact sheets support composition only. Record tool limits. Failed evidence remains immutable across retries. |
| Q03 | All changed code goes through spec/standards review, type/build checks and meaningful boundary tests at its owning seam. Coverage report exposes unexecuted branches with rationale; no one-test-per-line or snapshot of implementation internals claims universal correctness. Every asset has provenance, file/decode/link checks and actual in-context review. |
| Q04 | Preserve and repair the prior complete release result40 pass/23 fail. Each classified current/retained/stale/unclassified failure gets its documented applicable behavior, repaired test or implementation and rerun. No wholesale legacy skips or automatic waivers. Retained mode contracts remain distinct from Build6. |
| Q05 | Full exact-candidate release suite, all required visual rows and real browser flows pass. Normal UI play completes ten games after fresh tutorial; record choices, uncertainty, stuck points, cycles and terminal outcomes. Proxy play, simulation and actual family testing remain separate. No enjoyment guarantee. |
| Q06 | Read release procedure; commit intended paths to Prod, verify exact candidate and deployment workflow, served Build6 revision/assets and actual published site actions. Main unchanged. A changed source/build invalidates earlier acceptance for affected evidence; no claim of delivery from local-only work. |

## Completion rule

A production task is done only when every mapped case passes and required actual review is recorded on the candidate being delivered. Unverified physical-device or family-human evidence is explicitly named, never transformed into a pass. New findings require written task/test amendments before corrections. The whole-game family/agency gate can reject these selected mechanics even when the implementation matches this contract.
