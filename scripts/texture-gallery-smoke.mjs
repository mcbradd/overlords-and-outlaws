import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5176/artifacts/showcase-proof/index.html');
  await page.selectOption('#house','plantagenet');
  await page.waitForFunction(()=>document.querySelectorAll('canvas[data-paint-state="ready"]').length===14);
  const henry=page.locator('[data-card-id="plantagenet-4"]');
  await henry.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page.screenshot({path:'artifacts/showcase-proof/henry-inspection.png'});
  await page.keyboard.press('Escape');
  await expect(henry).toBeFocused();
  await page.selectOption('#format','board');
  await page.check('#damage');
  await page.waitForFunction(()=>document.querySelectorAll('canvas[data-paint-state="ready"]').length===14);
  await expect(page.locator('[data-card-id="plantagenet-4"]')).toHaveAttribute('aria-label',/1 remaining health, damaged/);
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'artifacts/showcase-proof/gallery-phone.png'});
  expect(errors).toEqual([]);
  console.log('Gallery keyboard inspection, Escape/focus return, damaged state, and compact view passed; no browser errors.');
} finally {await browser.close();}
