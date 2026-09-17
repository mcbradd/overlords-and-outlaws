# Build 5 experience panel — binding acceptance recommendations

17 September 2026. Scope: tutorial, physical presentation, screen comprehension and visible interaction acceptance. This is an adversarial review using simulated professional perspectives, not a panel of consulted people and not a completed playtest. The user transcript is authoritative over prior preservation rules. Implementation has not begun as part of this review.

## Evidence and disposition

Read `PHYSICAL-GAME-DIRECTION.md`, `PLAY-SESSION-02-REVIEW.md`, `GUIDED-PLAY.md`, the rank candidate, and active History Engine tutorial/app/scene/styles. The current app explicitly teaches three seals, five hand cards after prepared setup, alternate plans, and an action-category toolbar. The intro is center-aligned; essential CSS sizes include 8–13px. These findings substantiate the transcript; they are code observations, not new visual inspections.

`scene.ts` already uses a Three.js PerspectiveCamera, physical meshes and shadows. The user’s perception of a skewed picture is therefore a failure of composition, material, motion and discoverability, not evidence that the renderer has no third dimension. Replacing the renderer is not inherently corrective.

The instructional designer rejects exposing the whole rule vocabulary before its dependencies. The game designer agrees, but rejects a tutorial whose scripted success conceals an ineffective defensive mechanic. The accessibility reviewer rejects shrinking information to meet viewport bounds. The physical-product art director rejects overlaying dense website panels on an ornate photograph. The adversarial tester rejects automated legal-move execution as evidence that someone understood a screen. The synthesis is a small, legally played encounter, followed by genuinely independent play, with separate evidence for correctness, appearance, discoverability and strategy.

## Agreed goals and preimplementation tasks

Each task below has required tests. These are acceptance obligations to incorporate into the production plan before implementation, not claims of passing coverage.

### EX-01 — freeze the minimum core and remove inherited contradictions

Adopt the main rules panel’s final card-to-verb mapping. Eliminate seals and actions granted by a universal toolbar. Cards are the resources and ability sources. A player starts with one leader in play and two cards in hand. The introduction excludes Eudoxia, paintings and shared History events. Do not replace removed seals with a disguised numerical action budget. No requirement to preserve a legacy mechanism overrides the new request.

Tests: enumerate every retained initiating action and response against its granting card/rank; reject commands without the required held card; demonstrate the actual destination of every spent card; prove two-card opening and leader identities through deterministic setup; search active player-facing copy for seals and removed modules, then inspect the rendered opening to confirm their absence. Recovery from no usable cards must be a defined legal core rule, not an invisible tutorial injection. The rule panel must freeze whether pass/replenishment is an automatic turn procedure or a printed ability before dependent implementation.

### EX-02 — teach dependencies through one continuous forced sequence

Use two seats for the first lesson. Curate a legal teaching deal and deck order once. Every change thereafter is a legal reducer action, including rival actions and ordinary replenishment. Retain one navy/gold guide with explanation, exact highlighted interaction, preview and visible outcome. Continue advances only the guide. Exit tutorial returns to a clearly identified destination; it never silently declares the learner ready for free strategy. Inspection of the currently taught object is part of that interaction; unrelated nav, settings, rule archives, selectable courts and camera controls do not become distractions during a forced step.

The exact named card IDs and ranks depend on the finalized rule map; the production plan must bind them and encode this sequence before implementation:

