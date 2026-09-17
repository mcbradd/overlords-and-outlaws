import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const output = "artifacts/portraits";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1680, height: 1600 },
    reducedMotion: "reduce",
  });
  await page.goto(new URL('?legacy=1', process.env.BASE_URL ?? "http://localhost:5173").href);
  const report = await page.evaluate(async () => {
    // @ts-expect-error Vite serves source modules in the browser.
    const { CARDS, HOUSES } = await import("/src/content.ts");
    // @ts-expect-error Vite serves source modules in the browser.
    const { cardFace, portrait } = await import("/src/cards.ts");
    // @ts-expect-error Vite serves source modules in the browser.
    const { spec } = await import("/src/duel.ts");
    document.body.innerHTML = '<main id="portrait-audit"></main>';
    const host = document.querySelector<HTMLElement>("#portrait-audit")!;
    host.style.cssText =
      "padding:24px;background:#172020;display:grid;grid-template-columns:repeat(7,210px);gap:18px;align-content:start";
    const rows = [];
    for (const c of CARDS) {
      const img = new Image();
      img.src = portrait(c.id);
      await img.decode();
      rows.push({
        id: c.id,
        name: c.name,
        asset: portrait(c.id),
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
    (window as any).renderPortraitHouse = async (
      house: string,
      face: string,
    ) => {
      host.innerHTML = CARDS.filter((c: any) => c.house === house)
        .map((c: any) => {
          const r = {
            uid: c.id,
            card: c.id,
            hp: spec({ card: c.id }).resolve,
            ready: true,
          };
          return `<div style="width:210px">${cardFace(r, { zone: face === "board" ? "court" : "inspect-card" })}</div>`;
        })
        .join("");
      host.querySelectorAll<HTMLElement>(".royal-card").forEach((el) => {
        el.style.width = "210px";
        el.style.height = "auto";
      });
      await Promise.all(
        [...host.querySelectorAll("img")].map((img) => img.decode()),
      );
    };
    return { rows, houses: HOUSES.map((h: any) => h.id) };
  });
  for (const house of report.houses)
    for (const face of ["full", "board"]) {
      await page.evaluate(
        async ({ house, face }) =>
          (window as any).renderPortraitHouse(house, face),
        { house, face },
      );
      await page
        .locator("#portrait-audit")
        .screenshot({ path: `${output}/${house}-${face}.png` });
    }
  writeFileSync(
    `${output}/coverage.json`,
    JSON.stringify(report.rows, null, 2),
  );
  const uniqueAssets = new Set(report.rows.map((r: any) => r.asset)).size;
  const bespoke = report.rows.filter((r: any) =>
    r.asset.includes("/art/characters/"),
  ).length;
  console.log(
    JSON.stringify({ count: report.rows.length, uniqueAssets, bespoke }),
  );
  if (
    process.argv.includes("--complete") &&
    (uniqueAssets !== report.rows.length || bespoke !== report.rows.length)
  ) {
    throw new Error(
      "Every playable character must load its own bespoke portrait.",
    );
  }
} finally {
  await browser.close();
}
