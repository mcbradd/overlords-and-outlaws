import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const output = "artifacts/history/print";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1300, height: 1100 } });
  await page.routeWebSocket("**/*", socket => socket.close());
  await page.goto(`${process.env.HISTORY_BASE_URL ?? "http://localhost:5178"}/history-proof.html`);
  await page.waitForFunction(() => document.documentElement.dataset.printState === "ready" || document.documentElement.dataset.printState === "error");
  assert.equal(await page.locator("html").getAttribute("data-print-state"), "ready", await page.locator("[data-print-status]").innerText());
  const results = await page.evaluate(async () => {
    const { cardCanvas, HISTORY_FACE } = await import("/src/history-engine/face.ts");
    const { MANIFEST } = await import("/src/history-engine/content.ts");
    return await Promise.all([...document.querySelectorAll(".card[data-card]")].map(async card => {
      const id = card.dataset.card;
      const canvas = card.querySelector(".h-face-canvas");
      const runtime = await cardCanvas(id, false);
      const r = card.getBoundingClientRect();
      const fields = JSON.parse(canvas.dataset.fields);
      return { id, widthMM: r.width * 25.4 / 96, heightMM: r.height * 25.4 / 96,
        pixelsMatch: canvas.toDataURL() === runtime.toDataURL(),
        textMatches: card.querySelector(".h-operative").textContent.replace(/\s+/g, " ").trim() === MANIFEST[id].canonicalText.replace(/\s+/g, " ").trim(),
        fields: fields.length, ruleLines: fields.filter(f => f.label === "rules").length,
        violations: fields.filter(field => { const box = HISTORY_FACE[field.label]; return field.x < box.x - 1 || field.y < box.y - 1 || field.x + field.width > box.x + box.width + 1 || field.y + field.height > box.y + box.height + 1; }) };
    }));
  });
  const failures = results.filter(result => !result.pixelsMatch || !result.textMatches || !result.ruleLines || result.violations.length || Math.abs(result.widthMM - 63) > .02 || Math.abs(result.heightMM - 88) > .02);
  await page.emulateMedia({ media: "print" });
  const sheets = page.locator(".sheet-page");
  assert.equal(await sheets.count(), 11, "All 92 reference faces have explicit print sheets");
  for (let index = 0; index < 11; index++) await sheets.nth(index).screenshot({ path: `${output}/reference-sheet-${String(index + 1).padStart(2, "0")}.png` });
  const paintingProofs = page.locator(".painting-proof-page");
  assert.equal(await paintingProofs.count(), 4);
  const tiles = await page.evaluate(async () => {
    const { paintingTileCanvas } = await import("/src/history-engine/face.ts");
    return await Promise.all([...document.querySelectorAll("canvas[data-print-tile]")].map(async tile => {
      const source = await paintingTileCanvas(tile.dataset.printTile);
      const r = tile.getBoundingClientRect();
      return { id: tile.dataset.printTile, pixelsMatch: tile.toDataURL() === source.toDataURL(), widthMM: r.width * 25.4 / 96, heightMM: r.height * 25.4 / 96 };
    }));
  });
  for (let index = 0; index < 4; index++) await paintingProofs.nth(index).screenshot({ path: `${output}/painting-${index + 1}.png` });
  const tileFailures = tiles.filter(tile => !tile.pixelsMatch || Math.abs(tile.widthMM - 63) >= .02 || Math.abs(tile.heightMM - 88) >= .02);
  writeFileSync("artifacts/history/print-fit.json", JSON.stringify({ cards: results.length, failures, results, tiles, tileFailures }, null, 2));
  assert.equal(tiles.length, 24);
  assert.deepEqual(tileFailures, [], "Every painting tile must preserve the shared artwork crop at 63×88mm");
  assert.equal(results.length, 92, "Every current canonical card must be checked");
  assert.deepEqual(failures, [], "Print must match runtime pixels, complete rules and physical geometry");
  console.log(`Print proof: ${results.length} faces match runtime pixels and canonical text at 63×88mm; 11 print sheets captured.`);
} finally { await browser.close(); }
