import * as THREE from "three";
import {
  CAMERA_FOLLOW_DISTANCE,
  CAMERA_HEIGHT_BASE,
  CAMERA_HEIGHT_SPEED_FACTOR,
  CAMERA_LOOK_AHEAD,
  CAMERA_MOUNTAIN_BIAS,
  CAMERA_SIDE_OFFSET
} from "../core/constants";
import { MOUNTAIN_FALLOFF_DIR_X, MOUNTAIN_FALLOFF_DIR_Y } from "../core/constants";

export class ThreeCamera {
  public readonly camera: THREE.PerspectiveCamera;
  private readonly lookAtTarget = new THREE.Vector3();

  public constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
    this.camera.position.set(0, 24, 36);
    this.camera.lookAt(0, 0, 0);
  }

  public updateFollow(targetX: number, targetY: number, targetZ: number, headingRad: number, velX: number, velZ: number, dtSec: number): void {
    const speed = Math.hypot(velX, velZ);
    const moveHeading = speed > 0.01 ? Math.atan2(velZ, velX) : headingRad;

    const backX = -Math.cos(moveHeading) * CAMERA_FOLLOW_DISTANCE;
    const backZ = -Math.sin(moveHeading) * CAMERA_FOLLOW_DISTANCE;
    const sideX = Math.cos(moveHeading + Math.PI * 0.5) * CAMERA_SIDE_OFFSET;
    const sideZ = Math.sin(moveHeading + Math.PI * 0.5) * CAMERA_SIDE_OFFSET;
    const downhillLen = Math.hypot(MOUNTAIN_FALLOFF_DIR_X, MOUNTAIN_FALLOFF_DIR_Y) || 1;
    const downhillX = MOUNTAIN_FALLOFF_DIR_X / downhillLen;
    const downhillZ = MOUNTAIN_FALLOFF_DIR_Y / downhillLen;
    const mountainBiasX = -downhillX * CAMERA_MOUNTAIN_BIAS;
    const mountainBiasZ = -downhillZ * CAMERA_MOUNTAIN_BIAS;
    const camHeight = CAMERA_HEIGHT_BASE + 4.5 + speed * CAMERA_HEIGHT_SPEED_FACTOR + targetY * 0.45;

    const smooth = 1 - Math.exp(-6.8 * dtSec);
    const desired = new THREE.Vector3(targetX + backX + sideX + mountainBiasX, camHeight, targetZ + backZ + sideZ + mountainBiasZ);
    this.camera.position.lerp(desired, smooth);

    const lookAhead = CAMERA_LOOK_AHEAD + Math.min(5, speed * 0.015);
    this.lookAtTarget.set(
      targetX + Math.cos(moveHeading) * lookAhead + downhillX * 1.2,
      targetY - 0.35,
      targetZ + Math.sin(moveHeading) * lookAhead + downhillZ * 1.2
    );
    this.camera.lookAt(this.lookAtTarget);
  }

  public resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
