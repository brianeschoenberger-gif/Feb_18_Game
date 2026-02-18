import { TerrainType } from "../world/Terrain";
import { DangerPhase } from "../systems/DangerZone";
import { LoseReason, RescueMode, RunState } from "../systems/RescueSystem";

export interface SimObstacleState {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly kind: "tree" | "rock";
}

export interface SimTerrainZoneState {
  readonly type: TerrainType;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: number;
}

export interface SimSnapshot {
  readonly timeSec: number;
  readonly player: {
    readonly x: number;
    readonly y: number;
    readonly headingRad: number;
    readonly mode: RescueMode;
    readonly carrying: boolean;
  };
  readonly danger: {
    readonly centerX: number;
    readonly centerY: number;
    readonly radius: number;
    readonly phase: DangerPhase;
  };
  readonly objective: {
    readonly evacRect: { x: number; y: number; width: number; height: number };
    readonly state: "SEARCHING" | "CARRY" | "COMPLETE";
  };
  readonly world: {
    readonly terrainZones: readonly SimTerrainZoneState[];
    readonly obstacles: readonly SimObstacleState[];
  };
  readonly ui: {
    readonly signal: number;
    readonly timerSec: number;
    readonly runState: RunState;
    readonly loseReason: LoseReason;
  };
}
