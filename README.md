# CODE WHITE: Tahoe Rescue

Milestone 2 playable prototype using Vite + TypeScript + Phaser 3.

## Milestone 2 Features
- Milestone 1 rescue loop is fully intact (Dispatch -> Search -> Probe -> Dig -> Carry -> Evac).
- Secondary slide pressure system:
  - Expanding danger zone starts at run start.
  - Growth phase escalates by rescue progress:
    - `IDLE` before strike
    - `AFTER_STRIKE` after successful probe
    - `AFTER_SECURE` after victim secured
  - Contact with danger zone causes immediate loss.
- HUD pressure feedback:
  - `DANGER: LOW / RISING / CRITICAL`
  - Color-coded urgency by distance to danger edge.
- Danger-specific lose messaging:
  - `CAUGHT BY SECONDARY SLIDE`

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

## Known-Good Build/Deploy
```powershell
npm.cmd run build
git add src/main.ts src/world/Map.ts README.md
git commit -m "Stabilize Milestone 2 startup and pressure loop"
git push
```

## Manual Test Plan (10 Steps)
1. Launch game and confirm dispatch overlay appears for ~3 seconds with `CODE WHITE - last seen near West Ridge`.
2. After dispatch, confirm danger zone is visible and expanding slowly from upper map.
3. Verify HUD shows danger as `LOW` when far from boundary.
4. Play to STRIKE in PROBE mode and verify danger growth speed increases.
5. Complete DIG and verify danger growth speed increases again (fastest phase).
6. Enter the danger zone edge and confirm immediate loss with `CAUGHT BY SECONDARY SLIDE` and restart hint.
7. On another run, avoid zone and let timer reach zero; confirm loss occurs from timer path instead.
8. Confirm SEARCH beeps, signal number, and direction arrow still work unchanged.
9. Confirm CARRY still reduces speed and disables sprint after `VICTIM SECURED`.
10. Reach EVAC before timer/danger and confirm WIN still works, then press `R` and verify a clean reset.
