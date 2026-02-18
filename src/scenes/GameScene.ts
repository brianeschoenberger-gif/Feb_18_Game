import Phaser from "phaser";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { Player } from "../player/Player";
import { PlayerController } from "../player/PlayerController";
import { Hud } from "../ui/Hud";
import { RescueMap } from "../world/Map";
import { Obstacles } from "../world/Obstacles";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private controller!: PlayerController;
  private hud!: Hud;
  private map!: RescueMap;

  public constructor() {
    super("GameScene");
  }

  public create(): void {
    this.physics.world.setBounds(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width, WORLD_BOUNDS.height);
    this.cameras.main.setBounds(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

    this.map = new RescueMap(this);
    const obstacles = new Obstacles(this, Obstacles.getSampleSpecs());

    this.player = new Player(this, 150, 160);
    this.physics.add.collider(this.player.sprite, obstacles.staticGroup);

    this.controller = new PlayerController({
      scene: this,
      player: this.player,
      terrainAt: (x, y) => this.map.terrain.getTerrainAt(x, y)
    });

    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);

    this.hud = new Hud(this);
  }

  public update(_time: number, delta: number): void {
    const dtSeconds = delta / 1000;
    this.controller.update(dtSeconds);
    this.hud.update(this.controller.getStaminaRatio(), this.controller.getTerrain(), this.controller.isSprinting());
  }
}
