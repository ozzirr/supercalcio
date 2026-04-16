"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/store/game-store";

const BADGES = [
  { id: "badge_lightning", emoji: "⚡", name: "Lightning" },
  { id: "badge_dragon", emoji: "🐉", name: "Dragon" },
  { id: "badge_shield", emoji: "🛡️", name: "Protector" },
  { id: "badge_fire", emoji: "🔥", name: "Inferno" },
  { id: "badge_star", emoji: "⭐", name: "Superstar" },
];

export function ProfileSetup({ isOpen: manualOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const { teamName, username: currentUsername, badgeId, user, updateProfile } = useGameStore();
  const [name, setName] = useState(teamName);
  const [username, setUsername] = useState(currentUsername);
  const [selectedBadge, setSelectedBadge] = useState(badgeId);
  const [loading, setLoading] = useState(false);

  // If the user already has a custom name, don't show the initial setup auto-modal
  const isDefault = teamName.startsWith("Squad ") || !teamName;
  const showModal = manualOpen || isDefault;

  useEffect(() => {
    setName(teamName);
    setSelectedBadge(badgeId);
  }, [teamName, badgeId, manualOpen]);

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) return;
    setLoading(true);
    await updateProfile({ 
      teamName: name, 
      badgeId: selectedBadge,
      username: username 
    });

    setLoading(false);
    if (onClose) onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="card w-full max-w-md p-8 space-y-8 shadow-[0_0_80px_rgba(251,191,36,0.1)] border-accent/20">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white">✕</button>
        )}
        <div className="text-center">
          <div className="text-5xl mb-6">🏅</div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic italic">KINGS<span className="text-accent">LEAGUE</span></h2>
          <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-black mt-2">Personalizza il tuo team</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-2 ml-1">Manager Username</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 focus:outline-none transition-all font-black uppercase italic tracking-tight text-lg mb-4"
              placeholder="Coach Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-2 ml-1">Nome Squadra</label>
            <input
              type="text"
              maxLength={20}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 focus:outline-none transition-all font-black uppercase italic tracking-tight text-lg"
              placeholder="Esempio: REAL MILANO"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-3 ml-1">Scegli il tuo Stemma</label>
            <div className="grid grid-cols-5 gap-3">
              {BADGES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBadge(b.id)}
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    selectedBadge === b.id 
                    ? "bg-accent text-black shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-110" 
                    : "bg-white/5 border border-white/10 hover:border-accent/40"
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
            className="w-full btn-primary py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-30"
          >
            {loading ? "Registrazione..." : isDefault ? "Inizia il Matchday →" : "Salva Modifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}
