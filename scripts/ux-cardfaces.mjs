import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto("http://localhost:5173");
  const failures = await page.evaluate(async () => {
    const { cardFace } = await import("/src/cards.ts");
    const { CARDS } = await import("/src/content.ts");
    const { createDuel, spec } = await import("/src/duel.ts");
    const host = document.createElement("div");
    host.style.cssText =
      "position:fixed;left:0;top:0;z-index:1000;background:#11232a";
    document.body.append(host);
    const failures = [];
    for (const width of [200, 280, 384])
      for (const c of CARDS) {
        const owner = createDuel({ seed: 1, house: c.house, seats: 2 })
          .players[0];
        host.innerHTML = cardFace(
          { uid: "test", card: c.id, hp: 10, ready: true },
          { zone: "inspect-card", owner },
        );
        const card = host.firstElementChild;
        host.style.width = width + "px";
        card.style.width = "100%";
        card.style.height = "auto";
        for (const selector of [".card-ability", ".role-band", ".card-foot"]) {
          const e = card.querySelector(selector),
            r = e.getBoundingClientRect(),
            b = card.getBoundingClientRect();
          if (e.scrollHeight > e.clientHeight + 1 || r.bottom > b.bottom + 1)
            failures.push({
              id: c.id,
              width,
              selector,
              height: e.clientHeight,
              content: e.scrollHeight,
            });
        }
      }
    host.remove();
    return failures;
  });
  writeFileSync(
    "artifacts/ux/verified/cardface-report.json",
    JSON.stringify({ cards: 84, sizes: [200, 280, 384], failures }, null, 2),
  );
  console.log(
    JSON.stringify({
      faces: 252,
      failures: failures.length,
      examples: failures.slice(0, 8),
    }),
  );
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
