"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { validateSquad } from "@/types/squad";
import { MatchEngine } from "@/engine/match-engine";
import { generateSeed } from "@/engine/random";
import { formatMatchEvent, tickToMatchTime } from "@/utils/formatting";
import type { MatchEvent } from "@/types/match";
import { STARTER_PLAYERS } from "@/content/players";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { EventBus } from "@/game/EventBus";

const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), { ssr: false });

export default function MatchPage() {
  const router = useRouter();

  const { lineup, availablePlayers, playstyle, stance, command, setStance, setCommand, setMatchResult, addRewards } = useGameStore();
  const validation = validateSquad(lineup, availablePlayers);

  const engineRef = useRef<MatchEngine | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const homeRosterRef = useRef<typeof STARTER_PLAYERS>([]);
  const awayRosterRef = useRef<typeof STARTER_PLAYERS>([]);

  const [tick, setTick] = useState(0);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [phaserReady, setPhaserReady] = useState(false);

  const totalTicks = 90;

  // Build engine once on mount
  useEffect(() => {
    if (!validation.valid || engineRef.current) return;

    const homeRoster = lineup.map(l => availablePlayers.find(p => p.id === l.playerId)!);
    const awayRoster = [...homeRoster].reverse();
    homeRosterRef.current = homeRoster;
    awayRosterRef.current = awayRoster;

    engineRef.current = new MatchEngine(
      {
        totalTicks,
        halftimeTick: 45,
        seed: generateSeed(),
        homePlaystyle: playstyle,
        awayPlaystyle: "counter_attack",
        homeStance: stance,
        awayStance: "balanced",
        homeCommand: command,
        awayCommand: "none",
      },
      homeRoster,
      awayRoster
    );

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.valid]);

  // Listen for Phaser scene ready, THEN init match
  useEffect(() => {
    const onSceneReady = () => {
      setPhaserReady(true);
      EventBus.emit("init-match", {
        homeRoster: homeRosterRef.current,
        awayRoster: awayRosterRef.current,
      });
    };

    EventBus.on("current-scene-ready", onSceneReady);
    return () => { EventBus.off("current-scene-ready", onSceneReady); };
  }, []);

  // Start game loop only when both engine and phaser are ready
  useEffect(() => {
    if (!phaserReady || !engineRef.current || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (!engineRef.current) return;

      const newEvents = engineRef.current.tick();
      const state = engineRef.current.getState();

      setTick(state.tick);
      setScore({ home: state.homeScore, away: state.awayScore });

      if (newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents]);
        newEvents.forEach(e => EventBus.emit("match-event", e));
      }

      if (state.phase === "finished") {
        EventBus.emit("match-finished");
        clearInterval(intervalRef.current!);
        setIsFinished(true);
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phaserReady]);

  // Auto-scroll feed
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

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

  const handleStanceChange = (s: "balanced" | "aggressive" | "defensive") => {
    setStance(s);
    engineRef.current?.intervene("home", { type: "stance_change", stance: s });
  };

  const finishMatch = () => {
    if (!engineRef.current) return;
    const matchOutcome = engineRef.current.getResult();
    setMatchResult({
      id: crypto.randomUUID(),
      userId: "local",
      squadId: "squad_1",
      opponentSeed: 0,
      result: matchOutcome.result,
      playerStats: matchOutcome.playerStats,
      rewards: { xp: 50, currency: 25 },
      timeline: engineRef.current.getTimeline(),
      createdAt: new Date().toISOString(),
    });
    addRewards(50, 25);
    router.push("/results");
  };

  const progress = (tick / totalTicks) * 100;

  return (
    <div className="fixed inset-0 top-[57px] flex flex-col overflow-hidden">
      {/* Main content: two columns — fills remaining height */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left: Arena — takes all available height */}
        <div className="flex-1 flex flex-col bg-[#05070e] relative overflow-hidden min-h-0">
          {/* Neon progress bar */}
          <div className="h-0.5 w-full bg-border/30 absolute top-0 left-0 z-10">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%`, boxShadow: "0 0 12px #6366f1" }}
            />
          </div>

          {/* HUD */}
          <div className="flex items-center justify-between px-6 py-3 z-10 relative" style={{background: 'linear-gradient(180deg, rgba(5,7,14,0.95) 0%, transparent 100%)'}}>
            {/* Team label */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" style={{boxShadow: '0 0 8px #6366f1'}} />
              <span className="text-xs font-semibold text-foreground/80 capitalize tracking-wide">{playstyle.replace(/_/g, " ")}</span>
            </div>

            {/* Scoreboard */}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-[10px] text-accent/70 uppercase tracking-widest font-mono mb-0.5">You</div>
                <div className="text-5xl font-black tabular-nums text-white" style={{textShadow: '0 0 20px rgba(99,102,241,0.5)'}}>{score.home}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xs text-foreground/40 font-mono tabular-nums">{tickToMatchTime(tick, totalTicks)}</div>
                <div className="text-foreground/30 text-base my-0.5">vs</div>
                {!phaserReady && <div className="text-[9px] text-muted animate-pulse">Loading...</div>}
              </div>
              <div className="text-left">
                <div className="text-[10px] text-rose-400/70 uppercase tracking-widest font-mono mb-0.5">CPU</div>
                <div className="text-5xl font-black tabular-nums text-rose-400">{score.away}</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-muted' : 'bg-emerald-400 animate-pulse'}`} style={isFinished ? {} : {boxShadow: '0 0 8px #34d399'}} />
              <span className="text-[10px] text-muted uppercase tracking-widest font-mono">{isFinished ? 'FT' : 'Live'}</span>
            </div>
          </div>

          {/* Phaser Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <PhaserGame />
          </div>
        </div>

        {/* Right: Feed + Controls — fixed width, never scrolls the page */}
        <div className="w-80 flex flex-col border-l border-border bg-[#07090f] min-h-0 overflow-hidden">
          {/* Match Feed */}
          <div className="p-3 border-b border-border">
            <span className="text-xs text-muted uppercase tracking-widest font-mono">Match Feed</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 font-mono text-xs">
            {events.length === 0 && (
              <div className="text-center text-muted italic py-8">
                {phaserReady ? "Kick-off incoming..." : "Loading..."}
              </div>
            )}
            {events.map((e, idx) => {
              const isGoal = e.type === "goal";
              const isBreak = e.type === "halftime" || e.type === "full_time";
              return (
                <div
                  key={`${e.tick}-${idx}`}
                  className={`flex gap-2 items-start rounded px-2 py-1.5 fade-in ${
                    isGoal
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold"
                      : isBreak
                      ? "bg-accent/10 border border-accent/20 text-accent font-semibold justify-center text-center"
                      : "text-foreground/60 hover:text-foreground/90"
                  }`}
                >
                  {!isBreak && (
                    <span className="text-muted/50 shrink-0 tabular-nums">
                      {tickToMatchTime(e.tick, totalTicks)}
                    </span>
                  )}
                  <span>{formatMatchEvent(e, STARTER_PLAYERS)}</span>
                </div>
              );
            })}
            <div ref={feedEndRef} />
          </div>

          {/* CTA when finished */}
          {isFinished && (
            <div className="p-4 border-t border-border fade-in">
              <button onClick={finishMatch} className="btn-primary w-full">
                View Results →
              </button>
            </div>
          )}

          {/* Tactical Controls */}
          <div className="border-t border-border p-4 space-y-4">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-widest mb-2">Stance</div>
              <div className="flex gap-1.5">
                {(["balanced", "aggressive", "defensive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStanceChange(s)}
                    disabled={isFinished}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
                      stance === s
                        ? "bg-accent text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                        : "bg-white/5 text-muted hover:bg-white/10 hover:text-foreground disabled:opacity-40"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-muted uppercase tracking-widest mb-2">Command</div>
              <div className="flex gap-1.5">
                {(["none", "focus_attack", "protect_lead"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCommand(c)}
                    disabled={isFinished}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
                      command === c
                        ? "bg-accent text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                        : "bg-white/5 text-muted hover:bg-white/10 hover:text-foreground disabled:opacity-40"
                    }`}
                  >
                    {c === "none" ? "None" : c === "focus_attack" ? "Attack" : "Protect"}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-2 rounded text-xs font-semibold bg-white/5 text-muted/40 cursor-not-allowed border border-dashed border-border" disabled>
              ⚡ Ultimate — Charging...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
