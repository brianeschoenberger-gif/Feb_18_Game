import * as THREE from "three";
import { SimSnapshot } from "../../sim/SimTypes";

export class TerrainBuilder {
  public readonly root = new THREE.Group();

  public build(snapshot: SimSnapshot, worldScale: number): void {
    this.disposeChildren();

    const baseGeo = new THREE.PlaneGeometry(2400 * worldScale, 1800 * worldScale);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xeef4fb, roughness: 0.95, metalness: 0 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.set((2400 * worldScale) * 0.5, 0, (1800 * worldScale) * 0.5);
    this.root.add(base);

    snapshot.world.terrainZones.forEach((zone) => {
      const geo = new THREE.PlaneGeometry(zone.width * worldScale, zone.height * worldScale);
      const mat = new THREE.MeshStandardMaterial({ color: zone.color, roughness: 0.94, metalness: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set((zone.x + zone.width * 0.5) * worldScale, 0.02, (zone.y + zone.height * 0.5) * worldScale);
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
