import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyChoices } from "../scripts/choice-classification";
test("the audit never calls two losing paths or a dominated path interesting", () => {
  assert.equal(
    classifyChoices([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]).kind,
    "unavoidableLoss",
  );
  assert.equal(
    classifyChoices([
      [1, 1, 0, 0],
      [1, 0, 0, 0],
    ]).kind,
    "dominant",
  );
  assert.equal(
    classifyChoices([
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ]).kind,
    "forced",
  );
  assert.equal(
    classifyChoices([
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ]).kind,
    "trivial",
  );
});
test("the audit finds an alternate winning route beyond equivalent top choices", () => {
  const result = classifyChoices([
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ]);
  assert.equal(result.kind, "tradeoffs");
  assert.equal(result.frontier.length, 2);
});
