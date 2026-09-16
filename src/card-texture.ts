import { assetUrl } from "./assets";
import { crest, type CardFaceModel } from "./cards";

/** Print coordinates. The browser never lays out an individual card's contents. */
export const CARD_FACE = { width: 630, height: 880, scale: 2 } as const;
export const FACE_FIELDS = {
  cost: [30, 24, 128, 128],
  fullPanel: [22, 542, 586, 230],
  boardPanel: [22, 650, 586, 122],
  stats: [42, 782, 212, 58],
  herald: [263, 757, 104, 104],
} as const;
export const TEXT_SAFE = {
  full: [54, 568, 522, 187],
  board: [54, 670, 522, 87],
} as const;
export interface PrintedField {
  label: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PaintedCard {
  canvas: HTMLCanvasElement;
  fields: PrintedField[];
}
const images = new Map<string, Promise<HTMLImageElement>>();
const faces = new Map<string, Promise<PaintedCard>>();
function image(src: string) {
  let pending = images.get(src);
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        images.delete(src);
        reject(new Error(`Card art failed: ${src}`));
      };
      img.src = src;
    });
    images.set(src, pending);
  }
  return pending;
}
const ink = "#fff1d4",
  red = "#ff655c";
const SWORD_PATH =
  "M12 0 L18 10 L18 30 L28 30 L28 35 L17 35 L17 43 L20 47 L20 51 L4 51 L4 47 L7 43 L7 35 L-4 35 L-4 30 L6 30 L6 10 Z";
