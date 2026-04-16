import { MatchEngine } from "./match-engine";
import { STARTER_PLAYERS } from "../content/players";
import type { MatchConfig } from "../types/match";

// Take 5 players for the squad, must include keeper
const homeSquad = [
  STARTER_PLAYERS.find(p => p.id === "aegis")!,
  STARTER_PLAYERS.find(p => p.id === "blaze")!,
  STARTER_PLAYERS.find(p => p.id === "volt")!,
  STARTER_PLAYERS.find(p => p.id === "titan")!,
  STARTER_PLAYERS.find(p => p.id === "hawk")!,
];

// Away squad can be the same for testing
const awaySquad = [...homeSquad];

const config: MatchConfig = {
  totalTicks: 90,
  halftimeTick: 45,
  seed: 12345,
  homePlaystyle: "possession_control",
  awayPlaystyle: "counter_attack",
  homeStance: "balanced",
  awayStance: "defensive",
  homeCommand: "none",
  awayCommand: "none",
};

const engine = new MatchEngine(config, homeSquad, awaySquad);

console.log("--- STARTING MATCH ---");
let currentTick = 0;
while (currentTick <= config.totalTicks) {
  const events = engine.tick();
  
  if (events.length > 0) {
    events.forEach(e => {
      let msg = `[Tick ${e.tick}] [${e.team}] ${e.type}`;
      if (e.actorId) msg += ` - Actor: ${e.actorId}`;
      if (e.targetId) msg += ` - Target: ${e.targetId}`;
      if (Object.keys(e.metadata).length > 0) msg += ` - Meta: ${JSON.stringify(e.metadata)}`;
      console.log(msg);
    });
  }
  
  // Test intervention
  if (currentTick === 60) {
    console.log(">>> INTERVENTION: Home goes AGGRESSIVE");
    engine.intervene("home", { type: "stance_change", stance: "aggressive" });
  }

  currentTick++;
}

console.log("--- FINAL RESULT ---");
console.log(JSON.stringify(engine.getResult(), null, 2));
