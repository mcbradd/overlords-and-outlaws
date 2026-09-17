import { preview } from "vite";
import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

const base = process.env.PAGES_BASE_PATH || "/";
const server = await preview({ configFile: false, base, preview: { host: "127.0.0.1", port: 4183, strictPort: true } });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const name = "history-proof-runtime/history-print.js";
  const expected = createHash("sha256").update(readFileSync(`public/${name}`)).digest("hex");
  assert.equal(createHash("sha256").update(readFileSync(`dist/${name}`)).digest("hex"), expected);
  const page = await browser.newPage({ viewport: { width: 1300, height: 1100 } });
  const failures = [];
  page.on("requestfailed", request => failures.push(request.url()));
  page.on("pageerror", error => failures.push(error.message));
  await page.goto(`http://127.0.0.1:4183${base}history-proof.html`);
  await page.waitForFunction(() => ["ready", "error"].includes(document.documentElement.dataset.printState));
  assert.equal(await page.locator("html").getAttribute("data-print-state"), "ready", await page.locator("[data-print-status]").innerText());
  assert.equal(await page.locator(".card[data-card] [data-face-state='ready']").count(), 92);
  assert.equal(await page.locator("canvas[data-tile-state='ready']").count(), 24);
  assert.equal(await page.locator("[data-print]").isEnabled(), true);
  assert.deepEqual(failures, []);
  mkdirSync("artifacts/history/print", { recursive: true });
  await page.emulateMedia({ media: "print" });
  await page.locator(".sheet-page").first().screenshot({ path: "artifacts/history/print/built-sheet-01.png" });
  writeFileSync("artifacts/history/print/built.json", JSON.stringify({ base, faces: 92, paintingTiles: 24, rendererSHA256: expected, failures }, null, 2));
  console.log(`Built print page: 92 reference faces, 24 artwork tiles and assets ready under ${base}`);
} finally { await browser.close(); await server.httpServer.close(); }
