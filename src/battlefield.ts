import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { cardFace, esc } from "./cards";
import { spec, type Duel, type Moment } from "./duel";
import { house, card } from "./content";

/** One camera and one world coordinate system for board, components and crisp printed faces. */
export class Battlefield {
  private scene = new THREE.Scene();
  private print = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.1, 150);
  private gl: THREE.WebGLRenderer;
  private css = new CSS3DRenderer();
  private pieces = new THREE.Group();
  private resize: ResizeObserver;
  private frame = 0;
  private reduced = false;
  private disposed = false;
  private figures = new Map<
    string,
    { body: THREE.Group; face: CSS3DObject; y: number; angle: number }
  >();
  private hovered: string | null = null;
  private viewSeat: number | null = null;
  private seats = new Map<number, THREE.Vector3>();
  private closeDistance = new Map<number, number>();
  private lastLesson = 0;
  private nav = document.createElement("nav");
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private gold = new THREE.MeshStandardMaterial({
    color: 0xc4a363,
    metalness: 0.72,
    roughness: 0.3,
  });
  private ivory = new THREE.MeshStandardMaterial({
    color: 0xdfcfaa,
    roughness: 0.8,
  });
  private wood = new THREE.MeshStandardMaterial({
    color: 0x211714,
    roughness: 0.6,
    metalness: 0.1,
  });
  constructor(private container: HTMLElement) {
    container.className = "arena physical-world";
    this.gl = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.gl.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.35;
    this.css.domElement.className = "world-print";
    this.nav.className = "board-view-controls";
    this.nav.setAttribute("aria-label", "Board camera");
    container.append(this.gl.domElement, this.css.domElement, this.nav);
    this.nav.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-camera-seat]",
      );
      if (!b) return;
      this.viewSeat =
        b.dataset.cameraSeat === "all" ? null : Number(b.dataset.cameraSeat);
      this.fit();
    });
    this.scene.add(new THREE.HemisphereLight(0xdde9ef, 0x403020, 2.7));
    const key = new THREE.DirectionalLight(0xffd6a0, 4.2);
    key.position.set(-7, 15, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -18,
      right: 18,
      top: 14,
      bottom: -14,
      far: 50,
    });
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.035;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x7ea7c0, 1.6);
    fill.position.set(12, 8, -6);
    this.scene.add(fill);
    const tex = new THREE.TextureLoader().load("/art/v2-table.webp");
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.gl.capabilities.getMaxAnisotropy();
    this.textures.add(tex);
    this.box(33.2, 0.65, 19, 0, -0.5, 0, this.wood);
    this.box(32.8, 0.12, 18.6, 0, -0.12, 0, this.gold);
    const board = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.72,
      metalness: 0.14,
    });
    this.materials.add(board);
    this.box(32.4, 0.16, 18.2, 0, -0.04, 0, board);
    this.scene.add(this.pieces);
    this.resize = new ResizeObserver(this.fit);
    this.resize.observe(container);
    this.fit();
    this.tick();
    if (container.clientWidth < 760)
      container.scrollLeft = (760 - container.clientWidth) / 2;
  }
  private box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    group: THREE.Object3D = this.scene,
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }
  private fit = () => {
    const w = Math.max(760, this.container.clientWidth),
      h = this.container.clientHeight;
    if (!w || !h) return;
    this.gl.setSize(w, h);
    this.css.setSize(w, h);
    this.camera.aspect = w / h;
    const center =
      this.viewSeat === null
        ? new THREE.Vector3(0, 0, 0.3)
        : (this.seats.get(this.viewSeat) ?? new THREE.Vector3());
    const distance =
      this.viewSeat === null
        ? Math.max(23, 45 / this.camera.aspect)
        : Math.max(
            this.closeDistance.get(this.viewSeat) ?? 15,
            ((this.closeDistance.get(this.viewSeat) ?? 15) * 1.7) /
              this.camera.aspect,
          );
    this.camera.position.set(center.x, distance, center.z + distance * 0.57);
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();
    this.nav
      .querySelectorAll<HTMLElement>("[data-camera-seat]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(
            b.dataset.cameraSeat ===
              (this.viewSeat === null ? "all" : String(this.viewSeat)),
          ),
        ),
      );
  };
  private tick = () => {
    if (this.disposed) return;
    for (const [uid, p] of this.figures) {
      const lift = uid === this.hovered ? 0.42 : 0.085;
      p.body.position.y +=
        (lift - p.body.position.y) * (this.reduced ? 1 : 0.18);
      p.face.position.copy(p.body.position);
      p.face.position.y += 0.036;
      p.face.rotation.set(-Math.PI / 2, 0, -p.angle);
    }
    this.gl.render(this.scene, this.camera);
    this.css.render(this.print, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };
  private label(html: string, x: number, z: number, width = 760) {
    const el = document.createElement("div");
    el.className = "board-engraving";
    el.innerHTML = html;
    el.style.width = width + "px";
    const o = new CSS3DObject(el);
    o.scale.setScalar(0.006);
    o.rotation.x = -Math.PI / 2;
    o.position.set(x, 0.12, z);
    this.print.add(o);
  }
  private token(
    x: number,
    z: number,
    text: string,
    color = "#c3a566",
    size = 0.42,
  ) {
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.5,
      roughness: 0.36,
    });
    this.materials.add(mat);
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(size, size, 0.13, 32),
      mat,
    );
    m.position.set(x, 0.18, z);
    m.castShadow = true;
    this.pieces.add(m);
    this.label(`<span class="token-inscription">${text}</span>`, x, z, 130);
  }
  private crown(
    x: number,
    z: number,
    id: number,
    stability: number,
    target: boolean,
  ) {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.53, 0.61, 0.19, 40),
      this.gold,
    );
    base.position.set(x, 0.24, z);
    base.castShadow = true;
    this.pieces.add(base);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.07, 10, 40),
      this.gold,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.58, z);
    this.pieces.add(ring);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.105, 0.5, 5),
        this.gold,
      );
      tip.position.set(x + Math.cos(a) * 0.45, 0.61, z + Math.sin(a) * 0.45);
      tip.castShadow = true;
      this.pieces.add(tip);
    }
    this.label(
      `<button class="board-crown ${target ? "targetable" : ""}" data-target="crown-${id}" aria-label="Crown, ${stability} stability">${stability}<small>CROWN</small></button>`,
      x,
      z + 0.9,
      220,
    );
  }
  setMotion(on: boolean) {
    this.reduced = !on;
  }
  sync(g: Duel, selected: string | null, targets: string[] = [], viewer = 0) {
    this.pieces.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.pieces.clear();
    for (const o of [...this.print.children]) {
      if (o instanceof CSS3DObject) o.element.remove();
      this.print.remove(o);
    }
    for (const m of this.materials) {
      if (!(m as THREE.MeshStandardMaterial).map) {
        m.dispose();
        this.materials.delete(m);
      }
    }
    this.figures.clear();
    const rivals = g.players.filter((p) => p.id !== viewer);
    const ordered = [...rivals, g.players[viewer]];
    this.nav.innerHTML = `<span>VIEW</span><button data-camera-seat="all">Board</button>${[g.players[viewer], ...rivals].map((p) => `<button data-camera-seat="${p.id}">${p.id === viewer ? "Your court" : house(p.house).name}</button>`).join("")}`;
    this.seats.clear();
    if (g.lesson !== this.lastLesson) {
      this.viewSeat = g.mode === "lesson" && g.lesson === 1 ? viewer : null;
      this.lastLesson = g.lesson;
    }
    for (const p of ordered) {
      const own = p.id === viewer,
        n = rivals.length,
        index = rivals.indexOf(p);
      const cx = own ? 0 : (index - (n - 1) / 2) * (n === 3 ? 10.4 : 14.7);
      const cz = own ? 5.1 : -4.3;
      const width = 2.45;
      const step = own ? 3.75 : 3.5,
        total = 5 * step;
      this.seats.set(p.id, new THREE.Vector3(cx, 0, own ? cz : cz + 0.8));
      this.closeDistance.set(
        p.id,
        p.court.length <= 2 ? 9 : p.court.length <= 3 ? 12 : 15,
      );
      this.label(
        `<b>${esc(house(p.house).name.toUpperCase())}</b><span>${own ? "YOUR COURT" : "RIVAL HOUSE"} · ${p.court.length}/5 ROYALS</span>`,
        cx,
        cz - 2.3,
      );
      p.court.forEach((r, i) => {
        const count = p.court.length;
        const row = own ? 0 : Math.floor(i / 3),
          rowCount = own ? count : Math.min(3, count - row * 3);
        const x = cx + ((own ? i : i % 3) - (rowCount - 1) / 2) * step;
        const cardZ = cz + row * 4;
        const body = new THREE.Group();
        body.position.set(x, 0.085, cardZ);
        this.pieces.add(body);
        const angle = r.ready ? 0 : Math.PI / 2;
        this.box(width, 0.055, (width * 88) / 63, 0, 0, 0, this.ivory, body);
        body.rotation.y = angle;
        const wrapper = document.createElement("div");
        wrapper.className = "physical-card";
        wrapper.dataset.owner = String(p.id);
        wrapper.style.width = "630px";
        wrapper.style.height = "880px";
        wrapper.innerHTML = cardFace(r, {
          owner: p,
          zone: "court",
          selected: selected === r.uid,
          target: targets.includes(r.uid),
        });
        wrapper.addEventListener("pointerenter", () => {
          this.hovered = r.uid;
        });
        wrapper.addEventListener("pointerleave", () => {
          this.hovered = null;
        });
        wrapper.addEventListener("focusin", () => {
          this.hovered = r.uid;
        });
        wrapper.addEventListener("focusout", () => {
          this.hovered = null;
        });
        const face = new CSS3DObject(wrapper);
        face.scale.setScalar(width / 630);
        face.rotation.set(-Math.PI / 2, 0, -angle);
        face.position.copy(body.position);
        face.position.y += 0.036;
        this.print.add(face);
        this.figures.set(r.uid, { body, face, y: 0.085, angle });
        if (r.hp < spec(r).resolve)
          this.token(
            x + width * 0.36,
            cardZ + width * 0.54,
            `−${spec(r).resolve - r.hp}`,
            "#973c32",
            0.27,
          );
        if (r.marriedTo)
          this.label(
            `<span class="marriage-inscription" title="Married to ${esc(card(p.court.find((q) => q.uid === r.marriedTo)?.card ?? r.card).name)}">∞</span>`,
            x,
            cardZ + width * 0.8,
            150,
          );
      });
      const side = own ? -11.2 : cx - 4;
      this.crown(
        side,
        own ? cz : cz + 4,
        p.id,
        p.stability,
        targets.includes("crown-" + p.id),
      );
      this.token(own ? 11.2 : cx + 4, own ? cz + 0.7 : cz + 4, String(p.gold));
      if (p.shield)
        this.token(side, cz + 1.7, "⛨ " + p.shield, "#7293a5", 0.34);
      if (p.claim)
        this.label(
          `<span class="claim-inscription">CLAIM · ${p.challengers.map((id) => house(g.players[id].house).name).join(" · ")}</span>`,
          cx,
          cz + 2.05,
        );
      for (let e = 0; e < p.estates; e++) {
        const ex = (own ? 10 : cx + 3.7) + e * 0.48;
        this.box(0.36, 0.36, 0.4, ex, 0.25, cz - 0.25, this.ivory, this.pieces);
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(0.36, 0.32, 4),
          this.gold,
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.set(ex, 0.57, cz - 0.25);
        this.pieces.add(roof);
        this.label(
          `<button class="board-estate ${targets.includes("estate-" + p.id) ? "targetable" : ""}" data-target="estate-${p.id}" aria-label="${house(p.house).name} estate">+2</button>`,
          ex,
          cz + 0.3,
          110,
        );
      }
      if (!own && p.hand.length)
        this.label(
          `<span class="concealed-cards">${Array.from({ length: Math.min(p.hand.length, 7) }, () => "<i>♛</i>").join("")}</span><span>${p.hand.length} CONCEALED</span>`,
          cx,
          cz - 3.05,
        );
    }
    for (const p of g.players)
      for (const r of p.court) {
        if (!r.marriedTo || r.uid > r.marriedTo) continue;
        const a = this.figures.get(r.uid)?.body.position,
          b = this.figures.get(r.marriedTo)?.body.position;
        if (a && b) {
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(a.x, 0.16, a.z),
            new THREE.Vector3((a.x + b.x) / 2, 0.16, Math.max(a.z, b.z) + 1.8),
            new THREE.Vector3(b.x, 0.16, b.z),
          );
          const link = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 24, 0.045, 6, false),
            this.gold,
          );
          this.pieces.add(link);
        }
      }
    for (const [i, label] of ["DRAW", "DISCARD"].entries()) {
      const p = g.players[viewer],
        count = i ? p.discard.length : p.deck.length,
        x = 12.5 + i * 1.6,
        z = 5.1;
      for (let j = 0; j < Math.min(5, count); j++)
        this.box(
          1.2,
          0.035,
          1.68,
          x,
          0.09 + j * 0.04,
          z,
          this.ivory,
          this.pieces,
        );
      this.label(
        `<button class="physical-pile ${count ? "" : "empty"}" data-pile="${i ? "discard" : "deck"}">♛<small>${label} ${count}</small></button>`,
        x,
        z,
        205,
      );
    }
    for (let i = 0; i < 2; i++)
      this.token(
        -12 + i * 1.05,
        7,
        String(i + 1),
        g.turn === viewer && i < g.orders ? "#c3a566" : "#45443d",
        0.35,
      );
    this.fit();
  }
  async animate(e: Moment) {
    if (this.reduced || this.disposed) return;
    const p = this.figures.get(
      (e.kind === "defeat" ? e.target : e.source) ?? "",
    );
    const impact =
      this.figures.get(e.target ?? "")?.body.position ??
      p?.body.position ??
      this.seats.get(e.actor);
    if (
      impact &&
      [
        "combat",
        "brace",
        "ambush",
        "claim",
        "capture",
        "deploy",
        "marry",
      ].includes(e.kind)
    )
      this.burst(impact, e.kind);
    if (!p) return;
    const from = p.body.position.clone(),
      target = this.figures.get(e.target ?? "")?.body.position;
    const duration = e.kind === "combat" ? 560 : 420,
      start = performance.now();
    await new Promise<void>((resolve) => {
      const step = () => {
        if (this.disposed) {
          resolve();
          return;
        }
        const t = Math.min(1, (performance.now() - start) / duration),
          arc = Math.sin(t * Math.PI);
        if (target && e.kind === "combat") {
          p.body.position.x = from.x + (target.x - from.x) * arc * 0.65;
          p.body.position.z = from.z + (target.z - from.z) * arc * 0.65;
        } else p.body.position.z = from.z + arc * 0.5;
        p.body.position.y = 0.085 + arc * 0.6;
        if (t < 1) requestAnimationFrame(step);
        else {
          p.body.position.copy(from);
          resolve();
        }
      };
      step();
    });
  }
  private burst(at: THREE.Vector3, kind: string) {
    const group = new THREE.Group();
    group.position.set(at.x, 0.18, at.z);
    this.scene.add(group);
    const color =
      kind === "combat" || kind === "ambush"
        ? 0xde7650
        : kind === "brace"
          ? 0x87cddd
          : 0xf6d286;
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 0.85, 64),
      material,
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
    const sparks: THREE.Mesh[] = [];
    const dotGeometry = new THREE.SphereGeometry(0.025, 5, 4);
    for (let i = 0; i < 24; i++) {
      const dot = new THREE.Mesh(dotGeometry, material);
      group.add(dot);
      sparks.push(dot);
    }
    const start = performance.now();
    const update = () => {
      const t = Math.min(1, (performance.now() - start) / 700);
      ring.scale.setScalar(1 + t * 2);
      material.opacity = (1 - t) * 0.7;
      sparks.forEach((s, i) => {
        const a = (i * Math.PI * 2) / 24,
          spread = 0.5 + t * (1.2 + (i % 3) * 0.3);
        s.position.set(
          Math.cos(a) * spread,
          Math.sin(t * Math.PI) * (0.3 + (i % 4) * 0.12),
          Math.sin(a) * spread,
        );
      });
      if (t < 1 && !this.disposed) requestAnimationFrame(update);
      else {
        group.removeFromParent();
        ring.geometry.dispose();
        dotGeometry.dispose();
        material.dispose();
      }
    };
    update();
  }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resize.disconnect();
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.gold.dispose();
    this.ivory.dispose();
    this.wood.dispose();
    this.gl.dispose();
    this.container.innerHTML = "";
  }
}
