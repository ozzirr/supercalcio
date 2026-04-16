"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store/game-store";

export function ProfileSetup() {
  const { teamName, badgeId, updateProfile, user } = useGameStore();
  const [name, setName] = useState(teamName);
  const [selectedBadge, setSelectedBadge] = useState(badgeId);
  const [loading, setLoading] = useState(false);

  // If the user already has a custom name, don't show the initial setup
  // but we can use this for a settings modal later too.
  const isDefault = teamName.startsWith("Squad ");

  const badges = [
    { id: "badge_lightning", emoji: "⚡", name: "Lightning" },
    { id: "badge_dragon", emoji: "🐉", name: "Dragon" },
    { id: "badge_shield", emoji: "🛡️", name: "Protector" },
    { id: "badge_fire", emoji: "🔥", name: "Inferno" },
    { id: "badge_star", emoji: "⭐", name: "Superstar" },
  ];

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await updateProfile({ teamName: name, badgeId: selectedBadge });
    setLoading(false);
  };

  if (!isDefault) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="card w-full max-w-md p-8 space-y-8 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Benvenuto Manager</h2>
          <p className="text-muted text-sm mt-2">Personalizza la tua squadra per iniziare la scalata della classifica.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">Nome Squadra</label>
            <input
              type="text"
              maxLength={20}
              className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl focus:border-accent focus:outline-none transition-all font-bold tracking-wide"
              placeholder="Esempio: Milano Tech"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-3">Scegli il tuo Stemma</label>
            <div className="grid grid-cols-5 gap-3">
              {badges.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBadge(b.id)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                    selectedBadge === b.id 
                    ? "bg-accent shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-110" 
                    : "bg-white/5 border border-border hover:border-accent/40"
                  }`}
                >
                  {b.emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="w-full btn-primary py-4 text-sm font-black uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Salvataggio..." : "Salva e Inizia"}
          </button>
        </div>
      </div>
    </div>
  );
}
