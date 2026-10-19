import * as THREE from 'three';

const M = {
  concrete:    new THREE.MeshStandardMaterial({ color: 0x8a929c, roughness: 0.9, metalness: 0.05 }),
  concreteDark:new THREE.MeshStandardMaterial({ color: 0x5f6670, roughness: 0.9, metalness: 0.05 }),
  wallOrange:  new THREE.MeshStandardMaterial({ color: 0xd9772a, roughness: 0.75, metalness: 0.1 }),
  wallBlue:    new THREE.MeshStandardMaterial({ color: 0x4a6f9a, roughness: 0.7, metalness: 0.15 }),
  wallWhite:   new THREE.MeshStandardMaterial({ color: 0xe6ecf2, roughness: 0.6, metalness: 0.08 }),
  wallGreen:   new THREE.MeshStandardMaterial({ color: 0x5b8a5b, roughness: 0.75, metalness: 0.1 }),
  wallRed:     new THREE.MeshStandardMaterial({ color: 0xa5453d, roughness: 0.75, metalness: 0.1 }),
  roof:        new THREE.MeshStandardMaterial({ color: 0x394150, roughness: 0.85, metalness: 0.2 }),
  metal:       new THREE.MeshStandardMaterial({ color: 0x9aa4b1, roughness: 0.35, metalness: 0.8 }),
  metalDark:   new THREE.MeshStandardMaterial({ color: 0x555c66, roughness: 0.4, metalness: 0.85 }),
  glass:       new THREE.MeshStandardMaterial({ color: 0x88b8e8, roughness: 0.15, metalness: 0.4,
                                                 transparent: true, opacity: 0.7 }),
  glassLit:    new THREE.MeshStandardMaterial({ color: 0xffe08a, roughness: 0.2, metalness: 0.3,
                                                 emissive: 0xffc466, emissiveIntensity: 0.6 }),
  stripe:      new THREE.MeshStandardMaterial({ color: 0xf0c945, roughness: 0.7, metalness: 0.1 }),
  rusty:       new THREE.MeshStandardMaterial({ color: 0x7a4f33, roughness: 0.95, metalness: 0.15 }),
};

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function addWindowRow(group, count, spacing, y, z, wallWidth, lit = true) {
  const w = (wallWidth - (count - 1) * spacing) / count;
  const startX = -((count - 1) * (w + spacing)) / 2;
  for (let i = 0; i < count; i++) {
    const x = startX + i * (w + spacing);
    group.add(mesh(
      new THREE.BoxGeometry(w, 0.9, 0.08),
      lit && Math.random() > 0.35 ? M.glassLit : M.glass,
      x, y, z
    ));
  }
}

