import * as THREE from "three";

export class ThreeCamera {
  public readonly camera: THREE.PerspectiveCamera;

  public constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
    this.camera.position.set(0, 120, 180);
    this.camera.lookAt(0, 0, 0);
  }

  public updateFollow(targetX: number, targetZ: number, dtSec: number): void {
    const smooth = 1 - Math.exp(-7 * dtSec);
    const desired = new THREE.Vector3(targetX + 110, 110, targetZ + 120);
    this.camera.position.lerp(desired, smooth);
    this.camera.lookAt(targetX, 0, targetZ);
  }

  public resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
