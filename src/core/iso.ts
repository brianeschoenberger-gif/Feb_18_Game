import Phaser from "phaser";
import {
  ISO_ELEVATION_SCALE,
  ISO_ORIGIN_X,
  ISO_ORIGIN_Y,
  ISO_X_SCALE,
  ISO_Y_SCALE,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "./constants";

export function worldToIso(x: number, y: number, elevation = 0): Phaser.Math.Vector2 {
  const sx = (x - y) * ISO_X_SCALE + ISO_ORIGIN_X;
  const sy = (x + y) * ISO_Y_SCALE + ISO_ORIGIN_Y - elevation * ISO_ELEVATION_SCALE;
  return new Phaser.Math.Vector2(sx, sy);
}

export function isoToWorld(sx: number, sy: number, elevation = 0): Phaser.Math.Vector2 {
  const ty = sy - ISO_ORIGIN_Y + elevation * ISO_ELEVATION_SCALE;
  const xMinusY = (sx - ISO_ORIGIN_X) / ISO_X_SCALE;
  const xPlusY = ty / ISO_Y_SCALE;

  const x = (xPlusY + xMinusY) * 0.5;
  const y = (xPlusY - xMinusY) * 0.5;
  return new Phaser.Math.Vector2(x, y);
}

export function worldAngleToIso(angleRad: number): number {
  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);
  const isoX = (dx - dy) * ISO_X_SCALE;
  const isoY = (dx + dy) * ISO_Y_SCALE;
  return Math.atan2(isoY, isoX);
}

export function getIsoWorldBounds(padding = 240): Phaser.Geom.Rectangle {
  const c1 = worldToIso(0, 0);
  const c2 = worldToIso(WORLD_WIDTH, 0);
  const c3 = worldToIso(0, WORLD_HEIGHT);
  const c4 = worldToIso(WORLD_WIDTH, WORLD_HEIGHT);

  const minX = Math.min(c1.x, c2.x, c3.x, c4.x) - padding;
  const maxX = Math.max(c1.x, c2.x, c3.x, c4.x) + padding;
  const minY = Math.min(c1.y, c2.y, c3.y, c4.y) - padding;
  const maxY = Math.max(c1.y, c2.y, c3.y, c4.y) + padding;

  return new Phaser.Geom.Rectangle(minX, minY, maxX - minX, maxY - minY);
}
