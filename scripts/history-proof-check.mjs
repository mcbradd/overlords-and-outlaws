import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
await page.goto(
  `${process.env.HISTORY_BASE_URL ?? "http://localhost:5178"}/history-proof.html`,
);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: "artifacts/history/print-top.png",
  fullPage: false,
});
const failures = await page.locator(".card").evaluateAll((cards) =>
  cards.flatMap((card) =>
    Array.from(card.querySelectorAll(".ink > *"))
      .filter((el) => {
        const r = el.getBoundingClientRect(),
          p = card.getBoundingClientRect();
        return r.bottom > p.bottom - 1 || r.right > p.right || r.left < p.left;
      })
      .map((el) => ({
        id: card.getAttribute("data-card"),
        text: el.textContent,
        card: card.getBoundingClientRect().height,
        bottom:
          el.getBoundingClientRect().bottom - card.getBoundingClientRect().top,
      })),
  ),
);
console.log(JSON.stringify(failures));
writeFileSync(
  "artifacts/history/print-fit.json",
  JSON.stringify(
    { cards: await page.locator(".card[data-card]").count(), failures },
    null,
    2,
  ),
);
assert.deepEqual(
  failures,
  [],
  "CT017: full-face text must fit at the fixed print size",
);
await browser.close();
