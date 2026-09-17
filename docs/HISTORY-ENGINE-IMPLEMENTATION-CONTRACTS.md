# History engine — delivery contracts and worked procedures

**Next-design overlay, 17 September 2026:** the [R4 suit-and-rank appendix](SUIT-AND-RANK-DESIGN.md) supersedes this baseline's sealed Trade protocol, unranked contributions and Crown/Cover durations for the next implementation. Its migration section also requires explicit rank data, public binding offers, verified patron draws, projected Tudor deadlines and retained rank proof. These changes are not yet implemented; the worked R3 traces below remain historical baseline tests.

Normative companion to [the implementation spec](HISTORY-ENGINE-IMPLEMENTATION-SPEC.md), 16 September 2026. Main-spec gameplay is authoritative; this file closes delivery, privacy, evidence and presentation details. Budgets come from the main spec's single Quality targets list. These are required future checks, not claims they have run.

## One phase machine

| Phase | Next operation | Suspension/resumption contract |
|---|---|---|
| Setup | Verify manifests → eight-card deal → simultaneous 3/2/1 passes → simultaneous declarations → bounded repair → ruler placement | Persist packets locked by seat; reveal none until authorized setup step. No Card Text triggers during setup. |
| Start 1 | Open initial round 1 without increment/rotation, or advance round and first seat after End 3; unveil all due fragments first, then return ordinary commitments and clear petitioned register/markers | Check Eudoxia after each due unveiling, before any other start effect. Return events disclose only formerly public cards to the appropriate owner's hand. No hand cap. |
| Start 2 | Refresh seals and ready Overlords; apply expressly start-expiring effects | No repeated refresh after reload; write phase substep and completed event ID. |
| Start 3 | Scheduled Crown succession, then recurring Interregna oldest first | Succession is one atomic retirement/link-cleanup/heir-installation operation. A pending compulsory choice suspends the phase; resume after its exact event, not at phase start. |
| Start 4 | N public History reveals sequentially | Initialize each pending card's frozen obligations; immediately check Avert/painting completion before next draw. Additional History from a recurring effect already resolved in Start 3 uses the same procedure. |
| Start 5 | One Noble draw per seat whose hand has fewer than five | First-seat clockwise. Empty deck supplies none. It never refills or reshuffles. |
| Opportunity | Legal action or Pass | Selecting/inspecting/previewing is state-neutral. Barter has its own persisted subphases before final atomic acceptance/payment. |
| Response | Listed target controller responds once or declines | No nested response. Exact pending action/cost/knowledge survives reload. |
| Action resolution | Execute effects → batch relation/office cleanup → Crown maintenance → Avert conditions → outcome | A target lost after commitment does not permit retargeting or cost refund. An impossible independent instruction does not cancel another one. |
| End 1 | Consecutive all-pass: activate unmet pending cards in reveal order | Recheck each immediately before activation. No remaining action can be inserted. |
| End 2 | Round-end effects and expiries | Ongoing restrictions last through their stated final effect, then expire. Veils do not expire at round end. |
| End 3 | Crown settlement if its required full reign duration elapsed | Existing forfeiture is final. No new hostile window or seal refresh. A success ends play; otherwise proceed to Start 1. |
| Terminal | Freeze rules; show public reason, offer private audit/reveal | Stop draws and pending animations from mutating state. Reveal sealed obligations for verification without executing cancelled effects. |

`roundId` begins at one; the initial randomly selected first seat takes the first ordinary opportunity after round-one History. A card Activated during round R with “expires at end of next round” has absolute `expiresAt=R+1`. A Veil initiated during round R has `unveilAtStart=R+2`, regardless of when its initiator next acts. A normal Crown Proclaimed in R conducts succession at start R+1 and first can settle at end R+1. A Regency conducts succession at start R+1 and first can settle at end R+2. Forfeiture never shifts the schedule or preserves progress.

For automated checking, a completed action means one valid cost commitment, all response/choice continuations resolved once, and one final invariant check. Internal forced choices are not additional ordinary actions. Card-specific instruction templates reference this timing table through stable dictionary IDs; UI headings cannot redefine them.

### Successful Crown trace

