"use client";

import { useEffect, useRef } from "react";
import { tickToMatchTime, formatMatchEvent } from "@/utils/formatting";
import type { MatchEvent } from "@/types/match";
import { STARTER_PLAYERS } from "@/content/players";
import { motion, AnimatePresence } from "framer-motion";

interface MatchChronicleProps {
  events: MatchEvent[];
  totalTicks: number;
  isSearching: boolean;
}

export function MatchChronicle({ events, totalTicks, isSearching }: MatchChronicleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black/20 backdrop-blur-sm border-l border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <span className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">LIVE CHRONICLE</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] text-muted font-bold uppercase tracking-widest">FEED ATTIVO</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide"
      >
        {events.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 animate-spin flex items-center justify-center">
               <div className="w-6 h-6 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            </div>
            <p className="text-[10px] text-muted font-medium uppercase tracking-[0.2em]">
              {isSearching ? "CONFIGURAZIONE ARENA..." : "IN ATTESA DEL CALCIO D'INIZIO..."}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {events.map((e, idx) => {
            const isGoal = e.type === "goal";
            const isBreak = e.type === "halftime" || e.type === "full_time";
            const isHighlight = ["save", "yellow_card", "red_card"].includes(e.type);

            return (
              <motion.div
                key={`${e.tick}-${idx}`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`group relative flex gap-3 items-start p-3 rounded-2xl transition-all border ${
                  isGoal
                    ? "bg-accent/10 border-accent/30 shadow-lg shadow-accent/5"
                    : isBreak
                    ? "bg-white/10 border-white/20 justify-center text-center italic"
                    : isHighlight
                    ? "bg-rose-500/10 border-rose-500/30"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                {!isBreak && (
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono text-[10px] font-black border ${
                    isGoal ? "bg-accent text-black border-accent" : "bg-black/40 text-muted border-white/10"
                  }`}>
                    {tickToMatchTime(e.tick, totalTicks)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isGoal && <span className="text-xs">⚽</span>}
                    {e.type === "save" && <span className="text-xs">🧤</span>}
                    {e.type === "yellow_card" && <span className="text-xs">🟨</span>}
                    {e.type === "red_card" && <span className="text-xs">🟥</span>}
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isGoal ? "text-accent" : isHighlight ? "text-rose-400" : "text-muted/60"
                    }`}>
                      {e.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className={`text-xs lg:text-sm leading-tight font-medium ${
                    isGoal ? "text-white font-bold" : "text-foreground/80"
                  }`}>
                    {formatMatchEvent(e, STARTER_PLAYERS)}
                  </p>
                </div>

                {isGoal && (
                  <motion.div 
                    layoutId="goal-glow"
                    className="absolute inset-0 rounded-2xl bg-accent/5 animate-pulse pointer-events-none" 
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
