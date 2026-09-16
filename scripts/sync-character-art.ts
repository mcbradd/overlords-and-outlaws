import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { CARDS } from "../src/content";

const manifest = JSON.parse(
  readFileSync("docs/art/character-generation.json", "utf8"),
);
if (process.argv.includes("--complete") && CARDS.some((c) => !manifest[c.id])) {
  throw new Error(
    "The character manifest must cover every playable character.",
  );
}
const entries = CARDS.filter((c) => manifest[c.id]).map((c) => {
  const asset = manifest[c.id].asset;
  if (!existsSync(`public/${asset}`))
    throw new Error(`Missing portrait for ${c.id}: ${asset}`);
  return [c.id, asset];
});
writeFileSync(
  "src/character-art.ts",
  "// Generated from docs/art/character-generation.json by scripts/sync-character-art.ts.\nexport const CHARACTER_ART: Record<string, string> = " +
    JSON.stringify(Object.fromEntries(entries), null, 2) +
    ";\n",
);
console.log(`${entries.length}/${CARDS.length} character assets registered`);
