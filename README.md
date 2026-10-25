# Astro-Zap! — Space Rock Blaster

Astro-Zap! is a playful, browser-based 2D space shooter. Pilot your ship, zap incoming asteroids, and see how long you can survive. Start with one life and earn upgrades for more. Easy to pick up and fun for the whole family!

## Play

Open [`shooter.html`](./shooter.html) in a modern web browser. No installation, build step, or external dependency is required by the current project.

- The Home screen shows your personal best and current upgrade levels, with a shortcut to the High Scores page and the upgrade shop. View your **Profile** for pilot stats and detailed upgrade levels.
- Earn **1 Star Dust for every 10 points** at the end of a completed run, then spend it on upgrades or ship skins.
- Collect and equip 11 futuristic and airplane-inspired ships across Common, Rare, Epic, and Legendary grades. Each ship has its own speed, fire rate, shot count, ability, and asteroid-kill charge requirement.
- Browse the Design Lab for a 28-ship concept lineup, 16 projectile concepts, sample ammo effects, and a celestial destruction-stage atlas.
- Move left/right with **A/D** or the **left/right arrow keys**.
- The ship fires automatically throughout each mission.
- Charge a ship ability by destroying asteroids, then activate it with **F** or the ability button. On touch devices, use the on-screen direction and ability buttons; firing is automatic.
- Survive a capped, time-based difficulty ramp: small rocks arrive first, followed by larger, tougher rocks and a faster spawn cadence. The playfield limits active asteroids to keep the ramp bounded.
- Encounter named Solar System planets, stars, galaxies, black holes, and quasars as the run progresses. Their names are real astronomical objects; their in-game size, toughness, and movement are arcade abstractions.
- Launch a mission from the home screen. After game over, fly again or return to the hangar.
- During a mission, use **Menu** or **Esc** to pause and choose **Continue** or **Quit to Hangar**.

## Project

The game uses a small set of standalone files: [`shooter.html`](./shooter.html) contains the interface and JavaScript game logic, while [`shooter.css`](./shooter.css) contains the page styles. The portrait game canvas uses a 500 × 800 internal resolution (5:8 aspect ratio) and scales to fit laptops and mobile screens. Keep both files together when opening or sharing the game. Progress is saved in this browser using local storage.

## Documentation

- [Game design](./GAME_DESIGN.md)
- [Technical overview](./TECHNICAL.md)
- [Roadmap](./ROADMAP.md)
- [Controls](./CONTROLS.md)
- [Release checklist](./RELEASE_CHECKLIST.md)

## Project status

This is a lightweight arcade game with one survival mode, a hangar, purchasable gameplay upgrades, 11 playable ships with distinct handling, weapon stats, and manual abilities across four grades, and a device-local personal best. The Design Lab is a visual concept sheet; its additional ship and weapon designs are not separately selectable gameplay items. Run score and lives reset on each mission; hangar progress is saved in this browser. High scores are not shared online.

## License

TODO: Choose and document a project license before distributing the game.
