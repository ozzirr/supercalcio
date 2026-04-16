"use client";

import type { PlayerDefinition, StatBlock, RoleTag } from "@/types/player";
import { StatBar } from "@/components/ui/stat-bar";

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

function roleCoverage(players: PlayerDefinition[]) {
  const roles = new Set(players.flatMap((p) => p.roleTags));
  const required: RoleTag[] = ["goalkeeper", "attacker", "defender"];
  return required.map((r) => ({ role: r, covered: roles.has(r) }));
}

export function TeamSummary({ players }: TeamSummaryProps) {
  const avg = averageStats(players);
  const coverage = roleCoverage(players);
  const overallRating = Math.round(
    (avg.pace + avg.shooting + avg.passing + avg.defense + avg.physical) / 5
  );

  return (
    <div className="space-y-4">
      {/* Overall rating */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider text-muted">Team Rating</span>
        <span className="text-2xl font-black text-accent">{players.length > 0 ? overallRating : "—"}</span>
      </div>

      {/* Average stats */}
      {players.length > 0 && (
        <div className="space-y-1.5">
          <StatBar label="PAC" value={avg.pace} />
          <StatBar label="SHO" value={avg.shooting} />
          <StatBar label="PAS" value={avg.passing} />
          <StatBar label="DEF" value={avg.defense} />
          <StatBar label="PHY" value={avg.physical} />
        </div>
      )}

      {/* Role coverage */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Role Coverage</div>
        <div className="flex gap-2">
          {coverage.map((c) => (
            <span
              key={c.role}
              className={`text-xs px-2 py-1 rounded-full border capitalize ${
                c.covered
                  ? "border-success/40 text-success bg-success/10"
                  : "border-border text-muted"
              }`}
            >
              {c.role}
            </span>
          ))}
        </div>
      </div>

      {/* Archetype mix */}
      {players.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Archetypes</div>
          <div className="flex flex-wrap gap-1.5">
            {players.map((p) => (
              <span
                key={p.id}
                className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent capitalize"
              >
                {p.archetype}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
