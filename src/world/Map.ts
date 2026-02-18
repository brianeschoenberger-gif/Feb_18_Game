import Phaser from "phaser";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { TerrainField, TerrainType, TerrainZone } from "./Terrain";

export class RescueMap {
  public readonly terrain: TerrainField;

  public constructor(scene: Phaser.Scene) {
    const zones = this.buildZones();
    this.terrain = new TerrainField(zones);

    this.drawBase(scene);
    this.drawTerrain(scene, zones);
    this.drawLandmark(scene);
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
