"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store/game-store";
import { tickToMatchTime, formatMatchEvent } from "@/utils/formatting";
import { STARTER_PLAYERS } from "@/content/players";

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
    <div className="flex-1 flex items-center justify-center px-4 lg:px-8 py-8 lg:py-12 bg-surface">
      <div className="w-full max-w-lg space-y-6 lg:space-y-8">
        {/* Outcome */}
        <div className="text-center space-y-2 lg:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest font-black text-muted mb-2">
            Match Report
          </div>
          <div className={`text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none ${outcomeColor}`}
            style={{ textShadow: `0 0 30px ${result.outcome === 'win' ? 'rgba(52,211,153,0.3)' : result.outcome === 'loss' ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
            {result.outcome === "win" ? "Victoria" : result.outcome === "loss" ? "Defeat" : "Pari"}
          </div>
          <div className="text-3xl lg:text-5xl font-black italic tracking-tight text-white/90">
            {result.homeScore} <span className="text-muted/50 mx-1">—</span> {result.awayScore}
          </div>
        </div>

        {/* Rewards */}
        <div className="card p-6 lg:p-8 space-y-4 lg:space-y-6 bg-accent/5 border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-5 rounded-full blur-3xl -mr-16 -mt-16" />
          <h3 className="font-black text-accent uppercase text-[10px] lg:text-xs tracking-[0.3em] text-center">Reward Pack</h3>
          <div className="grid grid-cols-2 gap-6 lg:gap-8">
            <div className="text-center group">
              <div className="text-3xl lg:text-5xl font-black text-white italic transition-transform group-hover:scale-110">+{rewards.xp}</div>
              <div className="text-[10px] lg:text-xs text-muted uppercase tracking-widest font-bold mt-1">Exp Points</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl lg:text-5xl font-black text-accent italic transition-transform group-hover:scale-110">+{rewards.currency}</div>
              <div className="text-[10px] lg:text-xs text-muted uppercase tracking-widest font-bold mt-1">Credits</div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="card p-5 lg:p-6 bg-black/20 border-white/5">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="font-black text-muted uppercase text-[9px] lg:text-[10px] tracking-widest">Post-Match Chronicle</h3>
            <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-white/40 uppercase font-black">Highlights</span>
          </div>
          <div className="text-[10px] lg:text-sm space-y-3 max-h-48 lg:max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {currentMatch.timeline.events.filter(e => e.type === "goal" || e.metadata?.quality === "excellent" || e.metadata?.note === "Crucial block").map((e, idx) => (
              <div key={idx} className="flex gap-4 items-center p-2 rounded-lg bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                <span className="text-accent font-black font-mono text-xs w-12 shrink-0">{tickToMatchTime(e.tick, 90)}</span>
                <span className={`leading-tight ${e.type === "goal" ? "text-accent font-black italic uppercase" : "text-foreground/80 font-medium"}`}>
                  {formatMatchEvent(e, STARTER_PLAYERS)}
                </span>
              </div>
            ))}
            {currentMatch.timeline.events.filter(e => e.type === "goal" || e.metadata?.quality === "excellent" || e.metadata?.note === "Crucial block").length === 0 && (
              <div className="text-muted text-center italic py-4 text-xs font-medium">No strategic highlights recorded in this session.</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
          <Link
            href="/squad"
            onClick={() => clearMatch()}
            className="flex-1 lg:flex-none btn-secondary py-3 lg:px-8 text-[10px] uppercase font-black tracking-widest text-center"
          >
            Tactical Lab
          </Link>
          <Link
            href="/match"
            onClick={() => clearMatch()}
            className="flex-1 lg:flex-none btn-primary py-3 lg:px-12 text-[10px] uppercase font-black tracking-widest text-center shadow-xl shadow-accent/20"
          >
            Intervene Again
          </Link>
        </div>
      </div>
    </div>
  );
}
