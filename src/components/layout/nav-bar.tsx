"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";
import { useState } from "react";

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
  const currency = useGameStore((s) => s.currency);
  const user = useGameStore(s => s.user);
  const teamName = useGameStore(s => s.teamName);
  const logout = useGameStore(s => s.logout);

  return (
    <nav className="relative z-50 border-b border-border bg-surface shrink-0">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/dashboard" className="text-xl lg:text-2xl font-black italic tracking-tighter text-accent uppercase shrink-0">
            GI<span className="text-white">OOL</span>
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
          <button 
            onClick={onOpenProfile}
            className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-3 lg:px-4 py-1.5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted tracking-widest hidden lg:block">Team</span>
              <span className="font-black italic text-white uppercase truncate max-w-[80px] lg:max-w-[120px]">{teamName}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted tracking-widest hidden lg:block">Rank</span>
              <span className="font-black italic text-accent">L{Math.floor(xp / 100) + 1}</span>
            </div>
          </button>

          {/* Credits (Always visible) */}
          <Link 
            href="/shop"
            className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            <span className="text-[10px] font-black uppercase text-accent/60">CR</span>
            <span className="font-black italic text-accent">{currency.toLocaleString()}</span>
          </Link>

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

        </div>
      </div>
    </nav>
  );
}
