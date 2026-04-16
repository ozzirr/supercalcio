"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useGameStore } from "@/lib/store/game-store";
import { RosterInspector } from "@/components/leaderboard/roster-inspector";

type LeaderboardEntry = {
  id: string;
  username: string;
  team_name: string;
  badge_id: string;
  xp: number;
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
        .select('id, username, team_name, badge_id, xp')
        .order('xp', { ascending: false })
        .limit(50);

      if (data) setLeaders(data);
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-4 lg:px-6 py-4 text-[9px] uppercase tracking-widest text-muted font-bold">Pos</th>
                  <th className="px-4 lg:px-6 py-4 text-[9px] uppercase tracking-widest text-muted font-bold">Manager / Team</th>
                  <th className="px-4 lg:px-6 py-4 text-[9px] uppercase tracking-widest text-muted font-bold text-right">XP</th>
                  <th className="px-4 lg:px-6 py-4 text-[9px] uppercase tracking-widest text-muted font-bold text-right">Livello</th>
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
                        <td className="px-4 lg:px-6 py-5">
                          <div className={`text-base lg:text-lg font-black ${
                            idx === 0 ? "text-accent" : 
                            idx === 1 ? "text-slate-300" :
                            idx === 2 ? "text-amber-600" : "text-muted"
                          }`}>
                            #{idx + 1}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-5">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-accent/20 flex items-center justify-center text-lg lg:text-xl shrink-0"
                              style={{ background: isCurrentUser ? 'rgba(251,191,36,0.3)' : '' }}>
                              {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🛡️"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black italic uppercase text-[10px] lg:text-xs flex items-center gap-2 truncate">
                                {entry.team_name}
                                {isCurrentUser && (
                                  <span className="text-[8px] bg-accent px-1.5 py-0.5 rounded text-black uppercase font-black shrink-0">TE</span>
                                )}
                              </div>
                              <div className="text-[9px] lg:text-[10px] text-muted font-bold truncate">@{entry.username.split('@')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-5 text-right font-mono font-black text-white text-xs lg:text-sm">
                          {entry.xp.toLocaleString()}
                        </td>
                        <td className="px-4 lg:px-6 py-5 text-right">
                          <div className="inline-flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg border border-accent/20 bg-accent/5 text-accent text-[10px] lg:text-xs font-black italic">
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
