import * as Phaser from "phaser";
import { EventBus } from "./EventBus";
import { matchAudio } from "./match-audio";
import type { MatchEvent } from "@/types/match";
import type { PlayerDefinition } from "@/types/player";
import { STARTER_PLAYERS } from "@/content/players";

type InitData = {
  homeRoster: PlayerDefinition[];
  awayRoster: PlayerDefinition[];
  stadiumId?: string;
  kitId?: string;
  badgeId?: string;
};

type PlayerRole = "GK" | "DEF" | "MID" | "ATK";

type PlayerSprite = {
  container: Phaser.GameObjects.Container;
  card: Phaser.GameObjects.Rectangle;
  worldX: number;
  worldY: number;
  baseX: number;        // Formation origin X (role-based)
  baseY: number;        // Assigned vertical lane — stays fixed as anchor
  targetX: number;      // Where this player is currently headed
  targetY: number;
  isHome: boolean;
  role: PlayerRole;
  personalBias: number; // Small constant X offset to distinguish same-role players
  thinkTimer: number;   // ms until next target recalculation
  noiseX: number;       // Slow personal micro-drift X
  noiseY: number;
  noiseTimer: number;
};

const LOGIC_W = 1000;
const LOGIC_H = 600;

// Even Y lanes for field players (GK gets center LOGIC_H/2)
const FIELD_Y_SLOTS = [105, 230, 370, 495];

// Base X for each role (home team; away mirrors around LOGIC_W)
const ROLE_BASE_X: Record<PlayerRole, number> = {
  GK:  80,
  DEF: 220,
  MID: 400,
  ATK: 590,
};

// How far forward/back each role moves depending on possession
const ROLE_ATTACK_X: Record<PlayerRole, number> = {
  GK:  95,   // GK barely advances — max ~20px from base
  DEF: 300,
  MID: 510,
  ATK: 720,
};
const ROLE_DEFEND_X: Record<PlayerRole, number> = {
  GK:  75,   // GK slightly retreats behind line
  DEF: 155,
  MID: 310,
  ATK: 430,
};

