export const ZONE_SIZE = 200;

export const ZONES = [
  {
    id: 'salda',
    name: 'Верхняя Салда',
    color: 0xEDE0C0,
    accent: 0xE89B3C,
    center: [-100, -100],
    buildings: [
      { id: 'ikmz', name: 'ИКМЗ', kind: 'prod', shape: 'factory', frac: [0.15, 0.15],
        info: 'Здесь делают титановые прутки и заготовки.',
        product: { name: 'Титановый пруток', shape: 'cylinder', color: 0xC8D2DE } },
      { id: 'rossko', name: 'РОССКО', kind: 'prod', shape: 'factory', frac: [0.85, 0.15],
        info: 'Тут производят автомобильные компоненты: тормозные диски.',
        product: { name: 'Тормозной диск', shape: 'disc', color: 0x555A60 } },
      { id: 'allegro', name: 'АЛЛЕГРО', kind: 'prod', shape: 'factory', frac: [0.15, 0.5],
        info: 'На этом заводе делают железнодорожные колёса.',
        product: { name: 'ЖД-колесо', shape: 'torus', color: 0x707880 } },
      { id: 'zibus', name: 'ЗИБУС', kind: 'prod', shape: 'medicalPlant', frac: [0.85, 0.5],
        info: 'ЗИБУС выпускает медицинские инструменты.',
        product: { name: 'Медицинский инструмент', shape: 'thin', color: 0xE0E6EE } },
      { id: 'minikat', name: 'МИНИКАТ', kind: 'prod', shape: 'factory', frac: [0.15, 0.85],
        info: 'Здесь производят кабель и провода.',
        product: { name: 'Кабель', shape: 'torusKnot', color: 0xC97A3C } },
      { id: 'amethyst', name: 'АМЕТИСТ-СПГ', kind: 'prod', shape: 'gasPlant', frac: [0.5, 0.85],
        info: 'Тут делают смешанный природный газ.',
        product: { name: 'Газовый баллон', shape: 'sphere', color: 0x5FA8E0 } },
      { id: 'boeing', name: 'БОИНГ', kind: 'prod', shape: 'hangar', frac: [0.85, 0.85],
        info: 'Авиационный завод: детали для самолётов.',
        product: { name: 'Деталь самолёта', shape: 'plane', color: 0xEEF2F6 } },

      { id: 'zhd',    name: 'ЖД станция', kind: 'infra', shape: 'railwayStation', frac: [0.5, 0.15] },
      { id: 'power',  name: 'Подстанция', kind: 'infra', shape: 'substation', frac: [0.5, 0.5] },
      { id: 'cont',   name: 'Контейнерная', kind: 'infra', shape: 'containerYard', frac: [0.5, 0.35] },
    ],
  },

  {
    id: 'alapaevsk',
    name: 'Алапаевск',
    color: 0xF6D5D5,
    accent: 0xD94F5C,
    center: [100, -100],
    buildings: [
      { id: 'nevstal', name: 'НЕЙВСТАЛЬ', kind: 'prod', shape: 'steelMill', frac: [0.5, 0.5],
        info: 'Этот завод делает стальные шары для мельниц.',
        product: { name: 'Стальной шар', shape: 'sphere', color: 0x9AA3AE } },
      { id: 'ochist', name: 'Очистные сооружения', kind: 'infra', shape: 'tankCluster', frac: [0.2, 0.2] },
    ],
  },

  {
    id: 'patrushi',
    name: 'Патруши',
    color: 0xC8ECC8,
    accent: 0x4CAF50,
    center: [-100, 100],
    buildings: [
      { id: 'simainvest', name: 'СИМА-ИНВЕСТ', kind: 'prod', shape: 'warehouse', frac: [0.5, 0.5],
        info: 'Огромный склад для хранения грузов.',
        product: { name: 'Грузовой контейнер', shape: 'box', color: 0xE89B3C } },
      { id: 'distrib', name: 'Распределительный пункт', kind: 'infra', shape: 'substation', frac: [0.2, 0.2] },
    ],
  },

  {
    id: 'uktus',
    name: 'Уктус',
    color: 0xC8DDF2,
    accent: 0x4A90D9,
    center: [100, 100],
    buildings: [
      { id: 'uzga', name: 'УЗГА', kind: 'prod', shape: 'hangar', frac: [0.5, 0.15],
        info: 'УЗГА изготавливает гражданские самолёты.',
        product: { name: 'Гражданский самолёт', shape: 'plane', color: 0xFFFFFF } },
      { id: 'porevit', name: 'ПОРЕВИТ', kind: 'prod', shape: 'factory', frac: [0.15, 0.5],
        info: 'Производят тротуарную плитку.',
        product: { name: 'Тротуарная плитка', shape: 'tile', color: 0xA0A8B4 } },
      { id: 'omt', name: 'ОМТ', kind: 'prod', shape: 'medicalPlant', frac: [0.5, 0.85],
        info: 'Медицинская техника и мебель.',
        product: { name: 'Медкушетка', shape: 'bed', color: 0xE8F0F8 } },
      { id: 'rusmed', name: 'РУСМЕД', kind: 'prod', shape: 'medicalPlant', frac: [0.85, 0.5],
        info: 'Медицинские расходные материалы.',
        product: { name: 'Медрасходники', shape: 'cylinder', color: 0xF2F6FA } },

      { id: 'kpp',  name: 'КПП', kind: 'infra', shape: 'checkpoint', frac: [0.15, 0.15] },
      { id: 'vpp',  name: 'ВПП', kind: 'infra', shape: 'strip', frac: [0.85, 0.15] },
      { id: 'kotel', name: 'Котельная', kind: 'infra', shape: 'boilerHouse', frac: [0.15, 0.85] },
      { id: 'stol',  name: 'Столовая', kind: 'infra', shape: 'canteen', frac: [0.85, 0.85] },
    ],
  },
];

export function buildingWorldPos(zone, frac) {
  const half = ZONE_SIZE / 2;
  return [
    zone.center[0] - half + frac[0] * ZONE_SIZE,
    zone.center[1] - half + frac[1] * ZONE_SIZE,
  ];
}

export const TOTAL_ACHIEVEMENTS = ZONES.reduce(
  (n, z) => n + z.buildings.filter(b => b.kind === 'prod').length, 0
);