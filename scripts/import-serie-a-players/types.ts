// --- Import Pipeline Types ---

export type PlayerRole = "GK" | "DEF" | "MID" | "ATT";

export interface RawPlayerData {
  sourceName: string;
  slug: string;
  displayName: string;
  role: PlayerRole;
  team?: string | null;
  sourcePage: string;
  sourceImageUrl?: string | null;
  localImagePath?: string | null;
}

export interface ImportReport {
  timestamp: string;
  totalFound: number;
  totalNormalized: number;
  totalImagesDownloaded: number;
  totalPlayersImported: number;
  failures: FailureEntry[];
  warnings: string[];
}

export interface FailureEntry {
  player: string;
  error: string;
  stage: "scrape" | "normalize" | "download" | "import";
}

export interface CliFlags {
  dryRun: boolean;
  forceImages: boolean;
  skipImages: boolean;
  skipDb: boolean;
  limit: number;
  verbose: boolean;
}

export const ROLE_MAPPING: Record<string, PlayerRole> = {
  portieri: "GK",
  difensori: "DEF",
  centrocampisti: "MID",
  attaccanti: "ATT",
};

export const DEFAULT_IMPORT_FLAGS: CliFlags = {
  dryRun: false,
  forceImages: false,
  skipImages: false,
  skipDb: false,
  limit: 0,
  verbose: false,
};