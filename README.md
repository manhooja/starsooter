# Astro-Zap! — Space Rock Blaster

Astro-Zap! is a playful, browser-based 2D space shooter. Pilot your ship, zap incoming asteroids, and see how long you can survive with three lives. Easy to pick up and fun for the whole family!

## Play

Open [`shooter.html`](./shooter.html) in a modern web browser. No installation, build step, or external dependency is required by the current project.

- Browse the hangar, ship upgrades, paint jobs, and your personal high score.
- Earn **1 Star Dust per asteroid destroyed** and spend it on upgrades or ship skins.
- Move with **WASD** or the **arrow keys**.
- Shoot with **Space**.
- On touch devices, use the on-screen direction and fire buttons.
- Launch a mission from the home screen. After game over, fly again or return to the hangar.

## Project

The game uses a small set of standalone files: `shooter.html` contains the interface and JavaScript game logic, while `shooter.css` contains the page styles. The canvas uses an 800 × 500 internal resolution and scales to fit its responsive layout. Keep both files together when opening or sharing the game. Progress is saved in this browser using local storage.

## Documentation

- [Game design](./docs/GAME_DESIGN.md)
- [Technical overview](./docs/TECHNICAL.md)
- [Roadmap](./docs/ROADMAP.md)
- [Controls](./docs/CONTROLS.md)
- [Release checklist](./docs/RELEASE_CHECKLIST.md)

## Project status

This is a lightweight arcade game with one survival mode, a hangar, purchasable gameplay upgrades, cosmetic ship skins, and a device-local personal best. Run score and lives reset on each mission; hangar progress is saved in this browser. High scores are not shared online.

## License

TODO: Choose and document a project license before distributing the game.
