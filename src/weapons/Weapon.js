export class Weapon {
  constructor(scene, owner, cfg) {
    this.scene = scene;
    this.owner = owner;
    this.key = cfg.key;
    this.name = cfg.name;
    this.hudIcon = cfg.hudIcon;
    this.weaponTexture = cfg.weaponTexture;
    this.damage = cfg.damage;
    this.cooldown = cfg.cooldown;
    this.lastUse = 0;
    this.swinging = false;
  }

  get isReloading() {
    return false;
  }

  canUse(time) {
    return time - this.lastUse >= this.cooldown;
  }

  use(time) {}

  update() {}

  unequip() {}
}
