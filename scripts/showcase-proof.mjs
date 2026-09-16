import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const output = "artifacts/showcase-proof";
mkdirSync(`${output}/cards`, { recursive: true });
writeFileSync(
  `${output}/index.html`,
  `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Overlords &amp; Outlaws — live card proofs</title>
<style>
body{margin:0!important;background:#101b20!important;color:#f4e4c8;font:16px/1.4 Georgia,serif!important;overflow:auto!important}
header{padding:24px 32px;background:#15242c;position:relative!important;top:auto!important;z-index:2;border-bottom:1px solid #756543}h1{font-size:26px!important;margin:0 0 14px!important}label{display:inline-block;margin:6px 18px 6px 0;font:14px Arial}select{font:inherit;background:#101b20;color:inherit;padding:8px;border:1px solid #756543;border-radius:4px}#proof-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,310px));gap:28px;justify-content:center;padding:32px}figure{margin:0}figure .royal-card{width:100%!important;height:auto!important;transform:none!important}figcaption{padding-top:10px;text-align:center;font-size:15px}small{display:block;color:#b5b7ac;font:12px/1.6 Arial}
.proof-inspection{padding:14px;background:#101b20;border:1px solid #756543;max-height:96vh;overflow:auto;color:#f4e4c8}.proof-inspection::backdrop{background:#000c}.proof-inspection canvas{display:block;width:min(80vw,calc(78vh * 63 / 88),630px);height:auto}.proof-close{display:block;margin:0 0 10px auto;color:inherit;background:#243038;padding:8px 14px;border:1px solid #756543}</style>
<header><h1>Overlords &amp; Outlaws · Live texture proofs</h1>
<label>House <select id="house"></select></label>
<label>Face <select id="format"><option value="full">Full rules</option><option value="board">Battlefield</option></select></label>
<label><input id="damage" type="checkbox"> Show damaged health</label>
<small>84 individual portraits across six Houses. These are the same print textures used on the 3D cards.</small></header>
<main id="proof-cards"></main><script type="module" src="/src/proof-gallery.ts"></script></html>`,
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 2340, height: 990 },
    reducedMotion: "reduce",
  });
  await page.goto(
    `${process.env.BASE_URL ?? "http://localhost:5176"}/${output}/index.html`,
  );
  await page.addStyleTag({
    content:
      "#proof-cards {grid-template-columns:repeat(7,310px);width:max-content}",
  });
  const report = await page.evaluate(async () => {
    const { CARDS } = await import("/src/content.ts");
    const { cardFaceModel, crest } = await import("/src/cards.ts");
    const { paintCard, FACE_FIELDS } = await import("/src/card-texture.ts");
    const { spec } = await import("/src/duel.ts");
    const failures = [],
      portraits = [];
    let cases = 0;
    const framePixels = new Map();
    async function frameInk(house, face) {
      const key = `${house}-${face}`;
      if (!framePixels.has(key)) {
        const img = new Image();
        img.src = `/art/frames/${key}-v3.png`;
        await img.decode();
        const surface = document.createElement("canvas");
        surface.width = 630;
        surface.height = 880;
        const context = surface.getContext("2d");
        context.drawImage(img, 0, 0, 630, 880);
        framePixels.set(key, context.getImageData(0, 0, 630, 880).data);
      }
      return framePixels.get(key);
    }
    for (const c of CARDS) {
      portraits.push(
        cardFaceModel({
          card: c.id,
          uid: c.id,
          hp: spec(c.id).resolve,
          ready: true,
        }).portrait,
      );
      for (const board of [false, true])
        for (const damaged of [false, true]) {
          cases++;
          const hp = damaged ? 1 : spec(c.id).resolve;
          const model = cardFaceModel(
            { card: c.id, uid: c.id, hp, ready: true },
            undefined,
            board,
          );
          const { fields, canvas } = await paintCard(model);
          const frame = await frameInk(model.house, model.face);
          const fail = (problem) =>
            failures.push({ id: c.id, board, damaged, problem });
          for (const f of fields) {
            if (
              f.x < 0 ||
              f.x + f.width > 600 ||
              f.y < 0 ||
              f.y + f.height > 880
            )
              fail(`${f.label} outside safe area`);
            if (f.label === "ability" && f.y + f.height > 755)
              fail("rules crowd bottom rim");
            if (f.label === "name" && f.width > 522) fail("name overflow");
            if (
              ["name", "role", "ability"].includes(f.label) &&
              (f.x < 52 || f.x + f.width > 578)
            )
              fail("unequal text margins");
            if (
              ["name", "role", "ability", "attack", "health", "credit"].includes(
                f.label,
              )
            ) {
              let touchesMetal = false;
              for (
                let y = Math.floor(f.y - 7);
                y <= Math.ceil(f.y + f.height + 7);
                y++
              )
                for (
                  let x = Math.floor(f.x - 7);
                  x <= Math.ceil(f.x + f.width + 7);
                  x++
                ) {
                  const i = (y * 630 + x) * 4;
                  if (
                    frame[i + 3] > 220 &&
                    Math.max(frame[i], frame[i + 1], frame[i + 2]) > 175
                  )
                    touchesMetal = true;
                }
              if (touchesMetal)
                fail(`${f.label} within 7px of painted ornament`);
            }
          }
          const health = fields.find((f) => f.label === "health");
          if (health.text !== String(hp) || health.text.includes("/"))
            fail("health must be current value only");
          if (
            fields.find((f) => f.label === "attack").text !==
            String(spec(c.id).force)
          )
            fail("attack mismatch");
          if (fields.find((f) => f.label === "name").text !== c.name)
            fail("name mismatch");
          const pixels = canvas
            .getContext("2d")
            .getImageData(
              Math.floor(health.x * 2),
              Math.floor(health.y * 2),
              Math.ceil(health.width * 2),
              Math.ceil(health.height * 2),
            ).data;
          let redPixels = 0;
          for (let i = 0; i < pixels.length; i += 4)
            if (pixels[i] > 220 && pixels[i + 1] < 135 && pixels[i + 2] < 135)
              redPixels++;
          if (damaged && redPixels < 20) fail("damaged health not visibly red");
          if (!crest(c.id).includes("<svg"))
            fail("missing canonical house icon");
        }
    }
    return {
      cases,
      cards: CARDS.length,
      failures,
      portraits,
      fields: FACE_FIELDS,
    };
  });
  const hashes = report.portraits.map((url) =>
    createHash("sha256")
      .update(
        readFileSync(`public${new URL(url, "http://localhost").pathname}`),
      )
      .digest("hex"),
  );
  report.uniquePortraits = new Set(hashes).size;
  if (report.uniquePortraits !== report.cards)
    report.failures.push({ problem: "reused portrait bytes" });
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  for (const house of [
    "alba",
    "plantagenet",
    "tudor",
    "valois",
    "habsburg",
    "bourbon",
  ]) {
    await page.selectOption("#house", house);
    for (const format of ["full", "board"]) {
      await page.selectOption("#format", format);
      await page.locator("#damage").setChecked(format === "board");
      await page.waitForFunction(
        () =>
          document.querySelectorAll(
            "#proof-cards canvas[data-paint-state='ready']",
          ).length === 14,
      );
      await page
        .locator("#proof-cards")
        .screenshot({ path: `${output}/${house}-${format}.png` });
      for (const card of await page.locator("#proof-cards .royal-card").all())
        await card.screenshot({
          path: `${output}/cards/${await card.getAttribute("data-card-id")}-${format}.png`,
        });
    }
  }
  console.log(
    JSON.stringify(
      {
        cases: report.cases,
        uniquePortraits: report.uniquePortraits,
        failures: report.failures,
      },
      null,
      2,
    ),
  );
  if (report.failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