export class MatchScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Container;
  private ballSprite!: Phaser.GameObjects.Arc;
  private ballShadow!: Phaser.GameObjects.Ellipse;
  private ballWorldX = 500;
  private ballWorldY = 300;

  private pitchGraphics!: Phaser.GameObjects.Graphics;
  private playerMap: Map<string, PlayerSprite> = new Map();
  private playerDefs: Map<string, PlayerDefinition> = new Map();

  private screenW = 800;
  private screenH = 400;

  private possession: "home" | "away" = "home";
  private ultimateCharge = 0;

  private initMatchHandler!: (data: InitData) => void;
  private matchEventHandler!: (event: MatchEvent) => void;
  private matchFinishedHandler!: () => void;

  constructor() {
    super("MatchScene");
  }



  preload() {
    // Dynamic preloading of all defined player portraits
    const uniquePortraits = Array.from(new Set(STARTER_PLAYERS.map(p => p.portrait)));
    uniquePortraits.forEach(p => {
      this.load.image(`portrait-${p}`, `/portraits/${p}.png`);
    });
  }

  private getScreenX(wx: number, wy: number) {
    const topWScale = 0.7;
    const yNorm = wy / LOGIC_H;
    const currentWScale = topWScale + (1 - topWScale) * yNorm;
    const currentW = this.screenW * currentWScale;
    const offset = (this.screenW - currentW) / 2;
    return offset + (wx / LOGIC_W) * currentW;
  }

  private getScreenY(wy: number) {
    return wy * (this.screenH / LOGIC_H);
  }

  create() {
    this.screenW = this.scale.width;
    this.screenH = this.scale.height;

    this.drawPitch();
    this.createBall();

    this.input.on("pointerdown", () => {
      matchAudio.unlock();
    });

    this.initMatchHandler    = (data: InitData) => this.onInitMatch(data);
    this.matchEventHandler   = (event: MatchEvent) => this.onMatchEvent(event);
    this.matchFinishedHandler = () => this.onMatchFinished();

    EventBus.on("init-match",      this.initMatchHandler);
    EventBus.on("match-event",     this.matchEventHandler);
    EventBus.on("match-finished",  this.matchFinishedHandler);
    EventBus.on("activate-ultimate", () => this.onActivateUltimate());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off("init-match",     this.initMatchHandler);
      EventBus.off("match-event",    this.matchEventHandler);
      EventBus.off("match-finished", this.matchFinishedHandler);
      EventBus.removeAllListeners("activate-ultimate");
    });

    const DT = 16;

    this.time.addEvent({
      delay: DT,
      loop:  true,
      callback: () => {
        this.playerMap.forEach(p => {
          // --- Think timer: recalculate target independently per player ---
          p.thinkTimer -= DT;
          if (p.thinkTimer <= 0) {
            // Stagger re-evaluations: fast for GK (tracks ball), slower for field
            p.thinkTimer = p.role === "GK"
              ? 200 + Math.random() * 400
              : 500 + Math.random() * 1100;
            this.recalcTarget(p);
          }

          // --- Noise timer: slow personal micro-drift ---
          p.noiseTimer -= DT;
          if (p.noiseTimer <= 0) {
            p.noiseTimer = 1000 + Math.random() * 2000;
            const range = p.role === "GK" ? 10 : 25;
            p.noiseX = (Math.random() - 0.5) * range;
            p.noiseY = (Math.random() - 0.5) * range * 1.4;
          }

          // --- Final destination with personal offset clamped to pitch ---
          const destX = Phaser.Math.Clamp(p.targetX + p.noiseX + p.personalBias, 40, LOGIC_W - 40);
          const destY = Phaser.Math.Clamp(p.targetY + p.noiseY, 40, LOGIC_H - 40);

          // Each role has slightly different movement speed for visual variety
          const lerpX = p.role === "GK"  ? 0.055
                      : p.role === "ATK" ? 0.030
                      : p.role === "DEF" ? 0.020
                      :                   0.024;
          const lerpY = p.role === "GK"  ? 0.060
                      :                   0.022;

          p.worldX += (destX - p.worldX) * lerpX;
          p.worldY += (destY - p.worldY) * lerpY;

          const sx = this.getScreenX(p.worldX, p.worldY);
          const sy = this.getScreenY(p.worldY);
          p.container.setPosition(sx, sy);

          const pScale = 0.65 + (p.worldY / LOGIC_H) * 0.65;
          p.container.setScale(pScale);
          p.container.setDepth(100 + p.worldY);

          // --- Ultimate Ready Pulse ---
          if (this.ultimateCharge >= 100 && p.isHome) {
            if (!p.container.data?.get("ultimatePulse")) {
              const tween = this.tweens.add({
                targets: p.container,
                scale: pScale * 1.1,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
              });
              p.container.setData("ultimatePulse", tween);
              // Add a subtle glow/tint to the card if possible
              p.card.setStrokeStyle(4, 0xfbbf24, 1);
            }
          } else if (p.container.data?.get("ultimatePulse")) {
            const tween = p.container.data.get("ultimatePulse") as Phaser.Tweens.Tween;
            tween.stop();
            p.container.setData("ultimatePulse", null);
            p.container.setScale(pScale);
            p.card.setStrokeStyle(2.5, p.isHome ? 0x6366f1 : 0xf43f5e, 1);
          }
        });

        EventBus.emit("ultimate-update", this.ultimateCharge);
        if (this.ultimateCharge >= 100) {
          EventBus.emit("ultimate-ready", true);
        }

        if (this.ball) {
          const bsx = this.getScreenX(this.ballWorldX, this.ballWorldY);
          const bsy = this.getScreenY(this.ballWorldY);
          this.ball.setPosition(bsx, bsy);
          const bScale = 0.8 + (this.ballWorldY / LOGIC_H) * 0.4;
          this.ball.setScale(bScale);
          this.ballSprite.angle += 5;
          this.ball.setDepth(800);
        }
      },
    });

    EventBus.emit("current-scene-ready", this);
  }

  /**
   * Recalculate where this player should move given current possession and ball position.
   * Called independently per player at staggered intervals.
   */
  private recalcTarget(p: PlayerSprite) {
    const myTeamHasBall = this.possession === (p.isHome ? "home" : "away");

    // ---- GOALKEEPER: constrained to own goal area ----
    if (p.role === "GK") {
      const gkX = p.isHome ? ROLE_BASE_X.GK : LOGIC_W - ROLE_BASE_X.GK;
      // Never crosses into midfield: max advance is ~15% of pitch width
      const advanceX = p.isHome ? gkX + 20 : gkX - 20;
      const retreatX = p.isHome ? gkX - 10 : gkX + 10;
      p.targetX = myTeamHasBall ? advanceX : retreatX;

      if (!myTeamHasBall) {
        // Track the ball height to cover the goal (clamp to goal post range ± buffer)
        const clamped = Phaser.Math.Clamp(this.ballWorldY, LOGIC_H * 0.22, LOGIC_H * 0.78);
        p.targetY = clamped;
      } else {
        // Slowly drift back to center when team is attacking
        p.targetY = Phaser.Math.Linear(p.targetY, LOGIC_H / 2, 0.15);
      }
      return;
    }

    // ---- FIELD PLAYERS: role-based X, lane-anchored Y ----
    const attackX = p.isHome
      ? ROLE_ATTACK_X[p.role]
      : LOGIC_W - ROLE_ATTACK_X[p.role];
    const defendX = p.isHome
      ? ROLE_DEFEND_X[p.role]
      : LOGIC_W - ROLE_DEFEND_X[p.role];

    p.targetX = myTeamHasBall ? attackX : defendX;

    // Y: each player stays in their assigned lane (baseY) with a small pull toward the ball
    const ballPull = p.role === "ATK" ? 0.25 : p.role === "MID" ? 0.18 : 0.10;
    const laneRadius = p.role === "ATK" ? 80 : p.role === "MID" ? 70 : 55;

    const pulledY = p.baseY + (this.ballWorldY - p.baseY) * ballPull;
    p.targetY = Phaser.Math.Clamp(pulledY, p.baseY - laneRadius, p.baseY + laneRadius);
  }

  private equippedStadium = "stadium_default";
  private equippedKit = "kit_default";
  private badgeId = "badge_lightning";

  private getBadgeEmoji(id: string) {
    const badges: Record<string, string> = {
      badge_dragon: "🐉",
      badge_lightning: "🛡️",
      badge_crown: "👑",
    };
    return badges[id] || "🛡️";
  }

  private drawPitch() {
    const { screenW, screenH } = this;
    const stadium = this.equippedStadium;

    // Theme Configs
    const themes: Record<string, any> = {
      stadium_default: {
        bg: [0x05070a, 0x05070a, 0x0a162d, 0x0a162d],
        grass1: 0x111e3a,
        grass2: 0x0d162d,
        lines: 0x3b82f6,
        goals: 0x60a5fa,
        glow: 0x1d4ed8
      },
      stadium_neon: {
        bg: [0x080510, 0x080510, 0x1a0b2e, 0x1a0b2e],
        grass1: 0x1e113a,
        grass2: 0x150b24,
        lines: 0x8b5cf6,
        goals: 0xd8b4fe,
        glow: 0x6d28d9
      },
      stadium_retro: {
        bg: [0x061a0d, 0x061a0d, 0x0a2d16, 0x0a2d16],
        grass1: 0x113a1e,
        grass2: 0x0d2d16,
        lines: 0xfacc15,
        goals: 0xfef08a,
        glow: 0xca8a04
      }
    };

    const t = themes[stadium] || themes.stadium_default;

    if (this.pitchGraphics) this.pitchGraphics.clear();
    else this.pitchGraphics = this.add.graphics();
    
    const g = this.pitchGraphics;
    
    // 1. Draw Background
    g.fillGradientStyle(t.bg[0], t.bg[1], t.bg[2], t.bg[3], 1);
    g.fillRect(0, 0, screenW, screenH);

    const getX = (wx: number, wy: number) => this.getScreenX(wx, wy);
    const getY = (wy: number) => this.getScreenY(wy);

    // 2. Draw Pitch Surface (Perspective Corrected)
    const drawSurface = (x1: number, y1: number, x2: number, y2: number, color: number, alpha: number) => {
      g.fillStyle(color, alpha);
      const points = [
        new Phaser.Math.Vector2(getX(x1, y1), getY(y1)),
        new Phaser.Math.Vector2(getX(x2, y1), getY(y1)),
        new Phaser.Math.Vector2(getX(x2, y2), getY(y2)),
        new Phaser.Math.Vector2(getX(x1, y2), getY(y2)),
      ];
      g.fillPoints(points, true);
    };

    // Stripes
    const stripeCount = 12;
    for (let i = 0; i < stripeCount; i++) {
      const yS = (i * LOGIC_H) / stripeCount;
      const yE = ((i + 1) * LOGIC_H) / stripeCount;
      drawSurface(0, yS, LOGIC_W, yE, i % 2 === 0 ? t.grass1 : t.grass2, 0.4);
    }

    // 3. Draw Tactical Zones (Subtle Overlay)
    g.fillStyle(t.glow, 0.05);
    // Home defensive zone
    drawSurface(20, 20, 200, LOGIC_H - 20, t.glow, 0.03);
    // Away defensive zone
    drawSurface(LOGIC_W - 200, 20, LOGIC_W - 20, LOGIC_H - 20, t.glow, 0.03);

    // 4. Draw Lines with subtle outer glow
    const lineAlpha = stadium === "stadium_neon" ? 0.8 : 0.4;
    g.lineStyle(2, t.lines, lineAlpha);
    
    // Pitch Border
    const borderPoints = [
      new Phaser.Math.Vector2(getX(20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W - 20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W - 20, LOGIC_H - 20), getY(LOGIC_H - 20)),
      new Phaser.Math.Vector2(getX(20, LOGIC_H - 20), getY(LOGIC_H - 20)),
    ];
    g.strokePoints(borderPoints, true);

    // Midfield Line
    g.lineBetween(getX(LOGIC_W / 2, 20), getY(20), getX(LOGIC_W / 2, LOGIC_H - 20), getY(LOGIC_H - 20));

    // Center Circle
    g.beginPath();
    const circleRes = 0.1;
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += circleRes) {
      const px = getX(LOGIC_W / 2 + Math.cos(a) * 100, LOGIC_H / 2 + Math.sin(a) * 70);
      const py = getY(LOGIC_H / 2 + Math.sin(a) * 70);
      if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();

    // Penalty Areas
    const drawBox = (x: number, w: number, h: number) => {
      const yS = (LOGIC_H - h) / 2;
      const yE = yS + h;
      g.beginPath();
      g.moveTo(getX(x, yS), getY(yS));
      g.lineTo(getX(x + w, yS), getY(yS));
      g.lineTo(getX(x + w, yE), getY(yE));
      g.lineTo(getX(x, yE), getY(yE));
      g.strokePath();
    };

    drawBox(20, 140, 360); // Home Box
    drawBox(LOGIC_W - 160, 140, 360); // Away Box

    // 5. Goals (3D-ish)
    g.lineStyle(4, 0xffffff, 0.8);
    const goalY1 = LOGIC_H / 2 - 80, goalY2 = LOGIC_H / 2 + 80;
    const goalDepth = 30;
    
    // Left Goal
    g.lineBetween(getX(20, goalY1), getY(goalY1), getX(20 - goalDepth, goalY1), getY(goalY1));
    g.lineBetween(getX(20, goalY2), getY(goalY2), getX(20 - goalDepth, goalY2), getY(goalY2));
    g.lineBetween(getX(20 - goalDepth, goalY1), getY(goalY1), getX(20 - goalDepth, goalY2), getY(goalY2));
    
    // Right Goal
    g.lineBetween(getX(LOGIC_W - 20, goalY1), getY(goalY1), getX(LOGIC_W - 20 + goalDepth, goalY1), getY(goalY1));
    g.lineBetween(getX(LOGIC_W - 20, goalY2), getY(goalY2), getX(LOGIC_W - 20 + goalDepth, goalY2), getY(goalY2));
    g.lineBetween(getX(LOGIC_W - 20 + goalDepth, goalY1), getY(goalY1), getX(LOGIC_W - 20 + goalDepth, goalY2), getY(goalY2));

    g.setDepth(0);
  }

  private createBall() {
    this.ball = this.add.container(0, 0);
    this.ballShadow = this.add.ellipse(0, 10, 15, 6, 0x000000, 0.4);
    this.ballSprite = this.add.arc(0, 0, 8, 0, 360, false, 0xffffff);
    this.ballSprite.setStrokeStyle(1.5, 0x4a90e2, 1);
    this.ball.add([this.ballShadow, this.ballSprite]);
  }

  private onInitMatch(data: InitData) {
    if (!this.add) return;
    this.equippedStadium = data.stadiumId || "stadium_default";
    this.equippedKit = data.kitId || "kit_default";
    this.badgeId = data.badgeId || "badge_lightning";
    this.drawPitch(); // Redraw pitch with new theme
    this.playerMap.forEach(p => p.container.destroy());
    this.playerMap.clear();

    const createTeam = (roster: PlayerDefinition[], isHome: boolean) => {
      let fieldIdx = 0; // index among non-GK players, for Y lane assignment

      roster.forEach((p) => {
        const uniqueId = `${isHome ? "home" : "away"}-${p.id}`;
        this.playerDefs.set(uniqueId, p);

        const isGK  = p.roleTags.includes("goalkeeper");
        const isDEF = p.roleTags.includes("defender");
        const isATK = p.roleTags.includes("attacker");
        const role: PlayerRole = isGK ? "GK" : isDEF ? "DEF" : isATK ? "ATK" : "MID";

        let wx: number, wy: number;
        if (isGK) {
          wx = isHome ? ROLE_BASE_X.GK : LOGIC_W - ROLE_BASE_X.GK;
          wy = LOGIC_H / 2;
        } else {
          wx = isHome ? ROLE_BASE_X[role] : LOGIC_W - ROLE_BASE_X[role];
          wy = FIELD_Y_SLOTS[fieldIdx % FIELD_Y_SLOTS.length];
          fieldIdx++;
        }

        // Small constant per-player X bias so same-role players don't stack
        const personalBias = ((fieldIdx % 2 === 0) ? 1 : -1) * (12 + Math.random() * 18);

        const container = this.add.container(this.getScreenX(wx, wy), this.getScreenY(wy));
        
        // --- NEW REALISTIC PLAYER MARKER DESIGN ---
        const teamColor = isHome ? 0x6366f1 : 0xf43f5e;
        const shadow = this.add.ellipse(0, 5, 45, 20, 0x000000, 0.3);
        
        // Base Circle (Glassmorphism look)
        const base = this.add.circle(0, 0, 24, 0x111827, 0.8)
                          .setStrokeStyle(2, teamColor, 1);
        
        // Inner Glow
        const glow = this.add.circle(0, 0, 22, teamColor, 0.1);

        // Portrait
        const portrait = this.add.image(0, -2, `portrait-${p.portrait}`).setDisplaySize(36, 36);

        // Role Badge
        const roleCircle = this.add.circle(14, 14, 8, 0x000000, 1).setStrokeStyle(1, 0xffffff, 0.3);
        const roleText = this.add.text(14, 14, role, { fontSize: "8px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);

        // Name Tag (Compact)
        const nameBg = this.add.rectangle(0, 32, 50, 14, 0x000000, 0.6).setStrokeStyle(1, 0xffffff, 0.1);
        const nameText = this.add.text(0, 32, p.name.split(" ")[0].toUpperCase(), 
                          { fontSize: "9px", fontStyle: "black", color: "#ffffff" }).setOrigin(0.5);

        container.add([shadow, base, glow, portrait, roleCircle, roleText, nameBg, nameText]);

        this.playerMap.set(uniqueId, {
          container,
          card: base as any,
          worldX: wx,
          worldY: wy,
          baseX: wx,
          baseY: wy,
          targetX: wx,
          targetY: wy,
          isHome,
          role,
          personalBias,
          thinkTimer: Math.random() * 900,  // stagger so no two players think simultaneously
          noiseX: 0,
          noiseY: 0,
          noiseTimer: Math.random() * 1500,
        });
      });
    };

    createTeam(data.homeRoster, true);
    createTeam(data.awayRoster, false);

    this.ballWorldX = LOGIC_W / 2;
    this.ballWorldY = LOGIC_H / 2;

    // Reset ultimate charge for new match
    this.ultimateCharge = 0;
    EventBus.emit("ultimate-update", 0);

    // Whistle at match start
    matchAudio.play("whistle");
  }

  private onMatchEvent(event: MatchEvent) {
    if (!this.add || !this.scene.isActive()) return;
    const actorId  = event.actorId
      ? (this.playerMap.has(`home-${event.actorId}`) ? `home-${event.actorId}` : `away-${event.actorId}`)
      : null;
    const targetId = event.targetId
      ? (this.playerMap.has(`home-${event.targetId}`) ? `home-${event.targetId}` : `away-${event.targetId}`)
      : null;

    const actor  = actorId  ? this.playerMap.get(actorId)  : null;
    const target = targetId ? this.playerMap.get(targetId) : null;

    if (actor) this.tweens.killTweensOf(actor);

    if (event.team === "home" && ["pass", "dribble", "save", "goal"].includes(event.type)) {
      this.ultimateCharge = Math.min(100, this.ultimateCharge + (event.type === "goal" ? 25 : 5));
    }

    switch (event.type) {
      case "kickoff":
        matchAudio.play("whistle");
        this.ballWorldX = LOGIC_W / 2;
        this.ballWorldY = LOGIC_H / 2;
        this.possession = event.team;
        break;

      case "pass":
        if (actor && target) {
          this.possession = event.team;
          this.tweens.add({
            targets: this,
            ballWorldX: target.worldX,
            ballWorldY: target.worldY,
            duration: 400,
            ease: "Sine.easeOut",
          });
        }
        break;

      case "dribble":
      case "possession_change":
        if (actor) {
          this.possession = event.team;
          this.tweens.add({
            targets: this,
            ballWorldX: actor.worldX,
            ballWorldY: actor.worldY,
            duration: 300,
          });
        }
        break;

      case "save":
        matchAudio.play("save");
        if (actor && target) {
          const sDef = this.playerDefs.get(targetId!);
          const kDef = this.playerDefs.get(actorId!);
          if (sDef && kDef) this.showClash(sDef, kDef, "GRANDE PARATA!");
          this.tweens.add({
            targets: this,
            ballWorldX: actor.worldX + (actor.isHome ? 100 : -100),
            ballWorldY: LOGIC_H / 2,
            duration: 450,
          });
        }
        break;

      case "goal":
        matchAudio.play("goal");
        const isHome = event.team === "home";
        this.tweens.add({
          targets: this,
          ballWorldX: isHome ? LOGIC_W - 20 : 20,
          ballWorldY: LOGIC_H / 2,
          duration: 500,
        });
        const scorer = actorId ? this.playerDefs.get(actorId) : null;
        if (scorer) this.showClash(scorer, null as any, "GOL STREPITOSO!");
        this.time.delayedCall(500, () => this.cameras.main.shake(400, 0.02));
        break;
    }
  }

  private showClash(p1: PlayerDefinition, p2: PlayerDefinition | null, title: string) {
    if (!this.add) return;
    const { screenW, screenH } = this;
    const overlay   = this.add.rectangle(0, 0, screenW, screenH, 0x000000, 0.8)
                        .setOrigin(0).setDepth(2000).setAlpha(0);
    const container = this.add.container(screenW / 2, screenH / 2).setDepth(2001).setScale(0);

    const titleText = this.add.text(0, -100, title, { fontSize: "32px", color: "#fbbf24" })
                        .setOrigin(0.5).setStroke("#000000", 6);
    container.add(titleText);

    const createLargeCard = (p: PlayerDefinition, x: number, color: number) => {
      const card    = this.add.container(x, 0);
      const body    = this.add.rectangle(0, 0, 140, 200, 0x1f2937, 1).setStrokeStyle(4, color, 1);
      const portrait = this.add.image(0, -20, `portrait-${p.portrait}`).setDisplaySize(120, 120);
      const name    = this.add.text(0, 70, p.name.toUpperCase(), { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
      card.add([body, portrait, name]);
      return card;
    };

    container.add(createLargeCard(p1, p2 ? -90 : 0, 0x6366f1));
    if (p2) container.add(createLargeCard(p2, 90, 0xf43f5e));

    this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 400,
      ease: "Back.easeOut",
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          this.tweens.add({
            targets: [overlay, container],
            alpha: 0,
            duration: 300,
            onComplete: () => { overlay.destroy(); container.destroy(); },
          });
        });
      },
    });
  }

  private onMatchFinished() {
    if (!this.cameras || !this.cameras.main) return;
    matchAudio.play("whistle");
    this.cameras.main.flash(500, 255, 255, 255);
    this.time.delayedCall(500, () => this.cameras.main.fade(1500, 5, 10, 20));
  }

  private onActivateUltimate() {
    if (this.ultimateCharge < 100) return;
    
    // Visual "GOLPE" effect
    this.cameras.main.flash(400, 251, 191, 36); // Yellow flash
    this.cameras.main.shake(300, 0.01);
    
    // Apply temporary bonus to home team
    this.ultimateCharge = 0;
    EventBus.emit("ultimate-update", 0);
    EventBus.emit("ultimate-ready", false);

    // Show a "ULTIMATE ACTIVATED" text in the middle
    const txt = this.add.text(this.screenW/2, this.screenH/2, "ULTIMATE ATTIVATA!", {
      fontSize: "48px",
      fontStyle: "italic bold",
      color: "#fbbf24",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(3000).setScale(0);

    this.tweens.add({
      targets: txt,
      scale: 1.2,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: "Back.easeOut",
      onComplete: () => txt.destroy()
    });
  }
}
