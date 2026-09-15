import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { cardFace } from "./cards";
import { type Duel, type Moment } from "./duel";
import { house } from "./content";

interface Piece {
  object: CSS3DObject;
  shadow: THREE.Mesh;
  signature: string;
  home: THREE.Vector3;
}
interface Tween {
  start: number;
  duration: number;
  update: (t: number) => void;
  done: () => void;
}
export class Battlefield {
  private renderer: THREE.WebGLRenderer | null = null;
  private css: CSS3DRenderer;
  private scene = new THREE.Scene();
  private cards = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(39, 1, 1, 5000);
  private pieces = new Map<string, Piece>();
  private tweens: Tween[] = [];
  private frame = 0;
  private resize: ResizeObserver;
  private disposed = false;
  private sparks: THREE.Points;
  private clock = new THREE.Clock();
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private reduced = false;
  private glow: THREE.PointLight;
  private size = { w: 0, h: 0 };
  private fallback = false;
  private plaques = new Map<number, CSS3DObject>();
  private bonds: THREE.Line[] = [];
  private anchors = new Map<string, THREE.Vector3>();
  private textures: THREE.Texture[] = [];
  constructor(private container: HTMLElement) {
    this.css = new CSS3DRenderer();
    this.css.domElement.className = "card-scene";
    this.css.domElement.style.overflow = "clip";
    this.css.domElement.style.pointerEvents = "none";
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setClearColor(0x080e13, 0);
      this.renderer.domElement.className = "world-scene";
      container.append(this.renderer.domElement);
    } catch {
      this.fallback = true;
      container.classList.add("flat-table");
    }
    container.append(this.css.domElement);
    this.scene.fog = new THREE.FogExp2(0x091014, 0.00055);
    const ambient = new THREE.HemisphereLight(0xb9d7ed, 0x49351f, 2.6);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffdda4, 3.7);
    sun.position.set(-400, 950, 350);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -1000;
    sun.shadow.camera.right = 1000;
    sun.shadow.camera.top = 800;
    sun.shadow.camera.bottom = -800;
    sun.shadow.camera.far = 2200;
    sun.shadow.bias = -0.002;
    this.scene.add(sun);
    this.glow = new THREE.PointLight(0x63b6d5, 140000, 1500);
    this.glow.position.set(550, 160, -200);
    this.scene.add(this.glow);
    const wood = new THREE.MeshStandardMaterial({
      color: 0x1b292c,
      roughness: 0.48,
      metalness: 0.35,
    });
    this.materials.push(wood);
    const geometry = new THREE.BoxGeometry(1390, 35, 870);
    this.geometries.push(geometry);
    const table = new THREE.Mesh(geometry, wood);
    table.position.y = -30;
    table.receiveShadow = true;
    this.scene.add(table);
    const surfaceTexture = new THREE.TextureLoader().load("/art/v2-table.webp");
    this.textures.push(surfaceTexture);
    surfaceTexture.colorSpace = THREE.SRGBColorSpace;
    surfaceTexture.anisotropy =
      this.renderer?.capabilities.getMaxAnisotropy() ?? 1;
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      map: surfaceTexture,
      roughness: 0.8,
      metalness: 0.12,
      color: 0xd7d8c7,
    });
    this.materials.push(surfaceMaterial);
    const surfaceGeo = new THREE.PlaneGeometry(1380, 860);
    this.geometries.push(surfaceGeo);
    const surface = new THREE.Mesh(surfaceGeo, surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = -11;
    surface.receiveShadow = true;
    this.scene.add(surface);
    const gold = new THREE.MeshStandardMaterial({
      color: 0xa17f43,
      metalness: 0.85,
      roughness: 0.32,
    });
    this.materials.push(gold);
    for (const z of [-440, 440]) {
      const geo = new THREE.BoxGeometry(1420, 20, 12);
      this.geometries.push(geo);
      const rail = new THREE.Mesh(geo, gold);
      rail.position.set(0, -8, z);
      this.scene.add(rail);
    }
    for (const x of [-704, 704]) {
      const geo = new THREE.BoxGeometry(12, 20, 890);
      this.geometries.push(geo);
      const rail = new THREE.Mesh(geo, gold);
      rail.position.set(x, -8, 0);
      this.scene.add(rail);
    }
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xa58957,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    this.materials.push(ringMaterial);
    for (const radius of [140, 160, 360, 374]) {
      const geo = new THREE.RingGeometry(radius, radius + 1.5, 96);
      this.geometries.push(geo);
      const ring = new THREE.Mesh(geo, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -10;
      this.scene.add(ring);
    }
    for (let i = 0; i < 5; i++)
      for (const side of [-1, 1]) {
        const geo = new THREE.PlaneGeometry(142, 201);
        this.geometries.push(geo);
        const mat = new THREE.MeshBasicMaterial({
          color: side === 1 ? 0x78beb3 : 0xc98a74,
          transparent: true,
          opacity: 0.09,
          side: THREE.DoubleSide,
        });
        this.materials.push(mat);
        const slot = new THREE.Mesh(geo, mat);
        slot.rotation.x = -Math.PI / 2;
        slot.position.set((i - 2) * 163, -9, side * 166);
        this.scene.add(slot);
      }
    const positions = new Float32Array(65 * 3);
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1400;
      positions[i + 1] = Math.random() * 160;
      positions[i + 2] = (Math.random() - 0.5) * 700;
    }
    const particles = new THREE.BufferGeometry();
    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometries.push(particles);
    const dust = new THREE.PointsMaterial({
      color: 0xe8c07b,
      size: 2.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.materials.push(dust);
    this.sparks = new THREE.Points(particles, dust);
    this.scene.add(this.sparks);
    this.resize = new ResizeObserver(() => this.measure());
    this.resize.observe(container);
    this.measure();
    this.tick();
  }
  private measure() {
    const w = this.container.clientWidth,
      h = this.container.clientHeight;
    if (!w || !h) return;
    this.size = { w, h };
    this.camera.aspect = w / h;
    const distance = 1300,
      angle = h < 220 ? 0.38 : 0.76;
    this.camera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(((h / w) * 1410) / (2 * distance)),
    );
    this.camera.position.set(
      0,
      Math.sin(angle) * distance,
      Math.cos(angle) * distance,
    );
    this.camera.lookAt(0, 25, 0);
    this.camera.updateProjectionMatrix();
    for (const p of this.pieces.values())
      p.object.rotation.x = h < 220 ? -1.38 : -1.13;
    this.css.setSize(w, h);
    this.renderer?.setSize(w, h, false);
  }
  setMotion(on: boolean) {
    this.reduced = !on;
  }
  sync(g: Duel, selected: string | null, targets: string[] = [], viewer = 0) {
    const living = new Set<string>();
    for (const bond of this.bonds) {
      this.scene.remove(bond);
      bond.geometry.dispose();
      (bond.material as THREE.Material).dispose();
    }
    this.bonds = [];
    for (const p of g.players) {
      let plaque = this.plaques.get(p.id);
      if (!plaque) {
        const el = document.createElement("div");
        el.className = "court-plaque";
        plaque = new CSS3DObject(el);
        plaque.element.style.pointerEvents = "none";
        this.cards.add(plaque);
        this.plaques.set(p.id, plaque);
      }
      const opponents = g.players.filter((q) => q.id !== viewer),
        index = opponents.findIndex((q) => q.id === p.id);
      const center =
        (index - (opponents.length - 1) / 2) *
        (g.players.length === 3 ? 560 : 420);
      plaque.element.innerHTML = `<b>${p.id === viewer ? "YOUR " : ""}${house(p.house).name.toUpperCase()}</b><span>${p.hand.length} CONCEALED · ${p.court.length} EXPOSED</span>`;
      plaque.element.style.color = house(p.house).color;
      plaque.rotation.x = -0.5;
      plaque.position.set(
        p.id === viewer ? 0 : center,
        p.id === viewer ? 20 : 65,
        p.id === viewer ? 30 : -320,
      );
      plaque.scale.setScalar(p.id === viewer ? 1 : 0.8);
      for (const key of ["crown", "estate", "hand"])
        this.anchors.set(
          `${key}-${p.id}`,
          new THREE.Vector3(
            p.id === viewer ? 0 : center,
            40,
            p.id === viewer ? 280 : -240,
          ),
        );
    }
    for (const p of g.players)
      for (let i = 0; i < p.court.length; i++) {
        const r = p.court[i];
        living.add(r.uid);
        const opponents = g.players.filter((p) => p.id !== viewer),
          index = opponents.findIndex((q) => q.id === p.id);
        const scale =
          p.id === viewer
            ? 1
            : g.players.length === 2
              ? 1
              : g.players.length === 3
                ? 0.73
                : 0.57;
        const center =
          (index - (opponents.length - 1) / 2) *
          (g.players.length === 3 ? 560 : 420);
        const home = new THREE.Vector3(
          p.id === viewer ? (i - 2) * 163 : center + (i - 2) * 163 * scale,
          30,
          p.id === viewer ? 167 : -185,
        );
        const signature = JSON.stringify([
          r,
          p.house,
          selected === r.uid,
          targets.includes(r.uid),
          p.court.map((c) => c.uid),
        ]);
        let piece = this.pieces.get(r.uid);
        if (!piece) {
          const el = document.createElement("div");
          el.className = "piece-container";
          el.style.width = "140px";
          el.style.height = "201px";
          el.style.pointerEvents = "auto";
          const object = new CSS3DObject(el);
          object.rotation.x = this.size.h < 220 ? -1.38 : -1.13;
          object.position.copy(home);
          this.cards.add(object);
          const geo = new THREE.PlaneGeometry(142, 202);
          this.geometries.push(geo);
          const mat = new THREE.MeshStandardMaterial({
            color: 0x131914,
            roughness: 0.5,
            metalness: 0.3,
            side: THREE.DoubleSide,
          });
          this.materials.push(mat);
          const shadow = new THREE.Mesh(geo, mat);
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.set(home.x, 4, home.z);
          shadow.castShadow = true;
          shadow.receiveShadow = true;
          this.scene.add(shadow);
          piece = { object, shadow, home, signature: "" };
          this.pieces.set(r.uid, piece);
        }
        piece.home.copy(home);
        piece.object.position.copy(home);
        piece.object.scale.setScalar(scale);
        piece.shadow.scale.setScalar(scale);
        piece.shadow.position.set(home.x, 4, home.z);
        piece.object.element.dataset.owner = String(p.id);
        if (piece.signature !== signature) {
          piece.object.element.innerHTML = cardFace(r, {
            owner: p,
            zone: "court",
            selected: selected === r.uid,
            target: targets.includes(r.uid),
          });
          piece.object.element.setAttribute("data-owner", String(p.id));
          piece.signature = signature;
        }
      }
    for (const [id, p] of this.pieces)
      if (!living.has(id)) {
        this.cards.remove(p.object);
        p.object.element.remove();
        this.scene.remove(p.shadow);
        p.shadow.geometry.dispose();
        (p.shadow.material as THREE.Material).dispose();
        this.pieces.delete(id);
      }
    for (const p of g.players)
      for (const r of p.court) {
        if (!r.marriedTo) continue;
        const from = this.pieces.get(r.marriedTo)?.home,
          to = this.pieces.get(r.uid)?.home;
        if (!from || !to) continue;
        const middle = from.clone().lerp(to, 0.5);
        middle.y += 110;
        const points = new THREE.QuadraticBezierCurve3(
          from,
          middle,
          to,
        ).getPoints(24);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0xdbc28f,
          transparent: true,
          opacity: 0.7,
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.bonds.push(line);
      }
  }
  private location(id?: string) {
    if (id && this.pieces.has(id)) return this.pieces.get(id)!.home.clone();
    return this.anchors.get(id ?? "")?.clone() ?? new THREE.Vector3(0, 40, 0);
  }
  private tween(duration: number, update: (t: number) => void) {
    return new Promise<void>((done) => {
      if (this.reduced || this.disposed) {
        update(1);
        done();
        return;
      }
      this.tweens.push({ start: performance.now(), duration, update, done });
    });
  }
  async animate(e: Moment) {
    const piece = e.source ? this.pieces.get(e.source) : null;
    if (["deploy", "marry"].includes(e.kind) && piece) {
      const scale = piece.object.scale.x,
        end = piece.home.clone(),
        start = end
          .clone()
          .add(new THREE.Vector3(0, 160, e.actor === 0 ? 350 : -350));
      await this.tween(620, (t) => {
        const u = 1 - Math.pow(1 - t, 3);
        piece.object.position.lerpVectors(start, end, u);
        piece.object.rotation.z = (1 - u) * 0.35;
        piece.object.scale.setScalar(scale * (0.7 + 0.3 * u));
      });
    } else if (e.kind === "challenge" && piece) {
      const start = piece.home.clone();
      await this.tween(
        350,
        (t) => (piece.object.position.y = start.y + Math.sin(t * Math.PI) * 45),
      );
    } else if (["combat", "crown-hit", "raid"].includes(e.kind) && piece) {
      const end = this.location(e.target),
        start = piece.home.clone();
      await this.tween(620, (t) => {
        const u = Math.sin(t * Math.PI);
        piece.object.position.lerpVectors(start, end, u * 0.85);
        piece.object.position.y += Math.sin(t * Math.PI) * 130;
        piece.object.rotation.z = Math.sin(t * Math.PI) * 0.15;
      });
      piece.object.position.copy(start);
    } else if (e.kind === "capture") {
      const captured = e.source ? this.pieces.get(e.source) : null;
      if (captured) {
        const start = captured.home.clone(),
          end = new THREE.Vector3(0, 200, e.actor === 0 ? 600 : -600);
        await this.tween(570, (t) => {
          captured.object.position.lerpVectors(start, end, t);
          captured.object.rotation.y = t * Math.PI;
          captured.object.scale.setScalar(1 - t * 0.5);
        });
      }
    } else if (e.kind === "defeat") {
      const victim = e.target ? this.pieces.get(e.target) : null;
      if (victim)
        await this.tween(420, (t) => {
          victim.object.position.y = victim.home.y + t * 100;
          victim.object.rotation.z = t * 0.5;
          victim.object.element.style.opacity = String(1 - t);
        });
    }
    if (
      [
        "combat",
        "ambush",
        "crown-hit",
        "brace",
        "claim",
        "fortify",
        "history",
        "capture",
      ].includes(e.kind)
    ) {
      const at = this.location(e.target);
      const geo = new THREE.RingGeometry(15, 23, 40);
      const mat = new THREE.MeshBasicMaterial({
        color: ["brace", "fortify"].includes(e.kind)
          ? 0x87deff
          : e.kind === "claim"
            ? 0xffd37a
            : 0xff8c68,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: false,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.position.copy(at);
      ring.position.y = 55;
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      const label = document.createElement("div");
      label.className = "impact-number";
      label.textContent =
        e.amount === undefined
          ? ""
          : e.kind === "brace"
            ? `BLOCK ${e.amount}`
            : `−${e.amount}`;
      const popup = new CSS3DObject(label);
      popup.element.style.pointerEvents = "none";
      popup.position.copy(at);
      popup.position.y = 100;
      this.cards.add(popup);
      await this.tween(430, (t) => {
        ring.scale.setScalar(1 + t * 7);
        mat.opacity = 1 - t;
        popup.position.y = 100 + t * 70;
        label.style.opacity = String(1 - t);
      });
      this.cards.remove(popup);
      label.remove();
      this.scene.remove(ring);
      geo.dispose();
      mat.dispose();
    }
  }
  private tick = () => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.tick);
    const now = performance.now();
    for (const t of [...this.tweens]) {
      const progress = Math.min(1, (now - t.start) / t.duration);
      t.update(progress);
      if (progress === 1) {
        this.tweens = this.tweens.filter((x) => x !== t);
        t.done();
      }
    }
    if (!this.reduced) {
      this.sparks.rotation.y =
        Math.sin(this.clock.getElapsedTime() * 0.045) * 0.04;
      this.glow.intensity = 140000 + Math.sin(now * 0.002) * 15000;
    }
    this.renderer?.render(this.scene, this.camera);
    this.css.render(this.cards, this.camera);
  };
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resize.disconnect();
    this.tweens.forEach((t) => t.done());
    this.tweens = [];
    this.pieces.forEach((p) => p.object.element.remove());
    this.materials.forEach((m) => m.dispose());
    this.geometries.forEach((g) => g.dispose());
    this.textures.forEach((t) => t.dispose());
    this.bonds.forEach((b) => {
      b.geometry.dispose();
      (b.material as THREE.Material).dispose();
    });
    this.renderer?.dispose();
    this.container.innerHTML = "";
  }
}
