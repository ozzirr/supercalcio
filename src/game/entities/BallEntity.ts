import { LOGIC_W, LOGIC_H } from "../engine/EngineConstants";

export class BallEntity {
  worldX: number;
  worldY: number;

  constructor() {
    this.worldX = LOGIC_W / 2;
    this.worldY = LOGIC_H / 2;
  }

  reset() {
    this.worldX = LOGIC_W / 2;
    this.worldY = LOGIC_H / 2;
  }
}
