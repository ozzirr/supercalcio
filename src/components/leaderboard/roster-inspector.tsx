"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { STARTER_PLAYERS } from "@/content/players";
import { PlayerCard } from "../ui/player-card";

type RosterInspectorProps = {
  userId: string;
  onClose: () => void;
};

export function RosterInspector({ userId, onClose }: RosterInspectorProps) {
  const [squad, setSquad] = useState<any>(null);
  const [ownedPlayers, setOwnedPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoster() {
      if (!supabase) return;
      
      const { data: squadData } = await supabase
        .from('squads')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const { data: playersData } = await supabase
        .from('user_players')
        .select('*')
        .eq('user_id', userId);
      
      setSquad(squadData);
      setOwnedPlayers(playersData || []);
      setLoading(false);
    }
    fetchRoster();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="animate-pulse text-accent animate-bounce">⚽ Caricamento Roster...</div>
      </div>
    );
  }

  const lineupPlayers = squad?.lineup || [];
  const roster = lineupPlayers.map((slot: any) => {
    const base = STARTER_PLAYERS.find(p => p.id === slot.playerId);
    const userRecord = ownedPlayers.find(p => p.player_id === slot.playerId);
    return { base, userRecord };
  }).filter((item: any) => item.base);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="card w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto space-y-8 border-accent/20 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white text-2xl">✕</button>
        
        <div className="text-center border-b border-white/5 pb-6">
          <div className="text-[10px] uppercase font-black tracking-[0.2em] text-accent mb-2">Team Inspector</div>
          <h2 className="text-3xl font-black italic uppercase italic tracking-tighter">
            Analisi <span className="text-white">Formazione</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {roster.map((item: any, idx: number) => {
            // Apply bonuses to a temporary cloned player object for display
            const bonuses = item.userRecord?.stats_bonus || {};
            const displayPlayer = {
              ...item.base,
              stats: {
                pace: item.base.stats.pace + (bonuses.pace || 0),
                shooting: item.base.stats.shooting + (bonuses.shooting || 0),
                passing: item.base.stats.passing + (bonuses.passing || 0),
                defense: item.base.stats.defense + (bonuses.defense || 0),
                physical: item.base.stats.physical + (bonuses.physical || 0),
              }
            };

            return (
              <div key={idx} className="space-y-3">
                <div className="text-[9px] font-black uppercase text-accent text-center bg-accent/10 py-1 rounded">
                  POS {idx + 1} • LVL {item.userRecord?.level || 1}
                </div>
                <PlayerCard player={displayPlayer} compact />
                <div className="text-[8px] text-muted space-y-1 px-1">
                  {Object.entries(bonuses).map(([stat, val]: [any, any]) => (
                    <div key={stat} className="flex justify-between">
                      <span className="uppercase">{stat}</span>
                      <span className="text-success">+{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {roster.length === 0 && (
          <div className="text-center text-muted italic py-12">Il manager non ha ancora schierato una formazione.</div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div className="card p-4 bg-white/5 border-white/10">
            <div className="text-[10px] uppercase font-black text-muted mb-1">Playstyle Scelto</div>
            <div className="text-lg font-black italic text-accent uppercase tracking-tight">{squad?.playstyle || "Balanced"}</div>
          </div>
          <div className="card p-4 bg-white/5 border-white/10">
            <div className="text-[10px] uppercase font-black text-muted mb-1">Collezione Totale</div>
            <div className="text-lg font-black italic text-white uppercase tracking-tight">{ownedPlayers.length} Calciatori</div>
          </div>
        </div>
      </div>
    </div>
  );
}
