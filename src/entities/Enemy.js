import Phaser from 'phaser';
import { ENEMY_CFG, TILE } from '../config.js';

const textureCache = new Map();

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const cfg = ENEMY_CFG;
    const shoulderIdx = Phaser.Math.Between(0, cfg.shoulderColors.length - 1);
    const capIdx = Phaser.Math.Between(0, cfg.caps.length - 1);
    const weaponKey = ['knife', 'pistol', 'rifle'][Phaser.Math.Between(0, 2)];
    const key = `enemy-${shoulderIdx}-${capIdx}-${weaponKey}`;

    if (!textureCache.has(key)) {
      Enemy.buildTexture(scene, key, cfg, shoulderIdx, capIdx, weaponKey);
      textureCache.set(key, true);
    }

    super(scene, x, y, key);

    this.maxHp = cfg.hp;
    this.hp = this.maxHp;
    this.weaponKey = weaponKey;
    this.weaponCfg = cfg.weapons[weaponKey];
    this.attackCooldown = 0;
    this.strafeDir = Math.random() < 0.5 ? 1 : -1;
    this.patrols = Math.random() < cfg.patrolChance;
    this.patrolTarget = null;
    this.patrolWait = 0;
    this.alerted = false;
    this.fovHalf = Phaser.Math.DegToRad(cfg.fov / 2);
    this.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.setDepth(5);
  }

  static buildTexture(scene, key, cfg, shoulderIdx, capIdx, weaponKey) {
    const S = 64;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const c = S / 2;
    const shoulder = cfg.shoulderColors[shoulderIdx];
    const capType = cfg.caps[capIdx];
    const hasCap = capType !== 'none';
    const capColor = capType === 'blue' ? 0x2b5bd7 : 0xe8e8ea;

    // shoulders
    g.fillStyle(shoulder, 1);
    g.fillCircle(c, c, 27);
    g.fillStyle(shade(shoulder, 0.6), 0.9);
    g.fillCircle(c, c + 8, 22);
    g.lineStyle(2, lighten(shoulder), 0.8);
    g.strokeCircle(c, c, 27);

    // weapon stub (points "up" = toward the aimed direction)
    if (weaponKey === 'knife') {
      g.fillStyle(0x8a8f98, 1);
      g.fillTriangle(c - 3, 4, c + 3, 4, c, 18);
      g.fillStyle(0x3d2b17, 1);
      g.fillRect(c - 2, 18, 4, 9);
    } else {
      const len = weaponKey === 'rifle' ? 30 : 20;
      g.fillStyle(0x14151a, 1);
      g.fillRect(c - 4, 2, 8, len);
      g.fillStyle(0x2a2c33, 1);
      g.fillRect(c - 4, 2, 3, len);
    }

    // head
    g.fillStyle(0xd9a37a, 1);
    g.fillCircle(c, c - 6, 13);

    if (hasCap) {
      g.fillStyle(capColor, 1);
      g.fillCircle(c, c - 8, 14);
      g.fillStyle(lighten(capColor), 0.7);
      g.fillCircle(c - 3, c - 10, 4);
      g.lineStyle(2, shade(capColor, 0.7), 1);
      g.strokeCircle(c, c - 8, 14);
      // brim
      g.fillStyle(shade(capColor, 0.8), 1);
      g.fillRect(c - 10, c - 10, 20, 4);
    } else {
      g.fillStyle(0x000000, 0.25);
      g.fillCircle(c, c - 8, 12);
      g.lineStyle(1, 0x000000, 0.4);
      g.strokeCircle(c, c - 6, 13);
    }

    g.generateTexture(key, S, S);
    g.destroy();
  }

  setupBody() {
    this.body.setCircle(20);
    this.body.setCollideWorldBounds(false);
  }

  takeDamage(amount) {
    if (this.hp <= 0) return;
    this.alerted = true;
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) this.die();
  }

  die() {
    if (!this.active) return;
    this.scene.events.emit('enemy-died', this);
    this.body.enable = false;
    this.setActive(false);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 1.15,
      duration: 220,
      onComplete: () => this.destroy(),
    });
  }

  update(time, delta) {
    if (!this.active || this.hp <= 0 || !this.body.enable) return;
    const player = this.scene.player;
    if (!player || player.hp <= 0) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    const w = this.weaponCfg;
    this.attackCooldown -= delta;

    // vision cone + walls — but an alerted enemy reacts in all directions
    if (!this.canSeePlayer(player.x, player.y, w.sight)) {
      if (this.patrols) {
        this.updatePatrol(delta);
      } else {
        this.body.stop();
      }
      return;
    }

    this.rotation = angle + Math.PI / 2;

    if (w.type === 'melee') {
      this.moveToAngle(angle, w.speed);
      if (dist <= w.range && this.attackCooldown <= 0) {
        player.takeDamage(w.damage);
        this.attackCooldown = w.cooldown;
      }
    } else {
      if (dist > w.engage) {
        this.moveToAngle(angle, w.speed);
      } else if (dist < w.engage * 0.55) {
        this.moveToAngle(angle + Math.PI, w.speed);
      } else {
        this.moveToAngle(angle + (Math.PI / 2) * this.strafeDir, w.speed * 0.5);
        if (Math.random() < 0.005) this.strafeDir *= -1;
      }

      if (dist <= w.engage && dist > 60 && this.attackCooldown <= 0) {
        this.fireAt(player);
        this.attackCooldown = w.fireRate;
      }
    }
  }

  moveToAngle(angle, speed) {
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  hasLineOfSight(x, y, maxDist) {
    const grid = this.scene.dungeon?.grid;
    if (!grid) return true;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, x, y);
    if (dist > maxDist) return false;

    const step = TILE / 2;
    const steps = Math.max(1, Math.ceil(dist / step));
    const dx = (x - this.x) / steps;
    const dy = (y - this.y) / steps;

    const cols = grid[0].length;
    const rows = grid.length;

    for (let i = 1; i < steps; i++) {
      const tx = Math.floor((this.x + dx * i) / TILE);
      const ty = Math.floor((this.y + dy * i) / TILE);
      if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return false;
      if (grid[ty][tx] === 1) return false;
    }

    return true;
  }

  canSeePlayer(x, y, sight) {
    if (!this.alerted) {
      const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, x, y);
      const facing = this.rotation - Math.PI / 2;
      const diff = Math.abs(Phaser.Math.Angle.Wrap(angleToTarget - facing));
      if (diff > this.fovHalf) return false;
    }
    return this.hasLineOfSight(x, y, sight);
  }

  updatePatrol(delta) {
    this.patrolWait -= delta;

    if (this.patrolWait > 0) {
      this.body.stop();
      return;
    }

    if (!this.patrolTarget || this.reachedPatrolTarget()) {
      this.patrolTarget = this.pickPatrolTarget();
      this.patrolWait = this.patrolTarget ? Phaser.Math.Between(500, 2200) : 0;
      if (!this.patrolTarget) return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
    this.rotation = angle + Math.PI / 2;
    this.moveToAngle(angle, this.weaponCfg.speed * 0.55);
  }

  reachedPatrolTarget() {
    return Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y) < 12;
  }

  pickPatrolTarget() {
    const grid = this.scene.dungeon?.grid;
    if (!grid) return null;

    const radius = ENEMY_CFG.patrolRadius;
    const cx = Math.floor(this.x / TILE);
    const cy = Math.floor(this.y / TILE);
    const cols = grid[0].length;
    const rows = grid.length;

    for (let i = 0; i < 40; i++) {
      const tx = cx + Phaser.Math.Between(-radius, radius);
      const ty = cy + Phaser.Math.Between(-radius, radius);
      if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) continue;
      if (grid[ty][tx] !== 0) continue;

      const wx = tx * TILE + TILE / 2;
      const wy = ty * TILE + TILE / 2;
      if (this.hasLineOfSight(wx, wy, 2000)) {
        return new Phaser.Math.Vector2(wx, wy);
      }
    }

    return null;
  }

  fireAt(player) {
    const b = this.scene.enemyBulletGroup.get(this.x, this.y, 'ebullet');
    if (!b) return;
    const base = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const a = base + (Math.random() - 0.5) * 0.16;

    if (b.timer) b.timer.remove();
    b.setActive(true).setVisible(true);
    b.body.enable = true;
    b.body.reset(this.x, this.y);
    b.body.setCircle(3);
    b.setAngle(a * 180 / Math.PI);
    b.body.setVelocity(
      Math.cos(a) * this.weaponCfg.bulletSpeed,
      Math.sin(a) * this.weaponCfg.bulletSpeed
    );
    b.dmg = this.weaponCfg.damage;
    b.setDepth(8);
    b.timer = this.scene.time.delayedCall(1200, () => {
      if (b.active) b.destroy();
    });
  }
}

function shade(color, factor) {
  const r = Math.floor(((color >> 16) & 255) * factor);
  const g = Math.floor(((color >> 8) & 255) * factor);
  const b = Math.floor((color & 255) * factor);
  return (r << 16) | (g << 8) | b;
}

function lighten(color, amt = 0.3) {
  const r = Math.min(255, ((color >> 16) & 255) + Math.floor((255 - ((color >> 16) & 255)) * amt));
  const g = Math.min(255, ((color >> 8) & 255) + Math.floor((255 - ((color >> 8) & 255)) * amt));
  const b = Math.min(255, (color & 255) + Math.floor((255 - (color & 255)) * amt));
  return (r << 16) | (g << 8) | b;
}