| Step | Prerequisites | Only taught interaction | Explanation/outcome criterion |
|---|---|---|---|
| 0: invitation | None | Take your seat or return | State the complete victory procedure first, followed immediately by “We’ll explain each move at the table.” Use full printed character names. Explain dynasty as family. No unexplained action vocabulary. |
| 1: pieces | Victory sentence | Inspect highlighted leader, then one highlighted hand card | Identify your leader, your private two-card hand, the rival’s visible leader and concealed hand backs. Explain suit as dynasty, rank as the printed number, and ability as what playing this card allows. |
| 2: first development | Hand versus table, card ability | Play prescribed card to its exact legal place | Guide says what playing this person changes and why it advances the crown goal; no teaching of trade, loans or blocking in this paragraph. The source card visibly moves to destination. |
| 3: opponent turn | Turn, public/private | Observe legal opponent action | Reveal only the played card; explain the opponent’s immediate goal and what became public. No unseen state inspection or unsupported prediction. |
| 4: ranked threat | Rank, played card, target | Observe prescribed legal threat | Explain the actual rank/suit comparison and threatened person before asking for a response. Mark source and target. |
| 5: defense | Threat and response eligibility | Play highlighted answer card | Explain why this is the correct answer in this curated position, what it saves, and the card it spends. The legal rival genuinely would achieve the threat without it. |
| 6: refill and round | Hand spending and turns | Take the normal legal refill/round action, if any | Identify draw pile before drawing and destination before movement. Explain ending the round using the actual rule. No seals or hidden replenishment. |
| 7: succession preparation | Development, threats, resources | Play prescribed successor/dependency card | State the remaining concrete claim requirement and highlight the people meeting it. Teach any relationship required by this minimal route immediately before using it. Avoid introducing every dynasty law. |
| 8: crown | Eligibility and successor | Use the actual card/component action authorizing the claim | Explain who holds the Crown now, who will inherit, and when. Show a Crown card or physically reproducible marker on the relevant person. |
| 9: transfer and defense | Crown and next round | Legal succession plus taught answer | Move Crown between named people. Rival makes a real legal threat, not a cosmetic unrelated move. |
| 10: win | Full successor reign | Complete the real required round | Show the actual remaining opponents/round boundary and explain exactly why this is now victory. No count decremented by Continue. |
| 11: independent check | All preceding concepts | Explain learned objective, then choose full game | Ask what the player believes the experience is about and how they win before revealing a model answer. Keep tutorial completion distinct from evidence of independent strategic understanding. |

Tests: for each step enumerate permitted focus/click/touch targets; all other gameplay inputs leave state unchanged. Test click, tap, keyboard and accidental drag. Assert canonical reducer accepts each scripted action, with no direct state mutation after setup. Snapshot game state across Continue and inspection. Validate that every noun/verb first used has been introduced or is defined in that same step; human reviewer must read the actual rendered copy. Check expected outcome against the resolver, not separately authored optimistic text. Save/resume every step without altering hands, phase or guide objective. If a final rule map cannot legally realize this sequence, amend the plan before implementing it.

### EX-03 — show decisions on tangible cards

Hand cards show name, portrait, suit/rank and primary verb legibly without inspection. Their full reference faces remain 63:88. Tapping a card previews its actual choices and legal target; selecting a target gives one clear commitment. Full rules inspection stays read-only. Public courts show the information needed to assess threats; hidden hand backs show exact counts without exposing identities. Never display a global list of impossible actions. A card without a legal target explains the blocker locally rather than disappearing or offering a false choice.

Tests: use every action-granting rank in hand and each legal/illegal target class; selecting and cancelling spend nothing; stale confirmation is rejected without payment or disclosure; visible preview and actual resolution agree; keyboard/touch actions produce identical outcomes. Review two-card A/B positions and confirm a viewer can identify both available abilities without opening menus. Inspect concealed views before/after every transition for visual privacy, including card-animation flashes, tooltips, accessibility names and opponent previews.

### EX-04 — unify information hierarchy and copy

Use one authored title treatment suitable for a physical box. Remove repeated title and redundant card-house annotations when the frame/suit already communicates them clearly. Use full printed names in instructional prose. Left-align multi-line copy. Adopt common typography/corner/focus rules across title, intro, guide, cards, inspector, settings and outcomes. Default essential body/control text to at least 16 CSS px, teaching prose preferably 18px with generous line height; do not shrink text to avoid layout work. Visible card indices/verbs at their actual screen size must meet readable UI targets; an oversized texture’s source font size does not count. Tiny archival print may require inspection but cannot carry essential decisions alone.

Tests: inspect every rendered surface and all long-name variants at normal zoom; check multiline alignment; use 200% browser zoom and larger text settings without lost controls or horizontal page overflow. Focus outline encloses its actual object without striking through labels or counters. Title visible exactly once per composition. Check consistent suit/role vocabulary on all cards, including Queen versus rank Q. Automated typography checks supplement, never replace, human-like visual reading.

### EX-05 — compose real physical depth and inspect all art

Make the board a deliberately authored playing surface with component zones and quiet material detail, not an elaborate table illustration obscured by panels. Align cards, shadows and contact to the same camera. Normal play provides discoverable pan/orbit or bounded viewpoint movement with ease-in/ease-out transitions and a reset; reduced motion jumps directly. Reveal source and destination without obscuring either. Docks occupy reserved screen space and never crop the board’s lower components. Cards need matching rounded silhouettes, continuous portraits behind every intended aperture, unclipped ornament, legible authored fields and consistent names/roles. Regenerate unsuitable frames when warranted; preserve original source assets.

