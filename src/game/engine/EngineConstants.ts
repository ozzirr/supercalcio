export const LOGIC_W = 1000;
export const LOGIC_H = 600;

export type PlayerRole = "GK" | "DEF" | "MID" | "ATK";

// Even Y lanes for field players (GK gets center LOGIC_H/2)
export const FIELD_Y_SLOTS = [105, 230, 370, 495];

// Base X for each role (home team; away mirrors around LOGIC_W)
export const ROLE_BASE_X: Record<PlayerRole, number> = {
  GK:  80,
  DEF: 220,
  MID: 400,
  ATK: 590,
};

// How far forward/back each role moves depending on possession
export const ROLE_ATTACK_X: Record<PlayerRole, number> = {
  GK:  95,   // GK barely advances
  DEF: 300,
  MID: 510,
  ATK: 720,
};

export const ROLE_DEFEND_X: Record<PlayerRole, number> = {
  GK:  75,   // GK slightly retreats
  DEF: 155,
  MID: 310,
  ATK: 430,
};
