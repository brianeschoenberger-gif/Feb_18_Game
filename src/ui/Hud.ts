import Phaser from "phaser";
import { TerrainType } from "../world/Terrain";

export class Hud {
  private readonly barBackground: Phaser.GameObjects.Rectangle;
  private readonly barFill: Phaser.GameObjects.Rectangle;
  private readonly staminaText: Phaser.GameObjects.Text;
  private readonly terrainText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;

  private readonly maxBarWidth = 280;

  public constructor(scene: Phaser.Scene) {
    this.barBackground = scene.add.rectangle(30, 26, this.maxBarWidth, 18, 0x1f2a36, 0.9).setOrigin(0, 0).setScrollFactor(0);
    this.barFill = scene.add.rectangle(30, 26, this.maxBarWidth, 18, 0x65d478, 1).setOrigin(0, 0).setScrollFactor(0);

    this.staminaText = scene.add
      .text(30, 2, "STAMINA", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#eaf2ff",
        fontStyle: "bold"
      })
      .setScrollFactor(0);

    this.terrainText = scene.add
      .text(30, 54, "TERRAIN: OPEN_SNOW", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#eaf2ff"
      })
      .setScrollFactor(0);

    this.hintText = scene.add
      .text(30, 78, "Move: WASD / Arrows   Sprint: Shift", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#c9d8e6"
      })
      .setScrollFactor(0);
  }

  public update(staminaRatio: number, terrain: TerrainType, sprinting: boolean): void {
    const width = Phaser.Math.Clamp(staminaRatio, 0, 1) * this.maxBarWidth;
    this.barFill.width = width;

    if (staminaRatio < 0.2) {
      this.barFill.fillColor = 0xf45d5d;
    } else if (sprinting) {
      this.barFill.fillColor = 0xffcd5f;
    } else {
      this.barFill.fillColor = 0x65d478;
    }

    this.terrainText.setText(`TERRAIN: ${terrain}`);
  }
}
