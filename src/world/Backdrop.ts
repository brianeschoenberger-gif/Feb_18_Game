import Phaser from "phaser";

export class Backdrop {
  private readonly sky: Phaser.GameObjects.Rectangle;
  private readonly valleyTint: Phaser.GameObjects.Rectangle;
  private readonly ridgeFar: Phaser.GameObjects.Polygon;
  private readonly ridgeMid: Phaser.GameObjects.Polygon;
  private readonly ridgeNear: Phaser.GameObjects.Polygon;

  public constructor(private readonly scene: Phaser.Scene) {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    this.sky = this.scene.add.rectangle(0, 0, w, h, 0x0a1a2f, 1).setOrigin(0).setScrollFactor(0).setDepth(-1000);
    this.valleyTint = this.scene.add.rectangle(0, h * 0.25, w, h * 0.75, 0x020916, 0.62).setOrigin(0).setScrollFactor(0).setDepth(-995);

    const farPoints = [0, h * 0.4, w * 0.16, h * 0.32, w * 0.3, h * 0.38, w * 0.48, h * 0.28, w * 0.7, h * 0.36, w, h * 0.25, w, h * 0.55, 0, h * 0.55];
    this.ridgeFar = this.scene.add.polygon(0, 0, farPoints, 0x11243b, 0.95).setOrigin(0).setScrollFactor(0).setDepth(-992);

    const midPoints = [0, h * 0.56, w * 0.2, h * 0.46, w * 0.38, h * 0.53, w * 0.61, h * 0.44, w * 0.85, h * 0.52, w, h * 0.47, w, h * 0.75, 0, h * 0.75];
    this.ridgeMid = this.scene.add.polygon(0, 0, midPoints, 0x0b1c31, 0.95).setOrigin(0).setScrollFactor(0).setDepth(-991);

    const nearPoints = [0, h * 0.74, w * 0.18, h * 0.69, w * 0.42, h * 0.74, w * 0.68, h * 0.66, w * 0.87, h * 0.72, w, h * 0.7, w, h, 0, h];
    this.ridgeNear = this.scene.add.polygon(0, 0, nearPoints, 0x081527, 0.9).setOrigin(0).setScrollFactor(0).setDepth(-990);
  }

  public update(cameraX: number, cameraY: number, _dtSec: number): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    this.sky.setSize(w, h);
    this.valleyTint.setPosition(0, h * 0.25).setSize(w, h * 0.75);

    this.ridgeFar.x = -(cameraX * 0.02) % 40;
    this.ridgeFar.y = -6 - (cameraY * 0.01) % 10;

    this.ridgeMid.x = -(cameraX * 0.045) % 70;
    this.ridgeMid.y = -3 - (cameraY * 0.014) % 12;

    this.ridgeNear.x = -(cameraX * 0.07) % 90;
    this.ridgeNear.y = (cameraY * 0.018) % 14;
  }

  public destroy(): void {
    this.sky.destroy();
    this.valleyTint.destroy();
    this.ridgeFar.destroy();
    this.ridgeMid.destroy();
    this.ridgeNear.destroy();
  }
}
