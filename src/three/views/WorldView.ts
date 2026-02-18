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

  public constructor(snapshot: SimSnapshot, worldScale: number) {
    this.terrainBuilder.build(snapshot, worldScale);
    this.obstacleBuilder.build(snapshot, worldScale);
    this.objectivesBuilder.build(snapshot, worldScale);

    this.root.add(this.terrainBuilder.root);
    this.root.add(this.obstacleBuilder.root);
    this.root.add(this.objectivesBuilder.root);
  }

  public update(snapshot: SimSnapshot): void {
    this.objectivesBuilder.update(snapshot);
  }

  public dispose(): void {
    this.terrainBuilder.dispose();
    this.obstacleBuilder.dispose();
    this.objectivesBuilder.dispose();
    this.root.clear();
  }
}
