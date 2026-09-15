import "./style.css";
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
import { cardFace, abilityFor, esc } from "./cards";
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
  app.innerHTML = `<div class="home-shell">${header()}<main class="home-hero"><div><div class="eyebrow">A FAMILY OF RIVALS · A TABLE OF CONSEQUENCES</div><h1>Anyone can take<br>a crown.<br><em>Can you keep it?</em></h1><p>Raise a House. Swear an alliance. Conceal your next move.<br>The more power you expose, the more there is to lose.</p><div class="home-actions"><button class="primary" data-start="lesson">Learn to hold power →</button><button class="secondary" data-start="family">Gather the family <small>2–4 PLAYERS</small></button></div>${g && !g.over ? '<button class="resume" data-resume>● Your table is saved — resume →</button>' : ""}<div class="home-meta">SOLO WITH AI · LOCAL SHARED TABLE · NO CARD PACKS</div></div><div class="hero-cards">${cardFace({ uid: "hero1", card: "alba-3", hp: 6, ready: false })}${cardFace({ uid: "hero2", card: "tudor-1", hp: 4, ready: false })}${cardFace({ uid: "hero3", card: "plantagenet-2", hp: 3, ready: false })}</div></main><section class="mode-grid"><button data-start="chronicle"><span>01 / THE CHRONICLE</span><h2>A dynasty is earned.</h2><p>Three courts. Choose a road, earn an heirloom, carry your legacy.</p><b>Begin a chronicle ↗</b></button><button data-start="skirmish"><span>02 / THE OPEN TABLE</span><h2>Every House has a plan.</h2><p>Six bloodlines. Two to four Houses. Competing claims and shifting threats.</p><b>Choose your rivals ↗</b></button><button data-start="daily"><span>03 / ${today()} UTC</span><h2>The daily inheritance.</h2><p>A fixed table and shared seed. Find a better line through the same decisions.</p><b>Take today’s seat ↗</b></button></section><footer>A game concept by Malachy Murray <button data-credits>Credits & source decisions</button></footer></div>`;
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
  app.innerHTML = `<div class="menu-shell">${header()}<main class="choose-page"><div class="eyebrow">${mode === "family" ? "PASS THE DEVICE. KEEP YOUR SECRETS." : "CHOOSE YOUR INHERITANCE"}</div><h1>${mode === "family" ? "A seat for every generation." : "Every bloodline holds power differently."}</h1><p>${mode === "family" ? "Every House is human-controlled. Private handoffs hide concealed cards between turns and defensive responses." : "Threaten their growth, protect your own, and survive the attention a crown attracts."}</p><div class="house-grid">${HOUSES.map((h) => `<button class="house-choice ${chosen === h.id ? "chosen" : ""}" data-house="${h.id}" ${mode === "daily" ? "disabled" : ""} style="--house:${h.color}"><img src="/art/${h.id}.webp" alt="${h.leader}"><span>${h.emblem}</span><div><small>${h.region}</small><h2>${h.name}</h2><p>${HOUSE_RULES[h.id].trait}</p></div></button>`).join("")}</div><p class="turn-order-note">First to act: ${house(chosen).name}. Turns proceed clockwise through the displayed seats.</p><div class="seat-roster">${
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
  viewer = 0;
  page = 0;
  lastEvent = g.events.at(-1)!;
  screen = "board";
  mountBoard();
  persist();
  if (mode === "lesson") lessonIntro();
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
  app.innerHTML = `<div class="battle-shell"><header class="battle-top"><button class="small-brand" data-home>♛ <span>OVERLORDS & OUTLAWS</span></button><div class="objective">THREE FAMILY ROYALS · WITHSTAND EVERY HOUSE</div><div><button data-rules aria-label="How to play">?</button><button data-settings aria-label="Settings">⚙</button><button data-save>Save & leave</button></div></header><div id="scoreboard" class="scoreboard"></div><main class="table-zone"><div class="arena-column"><div class="arena-label"><span id="turn-label"></span><span id="history-label"></span></div><div id="arena" class="arena"></div><div id="event-focus" class="event-focus" aria-live="polite"></div></div><aside id="decision-panel" class="decision-panel"></aside></main><section id="hand-dock" class="hand-dock"></section><div id="handoff-layer"></div><div id="battle-banner" aria-live="assertive"></div></div>`;
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
  effects();
  const t = targets();
  document
    .querySelector("#scoreboard")!
    .setAttribute("data-seats", String(g.players.length));
  document.querySelector("#scoreboard")!.innerHTML = g.players
    .map(
      (p) =>
        `<section class="court-score ${p.id === viewer ? "you" : ""} ${g!.turn === p.id ? "current" : ""} ${p.claim ? "claiming" : ""}" style="--house:${house(p.house).color}" data-score="${p.id}"><button class="crown-seal ${t.includes("crown-" + p.id) ? "targetable" : ""}" data-target="crown-${p.id}" aria-label="${house(p.house).name} crown, ${p.stability} stability">${house(p.house).emblem}</button><div class="score-main"><div class="score-title"><strong>${house(p.house).name}</strong><small>${p.human ? "HUMAN" : p.policy.toUpperCase()}</small><b class="stability ${p.stability < 5 ? "danger" : ""}" title="At zero: succession collapse">♥ ${p.stability}<span>STABILITY</span></b></div><div class="claim-requirements"><span class="${dynastyCount(p) >= 3 ? "met" : ""}">♟ <b>${dynastyCount(p)}</b> family Royals <small>need 3</small></span><span>⛨ ${p.shield} shields</span></div><div class="claim-track ${p.claim ? "active" : ""}">${p.claim ? `<b>TO CONTEST: ${p.challengers.map((id) => house(g!.players[id].house).name).join(" · ")}</b>` : canHold(p) ? `<b>${p.gold >= claimCost(p) ? "READY TO CLAIM" : "SAVE " + (claimCost(p) - p.gold) + " MORE GOLD"} · TRIBUTE ${claimCost(p)}</b>` : "Gather three Royals by blood or marriage"}</div></div><div class="economy-readout"><span>✧ <b>${p.gold}</b></span><button data-target="estate-${p.id}" class="${t.includes("estate-" + p.id) ? "targetable" : ""}" title="Estates can be raided">⌂ ${p.estates}</button><small>${income(p) >= 0 ? "+" : ""}${income(p)} gold/turn</small><small>${p.hand.length} hidden</small></div></section>`,
    )
    .join("");
  const f = forecast(g);
  document.querySelector("#turn-label")!.textContent =
    `ROUND ${g.round} · ${house(g.players[g.turn].house).name.toUpperCase()} · ${g.orders} ORDERS LEFT`;
  document.querySelector("#history-label")!.innerHTML =
    g.mode === "lesson"
      ? "<button data-lesson>Learning guide ↗ · History paused</button>"
      : `<span class="${g.witness >= WITNESS_LIMIT - 4 ? "danger" : ""}">◈ WITNESS ${Math.max(...paintingCounts(g))} OF 9</span><button data-forecast>${f.name} · in ${f.in} rounds</button>`;
  renderHand();
  renderDecision();
  renderEvent();
  field?.sync(g, selected, t, viewer);
  if (g.over) results();
}
function renderHand() {
  if (!g) return;
  const p = g.players[viewer];
  page = Math.min(page, Math.max(0, Math.ceil(p.hand.length / 5) - 1));
  const canPlay =
    g.turn === viewer && !busy && !g.pending && !locked && !g.over;
  document.querySelector("#hand-dock")!.innerHTML =
    `<div class="hand-topline"><div><span class="eyebrow">${house(p.house).name.toUpperCase()} · CONCEALED OUTLAWS</span><small>Opening treasury: 5 gold. Income begins in round two.</small></div><div class="turn-tools"><span class="gold-count">✧ ${p.gold}<small>GOLD</small></span><span class="order-count">${"◆".repeat(g.orders)}${"◇".repeat(2 - g.orders)}<small>ORDERS</small></span><button class="hint" data-hint ${!canPlay ? "disabled" : ""}>Suggest a plan</button><button class="end-turn" data-end ${!canPlay ? "disabled" : ""}>${g.orders ? "End turn" : "Pass the table"} →</button></div></div><div class="hand-cards" data-card-area="hand">${
      locked
        ? '<div class="empty-hand">The hand is concealed.</div>'
        : p.hand
            .slice(page * 5, page * 5 + 5)
            .map((r) =>
              cardFace(r, {
                owner: p,
                zone: "hand-card",
                selected: selected === r.uid,
              }),
            )
            .join("")
    }</div>${p.hand.length > 5 ? `<div class="hand-pages"><button data-page="0" ${page === 0 ? "disabled" : ""}>←</button><span>${page + 1} of 2</span><button data-page="1" ${page === 1 ? "disabled" : ""}>→</button></div>` : ""}`;
}
function order(move: Move, label: string, detail: string, cls = "") {
  const valid =
    g && moves(g).some((a) => JSON.stringify(a) === JSON.stringify(move));
  return `<button class="order-button ${cls}" data-move='${JSON.stringify(move)}' ${!valid || busy || g!.turn !== viewer || locked ? "disabled" : ""}><strong>${label}</strong><small>${detail}</small></button>`;
}
function renderDecision() {
  if (!g) return;
  const p = g.players[viewer],
    r = selected ? royalById(selected) : undefined,
    isOwn = r && p.court.includes(r),
    inHand = r && p.hand.includes(r);
  let html = "";
  if (
    g.pending &&
    g.players[g.pending.defender].human &&
    !busy &&
    !locked &&
    viewer === g.pending.defender
  ) {
    const a = royalById(g.pending.attacker)!;
    html = `<div class="eyebrow danger">YOUR COURT IS CHALLENGED</div><h2>Answer the threat.</h2><p><b>${card(a.card).name}</b> brings ${spec(a).force} force.</p><div class="response-options">${reactions(
      g,
    )
      .map(
        (x) =>
          `<button data-response="${x}" class="${x === "accept" ? "secondary" : "primary"}">${x === "accept" ? "Accept · keep gold" : x === "brace" ? "Brace · 1 gold" : "Ambush · 1 gold + card"}<small>${x === "ambush" ? "Conspirator deals 3 before combat" : x === "brace" ? "Block 2 · one response this rival turn" : "Normal combat resolves"}</small></button>`,
      )
      .join("")}</div>`;
  } else if (attackReview?.type === "attack" && r) {
    const a = attackReview,
      target = royalById(a.target!),
      q = g.players.find(
        (p) =>
          p.court.some((r) => r.uid === a.target) ||
          a.target === `crown-${p.id}` ||
          a.target === `estate-${p.id}`,
      )!;
    html = `<div class="eyebrow">CHALLENGE PREVIEW · 1 ORDER</div><h2>${target ? esc(card(target.card).name) : a.target?.startsWith("estate") ? "Raid the estate" : "Pressure the crown"}</h2><div class="combat-equation"><span><b>${spec(r).force}</b> outgoing force</span><span><b>${target ? spec(target).force : 0}</b> retaliation</span></div><p>${target ? `Without a response: target resolve ${target.hp} → ${Math.max(0, target.hp - spec(r).force)}. Your resolve ${r.hp} → ${Math.max(0, r.hp - spec(target).force)}.` : explain(g, a)}</p><p class="response-warning">${q.response && q.gold ? "The defender has gold reserved: Brace can block 2, or a concealed Conspirator may Ambush for 3." : "The defender cannot buy a response this turn."}</p>${order(a, "Declare this challenge", "The defender responds before pressure resolves", "primary-order")}`;
  } else if (r && !locked) {
    html = `<div class="selection-heading"><span class="eyebrow">${inHand ? "CONCEALED OPTION" : isOwn ? "YOUR EXPOSED ROYAL" : "EXPOSED RIVAL"}</span><button data-inspect="${r.card}" aria-label="Inspect full card">↗</button></div><div class="selected-card-preview">${cardFace(r, { owner: inHand || isOwn ? p : undefined, zone: "preview-card" })}</div><div class="selection-summary"><h3>${esc(card(r.card).name)}</h3><p>${spec(r).force} force · ${r.hp} resolve<br>${abilityFor(r, p)}</p></div><div class="selected-orders">${inHand ? order({ type: "deploy", uid: r.uid }, `Expose · ${cost(p, r)} gold`, "1 order · enters resting unless Swift", "primary-order") + (card(r.card).house !== p.house ? order({ type: "marry", uid: r.uid }, `Marry · ${cost(p, r, true)} gold`, "1 order · active Queen required") : "") : isOwn ? `<p class="target-instruction">${r.ready ? "Choose a highlighted rival Royal, crown, or estate to challenge." : "Resting until your next turn."}</p>${order({ type: "recall", uid: r.uid }, "Recall to hand", "1 order · restore resolve · lose exposed presence")}` : '<p class="target-instruction">Select your ready Royal to challenge. Confront Guardians first.</p>'}</div>`;
  } else
    html = `<div class="eyebrow">THE WEIGHT OF THE CROWN</div><h2>Power has a price.</h2><div class="victory-recipe"><b>♟ ♟ ♟</b><span>Three family Royals<br>establish your dynasty.</span></div><p>Claim the crown. <b>Each other House gets one complete challenge turn.</b> Keep your three family Royals through all of them.</p><div class="strategy-wheel"><span>⚔ Pressure punishes greed</span><span>⛨ Defense checks pressure</span><span>✧ Growth outlasts defense</span></div>`;
  html += `<button class="manage-link" data-manage>Manage House / clear selection</button><div class="infrastructure"><div class="section-title">MANAGE YOUR HOUSE <span>1 ORDER EACH</span></div>${order({ type: "estate" }, "⌂ Invest · 3 gold", `${p.estates} estates · +2 income`)}${order({ type: "fortify" }, "⛨ Fortify · 2 gold", "+3 shields · crown only")}${order({ type: "restore" }, "♥ Restore · 2 gold", "+3 stability · prevent collapse")}${order({ type: "recruit" }, `✧ Recruit · ${p.house === "valois" ? 1 : 2} gold`, "Draw one extra Royal")}</div>${order({ type: "claim" }, p.claim ? "CROWN CLAIMED" : `♛ CLAIM · ${claimCost(p)} GOLD`, `Tribute = exposed Royals’ printed gold costs`, "claim-button")}<div class="upkeep-note">Income ${income(p) >= 0 ? "+" : ""}${income(p)} · includes ${upkeep(p)} upkeep<br>Large courts and marriages cost gold.</div>`;
  document
    .querySelector("#decision-panel")!
    .classList.toggle("has-selection", !!r);
  document
    .querySelector("#decision-panel")!
    .classList.toggle("reacting", !!g.pending);
  document
    .querySelector("#decision-panel")!
    .classList.toggle("reviewing", !!attackReview);
  document.querySelector("#decision-panel")!.innerHTML = html;
}
function renderEvent() {
  const el = document.querySelector("#event-focus"),
    e = lastEvent ?? g?.events.at(-1);
  if (el)
    el.innerHTML = e
      ? `<span class="event-icon">${e.kind === "claim" ? "♛" : e.kind === "combat" ? "⚔" : "✦"}</span><div><strong>${e.actor >= 0 && g ? house(g.players[e.actor].house).name + " · " : ""}${esc(e.title)}</strong><p>${profile.coaching ? esc(e.why) : ""}</p></div><button data-log aria-label="Open chronicle">☷</button>`
      : "";
}
function banner(e: Moment) {
  if (e.kind !== "turn" || !lastEvent) lastEvent = e;
  renderEvent();
  document.querySelector("#announcer")!.textContent = `${e.title}. ${e.why}`;
  if (
    [
      "claim",
      "broken",
      "collapse",
      "countdown",
      "history",
      "ambush",
      "capture",
    ].includes(e.kind)
  ) {
    const el = document.querySelector("#battle-banner")!;
    el.className = "show " + e.kind;
    el.innerHTML = `<small>${e.actor >= 0 ? house(g!.players[e.actor].house).name.toUpperCase() : "HISTORY BELONGS TO NO HOUSE"}</small><strong>${esc(e.title)}</strong>`;
    setTimeout(() => (el.className = ""), 1900);
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
    banner(e);
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
    await field?.animate(e);
    if (
      profile.motion &&
      ["turn", "claim", "broken", "history"].includes(e.kind)
    )
      await new Promise((r) => setTimeout(r, 450));
  }
  if (token === epoch) renderBoard();
}
async function execute(move: Move | Response) {
  if (!g || busy || locked) return;
  const token = epoch;
  busy = true;
  selected = null;
  attackReview = null;
  const serial = g.serial;
  try {
    if (typeof move === "string") respond(g, move);
    else act(g, move);
    persist();
    renderHand();
    renderDecision();
    await present(g.events.filter((e) => e.id > serial));
  } catch (err) {
    toast((err as Error).message);
  } finally {
    if (token === epoch) busy = false;
  }
  if (token === epoch) {
    renderBoard();
    await advance();
  }
}
async function advance() {
  if (!g || screen !== "board" || busy || locked) return;
  if (g.over) {
    results();
    return;
  }
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
    await execute(chooseMove(g));
}
function handoff(id: number) {
  if (!g) return;
  locked = true;
  handOffTo = id;
  selected = null;
  closeModal();
  renderBoard();
  document.querySelector("#handoff-layer")!.innerHTML =
    `<div class="handoff-screen"><div class="handoff-seal">${house(g.players[id].house).emblem}</div><div class="eyebrow">PRIVATE HANDOFF</div><h1>Pass the table to<br>${house(g.players[id].house).name}.</h1><p>${g.pending ? "Your court is challenged. Choose your private response." : "Your concealed hand stays hidden until you are ready."}</p><button class="primary" data-ready>Only ${house(g.players[id].house).name} is looking · reveal →</button><small>Other players should look away. A shared screen cannot enforce physical privacy.</small></div>`;
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
  modal(
    "The first lesson",
    `<div class="eyebrow">THE FIRST LESSON · THREE HOUSES</div><h2>The crown is a promise.<br>Make one you can keep.</h2><div class="lesson-steps"><article><b>1</b><h3>Build a dynasty</h3><p>Gather three Royals by blood or marriage: the three-Royal declaration, extended here to supported marriages. Spend gold and one of two orders each turn. Stewards earn income; Guardians protect pieces.</p></article><article><b>2</b><h3>Contest exposed power</h3><p>A ready Royal challenges a rival. Force deals pressure; resolve measures endurance. Defenders can spend gold or a hidden Conspirator to answer.</p></article><article><b>3</b><h3>Claim, then hold</h3><p>Press Claim. Each other House gets one complete turn to contest you. Keep three family Royals through every challenge. The Houses still to respond are named above the table.</p></article></div><p><b>Guided practice: history and Eudoxia are paused. Rivals develop and challenge each other; they do not attack you or claim. In a normal table, every House contests your crown.</b> The game ends only when a House holds its declared dynasty. Nothing advances while you think.</p><button class="primary" data-close>Take my seat →</button>`,
    "wide",
  );
}
function inspect(id: string) {
  const c = card(id),
    h = house(c.house);
  modal(
    c.name,
    `<div class="inspect-layout"><div>${cardFace({ uid: "inspect", card: id, hp: spec(id).resolve, ready: false }, { zone: "inspect-card" })}</div><article><div class="eyebrow">${h.region} · ${h.name.toUpperCase()}</div><h2>${esc(c.name)}</h2><em>${esc(c.epithet)}</em><p>${ROLES[c.role].ability}</p><dl><dt>✧ Gold</dt><dd>Cost to expose, plus one order.</dd><dt>⚔ Force</dt><dd>Pressure dealt. Royals retaliate simultaneously.</dd><dt>◆ Resolve</dt><dd>Endurance. At zero, captured or displaced.</dd></dl><h3>${HOUSE_RULES[h.id].trait}</h3><p>${HOUSE_RULES[h.id].text}</p><p class="muted">Historical person; fictional game abilities. Art is an interpretation, sometimes shared by court archetypes. The archive spans centuries, not one contemporaneous family tree.</p></article></div>`,
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
function rules() {
  modal(
    "How to play",
    `<div class="eyebrow">SIMPLE ORDERS. COMPLICATED LOYALTIES.</div><h2>How to hold a dynasty.</h2><div class="rules-grid"><article><h3>Your turn</h3><p>Start with 5 gold. From round two, receive income; draw toward five cards. Use two orders. Deploy, marry, challenge, invest, fortify, restore, recruit, recall, or claim. Each costs one order; gold costs are shown. End early to conserve gold for responses.</p></article><article><h3>The crown victory</h3><p>Gather <b>three family Royals</b>: native Royals or foreign Royals married through a supported Queen. Pay tribute equal to the printed gold costs of your exposed Royals. <b>Each rival House gets one full challenge turn.</b> If three family Royals remain after all have acted, win. Losing the declaration or suffering succession collapse breaks the claim. Tribute is spent even if the claim fails.</p></article><article><h3>Force and response</h3><p>Select a ready Royal and a highlighted target. Guardians must be confronted first. Both Royals deal pressure. Once per rival turn: Brace for 1 gold (block 2), or spend 1 gold and a hidden Conspirator to Ambush (deal 3 first). Surviving attackers capture depleted defenders.</p></article><article><h3>Wealth and fragility</h3><p>Base income: 4 gold. Stewards add 1; estates add 2 and can be raided. Each Royal beyond three costs 1 upkeep; each foreign marriage adds 1. Five court seats; seven maximum hand cards. Shields protect the crown, not income pieces.</p></article><article><h3>Marriage and succession</h3><p>An active Queen can marry a foreign Royal from hand. Its income depends on her. Supported spouses count toward your dynasty; unsupported foreigners do not. Losing a Queen can break several links at once. At zero stability: lose a Royal and estate, break marriages, recover to 8. Collapse itself does not end the contest.</p></article><article><h3>History and the Witness</h3><p>Outside lessons, forecast history occurs every fourth completed round. Each round adds one fragment, cycling between three paintings. The first completed nine-fragment painting defeats every unproven House. Claims resolve after history and before a simultaneous Witness deadline.</p></article></div><p>The three-Royal declaration is source-derived; counting supported marriages is this revision’s adaptation. Costs, force, resolve, limits and Witness pace are explicit prototype tuning values, not historical facts. Claim duration comes from the actual rival Houses.</p><p>Click/tap to select; ↗ or right-click to inspect. Keyboard: Tab, Enter, Escape. Family mode uses private handoffs on one shared device.</p>`,
    "wide",
  );
}
function settings() {
  modal(
    "Settings",
    `<div class="eyebrow">YOUR TABLE</div><h2>The chamber, your way.</h2>${(["sound", "motion", "coaching"] as const).map((k) => `<div class="setting"><div><h3>${k === "sound" ? "Sound & atmosphere" : k === "motion" ? "Motion & spectacle" : "Explain the strategy"}</h3><p>${k === "sound" ? "Synthesized ambience and responsive effects." : k === "motion" ? "3D movement, particles and impacts. Off is faster and calmer." : "Explain why moves matter beside the battlefield."}</p></div><button data-toggle="${k}" aria-pressed="${profile[k]}">${profile[k] ? "On" : "Off"}</button></div>`).join("")}<p class="muted">Progress saves in this browser. Family mode uses a shared device; online multiplayer is not included.</p>`,
  );
}
function archive() {
  leave();
  screen = "archive";
  app.innerHTML = `<div class="menu-shell">${header()}<main class="archive-page"><div class="eyebrow">THE HISTORICAL ARCHIVE · 84 ROYALS</div><h1>A bloodline worth remembering.</h1><p>Study the person. Read the role. Recognize the House.</p><div class="archive-tabs">${HOUSES.map((h) => `<button data-archive-house="${h.id}" class="${h.id === archiveHouse ? "active" : ""}">${h.emblem} ${h.name}</button>`).join("")}</div><div class="archive-grid">${CARDS.filter(
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
    `<div class="result"><div class="result-crown">${g.winner === -1 ? "◈" : "♛"}</div><div class="eyebrow">${g.winner === -1 ? "THE WITNESS PREVAILS" : "A DYNASTY SECURED"}</div><h1>${g.winner === -1 ? "Every crown was temporary." : `${house(g.players[g.winner!].house).name} held the crown.`}</h1><p class="result-reason">${esc(g.reason)}</p><div class="result-scores">${g.players.map((p) => `<div><strong>${house(p.house).name}</strong><span>♟ ${dynastyCount(p)} family Royals</span><span>♥ ${p.stability} stability</span><span>✧ ${p.gold} gold</span></div>`).join("")}</div><p>${g.winner === -1 ? "Turn income into a dynasty before the record fills. The Witness counts rounds, never real time." : "Every rival had a full challenge turn. The declaration remained intact. Read the chronicle to see the contests that decided it."}</p><button class="primary" data-result-next>${profile.run?.reward ? "Choose your heirloom" : "Return to the great hall"} →</button><button class="secondary" data-log>Read the final chronicle</button></div>`,
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
    `<div class="eyebrow">CAUSE. RESPONSE. CONSEQUENCE.</div><h2>The table remembers.</h2><div class="chronicle-log">${
      g
        ? [...g.events]
            .reverse()
            .map(
              (e) =>
                `<article><small>${e.actor >= 0 ? house(g!.players[e.actor].house).name : "HISTORY"}</small><h3>${esc(e.title)}</h3><p>${esc(e.why)}</p></article>`,
            )
            .join("")
        : "Your first chronicle is unwritten."
    }</div>`,
    "wide",
  );
}

