import type { PlayerDefinition } from "@/types/player";
import type { PlayerRole } from "../engine/EngineConstants";

export type AnimationState = "idle" | "run" | "pass" | "shoot" | "tackle" | "save";

export class PlayerEntity {
  id: string;
  def: PlayerDefinition;
  
  // Logical position
  worldX: number;
  worldY: number;
  
  // Tactical anchoring
  baseX: number;
  baseY: number;
  
  // Movement target
  targetX: number;
  targetY: number;
  
  isHome: boolean;
  role: PlayerRole;
  personalBias: number;
  
  // State
  animState: AnimationState;
  
  // AI Timers
  thinkTimer: number;
  noiseX: number;
  noiseY: number;
  noiseTimer: number;

  constructor(
    id: string,
    def: PlayerDefinition,
    isHome: boolean,
    role: PlayerRole,
    startX: number,
    startY: number,
    bias: number
  ) {
    this.id = id;
    this.def = def;
    this.isHome = isHome;
    this.role = role;
    this.worldX = startX;
    this.worldY = startY;
    this.baseX = startX;
    this.baseY = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.personalBias = bias;
    this.animState = "idle";

    this.thinkTimer = Math.random() * 900;
    this.noiseX = 0;
    this.noiseY = 0;
    this.noiseTimer = Math.random() * 1500;
  }
}
