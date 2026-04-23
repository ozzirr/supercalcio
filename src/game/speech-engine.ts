"use client";

import type { MatchEvent } from "@/types/match";
import type { PlayerDefinition } from "@/types/player";
import { useGameStore } from "@/lib/store/game-store";

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private enabled = true;
  private lastSpeechTime = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis;
      // Wait for voices to load
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
      this.loadVoices();
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    
    // Comprehensive list of Italian male-sounding voices across different platforms
    const maleItalianNames = [
      "Luca", "Giorgio", "Cosimo", "Pietro", "Paolo", "Gianni",
      "Daniel", "Google italiano", "Microsoft Cosimo", "Marco", "Fabio"
    ];
    
    // First, try to find an Italian male voice by name or keyword
    this.voice = voices.find(v => 
      v.lang.startsWith("it") && 
      (maleItalianNames.some(name => v.name.includes(name)) || v.name.toLowerCase().includes("male"))
    ) || voices.find(v => v.lang.startsWith("it")) || voices[0];
  }

  speak(text: string, rate: number = 1.2, pitch: number = 1.0, priority: boolean = false) {
    if (!this.synth || useGameStore.getState().isMuted) return;

    // AVOID OVERLAPPING: 
    // If already speaking, discard new messages unless it's a priority (like a GOAL)
    if (this.synth.speaking && !priority) {
      return;
    }

    // Force interrupt if it's a priority message
    if (priority) {
      this.synth.cancel();
    }

    const now = Date.now();
    this.lastSpeechTime = now;
    
    // Create new utterance and keep reference to prevent GC issues
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    if (this.voice) this.currentUtterance.voice = this.voice;
    this.currentUtterance.rate = rate;
    this.currentUtterance.pitch = pitch;
    this.currentUtterance.volume = 1.0;
    
    this.currentUtterance.onend = () => { this.currentUtterance = null; };
    this.currentUtterance.onerror = () => { this.currentUtterance = null; };

    // Bug fix for some browsers: resume before speaking
    this.synth.resume();
    this.synth.speak(this.currentUtterance);

    // Periodic "kickstart" to prevent the speech engine from timing out
    const kickstart = setInterval(() => {
        if (this.synth?.speaking) {
            this.synth.pause();
            this.synth.resume();
        } else {
            clearInterval(kickstart);
        }
    }, 5000);
  }

  announceEvent(event: MatchEvent, actor: PlayerDefinition | null, target: PlayerDefinition | null) {
    const actorName = actor ? actor.name.split(" ")[0].toUpperCase() : "";
    const targetName = target ? target.name.split(" ")[0].toUpperCase() : "";

    let text = "";
    let rate = 1.15;
    let priority = false;

    // High priority events (always spoken)
    if (event.type === "goal") {
      const phrases = [
        `GOOOOOL! GOOOOOL! SEMPRE LUI! ${actorName}!`,
        `RETE! RETE! ESPLODE LO STADIO! HA SEGNATO ${actorName}!`,
        `INCREDIBILE! UN GOL DA CINETECA! BENUTI NEL MONDO GIOOL!`
      ];
      text = phrases[Math.floor(Math.random() * phrases.length)];
      rate = 1.4;
      priority = true;
    } else if (event.type === "save") {
      const phrases = [
        `MIRACOLO DI ${actorName}! LA TOGLIE DALL'INCROCIO!`,
        `${actorName}! MA COSA HA PRESO?! PARATA PAZZESCA!`,
        `NON PASSA NULLA! INTERVENTO PROVVIDENZIALE PER GIOOL!`
      ];
      text = phrases[Math.floor(Math.random() * phrases.length)];
      rate = 1.35;
      priority = true;
    } else if (event.type === "kickoff") {
      text = "TUTTO PRONTO! SI PARTE! BUON DIVERTIMENTO!";
    } else if (event.type === "full_time") {
      text = "FISCHIO FINALE! TRIPLICE FISCHIO! FINISCE QUI!";
      priority = true;
    } 
    // Low priority / Play-by-play (highly randomized for realism)
    else {
      const rand = Math.random();
      if (rand > 0.94) { // Very selective for standard events
        if (event.type === "pass") text = `${actorName} CERCA ${targetName}.`;
        else if (event.type === "dribble") text = `GRANDE GIOCATA DI ${actorName}!`;
        else if (event.type === "shot") text = `PARTE IL TIRO DI ${actorName}!`;
        else if (event.type === "tackle") text = `INTERVENTO PULITO DI ${actorName}!`;
      }
    }

    if (text) {
      this.speak(text, rate, 1.0, priority);
    }
  }
}

export const speechEngine = new SpeechEngine();
