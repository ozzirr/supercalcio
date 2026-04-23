"use client";

import { useState, useEffect } from "react";
import type { PlayerDefinition } from "@/types/player";

interface PackOpeningModalProps {
  packType: "starter" | "premium" | null;
  revealedPlayer: PlayerDefinition | null;
  onClose: () => void;
}

export function PackOpeningModal({ packType, revealedPlayer, onClose }: PackOpeningModalProps) {
  const [phase, setPhase] = useState<"opening" | "reveal">("opening");
  
  const isPremium = packType === "premium";
  const accentColor = isPremium ? "#fbbf24" : "#60a5fa"; // Gold vs Blue
  const glowShadow = isPremium 
    ? "0 0 100px rgba(251,191,36,0.4)" 
    : "0 0 100px rgba(96,165,250,0.3)";

  useEffect(() => {
    if (revealedPlayer && phase === "opening") {
      const timer = setTimeout(() => {
        setPhase("reveal");
      }, 2500); // Cinematic delay
      return () => clearTimeout(timer);
    }
  }, [revealedPlayer, phase]);

  if (!packType) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 transition-all duration-1000 opacity-20"
        style={{ 
          background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)`,
          transform: phase === "reveal" ? "scale(1.5)" : "scale(1)"
        }}
      />

      {phase === "opening" ? (
        <div className="relative flex flex-col items-center animate-in fade-in duration-500">
          {/* Shaking Box */}
          <div className="relative group">
            <div className={`w-48 h-64 lg:w-64 lg:h-80 rounded-3xl border-4 flex flex-col items-center justify-center gap-4 bg-surface/40 shadow-2xl animate-bounce-slow
              ${isPremium ? "border-accent shadow-[0_0_50px_rgba(251,191,36,0.3)]" : "border-blue-400 shadow-[0_0_50px_rgba(96,165,250,0.2)]"}
            `}>
              <div className="text-7xl lg:text-9xl filter drop-shadow-2xl">
                {isPremium ? "💎" : "📦"}
              </div>
              <div className="text-center">
                 <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${isPremium ? "text-accent" : "text-blue-400"}`}>
                   {isPremium ? "Premium Pack" : "Mini Pack"}
                 </div>
              </div>
            </div>
            
            {/* Speed lines / light rays effect */}
            <div className="absolute inset-0 -z-10 bg-accent/20 blur-[100px] animate-pulse rounded-full" />
          </div>

          <div className="mt-12 text-center space-y-2">
            <h2 className={`text-2xl lg:text-3xl font-black uppercase italic tracking-tighter animate-pulse ${isPremium ? "text-accent" : "text-blue-400"}`}>
               Analisi Genomica...
            </h2>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
               <div className="h-full bg-accent animate-[loading_2.5s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center max-w-sm w-full animate-in zoom-in-95 duration-500">
          {/* Confetti/Burst effect (simplified with CSS) */}
          <div className="absolute inset-0 bg-accent/30 blur-[120px] rounded-full animate-ping opacity-50" />
          
          <div className="text-center mb-8 space-y-2 z-10">
            <div className="inline-block px-4 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.3em]">
               New Player Unlocked
            </div>
            <h3 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {revealedPlayer?.name}
            </h3>
          </div>

          <div className={`relative w-full aspect-[3/4] rounded-3xl overflow-hidden border-4 shadow-2xl transition-all duration-700 hover:scale-[1.02]
            ${revealedPlayer?.tier === 'legendary' ? 'border-purple-500 shadow-purple-500/50' : 
              revealedPlayer?.tier === 'gold' ? 'border-accent shadow-accent/50' : 
              'border-white/20 shadow-white/10'}
          `}>
             <img 
               src={`/assets/portraits/${revealedPlayer?.portrait}.png`} 
               alt={revealedPlayer?.name} 
               className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
             />
             
             {/* Stats Overlay */}
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="flex items-center justify-between mb-4">
                   <div className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent text-[8px] font-black uppercase">
                     {revealedPlayer?.tier}
                   </div>
                   <div className="text-[10px] font-bold text-white/60 tracking-widest uppercase">
                     {revealedPlayer?.roleTags[0]}
                   </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                   {Object.entries(revealedPlayer?.stats || {}).slice(0, 3).map(([stat, val]) => (
                     <div key={stat} className="text-center">
                        <div className="text-[8px] text-muted uppercase font-bold">{stat}</div>
                        <div className="text-lg font-black text-white italic">{val as number}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-12 w-full py-5 btn-primary rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 duration-200"
          >
            Aggiungi al Roster
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% { width: 0; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0); }
          100% { width: 0; transform: translateX(100%); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
