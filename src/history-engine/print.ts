import { HISTORY_FACE, hydrateHistoryFaces, paintingTileCanvas } from "./face";
import { CONTENT_VERSION, SOURCES } from "./content";

/** Standalone print entry, bundled from the same sources as the game. */
async function preparePrint() {
  const button = document.querySelector<HTMLButtonElement>("[data-print]")!;
  const status = document.querySelector<HTMLElement>("[data-print-status]")!;
  document.documentElement.dataset.printState = "loading";
  try {
    if (document.documentElement.dataset.contentVersion !== CONTENT_VERSION)
      throw Error("The proof and its renderer have different content versions. Rebuild the proof.");
    await hydrateHistoryFaces();
    const cards = [...document.querySelectorAll<HTMLCanvasElement>(".card[data-card] .h-face-canvas")];
    if (cards.length !== SOURCES.length) throw Error("The proof is missing card faces.");
    for (const card of cards) {
      if (card.dataset.faceState !== "ready" || card.dataset.textOverflow === "true" || card.dataset.artMissing === "true")
        throw Error(`The face of ${card.dataset.faceId} could not be prepared completely.`);
      const fields = JSON.parse(card.dataset.fields!) as Array<{ label: "name" | "role" | "rules"; x: number; y: number; width: number; height: number }>;
      if (!fields.some(field => field.label === "rules")) throw Error(`Missing instructions: ${card.dataset.faceId}`);
      if (fields.some(field => {
        const box = HISTORY_FACE[field.label];
        return field.x < box.x - 1 || field.y < box.y - 1 || field.x + field.width > box.x + box.width + 1 || field.y + field.height > box.y + box.height + 1;
      })) throw Error(`Print geometry exceeds its safe field: ${card.dataset.faceId}`);
    }
    const tiles = [...document.querySelectorAll<HTMLCanvasElement>("canvas[data-print-tile]")];
    for (const tile of tiles) {
      const painted = await paintingTileCanvas(tile.dataset.printTile!);
      tile.width = painted.width; tile.height = painted.height;
      tile.getContext("2d")!.drawImage(painted, 0, 0);
      tile.dataset.tileState = "ready";
    }
    document.documentElement.dataset.printState = "ready";
    document.documentElement.dataset.printFaces = String(cards.length);
    document.documentElement.dataset.printTiles = String(tiles.length);
    status.textContent = `${cards.length} reference faces ready · ${CONTENT_VERSION} · 63 × 88 mm`;
    button.disabled = false;
    button.onclick = () => window.print();
  } catch (error) {
    document.documentElement.dataset.printState = "error";
    status.textContent = `Print preparation failed: ${error instanceof Error ? error.message : String(error)}`;
    status.setAttribute("role", "alert");
  }
}
void preparePrint();
