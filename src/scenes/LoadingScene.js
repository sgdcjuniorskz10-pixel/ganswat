import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#050507');
    this.cameras.main.fadeIn(400, 5, 5, 7);

    // reset restart flags
    this.started = false;
    this.progress = 0;
    this.dots = 0;
    const emitter = this.add.particles(0, 0, 'ember', {
      x: { min: 0, max: GAME_WIDTH },
      y: GAME_HEIGHT + 8,
      lifespan: { min: 2500, max: 5500 },
      speedY: { min: -40, max: -130 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.45, end: 0 },
      frequency: 140,
      blendMode: Phaser.BlendModes.ADD,
      tint: [0xff7a3d, 0xffb273],
    });
    emitter.setDepth(1);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ЗАГРУЗКА ЛОКАЦИИ', {
      fontFamily: '"Oswald", "Segoe UI", "Arial Narrow", sans-serif',
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#d5d5d8',
    }).setOrigin(0.5).setShadow(0, 0, '#ff3a22', 16, true, true);
    title.setDepth(10);

    // animated dots
    this.dots = 0;
    this.titleText = title;
    this.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        this.dots = (this.dots + 1) % 4;
        this.titleText.setText('ЗАГРУЗКА ЛОКАЦИИ' + '.'.repeat(this.dots));
      },
    });

    // loading bar
    const barW = 320;
    const barX = GAME_WIDTH / 2 - barW / 2;
    const barY = GAME_HEIGHT / 2 + 70;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x1c1e24, 1);
    barBg.fillRoundedRect(barX - 2, barY - 2, barW + 4, 18, 6);
    barBg.setDepth(10);

    this.bar = this.add.graphics();
    this.bar.setDepth(11);
    this.progress = 0;

    this.tweens.add({
      targets: this,
      progress: 1,
      duration: 2200,
      ease: 'Linear',
      onUpdate: () => this.drawBar(barX, barY, barW),
      onComplete: () => {
        if (this.started) return;
        this.started = true;
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(320, () => this.scene.start('GameScene'));
      },
    });
  }

  drawBar(barX, barY, barW) {
    this.bar.clear();
    const w = Math.max(0, barW * this.progress);
    if (w <= 0) return;
    this.bar.fillStyle(0xff3a22, 1);
    this.bar.fillRoundedRect(barX, barY, w, 14, 4);
    this.bar.fillStyle(0xffb273, 0.7);
    this.bar.fillRect(barX, barY, w, 5);
  }
}
