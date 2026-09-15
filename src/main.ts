import "./style.css";
import "./v3.css";
import "./table.css";
import { describeAction, COIN } from "./action-view";
import {
  LESSONS,
  createLesson,
  lessonComplete,
  lessonOpponent,
} from "./lessons";
import { CARDS, HOUSES, PAINTINGS, card, house, type HouseId } from "./content";
import {
  createDuel,
  act,
  respond,
  moves,
  reactions,
  chooseMove,
  aiResponse,
  dynastyCount,
  nativeCount,
  active,
  paintingCounts,
  WITNESS_LIMIT,
  upkeep,
  income,
  canHold,
  claimCost,
  spec,
  cost,
  forecast,
  explain,
  HOUSE_RULES,
  RELICS,
  ROLES,
  type Move,
  type Moment,
  type Mode,
  type Response,
} from "./duel";
import type { Battlefield } from "./battlefield";
import { cardFace, abilityFor, crest, esc, portrait } from "./cards";
import { readProgress, saveProgress } from "./progress";
import { setSound, unlockAudio, sfx } from "./audio";

const app = document.querySelector<HTMLDivElement>("#app")!,
  overlay = document.querySelector<HTMLDivElement>("#overlay")!;
let profile = readProgress(),
  g = profile.game,
  screen = "home",
  mode: Mode = "skirmish",
  chosen: HouseId = "alba",
  seats = 3,
  viewer = 0,
  page = 0;
let seatHouses: HouseId[] = ["alba", "plantagenet", "tudor", "valois"];
let attackReview: Move | null = null;
let selected: string | null = null,
  field: Battlefield | null = null,
  busy = false,
  epoch = 0,
  locked = false,
  handOffTo = 0,
  archiveHouse: HouseId = "alba",
  lastEvent: Moment | null = null;
let lastFocus: HTMLElement | null = null;
let suppressClickUntil = 0;
const announcementKinds = [
  "combat",
  "brace",
  "ambush",
  "claim",
  "broken",
  "capture",
  "collapse",
  "countdown",
  "history",
];
const seed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const today = () => new Date().toISOString().slice(0, 10);
function persist() {
  profile.game = g;
  if (g)
    profile.seen = [
      ...new Set([
        ...profile.seen,
        ...g.players
          .filter((p) => p.human)
          .flatMap((p) => p.hand.map((r) => r.card)),
        ...g.players.flatMap((p) => p.court.map((r) => r.card)),
      ]),
    ];
  if (!saveProgress(profile))
    toast("Storage is unavailable. Keep this tab open to preserve progress.");
}
function toast(text: string) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  el.setAttribute("role", "status");
  document.body.append(el);
  setTimeout(() => el.remove(), 4200);
}
function effects() {
  document.body.classList.toggle("reduced-motion", !profile.motion);
  setSound(profile.sound);
  field?.setMotion(profile.motion);
}
function header() {
  return `<header class="site-header"><button class="wordmark" data-home><span>♛</span><div>OVERLORDS <i>&</i> OUTLAWS<small>THE WEIGHT OF THE CROWN</small></div></button><nav><button data-start="skirmish">Play</button><button data-archive>The Archive</button><button data-rules>How to play</button></nav><div class="header-right"><span>${CARDS.length} ROYALS</span><button data-settings aria-label="Settings">⚙</button></div></header>`;
}
function leave() {
  epoch++;
  busy = false;
  locked = false;
  field?.dispose();
  field = null;
  selected = null;
  attackReview = null;
  overlay.innerHTML = "";
  persist();
}
function home() {
  leave();
  screen = "home";
  app.innerHTML = `<div class="home-shell">${header()}<main class="home-hero"><div><div class="eyebrow">A FAMILY OF RIVALS · A TABLE OF CONSEQUENCES</div><h1>Anyone can take<br>a crown.<br><em>Can you keep it?</em></h1><p>Raise a House. Swear an alliance. Conceal your next move.<br>The more power you expose, the more there is to lose.</p><div class="home-actions"><button class="primary" data-start="lesson">Learn to hold power →</button><button class="secondary" data-start="family">Gather the family <small>2–4 PLAYERS</small></button></div>${g && !g.over ? '<button class="resume" data-resume>● Your table is saved — resume →</button>' : ""}<div class="home-meta">SOLO WITH AI · LOCAL SHARED TABLE · NO CARD PACKS</div></div><div class="hero-cards">${cardFace({ uid: "hero1", card: "alba-3", hp: spec("alba-3").resolve, ready: false })}${cardFace({ uid: "hero2", card: "tudor-1", hp: 4, ready: false })}${cardFace({ uid: "hero3", card: "plantagenet-2", hp: 3, ready: false })}</div></main><section class="mode-grid"><button data-start="chronicle"><span>01 / THE CHRONICLE</span><h2>A dynasty is earned.</h2><p>Three courts. Choose a road, earn an heirloom, carry your legacy.</p><b>Begin a chronicle ↗</b></button><button data-start="skirmish"><span>02 / THE OPEN TABLE</span><h2>Every House has a plan.</h2><p>Six bloodlines. Two to four Houses. Competing claims and shifting threats.</p><b>Choose your rivals ↗</b></button><button data-start="daily"><span>03 / ${today()} UTC</span><h2>The daily inheritance.</h2><p>A fixed table and shared seed. Find a better line through the same decisions.</p><b>Take today’s seat ↗</b></button></section><footer>A game concept by Malachy Murray <button data-credits>Credits & source decisions</button></footer></div>`;
  effects();
}
function start(which: Mode) {
  mode = which;
  if (which === "daily") {
    chosen = HOUSES[Number(today().replaceAll("-", "")) % 6].id;
    seats = 3;
  }
  if (which === "chronicle" && profile.run) {
    if (profile.run.reward) {
      rewards();
      return;
    }
    if (g && !g.over && g.mode === "chronicle") {
      resume();
      return;
    }
    map();
    return;
  }
  if (which === "lesson") {
    launch("alba", 3);
    return;
  }
  leave();
  screen = "choose";
  renderChoose();
}
function renderChoose() {
  seatHouses = [
    chosen,
    ...seatHouses.filter((h) => h !== chosen),
    ...HOUSES.map((h) => h.id).filter(
      (h) => h !== chosen && !seatHouses.includes(h),
    ),
  ].slice(0, 4);
  app.innerHTML = `<div class="menu-shell">${header()}<main class="choose-page"><div class="eyebrow">${mode === "family" ? "PASS THE DEVICE. KEEP YOUR SECRETS." : "CHOOSE YOUR INHERITANCE"}</div><h1>${mode === "family" ? "A seat for every generation." : "Every bloodline holds power differently."}</h1><p>${mode === "family" ? "Every House is human-controlled. Private handoffs hide concealed cards between turns and defensive responses." : "Threaten their growth, protect your own, and survive the attention a crown attracts."}</p><div class="house-grid">${HOUSES.map((h) => `<button class="house-choice ${chosen === h.id ? "chosen" : ""}" data-house="${h.id}" ${mode === "daily" ? "disabled" : ""} style="--house:${h.color}"><img src="/art/${h.id}.webp" alt="${h.leader}"><span>${crest(CARDS.find((c) => c.house === h.id)!.id)}</span><div><small>${h.region}</small><h2>${h.name}</h2><p>${HOUSE_RULES[h.id].trait}</p></div></button>`).join("")}</div><p class="turn-order-note">First to act: ${house(chosen).name}. Turns proceed clockwise through the displayed seats.</p><div class="seat-roster">${
    mode === "family"
      ? seatHouses
          .slice(1, seats)
          .map(
            (id, i) =>
              `<label>PLAYER ${i + 2}<select data-seat-house="${i + 1}">${HOUSES.map((h) => `<option value="${h.id}" ${h.id === id ? "selected" : ""} ${h.id === chosen ? "disabled" : ""}>${h.name}</option>`).join("")}</select></label>`,
          )
          .join("")
      : mode === "daily"
        ? "Today’s House and three-seat table are fixed for replay."
        : ""
  }</div><div class="choose-footer"><div><strong>${HOUSE_RULES[chosen].trait}</strong><p>${HOUSE_RULES[chosen].text}</p></div><label>HOUSES AT THE TABLE<select id="seats" ${mode === "daily" ? "disabled" : ""}>${[2, 3, 4].map((n) => `<option ${n === seats ? "selected" : ""}>${n}</option>`).join("")}</select></label><button class="primary" data-launch>Take your seat →</button></div></main></div>`;
}
function launch(h = chosen, count = seats) {
  if (g && !g.over && screen !== "choose-confirm") {
    modal(
      "Replace saved table",
      `<h2>Start a new table?</h2><p>The saved encounter will be replaced. Your archive discoveries and completed victories remain.</p><button class="primary" data-confirm-new>Start the new table</button>`,
    );
    return;
  }
  leave();
  if (mode === "chronicle") {
    profile.run = { house: h, act: 0, seed: seed(), relics: [], reward: false };
    g = null;
    persist();
    map();
    return;
  }
  const daily = Number(today().replaceAll("-", ""));
  g = createDuel({
    seed: mode === "lesson" ? 1306 : mode === "daily" ? daily : seed(),
    house: mode === "daily" ? HOUSES[daily % 6].id : h,
    mode,
    seats: mode === "daily" || mode === "lesson" ? 3 : count,
    humans: mode === "family" ? count : 1,
    houses: mode === "family" ? seatHouses.slice(0, count) : undefined,
  });
  if (mode === "lesson") g = createLesson();
  viewer = 0;
  page = 0;
  lastEvent = g.events.at(-1) ?? null;
  screen = "board";
  mountBoard();
  persist();

  if (mode === "family") handoff(0);
}
function resume() {
  if (!g) return;
  leave();
  screen = "board";
  viewer = g.mode === "family" ? (g.pending?.defender ?? g.turn) : 0;
  lastEvent = g.events.at(-1) ?? null;
  mountBoard();
  if (g.mode === "family") handoff(viewer);
  else void advance();
}
function map() {
  leave();
  screen = "map";
  const run = profile.run;
  if (!run) {
    home();
    return;
  }
  const choices: HouseId[] =
    run.act === 0
      ? ["plantagenet", "alba"]
      : run.act === 1
        ? ["habsburg", "tudor"]
        : ["bourbon", "valois"];
  app.innerHTML = `<div class="menu-shell">${header()}<main class="map-page"><div class="eyebrow">${house(run.house).name.toUpperCase()} · COURT ${run.act + 1} OF 3</div><h1>${["The first claim.", "The price of an alliance.", "The weight of the crown."][run.act]}</h1><p>Three Houses share each table. Choose the leading rival’s style.</p><div class="path-progress">${[1, 2, 3].map((n) => `<span class="${n <= run.act + 1 ? "active" : ""}">${n}<small>${["INHERITANCE", "AMBITION", "LEGACY"][n - 1]}</small></span>`).join("")}</div><div class="road-grid">${choices.map((h) => `<button data-encounter="${h}"><img src="/art/${h}.webp" alt=""><div><small>${HOUSE_RULES[h].policy.toUpperCase()}</small><h2>The ${house(h).name} court</h2><p>${HOUSE_RULES[h].text}</p><b>Enter this court →</b></div></button>`).join("")}</div><div class="heirlooms">${run.relics.map((id) => RELICS.find((r) => r.id === id)!.name).join(" · ") || "Your first victory earns an heirloom."}</div></main></div>`;
}
function encounter(rival: HouseId) {
  const r = profile.run!;
  g = createDuel({
    seed: r.seed + r.act * 7307,
    house: r.house,
    rival,
    mode: "chronicle",
    seats: 3,
    relics: r.relics,
  });
  viewer = 0;
  screen = "board";
  lastEvent = g.events.at(-1)!;
  mountBoard();
  persist();
}
const royalById = (id: string) =>
  g?.players.flatMap((p) => [...p.court, ...p.hand]).find((r) => r.uid === id);
