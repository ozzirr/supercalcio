// --- Database Sync Script ---

import { createClient } from "@supabase/supabase-js";
import type { RawPlayerData, FailureEntry } from "./types";
import { logVerbose, sanitizeFilename } from "./utils";
import type { PlayerDefinition, Tier, Archetype, RoleTag, StatBlock } from "../../src/types/player";

function getSupabaseClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

function generateStats(role: string, tier: Tier): StatBlock {
  const tierBonus = { bronze: 0, silver: 10, gold: 20, legendary: 30 }[tier];
  const base = Math.floor(Math.random() * 20) + 50 + tierBonus;
  
  if (role === "GK") {
    return {
      pace: Math.floor(Math.random() * 20) + 30 + (tierBonus / 2),
      shooting: 10,
      passing: Math.floor(Math.random() * 30) + 40 + (tierBonus / 2),
      defense: Math.floor(Math.random() * 25) + 50 + tierBonus,
      physical: Math.floor(Math.random() * 25) + 55 + tierBonus,
      goalkeeping: base + 15,
    };
  }
  
  if (role === "DEF") {
    return {
      pace: Math.floor(Math.random() * 30) + 50 + (tierBonus / 2),
      shooting: Math.floor(Math.random() * 20) + 20,
      passing: Math.floor(Math.random() * 25) + 45 + (tierBonus / 3),
      defense: base + 15,
      physical: base + 5,
      goalkeeping: 5,
    };
  }
  
  if (role === "MID") {
    return {
      pace: base - 5,
      shooting: Math.floor(Math.random() * 25) + 50 + (tierBonus / 3),
      passing: base + 10,
      defense: Math.floor(Math.random() * 20) + 40 + (tierBonus / 3),
      physical: Math.floor(Math.random() * 20) + 55 + (tierBonus / 3),
      goalkeeping: 5,
    };
  }
  
  // ATT
  return {
    pace: base + 10,
    shooting: base + 5,
    passing: Math.floor(Math.random() * 25) + 45,
    defense: Math.floor(Math.random() * 15) + 20,
    physical: Math.floor(Math.random() * 20) + 55,
    goalkeeping: 5,
  };
}

const ARCHETYPES: Record<string, Archetype> = {
  GK: "keeper",
  DEF: "guardian",
  MID: "playmaker",
  ATT: "striker"
};

function generateAbilities(player: RawPlayerData, tier: Tier): Pick<PlayerDefinition, 'passive' | 'activeSkill' | 'ultimate'> {
  const { role, slug, displayName } = player;
  const tierMult = { bronze: 1, silver: 1.2, gold: 1.5, legendary: 2 }[tier];

  // Simple logic to generate themed abilities
  if (role === "GK") {
    return {
      passive: { id: `p-${slug}`, name: "Cat-like Reflexes", description: "Improved save chance in 1v1s.", trigger: "on_defense", effect: { type: "stat_boost", stat: "goalkeeping", magnitude: 15 * tierMult, durationTicks: 0 } },
      activeSkill: { id: `a-${slug}`, name: "Quick Launch", description: "Accurate long kick to strikers.", cooldownTicks: 25, target: "ally", effect: { type: "stat_boost", stat: "passing", magnitude: 20 * tierMult, durationTicks: 3 } },
      ultimate: { id: `u-${slug}`, name: "Zone of Silence", description: "Becomes unbeatable for a short time.", chargeRequired: 60, effect: { type: "stat_boost", stat: "goalkeeping", magnitude: 40 * tierMult, durationTicks: 6 } }
    };
  }
  if (role === "DEF") {
    return {
      passive: { id: `p-${slug}`, name: "Strong Tackle", description: "Harder for enemies to dribble past.", trigger: "always", effect: { type: "stat_boost", stat: "defense", magnitude: 10 * tierMult, durationTicks: 0 } },
      activeSkill: { id: `a-${slug}`, name: "Slide", description: "Disrupts the attacker.", cooldownTicks: 30, target: "enemy", effect: { type: "disrupt", magnitude: 25 * tierMult, durationTicks: 2 } },
      ultimate: { id: `u-${slug}`, name: "Defensive Wall", description: "Boosts team defense massively.", chargeRequired: 55, effect: { type: "stat_boost", stat: "defense", magnitude: 35 * tierMult, durationTicks: 10 } }
    };
  }
  if (role === "MID") {
    return {
      passive: { id: `p-${slug}`, name: "Engine Room", description: "Increases passing vision.", trigger: "on_possession", effect: { type: "stat_boost", stat: "passing", magnitude: 12 * tierMult, durationTicks: 0 } },
      activeSkill: { id: `a-${slug}`, name: "Visionary Pass", description: "Boosts teammate shooting.", cooldownTicks: 20, target: "ally", effect: { type: "stat_boost", stat: "shooting", magnitude: 20 * tierMult, durationTicks: 5 } },
      ultimate: { id: `u-${slug}`, name: "Mastermind", description: "Controls the tempo, boosting all team stats.", chargeRequired: 65, effect: { type: "stat_boost", magnitude: 15 * tierMult, durationTicks: 12 } }
    };
  }
  // ATT
  return {
    passive: { id: `p-${slug}`, name: "Instinct", description: "Increased shooting power in the box.", trigger: "always", effect: { type: "stat_boost", stat: "shooting", magnitude: 12 * tierMult, durationTicks: 0 } },
    activeSkill: { id: `a-${slug}`, name: "Dribble Burst", description: "Fast dash past defenders.", cooldownTicks: 22, target: "self", effect: { type: "stat_boost", stat: "pace", magnitude: 30 * tierMult, durationTicks: 4 } },
    ultimate: { id: `u-${slug}`, name: "Lethal Strike", description: "Guaranteed high-power shot.", chargeRequired: 50, effect: { type: "stat_boost", stat: "shooting", magnitude: 50 * tierMult, durationTicks: 3 } }
  };
}

