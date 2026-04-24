"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";

interface MatchCtaPanelProps {
  energyAmount: number;
  isSquadReady: boolean;
}

export function MatchCtaPanel({ energyAmount, isSquadReady }: MatchCtaPanelProps) {
  const matchInProgress = useGameStore((s) => s.matchInProgress);

  return (
    <div className="glass-premium overflow-hidden h-full flex flex-col relative group border-gold/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Stadium Background */}
      <div className="absolute inset-0 bg-stadium-tactical opacity-80 transition-transform duration-1000 group-hover:scale-110" />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#05070a_120%)] opacity-70" />

      <div className="relative z-10 p-8 lg:p-10 flex flex-col items-center justify-center flex-1 text-center space-y-8">
        <div className="space-y-2">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
          >
            SCENDI IN <br /> <span className="text-gold">CAMPO</span>
          </motion.h2>
        </div>

        {/* Match Info Row */}
        <div className="flex items-center justify-center gap-10 w-full bg-black/50 backdrop-blur-md py-4 px-6 rounded-2xl border border-white/5">
           <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                 <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">LIVE ARENA</span>
              </div>
              <span className="text-[9px] font-bold text-white/40 uppercase">Arena Live pronta</span>
           </div>
           
           <div className="w-px h-10 bg-white/10" />

           <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">COSTO ENERGIA</span>
              <div className="flex items-center gap-1.5">
                 <span className="text-cyan-400 text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">⚡</span>
                 <span className="text-xl font-black italic text-white leading-none">1</span>
              </div>
           </div>
        </div>

        <div className="w-full">
           <Link 
             href={matchInProgress ? "#" : "/match"}
             className={`group/btn relative w-full py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.25em] shadow-[0_20px_50px_rgba(251,191,36,0.4)] transition-all duration-500 flex items-center justify-center gap-4 overflow-hidden ${
               matchInProgress 
               ? "bg-white/10 text-white/20 cursor-not-allowed shadow-none" 
               : "bg-gold hover:bg-white text-black"
             }`}
           >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <span>{matchInProgress ? "MATCH IN CORSO" : "GIOCA MATCH LIVE"}</span>
              <span className="text-2xl group-hover/btn:translate-x-2 transition-transform">
                {matchInProgress ? "⏱" : "→"}
              </span>
           </Link>
        </div>

        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em]">
           Ogni match consuma 1 punto energia.
        </p>
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20" />
    </div>
  );
}
