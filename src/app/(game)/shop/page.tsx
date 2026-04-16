"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store/game-store";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
  category: "stadium" | "badge" | "upgrade" | "kit";
  comingSoon?: boolean;
};

const SHOP_ITEMS: ShopItem[] = [
  // Stadium Skins
  {
    id: "stadium_neon",
    name: "Neon Arena",
    description: "Campo elettrico con linee neon blu e viola. Il futuro del calcio.",
    cost: 150,
    emoji: "⚡",
    category: "stadium",
  },
  {
    id: "stadium_retro",
    name: "Retro Grass",
    description: "Campo classico con i colori dell'erba anni '90. Nostalgia pura.",
    cost: 80,
    emoji: "🌿",
    category: "stadium",
  },
  {
    id: "stadium_galaxy",
    name: "Galaxy Pitch",
    description: "Giochi nello spazio. Campo cosmico con stelle sullo sfondo.",
    cost: 250,
    emoji: "🌌",
    category: "stadium",
    comingSoon: true,
  },
  // Badge skins
  {
    id: "badge_dragon",
    name: "Dragon Crest",
    description: "Stemma con drago dorato. Dichiara la tua dominanza sul campo.",
    cost: 100,
    emoji: "🐉",
    category: "badge",
  },
  {
    id: "badge_lightning",
    name: "Lightning Shield",
    description: "Scudo con fulmine. Velocità e potenza nel tuo simbolo.",
    cost: 75,
    emoji: "🛡️",
    category: "badge",
  },
  {
    id: "badge_crown",
    name: "Royal Crown",
    description: "Una corona. Perché sei il re dell'arena.",
    cost: 200,
    emoji: "👑",
    category: "badge",
    comingSoon: true,
  },
  // Player upgrades
  {
    id: "upgrade_pac",
    name: "Speed Boost",
    description: "+5 PAC (Velocità) a tutti i giocatori della rosa.",
    cost: 120,
    emoji: "🚀",
    category: "upgrade",
  },
  {
    id: "upgrade_sho",
    name: "Sniper Training",
    description: "+5 SHO (Tiro) a tutti gli attaccanti. Più gol garantiti.",
    cost: 120,
    emoji: "🎯",
    category: "upgrade",
  },
  {
    id: "upgrade_def",
    name: "Iron Wall",
    description: "+5 DEF (Difesa) a tutti i difensori. Una porta blindata.",
    cost: 120,
    emoji: "🧱",
    category: "upgrade",
  },
  // Kit
  {
    id: "kit_black",
    name: "Blackout Kit",
    description: "Divisa total black con dettagli dorati. Eleganza pura.",
    cost: 60,
    emoji: "🖤",
    category: "kit",
  },
  {
    id: "kit_red",
    name: "Crimson Kit",
    description: "Rosso fuoco con bordi neri. Intimidisci prima di scendere in campo.",
    cost: 60,
    emoji: "❤️",
    category: "kit",
  },
  {
    id: "kit_gold",
    name: "Champion Gold",
    description: "Divisa oro da campioni. Solo per chi vince.",
    cost: 180,
    emoji: "🏆",
    category: "kit",
    comingSoon: true,
  },
];

const CATEGORIES = [
  { id: "all", label: "Tutti", emoji: "🛒" },
  { id: "stadium", label: "Stadio", emoji: "🏟️" },
  { id: "badge", label: "Badge", emoji: "🛡️" },
  { id: "upgrade", label: "Upgrade", emoji: "⬆️" },
  { id: "kit", label: "Kit", emoji: "👕" },
] as const;

export default function ShopPage() {
  const currency = useGameStore(s => s.currency);
  const purchasedItems = useGameStore(s => s.purchasedItems);
  const buyItem = useGameStore(s => s.buyItem);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [notification, setNotification] = useState<{ text: string; ok: boolean } | null>(null);

  const filtered = SHOP_ITEMS.filter(item =>
    activeCategory === "all" || item.category === activeCategory
  );

  const handleBuy = (item: ShopItem) => {
    if (item.comingSoon) return;
    const ok = buyItem(item.id, item.cost);
    if (ok) {
      setNotification({ text: `✅ Acquistato: ${item.name}!`, ok: true });
    } else if (purchasedItems.includes(item.id)) {
      setNotification({ text: `Hai già acquistato ${item.name}.`, ok: false });
    } else {
      setNotification({ text: `❌ Credits insufficienti! Ti servono ${item.cost} Credits.`, ok: false });
    }
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="relative px-8 pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-[400px] h-[200px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 flex items-end justify-between max-w-5xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warning/30 bg-warning/10 text-warning text-xs uppercase tracking-widest font-semibold mb-3">
              🛒 Shop
            </div>
            <h1 className="text-3xl font-black">Armeria</h1>
            <p className="text-muted text-sm mt-1">Spendi i tuoi Credits. Personalizza. Domina.</p>
          </div>
          <div className="card px-6 py-4 text-center border-warning/30" style={{ background: 'rgba(245,158,11,0.08)' }}>
            <div className="text-2xl font-black text-warning">{currency}</div>
            <div className="text-xs text-muted uppercase tracking-wider mt-0.5">Credits</div>
          </div>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-xl fade-in ${
          notification.ok ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" : "bg-danger/20 border border-danger/40 text-danger"
        }`}>
          {notification.text}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-8 pb-16">
        {/* Category Filter */}
        <div className="flex gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-accent text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  : "bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-3 gap-5">
          {filtered.map(item => {
            const owned = purchasedItems.includes(item.id);
            const canAfford = currency >= item.cost;

            return (
              <div
                key={item.id}
                className={`card p-5 flex flex-col gap-4 transition-all relative overflow-hidden ${
                  item.comingSoon
                    ? "opacity-50 cursor-not-allowed"
                    : owned
                    ? "border-emerald-500/30"
                    : "card-hover cursor-pointer"
                }`}
                onClick={() => !item.comingSoon && !owned && handleBuy(item)}
              >
                {/* Coming soon badge */}
                {item.comingSoon && (
                  <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted uppercase tracking-wider">
                    Presto
                  </div>
                )}

                {/* Owned badge */}
                {owned && (
                  <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    ✓ Tuo
                  </div>
                )}

                {/* Emoji icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  {item.emoji}
                </div>

                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">{item.name}</div>
                  <div className="text-xs text-muted leading-relaxed">{item.description}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`text-lg font-black ${canAfford ? "text-warning" : "text-muted"}`}>
                    {item.cost} <span className="text-xs font-normal text-muted">CR</span>
                  </div>

                  {!item.comingSoon && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBuy(item); }}
                      disabled={owned || !canAfford}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        owned
                          ? "bg-emerald-500/15 text-emerald-400 cursor-default"
                          : canAfford
                          ? "bg-accent text-white hover:bg-accent-hover shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                          : "bg-white/5 text-muted cursor-not-allowed"
                      }`}
                    >
                      {owned ? "Acquistato" : canAfford ? "Acquista" : "Insufficiente"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
