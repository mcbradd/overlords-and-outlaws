import { chromium, type Locator, type Page } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  CONTENT_VERSION,
  MANIFEST,
  SOURCE,
} from "../src/history-engine/content";
import {
  createPreparedTutorial,
  createTutorial,
  lessonAction,
  LESSONS,
} from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { defaultPreferences } from "../src/history-engine/storage";

// A reader passes only when the actual visible pages and their controls fit.
// Navigation never uses force, scrollIntoView, hidden DOM text or full-page captures.
const base = process.env.HISTORY_BASE_URL ?? "http://localhost:5178";
const viewports = process.env.HISTORY_VIEWPORT
  ? [process.env.HISTORY_VIEWPORT.split("x").map(Number)]
  : [
      [1440, 900],
      [844, 390],
      [667, 320],
      [390, 844],
    ];
const directory = "artifacts/history-reading";
const reportPath = `${directory}/report${process.env.HISTORY_VIEWPORT ? `-${process.env.HISTORY_VIEWPORT}` : ""}.json`;
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const reports: unknown[] = [];

const savedBytes = (page: Page) =>
  page.evaluate(() => localStorage.getItem("oando-v4-history"));
const words = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .match(/[\p{L}\p{N}]+/gu) ?? [];
function assertWordsPreserved(expected: string, actual: string, label: string) {
  const source = words(expected),
    visible = words(actual);
  let cursor = 0;
  for (let index = 0; index < source.length; index++) {
    while (cursor < visible.length && visible[cursor] !== source[index])
      cursor++;
    assert.ok(
      cursor < visible.length,
      `${label}: missing source words around “${source.slice(Math.max(0, index - 5), index + 6).join(" ")}”`,
    );
    cursor++;
  }
}
async function frames(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
async function targetClick(target: Locator, label: string) {
  // Inspect the settled font/layout; modal close and fitting run next frame.
  await target.page().evaluate(() => document.fonts.ready);
  await frames(target.page());
  const result = await target.evaluate((element) => {
    const rect = element.getBoundingClientRect(),
      view = window.visualViewport;
    const left = view?.offsetLeft ?? 0,
      top = view?.offsetTop ?? 0;
    const width = view?.width ?? innerWidth,
      height = view?.height ?? innerHeight;
    const first = element.getClientRects()[0] ?? rect;
    const hit = document.elementFromPoint(
      first.left + first.width / 2,
      first.top + first.height / 2,
    );
    return {
      rect: rect.toJSON(),
      inView:
        rect.width > 0 &&
        rect.height > 0 &&
        rect.left >= left - 1 &&
        rect.top >= top - 1 &&
        rect.right <= left + width + 1 &&
        rect.bottom <= top + height + 1,
      hit: !!hit && (hit === element || element.contains(hit)),
      obstruction: hit?.outerHTML.slice(0, 160),
    };
  });
  if (!(result.inView && result.hit))
    await target
      .page()
      .screenshot({
        path: `${directory}/unreachable-${target.page().viewportSize()?.width}x${target.page().viewportSize()?.height}-${label.replace(/[^a-z0-9]+/gi, "-")}.png`,
      });
  assert.ok(
    result.inView && result.hit,
    `${label}: control cannot be used without scrolling: ${JSON.stringify(result)}`,
  );
  await target.click();
}
async function assertReaderFits(page: Page, label: string) {
  const geometry = await page
    .locator("dialog.h-dialog[open]")
    .evaluate((dialog) => {
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0,
        top = viewport?.offsetTop ?? 0;
      const right = left + (viewport?.width ?? innerWidth),
        bottom = top + (viewport?.height ?? innerHeight);
      const errors: string[] = [];
      const active = dialog.querySelector<HTMLElement>(
        ".h-reader-page:not([hidden])",
      );
      if (!active) return ["There is no visible reader page."];
      for (const element of [
        dialog,
        active,
        ...dialog.querySelectorAll<HTMLElement>(".h-reader-art"),
      ]) {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        if (
          rect.left < left - 1 ||
          rect.top < top - 1 ||
          rect.right > right + 1 ||
          rect.bottom > bottom + 1
        )
          errors.push(
            `${element.className} outside viewport: ${JSON.stringify(rect.toJSON())}`,
          );
        if (
          element.scrollHeight > element.clientHeight + 1 ||
          element.scrollWidth > element.clientWidth + 1
        )
          errors.push(
            `${element.className} scrolls: ${element.scrollWidth}×${element.scrollHeight} > ${element.clientWidth}×${element.clientHeight}`,
          );
      }
      for (const control of dialog.querySelectorAll<HTMLElement>(
        "button,input,select,textarea,a,summary",
      )) {
        const rect = control.getBoundingClientRect();
        if (
          !rect.width ||
          !rect.height ||
          getComputedStyle(control).visibility === "hidden"
        )
          continue;
        if (control.closest(".h-reader-page[hidden]")) continue;
        const first = control.getClientRects()[0] ?? rect;
        const hit = document.elementFromPoint(
          first.left + first.width / 2,
          first.top + first.height / 2,
        );
        if (
          rect.left < left - 1 ||
          rect.top < top - 1 ||
          rect.right > right + 1 ||
          rect.bottom > bottom + 1 ||
          !hit ||
          !(hit === control || control.contains(hit))
        )
          errors.push(
            `Unreachable ${control.tagName} “${control.textContent?.trim().slice(0, 70)}”: ${JSON.stringify(rect.toJSON())}; hit ${hit?.tagName ?? "none"}`,
          );
      }
      // Text fragments must also fit the page; hiding overflow is not pagination.
      const pageBox = active.getBoundingClientRect();
      const walker = document.createTreeWalker(active, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (
          !node.textContent?.trim() ||
          !parent ||
          parent.closest(
            '[hidden], [aria-hidden="true"], .h-face-semantic, .sr-only',
          )
        )
          continue;
        const style = getComputedStyle(parent);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          !parent.getClientRects().length
        )
          continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (
            rect.width &&
            rect.height &&
            (rect.left < pageBox.left - 1 ||
              rect.right > pageBox.right + 1 ||
              rect.top < pageBox.top - 1 ||
              rect.bottom > pageBox.bottom + 1)
          ) {
            errors.push(
              `Clipped text “${node.textContent.trim().slice(0, 80)}”: ${JSON.stringify(rect.toJSON())}`,
            );
            break;
          }
        }
      }
      return errors;
    });
  if (geometry.length)
    await page.screenshot({
      path: `${directory}/failure-${page.viewportSize()?.width}-${label.replace(/[^a-z0-9]+/gi, "-")}.png`,
    });
  assert.deepEqual(geometry, [], `${label}: reader layout failures`);
}
async function revealReaderControl(page: Page, selector: string) {
  const dialog = page.locator("dialog.h-dialog[open]");
  await dialog.locator(".h-reader-page:not([hidden])").waitFor();
  await frames(page);
  const target = dialog.locator(selector);
  const position = dialog.locator(".h-reader-position select");
  const values = await position
    .locator("option")
    .evaluateAll((elements) =>
      elements.map((element) => (element as HTMLOptionElement).value),
    );
  for (const value of values) {
    await position.selectOption(value);
    await frames(page);
    if (await target.isVisible()) {
      await assertReaderFits(page, `find ${selector}`);
      return target;
    }
  }
  assert.fail(`${selector} is unavailable on every reader page`);
}
async function stressFormResize(page: Page, width: number, height: number) {
  const before = await savedBytes(page);
  await targetClick(page.locator('[data-ui="setup"]'), "setup resize exercise");
  const seed = await revealReaderControl(page, "#h-seed");
  await targetClick(seed, "seed input before resize");
  await seed.fill("424242");
  await page.setViewportSize({ width, height: 200 });
  await frames(page);
  await assertReaderFits(page, "setup with 200px visible height");
  assert.equal(await page.locator("#h-seed").inputValue(), "424242");
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "h-seed",
    "reader resize must preserve the focused form field",
  );
  await page.screenshot({ path: `${directory}/${width}x200-setup-focus.png` });
  await page.setViewportSize({ width, height });
  await frames(page);
  assert.equal(await page.locator("#h-seed").inputValue(), "424242");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "h-seed");
  await targetClick(page.locator("dialog .h-close"), "resized setup close");
  assert.equal(
    await savedBytes(page),
    before,
    "reading and editing setup form fields must not mutate an existing game",
  );
}
async function verifyHoldInspection(page: Page) {
  await targetClick(
    page.locator('[data-select="alba-9"]'),
    "select before holding another card",
  );
  await frames(page);
  const before = await savedBytes(page);
  const selectedBefore = await page
    .locator('.h-hand [data-select][aria-pressed="true"]')
    .evaluateAll((elements) =>
      elements.map((element) => (element as HTMLElement).dataset.select),
    );
  const target = page.locator('[data-select="alba-7"]');
  const rect = await target.boundingBox();
  assert.ok(rect);
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  assert.ok(
    await target.evaluate((element, point) => {
      const hit = document.elementFromPoint(point.x, point.y);
      return !!hit && (hit === element || element.contains(hit));
    }, center),
    "held hand card must be directly reachable",
  );
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  // A real sustained pointer press exercises the application's 500ms hold gesture.
  await page.waitForTimeout(560);
  await page.mouse.up();
  await page.locator("dialog.h-dialog[open]").waitFor();
  await frames(page);
  await assertReaderFits(page, "hold inspection");
  assert.equal(
    await savedBytes(page),
    before,
    "holding a card cannot take a game action",
  );
  assert.deepEqual(
    await page
      .locator('.h-hand [data-select][aria-pressed="true"]')
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).dataset.select),
      ),
    selectedBefore,
    "holding a card cannot change the selected packet",
  );
  await targetClick(page.locator("dialog .h-close"), "hold inspection close");
  assert.deepEqual(
    await page
      .locator('.h-hand [data-select][aria-pressed="true"]')
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).dataset.select),
      ),
    selectedBefore,
  );
  await targetClick(
    page.locator('[data-select="alba-9"]'),
    "clear selection after hold probe",
  );
}
async function verifySemanticReader(page: Page) {
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
  );
  await targetClick(page.locator('[data-ui="settings"]'), "semantic settings");
  const quality = await revealReaderControl(page, "#h-quality");
  await quality.selectOption("semantic");
  await targetClick(
    await revealReaderControl(page, '[data-ui="settings-save"]'),
    "apply semantic presentation",
  );
  await frames(page);
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
    ),
    before,
  );
  const table = await page.locator(".h-table.semantic").evaluate((element) => {
    const rect = element.getBoundingClientRect(),
      viewport = window.visualViewport;
    return {
      rect: rect.toJSON(),
      width: viewport?.width ?? innerWidth,
      height: viewport?.height ?? innerHeight,
      scroll: [element.scrollWidth, element.scrollHeight],
      client: [element.clientWidth, element.clientHeight],
      overflow:
        element.scrollHeight > element.clientHeight + 1 ||
        element.scrollWidth > element.clientWidth + 1,
    };
  });
  await page.screenshot({
    path: `${directory}/${page.viewportSize()?.width}x${page.viewportSize()?.height}-semantic-table.png`,
  });
  assert.ok(
    !table.overflow &&
      table.rect.top >= 0 &&
      table.rect.left >= 0 &&
      table.rect.right <= table.width + 1 &&
      table.rect.bottom <= table.height + 1,
    `semantic table does not fit: ${JSON.stringify(table)}`,
  );
  await targetClick(
    page.locator('[data-ui="accessible-table"]'),
    "accessible table reader",
  );
  const all = await visitReader(
    page,
    "semantic-table",
    before.players
      .flatMap((player: { court: string[] }) => player.court)
      .map((id: string) => SOURCE[id].printed.name),
  );
  await targetClick(
    page.locator('[data-ui="focus-0"]'),
    "accessible own court reader",
  );
  const own = await visitReader(
    page,
    "semantic-court",
    before.players[0].court.map((id: string) => SOURCE[id].printed.name),
  );
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("oando-v4-history")!).game,
    ),
    before,
  );
  return [all, own];
}
async function verifyKnowledgeReader(page: Page) {
  let game = createTutorial();
  for (let cursor = 0; cursor < LESSONS.length; cursor++)
    game = applyAction(game, lessonAction(game, cursor)!);
  assert.ok(
    game.result,
    "quiz fixture must be a legally completed teaching game",
  );
  await page.evaluate(
    (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
    {
      version: 4,
      rulesetId: "history-engine-v4",
      contentVersion: CONTENT_VERSION,
      game,
      tutorial: LESSONS.length,
      preferences: defaultPreferences(),
    },
  );
  await page.reload();
  await targetClick(
    page.locator('[data-ui="resume"]'),
    "completed teaching resume",
  );
  const before = await savedBytes(page);
  await targetClick(
    page.locator('[data-ui="knowledge"]'),
    "knowledge predictions",
  );
  for (let index = 0; index < 4; index++) {
    const answer = await revealReaderControl(
      page,
      `[data-knowledge="${index}"]`,
    );
    await answer.selectOption("yes");
    await assertReaderFits(page, `knowledge answer ${index + 1}`);
  }
  await targetClick(
    await revealReaderControl(page, '[data-ui="knowledge-check"]'),
    "check predictions",
  );
  await frames(page);
  await assertReaderFits(page, "knowledge result first page");
  assert.match(
    await page.locator(".h-reader-page:not([hidden])").innerText(),
    /4\/4 correct/,
    "the result must be visible without another page change",
  );
  assert.deepEqual(
    await page
      .locator("[data-knowledge]")
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLSelectElement).value),
      ),
    ["yes", "yes", "yes", "yes"],
    "checking predictions must preserve answers across reader pages",
  );
  assert.equal(
    await savedBytes(page),
    before,
    "answering and checking predictions must be state-neutral",
  );
  return await visitReader(page, "knowledge", ["4/4 correct"]);
}
async function visitReader(page: Page, label: string, expected: string[] = []) {
  const before = await savedBytes(page);
  const dialog = page.locator("dialog.h-dialog[open]");
  await dialog.locator(".h-reader-page:not([hidden])").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await frames(page);
  const selector = dialog.locator(".h-reader-position select");
  const readerSource = await dialog.getAttribute("data-reader-source");
  const texts: string[] = [];
  const options = (await selector.count())
    ? await selector
        .locator("option")
        .evaluateAll((elements) =>
          elements.map((element) => (element as HTMLOptionElement).value),
        )
    : [];
  const count =
    options.length || (await dialog.locator(".h-reader-page").count());
  assert.ok(
    count > 0 && count <= 2000,
    `${label}: invalid page count ${count}`,
  );
  for (let index = 0; index < count; index++) {
    if (options.length) await selector.selectOption(options[index]);
    else if (index)
      await targetClick(
        dialog.locator('[data-reader="next"]'),
        `${label} next page`,
      );
    await frames(page);
    await assertReaderFits(page, `${label} page ${index + 1}`);
    const text = await dialog
      .locator(".h-reader-page:not([hidden])")
      .innerText();
    assert.ok(
      text.trim() ||
        (await dialog
          .locator(
            ".h-reader-page:not([hidden]) canvas,.h-reader-page:not([hidden]) img",
          )
          .count()),
      `${label}: empty page ${index + 1}`,
    );
    texts.push(text);
    assert.equal(
      await savedBytes(page),
      before,
      `${label}: navigating pages changed the saved game`,
    );
    if (index === 0 || index === count - 1)
      await page.screenshot({
        path: `${directory}/${page.viewportSize()?.width}x${page.viewportSize()?.height}-${label}-${index + 1}.png`,
      });
  }
  if (count > 1) {
    await targetClick(
      dialog.locator('[data-reader="previous"]'),
      `${label} previous page`,
    );
    await frames(page);
    await assertReaderFits(page, `${label} previous navigation`);
    assert.equal(
      await dialog.locator(".h-reader-page:not([hidden])").innerText(),
      texts[count - 2],
    );
    await targetClick(
      dialog.locator('[data-reader="next"]'),
      `${label} next page`,
    );
    await frames(page);
    assert.equal(
      await dialog.locator(".h-reader-page:not([hidden])").innerText(),
      texts[count - 1],
    );
  }
  if (readerSource) {
    // textContent joins adjacent option labels without spaces, while innerText
    // inserts line breaks. Compare all non-whitespace characters, in order.
    const original = readerSource
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/\s+/g, "");
    const shown = texts
      .join("\n")
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/\s+/g, "");
    let mismatch = 0;
    while (mismatch < original.length && original[mismatch] === shown[mismatch])
      mismatch++;
    assert.equal(
      shown,
      original,
      `${label}: page content differs from source at character ${mismatch}; source “${original.slice(Math.max(0, mismatch - 25), mismatch + 60)}”, shown “${shown.slice(Math.max(0, mismatch - 25), mismatch + 60)}”`,
    );
  }
  for (const source of expected)
    assertWordsPreserved(source, texts.join("\n"), label);
  await targetClick(dialog.locator(".h-close"), `${label} close`);
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert.equal(
    await savedBytes(page),
    before,
    `${label}: closing changed the saved game`,
  );
  return {
    label,
    pages: count,
    visibleWords: words(texts.join("\n")).length,
    sourceChecks: expected.length + Number(!!readerSource),
    stateNeutral: true,
  };
}
try {
  for (const [width, height] of viewports) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await page.routeWebSocket("**/*", (socket) => socket.close());
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    const readers = [];
    await targetClick(page.locator('[data-ui="rules"]'), "title Rules");
    readers.push(
      await visitReader(page, "rules", [
        "claim the Crown, pass it to your chosen heir, then keep that new Ruler in your Bloodline for the time on your Law",
        "Hands and Courts have no size limit. When the Noble deck is empty, stop drawing.",
      ]),
    );
    await targetClick(page.locator('[data-ui="archive"]'), "title archive");
    readers.push(await visitReader(page, "archive"));
    for (const id of ["alba-1", "law-alba", "A3"]) {
      await targetClick(page.locator('[data-ui="archive"]'), `archive ${id}`);
      await page.locator("#h-archive-card").selectOption(id);
      readers.push(
        await visitReader(page, `archive-${id}`, [MANIFEST[id].canonicalText]),
      );
    }
    await targetClick(page.locator('[data-ui="setup"]'), "title setup");
    readers.push(await visitReader(page, "setup"));
    if (width === 667) await stressFormResize(page, width, height);
    const game = createPreparedTutorial();
    await page.evaluate(
      (save) => localStorage.setItem("oando-v4-history", JSON.stringify(save)),
      {
        version: 4,
        rulesetId: "history-engine-v4",
        contentVersion: CONTENT_VERSION,
        game,
        tutorial: null,
        preferences: defaultPreferences(),
      },
    );
    await page.reload();
    await targetClick(page.locator('[data-ui="resume"]'), "solo resume");
    await targetClick(page.locator('[data-ui="settings"]'), "settings");
    readers.push(await visitReader(page, "settings"));
    await verifyHoldInspection(page);
    await targetClick(
      page.locator('[data-inspect="alba-7"]'),
      "actual hand inspection",
    );
    readers.push(
      await visitReader(page, "inspect", [
        MANIFEST["alba-7"].canonicalText,
        SOURCE["alba-7"].historicalNote,
      ]),
    );
    await targetClick(
      page.locator('[data-inspect="alba-7"]'),
      "hand inspection terms",
    );
    await targetClick(
      await revealReaderControl(page, '[data-card-terms="alba-7"]'),
      "optional card terms",
    );
    readers.push(await visitReader(page, "terms"));
    await targetClick(
      page.locator('[data-inspect="law-alba"]'),
      "actual Law inspection",
    );
    readers.push(
      await visitReader(page, "law", [MANIFEST["law-alba"].canonicalText]),
    );
    await targetClick(page.locator('[data-ui="registers"]'), "table record");
    readers.push(
      await visitReader(
        page,
        "record",
        game.events
          .filter((event) => event.visibility === "public")
          .map((event) => event.text),
      ),
    );
    await targetClick(
      page.locator('[data-ui="deadlines"]'),
      "actual round deadlines",
    );
    readers.push(await visitReader(page, "deadlines"));
    await targetClick(
      page.locator('[data-ui="rules"]'),
      "Rules for current choices",
    );
    await targetClick(
      await revealReaderControl(page, '[data-ui="actions-guide"]'),
      "current available choices",
    );
    readers.push(await visitReader(page, "available-actions"));
    if (width === 667) readers.push(...(await verifySemanticReader(page)));
    const beforeEscape = await savedBytes(page);
    await targetClick(page.locator('[data-ui="rules"]'), "game Rules");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog[open]").count(), 0);
    assert.equal(await savedBytes(page), beforeEscape);
    readers.push(await verifyKnowledgeReader(page));
    assert.deepEqual(errors, []);
    reports.push({
      width,
      height,
      readers,
      escapeStateNeutral: true,
      holdPreservesGameAndPacket: true,
      ...(width === 667 ? { formAt200pxPreservesValueAndFocus: true } : {}),
      errors,
    });
    writeFileSync(reportPath, JSON.stringify(reports, null, 2));
    await page.close();
  }
  console.log(
    `History reading: ${reports.length} viewports, every reader page fitted, source text preserved, controls reachable, close and Escape state-neutral.`,
  );
} finally {
  await browser.close();
}
