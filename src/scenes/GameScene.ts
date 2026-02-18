import Phaser from "phaser";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { Beep } from "../audio/Beep";
import { Player } from "../player/Player";
import { PlayerController } from "../player/PlayerController";
import { DangerZone } from "../systems/DangerZone";
import { RescueSystem, RescueSnapshot } from "../systems/RescueSystem";
import { Hud } from "../ui/Hud";
import { RescueMap } from "../world/Map";
import { Obstacles } from "../world/Obstacles";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private controller!: PlayerController;
  private hud!: Hud;
  private map!: RescueMap;
  private rescueSystem!: RescueSystem;
  private dangerZone!: DangerZone;
  private beep!: Beep;
  private previousBannerText = "";
  private didShutdown = false;

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

    this.rescueSystem = new RescueSystem({
      scene: this,
      playerSprite: this.player.sprite,
      evacZone: this.map.getEvacZone()
    });

    this.dangerZone = new DangerZone(this);
    this.beep = new Beep(this);

    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);

    this.hud = new Hud(this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);
  }

  public update(time: number, delta: number): void {
    const dtSeconds = delta / 1000;

    this.map.update(time);

    this.rescueSystem.update(dtSeconds);
    let rescueView = this.rescueSystem.getSnapshot();
    if (rescueView.restartRequested) {
      this.scene.restart();
      return;
    }

    this.controller.setInputEnabled(rescueView.canInput);
    this.controller.setSprintEnabled(rescueView.sprintEnabled);
    this.controller.setExternalSpeedMultiplier(rescueView.speedMultiplier);
    this.controller.update(dtSeconds);

    this.dangerZone.setPhase(rescueView.dangerPhase);
    this.dangerZone.update(dtSeconds);

    if (rescueView.runState === "ACTIVE" && this.dangerZone.isPlayerInDanger(this.player.sprite.x, this.player.sprite.y)) {
      this.rescueSystem.forceLose("DANGER");
      rescueView = this.rescueSystem.getSnapshot();
    }

    const dangerDistance = this.dangerZone.distanceToEdge(this.player.sprite.x, this.player.sprite.y);

    this.hud.updateView({
      staminaRatio: this.controller.getStaminaRatio(),
      terrain: this.controller.getTerrain(),
      sprinting: this.controller.isSprinting(),
      mode: rescueView.mode,
      objective: rescueView.objective,
      signal: rescueView.signal,
      directionAngleRad: rescueView.directionAngleRad,
      probesRemaining: rescueView.probesRemaining,
      digProgress: rescueView.digProgress,
      timerSec: rescueView.timerSec,
      dispatchRemainingSec: rescueView.dispatchRemainingSec,
      runState: rescueView.runState,
      bannerText: rescueView.bannerText,
      dangerPhase: rescueView.dangerPhase,
      dangerDistance,
      dangerActive: true,
      loseReason: rescueView.loseReason
    });

    this.beep.update(dtSeconds, rescueView.signal, rescueView.runState === "ACTIVE" && rescueView.mode === "SEARCH");
    this.playOneShotFeedback(rescueView);
  }

  private playOneShotFeedback(snapshot: RescueSnapshot): void {
    if (snapshot.bannerText === this.previousBannerText) {
      return;
    }

    if (snapshot.bannerText === "STRIKE!") {
      this.beep.playStrike();
    }

    if (snapshot.bannerText === "VICTIM SECURED") {
      this.beep.playSecure();
    }

    this.previousBannerText = snapshot.bannerText;
  }

  private handleShutdown(): void {
    if (this.didShutdown) {
      return;
    }
    this.didShutdown = true;

    if (this.beep) {
      this.beep.destroy();
    }
  }
}