Three seats use Alba/Plantagenet/Tudor modules. A legally reached state has seat A declaring Alba, Kenneth as Ruler, David and Robert the Bruce as native Overlords and the two named branch candidates. Seat A has the required three natives and one seal available. Round 2: A Proclaims under Recognition. Seat B Presses David using a committed Alba Outlaw. A declines Counterclaim; David goes to B's hand. Kenneth and Robert remain, so Alba maintenance is true. Remaining opportunities finish and three consecutive Passes end round 2. Pending Interregna activate; assume none removes Kenneth/Robert or prevents succession. No victory yet.

Start round 3: unveil any fragments due from round 1 and check Eudoxia, return public commitments, clear petitioned register/markers, refresh seals/ready. A selects Robert; Kenneth Retires to The Past, Robert receives the ruler marker, and his native support remains valid. The unused David is not a required dependency. History publicly reveals three cards, with their actual effects and conditions; assume no painting completes. Each seat receives ordinary opportunities with refreshed seals. A may defend Robert, address History or Veil at the cost of scarce actions/cards. At end round 3, resolve pending events and round-end effects/expiries first. A Veil begun in round 2 remains through this boundary and unveils at start round 4. If Robert remains the supported successor and no painting completes, A wins. Only two of the original three native cards need have remained before transfer; the entry threshold is not a life total.

### Failed succession/claim trace

Seat A declares Habsburg with Rudolf as Ruler, Maria Theresa as native marriage sponsor, another native Overlord, and Eleanor of Aquitaine married to Maria Theresa. A Proclaims, naming Eleanor heir and Maria Theresa her support. Before the next start, B seizes Maria Theresa using a Habsburg Outlaw, and A cannot Counterclaim. Both marriage halves leave; Eleanor remains in A's Court unsupported. The Habsburg maintenance predicate fails and the Crown returns to the center immediately. Rudolf does **not** Retire, because no scheduled succession occurred. Returning Maria Theresa later enables a new marriage/proclamation but does not restore this attempt. A may pursue the slower Regency with two native people instead; no Queen is required for that route.

Separate test: if a scheduled departure itself removes an heir's only support, the precheck/atomic postcheck fails according to the main spec and the departed Ruler remains in The Past. The ordinary interim-Ruler cleanup then selects an eligible native if needed; it does not undo history. A War of the Succession already active at the scheduled start prevents the operation before departure and forfeits the Crown without retiring its ruler.

## Privacy and local platform scope

Initial delivery is browser-local AI and two-to-four-seat hot-seat play. No matchmaking, remote multiplayer, authoritative server, cloud account, cloud analytics or tournament anti-cheat is included. Local device owners can inspect saves/devtools; the product protects ordinary shared-device play, not adversarial access to the host computer.

Initial network access is required to load the build. Once the complete core runtime and required rule manifest are loaded, rules do not require network access. Missing optional art falls back to a known labeled card silhouette; offline reload/cold launch is **not promised** in this iteration. Do not quietly add a service worker affecting Live/prod shared origin; a future installable offline package requires explicit scope/version/cache tests. A load/version mismatch holds at the title screen with recovery/export controls, never blends a new manifest with an old active match.

Before handoff, clear private DOM content, canvases, tooltips, previews, cached hand images, form values, live-region announcements and focus targets from the rendered view. Show a full curtain with the named next seat; the seat explicitly opens its view. On blur/background/reload, return to curtain; resuming a private choice requires its authorized viewer, not merely the current active player. Never flash a previous hand during texture loading. Screen-reader history and OS/browser-level screenshots cannot be erased reliably; explain the ordinary local privacy boundary in setup without claiming hardware security.

Barter privacy has two layers: engine-owned locked packet/consent stages and viewer-owned curtain stages. A nonparticipant sees only parties, counts and whether negotiation is open/completed/declined. Public announcements never speak offered identities. Each party sees the other's packet only after both authorized inspection; a final private accept/decline is revealed only when both lock. After decline, both remember what was actually inspected; no public export receives that memory. Reload at every stage must preserve the same knowledge and not allow packet substitution. A player without an available seal cannot initiate an offer that they cannot complete.

Public replay/diagnostic export contains redacted events, no private current card IDs, hidden deck order, RNG seed capable of reconstructing the order, Tudor heir identity or per-seat observation ledger. A full save export is labeled **Private full game save**. Its disclosure requires the user's explicit export action; it is not uploaded automatically. Player-facing errors describe illegal targets/phase without confirming an opponent's secret card. State revision checks reject stale commits without partial payment.

## Presentation and recovery contracts

### Immutable meaning of visible signs

