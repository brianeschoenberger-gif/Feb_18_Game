import Phaser from "phaser";
import { worldToIso } from "../core/iso";

export class Player {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public readonly renderSprite: Phaser.GameObjects.Image;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCircle(12, 2, 2);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDrag(0, 0);
    this.sprite.setMaxVelocity(700, 700);
    this.sprite.setVisible(false);

    const rp = worldToIso(x, y, 12);
    this.renderSprite = scene.add.image(rp.x, rp.y, "playerIso");
    this.renderSprite.setDepth(y + 100);
  }

  public getPosition(): Phaser.Math.Vector2 {
    return this.sprite.body ? this.sprite.body.position.clone() : new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
  }
}
