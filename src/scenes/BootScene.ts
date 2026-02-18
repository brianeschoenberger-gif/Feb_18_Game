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

    this.generatePatrolFrame(g, "playerIso0", 0);
    this.generatePatrolFrame(g, "playerIso1", 1);
    this.generatePatrolFrame(g, "playerIso2", -1);

    g.destroy();

    this.scene.start("GameScene");
  }

  private generatePatrolFrame(g: Phaser.GameObjects.Graphics, key: string, stance: number): void {
    g.clear();

    // Skis
    g.fillStyle(0x9cc0d6, 1);
    g.fillRoundedRect(2, 19 + Math.max(0, stance), 12, 2, 1);
    g.fillRoundedRect(18, 19 + Math.max(0, -stance), 12, 2, 1);

    // Legs
    g.fillStyle(0x243544, 1);
    g.fillRect(11 + stance, 13, 3, 6);
    g.fillRect(17 - stance, 13, 3, 6);

    // Jacket
    g.fillStyle(0xd94141, 1);
    g.fillRoundedRect(10, 7, 12, 8, 2);

    // Cross stripe (ski patrol vibe)
    g.fillStyle(0xf2f5f9, 1);
    g.fillRect(11, 10, 10, 2);

    // Head + helmet
    g.fillStyle(0xf0d1b1, 1);
    g.fillCircle(16, 5, 3);
    g.fillStyle(0x1d2730, 1);
    g.fillRect(13, 1, 6, 2);

    // Poles
    g.lineStyle(1, 0x6f8190, 1);
    g.beginPath();
    g.moveTo(8, 11);
    g.lineTo(6 - stance, 20);
    g.moveTo(24, 11);
    g.lineTo(26 + stance, 20);
    g.strokePath();

    g.generateTexture(key, 32, 24);
  }
}
