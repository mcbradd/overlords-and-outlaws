import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
const staged = existsSync("src/card-texture-next.ts");
const modulePath = staged
  ? "/src/card-texture-next.ts"
  : "/src/card-texture.ts";
const available = [
  "alba",
  "plantagenet",
  "tudor",
  "valois",
  "habsburg",
  "bourbon",
].flatMap((h) =>
  ["full", "board"]
    .filter((f) => existsSync(`public/art/frames/${h}-${f}-v3.png`))
    .map((f) => ({ house: h, face: f })),
);
mkdirSync("artifacts/frame-v3", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto("http://localhost:5176/?legacy=1");
  const metrics = await page.evaluate(
    async ({ modulePath, available }) => {
      const { paintCard } = await import(modulePath);
      const { cardFaceModel } = await import("/src/cards.ts");
      const { CARDS } = await import("/src/content.ts");
      const { spec } = await import("/src/duel.ts");
      document.body.innerHTML =
        '<main id="proof" style="display:flex;flex-wrap:wrap;gap:20px;padding:20px;background:#172127"></main>';
      const records = [];
      for (const { house: h, face } of available) {
        const c = CARDS.filter((c) => c.house === h).sort(
          (a, b) => b.name.length - a.name.length,
        )[0];
        const model = cardFaceModel(
          { uid: c.id, card: c.id, hp: spec(c.id).resolve, ready: true },
          undefined,
          face === "board",
        );
        const painted = await paintCard(model);
        painted.canvas.style.cssText = "width:420px;height:auto;display:block";
        painted.canvas.dataset.house = `${h}-${face}`;
        document.querySelector("#proof").append(painted.canvas);
        records.push({ house: h, face, fields: painted.fields });
      }
      return records;
    },
    { modulePath, available },
  );
  await page
    .locator("#proof")
    .screenshot({ path: "artifacts/frame-v3/first-composites.png" });
  for (const { house: h, face } of available)
    await page
      .locator(`canvas[data-house="${h}-${face}"]`)
      .screenshot({ path: `artifacts/frame-v3/${h}-${face}-sample.png` });
  writeFileSync(
    "artifacts/frame-v3/metrics.json",
    JSON.stringify(metrics, null, 2),
  );
  console.log(available);
} finally {
  await browser.close();
}
