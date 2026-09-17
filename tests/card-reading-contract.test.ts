import { test } from "node:test";
import assert from "node:assert/strict";
import { SOURCES, LAW_CARDS, MANIFEST } from "../src/history-engine/content";

test("every reference card contains operative instructions, not only a role label", () => {
  assert.deepEqual(
    SOURCES.filter((c) => !c.cardText.trim()).map((c) => c.id),
    [],
  );
});

test("Law entry, succession and winning duration are compiled from printed clauses", () => {
  for (const source of LAW_CARDS) {
    const compiled = MANIFEST[source.id].ast as unknown as {
      law?: {
        entryNatives: number;
        successionAfter: number;
        reignRounds: number;
      };
    };
    assert.ok(
      compiled.law,
      `${source.id} must contain a parsed Law, not only a route label`,
    );
    assert.equal(compiled.law.entryNatives, 3);
    assert.equal(compiled.law.successionAfter, 1);
    assert.equal(compiled.law.reignRounds, 1);
  }
});
