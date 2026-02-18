export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1800;

export const PLAYER_BASE_SPEED = 240;
export const PLAYER_SPRINT_MULTIPLIER = 1.55;
export const PLAYER_ACCEL = 1800;
export const PLAYER_DECEL = 1700;

export const STAMINA_MAX = 100;
export const STAMINA_DRAIN_PER_SEC = 38;
export const STAMINA_REGEN_PER_SEC = 24;
export const STAMINA_MIN_TO_SPRINT = 8;

export const TERRAIN_SPEED_MODIFIER = {
  OPEN_SNOW: 1.0,
  POWDER: 0.72,
  TREES: 0.68,
  RIDGE_ROCK: 0.78,
  GULLY: 1.16
} as const;

export const GULLY_TURN_STICKINESS = 0.22;
