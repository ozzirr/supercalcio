"use client";

import { motion } from "framer-motion";

interface SquadActionBarProps {
  onAutoFill: () => void;
  onClear: () => void;
  onStartMatch: () => void;
  isValid: boolean;
  hasLineup: boolean;
}

export function SquadActionBar({ onAutoFill, onClear, onStartMatch, isValid, hasLineup }: SquadActionBarProps) {
  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={onAutoFill}
        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
      >
        Auto-Draft
      </button>

      {hasLineup && (
        <button 
          onClick={onClear}
          className="px-4 py-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Clear
        </button>
      )}

      <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

      <button
        onClick={onStartMatch}
        disabled={!isValid}
        className={`relative group px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500
          ${isValid 
            ? "bg-accent text-black shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95" 
            : "bg-white/5 text-white/20 cursor-not-allowed grayscale"
          }
        `}
      >
        <span className="relative z-10 flex items-center gap-2">
          Deploy to Match
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </span>
        {isValid && (
           <motion.div 
             layoutId="ctaGlow"
             className="absolute inset-0 bg-white/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
           />
        )}
      </button>
    </div>
  );
}

interface LineupStatusBannerProps {
  isValid: boolean;
  errors: string[];
  hasLineup: boolean;
}

export function LineupStatusBanner({ isValid, errors, hasLineup }: LineupStatusBannerProps) {
  if (isValid || !hasLineup) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
           ⚠️
        </div>
        <div className="space-y-1">
           <div className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Tactical Inconsistency Detected</div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {errors.map((error, idx) => (
                <div key={idx} className="text-[10px] text-rose-500/70 font-bold uppercase flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-rose-500/40" />
                   {error}
                </div>
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
