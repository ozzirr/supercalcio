"use client";

import { create } from "zustand";
import type { PlayerDefinition } from "@/types/player";
import type { Playstyle, LineupSlot } from "@/types/squad";
import type { MatchRecord, TeamStance, TeamCommand } from "@/types/match";
import { STARTER_PLAYERS } from "@/content/players";

type GameState = {
  // Roster & squad
  availablePlayers: PlayerDefinition[];
  lineup: LineupSlot[];
  playstyle: Playstyle;

  // Match
  currentMatch: MatchRecord | null;
  matchInProgress: boolean;
  stance: TeamStance;
  command: TeamCommand;

  // User
  xp: number;
  currency: number;

  // Actions
  setLineup: (lineup: LineupSlot[]) => void;
  addToLineup: (playerId: string, position: number) => void;
  removeFromLineup: (position: number) => void;
  swapLineupSlots: (posA: number, posB: number) => void;
  clearLineup: () => void;
  autoFillLineup: () => void;
  setPlaystyle: (playstyle: Playstyle) => void;
  setStance: (stance: TeamStance) => void;
  setCommand: (command: TeamCommand) => void;
  setMatchResult: (match: MatchRecord) => void;
  clearMatch: () => void;
  setMatchInProgress: (inProgress: boolean) => void;
  addRewards: (xp: number, currency: number) => void;
};

export const useGameStore = create<GameState>((set) => ({
  availablePlayers: STARTER_PLAYERS,
  lineup: [],
  playstyle: "possession_control",

  currentMatch: null,
  matchInProgress: false,
  stance: "balanced",
  command: "none",

  xp: 0,
  currency: 100,

  setLineup: (lineup) => set({ lineup }),

  addToLineup: (playerId, position) =>
    set((state) => {
      const filtered = state.lineup.filter((s) => s.position !== position && s.playerId !== playerId);
      return { lineup: [...filtered, { position, playerId }] };
    }),

  removeFromLineup: (position) =>
    set((state) => ({
      lineup: state.lineup.filter((s) => s.position !== position),
    })),

  swapLineupSlots: (posA, posB) =>
    set((state) => {
      const slotA = state.lineup.find((s) => s.position === posA);
      const slotB = state.lineup.find((s) => s.position === posB);
      if (!slotA && !slotB) return state;
      const rest = state.lineup.filter((s) => s.position !== posA && s.position !== posB);
      const swapped: LineupSlot[] = [];
      if (slotA) swapped.push({ position: posB, playerId: slotA.playerId });
      if (slotB) swapped.push({ position: posA, playerId: slotB.playerId });
      return { lineup: [...rest, ...swapped] };
    }),

  clearLineup: () => set({ lineup: [] }),

  autoFillLineup: () =>
    set((state) => {
      const players = state.availablePlayers;
      const gk = players.find((p) => p.roleTags.includes("goalkeeper"));
      const def = players.find((p) => p.roleTags.includes("defender"));
      const mid = players.find((p) => p.roleTags.includes("midfielder"));
      const atks = players.filter((p) => p.roleTags.includes("attacker"));
      const hyb = players.find((p) => p.roleTags.includes("hybrid"));
      const picks = [gk, def, mid, atks[0], atks[1] ?? hyb].filter(Boolean) as PlayerDefinition[];
      return {
        lineup: picks.slice(0, 5).map((p, i) => ({ position: i, playerId: p.id })),
      };
    }),

  setPlaystyle: (playstyle) => set({ playstyle }),
  setStance: (stance) => set({ stance }),
  setCommand: (command) => set({ command }),

  setMatchResult: (match) => set({ currentMatch: match, matchInProgress: false }),
  clearMatch: () => set({ currentMatch: null, stance: "balanced", command: "none" }),
  setMatchInProgress: (inProgress) => set({ matchInProgress: inProgress }),

  addRewards: (xp, currency) =>
    set((state) => ({
      xp: state.xp + xp,
      currency: state.currency + currency,
    })),
}));
