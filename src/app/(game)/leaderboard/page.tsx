"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useGameStore } from "@/lib/store/game-store";
import { RosterInspector } from "@/components/leaderboard/roster-inspector";
import { BadgeDisplay } from "@/components/profile/badge-display";
import type { CustomBadge } from "@/types/badge";

type LeaderboardEntry = {
  id: string;
  username: string;
  team_name: string;
  badge_id: string;
  xp: number;
  custom_badge?: any;
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const user = useGameStore(s => s.user);

  useEffect(() => {
    async function fetchLeaders() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, team_name, badge_id, xp, custom_badge')
        .order('xp', { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        setLeaders(data);
      } else {
        // High-fidelity fallback mock data
        setLeaders([
          { id: '1', username: 'GOLAZOO_ALFA', team_name: 'AC VOSTRA', xp: 97704, badge_id: 'badge_lightning' },
          { id: '2', username: 'KING_COACH', team_name: 'KINGDOM FC', xp: 85200, badge_id: 'badge_crown' },
          { id: '3', username: 'DRACO', team_name: 'DRAGON SPIRIT', xp: 74100, badge_id: 'badge_dragon' },
          { id: '4', username: 'ZOLA_FAN', team_name: 'MAGIC BOX', xp: 62000, badge_id: 'badge_lightning' },
          { id: '5', username: 'BOMBER99', team_name: 'GOAL HUNTERS', xp: 51000, badge_id: 'badge_lightning' },
          { id: '6', username: 'CALCIO_LOVER', team_name: 'SUPER SANTOS', xp: 45000, badge_id: 'badge_crown' },
          { id: '7', username: 'TATTICO', team_name: 'THE BRAIN', xp: 38000, badge_id: 'badge_dragon' },
        ]);
      }
      setLoading(false);
    }
    fetchLeaders();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {selectedUserId && (
        <RosterInspector userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
      {/* Header */}
      <div className="relative px-4 lg:px-8 pt-8 lg:pt-12 pb-6 lg:pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[200px] lg:w-[400px] h-[100px] lg:h-[200px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-[8px] lg:text-[10px] uppercase tracking-widest font-black mb-3">
            🏆 Hall of Fame
          </div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none">Classifica <span className="text-white">Globale</span></h1>
          <p className="text-muted text-[10px] lg:text-sm mt-2">I migliori manager di Supercalcio nel mondo.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16">
        <div className="card overflow-hidden border-white/5 bg-white/5">
          <div className="overflow-x-clip min-w-0">
            <table className="w-full text-left border-collapse table-fixed lg:table-auto">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-[8px] lg:text-[10px]">
                  <th className="w-10 lg:w-20 px-2 lg:px-6 py-4 uppercase tracking-widest text-muted font-bold">Pos</th>
                  <th className="px-2 lg:px-6 py-4 uppercase tracking-widest text-muted font-bold">Team</th>
                  <th className="w-12 lg:w-24 px-2 lg:px-6 py-4 uppercase tracking-widest text-muted font-bold text-right">XP</th>
                  <th className="w-10 lg:w-20 px-2 lg:px-6 py-4 uppercase tracking-widest text-muted font-bold text-right">LVL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 lg:px-6 py-6"><div className="h-4 w-4 bg-white/10 rounded"></div></td>
                      <td className="px-4 lg:px-6 py-6"><div className="h-4 w-48 bg-white/10 rounded"></div></td>
                      <td className="px-4 lg:px-6 py-6"><div className="h-4 w-12 bg-white/10 rounded ml-auto"></div></td>
                      <td className="px-4 lg:px-6 py-6"><div className="h-4 w-8 bg-white/10 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : leaders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 lg:px-6 py-12 text-center text-muted italic">Nessun dato registrato.</td>
                  </tr>
                ) : (
                  leaders.map((entry, idx) => {
                    const isCurrentUser = entry.id === user?.id;
                    const level = Math.floor(entry.xp / 100) + 1;
                    
                    return (
                      <tr 
                        key={entry.id} 
                        onClick={() => setSelectedUserId(entry.id)}
                        className={`group cursor-pointer transition-colors ${isCurrentUser ? "bg-accent/10" : "hover:bg-white/5"}`}
                      >
                        <td className="px-2 lg:px-6 py-5">
                          <div className={`text-sm lg:text-lg font-black ${
                            idx === 0 ? "text-accent" : 
                            idx === 1 ? "text-slate-300" :
                            idx === 2 ? "text-amber-600" : "text-muted"
                          }`}>
                            #{idx + 1}
                          </div>
                        </td>
                        <td className="px-2 lg:px-6 py-5">
                          <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                               {entry.custom_badge ? (
                                 <BadgeDisplay badge={entry.custom_badge as CustomBadge} size="md" />
                               ) : (
                                 <div className="text-xl lg:text-2xl drop-shadow-md">
                                   {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🛡️"}
                                 </div>
                               )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-black italic uppercase text-[9px] lg:text-xs flex items-center gap-1.5 leading-none mb-1">
                                <span className="truncate">{entry.team_name}</span>
                                {isCurrentUser && (
                                  <span className="text-[7px] bg-accent px-1 py-0.5 rounded text-black uppercase font-black shrink-0">TE</span>
                                )}
                              </div>
                              <div className="text-[8px] lg:text-[10px] text-muted font-bold truncate opacity-60">@{entry.username.split('@')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 lg:px-6 py-5 text-right font-mono font-black text-white text-[10px] lg:text-sm">
                          {entry.xp.toLocaleString()}
                        </td>
                        <td className="px-2 lg:px-6 py-5 text-right">
                          <div className="inline-flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-lg border border-accent/20 bg-accent/5 text-accent text-[9px] lg:text-xs font-black italic">
                            {level}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
