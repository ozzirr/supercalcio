"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface MatchActionPanelProps {
  energyAmount: number;
  energyTimer: string;
  isSquadReady: boolean;
  matchInProgress: boolean;
}

export function MatchActionPanel({ energyAmount, energyTimer, isSquadReady, matchInProgress }: MatchActionPanelProps) {
  const isEnergyFull = energyAmount >= 3;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-accent/20 blur-[50px] rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      
      <div className="card relative overflow-hidden p-8 border-accent/30 bg-gradient-to-br from-accent/10 via-black/40 to-black/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-6 font-black italic text-5xl lg:text-7xl opacity-[0.03] select-none">ARENA</div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

        <div className="flex flex-col items-center text-center gap-6 relative z-10">
          <div className="flex items-center gap-3 bg-black/60 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-inner">
            <span className="text-2xl animate-pulse">⚡</span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xl font-black tabular-nums text-white">{energyAmount}/3</span>
              <span className="text-[8px] text-accent font-black uppercase tracking-widest mt-1">Energia</span>
            </div>
            {energyAmount < 3 && energyTimer && (
              <div className="ml-4 pl-4 border-l border-white/10 flex flex-col items-start">
                <span className="text-[10px] text-white/60 font-mono">{energyTimer}</span>
                <span className="text-[7px] text-muted font-bold uppercase tracking-tighter">Prossima</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <motion.h2 
              className="text-3xl lg:text-5xl font-black uppercase italic italic tracking-tighter leading-none"
              animate={energyAmount > 0 && isSquadReady ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {!isSquadReady ? "Squadra Incompleta" : energyAmount > 0 ? "Scendi in Campo" : "Energia Esaurita"}
            </motion.h2>
            <p className="text-[10px] lg:text-xs text-muted uppercase tracking-[0.3em] font-black">
              {!isSquadReady ? "Completa il roster 5v5 per giocare" : energyAmount > 0 ? "L'Arena Live ti aspetta" : "Recupero energia in corso"}
            </p>
          </div>

          <div className="w-full max-w-sm pt-4">
            {energyAmount > 0 && isSquadReady ? (
              <Link
                href="/match"
                className="btn-primary w-full py-5 rounded-2xl font-black uppercase text-xs lg:text-sm tracking-[0.3em] shadow-[0_10px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_40px_rgba(251,191,36,0.5)] transition-all flex items-center justify-center gap-3 group/btn"
              >
                <span>Gioca Match Live</span>
                <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            ) : (
              <Link
                href={!isSquadReady ? "/squad" : "#"}
                className="w-full py-5 rounded-2xl font-black uppercase text-xs lg:text-sm tracking-[0.3em] bg-white/5 text-white/20 border border-white/10 flex items-center justify-center gap-3 cursor-not-allowed"
              >
                {!isSquadReady ? "Configura Roster" : "Ricarica Arena"}
              </Link>
            )}
          </div>
          
          <div className="pt-2">
            <p className="text-[8px] lg:text-[9px] text-muted/40 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
              Ogni match consuma 1 punto energia. L'energia si rigenera automaticamente ogni 7 ore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
