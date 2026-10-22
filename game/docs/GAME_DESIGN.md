# Game Design

## At a glance

| Field | Current status |
| --- | --- |
| Title | Astro-Zap! |
| Genre | 2D arcade space shooter / survival |
| Platform | Browser; specific supported browser versions are TODO |
| Players | One player |
| Session format | Single survival run; no levels or saved progression |

## Concept

The player pilots a small ship through a starfield while asteroids arrive from the right side of the screen. Shoot asteroids to earn points and avoid collisions to preserve lives. A run ends when all lives are lost.

## Target audience

The straightforward controls and short-session survival loop suit casual players looking for a simple arcade game. The intended age range and accessibility requirements are TODO.

## Core gameplay loop

1. Start a run from the title overlay.
2. Move around the playfield and fire at asteroids approaching from the right.
3. Earn points when shots destroy asteroids; avoid asteroid collisions.
4. Continue as asteroid pressure increases, until all three lives are lost.
5. Review the run score and start another run.

## Implemented mechanics

- The ship moves in four directions and is constrained to the playfield.
- Diagonal movement is normalized so it is not faster than straight movement.
- Holding the fire input fires repeatedly, with a fixed delay between shots.
- Asteroids enter from the right, move left, and have varied sizes, speeds, and silhouettes.
- Destroying an asteroid awards 10 points.
- Asteroid collisions remove one life and grant a brief period of invulnerability.
- The player starts with three lives. Losing the last life ends the run.
- Asteroids that leave the screen without being hit do not award points or cost a life.
- Asteroid speed and spawn pressure increase with score, up to code-defined limits.
- The game-over overlay displays the score and offers a new run.

There are no implemented levels, bosses, power-ups, weapon upgrades, persistent high scores, or save system.

## Progression

Progression is limited to increasing in-run difficulty as the score rises. The game has no campaign, level structure, unlocks, or meta-progression. A persistent leaderboard or additional modes would be future work, not existing features.

## Story and setting

The presentation suggests a pilot defending against asteroids, but the implementation contains no narrative, characters, objectives beyond survival, or story scenes. Any expanded story is TODO.

## Art direction

The game uses a dark navy starfield, a glowing cyan geometric ship, muted outlined asteroid shapes, and bright projectile and impact effects. The visuals are drawn procedurally with the Canvas 2D API; the inspected project contains no separate art or audio assets. The style is minimal, high-contrast, and arcade-inspired.

## Planned features

No future feature commitments are recorded in the source. The following are **proposals only**, not implemented or approved scope:

- Add a persistent high-score table.
- Add sound effects and an optional mute control.
- Add an opening/tutorial screen and clearer in-run pause or restart options.
- Test and tune the difficulty curve and input accessibility.

The project owner should confirm priorities before treating these proposals as planned work.
