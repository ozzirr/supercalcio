"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";
import { PLAYSTYLES } from "@/content/playstyles";

const FEATURES = [
  {
    icon: "⚽",
    title: "Simulatore Tattico",
    desc: "Partite simulate in tempo reale: ogni azione dipende dalle tue scelte—stance, command e playstyle influenzano ogni tick di gioco.",
  },
  {
    icon: "🧠",
    title: "Engine Deterministico",
    desc: "Motore di simulazione seed-based che garantisce partite uniche ma riproducibili. Ogni gol ha una causa tattica precisa.",
  },
  {
    icon: "🏟️",
    title: "Arena 2D Live",
    desc: "Campo da calcio animato in tempo reale con Phaser: i giocatori si muovono, passano, scattano e segnano sotto i tuoi occhi.",
  },
  {
    icon: "🛒",
    title: "Shop & Progressione",
    desc: "Guadagna Credits vincendo partite. Sblocca skin stadio, badge squadra e upgrade permanenti ai tuoi eroi.",
  },
  {
    icon: "⚔️",
    title: "Matchmaking Asincrono",
    desc: "Sfida le squadre reali di altri giocatori. Le loro formazioni vengono recuperate live da Supabase.",
  },
  {
    icon: "🏅",
    title: "5 Eroi, 3 Playstyle",
    desc: "Componi la tua squadra da 6 eroi unici. Scegli tra Aggressive Press, Counter Attack e Possession Control.",
  },
];

export default function DashboardPage() {
  const lineup = useGameStore((s) => s.lineup);
  const playstyle = useGameStore((s) => s.playstyle);
  const xp = useGameStore((s) => s.xp);
  const currency = useGameStore((s) => s.currency);

  const squadPlayers = lineup
    .sort((a, b) => a.position - b.position)
    .map((slot) => STARTER_PLAYERS.find((p) => p.id === slot.playerId))
    .filter(Boolean);

  const currentPlaystyle = PLAYSTYLES.find(p => p.id === playstyle);
  const isSquadReady = lineup.length === 5;
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero banner */}
      <div className="relative px-8 pt-16 pb-10 text-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20" style={{background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)'}} />
          <div className="absolute bottom-0 left-1/4 w-[200px] h-[200px] rounded-full opacity-10" style={{background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)'}} />
          <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] rounded-full opacity-10" style={{background: 'radial-gradient(circle, #f43f5e 0%, transparent 70%)'}} />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs uppercase tracking-widest font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            MVP Early Access
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Super</span><span style={{color: '#818cf8'}}>calcio</span>
          </h1>
          <p className="text-foreground/50 text-lg max-w-lg mx-auto leading-relaxed">
            Costruisci la tua squadra. Scegli la strategia. Domina l&apos;arena.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-16 space-y-10">

        {/* --- SQUAD + PLAY SECTION --- */}
        <div className="grid grid-cols-3 gap-6">

          {/* Squad Card */}
          <div className="col-span-2 card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">La Tua Squadra</h2>
                <p className="text-xs text-muted mt-0.5 capitalize">
                  {currentPlaystyle?.name ?? "Nessun playstyle selezionato"}
                </p>
              </div>
              <Link href="/squad" className="text-xs text-accent hover:text-accent-hover transition-colors border border-accent/30 px-3 py-1.5 rounded-lg hover:border-accent/60">
                Gestisci →
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }, (_, i) => {
                const player = squadPlayers[i];
                return (
                  <div key={i} className={`rounded-xl p-3 text-center transition-all ${
                    player
                      ? "bg-accent/10 border border-accent/20 hover:border-accent/40"
                      : "border border-dashed border-border/50 opacity-50"
                  }`}>
                    {player ? (
                      <>
                        <div className="w-11 h-11 mx-auto rounded-full flex items-center justify-center font-black text-lg mb-2 relative overflow-hidden"
                          style={{background: 'linear-gradient(135deg, #6366f1, #4338ca)'}}>
                          {player.portrait ? (
                            <img src={`/portraits/${player.portrait}.png`} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white">{player.name[0]}</span>
                          )}
                        </div>
                        <div className="font-semibold text-xs truncate">{player.name}</div>
                        <div className="text-[10px] text-muted capitalize mt-0.5">{player.roleTags[0]}</div>
                      </>
                    ) : (
                      <div className="py-3 text-muted text-xs">Vuoto</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* XP Bar */}
            <div>
              <div className="flex justify-between text-xs text-muted mb-1.5">
                <span>Livello {level}</span>
                <span>{xpProgress}/100 XP</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${xpProgress}%`,
                    background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.6)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Play + Stats side */}
          <div className="flex flex-col gap-4">
            {/* Play CTA */}
            <div className="card p-6 flex flex-col items-center text-center gap-4 flex-1"
              style={{background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(67,56,202,0.1))'}}>
              <div className="text-4xl">⚽</div>
              <div>
                <div className="font-bold text-sm mb-1">{isSquadReady ? "Vai in Campo!" : "Squadra Incompleta"}</div>
                <div className="text-xs text-muted">{isSquadReady ? "La tua formazione è pronta." : "Aggiungi 5 giocatori per giocare."}</div>
              </div>
              <Link
                href={isSquadReady ? "/match" : "/squad"}
                className="btn-primary w-full text-center text-sm py-2.5"
              >
                {isSquadReady ? "Gioca Ora →" : "Completa Squadra"}
              </Link>
            </div>

            {/* Credits */}
            <div className="card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted mb-0.5">Credits</div>
                <div className="text-2xl font-black text-warning">{currency}</div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </div>

        {/* --- FEATURE GRID --- */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted font-semibold mb-4">Cosa offre Supercalcio</h2>
          <div className="grid grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover p-5 space-y-2">
                <div className="text-2xl">{f.icon}</div>
                <div className="font-semibold text-sm">{f.title}</div>
                <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/squad" className="card card-hover p-5 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🛡️</div>
            <div>
              <div className="font-semibold text-sm">Squad Builder</div>
              <div className="text-xs text-muted">Modifica formazione</div>
            </div>
          </Link>
          <Link href="/match" className="card card-hover p-5 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🏟️</div>
            <div>
              <div className="font-semibold text-sm">Gioca</div>
              <div className="text-xs text-muted">Avvia partita</div>
            </div>
          </Link>
          <Link href="/shop" className="card card-hover p-5 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center text-xl">🛒</div>
            <div>
              <div className="font-semibold text-sm">Shop</div>
              <div className="text-xs text-muted">Prossimamente</div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
