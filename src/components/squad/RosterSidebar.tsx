"use client";

import { motion } from "framer-motion";
import type { PlayerDefinition } from "@/types/player";

interface RosterPlayerItemProps {
  player: PlayerDefinition;
  isSelected: boolean;
  isInLineup: boolean;
  onClick: () => void;
}

export function RosterPlayerItem({ player, isSelected, isInLineup, onClick }: RosterPlayerItemProps) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      onClick={onClick}
      className={`relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border
        ${isSelected 
          ? "bg-accent/10 border-accent/40 shadow-inner" 
          : "bg-white/5 border-transparent hover:border-white/10"
        }
        ${isInLineup ? "opacity-100" : "opacity-60 hover:opacity-100"}
      `}
    >
      {/* Mini Portrait */}
      <div className="relative shrink-0">
        <div className={`w-10 h-10 rounded-md overflow-hidden border transition-all
          ${isSelected ? "border-accent scale-105" : "border-white/10"}
        `}>
          <img 
            src={`/assets/portraits/${player.portrait}.png`} 
            alt={player.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        {isInLineup && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-black flex items-center justify-center shadow-lg border border-surface">
            <span className="text-[8px] font-black italic">✓</span>
          </div>
        )}
      </div>

      {/* Info Core */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
           <div className={`text-[11px] font-black uppercase italic truncate ${isSelected ? 'text-accent' : 'text-white'}`}>
              {player.name.split(' ').pop()}
           </div>
           <div className="text-[10px] font-black text-white tabular-nums px-1.5 py-0.5 rounded bg-white/5">
              {Math.round(player.stats.pace + player.stats.shooting + player.stats.passing + player.stats.defense + player.stats.physical)}
           </div>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
           <div className="text-[8px] font-black uppercase tracking-widest text-muted truncate">
              {player.roleTags[0]}
           </div>
           <div className="w-1 h-1 rounded-full bg-white/10" />
           <div className={`text-[8px] font-black uppercase tracking-widest ${player.tier === 'legendary' ? 'text-purple-400' : player.tier === 'gold' ? 'text-accent' : 'text-white/40'}`}>
              {player.tier}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

interface RosterSidebarProps {
  players: PlayerDefinition[];
  selectedPlayerId: string | null;
  assignedIds: Set<string>;
  onPlayerClick: (player: PlayerDefinition) => void;
  onReset: () => void;
}

export function RosterSidebar({ players, selectedPlayerId, assignedIds, onPlayerClick, onReset }: RosterSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a0c10]">
      <div className="p-4 border-b border-white/5 bg-surface/50">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Tactical Pool</h2>
           <div className="text-[9px] font-black uppercase text-accent">{players.length} Unit</div>
        </div>
        
        <div className="relative">
           <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted/40">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
           </div>
           <input 
             type="text" 
             placeholder="SEARCH PLAYER..." 
             className="w-full bg-black/40 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-accent/30 transition-all"
           />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {players.map((player) => (
          <RosterPlayerItem 
            key={player.id}
            player={player}
            isSelected={selectedPlayerId === player.id}
            isInLineup={assignedIds.has(player.id)}
            onClick={() => onPlayerClick(player)}
          />
        ))}
      </div>

      <div className="p-3 border-t border-white/5 bg-black/20">
         <button 
           onClick={onReset}
           className="w-full py-2 rounded border border-white/10 text-white/40 hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
         >
           Reset Roster
         </button>
      </div>
    </div>
  );
}
