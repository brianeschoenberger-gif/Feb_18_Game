import Phaser from "phaser";
import {
  HEIGHT_GLOBAL_GRADIENT,
  SLOPE_GRADE_MAX,
  SLOPE_SAMPLE_DISTANCE,
  WORLD_HEIGHT
} from "../core/constants";
import { TerrainType } from "../world/Terrain";

export class TerrainQuery {
  public constructor(private readonly terrainAt: (x: number, y: number) => TerrainType) {}

  public getTerrainAt(x: number, z: number): TerrainType {
    return this.terrainAt(x, z);
  }

  public getHeightAt(x: number, z: number): number {
    const terrain = this.getTerrainAt(x, z);
    const macro = (WORLD_HEIGHT - z) * HEIGHT_GLOBAL_GRADIENT;
    return macro + this.getTerrainHeightBias(terrain);
  }

  public getDownhillVectorAt(x: number, z: number): Phaser.Math.Vector2 {
    const sample = SLOPE_SAMPLE_DISTANCE;
    const hL = this.getHeightAt(x - sample, z);
    const hR = this.getHeightAt(x + sample, z);
    const hU = this.getHeightAt(x, z - sample);
    const hD = this.getHeightAt(x, z + sample);

    const gradX = (hR - hL) / (sample * 2);
    const gradZ = (hD - hU) / (sample * 2);
    const downhill = new Phaser.Math.Vector2(-gradX, -gradZ);
    if (downhill.lengthSq() < 0.0001) {
      return new Phaser.Math.Vector2(0, 1);
    }
    return downhill.normalize();
  }

  public getGradeAt(x: number, z: number): number {
    const sample = SLOPE_SAMPLE_DISTANCE;
    const hL = this.getHeightAt(x - sample, z);
    const hR = this.getHeightAt(x + sample, z);
    const hU = this.getHeightAt(x, z - sample);
    const hD = this.getHeightAt(x, z + sample);

    const gradX = (hR - hL) / (sample * 2);
    const gradZ = (hD - hU) / (sample * 2);
    return Math.min(SLOPE_GRADE_MAX, Math.sqrt(gradX * gradX + gradZ * gradZ));
  }

  private getTerrainHeightBias(terrain: TerrainType): number {
    switch (terrain) {
      case TerrainType.RIDGE_ROCK:
        return 12;
      case TerrainType.GULLY:
        return -10;
      case TerrainType.POWDER:
        return 3;
      case TerrainType.TREES:
        return 1.5;
      case TerrainType.OPEN_SNOW:
      default:
        return 0;
    }
  }
}
