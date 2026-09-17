import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("output/pdf", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.goto(
  `${process.env.HISTORY_BASE_URL ?? "http://localhost:5178"}/history-proof.html`,
  { waitUntil: "networkidle" },
);
// Bound embedded print rasters to a 1200 px long edge. Original art stays intact;
// this only changes the PDF's intermediate browser surface, not runtime assets.
await page.evaluate(async () => {
  const urls = new Map();
  async function printRaster(url) {
    if (urls.has(url)) return urls.get(url);
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL("image/jpeg", 0.88);
    urls.set(url, result);
    return result;
  }
  for (const img of document.images) {
    img.src = await printRaster(img.src);
    await img.decode();
  }
  for (const painting of document.querySelectorAll(".painting")) {
    const url = getComputedStyle(painting).backgroundImage.slice(5, -2);
    painting.style.backgroundImage = `url("${await printRaster(url)}")`;
  }
});
await page.pdf({
  path: process.argv[2] ?? "output/pdf/history-engine-print-and-play.pdf",
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
