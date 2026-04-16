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
import { supabase } from "@/lib/supabase/client";

const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), { ssr: false });

export default function MatchPage() {
  const router = useRouter();

  const { lineup, availablePlayers, playstyle, stance, command, setStance, setCommand, setMatchResult, addRewards, ownedPlayers } = useGameStore();
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
  const [isSearching, setIsSearching] = useState(true);
  const [opponentInfo, setOpponentInfo] = useState<{ name: string; badge: string; playstyle: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "tactics">("feed");

  const totalTicks = 90;

  // Fetch opponent and build engine once on mount
  useEffect(() => {
    if (!validation.valid || engineRef.current) return;

    async function setupMatch() {
      if (!supabase) return;

      const { data: user } = await supabase.auth.getUser();
      
      // 1. Fetch random opponent squad
      const { data: squads } = await supabase
        .from('squads')
        .select('*, profiles(username, team_name, badge_id)')
        .neq('user_id', user.user?.id)
        .limit(10); // Pick from a small pool for randomness

      let opponent: any = null;
      if (squads && squads.length > 0) {
        opponent = squads[Math.floor(Math.random() * squads.length)];
      }

      const homeRoster = lineup.map(l => {
        const basePlayer = availablePlayers.find(p => p.id === l.playerId)!;
        const userPlayer = ownedPlayers.find(p => p.player_id === l.playerId);
        
        if (userPlayer && userPlayer.stats_bonus) {
          return {
            ...basePlayer,
            stats: {
              pace: basePlayer.stats.pace + (userPlayer.stats_bonus.pace || 0),
              shooting: basePlayer.stats.shooting + (userPlayer.stats_bonus.shooting || 0),
              passing: basePlayer.stats.passing + (userPlayer.stats_bonus.passing || 0),
              defense: basePlayer.stats.defense + (userPlayer.stats_bonus.defense || 0),
              physical: basePlayer.stats.physical + (userPlayer.stats_bonus.physical || 0),
              goalkeeping: basePlayer.stats.goalkeeping + (userPlayer.stats_bonus.goalkeeping || 0),
            }
          };
        }
        return basePlayer;
      });
      homeRosterRef.current = homeRoster;

      let awayRoster: typeof STARTER_PLAYERS;
      let awayPlaystyle: any = "balanced";
      let awayName = "AI Bots";
      let awayBadge = "badge_lightning";

      if (opponent) {
        // Map opponent lineup IDs to definitions
        awayRoster = opponent.lineup.map((slot: any) => 
          STARTER_PLAYERS.find(p => p.id === slot.playerId) || STARTER_PLAYERS[0]
        );
        awayPlaystyle = opponent.playstyle;
        awayName = opponent.profiles?.team_name || opponent.profiles?.username || "Rival Tech";
        awayBadge = opponent.profiles?.badge_id || "badge_lightning";
      } else {
        // Fallback to mirror if no one else exists (first user problem)
        awayRoster = [...homeRoster].reverse();
      }
      
      awayRosterRef.current = awayRoster;
      setOpponentInfo({ name: awayName, badge: awayBadge, playstyle: awayPlaystyle });

      engineRef.current = new MatchEngine(
        {
          totalTicks,
          halftimeTick: 45,
          seed: generateSeed(),
          homePlaystyle: playstyle,
          awayPlaystyle: awayPlaystyle,
          homeStance: stance,
          awayStance: "balanced",
          homeCommand: command,
          awayCommand: "none",
        },
        homeRoster,
        awayRoster
      );

      // Delay searching state slightly for "feel"
      setTimeout(() => setIsSearching(false), 1500);
    }

    setupMatch();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
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

  const finishMatch = async () => {
    if (!engineRef.current || !supabase) return;
    const matchOutcome = engineRef.current.getResult();
    const { data: user } = await supabase.auth.getUser();

    // Save match record to Supabase
    await supabase.from('matches').insert({
      home_user_id: user.user?.id,
      away_user_name: opponentInfo?.name || "AI", // Note: adding this for better record keeping
      home_score: score.home,
      away_score: score.away,
      winner_id: matchOutcome.result.outcome === "win" ? user.user?.id : null,
      match_data: {
        timeline: engineRef.current.getTimeline(),
        playerStats: matchOutcome.playerStats
      }
    });

    setMatchResult({
      id: crypto.randomUUID(),
      userId: user.user?.id || "local",
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
    <div className="fixed inset-0 top-[57px] flex flex-col lg:flex-row overflow-hidden bg-surface">
      {/* 1. ARENA SECTION (TOP on mobile, LEFT on desktop) */}
      <div className="flex-1 flex flex-col bg-[#05070e] relative overflow-hidden min-h-0 lg:border-r border-border">
        {/* Progress bar */}
        <div className="h-1 w-full bg-white/5 absolute top-0 left-0 z-20">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%`, boxShadow: "0 0 15px #fbbf24" }}
          />
        </div>

        {/* Scoreboard HUD */}
        <div className="relative z-10 px-4 lg:px-6 py-4 lg:py-6" style={{background: 'linear-gradient(180deg, rgba(5,7,14,0.95) 0%, transparent 100%)'}}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center lg:items-start gap-1 lg:gap-2">
              <div className="text-[8px] lg:text-[10px] text-accent/70 uppercase tracking-[0.2em] font-black">Tu</div>
              <div className="text-2xl lg:text-5xl font-black tabular-nums text-white italic leading-none drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                {score.home}
              </div>
              <div className="hidden lg:block text-[9px] font-black uppercase tracking-widest text-muted truncate max-w-[100px]">{playstyle.replace(/_/g, " ")}</div>
            </div>

            {/* Match Status / Time */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-2">
                 <div className="text-xs lg:text-base font-black text-foreground/80 font-mono tabular-nums leading-none">
                  {tickToMatchTime(tick, totalTicks)}
                 </div>
              </div>
              {isSearching && (
                <div className="text-[8px] text-accent animate-pulse font-black uppercase tracking-widest">Matchmaking...</div>
              )}
              {!isSearching && !isFinished && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-[8px] text-muted uppercase tracking-widest font-black">Live Match</span>
                </div>
              )}
              {isFinished && (
                <div className="text-[8px] text-muted uppercase tracking-widest font-black">Full Time</div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center lg:items-end gap-1 lg:gap-2">
              <div className="text-[8px] lg:text-[10px] text-rose-400/70 uppercase tracking-[0.2em] font-black text-right">
                {opponentInfo?.name || "CPU"}
              </div>
              <div className="text-2xl lg:text-5xl font-black tabular-nums text-rose-500 italic leading-none drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                {score.away}
              </div>
              <div className="hidden lg:block text-[9px] font-black uppercase tracking-widest text-muted truncate max-w-[100px]">{opponentInfo?.playstyle || "Standard"}</div>
            </div>
          </div>
        </div>

        {/* Phaser Canvas */}
        <div className="flex-1 relative overflow-hidden h-[35vh] lg:h-auto border-y border-white/5 lg:border-none">
          <PhaserGame />
        </div>
      </div>

      {/* 2. CONTROLS & FEED SECTION (BOTTOM on mobile, RIGHT on desktop) */}
      <div className="w-full lg:w-96 flex flex-col bg-surface overflow-hidden h-[40vh] lg:h-full">
        {/* Mobile Tabs */}
        <div className="flex lg:hidden border-b border-border bg-black/20">
          <button 
            onClick={() => setActiveTab("feed")}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
              activeTab === "feed" ? "text-accent border-b-2 border-accent bg-accent/5" : "text-muted"
            }`}
          >
            Chronicle
          </button>
          <button 
            onClick={() => setActiveTab("tactics")}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
              activeTab === "tactics" ? "text-accent border-b-2 border-accent bg-accent/5" : "text-muted"
            }`}
          >
            Tactical Deck
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Feed Content */}
          <div className={`flex-1 flex flex-col min-h-0 ${activeTab === "tactics" ? "hidden lg:flex" : "flex"}`}>
            <div className="hidden lg:flex p-4 border-b border-border bg-black/10">
              <span className="text-[10px] text-muted uppercase tracking-widest font-black">LIVE CHRONICLE</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 font-mono text-[10px] lg:text-xs bg-black/10">
              {events.length === 0 && (
                <div className="text-center text-muted/30 italic py-12 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-dashed border-white/10 animate-spin" />
                  {phaserReady ? "Awaiting kick-off..." : "Initializing data streams..."}
                </div>
              )}
              {events.map((e, idx) => {
                const isGoal = e.type === "goal";
                const isBreak = e.type === "halftime" || e.type === "full_time";
                return (
                  <div
                    key={`${e.tick}-${idx}`}
                    className={`flex gap-3 items-start rounded-xl px-3 py-2.5 transition-all text-xs lg:text-sm animate-in fade-in slide-in-from-left-2 ${
                      isGoal
                        ? "bg-accent/15 border border-accent/30 text-accent font-black italic shadow-lg shadow-accent/5"
                        : isBreak
                        ? "bg-white/10 border border-white/10 text-white font-black justify-center text-center italic"
                        : "text-foreground/70 bg-white/5 border border-white/5"
                    }`}
                  >
                    {!isBreak && (
                      <span className="text-accent/60 shrink-0 tabular-nums font-black">
                        {tickToMatchTime(e.tick, totalTicks)}
                      </span>
                    )}
                    <span className="leading-tight">{formatMatchEvent(e, STARTER_PLAYERS)}</span>
                  </div>
                );
              })}
              <div ref={feedEndRef} />
            </div>
          </div>

          {/* Tactical Controls */}
          <div className={`shrink-0 p-4 lg:p-6 space-y-6 lg:space-y-8 bg-surface border-t border-border shadow-2xl z-20 ${
              activeTab === "feed" ? "hidden lg:block" : "block"
            }`}>
            {isFinished && (
              <button 
                onClick={finishMatch} 
                className="btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-accent/20 animate-pulse mb-6"
              >
                Conclude & Save Results →
              </button>
            )}

            <div className="space-y-4">
              <div>
                <div className="text-[9px] text-muted uppercase tracking-[0.3em] font-black mb-3 ml-1">Team Stance</div>
                <div className="flex gap-2">
                  {(["balanced", "aggressive", "defensive"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStanceChange(s)}
                      disabled={isFinished}
                      className={`flex-1 py-3 lg:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        stance === s
                          ? "bg-accent text-black border-accent shadow-xl shadow-accent/10"
                          : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:text-foreground disabled:opacity-20"
                      }`}
                    >
                      {s === "balanced" ? "Bal" : s === "aggressive" ? "Atk" : "Def"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-muted uppercase tracking-[0.3em] font-black mb-3 ml-1">Tactical Command</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {(["none", "focus_attack", "protect_lead"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCommand(c)}
                      disabled={isFinished}
                      className={`py-3 lg:py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        command === c
                          ? "bg-accent/20 text-accent border-accent/40 shadow-lg"
                          : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:text-foreground disabled:opacity-20"
                      } ${c === "none" && "col-span-2 lg:col-span-1"}`}
                    >
                      {c === "none" ? "None" : c === "focus_attack" ? "Assalto" : "Blindata"}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] bg-white/5 text-muted/30 cursor-not-allowed border border-dashed border-border" disabled>
                ⚡ Ultimate — Charging...
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
