# CODE WHITE: Tahoe Rescue

Milestone 3.5 playable prototype using Vite + TypeScript + Phaser 3.

## Milestone 3 Features
- Milestone 1 + 2 gameplay loop preserved.
- Procedural audio polish:
  - Wind ambience bed (danger-proximity intensity)
  - Dispatch/strike/secure/win/lose stingers
- Impact feedback:
  - Camera shake by event severity
  - Screen flash accents (strike, secure, danger, win/lose)
- HUD polish:
  - Animated mode badge pulse on change
  - Animated banner transitions
  - Timer urgency animation at `<60s` and `<20s`
  - Critical danger shimmer
- World polish:
  - Subtle drifting snow overlay
  - Stronger evac beacon glow pulse
- 2.5D fake-isometric presentation:
  - World simulation remains top-down (physics unchanged)
  - Rendering projected into isometric screen space
  - Player, obstacles, map, markers, and danger visuals projected
- Chunk 1 Three.js hybrid foundation:
  - Phaser remains simulation authority
  - Three.js runs as read-only mirror of gameplay snapshot data
  - Mirror includes terrain, obstacles, player proxy, evac beacon, and danger ring

## Controls
- Move: `WASD` or Arrow keys
- Sprint: `Shift`
- Toggle mode: `Tab` (`SEARCH` <-> `PROBE`)
- Action: `E` (probe place / hold dig)
- Restart (after win/lose): `R`

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

PowerShell with execution policy restrictions:
```powershell
npm.cmd install
npm.cmd run dev
```

## Build
```bash
npm run build
npm run preview
```

## Manual Test Plan (12 Steps)
1. Launch game and verify dispatch overlay appears ~3s and gameplay begins.
2. Confirm no startup error overlay and map renders with drifting snow + evac glow.
3. In SEARCH, verify signal number + direction arrow + proximity beeps still behave correctly.
4. Confirm wind ambience is audible after gameplay begins.
5. Move closer to danger zone and confirm ambience intensity rises.
6. Toggle SEARCH/PROBE and verify mode badge pulses on mode change.
7. Trigger `STRIKE!` and verify animated banner + shake + flash + strike stinger.
8. Complete DIG and verify `VICTIM SECURED` banner + secure shake/flash/cue.
9. Let timer drop below 60s and 20s; verify urgency animation intensifies.
10. Enter danger zone and verify danger-specific lose message + strong feedback.
11. Complete a win run and verify win cue + celebratory feedback.
12. Press `R` after win/lose repeatedly (5x) and verify clean restart with no teardown/startup errors.

## 2.5D Visual Regression Checks
1. Player movement feel and collision response match prior top-down behavior.
2. Camera follows projected player smoothly and does not clip outside iso map bounds.
3. Terrain zones remain readable and speed modifiers still trigger correctly.
4. Probe markers and danger zone visuals align with projected world positions.
5. HUD direction arrow still guides correctly toward victim in isometric view.

## Chunk 1 Gate Checklist (Hybrid Phaser + Three)
- Gate 0: `npm.cmd run build` passes and baseline gameplay loop works.
- Gate 1: Three canvas layers behind Phaser and input remains unchanged.
- Gate 2: `SimSnapshot` bridge updates every frame without state mutation.
- Gate 3: Terrain/obstacles/evac mirror align with gameplay world.
- Gate 4: Player and danger mirror track gameplay state without visible drift.
- Gate 5: Restart stability verified (10 consecutive restart cycles).
- Gate 6: Full gameplay parity checklist passes with mirror enabled.

Mirror toggle:
- Default: mirror OFF (stable Phaser gameplay view)
- Enable mirror: append `?three=1` to URL
