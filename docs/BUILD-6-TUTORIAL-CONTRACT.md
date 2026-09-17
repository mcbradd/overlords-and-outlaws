# Build 6 tutorial contract — legal prepared table

17 September 2026. Frozen preimplementation contract. Governing rules: [SUIT-AND-RANK-DESIGN.md](SUIT-AND-RANK-DESIGN.md). Family language and the single-guide rule apply. This lesson replaces the Build 5 succession tutorial when implementation resumes; no new lesson is implemented yet.

## Purpose and teaching boundary

Teach the player to Add a person, accept a useful transfer, build a mixed-suit rank run, and keep an answer hidden through one rival turn. Start with one exposed person and two hand cards. The prepared opponent is a declared legal teaching script, not the ordinary policy and not evidence of strategic balance.

At entry show **Prepared learning table**. Goal sentence: **Keep three ranks in a row until your next turn.** A visible A–2–3 example teaches the rank goal. The printed ring shows all ranks and the K/A join; the lesson need not add a second scripted game solely to exercise wraparound.

Use one navy/gold guide containing the current explanation, relevant physical comparison and exact permitted next interaction. All text uses full printed names when identifying a person. Card indices carry rank/suit. Do not replace names with unexplained shortened names. Only taught interactions and Exit tutorial are enabled; ordinary settings, history, menu and free camera controls remain unavailable. Read-only card detail is not a mandatory side quest.

This is a guided legal example. Do not call the forced choice an independent strategy test. The first unanswered Swap is a useful transfer the player cannot stop with their present cards, not a bad decision or failure.

## Dependency order and visible vocabulary

| Before relying on | Teach through this visible fact |
|---|---|
| Court | The exposed Kenneth MacAlpin card sits in the player's public Court. |
| OUTLAW hand | Exactly two held cards are visible to their owner; opponent hand shows concealed count. |
| Add | Malcolm III moves from hand to Court; the other card remains hidden leverage. |
| Suit | David I and Malcolm III share the Alba symbol; target and offered cards are shown together. |
| Swap | The two named people change owners through face-up Resting areas. |
| Answer | Offer rank 3 has neighbor ranks 2 and 4; the player holds neither matching-suit answer. Exposed Malcolm III cannot answer from Court. |
| Resting / return | The transferred David I first touches the player's Resting area, then enters hand at that player's next turn. |
| Refill | After returns, a hand below two receives a card from the visible supply; no first-turn extra card. |
| Mixed suits | Richard I's Plantagenet 2 joins Alba A and 3; the rank run is the goal. |
| Crown / response window | Crown appears on ranks A/2/3; rival gets one turn before the player's win check. |
| Neighbor answer | William the Lion's Alba 4 neighbors offered Alexander II's Alba 5; display 4–5–6 beside the offer. |
| Win | The Crown survives; win check occurs before any return/refill or required card play. |

These are teaching dependencies, not permission to turn each row into another modal or paragraph. The actual physical example and at most one short instruction carry each decision.

## Immutable fixture

Use the existing identity mapping; do not confuse collector suffix with rank.

| Symbol in state table | Identity | Printed rank/suit | Full printed name |
|---|---|---|---|
| AA | alba-0 | A / Alba | Kenneth MacAlpin |
| A2 | alba-2 | 2 / Alba | Malcolm III |
| A3 | alba-3 | 3 / Alba | David I |
| A4 | alba-4 | 4 / Alba | William the Lion |
| A5 | alba-5 | 5 / Alba | Alexander II |
| PA | plantagenet-0 | A / Plantagenet | Henry II |
| P2 | plantagenet-2 | 2 / Plantagenet | Richard I |
| P4 | plantagenet-4 | 4 / Plantagenet | Henry III |

Human seat first, starting Dynasty Alba. Rival Plantagenet second. Exposed AA and PA. Human hand A2/P4; rival hand A3/P2. Supply starts A4, A5, then every other selected Alba/Plantagenet card exactly once in the existing rank order, excluding all eight named fixture identities. Initial supply count20; after the two specified draws18. No Tudor/Habsburg cards are included.

