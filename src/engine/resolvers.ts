import type { PlayerDefinition } from "../types/player";
import type { PlaystyleModifiers } from "../types/squad";
import type { SeededRandom } from "./random";

export type TeamPower = {
  attack: number;
  defense: number;
  control: number;
};

// Calculate abstract team strength for different phases of play
export function calculateTeamPower(
  players: PlayerDefinition[],
  modifiers: PlaystyleModifiers
): TeamPower {
  let attackScore = 0;
  let defenseScore = 0;
  let controlScore = 0;

  players.forEach((p) => {
    // Attack uses shooting and pace
    attackScore += p.stats.shooting * 1.2 + p.stats.pace * 0.8;
    // Defense uses defense and physical
    defenseScore += p.stats.defense * 1.5 + p.stats.physical * 0.5;
    // Control uses passing and physical
    controlScore += p.stats.passing * 1.3 + p.stats.physical * 0.7;
  });

  // Apply playstyle modifiers
  // possessionBias: helps with control
  // counterSpeed: helps with attack
  // defenseLine: higher line means more attack but less baseline defense stability
  
  controlScore += controlScore * (modifiers.possessionBias * 0.2);
  attackScore += attackScore * (modifiers.counterSpeed * 0.15 + (modifiers.defenseLine > 0.5 ? 0.1 : 0));
  defenseScore += defenseScore * ((1 - modifiers.defenseLine) * 0.15); // lower line = better defense

  return {
    attack: attackScore,
    defense: defenseScore,
    control: controlScore,
  };
}

export type PossessionOutcome = "keep" | "lose" | "attack";

// Determine what happens in midfield/open play
export function resolveMidfieldBattle(
  possessionTeamPower: TeamPower,
  defendingTeamPower: TeamPower,
  random: SeededRandom
): PossessionOutcome {
  // Base chance to keep the ball
  let keepBase = possessionTeamPower.control;
  let stealBase = defendingTeamPower.defense * 0.8;
  
  const total = keepBase + stealBase;
  const keepChance = keepBase / total;

  if (random.chance(keepChance)) {
    // If they kept it, they might advance to an attack phase
    // Chance to advance depends on attack power vs defense power
    const advanceChance = Math.min(0.3, (possessionTeamPower.attack / (defendingTeamPower.defense * 2)));
    if (random.chance(advanceChance)) {
      return "attack";
    }
    return "keep";
  } else {
    return "lose";
  }
}

export type AttackOutcome = "goal" | "save" | "miss" | "block";

// Resolve an attack phase
export function resolveAttack(
  attacker: PlayerDefinition,
  defender: PlayerDefinition,
  keeper: PlayerDefinition,
  random: SeededRandom
): AttackOutcome {
  
  // 1. Can the defender block it?
  const blockChance = Math.min(0.4, (defender.stats.defense * 1.2) / (attacker.stats.shooting + attacker.stats.pace));
  if (random.chance(blockChance)) {
    return "block";
  }

  // 2. Is the shot on target?
  const accuracyChance = Math.min(0.9, (attacker.stats.shooting * 0.8 + attacker.stats.passing * 0.2) / 100);
  if (!random.chance(accuracyChance)) {
    return "miss";
  }

  // 3. Can the keeper save it?
  // shot power vs keeper reflexes
  const shotPower = attacker.stats.shooting + random.int(0, 20);
  const savePower = keeper.stats.goalkeeping + random.int(0, 20);

  if (savePower >= shotPower) {
    return "save";
  }

  return "goal";
}
