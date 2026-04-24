"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const HUB_TILES = [
  { id: "squad", label: "SQUADRA", icon: "🛡️", href: "/squad", color: "from-blue-600/20 to-blue-600/5", borderColor: "border-blue-500/30" },
  { id: "market", label: "MERCATO", icon: "💼", href: "/mercato", color: "from-amber-500/20 to-amber-500/5", borderColor: "border-amber-500/30" },
  { id: "ranking", label: "RANKING", icon: "🏆", href: "/leaderboard", color: "from-gold/20 to-gold/5", borderColor: "border-gold/30" },
  { id: "shop", label: "SHOP", icon: "🛒", href: "/shop", color: "from-rose-500/20 to-rose-500/5", borderColor: "border-rose-500/30" },
  { id: "rewards", label: "REWARDS", icon: "🎁", href: "/dashboard", color: "from-orange-500/20 to-orange-500/5", borderColor: "border-orange-500/30" },
  { id: "upgrade", label: "UPGRADE", icon: "⚡", href: "/squad", color: "from-purple-500/20 to-purple-500/5", borderColor: "border-purple-500/30" },
];

export function ManagerHubPanel() {
  return (
    <div className="glass-premium p-6 lg:p-8 space-y-6 border-white/5 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <span className="text-gold/60 text-2xl">⭐</span>
        <h2 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-white">MANAGER HUB</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {HUB_TILES.map((tile, i) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="h-full"
          >
            <Link
              href={tile.href}
              className={`group block relative h-full p-6 rounded-[2rem] bg-gradient-to-br ${tile.color} border ${tile.borderColor} hover:border-gold/40 hover:bg-white/[0.08] transition-all overflow-hidden text-center flex flex-col items-center justify-center gap-3`}
            >
              <div className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 drop-shadow-lg">{tile.icon}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-hover:text-white transition-colors">
                 {tile.label}
              </div>
              
              {/* Subtle bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
