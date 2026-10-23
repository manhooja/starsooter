# Roadmap

This roadmap distinguishes behavior present in `shooter.html` from suggestions that have not been approved. No release dates or delivery commitments are recorded.

## Completed in the current prototype

- Single-page Astro-Zap! game with a 500 × 800 portrait Canvas playfield (5:8) for desktop and mobile.
- Vertical hangar home screen focused on launching missions, with a compact upgrade summary and navigation to separate Profile, upgrades, ship shop, and personal high scores pages.
- Mission launch, replay, and return-to-hangar flow.
- Horizontal keyboard movement with playfield bounds.
- Automatic firing, multi-lane weapons, and moving projectiles.
- Procedurally shaped incoming asteroids, hit detection, score, and lives.
- Brief invulnerability after a collision.
- Time-based asteroid size and toughness stages, exponentially increasing spawn pressure with a 0.4-second floor, and an 18-asteroid active limit.
- Per-ship manually activated abilities, each charged by a different number of destroyed asteroids and available through keyboard, HUD, and touch controls.
- Progressive, named catalogs of the eight Solar System planets, stars, galaxies, black holes, and quasars.
- Starfield and particle effects rendered without separate asset files.
- Responsive layout and on-screen touch controls.
- End-of-run Star Dust rewards (1 per 10 points) and purchasable Extra Life, Engine, and Blaster upgrades with gameplay effects.
- Eleven purchasable ships across four grades, with distinct hulls, wing-mounted guns, handling, speed, fire-rate, shot-count, and ability stats.
- Personal-best score and hangar progress saved locally in the browser.
- Vertical-shooter gameplay with the ship at the bottom and asteroids falling from above.
- In-mission pause menu with Continue and Quit to Hangar actions.
- Multi-hit larger asteroids and rare, high-value rocks.
- Sharply increasing upgrade costs with multiplicative Engine and Blaster bonuses.
- Unique named ship abilities, asteroid-kill charge tracking, and manual ability activation.
- Time-progressive asteroid size/HP and celestial-object categories, with exponential spawn escalation and explicit gameplay caps.

## Current development priorities

TODO: The repository does not record an agreed priority list, owner, or target milestone. Suggested next steps, pending owner approval:

1. Define supported browsers, devices, and accessibility expectations.
2. Test keyboard, touch, collision, scoring, game-over, and replay behavior across target devices.
3. Test progression persistence, the upgrade economy, and responsive menu layouts.
4. Decide whether to add audio or new game modes.
5. Select a license and release/distribution approach.

These are recommendations, not commitments or completed work.

## Proposed future features (uncommitted)

- Optional audio effects and a mute setting.
- More upgrade types, ships, enemy or asteroid variants, and optional game modes.
- A short tutorial or expanded story.

## Milestones

| Milestone | Status |
| --- | --- |
| Playable single-run prototype | Implemented in `shooter.html`; formal acceptance testing is TODO |
| Cross-browser/device QA | TODO |
| Release scope, license, and platform decision | TODO |
| Packaging and public release | TODO |

Dates and owners: TODO.
