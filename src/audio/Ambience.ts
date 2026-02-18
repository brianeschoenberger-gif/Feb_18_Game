import Phaser from "phaser";
import { AMBIENCE_BASE_GAIN, AMBIENCE_MAX_GAIN } from "../core/constants";

export class Ambience {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lowPass: BiquadFilterNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private started = false;

  private readonly unlockHandler: () => void;

  public constructor(private readonly scene: Phaser.Scene) {
    this.unlockHandler = () => {
      this.ensureContext();
      if (this.started) {
        this.start();
      }
      window.removeEventListener("pointerdown", this.unlockHandler);
      window.removeEventListener("keydown", this.unlockHandler);
    };

    window.addEventListener("pointerdown", this.unlockHandler);
    window.addEventListener("keydown", this.unlockHandler);
  }

  public start(): void {
    this.started = true;
    this.ensureContext();

    if (!this.audioContext || this.audioContext.state !== "running") {
      return;
    }

    if (this.noiseSource) {
      return;
    }

    const buffer = this.createNoiseBuffer(this.audioContext, 3);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowPass = this.audioContext.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 900;

    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = AMBIENCE_BASE_GAIN;

    const lfo = this.audioContext.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 0.008;

    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);

    source.connect(lowPass);
    lowPass.connect(masterGain);
    masterGain.connect(this.audioContext.destination);

    source.start();
    lfo.start();

    this.noiseSource = source;
    this.lowPass = lowPass;
    this.masterGain = masterGain;
    this.lfo = lfo;
    this.lfoGain = lfoGain;
  }

  public setIntensity(level: number): void {
    if (!this.masterGain || !this.audioContext) {
      return;
    }

    const t = Phaser.Math.Clamp(level, 0, 1);
    const targetGain = Phaser.Math.Linear(AMBIENCE_BASE_GAIN, AMBIENCE_MAX_GAIN, t);
    this.masterGain.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.18);
  }

  public stop(): void {
    if (this.noiseSource) {
      this.noiseSource.stop();
      this.noiseSource.disconnect();
      this.noiseSource = null;
    }

    if (this.lfo) {
      this.lfo.stop();
      this.lfo.disconnect();
      this.lfo = null;
    }

    if (this.lfoGain) {
      this.lfoGain.disconnect();
      this.lfoGain = null;
    }

    if (this.lowPass) {
      this.lowPass.disconnect();
      this.lowPass = null;
    }

    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
  }

  public destroy(): void {
    window.removeEventListener("pointerdown", this.unlockHandler);
    window.removeEventListener("keydown", this.unlockHandler);

    this.stop();

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

  private createNoiseBuffer(context: AudioContext, durationSec: number): AudioBuffer {
    const length = Math.floor(context.sampleRate * durationSec);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.025 * white) / 1.025;
      data[i] = last * 3.2;
    }

    return buffer;
  }
}
