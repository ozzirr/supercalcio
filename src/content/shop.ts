export type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
  category: "stadium" | "badge" | "upgrade" | "kit" | "pack";
  comingSoon?: boolean;
  packType?: "starter" | "premium";
};

export const SHOP_ITEMS: ShopItem[] = [
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
  // Card Packs
  {
    id: "pack_starter",
    name: "Mini Pack",
    description: "Sblocca 1 giocatore casuale (Tier Bronze/Silver). Ottimo per iniziare.",
    cost: 500,
    emoji: "📦",
    category: "pack",
    packType: "starter",
  },
  {
    id: "pack_premium",
    name: "Premium Pack",
    description: "Sblocca 1 giocatore casuale (Garantito Gold/Legendary). Solo per l'elite.",
    cost: 1500,
    emoji: "💎",
    category: "pack",
    packType: "premium",
  },
];
