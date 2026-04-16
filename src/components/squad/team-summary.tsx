"use client";

import type { PlayerDefinition, StatBlock, RoleTag } from "@/types/player";

type TeamSummaryProps = {
  players: PlayerDefinition[];
};

function averageStats(players: PlayerDefinition[]): StatBlock {
  if (players.length === 0) {
    return { pace: 0, shooting: 0, passing: 0, defense: 0, physical: 0, goalkeeping: 0 };
  }
  const sum = players.reduce(
    (acc, p) => ({
      pace: acc.pace + p.stats.pace,
      shooting: acc.shooting + p.stats.shooting,
      passing: acc.passing + p.stats.passing,
      defense: acc.defense + p.stats.defense,
      physical: acc.physical + p.stats.physical,
      goalkeeping: acc.goalkeeping + p.stats.goalkeeping,
    }),
    { pace: 0, shooting: 0, passing: 0, defense: 0, physical: 0, goalkeeping: 0 }
  );
  const n = players.length;
  return {
    pace: Math.round(sum.pace / n),
    shooting: Math.round(sum.shooting / n),
    passing: Math.round(sum.passing / n),
    defense: Math.round(sum.defense / n),
    physical: Math.round(sum.physical / n),
    goalkeeping: Math.round(sum.goalkeeping / n),
  };
}

function getStatColor(value: number) {
  if (value >= 75) return "text-emerald-400";
  if (value >= 60) return "text-amber-400";
  return "text-rose-400";
}

export function TeamSummary({ players }: TeamSummaryProps) {
  const avg = averageStats(players);
  const overallRating = players.length > 0
    ? Math.round((avg.pace + avg.shooting + avg.passing + avg.defense + avg.physical) / 5)
    : 0;

  const roles = new Set(players.flatMap((p) => p.roleTags));
  const required: RoleTag[] = ["goalkeeper", "attacker", "defender"];
  const coverage = required.map((r) => ({ role: r, covered: roles.has(r) }));

  const stats = [
    { label: "PAC", value: avg.pace },
    { label: "SHO", value: avg.shooting },
    { label: "PAS", value: avg.passing },
    { label: "DEF", value: avg.defense },
    { label: "PHY", value: avg.physical },
  ];

  if (players.length === 0) {
    return (
      <div className="py-3 text-center text-muted text-xs italic">
        Add players to see team stats
      </div>
    );
  }

  return (
    <div className="card p-4 mt-4">
      <div className="flex items-center gap-4">
        {/* Overall Rating Badge */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-accent/10 border border-accent/25 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <span className="text-2xl font-black text-accent leading-none">{overallRating}</span>
          <span className="text-[9px] uppercase tracking-widest text-muted mt-0.5">OVR</span>
        </div>

        {/* Stat Pills */}
        <div className="flex-1 grid grid-cols-5 gap-2">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className={`text-xl font-black leading-none ${getStatColor(value)}`}>{value}</span>
              <span className="text-[9px] uppercase tracking-widest text-muted">{label}</span>
            </div>
          ))}
        </div>

        {/* Role badges */}
        <div className="flex-shrink-0 flex flex-col gap-1.5">
          {coverage.map((c) => (
            <span
              key={c.role}
              className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
                c.covered
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  : "border-border text-muted/40 line-through"
              }`}
            >
              {c.role.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
