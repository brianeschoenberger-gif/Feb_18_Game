import {
  MOUNTAIN_ASPECT_SHADE_STRENGTH,
  MOUNTAIN_BASE_HEIGHT,
  MOUNTAIN_CONTOUR_SPACING,
  MOUNTAIN_FALLOFF_DIR_X,
  MOUNTAIN_FALLOFF_DIR_Y,
  MOUNTAIN_GRADE_STRENGTH,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "../core/constants";

export class MountainProfile {
  private readonly downhillX: number;
  private readonly downhillY: number;

  public constructor(private readonly getBaseHeightAt: (x: number, y: number) => number) {
    const len = Math.hypot(MOUNTAIN_FALLOFF_DIR_X, MOUNTAIN_FALLOFF_DIR_Y) || 1;
    this.downhillX = MOUNTAIN_FALLOFF_DIR_X / len;
    this.downhillY = MOUNTAIN_FALLOFF_DIR_Y / len;
  }

  public getElevation(x: number, y: number): number {
    const centeredX = x - WORLD_WIDTH * 0.5;
    const centeredY = y - WORLD_HEIGHT * 0.5;
    const slopeTerm = (centeredX * this.downhillX + centeredY * this.downhillY) * MOUNTAIN_GRADE_STRENGTH;
    return MOUNTAIN_BASE_HEIGHT + this.getBaseHeightAt(x, y) + slopeTerm;
  }

  public getSlopeDirection(x: number, y: number): { x: number; y: number } {
    const sample = 18;
    const hL = this.getElevation(x - sample, y);
    const hR = this.getElevation(x + sample, y);
    const hU = this.getElevation(x, y - sample);
    const hD = this.getElevation(x, y + sample);
    const gradX = (hR - hL) / (sample * 2);
    const gradY = (hD - hU) / (sample * 2);
    const downhillX = -gradX;
    const downhillY = -gradY;
    const len = Math.hypot(downhillX, downhillY);
    if (len < 0.0001) {
      return { x: this.downhillX, y: this.downhillY };
    }
    return { x: downhillX / len, y: downhillY / len };
  }

  public getAspectLight(x: number, y: number): number {
    const slope = this.getSlopeDirection(x, y);
    const lightDirX = -0.55;
    const lightDirY = -0.84;
    const dot = slope.x * lightDirX + slope.y * lightDirY;
    return dot * MOUNTAIN_ASPECT_SHADE_STRENGTH;
  }

  public getContourPhase(x: number, y: number): number {
    const elevation = this.getElevation(x, y);
    const normalized = ((elevation % MOUNTAIN_CONTOUR_SPACING) + MOUNTAIN_CONTOUR_SPACING) % MOUNTAIN_CONTOUR_SPACING;
    return normalized / MOUNTAIN_CONTOUR_SPACING;
  }
}