Tests: individually inspect every runtime card face, every frame variant, each portrait crop, backs, Crown, board, title and any retained event art at actual play and enlarged reading sizes. For each asset record accepted/revised/rejected, visible defect, file identity and screenshot evidence; a contact sheet is an index, not proof if details cannot be read. Test opening, selected card, traveling card, resolving response, resting/paired piece, empty/full court and maximum legal density. Confirm camera movement changes parallax/depth and does not desynchronize hit targets; inspect tangent labels and contact shadows. Asset creation should discover Tripo, Adobe and Blender availability and use applicable skills; these are available project options, not proof an asset connection is currently callable.

### EX-06 — preload complete scenes and handle failure

Begin decoding the known next scene while its introduction is visible. Enter the table only when essential portraits, frames, fonts and board art are ready; if necessary retain the themed introduction with a readable preparation state. A failed asset offers visible retry/recovery instead of silently accepting a blank aperture. Cache reuse must not leak the previous private hand.

Tests: cold cache and throttled connection, failed image/font request, return-to-title and re-entry, rapid double-click, saved-game entry, and context restoration. Inspect actual transition captures/video from click through playable scene for white flashes, fallback-font jumps, missing portraits and duplicated layers. Verify interaction becomes available only with the correctly rendered state. Measure and report actual wait without inventing a performance guarantee.

### EX-07 — validate all screens and state families visibly

Create a screen/state inventory from reachable UI routes and reducer phases. Every entry names a reproducible fixture or action path, input method, screenshots inspected and defects. Minimum inventory: title; intro; preparation; setup and name entry; handoff/private curtain; every tutorial step before selection, selected, preview and resolved; normal turn; every action and response; invalid/stale selection; cancellation; empty hand/deck; new round; two/three/four-seat courts; maximum legal density; relationship gained/broken; claim incomplete/eligible/announced/transferred/contested/broken/won; each other reachable ending; inspection of every component class; rules/help outside tutorial; history/log if retained; preferences; import/export/recovery; unsupported-renderer fallback; resume and corrupt/incompatible save. States absent from the simplified build are marked removed with the implementing revision, not silently omitted.

Visual matrix (CSS viewport sizes; pragmatic coverage set, not a claim about measured 2026 market shares): PC 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440, 3840×2160; phones 360×800, 375×667, 390×844, 393×852, 412×915, 430×932 and each corresponding landscape orientation; tablets 768×1024 and 1024×1366, portrait and landscape. Run the complete reachable state-family matrix at each size. Inspect all assets at readable proof sizes as well as every in-context state where those assets change presentation. Cover a minimum of Chromium and Firefox desktop plus Safari/iOS and Chrome/Android on actual devices or explicitly recorded equivalent interactive sessions. Browser emulation alone is not proof of OS keyboard/notch behavior.

Tests per matrix cell: visually read objective, active player, available hand abilities, public threats and guide; verify no required target is obscured, cut off or outside reachable visible area; activate every available control by the applicable input method. Mobile safe-area tests cover top notch/Dynamic Island, left/right landscape cutout, bottom home indicator, browser chrome expanded/collapsed and rotation. Focus every text-entry surface with on-screen keyboard visible: typed text, caret, validation message and submit/cancel remain comfortably visible in the actual visual viewport. Check scrolling does not reveal private information or trap focus. Do not count DOM bounds, OCR, pixel-diff or viewport variables as the required visual inspection; record them only as supplementary regression alarms. Any unavailable device/browser remains an explicit unpassed gate.

### EX-08 — separate blind observation from knowledgeable verification

Use a fresh playtesting agent with no transcript, rules documents, source, test fixtures or prior tutorial knowledge. Give only the deployed URL and an instruction to learn/play using what it can see. The observer may record actions and explanations but cannot teach. Ask after the tutorial, without corrective hints: “What do you think the point of this experience is? How do you win? What can your cards do? What can your opponent do that you cannot see yet?” Record verbatim answers and visible evidence. Then observe ten full normal games through rendered controls, never a reducer/AI self-play substitute. A later knowingly informed regression run does not satisfy a fresh blind run.

Tests/evidence per game: build and revision; seed if legitimately exposed; players/dynasties; start/end and winner; complete action trace with decisive screenshots; every stalled moment and attempted remedy; number of rules lookups; options perceived before commitment; expectations versus outcomes; opportunity to retain/spend low and high cards; instances of dominant moves/false alternatives and whether an opponent could punish them; postgame explanation of a foregone line. Deliberately compare the same kind of card choice under different public threats across the sample. Ten observed games are a small qualitative sample, not a statistical proof of balance. Record interventions; an assisted or abandoned game is not counted as an unassisted completed one and must be reported separately.

