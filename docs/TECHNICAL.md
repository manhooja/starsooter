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

- **Game state:** Tracks the player, score, lives, active projectiles, asteroids, particles, transient score popups, and timers, including the rare-rock power-up duration.
- **Input:** Tracks keyboard movement codes in a set. Pointer events on touch controls add and remove movement inputs. Window blur clears held keys; firing is automatic.
- **Update loop:** `requestAnimationFrame` drives simulation updates. Delta time is capped at 0.04 seconds per frame.
- **Pause and menu:** The in-mission Menu button or Escape pauses the simulation. Continue resumes it; Quit to Hangar abandons the current run without its completion reward.
- **Spawning and difficulty:** Asteroids spawn above the playfield and travel down toward the ship near the bottom. Their speed and spawn interval depend in part on score. Score unlocks falling planets (500), galaxies (1,500), and universe cores (3,000), which spawn at increasing intervals.
- **Collision and scoring:** Circle-distance checks handle projectile/object and player/object collisions. Asteroid hit points scale by size; defeating a rock awards 10–30 points, or 75 points for a rare rock. Destroying a rare rock also grants a five-second boost that multiplies movement speed by 1.5, halves the firing interval, and extends invulnerability; collecting another rare rock refreshes its timer. Cosmic objects take multiple hits, award a type-based bonus, and damage the player on collision.
- **Rendering:** Canvas drawing renders the starfield, falling planets, galaxies and universe cores, ship, projectiles, asteroids, short-lived impact particles, and fading score popups. Popups display the awarded points in plain white for standard asteroids, rainbow coloring for rare rocks, and type-specific colors for cosmic objects.
- **Interface and lifecycle:** DOM elements show score and lives, start and restart runs, and display game-over messaging.
- **Hangar and progression:** The home screen focuses on mission launch. A separate Profile page shows saved pilot stats and upgrade levels; the upgrade store, ship-skin shop, and personal-best view are rendered from the saved player profile.
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
