import Phaser from "phaser";
import { worldToIso } from "../core/iso";

export interface ObstacleSpec {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly tint: number;
  readonly texture: "tree" | "rock";
}

export class Obstacles {
  public readonly staticGroup: Phaser.Physics.Arcade.StaticGroup;

  public constructor(scene: Phaser.Scene, specs: ObstacleSpec[]) {
    this.staticGroup = scene.physics.add.staticGroup();

    specs.forEach((spec) => {
      const collider = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, 0x000000, 0);
      scene.physics.add.existing(collider, true);
      this.staticGroup.add(collider);

      const shadowP = worldToIso(spec.x, spec.y, 0);
      const shadow = scene.add.ellipse(shadowP.x, shadowP.y + 6, spec.width * 0.95, Math.max(10, spec.height * 0.32), 0x000000, 0.22);
      shadow.setDepth(spec.y + 8);

      const p = worldToIso(spec.x, spec.y, spec.texture === "tree" ? 16 : 10);
      const obstacle = scene.add.image(p.x, p.y, spec.texture).setTint(spec.tint);
      obstacle.setDisplaySize(spec.width * 1.2, spec.height * 1.45);
      obstacle.setDepth(spec.y + 24);
    });

    this.staticGroup.refresh();
  }

  public static getSampleSpecs(): ObstacleSpec[] {
    return [
      { x: 520, y: 560, width: 28, height: 28, tint: 0xffffff, texture: "tree" },
      { x: 565, y: 612, width: 28, height: 28, tint: 0xffffff, texture: "tree" },
      { x: 612, y: 546, width: 30, height: 30, tint: 0xffffff, texture: "tree" },
      { x: 450, y: 910, width: 32, height: 32, tint: 0xffffff, texture: "tree" },
      { x: 503, y: 962, width: 32, height: 32, tint: 0xffffff, texture: "tree" },
      { x: 572, y: 920, width: 32, height: 32, tint: 0xffffff, texture: "tree" },
      { x: 1470, y: 430, width: 36, height: 36, tint: 0xffffff, texture: "tree" },
      { x: 1540, y: 486, width: 34, height: 34, tint: 0xffffff, texture: "tree" },
      { x: 1600, y: 450, width: 34, height: 34, tint: 0xffffff, texture: "tree" },
      { x: 980, y: 740, width: 56, height: 40, tint: 0xe5ecf3, texture: "rock" },
      { x: 1070, y: 780, width: 58, height: 42, tint: 0xd9e1ea, texture: "rock" },
      { x: 1710, y: 1020, width: 64, height: 48, tint: 0xe6edf6, texture: "rock" },
      { x: 1785, y: 1080, width: 66, height: 50, tint: 0xdce5ef, texture: "rock" }
    ];
  }
}
