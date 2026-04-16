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
      
      const fullMarket = STARTER_PLAYERS.map(p => {
        const dbRecord = data?.find((d: any) => d.player_id === p.id);
        return dbRecord || {
          player_id: p.id,
          cost: Math.floor(Math.random() * 500) + 200,
          base_level: 1
        };
      });
      setMarketPlayers(fullMarket);
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

  const handleSell = async (item: any, base: any) => {
    if (ownedPlayers.length <= 5) {
      setNotification(`⚠️ Impossibile vendere: devi avere almeno 5 giocatori.`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    const isGK = base.roleTags.includes('goalkeeper');
    if (isGK) {
      const ownedGKs = ownedPlayers.filter(op => {
        const bp = STARTER_PLAYERS.find(p => p.id === op.player_id);
        return bp?.roleTags.includes('goalkeeper');
      });
      if (ownedGKs.length <= 1) {
        setNotification(`⚠️ Impossibile vendere: devi avere almeno 1 portiere.`);
        setTimeout(() => setNotification(null), 3000);
        return;
      }
    }

    const refund = Math.floor(item.cost * 0.6);
    const ok = await useGameStore.getState().sellPlayer(item.player_id, refund);
    if (ok) {
      setNotification(`💰 Venduto: ${base.name} per ${refund} CR`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const isOwned = (pid: string) => ownedPlayers.some(p => p.player_id === pid);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="relative px-4 lg:px-8 pt-8 lg:pt-12 pb-6 lg:pb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[300px] lg:w-[600px] h-[150px] lg:h-[300px] bg-accent/5 blur-[120px] rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-[8px] lg:text-[10px] uppercase tracking-[0.2em] font-black mb-3 lg:mb-4">
              ⚽ Mercato Trasferimenti
            </div>
            <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none">Transfer Market</h1>
            <p className="text-muted text-[10px] lg:text-sm mt-2 max-w-md mx-auto lg:mx-0">Acquista nuovi talenti e vendi le tue riserve per costruire il team perfetto.</p>
          </div>
          <div className="card px-6 lg:px-8 py-3 lg:py-4 border-accent/40 bg-accent/5 shadow-[0_0_30px_rgba(251,191,36,0.1)] text-center lg:text-left">
            <div className="text-[8px] lg:text-[10px] text-muted uppercase font-black mb-0.5 lg:mb-1">Budget Disponibile</div>
            <div className="text-xl lg:text-3xl font-black italic text-accent">{currency.toLocaleString()} CR</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-success/20 border border-success/40 text-success px-6 py-3 rounded-2xl font-bold shadow-xl animate-in fade-in slide-in-from-top-4 text-xs lg:text-sm">
          {notification}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
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
                  
                  <div className={`absolute inset-0 bg-black/60 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 backdrop-blur-sm rounded-[12px] ${owned ? "lg:opacity-100" : ""}`}>
                    {owned ? (
                      <div className="w-full space-y-3 lg:space-y-4 text-center">
                        <div className="text-accent font-black uppercase text-base lg:text-xl italic tracking-tighter">GIA IN ROSA</div>
                        <button
                          onClick={() => handleSell(item, base)}
                          className="w-full py-2 bg-danger/20 text-danger border border-danger/40 font-black uppercase text-[10px] lg:text-xs tracking-widest rounded-xl hover:bg-danger/30 transition-all shadow-lg"
                        >
                          Vendi: +{Math.floor(item.cost * 0.6)} CR
                        </button>
                      </div>
                    ) : (
                      <div className="w-full space-y-3 lg:space-y-4 text-center">
                        <div className="text-xl lg:text-3xl font-black italic text-white">{item.cost} <span className="text-[10px] lg:text-xs font-normal">CR</span></div>
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={currency < item.cost}
                          className="w-full py-2.5 lg:py-3 bg-accent text-black font-black uppercase text-[10px] lg:text-xs tracking-widest rounded-xl hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
