import Phaser from "phaser";
import {
  BANNER_TWEEN_IN_MS,
  BANNER_TWEEN_OUT_MS,
  DANGER_WARN_FAR,
  DANGER_WARN_NEAR,
  TIMER_URGENCY_CRITICAL_SEC,
  TIMER_URGENCY_HIGH_SEC
} from "../core/constants";
import { worldAngleToIso } from "../core/iso";
import { LoseReason, RescueMode, RunState } from "../systems/RescueSystem";
import { DangerPhase } from "../systems/DangerZone";
import { TerrainType } from "../world/Terrain";

export interface HudViewModel {
  readonly staminaRatio: number;
  readonly terrain: TerrainType;
  readonly sprinting: boolean;
  readonly mode: RescueMode;
  readonly objective: string;
  readonly signal: number;
  readonly directionAngleRad: number;
  readonly probesRemaining: number;
  readonly digProgress: number;
  readonly timerSec: number;
  readonly dispatchRemainingSec: number;
  readonly runState: RunState;
  readonly bannerText: string;
  readonly dangerPhase: DangerPhase;
  readonly dangerDistance: number;
  readonly dangerActive: boolean;
  readonly loseReason: LoseReason;
}

export class Hud {
  private readonly barBackground: Phaser.GameObjects.Rectangle;
  private readonly barFill: Phaser.GameObjects.Rectangle;
  private readonly staminaText: Phaser.GameObjects.Text;
  private readonly terrainText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;

  private readonly modeText: Phaser.GameObjects.Text;
  private readonly objectiveText: Phaser.GameObjects.Text;
  private readonly signalText: Phaser.GameObjects.Text;
  private readonly probeText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly dangerText: Phaser.GameObjects.Text;
  private readonly directionArrow: Phaser.GameObjects.Triangle;

  private readonly digBg: Phaser.GameObjects.Rectangle;
  private readonly digFill: Phaser.GameObjects.Rectangle;
  private readonly digText: Phaser.GameObjects.Text;

  private readonly dispatchOverlay: Phaser.GameObjects.Rectangle;
  private readonly dispatchText: Phaser.GameObjects.Text;

  private readonly resultOverlay: Phaser.GameObjects.Rectangle;
  private readonly resultText: Phaser.GameObjects.Text;

  private readonly bannerText: Phaser.GameObjects.Text;

  private readonly maxBarWidth = 280;
  private readonly maxDigWidth = 260;

  private lastMode: RescueMode = "SEARCH";
  private lastBannerText = "";

  public constructor(private readonly scene: Phaser.Scene) {
    this.barBackground = scene.add.rectangle(30, 26, this.maxBarWidth, 18, 0x1f2a36, 0.9).setOrigin(0, 0).setScrollFactor(0);
    this.barFill = scene.add.rectangle(30, 26, this.maxBarWidth, 18, 0x65d478, 1).setOrigin(0, 0).setScrollFactor(0);

    this.staminaText = scene.add
      .text(30, 2, "STAMINA", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#eaf2ff",
        fontStyle: "bold"
      })
      .setScrollFactor(0);

