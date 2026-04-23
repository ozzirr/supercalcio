"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";
import { PlayerCard } from "@/components/ui/player-card";
import { PlayerDetailModal } from "@/components/squad/player-detail-modal";
import { PlaystyleCard } from "@/components/squad/playstyle-card";
import { TeamSummary } from "@/components/squad/team-summary";
import { PLAYSTYLES } from "@/content/playstyles";
import { validateSquad } from "@/types/squad";
import type { PlayerDefinition } from "@/types/player";

const POSITION_LABELS = ["GK", "DEF", "MID", "ATK", "FLEX"];

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
    resetRoster
  } = useGameStore();

  const router = useRouter();

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDefinition | null>(null);
  const [modalPlayer, setModalPlayer] = useState<PlayerDefinition | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [dragSource, setDragSource] = useState<number | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedPlayers, setRevealedPlayers] = useState<PlayerDefinition[] | null>(null);
  const searchParams = useSearchParams();

  // Auto-claim starter pack if redirection came from onboarding
  useEffect(() => {
    if (searchParams.get("claim") === "true" && availablePlayers.length === 0 && !isOpening) {
      handleOpenPack();
      // Remove query param without refreshing to avoid re-triggering on reload
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
    // Simulate opening delay
    setTimeout(async () => {
      const players = await claimStarterPack();
      setIsOpening(false);
      if (players && players.length > 0) {
        setRevealedPlayers(players);
      }
    }, 2000);
  }

  const squadPlayers = lineup
    .sort((a, b) => a.position - b.position)
    .map((s) => availablePlayers.find((p) => p.id === s.playerId))
    .filter((p): p is PlayerDefinition => p !== undefined);

  function handleAssign(player: PlayerDefinition) {
    if (activeSlot !== null) {
      addToLineup(player.id, activeSlot);
      setActiveSlot(null);
      setSelectedPlayer(null);
    } else {
      // Find first empty slot
      for (let i = 0; i < 5; i++) {
        if (!lineup.find((s) => s.position === i)) {
          addToLineup(player.id, i);
          return;
        }
      }
    }
  }

  function handleSlotClick(position: number) {
    const slot = lineup.find((s) => s.position === position);
    if (activeSlot !== null && activeSlot !== position) {
      // Swap or move
      swapLineupSlots(activeSlot, position);
      setActiveSlot(null);
    } else if (slot) {
      setActiveSlot(position);
      setSelectedPlayer(availablePlayers.find((p) => p.id === slot.playerId) ?? null);
    } else {
      setActiveSlot(activeSlot === position ? null : position);
    }
  }

  function handleSlotRemove(position: number, e: React.MouseEvent) {
    e.stopPropagation();
    removeFromLineup(position);
    if (activeSlot === position) setActiveSlot(null);
  }

  function handleDragStart(position: number) {
    setDragSource(position);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(position: number) {
    if (dragSource !== null && dragSource !== position) {
      swapLineupSlots(dragSource, position);
    }
    setDragSource(null);
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Left panel: Roster (Moved to bottom on mobile, side on desktop) */}
      <div className="order-2 lg:order-1 w-full lg:w-72 border-t lg:border-t-0 lg:border-r border-border flex flex-col h-1/2 lg:h-full">
        <div className="p-4 pb-2 flex items-center justify-between bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] lg:text-sm font-black uppercase tracking-[0.2em] text-muted">Manager Roster</h2>
            {availablePlayers.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm("Sei sicuro di voler resettare il roster? Tutti i giocatori e la formazione verranno eliminati.")) {
                    resetRoster();
                  }
                }}
                className="p-1 text-muted hover:text-danger hover:bg-danger/10 rounded transition-all"
                title="Resetta Roster"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-[10px] text-accent font-bold uppercase">{availablePlayers.length} Players</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2 bg-black/20">
          {availablePlayers.length > 0 ? (
            availablePlayers.map((player) => {
              const inSquad = assignedIds.has(player.id);
              return (
                <div key={player.id} className="relative">
                  {inSquad && (
                    <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center shadow-lg">
                      <span className="text-[10px] font-black">✓</span>
                    </div>
                  )}
                  <PlayerCard
                    player={player}
                    compact
                    selected={selectedPlayer?.id === player.id}
                    onClick={() => {
                      setSelectedPlayer(player);
                      if (activeSlot !== null && !inSquad) {
                        handleAssign(player);
                      }
                    }}
                  />
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
              <div className="text-4xl animate-bounce">📦</div>
              <div>
                <div className="text-[10px] font-black uppercase text-accent tracking-widest mb-1">Roster Vuoto</div>
                <div className="text-[9px] text-muted leading-tight uppercase font-bold">Non hai ancora ricevuto il tuo Starter Pack.</div>
              </div>
              <button 
                onClick={handleOpenPack}
                className="w-full py-3 bg-accent text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
              >
                Riscatta Starter Pack
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Lineup + Playstyle */}
      <div className="order-1 lg:order-2 flex-1 flex flex-col overflow-y-auto bg-surface/30">
        <div className="p-6 lg:p-8 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Squad <span className="text-accent">Builder</span></h1>
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={autoFillLineup} className="btn-secondary text-[10px] py-2 px-4 rounded-xl font-black uppercase tracking-widest">
              Auto-Completa
            </button>
            {lineup.length > 0 && (
              <button onClick={clearLineup} className="btn-secondary text-[10px] py-2 px-4 rounded-xl font-black uppercase tracking-widest text-danger border-danger/30">
                Svuota
              </button>
            )}
            <button
              onClick={async () => {
                if (validation.valid) {
                  await saveSquad();
                  router.push("/match");
                }
              }}
              disabled={!validation.valid}
              className={`btn-primary text-[10px] py-2 px-4 rounded-xl font-black uppercase tracking-widest ${!validation.valid ? "opacity-30 pointer-events-none" : "shadow-lg shadow-accent/20"}`}
            >
              Inizia Partita
            </button>
          </div>
        </div>

        {/* Team Summary - Moved to Top */}
        <div className="px-6 lg:px-8 mt-4 lg:mt-6">
           <TeamSummary players={squadPlayers} />
        </div>

        <div className="p-6 lg:p-8 space-y-8 lg:space-y-10">
          {/* Lineup slots */}
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted flex items-center justify-between">
              <span>Formazione 5v5</span>
              {activeSlot !== null && (
                <span className="text-accent animate-pulse">
                  Seleziona un giocatore
                </span>
              )}
            </div>
            
            {/* Responsive Lineup: 3 columns on mobile (wrapping), 5 on desktop */}
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {Array.from({ length: 5 }, (_, i) => {
                const slot = lineup.find((s) => s.position === i);
                const player = slot ? availablePlayers.find((p) => p.id === slot.playerId) : null;
                const isActive = activeSlot === i;
                const isDragTarget = dragSource !== null && dragSource !== i;

                return (
                  <div
                    key={i}
                    draggable={!!player}
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(i)}
                    onClick={() => handleSlotClick(i)}
                    className={`card p-2 lg:p-4 text-center min-h-[110px] lg:min-h-[140px] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                      isActive ? "border-accent ring-2 ring-accent/30 bg-accent/5 scale-[1.02]" : "border-white/5 bg-white/5"
                    } ${isDragTarget ? "border-dashed border-accent/40" : ""} ${
                      player ? "" : "border-dashed"
                    } ${i === 4 && "col-span-2 lg:col-span-1" /* Special treatment for 5th item on 3-col grid */}`}
                  >
                    {player ? (
                      <>
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl relative overflow-hidden ring-1 ring-accent/30 group-hover:ring-accent">
                          {player.portrait ? (
                            <img src={`/assets/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            player.name[0]
                          )}
                          <button
                            onClick={(e) => handleSlotRemove(i, e)}
                            className="absolute top-0 right-0 w-5 h-5 rounded-full bg-danger text-white text-[12px] flex items-center justify-center shadow-lg"
                          >
                            ×
                          </button>
                        </div>
                        <div className="font-black italic uppercase text-[10px] lg:text-[11px] tracking-tight truncate w-full px-1">{player.name}</div>
                        <div className="text-[8px] lg:text-[10px] text-muted font-bold uppercase tracking-widest">{POSITION_LABELS[i]}</div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-muted text-lg">
                          +
                        </div>
                        <div className="text-[9px] lg:text-[11px] text-muted font-black uppercase tracking-widest">{POSITION_LABELS[i]}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation */}
          {!validation.valid && lineup.length > 0 && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-[10px] lg:text-xs text-danger font-black uppercase tracking-widest">
              {validation.errors.map((e, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  {e}
                </div>
              ))}
            </div>
          )}

          {/* Playstyle selection */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Stile di Gioco</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              {PLAYSTYLES.map((ps) => (
                <PlaystyleCard
                  key={ps.id}
                  playstyle={ps}
                  selected={playstyle === ps.id}
                  onClick={() => setPlaystyle(ps.id)}
                />
              ))}
            </div>
          </div>

          {/* Team Summary removed from bottom */}
        </div>
      </div>

      {/* Right panel: Player details */}
      <div className={`order-3 w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-surface shrink-0 p-6 lg:p-4 overflow-y-auto transition-all ${!selectedPlayer && "hidden lg:block opacity-50"}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Dettaglio Calciatore</h2>
          {selectedPlayer && <button onClick={() => setSelectedPlayer(null)} className="lg:hidden text-muted">✕</button>}
        </div>
        
        {selectedPlayer ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <PlayerCard player={selectedPlayer} />
            
            {/* Ability / Skills Section */}
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-accent border-b border-accent/20 pb-2">Skills & Tattiche</div>
              
              <div className="italic text-[11px] text-muted leading-relaxed">
                "{selectedPlayer.flavorText}"
              </div>

              {/* Passive */}
              <div className="p-3 rounded-xl bg-surface-lighter border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase text-white tracking-widest">{selectedPlayer.passive.name}</div>
                  <div className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Passiva</div>
                </div>
                <div className="text-[10px] text-muted leading-snug">{selectedPlayer.passive.description}</div>
              </div>

              {/* Active */}
              <div className="p-3 rounded-xl bg-surface-lighter border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase text-white tracking-widest">{selectedPlayer.activeSkill.name}</div>
                  <div className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Attiva</div>
                </div>
                <div className="text-[10px] text-muted leading-snug">{selectedPlayer.activeSkill.description}</div>
              </div>

              {/* Ultimate */}
              <div className="p-3 rounded-xl bg-surface-lighter border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase text-white tracking-widest">{selectedPlayer.ultimate.name}</div>
                  <div className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Ultimate</div>
                </div>
                <div className="text-[10px] text-muted leading-snug">{selectedPlayer.ultimate.description}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {!assignedIds.has(selectedPlayer.id) && (
                <button
                  onClick={() => handleAssign(selectedPlayer)}
                  className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-accent/20"
                >
                  {activeSlot !== null ? `Assegna a ${POSITION_LABELS[activeSlot]}` : "Aggiungi al Team"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted/30">
            Nessun Giocatore Selezionato
          </div>
        )}
      </div>
      {/* Detail modal */}
      {modalPlayer && (
        <PlayerDetailModal
          player={modalPlayer}
          onClose={() => setModalPlayer(null)}
          onAssign={
            !assignedIds.has(modalPlayer.id)
              ? () => {
                  handleAssign(modalPlayer);
                  setModalPlayer(null);
                }
              : undefined
          }
          assignLabel={activeSlot !== null ? `Assegna a ${POSITION_LABELS[activeSlot]}` : "Aggiungi al Team"}
          isAssigned={assignedIds.has(modalPlayer.id)}
        />
      )}

      {/* Pack Opening Animation Overlay */}
      {isOpening && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-700">
           <div className="relative">
             <div className="w-56 h-72 lg:w-72 lg:h-96 bg-accent/20 border-4 border-accent border-dashed rounded-[32px] flex items-center justify-center animate-bounce shadow-[0_0_100px_rgba(251,191,36,0.3)]">
                <span className="text-8xl lg:text-9xl drop-shadow-2xl">📦</span>
             </div>
             <div className="absolute inset-x-0 -bottom-12 flex flex-col items-center">
                <div className="h-1 w-48 bg-accent/20 rounded-full overflow-hidden">
                   <div className="h-full bg-accent animate-progress w-full"></div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black uppercase italic text-accent mt-6 animate-pulse tracking-tighter">Preparazione Roster...</h2>
             </div>
           </div>
        </div>
      )}

      {/* Revealed Players Modal (Starter Pack Grid) */}
      {revealedPlayers && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl w-full py-12 animate-in zoom-in-95 fade-in duration-500">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-[10px] uppercase tracking-[0.3em] font-black mb-4">
                Starter Pack Sbloccato
              </div>
              <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-white">I TUOI <span className="text-accent underline decoration-4">CAMPIONI</span></h1>
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
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-accent transition-all shadow-xl group-hover:scale-[1.05] duration-300">
                       <img src={`/assets/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" />
                       <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
                          <div className="font-black uppercase italic text-[10px] lg:text-xs truncate text-white">{player.name}</div>
                          <div className="text-[8px] lg:text-[10px] text-accent font-black uppercase tracking-widest">{player.tier}</div>
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
    </div>
  );
}
