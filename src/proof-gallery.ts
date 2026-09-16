import "./style.css";
import "./v3.css";
import "./table.css";
import "./guided-play.css";
import "./faction-frames.css";
import { CARDS, HOUSES } from "./content";
import { cardFace } from "./cards";
import { hydrateCardTextures } from "./card-texture";
import { spec } from "./duel";

const family = document.querySelector<HTMLSelectElement>("#house")!;
const format = document.querySelector<HTMLSelectElement>("#format")!;
const damage = document.querySelector<HTMLInputElement>("#damage")!;
family.innerHTML = HOUSES.map(
  (h) => `<option value="${h.id}">${h.name}</option>`,
).join("");
let revision = 0;
async function render() {
  const current = ++revision;
  const host = document.querySelector<HTMLElement>("#proof-cards")!;
  host.innerHTML = CARDS.filter((c) => c.house === family.value)
    .map(
      (c) =>
        `<figure>${cardFace(
          {
            uid: c.id,
            card: c.id,
            hp: damage.checked ? 1 : spec(c.id).resolve,
            ready: true,
          },
          { zone: format.value === "board" ? "court" : "reference-card" },
        )}<figcaption>${c.name}</figcaption></figure>`,
    )
    .join("");
  await hydrateCardTextures(host);
  if (current === revision) host.dataset.ready = "true";
}
family.addEventListener("change", render);
format.addEventListener("change", render);
damage.addEventListener("change", render);
document.querySelector("#proof-cards")!.addEventListener("click", (event) => {
  const card = (event.target as HTMLElement).closest<HTMLButtonElement>(".royal-card");
  const source = card?.querySelector<HTMLCanvasElement>("canvas");
  if (!source || source.dataset.paintState !== "ready") return;
  const dialog = document.createElement("dialog");
  dialog.className = "proof-inspection";
  dialog.setAttribute("aria-label", card!.getAttribute("aria-label")!);
  dialog.innerHTML = '<button class="proof-close" autofocus aria-label="Close card inspection">Close ×</button><canvas width="1260" height="1760"></canvas>';
  dialog.querySelector("canvas")!.getContext("2d")!.drawImage(source, 0, 0);
  dialog.querySelector("button")!.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { dialog.remove(); card!.focus(); });
  document.body.append(dialog);
  dialog.showModal();
});
void render();
if (import.meta.hot) import.meta.hot.accept(() => location.reload());
