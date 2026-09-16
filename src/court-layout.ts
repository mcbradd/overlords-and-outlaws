/** Rows are a presentation choice, never a limit on court membership. */
export function courtPosition(
  count: number,
  index: number,
  columns: number,
  step: number,
) {
  const row = Math.floor(index / columns);
  const inRow = Math.min(columns, count - row * columns);
  return { x: ((index % columns) - (inRow - 1) / 2) * step, z: row * 4.2 };
}
