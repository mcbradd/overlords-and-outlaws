import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
mkdirSync("artifacts/v3", { recursive: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() =>
  localStorage.setItem(
    "oando-v3",
    JSON.stringify({
      version: 2,
      game: null,
      wins: 0,
      renown: 0,
      sound: false,
      motion: false,
      coaching: true,
      seen: [],
      run: null,
      processed: [],
      daily: null,
    }),
  ),
);
const waitFor = async (selector: string) => {
  for (let n = 0; n < 300; n++) {
    const banner = page.locator("#battle-banner.show");
    if (await banner.isVisible()) await banner.click();
    if (await page.locator(selector).isVisible()) return;
    await page.waitForTimeout(50);
  }
  throw Error(`Timed out: ${selector}`);
};
try {
  await page.goto("http://localhost:5173");
  await page.locator('[data-start="lesson"]').click();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator(".lesson-number")).toContainText(String(i + 1));
    if ([0, 4].includes(i)) {
      await page.locator(".hand-cards [data-royal]").first().click();
      await page
        .locator(`[data-move*='"type":"${i === 0 ? "deploy" : "marry"}"']`)
        .click();
    } else if (i === 1 || i === 3) {
      await page
        .locator('.arena [data-owner="0"] [data-royal]')
        .first()
        .click();
      await page.locator('.arena [data-owner="1"] .targetable').first().click();
      await expect(page.locator("#decision-panel")).toContainText("health");
      await page.locator('[data-move*=\'"type":"attack"\']').click();
    } else if (i === 2) await page.locator('[data-response="brace"]').click();
    else if (i === 8)
      await page.locator('[data-move*=\'"type":"recruit"\']').click();
    else if (i === 9) await page.locator("[data-end]").click();
    else {
      await page
        .locator(`[data-move*='"type":"${i === 5 ? "estate" : "claim"}"']`)
        .click();
      for (let n = 0; n < 80; n++) {
        const banner = page.locator("#battle-banner.show");
        if (await banner.isVisible()) await banner.click();
        if (await page.locator("[data-end]").isEnabled()) break;
        await page.waitForTimeout(50);
      }
      await page.locator("[data-end]").click();
      if (i === 7)
        for (let response = 0; response < 2; response++) {
          await waitFor('[data-response="brace"]');
          await page.locator('[data-response="brace"]').click();
          await page.waitForTimeout(100);
        }
    }
    await waitFor("[data-next-lesson]");
    if (i === 7 || i === 9) {
      await expect(page.locator("#turn-label")).toHaveText("GAME COMPLETE");
      await expect(page.locator("#decision-panel")).toContainText(
        "GAME COMPLETE",
      );
      await expect(page.locator("#scoreboard .current")).toHaveCount(0);
    }
    await page.screenshot({ path: `artifacts/v3/lesson-${i + 1}.png` });
    console.log(`Lesson ${i + 1}: completed through browser controls`);
    if (i < 9) await page.locator("[data-next-lesson]").click();
  }
  await expect(page.locator("#lesson-coach")).toContainText("Every House lost");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "artifacts/v3/lesson-browser.json",
    JSON.stringify({ lessons: 10, errors }, null, 2),
  );
} finally {
  await browser.close();
}
