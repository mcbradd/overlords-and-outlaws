import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const base =
  process.env.BASE_URL ?? "http://localhost:4176/overlords-and-outlaws/";
const namespace = process.env.SAVE_NAMESPACE ?? "";
const expectedSha = process.env.EXPECTED_SHA;
const expectedBuild = process.env.EXPECTED_BUILD;
const output = "artifacts/prod-smoke";
mkdirSync(output, { recursive: true });
const report = {
  base,
  namespace,
  startedAt: new Date().toISOString(),
  status: "running",
  identity: null,
  viewports: [],
  errors: [],
  failedRequests: [],
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
let currentPage;
let stage = "start";

// Click coordinates only after measuring the visual viewport and hit target.
// Auto-scrolling and forced clicks would conceal the failures this checks for.
async function clickReachable(page, selector, result) {
  stage = selector;
  const target = page.locator(selector);
  await expect(target).toBeVisible();
  await expect(target).toBeEnabled();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  const geometry = await target.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const viewport = visualViewport;
    const left = viewport?.offsetLeft ?? 0,
      top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? innerWidth,
      height = viewport?.height ?? innerHeight;
    const x = box.left + box.width / 2,
      y = box.top + box.height / 2;
    const hit = document.elementFromPoint(x, y);
    const panel = element.closest(".h-decision")?.getBoundingClientRect();
    return {
      x,
      y,
      rect: box.toJSON(),
      viewport: { left, top, width, height },
      inViewport:
        box.width > 0 &&
        box.height > 0 &&
        box.left >= left - 1 &&
        box.top >= top - 1 &&
        box.right <= left + width + 1 &&
        box.bottom <= top + height + 1,
      inPanel:
        !panel ||
        (box.left >= panel.left - 1 &&
          box.top >= panel.top - 1 &&
          box.right <= panel.right + 1 &&
          box.bottom <= panel.bottom + 1),
      hittable: !!hit && (hit === element || element.contains(hit)),
      interceptedBy: hit?.outerHTML.slice(0, 180) ?? "nothing",
      scroll: { x: scrollX, y: scrollY },
    };
  });
  result.checks.push({ selector, ...geometry });
  expect(geometry.inViewport, `${selector}: ${JSON.stringify(geometry)}`).toBe(
    true,
  );
  expect(geometry.inPanel, `${selector} is clipped by its action panel`).toBe(
    true,
  );
  expect(
    geometry.hittable,
    `${selector} is intercepted by ${geometry.interceptedBy}`,
  ).toBe(true);
  if (result.touch) await page.touchscreen.tap(geometry.x, geometry.y);
  else await page.mouse.click(geometry.x, geometry.y);
  expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual(
    geometry.scroll,
  );
}
const savedGame = (page) =>
  page.evaluate(
    (prefix) =>
      JSON.parse(localStorage.getItem(`${prefix}oando-v4-history`) ?? "null")
        ?.game,
    namespace,
  );
