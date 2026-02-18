import Phaser from "phaser";
import {
  COLLISION_MAX_STEP_DISTANCE,
  COLLISION_MAX_SUBSTEPS,
  DOWNHILL_DRIFT_ACCEL,
  GULLY_TURN_STICKINESS,
  HEIGHT_SMOOTHING,
  PLAYER_ACCEL,
  PLAYER_BASE_SPEED,
  PLAYER_CONTACT_OFFSET_Y_WORLD,
  PLAYER_DECEL,
  PLAYER_SPRINT_MULTIPLIER,
  SLOPE_SPEED_INFLUENCE,
  STAMINA_DRAIN_PER_SEC,
  STAMINA_MAX,
  STAMINA_MIN_TO_SPRINT,
  STAMINA_REGEN_PER_SEC,
  TERRAIN_SPEED_MODIFIER
} from "../core/constants";
import { TerrainType } from "../world/Terrain";
import { CollisionWorld } from "./CollisionWorld";
import { InputFrame } from "./InputFrame";
import { createPlayerSimState, PlayerSimState } from "./PlayerSimState";
import { TerrainQuery } from "./TerrainQuery";

interface LocomotionConstraints {
  readonly inputEnabled: boolean;
  readonly sprintEnabled: boolean;
  readonly speedMultiplier: number;
}

export class Locomotion3D {
  private readonly state: PlayerSimState;
  private readonly lastMoveDir = new Phaser.Math.Vector2(0, -1);

  public constructor(
    x: number,
    z: number,
    private readonly terrainQuery: TerrainQuery,
    private readonly collisionWorld: CollisionWorld,
    private readonly radius = 12
  ) {
    this.state = createPlayerSimState(x, z);
  }

  public step(dtSec: number, input: InputFrame, constraints: LocomotionConstraints): void {
    const inputX = constraints.inputEnabled ? input.moveX : 0;
    const inputZ = constraints.inputEnabled ? input.moveZ : 0;
    const inputDir = new Phaser.Math.Vector2(inputX, inputZ);
    if (inputDir.lengthSq() > 0) {
      inputDir.normalize();
    }

    this.state.terrain = this.terrainQuery.getTerrainAt(this.state.x, this.state.z);

    const moving = inputDir.lengthSq() > 0;
    const canSprint = this.state.stamina > STAMINA_MIN_TO_SPRINT;
    this.state.sprinting = moving && input.sprintHeld && canSprint && constraints.sprintEnabled;

    if (this.state.sprinting) {
      this.state.stamina = Math.max(0, this.state.stamina - STAMINA_DRAIN_PER_SEC * dtSec);
    } else {
      this.state.stamina = Math.min(STAMINA_MAX, this.state.stamina + STAMINA_REGEN_PER_SEC * dtSec);
    }

    const terrainModifier = this.getTerrainSpeedModifier(this.state.terrain);
    const sprintModifier = this.state.sprinting ? PLAYER_SPRINT_MULTIPLIER : 1;
    const downhill = this.terrainQuery.getDownhillVectorAt(this.state.x, this.state.z);
    const grade = this.terrainQuery.getGradeAt(this.state.x, this.state.z);

    if (moving) {
      const desiredDir = this.applyGullyTurnBehavior(inputDir);
      this.lastMoveDir.copy(desiredDir);

      const downhillAlignment = Phaser.Math.Clamp(desiredDir.dot(downhill), -1, 1);
      const slopeMultiplier = Phaser.Math.Clamp(1 + downhillAlignment * grade * SLOPE_SPEED_INFLUENCE * 5, 0.7, 1.32);
      const targetSpeed = PLAYER_BASE_SPEED * terrainModifier * sprintModifier * constraints.speedMultiplier * slopeMultiplier;

      const targetVx = desiredDir.x * targetSpeed;
      const targetVz = desiredDir.y * targetSpeed;
      const accelStep = PLAYER_ACCEL * dtSec;

      this.state.vx = this.moveTowards(this.state.vx, targetVx, accelStep);
      this.state.vz = this.moveTowards(this.state.vz, targetVz, accelStep);
    } else {
      const decelStep = PLAYER_DECEL * dtSec;
      this.state.vx = this.moveTowards(this.state.vx, 0, decelStep);
      this.state.vz = this.moveTowards(this.state.vz, 0, decelStep);
    }

    if (constraints.inputEnabled) {
      const driftAccel = DOWNHILL_DRIFT_ACCEL * (0.3 + grade * 3.6);
      this.state.vx += downhill.x * driftAccel * dtSec;
      this.state.vz += downhill.y * driftAccel * dtSec;
    }

    const frameDx = this.state.vx * dtSec;
    const frameDz = this.state.vz * dtSec;
    const frameDistance = Math.hypot(frameDx, frameDz);
    const subSteps = Phaser.Math.Clamp(Math.ceil(frameDistance / COLLISION_MAX_STEP_DISTANCE), 1, COLLISION_MAX_SUBSTEPS);
    const stepDx = frameDx / subSteps;
    const stepDz = frameDz / subSteps;

    let simX = this.state.x;
    let simZ = this.state.z;
    let collided = false;

    for (let i = 0; i < subSteps; i += 1) {
      const resolved = this.collisionWorld.resolvePlayerMotion(
        simX,
        simZ,
        stepDx,
        stepDz,
        this.radius
      );
      simX = resolved.x;
      simZ = resolved.z;
      if (resolved.hit) {
        collided = true;
        const intoNormal = this.state.vx * resolved.normalX + this.state.vz * resolved.normalZ;
        if (intoNormal < 0) {
          this.state.vx -= intoNormal * resolved.normalX;
          this.state.vz -= intoNormal * resolved.normalZ;
        }
      }
    }

    this.state.x = simX;
    this.state.z = simZ;

    if (collided) {
      this.state.vx *= 0.98;
      this.state.vz *= 0.98;
    }

    if (Math.abs(this.state.vx) + Math.abs(this.state.vz) > 0.01) {
      this.state.headingRad = Math.atan2(this.state.vz, this.state.vx);
    }

    const targetHeight = this.terrainQuery.getHeightAt(this.state.x, this.state.z);
    const heightAlpha = 1 - Math.exp(-HEIGHT_SMOOTHING * dtSec);
    const nextHeight = Phaser.Math.Linear(this.state.y, targetHeight, heightAlpha);
    this.state.vy = dtSec > 0 ? (nextHeight - this.state.y) / dtSec : 0;
    this.state.y = nextHeight;
  }

