import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(500, 0, 0, 0);

    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Миссия провалена', {
      fontFamily: '"Oswald", "Segoe UI", "Arial Narrow", sans-serif',
      fontSize: '58px',
      fontStyle: 'bold',
      color: '#e8e8ec',
    }).setOrigin(0.5);
    text.setShadow(0, 0, '#ff2a14', 22, true, true);
    text.setShadow(0, 6, '#ff2a14', 30, true, false);

    this.tweens.add({
      targets: text,
      alpha: 0.55,
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: 'Sine.easeInOut',
    });

    this.time.delayedCall(2600, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(650, () => this.scene.start('MainMenuScene'));
    });
  }
}
