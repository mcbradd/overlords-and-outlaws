import "../fonts.css";
import "./style.css";
import { assetUrl } from "../assets";
import {
  createGame,
  createTutorial,
  applyAction,
  legalActions,
  viewForSeat,
  type CoreState,
  type CoreAction,
} from "./engine";
import { CARDS, BY_ID } from "./content";
import { chooseAction } from "./ai";
import { CoreTable } from "./scene";
import {
  faceHTML,
  preloadCards,
  referenceAidsHTML,
  escapeHTML as esc,
} from "./face";
import { TEACHING, isTeachingAction } from "./tutorial";
import {
  readSave,
  writeSave,
  decodeSave,
  encodeSave,
  type CoreSave,
} from "./storage";

const root = document.querySelector<HTMLDivElement>("#app")!;
const namespace = import.meta.env?.VITE_SAVE_NAMESPACE ?? "";
// Resolve the browser property inside readSave's guarded call: even the getter
// can throw when the browser disallows storage.
const loaded = readSave(
  { getItem: (key) => window.localStorage.getItem(key) },
  namespace,
);
let saved = loaded.save;
let game: CoreState | null = null;
let mode: CoreSave["mode"] = "solo";
let names = ["You", "Rival"];
let lesson: CoreSave["lesson"] = null;
let motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let viewer = 0;
let privateLocked = false;
let selected: string | null = null;
let armed: { card: string; type: string; recruit: boolean } | null = null;
let drag: {
  pointer: number;
  x: number;
  y: number;
  moved: boolean;
  ghost: HTMLElement;
} | null = null;
let table: CoreTable | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let generation = 0;
let renderSequence = 0;
let busy = false;
let notice = loaded.error ?? "";
let outcome = "";
const dynastyName = (name: string) => name[0].toUpperCase() + name.slice(1);
const nameOf = (id: string) => BY_ID[id]?.name ?? id;
const label: Record<string, string> = {
  recruit: "Recruit",
  recall: "Recall",
  defend: "Defend",
  trade: "Trade",
  "name-heir": "Name heir",
  "marry-heir": "Marry & name heir",
  accept: "Accept trade",
  decline: "Let it happen",
  pass: "Pass",
};
const btn = (text: string, action: string, extra = "") =>
  `<button type="button" data-do="${action}" ${extra}>${text}</button>`;
