"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // MVP: Just auto-signin and create profile trigger on backend or directly here
        const userResp = await supabase.auth.getUser();
        if (userResp.data.user) {
           await supabase.from('profiles').insert({
              id: userResp.data.user.id,
              username: email.split('@')[0],
           });
        }
        
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen overflow-hidden">
      {/* Left Column: Game Preview & Hero */}
      <div className="relative flex-1 hidden md:flex flex-col items-center justify-center p-12 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Futuristic Arena" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-2xl space-y-12 mb-12">
          <div className="space-y-4">
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none italic">
              Super<span className="text-accent">calcio</span>
            </h1>
            <p className="text-xl text-foreground/80 font-medium tracking-tight max-w-lg leading-relaxed">
              Domina l&apos;arena tattica nel primo simulatore di calcio cyberpunk 5v5. 
              Colleziona potenziamenti, sfida i manager globali e scala la classifica.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">🧠</div>
              <div>
                <div className="font-bold text-sm uppercase tracking-wide">Tactical Simulation</div>
                <p className="text-xs text-muted leading-tight">Gestisci formazione e strategie in tempo reale.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center text-xl">💰</div>
              <div>
                <div className="font-bold text-sm uppercase tracking-wide">Global Shop</div>
                <p className="text-xs text-muted leading-tight">Acquista skin, arene e potenziamenti esclusivi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Player Cards Preview */}
        <div className="relative z-10 w-full max-w-2xl flex gap-8 py-8 h-48 pointer-events-none">
          <div className="card p-4 w-40 h-56 flex flex-col items-center gap-3 animate-float border-accent/40 bg-accent/10">
            <div className="w-20 h-20 rounded-full bg-accent/20 overflow-hidden">
              <img src="/portraits/aegis.png" alt="Aegis" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Aegis</div>
              <div className="text-[10px] uppercase text-muted">Goalkeeper</div>
            </div>
          </div>
          <div className="card p-4 w-40 h-56 flex flex-col items-center gap-3 animate-float-delayed border-danger/40 bg-danger/10 translate-y-12">
            <div className="w-20 h-20 rounded-full bg-danger/20 overflow-hidden">
              <img src="/portraits/blaze.png" alt="Blaze" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Blaze</div>
              <div className="text-[10px] uppercase text-muted">Striker</div>
            </div>
          </div>
          <div className="card p-4 w-40 h-56 flex flex-col items-center gap-3 animate-float border-warning/40 bg-warning/10">
            <div className="w-20 h-20 rounded-full bg-warning/20 overflow-hidden">
              <img src="/portraits/titan.png" alt="Titan" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Titan</div>
              <div className="text-[10px] uppercase text-muted">Defender</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="relative z-20 w-full md:w-[450px] flex items-center justify-center p-8 bg-background border-l border-white/5">
        <div className="w-full max-w-sm space-y-8 animate-in">
          {/* Logo visible on mobile only */}
          <div className="md:hidden text-center mb-12">
            <h1 className="text-4xl font-black italic tracking-tighter">Super<span className="text-accent">calcio</span></h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {isLogin ? "Bentornato" : "Crea Account"}
            </h2>
            <p className="text-muted text-sm">
              {isLogin ? "Inserisci le tue credenziali per entrare nell'arena." : "Inizia oggi la tua scalata verso la gloria."}
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
              className="w-full btn-primary py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all"
            >
              {loading ? "Caricamento..." : isLogin ? "Entra nell'Arena" : "Unisciti Ora"}
            </button>
          </form>

          <div className="pt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-muted hover:text-accent transition-colors font-medium"
            >
              {isLogin ? "Non hai un account? Registrati gratuitamente" : "Hai già un account? Effettua il login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
