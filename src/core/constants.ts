export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1800;
export const ISO_X_SCALE = 0.92;
export const ISO_Y_SCALE = 0.46;
export const ISO_ELEVATION_SCALE = 0.72;
export const ISO_ORIGIN_X = WORLD_WIDTH * ISO_X_SCALE * 0.6;
export const ISO_ORIGIN_Y = 140;

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

export const DISPATCH_DURATION_SEC = 3;
export const RESCUE_TIMER_SEC = 180;
export const PROBE_COUNT_MAX = 5;
export const PROBE_SUCCESS_RADIUS = 70;
export const DIG_DURATION_SEC = 5;

export const SIGNAL_MAX_DISTANCE = 1400;
export const BEEP_INTERVAL_FAR_SEC = 0.5;
export const BEEP_INTERVAL_NEAR_SEC = 0.08;

export const CARRY_SPEED_MULTIPLIER = 0.65;
export const CARRY_SPRINT_ENABLED = false;

export interface PointLike {
  readonly x: number;
  readonly y: number;
}

export interface RectangleLike {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const VICTIM_SPAWN_POINTS: readonly PointLike[] = [
  { x: 560, y: 360 },
  { x: 1550, y: 390 },
  { x: 1120, y: 760 },
  { x: 1430, y: 1280 },
  { x: 720, y: 1220 }
];

export const EVAC_ZONE_RECT: RectangleLike = {
  x: 1990,
  y: 1420,
  width: 280,
  height: 210
};

export const DANGER_INITIAL_RADIUS = 120;
export const DANGER_GROWTH_IDLE_PER_SEC = 18;
export const DANGER_GROWTH_AFTER_STRIKE_PER_SEC = 38;
export const DANGER_GROWTH_AFTER_SECURE_PER_SEC = 58;
export const DANGER_CENTER: PointLike = { x: 1540, y: 80 };
export const DANGER_BUFFER_HIT = 6;

export const DANGER_WARN_FAR = 280;
export const DANGER_WARN_NEAR = 120;

export const TIMER_URGENCY_HIGH_SEC = 60;
export const TIMER_URGENCY_CRITICAL_SEC = 20;

export const BANNER_TWEEN_IN_MS = 140;
export const BANNER_TWEEN_OUT_MS = 220;

export const SNOW_PARTICLE_COUNT = 70;
export const SNOW_PARTICLE_MIN_SPEED = 6;
export const SNOW_PARTICLE_MAX_SPEED = 24;

export const AMBIENCE_BASE_GAIN = 0.015;
export const AMBIENCE_MAX_GAIN = 0.055;

export const SHAKE_STRIKE_MS = 120;
export const SHAKE_STRIKE_INTENSITY = 0.0032;
export const SHAKE_SECURE_MS = 160;
export const SHAKE_SECURE_INTENSITY = 0.0038;
export const SHAKE_DANGER_MS = 230;
export const SHAKE_DANGER_INTENSITY = 0.006;
export const SHAKE_WIN_MS = 170;
export const SHAKE_WIN_INTENSITY = 0.0028;
export const SHAKE_LOSE_MS = 180;
export const SHAKE_LOSE_INTENSITY = 0.0045;
