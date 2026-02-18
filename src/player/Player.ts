import Phaser from "phaser";

export class Player {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCircle(12, 2, 2);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDrag(0, 0);
    this.sprite.setMaxVelocity(700, 700);
  }

  public getPosition(): Phaser.Math.Vector2 {
    return this.sprite.body ? this.sprite.body.position.clone() : new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
  }
}
