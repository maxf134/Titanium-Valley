import * as THREE from 'three';
import { makeTextSprite } from './world.js';
import { GROUPS } from './physics.js';

const PRODUCT_SCALE = 4;
const PRODUCT_HOVER_HEIGHT = 1.6; // высота над подиумом

/* =========================================================
   NPC (без физики — просто стоит)
   ========================================================= */
export class NPC {
  constructor(scene, { position, name, lines, accent = 0x4a90d9 }) {
    this.type = 'npc';
    this.name = name;
    this.lines = lines;
    this.radius = 3.6;
    this._t = Math.random() * 10;

    this.group = new THREE.Group();
    this.group.position.copy(position);

    const skinMat  = new THREE.MeshStandardMaterial({ color: 0xffd7a8, roughness: 0.9 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.65 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x263445, roughness: 0.85 });
    const helmetMat= new THREE.MeshStandardMaterial({ color: 0xffc93c, roughness: 0.35, metalness: 0.4 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.62, 6, 12), shirtMat);
    body.position.y = 1.18; body.castShadow = true;
    this.group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 18), skinMat);
    head.position.y = 1.88; head.castShadow = true;
    this.group.add(head);

    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), helmetMat);
    helmet.position.y = 1.9;
    this.group.add(helmet);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 18), helmetMat);
    brim.position.y = 1.92;
    this.group.add(brim);

    const armGeo = new THREE.CapsuleGeometry(0.1, 0.45, 4, 8);
    const armL = new THREE.Mesh(armGeo, shirtMat);
    armL.position.set(-0.44, 1.3, 0);
    this.group.add(armL);
    const armR = armL.clone(); armR.position.x = 0.44;
    this.group.add(armR);

    const legGeo = new THREE.CapsuleGeometry(0.12, 0.5, 4, 8);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.15, 0.5, 0);
    this.group.add(legL);
    const legR = legL.clone(); legR.position.x = 0.15;
    this.group.add(legR);

    const markerTex = makeMarkerTexture();
    this.marker = new THREE.Sprite(new THREE.SpriteMaterial({
      map: markerTex, transparent: true, depthTest: false,
    }));
    this.marker.scale.set(0.9, 0.9, 1);
    this.marker.position.y = 3.0;
    this.group.add(this.marker);

    const label = makeTextSprite(name, { fontSize: 38, scale: 0.9, color: '#cfe0ff' });
    label.position.y = 3.55;
    this.group.add(label);

    scene.add(this.group);
  }

  update(dt) {
    this._t += dt;
    this.marker.position.y = 3.0 + Math.sin(this._t * 3) * 0.13;
    this.marker.material.rotation = Math.sin(this._t * 1.5) * 0.12;
  }

  isInRange(playerPos) {
    const dx = this.group.position.x - playerPos.x;
    const dz = this.group.position.z - playerPos.z;
    return dx * dx + dz * dz < this.radius * this.radius;
  }
}

function makeMarkerTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 200, 70, 0.95)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 84px "Segoe UI", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 64, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* =========================================================
   LEVER
   ========================================================= */
