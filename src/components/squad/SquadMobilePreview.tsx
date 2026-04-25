"use client";

import { motion } from "framer-motion";

export function SquadMobilePreview() {
  return (
    <div className="hidden 2xl:flex w-[400px] flex-col items-center justify-center p-8 bg-[#05070a]/30 border-l border-white/5 relative z-0">
      <div className="text-white/20 font-black uppercase text-[10px] tracking-[0.4em] mb-8 flex items-center gap-3">
         <div className="w-8 h-px bg-white/10" />
         MOBILE PREVIEW
         <div className="w-8 h-px bg-white/10" />
      </div>

      {/* iPhone Mockup */}
      <div className="relative w-[280px] h-[580px] bg-[#05070a] rounded-[3rem] border-[8px] border-[#1a1a1a] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-50 flex items-center justify-center">
           <div className="w-12 h-1 rounded-full bg-white/5" />
        </div>

        {/* Screen Content */}
        <div className="absolute inset-0 bg-[#05070a] flex flex-col pt-8 pb-4">
          {/* Header Mobile */}
          <div className="px-4 flex items-center justify-between mb-4">
             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">☰</div>
             <img src="/assets/logo.png" className="h-6 w-auto grayscale brightness-200" alt="logo" />
             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">↻</div>
          </div>

          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
               <div className="w-6 h-6 rounded-md bg-gold flex items-center justify-center text-[10px]">🛡️</div>
               <div className="flex-1">
                  <div className="text-[8px] font-black text-white leading-none">AC VOSTRA <span className="text-gold ml-2 uppercase">ELITE SQUAD</span></div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                     <div className="w-[72%] h-full bg-gold" />
                  </div>
               </div>
            </div>
          </div>

          <div className="px-4 space-y-1 mb-4">
             <h2 className="text-sm font-black italic tracking-tighter text-white uppercase">SQUAD <span className="text-gold">BUILDER</span></h2>
             <div className="flex items-center gap-4 text-[7px] font-bold text-white/30 uppercase tracking-widest">
                <span>POT. 2,840</span>
                <span>OVR 78</span>
                <span>INT. <span className="text-emerald-400">85%</span></span>
             </div>
          </div>

          {/* Mini Pitch */}
          <div className="px-3 flex-1">
             <div className="w-full h-full rounded-2xl bg-[#052c16] relative overflow-hidden p-2 border border-white/10 shadow-inner">
                {/* Mini Field Lines */}
                <div className="absolute inset-0 border border-white/5 rounded-2xl m-2 pointer-events-none" />
                <div className="absolute top-1/2 inset-x-0 h-px bg-white/5 pointer-events-none" />
                
                {/* Mini Player Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-gold/20 border border-gold/40 rounded-md" />
                <div className="absolute top-1/2 left-4 w-8 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded-md" />
                <div className="absolute top-1/2 right-4 w-8 h-10 bg-amber-500/20 border border-amber-500/40 rounded-md" />
                <div className="absolute top-6 left-12 w-8 h-10 bg-rose-500/20 border border-rose-500/40 rounded-md" />
                <div className="absolute top-6 right-12 w-8 h-10 bg-purple-500/20 border border-purple-500/40 rounded-md" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-10 h-10 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/5 text-lg font-light">+</div>
                </div>
             </div>
          </div>

          {/* Mini Actions */}
          <div className="p-4 grid grid-cols-2 gap-2">
             <div className="py-2 bg-white/5 rounded-lg text-[7px] font-black text-center text-white/40 border border-white/10">AUTO-COMPLETA</div>
             <div className="py-2 bg-gold rounded-lg text-[7px] font-black text-center text-black">INIZIA PARTITA ➔</div>
          </div>

          {/* Mini Tactics */}
          <div className="px-4 mb-4">
             <div className="p-3 bg-gold/15 border border-gold/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className="text-xs">⚡</span>
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-gold uppercase tracking-tighter">AGGRESSIVE PRESS</span>
                      <div className="flex gap-0.5 mt-1">
                         {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-0.5 bg-gold rounded-full" />)}
                      </div>
                   </div>
                </div>
                <span className="text-[8px] text-white/20">▼</span>
             </div>
          </div>

          {/* Bottom Nav Mobile */}
          <div className="mt-auto h-12 bg-[#05070a] border-t border-white/5 flex items-center justify-around px-2">
             {["🏠", "👕", "📊", "🏆", "🛒"].map((emoji, i) => (
               <div key={i} className={`flex flex-col items-center gap-0.5 ${i === 1 ? 'text-gold' : 'text-white/20'}`}>
                  <span className="text-sm">{emoji}</span>
                  <div className={`w-1 h-1 rounded-full ${i === 1 ? 'bg-gold' : 'transparent'}`} />
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
         <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Live Sync Active</span>
      </div>
    </div>
  );
}
