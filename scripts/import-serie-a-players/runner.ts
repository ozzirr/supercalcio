#!/usr/bin/env npx tsx

// --- Main Import Pipeline Runner ---

import process from "process";
import fs from "fs";
import path from "path";
import type { RawPlayerData, CliFlags, FailureEntry } from "./types";
import { DEFAULT_IMPORT_FLAGS } from "./types";
import { OUTPUT_DIRS, OUTPUT_FILES } from "./constants";
import { writeJsonFile, readJsonFile, createImportReport, ensureDir, logVerbose } from "./utils";
import { scrapeAllPlayers } from "./scrapePlayers";
import { downloadPlayerImages, getImageStats } from "./downloadImages";
import { importPlayersToDb, clearImportedPlayers, generateFullDefinitions } from "./syncPlayersToDb";

function parseCliFlags(args: string[]): CliFlags {
  const flags: CliFlags = { ...DEFAULT_IMPORT_FLAGS };
  
  for (const arg of args) {
    if (arg === "--dry-run" || arg === "-d") {
      flags.dryRun = true;
    } else if (arg === "--force-images" || arg === "-f") {
      flags.forceImages = true;
    } else if (arg === "--skip-images" || arg === "-s") {
      flags.skipImages = true;
    } else if (arg === "--skip-db" || arg === "-k") {
      flags.skipDb = true;
    } else if (arg === "--verbose" || arg === "-v") {
      flags.verbose = true;
    } else if (arg.startsWith("--limit=")) {
      const limit = parseInt(arg.split("=")[1], 10);
      if (!isNaN(limit) && limit > 0) {
        flags.limit = limit;
      }
    }
  }
  
  return flags;
}

function updatePlayersContentFile(players: any[]): void {
  const filePath = path.resolve(process.cwd(), "src/content/players.ts");
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf-8");
  
  // Remove existing Serie A players block if it exists
  const startMarker = "// --- SERIE A IMPORT START ---";
  const endMarker = "// --- SERIE A IMPORT END ---";
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  
  if (startIdx !== -1 && endIdx !== -1) {
    content = content.slice(0, startIdx) + content.slice(endIdx + endMarker.length);
  }

  // Find the last ];
  const lastBracketIdx = content.lastIndexOf("];");
  if (lastBracketIdx === -1) return;

  const playersString = players.map(p => `  ${JSON.stringify(p, null, 4)},`).join("\n");
  
  // Check if we need a comma before the new block
  const beforeBracket = content.slice(0, lastBracketIdx).trim();
  const needsComma = beforeBracket.endsWith("}") && !beforeBracket.endsWith("},");
  const comma = needsComma ? "," : "";
  
  const newContent = content.slice(0, lastBracketIdx).trimEnd() + 
    `${comma}\n  ${startMarker}\n${playersString}\n  ${endMarker}\n` + 
    content.slice(lastBracketIdx);

  fs.writeFileSync(filePath, newContent);
}

async function main(): Promise<void> {
  // Load .env.local manually
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach(line => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          process.env[key.trim()] = value;
        }
      });
    }
  } catch (err) {
    console.warn("⚠️ Could not load .env.local:", err);
  }

  const args = process.argv.slice(2);
  
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`🏆 Supercalcio Serie A Player Import Pipeline...`);
    process.exit(0);
  }
  
  const flags = parseCliFlags(args);
  console.log("⚙️  Configuration:", flags);
  
  ensureDir(OUTPUT_DIRS.output);
  ensureDir(OUTPUT_DIRS.assets);
  
  const startTime = Date.now();
  const allFailures: FailureEntry[] = [];
  
  console.log("\n📋 Step 1: Scraping player data...");
  const scrapeResult = await scrapeAllPlayers(flags.verbose, flags.limit);
  const rawPlayers = scrapeResult.players;
  allFailures.push(...scrapeResult.failures);
  
  if (rawPlayers.length === 0) {
    console.error("❌ No players found.");
    process.exit(1);
  }

  console.log("\n🧪 Step 2: Generating full definitions...");
  const fullPlayers = generateFullDefinitions(rawPlayers);
  console.log(`   Generated ${fullPlayers.length} definitions with stats and skills.`);

  if (!flags.skipImages) {
    console.log("\n🖼️  Step 3: Downloading player images...");
    if (!flags.dryRun) {
      const imageResult = await downloadPlayerImages(rawPlayers, flags.forceImages, flags.verbose);
      allFailures.push(...imageResult.failed);
      console.log(`   Images ready: ${imageResult.downloaded}/${rawPlayers.length}`);
    }
  }

  if (!flags.skipDb) {
    console.log("\n💾 Step 4: Syncing to database...");
    if (!flags.dryRun) {
      console.log("   Clearing existing Serie A players...");
      await clearImportedPlayers(flags.dryRun);
      
      const importResult = await importPlayersToDb(fullPlayers, flags.dryRun);
      allFailures.push(...importResult.failed);
      console.log(`   Imported: ${importResult.imported} players to market`);
    }
  }

  console.log("\n📝 Step 5: Updating game content file...");
  if (!flags.dryRun) {
    updatePlayersContentFile(fullPlayers);
    console.log("   src/content/players.ts updated with new definitions.");
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Pipeline complete in ${elapsed}s. ${allFailures.length} failures.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("💥 Pipeline error:", error);
  process.exit(1);
});