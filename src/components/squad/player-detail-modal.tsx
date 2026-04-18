"use client";

import type { PlayerDefinition } from "@/types/player";
import { StatBar } from "@/components/ui/stat-bar";
import { tierLabel } from "@/utils/formatting";

type PlayerDetailModalProps = {
  player: PlayerDefinition;
  onClose: () => void;
  onAssign?: () => void;
  assignLabel?: string;
  isAssigned?: boolean;
};

const TIER_BORDER: Record<string, string> = {
  bronze: "border-orange-400/40",
  silver: "border-gray-300/40",
  gold: "border-yellow-400/40",
  legendary: "border-purple-400/40",
};

const TIER_GLOW: Record<string, string> = {
  bronze: "shadow-[0_0_30px_rgba(251,146,60,0.15)]",
  silver: "shadow-[0_0_30px_rgba(209,213,219,0.15)]",
  gold: "shadow-[0_0_30px_rgba(250,204,21,0.2)]",
  legendary: "shadow-[0_0_30px_rgba(192,132,252,0.25)]",
};

const TIER_TEXT: Record<string, string> = {
  bronze: "text-orange-400",
  silver: "text-gray-300",
  gold: "text-yellow-400",
  legendary: "text-purple-400",
};

export function PlayerDetailModal({
  player,
  onClose,
  onAssign,
  assignLabel,
  isAssigned,
}: PlayerDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-xl bg-surface border ${TIER_BORDER[player.tier] ?? "border-border"} ${TIER_GLOW[player.tier] ?? ""} p-6 space-y-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold">
              {player.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">{player.name}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${TIER_TEXT[player.tier]} ${TIER_BORDER[player.tier]}`}>
                  {tierLabel(player.tier)}
                </span>
              </div>
              <div className="text-sm text-muted capitalize">{player.archetype} — {player.roleTags.join(", ")}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors text-xl leading-none p-1">&times;</button>
        </div>

        {/* Flavor */}
        <p className="text-sm text-muted italic border-l-2 border-accent/30 pl-3">{player.flavorText}</p>

        {/* Stats */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Stats</h3>
          <div className="space-y-1.5">
            <StatBar label="Pace" value={player.stats.pace} />
            <StatBar label="Shooting" value={player.stats.shooting} />
            <StatBar label="Passing" value={player.stats.passing} />
            <StatBar label="Defense" value={player.stats.defense} />
            <StatBar label="Physical" value={player.stats.physical} />
            {player.roleTags.includes("goalkeeper") && (
              <StatBar label="GK" value={player.stats.goalkeeping} />
            )}
          </div>
        </div>

        {/* Abilities */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Abilities</h3>

          <div className="card p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">{player.passive.name}</span>
              <span className="text-xs text-muted ml-auto capitalize">{player.passive.trigger.replace(/_/g, " ")}</span>
            </div>
            <p className="text-xs text-muted pl-4">{player.passive.description}</p>
          </div>

          <div className="card p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-sm font-semibold text-blue-400">{player.activeSkill.name}</span>
              <span className="text-xs text-muted ml-auto">CD: {player.activeSkill.cooldownTicks}t</span>
            </div>
            <p className="text-xs text-muted pl-4">{player.activeSkill.description}</p>
            <div className="text-xs text-muted pl-4">
              Target: <span className="text-foreground capitalize">{player.activeSkill.target}</span>
              {" | "}Effect: <span className="text-foreground">+{player.activeSkill.effect.magnitude}%</span>
              {player.activeSkill.effect.durationTicks > 0 && <> for {player.activeSkill.effect.durationTicks}t</>}
            </div>
          </div>

          <div className="card p-3 space-y-1 border-purple-400/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-sm font-semibold text-purple-400">{player.ultimate.name}</span>
              <span className="text-xs text-muted ml-auto">Charge: {player.ultimate.chargeRequired}t</span>
            </div>
            <p className="text-xs text-muted pl-4">{player.ultimate.description}</p>
            <div className="text-xs text-muted pl-4">
              Effect: <span className="text-foreground">+{player.ultimate.effect.magnitude}%</span>
              {player.ultimate.effect.durationTicks > 0 && <> for {player.ultimate.effect.durationTicks}t</>}
            </div>
          </div>
        </div>

        {/* Assign button */}
        {onAssign && (
          <button
            onClick={onAssign}
            disabled={isAssigned}
            className={`btn-primary w-full ${isAssigned ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {isAssigned ? "Already in Squad" : assignLabel ?? "Add to Squad"}
          </button>
        )}
      </div>
    </div>
  );
}
