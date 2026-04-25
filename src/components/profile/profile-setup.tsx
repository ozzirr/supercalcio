"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { useRouter } from "next/navigation";
import { BadgeDisplay } from "./badge-display";
import type { CustomBadge } from "@/types/badge";

const SYMBOL_EMOJIS: Record<string, string> = {
  lightning: "⚡",
  dragon: "🐉",
  shield: "🛡️",
  fire: "🔥",
  star: "⭐",
  crown: "👑",
  sword: "⚔️",
  trophy: "🏆",
  phoenix: "🔥",
  mountain: "⛰️",
  wave: "🌊",
  leaf: "🍃",
  heart: "❤️",
  diamond: "💎",
  flame: "🔥",
};

export function ProfileSetup({ isOpen: manualOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const router = useRouter();
  const { teamName, username: currentUsername, badgeId, user, updateProfile, ownedPlayers, customBadge: storedBadge } = useGameStore();
  const [name, setName] = useState(teamName);
  const [username, setUsername] = useState(currentUsername);
  const [selectedBadge, setSelectedBadge] = useState(badgeId);
  const [loading, setLoading] = useState(false);
  const [customBadge, setCustomBadge] = useState<CustomBadge | null>(storedBadge || null);

  // Onboarding is only forced if name is default AND user has no players
  const isDefaultName = teamName.startsWith("Squad ") || !teamName;
  const hasClaimedPack = ownedPlayers && ownedPlayers.length > 0;
  
  // Show if manually triggered OR if it's the first-time onboarding (default name AND no players)
  const showModal = manualOpen || (isDefaultName && !hasClaimedPack);

  useEffect(() => {
    setName(teamName);
    setSelectedBadge(badgeId);
    setCustomBadge(storedBadge);
  }, [teamName, badgeId, storedBadge, manualOpen]);

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) return;
    setLoading(true);
    await updateProfile({
      teamName: name,
      badgeId: selectedBadge,
      username: username,
      customBadge: customBadge || undefined
    });

    setLoading(false);
    if (onClose) onClose();

    // If it was the initial setup (no players yet), redirect to squad with claim flag
    if (!hasClaimedPack) {
      router.push("/squad?claim=true");
    }
  };

  if (!showModal) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleSaveBadge = (badge: CustomBadge) => {
    setCustomBadge(badge);
    setShowBadgeEditor(false);
  };

  return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in" onClick={handleBackdropClick}>
        <div className="card w-full max-w-md p-8 space-y-8 shadow-[0_0_80px_rgba(251,191,36,0.1)] border-accent/20">
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white">✕</button>
          )}
        <div className="text-center">
          <div className="text-5xl mb-6">🏅</div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic italic">SUPER<span className="text-accent">CALCIO</span></h2>
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
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-3 ml-1">Scegli Simbolo Stemma</label>
            <div className="grid grid-cols-5 gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 max-h-[160px] overflow-y-auto custom-scrollbar">
              {Object.entries(SYMBOL_EMOJIS).map(([key, emoji]) => (
                <button
                  key={key}
                  onClick={() => {
                    const newBadge: CustomBadge = {
                      id: `custom_${key}`,
                      shape: "shield",
                      backgroundColor: "#FFC324",
                      borderColor: "#FFFFFF",
                      symbol: key as any,
                      symbolColor: "#000000",
                      createdAt: Date.now()
                    };
                    setCustomBadge(newBadge);
                  }}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl transition-all ${
                    customBadge?.symbol === key
                      ? "bg-gold text-black scale-110 shadow-[0_0_20px_rgba(255,193,32,0.4)]"
                      : "bg-white/5 border border-white/10 hover:border-gold/40 text-white/60"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="w-full btn-primary py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-30"
          >
            {loading ? "Registrazione..." : !hasClaimedPack ? "Ricevi Starter Pack →" : "Salva Modifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}