function stopTimer() {
  if (timer) clearTimeout(timer);
  timer = null;
}
function dispose() {
  generation++;
  stopTimer();
  table?.dispose();
  table = null;
  document.querySelector("dialog")?.remove();
}
function persist() {
  if (!game) return;
  saved = { game, lesson, mode, names, motion };
  try {
    writeSave(localStorage, saved, namespace);
  } catch {
    notice =
      "Your browser could not save progress. Keep this page open, or export your game from the table menu.";
  }
}
function logo() {
  return `<h1 class="c-wordmark"><img src="${assetUrl("art/core-wordmark-v1.png")}" alt="Overlords & Outlaws" width="1536" height="1024"></h1>`;
}
async function home() {
  dispose();
  window.scrollTo(0, 0);
  game = null;
  lesson = null;
  selected = null;
  armed = null;
  root.innerHTML = `<main class="c-opening"><section>${logo()}<p class="c-kicker">THE WEIGHT OF THE CROWN</p><p class="c-opening-lead">A family can claim power.<br>Can it keep the succession?</p><p>Play historical people as visible allies or keep them hidden to answer a rival. The same card cannot do both.</p><div class="c-opening-actions">${btn("Learn at the table", "intro", 'class="primary"')}${btn("Play the core game", "setup")}${saved ? btn("Resume your table", "resume") : ""}</div><p class="c-subtle">Core succession prototype · 2–4 players<br>Physical cards. A shared table. Private intentions.</p>${notice ? `<p role="alert">${esc(notice)}</p>` : ""}</section><div class="c-showcase" aria-label="Collectible Dynasty cards"><p>Preparing the cards…</p></div><footer>Original concept © 2025 Malachy Murray</footer></main>`;
  bind();
  const current = generation;
  try {
    await preloadCards(["alba-0", "plantagenet-1", "tudor-1"]);
    if (current !== generation) return;
    root.querySelector(".c-showcase")!.innerHTML = [
      "alba-0",
      "plantagenet-1",
      "tudor-1",
    ]
      .map((id) => `<div class="c-showcase-card">${faceHTML(id)}</div>`)
      .join("");
  } catch {
    if (current === generation)
      root.querySelector(".c-showcase")!.innerHTML =
        "<p>Card artwork could not load. Reload to retry.</p>";
  }
}
function intro() {
  window.scrollTo(0, 0);
  dispose();
  root.innerHTML = `<main class="c-intro"><section class="c-guide"><p class="c-kicker">LEARN AT THE TABLE</p><h1>Keep the Crown in your family.</h1><p class="c-intro-goal">Claim the Crown, pass it to an heir, then keep your new ruler and their supporter on the table for one full round.</p><p>We’ll teach each move at the table. A supporter is another person in your family’s Court—the cards you can all see.</p><p>You lead the Alba Dynasty with Kenneth MacAlpin. You begin with just two cards in your hand. Your rival has a ruler and a hidden hand too.</p><p>First, we’ll show one useful move and explain why it helps. Playing a card uses it for this round; keeping it may let you answer a rival.</p>${btn("Take your seat", "teach", 'class="primary"')}${btn("Return to title", "home")}</section></main>`;
  bind();
  void preloadCards([
    "alba-0",
    "alba-2",
    "alba-3",
    "alba-4",
    "alba-5",
    "alba-6",
    "plantagenet-0",
    "plantagenet-2",
    "plantagenet-3",
    "plantagenet-4",
  ]).catch(() => {});
}
function setup() {
  modal(
    `<h2>Set a core table</h2><p>Build a family, claim the Crown and protect the succession. This prototype ends after 12 rounds if no succession wins.</p><label>Players<select id="players"><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label><label>Table<select id="mode"><option value="solo">You and computer rivals</option><option value="local">Shared device · private handoffs</option></select></label><label>Your Dynasty<select id="dynasty"><option value="alba">Alba</option><option value="plantagenet">Plantagenet</option><option value="tudor">Tudor</option><option value="habsburg">Habsburg</option></select></label><label>Your name<input id="player-name" autocomplete="off" maxlength="40" value="You"></label><label>Deal number<input id="seed" type="number" inputmode="numeric" min="1" max="999999" value="${Math.floor(Date.now() % 999999) + 1}"></label><p>Each seat uses a different Dynasty from the four-suit core set. Each player starts with one ruler and two cards.</p>${btn("Begin game", "begin", 'class="primary"')}<label class="c-file">Import a core save<input type="file" id="save-file" accept="application/json,.json"></label>`,
  );
}
async function start(
  state: CoreState,
  nextMode: CoreSave["mode"],
  nextLesson: CoreSave["lesson"] = null,
) {
  dispose();
  game = state;
  mode = nextMode;
  lesson = nextLesson;
  selected = null;
  armed = null;
  outcome = "";
  privateLocked = mode === "local";
  viewer = 0;
  const token = generation;
  root.innerHTML = `<main class="c-intro"><section class="c-guide" aria-live="polite"><h1>Preparing your table</h1><p>Placing the cards and letting the ink dry…</p></section></main>`;
  busy = true;
  window.scrollTo(0, 0);
  try {
    await preloadCards(
      CARDS.filter((c) => state.dynasties.includes(c.dynasty)).map((c) => c.id),
    );
    if (token !== generation) return;
    busy = false;
    persist();
    await render();
    if (token === generation) window.scrollTo(0, 0);
  } catch {
    if (token !== generation) return;
    busy = false;
    notice =
      "The card artwork could not load. Check your connection and try again.";
    root.innerHTML = `<main class="c-intro"><section class="c-guide"><h1>The table is not ready yet</h1><p>${esc(notice)}</p>${btn("Retry loading", "retry")}${btn("Return to title", "home")}</section></main>`;
    bind();
  }
}
function actingSeat() {
  if (!game) return 0;
  if (lesson && !lesson.done) return TEACHING[lesson.cursor].seat;
  if (game.phase === "recall" || game.phase === "trade") {
    return (
      game.players.find(
        (p) => legalActions(viewForSeat(game!, p.seat), p.seat).length > 0,
      )?.seat ?? game.active
    );
  }
  return game.active;
}
function actions(): CoreAction[] {
  if (!game || privateLocked || lesson?.done) return [];
  const available = legalActions(viewForSeat(game, viewer), viewer);
  return lesson
    ? available.filter((action) => isTeachingAction(action, lesson!.cursor))
    : available;
}
function describe(action: CoreAction): string {
  const card = action.card ? nameOf(action.card) : "";
  const target = action.target ? nameOf(action.target) : "";
  switch (action.type) {
    case "recruit":
      return `${card} leaves your hand and joins your Court. You cannot use this person as a hidden answer while they are on the table.`;
    case "recall":
      return `Play ${card} to take ${target}. Its controller may answer with a higher same-Dynasty card, or an Ace against J, Q or K. If undefended, you gain ${target} and give them ${card}. Both enter their new owners’ Played areas until next round.`;
    case "defend":
      return `Commit ${card} to Played until next round. The threatened person stays on the table.`;
    case "name-heir":
      return `${card} becomes your heir; ${nameOf(action.supporter!)} is the named supporter. Keep the ruler, heir and supporter until next round. Then keep the new ruler and supporter for that whole round.`;
    case "marry-heir":
      return `${card} marries ${nameOf(action.supporter!)} and becomes your heir. Keep the linked pair throughout the succession.`;
    case "trade":
      return `Offer ${card} to ${names[action.other!] ?? "the rival"} for ${nameOf(action.request!)}. Choose from their face-up Played pile; they may accept or refuse.${action.recruit ? " If accepted, recruit the lower native card immediately." : " If accepted, both cards enter their new owners’ Played areas until next round."}`;
    case "accept":
      return game?.pending
        ? `Give ${nameOf(game.pending.request!)} and receive ${nameOf(game.pending.card)}. The cards move to Played until next round${game.pending.recruit ? ", except the rival recruits your lower card immediately" : ""}. This completes the binding exchange.`
        : "The offer has ended.";
    case "decline":
      return game?.phase === "trade"
        ? "Keep your Played card. The offer counts as a Pass."
        : `Let the threatened person go and receive ${nameOf(game!.pending!.card)} in exchange. Both cards enter their new owners’ Played areas until next round. Required Crown or marriage relationships break immediately.`;
    default:
      return "Keep your remaining cards. You may act later if another player plays a card. Everyone passing consecutively ends the round.";
  }
}
function objective(): string {
  if (!game) return "";
  if (game.result)
    return game.result.winner === null
      ? "No succession secured the Crown within 12 rounds."
      : `${names[game.result.winner]} kept the new ruler and supporter through a full round.`;
  const crown = game.crown;
  if (!crown)
    return "Build a ruler and supporter, then play an heir to claim the Crown.";
  if (crown.stage === "notice")
    return `Crown claimed by ${names[crown.seat]}. ${nameOf(crown.heir)} succeeds next round; ${nameOf(crown.supporter)} must remain.`;
  return `${names[crown.seat]} ${names[crown.seat] === "You" ? "win" : "wins"} at this round’s end if ${nameOf(crown.heir)} and ${nameOf(crown.supporter)} both remain.`;
}
async function render() {
  if (!game || busy) return;
  const renderToken = ++renderSequence;
  const loadToken = generation;
  stopTimer();
  const actor = actingSeat();
  if (mode === "local" && privateLocked && !game.result) {
    table?.dispose();
    table = null;
    root.innerHTML = `<main class="c-intro"><section class="c-guide"><p class="c-kicker">PRIVATE HANDOFF</p><h1>Pass the device to ${esc(names[actor])}</h1><p>Only that player should uncover their hand.</p>${btn("I am ready · reveal my hand", "unlock", 'class="primary"')}</section></main>`;
    bind();
    return;
  }
  if (mode !== "local") viewer = 0;
  const available = actions();
  const player = game.players[viewer];
  const taught = lesson ? TEACHING[lesson.cursor] : null;
  const humanTurn =
    actor === viewer && (!lesson || taught?.seat === viewer) && !game.result;
  const seatView = viewForSeat(game, viewer);
  const hand = player.hand;
  const selectedActions = available.filter(
    (a) => a.card === selected && a.type !== "pass",
  );
  const generic = available.filter((a) => !a.card);
  const autoPass =
    humanTurn &&
    hand.length === 0 &&
    game.phase === "action" &&
    generic.some((a) => a.type === "pass");
  const pendingDescription = game.pending
    ? game.pending.type === "trade"
      ? `Offer from ${names[game.pending.seat]}: ${nameOf(game.pending.card)} for ${nameOf(game.pending.request!)} in ${names[game.pending.other]}’s Played pile.${game.pending.recruit ? " On acceptance, the lower native card joins the rival’s Court." : " Accept to exchange them in Played until next round."}`
      : `${names[game.pending.seat]} uses ${nameOf(game.pending.card)} (rank ${BY_ID[game.pending.card].rank}) to Recall ${nameOf(game.pending.target!)}. Defend with a higher card of that Dynasty, or an Ace against J, Q or K. Let the person go to receive the attacking card in exchange next round.`
    : "";
  const currentGuide = lesson
    ? lesson.done
      ? taught!.outcome
      : taught!.explanation
    : selectedActions.length === 1
      ? describe(selectedActions[0])
      : (autoPass
          ? "Your hand is empty. Passing automatically in 2 seconds."
          : "") ||
        pendingDescription ||
        outcome ||
        (hand.length
          ? "Choose a card from your hand to see what that person can do. Keep a useful rank hidden if you expect to defend."
          : `Your hand is empty. Pass to give the next player an opportunity. Played cards return next round.${game.deck.length ? " Each player then draws one card while the deck has cards." : " The draw pile is empty; no new cards will be drawn."}`);
  const tableHost = root.querySelector<HTMLElement>("#core-table");
  const retained = tableHost?.parentElement ? tableHost : null;
  if (retained) retained.remove();
  const handHTML = hand
    .map((id, index) => {
      const enabled = humanTurn && available.some((a) => a.card === id);
      const angle =
        hand.length < 2 ? 0 : (index / (hand.length - 1) - 0.5) * 14;
      return `<div tabindex="0" aria-label="${esc(nameOf(id))}" class="c-held-card ${selected === id ? "selected" : ""} ${lesson && enabled ? "next-interaction" : ""}" style="--card-index:${index};--fan-angle:${angle}deg"><button class="c-card-pick" data-do="select" data-card="${id}" ${!enabled ? "disabled" : ""} aria-label="Select ${esc(nameOf(id))}, ${BY_ID[id].rank} ${esc(dynastyName(BY_ID[id].dynasty))}">${faceHTML(id)}</button>${`<div class="c-card-actions" aria-label="Actions for ${esc(nameOf(id))}">${renderCardActions(id, enabled ? available.filter((a) => a.card === id) : [])}${!lesson ? btn("Inspect", "inspect", `data-card="${id}"`) : ""}</div>`}</div>`;
    })
    .join("");
  root.innerHTML = `<main class="c-game c-tabletop ${lesson ? "c-teaching-table" : ""} ${hand.length ? "has-hand" : ""}">
    <header><strong>Round ${game.round} of 12</strong><p class="c-objective">${esc(objective())}</p>${lesson ? btn("Exit tutorial", "exit") : btn("Table menu", "menu")}</header>
    <section class="c-guide" aria-label="Action and outcome"><h2 class="sr-only">${esc(lesson ? taught!.title : game.result ? "The game has ended" : selected ? nameOf(selected) : "Your choices")}</h2>${lesson || selected || game.pending || outcome || autoPass ? `<p>${esc(currentGuide)}</p>` : ""}${notice ? `<p class="c-error" role="alert">${esc(notice)}</p>` : ""}<div class="c-action-area">${lesson?.done && lesson.cursor === TEACHING.length - 1 ? btn("Finish lesson", "finish", 'class="primary"') : ""}${lesson?.done && lesson.cursor < TEACHING.length - 1 ? btn("Continue", "continue", 'class="primary"') : ""}${lesson && !lesson.done && taught!.seat !== viewer ? btn("Watch the rival move", "watch", 'class="primary next-interaction"') : ""}${!lesson?.done && humanTurn ? `${generic.map((a, i) => btn(a.type === "decline" && game!.phase === "trade" ? "Decline trade" : a.type === "pass" && autoPass ? "<span>Pass</span>" : label[a.type], "generic", `data-index="${i}" class="${lesson ? "next-interaction" : ""} ${a.type === "pass" && autoPass ? "c-auto-pass" : ""}"`)).join("")}` : ""}${game.result && !lesson ? btn("Play another game", "setup", 'class="primary"') : ""}</div></section>
    <section class="c-board-wrap" aria-label="Physical game table"><div class="c-table-nav">${btn("Table", "focus-all", 'aria-label="Whole table"')}${!lesson ? game.players.map((p) => btn(esc(names[p.seat]), "focus", `data-seat="${p.seat}"`)).join("") : ""}</div><div id="core-table"></div></section>
    <section class="c-hand" aria-label="Your hand" style="--hand-count:${hand.length}"><div class="c-hand-cards">${handHTML}</div></section></main>`;
  const freshHost = root.querySelector<HTMLElement>("#core-table")!;
  if (retained && table) freshHost.replaceWith(retained);
  else {
    table?.dispose();
    try {
      table = new CoreTable(freshHost, (id) => {
        if (!lesson) {
          const seat = game!.players.findIndex((p) => p.played.includes(id));
          if (seat >= 0) playedPile(seat);
          else inspect(id);
        }
      });
    } catch {
      table = null;
    }
  }
  if (table) {
    table.setReducedMotion(!motion);
    await table.update({
      ...seatView,
      players: seatView.players.map((p) => ({ ...p, name: names[p.seat] })),
    });
    if (loadToken !== generation || renderToken !== renderSequence) return;
    table.setInteractive(!lesson);
  } else {
    freshHost.className = "c-basic-table";
    freshHost.innerHTML = `<p>Basic table view · 3D is unavailable on this browser</p>${seatView.players.map((p) => `<section><h2>${esc(names[p.seat])}</h2><p>${p.handCount} concealed cards · Played: ${p.played.map(nameOf).map(esc).join(", ") || "none"} · returns next round</p><div>${p.court.map((id) => `<figure>${faceHTML(id)}<figcaption>${esc(nameOf(id))}${id === p.ruler ? " · ruler" : ""}${game!.crown?.heir === id ? " · heir" : ""}${game!.crown?.supporter === id ? " · supporter" : ""}</figcaption></figure>`).join("")}</div></section>`).join("")}`;
    root.querySelector(".c-table-nav")!.innerHTML = "";
  }
  bind();
  showTargets();
  if (autoPass && !document.hidden && !document.querySelector("dialog[open]")) {
    const button = root.querySelector<HTMLButtonElement>(".c-auto-pass");
    const revision = game.revision;
    button?.classList.toggle("reduced-countdown", !motion);
    button?.classList.add("is-draining");
    timer = setTimeout(() => {
      if (
        !game ||
        game.revision !== revision ||
        busy ||
        privateLocked ||
        document.hidden ||
        document.querySelector("dialog[open]") ||
        !button?.isConnected
      )
        return;
      button.click();
    }, 2000);
  }
  if (!game.result && !lesson && mode !== "local" && actor !== viewer) {
    const revision = game.revision;
    timer = setTimeout(() => {
      if (!game || game.revision !== revision || busy) return;
      const action = chooseAction(viewForSeat(game, actor), actor).action;
      if (!action) {
        notice = "The next move could not be prepared. Your game is saved.";
        void render();
        return;
      }
      void commit(action);
    }, 1300);
  }
}
function renderCardActions(id: string, list: CoreAction[]): string {
  const kinds = [...new Set(list.map((a) => `${a.type}:${!!a.recruit}`))];
  return kinds
    .map((key) => {
      const a = list.find((a) => `${a.type}:${!!a.recruit}` === key)!;
      return btn(
        a.type === "trade" && a.recruit ? "Trade & recruit" : label[a.type],
        "arm",
        `data-card="${id}" data-type="${a.type}" data-recruit="${!!a.recruit}" class="primary"`,
      );
    })
    .join("");
}
function armedActions() {
  return armed
    ? actions().filter(
        (a) =>
          a.card === armed!.card &&
          a.type === armed!.type &&
          !!a.recruit === armed!.recruit,
      )
    : [];
}
function targetId(a: CoreAction) {
  return (
    a.target ??
    a.supporter ??
    a.request ??
    (a.type === "defend" ? game?.pending?.card : undefined)
  );
}
function actionAt(element: Element | null) {
  const target = element?.closest<HTMLElement>(
    "[data-table-card],[data-court-seat],[data-drop-card]",
  );
  if (!target || !game) return;
  const id = target.dataset.dropCard ?? target.dataset.tableCard;
  return armedActions().find((a) =>
    a.type === "recruit"
      ? target.dataset.courtSeat === String(viewer) ||
        (!!id && game!.players[viewer].court.includes(id))
      : targetId(a) === id,
  );
}
function showTargets() {
  const choices = armedActions();
  root
    .querySelectorAll(".c-held-card")
    .forEach((el) =>
      el.classList.toggle(
        "selected",
        !!armed &&
          el.querySelector<HTMLElement>("[data-card]")?.dataset.card ===
            armed.card,
      ),
    );
  table?.setDropTargets(
    choices.flatMap((a) =>
      a.type === "recruit"
        ? game!.players[viewer].court
        : targetId(a)
          ? [targetId(a)!]
          : [],
    ),
    choices.some((a) => a.type === "recruit") ? viewer : null,
  );
  root.querySelector(".c-target-fan")?.remove();
  if (armed?.type === "trade") {
    const ids = [...new Set(choices.map((a) => a.request!))];
    const tray = document.createElement("div");
    tray.className = "c-target-fan";
    tray.setAttribute("aria-label", "Valid Played trade targets");
    tray.innerHTML = ids
      .map(
        (id) =>
          `<button data-drop-card="${id}" aria-label="Trade for ${esc(nameOf(id))}">${faceHTML(id)}</button>`,
      )
      .join("");
    root.querySelector(".c-board-wrap")?.append(tray);
  }
  root.querySelector(".c-drag-hint")?.remove();
  if (armed) {
    const hint = document.createElement("p");
    hint.className = "c-drag-hint";
    hint.setAttribute("role", "status");
    hint.textContent = `${label[armed.type as CoreAction["type"]]}: drag ${nameOf(armed.card)} to a highlighted ${armed.type === "recruit" ? "Court" : "card"}.`;
    root.querySelector(".c-hand")?.prepend(hint);
  }
}
root.addEventListener(
  "click",
  (event) => {
    if (!armed) return;
    const candidate = actionAt(event.target as Element);
    if (candidate) {
      event.preventDefault();
      event.stopImmediatePropagation();
      void commit(candidate);
    }
  },
  true,
);
root.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      armed = null;
      selected = null;
      showTargets();
    }
    if ((event.key === "Enter" || event.key === " ") && armed) {
      const candidate = actionAt(event.target as Element);
      if (candidate) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void commit(candidate);
      }
    }
  },
  true,
);
root.addEventListener("pointerdown", (event) => {
  const card = (event.target as Element).closest<HTMLElement>(".c-card-pick");
  if (!armed || card?.dataset.card !== armed.card || event.button !== 0) return;
  event.preventDefault();
  const ghost = document.createElement("div");
  ghost.className = "c-drag-card";
  ghost.innerHTML = card.innerHTML;
  document.body.append(ghost);
  ghost.style.left = `${event.clientX}px`;
  ghost.style.top = `${event.clientY}px`;
  drag = {
    pointer: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    moved: false,
    ghost,
  };
  card.setPointerCapture(event.pointerId);
});
root.addEventListener("pointermove", (event) => {
  if (!drag || drag.pointer !== event.pointerId) return;
  drag.moved ||= Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5;
  drag.ghost.style.left = `${event.clientX}px`;
  drag.ghost.style.top = `${event.clientY}px`;
  drag.ghost.classList.toggle(
    "can-drop",
    !!actionAt(document.elementFromPoint(event.clientX, event.clientY)),
  );
});
root.addEventListener("pointerup", (event) => {
  if (!drag || drag.pointer !== event.pointerId) return;
  const candidate = drag.moved
    ? actionAt(document.elementFromPoint(event.clientX, event.clientY))
    : undefined;
  drag.ghost.remove();
  drag = null;
  if (candidate) void commit(candidate);
});
root.addEventListener("pointercancel", () => {
  drag?.ghost.remove();
  drag = null;
});
async function commit(action: CoreAction) {
  if (
    !game ||
    busy ||
    (lesson && (!isTeachingAction(action, lesson.cursor) || lesson.done))
  )
    return;
  try {
    game = applyAction(game, action);
    notice = "";
    selected = null;
    armed = null;
    outcome = game.events.at(-1) ?? describe(action);
    if (lesson) lesson = { ...lesson, done: true };
    if (mode === "local") privateLocked = true;
    persist();
    await render();
  } catch (error) {
    notice =
      error instanceof Error
        ? error.message
        : "That move is no longer available.";
    await render();
  }
}
function modal(html: string) {
  stopTimer();
  const token = generation;
  document.querySelector("dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = "c-modal";
  dialog.innerHTML = `${btn("Close", "close", 'class="c-close"')}${html}`;
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener("close", () => {
    const wasConnected = dialog.isConnected;
    dialog.remove();
    table?.setReducedMotion(!motion);
    if (
      wasConnected &&
      game &&
      !busy &&
      token === generation &&
      (game.players[viewer].hand.length === 0 ||
        (!lesson && mode !== "local" && actingSeat() !== viewer))
    )
      void render();
  });
  bind(dialog);
  const file = dialog.querySelector<HTMLInputElement>("#save-file");
  file?.addEventListener("change", async () => {
    try {
      const incoming = decodeSave(await file.files![0].text());
      names = incoming.names;
      motion = incoming.motion;
      dialog.remove();
      await start(incoming.game, incoming.mode, incoming.lesson);
    } catch (error) {
      dialog.insertAdjacentHTML(
        "beforeend",
        `<p role="alert">${esc(error instanceof Error ? error.message : "Could not read this file.")}</p>`,
      );
    }
  });
}
function marriageHint(id: string): string {
  if (
    !game ||
    !game.players[viewer].hand.includes(id) ||
    BY_ID[id].dynasty === game.players[viewer].dynasty
  )
    return "";
  const player = game.players[viewer];
  let hint: string;
  if (game.result) hint = "The game has ended.";
  else if (game.phase !== "action" || game.active !== viewer)
    hint = "Marriage is available on your turn.";
  else if (game.crown) hint = "Marriage needs an unclaimed Crown.";
  else if (!player.ruler || BY_ID[player.ruler].dynasty !== player.dynasty)
    hint = "Marriage needs a ruler from your Dynasty.";
  else {
    const queens = player.court.filter(
      (queen) =>
        queen !== player.ruler &&
        BY_ID[queen].dynasty === player.dynasty &&
        BY_ID[queen].queen &&
        !game!.marriages.some(
          (link) => link.queen === queen || link.spouse === queen,
        ),
    );
    const matches = queens.filter(
      (queen) => Math.abs(BY_ID[queen].rank - BY_ID[id].rank) <= 1,
    );
    hint = matches.length
      ? `Can marry ${matches.map(nameOf).join(" or ")} and become your heir.`
      : queens.length
        ? `Needs a Queen of your Dynasty with rank ${[
            BY_ID[id].rank - 1,
            BY_ID[id].rank,
            BY_ID[id].rank + 1,
          ]
            .filter((rank) => rank >= 1 && rank <= 13)
            .map((rank) =>
              rank === 1
                ? "A"
                : rank === 11
                  ? "J"
                  : rank === 12
                    ? "Q"
                    : rank === 13
                      ? "K"
                      : rank,
            )
            .join(", ")}.`
        : "First recruit an unpaired Queen of your Dynasty beside your ruler.";
  }
  return `<p class="c-marriage-hint">Foreign cards enter Court through marriage. ${esc(hint)}</p>`;
}
function playedPile(seat: number) {
  const pile = game?.players[seat]?.played;
  if (!pile) return;
  modal(
    `<h2>${esc(names[seat])} · Played pile</h2><p>${pile.length} face-up cards · Returns next round. Select a card to examine it.</p><div class="c-played-fan" aria-label="Played cards">${pile.map((id, i) => `<button data-do="inspect-played" data-card="${id}" data-seat="${seat}" style="--fan-angle:${Math.max(-5, Math.min(5, (i - (pile.length - 1) / 2) * 2))}deg" aria-label="Inspect ${esc(nameOf(id))}">${faceHTML(id, { reference: true })}</button>`).join("")}</div>`,
  );
}
function inspect(id: string, pileSeat?: number) {
  const back =
    pileSeat === undefined
      ? ""
      : btn("Back to Played pile", "played-pile", `data-seat="${pileSeat}"`);
  modal(
    `<h2>${esc(nameOf(id))}</h2>${back}${marriageHint(id)}<div class="c-inspection-card">${faceHTML(id, { reference: true })}</div><p>Printed rank ${BY_ID[id].rank} · ${esc(dynastyName(BY_ID[id].dynasty))}${BY_ID[id].queen ? " · Queen role" : ""}</p><p>A native card can join your Court or become an heir. Recall matches the target’s Dynasty; defense compares lead and answer. An undefended Recall exchanges the lead for the target. Both go to their new owners’ Played areas until next round.</p>${btn("Reference rules", "rules")}`,
  );
}
function rules() {
  modal(
    `<h2>Core reference rules</h2><p>These shared rule cards accompany the character faces. Each topic has a numbered reference; longer topics continue on a second card.</p>${referenceAidsHTML()}`,
  );
}
function menu() {
  modal(
    `<h2>Your table</h2><p>${esc(objective())}</p><p>Play cards to develop your Court, Recall a rival’s person or offer a Trade for a rival’s face-up Played card. A played card is unavailable until next round. Defend with a higher same-Dynasty card; an Ace also answers J, Q or K.</p><p>Claim with a ruler, an existing native supporter and a new native heir. Or marry a equal- or neighboring-rank foreign heir to an existing native Queen. Keep the required people through transfer and the entire following round.</p><p>Everyone passing consecutively ends a round. Played cards return, then each player draws one new card. No deck reshuffle. The prototype ends as a draw after 12 rounds without a winner.</p>${btn("Reference rules", "rules")}${btn(motion ? "Reduce motion" : "Enable motion", "motion")}${btn("Export private save", "export")}${btn("Return to title", "home")}<p class="c-subtle">Private saves include all hands. Share only with people allowed to see them.</p>`,
  );
}
function bind(scope: ParentNode = root) {
  scope.querySelectorAll<HTMLElement>(".c-held-card").forEach((card) => {
    const place = () => {
      const menu = card.querySelector<HTMLElement>(".c-card-actions");
      if (!menu) return;
      menu.style.marginLeft = "0px";
      requestAnimationFrame(() => {
        const rect = menu.getBoundingClientRect();
        menu.style.marginLeft = `${Math.max(0, 12 - rect.left) - Math.max(0, rect.right - innerWidth + 12)}px`;
      });
    };
    card.addEventListener("pointerenter", place);
    card.addEventListener("focusin", place);
    card.addEventListener("transitionend", place);
  });
  scope.querySelectorAll<HTMLButtonElement>("[data-do]").forEach(
    (el) =>
      (el.onclick = async () => {
        if (!el.isConnected) return;
        const action = el.dataset.do!;
        if (action === "home") {
          await home();
          return;
        }
        if (action === "intro") {
          intro();
          return;
        }
        if (action === "setup") {
          setup();
          return;
        }
        if (action === "close") {
          el.closest("dialog")?.close();
          return;
        }
        if (action === "exit") {
          persist();
          await home();
          return;
        }
        if (action === "teach") {
          names = ["You", "Plantagenet rival"];
          await start(createTutorial(), "tutorial", { cursor: 0, done: false });
          return;
        }
        if (action === "retry" && game) {
          await start(game, mode, lesson);
          return;
        }
        if (action === "resume" && saved) {
          names = saved.names;
          motion = saved.motion;
          await start(saved.game, saved.mode, saved.lesson);
          return;
        }
        if (action === "begin") {
          const count = Number(
            document.querySelector<HTMLSelectElement>("#players")!.value,
          );
          const seed = Number(
            document.querySelector<HTMLInputElement>("#seed")!.value,
          );
          const nextMode = document.querySelector<HTMLSelectElement>("#mode")!
            .value as "solo" | "local";
          const ownDynasty = document.querySelector<HTMLSelectElement>(
            "#dynasty",
          )!.value as CoreState["dynasties"][number];
          const dynasties = [
            ownDynasty,
            ...(
              [
                "alba",
                "plantagenet",
                "tudor",
                "habsburg",
              ] as CoreState["dynasties"]
            ).filter((d) => d !== ownDynasty),
          ].slice(0, count);
          names = [
            document
              .querySelector<HTMLInputElement>("#player-name")!
              .value.trim() || "You",
            ...dynasties.slice(1).map((d) => `${dynastyName(d)} rival`),
          ].slice(0, count);
          if (!Number.isInteger(seed) || seed < 1 || seed > 999999) {
            document.querySelector<HTMLInputElement>("#seed")!.reportValidity();
            return;
          }
          await start(
            createGame({
              seed,
              dynasties,
            }),
            nextMode,
          );
          return;
        }
        if (!game) return;
        if (action === "unlock") {
          viewer = actingSeat();
          privateLocked = false;
          await render();
          return;
        }
        if (action === "continue" && lesson?.done) {
          lesson = { cursor: lesson.cursor + 1, done: false };
          outcome = "";
          persist();
          await render();
          return;
        }
        if (
          action === "watch" &&
          lesson &&
          !lesson.done &&
          TEACHING[lesson.cursor].seat !== viewer
        ) {
          const seat = TEACHING[lesson.cursor].seat;
          const taughtAction = legalActions(viewForSeat(game, seat), seat).find(
            (a) => isTeachingAction(a, lesson!.cursor),
          );
          if (taughtAction) await commit(taughtAction);
          return;
        }
        if (action === "finish") {
          modal(
            `<h2>What do you think this game is about?</h2><p>Before starting a new game, try saying how you win, what ends a round and why you might keep a card instead of playing it.</p><p>The next game uses an ordinary deal and computer rivals. You choose your own moves.</p>${btn("Start an ordinary game", "setup", 'class="primary"')}${btn("Return to title", "home")}`,
          );
          return;
        }
        if (action === "focus-all") {
          table?.focus(null);
          return;
        }
        if (action === "focus") {
          table?.focus(Number(el.dataset.seat));
          return;
        }
        if (action === "menu") {
          menu();
          return;
        }
        if (action === "rules") {
          rules();
          return;
        }
        if (action === "inspect") {
          inspect(el.dataset.card!);
          return;
        }
        if (action === "inspect-played") {
          inspect(el.dataset.card!, Number(el.dataset.seat));
          return;
        }
        if (action === "played-pile") {
          playedPile(Number(el.dataset.seat));
          return;
        }
        if (action === "motion") {
          motion = !motion;
          persist();
          el.closest("dialog")?.close();
          return;
        }
        if (action === "export" && saved) {
          const url = URL.createObjectURL(
            new Blob([encodeSave(saved)], { type: "application/json" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "overlords-outlaws-core-private-save.json";
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
        if (action === "select") {
          selected = el.dataset.card!;
          root
            .querySelectorAll(".c-held-card")
            .forEach((card) =>
              card.classList.toggle("selected", card.contains(el)),
            );
          return;
        }
        if (action === "arm") {
          selected = el.dataset.card!;
          armed = {
            card: selected,
            type: el.dataset.type!,
            recruit: el.dataset.recruit === "true",
          };
          showTargets();
          return;
        }
        if (action === "generic") {
          const candidate = actions().filter((a) => !a.card)[
            Number(el.dataset.index)
          ];
          if (candidate) await commit(candidate);
          return;
        }
        await render();
      }),
  );
}

function updateViewport() {
  const viewport = window.visualViewport;
  document.documentElement.style.setProperty(
    "--core-viewport-height",
    `${viewport?.height ?? innerHeight}px`,
  );
  const focused = document.activeElement;
  if (
    focused instanceof HTMLInputElement ||
    focused instanceof HTMLSelectElement
  )
    focused.scrollIntoView({ block: "nearest" });
}
window.visualViewport?.addEventListener("resize", updateViewport);
window.addEventListener("resize", updateViewport);
updateViewport();
void home();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopTimer();
  else if (game && !busy && !document.querySelector("dialog[open]"))
    void render();
});
