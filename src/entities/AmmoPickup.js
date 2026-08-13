import Phaser from 'phaser';
import { AMMO_PICKUP } from '../config.js';

export class AmmoPickup extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'ammo');
    this.amount = AMMO_PICKUP.amount;
    this.setDepth(4);
    this.setScale(0);
    this.rotation = Phaser.Math.FloatBetween(-0.15, 0.15);

    // pop-in when it drops so the player notices it
    scene.tweens.add({
      targets: this,
      scale: 1.35,
      duration: 300,
      ease: 'Back.easeOut',
    });

    scene.tweens.add({
      targets: this,
      y: y - 6,
      alpha: { from: 0.55, to: 1 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  setupBody() {
    this.body.setCircle(12);
    this.body.setAllowGravity(false);
  }

  collect() {
    if (!this.active) return;
    this.setActive(false);
    this.body.enable = false;
    this.scene.tweens.add({
      targets: this,
      scale: 1.8,
      alpha: 0,
      duration: 180,
      onComplete: () => this.destroy(),
    });
  }
}
