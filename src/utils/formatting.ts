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
