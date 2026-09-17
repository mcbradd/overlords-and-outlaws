import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SOURCES,
  NOBLES,
  MANIFEST,
  INTERREGNA,
} from "../src/history-engine/content";
import {
  compileCard,
  canonicalText,
  CardTextError,
} from "../src/history-engine/compiler";
test("exact manifest, independent Laws and twelve semantic payloads compile deterministically", () => {
  assert.equal(NOBLES.length, 52);
  assert.equal(SOURCES.length, 92);
  for (const d of ["alba", "plantagenet", "tudor", "habsburg"]) {
    const cards = NOBLES.filter((c) => c.printed.dynasty === d);
    assert.equal(cards.length, 13);
    assert.equal(cards.filter((c) => c.printed.founder).length, 1);
  }
  assert.deepEqual(
    [
      "A1",
      "A2",
      "A3",
      "P1",
      "P2",
      "P3",
      "T1",
      "T2",
      "T3",
      "H1",
      "H2",
      "H3",
    ].map((id) => MANIFEST[id].ast.condition),
    [
      "seats-native",
      "attack",
      "restore-marriage",
      "seats-rotate",
      "attack",
      "dynasties",
      "seats-any",
      "attack",
      "barter-or-veil",
      "married-seats",
      "attack",
      "dynasties",
    ],
  );
  assert.deepEqual(MANIFEST.H2.ast.restrictions, ["succession"]);
  assert.equal(MANIFEST.H2.ast.end, "attack");
  assert.equal(MANIFEST.A2.ast.end, undefined);
  for (const source of SOURCES) {
    const first = compileCard(source);
    assert.deepEqual(compileCard(source), first);
    assert.deepEqual(
      compileCard({
        ...source,
        cardText: canonicalText(first.ast, source.kind),
      }).ast,
      first.ast,
    );
  }
});
test("reminder invariance: removing every reminder preserves operative hashes and AST", () => {
  for (const source of SOURCES) {
    const first = compileCard(source);
    const stripped = compileCard({ ...source, reminderRefs: [] });
    assert.deepEqual(first.ast, stripped.ast);
    assert.equal(first.sourceHash, stripped.sourceHash);
  }
});
test("mutating timing, quantity, source zone, Dynasty or recovery rejects or changes semantics", () => {
  const s = INTERREGNA[0];
  for (const text of [
    "Discard an Overlord",
    "Return one Noble from The Past",
    "Change its printed Dynasty",
    "Gain 3 health",
    "Retire one from any bloodline",
    "When this activates, activate this again",
  ])
    assert.throws(() => compileCard({ ...s, cardText: text }), CardTextError);
  assert.throws(
    () =>
      compileCard({
        ...s,
        cardText: s.cardText.replace("one native Outlaw", "two native Outlaws"),
      }),
    CardTextError,
  );
  assert.throws(
    () => compileCard({ ...s, reminderRefs: ["hidden-extra-power"] }),
    CardTextError,
  );
  assert.throws(
    () =>
      compileCard({
        ...NOBLES[0],
        printed: { ...NOBLES[0].printed, branch: undefined },
      }),
    CardTextError,
  );
  assert.notDeepEqual(
    compileCard({
      ...s,
      cardText: s.cardText.replace(
        "No player may Proclaim.",
        "No player may Marry.",
      ),
    }).ast,
    compileCard(s).ast,
  );
});
test("ambiguous source Blood Edict is quarantined", () => {
  assert.throws(
    () =>
      compileCard({
        ...INTERREGNA[0],
        id: "source-blood-edict",
        cardText:
          "Each player removes one Royal from any bloodline sharing a Dynasty. Promote to Rank III.",
      }),
    CardTextError,
  );
  assert.equal(
    SOURCES.some((c) => c.id === "source-blood-edict"),
    false,
  );
});
