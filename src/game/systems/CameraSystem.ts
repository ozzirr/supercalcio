import type { PlayerEntity } from "../entities/PlayerEntity";
import type { BallEntity } from "../entities/BallEntity";
import * as Phaser from "phaser";
import { LOGIC_W, LOGIC_H } from "../engine/EngineConstants";

export class CameraSystem {
  public camX: number = 500;
  public camY: number = 300;
  public zoom: number = 1.0;
  
  private targetX: number = 500;
  private targetY: number = 300;
  private targetZoom: number = 1.0;
  
  private lerpSpeed: number = 0.05;

  public update(ball: BallEntity, dt: number) {
    // The pitch should remain fixed during normal gameplay, so we don't follow the ball constantly.
    // If we are not currently zooming/focusing on an event, return to center.
    if (this.targetZoom === 1.0) {
      this.targetX = 500;
      this.targetY = 300;
    }

    // Smooth interpolate
    this.camX += (this.targetX - this.camX) * this.lerpSpeed;
    this.camY += (this.targetY - this.camY) * this.lerpSpeed;
    this.zoom += (this.targetZoom - this.zoom) * (this.lerpSpeed * 0.5);
  }

  // Used for cinematic moments (e.g. goals, saves)
  public focusOn(x: number, y: number, zoomLevel: number = 1.2) {
    this.targetX = Phaser.Math.Clamp(x, 200, LOGIC_W - 200);
    this.targetY = Phaser.Math.Clamp(y, 150, LOGIC_H - 150);
    this.targetZoom = zoomLevel;
  }

  public resetZoom() {
    this.targetZoom = 1.0;
  }
}
