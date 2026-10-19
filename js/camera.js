import * as THREE from 'three';

export class ThirdPersonCamera {
  constructor(camera, targetObject) {
    this.camera = camera;
    this.target = targetObject;

    this.yaw   = Math.PI;      // поворот вокруг игрока
    this.pitch = 0.45;         // наклон
    this.distance = 11;        // текущая дистанция
    this.targetDistance = 11;  // желаемая
    this.minDistance = 3.5;
    this.maxDistance = 26;

    this.minPitch = -0.35;
    this.maxPitch = 1.25;

    this.heightOffset = 1.7;   // точка, вокруг которой вращаемся
    this.sensitivity = 0.0045;

    this._pos = new THREE.Vector3();
    this._look = new THREE.Vector3();
    this._initialized = false;

    // лёгкое «дыхание» камеры для живости
    this._breathe = 0;
  }

  applyInput({ x, y, zoom }) {
    if (x || y) {
      this.yaw   -= x * this.sensitivity;
      this.pitch += y * this.sensitivity;
      this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);
    }
    if (zoom) {
      this.targetDistance = THREE.MathUtils.clamp(
        this.targetDistance + zoom * 0.02,
        this.minDistance, this.maxDistance
      );
    }
  }

  update(dt, moving = false) {
    // Плавная интерполяция дистанции
    this.distance += (this.targetDistance - this.distance) * Math.min(1, dt * 8);

    // Лёгкое покачивание, когда персонаж идёт — «камера в руках оператора»
    this._breathe += dt * (moving ? 9 : 1.4);
    const breatheY = Math.sin(this._breathe) * (moving ? 0.055 : 0.012);
    const breatheX = Math.cos(this._breathe * 0.5) * (moving ? 0.03 : 0.008);

    const t = this.target.position.clone();
    t.y += this.heightOffset;

    const cosP = Math.cos(this.pitch);
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cosP,
      Math.sin(this.pitch),
      Math.cos(this.yaw) * cosP
    ).multiplyScalar(this.distance);

    const desiredPos = t.clone().add(offset);
    desiredPos.y += breatheY;
    desiredPos.x += breatheX;

    const desiredLook = t.clone();
    desiredLook.y += 0.35;

    if (!this._initialized) {
      this._pos.copy(desiredPos);
      this._look.copy(desiredLook);
      this._initialized = true;
    }

    // Экспоненциальное сглаживание, независимое от FPS
    const k = 1 - Math.pow(0.0015, dt);
    this._pos.lerp(desiredPos, k);
    this._look.lerp(desiredLook, k);

    this.camera.position.copy(this._pos);
    this.camera.lookAt(this._look);
  }
}