export class Lever {
  constructor(scene, physics, { position, podiumPos, product, accent = 0xe89b3c, onActivate }) {
    this.type = 'lever';
    this.product = product;
    this.radius = 3.2;
    this.activated = false;
    this.onActivate = onActivate;
    this._t = Math.random() * 10;

    /* ---------- Рычаг ---------- */
    this.group = new THREE.Group();
    this.group.position.copy(position);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.5, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x3a4658, roughness: 0.6, metalness: 0.5 })
    );
    base.position.y = 0.25; base.castShadow = true; base.receiveShadow = true;
    this.group.add(base);

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 1.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x4d5b70, roughness: 0.5, metalness: 0.6 })
    );
    pillar.position.y = 1.15; pillar.castShadow = true;
    this.group.add(pillar);

    this.lampMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), this.lampMat);
    lamp.position.set(0, 1.55, 0.2);
    this.group.add(lamp);

    this.handle = new THREE.Group();
    this.handle.position.set(0, 1.85, 0);

    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.85, 10),
      new THREE.MeshStandardMaterial({ color: 0xc8d2de, roughness: 0.35, metalness: 0.8 })
    );
    stick.position.y = 0.4;
    this.handle.add(stick);

    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 14, 14),
      new THREE.MeshStandardMaterial({ color: accent, roughness: 0.35, metalness: 0.4,
                                       emissive: accent, emissiveIntensity: 0.25 })
    );
    knob.position.y = 0.85;
    this.handle.add(knob);

    this.handle.rotation.x = -0.7;
    this.group.add(this.handle);

    const label = makeTextSprite('РЫЧАГ', {
      fontSize: 34, scale: 0.8, color: '#ffd999', border: 'rgba(255,180,80,.7)'
    });
    label.position.y = 3.1;
    this.group.add(label);

    scene.add(this.group);

    // Рычаг — статичный коллайдер, сталкивается только с игроком
    physics.addStaticBox(
      { x: position.x, y: 0.25, z: position.z },
      { hx: 0.55, hy: 0.25, hz: 0.55 },
      GROUPS.LEVER
    );

    /* ---------- Подиум ---------- */
    this.spawnPos = new THREE.Vector3(position.x, 3.0, position.z);
    this._podium = null;

    if (podiumPos) {
      this._createPodium(scene, podiumPos);
      this.spawnPos.set(
        podiumPos.x,
        PRODUCT_HOVER_HEIGHT + 2.5, // висит над подиумом
        podiumPos.z
      );

      // Подиум — цилиндр-коллайдер, только для игрока
      physics.addStaticCylinder(
  { x: podiumPos.x, y: 0.25, z: podiumPos.z },
  { halfHeight: 0.25, radius: 2.0 },
  GROUPS.LEVER
);
    }

    this.spawnedMesh = null;
    this._spawnProgress = 0;
  }

  _createPodium(scene, pos) {
  const g = new THREE.Group();
  g.position.set(pos.x, 0, pos.z);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.2, 0.5, 40),
    new THREE.MeshStandardMaterial({ color: 0x4a566b, roughness: 0.6, metalness: 0.5 })
  );
  base.position.y = 0.25;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.07, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xffc466 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.52;
  g.add(ring);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.1, 12),
      new THREE.MeshBasicMaterial({ color: 0xffc466 })
    );
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(Math.cos(a) * 1.45, 0.51, Math.sin(a) * 1.45);
    g.add(dot);
  }

  scene.add(g);
  this._podium = g;
}

  update(dt) {
    this._t += dt;
    const targetRot = this.activated ? 0.75 : -0.7;
    this.handle.rotation.x += (targetRot - this.handle.rotation.x) * Math.min(1, dt * 7);
    this.lampMat.color.setHex(this.activated ? 0x44ff88 : 0xff4444);

    if (this.spawnedMesh) {
      // Анимация появления
      if (this._spawnProgress < 1) {
        this._spawnProgress = Math.min(1, this._spawnProgress + dt * 2);
        const p = easeOutBack(this._spawnProgress);
        const s = 0.4 + (PRODUCT_SCALE - 0.4) * p;
        this.spawnedMesh.scale.setScalar(s);
      }
      // Лёгкое «дыхание» экспоната
      const bob = Math.sin(this._t * 1.6) * 0.12;
      this.spawnedMesh.position.y = this.spawnPos.y + bob;
      this.spawnedMesh.rotation.y += dt * 0.6;
    }
  }

  activate() {
    if (this.activated) return false;
    this.activated = true;

    // Просто меш — без физики
    const mesh = createProductMesh(this.product);
    mesh.position.copy(this.spawnPos);
    mesh.scale.setScalar(0.4);
    this.group.parent.add(mesh);

    this.spawnedMesh = mesh;
    this._spawnProgress = 0;

    // Вспышка
    const light = new THREE.PointLight(this.product.color, 6, 16, 2);
    light.position.copy(mesh.position);
    this.group.parent.add(light);
    let life = 0;
    const fade = () => {
      life += 0.05;
      light.intensity = Math.max(0, 6 * (1 - life / 0.8));
      if (life < 0.8) requestAnimationFrame(fade);
      else this.group.parent.remove(light);
    };
    fade();

    if (this.onActivate) this.onActivate(this);
    return true;
  }

  isInRange(playerPos) {
    const dx = this.group.position.x - playerPos.x;
    const dz = this.group.position.z - playerPos.z;
    return dx * dx + dz * dz < this.radius * this.radius;
  }
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/* =========================================================
   Продукция — чистый THREE.Group, без коллайдеров
   ========================================================= */
