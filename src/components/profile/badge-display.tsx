"use client";

import type { CustomBadge } from "@/types/badge";

const SYMBOL_EMOJIS: Record<string, string> = {
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

interface BadgeDisplayProps {
  badge: CustomBadge | null;
  size?: "sm" | "md" | "lg";
}

export function BadgeDisplay({ badge, size = "md" }: BadgeDisplayProps) {
  if (!badge) return null;

  const sizeClass = {
    sm: "w-12 h-12 text-2xl",
    md: "w-20 h-20 text-4xl",
    lg: "w-32 h-32 text-5xl",
  }[size];

  const getShapeClass = () => {
    const baseClass = `${sizeClass} flex items-center justify-center font-black border-2 transition-all`;
    switch (badge.shape) {
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

  return (
    <div
      className={getShapeClass()}
      style={{
        backgroundColor: badge.backgroundColor,
        borderColor: badge.borderColor,
        color: "#000000",
      }}
    >
      {SYMBOL_EMOJIS[badge.symbol]}
    </div>
  );
}