export function paintCard(model: CardFaceModel): Promise<PaintedCard> {
  const key = JSON.stringify(model);
  const cached = faces.get(key);
  if (cached) return cached;
  const pending = compose(model).catch((error) => {
    faces.delete(key);
    throw error;
  });
  faces.set(key, pending);
  // Bound decoded print surfaces; Three.js owns and disposes its GPU copies.
  if (faces.size > 48) faces.delete(faces.keys().next().value!);
  return pending;
}
async function compose(model: CardFaceModel): Promise<PaintedCard> {
  const svg = crest(model.id)
    .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replaceAll("currentColor", ink);
  const [portrait, frame, symbol] = await Promise.all([
    image(model.portrait),
    image(assetUrl(`art/frames/${model.house}-${model.face}-v3.png`)),
    image(`data:image/svg+xml,${encodeURIComponent(svg)}`),
    document.fonts.load('700 48px "Cormorant Garamond"'),
    document.fonts.load('700 56px "Manrope"'),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = CARD_FACE.width * CARD_FACE.scale;
  canvas.height = CARD_FACE.height * CARD_FACE.scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(CARD_FACE.scale, CARD_FACE.scale);
  ctx.imageSmoothingQuality = "high";
  ctx.fontKerning = "normal";
  const fields: PrintedField[] = [];
  ctx.beginPath();
  ctx.roundRect(0, 0, 630, 880, 18);
  ctx.clip();
  const zoom = Math.max(630 / portrait.width, 880 / portrait.height);
  ctx.drawImage(
    portrait,
    (630 - portrait.width * zoom) / 2,
    0,
    portrait.width * zoom,
    portrait.height * zoom,
  );
  ctx.drawImage(frame, 0, 0, 630, 880);
  // All frames include their own fittings at native scale. Never crop/stretch a
  // separate plaque: one full-frame image gives every border the same density.
  // The socket is intentionally blank for the game's canonical house symbol.
  ctx.drawImage(symbol, 283, 777, 64, 64);
  function text(
    label: string,
    value: string,
    x: number,
    y: number,
    size: number,
    family: string,
    maxWidth: number,
    color = ink,
    align: CanvasTextAlign = "left",
    weight = 700,
  ) {
    ctx.font = `${weight} ${size}px ${family}`;
    while (
      Math.max(
        ctx.measureText(value).width,
        ctx.measureText(value).actualBoundingBoxLeft +
          ctx.measureText(value).actualBoundingBoxRight,
      ) > maxWidth &&
      size > 16
    ) {
      size -= 0.25;
      ctx.font = `${weight} ${size}px ${family}`;
    }
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    const m = ctx.measureText(value);
    // Align visible ink, including an overhanging J or italic-like swash.
    // Font advance alone places some initial letters outside the shared margin.
    const drawX = align === "left" ? x + m.actualBoundingBoxLeft : x;
    ctx.fillText(value, drawX, y);
    fields.push({
      label,
      text: value,
      x: drawX - m.actualBoundingBoxLeft,
      y: y - m.actualBoundingBoxAscent,
      width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
      height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
    });
  }
  text(
    "cost",
    String(model.cost),
    94,
    112,
    65,
    '"Manrope"',
    84,
    model.cost !== model.printedCost ? "#9de9c4" : "#f6da92",
    "center",
  );
  const board = model.face === "board";
  text(
    "name",
    model.name,
    54,
    board ? 714 : 605,
    43,
    '"Cormorant Garamond"',
    522,
  );
  if (board) text("role", model.role, 54, 748, 30, '"Cormorant Garamond"', 522);
  if (!board) {
    // Keywords and parenthesized reminders share a line; reminders are italic.
    // Measure the actual styled words before wrapping, never stretch the text.
    type Run = { value: string; italic: boolean; x: number; y: number };
    let size = 25;
    let runs: Run[] = [];
    for (; size >= 19; size -= 0.5) {
      runs = [];
      let x = 54,
        y = 636;
      const leading = size * 1.14;
      for (const [index, rule] of model.rules.entries()) {
        if (index) {
          x = 54;
          y += leading + 3;
        }
        for (const part of [
          { value: rule.keyword, italic: false },
          { value: `(${rule.reminder})`, italic: true },
        ]) {
          ctx.font = `${part.italic ? "italic 400" : "700"} ${size}px Georgia`;
          for (const word of part.value.split(/\s+/)) {
            const metrics = ctx.measureText(word);
            const width =
              word === "{attack}"
                ? size * 0.63
                : metrics.actualBoundingBoxLeft +
                  metrics.actualBoundingBoxRight;
            if (x + width > 574 && x > 54) {
              x = 54;
              y += leading;
            }
            runs.push({ value: word, italic: part.italic, x, y });
            // Italic swashes can extend past the font advance. Preserve a real
            // visible word gap rather than letting “from your” touch at small sizes.
            x += width + Math.max(ctx.measureText(" ").width, size * 0.26);
          }
        }
      }
      if (runs.every((run) => run.y + size * 0.25 <= 742)) break;
      if (size === 19)
        throw new Error(`Rules exceed the print area: ${model.id}`);
    }
    for (const run of runs) {
      ctx.font = `${run.italic ? "italic 400" : "700"} ${size}px Georgia`;
      ctx.fillStyle = ink;
      ctx.textAlign = "left";
      if (run.value === "{attack}") {
        ctx.save();
        const scale = size / 51;
        ctx.translate(run.x + 4 * scale, run.y - size + 2);
        ctx.scale(scale, scale);
        ctx.fill(new Path2D(SWORD_PATH));
        ctx.restore();
        fields.push({
          label: "ability",
          text: "Attack",
          x: run.x,
          y: run.y - size + 2,
          width: 32 * scale,
          height: size,
        });
        continue;
      }
      const m = ctx.measureText(run.value);
      const x = run.x + m.actualBoundingBoxLeft;
      ctx.fillText(run.value, x, run.y);
      fields.push({
        label: "ability",
        text: run.value,
        x: x - m.actualBoundingBoxLeft,
        y: run.y - m.actualBoundingBoxAscent,
        width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
        height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
      });
    }
  }
  // Deterministic, large silhouettes, independent of platform emoji glyphs.
  // One closed silhouette: blade, crossguard, grip and pommel remain connected.
  const sword = new Path2D(SWORD_PATH);
  ctx.save();
  ctx.translate(58, 790);
  ctx.scale(0.74, 0.74);
  ctx.fillStyle = ink;
  ctx.fill(sword);
  ctx.restore();
  fields.push({
    label: "attack-icon",
    text: "sword",
    x: 55.04,
    y: 790,
    width: 23.68,
    height: 37.74,
  });
  text(
    "attack",
    String(model.attack),
    110,
    827,
    48,
    '"Manrope"',
    42,
    ink,
    "center",
  );
  ctx.save();
  ctx.translate(151, 794);
  ctx.scale(0.92, 0.92);
  ctx.fillStyle = model.damaged ? red : ink;
  ctx.fill(new Path2D("M19 36 C-14 15 0 -9 19 6 C38 -9 52 15 19 36 Z"));
  ctx.restore();
  fields.push({
    label: "health-icon",
    text: "heart",
    x: 151,
    y: 792,
    width: 36,
    height: 36,
  });
  text(
    "health",
    String(model.health),
    222,
    827,
    48,
    '"Manrope"',
    42,
    model.damaged ? red : ink,
    "center",
  );
  if (board && model.damage > 0) {
    ctx.beginPath();
    ctx.arc(73, 500, 32, 0, Math.PI * 2);
    ctx.fillStyle = "#761e1a";
    ctx.fill();
    ctx.strokeStyle = "#d3af74";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    ctx.translate(73, 500);
    if (model.counterTurned) ctx.rotate(Math.PI / 2);
    ctx.font = '700 27px "Manrope"';
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.fillText(`−${model.damage}`, 0, 11);
    ctx.restore();
    fields.push({
      label: "damage-counter",
      text: `−${model.damage}`,
      x: 41,
      y: 468,
      width: 64,
      height: 64,
    });
  }
  text(
    "credit",
    "O&O · PROTOTYPE",
    483,
    824,
    22,
    '"Cormorant Garamond"',
    180,
    ink,
    "center",
  );
  return { canvas, fields };
}

export async function hydrateCardTextures(root: ParentNode = document) {
  const nodes = root.querySelectorAll<HTMLCanvasElement>(
    "canvas.card-texture[data-paint]",
  );
  await Promise.all(
    [...nodes].map(async (node) => {
      if (node.dataset.paintState) return;
      if (node.closest(".physical-card")) {
        // This is only an accessible hit target; its visible face is a GPU texture.
        node.width = node.height = 1;
        node.dataset.paintState = "ready";
        return;
      }
      node.dataset.paintState = "loading";
      try {
        const result = await paintCard(JSON.parse(node.dataset.paint!));
        node.getContext("2d")!.drawImage(result.canvas, 0, 0);
        node.dataset.paintState = "ready";
      } catch (error) {
        node.dataset.paintState = "error";
        console.error(error);
      }
    }),
  );
}
export function installCardTextures() {
  const observer = new MutationObserver(() => {
    void hydrateCardTextures();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  void hydrateCardTextures();
}
