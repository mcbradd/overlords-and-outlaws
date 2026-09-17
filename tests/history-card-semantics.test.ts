import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SOURCES,
  NOBLES,
  MANIFEST,
  INTERREGNA,
  LAW_CARDS,
  FRAGMENTS,
} from "../src/history-engine/content";
import {
  compileCard,
  canonicalText,
  CardTextError,
  LANGUAGE_VERSION,
} from "../src/history-engine/compiler";

test("every physical card has executable source and compiles deterministically", () => {
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
    assert.ok(source.cardText.length > 0, source.id);
    const first = compileCard(source);
    assert.equal(first.languageVersion, LANGUAGE_VERSION);
    assert.deepEqual(compileCard(source), first);
    assert.equal(first.canonicalText, source.cardText);
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
    const first = compileCard(source),
      stripped = compileCard({ ...source, reminderRefs: [] });
    assert.deepEqual(first.ast, stripped.ast);
    assert.equal(first.sourceHash, stripped.sourceHash);
  }
});
test("Law clauses parse independent numbers and named relationships rather than a paragraph alias", () => {
  const original = LAW_CARDS[0];
  const changed = compileCard({
    ...original,
    cardText: original.cardText
      .replace("Have 3 Court Nobles", "Have 4 Court Nobles")
      .replace("At the start of the next round:", "At the start of the second round after this one:")
      .replace("for 1 full round.", "for 2 full rounds."),
  });
  assert.deepEqual(changed.ast.law, {
    entryNatives: 4,
    heir: { count: 2, zone: "court", native: true, differentBranches: true },
    keep: "any-heir",
    successionAfter: 2,
    reignRounds: 2,
    witness: null,
  });
  assert.equal(changed.ast.route, "kindreds");
  const fewer = compileCard({
    ...original,
    cardText: original.cardText.replace(
      "Choose 2 other Court Nobles of your Dynasty from different branches as heirs.",
      "Choose 1 other Court Noble of your Dynasty from different branches as heir.",
    ),
  });
  assert.equal(fewer.ast.law?.heir.count, 1);
  assert.equal(MANIFEST["law-plantagenet"].ast.law?.witness, "native");
  assert.equal(MANIFEST["law-tudor"].ast.law?.heir.zone, "hand");
  assert.equal(MANIFEST["law-habsburg"].ast.law?.keep, "heir-marriage");
});
test("Noble action clauses determine capabilities; a name does not grant a power", () => {
  const queen = NOBLES.find((s) => s.printed.queen)!;
  const first = compileCard(queen);
  assert.ok(first.ast.abilities?.includes("build"));
  assert.ok(first.ast.abilities?.includes("marry"));
  const stripped = compileCard({
    ...queen,
    cardText: queen.cardText
      .replace("Recruit: Move from hand to Court if this Noble matches your Dynasty.\n", "")
      .replace(/\nMarry:.*$/, ""),
  });
  assert.ok(!stripped.ast.abilities?.includes("build"));
  assert.ok(!stripped.ast.abilities?.includes("marry"));
  assert.ok(stripped.ast.abilities?.includes("counterclaim"));
  assert.deepEqual(
    compileCard({
      ...queen,
      id: "independent-queen",
      printed: { ...queen.printed, name: "Different historical label" },
    }).ast,
    first.ast,
  );
});
test("Crisis counts, lifetime and painting goal come from printed digits", () => {
  const a2 = INTERREGNA.find((s) => s.id === "A2")!;
  const changed = compileCard({
    ...a2,
    cardText: a2.cardText
      .replace("with 2 different", "with 3 different")
      .replace("after 1 more round.", "after 2 more rounds."),
  });
  assert.equal(changed.ast.requiredContributions, 3);
  assert.equal(changed.ast.expiryAfter, 2);
  const fragment = FRAGMENTS[0];
  assert.equal(
    compileCard({
      ...fragment,
      cardText: fragment.cardText.replace("If 6 fragments", "If 5 fragments"),
    }).ast.fragmentGoal,
    5,
  );
  assert.throws(
    () =>
      compileCard({
        ...fragment,
        cardText: fragment.cardText.replace("slot 1", "slot 2"),
      }),
    CardTextError,
  );
  assert.throws(
    () =>
      compileCard({
        ...fragment,
        cardText: fragment.cardText.replace("If 6 fragments", "If 7 fragments"),
      }),
    CardTextError,
  );
});
test("unknown, ambiguous, missing and conflicting clauses fail closed", () => {
  const s = INTERREGNA[0];
  for (const text of [
    "Discard an Overlord",
    "Return one Noble from The Past",
    "Change its printed Dynasty",
    "Gain 3 health",
    "Retire one from any bloodline",
    "When this activates, activate this again",
    s.cardText.replace("1 hand Noble", "several hand Nobles"),
    s.cardText.replace("Starts at round end unless prevented.\n", ""),
    s.cardText.replace(
      "Ends at round end, after 1 more round.",
      "Ends at round end, after 0 more rounds.",
    ),
  ])
    assert.throws(() => compileCard({ ...s, cardText: text }), CardTextError);
  assert.throws(
    () => compileCard({ ...s, reminderRefs: ["hidden-extra-power"] }),
    CardTextError,
  );
  assert.throws(
    () => compileCard({ ...NOBLES[0], cardText: "" }),
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
  const law = LAW_CARDS[2];
  assert.throws(
    () =>
      compileCard({
        ...law,
        cardText: law.cardText.replace("Reveal your heir. ", ""),
      }),
    CardTextError,
  );
  const a2 = INTERREGNA.find((c) => c.id === "A2")!;
  assert.throws(
    () =>
      compileCard({
        ...a2,
        cardText: a2.cardText.replace(
          "Ends at round end, after 1 more round.",
          "At round start: Reveal 1 extra History card.\nEnds at round end, after 1 more round.",
        ),
      }),
    CardTextError,
  );
  assert.notDeepEqual(
    compileCard({
      ...s,
      cardText: s.cardText.replace(
        "No player may Claim the Crown.",
        "No player may Marry.",
      ),
    }).ast,
    compileCard(s).ast,
  );
});
test("syntax errors identify the exact printed line", () => {
  const s = INTERREGNA[0],
    lines = s.cardText.split("\n");
  lines[2] = "While active: Everybody does something.";
  try {
    compileCard({ ...s, cardText: lines.join("\n") }, "cards/A1.card");
    assert.fail("Expected rejection");
  } catch (error) {
    assert.ok(error instanceof CardTextError);
    const d = error.diagnostics.find((d) => d.code === "CT001")!;
    assert.equal(d.filename, "cards/A1.card");
    assert.equal(d.line, 3);
    assert.equal(d.column, 1);
    assert.ok(d.suggestion.length);
  }
});
test("Crisis combinations reject endings the runtime cannot perform", () => {
  const war = INTERREGNA.find((c) => c.id === "H2")!;
  assert.throws(
    () =>
      compileCard({
        ...war,
        cardText: war.cardText.replace(
          /^End early: Together, Challenge[^\n]+/m,
          "End early: Complete the Prevent condition.",
        ),
      }),
    CardTextError,
  );
  const instant = INTERREGNA.find((c) => c.id === "A3")!;
  assert.throws(
    () =>
      compileCard({
        ...instant,
        cardText: instant.cardText.replace(
          "Then end this event.",
          "End early: Complete the Prevent condition.\nEarlier help still counts.\nThen end this event.",
        ),
      }),
    CardTextError,
  );
  const supportedActive = instant.cardText.replace(
    "Then end this event.",
    "End early: Complete the Prevent condition.\nEarlier help still counts.\nEnds at round end, after 1 more round.",
  );
  assert.equal(
    compileCard({ ...instant, cardText: supportedActive }).ast.end,
    "condition",
  );
  assert.throws(
    () =>
      compileCard({
        ...instant,
        cardText: supportedActive.replace(
          "Starts at round end unless prevented.",
          "Starts at round end unless prevented.\nWhile active: No player may Marry.",
        ),
      }),
    CardTextError,
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
