"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/mercato", label: "Mercato" },
  { href: "/squad", label: "Squadra" },
  { href: "/leaderboard", label: "Ranking" },
  { href: "/shop", label: "Shop" },
];

export function NavBar() {
  const pathname = usePathname();
  const xp = useGameStore((s) => s.xp);
  const currency = useGameStore((s) => s.currency);
  const user = useGameStore(s => s.user);
  const teamName = useGameStore(s => s.teamName);
  const logout = useGameStore(s => s.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 border-b border-border bg-surface shrink-0">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/dashboard" className="text-xl lg:text-2xl font-black italic tracking-tighter text-accent uppercase shrink-0">
            SUPER<span className="text-white">CALCIO</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Mobile Info (XP/Manager - Hidden on small screen or simplified) */}
          <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-3 lg:px-4 py-1.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted tracking-widest hidden lg:block">Team</span>
              <span className="font-black italic text-white uppercase truncate max-w-[80px] lg:max-w-[120px]">{teamName}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted tracking-widest hidden lg:block">Rank</span>
              <span className="font-black italic text-accent">L{Math.floor(xp / 100) + 1}</span>
            </div>
          </div>

          {/* Credits (Always visible) */}
          <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
            <span className="text-[10px] font-black uppercase text-accent/60">CR</span>
            <span className="font-black italic text-accent">{currency.toLocaleString()}</span>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="w-px h-6 bg-border mx-2"></div>
            {user ? (
              <button onClick={logout} className="text-muted hover:text-danger transition-colors text-xs uppercase tracking-wider">
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-muted hover:text-accent transition-colors text-xs uppercase tracking-wider">
                Login
              </Link>
            )}
          </div>

          {/* Hamburger (Mobile only) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-muted hover:text-white transition-colors"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-surface border-b border-border shadow-2xl animate-in slide-in-from-top-2 p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                pathname === item.href
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/5 space-y-4">
             <div className="flex items-center justify-between text-xs px-4">
               <span className="text-muted uppercase font-black">Manager</span>
               <span className="text-white font-black italic">{teamName}</span>
             </div>
             {user && (
               <button 
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full py-3 bg-white/5 text-danger text-xs font-black uppercase tracking-widest rounded-xl"
               >
                 Logout
               </button>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}
