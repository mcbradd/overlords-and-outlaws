import { test } from "node:test";
import assert from "node:assert/strict";
import { createDemo, createDenseFixture } from "../src/history-engine/fixtures";
import { crownReadiness } from "../src/history-engine/learning";
import { actionAvailabilityPages } from "../src/history-engine/reading";
import { legalActions } from "../src/history-engine/rules";
import { nameOf } from "../src/history-engine/content";
import { viewForSeat, viewForSpectator } from "../src/history-engine/view";
import type { DeadlinePage } from "../src/history-engine/reading";

function actionText(pages: DeadlinePage[], type: string): string {
  return pages
    .filter((page) => page.id.startsWith(`availability-${type}-`))
    .flatMap((page) => page.body)
    .join(" ");
}

test("three Alba natives do not imply readiness when the two heirs share a branch", () => {
  const state = createDemo();
  const view = viewForSeat(state, 0);
  const text = crownReadiness(view, 0);
  assert.match(text, /3\/3 native Court Nobles/);
  assert.match(text, /Need two heirs from different printed branches/);
  assert.ok(text.includes(nameOf("alba-1")));
  assert.ok(text.includes(nameOf("alba-3")));
  assert.doesNotMatch(text, /You can claim under this Law now/);
  assert.match(text, /Regency is available now/);
  assert.equal(
    legalActions(view, 0).some(
      (action) => action.type === "proclaim" && action.route === "kindreds",
    ),
    false,
  );
});

test("a real second Alba branch produces a legal named example without changing state", () => {
  const state = createDemo();
  state.players[0].hand = state.players[0].hand.filter((id) => id !== "alba-7");
  state.players[0].court.push("alba-7");
  const before = structuredClone(state);
  const view = viewForSeat(state, 0);
  const text = crownReadiness(view, 0);
  assert.match(text, /You can claim under this Law now for 1 seal/);
  assert.ok(text.includes(nameOf("alba-7")));
  assert.equal(
    legalActions(view, 0).some(
      (action) => action.type === "proclaim" && action.route === "kindreds",
    ),
    true,
  );
  assert.deepEqual(state, before);
});

test("Charter readiness distinguishes the heir from a separate native Witness", () => {
  const state = createDenseFixture();
  state.crown = null;
  state.active = 1;
  const removed = state.players[1].court.splice(2);
  state.players[1].hand.push(...removed);
  const text = crownReadiness(viewForSeat(state, 1), 1);
  assert.match(text, /native heir and a different native Witness/);
  assert.doesNotMatch(text, /You can claim under this Law now/);
});

test("Habsburg requires the supporting Queen to be someone other than the departing Ruler", () => {
  const state = createDenseFixture();
  state.crown = null;
  state.active = 3;
  const eligible = crownReadiness(viewForSeat(state, 3), 3);
  assert.match(eligible, /You can claim under this Law now/);
  assert.ok(eligible.includes(nameOf("tudor-5")));
  state.players[3].ruler = "habsburg-1";
  const blocked = crownReadiness(viewForSeat(state, 3), 3);
  assert.match(
    blocked,
    /Need a foreign Court heir married to a native Queen other than the Ruler/,
  );
  assert.match(blocked, /is Ruler and cannot sponsor this succession/);
  assert.doesNotMatch(blocked, /You can claim under this Law now/);
});

test("Tudor hand readiness is private and an already sealed heir is never named", () => {
  const state = createDenseFixture();
  state.crown = null;
  state.active = 2;
  const hand = [...state.players[2].hand];
  const own = crownReadiness(viewForSeat(state, 2), 2);
  assert.match(own, /Choose one hand heir/);
  const publicText = crownReadiness(viewForSpectator(state), 2);
  assert.match(publicText, /private hand is not visible/);
  for (const id of hand) assert.ok(!publicText.includes(nameOf(id)));
  const heir = state.players[2].hand.pop()!;
  state.crown = {
    seat: 2,
    route: "act",
    stage: "proclaimed",
    round: state.round,
    oldRuler: state.players[2].ruler!,
    heirs: [heir],
    witness: null,
    sealed: heir,
    successor: null,
    reignRound: null,
  };
  const held = crownReadiness(viewForSeat(state, 2), 2);
  assert.match(held, /Your Crown claim is underway/);
  assert.ok(!held.includes(nameOf(heir)));
  assert.match(
    crownReadiness(viewForSeat(state, 0), 0),
    /you cannot start another claim/,
  );
});

test("no-seal action pages distinguish paid actions from still-legal Pass", () => {
  const state = createDemo();
  state.players[0].seals = 0;
  const view = viewForSeat(state, 0);
  const pages = actionAvailabilityPages(view, 0);
  assert.match(actionText(pages, "build"), /Unavailable now. No seals remain/);
  assert.match(actionText(pages, "pass"), /Available now/);
  assert.match(
    actionText(pages, "counterclaim"),
    /response to a rival's Recall/,
  );
  for (const page of pages)
    assert.ok(
      `${page.title} ${page.body.join(" ")}`.trim().split(/\s+/).length <= 75,
    );
});

test("availability identifies exhausted Recall targets and an existing Cover", () => {
  const state = createDemo();
  state.petitioned = [...state.players[1].court];
  state.fragments[0].veil = { seat: 0, until: 4 };
  state.fragments[0].onceVeiled = true;
  const pages = actionAvailabilityPages(viewForSeat(state, 0), 0);
  assert.match(
    actionText(pages, "claim"),
    /Every rival Court Noble has already been targeted/,
  );
  assert.match(
    actionText(pages, "veil"),
    /Cover in progress until the start of round 4/,
  );
});

test("Draw distinguishes a nonempty deck blocked by Closed Roads from an empty deck", () => {
  const state = createDenseFixture();
  state.dynastyDeck.push(state.players[1].hand.pop()!);
  const pages = actionAvailabilityPages(viewForSeat(state, 0), 0);
  assert.match(
    actionText(pages, "petition"),
    /Closed Roads requires an empty hand/,
  );
  state.players[1].hand.push(state.dynastyDeck.pop()!);
  assert.match(
    actionText(actionAvailabilityPages(viewForSeat(state, 0), 0), "petition"),
    /Dynasty Deck is empty/,
  );
});

test("private action reader never infers hidden hands or presents ordinary actions during a response", () => {
  const state = createDemo();
  assert.match(
    actionAvailabilityPages(viewForSpectator(state), 0)[0].body.join(" "),
    /Open your own player view/,
  );
  state.phase = "response";
  state.claim = { seat: 1, defender: 0, target: "alba-0", source: "alba-2" };
  state.players[0].seals = 0;
  const pages = actionAvailabilityPages(viewForSeat(state, 0), 0);
  assert.match(pages[0].body.join(" "), /no seal left to Block/);
  assert.ok(pages.every((page) => !page.id.startsWith("availability-build")));
});
