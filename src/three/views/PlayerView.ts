import * as THREE from "three";
import { SimSnapshot } from "../../sim/SimTypes";

export class PlayerView {
  public readonly root = new THREE.Group();
  private readonly body: THREE.Mesh;

  public constructor(worldScale: number) {
    const geo = new THREE.ConeGeometry(1.4, 5, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf5fbff, roughness: 0.85, metalness: 0.03 });
    this.body = new THREE.Mesh(geo, mat);
    this.body.position.y = 2.5;
    this.body.rotation.x = Math.PI;
    this.root.add(this.body);

    const shadowGeo = new THREE.CircleGeometry(1.6, 14);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.05;
    this.root.add(shadow);

    this.root.position.set(0, 0, 0);
    this.root.scale.setScalar(worldScale * 8.5);
  }

  public update(snapshot: SimSnapshot, worldScale: number): void {
    this.root.position.set(snapshot.player.x * worldScale, 0, snapshot.player.y * worldScale);
    this.body.rotation.y = -snapshot.player.headingRad + Math.PI * 0.5;
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
