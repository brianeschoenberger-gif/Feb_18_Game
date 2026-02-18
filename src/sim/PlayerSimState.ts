import { STAMINA_MAX } from "../core/constants";
import { TerrainType } from "../world/Terrain";

export interface PlayerSimState {
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  headingRad: number;
  stamina: number;
  sprinting: boolean;
  terrain: TerrainType;
}

export function createPlayerSimState(x: number, z: number): PlayerSimState {
  return {
    x,
    z,
    y: 0,
    vx: 0,
    vz: 0,
    vy: 0,
    headingRad: -Math.PI / 2,
    stamina: STAMINA_MAX,
    sprinting: false,
    terrain: TerrainType.OPEN_SNOW
  };
}
