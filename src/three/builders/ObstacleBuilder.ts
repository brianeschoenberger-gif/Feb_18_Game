import * as THREE from "three";
import { SimSnapshot } from "../../sim/SimTypes";

export class ObstacleBuilder {
  public readonly root = new THREE.Group();

  public build(snapshot: SimSnapshot, worldScale: number): void {
    this.disposeChildren();

    snapshot.world.obstacles.forEach((obs) => {
      const h = obs.kind === "tree" ? 9 : 4;
      const radius = Math.max(obs.width, obs.height) * worldScale * 0.45;

      const geo = obs.kind === "tree" ? new THREE.ConeGeometry(radius, h, 6) : new THREE.BoxGeometry(radius * 2, h, radius * 1.7);
      const mat = new THREE.MeshStandardMaterial({ color: obs.kind === "tree" ? 0x2f6f37 : 0x8d97a6, roughness: 0.92, metalness: 0.04 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(obs.x * worldScale, h * 0.5, obs.y * worldScale);
      this.root.add(mesh);
    });
  }

  public dispose(): void {
    this.disposeChildren();
  }

  private disposeChildren(): void {
    this.root.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material?.dispose();
      }
    });
    this.root.clear();
  }
}
