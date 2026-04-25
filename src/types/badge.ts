export type BadgeShape = "shield" | "circle" | "hexagon" | "square";

export type BadgeSymbol =
  | "lightning" | "dragon" | "shield" | "fire" | "star"
  | "crown" | "sword" | "trophy" | "phoenix" | "mountain"
  | "wave" | "leaf" | "heart" | "diamond" | "flame";

export type CustomBadge = {
  id: string;
  name?: string;
  shape: BadgeShape;
  backgroundColor: string;
  borderColor: string;
  symbol: BadgeSymbol;
  symbolColor: string;
  createdAt: number;
};
