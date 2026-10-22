# Astro-Zap! — Space Rock Blaster

Astro-Zap! is a playful, browser-based 2D space shooter. Pilot your ship, zap incoming asteroids, and see how long you can survive. Start with one life and earn upgrades for more. Easy to pick up and fun for the whole family!

## Play

Open [`shooter.html`](../shooter.html) in a modern web browser. No installation, build step, or external dependency is required by the current project.

- The Home screen shows your personal best and current upgrade levels, with a shortcut to the High Scores page and the upgrade shop. View your **Profile** for pilot stats and detailed upgrade levels.
- Earn **1 Star Dust for every 10 points** at the end of a completed run, then spend it on upgrades or ship skins.
- Move left/right with **A/D** or the **left/right arrow keys**.
- The ship fires automatically throughout each mission.
- On touch devices, use the on-screen direction buttons; firing is automatic.
- Launch a mission from the home screen. After game over, fly again or return to the hangar.
- During a mission, use **Menu** or **Esc** to pause and choose **Continue** or **Quit to Hangar**.

## Project

The game uses a small set of standalone files: [`shooter.html`](../shooter.html) contains the interface and JavaScript game logic, while [`shooter.css`](../shooter.css) contains the page styles. The portrait game canvas uses a 500 × 800 internal resolution (5:8 aspect ratio) and scales to fit laptops and mobile screens. Keep both files together when opening or sharing the game. Progress is saved in this browser using local storage.

## Documentation

- [Game design](./GAME_DESIGN.md)
- [Technical overview](./TECHNICAL.md)
- [Roadmap](./ROADMAP.md)
- [Controls](./CONTROLS.md)
- [Release checklist](./RELEASE_CHECKLIST.md)

## Project status

This is a lightweight arcade game with one survival mode, a hangar, purchasable gameplay upgrades, cosmetic ship skins, and a device-local personal best. Run score and lives reset on each mission; hangar progress is saved in this browser. High scores are not shared online.

## License

TODO: Choose and document a project license before distributing the game.
