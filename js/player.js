import * as THREE from 'three';

export class Player {
  constructor(scene, physics, startPos) {
    this.physics = physics;

    // Внешний контейнер — двигается по физике, вращается по Y
    this.group = new THREE.Group();
    this.group.position.copy(startPos);

    // Внутренний контейнер — наклон вперёд (по X) и покачивание
    this.model = new THREE.Group();
    this.group.add(this.model);

    scene.add(this.group);

    const skinMat  = new THREE.MeshStandardMaterial({ color: 0xffd7a8, roughness: 0.9 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.85 });
    const shoeMat  = new THREE.MeshStandardMaterial({ color: 0x15181f, roughness: 0.9 });
    const eyeMat   = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.68, 6, 14), shirtMat);
    body.position.y = 1.24; body.castShadow = true; this.model.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 20, 20), skinMat);
    head.position.y = 1.98; head.castShadow = true; this.model.add(head);

    for (const sx of [-0.12, 0.12]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
      eye.position.set(sx, 2.02, 0.30);
      this.model.add(eye);
    }

    const armGeo = new THREE.CapsuleGeometry(0.11, 0.5, 4, 8);
    this.armL = new THREE.Mesh(armGeo, shirtMat);
    this.armL.position.set(-0.47, 1.35, 0); this.armL.castShadow = true;
    this.model.add(this.armL);
    this.armR = this.armL.clone(); this.armR.position.x = 0.47;
    this.model.add(this.armR);

    const legGeo = new THREE.CapsuleGeometry(0.135, 0.55, 4, 8);
    this.legL = new THREE.Mesh(legGeo, pantsMat);
    this.legL.position.set(-0.17, 0.5, 0); this.legL.castShadow = true;
    this.model.add(this.legL);
    this.legR = this.legL.clone(); this.legR.position.x = 0.17;
    this.model.add(this.legR);

    const shoeGeo = new THREE.BoxGeometry(0.26, 0.14, 0.42);
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(-0.17, 0.08, 0.06); this.model.add(shoeL);
    const shoeR = shoeL.clone(); shoeR.position.x = 0.17; this.model.add(shoeR);

    // Физическое тело
    const { rb, collider, ctrl } = physics.createPlayer({
      x: startPos.x, y: startPos.y + 0.9, z: startPos.z,
    });
    this.rb = rb;
    this.collider = collider;
    this.ctrl = ctrl;

    this.speed = 6.5;
    this.runMultiplier = 1.85;
    this.jumpVelocity = 7.5;
    this.gravity = -22;
    this.vy = 0;
    this.facing = 0;
    this.walkPhase = 0;
    this.isMoving = false;
    this.isRunning = false;
    this._capsuleCenterOffset = 0.9;
  }

  update(dt, input, camYaw) {
    if (input.locked) {
      this._animate(dt, false, false);
      return;
    }

    // --- Ввод ---
    let f = 0, r = 0;
    if (input.keys.has('KeyW') || input.keys.has('ArrowUp'))    f += 1;
    if (input.keys.has('KeyS') || input.keys.has('ArrowDown'))  f -= 1;
    if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) r += 1;
    if (input.keys.has('KeyA') || input.keys.has('ArrowLeft'))  r -= 1;
    f += -input.move.y; r += input.move.x;

    const len = Math.hypot(f, r);
    if (len > 1) { f /= len; r /= len; }

    const fwd   = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    const right = new THREE.Vector3( Math.cos(camYaw), 0, -Math.sin(camYaw));

    const moveDir = new THREE.Vector3()
      .addScaledVector(fwd, f)
      .addScaledVector(right, r);

    this.isMoving  = moveDir.lengthSq() > 0.001;
    this.isRunning = this.isMoving && input.run;

    if (this.isMoving) {
      moveDir.normalize();
      const targetFacing = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetFacing - this.facing;
      while (diff >  Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.facing += diff * Math.min(1, dt * 14);
    }

    // --- Прыжок / гравитация ---
    // grounded — состояние после прошлого кадра
    const grounded = this.ctrl.computedGrounded();

    if (grounded && input.consumeJump() && this.vy <= 0.1) {
      // Прыгаем: сразу улетаем от земли
      this.vy = this.jumpVelocity;
    } else if (grounded && this.vy <= 0) {
      // На земле — прижимаем к полу
      this.vy = -0.5;
    }

    // Гравитация
    this.vy += this.gravity * dt;
    if (this.vy < -30) this.vy = -30;

    // --- Желаемое смещение ---
    const spd = this.isMoving ? this.speed * (this.isRunning ? this.runMultiplier : 1) : 0;
    const desired = {
      x: moveDir.x * spd * dt,
      y: this.vy * dt,
      z: moveDir.z * spd * dt,
    };

    this.ctrl.computeColliderMovement(this.collider, desired);
    const mv = this.ctrl.computedMovement();

    const p = this.rb.translation();
    const nx = p.x + mv.x, ny = p.y + mv.y, nz = p.z + mv.z;
    this.rb.setNextKinematicTranslation({ x: nx, y: ny, z: nz });

    // --- Обновление визуала ---
    this.group.position.set(nx, ny - this._capsuleCenterOffset, nz);
    this.group.rotation.y = this.facing;

    // Наклон вперёд — на внутренней модели, а не на внешнем контейнере
    const targetLean = this.isRunning ? 0.14 : (this.isMoving ? 0.05 : 0);
    this.model.rotation.x += (targetLean - this.model.rotation.x) * Math.min(1, dt * 8);

    this._animate(dt, this.isMoving, this.isRunning);
  }

  _animate(dt, moving, running) {
    if (moving) this.walkPhase += dt * (running ? 15 : 9.5);
    else        this.walkPhase += dt * 2.2;

    const amp = moving ? (running ? 0.95 : 0.62) : 0.05;
    const swing = Math.sin(this.walkPhase) * amp;

    this.armL.rotation.x =  swing;
    this.armR.rotation.x = -swing;
    this.legL.rotation.x = -swing * 0.85;
    this.legR.rotation.x =  swing * 0.85;

    // Покачивание корпуса
    const bob = Math.abs(Math.sin(this.walkPhase)) * (moving ? 0.05 : 0.01);
    this.model.position.y = bob;
  }
}