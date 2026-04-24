"use client";

import { motion } from "framer-motion";
import type { PlayerDefinition } from "@/types/player";
import type { LineupSlot } from "@/types/squad";

interface TacticalPitchProps {
  lineup: LineupSlot[];
  availablePlayers: PlayerDefinition[];
  onSlotClick: (position: number) => void;
  onSlotRemove: (position: number, e: React.MouseEvent) => void;
  onAutoFill: () => void;
  onClear: () => void;
  onStartMatch: () => void;
  isReady: boolean;
}

const POSITION_CONFIG = [
  { label: "GK", top: "75%", left: "50%", color: "gk" },
  { label: "DEF", top: "50%", left: "25%", color: "def" },
  { label: "MID", top: "45%", left: "75%", color: "mid" },
  { label: "ATK", top: "20%", left: "35%", color: "atk" },
  { label: "FLEX", top: "20%", left: "65%", color: "flex" },
];

export function TacticalPitch({ lineup, availablePlayers, onSlotClick, onSlotRemove, onAutoFill, onClear, onStartMatch, isReady }: TacticalPitchProps) {
  return (
    <div className="space-y-8 flex-1 flex flex-col">
      <div className="relative aspect-[16/9] lg:aspect-[1.8/1] tactical-pitch rounded-[3rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden flex-1">
        {/* Field Lines */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/10" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-t border-l border-r border-white/10" />
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-b border-l border-r border-white/10" />
        </div>

        {/* Pitch Area */}
        <div className="absolute inset-0 p-8 lg:p-12">
          {POSITION_CONFIG.map((pos, i) => {
            const slot = lineup.find((s) => s.position === i);
            const player = slot ? availablePlayers.find((p) => p.id === slot.playerId) : null;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => onSlotClick(i)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              >
                {player ? (
                  <div className={`relative w-24 h-32 lg:w-32 lg:h-44 rounded-2xl border-2 bg-black/80 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-4 shadow-2xl role-border-${pos.color} glow-role-${pos.color}`}>
                     {/* Rating Overlay */}
                     <div className="absolute top-2 left-2 z-20 text-white font-black italic text-sm lg:text-xl drop-shadow-lg">
                        {player.overallRating || 78}
                     </div>
                     <div className={`absolute top-2 right-2 z-20 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-${pos.color}-400`}>
                        {pos.label}
                     </div>

                     {/* Portrait */}
                     <div className="absolute inset-0 z-10 pt-4">
                        <img 
                          src={`/assets/portraits/${player.portrait}.png`} 
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" 
                          alt={player.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                     </div>

                     {/* Name Banner */}
                     <div className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-black/60 backdrop-blur-md border-t border-white/5">
                        <div className="text-[8px] lg:text-[10px] font-black text-white italic uppercase truncate text-center tracking-tighter">
                          {player.name}
                        </div>
                        <div className={`text-[7px] font-black uppercase text-center tracking-widest text-${pos.color}-400/60`}>
                          {pos.label}
                        </div>
                     </div>

                     {/* Remove Button */}
                     <button 
                       onClick={(e) => onSlotRemove(i, e)}
                       className="absolute top-0 left-0 w-full h-full bg-danger/60 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center"
                     >
                        <span className="text-white font-black text-2xl">✕</span>
                     </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-black/40 border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 group-hover:border-gold/40 group-hover:text-gold transition-all duration-500 shadow-inner scale-100 active:scale-95">
                       <span className="text-3xl font-light">+</span>
                    </div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{pos.label}</span>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Central Drag-and-Drop Slot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 group pointer-events-none">
             <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-full border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 transition-all">
                <span className="text-white/5 text-4xl font-light">+</span>
                <div className="text-[9px] font-black text-white/5 uppercase tracking-[0.3em] text-center px-6 leading-relaxed">
                   TRASCINA UN <br /> GIOCATORE QUI
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onAutoFill}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
          >
             <span className="text-cyan-400">✨</span> AUTO-COMPLETA
          </button>
          <button 
            onClick={onClear}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-danger hover:bg-danger/10 hover:border-danger/30 transition-all"
          >
             <span className="text-white/20">🗑️</span> SVUOTA
          </button>
        </div>

        <button 
          onClick={onStartMatch}
          disabled={!isReady}
          className={`flex items-center gap-4 px-12 py-4 rounded-[2rem] bg-gold text-black font-black uppercase text-sm tracking-[0.2em] shadow-[0_15px_30px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95 group ${!isReady ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:shadow-[0_20px_40px_rgba(251,191,36,0.5)]'}`}
        >
          INIZIA PARTITA 
          <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}
