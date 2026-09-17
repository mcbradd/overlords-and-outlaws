import * as THREE from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { assetUrl } from "../assets";
import { nameOf, PAINTING_NAMES } from "./content";
import { cardCanvas, escapeHTML, loadImage, SEAT_SIGNS } from "./face";
import { supported, crownProgress } from "./rules";
import type { GameView } from "./types";
import type { Preferences } from "./storage";

// The decoded image survives app-level table rebuilds. GPU textures remain
// owned by each table instance and are disposed with that instance.
let decodedBoard: HTMLImageElement | null = null;
let decodingBoard: Promise<HTMLImageElement | null> | null = null;
function boardImage() {
  return decodingBoard ??= loadImage("art/v2-table.webp").then(image => {
    decodedBoard = image;
    return image;
  });
}

// Visible card ink, cardstock and table share the same lighting. CSS3D carries
// transparent semantic hit targets and labels, never a second visible card face.
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
  private wideLayout = false;
  private width = 1400;
  private height = 1050;
  private textures: THREE.Texture[] = [];
  private boardTexture = new THREE.Texture();
  private boardMaterial: THREE.MeshStandardMaterial | null = null;
  private readyGeneration = -1;
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
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(Math.max(devicePixelRatio, preferences.quality === 'compact' ? 1 : 1.5), preferences.quality === "high" ? 3 : 2),
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x071111, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.domElement.className = "h-webgl";
    this.labels.domElement.className = "h-css3d";
    host.replaceChildren(this.renderer.domElement, this.labels.domElement);
    this.boardTexture.colorSpace = THREE.SRGBColorSpace;
    if (decodedBoard) {
      this.boardTexture.image = decodedBoard;
      this.boardTexture.needsUpdate = true;
    }
    this.scene.add(new THREE.HemisphereLight(0xffeed5, 0x203b32, 1.7));
    const key = new THREE.DirectionalLight(0xffe5b5, 2.5);
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
    const fill = new THREE.DirectionalLight(0x9aaed4, 0.7);
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
        if (this.readyGeneration === this.generation)
          this.host.dataset.sceneReady = "true";
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
    seat: number,
    width?: number,
  ) {
    const w = width ?? (this.view?.players.length === 2 ? 200 : 156),
      h = (w * 88) / 63;
    const turn = rotated ? -Math.PI / 2 : 0;
    const radius = w * 30 / 630;
    const outline = new THREE.Shape();
    outline.moveTo(-w/2 + radius, -h/2);
    outline.lineTo(w/2 - radius, -h/2);
    outline.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + radius);
    outline.lineTo(w/2, h/2 - radius);
    outline.quadraticCurveTo(w/2, h/2, w/2 - radius, h/2);
    outline.lineTo(-w/2 + radius, h/2);
    outline.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - radius);
    outline.lineTo(-w/2, -h/2 + radius);
    outline.quadraticCurveTo(-w/2, -h/2, -w/2 + radius, -h/2);
    const body = new THREE.Mesh(
      new THREE.ExtrudeGeometry(outline, { depth: 3, bevelEnabled: false, curveSegments: 8 }),
      new THREE.MeshStandardMaterial({ color: 0xc8bfa9, roughness: 0.84 }),
    );
    body.position.set(x, y, 10);
    body.rotation.z = turn;
    body.castShadow = true;
    body.receiveShadow = true;
    this.group.add(body);
    const canvas = await cardCanvas(id);
    if (this.disposed || generation !== this.generation) return;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(
      8,
      this.renderer.capabilities.getMaxAnisotropy(),
    );
    this.textures.push(texture);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.5, h - 0.5),
      new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
        transparent: true,
        alphaTest: 0.5,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
      }),
    );
    face.position.set(x, y, 13.65);
    face.rotation.z = turn;
    face.receiveShadow = true;
    this.group.add(face);
    const button = document.createElement("button");
    button.className = "h-world-card";
    button.style.width = `${w}px`;
    button.style.height = `${h}px`;
    button.setAttribute(
      "aria-label",
      `${nameOf(id)}. ${markers.join(". ")}. Inspect`,
    );
    button.dataset.cardId = id;
    button.dataset.seat = String(seat);
    button.tabIndex = this.focus === null || this.focus === seat ? 0 : -1;
    button.dataset.orientation = rotated ? "sideways" : "ready";
    button.style.background = "transparent";
    button.style.boxShadow = "none";
    const obj = new CSS3DObject(button);
    obj.position.set(x, y, 13.8);
    obj.rotation.z = turn;
    this.faceGroup.add(obj);
    button.onclick = () => this.inspect(id);
    this.label(
        `<strong>${escapeHTML(nameOf(id))}</strong>${markers.length ? `<br>${markers.map(escapeHTML).join(" · ")}` : ''}`,
        x,
        y - (rotated ? w : h) / 2 - 13,
        16,
        w + 18,
        "h-card-markers",
      );
    this.drawRequested = true;
  }
  setFocus(seat: number | null) {
    this.focus = seat;
    this.host.dataset.focus = seat === null ? "all" : String(seat);
    this.resize();
  }
  private resize() {
    const rect = this.host.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const renderWidth = rect.width;
    this.host.dataset.pannable = "false";
    this.host
      .querySelectorAll<HTMLButtonElement>(".h-world-card[data-seat]")
      .forEach((button) => {
        button.tabIndex =
          this.focus === null || Number(button.dataset.seat) === this.focus
            ? 0
            : -1;
      });
    this.renderer.setSize(renderWidth, rect.height);
    this.labels.setSize(renderWidth, rect.height);
    this.camera.aspect = renderWidth / rect.height;
    const fit = Math.max(
      this.height / 2 / Math.tan(THREE.MathUtils.degToRad(19)),
      this.width /
        2 /
        Math.tan(THREE.MathUtils.degToRad(19)) /
        this.camera.aspect,
    );
    const center =
      this.focus === null ? { x: 0, y: 0 } : this.courtAnchor(this.focus);
    const court = this.focus === null ? null : this.view?.players[this.focus];
    const columns = this.view?.players.length === 2 || (this.view?.players.length === 3 && this.focus === 0) ? 4 : 3;
    const rows = court
      ? Math.max(1, Math.ceil(court.court.length / columns))
      : 1;
    const twoPlayers = this.view?.players.length === 2;
    const cardWidth = twoPlayers ? 200 : 156;
    const cardHeight = (cardWidth * 88) / 63;
    const rowPitch = twoPlayers ? 302 : 250;
    const shownColumns = Math.max(
      1,
      Math.min(columns, court?.court.length ?? columns),
    );
    const widestCard = court?.rotated.length ? cardHeight : cardWidth;
    const focusWidth =
      (shownColumns - 1) * (twoPlayers ? 303 : 242) + widestCard + 40;
    const focusHeight = (rows - 1) * rowPitch + cardHeight + 100;
    // A Court close-up fits actual Royals and their attached markers. Shared
    // Crown, decks and resource trays remain in the explicit Whole table view.
    if (this.focus !== null) center.y += twoPlayers ? -7.5 : -17.5;
    const courtFit = Math.max(
      focusHeight / 2 / Math.tan(THREE.MathUtils.degToRad(19)),
      focusWidth /
        2 /
        Math.tan(THREE.MathUtils.degToRad(19)) /
        this.camera.aspect,
    );
    const z = this.focus === null ? fit * 1.03 : courtFit * 1.04;
    // This scene is a shallow table viewed from far away. A near plane of one
    // unit wastes depth precision and made card fronts fight the cardstock at
    // the far end of a dense table. Fit clipping distances to the actual camera.
    this.camera.near = Math.max(1, z * 0.05);
    this.camera.far = Math.max(z * 3, this.width + this.height + 1000);
    this.camera.position.set(center.x, center.y - z * 0.25, z);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(center.x, center.y, 0);
    this.camera.updateProjectionMatrix();
    this.drawRequested = true;
  }
  private courtAnchor(seat: number) {
    const n = this.view?.players.length ?? 3;
    if (this.wideLayout && this.view) {
      const columns = n === 3 && seat === 0 ? 4 : 3;
      const rows = Math.max(1, Math.ceil(this.view.players[seat].court.length / columns));
      const position = n === 3 ? [0, -950, 950][seat] : (seat - 1.5) * 840;
      return { x: position, y: this.height / 2 - (rows * 250 + 115) / 2 - 30 };
    }
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
    this.wideLayout = v.players.length >= 3 && this.host.clientWidth > this.host.clientHeight * 2;
    this.generation++;
    const generation = this.generation;
    this.host.dataset.sceneReady = "false";
    delete this.host.dataset.sceneError;
    const components: Promise<unknown>[] = [];
    this.clear();
    const columns = v.players.length === 2 ? 4 : 3;
    const maxRows = Math.max(
      1,
      ...v.players.map((p) => Math.ceil(p.court.length / (v.players.length === 3 && p.seat === 0 ? 4 : columns))),
    );
    this.height = Math.max(
      1100,
      620 + maxRows * (v.players.length === 2 ? 604 : 500),
    );
    this.width = 1800;
    if (this.wideLayout) {
      this.width = v.players.length === 3 ? 2780 : 3400;
      this.height = Math.max(730, 390 + maxRows * 250);
    }
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
    this.box(this.width, this.height, 6, 0x142921, 0, 0, 3);
    this.boardMaterial = new THREE.MeshStandardMaterial({
      map: this.boardTexture.image ? this.boardTexture : null,
      color: 0xbac4b9,
      roughness: 0.9,
      metalness: 0,
    });
    components.push(boardImage().then(image => {
      if (this.disposed || generation !== this.generation) return;
      if (!image) throw Error("The table artwork could not be loaded.");
      if (this.boardTexture.image !== image) {
        this.boardTexture.image = image;
        this.boardTexture.needsUpdate = true;
      }
      this.boardMaterial!.map = this.boardTexture;
      this.boardMaterial!.needsUpdate = true;
      this.drawRequested = true;
    }));
    const boardArt = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width, this.height),
      this.boardMaterial,
    );
    boardArt.position.z = 6.5;
    boardArt.receiveShadow = true;
    this.group.add(boardArt);
    for (const x of [-this.width / 2 + 22, this.width / 2 - 22])
      this.box(2, this.height - 44, 1, 0x897445, x, 0, 7, 0.5, 0.4);
    for (const y of [-this.height / 2 + 22, this.height / 2 - 22])
      this.box(this.width - 44, 2, 1, 0x897445, 0, y, 7, 0.5, 0.4);
    const trayY = this.wideLayout ? -this.height / 2 + 110 : 0;
    this.label("OVERLORDS &amp; OUTLAWS", 0, trayY + 140, 10, 580, "h-table-engraving");
    const crownX = -this.width / 2 + 145;
    // Shared Crises are physical cards alongside the paintings, with real
    // inspection and action anchors instead of an opaque HUD over a Court.
    v.history.slice(0, 3).forEach((event, index) => {
      components.push(this.card(event.id, -490 - index * 150, trayY + 25,
        [event.status === 'active' ? 'ACTIVE' : 'WARNING'], false, generation, -1, 112));
    });
    this.crown(crownX, trayY + 25);
    this.label(
      v.crown
        ? `${escapeHTML(v.players[v.crown.seat].name)} · ${v.crown.route === "regency" ? "Regency" : escapeHTML(nameOf(`law-${v.players[v.crown.seat].dynasty}`))}<br>${escapeHTML(crownProgress(v))}`
        : "THE CROWN IS VACANT",
      crownX,
      trayY - 53,
      15,
      230,
      "h-crown-label",
    );
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
      const columns = v.players.length === 2 || (v.players.length === 3 && p.seat === 0) ? 4 : 3;
      const anchor = this.courtAnchor(p.seat);
      const rows = Math.max(1, Math.ceil(p.court.length / columns));
      const matWidth = v.players.length === 2 ? 1300 : columns === 4 ? 1030 : 790;
      const rowPitch = v.players.length === 2 ? 302 : 250;
      const matHeight = rows * rowPitch + 115;
      const mat = this.box(
        matWidth,
        matHeight,
        2,
        0x0a1c1b,
        anchor.x,
        anchor.y,
        9,
      );
      (mat.material as THREE.MeshStandardMaterial).transparent = true;
      (mat.material as THREE.MeshStandardMaterial).opacity = 0.65;
      for (const dy of [-1, 1])
        this.box(
          matWidth - 20,
          1,
          1,
          0x8f7b50,
          anchor.x,
          anchor.y + (dy * matHeight) / 2,
          11,
          0.7,
          0.2,
        );
      const seatLabel = this.label(
        `${SEAT_SIGNS[p.seat]} ${escapeHTML(p.name)} <span>${escapeHTML(p.dynasty ?? "Inheritance")}</span>`,
        anchor.x,
        anchor.y + matHeight / 2 - 28,
        15,
        matWidth - 30,
        "h-seat-label",
      );
      seatLabel.dataset.seatAnchor = String(p.seat);
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
        const row = Math.floor(i / columns),
          inRow = Math.min(columns, p.court.length - row * columns);
        const x =
            anchor.x +
            ((i % columns) - (inRow - 1) / 2) *
              (v.players.length === 2 ? 303 : 242),
          y =
            anchor.y +
            matHeight / 2 -
            (v.players.length === 2 ? 216 : 200) -
            row * rowPitch;
        const marriage = v.marriages.find(
          (m) => m.queen === id || m.spouse === id,
        );
        const markers = [
          ...(p.ruler === id ? ["RULER"] : []),
          ...(marriage ? [`PAIR ${marriage.id}`] : []),
          ...(!supported(v, p.seat, id) ? ["OUTSIDE BLOODLINE"] : []),
          ...(p.rotated.includes(id) ? ["SIDEWAYS"] : []),
          ...(v.petitioned.includes(id) ? ["SAFE FROM RECALL THIS ROUND"] : []),
        ];
        components.push(this.card(
          id,
          x,
          y,
          markers,
          p.rotated.includes(id),
          generation,
          p.seat,
        ));
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
      const y = trayY + 30 - i * 105;
      for (let n = 0; n < Math.min(count, 8); n++)
        this.box(72, 100, 2, 0x15232b, pileX, y, 14 + n * 2);
      this.label(`${label}<br>${count}`, pileX, y, 35, 70, "h-pile-label");
    }
    this.resize();
    void Promise.all(components).then(() => {
      if (this.disposed || generation !== this.generation) return;
      this.readyGeneration = generation;
      this.drawRequested = true;
    }).catch(error => {
      if (this.disposed || generation !== this.generation) return;
      this.host.dataset.sceneError = error instanceof Error ? error.message : String(error);
    });
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
    this.boardTexture.dispose();
    this.renderer.dispose();
    this.host.replaceChildren();
  }
}
