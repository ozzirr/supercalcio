"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { supabase } from "@/lib/supabase/client";
import { MarketHeader } from "@/components/market/MarketHeader";
import { MarketTabs } from "@/components/market/MarketTabs";
import { MarketToolbar } from "@/components/market/MarketToolbar";
import { MarketPlayerCard } from "@/components/market/MarketPlayerCard";

export default function MercatoPage() {
  const { currency, buyPlayer, sellPlayer, ownedPlayers } = useGameStore();
  const [marketPlayers, setMarketPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const isTransactionInProgress = useRef(false);

  // Filter & UI State
  const [activeTab, setActiveTab] = useState<"available" | "owned">("available");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating-desc");

  useEffect(() => {
    async function fetchMarket() {
      const { data } = await supabase.from('market_players').select('*');
      
      const fullMarket = STARTER_PLAYERS.map(p => {
        const dbRecord = data?.find((d: any) => d.player_id === p.id);
        return dbRecord || {
          player_id: p.id,
          cost: Math.floor(Math.random() * 500) + 200
        };
      });
      setMarketPlayers(fullMarket);
      setLoading(false);
    }
    fetchMarket();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = async (player: any) => {
    if (isTransactionInProgress.current) return;
    
    if (ownedPlayers.length >= 10) {
      showNotification(`⚠️ Roster pieno (Max 10 giocatori).`);
      return;
    }
    if (currency < player.cost) {
      showNotification(`⚠️ Crediti insufficienti.`);
      return;
    }
    
    isTransactionInProgress.current = true;
    setProcessingId(player.player_id);
    const ok = await buyPlayer(player.player_id, player.cost);
    setProcessingId(null);
    isTransactionInProgress.current = false;

    if (ok) {
      const base = STARTER_PLAYERS.find(p => p.id === player.player_id);
      showNotification(`✅ Acquistato: ${base?.name || player.player_id}!`);
    }
  };

  const handleSell = async (item: any, base: any) => {
    if (isTransactionInProgress.current) return;

    if (ownedPlayers.length <= 5) {
      showNotification(`⚠️ Devi avere almeno 5 giocatori.`);
      return;
    }
    const isGK = base.roleTags?.includes('goalkeeper') || base.archetype === 'keeper';
    if (isGK) {
      const ownedGKs = ownedPlayers.filter(op => {
        const bp = STARTER_PLAYERS.find(p => p.id === op.player_id);
        return bp?.roleTags?.includes('goalkeeper') || bp?.archetype === 'keeper';
      });
      if (ownedGKs.length <= 1) {
        showNotification(`⚠️ Devi avere almeno 1 portiere.`);
        return;
      }
    }
    
    isTransactionInProgress.current = true;
    setProcessingId(item.player_id);
    const refund = calculateRefund(item.player_id, item.cost);
    const ok = await sellPlayer(item.player_id, refund);
    setProcessingId(null);
    isTransactionInProgress.current = false;

    if (ok) {
      showNotification(`💰 Venduto: ${base.name} per ${refund} CR`);
    }
  };

  const calculateRefund = (pid: string, baseCost: number) => {
    return Math.floor(baseCost * 0.6);
  };

  const isOwned = (pid: string) => ownedPlayers.some(p => p.player_id === pid);

  // Derived & Filtered Lists
  const filteredPlayers = useMemo(() => {
    let list = marketPlayers.map(m => ({
      ...m,
      base: STARTER_PLAYERS.find(p => p.id === m.player_id),
      owned: isOwned(m.player_id)
    })).filter(p => p.base);

    // Tab Filtering
    if (activeTab === "available") {
      list = list.filter(p => !p.owned);
    } else {
      list = list.filter(p => p.owned);
    }

    // Role Filtering
    if (roleFilter !== "all") {
      list = list.filter(p => 
        p.base.archetype === roleFilter || 
        p.base.roleTags?.includes(roleFilter)
      );
    }

    // Search Filtering
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.base.name.toLowerCase().includes(q) || 
        p.base.id.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "price-asc") return a.cost - b.cost;
      if (sortBy === "price-desc") return b.cost - a.cost;
      if (sortBy === "name-asc") return a.base.name.localeCompare(b.base.name);
      return (b.base.rating || 0) - (a.base.rating || 0); // Default rating-desc
    });

    return list;
  }, [marketPlayers, ownedPlayers, activeTab, roleFilter, search, sortBy]);

  const counts = useMemo(() => {
    return {
      available: marketPlayers.filter(p => !isOwned(p.player_id)).length,
      owned: ownedPlayers.length
    };
  }, [marketPlayers, ownedPlayers]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <MarketHeader />

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-black/60 backdrop-blur-xl border border-accent/40 text-accent px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(251,191,36,0.3)] animate-in fade-in slide-in-from-top-8 text-xs">
          {notification}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
          {/* Controls Section */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <MarketTabs 
                activeTab={activeTab} 
                onChange={setActiveTab} 
                availableCount={counts.available}
                ownedCount={counts.owned}
              />
              <div className="text-[10px] text-muted font-black uppercase tracking-[0.2em] hidden lg:block">
                Visualizzazione <span className="text-foreground">{filteredPlayers.length}</span> Risultati
              </div>
            </div>

            <MarketToolbar 
              search={search}
              onSearchChange={setSearch}
              roleFilter={roleFilter}
              onRoleChange={setRoleFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {/* Player Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-[2rem] animate-pulse bg-white/5 border border-white/5" />
              ))
            ) : filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <MarketPlayerCard
                  key={player.player_id}
                  player={player.base}
                  marketData={player}
                  owned={player.owned}
                  canAfford={currency >= player.cost}
                  isProcessing={processingId === player.player_id}
                  onBuy={() => handleBuy(player)}
                  onSell={() => handleSell(player, player.base)}
                />
              ))
            ) : (
              <div className="col-span-full py-24 text-center space-y-4">
                <div className="text-5xl opacity-20">⚽</div>
                <h3 className="text-xl font-black uppercase text-muted tracking-widest">Nessun calciatore trovato</h3>
                <button 
                  onClick={() => { setSearch(""); setRoleFilter("all"); }}
                  className="text-accent text-xs font-black uppercase tracking-widest border-b border-accent/20 hover:border-accent transition-all"
                >
                  Resetta Filtri
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
