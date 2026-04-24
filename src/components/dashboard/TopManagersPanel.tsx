"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface TopManagersPanelProps {
  entries: any[];
  userId?: string;
}

export function TopManagersPanel({ entries, userId }: TopManagersPanelProps) {
  // Mocking values for reference fidelity
  const displayEntries = entries.length > 0 ? entries : [
    { id: '1', team_name: 'AC VOSTRA', xp: 4700 },
    { id: '2', team_name: 'CAGLIARIFORNIA', xp: 1450 },
    { id: '3', team_name: 'BELLAFIGA', xp: 350 },
    { id: '4', team_name: 'SPACCACULO', xp: 150 },
    { id: '5', team_name: 'SUCA TEAM', xp: 100 },
  ];

  return (
    <div className="glass-premium p-6 lg:p-8 space-y-6 border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gold text-2xl drop-shadow-[0_0_8px_rgba(255,193,32,0.5)]">👑</span>
          <h2 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-white">TOP 5 MANAGERS</h2>
        </div>
        <Link href="/leaderboard" className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-gold transition-colors flex items-center gap-2 group">
           VEDI CLASSIFICA COMPLETA <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="space-y-2.5 flex-1">
        {displayEntries.map((entry, index) => {
          const isFirst = index === 0;
          
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                isFirst 
                ? "bg-gold/15 border-gold/40 shadow-[0_10px_30px_rgba(255,193,32,0.1)] scale-[1.01]" 
                : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-6 text-center text-xs font-black italic ${isFirst ? "text-gold" : "text-white/20"}`}>
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 shadow-inner">
                   <img src="/assets/logo.png" className="w-6 h-6 object-contain grayscale brightness-200 opacity-40" alt="stemma" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[13px] font-black uppercase tracking-tight ${isFirst ? "text-white" : "text-white/70"}`}>
                    {entry.team_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <div className="text-right">
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">XP</div>
                  <div className={`text-xs font-black tabular-nums ${isFirst ? "text-white" : "text-white/50"}`}>{entry.xp.toLocaleString()} XP</div>
                </div>
                <div className="text-right min-w-[70px]">
                  <div className={`text-[9px] font-black uppercase tracking-widest text-right ${isFirst ? "text-gold/60" : "text-white/20"}`}>LEVEL</div>
                  <div className={`text-sm font-black text-right italic ${isFirst ? "text-gold" : "text-white/40"}`}>LVL {Math.floor(entry.xp / 100) + 1}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
