import type { MatchEvent } from "../types/match";
import type { PlayerDefinition } from "../types/player";

/** Format a tick count as mm:ss match time (90 ticks = 90:00). */
export function tickToMatchTime(tick: number, totalTicks: number): string {
  const matchMinutes = Math.floor((tick / totalTicks) * 90);
  const seconds = Math.floor(((tick / totalTicks) * 90 - matchMinutes) * 60);
  return `${matchMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/** Format a stat value as a display string with color class. */
export function statColor(value: number): string {
  if (value >= 85) return "text-emerald-400";
  if (value >= 70) return "text-green-400";
  if (value >= 50) return "text-yellow-400";
  if (value >= 35) return "text-orange-400";
  return "text-red-400";
}

/** Format tier as display label. */
export function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

/** Format playstyle ID to display name. */
export function playstyleLabel(id: string): string {
  return id
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Convert a MatchEvent to a human readable feed string */
export function formatMatchEvent(
  event: MatchEvent,
  allPlayers: PlayerDefinition[]
): string {
  const getPlayerName = (id: string | null) =>
    id ? allPlayers.find((p) => p.id === id)?.name || "Unknown" : "Unknown";

  const actor = getPlayerName(event.actorId);
  const target = getPlayerName(event.targetId);

  switch (event.type) {
    case "kickoff":
      return `Kickoff for ${event.team} team!`;
    case "halftime":
      return "Halftime! Teams are going to the locker room.";
    case "full_time":
      return `Full Time! Match finished ${event.metadata.homeScore} - ${event.metadata.awayScore}.`;
    case "pass":
      return event.targetId 
        ? `${actor} passes to ${target}.` 
        : `${actor} plays a through ball forward!`;
    case "dribble":
      return `${actor} goes on a run.`;
    case "tackle":
      return event.metadata.note 
        ? `${actor} makes a crucial block against ${target}!`
        : `${actor} tackles the ball away from ${target}.`;
    case "possession_change":
      return `${actor} secures possession.`;
    case "shot":
      if (event.metadata.quality === "excellent") {
        return `Incredible strike from ${actor}!`;
      }
      return `${actor} shoots!`;
    case "save":
      return `Great save by ${actor}!`;
    case "goal":
      return `GOAL for ${event.team}! ${actor} scores! ⚽`;
    case "miss":
      return `${actor} shoots wide.`;
    case "stance_change":
      return `${event.team} switches to a ${event.metadata.stance} stance.`;
    default:
      return `${event.type.toUpperCase()}`;
  }
}
