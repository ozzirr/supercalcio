"use client";

import { motion } from "framer-motion";

import { PLAYSTYLES } from "@/content/playstyles";

interface TacticalStyleSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function TacticalStyleSelector({ selectedId, onSelect }: TacticalStyleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {PLAYSTYLES.map((ps) => {
        const isActive = selectedId === ps.id;
        
        return (
          <motion.div
            key={ps.id}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(ps.id)}
            className={`relative cursor-pointer group flex flex-col p-3 rounded-xl border transition-all
              ${isActive 
                ? "border-accent bg-accent/5 ring-1 ring-accent/20 shadow-lg" 
                : "border-white/5 bg-white/5 hover:border-white/10"
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
               <div className={`text-[11px] font-black uppercase italic tracking-tighter ${isActive ? 'text-accent' : 'text-white'}`}>
                  {ps.name}
               </div>
               {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_#fbbf24]" />}
            </div>

            <p className="text-[9px] text-muted leading-tight font-medium mb-3 line-clamp-2">
              {ps.description}
            </p>

            <div className="flex gap-1.5">
               <div className={`h-1 flex-1 rounded-full ${isActive ? 'bg-accent/40' : 'bg-white/10'}`}>
                  <motion.div 
                    initial={false}
                    animate={{ width: `${ps.modifiers.pressIntensity * 100}%` }}
                    className={`h-full rounded-full ${isActive ? 'bg-accent' : 'bg-white/30'}`}
                  />
               </div>
               <div className={`h-1 flex-1 rounded-full ${isActive ? 'bg-accent/40' : 'bg-white/10'}`}>
                  <motion.div 
                    initial={false}
                    animate={{ width: `${ps.modifiers.passingTempo * 100}%` }}
                    className={`h-full rounded-full ${isActive ? 'bg-accent' : 'bg-white/30'}`}
                  />
               </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
