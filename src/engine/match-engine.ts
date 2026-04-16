import type { MatchConfig, MatchEvent, MatchPlayerStats, MatchResult, MatchTimeline, TeamStance, InterventionAction, MatchPhase } from "../types/match";
import type { PlayerDefinition } from "../types/player";
import { SeededRandom } from "./random";
import { getPlaystyle } from "../content/playstyles";
import { calculateTeamPower, resolveMidfieldBattle, resolveAttack } from "./resolvers";

export class MatchEngine {
  private config: MatchConfig;
  private random: SeededRandom;
  private homeRoster: PlayerDefinition[];
  private awayRoster: PlayerDefinition[];

  private currentTick: number = 0;
  private currentPhase: MatchPhase = "kickoff";
  private possession: "home" | "away" = "home";

  private homeScore: number = 0;
  private awayScore: number = 0;

  private events: MatchEvent[] = [];
  private playerStats: Record<string, MatchPlayerStats> = {};

  constructor(
    config: MatchConfig,
    homeRoster: PlayerDefinition[],
    awayRoster: PlayerDefinition[]
  ) {
    this.config = config;
    this.random = new SeededRandom(config.seed);
    this.homeRoster = homeRoster;
    this.awayRoster = awayRoster;

    [...homeRoster, ...awayRoster].forEach((p) => {
      this.playerStats[p.id] = {
        playerId: p.id,
        goals: 0,
        assists: 0,
        shots: 0,
        passes: 0,
        tackles: 0,
        saves: 0,
        abilitiesUsed: 0,
        rating: 6.0,
      };
    });

    // Start with a kickoff event
    this.addEvent("kickoff", "home", null, null, {});
  }

  public tick(): MatchEvent[] {
    if (this.currentPhase === "finished") return [];

    const startingEventsCount = this.events.length;
    this.currentTick++;

    if (this.currentTick === this.config.halftimeTick) {
      this.currentPhase = "halftime";
      this.addEvent("halftime", "home", null, null, {});
    } else if (this.currentTick > this.config.totalTicks) {
      this.currentPhase = "finished";
      this.addEvent("full_time", "home", null, null, { homeScore: this.homeScore, awayScore: this.awayScore });
      return this.events.slice(startingEventsCount);
    } else if (this.currentPhase === "halftime") {
      this.currentPhase = "open_play";
      this.possession = "away"; // Away gets kickoff second half
      this.addEvent("kickoff", "away", null, null, {});
    } else if (this.currentPhase === "kickoff") {
      this.currentPhase = "open_play";
    } else if (this.currentPhase === "open_play") {
      this.processOpenPlay();
    } else if (this.currentPhase === "attack") {
      this.processAttack();
    }

    return this.events.slice(startingEventsCount);
  }

  private processOpenPlay() {
    const homeStyle = getPlaystyle(this.config.homePlaystyle);
    const awayStyle = getPlaystyle(this.config.awayPlaystyle);

    const homePower = calculateTeamPower(this.homeRoster, homeStyle?.modifiers || { possessionBias: 0, pressIntensity: 0, counterSpeed: 0, defenseLine: 0, passingTempo: 0 });
    const awayPower = calculateTeamPower(this.awayRoster, awayStyle?.modifiers || { possessionBias: 0, pressIntensity: 0, counterSpeed: 0, defenseLine: 0, passingTempo: 0 });

    // Ensure we adjust stats based on stance
    this.applyStanceModifier(homePower, this.config.homeStance);
    this.applyStanceModifier(awayPower, this.config.awayStance);

    const possessionPower = this.possession === "home" ? homePower : awayPower;
    const defendingPower = this.possession === "home" ? awayPower : homePower;

    const possessionTeam = this.possession === "home" ? this.homeRoster : this.awayRoster;
    const defendingTeam = this.possession === "home" ? this.awayRoster : this.homeRoster;

    const outcome = resolveMidfieldBattle(possessionPower, defendingPower, this.random);

    if (outcome === "lose") {
      // Tackle by defender, ball turned over
      const tackler = this.random.pick(defendingTeam.filter(p => !p.roleTags.includes("goalkeeper")));
      const loser = this.random.pick(possessionTeam.filter(p => !p.roleTags.includes("goalkeeper")));
      
      this.playerStats[tackler.id].tackles++;
      this.possession = this.possession === "home" ? "away" : "home";
      
      this.addEvent("tackle", this.possession, tackler.id, loser.id, {});
      this.addEvent("possession_change", this.possession, tackler.id, null, {});
    } else if (outcome === "keep") {
      // Simple pass or dribble
      if (this.random.chance(0.8)) {
        const passer = this.random.pick(possessionTeam);
        const receiver = this.random.pick(possessionTeam.filter(p => p.id !== passer.id));
        this.playerStats[passer.id].passes++;
        this.addEvent("pass", this.possession, passer.id, receiver.id, {});
      } else {
        const dribbler = this.random.pick(possessionTeam);
        this.addEvent("dribble", this.possession, dribbler.id, null, {});
      }
    } else if (outcome === "attack") {
      const passer = this.random.pick(possessionTeam.filter(p => !p.roleTags.includes("goalkeeper")));
      this.playerStats[passer.id].passes++;
      this.addEvent("pass", this.possession, passer.id, null, { note: "Through ball to attack" });
      this.currentPhase = "attack";
    }
  }

