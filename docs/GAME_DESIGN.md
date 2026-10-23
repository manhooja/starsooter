# Game Design

## At a glance

| Field | Current status |
| --- | --- |
| Title | Astro-Zap! |
| Genre | 2D arcade space shooter / survival |
| Platform | Browser; specific supported browser versions are TODO |
| Players | One player |
| Session format | Single survival run with persistent local hangar progression |

## Concept

The player pilots a small ship near the bottom of a portrait 5:8 starfield while asteroids fall from above. Shoot asteroids to earn points and avoid collisions to preserve lives. A run ends when all lives are lost.

## Target audience

The straightforward controls and short-session survival loop suit casual players looking for a simple arcade game. The intended age range and accessibility requirements are TODO.

## Core gameplay loop

1. Visit the hangar to check the personal best, upgrade the ship, or shop for a paint job.
2. Launch a run from the home screen.
3. Move horizontally near the bottom of the playfield and fire upward at asteroids falling from above.
4. Earn points and Star Dust when shots destroy asteroids; avoid collisions.
5. Continue as asteroid pressure increases, until all lives are lost.
6. Collect the run's Star Dust reward, check the personal best, and spend rewards in the hangar.

## Implemented mechanics

- The ship moves horizontally along the bottom of the portrait playfield. Ships have distinct handling, speed, fire rate, and shots-per-firing-cycle stats. Handling controls steering response, while speed sets movement speed.
- The ship banks smoothly into turns, its engine glow pulses while flying, collisions trigger a brief shake and damage flash, and temporary invulnerability appears as a colored shield instead of hiding the ship.
- The ship fires automatically, with the Blaster upgrade reducing the delay between shots.
- Asteroids fall from the top, with varied sizes, speeds, and silhouettes. Larger rocks have more hit points and take multiple shots to break.
- Rocks show progressive fractures as they take damage instead of a floating health bar. Destroyed rocks burst into flying fragments with a brief expanding shockwave and flash.
- Standard rocks award 10, 20, 30, or 45 points according to their current size tier. Rare rainbow rocks appear occasionally, fall 1.5 times faster than standard rocks, take multiple hits, and award 75 points.
- Destroying a rare rainbow rock grants a five-second Rainbow Boost: movement speed increases by 50%, firing interval is halved, and the ship is invulnerable. Destroying another rare rock during the boost refreshes its timer.
- Destroyed objects briefly display their awarded score above the destruction point: standard asteroids use plain white numbers, rare rainbow rocks use rainbow coloring, and named celestial objects use their catalog color.
- Asteroid collisions remove one life and grant a brief period of invulnerability. A run begins with one life; the Extra Life upgrade adds one life per purchased level.
- The player starts with one life, plus one starting life per Extra Life upgrade level (up to two levels). Losing the last life ends the run.
- Asteroids that leave the screen without being hit do not award points or cost a life.
- Asteroid size and toughness progress by elapsed run time: small rocks first, then medium, large, and heavy rocks. Hit points and movement speed increase exponentially but are capped. Spawn intervals also decrease exponentially to a 0.4-second minimum, with no more than 18 active asteroids at once.
- Named celestial hazards are introduced by elapsed time: the eight Solar System planets, named stars, named galaxies, then named deep-space objects including black holes and quasars. Catalogs rotate through each category. These are real astronomical names presented as arcade hazards; their in-game scale, toughness, and motion are not realistic.
- The game-over screen displays the score, awards one Star Dust per 10 points, and offers another run or a return to the hangar.
- Extra Life adds one starting life per level (two levels maximum); Zoom Engine multiplies movement speed by 1.16 per level (three levels maximum); Rapid Blaster multiplies fire rate by about 1.22 per level (three levels maximum).
- Upgrade prices rise sharply with each level: Extra Life costs 45 then 135 Dust; Engine 35, 100, then 280; Blaster 40, 115, then 320.
- Rare rocks have a 2% chance to spawn and their extra points also increase the run's end-of-run Star Dust reward.
- The home screen focuses on launching a mission and includes the personal best, a compact upgrade-level summary, and shortcuts to High Scores and the upgrade shop. The separate Profile page shows pilot stats and detailed upgrade levels; the ship shop, Star Dust balance, equipped skin, and personal-best score are implemented.
- The in-mission Menu button and Escape key pause the run. Continue resumes the run; Quit to Hangar abandons it without a completion reward.
- The ship shop offers 11 distinct, purchasable ship silhouettes, including futuristic spacecraft and airplane-inspired designs. Ships have Common, Rare, Epic, or Legendary grades and balanced stat trade-offs rather than higher grades being strictly stronger. Wing-mounted guns are drawn on multi-shot ships and each gun fires a bullet in its own lane. Nova is the default ship, and owned ships can be equipped between runs.
- Every ship has a distinct named ability and a ship-specific asteroid-kill charge threshold, shown in the shop. Destroyed asteroids add to the charge; players activate a charged ability manually using **F**, the HUD button, or the touch button. Abilities include area damage, a shot spread, freezing, repair/shielding, a dash, targeted strikes, drones, a nearby-rock burst, and temporary extra guns.
- Hangar progress is stored locally in the current browser. There is no online leaderboard or cross-device account.

There are no implemented levels or bosses. The Rainbow Boost and ship abilities are temporary or instant run effects.

## Progression

In-run difficulty and celestial-object categories advance with elapsed run time. Between runs, players earn Star Dust to buy permanent upgrades and ships with different handling, speed, fire-rate, shot-count, and ability profiles, and can improve a personal-best score saved on the device. There is no campaign, level structure, online leaderboard, or cross-device progression.

## Story and setting

The presentation suggests a pilot defending against asteroids, but the implementation contains no narrative, characters, objectives beyond survival, or story scenes. Any expanded story is TODO.

## Art direction

The game uses a deep-space navy background (`#080B1A`), soft-white stars (`#DCE7FF`), a bright cyan default ship (`#00E5FF`), cosmic-purple asteroids (`#A855F7`), electric-blue player shots (`#38BDF8`), and orange-yellow asteroid impact particles (`#FFB000`). Player collision particles use hot pink (`#FF477E`). Cosmetic ship skins can change the ship and its preview color. Game visuals are drawn procedurally with the Canvas 2D API; no separate art or audio assets were found.

The UI uses white primary text against the dark background. Enemy bullets and boss enemies are not implemented; the player health display uses lives.

## Planned features

The following are **proposals only**, not implemented or approved scope:

- Add sound effects and an optional mute control.
- Add more ship designs and upgrade types.
- Test and tune the difficulty curve, abilities, and input accessibility.

The project owner should confirm priorities before treating these proposals as planned work.
