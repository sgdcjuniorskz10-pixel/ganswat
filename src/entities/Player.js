import Phaser from 'phaser';
import { PLAYER, WEAPONS_CFG } from '../config.js';
import { Axe } from '../weapons/Axe.js';
import { Pistol } from '../weapons/Pistol.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    this.setDepth(10);

    // weapon sprite that follows the player (points "up" in its texture)
    this.weaponSprite = scene.add.image(x, y, WEAPONS_CFG.axe.weaponTexture);
    this.weaponSprite.setDepth(9);

    // weapons
    const axe = new Axe(scene, this, WEAPONS_CFG.axe);
    const pistol = new Pistol(scene, this, WEAPONS_CFG.pistol);
    this.weapons = [axe, pistol];
    this.currentIndex = 0;
    this.weapon = axe;

    // health
    this.maxHp = PLAYER.maxHp;
    this.hp = PLAYER.maxHp;

    // controls
    this.keys = scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      F: Phaser.Input.Keyboard.KeyCodes.F,
      R: Phaser.Input.Keyboard.KeyCodes.R,
    });

    // auto regen
    this.scene.time.addEvent({
      delay: PLAYER.regenInterval,
      loop: true,
      callback: () => this.regen(),
    });

    this.refreshWeaponVisual();
  }

  setupBody() {
    this.body.setCircle(PLAYER.bodyRadius);
    this.body.setCollideWorldBounds(false);
    // high mass: walls push the player out, enemies barely shove him
    this.body.setMass(8);
  }

  regen() {
    if (this.hp <= 0) return;
    this.hp = Math.min(this.maxHp, this.hp + PLAYER.regenAmount);
  }

  getForward() {
    const r = this.rotation;
    return { x: Math.sin(r), y: -Math.cos(r) };
  }

  update(time) {
    // --- movement ---
    const k = this.keys;
    let dx = (k.D.isDown ? 1 : 0) - (k.A.isDown ? 1 : 0);
    let dy = (k.S.isDown ? 1 : 0) - (k.W.isDown ? 1 : 0);
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }
    this.setVelocity(dx * PLAYER.speed, dy * PLAYER.speed);

    // --- aim at mouse ---
    const p = this.scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, p.worldX, p.worldY);
    this.rotation = angle + Math.PI / 2;

    // weapon follows + aims with player
    const fwd = this.getForward();
    this.weaponSprite.setPosition(this.x + fwd.x * 30, this.y + fwd.y * 30);
    if (!this.weapon.swinging) {
      this.weaponSprite.setRotation(this.rotation);
    }

    // --- weapon switching Q / E ---
    if (Phaser.Input.Keyboard.JustDown(k.Q)) this.switchTo(this.currentIndex - 1);
    if (Phaser.Input.Keyboard.JustDown(k.E)) this.switchTo(this.currentIndex + 1);

    // --- fire F ---
    if (Phaser.Input.Keyboard.JustDown(k.F)) {
      this.weapon.use(time);
    }

    // --- reload R ---
    if (Phaser.Input.Keyboard.JustDown(k.R)) {
      if (this.weapon instanceof Pistol && !this.weapon.isReloading) {
        this.weapon.startReload();
      }
    }

    this.weapon.update(time);
  }

  switchTo(index) {
    const count = this.weapons.length;
    const next = ((index % count) + count) % count;
    if (next === this.currentIndex) return;

    this.weapon.unequip();
    this.currentIndex = next;
    this.weapon = this.weapons[next];
    this.refreshWeaponVisual();
  }

  refreshWeaponVisual() {
    this.weaponSprite.setTexture(this.weapon.weaponTexture);
  }

  takeDamage(amount) {
    if (this.hp <= 0) return;
    this.hp = Math.max(0, this.hp - amount);

    this.setTint(0xff8080);
    this.scene.time.delayedCall(120, () => this.clearTint());

    if (this.hp === 0) {
      this.scene.events.emit('player-died', this);
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  collectAmmo(amount) {
    const pistol = this.weapons.find((w) => w instanceof Pistol);
    if (pistol) pistol.addAmmo(amount);
  }

  onReloadStarted() {}
  onReloadFinished() {}
}
