import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, WORLD_HEIGHT, WORLD_WIDTH } from "./constants";
import { BootScene } from "../scenes/BootScene";
import { GameScene } from "../scenes/GameScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#0b1624",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: [BootScene, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export const WORLD_BOUNDS = new Phaser.Geom.Rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
