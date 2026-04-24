"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/squad", label: "Squadra" },
  { href: "/leaderboard", label: "Ranking" },
  { href: "/mercato", label: "Mercato" },
  { href: "/shop", label: "Shop" },
];

export function NavBar({ onOpenProfile }: { onOpenProfile: () => void }) {
  const pathname = usePathname();
  const xp = useGameStore((s) => s.xp);
  const user = useGameStore((s) => s.user);
  const teamName = useGameStore((s) => s.teamName);
  const logout = useGameStore((s) => s.logout);
  const energyAmount = useGameStore((s) => s.energyAmount);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#05070a]/90 backdrop-blur-xl border-b border-accent/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] shrink-0 h-16 lg:h-20 flex items-center">
        {/* Glow Line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>

        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between relative">
          
          {/* LEFT: Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    isActive
                      ? "text-accent bg-accent/10 border border-accent/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-accent rounded-t-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* LEFT: Mobile Hamburger */}
          <div className="lg:hidden flex-1 flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-white/80 hover:text-white transition-colors"
              aria-label="Apri menu"
            >
              <span className="w-6 h-0.5 bg-current rounded-full"></span>
              <span className="w-6 h-0.5 bg-current rounded-full"></span>
              <span className="w-4 h-0.5 bg-current rounded-full self-start ml-2"></span>
            </button>
          </div>

          {/* CENTER: The Logo (Overlapping crest) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none">
            <div className="relative pointer-events-auto flex justify-center items-center mt-2 lg:mt-4">
              {/* Background Glow behind logo */}
              <div className="absolute inset-0 bg-secondary/20 blur-[30px] rounded-full scale-110"></div>
              <Link href="/dashboard" className="block relative group hover:scale-[1.05] transition-transform duration-300">
                <img 
                  src="/assets/logo.png" 
                  alt="GOLAZOO" 
                  className="h-28 lg:h-36 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] filter brightness-110" 
                />
              </Link>
            </div>
          </div>

          {/* RIGHT: Team Info & Actions */}
          <div className="flex-1 flex items-center justify-end gap-3 lg:gap-6">
            {/* Match CTA */}
            <Link 
              href="/match" 
              className={`hidden md:flex items-center gap-2 px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.1em] transition-all duration-300 ${
                energyAmount > 0 
                ? "bg-accent text-black hover:scale-105 shadow-[0_10px_20px_rgba(251,191,36,0.2)] active:scale-95" 
                : "bg-white/5 text-white/40 border border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <span className="text-xs animate-pulse">▶</span>
              GIOCA ({energyAmount}/3)
            </Link>

            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-3 bg-[#0a0f16]/80 border border-white/10 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full hover:bg-white/10 hover:border-accent/30 transition-all cursor-pointer shadow-inner"
            >
              <div className="flex items-center gap-2">
                <span className="font-black italic text-white uppercase text-[10px] lg:text-xs truncate max-w-[80px] lg:max-w-[120px]">{teamName}</span>
              </div>
              <div className="w-px h-3 lg:h-4 bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] lg:text-[9px] font-black uppercase text-accent/60 tracking-widest hidden sm:block">LVL</span>
                <span className="font-black italic text-accent text-xs lg:text-sm">{Math.floor(xp / 100) + 1}</span>
              </div>
            </button>

            {user ? (
              <button 
                onClick={logout} 
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-danger/20 hover:border-danger/50 hover:text-danger text-white/60 transition-all"
                title="Logout"
              >
                <span className="text-sm">⎋</span>
              </button>
            ) : (
              <Link 
                href="/login" 
                className="hidden lg:flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* MOBILE DRAWER */}
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
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-[300px] z-[101] bg-[#05070a]/95 backdrop-blur-2xl border-r border-accent/20 shadow-2xl flex flex-col lg:hidden"
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
