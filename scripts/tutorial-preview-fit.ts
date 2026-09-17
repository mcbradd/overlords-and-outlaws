import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { createTutorial, lessonAction } from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { CONTENT_VERSION } from "../src/history-engine/content";
import { defaultPreferences } from "../src/history-engine/storage";
import { clickReachable } from "./history-tutorial-driver";

const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
const [width, height] = (process.env.HISTORY_VIEWPORT ?? "667x375").split("x").map(Number);
mkdirSync("artifacts/history", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const cursor of [17, 19, 22, 24, 32, 35, 38, 40, 43, 45, 47, 49, 50]) {
    let game = createTutorial();
    for (let index = 0; index < cursor; index++) game = applyAction(game, lessonAction(game, index)!);
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    await page.routeWebSocket("**/*", socket => socket.close());
    await page.goto(base);
    await page.evaluate(save => localStorage.setItem("oando-v4-history", JSON.stringify(save)), {
      version: 4, rulesetId: "history-engine-v4", contentVersion: CONTENT_VERSION,
      game, tutorial: cursor, preferences: defaultPreferences(),
    });
    await page.reload();
    await page.locator('[data-ui="resume"]').click();
    await page.locator('.h-table[data-scene-ready="true"]').waitFor();
    await page.screenshot({ path: `artifacts/history/options-${cursor}-${width}x${height}.png` });
    await clickReachable(page.locator('[data-action][data-recommended="true"]').first(), `decision ${cursor}`);
    await page.locator('.h-table[data-scene-ready="true"]').waitFor();
    await page.screenshot({ path: `artifacts/history/preview-${cursor}-${width}x${height}.png` });
    await clickReachable(page.locator('[data-ui="commit"]'), `confirm decision ${cursor}`);
    await page.close();
  }
  console.log(`Thirteen choices and consequence previews fit and respond at ${width}x${height}.`);
} finally { await browser.close(); }
