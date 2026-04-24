"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Redesigned Components
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StatCard } from "@/components/dashboard/StatCard";
import { StartingFivePanel } from "@/components/dashboard/StartingFivePanel";
import { MatchCtaPanel } from "@/components/dashboard/MatchCtaPanel";
import { TopManagersPanel } from "@/components/dashboard/TopManagersPanel";
import { ManagerHubPanel } from "@/components/dashboard/ManagerHubPanel";

type MiniLeaderEntry = {
  id: string;
  team_name: string;
  badge_id: string;
  xp: number;
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const lineup = useGameStore((s) => s.lineup);
  const xp = useGameStore((s) => s.xp);
  const currency = useGameStore((s) => s.currency);
  const teamName = useGameStore((s) => s.teamName);
  const badgeId = useGameStore((s) => s.badgeId);
  const setProfileModalOpen = useGameStore((s) => s.setProfileModalOpen);
  const user = useGameStore((s) => s.user);
  const energyAmount = useGameStore((s) => s.energyAmount);
  const lastEnergyUpdate = useGameStore((s) => s.lastEnergyUpdate);

  const [leaderboard, setLeaderboard] = useState<MiniLeaderEntry[]>([]);
  const [showEnergyError, setShowEnergyError] = useState(false);
  const [timeToNext, setTimeToNext] = useState<string>("");

  useEffect(() => {
    if (searchParams.get("no-energy") === "1") {
      setShowEnergyError(true);
      setTimeout(() => setShowEnergyError(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const updateTimer = () => {
      const lastUpdate = new Date(lastEnergyUpdate).getTime();
      const SEVEN_HOURS = 7 * 60 * 60 * 1000;
      const nextUpdate = lastUpdate + SEVEN_HOURS;
      const now = new Date().getTime();
      const diff = nextUpdate - now;

      if (diff <= 0) {
        setTimeToNext("In arrivo...");
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToNext(`${h}h ${m}m ${s}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastEnergyUpdate]);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!supabase) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, team_name, badge_id, xp")
        .order("xp", { ascending: false })
        .limit(5);
      if (data) {
        setLeaderboard(data);
      }
    }
    fetchLeaderboard();
  }, [user?.id]);

  const squadPlayers = lineup
    .sort((a, b) => a.position - b.position)
    .map((slot) => STARTER_PLAYERS.find((p) => p.id === slot.playerId))
    .filter(Boolean);

  const isSquadReady = lineup.length === 5;
  const level = 48; // Overriding for high-fidelity reference

  return (
    <div className="flex-1 overflow-y-auto bg-[#05070a] custom-scrollbar overflow-x-hidden relative">
      {/* Energy Notification Toast */}
      <AnimatePresence>
        {showEnergyError && (
          <motion.div 
            initial={{ y: -100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: -100, opacity: 0, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[200] w-[90%] max-w-md"
          >
             <div className="glass-premium p-6 rounded-3xl border-rose-500/30 bg-rose-500/10 shadow-[0_20px_50px_rgba(244,63,94,0.2)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-3xl shadow-inner">⚡</div>
                <div className="flex-1">
                   <div className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-1">ACCESSO NEGATO</div>
                   <h3 className="text-sm font-black text-white uppercase italic leading-none mb-1">Partite Esaurite</h3>
                   <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest leading-relaxed">
                      Prossima ricarica tra: <span className="text-white">{timeToNext}</span>
                   </p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-[radial-gradient(circle_at_50%_0%,_rgba(255,193,32,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-stadium-tactical opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-[1700px] mx-auto px-6 lg:px-12 py-6 relative z-10">
        <div className="space-y-10 lg:space-y-12">
          {/* 1. Hero Section */}
          <DashboardHero 
            teamName={teamName || "AC VOSTRA"}
            badgeId={badgeId}
            level={level}
            xp={xp}
            onEditProfile={() => setProfileModalOpen(true)}
          />
          
          {/* 2. Stat Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard 
              label="CREDITI DISPONIBILI" 
              value={currency.toLocaleString()} 
              subValue="CR" 
              icon="💰" 
              color="accent"
            />
            <StatCard 
              label="ENERGIA ARENA" 
              value={`${energyAmount}/3`} 
              icon="⚡" 
              color="cyan"
              subValue={energyAmount < 3 ? timeToNext : "CARICA"}
            />
            <StatCard 
              label="RANK MANAGER" 
              value={`${level} LVL`} 
              icon="🏆" 
              color="accent"
            />
            <StatCard 
              label="POSIZIONE MONDIALE" 
              value="#1" 
              icon="🌍" 
              color="emerald"
            />
          </div>

          {/* 3. Main Modules Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-7">
              <StartingFivePanel players={squadPlayers} />
            </div>
            <div className="lg:col-span-5">
              <MatchCtaPanel 
                energyAmount={energyAmount}
                isSquadReady={isSquadReady}
              />
            </div>
          </div>

          {/* 4. Secondary Modules Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-20">
            <div className="lg:col-span-5">
              <TopManagersPanel 
                entries={leaderboard}
                userId={user?.id}
              />
            </div>
            <div className="lg:col-span-7">
              <ManagerHubPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Background Vignette */}
      <div className="fixed inset-0 vignette-overlay z-0" />
    </div>
  );
}
