"use client";

import { tickToMatchTime } from "@/utils/formatting";
import { useGameStore } from "@/lib/store/game-store";
import { motion, AnimatePresence } from "framer-motion";

interface MatchHeaderProps {
  tick: number;
  totalTicks: number;
  score: { home: number; away: number };
  opponentName: string;
  opponentPlaystyle: string;
  isSearching: boolean;
  matchInProgress: boolean;
}

export function MatchHeader({
  tick,
  totalTicks,
  score,
  opponentName,
  opponentPlaystyle,
  isSearching,
  matchInProgress
}: MatchHeaderProps) {
  const { playstyle, isMuted, setMuted, teamName } = useGameStore();

  return (
    <div className="absolute top-4 lg:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-4xl px-4">
      <div className="flex items-center justify-center relative">
        
        {/* Scoreboard Container */}
        <div className="flex items-center gap-2 lg:gap-4 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-1 lg:p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          
          {/* HOME TEAM */}
          <div className="flex items-center gap-3 pl-3 pr-4 py-1 bg-white/[0.03] rounded-xl border border-white/5">
             <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1">
                <img src="/assets/logo.png" className="w-full h-full object-contain grayscale brightness-200 opacity-60" alt="badge" />
             </div>
             <div className="flex flex-col">
                <span className="text-[12px] lg:text-[14px] font-black italic text-white uppercase tracking-tighter leading-none">YOU</span>
                <span className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-widest">{teamName || "AC VOSTRA"}</span>
             </div>
          </div>

          {/* SCORE & TIME */}
          <div className="flex items-center gap-4 lg:gap-8 px-2">
             <span className="text-3xl lg:text-5xl font-black text-white italic tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{score.home}</span>
             
             <div className="flex flex-col items-center min-w-[60px] lg:min-w-[90px]">
                <div className="text-lg lg:text-2xl font-black text-white tabular-nums italic tracking-tighter drop-shadow-lg">
                   {tickToMatchTime(tick, totalTicks)}
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                   <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                   <span className="text-[7px] lg:text-[8px] text-emerald-400 font-black uppercase tracking-[0.2em]">ARENA</span>
                </div>
             </div>

             <span className="text-3xl lg:text-5xl font-black text-white italic tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{score.away}</span>
          </div>

          {/* AWAY TEAM */}
          <div className="flex items-center gap-3 pr-3 pl-4 py-1 bg-white/[0.03] rounded-xl border border-white/5">
             <div className="flex flex-col text-right">
                <span className="text-[12px] lg:text-[14px] font-black italic text-white uppercase tracking-tighter leading-none">{opponentName || "BELLAFIGA"}</span>
                <span className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-widest">@RIVAL</span>
             </div>
             <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center p-1">
                <div className="w-full h-full rounded bg-rose-500/40 flex items-center justify-center text-[10px]">🔴</div>
             </div>
          </div>
        </div>

        {/* Audio Toggle */}
        <button 
          onClick={() => setMuted(!isMuted)}
          className="absolute -right-12 lg:-right-14 p-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-white/40 hover:text-white transition-all shadow-2xl pointer-events-auto"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
