"use client";

export const dynamic = "force-dynamic";

import { NavBar } from "@/components/layout/nav-bar";
import { useGameStore } from "@/lib/store/game-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const initializeUser = useGameStore(s => s.initializeUser);
  const user = useGameStore(s => s.user);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-accent font-black text-xs uppercase tracking-tighter">
            SC
          </div>
        </div>
        <div className="mt-6 text-accent/60 text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Sincronizzazione Arena...
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
