import { test } from "node:test";
import assert from "node:assert/strict";
import { createDemo, createDenseFixture } from "../src/history-engine/fixtures";
import { deadlinePages } from "../src/history-engine/reading";
import {
  publicRoundEndDeadlines,
  passConsequences,
} from "../src/history-engine/deadlines";
import { nameOf } from "../src/history-engine/content";
import { previewAction } from "../src/history-engine/preview";
import { viewForSeat, viewForSpectator } from "../src/history-engine/view";

test("lookahead is available before final Pass, without claiming that reading ends the round", () => {
  const state = createDemo();
  const before = structuredClone(state);
  const view = viewForSeat(state, 0);
  assert.equal(passConsequences(view).endsRound, false);
  const pages = deadlinePages(view);
  assert.match(
    pages[0].body.join(" "),
    /Reading this schedule does not end the round/,
  );
  assert.ok(pages.some((page) => page.body.join(" ").includes(nameOf("P2"))));
  assert.deepEqual(state, before);
});

test("dense reader preserves all public consequences in order and bounds every logical page", () => {
  const state = createDenseFixture();
  const view = viewForSpectator(state);
  const pages = deadlinePages(view);
  assert.equal(new Set(pages.map((page) => page.id)).size, pages.length);
  for (const page of pages)
    assert.ok(
      `${page.title} ${page.body.join(" ")}`.trim().split(/\s+/).length <= 75,
      page.id,
    );
  const combined = pages.flatMap((page) => page.body).join(" ");
  let previous = -1;
  for (const deadline of publicRoundEndDeadlines(view)) {
    const offset = combined.indexOf(deadline.text.replace(/\s+/g, " "));
    assert.ok(offset > previous, deadline.text);
    previous = offset;
  }
  const start = pages.findIndex((page) => page.id.startsWith("start-order-"));
  assert.ok(start > pages.findIndex((page) => page.id.startsWith("end-")));
  assert.ok(
    pages.slice(start + 1).some((page) => page.title === "Then: succession"),
  );
});

test("Crown and next-round order remain distinct in the reader", () => {
  const pages = deadlinePages(viewForSpectator(createDenseFixture()));
  const crown = pages.find((page) => page.id.startsWith("crown-continuity-"))!;
  assert.match(crown.body.join(" "), /Both heir .* and the same Witness/);
  const order = pages
    .find((page) => page.id.startsWith("start-order-"))!
    .body.join(" ");
  assert.ok(order.indexOf("Uncover") < order.indexOf("refreshing seals"));
  assert.ok(
    order.indexOf("perform scheduled succession") <
      order.indexOf("resolve recurring Crises"),
  );
  assert.ok(
    order.indexOf("resolve recurring Crises") < order.indexOf("reveal History"),
  );
});

test("compact Alba claim names alternatives and preserves succession timing without false all-heir warning", () => {
  const state = createDemo();
  state.players[0].hand = state.players[0].hand.filter((id) => id !== "alba-7");
  state.players[0].court.push("alba-7");
  const preview = previewAction(viewForSeat(state, 0), {
    type: "proclaim",
    seat: 0,
    revision: state.revision,
    route: "kindreds",
    heirs: ["alba-1", "alba-7"],
  });
  assert.equal(preview.legal, true);
  assert.ok(
    preview.effect.includes(`${nameOf("alba-1")} or ${nameOf("alba-7")}`),
  );
  assert.match(preview.effect, /start of round 3/);
  assert.match(preview.warning, /either heir/);
  assert.doesNotMatch(preview.warning, /Lose a required person/);
  assert.ok(`${preview.effect} ${preview.warning}`.split(/\s+/).length <= 50);
});

test("long public result explanations paginate without dropping content or exceeding the word budget", () => {
  const state = createDemo();
  const reason = Array.from(
    { length: 140 },
    (_, index) => `public-${index}`,
  ).join(" ");
  state.phase = "terminal";
  state.result = { winner: "eudoxia", reason };
  const pages = deadlinePages(viewForSpectator(state));
  assert.ok(pages.length > 1);
  for (const page of pages)
    assert.ok(
      `${page.title} ${page.body.join(" ")}`.trim().split(/\s+/).length <= 75,
    );
  assert.ok(
    pages
      .flatMap((page) => page.body)
      .join(" ")
      .includes(reason),
  );
});
