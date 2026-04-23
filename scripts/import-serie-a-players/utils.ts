// --- Import Pipeline Utilities ---

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { RawPlayerData, ImportReport, FailureEntry } from "./types";
import { OUTPUT_DIRS, OUTPUT_FILES } from "./constants";

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function generateSlug(name: string): string {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized;
}

export function resolveImageUrl(baseUrl: string, imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("//")) return `https:${imagePath}`;
  return new URL(imagePath, baseUrl).href;
}

export function extractTeamFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const teamIndex = pathParts.findIndex((p) => p.includes("-"));
    if (teamIndex !== -1 && pathParts[teamIndex + 1]) {
      return pathParts[teamIndex + 1].replace(/-/g, " ");
    }
  } catch {
    // Ignore URL parsing errors
  }
  return "";
}

export function parsePlayerRole(html: string, roleFromUrl: string): string {
  const roleMatch = html.match(/<span class="label label-warning">(\w+)<\/span>/);
  if (roleMatch) return roleMatch[1].toUpperCase();
  return roleFromUrl;
}

export function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(OUTPUT_DIRS.output, filename);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function readJsonFile<T>(filename: string): T | null {
  const filePath = path.join(OUTPUT_DIRS.output, filename);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export function generatePlayerId(role: string, name: string): string {
  const slug = generateSlug(name);
  const hash = crypto.createHash("md5").update(`${role}_${slug}`).digest("hex");
  return `${role.toLowerCase()}_${slug}_${hash.slice(0, 6)}`;
}

export function createImportReport(
  totalFound: number,
  totalNormalized: number,
  totalImagesDownloaded: number,
  totalPlayersImported: number,
  failures: FailureEntry[],
  warnings: string[]
): ImportReport {
  return {
    timestamp: new Date().toISOString(),
    totalFound,
    totalNormalized,
    totalImagesDownloaded,
    totalPlayersImported,
    failures,
    warnings,
  };
}

export function logVerbose(verbose: boolean, ...args: unknown[]): void {
  if (verbose) {
    console.log("[VERBOSE]", ...args);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function deduplicatePlayers(players: RawPlayerData[]): RawPlayerData[] {
  const seen = new Set<string>();
  return players.filter((player) => {
    const key = `${player.role}_${player.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createStatsGenerator() {
  return {
    found: 0,
    normalized: 0,
    imagesDownloaded: 0,
    imported: 0,
  };
}

export function validateImagePath(filePath: string): boolean {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}