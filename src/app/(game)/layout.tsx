"use client";

import { NavBar } from "@/components/layout/nav-bar";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
