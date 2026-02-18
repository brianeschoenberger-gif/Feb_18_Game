import * as THREE from "three";
import { SimSnapshot } from "../../sim/SimTypes";
import { MountainProfile } from "../../world/MountainProfile";

export class TerrainBuilder {
  public readonly root = new THREE.Group();
  private readonly mountain = new MountainProfile((x, y) => (1800 - y) * 0.047);

  public build(snapshot: SimSnapshot, worldScale: number): void {
    this.disposeChildren();

    const baseGeo = new THREE.PlaneGeometry(2400 * worldScale, 1800 * worldScale);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xdce9f7, roughness: 0.95, metalness: 0 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.set((2400 * worldScale) * 0.5, 0, (1800 * worldScale) * 0.5);
    this.root.add(base);

    snapshot.world.terrainZones.forEach((zone) => {
      const geo = new THREE.PlaneGeometry(zone.width * worldScale, zone.height * worldScale);
      const shade = this.mountain.getAspectLight(zone.x + zone.width * 0.5, zone.y + zone.height * 0.5);
      const mat = new THREE.MeshStandardMaterial({
        color: this.modulateColor(zone.color, shade),
        roughness: 0.94,
        metalness: 0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      const elevation = this.mountain.getElevation(zone.x + zone.width * 0.5, zone.y + zone.height * 0.5) * 0.0055;
      mesh.position.set((zone.x + zone.width * 0.5) * worldScale, elevation, (zone.y + zone.height * 0.5) * worldScale);
      this.root.add(mesh);
    });

    this.buildContours(worldScale);
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

  private buildContours(worldScale: number): void {
    for (let y = 0; y <= 1800; y += 90) {
      const geo = new THREE.PlaneGeometry(2400 * worldScale, 0.6);
      const mat = new THREE.MeshBasicMaterial({ color: 0x91adc6, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
      const line = new THREE.Mesh(geo, mat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(1200 * worldScale, this.mountain.getElevation(1200, y) * 0.0055 + 0.018, y * worldScale);
      this.root.add(line);
    }
  }

  private modulateColor(color: number, shade: number): number {
    const c = new THREE.Color(color);
    const t = THREE.MathUtils.clamp(shade, -0.18, 0.18);
    c.r = THREE.MathUtils.clamp(c.r + t * 0.85, 0, 1);
    c.g = THREE.MathUtils.clamp(c.g + t, 0, 1);
    c.b = THREE.MathUtils.clamp(c.b + t * 1.15, 0, 1);
    return c.getHex();
  }
}
