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
import { CARDS, BY_ID, DYNASTIES } from "./content";
import { chooseAction, chooseDraftPacket } from "./ai";
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
let shownLesson: string | null = null;
let motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let viewer = 0;
let handSort: 'dynasty' | 'rank' = 'dynasty';
try { if(localStorage.getItem(`${namespace}hand-sort`)==='rank') handSort='rank'; } catch { /* Storage is optional. */ }
function compareHand(a:string,b:string) {
 const rank=BY_ID[a].rank-BY_ID[b].rank;
 const dynasty=DYNASTIES.indexOf(BY_ID[a].dynasty)-DYNASTIES.indexOf(BY_ID[b].dynasty);
 return handSort==='dynasty' ? dynasty||rank : rank||dynasty;
}
let privateLocked = false;
let draftPacket: string[] = [];
let computerDraftKey="";
let computerDraftPackets: Record<number,string[]> = {};
let selected: string | null = null;
let armed: { card: string; type: string; recruit: boolean } | null = null;
let drag: {
  pointer: number;
  x: number;
  y: number;
  moved: boolean;
  previousArmed: {card:string;type:string;recruit:boolean} | null;
  ghost: HTMLElement;
} | null = null;
let table: CoreTable | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let generation = 0;
let renderSequence = 0;
let busy = false;
let suppressCardClick = false;
let responseObserver: ResizeObserver | null = null;
let notice = loaded.error ?? "";
let outcome = "";
const dynastyName = (name: string) => name[0].toUpperCase() + name.slice(1);
const nameOf = (id: string) => BY_ID[id]?.name ?? id;
const label: Record<string, string> = {
  withdraw: "Recall",
  "draft-pick": "Pass clockwise", "declare-pick": "Declare", repair: "Set aside",
  recruit: "Recruit",
  recall: "Challenge",
  defend: "Defend",
  trade: "Trade",
  "name-heir": "Claim",
  "marry-heir": "Marry",
  accept: "Accept",
  decline: "Retreat",
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
  responseObserver?.disconnect();
  draftPacket = [];
  computerDraftKey=""; computerDraftPackets={};
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
  root.innerHTML = `<main class="c-intro"><section class="c-guide"><p class="c-kicker">LEARN AT THE TABLE</p><h1>Keep the Crown in your family.</h1><p class="c-intro-goal">Claim the Crown, pass it to an heir, then keep your new ruler and their supporter on the table for one full round.</p><p>We’ll teach each move at the table. A supporter is another person in your family’s Court—the cards you can all see.</p><p>Begin with eight cards and no Dynasty. Pass three, two, then one clockwise. Play three matching Nobles to establish your Dynasty and Court; the first you choose is your ruler.</p><p>First, we’ll show one useful move and explain why it helps. Playing a card uses it for this round; keeping it may let you answer a rival.</p>${btn("Take your seat", "teach", 'class="primary"')}${btn("Return to title", "home")}</section></main>`;
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
    `<h2>Set a core table</h2><p>Build a family, claim the Crown and protect the succession. This prototype ends after 12 rounds if no succession wins.</p><label>Players<select id="players"><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label><label>Table<select id="mode"><option value="solo">You and computer rivals</option><option value="local">Shared device · private handoffs</option></select></label><fieldset class="c-pool"><legend>Dynasties in the shared deck</legend>${["alba","plantagenet","tudor","habsburg"].map((d,i)=>`<label><input type="checkbox" name="pool" value="${d}" ${i<2?"checked":""}>${dynastyName(d)}</label>`).join("")}</fieldset><label>Your name<input id="player-name" autocomplete="off" maxlength="40" value="You"></label><label>Deal number<input id="seed" type="number" inputmode="numeric" min="1" max="999999" value="${Math.floor(Date.now() % 999999) + 1}"></label><p>The shared deck uses one thirteen-card Dynasty set per player. The draft determines your Dynasty; players may declare the same Dynasty. Deal eight, pass 3–2–1, then play three matching Nobles. Five remain in hand.</p>${btn("Begin game", "begin", 'class="primary"')}<label class="c-file">Import a core save<input type="file" id="save-file" accept="application/json,.json"></label>`,
  );
  document.querySelector('#players')!.addEventListener('change',event=>{
    const count=Number((event.target as HTMLSelectElement).value);
    document.querySelectorAll<HTMLInputElement>('[name="pool"]').forEach((el,i)=>el.checked=i<count);
  });
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
  shownLesson = null;
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
    ? available.filter((action) => (game!.phase === "recall" && action.type === "decline") || isTeachingAction(action, lesson!.cursor + (game!.phase === "draft" ? draftPacket.length : 0)))
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
        : `Retreat: let the challenged person go and receive ${nameOf(game!.pending!.card)} in exchange. Both cards enter their new owners’ Played areas until next round. Required Crown or marriage relationships break immediately.`;
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
  if (game.setup) return game.phase === 'draft' ? `Inheritance · pass ${game.setup.pass} clockwise` : 'Play three matching Nobles to establish your Dynasty';
  const crown = game.crown;
  if (!crown)
    return game.players[viewer].ruler && game.players[viewer].court.length >= 2 ? "Play an heir with a Court supporter to claim the Crown." : "Build a ruler and supporter, then play an heir to claim the Crown.";
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
  if(game.phase==='draft' && mode!=='local') {
    const key=JSON.stringify([game.setup!.pass,game.players.map(p=>p.hand)]);
    if(key!==computerDraftKey) {
      computerDraftKey=key;
      computerDraftPackets=Object.fromEntries(game.players.filter(p=>p.seat!==viewer).map(p=>[p.seat,
        lesson ? TEACHING.slice(lesson.cursor).filter(a=>a.type==='draft-pick'&&a.seat===p.seat).slice(0,game!.setup!.pass).map(a=>a.card!) : chooseDraftPacket(viewForSeat(game!,p.seat))]));
    }
  }
  const available = actions();
  const player = game.players[viewer];
  const taught = lesson ? TEACHING[lesson.cursor] : null;
  const humanTurn =
    actor === viewer && (!lesson || taught?.seat === viewer) && !game.result;
  const seatView = viewForSeat(game, viewer);
  const hand = [...player.hand].sort(compareHand);
  const selectedActions = available.filter(
    (a) => a.card === selected && a.type !== "pass",
  );
  const generic = available.filter((a) => !a.card);
  const autoPass =
    humanTurn &&
    hand.length === 0 &&
    !available.some(a => a.type === "withdraw") &&
    game.phase === "action" &&
    generic.some((a) => a.type === "pass");
  const responding = game.phase === "recall" && game.pending?.other === viewer;
  const pendingDescription = game.pending
    ? game.pending.type === "trade"
      ? `Offer from ${names[game.pending.seat]}: ${nameOf(game.pending.card)} for ${nameOf(game.pending.request!)} in ${names[game.pending.other]}’s Played pile.${game.pending.recruit ? " On acceptance, the lower native card joins the rival’s Court." : " Accept to exchange them in Played until next round."}`
      : `${names[game.pending.seat]} uses ${nameOf(game.pending.card)} (rank ${BY_ID[game.pending.card].rank}) to challenge ${nameOf(game.pending.target!)}. Defend with a higher card of that Dynasty, or an Ace against J, Q or K. Let the person go to receive the challenging card in exchange next round.`
    : "";
  const setupGuide = game.setup ? game.phase === 'draft'
    ? `Select ${game.setup.pass - (game.setup.picks[viewer]?.length ?? 0)} more to pass clockwise. Packets move together after everyone chooses. Keep a matching trio.`
    : game.phase === 'repair' ? 'No matching trio: your hand and the top draw are revealed. Select a different-Dynasty card to set aside.'
    : `Select ${3 - (game.setup.picks[viewer]?.length ?? 0)} matching Nobles. The first is your ruler. All Courts reveal together; five cards stay in hand.` : '';
  const currentGuide = setupGuide || (selectedActions.length === 1
      ? describe(selectedActions[0])
      : (autoPass
          ? "Your hand is empty. Passing automatically in 2 seconds."
          : "") ||
        pendingDescription ||
        outcome ||
        (hand.length
          ? "Choose a card from your hand to see what that person can do. Keep a useful rank hidden if you expect to defend."
          : `Your hand is empty. Pass to give the next player an opportunity. Played cards return next round.${game.deck.length ? " Each player then draws one card while the deck has cards." : " The draw pile is empty; no new cards will be drawn."}`));
  const tableHost = root.querySelector<HTMLElement>("#core-table");
  const retained = tableHost?.parentElement ? tableHost : null;
  if (retained) retained.remove();
  const handHTML = hand
    .map((id, index) => {
      const enabled = humanTurn && (draftPacket.includes(id) || available.some((a) => a.card === id));
      const angle =
        hand.length < 2 ? 0 : (index / (hand.length - 1) - 0.5) * 14;
      return `<div tabindex="0" aria-label="${esc(nameOf(id))}" class="c-held-card ${game!.setup?.picks[viewer]?.includes(id) ? "c-locked-pick" : ""} ${draftPacket.includes(id) ? "c-draft-selected" : ""} ${selected === id ? "selected" : ""} ${lesson && enabled && !draftPacket.includes(id) && (game!.phase !== "draft" || draftPacket.length < game!.setup!.pass) ? "next-interaction" : ""}" style="--card-index:${index};--fan-angle:${angle}deg"><button class="c-card-pick" data-do="select" data-card="${id}" ${!enabled ? "disabled" : ""} aria-pressed="${draftPacket.includes(id)}" aria-label="Select ${esc(nameOf(id))}, ${BY_ID[id].rank} ${esc(dynastyName(BY_ID[id].dynasty))}">${faceHTML(id)}</button>${`<div class="c-card-actions" aria-label="Actions for ${esc(nameOf(id))}">${responding ? renderCardActions(id, available.filter(a=>a.type==="defend"&&a.card===id)) : ""}${btn("Inspect", "inspect", `data-card="${id}"`)}</div>`}</div>`;
    })
    .join("");
  root.innerHTML = `<main class="c-game c-tabletop ${!motion ? "reduced-motion" : ""} ${lesson ? "c-teaching-table" : ""} ${hand.length ? "has-hand" : ""}">
    <header><strong>${game.setup ? "Inheritance" : `Round ${game.round} of 12`}</strong><p class="c-objective">${esc(objective())}</p>${btn("Table menu", "menu")}${lesson ? btn("?", "lesson-help", 'class="c-lesson-help" aria-label="Read tutorial step" title="Read tutorial step"') + btn("Exit tutorial", "exit") : ""}</header>
    <section class="c-guide" aria-label="Action and outcome">${game.phase === "draft" ? `<section class="c-draft-modal" role="dialog" aria-labelledby="draft-title"><div><h2 id="draft-title">All Players Select ${game.setup!.pass} ${game.setup!.pass === 1 ? "Card" : "Cards"} to pass</h2><p>Round ${4-game.setup!.pass} of 3 · Clockwise${lesson && humanTurn ? ` · ${draftPacket.length === game.setup!.pass ? "Press PASS" : `Select ${esc(nameOf(TEACHING[lesson.cursor + draftPacket.length].card!))}`}` : ""}</p></div>${btn(humanTurn ? (draftPacket.length + (game.setup!.picks[viewer]?.length ?? 0) === game.setup!.pass ? "PASS" : `Select ${game.setup!.pass - draftPacket.length - (game.setup!.picks[viewer]?.length ?? 0)} More to Pass`) : "Waiting for players…", "draft-pass", `class="primary ${draftPacket.length === game.setup!.pass ? "next-interaction" : ""}" ${!humanTurn || draftPacket.length + (game.setup!.picks[viewer]?.length ?? 0) !== game.setup!.pass ? "disabled" : ""}`)}</section>` : ""}<h2 class="sr-only">${esc(lesson ? taught!.title : game.result ? "The game has ended" : selected ? nameOf(selected) : "Your choices")}</h2>${!lesson && !responding && game.phase !== "draft" && (game.setup || selected || game.pending || outcome || autoPass) ? `<p>${esc(currentGuide)}</p>` : ""}${notice ? `<p class="c-error" role="alert">${esc(notice)}</p>` : ""}<div class="c-action-area"><div class="c-selected-actions"></div>${!lesson?.done && humanTurn && !responding ? `${generic.map((a, i) => btn(a.type === "decline" && game!.phase === "trade" ? "Decline" : a.type === "pass" && autoPass ? "<span>Pass</span>" : label[a.type], "generic", `data-index="${i}" class="${lesson ? "next-interaction" : ""} ${a.type === "pass" && autoPass ? "c-auto-pass" : ""}"`)).join("")}` : ""}${game.result && !lesson ? btn("Play another game", "setup", 'class="primary"') : ""}</div></section>
    <section class="c-board-wrap" aria-label="Physical game table"><div class="c-table-nav">${btn("Table", "focus-all", 'aria-label="Whole table"')}${game.players.map((p) => btn(esc(names[p.seat]), "focus", `data-seat="${p.seat}"`)).join("")}</div>${game.phase === "draft" ? `<div class="c-draft-hands">${game.players.filter(p=>p.seat!==viewer).sort((a,b)=>(a.seat-viewer+game!.players.length)%game!.players.length-(b.seat-viewer+game!.players.length)%game!.players.length).map(p=>`<div data-draft-hand="${p.seat}"><span>${esc(names[p.seat])}</span><div class="c-back-fan">${Array.from({length:p.hand.length},(_,i)=>`<i class="c-card-back" style="--i:${i}" aria-hidden="true"></i>`).join("")}</div><small>${p.hand.length} cards</small></div>`).join("")}</div>` : ""}<div id="core-table"></div></section>
    ${responding ? responseHTML() : ""}
    <section class="c-hand" aria-label="Your hand" style="--hand-count:${hand.length}"><div class="c-hand-cards">${handHTML}</div></section>${btn(`Sorted by ${handSort.toUpperCase()}`,"sort-hand",'class="c-hand-sort" aria-label="Change hand sort order"')}</main>`;
  const freshHost = root.querySelector<HTMLElement>("#core-table")!;
  if (retained && table) freshHost.replaceWith(retained);
  else {
    table?.dispose();
    try {
      table = new CoreTable(freshHost, (id) => {
        {
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
    table.setInteractive(true);
  } else {
    freshHost.className = "c-basic-table";
    freshHost.innerHTML = `<p>Basic table view · 3D is unavailable on this browser</p>${seatView.players.map((p) => `<section><h2>${esc(names[p.seat])}</h2><p>${p.handCount} concealed cards · Played: ${p.played.map(nameOf).map(esc).join(", ") || "none"} · returns next round</p><div>${p.court.map((id) => `<figure>${faceHTML(id)}<figcaption>${esc(nameOf(id))}${id === p.ruler ? " · ruler" : ""}${game!.crown?.heir === id ? " · heir" : ""}${game!.crown?.supporter === id ? " · supporter" : ""}</figcaption></figure>`).join("")}</div></section>`).join("")}`;
    root.querySelector(".c-table-nav")!.innerHTML = "";
  }
  bind();
  responseObserver?.disconnect();
  const response = root.querySelector<HTMLElement>('.c-response');
  if(response) {
    const sizeResponse = () => root.querySelector<HTMLElement>('.c-game')?.style.setProperty('--response-height', `${response.getBoundingClientRect().height}px`);
    sizeResponse(); responseObserver = new ResizeObserver(sizeResponse); responseObserver.observe(response);
  }
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
  if (lesson) {
    if (motion) await new Promise(resolve=>setTimeout(resolve,750));
    if (loadToken !== generation || renderToken !== renderSequence) return;
    const key = lessonKey();
    if(game.phase !== "draft" && TEACHING[lesson.cursor]?.type !== "decline" && shownLesson !== key && !document.querySelector('dialog[open]')) showLesson();
    else if(!lesson.done && actor !== viewer && !document.querySelector('dialog[open]')) {
      const revision=game.revision;
      timer=setTimeout(()=>{
        if(!game || game.revision!==revision || !lesson || document.querySelector('dialog[open]') || document.hidden) return;
        const action=legalActions(viewForSeat(game,actor),actor).find(a=>isTeachingAction(a,lesson!.cursor));
        if(action) void commit(action);
      },900);
    }
  }

}
function responseHTML() {
  const pending=game!.pending!;
  const noDefense=!legalActions(viewForSeat(game!,viewer),viewer).some(a=>a.type==='defend');
  const house=dynastyName(BY_ID[pending.target!].dynasty);
  const hasHouse=game!.players[viewer].hand.some(id=>BY_ID[id].dynasty===BY_ID[pending.target!].dynasty);
  const retreatHint=noDefense ? `${hasHouse ? `None of your available ${house} Nobles can defend your honor.` : `You have no Nobles of House ${house} to defend your honor.`} ${nameOf(pending.target!)} must retreat.` : `Defend ${nameOf(pending.target!)} and your Dynasty’s honor, or retreat to exchange these two Nobles.`;
  return `<section class="c-response" aria-labelledby="challenge-title"><div><h2 id="challenge-title">${esc(names[pending.seat])} Challenges with ${esc(nameOf(pending.card))}</h2><p id="challenge-response-hint">${esc(retreatHint)}</p></div><div class="c-response-actions">${btn('Defend','respond-defend','class="primary" disabled')}${btn('Retreat','respond-retreat',`aria-describedby="challenge-response-hint" class="${noDefense ? 'next-interaction' : ''}"`)}${btn('Inspect','response-inspect','class="c-response-inspect" disabled')}</div></section>`;
}
function updateResponse() {
  const button=root.querySelector<HTMLButtonElement>('[data-do="respond-defend"]');
  if(!button) return;
  button.disabled=!actions().some(a=>a.type==='defend'&&a.card===selected);
  button.classList.toggle('next-interaction',!button.disabled);
  const inspect=root.querySelector<HTMLButtonElement>('[data-do="response-inspect"]');
  if(inspect) inspect.disabled=!selected;
}
function renderCardActions(id: string, list: CoreAction[]): string {
  const kinds = [...new Set(list.map((a) => `${a.type}:${!!a.recruit}`))];
  return kinds
    .map((key) => {
      const a = list.find((a) => `${a.type}:${!!a.recruit}` === key)!;
      return btn(
        a.type === "trade" && a.recruit ? "Trade & recruit" : label[a.type],
        "arm",
        `data-card="${id}" data-type="${a.type}" data-recruit="${!!a.recruit}" class="primary ${lesson ? "next-interaction" : ""}"`,
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
  const choices = armedActions();
  if (choices.length === 1 && element?.closest('#core-table') && !element.closest('[data-do]')) return choices[0];
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
  root.querySelector(".c-game")?.classList.toggle("is-choosing-target", !!armed);
  const choices = armedActions();
  root.querySelector("#core-table")?.classList.toggle("single-action-drop", choices.length === 1);
  updateResponse();
  const actionHost=root.querySelector<HTMLElement>('.c-selected-actions');
  if(actionHost) {
    actionHost.innerHTML=selected&&!game?.setup&&game?.phase!=='recall' ? renderCardActions(selected,actions().filter(a=>a.card===selected))+btn('Inspect','inspect-selected') : '';
    bind(actionHost);
  }
  root
    .querySelectorAll(".c-held-card")
    .forEach((el) =>
      el.classList.toggle(
        "selected",
        el.querySelector<HTMLElement>("[data-card]")?.dataset.card === selected,
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
  if (armed && game?.phase !== "recall") {
    const hint = document.createElement("p");
    hint.className = "c-drag-hint";
    hint.setAttribute("role", "status");
    hint.textContent = choices.length === 1 ? `${label[armed.type]}: drop anywhere on the table.` : `${label[armed.type]}: choose a highlighted destination.`;
    root.querySelector(".c-guide")?.append(hint);
  }
}
root.addEventListener(
  "click",
  (event) => {
    if(suppressCardClick && (event.target as Element).closest('.c-card-pick')) { event.preventDefault(); event.stopImmediatePropagation(); return; }
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
document.addEventListener(
  "keydown",
  (event) => {
    const openDialog=document.querySelector<HTMLDialogElement>("dialog[open]");
    if(openDialog) { if(event.key==="Escape"&&openDialog.classList.contains("c-lesson-popover")) openDialog.close(); return; }
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
  const card = (event.target as Element).closest<HTMLButtonElement>(".c-card-pick");
  if (!card || card.disabled || busy || game?.setup || event.button !== 0) return;
  const previousArmed=armed;
  const candidates = armed?.card === card.dataset.card ? armedActions() : actions().filter(a=>a.card===card.dataset.card);
  if(candidates.length !== 1 && armed?.card !== card.dataset.card) return;
  if(candidates.length === 1) {
    const action=candidates[0];
    armed={card:action.card!,type:action.type,recruit:!!action.recruit};
  }
  selected=card.dataset.card!;
  const ghost=document.createElement('div'); ghost.className='c-drag-card'; ghost.innerHTML=card.innerHTML; ghost.hidden=true;
  document.body.append(ghost);
  drag={pointer:event.pointerId,x:event.clientX,y:event.clientY,moved:false,ghost,previousArmed};
  card.setPointerCapture(event.pointerId);
});
root.addEventListener("pointermove", (event) => {
  if (!drag || drag.pointer !== event.pointerId) return;
  const wasMoving=drag.moved;
  drag.moved ||= Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5;
  drag.ghost.hidden = !drag.moved;
  if(drag.moved && !wasMoving) showTargets();
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
  const moved=drag.moved, previousArmed=drag.previousArmed;
  drag.ghost.remove(); drag=null;
  if(moved) { suppressCardClick=true; setTimeout(()=>suppressCardClick=false,0); }
  armed=previousArmed;
  if (candidate) void commit(candidate);
  else showTargets();
});
root.addEventListener("pointercancel", () => {
  if(drag) armed=drag.previousArmed;
  drag?.ghost.remove();
  drag = null;
  showTargets();
});
async function commit(action: CoreAction, deferRender = false) {
  if (
    !game ||
    busy ||
    (lesson && !(action.type === "decline" && game.phase === "recall") && (!isTeachingAction(action, lesson.cursor) || lesson.done))
  )
    return;
  try {
    if(lesson && action.type === "decline" && game.phase === "recall" && !isTeachingAction(action,lesson.cursor)) lesson=null;
    const before = game;
    const next = applyAction(game, action);
    if (before.phase === "draft" && before.setup!.pass !== next.setup?.pass) {
      busy = true; stopTimer(); root.inert = true;
      try { await animateDraft(before.setup!.pass, before.players.length); }
      finally { busy = false; root.inert = false; }
    }
    game = next;
    notice = "";
    selected = null;
    armed = null;
    outcome = game.events.at(-1) ?? describe(action);
    if (lesson) lesson = lesson.cursor < TEACHING.length - 1
      ? { cursor: lesson.cursor + 1, done: false } : { ...lesson, done: true };
    if (mode === "local" && actingSeat() !== viewer) privateLocked = true;
    persist();
    if (!deferRender) await render();
  } catch (error) {
    notice =
      error instanceof Error
        ? error.message
        : "That move is no longer available.";
    await render();
  }
}
async function animateDraft(count: number, players: number) {
  const anchors = Array.from({length:players},(_,seat)=>root.querySelector<HTMLElement>(seat===viewer ? '.c-hand' : `[data-draft-hand="${seat}"]`)?.getBoundingClientRect());
  const layer=document.createElement('div'); layer.className='c-draft-flight'; layer.setAttribute('aria-label', `All players pass ${count} cards clockwise`); document.body.append(layer);
  const flights: Animation[]=[];
  for(let seat=0;seat<players;seat++) for(let i=0;i<count;i++) {
    const a=anchors[seat], b=anchors[(seat+1)%players]; if(!a||!b) continue;
    const card=document.createElement('i'); card.className='c-card-back'; card.dataset.from=String(seat);card.dataset.to=String((seat+1)%players);layer.append(card);
    const x=a.x+a.width/2-25+i*12, y=a.y+a.height/2-35;
    card.style.left=`${x}px`;card.style.top=`${y}px`;
    flights.push(card.animate([{transform:'translate(0,0) rotate(-8deg)',opacity:1},{transform:`translate(${(b.x+b.width/2-25+i*12-x)*.5}px,${(b.y+b.height/2-35-y)*.5-35}px) rotate(5deg)`,opacity:1},{transform:`translate(${b.x+b.width/2-25+i*12-x}px,${b.y+b.height/2-35-y}px) rotate(0deg)`,opacity:1}],{duration:motion?950:1,delay:motion?i*140:0,fill:'both',easing:'ease-in-out'}));
  }
  await Promise.all(flights.map(a=>a.finished.catch(()=>{}))); layer.remove();
}
// Court actions stay beside their physical source; inspection provides the touch path.
let courtMenuTimer: ReturnType<typeof setTimeout> | null = null;
function showCourtAction(event: Event) {
  const target=event.target as HTMLElement;
  const card=target.closest<HTMLElement>('[data-table-card]');
  if(!card || !game || lesson || privateLocked) return;
  const action=actions().find(a=>a.type==='withdraw'&&a.card===card.dataset.tableCard);
  if(!action) { root.querySelector('.c-court-actions')?.remove(); return; }
  root.querySelector('.c-court-actions')?.remove();
  const menu=document.createElement('div'); menu.className='c-court-actions';
  menu.innerHTML=btn('Recall','withdraw',`data-card="${action.card}"`);
  const place=()=>{
  if(!menu.isConnected || !card.isConnected) return;
  const rect=card.getBoundingClientRect();
  menu.style.left=`${Math.max(8,Math.min(innerWidth-230,rect.left))}px`;
  menu.style.top=`${Math.max(60,Math.min(innerHeight-52,rect.top-40))}px`;
  requestAnimationFrame(place);
  };
  menu.querySelector('button')!.addEventListener('click',()=>{ void commit(action); });
  root.append(menu); place();
}
root.addEventListener('pointerover', showCourtAction);
root.addEventListener('focusin', showCourtAction);
root.addEventListener('pointerout', event=>{
  if(courtMenuTimer) clearTimeout(courtMenuTimer);
  const next=event.relatedTarget as HTMLElement | null;
  if(next?.closest?.('[data-table-card],.c-court-actions')) return;
  courtMenuTimer=setTimeout(()=>{ if(!document.activeElement?.closest('[data-table-card],.c-court-actions')) root.querySelector('.c-court-actions')?.remove(); },200);
});
function lessonKey(): string {
  if(!lesson || !game) return '';
  return lesson.done ? `done:${lesson.cursor}` : game.setup
    ? `${game.phase}:${game.setup.pass}:${actingSeat()}` : `step:${lesson.cursor}`;
}
function showLesson() {
  if(!lesson || !game) return;
  shownLesson=lessonKey();
  const step=TEACHING[lesson.cursor];
  modal(`<section class="c-lesson-content" aria-labelledby="lesson-title"><p class="c-kicker">LEARN AT THE TABLE</p><h2 id="lesson-title">${esc(step.title)}</h2>${step.card && !lesson.done ? `<div class="c-lesson-preview">${faceHTML(step.card)}</div>` : ''}<p>${esc(lesson.done ? step.outcome : step.explanation)}</p>${lesson.done ? (lesson.cursor===TEACHING.length-1 ? btn("Finish lesson","finish",'class="primary next-interaction"') : btn("Next step","continue",'class="primary next-interaction"')) : btn(step.seat===viewer ? "Continue" : "Watch the table","close",'class="primary next-interaction"')}<p class="c-subtle">Use the circled ? to read this step again.</p></section>`, true);
  const dialog=document.querySelector('dialog')!;
  dialog.classList.add('c-lesson-popover');dialog.setAttribute('aria-labelledby','lesson-title');
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
}
function modal(html: string, lessonGuide = false) {
  stopTimer();
  const token = generation;
  document.querySelector("dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = "c-modal";
  dialog.innerHTML = `${btn("Close", "close", 'class="c-close"')}${html}`;
  if(lessonGuide) {
    dialog.classList.add("c-lesson-popover");
    root.querySelector(".c-game")!.append(dialog);
    dialog.show();
  } else { document.body.append(dialog); dialog.showModal(); }
  dialog.addEventListener("close", () => {
    const wasConnected = dialog.isConnected;
    dialog.remove();
    table?.setReducedMotion(!motion);
    if (
      wasConnected &&
      game &&
      !busy &&
      token === generation &&
      ((lesson && !lesson.done && actingSeat() !== viewer) || game.players[viewer].hand.length === 0 ||
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
  if (game?.setup) return "";
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
    `<h2>${esc(nameOf(id))}</h2>${back}${actions().some(a=>a.type==="withdraw"&&a.card===id)?btn("Recall","withdraw",`data-card="${id}"`):""}${marriageHint(id)}<div class="c-inspection-card">${faceHTML(id, { reference: true })}</div><p>Printed rank ${BY_ID[id].rank} · ${esc(dynastyName(BY_ID[id].dynasty))}${BY_ID[id].queen ? " · Queen role" : ""}</p><p>A native card can join your Court or become an heir. A challenge matches the target’s Dynasty; defense compares lead and answer. Retreating from a challenge exchanges the lead for the target. Both go to their new owners’ Played areas until next round.</p>${btn("Reference rules", "rules")}`,
  );
}
function rules() {
  modal(
    `<h2>Core reference rules</h2><p>These shared rule cards accompany the character faces. Each topic has a numbered reference; longer topics continue on a second card.</p>${referenceAidsHTML()}`,
  );
}
function menu() {
  modal(
    `<h2>Your table</h2><p>Deal eight each; pass 3, then 2, then 1 clockwise. Play three matching Nobles to declare your Dynasty. The first is ruler; five stay in hand. Duplicate Dynasties are allowed.</p><p>${esc(objective())}</p><p>Play cards to develop your Court, challenge a rival’s Noble or offer a Trade for a rival’s face-up Played card. Return a Court Noble to hand to spend your turn. This may break a marriage or Crown claim. A card in Played is unavailable until next round. Defend with a higher same-Dynasty card; an Ace also answers J, Q or K.</p><p>Claim with a ruler, an existing native supporter and a new native heir. Or marry a equal- or neighboring-rank foreign heir to an existing native Queen. Keep the required people through transfer and the entire following round.</p><p>Everyone passing consecutively ends a round. Played cards return, then each player draws one new card. No round reshuffle. During setup only, a failed declaration reveals its hand, draws the top card and sets aside a different-Dynasty card. Shuffle those set-aside cards into the deck after declarations. The prototype ends as a draw after 12 rounds without a winner.</p>${btn("Reference rules", "rules")}${btn(motion ? "Reduce motion" : "Enable motion", "motion")}${btn("Export private save", "export")}${btn("Return to title", "home")}<p class="c-subtle">Private saves include all hands. Share only with people allowed to see them.</p>`,
  );
}
const actionHints: Record<string,string> = {
 withdraw:"Return this Noble from your Court to your hand. Uses your turn and may break a marriage or Crown claim.",
 recruit:"Play this Noble from your hand into your Dynasty’s Court. Uses your turn.",
 recall:"Challenge an opposing Noble of the same Dynasty. Their player can defend or retreat and exchange the two Nobles.",
 defend:"Play this card to protect your challenged Noble. The two answering cards rest in Played until next round.",
 'respond-defend':"Defend your Dynasty’s honor with the selected card. Your challenged Noble stays in Court.",
 'respond-retreat':"Exchange your challenged Noble for the challenger’s card. Both return to their new owners next round.",
 decline:"Decline this offer without exchanging cards.",
 pass:"End your opportunity without playing a card. When everyone passes consecutively, the round ends.",
 'draft-pass':"Lock your selected cards and pass them clockwise. Everyone exchanges their packet together.",
 'name-heir':"Play this native Noble as your heir and choose a supporter to begin a Crown claim.",
 'marry-heir':"Marry this foreign Noble to a matching Queen in your Court to begin a Crown claim.",
 trade:"Offer this card for a rival’s face-up Played card. They choose whether to accept.",
 accept:"Accept the proposed card exchange.",
 'sort-hand':"Switch between Dynasty-first and Rank-first sorting. This only rearranges your hand on screen.",
 inspect:"Read this card’s full details and rules.",
 'inspect-selected':"Read the selected card’s full details and rules.",
 'response-inspect':"Read the selected card’s full details and rules.",
 continue:"Continue the guide. This does not play a card or change the board.",
 close:"Close this explanation and return to the table.",
};
function bind(scope: ParentNode = root) {
  scope.querySelectorAll<HTMLButtonElement>('[data-do]').forEach(el=>{
    const action=el.dataset.do!;
    const type=action==='arm'?el.dataset.type!:action==='generic'?actions().filter(a=>!a.card)[Number(el.dataset.index)]?.type:action;
    if(type && actionHints[type]) el.title=actionHints[type];
  });
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
        if (action === "lesson-help") { showLesson(); return; }
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
          names = ["You", "Player 2"];
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
          const dynasties = Array.from(document.querySelectorAll<HTMLInputElement>('[name="pool"]:checked'),el=>el.value) as CoreState["dynasties"];
          if(dynasties.length!==count) {
            let error=document.querySelector('.c-pool-error');
            if(!error){error=document.createElement('p');error.className='c-pool-error';error.setAttribute('role','alert');document.querySelector('.c-pool')!.append(error);}
            error.textContent=`Choose ${count} Dynasty sets for the shared deck.`;return;
          }
          names = [
            document
              .querySelector<HTMLInputElement>("#player-name")!
              .value.trim() || "You",
            ...dynasties.slice(1).map((_, i) => `Player ${i + 2}`),
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
          document.querySelector("dialog")?.remove();
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
        if(action==='sort-hand') {
          handSort=handSort==='dynasty'?'rank':'dynasty';
          try { localStorage.setItem(`${namespace}hand-sort`,handSort); } catch { /* Sorting still works without persistence. */ }
          const cards=[...root.querySelectorAll<HTMLElement>('.c-held-card')].sort((a,b)=>compareHand(a.querySelector<HTMLElement>('[data-card]')!.dataset.card!,b.querySelector<HTMLElement>('[data-card]')!.dataset.card!));
          cards.forEach((card,index)=>{card.style.setProperty('--card-index',String(index));card.style.setProperty('--fan-angle',`${cards.length<2?0:(index/(cards.length-1)-.5)*14}deg`);card.parentElement!.append(card);});
          el.textContent=`Sorted by ${handSort.toUpperCase()}`;
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
        if (action === "withdraw") {
          const candidate=actions().find(a=>a.type==='withdraw'&&a.card===el.dataset.card);
          if(candidate) { document.querySelector('dialog')?.close(); await commit(candidate); }
          return;
        }
        if (action === "draft-pass" && game.phase === "draft" && !busy) {
          if(draftPacket.length + (game.setup!.picks[viewer]?.length ?? 0) !== game.setup!.pass) return;
          const pass=game.setup!.pass;
          const packet = [...draftPacket]; draftPacket = [];
          for(const card of packet) await commit({type:"draft-pick",seat:viewer,card,revision:game!.revision}, true);
          while(mode!=='local' && game!.phase==='draft' && game!.setup!.pass===pass && actingSeat()!==viewer) {
            const seat=actingSeat(),picks=game!.setup!.picks[seat]??[];
            const card=computerDraftPackets[seat]?.find(id=>!picks.includes(id));
            const candidate=legalActions(viewForSeat(game!,seat),seat).find(a=>a.card===card);
            if(!candidate) break;
            await commit(candidate,true);
          }
          await render(); return;
        }
        if (action === "select" && game.phase === "draft" && !busy) {
          const id = el.dataset.card!;
          if(draftPacket.includes(id)) draftPacket = lesson ? draftPacket.slice(0,draftPacket.indexOf(id)) : draftPacket.filter(card=>card!==id);
          else if(actions().some(a=>a.card===id) && draftPacket.length + (game.setup!.picks[viewer]?.length ?? 0) < game.setup!.pass) draftPacket.push(id);
          await render();
          root.querySelector<HTMLButtonElement>(`[data-do="select"][data-card="${id}"]`)?.focus();
          return;
        }
        if (action === "select" && game?.setup) {
          const pick = actions().find(a => a.card === el.dataset.card);
          if(pick) await commit(pick);
          return;
        }
        if(action === "inspect-selected") { if(selected) inspect(selected); return; }
        if(action === "response-inspect") { if(selected) inspect(selected); return; }
        if (action === "respond-defend") {
          const candidate=actions().find(a=>a.type==='defend'&&a.card===selected);
          if(candidate) await commit(candidate);
          return;
        }
        if (action === "respond-retreat") {
          const candidate=actions().find(a=>a.type==='decline');
          if(candidate) await commit(candidate);
          return;
        }
        if (action === "select") {
          armed=null;
          selected = el.dataset.card!;
          root
            .querySelectorAll(".c-held-card")
            .forEach((card) =>
              card.classList.toggle("selected", card.contains(el)),
            );
          showTargets();
          return;
        }
        if (action === "arm" && game?.setup) {
          const pick = actions().find(a => a.card === el.dataset.card);
          if(pick) await commit(pick);
          return;
        }
        if (action === "arm" && el.dataset.type === "defend") {
          const candidate=actions().find(a=>a.type==='defend'&&a.card===el.dataset.card);
          if(candidate) await commit(candidate);
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
