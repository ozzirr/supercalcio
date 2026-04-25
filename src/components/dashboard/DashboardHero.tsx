"use client";

import { motion } from "framer-motion";
import { BadgeDisplay } from "@/components/profile/badge-display";
import type { CustomBadge } from "@/types/badge";

interface DashboardHeroProps {
  teamName: string;
  badgeId: string;
  customBadge?: CustomBadge | null;
  level: number;
  xp: number;
  onEditProfile: () => void;
}

export function DashboardHero({ teamName, badgeId, customBadge, level, xp, onEditProfile }: DashboardHeroProps) {
  const displayLevel = 48;
  const displayXP = 7250;
  const displayXPMax = 10000;
  const xpProgress = (displayXP / displayXPMax) * 100;

  return (
    <div className="relative pt-8 pb-10 lg:pt-10 lg:pb-14">
      <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 flex-1">
          <div className="relative group">
            <div className="absolute inset-0 bg-gold/20 blur-[70px] rounded-full scale-150 animate-pulse group-hover:bg-gold/30 transition-colors"></div>
            {customBadge ? (
              <div className="w-48 h-56 lg:w-60 lg:h-72 flex items-center justify-center relative z-10">
                <BadgeDisplay badge={customBadge} size="lg" />
              </div>
            ) : (
              <div className="w-48 h-56 lg:w-60 lg:h-72 shield-shape glass-premium flex items-center justify-center p-10 border-gold/40 relative z-10 shadow-[0_30px_60px_rgba(0,0,0,0.7)] group-hover:border-gold transition-all duration-500">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src="/assets/logo.png" className="w-full h-auto object-contain glow-gold-strong drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] mb-6 opacity-40 grayscale" alt="Team Badge Base" />
                  <div className="absolute inset-0 flex items-center justify-center mb-6">
                    <span className="text-7xl lg:text-9xl font-black italic text-gold drop-shadow-[0_0_20px_rgba(255,193,32,0.5)]">V</span>
                  </div>
                </div>
              </div>
            )}
            <button onClick={onEditProfile} className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
              <div className="bg-gold text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">MODIFICA PROFILO</div>
            </button>
            <div className="absolute -top-6 -right-6 w-14 h-14 bg-gold rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(251,191,36,0.5)] border-4 border-[#05070a] z-40 group-hover:scale-110 transition-transform">
              <span className="text-2xl">👑</span>
            </div>
          </div>

          <div className="text-center lg:text-left space-y-5 flex-1 min-w-0">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold text-[9px] font-black uppercase tracking-[0.4em] shadow-inner backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                STAGIONE 1 &bull; THE THRONE
              </div>
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] whitespace-nowrap overflow-hidden text-ellipsis">
                {teamName || "AC VOSTRA"}
              </h1>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase text-white/40 tracking-[0.3em]">MANAGER LEVEL</span>
                <span className="text-3xl lg:text-4xl font-black italic text-gold leading-none">LVL {displayLevel}</span>
              </div>

              <div className="max-w-2xl space-y-2">
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gold via-amber-400 to-gold shadow-[0_0_15px_rgba(255,193,32,0.6)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-end items-center px-1">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">{displayXP.toLocaleString()} / {displayXPMax.toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            <button onClick={onEditProfile} className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300">
              VISUALIZZA PROFILO <span className="group-hover:translate-x-2 transition-transform text-gold">→</span>
            </button>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="glass-premium p-10 w-80 space-y-8 relative overflow-hidden border-gold/20 shadow-2xl rounded-[2.5rem]">
            <div className="absolute -right-10 -bottom-10 text-white/[0.04] font-black text-[15rem] select-none rotate-12">S1</div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-4xl shadow-inner">🏆</div>
              <div>
                <div className="text-[11px] font-black text-white/40 uppercase tracking-widest">STAGIONE 1</div>
                <div className="text-lg font-black text-white uppercase italic tracking-tight">THE THRONE</div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <div className="text-[11px] font-black text-gold uppercase tracking-[0.3em] mb-3">TERMINA TRA</div>
              <div className="text-3xl font-black italic text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">23G 14H 32M</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
