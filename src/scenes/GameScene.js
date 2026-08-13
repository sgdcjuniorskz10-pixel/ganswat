import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE, DUNGEON, ENEMY_CFG } from '../config.js';
import { DungeonGenerator } from '../levels/DungeonGenerator.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { AmmoPickup } from '../entities/AmmoPickup.js';

const FONT_STACK = '"Oswald", "Segoe UI", "Arial Narrow", sans-serif';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#060607');

    this.buildLevel();

    this.bulletGroup = this.physics.add.group({ defaultKey: 'bullet' });

    this.createPlayer();

    // enemies + their bullets + loot
    this.enemyBulletGroup = this.physics.add.group({ defaultKey: 'ebullet' });
    this.enemyGroup = this.physics.add.group();
    this.pickupGroup = this.physics.add.group();
    this.enemiesRemaining = 0;
    this.victoryTriggered = false;
    this.spawnEnemies();

    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.add.collider(this.player, this.enemyGroup);
    this.physics.add.collider(this.bulletGroup, this.wallGroup, (bullet) => {
      if (bullet.active) bullet.disableBody(true, true);
    });
    this.physics.add.collider(this.bulletGroup, this.enemyGroup, (bullet, enemy) => {
      if (!bullet.active) return;
      enemy.takeDamage(bullet.dmg || this.player.weapon.damage);
      bullet.disableBody(true, true);
    });
    this.physics.add.collider(this.enemyGroup, this.wallGroup);
    this.physics.add.collider(this.enemyGroup, this.enemyGroup);
    this.physics.add.collider(this.enemyBulletGroup, this.wallGroup, (b) => {
      if (b.active) b.disableBody(true, true);
    });
    this.physics.add.overlap(this.enemyBulletGroup, this.player, (player, b) => {
      if (!b.active) return;
      player.takeDamage(b.dmg || 5);
      b.disableBody(true, true);
    });
    this.physics.add.overlap(this.player, this.pickupGroup, (player, pk) => {
      this.player.collectAmmo(pk.amount);
      pk.collect();
    });

    this.cameras.main.setBounds(0, 0, this.mapW, this.mapH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.createHUD();

    this.events.on('player-died', () => {
      this.time.delayedCall(900, () => {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.time.delayedCall(650, () => this.scene.start('GameOverScene'));
      });
    });

    this.events.on('enemy-died', (enemy) => {
      const x = enemy.x + Phaser.Math.Between(-8, 8);
      const y = enemy.y + Phaser.Math.Between(-8, 8);
      const pk = new AmmoPickup(this, x, y);
      this.add.existing(pk);
      this.physics.add.existing(pk);
      pk.setupBody();
      this.pickupGroup.add(pk);

      this.enemiesRemaining--;

      // earn coins
      const coins = parseInt(localStorage.getItem('gansvat_coins') || '0', 10) + 5;
      localStorage.setItem('gansvat_coins', String(coins));

      if (this.enemiesRemaining <= 0 && !this.victoryTriggered) {
        this.victoryTriggered = true;
        this.time.delayedCall(1200, () => {
          this.cameras.main.fadeOut(600, 0, 0, 0);
          this.time.delayedCall(650, () => this.scene.start('VictoryScene'));
        });
      }
    });
  }

  buildLevel() {
    const gen = new DungeonGenerator(DUNGEON.cols, DUNGEON.rows);
    const dungeon = gen.generate({
      rooms: DUNGEON.rooms,
      minRoom: DUNGEON.minRoom,
      maxRoom: DUNGEON.maxRoom,
      corridorWidth: DUNGEON.corridorWidth,
      padding: DUNGEON.padding,
    });

    this.dungeon = dungeon;
    this.mapW = dungeon.cols * TILE;
    this.mapH = dungeon.rows * TILE;

    // floor (repeated texture across the whole map)
    this.floor = this.add.tileSprite(this.mapW / 2, this.mapH / 2, this.mapW, this.mapH, 'floor');
    this.floor.setDepth(0);

    // walls merged into rectangles
    this.wallGroup = this.physics.add.staticGroup();
    for (const rect of gen.wallRects()) {
      const w = rect.w * TILE;
      const h = rect.h * TILE;
      const img = this.wallGroup.create(rect.x * TILE + w / 2, rect.y * TILE + h / 2, 'wall');
      img.setDisplaySize(w, h);
      img.refreshBody();
      img.setDepth(1);
    }
  }

  createPlayer() {
    const room = this.dungeon.rooms[0];
    const x = room.centerX * TILE;
    const y = room.centerY * TILE;

    this.player = new Player(this, x, y);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
    this.player.setupBody();
  }

  spawnEnemies() {
    const cfg = ENEMY_CFG;
    const rooms = this.dungeon.rooms;
    // skip the first room (player spawn)
    for (let i = 1; i < rooms.length; i++) {
      const r = rooms[i];
      const count = Phaser.Math.Between(cfg.spawnPerRoom.min, cfg.spawnPerRoom.max);
      for (let n = 0; n < count; n++) {
        const x = (r.x + 1 + Phaser.Math.Between(0, r.w - 3)) * TILE;
        const y = (r.y + 1 + Phaser.Math.Between(0, r.h - 3)) * TILE;
        const e = new Enemy(this, x, y);
        this.add.existing(e);
        this.physics.add.existing(e);
        e.setupBody();
        this.enemyGroup.add(e);
        this.enemiesRemaining++;
      }
    }
  }

  createHUD() {
    const hud = this.add.container(0, 0);
    hud.setDepth(100);
    hud.setScrollFactor(0);

    const pad = 16;
    const boxW = 230;
    const boxH = 210;
    const upperH = boxH * 0.8;
    this.hudMetrics = { pad, boxW, boxH, barH: 24, barGap: 14 };

    // --- gray semi-transparent square ---
    const bg = this.add.graphics();
    bg.fillStyle(0x23252a, 0.62);
    bg.fillRoundedRect(pad, pad, boxW, boxH, 8);
    bg.fillStyle(0x3a3e46, 0.3);
    bg.fillRoundedRect(pad + 3, pad + 3, boxW - 6, upperH - 3, 6);
    // divider line (80 / 20)
    bg.fillStyle(0x14161a, 0.8);
    bg.fillRect(pad, pad + upperH, boxW, 3);
    bg.lineStyle(2, 0x0c0d0f, 1);
    bg.strokeRoundedRect(pad, pad, boxW, boxH, 8);
    // rivets on the square
    bg.fillStyle(0x555a64, 1);
    bg.fillCircle(pad + 8, pad + 8, 2.5);
    bg.fillCircle(pad + boxW - 8, pad + 8, 2.5);
    bg.fillCircle(pad + 8, pad + boxH - 8, 2.5);
    bg.fillCircle(pad + boxW - 8, pad + boxH - 8, 2.5);
    hud.add(bg);

    const cx = pad + boxW / 2;

    // --- weapon name ---
    this.hudName = this.add.text(cx, pad + 22, '', {
      fontFamily: FONT_STACK,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#d8d8dc',
    }).setOrigin(0.5);
    this.hudName.setShadow(0, 0, '#ff3a22', 8, true, true);

    // --- weapon icon ---
    this.hudIcon = this.add.image(cx, pad + 82, 'icon-axe').setOrigin(0.5);
    this.hudIcon.setDisplaySize(96, 96);

    // --- ammo ---
    this.hudAmmo = this.add.text(cx, pad + 142, '', {
      fontFamily: FONT_STACK,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#f0e68c',
    }).setOrigin(0.5);

    // --- lower 20% strip label ---
    this.hudHint = this.add.text(cx, pad + upperH + 24, 'Q / E — смена оружия', {
      fontFamily: FONT_STACK,
      fontSize: '14px',
      color: '#7c818c',
    }).setOrigin(0.5);

    hud.add([this.hudName, this.hudIcon, this.hudAmmo, this.hudHint]);

    // --- HP bar below the square ---
    const barY = pad + boxH + 14;
    const barH = 24;
    this.hpBg = this.add.graphics();
    this.hpBg.fillStyle(0x141517, 0.85);
    this.hpBg.fillRoundedRect(pad, barY, boxW, barH, 6);
    this.hpBg.lineStyle(2, 0x0c0d0f, 1);
    this.hpBg.strokeRoundedRect(pad, barY, boxW, barH, 6);

    this.hpFill = this.add.graphics();

    this.hpText = this.add.text(cx, barY + barH / 2, '', {
      fontFamily: FONT_STACK,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.hpText.setShadow(0, 1, '#000000', 4, true, true);

    hud.add([this.hpBg, this.hpFill, this.hpText]);

    this.displayHp = this.player.hp;
  }

  update(time, delta) {
    this.player.update(time);

    const enemies = this.enemyGroup.getChildren();
    for (const e of enemies) {
      e.update(time, delta);
    }

    // --- HUD refresh ---
    const w = this.player.weapon;
    this.hudName.setText(w.name);

    const iconKey = w.hudIcon;
    if (this.hudIcon.texture.key !== iconKey) {
      this.hudIcon.setTexture(iconKey);
    }

    if (w.key === 'pistol') {
      this.hudAmmo.setText(`${w.ammo} / ${w.reserve}`);
      this.hudAmmo.setAlpha(w.isReloading ? 0.45 : 1);
    } else {
      this.hudAmmo.setText('');
    }

    // smooth hp bar
    const hp = this.player.hp;
    const maxHp = this.player.maxHp;
    this.displayHp += (hp - this.displayHp) * 0.2;
    if (Math.abs(hp - this.displayHp) < 0.5) this.displayHp = hp;

    const { pad, boxW, boxH, barH, barGap } = this.hudMetrics;
    const barY = pad + boxH + barGap;
    const fillW = Math.max(0, (this.displayHp / maxHp) * (boxW - 8));
    this.hpFill.clear();
    this.hpFill.fillStyle(0x8f1d0d, 1);
    this.hpFill.fillRoundedRect(pad, barY, boxW - 8, barH - 8, 4);
    this.hpFill.fillStyle(0xe02a12, 1);
    this.hpFill.fillRoundedRect(pad, barY, fillW, barH - 8, 4);
    this.hpFill.fillStyle(0xff6a45, 0.7);
    this.hpFill.fillRect(pad, barY, fillW, (barH - 8) * 0.35);

    this.hpText.setText(`${Math.ceil(hp)}/${maxHp}`);
  }
}