function factory() {
  const g = new THREE.Group();
  const W = 10, D = 7, H = 4.2;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.wallOrange, 0, H / 2, 0));

  const saw = 4, segW = W / saw;
  for (let i = 0; i < saw; i++) {
    const sl = mesh(new THREE.BoxGeometry(segW, 0.25, D), M.roof);
    sl.position.set(-W / 2 + segW * (i + 0.5), H + 0.4, 0);
    sl.rotation.z = 0.22;
    g.add(sl);
    g.add(mesh(new THREE.BoxGeometry(0.1, 0.9, D * 0.9), M.glass,
      -W / 2 + segW * i + 0.6, H + 0.9, 0));
  }

  addWindowRow(g, 5, 0.6, 2.4, D / 2 + 0.02, W * 0.85);

  g.add(mesh(new THREE.BoxGeometry(2.4, 2.6, 0.15), M.metalDark, 0, 1.3, D / 2 + 0.08));
  for (let i = -1; i <= 1; i++) {
    g.add(mesh(new THREE.BoxGeometry(2.4, 0.12, 0.16), M.stripe, 0, 1.3 + i * 0.7, D / 2 + 0.09));
  }

  const stackH = 7;
  g.add(mesh(new THREE.CylinderGeometry(0.35, 0.45, stackH, 18), M.metalDark,
    W / 2 - 1, stackH / 2, -D / 2 + 1.2));
  for (let i = 0; i < 2; i++) {
    g.add(mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.35, 18), M.wallRed,
      W / 2 - 1, 2 + i * 2.4, -D / 2 + 1.2));
  }
  g.add(mesh(new THREE.BoxGeometry(W + 0.3, 0.4, D + 0.3), M.concreteDark, 0, H + 0.2, 0));

  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function hangar() {
  const g = new THREE.Group();
  const W = 14, D = 9, H = 5.5;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.wallBlue, 0, H / 2, 0));

  const roofGeo = new THREE.CylinderGeometry(W / 2, W / 2, D, 24, 1, false, 0, Math.PI);
  const roof = new THREE.Mesh(roofGeo, M.roof);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.position.y = H;
  roof.castShadow = true;
  g.add(roof);

  const gateW = 6, gateH = 4.4;
  g.add(mesh(new THREE.BoxGeometry(gateW, gateH, 0.2), M.metalDark, 0, gateH / 2, D / 2 + 0.12));
  g.add(mesh(new THREE.BoxGeometry(0.12, gateH, 0.24), M.metal, 0, gateH / 2, D / 2 + 0.13));
  for (let i = 0; i < 6; i++) {
    const s = mesh(new THREE.BoxGeometry(gateW * 0.9, 0.25, 0.26), M.stripe,
      0, 0.4 + i * 0.7, D / 2 + 0.14);
    s.rotation.z = -0.35;
    g.add(s);
  }

  for (let i = -1; i <= 1; i++) {
    const win = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 20), M.glass,
      i * 3.5, H - 0.9, D / 2 + 0.05);
    win.rotation.x = Math.PI / 2;
    g.add(win);
  }
  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function warehouse() {
  const g = new THREE.Group();
  const W = 16, D = 8, H = 4;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.wallWhite, 0, H / 2, 0));

  const roofL = mesh(new THREE.BoxGeometry(W + 0.4, 0.2, D * 0.62), M.roof, 0, H + 0.7, -D * 0.25);
  roofL.rotation.x = 0.35; g.add(roofL);
  const roofR = mesh(new THREE.BoxGeometry(W + 0.4, 0.2, D * 0.62), M.roof, 0, H + 0.7, D * 0.25);
  roofR.rotation.x = -0.35; g.add(roofR);

  for (let i = -1; i <= 1; i++) {
    g.add(mesh(new THREE.BoxGeometry(2.2, 2.6, 0.15), M.metalDark, i * 4.5, 1.3, D / 2 + 0.08));
    g.add(mesh(new THREE.BoxGeometry(3, 0.15, 1.4), M.metal, i * 4.5, 2.9, D / 2 + 0.7));
  }
  for (let i = -1; i <= 1; i += 2) {
    g.add(mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), M.metal, i * 4, H + 1.5, 0));
  }
  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function steelMill() {
  const g = new THREE.Group();
  const W = 14, D = 10, H = 6;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.concreteDark, 0, H / 2, 0));
  g.add(mesh(new THREE.BoxGeometry(W * 0.5, H * 1.4, D * 0.4), M.rusty,
    -W * 0.3, (H * 1.4) / 2, D * 0.35));

  const pipes = [
    { x:  W / 2 - 1.2, z: -D / 2 + 1.2, h: 11, r: 0.5 },
    { x:  W / 2 - 3.0, z: -D / 2 + 1.2, h: 9,  r: 0.45 },
    { x:  W / 2 - 4.5, z: -D / 2 + 2.4, h: 7,  r: 0.4 },
  ];
  for (const p of pipes) {
    g.add(mesh(new THREE.CylinderGeometry(p.r * 0.85, p.r, p.h, 20), M.metalDark, p.x, p.h / 2, p.z));
    g.add(mesh(new THREE.CylinderGeometry(p.r * 0.85, p.r * 0.85, 0.2, 20),
      new THREE.MeshBasicMaterial({ color: 0xff6a2a }), p.x, p.h + 0.05, p.z));
    g.add(mesh(new THREE.CylinderGeometry(p.r * 1.02, p.r * 1.02, 0.4, 20), M.wallRed, p.x, p.h * 0.55, p.z));
  }

  const tower = mesh(new THREE.CylinderGeometry(1.2, 2.0, 6, 16, 1, true), M.concrete,
    -W / 2 + 2, 3, -D / 2 + 2.5);
  tower.material.side = THREE.DoubleSide;
  g.add(tower);

  for (const z of [-D / 2 - 0.5, -D / 2 - 1.2]) {
    g.add(mesh(new THREE.BoxGeometry(W + 6, 0.1, 0.12), M.metal, 0, 0.05, z));
  }
  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function gasPlant() {
  const g = new THREE.Group();
  for (let i = -1; i <= 1; i += 2) {
    g.add(mesh(new THREE.SphereGeometry(1.6, 24, 20), M.wallWhite, i * 2.2, 2.0, 0));
    for (const [dx, dz] of [[-0.8,-0.8],[0.8,-0.8],[-0.8,0.8],[0.8,0.8]]) {
      g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 2, 8), M.metalDark,
        i * 2.2 + dx * 0.9, 0.5, dz * 0.9));
    }
    const belt = mesh(new THREE.TorusGeometry(1.62, 0.06, 8, 32), M.metalDark, i * 2.2, 2.0, 0);
    belt.rotation.x = Math.PI / 2;
    g.add(belt);
  }
  const hCyl = mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.5, 20), M.wallBlue, 0, 0.9, -3.5);
  hCyl.rotation.z = Math.PI / 2; g.add(hCyl);
  g.add(mesh(new THREE.BoxGeometry(4, 3, 3), M.wallBlue, 0, 1.5, 3.5));
  for (const x of [-2.2, 2.2]) {
    const p = mesh(new THREE.CylinderGeometry(0.09, 0.09, 6, 10), M.metal, x, 0.7, 0);
    p.rotation.x = Math.PI / 2; g.add(p);
  }
  return { group: g, collider: { hx: 4.5, hy: 2.5, hz: 4.5, cy: 2.5 } };
}