Reserve draws are disclosed as part of a prepared lesson; do not represent them as a lucky random ordinary deal. Existing source portraits and full names remain immutable.

## Exact ordinary action sequence and conservation

Arrays below are stable states after the ordinary reducer has completed the action, pending response if any, and the next legal turn-start procedure. H = human, R = rival. Supply tail is unchanged except the two stated draws.

| Step | Ordinary action | H Court; hand; Resting | R Court; hand; Resting | Supply / active |
|---|---|---|---|---|
| 0 | Legal prepared setup / H start | AA; A2,P4; empty | PA; A3,P2; empty |20 / H |
| 1 | H Add A2 | AA,A2; P4; empty | PA; A3,P2; empty |20 / R |
| 2 | R commits Swap A3 targeting A2 | AA,A2; P4; empty | PA; P2; committed A3 |20 / pending H response |
| 3 | H accepts A3, allowing Swap | AA; P4,A3; empty | PA; P2; A2 |20 / H; A3 returned at H start |
| 4 | H Add A3 | AA,A3; P4; empty | PA; P2,A2; empty |20 / R; A2 returned |
| 5 | R Add P2 | AA,A3; P4,A4; empty | PA,P2; A2; empty |19 / H; drawn A4 |
| 6 | H commits Swap P4 targeting P2 | AA,A3; A4; committed P4 | PA,P2; A2; empty |19 / pending R response |
| 7 | R accepts P4, allowing Swap | AA,A3; A4; P2 | PA; A2,P4; empty |19 / R; P4 returned |
| 8 | R Add P4 | AA,A3; A4,P2; empty | PA,P4; A2; empty |19 / H; P2 returned, no draw |
| 9 | H Add P2, creating Crown A/2/3 | AA,A3,P2; A4; empty | PA,P4; A2,A5; empty |18 / R; drawn A5 |
|10 | R commits Swap A5 targeting A3 | AA,A3,P2; A4; empty | PA,P4; A2; committed A5 |18 / pending H response |
|11 | H Answer A4 | AA,A3,P2; empty; A4 | PA,P4; A2; A5 |18 / H wins before returns |

“Committed” is a public pending-offer location, not an additional copy. Its precise reducer representation may be pending custody or an attacker Resting entry, but conservation must count it exactly once. The response resolves ownership according to ordinary rules. No fake card relocation may be introduced to obtain the picture.

First response: legal neighbors to Alba3 are Alba2/Alba4. Human's only hand card is Plantagenet4, so no Answer is legal. Accepting acquires useful Alba3 for the next turn. Second response: neighbors to Plantagenet4 are Plantagenet3/Plantagenet5; rival holds only Alba2, so cannot answer. Final response: Alba4 legally answers Alba5; no suit mismatch or higher-rank rule.

Final conservation: H Court3 + R Court2 + H hand0 + R hand1 + H Resting1 + R Resting1 + supply18 =26. A4 must remain visibly Resting at terminal because the win check precedes returns. Crown remains on the human Court; no new hand cards are drawn after winning.

## Exact 23-state screen inventory

These are required capture/test IDs, not twenty-three forced clicks. Several are automatic action outcomes or phase changes. Selection is local UI state; actions commit only through the named ordinary command. Parenthesized response steps reference the sequence above.

