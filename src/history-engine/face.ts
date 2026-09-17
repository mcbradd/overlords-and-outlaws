import { assetUrl } from "../assets";
import { MANIFEST, SOURCE } from "./content";
export const DYNASTY_COLORS: Record<string, string> = {
  alba: "#80ac9c",
  plantagenet: "#dbbb76",
  tudor: "#d38f8d",
  habsburg: "#bba6d7",
};
export const SEAT_SIGNS = ["◆", "●", "▲", "■"];
const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
export function loadImage(path: string) {
  if (!imageCache.has(path))
    imageCache.set(
      path,
      new Promise((resolve) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => resolve(null);
        i.src = assetUrl(path);
      }),
    );
  return imageCache.get(path)!;
}
export function escapeHTML(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
function linesFor(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (ctx.measureText(`${line} ${word}`).width > width && line) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    lines.push(line);
  }
  return lines;
}
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
) {
  for (const line of linesFor(ctx, text, width)) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}
export function cardTextHTML(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const split = line.indexOf(":");
      const body =
        split >= 0 && split < 24
          ? `<strong>${escapeHTML(line.slice(0, split + 1))}</strong>${escapeHTML(line.slice(split + 1))}`
          : escapeHTML(line);
      return `<p class="h-rule-line">${body}</p>`;
    })
    .join("\n");
}
export async function cardCanvas(
  id: string,
  compact = true,
): Promise<HTMLCanvasElement> {
  const source = SOURCE[id],
    c = document.createElement("canvas");
  c.width = 630;
  c.height = 880;
  const ctx = c.getContext("2d")!;
  const color = DYNASTY_COLORS[source.printed.dynasty];
  ctx.fillStyle = "#101e29";
  ctx.fillRect(0, 0, 630, 880);
  const portraitHeight = source.kind === "noble" && !compact ? 240 : 580;
  if (source.artRef && source.kind === "noble") {
    const img = await loadImage(source.artRef);
    if (img) {
      const scale = Math.max(630 / img.width, portraitHeight / img.height);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 630, portraitHeight);
      ctx.clip();
      ctx.drawImage(
        img,
        (630 - img.width * scale) / 2,
        compact ? 0 : (portraitHeight - img.height * scale) * 0.14,
        img.width * scale,
        img.height * scale,
      );
      ctx.restore();
    } else {
      ctx.fillStyle = "#273b3c";
      ctx.fillRect(0, 0, 630, portraitHeight);
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(9, 9, 612, 862);
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, 594, 844);
  ctx.fillStyle = "#eedfc4";
  ctx.textAlign = "center";
  let nameSize = 48;
  const titleTop = source.kind === "noble" ? (compact ? 637 : 286) : 126;
  const titleBudget = compact && source.kind === "noble" ? 76 : 100;
  while (nameSize > 32) {
    ctx.font = `bold ${nameSize}px "Cormorant Garamond", Georgia`;
    if (
      linesFor(ctx, source.printed.name, 554).length * nameSize <=
      titleBudget
    )
      break;
    nameSize -= 2;
  }
  ctx.font = `bold ${nameSize}px "Cormorant Garamond", Georgia`;
  const titleBottom = wrap(
    ctx,
    source.printed.name,
    315,
    titleTop,
    554,
    nameSize,
  );
  ctx.font = "600 25px Manrope, sans-serif";
  ctx.fillStyle = color;
  ctx.fillText(
    source.printed.dynasty.toUpperCase(),
    315,
    source.kind === "noble" ? (compact ? 769 : titleBottom + 8) : 72,
  );
  if (source.kind === "noble" && compact) {
    ctx.fillStyle = "#eedfc4";
    ctx.font = "26px Manrope, sans-serif";
    ctx.fillText(
      source.printed.queen
        ? "QUEEN · MARRIAGE ROLE"
        : source.printed.founder
          ? "FOUNDER · HISTORICAL LABEL"
          : "NOBLE",
      315,
      722,
    );
    ctx.font = "23px Manrope, sans-serif";
    if (source.printed.branch) ctx.fillText(source.printed.branch, 315, 807);
    ctx.font = "18px Manrope, sans-serif";
    ctx.fillStyle = "#c6b79c";
    ctx.fillText(
      `${id}   ·   ${String(source.printed.collector).padStart(2, "0")} / 13`,
      315,
      846,
    );
  } else {
    let top = source.kind === "noble" ? titleBottom + 64 : titleBottom + 38;
    if (source.kind === "noble") {
      ctx.fillStyle = "#eedfc4";
      ctx.font = "22px Manrope, sans-serif";
      ctx.fillText(
        [
          source.printed.queen ? "Queen" : "Noble",
          source.printed.founder ? "Founder · historical label" : "",
          source.printed.branch ?? "",
        ]
          .filter(Boolean)
          .join(" · "),
        315,
        titleBottom + 40,
      );
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#eedfc4";
    const text = MANIFEST[id].canonicalText;
    let size = source.kind === "noble" ? 28 : 32;
    const available = 820 - top;
    const measuredHeight = () =>
      text
        .split("\n")
        .reduce(
          (total, line) =>
            total + linesFor(ctx, line, 550).length * size * 1.18 + 7,
          0,
        );
    while (size > 26) {
      ctx.font = `${size}px Manrope, sans-serif`;
      if (measuredHeight() <= available) break;
      size--;
    }
    ctx.font = `${size}px Manrope, sans-serif`;
    c.dataset.textOverflow = String(measuredHeight() > available);
    c.dataset.bodyFont = String(size);
    for (const line of text.split("\n")) {
      top = wrap(ctx, line, 40, top, 550, size * 1.18) + 7;
    }
    ctx.font = "18px Manrope, sans-serif";
    ctx.fillStyle = "#c6b79c";
    ctx.fillText(id, 40, 850);
  }
  return c;
}
export function faceHTML(id: string, compact = false): string {
  const c = SOURCE[id];
  if (!c) return escapeHTML(id);
  return `<article class="h-card-face ${c.kind} ${compact ? "h-compact-face" : "h-reference-face"}" style="--dynasty:${DYNASTY_COLORS[c.printed.dynasty]}">${c.artRef && c.kind === "noble" ? `<img src="${assetUrl(c.artRef)}" alt="" loading="lazy">` : ""}<div class="h-card-ink"><span class="h-eyebrow">${escapeHTML(c.printed.dynasty)}</span><h3>${escapeHTML(c.printed.name)}</h3>${c.kind === "noble" ? `<p class="h-card-role">${c.printed.queen ? "Queen" : c.printed.founder ? "Founder · historical label" : "Noble"}${c.printed.branch ? ` · ${escapeHTML(c.printed.branch)}` : ""}</p>` : `<p class="h-card-role">${c.kind === "law" ? "Your path to the Crown" : c.kind === "interregnum" ? "Shared crisis" : "Painting piece"}</p>`}${!compact && c.cardText ? `<div class="h-operative" aria-label="Card instructions">${cardTextHTML(MANIFEST[id].canonicalText)}</div>` : ""}<small>${escapeHTML(id)}${c.printed.collector ? ` · Collector ${c.printed.collector} of 13` : ""}</small></div></article>`;
}
