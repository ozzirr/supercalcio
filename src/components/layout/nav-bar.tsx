"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeDisplay } from "@/components/profile/badge-display";
import type { CustomBadge } from "@/types/badge";

const NAV_ITEMS = [
  { href: "/dashboard", label: "HOME" },
  { href: "/squad", label: "SQUADRA" },
  { href: "/leaderboard", label: "RANKING" },
  { href: "/mercato", label: "MERCATO" },
  { href: "/shop", label: "SHOP" },
];

export function NavBar({ onOpenProfile, onOpenSettings }: { onOpenProfile: () => void, onOpenSettings: () => void }) {
  const pathname = usePathname();
  const logout = useGameStore((s) => s.logout);
  const user = useGameStore((s) => s.user);
  
  const matchInProgress = useGameStore((s) => s.matchInProgress);
  const energyAmount = useGameStore((s) => s.energyAmount);
  const teamName = useGameStore((s) => s.teamName);
  const customBadge = useGameStore((s) => s.customBadge);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-black/80 backdrop-blur-2xl border-b border-gold/20 h-[85px] lg:h-[95px] flex items-center shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

        <div className="w-full max-w-[1700px] mx-auto px-6 lg:px-10 flex items-center justify-between relative h-full">
          
          {/* LEFT: Nav Items (Desktop) */}
          <div className="hidden lg:flex items-center w-[500px]">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 px-3">
              {NAV_ITEMS.map((item, index) => {
                const isActive = pathname === item.href;
                
                return (
                  <div key={item.href} className="flex items-center">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1.5 px-4 py-2 transition-all duration-300 ${
                        isActive
                          ? "text-gold"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                        {item.label}
                      </span>
                    </Link>
                    {index < NAV_ITEMS.length - 1 && (
                      <div className="w-px h-3 bg-white/10 mx-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEFT: Hamburger Menu (Mobile) */}
          <div className="flex lg:hidden flex-1">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-white group"
             >
                <div className="w-6 h-0.5 bg-white rounded-full group-hover:bg-gold transition-colors" />
                <div className="w-6 h-0.5 bg-white rounded-full group-hover:bg-gold transition-colors" />
                <div className="w-4 h-0.5 bg-white rounded-full self-start ml-2 group-hover:bg-gold transition-colors" />
             </button>
          </div>

          {/* CENTER: Massive Logo (Floating) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
            <div className="relative group pointer-events-auto">
              {/* Radial Flare */}
              <div className="absolute inset-0 bg-gold/20 blur-[80px] lg:blur-[100px] rounded-full scale-[2.5] opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
              
              <Link href="/dashboard" className="block relative transition-all duration-500 hover:scale-110 active:scale-95">
                <img 
                  src="/assets/logo.png" 
                  alt="GOLAZOO" 
                  className="h-20 lg:h-36 w-auto object-contain filter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]" 
                />
              </Link>
            </div>
          </div>

          {/* RIGHT: GIOCA & Profile (Desktop) */}
          <div className="hidden lg:flex w-[500px] items-center justify-end gap-3">
            {/* GIOCA Button */}
            <Link 
              href={matchInProgress ? "#" : "/match"} 
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all group overflow-hidden relative ${
                matchInProgress 
                ? "bg-white/10 text-white/20 cursor-not-allowed shadow-none" 
                : "bg-gold text-black hover:scale-105 active:scale-95"
              }`}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs group-hover:translate-x-1 transition-transform">
                {matchInProgress ? "⏱" : "▶"}
              </span>
              <div className="flex flex-col items-start leading-none gap-0.5">
                 <span className="text-[11px]">GIOCA</span>
                 <span className="text-[8px] opacity-60 font-bold">{energyAmount}/3 MATCH</span>
              </div>
            </Link>

            {/* Profile Info */}
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-4 bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-2xl min-w-[220px] hover:bg-white/10 hover:border-gold/30 transition-all group"
            >
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-xl relative overflow-hidden group-hover:scale-110 transition-transform">
                  <div className="absolute inset-0 bg-gold/5" />
                  {customBadge ? (
                    <BadgeDisplay badge={customBadge} size="md" />
                  ) : (
                    <img src="/assets/logo.png" className="w-full h-full object-contain grayscale brightness-200 opacity-80" alt="badge" />
                  )}
               </div>
               
               <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-black italic text-white uppercase tracking-tight truncate max-w-[100px]">{teamName || "AC VOSTRA"}</span>
                     <div className="flex items-baseline gap-1">
                        <span className="text-[8px] font-black text-gold uppercase opacity-60">LVL</span>
                        <span className="text-xs font-black text-gold italic">48</span>
                     </div>
                  </div>
                  <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <div className="absolute inset-y-0 left-0 bg-gold shadow-[0_0_10px_#FFC324]" style={{ width: '72%' }}></div>
                  </div>
               </div>
            </button>

            {/* Settings Gear */}
            <button 
              onClick={onOpenSettings}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:bg-white/10 hover:border-gold/30 group"
            >
               <span className="text-2xl group-hover:rotate-90 transition-transform duration-500">⚙️</span>
            </button>
          </div>

          {/* RIGHT: Refresh Icon (Mobile) */}
          <div className="flex lg:hidden flex-1 justify-end">
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
               <span className="text-lg">↻</span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-[300px] z-[101] bg-[#05070a]/95 backdrop-blur-2xl border-r border-gold/20 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-black italic text-xl tracking-tighter text-white">MENU</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-xl">
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                          isActive
                            ? "text-accent bg-accent/10 border border-accent/20"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
                  {user ? (
                    <button 
                      onClick={logout} 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-danger/80 hover:text-danger hover:bg-danger/10 font-black uppercase text-sm tracking-widest transition-colors"
                    >
                      <span className="text-lg">⎋</span> Disconnetti
                    </button>
                  ) : (
                    <Link 
                      href="/login" 
                      className="flex items-center justify-center py-3 rounded-xl bg-accent text-black font-black uppercase tracking-widest"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
