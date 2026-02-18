import Phaser from "phaser";
import { PLAYER_COLLISION_RADIUS } from "../core/constants";
import { worldRadiusToIsoEllipse, worldToIso } from "../core/iso";
import { CollisionObstacle } from "../world/Obstacles";

interface DangerDebugState {
  readonly centerX: number;
  readonly centerY: number;
  readonly killRadius: number;
  readonly warningRadius: number;
}

interface CollisionDebugState {
  readonly playerX: number;
  readonly playerY: number;
  readonly obstacles: readonly CollisionObstacle[];
  readonly danger: DangerDebugState;
}

export class CollisionDebugOverlay {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly legend: Phaser.GameObjects.Text;
  private enabled = false;

  public constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(10000);
    this.legend = scene.add
      .text(16, 16, "F2 Collision Debug\nRed solid: lethal\nRed faint: warning\nGreen: player contact", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: "#ffe7e7"
      })
      .setScrollFactor(0)
      .setDepth(10001)
      .setVisible(false);
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.legend.setVisible(enabled);
    if (!enabled) {
      this.graphics.clear();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public update(state: CollisionDebugState): void {
    this.graphics.clear();
    if (!this.enabled) {
      return;
    }

    this.graphics.lineStyle(2, 0xff5f5f, 0.9);
    for (let i = 0; i < state.obstacles.length; i += 1) {
      const o = state.obstacles[i];
      this.strokeIsoRect(o.x - o.width * 0.5, o.y - o.height * 0.5, o.width, o.height);
    }

    const dangerCenter = worldToIso(state.danger.centerX, state.danger.centerY);
    const killIso = worldRadiusToIsoEllipse(state.danger.killRadius);
    const warnIso = worldRadiusToIsoEllipse(state.danger.warningRadius);
    this.graphics.lineStyle(2, 0xff4c4c, 1);
    this.graphics.strokeEllipse(dangerCenter.x, dangerCenter.y, killIso.radiusX * 2, killIso.radiusY * 2);
    this.graphics.lineStyle(1.25, 0xff8d8d, 0.5);
    this.graphics.strokeEllipse(dangerCenter.x, dangerCenter.y, warnIso.radiusX * 2, warnIso.radiusY * 2);

    const contact = worldToIso(state.playerX, state.playerY);
    this.graphics.lineStyle(2, 0x66ffbe, 0.95);
    this.graphics.strokeCircle(contact.x, contact.y, PLAYER_COLLISION_RADIUS * 1.05);
    this.graphics.fillStyle(0x66ffbe, 1);
    this.graphics.fillCircle(contact.x, contact.y, 2);
  }

  public destroy(): void {
    this.graphics.destroy();
    this.legend.destroy();
  }

  private strokeIsoRect(x: number, y: number, width: number, height: number): void {
    const p1 = worldToIso(x, y);
    const p2 = worldToIso(x + width, y);
    const p3 = worldToIso(x + width, y + height);
    const p4 = worldToIso(x, y + height);
    this.graphics.strokePoints([p1, p2, p3, p4], true, true);
  }
}
