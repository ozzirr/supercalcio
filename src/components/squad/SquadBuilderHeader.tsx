"use client";

import { motion } from "framer-motion";

interface SquadBuilderHeaderProps {
  power?: string;
  ovr?: number;
  chemistry?: number;
}

export function SquadBuilderHeader({ power = "2,840", ovr = 78, chemistry = 85 }: SquadBuilderHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-4 shrink-0">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black italic tracking-tighter uppercase leading-none whitespace-nowrap">
          SQUAD <span className="text-gold">BUILDER</span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:gap-8 bg-white/[0.03] border border-white/10 px-6 py-3 rounded-2xl lg:rounded-[2rem] backdrop-blur-xl shrink-0">
        <div className="flex flex-col items-start gap-0.5">
           <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">POTENZA</span>
           <div className="flex items-center gap-1.5">
              <span className="text-gold text-lg">🔥</span>
              <span className="text-xl font-black italic text-white tracking-tighter">{power}</span>
           </div>
        </div>
        
        <div className="w-px h-8 bg-white/10 hidden sm:block" />

        <div className="flex flex-col items-start gap-0.5">
           <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">OVR MEDIA</span>
           <span className="text-xl font-black italic text-white tracking-tighter">{ovr}</span>
        </div>

        <div className="w-px h-8 bg-white/10 hidden sm:block" />

        <div className="flex flex-col items-start gap-0.5">
           <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">INTESA</span>
           <div className="flex items-center gap-3">
              <span className="text-xl font-black italic text-emerald-400 tracking-tighter">{chemistry}%</span>
              <div className="w-10 lg:w-16 h-1.5 bg-white/5 rounded-full overflow-hidden hidden lg:block">
                 <div className="h-full bg-emerald-400 shadow-[0_0_8px_#34d399]" style={{ width: `${chemistry}%` }} />
              </div>
           </div>
        </div>

        <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-all shrink-0">
           <span className="text-lg">ⓘ</span>
        </button>
      </div>
    </div>
  );
}
