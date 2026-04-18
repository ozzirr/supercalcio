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
import { EventBus } from "@/game/EventBus";
import { supabase } from "@/lib/supabase/client";

export default function MatchPage() {
  const router = useRouter();

  // Store connection
  const { 
    lineup, availablePlayers, playstyle, stance, command, 
    setStance, setCommand, addRewards, ownedPlayers,
    ultimateReady, setUltimateReady, activateUltimate,
    isMuted, setMuted,
    matchInProgress, matchTick, matchScore, matchEvents,
    startGlobalMatch, finishMatchAndSave, opponentInfo,
    equippedStadium
  } = useGameStore();

  const validation = validateSquad(lineup, availablePlayers);

  const [isSearching, setIsSearching] = useState(!matchInProgress);
  const [activeTab, setActiveTab] = useState<"feed" | "tactics">("feed");
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [ultimateCharge, setUltimateCharge] = useState(0);

  const totalTicks = 90;
  const matchInitializedRef = useRef(false);

  // Setup match IF NOT IN PROGRESS
  useEffect(() => {
    if (!validation.valid || matchInProgress || matchInitializedRef.current) {
      if (matchInProgress) setIsSearching(false);
      return;
    }

    matchInitializedRef.current = true;

    async function setupMatch() {
      if (!supabase) return;

      const { data: userAuth } = await supabase.auth.getUser();
      
      // 1. Fetch random opponent squad
      const { data: squads } = await supabase
        .from('squads')
        .select('*, profiles(username, team_name, badge_id)')
        .neq('user_id', userAuth.user?.id)
        .limit(10);

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

      let awayRoster: typeof STARTER_PLAYERS;
      let awayPlaystyle: any = "balanced";
      let awayName = "AI Bots";
      let awayBadge = "badge_lightning";

      if (opponent) {
        awayRoster = opponent.lineup.map((slot: any) => 
          STARTER_PLAYERS.find(p => p.id === slot.playerId) || STARTER_PLAYERS[0]
        );
        awayPlaystyle = opponent.playstyle;
        awayName = opponent.profiles?.team_name || opponent.profiles?.username || "Rival Tech";
        awayBadge = opponent.profiles?.badge_id || "badge_lightning";
      } else {
        awayRoster = [...homeRoster].reverse();
      }
      
      const engine = new MatchEngine(
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

      // Start Globale
      startGlobalMatch(engine, { name: awayName, badge: awayBadge, playstyle: awayPlaystyle });

      // Init Phaser (it stays in layout)
      setTimeout(() => {
        EventBus.emit("init-match", {
          homeRoster,
          awayRoster,
          stadiumId: equippedStadium,
          kitId: useGameStore.getState().equippedKit,
          badgeId: useGameStore.getState().badgeId
        });
        setIsSearching(false);
      }, 1500);
    }

    setupMatch();
  }, [validation.valid, matchInProgress]);

  useEffect(() => {
    const onUltimateUpdate = (charge: number) => setUltimateCharge(charge);
    const onUltimateReady = (ready: boolean) => setUltimateReady(ready);

    EventBus.on("ultimate-update", onUltimateUpdate);
    EventBus.on("ultimate-ready", onUltimateReady);
    return () => { 
      EventBus.off("ultimate-update", onUltimateUpdate);
      EventBus.off("ultimate-ready", onUltimateReady);
    };
  }, [setUltimateReady]);

  // Handle Match Finish
  useEffect(() => {
    if (matchTick >= totalTicks && matchInProgress) {
      setTimeout(() => {
        setShowResultOverlay(true);
        setTimeout(async () => {
          await finishMatchAndSave();
          router.push("/results");
        }, 4000);
      }, 1500);
    }
  }, [matchTick, matchInProgress, finishMatchAndSave, router]);

  // Auto-scroll feed
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [matchEvents]);

  if (!validation.valid) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="card p-8 text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold">Squadra Non Pronta</h2>
          <p className="text-muted">Hai bisogno di una formazione valida di 5 giocatori prima di iniziare una partita.</p>
          <Link href="/squad" className="btn-primary inline-block">
            Vai alla Formazione
          </Link>
        </div>
      </div>
    );
  }

  const handleStanceChange = (s: "balanced" | "aggressive" | "defensive") => {
    setStance(s);
    useGameStore.getState().matchEngine?.intervene("home", { type: "stance_change", stance: s });
  };

  const currentStance = stance;
  const currentCommand = command;
  const progress = (matchTick / totalTicks) * 100;

  return (
    <div className="fixed inset-0 top-[57px] flex flex-col lg:flex-row overflow-hidden bg-surface">
      {/* 1. ARENA SECTION */}
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
                {matchScore.home}
              </div>
              <div className="hidden lg:block text-[9px] font-black uppercase tracking-widest text-muted truncate max-w-[100px]">{playstyle.replace(/_/g, " ")}</div>
            </div>

            {/* Match Status / Time */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-2">
                 <div className="text-xs lg:text-base font-black text-foreground/80 font-mono tabular-nums leading-none">
                  {tickToMatchTime(matchTick, totalTicks)}
                 </div>
              </div>
              {isSearching && (
                <div className="text-[8px] text-accent animate-pulse font-black uppercase tracking-widest">Analisi avversario...</div>
              )}
              {!isSearching && matchInProgress && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-[8px] text-muted uppercase tracking-widest font-black">Live Match</span>
                </div>
              )}
              {!matchInProgress && matchTick >= totalTicks && (
                <div className="text-[8px] text-muted uppercase tracking-widest font-black">Fischio Finale</div>
              )}
            </div>

            {/* Audio Toggle */}
            <div className="absolute top-6 right-4 lg:right-6 flex items-center gap-2">
               <button 
                onClick={() => setMuted(!isMuted)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-muted hover:text-white transition-all shadow-lg"
               >
                 {isMuted ? (
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M168,128a12,12,0,0,1-12,12H100a12,12,0,0,1,0-24h56A12,12,0,0,1,168,128Zm70.49,102.51a12,12,0,0,1-17,17l-192-192a12,12,0,0,1,17-17l36.56,36.56A27.84,27.84,0,0,1,104,70.52V40a12,12,0,0,1,19.34-9.6l24,18H152a12,12,0,0,1,0,24h-1.33l19.5,14.62,11.83,11.83h0l56.49,56.5ZM104,116.52l12.56,12.56-11.41,8.56A12,12,0,0,1,84.7,128V70.52a4,4,0,0,1,1.15-2.82Zm120,11.48H200a12,12,0,0,1,0-24h24a12,12,0,0,1,0,24Zm-24-36a12,12,0,0,1-12-12v-8a12,12,0,0,1,24,0v8A12,12,0,0,1,200,92Zm0,72a12,12,0,0,1-12-12v-16a12,12,0,0,1,24,0v16A12,12,0,0,1,200,164Z"></path></svg>
                 ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M152,72h-4.3l-24.36-18.27A12,12,0,0,0,104,50.14V40a12,12,0,0,0-19.34-9.6L37.2,66.1a11.9,11.9,0,0,0-5.2,9.9V180a12,12,0,0,0,19.34,9.6L104,150.14v39.38a12,12,0,0,0,19.34,9.6L147.7,180.85A12,12,0,0,0,155,171.21V81.64A12,12,0,0,0,147.7,72ZM84,151a12,12,0,0,0-4.66,0.94L52,170.83V81.3l27.34,20.5a12,12,0,0,0,19.34-9.6V71.4l5.32,4V184.6ZM200,104a12,12,0,0,0-12,12v24a12,12,0,0,0,24,0V116A12,12,0,0,0,200,104Zm40,0a12,12,0,0,0-12,12v24a12,12,0,0,0,24,0V116A12,12,0,0,0,240,104Z"></path></svg>
                 )}
               </button>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center lg:items-end gap-1 lg:gap-2">
              <div className="text-[8px] lg:text-[10px] text-rose-400/70 uppercase tracking-[0.2em] font-black text-right">
                {opponentInfo?.name || "CPU"}
              </div>
              <div className="text-2xl lg:text-5xl font-black tabular-nums text-rose-500 italic leading-none drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                {matchScore.away}
              </div>
              <div className="hidden lg:block text-[9px] font-black uppercase tracking-widest text-muted truncate max-w-[100px]">{opponentInfo?.playstyle || "Standard"}</div>
            </div>
          </div>
        </div>

        {/* Empty placeholder - PhaserGame is in the overlay */}
        <div className="flex-1 relative overflow-hidden h-[35vh] lg:h-auto border-y border-white/5 lg:border-none">
        </div>
      </div>

      {/* 2. CONTROLS & FEED SECTION */}
      <div className="w-full lg:w-96 flex flex-col bg-surface overflow-hidden h-[40vh] lg:h-full">
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-1 flex flex-col min-h-0 ${activeTab === "tactics" ? "hidden lg:flex" : "flex"}`}>
            <div className="hidden lg:flex p-4 border-b border-border bg-black/10">
              <span className="text-[10px] text-muted uppercase tracking-widest font-black">LIVE CHRONICLE</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 font-mono text-[10px] lg:text-xs bg-black/10">
              {matchEvents.length === 0 && (
                <div className="text-center text-muted/30 italic py-12 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-dashed border-white/10 animate-spin" />
                  {isSearching ? "Analisi avversario..." : "Waiting for kick-off..."}
                </div>
              )}
              {matchEvents.map((e, idx) => {
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

          <div className={`shrink-0 p-4 lg:p-6 space-y-6 lg:space-y-8 bg-surface border-t border-border shadow-2xl z-20 ${
              activeTab === "feed" ? "hidden lg:block" : "block"
            }`}>
            <div className="space-y-4">
              <div>
                <div className="text-[9px] text-muted uppercase tracking-[0.3em] font-black mb-3 ml-1">Team Stance</div>
                <div className="flex gap-2">
                  {(["balanced", "aggressive", "defensive"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStanceChange(s)}
                      disabled={!matchInProgress}
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
                      disabled={!matchInProgress}
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

              <button 
                onClick={() => ultimateReady && activateUltimate()}
                disabled={!matchInProgress || !ultimateReady}
                className={`w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden border ${
                  ultimateReady 
                    ? "bg-accent text-black border-accent animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer" 
                    : "bg-white/5 text-muted/30 border-dashed border-border cursor-not-allowed"
                }`}
              >
                <div 
                  className="absolute inset-0 bg-accent/10 transition-all duration-500"
                  style={{ width: `${ultimateCharge}%` }}
                />
                <span className="relative z-10">
                  {ultimateReady ? "⚡ ACTIVATE ULTIMATE" : `⚡ Ultimate Charge: ${ultimateCharge}%`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Overlay */}
      {showResultOverlay && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div>
              <div className="text-muted text-xs font-black uppercase tracking-[0.4em] mb-4">Final Score</div>
              <div className="flex items-center justify-center gap-8 lg:gap-12">
                <div className="text-5xl lg:text-7xl font-black italic text-accent">{matchScore.home}</div>
                <div className="text-2xl lg:text-3xl text-muted font-light px-4 border-x border-white/10">VS</div>
                <div className="text-5xl lg:text-7xl font-black italic text-rose-500">{matchScore.away}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className={`text-4xl lg:text-6xl font-black uppercase italic leading-none ${
                matchScore.home > matchScore.away ? "text-accent animate-pulse" : matchScore.home < matchScore.away ? "text-rose-500" : "text-white"
              }`}>
                {matchScore.home > matchScore.away ? "Vittoria!" : matchScore.home < matchScore.away ? "Sconfitta" : "Pareggio"}
              </h2>
              <p className="text-muted text-xs lg:text-sm font-medium tracking-wide">
                {matchScore.home > matchScore.away 
                  ? "Ottima prestazione! Il tuo team ha dominato il campo." 
                  : matchScore.home < matchScore.away 
                  ? "Non scoraggiarti. Analizza la tattica e riprova!" 
                  : "Un match equilibrato fino all'ultimo secondo."}
              </p>
            </div>

            <div className="pt-8 flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
               <div className="text-[10px] text-muted uppercase tracking-[0.3em] font-black">Salvataggio dati in corso...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
