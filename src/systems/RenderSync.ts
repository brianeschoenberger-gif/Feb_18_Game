import Phaser from "phaser";
import { worldToIso } from "../core/iso";

interface RenderSyncItem {
  readonly worldObject: { x: number; y: number };
  readonly renderObject: Phaser.GameObjects.Components.Transform & { setDepth: (value: number) => unknown };
  readonly zBias: number;
  readonly elevation: number | (() => number);
}

export class RenderSync {
  private readonly items: RenderSyncItem[] = [];

  public register(
    worldObject: { x: number; y: number },
    renderObject: Phaser.GameObjects.Components.Transform & { setDepth: (value: number) => unknown },
    zBias = 0,
    elevation: number | (() => number) = 0
  ): void {
    this.items.push({ worldObject, renderObject, zBias, elevation });
  }

  public update(): void {
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      const elevation = typeof item.elevation === "function" ? item.elevation() : item.elevation;
      const p = worldToIso(item.worldObject.x, item.worldObject.y, elevation);
      item.renderObject.x = p.x;
      item.renderObject.y = p.y;
      item.renderObject.setDepth(item.worldObject.y + item.zBias);
    }
  }
}
