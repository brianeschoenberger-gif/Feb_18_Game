import Phaser from "phaser";
import { PLAYER_COLLISION_RADIUS } from "../core/constants";
import { worldToIso } from "../core/iso";

export class Player {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public readonly renderSprite: Phaser.GameObjects.Sprite;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCircle(PLAYER_COLLISION_RADIUS, 14 - PLAYER_COLLISION_RADIUS, 14 - PLAYER_COLLISION_RADIUS);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDrag(0, 0);
    this.sprite.setMaxVelocity(700, 700);
    this.sprite.setVisible(false);

    const rp = worldToIso(x, y, 12);
    this.renderSprite = scene.add.sprite(rp.x, rp.y, "playerIso0");
    this.renderSprite.setOrigin(0.5, 0.82);
    this.renderSprite.setDepth(y + 100);

    if (!scene.anims.exists("playerIso_ski")) {
      scene.anims.create({
        key: "playerIso_ski",
        frames: [{ key: "playerIso0" }, { key: "playerIso1" }, { key: "playerIso2" }, { key: "playerIso1" }],
        frameRate: 8,
        repeat: -1
      });
    }

    this.renderSprite.play("playerIso_ski");
  }

  public getPosition(): Phaser.Math.Vector2 {
    return this.sprite.body ? this.sprite.body.position.clone() : new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
  }
}
