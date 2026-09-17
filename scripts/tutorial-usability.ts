import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { startTeaching, readGame } from "./history-tutorial-driver";
import { applyAction } from "../src/history-engine/engine";
import type { Action } from "../src/history-engine/types";
const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
mkdirSync("artifacts/tutorial-usability", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const reports = [];
try {
  for (const [width, height] of [[1440, 900], [844, 390], [667, 375], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    await page.routeWebSocket("**/*", socket => socket.close());
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base);
    await startTeaching(page);
    const before = await readGame(page);
    await page.locator('[data-inspect="alba-9"]').click();
    assert.equal(await page.locator("dialog[open]").count(), 1);
    assert.deepEqual(await readGame(page), before);
    await page.keyboard.press("Escape");
    await page.locator('[data-action-category]').selectOption("build");
    const actionButton = page.locator("[data-action]").first();
    const action: Action = JSON.parse((await actionButton.getAttribute("data-action"))!);
    await actionButton.click();
    await page.locator('[data-ui="commit"]').click();
    assert.deepEqual(await readGame(page), JSON.parse(JSON.stringify(applyAction(before, action))), "alternate action is never replaced by a scripted one");
    assert.equal(await page.locator(".h-guide").count(), 0);
    assert.match(await page.locator(".h-tutorial-notice").innerText(), /exact position/);
    await page.screenshot({ path: `artifacts/tutorial-usability/choice-${width}x${height}.png` });
    assert.deepEqual(errors, []);
    reports.push({ width, height, actualCardInspection: true, alternateActionPreserved: true, errors });
    await page.close();
  }
  writeFileSync("artifacts/tutorial-usability/report.json", JSON.stringify(reports, null, 2));
  console.log("Tutorial usability: actual card inspection and independent legal choices passed at four viewports.");
} finally { await browser.close(); }
