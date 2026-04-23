"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { PLAYSTYLES } from "@/content/playstyles";
import { supabase } from "@/lib/supabase/client";

const FEATURES = [
  {
    icon: "⚽",
    title: "Super Simulation",
    desc: "Il motore di gioco più dinamico: ogni tua scelta tattica—stance, command e playstyle—cambia l'esito del match in tempo reale.",
  },
  {
    icon: "📈",
    title: "Potenzia i Campioni",
    desc: "Porta i tuoi giocatori al livello successivo. Potenzia velocità, tiro e difesa per dominare la lega.",
  },
  {
    icon: "🏟️",
    title: "Arena Live",
    desc: "Esperienza broadcast completa: segui ogni azione sul campo 2D animato con la telecronaca testuale live.",
  },
  {
    icon: "💼",
    title: "Mercato Trasferimenti",
    desc: "Costruisci il tuo dream team. Compra giovani talenti o esperti veterani dal mercato globale.",
  },
  {
    icon: "⚔️",
    title: "Ranking Globale",
    desc: "Sfida le squadre degli altri manager. Più vinci, più sali nel ranking globale di GIOOL.",
  },
  {
    icon: "🎁",
    title: "Ricompense Giornaliere",
    desc: "Gioca ogni giorno per guadagnare Credits extra e sbloccare bonus unici per la tua squadra.",
  },
];

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

  const [leaderboard, setLeaderboard] = useState<MiniLeaderEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

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
    <div className="flex-1 overflow-y-auto">
      {/* Hero banner */}
      <div className="relative px-4 lg:px-8 pt-10 lg:pt-16 pb-10 lg:pb-14 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] lg:w-[800px] h-[200px] lg:h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 left-1/4 w-[150px] lg:w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
            style={{ background: "#ef4444" }}
          />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent text-[8px] lg:text-[10px] uppercase tracking-[0.2em] font-black mb-6 lg:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            GIOOL &bull; Season 1: The Throne
          </div>

          <div className="flex justify-center mb-3 lg:mb-4">
            <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-accent/20 flex items-center justify-center text-3xl lg:text-5xl border border-accent/40 shadow-[0_0_40px_rgba(251,191,36,0.25)]">
              {badgeEmoji}
            </div>
          </div>

          <h1 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
            {teamName}
          </h1>

          <button
            onClick={() => setProfileModalOpen(true)}
            className="mt-3 text-[8px] lg:text-[10px] uppercase font-black tracking-widest text-muted hover:text-accent transition-colors"
          >
            [Modifica Profilo]
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-20 space-y-10 lg:space-y-12">

        {/* MAIN ACTION SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Squad Roster */}
          <div className="lg:col-span-2 card p-6 lg:p-8 space-y-6 lg:space-y-8 border-accent/20 shadow-[0_0_40px_rgba(251,191,36,0.05)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg lg:text-xl font-black uppercase italic tracking-tight">Il Tuo Roster</h2>
                <p className="text-[10px] text-muted uppercase tracking-widest mt-1 font-bold">
                  Assetto: <span className="text-accent">{currentPlaystyle?.name ?? "Nessuno"}</span>
                </p>
              </div>
              <Link href="/squad" className="btn-secondary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                Gestisci Formazione
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2 lg:gap-4">
              {Array.from({ length: 5 }, (_, i) => {
                const player = squadPlayers[i];
                return (
                  <Link
                    key={i}
                    href={player ? `/players/${player.id}` : "/squad"}
                    className={`group rounded-xl lg:rounded-2xl p-2 lg:p-4 text-center transition-all ${
                      player
                        ? "bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-accent/5"
                        : "border border-dashed border-white/5 opacity-40 hover:opacity-100"
                    }`}
                  >
                    {player ? (
                      <>
                        <div className="aspect-square mb-2 lg:mb-3 rounded-full overflow-hidden border border-accent/30 shadow-lg group-hover:border-accent">
                          <img src={`/assets/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-black italic uppercase text-[8px] lg:text-[10px] tracking-tight truncate">{player.name}</div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 lg:py-6">
                        <span className="text-lg lg:text-2xl text-muted/30">+</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* XP Bar */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-end mb-2 lg:mb-3">
                <div className="text-[9px] lg:text-[10px] items-center gap-2 font-black uppercase tracking-widest text-muted">
                  Manager Rank <span className="text-accent text-base lg:text-lg italic ml-1">LVL {level}</span>
                </div>
                <div className="text-[9px] lg:text-[10px] font-bold text-accent">{xpProgress}/100 XP</div>
              </div>
              <div className="h-1.5 lg:h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${xpProgress}%`,
                    background: "linear-gradient(90deg, #fbbf24, #ef4444)",
                    boxShadow: "0 0 15px rgba(251,191,36,0.4)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 lg:space-y-6">
            <div
              className="card p-6 lg:p-8 flex flex-col items-center text-center gap-4 lg:gap-6 border-accent shadow-2xl relative overflow-hidden group"
              style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(239, 68, 68, 0.05))" }}
            >
              <div className="absolute top-0 right-0 p-4 font-black italic text-3xl lg:text-4xl opacity-5">ARENA</div>
              <div className="text-4xl lg:text-6xl group-hover:scale-110 transition-transform">🏆</div>
              <div className="space-y-1 lg:space-y-2">
                <div className="font-black uppercase italic text-xl lg:text-2xl tracking-tighter">
                  {isSquadReady ? "SCENDI IN CAMPO" : "SQUADRA INCOMPLETA"}
                </div>
                <div className="text-[10px] text-muted uppercase tracking-widest font-bold">
                  {isSquadReady ? "Pronto per il matchday" : "Completa il tuo roster 5v5"}
                </div>
              </div>
              <Link
                href={isSquadReady ? "/match" : "/squad"}
                className={`w-full text-center py-3 lg:py-4 rounded-xl font-black uppercase text-[10px] lg:text-xs tracking-[0.2em] shadow-xl transition-all ${
                  isSquadReady ? "btn-primary" : "bg-white/10 text-muted"
                }`}
              >
                {isSquadReady ? "Gioca Match Live" : "Vai allo Squad Builder"}
              </Link>
            </div>

            <div className="card p-6 flex items-center justify-between border-white/10">
              <div>
                <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Credits</div>
                <div className="text-2xl lg:text-3xl font-black italic text-accent">
                  {currency.toLocaleString()} <span className="text-[10px] lg:text-xs font-normal">CR</span>
                </div>
              </div>
              <div className="text-3xl lg:text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* MINI LEADERBOARD */}
        <div className="card p-6 lg:p-8 border-white/5">
          <div className="flex items-center justify-between mb-5 lg:mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <h2 className="text-sm lg:text-base font-black uppercase italic tracking-tight">Classifica Globale</h2>
            </div>
            <Link href="/leaderboard" className="text-[9px] lg:text-[10px] text-accent font-black uppercase tracking-widest hover:underline">
              Vedi tutto →
            </Link>
          </div>

          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : (
              leaderboard.map((entry, idx) => {
                const isMe = entry.id === user?.id;
                const lvl = Math.floor(entry.xp / 100) + 1;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 lg:gap-4 px-4 py-3 rounded-xl transition-all ${
                      isMe ? "bg-accent/10 border border-accent/20" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className={`text-sm font-black w-6 text-center shrink-0 ${
                        idx === 0 ? "text-accent" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-muted"
                      }`}
                    >
                      {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-black italic uppercase text-[10px] lg:text-xs truncate block">
                        {entry.team_name}
                        {isMe && (
                          <span className="ml-2 text-[8px] bg-accent text-black px-1 py-0.5 rounded font-black">TU</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-muted font-mono">{entry.xp.toLocaleString()} XP</span>
                      <span className="text-[9px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                        LVL {lvl}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Show user if outside top 5 */}
            {userRank === null && user && leaderboard.length > 0 && (
              <div className="flex items-center gap-3 lg:gap-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 border-dashed mt-2">
                <div className="text-sm font-black w-6 text-center text-muted shrink-0">···</div>
                <div className="flex-1 min-w-0">
                  <span className="font-black italic uppercase text-[10px] lg:text-xs truncate block">
                    {teamName}
                    <span className="ml-2 text-[8px] bg-accent text-black px-1 py-0.5 rounded font-black">TU</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-muted font-mono">{xp.toLocaleString()} XP</span>
                  <span className="text-[9px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                    LVL {level}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GUIDA DEL MANAGER */}
        <div>
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <h2 className="text-[10px] uppercase tracking-[0.3em] lg:tracking-[0.4em] text-muted font-black shrink-0">
              GUIDA DEL MANAGER
            </h2>
            <div className="h-px bg-white/5 flex-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card card-hover p-6 lg:p-8 space-y-3 lg:space-y-4 border-white/5 bg-white/5 relative overflow-hidden"
              >
                <div className="text-3xl lg:text-4xl opacity-80">{f.icon}</div>
                <div className="space-y-1 lg:space-y-2">
                  <div className="font-black italic uppercase text-base lg:text-lg tracking-tight">{f.title}</div>
                  <div className="text-[10px] lg:text-xs text-muted leading-relaxed font-medium">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Link href="/mercato" className="card card-hover p-6 flex items-center gap-6 group border-accent/20 bg-accent/5">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-accent/15 flex items-center justify-center text-2xl lg:text-3xl group-hover:scale-110 transition-transform">
              ⚽
            </div>
            <div>
              <div className="font-black uppercase italic text-base lg:text-lg tracking-tight">Mercato</div>
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">Compra & Vendi</div>
            </div>
          </Link>
          <Link href="/leaderboard" className="card card-hover p-6 flex items-center gap-6 group border-white/5">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center text-2xl lg:text-3xl group-hover:scale-110 transition-transform">
              📊
            </div>
            <div>
              <div className="font-black uppercase italic text-base lg:text-lg tracking-tight">Ranking</div>
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">Classifica Mondiale</div>
            </div>
          </Link>
          <div className="card p-6 flex items-center gap-6 group border-white/5 opacity-50">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center text-2xl lg:text-3xl transition-transform">
              📦
            </div>
            <div>
              <div className="font-black uppercase italic text-base lg:text-lg tracking-tight">Box & Loot</div>
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">Prossimamente</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
