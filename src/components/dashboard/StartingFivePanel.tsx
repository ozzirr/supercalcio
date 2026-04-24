"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface PlayerCollectibleCardProps {
  player?: {
    id: string;
    name: string;
    portrait: string;
    position: string;
  };
  index: number;
}

export function PlayerCollectibleCard({ player, index }: PlayerCollectibleCardProps) {
  if (!player) {
    return (
      <div className="aspect-[3/4.2] rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/[0.04] transition-all">
        <span className="text-white/10 text-2xl group-hover:scale-110 transition-transform">+</span>
        <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">EMPTY</span>
      </div>
    );
  }

  const roleColors: Record<string, { border: string, text: string, bg: string }> = {
    GK: { border: "border-blue-400/50", text: "text-blue-400", bg: "bg-blue-400/10" },
    DEF: { border: "border-emerald-400/50", text: "text-emerald-400", bg: "bg-emerald-400/10" },
    MID: { border: "border-amber-400/50", text: "text-amber-400", bg: "bg-amber-400/10" },
    ATK: { border: "border-rose-400/50", text: "text-rose-400", bg: "bg-rose-400/10" },
    FLEX: { border: "border-purple-400/50", text: "text-purple-400", bg: "bg-purple-400/10" },
  };

  const colors = roleColors[player.position] || roleColors.FLEX;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative aspect-[3/4.2] group cursor-pointer"
    >
      <div className={`absolute inset-0 rounded-xl border-2 ${colors.border} bg-[#0a0f16] overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)]`}>
        {/* Role Badge */}
        <div className={`absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded-lg bg-black/80 border ${colors.border} text-[7px] font-black uppercase tracking-widest ${colors.text}`}>
          {player.position}
        </div>

        {/* Rating */}
        <div className="absolute top-1.5 right-1.5 z-20 text-white font-black italic text-[12px] drop-shadow-md">
           78
        </div>

        {/* Portrait */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          <img 
            src={`/assets/portraits/${player.portrait}.png`} 
            alt={player.name} 
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        </div>

        {/* Name Banner */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-1.5 text-center bg-black/80 backdrop-blur-md border-t border-white/5">
           <div className="text-[9px] font-black text-white italic uppercase truncate tracking-tighter">{player.name}</div>
        </div>
      </div>
    </motion.div>
  );
}

interface StartingFivePanelProps {
  players: any[];
  power?: string;
}

export function StartingFivePanel({ players, power = "2,840" }: StartingFivePanelProps) {
  return (
    <div className="glass-premium p-6 lg:p-8 space-y-6 h-full flex flex-col relative border-white/5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">STARTING FIVE</h2>
        <div className="px-4 py-1.5 rounded-xl bg-gold/15 border border-gold/30 text-gold text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-inner backdrop-blur-md">
           POTENZA SQUADRA <span className="text-white italic ml-1">🔥 {power}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 lg:gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <PlayerCollectibleCard key={i} index={i} player={players[i]} />
        ))}
      </div>

      {/* Footer Info Row */}
      <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-8 mt-auto">
        <div className="flex gap-8 lg:gap-12 flex-1">
          <div className="space-y-2 flex-1">
             <div className="flex justify-between items-center text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
               <span>CHIMICA</span>
               <span className="text-emerald-400">85%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
               <div className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-center text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
               <span>WIN RATE</span>
               <span className="text-gold">62%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
               <div className="h-full bg-gold shadow-[0_0_10px_rgba(255,195,36,0.5)] rounded-full" style={{ width: '62%' }} />
            </div>
          </div>
        </div>

        <Link 
          href="/squad" 
          className="px-8 py-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all group shrink-0"
        >
          GESTISCI SQUADRA <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
