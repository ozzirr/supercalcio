"use client";

import { motion } from "framer-motion";

interface TacticalPanelProps {
  stance: "balanced" | "aggressive" | "defensive";
  command: "none" | "focus_attack" | "protect_lead";
  ultimateReady: boolean;
  ultimateCharge: number;
  matchInProgress: boolean;
  onStanceChange: (s: "balanced" | "aggressive" | "defensive") => void;
  onCommandChange: (c: "none" | "focus_attack" | "protect_lead") => void;
  onActivateUltimate: () => void;
}

export function TacticalPanel({
  stance,
  command,
  ultimateReady,
  ultimateCharge,
  matchInProgress,
  onStanceChange,
  onCommandChange,
  onActivateUltimate,
}: TacticalPanelProps) {
  return (
    <div className="p-6 space-y-8 bg-[#0a0c14] border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      {/* Stance Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">TEAM STANCE</span>
          <span className="text-[9px] text-accent font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20 uppercase">
            {stance}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["defensive", "balanced", "aggressive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStanceChange(s)}
              disabled={!matchInProgress}
              className={`relative py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden border group ${
                stance === s
                  ? "bg-accent text-black border-accent shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                  : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:text-foreground disabled:opacity-20"
              }`}
            >
              {stance === s && (
                <motion.div 
                  layoutId="active-stance-glow"
                  className="absolute inset-0 bg-white/20 animate-pulse" 
                />
              )}
              <span className="relative z-10">
                {s === "balanced" ? "BAL" : s === "aggressive" ? "ATK" : "DEF"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Command Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">TACTICAL OVERRIDE</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["none", "focus_attack", "protect_lead"] as const).map((c) => (
            <button
              key={c}
              onClick={() => onCommandChange(c)}
              disabled={!matchInProgress}
              className={`relative py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border group ${
                command === c
                  ? "bg-white/10 text-accent border-accent/40 shadow-xl"
                  : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:text-foreground disabled:opacity-20"
              } ${c === "none" ? "col-span-2" : ""}`}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                 <span className="text-[8px] opacity-60 font-bold">
                    {c === "none" ? "STANDARD" : c === "focus_attack" ? "OFFENSIVE" : "DEFENSIVE"}
                 </span>
                 <span className="text-[10px]">
                    {c === "none" ? "NESSUN COMANDO" : c === "focus_attack" ? "TUTTI AVANTI" : "BLINDATA"}
                 </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ultimate Meter */}
      <div className="pt-2">
        <button 
          onClick={() => ultimateReady && onActivateUltimate()}
          disabled={!matchInProgress || !ultimateReady}
          className={`w-full group relative h-16 rounded-2xl transition-all duration-500 overflow-hidden border-2 ${
            ultimateReady 
              ? "bg-accent border-white cursor-pointer shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-[1.02] active:scale-[0.98]" 
              : "bg-black/40 border-white/5 cursor-not-allowed"
          }`}
        >
          {/* Progress fill */}
          <motion.div 
            className={`absolute inset-y-0 left-0 ${ultimateReady ? "bg-white/30" : "bg-accent/20"}`}
            initial={{ width: 0 }}
            animate={{ width: `${ultimateCharge}%` }}
          />

          {/* Animated Glow on Ready */}
          {ultimateReady && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-[11px] font-black uppercase tracking-[0.4em] mb-1 ${ultimateReady ? "text-black" : "text-accent"}`}>
              {ultimateReady ? "⚡ ACTIVATE ULTIMATE" : "ULTIMATE CHARGE"}
            </span>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-1 rounded-full transition-all duration-300 ${
                    (i + 1) * 10 <= ultimateCharge 
                      ? (ultimateReady ? "bg-black" : "bg-accent") 
                      : "bg-white/5"
                  }`}
                />
              ))}
            </div>
          </div>
        </button>
        <p className="mt-3 text-center text-[8px] text-muted font-bold uppercase tracking-[0.2em] opacity-40">
           L'ultimate potenzia tutti gli attributi per 10 minuti di gioco
        </p>
      </div>
    </div>
  );
}
