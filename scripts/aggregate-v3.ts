import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
const offsets = [0, 50, 100, 150];
const shards = offsets.map((offset) =>
  JSON.parse(
    readFileSync(`artifacts/v3/audit-v3-release-${offset}.json`, "utf8"),
  ),
);
if (shards.some((s) => s.games !== 50))
  throw Error("Each disjoint shard must contain 50 games");
const merged: Record<string, any> = {
  seedRange: [20000, 20199],
  shardOffsets: offsets,
  method: shards[0].method,
};
for (const key of [
  "games",
  "rounds",
  "decisions",
  "forced",
  "dominant",
  "tradeoffs",
  "trivial",
  "unavoidableLoss",
  "responses",
  "responseChoices",
])
  merged[key] = shards.reduce((n, s) => n + s[key], 0);
for (const key of [
  "wins",
  "seatWins",
  "actions",
  "histogram",
  "responseAudit",
]) {
  merged[key] = {};
  for (const s of shards)
    for (const [name, n] of Object.entries(s[key]))
      merged[key][name] = (merged[key][name] ?? 0) + Number(n);
}
merged.examples = shards.flatMap((s) => s.examples);
merged.averageRounds = merged.rounds / merged.games;
merged.auditedOpportunities = merged.decisions + merged.responseAudit.decisions;
merged.tradeoffCandidates = merged.tradeoffs + merged.responseAudit.tradeoffs;
writeFileSync(
  "docs/testing/v3-release-audit.json",
  JSON.stringify(merged, null, 2) + "\n",
);
for (const offset of offsets)
  copyFileSync(
    `artifacts/v3/audit-v3-release-${offset}.json`,
    `docs/testing/v3-release-shard-${offset}.json`,
  );
copyFileSync(
  "artifacts/v3/held-out-balance.json",
  "docs/testing/v3-held-out-balance.json",
);
console.log(
  JSON.stringify(
    { ...merged, examples: undefined, method: undefined },
    null,
    2,
  ),
);
