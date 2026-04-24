"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { STARTER_PLAYERS } from "@/content/players";
import { PlayerCard } from "@/components/ui/player-card";

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

  // Select 3 premium players for the preview (e.g. from the real roster)
  const previewPlayers = STARTER_PLAYERS.filter(p => p.tier === "legendary" || p.tier === "gold").slice(0, 3);
  if (previewPlayers.length < 3) {
    previewPlayers.push(...STARTER_PLAYERS.slice(0, 3 - previewPlayers.length));
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-background overflow-hidden selection:bg-accent/30 selection:text-accent">
      
      {/* Left Column: Cinematic Game World Preview */}
      <div className="relative hidden md:flex flex-1 flex-col justify-between p-12 lg:p-16 overflow-hidden border-r border-white/5">
        
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0a0a0c]"></div>
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-accent/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/10 text-accent text-[9px] uppercase tracking-[0.3em] font-black mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            Accesso Autorizzato
          </div>
          <div className="mb-6">
            <img src="/assets/logo.png" alt="GOLAZOO" className="h-24 lg:h-32 w-auto object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform" />
          </div>
          <p className="text-lg lg:text-xl text-foreground/70 font-medium tracking-tight max-w-md leading-relaxed">
            Il simulatore tattico definitivo. Crea la tua rosa, domina il mercato e conquista l'arena globale.
          </p>
        </div>

        {/* Dynamic Roster Preview */}
        <div className="relative z-10 flex-1 flex items-center justify-center my-12 pointer-events-none perspective-1000">
          <div className="relative w-full max-w-lg h-64 flex justify-center items-center">
            {previewPlayers[0] && (
              <div className="absolute left-[10%] transform -rotate-12 -translate-y-4 scale-90 opacity-60 blur-[1px] transition-all duration-700">
                <div className="w-40"><PlayerCard player={previewPlayers[0]} /></div>
              </div>
            )}
            {previewPlayers[2] && (
              <div className="absolute right-[10%] transform rotate-12 -translate-y-4 scale-90 opacity-60 blur-[1px] transition-all duration-700">
                <div className="w-40"><PlayerCard player={previewPlayers[2]} /></div>
              </div>
            )}
            {previewPlayers[1] && (
              <div className="absolute z-20 transform scale-110 shadow-[0_0_50px_rgba(251,191,36,0.15)] transition-all duration-700">
                <div className="w-48"><PlayerCard player={previewPlayers[1]} /></div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 grid grid-cols-2 gap-6 max-w-lg">
          <div className="space-y-1.5">
            <div className="text-accent text-[10px] font-black uppercase tracking-widest">Mercato Live</div>
            <div className="text-xs text-muted leading-tight">Gestisci il budget e scova i migliori talenti della Serie A in tempo reale.</div>
          </div>
          <div className="space-y-1.5">
            <div className="text-accent text-[10px] font-black uppercase tracking-widest">Match Engine 2.0</div>
            <div className="text-xs text-muted leading-tight">Vivi la simulazione tattica 5v5 con commento live e dinamiche fluide.</div>
          </div>
        </div>

      </div>

      {/* Right Column: Premium Auth Panel */}
      <div className="relative z-20 w-full md:w-[500px] flex flex-col justify-center px-8 py-12 lg:p-16 bg-[#0a0a0c] shadow-2xl">
        
        {/* Mobile Header */}
        <div className="md:hidden mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <img src="/assets/logo.png" alt="GOLAZOO" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Terminal Access</p>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight leading-none">
              {isLogin ? "Accedi al Comando" : "Inizia la Scalata"}
            </h2>
            <p className="text-muted text-sm font-medium">
              {isLogin
                ? "Autenticazione richiesta. La tua squadra è in attesa di ordini."
                : "Registra il tuo profilo manager e ricevi il budget iniziale."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-bold flex items-center gap-3 animate-in fade-in">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-black ml-1 group-focus-within:text-accent transition-colors">ID Manager (Email)</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm font-bold placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                    placeholder="manager@golazoo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-xl border border-accent/0 pointer-events-none group-focus-within:border-accent/20 transition-all duration-500"></div>
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-black group-focus-within:text-accent transition-colors">Chiave di Sicurezza</label>
                  {isLogin && <a href="#" className="text-[9px] uppercase tracking-widest text-muted hover:text-white transition-colors">Recupera?</a>}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm font-bold placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-xl border border-accent/0 pointer-events-none group-focus-within:border-accent/20 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.25em] transition-all overflow-hidden bg-accent text-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Sincronizzazione..." : isLogin ? "Entra nell'Arena" : "Inizializza Profilo"}
              </span>
            </button>
          </form>

          <div className="pt-6 border-t border-white/5 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-[11px] font-bold text-muted hover:text-white transition-colors uppercase tracking-widest group"
            >
              {isLogin ? (
                <>Nuovo Manager? <span className="text-accent group-hover:underline underline-offset-4">Richiedi Accesso</span></>
              ) : (
                <>Hai già le credenziali? <span className="text-accent group-hover:underline underline-offset-4">Esegui Login</span></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
