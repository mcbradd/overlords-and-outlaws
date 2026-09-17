import { assetUrl } from "../assets";
import { MANIFEST, SOURCE } from "./content";
import { REMINDERS } from "./compiler";
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
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
) {
  let line = "";
  for (const word of text.split(" ")) {
    if (ctx.measureText(`${line} ${word}`).width > width && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else line += (line ? " " : "") + word;
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}
export async function cardCanvas(id: string): Promise<HTMLCanvasElement> {
  const source = SOURCE[id],
    c = document.createElement("canvas");
  c.width = 630;
  c.height = 880;
  const ctx = c.getContext("2d")!;
  const color = DYNASTY_COLORS[source.printed.dynasty];
  ctx.fillStyle = "#101e29";
  ctx.fillRect(0, 0, 630, 880);
  if (source.artRef) {
    const img = await loadImage(source.artRef);
    if (img) {
      const scale = Math.max(630 / img.width, 580 / img.height);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 630, 580);
      ctx.clip();
      ctx.drawImage(
        img,
        (630 - img.width * scale) / 2,
        0,
        img.width * scale,
        img.height * scale,
      );
      ctx.restore();
    } else {
      ctx.fillStyle = "#273b3c";
      ctx.fillRect(0, 0, 630, 570);
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(9, 9, 612, 862);
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, 594, 844);
  ctx.fillStyle = "#eedfc4";
  ctx.textAlign = "center";
  ctx.font = 'bold 48px "Cormorant Garamond", Georgia';
  wrap(
    ctx,
    source.printed.name,
    315,
    source.kind === "noble" ? 637 : 170,
    554,
    48,
  );
  ctx.font = "600 25px Manrope, sans-serif";
  ctx.fillStyle = color;
  ctx.fillText(
    source.printed.dynasty.toUpperCase(),
    315,
    source.kind === "noble" ? 769 : 80,
  );
  if (source.kind === "noble") {
    ctx.fillStyle = "#eedfc4";
    ctx.font = "26px Manrope, sans-serif";
    ctx.fillText(
      source.printed.queen
        ? "QUEEN · MARRIAGE ROLE"
        : source.printed.founder
          ? "FOUNDER · NOBLE"
          : "NOBLE",
      315,
      722,
    );
    ctx.font = "23px Manrope, sans-serif";
    ctx.fillText(
      source.printed.branch ?? "Printed affiliation is permanent",
      315,
      807,
    );
    ctx.font = "18px Manrope, sans-serif";
    ctx.fillStyle = "#c6b79c";
    ctx.fillText(
      `${id}   ·   ${String(source.printed.collector).padStart(2, "0")} / 13`,
      315,
      846,
    );
  } else {
    ctx.textAlign = "left";
    ctx.fillStyle = "#eedfc4";
    ctx.font = "26px Georgia";
    wrap(ctx, MANIFEST[id].canonicalText, 40, 270, 550, 34);
  }
  return c;
}
export function faceHTML(id: string, compact = false): string {
  const c = SOURCE[id];
  if (!c) return escapeHTML(id);
  return `<article class="h-card-face ${c.kind}" style="--dynasty:${DYNASTY_COLORS[c.printed.dynasty]}">${c.artRef && c.kind === "noble" ? `<img src="${assetUrl(c.artRef)}" alt="" loading="lazy">` : ""}<div class="h-card-ink"><span class="h-eyebrow">${escapeHTML(c.printed.dynasty)}</span><h3>${escapeHTML(c.printed.name)}</h3>${c.kind === "noble" ? `<p>${c.printed.queen ? "Queen · marriage role" : c.printed.founder ? "Founder · Noble" : "Noble"}${c.printed.branch ? ` · ${escapeHTML(c.printed.branch)}` : ""}</p>` : ""}${!compact && c.cardText ? `<p class="h-operative">${escapeHTML(MANIFEST[id].canonicalText).replace(/\n/g, "<br>")}</p>` : ""}${!compact && c.reminderRefs.length ? `<p class="h-reminder"><em>Reminder</em> · ${escapeHTML(c.reminderRefs.map((r) => REMINDERS[r]).join(" "))}</p>` : ""}<small>${escapeHTML(id)}${c.printed.collector ? ` · ${c.printed.collector} / 13` : ""}</small></div></article>`;
}
