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

  private possession: "home" | "away" | "neutral" = "home";
  private ultimateCharge = 0;

  // New visual elements
  private stadiumBackdrop!: Phaser.GameObjects.TileSprite;
  private camX = 500; // Logical camera center X
  private camY = 300; // Logical camera center Y
  private camLerp = 0.05;

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

    // Match Engine 2.0 Assets
    this.load.image("match-grass", "/match/grass_texture.png"); // Kept as fall-back or for patterns
    this.load.image("match-stadium", "/match/stadium_backdrop.png");
    this.load.image("match-player", "/match/player_athlete.png");
    this.load.image("match-ball", "/match/ball.png");
  }

  private getScreenX(wx: number, wy: number) {
    const topWScale = 0.45; // Even more aggressive perspective for that "stadium" feel
    const yNorm = wy / LOGIC_H;
    const currentWScale = topWScale + (1 - topWScale) * yNorm;
    const currentW = this.screenW * currentWScale;
    const offset = (this.screenW - currentW) / 2;
    
    // Adjust for camera panning
    const camOffset = (this.camX - 500) * (currentW / LOGIC_W) * 0.6;
    return offset + (wx / LOGIC_W) * currentW - camOffset;
  }

  private getScreenY(wy: number) {
    const yNorm = wy / LOGIC_H;
    // Non-linear Y compression to create a 3D floor effect
    const yMapped = Math.pow(yNorm, 1.2); 
    const horizonOffset = 120; // Lower horizon for better stadium visibility
    const fieldHeight = this.screenH - horizonOffset - 20;
    return horizonOffset + yMapped * fieldHeight;
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

    // --- Broadcast Effects ---
    // 1. Vignette
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.4);
    vignette.setDepth(5000).setScrollFactor(0);
    // Draw a radial-like vignette with a large rectangle with holes or just multiple semi-transparent rects
    // Simple way: large black border
    const vSize = 100;
    vignette.fillRect(0, 0, this.screenW, vSize); // Top
    vignette.fillRect(0, this.screenH - vSize, this.screenW, vSize); // Bottom
    vignette.alpha = 0.3;

    // 2. Scanlines (Dynamic overlay)
    const scanlines = this.add.graphics();
    scanlines.lineStyle(1, 0x000000, 0.05);
    for (let i = 0; i < this.screenH; i += 4) {
      scanlines.lineBetween(0, i, this.screenW, i);
    }
    scanlines.setDepth(5001).setScrollFactor(0);

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
        // --- Smooth Camera Follow ---
        const targetCamX = Phaser.Math.Clamp(this.ballWorldX, 200, 800);
        this.camX += (targetCamX - this.camX) * this.camLerp;

        this.playerMap.forEach(p => {
          // --- Think timer: recalculate target independently per player ---
          p.thinkTimer -= DT;
          if (p.thinkTimer <= 0) {
            p.thinkTimer = p.role === "GK"
              ? 200 + Math.random() * 400
              : 500 + Math.random() * 1100;
            this.recalcTarget(p);
          }

          // --- Noise timer ---
          p.noiseTimer -= DT;
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

          const sx = this.getScreenX(p.worldX, p.worldY);
          const sy = this.getScreenY(p.worldY);
          p.container.setPosition(sx, sy);

          const pScale = 0.5 + (p.worldY / LOGIC_H) * 0.9;
          p.container.setScale(pScale);
          p.container.setDepth(200 + p.worldY);

          // Billboard flip based on movement
          const spr = p.container.getAt(1) as Phaser.GameObjects.Image; // Athlete image
          if (Math.abs(destX - p.worldX) > 2) {
             spr.setFlipX(destX < p.worldX);
          }

          // --- Ultimate Ready Pulse ---
          if (this.ultimateCharge >= 100 && p.isHome) {
            if (!p.container.data?.get("ultimatePulse")) {
              const tween = this.tweens.add({
                targets: p.container,
                scale: pScale * 1.05,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
              });
              p.container.setData("ultimatePulse", tween);
            }
          } else if (p.container.data?.get("ultimatePulse")) {
            const tween = p.container.data.get("ultimatePulse") as Phaser.Tweens.Tween;
            tween.stop();
            p.container.setData("ultimatePulse", null);
            p.container.setScale(pScale);
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
          const bScale = 0.8 + (this.ballWorldY / LOGIC_H) * 0.6;
          this.ball.setScale(bScale);
          this.ballSprite.angle += 10;
          this.ball.setDepth(200 + this.ballWorldY + 1); // Ball slightly in front of players at same Y
          
          // Update Stadium Backdrop scroll based on cam
          if (this.stadiumBackdrop) {
              this.stadiumBackdrop.tilePositionX = this.camX * 0.2;
          }
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
    
    // 0. Deep Background Sky
    this.add.rectangle(screenW/2, screenH/2, screenW, screenH, 0x0a162d).setDepth(-100);

    // 1. Stadium Backdrop (Refined alignment)
    if (this.stadiumBackdrop) this.stadiumBackdrop.destroy();
    
    // We want the crowd part of the image (middle/bottom) to line up with the horizon
    this.stadiumBackdrop = this.add.tileSprite(screenW/2, 70, screenW * 2, 380, "match-stadium")
        .setScrollFactor(0)
        .setDepth(-10)
        .setScale(1)
        .setAlpha(1);
    
    // Adjust Y offset of the texture to show the stands
    this.stadiumBackdrop.tilePositionY = 150; 

    // 2. Horizon Transition (Wall/Advertising Boards)
    const g = this.pitchGraphics || this.add.graphics();
    if (!this.pitchGraphics) this.pitchGraphics = g;
    g.clear();
    g.setDepth(0);

    const getX = (wx: number, wy: number) => this.getScreenX(wx, wy);
    const getY = (wy: number) => this.getScreenY(wy);

    // Draw a dark "Wall" at the horizon to bridge the pitch and backdrop
    g.fillStyle(0x05070a, 1);
    g.fillRect(0, 110, screenW, 20); // Thick barrier at the pitch start
    
    // 3. Pitch Surface (Texture Tiling)

    // Render the grass using a series of trapezoids to simulate perspective tiling
    const rows = 12;
    for (let j = 0; j < rows; j++) {
        const wyS = (j * LOGIC_H) / rows;
        const wyE = ((j + 1) * LOGIC_H) / rows;
        
        // Alternate dark/light green for the "striped" look from the image
        const color = j % 2 === 0 ? 0x166534 : 0x14532d; 
        g.fillStyle(color, 1);
        
        const p1 = new Phaser.Math.Vector2(getX(0, wyS), getY(wyS));
        const p2 = new Phaser.Math.Vector2(getX(LOGIC_W, wyS), getY(wyS));
        const p3 = new Phaser.Math.Vector2(getX(LOGIC_W, wyE), getY(wyE));
        const p4 = new Phaser.Math.Vector2(getX(0, wyE), getY(wyE));
        
        g.fillPoints([p1, p2, p3, p4], true);
    }

    // 3. Pitch Markings (Crisp & White)
    g.lineStyle(3, 0xffffff, 0.6);
    
    // Pitch Border
    g.strokePoints([
      new Phaser.Math.Vector2(getX(20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W - 20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W - 20, LOGIC_H - 20), getY(LOGIC_H - 20)),
      new Phaser.Math.Vector2(getX(20, LOGIC_H - 20), getY(LOGIC_H - 20)),
    ], true);

    // Center Logic
    g.lineBetween(getX(LOGIC_W/2, 20), getY(20), getX(LOGIC_W/2, LOGIC_H-20), getY(LOGIC_H-20));
    
    // High-quality Center Circle
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
        const px = getX(LOGIC_W/2 + Math.cos(a) * 90, LOGIC_H/2 + Math.sin(a) * 90);
        const py = getY(LOGIC_H/2 + Math.sin(a) * 90);
        if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();

    // Box Areas (Penalità)
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
    drawBox(20, 160, 380); // Home
    drawBox(LOGIC_W - 180, 160, 380); // Away

    // 4. Goals (3D Wireframe with Glow)
    g.lineStyle(4, 0xffffff, 0.9);
    const goalY1 = LOGIC_H/2 - 90, goalY2 = LOGIC_H/2 + 90;
    const gD = 50; 
    // Left
    g.lineBetween(getX(20, goalY1), getY(goalY1), getX(20-gD, goalY1), getY(goalY1));
    g.lineBetween(getX(20, goalY2), getY(goalY2), getX(20-gD, goalY2), getY(goalY2));
    g.lineBetween(getX(20-gD, goalY1), getY(goalY1), getX(20-gD, goalY2), getY(goalY2));
    // Right
    g.lineBetween(getX(LOGIC_W-20, goalY1), getY(goalY1), getX(LOGIC_W-20+gD, goalY1), getY(goalY1));
    g.lineBetween(getX(LOGIC_W-20, goalY2), getY(goalY2), getX(LOGIC_W-20+gD, goalY2), getY(goalY2));
    g.lineBetween(getX(LOGIC_W-20+gD, goalY1), getY(goalY1), getX(LOGIC_W-20+gD, goalY2), getY(goalY2));

    // 5. Add a "Grass Shine" effect (Vignette for the field)
    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.4, 0.4, 0, 0);
    overlay.fillRect(0, 0, screenW, screenH);
    overlay.setDepth(1).setAlpha(0.2).setScrollFactor(0);
  }

  private createBall() {
    this.ball = this.add.container(0, 0);
    // Sophisticated shadow
    this.ballShadow = this.add.ellipse(0, 10, 15, 6, 0x000000, 0.5);
    
    // High-fidelity ball sprite
    const ballImg = this.add.image(0, 0, "match-ball").setDisplaySize(16, 16);
    this.ballSprite = ballImg as any; // Cast for rotation compatibility
    
    this.ball.add([this.ballShadow, ballImg]);
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
      let fieldIdx = 0;

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

        const personalBias = ((fieldIdx % 2 === 0) ? 1 : -1) * (12 + Math.random() * 18);
        const container = this.add.container(this.getScreenX(wx, wy), this.getScreenY(wy));
        
        // --- MATCH ENGINE 2.0 ATHLETE DESIGN ---
        const teamColor = isHome ? 0x6366f1 : 0xf43f5e;
        
        // 1. Dynamic Shadow (Always at feet)
        const shadow = this.add.ellipse(0, 10, 40, 15, 0x000000, 0.4);
        
        // 2. Athlete Billboard
        const athlete = this.add.image(0, -35, "match-player")
            .setDisplaySize(80, 100)
            .setTint(teamColor); // Subtle kit tint
        
        // 3. Compact Floating Portrait (for identification)
        const portrait = this.add.image(-15, -75, `portrait-${p.portrait}`)
            .setDisplaySize(28, 28);
        const portraitFrame = this.add.circle(-15, -75, 15, 0x000000, 0.5)
            .setStrokeStyle(1.5, teamColor, 1);
        
        // 4. Name Tag
        const nameText = this.add.text(0, -95, p.name.split(" ")[0].toUpperCase(), 
                          { fontSize: "10px", fontStyle: "bold", color: "#ffffff", stroke: "#000000", strokeThickness: 2 })
                          .setOrigin(0.5);

        container.add([shadow, athlete, portraitFrame, portrait, nameText]);

        this.playerMap.set(uniqueId, {
          container,
          card: athlete as any,
          worldX: wx,
          worldY: wy,
          baseX: wx,
          baseY: wy,
          targetX: wx,
          targetY: wy,
          isHome,
          role,
          personalBias,
          thinkTimer: Math.random() * 900,
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
    const overlay   = this.add.rectangle(0, 0, screenW, screenH, 0x000000, 0.6)
                        .setOrigin(0).setDepth(2000).setAlpha(0);
    const container = this.add.container(screenW / 2, screenH / 2).setDepth(2001).setScale(0);

    const titleText = this.add.text(0, -70, title, { fontSize: "24px", color: "#fbbf24", fontStyle: "bold italic" })
                        .setOrigin(0.5).setStroke("#000000", 4);
    container.add(titleText);

    const createLargeCard = (p: PlayerDefinition, x: number, color: number) => {
      const card    = this.add.container(x, 20);
      const body    = this.add.rectangle(0, 0, 100, 140, 0x1f2937, 1).setStrokeStyle(3, color, 1);
      const portrait = this.add.image(0, -15, `portrait-${p.portrait}`).setDisplaySize(80, 80);
      const name    = this.add.text(0, 50, p.name.split(" ")[0].toUpperCase(), { fontSize: "14px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);
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