The panel rejects a numerical meaningful-choice quota that would reward cosmetic alternatives. Revise any repeated situation where one move is always superior across relevant information, where uncertainty is arbitrary rather than inferable, where a held response cannot affect victory, or where players cannot name an alternative and its cost. Unexpected preference is evidence for critique, not automatic proof that a legal line is bad.

### EX-09 — close the publication/testing loop honestly

Before publishing follow `RELEASE.md`; publish only Prod under standing authorization and verify deployed build identity plus the actual public URL. Repeat the same browser paths against the deployed candidate, not only localhost. Bind feedback to exact revision and screen/state. Each new iteration must update goals, complete tasks and testing criteria before new implementation, then execute the checks relevant to those changes plus the complete release gates.

Tests: candidate revision equals displayed Build 5 and deployment metadata; tutorial/new game/resume load without missing paths on the GitHub Pages base path; all required screenshots and ten-game records identify that candidate; no gate is marked passed without executed evidence; no Main promotion occurs without the user’s separate explicit instruction. Visual or playtest failures reopen tasks even if unit tests are green.

## Non-negotiable distinctions

A design proposal is not implementation. A passing unit test is not a readable card. A screenshot generated but not opened is not visually inspected. A source-aware agent is not a blind player. Ten engine simulations are not ten observed UI games. A deployment that serves an older commit is not delivery of the candidate. These distinctions prevent repeating the gap between earlier verification counts and the user’s actual experience.

## Cross-review of systems candidate and production plan

Reviewed the written `BUILD-5-SYSTEMS-PANEL.md` and `BUILD-5-PRODUCTION-PLAN.md` before implementation. The simple core remains a candidate; rank-band tactics require their own finalized instructions/tests. The following findings must be adjudicated in P03/P04. They are reasoning from the proposed rules, not observed play outcomes.

### CR-01 — opening hand cannot fund the proposed development-then-defense lesson

The systems candidate specifies one useful native and one useful foreign card. If the learner recruits the native card, its remaining foreign card cannot Defend a Recall of its native supporter or ruler. EX-02’s immediate defense lesson would therefore require an illegal refill or a changed order. Resolve by placing an ordinary all-pass boundary and normal refill between development and the first native-target threat, with exact fixed deck identity and rank recorded in the curriculum; alternatively change the initial teaching deal to two native cards and explicitly teach the foreign card later. Do not silently give the learner another card or let the wrong suit answer.

Required tests: freeze named IDs for initial hand, rival hands, next draws, Recall and answer; execute the entire script through the ordinary reducer; assert each comparison and payment; confirm the hand stays exactly two at opening; verify any replenishment follows the same count and deck procedure as normal core. The UI must explain the refill before expecting a newly drawn answer to be understood.

### CR-02 — returned commitments are not discarded resources

The systems candidate returns paid cards from Spent at the boundary and returns recalled targets to their new owner. The teaching term “spend” alone implies a different permanence and obscures the central timing decision. Show a physical commitment place with “Returns next round” and named owner; use one consistent verb for the card movement in its instruction, preview, outcome and guide. Distinguish a recruited permanent Court card from a temporarily committed action card and a captured card that changes owner.

Required tests: inspect all three movement types and their return; the player can predict whose hand receives each card without consulting logs; no target duplicates or changes printed suit. Explicitly explain why retaining a card now may matter before the boundary despite its later return. Decide whether current owner or original dynasty receives a captured card; do not use an ambiguous generic “returns.”

### CR-03 — foreign utility is contingent, not universal

A foreign card has a useful Recall against a rival Court of that suit. It also answers attacks only against a controlled person of that printed suit. With no marriage in core, all controlled Courts begin native and captured foreign cards remain outside recruitable Court. Consequently foreign Defend generally has no target, and a card from an unseated dynasty may have no use at all in a two-seat game if the common deck still contains all four suits. The production requirement that every card has “a ... response opportunity” is stronger than this candidate actually supports.

Resolve before coding: specify selected-suit deck construction and every ownership path. Either exclude unseated suits from the core deck or define an intelligible meaningful use for them. For every included foreign card, identify an actual reachable target and the board circumstance in which committing it helps win. Do not satisfy the gate merely by exposing a disabled Recall verb. If an all-native or all-foreign hand is intentionally poor, provide the exact recovery rule and expected cost, not forced favorable dealing disguised as random setup.

Required tests: two, three and four seats; each suit seated/unseated; all-foreign hand; opponent temporarily rulerless/empty Court; exhausted deck; captured native held by rival; opening deck membership and 13-per-included-suit conservation. Render empty-target cards with a truthful local reason and show the player the legal path to a useful future turn. Test whether an otherwise idle card can lock a two-card hand because below-two refill never occurs.

