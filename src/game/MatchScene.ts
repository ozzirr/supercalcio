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
  card: Phaser.GameObjects.Rectangle;
  worldX: number;
  worldY: number;
  baseX: number;
  baseY: number;
  isHome: boolean;
  isMoving: boolean;
};

const LOGIC_W = 1000;
const LOGIC_H = 600;

export class MatchScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Container;
  private ballSprite!: Phaser.GameObjects.Arc;
  private ballShadow!: Phaser.GameObjects.Ellipse;
  private ballWorldX = 500;
  private ballWorldY = 300;
  
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
    const players = [
      "aegis", "blaze", "phantom", "volt", "titan", "hawk", 
      "goliath", "viper", "rampart", "oracle", "avalanche", "zenith",
      "maestro", "chronos", "nova", "mirage", "sniper", "juggernaut", "venom", "apex"
    ];
    players.forEach(p => this.load.image(`portrait-${p}`, `/portraits/${p}.png`));

    this.load.audio('whistle', '/audio/match/whistle.mp3');
    this.load.audio('goal', '/audio/match/goal.mp3');
    this.load.audio('save', '/audio/match/save.mp3');
    this.load.audio('ambient', '/audio/match/crowd.mp3');
    this.load.audio('music', '/audio/match/theme.mp3');
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

    try {
      this.sound.play('ambient', { volume: 0.04, loop: true });
      this.sound.play('music', { volume: 0.07, loop: true });
    } catch (e) {}

    this.initMatchHandler = (data: InitData) => this.onInitMatch(data);
    this.matchEventHandler = (event: MatchEvent) => this.onMatchEvent(event);
    this.matchFinishedHandler = () => this.onMatchFinished();

    EventBus.on("init-match", this.initMatchHandler);
    EventBus.on("match-event", this.matchEventHandler);
    EventBus.on("match-finished", this.matchFinishedHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off("init-match", this.initMatchHandler);
      EventBus.off("match-event", this.matchEventHandler);
      EventBus.off("match-finished", this.matchFinishedHandler);
    });

    this.time.addEvent({
      delay: 16,
      callback: () => {
        this.playerMap.forEach(p => {
          let targetX = p.baseX;
          if (p.isHome) {
            targetX += this.possession === "home" ? 300 : -100;
          } else {
            targetX += this.possession === "away" ? -300 : 100;
          }
          
          targetX = Math.max(50, Math.min(LOGIC_W - 50, targetX));
          p.worldX += (targetX - p.worldX) * 0.025;

          const sx = this.getScreenX(p.worldX, p.worldY);
          const sy = this.getScreenY(p.worldY);
          p.container.setPosition(sx, sy);
          
          const pScale = 0.65 + (p.worldY / LOGIC_H) * 0.65;
          p.container.setScale(pScale);
          p.container.setDepth(100 + p.worldY);
        });

        EventBus.emit("ultimate-update", this.ultimateCharge);

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
      loop: true
    });

    EventBus.emit("current-scene-ready", this);
  }

  private drawPitch() {
    const { screenW, screenH } = this;
    const g = this.add.graphics();
    g.fillGradientStyle(0x060c1a, 0x060c1a, 0x0a162d, 0x0a162d, 1);
    g.fillRect(0, 0, screenW, screenH);

    const getX = (wx: number, wy: number) => this.getScreenX(wx, wy);
    const getY = (wy: number) => this.getScreenY(wy);

    for (let i = 0; i < 10; i++) {
        g.fillStyle(i % 2 === 0 ? 0x0e1c3a : 0x0a162d, 0.4);
        const yS = i * (LOGIC_H / 10), yE = (i + 1) * (LOGIC_H / 10);
        const points = [
          new Phaser.Math.Vector2(getX(0, yS), getY(yS)),
          new Phaser.Math.Vector2(getX(LOGIC_W, yS), getY(yS)),
          new Phaser.Math.Vector2(getX(LOGIC_W, yE), getY(yE)),
          new Phaser.Math.Vector2(getX(0, yE), getY(yE))
        ];
        g.fillPoints(points, true);
    }

    g.lineStyle(2, 0x3b82f6, 0.3);
    const borderPoints = [
      new Phaser.Math.Vector2(getX(20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W-20, 20), getY(20)),
      new Phaser.Math.Vector2(getX(LOGIC_W-20, LOGIC_H-20), getY(LOGIC_H-20)),
      new Phaser.Math.Vector2(getX(20, LOGIC_H-20), getY(LOGIC_H-20))
    ];
    g.strokePoints(borderPoints, true);

    g.lineBetween(getX(LOGIC_W/2, 20), getY(20), getX(LOGIC_W/2, LOGIC_H-20), getY(LOGIC_H-20));
    
    g.beginPath();
    for(let a=0; a<=Math.PI*2; a+=0.2) {
        const px = getX(LOGIC_W/2 + Math.cos(a)*120, LOGIC_H/2 + Math.sin(a)*80);
        const py = getY(LOGIC_H/2 + Math.sin(a)*80);
        if(a===0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();

    g.lineStyle(6, 0x60a5fa, 0.8);
    const goalY1 = LOGIC_H/2 - 80, goalY2 = LOGIC_H/2 + 80;
    g.lineBetween(getX(20, goalY1), getY(goalY1), getX(20, goalY2), getY(goalY2));
    g.lineBetween(getX(LOGIC_W-20, goalY1), getY(goalY1), getX(LOGIC_W-20, goalY2), getY(goalY2));

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
    this.playerMap.forEach(p => p.container.destroy());
    this.playerMap.clear();

    const createTeam = (roster: PlayerDefinition[], isHome: boolean) => {
      roster.forEach((p, idx) => {
        const uniqueId = `${isHome ? 'home' : 'away'}-${p.id}`;
        this.playerDefs.set(uniqueId, p);

        const isGK = p.roleTags.includes("goalkeeper");
        const isDEF = p.roleTags.includes("defender");
        const isATK = p.roleTags.includes("attacker");

        let wx: number, wy: number;
        if (isGK) { wx = isHome ? 80 : LOGIC_W - 80; wy = LOGIC_H / 2; }
        else if (isDEF) { wx = isHome ? 260 : LOGIC_W - 260; wy = LOGIC_H * (0.2 + (idx % 3) * 0.3); }
        else if (isATK) { wx = isHome ? LOGIC_W/2 - 120 : LOGIC_W/2 + 120; wy = LOGIC_H * (0.2 + (idx % 3) * 0.3); }
        else { wx = isHome ? LOGIC_W/2 - 250 : LOGIC_W/2 + 250; wy = LOGIC_H * (0.25 + (idx % 3) * 0.25); }

        const container = this.add.container(this.getScreenX(wx, wy), this.getScreenY(wy));
        const tierColor = { bronze: 0xcd7f32, silver: 0xc0c0c0, gold: 0xffd700, legendary: 0xa855f7 }[p.tier] || 0xffffff;
        
        const shadow = this.add.ellipse(0, 35, 40, 15, 0x000000, 0.4);
        const cardWidth = 50, cardHeight = 70;
        const card = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x111827, 0.95).setStrokeStyle(2.5, isHome ? 0x6366f1 : 0xf43f5e, 1);
        const portrait = this.add.image(0, -10, `portrait-${p.portrait}`).setDisplaySize(42, 42);
        
        const role = isGK ? "GK" : isDEF ? "DF" : isATK ? "AT" : "MD";
        const roleBg = this.add.circle(-cardWidth/2+10, -cardHeight/2+10, 8, 0x1f2937, 1).setStrokeStyle(1, 0xffffff, 0.3);
        const roleText = this.add.text(-cardWidth/2+10, -cardHeight/2+10, role, { fontSize: "7px", fontWeight: "bold", color: "#ffffff" }).setOrigin(0.5);

        const nameLabelBg = this.add.rectangle(0, 25, cardWidth-10, 12, 0x000000, 0.6);
        const nameText = this.add.text(0, 25, p.name.split(' ')[0], { fontSize: "8px", color: "#ffffff" }).setOrigin(0.5);
        const indicator = this.add.circle(cardWidth/2 - 6, -cardHeight/2 + 6, 6, isHome ? 0x6366f1 : 0xf43f5e, 1).setStrokeStyle(1.5, 0xffffff, 1);
        
        container.add([shadow, card, portrait, roleBg, roleText, nameLabelBg, nameText, indicator]);
        this.playerMap.set(uniqueId, { container, card, worldX: wx, worldY: wy, baseX: wx, baseY: wy, isHome, isMoving: false });
      });
    };

    createTeam(data.homeRoster, true);
    createTeam(data.awayRoster, false);
    this.ballWorldX = LOGIC_W / 2; this.ballWorldY = LOGIC_H / 2;
  }

  private onMatchEvent(event: MatchEvent) {
    const actorId = event.actorId ? (this.playerMap.has(`home-${event.actorId}`) ? `home-${event.actorId}` : `away-${event.actorId}`) : null;
    const targetId = event.targetId ? (this.playerMap.has(`home-${event.targetId}`) ? `home-${event.targetId}` : `away-${event.targetId}`) : null;

    const actor = actorId ? this.playerMap.get(actorId) : null;
    const target = targetId ? this.playerMap.get(targetId) : null;

    if(actor) this.tweens.killTweensOf(actor);
    
    if (event.team === "home" && ["pass", "dribble", "save", "goal"].includes(event.type)) {
        this.ultimateCharge = Math.min(100, this.ultimateCharge + (event.type === "goal" ? 25 : 5));
    }

    switch (event.type) {
      case "kickoff":
        try { this.sound.play('whistle'); } catch(e){}
        this.ballWorldX = LOGIC_W/2; this.ballWorldY = LOGIC_H/2;
        this.possession = event.team;
        break;
      case "pass":
        if (actor && target) {
          this.possession = event.team;
          this.tweens.add({ targets: this, ballWorldX: target.worldX, ballWorldY: target.worldY, duration: 400, ease: "Sine.easeOut" });
        }
        break;
      case "dribble":
      case "possession_change":
        if (actor) {
            this.possession = event.team;
            this.tweens.add({ targets: this, ballWorldX: actor.worldX, ballWorldY: actor.worldY, duration: 300 });
        }
        break;
      case "save":
        try { this.sound.play('save'); } catch(e){}
        if (actor && target) {
            const sDef = this.playerDefs.get(targetId!);
            const kDef = this.playerDefs.get(actorId!);
            if (sDef && kDef) this.showClash(sDef, kDef, "GRANDE PARATA!");
            this.tweens.add({ targets: this, ballWorldX: actor.worldX + (actor.isHome ? 100 : -100), ballWorldY: LOGIC_H/2, duration: 450 });
        }
        break;
      case "goal":
        try { this.sound.play('goal'); } catch(e){}
        const isHome = event.team === "home";
        this.tweens.add({ targets: this, ballWorldX: isHome ? LOGIC_W - 20 : 20, ballWorldY: LOGIC_H/2, duration: 500 });
        const scorer = actorId ? this.playerDefs.get(actorId) : null;
        if (scorer) this.showClash(scorer, null as any, "GOL STREPITOSO!");
        this.time.delayedCall(500, () => this.cameras.main.shake(400, 0.02));
        break;
    }
  }

  private showClash(p1: PlayerDefinition, p2: PlayerDefinition | null, title: string) {
    const { screenW, screenH } = this;
    const overlay = this.add.rectangle(0, 0, screenW, screenH, 0x000000, 0.8).setOrigin(0).setDepth(2000).setAlpha(0);
    const container = this.add.container(screenW/2, screenH/2).setDepth(2001).setScale(0);

    const titleText = this.add.text(0, -100, title, { fontSize: "32px", color: "#fbbf24" }).setOrigin(0.5).setStroke("#000000", 6);
    container.add(titleText);

    const createLargeCard = (p: PlayerDefinition, x: number, color: number) => {
        const card = this.add.container(x, 0);
        const body = this.add.rectangle(0, 0, 140, 200, 0x1f2937, 1).setStrokeStyle(4, color, 1);
        const portrait = this.add.image(0, -20, `portrait-${p.portrait}`).setDisplaySize(120, 120);
        const name = this.add.text(0, 70, p.name.toUpperCase(), { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
        card.add([body, portrait, name]);
        return card;
    };

    container.add(createLargeCard(p1, p2 ? -90 : 0, 0x6366f1));
    if (p2) container.add(createLargeCard(p2, 90, 0xf43f5e));

    this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });
    this.tweens.add({ targets: container, scale: 1, duration: 400, ease: "Back.easeOut", onComplete: () => {
        this.time.delayedCall(1600, () => {
            this.tweens.add({ targets: [overlay, container], alpha: 0, duration: 300, onComplete: () => {
                overlay.destroy(); container.destroy();
            }});
        });
    }});
  }

  private onMatchFinished() {
    try { this.sound.play('whistle'); } catch(e){}
    this.cameras.main.flash(500, 255, 255, 255);
    this.time.delayedCall(500, () => this.cameras.main.fade(1500, 5, 10, 20));
  }
}
