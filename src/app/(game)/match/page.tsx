"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store/game-store";
import { validateSquad } from "@/types/squad";

export default function MatchPage() {
  const { lineup, availablePlayers, playstyle, stance, command, setStance, setCommand } = useGameStore();
  const validation = validateSquad(lineup, availablePlayers);

  if (!validation.valid) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="card p-8 text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold">Squad Not Ready</h2>
          <p className="text-muted">You need a valid squad of 5 players before starting a match.</p>
          <Link href="/squad" className="btn-primary inline-block">
            Go to Squad Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Match viewer area — Phaser will mount here in Milestone 4 */}
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <div className="w-full max-w-3xl aspect-video rounded-xl border border-border bg-background flex items-center justify-center mx-auto" style={{ minWidth: 640 }}>
            <div className="text-muted space-y-2">
              <div className="text-4xl">Arena</div>
              <div className="text-sm">Match viewer will render here (Milestone 4)</div>
            </div>
          </div>

          {/* HUD */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="card px-4 py-2">
              <span className="text-muted">Playstyle: </span>
              <span className="capitalize">{playstyle.replace(/_/g, " ")}</span>
            </div>
            <div className="card px-4 py-2">
              <span className="text-muted">Score: </span>
              <span className="font-bold">0 - 0</span>
            </div>
            <div className="card px-4 py-2">
              <span className="text-muted">Time: </span>
              <span>00:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactical controls */}
      <div className="border-t border-border p-4 bg-surface">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          {/* Stance */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted mr-2">Stance:</span>
            {(["balanced", "aggressive", "defensive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStance(s)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  stance === s
                    ? "bg-accent text-white"
                    : "bg-background text-muted hover:text-foreground"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Commands */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted mr-2">Command:</span>
            {(["none", "focus_attack", "protect_lead"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCommand(c)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  command === c
                    ? "bg-accent text-white"
                    : "bg-background text-muted hover:text-foreground"
                }`}
              >
                {c === "none" ? "None" : c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Ultimate placeholder */}
          <button
            className="btn-secondary opacity-50 cursor-not-allowed text-sm"
            disabled
          >
            Ultimate (charging...)
          </button>
        </div>
      </div>
    </div>
  );
}
