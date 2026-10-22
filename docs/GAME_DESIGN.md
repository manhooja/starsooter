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

The player pilots a small ship through a starfield while asteroids arrive from the right side of the screen. Shoot asteroids to earn points and avoid collisions to preserve lives. A run ends when all lives are lost.

## Target audience

The straightforward controls and short-session survival loop suit casual players looking for a simple arcade game. The intended age range and accessibility requirements are TODO.

## Core gameplay loop

1. Visit the hangar to check the personal best, upgrade the ship, or shop for a paint job.
2. Launch a run from the home screen.
3. Move around the playfield and fire at asteroids approaching from the right.
4. Earn points and Star Dust when shots destroy asteroids; avoid collisions.
5. Continue as asteroid pressure increases, until all lives are lost.
6. Collect the run's Star Dust reward, check the personal best, and spend rewards in the hangar.

## Implemented mechanics

- The ship moves in four directions and is constrained to the playfield.
- Diagonal movement is normalized so it is not faster than straight movement.
- Holding the fire input fires repeatedly, with a fixed delay between shots.
- Asteroids enter from the right, move left, and have varied sizes, speeds, and silhouettes.
- Destroying an asteroid awards 10 points.
- Asteroid collisions remove one life and grant a brief period of invulnerability.
- The player starts with three lives, plus one starting life per Cometproof Hull level (up to two levels). Losing the last life ends the run.
- Asteroids that leave the screen without being hit do not award points or cost a life.
- Asteroid speed and spawn pressure increase with score, up to code-defined limits.
- The game-over screen displays the score, awards one Star Dust per 10 points, and offers another run or a return to the hangar.
- Cometproof Hull adds one starting life per level (two levels maximum); Zoom Engine adds 35 movement speed per level (three levels maximum); Rapid Blaster reduces the shot interval by 0.04 seconds per level (three levels maximum).
- The home screen, upgrade shop, ship shop, upgrade levels, Star Dust balance, equipped skin, and personal-best score are implemented.
- Nova is the default skin. Sunbeam, Berry Blast, and Mint Chip are cosmetic skins that can be purchased and equipped.
- Hangar progress is stored locally in the current browser. There is no online leaderboard or cross-device account.

There are no implemented levels, bosses, or temporary power-ups.

## Progression

In-run difficulty increases with score. Between runs, players earn Star Dust to buy permanent upgrades and cosmetic skins, and can improve a personal-best score saved on the device. There is no campaign, level structure, online leaderboard, or cross-device progression.

## Story and setting

The presentation suggests a pilot defending against asteroids, but the implementation contains no narrative, characters, objectives beyond survival, or story scenes. Any expanded story is TODO.

## Art direction

The game uses a dark navy starfield, a glowing cyan geometric ship, muted outlined asteroid shapes, and bright projectile and impact effects. The visuals are drawn procedurally with the Canvas 2D API; the inspected project contains no separate art or audio assets. The style is minimal, high-contrast, and arcade-inspired.

## Planned features

The following are **proposals only**, not implemented or approved scope:

- Add sound effects and an optional mute control.
- Add pause/resume controls.
- Add more ship skins and upgrade types.
- Test and tune the difficulty curve and input accessibility.

The project owner should confirm priorities before treating these proposals as planned work.
