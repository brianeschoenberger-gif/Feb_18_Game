import Phaser from "phaser";
import { InputFrame } from "../sim/InputFrame";

interface PlayerControllerOptions {
  readonly scene: Phaser.Scene;
}

export class PlayerController {
  private readonly scene: Phaser.Scene;
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
  };

  private inputEnabled = true;
  private sprintEnabled = true;

  public constructor(options: PlayerControllerOptions) {
    this.scene = options.scene;

    const keyboard = this.scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.keys = {
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      shift: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    };
  }

  public captureInputFrame(): InputFrame {
    if (!this.inputEnabled) {
      return { moveX: 0, moveZ: 0, sprintHeld: false };
    }

    const moveX = (this.keys.d.isDown || this.cursors.right.isDown ? 1 : 0) + (this.keys.a.isDown || this.cursors.left.isDown ? -1 : 0);
    const moveZ = (this.keys.s.isDown || this.cursors.down.isDown ? 1 : 0) + (this.keys.w.isDown || this.cursors.up.isDown ? -1 : 0);

    return {
      moveX,
      moveZ,
      sprintHeld: this.sprintEnabled && this.keys.shift.isDown
    };
  }

  public setSprintEnabled(enabled: boolean): void {
    this.sprintEnabled = enabled;
  }

  public setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
  }
}
