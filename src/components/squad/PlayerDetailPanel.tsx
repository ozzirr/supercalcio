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
    { label: "PAC", value: 52 },
    { label: "SHO", value: 10 },
    { label: "PAS", value: 57 },
    { label: "DEF", value: 80 },
    { label: "PHY", value: 51 },
    { label: "GOA", value: getOverallRating(player) },
  ];

  return (
    <div className="w-full lg:w-96 flex flex-col h-full bg-[#05070a]/50 backdrop-blur-3xl border-l border-white/5 overflow-y-auto custom-scrollbar">
      <div className="p-8 space-y-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-4">DETTAGLIO GIOCATORE</h2>

        {/* Big Card Section */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full scale-125 opacity-50 group-hover:opacity-80 transition-opacity" />
           <div className="relative aspect-[3/4.2] rounded-[2rem] border-2 border-gold/40 bg-black overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
              <div className="absolute top-4 left-4 z-20 space-y-0">
                 <div className="text-4xl lg:text-5xl font-black italic text-white tracking-tighter drop-shadow-lg leading-none">{getOverallRating(player)}</div>
                 <div className="text-[10px] lg:text-sm font-black text-white/60 uppercase tracking-widest">{getPlayerPosition(player)}</div>
              </div>

              <div className="absolute top-6 right-6 z-20">
                 <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-[0_10px_20px_rgba(251,191,36,0.3)]">
                    <span className="text-xl">🛡️</span>
                 </div>
              </div>

              <div className="absolute inset-0 z-10 pt-12">
                 <img src={`/assets/portraits/${player.portrait}.png`} className="w-full h-full object-cover" alt={player.name} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                 <h3 className="text-2xl lg:text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{player.name}</h3>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] bg-gold/10 px-3 py-1 rounded-full border border-gold/20">GOLD</span>
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">PORTIERE</span>
                    </div>
                    <span className="text-xl opacity-80">🇷🇸</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-6 gap-2 border-t border-white/5 pt-8">
           {attributes.map((attr) => (
             <div key={attr.label} className="flex flex-col items-center gap-1">
                <span className="text-xl font-black italic text-white tracking-tighter">{attr.value}</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{attr.label}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
