"use client";

import { use, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { ownedPlayers } = useGameStore();

  const player = STARTER_PLAYERS.find(p => p.id === id);
  const isOwned = ownedPlayers.some(p => p.player_id === id);

  if (!player) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#05070a]">
        <div className="text-2xl font-black mb-4 text-white/20 uppercase tracking-widest">Atleta Non Trovato</div>
        <button 
          onClick={() => router.push("/mercato")} 
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Torna al Mercato
        </button>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'legendary': return 'from-rose-500 to-orange-500';
      case 'gold': return 'from-gold to-yellow-600';
      case 'silver': return 'from-slate-300 to-slate-500';
      default: return 'from-orange-700 to-orange-900';
    }
  };

  const getOVR = (stats: PlayerDefinition['stats']) => {
    return Math.round((stats.pace + stats.shooting + stats.passing + stats.defense + stats.physical) / 5);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#05070a] custom-scrollbar relative">
      {/* Cinematic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 transition-all"
          >
            <span className="text-white group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Torna Indietro</span>
          </button>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Status Contratto</span>
                <span className={`text-xs font-black uppercase italic ${isOwned ? 'text-success' : 'text-white/40'}`}>
                  {isOwned ? "● Sotto Contratto" : "○ Disponibile nel Mercato"}
                </span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Cinematic Card Display (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-12">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative group"
            >
              <div className={`relative z-10 rounded-[3rem] overflow-hidden border-2 border-white/10 bg-gradient-to-br ${getTierColor(player.tier)} p-1 shadow-2xl`}>
                <div className="relative bg-[#0a0c10] rounded-[2.8rem] overflow-hidden aspect-[3/4.2]">
                   {/* Player Portrait */}
                   <img 
                    src={`/assets/portraits/${player.portrait}.png`} 
                    alt={player.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  />
                  
                  {/* Glass Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                  
                  {/* Card Info HUD */}
                  <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
                     <span className="text-7xl font-black italic text-white/90 tracking-tighter leading-none drop-shadow-2xl">
                        {getOVR(player.stats)}
                     </span>
                     <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em] drop-shadow-md">
                        {player.tier} GRADE
                     </span>
                  </div>

                  <div className="absolute top-8 right-8">
                     <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl shadow-xl">
                        {player.archetype === 'striker' ? '🔥' : player.archetype === 'keeper' ? '🧤' : '🛡️'}
                     </div>
                  </div>

                  <div className="absolute bottom-10 inset-x-8">
                     <h1 className="text-4xl xl:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-2xl mb-2">
                        {player.name}
                     </h1>
                     <div className="flex gap-2">
                        {player.roleTags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black text-white/80 uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Dynamic Shadow Pod */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-black/40 blur-2xl rounded-full" />
            </motion.div>
          </div>

          {/* RIGHT: Technical Data & Skills (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-12">
            {/* Header Info */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Elite <span className="text-accent">Profile</span></h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-2xl italic font-medium">
                "{player.flavorText}"
              </p>
            </motion.div>

            {/* Core Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(player.stats).map(([stat, value], idx) => (
                <motion.div
                  key={stat}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + (idx * 0.05) }}
                  className="glass-premium p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3"
                >
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{stat}</span>
                  <span className="text-3xl font-black text-white italic">{value as number}</span>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(value as number / 120) * 100}%` }}
                      className="h-full bg-accent shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tactical Specializations */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 border-l-2 border-accent pl-4">Abilità Speciali</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Skill */}
                <SkillCard 
                  title="Abilità Attiva"
                  name={player.activeSkill.name}
                  desc={player.activeSkill.description}
                  type="active"
                  icon="⚡"
                />
                {/* Passive Skill */}
                <SkillCard 
                  title="Abilità Passiva"
                  name={player.passive.name}
                  desc={player.passive.description}
                  type="passive"
                  icon="🛡️"
                />
                {/* Ultimate */}
                <SkillCard 
                  title="Ultimate"
                  name={player.ultimate.name}
                  desc={player.ultimate.description}
                  type="ultimate"
                  icon="👑"
                />
              </div>
            </div>

            {/* Scout Info Card */}
            <div className="glass-premium p-8 rounded-[3rem] border-accent/20 bg-accent/5 flex flex-col md:flex-row items-center gap-8">
               <div className="w-20 h-20 rounded-[2rem] bg-accent/20 border border-accent/30 flex items-center justify-center text-4xl shadow-inner">
                  📈
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-black italic uppercase text-white mb-2">Potenziale Atletico Invariabile</h4>
                  <p className="text-xs text-white/40 font-medium leading-relaxed max-w-lg">
                    I parametri di questo atleta sono stati cristallizzati per garantire la massima stabilità tattica. Le prestazioni sul campo dipendono esclusivamente dalla tua maestria nel gestire la squadra e le sostituzioni.
                  </p>
               </div>
               {!isOwned && (
                 <button 
                  onClick={() => router.push("/mercato")}
                  className="px-10 py-4 bg-accent text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_20px_40px_rgba(251,191,36,0.3)]"
                 >
                  Vai al Mercato
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillCard({ title, name, desc, type, icon }: { title: string, name: string, desc: string, type: 'active' | 'passive' | 'ultimate', icon: string }) {
  const getBorder = () => {
    if (type === 'ultimate') return 'border-gold/30 bg-gold/5';
    if (type === 'active') return 'border-rose-500/30 bg-rose-500/5';
    return 'border-blue-500/30 bg-blue-500/5';
  };

  const getLabelColor = () => {
    if (type === 'ultimate') return 'text-gold';
    if (type === 'active') return 'text-rose-400';
    return 'text-blue-400';
  };

  return (
    <div className={`p-6 rounded-[2.5rem] border ${getBorder()} transition-all hover:scale-[1.02]`}>
       <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{icon}</span>
          <div className="flex flex-col">
             <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${getLabelColor()}`}>{title}</span>
             <span className="text-sm font-black text-white uppercase italic">{name}</span>
          </div>
       </div>
       <p className="text-[10px] text-white/40 font-medium leading-relaxed uppercase tracking-wider">
          {desc}
       </p>
    </div>
  );
}
