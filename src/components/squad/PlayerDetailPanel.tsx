"use client";

import { motion } from "framer-motion";
import type { PlayerDefinition } from "@/types/player";
import { getOverallRating, getPlayerPosition } from "@/lib/player-display";

interface PlayerDetailPanelProps {
  player: PlayerDefinition | null;
  onReplace: () => void;
  onRemove: () => void;
}

export function PlayerDetailPanel({ player, onReplace, onRemove }: PlayerDetailPanelProps) {
  if (!player) {
    return (
      <div className="hidden lg:flex w-full lg:w-96 flex-col bg-[#05070a]/50 backdrop-blur-3xl border-l border-white/5 p-8 items-center justify-center text-center space-y-4">
         <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center text-white/10 text-4xl font-light">
            👤
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Seleziona un giocatore <br /> per i dettagli</p>
      </div>
    );
  }

  const attributes = [
    { label: "PAC", value: player.stats.pace },
    { label: "SHO", value: player.stats.shooting },
    { label: "PAS", value: player.stats.passing },
    { label: "DEF", value: player.stats.defense },
    { label: "PHY", value: player.stats.physical },
    { label: "GOA", value: player.stats.goalkeeping },
  ];

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'legendary': return 'text-rose-400';
      case 'gold': return 'text-gold';
      case 'silver': return 'text-slate-400';
      default: return 'text-orange-600';
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col h-full bg-[#05070a]/50 backdrop-blur-3xl border-l border-white/5 overflow-y-auto custom-scrollbar">
      <div className="p-8 space-y-10">
        <div className="flex items-center justify-between">
           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">ELITE PROFILE</h2>
           <span className={`text-[9px] font-black uppercase tracking-widest ${getTierColor(player.tier)}`}>{player.tier}</span>
        </div>

        {/* Big Card Section */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full scale-125 opacity-30 group-hover:opacity-50 transition-opacity" />
           <div className="relative aspect-[3/4.2] rounded-[2.5rem] border-2 border-white/10 bg-black overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
              <div className="absolute top-6 left-6 z-20 space-y-0">
                 <div className="text-5xl lg:text-6xl font-black italic text-white tracking-tighter drop-shadow-2xl leading-none">{getOverallRating(player)}</div>
                 <div className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">{getPlayerPosition(player)}</div>
              </div>

              <div className="absolute top-6 right-6 z-20">
                 <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-2xl">{player.archetype === 'striker' ? '🔥' : player.archetype === 'keeper' ? '🧤' : '🛡️'}</span>
                 </div>
              </div>

              <div className="absolute inset-0 z-10 pt-12">
                 <img src={`/assets/portraits/${player.portrait}.png`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={player.name} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20 space-y-3">
                 <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none drop-shadow-2xl">{player.name}</h3>
                 <div className="flex items-center gap-2">
                    {player.roleTags.map(tag => (
                       <span key={tag} className="text-[8px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 italic">
                          {tag}
                       </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-10">
           {attributes.filter(a => a.value > 10 || a.label !== 'GOA').map((attr) => (
             <div key={attr.label} className="glass-premium p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1 group/stat hover:border-gold/20 transition-all">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest group-hover/stat:text-gold/40 transition-colors">{attr.label}</span>
                <span className="text-2xl font-black italic text-white tracking-tighter">{attr.value}</span>
             </div>
           ))}
        </div>

        {/* Description/Flavor */}
        <div className="space-y-4">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">LOG SCOUTING</h4>
           <p className="text-[10px] text-white/40 font-medium leading-relaxed italic uppercase tracking-wider border-l border-gold/20 pl-4">
              "{player.flavorText}"
           </p>
        </div>
      </div>
    </div>
  );
}
