import { test } from "node:test";
import assert from "node:assert/strict";
import { createTutorial, LESSONS, lessonAction } from "../src/history-engine/tutorial";
import { applyAction } from "../src/history-engine/engine";
import { legalActions } from "../src/history-engine/rules";
import { viewForSeat } from "../src/history-engine/view";
import { previewAction } from "../src/history-engine/preview";
import { requiredTeachingCards, selectedTeachingAction, describeOutcome, learningGoal } from "../src/history-engine/learning";
import { nameOf } from "../src/history-engine/content";

function atLesson(index: number) {
  let state = createTutorial();
  for (let i = 0; i < index; i++) state = applyAction(state, lessonAction(state, i)!);
  return state;
}

test("the Crown goal identifies public targets without naming a hidden heir", () => {
  const state = atLesson(39);
  const view = viewForSeat(state, 1);
  const goal = learningGoal(view);
  assert.ok(goal.includes(nameOf(state.players[0].ruler!)));
  assert.ok(goal.includes(nameOf(state.crown!.heirs[0])));
  state.crown!.route = "act";
  state.crown!.sealed = "tudor-8";
  state.crown!.heirs = ["tudor-8"];
  const hidden = learningGoal(viewForSeat(state, 1));
  assert.ok(!hidden.includes(nameOf("tudor-8")));
});

test("Crown choices distinguish the two-round Regency from the faster family Law", () => {
  const state = atLesson(38);
  const view = viewForSeat(state, 0);
  const claims = legalActions(view, 0).filter(action => action.type === "proclaim");
  const slow = claims.find(action => action.route === "regency")!;
  const fast = claims.find(action => action.route === "kindreds")!;
  assert.ok(slow && fast);
  assert.match(previewAction(view, slow).title, /Regency/);
  assert.notEqual(previewAction(view, slow).title, previewAction(view, fast).title);
  assert.match(previewAction(view, slow).effect, /2 full rounds/);
  assert.match(previewAction(view, fast).effect, /1 full round\b/);
});

test("a proposed trade states its cost and the actual visible offer when inspection opens", () => {
  const state = atLesson(19);
  const view = viewForSeat(state, 0);
  const preview = previewAction(view, lessonAction(state, 19)!);
  assert.match(preview.effect, /Richard I/);
  assert.match(preview.effect, /swap|exchange/i);
  assert.match(preview.warning + preview.effect, /1 seal/);
});

test("the published teaching sequence remains a continuous legal game", () => {
  const state = atLesson(LESSONS.length);
  assert.equal(state.result?.winner, 0);
});

test("the first failed claim has no available Block, while the second demonstrates a saved defense", () => {
  const rushed = atLesson(40);
  assert.equal(rushed.players[0].seals, 0);
  assert.equal(legalActions(viewForSeat(rushed, 0), 0).some(a => a.type === "counterclaim"), false);
  const defended = atLesson(51);
  assert.equal(defended.players[0].seals, 1);
  const alternatives = legalActions(viewForSeat(defended, 0), 0).filter(a => a.type === "counterclaim");
  assert.ok(alternatives.length > 1, "the player can choose a matching card to lend");
  for (const alternative of alternatives) {
    let state = applyAction(defended, alternative);
    for (let i = 52; i < LESSONS.length; i++) state = applyAction(state, lessonAction(state, i)!);
    assert.equal(state.result?.winner, 0, "every offered Block choice preserves a legal tutorial continuation");
  }
});

test("the new Cover addresses five visible pieces and prevents the sixth-piece loss", () => {
  const state = atLesson(46);
  assert.equal(state.fragments.filter(f => f.dynasty === "alba" && !f.veil).length, 5);
  assert.equal(state.players[0].seals, 3);
  assert.equal(state.crown, null);
});

test("teaching requires the selected cards and accepts a real alternate Block", () => {
  const state = createTutorial();
  const view = viewForSeat(state, 0);
  const action = lessonAction(state, 0)!;
  assert.equal(selectedTeachingAction(view, action, []), null);
  assert.equal(selectedTeachingAction(view, action, ["alba-0"]), null);
  assert.deepEqual(selectedTeachingAction(view, action, requiredTeachingCards(view, action))?.cards, action.cards);
  const blockState = atLesson(51), blockView = viewForSeat(blockState, 0);
  const chosen = selectedTeachingAction(blockView, lessonAction(blockState, 51)!, ["alba-6"]);
  assert.equal(chosen?.card, "alba-6");
  assert.ok(applyAction(blockState, chosen!).crown);
});

test("outcomes include the actual changes and do not expose an uninspected rival offer", () => {
  const state = atLesson(16);
  const action = lessonAction(state, 16)!;
  const after = applyAction(state, action);
  const result = describeOutcome(viewForSeat(state, 0), viewForSeat(after, 0), action).join(" ");
  assert.doesNotMatch(result, /Richard I/);
  assert.match(result, /face down/);
  const beforeRound = atLesson(29), pass = lessonAction(beforeRound, 29)!;
  const newRound = applyAction(beforeRound, pass);
  assert.match(describeOutcome(viewForSeat(beforeRound, 0), viewForSeat(newRound, 0), pass).join(" "), /Round 2 starts.*3 seals|3 seals.*Round 2 starts/);
});