  private processAttack() {
    const attackingTeam = this.possession === "home" ? this.homeRoster : this.awayRoster;
    const defendingTeam = this.possession === "home" ? this.awayRoster : this.homeRoster;

    // Pick an attacker (favor strikers/attackers)
    let attackers = attackingTeam.filter(p => p.roleTags.includes("attacker"));
    if (attackers.length === 0) attackers = attackingTeam.filter(p => !p.roleTags.includes("goalkeeper"));
    const attacker = this.random.pick(attackers);

    // Pick a defender
    let defenders = defendingTeam.filter(p => p.roleTags.includes("defender"));
    if (defenders.length === 0) defenders = defendingTeam.filter(p => !p.roleTags.includes("goalkeeper"));
    const defender = this.random.pick(defenders);

    // Find the keeper
    const keeper = defendingTeam.find(p => p.roleTags.includes("goalkeeper")) || defender;

    this.playerStats[attacker.id].shots++;

    const outcome = resolveAttack(attacker, defender, keeper, this.random);

    if (outcome === "block") {
      this.playerStats[defender.id].tackles++;
      this.addEvent("tackle", this.possession === "home" ? "away" : "home", defender.id, attacker.id, { note: "Crucial block" });
      this.possession = this.possession === "home" ? "away" : "home";
      this.currentPhase = "open_play";
    } else if (outcome === "miss") {
      this.addEvent("miss", this.possession, attacker.id, null, {});
      this.possession = this.possession === "home" ? "away" : "home";
      this.currentPhase = "open_play";
    } else if (outcome === "save") {
      this.addEvent("shot", this.possession, attacker.id, keeper.id, { location: "on_target" });
      this.playerStats[keeper.id].saves++;
      this.addEvent("save", this.possession === "home" ? "away" : "home", keeper.id, attacker.id, {});
      this.possession = this.possession === "home" ? "away" : "home";
      this.currentPhase = "open_play";
    } else if (outcome === "goal") {
      this.addEvent("shot", this.possession, attacker.id, keeper.id, { location: "on_target", quality: "excellent" });
      this.playerStats[attacker.id].goals++;
      
      if (this.possession === "home") {
        this.homeScore++;
      } else {
        this.awayScore++;
      }

      this.addEvent("goal", this.possession, attacker.id, null, { homeScore: this.homeScore, awayScore: this.awayScore });
      
      // Kickoff for the team that conceded
      this.possession = this.possession === "home" ? "away" : "home";
      this.currentPhase = "kickoff";
    }
  }

  private applyStanceModifier(power: { attack: number; defense: number; control: number }, stance: TeamStance) {
    if (stance === "aggressive") {
      power.attack *= 1.2;
      power.defense *= 0.8;
    } else if (stance === "defensive") {
      power.attack *= 0.8;
      power.defense *= 1.3;
    }
    // balanced does nothing
  }

  public intervene(team: "home" | "away", action: InterventionAction) {
    if (action.type === "stance_change") {
      if (team === "home") {
        this.config.homeStance = action.stance;
      } else {
        this.config.awayStance = action.stance;
      }
      this.addEvent("stance_change", team, null, null, { stance: action.stance });
    } else if (action.type === "command") {
      if (team === "home") {
        this.config.homeCommand = action.command;
      } else {
        this.config.awayCommand = action.command;
      }
      this.addEvent("command_issued", team, null, null, { command: action.command });
    } else if (action.type === "ultimate") {
      const pId = action.playerId;
      if (this.playerStats[pId]) {
        this.playerStats[pId].abilitiesUsed++;
        this.addEvent("ultimate_used", team, pId, null, {});
      }
    }
  }

  private addEvent(
    type: MatchEvent["type"],
    team: "home" | "away",
    actorId: string | null,
    targetId: string | null,
    metadata: Record<string, unknown>
  ) {
    this.events.push({
      tick: this.currentTick,
      type,
      team,
      actorId,
      targetId,
      metadata,
    });
  }

  public getTimeline(): MatchTimeline {
    return {
      events: this.events,
      totalTicks: this.currentTick,
    };
  }

  public getResult(): { result: MatchResult; playerStats: MatchPlayerStats[] } {
    return {
      result: {
        homeScore: this.homeScore,
        awayScore: this.awayScore,
        outcome: this.homeScore > this.awayScore ? "win" : this.homeScore < this.awayScore ? "loss" : "draw",
      },
      playerStats: Object.values(this.playerStats),
    };
  }

  public getState() {
    return {
      tick: this.currentTick,
      phase: this.currentPhase,
      possession: this.possession,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
    };
  }
}
