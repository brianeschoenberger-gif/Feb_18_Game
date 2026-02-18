import Phaser from "phaser";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { ENABLE_THREE_MIRROR } from "../core/featureFlags";
import { getIsoWorldBounds, worldToIso } from "../core/iso";
import { Ambience } from "../audio/Ambience";
import { Beep } from "../audio/Beep";
import { Player } from "../player/Player";
import { PlayerController } from "../player/PlayerController";
import { DangerZone } from "../systems/DangerZone";
import { FeedbackSystem } from "../systems/FeedbackSystem";
import { RenderSync } from "../systems/RenderSync";
import { RescueSystem, RescueSnapshot, RunState } from "../systems/RescueSystem";
import { SimBridge } from "../sim/SimBridge";
import { ThreeApp } from "../three/ThreeApp";
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
  private feedback!: FeedbackSystem;
  private renderSync!: RenderSync;
  private beep!: Beep;
  private ambience!: Ambience;
  private threeApp: ThreeApp | null = null;
  private simBridge: SimBridge | null = null;
  private previousBannerText = "";
  private previousRunState: RunState = "DISPATCH";
  private didShutdown = false;

  public constructor() {
    super("GameScene");
  }

  public create(): void {
    this.physics.world.setBounds(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

    const isoBounds = getIsoWorldBounds(260);
    this.cameras.main.setBounds(isoBounds.x, isoBounds.y, isoBounds.width, isoBounds.height);

    this.map = new RescueMap(this);
    const obstacleSpecs = Obstacles.getSampleSpecs();
    const obstacles = new Obstacles(this, obstacleSpecs);

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
      evacZone: this.map.getEvacZone(),
      projectPoint: worldToIso
    });

    this.dangerZone = new DangerZone(this);
    this.feedback = new FeedbackSystem(this);
    this.renderSync = new RenderSync();
    this.renderSync.register(this.player.sprite, this.player.renderSprite, 100, 12);

    this.beep = new Beep(this);
    this.ambience = new Ambience(this);

    this.cameras.main.startFollow(this.player.renderSprite, true, 0.12, 0.12);

    this.hud = new Hud(this);

    if (ENABLE_THREE_MIRROR) {
      const parent = document.getElementById("game-root");
      if (parent) {
        this.simBridge = new SimBridge({
          playerSprite: this.player.sprite,
          getRescueSnapshot: () => this.rescueSystem.getSnapshot(),
          getDangerSnapshot: () => this.dangerZone.getSnapshot(),
          terrainZones: this.map.terrain.getZones(),
          obstacleSpecs,
          evacZone: this.map.getEvacZone()
        });

        this.threeApp = new ThreeApp(parent, this.simBridge.capture(0));
      }
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);
  }

  public update(time: number, delta: number): void {
    const dtSeconds = delta / 1000;

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
      this.feedback.trigger("DANGER_HIT");
    }

    this.renderSync.update();
    this.map.update(time, dtSeconds);

    if (this.simBridge && this.threeApp) {
      this.threeApp.update(this.simBridge.capture(time / 1000), dtSeconds);
    }

    const dangerDistance = this.dangerZone.distanceToEdge(this.player.sprite.x, this.player.sprite.y);
    const pressure = this.dangerZone.getPressureAt(this.player.sprite.x, this.player.sprite.y);

    this.feedback.update(dtSeconds);

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

    if (rescueView.runState === "ACTIVE") {
      this.ambience.start();
      this.ambience.setIntensity(pressure);
    }

    this.playOneShotFeedback(rescueView);
    this.handleRunStateTransitions(rescueView);
    this.previousRunState = rescueView.runState;
  }

  private playOneShotFeedback(snapshot: RescueSnapshot): void {
    if (snapshot.bannerText === this.previousBannerText) {
      return;
    }

    if (snapshot.bannerText === "STRIKE!") {
      this.beep.playStrike();
      this.feedback.trigger("STRIKE");
    }

    if (snapshot.bannerText === "VICTIM SECURED") {
      this.beep.playSecure();
      this.feedback.trigger("SECURE");
    }

    this.previousBannerText = snapshot.bannerText;
  }

  private handleRunStateTransitions(snapshot: RescueSnapshot): void {
    if (snapshot.runState === this.previousRunState) {
      return;
    }

    if (this.previousRunState === "DISPATCH" && snapshot.runState === "ACTIVE") {
      this.beep.playRadioDispatch();
      return;
    }

    if (snapshot.runState === "WIN") {
      this.beep.playWinCue();
      this.feedback.trigger("WIN");
      return;
    }

    if (snapshot.runState === "LOSE") {
      this.beep.playLoseCue();
      this.feedback.trigger(snapshot.loseReason === "DANGER" ? "DANGER_HIT" : "LOSE");
    }
  }

  private handleShutdown(): void {
    if (this.didShutdown) {
      return;
    }
    this.didShutdown = true;

    if (this.beep) {
      this.beep.destroy();
    }

    if (this.ambience) {
      this.ambience.destroy();
    }

    if (this.feedback) {
      this.feedback.destroy();
    }

    if (this.threeApp) {
      this.threeApp.destroy();
      this.threeApp = null;
    }
  }
}
