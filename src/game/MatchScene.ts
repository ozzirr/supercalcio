import * as Phaser from "phaser";
import { EventBus } from "./EventBus";
import { matchAudio } from "./match-audio";
import type { MatchEvent } from "@/types/match";
import type { PlayerDefinition } from "@/types/player";
import { STARTER_PLAYERS } from "@/content/players";
import { speechEngine } from "./speech-engine";

// Engine Modules
import { LOGIC_W, LOGIC_H, FIELD_Y_SLOTS, ROLE_BASE_X, type PlayerRole } from "./engine/EngineConstants";
import { PlayerEntity } from "./entities/PlayerEntity";
import { BallEntity } from "./entities/BallEntity";
import { TacticalSystem } from "./systems/TacticalSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { RenderSystem } from "./systems/RenderSystem";

type InitData = {
  homeRoster: PlayerDefinition[];
  awayRoster: PlayerDefinition[];
  stadiumId?: string;
  kitId?: string;
  badgeId?: string;
};

// Map logical entities to their rendering containers
type PlayerRender = {
  container: Phaser.GameObjects.Container;
  card: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Ellipse;
};

export class MatchScene extends Phaser.Scene {
  // Logic state
  private players: PlayerEntity[] = [];
  private playerDefs: Map<string, PlayerDefinition> = new Map();
  private ballEntity: BallEntity = new BallEntity();
  private possession: "home" | "away" | "neutral" = "home";
  private ultimateCharge = 0;

  // Renderers & Systems
  private renderSystem!: RenderSystem;
  private playerRenders: Map<string, PlayerRender> = new Map();
  private ballContainer!: Phaser.GameObjects.Container;
  private ballSprite!: Phaser.GameObjects.Arc;

  // View state
  private camX = 500;
  private camLerp = 0.05;
  private screenW = 800;
  private screenH = 400;

  // Visuals
  private pitchGraphics!: Phaser.GameObjects.Graphics;
  private stadiumBackdrop!: Phaser.GameObjects.TileSprite;

  private initMatchHandler!: (data: InitData) => void;
  private matchEventHandler!: (event: MatchEvent) => void;
  private matchFinishedHandler!: () => void;

  constructor() {
    super("MatchScene");
  }

  preload() {
    const uniquePortraits = Array.from(new Set(STARTER_PLAYERS.map(p => p.portrait)));
    uniquePortraits.forEach(p => {
      this.load.image(p, `/assets/portraits/${p}.png`);
    });

    this.load.image("match-grass", "/match/grass_texture.png");
    this.load.image("match-stadium", "/match/stadium_backdrop.png");
    this.load.image("match-player-white", "/match/p_white1.png");
    this.load.image("match-player-black", "/match/p_black_1.png");
    this.load.image("match-ball", "/match/ball.png");
  }

  create() {
    this.screenW = this.scale.width;
    this.screenH = this.scale.height;
    this.renderSystem = new RenderSystem(this.screenW, this.screenH);

    this.drawPitch();
    this.createBall();

    this.input.on("pointerdown", () => {
      matchAudio.unlock();
    });

    this.initMatchHandler = (data: InitData) => this.onInitMatch(data);
    this.matchEventHandler = (event: MatchEvent) => this.onMatchEvent(event);
    this.matchFinishedHandler = () => this.onMatchFinished();

    EventBus.on("init-match", this.initMatchHandler);
    EventBus.on("match-event", this.matchEventHandler);
    EventBus.on("match-finished", this.matchFinishedHandler);
    EventBus.on("activate-ultimate", () => this.onActivateUltimate());

    // Broadcast Effects
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.4);
    vignette.setDepth(5000).setScrollFactor(0);
    const vSize = 100;
    vignette.fillRect(0, 0, this.screenW, vSize);
    vignette.fillRect(0, this.screenH - vSize, this.screenW, vSize);
    vignette.alpha = 0.3;

