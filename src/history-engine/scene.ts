import * as THREE from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { assetUrl } from "../assets";
import { nameOf, PAINTING_NAMES } from "./content";
import { cardCanvas, escapeHTML, SEAT_SIGNS } from "./face";
import { supported, crownProgress } from "./rules";
import type { GameView } from "./types";
import type { Preferences } from "./storage";

// A single coordinate model drives solid cardstock, physical mats and accessible
// CSS3D faces. The scene accepts projected public state only, never a full save.
export class HistoryTable {
  private renderer: THREE.WebGLRenderer;
  private labels = new CSS3DRenderer();
  private scene = new THREE.Scene();
  private faceScene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 1, 10000);
  private group = new THREE.Group();
  private faceGroup = new THREE.Group();
  private observer: ResizeObserver;
  private disposed = false;
  private generation = 0;
  private frame = 0;
  private focus: number | null = null;
  private view: GameView | null = null;
  private width = 1400;
  private height = 1050;
  private textures: THREE.Texture[] = [];
  private drawRequested = true;
  constructor(
    private host: HTMLElement,
    private inspect: (id: string) => void,
    private fallback: () => void,
    private preferences: Preferences,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: preferences.quality !== "compact",
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, preferences.quality === "high" ? 2 : 1.5),
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x071111, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = "h-webgl";
    this.labels.domElement.className = "h-css3d";
    host.replaceChildren(this.renderer.domElement, this.labels.domElement);
    this.scene.add(new THREE.HemisphereLight(0xffeed5, 0x203b32, 2.2));
    const key = new THREE.DirectionalLight(0xffe5b5, 3.5);
    key.position.set(-500, 500, 900);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -1000;
    key.shadow.camera.right = 1000;
    key.shadow.camera.top = 1000;
    key.shadow.camera.bottom = -1000;
    key.shadow.camera.far = 2500;
    key.shadow.bias = -0.0005;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x9aaed4, 1.3);
    fill.position.set(650, -250, 700);
    this.scene.add(fill);
    this.scene.add(this.group);
    this.faceScene.add(this.faceGroup);
    this.renderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.fallback();
    });
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    const tick = () => {
      if (this.disposed) return;
      this.frame = requestAnimationFrame(tick);
      if (this.drawRequested) {
        this.renderer.render(this.scene, this.camera);
        this.labels.render(this.faceScene, this.camera);
        this.drawRequested = false;
      }
    };
    tick();
  }
  private box(
    w: number,
    h: number,
    d: number,
    color: number,
    x: number,
    y: number,
    z: number,
    roughness = 0.8,
    metalness = 0,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness, metalness }),
    );
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.group.add(mesh);
    return mesh;
  }
  private label(
    html: string,
    x: number,
    y: number,
    z: number,
    width: number,
    className = "",
  ) {
    const el = document.createElement("div");
    el.className = `h-world-label ${className}`;
    el.style.width = `${width}px`;
    el.innerHTML = html;
    const obj = new CSS3DObject(el);
    obj.position.set(x, y, z);
    this.faceGroup.add(obj);
    return el;
  }
  private token(x: number, y: number, label: string, color = 0xb19357) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 20, 7, 32),
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.65,
        roughness: 0.36,
      }),
    );
    m.rotation.x = Math.PI / 2;
    m.position.set(x, y, 18);
    m.castShadow = true;
    this.group.add(m);
    this.label(escapeHTML(label), x, y, 23, 35, "h-world-token");
  }
  private crown(x: number, y: number) {
    const gold = new THREE.MeshStandardMaterial({
      color: 0xc9a352,
      metalness: 0.82,
      roughness: 0.25,
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(39, 7, 12, 48), gold);
    torus.position.set(x, y, 28);
    torus.castShadow = true;
    this.group.add(torus);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const point = new THREE.Mesh(new THREE.ConeGeometry(9, 34, 5), gold);
      point.rotation.x = Math.PI / 2;
      point.position.set(x + Math.cos(a) * 38, y + Math.sin(a) * 38, 46);
      point.castShadow = true;
      this.group.add(point);
      const gem = new THREE.Mesh(
        new THREE.SphereGeometry(5, 10, 8),
        new THREE.MeshStandardMaterial({
          color: i % 2 ? 0x386f61 : 0x762e38,
          metalness: 0.35,
          roughness: 0.16,
        }),
      );
      gem.position.set(point.position.x, point.position.y, 66);
      this.group.add(gem);
    }
  }
  private async card(
    id: string,
    x: number,
    y: number,
    markers: string[],
    rotated: boolean,
    generation: number,
  ) {
    const w = 146,
      h = (w * 88) / 63;
    const body = this.box(w, h, 3, 0xddd1b6, x, y, 12);
    if (rotated) body.rotation.z = -0.12;
    const canvas = await cardCanvas(id);
    if (this.disposed || generation !== this.generation) return;
    const button = document.createElement("button");
    button.className = "h-world-card";
    button.style.width = `${w}px`;
    button.style.height = `${h}px`;
    button.setAttribute(
      "aria-label",
      `${nameOf(id)}. ${markers.join(". ")}. Inspect`,
    );
    button.dataset.cardId = id;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    button.append(canvas);
    const obj = new CSS3DObject(button);
    obj.position.set(x, y, 14);
    if (rotated) obj.rotation.z = -0.12;
    this.faceGroup.add(obj);
    button.onclick = () => this.inspect(id);
    if (markers.length)
      this.label(
        markers.map(escapeHTML).join(" · "),
        x,
        y - h / 2 - 13,
        16,
        w + 18,
        "h-card-markers",
      );
    this.drawRequested = true;
  }
  setFocus(seat: number | null) {
    this.focus = seat;
    this.resize();
  }
  private resize() {
    const rect = this.host.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    this.renderer.setSize(rect.width, rect.height);
    this.labels.setSize(rect.width, rect.height);
    this.camera.aspect = rect.width / rect.height;
    const fit = Math.max(
      this.height / 2 / Math.tan(THREE.MathUtils.degToRad(19)),
      this.width /
        2 /
        Math.tan(THREE.MathUtils.degToRad(19)) /
        this.camera.aspect,
    );
    const center =
      this.focus === null ? { x: 0, y: 0 } : this.courtAnchor(this.focus);
    const z = fit * (this.focus === null ? 1.03 : 0.55);
    this.camera.position.set(center.x, center.y - z * 0.25, z);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(center.x, center.y, 0);
    this.camera.updateProjectionMatrix();
    this.drawRequested = true;
  }
  private courtAnchor(seat: number) {
    const n = this.view?.players.length ?? 3;
    const rowHeight = (this.height - 250) / 2;
    return n === 2
      ? { x: 0, y: seat === 0 ? -rowHeight / 2 - 125 : rowHeight / 2 + 125 }
      : seat === 0
        ? { x: n === 4 ? -435 : 0, y: -rowHeight / 2 - 125 }
        : seat === 1
          ? { x: -435, y: rowHeight / 2 + 125 }
          : seat === 2
            ? { x: 435, y: rowHeight / 2 + 125 }
            : { x: 435, y: -rowHeight / 2 - 125 };
  }
  render(v: GameView) {
    this.view = v;
    this.generation++;
    const generation = this.generation;
    this.clear();
    const maxRows = Math.max(
      1,
      ...v.players.map((p) => Math.ceil(p.court.length / 4)),
    );
    this.height = Math.max(1100, 620 + maxRows * 480);
    this.width = 1800;
    this.box(this.width + 50, this.height + 50, 42, 0x302013, 0, 0, -24);
    this.box(
      this.width + 12,
      this.height + 12,
      10,
      0x97733f,
      0,
      0,
      -3,
      0.38,
      0.6,
    );
    this.box(this.width, this.height, 6, 0x1c3932, 0, 0, 3);
    for (const x of [-this.width / 2 + 22, this.width / 2 - 22])
      this.box(2, this.height - 44, 1, 0x897445, x, 0, 7, 0.5, 0.4);
    for (const y of [-this.height / 2 + 22, this.height / 2 - 22])
      this.box(this.width - 44, 2, 1, 0x897445, 0, y, 7, 0.5, 0.4);
    this.label("OVERLORDS &amp; OUTLAWS", 0, 140, 10, 580, "h-table-engraving");
    this.crown(-700, 25);
    this.label(
      v.crown
        ? `${escapeHTML(v.players[v.crown.seat].name)} · ${v.crown.route === "regency" ? "Regency" : escapeHTML(nameOf(`law-${v.players[v.crown.seat].dynasty}`))}<br>${escapeHTML(crownProgress(v))}`
        : "THE CROWN IS VACANT",
      -700,
      -53,
      15,
      230,
      "h-crown-label",
    );
    const trayY = 0;
    const paintingArt: Record<string, string> = {
      alba: "art/court.webp",
      plantagenet: "art/wolves.webp",
      tudor: "art/witness.webp",
      habsburg: "art/last-witness.webp",
    };
    v.modules.forEach((d, i) => {
      const x = (i - (v.modules.length - 1) / 2) * 205;
      this.box(190, 166, 6, 0x443326, x, trayY, 11);
      const slots = Array.from({ length: 6 }, (_, slot) => {
        const f = v.fragments.find(
          (f) => f.dynasty === d && f.slot === slot + 1,
        );
        return `<button class="h-fragment ${f ? "present" : ""} ${f?.veil ? "veiled" : ""}" data-fragment="${f?.id ?? ""}" aria-label="${escapeHTML(d)} fragment ${slot + 1}: ${f ? (f.veil ? `Covered until round ${f.veil.until}` : "unveiled") : "not yet revealed"}" style="${f && !f.veil ? `background-image:url('${assetUrl(paintingArt[d])}');background-position:${(slot % 3) * 50}% ${Math.floor(slot / 3) * 100}%;` : ""}"><span>${f?.veil ? "◈" : f ? "" : slot + 1}</span>${f?.onceVeiled ? "<i>○</i>" : ""}</button>`;
      }).join("");
      const label = this.label(
        `<div class="h-painting-grid">${slots}</div><strong>${escapeHTML(d)} · ${v.fragments.filter((f) => f.dynasty === d && !f.veil).length}/6 unveiled</strong>`,
        x,
        trayY,
        16,
        180,
        "h-painting",
      );
      label.querySelectorAll<HTMLButtonElement>("[data-fragment]").forEach(
        (button) =>
          (button.onclick = () => {
            if (button.dataset.fragment) this.inspect(button.dataset.fragment);
          }),
      );
    });
    for (const p of v.players) {
      const anchor = this.courtAnchor(p.seat);
      const rows = Math.max(1, Math.ceil(p.court.length / 4));
      const matWidth = v.players.length === 2 ? 1300 : 790;
      const matHeight = rows * 232 + 135;
      this.box(matWidth, matHeight, 3, 0x132d28, anchor.x, anchor.y, 10);
      this.label(
        `${SEAT_SIGNS[p.seat]} ${escapeHTML(p.name)} <span>${escapeHTML(p.dynasty ?? "Inheritance")}</span>`,
        anchor.x,
        anchor.y + matHeight / 2 - 28,
        15,
        matWidth - 30,
        "h-seat-label",
      );
      for (let i = 0; i < 3; i++)
        this.token(
          anchor.x + matWidth / 2 - 48 - i * 44,
          anchor.y + matHeight / 2 - 66,
          i < p.seals ? "◆" : "×",
          i < p.seals ? 0xb89752 : 0x413d32,
        );
      this.label(
        `${p.handCount} Nobles in hand · ${p.leverage.length} in Loans`,
        anchor.x - matWidth / 2 + 140,
        anchor.y + matHeight / 2 - 66,
        16,
        240,
        "h-count-label",
      );
      p.court.forEach((id, i) => {
        const row = Math.floor(i / 4),
          inRow = Math.min(4, p.court.length - row * 4);
        const x = anchor.x + ((i % 4) - (inRow - 1) / 2) * 171,
          y = anchor.y + matHeight / 2 - 200 - row * 232;
        const marriage = v.marriages.find(
          (m) => m.queen === id || m.spouse === id,
        );
        const markers = [
          ...(p.ruler === id ? ["RULER"] : []),
          ...(marriage ? [`PAIR ${marriage.id}`] : []),
          ...(!supported(v, p.seat, id) ? ["OUTSIDE BLOODLINE"] : []),
          ...(p.rotated.includes(id) ? ["SIDEWAYS"] : []),
          ...(v.petitioned.includes(id) ? ["RECALLED THIS ROUND"] : []),
        ];
        void this.card(id, x, y, markers, p.rotated.includes(id), generation);
      });
      if (p.leverage.length) {
        this.label(
          `LOANS · ${p.leverage.map(nameOf).map(escapeHTML).join(" · ")}`,
          anchor.x,
          anchor.y - matHeight / 2 + 18,
          15,
          matWidth - 40,
          "h-leverage-label",
        );
      }
    }
    const pileX = this.width / 2 - 96;
    for (const [i, label, count] of [
      [0, "DYNASTY", v.dynastyCount],
      [1, "HISTORY", v.historyCount],
    ] as const) {
      const y = 30 - i * 155;
      for (let n = 0; n < Math.min(count, 8); n++)
        this.box(72, 100, 2, 0x15232b, pileX, y, 14 + n * 2);
      this.label(`${label}<br>${count}`, pileX, y, 35, 70, "h-pile-label");
    }
    this.resize();
  }
  private clear() {
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const materials = Array.isArray(o.material) ? o.material : [o.material];
        materials.forEach((m) => m.dispose());
      }
    });
    this.group.clear();
    this.faceGroup.traverse((o) => {
      if (o instanceof CSS3DObject) o.element.remove();
    });
    this.faceGroup.clear();
    for (const t of this.textures) t.dispose();
    this.textures = [];
  }
  dispose() {
    this.disposed = true;
    this.generation++;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.clear();
    this.renderer.dispose();
    this.host.replaceChildren();
  }
}
