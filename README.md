# Car Sim (web) – Milestone 1
Three.js game, no build step. Plays on Android Chrome and desktop.

## Run via GitHub Pages
1. Create a repo, upload all these files (keep the `src/` folder and `.nojekyll`).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open `https://Kelvo618.github.io.Car-Sim` on your phone.
Local test: `python3 -m http.server` then open localhost:8000 (ES modules need http, not file://).

## Controls
Touch: ◀ ▶ steer, GAS, BRAKE (hold at standstill = reverse), HB handbrake, Cam / Car / Gfx buttons.
Keys: WASD/arrows, Space, C camera, 1/2/3 car, G graphics, R reset. Gamepad: stick + triggers.

## Structure
src/vehicle.js physics · src/defs.js car data · src/car-view.js model · src/camera.js · src/input.js · src/world.js · src/main.js
