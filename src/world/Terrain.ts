import Phaser from "phaser";

export enum TerrainType {
  OPEN_SNOW = "OPEN_SNOW",
  POWDER = "POWDER",
  TREES = "TREES",
  RIDGE_ROCK = "RIDGE_ROCK",
  GULLY = "GULLY"
}

export interface TerrainZone {
  readonly type: TerrainType;
  readonly rect: Phaser.Geom.Rectangle;
  readonly color: number;
  readonly label: string;
}

export class TerrainField {
  private readonly zones: TerrainZone[];

  public constructor(zones: TerrainZone[]) {
    this.zones = zones;
  }

  public getTerrainAt(x: number, y: number): TerrainType {
    for (let i = this.zones.length - 1; i >= 0; i -= 1) {
      if (this.zones[i].rect.contains(x, y)) {
        return this.zones[i].type;
      }
    }

    return TerrainType.OPEN_SNOW;
  }

  public getZones(): readonly TerrainZone[] {
    return this.zones;
  }
}
