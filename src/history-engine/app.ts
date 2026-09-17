import "../fonts.css";
import "./style.css";
import { assetUrl } from "../assets";
import { createGame, applyAction } from "./engine";
import { legalActions, supported, crownProgress } from "./rules";
import { chooseAction, type Decision } from "./ai";
import { viewForSeat, viewForSpectator, publicReplay } from "./view";
import { previewAction, ACTION_LABELS, ACTION_PURPOSES } from "./preview";
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
import { glossaryHTML } from "./glossary";
import { learningGoal, crownReadiness, requiredTeachingCards, teachingCardOptions, selectedTeachingAction, teachingCardLocation, describeOutcome } from "./learning";

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
let lastOutcome: string[] = [];
let renderedRevision: number | null = null;
let renderedLesson: number | null = null;
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
  lastOutcome = [];
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
  root.innerHTML = `<main class="h-title"><div class="h-title-backdrop"></div><nav class="h-title-nav"><span>OVERLORDS &amp; OUTLAWS</span><a href="?legacy=1">Legacy game ↗</a></nav><section class="h-title-copy"><p class="h-eyebrow">A SHARED INHERITANCE. A DISPUTED SUCCESSION.</p><h1>The Weight<br>of the Crown</h1><p class="h-lead">Build your family. Claim the Crown.<br>Pass it to an heir—and protect them to win.</p><div class="h-title-actions">${button("Learn at the table", "teach", 'class="primary"')}${button("Set a new table", "setup")}${resume ? button("Resume saved game", "resume") : ""}</div><p class="h-title-note">2–4 players · local table or solo against rivals<br>A physical card game · playable prototype</p>${loaded.legacy ? `<aside class="h-notice">Your legacy game is preserved. <a href="?legacy=1">Continue legacy game</a> or start this new ruleset.</aside>` : ""}${error ? `<p role="alert" class="h-error">${esc(error)}</p>${button("Export stored save for recovery", "recovery-export")}` : ""}<div class="h-title-links"><button data-ui="demo">Five-minute preset demo</button>${button("The rules", "rules")}${button("Read the cards", "archive")}${button("Import private save", "import")}</div></section><div class="h-title-portraits" aria-hidden="true">${["alba-0", "plantagenet-1", "tudor-1"].map((id) => `<div>${faceHTML(id, true)}</div>`).join("")}</div><footer>Original concept © 2025 Malachy Murray · Counterfactual game offices and relationships</footer></main>`;
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
  const beforeView = viewForSeat(state, viewer);
  const before = captureAnchors(),
    sequence = state.events.length;
  try {
    state = applyAction(state, action);
    lastOutcome = describeOutcome(beforeView, viewForSeat(state, viewer), action);
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
  return `<div class="h-semantic-table"><section class="h-semantic-center"><h2>${v.crown ? `${esc(v.players[v.crown.seat].name)} · ${esc(crownProgress(v))}` : "The Crown is vacant"}</h2><p>Dynasty Deck ${v.dynastyCount} · History Deck ${v.historyCount}</p><div class="h-semantic-paintings">${v.modules
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
    )}</div></section>${v.players.map((p) => `<section class="h-semantic-court"><h2>${SEAT_SIGNS[p.seat]} ${esc(p.name)} · ${esc(p.dynasty ?? "Inheritance")}</h2><p>${p.seals} available seals · ${p.handCount} concealed Nobles in hand</p><div class="h-card-row">${p.court.map((id) => `<button class="h-card-button" data-inspect="${id}">${faceHTML(id, true)}<span>${p.ruler === id ? "Ruler · " : ""}${supported(v, p.seat, id) ? "Bloodline" : "Outside Bloodline"}${v.marriages.some((m) => m.queen === id || m.spouse === id) ? ` · Pair ${v.marriages.find((m) => m.queen === id || m.spouse === id)!.id}` : ""}${p.rotated.includes(id) ? " · Sideways" : ""}</span></button>`).join("")}</div></section>`).join("")}</div>`;
}
function historyRail(v: GameView) {
  return `<div class="h-history-rail"><header><h2>History</h2><span>${v.historyCount} cards left</span></header>${v.history.length ? v.history.map((e) => `<button class="h-event ${e.status}" data-inspect="${e.id}"><span class="h-eyebrow">${e.status === "pending" ? "WARNING · starts when this round ends" : `ACTIVE · ends after round ${e.expires}`}</span><strong>${esc(nameOf(e.id))}</strong><span>${program(e.id).condition === "attack" ? `${e.attacks.length} of ${program(e.id).requiredContributions} Challenges · ${e.attacks.map((a) => esc(nameOf(a.card))).join(", ") || "No contributions yet"}` : program(e.id).condition === "dynasties" ? `${new Set(e.contributions.map((c) => c.dynasty)).size} of ${program(e.id).requiredContributions} Dynasties helped` : `${e.fulfilled.filter((s) => e.obligated.includes(s)).length} of ${e.obligated.length} players helped`}</span></button>`).join("") : "<p>No Crises waiting or active.</p>"}</div>`;
}
function ownLawButton(v: GameView) {
  const dynasty = v.players[viewer ?? 0]?.dynasty;
  return dynasty
    ? `<button data-inspect="law-${dynasty}">How to win</button>`
    : "";
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
      return `<button data-action='${esc(JSON.stringify(a))}'><strong>${esc(p.title)}</strong><span>${esc(p.effect)}</span><small>${esc(p.cost)}</small></button>`;
    })
    .join("")}</div>`;
}
function outcomeHTML() {
  return `<div class="h-outcome"><h3>What changed</h3>${lastOutcome.length ? `<ul>${lastOutcome.map(text => `<li>${esc(text)}</li>`).join("")}</ul>` : "<p>This saved action is complete. The table shows its result; open Table record for the history.</p>"}</div>`;
}
function tradeOffers(v: GameView) {
  const trade = v.barter;
  if (!trade?.inspected || v.viewer === null || ![trade.initiator, trade.recipient].includes(v.viewer)) return "";
  const other = v.viewer === trade.initiator ? trade.recipient : trade.initiator;
  return `<div class="h-trade-offers" data-trade-offer>${[v.viewer, other].map(seat => `<section><h3>${seat === v.viewer ? "You give" : "You receive"}</h3>${(trade.packets[seat] ?? []).map(id => `<button data-inspect="${id}">${faceHTML(id, true)}<span>Inspect ${esc(nameOf(id))}</span></button>`).join("")}</section>`).join("")}</div>`;
}
const knowledgeQuestions = [
  [
    "When a Queen leaves, her foreign spouse…",
    "Stays in Court, outside your Bloodline",
    "Is Retired with her",
  ],
  [
    "A Block requires…",
    "An available seal and a matching printed-Dynasty Noble in hand",
    "A ready Ruler alone",
  ],
  [
    "An unresolved warning activates…",
    "After every seat passes consecutively",
    "As soon as it is revealed",
  ],
  [
    "A revealed fragment can be Covered when…",
    "It has never been Covered and you have no active Cover",
    "It completes a painting and you want to undo the loss",
  ],
];
function decision(v: GameView) {
  if (v.result && tutorial !== null && knowledgeOpen)
    return `<p class="h-eyebrow">PREDICT BEFORE YOU PLAY</p><h2>Four consequences</h2>${knowledgeQuestions.map(([question, yes, no], i) => `<label>${esc(question)}<select data-knowledge="${i}"><option value="">Choose what happens</option><option value="yes">${esc(yes)}</option><option value="no">${esc(no)}</option></select></label>`).join("")}${button("Check predictions", "knowledge-check", 'class="primary"')}${knowledgeFeedback ? `<p role="status">${esc(knowledgeFeedback)}</p>${button("Start a new unaided practice", "practice", 'class="primary"')}` : ""}`;
  if (v.result)
    return `<p class="h-eyebrow">${v.result.winner === "eudoxia" ? "THE RECORD IS COMPLETE" : "THE CROWN IS SETTLED"}</p><h2>${v.result.winner === "eudoxia" ? "Eudoxia prevails" : `${v.players[v.result.winner].name === "You" ? "You win" : `${esc(v.players[v.result.winner].name)} wins`}`}</h2><p>${esc(v.result.reason)}</p>${tutorial !== null ? button("Check what you learned", "knowledge", 'class="primary"') : ""}${button("Explore a new table", "home", 'class="primary"')}${button("Export public record", "public-export")}`;
  if (tutorial !== null) {
    const lesson = LESSONS[tutorial];
    if (!lesson)
      return `<h2>The teaching match is complete</h2>${button("Play an unaided game", "home")}`;
    const a = lessonAction(state!, tutorial)!;
    const own = lesson.action.seat === 0;
    const chosen = selectedTeachingAction(v, a, packet);
    const choices = teachingCardOptions(v, a);
    const needed = a.type === "counterclaim" ? 1 : requiredTeachingCards(v, a).length;
    const preview = previewAction(v, chosen ?? a);
    const selection = choices.length ? `<div class="h-teaching-selection"><p><b>${a.type === "counterclaim" ? "Choose 1 matching card to lend" : `Select ${needed} card${needed === 1 ? "" : "s"} for this example`}.</b> ${packet.filter(id => choices.includes(id)).length}/${needed} selected.</p>${choices.map(id => `<button data-guide-card="${id}" aria-pressed="${packet.includes(id)}"><strong>${esc(nameOf(id))}</strong><span>${esc(teachingCardLocation(v, id))}</span></button>`).join("")}</div>` : "";
    return `<span class="h-progress">${tutorial + 1} / ${LESSONS.length}</span><p class="h-eyebrow">${own ? "GUIDED EXAMPLE · YOUR TURN" : `${esc(state!.players[lesson.action.seat].name)}’S ACTION`}</p><p class="h-learning-goal">${esc(tutorial === 0 || v.crown ? learningGoal(v) : "Goal: pass the Crown to your next Ruler, then protect that Ruler for a full round.")}</p><h2>${esc(lesson.title)}</h2><p>${esc(lesson.explanation)}</p>${lessonDone ? `${outcomeHTML()}${tradeOffers(v)}${button("Continue", "lesson-next", 'class="primary h-next"')}` : `${selection}${tradeOffers(v)}<div class="h-preview">${own ? `<strong>${esc(preview.cost)}</strong><p>${esc(preview.effect)}</p>${preview.warning ? `<p>${esc(preview.warning)}</p>` : ""}` : "Resolve this announced action, then read what changed before continuing."}</div>${button(own ? preview.title : "Resolve opponent action", "lesson-action", `class="primary h-next" ${own && !chosen ? "disabled" : ""}`)}`}<p class="h-small">This is a guided example, not the only way to play. Choose freely with the same cards using the button below.</p>${button("Play freely from this position", "leave-tutorial", 'class="h-subtle"')}`;
  }
  const seat = actingSeat();
  if (seat === null) return "<p>Waiting for the current procedure.</p>";
  if (state!.players[seat].ai)
    return `<p class="h-eyebrow">${esc(state!.players[seat].name)}’S OPPORTUNITY</p><h2>A rival considers the table</h2><p>Concealed intentions stay private. The committed action will name its source and destination.</p>${button("Resolve opponent action", "ai-step", 'class="primary"')}<label class="h-toggle"><input type="checkbox" id="h-auto" ${autoAI ? "checked" : ""}> Continue AI automatically</label>`;
  if (selected) {
    const p = previewAction(v, selected);
    return `<p class="h-eyebrow">REVIEW YOUR CHOICE</p><h2>${esc(p.title)}</h2><strong class="h-cost">${esc(p.cost)}</strong><p>${esc(p.effect)}</p>${p.warning ? `<p class="h-warning">${esc(p.warning)}</p>` : ""}${button("Confirm this action", "commit", `class="primary" ${!p.legal ? "disabled" : ""}`)}${button("Cancel preview", "cancel")}`;
  }
  if (v.phase === "setup")
    return `<p class="h-eyebrow">INHERITANCE</p>${setupControls(v, seat)}`;
  const actions = legalActions(v, seat);
  if (v.phase === "barter") {
    const b = v.barter!;
    return `<p class="h-eyebrow">PRIVATE TRADE</p><h2>Compare before you agree</h2>${tradeOffers(v)}${b.inspected ? "<p>You can refuse after looking. Only an accepted exchange costs the person who offered it 1 seal.</p>" : "<p>Both offers stay face down until you both agree to look.</p>"}${b.stage === "packet" && seat === b.recipient ? `<p>Choose 1 or 2 cards from your hand.</p>${button("Confirm offer", "barter-lock", `class="primary" ${packet.length < 1 || packet.length > 2 ? "disabled" : ""}`)}${button("Decline offer", "barter-cancel")}` : actionList(actions, v)}`;
  }
  if (v.phase === "choice" || v.phase === "response")
    return `<p class="h-eyebrow">${v.phase === "choice" ? "CHOOSE A CARD" : "A RIVAL TRIES TO TAKE YOUR NOBLE"}</p><h2>${v.phase === "choice" ? "Choose what happens next" : `Defend ${nameOf(v.claim!.target)}`}</h2><p>${v.phase === "choice" ? "Read each choice below. When several players must choose, the cards move after everyone has chosen." : "Block costs 1 seal and a loan of a matching-Dynasty hand card. The loan returns next round. Without a Block, the rival takes your Noble into their hand."}</p>${actionList(actions, v)}`;
  const types = [...new Set(actions.map((a) => a.type))];
  if (!types.includes(category as Action["type"]))
    category = types[0] ?? "pass";
  return `<p class="h-eyebrow">${SEAT_SIGNS[seat]} ${esc(v.players[seat].name)} · ONE ACTION OR PASS</p><h2>Choose your next move</h2><p class="h-learning-goal">${esc(learningGoal(v))}</p><p><b>${v.players[seat].seals} seals left.</b> Each action or Block costs 1. Pass is free.</p><div class="h-action-tabs">${types.map((type) => `<button data-category="${type}" aria-pressed="${category === type}">${esc(ACTION_LABELS[type] ?? type)}</button>`).join("")}</div><p>${esc(ACTION_PURPOSES[category as Action["type"]] ?? "Choose an action to see its cost and result before confirming.")}</p>${
    category === "barter"
      ? `<p>Select one or two Nobles in hand, then a recipient. Both packets are inspected only after consent.</p><div class="h-barter-to">${v.players
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
  const keepScroll = renderedRevision === state.revision && renderedLesson === tutorial;
  const guideScroll = keepScroll ? document.querySelector(".h-decision")?.scrollTop ?? 0 : 0;
  const handScroll = document.querySelector(".h-hand .h-card-row")?.scrollLeft ?? 0;
  renderedRevision = state.revision;
  renderedLesson = tutorial;
  document.querySelectorAll("dialog").forEach((d) => d.remove());
  root.classList.toggle("large-text", preferences.largeText);
  const priorHost = table ? document.querySelector("#h-table") : null;
  if (locked) {
    const next = actingSeat();
    const seat = next !== null && !state.players[next].ai ? next : 0;
    root.innerHTML = `<main class="h-curtain"><p class="h-eyebrow">PRIVATE TABLE HANDOFF</p><div class="h-seal-large">${SEAT_SIGNS[seat]}</div><h1>${esc(state.players[seat].name)}</h1><p>${state.players.filter(p => !p.ai).length === 1 ? "You are playing against computer rivals. Open your private hand to begin." : "Pass the device to this player. Open only when the other players cannot see your hand."}</p>${button("Open my view", "unlock", `class="primary" data-seat="${seat}"`)}${button("Return to title", "home")}</main>`;
    bind();
    return;
  }
  const v = viewForSeat(state, viewer);
  const seat = actingSeat();
  root.innerHTML = `<main class="h-game"><header class="h-game-header"><button data-ui="home" class="h-brand">O&amp;O <span>The Weight of the Crown</span></button><div class="h-round">${v.phase === "setup" ? "Inheritance" : `Round ${v.round}`}<small>${v.passes.length}/${v.players.length} passes in a row</small></div><nav>${ownLawButton(v)}${button("Rules", "rules")}${button("Table record", "registers")}${button("Settings", "settings")}${button("Cover hands", "lock")}</nav></header><div class="h-game-grid"><section class="h-table-panel" aria-label="Physical game table"><div class="h-cameras">${button("Whole table", "focus-all")}${v.players.map((p) => button(`${SEAT_SIGNS[p.seat]} ${esc(p.name)}`, `focus-${p.seat}`)).join("")}</div><div id="h-table" class="h-table ${preferences.quality === "semantic" ? "semantic" : ""}">${preferences.quality === "semantic" ? drawSemantic(v) : ""}</div><div class="h-record" role="status" aria-live="polite">${esc(v.events.filter((e) => e.visibility === "public").at(-1)?.text ?? "Inheritance begins.")}</div></section><aside class="h-decision ${tutorial !== null ? "h-guide" : ""}" aria-label="${tutorial !== null ? "Learning guide" : "Action and outcome"}">${error ? `<p class="h-error" role="alert">${esc(error)}</p>` : ""}${decision(v)}</aside><section class="h-hand" aria-label="Your private Nobles in hand"><header><h2>${SEAT_SIGNS[viewer ?? 0]} ${v.players[viewer ?? 0]?.name === "You" ? "Your Nobles in hand" : `${esc(v.players[viewer ?? 0]?.name)}’s Nobles in hand`}</h2><span>${v.players[viewer ?? 0]?.seals ?? 0} available seals · private hand</span></header><div class="h-card-row">${(v.players[viewer ?? 0]?.hand ?? []).map((id) => `<div class="h-hand-card ${packet.includes(id) ? "selected" : ""}"><button data-select="${id}" aria-pressed="${packet.includes(id)}" aria-label="Select ${esc(nameOf(id))}">${faceHTML(id, true)}</button><button data-inspect="${id}" class="h-inspect-small">Inspect</button></div>`).join("") || "<p>Your hand is empty. You can still use Court actions, Draw or Pass.</p>"}</div></section><section class="h-history-panel">${historyRail(v)}</section></div></main>`;
  if (preferences.quality !== "semantic") {
    try {
      if (table && priorHost)
        document.querySelector("#h-table")!.replaceWith(priorHost);
      else
        table = new HistoryTable(
          document.querySelector("#h-table")!,
          tableCard,
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
  const guidePanel = document.querySelector(".h-decision");
  if (guidePanel) guidePanel.scrollTop = guideScroll;
  const handRow = document.querySelector(".h-hand .h-card-row");
  if (handRow) handRow.scrollLeft = handScroll;
  if (tutorial !== null && !lessonDone) {
    const action = lessonAction(state, tutorial)!;
    const targets = new Set(teachingCardOptions(v, action));
    const highlight = () => {
      document.querySelectorAll<HTMLElement>("[data-select], [data-card-id], [data-fragment], [data-guide-card]").forEach(element => {
        const id = element.dataset.select ?? element.dataset.cardId ?? element.dataset.fragment ?? element.dataset.guideCard;
        element.classList.toggle("h-teaching-target", !!id && targets.has(id));
      });
    };
    highlight();
    requestAnimationFrame(highlight);
  } else {
    document.querySelectorAll(".h-teaching-target").forEach(element => element.classList.remove("h-teaching-target"));
  }
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
    v.crown?.sealed === id ||
    (!!v.barter?.inspected && Object.values(v.barter.packets).some(ids => ids?.includes(id)));
  if (!allowed) return;
  const controller = v.players.find(
    (p) =>
      p.court.includes(id) ||
      p.leverage.includes(id) ||
      (p.hand ?? []).includes(id),
  );
  const marriage = v.marriages.find((m) => m.queen === id || m.spouse === id);
  const crisis = v.history.find((e) => e.id === id);
  const marked =
    crisis && program(id).condition === "restore-marriage"
      ? `<h3>Nobles marked when revealed</h3>${crisis.obligated.map((seat) => `<p><b>${esc(v.players[seat].name)}</b>: ${(crisis.restoreIds[seat] ?? []).map((card) => esc(nameOf(card))).join(", ")}${crisis.fulfilled.includes(seat) ? " · already helped" : " · Marry one of these Nobles to help"}</p>`).join("")}`
      : "";
  modal(
    `<div class="h-inspection">${faceHTML(id)}<section><p class="h-eyebrow">READ THE CARD</p><h2>${esc(c.printed.name)}</h2>${c.kind === "law" && c.printed.dynasty === v.players[viewer ?? 0]?.dynasty ? `<p class="h-learning-goal">${esc(crownReadiness(v, viewer ?? 0))}</p>` : ""}${controller ? `<p>Held by ${SEAT_SIGNS[controller.seat]} ${esc(controller.name)}. Dynasty: ${esc(c.printed.dynasty)}.</p><p>${c.printed.dynasty === controller.dynasty ? "Matches this player’s Dynasty" : supported(v, controller.seat, id) ? "Joins this player’s Bloodline through marriage" : "Does not belong to this player’s Bloodline"}${controller.ruler === id ? " · Ruler" : ""}${controller.rotated.includes(id) ? " · Turned sideways until next round" : ""}.</p>` : ""}${marriage ? `<p>Marriage ${marriage.id}: ${esc(nameOf(marriage.queen))} ↔ ${esc(nameOf(marriage.spouse))}</p>` : ""}${marked}<details class="h-card-terms" open><summary>Words and actions on this card</summary>${glossaryHTML(c.cardText)}</details><details><summary>History and artwork</summary><p class="h-small">${esc(c.historicalNote)}</p></details></section></div>`,
  );
}
function tableCard(id: string) {
  if (state && tutorial !== null && !lessonDone) {
    const view = viewForSeat(state, viewer);
    const action = lessonAction(state, tutorial)!;
    if (teachingCardOptions(view, action).includes(id)) {
      toggleCardSelection(id);
      return;
    }
  }
  inspect(id);
}
function toggleCardSelection(id: string) {
  const single = tutorial !== null && LESSONS[tutorial]?.action.type === "counterclaim";
  packet = packet.includes(id) ? packet.filter(card => card !== id) : single ? [id] : [...packet, id];
  render();
}
function rules() {
  modal(
    `<p class="h-eyebrow">LEARN THE GAME</p><h2>Pass the Crown. Keep your family together.</h2>
    <p><b>Your goal:</b> claim the Crown, pass it to your chosen heir, then keep that new Ruler in your Bloodline for the time on your Law. If Eudoxia completes a painting first, everyone loses.</p>
    <h3>Set up</h3><p>Choose one Dynasty set per player. Mix their Noble cards into one deck and their History cards into another. Deal 8 Nobles each. Everyone passes 3 cards clockwise at the same time, then 2, then 1. Place 3 Nobles of one Dynasty in front of you: this is your Court and your Dynasty. Mark one as your Ruler. Keep the other 5 cards secret.</p>
    <h3>Your turn</h3><p>Take 1 action or Pass. Each action costs 1 seal; everyone gets 3 seals each round. Save a seal if you want to Block a rival’s Recall. Pass costs nothing. You may act again after passing if someone else acts. When everyone passes in a row, the round ends.</p>
    <h3>A new round</h3><p>Move the first-player marker clockwise, except in round one. Then follow these steps in order.</p><ol><li>Uncover any painting fragments due now. Return lent Nobles to their hands.</li><li>Refill everyone’s 3 seals and turn all sideways Nobles upright.</li><li>Follow any Crown change due now, then the active Crises, oldest first.</li><li>Reveal 1 History card per player. Everyone sees every draw.</li><li>If you have fewer than 5 cards in hand, draw 1 Noble.</li></ol>
    <h3>History gives everyone a warning</h3><p>A new Crisis waits until this round ends. Read its Prevent line: help in time and it goes to The Past. Otherwise its effect starts. Each Crisis says when it ends and whether you can still stop it. Track contributions on the card; returning a loan does not erase that record.</p>
    <h3>Compare Nobles</h3><p>Look at the Dynasty, branch and Queen role. Nobles with the same three labels have the same abilities. A historical name or Founder label gives no extra power. Your Law explains which family relationships matter for winning.</p><h3>Keep marriage visible</h3><p>A Queen of your Dynasty can marry one Noble of another Dynasty from your hand or Court. Put both in your Court with matching pair markers. That spouse joins your Bloodline. If either leaves, the pair breaks. A foreign spouse left behind stays in Court but leaves your Bloodline. A Queen of your Dynasty remains in your Bloodline. Each Noble can have only one spouse.</p>
    <h3>Win through your Law</h3><p>Read your Dynasty’s Law before claiming the Crown. The Crown must be free. Keep its named people and marriage as instructed. If a requirement fails, remove your Crown claim at once; fixing it later does not restore that attempt.</p><p><b>Regency:</b> an alternative for every Dynasty. With a Ruler and another Court Noble of your Dynasty, spend 1 seal and name that Noble as heir. Keep both until next round starts. Retire the old Ruler and make the heir Ruler. Keep the new Ruler in your Bloodline for 2 full rounds to win.</p>
    ${glossaryHTML()}<p>The Past is a public pile. Cards there never return. Hands and Courts have no size limit. When the Noble deck is empty, stop drawing.</p><p><a href="${assetUrl("history-proof.html")}" target="_blank">Printable cards and table reference ↗</a></p>`,
  );
}
function registers() {
  if (!state) return;
  const v = viewForSeat(state, viewer);
  modal(
    `<h2>Public registers</h2><h3>Crown procedure</h3><p>${v.crown ? esc(crownProgress(v)) : "Vacant"}</p><h3>Recalled this round</h3><p>${esc(v.petitioned.map(nameOf).join(", ") || "None")}</p><h3>Marriage pairs</h3><p>${
      v.marriages
        .map((m) => `${m.id}: ${nameOf(m.queen)} ↔ ${nameOf(m.spouse)}`)
        .map(esc)
        .join("<br>") || "None"
    }</p><h3>Crisis contributions</h3>${v.history.map((e) => `<details><summary>${esc(nameOf(e.id))}</summary><p>${esc(SOURCE[e.id].cardText)}</p><p>Players who must help: ${e.obligated.map((s) => esc(v.players[s].name)).join(", ") || "None"} · already helped: ${e.fulfilled.map((s) => esc(v.players[s].name)).join(", ") || "None"}</p><p>${e.contributions.map((c) => `${esc(v.players[c.seat].name)}: ${esc(nameOf(c.card))} (${c.dynasty})`).join("<br>")}</p><p>${e.attacks.map((c, i) => `${i ? "Second contribution" : "First contribution"}: ${esc(nameOf(c.card))}`).join("<br>")}</p></details>`).join("")}<h3>Loans by seat</h3>${v.players.map((p) => `<p>${esc(p.name)}: ${esc(p.leverage.map(nameOf).join(", ") || "None")}</p>`).join("")}<h3>The Past · Nobles</h3><p>${esc(v.noblePast.map(nameOf).join(", ") || "Empty")}</p><h3>The Past · History</h3><p>${esc(v.historyPast.map(nameOf).join(", ") || "Empty")}</p><h3>Painting records</h3>${v.fragments.map((f) => `<p>${esc(nameOf(f.id))} · ${f.veil ? `Covered by ${esc(v.players[f.veil.seat].name)}, uncover at start of round ${f.veil.until}` : "Uncovered"} · ${f.onceVeiled ? "already covered once" : "never covered"}</p>`).join("")}<h3>Public chronological record</h3><ol>${v.events
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
            knowledgeFeedback = `${predictions.filter((value) => value === "yes").length}/4 correct. The foreign spouse stays in Court, outside your Bloodline. Block needs 1 seal and a matching card from your hand. Crises start when everyone passes in a row. Cover needs a piece never covered before and no piece already covered by you. A completed painting ends the game immediately.`;
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
            `<h2>Read the cards</h2><p>52 Nobles · 4 Laws · 12 Crises · 24 painting pieces. Open a card to read its instructions.</p><details><summary>Words and actions</summary>${glossaryHTML()}</details><div class="h-archive">${SOURCES.map((c) => `<details><summary>${esc(c.printed.name)} · ${esc(c.kind === "interregnum" ? "Crisis" : c.kind === "fragment" ? "Painting piece" : c.kind)}</summary>${faceHTML(c.id)}<p>${esc(c.historicalNote)}</p></details>`).join("")}</div>`,
          );
        if (action === "commit" && selected) commit(selected);
        if (action === "cancel") {
          selected = null;
          render();
        }
        if (action === "ai-step") aiStep();
  if (action === "lesson-action" && tutorial !== null && state)
          {
            const a = selectedTeachingAction(viewForSeat(state, viewer), lessonAction(state, tutorial)!, packet);
            if (a) commit(a);
          }
        if (action === "leave-tutorial" && state) {
          tutorial = null;
          lessonDone = false;
          selected = null;
          packet = [];
          lastOutcome = [];
          persist();
          render();
        }
        if (action === "lesson-next" && tutorial !== null) {
          tutorial++;
          lessonDone = false;
          packet = [];
          lastOutcome = [];
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
              `<h2>A possible move</h2><p>${esc(d.reason)}</p><p>${esc(previewAction(viewForSeat(state, viewer), d.action).effect)}</p><p>Rivals may hold a matching card to Block you. This suggestion uses only visible cards; it cannot see rival hands or future draws.</p>`,
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
        toggleCardSelection(id);
        document
          .querySelector<HTMLButtonElement>(`[data-select="${id}"]`)
          ?.focus({ preventScroll: true });
      }),
  );
  scope.querySelectorAll<HTMLButtonElement>("[data-guide-card]").forEach(b => {
    b.onclick = () => {
      const id = b.dataset.guideCard!;
      toggleCardSelection(id);
      document.querySelector<HTMLButtonElement>(`[data-guide-card="${id}"]`)?.focus({ preventScroll: true });
    };
  });
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
