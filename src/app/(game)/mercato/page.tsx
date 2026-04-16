"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { PlayerCard } from "@/components/ui/player-card";
import { supabase } from "@/lib/supabase/client";

export default function MercatoPage() {
  const { currency, buyPlayer, ownedPlayers } = useGameStore();
  const [marketPlayers, setMarketPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarket() {
      // For MVP, if market is empty, we populate it with some starter players
      const { data } = await supabase.from('market_players').select('*');
      
      if (data && data.length > 0) {
        setMarketPlayers(data);
      } else {
        // Mock market data if DB is fresh
        const mockMarket = STARTER_PLAYERS.map(p => ({
          player_id: p.id,
          cost: Math.floor(Math.random() * 500) + 200,
          base_level: 1
        }));
        setMarketPlayers(mockMarket);
      }
      setLoading(false);
    }
    fetchMarket();
  }, []);

  const handleBuy = async (player: any) => {
    if (currency < player.cost) return;
    const ok = await buyPlayer(player.player_id, player.cost);
    if (ok) {
      setNotification(`✅ Acquistato: ${player.player_id}!`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const isOwned = (pid: string) => ownedPlayers.some(p => p.player_id === pid);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="relative px-8 pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-accent/5 blur-[120px] rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-[10px] uppercase tracking-[0.2em] font-black mb-4">
              ⚽ Mercato Trasferimenti
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Transfer Market</h1>
            <p className="text-muted text-sm mt-2">Acquista nuovi talenti e vendi le tue riserve per costruire il team perfetto.</p>
          </div>
          <div className="card px-8 py-4 border-accent/40 bg-accent/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
            <div className="text-[10px] text-muted uppercase font-black mb-1">Budget Disponibile</div>
            <div className="text-3xl font-black italic text-accent">{currency.toLocaleString()} CR</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-success/20 border border-success/40 text-success px-6 py-3 rounded-2xl font-bold shadow-xl animate-in fade-in slide-in-from-top-4">
          {notification}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-48 animate-pulse bg-white/5 border-white/5"></div>
            ))
          ) : (
            marketPlayers.map((item, idx) => {
              const base = STARTER_PLAYERS.find(p => p.id === item.player_id);
              if (!base) return null;
              const owned = isOwned(item.player_id);

              return (
                <div key={idx} className={`relative group ${owned ? "opacity-60" : ""}`}>
                  <PlayerCard player={base} />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 backdrop-blur-sm rounded-[12px]">
                    {owned ? (
                      <div className="text-accent font-black uppercase text-xl italic tracking-tighter">GIA IN ROSA</div>
                    ) : (
                      <div className="w-full space-y-4 text-center">
                        <div className="text-3xl font-black italic text-white">{item.cost} <span className="text-xs font-normal">CR</span></div>
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={currency < item.cost}
                          className="w-full py-3 bg-accent text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Acquista Ora
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
