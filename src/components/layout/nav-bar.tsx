"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";

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
  const logout = useGameStore(s => s.logout);

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-2xl font-black italic tracking-tighter text-accent uppercase">
          KINGS<span className="text-white">LEAGUE</span>
        </Link>
        <div className="flex items-center gap-1">
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
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted">XP</span>
          <span className="font-semibold text-accent">{xp}</span>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
          <span className="text-[10px] font-black uppercase text-accent/60">CR</span>
          <span className="font-black italic text-accent">{currency.toLocaleString()}</span>
        </div>
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
    </nav>
  );
}
