import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { MilitaryButton } from '../ui/MilitaryButton.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(500, 0, 0, 0);

    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'МИССИЯ ВЫПОЛНЕНА', {
      fontFamily: '"Oswald", "Segoe UI", "Arial Narrow", sans-serif',
      fontSize: '58px',
      fontStyle: 'bold',
      color: '#e8e8ec',
    }).setOrigin(0.5);
    text.setShadow(0, 0, '#3dff8a', 22, true, true);
    text.setShadow(0, 6, '#22ff77', 30, true, false);

    this.tweens.add({
      targets: text,
      alpha: 0.55,
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: 'Sine.easeInOut',
    });

    new MilitaryButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 'В ГЛАВНОЕ МЕНЮ', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('MainMenuScene'));
    }, { width: 320, height: 64, fontSize: '28px' });
  }
}