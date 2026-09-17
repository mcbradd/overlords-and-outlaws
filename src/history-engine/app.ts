import "../fonts.css";
import "./style.css";
import { assetUrl } from "../assets";
import { createGame, applyAction } from "./engine";
import { legalActions, supported } from "./rules";
import { chooseAction, type Decision } from "./ai";
import { viewForSeat, viewForSpectator, publicReplay } from "./view";
import { previewAction } from "./preview";
import { CONTENT_VERSION, SOURCE, SOURCES, nameOf, program } from "./content";
import { MODULES, type Action, type GameState, type GameView } from "./types";
import {
  defaultPreferences,
  readSave,
  saveGame,
  decodeSave,
  SAVE_KEY,
  LEGACY_KEY,
  type Preferences,
} from "./storage";
import { createTutorial, LESSONS, lessonAction } from "./tutorial";
import { createDemo } from "./fixtures";
import { escapeHTML as esc, faceHTML, SEAT_SIGNS } from "./face";
import { HistoryTable } from "./scene";
import { TableAudio } from "./audio";
import { captureAnchors, animateEvents, clearMotion } from "./motion";

const root = document.querySelector<HTMLDivElement>("#app")!;
let state: GameState | null = null,
  viewer: number | null = null,
  preferences = defaultPreferences(),
  tutorial: number | null = null,
  lessonDone = false;
let table: HistoryTable | null = null,
  selected: Action | null = null,
  packet: string[] = [],
  category = "build",
  error = "",
  locked = true,
  aiTimer: ReturnType<typeof setTimeout> | null = null;
