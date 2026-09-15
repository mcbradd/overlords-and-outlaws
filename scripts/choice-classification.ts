export type ChoiceKind =
  | "trivial"
  | "unavoidableLoss"
  | "forced"
  | "dominant"
  | "tradeoffs";
// Compare actual victory sets; changing the identity of the winner while still losing
// never makes a choice interesting in this audit. No heuristic value-gap threshold.
export function classifyChoices(outcomes: number[][]): {
  kind: ChoiceKind;
  frontier: number[];
} {
  if (outcomes.length < 2) return { kind: "trivial", frontier: [] };
  const viable = outcomes
    .map((wins, i) => ({ wins, i }))
    .filter((x) => x.wins.some(Boolean));
  if (!viable.length) return { kind: "unavoidableLoss", frontier: [] };
  if (viable.length === 1) return { kind: "forced", frontier: [viable[0].i] };
  const frontier = viable.filter(
    (a) =>
      !viable.some(
        (b) =>
          b.wins.every((v, i) => v >= a.wins[i]) &&
          b.wins.some((v, i) => v > a.wins[i]),
      ),
  );
  const distinct = [
    ...new Map(frontier.map((x) => [x.wins.join(","), x.i])).values(),
  ];
  return {
    kind:
      distinct.length > 1
        ? "tradeoffs"
        : frontier.length > 1
          ? "trivial"
          : "dominant",
    frontier: distinct,
  };
}
