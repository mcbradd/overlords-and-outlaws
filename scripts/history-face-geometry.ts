import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export async function verifyHistoryFaces(
  output = "artifacts/playtest-recovery/faces",
) {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await page.routeWebSocket("**/*", (socket) => socket.close());
    await page.goto(process.env.HISTORY_BASE_URL ?? "http://localhost:5178");
    const report = await page.evaluate(async () => {
      const facePath = "/src/history-engine/face.ts";
      const contentPath = "/src/history-engine/content.ts";
      const { cardCanvas, HISTORY_FACE, faceHTML, loadImage } = await import(facePath);
      const { SOURCES, MANIFEST } = await import(contentPath);
      const frameMasks: Record<string, Uint8ClampedArray> = {};
      for (const dynasty of ["alba", "plantagenet", "tudor", "habsburg"]) {
        const frame = document.createElement("canvas"); frame.width = 630; frame.height = 880;
        const ctx = frame.getContext("2d")!;
        ctx.drawImage(await loadImage(`art/frames/${dynasty}-perimeter-v2.png`), 0, 0, 630, 880);
        frameMasks[dynasty] = ctx.getImageData(0, 0, 630, 880).data;
      }
      const results = [];
      for (const compact of [true, false])
        for (const source of SOURCES) {
          const canvas = await cardCanvas(source.id, compact);
          const fields = JSON.parse(canvas.dataset.fields!);
          const violations = fields.filter(
            (field: {
              label: string;
              x: number;
              y: number;
              width: number;
              height: number;
            }) => {
              const box = HISTORY_FACE[field.label];
              return (
                field.x < box.x - 1 ||
                field.x + field.width > box.x + box.width + 1 ||
                field.y < box.y - 1 ||
                field.y + field.height > box.y + box.height + 1
              );
            },
          );
          const actual = fields
            .filter((f: { label: string }) => f.label === "rules")
            .map((f: { text: string }) => f.text)
            .join(" ");
          let ornamentPixels = 0;
          const mask = frameMasks[source.printed.dynasty];
          const ornamentFields: string[] = [];
          for (const field of fields) {
            let touched = 0;
            for (let y = Math.floor(field.y) - 2; y <= Math.ceil(field.y + field.height) + 2; y++)
              for (let x = Math.floor(field.x) - 2; x <= Math.ceil(field.x + field.width) + 2; x++)
                if (mask[(y * 630 + x) * 4 + 3] > 96) touched++;
            ornamentPixels += touched;
            if (touched) ornamentFields.push(`${field.label}: ${field.text}`);
          }
          results.push({
            id: source.id,
            compact,
            ratio: canvas.width / canvas.height,
            violations,
            ornamentPixels,
            ornamentFields,
            nameFields: fields.filter(
              (f: { label: string }) => f.label === "name",
            ).length,
            name: fields.find((f: { label: string }) => f.label === "name")
              .text,
            expectedName: source.printed.name,
            font: canvas.dataset.bodyFont,
            overflow: canvas.dataset.textOverflow,
            missingArt: canvas.dataset.artMissing,
            completeRules:
              (compact && source.kind === "noble") ||
              actual ===
                MANIFEST[source.id].canonicalText.replace(/\s+/g, " ").trim(),
          });
        }
      document.body.innerHTML = `<main id="face-proof">${SOURCES.map((s: { id: string }) => faceHTML(s.id)).join("")}</main>`;
      return results;
    });
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-face-state="ready"]').length === 92,
    );
    const hydrated = await page.evaluate(async () => {
      const facePath = "/src/history-engine/face.ts";
      const contentPath = "/src/history-engine/content.ts";
      const { cardCanvas } = await import(facePath);
      const { MANIFEST } = await import(contentPath);
      const canvases = [
        ...document.querySelectorAll<HTMLCanvasElement>(".h-face-canvas"),
      ];
      return (
        canvases.length === 92 &&
        (
          await Promise.all(
            canvases.map(async (canvas) => {
              const source = await cardCanvas(canvas.dataset.faceId!, false);
              return (
                canvas.width === 630 &&
                canvas.height === 880 &&
                canvas.dataset.nameLines === "1" &&
                canvas.toDataURL() === source.toDataURL() &&
                canvas
                  .closest("article")!
                  .querySelector(".h-operative")!
                  .textContent!.replace(/\s+/g, " ")
                  .trim() ===
                  MANIFEST[canvas.dataset.faceId!].canonicalText
                    .replace(/\s+/g, " ")
                    .trim()
              );
            }),
          )
        ).every(Boolean)
      );
    });
    const failures = report.filter(
      (item) =>
        item.violations.length || item.ornamentPixels ||
        item.nameFields !== 1 ||
        item.name !== item.expectedName ||
        Math.abs(item.ratio - 63 / 88) > 0.00001 ||
        item.overflow === "true" ||
        item.missingArt === "true" ||
        !item.completeRules,
    );
    writeFileSync(
      `${output}/geometry.json`,
      JSON.stringify(
        { cases: report.length, hydrated, failures, report },
        null,
        2,
      ),
    );
    for (const compact of [true, false]) {
      await page.evaluate(async (compact) => {
        const path = "/src/history-engine/face.ts";
        const { cardCanvas } = await import(path);
        document.body.innerHTML =
          '<main id="sheet" style="display:grid;grid-template-columns:repeat(4,252px);gap:20px;padding:20px;background:#26352e;width:max-content"></main>';
        for (const id of [
          "alba-0",
          "alba-8",
          "plantagenet-1",
          "tudor-1",
          "habsburg-1",
          "law-alba",
          "A2",
          "painting-alba-1",
        ]) {
          const image = document.createElement("img");
          image.src = (await cardCanvas(id, compact)).toDataURL();
          image.style.cssText = "display:block;width:252px;height:352px";
          document.querySelector("#sheet")!.append(image);
          await image.decode();
        }
      }, compact);
      await page
        .locator("#sheet")
        .screenshot({
          path: `${output}/${compact ? "compact" : "reference"}.png`,
        });
      const raw = await page.locator("#sheet img").nth(5).getAttribute("src");
      writeFileSync(
        `${output}/${compact ? "compact" : "reference"}-law.png`,
        Buffer.from(raw!.split(",")[1], "base64"),
      );
    }
    console.log(JSON.stringify({ cases: report.length, hydrated, failures }));
    assert.equal(report.length, 184);
    assert(hydrated, "HTML faces must paint the same fixed compositor");
    assert.deepEqual(
      failures,
      [],
      "All print fields and complete canonical text must fit their fixed zones",
    );
  } finally {
    await browser.close();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await verifyHistoryFaces();
