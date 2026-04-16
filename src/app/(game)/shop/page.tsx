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
                onClick={() => !item.comingSoon && !owned && handleBuy(item)}
              >
                {/* Coming soon badge */}
                {item.comingSoon && (
                  <div className="absolute top-3 right-3 text-[8px] px-2 py-0.5 rounded-full bg-white/10 text-muted uppercase tracking-widest font-black">
                    Presto
                  </div>
                )}

                {/* Owned badge */}
                {owned && (
                  <div className="absolute top-3 right-3 text-[8px] px-2 py-0.5 rounded-full bg-accent text-black uppercase tracking-widest font-black shadow-lg">
                    ✓ Tuo
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
                      onClick={(e) => { e.stopPropagation(); handleBuy(item); }}
                      disabled={owned || !canAfford}
                      className={`px-4 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${
                        owned
                          ? "bg-accent/10 text-accent cursor-default border border-accent/20"
                          : canAfford
                          ? "btn-primary shadow-lg shadow-accent/20"
                          : "bg-white/5 text-muted cursor-not-allowed border border-white/5"
                      }`}
                    >
                      {owned ? "Acquistato" : canAfford ? "Acquista" : "Mancano Credits"}
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
