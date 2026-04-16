"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

  const [tick, setTick] = useState(0);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const totalTicks = 90;

  useEffect(() => {
    if (!validation.valid) return;

    // Initialize the engine once
    if (!engineRef.current) {
      const homeRoster = lineup.map(l => availablePlayers.find(p => p.id === l.playerId)!);
      
      // For now, MVP: play against an identical but offset squad
      const awayRoster = [...homeRoster].reverse();

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

      // Tell Phaser the rosters
      EventBus.emit("init-match", { homeRoster, awayRoster });

      // Start the game loop (1 second per tick for readable text feed)
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
      }, 500); // 500ms for slightly faster than 1 second per tick
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.valid]);

  // Keep scroll at bottom of feed
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
    if (engineRef.current) {
      engineRef.current.intervene("home", { type: "stance_change", stance: s });
    }
  };

  const finishMatch = () => {
    if (engineRef.current) {
      // Create full dummy record and push to result
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
        createdAt: new Date().toISOString()
      });
      addRewards(50, 25);
      router.push("/results");
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-[72px]">
      <div className="flex-1 flex items-center justify-center bg-surface p-6">
        <div className="text-center space-y-6 w-full max-w-4xl flex flex-col h-full max-h-[70vh]">
          
          {/* HUD Scoreboard */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="card px-6 py-3 w-48 border-primary/20">
              <span className="text-muted block text-xs mb-1">Playstyle</span>
              <span className="capitalize font-medium text-primary">{playstyle.replace(/_/g, " ")}</span>
            </div>
            <div className="card px-8 py-3 bg-card border-accent/20">
             <div className="flex flex-col items-center">
                <span className="text-muted text-xs uppercase tracking-wider mb-1">Score</span>
                <span className="text-3xl font-black">{score.home} - {score.away}</span>
             </div>
            </div>
            <div className="card px-6 py-3 w-48 border-primary/20">
              <span className="text-muted block text-xs mb-1">Time</span>
              <span className="font-medium text-primary text-lg">{tickToMatchTime(tick, totalTicks)}</span>
            </div>
          </div>

           {/* Phaser Arena */}
           <div className="w-full max-w-3xl aspect-[2/1] rounded-xl border border-border bg-background flex items-center justify-center mx-auto shadow-xl relative mt-4">
              <PhaserGame />
           </div>

           {/* Event Feed */}
           <div className="flex-1 min-h-[200px] w-full max-w-3xl aspect-[3/1] rounded-xl border border-border bg-[#0a0f18] mx-auto p-4 flex flex-col shadow-inner mt-4">
             <div className="w-full border-b border-border/50 pb-2 mb-2 flex justify-between text-xs text-muted font-mono uppercase tracking-wider">
                <span>Match Feed</span>
                <span>{isFinished ? "FT" : "Live"}</span>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 text-left font-mono relative">
                {events.map((e, idx) => {
                  const isHome = e.team === "home";
                  const isGoal = e.type === "goal";
                  const isHalftime = e.type === "halftime" || e.type === "full_time";
                  
                  return (
                    <div 
                      key={`${e.tick}-${idx}`} 
                      className={`text-sm p-2 rounded flex gap-3 ${
                        isGoal ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" : 
                        isHalftime ? "bg-accent/10 border-y border-accent/20 text-accent font-bold my-4 justify-center" : 
                        isHome ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {!isHalftime && (
                        <span className="opacity-50 min-w-[50px] shrink-0">
                          {tickToMatchTime(e.tick, totalTicks)}
                        </span>
                      )}
                      <span>{formatMatchEvent(e, STARTER_PLAYERS)}</span>
                    </div>
                  );
                })}
                <div ref={feedEndRef} />
             </div>

             {isFinished && (
                <div className="mt-4 pt-4 border-t border-border flex justify-center fade-in">
                  <button onClick={finishMatch} className="btn-primary px-8">
                    View Results
                  </button>
                </div>
             )}
          </div>

        </div>
      </div>

      {/* Tactical controls */}
      <div className="border-t border-border p-4 bg-surface z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          {/* Stance */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted mr-2">Stance:</span>
            {(["balanced", "aggressive", "defensive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStanceChange(s)}
                disabled={isFinished}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  stance === s
                    ? "bg-accent text-white"
                    : "bg-background text-muted hover:text-foreground hover:bg-white/5 disabled:opacity-50"
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
                disabled={isFinished}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  command === c
                    ? "bg-accent text-white"
                    : "bg-background text-muted hover:text-foreground hover:bg-white/5 disabled:opacity-50"
                }`}
              >
                {c === "none" ? "None" : c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>

          <button className="btn-secondary opacity-50 cursor-not-allowed text-sm" disabled>
            Ultimate (charging...)
          </button>
        </div>
      </div>
    </div>
  );
}
