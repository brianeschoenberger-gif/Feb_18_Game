import Phaser from "phaser";
import {
  CARRY_SPEED_MULTIPLIER,
  CARRY_SPRINT_ENABLED,
  DIG_DURATION_SEC,
  DISPATCH_DURATION_SEC,
  PROBE_COUNT_MAX,
  PROBE_SUCCESS_RADIUS,
  RESCUE_TIMER_SEC,
  SIGNAL_MAX_DISTANCE,
  VICTIM_SPAWN_POINTS
} from "../core/constants";
import { DangerPhase } from "./DangerZone";

export type RescueMode = "SEARCH" | "PROBE" | "DIG" | "CARRY";
export type RunState = "DISPATCH" | "ACTIVE" | "WIN" | "LOSE";
export type LoseReason = "NONE" | "TIMER" | "DANGER";

export interface RescueSnapshot {
  readonly runState: RunState;
  readonly mode: RescueMode;
  readonly objective: string;
  readonly timerSec: number;
  readonly dispatchRemainingSec: number;
  readonly probesRemaining: number;
  readonly digProgress: number;
  readonly signal: number;
  readonly directionAngleRad: number;
  readonly bannerText: string;
  readonly hasVictimSecured: boolean;
  readonly canInput: boolean;
  readonly sprintEnabled: boolean;
  readonly speedMultiplier: number;
  readonly restartRequested: boolean;
  readonly dangerPhase: DangerPhase;
  readonly dangerTriggeredLose: boolean;
  readonly loseReason: LoseReason;
}

interface RescueSystemOptions {
  readonly scene: Phaser.Scene;
  readonly playerSprite: Phaser.Physics.Arcade.Sprite;
  readonly evacZone: Phaser.Geom.Rectangle;
  readonly projectPoint: (x: number, y: number, elevation?: number) => Phaser.Math.Vector2;
}

export class RescueSystem {
  private readonly scene: Phaser.Scene;
  private readonly playerSprite: Phaser.Physics.Arcade.Sprite;
  private readonly evacZone: Phaser.Geom.Rectangle;
  private readonly projectPoint: (x: number, y: number, elevation?: number) => Phaser.Math.Vector2;

  private readonly keyTab: Phaser.Input.Keyboard.Key;
  private readonly keyE: Phaser.Input.Keyboard.Key;
  private readonly keyR: Phaser.Input.Keyboard.Key;

  private runState: RunState = "DISPATCH";
  private mode: RescueMode = "SEARCH";
  private objective = "Stand by for dispatch";
  private timerSec = RESCUE_TIMER_SEC;
  private dispatchRemainingSec = DISPATCH_DURATION_SEC;
  private probesRemaining = PROBE_COUNT_MAX;
  private digProgress = 0;
  private signal = 0;
  private directionAngleRad = -Math.PI / 2;
  private bannerText = "";
  private bannerRemainingSec = 0;
  private hasVictimSecured = false;
  private restartRequested = false;
  private dangerPhase: DangerPhase = "IDLE";
  private dangerTriggeredLose = false;
  private loseReason: LoseReason = "NONE";

  private readonly victimPoint: Phaser.Math.Vector2;
  private readonly probeMarkers: Phaser.GameObjects.Group;
  private destroyed = false;

  public constructor(options: RescueSystemOptions) {
    this.scene = options.scene;
    this.playerSprite = options.playerSprite;
    this.evacZone = options.evacZone;
    this.projectPoint = options.projectPoint;

    const keyboard = this.scene.input.keyboard!;
    this.keyTab = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.keyE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyR = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    const spawn = VICTIM_SPAWN_POINTS[Phaser.Math.Between(0, VICTIM_SPAWN_POINTS.length - 1)];
    this.victimPoint = new Phaser.Math.Vector2(spawn.x, spawn.y);
    this.probeMarkers = this.scene.add.group();
  }

  public update(dtSec: number): void {
    this.restartRequested = false;
    this.updateBanner(dtSec);
    this.updateDirectionalSignal();

    if (this.runState === "DISPATCH") {
      this.dispatchRemainingSec = Math.max(0, this.dispatchRemainingSec - dtSec);
      this.objective = "Dispatch incoming";
      if (this.dispatchRemainingSec <= 0) {
        this.runState = "ACTIVE";
        this.mode = "SEARCH";
        this.objective = "Find strongest transceiver signal";
      }
      return;
    }

    if (this.runState === "WIN" || this.runState === "LOSE") {
      if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
        this.restartRequested = true;
      }
      return;
    }

    this.timerSec = Math.max(0, this.timerSec - dtSec);
    if (this.timerSec <= 0) {
      this.forceLose("TIMER");
      return;
    }

