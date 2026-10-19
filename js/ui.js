import { TOTAL_ACHIEVEMENTS } from './data.js';

export class UI {
  constructor() {
    this.el = {
      hud:        document.getElementById('hud'),
      achDone:    document.getElementById('ach-done'),
      achTotal:   document.getElementById('ach-total'),
      toastBox:   document.getElementById('toast-container'),
      dialog:     document.getElementById('dialog'),
      dlgName:    document.getElementById('dialog-name'),
      dlgText:    document.getElementById('dialog-text'),
      dlgNext:    document.getElementById('dialog-next'),
      dlgClose:   document.getElementById('dialog-close'),
      hint:       document.getElementById('interact-hint'),
      hintText:   document.getElementById('interact-text'),
      zoneBadge:  document.getElementById('zone-badge'),
      btnMobile:  document.getElementById('btn-interact-mobile'),
    };

    this.unlocked = new Set();
    this.total = TOTAL_ACHIEVEMENTS;
    this.el.achTotal.textContent = this.total;
    this.el.achDone.textContent = 0;

    // Состояние диалога
    this.dialogLines = [];
    this.dialogIndex = 0;
    this.dialogOpen = false;

    this.onDialogClose = null;

    this._bindDialog();
  }

  /* ---------------- Ачивки ---------------- */
  unlock(id, title, subtitle) {
    if (this.unlocked.has(id)) return false;
    this.unlocked.add(id);
    this.el.achDone.textContent = this.unlocked.size;
    this._showToast(subtitle || 'Достижение', title);
    return true;
  }

  _showToast(caption, title) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <div class="t-icon">🏆</div>
      <div>
        <div class="t-title">${caption}</div>
        <div class="t-name">${title}</div>
      </div>`;
    this.el.toastBox.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, 3400);
  }

  /* ---------------- Подсказка взаимодействия ---------------- */
  showHint(visible, text = 'Взаимодействовать') {
    this.el.hint.classList.toggle('hidden', !visible);
    if (visible) {
      this.el.hintText.textContent = text;
      this.el.hint.classList.remove('hidden');
    }
    // мобильная кнопка
    if (this.el.btnMobile) {
      this.el.btnMobile.classList.toggle('hidden', !visible);
    }
  }

  /* ---------------- Диалог ---------------- */
  openDialog(name, lines) {
    this.dialogLines = lines;
    this.dialogIndex = 0;
    this.dialogOpen = true;

    this.el.dlgName.textContent = name;
    this.el.dlgText.textContent = lines[0];
    this.el.dlgNext.textContent = lines.length > 1 ? 'Далее' : 'Понятно';
    this.el.dialog.classList.remove('hidden');
  }

  _advanceDialog() {
    this.dialogIndex++;
    if (this.dialogIndex >= this.dialogLines.length) {
      this.closeDialog();
      return;
    }
    this.el.dlgText.textContent = this.dialogLines[this.dialogIndex];
    this.el.dlgNext.textContent =
      this.dialogIndex === this.dialogLines.length - 1 ? 'Понятно' : 'Далее';
  }

  closeDialog() {
    this.dialogOpen = false;
    this.el.dialog.classList.add('hidden');
    if (this.onDialogClose) this.onDialogClose();
  }

  _bindDialog() {
    this.el.dlgNext.addEventListener('click', () => this._advanceDialog());
    this.el.dlgClose.addEventListener('click', () => this.closeDialog());

    window.addEventListener('keydown', (e) => {
      if (!this.dialogOpen) return;
      if (e.code === 'Escape') this.closeDialog();
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this._advanceDialog();
      }
    });
  }

  /* ---------------- Метка зоны ---------------- */
  setZone(name, accentCss) {
    if (this.el.zoneBadge.dataset.zone === name) return;
    this.el.zoneBadge.dataset.zone = name;
    this.el.zoneBadge.textContent = name;
    this.el.zoneBadge.style.borderLeftColor = accentCss;
    this.el.zoneBadge.classList.add('show');
    clearTimeout(this._zoneTimer);
    this._zoneTimer = setTimeout(() => {
      this.el.zoneBadge.classList.remove('show');
    }, 2800);
  }

  showHUD() { this.el.hud.classList.remove('hidden'); }
}