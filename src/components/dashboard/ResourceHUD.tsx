"use client";

import { motion } from "framer-motion";

interface ResourceWidgetProps {
  label: string;
  value: string | number;
  icon: string;
  subValue?: string;
  color?: "accent" | "cyan" | "emerald";
}

function ResourceWidget({ label, value, icon, subValue, color = "accent" }: ResourceWidgetProps) {
  const colorMap = {
    accent: "text-accent bg-accent/10 border-accent/20",
    cyan: "text-secondary bg-secondary/10 border-secondary/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };

  return (
    <div className="card p-4 flex items-center justify-between border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
      <div className="min-w-0">
        <div className="text-[8px] lg:text-[10px] text-muted font-black uppercase tracking-widest mb-1.5">{label}</div>
        <div className={`text-xl lg:text-2xl font-black italic tabular-nums truncate ${colorMap[color].split(' ')[0]}`}>
          {value}
          {subValue && <span className="ml-1 text-[9px] lg:text-[10px] font-normal opacity-60 italic">{subValue}</span>}
        </div>
      </div>
      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-xl lg:text-2xl border ${colorMap[color]} group-hover:scale-110 transition-transform shadow-inner`}>
        {icon}
      </div>
    </div>
  );
}

interface ResourceHUDProps {
  currency: number;
  energy: number;
  level: number;
  rank: number | null;
}

export function ResourceHUD({ currency, energy, level, rank }: ResourceHUDProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <ResourceWidget 
        label="Crediti Disponibili" 
        value={currency.toLocaleString()} 
        subValue="CR" 
        icon="💰" 
        color="accent" 
      />
      <ResourceWidget 
        label="Stamina Arena" 
        value={energy} 
        subValue="/3" 
        icon="⚡" 
        color="cyan" 
      />
      <ResourceWidget 
        label="Manager Rank" 
        value={level} 
        subValue="LVL" 
        icon="🏆" 
        color="accent" 
      />
      <ResourceWidget 
        label="Posizione Mondiale" 
        value={rank ? `#${rank}` : "---"} 
        icon="🌍" 
        color="emerald" 
      />
    </div>
  );
}
