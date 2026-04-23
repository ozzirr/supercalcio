import type { PlayerEntity } from "../entities/PlayerEntity";
import * as Phaser from "phaser";

export class AnimationSystem {
  public static update(players: PlayerEntity[], dt: number) {
    players.forEach(p => {
      // Basic logic: if distance to target is significant, we are running
      const dx = p.targetX - p.worldX;
      const dy = p.targetY - p.worldY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // We only switch back to idle/run if we are not locked in a special animation like pass/shoot
      if (p.animState === "idle" || p.animState === "run") {
        if (dist > 5) {
          p.animState = "run";
        } else {
          p.animState = "idle";
        }
      }
    });
  }

  // Force an animation state for a short duration (fire and forget via tweens or timers later)
  public static triggerEventAnimation(p: PlayerEntity, state: typeof p.animState) {
    p.animState = state;
    // In a full implementation, we'd add an "animTimer" to return to idle after N ms.
  }
}
