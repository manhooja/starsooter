# Technical Overview

## Stack and dependencies

- **Engine:** No game engine. The game uses browser APIs directly.
- **Languages:** HTML, CSS, and plain JavaScript.
- **Rendering:** Canvas 2D.
- **External runtime or package dependencies:** None found in the inspected project.
- **Build tooling or package manager:** None found.

The game expects a browser with JavaScript, Canvas 2D, `requestAnimationFrame`, and standard keyboard events. Its on-screen controls use Pointer Events. Exact supported browsers and versions are TODO.

## Project structure

```text
.
├── shooter.html   # Menus, interface, and game logic
├── shooter.css    # Responsive game and page styles
├── README.md
└── docs/
    ├── CONTROLS.md
    ├── GAME_DESIGN.md
    ├── RELEASE_CHECKLIST.md
    ├── ROADMAP.md
    └── TECHNICAL.md
```

The documentation files describe the inspected shooter. No separate scene files, configuration files, asset directories, tests, or dependency manifests were present in the available worktree at the time of inspection.

## Architecture

The HTML file contains the interface and game logic and links to the separate stylesheet. A JavaScript immediately invoked function expression (IIFE) scopes game state and functions without modules or a bundler.

The canvas has a 500 × 800 internal coordinate space. CSS scales the portrait playfield to the available viewport while preserving a 5:8 aspect ratio on desktop and mobile. On short landscape screens, the game hides nonessential page chrome and places touch controls beside the playfield. The ship is positioned near the bottom, moves horizontally, and fires upward at asteroids that descend from above.

### Major systems

- **Game state:** Tracks the player, score, lives, active projectiles and asteroids, particles, score popups, elapsed run time, celestial catalog indices, ability charge, and timed power effects. Ship records include handling, speed/fire-rate multipliers, projectile lane offsets, ability IDs, and varied asteroid-kill charge requirements.
- **Input:** Tracks keyboard movement codes in a set. Pointer events on touch controls add and remove movement inputs. Window blur clears held keys; firing is automatic. **F**, the HUD button, and the touch ability button activate a fully charged ship ability. Each destroyed asteroid adds one charge.
- **Update loop:** `requestAnimationFrame` drives simulation updates. Delta time is capped at 0.04 seconds per frame.
- **Pause and menu:** The in-mission Menu button or Escape pauses the simulation. Continue resumes it; Quit to Hangar abandons the current run without its completion reward.
- **Spawning and difficulty:** Time-based tiers introduce small, medium, large, and heavy asteroids. HP and speed grow exponentially with caps; spawn intervals decrease exponentially to a 0.4-second floor, and active asteroids are limited to 18. Named celestial catalogs are selected by elapsed time: planets, stars, galaxies, then deep-space objects. Each catalog cycles through its entries; these use named real astronomical objects with fictional arcade gameplay properties.
- **Collision and scoring:** Circle-distance checks handle projectile/object and player/object collisions. A shared asteroid-damage helper handles normal shots and ability damage, awarding score, popups, rare rewards, and ability charge once on destruction. Each ship's gun offsets create projectile lanes; abilities add effects such as area damage, freezing, a dash/shield, side drones, or temporary extra gun lanes. Rare rocks grant a five-second boost that increases movement speed by 1.5, doubles firing rate, and gives invulnerability.
- **Rendering:** Canvas drawing renders the starfield, named celestial hazards, player ship, projectiles, asteroids, impact particles, and score popups. Damaged rocks reveal per-rock procedural cracks rather than health bars; destroying one creates a short-lived shockwave, flash, and animated debris shards. Celestial names appear beside their arcade renderings. Player-ship silhouettes use SVG path data rendered through Canvas `Path2D`; the same data powers layered shop previews with metallic gradients, cockpit highlights, armor seams, engine pods, and grade-colored glow. The ship banks into turns, bobs, pulses its engine trail, shakes and flashes on collision, and shows a shield while invulnerable.
- **Interface and lifecycle:** DOM elements show score and lives, start and restart runs, and display game-over messaging.
- **Hangar and progression:** The home screen focuses on mission launch. A separate Profile page shows saved pilot stats and upgrade levels; the upgrade store and shop with 11 ships across four grades show ship stats, unique abilities, and per-ship charge thresholds. Grades indicate collection tier; ship performance comes from trade-off stats rather than grade alone.
- **Persistence:** Browser `localStorage` stores Star Dust, upgrade levels, owned/equipped skins, and the local personal best under `astroZapProgress`. There is no server or account synchronization. Storage read/write errors are reported in the browser console.

## Run locally

1. Check out or download the project files.
2. Keep `shooter.html` and `shooter.css` in the same directory.
3. Open `shooter.html` directly in a modern browser.
4. Choose upgrades or a ship skin in the hangar, then launch a mission and use the controls in [CONTROLS.md](./CONTROLS.md).

No install, compile, bundling, or server command is defined by the current project. If a browser or deployment platform requires serving the page over HTTP, configure that separately; no server configuration is included here.

## Build and test

There is no build script, test suite, or CI configuration in the inspected worktree. Manual browser testing instructions and release gates are tracked in [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).

## Known technical boundaries

- Current-run score and lives are in-memory values and reset when a new run starts. Hangar currency, upgrades, skins, and personal best are saved locally in the browser.
- Clearing browser site data or using a different browser/device does not preserve the local profile.
- There is no audio system or external asset loading.
- There is no configuration file; game constants are in `shooter.html`.
- Accessibility and cross-browser behavior have not been formally specified or verified. TODO: define and test support targets.
