import { LOGIC_W, LOGIC_H } from "../engine/EngineConstants";

export class BallEntity {
  worldX: number;
  worldY: number;
  worldZ: number; // Height

  // Velocities (optional for future physics-based movement)
  vx: number = 0;
  vy: number = 0;
  vz: number = 0;

  constructor() {
    this.worldX = LOGIC_W / 2;
    this.worldY = LOGIC_H / 2;
    this.worldZ = 0;
  }

  reset() {
    this.worldX = LOGIC_W / 2;
    this.worldY = LOGIC_H / 2;
    this.worldZ = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
  }
}
