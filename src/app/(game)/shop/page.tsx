"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { SHOP_ITEMS, type ShopItem } from "@/content/shop";
import { PackOpeningModal } from "@/components/game/PackOpeningModal";

const CATEGORIES = [
  { id: "all", label: "Tutti", emoji: "🛒" },
  { id: "pack", label: "Pacchetti", emoji: "📦" },
  { id: "stadium", label: "Stadio", emoji: "🏟️" },
  { id: "badge", label: "Badge", emoji: "🛡️" },
  { id: "upgrade", label: "Upgrade", emoji: "⬆️" },
  { id: "kit", label: "Kit", emoji: "👕" },
] as const;

export default function ShopPage() {
  const router = useRouter();
  const currency = useGameStore(s => s.currency);
  const purchasedItems = useGameStore(s => s.purchasedItems);
  const equippedStadium = useGameStore(s => s.equippedStadium);
  const equippedKit = useGameStore(s => s.equippedKit);
  const badgeId = useGameStore(s => s.badgeId);
  const buyItem = useGameStore(s => s.buyItem);
  const equipItem = useGameStore(s => s.equipItem);
  const buyPack = useGameStore(s => s.buyPack);
  const syncRoster = useGameStore(s => s.syncRoster);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [notification, setNotification] = useState<{ text: string; ok: boolean } | null>(null);
  const [revealedPlayer, setRevealedPlayer] = useState<any | null>(null);
  const [openingPackType, setOpeningPackType] = useState<"starter" | "premium" | null>(null);

  const filtered = SHOP_ITEMS.filter(item =>
    activeCategory === "all" || item.category === activeCategory
  );

  const handleAction = async (item: ShopItem) => {
    if (item.comingSoon) return;

    const owned = purchasedItems.includes(item.id);

    if (owned) {
      if (item.category === "pack" || item.category === "upgrade") return;
      await equipItem(item.id);
      setNotification({ text: `✨ Equipaggiato: ${item.name}!`, ok: true });
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    if (item.category === "pack" && item.packType) {
      if (currency < item.cost) {
        setNotification({ text: `❌ Credits insufficienti!`, ok: false });
        setTimeout(() => setNotification(null), 2500);
        return;
      }

      setOpeningPackType(item.packType!);
      setTimeout(async () => {
        const result = await buyPack(item.packType!);
        if (result && result.length > 0) {
          setRevealedPlayer(result[0]);
        } else {
          setOpeningPackType(null);
          setNotification({ text: `❌ Errore durante l'apertura!`, ok: false });
          setTimeout(() => setNotification(null), 2500);
        }
      }, 1500);
      return;
    }

    const ok = buyItem(item.id, item.cost);
    if (ok) {
      setNotification({ text: `✅ Acquistato: ${item.name}!`, ok: true });
    } else {
      setNotification({ text: `❌ Credits insufficienti!`, ok: false });
    }
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="relative px-4 lg:px-8 pt-8 lg:pt-12 pb-6 lg:pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-[300px] lg:w-[400px] h-[150px] lg:h-[200px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between max-w-5xl mx-auto gap-6 lg:gap-0">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-[8px] lg:text-[10px] uppercase tracking-widest font-black mb-3">
              🛒 Shop
            </div>
            <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none">Armeria <span className="text-white">Regale</span></h1>
            <p className="text-muted text-[10px] lg:text-sm mt-2">Spendi i tuoi Credits. Personalizza. Domina.</p>
          </div>
          <div className="card px-6 lg:px-8 py-3 lg:py-4 text-center border-accent/30 bg-accent/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
            <div className="text-xl lg:text-3xl font-black text-accent italic">{currency.toLocaleString()}</div>
            <div className="text-[8px] lg:text-[10px] text-muted uppercase tracking-widest mt-0.5 font-bold">Credits Disponibili</div>
          </div>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-[10px] lg:text-sm font-black uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-top-4 ${
          notification.ok ? "bg-accent/20 border border-accent/40 text-accent" : "bg-danger/20 border border-danger/40 text-danger"
        }`}>
          {notification.text}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-20">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat.id
                  ? "bg-accent text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                  : "bg-white/5 text-muted hover:bg-white/10 hover:text-foreground border border-white/5"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map(item => {
            const owned = purchasedItems.includes(item.id);
            const isEquipped = 
              (item.category === "stadium" && equippedStadium === item.id) ||
              (item.category === "kit" && equippedKit === item.id) ||
              (item.category === "badge" && badgeId === item.id);
            const canAfford = currency >= item.cost;

            return (
              <div
                key={item.id}
                className={`card p-6 flex flex-col gap-4 transition-all relative overflow-hidden group ${
                  item.comingSoon
                    ? "opacity-50 cursor-not-allowed"
                    : owned
                    ? "border-accent/30 bg-accent/5"
                    : "card-hover cursor-pointer border-white/5"
                }`}
                onClick={() => !item.comingSoon && handleAction(item)}
              >
                {/* Coming soon badge */}
                {item.comingSoon && (
                  <div className="absolute top-3 right-3 text-[8px] px-2 py-0.5 rounded-full bg-white/10 text-muted uppercase tracking-widest font-black">
                    Presto
                  </div>
                )}

                {/* Owned/Equipped badge */}
                {owned && (
                  <div className={`absolute top-3 right-3 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black shadow-lg ${
                    isEquipped ? "bg-emerald-500 text-white" : "bg-accent text-black"
                  }`}>
                    {isEquipped ? "★ Attivo" : "✓ Tuo"}
                  </div>
                )}

                {/* Emoji icon */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl lg:text-4xl transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  {item.emoji}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="font-black italic uppercase text-base lg:text-lg tracking-tight leading-tight">{item.name}</div>
                  <div className="text-[10px] lg:text-xs text-muted leading-relaxed font-medium">{item.description}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className={`text-xl lg:text-2xl font-black italic ${canAfford ? "text-accent" : "text-muted"}`}>
                    {item.cost.toLocaleString()} <span className="text-[10px] lg:text-xs font-normal text-muted">CR</span>
                  </div>

                  {!item.comingSoon && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(item); }}
                      disabled={isEquipped || (!owned && !canAfford) || (owned && (item.category === "upgrade" || item.category === "pack"))}
                      className={`px-4 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${
                        owned
                          ? "bg-accent/10 text-accent cursor-default border border-accent/20"
                          : canAfford
                          ? "btn-primary shadow-lg shadow-accent/20"
                          : "bg-white/5 text-muted cursor-not-allowed border border-white/5"
                      }`}
                    >
                      {owned ? (isEquipped ? "★ Attivo" : "Equipaggia") : canAfford ? "Acquista" : "Mancano Credits"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pack Opening Experience */}
      <PackOpeningModal 
        packType={openingPackType}
        revealedPlayer={revealedPlayer}
        onClose={async () => {
          const highlightedPlayerId = revealedPlayer?.id;
          // Close immediately for fast UX
          setOpeningPackType(null);
          setRevealedPlayer(null);
          // Navigate immediately
          router.push(highlightedPlayerId ? `/squad?highlight=${highlightedPlayerId}` : "/squad");
          // Sync in background
          await syncRoster();
        }}
      />
    </div>
  );
}
