import Phaser from 'phaser';
import { Weapon } from './Weapon.js';

export class Axe extends Weapon {
  constructor(scene, owner, cfg) {
    super(scene, owner, cfg);
    this.range = cfg.range;
    this.swingTime = cfg.swingTime;
  }

  use(time) {
    if (this.swinging || !this.canUse(time)) return;
    this.swinging = true;
    this.lastUse = time;

    const base = this.owner.rotation - Math.PI / 2;
    this.scene.tweens.add({
      targets: this.owner.weaponSprite,
      rotation: base + Math.PI,
      duration: this.swingTime,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.swinging = false;
        this.owner.weaponSprite.setRotation(this.owner.rotation);
      },
    });

    // hit at the apex of the swing
    this.scene.time.delayedCall(this.swingTime / 2, () => this.hit());
  }

  hit() {
    const owner = this.owner;
    const enemies = this.scene.enemyGroup ? this.scene.enemyGroup.getChildren() : [];
    for (const e of enemies) {
      if (!e.active) continue;
      const d = Phaser.Math.Distance.Between(owner.x, owner.y, e.x, e.y);
      if (d <= this.range) {
        e.takeDamage(this.damage);
      }
    }
  }
}
