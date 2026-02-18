import * as THREE from "three";
import { SimSnapshot } from "../../sim/SimTypes";
import { TerrainBuilder } from "../builders/TerrainBuilder";
import { ObstacleBuilder } from "../builders/ObstacleBuilder";
import { ObjectivesBuilder } from "../builders/ObjectivesBuilder";

export class WorldView {
  public readonly root = new THREE.Group();

  private readonly terrainBuilder = new TerrainBuilder();
  private readonly obstacleBuilder = new ObstacleBuilder();
  private readonly objectivesBuilder = new ObjectivesBuilder();
  private readonly horizonGroup = new THREE.Group();

  public constructor(snapshot: SimSnapshot, worldScale: number) {
    this.terrainBuilder.build(snapshot, worldScale);
    this.obstacleBuilder.build(snapshot, worldScale);
    this.objectivesBuilder.build(snapshot, worldScale);

    this.root.add(this.terrainBuilder.root);
    this.root.add(this.obstacleBuilder.root);
    this.root.add(this.objectivesBuilder.root);
    this.root.add(this.horizonGroup);
    this.buildHorizon(worldScale);
  }

  public update(snapshot: SimSnapshot): void {
    this.objectivesBuilder.update(snapshot);
  }

  public dispose(): void {
    this.terrainBuilder.dispose();
    this.obstacleBuilder.dispose();
    this.objectivesBuilder.dispose();
    this.disposeHorizon();
    this.root.clear();
  }

  private buildHorizon(worldScale: number): void {
    const positions = [
      { x: -180, z: 220, h: 60, r: 42 },
      { x: 90, z: -170, h: 72, r: 54 },
      { x: 310, z: 70, h: 64, r: 46 },
      { x: 40, z: 280, h: 58, r: 44 }
    ];

    positions.forEach((p, i) => {
      const geo = new THREE.ConeGeometry(p.r * worldScale, p.h * worldScale, 8);
      const mat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0x13253a : 0x0f1f32, roughness: 1, metalness: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x * worldScale + 1200 * worldScale, p.h * worldScale * 0.5, p.z * worldScale + 900 * worldScale);
      this.horizonGroup.add(mesh);
    });
  }

  private disposeHorizon(): void {
    this.horizonGroup.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material?.dispose();
      }
    });
    this.horizonGroup.clear();
  }
}
