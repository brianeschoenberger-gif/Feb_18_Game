import Phaser from "phaser";
import {
  DANGER_BUFFER_HIT,
  DANGER_CENTER,
  DANGER_GROWTH_AFTER_SECURE_PER_SEC,
  DANGER_GROWTH_AFTER_STRIKE_PER_SEC,
  DANGER_GROWTH_IDLE_PER_SEC,
  DANGER_INITIAL_RADIUS
} from "../core/constants";

export type DangerPhase = "IDLE" | "AFTER_STRIKE" | "AFTER_SECURE";

export interface DangerSnapshot {
  readonly phase: DangerPhase;
  readonly center: Phaser.Math.Vector2;
  readonly radius: number;
  readonly growthPerSec: number;
}

export class DangerZone {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly center = new Phaser.Math.Vector2(DANGER_CENTER.x, DANGER_CENTER.y);
  private phase: DangerPhase = "IDLE";
  private radius = DANGER_INITIAL_RADIUS;
  private destroyed = false;

  public constructor(private readonly scene: Phaser.Scene) {
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(50);
  }

  public update(_dtSec: number): void {
    if (this.destroyed) {
      return;
    }

    this.radius += this.getGrowthRate() * _dtSec;
    this.draw();
  }

  public setPhase(phase: DangerPhase): void {
    this.phase = phase;
  }

  public isPlayerInDanger(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(x, y, this.center.x, this.center.y);
    return distance <= this.radius + DANGER_BUFFER_HIT;
  }

  public distanceToEdge(x: number, y: number): number {
    const distance = Phaser.Math.Distance.Between(x, y, this.center.x, this.center.y);
    return distance - this.radius;
  }

  public getSnapshot(): DangerSnapshot {
    return {
      phase: this.phase,
      center: this.center.clone(),
      radius: this.radius,
      growthPerSec: this.getGrowthRate()
    };
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.graphics.destroy();
  }

  private getGrowthRate(): number {
    switch (this.phase) {
      case "AFTER_STRIKE":
        return DANGER_GROWTH_AFTER_STRIKE_PER_SEC;
      case "AFTER_SECURE":
        return DANGER_GROWTH_AFTER_SECURE_PER_SEC;
      case "IDLE":
      default:
        return DANGER_GROWTH_IDLE_PER_SEC;
    }
  }

  private draw(): void {
    this.graphics.clear();
    this.graphics.fillStyle(0xb52929, 0.16);
    this.graphics.fillCircle(this.center.x, this.center.y, this.radius);

    this.graphics.lineStyle(4, 0xff5a5a, 0.88);
    this.graphics.strokeCircle(this.center.x, this.center.y, this.radius);

    this.graphics.lineStyle(1.5, 0xff9e9e, 0.5);
    this.graphics.strokeCircle(this.center.x, this.center.y, this.radius + 10);
  }
}