- Dynasty affiliation: original card frame/crest plus printed text, never recolored when seized.
- Controller: Court/Leverage mat location and seat shape/emblem, not Dynasty color. Outside-mat previews carry the seat emblem.
- Native/foreign: relative relationship stated in inspection with the viewer/controller named; no second fabricated printed affiliation.
- Marriage: numbered matching halves; Crown/Ruler/heir are distinct tokens, not arbitrary glow colors.
- Pending/active/expiry: actual History card and its register, with reveal order and absolute round. An Interregnum does **not** generically empty the throne.
- Available action: reversible seal face plus text/shape, never color alone. Rotation means the documented readiness state, never concealment.

### Quality tiers

| Tier | Visual implementation | Gameplay/access invariant |
|---|---|---|
| High | Standard material kit plus higher LOD/reflections and optional scene ornament within profiled hardware limits | Same card text, locations, targets, states and timing |
| Standard | Main-spec budgets; baked/limited real-time shadows, instanced props, 1K–2K maps | Primary acceptance target; all features and four paintings visible/inspectable |
| Compact | Lower LOD, ≤80k visible triangles as an additional compact target, simpler lighting, court cameras and pans | No missing state, inflated legal capacity restriction or changed targeting; large controls |
| Semantic/no-WebGL | Accessible DOM physical-table zones with labeled card objects, orientation and relationship markers; no 3D ornament | Full play and inspection, same rules and private-hand curtain. Explicit accessibility/failure fallback; the main presentation remains 3D. |

WebGL initialization failure/context loss switches to the semantic table while retaining canonical state and pending choices. Restoring graphics reconstructs from the current view without replaying actions. Missing textures/models show labeled proxies; loading never advances an opponent or chooses for the user. Test resize, orientation change, context loss and asset failure during draft, handoff, marriage, Counterclaim and a simultaneous batch. Profile DOM/CSS3D text/compositing as well as WebGL; ≤128 MB texture budget does not exempt render targets or decoded DOM images from a separate measured total-memory report. Record p95/p99 frame times, GC pauses, dropped frames and input latency on named actual devices.

For simultaneous choice: lock all choices → reveal the permitted selections together → execute the atomic batch → animate the already-resolved batch with source/destination emphasis → one relationship cleanup presentation. Cinematic emphasis cannot allow a later chooser to react to an earlier one. Reduced motion uses simultaneous labels followed by optional per-card inspection. Skip/replay affects presentation only. Private inspection never triggers an automatic camera flight; restore focus to the action/zone when it closes.

### Audio cue manifest

Deliver licensed/original stems for neutral room/table ambience, pending historical pressure, Proclaimed Crown, successor's reign, approaching painting completion, Eudoxia victory and dynastic settlement. Distinct material Foley covers card slide/lift/settle, wax, wood, metal and page turning. Transitions are driven by committed engine events, not rendering, hover or reload; no music reset on each opportunity.

Mix policy: terminal outcome supersedes ceremony; ceremony ducks ambience; warnings take priority over ordinary Foley; at most two transient cues overlap, with 150 ms aggregation for simultaneous batches. A painting-warning motif triggers once when it first has five unveiled fragments and once after falling below/reaching that state again, never every frame. A 10-second minimum warning-motif cooldown prevents chatter without hiding captioned state. Mute preserves every caption/choice. No clipped summed peaks; loudness/mix targets are measured on shipped stems. Require a five-minute dense sequence listened to in headphones, speakers, mono and mute; captions must independently explain it. Optional narration ducks music and must be intelligible; full cast voice acting is outside baseline scope.

## Art and manufacture decision gate

Create a compact visual bible from the existing source portraits, approved generated family treatments and researched historical material references. It contains one intended opening composition, one dense four-player composition, material/lighting samples, all state symbols, cropping/typography rules and print proof. It is an art deliverable, not automatically created by this written spec.

Compare the actual M5 slice and pinned current production anonymously side by side with at least five players who were not its authors. Ask separately about material credibility, locating their Court/next action, portrait legibility, and the appeal of the Crown/painting scene. Record concrete reasons and failures; do not infer universal gamer preference. The art lead chooses revisions using both responses and craft judgment. A claimed “high-water mark” requires visible improvement and coherent shipped quality, not polygon counts or a marketing superlative.

