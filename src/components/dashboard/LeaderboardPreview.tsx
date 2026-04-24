"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  id: string;
  team_name: string;
  badge_id: string;
  xp: number;
}

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  userId?: string;
}

export function LeaderboardPreview({ entries, userId }: LeaderboardPreviewProps) {
  return (
    <div className="card p-6 lg:p-8 border-white/5 bg-gradient-to-tr from-white/[0.02] to-transparent">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl">🏆</div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Top 5 Managers</h2>
        </div>
        <Link href="/leaderboard" className="text-[10px] text-accent font-black uppercase tracking-widest hover:underline flex items-center gap-2 group">
          Classifica Completa 
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse" />
          ))
        ) : (
          entries.map((entry, idx) => {
            const isMe = entry.id === userId;
            const lvl = Math.floor(entry.xp / 100) + 1;
            
            return (
              <div
                key={entry.id}
                className={`group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                  isMe 
                    ? "bg-accent text-black shadow-[0_10px_30px_rgba(251,191,36,0.1)]" 
                    : "bg-white/[0.02] hover:bg-white/5 border border-white/5"
                }`}
              >
                <div className={`text-xl font-black w-10 text-center shrink-0 ${isMe ? "text-black" : ""}`}>
                  {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className={`font-black italic uppercase text-xs lg:text-sm truncate block ${isMe ? "text-black" : "text-white"}`}>
                    {entry.team_name}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black italic tabular-nums ${isMe ? "text-black/60" : "text-accent"}`}>
                       {entry.xp.toLocaleString()} <span className="text-[8px] font-normal uppercase not-italic">XP</span>
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isMe ? "text-black/40" : "text-muted"}`}>
                       Level {lvl}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
