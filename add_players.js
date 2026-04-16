const fs = require('fs');
const filePath = 'src/content/players.ts';
let content = fs.readFileSync(filePath, 'utf8');

const newPlayers = `
  // --- NEW GOALKEEPERS ---
  {
    id: "goliath",
    name: "Goliath",
    archetype: "keeper",
    roleTags: ["goalkeeper"],
    tier: "gold",
    stats: { pace: 25, shooting: 10, passing: 40, defense: 80, physical: 95, goalkeeping: 85 },
    passive: { id: "goliath-passive", name: "Colossus", description: "Takes up massive space, reducing long shot accuracy.", trigger: "always", effect: { type: "stat_boost", stat: "goalkeeping", magnitude: 15, durationTicks: 0 } },
    activeSkill: { id: "goliath-active", name: "Intimidate", description: "Lowers attacker's shooting stat momentarily.", cooldownTicks: 35, target: "enemy", effect: { type: "disrupt", magnitude: 30, durationTicks: 5 } },
    ultimate: { id: "goliath-ult", name: "Brick Wall", description: "Blocks everything for the next 5 seconds.", chargeRequired: 65, effect: { type: "stat_boost", stat: "goalkeeping", magnitude: 50, durationTicks: 5 } },
    portrait: "goliath", flavorText: "You don't shoot past Goliath. You bounce off him."
  },
  {
    id: "viper",
    name: "Viper",
    archetype: "keeper",
    roleTags: ["goalkeeper"],
    tier: "epico",
    stats: { pace: 65, shooting: 15, passing: 60, defense: 50, physical: 55, goalkeeping: 92 },
    passive: { id: "viper-passive", name: "Reflex", description: "Massive boost against close range shots.", trigger: "on_defense", effect: { type: "stat_boost", stat: "goalkeeping", magnitude: 20, durationTicks: 0 } },
    activeSkill: { id: "viper-active", name: "Strike", description: "Aggressive clearance that functions as a perfect lob pass.", cooldownTicks: 25, target: "ally", effect: { type: "stat_boost", stat: "passing", magnitude: 40, durationTicks: 3 } },
    ultimate: { id: "viper-ult", name: "Venom Catch", description: "Catches the ball and poisons the striker's stamina.", chargeRequired: 55, effect: { type: "disrupt", magnitude: 40, durationTicks: 10 } },
    portrait: "viper", flavorText: "Fastest hands in the league."
  },

  // --- NEW DEFENDERS ---
  {
    id: "rampart",
    name: "Rampart",
    archetype: "enforcer",
    roleTags: ["defender"],
    tier: "bronze",
    stats: { pace: 35, shooting: 20, passing: 30, defense: 75, physical: 85, goalkeeping: 5 },
    passive: { id: "p-rmp", name: "Barricade", description: "Slows down opponents.", trigger: "on_defense", effect: { type: "disrupt", magnitude: 10, durationTicks: 0 } },
    activeSkill: { id: "a-rmp", name: "Block", description: "Blocks a pass.", cooldownTicks: 20, target: "enemy", effect: { type: "disrupt", magnitude: 20, durationTicks: 3 } },
    ultimate: { id: "u-rmp", name: "Hold the Line", description: "Massive def boost.", chargeRequired: 50, effect: { type: "stat_boost", stat: "defense", magnitude: 30, durationTicks: 5 } },
    portrait: "rampart", flavorText: "None shall pass."
  },
  {
    id: "oracle",
    name: "Oracle",
    archetype: "specialist",
    roleTags: ["defender"],
    tier: "silver",
    stats: { pace: 65, shooting: 30, passing: 75, defense: 85, physical: 50, goalkeeping: 5 },
    passive: { id: "p-orc", name: "Foresight", description: "Boost pass interception.", trigger: "always", effect: { type: "stat_boost", stat: "defense", magnitude: 15, durationTicks: 0 } },
    activeSkill: { id: "a-orc", name: "Read", description: "Predict enemy run.", cooldownTicks: 30, target: "self", effect: { type: "stat_boost", stat: "defense", magnitude: 25, durationTicks: 3 } },
    ultimate: { id: "u-orc", name: "All Seeing", description: "Intercepts any ball.", chargeRequired: 60, effect: { type: "disrupt", magnitude: 50, durationTicks: 5 } },
    portrait: "oracle", flavorText: "He already knows where you'll pass."
  },
  {
    id: "avalanche",
    name: "Avalanche",
    archetype: "enforcer",
    roleTags: ["defender"],
    tier: "gold",
    stats: { pace: 55, shooting: 40, passing: 45, defense: 80, physical: 95, goalkeeping: 5 },
    passive: { id: "p-ava", name: "Snowball", description: "Gets stronger as possession increases.", trigger: "on_defense", effect: { type: "stat_boost", stat: "physical", magnitude: 10, durationTicks: 0 } },
    activeSkill: { id: "a-ava", name: "Slide", description: "Tackle.", cooldownTicks: 25, target: "enemy", effect: { type: "disrupt", magnitude: 30, durationTicks: 2 } },
    ultimate: { id: "u-ava", name: "Landslide", description: "Clears area.", chargeRequired: 50, effect: { type: "disrupt", magnitude: 45, durationTicks: 4 } },
    portrait: "avalanche", flavorText: "Brute force."
  },
  {
    id: "zenith",
    name: "Zenith",
    archetype: "specialist",
    roleTags: ["defender"],
    tier: "epico",
    stats: { pace: 95, shooting: 35, passing: 60, defense: 88, physical: 65, goalkeeping: 5 },
    passive: { id: "p-zen", name: "High Altitude", description: "Fast recovery.", trigger: "always", effect: { type: "stat_boost", stat: "pace", magnitude: 10, durationTicks: 0 } },
    activeSkill: { id: "a-zen", name: "Sprint", description: "Catch up.", cooldownTicks: 20, target: "self", effect: { type: "stat_boost", stat: "pace", magnitude: 40, durationTicks: 3 } },
    ultimate: { id: "u-zen", name: "Peak", description: "Godly def.", chargeRequired: 55, effect: { type: "stat_boost", stat: "defense", magnitude: 50, durationTicks: 5 } },
    portrait: "zenith", flavorText: "Pace abuse."
  },

  // --- NEW MIDFIELDERS ---
  {
    id: "maestro",
    name: "Maestro",
    archetype: "playmaker",
    roleTags: ["midfielder"],
    tier: "gold",
    stats: { pace: 50, shooting: 70, passing: 98, defense: 30, physical: 45, goalkeeping: 5 },
    passive: { id: "p-mae", name: "Conduct", description: "Boost ally finishing.", trigger: "on_possession", effect: { type: "stat_boost", stat: "shooting", magnitude: 15, durationTicks: 0 } },
    activeSkill: { id: "a-mae", name: "Baton", description: "Perfect pass.", cooldownTicks: 20, target: "ally", effect: { type: "stat_boost", stat: "shooting", magnitude: 25, durationTicks: 3 } },
    ultimate: { id: "u-mae", name: "Symphony", description: "Boost whole team.", chargeRequired: 65, effect: { type: "stat_boost", stat: "passing", magnitude: 40, durationTicks: 10 } },
    portrait: "maestro", flavorText: "Art."
  },
  {
    id: "chronos",
    name: "Chronos",
    archetype: "playmaker",
    roleTags: ["midfielder"],
    tier: "epico",
    stats: { pace: 60, shooting: 50, passing: 90, defense: 70, physical: 65, goalkeeping: 5 },
    passive: { id: "p-chr", name: "Time", description: "Slow enemy pace.", trigger: "always", effect: { type: "disrupt", magnitude: 10, durationTicks: 0 } },
    activeSkill: { id: "a-chr", name: "Rewind", description: "Recovers error.", cooldownTicks: 40, target: "self", effect: { type: "stat_boost", stat: "control", magnitude: 30, durationTicks: 2 } },
    ultimate: { id: "u-chr", name: "Stop Time", description: "Freeze enemies.", chargeRequired: 70, effect: { type: "disrupt", magnitude: 80, durationTicks: 5 } },
    portrait: "chronos", flavorText: "Tick tock."
  },
  {
    id: "nova",
    name: "Nova",
    archetype: "specialist",
    roleTags: ["hybrid"],
    tier: "silver",
    stats: { pace: 85, shooting: 80, passing: 75, defense: 40, physical: 60, goalkeeping: 5 },
    passive: { id: "p-nov", name: "Stardust", description: "Pace boost.", trigger: "on_possession", effect: { type: "stat_boost", stat: "pace", magnitude: 15, durationTicks: 0 } },
    activeSkill: { id: "a-nov", name: "Flare", description: "Dribble past.", cooldownTicks: 25, target: "self", effect: { type: "stat_boost", stat: "pace", magnitude: 30, durationTicks: 3 } },
    ultimate: { id: "u-nov", name: "Supernova", description: "Massive explosive shot.", chargeRequired: 55, effect: { type: "stat_boost", stat: "shooting", magnitude: 50, durationTicks: 4 } },
    portrait: "nova", flavorText: "Explosive."
  },
  {
    id: "mirage",
    name: "Mirage",
    archetype: "specialist",
    roleTags: ["midfielder"],
    tier: "bronze",
    stats: { pace: 80, shooting: 60, passing: 70, defense: 20, physical: 40, goalkeeping: 5 },
    passive: { id: "p-mir", name: "Illusion", description: "Evade tackles.", trigger: "always", effect: { type: "special", magnitude: 15, durationTicks: 0 } },
    activeSkill: { id: "a-mir", name: "Clone", description: "Confuse def.", cooldownTicks: 30, target: "enemy", effect: { type: "disrupt", magnitude: 25, durationTicks: 3 } },
    ultimate: { id: "u-mir", name: "Desert Sun", description: "Unstoppable run.", chargeRequired: 50, effect: { type: "stat_boost", stat: "pace", magnitude: 50, durationTicks: 6 } },
    portrait: "mirage", flavorText: "You can't catch a shadow."
  },

  // --- NEW ATTACKERS ---
  {
    id: "sniper",
    name: "Sniper",
    archetype: "striker",
    roleTags: ["attacker"],
    tier: "gold",
    stats: { pace: 40, shooting: 99, passing: 50, defense: 10, physical: 60, goalkeeping: 5 },
    passive: { id: "p-snp", name: "Scope", description: "Always on target.", trigger: "always", effect: { type: "stat_boost", stat: "shooting", magnitude: 20, durationTicks: 0 } },
    activeSkill: { id: "a-snp", name: "Aim", description: "Prepare shot.", cooldownTicks: 25, target: "self", effect: { type: "stat_boost", stat: "shooting", magnitude: 30, durationTicks: 2 } },
    ultimate: { id: "u-snp", name: "Headshot", description: "Guaranteed goal.", chargeRequired: 60, effect: { type: "stat_boost", stat: "shooting", magnitude: 100, durationTicks: 3 } },
    portrait: "sniper", flavorText: "One shot, one goal."
  },
  {
    id: "juggernaut",
    name: "Juggernaut",
    archetype: "striker",
    roleTags: ["attacker"],
    tier: "silver",
    stats: { pace: 60, shooting: 80, passing: 40, defense: 40, physical: 99, goalkeeping: 5 },
    passive: { id: "p-jug", name: "Momentum", description: "Cannot be pushed.", trigger: "always", effect: { type: "stat_boost", stat: "physical", magnitude: 20, durationTicks: 0 } },
    activeSkill: { id: "a-jug", name: "Charge", description: "Bulldoze.", cooldownTicks: 30, target: "enemy", effect: { type: "disrupt", magnitude: 40, durationTicks: 3 } },
    ultimate: { id: "u-jug", name: "Wrecking Ball", description: "Destroys def line.", chargeRequired: 55, effect: { type: "stat_boost", stat: "physical", magnitude: 50, durationTicks: 5 } },
    portrait: "juggernaut", flavorText: "Unstoppable force."
  },
  {
    id: "venom",
    name: "Venom",
    archetype: "striker",
    roleTags: ["hybrid"],
    tier: "epico",
    stats: { pace: 88, shooting: 78, passing: 65, defense: 30, physical: 50, goalkeeping: 5 },
    passive: { id: "p-ven", name: "Toxic", description: "Reduce def stats.", trigger: "always", effect: { type: "disrupt", magnitude: 15, durationTicks: 0 } },
    activeSkill: { id: "a-ven", name: "Bite", description: "Steal ball.", cooldownTicks: 20, target: "enemy", effect: { type: "disrupt", magnitude: 30, durationTicks: 2 } },
    ultimate: { id: "u-ven", name: "Plague", description: "Team debuff.", chargeRequired: 60, effect: { type: "disrupt", magnitude: 60, durationTicks: 8 } },
    portrait: "venom", flavorText: "Lethal dose."
  },
  {
    id: "apex",
    name: "Apex",
    archetype: "striker",
    roleTags: ["attacker"],
    tier: "bronze",
    stats: { pace: 90, shooting: 85, passing: 30, defense: 20, physical: 65, goalkeeping: 5 },
    passive: { id: "p-apx", name: "Predator", description: "Better in box.", trigger: "always", effect: { type: "stat_boost", stat: "shooting", magnitude: 10, durationTicks: 0 } },
    activeSkill: { id: "a-apx", name: "Pounce", description: "Fast tap in.", cooldownTicks: 25, target: "self", effect: { type: "stat_boost", stat: "pace", magnitude: 25, durationTicks: 2 } },
    ultimate: { id: "u-apx", name: "Apex Predator", description: "Unmatched run.", chargeRequired: 50, effect: { type: "stat_boost", stat: "shooting", magnitude: 40, durationTicks: 4 } },
    portrait: "apex", flavorText: "Top of the food chain."
  }
];
`;

content = content.replace('];\n', newPlayers + '\n];\n');
fs.writeFileSync(filePath, content);
console.log('Players injected');
