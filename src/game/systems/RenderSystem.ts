import { LOGIC_W, LOGIC_H } from "../engine/EngineConstants";

export class RenderSystem {
  private screenW: number;
  private screenH: number;

  constructor(screenW: number, screenH: number) {
    this.screenW = screenW;
    this.screenH = screenH;
  }

  public updateDimensions(w: number, h: number) {
    this.screenW = w;
    this.screenH = h;
  }

  public getScreenX(wx: number, wy: number, camX: number): number {
    const topWScale = 0.45; // Aggressive perspective
    const yNorm = wy / LOGIC_H;
    const currentWScale = topWScale + (1 - topWScale) * yNorm;
    const currentW = this.screenW * currentWScale;
    const offset = (this.screenW - currentW) / 2;

    // Adjust for camera panning
    const camOffset = (camX - 500) * (currentW / LOGIC_W) * 0.6;
    return offset + (wx / LOGIC_W) * currentW - camOffset;
  }

  public getScreenY(wy: number): number {
    const yNorm = wy / LOGIC_H;
    const yMapped = Math.pow(yNorm, 1.2);
    const horizonOffset = 120;
    const fieldHeight = this.screenH - horizonOffset - 20;
    return horizonOffset + yMapped * fieldHeight;
  }
}
