# CODE WHITE: Tahoe Rescue

Milestone 0 playable prototype using Vite + TypeScript + Phaser 3.

## Milestone 0 Features
- Top-down deterministic ski-area map with boundaries.
- Terrain speed modifiers:
  - `OPEN_SNOW`: normal speed
  - `POWDER`: slower
  - `TREES`: slower
  - `RIDGE/ROCK`: slower
  - `GULLY`: slightly faster with sticky turning
- Player movement:
  - `WASD` or arrow keys
  - `Shift` sprint with stamina drain/regen
  - Map bounds + obstacle collisions (trees/rocks)
- Camera follow
- Minimal HUD with stamina + terrain + controls hint

## Run Locally
1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```
3. Open the shown local URL (typically `http://localhost:5173`).

## Build
```bash
npm run build
npm run preview
```

## Quick Manual Test Plan (5 steps)
1. Launch game and confirm player starts near top-left and camera follows smoothly.
2. Hold `W` and verify player moves upward (top-down orientation is correct).
3. Enter each terrain zone and confirm speed changes (`POWDER/TREES/RIDGE` slower, `GULLY` faster).
4. Hold `Shift` while moving and confirm sprint speed increase with stamina draining; release and confirm regen.
5. Try to run through tree/rock colliders and outside world edges; confirm collisions and map bounds prevent crossing.
