// --- User & Progression Types ---

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  xp: number;
  currency: number;
  level: number;
  energy_amount: number;
  last_energy_update: string;
  current_streak: number;
  last_login_date: string;
  createdAt: string;
};

export type UserProgression = {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
};

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  let required = 100;
  let accumulated = 0;
  while (accumulated + required <= totalXp) {
    accumulated += required;
    level++;
    required = Math.floor(100 * Math.pow(1.5, level - 1));
  }
  return level;
}
