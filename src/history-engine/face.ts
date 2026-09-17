import { assetUrl } from "../assets";
import { MANIFEST, SOURCE } from "./content";
export const DYNASTY_COLORS: Record<string, string> = {
  alba: "#80ac9c",
  plantagenet: "#dbbb76",
  tudor: "#d38f8d",
  habsburg: "#bba6d7",
};
export const SEAT_SIGNS = ["◆", "●", "▲", "■"];

/** Physical print coordinates shared by every visible History Engine face. */
export const HISTORY_FACE = {
  width: 630,
  height: 880,
  name: { x: 115, y: 48, width: 400, height: 68, baseline: 96 },
  role: { x: 60, y: 118, width: 510, height: 36, baseline: 145 },
  portrait: {
    x: 0,
    y: 159,
    width: 630,
    compactHeight: 643,
    referenceHeight: 108,
  },
  rules: { x: 82, y: 288, width: 466, height: 494, maxLines: 17 },
} as const;
export interface FaceField {
  label: "name" | "role" | "rules";
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font: number;
}
const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
const faceCache = new Map<string, Promise<HTMLCanvasElement>>();
let printFonts: Promise<void> | null = null;
function loadPrintFonts() {
  // Register explicit print fonts before measurement. The compiler also imports
  // this module in Node, so font loading belongs inside browser composition.
  printFonts ??= Promise.all([
    new FontFace(
      "History Card Title",
      `url(${assetUrl("fonts/font-1.woff2")})`,
      { weight: "400 700" },
    ).load(),
    new FontFace(
      "History Card Body",
      `url(${assetUrl("fonts/font-2.woff2")})`,
      { weight: "400 800" },
    ).load(),
  ]).then((fonts) => {
    fonts.forEach((font) => document.fonts.add(font));
  });
  return printFonts;
}
export function loadImage(path: string) {
  if (!imageCache.has(path))
    imageCache.set(
      path,
      new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = assetUrl(path);
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
function roleFor(id: string) {
  const source = SOURCE[id];
  const role =
    source.kind === "noble"
      ? source.printed.queen
        ? "Queen"
        : source.printed.founder
          ? "Founder"
          : "Noble"
      : source.kind === "law"
        ? "Crown law"
        : source.kind === "interregnum"
          ? "Shared crisis"
          : "Painting piece";
  return [role, source.printed.branch].filter(Boolean).join(" · ");
}
function wrapLines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
export async function cardCanvas(
  id: string,
  compact = true,
): Promise<HTMLCanvasElement> {
  const key = `${id}:${compact}`;
  let pending = faceCache.get(key);
  if (!pending) {
    pending = composeCard(id, compact).catch((error) => {
      faceCache.delete(key);
      throw error;
    });
    faceCache.set(key, pending);
    if (faceCache.size > 192) faceCache.delete(faceCache.keys().next().value!);
  }
  return pending;
}

/** Uninterrupted physical puzzle artwork; reference instructions stay on the reference face. */
export async function paintingTileCanvas(id: string) {
  const source = SOURCE[id];
  if (source?.kind !== "fragment" || !source.printed.slot)
    throw Error(`Not a painting fragment: ${id}`);
  const image = await loadImage(source.artRef);
  if (!image) throw Error(`Painting artwork unavailable: ${source.artRef}`);
  const canvas = document.createElement("canvas");
  canvas.width = HISTORY_FACE.width; canvas.height = HISTORY_FACE.height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  const column = (source.printed.slot - 1) % 3;
  const row = Math.floor((source.printed.slot - 1) / 3);
  ctx.drawImage(image, column * image.width / 3, row * image.height / 2,
    image.width / 3, image.height / 2, 0, 0, canvas.width, canvas.height);
  canvas.dataset.fragment = id;
  return canvas;
}
async function composeCard(id: string, compact: boolean) {
  const source = SOURCE[id];
  if (!source) throw new Error(`Unknown History card: ${id}`);
  const [portrait, frame] = await Promise.all([
    source.artRef && source.kind === "noble" ? loadImage(source.artRef) : null,
    loadImage(`art/frames/${source.printed.dynasty}-perimeter-v2.png`),
    loadPrintFonts(),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = HISTORY_FACE.width;
  canvas.height = HISTORY_FACE.height;
  const ctx = canvas.getContext("2d")!;
  const fields: FaceField[] = [];
  ctx.imageSmoothingQuality = "high";
  ctx.fontKerning = "normal";
  ctx.beginPath();
  ctx.roundRect(0, 0, 630, 880, 12);
  ctx.clip();
  ctx.fillStyle = "#101c24";
  ctx.fillRect(0, 0, 630, 880);
  if (portrait) {
    const p = HISTORY_FACE.portrait;
    const height = compact ? p.compactHeight : p.referenceHeight;
    // The short reference header uses a portrait vignette, not a full-width
    // enlargement that slices through the person's eyes and chin.
    const width = compact ? p.width : 160;
    const scale = Math.max(width / portrait.width, height / portrait.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect((630 - width) / 2, p.y, width, height);
    ctx.clip();
    ctx.drawImage(
      portrait,
      (630 - portrait.width * scale) / 2,
      p.y,
      portrait.width * scale,
      portrait.height * scale,
    );
    ctx.restore();
  }
  // One authored frame at native proportions, with the portrait underneath its aperture.
  if (frame) ctx.drawImage(frame, 0, 0, 630, 880);
  function singleLine(
    label: "name" | "role",
    text: string,
    initial: number,
    family: string,
    color: string,
  ) {
    const box = HISTORY_FACE[label];
    let size = initial;
    const font = () => {
      ctx.font = `${label === "name" ? 700 : 600} ${size}px ${family}`;
    };
    font();
    while (
      size > 20 &&
      Math.max(
        ctx.measureText(text).width,
        ctx.measureText(text).actualBoundingBoxLeft +
          ctx.measureText(text).actualBoundingBoxRight,
      ) > box.width
    ) {
      size -= 0.25;
      font();
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;
    ctx.fillText(text, 315, box.baseline);
    const m = ctx.measureText(text);
    fields.push({
      label,
      text,
      x: 315 - m.actualBoundingBoxLeft,
      y: box.baseline - m.actualBoundingBoxAscent,
      width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
      height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
      font: size,
    });
  }
  singleLine(
    "name",
    source.printed.name,
    compact ? 56 : 52,
    '"History Card Title", Georgia',
    "#f2e5c9",
  );
  singleLine(
    "role",
    roleFor(id),
    compact ? 32 : 27,
    '"History Card Body", sans-serif',
    "#d4c29d",
  );
  canvas.dataset.nameLines = "1";
  canvas.dataset.textOverflow = "false";
  if (!compact || source.kind !== "noble") {
    const box = HISTORY_FACE.rules;
    const paragraphs = MANIFEST[id].canonicalText.split("\n");
    // Group paragraphs without changing any of the compiler's operative wording.
    const text = source.kind === "noble" ? paragraphs.join(" ") : null;
    let size = source.kind === "noble" ? 26 : 30;
    let lines: string[] = [];
    for (; size >= 25; size -= 0.25) {
      ctx.font = `400 ${size}px "History Card Body", sans-serif`;
      lines = text
        ? wrapLines(ctx, text, box.width)
        : paragraphs.flatMap((p) => wrapLines(ctx, p, box.width));
      const inkFits = lines.every(
        (line, index) =>
          box.y +
            size +
            index * size * 1.13 +
            ctx.measureText(line).actualBoundingBoxDescent <=
          box.y + box.height,
      );
      if (lines.length <= box.maxLines && inkFits) break;
    }
    const overflow =
      lines.length > box.maxLines ||
      lines.length * size * 1.13 > box.height ||
      size < 25;
    canvas.dataset.textOverflow = String(overflow);
    canvas.dataset.bodyFont = String(size);
    canvas.dataset.ruleLines = String(lines.length);
    ctx.textAlign = "left";
    ctx.fillStyle = "#efe4ce";
    lines.forEach((line, index) => {
      const baseline = box.y + size + index * size * 1.13;
      ctx.fillText(line, box.x, baseline);
      const m = ctx.measureText(line);
      fields.push({
        label: "rules",
        text: line,
        x: box.x - m.actualBoundingBoxLeft,
        y: baseline - m.actualBoundingBoxAscent,
        width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
        height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
        font: size,
      });
    });
  }
  canvas.dataset.fields = JSON.stringify(fields);
  canvas.dataset.cardId = id;
  canvas.dataset.compact = String(compact);
  canvas.dataset.artMissing = String(
    (source.kind === "noble" && !portrait) || !frame,
  );
  return canvas;
}
let hydrationQueued = false;
function queueHydration() {
  if (typeof document === "undefined") return;
  if (hydrationQueued) return;
  hydrationQueued = true;
  queueMicrotask(() => {
    hydrationQueued = false;
    void hydrateHistoryFaces();
  });
}
export async function hydrateHistoryFaces(root: ParentNode = document) {
  await Promise.all(
    [
      ...root.querySelectorAll<HTMLCanvasElement>(
        "canvas.h-face-canvas[data-face-id]",
      ),
    ].map(async (canvas) => {
      if (canvas.dataset.faceState) return;
      canvas.dataset.faceState = "loading";
      try {
        const painted = await cardCanvas(
          canvas.dataset.faceId!,
          canvas.dataset.compact === "true",
        );
        if (!canvas.isConnected) return;
        canvas.width = painted.width;
        canvas.height = painted.height;
        canvas.getContext("2d")!.drawImage(painted, 0, 0);
        for (const key of [
          "fields",
          "nameLines",
          "textOverflow",
          "bodyFont",
          "ruleLines",
          "artMissing",
        ])
          if (painted.dataset[key] !== undefined)
            canvas.dataset[key] = painted.dataset[key];
        canvas.dataset.faceState = "ready";
      } catch {
        canvas.dataset.faceState = "error";
        canvas.closest(".h-card-face")?.setAttribute("data-art", "unavailable");
      }
    }),
  );
}
export function faceHTML(id: string, compact = false): string {
  const source = SOURCE[id];
  if (!source) return escapeHTML(id);
  queueHydration();
  return `<article class="h-card-face ${source.kind} ${compact ? "h-compact-face" : "h-reference-face"}" data-face-card="${id}" style="--dynasty:${DYNASTY_COLORS[source.printed.dynasty]}"><canvas class="h-face-canvas" data-face-id="${id}" data-compact="${compact}" width="630" height="880" aria-hidden="true"></canvas><div class="h-face-semantic"><h3>${escapeHTML(source.printed.name)}</h3><p class="h-card-role">${escapeHTML(roleFor(id))}</p>${!compact || source.kind !== "noble" ? `<div class="h-operative" aria-label="Card instructions">${cardTextHTML(MANIFEST[id].canonicalText)}</div>` : ""}</div></article>`;
}
