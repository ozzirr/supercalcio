"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    saveSquad
  } = useGameStore();

  const router = useRouter();

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDefinition | null>(null);
  const [modalPlayer, setModalPlayer] = useState<PlayerDefinition | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [dragSource, setDragSource] = useState<number | null>(null);

  const validation = validateSquad(lineup, availablePlayers);
  const assignedIds = new Set(lineup.map((s) => s.playerId));

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
          <h2 className="text-[10px] lg:text-sm font-black uppercase tracking-[0.2em] text-muted">Manager Roster</h2>
          <span className="text-[10px] text-accent font-bold uppercase">{availablePlayers.length} Players</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2 bg-black/20">
          {availablePlayers.map((player) => {
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
          })}
        </div>
      </div>

      {/* Center: Lineup + Playstyle */}
      <div className="order-1 lg:order-2 flex-1 flex flex-col overflow-y-auto bg-surface/30">
        <div className="p-6 lg:p-8 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Squad <span className="text-accent">Builder</span></h1>
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={autoFillLineup} className="btn-secondary text-[10px] py-2 px-4 rounded-xl font-black uppercase tracking-widest">
              Auto-Fill
            </button>
            {lineup.length > 0 && (
              <button onClick={clearLineup} className="btn-secondary text-[10px] py-2 px-4 rounded-xl font-black uppercase tracking-widest text-danger border-danger/30">
                Clear
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
              Start Match
            </button>
          </div>
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
                            <img src={`/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" />
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
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Team Playstyle</h2>
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

          {/* Team Summary — compact HUD bar */}
          <div className="pb-10 lg:pb-0">
            <TeamSummary players={squadPlayers} />
          </div>
        </div>
      </div>

      {/* Right panel: Player details (Hidden on smallest mobile unless selected) */}
      {selectedPlayer && (
        <div className="order-3 w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-surface shrink-0 p-6 lg:p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Dettaglio Calciatore</h2>
            <button onClick={() => setSelectedPlayer(null)} className="lg:hidden text-muted">✕</button>
          </div>
          <div className="space-y-6">
            <PlayerCard player={selectedPlayer} />
            <div className="flex flex-col gap-3">
              {!assignedIds.has(selectedPlayer.id) ? (
                <button
                  onClick={() => handleAssign(selectedPlayer)}
                  className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-accent/20"
                >
                  {activeSlot !== null ? `Assegna a ${POSITION_LABELS[activeSlot]}` : "Aggiungi al Team"}
                </button>
              ) : (
                <div className="w-full text-center p-4 rounded-xl bg-accent/10 border border-accent/20">
                   <div className="text-[10px] text-accent font-black uppercase tracking-widest">Giocatore in Rosa</div>
                </div>
              )}
              <button
                onClick={() => setModalPlayer(selectedPlayer)}
                className="btn-secondary w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl"
              >
                Visuale Premium
              </button>
            </div>
          </div>
        </div>
      )}
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
          assignLabel={activeSlot !== null ? `Assign to ${POSITION_LABELS[activeSlot]}` : "Add to Squad"}
          isAssigned={assignedIds.has(modalPlayer.id)}
        />
      )}
    </div>
  );
}
