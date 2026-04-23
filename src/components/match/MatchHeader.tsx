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
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Top Gradient Overlay */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 py-4 flex items-start justify-between relative">
        {/* Home Team (Left) */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-start gap-1 pointer-events-auto flex-1 min-w-0"
        >
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden sm:flex w-8 h-8 lg:w-12 lg:h-12 rounded-xl bg-accent/10 border border-accent/30 items-center justify-center shadow-lg shadow-accent/5 backdrop-blur-md shrink-0">
              <span className="text-sm lg:text-2xl">🛡️</span>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] lg:text-[10px] text-accent font-black uppercase tracking-[0.2em] leading-none mb-0.5 lg:mb-1">HOME</div>
              <div className="text-sm lg:text-xl font-black text-white leading-none truncate max-w-[80px] sm:max-w-[120px]">YOU</div>
            </div>
          </div>
          <div className="mt-1 lg:mt-2 px-1.5 lg:px-2 py-0.5 rounded bg-white/5 border border-white/10 truncate max-w-full">
            <span className="text-[7px] lg:text-[8px] font-bold text-muted uppercase tracking-wider">{playstyle.replace(/_/g, " ")}</span>
          </div>
        </motion.div>

        {/* Score & Timer (Center) */}
        <div className="flex flex-col items-center pointer-events-auto shrink-0 mx-2">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl lg:rounded-2xl p-0.5 lg:p-1 shadow-2xl overflow-hidden flex items-center"
          >
            <div className="px-2 lg:px-6 py-1 lg:py-2 flex items-center gap-3 lg:gap-8">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={score.home}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-2xl lg:text-5xl font-black text-white italic tabular-nums leading-none drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  {score.home}
                </motion.span>
              </AnimatePresence>
              
              <div className="flex flex-col items-center border-x border-white/10 px-2 lg:px-8">
                <div className="text-[10px] lg:text-sm font-black text-white/90 font-mono tabular-nums leading-none mb-1">
                  {tickToMatchTime(tick, totalTicks)}
                </div>
                <div className="h-1 w-12 lg:w-24 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent shadow-[0_0_8px_#fbbf24]"
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
                  className="text-2xl lg:text-5xl font-black text-rose-500 italic tabular-nums leading-none drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                >
                  {score.away}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="mt-2 lg:mt-3 flex flex-col items-center">
            {isSearching ? (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-accent animate-ping" />
                <span className="text-[8px] lg:text-[10px] text-accent font-black uppercase tracking-[0.2em]">ANALISI AVVERSARIO</span>
              </div>
            ) : matchInProgress ? (
              <div className="flex items-center gap-1.5 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[7px] lg:text-[9px] text-emerald-400 font-black uppercase tracking-[0.15em]">LIVE MATCH</span>
              </div>
            ) : (
               <span className="text-[7px] lg:text-[9px] text-muted font-black uppercase tracking-[0.15em]">MATCH TERMINATO</span>
            )}
          </div>
        </div>

        {/* Away Team (Right) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-end gap-1 pointer-events-auto flex-1 min-w-0"
        >
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="text-right min-w-0">
              <div className="text-[9px] lg:text-[10px] text-rose-400 font-black uppercase tracking-[0.2em] leading-none mb-0.5 lg:mb-1">AWAY</div>
              <div className="text-sm lg:text-xl font-black text-white leading-none truncate max-w-[80px] sm:max-w-[120px]">{opponentName || "CPU"}</div>
            </div>
            <div className="hidden sm:flex w-8 h-8 lg:w-12 lg:h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 items-center justify-center shadow-lg shadow-rose-500/5 backdrop-blur-md shrink-0">
              <span className="text-sm lg:text-2xl">🔴</span>
            </div>
          </div>
          <div className="mt-1 lg:mt-2 px-1.5 lg:px-2 py-0.5 rounded bg-white/5 border border-white/10 truncate max-w-full">
            <span className="text-[7px] lg:text-[8px] font-bold text-muted uppercase tracking-wider">{(opponentPlaystyle || "Standard").replace(/_/g, " ")}</span>
          </div>
        </motion.div>

        {/* Audio Toggle */}
        <button 
          onClick={() => setMuted(!isMuted)}
          className="absolute -bottom-8 lg:-bottom-12 right-2 lg:right-4 pointer-events-auto p-1.5 lg:p-2.5 rounded-lg lg:rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-muted hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M168,128a12,12,0,0,1-12,12H100a12,12,0,0,1,0-24h56A12,12,0,0,1,168,128Zm70.49,102.51a12,12,0,0,1-17,17l-192-192a12,12,0,0,1,17-17l36.56,36.56A27.84,27.84,0,0,1,104,70.52V40a12,12,0,0,1,19.34-9.6l24,18H152a12,12,0,0,1,0,24h-1.33l19.5,14.62,11.83,11.83h0l56.49,56.5ZM104,116.52l12.56,12.56-11.41,8.56A12,12,0,0,1,84.7,128V70.52a4,4,0,0,1,1.15-2.82Zm120,11.48H200a12,12,0,0,1,0-24h24a12,12,0,0,1,0,24Zm-24-36a12,12,0,0,1-12-12v-8a12,12,0,0,1,24,0v8A12,12,0,0,1,200,92Zm0,72a12,12,0,0,1-12-12v-16a12,12,0,0,1,24,0v16A12,12,0,0,1,200,164Z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M152,72h-4.3l-24.36-18.27A12,12,0,0,0,104,50.14V40a12,12,0,0,0-19.34-9.6L37.2,66.1a11.9,11.9,0,0,0-5.2,9.9V180a12,12,0,0,0,19.34,9.6L104,150.14v39.38a12,12,0,0,0,19.34,9.6L147.7,180.85A12,12,0,0,0,155,171.21V81.64A12,12,0,0,0,147.7,72ZM84,151a12,12,0,0,0-4.66,0.94L52,170.83V81.3l27.34,20.5a12,12,0,0,0,19.34-9.6V71.4l5.32,4V184.6ZM200,104a12,12,0,0,0-12,12v24a12,12,0,0,0,24,0V116A12,12,0,0,0,200,104Zm40,0a12,12,0,0,0-12,12v24a12,12,0,0,0,24,0V116A12,12,0,0,0,240,104Z"></path></svg>
          )}
        </button>
      </div>
    </div>
  );
}