function targets() {
  return g && selected
    ? moves(g)
        .filter((a) => a.type === "attack" && a.uid === selected)
        .map((a) => ("target" in a ? a.target! : ""))
    : [];
}
async function mountBoard() {
  field?.dispose();
  app.innerHTML = `<div class="battle-shell"><header class="battle-top"><button class="small-brand" data-home>♛ <span>OVERLORDS & OUTLAWS</span></button><div class="objective">THREE FAMILY ROYALS · WITHSTAND EVERY HOUSE</div><div><button data-rules aria-label="How to play">?</button><button data-settings aria-label="Settings">⚙</button><button data-save>Save & leave</button></div></header><div id="scoreboard" class="scoreboard"></div><main class="table-zone"><div class="arena-column"><div class="arena-label"><span id="turn-label"></span><span id="history-label"></span></div><div id="arena" class="arena"></div><div id="event-focus" class="event-focus" aria-live="polite"></div></div></main><aside class="command-rail" aria-label="Card details and actions"><div id="lesson-coach"></div><div id="card-detail"></div><div id="decision-panel" class="decision-panel"></div></aside><section id="hand-dock" class="hand-dock"></section><div id="hover-inspector"></div><svg id="target-arrow" aria-hidden="true"></svg><div id="handoff-layer"></div><div id="battle-banner" aria-live="assertive"></div></div>`;
  field = null;
  renderBoard();
  const token = epoch;
  const { Battlefield: Renderer } = await import("./battlefield");
  if (token !== epoch || screen !== "board") return;
  field = new Renderer(document.querySelector("#arena")!);
  renderBoard();
}
function renderBoard() {
  if (!g || screen !== "board") return;
  const focusedRoyal =
    document.activeElement instanceof HTMLElement
      ? document.activeElement.dataset.royal
      : undefined;
  effects();
  const t = targets();
  const board = document.querySelector("#scoreboard")!;
  board.setAttribute("data-seats", String(g.players.length));
  board.innerHTML = g.players
    .map(
      (p) =>
        `<section class="court-score ${p.id === viewer ? "you" : ""} ${!g!.over && g!.turn === p.id ? "current" : ""} ${p.claim ? "claiming" : ""}" data-score="${p.id}" style="--house:${house(p.house).color}"><div class="house-identity"><span class="house-crest">${crest(CARDS.find((c) => c.house === p.house)!.id)}</span><div><small>${p.id === viewer ? "YOU" : p.human ? "FAMILY PLAYER" : "RIVAL HOUSE"}</small><strong>${house(p.house).name}</strong></div></div><button class="crown-piece ${t.includes("crown-" + p.id) ? "targetable" : ""}" data-target="crown-${p.id}" aria-label="${house(p.house).name} crown, ${p.stability} stability"><span>♛</span><b>${p.stability}</b><small>STABILITY</small>${p.shield ? `<i>⛨ ${p.shield}</i>` : ""}</button><div class="public-family"><button data-family="${p.id}">${dynastyCount(p)} family Royals</button><small>${g!.over ? (g!.winner === p.id ? "DYNASTY SECURED" : g!.winner === -1 ? "EUDOXIA PREVAILS" : "GAME COMPLETE") : p.claim ? "CLAIM ACTIVE" : dynastyCount(p) >= 3 ? "Eligible to claim" : "Need three to claim"}</small><span class="response-chip ${p.response ? "" : "spent"}" title="One paid response per rival turn">◈ RESPONSE</span><div class="rival-backs">${p.hand.length} in hand</div></div><div class="estate-zone">${Array.from({ length: p.estates }, () => `<button class="estate-piece ${t.includes("estate-" + p.id) ? "targetable" : ""}" data-target="estate-${p.id}" aria-label="${house(p.house).name} estate">⌂<small>+2 ${COIN}</small></button>`).join("")}<button class="public-money" data-economy="${p.id}">${COIN} ${p.gold}<small>Income ${income(p) >= 0 ? "+" : ""}${income(p)}</small></button></div>${p.claim ? `<div class="public-claim">TO CONTEST: ${p.challengers.map((id) => house(g!.players[id].house).name).join(" · ")}</div>` : ""}</section>`,
    )
    .join("");
  const f = forecast(g);
  document.querySelector("#turn-label")!.textContent = g.over
    ? "GAME COMPLETE"
    : `ROUND ${g.round} · ${house(g.players[g.turn].house).name.toUpperCase()} · ${g.orders} ORDERS LEFT`;
  document.querySelector("#history-label")!.innerHTML = g.over
    ? "<button data-log>Read the final chronicle ↗</button>"
    : g.mode === "lesson" && g.lesson < 10
      ? "<button data-lesson>Learning guide ↗ · History paused</button>"
      : `<span class="${g.witness >= WITNESS_LIMIT - 4 ? "danger" : ""}">EUDOXIA ${paintingCounts(
          g,
        )
          .map(
            (n) =>
              `<i class="painting-track">${"◆".repeat(n)}${"◇".repeat(9 - n)}</i>`,
          )
          .join(
            " ",
          )}</span><button data-forecast>${f.name} ${Array.from({ length: 4 }, (_, i) => (i < 4 - f.in ? "●" : "○")).join(" ")} · ${f.in} rounds</button>`;
  renderHand();
  renderDecision();
  renderEvent();
  field?.sync(g, selected, t, viewer);
  drawTargetArrow();
  renderLesson();
  renderCardDetail();
  if (focusedRoyal)
    [
      ...document.querySelectorAll<HTMLElement>(
        ".arena [data-royal],.hand-cards [data-royal]",
      ),
    ]
      .find((el) => el.dataset.royal === focusedRoyal)
      ?.focus({ preventScroll: true });
  if (g.over && g.mode !== "lesson") results();
}
function renderHand() {
  if (!g) return;
  const scrollLeft = document.querySelector(".hand-cards")?.scrollLeft ?? 0;
  const p = g.players[viewer];
  document
    .querySelector(".battle-shell")
    ?.classList.toggle("hand-empty", p.hand.length === 0);
  page = Math.min(page, Math.max(0, Math.ceil(p.hand.length / 5) - 1));
  const canPlay =
    g.turn === viewer && !busy && !g.pending && !locked && !g.over;
  document.querySelector("#hand-dock")!.innerHTML =
    `<div class="hand-topline"><div><span class="eyebrow">${house(p.house).name.toUpperCase()} · YOUR HAND · ${p.hand.length}</span><small>Select a card to act · hover or hold to inspect</small></div><div class="turn-tools"><span class="gold-count">${COIN} ${p.gold}<small>GOLD</small></span><span class="order-count">${[0, 1].map((i) => `<i class="order-token ${i < (g!.turn === viewer ? g!.orders : 0) ? "" : "spent"}">${i + 1}</i>`).join("")}<small>ORDERS</small></span><button class="hint" data-hint ${!canPlay ? "disabled" : ""}>Suggest a plan</button><button class="end-turn" data-end ${!canPlay ? "disabled" : ""}>End turn →</button></div></div><div class="hand-cards" data-card-area="hand">${
      locked
        ? '<div class="empty-hand">The hand is concealed.</div>'
        : p.hand

            .map((r) =>
              cardFace(r, {
                owner: p,
                zone: "hand-card",
                selected: selected === r.uid,
              }),
            )
            .join("") ||
          '<div class="empty-hand">Your hand is empty. Draw at the start of your next turn.</div>'
    }</div><div class="pile-zones"><button data-pile="deck">▧<small>DRAW ${p.deck.length}</small></button><button data-pile="discard">▤<small>DISCARD ${p.discard.length}</small></button></div>`;
  document.querySelector(".hand-cards")!.scrollLeft = scrollLeft;
}
function order(move: Move, _label = "", _detail = "", cls = "") {
  const v = describeAction(g!, move, viewer);
  const shortEffect: Partial<Record<Move["type"], string>> = {
    estate: "+2 income next turn",
    fortify: "+3 crown shields",
    restore: "+3 crown stability",
    recruit: "Discard hand · draw five",
    claim: "Defend against every rival",
  };
  const lessonLocked =
    g!.mode === "lesson" && !LESSONS[g!.lesson - 1]?.types.includes(move.type);
  return `<button class="order-button ${cls} ${v.allowed && !lessonLocked ? "" : "unavailable"}" data-move='${JSON.stringify(move)}' aria-disabled="${!v.allowed || lessonLocked}" ${busy || locked || lessonLocked ? "disabled" : ""}><strong>${v.name}</strong><small>${v.orders ? `${v.orders} order` : ""}${v.gold ? ` · pay ${v.gold} ${COIN}` : ""}</small>${v.allowed && shortEffect[move.type] ? `<span class="action-effect">${shortEffect[move.type]}</span>` : ""}${!v.allowed ? `<span class="blocked-reason">${v.reason}</span>` : ""}</button>`;
}
function renderDecision() {
  if (!g) return;
  const p = g.players[viewer],
    r = selected ? royalById(selected) : undefined;
  const inHand = r && p.hand.includes(r),
    own = r && p.court.includes(r);
  document
    .querySelector(".battle-shell")
    ?.setAttribute(
      "data-decision",
      r || g.pending || g.over ? "active" : "idle",
    );
  let html = "";
  if (g.over) {
    html = `<div class="action-context"><small>GAME COMPLETE</small><strong>${g.winner === -1 ? "Eudoxia completed a painting" : house(g.players[g.winner!].house).name + " held the crown"}</strong><p>${esc(g.reason)}</p></div><div class="dock-actions"><button class="order-button" data-log>Read the final chronicle</button></div>`;
  } else if (g.pending && g.pending.defender === viewer && !locked) {
    const attacker = royalById(g.pending.attacker)!;
    html = `<div class="action-context"><small>YOUR RESPONSE</small><strong>${esc(card(attacker.card).name)} attacks for ${spec(attacker).force}</strong><p>One paid response per rival turn. Brace blocks 2; Ambush deals 3 first.</p></div><div class="dock-actions">${reactions(
      g,
    )
      .map(
        (x) =>
          `<button class="order-button ${x === "accept" ? "" : "primary-order"}" data-response="${x}" ${busy ? "disabled" : ""}><strong>${x === "accept" ? "Take the damage" : x === "brace" ? "Brace" : "Ambush"}</strong><small>${x === "accept" ? "Keep gold and your response" : x === "brace" ? `Pay 2 ${COIN} · block 2` : `Pay 2 ${COIN} + Conspirator`}</small></button>`,
      )
      .join("")}</div>`;
  } else if (attackReview && r) {
    const v = describeAction(g, attackReview, viewer);
    html = `<div class="action-context"><small>ATTACK PREVIEW</small><strong>${esc(v.effect)}</strong><p>${esc(v.response)}</p></div><div class="dock-actions">${order(attackReview, "", "", "primary-order")}<button class="order-button" data-manage>Cancel attack</button></div>`;
  } else if (r) {
    const action: Move = { type: inHand ? "deploy" : "recall", uid: r.uid };
    const v = describeAction(g, action, viewer);
    html = `<div class="action-context"><small>${inHand ? "FROM YOUR HAND" : own ? "YOUR COURT" : "RIVAL COURT"}</small><strong>${esc(card(r.card).name)}</strong><p>${inHand ? esc(v.effect) : own ? (g.orders === 0 ? "No orders left — end your turn." : r.ready ? "Choose a highlighted rival piece to attack." : "Resting: can defend, but cannot attack until your next turn.") : "Select a Ready Royal in your court to attack."}</p></div><div class="dock-actions">${inHand ? order(action, "", "", "primary-order") + (card(r.card).house !== p.house ? order({ type: "marry", uid: r.uid }) : "") : own ? order(action) : ""}<button class="order-button inspect-trigger" data-inspect="${r.card}">Inspect card</button><button class="order-button" data-manage>Back</button></div>`;
  } else {
    html = `<div class="action-context"><small>${g.turn === viewer ? "YOUR NEXT MOVE" : house(g.players[g.turn].house).name.toUpperCase() + " IS ACTING"}</small><strong>${g.turn !== viewer ? "Watch the table" : g.orders === 0 ? "No orders left. End your turn." : p.claim ? "Defend your claim" : "Play a Royal or manage your House"}</strong><p>${p.claim ? "Still to contest: " + p.challengers.map((id) => house(g!.players[id].house).name).join(" · ") : "Select a card in your hand to play it, or a Ready Royal to attack."}</p></div><div class="dock-actions">${order({ type: "estate" })}${order({ type: "fortify" })}${order({ type: "restore" })}${order({ type: "recruit" })}${order({ type: "claim" }, "", "", "claim-button")}</div>`;
  }
  document.querySelector("#decision-panel")!.innerHTML = html;
}
function renderLesson() {
  const el = document.querySelector("#lesson-coach");
  if (!el || !g) return;
  document
    .querySelector(".battle-shell")
    ?.classList.toggle("teaching", g.mode === "lesson");
  if (g.mode !== "lesson") {
    el.innerHTML = "";
    return;
  }
  const i = g.lesson - 1,
    l = LESSONS[i],
    done = lessonComplete(g);
  document
    .querySelector(".battle-shell")
    ?.setAttribute("data-lesson-index", String(g.lesson));
  el.innerHTML = `<div class="lesson-number">${i + 1}<small>OF ${LESSONS.length}</small></div><div><small>${done ? "LESSON COMPLETE" : "YOUR LESSON · " + l.task.toUpperCase()}</small><h2>${l.title}</h2><p>${done ? (i === 6 ? "Your family fell below three, so the claim broke. Next, defend a stronger court." : i === 7 ? "Both rivals contested your claim. Your family survived, so you won the crown." : i === 9 ? "Eudoxia completed a painting before any House secured its crown. Every House lost. You now know both ways a full game can end." : "You saw the action, its cost, and its result. Continue when you are ready.") : l.text}</p></div><div class="lesson-controls"><button class="lesson-read" data-lesson>Read lesson</button>${done ? `<button class="primary" data-next-lesson>${i === LESSONS.length - 1 ? "Play a full game" : "Next lesson →"}</button>` : ""}<button data-restart-lesson>Restart lesson</button></div>`;
}
function drawTargetArrow() {
  const svg = document.querySelector<SVGSVGElement>("#target-arrow");
  if (!svg) return;
  svg.innerHTML = "";
  if (attackReview?.type !== "attack") return;
  const from = document.querySelector(`[data-royal="${attackReview.uid}"]`),
    to = document.querySelector(
      `[data-royal="${attackReview.target}"],[data-target="${attackReview.target}"]`,
    );
  if (!from || !to) return;
  const a = from.getBoundingClientRect(),
    b = to.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
  svg.innerHTML = `<defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#f7d38a"/></marker></defs><path d="M${a.x + a.width / 2},${a.y + a.height / 2} Q${(a.x + b.x) / 2},${Math.min(a.y, b.y) - 35} ${b.x + b.width / 2},${b.y + b.height / 2}" fill="none" stroke="#f7d38a" stroke-width="4" marker-end="url(#arrowhead)"/>`;
}
function renderEvent() {
  const el = document.querySelector("#event-focus"),
    e = lastEvent ?? g?.events.at(-1);
  if (el)
    el.innerHTML = e
      ? `<span class="event-icon">${e.kind === "claim" ? "♛" : e.kind === "combat" ? "⚔" : "✦"}</span><div><strong>${e.actor >= 0 && g ? house(g.players[e.actor].house).name + " · " : ""}${esc(e.title)}</strong><p>${profile.coaching ? esc(e.why) : ""}</p></div><button data-log aria-label="Open chronicle">☷</button>`
      : "<div><strong>Your table is ready.</strong><p>Select a card to begin.</p></div>";
}
function banner(e: Moment) {
  if (e.kind !== "turn" || !lastEvent) lastEvent = e;
  renderEvent();
  document.querySelector("#announcer")!.textContent = `${e.title}. ${e.why}`;
  if (announcementKinds.includes(e.kind)) {
    const el = document.querySelector("#battle-banner")!;
    el.className = "show " + e.kind;
    el.innerHTML = `<small>${e.actor >= 0 ? house(g!.players[e.actor].house).name.toUpperCase() : "HISTORY BELONGS TO NO HOUSE"}</small><strong>${esc(e.title)}</strong><p>${esc(e.why)}</p><span class="announcement-timer"></span><small>Click to continue</small>`;
  }
  if (profile.motion && ["combat", "crown-hit"].includes(e.kind))
    document
      .querySelector(".arena-column")
      ?.animate(
        [
          { transform: "translateX(-3px)" },
          { transform: "translateX(3px)" },
          { transform: "none" },
        ],
        { duration: 180 },
      );
}
async function present(events: Moment[]) {
  const token = epoch;
  for (const e of events) {
    if (token !== epoch) return;
    if (e.kind !== "combat") banner(e);
    sfx(
      e.kind === "combat"
        ? "seize"
        : e.kind === "claim"
          ? "victory"
          : e.kind === "deploy"
            ? "build"
            : e.kind,
    );
    if (["deploy", "marry"].includes(e.kind))
      field?.sync(g!, selected, [], viewer);
    if (e.kind === "combat") {
      await field?.animate(e);
      for (const change of e.changes ?? []) {
        const value = document.querySelector(
          `.arena [data-royal="${change.uid}"] .resolve-stat b`,
        );
        if (value) {
          value.textContent = String(change.after);
          value.parentElement?.classList.add("damaged");
        }
      }
      banner(e);
    }
    if (announcementKinds.includes(e.kind)) {
      await new Promise<void>((resolve) => {
        const el = document.querySelector<HTMLElement>("#battle-banner");
        const finish = () => {
          if (el) {
            el.className = "";
            el.onclick = null;
          }
          clearTimeout(timer);
          resolve();
        };
        const delay = !profile.motion ? 180 : profile.coaching ? 1000 : 600;
        if (el) el.style.setProperty("--announcement-time", delay + "ms");
        const timer = setTimeout(finish, delay);
        if (el) el.onclick = finish;
      });
    }
    if (e.kind !== "combat") await field?.animate(e);
    await animateTransfer(e);
    if (["capture", "draw", "recruit"].includes(e.kind)) renderHand();
    if (
      profile.motion &&
      ["turn", "claim", "broken", "history"].includes(e.kind)
    )
      await new Promise((r) => setTimeout(r, 450));
  }
  if (token === epoch) renderBoard();
}
async function animateTransfer(e: Moment) {
  if (!profile.motion || !g) return;
  const own = e.actor === viewer;
  const treasury = document.querySelector(
    `[data-score="${e.actor}"] .public-money`,
  );
  const hand = own
    ? document.querySelector(".hand-cards")
    : document.querySelector(`[data-score="${e.actor}"] .rival-backs`);
  const drawing = e.kind === "draw" || e.kind === "recruit";
  const origin = drawing
    ? document.querySelector('[data-pile="deck"]')
    : e.kind === "turn"
      ? document.querySelector("#turn-label")
      : e.kind === "estate"
        ? document.querySelector("#decision-panel")
        : null;
  const destination = drawing
    ? hand
    : e.kind === "turn"
      ? treasury
      : e.kind === "estate"
        ? document.querySelector(`[data-score="${e.actor}"] .estate-zone`)
        : null;
  if (!origin || !destination || (e.kind === "turn" && !e.amount)) return;
  const a = origin.getBoundingClientRect(),
    b = destination.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "flying-token " + (drawing ? "draw" : e.kind);
  el.textContent = drawing ? "♛" : e.kind === "estate" ? "⌂" : `◉ ${e.amount}`;
  document.body.append(el);
  const x = a.x + a.width / 2,
    y = a.y + a.height / 2,
    dx = b.x + b.width / 2 - x,
    dy = b.y + b.height / 2 - y;
  el.style.left = x + "px";
  el.style.top = y + "px";
  await el.animate(
    [
      { transform: "translate(-50%,-50%) scale(.7)", opacity: 0 },
      {
        transform: `translate(calc(-50% + ${dx / 2}px),calc(-50% + ${dy / 2 - 60}px)) scale(1.15)`,
        opacity: 1,
        offset: 0.5,
      },
      {
        transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.8)`,
        opacity: 0,
      },
    ],
    { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" },
  ).finished;
  el.remove();
}
async function execute(move: Move | Response) {
  if (!g || busy || locked) return;
  if (
    g.mode === "lesson" &&
    g.turn === viewer &&
    typeof move !== "string" &&
    !LESSONS[g.lesson - 1].types.includes(move.type)
  ) {
    toast("Follow the highlighted lesson action, or restart this lesson.");
    return;
  }
  const token = epoch;
  busy = true;
  document
    .querySelectorAll<HTMLButtonElement>(
      "#decision-panel button,#hand-dock button",
    )
    .forEach((b) => (b.disabled = true));
  hideHover();
  selected = null;
  attackReview = null;
  const serial = g.serial;
  try {
    if (typeof move === "string") respond(g, move);
    else act(g, move);
    persist();
    document.querySelector(".battle-shell")?.classList.add("resolving");
    await present(g.events.filter((e) => e.id > serial));
  } catch (err) {
    toast((err as Error).message);
  } finally {
    if (token === epoch) {
      busy = false;
      document.querySelector(".battle-shell")?.classList.remove("resolving");
    }
  }
  if (token === epoch) {
    renderBoard();
    await advance();
  }
}
async function advance() {
  if (!g || screen !== "board" || busy || locked) return;
  if (g.over) {
    if (g.mode !== "lesson") results();
    return;
  }
  if (g.mode === "lesson" && lessonComplete(g)) return;
  if (g.pending) {
    const defender = g.players[g.pending.defender];
    if (defender.human) {
      if (viewer !== defender.id) handoff(defender.id);
      else renderBoard();
      return;
    }
    const token = epoch;
    await new Promise((r) => setTimeout(r, profile.motion ? 500 : 30));
    if (token === epoch && g?.pending && !locked) await execute(aiResponse(g));
    return;
  }
  const current = g.players[g.turn];
  if (current.human) {
    if (viewer !== current.id) handoff(current.id);
    else renderBoard();
    return;
  }
  const token = epoch;
  await new Promise((r) => setTimeout(r, profile.motion ? 750 : 40));
  if (token === epoch && screen === "board" && !busy && !locked && g && !g.over)
    await execute(g.mode === "lesson" ? lessonOpponent(g) : chooseMove(g));
}
function handoff(id: number) {
  if (!g) return;
  locked = true;
  handOffTo = id;
  selected = null;
  closeModal();
  renderBoard();
  document.querySelector("#handoff-layer")!.innerHTML =
    `<div class="handoff-screen"><div class="handoff-seal">${crest(CARDS.find((c) => c.house === g!.players[id].house)!.id)}</div><div class="eyebrow">PRIVATE HANDOFF</div><h1>Pass the table to<br>${house(g.players[id].house).name}.</h1><p>${g.pending ? "Your court is challenged. Choose your private response." : "Your concealed hand stays hidden until you are ready."}</p><button class="primary" data-ready>Only ${house(g.players[id].house).name} is looking · reveal →</button><small>Other players should look away. A shared screen cannot enforce physical privacy.</small></div>`;
}
function unlockHandoff() {
  viewer = handOffTo;
  locked = false;
  page = 0;
  document.querySelector("#handoff-layer")!.innerHTML = "";
  renderBoard();
  void advance();
}
function modal(title: string, body: string, cls = "") {
  lastFocus = document.activeElement as HTMLElement;
  overlay.innerHTML = `<div class="modal-shade"><section class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="close-modal" data-close aria-label="Close">×</button>${body}</section></div>`;
  overlay.querySelector<HTMLButtonElement>("[data-close]")?.focus();
}
function closeModal() {
  overlay.innerHTML = "";
  lastFocus?.focus();
}
function lessonIntro() {
  if (!g) return;
  const l = LESSONS[g.lesson - 1];
  modal(
    l.title,
    `<div class="eyebrow">LESSON ${g.lesson} OF ${LESSONS.length}</div><h2>${l.title}</h2><p>${l.text}</p><button class="primary" data-close>${l.task}</button>`,
  );
}
function inspect(id: string) {
  const c = card(id),
    h = house(c.house);
  const current = g?.players
    .flatMap((p) => p.court.concat(p.id === viewer ? p.hand : []))
    .find((r) => r.card === id);
  const controller =
    current &&
    g?.players.find(
      (p) => p.court.includes(current) || p.hand.includes(current),
    );
  modal(
    c.name,
    `<div class="inspect-layout"><div>${cardFace(current ?? { uid: "inspect", card: id, hp: spec(id).resolve, ready: false }, { zone: "inspect-card", owner: controller })}</div><article><div class="eyebrow">${h.region} · ${h.name.toUpperCase()}</div><h2>${esc(c.name)}</h2><em>${esc(c.epithet)}</em><p>${current ? abilityFor(current, controller) : ROLES[c.role].ability}</p><dl><dt>◉ Gold</dt><dd>Cost to expose, plus one order.</dd><dt>⚔ Attack</dt><dd>Damage dealt. Royals retaliate simultaneously.</dd><dt>♥ Health</dt><dd>At zero, this Royal leaves the court. Survivors recover full health when their House’s turn begins.</dd></dl><h3>${HOUSE_RULES[h.id].trait}</h3><p>${HOUSE_RULES[h.id].text}</p></article></div>`,
    "wide",
  );
}

function courtSheet(id: number) {
  if (!g) return;
  const p = g.players[id],
    family = dynastyCount(p),
    natives = nativeCount(p);
  modal(
    `${house(p.house).name} — public court`,
    `<div class="eyebrow">EVERY NUMBER HAS A SOURCE</div><h2>${house(p.house).name}</h2><div class="rules-grid"><article><h3>${family} family Royals</h3><p>${natives} native Royals + ${family - natives} supported spouses. Three establish a dynasty. Unsupported foreigners do not count.</p><p>${p.claim ? `Still to contest: ${p.challengers.map((i) => house(g!.players[i].house).name).join(", ")}.` : "No crown claim is active."}</p></article><article><h3>${income(p)} gold each turn</h3><p>4 base + ${p.estates * 2} from ${p.estates} estates + ${p.court.filter((r) => card(r.card).role === "Royal" && active(p, r)).length} from Stewards − ${upkeep(p)} upkeep.</p><p>Opening treasuries are already funded. Income begins in round two.</p></article><article><h3>${claimCost(p)} gold tribute</h3>${p.court.map((r) => `<p>${esc(card(r.card).name)}: ${cost(p, r, !!r.marriedTo)} gold</p>`).join("")}<p>One coronation pays every exposed Royal. The gold is spent even if the claim breaks.</p></article><article><h3>${p.stability} stability · ${p.shield} shields</h3><p>Crown pressure consumes shields, then stability. At zero: lose a Royal and estate, break marriages and claims, recover to 8. This does not end the game.</p><p>${p.response ? "A paid response remains available this rival turn." : "The paid response has been spent this rival turn."}</p></article></div>`,
    "wide",
  );
}
function componentSheet(target: string) {
  if (!g) return;
  const p = g.players[Number(target.split("-")[1])];
  if (target.startsWith("estate")) {
    modal(
      "Estate",
      `<div class="component-seal estate-seal">⌂</div><div class="eyebrow">${house(p.house).name}</div><h2>An estate earns 2 gold each turn.</h2><p>This House owns ${p.estates} estate${p.estates === 1 ? "" : "s"}, adding ${p.estates * 2} gold to its next income payment.</p><p>A successful raid destroys one estate and takes 2 gold. An upright Guardian blocks access to estates. You can also lose an estate during a crown collapse.</p>`,
    );
  } else {
    modal(
      "Crown",
      `<div class="component-seal">♛</div><div class="eyebrow">${house(p.house).name}’S CROWN</div><h2>${p.stability} stability · ${p.shield} shields</h2><p>The crown represents this House’s rule. It is separate from every Royal, including the Founder.</p><p>An attack removes shields first, then stability. Fortify adds shields to this crown; it does not heal a Royal.</p><h3>What happens at zero stability?</h3><p>The House loses a Royal and an estate, and its crown claim breaks. It then recovers to 8 stability and continues playing.</p><p>${p.claim ? "Claim active. Still to contest: " + p.challengers.map((id) => house(g!.players[id].house).name).join(", ") : "This House has not claimed the crown."}</p>`,
    );
  }
}
function familySheet(id: number) {
  if (!g) return;
  const p = g.players[id];
  modal(
    "Family",
    `<div class="eyebrow">${house(p.house).name}’S FAMILY</div><h2>${dynastyCount(p)} Royals count toward the crown.</h2><div class="family-ledger">${p.court.map((r) => `<div><strong>${esc(card(r.card).name)}</strong><span>${active(p, r) ? (card(r.card).house === p.house ? "Family by blood" : "Family by marriage") : "Foreign · does not count"}</span>${r.marriedTo ? `<small>Married to ${esc(card(p.court.find((q) => q.uid === r.marriedTo)!.card).name)}</small>` : ""}</div>`).join("")}</div><p>At least three family Royals must remain in play throughout every rival’s contest turn. Losing a Queen can remove her foreign spouse’s family membership.</p><h3>Claim the crown — pay ${claimCost(p)} gold</h3><p>The payment equals the play costs of all Royals in this court:</p><div class="cost-ledger">${p.court.map((r) => `<span>${esc(card(r.card).name)} <b>${cost(p, r, !!r.marriedTo)} ${COIN}</b></span>`).join("")}</div><p>The bank keeps this payment even if a rival breaks the claim.</p>`,
  );
}
function economySheet(id: number) {
  if (!g) return;
  const p = g.players[id],
    stewards = p.court.filter(
      (r) => card(r.card).role === "Royal" && active(p, r),
    ).length;
  modal(
    "Treasury",
    `<div class="component-seal">${COIN}</div><div class="eyebrow">${house(p.house).name}’S TREASURY</div><h2>${p.gold} gold to spend</h2><h3>Next income: ${income(p)} gold</h3><div class="cost-ledger"><span>House income<b>+4</b></span><span>${p.estates} estates, 2 gold each<b>+${p.estates * 2}</b></span><span>${stewards} family Stewards, 1 gold each<b>+${stewards}</b></span><span>Upkeep: Royals beyond three and foreign marriages<b>−${upkeep(p)}</b></span></div><p>Income arrives when your turn starts, beginning in round two. Unspent gold stays in your treasury, up to 30.</p><p>Playing a Royal, building an estate, or claiming the crown spends gold and an order. A response spends 2 gold and your response marker, without using an order.</p>`,
  );
}
function rules() {
  modal(
    "How to play",
    `<div class="eyebrow">RULES OF THE TABLE</div><h2>How to hold a dynasty.</h2><div class="rules-grid"><article><h3>Your turn</h3><p>Start with 5 gold. At each own turn, recover your Royals to full health and draw toward five cards. Income starts in round two. Use two orders. Play, marry, attack, build an estate, protect your crown, renew your hand, return a Royal, or claim the crown. Each costs one order; gold costs are shown. End early to conserve gold for responses.</p></article><article><h3>The crown victory</h3><p>Gather <b>three family Royals</b>: native Royals or foreign Royals married through a supported Queen. Pay tribute equal to the play costs of your exposed Royals. <b>Each rival House gets one full challenge turn.</b> If three family Royals remain after all have acted, win. Losing the declaration or suffering succession collapse breaks the claim. Tribute is spent even if the claim fails.</p></article><article><h3>Attacks and responses</h3><p>Select a Ready Royal and a highlighted target. Guardians enter upright. Ready Guardians must be attacked first. Resting Guardians do not protect other pieces. Both Royals deal damage. Once per rival turn: Brace for 2 gold (block 2), or spend 2 gold and a hidden Conspirator to Ambush (deal 3 first). Surviving attackers capture depleted defenders.</p></article><article><h3>Wealth and fragility</h3><p>Base income: 4 gold. Stewards add 1; estates add 2 and can be raided. Each Royal beyond three costs 1 upkeep; each foreign marriage adds 1. Five court seats; seven maximum hand cards. Shields protect the crown, not income pieces.</p></article><article><h3>Marriage and succession</h3><p>Each Queen in your family can marry one foreign Royal from your hand. Its income depends on her. Supported spouses count toward your dynasty; unsupported foreigners do not. Losing a Queen can break several links at once. At zero stability: lose a Royal and estate, break marriages, recover to 8. Collapse itself does not end the contest.</p></article><article><h3>History and the Witness</h3><p>In full games and the final lesson, forecast history occurs every fourth completed round. Each round adds one fragment, cycling between three paintings. If a painting reaches nine fragments before any House wins the crown, every House loses. Claims resolve after history and before a simultaneous Witness deadline.</p></article></div><p>Click/tap to select; ↗ or hover or hold to inspect. Keyboard: Tab, Enter, Escape. Family mode uses private handoffs on one shared device.</p>`,
    "wide",
  );
}
function settings() {
  modal(
    "Settings",
    `<div class="eyebrow">YOUR TABLE</div><h2>The chamber, your way.</h2>${(["sound", "motion", "coaching"] as const).map((k) => `<div class="setting"><div><h3>${k === "sound" ? "Sound & atmosphere" : k === "motion" ? "Motion & spectacle" : "Explain the strategy"}</h3><p>${k === "sound" ? "Synthesized ambience and responsive effects." : k === "motion" ? "Brief card movement and action feedback. Off is faster and calmer." : "Explain why moves matter beside the battlefield."}</p></div><button data-toggle="${k}" aria-pressed="${profile[k]}">${profile[k] ? "On" : "Off"}</button></div>`).join("")}<p class="muted">Progress saves in this browser. Family mode uses a shared device; online multiplayer is not included.</p>`,
  );
}
function archive() {
  leave();
  screen = "archive";
  app.innerHTML = `<div class="menu-shell">${header()}<main class="archive-page"><div class="eyebrow">THE HISTORICAL ARCHIVE · 84 ROYALS</div><h1>A bloodline worth remembering.</h1><p>Study the person. Read the role. Recognize the House.</p><div class="archive-tabs">${HOUSES.map((h) => `<button data-archive-house="${h.id}" class="${h.id === archiveHouse ? "active" : ""}">${crest(CARDS.find((c) => c.house === h.id)!.id)} ${h.name}</button>`).join("")}</div><div class="archive-grid">${CARDS.filter(
    (c) => c.house === archiveHouse,
  )
    .map((c) =>
      cardFace({
        uid: "archive:" + c.id,
        card: c.id,
        hp: spec(c.id).resolve,
        ready: false,
      }),
    )
    .join("")}</div></main></div>`;
}
function results() {
  if (!g || !g.over || overlay.querySelector(".result")) return;
  const id = `${g.seed}-${g.mode}-${g.turns}`;
  if (!profile.processed.includes(id)) {
    profile.processed.push(id);
    if (g.winner !== null && g.winner >= 0 && g.players[g.winner].human)
      profile.wins++;
    if (g.mode === "chronicle" && profile.run) {
      if (g.winner === 0 && profile.run.act < 2) profile.run.reward = true;
      else {
        profile.run = null;
      }
    }
    if (
      g.mode === "daily" &&
      g.winner === 0 &&
      (profile.daily?.date !== today() || profile.daily.rounds > g.round)
    )
      profile.daily = { date: today(), rounds: g.round };
    persist();
  }
  modal(
    "The table is decided",
    `<div class="result"><div class="result-crown">${g.winner === -1 ? "◈" : "♛"}</div><div class="eyebrow">${g.winner === -1 ? "THE WITNESS PREVAILS" : "A DYNASTY SECURED"}</div><h1>${g.winner === -1 ? "Every crown was temporary." : `${house(g.players[g.winner!].house).name} held the crown.`}</h1><p class="result-reason">${esc(g.reason)}</p><div class="result-scores">${g.players.map((p) => `<div><strong>${house(p.house).name}</strong><span>♟ ${dynastyCount(p)} family Royals</span><span>♥ ${p.stability} stability</span><span>${COIN} ${p.gold} gold</span></div>`).join("")}</div><p>${g.winner === -1 ? "Turn income into a dynasty before the record fills. The Witness counts rounds, never real time." : "Every rival had a full challenge turn. The declaration remained intact. Read the chronicle to see the contests that decided it."}</p><button class="primary" data-result-next>${profile.run?.reward ? "Choose your heirloom" : "Return to the great hall"} →</button><button class="secondary" data-log>Read the final chronicle</button></div>`,
    "wide",
  );
  sfx(g.winner === viewer ? "victory" : "history");
}
function rewards() {
  const r = profile.run;
  if (!r) return;
  modal(
    "Choose your heirloom",
    `<div class="eyebrow">VICTORY BECOMES AN INHERITANCE</div><h2>What will you carry forward?</h2><div class="reward-grid">${RELICS.filter(
      (x) => !r.relics.includes(x.id),
    )
      .map(
        (x) =>
          `<button data-reward="${x.id}"><span>${x.icon}</span><h3>${x.name}</h3><p>${x.text}</p></button>`,
      )
      .join("")}</div>`,
    "wide",
  );
}
function log() {
  modal(
    "The chronicle",
    `<div class="eyebrow">NEWEST EVENT FIRST</div><h2>Table history</h2><div class="chronicle-log">${
      g
        ? [...g.events]
            .reverse()
            .map(
              (e) =>
                `<article><small>Round ${e.round ?? "—"} · ${e.actor >= 0 ? house(g!.players[e.actor].house).name : "HISTORY"}</small><h3>${esc(e.title)}</h3><p>${esc(e.why)}</p></article>`,
            )
            .join("")
        : "Your first chronicle is unwritten."
    }</div>`,
    "wide",
  );
}

document.addEventListener("click", (e) => {
  if (performance.now() < suppressClickUntil) return;
  if ((e.target as HTMLElement).classList.contains("modal-shade")) {
    closeModal();
    return;
  }
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!b || b.disabled) return;
  try {
    unlockAudio();
  } catch {}
  const d = b.dataset;
  if (d.close !== undefined) {
    closeModal();
    return;
  }
  if (d.home !== undefined || d.save !== undefined) {
    home();
    return;
  }
  if (d.start) {
    start(d.start as Mode);
    return;
  }
  if (d.resume !== undefined) {
    resume();
    return;
  }
  if (d.house) {
    chosen = d.house as HouseId;
    renderChoose();
    return;
  }
  if (d.launch !== undefined) {
    launch();
    return;
  }
  if (d.confirmNew !== undefined) {
    screen = "choose-confirm";
    launch(mode === "lesson" ? "alba" : chosen, mode === "lesson" ? 3 : seats);
    return;
  }
  if (d.encounter) {
    encounter(d.encounter as HouseId);
    return;
  }
  if (d.lesson !== undefined) {
    lessonIntro();
    return;
  }
  if (d.rules !== undefined) {
    rules();
    return;
  }
  if (d.settings !== undefined) {
    settings();
    return;
  }
  if (d.toggle) {
    const k = d.toggle as "sound" | "motion" | "coaching";
    profile[k] = !profile[k];
    effects();
    persist();
    settings();
    return;
  }
  if (d.archive !== undefined) {
    archive();
    return;
  }
  if (d.archiveHouse) {
    archiveHouse = d.archiveHouse as HouseId;
    archive();
    return;
  }
  if (d.pile && g) {
    const p = g.players[viewer];
    modal(
      d.pile === "deck" ? "Draw pile" : "Discard pile",
      d.pile === "deck"
        ? `<h2>Your draw pile</h2><p>${p.deck.length} concealed Royals. At the start of your turn, draw until you have five cards. Renew hand spends one order and gold to discard your hand and draw five replacements.</p>`
        : `<h2>Your discard pile</h2><p>Defeated cards return here. If your draw pile empties, these cards become your draw pile.</p><div class="discard-list">${p.discard.map((r) => `<button data-inspect="${r.card}">${esc(card(r.card).name)}</button>`).join("") || "No discarded Royals."}</div>`,
    );
    return;
  }
  if (d.family !== undefined) {
    familySheet(Number(d.family));
    return;
  }
  if (d.economy !== undefined) {
    economySheet(Number(d.economy));
    return;
  }
  if (d.court !== undefined) {
    courtSheet(Number(d.court));
    return;
  }
  if (d.nextLesson !== undefined || d.restartLesson !== undefined) {
    const next = g!.lesson - 1 + (d.nextLesson !== undefined ? 1 : 0);
    if (next >= LESSONS.length) {
      g = null;
      closeModal();
      start("skirmish");
      return;
    }
    leave();
    g = createLesson(next);
    viewer = 0;
    selected = null;
    lastEvent = null;
    screen = "board";
    void mountBoard();
    persist();
    return;
  }
  if (d.royal) {
    if (overlay.contains(b)) return;
    if (screen !== "board") {
      inspect(d.cardId!);
      return;
    }
    if (locked || busy) return;
    const r = royalById(d.royal);
    if (!r) return;
    if (targets().includes(r.uid) && selected) {
      attackReview = { type: "attack", uid: selected, target: r.uid };
      renderDecision();
      drawTargetArrow();
      return;
    }
    attackReview = null;
    selected = selected === r.uid ? null : r.uid;
    sfx("select");
    renderBoard();
    if (selected && matchMedia("(max-width:760px)").matches)
      document
        .querySelector("#decision-panel")
        ?.scrollIntoView({ block: "nearest" });
    return;
  }
  if (d.inspect) {
    inspect(d.inspect);
    return;
  }
  if (d.target) {
    if (selected && targets().includes(d.target)) {
      attackReview = { type: "attack", uid: selected, target: d.target };
      renderDecision();
      drawTargetArrow();
    } else componentSheet(d.target);
    return;
  }
  if (d.manage !== undefined) {
    selected = null;
    attackReview = null;
    renderBoard();
    return;
  }
  if (d.move) {
    const move = JSON.parse(d.move);
    const view = describeAction(g!, move, viewer);
    if (!view.allowed) {
      toast(view.reason);
      return;
    }
    void execute(move);
    return;
  }
  if (d.end !== undefined) {
    void execute({ type: "end" });
    return;
  }
  if (d.response) {
    void execute(d.response as Response);
    return;
  }
  if (d.ready !== undefined) {
    unlockHandoff();
    return;
  }
  if (d.hint !== undefined && g) {
    const a = chooseMove(structuredClone(g), "adaptive");
    if ("uid" in a) {
      selected = a.uid;
      renderBoard();
    }
    if (a.type === "attack") attackReview = a;
    renderDecision();
    const panel = document.querySelector("#decision-panel")!;
    const help = document.createElement("p");
    help.className = "advisor-note";
    help.textContent = "ADVICE · " + describeAction(g, a, viewer).effect;
    panel.prepend(help);
    drawTargetArrow();
    return;
  }
  if (d.page) {
    page = Number(d.page);
    renderHand();
    return;
  }
  if (d.log !== undefined) {
    log();
    return;
  }
  if (d.forecast !== undefined && g) {
    const f = forecast(g);
    modal(
      "History forecast",
      `<div class="eyebrow">PUBLIC FORECAST · ${f.in} ROUNDS</div><h2>${f.name}</h2><p>${f.text}</p><div class="painting-gallery">${PAINTINGS.map((p, i) => `<article><div class="painting-image" style="background-image:url(/art/${["witness", "wolves", "last-witness"][i]}.webp)">${Array.from({ length: 9 }, (_, n) => `<i class="${n < paintingCounts(g!)[i] ? "revealed" : ""}"></i>`).join("")}</div><h3>${p}</h3><p>${paintingCounts(g!)[i]} revealed · nine completes the painting</p></article>`).join("")}</div><p>Eudoxia reveals one fragment after everyone has taken a turn. The paintings fill in rotation. If any painting completes before a House wins the crown, every House loses. Nothing advances while you think.</p>`,
    );
    return;
  }
  if (d.resultNext !== undefined) {
    closeModal();
    if (profile.run?.reward) rewards();
    else home();
    return;
  }
  if (d.reward && profile.run?.reward) {
    profile.run.relics.push(d.reward);
    profile.run.act++;
    profile.run.reward = false;
    g = null;
    persist();
    closeModal();
    map();
    return;
  }
  if (d.credits !== undefined)
    modal(
      "Credits",
      `<h2>Overlords & Outlaws</h2><p>Original concept and source material: © 2025 Malachy Murray. This revision follows the designer’s emphasis on family play, exposed power, inheritance, and legacy.</p><p>Historical figures meet across centuries. Roles, combat, economy and tuning values are prototype decisions. Generated art is not a verified likeness.</p><p>Three.js battlefield, original generated portraits, local fonts and synthesized audio. No paid packs, runtime AI, or account required.</p>`,
    );
});
app.addEventListener("contextmenu", (e) => {
  // The native browser menu is not part of game interaction.
});

let inspectTimer: ReturnType<typeof setTimeout> | undefined;
let gesture: {
  uid: string;
  x: number;
  y: number;
  dragging: boolean;
  touch: boolean;
} | null = null;
function hideHover() {
  clearTimeout(inspectTimer);
  const el = document.querySelector<HTMLElement>("#hover-inspector");
  if (el) {
    el.style.display = "none";
    el.innerHTML = "";
  }
  renderCardDetail();
}
function renderCardDetail(uid = selected) {
  const el = document.querySelector<HTMLElement>("#card-detail");
  if (!el || !g) return;
  const r = uid && !locked ? royalById(uid) : undefined;
  const owner =
    r &&
    g.players.find(
      (p) => p.court.includes(r) || (p.id === viewer && p.hand.includes(r)),
    );
  if (!r || !owner) {
    el.innerHTML = "";
    return;
  }
  const c = card(r.card),
    inCourt = owner.court.includes(r);
  el.innerHTML = `<div class="detail-heading"><img src="${portrait(r.card)}" alt=""><div><span class="eyebrow">${house(c.house).name} · ${spec(r).title}</span><h3>${esc(c.name)}</h3></div></div><div class="detail-stats"><span><b>${cost(owner, r, !!r.marriedTo)}</b> Gold</span><span><b>${spec(r).force}</b> Attack</span><span><b>${r.hp}</b> Health</span></div><p>${esc(abilityFor(r, owner))}</p><p class="detail-status">${inCourt ? `${active(owner, r) ? "Counts toward this family." : "Foreign Royal: needs a marriage."} ${r.ready ? "Ready to attack." : "Resting: can defend; readies next turn."}` : "In your hand · costs one order to play."}</p><button class="detail-inspect" data-inspect="${r.card}">Full card & rules ↗</button>`;
}
function showHover(button: HTMLElement) {
  if (locked || busy || overlay.innerHTML || !g) return;
  if (matchMedia("(min-width: 761px)").matches) {
    renderCardDetail(button.dataset.royal);
    return;
  }
  const r = royalById(button.dataset.royal!);
  if (!r) return;
  const owner = g.players.find(
    (p) => p.court.includes(r) || (p.id === viewer && p.hand.includes(r)),
  );
  if (!owner) return;
  const el = document.querySelector<HTMLElement>("#hover-inspector");
  if (!el) return;
  el.innerHTML =
    cardFace(r, { owner, zone: "hover-full-card" }) +
    `<div class="hover-status">${owner.court.includes(r) ? `${active(owner, r) ? "Counts toward " + house(owner.house).name + "’s family" : "Foreign Royal · needs a marriage"} · ${r.ready ? "Can attack" : "Can defend · attacks next turn"}` : "In your hand · " + house(card(r.card).house).name}</div>`;
  el.style.display = "block";
  const box = button.getBoundingClientRect(),
    w = el.offsetWidth,
    h = el.offsetHeight;
  el.style.left =
    Math.max(8, Math.min(innerWidth - w - 8, box.right + 12)) + "px";
  if (box.right + w + 12 > innerWidth)
    el.style.left = Math.max(8, box.left - w - 12) + "px";
  el.style.top =
    Math.max(8, Math.min(innerHeight - h - 8, box.y + box.height / 2 - h / 2)) +
    "px";
}
app.addEventListener("pointerover", (e) => {
  if (e.pointerType !== "mouse") return;
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-royal]");
  if (!b || b.contains(e.relatedTarget as Node)) return;
  hideHover();
  inspectTimer = setTimeout(() => showHover(b), 420);
});
app.addEventListener("pointerout", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-royal]");
  if (b && !b.contains(e.relatedTarget as Node)) hideHover();
});
app.addEventListener("focusin", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-royal]");
  if (b && !locked) renderCardDetail(b.dataset.royal);
});
function actionHelp(b: HTMLElement) {
  if (!g || locked || busy) return;
  const v = describeAction(g, JSON.parse(b.dataset.move!), viewer),
    el = document.querySelector<HTMLElement>("#hover-inspector");
  if (!el || matchMedia("(min-width:761px)").matches) return;
  el.innerHTML = `<div class="hover-status"><strong>${v.name}</strong><p>${v.gold ? `Pay ${v.gold} gold and ` : ""}${v.orders} order. ${esc(v.effect)}</p>${v.response ? `<p>${esc(v.response)}</p>` : ""}${v.reason ? `<p>${esc(v.reason)}</p>` : ""}</div>`;
  el.style.display = "block";
  const r = b.getBoundingClientRect();
  el.style.left =
    Math.max(8, Math.min(innerWidth - el.offsetWidth - 8, r.x)) + "px";
  el.style.top = Math.max(8, r.y - el.offsetHeight - 10) + "px";
}
app.addEventListener("pointerover", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-move]");
  if (e.pointerType === "mouse" && b && !b.contains(e.relatedTarget as Node)) {
    hideHover();
    inspectTimer = setTimeout(() => actionHelp(b), 350);
  }
});
app.addEventListener("pointerout", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-move]");
  if (b && !b.contains(e.relatedTarget as Node)) hideHover();
});
app.addEventListener("pointerdown", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-move]");
  if (e.pointerType !== "mouse" && b) {
    hideHover();
    inspectTimer = setTimeout(() => {
      actionHelp(b);
      suppressClickUntil = performance.now() + 1500;
    }, 450);
  }
});
document.addEventListener("pointerup", () => {
  if (!gesture) hideHover();
});
app.addEventListener("pointerdown", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-royal]");
  if (!b || screen !== "board" || busy || locked) return;
  gesture = {
    uid: b.dataset.royal!,
    x: e.clientX,
    y: e.clientY,
    dragging: false,
    touch: e.pointerType !== "mouse",
  };
  if (gesture.touch) {
    hideHover();
    inspectTimer = setTimeout(() => {
      showHover(b);
      suppressClickUntil = performance.now() + 1000;
    }, 450);
  }
});
document.addEventListener("pointermove", (e) => {
  if (!gesture || !g) return;
  if (Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 12) {
    if (gesture.touch) {
      gesture = null;
      hideHover();
      return;
    }
    gesture.dragging = true;
    hideHover();
    const r = royalById(gesture.uid);
    if (!r || g.turn !== viewer) return;
    const svg = document.querySelector<SVGSVGElement>("#target-arrow");
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
      svg.innerHTML = `<path d="M${gesture.x},${gesture.y} Q${e.clientX},${gesture.y - 50} ${e.clientX},${e.clientY}" fill="none" stroke="#f5ce80" stroke-width="4"/><circle cx="${e.clientX}" cy="${e.clientY}" r="9" fill="#f5ce80"/>`;
    }
  }
});
document.addEventListener("pointerup", (e) => {
  if (!gesture) return;
  const drag = gesture;
  gesture = null;
  hideHover();
  if (!drag.dragging || !g) return;
  suppressClickUntil = performance.now() + 250;
  const at = document.elementFromPoint(
    e.clientX,
    e.clientY,
  ) as HTMLElement | null;
  const p = g.players[viewer],
    r = royalById(drag.uid);
  if (!at || !r) return;
  selected = r.uid;
  if (p.hand.includes(r) && at.closest("#arena")) {
    const a: Move = { type: "deploy", uid: r.uid };
    const v = describeAction(g, a, viewer);
    if (v.allowed) void execute(a);
    else {
      toast(v.reason);
      renderBoard();
    }
  } else if (p.court.includes(r)) {
    const target = at.closest<HTMLElement>("[data-royal],[data-target]");
    const id = target?.dataset.royal ?? target?.dataset.target;
    if (id && targets().includes(id)) {
      attackReview = { type: "attack", uid: r.uid, target: id };
      renderDecision();
      drawTargetArrow();
    } else {
      toast(
        r.ready
          ? "Drop on a highlighted rival piece."
          : "This Royal can attack on your next turn.",
      );
      renderBoard();
    }
  } else renderBoard();
});
document.addEventListener("pointercancel", () => {
  gesture = null;
  hideHover();
  drawTargetArrow();
});
document.addEventListener("change", (e) => {
  const el = e.target as HTMLSelectElement;
  if (el.id === "seats") {
    seats = Number(el.value);
    renderChoose();
  }
  if (el.dataset.seatHouse) {
    const i = Number(el.dataset.seatHouse),
      other = seatHouses.indexOf(el.value as HouseId);
    if (other >= 0) seatHouses[other] = seatHouses[i];
    seatHouses[i] = el.value as HouseId;
    renderChoose();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (overlay.innerHTML) closeModal();
    else if (screen === "board") {
      attackReview = null;
      selected = null;
      hideHover();
      renderBoard();
    }
  }
  if (e.key === "Tab" && overlay.innerHTML) {
    const all = [
        ...overlay.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,select,a",
        ),
      ],
      first = all[0],
      last = all.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) persist();
});
home();
