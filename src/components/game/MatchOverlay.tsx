"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { EventBus } from "@/game/EventBus";

const PhaserGame = dynamic(() => import("./PhaserGame"), { ssr: false });

export function MatchOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const matchInProgress = useGameStore(s => s.matchInProgress);
  const matchFinished = useGameStore(s => s.matchFinished);
  const matchTick = useGameStore(s => s.matchTick);
  const matchScore = useGameStore(s => s.matchScore);
  const opponentInfo = useGameStore(s => s.opponentInfo);
  const stopGlobalMatch = useGameStore(s => s.stopGlobalMatch);
  
  const isMatchPage = pathname === "/match";
  const [isDismissed, setIsDismissed] = useState(false);
  const shouldShow = (matchInProgress || matchFinished) && !isDismissed;

  // Reset dismissal when a new match starts
  useEffect(() => {
    if (matchInProgress) setIsDismissed(false);
  }, [matchInProgress]);

  // Dragging logic for PiP
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMatchPage) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = Math.abs(e.clientX - (dragStartRef.current.x + pos.x));
      const dy = Math.abs(e.clientY - (dragStartRef.current.y + pos.y));
      if (dx > 5 || dy > 5) hasMovedRef.current = true;

      setPos({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handlePiPClick = () => {
    if (isMatchPage || hasMovedRef.current) return;
    router.push("/match");
  };

  if (!shouldShow) return null;

  // If we are ON the match page, we render the game in a specific way or not at all (if the page renders it)
  // ARCHITECTURE CHOICE: To keep Phaser persistent, it MUST stay in this overlay.
  // So the /match page will be empty of PhaserGame, and this overlay will expand to fill the container there.

  return (
    <div 
      className={`fixed z-[200] transition-all duration-300 ${
        isMatchPage 
          ? "inset-0 top-[57px] right-auto lg:right-[384px] pointer-events-none" 
          : "w-64 h-40 rounded-2xl border-2 border-accent/30 bg-black shadow-2xl overflow-hidden cursor-pointer hover:border-accent hover:scale-[1.02] active:scale-[0.98]"
      }`}
      style={!isMatchPage ? {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transition: isDragging ? "none" : "all 0.3s ease"
      } : {}}
      onMouseDown={handleMouseDown}
      onClick={handlePiPClick}
    >
      {/* PiP Header (Score & Time) */}
      {!isMatchPage && (
        <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
           <div className={`text-[10px] font-black text-white tabular-nums px-2 py-0.5 rounded border border-white/10 ${matchFinished ? "bg-rose-600/80 border-rose-400/50 animate-pulse" : "bg-black/50"}`}>
              {matchFinished ? "FINITA" : `${matchTick}'`}
           </div>
           <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-accent text-black font-black text-[10px] italic">
                {matchScore.home} - {matchScore.away}
             </div>
             {matchFinished && (
               <button 
                onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
               >
                 ✕
               </button>
             )}
           </div>
        </div>
      )}

      {/* Phaser Game Instance */}
      <div className={`w-full h-full ${isMatchPage ? "pointer-events-auto" : ""}`}>
         <PhaserGame />
      </div>

      {/* Draggable overlay hint */}
      {!isMatchPage && isDragging && (
        <div className="absolute inset-0 bg-accent/10 border-2 border-accent animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
