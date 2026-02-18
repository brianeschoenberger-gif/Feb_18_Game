import * as THREE from "three";
import { SimSnapshot } from "../../sim/SimTypes";

export class DangerView {
  public readonly root = new THREE.Group();
  private readonly ring: THREE.Mesh;
  private readonly fill: THREE.Mesh;

  public constructor() {
    const ringGeo = new THREE.RingGeometry(0.97, 1, 96);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff5353, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.08;

    const fillGeo = new THREE.CircleGeometry(1, 80);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0xbd2d2d, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    this.fill = new THREE.Mesh(fillGeo, fillMat);
    this.fill.rotation.x = -Math.PI / 2;
    this.fill.position.y = 0.04;

    this.root.add(this.fill);
    this.root.add(this.ring);
  }

  public update(snapshot: SimSnapshot, worldScale: number): void {
    this.root.position.set(snapshot.danger.centerX * worldScale, 0, snapshot.danger.centerY * worldScale);
    const s = Math.max(0.01, snapshot.danger.radius * worldScale);
    this.ring.scale.setScalar(s);
    this.fill.scale.setScalar(s);

    const ringMat = this.ring.material as THREE.MeshBasicMaterial;
    const fillMat = this.fill.material as THREE.MeshBasicMaterial;
    if (snapshot.danger.phase === "AFTER_SECURE") {
      ringMat.opacity = 0.98;
      fillMat.opacity = 0.22;
    } else if (snapshot.danger.phase === "AFTER_STRIKE") {
      ringMat.opacity = 0.94;
      fillMat.opacity = 0.18;
    } else {
      ringMat.opacity = 0.88;
      fillMat.opacity = 0.14;
    }
  }

  public dispose(): void {
    this.root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    this.root.clear();
  }
}
