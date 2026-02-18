import Phaser from "phaser";
import {
  EVAC_ZONE_RECT,
  SNOW_PARTICLE_COUNT,
  SNOW_PARTICLE_MAX_SPEED,
  SNOW_PARTICLE_MIN_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "../core/constants";
import { worldToIso } from "../core/iso";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { TerrainField, TerrainType, TerrainZone } from "./Terrain";

interface SnowParticle {
  readonly dot: Phaser.GameObjects.Arc;
  wx: number;
  wy: number;
  readonly speedX: number;
  readonly speedY: number;
}

export class RescueMap {
  public readonly terrain: TerrainField;
  private readonly evacZone = new Phaser.Geom.Rectangle(EVAC_ZONE_RECT.x, EVAC_ZONE_RECT.y, EVAC_ZONE_RECT.width, EVAC_ZONE_RECT.height);
  private readonly beaconPulse: Phaser.GameObjects.Arc[] = [];
  private readonly snowParticles: SnowParticle[] = [];

  public constructor(scene: Phaser.Scene) {
    const zones = this.buildZones();
    this.terrain = new TerrainField(zones);

    this.drawBase(scene);
    this.drawTerrain(scene, zones);
    this.drawLandmark(scene);
    this.drawEvacZone(scene);
    this.createBeaconPulse(scene);
    this.createSnow(scene);
  }

  public update(timeMs: number, dtSec: number): void {
    const cycle = (timeMs % 1500) / 1500;
    this.beaconPulse.forEach((ring, index) => {
      const phase = (cycle + index * 0.33) % 1;
      ring.setScale(0.8 + phase * 2.5);
      ring.setAlpha(0.52 * (1 - phase));
    });

    for (let i = 0; i < this.snowParticles.length; i += 1) {
      const p = this.snowParticles[i];
      p.wx += p.speedX * dtSec;
      p.wy += p.speedY * dtSec;

      if (p.wy > WORLD_HEIGHT + 4) {
        p.wy = -4;
      }
      if (p.wx > WORLD_WIDTH + 4) {
        p.wx = -4;
      }

      const projected = worldToIso(p.wx, p.wy);
      p.dot.x = projected.x;
      p.dot.y = projected.y;
    }
  }

  public getEvacZone(): Phaser.Geom.Rectangle {
    return this.evacZone;
  }

  private drawBase(scene: Phaser.Scene): void {
    const base = scene.add.graphics();
    this.fillIsoRect(base, WORLD_BOUNDS, 0xeef4fb, 1);
    this.strokeIsoRect(base, WORLD_BOUNDS, 0xc8d8e8, 2.2, 0.88);
  }

  private drawTerrain(scene: Phaser.Scene, zones: TerrainZone[]): void {
    const g = scene.add.graphics();

    zones.forEach((zone) => {
      this.fillIsoRect(g, zone.rect, zone.color, 0.93);
      this.strokeIsoRect(g, zone.rect, 0xffffff, 1.2, 0.34);
    });

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Verdana",
      fontSize: "17px",
      color: "#0f2336",
      fontStyle: "bold"
    };

    zones.forEach((zone) => {
      const center = worldToIso(zone.rect.centerX, zone.rect.centerY - 22);
      scene.add.text(center.x - 40, center.y - 12, zone.label, textStyle).setAlpha(0.7).setDepth(zone.rect.centerY + 12);
    });
  }

  private drawLandmark(scene: Phaser.Scene): void {
    const hut = scene.add.graphics();
    const hutRect = new Phaser.Geom.Rectangle(2050, 1470, 190, 130);
    this.fillIsoRect(hut, hutRect, 0x374957, 1);
    this.strokeIsoRect(hut, hutRect, 0xd4e5f7, 2.2, 0.8);

    const windowPos = worldToIso(2140, 1540, 20);
    scene.add.circle(windowPos.x, windowPos.y, 8, 0xffd37e, 0.95).setDepth(1545);

    const label = worldToIso(2145, 1438);
    scene.add
      .text(label.x - 82, label.y - 22, "Patrol Hut / EVAC", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#13293f",
        fontStyle: "bold"
      })
      .setAlpha(0.82)
      .setDepth(1439);
  }

  private drawEvacZone(scene: Phaser.Scene): void {
    const evac = scene.add.graphics();
    this.fillIsoRect(evac, this.evacZone, 0x6ec6ff, 0.2);
    this.strokeIsoRect(evac, this.evacZone, 0x8adaff, 2.5, 0.8);

    const label = worldToIso(this.evacZone.centerX, this.evacZone.y + 12);
    scene.add
      .text(label.x - 28, label.y - 12, "EVAC", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#b8ecff",
        fontStyle: "bold"
      })
      .setAlpha(0.92)
      .setDepth(this.evacZone.centerY + 24);

    const glow = worldToIso(this.evacZone.centerX, this.evacZone.centerY);
    scene.add.ellipse(glow.x, glow.y, 190, 90, 0x8ae9ff, 0.09).setDepth(this.evacZone.centerY + 2);
  }

  private createBeaconPulse(scene: Phaser.Scene): void {
    const c = worldToIso(this.evacZone.centerX, this.evacZone.centerY);
    for (let i = 0; i < 3; i += 1) {
      const ring = scene.add.circle(c.x, c.y, 20, 0xa6e7ff, 0.17);
      ring.setStrokeStyle(3, 0xd8f6ff, 0.95);
      ring.setDepth(this.evacZone.centerY + 30);
      this.beaconPulse.push(ring);
    }
  }

  private createSnow(scene: Phaser.Scene): void {
    for (let i = 0; i < SNOW_PARTICLE_COUNT; i += 1) {
      const wx = Math.random() * WORLD_WIDTH;
      const wy = Math.random() * WORLD_HEIGHT;
      const p = worldToIso(wx, wy);
      const dot = scene.add.circle(p.x, p.y, 1.2 + Math.random() * 1.6, 0xffffff, 0.19 + Math.random() * 0.2);
      dot.setDepth(WORLD_HEIGHT + 400);

      const speedY = Phaser.Math.Linear(SNOW_PARTICLE_MIN_SPEED, SNOW_PARTICLE_MAX_SPEED, Math.random());
      const speedX = Phaser.Math.Linear(1.8, 10.5, Math.random());
      this.snowParticles.push({ dot, wx, wy, speedX, speedY });
    }
  }

  private fillIsoRect(graphics: Phaser.GameObjects.Graphics, rect: Phaser.Geom.Rectangle, color: number, alpha: number): void {
    const points = this.getIsoRectPoints(rect);
    graphics.fillStyle(color, alpha);
    graphics.fillPoints(points, true);
  }

  private strokeIsoRect(graphics: Phaser.GameObjects.Graphics, rect: Phaser.Geom.Rectangle, color: number, lineWidth: number, alpha: number): void {
    const points = this.getIsoRectPoints(rect);
    graphics.lineStyle(lineWidth, color, alpha);
    graphics.strokePoints(points, true, true);
  }

  private getIsoRectPoints(rect: Phaser.Geom.Rectangle): Phaser.Math.Vector2[] {
    return [
      worldToIso(rect.x, rect.y),
      worldToIso(rect.right, rect.y),
      worldToIso(rect.right, rect.bottom),
      worldToIso(rect.x, rect.bottom)
    ];
  }

  private buildZones(): TerrainZone[] {
    return [
      {
        type: TerrainType.POWDER,
        rect: new Phaser.Geom.Rectangle(250, 260, 560, 410),
        color: 0xdde9f5,
        label: "POWDER"
      },
      {
        type: TerrainType.TREES,
        rect: new Phaser.Geom.Rectangle(360, 480, 410, 620),
        color: 0xcce3cf,
        label: "TREES"
      },
      {
        type: TerrainType.RIDGE_ROCK,
        rect: new Phaser.Geom.Rectangle(900, 650, 1180, 220),
        color: 0xd7dee8,
        label: "RIDGE / ROCK"
      },
      {
        type: TerrainType.GULLY,
        rect: new Phaser.Geom.Rectangle(1310, 240, 260, 1240),
        color: 0xc5dbef,
        label: "GULLY"
      }
    ];
  }
}