The print package includes separate Card Text/Reminder Text fields, actual trim-size proofs, all 52 Noble faces, four Laws, twelve Interregna, 24 fragments, references/registers and BOM. Supplier inputs include front/back orientation and unique-ID reconciliation. Design print-and-punchboard first; optional deluxe metal/resin pieces use the same silhouette and state. Verify actual-size placement on target table, component wear, reset sorting, sleeve opacity, folding/box tolerances and packed inventory. Exact cost, MSRP, material certifications and commercial art clearances require supplier/provenance evidence, not agent estimates.

## Language and accessibility release boundary

Initial operative language is **English**. Preserve names' Unicode diacritics and font licenses. Pseudolocalization must be used before designing a future translation; it does not authorize release of machine-translated rules.

Each future locale binds to card source hash, dictionary version and semantic IDs. Source edits invalidate locale signoff. A bilingual rules editor adjudicates physical localized cards against the same independent scenarios, including `each`, `one`, `may`, timing, simultaneous choices, printed Dynasty and Bloodline. Full locale fit/font/glyph proofs and canonical Reminder Text checks are required. Ship no partially translated operative set. The engine executes compiled semantics; the translated printed instructions must give a human the same answer.

Human research includes novices, experienced card players, keyboard-only and touch-only routes, and people using low-vision/assistive-technology accommodations. Run blind physical teaching separately from the guided digital match. Report participants/access modes actually tested; do not claim all disabilities covered. Zero unresolved task-blocking access failures in the tested supported routes is a gate. Each novice should identify their seat versus printed Dynasty, predict a broken marriage, identify available/reserved seals and explain Crown success/failure. Record help requests and prediction errors, not merely task completion. Eight-player usability screening is qualitative evidence, not a population success percentage.

## Short honest demo and retail handoff

Provide a separate **five-minute preset demonstration**, clearly labeled, with a public fixed fixture and ordinary rules. A two-seat state offers two real branches: keep a same-Dynasty Outlaw for Counterclaim, or barter it to gain a marriage/claim opportunity while a visible Interregnum and painting create pressure. The opponent uses the same legal actions; at least one choice can fail. The demo need not fake a victory and does not replace the full continuous tutorial. Its preset is a versioned engine fixture with full conservation, published setup steps and no hidden tutorial-only powers. Define the exact fixture at M3 once card IDs/actions are implemented; test first meaningful decision within 90 seconds and completion/explanation within five minutes. A store staff reference adds a 60-second premise, three setup steps, reset inventory and invitation to the full game.

Pitch: “Build a dynasty from a shared inheritance. Keep people concealed to bargain and contest claims, or expose them to govern. Marriages open doors and create weaknesses. Can your rule survive a succession before Eudoxia completes the record?” Do not call it a collectible TCG, suggest personal deck construction, show CGI as gameplay or attribute endorsements to the simulated reviewers.

## Required adversarial fixtures before expensive production

- Four-seat coordinated denial with each Law and Regency; enumerate actual available matching claims/Counterclaims, not omniscient access to all cards. Require legal winning continuations in representative well-prepared states; an overwhelming disadvantaged state need not be rescued.
- A player without native Queens but with two native Overlords can pursue Regency. Compare its extra exposed round with primary Law paths; if all optimal players use Regency, revise its topology rather than add points/cost modifiers.
- Alba loses one named candidate and continues; loses both and forfeits. Tudor secrecy ends before all rivals' full refreshed contest round. Habsburg's sponsor survives departure. Plantagenet's witness is an actual persistent target.
- At a painting near completion, the Crown controller can act on Eudoxia without rivals' permission, paying their own seal/Outlaw. An exhausted rival refuses aid. Record whether alternatives were strategically meaningful; repeated forced-futility or routine mandatory Veil is a redesign trigger.
- Starting a new Crown late in a round cannot settle early. All-pass immediately closes the round; no special late petition or automatic saving of seals exists.
- All four Laws tested with identical public card-access quality, seating rotations, and duplicated Dynasty declarations. Strategic identity must change which exchanges are attractive, not merely the amount of material required.
- Reveal A3 with no obligated seats: Avert before the next History reveal. Complete active H2 with two distinct contributors and retained pending progress. Multiple recurring/ongoing events stack and expire in defined order.
- The public/private observation log behaves identically uninterrupted and after reload at every barter and commitment stage; a redacted replay cannot infer a sealed heir from an ID, seed or error string.

If these reveal a concrete rule contradiction, repair the document and repeat the gauntlet. If they reveal empirical pacing or preference uncertainty, execute the named paper/player gate. Text-review convergence never substitutes for those experiments.
