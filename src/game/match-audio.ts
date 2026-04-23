"use client";

import { useGameStore } from "@/lib/store/game-store";

type MatchSound = "whistle" | "goal" | "save";

class MatchAudioManager {
  private context: AudioContext | null = null;
  private unlocked = false;

  unlock() {
    const ctx = this.getContext();
    if (!ctx) return;

    void ctx.resume().then(() => {
      this.unlocked = ctx.state === "running";
    }).catch(() => {});
  }

  play(sound: MatchSound) {
    if (typeof window === "undefined" || useGameStore.getState().isMuted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state !== "running") {
      this.unlock();
      if (!this.unlocked) return;
    }

    switch (sound) {
      case "whistle":
        this.playWhistle(ctx);
        break;
      case "goal":
        this.playGoal(ctx);
        break;
      case "save":
        this.playSave(ctx);
        break;
    }
  }

  private getContext() {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.context) this.context = new AudioCtx();
    return this.context;
  }

  private playWhistle(ctx: AudioContext) {
    const now = ctx.currentTime;
    this.playTone(ctx, { frequency: 1450, duration: 0.12, gain: 0.04, type: "square", when: now });
    this.playTone(ctx, { frequency: 1320, duration: 0.14, gain: 0.035, type: "square", when: now + 0.04 });
  }

  private playGoal(ctx: AudioContext) {
    const now = ctx.currentTime;
    this.playTone(ctx, { frequency: 420, duration: 0.14, gain: 0.05, type: "sawtooth", when: now });
    this.playTone(ctx, { frequency: 620, duration: 0.18, gain: 0.045, type: "sawtooth", when: now + 0.06 });
    this.playTone(ctx, { frequency: 840, duration: 0.26, gain: 0.04, type: "triangle", when: now + 0.12 });
  }

  private playSave(ctx: AudioContext) {
    const now = ctx.currentTime;
    this.playNoiseBurst(ctx, now, 0.12, 0.025, 900);
    this.playTone(ctx, { frequency: 220, duration: 0.12, gain: 0.03, type: "square", when: now + 0.01 });
    this.playTone(ctx, { frequency: 170, duration: 0.16, gain: 0.025, type: "square", when: now + 0.08 });
  }

  private playTone(
    ctx: AudioContext,
    {
      frequency,
      duration,
      gain,
      type,
      when,
    }: {
      frequency: number;
      duration: number;
      gain: number;
      type: OscillatorType;
      when: number;
    }
  ) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.92), when + duration);

    gainNode.gain.setValueAtTime(0.0001, when);
    gainNode.gain.exponentialRampToValueAtTime(gain, when + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + duration + 0.02);
  }

  private playNoiseBurst(
    ctx: AudioContext,
    when: number,
    duration: number,
    gain: number,
    highpass: number
  ) {
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < channel.length; i++) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / channel.length);
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(highpass, when);

    gainNode.gain.setValueAtTime(gain, when);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(when);
    source.stop(when + duration);
  }
}

export const matchAudio = new MatchAudioManager();
