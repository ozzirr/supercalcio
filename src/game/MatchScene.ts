import * as Phaser from "phaser";
import { EventBus } from "./EventBus";
import type { MatchEvent } from "@/types/match";
import type { PlayerDefinition } from "@/types/player";

type InitData = {
  homeRoster: PlayerDefinition[];
  awayRoster: PlayerDefinition[];
};

export class MatchScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Arc;
  private players: Map<string, Phaser.GameObjects.Container> = new Map();
  private homeGoal!: Phaser.Geom.Rectangle;
  private awayGoal!: Phaser.Geom.Rectangle;

  constructor() {
    super("MatchScene");
  }

  create() {
    const { width, height } = this.scale;

    // Draw stylized pitch
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0f18, 1);
    bg.fillRect(0, 0, width, height);

    // Pitch lines
    bg.lineStyle(2, 0x1a2f4c, 1);
    // Center line
    bg.beginPath();
    bg.moveTo(width / 2, 0);
    bg.lineTo(width / 2, height);
    bg.strokePath();
    // Center circle
    bg.strokeCircle(width / 2, height / 2, 60);

    // Goals areas
    this.homeGoal = new Phaser.Geom.Rectangle(0, height / 2 - 80, 60, 160);
    this.awayGoal = new Phaser.Geom.Rectangle(width - 60, height / 2 - 80, 60, 160);
    
    bg.strokeRectShape(this.homeGoal);
    bg.strokeRectShape(this.awayGoal);

    // Create Ball
    this.ball = this.add.circle(width / 2, height / 2, 6, 0xffffff);
    this.ball.setDepth(10);

    // Listen to React
    EventBus.on("init-match", (data: InitData) => this.onInitMatch(data));
    EventBus.on("match-event", (event: MatchEvent) => this.onMatchEvent(event));
    EventBus.on("match-finished", () => this.onMatchFinished());

    EventBus.emit("current-scene-ready", this);
  }

  private onInitMatch(data: InitData) {
    const { width, height } = this.scale;

    // Clear old players if any
    this.players.forEach(p => p.destroy());
    this.players.clear();

    const createTeam = (team: PlayerDefinition[], isHome: boolean) => {
      team.forEach((p, idx) => {
        // Base positions
        let x = isHome ? width / 4 : (width / 4) * 3;
        let y = (height / (team.length + 1)) * (idx + 1);

        if (p.roleTags.includes("goalkeeper")) {
          x = isHome ? 30 : width - 30;
          y = height / 2;
        } else if (p.roleTags.includes("attacker")) {
          x = isHome ? width / 2 - 40 : width / 2 + 40;
        } else if (p.roleTags.includes("defender")) {
          x = isHome ? 120 : width - 120;
        }

        const container = this.add.container(x, y);
        
        // Player circle
        const circle = this.add.circle(0, 0, 12, isHome ? 0x6366f1 : 0xf43f5e);
        circle.setStrokeStyle(2, 0xffffff, 0.2);
        
        // Initial letter
        const text = this.add.text(0, 0, p.name[0], {
          fontSize: "12px",
          color: "#ffffff",
          fontFamily: "monospace",
          fontStyle: "bold"
        }).setOrigin(0.5);

        container.add([circle, text]);
        container.setData("homeX", x);
        container.setData("homeY", y);
        container.setData("isHome", isHome);
        container.setDepth(5);
        this.players.set(p.id, container);
      });
    };

    createTeam(data.homeRoster, true);
    createTeam(data.awayRoster, false);
    
    // Reset ball
    this.ball.setPosition(width / 2, height / 2);
  }

  private onMatchEvent(event: MatchEvent) {
    const actor = event.actorId ? this.players.get(event.actorId) : null;
    const target = event.targetId ? this.players.get(event.targetId) : null;
    
    // Bring everyone back to their rough formation over time slowly, unless they are the actor
    this.players.forEach(p => {
      if (p !== actor && p !== target && Math.random() > 0.5) {
        this.tweens.add({
          targets: p,
          x: p.getData("homeX") + Phaser.Math.Between(-30, 30),
          y: p.getData("homeY") + Phaser.Math.Between(-30, 30),
          duration: 2000,
          ease: "Sine.easeInOut"
        });
      }
    });

    if (actor) {
      if (event.type === "pass" || event.type === "dribble" || event.type === "possession_change") {
        // Move ball to actor
        this.tweens.add({
          targets: this.ball,
          x: actor.x,
          y: actor.y,
          duration: 300,
          ease: "Power2"
        });

        // Pulse actor
        this.tweens.add({
          targets: actor,
          scaleX: 1.3,
          scaleY: 1.3,
          yoyo: true,
          duration: 150
        });
      }

      if (event.type === "pass" && target) {
        // Pass the ball from actor to target
        this.time.delayedCall(300, () => {
          this.tweens.add({
            targets: this.ball,
            x: target.x,
            y: target.y,
            duration: 400,
            ease: "Power1"
          });
        });
      }

      if (event.type === "tackle" && target) {
        // Actor moves quickly to target
        this.tweens.add({
          targets: actor,
          x: target.x,
          y: target.y,
          duration: 200,
          ease: "Power3"
        });
      }

      if (event.type === "shot" || event.type === "goal" || event.type === "save") {
        const isHome = actor.getData("isHome");
        const goalRect = isHome ? this.awayGoal : this.homeGoal;
        const targetX = goalRect.x + goalRect.width / 2;
        const targetY = goalRect.y + goalRect.height / 2 + Phaser.Math.Between(-40, 40);

        this.tweens.add({
          targets: this.ball,
          x: targetX,
          y: targetY,
          duration: 400,
          ease: "Power1"
        });

        if (event.type === "goal") {
          this.time.delayedCall(400, () => {
            this.cameras.main.shake(300, 0.015);
            // Flash background
            const flash = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 0.3).setOrigin(0);
            this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
          });
        }
      }
    }

    if (event.type === "kickoff") {
      this.tweens.add({
        targets: this.ball,
        x: this.scale.width / 2,
        y: this.scale.height / 2,
        duration: 500,
        ease: "Power2"
      });
    }
  }

  private onMatchFinished() {
    this.cameras.main.fade(1000, 10, 15, 24); // Fade to dark bg
  }
}
