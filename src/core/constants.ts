export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1800;
export const ISO_X_SCALE = 0.92;
export const ISO_Y_SCALE = 0.46;
export const ISO_ELEVATION_SCALE = 0.72;
export const ISO_ORIGIN_X = WORLD_WIDTH * ISO_X_SCALE * 0.6;
export const ISO_ORIGIN_Y = 140;

export const MOUNTAIN_FALLOFF_DIR_X = 0.34;
export const MOUNTAIN_FALLOFF_DIR_Y = 0.94;
export const MOUNTAIN_BASE_HEIGHT = 10;
export const MOUNTAIN_GRADE_STRENGTH = 0.052;
export const MOUNTAIN_ASPECT_SHADE_STRENGTH = 0.16;
export const MOUNTAIN_CONTOUR_SPACING = 84;
export const MOUNTAIN_HAZE_BANDS = 6;

export const PLAYER_BASE_SPEED = 240;
export const PLAYER_SPRINT_MULTIPLIER = 1.55;
export const PLAYER_ACCEL = 1800;
export const PLAYER_DECEL = 1700;
export const PLAYER_COLLISION_RADIUS = 10;
export const PLAYER_ELEVATION_VISUAL_BIAS = 0;
export const PLAYER_CONTACT_OFFSET_Y_WORLD = 0;

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
export const SLOPE_SAMPLE_DISTANCE = 18;
export const SLOPE_GRADE_MAX = 0.2;
export const SLOPE_SPEED_INFLUENCE = 0.32;
export const DOWNHILL_DRIFT_ACCEL = 120;
export const HEIGHT_GLOBAL_GRADIENT = 0.047;
export const HEIGHT_SMOOTHING = 16;
export const COLLISION_MAX_STEP_DISTANCE = 4;
export const COLLISION_MAX_SUBSTEPS = 16;
export const COLLISION_EPSILON = 0.01;

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
export const DANGER_KILL_MARGIN = 34;
export const DANGER_WARNING_OFFSET = 24;
export const DANGER_FIXED_TIMESTEP_SEC = 1 / 60;

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

export const CAMERA_FOLLOW_DISTANCE = 17;
export const CAMERA_SIDE_OFFSET = 6.5;
export const CAMERA_HEIGHT_BASE = 14;
export const CAMERA_HEIGHT_SPEED_FACTOR = 0.018;
export const CAMERA_LOOK_AHEAD = 5.8;
export const CAMERA_MOUNTAIN_BIAS = 4.6;
export const PHASER_CAMERA_FOLLOW_OFFSET_X = -24;
export const PHASER_CAMERA_FOLLOW_OFFSET_Y = 86;
