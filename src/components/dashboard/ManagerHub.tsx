"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const HUB_CARDS = [
  {
    id: "upgrade",
    title: "Potenzia Roster",
    desc: "Migliora le stats dei tuoi campioni.",
    icon: "📈",
    href: "/squad",
    color: "accent",
    status: "Novità"
  },
  {
    id: "market",
    title: "Transfer Hub",
    desc: "Firma nuovi talenti nel mercato.",
    icon: "💼",
    href: "/mercato",
    color: "cyan",
  },
  {
    id: "rewards",
    title: "Daily Rewards",
    desc: "Ritira il tuo premio giornaliero.",
    icon: "🎁",
    href: "/dashboard",
    color: "emerald",
    action: "Ritira"
  },
  {
    id: "packs",
    title: "Box & Loot",
    desc: "Apri pacchetti e sblocca item.",
    icon: "📦",
    href: "/shop",
    color: "amber",
    disabled: true
  }
];

export function ManagerHub() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-[11px] uppercase tracking-[0.4em] text-muted font-black shrink-0">
          MANAGER HUB
        </h2>
        <div className="h-px bg-white/5 flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HUB_CARDS.map((card, i) => {
          const isDisabled = card.disabled;
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={isDisabled ? "#" : card.href}
                className={`group relative block h-full card p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all overflow-hidden ${isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer hover:border-accent/30"}`}
              >
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />

                <div className="flex flex-col h-full gap-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="text-3xl lg:text-4xl group-hover:scale-110 transition-transform duration-500">{card.icon}</div>
                    {card.status && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-accent text-black">
                        {card.status}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black italic uppercase text-base lg:text-lg tracking-tight text-white group-hover:text-accent transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[10px] text-muted leading-relaxed font-medium">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      {isDisabled ? "Prossimamente" : card.action || "Esplora"}
                    </span>
                    {!isDisabled && <span className="text-muted/40 group-hover:text-accent transition-colors">→</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
