"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useGameStore } from "@/lib/store/game-store";

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
      {/* Header */}
      <div className="relative px-8 pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[200px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs uppercase tracking-widest font-semibold mb-3">
            🏆 Hall of Fame
          </div>
          <h1 className="text-3xl font-black">Classifica Globale</h1>
          <p className="text-muted text-sm mt-1">I migliori manager di Supercalcio nel mondo.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 pb-16">
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Pos</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted font-bold">Manager / Team</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted font-bold text-right">XP</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-muted font-bold text-right">Livello</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 w-4 bg-white/10 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-48 bg-white/10 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-12 bg-white/10 rounded ml-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-8 bg-white/10 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : leaders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted italic">Nessun dato registrato.</td>
                </tr>
              ) : (
                leaders.map((entry, idx) => {
                  const isCurrentUser = entry.id === user?.id;
                  const level = Math.floor(entry.xp / 100) + 1;
                  
                  return (
                    <tr 
                      key={entry.id} 
                      className={`group transition-colors ${isCurrentUser ? "bg-accent/10" : "hover:bg-white/5"}`}
                    >
                      <td className="px-6 py-5">
                        <div className={`text-lg font-black ${
                          idx === 0 ? "text-warning" : 
                          idx === 1 ? "text-slate-300" :
                          idx === 2 ? "text-amber-600" : "text-muted"
                        }`}>
                          #{idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl"
                            style={{ background: isCurrentUser ? 'rgba(99,102,241,0.3)' : '' }}>
                            {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🛡️"}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-2">
                              {entry.team_name}
                              {isCurrentUser && (
                                <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded text-white uppercase font-black">Tu</span>
                              )}
                            </div>
                            <div className="text-xs text-muted">@{entry.username.split('@')[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-bold text-foreground">
                        {entry.xp.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-black">
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
  );
}
