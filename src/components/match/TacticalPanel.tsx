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
  matchInProgress,
  onStanceChange,
  onCommandChange,
}: Omit<TacticalPanelProps, "ultimateReady" | "ultimateCharge" | "onActivateUltimate">) {
  return (
    <div className="space-y-4">
      {/* Assetto Squadra */}
      <div className="glass-premium p-4 rounded-2xl border-white/5 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">ASSETTO SQUADRA</span>
          <span className="text-[9px] text-gold font-black uppercase tracking-widest">
            {stance === "balanced" ? "BALANCED" : stance === "aggressive" ? "ATTACK" : "DEFENSE"}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5">
          {(["defensive", "balanced", "aggressive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStanceChange(s)}
              disabled={!matchInProgress}
              className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                stance === s
                  ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white disabled:opacity-20"
              }`}
            >
              {s === "balanced" ? "BAL" : s === "aggressive" ? "ATK" : "DEF"}
            </button>
          ))}
        </div>
      </div>

      {/* Comandi Tattici */}
      <div className="glass-premium p-4 rounded-2xl border-white/5 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">COMANDI TATTICI</span>
        </div>

        <div className="space-y-1.5">
          {(["none", "focus_attack", "protect_lead"] as const).map((c) => (
            <button
              key={c}
              onClick={() => onCommandChange(c)}
              disabled={!matchInProgress}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all border text-left group ${
                command === c
                  ? "bg-gold/10 text-gold border-gold/30 shadow-lg"
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white disabled:opacity-20"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                command === c ? "bg-gold text-black" : "bg-white/5 text-white/40"
              }`}>
                {c === "none" ? "⚖️" : c === "focus_attack" ? "🏃" : "🛡️"}
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-wider leading-none mb-0.5 ${
                  command === c ? "text-gold" : "text-white"
                }`}>
                  {c === "none" ? "NESSUN COMANDO" : c === "focus_attack" ? "TUTTI AVANTI" : "BLINDATA"}
                </span>
                <span className="text-[8px] font-medium opacity-60 uppercase tracking-widest truncate">
                  {c === "none" ? "Gioco bilanciato" : c === "focus_attack" ? "Spingi tutto" : "Difesa compatta"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
