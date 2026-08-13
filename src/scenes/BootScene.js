import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.createBackground();
    this.createFireGlow();
    this.createEmber();
    this.createSoldier();
    this.createTiles();
    this.createPlayerTexture();
    this.createWeaponTextures();
    this.createBullet();
    this.createEnemyBullet();
    this.createAmmo();
    this.createCoin();
    this.createCamoPreviews();
    this.createIcons();
    this.scene.start('MainMenuScene');
  }

  createBackground() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Vertical gradient: dark gray/black top -> saturated red bottom
    g.fillGradientStyle(0x0e0e12, 0x0e0e12, 0x2a0d0a, 0x401008, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.generateTexture('bg-menu', GAME_WIDTH, GAME_HEIGHT);
    g.destroy();
  }

  createFireGlow() {
    // Radial fire glow (canvas radial gradient)
    const size = 320;
    const tex = this.textures.createCanvas('fireglow', size, size);
    const ctx = tex.getContext();
    const grad = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,150,60,0.9)');
    grad.addColorStop(0.35, 'rgba(220,60,20,0.55)');
    grad.addColorStop(0.7, 'rgba(120,20,8,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    tex.refresh();
  }

  createEmber() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffc78a, 1);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(3, 3, 1.2);
    g.generateTexture('ember', 8, 8);
    g.destroy();
  }

  createSoldier() {
    const W = 300;
    const H = 560;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    const BODY = 0x121317;
    const DARK = 0x0a0b0d;
    const GEAR = 0x1d2026;
    const GEAR_L = 0x2a2e36;
    const METAL = 0x8a9098;
    const METAL_L = 0xb8bec6;

    // ---- Legs ----
    // far leg (right)
    g.fillStyle(DARK);
    g.fillRoundedRect(150, 360, 40, 120, 10);
    // near leg (left)
    g.fillStyle(BODY);
    g.fillRoundedRect(105, 358, 42, 124, 10);
    // knee pads
    g.fillStyle(GEAR);
    g.fillRoundedRect(100, 405, 52, 26, 8);
    g.fillRoundedRect(145, 408, 50, 24, 8);
    // boots
    g.fillStyle(0x050506);
    g.fillRoundedRect(92, 478, 66, 34, 8);
    g.fillRoundedRect(140, 480, 62, 32, 8);

    // ---- Torso + Vest ----
    g.fillStyle(BODY);
    g.fillRoundedRect(98, 200, 128, 170, 16);
    // vest body
    g.fillStyle(GEAR);
    g.fillRoundedRect(104, 214, 116, 140, 12);
    // vest pouches
    g.fillStyle(GEAR_L);
    g.fillRoundedRect(114, 230, 34, 34, 6);
    g.fillRoundedRect(162, 230, 34, 34, 6);
    g.fillRoundedRect(114, 278, 34, 34, 6);
    g.fillRoundedRect(162, 278, 34, 34, 6);
    // chest straps
    g.fillStyle(DARK);
    g.fillRect(128, 214, 12, 140);
    g.fillRect(180, 214, 12, 140);
    // belt
    g.fillStyle(DARK);
    g.fillRect(98, 344, 128, 20);
    g.fillStyle(GEAR_L);
    g.fillRect(152, 346, 26, 16);

    // ---- Shoulder pads ----
    g.fillStyle(GEAR);
    g.fillRoundedRect(82, 196, 48, 30, 10);
    g.fillRoundedRect(196, 198, 44, 28, 10);

    // ---- Neck ----
    g.fillStyle(BODY);
    g.fillRect(145, 172, 42, 34);

    // ---- Head + Helmet ----
    // head
    g.fillStyle(BODY);
    g.fillCircle(164, 146, 26);
    // helmet dome
    g.fillStyle(GEAR);
    g.fillRoundedRect(138, 96, 58, 52, 18);
    // helmet crown
    g.fillStyle(GEAR_L);
    g.fillRoundedRect(142, 88, 50, 26, 14);
    // helmet brim
    g.fillStyle(DARK);
    g.fillRoundedRect(134, 132, 62, 14, 6);
    // NVG mount (front, facing left)
    g.fillStyle(GEAR_L);
    g.fillRoundedRect(124, 118, 22, 12, 4);
    // NVG goggles
    g.fillStyle(0x030304);
    g.fillRoundedRect(112, 122, 26, 10, 4);
    g.fillStyle(0x22ff55);
    g.fillRect(116, 125, 6, 4);

    // ---- Far arm (right side, down) ----
    g.fillStyle(DARK);
    g.fillRoundedRect(198, 226, 30, 78, 10);
    g.fillRoundedRect(194, 298, 38, 24, 8); // glove

    // ---- Near arm (left) holding tomahawk ----
    // upper arm
    g.fillStyle(BODY);
    g.fillRoundedRect(84, 226, 30, 60, 10);
    // forearm raised holding handle
    g.fillStyle(GEAR);
    g.fillRoundedRect(76, 280, 30, 52, 10);
    // glove
    g.fillStyle(DARK);
    g.fillRoundedRect(72, 322, 34, 26, 8);

    // ---- Tomahawk in left hand ----
    // handle (diagonal, going up-forward from hand)
    g.lineStyle(12, 0x3b2a18);
    g.beginPath();
    g.moveTo(88, 330);
    g.lineTo(140, 210);
    g.strokePath();
    // handle wrap
    g.lineStyle(10, 0x2a1d10);
    g.beginPath();
    g.moveTo(95, 310);
    g.lineTo(135, 225);
    g.strokePath();
    // axe head (blade facing up)
    g.fillStyle(METAL);
    g.fillTriangle(140, 210, 196, 190, 136, 248);
    g.fillStyle(METAL_L);
    g.fillTriangle(142, 214, 186, 202, 140, 240);
    // axe edge highlight
    g.lineStyle(3, 0xffffff);
    g.beginPath();
    g.moveTo(196, 190);
    g.lineTo(140, 210);
    g.strokePath();

    // ---- Red rim light (from below / left) ----
    g.lineStyle(3, 0xd42a12, 0.85);
    g.beginPath();
    // left torso edge
    g.moveTo(100, 214);
    g.lineTo(100, 340);
    // near arm
    g.moveTo(84, 230);
    g.lineTo(84, 280);
    // near leg
    g.moveTo(107, 360);
    g.lineTo(107, 476);
    // helmet left
    g.moveTo(138, 112);
    g.lineTo(138, 128);
    g.strokePath();

    // red ambient glow at feet (drawn into texture)
    g.fillStyle(0xcc1c0a, 0.22);
    g.fillEllipse(150, 520, 200, 60);

    g.generateTexture('soldier', W, H);
    g.destroy();
  }

  createCamoPreviews() {
    // Generate 3 top-down soldier previews matching the actual player texture style
    const variants = [
      { 
        key: 'camo-default', 
        shoulderColor: 0x141519, 
        helmetColor: 0x39412e, 
        helmetPatch1: 0x4a5540, 
        helmetPatch2: 0x2c3336, 
        helmetRim: 0x22281c 
      }, 
      { 
        key: 'camo-pink-blue', 
        shoulderColor: 0x1f3a7a, 
        helmetColor: 0xcc3366, 
        helmetPatch1: 0xff6699, 
        helmetPatch2: 0xaa2255, 
        helmetRim: 0x881133 
      }, 
      { 
        key: 'camo-blackred-blackgreen', 
        shoulderColor: 0x1a3a2a, 
        helmetColor: 0x4a0000, 
        helmetPatch1: 0x800000, 
        helmetPatch2: 0x003300, 
        helmetRim: 0x001100 
      },
    ];

    for (const v of variants) {
      const S = 128;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const c = S / 2;

      // shoulders
      g.fillStyle(v.shoulderColor, 1);
      g.fillCircle(c, c, 48);
      g.fillStyle(this.shade(v.shoulderColor, 0.6), 0.9);
      g.fillCircle(c, c + 15, 40);
      g.lineStyle(4, this.lighten(v.shoulderColor), 0.8);
      g.strokeCircle(c, c, 48);

      // arms hint
      g.fillStyle(this.shade(v.shoulderColor, 0.2), 1);
      g.fillCircle(c - 15, c - 42, 12);
      g.fillCircle(c + 15, c - 42, 12);

      // helmet
      g.fillStyle(v.helmetColor, 1);
      g.fillCircle(c, c - 5, 32);
      // camo patches
      g.fillStyle(v.helmetPatch1, 0.9);
      g.fillCircle(c - 8, c - 15, 8);
      g.fillCircle(c + 12, c - 3, 7);
      g.fillStyle(v.helmetPatch2, 0.9);
      g.fillCircle(c + 7, c - 18, 5);
      g.fillCircle(c - 12, c - 5, 5);
      // helmet rim
      g.lineStyle(4, v.helmetRim, 1);
      g.strokeCircle(c, c - 5, 27);
      // helmet shine
      g.fillStyle(0xffffff, 0.22);
      g.fillCircle(c - 6, c - 18, 4);

      g.generateTexture(v.key, S, S);
      g.destroy();
    }
  }

  shade(color, factor) {
    const r = Math.floor(((color >> 16) & 255) * factor);
    const g = Math.floor(((color >> 8) & 255) * factor);
    const b = Math.floor((color & 255) * factor);
    return (r << 16) | (g << 8) | b;
  }

  lighten(color, amt = 0.3) {
    const r = Math.min(255, ((color >> 16) & 255) + Math.floor((255 - ((color >> 16) & 255)) * amt));
    const g = Math.min(255, ((color >> 8) & 255) + Math.floor((255 - ((color >> 8) & 255)) * amt));
    const b = Math.min(255, (color & 255) + Math.floor((255 - (color & 255)) * amt));
    return (r << 16) | (g << 8) | b;
  }

  createTiles() {
    const S = 40;
    // ---- floor: dark concrete ----
    let g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x28292c, 1);
    g.fillRect(0, 0, S, S);
    // subtle noise
    for (let i = 0; i < 26; i++) {
      const shade = Math.random() < 0.5 ? 0x33353a : 0x1e1f22;
      g.fillStyle(shade, 0.5);
      g.fillRect(Math.floor(Math.random() * S), Math.floor(Math.random() * S), 2, 2);
    }
    // tile seam
    g.lineStyle(1, 0x1a1b1e, 0.8);
    g.strokeRect(0, 0, S, S);
    // faint stains
    g.fillStyle(0x1b1c1f, 0.35);
    g.fillCircle(7, 30, 5);
    g.fillCircle(33, 9, 4);
    g.generateTexture('floor', S, S);
    g.destroy();

    // ---- wall: black with faint edge detail ----
    g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, S, S);
    // subtle scratches (barely visible)
    g.lineStyle(1, 0x0c0c0d, 0.8);
    g.beginPath();
    g.moveTo(6, 4);
    g.lineTo(16, 4);
    g.moveTo(22, 30);
    g.lineTo(34, 32);
    g.strokePath();
    // faint edge so the wall reads against the floor
    g.lineStyle(2, 0x17181a, 1);
    g.strokeRect(1.5, 1.5, S - 3, S - 3);
    g.lineStyle(1, 0x040405, 1);
    g.strokeRect(3, 3, S - 6, S - 6);
    // dim rivets
    g.fillStyle(0x101114, 1);
    g.fillCircle(8, 8, 2.2);
    g.fillCircle(32, 8, 2.2);
    g.fillCircle(8, 32, 2.2);
    g.fillCircle(32, 32, 2.2);
    g.generateTexture('wall', S, S);
    g.destroy();
  }

  createPlayerTexture() {
    const S = 72;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const c = S / 2;

    // read selected camo from localStorage
    const camoKey = localStorage.getItem('gansvat_camo') || 'camo-default';
    let shoulderColor = 0x141519;
    let helmetColor = 0x39412e;
    let helmetPatch1 = 0x4a5540;
    let helmetPatch2 = 0x2c3326;
    let helmetRim = 0x22281c;

    if (camoKey === 'camo-pink-blue') {
      shoulderColor = 0x1f3a7a; // blue shoulders
      helmetColor = 0xcc3366; // pink cap
      helmetPatch1 = 0xff6699;
      helmetPatch2 = 0xaa2255;
      helmetRim = 0x881133;
    } else if (camoKey === 'camo-blackred-blackgreen') {
      shoulderColor = 0x1a3a2a; // black-green shoulders
      helmetColor = 0x4a0000; // black-red cap
      helmetPatch1 = 0x800000;
      helmetPatch2 = 0x003300;
      helmetRim = 0x001100;
    }

    // shoulders
    g.fillStyle(shoulderColor, 1);
    g.fillCircle(c, c, 32);
    g.fillStyle(this.shade(shoulderColor, 0.6), 0.9);
    g.fillCircle(c, c + 10, 27);
    g.lineStyle(2, this.lighten(shoulderColor), 0.8);
    g.strokeCircle(c, c, 32);

    // arms hint
    g.fillStyle(this.shade(shoulderColor, 0.2), 1);
    g.fillCircle(c - 10, c - 28, 8);
    g.fillCircle(c + 10, c - 28, 8);

    // helmet
    g.fillStyle(helmetColor, 1);
    g.fillCircle(c, c - 3, 21);
    // camo patches
    g.fillStyle(helmetPatch1, 0.9);
    g.fillCircle(c - 6, c - 10, 6);
    g.fillCircle(c + 9, c + 2, 5);
    g.fillStyle(helmetPatch2, 0.9);
    g.fillCircle(c + 5, c - 12, 4);
    g.fillCircle(c - 9, c + 4, 4);
    // helmet rim
    g.lineStyle(3, helmetRim, 1);
    g.strokeCircle(c, c - 3, 18);
    // helmet shine
    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(c - 4, c - 12, 3);

    g.generateTexture('player', S, S);
    g.destroy();
  }

  createWeaponTextures() {
    // ---- axe (pointing up) ----
    let g = this.make.graphics({ x: 0, y: 0, add: false });
    // handle
    g.fillStyle(0x5a4025, 1);
    g.fillRect(11, 12, 6, 50);
    // wrap
    g.lineStyle(1, 0x3d2b17, 1);
    for (let y = 20; y < 58; y += 6) {
      g.beginPath();
      g.moveTo(11, y);
      g.lineTo(17, y);
      g.strokePath();
    }
    // blade (top, wide)
    g.fillStyle(0x9aa0a8, 1);
    g.fillTriangle(14, 2, 26, 16, 14, 16);
    g.fillTriangle(2, 16, 14, 2, 14, 16);
    g.fillRect(2, 16, 24, 5);
    g.fillStyle(0xc6ccd4, 1);
    g.fillTriangle(14, 2, 24, 15, 14, 15);
    g.fillStyle(0x5f656e, 1);
    g.fillTriangle(4, 17, 24, 17, 14, 21);
    g.generateTexture('weapon-axe', 28, 64);
    g.destroy();

    // ---- pistol (pointing up) ----
    g = this.make.graphics({ x: 0, y: 0, add: false });
    const px = 13;
    // slide / barrel
    g.fillStyle(0x202127, 1);
    g.fillRect(px - 7, 4, 14, 34);
    g.fillStyle(0x2e3038, 1);
    g.fillRect(px - 7, 4, 14, 8);
    // barrel hole + sight
    g.fillStyle(0x0a0a0c, 1);
    g.fillRect(px - 2, 0, 4, 4);
    g.fillStyle(0x34363e, 1);
    g.fillRect(px - 4, 6, 2, 4);
    g.fillRect(px + 2, 6, 2, 4);
    // slide serrations
    g.lineStyle(1, 0x121317, 1);
    for (let y = 18; y < 36; y += 3) {
      g.beginPath();
      g.moveTo(px - 6, y);
      g.lineTo(px + 6, y);
      g.strokePath();
    }
    // trigger guard
    g.lineStyle(3, 0x101114, 1);
    g.beginPath();
    g.arc(px + 2, 50, 8, Math.PI, Math.PI * 2);
    g.strokePath();
    // grip
    g.fillStyle(0x17181c, 1);
    g.fillTriangle(px - 7, 42, px + 3, 40, px - 8, 60);
    g.fillTriangle(px + 3, 40, px + 7, 42, px + 8, 60);
    g.fillStyle(0x2a2c33, 1);
    g.fillRect(px - 3, 44, 6, 13);
    // grip texture
    g.lineStyle(1, 0x0b0b0d, 1);
    for (let y = 47; y < 58; y += 3) {
      g.beginPath();
      g.moveTo(px - 5, y);
      g.lineTo(px + 4, y);
      g.strokePath();
    }
    g.generateTexture('weapon-pistol', 26, 60);
    g.destroy();
  }

  createBullet() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffe066, 1);
    g.fillRoundedRect(1, 4, 6, 12, 2);
    g.fillStyle(0xffcc33, 1);
    g.fillTriangle(4, 4, 1, 8, 7, 8);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(3, 6, 2, 4);
    g.generateTexture('bullet', 8, 16);
    g.destroy();
  }

  createEnemyBullet() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff6b4a, 1);
    g.fillRoundedRect(1, 4, 6, 12, 2);
    g.fillStyle(0xff3a22, 1);
    g.fillTriangle(4, 4, 1, 8, 7, 8);
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(3, 6, 2, 4);
    g.generateTexture('ebullet', 8, 16);
    g.destroy();
  }

  createAmmo() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const c = 16;
    // soft glow so the pickup stands out on the dark floor
    g.fillStyle(0xffe066, 0.08);
    g.fillCircle(c, c, 15);
    g.fillStyle(0xffe066, 0.12);
    g.fillCircle(c, c, 11);
    g.fillStyle(0xffe066, 0.16);
    g.fillCircle(c, c, 7);
    // bullets sticking out of the top
    for (let i = 0; i < 3; i++) {
      const bx = 9.5 + i * 4.5;
      g.fillStyle(0xffe066, 1);
      g.fillRoundedRect(bx, 4, 3, 10, 1);
      g.fillStyle(0xffcc33, 1);
      g.fillTriangle(bx + 1.5, 4, bx, 7, bx + 3, 7);
    }
    // magazine body
    g.fillStyle(0x2b2f36, 1);
    g.fillRoundedRect(7, 11, 18, 15, 3);
    g.lineStyle(1.5, 0x6b7078, 1);
    g.strokeRoundedRect(7, 11, 18, 15, 3);
    // ammo window
    g.fillStyle(0xffd93b, 1);
    g.fillRoundedRect(11, 14, 10, 6, 2);
    g.fillStyle(0x5a4015, 1);
    for (let i = 0; i < 3; i++) {
      g.fillCircle(13 + i * 3, 17, 1.2);
    }
    // bright edge highlight
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(9, 13, 2, 12);
    g.generateTexture('ammo', 32, 32);
    g.destroy();
  }

  createCoin() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const c = 16;
    // gold coin with shine
    g.fillStyle(0xffd700, 1);
    g.fillCircle(c, c, 12);
    g.fillStyle(0xffb300, 1);
    g.fillCircle(c, c, 10);
    g.fillStyle(0xffd700, 1);
    g.fillCircle(c, c, 8);
    // shine highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(c - 3, c - 3, 3);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(c - 4, c - 4, 1.5);
    // border
    g.lineStyle(2, 0xc89600, 1);
    g.strokeCircle(c, c, 11);
    g.generateTexture('coin', 32, 32);
    g.destroy();
  }

  createIcons() {
    const S = 110;
    // ---- icon: axe ----
    let g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x2a2b30, 0.0);
    // handle (diagonal)
    g.lineStyle(16, 0x5a4025);
    g.beginPath();
    g.moveTo(24, 96);
    g.lineTo(84, 22);
    g.strokePath();
    g.lineStyle(12, 0x3d2b17);
    g.beginPath();
    g.moveTo(30, 88);
    g.lineTo(78, 30);
    g.strokePath();
    // blade head
    g.fillStyle(0x9aa0a8, 1);
    g.fillTriangle(84, 22, 100, 4, 102, 34);
    g.fillStyle(0xc6ccd4, 1);
    g.fillTriangle(84, 22, 94, 12, 90, 30);
    g.fillStyle(0x5f656e, 1);
    g.fillTriangle(90, 30, 100, 26, 92, 38);
    g.generateTexture('icon-axe', S, S);
    g.destroy();

    // ---- icon: pistol ----
    g = this.make.graphics({ x: 0, y: 0, add: false });
    const px = 55;
    // slide/barrel (up)
    g.fillStyle(0x23242a, 1);
    g.fillRoundedRect(px - 18, 10, 36, 46, 5);
    g.fillStyle(0x31333b, 1);
    g.fillRoundedRect(px - 18, 10, 36, 14, 5);
    // barrel tip
    g.fillStyle(0x0a0a0c, 1);
    g.fillRect(px - 5, 2, 10, 10);
    g.fillStyle(0x34363e, 1);
    g.fillRect(px - 5, 12, 10, 3);
    // serrations
    g.lineStyle(2, 0x101114, 1);
    for (let y = 34; y < 52; y += 4) {
      g.beginPath();
      g.moveTo(px - 14, y);
      g.lineTo(px + 14, y);
      g.strokePath();
    }
    // frame
    g.fillStyle(0x1a1b1f, 1);
    g.fillRoundedRect(px - 16, 52, 32, 18, 4);
    // trigger guard
    g.lineStyle(5, 0x101114, 1);
    g.beginPath();
    g.arc(px + 4, 76, 14, Math.PI * 0.15, Math.PI * 0.85);
    g.strokePath();
    // grip
    g.fillStyle(0x17181c, 1);
    g.fillRoundedRect(px - 16, 70, 24, 36, 6);
    g.fillStyle(0x2a2c33, 1);
    g.fillRoundedRect(px - 8, 74, 10, 24, 3);
    // grip texture lines
    g.lineStyle(1, 0x0b0b0d, 1);
    for (let y = 78; y < 100; y += 5) {
      g.beginPath();
      g.moveTo(px - 12, y);
      g.lineTo(px + 8, y);
      g.strokePath();
    }
    g.generateTexture('icon-pistol', S, S);
    g.destroy();
  }
}
