import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHRASES } from '../config.js';
import { MilitaryButton } from '../ui/MilitaryButton.js';

const FONT_STACK = '"Oswald", "Segoe UI", "Arial Narrow", sans-serif';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    // Background
    this.add.image(0, 0, 'bg-menu').setOrigin(0, 0);

    // Flickering fire glow at the bottom
    this.createFire();

    // Rising embers / sparks
    this.createEmbers();

    // Soldier on the right
    const soldier = this.add.image(830, GAME_HEIGHT - 8, 'soldier').setOrigin(0.5, 1);
    soldier.setDepth(5);
    // red backlight under soldier
    const backlight = this.add.image(830, GAME_HEIGHT - 60, 'fireglow').setBlendMode(Phaser.BlendModes.ADD);
    backlight.setScale(2.4).setAlpha(0.5).setDepth(4);
    backlight.setTint(0xff4020);

    // Buttons (vertical stack, left side)
    const bx = 230;
    const btnStart = new MilitaryButton(this, bx, 360, 'НАЧАТЬ', () => this.scene.start('LoadingScene'));
    const btnCamo = new MilitaryButton(this, bx, 450, 'КАМУФЛЯЖ', () => this.openCamoMenu());
    const btnExit = new MilitaryButton(this, bx, 540, 'ВЫЙТИ', () => this.exitGame());

    // Random phrase text above the НАЧАТЬ button (no plate, just text)
    this.phraseText = this.add.text(bx, 248, '', {
      fontFamily: '"Oswald", "Segoe UI", "Arial Narrow", sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#e8e8ec',
    }).setOrigin(0.5).setAlpha(0);
    this.phraseText.setShadow(0, 2, '#ff2a14', 12, true, true);
    this.phraseText.setDepth(7);
    this.lastPhraseIndex = -1;
    this.showRandomPhrase();
    this.time.addEvent({
      delay: 30000,
      loop: true,
      callback: () => this.showRandomPhrase(),
    });
  }

  openCamoMenu() {
    if (this.camoMenu) return;

    const w = 420;
    const h = 520;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const topH = h * 0.1;
    const pad = 16;

    const menu = this.add.container(cx, cy);
    menu.setDepth(200);
    menu.setScrollFactor(0);

    // background overlay (click to close)
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45);
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.closeCamoMenu());
    menu.add(overlay);

    // main panel
    const panel = this.add.container(0, 0);
    menu.add(panel);

    const bg = this.add.graphics();
    bg.fillStyle(0x1e2026, 0.92);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(2, 0x2a2e38, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    panel.add(bg);

    // divider line between top (10%) and bottom (90%)
    const divY = -h / 2 + topH;
    bg.lineStyle(1, 0x2a2e38, 1);
    bg.lineBetween(-w / 2 + 8, divY, w / 2 - 8, divY);

    // --- TOP SECTION (10%) ---
    // Title left
    const title = this.add.text(-w / 2 + pad, divY, 'КАМУФЛЯЖИ', {
      fontFamily: FONT_STACK,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#d8d8dc',
    }).setOrigin(0, 0.5);
    panel.add(title);

    // Coin icon + count right
    const coins = parseInt(localStorage.getItem('gansvat_coins') || '0', 10);
    const coinIcon = this.add.image(w / 2 - pad - 10, divY, 'coin');
    coinIcon.setDisplaySize(22, 22).setOrigin(1, 0.5);
    panel.add(coinIcon);

    const coinText = this.add.text(w / 2 - pad - 30, divY, String(coins), {
      fontFamily: FONT_STACK,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f0e68c',
    }).setOrigin(1, 0.5);
    coinText.setShadow(0, 2, '#ffb400', 8, true, true);
    panel.add(coinText);
    this.camoCoinText = coinText;

    // --- BOTTOM SECTION (90%) ---
    const bottomY = -h / 2 + topH + 40;

    // read selected camo from localStorage
    const selectedCamo = localStorage.getItem('gansvat_camo') || 'camo-default';
    const purchased = JSON.parse(localStorage.getItem('gansvat_camos_purchased') || '["camo-default"]');

    // 3 camo items in a row
    const camos = [
      { key: 'camo-default', name: 'Стандарт', price: 0 },
      { key: 'camo-pink-blue', name: 'Розовый / Синий', price: 100 },
      { key: 'camo-blackred-blackgreen', name: 'Чёрно-красный / Чёрно-зелёный', price: 200 },
    ].map(c => ({
      ...c,
      owned: purchased.includes(c.key),
      selected: c.key === selectedCamo,
    }));

    const itemW = 120;
    const itemH = 160;
    const gap = 14;
    const startX = -(itemW + gap);

    for (let i = 0; i < 3; i++) {
      const c = camos[i];
      const ix = startX + i * (itemW + gap);
      const iy = bottomY;

      // item background
      const itemBg = this.add.graphics();
      itemBg.fillStyle(c.selected ? 0x1e3a2a : 0x2a2e38, 0.9);
      itemBg.fillRoundedRect(ix - itemW / 2, iy, itemW, itemH, 8);
      itemBg.lineStyle(2, c.selected ? 0x3dff8a : 0x3a3e48, 1);
      itemBg.strokeRoundedRect(ix - itemW / 2, iy, itemW, itemH, 8);
      panel.add(itemBg);

      // soldier preview
      const preview = this.add.image(ix, iy + 30, c.key);
      preview.setDisplaySize(80, 80);
      panel.add(preview);

      // name
      const nameText = this.add.text(ix, iy + 85, c.name, {
        fontFamily: FONT_STACK,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#d8d8dc',
        wordWrap: { width: itemW - 10 },
      }).setOrigin(0.5);
      panel.add(nameText);

      // price / action container
      const actionContainer = this.add.container(ix, iy + itemH - 28);
      panel.add(actionContainer);

      // action text
      let actionText;
      if (c.selected) {
        actionText = this.add.text(0, 0, 'ВЫБРАН', {
          fontFamily: FONT_STACK,
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#3dff8a',
        }).setOrigin(0.5);
        actionText.setShadow(0, 2, '#22ff77', 8, true, true);
      } else if (c.owned) {
        actionText = this.add.text(0, 0, 'НАДЕТЬ', {
          fontFamily: FONT_STACK,
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#f0e68c',
        }).setOrigin(0.5);
        actionText.setShadow(0, 2, '#ffb400', 8, true, true);
      } else {
        actionText = this.add.text(0, 0, `${c.price} монет`, {
          fontFamily: FONT_STACK,
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#f0e68c',
        }).setOrigin(0.5);
        actionText.setShadow(0, 2, '#ffb400', 8, true, true);
      }
      actionContainer.add(actionText);

      // buy button (for non-owned)
      let buyBtn = null;
      if (!c.owned) {
        buyBtn = this.add.text(0, 0, 'КУПИТЬ?', {
          fontFamily: FONT_STACK,
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ff4a22',
        }).setOrigin(0.5).setAlpha(0);
        actionContainer.add(buyBtn);
      }

      // hover logic for non-owned
      const hitZone = this.add.zone(ix, iy + itemH / 2, itemW, itemH);
      hitZone.setInteractive({ useHandCursor: true });
      panel.add(hitZone);

      let hoverTimeout = null;

      hitZone.on('pointerover', () => {
        if (c.owned) return;
        if (hoverTimeout) clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          actionText.setAlpha(0);
          if (buyBtn) {
            buyBtn.setAlpha(1);
            this.tweens.add({ targets: buyBtn, scale: 1.1, duration: 80, yoyo: true, ease: 'Sine.easeOut' });
          }
        }, 150);
      });

      hitZone.on('pointerout', () => {
        if (c.owned) return;
        if (hoverTimeout) clearTimeout(hoverTimeout);
        actionText.setAlpha(1);
        if (buyBtn) buyBtn.setAlpha(0);
      });

      // click handler
      hitZone.on('pointerdown', () => {
        if (c.owned) {
          if (!c.selected) {
            // equip this skin
            localStorage.setItem('gansvat_camo', c.key);
            // update all items in menu
            // rebuild menu by closing and reopening
            this.closeCamoMenu();
            this.time.delayedCall(150, () => this.openCamoMenu());
          }
        } else {
          // buy
          const currentCoins = parseInt(localStorage.getItem('gansvat_coins') || '0', 10);
          if (currentCoins >= c.price) {
            localStorage.setItem('gansvat_coins', String(currentCoins - c.price));
            localStorage.setItem('gansvat_camo', c.key);

            const purchased = JSON.parse(localStorage.getItem('gansvat_camos_purchased') || '["camo-default"]');
            if (!purchased.includes(c.key)) purchased.push(c.key);
            localStorage.setItem('gansvat_camos_purchased', JSON.stringify(purchased));

            const newCoins = currentCoins - c.price;
            this.camoCoinText.setText(String(newCoins));

            // close and reopen to refresh
            this.closeCamoMenu();
            this.time.delayedCall(150, () => this.openCamoMenu());
          } else {
            const msg = this.add.text(ix, iy - 30, 'НЕДОСТАТОЧНО СРЕДСТВ', {
              fontFamily: FONT_STACK,
              fontSize: '16px',
              fontStyle: 'bold',
              color: '#ff4a22',
            }).setOrigin(0.5);
            panel.add(msg);
            this.tweens.add({
              targets: msg,
              y: iy - 50,
              alpha: 0,
              duration: 1200,
              ease: 'Sine.easeOut',
              onComplete: () => msg.destroy(),
            });
          }
        }
      });
    }

    // Close button (X) top-right
    const closeBtn = this.add.text(w / 2 - 28, -h / 2 + 20, '✕', {
      fontFamily: FONT_STACK,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setColor('#f0e68c'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#888'));
    closeBtn.on('pointerdown', () => this.closeCamoMenu());
    panel.add(closeBtn);

    // entrance animation
    panel.setScale(0.85);
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });

    this.camoMenu = menu;
  }

  closeCamoMenu() {
    if (!this.camoMenu) return;
    const panel = this.camoMenu.list[1];
    this.tweens.add({
      targets: panel,
      scale: 0.85,
      alpha: 0,
      duration: 120,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.camoMenu.destroy();
        this.camoMenu = null;
      },
    });
  }

  showRandomPhrase() {
    let idx;
    do {
      idx = Phaser.Math.Between(0, PHRASES.length - 1);
    } while (idx === this.lastPhraseIndex && PHRASES.length > 1);
    this.lastPhraseIndex = idx;
    this.phraseText.setText(PHRASES[idx]);
    this.phraseText.setAlpha(0);
    this.tweens.add({ targets: this.phraseText, alpha: 1, duration: 700, ease: 'Sine.easeOut' });
  }

  createFire() {
    const glows = [
      { x: 250, y: GAME_HEIGHT + 40, scale: 3.2 },
      { x: 470, y: GAME_HEIGHT + 30, scale: 2.4 },
      { x: 90, y: GAME_HEIGHT + 50, scale: 2.0 },
    ];
    this.fireGlows = glows.map((cfg) => {
      const img = this.add.image(cfg.x, cfg.y, 'fireglow').setBlendMode(Phaser.BlendModes.ADD);
      img.setScale(cfg.scale).setAlpha(0.5).setDepth(1);
      img.setTint(0xff4a20);
      this.tweens.add({
        targets: img,
        alpha: { from: 0.35, to: 0.7 },
        scale: { from: cfg.scale * 0.92, to: cfg.scale * 1.06 },
        duration: Phaser.Math.Between(900, 1600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return img;
    });
  }

  createEmbers() {
    const emitter = this.add.particles(0, 0, 'ember', {
      x: { min: 0, max: GAME_WIDTH },
      y: GAME_HEIGHT + 8,
      lifespan: { min: 2500, max: 6000 },
      speedY: { min: -60, max: -180 },
      speedX: { min: -25, max: 25 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.7, end: 0 },
      frequency: 90,
      blendMode: Phaser.BlendModes.ADD,
      tint: [0xffb273, 0xff7a3d, 0xffd9a0],
    });
    emitter.setDepth(6);
  }

  exitGame() {
    window.close();
  }
}
