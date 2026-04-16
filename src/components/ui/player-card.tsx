"use client";

import type { PlayerDefinition } from "@/types/player";
import { StatBar } from "./stat-bar";
import { tierLabel } from "@/utils/formatting";
import Link from "next/link";

type PlayerCardProps = {
  player: PlayerDefinition;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

const TIER_STYLES: Record<string, { label: string, container: string }> = {
  bronze: { label: "text-orange-400 border-orange-400/40", container: "border-orange-400/30 bg-orange-400/5" },
  silver: { label: "text-gray-300 border-gray-300/40", container: "border-gray-300/30 bg-gray-300/5" },
  gold: { label: "text-yellow-400 border-yellow-400/40", container: "border-yellow-400/40 bg-yellow-400/5" },
  legendary: { label: "text-purple-400 border-purple-400/40", container: "border-purple-400/40 bg-purple-400/5" },
};

export function PlayerCard({ player, selected, onClick, compact }: PlayerCardProps) {
  const tierStyle = TIER_STYLES[player.tier] ?? { label: "text-muted border-border", container: "border-white/5" };

  const CardWrapper = ({ children, className }: { children: React.ReactNode; className: string }) => {
    if (onClick) {
      return <button onClick={onClick} className={className}>{children}</button>;
    }
    return <Link href={`/players/${player.id}`} className={className}>{children}</Link>;
  };

  if (compact) {
    return (
      <CardWrapper
        className={`card card-hover p-3 w-full text-left transition-all ${
          selected ? "border-accent shadow-[0_0_20px_rgba(251,191,36,0.15)]" : tierStyle.container
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0 relative overflow-hidden border border-accent/30">
            {player.portrait ? (
              <img src={`/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + player.name + '&background=Random&color=fff&size=200'; }} />
            ) : (
              player.name[0]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black italic uppercase text-xs tracking-tight">{player.name}</div>
            <div className="text-[10px] text-muted uppercase font-bold tracking-widest">{player.roleTags[0]}</div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      className={`card card-hover p-0 w-full text-left transition-all overflow-hidden border-2 ${
        selected ? "border-accent shadow-[0_0_30px_rgba(251,191,36,0.15)]" : tierStyle.container
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={`/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + player.name + '&background=11141c&color=fbbf24&size=400'; }} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-black italic uppercase tracking-tighter text-accent leading-none">{player.name}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-1">{player.roleTags[0]}</div>
            </div>
            <div className={`text-[10px] font-black px-2 py-0.5 rounded border ${tierStyle.label} uppercase bg-background/50 backdrop-blur-sm`}>
              {tierLabel(player.tier)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3 bg-surface border-t border-white/5">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-[10px] text-muted font-bold uppercase">PAC</div>
            <div className="font-black text-white italic">{player.stats.pace}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted font-bold uppercase">SHO</div>
            <div className="font-black text-white italic">{player.stats.shooting}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted font-bold uppercase">PAS</div>
            <div className="font-black text-white italic">{player.stats.passing}</div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