function medicalPlant(accent) {
  const g = new THREE.Group();
  const W = 9, D = 6.5, H = 4.5;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.wallWhite, 0, H / 2, 0));
  g.add(mesh(new THREE.BoxGeometry(W * 0.9, 1.4, 0.1), M.glass, 0, 3.0, D / 2 + 0.06));
  g.add(mesh(new THREE.BoxGeometry(W * 0.9, 1.0, 0.1), M.glass, 0, 1.2, D / 2 + 0.06));
  g.add(mesh(new THREE.BoxGeometry(2.5, 0.6, 0.15),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4, metalness: 0.3 }),
    -W / 2 + 2.2, H - 0.5, D / 2 + 0.1));
  g.add(mesh(new THREE.BoxGeometry(2.4, 3.2, 1.2), M.metalDark, 0, 1.6, D / 2 + 0.7));
  g.add(mesh(new THREE.BoxGeometry(1.6, 2.6, 0.15), M.glassLit, 0, 1.3, D / 2 + 1.35));
  g.add(mesh(new THREE.BoxGeometry(W + 0.3, 0.35, D + 0.3), M.concrete, 0, H + 0.15, 0));
  for (let i = -1; i <= 1; i += 2) {
    g.add(mesh(new THREE.BoxGeometry(1, 0.5, 1), M.metal, i * 2.5, H + 0.5, -1));
  }
  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function railwayStation() {
  const g = new THREE.Group();
  const W = 9, D = 3.5, H = 3.5;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.wallRed, 0, H / 2, 0));

  const roofL = mesh(new THREE.BoxGeometry(W + 0.4, 0.2, D * 0.62), M.roof, 0, H + 0.6, -D * 0.25);
  roofL.rotation.x = 0.4; g.add(roofL);
  const roofR = mesh(new THREE.BoxGeometry(W + 0.4, 0.2, D * 0.62), M.roof, 0, H + 0.6, D * 0.25);
  roofR.rotation.x = -0.4; g.add(roofR);

  const clock = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 20),
    new THREE.MeshBasicMaterial({ color: 0x0a0a0a }), 0, H - 0.7, D / 2 + 0.06);
  clock.rotation.x = Math.PI / 2; g.add(clock);
  g.add(mesh(new THREE.CircleGeometry(0.42, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff5d0 }), 0, H - 0.7, D / 2 + 0.12));

  addWindowRow(g, 6, 0.4, 1.8, D / 2 + 0.05, W * 0.85);
  g.add(mesh(new THREE.BoxGeometry(W + 6, 0.3, D + 4), M.concrete, 0, 0.15, 0));
  g.add(mesh(new THREE.BoxGeometry(W + 6, 0.15, 2.5), M.metal, 0, 3.2, D / 2 + 2));
  for (let i = -2; i <= 2; i++) {
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), M.metal, i * 3, 1.6, D / 2 + 3.0));
  }
  for (const z of [D / 2 + 4, D / 2 + 4.8]) {
    g.add(mesh(new THREE.BoxGeometry(W + 10, 0.12, 0.12), M.metal, 0, 0.06, z));
  }
  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function containerYard() {
  const g = new THREE.Group();
  const colors = [0xd9772a, 0x4a6f9a, 0x5b8a5b, 0xa5453d, 0xf0c945];
  const rand = mulberry32(1337);

  for (let x = -2; x <= 2; x++) {
    for (let z = -1; z <= 1; z++) {
      const stackH = 1 + Math.floor(rand() * 3);
      for (let y = 0; y < stackH; y++) {
        const color = colors[Math.floor(rand() * colors.length)];
        g.add(mesh(new THREE.BoxGeometry(2.4, 1.2, 1.1),
          new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.3 }),
          x * 2.7, 0.6 + y * 1.25, z * 1.5));
        for (let i = -1; i <= 1; i++) {
          g.add(mesh(new THREE.BoxGeometry(0.05, 1.15, 1.05), M.metalDark,
            x * 2.7 + i * 0.9, 0.6 + y * 1.25, z * 1.5));
        }
      }
    }
  }
  return { group: g, collider: { hx: 7, hy: 2, hz: 3, cy: 2 } };
}

