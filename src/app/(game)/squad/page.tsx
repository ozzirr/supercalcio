"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";

// Redesigned Components
import { RosterManagerPanel } from "@/components/squad/RosterManagerPanel";
import { SquadBuilderHeader } from "@/components/squad/SquadBuilderHeader";
import { TacticalPitch } from "@/components/squad/TacticalPitch";
import { PlayStyleSelector } from "@/components/squad/PlayStyleSelector";
import { PlayerDetailPanel } from "@/components/squad/PlayerDetailPanel";
import { SquadMobilePreview } from "@/components/squad/SquadMobilePreview";
import { PlayerDetailModal } from "@/components/squad/player-detail-modal";

import { PLAYSTYLES } from "@/content/playstyles";
import { validateSquad, type Playstyle } from "@/types/squad";
import type { PlayerDefinition } from "@/types/player";
import type { LineupSlot } from "@/types/squad";

export default function SquadPage() {
  const {
    availablePlayers,
    lineup,
    playstyle,
    addToLineup,
    removeFromLineup,
    swapLineupSlots,
    clearLineup,
    autoFillLineup,
    setPlaystyle,
    saveSquad,
    claimStarterPack,
    energyAmount
  } = useGameStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDefinition | null>(null);
  const [modalPlayer, setModalPlayer] = useState<PlayerDefinition | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedPlayers, setRevealedPlayers] = useState<PlayerDefinition[] | null>(null);

  // Auto-claim starter pack if redirection came from onboarding
  useEffect(() => {
    if (searchParams.get("claim") === "true" && availablePlayers.length === 0 && !isOpening) {
      handleOpenPack();
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    }
  }, [searchParams, availablePlayers.length]);

  // Auto-select first player if none selected
  useEffect(() => {
    if (!selectedPlayer && availablePlayers.length > 0) {
      setSelectedPlayer(availablePlayers[0]);
    }
  }, [availablePlayers, selectedPlayer]);

  useEffect(() => {
    const highlightedId = searchParams.get("highlight");
    if (!highlightedId || availablePlayers.length === 0) return;

    const highlightedPlayer = availablePlayers.find((player) => player.id === highlightedId);
    if (!highlightedPlayer) return;

    setSelectedPlayer(highlightedPlayer);
    const newUrl = window.location.pathname;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
  }, [availablePlayers, searchParams]);

  const validation = validateSquad(lineup, availablePlayers);
  const assignedIds = new Set(lineup.map((s) => s.playerId));

  async function handleOpenPack() {
    setIsOpening(true);
    setTimeout(async () => {
      const players = await claimStarterPack();
      setIsOpening(false);
      if (players && players.length > 0) {
        setRevealedPlayers(players);
      }
    }, 2000);
  }

  function handleAssign(player: PlayerDefinition) {
    if (activeSlot !== null) {
      addToLineup(player.id, activeSlot);
      setActiveSlot(null);
    } else {
      for (let i = 0; i < 5; i++) {
        if (!lineup.find((s) => s.position === i)) {
          addToLineup(player.id, i);
          return;
        }
      }
    }
  }

  const isReady = validation.valid && energyAmount > 0;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#05070a] relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-stadium-tactical opacity-[0.05] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-[radial-gradient(circle_at_50%_0%,_rgba(255,193,32,0.05)_0%,_transparent_70%)] pointer-events-none" />

      {/* 1. Roster Manager Panel (Left) */}
      <RosterManagerPanel 
        players={availablePlayers}
        selectedPlayerId={selectedPlayer?.id}
        assignedIds={assignedIds}
        onSelectPlayer={(player) => {
          setSelectedPlayer(player);
          if (activeSlot !== null && !assignedIds.has(player.id)) {
            handleAssign(player);
          }
        }}
      />

      {/* 2. Main Builder Area (Center) */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 px-8 py-8 lg:px-12 lg:py-10">
        <SquadBuilderHeader 
          power="2,840"
          ovr={78}
          chemistry={85}
        />

        <TacticalPitch 
          lineup={lineup}
          availablePlayers={availablePlayers}
          onSlotClick={(i) => {
            const slot = lineup.find(s => s.position === i);
            if (slot) {
              const player = availablePlayers.find(p => p.id === slot.playerId);
              if (player) setSelectedPlayer(player);
            }
            setActiveSlot(i);
          }}
          onSlotRemove={removeFromLineup}
          onAutoFill={autoFillLineup}
          onClear={clearLineup}
          onStartMatch={async () => {
             if (isReady) {
               await saveSquad();
               router.push("/match");
             }
          }}
          isReady={isReady}
        />

        <div className="mt-12 mb-20 space-y-12">
          {/* Validation Errors */}
          {!validation.valid && lineup.length > 0 && (
            <div className="p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-400">Errori Formazione</h3>
              </div>
              <ul className="space-y-2">
                {validation.errors.map((error, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-rose-200/60 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PlayStyleSelector 
            playstyles={PLAYSTYLES}
            selectedId={playstyle}
            onSelect={(id) => setPlaystyle(id as Playstyle)}
          />
        </div>
      </div>

      {/* 3. Player Detail Panel (Right) */}
      <PlayerDetailPanel 
        player={selectedPlayer}
        onReplace={() => {
           if (selectedPlayer) {
              const slot = lineup.find(s => s.playerId === selectedPlayer.id);
              if (slot) {
                 setActiveSlot(slot.position);
              }
           }
        }}
        onRemove={() => {
           if (selectedPlayer) {
              const slot = lineup.find(s => s.playerId === selectedPlayer.id);
              if (slot) removeFromLineup(slot.position);
           }
        }}
      />

      {/* 4. Mobile Preview (Far Right, Hidden on smaller screens) */}
      <SquadMobilePreview />

      {/* Detail Modal for Pack Reveal */}
      {modalPlayer && (
        <PlayerDetailModal
          player={modalPlayer}
          onClose={() => setModalPlayer(null)}
        />
      )}

      {/* Pack Opening Animation Overlay */}
      {isOpening && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-700">
           <div className="relative">
             <div className="w-56 h-72 lg:w-72 lg:h-96 bg-gold/20 border-4 border-gold border-dashed rounded-[32px] flex items-center justify-center animate-bounce shadow-[0_0_100px_rgba(251,191,36,0.3)]">
                <span className="text-8xl lg:text-9xl drop-shadow-2xl">📦</span>
             </div>
             <div className="absolute inset-x-0 -bottom-12 flex flex-col items-center">
                <div className="h-1 w-48 bg-gold/20 rounded-full overflow-hidden">
                   <div className="h-full bg-gold animate-progress w-full"></div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black uppercase italic text-gold mt-6 animate-pulse tracking-tighter">Preparazione Roster...</h2>
             </div>
           </div>
        </div>
      )}

      {/* Revealed Players Modal (Starter Pack Grid) */}
      {revealedPlayers && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl w-full py-12 animate-in zoom-in-95 fade-in duration-500">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-[10px] uppercase tracking-[0.3em] font-black mb-4">
                Starter Pack Sbloccato
              </div>
              <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-white">I TUOI <span className="text-gold underline decoration-4">CAMPIONI</span></h1>
              <p className="text-muted text-xs lg:text-sm mt-4 uppercase tracking-widest font-bold">Questi sono i primi 7 guerrieri del tuo impero.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
              {revealedPlayers.map((player, idx) => (
                <div 
                  key={player.id} 
                  onClick={() => setModalPlayer(player)}
                  className="animate-in slide-in-from-bottom-8 fade-in flex-1 cursor-pointer group"
                  style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-gold transition-all shadow-xl group-hover:scale-[1.05] duration-300">
                       <img src={`/assets/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" />
                       <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
                          <div className="font-black uppercase italic text-[10px] lg:text-xs truncate text-white">{player.name}</div>
                          <div className="text-[8px] lg:text-[10px] text-gold font-black uppercase tracking-widest">{player.tier}</div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => {
                  setRevealedPlayers(null);
                  autoFillLineup();
                }}
                className="btn-primary px-12 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(251,191,36,0.2)] hover:scale-105 active:scale-95 transition-all"
              >
                Inizia la Scalata →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Vignette */}
      <div className="fixed inset-0 vignette-overlay z-0 pointer-events-none" />
    </div>
  );
}
