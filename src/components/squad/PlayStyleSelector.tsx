"use client";

import { motion } from "framer-motion";
import type { PlaystyleDefinition } from "@/types/squad";

interface PlayStyleSelectorProps {
  playstyles: PlaystyleDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PlayStyleSelector({ playstyles, selectedId, onSelect }: PlayStyleSelectorProps) {
  const icons: Record<string, string> = {
    aggressive_press: "⚡",
    counter_attack: "↗️",
    possession_control: "🟢",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
         <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">STILE DI GIOCO</h2>
         <span className="text-[10px] text-white/20 font-black">+</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {playstyles.map((ps) => {
          const isActive = selectedId === ps.id;
          
          return (
            <motion.div
              key={ps.id}
              whileHover={{ y: -5 }}
              onClick={() => onSelect(ps.id)}
              className={`p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${
                isActive 
                ? "bg-gold/15 border-gold shadow-[0_20px_40px_rgba(255,193,32,0.15)]" 
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-lg">{icons[ps.id]}</span>
                    <h3 className={`text-sm font-black italic uppercase tracking-tight ${isActive ? 'text-gold' : 'text-white'}`}>
                      {ps.name}
                    </h3>
                 </div>
              </div>
              
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed mb-6 h-8 line-clamp-2">
                {ps.description}
              </p>

              <div className="space-y-3">
                <StatBar label="POSSESSO" value={(ps.modifiers.possessionBias + 0.5) * 100} isActive={isActive} />
                <StatBar label="PRESSING" value={ps.modifiers.pressIntensity * 100} isActive={isActive} />
                <StatBar label="COUNTER" value={ps.modifiers.counterSpeed * 100} isActive={isActive} />
                <StatBar label="LINE HEIGHT" value={ps.modifiers.defenseLine * 100} isActive={isActive} />
                <StatBar label="TEMPO" value={ps.modifiers.passingTempo * 100} isActive={isActive} />
              </div>

              {isActive && (
                 <div className="absolute top-0 right-0 p-4">
                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_10px_#FFC324]" />
                 </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatBar({ label, value, isActive }: { label: string; value: number; isActive: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em]">
        <span className={isActive ? "text-white/60" : "text-white/20"}>{label}</span>
        <span className={isActive ? "text-gold" : "text-white/40"}>{Math.round(value)}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full rounded-full ${isActive ? 'bg-gold shadow-[0_0_8px_#FFC324]' : 'bg-white/20'}`} 
        />
      </div>
    </div>
  );
}