    const scanlines = this.add.graphics();
    scanlines.lineStyle(1, 0x000000, 0.05);
    for (let i = 0; i < this.screenH; i += 4) {
      scanlines.lineBetween(0, i, this.screenW, i);
    }
    scanlines.setDepth(5001).setScrollFactor(0);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off("init-match", this.initMatchHandler);
      EventBus.off("match-event", this.matchEventHandler);
      EventBus.off("match-finished", this.matchFinishedHandler);
      EventBus.removeAllListeners("activate-ultimate");
    });

    EventBus.emit("current-scene-ready", this);
  }

  // Proper Phaser Update Loop
  update(time: number, delta: number) {
    if (!this.ballEntity || !this.renderSystem) return;

    // 1. Logic Update
    // Camera Logic
    const targetCamX = Phaser.Math.Clamp(this.ballEntity.worldX, 200, 800);
    this.camX += (targetCamX - this.camX) * this.camLerp;

    // Entities Logic
    this.players.forEach(p => {
      p.thinkTimer -= delta;
      if (p.thinkTimer <= 0) {
        p.thinkTimer = p.role === "GK"
          ? 200 + Math.random() * 400
          : 500 + Math.random() * 1100;
        TacticalSystem.updatePlayerTarget(p, this.ballEntity.worldY, this.possession);
      }
    });

    MovementSystem.update(this.players, delta);

    // Ultimate Logic
    EventBus.emit("ultimate-update", this.ultimateCharge);
    if (this.ultimateCharge >= 100) {
      EventBus.emit("ultimate-ready", true);
    }

    // 2. Render Update
    this.players.forEach(p => {
      const render = this.playerRenders.get(p.id);
      if (!render) return;

      const sx = this.renderSystem.getScreenX(p.worldX, p.worldY, this.camX);
      const sy = this.renderSystem.getScreenY(p.worldY);
      
      render.container.setPosition(sx, sy);

      const pScale = 0.5 + (p.worldY / LOGIC_H) * 0.9;
      render.container.setScale(pScale);
      render.container.setDepth(200 + p.worldY);

      // Billboard flip based on movement target
      if (Math.abs(p.targetX - p.worldX) > 2) {
         render.card.setFlipX(p.targetX < p.worldX);
      }

      // Ultimate effect
      if (this.ultimateCharge >= 100 && p.isHome) {
        if (!render.container.data?.get("ultimatePulse")) {
          const tween = this.tweens.add({
            targets: render.container,
            scale: pScale * 1.05,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
          render.container.setData("ultimatePulse", tween);
        }
      } else if (render.container.data?.get("ultimatePulse")) {
        const tween = render.container.data.get("ultimatePulse") as Phaser.Tweens.Tween;
        tween.stop();
        render.container.setData("ultimatePulse", null);
        render.container.setScale(pScale);
      }
    });

    if (this.ballContainer) {
      const bsx = this.renderSystem.getScreenX(this.ballEntity.worldX, this.ballEntity.worldY, this.camX);
      const bsy = this.renderSystem.getScreenY(this.ballEntity.worldY);
      this.ballContainer.setPosition(bsx, bsy);
      
      const bScale = 0.8 + (this.ballEntity.worldY / LOGIC_H) * 0.6;
      this.ballContainer.setScale(bScale);
      this.ballSprite.angle += 10;
      this.ballContainer.setDepth(200 + this.ballEntity.worldY + 1);

      if (this.stadiumBackdrop) {
          this.stadiumBackdrop.tilePositionX = this.camX * 0.2;
      }
    }
  }

  private drawPitch() {
    const { screenW, screenH } = this;
    const rs = this.renderSystem;

    this.add.rectangle(screenW/2, screenH/2, screenW, screenH, 0x0a162d).setDepth(-100);

    if (this.stadiumBackdrop) this.stadiumBackdrop.destroy();

    this.stadiumBackdrop = this.add.tileSprite(screenW/2, 70, screenW * 2, 380, "match-stadium")
        .setScrollFactor(0)
        .setDepth(-10)
        .setScale(1)
        .setAlpha(1);
    this.stadiumBackdrop.tilePositionY = 150;

    const g = this.pitchGraphics || this.add.graphics();
    if (!this.pitchGraphics) this.pitchGraphics = g;
    g.clear();
    g.setDepth(0);

    const getX = (wx: number, wy: number) => rs.getScreenX(wx, wy, this.camX);
    const getY = (wy: number) => rs.getScreenY(wy);

    g.fillStyle(0x05070a, 1);
    g.fillRect(0, 110, screenW, 20);

    const rows = 12;
    for (let j = 0; j < rows; j++) {
        const wyS = (j * LOGIC_H) / rows;
        const wyE = ((j + 1) * LOGIC_H) / rows;
        const color = j % 2 === 0 ? 0x166534 : 0x14532d;
        g.fillStyle(color, 1);

        const p1 = new Phaser.Math.Vector2(getX(0, wyS), getY(wyS));
        const p2 = new Phaser.Math.Vector2(getX(LOGIC_W, wyS), getY(wyS));
        const p3 = new Phaser.Math.Vector2(getX(LOGIC_W, wyE), getY(wyE));
        const p4 = new Phaser.Math.Vector2(getX(0, wyE), getY(wyE));

        g.fillPoints([p1, p2, p3, p4], true);
    }

    g.lineStyle(3, 0xffffff, 0.6);
    
    g.strokePoints([
      new Phaser.Math.Vector2(getX(20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W - 20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W - 20, LOGIC_H - 20), getY(LOGIC_H - 20)),
      new Phaser.Math.Vector2(getX(20, LOGIC_H - 20), getY(LOGIC_H - 20)),
    ], true);

    g.lineBetween(getX(LOGIC_W/2, 20), getY(20), getX(LOGIC_W/2, LOGIC_H-20), getY(LOGIC_H-20));

    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
        const px = getX(LOGIC_W/2 + Math.cos(a) * 90, LOGIC_H/2 + Math.sin(a) * 90);
        const py = getY(LOGIC_H/2 + Math.sin(a) * 90);
        if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();

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
    drawBox(20, 160, 380);
    drawBox(LOGIC_W - 180, 160, 380);

    g.lineStyle(4, 0xffffff, 0.9);
    const goalY1 = LOGIC_H/2 - 90, goalY2 = LOGIC_H/2 + 90;
    const gD = 50;
    g.lineBetween(getX(20, goalY1), getY(goalY1), getX(20-gD, goalY1), getY(goalY1));
    g.lineBetween(getX(20, goalY2), getY(goalY2), getX(20-gD, goalY2), getY(goalY2));
    g.lineBetween(getX(20-gD, goalY1), getY(goalY1), getX(20-gD, goalY2), getY(goalY2));
    g.lineBetween(getX(LOGIC_W-20, goalY1), getY(goalY1), getX(LOGIC_W-20+gD, goalY1), getY(goalY1));
    g.lineBetween(getX(LOGIC_W-20, goalY2), getY(goalY2), getX(LOGIC_W-20+gD, goalY2), getY(goalY2));
    g.lineBetween(getX(LOGIC_W-20+gD, goalY1), getY(goalY1), getX(LOGIC_W-20+gD, goalY2), getY(goalY2));

    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.4, 0.4, 0, 0);
    overlay.fillRect(0, 0, screenW, screenH);
    overlay.setDepth(1).setAlpha(0.2).setScrollFactor(0);
  }

  private createBall() {
    this.ballContainer = this.add.container(0, 0);
    const ballShadow = this.add.ellipse(0, 10, 15, 6, 0x000000, 0.5);
    const ballImg = this.add.image(0, 0, "match-ball").setDisplaySize(16, 16);
    this.ballSprite = ballImg as any;
    this.ballContainer.add([ballShadow, ballImg]);
  }

  private onInitMatch(data: InitData) {
    if (!this.scene || !this.scene.isActive()) return;
    
    this.playerRenders.forEach(r => r.container.destroy());
    this.playerRenders.clear();
    this.players = [];
    this.playerDefs.clear();

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
        
        // Logical Entity
        const entity = new PlayerEntity(uniqueId, p, isHome, role, wx, wy, personalBias);
        this.players.push(entity);

        // Visual Representation
        const sx = this.renderSystem.getScreenX(wx, wy, this.camX);
        const sy = this.renderSystem.getScreenY(wy);
        const container = this.add.container(sx, sy);
        
        const shadow = this.add.ellipse(0, 10, 40, 15, 0x000000, 0.4);
        const playerTexture = isHome ? "match-player-white" : "match-player-black";
        const athlete = this.add.image(0, -35, playerTexture).setDisplaySize(80, 100);
        const nameText = this.add.text(0, -75, p.name.split(" ")[0].toUpperCase(),
                          { fontSize: "10px", fontStyle: "bold", color: "#ffffff", stroke: "#000000", strokeThickness: 2 })
                          .setOrigin(0.5);

        container.add([shadow, athlete, nameText]);

        this.playerRenders.set(uniqueId, {
          container,
          card: athlete,
          shadow
        });
      });
    };

    createTeam(data.homeRoster, true);
    createTeam(data.awayRoster, false);

    this.ballEntity.reset();
    this.camX = 500;
    this.ultimateCharge = 0;
    EventBus.emit("ultimate-update", 0);

    matchAudio.play("whistle");
  }

  private onMatchEvent(event: MatchEvent) {
    if (!this.scene?.isActive?.()) return;

    const actorId  = event.actorId ? (this.playerDefs.has(`home-${event.actorId}`) ? `home-${event.actorId}` : `away-${event.actorId}`) : null;
    const targetId = event.targetId ? (this.playerDefs.has(`home-${event.targetId}`) ? `home-${event.targetId}` : `away-${event.targetId}`) : null;

    const actor  = actorId ? this.players.find(p => p.id === actorId) : null;
    const target = targetId ? this.players.find(p => p.id === targetId) : null;
    
    const actorDef = actorId ? this.playerDefs.get(actorId) : null;
    const targetDef = targetId ? this.playerDefs.get(targetId) : null;

    speechEngine.announceEvent(event, actorDef || null, targetDef || null);

    if (actor) this.tweens.killTweensOf(actor); // Stop logic tweens if any

    if (event.team === "home" && ["pass", "dribble", "save", "goal"].includes(event.type)) {
      this.ultimateCharge = Math.min(100, this.ultimateCharge + (event.type === "goal" ? 25 : 5));
    }

    switch (event.type) {
      case "kickoff":
        matchAudio.play("whistle");
        this.ballEntity.reset();
        this.possession = event.team;
        break;

      case "pass":
        if (actor && target) {
          this.possession = event.team;
          this.tweens.add({
            targets: this.ballEntity,
            worldX: target.worldX,
            worldY: target.worldY,
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
            targets: this.ballEntity,
            worldX: actor.worldX,
            worldY: actor.worldY,
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
            targets: this.ballEntity,
            worldX: actor.worldX + (actor.isHome ? 100 : -100),
            worldY: LOGIC_H / 2,
            duration: 450,
          });
        }
        break;

      case "goal":
        matchAudio.play("goal");
        const isHome = event.team === "home";
        this.tweens.add({
          targets: this.ballEntity,
          worldX: isHome ? LOGIC_W - 20 : 20,
          worldY: LOGIC_H / 2,
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
    const overlay = this.add.rectangle(0, 0, screenW, screenH, 0x000000, 0.6)
                        .setOrigin(0).setDepth(2000).setAlpha(0);
    const container = this.add.container(screenW / 2, screenH / 2).setDepth(2001).setScale(0);

    const titleText = this.add.text(0, -70, title, { fontSize: "24px", color: "#fbbf24", fontStyle: "bold italic" })
                        .setOrigin(0.5).setStroke("#000000", 4);
    container.add(titleText);

    const createLargeCard = (p: PlayerDefinition, x: number, color: number) => {
      const card = this.add.container(x, 20);
      const body = this.add.rectangle(0, 0, 100, 140, 0x1f2937, 1).setStrokeStyle(3, color, 1);
      const portrait = this.add.image(0, -15, p.portrait).setDisplaySize(80, 80);
      const name = this.add.text(0, 50, p.name.split(" ")[0].toUpperCase(), { fontSize: "14px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);
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
    
    this.cameras.main.flash(400, 251, 191, 36);
    this.cameras.main.shake(300, 0.01);
    
    this.ultimateCharge = 0;
    EventBus.emit("ultimate-update", 0);
    EventBus.emit("ultimate-ready", false);

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
