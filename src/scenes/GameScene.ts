import Phaser from "phaser";
import {
  PHASER_CAMERA_FOLLOW_OFFSET_X,
  PHASER_CAMERA_FOLLOW_OFFSET_Y,
  PLAYER_COLLISION_RADIUS,
  PLAYER_ELEVATION_VISUAL_BIAS
} from "../core/constants";
import { WORLD_BOUNDS } from "../core/gameConfig";
import { ENABLE_THREE_MIRROR } from "../core/featureFlags";
import { getIsoWorldBounds, worldToIso } from "../core/iso";
import { Ambience } from "../audio/Ambience";
import { Beep } from "../audio/Beep";
import { Player } from "../player/Player";
import { PlayerController } from "../player/PlayerController";
import { DangerZone } from "../systems/DangerZone";
import { CollisionDebugOverlay } from "../systems/CollisionDebugOverlay";
import { FeedbackSystem } from "../systems/FeedbackSystem";
import { RenderSync } from "../systems/RenderSync";
import { RescueSystem, RescueSnapshot, RunState } from "../systems/RescueSystem";
import { SimBridge } from "../sim/SimBridge";
import { CollisionWorld } from "../sim/CollisionWorld";
import { Locomotion3D } from "../sim/Locomotion3D";
import { TerrainQuery } from "../sim/TerrainQuery";
import { ThreeApp } from "../three/ThreeApp";
import { Hud } from "../ui/Hud";
import { Backdrop } from "../world/Backdrop";
import { RescueMap } from "../world/Map";
import { CollisionObstacle, Obstacles } from "../world/Obstacles";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private controller!: PlayerController;
  private locomotion!: Locomotion3D;
  private hud!: Hud;
  private backdrop!: Backdrop;
  private map!: RescueMap;
  private rescueSystem!: RescueSystem;
  private dangerZone!: DangerZone;
  private feedback!: FeedbackSystem;
  private renderSync!: RenderSync;
  private beep!: Beep;
  private ambience!: Ambience;
  private collisionDebug!: CollisionDebugOverlay;
  private threeApp: ThreeApp | null = null;
  private simBridge: SimBridge | null = null;
  private collisionObstacles: readonly CollisionObstacle[] = [];
  private toggleDebugKey: Phaser.Input.Keyboard.Key | null = null;
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

    this.backdrop = new Backdrop(this);
    this.map = new RescueMap(this);
    const obstacleSpecs = Obstacles.getSampleSpecs();
    new Obstacles(this, obstacleSpecs);

    this.player = new Player(this, 150, 160);

    this.collisionObstacles = Obstacles.toCollisionObstacles(obstacleSpecs);
    const collisionWorld = new CollisionWorld(WORLD_BOUNDS, this.collisionObstacles);
    const terrainQuery = new TerrainQuery((x, y) => this.map.terrain.getTerrainAt(x, y));
    this.locomotion = new Locomotion3D(this.player.sprite.x, this.player.sprite.y, terrainQuery, collisionWorld, PLAYER_COLLISION_RADIUS);

    this.controller = new PlayerController({
      scene: this
    });

    this.rescueSystem = new RescueSystem({
      scene: this,
      playerPosition: () => {
        const s = this.locomotion.getState();
        return { x: s.x, y: s.z };
      },
      evacZone: this.map.getEvacZone(),
      projectPoint: worldToIso
    });

    this.dangerZone = new DangerZone(this);
    this.feedback = new FeedbackSystem(this);
    this.renderSync = new RenderSync();
    this.renderSync.register(this.player.sprite, this.player.renderSprite, 100, PLAYER_ELEVATION_VISUAL_BIAS);

    this.beep = new Beep(this);
    this.ambience = new Ambience(this);

    this.cameras.main.startFollow(this.player.renderSprite, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(PHASER_CAMERA_FOLLOW_OFFSET_X, PHASER_CAMERA_FOLLOW_OFFSET_Y);

    this.hud = new Hud(this);
    this.collisionDebug = new CollisionDebugOverlay(this);
    this.toggleDebugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F2) ?? null;

    if (ENABLE_THREE_MIRROR) {
      const parent = document.getElementById("game-root");
      if (parent) {
        this.simBridge = new SimBridge({
          playerSprite: this.player.sprite,
          getPlayerState: () => this.locomotion.getState(),
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
    if (this.toggleDebugKey && Phaser.Input.Keyboard.JustDown(this.toggleDebugKey)) {
      this.collisionDebug.setEnabled(!this.collisionDebug.isEnabled());
    }

    this.rescueSystem.update(dtSeconds);
    let rescueView = this.rescueSystem.getSnapshot();
    if (rescueView.restartRequested) {
      this.scene.restart();
      return;
    }

    this.controller.setInputEnabled(rescueView.canInput);
    this.controller.setSprintEnabled(rescueView.sprintEnabled);
    const input = this.controller.captureInputFrame();

    if (rescueView.runState === "ACTIVE") {
      this.locomotion.step(dtSeconds, input, {
        inputEnabled: rescueView.canInput,
        sprintEnabled: rescueView.sprintEnabled,
        speedMultiplier: rescueView.speedMultiplier
      });
    } else {
      this.locomotion.stopMotion();
    }

    const playerState = this.locomotion.getState();
    this.player.sprite.setPosition(playerState.x, playerState.z);
    this.player.renderSprite.rotation = 0;
    if (Math.abs(playerState.vx) > 8) {
      this.player.renderSprite.setFlipX(playerState.vx < 0);
    }
    this.player.renderSprite.anims.timeScale = Phaser.Math.Clamp(Math.hypot(playerState.vx, playerState.vz) / 160, 0.45, 1.9);

    this.dangerZone.setPhase(rescueView.dangerPhase);
    if (rescueView.runState !== "WIN" && rescueView.runState !== "LOSE") {
      this.dangerZone.update(dtSeconds);
    }

    const contactPoint = this.locomotion.getContactPoint();
    const dangerEdgeDistance = this.dangerZone.distanceToEdge(contactPoint.x, contactPoint.y);
    if (rescueView.runState === "ACTIVE" && dangerEdgeDistance <= 0) {
      this.rescueSystem.forceLose("DANGER");
      rescueView = this.rescueSystem.getSnapshot();
      this.locomotion.stopMotion();
      this.feedback.trigger("DANGER_HIT");
    }

    this.renderSync.update();
    const dangerSnapshot = this.dangerZone.getSnapshot();
    this.collisionDebug.update({
      playerX: contactPoint.x,
      playerY: contactPoint.y,
      obstacles: this.collisionObstacles,
      danger: {
        centerX: dangerSnapshot.center.x,
        centerY: dangerSnapshot.center.y,
        killRadius: this.dangerZone.getKillRadius(),
        warningRadius: this.dangerZone.getWarningRadius()
      }
    });
    this.map.update(time, dtSeconds);
    this.backdrop.update(this.cameras.main.scrollX, this.cameras.main.scrollY, dtSeconds);

    if (this.simBridge && this.threeApp) {
      this.threeApp.update(this.simBridge.capture(time / 1000), dtSeconds);
    }

    const dangerDistance = this.dangerZone.distanceToEdge(contactPoint.x, contactPoint.y);
    const pressure = this.dangerZone.getPressureAt(contactPoint.x, contactPoint.y);

    this.feedback.update(dtSeconds);

    this.hud.updateView({
      staminaRatio: this.locomotion.getStaminaRatio(),
      terrain: this.locomotion.getTerrain(),
      sprinting: this.locomotion.isSprinting(),
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

    if (this.backdrop) {
      this.backdrop.destroy();
    }

    if (this.collisionDebug) {
      this.collisionDebug.destroy();
    }
  }
}
