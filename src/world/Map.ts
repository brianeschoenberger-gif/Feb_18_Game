import Phaser from "phaser";
import {
  EVAC_ZONE_RECT,
  SNOW_PARTICLE_COUNT,
  SNOW_PARTICLE_MAX_SPEED,
  SNOW_PARTICLE_MIN_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "../core/constants";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { TerrainField, TerrainType, TerrainZone } from "./Terrain";

interface SnowParticle {
  readonly dot: Phaser.GameObjects.Arc;
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
      p.dot.x += p.speedX * dtSec;
      p.dot.y += p.speedY * dtSec;

      if (p.dot.y > WORLD_HEIGHT + 4) {
        p.dot.y = -4;
      }
      if (p.dot.x > WORLD_WIDTH + 4) {
        p.dot.x = -4;
      }
    }
  }

  public getEvacZone(): Phaser.Geom.Rectangle {
    return this.evacZone;
  }

  private drawBase(scene: Phaser.Scene): void {
    const base = scene.add.graphics();
    base.fillStyle(0xeef4fb, 1);
    base.fillRect(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width, WORLD_BOUNDS.height);
    base.lineStyle(6, 0xc8d8e8, 1);
    base.strokeRect(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width, WORLD_BOUNDS.height);
  }

  private drawTerrain(scene: Phaser.Scene, zones: TerrainZone[]): void {
    const g = scene.add.graphics();

    zones.forEach((zone) => {
      g.fillStyle(zone.color, 0.9);
      g.fillRect(zone.rect.x, zone.rect.y, zone.rect.width, zone.rect.height);
      g.lineStyle(2, 0xffffff, 0.28);
      g.strokeRect(zone.rect.x, zone.rect.y, zone.rect.width, zone.rect.height);
    });

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Verdana",
      fontSize: "18px",
      color: "#0f2336",
      fontStyle: "bold"
    };

    zones.forEach((zone) => {
      const tx = zone.rect.x + 10;
      const ty = zone.rect.y + 8;
      scene.add.text(tx, ty, zone.label, textStyle).setAlpha(0.65);
    });
  }

  private drawLandmark(scene: Phaser.Scene): void {
    const hut = scene.add.graphics();
    hut.fillStyle(0x374957, 1);
    hut.fillRoundedRect(2050, 1470, 190, 130, 10);
    hut.fillStyle(0xffd37e, 0.95);
    hut.fillRect(2105, 1510, 40, 32);
    hut.lineStyle(3, 0xd4e5f7, 0.7);
    hut.strokeRoundedRect(2050, 1470, 190, 130, 10);

    scene.add
      .text(2054, 1442, "Patrol Hut / EVAC", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#13293f",
        fontStyle: "bold"
      })
      .setAlpha(0.82);
  }

  private drawEvacZone(scene: Phaser.Scene): void {
    const evac = scene.add.graphics();
    evac.fillStyle(0x6ec6ff, 0.18);
    evac.fillRect(this.evacZone.x, this.evacZone.y, this.evacZone.width, this.evacZone.height);
    evac.lineStyle(3, 0x8adaff, 0.75);
    evac.strokeRect(this.evacZone.x, this.evacZone.y, this.evacZone.width, this.evacZone.height);

    scene.add
      .text(this.evacZone.centerX - 28, this.evacZone.y + 10, "EVAC", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#b8ecff",
        fontStyle: "bold"
      })
      .setAlpha(0.92);

    scene.add.circle(this.evacZone.centerX, this.evacZone.centerY, 90, 0x8ae9ff, 0.08);
  }

  private createBeaconPulse(scene: Phaser.Scene): void {
    const cx = this.evacZone.centerX;
    const cy = this.evacZone.centerY;
    for (let i = 0; i < 3; i += 1) {
      const ring = scene.add.circle(cx, cy, 20, 0xa6e7ff, 0.17);
      ring.setStrokeStyle(3, 0xd8f6ff, 0.95);
      this.beaconPulse.push(ring);
    }
  }

  private createSnow(scene: Phaser.Scene): void {
    for (let i = 0; i < SNOW_PARTICLE_COUNT; i += 1) {
      const dot = scene.add.circle(Math.random() * WORLD_WIDTH, Math.random() * WORLD_HEIGHT, 1.2 + Math.random() * 1.6, 0xffffff, 0.19 + Math.random() * 0.2);
      const speedY = Phaser.Math.Linear(SNOW_PARTICLE_MIN_SPEED, SNOW_PARTICLE_MAX_SPEED, Math.random());
      const speedX = Phaser.Math.Linear(1.8, 10.5, Math.random());
      this.snowParticles.push({ dot, speedX, speedY });
    }
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
