"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store/game-store";

export default function ResultsPage() {
  const currentMatch = useGameStore((s) => s.currentMatch);
  const clearMatch = useGameStore((s) => s.clearMatch);

  if (!currentMatch) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="card p-8 text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold">No Match Results</h2>
          <p className="text-muted">Play a match first to see results here.</p>
          <Link href="/dashboard" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { result, rewards } = currentMatch;
  const outcomeColor =
    result.outcome === "win"
      ? "text-success"
      : result.outcome === "loss"
        ? "text-danger"
        : "text-warning";

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Outcome */}
        <div className="text-center space-y-2">
          <div className={`text-5xl font-black uppercase ${outcomeColor}`}>
            {result.outcome === "win" ? "Victory" : result.outcome === "loss" ? "Defeat" : "Draw"}
          </div>
          <div className="text-3xl font-bold">
            {result.homeScore} — {result.awayScore}
          </div>
        </div>

        {/* Rewards */}
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-muted uppercase text-sm tracking-wider">Rewards</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">+{rewards.xp}</div>
              <div className="text-sm text-muted">XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">+{rewards.currency}</div>
              <div className="text-sm text-muted">Credits</div>
            </div>
          </div>
        </div>

        {/* Highlights placeholder */}
        <div className="card p-6">
          <h3 className="font-semibold text-muted uppercase text-sm tracking-wider mb-3">Highlights</h3>
          <div className="text-sm text-muted text-center py-4">
            Match timeline will display here (Milestone 3+)
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/squad"
            onClick={() => clearMatch()}
            className="btn-secondary"
          >
            Edit Squad
          </Link>
          <Link
            href="/match"
            onClick={() => clearMatch()}
            className="btn-primary"
          >
            Play Again
          </Link>
        </div>
      </div>
    </div>
  );
}
