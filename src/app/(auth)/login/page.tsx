"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Stub: in Milestone 2+ this will call Supabase auth
    setTimeout(() => {
      setMessage("Auth integration coming soon. For now, proceed to the game.");
      setLoading(false);
    }, 500);
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-accent">Project X</h1>
          <p className="text-muted mt-2">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>

          {message && (
            <p className="text-sm text-center text-muted">{message}</p>
          )}
        </form>

        <div className="text-center text-sm">
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-accent hover:text-accent-hover transition-colors"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
            Skip for now (play without account)
          </Link>
        </div>
      </div>
    </div>
  );
}
