"use client";

import type { PlayerDefinition } from "@/types/player";
import { StatBar } from "./stat-bar";
import { tierLabel } from "@/utils/formatting";

type PlayerCardProps = {
  player: PlayerDefinition;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

const TIER_COLORS: Record<string, string> = {
  bronze: "text-orange-400 border-orange-400/30",
  silver: "text-gray-300 border-gray-300/30",
  gold: "text-yellow-400 border-yellow-400/30",
  legendary: "text-purple-400 border-purple-400/30",
};

export function PlayerCard({ player, selected, onClick, compact }: PlayerCardProps) {
  const tierClass = TIER_COLORS[player.tier] ?? "text-muted border-border";

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`card card-hover p-3 w-full text-left transition-all ${
          selected ? "border-accent shadow-[0_0_20px_rgba(99,102,241,0.15)]" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
            {player.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{player.name}</div>
            <div className="text-xs text-muted capitalize">{player.roleTags[0]}</div>
          </div>
          <div className={`text-xs font-medium px-2 py-0.5 rounded border ${tierClass}`}>
            {tierLabel(player.tier)}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`card card-hover p-5 w-full text-left transition-all ${
        selected ? "border-accent shadow-[0_0_20px_rgba(99,102,241,0.15)]" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold shrink-0">
          {player.name[0]}
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{player.name}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${tierClass}`}>
                {tierLabel(player.tier)}
              </span>
            </div>
            <div className="text-sm text-muted capitalize">
              {player.archetype} — {player.roleTags.join(", ")}
            </div>
          </div>

          <div className="space-y-1.5">
            <StatBar label="PAC" value={player.stats.pace} />
            <StatBar label="SHO" value={player.stats.shooting} />
            <StatBar label="PAS" value={player.stats.passing} />
            <StatBar label="DEF" value={player.stats.defense} />
            <StatBar label="PHY" value={player.stats.physical} />
            {player.roleTags.includes("goalkeeper") && (
              <StatBar label="GK" value={player.stats.goalkeeping} />
            )}
          </div>

          <div className="pt-2 space-y-1 text-xs">
            <div>
              <span className="text-muted">Passive: </span>
              <span className="text-emerald-400">{player.passive.name}</span>
              <span className="text-muted"> — {player.passive.description}</span>
            </div>
            <div>
              <span className="text-muted">Skill: </span>
              <span className="text-blue-400">{player.activeSkill.name}</span>
              <span className="text-muted"> — {player.activeSkill.description}</span>
            </div>
            <div>
              <span className="text-muted">Ultimate: </span>
              <span className="text-purple-400">{player.ultimate.name}</span>
              <span className="text-muted"> — {player.ultimate.description}</span>
            </div>
          </div>

          <p className="text-xs text-muted italic">{player.flavorText}</p>
        </div>
      </div>
    </button>
  );
}
