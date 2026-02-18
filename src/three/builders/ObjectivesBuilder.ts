import * as THREE from "three";
import { SimSnapshot } from "../../sim/SimTypes";

export class ObjectivesBuilder {
  public readonly root = new THREE.Group();
  private evacMesh: THREE.Mesh | null = null;
  private beacon: THREE.Mesh | null = null;

  public build(snapshot: SimSnapshot, worldScale: number): void {
    const rect = snapshot.objective.evacRect;

    const evacGeo = new THREE.PlaneGeometry(rect.width * worldScale, rect.height * worldScale);
    const evacMat = new THREE.MeshStandardMaterial({ color: 0x76d5ff, transparent: true, opacity: 0.35, roughness: 1 });
    this.evacMesh = new THREE.Mesh(evacGeo, evacMat);
    this.evacMesh.rotation.x = -Math.PI / 2;
    this.evacMesh.position.set((rect.x + rect.width * 0.5) * worldScale, 0.03, (rect.y + rect.height * 0.5) * worldScale);
    this.root.add(this.evacMesh);

    const beaconGeo = new THREE.CylinderGeometry(1.6, 1.6, 16, 10);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xaeeeff, emissive: 0x6ed8ff, emissiveIntensity: 0.8 });
    this.beacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.beacon.position.set((rect.x + rect.width * 0.5) * worldScale, 8, (rect.y + rect.height * 0.5) * worldScale);
    this.root.add(this.beacon);
  }

  public update(snapshot: SimSnapshot): void {
    if (!this.evacMesh || !this.beacon) {
      return;
    }

    const mat = this.evacMesh.material as THREE.MeshStandardMaterial;
    mat.color.set(snapshot.objective.state === "COMPLETE" ? 0x8ff7aa : snapshot.objective.state === "CARRY" ? 0xffd899 : 0x76d5ff);

    const beaconMat = this.beacon.material as THREE.MeshStandardMaterial;
    beaconMat.emissiveIntensity = snapshot.objective.state === "CARRY" ? 1.35 : 0.8;
  }

  public dispose(): void {
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
