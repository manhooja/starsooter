# Release Checklist

Use this checklist to track release readiness. Items marked TODO are unresolved or have no supporting evidence in the inspected project; they should not be treated as passed.

## Testing

- [ ] TODO: Define supported browsers, browser versions, screen sizes, and input devices.
- [ ] TODO: Verify the page opens and the game starts in every supported browser.
- [ ] TODO: Verify horizontal A/D and arrow-key movement, movement bounds, and held-key behavior.
- [ ] TODO: Verify automatic firing rate and Blaster upgrade behavior, larger asteroids needing multiple hits, and defeated rocks awarding points based on size and rarity.
- [ ] TODO: Verify rocks develop visible cracks with damage, no asteroid health bars are shown, and destroyed rocks animate with a flash, shockwave, and debris.
- [ ] TODO: Verify every ship's ability, unique charge requirement, activation by **F** and buttons, cooldown-through-kills behavior, and charge reset after use.
- [ ] TODO: Verify asteroid size/HP stages, capped exponential spawn curve, 18-object limit, and named planet/star/galaxy/deep-space catalog progression.
- [ ] TODO: Verify asteroid collisions decrement lives, invulnerability behaves as intended, and zero lives triggers game over.
- [ ] TODO: Verify replay resets score, lives, asteroids, projectiles, and player position.
- [ ] TODO: Verify the home screen navigation, upgrades, skin purchases/equipping, personal-best display, and game-over reward flow.
- [ ] TODO: Verify Profile is separate from Home, displays current records and all upgrade levels, and links to the upgrade shop.
- [ ] TODO: Verify the 5:8 portrait playfield on desktop and mobile, bottom ship position, top-down asteroid movement, pause, continue, and quit behavior.
- [ ] TODO: Verify rare asteroids spawn occasionally, are visually distinct, award 75 points, and grant the described five-second boost.
- [ ] TODO: Verify upgrade prices rise by level and Engine/Blaster bonuses stack multiplicatively.
- [ ] TODO: Test touch controls on physical touch devices, including press, release, and interrupted gestures.
- [ ] TODO: Test the responsive 5:8 portrait game layout on phones, short landscape screens, and desktops, including touch steering and browser safe-area/viewport behavior.
- [ ] TODO: Check keyboard-only access, focus visibility, contrast, and screen-reader experience.
- [ ] TODO: Add a repeatable test plan or automated tests; no test suite was found.

## Bugs and gameplay

- [ ] TODO: Record and triage known bugs; no project bug tracker or known-issues list was found.
- [ ] TODO: Playtest and approve the difficulty curve, collision feel, and run length.
- [ ] TODO: Confirm the game-over and replay experience.
- [ ] TODO: Decide whether settings or additional score features are required for the intended release.

## Performance

- [ ] TODO: Profile representative low-end target devices and browsers.
- [ ] TODO: Check sustained frame rate, memory use, and behavior during long sessions.
- [ ] TODO: Confirm performance with many simultaneous asteroids and particles.
- [ ] TODO: Confirm celestial labels and ability effects remain readable on desktop and mobile.

## Save and load

- [ ] Hangar currency, upgrade levels, owned/equipped skins, and personal best use browser `localStorage`; current-run score and lives reset each run.
- [ ] TODO: Test persistence, invalid or unavailable storage, clearing site data, and behavior in private browsing across supported browsers.
- [ ] TODO: Confirm that device-local progress (without accounts or online leaderboards) meets release requirements.

## Packaging and platform requirements

- [ ] The current project can be opened as a standalone `shooter.html` file; no build or packaging pipeline was found.
- [ ] TODO: Select release platforms and hosting/distribution method.
- [ ] TODO: Document minimum browser versions and required browser features.
- [ ] TODO: Verify any platform-specific packaging, metadata, and offline requirements.
- [ ] TODO: Add a versioning and release process.

## Credits and licensing

- [ ] TODO: Name the developer(s), contributors, and any third-party content.
- [ ] The inspected game draws its visuals procedurally and contains no external asset references.
- [ ] TODO: Select and publish a project license; do not assume the absence of asset files defines the code license.
- [ ] TODO: Confirm the rights and attributions required for any content added later.

## Release readiness

- [ ] TODO: Set release scope, owner, target date, and acceptance criteria.
- [ ] TODO: Complete the supported-platform QA checklist above.
- [ ] TODO: Review documentation against the final build and release package.
- [ ] TODO: Record known limitations and provide a contact or feedback channel.
- [ ] TODO: Make a release decision after outstanding items are resolved or explicitly accepted.
