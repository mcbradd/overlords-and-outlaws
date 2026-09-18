import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
  await page.locator('[data-do="intro"]').click();
  await page.locator('[data-do="teach"]').click();
  await page.locator('.c-lesson-popover .primary[data-do="close"]').click();
  await expect(
    page.locator('[data-do="select"][data-card="plantagenet-6"]'),
  ).toBeEnabled();
  const revision = () =>
    page.evaluate(
      () =>
        JSON.parse(
          Object.entries(localStorage).find(([key]) =>
            key.endsWith("oando-v9-inheritance"),
          )![1],
        ).game.revision,
    );
  assert.equal(await revision(), 0);
  await page.locator('[data-do="select"][data-card="plantagenet-6"]').click();
  assert.equal(await revision(), 1, 'draft choice commits exactly once');
  await expect(page.locator('[data-do="commit"],[data-do="cancel"],[data-do="continue"]')).toHaveCount(0);
  await expect(page.locator('.c-locked-pick')).toHaveCount(1);
  console.log(
    "Draft selection passed: immediate commit, no confirmation or Continue.",
  );
} finally {
  await browser.close();
}
