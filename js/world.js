import * as THREE from 'three';
import { ZONES, ZONE_SIZE, buildingWorldPos } from './data.js';
import { buildBuilding } from './buildings.js';
import { GROUPS } from './physics.js';

export function makeTextSprite(text, { color = '#ffffff', bg = 'rgba(8,14,24,0.75)', fontSize = 48, scale = 1, border = null } = {}) {
  const pad = 28;
  const measure = document.createElement('canvas').getContext('2d');
  measure.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  const textW = measure.measureText(text).width;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(textW + pad * 2);
  canvas.height = Math.ceil(fontSize + pad * 1.4);
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  const r = 22;
  ctx.beginPath(); ctx.moveTo(r, 0); ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
  ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r); ctx.arcTo(0, canvas.height, 0, 0, r);
  ctx.arcTo(0, 0, canvas.width, 0, r); ctx.closePath(); ctx.fillStyle = bg; ctx.fill();
  if (border) { ctx.lineWidth = 4; ctx.strokeStyle = border; ctx.stroke(); }
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas); tex.anisotropy = 4; tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false }));
  sprite.scale.set((canvas.width / canvas.height) * scale, 1 * scale, 1);
  return sprite;
}

function scatterTrees(scene, count = 150) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 });
  const leafMat  = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 1 });
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.24, 1.4, 6);
  const leafGeo  = new THREE.ConeGeometry(1.05, 2.6, 7);
  for (let i = 0; i < count; i++) {
    let x, z;
    do { x = (Math.random() - 0.5) * 480; z = (Math.random() - 0.5) * 480; }
    while (Math.abs(x) < 210 && Math.abs(z) < 210);
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat); trunk.position.y = 0.7; trunk.castShadow = true; tree.add(trunk);
    const leaves = new THREE.Mesh(leafGeo, leafMat); leaves.position.y = 2.4; leaves.castShadow = true; tree.add(leaves);
    tree.scale.setScalar(0.7 + Math.random() * 0.9);
    tree.rotation.y = Math.random() * Math.PI * 2;
    tree.position.set(x, 0, z); scene.add(tree);
  }
}

export function buildWorld(scene, physics) {
  const interactionPoints = [];
  const placedFootprints = [];

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ color: 0x27384a, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  physics.addStaticBox({ x: 0, y: -0.5, z: 0 }, { hx: 300, hy: 0.5, hz: 300 }, GROUPS.GROUND);

  const grid = new THREE.GridHelper(600, 120, 0x3d5570, 0x2f4459);
  grid.position.y = 0.01;
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  scene.add(grid);

  for (const zone of ZONES) {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(ZONE_SIZE - 1, ZONE_SIZE - 1),
      new THREE.MeshStandardMaterial({ color: zone.color, roughness: 0.95 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(zone.center[0], 0.02, zone.center[1]);
    plane.receiveShadow = true;
    scene.add(plane);

    const half = (ZONE_SIZE - 1) / 2;
    const corners = [[-half, -half], [half, -half], [half, half], [-half, half], [-half, -half]];
    const borderPts = corners.map(([cx, cz]) => new THREE.Vector3(zone.center[0] + cx, 0.35, zone.center[1] + cz));
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(borderPts),
      new THREE.LineBasicMaterial({ color: zone.accent, transparent: true, opacity: 0.9 })
    ));

    for (const [cx, cz] of corners.slice(0, 4)) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 1.6, 8),
        new THREE.MeshBasicMaterial({ color: zone.accent })
      );
      pillar.position.set(zone.center[0] + cx, 0.8, zone.center[1] + cz);
      scene.add(pillar);
    }

    const zoneLabel = makeTextSprite(zone.name.toUpperCase(), {
      fontSize: 64, scale: 4, color: '#ffffff', bg: 'rgba(8,14,24,0.0)'
    });
    zoneLabel.position.set(zone.center[0], 12, zone.center[1] - ZONE_SIZE / 2 + 5);
    scene.add(zoneLabel);

    for (const b of zone.buildings) {
      const [x, z] = buildingWorldPos(zone, b.frac);
      const built = buildBuilding(b, zone.accent);

      const colliderHx = built.collider ? built.collider.hx : 5;
      const colliderHz = built.collider ? built.collider.hz : 5;
      // prod занимает место под NPC + рычаг + подиум (≈22 юнита), infra — почти ничего
      const bonus = (b.kind === 'prod') ? 22 : 4;
      const footprintRadius = Math.max(colliderHx, colliderHz) + bonus;

      let hasCollision = false;
      for (const fp of placedFootprints) {
        const dist = Math.hypot(x - fp.x, z - fp.z);
        if (dist < (footprintRadius + fp.radius)) {
          hasCollision = true;
          console.warn(`[КОЛЛИЗИЯ] "${b.name}" (${zone.name}) пересекается с "${fp.name}". Пропущено. dist=${dist.toFixed(1)}, need=${(footprintRadius + fp.radius).toFixed(1)}`);
          break;
        }
      }
      if (hasCollision) continue;
      placedFootprints.push({ x, z, radius: footprintRadius, name: b.name });

      const obj = built.group;
      obj.position.set(x, 0, z);

      let dx = zone.center[0] - x;
      let dz = zone.center[1] - z;
      if (Math.hypot(dx, dz) < 0.1) { dx = 0; dz = 1; }

      obj.rotation.y = Math.atan2(dx, dz);
      obj.updateMatrixWorld();
      scene.add(obj);

      if (built.collider) {
        physics.addStaticBox({ x, y: built.collider.cy, z }, built.collider, GROUPS.BUILDING);
      }

      if (b.kind === 'prod') {
        const len = Math.hypot(dx, dz);
        const nx = dx / len, nz = dz / len;
        const frontPos = new THREE.Vector3(x + nx * 12, 0, z + nz * 12);
        interactionPoints.push({
          zone, building: b,
          position: frontPos,
          facing: Math.atan2(nx, nz),
        });
      }
    }
  }

  scatterTrees(scene, 150);
  return { interactionPoints };
}