| ID | Screen / permitted interaction | Single-guide instruction and visible evidence |
|---|---|---|
| B6-T00 | Introduction; Take your seat / Exit | “Keep three ranks in a row until your next turn.” Show prepared table label and A–2–3 example. Taking seat creates the declared setup. |
| B6-T01 | H first choice; highlight A2 only | “Add Malcolm III to your Court.” Show AA, two hand cards and rival concealed count2. |
| B6-T02 | A2 selected; Add commitment | Same instruction; selected full card and clear hand-to-Court destination. No redundant generic preview step. |
| B6-T03 | Add outcome (1); Continue cursor only | “Henry III stays in your hand.” A2 is now public, P4 retained; both actual Courts in frame. |
| B6-T04 | Rival Swap example; Watch this swap | “David I can take Malcolm III: both are Alba.” Show actual A3/A2 pair before movement; Watch commits step2. |
| B6-T05 | Pending H response; Accept David I | “Take David I for your next turn.” Show exchange arrows, Resting destination and answer neighbors Alba2/4; P4 visibly cannot answer. Accept commits step3. |
| B6-T06 | Accepted transfer and H choice | “David I returns to your hand.” Show stable H hand P4/A3 and the actual preceding Resting-to-hand movement; highlight A3. |
| B6-T07 | A3 selected; Add commitment | “Add David I beside Kenneth MacAlpin.” Show gap at rank2; commit step4. |
| B6-T08 | Add outcome; Continue cursor only | “A and 3 need a 2 between them.” Ring/run space explains the gap without another card rule. |
| B6-T09 | Rival Add; Watch this card | “Richard I joins the rival's Court.” Commit step5; show P2 destination, then H supply draw A4. |
| B6-T10 | H choice; highlight P4 | “Use Henry III to take Richard I.” Show P4 and P2 share suit; keep A4 visibly held. |
| B6-T11 | P4 selected; highlight P2 target | Same instruction; target P2 and offered P4 displayed together. PA is not selectable in this teaching fixture. |
| B6-T12 | Exact pair selected; Swap commitment | “Swap Henry III for Richard I.” Commit step6; no unrelated target or action enabled. |
| B6-T13 | Rival accepts, then rival Add Watch | “Henry III joins the rival's Court.” Ordinary scripted acceptance resolves step7; visible P4 Resting-to-hand precedes the Watch commitment of step8. P2 rests with H until H start. |
| B6-T14 | H returned P2 choice | “Richard I fills the gap at rank 2.” Show returned P2, held A4, and A/2/3 across two suits; no refill occurs. |
| B6-T15 | P2 selected; Add commitment | Same instruction; preview actual three ranks and retained A4; commit step9. |
| B6-T16 | Crown outcome; Continue cursor only | “Keep this run until your next turn.” Crown marks Court; rival turn marker and response window visible. |
| B6-T17 | Rival threat; Watch this swap | “Alexander II targets David I.” Show actual A5 from the rival's refill and offered/targeted pair; commit step10. |
| B6-T18 | H response choice; highlight A4 | “William the Lion's 4 neighbors the offered 5.” Show Alba4–5–6, with A5 as lead and A3 separately as target. |
| B6-T19 | A4 selected; Answer commitment | “Play William the Lion to keep David I.” Show both played cards resting with their existing owners; commit step11. |
| B6-T20 | Immediate ordinary win; Finish lesson | “Your run survived to your next turn.” A4/A5 remain Resting; no active-action cue, forced Add, return or draw. |
| B6-T21 | Reflection; ordinary game / title | “How do you win, and why keep a card hidden?” Record learner response before any model answer; do not imply guided choices were independent strategy. |
| B6-T22 | Ordinary setup handoff | Clearly leave prepared mode; ordinary rules, selectable seats, random/dealt supply. No hidden tutorial guarantees carry forward. |

There are six human game commitments: Add A2, accept A3, Add A3, Swap P4 for P2, Add P2, Answer A4. Four rival initiating commands are Watch examples: Swap A3, Add P2, Add P4, Swap A5. The rival's one forced unanswerable acceptance is an ordinary legal response, not an extra human task. Continue at T03/T08/T16 changes only guide cursor; it cannot create a card, advance a turn, draw or mutate Crown.

The single guide should not stack the entire sample copy at once. It shows only the current row's instruction and the relevant physical cards. The chronological state inventory is an engineering document, not a player-facing script.

## Camera, transitions and access

Watch must show origin, committed lead and target, then the true destination. A compact screen may frame the relevant two/three cards rather than the entire table; after the move it must reveal the resulting person. Do not keep the camera on the human Court while claiming to show a rival Add. Turn marker and opponent concealed count remain legible outside incidental artwork.

