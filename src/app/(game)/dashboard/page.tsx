"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { PLAYSTYLES } from "@/content/playstyles";
import { supabase } from "@/lib/supabase/client";
import { TeamHero } from "@/components/dashboard/TeamHero";
import { MatchActionPanel } from "@/components/dashboard/MatchActionPanel";
import { TeamSnapshot } from "@/components/dashboard/TeamSnapshot";
import { ResourceHUD } from "@/components/dashboard/ResourceHUD";
import { LeaderboardPreview } from "@/components/dashboard/LeaderboardPreview";
import { ManagerHub } from "@/components/dashboard/ManagerHub";
import { QuickAccessDock } from "@/components/dashboard/QuickAccessDock";

const FEATURES = []; // Obsolete, using ManagerHub now

type MiniLeaderEntry = {
  id: string;
  team_name: string;
  badge_id: string;
  xp: number;
};

export default function DashboardPage() {
  const lineup = useGameStore((s) => s.lineup);
  const playstyle = useGameStore((s) => s.playstyle);
  const xp = useGameStore((s) => s.xp);
  const currency = useGameStore((s) => s.currency);
  const teamName = useGameStore((s) => s.teamName);
  const badgeId = useGameStore((s) => s.badgeId);
  const setProfileModalOpen = useGameStore((s) => s.setProfileModalOpen);
  const user = useGameStore((s) => s.user);
  const energyAmount = useGameStore((s) => s.energyAmount);
  const lastEnergyUpdate = useGameStore((s) => s.lastEnergyUpdate);

  const [leaderboard, setLeaderboard] = useState<MiniLeaderEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [energyTimer, setEnergyTimer] = useState("");

  useEffect(() => {
    if (energyAmount >= 3) {
      setEnergyTimer("");
      return;
    }
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const lastUpdate = new Date(lastEnergyUpdate).getTime();
      const SEVEN_HOURS = 7 * 60 * 60 * 1000;
      const diff = now - lastUpdate;
      
      if (diff >= SEVEN_HOURS) {
        useGameStore.getState().refreshEnergy();
      } else {
        const remaining = SEVEN_HOURS - diff;
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setEnergyTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    // run once immediately
    useGameStore.getState().refreshEnergy();
    return () => clearInterval(interval);
  }, [energyAmount, lastEnergyUpdate]);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!supabase) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, team_name, badge_id, xp")
        .order("xp", { ascending: false })
        .limit(10);
      if (data) {
        setLeaderboard(data.slice(0, 5));
        const idx = data.findIndex((e) => e.id === user?.id);
        setUserRank(idx !== -1 ? idx + 1 : null);
      }
    }
    fetchLeaderboard();
  }, [user?.id]);

  const badgeEmoji =
    badgeId === "badge_lightning" ? "⚡" :
    badgeId === "badge_dragon" ? "🐉" :
    badgeId === "badge_shield" ? "🛡️" :
    badgeId === "badge_fire" ? "🔥" : "⭐";

  const squadPlayers = lineup
    .sort((a, b) => a.position - b.position)
    .map((slot) => STARTER_PLAYERS.find((p) => p.id === slot.playerId))
    .filter(Boolean);

  const currentPlaystyle = PLAYSTYLES.find((p) => p.id === playstyle);
  const isSquadReady = lineup.length === 5;
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  return (
    <div className="flex-1 overflow-y-auto bg-[#05070a]">
      {/* 1. Team Command Center (Hero) */}
      <TeamHero 
        teamName={teamName}
        badgeEmoji={badgeEmoji}
        level={level}
        xpProgress={xpProgress}
        onEditProfile={() => setProfileModalOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-24 -mt-10 relative z-20 space-y-12">
        
        {/* 2. Resource HUD (HUD Widgets) */}
        <ResourceHUD 
          currency={currency}
          energy={energyAmount}
          level={level}
          rank={userRank}
        />

        {/* 3. Main Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Action Panel (Play Match) */}
          <div className="lg:order-2">
            <MatchActionPanel 
              energyAmount={energyAmount}
              energyTimer={energyTimer}
              isSquadReady={isSquadReady}
              matchInProgress={false}
            />
          </div>

          {/* Team Snapshot (Roster) */}
          <div className="lg:col-span-2 lg:order-1">
            <TeamSnapshot 
              players={squadPlayers}
              playstyleName={currentPlaystyle?.name ?? "Standard"}
            />
          </div>

        </div>

        {/* 4. Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Leaderboard Preview */}
          <div className="lg:col-span-2">
            <LeaderboardPreview 
              entries={leaderboard}
              userId={user?.id}
            />
          </div>

          {/* Manager Hub */}
          <div className="lg:col-span-3">
             <ManagerHub />
          </div>

        </div>

        {/* 5. Bottom Shortcuts */}
        <QuickAccessDock />

      </div>
    </div>
  );
}