let autoAI = false;
let practiceRevision: number | null = null;
let knowledgeFeedback = "";
let knowledgeOpen = false;
let aiWorker: Worker | null = null;
const audio = new TableAudio();
const loaded = readSave();
let resume = loaded.save;
error = loaded.error ?? "";
function button(label: string, action: string, extra = "") {
  return `<button type="button" data-ui="${action}" ${extra}>${label}</button>`;
}
function persist() {
  if (state) {
    error = saveGame(state, tutorial, preferences) ?? "";
    try {
      sessionStorage.setItem(
        "history-lesson-done",
        JSON.stringify({ revision: state.revision, done: lessonDone }),
      );
    } catch {
      /* advisory UI cursor only */
    }
  }
}
function dispose() {
  aiWorker?.terminate();
  aiWorker = null;
  clearMotion();
  table?.dispose();
  table = null;
  if (aiTimer) clearTimeout(aiTimer);
  aiTimer = null;
  document.querySelectorAll("dialog").forEach((d) => d.remove());
  document.querySelector("#overlay")?.replaceChildren();
  document.querySelector("#announcer")?.replaceChildren();
}
function curtain() {
  locked = true;
  viewer = null;
  selected = null;
  packet = [];
  dispose();
  render();
}
function actingSeat(): number | null {
  if (!state || state.result) return null;
  if (tutorial !== null && !lessonDone)
    return lessonAction(state, tutorial)?.seat ?? null;
  for (const p of state.players)
    if (legalActions(viewForSeat(state, p.seat), p.seat).length) return p.seat;
  return null;
}
function title() {
  dispose();
  state = null;
  viewer = null;
  root.innerHTML = `<main class="h-title"><div class="h-title-backdrop"></div><nav class="h-title-nav"><span>OVERLORDS &amp; OUTLAWS</span><a href="?legacy=1">Legacy game ↗</a></nav><section class="h-title-copy"><p class="h-eyebrow">A SHARED INHERITANCE. A DISPUTED SUCCESSION.</p><h1>The Weight<br>of the Crown</h1><p class="h-lead">Build a dynasty. Keep your intentions concealed.<br>Let your government outlive its ruler.</p><div class="h-title-actions">${button("Learn at the table", "teach", 'class="primary"')}${button("Set a new table", "setup")}${resume ? button("Resume saved game", "resume") : ""}</div><p class="h-title-note">2–4 players · local table or solo against rivals<br>History engine · prototype revision 4</p>${loaded.legacy ? `<aside class="h-notice">Your legacy game is preserved. <a href="?legacy=1">Continue legacy game</a> or start this new ruleset.</aside>` : ""}${error ? `<p role="alert" class="h-error">${esc(error)}</p>${button("Export stored save for recovery", "recovery-export")}` : ""}<div class="h-title-links"><button data-ui="demo">Five-minute preset demo</button>${button("The rules", "rules")}${button("The complete card archive", "archive")}${button("Import private save", "import")}</div></section><div class="h-title-portraits" aria-hidden="true">${["alba-0", "plantagenet-1", "tudor-1"].map((id) => `<div>${faceHTML(id, true)}</div>`).join("")}</div><footer>Original concept © 2025 Malachy Murray · Counterfactual game offices and relationships</footer></main>`;
  bind();
}
function setup() {
  modal(
    `<p class="h-eyebrow">SET THE TABLE</p><h2>A common pool, private intentions</h2><label>Players <select id="h-players"><option>2</option><option selected>3</option><option>4</option></select></label><label>Table <select id="h-mode"><option value="solo">Solo · you and AI rivals</option><option value="local">Hot-seat · all human players</option></select></label><fieldset><legend>Choose one module per player</legend>${MODULES.map((d, i) => `<label><input type="checkbox" name="module" value="${d}" ${i < 3 ? "checked" : ""}> ${esc(d)}</label>`).join("")}</fieldset><label>Reproducible deal <input id="h-seed" type="number" value="${Math.floor(Date.now() % 1000000)}"></label><p class="h-small">Every player drafts from the shared pool. Selecting a module does not assign it to a seat. Private screens protect ordinary shared-device play; full saves and device inspection can expose concealed cards.</p><p id="h-setup-error" role="alert"></p>${button("Begin Inheritance", "begin", 'class="primary"')}`,
  );
}
function start(game: GameState, cursor: number | null = null) {
  dispose();
  state = game;
  tutorial = cursor;
  lessonDone = false;
  locked = true;
  viewer = null;
  selected = null;
  packet = [];
  error = "";
  practiceRevision = null;
  knowledgeFeedback = "";
  knowledgeOpen = false;
  audio.resumeAt(game.events.length);
  persist();
  render();
}
function commit(action: Action) {
  if (!state) return;
  const before = captureAnchors(),
    sequence = state.events.length;
  try {
    state = applyAction(state, action);
    selected = null;
    packet = [];
    error = "";
    if (tutorial !== null) lessonDone = true;
    audio.effects = preferences.effects;
    audio.play(viewForSeat(state, viewer).events);
    persist();
    if (!state.result && tutorial === null) {
      const next = actingSeat();
      if (next !== null && !state.players[next].ai && viewer !== next) {
        curtain();
        return;
      }
    }
    render();
    const events = viewForSeat(state, viewer).events.filter(
      (e) => e.seq > sequence,
    );
    requestAnimationFrame(() => {
      if (!locked) animateEvents(events, before, preferences.motion);
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "The action was not committed.";
    render();
  }
}
function drawSemantic(v: GameView) {
  return `<div class="h-semantic-table"><section class="h-semantic-center"><h2>${v.crown ? `${esc(v.players[v.crown.seat].name)} · ${esc(v.crown.stage)}` : "The Crown is vacant"}</h2><p>Dynasty Deck ${v.dynastyCount} · History Deck ${v.historyCount}</p><div class="h-semantic-paintings">${v.modules
    .map(
      (d) =>
        `<article><h3>${esc(d)}</h3><div class="h-painting-grid">${Array.from(
          { length: 6 },
          (_, i) => {
            const f = v.fragments.find(
              (f) => f.dynasty === d && f.slot === i + 1,
            );
            return `<span class="h-fragment ${f ? "present" : ""} ${f?.veil ? "veiled" : ""}">${i + 1}${f?.veil ? ` · R${f.veil.until}` : f ? " ✓" : ""}</span>`;
          },
        ).join("")}</div></article>`,
    )
    .join(
      "",
    )}</div></section>${v.players.map((p) => `<section class="h-semantic-court"><h2>${SEAT_SIGNS[p.seat]} ${esc(p.name)} · ${esc(p.dynasty ?? "Inheritance")}</h2><p>${p.seals} available seals · ${p.handCount} concealed Outlaws</p><div class="h-card-row">${p.court.map((id) => `<button class="h-card-button" data-inspect="${id}">${faceHTML(id, true)}<span>${p.ruler === id ? "Ruler · " : ""}${supported(v, p.seat, id) ? "Bloodline" : "Unsupported"}${v.marriages.some((m) => m.queen === id || m.spouse === id) ? ` · Pair ${v.marriages.find((m) => m.queen === id || m.spouse === id)!.id}` : ""}${p.rotated.includes(id) ? " · Rotated" : ""}</span></button>`).join("")}</div></section>`).join("")}</div>`;
}
function historyRail(v: GameView) {
  return `<div class="h-history-rail"><header><h2>History</h2><span>${v.historyCount} unrevealed</span></header>${v.history.length ? v.history.map((e) => `<button class="h-event ${e.status}" data-inspect="${e.id}"><span class="h-eyebrow">${e.status === "pending" ? "WARNING · activates at all-pass" : `ACTIVE · expires end R${e.expires}`}</span><strong>${esc(nameOf(e.id))}</strong><span>${program(e.id).condition === "attack" ? `Muster ${e.attacks[0] ? nameOf(e.attacks[0].card) : "○"} · Secure ${e.attacks[1] ? nameOf(e.attacks[1].card) : "○"}` : program(e.id).condition === "dynasties" ? `${new Set(e.contributions.map((c) => c.dynasty)).size}/2 printed Dynasties` : `${e.fulfilled.filter((s) => e.obligated.includes(s)).length}/${e.obligated.length} obligations fulfilled`}</span></button>`).join("") : "<p>No pending or active Interregna.</p>"}</div>`;
}
function setupControls(v: GameView, seat: number) {
  const st = v.setup!;
  const p = v.players[seat];
  const count = st.step === "pass" ? [3, 2, 1][st.pass] : 3;
  const can = legalActions(v, seat);
  if (st.step === "pass" || st.step === "declare") {
    if (Object.hasOwn(st.locked, seat))
      return "<p>Your selection is locked. Waiting for the other seats.</p>";
    if (!can.length)
      return "<p>Your hand has no trio. Once the other declarations lock, reveal your eight cards and take the bounded repair.</p>";
    return `<h3>${st.step === "pass" ? `Pass ${count} clockwise` : "Declare three of one Dynasty"}</h3><p>Select cards in your hand. ${packet.length}/${count} selected.</p>${button("Lock selected Nobles", "lock-packet", `class="primary" ${packet.length !== count ? "disabled" : ""}`)}`;
  }
  return actionList(can, v);
}
function actionName(a: Action) {
  return `${a.card ? nameOf(a.card) : ""}${a.target ? ` → ${nameOf(a.target)}` : ""}${a.event ? ` · ${nameOf(a.event)}` : ""}${a.other !== undefined ? ` · ${state!.players[a.other].name}` : ""}${a.heirs ? ` · ${a.heirs.map(nameOf).join(" / ")}${a.witness ? ` · ${nameOf(a.witness)}` : ""}` : ""}${a.cards ? ` ${a.cards.map((id) => (SOURCE[id] ? nameOf(id) : `Marriage ${id}`)).join(", ")}` : ""}`.trim();
}
function actionList(actions: Action[], v: GameView) {
  return `<div class="h-action-list">${actions
    .map((a) => {
      const p = previewAction(v, a);
      return `<button data-action='${esc(JSON.stringify(a))}'><strong>${esc(p.title)}</strong><span>${esc(actionName(a) || p.effect)}</span></button>`;
    })
    .join("")}</div>`;
}
const knowledgeQuestions = [
  [
    "When a Queen leaves, her foreign spouse…",
    "Stays in Court, unsupported",
    "Is Retired with her",
  ],
  [
    "A Counterclaim requires…",
    "An available seal and a matching printed-Dynasty Outlaw",
    "A ready Ruler alone",
  ],
  [
    "An unresolved warning activates…",
    "After every seat passes consecutively",
    "As soon as it is revealed",
  ],
  [
    "A revealed fragment can be Veiled when…",
    "It has never been Veiled and you have no active Veil",
    "It completes a painting and you want to undo the loss",
  ],
];
function decision(v: GameView) {
  if (v.result && tutorial !== null && knowledgeOpen)
    return `<p class="h-eyebrow">PREDICT BEFORE YOU PLAY</p><h2>Four consequences</h2>${knowledgeQuestions.map(([question, yes, no], i) => `<label>${esc(question)}<select data-knowledge="${i}"><option value="">Choose your prediction</option><option value="yes">${esc(yes)}</option><option value="no">${esc(no)}</option></select></label>`).join("")}${button("Check predictions", "knowledge-check", 'class="primary"')}${knowledgeFeedback ? `<p role="status">${esc(knowledgeFeedback)}</p>${button("Start a new unaided practice", "practice", 'class="primary"')}` : ""}`;
  if (v.result)
    return `<p class="h-eyebrow">${v.result.winner === "eudoxia" ? "THE RECORD IS COMPLETE" : "THE CROWN IS SETTLED"}</p><h2>${v.result.winner === "eudoxia" ? "Eudoxia prevails" : `${esc(v.players[v.result.winner].name)} prevails`}</h2><p>${esc(v.result.reason)}</p>${tutorial !== null ? button("Predict the next consequences", "knowledge", 'class="primary"') : ""}${button("Explore a new table", "home", 'class="primary"')}${button("Export public record", "public-export")}`;
  if (tutorial !== null) {
    const lesson = LESSONS[tutorial];
    if (!lesson)
      return `<h2>The teaching match is complete</h2>${button("Play an unaided game", "home")}`;
    const a = lessonAction(state!, tutorial)!;
    const own = lesson.action.seat === 0;
    return `<span class="h-progress">${tutorial + 1} / ${LESSONS.length}</span><p class="h-eyebrow">${own ? "YOUR NEXT DECISION" : `${esc(state!.players[lesson.action.seat].name)}’S ACTION`}</p><h2>${esc(lesson.title)}</h2><p>${esc(lesson.explanation)}</p>${lessonDone ? `<div class="h-outcome">${esc(v.events.filter((e) => e.visibility === "public").at(-1)?.text ?? "The action is complete.")}</div>${button("Continue", "lesson-next", 'class="primary h-next"')}` : `<div class="h-preview">${own ? esc(previewAction(v, a).effect) : "Resolve this announced legal action to see its effect on the table."}</div>${button(own ? previewAction(v, a).title : "Resolve opponent action", "lesson-action", 'class="primary h-next"')}`}<p class="h-small">Continue advances this guide only. Cards, seals and History persist through the match.</p>`;
  }
  const seat = actingSeat();
  if (seat === null) return "<p>Waiting for the current procedure.</p>";
  if (state!.players[seat].ai)
    return `<p class="h-eyebrow">${esc(state!.players[seat].name)}’S OPPORTUNITY</p><h2>A rival considers the table</h2><p>Concealed intentions stay private. The committed action will name its source and destination.</p>${button("Resolve opponent action", "ai-step", 'class="primary"')}<label class="h-toggle"><input type="checkbox" id="h-auto" ${autoAI ? "checked" : ""}> Continue AI automatically</label>`;
  if (selected) {
    const p = previewAction(v, selected);
    return `<p class="h-eyebrow">REVIEW BEFORE COMMITTING</p><h2>${esc(p.title)}</h2><strong class="h-cost">${esc(p.cost)}</strong><p>${esc(p.effect)}</p>${p.warning ? `<p class="h-warning">${esc(p.warning)}</p>` : ""}${button("Commit action", "commit", `class="primary" ${!p.legal ? "disabled" : ""}`)}${button("Cancel preview", "cancel")}`;
  }
  if (v.phase === "setup")
    return `<p class="h-eyebrow">INHERITANCE</p>${setupControls(v, seat)}`;
  const actions = legalActions(v, seat);
  if (v.phase === "barter") {
    const b = v.barter!;
    return `<p class="h-eyebrow">PRIVATE BARTER · ${esc(b.stage)}</p><h2>A binding immediate exchange</h2>${b.inspected ? `<p>Offered to you: ${esc((b.packets[seat === b.initiator ? b.recipient : b.initiator] ?? []).map(nameOf).join(", "))}</p>` : "<p>Packets remain concealed until both authorize inspection.</p>"}${b.stage === "packet" && seat === b.recipient ? `<p>Select one or two Outlaws in your hand.</p>${button("Lock offer", "barter-lock", `class="primary" ${packet.length < 1 || packet.length > 2 ? "disabled" : ""}`)}${button("Decline offer", "barter-cancel")}` : actionList(actions, v)}`;
  }
  if (v.phase === "choice" || v.phase === "response")
    return `<p class="h-eyebrow">${v.phase === "choice" ? "LOCK A CHOICE" : "A RESPONSE IS OPEN"}</p><h2>${v.phase === "choice" ? "Resolve the named consequence" : `Defend ${nameOf(v.claim!.target)}`}</h2><p>${v.phase === "choice" ? "Every chooser uses the same snapshot. No cards move until all choices lock." : "Counterclaim spends a seal and matching Outlaw. There is no response to a response."}</p>${actionList(actions, v)}`;
  const types = [...new Set(actions.map((a) => a.type))];
  if (!types.includes(category as Action["type"]))
    category = types[0] ?? "pass";
  return `<p class="h-eyebrow">${SEAT_SIGNS[seat]} ${esc(v.players[seat].name)} · ONE ACTION OR PASS</p><h2>What will you expose?</h2><div class="h-action-tabs">${types.map((type) => `<button data-category="${type}" aria-pressed="${category === type}">${esc(previewAction(v, actions.find((a) => a.type === type)!).title)}</button>`).join("")}</div>${
    category === "barter"
      ? `<p>Select one or two Outlaws, then a recipient. Both packets are inspected only after consent.</p><div class="h-barter-to">${v.players
          .filter((p) => p.seat !== seat && p.handCount)
          .map((p) =>
            button(
              `Offer to ${esc(p.name)}`,
              `offer-${p.seat}`,
              `${packet.length < 1 || packet.length > 2 ? "disabled" : ""}`,
            ),
          )
          .join("")}</div>`
      : actionList(
          actions.filter((a) => a.type === category),
          v,
        )
  }${practiceRevision !== null && v.revision === practiceRevision ? "<p>New practice scenario: make one unaided legal choice before requesting advice.</p>" : button("Advice from your visible information", "advice", 'class="h-subtle"')}`;
}
function render() {
  if (!state) {
    title();
    return;
  }
  if (aiTimer) clearTimeout(aiTimer);
  aiTimer = null;
  document.querySelectorAll("dialog").forEach((d) => d.remove());
  root.classList.toggle("large-text", preferences.largeText);
  const priorHost = table ? document.querySelector("#h-table") : null;
  if (locked) {
    const next = actingSeat();
    const seat = next !== null && !state.players[next].ai ? next : 0;
    root.innerHTML = `<main class="h-curtain"><p class="h-eyebrow">PRIVATE TABLE HANDOFF</p><div class="h-seal-large">${SEAT_SIGNS[seat]}</div><h1>${esc(state.players[seat].name)}</h1><p>Pass the device to this seat.<br>Open only when the other players cannot see your hand.</p>${button("Open my view", "unlock", `class="primary" data-seat="${seat}"`)}${button("Return to title", "home")}</main>`;
    bind();
    return;
  }
  const v = viewForSeat(state, viewer);
  const seat = actingSeat();
  root.innerHTML = `<main class="h-game"><header class="h-game-header"><button data-ui="home" class="h-brand">O&amp;O <span>The Weight of the Crown</span></button><div class="h-round">${v.phase === "setup" ? "Inheritance" : `Round ${v.round}`}<small>${v.passes.length}/${v.players.length} consecutive passes</small></div><nav>${button("Rules", "rules")}${button("Inspect state", "registers")}${button("Settings", "settings")}${button("Cover hands", "lock")}</nav></header><div class="h-game-grid"><section class="h-table-panel" aria-label="Physical game table"><div class="h-cameras">${button("Whole table", "focus-all")}${v.players.map((p) => button(`${SEAT_SIGNS[p.seat]} ${esc(p.name)}`, `focus-${p.seat}`)).join("")}</div><div id="h-table" class="h-table ${preferences.quality === "semantic" ? "semantic" : ""}">${preferences.quality === "semantic" ? drawSemantic(v) : ""}</div><div class="h-record" role="status" aria-live="polite">${esc(v.events.filter((e) => e.visibility === "public").at(-1)?.text ?? "Inheritance begins.")}</div></section><aside class="h-decision ${tutorial !== null ? "h-guide" : ""}" aria-label="${tutorial !== null ? "Learning guide" : "Action and outcome"}">${error ? `<p class="h-error" role="alert">${esc(error)}</p>` : ""}${decision(v)}</aside><section class="h-hand" aria-label="Your private Outlaws"><header><h2>${SEAT_SIGNS[viewer ?? 0]} ${esc(v.players[viewer ?? 0]?.name)}’s Outlaws</h2><span>${v.players[viewer ?? 0]?.seals ?? 0} available seals · private hand</span></header><div class="h-card-row">${(v.players[viewer ?? 0]?.hand ?? []).map((id) => `<div class="h-hand-card ${packet.includes(id) ? "selected" : ""}"><button data-select="${id}" aria-pressed="${packet.includes(id)}" aria-label="Select ${esc(nameOf(id))}">${faceHTML(id, true)}</button><button data-inspect="${id}" class="h-inspect-small">Inspect</button></div>`).join("") || "<p>No Outlaws in your hand. You can still act or Pass when eligible.</p>"}</div></section><section class="h-history-panel">${historyRail(v)}</section></div></main>`;
  if (preferences.quality !== "semantic") {
    try {
      if (table && priorHost)
        document.querySelector("#h-table")!.replaceWith(priorHost);
      else
        table = new HistoryTable(
          document.querySelector("#h-table")!,
          inspect,
          () => {
            table?.dispose();
            table = null;
            preferences.quality = "semantic";
            render();
          },
          preferences,
        );
      table.render(viewForSpectator(state));
    } catch {
      table?.dispose();
      table = null;
      preferences.quality = "semantic";
      render();
      return;
    }
  } else if (table) {
    table.dispose();
    table = null;
  }
  bind();
  if (autoAI && tutorial === null && seat !== null && state.players[seat].ai)
    aiTimer = setTimeout(aiStep, 1500);
}
function modal(html: string) {
  document.querySelectorAll("dialog").forEach((d) => d.remove());
  const dialog = document.createElement("dialog");
  dialog.className = "h-dialog";
  dialog.innerHTML = `${button("Close ×", "close", 'class="h-close"')}<div>${html}</div>`;
  root.append(dialog);
  bind(dialog);
  dialog.showModal();
  dialog.addEventListener("close", () => dialog.remove());
}
function inspect(id: string) {
  if (!state || locked) return;
  const v = viewForSeat(state, viewer);
  const c = SOURCE[id];
  if (!c) return;
  const allowed =
    c.kind !== "noble" ||
    v.players.some(
      (p) =>
        p.court.includes(id) ||
        p.leverage.includes(id) ||
        (p.hand ?? []).includes(id),
    ) ||
    v.noblePast.includes(id) ||
    v.crown?.sealed === id;
  if (!allowed) return;
  const controller = v.players.find(
    (p) =>
      p.court.includes(id) ||
      p.leverage.includes(id) ||
      (p.hand ?? []).includes(id),
  );
  const marriage = v.marriages.find((m) => m.queen === id || m.spouse === id);
  modal(
    `<div class="h-inspection">${faceHTML(id)}<section><p class="h-eyebrow">CANONICAL CARD · ${esc(id)}</p><h2>${esc(c.printed.name)}</h2>${controller ? `<p>Controlled by ${SEAT_SIGNS[controller.seat]} ${esc(controller.name)}. Printed Dynasty: ${esc(c.printed.dynasty)}.</p><p>${c.printed.dynasty === controller.dynasty ? "Native" : supported(v, controller.seat, id) ? "Foreign · supported through marriage" : "Foreign · outside this Bloodline"}${controller.ruler === id ? " · Ruler" : ""}${controller.rotated.includes(id) ? " · Rotated" : ""}.</p>` : ""}${marriage ? `<p>Marriage ${marriage.id}: ${esc(nameOf(marriage.queen))} ↔ ${esc(nameOf(marriage.spouse))}</p>` : ""}${c.kind === "noble" ? "<p>In hand, every Noble is an Outlaw: bargain, Commit a matching Claim or Counterclaim, contribute to History, or Discard to Veil. Native Outlaws can Build; foreign people can enter through a native Queen.</p>" : ""}<p class="h-small">${esc(c.historicalNote)}</p></section></div>`,
  );
}
function rules() {
  modal(
    `<p class="h-eyebrow">THE PHYSICAL RULES · HISTORY ENGINE V4</p><h2>Government must outlive its ruler</h2><ol><li>Combine 13 Nobles and 9 History cards per selected module. Deal eight each. Pass 3, 2, then 1 clockwise; declare three of one Dynasty and appoint a Ruler.</li><li>Each round, return Leverage, refresh three seals, conduct scheduled succession, resolve recurring events, reveal one History card per player, then draw one Noble if your hand has fewer than five.</li><li>Clockwise, take one action or Pass. A committed action clears consecutive passes. Everyone passing consecutively closes the round immediately.</li><li>Use concealed Outlaws for barter and matching dynastic Claims. Counterclaim costs the defender a seal and matching Outlaw. No nested response. Claim proof returns next round.</li><li>Only a native Queen can marry a foreign person you control. Each has one spouse. Losing either breaks the pair; a remaining foreign spouse stays in Court unsupported.</li><li>Pending Interregna offer a full warning round. Contributions persist. At all-pass, unmet events activate in reveal order. Active termination requires explicit End text.</li><li>Proclaim under your Law with a native Ruler, three native Overlords and the named arrangement. Next start, Retire that Ruler and install the lawful successor. Survive the entire round to settle. Regency needs only two native people but two full successor rounds.</li><li>All six unveiled fragments of any painting immediately give Eudoxia victory. Veil costs a seal and one permanently Discarded Outlaw, lasts until start R+2, and is once per fragment. One active Veil per initiator.</li></ol><p>The Past is public and never reshuffled. Courts and hands have no imposed capacity. The full card archive and state registers supply exact Laws, event text and retained proof.</p><p><a href="${assetUrl("history-proof.html")}" target="_blank">Open printable card and reference kit ↗</a></p>`,
  );
}
function registers() {
  if (!state) return;
  const v = viewForSeat(state, viewer);
  modal(
    `<h2>Public registers</h2><h3>Crown procedure</h3><p>${v.crown ? esc(JSON.stringify({ ...v.crown, sealed: v.crown.sealed ? "Private commitment" : "Concealed or absent" })) : "Vacant"}</p><h3>Petitioned this round</h3><p>${esc(v.petitioned.map(nameOf).join(", ") || "None")}</p><h3>Marriage pairs</h3><p>${
      v.marriages
        .map((m) => `${m.id}: ${nameOf(m.queen)} ↔ ${nameOf(m.spouse)}`)
        .map(esc)
        .join("<br>") || "None"
    }</p><h3>History proofs</h3>${v.history.map((e) => `<details><summary>${esc(nameOf(e.id))}</summary><p>${esc(SOURCE[e.id].cardText)}</p><p>Obligated seats: ${e.obligated.map((s) => esc(v.players[s].name)).join(", ") || "None"} · fulfilled: ${e.fulfilled.map((s) => esc(v.players[s].name)).join(", ") || "None"}</p><p>${e.contributions.map((c) => `${esc(v.players[c.seat].name)}: ${esc(nameOf(c.card))} (${c.dynasty})`).join("<br>")}</p><p>${e.attacks.map((c, i) => `${i ? "Secure" : "Muster"}: ${esc(nameOf(c.card))}`).join("<br>")}</p></details>`).join("")}<h3>Leverage by seat</h3>${v.players.map((p) => `<p>${esc(p.name)}: ${esc(p.leverage.map(nameOf).join(", ") || "None")}</p>`).join("")}<h3>The Past · Nobles</h3><p>${esc(v.noblePast.map(nameOf).join(", ") || "Empty")}</p><h3>The Past · History</h3><p>${esc(v.historyPast.map(nameOf).join(", ") || "Empty")}</p><h3>Painting records</h3>${v.fragments.map((f) => `<p>${esc(nameOf(f.id))} · ${f.veil ? `Veiled by ${esc(v.players[f.veil.seat].name)}, unveils start R${f.veil.until}` : "Unveiled"} · ${f.onceVeiled ? "once-ever Veil used" : "never Veiled"}</p>`).join("")}<h3>Public chronological record</h3><ol>${v.events
      .filter((e) => e.visibility === "public")
      .map((e) => `<li>${esc(e.text)}</li>`)
      .join(
        "",
      )}</ol>${button("Export public record", "public-export")}${button("Private full game save", "private-export")}`,
  );
}
function settings() {
  modal(
    `<h2>Table settings</h2><label>Presentation <select id="h-quality">${["high", "standard", "compact", "semantic"].map((q) => `<option ${preferences.quality === q ? "selected" : ""}>${q}</option>`).join("")}</select></label><label><input id="h-motion" type="checkbox" ${preferences.motion ? "checked" : ""}> Table motion</label><label><input id="h-large" type="checkbox" ${preferences.largeText ? "checked" : ""}> Larger interface text</label><label>Material sound <input id="h-effects" type="range" min="0" max="1" step="0.05" value="${preferences.effects}"></label><p>All consequences remain in captions when muted. Semantic presentation preserves the same legal game and private handoffs without WebGL.</p>${button("Apply settings", "settings-save", 'class="primary"')}`,
  );
}
function exportText(text: string, name: string) {
  const blob = new Blob([text], { type: "application/json" }),
    url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function aiStep() {
  if (!state || tutorial !== null || aiWorker) return;
  const seat = actingSeat();
  if (seat === null || !state.players[seat].ai) return;
  const requestedState = state;
  const worker = new Worker(new URL("./ai-worker.ts", import.meta.url), {
    type: "module",
  });
  aiWorker = worker;
  // All evaluation runs off the UI thread, including a decision exceeding the
  // 250 ms budget. Wall time never changes the candidates or chosen result.
  worker.onmessage = (event: MessageEvent<Decision | null>) => {
    worker.terminate();
    if (aiWorker !== worker) return;
    aiWorker = null;
    if (state === requestedState && !locked && event.data)
      commit(event.data.action);
  };
  worker.onerror = () => {
    worker.terminate();
    if (aiWorker !== worker) return;
    aiWorker = null;
    error =
      "The rival's calculation was interrupted. Advance the rival to retry.";
    render();
  };
  worker.postMessage({ view: viewForSeat(state, seat), seat });
}
function bind(scope: ParentNode = root) {
  scope.querySelectorAll<HTMLButtonElement>("[data-ui]").forEach(
    (b) =>
      (b.onclick = () => {
        const action = b.dataset.ui!;
        if (action === "home") {
          persist();
          resume = readSave().save;
          state = null;
          title();
        }
        if (action === "knowledge") {
          knowledgeOpen = true;
          render();
        }
        if (action === "knowledge-check") {
          const predictions = [
            ...document.querySelectorAll<HTMLSelectElement>("[data-knowledge]"),
          ].map((el) => el.value);
          if (predictions.some((value) => !value))
            knowledgeFeedback =
              "Choose a prediction for each consequence, then check again.";
          else
            knowledgeFeedback = `${predictions.filter((value) => value === "yes").length}/4 correct. The spouse stays unsupported. Counterclaim needs a seal and matching Outlaw. Warnings activate after all-pass. Veil requires a never-veiled fragment and no current Veil; it cannot undo a terminal painting.`;
          render();
        }
        if (action === "practice") {
          start(createDemo());
          practiceRevision = state!.revision;
          render();
        }
        if (action === "teach") start(createTutorial(), 0);
        if (action === "demo") start(createDemo());
        if (action === "setup") setup();
        if (action === "begin") {
          const modules = Array.from(
            document.querySelectorAll<HTMLInputElement>(
              "[name=module]:checked",
            ),
          ).map((el) => el.value) as GameState["modules"];
          const count = Number(
            document.querySelector<HTMLSelectElement>("#h-players")!.value,
          );
          const mode =
            document.querySelector<HTMLSelectElement>("#h-mode")!.value;
          try {
            start(
              createGame({
                modules,
                players: Array.from({ length: count }, (_, i) => ({
                  name: mode === "solo" && i === 0 ? "You" : `Seat ${i + 1}`,
                  ai: mode === "solo" && i > 0,
                })),
                seed: Number(
                  document.querySelector<HTMLInputElement>("#h-seed")!.value,
                ),
              }),
            );
          } catch (e) {
            document.querySelector("#h-setup-error")!.textContent = String(e);
          }
        }
        if (action === "resume" && resume) {
          state = resume.game;
          preferences = resume.preferences;
          tutorial = resume.tutorial;
          lessonDone = tutorial !== null && state.revision > tutorial;
          locked = true;
          viewer = null;
          selected = null;
          packet = [];
          audio.resumeAt(state.events.length);
          render();
        }
        if (action === "unlock") {
          locked = false;
          viewer = Number(b.dataset.seat);
          audio.unlock();
          render();
        }
        if (action === "lock") curtain();
        if (action === "close") b.closest("dialog")?.close();
        if (action === "rules") rules();
        if (action === "registers") registers();
        if (action === "settings") settings();
        if (action === "settings-save") {
          preferences.quality = document.querySelector<HTMLSelectElement>(
            "#h-quality",
          )!.value as Preferences["quality"];
          preferences.motion =
            document.querySelector<HTMLInputElement>("#h-motion")!.checked;
          preferences.largeText =
            document.querySelector<HTMLInputElement>("#h-large")!.checked;
          preferences.effects = Number(
            document.querySelector<HTMLInputElement>("#h-effects")!.value,
          );
          table?.dispose();
          table = null;
          persist();
          render();
        }
        if (action === "archive")
          modal(
            `<h2>The complete core archive</h2><p>52 Nobles · 4 Laws · 12 Interregna · 24 fragments. All operative text is compiled from the same manifest used by the engine.</p><div class="h-archive">${SOURCES.map((c) => `<details><summary>${esc(c.printed.name)} · ${c.kind}</summary>${faceHTML(c.id)}<p>${esc(c.historicalNote)}</p></details>`).join("")}</div>`,
          );
        if (action === "commit" && selected) commit(selected);
        if (action === "cancel") {
          selected = null;
          render();
        }
        if (action === "ai-step") aiStep();
        if (action === "lesson-action" && tutorial !== null && state)
          commit(lessonAction(state, tutorial)!);
        if (action === "lesson-next" && tutorial !== null) {
          tutorial++;
          lessonDone = false;
          persist();
          render();
        }
        if (action === "lock-packet" && state && viewer !== null)
          commit({
            type: "setup-lock",
            seat: viewer,
            revision: state.revision,
            cards: packet,
          });
        if (action === "barter-lock" && state && viewer !== null)
          commit({
            type: "barter-packet",
            seat: viewer,
            revision: state.revision,
            cards: packet,
          });
        if (action === "barter-cancel" && state && viewer !== null)
          commit({
            type: "barter-cancel",
            seat: viewer,
            revision: state.revision,
          });
        if (action.startsWith("offer-") && state && viewer !== null) {
          selected = {
            type: "barter",
            seat: viewer,
            revision: state.revision,
            other: Number(action.slice(6)),
            cards: [...packet],
          };
          render();
        }
        if (action === "advice" && state && viewer !== null) {
          const d = chooseAction(viewForSeat(state, viewer), viewer);
          if (d)
            modal(
              `<h2>A visible-information suggestion</h2><p>${esc(d.reason)}</p><p>${esc(previewAction(viewForSeat(state, viewer), d.action).effect)}</p><p>Opponents may hold matching Counterclaims. This advice does not know their hands or future draws.</p>`,
            );
        }
        if (action === "focus-all") table?.setFocus(null);
        if (action.startsWith("focus-") && action !== "focus-all")
          table?.setFocus(Number(action.slice(6)));
        if (action === "public-export" && state)
          exportText(
            JSON.stringify(publicReplay(state), null, 2),
            "oando-public-record.json",
          );
        if (action === "private-export" && state) {
          persist();
          exportText(
            localStorage.getItem(SAVE_KEY)!,
            "oando-PRIVATE-full-game-save.json",
          );
        }
        if (action === "recovery-export")
          exportText(
            localStorage.getItem(SAVE_KEY) ??
              localStorage.getItem(LEGACY_KEY) ??
              "null",
            "oando-PRIVATE-recovery.json",
          );
        if (action === "import") {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json";
          input.onchange = async () => {
            try {
              const save = decodeSave(await input.files![0].text());
              resume = save;
              localStorage.setItem(SAVE_KEY, JSON.stringify(save));
              error = "";
              title();
            } catch (e) {
              error = String(e);
              title();
            }
          };
          input.click();
        }
      }),
  );
  scope
    .querySelectorAll<HTMLButtonElement>("[data-inspect]")
    .forEach((b) => (b.onclick = () => inspect(b.dataset.inspect!)));
  scope.querySelectorAll<HTMLButtonElement>("[data-select]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.select!;
        packet = packet.includes(id)
          ? packet.filter((c) => c !== id)
          : [...packet, id];
        render();
        document
          .querySelector<HTMLButtonElement>(`[data-select="${id}"]`)
          ?.focus();
      }),
  );
  scope.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(
    (b) =>
      (b.onclick = () => {
        selected = JSON.parse(b.dataset.action!);
        render();
        document
          .querySelector<HTMLButtonElement>('[data-ui="commit"]')
          ?.focus();
      }),
  );
  scope.querySelectorAll<HTMLButtonElement>("[data-category]").forEach(
    (b) =>
      (b.onclick = () => {
        category = b.dataset.category!;
        render();
      }),
  );
  const auto = scope.querySelector<HTMLInputElement>("#h-auto");
  if (auto)
    auto.onchange = () => {
      autoAI = auto.checked;
      if (autoAI) aiStep();
    };
  scope.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    img.onerror = () => {
      img.style.visibility = "hidden";
      img.closest(".h-card-face")?.setAttribute("data-art", "unavailable");
    };
  });
}
window.addEventListener("blur", () => {
  if (state && !locked) curtain();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state && !locked) curtain();
});
title();