Start-of-turn returns/refills may occur in the same ordinary reducer transaction as a resolved action. Capture stable states as listed; animate/log the legal intermediate transfer through Resting before returning. Do not hold a fake engine state awaiting Continue. Reduced motion presents the same named source/destination facts and final stable state without requiring motion perception.

Touch/keyboard select the same taught card, target and commit control. Highlight the exact target with matching rounded physical outline; no outline crosses name/rank. All control text and full 44px targets fit the usable viewport, including safe areas. Modal/reflection text may use ordinary deliberate scroll; the active guide's required choice must not be clipped. No keyboard opens during the lesson; ordinary setup keyboard behavior belongs to the production matrix.

## Required tests before completion

- **B6-TUT01 Fixture:** exact identities,26-card conservation, initial supply20, two starting hand cards, no undeclared prebuilt run.
- **B6-TUT02 Full legal replay:** all11 ordinary commands/responses pass the ordinary reducer; state table matches after each stable transition. No tutorial-only rule branch.
- **B6-TUT03 Return/refill ordering:** acquired A3 returns without draw; R A2 returns without draw; only A4 thenA5 are drawn; acquired P2 returns without draw; final win prevents A4 return/refill.
- **B6-TUT04 Suit/answer boundaries:** H cannot answer Alba3 using Plantagenet4; exposed Alba2 cannot answer; rival Alba2 cannot answer Plantagenet4; Alba4 answers Alba5; lower rank is legal because adjacency, not strength.
- **B6-TUT05 Mixed goal:** AA/P2/A3 creates a Crown across suits; rival PA/P4 does not. Final answer preserves that Crown and wins only at next H start.
- **B6-TUT06 Six commitments:** exactly the six named H commands change game state; four declared Watch moves and one legal rival acceptance complete the script. Cursor Continue/selection/cancel cannot advance or mutate.
- **B6-TUT07 Cursor integrity:** reload/cancel/Exit/reentry at all23 IDs cannot duplicate commands, skip mandatory actions, reveal rival hidden cards or manufacture a win. Malformed saved cursor rejected/recovered visibly.
- **B6-TUT08 Forced acceptance framing:** T05 exposes the useful received A3, both locations and unavailable-answer reason by actual cards. No “wrong choice,” failure punishment or fictional response option.
- **B6-TUT09 Full names:** every guide/card identity matches the source names above; rank IDs and collector suffixes not interchanged.
- **B6-TUT10 Actual visual inventory:** capture and individually inspect all23 required states at the frozen desktop/phone/tablet/landscape matrix; missing capture remains missing, not presumed passed. Inspect ordinary text at legible/native scale.
- **B6-TUT11 Sources and motion:** actual initial Add, both accepted exchanges, two returns, two draws, rival Adds and final Answer show origins/destinations on desktop/mobile and reduced motion. Screenshots alone do not certify animation.
- **B6-TUT12 Interaction limits:** keyboard/touch can perform the exact next action and Exit; unrelated menu/pan/free targets disabled. Focus follows the new stable guide without hiding required content.
- **B6-TUT13 Terminal:** Crown result and Finish visible; no To act, future-turn instructions, Pass, refill animation or actionable remaining card after win.
- **B6-TUT14 Comprehension:** fresh screen-only learner explains goal, offered versus target rank, neighbor answer and transferred ownership without coaching or opening a paragraph. Wrong explanations fail the teaching gate even if the script completed.
- **B6-TUT15 Practice separation:** next ordinary game uses ordinary setup/seed, policy and first-seat choice; prepared supply/script not retained. Ten complete ordinary games and family-human validation remain separate from this deterministic lesson replay.

## Rules cross-review

No contradictory rules gap was found in the proposed fixture. Two representation hazards require care: a pending committed card must be counted once, and stable post-response state may already include the next player's returns. The tutorial must show that legal motion without demanding an artificial pause in rules progression. These are integration obligations, not rule amendments.
