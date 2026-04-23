"use client";

import { use, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { StatBar } from "@/components/ui/stat-bar";
import { useRouter } from "next/navigation";

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { ownedPlayers, upgradePlayer, currency } = useGameStore();

  const playerBase = STARTER_PLAYERS.find(p => p.id === id);
  const userRecord = ownedPlayers.find(p => p.player_id === id);

  if (!playerBase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="text-2xl font-bold mb-4 text-muted">Giocatore non trovato nel database</div>
        <button onClick={() => router.push("/mercato")} className="btn-primary">Torna al Mercato</button>
      </div>
    );
  }

  const isOwned = !!userRecord;

  const bonuses = userRecord?.stats_bonus || {};
  const currentLevel = userRecord?.level || 1;
  const upgradeCost = currentLevel * 50;

  const handleUpgrade = async (stat: string) => {
    if (currency < upgradeCost) return;
    await upgradePlayer(id, stat, upgradeCost);
  };

  const displayStats = {
    pace: playerBase.stats.pace + (bonuses.pace || 0),
    shooting: playerBase.stats.shooting + (bonuses.shooting || 0),
    passing: playerBase.stats.passing + (bonuses.passing || 0),
    defense: playerBase.stats.defense + (bonuses.defense || 0),
    physical: playerBase.stats.physical + (bonuses.physical || 0),
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <button onClick={() => router.back()} className="text-muted hover:text-accent mb-8 flex items-center gap-2 transition-colors">
        ← Indietro
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left: Huge Player Card (KL Style) */}
        <div className="relative group perspective-1000">
          <div className="relative z-10 card p-0 overflow-hidden border-2 border-accent/40 shadow-[0_0_50px_rgba(251,191,36,0.15)] transition-all group-hover:shadow-[0_0_70px_rgba(251,191,36,0.25)]">
            <div className="relative aspect-[3/4]">
              <img src={`/assets/portraits/${playerBase.portrait}.png`} alt={playerBase.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              
              {/* Overlay Stats */}
              <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-accent font-black text-5xl uppercase italic tracking-tighter">{playerBase.name}</div>
                    <div className="text-muted uppercase tracking-widest text-sm font-bold">{playerBase.roleTags[0]} — LEVEL {currentLevel}</div>
                  </div>
                  <div className="text-6xl font-black italic text-accent opacity-50">#10</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Holographic reflection effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-white/5 to-accent/20 blur-xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
        </div>

        {/* Right: Upgrades & Details */}
        <div className="space-y-8 py-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2 italic">
              {isOwned ? "Prestazioni" : "Rapporto Scout"}
            </h2>
            <p className="text-muted">
              {isOwned ? "Potenzia il tuo campione utilizzando i Credits." : "Esamina i parametri del campione prima di acquistarlo sul Mercato."}
            </p>
          </div>

          <div className="grid gap-6">
            {Object.entries(displayStats).map(([stat, value]) => (
              <div key={stat} className="card p-6 flex flex-col gap-4 border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-black text-accent text-xl uppercase italic">
                      {stat.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-sm uppercase tracking-widest font-bold text-white mb-1">{stat}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted">Base {playerBase.stats[stat as keyof typeof playerBase.stats]}</span>
                        <span className="text-success">+{bonuses[stat] || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-4xl font-black italic text-white">{value}</div>
                </div>
                
                <StatBar value={value} label={stat} />

                {isOwned ? (
                  <button
                    onClick={() => handleUpgrade(stat)}
                    disabled={currency < upgradeCost}
                    className="w-full mt-2 py-3 bg-accent text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    UPGRADE (+1) — {upgradeCost} CR
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full mt-2 py-3 bg-white/5 text-muted border border-white/10 font-black uppercase text-xs tracking-widest rounded-xl disabled:cursor-not-allowed transition-all"
                  >
                    ACQUISTA PER POTENZIARE
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="card p-6 border-accent/20 bg-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted font-bold mb-1">Saldo Attuale</div>
                <div className="text-2xl font-black text-accent italic">{currency.toLocaleString()} CR</div>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
