import type { PlayerEntity } from "../entities/PlayerEntity";
import { LOGIC_W, LOGIC_H, ROLE_BASE_X, ROLE_ATTACK_X, ROLE_DEFEND_X } from "../engine/EngineConstants";
import * as Phaser from "phaser";

export class TacticalSystem {
  /**
   * Recalculate where a player should move given current possession and ball position.
   */
  public static updatePlayerTarget(
    p: PlayerEntity,
    ballWorldY: number,
    possession: "home" | "away" | "neutral"
  ) {
    const myTeamHasBall = possession === (p.isHome ? "home" : "away");

    // ---- GOALKEEPER ----
    if (p.role === "GK") {
      const gkX = p.isHome ? ROLE_BASE_X.GK : LOGIC_W - ROLE_BASE_X.GK;
      const advanceX = p.isHome ? gkX + 20 : gkX - 20;
      const retreatX = p.isHome ? gkX - 10 : gkX + 10;
      p.targetX = myTeamHasBall ? advanceX : retreatX;

      if (!myTeamHasBall) {
        const clamped = Phaser.Math.Clamp(ballWorldY, LOGIC_H * 0.22, LOGIC_H * 0.78);
        p.targetY = clamped;
      } else {
        p.targetY = Phaser.Math.Linear(p.targetY, LOGIC_H / 2, 0.15);
      }
      return;
    }

    // ---- FIELD PLAYERS ----
    const attackX = p.isHome
      ? ROLE_ATTACK_X[p.role]
      : LOGIC_W - ROLE_ATTACK_X[p.role];
    const defendX = p.isHome
      ? ROLE_DEFEND_X[p.role]
      : LOGIC_W - ROLE_DEFEND_X[p.role];

    p.targetX = myTeamHasBall ? attackX : defendX;

    const ballPull = p.role === "ATK" ? 0.25 : p.role === "MID" ? 0.18 : 0.10;
    const laneRadius = p.role === "ATK" ? 80 : p.role === "MID" ? 70 : 55;

    const pulledY = p.baseY + (ballWorldY - p.baseY) * ballPull;
    p.targetY = Phaser.Math.Clamp(pulledY, p.baseY - laneRadius, p.baseY + laneRadius);
  }
}
