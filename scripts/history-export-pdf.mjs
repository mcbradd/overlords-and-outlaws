import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import assert from "node:assert/strict";
mkdirSync("output/pdf", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`${process.env.HISTORY_BASE_URL ?? "http://localhost:5178"}/history-proof.html`);
  await page.waitForFunction(() => ["ready", "error"].includes(document.documentElement.dataset.printState));
  assert.equal(await page.locator("html").getAttribute("data-print-state"), "ready", await page.locator("[data-print-status]").innerText());
  assert.equal(await page.locator(".card[data-card] [data-face-state='ready']").count(), 92);
  // The page already contains the shared fixed compositor; do not replace its
  // ink or portraits with a second PDF-only crop, scale or JPEG conversion.
  await page.pdf({
    path: process.argv[2] ?? "output/pdf/history-engine-print-and-play.pdf",
    format: "A4", printBackground: true, preferCSSPageSize: true,
  });
} finally { await browser.close(); }
