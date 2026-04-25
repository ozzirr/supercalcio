"use client";

import type { PlayerDefinition } from "@/types/player";
import { tierLabel } from "@/utils/formatting";

type MarketPlayerCardProps = {
  player: PlayerDefinition;
  marketData: {
    cost: number;
    base_level: number;
  };
  owned: boolean;
  canAfford: boolean;
  isProcessing: boolean;
  onBuy: () => void;
  onSell: () => void;
};

export function MarketPlayerCard({
  player,
  marketData,
  owned,
  canAfford,
  isProcessing,
  onBuy,
  onSell,
}: MarketPlayerCardProps) {
  const role = player.roleTags[0];
  const overall = Math.round(
    (
      player.stats.pace +
      player.stats.shooting +
      player.stats.passing +
      player.stats.defense +
      player.stats.physical +
      player.stats.goalkeeping
    ) / 6
  );
  const influence = Math.min(99, overall + (player.tier === "legendary" ? 15 : player.tier === "gold" ? 10 : 5));
  
  return (
    <div className={`group relative flex flex-col bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(251,191,36,0.05)] ${owned ? "opacity-90" : ""}`}>
      {/* Role Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-xl">
        <div className={`w-2 h-2 rounded-full ${role === 'goalkeeper' ? 'bg-blue-400' : role === 'defender' ? 'bg-emerald-400' : role === 'midfielder' ? 'bg-amber-400' : 'bg-rose-500'} shadow-lg animate-pulse`}></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{role}</span>
      </div>

      {/* Tier Badge */}
      <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 backdrop-blur-md">
         <span className="text-[9px] font-black uppercase tracking-tighter text-accent italic">{tierLabel(player.tier)}</span>
      </div>

      {/* Portrait Area */}
      <div className="relative aspect-[4/4] overflow-hidden">
        <img
          src={`/assets/portraits/${player.portrait}.png`}
          alt={player.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.name}&background=11141c&color=fbbf24&size=400`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Name & Stats Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 pt-10">
          <div className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-3">
            {player.name.split(" ")[0]} <span className="text-accent">{player.name.split(" ")[1] || ""}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-1.5 border border-white/5 flex flex-col items-center">
              <span className="text-[8px] text-muted font-black uppercase">OVR</span>
              <span className="text-sm font-black text-white italic">{overall}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-1.5 border border-white/5 flex flex-col items-center">
              <span className="text-[8px] text-muted font-black uppercase">INF</span>
              <span className="text-sm font-black text-white italic">{influence}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-1.5 border border-white/5 flex flex-col items-center">
              <span className="text-[8px] text-muted font-black uppercase">TIER</span>
              <span className="text-sm font-black text-accent italic">{player.tier.slice(0, 3).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex-1 flex flex-col p-5 bg-black/20 border-t border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-black uppercase tracking-widest leading-none mb-1">Prezzo</span>
            <div className="flex items-center gap-1.5">
               <span className={`text-2xl font-black italic tracking-tighter ${owned ? 'text-white/40' : canAfford ? 'text-accent' : 'text-danger/80'}`}>
                 {marketData.cost}
               </span>
               <span className="text-[10px] font-black text-muted opacity-60">CR</span>
            </div>
          </div>
          
          {owned && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/30">
              <span className="text-xs text-accent">✓</span>
              <span className="text-[10px] font-black uppercase text-accent tracking-widest">In Rosa</span>
            </div>
          )}
        </div>

        {owned ? (
          <button
            onClick={onSell}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 text-white/80 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-danger/20 hover:text-danger hover:border-danger/30 transition-all disabled:opacity-30 group/btn"
          >
            {isProcessing ? "Esecuzione..." : (
              <>
                <span className="text-xs opacity-60 transition-transform group-hover/btn:scale-125">↗</span>
                Vendi Calciatore
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onBuy}
            disabled={!canAfford || isProcessing}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
              canAfford 
                ? "bg-accent text-black hover:scale-[1.02] hover:shadow-accent/20 active:scale-95" 
                : "bg-white/5 text-muted border border-white/10 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Elaborazione..." : (
              <>
                {!canAfford && <span className="text-xs">!</span>}
                {canAfford && <span className="text-xs">🛒</span>}
                {canAfford ? "Acquista Ora" : "Crediti Insufficienti"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
