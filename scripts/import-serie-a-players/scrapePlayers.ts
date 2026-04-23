// --- Player Scraper ---

import fs from "fs";
import path from "path";
import { type RawPlayerData, type PlayerRole, type FailureEntry } from "./types";
import { SOURCE_URLS, SCRAPING_CONFIG, COMPLIANCE_WARNING, SELECTORS, OUTPUT_DIRS } from "./constants";
import { ensureDir, generateSlug, sanitizeFilename, resolveImageUrl, sleep, deduplicatePlayers, logVerbose } from "./utils";

interface ParsedPlayer {
  sourceName: string;
  displayName: string;
  team?: string | null;
  imageUrl?: string | null;
}

console.warn(COMPLIANCE_WARNING);

async function fetchWithRetry(url: string, retries: number = SCRAPING_CONFIG.retries): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SCRAPING_CONFIG.timeout);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": SCRAPING_CONFIG.userAgent,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      lastError = error as Error;
      logVerbose(true, `Attempt ${attempt}/${retries} failed for ${url}:`, error);
      if (attempt < retries) {
        await sleep(SCRAPING_CONFIG.retryDelay);
      }
    }
  }
  
  throw new Error(`Failed after ${retries} attempts: ${lastError?.message}`);
}

function parsePlayerCard(html: string, role: PlayerRole): ParsedPlayer[] {
  const players: ParsedPlayer[] = [];
  
  // Match full player card: <div class="col_full giocatore"> ... </article>
  const cardRegex = /<div class="col_full giocatore">([\s\S]*?)<\/article>/g;
  let match;
  
  while ((match = cardRegex.exec(html)) !== null) {
    const cardHtml = match[0];
    logVerbose(true, "Processing card fragment:", cardHtml.slice(0, 200));
    
    try {
      const nameMatch = cardHtml.match(/<h3 class="tit_calc">([^<]+)<\/h3>/);
      const imageMatch = cardHtml.match(/<div class="fbox-icon">\s*<a[^>]*>\s*<img[^>]*src="([^"]+)"[^>]*>/);
      // Try to get team from <small> tag after team image (alt attribute contains team name)
      const teamMatch = cardHtml.match(/<img[^>]*src="[^"]*\/squadre\/([^."]+)[^>]*alt="([^"]+)"[^>]*>/);
      
      if (nameMatch) {
        const sourceName = nameMatch[1].trim();
        const displayName = sourceName.replace(/([A-Z]+)\s+([A-Z]+)/, "$2 $1").trim();
        
        players.push({
          sourceName,
          displayName,
          imageUrl: imageMatch ? imageMatch[1] : undefined,
          team: teamMatch ? teamMatch[2]?.trim() : null,
        });
      }
    } catch (parseError) {
      logVerbose(true, "Failed to parse player card:", parseError);
    }
  }
  
  return players;
}

function normalizePlayers(rawPlayers: ParsedPlayer[], role: PlayerRole, sourcePage: string): RawPlayerData[] {
  return rawPlayers.map((player) => ({
    sourceName: player.sourceName,
    slug: generateSlug(player.displayName),
    displayName: player.displayName,
    role,
    team: player.team || null,
    sourcePage,
    sourceImageUrl: player.imageUrl || null,
    localImagePath: null,
  }));
}

export async function scrapeAllPlayers(
  verbose: boolean = false,
  limit: number = 0
): Promise<{ players: RawPlayerData[]; failures: FailureEntry[] }> {
  ensureDir(OUTPUT_DIRS.output);
  ensureDir(OUTPUT_DIRS.assets);
  
  const allPlayers: RawPlayerData[] = [];
  const failures: FailureEntry[] = [];
  
  for (const { url, role } of SOURCE_URLS) {
    logVerbose(verbose, `Fetching ${role} from: ${url}`);
    
    try {
      const html = await fetchWithRetry(url);
      await sleep(SCRAPING_CONFIG.rateLimitDelay);
      
      let parsedPlayers = parsePlayerCard(html, role);
      logVerbose(verbose, `Found ${parsedPlayers.length} players for ${role}`);
      
      if (limit > 0 && parsedPlayers.length > limit) {
        parsedPlayers = parsedPlayers.slice(0, limit);
        logVerbose(verbose, `Limiting to ${limit} players for ${role}`);
      }
      
      const normalized = normalizePlayers(parsedPlayers, role, url);
      allPlayers.push(...normalized);
    } catch (error) {
      console.error(`Failed to scrape ${role}:`, error);
      failures.push({
        player: role,
        error: (error as Error).message,
        stage: "scrape",
      });
    }
  }
  
  const deduplicated = deduplicatePlayers(allPlayers);
  logVerbose(verbose, `Total unique players: ${deduplicated.length}`);
  
  return { players: deduplicated, failures };
}

export async function scrapeSinglePage(
  url: string,
  role: PlayerRole,
  verbose: boolean = false
): Promise<RawPlayerData[]> {
  logVerbose(verbose, `Fetching ${role} from: ${url}`);
  
  const html = await fetchWithRetry(url);
  const parsedPlayers = parsePlayerCard(html, role);
  logVerbose(verbose, `Found ${parsedPlayers.length} players for ${role}`);
  
  return normalizePlayers(parsedPlayers, role, url);
}