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
    <div className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
      <div className="card w-full max-w-md p-8 animate-in shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden">
        {/* Glow effect back */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-accent/20 to-transparent opacity-20 pointer-events-none rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">Supercalcio</h1>
          <p className="text-muted text-sm px-4">
            {isLogin ? "Welcome back to the Arena." : "Create your ultimate squad."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-3 rounded bg-danger/10 text-danger border border-danger/30 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2 font-semibold">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-black/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2 font-semibold">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-black/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? "Processing..." : isLogin ? "Enter Arena" : "Join Now"}</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-muted hover:text-accent transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
