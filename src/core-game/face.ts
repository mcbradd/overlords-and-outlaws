import { assetUrl } from "../assets";
import { BY_ID } from "./content";
import "./face.css";

export const SUIT_INK: Record<string, string> = {
  alba: "#31594e",
  plantagenet: "#835323",
  tudor: "#843b46",
  habsburg: "#54466f",
};
export const SUIT_SIGNS: Record<string, string> = {
  alba: "◆",
  plantagenet: "♜",
  tudor: "✿",
  habsburg: "✦",
};
export const rankLabel = (rank: number) =>
  ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][
    rank
  ] ?? String(rank);
export function escapeHTML(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
const images = new Map<string, Promise<HTMLImageElement>>();
const canvases = new Map<string, Promise<HTMLCanvasElement>>();
const urls = new Map<string, string>();
export const REFERENCE_BODY_PX = 32;
const RULE_AID_TOPICS = [
  {
    title: "Recruit",
    paragraphs: [
      "Play a card of your Dynasty from hand into your Court. If you have no supported ruler, it becomes your ruler. Otherwise it is a supporter.",
      "A Court card cannot use hand abilities. Rank stays printed; a higher number grants no extra office.",
      "Playing removes this card from hand. Played cards cannot act. They return to that area's owner next round. A captured card belongs to its new owner.",
    ],
  },
  {
    title: "Recall",
    paragraphs: [
      "Recall a rival Court person with a hand card of their Dynasty. One attempt per person per round, across all rivals.",
      "Their controller gets one answer: Defend (aid 3) or let it happen.",
      "If undefended, exchange your lead for the target. Target goes to your Played; lead goes to their Played. Both return to their new owners next round.",
      "Resolve lost offices and marriage support immediately. An interrupted Crown does not resume.",
    ],
  },
  {
    title: "Defend",
    paragraphs: [
      "Only the target's controller answers a Recall. Use a hand card matching the lead's Dynasty and strictly higher rank.",
      "Ace also answers J, Q or K. It cannot answer 2–10. Any 2–K answers Ace. Equal rank never answers.",
      "Lead goes to attacker's Played; answer goes to defender's Played. Target stays in Court. Both cards return next round.",
      "One answer only; no counter-answer. Declining gives you the attacking lead in exchange for the target (aid 2).",
    ],
  },
  {
    title: "Trade",
    paragraphs: [
      "Offer a hand card for one face-up card in a rival’s Played pile. Never request a hand or Court card. Declare whether the received card will Recruit. One offer per recipient each round.",
      "They may decline and keep their Played card. Keep your offer; this counts as Pass.",
      "On acceptance, both cards go to new owners' Played. A declared Recruit instead puts your received native card in Court only if lower than your offer. With no ruler, it becomes ruler. This never claims the Crown.",
      "You cannot retract an accepted offer.",
    ],
  },
  {
    title: "Name heir",
    paragraphs: [
      "With vacant Crown, choose a supported ruler and a different native supporter already in your Court. Play a further native hand card as heir; all three must differ.",
      "Crown goes to old ruler. Keep all three until next start, then move Crown and ruler office to heir.",
      "Keep the new ruler and original supporter for that entire round to win at its end. Old ruler is no longer required.",
      "Losing a required person immediately ends the claim. Replacing them never restores it; a new attempt needs a new qualifying heir.",
    ],
  },
  {
    title: "Marriage heir",
    paragraphs: [
      "With vacant Crown, a native ruler and a different unpaired native Queen already in Court, play a foreign heir equal or adjacent to the Queen's rank. A and K are not adjacent.",
      "Queen becomes supporter. Link the pair; follow aid 5's Crown clock.",
      "Either partner leaving breaks the pair. Capture sends that person to the captor's Played. If Queen leaves, an unsupported foreign spouse goes to its controller's Played and loses any office. The claim fails.",
      "Queen is a role, separate from rank Q.",
    ],
  },
  {
    title: "Round rhythm",
    paragraphs: [
      "One card action or Pass per turn, clockwise. Completed card plays reset consecutive passes; a declined Trade counts as Pass. Passing preserves later turns if play continues. Everyone passing consecutively ends the round; finish any pending answer first.",
      "At end: check Crown, then award a full successor reign. Otherwise round 12 ends in an Unsettled Crown draw.",
      "Next start: rotate first player; return Played; deal one card per seat starting there; transfer intact Crown; clear attempt/offer marks. Empty deck gives no draw. No reshuffle or hand limit.",
    ],
  },
  {
    title: "Set the table",
    paragraphs: [
      "Mix 2–4 Dynasty suits; deal eight each. Pass 3, then 2, then 1 clockwise. Play three matching Nobles: first is ruler, five stay hidden.",
      "A=1; J=11; Q=12; K=13. Rank is game allocation, not historical importance. Suit never changes with ownership or marriage.",
      "Courts, Played, Crown, marriage links, attempt and offer marks are public. Opponents' hand counts are public; unplayed identities stay private. Publicly revealed identities may be remembered.",
    ],
  },
  { title: "Return to hand", paragraphs: [
    "Spend your turn to move one of your Court Nobles into your hand. It is available from your next opportunity, including a defense. Clear consecutive passes.",
    "Returning a ruler leaves that office empty. Returning a required person breaks the Crown claim. Returning either spouse breaks the marriage; an unsupported foreign spouse goes to Played.",
    "The returned identity remains known, like every card seen in public.",
  ] },
  { title: "Inheritance details", paragraphs: [
    "Pass 3, then 2, then 1 clockwise, all packets together. Received cards may be passed. Reveal all matching trios together. Duplicate Dynasties are allowed.",
    "No trio? Reveal your hand, draw the top card, and set aside a different-Dynasty card. Choose your trio. Repair hands in first-player order.",
    "After declarations, shuffle set-aside cards into the remaining deck. Ordinary round draws never reshuffle.",
  ] },
] as const;
export const RULE_AIDS = RULE_AID_TOPICS.flatMap((aid, index) => {
  if (index < 3 || index >= 7)
    return [
      {
        id: String(index + 1),
        title: aid.title,
        paragraphs: [...aid.paragraphs],
      },
    ];
  const middle = 2;
  return [
    {
      id: `${index + 1}a`,
      title: `${aid.title} · a`,
      paragraphs: [
        ...aid.paragraphs.slice(0, middle),
        `Continue with rule aid ${index + 1}b.`,
      ],
    },
    {
      id: `${index + 1}b`,
      title: `${aid.title} · b`,
      paragraphs: [...aid.paragraphs.slice(middle)],
    },
  ];
});
const REFERENCE_INDEX = [
  "Native: Recruit or name an heir.",
  "Same suit: Recall or Defend.",
  "Trade for a rival’s Played card.",
  "Foreign heir: match a native Queen.",
  "Complete procedures: shared rule aids 1–10.",
];
let fonts: Promise<void> | undefined;
function loadFonts(): Promise<void> {
  return (fonts ??= Promise.all([
    new FontFace("Core Print Title", `url(${assetUrl("fonts/font-1.woff2")})`, {
      weight: "400 700",
    }).load(),
    new FontFace("Core Print Body", `url(${assetUrl("fonts/font-2.woff2")})`, {
      weight: "400 800",
    }).load(),
  ])
    .then((loaded) => {
      loaded.forEach((font) => document.fonts.add(font));
    })
    .catch((error) => {
      fonts = undefined;
      throw error;
    }));
}
function portrait(path: string): Promise<HTMLImageElement> {
  if (!images.has(path))
    images.set(
      path,
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => img.decode().then(() => resolve(img), reject);
        img.onerror = () => {
          images.delete(path);
          reject(new Error(`Portrait could not load: ${path}`));
        };
        img.src = assetUrl(path);
      }),
    );
  return images.get(path)!;
}
function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function lines(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
): string[] {
  const output: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      output.push(line);
      line = word;
    } else line = next;
  }
  if (line) output.push(line);
  return output;
}
/** Fixed 630 × 880 print face. The same pixels appear in hand, inspection and WebGL. */
async function compose(id: string): Promise<HTMLCanvasElement> {
  const card = BY_ID[id];
  if (!card) throw new Error(`Unknown core card: ${id}`);
  await loadFonts();
  const art = await portrait(card.artRef);
  const c = document.createElement("canvas");
  c.width = 630;
  c.height = 880;
  const ctx = c.getContext("2d")!;
  ctx.save();
  rounded(ctx, 0, 0, 630, 880, 26);
  ctx.clip();
  // Full bleed portrait: no rectangular gaps around a separately composited frame.
  const scale = Math.max(630 / art.width, 650 / art.height),
    w = art.width * scale,
    h = art.height * scale;
  ctx.drawImage(art, (630 - w) / 2, Math.min(0, (650 - h) * 0.18), w, h);
  const shade = ctx.createLinearGradient(0, 460, 0, 630);
  shade.addColorStop(0, "#11180e00");
  shade.addColorStop(1, "#11180e77");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 460, 630, 170);
  ctx.fillStyle = "#eee4cd";
  ctx.fillRect(0, 586, 630, 294);
  ctx.fillStyle = SUIT_INK[card.dynasty] ?? "#31594e";
  ctx.fillRect(0, 586, 630, 7);
  // Restrained engraved corners and rules remain inside the physical cut line.
  ctx.strokeStyle = "#bd9a55";
  ctx.lineWidth = 3;
  rounded(ctx, 11, 11, 608, 858, 19);
  ctx.stroke();
  ctx.lineWidth = 1;
  rounded(ctx, 18, 18, 594, 844, 14);
  ctx.stroke();
  for (const x of [33, 597])
    for (const y of [632, 847]) {
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x, y - 9);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x, y + 9);
      ctx.closePath();
      ctx.stroke();
    }
  ctx.fillStyle = "#eee4cd";
  rounded(ctx, 25, 25, 102, 163, 13);
  ctx.fill();
  ctx.strokeStyle = "#94723e";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = SUIT_INK[card.dynasty] ?? "#31594e";
  ctx.textAlign = "center";
  ctx.font = '700 72px "Core Print Body", sans-serif';
  ctx.fillText(rankLabel(card.rank), 76, 105);
  ctx.font = "43px Georgia, serif";
  ctx.fillText(SUIT_SIGNS[card.dynasty] ?? "◆", 76, 158);
  ctx.textAlign = "left";
  ctx.fillStyle = "#202e27";
  let size = 70;
  ctx.font = `700 ${size}px "Core Print Title", Georgia, serif`;
  let names = lines(ctx, card.name, 532);
  while (names.length > 2 && size > 56) {
    size -= 1;
    ctx.font = `700 ${size}px "Core Print Title", Georgia, serif`;
    names = lines(ctx, card.name, 532);
  }
  const first = names.length === 1 ? 694 : 656;
  names.forEach((line, i) => ctx.fillText(line, 49, first + i * 66));
  ctx.fillStyle = SUIT_INK[card.dynasty] ?? "#31594e";
  ctx.font = '600 30px "Core Print Body", sans-serif';
  ctx.fillText(
    `${card.dynasty[0].toUpperCase() + card.dynasty.slice(1)} · ${card.queen ? "Queen" : card.founder ? "Founder" : "Noble"}`,
    49,
    760,
  );
  ctx.strokeStyle = "#b6a888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(49, 782);
  ctx.lineTo(581, 782);
  ctx.stroke();
  ctx.fillStyle = "#29392d";
  ctx.font = '600 32px "Core Print Body", sans-serif';
  ctx.fillText("Recruit · Recall · Trade", 49, 824);
  ctx.restore();
  return c;
}
function referencePaper(): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 630;
  canvas.height = 880;
  const ctx = canvas.getContext("2d")!;
  rounded(ctx, 0, 0, 630, 880, 26);
  ctx.clip();
  ctx.fillStyle = "#eee4cd";
  ctx.fillRect(0, 0, 630, 880);
  ctx.strokeStyle = "#b49761";
  ctx.lineWidth = 3;
  rounded(ctx, 13, 13, 604, 854, 18);
  ctx.stroke();
  ctx.lineWidth = 1;
  rounded(ctx, 21, 21, 588, 838, 13);
  ctx.stroke();
  return { canvas, ctx };
}
function printParagraphs(
  ctx: CanvasRenderingContext2D,
  paragraphs: readonly string[],
  start: number,
  bottom: number,
  context: string,
  gap = 14,
): void {
  ctx.font = `500 ${REFERENCE_BODY_PX}px "Core Print Body", sans-serif`;
  ctx.fillStyle = "#25392f";
  ctx.textAlign = "left";
  let y = start;
  for (const paragraph of paragraphs) {
    for (const line of lines(ctx, paragraph, 538)) {
      if (y > bottom)
        throw new Error(
          `${context}: reference text exceeds readable print area at ${y}px; split the aid, do not shrink type.`,
        );
      ctx.fillText(line, 46, y);
      y += 41;
    }
    y += gap;
  }
}
async function composeReference(id: string): Promise<HTMLCanvasElement> {
  const card = BY_ID[id];
  if (!card) throw new Error(`Unknown core card: ${id}`);
  await loadFonts();
  const art = await portrait(card.artRef);
  const { canvas, ctx } = referencePaper();
  ctx.save();
  ctx.beginPath();
  ctx.rect(315, 23, 292, 244);
  ctx.clip();
  const scale = 292 / art.width;
  ctx.drawImage(art, 315, 23, 292, art.height * scale);
  ctx.restore();
  ctx.fillStyle = "#eee4cd";
  rounded(ctx, 31, 31, 93, 146, 12);
  ctx.fill();
  ctx.fillStyle = SUIT_INK[card.dynasty];
  ctx.textAlign = "center";
  ctx.font = '700 66px "Core Print Body", sans-serif';
  ctx.fillText(rankLabel(card.rank), 77, 105);
  ctx.font = "39px Georgia";
  ctx.fillText(SUIT_SIGNS[card.dynasty], 77, 156);
  ctx.textAlign = "left";
  ctx.font = '600 32px "Core Print Body", sans-serif';
  ctx.fillText("REFERENCE", 46, 218);
  ctx.fillText("ABILITY INDEX", 46, 258);
  ctx.fillStyle = "#25392f";
  ctx.textAlign = "left";
  let font = 65;
  ctx.font = `700 ${font}px "Core Print Title", Georgia, serif`;
  let names = lines(ctx, card.name, 538);
  while (names.length > 2 && font > 56) {
    font--;
    ctx.font = `700 ${font}px "Core Print Title", Georgia, serif`;
    names = lines(ctx, card.name, 538);
  }
  if (names.length > 2)
    throw new Error(`Reference name does not fit: ${card.name}`);
  names.forEach((line, i) =>
    ctx.fillText(line, 46, (names.length === 1 ? 359 : 326) + i * 65),
  );
  ctx.fillStyle = SUIT_INK[card.dynasty];
  ctx.font = '600 32px "Core Print Body", sans-serif';
  ctx.fillText(
    `${card.dynasty[0].toUpperCase() + card.dynasty.slice(1)} · ${card.queen ? "Queen" : card.founder ? "Founder" : "Noble"}`,
    46,
    440,
  );
  ctx.strokeStyle = "#b49761";
  ctx.beginPath();
  ctx.moveTo(46, 464);
  ctx.lineTo(584, 464);
  ctx.stroke();
  printParagraphs(ctx, REFERENCE_INDEX, 512, 828, `${id} reference index`, 14);
  return canvas;
}
export async function referenceAidCanvas(
  index: number,
): Promise<HTMLCanvasElement> {
  const aid = RULE_AIDS[index];
  if (!aid) throw new Error(`Unknown reference aid ${index}`);
  const key = `aid:${index}`;
  if (!canvases.has(key))
    canvases.set(
      key,
      loadFonts()
        .then(() => {
          const { canvas, ctx } = referencePaper();
          ctx.fillStyle = "#765923";
          ctx.textAlign = "left";
          ctx.font = '600 32px "Core Print Body", sans-serif';
          ctx.fillText(`RULE AID ${aid.id} · CORE SUCCESSION`, 46, 65);
          ctx.font = '700 62px "Core Print Title", Georgia, serif';
          ctx.fillStyle = "#25392f";
          ctx.fillText(aid.title, 46, 132);
          printParagraphs(
            ctx,
            aid.paragraphs,
            193,
            831,
            `Aid ${index + 1}: ${aid.title}`,
            14,
          );
          urls.set(key, canvas.toDataURL("image/png"));
          return canvas;
        })
        .catch((error) => {
          canvases.delete(key);
          throw error;
        }),
    );
  return canvases.get(key)!;
}
export function cardCanvas(
  id: string,
  reference = false,
): Promise<HTMLCanvasElement> {
  const key = reference ? `${id}:reference` : id;
  if (!canvases.has(key))
    canvases.set(
      key,
      (reference ? composeReference(id) : compose(id))
        .then((canvas) => {
          urls.set(key, canvas.toDataURL("image/png"));
          return canvas;
        })
        .catch((error) => {
          canvases.delete(key);
          throw error;
        }),
    );
  return canvases.get(key)!;
}
export async function preloadCards(ids: readonly string[]): Promise<void> {
  await Promise.all(
    [...new Set(ids)].flatMap((id) => [cardCanvas(id), cardCanvas(id, true)]),
  );
  await Promise.all(RULE_AIDS.map((_, index) => referenceAidCanvas(index)));
}
export interface FaceOptions {
  reference?: boolean;
  back?: boolean;
}
/** Noninteractive inner markup: the caller owns button semantics and action handlers. */
export function faceHTML(id: string, options: FaceOptions = {}): string {
  if (options.back)
    return '<span class="core-face core-card-back" role="img" aria-label="Concealed card"><span aria-hidden="true">✦</span></span>';
  const card = BY_ID[id];
  if (!card)
    return '<span class="core-face core-face-loading" role="status">Card unavailable</span>';
  const label = `${card.name}, ${card.dynasty}, rank ${rankLabel(card.rank)}, ${card.queen ? "Queen" : card.founder ? "Founder" : "Noble"}${options.reference ? `. Reference ability index. ${REFERENCE_INDEX.join(" ")}` : ""}`;
  const src = urls.get(options.reference ? `${id}:reference` : id);
  return `<span class="core-face${options.reference ? " core-face-reference" : ""}" data-card-face="${escapeHTML(id)}">${src ? `<img src="${src}" alt="${escapeHTML(label)}" width="630" height="880" draggable="false">` : `<span class="core-face-loading" role="status">Preparing ${escapeHTML(card.name)}…</span>`}</span>`;
}
/** Readable shared physical rule aids. The parent includes these in inspection/rules, outside the tutorial. */
export function referenceAidsHTML(): string {
  return `<div class="core-reference-aids">${RULE_AIDS.map((aid, index) => {
    const src = urls.get(`aid:${index}`),
      text = `Rule aid ${aid.id}: ${aid.title}. ${aid.paragraphs.join(" ")}`;
    return `<figure class="core-reference-aid">${src ? `<img src="${src}" width="630" height="880" alt="${escapeHTML(text)}">` : "<p>Preparing rule aid…</p>"}</figure>`;
  }).join("")}</div>`;
}
export function cardBackCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 630;
  c.height = 880;
  const ctx = c.getContext("2d")!;
  rounded(ctx, 0, 0, 630, 880, 26);
  ctx.clip();
  ctx.fillStyle = "#203d35";
  ctx.fillRect(0, 0, 630, 880);
  ctx.strokeStyle = "#68816a";
  ctx.lineWidth = 1.5;
  for (let i = -880; i < 1510; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 880, 880);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i + 880, 0);
    ctx.lineTo(i, 880);
    ctx.stroke();
  }
  ctx.fillStyle = "#203d35";
  ctx.beginPath();
  ctx.ellipse(315, 440, 176, 225, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d0b176";
  ctx.lineWidth = 4;
  ctx.stroke();
  rounded(ctx, 19, 19, 592, 842, 16);
  ctx.stroke();
  rounded(ctx, 29, 29, 572, 822, 11);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = "#dec58f";
  ctx.font = "115px Georgia";
  ctx.fillText("✦", 315, 473);
  return c;
}
