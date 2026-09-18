import * as THREE from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { BY_ID } from "./content";
import {
  cardCanvas,
  cardBackCanvas,
  faceHTML,
  escapeHTML,
  SUIT_INK,
  SUIT_SIGNS,
  rankLabel,
} from "./face";
import "./scene.css";
export interface CoreTableView {
  viewer?: number;
  first?: number;
  players: {
    name?: string;
    dynasty: string;
    court: string[];
    played: string[];
    ruler: string | null;
    handCount?: number;
    hand?: readonly string[] | null;
  }[];
  attempts?: Record<string, string[]>;
  active: number;
  round: number;
  deckCount?: number;
  crown?: {
    seat: number;
    oldRuler: string;
    heir: string;
    supporter: string;
    stage?: string;
  } | null;
  marriages?: readonly { queen: string; spouse: string }[];
  pending?: {
    type?: string;
    lead?: string;
    card?: string;
    target?: string;
    other?: number;
  } | null;
}
type Piece = {
  mesh: THREE.Group;
  hit: CSS3DObject;
  to: THREE.Vector3;
  from: THREE.Vector3;
  time: number;
};
function roundedShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape(),
    x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function surface(w: number, h: number, r: number): THREE.ShapeGeometry {
  const g = new THREE.ShapeGeometry(roundedShape(w, h, r));
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  return g;
}
function canvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function boardCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1536;
  c.height = Math.max(512, Math.round((1536 * h) / w));
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#294c40";
  ctx.fillRect(0, 0, c.width, c.height);
  // Fine woven/engraved material detail, never an unexplained game symbol.
  for (let y = 0; y < c.height; y += 4) {
    ctx.strokeStyle = y % 8 ? "#fff00003" : "#0000000b";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(c.width, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#b4a16b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(24, 24, c.width - 48, c.height - 48, 25);
  ctx.stroke();
  ctx.strokeStyle = "#879273";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(32, 32, c.width - 64, c.height - 64, 20);
  ctx.stroke();
  for (const x of [48, c.width - 48])
    for (const y of [48, c.height - 48]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.restore();
    }
  return c;
}
function crownCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 315;
  c.height = 440;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#eee4cd";
  ctx.beginPath();
  ctx.roundRect(0, 0, 315, 440, 16);
  ctx.fill();
  ctx.strokeStyle = "#b18b43";
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 15, 285, 410);
  ctx.fillStyle = "#a87e29";
  ctx.beginPath();
  ctx.moveTo(76, 218);
  ctx.lineTo(55, 120);
  ctx.lineTo(112, 155);
  ctx.lineTo(157, 91);
  ctx.lineTo(203, 155);
  ctx.lineTo(260, 120);
  ctx.lineTo(239, 218);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(77, 229, 162, 17);
  ctx.fillStyle = "#263c30";
  ctx.textAlign = "center";
  ctx.font = "600 38px Georgia";
  ctx.fillText("THE CROWN", 157, 324);
  return c;
}
/** Physical public table. No hidden engine state is accepted or read. */
export class CoreTable {
  private renderer!: THREE.WebGLRenderer;
  private fallback = false;
  private labels = new CSS3DRenderer();
  private scene = new THREE.Scene();
  private labelScene = new THREE.Scene();
  // The closest permitted view is 350 units away. A 50-unit near plane
  // preserves depth precision between printed faces and their card stock.
  private camera = new THREE.PerspectiveCamera(36, 1, 50, 12000);
  private observer: ResizeObserver;
  private content = new THREE.Group();
  private pieces: Piece[] = [];
  private textures: THREE.Texture[] = [];
  private positions = new Map<string, THREE.Vector3>();
  private seats: THREE.Vector3[] = [];
  private width = 1280;
  private height = 720;
  private boardW = 1360;
  private boardH = 640;
  private target = new THREE.Vector3();
  private wantedTarget = new THREE.Vector3();
  private distance = 1800;
  private wantedDistance = 1800;
  private yaw = 0;
  private tilt = 0.22;
  private focused: number | null = null;
  private reduced = false;
  private disposed = false;
  private frame = 0;
  private generation = 0;
  private view: CoreTableView | null = null;
  private dragging: { x: number; y: number } | null = null;
  private cameraEnabled = true;
  private groupIndex = 0;
  private pager = document.createElement("nav");
  ready: Promise<void> = Promise.resolve();
  constructor(
    private host: HTMLElement,
    private onInspect: (id: string) => void,
  ) {
    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      this.fallback = true;
      host.classList.add("core-table-fallback");
      host.dataset.renderer = "semantic";
      host.tabIndex = 0;
      host.setAttribute(
        "aria-label",
        "Accessible public table. Scroll to see every Court and Played card.",
      );
      this.observer = new ResizeObserver(() => {});
      return;
    }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x15241d, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.domElement.className = "core-table-webgl";
    this.labels.domElement.className = "core-table-labels";
    host.classList.add("core-table-surface");
    host.tabIndex = 0;
    host.setAttribute(
      "aria-label",
      "Physical table. Drag or use arrow keys to pan. Home resets the view.",
    );
    this.pager.className = "core-table-pager";
    this.pager.setAttribute("aria-label", "Focused Court cards");
    this.pager.hidden = true;
    host.replaceChildren(
      this.renderer.domElement,
      this.labels.domElement,
      this.pager,
    );
    this.scene.add(new THREE.HemisphereLight(0xfff5dc, 0x526450, 1.5));
    const sun = new THREE.DirectionalLight(0xffeac3, 1.6);
    sun.position.set(-500, 600, 1200);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -1800;
    sun.shadow.camera.right = 1800;
    sun.shadow.camera.top = 1400;
    sun.shadow.camera.bottom = -1400;
    sun.shadow.camera.far = 4500;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.6;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xb3d2cd, 0.6);
    fill.position.set(600, -100, 800);
    this.scene.add(fill);
    this.scene.add(this.content);
    host.addEventListener("pointerdown", this.down);
    host.addEventListener("pointermove", this.move);
    host.addEventListener("pointerup", this.up);
    host.addEventListener("pointercancel", this.up);
    host.addEventListener("wheel", this.wheel, { passive: false });
    host.addEventListener("keydown", this.keys);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(host);
    this.resize();
    this.tick();
  }
  private down = (e: PointerEvent) => {
    if (!this.cameraEnabled || (e.target as HTMLElement).closest("button"))
      return;
    this.dragging = { x: e.clientX, y: e.clientY };
    this.host.classList.add("is-grabbing");
    this.host.setPointerCapture(e.pointerId);
  };
  private move = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragging.x,
      dy = e.clientY - this.dragging.y;
    if (e.shiftKey) {
      this.yaw = THREE.MathUtils.clamp(this.yaw + dx * 0.003, -0.5, 0.5);
      this.tilt = THREE.MathUtils.clamp(this.tilt + dy * 0.002, 0.08, 0.65);
    } else
      this.pan(
        (-dx * this.distance) / this.width,
        (dy * this.distance) / this.height,
      );
    this.dragging = { x: e.clientX, y: e.clientY };
  };
  pan(dx: number, dy: number) {
    this.wantedTarget.x = THREE.MathUtils.clamp(
      this.wantedTarget.x + dx,
      -this.boardW / 2,
      this.boardW / 2,
    );
    this.wantedTarget.y = THREE.MathUtils.clamp(
      this.wantedTarget.y + dy,
      -this.boardH / 2,
      this.boardH / 2,
    );
  }
  private keys = (e: KeyboardEvent) => {
    if (!this.cameraEnabled) return;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-65, 0],
      ArrowRight: [65, 0],
      ArrowUp: [0, 65],
      ArrowDown: [0, -65],
    };
    if (moves[e.key]) {
      e.preventDefault();
      this.pan(...moves[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      this.focus(null);
    }
  };
  private up = () => {
    this.dragging = null;
    this.host.classList.remove("is-grabbing");
  };
  private wheel = (e: WheelEvent) => {
    if (!this.cameraEnabled) return;
    e.preventDefault();
    this.wantedDistance = THREE.MathUtils.clamp(
      this.wantedDistance *
        Math.exp(e.deltaY * (e.deltaMode === 1 ? 0.02 : 0.001)),
      350,
      4500,
    );
  };
  private resize = () => {
    if (this.fallback) return;
    const bounds = this.host.getBoundingClientRect();
    this.width = Math.max(1, bounds.width);
    const top = this.cameraEnabled ? 48 : 0;
    const bottom = this.focused !== null && this.cameraEnabled ? 52 : 0;
    this.height = Math.max(1, bounds.height - top - bottom);
    this.renderer.domElement.style.top = `${top}px`;
    this.labels.domElement.style.top = `${top}px`;
    this.renderer.setSize(this.width, this.height);
    this.labels.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.fit();
  };
  private fit() {
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    let seat = this.focused === null ? null : this.seats[this.focused];
    let w = seat ? 430 : this.boardW + 20,
      h = seat ? 350 : this.boardH + 12;
    if (seat && this.cameraEnabled && this.view) {
      const court = this.view.players[this.focused!].court;
      const count = this.width < 600 ? 1 : 3;
      this.groupIndex = Math.max(
        0,
        Math.min(this.groupIndex, Math.ceil(court.length / count) - 1),
      );
      const points = court
        .slice(this.groupIndex * count, (this.groupIndex + 1) * count)
        .map((id) => this.positions.get(id))
        .filter((p): p is THREE.Vector3 => !!p);
      if (points.length) {
        const minX = Math.min(...points.map((p) => p.x)),
          maxX = Math.max(...points.map((p) => p.x));
        const minY = Math.min(...points.map((p) => p.y)),
          maxY = Math.max(...points.map((p) => p.y));
        seat = new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2 - 6, 0);
        w = maxX - minX + 210;
        h = maxY - minY + 295;
      }
    }
    this.wantedDistance =
      Math.max(
        h / (2 * Math.tan(fov / 2)),
        w / (2 * Math.tan(fov / 2) * this.camera.aspect),
      ) * (seat ? 1.05 : 1.1);
    this.wantedTarget.copy(seat ?? new THREE.Vector3());
    this.renderPager();
    if (this.reduced) {
      this.distance = this.wantedDistance;
      this.target.copy(this.wantedTarget);
    }
  }
  focus(seat: number | null) {
    this.focused = seat;
    this.groupIndex = 0;
    this.host.classList.toggle(
      "core-table-focused",
      seat !== null && this.cameraEnabled,
    );
    if (this.fallback) {
      const section =
        seat === null
          ? null
          : this.host.querySelector<HTMLElement>(
              `[data-fallback-seat="${seat}"]`,
            );
      const scroller = this.host.querySelector<HTMLElement>(
        ".core-fallback-scroll",
      );
      scroller?.scrollTo({
        top: section ? section.offsetTop : 0,
        behavior: this.reduced ? "instant" : "smooth",
      });
      return;
    }
    this.yaw = 0;
    this.tilt = 0.22;
    this.resize();
  }
  private renderPager() {
    this.pager.hidden = !this.cameraEnabled || this.focused === null;
    if (this.pager.hidden || !this.view) return;
    const court = this.view.players[this.focused!].court,
      size = this.width < 600 ? 1 : 3;
    const start = this.groupIndex * size;
    this.pager.innerHTML = `<button type="button" data-court-page="previous" ${start === 0 ? "disabled" : ""}>Previous</button><span aria-live="polite">${court.length ? `${start + 1}–${Math.min(start + size, court.length)}` : "0"} of ${court.length}</span><button type="button" data-court-page="next" ${start + size >= court.length ? "disabled" : ""}>Next</button><button type="button" data-court-page="overview">Whole table</button>`;
    this.pager.querySelectorAll<HTMLButtonElement>("button").forEach((button) =>
      button.addEventListener("click", () => {
        const action = button.dataset.courtPage;
        if (action === "overview") this.focus(null);
        else {
          this.groupIndex += action === "next" ? 1 : -1;
          this.fit();
          this.pager
            .querySelector<HTMLButtonElement>(
              `[data-court-page="${action}"]:not(:disabled)`,
            )
            ?.focus();
        }
      }),
    );
  }
  setReducedMotion(value: boolean) {
    this.reduced = value;
    if (value) {
      this.distance = this.wantedDistance;
      this.target.copy(this.wantedTarget);
    }
  }
  setDropTargets(ids: string[], court: number | null) {
    const active = ids.length > 0 || court !== null;
    this.labels.domElement.inert = !active && !this.inspectEnabled;
    this.host
      .querySelectorAll<HTMLElement>("[data-table-card],[data-court-seat]")
      .forEach((el) => {
        const valid =
          ids.includes(el.dataset.tableCard ?? "") ||
          (court !== null && el.dataset.courtSeat === String(court));
        el.classList.toggle("valid-drop", valid);
        if (el instanceof HTMLButtonElement)
          el.disabled = !this.inspectEnabled && !valid;
        if (el.dataset.courtSeat !== undefined) el.tabIndex = valid ? 0 : -1;
      });
  }
  private inspectEnabled = true;
  /** Tutorial restricts card inspection; looking around the table stays available. */
  setInteractive(value: boolean) {
    this.inspectEnabled = value;
    this.cameraEnabled = true;
    this.host.classList.toggle(
      "core-table-focused",
      value && this.focused !== null,
    );
    this.pager.hidden = !value || this.focused === null;
    this.host.tabIndex = 0;
    this.host.setAttribute(
      "aria-label",
      value
        ? "Physical table. Drag or use arrow keys to pan. Home resets the view."
        : "Physical tutorial table",
    );
    this.labels.domElement.inert = !value;
    if (this.fallback) {
      this.host
        .querySelectorAll<HTMLButtonElement>("button")
        .forEach((button) => (button.disabled = !value));
      const scroller = this.host.querySelector<HTMLElement>(
        ".core-fallback-scroll",
      );
      if (scroller) scroller.tabIndex = value ? 0 : -1;
    } else this.resize();
  }
  private label(
    text: string,
    x: number,
    y: number,
    z = 8,
    className = "core-table-caption",
  ): CSS3DObject {
    const el = document.createElement(
      className === "core-table-seat" ? "button" : "div",
    );
    el.className = className;
    el.textContent = text;
    const obj = new CSS3DObject(el);
    obj.position.set(x, y, z);
    this.labelScene.add(obj);
    return obj;
  }
  private clear() {
    this.content.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
        ms.forEach((m) => m.dispose());
      }
    });
    this.content.clear();
    this.labelScene.clear();
    this.labels.domElement
      .querySelectorAll(
        "[data-table-card],.core-table-caption,.core-table-seat,.core-table-office",
      )
      .forEach((el) => el.remove());
    this.textures.forEach((t) => t.dispose());
    this.textures = [];
    this.pieces = [];
  }
  update(view: CoreTableView): Promise<void> {
    this.view = view;
    return (this.ready = this.draw(view, ++this.generation));
  }
  private async draw(view: CoreTableView, generation: number) {
    const ids = [
      ...new Set(view.players.flatMap((p) => [...p.court, ...p.played])),
    ];
    const loaded = await Promise.all(
      ids.map(async (id) => [id, await cardCanvas(id)] as const),
    );
    if (this.disposed || generation !== this.generation) return;
    if (this.fallback) {
      const cardButton = (id: string, ruler: string | null) => {
        const attempts = Object.entries(view.attempts ?? {})
          .filter(([, targets]) => targets.includes(id))
          .map(
            ([attacker]) =>
              view.players[Number(attacker)]?.name ??
              view.players[Number(attacker)]?.dynasty,
          )
          .join(", ");
        return `<button data-table-card="${escapeHTML(id)}" ${!this.cameraEnabled ? "disabled" : ""}>${faceHTML(id)}<span>${escapeHTML(BY_ID[id].name)}${ruler === id ? " · Ruler" : ""}${view.crown?.heir === id ? " · Heir" : ""}${view.crown?.supporter === id ? " · Supporter" : ""}</span>${attempts ? `<span>Recall already tried this round: ${escapeHTML(attempts)}</span>` : ""}</button>`;
      };
      const pairs = (view.marriages ?? [])
        .map(
          (pair) =>
            `<p class="core-fallback-link">Marriage: ${escapeHTML(BY_ID[pair.queen].name)} ↔ ${escapeHTML(BY_ID[pair.spouse].name)}</p>`,
        )
        .join("");
      this.host.innerHTML = `<div class="core-fallback-scroll" tabindex="${this.cameraEnabled ? 0 : -1}" aria-label="Public Courts. Scroll for every card."><p class="core-fallback-note">Accessible table · ${view.deckCount ?? 0} cards in the draw pile. Scroll for all Courts and Played cards.</p>${pairs}${view.players.map((p, seat) => `<section class="core-fallback-court" data-fallback-seat="${seat}"><h3>${escapeHTML(p.name ?? p.dynasty)}${seat === view.active ? " · To act" : ""}</h3><div class="core-fallback-cards">${p.court.map((id) => cardButton(id, p.ruler)).join("")}</div><p>Played · returns to ${escapeHTML(p.name ?? p.dynasty)} next round</p><div class="core-fallback-cards">${p.played.map((id) => cardButton(id, null)).join("") || "<span>None</span>"}</div></section>`).join("")}</div>`;
      this.host
        .querySelectorAll<HTMLButtonElement>("[data-table-card]")
        .forEach((button) =>
          button.addEventListener("click", () =>
            this.onInspect(button.dataset.tableCard!),
          ),
        );
      return;
    }
    const faces = new Map(loaded);
    const old = this.positions;
    this.positions = new Map();
    this.clear();
    const columns = this.width < 700 ? 1 : 2,
      rows = Math.ceil(view.players.length / columns);
    const largestCourt = Math.max(
      1,
      ...view.players.map((p) => p.court.length),
    );
    const aspect = this.width / Math.max(1, this.height);
    // Keep groups of three on one physical row, and favor the host's broad aspect.
    const candidates = largestCourt <= 3 ? [largestCourt] : [3, 6, 9, 12, 15];
    const courtColumns = candidates.reduce((best, candidate) => {
      const score = (n: number) => {
        const sw = Math.max(510, n * 176 + 190);
        const sh = Math.max(318, Math.ceil(largestCourt / n) * 242 + 76);
        return Math.abs(
          Math.log((sw * columns + 160) / (sh * rows + 38) / aspect),
        );
      };
      return score(candidate) < score(best) ? candidate : best;
    }, candidates[0]);
    const maxRows = Math.max(
      1,
      ...view.players.map((p) => Math.ceil(p.court.length / courtColumns)),
    );
    const seatH = Math.max(318, maxRows * 242 + 76),
      seatW = Math.max(510, courtColumns * 176 + 190);
    this.boardW = seatW * columns + 80 + (columns - 1) * 80;
    this.boardH = seatH * rows + 38;
    this.seats = [];
    const wood = new THREE.Mesh(
      new THREE.ExtrudeGeometry(
        roundedShape(this.boardW + 30, this.boardH + 30, 32),
        {
          depth: 24,
          bevelEnabled: true,
          bevelThickness: 5,
          bevelSize: 5,
          bevelSegments: 3,
          steps: 1,
        },
      ),
      new THREE.MeshStandardMaterial({ color: 0x4f3524, roughness: 0.72 }),
    );
    wood.position.z = -38;
    wood.receiveShadow = true;
    this.content.add(wood);
    const bt = canvasTexture(boardCanvas(this.boardW, this.boardH));
    this.textures.push(bt);
    const board = new THREE.Mesh(
      surface(this.boardW, this.boardH, 28),
      new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 }),
    );
    board.position.z = -3;
    board.receiveShadow = true;
    this.content.add(board);
    const backing = canvasTexture(cardBackCanvas());
    this.textures.push(backing);
    for (let seat = 0; seat < view.players.length; seat++) {
      const p = view.players[seat],
        col = seat % columns,
        row =
          columns === 1
            ? (seat - (view.viewer ?? 0) - 1 + view.players.length) %
              view.players.length
            : Math.floor(seat / columns),
        cx = (col - (columns - 1) / 2) * (seatW + 80),
        cy = ((rows - 1) / 2 - row) * seatH;
      const courtCenter =
        cx -
        seatW / 2 +
        136 +
        ((Math.min(courtColumns, Math.max(1, p.court.length)) - 1) * 176) / 2;
      this.seats.push(new THREE.Vector3(courtCenter, cy + seatH / 2 - 159, 0));
      const seatLabel = this.label(
        `${p.name ?? p.dynasty[0].toUpperCase() + p.dynasty.slice(1)}`,
        courtCenter,
        cy + seatH / 2 - 15,
        9,
        "core-table-seat",
      );
      seatLabel.element.dataset.courtSeat = String(seat);
      seatLabel.element.tabIndex = -1;
      seatLabel.element.setAttribute(
        "aria-label",
        `${p.name ?? p.dynasty} Court`,
      );
      if (seat === (view.first ?? 0)) {
        const x = cx - seatW / 2 + 45,
          y = cy + seatH / 2 - 48;
        const token = new THREE.Mesh(
          new THREE.CylinderGeometry(25, 27, 5, 48),
          new THREE.MeshStandardMaterial({
            color: 0xd5b566,
            metalness: 0.55,
            roughness: 0.4,
          }),
        );
        token.rotation.x = Math.PI / 2;
        token.position.set(x, y, 3);
        token.castShadow = true;
        this.content.add(token);
        const emblem = this.label("1st", x, y, 6, "core-first-player");
        emblem.element.dataset.firstPlayer = String(seat);
        emblem.element.setAttribute("role", "img");
        emblem.element.setAttribute(
          "aria-label",
          `${p.name ?? p.dynasty} goes first this round`,
        );
        emblem.element.title = `${p.name ?? p.dynasty} goes first this round`;
      }
      const startX = cx - seatW / 2 + 136,
        startY = cy + seatH / 2 - 179;
      for (let i = 0; i < p.court.length; i++) {
        const id = p.court[i],
          x = startX + (i % courtColumns) * 176,
          y = startY - Math.floor(i / courtColumns) * 242;
        const texture = canvasTexture(faces.get(id)!);
        this.textures.push(texture);
        this.addCard(
          id,
          texture,
          x,
          y,
          10,
          160,
          old.get(id) ?? new THREE.Vector3(cx, cy - seatH / 2 + 20, 18),
        );
        const office =
          p.ruler === id
            ? "Ruler"
            : view.crown?.heir === id
              ? "Heir"
              : view.crown?.supporter === id
                ? "Supporter"
                : null;
        if (office) this.label(office, x, y - 126, 12, "core-table-office");
        const attemptedBy = Object.entries(view.attempts ?? {})
          .filter(([, targets]) => targets.includes(id))
          .map(([attacker]) => Number(attacker));
        attemptedBy.forEach((attacker, index) => {
          const token = new THREE.Mesh(
            new THREE.CylinderGeometry(11, 11, 3, 24),
            new THREE.MeshStandardMaterial({
              color: 0xd7ba78,
              metalness: 0.4,
              roughness: 0.55,
            }),
          );
          token.rotation.x = Math.PI / 2;
          token.position.set(x + 64, y + 82 - index * 26, 19);
          token.castShadow = true;
          this.content.add(token);
          const attempt = this.label(
            "×",
            x + 64,
            y + 82 - index * 26,
            22,
            "core-table-attempt",
          );
          attempt.element.setAttribute("role", "img");
          attempt.element.setAttribute(
            "aria-label",
            "Recall already attempted this round",
          );
          attempt.element.title = "Recall already attempted this round";
        });
      }
      if (!p.court.length)
        this.label("No ruler · recruit to recover", cx - 40, cy, 8);
      // Exact public Played cards remain inspectable in an offset pile.
      const px = cx + seatW / 2 - 75,
        py = cy - 17;
      if (p.played.length) {
        this.label("Played", px, py + 89, 8);
        this.label("Returns next round", px, py - 91, 8);
      }
      for (let i = 0; i < p.played.length; i++) {
        const id = p.played[i],
          t = canvasTexture(faces.get(id)!);
        this.textures.push(t);
        this.addCard(
          id,
          t,
          px + i * 2,
          py - i * 5,
          9 + i * 3.6,
          94,
          old.get(id) ?? new THREE.Vector3(cx, cy - seatH / 2 + 20, 18),
          seat,
        );
      }
    }
    const deckX = columns === 1 ? this.boardW / 2 - 55 : 0,
      deckY = columns === 1 ? 0 : 35;
    const deckCount = view.deckCount ?? 0;
    if (deckCount > 0)
      for (let i = 0; i < Math.min(deckCount, 5); i++) {
        const deck = this.stock(backing, 49);
        deck.position.set(deckX + i * 0.5, deckY, 5 + i * 3.6);
        this.content.add(deck);
      }
    this.label(`Draw · ${deckCount}`, deckX, deckY - 45, 8);
    const ct = canvasTexture(crownCanvas());
    this.textures.push(ct);
    const crown = this.stock(ct, 49);
    crown.position.set(columns === 1 ? deckX : 0, -this.boardH / 2 + 67, 12);
    this.content.add(crown);
    const crowned = view.crown;
    if (crowned) {
      const point = this.positions.get(
        crowned.stage === "reign" ? crowned.heir : crowned.oldRuler,
      );
      if (point) {
        crown.position.set(point.x + 44, point.y + 65, 27);
        crown.scale.setScalar(0.64);
      }
    }
    for (const pair of view.marriages ?? []) {
      const a = this.positions.get(pair.queen),
        b = this.positions.get(pair.spouse);
      if (a && b) {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(a.x, a.y - 72, 20),
          new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 - 130, 28),
          new THREE.Vector3(b.x, b.y - 72, 20),
        );
        const link = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 24, 2, 8, false),
          new THREE.MeshStandardMaterial({
            color: 0xd8ba6e,
            metalness: 0.7,
            roughness: 0.35,
          }),
        );
        this.content.add(link);
      }
    }
    const lead = view.pending?.lead ?? view.pending?.card,
      target = view.pending?.target;
    if (lead && target) {
      const a = this.positions.get(lead),
        b = this.positions.get(target);
      if (a && b) {
        const dir = new THREE.Vector3().subVectors(b, a);
        const arrow = new THREE.ArrowHelper(
          dir.clone().normalize(),
          a.clone().setZ(40),
          dir.length(),
          0xefc567,
          20,
          11,
        );
        this.content.add(arrow);
      }
    }
    this.fit();
  }
  private stock(texture: THREE.Texture, w: number): THREE.Group {
    const h = (w * 88) / 63,
      g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.ExtrudeGeometry(roundedShape(w, h, w * 0.041), {
        depth: 2.4,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelThickness: 0.5,
        bevelSize: 0.5,
        steps: 1,
      }),
      new THREE.MeshStandardMaterial({ color: 0xe6d9bb, roughness: 0.72 }),
    );
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    const face = new THREE.Mesh(
      surface(w, h, w * 0.041),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.86,
        metalness: 0,
      }),
    );
    face.position.z = 3;
    face.receiveShadow = true;
    g.add(face);
    return g;
  }
  private addCard(
    id: string,
    texture: THREE.Texture,
    x: number,
    y: number,
    z: number,
    w: number,
    from: THREE.Vector3,
    playedSeat?: number,
  ) {
    const mesh = this.stock(texture, w),
      to = new THREE.Vector3(x, y, z);
    mesh.position.copy(this.reduced ? to : from);
    this.content.add(mesh);
    this.positions.set(id, to);
    const card = BY_ID[id],
      button = document.createElement("button");
    button.className = "core-table-card";
    button.dataset.tableCard = id;
    if (playedSeat !== undefined)
      button.dataset.playedPile = String(playedSeat);
    button.setAttribute(
      "aria-label",
      playedSeat === undefined
        ? `Inspect ${card.name}, ${card.dynasty}, rank ${rankLabel(card.rank)}`
        : `Fan out ${this.view?.players[playedSeat].name ?? card.dynasty} Played pile`,
    );
    button.style.width = `${w}px`;
    button.style.height = `${(w * 88) / 63}px`;
    button.addEventListener("click", () => this.onInspect(id));
    button.addEventListener("focus", () => {
      if (button.classList.contains("valid-drop")) return;
      if (!this.cameraEnabled) return;
      this.wantedTarget.copy(to);
      const fov = THREE.MathUtils.degToRad(this.camera.fov);
      this.wantedDistance =
        Math.max(
          310 / (2 * Math.tan(fov / 2)),
          240 / (2 * Math.tan(fov / 2) * this.camera.aspect),
        ) * 1.08;
    });
    const hit = new CSS3DObject(button);
    hit.position.copy(mesh.position).add(new THREE.Vector3(0, 0, 4));
    this.labelScene.add(hit);
    this.pieces.push({
      mesh,
      hit,
      from: from.clone(),
      to,
      time: performance.now(),
    });
  }
  private tick = () => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.tick);
    const speed = this.reduced ? 1 : 0.16;
    this.distance = THREE.MathUtils.lerp(
      this.distance,
      this.wantedDistance,
      speed,
    );
    this.target.lerp(this.wantedTarget, speed);
    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * this.distance * 0.4,
      this.target.y - this.distance * Math.sin(this.tilt),
      this.distance * Math.cos(this.tilt),
    );
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.target);
    const now = performance.now();
    for (const p of this.pieces) {
      const t = this.reduced ? 1 : Math.min(1, (now - p.time) / 650),
        e = t * t * (3 - 2 * t);
      p.mesh.position.lerpVectors(p.from, p.to, e);
      if (p.from.distanceToSquared(p.to) > 1)
        p.mesh.position.z += Math.sin(Math.PI * t) * 45;
      p.hit.position.copy(p.mesh.position).add(new THREE.Vector3(0, 0, 4));
    }
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.labelScene, this.camera);
  };
  dispose() {
    this.disposed = true;
    this.generation++;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.host.removeEventListener("pointerdown", this.down);
    this.host.removeEventListener("pointermove", this.move);
    this.host.removeEventListener("pointerup", this.up);
    this.host.removeEventListener("pointercancel", this.up);
    this.host.removeEventListener("wheel", this.wheel);
    this.host.removeEventListener("keydown", this.keys);
    this.clear();
    this.renderer?.dispose();
    this.host.replaceChildren();
  }
}