    if ((this.mode === "SEARCH" || this.mode === "PROBE") && Phaser.Input.Keyboard.JustDown(this.keyTab)) {
      this.mode = this.mode === "SEARCH" ? "PROBE" : "SEARCH";
      this.objective = this.mode === "SEARCH" ? "Track signal and close distance" : "Place probes near strongest signal";
    }

    if (this.mode === "PROBE") {
      this.handleProbePlacement();
    }

    if (this.mode === "DIG") {
      this.handleDigging(dtSec);
    }

    if (this.mode === "CARRY") {
      this.objective = "Get to EVAC";
      if (this.evacZone.contains(this.playerSprite.x, this.playerSprite.y)) {
        this.runState = "WIN";
        this.pushBanner("RESCUE COMPLETE");
      }
    }
  }

  public forceLose(reason: "TIMER" | "DANGER"): void {
    if (this.runState === "WIN" || this.runState === "LOSE") {
      return;
    }

    this.runState = "LOSE";
    this.loseReason = reason;
    this.objective = reason === "DANGER" ? "Caught by secondary slide" : "Victim lost";
    this.dangerTriggeredLose = reason === "DANGER";
    this.pushBanner(reason === "DANGER" ? "SECONDARY SLIDE!" : "TIME EXPIRED");
  }

  public getSnapshot(): RescueSnapshot {
    return {
      runState: this.runState,
      mode: this.mode,
      objective: this.objective,
      timerSec: this.timerSec,
      dispatchRemainingSec: this.dispatchRemainingSec,
      probesRemaining: this.probesRemaining,
      digProgress: this.digProgress,
      signal: this.signal,
      directionAngleRad: this.directionAngleRad,
      bannerText: this.bannerText,
      hasVictimSecured: this.hasVictimSecured,
      canInput: this.runState === "ACTIVE",
      sprintEnabled: this.runState === "ACTIVE" && (this.mode !== "CARRY" ? true : CARRY_SPRINT_ENABLED),
      speedMultiplier: this.runState === "ACTIVE" && this.mode === "CARRY" ? CARRY_SPEED_MULTIPLIER : 1,
      restartRequested: this.restartRequested,
      dangerPhase: this.dangerPhase,
      dangerTriggeredLose: this.dangerTriggeredLose,
      loseReason: this.loseReason
    };
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
  }

  private handleProbePlacement(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.keyE) || this.probesRemaining <= 0) {
      return;
    }

    this.probesRemaining -= 1;
    const markerPos = this.projectPoint(this.playerSprite.x, this.playerSprite.y, 8);
    const marker = this.scene.add.image(markerPos.x, markerPos.y, "probeMarker");
    marker.setDepth(this.playerSprite.y + 32);
    this.probeMarkers.add(marker);

    const distance = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, this.victimPoint.x, this.victimPoint.y);
    if (distance <= PROBE_SUCCESS_RADIUS) {
      this.mode = "DIG";
      this.digProgress = 0;
      this.objective = "Hold E to DIG";
      this.dangerPhase = "AFTER_STRIKE";
      this.pushBanner("STRIKE!");
    }
  }

  private handleDigging(dtSec: number): void {
    if (!this.keyE.isDown) {
      return;
    }

    this.digProgress = Math.min(1, this.digProgress + dtSec / DIG_DURATION_SEC);
    if (this.digProgress >= 1) {
      this.hasVictimSecured = true;
      this.mode = "CARRY";
      this.objective = "Get to EVAC";
      this.dangerPhase = "AFTER_SECURE";
      this.pushBanner("VICTIM SECURED");
    }
  }

  private updateDirectionalSignal(): void {
    const dx = this.victimPoint.x - this.playerSprite.x;
    const dy = this.victimPoint.y - this.playerSprite.y;
    const distance = Math.hypot(dx, dy);

    this.directionAngleRad = Math.atan2(dy, dx);

    const normalized = Phaser.Math.Clamp(distance / SIGNAL_MAX_DISTANCE, 0, 1);
    const strength = Phaser.Math.Clamp(1 - Math.pow(normalized, 1.65), 0, 1);
    this.signal = Math.round(strength * 100);
  }

  private updateBanner(dtSec: number): void {
    if (this.bannerRemainingSec <= 0) {
      this.bannerText = "";
      return;
    }

    this.bannerRemainingSec = Math.max(0, this.bannerRemainingSec - dtSec);
    if (this.bannerRemainingSec <= 0) {
      this.bannerText = "";
    }
  }

  private pushBanner(text: string): void {
    this.bannerText = text;
    this.bannerRemainingSec = 1.6;
  }
}
