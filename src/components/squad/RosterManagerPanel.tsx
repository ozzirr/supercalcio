"use client";

import { motion } from "framer-motion";
import type { PlayerDefinition } from "@/types/player";

interface RosterManagerPanelProps {
  players: PlayerDefinition[];
  selectedPlayerId?: string;
  assignedIds: Set<string>;
  onSelectPlayer: (player: PlayerDefinition) => void;
}

const ROLES = ["TUTTI", "GK", "DEF", "MID", "ATK", "FLEX"];

export function RosterManagerPanel({ players, selectedPlayerId, assignedIds, onSelectPlayer }: RosterManagerPanelProps) {
  const roleColors: Record<string, string> = {
    GK: "text-blue-400",
    DEF: "text-emerald-400",
    MID: "text-amber-400",
    ATK: "text-rose-400",
    FLEX: "text-purple-400",
  };

  return (
    <div className="w-full lg:w-80 flex flex-col h-full bg-[#05070a]/50 backdrop-blur-3xl border-r border-white/5 relative z-10">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">ROSTER MANAGER</h2>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
               <span className="text-[10px] font-black text-gold uppercase tracking-widest">{players.length} GIOCATORI</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  role === "TUTTI" 
                  ? "bg-gold text-black shadow-[0_5px_15px_rgba(255,193,32,0.3)]" 
                  : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-between">
                RARITÀ <span className="text-white/20">▼</span>
             </div>
             <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                <span className="text-xl">📊</span>
             </button>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-2 pb-24">
        {players.map((player) => {
          const isSelected = selectedPlayerId === player.id;
          const isAssigned = assignedIds.has(player.id);
          const roleColor = roleColors[player.position] || "text-white";
          
          return (
            <motion.div
              key={player.id}
              whileHover={{ x: 5 }}
              onClick={() => onSelectPlayer(player)}
              className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected 
                ? "bg-gold/15 border-gold/40 shadow-[0_10px_20px_rgba(255,193,32,0.1)]" 
                : isAssigned
                  ? "bg-white/[0.02] border-white/10 opacity-60"
                  : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-full border-2 p-0.5 overflow-hidden transition-all ${isSelected ? "border-gold" : "border-white/10 group-hover:border-white/30"}`}>
                   <img 
                     src={`/assets/portraits/${player.portrait}.png`} 
                     className={`w-full h-full object-cover rounded-full ${isAssigned && !isSelected ? 'grayscale' : ''}`} 
                     alt={player.name} 
                   />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? "text-white" : "text-white/70"}`}>
                    {player.name}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${roleColor}`}>
                    {player.position}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                 {isAssigned && (
                    <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center border border-gold/40">
                       <span className="text-[10px] text-gold">✓</span>
                    </div>
                 )}
                 <span className={`text-lg font-black italic tracking-tighter ${isSelected ? "text-gold" : "text-white/40"}`}>
                   {player.overallRating || 78}
                 </span>
              </div>
              
              {isSelected && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gold shadow-[0_0_10px_#FFC324]" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
