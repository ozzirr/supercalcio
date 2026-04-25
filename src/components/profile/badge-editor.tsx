"use client";

import { useState } from "react";
import type { CustomBadge, BadgeShape, BadgeSymbol } from "@/types/badge";

const SHAPES: BadgeShape[] = ["shield", "circle", "hexagon", "square"];
const SYMBOLS: BadgeSymbol[] = [
  "lightning", "dragon", "shield", "fire", "star",
  "crown", "sword", "trophy", "phoenix", "mountain",
  "wave", "leaf", "heart", "diamond", "flame"
];

const SYMBOL_EMOJIS: Record<BadgeSymbol, string> = {
  lightning: "⚡",
  dragon: "🐉",
  shield: "🛡️",
  fire: "🔥",
  star: "⭐",
  crown: "👑",
  sword: "⚔️",
  trophy: "🏆",
  phoenix: "🔥",
  mountain: "⛰️",
  wave: "🌊",
  leaf: "🍃",
  heart: "❤️",
  diamond: "💎",
  flame: "🔥",
};

const COLORS = [
  "#FFC324", // gold
  "#FF1744", // red
  "#00BCD4", // cyan
  "#4CAF50", // green
  "#9C27B0", // purple
  "#FF9800", // orange
  "#2196F3", // blue
  "#E91E63", // pink
  "#FFFFFF", // white
  "#000000", // black
];

interface BadgeEditorProps {
  onSave: (badge: CustomBadge) => void;
  onCancel: () => void;
  initialBadge?: CustomBadge;
}

export function BadgeEditor({ onSave, onCancel, initialBadge }: BadgeEditorProps) {
  const [shape, setShape] = useState<BadgeShape>(initialBadge?.shape || "shield");
  const [bgColor, setBgColor] = useState(initialBadge?.backgroundColor || "#FFC324");
  const [borderColor, setBorderColor] = useState(initialBadge?.borderColor || "#FFFFFF");
  const [symbol, setSymbol] = useState<BadgeSymbol>(initialBadge?.symbol || "lightning");

  const getShapeClass = () => {
    const baseClass = "w-32 h-32 flex items-center justify-center text-5xl font-black border-4 transition-all";
    switch (shape) {
      case "circle":
        return `${baseClass} rounded-full`;
      case "hexagon":
        return `${baseClass} clip-path-hexagon`;
      case "square":
        return `${baseClass} rounded-lg`;
      case "shield":
      default:
        return `${baseClass} shield-shape`;
    }
  };

  const handleSave = () => {
    const newBadge: CustomBadge = {
      id: initialBadge?.id || `custom_${Date.now()}`,
      shape,
      backgroundColor: bgColor,
      borderColor,
      symbol,
      symbolColor: "#000000",
      createdAt: initialBadge?.createdAt || Date.now(),
    };
    onSave(newBadge);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="card w-full max-w-2xl p-8 space-y-6 shadow-[0_0_80px_rgba(251,191,36,0.1)] border-accent/20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Configura Stemma</h2>
          <button onClick={onCancel} className="text-muted hover:text-white text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Preview */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Anteprima</p>
            <div
              className={getShapeClass()}
              style={{
                backgroundColor: bgColor,
                borderColor: borderColor,
                color: "#000000",
              }}
            >
              {SYMBOL_EMOJIS[symbol]}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            {/* Forma */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-2 block">Forma</label>
              <div className="grid grid-cols-4 gap-2">
                {SHAPES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setShape(s)}
                    className={`p-3 rounded-lg text-xs font-black uppercase transition-all ${
                      shape === s
                        ? "bg-accent text-black"
                        : "bg-white/5 border border-white/10 hover:border-accent/40 text-white/70"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colore Sfondo */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-2 block">Colore Sfondo</label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all border-2 ${
                      bgColor === color ? "border-white scale-110" : "border-white/20"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Colore Bordo */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-2 block">Colore Bordo</label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBorderColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all border-2 ${
                      borderColor === color ? "border-accent scale-110" : "border-white/20"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Simbolo */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-2 block">Simbolo</label>
              <div className="grid grid-cols-5 gap-2 max-h-20 overflow-y-auto">
                {SYMBOLS.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSymbol(sym)}
                    className={`p-2 rounded-lg text-2xl transition-all ${
                      symbol === sym
                        ? "bg-accent scale-110"
                        : "bg-white/5 border border-white/10 hover:border-accent/40"
                    }`}
                  >
                    {SYMBOL_EMOJIS[sym]}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em]"
          >
            Salva Stemma
          </button>
        </div>
      </div>
    </div>
  );
}
