"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";

export default function DashboardPage() {
  const lineup = useGameStore((s) => s.lineup);
  const playstyle = useGameStore((s) => s.playstyle);
  const xp = useGameStore((s) => s.xp);

  const squadPlayers = lineup
    .sort((a, b) => a.position - b.position)
    .map((slot) => STARTER_PLAYERS.find((p) => p.id === slot.playerId))
    .filter(Boolean);

  const isSquadReady = lineup.length === 5;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Project X</h1>
          <p className="text-muted text-lg">Build your squad. Choose your strategy. Dominate the arena.</p>
        </div>

        {/* Squad summary */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Squad</h2>
            <Link href="/squad" className="text-sm text-accent hover:text-accent-hover transition-colors">
              Edit Squad
            </Link>
          </div>

          {lineup.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted mb-4">No squad assembled yet.</p>
              <Link href="/squad" className="btn-primary inline-block">
                Build Your Squad
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }, (_, i) => {
                  const player = squadPlayers[i];
                  return (
                    <div
                      key={i}
                      className={`rounded-lg p-3 text-center text-sm ${
                        player ? "bg-surface-hover border border-border" : "border border-dashed border-border"
                      }`}
                    >
                      {player ? (
                        <>
                          <div className="w-10 h-10 mx-auto rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold mb-1">
                            {player.name[0]}
                          </div>
                          <div className="font-medium truncate">{player.name}</div>
                          <div className="text-xs text-muted capitalize">{player.roleTags[0]}</div>
                        </>
                      ) : (
                        <div className="py-3 text-muted">Empty</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Playstyle: <span className="text-foreground capitalize">{playstyle.replace(/_/g, " ")}</span></span>
                <span>{lineup.length}/5 players</span>
              </div>
            </>
          )}
        </div>

        {/* Play button */}
        <div className="text-center">
          <Link
            href={isSquadReady ? "/match" : "/squad"}
            className={`btn-primary inline-block text-lg px-12 py-3 ${!isSquadReady ? "opacity-50" : ""}`}
          >
            {isSquadReady ? "Play Match" : "Complete Your Squad"}
          </Link>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Level", value: Math.floor(xp / 100) + 1 },
            { label: "Squad Size", value: `${lineup.length}/5` },
            { label: "XP", value: xp },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
