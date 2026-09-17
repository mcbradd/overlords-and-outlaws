import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { runCoreBrowser } from "./core-browser";

const base =
  process.env.BASE_URL ?? "http://localhost:4176/overlords-and-outlaws-prod/";
const output = process.env.CORE_SMOKE_OUTPUT ?? "artifacts/core/prod-smoke";
mkdirSync(output, { recursive: true });
const report = {
  base,
  identity: null as unknown,
  badge: "",
  results: [] as unknown[],
  passed: false,
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  if (process.env.EXPECTED_SHA || process.env.EXPECTED_BUILD) {
    const response = await page.request.get(
      new URL("revision.json", base).href,
    );
    assert.ok(response.ok(), `revision.json returned ${response.status()}`);
    const identity = await response.json();
    assert.equal(identity.branch, "prod");
    if (process.env.EXPECTED_SHA)
      assert.equal(identity.sha, process.env.EXPECTED_SHA);
    if (process.env.EXPECTED_BUILD)
      assert.equal(identity.buildNumber, Number(process.env.EXPECTED_BUILD));
    report.identity = identity;
  }
  await page.goto(base);
  await expect(page.locator('[data-do="intro"]')).toBeVisible();
  report.badge = await page.locator(".build-identity").innerText();
  if (process.env.EXPECTED_BUILD)
    assert.equal(report.badge, `Build ${process.env.EXPECTED_BUILD}`);
} finally {
  await browser.close();
}
for (const [width, height] of [
  [1440, 900],
  [390, 844],
]) {
  const result = await runCoreBrowser({
    base,
    width,
    height,
    output: `${output}/${width}x${height}`,
  });
  report.results.push({
    viewport: `${width}x${height}`,
    passed: result.passed,
    tutorialCompleted: result.tutorialCompleted,
    failures: result.failures,
  });
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
}
report.passed = report.results.every(
  (result) => (result as { passed: boolean }).passed,
);
writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
