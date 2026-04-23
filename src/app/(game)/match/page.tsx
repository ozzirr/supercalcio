"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { validateSquad } from "@/types/squad";
import { MatchEngine } from "@/engine/match-engine";
import { generateSeed } from "@/engine/random";
import { formatMatchEvent, tickToMatchTime } from "@/utils/formatting";
import { STARTER_PLAYERS } from "@/content/players";
import { useRouter } from "next/navigation";
import { EventBus } from "@/game/EventBus";
import { matchAudio } from "@/game/match-audio";
import { speechEngine } from "@/game/speech-engine";
import { supabase } from "@/lib/supabase/client";
import { MatchHeader } from "@/components/match/MatchHeader";
import { MatchChronicle } from "@/components/match/MatchChronicle";
import { TacticalPanel } from "@/components/match/TacticalPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function MatchPage() {
  const router = useRouter();

  // Store connection
  const { 
    lineup, availablePlayers, playstyle, stance, command, 
    setStance, setCommand, ownedPlayers,
    ultimateReady, setUltimateReady, activateUltimate,
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
    const { matchFinished } = useGameStore.getState();
    
    if (!validation.valid || matchInProgress || matchInitializedRef.current || matchFinished) {
      if (matchInProgress) setIsSearching(false);
      return;
    }

    matchInitializedRef.current = true;

    async function setupMatch() {
      if (!supabase) return;

      const { data: userAuth } = await supabase.auth.getUser();
      
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
        
        let boosted = { ...basePlayer };
        if (userPlayer && userPlayer.stats_bonus) {
          boosted.stats = {
            pace: boosted.stats.pace + (userPlayer.stats_bonus.pace || 0),
            shooting: boosted.stats.shooting + (userPlayer.stats_bonus.shooting || 0),
            passing: boosted.stats.passing + (userPlayer.stats_bonus.passing || 0),
            defense: boosted.stats.defense + (userPlayer.stats_bonus.defense || 0),
            physical: boosted.stats.physical + (userPlayer.stats_bonus.physical || 0),
            goalkeeping: boosted.stats.goalkeeping + (userPlayer.stats_bonus.goalkeeping || 0),
          };
        }
        return boosted;
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

      startGlobalMatch(engine, { name: awayName, badge: awayBadge, playstyle: awayPlaystyle });

      // Trigger pre-match presentation
      const homeName = useGameStore.getState().teamName || useGameStore.getState().username || "GIOOL FC";
      speechEngine.announcePresentation(homeName, awayName);

      setTimeout(() => {
        matchAudio.play("whistle");
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

  useEffect(() => {
    if (matchTick >= totalTicks && matchInProgress) {
      setTimeout(() => {
        setShowResultOverlay(true);
        
        // Trigger final result announcement
        const homeName = useGameStore.getState().teamName || "GIOOL FC";
        const awayName = opponentInfo?.name || "CPU";
        speechEngine.announceMatchEnd(homeName, awayName, matchScore.home, matchScore.away);

        setTimeout(async () => {
          await finishMatchAndSave();
          router.push("/results");
        }, 6000); // Increased time to allow full speech
      }, 1500);
    }
  }, [matchTick, matchInProgress, finishMatchAndSave, router, opponentInfo]);

  if (!validation.valid) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#05070a]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-10 text-center space-y-6 max-w-md border-accent/20 bg-accent/5 backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30">
            <span className="text-4xl">⚽</span>
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-wider text-white">Squadra Non Pronta</h2>
          <p className="text-muted text-sm leading-relaxed">Hai bisogno di una formazione completa di 5 titolari prima di scendere in campo nell'Arena.</p>
          <Link href="/squad" className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group">
            Gestisci Formazione
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleStanceChange = (s: "balanced" | "aggressive" | "defensive") => {
    setStance(s);
    useGameStore.getState().matchEngine?.intervene("home", { type: "stance_change", stance: s });
  };

  return (
    <div className="fixed inset-0 top-[57px] flex flex-col lg:flex-row overflow-hidden bg-[#05070a]">
      {/* 1. ARENA VIEWPORT */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* Broadcast HUD Layer */}
        <MatchHeader 
          tick={matchTick}
          totalTicks={totalTicks}
          score={matchScore}
          opponentName={opponentInfo?.name || "CPU"}
          opponentPlaystyle={opponentInfo?.playstyle || "Standard"}
          isSearching={isSearching}
          matchInProgress={matchInProgress}
        />

        {/* Phase / Momentum Indicator (Floating) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <AnimatePresence mode="wait">
            {matchInProgress && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-2xl"
              >
                <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                  <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Momentum</span>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-accent shadow-[0_0_8px_#fbbf24]" style={{ width: '65%' }} />
                    <div className="h-full bg-rose-500 opacity-30" style={{ width: '35%' }} />
                  </div>
                </div>
                <div className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                  Possesso: <span className="text-accent">62%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The Phaser Instance Placeholder */}
        {/* Phaser is rendered by MatchOverlay in a layer above this, but we keep the space */}
        <div className="flex-1 bg-gradient-to-b from-[#0a162d] to-[#05070a]">
           {/* This background is visible before Phaser loads */}
           {isSearching && (
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-xs text-accent font-black uppercase tracking-[0.3em] animate-pulse">Sincronizzazione Arena...</p>
             </div>
           )}
        </div>
      </div>

      {/* 2. SIDEBAR SECTION (FEED & TACTICS) */}
      <div className="w-full lg:w-[384px] shrink-0 flex flex-col bg-surface shadow-[-20px_0_40px_rgba(0,0,0,0.4)] z-30 overflow-hidden h-[40vh] lg:h-full border-l border-white/5">
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden border-b border-white/5">
          <button 
            onClick={() => setActiveTab("feed")}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
              activeTab === "feed" ? "text-accent bg-accent/5 border-b-2 border-accent" : "text-muted"
            }`}
          >
            Feed
          </button>
          <button 
            onClick={() => setActiveTab("tactics")}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
              activeTab === "tactics" ? "text-accent bg-accent/5 border-b-2 border-accent" : "text-muted"
            }`}
          >
            Tactics
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-1 flex flex-col min-h-0 ${activeTab === "tactics" ? "hidden lg:flex" : "flex"}`}>
            <MatchChronicle 
              events={matchEvents}
              totalTicks={totalTicks}
              isSearching={isSearching}
            />
          </div>

          <div className={`${activeTab === "feed" ? "hidden lg:block" : "block"}`}>
            <TacticalPanel 
              stance={stance}
              command={command}
              ultimateReady={ultimateReady}
              ultimateCharge={ultimateCharge}
              matchInProgress={matchInProgress}
              onStanceChange={handleStanceChange}
              onCommandChange={setCommand}
              onActivateUltimate={activateUltimate}
            />
          </div>
        </div>
      </div>

      {/* 3. RESULT OVERLAY */}
      <AnimatePresence>
        {showResultOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-6 overflow-hidden"
          >
            {/* Dynamic Background */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${
               matchScore.home > matchScore.away ? "bg-emerald-950/90" : matchScore.home < matchScore.away ? "bg-rose-950/90" : "bg-slate-950/90"
            } backdrop-blur-3xl`} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 max-w-2xl w-full text-center space-y-12"
            >
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-muted text-[10px] font-black uppercase tracking-[0.4em]"
                >
                  Match Risultato Finale
                </motion.div>
                
                <div className="flex items-center justify-center gap-8 lg:gap-16 pt-4">
                  <div className="flex flex-col items-center gap-6">
                    <motion.div 
                       whileHover={{ scale: 1.05 }}
                       className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-5xl lg:text-7xl shadow-[0_0_50px_rgba(251,191,36,0.2)]"
                    >
                      🛡️
                    </motion.div>
                    <div className="text-5xl lg:text-8xl font-black italic text-white tabular-nums drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                      {matchScore.home}
                    </div>
                  </div>

                  <div className="relative flex flex-col items-center justify-center h-32 lg:h-40">
                     <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                     <div className="relative bg-[#05070a] px-4 py-2 text-xl lg:text-3xl text-muted font-black italic tracking-tighter uppercase z-10">VS</div>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <motion.div 
                       whileHover={{ scale: 1.05 }}
                       className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-5xl lg:text-7xl shadow-[0_0_50px_rgba(244,63,94,0.2)]"
                    >
                      🔴
                    </motion.div>
                    <div className="text-5xl lg:text-8xl font-black italic text-rose-500 tabular-nums drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                      {matchScore.away}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-6xl lg:text-9xl font-black uppercase italic leading-none tracking-tighter ${
                    matchScore.home > matchScore.away ? "text-accent" : matchScore.home < matchScore.away ? "text-rose-500" : "text-white"
                  }`}
                >
                  {matchScore.home > matchScore.away ? "VITTORIA!" : matchScore.home < matchScore.away ? "SCONFITTA" : "PAREGGIO"}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-muted/80 text-sm lg:text-lg font-medium max-w-md mx-auto leading-relaxed"
                >
                  {matchScore.home > matchScore.away 
                    ? "Prestazione leggendaria! Hai dominato tatticamente ogni zona del campo." 
                    : matchScore.home < matchScore.away 
                    ? "Sconfitta amara. Analizza i dati del match e regola la tua strategia." 
                    : "Un pareggio combattuto. Entrambe le squadre hanno mostrato grande carattere."}
                </motion.p>
              </div>

              <div className="pt-12 flex flex-col items-center gap-6">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-accent blur-xl opacity-20 animate-pulse" />
                    <div className="relative flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                       <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                       <div className="text-[10px] text-accent font-black uppercase tracking-[0.4em] animate-pulse">Salvataggio Dati Arena...</div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
