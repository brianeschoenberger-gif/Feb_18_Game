import Phaser from "phaser";
import { BEEP_INTERVAL_FAR_SEC, BEEP_INTERVAL_NEAR_SEC } from "../core/constants";

export class Beep {
  private audioContext: AudioContext | null = null;
  private readonly unlockHandler: () => void;
  private timeUntilBeep = 0;

  public constructor(private readonly scene: Phaser.Scene) {
    this.unlockHandler = () => {
      this.ensureContext();
      window.removeEventListener("pointerdown", this.unlockHandler);
      window.removeEventListener("keydown", this.unlockHandler);
    };

    window.addEventListener("pointerdown", this.unlockHandler);
    window.addEventListener("keydown", this.unlockHandler);
  }

  public update(dtSec: number, signal: number, enabled: boolean): void {
    if (!enabled) {
      this.timeUntilBeep = 0;
      return;
    }

    this.ensureContext();
    if (!this.audioContext || this.audioContext.state !== "running") {
      return;
    }

    this.timeUntilBeep -= dtSec;
    if (this.timeUntilBeep > 0) {
      return;
    }

    this.playChirp(0.04, 420 + signal * 4.8, "triangle", 0.05);
    const t = Phaser.Math.Clamp(signal / 100, 0, 1);
    const eased = t * t;
    this.timeUntilBeep = Phaser.Math.Linear(BEEP_INTERVAL_FAR_SEC, BEEP_INTERVAL_NEAR_SEC, eased);
  }

  public playStrike(): void {
    this.ensureContext();
    this.playChirp(0.09, 980, "sawtooth", 0.07);
  }

  public playSecure(): void {
    this.ensureContext();
    this.playChirp(0.16, 650, "sine", 0.07);
    this.playChirp(0.16, 830, "sine", 0.055, 0.1);
  }

  public playRadioDispatch(): void {
    this.ensureContext();
    this.playChirp(0.09, 560, "square", 0.04);
    this.playChirp(0.09, 680, "square", 0.035, 0.12);
  }

  public playWinCue(): void {
    this.ensureContext();
    this.playChirp(0.12, 620, "triangle", 0.05);
    this.playChirp(0.12, 820, "triangle", 0.05, 0.12);
    this.playChirp(0.14, 1020, "triangle", 0.045, 0.24);
  }

  public playLoseCue(): void {
    this.ensureContext();
    this.playChirp(0.18, 420, "sawtooth", 0.055);
    this.playChirp(0.18, 290, "sawtooth", 0.05, 0.16);
  }

  public destroy(): void {
    window.removeEventListener("pointerdown", this.unlockHandler);
    window.removeEventListener("keydown", this.unlockHandler);
    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close();
    }
    this.audioContext = null;
  }

  private ensureContext(): void {
    if (!this.audioContext) {
      this.audioContext = new window.AudioContext();
    }

    if (this.audioContext.state === "suspended") {
      void this.audioContext.resume();
    }
  }

  private playChirp(durationSec: number, frequency: number, type: OscillatorType, gainPeak: number, delaySec = 0): void {
    if (!this.audioContext || this.audioContext.state !== "running") {
      return;
    }

    const start = this.audioContext.currentTime + delaySec;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(start);
    osc.stop(start + durationSec + 0.02);
  }
}