document.addEventListener("click", (e) => {
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
      return;
    }
    attackReview = null;
    selected = selected === r.uid ? null : r.uid;
    sfx("select");
    renderBoard();
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
    } else courtSheet(Number(d.target.split("-")[1]));
    return;
  }
  if (d.manage !== undefined) {
    selected = null;
    attackReview = null;
    renderBoard();
    return;
  }
  if (d.move) {
    void execute(JSON.parse(d.move));
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
    lastEvent = {
      id: -1,
      kind: "hint",
      actor: viewer,
      title:
        a.type === "attack"
          ? "Suggested challenge"
          : a.type === "end"
            ? "Save your gold and pass"
            : `Consider ${a.type}`,
      why: explain(g, a),
    };
    renderEvent();
    if (!("uid" in a)) toast(explain(g, a));
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
      `<div class="eyebrow">PUBLIC FORECAST · ${f.in} ROUNDS</div><h2>${f.name}</h2><p>${f.text}</p><p>${PAINTINGS.map((p, i) => `<p><b>${p}</b> · ${paintingCounts(g!)[i]} of 9 fragments</p>`).join("")}Each painting needs nine fragments. Strokes cycle between paintings, one per round. Nothing advances while you think.</p>`,
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
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-card-id]");
  if (b) {
    e.preventDefault();
    inspect(b.dataset.cardId!);
  }
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
      selected = null;
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
