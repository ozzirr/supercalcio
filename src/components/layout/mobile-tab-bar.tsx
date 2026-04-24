"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store/game-store";

const TAB_ITEMS = [
  { href: "/dashboard", label: "Home", emoji: "🏟️" },
  { href: "/squad", label: "Squadra", emoji: "🛡️" },
  { href: "/match", label: "Gioca", emoji: "⚡" },
  { href: "/mercato", label: "Mercato", emoji: "⚽" },
  { href: "/leaderboard", label: "Ranking", emoji: "📊" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const matchInProgress = useGameStore((s) => s.matchInProgress);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#05070a]/95 backdrop-blur-3xl border-t border-gold/20 px-2 pb-safe-area-inset-bottom shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {TAB_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isGioca = item.label === "Gioca";
          const isDisabled = isGioca && matchInProgress;
          
          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-500 ${
                isActive ? "text-gold" : "text-white/20 hover:text-white"
              } ${isDisabled ? "opacity-20 cursor-not-allowed" : ""}`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-500 text-xl ${
                isActive ? "bg-gold/15 glow-gold shadow-[0_0_25px_rgba(255,193,32,0.2)] scale-110" : ""
              }`}>
                {isDisabled ? "⏱" : item.emoji}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${
                isActive ? "opacity-100 scale-105" : "opacity-40"
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
