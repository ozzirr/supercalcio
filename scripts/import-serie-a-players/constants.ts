// --- Import Pipeline Constants ---

import path from "path";

export const SOURCE_URLS = [
  {
    url: "https://www.fantacalciopedia.com/lista-calciatori-serie-a/portieri/",
    role: "GK",
  },
  {
    url: "https://www.fantacalciopedia.com/lista-calciatori-serie-a/difensori/",
    role: "DEF",
  },
  {
    url: "https://www.fantacalciopedia.com/lista-calciatori-serie-a/centrocampisti/",
    role: "MID",
  },
  {
    url: "https://www.fantacalciopedia.com/lista-calciatori-serie-a/attaccanti/",
    role: "ATT",
  },
] as const;

export const SCRAPING_CONFIG = {
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  timeout: 30000,
  retries: 3,
  retryDelay: 2000,
  rateLimitDelay: 1500,
};

export const OUTPUT_DIRS = {
  scripts: path.resolve(__dirname),
  assets: path.resolve(__dirname, "../../photo-players"),
  output: path.resolve(__dirname, "../../scripts/import-serie-a-players"),
};

export const OUTPUT_FILES = {
  raw: "players.raw.json",
  normalized: "players.normalized.json",
  importReport: "import-report.json",
};

export const COMPLIANCE_WARNING = `
⚠️ COMPLIANCE WARNING ⚠️

No robots.txt was found at fantacalciopedia.com (404 response).
The site's Terms of Use are not clearly available.

This scraper is intended for PERSONAL/EDUCATIONAL USE ONLY.
Before downloading images or scraping content:
- This may violate the site's terms of service
- Image downloading may incur copyright concerns
- Use at your own risk and responsibility

If you receive DMCA takedowns or legal notices, STOP using this tool immediately.
`;

export const SELECTORS = {
  playerCard: ".giocatore",
  playerName: ".tit_calc",
  playerImage: ".fbox-icon img",
  teamImage: ".fbox-icon ~ p img",
  teamName: ".fbox-icon ~ p small",
  role: ".fbox-icon ~ p .label-warning",
} as const;