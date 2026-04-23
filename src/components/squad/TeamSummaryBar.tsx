"use client";

import { motion } from "framer-motion";
import type { PlayerDefinition } from "@/types/player";

interface TeamSummaryBarProps {
  players: PlayerDefinition[];
}

export function TeamSummaryBar({ players }: TeamSummaryBarProps) {
  // Simple calculation for stats
  const calculateTotal = (stat: keyof PlayerDefinition['stats']) => {
    if (players.length === 0) return 0;
    return Math.round(players.reduce((acc, p) => acc + p.stats[stat], 0) / players.length);
  };

  const avgPace = calculateTotal('pace');
  const avgShooting = calculateTotal('shooting');
  const avgPassing = calculateTotal('passing');
  const avgDefense = calculateTotal('defense');
  const avgPhysical = calculateTotal('physical');

  const overall = Math.round((avgPace + avgShooting + avgPassing + avgDefense + avgPhysical) / 5);

  const stats = [
    { label: "PAC", value: avgPace },
    { label: "SHO", value: avgShooting },
    { label: "PAS", value: avgPassing },
    { label: "DEF", value: avgDefense },
    { label: "PHY", value: avgPhysical },
  ];

  return (
    <div className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
      {/* Overall OVR Badge */}
      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-accent/10 border border-accent/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
        <span className="text-2xl font-black italic text-accent leading-none">{overall}</span>
        <span className="text-[8px] font-black uppercase text-accent/60 mt-1">OVR</span>
      </div>

      {/* Stats Readout */}
      <div className="flex-1 grid grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="space-y-1.5">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-muted tracking-widest">{s.label}</span>
                <span className="text-[10px] font-black text-white">{s.value}</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  className="h-full bg-white/30"
                />
             </div>
          </div>
        ))}
      </div>

      {/* Status Readiness */}
      <div className="hidden lg:flex flex-col items-end gap-1 shrink-0 px-4 border-l border-white/10">
         <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Tactical Rating</div>
         <div className="text-sm font-black uppercase italic text-white tracking-tight">
            {overall >= 85 ? "World Class" : overall >= 75 ? "Professional" : overall >= 60 ? "Competitive" : "Prospect"}
         </div>
      </div>
    </div>
  );
}
