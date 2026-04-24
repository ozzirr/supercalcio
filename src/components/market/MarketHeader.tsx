"use client";

import { useGameStore } from "@/lib/store/game-store";

export function MarketHeader() {
  const currency = useGameStore((s) => s.currency);

  return (
    <div className="relative px-4 lg:px-8 pt-8 lg:pt-12 pb-6 lg:pb-8 overflow-hidden border-b border-white/5 bg-surface/30 backdrop-blur-xl">
      {/* Cinematic background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[300px] lg:w-[600px] h-[150px] lg:h-[300px] bg-accent/10 blur-[120px] rounded-full opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-accent/20 bg-accent/5 text-accent text-[10px] uppercase tracking-[0.2em] font-black w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            LIVE TRANSFER HUB
          </div>
          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none">
            Mercato <span className="text-accent">GOLAZOO</span>
          </h1>
          <p className="text-muted text-xs lg:text-sm font-medium tracking-tight max-w-md">
            Scout, acquista e vendi i migliori talenti della Serie A per dominare l'arena.
          </p>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-accent/20 blur-2xl group-hover:bg-accent/30 transition-all rounded-full opacity-50"></div>
          <div className="relative card px-6 lg:px-10 py-4 lg:py-6 border-accent/40 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(251,191,36,0.15)] flex flex-col items-center lg:items-end min-w-[240px]">
            <div className="text-[10px] lg:text-[12px] text-muted uppercase font-black tracking-widest mb-1 opacity-80">
              Budget Disponibile
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl lg:text-5xl font-black italic text-accent drop-shadow-sm tracking-tighter">
                {currency.toLocaleString()}
              </div>
              <span className="text-sm lg:text-lg font-black text-accent/60 mt-2">CR</span>
            </div>
            <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-accent animate-pulse shadow-[0_0_10px_#fbbf24]" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
