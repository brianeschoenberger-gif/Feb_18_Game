import Phaser from "phaser";
import {
  GULLY_TURN_STICKINESS,
  PLAYER_ACCEL,
  PLAYER_BASE_SPEED,
  PLAYER_DECEL,
  PLAYER_SPRINT_MULTIPLIER,
  STAMINA_DRAIN_PER_SEC,
  STAMINA_MAX,
  STAMINA_MIN_TO_SPRINT,
  STAMINA_REGEN_PER_SEC,
  TERRAIN_SPEED_MODIFIER
} from "../core/constants";
import { Player } from "./Player";
import { TerrainType } from "../world/Terrain";

interface PlayerControllerOptions {
  readonly scene: Phaser.Scene;
  readonly player: Player;
  readonly terrainAt: (x: number, y: number) => TerrainType;
}

export class PlayerController {
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly terrainAt: (x: number, y: number) => TerrainType;

  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
  };

  private stamina = STAMINA_MAX;
  private sprinting = false;
  private terrain = TerrainType.OPEN_SNOW;
  private lastMoveDir = new Phaser.Math.Vector2(0, -1);

  public constructor(options: PlayerControllerOptions) {
    this.scene = options.scene;
    this.player = options.player;
    this.terrainAt = options.terrainAt;

    const keyboard = this.scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.keys = {
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      shift: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    };
  }

  public update(dtSeconds: number): void {
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const inputDir = this.readInputDirection();

    this.terrain = this.terrainAt(this.player.sprite.x, this.player.sprite.y);

    const moving = inputDir.lengthSq() > 0;
    const wantsSprint = this.keys.shift.isDown;
    const canSprint = this.stamina > STAMINA_MIN_TO_SPRINT;
    this.sprinting = moving && wantsSprint && canSprint;

    if (this.sprinting) {
      this.stamina = Math.max(0, this.stamina - STAMINA_DRAIN_PER_SEC * dtSeconds);
    } else {
      this.stamina = Math.min(STAMINA_MAX, this.stamina + STAMINA_REGEN_PER_SEC * dtSeconds);
    }

    const terrainModifier = this.getTerrainSpeedModifier(this.terrain);
    const sprintModifier = this.sprinting ? PLAYER_SPRINT_MULTIPLIER : 1;
    const targetSpeed = PLAYER_BASE_SPEED * terrainModifier * sprintModifier;

    if (moving) {
      const desiredDir = this.applyGullyTurnBehavior(inputDir);
      this.lastMoveDir.copy(desiredDir);

      const targetVelocityX = desiredDir.x * targetSpeed;
      const targetVelocityY = desiredDir.y * targetSpeed;
      const accelStep = PLAYER_ACCEL * dtSeconds;

      body.setVelocityX(this.moveTowards(body.velocity.x, targetVelocityX, accelStep));
      body.setVelocityY(this.moveTowards(body.velocity.y, targetVelocityY, accelStep));
    } else {
      const decelStep = PLAYER_DECEL * dtSeconds;
      body.setVelocityX(this.moveTowards(body.velocity.x, 0, decelStep));
      body.setVelocityY(this.moveTowards(body.velocity.y, 0, decelStep));
    }
  }

  public getStaminaRatio(): number {
    return this.stamina / STAMINA_MAX;
  }

  public isSprinting(): boolean {
    return this.sprinting;
  }

  public getTerrain(): TerrainType {
    return this.terrain;
  }

  private readInputDirection(): Phaser.Math.Vector2 {
    const x = (this.keys.d.isDown || this.cursors.right.isDown ? 1 : 0) + (this.keys.a.isDown || this.cursors.left.isDown ? -1 : 0);
    const y = (this.keys.s.isDown || this.cursors.down.isDown ? 1 : 0) + (this.keys.w.isDown || this.cursors.up.isDown ? -1 : 0);

    const dir = new Phaser.Math.Vector2(x, y);
    if (dir.lengthSq() > 0) {
      dir.normalize();
    }

    return dir;
  }

  private applyGullyTurnBehavior(inputDir: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    if (this.terrain !== TerrainType.GULLY) {
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
