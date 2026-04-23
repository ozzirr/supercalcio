// --- Match & Simulation Types ---

import type { Playstyle } from "./squad";

export type MatchPhase = "kickoff" | "open_play" | "attack" | "defense" | "set_piece" | "halftime" | "finished";

export type TeamStance = "balanced" | "aggressive" | "defensive";

export type TeamCommand = "focus_attack" | "protect_lead" | "none";

export type MatchEventType =
  | "kickoff"
  | "possession_change"
  | "pass"
  | "dribble"
  | "tackle"
  | "shot"
  | "save"
  | "goal"
  | "miss"
  | "foul"
  | "ability_used"
  | "ultimate_used"
  | "stance_change"
  | "command_issued"
  | "halftime"
  | "full_time"
  | "yellow_card"
  | "red_card";

export type MatchEvent = {
  tick: number;
  type: MatchEventType;
  team: "home" | "away";
  actorId: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
};

export type MatchPlayerStats = {
  playerId: string;
  goals: number;
  assists: number;
  shots: number;
  passes: number;
  tackles: number;
  saves: number;
  abilitiesUsed: number;
  rating: number; // 1-10 post-match rating
};

export type MatchResult = {
  homeScore: number;
  awayScore: number;
  outcome: "win" | "loss" | "draw";
};

export type MatchTimeline = {
  events: MatchEvent[];
  totalTicks: number;
};

export type MatchRecord = {
  id: string;
  userId: string;
  squadId: string;
  opponentSeed: number;
  result: MatchResult;
  timeline: MatchTimeline;
  playerStats: MatchPlayerStats[];
  rewards: MatchRewards;
  createdAt: string;
};

export type MatchRewards = {
  xp: number;
  currency: number;
};

export type MatchConfig = {
  totalTicks: number;
  halftimeTick: number;
  seed: number;
  homePlaystyle: Playstyle;
  awayPlaystyle: Playstyle;
  homeStance: TeamStance;
  awayStance: TeamStance;
  homeCommand: TeamCommand;
  awayCommand: TeamCommand;
};

export type InterventionAction =
  | { type: "stance_change"; stance: TeamStance }
  | { type: "command"; command: TeamCommand }
  | { type: "ultimate"; playerId: string };
