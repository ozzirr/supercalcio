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

  const getEventIcon = (type: string) => {
    switch (type) {
      case "pass": return "🏃";
      case "tackle": return "🛡️";
      case "possession": return "⚽";
      case "shot": return "🎯";
      case "goal": return "🔥";
      case "save": return "🧤";
      default: return "⚽";
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "pass": return "PASSAGGIO";
      case "tackle": return "CONTRASTO";
      case "possession": return "POSSESSO";
      case "shot": return "TIRO";
      case "goal": return "GOAL!";
      case "save": return "PARATA";
      default: return type.toUpperCase();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-3xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">CRONACA LIVE</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide"
      >
        {events.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-8">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/10 animate-spin flex items-center justify-center">
               <div className="w-4 h-4 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
            </div>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">
               Configurazione Arena...
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {events.map((e, idx) => {
            const isHome = e.team === "home";
            return (
              <motion.div
                key={`${e.tick}-${idx}`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex gap-3 items-start group"
              >
                <div className="text-[10px] font-black text-white/40 tabular-nums min-w-[28px] mt-0.5">
                   {tickToMatchTime(e.tick, totalTicks)}
                </div>

                <div className="flex-1 flex items-start gap-2 min-w-0">
                   <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs shrink-0">
                      {getEventIcon(e.type)}
                   </div>
                   <div className="flex flex-col min-w-0">
                      <div className="text-[9px] font-black text-white uppercase tracking-wider leading-none mb-0.5">
                         {getEventLabel(e.type)}
                      </div>
                      <p className="text-[9px] text-white/40 font-medium leading-tight truncate">
                         {formatMatchEvent(e, STARTER_PLAYERS)}
                      </p>
                   </div>
                </div>

                <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${isHome ? "bg-gold shadow-[0_0_8px_#fbbf24]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"}`} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="p-2 border-t border-white/5 bg-white/[0.02]">
         <button className="w-full py-2 text-[8px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] transition-colors">
            VEDI TUTTA LA CRONACA
         </button>
      </div>
    </div>
  );
}
