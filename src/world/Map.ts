import Phaser from "phaser";
import {
  EVAC_ZONE_RECT,
  MOUNTAIN_HAZE_BANDS,
  MOUNTAIN_CONTOUR_SPACING,
  SNOW_PARTICLE_COUNT,
  SNOW_PARTICLE_MAX_SPEED,
  SNOW_PARTICLE_MIN_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "../core/constants";
import { worldToIso } from "../core/iso";
import { TerrainQuery } from "../sim/TerrainQuery";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { MountainProfile } from "./MountainProfile";
import { TerrainField, TerrainType, TerrainZone } from "./Terrain";

interface SnowParticle {
  readonly dot: Phaser.GameObjects.Arc;
  wx: number;
  wy: number;
  readonly speed: number;
  readonly driftScale: number;
}

export class RescueMap {
  public readonly terrain: TerrainField;
  private readonly mountain: MountainProfile;
  private readonly evacZone = new Phaser.Geom.Rectangle(EVAC_ZONE_RECT.x, EVAC_ZONE_RECT.y, EVAC_ZONE_RECT.width, EVAC_ZONE_RECT.height);
  private readonly beaconPulse: Phaser.GameObjects.Arc[] = [];
  private readonly snowParticles: SnowParticle[] = [];
  private readonly snowWindDir: { x: number; y: number };

  public constructor(scene: Phaser.Scene) {
    const zones = this.buildZones();
    this.terrain = new TerrainField(zones);

    const terrainQuery = new TerrainQuery((x, y) => this.terrain.getTerrainAt(x, y));
    this.mountain = new MountainProfile((x, y) => terrainQuery.getHeightAt(x, y));
    this.snowWindDir = this.mountain.getSlopeDirection(WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.5);

    this.drawBase(scene);
    this.drawBackdropHaze(scene);
    this.drawContours(scene);
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
      const windVariance = Math.sin((timeMs * 0.001 + i * 0.17)) * 0.28;
      const vx = (this.snowWindDir.x + windVariance * 0.22) * p.speed * p.driftScale;
      const vy = (this.snowWindDir.y + 0.36) * p.speed;

      p.wx += vx * dtSec;
      p.wy += vy * dtSec;

      if (p.wy > WORLD_HEIGHT + 6) {
        p.wy = -6;
      }
      if (p.wx > WORLD_WIDTH + 6) {
        p.wx = -6;
      }
      if (p.wx < -6) {
        p.wx = WORLD_WIDTH + 6;
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
    this.fillIsoRect(base, WORLD_BOUNDS, 0xd9e5f1, 1);
    this.strokeIsoRect(base, WORLD_BOUNDS, 0xc2d2e2, 2, 0.9);

    const ridgeGlow = scene.add.graphics();
    const ridgeBand = new Phaser.Geom.Rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT * 0.28);
    this.fillIsoRect(ridgeGlow, ridgeBand, 0xffffff, 0.08);
  }

  private drawBackdropHaze(scene: Phaser.Scene): void {
    const haze = scene.add.graphics();
    for (let i = 0; i < MOUNTAIN_HAZE_BANDS; i += 1) {
      const t = i / (MOUNTAIN_HAZE_BANDS - 1);
      const startY = Phaser.Math.Linear(WORLD_HEIGHT * 0.38, WORLD_HEIGHT * 0.9, t);
      const band = new Phaser.Geom.Rectangle(0, startY, WORLD_WIDTH, WORLD_HEIGHT * 0.15);
      this.fillIsoRect(haze, band, 0x061223, Phaser.Math.Linear(0.02, 0.15, t));
    }
  }

  private drawContours(scene: Phaser.Scene): void {
    const contour = scene.add.graphics();
    contour.lineStyle(1, 0x9db7cf, 0.2);

    const phaseOffset = this.mountain.getContourPhase(WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.5) * MOUNTAIN_CONTOUR_SPACING;
    for (let y = -MOUNTAIN_CONTOUR_SPACING + phaseOffset; y <= WORLD_HEIGHT + MOUNTAIN_CONTOUR_SPACING; y += MOUNTAIN_CONTOUR_SPACING) {
      const p1 = worldToIso(0, y);
      const p2 = worldToIso(WORLD_WIDTH, y);
      contour.beginPath();
      contour.moveTo(p1.x, p1.y);
      contour.lineTo(p2.x, p2.y);
      contour.strokePath();
    }
  }

  private drawTerrain(scene: Phaser.Scene, zones: TerrainZone[]): void {
    const g = scene.add.graphics();

    zones.forEach((zone) => {
      const centerX = zone.rect.centerX;
      const centerY = zone.rect.centerY;
      const elevation = this.mountain.getElevation(centerX, centerY);
      const aspect = this.mountain.getAspectLight(centerX, centerY);
      const normalized = Phaser.Math.Clamp((elevation - 20) / 80, -0.6, 0.8);
      const color = this.shiftTerrainColor(zone.color, normalized, aspect);

      this.fillIsoRect(g, zone.rect, color, 0.94);
      this.strokeIsoRect(g, zone.rect, 0xe8f3ff, 1.35, 0.34);

      if (zone.type === TerrainType.GULLY) {
        this.strokeIsoRect(g, zone.rect, 0x7c9fbb, 2.4, 0.36);
      }
      if (zone.type === TerrainType.RIDGE_ROCK) {
        this.strokeIsoRect(g, zone.rect, 0xf4fbff, 2.5, 0.44);
      }
    });

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Verdana",
      fontSize: "17px",
      color: "#10273d",
      fontStyle: "bold"
    };

    zones.forEach((zone) => {
      const center = worldToIso(zone.rect.centerX, zone.rect.centerY - 18);
      scene.add.text(center.x - 44, center.y - 11, zone.label, textStyle).setAlpha(0.66).setDepth(zone.rect.centerY + 12);
    });
  }

  private drawLandmark(scene: Phaser.Scene): void {
    const hut = scene.add.graphics();
    const hutRect = new Phaser.Geom.Rectangle(2050, 1470, 190, 130);
    this.fillIsoRect(hut, hutRect, 0x2d4050, 1);
    this.strokeIsoRect(hut, hutRect, 0xd4e5f7, 2.4, 0.86);

    const windowPos = worldToIso(2140, 1540, 20);
    scene.add.circle(windowPos.x, windowPos.y, 8, 0xffd37e, 0.96).setDepth(1545);

    const label = worldToIso(2145, 1438);
    scene.add
      .text(label.x - 82, label.y - 22, "Patrol Hut / EVAC", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#152f49",
        fontStyle: "bold"
      })
      .setAlpha(0.85)
      .setDepth(1439);
  }

  private drawEvacZone(scene: Phaser.Scene): void {
    const evac = scene.add.graphics();
    this.fillIsoRect(evac, this.evacZone, 0x66d4ff, 0.25);
    this.strokeIsoRect(evac, this.evacZone, 0x9be7ff, 2.8, 0.92);

    const label = worldToIso(this.evacZone.centerX, this.evacZone.y + 12);
    scene.add
      .text(label.x - 28, label.y - 12, "EVAC", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#cbf6ff",
        fontStyle: "bold"
      })
      .setAlpha(0.96)
      .setDepth(this.evacZone.centerY + 24);

    const glow = worldToIso(this.evacZone.centerX, this.evacZone.centerY);
    scene.add.ellipse(glow.x, glow.y, 220, 110, 0x86ecff, 0.11).setDepth(this.evacZone.centerY + 2);
  }

  private createBeaconPulse(scene: Phaser.Scene): void {
    const c = worldToIso(this.evacZone.centerX, this.evacZone.centerY);
    for (let i = 0; i < 3; i += 1) {
      const ring = scene.add.circle(c.x, c.y, 20, 0xa6e7ff, 0.18);
      ring.setStrokeStyle(3, 0xd8f6ff, 0.96);
      ring.setDepth(this.evacZone.centerY + 30);
      this.beaconPulse.push(ring);
    }
  }

  private createSnow(scene: Phaser.Scene): void {
    for (let i = 0; i < SNOW_PARTICLE_COUNT; i += 1) {
      const wx = Math.random() * WORLD_WIDTH;
      const wy = Math.random() * WORLD_HEIGHT;
      const p = worldToIso(wx, wy);
      const dot = scene.add.circle(p.x, p.y, 1.1 + Math.random() * 1.6, 0xffffff, 0.17 + Math.random() * 0.18);
      dot.setDepth(WORLD_HEIGHT + 420);

      const speed = Phaser.Math.Linear(SNOW_PARTICLE_MIN_SPEED, SNOW_PARTICLE_MAX_SPEED, Math.random());
      const driftScale = Phaser.Math.Linear(0.82, 1.2, Math.random());
      this.snowParticles.push({ dot, wx, wy, speed, driftScale });
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

  private shiftTerrainColor(baseColor: number, elevationN: number, aspectLight: number): number {
    const c = Phaser.Display.Color.IntegerToColor(baseColor);
    const coolBoost = elevationN * 30;
    const shade = aspectLight * 90;
    const r = Phaser.Math.Clamp(Math.round(c.red + coolBoost * 0.5 + shade), 0, 255);
    const g = Phaser.Math.Clamp(Math.round(c.green + coolBoost * 0.75 + shade), 0, 255);
    const b = Phaser.Math.Clamp(Math.round(c.blue + coolBoost * 1.2 + shade * 0.35), 0, 255);
    return Phaser.Display.Color.GetColor(r, g, b);
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
