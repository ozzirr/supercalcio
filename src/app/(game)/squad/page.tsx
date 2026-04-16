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
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel: Roster */}
      <div className="w-72 border-r border-border flex flex-col">
        <div className="p-4 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Roster</h2>
          <span className="text-xs text-muted">{availablePlayers.length} players</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
          {availablePlayers.map((player) => {
            const inSquad = assignedIds.has(player.id);
            return (
              <div key={player.id} className="relative">
                {inSquad && (
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-success text-[10px]">&#10003;</span>
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
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 pb-0 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Squad Builder</h1>
          <div className="flex items-center gap-3">
            <button onClick={autoFillLineup} className="btn-secondary text-sm py-2 px-4">
              Auto-Fill
            </button>
            {lineup.length > 0 && (
              <button onClick={clearLineup} className="btn-secondary text-sm py-2 px-4 text-danger border-danger/30 hover:border-danger/60">
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
              className={`btn-primary text-sm ${!validation.valid ? "opacity-40 pointer-events-none" : ""}`}
            >
              Start Match
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Lineup slots */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Lineup
              {activeSlot !== null && (
                <span className="ml-2 text-accent normal-case">
                  — Select a player or click another slot to swap
                </span>
              )}
            </div>
            <div className="grid grid-cols-5 gap-4">
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
                    className={`card card-hover p-4 text-center min-h-[140px] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                      isActive ? "border-accent ring-1 ring-accent/30" : ""
                    } ${isDragTarget ? "border-dashed border-accent/40" : ""} ${
                      player ? "" : "border-dashed"
                    }`}
                  >
                    {player ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xl relative overflow-hidden">
                          {player.portrait ? (
                            <img src={`/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover relative" />
                          ) : (
                            player.name[0]
                          )}
                          <button
                            onClick={(e) => handleSlotRemove(i, e)}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger/80 text-white text-[10px] flex items-center justify-center hover:bg-danger transition-colors"
                          >
                            &times;
                          </button>
                        </div>
                        <div className="font-semibold text-sm">{player.name}</div>
                        <div className="text-xs text-muted capitalize">{player.roleTags[0]}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalPlayer(player);
                          }}
                          className="text-[10px] text-accent hover:text-accent-hover mt-1 transition-colors"
                        >
                          Details
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted text-lg">
                          +
                        </div>
                        <div className="text-xs text-muted font-medium">{POSITION_LABELS[i]}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation */}
          {!validation.valid && lineup.length > 0 && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
              {validation.errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}

          {/* Playstyle selection */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Team Playstyle</h2>
            <div className="grid grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Right panel: Player detail + Team summary */}
      <div className="w-80 border-l border-border flex flex-col overflow-y-auto">
        {/* Team summary */}
        <div className="p-4 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Team Summary</h2>
          <TeamSummary players={squadPlayers} />
        </div>

        {/* Selected player */}
        <div className="flex-1 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            {selectedPlayer ? "Selected Player" : "Player Details"}
          </h2>
          {selectedPlayer ? (
            <div className="space-y-3">
              <PlayerCard player={selectedPlayer} />
              <div className="flex gap-2">
                {!assignedIds.has(selectedPlayer.id) ? (
                  <button
                    onClick={() => handleAssign(selectedPlayer)}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    {activeSlot !== null ? `Assign to ${POSITION_LABELS[activeSlot]}` : "Add to Squad"}
                  </button>
                ) : (
                  <span className="flex-1 text-center text-xs text-success py-2">In Squad</span>
                )}
                <button
                  onClick={() => setModalPlayer(selectedPlayer)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Full View
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted text-sm">
              Select a player to view details
            </div>
          )}
        </div>
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
          assignLabel={activeSlot !== null ? `Assign to ${POSITION_LABELS[activeSlot]}` : "Add to Squad"}
          isAssigned={assignedIds.has(modalPlayer.id)}
        />
      )}
    </div>
  );
}
