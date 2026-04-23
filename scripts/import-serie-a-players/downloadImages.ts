// --- Image Download Utility ---

import fs from "fs";
import path from "path";
import type { RawPlayerData, FailureEntry } from "./types";
import { OUTPUT_DIRS, SCRAPING_CONFIG } from "./constants";
import { ensureDir, sanitizeFilename, resolveImageUrl, sleep, logVerbose } from "./utils";

const IMAGE_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000,
  minFileSize: 500,
  validExtensions: [".png", ".jpg", ".jpeg", ".webp"],
};

function getImageExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (IMAGE_CONFIG.validExtensions.includes(ext)) {
      return ext;
    }
  } catch {
    // Ignore URL parsing errors
  }
  return ".png";
}

function getLocalImagePath(role: string, slug: string): string {
  const safeSlug = sanitizeFilename(slug);
  return path.join(OUTPUT_DIRS.assets, `${role.toLowerCase()}_${safeSlug}.png`);
}

async function downloadImage(
  url: string,
  outputPath: string,
  retries: number = IMAGE_CONFIG.maxRetries
): Promise<boolean> {
  if (!url) return false;
  
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size >= IMAGE_CONFIG.minFileSize) {
      logVerbose(true, `Skipping existing image: ${outputPath}`);
      return true;
    }
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SCRAPING_CONFIG.timeout);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": SCRAPING_CONFIG.userAgent,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      if (buffer.byteLength < IMAGE_CONFIG.minFileSize) {
        throw new Error(`File too small: ${buffer.byteLength} bytes`);
      }
      
      ensureDir(path.dirname(outputPath));
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      
      logVerbose(true, `Downloaded: ${outputPath} (${buffer.byteLength} bytes)`);
      return true;
    } catch (error) {
      lastError = error as Error;
      logVerbose(true, `Attempt ${attempt}/${retries} failed:`, error);
      if (attempt < retries) {
        await sleep(IMAGE_CONFIG.retryDelay);
      }
    }
  }
  
  console.error(`Failed to download after ${retries} attempts: ${url}`, lastError);
  return false;
}

export async function downloadPlayerImages(
  players: RawPlayerData[],
  forceRedownload: boolean = false,
  verbose: boolean = false
): Promise<{ downloaded: number; failed: FailureEntry[] }> {
  ensureDir(OUTPUT_DIRS.assets);
  
  let downloaded = 0;
  const failed: FailureEntry[] = [];
  
  for (const player of players) {
    if (!player.sourceImageUrl) {
      logVerbose(verbose, `No image URL for ${player.displayName}, skipping`);
      continue;
    }
    
    const extension = getImageExtension(player.sourceImageUrl);
    const safeSlug = sanitizeFilename(player.slug);
    const outputPath = path.join(
      OUTPUT_DIRS.assets,
      `${player.role.toLowerCase()}_${safeSlug}${extension}`
    );
    
    if (!forceRedownload && fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size >= IMAGE_CONFIG.minFileSize) {
        logVerbose(verbose, `Skipping existing: ${player.displayName}`);
        player.localImagePath = outputPath;
        downloaded++;
        continue;
      }
    }
    
    const absoluteUrl = resolveImageUrl(player.sourcePage, player.sourceImageUrl);
    
    logVerbose(verbose, `Downloading ${player.displayName} image from: ${absoluteUrl}`);
    
    const success = await downloadImage(absoluteUrl, outputPath);
    
    if (success) {
      player.localImagePath = outputPath;
      downloaded++;
    } else {
      failed.push({
        player: player.displayName,
        error: `Failed to download: ${absoluteUrl}`,
        stage: "download",
      });
    }
    
    await sleep(SCRAPING_CONFIG.rateLimitDelay / 2);
  }
  
  return { downloaded, failed };
}

export function getImageStats(players: RawPlayerData[]): { withImages: number; withoutImages: number } {
  let withImages = 0;
  let withoutImages = 0;
  
  for (const player of players) {
    if (player.localImagePath && fs.existsSync(player.localImagePath)) {
      withImages++;
    } else {
      withoutImages++;
    }
  }
  
  return { withImages, withoutImages };
}