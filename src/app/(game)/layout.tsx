"use client";

export const dynamic = "force-dynamic";

import { NavBar } from "@/components/layout/nav-bar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { ProfileSetup } from "@/components/profile/profile-setup";
import { useGameStore } from "@/lib/store/game-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { MatchOverlay } from "@/components/game/MatchOverlay";
import { MenuMusicPlayer } from "@/components/layout/menu-music-player";
import { DailyLoginModal } from "@/components/DailyLoginModal";

import { SettingsModal } from "@/components/layout/SettingsModal";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const initializeUser = useGameStore(s => s.initializeUser);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isProfileModalOpen = useGameStore(s => s.isProfileModalOpen);
  const setProfileModalOpen = useGameStore(s => s.setProfileModalOpen);

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) return;
      
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        initializeUser();
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [initializeUser, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999] overflow-hidden">
        {/* Cinematic Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 animate-[pulse_4s_ease-in-out_infinite]"
          style={{ backgroundImage: "url('/assets/loading-bg.png')" }}
        />
        
        {/* Gradients to blend the edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#050505_100%)]"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Main Logo */}
          <img 
            src="/assets/logo.png" 
            alt="GOLAZOO" 
            className="w-64 md:w-96 object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-float" 
          />

          {/* Loading Indicator */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-ping"></div>
              <div className="w-2 h-2 rounded-full bg-accent animate-ping delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping delay-200"></div>
            </div>
            <div className="text-white/80 font-black text-xs uppercase tracking-[0.4em] animate-pulse">
              Inizializzazione Arena
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileSetup isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <DailyLoginModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <NavBar 
        onOpenProfile={() => setProfileModalOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />
      <MatchOverlay />
      <MenuMusicPlayer />
      <main className="flex-1 flex flex-col pb-16 lg:pb-0">{children}</main>
      <MobileTabBar />
    </>
  );
}