function substation() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(4, 3, 3), M.concrete, 0, 1.5, 0));
  for (let i = -1; i <= 1; i += 2) {
    g.add(mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), M.metalDark, i * 2.8, 0.7, 1.8));
    for (let k = -1; k <= 1; k++) {
      g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), M.wallRed,
        i * 2.8 + k * 0.3, 1.7, 1.8));
    }
  }
  const pylon = new THREE.Group();
  pylon.position.set(0, 0, -2);
  pylon.add(mesh(new THREE.BoxGeometry(0.3, 7, 0.3), M.metal, 0, 3.5, 0));
  for (let i = 0; i < 3; i++) {
    pylon.add(mesh(new THREE.BoxGeometry(3.5, 0.15, 0.15), M.metal, 0, 5 + i * 0.7, 0));
  }
  g.add(pylon);
  return { group: g, collider: { hx: 4, hy: 1.5, hz: 2.5, cy: 1.5 } };
}

function office() {
  const g = new THREE.Group();
  const W = 6, D = 5, H = 6.5;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.wallWhite, 0, H / 2, 0));
  for (let floor = 0; floor < 3; floor++) {
    addWindowRow(g, 3, 0.4, 1.3 + floor * 1.7, D / 2 + 0.06, W * 0.8);
  }
  g.add(mesh(new THREE.BoxGeometry(2.5, 0.15, 1.5), M.metal, 0, 2.4, D / 2 + 0.75));
  g.add(mesh(new THREE.BoxGeometry(1.4, 2.2, 0.1), M.glassLit, 0, 1.1, D / 2 + 0.06));
  g.add(mesh(new THREE.BoxGeometry(W + 0.3, 0.35, D + 0.3), M.concrete, 0, H + 0.15, 0));
  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function shelter() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(3.2, 0.15, 2), M.concrete, 0, 0.08, 0));
  g.add(mesh(new THREE.BoxGeometry(3.4, 0.15, 2.4), M.metal, 0, 2.4, 0));
  g.add(mesh(new THREE.BoxGeometry(3.2, 2, 0.1), M.glass, 0, 1.2, -1));
  for (const [x, z] of [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]]) {
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), M.metal, x, 1.2, z));
  }
  g.add(mesh(new THREE.BoxGeometry(2.5, 0.1, 0.5), M.wallRed, 0, 0.55, -0.4));
  return { group: g, collider: { hx: 1.7, hy: 1.2, hz: 1.2, cy: 1.2 } };
}

function parkingLot() {
  const g = new THREE.Group();
  const W = 10, D = 6;
  g.add(mesh(new THREE.BoxGeometry(W, 0.1, D), M.concreteDark, 0, 0.05, 0));
  for (let i = -2; i <= 2; i++) {
    g.add(mesh(new THREE.BoxGeometry(0.12, 0.11, 3), M.wallWhite, i * 1.6, 0.11, -1.4));
  }
  const carColors = [0xd43a3a, 0x3a6fd4, 0x3ad46a, 0xf0c945];
  for (let i = -2; i <= 2; i++) {
    const c = carColors[(i + 2) % carColors.length];
    const car = new THREE.Group();
    car.position.set(i * 1.6, 0, -1.4);
    car.add(mesh(new THREE.BoxGeometry(1.1, 0.5, 2), new THREE.MeshStandardMaterial({ color: c }), 0, 0.4, 0));
    car.add(mesh(new THREE.BoxGeometry(1, 0.4, 1.1), M.glass, 0, 0.85, -0.1));
    for (const [dx, dz] of [[-0.55,-0.6],[0.55,-0.6],[-0.55,0.6],[0.55,0.6]]) {
      const w = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 12), M.metalDark, dx, 0.22, dz);
      w.rotation.z = Math.PI / 2;
      car.add(w);
    }
    g.add(car);
  }
  return { group: g, collider: { hx: W / 2, hy: 0.05, hz: D / 2, cy: 0.05 } };
}

