// --- Player & Ability Types ---

export type StatBlock = {
  pace: number;       // 1-100: movement speed, break-away potential
  shooting: number;   // 1-100: shot accuracy and power
  passing: number;    // 1-100: pass accuracy, vision
  defense: number;    // 1-100: tackling, interception
  physical: number;   // 1-100: stamina, strength, aerial
  goalkeeping: number; // 1-100: reflexes, positioning (meaningful only for GK)
};

export type Archetype =
  | "striker"
  | "playmaker"
  | "guardian"
  | "enforcer"
  | "keeper"
  | "specialist";

export type RoleTag =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "attacker"
  | "hybrid";

export type Tier = "bronze" | "silver" | "gold" | "legendary";

export type AbilityTarget = "self" | "ally" | "enemy" | "team" | "ball";

export type Ability = {
  id: string;
  name: string;
  description: string;
  cooldownTicks: number;
  target: AbilityTarget;
  effect: AbilityEffect;
};

export type AbilityEffect = {
  type: "stat_boost" | "damage" | "heal" | "disrupt" | "special";
  stat?: keyof StatBlock;
  magnitude: number;    // percentage modifier or flat value
  durationTicks: number; // 0 = instant
};

export type Passive = {
  id: string;
  name: string;
  description: string;
  trigger: "always" | "on_possession" | "on_defense" | "on_low_stamina" | "on_goal";
  effect: AbilityEffect;
};

export type Ultimate = {
  id: string;
  name: string;
  description: string;
  chargeRequired: number; // ticks of play needed to charge
  effect: AbilityEffect;
};

export type PlayerDefinition = {
  id: string;
  name: string;
  archetype: Archetype;
  roleTags: RoleTag[];
  tier: Tier;
  stats: StatBlock;
  passive: Passive;
  activeSkill: Ability;
  ultimate: Ultimate;
  portrait: string;    // asset path or placeholder key
  flavorText: string;
};
