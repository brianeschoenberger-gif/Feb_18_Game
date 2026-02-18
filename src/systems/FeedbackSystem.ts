import Phaser from "phaser";
import {
  SHAKE_DANGER_INTENSITY,
  SHAKE_DANGER_MS,
  SHAKE_LOSE_INTENSITY,
  SHAKE_LOSE_MS,
  SHAKE_SECURE_INTENSITY,
  SHAKE_SECURE_MS,
  SHAKE_STRIKE_INTENSITY,
  SHAKE_STRIKE_MS,
  SHAKE_WIN_INTENSITY,
  SHAKE_WIN_MS
} from "../core/constants";

export type FeedbackEvent = "STRIKE" | "SECURE" | "DANGER_HIT" | "WIN" | "LOSE";

export class FeedbackSystem {
  private readonly flash: Phaser.GameObjects.Rectangle;
  private flashAlpha = 0;

  public constructor(private readonly scene: Phaser.Scene) {
    this.flash = this.scene.add
      .rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0xffc2c2, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(300);
  }

  public trigger(event: FeedbackEvent): void {
    switch (event) {
      case "STRIKE":
        this.scene.cameras.main.shake(SHAKE_STRIKE_MS, SHAKE_STRIKE_INTENSITY);
        this.setFlash(0xffe4b0, 0.22);
        break;
      case "SECURE":
        this.scene.cameras.main.shake(SHAKE_SECURE_MS, SHAKE_SECURE_INTENSITY);
        this.setFlash(0xb8f0ff, 0.2);
        break;
      case "DANGER_HIT":
        this.scene.cameras.main.shake(SHAKE_DANGER_MS, SHAKE_DANGER_INTENSITY);
        this.setFlash(0xff6f6f, 0.33);
        break;
      case "WIN":
        this.scene.cameras.main.shake(SHAKE_WIN_MS, SHAKE_WIN_INTENSITY);
        this.setFlash(0xc9ffcf, 0.18);
        break;
      case "LOSE":
        this.scene.cameras.main.shake(SHAKE_LOSE_MS, SHAKE_LOSE_INTENSITY);
        this.setFlash(0xff9090, 0.25);
        break;
      default:
        break;
    }
  }

  public update(dtSec: number): void {
    if (this.flashAlpha <= 0) {
      return;
    }

    this.flashAlpha = Math.max(0, this.flashAlpha - dtSec * 1.6);
    this.flash.setAlpha(this.flashAlpha);
  }

  public destroy(): void {
    this.flash.destroy();
  }

  private setFlash(color: number, alpha: number): void {
    this.flash.fillColor = color;
    this.flashAlpha = alpha;
    this.flash.setAlpha(alpha);
  }
}
