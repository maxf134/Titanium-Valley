export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.move = { x: 0, y: 0 };   // джойстик: x∈[-1..1], y∈[-1..1] (вверх = -1)
    this.run = false;
    this.camDX = 0;               // накопленный сдвиг камеры за кадр
    this.camDY = 0;
    this.zoom = 0;
    this.interact = false;   
    this.jump = false;      // флаг «нажали E / кнопку Действие»
    this.locked = false;          // блокировка (диалог / старт-экран)
    this.isTouch = matchMedia('(pointer: coarse)').matches;

    this._dragging = false;
    this._lastX = 0;
    this._lastY = 0;
    this._activePointer = null;

    this._bindKeyboard();
    this._bindPointer();
    this._bindWheel();
    this._bindJoystick();
  }

  /* ---------- Клавиатура ---------- */
   _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'KeyE') this.interact = true;
      if (e.code === 'Space') this.jump = true;                    // ← добавить
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.run = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.run = false;
    });
    window.addEventListener('blur', () => { this.keys.clear(); this.run = false; });
  }

  /* ---------- Мышь / тач по canvas → вращение камеры ---------- */
  _bindPointer() {
    const c = this.canvas;

    c.addEventListener('pointerdown', (e) => {
      if (this.locked) return;
      if (this._activePointer !== null) return;
      this._activePointer = e.pointerId;
      this._dragging = true;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      c.setPointerCapture(e.pointerId);
    });

    c.addEventListener('pointermove', (e) => {
      if (!this._dragging || e.pointerId !== this._activePointer) return;
      this.camDX += e.clientX - this._lastX;
      this.camDY += e.clientY - this._lastY;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });

    const end = (e) => {
      if (e.pointerId !== this._activePointer) return;
      this._dragging = false;
      this._activePointer = null;
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  }

  /* ---------- Колесо → зум ---------- */
  _bindWheel() {
    this.canvas.addEventListener('wheel', (e) => {
      if (this.locked) return;
      e.preventDefault();
      this.zoom += e.deltaY;
    }, { passive: false });
  }

  /* ---------- Мобильный джойстик ---------- */
  _bindJoystick() {
    const joyEl  = document.getElementById('joystick');
    const baseEl = document.getElementById('joystick-base');
    const knobEl = document.getElementById('joystick-knob');
    if (!joyEl || !baseEl || !knobEl) return;

    if (this.isTouch) joyEl.classList.remove('hidden');

    const R = 46;
    let pointerId = null;

    baseEl.addEventListener('pointerdown', (e) => {
      if (this.locked || pointerId !== null) return;
      pointerId = e.pointerId;
      baseEl.setPointerCapture(e.pointerId);
      e.stopPropagation();
      e.preventDefault();
    });

    baseEl.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId) return;
      const rect = baseEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > R) { dx = dx / dist * R; dy = dy / dist * R; }

      knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
      this.move.x = dx / R;
      this.move.y = dy / R;
      e.stopPropagation();
      e.preventDefault();
    });

    const reset = (e) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      knobEl.style.transform = 'translate(0,0)';
      this.move.x = 0;
      this.move.y = 0;
    };
    baseEl.addEventListener('pointerup', reset);
    baseEl.addEventListener('pointercancel', reset);

    // Кнопка «Действие»
    const btn = document.getElementById('btn-interact-mobile');
    if (btn) {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.interact = true;
      });
    }
  }

  /** Забрать накопленные дельты камеры */
  consumeCameraDelta() {
    const d = { x: this.camDX, y: this.camDY, zoom: this.zoom };
    this.camDX = 0;
    this.camDY = 0;
    this.zoom = 0;
    return d;
  }

  /** Забрать флаг взаимодействия */
  consumeInteract() {
    if (!this.interact) return false;
    this.interact = false;
    return true;
  }

  consumeJump() {
    if (!this.jump) return false;
    this.jump = false;
    return true;
  }
}