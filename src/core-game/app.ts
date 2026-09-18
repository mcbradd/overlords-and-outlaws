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
import { TargetArc } from "./target-arc";
let targetArc:TargetArc|null=null;
let arrowFrame=0;
let tradeOrigins:DOMRect[]=[];
let shownTrade='';
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
let declaration: string[] = [];
const computerPlans = new Map<number,{key:string;action:CoreAction}>();
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
let notice = "";
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
  document.querySelector('.c-trade-offer')?.remove();shownTrade='';tradeOrigins=[];
  cancelAnimationFrame(arrowFrame);targetArc?.dispose();targetArc=null;
  responseObserver?.disconnect();
  draftPacket = []; declaration=[]; computerPlans.clear();
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
  } catch { /* Persistence is optional and never interrupts play. */ }
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
  root.innerHTML = `<main class="c-intro"><section class="c-guide"><p class="c-kicker">LEARN AT THE TABLE</p><h1>Keep the Crown in your family.</h1><p class="c-intro-goal">Choose an heir and claim the Crown. Keep your ruler AND heir in Court for the whole of the next round to win.</p><p>Lose either one and your claim ends. Keep useful cards in hand to defend them.</p><p>Begin with eight cards and no Dynasty. Pass three, two, then one clockwise. Courts start empty. Your first Recruit sets your Dynasty and becomes Ruler. Marry an opposite-gender Noble on a later turn, then play an Heir.</p><p>First, we’ll show one useful move and explain why it helps. Playing a card uses it for this round; keeping it may let you answer a rival.</p>${btn("Take your seat", "teach", 'class="primary"')}${btn("Return to title", "home")}</section></main>`;
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
    `<h2>Set a core table</h2><p>Build a family, claim the Crown and protect the succession. This prototype ends after 12 rounds if no succession wins.</p><label>Players<select id="players"><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label><label>Table<select id="mode"><option value="solo">You and computer rivals</option><option value="local">Shared device · private handoffs</option></select></label><fieldset class="c-pool"><legend>Dynasties in the shared deck</legend>${["alba","plantagenet","tudor","habsburg"].map((d,i)=>`<label><input type="checkbox" name="pool" value="${d}" ${i<2?"checked":""}>${dynastyName(d)}</label>`).join("")}</fieldset><label>Your name<input id="player-name" autocomplete="off" maxlength="40" value="You"></label><label>Deal number<input id="seed" type="number" inputmode="numeric" min="1" max="999999" value="${Math.floor(Date.now() % 999999) + 1}"></label><p>The shared deck uses one thirteen-card Dynasty set per player. Deal eight and pass 3-2-1. Courts start empty. Your first Noble establishes your Dynasty and becomes Ruler. Marry an opposite-gender spouse before playing an Heir. Players may share a Dynasty.</p>${btn("Begin game", "begin", 'class="primary"')}<label class="c-file">Import a game<input type="file" id="save-file" accept="application/json,.json"></label>`,
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
  notice = "";
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
    ? available.filter((action) => (game!.phase === "recall" && action.type === "decline") || isTeachingAction(action, lesson!.cursor + (game!.phase === "draft" ? draftPacket.length : game!.phase === "declare" ? declaration.length : 0)))
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
      return `${card} becomes your heir. Keep your ruler and this heir in Court through the whole of next round to win.`;
    case "marry-heir":
      return `${card} marries your ruler, ${nameOf(action.supporter!)}. You may play an heir on a later turn. This spouse succeeds the ruler if the ruler leaves Court.`;
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
  if (!game) return '';
  if(game.result) return game.result.winner===null ? 'The Crown remains contested.' : `${names[game.result.winner]} protected ruler and heir for a full round.`;
  if(game.setup) return 'Win by protecting your ruler and heir for one full round.';
  const crown=game.crown;
  if(!crown) return 'Play a Ruler, marry a Spouse, then claim with an Heir. Hold Ruler + Heir for a full round to win.';
  return `${names[crown.seat]} · ${nameOf(crown.oldRuler)} + ${nameOf(crown.heir)} · ${crown.stage==='notice' ? `Hold all of round ${game.round+1} to win` : `Win when round ${game.round} ends — keep BOTH in Court`}`;
}
function prepareComputer(seat:number) {
  const view=viewForSeat(game!,seat);view.active=seat;
  const key=JSON.stringify({...view,revision:0,passes:[]});
  let plan=computerPlans.get(seat);
  if(plan?.key!==key && legalActions(view,seat).length) {plan={key,action:chooseAction(view,seat).action};computerPlans.set(seat,plan);}
  return plan ? {...plan.action,revision:game!.revision} : undefined;
}
async function render() {
  if (!game || busy) return;
  const renderToken = ++renderSequence;
  const loadToken = generation;
  stopTimer();
  document.querySelector('.c-trade-offer')?.remove();
  document.querySelector(".c-lesson-popover")?.remove();
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
  if(!lesson && mode!=="local" && game.phase==="action" && !game.result) for(const p of game.players) if(p.seat!==viewer) prepareComputer(p.seat);
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
      ? `Offer from ${names[game.pending.seat]}: ${nameOf(game.pending.card)} for ${nameOf(game.pending.request!)} in ${game.pending.other===viewer?'your':`${names[game.pending.other]}’s`} Played pile.${game.pending.recruit ? " On acceptance, the lower native card joins the rival’s Court." : " Accept to exchange them in Played until next round."}`
      : `${names[game.pending.seat]} uses ${nameOf(game.pending.card)} (rank ${BY_ID[game.pending.card].rank}) to challenge ${nameOf(game.pending.target!)}. Defend with a higher card of that Dynasty, or an Ace against J, Q or K. Let the person go to receive the challenging card in exchange next round.`
    : "";
  const setupGuide = game.setup ? game.phase === 'draft'
    ? `Select ${game.setup.pass - (game.setup.picks[viewer]?.length ?? 0)} more to pass clockwise. Packets move together after everyone chooses. Keep cards for your future Dynasty.`
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
      const enabled = humanTurn && (draftPacket.includes(id) || declaration.includes(id) || available.some((a) => a.card === id)) && (game!.phase!=="declare" || !declaration.length || BY_ID[id].dynasty===BY_ID[declaration[0]].dynasty);
      const angle =
        hand.length < 2 ? 0 : (index / (hand.length - 1) - 0.5) * 14;
      return `<div tabindex="0" aria-label="${esc(nameOf(id))}" class="c-held-card ${game!.setup?.picks[viewer]?.includes(id) ? "c-locked-pick" : ""} ${draftPacket.includes(id) || declaration.includes(id) ? "c-draft-selected" : ""} ${selected === id ? "selected" : ""} ${lesson && enabled && !draftPacket.includes(id) && !declaration.includes(id) && (game!.phase !== "draft" || draftPacket.length < game!.setup!.pass) ? "next-interaction" : ""}" style="--card-index:${index};--fan-angle:${angle}deg"><button class="c-card-pick" data-do="select" data-card="${id}" ${!enabled ? "disabled" : ""} aria-pressed="${draftPacket.includes(id)}" aria-label="Select ${esc(nameOf(id))}, ${BY_ID[id].rank} ${esc(dynastyName(BY_ID[id].dynasty))}">${faceHTML(id)}</button>${`<div class="c-card-actions" aria-label="Actions for ${esc(nameOf(id))}">${responding ? renderCardActions(id, available.filter(a=>a.type==="defend"&&a.card===id)) : ""}${btn("Inspect", "inspect", `data-card="${id}"`)}</div>`}</div>`;
    })
    .join("");
  root.innerHTML = `<main class="c-game c-tabletop ${!motion ? "reduced-motion" : ""} ${lesson ? "c-teaching-table" : ""} ${hand.length ? "has-hand" : ""}">
    <header><strong>${game.setup ? "Inheritance" : `Round ${game.round} of 12`}</strong><p class="c-objective">${esc(objective())}</p>${btn("Table menu", "menu")}${lesson ? btn("?", "lesson-help", 'class="c-lesson-help" aria-label="Read tutorial step" title="Read tutorial step"') : ""}</header>
    <section class="c-guide" aria-label="Action and outcome">${game.phase === "draft" ? `<section class="c-draft-modal" role="dialog" aria-labelledby="draft-title"><div><h2 id="draft-title">All Players Select ${game.setup!.pass} ${game.setup!.pass === 1 ? "Card" : "Cards"} to pass</h2><p>Round ${4-game.setup!.pass} of 3 · Clockwise${lesson && humanTurn ? ` · ${draftPacket.length === game.setup!.pass ? "Press PASS" : `Select ${esc(nameOf(TEACHING[lesson.cursor + draftPacket.length].card!))}`}` : ""}</p></div>${btn(humanTurn ? (draftPacket.length + (game.setup!.picks[viewer]?.length ?? 0) === game.setup!.pass ? "PASS" : `Select ${game.setup!.pass - draftPacket.length - (game.setup!.picks[viewer]?.length ?? 0)} More to Pass`) : "Waiting for players…", "draft-pass", `class="primary ${draftPacket.length === game.setup!.pass ? "next-interaction" : ""}" ${!humanTurn || draftPacket.length + (game.setup!.picks[viewer]?.length ?? 0) !== game.setup!.pass ? "disabled" : ""}`)}</section>` : ""}<h2 class="sr-only">${esc(lesson ? taught!.title : game.result ? "The game has ended" : selected ? nameOf(selected) : "Your choices")}</h2>${!responding && game.phase !== "draft" && game.phase !== "declare" && (game.setup || selected || game.pending || outcome || autoPass) ? `<p>${esc(currentGuide)}</p>` : ""}${notice ? `<p class="c-error" role="alert">${esc(notice)}</p>` : ""}${game.phase === "declare" ? `<div class="c-declaration"><p>${declaration.length ? `${esc(nameOf(declaration[0]))} will rule. ${declaration.length}/3 selected.` : "Choose three Nobles of one Dynasty. First choice is your ruler."} You can change your choices.</p>${btn(declaration.length===3?"Declare":`Select ${3-declaration.length} More`,"declare-confirm",`class="primary ${declaration.length===3?"next-interaction":""}" ${declaration.length!==3||!humanTurn?"disabled":""}`)}</div>` : ""}<div class="c-action-area"><div class="c-selected-actions"></div>${!lesson?.done && humanTurn && !responding ? `${generic.map((a, i) => btn(a.type === "decline" && game!.phase === "trade" ? "Decline" : a.type === "pass" && autoPass ? "<span>Pass</span>" : label[a.type], "generic", `data-index="${i}" class="${lesson ? "next-interaction" : ""} ${a.type === "pass" && autoPass ? "c-auto-pass" : ""}"`)).join("")}` : ""}${game.result && !lesson ? btn("Play another game", "setup", 'class="primary"') : ""}</div></section>
    <section class="c-board-wrap" aria-label="Physical game table"><div class="c-table-nav">${btn("Table", "focus-all", 'aria-label="Whole table"')}${game.players.map((p) => btn(esc(names[p.seat]), "focus", `data-seat="${p.seat}"`)).join("")}</div>${game.phase === "draft" ? `<div class="c-draft-hands">${game.players.filter(p=>p.seat!==viewer).sort((a,b)=>(a.seat-viewer+game!.players.length)%game!.players.length-(b.seat-viewer+game!.players.length)%game!.players.length).map(p=>`<div data-draft-hand="${p.seat}"><span>${esc(names[p.seat])}</span><div class="c-back-fan">${Array.from({length:p.hand.length},(_,i)=>`<i class="c-card-back" style="--i:${i}" aria-hidden="true"></i>`).join("")}</div><small>${p.hand.length} cards</small></div>`).join("")}</div>` : ""}<div id="core-table"></div></section>
    ${game.phase === "recall" ? responseHTML() : ""}
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
    freshHost.innerHTML = `<p>Basic table view · 3D is unavailable on this browser</p>${seatView.players.map((p) => `<section><h2>${esc(names[p.seat])}</h2><p>${p.handCount} concealed cards · Played: ${p.played.map(nameOf).map(esc).join(", ") || "none"} · returns next round</p><div>${p.court.map((id) => `<figure>${faceHTML(id)}<figcaption>${esc(nameOf(id))}${id === p.ruler ? " · ruler" : ""}${game!.crown?.heir === id ? " · heir" : ""}</figcaption></figure>`).join("")}</div></section>`).join("")}`;
    root.querySelector(".c-table-nav")!.innerHTML = "";
  }
  bind();
  if(game.pending?.type==='trade') showTradeOffer(generic);
  responseObserver?.disconnect();
  const response = root.querySelector<HTMLElement>('.c-response');
  if(response) {
    const sizeResponse = () => {const board=root.querySelector('.c-board-wrap')!.getBoundingClientRect(),height=Math.min(560,Math.max(100,board.height-60));response.style.setProperty('--challenge-top',`${board.top+Math.max(54,(board.height-height)/2)}px`);response.style.setProperty('--challenge-left',`${board.left+board.width/2}px`);response.style.setProperty('--challenge-height',`${height}px`);response.style.setProperty('--challenge-width',`${Math.min(660,board.width-20)}px`);};
    sizeResponse(); responseObserver = new ResizeObserver(sizeResponse); responseObserver.observe(root.querySelector('.c-board-wrap')!);
    animateOfferCards(response);
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
      const action = prepareComputer(actor);
      if (!action) {
        notice = "The next move could not be prepared. Try returning to the table.";
        void render();
        return;
      }
      void commit(action);
    }, motion ? game.pending?1100:180 : 0);
  }
  if (lesson && !game.result) {
    if(actor!==viewer && !lesson.done) {
      const revision=game.revision;
      timer=setTimeout(()=>{
        if(!game || game.revision!==revision || !lesson || document.hidden) return;
        const action=legalActions(viewForSeat(game,actor),actor).find(a=>isTeachingAction(a,lesson!.cursor));
        if(action) void commit(action);
      },game.setup?0:motion?700:0);
    } else {
      if(motion) await new Promise(resolve=>setTimeout(resolve,700));
      if(loadToken!==generation || renderToken!==renderSequence) return;
      if(shownLesson!==lessonKey()) showLesson();
    }
  }
  if(game.result) showVictory();

}
function responseHTML() {
  const pending=game!.pending!;
  const noDefense=!legalActions(viewForSeat(game!,viewer),viewer).some(a=>a.type==='defend');
  const house=dynastyName(BY_ID[pending.target!].dynasty);
  const hasHouse=game!.players[viewer].hand.some(id=>BY_ID[id].dynasty===BY_ID[pending.target!].dynasty);
  const retreatHint=noDefense ? `${hasHouse ? `None of your available ${house} Nobles can defend your honor.` : `You have no Nobles of House ${house} to defend your honor.`} ${nameOf(pending.target!)} must retreat.` : `Defend ${nameOf(pending.target!)} and your Dynasty’s honor, or retreat to exchange these two Nobles.`;
  return `<section class="c-response" aria-labelledby="challenge-title"><div><h2 id="challenge-title">${esc(names[pending.seat])} Challenges with ${esc(nameOf(pending.card))}</h2><p id="challenge-response-hint" class="sr-only">${esc(retreatHint)}</p></div><div class="c-challenge-pair"><figure><figcaption>Challenger</figcaption>${faceHTML(pending.card)}</figure><figure><figcaption>Challenged</figcaption>${faceHTML(pending.target!)}</figure></div><div class="c-response-actions">${pending.other===viewer ? btn('Defend','respond-defend','class="primary" disabled') : '<p>Waiting for the reply…</p>'}${pending.other===viewer ? btn('Retreat','respond-retreat',`aria-describedby="challenge-response-hint" class="${noDefense ? 'next-interaction' : ''}"`) : ''}${btn('Inspect','response-inspect','class="c-response-inspect" disabled')}</div></section>`;
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
  if (choices.length === 1 && (element?.closest('.c-response') || element?.closest('#core-table') && !element.closest('[data-do]'))) return choices[0];
  const target = element?.closest<HTMLElement>(
    "[data-table-card],[data-court-seat],[data-drop-card],.c-challenge-pair [data-card-face]",
  );
  if (!target || !game) return;
  const id = target.dataset.dropCard ?? target.dataset.tableCard ?? target.dataset.cardFace;
  return armedActions().find((a) =>
    a.type === "recruit"
      ? target.dataset.courtSeat === String(viewer) ||
        (!!id && game!.players[viewer].court.includes(id))
      : targetId(a) === id,
  );
}
function publicCard(id:string) {
  return root.querySelector<HTMLElement>(`.c-challenge-pair [data-card-face="${id}"]`) ?? root.querySelector<HTMLElement>(`[data-table-card="${id}"]`);
}
function updateArc(pointer?:{x:number;y:number}) {
  cancelAnimationFrame(arrowFrame);
  const fromId=armed?.card??game?.pending?.card;
  const targets=armedActions();
  const toId=pointer ? undefined : targets.length===1?targetId(targets[0]):game?.pending?.target;
  const from=fromId ? (armed ? root.querySelector<HTMLElement>(`[data-do="select"][data-card="${fromId}"]`) : publicCard(fromId))?.getBoundingClientRect() : null;
  const dest=toId ? publicCard(toId)?.getBoundingClientRect() : null;
  if(from && (pointer||dest)) {
    try {targetArc??=new TargetArc();targetArc.show({x:from.x+from.width/2,y:from.y+from.height/2},pointer??{x:dest!.x+dest!.width/2,y:dest!.y+dest!.height/2},!motion);}catch { /* Rules and click targets remain available without WebGL. */ }
    if(!pointer)arrowFrame=requestAnimationFrame(()=>updateArc());
  } else {targetArc?.hide();if(fromId && toId) arrowFrame=requestAnimationFrame(()=>updateArc());}
}
function showTargets() {
  updateArc();
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
  const ghost=document.createElement('div'); ghost.className='c-drag-anchor'; ghost.hidden=true;
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
  const target=document.elementFromPoint(event.clientX,event.clientY);
  const action=actionAt(target);const id=action&&targetId(action);
  const box=id?publicCard(id)?.getBoundingClientRect():null;
  if(drag.moved) updateArc(box?{x:box.x+box.width/2,y:box.y+box.height/2}:{x:event.clientX,y:event.clientY});

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
    document.querySelector(".c-lesson-popover")?.remove();
    const before = game;
    if(action.type==='trade'||action.type==='recall') tradeOrigins=[sourceRect(action.card!,action.seat),sourceRect((action.request??action.target)!,action.other??before.players.findIndex(p=>p.court.includes(action.target!)))];
    const next = applyAction(game, action);
    cancelAnimationFrame(arrowFrame);targetArc?.hide();
    if(before.pending && !next.pending && next.round===before.round && motion && table) {
      busy=true;stopTimer();root.inert=true;
      try {await animateResolution(next);}finally {busy=false;root.inert=false;table?.setReducedMotion(!motion);}
    }
    if(next.round!==before.round && before.players.some(p=>p.played.length)) {
      busy=true;stopTimer();root.inert=true;
      try {await animateReturns(before);}finally {busy=false;root.inert=false;}
    }
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
async function animateResolution(next:CoreState) {
  const pair=document.querySelector<HTMLElement>('.c-challenge-pair,.c-trade-pair');
  if(!pair||!table)return;
  const cards=[...pair.querySelectorAll<HTMLElement>('[data-card-face]')].map(card=>({id:card.dataset.cardFace!,rect:card.getBoundingClientRect(),html:card.outerHTML}));
  table.setReducedMotion(true);
  const view=viewForSeat(next,viewer);await table.update({...view,players:view.players.map(p=>({...p,name:names[p.seat]}))});
  pair.style.visibility='hidden';
  const layer=document.createElement('div');layer.className='c-resolution-flight';document.body.append(layer);
  const flights=cards.map(({id,rect,html})=>{
    const owner=next.players.find(p=>[...p.hand,...p.court,...p.played].includes(id));
    const target=root.querySelector<HTMLElement>(`[data-table-card="${id}"]`) ?? root.querySelector<HTMLElement>(owner?.seat===viewer?'.c-hand':`[data-hand-seat="${owner?.seat}"]`);
    const end=target?.getBoundingClientRect();if(!end)return Promise.resolve();
    const card=document.createElement('div');card.innerHTML=html;Object.assign(card.style,{position:'fixed',left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`});layer.append(card);
    return card.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${end.x+end.width/2-rect.x-rect.width/2}px,${end.y+end.height/2-rect.y-rect.height/2}px) scale(${Math.min(1,end.width/rect.width)})`,opacity:1}],{duration:500,easing:'cubic-bezier(.3,.1,.3,1)',fill:'both'}).finished.catch(()=>{});
  });
  await Promise.all(flights);layer.remove();
}
function sourceRect(id:string,seat:number):DOMRect {
  return root.querySelector<HTMLElement>(`[data-do="select"][data-card="${id}"],[data-table-card="${id}"]`)?.getBoundingClientRect()
    ?? root.querySelector<HTMLElement>(`[data-hand-seat="${seat}"]`)?.getBoundingClientRect() ?? root.querySelector<HTMLElement>(`[data-court-seat="${seat}"]`)?.getBoundingClientRect() ?? new DOMRect(innerWidth/2,80,40,56);
}
async function animateReturns(before:CoreState) {
  if(!motion)return;
  const layer=document.createElement('div');layer.className='c-draft-flight c-round-return';layer.setAttribute('aria-label','Played cards return to their owners’ hands');document.body.append(layer);
  const flights:Animation[]=[];
  for(const p of before.players) for(const id of p.played) {
    const a=sourceRect(id,p.seat),b=root.querySelector<HTMLElement>(p.seat===viewer?'.c-hand':`[data-hand-seat="${p.seat}"]`)?.getBoundingClientRect();if(!b)continue;
    const card=document.createElement('i');card.className='c-card-back';card.dataset.returningCard=id;layer.append(card);card.style.left=`${a.x}px`;card.style.top=`${a.y}px`;
    flights.push(card.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${b.x+b.width/2-a.x}px,${b.y+b.height/2-a.y}px)`,opacity:.4}],{duration:650,easing:'ease-in-out',fill:'both'}));
  }
  await Promise.all(flights.map(a=>a.finished.catch(()=>{})));layer.remove();
}
function showTradeOffer(generic:CoreAction[]) {
  const offer=game?.pending;if(offer?.type!=='trade')return;
  const layer=document.createElement('section');layer.className='c-trade-offer';layer.setAttribute('role','dialog');layer.setAttribute('aria-label','Trade offer');
  layer.innerHTML=`<h2>${esc(names[offer.seat])} offers a Trade</h2><div class="c-trade-pair"><figure><figcaption>Offered from ${offer.seat===viewer?'your hand':`${esc(names[offer.seat])}’s hand`}</figcaption>${faceHTML(offer.card)}</figure><figure><figcaption>Requested from ${offer.other===viewer?'your Played pile':`${esc(names[offer.other])}’s Played pile`}</figcaption>${faceHTML(offer.request!)}</figure></div><div class="c-trade-controls">${generic.map((a,i)=>btn(a.type==='decline'?'Decline':'Accept','generic',`data-index="${i}" class="${a.type==='accept'?'primary next-interaction':''}"`)).join('')||'<p>Waiting for the reply…</p>'}</div>`;
  document.body.append(layer);bind(layer);
  animateOfferCards(layer);
}
function animateOfferCards(layer:HTMLElement) {
  const offer=game?.pending;if(!offer)return;
  const requested=offer.request??offer.target!;
  const key=`${offer.seat}:${offer.card}:${requested}:${game!.revision}`;
  if(key!==shownTrade && motion) [...layer.querySelectorAll<HTMLElement>('.core-face')].forEach((card,i)=>{
    const a=tradeOrigins[i]??sourceRect(i===0?offer.card:requested,i===0?offer.seat:offer.other),b=card.getBoundingClientRect();
    card.animate([{transform:`translate(${a.x+a.width/2-b.x-b.width/2}px,${a.y+a.height/2-b.y-b.height/2}px) scale(${Math.max(.1,a.width/b.width)})`},{transform:'translate(0,0) scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
  });
  shownTrade=key;tradeOrigins=[];
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
function positionLesson(panel:HTMLElement) {
  if(game && !game.setup) {
    const host=root.querySelector<HTMLElement>('.c-guide');
    if(host){const r=host.getBoundingClientRect(),w=Math.min(740,r.width-24);panel.classList.add('c-lesson-inline');panel.style.width=`${w}px`;panel.style.left=`${r.x+(r.width-w)/2}px`;panel.style.top=`${r.y+2}px`;return;}
  }
  const size=panel.getBoundingClientRect();
  const obstacles=[...root.querySelectorAll<HTMLElement>('.c-held-card,.c-guide,.c-response,.c-table-nav,[data-draft-hand],.core-table-caption,.core-table-seat,[data-table-card]')].map(e=>e.getBoundingClientRect());
  const candidates=[];
  for(let y=80;y+size.height<innerHeight-12;y+=24) for(const x of [12,Math.max(12,(innerWidth-size.width)/2),Math.max(12,innerWidth-size.width-12)]) {
    const score=obstacles.reduce((n,r)=>n+Math.max(0,Math.min(x+size.width,r.right)-Math.max(x,r.left))*Math.max(0,Math.min(y+size.height,r.bottom)-Math.max(y,r.top)),0);
    candidates.push({x,y,score});
  }
  const best=candidates.sort((a,b)=>a.score-b.score)[0]??{x:12,y:80};
  panel.style.left=`${best.x}px`;panel.style.top=`${best.y}px`;
}
function showVictory() {
  if(!game?.result || document.querySelector('.c-victory'))return;
  const win=game.result.winner,success=win===viewer;
  const layer=document.createElement('section');layer.className=`c-victory ${!motion?'reduced-motion':''}`;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Game result');
  layer.innerHTML=`<div class="c-victory-rays"></div><div class="c-victory-copy"><div class="c-victory-crown" aria-hidden="true">♛</div><p class="c-kicker">${win===null?'THE CROWN AWAITS':'A DYNASTY ENDURES'}</p><h1>${success?'Long live your Dynasty!':win===null?'The Crown is still contested':`${esc(names[win])} secures the Crown`}</h1><p>${success?'You protected your ruler and heir for a full round. Your succession is secure.':esc(game.result.reason)}</p>${game.crown?`<div class="c-victory-pair">${faceHTML(game.crown.oldRuler)}${faceHTML(game.crown.heir)}</div>`:''}${btn('Play again','victory-again','class="primary next-interaction"')}${btn('View table','victory-close')}</div>${Array.from({length:48},(_,i)=>`<i class="c-gold-petal" style="--i:${i}"></i>`).join('')}`;
  document.body.append(layer);root.inert=true;
  layer.querySelector('[data-do="victory-close"]')!.addEventListener('click',()=>{layer.remove();root.inert=false;});
  layer.querySelector('[data-do="victory-again"]')!.addEventListener('click',()=>{layer.remove();root.inert=false;setup();});
  layer.querySelector<HTMLButtonElement>('button')!.focus();
}
function showLesson() {
  if(!lesson || !game || (!lesson.done && actingSeat()!==viewer)) return;
  shownLesson=lessonKey();
  const step=TEACHING[lesson.cursor];
  modal(`<section class="c-lesson-content" aria-labelledby="lesson-title"><p class="c-kicker">LEARN AT THE TABLE</p><h2 id="lesson-title">${esc(step.title)}</h2>${step.card && !lesson.done ? `<div class="c-lesson-preview">${faceHTML(step.card)}</div>` : ''}<p>${esc(lesson.done ? step.outcome : step.explanation)}</p>${lesson.done ? (lesson.cursor===TEACHING.length-1 ? btn("Finish lesson","finish",'class="primary next-interaction"') : btn("Next step","continue",'class="primary next-interaction"')) : btn("Continue","close",'class="primary next-interaction"')}${btn("Exit tutorial","exit",'class="c-lesson-exit"')}<p class="c-subtle">Use the circled ? to read this step again.</p></section>`, true);
  const dialog=document.querySelector('dialog')!;
  dialog.classList.add('c-lesson-popover');dialog.style.visibility='hidden';requestAnimationFrame(()=>requestAnimationFrame(()=>{positionLesson(dialog);dialog.style.visibility='visible';}));dialog.setAttribute('aria-labelledby','lesson-title');
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
    document.body.append(dialog);
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

function playedPile(seat: number) {
  const pile=game?.players[seat]?.played;
  if(!pile) return;
  modal(`<h2 class="sr-only">${esc(names[seat])} · Played cards</h2><div class="c-played-fan" aria-label="${esc(names[seat])} Played cards">${pile.map(id=>`<button data-do="inspect-played" data-card="${id}" aria-label="Enlarge ${esc(nameOf(id))}">${faceHTML(id)}</button>`).join('')}</div>`);
  const dialog=document.querySelector<HTMLDialogElement>('dialog')!;
  dialog.classList.add('c-played-display');
  if(!motion) dialog.classList.add('reduced-motion');
  const fit=()=>{
    const width=innerWidth-32,height=innerHeight-96,gap=10;
    let columns=1,size=0;
    for(let n=1;n<=Math.max(1,pile.length);n++) {
      const rows=Math.ceil(pile.length/n);
      const candidate=Math.min((width-gap*(n-1))/n,(height-gap*(rows-1))/Math.max(1,rows)*63/88);
      if(candidate>size){size=candidate;columns=n;}
    }
    dialog.style.setProperty('--pile-columns',String(columns));
    dialog.style.setProperty('--pile-width',`${Math.max(1,Math.floor(size))}px`);
  };
  fit();window.addEventListener('resize',fit);
  dialog.addEventListener('close',()=>window.removeEventListener('resize',fit),{once:true});
  dialog.addEventListener('cancel',event=>{event.preventDefault();if(dialog.querySelector('.c-played-expanded')) dismissPlayedCard(dialog);else closePlayedDisplay(dialog);});
}
function closePlayedDisplay(dialog: HTMLDialogElement) {
  if(dialog.classList.contains('is-leaving')) return;
  dialog.classList.add('is-leaving');
  setTimeout(()=>dialog.close(),motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches?130:0);
}
function dismissPlayedCard(dialog: HTMLDialogElement) {
  const expanded=dialog.querySelector<HTMLElement>('.c-played-expanded');
  if(!expanded || expanded.classList.contains('is-leaving')) return;
  const id=expanded.dataset.card!;
  expanded.classList.add('is-leaving');
  setTimeout(()=>{expanded.remove();dialog.querySelector<HTMLElement>('.c-played-fan')!.inert=false;dialog.querySelector<HTMLButtonElement>(`[data-do="inspect-played"][data-card="${id}"]`)?.focus();},motion?130:0);
}
function enlargePlayedCard(id:string) {
  const dialog=document.querySelector<HTMLDialogElement>('.c-played-display');
  if(!dialog || dialog.querySelector('.c-played-expanded')) return;
  const expanded=document.createElement('div');expanded.className='c-played-expanded';expanded.dataset.card=id;
  expanded.innerHTML=`<button aria-label="Dismiss enlarged ${esc(nameOf(id))}">${faceHTML(id)}</button>`;
  expanded.addEventListener('click',()=>dismissPlayedCard(dialog));
  dialog.querySelector<HTMLElement>('.c-played-fan')!.inert=true;
  dialog.append(expanded);expanded.querySelector('button')!.focus();
}
function inspect(id: string, pileSeat?: number) {
  const back =
    pileSeat === undefined
      ? ""
      : btn("Back to Played pile", "played-pile", `data-seat="${pileSeat}"`);
  modal(
    `<h2 class="sr-only">${esc(nameOf(id))}</h2>${faceHTML(id, { reference: true })}<div class="c-inspect-actions">${back}${actions().some(a=>a.type==="withdraw"&&a.card===id)?btn("Recall","withdraw",`data-card="${id}"`):""}${btn("Rules", "rules")}</div>`,
  );
  const dialog=document.querySelector<HTMLDialogElement>('dialog')!;dialog.classList.add('c-inspect-display');
  dialog.addEventListener('click',event=>{if(!(event.target as HTMLElement).closest('button'))dialog.close();});
}
function rules() {
  modal(
    `<h2>Core reference rules</h2><p>These shared rule cards accompany the character faces. Each topic has a numbered reference; longer topics continue on a second card.</p>${referenceAidsHTML()}`,
  );
}
function menu() {
  modal(
    `<h2>Your table</h2><p>Deal eight and pass 3, then 2, then 1 clockwise. All Courts start empty. The first Noble you Recruit establishes your Dynasty and becomes Ruler. Players may share a Dynasty.</p><p>On a later turn, Marry a Noble of the opposite gender from hand to your Ruler. The spouse succeeds a Ruler who leaves Court; the Court keeps its Dynasty. With a spouse in play, Claim by playing a native Heir. Keep that Ruler and Heir through the whole next round to win.</p><p>${esc(objective())}</p><p>Challenge with a card of the target’s Dynasty. Defend with a higher same-Dynasty card, or an Ace against J, Q or K. Retreat exchanges the Challenger and target into their new owners’ Played piles. The Challenger stays in the center until the response resolves.</p><p>Trade a hand card for a rival’s Played card. Recall returns a Court Noble to hand and spends your turn. Everyone passing consecutively ends a round: Played cards return, everyone draws one if available, and first player rotates. The prototype ends after 12 rounds.</p>${btn("Reference rules", "rules")}${btn(motion ? "Reduce motion" : "Enable motion", "motion")}${btn("Export game", "export")}${btn("Return to title", "home")}`,
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
 'name-heir':"Play this Noble as heir. Keep ruler and heir through the whole next round to win.",
 'marry-heir':"Marry this Noble to your ruler. A spouse must be present before you play an heir.",
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
          const dialog=el.closest("dialog");
          if(dialog?.classList.contains("c-played-display")) closePlayedDisplay(dialog);else dialog?.close();
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
          enlargePlayedCard(el.dataset.card!);
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
          const dialog=el.closest("dialog");
          if(dialog?.classList.contains("c-played-display")) closePlayedDisplay(dialog);else dialog?.close();
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
        if(action === "declare-confirm" && game.phase==='declare' && declaration.length===3) {
          const packet=[...declaration];declaration=[];
          for(const card of packet) await commit({type:'declare-pick',seat:viewer,card,revision:game!.revision},true);
          await render();return;
        }
        if(action==='select' && game.phase==='declare') {
          const id=el.dataset.card!;
          if(declaration.includes(id)) declaration=lesson?declaration.slice(0,declaration.indexOf(id)):declaration.filter(c=>c!==id);
          else if(declaration.length<3 && actions().some(a=>a.card===id) && (!declaration.length || BY_ID[id].dynasty===BY_ID[declaration[0]].dynasty)) declaration.push(id);
          await render();return;
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
          const direct=actions().filter(a=>a.type===el.dataset.type&&a.card===el.dataset.card);
          if(direct.length===1 && ['name-heir','recruit','marry-heir'].includes(direct[0].type)) {await commit(direct[0]);return;}
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
window.addEventListener("resize",()=>{const guide=document.querySelector<HTMLElement>(".c-lesson-popover");if(guide) positionLesson(guide);});
updateViewport();
void home();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopTimer();
  else if (game && !busy && !document.querySelector("dialog[open]"))
    void render();
});