async function assertSaveIsolation(page) {
  if (!namespace) return;
  expect(
    await page.evaluate(() => [
      localStorage.getItem("oando-v3"),
      localStorage.getItem("oando-v4-history"),
    ]),
  ).toEqual(["live-v3-save-sentinel", "live-v4-save-sentinel"]);
  expect(await savedGame(page)).toBeTruthy();
}
async function screenshot(page, name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const path = `${output}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  return path;
}
const sceneReady = (page) =>
  page.locator('#h-table[data-scene-ready="true"]').waitFor({ timeout: 30000 });

try {
  for (const device of [
    {
      name: "desktop",
      viewport: { width: 1440, height: 900 },
      hasTouch: false,
    },
    {
      name: "phone-landscape",
      viewport: { width: 844, height: 390 },
      hasTouch: true,
    },
  ]) {
    const context = await browser.newContext({
      viewport: device.viewport,
      hasTouch: device.hasTouch,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    currentPage = page;
    if (namespace)
      await page.addInitScript(() => {
        if (sessionStorage.getItem("pages-smoke-seeded")) return;
        localStorage.setItem("oando-v3", "live-v3-save-sentinel");
        localStorage.setItem("oando-v4-history", "live-v4-save-sentinel");
        sessionStorage.setItem("pages-smoke-seeded", "true");
      });
    page.on("pageerror", (error) =>
      report.errors.push(`${device.name}: ${error.message}`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400)
        report.failedRequests.push(
          `${device.name}: ${response.status()} ${response.url()}`,
        );
    });
    page.on("requestfailed", (request) =>
      report.failedRequests.push(
        `${device.name}: ${request.failure()?.errorText} ${request.url()}`,
      ),
    );
    const result = {
      name: device.name,
      viewport: device.viewport,
      touch: device.hasTouch,
      checks: [],
      screenshots: [],
    };
    report.viewports.push(result);

    if ((expectedSha || expectedBuild) && !report.identity) {
      stage = "published revision";
      const url = new URL("revision.json", base);
      url.searchParams.set("smoke", Date.now().toString());
      const response = await context.request.get(url.href);
      expect(response.ok(), `revision.json returned ${response.status()}`).toBe(
        true,
      );
      report.identity = await response.json();
      expect(report.identity.branch).toBe("prod");
      expect(
        Number.isSafeInteger(report.identity.buildNumber) &&
          report.identity.buildNumber >= 1,
      ).toBe(true);
      if (expectedSha) expect(report.identity.sha).toBe(expectedSha);
      if (expectedBuild)
        expect(String(report.identity.buildNumber)).toBe(expectedBuild);
    }
    stage = `${device.name}: title`;
    await page.goto(base);
    await expect(page.locator('[data-ui="teach"]')).toBeVisible();
    result.badge = await page.locator(".build-identity").innerText();
    if (report.identity) {
      expect(result.badge).toBe(`Build ${report.identity.buildNumber}`);
      await expect(page.locator(".build-identity")).toHaveAttribute(
        "title",
        `Source ${report.identity.sha}`,
      );
    }
    result.screenshots.push(await screenshot(page, `${device.name}-title`));
    await clickReachable(page, '[data-ui="teach"]', result);
    await expect(page.locator(".h-curtain")).toHaveCount(0);
    await expect(page.locator(".h-solo-intro")).toContainText("Henry II");
    await expect(page.locator(".h-solo-intro")).toContainText("Henry VII");
    result.screenshots.push(await screenshot(page, `${device.name}-intro`));
    const prepared = await savedGame(page);
    expect(prepared).toBeTruthy();
    await clickReachable(page, '[data-ui="enter-table"]', result);
    await sceneReady(page);
    expect(await savedGame(page)).toEqual(prepared);
    await expect(page.locator(".h-guide")).toBeVisible();
    await expect(page.locator(".h-progress")).toContainText("Chapter 1 / 10");
    await expect(
      page.locator(
        '[data-guide-card],[data-ui="lesson-action"],[data-ui="lesson-next"]',
      ),
    ).toHaveCount(0);
    result.screenshots.push(await screenshot(page, `${device.name}-opening`));
    await clickReachable(page, '[data-select="alba-7"]', result);
    await expect(page.locator('[data-select="alba-7"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await clickReachable(page, '[data-ui="offer-1"]', result);
    await sceneReady(page);
    result.screenshots.push(await screenshot(page, `${device.name}-preview`));
    await clickReachable(page, '[data-ui="commit"]', result);
    await page.waitForFunction(
      ({ prefix, revision }) =>
        JSON.parse(localStorage.getItem(`${prefix}oando-v4-history`) ?? "null")
          ?.game?.revision > revision,
      { prefix: namespace, revision: prepared.revision },
    );
    await sceneReady(page);
    result.screenshots.push(await screenshot(page, `${device.name}-action`));
    result.revisions = {
      prepared: prepared.revision,
      afterAction: (await savedGame(page)).revision,
    };
    await assertSaveIsolation(page);
    result.saveIsolation = namespace
      ? "both live keys preserved; namespaced History save written"
      : "not requested for local unnamespaced build";

    // Keep the manufacturing proof and existing legacy game/gallery coverage.
    if (device.name === "desktop") {
      stage = "History manufacturing proof";
      await page.goto(new URL("history-proof.html", base).href);
      await expect(page.locator(".card[data-card]")).toHaveCount(92);
      await page.waitForFunction(
        () =>
          ["ready", "error"].includes(
            document.documentElement.dataset.printState,
          ),
        undefined,
        { timeout: 30000 },
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-print-state",
        "ready",
      );
      await expect(
        page.locator('.card[data-card] [data-face-state="ready"]'),
      ).toHaveCount(92);
      stage = "legacy game";
      await page.goto(new URL("?legacy=1", base).href);
      await page.locator('[data-start="lesson"]').click();
      await page.waitForFunction(
        () =>
          document.querySelectorAll('.physical-card[data-texture-ready="true"]')
            .length === 4,
      );
      await assertSaveIsolation(page);
      stage = "legacy gallery";
      await page.goto(new URL("proof/", base).href);
      for (const house of [
        "alba",
        "plantagenet",
        "tudor",
        "valois",
        "habsburg",
        "bourbon",
      ]) {
        await page.selectOption("#house", house);
        await page.waitForFunction(
          () =>
            document.querySelectorAll('canvas[data-paint-state="ready"]')
              .length === 14,
        );
      }
      await page.locator("[data-card-id]").first().click();
      await expect(page.locator("dialog[open]")).toBeVisible();
      await page.keyboard.press("Escape");
      await page.selectOption("#format", "board");
      await page.check("#damage");
      await page.waitForFunction(
        () =>
          document.querySelectorAll('canvas[data-paint-state="ready"]')
            .length === 14,
      );
      report.gallery =
        "92 manufactured History faces; legacy lesson; six Houses, inspect, damaged battlefield passed";
    }
    await context.close();
    currentPage = null;
  }
  expect(report.errors).toEqual([]);
  expect(report.failedRequests).toEqual([]);
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.failure = { stage, message: error.message };
  if (currentPage && !currentPage.isClosed())
    await screenshot(currentPage, "failure").catch(() => {});
  throw error;
} finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync(
    `${output}/report.json`,
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report));
  await browser.close();
}
