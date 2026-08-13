export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 640;

export const PHRASES = [
  'когда начнем?',
  'чего ждем?',
  'еще долго прохлождаться?',
  'зачем я здесь?',
  'смешно меня мучать?',
  'может пойдем наконец?',
  '...?',
];

export const TILE = 40;

export const DUNGEON = {
  cols: 64,
  rows: 42,
  rooms: 16,
  minRoom: 4,
  maxRoom: 9,
  corridorWidth: 2,
  padding: 2,
};

export const PLAYER = {
  speed: 230,
  maxHp: 200,
  regenAmount: 25,
  regenInterval: 30000,
  bodyRadius: 22,
};

export const WEAPONS_CFG = {
  axe: {
    key: 'axe',
    name: 'ТОПОР',
    hudIcon: 'icon-axe',
    weaponTexture: 'weapon-axe',
    damage: 40,
    cooldown: 650,
    range: 72,
    swingTime: 240,
  },
  pistol: {
    key: 'pistol',
    name: 'ПИСТОЛЕТ',
    hudIcon: 'icon-pistol',
    weaponTexture: 'weapon-pistol',
    damage: 10,
    cooldown: 260,
    magSize: 12,
    reserve: 60,
    reloadTime: 1500,
    bulletSpeed: 700,
  },
};

export const AMMO_PICKUP = {
  amount: 20,
};

export const ENEMY_CFG = {
  hp: 50,
  spawnPerRoom: { min: 0, max: 4 },
  patrolChance: 0.7,
  patrolRadius: 9,
  fov: 140,
  shoulderColors: [0x7a1f1f, 0x1f3a7a, 0x3a1f6e, 0x6e3a1f, 0x1f6e4a, 0x4a4a4a],
  caps: ['none', 'blue', 'white'],
  weapons: {
    knife: { type: 'melee', damage: 30, range: 48, cooldown: 900, speed: 190, sight: 240 },
    pistol: { type: 'ranged', damage: 5, fireRate: 1000, bulletSpeed: 420, engage: 380, speed: 150, sight: 500 },
    rifle: { type: 'ranged', damage: 10, fireRate: 300, bulletSpeed: 520, engage: 460, speed: 155, sight: 580 },
  },
};
