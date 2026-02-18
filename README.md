# CODE WHITE: Tahoe Rescue

Milestone 1 playable prototype using Vite + TypeScript + Phaser 3.

## Milestone 1 Features
- 3 second dispatch overlay: `CODE WHITE - last seen near West Ridge`.
- Rescue flow modes:
  - `SEARCH` (signal + direction + beeps)
  - `PROBE` (5 probes, place with `E`)
  - `DIG` (hold `E` for 5s after STRIKE)
  - `CARRY` (victim secured, slower movement, sprint disabled)
- Victim hidden spawn at 1 of 5 fixed points each run.
- Fixed evac zone with visible beacon pulse marker.
- Transceiver feedback:
  - Non-linear signal strength `0-100`
  - Direction arrow toward victim
  - WebAudio proximity beeps (`0.5s` far to `0.08s` close)
- Survivability timer (`3:00`) and lose condition on timeout.
- Win/lose overlays and restart with `R`.
- Milestone 0 movement and terrain behavior preserved.

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

## Manual Test Plan (10 Steps)
1. Launch game and confirm dispatch overlay appears for exactly ~3 seconds with text `CODE WHITE - last seen near West Ridge`.
2. After dispatch, confirm mode shows `SEARCH` and timer starts at `03:00` counting down.
3. Move in SEARCH and verify `SIGNAL` value updates and direction arrow points toward victim direction.
4. While in SEARCH, confirm beeps are slower far away and much faster when close.
5. Press `Tab` and confirm mode toggles `SEARCH` <-> `PROBE`.
6. In PROBE, press `E` five times and confirm probe markers appear and HUD count decrements to `0`.
7. Place a probe within strike radius and verify `STRIKE!` banner appears, strike sound plays, and mode switches to `DIG`.
8. In DIG, hold `E` for about 5 seconds and verify progress bar fills, `VICTIM SECURED` appears, and mode changes to `CARRY`.
9. In CARRY, confirm movement speed is reduced and sprint no longer activates.
10. Reach EVAC to trigger WIN and `Press R to restart`; then run a separate attempt letting timer hit zero to confirm LOSE and restart with new victim spawn.
