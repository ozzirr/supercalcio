"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB_ITEMS = [
  { href: "/dashboard", label: "Home", emoji: "🏟️" },
  { href: "/squad", label: "Squadra", emoji: "🛡️" },
  { href: "/match", label: "Gioca", emoji: "⚡" },
  { href: "/mercato", label: "Mercato", emoji: "⚽" },
  { href: "/leaderboard", label: "Ranking", emoji: "📊" },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-surface/80 backdrop-blur-xl border-t border-white/10 px-2 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {TAB_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                isActive ? "text-accent" : "text-muted hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all text-xl ${
                isActive ? "bg-accent/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]" : ""
              }`}>
                {item.emoji}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${
                isActive ? "opacity-100" : "opacity-40"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