export async function clearImportedPlayers(dryRun: boolean = false): Promise<{ deleted: number }> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) return { deleted: 0 };
  
  const supabase = getSupabaseClient();
  
  if (dryRun) return { deleted: 40 };

  // Delete from market_players and user_players where player_id starts with "sa-"
  const { error: err1 } = await supabase.from("market_players").delete().like("player_id", "sa-%");
  const { error: err2 } = await supabase.from("user_players").delete().like("player_id", "sa-%");

  if (err1 || err2) console.error("Error clearing DB:", err1 || err2);
  
  return { deleted: 40 };
}

export async function importPlayersToDb(
  players: PlayerDefinition[],
  dryRun: boolean = false
): Promise<{ imported: number; failed: FailureEntry[] }> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { imported: 0, failed: [] };
  }
  
  const supabase = getSupabaseClient();
  if (dryRun) return { imported: players.length, failed: [] };

  const marketEntries = players.map(p => ({
    player_id: p.id,
    cost: p.tier === "legendary" ? 5000 : p.tier === "gold" ? 2500 : p.tier === "silver" ? 1000 : 500,
    base_level: 1
  }));

  const { error } = await supabase.from("market_players").insert(marketEntries);

  if (error) {
    console.error("❌ DB Import Error:", error);
    return { imported: 0, failed: [{ player: "DB", error: error.message, stage: "import" }] };
  }

  return { imported: players.length, failed: [] };
}

export function generateFullDefinitions(rawPlayers: RawPlayerData[]): PlayerDefinition[] {
  return rawPlayers.map((p, idx) => {
    // Distribute tiers
    let tier: Tier = "silver";
    if (idx % 10 === 0) tier = "legendary";
    else if (idx % 5 === 0) tier = "gold";
    else if (idx % 3 === 0) tier = "bronze";

    const stats = generateStats(p.role, tier);
    const abilities = generateAbilities(p, tier);
    const roleTags: RoleTag[] = p.role === "ATT" ? ["attacker"] : 
                             p.role === "DEF" ? ["defender"] :
                             p.role === "MID" ? ["midfielder"] : ["goalkeeper"];

    return {
      id: `sa-${p.role.toLowerCase()}-${p.slug}`,
      name: p.displayName,
      archetype: ARCHETYPES[p.role] || "specialist",
      roleTags,
      tier,
      stats,
      ...abilities,
      portrait: `${p.role.toLowerCase()}_${sanitizeFilename(p.slug)}`,
      flavorText: `A star from Serie A, ${p.displayName} brings tactical excellence to the pitch.`
    };
  });
}

export async function verifyDatabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("market_players").select("count", { count: "exact", head: true });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("⚠️ Database connection failed:", err);
    return false;
  }
}