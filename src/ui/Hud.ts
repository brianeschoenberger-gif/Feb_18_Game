import Phaser from "phaser";
import { TerrainType } from "../world/Terrain";
import { RescueMode, RunState } from "../systems/RescueSystem";

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

  public constructor(scene: Phaser.Scene) {
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
      .setScrollFactor(0);

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
      .setScrollFactor(0);

    this.hintText = scene.add
      .text(30, 202, "Move: WASD/Arrows  Sprint: Shift  Mode: Tab  Action: E  Restart: R", {
        fontFamily: "Verdana",
        fontSize: "13px",
        color: "#c9d8e6"
      })
      .setScrollFactor(0);

    this.digBg = scene.add.rectangle(30, 234, this.maxDigWidth, 16, 0x212d3c, 0.9).setOrigin(0, 0).setScrollFactor(0);
    this.digFill = scene.add.rectangle(30, 234, 0, 16, 0x77d5ff, 1).setOrigin(0, 0).setScrollFactor(0);
    this.digText = scene.add
      .text(30, 214, "DIG PROGRESS", {
        fontFamily: "Verdana",
        fontSize: "13px",
        color: "#c5ecff",
        fontStyle: "bold"
      })
      .setScrollFactor(0);

    this.dispatchOverlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x050a13, 0.8).setOrigin(0, 0).setScrollFactor(0).setDepth(200);
    this.dispatchText = scene.add
      .text(scene.scale.width / 2, scene.scale.height / 2, "CODE WHITE \u2014 last seen near West Ridge", {
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
      .setDepth(210);

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
    this.directionArrow.rotation = view.directionAngleRad + Math.PI / 2;
    this.probeText.setText(`PROBES: ${view.probesRemaining}`);
    this.timerText.setText(`TIME: ${this.formatTime(view.timerSec)}`);

    const digVisible = view.mode === "DIG" && view.runState === "ACTIVE";
    this.digBg.setVisible(digVisible);
    this.digFill.setVisible(digVisible);
    this.digText.setVisible(digVisible);
    this.digFill.width = Phaser.Math.Clamp(view.digProgress, 0, 1) * this.maxDigWidth;

    this.dispatchOverlay.setVisible(view.runState === "DISPATCH");
    this.dispatchText.setVisible(view.runState === "DISPATCH");
    if (view.runState === "DISPATCH") {
      this.dispatchText.setText("CODE WHITE \u2014 last seen near West Ridge");
    }

    if (view.runState === "WIN") {
      this.showResult("WIN\nPress R to restart", "#a8ffbf");
    } else if (view.runState === "LOSE") {
      this.showResult("LOSE\nPress R to restart", "#ffb4b4");
    } else {
      this.hideResult();
    }

    this.bannerText.setText(view.bannerText);
    this.bannerText.setVisible(view.bannerText.length > 0);
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
