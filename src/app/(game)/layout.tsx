"use client";

export const dynamic = "force-dynamic";

import { NavBar } from "@/components/layout/nav-bar";
import { useGameStore } from "@/lib/store/game-store";
import { useEffect } from "react";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const initializeUser = useGameStore(s => s.initializeUser);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
