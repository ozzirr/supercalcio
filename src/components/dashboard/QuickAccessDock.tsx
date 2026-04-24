"use client";

import Link from "next/link";

const DOCK_LINKS = [
  { label: "Squadra", href: "/squad", icon: "🛡️" },
  { label: "Mercato", href: "/mercato", icon: "⚽" },
  { label: "Ranking", href: "/leaderboard", icon: "📊" },
  { label: "Shop", href: "/shop", icon: "💎" },
];

export function QuickAccessDock() {
  return (
    <div className="flex flex-wrap justify-center gap-4 lg:gap-8 pt-8 border-t border-white/5">
      {DOCK_LINKS.map((link) => (
        <Link 
          key={link.label}
          href={link.href}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl lg:text-2xl group-hover:bg-accent/10 group-hover:border-accent/30 group-hover:-translate-y-1 transition-all duration-300 shadow-xl">
            {link.icon}
          </div>
          <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-accent transition-colors">
            {link.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
