"use client";

import { motion } from "framer-motion";

interface TeamHeroProps {
  teamName: string;
  badgeEmoji: string;
  level: number;
  xpProgress: number;
  onEditProfile: () => void;
}

export function TeamHero({ teamName, badgeEmoji, level, xpProgress, onEditProfile }: TeamHeroProps) {
  return (
    <div className="relative px-4 lg:px-8 pt-12 lg:pt-24 pb-16 lg:pb-20 text-center overflow-hidden border-b border-white/5">
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 animate-[pulse_6s_ease-in-out_infinite]"
        style={{ backgroundImage: "url('/assets/dashboard-bg.png')" }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#05070a_100%)]" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-md text-accent text-[9px] lg:text-[11px] uppercase tracking-[0.3em] font-black mb-8 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#fbbf24]" />
          GOLAZOO &bull; Season 1: The Throne
        </motion.div>

        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 bg-accent/20 blur-[30px] rounded-full scale-125 animate-pulse" />
            <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-4xl lg:text-6xl border border-accent/40 shadow-2xl relative z-10 backdrop-blur-sm">
              {badgeEmoji}
            </div>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            {teamName}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center gap-6"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Manager Level</span>
                <span className="text-2xl lg:text-3xl font-black italic text-white leading-none">LVL {level}</span>
              </div>
              <div className="w-48 lg:w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-accent to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-[9px] font-bold text-muted/60 uppercase tracking-widest">{xpProgress}/100 XP TO NEXT LEVEL</span>
            </div>
          </motion.div>

          <button
            onClick={onEditProfile}
            className="mt-8 px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] uppercase font-black tracking-widest text-muted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            [ MODIFICA PROFILO ]
          </button>
        </div>
      </div>
    </div>
  );
}
