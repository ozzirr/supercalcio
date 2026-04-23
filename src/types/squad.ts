// --- Squad & Playstyle Types ---

import type { PlayerDefinition } from "./player";

export type Playstyle = "aggressive_press" | "counter_attack" | "possession_control";

export const POSITION_LABELS = ["GK", "DEF", "MID", "ATK", "FLEX"];

export type PlaystyleDefinition = {
  id: Playstyle;
  name: string;
  description: string;
  modifiers: PlaystyleModifiers;
};

export type PlaystyleModifiers = {
  possessionBias: number;    // -1 to 1: negative = less possession, positive = more
  pressIntensity: number;    // 0 to 1: how aggressively the team presses
  counterSpeed: number;      // 0 to 1: speed of transitions
  defenseLine: number;       // 0 to 1: 0 = deep, 1 = high
  passingTempo: number;      // 0 to 1: 0 = slow build-up, 1 = direct
};

export type LineupSlot = {
  position: number;    // 0-4
  playerId: string;
};

export type Squad = {
  id: string;
  userId: string;
  name: string;
  playstyle: Playstyle;
  lineup: LineupSlot[];
};

export type SquadValidation = {
  valid: boolean;
  errors: string[];
};

export function validateSquad(
  lineup: LineupSlot[],
  roster: PlayerDefinition[]
): SquadValidation {
  const errors: string[] = [];

  if (lineup.length !== 5) {
    errors.push("Squad must have exactly 5 players.");
  }

  const playerIds = lineup.map((s) => s.playerId);
  const uniqueIds = new Set(playerIds);
  if (uniqueIds.size !== playerIds.length) {
    errors.push("Squad cannot have duplicate players.");
  }

  const players = lineup
    .map((s) => roster.find((p) => p.id === s.playerId))
    .filter((p): p is PlayerDefinition => p !== undefined);

  const keepers = players.filter((p) => p.roleTags.includes("goalkeeper"));
  if (keepers.length !== 1) {
    errors.push("Squad must have exactly 1 goalkeeper.");
  }

  return { valid: errors.length === 0, errors };
}
