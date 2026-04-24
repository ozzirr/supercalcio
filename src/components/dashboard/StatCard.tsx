"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  color: "accent" | "cyan" | "emerald" | "rose";
}

export function StatCard({ label, value, subValue, icon, color }: StatCardProps) {
  const colorMap: Record<string, string> = {
    accent: "text-gold border-gold/30 shadow-[0_0_20px_rgba(255,193,32,0.1)]",
    cyan: "text-cyan-400 border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]",
    emerald: "text-emerald-400 border-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]",
    rose: "text-rose-400 border-rose-400/20 shadow-[0_0_20px_rgba(251,113,133,0.1)]",
  };

  const selectedColor = colorMap[color] || colorMap.accent;
  const textColorClass = selectedColor.split(' ')[0];
  const borderColorClass = selectedColor.split(' ')[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass-premium px-6 py-5 rounded-2xl flex items-center gap-5 border ${borderColorClass} transition-all duration-300 relative overflow-hidden group`}
    >
      {/* Icon Circle */}
      <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border ${borderColorClass} flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
         {icon}
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em]">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black italic tracking-tighter uppercase leading-none ${textColorClass}`}>
            {value}
          </span>
          {subValue && (
            <span className={`text-[11px] font-black uppercase tracking-widest ${textColorClass} opacity-60`}>{subValue}</span>
          )}
        </div>
      </div>
      
      {/* Subtle Glow */}
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 blur-[30px] opacity-10 ${textColorClass.replace('text-', 'bg-')}`}></div>
    </motion.div>
  );
}
