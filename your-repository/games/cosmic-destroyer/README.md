# Cosmic Destroyer

A self-contained, browser-playable space shooter. The prototype uses original pixel-art sprites and effects generated at runtime, so it has no external asset or package dependencies.

The ship and ammunition catalogs are data-driven in `catalog.js`; every ship has its own authored pixel-art silhouette, weapon mounts, firing formation, combat stats, and implemented passive. The shared projectile simulation handles all 16 ammunition behaviors.

`celestial.js` defines original configurations for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, the Sun, the Moon, Io, Europa, Ganymede, Callisto, Titan, and three asteroid classes. Celestial sprites are generated as individual pixel-art canvases at initialization; the references folder is currently empty and its images have not been converted.

`campaign.js` defines eight sequential planetary sectors (Mercury through Neptune), three enemy formations per sector, unique multi-phase bosses, plus four optional moon sorties. Beating a boss unlocks the next sector; the Neptune finale ends the campaign and saves the victory.

## Start the game

Open `index.html` directly in a modern browser. Alternatively, start a local server from this directory:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

## Controls

- **Move:** WASD or arrow keys
- **Fire:** hold Space
- **Pause / resume:** P, Escape, or the pause button
- **Restart after destruction:** R or the restart button
- **Hangar:** Select ships and ammunition before launch; buy locked loadouts with credits earned in missions, or unlock ammunition pickups during a run.
- **Upgrades:** Spend credits in the hangar/shop to upgrade an owned ship's shield core or weapon damage (five levels each).
- **Campaign:** Clear each sector's three formations and its boss to unlock the next planetary stage. Replay unlocked stages or take optional Moon, Io, Europa, and Titan missions.
- **Settings:** Adjust or mute synthesized arcade sound effects.
- Touch devices have on-screen left, right, and fire controls.

## Gameplay

Pilot the fighter, shoot down hostile craft, and destroy asteroids and passing celestial bodies. Crust health drives the sequence **Intact → Cracked 1 → Cracked 2 → Breaking → Exploding → Debris**. Asteroids can be destroyed quickly; larger planets and moons have more health, collision damage, and special properties. Jupiter tugs at the ship, Saturn's rings expand its collision radius, Uranus slows nearby flight, Neptune and Io fire back, and the Sun arrives as a telegraphed flare-lane boss. Explosions can damage nearby objects and leave short-lived debris and shockwaves.

Enemy projectiles and collisions damage the hull after consuming available shields. Shields recharge after a short period without taking damage. Defeated enemies and destroyed objects award score and credits; enemies and celestial bodies can drop weapon pickups. Pickups unlock and immediately equip new ammunition; credits can also unlock ships and ammunition in the hangar. The loadout, credits, ship/weapon upgrades, settings, unlocked campaign stage, campaign ending, and current mission checkpoint persist in this browser. A reloaded active mission restarts at its beginning rather than restoring the exact in-flight wave and health state.

Audio effects are synthesized with the Web Audio API and controlled by the effects volume setting; the project does not include recorded sound assets or background music.

Each ship brings different weapon hardpoints, firing patterns, movement and attack statistics, and a working passive ability. Ammunition includes scatter, piercing, splash, homing, cryogenic, cluster, ricochet, beam, mine, gravity, chain-lightning, and nova effects. Sprite art is original and generated locally from the catalog geometry; reference images are not converted into sprites.

## Project files

- `index.html` provides the HUD, mission screens, and canvas.
- `style.css` provides the responsive game layout and interface.
- `catalog.js` defines all 28 ship configurations and 16 ammunition types.
- `celestial.js` defines celestial object stats, appearance themes, asteroid classes, and ordered damage-stage thresholds.
- `campaign.js` defines the eight planetary stages, enemy waves, boss attacks, and optional moon missions.
- `game.js` validates the catalog, generates individual pixel-art ships, manages the hangar/save data, and updates the shared combat simulation.
- `assets/` is reserved for final art, references, and audio.
