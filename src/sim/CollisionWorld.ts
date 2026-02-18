import Phaser from "phaser";
import { COLLISION_EPSILON } from "../core/constants";
import { CollisionObstacle } from "../world/Obstacles";

interface ExpandedObstacle {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export class CollisionWorld {
  private readonly obstacles: ExpandedObstacle[];

  public constructor(
    private readonly worldBounds: Phaser.Geom.Rectangle,
    obstacles: readonly CollisionObstacle[]
  ) {
    this.obstacles = obstacles.map((obs) => ({
      minX: obs.x - obs.width * 0.5,
      maxX: obs.x + obs.width * 0.5,
      minZ: obs.y - obs.height * 0.5,
      maxZ: obs.y + obs.height * 0.5
    }));
  }

  public resolvePlayerMotion(
    currentX: number,
    currentZ: number,
    moveX: number,
    moveZ: number,
    radius: number
  ): { x: number; z: number; hit: boolean; normalX: number; normalZ: number } {
    let x = this.clampToBoundsX(currentX + moveX, radius);
    let z = this.clampToBoundsZ(currentZ + moveZ, radius);

    let normalX = 0;
    let normalZ = 0;
    let hit = false;

    for (let pass = 0; pass < 3; pass += 1) {
      let adjusted = false;
      for (let i = 0; i < this.obstacles.length; i += 1) {
        const obs = this.obstacles[i];
        const closestX = Phaser.Math.Clamp(x, obs.minX, obs.maxX);
        const closestZ = Phaser.Math.Clamp(z, obs.minZ, obs.maxZ);

        let dx = x - closestX;
        let dz = z - closestZ;
        let distSq = dx * dx + dz * dz;
        if (distSq >= radius * radius) {
          continue;
        }

        hit = true;
        let nx = 0;
        let nz = 0;
        let penetration = 0;

        if (distSq > COLLISION_EPSILON * COLLISION_EPSILON) {
          const dist = Math.sqrt(distSq);
          nx = dx / dist;
          nz = dz / dist;
          penetration = radius - dist + COLLISION_EPSILON;
        } else {
          const left = Math.abs(x - obs.minX);
          const right = Math.abs(obs.maxX - x);
          const top = Math.abs(z - obs.minZ);
          const bottom = Math.abs(obs.maxZ - z);
          const min = Math.min(left, right, top, bottom);
          if (min === left) {
            nx = -1;
          } else if (min === right) {
            nx = 1;
          } else if (min === top) {
            nz = -1;
          } else {
            nz = 1;
          }
          penetration = radius + COLLISION_EPSILON;
        }

        x += nx * penetration;
        z += nz * penetration;
        normalX += nx;
        normalZ += nz;
        adjusted = true;
      }

      x = this.clampToBoundsX(x, radius);
      z = this.clampToBoundsZ(z, radius);
      if (!adjusted) {
        break;
      }
    }

    if (hit) {
      const normalLen = Math.hypot(normalX, normalZ);
      if (normalLen > 0.0001) {
        normalX /= normalLen;
        normalZ /= normalLen;
      }
    }

    return { x, z, hit, normalX, normalZ };
  }

  public contains(x: number, z: number): boolean {
    return this.worldBounds.contains(x, z);
  }

  private clampToBoundsX(x: number, radius: number): number {
    return Phaser.Math.Clamp(x, this.worldBounds.left + radius, this.worldBounds.right - radius);
  }

  private clampToBoundsZ(z: number, radius: number): number {
    return Phaser.Math.Clamp(z, this.worldBounds.top + radius, this.worldBounds.bottom - radius);
  }
}