function checkpoint() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(2, 2.5, 2), M.wallWhite, 0, 1.25, 0));
  g.add(mesh(new THREE.BoxGeometry(2.05, 1, 1.2), M.glass, 0, 1.5, 0.4));
  g.add(mesh(new THREE.BoxGeometry(2.4, 0.15, 2.4), M.roof, 0, 2.6, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.6, 10), M.stripe, 3, 0.8, 0));
  g.add(mesh(new THREE.BoxGeometry(5, 0.15, 0.15), M.stripe, 5.5, 1.4, 0));
  for (let i = 0; i < 5; i++) {
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.16, 0.16), M.wallRed, 3.25 + i * 1, 1.4, 0));
  }
  return { group: g, collider: { hx: 1.2, hy: 1.25, hz: 1.2, cy: 1.25 } };
}

function boilerHouse() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(4, 3.5, 4), M.wallRed, 0, 1.75, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.35, 0.45, 8, 20), M.metalDark, 1, 4, 1));
  g.add(mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.4, 20), M.stripe, 1, 3, 1));
  g.add(mesh(new THREE.BoxGeometry(2.5, 1.8, 2), M.rusty, -1.8, 0.9, 0));
  return { group: g, collider: { hx: 2.4, hy: 1.75, hz: 2, cy: 1.75 } };
}

function canteen(accent) {
  const g = new THREE.Group();
  const W = 6, D = 5, H = 3.2;
  g.add(mesh(new THREE.BoxGeometry(W, H, D), M.wallGreen, 0, H / 2, 0));
  addWindowRow(g, 4, 0.6, 1.7, D / 2 + 0.05, W * 0.8);
  g.add(mesh(new THREE.BoxGeometry(W + 0.3, 0.2, D + 0.3), M.roof, 0, H + 0.1, 0));
  g.add(mesh(new THREE.BoxGeometry(2, 0.5, 0.1),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4 }), 0, H - 0.6, D / 2 + 0.06));
  return { group: g, collider: { hx: W / 2, hy: H / 2, hz: D / 2, cy: H / 2 } };
}

function tankCluster() {
  const g = new THREE.Group();
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && z === 0) continue;
      g.add(mesh(new THREE.CylinderGeometry(1.2, 1.2, 3, 20), M.wallBlue, x * 3.2, 1.5, z * 3.2));
      g.add(mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.15, 20), M.metal, x * 3.2, 3.05, z * 3.2));
      const ring = mesh(new THREE.TorusGeometry(1.22, 0.05, 8, 24), M.metalDark, x * 3.2, 2, z * 3.2);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    }
  }
  for (let x = -1; x <= 1; x++) {
    const pipe = mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.4, 10), M.metal, x * 3.2, 0.5, 0);
    pipe.rotation.x = Math.PI / 2;
    g.add(pipe);
  }
  return { group: g, collider: { hx: 5.5, hy: 1.5, hz: 5.5, cy: 1.5 } };
}

function strip() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(28, 0.1, 7), M.concreteDark, 0, 0.05, 0));
  for (let i = -6; i <= 6; i++) {
    g.add(mesh(new THREE.BoxGeometry(1.4, 0.11, 0.5), M.wallWhite, i * 2.1, 0.11, 0));
  }
  for (let i = -13; i <= 13; i += 2) {
    for (const z of [-3.3, 3.3]) {
      g.add(mesh(new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x44aaff }), i, 0.14, z));
    }
  }
  return { group: g, collider: null };
}

const BUILDERS = {
  factory, hangar, warehouse, steelMill, gasPlant, medicalPlant,
  railwayStation, containerYard, substation, office, shelter,
  parkingLot, checkpoint, boilerHouse, canteen, tankCluster, strip,
};

export function buildBuilding(building, accent) {
  const fn = BUILDERS[building.shape] || factory;
  const built = fn(accent, building);
  built.group.userData.buildingId = building.id;
  return built;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}