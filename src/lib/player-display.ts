import type { PlayerDefinition, RoleTag } from "@/types/player";

const ROLE_TO_POSITION: Record<RoleTag, string> = {
  goalkeeper: "GK",
  defender: "DEF",
  midfielder: "MID",
  attacker: "ATK",
  hybrid: "FLEX",
};

export function getPlayerPosition(player: PlayerDefinition): string {
  const tag = player.roleTags[0];
  return tag ? ROLE_TO_POSITION[tag] : "FLEX";
}

export function getOverallRating(player: PlayerDefinition): number {
  const { pace, shooting, passing, defense, physical, goalkeeping } = player.stats;
  const isKeeper = player.roleTags.includes("goalkeeper");
  const sum = isKeeper
    ? goalkeeping + defense + physical + passing + pace
    : pace + shooting + passing + defense + physical;
  return Math.round(sum / 5);
}
