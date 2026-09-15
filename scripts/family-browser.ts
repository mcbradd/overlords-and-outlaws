import { chromium, expect } from "@playwright/test";
import { createDuel } from "../src/duel";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
      viewport: {
        width: process.argv.includes("--compact") ? 568 : 844,
        height: process.argv.includes("--compact") ? 320 : 390,
      },
    }),
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const initial = createDuel({
    seed: 41,
    house: "alba",
    seats: process.argv.includes("--four") ? 4 : 3,
    humans: 4,
    mode: "family",
  });
  if (process.argv.includes("--estate")) initial.players[1].estates = 1;
  await page.addInitScript((game) => {
    if (!localStorage.getItem("oando-v2"))
      localStorage.setItem(
        "oando-v2",
        JSON.stringify({
          version: 2,
          game,
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
      );
  }, initial);
  await page.goto("http://localhost:5173");
  await page.locator("[data-resume]").click();
  await expect(page.locator(".hand-cards [data-royal]")).toHaveCount(0);
  await page.locator("[data-ready]").click();
  await expect(page.locator(".hand-cards [data-royal]")).toHaveCount(5);
  await page.locator('.arena [data-royal="0:alba-0"]').click();
  await page
    .locator(
      process.argv.includes("--estate")
        ? '[data-target="estate-1"]'
        : process.argv.includes("--compact")
          ? '.arena [data-royal="1:plantagenet-0"]'
          : '[data-target="crown-1"]',
    )
    .click();
  const fit = await page.evaluate(() => {
    const b = [...document.querySelectorAll("[data-move]")]
        .find((e) => e.textContent?.includes("Declare this challenge"))!
        .getBoundingClientRect(),
      p = document.querySelector(".decision-panel")!.getBoundingClientRect();
    return b.bottom <= p.bottom && b.top >= p.top;
  });
  expect(fit).toBe(true);
  await page
    .locator("[data-move]")
    .filter({ hasText: "Declare this challenge" })
    .click();
  await expect(page.locator(".handoff-screen")).toContainText("Plantagenet");
  await expect(page.locator(".hand-cards [data-royal]")).toHaveCount(0);
  await page.screenshot({ path: "artifacts/v2/family-private-response.png" });
  await page.locator("[data-ready]").click();
  await page.locator('[data-response="brace"]').click();
  await expect(page.locator(".handoff-screen")).toContainText("Alba");
  await expect(page.locator(".hand-cards [data-royal]")).toHaveCount(0);
  await page.locator("[data-ready]").click();
  await page.locator('[data-target="crown-1"]').click();
  await expect(page.locator(".modal")).toContainText("Every exposed Royal", {
    ignoreCase: true,
  });
  const initialFocus = await page.evaluate(() =>
    document.activeElement?.getAttribute("data-close"),
  );
  await page.keyboard.press("Tab");
  await expect(page.locator("[data-close]")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".modal")).toHaveCount(0);
  await page.locator("[data-save]").click();
  await page.reload();
  await page.locator("[data-resume]").click();
  await expect(page.locator(".hand-cards [data-royal]")).toHaveCount(0);
  await page.locator("[data-ready]").click();
  const state = await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v2")!).game,
  );
  expect(state.players[1].stability).toBe(
    process.argv.includes("--compact") ? 12 : 10,
  );
  expect(state.players[1].gold).toBe(4);
  expect(state.pending).toBe(null);
  if (process.argv.includes("--estate")) {
    expect(state.players[1].estates).toBe(0);
    expect(state.players[0].gold).toBe(7);
  }
  console.log(
    JSON.stringify({
      familyResponse: "passed",
      privateResume: "passed",
      keyboardModal: "passed",
      initialFocus,
      errors,
    }),
  );
  expect(errors).toEqual([]);
} finally {
  await browser.close();
}