function createProductMesh(product) {
  let geo = null;

  switch (product.shape) {
    case 'cylinder':  geo = new THREE.CylinderGeometry(0.26, 0.26, 1.3, 18); break;
    case 'disc':      geo = new THREE.CylinderGeometry(0.48, 0.48, 0.16, 24); break;
    case 'torus':     geo = new THREE.TorusGeometry(0.42, 0.16, 14, 26); break;
    case 'sphere':    geo = new THREE.SphereGeometry(0.42, 22, 22); break;
    case 'thin':      geo = new THREE.BoxGeometry(0.1, 0.12, 0.95); break;
    case 'torusKnot': geo = new THREE.TorusKnotGeometry(0.32, 0.1, 64, 10); break;
    case 'box':       geo = new THREE.BoxGeometry(1.05, 0.65, 0.7); break;
    case 'tile':      geo = new THREE.BoxGeometry(0.9, 0.1, 0.9); break;
    case 'bed':       geo = new THREE.BoxGeometry(1.3, 0.22, 0.6); break;
    case 'plane':     geo = null; break;
    default:          geo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  }

  const mat = new THREE.MeshStandardMaterial({
    color: product.color, metalness: 0.55, roughness: 0.35,
    emissive: product.color, emissiveIntensity: 0.08,
  });

  let mesh;
  if (product.shape === 'plane') {
    mesh = new THREE.Group();
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 1.1, 6, 12), mat);
    fus.rotation.z = Math.PI / 2;
    mesh.add(fus);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 1.5), mat);
    mesh.add(wing);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.65), mat);
    tail.position.x = -0.62;
    mesh.add(tail);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.06), mat);
    fin.position.set(-0.62, 0.25, 0);
    mesh.add(fin);
  } else {
    mesh = new THREE.Mesh(geo, mat);
  }

  mesh.castShadow = true;
  mesh.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return mesh;
}

/* =========================================================
   Менеджер
   ========================================================= */
export class InteractablesManager {
  constructor(scene, ui, physics) {
    this.scene = scene;
    this.ui = ui;
    this.physics = physics;
    this.npcs = [];
    this.levers = [];
    this.nearest = null;
  }

  addNPC(cfg) { const n = new NPC(this.scene, cfg); this.npcs.push(n); return n; }
  addLever(cfg) { const l = new Lever(this.scene, this.physics, cfg); this.levers.push(l); return l; }

  update(dt, time, playerPos, input) {
    for (const n of this.npcs) n.update(dt, time);
    for (const l of this.levers) l.update(dt, time);

    if (input.locked) {
      this.nearest = null;
      this.ui.showHint(false);
      return;
    }

    let best = null, bestDist = Infinity;
    const check = (obj) => {
      if (!obj.isInRange(playerPos)) return;
      const dx = obj.group.position.x - playerPos.x;
      const dz = obj.group.position.z - playerPos.z;
      const d = dx * dx + dz * dz;
      if (d < bestDist) { bestDist = d; best = obj; }
    };
    for (const n of this.npcs) check(n);
    for (const l of this.levers) check(l);
    this.nearest = best;

    if (best) {
      const verb = best.type === 'npc'
        ? `Поговорить с ${best.name}`
        : (best.activated ? 'Рычаг уже активирован' : 'Дёрнуть рычаг');
      this.ui.showHint(true, verb);
    } else {
      this.ui.showHint(false);
    }

    if (best && input.consumeInteract()) {
      if (best.type === 'npc') {
        this.ui.openDialog(best.name, best.lines);
        input.locked = true;
      } else if (!best.activated) {
        best.activate();
      }
    }
  }
}