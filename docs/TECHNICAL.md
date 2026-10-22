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

The canvas has an 800 × 500 internal coordinate space. CSS makes the canvas responsive while preserving an 8:5 aspect ratio.

### Major systems

- **Game state:** Tracks the player, score, lives, active projectiles, asteroids, particles, and timers.
- **Input:** Tracks keyboard codes in a set. Pointer events on touch controls add and remove the same movement/fire inputs. Window blur clears held keys.
- **Update loop:** `requestAnimationFrame` drives simulation updates. Delta time is capped at 0.04 seconds per frame.
- **Spawning and difficulty:** Asteroids spawn just beyond the right edge and travel left. Their speed and spawn interval depend in part on score.
- **Collision and scoring:** Circle-distance checks handle projectile/asteroid and player/asteroid collisions. Destroyed asteroids award 10 points.
- **Rendering:** Canvas drawing renders the starfield, ship, projectiles, asteroids, and short-lived impact particles.
- **Interface and lifecycle:** DOM elements show score and lives, start and restart runs, and display game-over messaging.
- **Hangar and progression:** The home screen, upgrade store, ship-skin shop, and personal-best view are rendered from the saved player profile.
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
