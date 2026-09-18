import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
  await page.locator('[data-do="intro"]').click();
  await page.locator('[data-do="teach"]').click();
  await expect(
    page.locator('[data-do="select"][data-card="alba-2"]'),
  ).toBeEnabled();
  const revision = () =>
    page.evaluate(
      () =>
        JSON.parse(
          Object.entries(localStorage).find(([key]) =>
            key.endsWith("oando-v5-played-trades"),
          )![1],
        ).game.revision,
    );
  assert.equal(await revision(), 0);
  await page.locator('[data-do="select"][data-card="alba-2"]').click();
  assert.equal(await revision(), 0, "choosing a card does not guess an action");
  await page.locator('[data-do="arm"][data-type="recruit"]').click();
  assert.equal(await revision(),0,'choosing the interaction awaits its destination');
  await page.locator('.valid-drop[data-table-card]').first().click();
  assert.equal(
    await revision(),
    1,
    "choosing a valid destination commits immediately, exactly once",
  );
  await expect(
    page.locator('[data-do="commit"],[data-do="cancel"]'),
  ).toHaveCount(0);
  await expect(page.locator('[data-do="continue"]')).toBeVisible();
  await page.locator('[data-do="continue"]').click();
  assert.equal(await revision(), 1, "Continue changes only the lesson cursor");
  console.log(
    "Single selection passed: immediate commit, no confirmation, cursor-only Continue.",
  );
} finally {
  await browser.close();
}
