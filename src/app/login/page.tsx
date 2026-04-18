"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "🎯",
    title: "Costruisci la Rosa",
    desc: "Scegli i tuoi 5 campioni, imposta la tattica e scendi in campo.",
  },
  {
    step: "02",
    icon: "⚡",
    title: "Gioca in Live",
    desc: "Match 5v5 in tempo reale contro manager globali. Ogni scelta conta.",
  },
  {
    step: "03",
    icon: "🏆",
    title: "Scala il Ranking",
    desc: "Accumula XP, potenzia i giocatori e conquista il trono.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const userResp = await supabase.auth.getUser();
        if (userResp.data.user) {
          await supabase.from("profiles").insert({
            id: userResp.data.user.id,
            username: email.split("@")[0],
          });
        }

        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen overflow-hidden">
      {/* Left Column: Game Preview & Hero */}
      <div className="relative flex-1 hidden md:flex flex-col justify-center p-12 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Futuristic Arena"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-2xl space-y-10">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none italic">
              Super<span className="text-accent">calcio</span>
            </h1>
            <p className="text-xl text-foreground/80 font-medium tracking-tight max-w-lg leading-relaxed">
              Il primo simulatore di calcio cyberpunk 5v5. Costruisci la squadra,
              sfida il mondo, conquista il trono.
            </p>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted font-black mb-4">Come funziona</div>
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm uppercase tracking-wide">{step.title}</div>
                  <p className="text-xs text-muted leading-tight mt-0.5">{step.desc}</p>
                </div>
                <div className="text-2xl font-black italic text-white/10 shrink-0">{step.step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Player Cards Preview */}
        <div className="relative z-10 w-full max-w-2xl flex gap-8 py-8 mt-8 h-48 pointer-events-none">
          <div className="card p-4 w-40 h-56 flex flex-col items-center gap-3 animate-float border-accent/40 bg-accent/10">
            <div className="w-20 h-20 rounded-full bg-accent/20 overflow-hidden">
              <img src="/portraits/aegis.png" alt="Aegis" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Aegis</div>
              <div className="text-[10px] uppercase text-muted">Portiere</div>
            </div>
          </div>
          <div className="card p-4 w-40 h-56 flex flex-col items-center gap-3 animate-float-delayed border-danger/40 bg-danger/10 translate-y-12">
            <div className="w-20 h-20 rounded-full bg-danger/20 overflow-hidden">
              <img src="/portraits/blaze.png" alt="Blaze" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Blaze</div>
              <div className="text-[10px] uppercase text-muted">Attaccante</div>
            </div>
          </div>
          <div className="card p-4 w-40 h-56 flex flex-col items-center gap-3 animate-float border-warning/40 bg-warning/10">
            <div className="w-20 h-20 rounded-full bg-warning/20 overflow-hidden">
              <img src="/portraits/titan.png" alt="Titan" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Titan</div>
              <div className="text-[10px] uppercase text-muted">Difensore</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="relative z-20 w-full md:w-[450px] flex items-center justify-center p-8 bg-background border-l border-white/5">
        <div className="w-full max-w-sm space-y-8 animate-in">
          {/* Logo visible on mobile only */}
          <div className="md:hidden text-center mb-12">
            <h1 className="text-4xl font-black italic tracking-tighter">
              Super<span className="text-accent">calcio</span>
            </h1>
            <p className="text-xs text-muted mt-2">Il calcio del futuro è adesso.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {isLogin ? "Bentornato" : "Crea Account"}
            </h2>
            <p className="text-muted text-sm">
              {isLogin
                ? "Inserisci le tue credenziali per entrare nell'arena."
                : "Inizia oggi la tua scalata verso la gloria."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-danger/10 text-danger border border-danger/20 text-xs font-medium fade-in">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-foreground focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
                  placeholder="manager@supercalcio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-foreground focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_40px_rgba(251,191,36,0.35)] transition-all"
            >
              {loading ? "Caricamento..." : isLogin ? "Entra nell'Arena" : "Unisciti Ora — È Gratis"}
            </button>
          </form>

          <div className="pt-2 text-center space-y-3">
            <div className="h-px bg-white/5" />
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-xs text-muted hover:text-accent transition-colors font-medium"
            >
              {isLogin
                ? "Non hai un account? Registrati gratuitamente →"
                : "Hai già un account? Effettua il login →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