  public getState(): Readonly<PlayerSimState> {
    return this.state;
  }

  public getTerrain(): TerrainType {
    return this.state.terrain;
  }

  public getStaminaRatio(): number {
    return this.state.stamina / STAMINA_MAX;
  }

  public isSprinting(): boolean {
    return this.state.sprinting;
  }

  public getContactPoint(): { x: number; y: number } {
    return {
      x: this.state.x,
      y: this.state.z + PLAYER_CONTACT_OFFSET_Y_WORLD
    };
  }

  public stopMotion(): void {
    this.state.vx = 0;
    this.state.vz = 0;
    this.state.sprinting = false;
  }

  private applyGullyTurnBehavior(inputDir: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    if (this.state.terrain !== TerrainType.GULLY) {
      return inputDir;
    }

    return this.lastMoveDir.clone().lerp(inputDir, 1 - GULLY_TURN_STICKINESS).normalize();
  }

  private getTerrainSpeedModifier(terrain: TerrainType): number {
    switch (terrain) {
      case TerrainType.POWDER:
        return TERRAIN_SPEED_MODIFIER.POWDER;
      case TerrainType.TREES:
        return TERRAIN_SPEED_MODIFIER.TREES;
      case TerrainType.RIDGE_ROCK:
        return TERRAIN_SPEED_MODIFIER.RIDGE_ROCK;
      case TerrainType.GULLY:
        return TERRAIN_SPEED_MODIFIER.GULLY;
      case TerrainType.OPEN_SNOW:
      default:
        return TERRAIN_SPEED_MODIFIER.OPEN_SNOW;
    }
  }

  private moveTowards(current: number, target: number, maxDelta: number): number {
    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }

    return current + Math.sign(target - current) * maxDelta;
  }
}
