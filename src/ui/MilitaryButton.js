import Phaser from 'phaser';

const FONT_STACK = '"Oswald", "Segoe UI", "Arial Narrow", sans-serif';

export class MilitaryButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, onClick, opts = {}) {
    super(scene, x, y);
    this.label = label;
    this.onClick = onClick;
    this.width = opts.width || 280;
    this.height = opts.height || 62;
    this.fontSize = opts.fontSize || '30px';
    this.interactive = opts.interactive !== false;

    this.gfx = scene.add.graphics();
    this.add(this.gfx);

    this.text = scene.add.text(0, 0, label, {
      fontFamily: FONT_STACK,
      fontSize: this.fontSize,
      fontStyle: 'bold',
      color: '#c9c9cd',
    }).setOrigin(0.5);
    // soft red glow
    this.text.setShadow(0, 2, '#ff2a14', 14, true, true);
    this.add(this.text);

    this.hover = false;

    if (this.interactive) {
      const zone = scene.add.zone(0, 0, this.width, this.height);
      zone.setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => this.setHover(true));
      zone.on('pointerout', () => this.setHover(false));
      zone.on('pointerdown', () => {
        if (this.onClick) this.onClick();
      });
      this.add(zone);
    }

    this.draw();
    scene.add.existing(this);
  }

  setHover(on) {
    if (this.hover === on) return;
    this.hover = on;
    this.scene.tweens.add({
      targets: this,
      scale: on ? 1.06 : 1,
      duration: 120,
      ease: 'Sine.easeOut',
    });
    this.draw();
  }

  chamferPoints(w, h, c) {
    const hw = w / 2;
    const hh = h / 2;
    return [
      { x: -hw + c, y: -hh },
      { x: hw - c, y: -hh },
      { x: hw, y: -hh + c },
      { x: hw, y: hh - c },
      { x: hw - c, y: hh },
      { x: -hw + c, y: hh },
      { x: -hw, y: hh - c },
      { x: -hw, y: -hh + c },
    ];
  }

  draw() {
    const g = this.gfx;
    g.clear();

    const w = this.width;
    const h = this.height;
    const c = 14;
    const hw = w / 2;
    const hh = h / 2;

    const outer = this.chamferPoints(w, h, c);
    const inner = this.chamferPoints(w - 8, h - 8, c - 4);

    // Base semi-transparent dark metallic with inner gradient
    g.fillStyle(0x1a1c22, 0.86);
    g.fillPoints(outer, true, true);
    // inner lighter gradient band (top)
    g.fillStyle(0x3a3e48, 0.35);
    g.fillRect(-hw + 4, -hh + 4, w - 8, (h - 8) * 0.45);
    // inner darker band (bottom)
    g.fillStyle(0x0a0b0d, 0.35);
    g.fillRect(-hw + 4, 0, w - 8, hh - 4);

    // Hover glow under border
    if (this.hover) {
      g.fillStyle(0xff3a22, 0.10);
      g.fillPoints(inner, true, true);
    }

    // Outer border (dark textured metal)
    g.lineStyle(4, this.hover ? 0x8b8f98 : 0x4a4e58, 1);
    g.strokePoints(outer, true, true);
    // Inner border (lighter)
    g.lineStyle(2, 0x5c616c, 1);
    g.strokePoints(inner, true, true);

    // Rivets at corners + edges
    const rivets = [
      { x: -hw + 8, y: -hh + 8 },
      { x: hw - 8, y: -hh + 8 },
      { x: -hw + 8, y: hh - 8 },
      { x: hw - 8, y: hh - 8 },
      { x: 0, y: -hh + 6 },
      { x: 0, y: hh - 6 },
    ];
    for (const r of rivets) {
      g.fillStyle(0x6a6f7a, 1);
      g.fillCircle(r.x, r.y, 3.2);
      g.lineStyle(1, 0x999ca4, 1);
      g.strokeCircle(r.x, r.y, 3.2);
      g.fillStyle(0x2b2e36, 1);
      g.fillCircle(r.x, r.y, 1.1);
    }

    // Red accent under text
    g.lineStyle(2, this.hover ? 0xff3a22 : 0x88301f, 0.9);
    g.strokePoints(inner, true, true);
  }

  setLabel(t) {
    this.label = t;
    this.text.setText(t);
  }
}
