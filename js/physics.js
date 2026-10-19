import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

/* =========================================================
   Слои коллизий (по 16 бит membership + filter)
   ========================================================= */
export const G = {
  GROUND:   0x0001,
  BUILDING: 0x0002,
  PLAYER:   0x0004,
  LEVER:    0x0008,
};

/** Упаковка в 32-битное число: [membership:16][filter:16] */
function packGroups(membership, filter) {
  return (((membership & 0xffff) << 16) | (filter & 0xffff)) >>> 0;
}

/* Кто с кем сталкивается: */
export const GROUPS = {
  GROUND:   packGroups(G.GROUND,   G.PLAYER),
  BUILDING: packGroups(G.BUILDING, G.PLAYER),
  LEVER:    packGroups(G.LEVER,    G.PLAYER),
  PLAYER:   packGroups(G.PLAYER,   G.GROUND | G.BUILDING | G.LEVER),
};

/* =========================================================
   Мир физики
   ========================================================= */
export class PhysicsWorld {
  constructor() {
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.bodies = new Map();
  }

  static async init() {
    await RAPIER.init();
    return new PhysicsWorld();
  }

  /* ---------------- Статика ---------------- */
  addStaticBox(pos, { hx, hy, hz }, groups = GROUPS.BUILDING) {
    const rb = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z)
    );
    const col = RAPIER.ColliderDesc.cuboid(hx, hy, hz)
      .setFriction(0.9)
      .setRestitution(0.05)
      .setCollisionGroups(groups);
    this.world.createCollider(col, rb);
    return rb;
  }

  addStaticCylinder(pos, { halfHeight, radius }, groups = GROUPS.LEVER) {
    const rb = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z)
    );
    const col = RAPIER.ColliderDesc.cylinder(halfHeight, radius)
      .setFriction(0.9)
      .setRestitution(0.05)
      .setCollisionGroups(groups);
    this.world.createCollider(col, rb);
    return rb;
  }

  /* ---------------- Игрок ---------------- */
  createPlayer(position) {
    const rb = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased()
        .setTranslation(position.x, position.y, position.z)
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.capsule(0.5, 0.4)
        .setFriction(0.5)
        .setRestitution(0)
        .setCollisionGroups(GROUPS.PLAYER),
      rb
    );

    const ctrl = this.world.createCharacterController(0.02);
    ctrl.enableAutostep(0.5, 0.25, true);
    ctrl.enableSnapToGround(0.5);
    ctrl.setMaxSlopeClimbAngle(50 * Math.PI / 180);
    ctrl.setMinSlopeSlideAngle(35 * Math.PI / 180);
    ctrl.setApplyImpulsesToDynamicBodies(false);
    ctrl.setCharacterMass(70);

    return { rb, collider, ctrl };
  }

  step(dt) {
    this.world.timestep = Math.min(dt, 1 / 30);
    this.world.step();
  }

  /* sync() больше не нужен — динамических тел нет,
     но оставлен на будущее */
  sync() {}
}