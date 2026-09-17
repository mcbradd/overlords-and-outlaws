import { chromium, expect } from "@playwright/test";
const base =
  process.env.BASE_URL ?? "http://localhost:4176/overlords-and-outlaws/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const namespace = process.env.SAVE_NAMESPACE ?? "";
  if (namespace)
    await page.addInitScript(() =>
      localStorage.setItem("oando-v3", "live-save-sentinel"),
    );
  const errors = [];
  const failed = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base);
  await page.locator('[data-ui="teach"]').click();
  await page.locator('[data-ui="unlock"]').click();
  await expect(page.locator(".h-guide")).toBeVisible();
  await page.locator('[data-ui="lesson-action"]').click();
  if (namespace) {
    expect(await page.evaluate(() => localStorage.getItem("oando-v3"))).toBe(
      "live-save-sentinel",
    );
    expect(
      await page.evaluate(
        (prefix) =>
          JSON.parse(localStorage.getItem(`${prefix}oando-v4-history`)).game !==
          null,
        namespace,
      ),
    ).toBe(true);
  }
  await page.goto(new URL("history-proof.html", base).href);
  await expect(page.locator(".card[data-card]")).toHaveCount(92);
  await page.goto(new URL("?legacy=1", base).href);
  await page.locator('[data-start="lesson"]').click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll('.physical-card[data-texture-ready="true"]')
        .length === 4,
  );
  await page.goto(new URL("proof/", base).href);
  for (const house of [
    "alba",
    "plantagenet",
    "tudor",
    "valois",
    "habsburg",
    "bourbon",
  ]) {
    await page.selectOption("#house", house);
    await page.waitForFunction(
      () =>
        document.querySelectorAll('canvas[data-paint-state="ready"]').length ===
        14,
    );
  }
  await page.locator("[data-card-id]").first().click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.selectOption("#format", "board");
  await page.check("#damage");
  await page.waitForFunction(
    () =>
      document.querySelectorAll('canvas[data-paint-state="ready"]').length ===
      14,
  );
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  console.log(
    JSON.stringify({
      base,
      game: "passed",
      gallery: "six Houses, inspect, damaged battlefield passed",
      errors,
      failed,
    }),
  );
} finally {
  await browser.close();
}
