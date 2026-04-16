import * as Phaser from "phaser";
import { EventBus } from "./EventBus";
import type { MatchEvent } from "@/types/match";
import type { PlayerDefinition } from "@/types/player";

type InitData = {
  homeRoster: PlayerDefinition[];
  awayRoster: PlayerDefinition[];
};

type PlayerSprite = {
  container: Phaser.GameObjects.Container;
  baseX: number;
  baseY: number;
  isHome: boolean;
};

export class MatchScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Arc;
  private ballGlow!: Phaser.GameObjects.Arc;
  private playerMap: Map<string, PlayerSprite> = new Map();
  private W = 800;
  private H = 400;

  constructor() {
    super("MatchScene");
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.drawPitch();
    this.createBall();

    EventBus.on("init-match", (data: InitData) => this.onInitMatch(data));
    EventBus.on("match-event", (event: MatchEvent) => this.onMatchEvent(event));
    EventBus.on("match-finished", () => this.onMatchFinished());

    EventBus.emit("current-scene-ready", this);
  }

  private drawPitch() {
    const { W, H } = this;
    const g = this.add.graphics();

    // Background gradient feel
    g.fillStyle(0x0a1628, 1);
    g.fillRect(0, 0, W, H);

    // Grass stripes (subtle)
    for (let i = 0; i < 8; i++) {
      g.fillStyle(i % 2 === 0 ? 0x0b1a30 : 0x0a1628, 1);
      g.fillRect(i * (W / 8), 0, W / 8, H);
    }

    // Field lines
    g.lineStyle(1.5, 0x1e4976, 0.8);

    // Border
    g.strokeRect(20, 20, W - 40, H - 40);

    // Center line
    g.beginPath();
    g.moveTo(W / 2, 20);
    g.lineTo(W / 2, H - 20);
    g.strokePath();

    // Center circle
    g.strokeCircle(W / 2, H / 2, 60);

    // Center dot
    g.fillStyle(0x1e4976, 1);
    g.fillCircle(W / 2, H / 2, 3);

    // Left penalty area
    const paW = 80, paH = 200;
    g.strokeRect(20, (H - paH) / 2, paW, paH);

    // Left goal area
    g.strokeRect(20, (H - 80) / 2, 30, 80);

    // Right penalty area
    g.strokeRect(W - 20 - paW, (H - paH) / 2, paW, paH);

    // Right goal area
    g.strokeRect(W - 20 - 30, (H - 80) / 2, 30, 80);

    // Penalty spots
    g.fillStyle(0x1e4976, 1);
    g.fillCircle(20 + 60, H / 2, 3);
    g.fillCircle(W - 20 - 60, H / 2, 3);

    // Goals (thick lines)
    g.lineStyle(3, 0x4a90e2, 0.9);
    g.strokeRect(10, (H - 70) / 2, 12, 70);   // left goal
    g.strokeRect(W - 22, (H - 70) / 2, 12, 70); // right goal

    g.setDepth(0);
  }

  private createBall() {
    const { W, H } = this;

    // Glow behind ball
    this.ballGlow = this.add.circle(W / 2, H / 2, 14, 0xffffff, 0.08);
    this.ballGlow.setDepth(8);

    this.ball = this.add.circle(W / 2, H / 2, 6, 0xffffff, 1);
    this.ball.setDepth(10);
    this.ball.setStrokeStyle(1.5, 0x4a90e2, 1);

    // Pulse animation on ball
    this.tweens.add({
      targets: this.ballGlow,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0.03,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });
  }

  private onInitMatch(data: InitData) {
    const { W, H } = this;

    // Clear old players
    this.playerMap.forEach(p => p.container.destroy());
    this.playerMap.clear();

    const createTeam = (roster: PlayerDefinition[], isHome: boolean) => {
      roster.forEach((p, idx) => {
        let x: number, y: number;

        const isGK = p.roleTags.includes("goalkeeper");
        const isDEF = p.roleTags.includes("defender");
        const isATK = p.roleTags.includes("attacker");

        if (isGK) {
          x = isHome ? 38 : W - 38;
          y = H / 2;
        } else if (isDEF) {
          x = isHome ? 140 : W - 140;
          y = H * (0.25 + (idx % 3) * 0.25);
        } else if (isATK) {
          x = isHome ? W / 2 - 60 : W / 2 + 60;
          y = H * (0.25 + (idx % 3) * 0.3);
        } else {
          // Midfielder / hybrid
          x = isHome ? W / 2 - 150 : W / 2 + 150;
          y = H * (0.3 + (idx % 3) * 0.2);
        }

        // Jitter slightly
        x += Phaser.Math.Between(-10, 10);
        y = Math.max(30, Math.min(H - 30, y + Phaser.Math.Between(-20, 20)));

        const container = this.add.container(x, y);

        // Outer glow ring
        const glow = this.add.circle(0, 0, 18, isHome ? 0x6366f1 : 0xf43f5e, 0.15);

        // Main circle
        const circle = this.add.circle(0, 0, 13, isHome ? 0x6366f1 : 0xef4444, 1);
        circle.setStrokeStyle(1.5, isHome ? 0x818cf8 : 0xfca5a5, 1);

        // Initial
        const initial = this.add.text(0, 0, p.name[0].toUpperCase(), {
          fontSize: "10px",
          color: "#ffffff",
          fontFamily: "Arial",
          fontStyle: "bold",
        }).setOrigin(0.5);

        container.add([glow, circle, initial]);
        container.setDepth(5);

        this.playerMap.set(p.id, { container, baseX: x, baseY: y, isHome });

        // Entrance animation
        container.setAlpha(0);
        container.setScale(0.3);
        this.tweens.add({
          targets: container,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 500 + idx * 100,
          ease: "Back.easeOut",
        });
      });
    };

    createTeam(data.homeRoster, true);
    createTeam(data.awayRoster, false);

    // Reset ball to center
    this.tweens.add({
      targets: [this.ball, this.ballGlow],
      x: W / 2,
      y: H / 2,
      duration: 400,
      ease: "Power2",
    });
  }

  private moveBallTo(x: number, y: number, duration = 300) {
    this.tweens.add({
      targets: [this.ball, this.ballGlow],
      x, y,
      duration,
      ease: "Power2",
    });
  }

  private pulsePlayer(sprite: PlayerSprite) {
    this.tweens.add({
      targets: sprite.container,
      scaleX: 1.35,
      scaleY: 1.35,
      yoyo: true,
      duration: 120,
      ease: "Power1",
    });
  }

  private driftTowardsAction(actorSprite: PlayerSprite, targetX: number, targetY: number) {
    // Move actor towards action zone
    this.tweens.add({
      targets: actorSprite.container,
      x: actorSprite.container.x + (targetX - actorSprite.container.x) * 0.4,
      y: actorSprite.container.y + (targetY - actorSprite.container.y) * 0.3,
      duration: 600,
      ease: "Sine.easeInOut",
    });
  }

  private driftBackToBase(sprite: PlayerSprite, delay = 1500) {
    this.time.delayedCall(delay, () => {
      this.tweens.add({
        targets: sprite.container,
        x: sprite.baseX + Phaser.Math.Between(-15, 15),
        y: sprite.baseY + Phaser.Math.Between(-15, 15),
        duration: 1200,
        ease: "Sine.easeInOut",
      });
    });
  }

  private onMatchEvent(event: MatchEvent) {
    const { W, H } = this;
    const actor = event.actorId ? this.playerMap.get(event.actorId) : null;
    const target = event.targetId ? this.playerMap.get(event.targetId) : null;

    switch (event.type) {
      case "kickoff":
        this.moveBallTo(W / 2, H / 2, 400);
        // Reset all players toward their base with slight drift
        this.playerMap.forEach(s => this.driftBackToBase(s, 0));
        break;

      case "pass":
        if (actor && target) {
          this.pulsePlayer(actor);
          // Ball moves from actor to target
          this.moveBallTo(actor.container.x, actor.container.y, 150);
          this.time.delayedCall(150, () => {
            if (target) this.moveBallTo(target.container.x, target.container.y, 350);
          });
          // Actor drifts toward center
          this.driftTowardsAction(actor, target.container.x, target.container.y);
          this.driftBackToBase(actor);
        }
        break;

      case "dribble":
        if (actor) {
          this.pulsePlayer(actor);
          const driftX = actor.isHome ? actor.container.x + 25 : actor.container.x - 25;
          this.moveBallTo(driftX, actor.container.y, 300);
          this.tweens.add({
            targets: actor.container,
            x: driftX,
            duration: 400,
            ease: "Power1",
          });
          this.driftBackToBase(actor);
        }
        break;

      case "tackle":
        if (actor && target) {
          // Actor rushes toward target
          const prevX = actor.container.x;
          const prevY = actor.container.y;
          this.tweens.add({
            targets: actor.container,
            x: target.container.x + Phaser.Math.Between(-10, 10),
            y: target.container.y + Phaser.Math.Between(-10, 10),
            duration: 250,
            ease: "Power3",
            onComplete: () => {
              this.tweens.add({
                targets: actor.container,
                x: prevX,
                y: prevY,
                duration: 600,
                ease: "Power1",
              });
            },
          });
          this.moveBallTo(target.container.x, target.container.y, 200);
        }
        break;

      case "possession_change":
        if (actor) {
          this.moveBallTo(actor.container.x, actor.container.y, 300);
          // Push all actors slightly toward their attack third
          this.playerMap.forEach((s) => {
            if (s.isHome === actor.isHome) {
              const pushX = s.isHome ? s.container.x + 20 : s.container.x - 20;
              this.tweens.add({
                targets: s.container,
                x: Math.max(20, Math.min(W - 20, pushX)),
                duration: 800,
                ease: "Sine.easeInOut",
              });
            } else {
              this.driftBackToBase(s, 200);
            }
          });
        }
        break;

      case "shot":
        if (actor) {
          this.pulsePlayer(actor);
          const goalX = actor.isHome ? W - 22 : 22;
          const goalY = H / 2 + Phaser.Math.Between(-30, 30);
          this.moveBallTo(actor.container.x, actor.container.y, 100);
          this.time.delayedCall(100, () => this.moveBallTo(goalX, goalY, 350));
        }
        break;

      case "save":
        if (actor) {
          this.pulsePlayer(actor);
          const reboundX = actor.isHome ? W * 0.15 : W * 0.85;
          this.time.delayedCall(350, () => this.moveBallTo(reboundX, H / 2 + Phaser.Math.Between(-40, 40), 300));
        }
        break;

      case "goal": {
        const isHome = event.team === "home";
        const goalX = isHome ? W - 18 : 18;
        this.moveBallTo(goalX, H / 2, 400);

        // Screen shake + flash
        this.time.delayedCall(400, () => {
          this.cameras.main.shake(400, 0.018);
          const flash = this.add.rectangle(0, 0, W, H, isHome ? 0x6366f1 : 0xef4444, 0.25).setOrigin(0).setDepth(20);
          this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() });

          // Push scoring team forward
          this.playerMap.forEach((s) => {
            if (s.isHome === isHome) {
              this.tweens.add({
                targets: s.container,
                x: s.container.x + (isHome ? 20 : -20),
                y: H / 2 + Phaser.Math.Between(-30, 30),
                duration: 600,
                ease: "Power2",
              });
            }
          });
        });

        // Reset after celebration
        this.time.delayedCall(2000, () => {
          this.playerMap.forEach(s => this.driftBackToBase(s, 0));
          this.moveBallTo(W / 2, H / 2, 500);
        });
        break;
      }

      case "halftime":
        // All players walk back to center half
        this.playerMap.forEach(s => this.driftBackToBase(s, 0));
        this.moveBallTo(W / 2, H / 2, 800);
        break;
    }
  }

  private onMatchFinished() {
    this.cameras.main.fade(1500, 5, 10, 20);
  }
}
