import type { PlayerEntity } from "../entities/PlayerEntity";
import { LOGIC_W, LOGIC_H } from "../engine/EngineConstants";
import * as Phaser from "phaser";

export class MovementSystem {
  public static update(players: PlayerEntity[], dt: number) {
    players.forEach(p => {
      // Noise timer
      p.noiseTimer -= dt;
      if (p.noiseTimer <= 0) {
        p.noiseTimer = 1000 + Math.random() * 2000;
        const range = p.role === "GK" ? 10 : 25;
        p.noiseX = (Math.random() - 0.5) * range;
        p.noiseY = (Math.random() - 0.5) * range * 1.4;
      }

      const destX = Phaser.Math.Clamp(p.targetX + p.noiseX + p.personalBias, 40, LOGIC_W - 40);
      const destY = Phaser.Math.Clamp(p.targetY + p.noiseY, 40, LOGIC_H - 40);

      const lerpX = p.role === "GK"  ? 0.055
                  : p.role === "ATK" ? 0.030
                  : p.role === "DEF" ? 0.020
                  :                   0.024;
      const lerpY = p.role === "GK"  ? 0.060
                  :                   0.022;

      p.worldX += (destX - p.worldX) * lerpX;
      p.worldY += (destY - p.worldY) * lerpY;
    });
  }
}
