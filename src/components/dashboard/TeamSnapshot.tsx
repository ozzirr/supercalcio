"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface PlayerMiniCardProps {
  player?: {
    id: string;
    name: string;
    portrait: string;
    position: string;
    rarity?: string;
  };
  index: number;
}

export function PlayerMiniCard({ player, index }: PlayerMiniCardProps) {
  if (!player) {
    return (
      <Link
        href="/squad"
        className="flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
      >
        <span className="text-2xl text-muted/20 group-hover:text-muted/40 transition-colors">+</span>
        <span className="mt-2 text-[7px] font-black text-muted/30 uppercase tracking-widest">Empty</span>
      </Link>
    );
  }

  // Abbreviate long names
  const displayName = player.name.length > 12 ? player.name.split(' ')[0] : player.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/players/${player.id}`}
        className="relative block aspect-[3/4] group"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 rounded-2xl z-10" />
        <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-accent/50 transition-colors z-20" />
        
        <img 
          src={`/assets/portraits/${player.portrait}.png`} 
          alt={player.name} 
          className="w-full h-full object-cover rounded-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
        />

        <div className="absolute bottom-2 left-0 right-0 z-30 px-2 text-center">
          <div className="text-[7px] lg:text-[8px] font-black text-accent uppercase tracking-tighter mb-0.5">{player.position}</div>
          <div className="text-[9px] lg:text-[10px] font-black text-white italic uppercase truncate drop-shadow-md">{displayName}</div>
        </div>

        {/* Level/Rating Tag */}
        <div className="absolute top-2 right-2 z-30 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
           <span className="text-[8px] font-black text-white italic">78</span>
        </div>
      </Link>
    </motion.div>
  );
}

interface TeamSnapshotProps {
  players: any[];
  playstyleName: string;
}

export function TeamSnapshot({ players, playstyleName }: TeamSnapshotProps) {
  return (
    <div className="card p-6 lg:p-8 border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-white">Starting Five</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] lg:text-[10px] text-muted font-black uppercase tracking-widest">Assetto:</span>
            <span className="text-[9px] lg:text-[10px] text-accent font-black uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              {playstyleName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <div className="text-[10px] text-muted font-black uppercase tracking-widest leading-none">Team Power</div>
              <div className="text-xl font-black italic text-white">2,840</div>
           </div>
           <Link href="/squad" className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-accent/30 transition-all text-xl">
             ⚙️
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 lg:gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <PlayerMiniCard key={i} index={i} player={players[i]} />
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex gap-4 lg:gap-8">
            <div className="flex flex-col">
               <span className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">Chemistry</span>
               <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-400 shadow-[0_0_8px_#34d399]" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400">85%</span>
               </div>
            </div>
            <div className="flex flex-col">
               <span className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">Win Rate</span>
               <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-accent shadow-[0_0_8px_#fbbf24]" style={{ width: '62%' }} />
                  </div>
                  <span className="text-[10px] font-black text-accent">62%</span>
               </div>
            </div>
         </div>
         <Link href="/squad" className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline hidden sm:block">
            Vedi tutti i giocatori →
         </Link>
      </div>
    </div>
  );
}
