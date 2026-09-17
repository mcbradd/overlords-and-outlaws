import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
const output = "artifacts/card-language";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
// Keep one content snapshot while other editors work; dev-server hot reload is
// unrelated to whether the already-rendered card text fits.
await page.routeWebSocket("**/*", (socket) => socket.close());
try {
  await page.goto(base);
  const contentVersion: string = await page.evaluate(async () => {
    const facePath = "/src/history-engine/face.ts";
    const contentPath = "/src/history-engine/content.ts";
    const { faceHTML } = await import(facePath);
    const { SOURCES, CONTENT_VERSION } = await import(contentPath);
    document.body.innerHTML = `<main class="h-proof-probe">${SOURCES.map(
      (source: { id: string }) =>
        `<div class="probe" data-card="${source.id}">${faceHTML(source.id)}</div>`,
    ).join("")}</main>`;
    const style = document.createElement("style");
    style.textContent =
      ".h-proof-probe{display:flex;flex-wrap:wrap;gap:20px;padding:20px;background:#091a20}.probe{width:340px;flex-shrink:0}";
    document.head.append(style);
    await document.fonts.ready;
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
    });
    await Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
      ),
    );
    return CONTENT_VERSION;
  });
  const inspectFaces = () =>
    page.locator(".probe").evaluateAll((nodes) =>
      nodes.map((node) => {
        const card = node.querySelector(".h-card-face")!;
        const bounds = card.getBoundingClientRect();
        const rules = node.querySelector(".h-operative");
        const children = [
          ...node.querySelectorAll(".h-card-ink > *, .h-rule-line"),
        ];
        return {
          id: node.getAttribute("data-card"),
          width: bounds.width,
          height: bounds.height,
          ratio: bounds.width / bounds.height,
          words: rules?.textContent?.trim().split(/\s+/).length ?? 0,
          overflows: children
            .filter((child) => {
              const r = child.getBoundingClientRect();
              return (
                r.bottom > bounds.bottom - 4 ||
                r.right > bounds.right ||
                r.left < bounds.left
              );
            })
            .map((child) => child.textContent),
          font: rules?.firstElementChild
            ? getComputedStyle(rules.firstElementChild).fontSize
            : null,
        };
      }),
    );
  const desktop = await inspectFaces();
  for (const id of [
    "alba-0",
    "tudor-1",
    "law-habsburg",
    "law-tudor",
    "A2",
    "P2",
    "T3",
    "H3",
    "painting-alba-1",
  ]) {
    await page.locator(`.probe[data-card="${id}"]`).screenshot({
      path: `${output}/face-${id}.png`,
    });
  }
  const canvas = await page.evaluate(async () => {
    const facePath = "/src/history-engine/face.ts";
    const contentPath = "/src/history-engine/content.ts";
    const { cardCanvas } = await import(facePath);
    const { SOURCES } = await import(contentPath);
    return await Promise.all(
      SOURCES.map(async (source: { id: string }) => {
        const canvas: HTMLCanvasElement = await cardCanvas(source.id, false);
        return {
          id: source.id,
          overflow: canvas.dataset.textOverflow,
          font: canvas.dataset.bodyFont,
        };
      }),
    );
  });
  for (const id of ["tudor-1", "law-habsburg", "A2"]) {
    await page.evaluate(async (id) => {
      const facePath = "/src/history-engine/face.ts";
      const { cardCanvas } = await import(facePath);
      document.querySelector("#canvas-proof")?.remove();
      const canvas: HTMLCanvasElement = await cardCanvas(id, false);
      canvas.id = "canvas-proof";
      document.body.append(canvas);
    }, id);
    await page.locator("#canvas-proof").screenshot({
      path: `${output}/canvas-${id}.png`,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.querySelector(".h-proof-probe")!.classList.add("h-inspection");
    document.querySelectorAll<HTMLElement>(".probe").forEach((node) => {
      node.style.width = "310px";
    });
  });
  const phone = await inspectFaces();
  for (const [id, title] of [
    ["tudor-1", "queen"],
    ["law-habsburg", "law"],
  ]) {
    await page.locator(`.probe[data-card="${id}"]`).screenshot({
      path: `${output}/phone-${title}.png`,
    });
  }
  const allFaces = [...desktop, ...phone];
  const report = {
    contentVersion,
    desktop,
    phone,
    canvas,
    missing: allFaces.filter((c) => !c.words).map((c) => c.id),
    htmlFailures: allFaces.filter((c) => c.overflows.length),
    ratioFailures: allFaces.filter((c) => Math.abs(c.ratio - 63 / 88) > 0.001),
    canvasFailures: canvas.filter((c) => c.overflow === "true"),
  };
  writeFileSync(`${output}/face-fit.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      cards: desktop.length,
      missing: report.missing,
      htmlFailures: report.htmlFailures,
      ratioFailures: report.ratioFailures,
      canvasFailures: report.canvasFailures,
    }),
  );
  assert.equal(desktop.length, 92);
  assert.deepEqual(report.missing, [], "Every full card needs operative text");
  assert.deepEqual(report.htmlFailures, [], "Full card text must fit its face");
  assert.deepEqual(
    report.ratioFailures,
    [],
    "Every full face must remain 63:88",
  );
  assert.deepEqual(report.canvasFailures, [], "Canvas reference text must fit");
} finally {
  await browser.close();
}
