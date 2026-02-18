import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  public constructor() {
    super("BootScene");
  }

  public create(): void {
    const g = this.add.graphics();

    g.fillStyle(0xe9f2ff, 1);
    g.fillCircle(14, 14, 14);
    g.lineStyle(2, 0x26445f, 1);
    g.strokeCircle(14, 14, 14);
    g.generateTexture("player", 28, 28);

    g.clear();
    g.fillStyle(0x2b5b2b, 1);
    g.fillCircle(12, 12, 10);
    g.lineStyle(3, 0x1d3f1d, 1);
    g.strokeCircle(12, 12, 10);
    g.generateTexture("tree", 24, 24);

    g.clear();
    g.fillStyle(0x8a939f, 1);
    g.fillRoundedRect(0, 0, 40, 28, 8);
    g.lineStyle(2, 0x6f7782, 1);
    g.strokeRoundedRect(0, 0, 40, 28, 8);
    g.generateTexture("rock", 40, 28);

    g.clear();
    g.fillStyle(0xffdd8f, 1);
    g.fillCircle(10, 10, 7);
    g.lineStyle(2, 0xffffff, 0.9);
    g.strokeCircle(10, 10, 8);
    g.generateTexture("probeMarker", 20, 20);

    g.destroy();

    this.scene.start("GameScene");
  }
}