### CR-04 — target rank does not defend it; show the correct comparison

The simple candidate compares Recall lead to a concealed answering card, never to the public target’s rank. A player seeing “Recall 4” aimed at a public King can reasonably predict that 4 fails unless the guide and card text explicitly establish the two different roles. Avoid a source-target line whose displayed numbers falsely suggest those are the compared cards. The reply window should show the lead and answer side-by-side and keep the threatened person visually identified separately. A native King’s exposed Court rank is chiefly the strength no longer available in its owner’s hidden hand; that opportunity cost must not masquerade as armor.

Required tests: Recall low against high target, high against low target, same lead against different target ranks; show identical response eligibility when target rank alone changes. Fresh player must explain what ranks are compared after the lesson. If rank-band actions are added, print the verb beside rank and explain why the target’s rank is or is not relevant separately for each action.

### CR-05 — once-per-round targeting hides another resource

“Target already attempted this round” is a rule-relevant public state requiring a tangible marker. Its availability cannot live only in reducer flags or an absent target highlight. A weak Recall that is successfully Defended then protects that person from any stronger Recall during the same round under the candidate. In multiplayer, this can become intentional allied immunity. This is a substantial sub-game, not merely spam prevention.

Required tests: defended/undefended first attempt, invalid attempt, captured then reacquired target, round reset, saved state and three-seat sacrificial weak lead shielding a third player’s heir. Show the marker immediately, teach its meaning before a legal first Recall, and inspect it at every resolution. If explaining this exception breaks the minimum lesson’s simplicity or creates dominant protection, remove/revise it before implementation; do not hide it from the learner.

### CR-06 — Crown UI needs named dependencies and exact tenure

The systems wording requires ruler, heir and Witness before transfer, then describes former ruler as support while retaining named Witness after transfer. Freeze whether removal of the former ruler after transfer fails the claim. The guide cannot say merely “protect your family” if only particular people count. Use a small physical Crown reference showing current ruler, next ruler before transfer, required Witness, and the exact next victory boundary. Teach Witness as the supporting person before asking the player to select one; do not introduce the role only after it becomes a hidden loss condition.

Required tests: remove each of the three named people both before and after transfer; remove unrelated Court person; restore former dependency; Crown claimed in last round of cap; skip/double boundary prevented; pending defense delays closure. Visual reviewer must identify the Crown’s vulnerable people and remaining round from the table alone in each case.

### CR-07 — rank-band additions must earn their instructional cost

The candidate could devolve into recruiting the lowest native, claiming as soon as eligible and retaining the highest defense. This is a testable risk. Adding band-specific Draw/Trade/Withdraw just to display more verbs risks reintroducing the user’s rejected cognitive overload. A candidate tactic earns inclusion only with a concrete pair of reachable positions where using it versus the shared action changes which line is preferable, a distinct suit/rank consequence, bounded timing and a readable one-sentence card instruction. Defer optional tactics from the first forced lesson even if normal core ultimately needs them.

Required tests: document the two positions per added ability before implementation; compare always-recruit and mixed policies; independently observe the player selecting an ability for a visible reason and naming its cost. Repeated always-optimal recruit/claim is a failed agency gate, not a justification to lower the gate or call a capped race strategic. Tutorial scripting cannot be the only place a response matters.

### CR-08 — production plan still needs a concrete frozen curriculum and finalized matrix

I07 currently promises a dependency graph/fixed sequence but does not include the actual sequence, card IDs, ranks, expected responses and boundary draw order. P04 should require this written artifact before implementation, rather than creating it while coding. I13’s “every finite UI state” should mean every enumerated reachable state family, not every possible combinatorial game position. Each ability needs its individual selected/target/preview/response/error/outcome entries, not a generic screenshot labeled “action.”

The plan uses only 844×390 landscape phone and 768×1024/1024×768 tablets, narrower than EX-07. Decide and record the authoritative matrix before implementation: at minimum include the short 667×375 phone landscape, modern notched landscape insets on both sides, and larger tablet 1024×1366/1366×1024. Keep common-size claims appropriately qualified. I11’s simulated keyboard is a useful automated check; V02 must separately retain actual browser/device keyboard validation or mark that gate unpassed, exactly as EX-07 specifies.

Required tests: curriculum artifact and selected matrix committed at planning freeze; future amendments precede dependent implementation; each matrix row has actual opened screenshot plus exercised controls; failures are recorded even if screenshot geometry checks pass. Final status distinguishes core delivered, advanced History deferred, and any unavailable real-device validation.
