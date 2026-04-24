"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { validateSquad, type Playstyle } from "@/types/squad";
import type { TeamStance, TeamCommand } from "@/types/match";
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
import PhaserGame from "@/components/game/PhaserGame";
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
    equippedStadium, substituteInMatch
  } = useGameStore();

  const [benchOpen, setBenchOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const benchPlayers = availablePlayers.filter(p => !lineup.some(l => l.playerId === p.id));

  const validation = validateSquad(lineup, availablePlayers);

  const [isSearching, setIsSearching] = useState(!matchInProgress);
  const [activeTab, setActiveTab] = useState<"feed" | "tactics">("feed");
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [ultimateCharge, setUltimateCharge] = useState(0);

  const totalTicks = 90;
  const matchInitializedRef = useRef(false);
  const currentMatchData = useRef<any>(null);

  // Setup match IF NOT IN PROGRESS
  useEffect(() => {
    const { matchFinished } = useGameStore.getState();
    
    if (!validation.valid || (matchInProgress && matchInitializedRef.current) || matchFinished) {
      if (matchInProgress) setIsSearching(false);
      return;
    }

    async function setupMatch() {
      if (!supabase) return;

      // Prepare match data even if already in progress (for refresh/recovery)
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

      // Simple AI/Rival generation if not provided by store
      let awayRoster: any[] = [];
      let awayName = opponentInfo?.name || "Rival Tech";
      let awayBadge = opponentInfo?.badge || "badge_lightning";
      let awayPlaystyle: Playstyle = opponentInfo?.playstyle || "possession_control";

      if (opponentInfo?.roster) {
        awayRoster = opponentInfo.roster;
      } else {
        // Fallback or AI generation
        awayRoster = [...homeRoster].reverse();
      }

      const matchData = {
        homeRoster,
        awayRoster,
        stadiumId: equippedStadium,
        kitId: useGameStore.getState().equippedKit,
        badgeId: useGameStore.getState().badgeId
      };
      currentMatchData.current = matchData;

      if (!matchInProgress && !matchFinished) {
        matchInitializedRef.current = true;
        
        const success = await useGameStore.getState().consumeEnergy();
        if (!success) {
          router.push("/dashboard?no-energy=1");
          return;
        }

        const engine = new MatchEngine(
          {
            totalTicks,
            halftimeTick: 45,
            seed: generateSeed(),
            homePlaystyle: playstyle as Playstyle,
            awayPlaystyle: awayPlaystyle as Playstyle,
            homeStance: stance as TeamStance,
            awayStance: "balanced" as TeamStance,
            homeCommand: command as TeamCommand,
            awayCommand: "none" as TeamCommand,
          },
          homeRoster,
          awayRoster
        );

        startGlobalMatch(engine, { name: awayName, badge: awayBadge, playstyle: awayPlaystyle });
        speechEngine.announcePresentation(useGameStore.getState().teamName || "GOLAZOO FC", awayName);
      }

      // Always try to init Phaser if it requests it
      setTimeout(() => {
        EventBus.emit("init-match", currentMatchData.current);
      }, 1000);
    }

    setupMatch();

    const onEngineReady = () => {
      setIsSearching(false);
    };

    const onInitRequest = () => {
      if (currentMatchData.current) {
        EventBus.emit("init-match", currentMatchData.current);
      }
    };

    EventBus.on("engine-ready-with-players", onEngineReady);
    EventBus.on("request-match-init", onInitRequest);
    
    return () => {
      EventBus.off("engine-ready-with-players", onEngineReady);
      EventBus.off("request-match-init", onInitRequest);
    };
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

  // Block refresh during match
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (matchInProgress && !showResultOverlay) {
        e.preventDefault();
        e.returnValue = "Partita in corso! Se ricarichi la pagina perderai il match e l'energia spesa.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [matchInProgress, showResultOverlay]);

  useEffect(() => {
    if (matchTick >= totalTicks && matchInProgress) {
      setTimeout(() => {
        setShowResultOverlay(true);
        
        // Trigger final result announcement
        const homeName = useGameStore.getState().teamName || "GOLAZOO FC";
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
    <div className="fixed inset-0 top-16 lg:top-20 flex flex-col bg-[#05070a] overflow-hidden z-20">
      {/* Stadium Background Atmosphere */}
      <div className="absolute inset-0 bg-stadium-tactical opacity-[0.1] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-[#05070a]/50 pointer-events-none" />

      {/* 1. ARENA VIEWPORT LAYER */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* Atmosphere Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* TOP HUD: Scoreboard */}
        <div className="absolute inset-x-0 top-0 z-[50] pointer-events-none">
          <MatchHeader 
            tick={matchTick}
            totalTicks={totalTicks}
            score={matchScore}
            opponentName={opponentInfo?.name || "CPU"}
            opponentPlaystyle={opponentInfo?.playstyle || "Standard"}
            isSearching={isSearching}
            matchInProgress={matchInProgress}
          />
        </div>

        {/* LEFT HUD: Stats */}
        <div className="absolute left-6 top-32 z-[50] flex flex-col gap-3 pointer-events-none w-44">
           <motion.div 
             initial={{ x: -50, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="glass-premium p-4 rounded-2xl border-white/5 space-y-4 shadow-2xl"
           >
              <div className="space-y-2">
                <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">MOMENTUM</div>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-gold shadow-[0_0_8px_#fbbf24]" style={{ width: '62%' }} />
                      <div className="h-full bg-rose-500/20" style={{ width: '38%' }} />
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">POSSESSO</div>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-gold shadow-[0_0_8px_#fbbf24]" style={{ width: '58%' }} />
                      <div className="h-full bg-rose-500/20" style={{ width: '42%' }} />
                   </div>
                </div>
              </div>
           </motion.div>
        </div>

        {/* RIGHT HUD: Chronicle & Tactics */}
        <div className="absolute right-6 top-4 bottom-44 z-[50] flex flex-col gap-4 w-72 pointer-events-none">
           {/* Chronicle (Top Right) */}
           <div className="flex-[1.2] min-h-0 pointer-events-auto">
              <MatchChronicle 
                events={matchEvents}
                totalTicks={totalTicks}
                isSearching={isSearching}
              />
           </div>

           {/* Tactics (Bottom Right) */}
           <div className="flex-1 min-h-0 pointer-events-auto">
              <TacticalPanel 
                stance={stance}
                command={command}
                matchInProgress={matchInProgress}
                onStanceChange={handleStanceChange}
                onCommandChange={setCommand}
              />
           </div>
        </div>

        {/* PHASER VIEWPORT */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
           <PhaserGame />
        </div>

        {/* BOTTOM HUD: Players & Ultimate */}
        <div className="absolute inset-x-0 bottom-6 z-[50] px-6 pointer-events-none">
           <div className="flex items-end gap-6 max-w-[1700px] mx-auto">
              {/* Sostituisci Button */}
              <button 
                onClick={() => {
                  setBenchOpen(!benchOpen);
                  setSelectedSubId(null);
                }}
                className={`pointer-events-auto w-24 aspect-square glass-premium rounded-[2rem] border-white/5 flex flex-col items-center justify-center gap-2 group transition-all mb-2 ${
                  benchOpen ? "bg-gold/20 border-gold/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]" : "hover:bg-white/5"
                }`}
              >
                 <span className={`text-2xl transition-transform duration-500 ${benchOpen ? "rotate-180" : ""}`}>🔄</span>
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">{benchOpen ? "CHIUDI" : "CAMBIO"}</span>
              </button>

              {/* Player Cards Row */}
              <div className="flex-1 flex gap-2 pointer-events-auto mb-2 relative">
                 {/* Bench Row (Floating above) */}
                 <AnimatePresence>
                   {benchOpen && (
                     <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: 20, opacity: 0 }}
                       className="absolute bottom-[calc(100%+1rem)] left-0 right-0 flex gap-2 overflow-x-auto pb-4 px-2 scrollbar-hide z-[100]"
                     >
                       {benchPlayers.length === 0 ? (
                         <div className="glass-premium px-6 py-3 rounded-2xl text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-white/5">Panchina Vuota</div>
                       ) : (
                         benchPlayers.map((p) => (
                           <button 
                             key={p.id}
                             onClick={() => setSelectedSubId(selectedSubId === p.id ? null : p.id)}
                             className={`relative aspect-[3/4.2] w-20 shrink-0 glass-premium rounded-2xl border transition-all ${
                               selectedSubId === p.id 
                                 ? "border-gold ring-4 ring-gold/40 scale-110 z-10 shadow-[0_0_30px_rgba(251,191,36,0.3)]" 
                                 : "border-white/10 hover:bg-white/10 opacity-80 hover:opacity-100"
                             }`}
                           >
                             <img src={`/assets/portraits/${p.portrait}.png`} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                             <div className="absolute bottom-2 inset-x-0 text-[8px] font-black text-white uppercase text-center truncate px-1">{p.name.split(' ')[0]}</div>
                             <div className="absolute top-2 right-2 text-[10px] font-black text-gold drop-shadow-md">{getPlayerOVR(p) || 75}</div>
                             {selectedSubId === p.id && (
                                <div className="absolute -top-1 -left-1 bg-gold text-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</div>
                             )}
                           </button>
                         ))
                       )}
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {lineup.map((slot, i) => {
                   const player = STARTER_PLAYERS.find(p => p.id === slot.playerId);
                   if (!player) return null;
                   const canSub = selectedSubId !== null;

                   return (
                     <button 
                       key={slot.playerId} 
                       onClick={() => {
                         if (selectedSubId) {
                           substituteInMatch(slot.playerId, selectedSubId);
                           setSelectedSubId(null);
                         }
                       }}
                       disabled={!canSub && !benchOpen}
                       className={`flex-1 glass-premium rounded-2xl border overflow-hidden relative group aspect-[3/4.2] max-w-[160px] transition-all duration-300 ${
                         canSub ? "border-gold ring-2 ring-gold/20 cursor-pointer scale-[1.02] shadow-[0_0_20px_rgba(251,191,36,0.1)]" : "border-white/10"
                       }`}
                     >
                        <div className="absolute top-2 left-2 z-10 text-[10px] font-black text-white italic">{getPlayerOVR(player) || 78}</div>
                        <div className="absolute top-2 right-2 z-10 text-[8px] font-black text-white/40 uppercase">{getPositionLabel(player)}</div>
                        <img src={`/assets/portraits/${player.portrait}.png`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        
                        <AnimatePresence>
                          {canSub && (
                             <motion.div 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               exit={{ opacity: 0 }}
                               className="absolute inset-0 bg-gold/30 backdrop-blur-sm flex flex-col items-center justify-center z-20 group-hover:bg-gold/40 transition-colors"
                             >
                                <span className="text-3xl drop-shadow-lg">🔄</span>
                                <span className="text-[8px] font-black text-white uppercase tracking-widest mt-2">SOSTITUISCI</span>
                             </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="absolute bottom-2 left-2 right-2 z-10">
                           <div className="text-[10px] font-black text-white uppercase italic truncate">{player.name}</div>
                        </div>
                     </button>
                   );
                 })}
              </div>

              {/* Ultimate Charge (Bottom Right) */}
              <div className="w-80 glass-premium rounded-3xl border-gold/20 p-4 flex items-center gap-4 pointer-events-auto mb-2 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gold/5" />
                 <div className="relative flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                       <span className="text-gold">⚡</span>
                       <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">ULTIMATE</span>
                    </div>
                    <p className="text-[7px] text-white/30 uppercase tracking-widest leading-none">CARICA CON POSSESSO</p>
                 </div>

                 <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full rotate-[-90deg]">
                       <circle cx="32" cy="32" r="28" className="stroke-white/5 fill-none stroke-[4]" />
                       <motion.circle 
                         cx="32" cy="32" r="28" 
                         className="stroke-gold fill-none stroke-[4]" 
                         strokeDasharray="175.8"
                         animate={{ strokeDashoffset: 175.8 - (175.8 * ultimateCharge) / 100 }}
                         strokeLinecap="round"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-gold text-xs">⚡</span>
                       <span className="text-[14px] font-black italic text-white leading-none">{ultimateCharge}%</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. LOADING / INTRO OVERLAY */}
        <AnimatePresence>
          {isSearching && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-[#05070a] flex flex-col items-center justify-center pointer-events-auto"
            >
              <div className="relative mb-12">
                 <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full animate-pulse" />
                 <img src="/assets/logo.png" alt="GOLAZOO" className="h-40 relative z-10" />
              </div>

              <div className="flex items-center gap-12 lg:gap-24 mb-16">
                 <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl lg:text-6xl shadow-2xl">🛡️</div>
                    <span className="font-black italic uppercase text-lg lg:text-2xl text-white tracking-tighter w-32 truncate">{useGameStore.getState().teamName || "TU"}</span>
                 </div>
                 <div className="text-3xl lg:text-5xl font-black italic text-accent/40">VS</div>
                 <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-4xl lg:text-6xl shadow-2xl">🔴</div>
                    <span className="font-black italic uppercase text-lg lg:text-2xl text-white tracking-tighter w-32 truncate">{opponentInfo?.name || "RIVALE"}</span>
                 </div>
              </div>

              <div className="space-y-4 text-center">
                 <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <span className="text-[10px] lg:text-xs text-accent font-black uppercase tracking-[0.4em] animate-pulse">Sincronizzazione Arena...</span>
                 </div>
                 <p className="text-[9px] text-muted font-black uppercase tracking-widest max-w-[200px] leading-relaxed opacity-60">
                    Caricamento engine di gioco e modelli atleti in corso
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              className="relative z-10 max-w-2xl w-full text-center space-y-12 pt-24 lg:pt-32"
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
