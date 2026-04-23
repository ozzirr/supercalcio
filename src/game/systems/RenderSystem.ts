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

  public getScreenX(wx: number, wy: number, camX: number, zoom: number = 1.0): number {
    const topWScale = 0.45; // Aggressive perspective
    const yNorm = wy / LOGIC_H;
    const currentWScale = topWScale + (1 - topWScale) * yNorm;
    const currentW = this.screenW * currentWScale * zoom;
    const offset = (this.screenW - currentW) / 2;

    // Adjust for camera panning
    const camOffset = (camX - 500) * (currentW / LOGIC_W) * 0.6;
    return offset + (wx / LOGIC_W) * currentW - camOffset;
  }

  public getScreenY(wy: number, camY: number = 300, zoom: number = 1.0): number {
    const yNorm = wy / LOGIC_H;
    const yMapped = Math.pow(yNorm, 1.2);
    const horizonOffset = 120 + (300 - camY) * 0.2; // Slight vertical pan
    const fieldHeight = (this.screenH - horizonOffset - 20) * zoom;
    return horizonOffset + yMapped * fieldHeight;
  }

  public getScreenZ(wz: number): number {
    return wz * 0.8; // Z axis to pixels scale
  }
}