    this.terrainText = scene.add
      .text(30, 54, "TERRAIN: OPEN_SNOW", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#eaf2ff"
      })
      .setScrollFactor(0);

    this.modeText = scene.add
      .text(30, 78, "MODE: SEARCH", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#fff2a8",
        fontStyle: "bold"
      })
      .setScrollFactor(0)
      .setOrigin(0, 0.5);

    this.objectiveText = scene.add
      .text(30, 102, "OBJECTIVE: Find strongest transceiver signal", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#d8ebff"
      })
      .setScrollFactor(0);

    this.signalText = scene.add
      .text(30, 126, "SIGNAL: 0", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#9ee6ff"
      })
      .setScrollFactor(0);

    this.directionArrow = scene.add.triangle(172, 136, 0, 16, 14, -10, -14, -10, 0x9ee6ff, 0.95).setScrollFactor(0);

    this.probeText = scene.add
      .text(30, 150, "PROBES: 5", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#ffdcb0"
      })
      .setScrollFactor(0);

    this.timerText = scene.add
      .text(30, 174, "TIME: 03:00", {
        fontFamily: "Verdana",
        fontSize: "18px",
        color: "#ffd6d6",
        fontStyle: "bold"
      })
      .setScrollFactor(0)
      .setOrigin(0, 0.5);

    this.dangerText = scene.add
      .text(30, 198, "DANGER: LOW", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#ffd4a4",
        fontStyle: "bold"
      })
      .setScrollFactor(0)
      .setOrigin(0, 0.5);

    this.hintText = scene.add
      .text(30, 222, "Move: WASD/Arrows  Sprint: Shift  Mode: Tab  Action: E  Restart: R", {
        fontFamily: "Verdana",
        fontSize: "13px",
        color: "#c9d8e6"
      })
      .setScrollFactor(0);

    this.digBg = scene.add.rectangle(30, 254, this.maxDigWidth, 16, 0x212d3c, 0.9).setOrigin(0, 0).setScrollFactor(0);
    this.digFill = scene.add.rectangle(30, 254, 0, 16, 0x77d5ff, 1).setOrigin(0, 0).setScrollFactor(0);
    this.digText = scene.add
      .text(30, 234, "DIG PROGRESS", {
        fontFamily: "Verdana",
        fontSize: "13px",
        color: "#c5ecff",
        fontStyle: "bold"
      })
      .setScrollFactor(0);

    this.dispatchOverlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x050a13, 0.8).setOrigin(0, 0).setScrollFactor(0).setDepth(200);
    this.dispatchText = scene.add
      .text(scene.scale.width / 2, scene.scale.height / 2, "CODE WHITE - last seen near West Ridge", {
        fontFamily: "Verdana",
        fontSize: "34px",
        color: "#f4f8ff",
        fontStyle: "bold",
        align: "center"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    this.resultOverlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x050a13, 0.8).setOrigin(0, 0).setScrollFactor(0).setDepth(220);
    this.resultText = scene.add
      .text(scene.scale.width / 2, scene.scale.height / 2, "", {
        fontFamily: "Verdana",
        fontSize: "44px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(221);

    this.bannerText = scene.add
      .text(scene.scale.width / 2, 60, "", {
        fontFamily: "Verdana",
        fontSize: "34px",
        color: "#fff79f",
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(210)
      .setAlpha(0);

    this.hideResult();
  }

  public updateView(view: HudViewModel): void {
    const width = Phaser.Math.Clamp(view.staminaRatio, 0, 1) * this.maxBarWidth;
    this.barFill.width = width;

    if (view.staminaRatio < 0.2) {
      this.barFill.fillColor = 0xf45d5d;
    } else if (view.sprinting) {
      this.barFill.fillColor = 0xffcd5f;
    } else {
      this.barFill.fillColor = 0x65d478;
    }

    this.terrainText.setText(`TERRAIN: ${view.terrain}`);
    this.modeText.setText(`MODE: ${view.mode}`);
    this.objectiveText.setText(`OBJECTIVE: ${view.objective}`);
    this.signalText.setText(`SIGNAL: ${view.signal}`);
    this.directionArrow.rotation = worldAngleToIso(view.directionAngleRad) + Math.PI / 2;
    this.probeText.setText(`PROBES: ${view.probesRemaining}`);
    this.timerText.setText(`TIME: ${this.formatTime(view.timerSec)}`);

    if (view.mode !== this.lastMode) {
      this.scene.tweens.add({
        targets: this.modeText,
        scaleX: 1.08,
        scaleY: 1.08,
        yoyo: true,
        duration: 110
      });
      this.lastMode = view.mode;
    }

    this.updateTimerUrgency(view.timerSec);
    this.updateDangerReadout(view.dangerPhase, view.dangerDistance, view.dangerActive);

    const digVisible = view.mode === "DIG" && view.runState === "ACTIVE";
    this.digBg.setVisible(digVisible);
    this.digFill.setVisible(digVisible);
    this.digText.setVisible(digVisible);
    this.digFill.width = Phaser.Math.Clamp(view.digProgress, 0, 1) * this.maxDigWidth;

    this.dispatchOverlay.setVisible(view.runState === "DISPATCH");
    this.dispatchText.setVisible(view.runState === "DISPATCH");

    if (view.runState === "WIN") {
      this.showResult("WIN\nPress R to restart", "#a8ffbf");
    } else if (view.runState === "LOSE") {
      if (view.loseReason === "DANGER") {
        this.showResult("CAUGHT BY SECONDARY SLIDE\nPress R to restart", "#ffb4b4");
      } else {
        this.showResult("LOSE\nPress R to restart", "#ffb4b4");
      }
    } else {
      this.hideResult();
    }

    if (view.bannerText !== this.lastBannerText) {
      this.playBannerTween(view.bannerText);
      this.lastBannerText = view.bannerText;
    }
  }

  private playBannerTween(text: string): void {
    if (!text) {
      this.scene.tweens.add({
        targets: this.bannerText,
        alpha: 0,
        duration: BANNER_TWEEN_OUT_MS
      });
      return;
    }

    this.bannerText.setText(text);
    this.bannerText.setScale(0.85);
    this.bannerText.setAlpha(0);
    this.scene.tweens.add({
      targets: this.bannerText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: BANNER_TWEEN_IN_MS,
      ease: "Quad.Out"
    });
  }

  private updateTimerUrgency(timerSec: number): void {
    const wobble = 1 + Math.sin(this.scene.time.now / 90) * 0.03;

    if (timerSec <= TIMER_URGENCY_CRITICAL_SEC) {
      this.timerText.setColor("#ff7b7b");
      this.timerText.setScale(wobble + 0.04);
      return;
    }

    if (timerSec <= TIMER_URGENCY_HIGH_SEC) {
      this.timerText.setColor("#ffbf7a");
      this.timerText.setScale(wobble);
      return;
    }

    this.timerText.setColor("#ffd6d6");
    this.timerText.setScale(1);
  }

  private updateDangerReadout(phase: DangerPhase, distance: number, active: boolean): void {
    if (!active) {
      this.dangerText.setText("DANGER: OFF");
      this.dangerText.setColor("#8ea0b2");
      this.dangerText.setScale(1);
      return;
    }

    if (distance <= DANGER_WARN_NEAR) {
      this.dangerText.setText(`DANGER: CRITICAL (${Math.max(0, Math.round(distance))}m)`);
      this.dangerText.setColor("#ff6f6f");
      this.dangerText.setScale(1 + Math.sin(this.scene.time.now / 80) * 0.035);
      return;
    }

    if (distance <= DANGER_WARN_FAR || phase !== "IDLE") {
      this.dangerText.setText(`DANGER: RISING (${Math.round(distance)}m)`);
      this.dangerText.setColor("#ffb870");
      this.dangerText.setScale(1);
      return;
    }

    this.dangerText.setText(`DANGER: LOW (${Math.round(distance)}m)`);
    this.dangerText.setColor("#ffd4a4");
    this.dangerText.setScale(1);
  }

  private showResult(text: string, color: string): void {
    this.resultOverlay.setVisible(true);
    this.resultText.setVisible(true);
    this.resultText.setText(text);
    this.resultText.setColor(color);
  }

  private hideResult(): void {
    this.resultOverlay.setVisible(false);
    this.resultText.setVisible(false);
  }

  private formatTime(totalSec: number): string {
    const safe = Math.max(0, Math.ceil(totalSec));
    const min = Math.floor(safe / 60)
      .toString()
      .padStart(2, "0");
    const sec = (safe % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }
}
