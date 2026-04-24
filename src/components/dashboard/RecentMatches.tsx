"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface MiniMatchEntry {
  id: string;
  home_score: number;
  away_score: number;
  created_at: string;
  match_data: any;
  home: { team_name: string; badge_id: string } | null;
  away: { team_name: string; badge_id: string } | null;
}

interface RecentMatchesProps {
  matches: MiniMatchEntry[];
}

export function RecentMatches({ matches }: RecentMatchesProps) {
  if (matches.length === 0) {
    return (
      <div className="py-8 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/[0.01]">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl grayscale opacity-50">⚽</div>
        <p className="text-[10px] font-bold text-muted/40 uppercase tracking-widest">Nessun match recente registrato</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Ultimi Risultati Live
        </h3>
        <span className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">Feed Aggiornato</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        {matches.map((match, idx) => {
          const homeName = match.home?.team_name || match.match_data?.home_name || "GOLAZOO FC";
          const homeBadge = match.home?.badge_id || match.match_data?.home_badge || "badge_lightning";
          const awayName = match.away?.team_name || match.match_data?.away_name || "AI BOTS";
          const awayBadge = match.away?.badge_id || match.match_data?.away_badge || "badge_lightning";

          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex-shrink-0 w-64 card p-3 bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default group"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Home */}
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/5 group-hover:scale-110 transition-transform">
                    {getBadgeEmoji(homeBadge)}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tight truncate w-full text-center text-white/80">
                    {homeName}
                  </span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 border border-white/5">
                    <span className="text-sm font-black italic text-white">{match.home_score}</span>
                    <span className="text-[8px] text-muted/40">-</span>
                    <span className="text-sm font-black italic text-white">{match.away_score}</span>
                  </div>
                  <span className="text-[7px] font-bold text-muted/50 uppercase">
                    {formatDistanceToNow(new Date(match.created_at), { addSuffix: true, locale: it })}
                  </span>
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/5 group-hover:scale-110 transition-transform">
                    {getBadgeEmoji(awayBadge)}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tight truncate w-full text-center text-white/80">
                    {awayName}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function getBadgeEmoji(badgeId: string) {
  switch (badgeId) {
    case "badge_lightning": return "⚡";
    case "badge_dragon": return "🐉";
    case "badge_shield": return "🛡️";
    case "badge_fire": return "🔥";
    default: return "⭐";
  }
}
