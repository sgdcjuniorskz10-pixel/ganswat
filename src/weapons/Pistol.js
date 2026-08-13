import { Weapon } from './Weapon.js';

export class Pistol extends Weapon {
  constructor(scene, owner, cfg) {
    super(scene, owner, cfg);
    this.magSize = cfg.magSize;
    this.reserve = cfg.reserve;
    this.ammo = cfg.magSize;
    this.reloadTime = cfg.reloadTime;
    this.bulletSpeed = cfg.bulletSpeed;
    this.reloading = false;
    this.reloadTimer = null;
  }

  get isReloading() {
    return this.reloading;
  }

  use(time) {
    if (this.reloading) return;
    if (!this.canUse(time)) return;

    if (this.ammo <= 0) {
      this.startReload();
      return;
    }

    this.ammo--;
    this.lastUse = time;
    this.fire();

    if (this.ammo === 0) {
      this.startReload();
    }
  }

  fire() {
    const owner = this.owner;
    const fwd = owner.getForward();

    const bx = owner.x + fwd.x * 34;
    const by = owner.y + fwd.y * 34;

    const bullet = this.scene.bulletGroup.get(bx, by, 'bullet');
    if (bullet) {
      if (bullet.timer) bullet.timer.remove();
      bullet.setActive(true).setVisible(true);
      bullet.body.enable = true;
      bullet.body.reset(bx, by);
      bullet.body.setCircle(3);
      bullet.setAngle(Math.atan2(fwd.y, fwd.x) * 180 / Math.PI);
      bullet.body.setVelocity(fwd.x * this.bulletSpeed, fwd.y * this.bulletSpeed);
      bullet.dmg = this.damage;
      bullet.setDepth(8);
      bullet.timer = this.scene.time.delayedCall(900, () => {
        if (bullet.active) bullet.destroy();
      });
    }

    // muzzle flash
    const flash = this.scene.add.image(bx, by, 'ember').setDepth(9);
    flash.setScale(2.4).setTint(0xffdd77).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.6,
      duration: 70,
      onComplete: () => flash.destroy(),
    });
  }

  startReload() {
    if (this.reloading || this.reserve <= 0 || this.ammo >= this.magSize) return;
    this.reloading = true;
    this.owner.onReloadStarted();

    this.reloadTimer = this.scene.time.delayedCall(this.reloadTime, () => {
      const needed = this.magSize - this.ammo;
      const take = Math.min(needed, this.reserve);
      this.ammo += take;
      this.reserve -= take;
      this.reloading = false;
      this.reloadTimer = null;
      this.owner.onReloadFinished();
    });
  }

  addAmmo(amount) {
    this.reserve += amount;
  }

  unequip() {
    if (this.reloadTimer) {
      this.reloadTimer.remove();
      this.reloadTimer = null;
      this.reloading = false;
    }
  }
}
