import type { PlayerDefinition } from "@/types/player";

export const STARTER_PLAYERS: PlayerDefinition[] = [
  // --- SERIE A IMPORT START ---
  {
    "id": "sa-gk-mike-maignan",
    "name": "MIKE MAIGNAN",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "legendary",
    "stats": {
        "pace": 45,
        "shooting": 10,
        "passing": 81,
        "defense": 81,
        "physical": 106,
        "goalkeeping": 111
    },
    "passive": {
        "id": "p-mike-maignan",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 30,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-mike-maignan",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 40,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-mike-maignan",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 80,
            "durationTicks": 6
        }
    },
    "portrait": "gk_mike_maignan",
    "flavorText": "A star from Serie A, MIKE MAIGNAN brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-marco-carnesecchi",
    "name": "MARCO CARNESECCHI",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "silver",
    "stats": {
        "pace": 37,
        "shooting": 10,
        "passing": 72,
        "defense": 81,
        "physical": 65,
        "goalkeeping": 88
    },
    "passive": {
        "id": "p-marco-carnesecchi",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 18,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-marco-carnesecchi",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 24,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-marco-carnesecchi",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 48,
            "durationTicks": 6
        }
    },
    "portrait": "gk_marco_carnesecchi",
    "flavorText": "A star from Serie A, MARCO CARNESECCHI brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-savic-milinkovic-vanja",
    "name": "SAVIC MILINKOVIC VANJA",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "silver",
    "stats": {
        "pace": 45,
        "shooting": 10,
        "passing": 47,
        "defense": 62,
        "physical": 83,
        "goalkeeping": 83
    },
    "passive": {
        "id": "p-savic-milinkovic-vanja",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 18,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-savic-milinkovic-vanja",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 24,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-savic-milinkovic-vanja",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 48,
            "durationTicks": 6
        }
    },
    "portrait": "gk_savic_milinkovic_vanja",
    "flavorText": "A star from Serie A, SAVIC MILINKOVIC VANJA brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-gregorio-di-michele",
    "name": "GREGORIO DI MICHELE",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 31,
        "shooting": 10,
        "passing": 66,
        "defense": 63,
        "physical": 74,
        "goalkeeping": 66
    },
    "passive": {
        "id": "p-gregorio-di-michele",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 15,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-gregorio-di-michele",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 20,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-gregorio-di-michele",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 40,
            "durationTicks": 6
        }
    },
    "portrait": "gk_gregorio_di_michele",
    "flavorText": "A star from Serie A, GREGORIO DI MICHELE brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-wladimiro-falcone",
    "name": "WLADIMIRO FALCONE",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "silver",
    "stats": {
        "pace": 54,
        "shooting": 10,
        "passing": 72,
        "defense": 67,
        "physical": 82,
        "goalkeeping": 86
    },
    "passive": {
        "id": "p-wladimiro-falcone",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 18,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-wladimiro-falcone",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 24,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-wladimiro-falcone",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 48,
            "durationTicks": 6
        }
    },
    "portrait": "gk_wladimiro_falcone",
    "flavorText": "A star from Serie A, WLADIMIRO FALCONE brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-gea-de-david",
    "name": "GEA DE DAVID",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "gold",
    "stats": {
        "pace": 52,
        "shooting": 10,
        "passing": 57,
        "defense": 74,
        "physical": 83,
        "goalkeeping": 88
    },
    "passive": {
        "id": "p-gea-de-david",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 22.5,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-gea-de-david",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 30,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-gea-de-david",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 60,
            "durationTicks": 6
        }
    },
    "portrait": "gk_gea_de_david",
    "flavorText": "A star from Serie A, GEA DE DAVID brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-jean-butez",
    "name": "JEAN BUTEZ",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 33,
        "shooting": 10,
        "passing": 68,
        "defense": 56,
        "physical": 58,
        "goalkeeping": 65
    },
    "passive": {
        "id": "p-jean-butez",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 15,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-jean-butez",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 20,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-jean-butez",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 40,
            "durationTicks": 6
        }
    },
    "portrait": "gk_jean_butez",
    "flavorText": "A star from Serie A, JEAN BUTEZ brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-mile-svilar",
    "name": "MILE SVILAR",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "silver",
    "stats": {
        "pace": 39,
        "shooting": 10,
        "passing": 73,
        "defense": 70,
        "physical": 67,
        "goalkeeping": 80
    },
    "passive": {
        "id": "p-mile-svilar",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 18,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-mile-svilar",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 24,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-mile-svilar",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 48,
            "durationTicks": 6
        }
    },
    "portrait": "gk_mile_svilar",
    "flavorText": "A star from Serie A, MILE SVILAR brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-arijanet-muric",
    "name": "ARIJANET MURIC",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "silver",
    "stats": {
        "pace": 53,
        "shooting": 10,
        "passing": 56,
        "defense": 73,
        "physical": 85,
        "goalkeeping": 85
    },
    "passive": {
        "id": "p-arijanet-muric",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 18,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-arijanet-muric",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 24,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-arijanet-muric",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 48,
            "durationTicks": 6
        }
    },
    "portrait": "gk_arijanet_muric",
    "flavorText": "A star from Serie A, ARIJANET MURIC brings tactical excellence to the pitch."
},
  {
    "id": "sa-gk-maduka-okoye",
    "name": "MADUKA OKOYE",
    "archetype": "keeper",
    "roleTags": [
        "goalkeeper"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 49,
        "shooting": 10,
        "passing": 50,
        "defense": 74,
        "physical": 67,
        "goalkeeping": 67
    },
    "passive": {
        "id": "p-maduka-okoye",
        "name": "Cat-like Reflexes",
        "description": "Improved save chance in 1v1s.",
        "trigger": "on_defense",
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 15,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-maduka-okoye",
        "name": "Quick Launch",
        "description": "Accurate long kick to strikers.",
        "cooldownTicks": 25,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 20,
            "durationTicks": 3
        }
    },
    "ultimate": {
        "id": "u-maduka-okoye",
        "name": "Zone of Silence",
        "description": "Becomes unbeatable for a short time.",
        "chargeRequired": 60,
        "effect": {
            "type": "stat_boost",
            "stat": "goalkeeping",
            "magnitude": 40,
            "durationTicks": 6
        }
    },
    "portrait": "gk_maduka_okoye",
    "flavorText": "A star from Serie A, MADUKA OKOYE brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-federico-dimarco",
    "name": "FEDERICO DIMARCO",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "legendary",
    "stats": {
        "pace": 68,
        "shooting": 30,
        "passing": 61,
        "defense": 100,
        "physical": 90,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-federico-dimarco",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 20,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-federico-dimarco",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 50,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-federico-dimarco",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 70,
            "durationTicks": 10
        }
    },
    "portrait": "def_federico_dimarco",
    "flavorText": "A star from Serie A, FEDERICO DIMARCO brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-pierre-kalulu",
    "name": "PIERRE KALULU",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "silver",
    "stats": {
        "pace": 82,
        "shooting": 24,
        "passing": 67.33333333333333,
        "defense": 78,
        "physical": 68,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-pierre-kalulu",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-pierre-kalulu",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 30,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-pierre-kalulu",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 42,
            "durationTicks": 10
        }
    },
    "portrait": "def_pierre_kalulu",
    "flavorText": "A star from Serie A, PIERRE KALULU brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-andrea-cambiaso",
    "name": "ANDREA CAMBIASO",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 50,
        "shooting": 36,
        "passing": 50,
        "defense": 67,
        "physical": 57,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-andrea-cambiaso",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 10,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-andrea-cambiaso",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 25,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-andrea-cambiaso",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 35,
            "durationTicks": 10
        }
    },
    "portrait": "def_andrea_cambiaso",
    "flavorText": "A star from Serie A, ANDREA CAMBIASO brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-carlos-augusto",
    "name": "CARLOS AUGUSTO",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "silver",
    "stats": {
        "pace": 58,
        "shooting": 32,
        "passing": 59.333333333333336,
        "defense": 79,
        "physical": 69,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-carlos-augusto",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-carlos-augusto",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 30,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-carlos-augusto",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 42,
            "durationTicks": 10
        }
    },
    "portrait": "def_carlos_augusto",
    "flavorText": "A star from Serie A, CARLOS AUGUSTO brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-lorenzo-di-giovanni",
    "name": "LORENZO DI GIOVANNI",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "silver",
    "stats": {
        "pace": 71,
        "shooting": 27,
        "passing": 64.33333333333333,
        "defense": 94,
        "physical": 84,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-lorenzo-di-giovanni",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-lorenzo-di-giovanni",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 30,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-lorenzo-di-giovanni",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 42,
            "durationTicks": 10
        }
    },
    "portrait": "def_lorenzo_di_giovanni",
    "flavorText": "A star from Serie A, LORENZO DI GIOVANNI brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-davide-zappacosta",
    "name": "DAVIDE ZAPPACOSTA",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "gold",
    "stats": {
        "pace": 60,
        "shooting": 38,
        "passing": 60.666666666666664,
        "defense": 89,
        "physical": 79,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-davide-zappacosta",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 15,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-davide-zappacosta",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 37.5,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-davide-zappacosta",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 52.5,
            "durationTicks": 10
        }
    },
    "portrait": "def_davide_zappacosta",
    "flavorText": "A star from Serie A, DAVIDE ZAPPACOSTA brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-marin-pongracic",
    "name": "MARIN PONGRACIC",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "silver",
    "stats": {
        "pace": 57,
        "shooting": 20,
        "passing": 48.333333333333336,
        "defense": 77,
        "physical": 67,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-marin-pongracic",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-marin-pongracic",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 30,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-marin-pongracic",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 42,
            "durationTicks": 10
        }
    },
    "portrait": "def_marin_pongracic",
    "flavorText": "A star from Serie A, MARIN PONGRACIC brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-marcus-pedersen",
    "name": "MARCUS PEDERSEN",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "silver",
    "stats": {
        "pace": 66,
        "shooting": 21,
        "passing": 69.33333333333333,
        "defense": 78,
        "physical": 68,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-marcus-pedersen",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-marcus-pedersen",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 30,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-marcus-pedersen",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 42,
            "durationTicks": 10
        }
    },
    "portrait": "def_marcus_pedersen",
    "flavorText": "A star from Serie A, MARCUS PEDERSEN brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-antonino-gallo",
    "name": "ANTONINO GALLO",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 58,
        "shooting": 39,
        "passing": 52,
        "defense": 69,
        "physical": 59,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-antonino-gallo",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 10,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-antonino-gallo",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 25,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-antonino-gallo",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 35,
            "durationTicks": 10
        }
    },
    "portrait": "def_antonino_gallo",
    "flavorText": "A star from Serie A, ANTONINO GALLO brings tactical excellence to the pitch."
},
  {
    "id": "sa-def-dodo-domilson",
    "name": "DODO' DOMILSON",
    "archetype": "guardian",
    "roleTags": [
        "defender"
    ],
    "tier": "silver",
    "stats": {
        "pace": 83,
        "shooting": 37,
        "passing": 63.333333333333336,
        "defense": 85,
        "physical": 75,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-dodo-domilson",
        "name": "Strong Tackle",
        "description": "Harder for enemies to dribble past.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-dodo-domilson",
        "name": "Slide",
        "description": "Disrupts the attacker.",
        "cooldownTicks": 30,
        "target": "enemy",
        "effect": {
            "type": "disrupt",
            "magnitude": 30,
            "durationTicks": 2
        }
    },
    "ultimate": {
        "id": "u-dodo-domilson",
        "name": "Defensive Wall",
        "description": "Boosts team defense massively.",
        "chargeRequired": 55,
        "effect": {
            "type": "stat_boost",
            "stat": "defense",
            "magnitude": 42,
            "durationTicks": 10
        }
    },
    "portrait": "def_dodo_domilson",
    "flavorText": "A star from Serie A, DODO' DOMILSON brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-nicolo-barella",
    "name": "NICOLO BARELLA'",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "legendary",
    "stats": {
        "pace": 83,
        "shooting": 63,
        "passing": 98,
        "defense": 67,
        "physical": 75,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-nicolo-barella",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 24,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-nicolo-barella",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 40,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-nicolo-barella",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 30,
            "durationTicks": 12
        }
    },
    "portrait": "mid_nicolo_barella",
    "flavorText": "A star from Serie A, NICOLO BARELLA' brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-alexis-saelemaekers",
    "name": "ALEXIS SAELEMAEKERS",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 47,
        "shooting": 55,
        "passing": 62,
        "defense": 59,
        "physical": 55,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-alexis-saelemaekers",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-alexis-saelemaekers",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 20,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-alexis-saelemaekers",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 15,
            "durationTicks": 12
        }
    },
    "portrait": "mid_alexis_saelemaekers",
    "flavorText": "A star from Serie A, ALEXIS SAELEMAEKERS brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-adrien-rabiot",
    "name": "ADRIEN RABIOT",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "silver",
    "stats": {
        "pace": 60,
        "shooting": 71.33333333333333,
        "passing": 75,
        "defense": 60.333333333333336,
        "physical": 63.333333333333336,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-adrien-rabiot",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-adrien-rabiot",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 24,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-adrien-rabiot",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 18,
            "durationTicks": 12
        }
    },
    "portrait": "mid_adrien_rabiot",
    "flavorText": "A star from Serie A, ADRIEN RABIOT brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-hakan-calhanoglu",
    "name": "HAKAN CALHANOGLU",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "silver",
    "stats": {
        "pace": 68,
        "shooting": 61.333333333333336,
        "passing": 83,
        "defense": 62.333333333333336,
        "physical": 62.333333333333336,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-hakan-calhanoglu",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-hakan-calhanoglu",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 24,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-hakan-calhanoglu",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 18,
            "durationTicks": 12
        }
    },
    "portrait": "mid_hakan_calhanoglu",
    "flavorText": "A star from Serie A, HAKAN CALHANOGLU brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-mario-pasalic",
    "name": "MARIO PASALIC",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 61,
        "shooting": 57,
        "passing": 76,
        "defense": 55,
        "physical": 55,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-mario-pasalic",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-mario-pasalic",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 20,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-mario-pasalic",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 15,
            "durationTicks": 12
        }
    },
    "portrait": "mid_mario_pasalic",
    "flavorText": "A star from Serie A, MARIO PASALIC brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-weston-mckennie",
    "name": "WESTON MCKENNIE",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "gold",
    "stats": {
        "pace": 65,
        "shooting": 66.66666666666667,
        "passing": 80,
        "defense": 55.666666666666664,
        "physical": 75.66666666666667,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-weston-mckennie",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 18,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-weston-mckennie",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 30,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-weston-mckennie",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 22.5,
            "durationTicks": 12
        }
    },
    "portrait": "mid_weston_mckennie",
    "flavorText": "A star from Serie A, WESTON MCKENNIE brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-cunha-da-lucas",
    "name": "CUNHA DA LUCAS",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "silver",
    "stats": {
        "pace": 68,
        "shooting": 61.333333333333336,
        "passing": 83,
        "defense": 47.333333333333336,
        "physical": 68.33333333333333,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-cunha-da-lucas",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-cunha-da-lucas",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 24,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-cunha-da-lucas",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 18,
            "durationTicks": 12
        }
    },
    "portrait": "mid_cunha_da_lucas",
    "flavorText": "A star from Serie A, CUNHA DA LUCAS brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-scott-mctominay",
    "name": "SCOTT MCTOMINAY",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 51,
        "shooting": 54,
        "passing": 66,
        "defense": 57,
        "physical": 72,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-scott-mctominay",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-scott-mctominay",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 20,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-scott-mctominay",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 15,
            "durationTicks": 12
        }
    },
    "portrait": "mid_scott_mctominay",
    "flavorText": "A star from Serie A, SCOTT MCTOMINAY brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-lorenzo-pellegrini",
    "name": "LORENZO PELLEGRINI",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "silver",
    "stats": {
        "pace": 68,
        "shooting": 63.333333333333336,
        "passing": 83,
        "defense": 62.333333333333336,
        "physical": 59.333333333333336,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-lorenzo-pellegrini",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-lorenzo-pellegrini",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 24,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-lorenzo-pellegrini",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 18,
            "durationTicks": 12
        }
    },
    "portrait": "mid_lorenzo_pellegrini",
    "flavorText": "A star from Serie A, LORENZO PELLEGRINI brings tactical excellence to the pitch."
},
  {
    "id": "sa-mid-piotr-zielinski",
    "name": "PIOTR ZIELINSKI",
    "archetype": "playmaker",
    "roleTags": [
        "midfielder"
    ],
    "tier": "silver",
    "stats": {
        "pace": 57,
        "shooting": 65.33333333333333,
        "passing": 72,
        "defense": 54.333333333333336,
        "physical": 77.33333333333333,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-piotr-zielinski",
        "name": "Engine Room",
        "description": "Increases passing vision.",
        "trigger": "on_possession",
        "effect": {
            "type": "stat_boost",
            "stat": "passing",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-piotr-zielinski",
        "name": "Visionary Pass",
        "description": "Boosts teammate shooting.",
        "cooldownTicks": 20,
        "target": "ally",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 24,
            "durationTicks": 5
        }
    },
    "ultimate": {
        "id": "u-piotr-zielinski",
        "name": "Mastermind",
        "description": "Controls the tempo, boosting all team stats.",
        "chargeRequired": 65,
        "effect": {
            "type": "stat_boost",
            "magnitude": 18,
            "durationTicks": 12
        }
    },
    "portrait": "mid_piotr_zielinski",
    "flavorText": "A star from Serie A, PIOTR ZIELINSKI brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-lautaro-martinez",
    "name": "LAUTARO MARTINEZ",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "legendary",
    "stats": {
        "pace": 98,
        "shooting": 93,
        "passing": 60,
        "defense": 24,
        "physical": 61,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-lautaro-martinez",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 24,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-lautaro-martinez",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 60,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-lautaro-martinez",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 100,
            "durationTicks": 3
        }
    },
    "portrait": "att_lautaro_martinez",
    "flavorText": "A star from Serie A, LAUTARO MARTINEZ brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-kenan-yildiz",
    "name": "KENAN YILDIZ",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "silver",
    "stats": {
        "pace": 79,
        "shooting": 74,
        "passing": 53,
        "defense": 31,
        "physical": 67,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-kenan-yildiz",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-kenan-yildiz",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 36,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-kenan-yildiz",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 60,
            "durationTicks": 3
        }
    },
    "portrait": "att_kenan_yildiz",
    "flavorText": "A star from Serie A, KENAN YILDIZ brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-marcus-thuram",
    "name": "MARCUS THURAM",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "silver",
    "stats": {
        "pace": 72,
        "shooting": 67,
        "passing": 69,
        "defense": 20,
        "physical": 65,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-marcus-thuram",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-marcus-thuram",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 36,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-marcus-thuram",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 60,
            "durationTicks": 3
        }
    },
    "portrait": "att_marcus_thuram",
    "flavorText": "A star from Serie A, MARCUS THURAM brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-anastasios-douvikas",
    "name": "ANASTASIOS DOUVIKAS",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 76,
        "shooting": 71,
        "passing": 46,
        "defense": 31,
        "physical": 64,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-anastasios-douvikas",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-anastasios-douvikas",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 30,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-anastasios-douvikas",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 50,
            "durationTicks": 3
        }
    },
    "portrait": "att_anastasios_douvikas",
    "flavorText": "A star from Serie A, ANASTASIOS DOUVIKAS brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-nikola-krstovic",
    "name": "NIKOLA KRSTOVIC",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "silver",
    "stats": {
        "pace": 76,
        "shooting": 71,
        "passing": 59,
        "defense": 23,
        "physical": 70,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-nikola-krstovic",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-nikola-krstovic",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 36,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-nikola-krstovic",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 60,
            "durationTicks": 3
        }
    },
    "portrait": "att_nikola_krstovic",
    "flavorText": "A star from Serie A, NIKOLA KRSTOVIC brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-rafael-leao",
    "name": "RAFAEL LEAO",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "gold",
    "stats": {
        "pace": 81,
        "shooting": 76,
        "passing": 49,
        "defense": 29,
        "physical": 68,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-rafael-leao",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 18,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-rafael-leao",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 45,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-rafael-leao",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 75,
            "durationTicks": 3
        }
    },
    "portrait": "att_rafael_leao",
    "flavorText": "A star from Serie A, RAFAEL LEAO brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-romelu-lukaku",
    "name": "ROMELU LUKAKU",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 79,
        "shooting": 74,
        "passing": 45,
        "defense": 33,
        "physical": 68,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-romelu-lukaku",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-romelu-lukaku",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 30,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-romelu-lukaku",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 50,
            "durationTicks": 3
        }
    },
    "portrait": "att_romelu_lukaku",
    "flavorText": "A star from Serie A, ROMELU LUKAKU brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-jeremie-boga",
    "name": "JEREMIE BOGA",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "silver",
    "stats": {
        "pace": 73,
        "shooting": 68,
        "passing": 47,
        "defense": 25,
        "physical": 61,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-jeremie-boga",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-jeremie-boga",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 36,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-jeremie-boga",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 60,
            "durationTicks": 3
        }
    },
    "portrait": "att_jeremie_boga",
    "flavorText": "A star from Serie A, JEREMIE BOGA brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-francisco-conceicao",
    "name": "FRANCISCO CONCEICAO",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "silver",
    "stats": {
        "pace": 79,
        "shooting": 74,
        "passing": 69,
        "defense": 28,
        "physical": 57,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-francisco-conceicao",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 14.399999999999999,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-francisco-conceicao",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 36,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-francisco-conceicao",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 60,
            "durationTicks": 3
        }
    },
    "portrait": "att_francisco_conceicao",
    "flavorText": "A star from Serie A, FRANCISCO CONCEICAO brings tactical excellence to the pitch."
},
  {
    "id": "sa-att-artem-dovbyk",
    "name": "ARTEM DOVBYK",
    "archetype": "striker",
    "roleTags": [
        "attacker"
    ],
    "tier": "bronze",
    "stats": {
        "pace": 61,
        "shooting": 56,
        "passing": 47,
        "defense": 20,
        "physical": 70,
        "goalkeeping": 5
    },
    "passive": {
        "id": "p-artem-dovbyk",
        "name": "Instinct",
        "description": "Increased shooting power in the box.",
        "trigger": "always",
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 12,
            "durationTicks": 0
        }
    },
    "activeSkill": {
        "id": "a-artem-dovbyk",
        "name": "Dribble Burst",
        "description": "Fast dash past defenders.",
        "cooldownTicks": 22,
        "target": "self",
        "effect": {
            "type": "stat_boost",
            "stat": "pace",
            "magnitude": 30,
            "durationTicks": 4
        }
    },
    "ultimate": {
        "id": "u-artem-dovbyk",
        "name": "Lethal Strike",
        "description": "Guaranteed high-power shot.",
        "chargeRequired": 50,
        "effect": {
            "type": "stat_boost",
            "stat": "shooting",
            "magnitude": 50,
            "durationTicks": 3
        }
    },
    "portrait": "att_artem_dovbyk",
    "flavorText": "A star from Serie A, ARTEM DOVBYK brings tactical excellence to the pitch."
},
  // --- SERIE A IMPORT END ---
];
