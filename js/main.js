import '../style.css';
import * as THREE from 'three';
import { ZONES, TOTAL_ACHIEVEMENTS } from './data.js';
import { buildWorld } from './world.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { ThirdPersonCamera } from './camera.js';
import { InteractablesManager } from './interactables.js';
import { UI } from './ui.js';
import { PhysicsWorld } from './physics.js';

const container = document.getElementById('game-root');

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1524);
scene.fog = new THREE.Fog(0x0b1524, 130, 320);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 700);

const hemi = new THREE.HemisphereLight(0xbcd8ff, 0x2a3446, 0.85);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff2d8, 2.0);
sun.position.set(70, 110, 55);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera;
sc.left = -130; sc.right = 130; sc.top = 130; sc.bottom = -130;
sc.near = 1; sc.far = 380;
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const fillLight = new THREE.DirectionalLight(0x6f9cff, 0.5);
fillLight.position.set(-60, 45, -70);
scene.add(fillLight);

// --- Инициализация физики ---
const physics = await PhysicsWorld.init();

// --- Мир ---
const { interactionPoints } = buildWorld(scene, physics);

// --- Игрок / камера / ввод ---
const player = new Player(scene, physics, new THREE.Vector3(-100, 0, -50));
const input = new Input(renderer.domElement);
const cameraCtrl = new ThirdPersonCamera(camera, player.group);

// --- UI ---
const ui = new UI();

// --- NPC и рычаги ---
const interactables = new InteractablesManager(scene, ui, physics);
let openedCount = 0;

for (const point of interactionPoints) {
  const { zone, building, position, facing } = point;

  const npc = interactables.addNPC({
    position: position.clone(),
    name: building.name,
    accent: zone.accent,
    lines: [
      `Привет! Меня зовут Алексей, я работаю на площадке «${zone.name}».`,
      building.info,
      `Рядом со зданием стоит рычаг — дёрни его, и увидишь нашу продукцию: ${building.product.name}.`,
    ],
  });
  npc.group.rotation.y = facing;

const side = new THREE.Vector3(Math.cos(facing), 0, -Math.sin(facing));

// Рычаг — справа от NPC, на расстоянии 8
const leverPos = position.clone().addScaledVector(side, 8.0);

// Подиум — слева от NPC, на расстоянии 8
const podiumPos = position.clone().addScaledVector(side, -8.0);

interactables.addLever({
  position: leverPos,
  podiumPos: podiumPos,
  product: building.product,
  accent: zone.accent,
  onActivate: () => {
    const isNew = ui.unlock(building.id, building.product.name, `Достижение: ${building.name}`);
    if (isNew) {
      openedCount++;
      if (openedCount === TOTAL_ACHIEVEMENTS) {
        setTimeout(() => ui._showToast('Все достижения!', 'Ты обошёл всю Титановую долину 🎉'), 600);
      }
    }
  },
});
}

// --- Зоны ---
const ZONE_HALF = 100;
const ZONE_CSS = {
  salda: '#E89B3C', alapaevsk: '#D94F5C',
  patrushi: '#4CAF50', uktus: '#4A90D9',
};
function detectZone(pos) {
  for (const z of ZONES) {
    if (Math.abs(pos.x - z.center[0]) < ZONE_HALF &&
        Math.abs(pos.z - z.center[1]) < ZONE_HALF) return z;
  }
  return null;
}

// --- Стартовый экран ---
const startScreen = document.getElementById('start-screen');
const btnStart = document.getElementById('btn-start');
input.locked = true;

btnStart.addEventListener('click', () => {
  startScreen.style.transition = 'opacity .45s';
  startScreen.style.opacity = '0';
  setTimeout(() => startScreen.style.display = 'none', 450);
  ui.showHUD();
  input.locked = false;
});

ui.onDialogClose = () => { input.locked = false; };

// --- Ресайз ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Цикл ---
const clock = new THREE.Clock();
let currentZoneId = null;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t  = clock.elapsedTime;

  cameraCtrl.applyInput(input.consumeCameraDelta());
  player.update(dt, input, cameraCtrl.yaw);
  cameraCtrl.update(dt, player.isMoving);
  interactables.update(dt, t, player.group.position, input);

  physics.step(dt);
  physics.sync();

  // камера после физики — чтобы не отставать от игрока
  cameraCtrl.update(0, player.isMoving);

  const zone = detectZone(player.group.position);
  if (zone && zone.id !== currentZoneId) {
    currentZoneId = zone.id;
    ui.setZone(zone.name, ZONE_CSS[zone.id] || '#ffb347');
  } else if (!zone) currentZoneId = null;

  renderer.render(scene, camera);
}
animate();