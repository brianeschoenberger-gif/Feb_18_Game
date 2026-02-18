import Phaser from "phaser";
import { DangerSnapshot } from "../systems/DangerZone";
import { RescueSnapshot } from "../systems/RescueSystem";
import { TerrainZone } from "../world/Terrain";
import { ObstacleSpec } from "../world/Obstacles";
import { SimSnapshot } from "./SimTypes";

interface SimBridgeOptions {
  readonly playerSprite: Phaser.Physics.Arcade.Sprite;
  readonly getRescueSnapshot: () => RescueSnapshot;
  readonly getDangerSnapshot: () => DangerSnapshot;
  readonly terrainZones: readonly TerrainZone[];
  readonly obstacleSpecs: readonly ObstacleSpec[];
  readonly evacZone: Phaser.Geom.Rectangle;
}

export class SimBridge {
  private readonly playerSprite: Phaser.Physics.Arcade.Sprite;
  private readonly getRescueSnapshot: () => RescueSnapshot;
  private readonly getDangerSnapshot: () => DangerSnapshot;
  private readonly terrainZones: readonly TerrainZone[];
  private readonly obstacleSpecs: readonly ObstacleSpec[];
  private readonly evacZone: Phaser.Geom.Rectangle;

  public constructor(options: SimBridgeOptions) {
    this.playerSprite = options.playerSprite;
    this.getRescueSnapshot = options.getRescueSnapshot;
    this.getDangerSnapshot = options.getDangerSnapshot;
    this.terrainZones = options.terrainZones;
    this.obstacleSpecs = options.obstacleSpecs;
    this.evacZone = options.evacZone;
  }

  public capture(timeSec: number): SimSnapshot {
    const rescue = this.getRescueSnapshot();
    const danger = this.getDangerSnapshot();

    return {
      timeSec,
      player: {
        x: this.playerSprite.x,
        y: this.playerSprite.y,
        headingRad: rescue.directionAngleRad,
        mode: rescue.mode,
        carrying: rescue.hasVictimSecured
      },
      danger: {
        centerX: danger.center.x,
        centerY: danger.center.y,
        radius: danger.radius,
        phase: danger.phase
      },
      objective: {
        evacRect: {
          x: this.evacZone.x,
          y: this.evacZone.y,
          width: this.evacZone.width,
          height: this.evacZone.height
        },
        state: rescue.runState === "WIN" ? "COMPLETE" : rescue.mode === "CARRY" ? "CARRY" : "SEARCHING"
      },
      world: {
        terrainZones: this.terrainZones.map((zone) => ({
          type: zone.type,
          x: zone.rect.x,
          y: zone.rect.y,
          width: zone.rect.width,
          height: zone.rect.height,
          color: zone.color
        })),
        obstacles: this.obstacleSpecs.map((obs) => ({
          x: obs.x,
          y: obs.y,
          width: obs.width,
          height: obs.height,
          kind: obs.texture
        }))
      },
      ui: {
        signal: rescue.signal,
        timerSec: rescue.timerSec,
        runState: rescue.runState,
        loseReason: rescue.loseReason
      }
    };
  }
}
