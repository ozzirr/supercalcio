"use client";

import type { PlayerDefinition } from "@/types/player";

interface PlayerInspectorPanelProps {
  player: PlayerDefinition | null;
  onClose: () => void;
  onAssign: (player: PlayerDefinition) => void;
  isAssigned: boolean;
  activeSlotLabel: string | null;
}

export function PlayerInspectorPanel({ player, onClose, onAssign, isAssigned, activeSlotLabel }: PlayerInspectorPanelProps) {
  if (!player) return (
    <div className="h-full flex items-center justify-center p-8 text-center bg-black/20">
      <div className="space-y-4">
        <div className="text-4xl opacity-20">🔍</div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">Select Unit for Inspection</div>
      </div>
    </div>
  );

  const stats = [
    { label: "PAC", value: player.stats.pace },
    { label: "SHO", value: player.stats.shooting },
    { label: "PAS", value: player.stats.passing },
    { label: "DEF", value: player.stats.defense },
    { label: "PHY", value: player.stats.physical },
  ];


  return (
    <div className="h-full flex flex-col bg-[#0a0c10] border-l border-white/5">
      {/* Header Info */}
      <div className="p-4 bg-surface/30 border-b border-white/5">
        <div className="flex items-start justify-between mb-2">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-accent/30 shadow-lg">
                <img src={`/assets/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase italic tracking-tight text-white leading-tight">{player.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="text-[9px] font-black uppercase tracking-widest text-accent">{player.tier}</span>
                   <span className="text-[9px] font-black uppercase tracking-widest text-muted">{player.roleTags[0]}</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="text-muted hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Core Stats Grid */}
        <div className="grid grid-cols-5 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-white/5 border border-white/5">
               <div className="text-[8px] font-black text-muted uppercase mb-1">{s.label}</div>
               <div className="text-xs font-black text-white">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tactical Skills */}
        <div className="space-y-4">
           <div className="text-[9px] font-black uppercase tracking-[0.3em] text-accent border-b border-accent/20 pb-1.5">Specialized Doctrines</div>
           
           <div className="space-y-2">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                 <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-black uppercase italic text-white">{player.passive.name}</div>
                    <span className="text-[7px] font-black uppercase px-1 rounded bg-blue-500/20 text-blue-400">Passive</span>
                 </div>
                 <div className="text-[9px] text-muted leading-tight">{player.passive.description}</div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                 <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-black uppercase italic text-white">{player.activeSkill.name}</div>
                    <span className="text-[7px] font-black uppercase px-1 rounded bg-emerald-500/20 text-emerald-400">Active</span>
                 </div>
                 <div className="text-[9px] text-muted leading-tight">{player.activeSkill.description}</div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                 <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-black uppercase italic text-white">{player.ultimate.name}</div>
                    <span className="text-[7px] font-black uppercase px-1 rounded bg-purple-500/20 text-purple-400">Ultimate</span>
                 </div>
                 <div className="text-[9px] text-muted leading-tight">{player.ultimate.description}</div>
              </div>
           </div>
        </div>

        {/* Tactical Insight */}
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 italic">
           <div className="text-[8px] font-black uppercase text-accent mb-2">Tactical Bio</div>
           <p className="text-[10px] text-muted/80 leading-relaxed">
             &quot;{player.flavorText}&quot;
           </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/5 bg-black/40">
        {!isAssigned && (
          <button
            onClick={() => onAssign(player)}
            className="w-full py-3 bg-accent text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-accent/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {activeSlotLabel ? `DEPLOY TO ${activeSlotLabel}` : "DEPLOY TO SQUAD"}
          </button>
        )}
        {isAssigned && (
          <div className="w-full py-3 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-lg text-center border border-white/10">
            UNIT ALREADY DEPLOYED
          </div>
        )}
      </div>
    </div>
  );
}
