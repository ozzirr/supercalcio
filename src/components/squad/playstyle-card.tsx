"use client";

import type { PlaystyleDefinition } from "@/types/squad";

type PlaystyleCardProps = {
  playstyle: PlaystyleDefinition;
  selected: boolean;
  onClick: () => void;
};

const MODIFIER_LABELS: Record<string, string> = {
  possessionBias: "Possession",
  pressIntensity: "Pressing",
  counterSpeed: "Counter",
  defenseLine: "Line Height",
  passingTempo: "Tempo",
};

function modifierBar(value: number, isBias = false) {
  const pct = isBias ? ((value + 1) / 2) * 100 : value * 100;
  return (
    <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-accent/60 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PlaystyleCard({ playstyle, selected, onClick }: PlaystyleCardProps) {
  const mods = playstyle.modifiers;

  return (
    <button
      onClick={onClick}
      className={`card card-hover p-4 text-left transition-all w-full ${
        selected ? "border-accent ring-1 ring-accent bg-accent/5 scale-[1.02] shadow-[0_0_24px_rgba(251,191,36,0.15)]" : "border-white/5"
      }`}
    >
      <div className="font-semibold mb-1">{playstyle.name}</div>
      <p className="text-xs text-muted leading-relaxed mb-3">{playstyle.description}</p>

      <div className="space-y-1.5">
        {Object.entries(mods).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] text-muted w-14 uppercase tracking-wide">{MODIFIER_LABELS[key]}</span>
            {modifierBar(value, key === "possessionBias")}
          </div>
        ))}
      </div>
    </button>
  );
}
