import Phaser from "phaser";
import {
  DANGER_CENTER,
  DANGER_FIXED_TIMESTEP_SEC,
  DANGER_GROWTH_AFTER_SECURE_PER_SEC,
  DANGER_GROWTH_AFTER_STRIKE_PER_SEC,
  DANGER_GROWTH_IDLE_PER_SEC,
  DANGER_INITIAL_RADIUS,
  DANGER_KILL_MARGIN,
  DANGER_WARNING_OFFSET
} from "../core/constants";
import { worldRadiusToIsoEllipse, worldToIso } from "../core/iso";

export type DangerPhase = "IDLE" | "AFTER_STRIKE" | "AFTER_SECURE";

export interface DangerSnapshot {
  readonly phase: DangerPhase;
  readonly center: Phaser.Math.Vector2;
  readonly radius: number;
  readonly warningRadius: number;
  readonly growthPerSec: number;
}

export class DangerZone {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly center = new Phaser.Math.Vector2(DANGER_CENTER.x, DANGER_CENTER.y);
  private phase: DangerPhase = "IDLE";
  private radius = DANGER_INITIAL_RADIUS;
  private destroyed = false;
  private pulse = 0;
  private fixedAccumulatorSec = 0;

  public constructor(private readonly scene: Phaser.Scene) {
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(50);
  }

  public update(dtSec: number): void {
    if (this.destroyed) {
      return;
    }

    this.fixedAccumulatorSec += dtSec;
    const maxSteps = 6;
    let steps = 0;
    while (this.fixedAccumulatorSec >= DANGER_FIXED_TIMESTEP_SEC && steps < maxSteps) {
      this.radius += this.getGrowthRate() * DANGER_FIXED_TIMESTEP_SEC;
      this.fixedAccumulatorSec -= DANGER_FIXED_TIMESTEP_SEC;
      steps += 1;
    }

    this.pulse = (this.pulse + dtSec * this.getPulseSpeed()) % 1;
    this.draw();
  }

  public setPhase(phase: DangerPhase): void {
    this.phase = phase;
  }

  public isPlayerInDanger(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(x, y, this.center.x, this.center.y);
    const effectiveRadius = this.getEffectiveRadius();
    return distance <= effectiveRadius;
  }

  public distanceToEdge(x: number, y: number): number {
    const distance = Phaser.Math.Distance.Between(x, y, this.center.x, this.center.y);
    return distance - this.getEffectiveRadius();
  }

  public getPressureAt(x: number, y: number): number {
    const edgeDistance = this.distanceToEdge(x, y);
    if (edgeDistance <= 0) {
      return 1;
    }

    return Phaser.Math.Clamp(1 - edgeDistance / 450, 0, 1);
  }

  public getSnapshot(): DangerSnapshot {
    return {
      phase: this.phase,
      center: this.center.clone(),
      radius: this.getKillRadius(),
      warningRadius: this.getWarningRadius(),
      growthPerSec: this.getGrowthRate()
    };
  }

  public getKillRadius(): number {
    return Math.max(0, this.radius - DANGER_KILL_MARGIN);
  }

  public getWarningRadius(): number {
    return this.getKillRadius() + DANGER_WARNING_OFFSET;
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

  private getPulseSpeed(): number {
    switch (this.phase) {
      case "AFTER_STRIKE":
        return 0.9;
      case "AFTER_SECURE":
        return 1.4;
      case "IDLE":
      default:
        return 0.55;
    }
  }

  private draw(): void {
    const pulseValue = Math.sin(this.pulse * Math.PI * 2) * 0.5 + 0.5;
    const fillAlpha = Phaser.Math.Linear(0.13, 0.22, pulseValue);
    const strokeAlpha = Phaser.Math.Linear(0.7, 0.98, pulseValue);
    const strokeWidth = Phaser.Math.Linear(2.5, 5.2, pulseValue);
    const lethalRadius = this.getKillRadius();
    const warningRadius = this.getWarningRadius();

    const center = worldToIso(this.center.x, this.center.y);
    const killIso = worldRadiusToIsoEllipse(lethalRadius);
    const warnIso = worldRadiusToIsoEllipse(warningRadius);
    const width = killIso.radiusX * 2;
    const height = killIso.radiusY * 2;
    const warningWidth = warnIso.radiusX * 2;
    const warningHeight = warnIso.radiusY * 2;

    this.graphics.clear();
    this.graphics.fillStyle(0xb52929, fillAlpha);
    this.graphics.fillEllipse(center.x, center.y, width, height);

    this.graphics.lineStyle(strokeWidth, 0xff5a5a, strokeAlpha);
    this.graphics.strokeEllipse(center.x, center.y, width, height);

    this.graphics.lineStyle(1.5, 0xff8d8d, 0.35);
    this.graphics.strokeEllipse(center.x, center.y, warningWidth, warningHeight);
  }

  private getEffectiveRadius(): number {
    return this.getKillRadius();
  }
}
