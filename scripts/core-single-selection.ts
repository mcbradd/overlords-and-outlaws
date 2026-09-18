import { chromium, expect } from "@playwright/test";
import {clickExposed} from './core-tabletop';
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
  await page.locator('[data-do="intro"]').click();
  await page.locator('[data-do="teach"]').click();
  await page.locator('[data-do="lesson-help"]').click();
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
  for(let i=0;i<3;i++) await clickExposed(page.locator('.next-interaction .c-card-pick'));
  assert.equal(await revision(),0,'draft selections are reversible until PASS');
  await expect(page.locator('.c-draft-selected')).toHaveCount(3);
  await page.locator('[data-do="draft-pass"]').click();
  await expect.poll(revision).toBe(6);
  await expect(page.locator('#draft-title')).toContainText('Select 2');
  await expect(page.locator('[data-do="commit"],[data-do="cancel"],[data-do="continue"]')).toHaveCount(0);
  console.log('Draft packet commits once through PASS; no additional confirmation.');
} finally {
  await browser.close();
}
