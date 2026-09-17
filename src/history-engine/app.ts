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
import { createPreparedTutorial, PREPARED_TUTORIAL_CURSOR, LESSONS, lessonAction, tutorialProgress } from "./tutorial";
import { createDemo } from "./fixtures";
import { escapeHTML as esc, faceHTML, SEAT_SIGNS } from "./face";
import { HistoryTable } from "./scene";
import { TableAudio } from "./audio";
import { captureAnchors, animateEvents, clearMotion } from "./motion";
import { glossaryHTML } from "./glossary";
import { createReader } from "./reader";
import { actionAvailabilityPages, deadlinePages } from "./reading";
import { learningGoal, crownReadiness, teachingCardOptions, followsTeachingAction, describeOutcome } from "./learning";
import { showActionCues, startReadingClock } from './action-cues';

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
let autoAI = true;
let stopReadingClock: (() => void) | null = null;
let learning = false;
let sceneObserver: MutationObserver | null = null;
let soloIntro = false;
let tutorialNotice = "";
let actionPage = 0;
let announcedAI: Action | null = null;
let practiceRevision: number | null = null;
let knowledgeFeedback = "";
let knowledgeAnswers: string[] = [];
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
  sceneObserver?.disconnect();
  stopReadingClock?.();
  showActionCues({} as GameView, null);
  aiWorker?.terminate();
  aiWorker = null;
  clearMotion();
  table?.dispose();
  table = null;
  if (aiTimer) clearTimeout(aiTimer);
  aiTimer = null;
  document.querySelectorAll("dialog").forEach(d => { d.dispatchEvent(new Event("reader-dispose")); d.remove(); });
  document.querySelector("#overlay")?.replaceChildren();
  document.querySelector("#announcer")?.replaceChildren();
}
function curtain() {
  if (state?.players.filter(player => !player.ai).length === 1) return;
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
function expectedTeachingAction(): Action | null {
  return state && tutorial !== null ? lessonAction(state, tutorial) : null;
}
function isRecommendation(v: GameView, action: Action): boolean {
  const expected = expectedTeachingAction();
  return !!expected && followsTeachingAction(v, expected, action);
}
function title() {
  dispose();
  state = null;
  viewer = null;
  root.innerHTML = `<main class="h-title"><div class="h-title-backdrop"></div><nav class="h-title-nav"><span>OVERLORDS &amp; OUTLAWS</span><a href="?legacy=1">Legacy game ↗</a></nav><section class="h-title-copy"><p class="h-eyebrow">A SHARED INHERITANCE. A DISPUTED SUCCESSION.</p><h1>Overlords<br><span>&amp; Outlaws</span></h1><p class="h-lead">Build your family. Claim the Crown.<br>Pass it to an heir—and protect them to win.</p><div class="h-title-actions">${button("Learn at the table", "teach", 'class="primary"')}${button("Set a new table", "setup")}${resume ? button("Resume saved game", "resume") : ""}</div><p class="h-title-note">2–4 players · local table or solo against rivals<br>A physical card game · playable prototype</p>${loaded.legacy ? `<aside class="h-notice">Your legacy game is preserved. <a href="?legacy=1">Continue legacy game</a> or start this new ruleset.</aside>` : ""}${error ? `<p role="alert" class="h-error">${esc(error)}</p>${button("Export stored save for recovery", "recovery-export")}` : ""}<div class="h-title-links"><button data-ui="demo">Five-minute preset demo</button>${button("The rules", "rules")}${button("Read the cards", "archive")}${button("Import private save", "import")}</div></section><div class="h-title-portraits" aria-hidden="true">${["alba-0", "plantagenet-1", "tudor-1"].map((id) => `<div>${faceHTML(id, true)}</div>`).join("")}</div><footer>Original concept © 2025 Malachy Murray</footer></main>`;
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
  learning = cursor !== null;
  preferences.guidance = learning;
  lessonDone = false;
  const humans = game.players.filter(player => !player.ai);
  locked = humans.length !== 1;
  viewer = humans.length === 1 ? humans[0].seat : null;
  soloIntro = cursor !== null;
  autoAI = true;
  announcedAI = null;
  tutorialNotice = "";
  actionPage = 0;
  category = cursor !== null ? LESSONS[cursor]?.action.type ?? "build" : "build";
  selected = null;
  packet = [];
  error = "";
  practiceRevision = null;
  knowledgeFeedback = "";
  knowledgeAnswers = [];
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
    const recommended = tutorial !== null && isRecommendation(beforeView, action);
    state = applyAction(state, action);
    lastOutcome = describeOutcome(beforeView, viewForSeat(state, viewer), action);
    selected = null;
    packet = [];
    error = "";
    announcedAI = null;
    actionPage = 0;
    if (tutorial !== null) {
      if (recommended) {
        tutorial++;
        lessonDone = false;
        category = LESSONS[tutorial]?.action.type ?? "build";
      } else {
        tutorial = null;
        lessonDone = false;
        tutorialNotice = "You chose a different plan. Keep playing; the advice below follows your position.";
      }
    }
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
    const host = document.querySelector('#h-table');
    const animate = () => { if (!locked) animateEvents(events, before, preferences.motion); };
    if (host?.getAttribute('data-scene-ready') === 'false') {
      const observer = new MutationObserver(() => {
        if (host.getAttribute('data-scene-ready') === 'true') { observer.disconnect(); animate(); }
      });
      observer.observe(host, { attributes: true, attributeFilter: ['data-scene-ready'] });
    } else requestAnimationFrame(animate);
  } catch (e) {
    error = e instanceof Error ? e.message : "The action was not committed.";
    render();
  }
}
function drawSemantic(v: GameView) {
  return `<div class="h-semantic-table"><button type="button" data-ui="accessible-table"><strong>${v.crown ? `${esc(v.players[v.crown.seat].name)} holds the Crown` : "The Crown is vacant"}</strong><span>Read Courts, relationships and paintings</span></button></div>`;
}
function accessibleTable(seat?: number) {
  if (!state || locked) return;
  const v = viewForSeat(state, viewer);
  const courts = v.players.filter(player => seat === undefined || player.seat === seat);
  modal(`<h2>${seat === undefined ? "The accessible table" : esc(v.players[seat].name)}</h2><h3>The Crown</h3><p>${v.crown ? esc(crownProgress(v)) : "The Crown is vacant."}</p>${courts.map(player => `<h3>${SEAT_SIGNS[player.seat]} ${esc(player.name)} · ${esc(player.dynasty ?? "Inheritance")}</h3><p>${player.seals} available seals. ${player.handCount} concealed Nobles in hand.</p>${player.court.map(id => `<button data-inspect="${id}">${esc(nameOf(id))}</button><p>${player.ruler === id ? "Ruler. " : ""}${supported(v, player.seat, id) ? "In this player's Bloodline." : "Outside this player's Bloodline."} ${player.rotated.includes(id) ? "Turned sideways until next round." : "Ready."} ${v.marriages.filter(pair => pair.queen === id || pair.spouse === id).map(pair => `Married to ${esc(nameOf(pair.queen === id ? pair.spouse : pair.queen))}; pair ${pair.id}.`).join(" ")}</p>`).join("") || "<p>No Nobles in Court.</p>"}`).join("")}<h3>The paintings</h3>${v.modules.map(dynasty => `<h3>${esc(dynasty)}</h3>${Array.from({length: 6}, (_, slot) => { const fragment = v.fragments.find(piece => piece.dynasty === dynasty && piece.slot === slot + 1); return `<p>Piece ${slot + 1}: ${fragment ? fragment.veil ? `covered until round ${fragment.veil.until}` : "uncovered" : "not revealed"}.</p>`; }).join("")}`).join("")}`);
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
  const sorted = [...actions].sort((a, b) => Number(isRecommendation(v, b)) - Number(isRecommendation(v, a)));
  // Covering any eligible piece of the same painting has the same cost and duration.
  // Present that decision once per payment card and painting, not once per piece.
  const seen = new Set<string>();
  const ordered = sorted.filter(a => {
    const key = a.type === 'veil' ? `${a.card}:${SOURCE[a.target!]?.printed.dynasty}` : JSON.stringify(a);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  const pageSize = innerWidth <= 900 || (window.visualViewport?.height ?? window.innerHeight) < 500 || !['counterclaim', 'barter-inspect', 'barter-decide', 'choice'].includes(actions[0]?.type) ? 1 : 2;
  const pages = Math.max(1, Math.ceil(ordered.length / pageSize));
  actionPage = Math.min(actionPage, pages - 1);
  return `<div class="h-action-list">${ordered.slice(actionPage * pageSize, (actionPage + 1) * pageSize)
    .map((a) => {
      const p = previewAction(v, a);
      const people = a.type === "proclaim" ? `Heirs: ${(a.heirs ?? []).map(nameOf).join(" · ")}${a.witness ? ` · Witness: ${nameOf(a.witness)}` : ""}`
        : a.type === "choice" && a.cards?.some(id => !p.title.includes(nameOf(id))) ? actionName(a) : "";
      return `<button data-action='${esc(JSON.stringify(a))}' ${isRecommendation(v, a) ? 'class="h-teaching-target" data-recommended="true"' : ""}><strong>${esc(p.title)}</strong>${people ? `<span class="h-action-people">${esc(people)}</span>` : ""}<small>${esc(p.cost)}</small><span class="h-action-effect">${esc(p.effect)}</span>${p.warning && ["veil", "proclaim"].includes(a.type) ? `<span class="h-action-risk">${esc(p.warning)}</span>` : ""}</button>`;
    })
    .join("")}</div>${pages > 1 ? `<nav class="h-action-pagination" aria-label="Action choices">${button("Previous", "actions-prev", actionPage === 0 ? "disabled" : "")}<span>${actionPage + 1} / ${pages}</span>${button("Next", "actions-next", actionPage === pages - 1 ? "disabled" : "")}</nav>` : ""}`;
}
function outcomeHTML() {
  return `<div class="h-outcome"><h3>What changed</h3>${lastOutcome.length ? `<ul>${lastOutcome.map(text => `<li>${esc(text)}</li>`).join("")}</ul>` : "<p>This saved action is complete. The table shows its result; open Table record for the history.</p>"}</div>`;
}
function tradeOffers(v: GameView) {
  const trade = v.barter;
  if (!trade?.inspected || v.viewer === null || ![trade.initiator, trade.recipient].includes(v.viewer)) return "";
  const other = v.viewer === trade.initiator ? trade.recipient : trade.initiator;
  return `<div class="h-trade-offers h-trade-compact" data-trade-offer>${[v.viewer, other].map(seat => `<section><h3>${seat === v.viewer ? "You give" : "You receive"}</h3>${(trade.packets[seat] ?? []).map(id => `<button data-inspect="${id}">${esc(nameOf(id))}</button>`).join("")}</section>`).join("")}</div>`;
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
  if (v.result)
    return `<p class="h-eyebrow">${v.result.winner === "eudoxia" ? "THE RECORD IS COMPLETE" : "THE CROWN IS SETTLED"}</p><h2>${v.result.winner === "eudoxia" ? "Eudoxia prevails" : `${v.players[v.result.winner].name === "You" ? "You win" : `${esc(v.players[v.result.winner].name)} wins`}`}</h2><p>${esc(v.result.reason)}</p>${v.crown && v.result.winner === viewer ? `<p>You claimed the Crown with ${esc(nameOf(v.crown.oldRuler))}, passed it to ${esc(nameOf(v.crown.successor!))}, and kept your new ruler until the required round ended. That completes your Crown law.</p>` : ""}${tutorial !== null ? button("Check what you learned", "knowledge", 'class="primary"') : ""}${button("Play a full game", "full-game", 'class="primary"')}${button("Return to title", "home")}${button("Export public record", "public-export")}`;
  const seat = actingSeat();
  if (seat === null) return "<p>Waiting for the current procedure.</p>";
  if (state!.players[seat].ai) {
    const action = announcedAI ?? expectedTeachingAction();
    const preview = action ? opponentPreview(v, action) : null;
    return `<section class="h-opponent-preview"><p class="h-eyebrow">${esc(state!.players[seat].name)} · ABOUT TO ACT</p><h3>${preview ? esc(preview.title) : "Considering the table…"}</h3><p>${preview ? esc(preview.effect) : "Their action will appear here before the table changes."}</p><div class="h-countdown" aria-hidden="true"><div class="h-countdown-fill"></div></div><span class="h-countdown-label">${autoAI ? "Hover or focus here to pause" : "Rivals paused"}</span><div class="h-pacing">${button("Continue now", "advance-ai", !action ? 'disabled' : '')}${button(autoAI ? "Pause rivals" : "Resume rivals", "toggle-ai", 'class="h-subtle"')}</div></section>`;
  }
  if (selected) {
    const p = previewAction(v, selected);
    return `<h3>${esc(p.title)}</h3><strong class="h-cost">${esc(p.cost)}</strong><p>${esc(p.effect)}</p>${p.warning ? `<p class="h-warning">${esc(p.warning)}</p>` : ""}<div class="h-confirm-actions">${button("Confirm this action", "commit", `class="primary ${isRecommendation(v, selected) ? "h-teaching-target" : ""}" ${!p.legal ? "disabled" : ""}`)}${button("Cancel", "cancel")}</div>`;
  }
  if (v.phase === "setup")
    return `<p class="h-eyebrow">INHERITANCE</p>${setupControls(v, seat)}`;
  const actions = legalActions(v, seat);
  if (v.phase === "barter") {
    const b = v.barter!;
    return `${tradeOffers(v)}${b.inspected ? "" : "<p>Offers stay hidden until both players agree.</p>"}${b.stage === "packet" && seat === b.recipient ? `<p>Choose 1 or 2 cards from your hand.</p>${button("Confirm offer", "barter-lock", `class="primary" ${packet.length < 1 || packet.length > 2 ? "disabled" : ""}`)}${button("Decline offer", "barter-cancel")}` : actionList(actions, v)}`;
  }
  if (v.phase === "choice" || v.phase === "response")
    return `<p class="h-eyebrow">${v.phase === "choice" ? "CHOOSE A CARD" : "YOUR RESPONSE"}</p><h3>${v.phase === "choice" ? "Choose what happens next" : `Defend ${nameOf(v.claim!.target)}`}</h3>${actionList(actions, v)}`;
  const types = [...new Set(actions.map((a) => a.type))];
  if (!types.includes(category as Action["type"]))
    category = types[0] ?? "pass";
  return `<p class="h-budget">${v.players[seat].seals} of 3 actions left this round · a Block also costs 1</p>${types.length > 1 ? `${button("Other actions", "choose-action", 'class="h-compact-actions"')}<nav class="h-action-tabs" aria-label="Choose action">${types.map(type => button(esc(ACTION_LABELS[type] ?? type), `category-${type}`, `aria-pressed="${category === type}"`)).join('')}</nav>` : ''}${
    category === "barter"
      ? `<p>Select 1–2 hand cards to offer. ${packet.length} selected. You pay 1 action only if the trade succeeds.</p><div class="h-barter-to">${v.players
          .filter((p) => p.seat !== seat && p.handCount)
          .map((p) =>
            button(
              `Offer to ${esc(p.name)}`,
              `offer-${p.seat}`,
              `${packet.length < 1 || packet.length > 2 ? "disabled" : ""} ${isRecommendation(v, { type: "barter", seat, revision: v.revision, cards: packet, other: p.seat }) ? 'class="h-teaching-target"' : ""}`,
            ),
          )
          .join("")}</div>`
      : actionList(
          actions.filter((a) => a.type === category && (!packet.length || a.card === packet[0] || a.target === packet[0] || a.cards?.includes(packet[0]) || a.heirs?.includes(packet[0]))),
          v,
        )
  }${tutorial === null && !(practiceRevision !== null && v.revision === practiceRevision) ? button("Advice", "advice", 'class="h-subtle"') : ""}`;
}
function opponentPreview(v: GameView, action: Action) {
  if (action.type === "setup-lock") return { title: "Chooses a private packet", effect: "The cards stay hidden until the exchange or declaration resolves." };
  if (action.type === "barter" || action.type === "barter-packet") return { title: "Offers a private trade", effect: "The offered cards remain hidden until both players agree to inspect." };
  if (action.type === "barter-inspect") return { title: action.accept ? "Agrees to inspect" : "Declines inspection", effect: "Each player controls their own consent." };
  if (action.type === "barter-decide") return { title: action.accept ? "Accepts the exchange" : "Declines the exchange", effect: action.accept ? "The cards exchange only if both players accept." : "Both players keep their cards." };
  const preview = previewAction(v, action);
  const actor = v.players[action.seat].name;
  return { ...preview, effect: preview.effect.replace(/\byour\b/gi, `${actor}’s`).replace(/\byou\b/gi, actor) };
}
function coach(v: GameView) {
  if (v.result || state?.players[actingSeat() ?? -1]?.ai) return '';
  if (tutorial === null) return learning ? `<section class="h-coach">${tutorialNotice ? `<p class="h-tutorial-notice">${esc(tutorialNotice)}</p>` : ""}<h2>Your next move</h2><p>${esc(crownReadiness(v, viewer ?? 0).split(/(?<=[.!?])\s+/).slice(0, 3).join(" "))}</p></section>` : tutorialNotice ? `<p class="h-tutorial-notice" role="status">${esc(tutorialNotice)}</p>` : "";
  const progress = tutorialProgress(tutorial);
  return `<section class="h-coach"><span class="h-progress">AT YOUR TABLE</span><h2>${esc(progress.title)}</h2><p>${esc(progress.prompt)}</p></section>`;
}
function render() {
  sceneObserver?.disconnect();
  stopReadingClock?.();
  stopReadingClock = null;
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
  document.querySelectorAll("dialog").forEach(d => { d.dispatchEvent(new Event("reader-dispose")); d.remove(); });
  root.classList.toggle("large-text", preferences.largeText);
  const priorHost = table ? document.querySelector("#h-table") : null;
  if (soloIntro) {
    root.innerHTML = `<main class="h-solo-intro"><section><p class="h-eyebrow">LEARN AT THE TABLE · SOLO</p><h1>Can your family keep the Crown?</h1><p><strong>You win by claiming the Crown, passing it to an heir, and keeping that new ruler for a full round.</strong></p><p>You play Alba. Kenneth leads your family; Margaret and David are already on the table. Henry II and Henry VII lead your rivals.</p><p>Each round you get <strong>3 actions</strong>, counted by the gold seals. Players take turns using one action or passing. Save an action to block a rival from taking one of your nobles.</p><p>We’ll explain each move at the table. You can choose a different plan at any time.</p>${button("Take your seat", "enter-table", 'class="primary"')}${button("Return to title", "home")}</section></main>`;
    bind();
    return;
  }
  if (locked) {
    const next = actingSeat();
    const seat = next !== null && !state.players[next].ai ? next : 0;
    root.innerHTML = `<main class="h-curtain"><p class="h-eyebrow">PRIVATE TABLE HANDOFF</p><div class="h-seal-large">${SEAT_SIGNS[seat]}</div><h1>${esc(state.players[seat].name)}</h1><p>${state.players.filter(p => !p.ai).length === 1 ? "You are playing against computer rivals. Open your private hand to begin." : "Pass the device to this player. Open only when the other players cannot see your hand."}</p>${button("Open my view", "unlock", `class="primary" data-seat="${seat}"`)}${button("Return to title", "home")}</main>`;
    bind();
    return;
  }
  const v = viewForSeat(state, viewer);
  const seat = actingSeat();
  root.innerHTML = `<main class="h-game"><header class="h-game-header"><button data-ui="home" class="h-brand">O&amp;O <span>Overlords &amp; Outlaws</span></button><button type="button" data-ui="deadlines" class="h-round" aria-label="Round schedule and approaching consequences">${v.phase === "setup" ? "Inheritance" : `Round ${v.round}`}<small>${v.passes.length}/${v.players.length} passes · look ahead</small></button><nav>${ownLawButton(v)}${button("Rules", "rules")}${button("History", "history-cards")}${button("Table record", "registers")}${button("Settings", "settings")}${state.players.filter(player => !player.ai).length > 1 ? button("Cover hands", "lock") : ""}</nav></header><div class="h-game-grid"><section class="h-table-panel" aria-label="Physical game table"><div class="h-cameras">${button("Whole table", "focus-all")}${v.players.map((p) => button(`${SEAT_SIGNS[p.seat]} ${esc(p.name)}`, `focus-${p.seat}`)).join("")}</div><div id="h-table" class="h-table ${preferences.quality === "semantic" ? "semantic" : ""}">${preferences.quality === "semantic" ? drawSemantic(v) : ""}</div><div class="h-record" role="status" aria-live="polite">${esc(v.events.filter((e) => e.visibility === "public").at(-1)?.text ?? "Inheritance begins.")}</div></section><aside class="h-decision" aria-label="Action and outcome">${error ? `<p class="h-error" role="alert">${esc(error)}</p>` : ""}${lastOutcome.length ? `<details class="h-last-outcome"><summary>What changed in the last action</summary>${outcomeHTML()}</details>` : ""}${coach(v)}<section class="h-controls">${decision(v)}</section></aside><section class="h-hand" aria-label="Your private Nobles in hand"><header><h2>${SEAT_SIGNS[viewer ?? 0]} ${v.players[viewer ?? 0]?.name === "You" ? "Your Nobles in hand" : `${esc(v.players[viewer ?? 0]?.name)}’s Nobles in hand`}</h2><span>${v.players[viewer ?? 0]?.seals ?? 0} available seals · private hand</span></header><div class="h-card-row">${(v.players[viewer ?? 0]?.hand ?? []).map((id) => `<div class="h-hand-card ${packet.includes(id) ? "selected" : ""}"><button data-select="${id}" aria-pressed="${packet.includes(id)}" aria-label="Select ${esc(nameOf(id))}">${faceHTML(id, true)}</button><button data-inspect="${id}" class="h-inspect-small">Inspect</button></div>`).join("") || "<p>Your hand is empty. You can still use Court actions, Draw or Pass.</p>"}</div></section><section class="h-history-panel">${historyRail(v)}</section></div></main>`;
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
      if (!priorHost && viewer !== null) table.setFocus(innerWidth > 900 ? null : viewer);
      else if (v.claim || (tutorial !== null && seat !== viewer)) {
        const action = v.claim ? { type: "claim" } : expectedTeachingAction();
        if (action && ["claim", "attack", "marry"].includes(action.type)) table.setFocus(null);
      }
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
    const targets = new Set(action && (action.type === "barter" || action.type === "barter-packet" || action.type === "setup-lock") && !selected ? teachingCardOptions(v, action) : []);
    const highlight = () => {
      document.querySelectorAll<HTMLElement>("[data-select]").forEach(element => {
        const id = element.dataset.select;
        element.classList.toggle("h-teaching-target", !!id && targets.has(id));
      });
    };
    highlight();
    requestAnimationFrame(highlight);
  } else {
    document.querySelectorAll("[data-select].h-teaching-target").forEach(element => element.classList.remove("h-teaching-target"));
  }
  const cueAction = v.claim ? { type: 'claim' as const, seat: v.claim.seat, target: v.claim.target, revision: v.revision } : announcedAI ?? expectedTeachingAction();
  const cueHost = document.querySelector('#h-table');
  const cueObserver = new MutationObserver(() => {
    if (cueHost?.getAttribute('data-scene-ready') === 'true') {
      showActionCues(v, cueAction);
      cueObserver.disconnect();
    }
  });
  sceneObserver = cueObserver;
  if (cueHost) cueObserver.observe(cueHost, { attributes: true, attributeFilter: ['data-scene-ready'] });
  requestAnimationFrame(() => showActionCues(v, cueAction));
  if (autoAI && seat !== null && state.players[seat].ai) {
    const automatic = expectedTeachingAction() ?? announcedAI;
    const panel = document.querySelector<HTMLElement>('.h-opponent-preview');
    if (automatic && panel) {
      const words = panel.textContent?.split(/\s+/).length ?? 20;
      stopReadingClock = startReadingClock(panel, Math.max(5, Math.min(14, words / 3)), () => commit(automatic));
    } else aiTimer = setTimeout(aiStep, 200);
  }
}
function modal(html: string) {
  stopReadingClock?.();
  stopReadingClock = null;
  if (aiTimer) clearTimeout(aiTimer);
  aiTimer = null;
  document.querySelectorAll("dialog").forEach(d => { d.dispatchEvent(new Event("reader-dispose")); d.remove(); });
  const dialog = createReader(html);
  root.append(dialog);
  bind(dialog);
  dialog.showModal();
  dialog.addEventListener("close", () => { dialog.remove(); if (state && !locked) render(); });
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
    `<div class="h-inspection">${faceHTML(id, true)}<section><h2>${esc(c.printed.name)}</h2><h3>Card instructions</h3><p>${esc(c.cardText)}</p>${c.kind === "law" && c.printed.dynasty === v.players[viewer ?? 0]?.dynasty ? `<h3>Your path to the Crown</h3><p class="h-learning-goal">${esc(crownReadiness(v, viewer ?? 0))}</p>` : ""}${controller ? `<h3>At this table</h3><p>Held by ${SEAT_SIGNS[controller.seat]} ${esc(controller.name)}. Dynasty: ${esc(c.printed.dynasty)}.</p><p>${c.printed.dynasty === controller.dynasty ? "Matches this player’s Dynasty" : supported(v, controller.seat, id) ? "Joins this player’s Bloodline through marriage" : "Does not belong to this player’s Bloodline"}${controller.ruler === id ? " · Ruler" : ""}${controller.rotated.includes(id) ? " · Turned sideways until next round" : ""}.</p>` : ""}${marriage ? `<p>Marriage ${marriage.id}: ${esc(nameOf(marriage.queen))} ↔ ${esc(nameOf(marriage.spouse))}</p>` : ""}${marked}${controller?.seat === viewer && legalActions(v, viewer!).some(a => a.card === id || a.target === id || a.heirs?.includes(id)) ? button("Show moves with this card", `use-card-${id}`) : ""}<button type="button" data-card-terms="${id}">Explain the words and actions</button><details><summary>History and artwork</summary><p class="h-small">${esc(c.historicalNote)}</p></details></section></div>`,
  );
}
function tableCard(id: string) {
  inspect(id);
}
function toggleCardSelection(id: string) {
  const selectingPacket = state?.phase === 'setup' || state?.phase === 'barter' || category === 'barter';
  const single = !selectingPacket;
  if (single && state && viewer !== null && !packet.includes(id)) {
    const available = legalActions(viewForSeat(state, viewer), viewer).filter(a => a.card === id || a.target === id || a.heirs?.includes(id));
    if (!available.some(a => a.type === category)) category = available[0]?.type ?? category;
    actionPage = 0;
  }
  packet = packet.includes(id) ? packet.filter(card => card !== id) : single ? [id] : [...packet, id];
  render();
}
function rules() {
  modal(
    `<p class="h-eyebrow">LEARN THE GAME</p><h2>Pass the Crown. Keep your family together.</h2>
    <p><b>Your goal:</b> claim the Crown, pass it to your chosen heir, then keep that new Ruler in your Bloodline for the time on your Law. If Eudoxia completes a painting first, everyone loses.</p>${state && !locked ? button("Available actions and costs", "actions-guide") : ""}
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
function deadlines() {
  if (!state || locked) return;
  modal(`<h2>Look ahead</h2>${deadlinePages(viewForSeat(state, viewer)).map(page => `<h3>${esc(page.title)}</h3>${page.body.map(paragraph => `<p>${esc(paragraph)}</p>`).join("")}`).join("")}`);
}
function actionsGuide() {
  if (!state || locked || viewer === null) return;
  modal(`<h2>Your choices now</h2>${actionAvailabilityPages(viewForSeat(state, viewer), viewer).map(page => `<h3>${esc(page.title)}</h3>${page.body.map(paragraph => `<p>${esc(paragraph)}</p>`).join("")}`).join("")}`);
}
function archive(id = SOURCES[0].id) {
  const card = SOURCE[id];
  modal(`<div class="h-inspection">${faceHTML(id)}<section><h2>Read the cards</h2><label>Card <select id="h-archive-card">${SOURCES.map(source => `<option value="${source.id}" ${source.id === id ? "selected" : ""}>${esc(source.printed.name)} · ${esc(source.kind)}</option>`).join("")}</select></label><h3>${esc(card.printed.name)}</h3><p>${esc(card.cardText)}</p><button type="button" data-card-terms="${id}">Explain the words and actions</button><h3>History and artwork</h3><p>${esc(card.historicalNote)}</p></section></div>`);
  document.querySelector<HTMLSelectElement>("#h-archive-card")!.onchange = event => archive((event.target as HTMLSelectElement).value);
}
function knowledgeQuiz() {
  modal(`<h2>Four consequences</h2>${knowledgeFeedback ? `<p role="status">${esc(knowledgeFeedback)}</p>${button("Start a new unaided practice", "practice", 'class="primary"')}` : ""}${knowledgeQuestions.map(([question, yes, no], i) => `<h3>Prediction ${i + 1}</h3><p>${esc(question)}</p><label>Answer <select data-knowledge="${i}"><option value="">Choose what happens</option><option value="yes" ${knowledgeAnswers[i] === "yes" ? "selected" : ""}>${esc(yes)}</option><option value="no" ${knowledgeAnswers[i] === "no" ? "selected" : ""}>${esc(no)}</option></select></label>`).join("")}${button("Check predictions", "knowledge-check", 'class="primary"')}`);
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
    if (state === requestedState && !locked && event.data) {
      announcedAI = event.data.action;
      if (!document.querySelector("dialog[open]")) render();
    }
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
          knowledgeQuiz();
        }
        if (action === "knowledge-check") {
          const predictions = [
            ...document.querySelectorAll<HTMLSelectElement>("[data-knowledge]"),
          ].map((el) => el.value);
          knowledgeAnswers = predictions;
          if (predictions.some((value) => !value))
            knowledgeFeedback =
              "Choose a prediction for each consequence, then check again.";
          else
            knowledgeFeedback = `${predictions.filter((value) => value === "yes").length}/4 correct. The foreign spouse stays in Court, outside your Bloodline. Block needs 1 seal and a matching card from your hand. Crises start when everyone passes in a row. Cover needs a piece never covered before and no piece already covered by you. A completed painting ends the game immediately.`;
          knowledgeQuiz();
        }
        if (action === "practice") {
          start(createDemo());
          practiceRevision = state!.revision;
          render();
        }
        if (action === "teach") start(createPreparedTutorial(), PREPARED_TUTORIAL_CURSOR);
        if (action === "enter-table") {
          soloIntro = false;
          audio.unlock();
          render();
        }
        if (action === "actions-prev" || action === "actions-next") {
          actionPage = Math.max(0, actionPage + (action === "actions-next" ? 1 : -1));
          render();
        }
        if (action.startsWith('use-card-')) {
          category = 'build';
          packet = [];
          toggleCardSelection(action.slice(9));
        }
        if (action === "history-cards" && state) modal(`<h2>History at this table</h2>${historyRail(viewForSeat(state, viewer))}`);
        if (action === "toggle-ai") {
          autoAI = !autoAI;
          render();
        }
        if (action === 'advance-ai') {
          const next = expectedTeachingAction() ?? announcedAI;
          if (next && state?.players[next.seat].ai) commit(next);
        }
        if (action === 'choose-action' && state && viewer !== null) {
          const v = viewForSeat(state, viewer);
          const types = [...new Set(legalActions(v, viewer).map(a => a.type))];
          modal(`<h2>Choose an action</h2>${types.map(type => `${button(esc(ACTION_LABELS[type] ?? type), `category-${type}`)}<p>${esc(ACTION_PURPOSES[type] ?? '')}</p>`).join('')}`);
        }
        if (action.startsWith('category-')) {
          category = action.slice(9);
          packet = [];
          actionPage = 0;
          render();
        }
        if (action === "demo") start(createDemo());
        if (action === "full-game") start(createGame({
          modules: ["alba", "plantagenet", "tudor"],
          players: [{ name: "You", ai: false }, { name: "Henry II", ai: true }, { name: "Henry VII", ai: true }],
          seed: Date.now() >>> 0,
        }));
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
          learning = tutorial !== null || preferences.guidance === true;
          // Old guided saves can already have committed the displayed action.
          if (tutorial !== null && state.revision === tutorial + 1) tutorial++;
          lessonDone = false;
          const humans = state.players.filter(player => !player.ai);
          locked = humans.length !== 1;
          viewer = humans.length === 1 ? humans[0].seat : null;
          soloIntro = false;
          announcedAI = null;
          autoAI = true;
          actionPage = 0;
          category = tutorial !== null ? LESSONS[tutorial]?.action.type ?? "build" : "build";
          tutorialNotice = "";
          if (tutorial !== null && !state.result) {
            const expected = expectedTeachingAction();
            if (tutorial < PREPARED_TUTORIAL_CURSOR || !expected || !legalActions(viewForSeat(state, expected.seat), expected.seat).some(action => followsTeachingAction(viewForSeat(state!, expected.seat), expected, action))) {
              tutorial = null;
              tutorialNotice = "Your saved position is intact. Continue freely; the updated guide starts from a new prepared table.";
            }
          }
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
        if (action === "deadlines") deadlines();
        if (action === "actions-guide") actionsGuide();
        if (action === "accessible-table") accessibleTable();
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
        if (action === "archive") archive();
        if (action === "commit" && selected) commit(selected);
        if (action === "cancel") {
          selected = null;
          render();
        }
        if (action === "ai-step") aiStep();
        if (action === "leave-tutorial" && state) {
          tutorial = null;
          lessonDone = false;
          selected = null;
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
          commit({
            type: "barter",
            seat: viewer,
            revision: state.revision,
            other: Number(action.slice(6)),
            cards: [...packet],
          });
        }
        if (action === "advice" && state && viewer !== null) {
          const d = chooseAction(viewForSeat(state, viewer), viewer);
          if (d)
            modal(
              `<h2>A possible move</h2><p>${esc(d.reason)}</p><p>${esc(previewAction(viewForSeat(state, viewer), d.action).effect)}</p><p>Rivals may hold a matching card to Block you. This suggestion uses only visible cards; it cannot see rival hands or future draws.</p>`,
            );
        }
        if (action === "focus-all") {
          if (preferences.quality === "semantic") accessibleTable();
          else table?.setFocus(null);
        }
        if (action.startsWith("focus-") && action !== "focus-all") {
          if (preferences.quality === "semantic") accessibleTable(Number(action.slice(6)));
          else table?.setFocus(Number(action.slice(6)));
        }
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
  scope.querySelectorAll<HTMLButtonElement>("[data-card-terms]").forEach(b => {
    b.onclick = () => {
      const card = SOURCE[b.dataset.cardTerms!];
      if (card) modal(`<h2>Words and actions · ${esc(card.printed.name)}</h2>${glossaryHTML(card.cardText)}`);
    };
  });
  scope.querySelectorAll<HTMLButtonElement>("[data-select]").forEach((b) => {
      let hold: ReturnType<typeof setTimeout> | null = null;
      let reading = false;
      let origin = { x: 0, y: 0 };
      const stopHold = () => { if (hold) clearTimeout(hold); hold = null; };
      b.setAttribute("aria-description", "Select this card. Hold or right-click to read its instructions.");
      b.title = `${nameOf(b.dataset.select!)} · hold to read`;
      b.onpointerdown = event => {
        if (event.button !== 0) return;
        reading = false;
        origin = { x: event.clientX, y: event.clientY };
        hold = setTimeout(() => { reading = true; inspect(b.dataset.select!); }, 500);
      };
      b.onpointermove = event => {
        if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) stopHold();
      };
      b.onpointerup = stopHold;
      b.onpointercancel = stopHold;
      b.onpointerleave = stopHold;
      b.oncontextmenu = event => { event.preventDefault(); stopHold(); reading = true; inspect(b.dataset.select!); };
      b.onclick = () => {
        stopHold();
        if (reading) { reading = false; return; }
        const id = b.dataset.select!;
        toggleCardSelection(id);
        document
          .querySelector<HTMLButtonElement>(`[data-select="${id}"]`)
          ?.focus({ preventScroll: true });
      };
  });
  scope.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(
    (b) =>
      (b.onclick = () => {
        commit(JSON.parse(b.dataset.action!));
      }),
  );
  const actionCategory = scope.querySelector<HTMLSelectElement>("[data-action-category]");
  if (actionCategory) actionCategory.onchange = () => {
    category = actionCategory.value;
    actionPage = 0;
    packet = [];
    render();
  };
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
let resizeFrame = 0;
const resizeControls = () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    if (state && !locked && !soloIntro && !document.querySelector("dialog[open]")) render();
  });
};
window.addEventListener("resize", resizeControls);
window.visualViewport?.addEventListener("resize", resizeControls);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state && !locked) curtain();
});
title();
