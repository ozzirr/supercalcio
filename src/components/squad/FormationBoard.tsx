"use client";

import { motion } from "framer-motion";
import type { PlayerDefinition } from "@/types/player";

interface FormationBoardProps {
  lineup: { position: number; playerId: string }[];
  availablePlayers: PlayerDefinition[];
  activeSlot: number | null;
  dragSource: number | null;
  onSlotClick: (pos: number) => void;
  onSlotRemove: (pos: number, e: React.MouseEvent) => void;
  onDragStart: (pos: number) => void;
  onDrop: (pos: number) => void;
}

export function FormationBoard({
  lineup,
  availablePlayers,
  activeSlot,
  dragSource,
  onSlotClick,
  onSlotRemove,
  onDragStart,
  onDrop
}: FormationBoardProps) {
  
  // Tactical Positions (5v5 Diamond/Square hybrid)
  const positions = [
    { id: 0, label: "GK", x: 50, y: 82 },
    { id: 1, label: "DEF", x: 50, y: 58 },
    { id: 2, label: "MID", x: 25, y: 35 },
    { id: 4, label: "MID", x: 75, y: 35 },
    { id: 3, label: "ATK", x: 50, y: 15 },
  ];

  return (
    <div className="relative w-full aspect-[4/3] bg-[#0a0c10] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Tactical Grid lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 border-2 border-white/20 m-4 rounded-lg" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full" />
      </div>

      {/* Slots Layer */}
      {positions.map((pos) => {
        const slot = lineup.find((s) => s.position === pos.id);
        const player = slot ? availablePlayers.find((p) => p.id === slot.playerId) : null;
        const isActive = activeSlot === pos.id;
        const isDragTarget = dragSource !== null && dragSource !== pos.id;

        return (
          <div
            key={pos.id}
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)"
            }}
            className="absolute z-20"
          >
            <motion.div
              draggable={!!player}
              onDragStart={() => onDragStart(pos.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(pos.id)}
              onClick={() => onSlotClick(pos.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer transition-all duration-200 group
                ${player ? "w-24 h-32" : "w-20 h-20"}
              `}
            >
              {player ? (
                /* Compact Player Slot Card */
                <div className={`w-full h-full rounded-xl border-2 overflow-hidden flex flex-col bg-surface shadow-xl
                  ${isActive ? "border-accent ring-4 ring-accent/20" : "border-white/10 group-hover:border-white/30"}
                  ${isDragTarget ? "border-accent/50 animate-pulse" : ""}
                `}>
                   <div className="h-20 w-full relative bg-surface-lighter overflow-hidden">
                      <img 
                        src={`/assets/portraits/${player.portrait}.png`} 
                        alt={player.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-black text-accent border border-accent/30 uppercase">
                        {pos.label}
                      </div>
                      <button
                        onClick={(e) => onSlotRemove(pos.id, e)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-md bg-rose-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                   </div>
                   <div className="flex-1 p-2 flex flex-col justify-center bg-black/40">
                      <div className="text-[10px] font-black uppercase italic truncate text-white leading-tight">
                         {player.name.split(' ').pop()}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                         <div className="text-[8px] font-black text-accent uppercase tracking-widest">{player.tier[0]}</div>
                         <div className="text-[9px] font-black text-white/40">{player.stats.pace + player.stats.shooting + player.stats.passing + player.stats.defense + player.stats.physical}</div>
                      </div>
                   </div>
                </div>
              ) : (
                /* Empty Slot Placeholder */
                <div className={`w-full h-full rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all
                  ${isActive ? "border-accent bg-accent/10" : "border-white/10 hover:border-white/30 bg-white/5"}
                  ${isDragTarget ? "border-accent animate-pulse" : ""}
                `}>
                   <span className="text-xl text-white/20 group-hover:text-accent/50 transition-colors">+</span>
                   <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{pos.label}</span>
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
