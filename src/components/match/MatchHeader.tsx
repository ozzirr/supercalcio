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
  const { playstyle, isMuted, setMuted } = useGameStore();

  return (
    <div className="absolute top-4 lg:top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-4xl px-4">
      {/* Top Gradient Overlay - Subtle vignette */}
      <div className="absolute -top-10 inset-x-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl lg:rounded-3xl p-2 lg:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Home Team (Left) */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 lg:gap-4 pointer-events-auto flex-1 min-w-0"
        >
          <div className="hidden sm:flex w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 items-center justify-center shadow-lg shadow-accent/5 backdrop-blur-md shrink-0">
            <span className="text-xl lg:text-3xl">🛡️</span>
          </div>
          <div className="min-w-0">
            <div className="text-[8px] lg:text-[10px] text-accent font-black uppercase tracking-[0.2em] leading-none mb-1">HOME</div>
            <div className="text-sm lg:text-2xl font-black text-white leading-none truncate italic uppercase tracking-tighter">YOU</div>
          </div>
        </motion.div>

        {/* Score & Timer (Center) */}
        <div className="flex flex-col items-center pointer-events-auto shrink-0 mx-4 lg:mx-8">
          <div className="flex items-center gap-4 lg:gap-10">
            <AnimatePresence mode="wait">
              <motion.span 
                key={score.home}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-3xl lg:text-6xl font-black text-white italic tabular-nums leading-none drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              >
                {score.home}
              </motion.span>
            </AnimatePresence>
            
            <div className="flex flex-col items-center min-w-[60px] lg:min-w-[120px]">
              <div className="text-xs lg:text-lg font-black text-white/90 font-mono tabular-nums leading-none mb-2 bg-white/5 px-2 py-1 rounded border border-white/10">
                {tickToMatchTime(tick, totalTicks)}
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent shadow-[0_0_10px_#fbbf24]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(tick / totalTicks) * 100}%` }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.span 
                key={score.away}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-3xl lg:text-6xl font-black text-rose-500 italic tabular-nums leading-none drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]"
              >
                {score.away}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="mt-2 flex items-center justify-center">
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                <span className="text-[8px] lg:text-[9px] text-accent font-black uppercase tracking-[0.3em]">ANALISI AVVERSARIO</span>
              </div>
            ) : matchInProgress ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[8px] lg:text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">LIVE ARENA</span>
              </div>
            ) : (
               <span className="text-[8px] lg:text-[9px] text-muted font-black uppercase tracking-[0.2em]">MATCH TERMINATO</span>
            )}
          </div>
        </div>

        {/* Away Team (Right) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 lg:gap-4 pointer-events-auto flex-1 min-w-0 justify-end"
        >
          <div className="text-right min-w-0">
            <div className="text-[8px] lg:text-[10px] text-rose-400 font-black uppercase tracking-[0.2em] leading-none mb-1">AWAY</div>
            <div className="text-sm lg:text-2xl font-black text-white leading-none truncate italic uppercase tracking-tighter">{opponentName || "CPU"}</div>
          </div>
          <div className="hidden sm:flex w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30 items-center justify-center shadow-lg shadow-rose-500/5 backdrop-blur-md shrink-0">
            <span className="text-xl lg:text-3xl">🔴</span>
          </div>
        </motion.div>

        {/* Audio Toggle - Floating Sidebar Style */}
        <button 
          onClick={() => setMuted(!isMuted)}
          className="absolute -right-12 top-1/2 -translate-y-1/2 pointer-events-auto p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-muted hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-95 group"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="group-hover:text-accent"><path d="M168,128a12,12,0,0,1-12,12H100a12,12,0,0,1,0-24h56A12,12,0,0,1,168,128Zm70.49,102.51a12,12,0,0,1-17,17l-192-192a12,12,0,0,1,17-17l36.56,36.56A27.84,27.84,0,0,1,104,70.52V40a12,12,0,0,1,19.34-9.6l24,18H152a12,12,0,0,1,0,24h-1.33l19.5,14.62,11.83,11.83h0l56.49,56.5ZM104,116.52l12.56,12.56-11.41,8.56A12,12,0,0,1,84.7,128V70.52a4,4,0,0,1,1.15-2.82Zm120,11.48H200a12,12,0,0,1,0-24h24a12,12,0,0,1,0,24Zm-24-36a12,12,0,0,1-12-12v-8a12,12,0,0,1,24,0v8A12,12,0,0,1,200,92Zm0,72a12,12,0,0,1-12-12v-16a12,12,0,0,1,24,0v16A12,12,0,0,1,200,164Z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="group-hover:text-accent"><path d="M152,72h-4.3l-24.36-18.27A12,12,0,0,0,104,50.14V40a12,12,0,0,0-19.34-9.6L37.2,66.1a11.9,11.9,0,0,0-5.2,9.9V180a12,12,0,0,0,19.34,9.6L104,150.14v39.38a12,12,0,0,0,19.34,9.6L147.7,180.85A12,12,0,0,0,155,171.21V81.64A12,12,0,0,0,147.7,72ZM84,151a12,12,0,0,0-4.66,0.94L52,170.83V81.3l27.34,20.5a12,12,0,0,0,19.34-9.6V71.4l5.32,4V184.6ZM200,104a12,12,0,0,0-12,12v24a12,12,0,0,0,24,0V116A12,12,0,0,0,200,104Zm40,0a12,12,0,0,0-12,12v24a12,12,0,0,0,24,0V116A12,12,0,0,0,240,104Z"></path></svg>
          )}
        </button>
      </div>
    </div>
  );
}
