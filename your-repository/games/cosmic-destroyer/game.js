(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 600;
  const MAX_HEALTH = 100;
  const BASE_SHIELD = 60;
  const ENEMY_LIMIT = 12;
  const SAVE_KEY = "cosmicDestroyerLoadout";
  const data = window.COSMIC_DATA;
  const celestialData = window.COSMIC_CELESTIAL_DATA;
  const campaignData = window.COSMIC_CAMPAIGN_DATA;
  const canvas = document.querySelector("#gameCanvas");
  const ctx = canvas.getContext("2d");
  const initError = document.querySelector("#initError");

  if (!data || !celestialData || !campaignData || !ctx) {
    initError.hidden = false;
    initError.textContent = !data || !celestialData || !campaignData
      ? "Game data could not be loaded. Reload the page and check that catalog.js, celestial.js, and campaign.js are available."
      : "Unable to initialize the game canvas. Try a browser with Canvas 2D support.";
    return;
  }

  function resizeCanvasForDisplay() {
    const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const width = Math.round(WIDTH * pixelRatio);
    const height = Math.round(HEIGHT * pixelRatio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  resizeCanvasForDisplay();
  window.addEventListener("resize", resizeCanvasForDisplay, { passive: true });
  window.visualViewport?.addEventListener("resize", resizeCanvasForDisplay, { passive: true });

  const $ = (selector) => document.querySelector(selector);
  const scoreElement = $("#score");
  const healthValueElement = $("#healthValue");
  const shieldValueElement = $("#shieldValue");
  const healthBar = $("#healthBar");
  const shieldBar = $("#shieldBar");
  const healthMeter = $(".hull-meter");
  const shieldMeter = $(".shield-meter");
  const hostileCountElement = $("#hostileCount");
  const hostileMetricLabel = $(".wave-metric .metric-label");
  const weaponValueElement = $("#weaponValue");
  const screen = $("#screen");
  const screenKicker = $("#screenKicker");
  const screenTitle = $("#screenTitle");
  const screenCopy = $("#screenCopy");
  const actionButton = $("#actionButton");
  const pauseButton = $("#pauseButton");
  const touchControls = $("#touchControls");
  const joystick = $("#virtualJoystick");
  const joystickKnob = $("#joystickKnob");
  const fireControl = $("#fireControl");
  const toast = $("#toast");
  const hangar = $("#hangar");
  const hangarList = $("#hangarList");
  const hangarDetail = $("#hangarDetail");
  const hangarAction = $("#hangarAction");
  const upgradeAction = $("#upgradeAction");
  const hangarHint = $("#hangarHint");
  const screenActions = $("#screenActions");
  const creditValue = $("#creditValue");
  const selectedLoadout = $("#selectedLoadout");
  const pickupHint = $("#pickupHint");
  const shipsById = new Map(data.ships.map((ship) => [ship.id, ship]));
  const weaponsById = new Map(data.weapons.map((weapon) => [weapon.id, weapon]));
  const campaignStages = campaignData.stages;
  const moonMissions = campaignData.moonMissions;
  const celestialById = new Map(celestialData.bodies.map((body) => [body.id, body]));
  const asteroidTypes = new Map(celestialData.asteroids.map((asteroid) => [asteroid.id, asteroid]));
  const celestialStages = celestialData.stages;
  const validPatterns = new Set(Object.keys(data.patterns));
  const validPassives = new Set([
    "starter", "pierce", "speed", "salvage", "evasive", "crit", "focus", "repair",
    "magnet", "armor", "volley", "slow", "shield", "blast", "chain", "regen",
    "heavy", "pickup", "lifesteal", "bounty", "homing", "explosive", "overcharge"
  ]);
  const validBehaviors = new Set([
    "standard", "scatter", "pierce", "splash", "homing", "freeze", "cluster",
    "ricochet", "beam", "mine", "vortex", "chain", "nova"
  ]);

  function validateCatalog() {
    const errors = [];
    if (data.ships.length !== 28) errors.push(`Expected 28 ships, found ${data.ships.length}.`);
    if (data.weapons.length !== 16) errors.push(`Expected 16 ammunition types, found ${data.weapons.length}.`);
    if (shipsById.size !== data.ships.length) errors.push("Ship IDs must be unique.");
    if (weaponsById.size !== data.weapons.length) errors.push("Ammunition IDs must be unique.");
    if (celestialData.bodies.length !== 15) errors.push(`Expected 15 celestial objects, found ${celestialData.bodies.length}.`);
    if (celestialData.asteroids.length < 3) errors.push("Expected at least three asteroid configurations.");
    if (campaignStages.length !== 8) errors.push(`Expected eight planetary campaign stages, found ${campaignStages.length}.`);
    if (new Set(campaignStages.map((stage) => stage.id)).size !== campaignStages.length) errors.push("Campaign stage IDs must be unique.");
    if (new Set(moonMissions.map((mission) => mission.id)).size !== moonMissions.length) errors.push("Moon mission IDs must be unique.");
    if (new Set(campaignStages.map((stage) => stage.body)).size !== 8 ||
      campaignStages.some((stage) => celestialById.get(stage.body)?.kind !== "planet")) {
      errors.push("Campaign stages must cover eight distinct planets.");
    }
    if (new Set(celestialData.bodies.map((body) => body.id)).size !== celestialData.bodies.length) errors.push("Celestial object IDs must be unique.");
    if (new Set(celestialData.asteroids.map((asteroid) => asteroid.id)).size !== celestialData.asteroids.length) errors.push("Asteroid IDs must be unique.");
    if (celestialStages.map((stage) => stage.id).join(",") !== "intact,cracked1,cracked2,breaking,exploding,debris") {
      errors.push("Celestial damage stages are missing or out of order.");
    }
    for (const body of [...celestialData.bodies, ...celestialData.asteroids]) {
      if (!body.name || !body.feature || !Number.isFinite(body.health) || body.health <= 0 ||
        !Number.isFinite(body.size) || body.size <= 0 || !Number.isFinite(body.damage)) {
        errors.push(`Celestial configuration "${body.id}" has invalid stats or art identity.`);
      }
    }
    for (const ship of data.ships) {
      if (!ship.name || !ship.silhouette || !Array.isArray(ship.mounts) || !ship.mounts.length) {
        errors.push(`Ship "${ship.id}" is missing identity, silhouette, or weapon mounts.`);
      }
      if (!validPatterns.has(ship.pattern)) errors.push(`Ship "${ship.id}" has unknown firing pattern "${ship.pattern}".`);
      if (!validPassives.has(ship.passive)) errors.push(`Ship "${ship.id}" has unknown passive "${ship.passive}".`);
      if (ship.silhouette && (!Array.isArray(ship.silhouette.hull) || !Array.isArray(ship.silhouette.wings))) {
        errors.push(`Ship "${ship.id}" has invalid pixel-art geometry.`);
      }
      if (ship.mounts.some((mount) => !Number.isFinite(mount.x) || !Number.isFinite(mount.y))) {
        errors.push(`Ship "${ship.id}" has invalid weapon mount coordinates.`);
      }
    }
    for (const weapon of data.weapons) {
      if (!validBehaviors.has(weapon.behavior)) errors.push(`Ammunition "${weapon.id}" has unknown behavior.`);
      if (![weapon.damage, weapon.speed, weapon.cooldown, weapon.radius, weapon.cost].every(Number.isFinite)) {
        errors.push(`Ammunition "${weapon.id}" has invalid combat statistics.`);
      }
    }
    for (const mission of [...campaignStages, ...moonMissions]) {
      if (!celestialById.has(mission.body) || !mission.waves.length || !mission.boss.name ||
        !Number.isFinite(mission.boss.health) || mission.boss.health <= 0 ||
        !["aimed", "fan", "sweep", "barrage", "cross", "ring", "flare"].includes(mission.boss.pattern)) {
        errors.push(`Mission "${mission.id}" has incomplete body, waves, or boss data.`);
      }
      if (mission.waves.some((wave) => !wave.length || wave.some((type) => !enemyTypes[type]))) {
        errors.push(`Mission "${mission.id}" contains an invalid enemy formation.`);
      }
    }
    if (errors.length) throw new Error(`Catalog validation failed:\n${errors.join("\n")}`);
    return {
      ships: data.ships.length,
      weapons: data.weapons.length,
      celestialObjects: celestialData.bodies.length,
      asteroidTypes: celestialData.asteroids.length,
      campaignStages: campaignStages.length,
      moonMissions: moonMissions.length,
      damageStages: celestialStages.map((stage) => stage.id),
      errors
    };
  }

  function readSave() {
    const defaults = {
      credits: 360,
      ownedShips: ["nova"],
      equippedShip: "nova",
      ownedWeapons: ["pulse"],
      equippedWeapon: "pulse",
      unlockedStage: 0,
      campaignCompleted: false,
      shipUpgrades: Object.fromEntries(data.ships.map((ship) => [ship.id, 0])),
      weaponUpgrades: Object.fromEntries(data.weapons.map((weapon) => [weapon.id, 0])),
      lastMission: null,
      settings: { sfxVolume: 0.45 }
    };
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return defaults;
      const ownedShips = Array.isArray(saved.ownedShips)
        ? saved.ownedShips.filter((id) => shipsById.has(id))
        : defaults.ownedShips;
      const ownedWeapons = Array.isArray(saved.ownedWeapons)
        ? saved.ownedWeapons.filter((id) => weaponsById.has(id))
        : defaults.ownedWeapons;
      if (!ownedShips.includes("nova")) ownedShips.push("nova");
      if (!ownedWeapons.includes("pulse")) ownedWeapons.push("pulse");
      const readLevels = (value, ids) => Object.fromEntries(ids.map((id) => {
        const level = value && Number.isFinite(value[id]) ? Math.floor(value[id]) : 0;
        return [id, Math.max(0, Math.min(5, level))];
      }));
      const settings = saved.settings && typeof saved.settings === "object" && !Array.isArray(saved.settings) ? saved.settings : {};
      const lastMission = saved.lastMission && typeof saved.lastMission === "object" &&
        ((saved.lastMission.kind === "campaign" && campaignStages.some((stage) => stage.id === saved.lastMission.id)) ||
         (saved.lastMission.kind === "moon" && moonMissions.some((mission) => mission.id === saved.lastMission.id)))
        ? { kind: saved.lastMission.kind, id: saved.lastMission.id }
        : null;
      return {
        credits: Number.isFinite(saved.credits) ? Math.max(0, Math.floor(saved.credits)) : defaults.credits,
        ownedShips,
        equippedShip: ownedShips.includes(saved.equippedShip) ? saved.equippedShip : "nova",
        ownedWeapons,
        equippedWeapon: ownedWeapons.includes(saved.equippedWeapon) ? saved.equippedWeapon : "pulse",
        unlockedStage: Number.isFinite(saved.unlockedStage)
          ? Math.max(0, Math.min(campaignStages.length - 1, Math.floor(saved.unlockedStage)))
          : 0,
        campaignCompleted: saved.campaignCompleted === true,
        shipUpgrades: readLevels(saved.shipUpgrades, data.ships.map((ship) => ship.id)),
        weaponUpgrades: readLevels(saved.weaponUpgrades, data.weapons.map((weapon) => weapon.id)),
        lastMission,
        settings: {
          sfxVolume: Number.isFinite(settings.sfxVolume) ? Math.max(0, Math.min(1, settings.sfxVolume)) : 0.45
        }
      };
    } catch (error) {
      console.error("Could not read the Cosmic Destroyer save; using a fresh loadout.", error);
      return defaults;
    }
  }

  const save = readSave();
  const state = {
    mode: "ready",
    score: 0,
    elapsed: 0,
    spawnTimer: 0,
    asteroidSpawnTimer: 1.8,
    celestialSpawnTimer: 11,
    nextCelestial: 0,
    sunSpawned: false,
    nextEntityId: 1,
    fireTimer: 0,
    volleyCount: 0,
    firingIndex: 0,
    shieldDelay: 0,
    invulnerable: 0,
    toastTimer: 0,
    hangarOrigin: "ready",
    hangarTab: "ships",
    hangarSelection: "nova",
    credits: save.credits,
    ownedShips: new Set(save.ownedShips),
    equippedShip: save.equippedShip,
    ownedWeapons: new Set(save.ownedWeapons),
    equippedWeapon: save.equippedWeapon,
    unlockedStage: save.unlockedStage,
    campaignCompleted: save.campaignCompleted,
    shipUpgrades: save.shipUpgrades,
    weaponUpgrades: save.weaponUpgrades,
    lastMission: save.lastMission,
    settings: save.settings,
    campaign: null,
    screenReturnMode: "ready",
    boss: null,
    bossPhase: 1,
    bossShotTimer: 0,
    waveIndex: 0,
    missionTimer: 0,
    audioContext: null,
    audioGain: null,
    player: { x: WIDTH / 2, y: HEIGHT - 68, health: MAX_HEALTH, shield: BASE_SHIELD },
    playerShots: [],
    enemyShots: [],
    enemies: [],
    celestialEntities: [],
    debris: [],
    shockwaves: [],
    celestialEvents: [],
    particles: [],
    pickups: [],
    beams: [],
    stars: [],
    keys: new Set(),
    touch: { x: 0, y: 0, fire: false }
  };
  const activeFirePointers = new Set();
  let joystickPointerId = null;
  const JOYSTICK_DEAD_ZONE = 0.12;

  const enemyTypes = {
    scout: { name: "SCOUT", health: 1, speed: 115, points: 100, fireRate: 0, size: 34, color: "#ff6e91", credits: 12 },
    gunship: { name: "GUNSHIP", health: 3, speed: 66, points: 240, fireRate: 1.55, size: 44, color: "#ffc469", credits: 22 },
    dreadnought: { name: "DREADNOUGHT", health: 8, speed: 34, points: 600, fireRate: 1.9, size: 58, color: "#ba8bff", credits: 48 }
  };
  const sprites = {};
  const spriteUrls = {};
  const background = document.createElement("canvas");
  background.width = WIDTH;
  background.height = HEIGHT;
  const backgroundContext = background.getContext("2d");

  function fillPolygon(context, points, color) {
    context.fillStyle = color;
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fill();
  }

  function makeShipSprite(ship) {
    const sprite = document.createElement("canvas");
    sprite.width = 48;
    sprite.height = 48;
    const c = sprite.getContext("2d");
    c.imageSmoothingEnabled = false;
    const [red, green, blue] = ship.color.match(/[a-f\d]{2}/gi).map((part) => parseInt(part, 16));
    const shadow = `rgb(${Math.floor(red * 0.3)}, ${Math.floor(green * 0.3)}, ${Math.floor(blue * 0.3)})`;
    const plate = `rgb(${Math.floor(red * 0.65 + 40)}, ${Math.floor(green * 0.65 + 40)}, ${Math.floor(blue * 0.65 + 40)})`;
    const highlight = `rgb(${Math.min(255, Math.floor(red * 0.55 + 110))}, ${Math.min(255, Math.floor(green * 0.55 + 110))}, ${Math.min(255, Math.floor(blue * 0.55 + 110))})`;
    const { hull, wings } = ship.silhouette;
    fillPolygon(c, wings, "#111b2b");
    fillPolygon(c, wings.map(([x, y]) => [48 - x, y]), "#111b2b");
    fillPolygon(c, wings.map(([x, y]) => [x + 1, y - 1]), plate);
    fillPolygon(c, wings.map(([x, y]) => [47 - x, y - 1]), plate);
    fillPolygon(c, hull, shadow);
    fillPolygon(c, hull.map(([x, y]) => [x + (x < 24 ? 1 : -1), y + 1]), plate);
    fillPolygon(c, [[24, 4], [27, 16], [25, 30], [24, 35], [22, 30], [21, 16]], ship.color);
    fillPolygon(c, [[24, 7], [26, 15], [24, 18], [22, 15]], highlight);
    fillPolygon(c, [[22, 20], [24, 18], [26, 20], [25, 26], [23, 26]], "#c7f5ff");
    fillPolygon(c, [[22, 20], [24, 18], [24, 26], [23, 26]], "#68dff5");
    for (const mount of ship.mounts) {
      const x = 24 + Math.round(mount.x);
      const y = 24 + Math.round(mount.y);
      c.fillStyle = "#101827";
      c.fillRect(x - 2, y - 8, 4, 9);
      c.fillStyle = plate;
      c.fillRect(x - 1, y - 7, 2, 7);
      c.fillStyle = highlight;
      c.fillRect(x, y - 5, 1, 4);
    }
    c.fillStyle = "#090f19";
    c.fillRect(12, 31, 5, 8);
    c.fillRect(31, 31, 5, 8);
    c.fillStyle = ship.color;
    c.fillRect(13, 36, 3, 5);
    c.fillRect(32, 36, 3, 5);
    c.fillStyle = "#fff0bc";
    c.fillRect(14, 38, 1, 3);
    c.fillRect(33, 38, 1, 3);
    c.fillStyle = "rgba(255,255,255,0.5)";
    c.fillRect(24, 4 + (ship.design % 3), 1, 2);
    c.fillStyle = shadow;
    c.fillRect(21 + (ship.design % 3), 29, 1, 2);
    c.fillRect(26 - (ship.design % 3), 29, 1, 2);
    return sprite;
  }

  function pixel(context, color, x, y, width = 1, height = 1) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }

  function makeSprite(paint) {
    const sprite = document.createElement("canvas");
    sprite.width = 32;
    sprite.height = 32;
    const spriteContext = sprite.getContext("2d");
    spriteContext.imageSmoothingEnabled = false;
    paint(spriteContext);
    return sprite;
  }

  function createCelestialSprite(config, variant = 0) {
    const sprite = document.createElement("canvas");
    sprite.width = 96;
    sprite.height = 96;
    const c = sprite.getContext("2d");
    c.imageSmoothingEnabled = false;
    const center = 48;
    const radius = config.kind === "asteroid" ? 31 + (variant % 5) * 2 : 32 + Math.min(20, config.size * 0.18);
    const colors = [config.dark, config.color, config.light];

    if (config.feature === "rings") {
      c.save();
      c.translate(center, center + 2);
      c.rotate(-0.2);
      c.strokeStyle = config.light;
      c.lineWidth = 8;
      c.beginPath();
      c.ellipse(0, 0, radius + 16, radius * 0.3 + 9, 0, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = config.dark;
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(0, 0, radius + 20, radius * 0.3 + 11, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    if (config.kind === "sun") {
      for (let ray = 0; ray < 24; ray += 1) {
        const angle = (ray / 24) * Math.PI * 2;
        const inner = radius - 4;
        const outer = radius + (ray % 3 === 0 ? 17 : 10);
        c.fillStyle = ray % 2 ? config.color : config.light;
        c.beginPath();
        c.moveTo(center + Math.cos(angle - 0.09) * inner, center + Math.sin(angle - 0.09) * inner);
        c.lineTo(center + Math.cos(angle) * outer, center + Math.sin(angle) * outer);
        c.lineTo(center + Math.cos(angle + 0.09) * inner, center + Math.sin(angle + 0.09) * inner);
        c.closePath();
        c.fill();
      }
    }

    if (config.kind === "asteroid") {
      const points = [];
      const sides = 12 + variant % 4;
      for (let index = 0; index < sides; index += 1) {
        const angle = (index / sides) * Math.PI * 2;
        const irregular = 0.72 + ((index * 17 + variant * 11) % 29) / 100;
        points.push([center + Math.cos(angle) * radius * irregular, center + Math.sin(angle) * radius * irregular]);
      }
      fillPolygon(c, points, config.dark);
      fillPolygon(c, points.map(([x, y]) => [center + (x - center) * 0.84 - 2, center + (y - center) * 0.84 - 2]), config.color);
    } else {
      c.fillStyle = config.dark;
      c.beginPath();
      c.arc(center, center, radius, 0, Math.PI * 2);
      c.fill();
      c.save();
      c.beginPath();
      c.arc(center, center, radius - 3, 0, Math.PI * 2);
      c.clip();
      for (let row = 0; row < 16; row += 1) {
        for (let column = 0; column < 16; column += 1) {
          const sample = (row * 37 + column * 23 + variant * 19 + config.id.length * 11) % 17;
          if (sample < 8) continue;
          const color = colors[sample % colors.length];
          c.fillStyle = color;
          c.fillRect(center - 48 + column * 6, center - 48 + row * 6, 6, 6);
        }
      }

      if (config.feature === "bands" || config.feature === "cloud" || config.feature === "haze") {
        const step = config.feature === "bands" ? 9 : 7;
        for (let y = center - radius + 5; y < center + radius - 4; y += step) {
          const offset = (Math.floor(y / step) % 2) * 5;
          c.fillStyle = Math.floor(y / step) % 2 ? config.light : config.dark;
          c.globalAlpha = config.feature === "haze" ? 0.38 : 0.58;
          c.fillRect(center - radius, y, radius * 2, config.feature === "bands" ? 4 : 2);
          if (config.feature === "cloud") {
            c.fillStyle = config.light;
            c.fillRect(center - radius + offset, y + 3, radius + 4, 2);
          }
        }
        c.globalAlpha = 1;
      } else if (config.feature === "ocean") {
        const continents = [
          [[21, 31], [29, 27], [34, 30], [31, 35], [37, 39], [32, 45], [26, 42]],
          [[56, 20], [65, 24], [69, 31], [64, 34], [68, 40], [61, 43], [56, 35]],
          [[44, 58], [50, 55], [55, 60], [52, 68], [46, 70], [42, 64]]
        ];
        for (const shape of continents) fillPolygon(c, shape, "#72bd72");
        c.fillStyle = "#dff7d9";
        c.fillRect(22, 18, 12, 4);
        c.fillRect(59, 67, 13, 4);
      } else if (config.feature === "storm") {
        c.fillStyle = config.light;
        c.fillRect(51, 35, 18, 7);
        c.fillRect(45, 42, 25, 6);
        c.fillRect(55, 48, 14, 5);
        c.fillStyle = config.dark;
        c.fillRect(55, 40, 11, 3);
      } else if (config.feature === "volcanic") {
        for (const [x, y] of [[32, 29], [60, 34], [44, 57], [64, 60]]) {
          c.fillStyle = config.dark;
          c.fillRect(x, y, 10, 7);
          c.fillStyle = config.light;
          c.fillRect(x + 2, y + 1, 4, 3);
          c.fillStyle = "#ff693c";
          c.fillRect(x + 4, y - 3, 2, 4);
        }
      } else if (config.feature === "grooves") {
        c.strokeStyle = config.light;
        c.lineWidth = 2;
        for (let groove = -2; groove <= 2; groove += 1) {
          c.beginPath();
          c.moveTo(center - radius, center + groove * 8 + 14);
          c.lineTo(center + radius, center + groove * 8 - 14);
          c.stroke();
        }
      } else if (config.feature === "ice") {
        c.strokeStyle = config.light;
        c.lineWidth = 2;
        for (const [[x1, y1], [x2, y2]] of [
          [[27, 21], [42, 44]], [[42, 44], [33, 72]], [[42, 44], [69, 39]],
          [[69, 39], [62, 67]], [[32, 72], [62, 67]], [[47, 24], [69, 39]]
        ]) {
          c.beginPath();
          c.moveTo(x1, y1);
          c.lineTo(x2, y2);
          c.stroke();
        }
      } else {
        const craters = config.feature === "crater" || config.kind === "moon" || config.kind === "asteroid";
        if (craters) {
          for (let crater = 0; crater < 7; crater += 1) {
            const x = 25 + ((crater * 19 + variant * 7) % 48);
            const y = 24 + ((crater * 13 + variant * 9) % 48);
            const size = 3 + (crater % 3) * 2;
            c.fillStyle = config.dark;
            c.fillRect(x, y, size + 3, size);
            c.fillStyle = config.light;
            c.fillRect(x + 2, y + 1, size, Math.max(2, size - 2));
          }
        }
      }
      c.restore();
      c.strokeStyle = "rgba(238, 248, 255, 0.34)";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(center, center, radius - 2, -2.45, -0.5);
      c.stroke();
    }

    if (config.feature === "solar") {
      c.fillStyle = "#fff3a0";
      c.beginPath();
      c.arc(center - 5, center - 5, radius * 0.64, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#fff8d6";
      c.fillRect(center - 17, center - 13, 16, 11);
      c.fillStyle = "#ffce55";
      c.fillRect(center + 3, center + 9, 23, 8);
    }
    return sprite;
  }

  function createCelestialSprites() {
    celestialData.bodies.forEach((body, index) => {
      sprites[`celestial-${body.id}`] = createCelestialSprite(body, index);
    });
    celestialData.asteroids.forEach((asteroid, index) => {
      sprites[`celestial-${asteroid.id}`] = createCelestialSprite(asteroid, index + 20);
    });
  }
  if (state.particles.length > 900) state.particles.splice(0, state.particles.length - 900);

  function createSprites() {
    sprites.scout = makeSprite((c) => {
      pixel(c, "#501f3a", 14, 3, 4, 6);
      pixel(c, "#ff9cb0", 15, 4, 2, 4);
      pixel(c, "#702543", 12, 9, 8, 12);
      pixel(c, "#ff6e91", 14, 10, 4, 9);
      pixel(c, "#471d38", 3, 14, 26, 5);
      pixel(c, "#c84971", 5, 13, 7, 3);
      pixel(c, "#c84971", 20, 13, 7, 3);
      pixel(c, "#ffc1cd", 15, 13, 2, 4);
      pixel(c, "#ff6e91", 10, 21, 3, 4);
      pixel(c, "#ff6e91", 19, 21, 3, 4);
    });
    sprites.gunship = makeSprite((c) => {
      pixel(c, "#513923", 13, 3, 6, 4);
      pixel(c, "#ffc469", 14, 4, 4, 3);
      pixel(c, "#5e482e", 11, 7, 10, 16);
      pixel(c, "#a17b43", 13, 8, 6, 12);
      pixel(c, "#ffe0a2", 14, 10, 4, 5);
      pixel(c, "#352c2c", 2, 12, 28, 8);
      pixel(c, "#80613b", 4, 11, 7, 6);
      pixel(c, "#80613b", 21, 11, 7, 6);
      pixel(c, "#ffb84d", 3, 14, 4, 2);
      pixel(c, "#ffb84d", 25, 14, 4, 2);
      pixel(c, "#d9ad68", 10, 21, 4, 5);
      pixel(c, "#d9ad68", 18, 21, 4, 5);
      pixel(c, "#ff7d53", 11, 26, 3, 3);
      pixel(c, "#ff7d53", 18, 26, 3, 3);
    });
    sprites.dreadnought = makeSprite((c) => {
      pixel(c, "#30264e", 12, 2, 8, 5);
      pixel(c, "#ba8bff", 14, 3, 4, 4);
      pixel(c, "#5f467e", 9, 7, 14, 16);
      pixel(c, "#9271bd", 12, 8, 8, 13);
      pixel(c, "#d6c1ff", 14, 10, 4, 6);
      pixel(c, "#382d50", 1, 11, 30, 11);
      pixel(c, "#755a9c", 3, 12, 7, 7);
      pixel(c, "#755a9c", 22, 12, 7, 7);
      pixel(c, "#ba8bff", 4, 13, 4, 2);
      pixel(c, "#ba8bff", 24, 13, 4, 2);
      pixel(c, "#453454", 6, 21, 20, 4);
      pixel(c, "#a582d6", 9, 23, 4, 4);
      pixel(c, "#a582d6", 19, 23, 4, 4);
      pixel(c, "#ff9b69", 10, 27, 3, 3);
      pixel(c, "#ff9b69", 19, 27, 3, 3);
    });
  }

  function createBossSprite(color, design) {
    const sprite = document.createElement("canvas");
    sprite.width = 144;
    sprite.height = 112;
    const c = sprite.getContext("2d");
    c.imageSmoothingEnabled = false;
    const wing = design % 2 === 0
      ? [[70, 32], [18, 12], [5, 23], [31, 48], [16, 63], [56, 55]]
      : [[70, 35], [10, 5], [4, 28], [28, 43], [12, 72], [67, 59]];
    const mirrored = wing.map(([x, y]) => [144 - x, y]);
    fillPolygon(c, wing, "#172335");
    fillPolygon(c, mirrored, "#172335");
    fillPolygon(c, wing.map(([x, y]) => [x + 3, y + 3]), color);
    fillPolygon(c, mirrored.map(([x, y]) => [x - 3, y + 3]), color);
    fillPolygon(c, [[72, 7], [88, 34], [83, 75], [72, 94], [61, 75], [56, 34]], "#283750");
    fillPolygon(c, [[72, 13], [82, 36], [78, 71], [72, 85], [66, 71], [62, 36]], color);
    fillPolygon(c, [[62, 38], [72, 31], [82, 38], [79, 56], [72, 62], [65, 56]], "#effbff");
    c.fillStyle = "#fff4b7";
    c.fillRect(68, 42, 8, 12);
    c.fillStyle = "#111a27";
    for (let engine = 0; engine < 3; engine += 1) {
      const offset = (engine - 1) * 13;
      c.fillRect(65 + offset, 81, 8, 15);
      c.fillStyle = engine === design % 3 ? "#fff0bc" : color;
      c.fillRect(67 + offset, 94, 4, 9);
      c.fillStyle = "#111a27";
    }
    c.fillStyle = "rgba(255,255,255,0.65)";
    c.fillRect(26 + (design % 5) * 2, 31, 18, 3);
    c.fillRect(100 - (design % 5) * 2, 31, 18, 3);
    return sprite;
  }

  function createBossSprites() {
    [...campaignStages, ...moonMissions].forEach((mission, index) => {
      sprites[`boss-${mission.id}`] = createBossSprite(mission.boss.color, index);
    });
  }

  function createBackground() {
    const gradient = backgroundContext.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, "#071326");
    gradient.addColorStop(0.52, "#070e20");
    gradient.addColorStop(1, "#090b1a");
    backgroundContext.fillStyle = gradient;
    backgroundContext.fillRect(0, 0, WIDTH, HEIGHT);
    const nebula = backgroundContext.createRadialGradient(660, 240, 15, 660, 240, 360);
    nebula.addColorStop(0, "rgba(54, 75, 145, 0.18)");
    nebula.addColorStop(0.55, "rgba(37, 45, 99, 0.08)");
    nebula.addColorStop(1, "rgba(8, 12, 29, 0)");
    backgroundContext.fillStyle = nebula;
    backgroundContext.fillRect(0, 0, WIDTH, HEIGHT);
    backgroundContext.fillStyle = "rgba(113, 165, 217, 0.035)";
    for (let y = 0; y < HEIGHT; y += 4) backgroundContext.fillRect(0, y, WIDTH, 1);
  }

  function currentShip() {
    return shipsById.get(state.equippedShip);
  }

  function currentWeapon() {
    return weaponsById.get(state.equippedWeapon);
  }

  function getMaxShield() {
    const ship = currentShip();
    const upgrade = state.shipUpgrades[state.equippedShip] || 0;
    return Math.round(BASE_SHIELD * ship.stats.shield * (ship.passive === "shield" ? 1.33 : 1) + upgrade * 4);
  }

  function getShipDamageUpgrade() {
    return 1 + (state.shipUpgrades[state.equippedShip] || 0) * 0.08;
  }

  function getWeaponDamageUpgrade() {
    return 1 + (state.weaponUpgrades[state.equippedWeapon] || 0) * 0.12;
  }

  function getUpgradeCost(level) {
    return 120 * (level + 1);
  }

  function persistSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        credits: state.credits,
        ownedShips: [...state.ownedShips],
        equippedShip: state.equippedShip,
        ownedWeapons: [...state.ownedWeapons],
        equippedWeapon: state.equippedWeapon,
        unlockedStage: state.unlockedStage,
        campaignCompleted: state.campaignCompleted,
        shipUpgrades: state.shipUpgrades,
        weaponUpgrades: state.weaponUpgrades,
        lastMission: state.lastMission,
        settings: state.settings
      }));
    } catch (error) {
      console.error("Could not save the Cosmic Destroyer progress.", error);
      showToast("SAVE FAILED · CHECK BROWSER STORAGE", 2.4);
    }
  }

  function addScreenAction(label, action, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `screen-action${className ? ` ${className}` : ""}`;
    button.dataset.menuAction = action;
    button.textContent = label;
    screenActions.append(button);
    return button;
  }

  function setScreen(mode, config) {
    state.mode = mode;
    screen.hidden = mode === "playing" || mode === "hangar";
    touchControls.hidden = mode !== "playing";
    actionButton.hidden = true;
    screenActions.replaceChildren();
    if (mode === "ready") {
      screenKicker.textContent = "FLIGHT SYSTEMS ONLINE";
      screenTitle.innerHTML = state.lastMission
        ? "RESUME THE<br /><span>MISSION</span>"
        : state.campaignCompleted ? "FRONTIER<br /><span>SECURED</span>" : "DEFEND THE<br /><span>FRONTIER</span>";
      screenCopy.textContent = state.lastMission
        ? "Your checkpoint is saved. Resume the mission; it restarts from the beginning of this sortie."
        : state.campaignCompleted
          ? "The solar threat is defeated. Replay any cleared sector or answer the optional moon distress calls."
          : "Take command, build your loadout, and fight through eight planetary sectors.";
      addScreenAction(state.lastMission ? "RESUME MISSION" : state.campaignCompleted ? "REPLAY CAMPAIGN" : "CONTINUE CAMPAIGN", "continue", "primary");
      addScreenAction("SELECT CAMPAIGN STAGE", "stages");
      addScreenAction("OPTIONAL MOON MISSIONS", "moons");
      addScreenAction("SHIP HANGAR", "hangar");
      addScreenAction("WEAPON SHOP", "shop");
      addScreenAction("SETTINGS", "settings");
    } else if (mode === "paused") {
      screenKicker.textContent = "FLIGHT SYSTEMS ON HOLD";
      screenTitle.innerHTML = "MISSION<br /><span>PAUSED</span>";
      screenCopy.textContent = "The action is paused. Resume flight, restart this sortie, view controls, or adjust settings.";
      addScreenAction("RESUME FLIGHT", "resume", "primary");
      addScreenAction("RESTART", "restart");
      addScreenAction("CONTROLS", "controls");
      addScreenAction("SETTINGS", "settings");
      addScreenAction("RETURN TO MAIN MENU", "main");
    } else if (mode === "controls") {
      screenKicker.textContent = "FLIGHT CONTROLS";
      screenTitle.innerHTML = "PILOT<br /><span>REFERENCE</span>";
      screenCopy.textContent = "Drag the left joystick to steer and hold FIRE to use your equipped weapon. Both controls work together. Keyboard: WASD or arrows to move, Space to fire, P or Escape to pause.";
      addScreenAction("BACK TO PAUSE", "controlsBack", "primary");
    } else if (mode === "gameover") {
      screenKicker.textContent = "SIGNAL LOST";
      screenTitle.innerHTML = "SHIP<br /><span>DESTROYED</span>";
      screenCopy.textContent = `Final score: ${state.score.toLocaleString()}. Your campaign checkpoint is saved.`;
      addScreenAction("RETRY MISSION", "retry", "primary");
      addScreenAction("MAIN MENU", "main");
    } else if (mode === "stageVictory" || mode === "victory") {
      screenKicker.textContent = mode === "victory" ? "CAMPAIGN COMPLETE" : "SECTOR SECURED";
      screenTitle.innerHTML = mode === "victory" ? "THE FRONTIER<br /><span>IS OURS</span>" : "BOSS<br /><span>DESTROYED</span>";
      screenCopy.textContent = mode === "victory"
        ? `All eight planetary stages are complete. Final score: ${state.score.toLocaleString()}.`
        : `${state.campaign?.mission.title || "Mission"} cleared. Credits and campaign progress saved.`;
      if (mode === "stageVictory" && state.campaign?.kind === "campaign" && state.campaign.stageIndex < campaignStages.length - 1) {
        addScreenAction("NEXT STAGE", "nextStage", "primary");
      }
      addScreenAction("MAIN MENU", "main");
    } else if (mode === "stageSelect") {
      screenKicker.textContent = "CAMPAIGN SELECT";
      screenTitle.innerHTML = "CHOOSE YOUR<br /><span>SECTOR</span>";
      screenCopy.textContent = `Sector ${state.unlockedStage + 1} is the current frontier. Cleared sectors remain available for replay.`;
      renderStageSelect();
    } else if (mode === "moonSelect") {
      screenKicker.textContent = "OPTIONAL OPERATIONS";
      screenTitle.innerHTML = "MOON<br /><span>MISSIONS</span>";
      screenCopy.textContent = "Optional short sorties earn credits without changing campaign stage progress.";
      for (const mission of moonMissions) addScreenAction(mission.title, `moon:${mission.id}`);
      addScreenAction("BACK TO MENU", "main");
    } else if (mode === "settings") {
      screenKicker.textContent = "FLIGHT SYSTEMS";
      screenTitle.innerHTML = "AUDIO<br /><span>SETTINGS</span>";
      screenCopy.textContent = "Adjust synthesized arcade sound effects. Changes are saved on this device.";
      renderSettings();
    }
    if (config && config.focus) {
      const focusTarget = screenActions.querySelector("button");
      if (focusTarget) focusTarget.focus();
    }
    pauseButton.disabled = mode !== "playing" && mode !== "paused";
    pauseButton.setAttribute("aria-label", mode === "paused" ? "Resume game" : "Pause game");
    pauseButton.textContent = mode === "paused" ? "▶" : "Ⅱ";
  }

  function resetGame() {
    state.score = 0;
    state.elapsed = 0;
    state.spawnTimer = 0.7;
    state.asteroidSpawnTimer = 1.8;
    state.celestialSpawnTimer = 11;
    state.nextCelestial = 0;
    state.sunSpawned = false;
    state.nextEntityId = 1;
    state.fireTimer = 0;
    state.volleyCount = 0;
    state.firingIndex = 0;
    state.shieldDelay = 0;
    state.invulnerable = 0;
    state.toastTimer = 0;
    state.boss = null;
    state.bossPhase = 1;
    state.bossShotTimer = 0;
    state.waveIndex = 0;
    state.missionTimer = 0;
    state.player.x = WIDTH / 2;
    state.player.y = HEIGHT - 68;
    state.player.health = MAX_HEALTH;
    state.player.shield = getMaxShield();
    state.playerShots = [];
    state.enemyShots = [];
    state.enemies = [];
    state.celestialEntities = [];
    state.debris = [];
    state.shockwaves = [];
    state.celestialEvents = [];
    state.particles = [];
    state.pickups = [];
    state.beams = [];
    state.keys.clear();
    clearTouchInputs();
    toast.hidden = true;
    updateHud();
  }

  function startGame() {
    startCampaign(state.unlockedStage);
  }

  function startCampaign(stageIndex) {
    const index = Math.max(0, Math.min(campaignStages.length - 1, Math.floor(stageIndex)));
    if (index > state.unlockedStage && !state.campaignCompleted) return;
    const mission = campaignStages[index];
    state.lastMission = { kind: "campaign", id: mission.id };
    resetGame();
    state.campaign = { kind: "campaign", stageIndex: index, waveIndex: 0, spawnTimer: 0.35, mission };
    const world = spawnCelestial(mission.body, 145, 75);
    world.speed = mission.body === "sun" ? 0 : 7;
    world.drift = 2;
    persistSave();
    state.missionTimer = 0;
    ensureAudio();
    setScreen("playing");
    showToast(`${mission.title} · PREPARE FOR CONTACT`, 1.8);
    playSfx("stage");
  }

  function startMoonMission(id) {
    const mission = moonMissions.find((item) => item.id === id);
    if (!mission) return;
    state.lastMission = { kind: "moon", id };
    resetGame();
    state.campaign = { kind: "moon", stageIndex: -1, waveIndex: 0, spawnTimer: 0.35, mission };
    const world = spawnCelestial(mission.body, 145, 75);
    world.speed = 7;
    world.drift = 2;
    persistSave();
    state.missionTimer = 0;
    ensureAudio();
    setScreen("playing");
    showToast(`${mission.title} · DISTRESS BEACON LOCKED`, 1.8);
    playSfx("stage");
  }

  function retryMission() {
    if (!state.lastMission || state.lastMission.kind === "campaign") {
      startCampaign(state.lastMission ? campaignStages.findIndex((stage) => stage.id === state.lastMission.id) : state.unlockedStage);
    } else startMoonMission(state.lastMission.id);
  }

  function renderStageSelect() {
    campaignStages.forEach((stage, index) => {
      const button = addScreenAction(`${String(index + 1).padStart(2, "0")} · ${stage.title}`, `stage:${index}`);
      button.disabled = index > state.unlockedStage && !state.campaignCompleted;
      if (button.disabled) button.title = "Clear the previous sector to unlock this stage.";
    });
    addScreenAction("BACK TO MENU", "main");
  }

  function renderSettings() {
    const label = document.createElement("label");
    label.className = "volume-control";
    label.htmlFor = "sfxVolume";
    const title = document.createElement("span");
    title.textContent = "SOUND EFFECTS";
    const slider = document.createElement("input");
    slider.id = "sfxVolume";
    slider.type = "range";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.05";
    slider.value = String(state.settings.sfxVolume);
    slider.addEventListener("input", () => {
      state.settings.sfxVolume = Number(slider.value);
      persistSave();
    });
    label.append(title, slider);
    screenActions.append(label);
    addScreenAction(state.settings.sfxVolume === 0 ? "UNMUTE" : "MUTE", "mute");
    addScreenAction(state.screenReturnMode === "paused" ? "BACK TO PAUSE" : "BACK TO MENU", "settingsBack", "primary");
  }

  function requestLandscape() {
    if (window.screen.orientation && typeof window.screen.orientation.lock === "function") {
      try {
        window.screen.orientation.lock("landscape").catch(() => {});
      } catch {
        // Orientation locking is optional; the portrait hint remains available as a fallback.
      }
    }
  }

  function resetJoystickVisual() {
    state.touch.x = 0;
    state.touch.y = 0;
    joystickKnob.style.transform = "translate(-50%, -50%)";
    joystick.classList.remove("active");
  }

  function clearTouchInputs() {
    activeFirePointers.clear();
    joystickPointerId = null;
    state.touch.fire = false;
    resetJoystickVisual();
    fireControl.classList.remove("pressed");
  }

  function ensureAudio() {
    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      state.audioContext = new AudioContext();
    }
    if (state.audioContext.state === "suspended") {
      state.audioContext.resume().catch((error) => console.warn("Arcade audio could not resume.", error));
    }
  }

  function playSfx(kind) {
    if (!state.settings.sfxVolume) return;
    ensureAudio();
    const audio = state.audioContext;
    if (!audio) return;
    const notes = { fire: [620, 0.045], hit: [180, 0.075], boom: [82, 0.19], pickup: [880, 0.11], stage: [440, 0.28], boss: [115, 0.24], victory: [660, 0.42] };
    const [frequency, duration] = notes[kind] || notes.hit;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = kind === "boom" || kind === "boss" ? "sawtooth" : "square";
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(35, frequency * 0.55), audio.currentTime + duration);
    gain.gain.setValueAtTime(Math.max(0.0001, state.settings.sfxVolume * 0.08), audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  function togglePause() {
    if (state.mode === "playing") {
      setScreen("paused");
      state.keys.clear();
      clearTouchInputs();
    } else if (state.mode === "paused") {
      setScreen("playing");
    }
  }

  function updateHud() {
    const health = Math.ceil(state.player.health);
    const shield = Math.ceil(state.player.shield);
    const shieldMax = getMaxShield();
    scoreElement.textContent = String(state.score).padStart(6, "0");
    healthValueElement.textContent = String(health).padStart(3, "0");
    shieldValueElement.textContent = String(shield).padStart(3, "0");
    healthBar.style.width = `${(state.player.health / MAX_HEALTH) * 100}%`;
    shieldBar.style.width = `${(state.player.shield / shieldMax) * 100}%`;
    healthMeter.setAttribute("aria-valuenow", String(health));
    shieldMeter.setAttribute("aria-valuemax", String(shieldMax));
    shieldMeter.setAttribute("aria-valuenow", String(shield));
    const activeObjects = state.enemies.length + state.celestialEntities.filter((entity) => entity.stage !== "exploding").length + Number(Boolean(state.boss));
    hostileMetricLabel.textContent = state.campaign ? "WAVE" : "OBJECTS";
    hostileCountElement.textContent = state.boss
      ? "BOSS"
      : state.campaign
        ? `${state.waveIndex}/${state.campaign.mission.waves.length}`
        : String(activeObjects).padStart(2, "0");
    weaponValueElement.textContent = currentWeapon().name.toUpperCase();
    creditValue.textContent = String(state.credits).padStart(4, "0");
    selectedLoadout.textContent = `${currentShip().name.toUpperCase()} · ${currentWeapon().name.toUpperCase()}`;
  }

  function createStars() {
    state.stars = Array.from({ length: 115 }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      size: Math.random() < 0.12 ? 2 : 1,
      speed: 18 + Math.random() * 95,
      alpha: 0.25 + Math.random() * 0.75
    }));
  }

  function spawnEnemy(type, x, y) {
    const roll = Math.random();
    const enemyType = type || (state.elapsed < 10
      ? (roll < 0.72 ? "scout" : "gunship")
      : roll < 0.42 ? "scout" : roll < 0.79 ? "gunship" : "dreadnought");
    const spec = enemyTypes[enemyType];
    const size = spec.size;
    state.enemies.push({
      type: enemyType,
      x: Number.isFinite(x) ? x : 42 + Math.random() * (WIDTH - 84),
      y: Number.isFinite(y) ? y : -size,
      size,
      health: spec.health,
      maxHealth: spec.health,
      speed: spec.speed * (0.86 + Math.random() * 0.3),
      phase: Math.random() * Math.PI * 2,
      fireTimer: 0.65 + Math.random() * spec.fireRate,
      hitFlash: 0,
      slowed: 0,
      pullX: 0,
      pullY: 0
    });
  }

  function spawnFormation(types) {
    const spacing = Math.min(98, (WIDTH - 100) / Math.max(1, types.length - 1));
    const startX = (WIDTH - spacing * (types.length - 1)) / 2;
    types.forEach((type, index) => {
      spawnEnemy(type, startX + spacing * index, -38 - (index % 2) * 26);
    });
  }

  function spawnBoss() {
    const session = state.campaign;
    const mission = session.mission;
    state.boss = {
      missionId: mission.id,
      name: mission.boss.name,
      color: mission.boss.color,
      pattern: mission.boss.pattern,
      x: WIDTH / 2,
      y: -82,
      size: 112,
      health: mission.boss.health,
      maxHealth: mission.boss.health,
      hitFlash: 0,
      phase: 1,
      phaseTime: 0,
      attackTimer: 1.8,
      warningTimer: 0,
      warningX: WIDTH / 2,
      remove: false
    };
    state.enemyShots.length = 0;
    showToast(`${mission.boss.name} · BOSS INBOUND`, 2.2);
    playSfx("boss");
  }

  function fireBossPattern() {
    const boss = state.boss;
    if (!boss) return;
    const speed = 175 + boss.phase * 35;
    const aim = Math.atan2(state.player.x - boss.x, state.player.y - boss.y);
    let angles;
    if (boss.pattern === "ring") {
      angles = Array.from({ length: 12 + boss.phase * 4 }, (_, index) => (Math.PI * 2 * index) / (12 + boss.phase * 4));
    } else if (boss.pattern === "cross") {
      angles = [-1.25, -0.8, -0.38, 0, 0.38, 0.8, 1.25];
    } else if (boss.pattern === "sweep") {
      angles = [-0.8, -0.55, -0.3, -0.05, 0.2, 0.45, 0.7];
    } else if (boss.pattern === "barrage") {
      angles = boss.phase === 1 ? [-0.5, 0, 0.5] : [-0.7, -0.45, -0.2, 0, 0.2, 0.45, 0.7];
    } else if (boss.pattern === "flare") {
      boss.warningX = Math.max(65, Math.min(WIDTH - 65, state.player.x + (Math.random() - 0.5) * 120));
      boss.warningTimer = 0.72;
      return;
    } else {
      angles = boss.phase === 3 ? [-0.3, 0, 0.3] : [0];
    }
    for (const offset of angles) {
      const direction = boss.pattern === "ring" ? offset : aim + offset;
      state.enemyShots.push({
        x: boss.x,
        y: boss.y + boss.size * 0.32,
        vx: Math.sin(direction) * speed,
        vy: Math.cos(direction) * speed,
        radius: boss.phase === 3 ? 6 : 5,
        color: boss.color,
        bossShot: true
      });
    }
  }

  function damageBoss(amount, color) {
    const boss = state.boss;
    if (!boss || boss.health <= 0 || state.mode !== "playing") return;
    boss.health = Math.max(0, boss.health - amount);
    boss.hitFlash = 0.1;
    addExplosion(boss.x + (Math.random() - 0.5) * boss.size * 0.6, boss.y + (Math.random() - 0.5) * boss.size * 0.5, color || boss.color, 3, 55);
    const ratio = boss.health / boss.maxHealth;
    const nextPhase = ratio <= 0.3 ? 3 : ratio <= 0.65 ? 2 : 1;
    if (nextPhase > boss.phase) {
      boss.phase = nextPhase;
      boss.attackTimer = 0.45;
      showToast(`${boss.name} · PHASE ${boss.phase}`, 1.5);
      playSfx("boss");
    }
    if (boss.health <= 0) completeMission();
  }

  function updateBoss(delta) {
    const boss = state.boss;
    if (!boss) return;
    boss.phaseTime += delta;
    boss.hitFlash = Math.max(0, boss.hitFlash - delta);
    boss.y = Math.min(105, boss.y + 75 * delta);
    boss.x = WIDTH / 2 + Math.sin(boss.phaseTime * (0.55 + boss.phase * 0.12)) * (190 + boss.phase * 18);
    boss.attackTimer -= delta;
    if (boss.warningTimer > 0) {
      boss.warningTimer -= delta;
      if (boss.warningTimer <= 0) {
        for (let index = 0; index < 5; index += 1) {
          state.enemyShots.push({ x: boss.warningX, y: boss.y + 32 + index * 13, vx: (index - 2) * 11, vy: 320, radius: 7, color: boss.color, bossShot: true });
        }
      }
    } else if (boss.attackTimer <= 0) {
      fireBossPattern();
      boss.attackTimer = Math.max(0.55, 1.65 - boss.phase * 0.42);
    }
    if (Math.hypot(boss.x - state.player.x, boss.y - state.player.y) < boss.size * 0.48 + 14) {
      damagePlayer(28);
    }
  }

  function completeMission() {
    if (!state.campaign) return;
    const session = state.campaign;
    const reward = session.mission.reward;
    const campaignEnding = session.kind === "campaign" && session.stageIndex === campaignStages.length - 1;
    state.credits += reward;
    state.score += session.kind === "campaign" ? 1200 + session.stageIndex * 300 : 500;
    if (session.kind === "campaign") {
      state.unlockedStage = Math.max(state.unlockedStage, Math.min(campaignStages.length - 1, session.stageIndex + 1));
      if (campaignEnding) state.campaignCompleted = true;
    }
    state.lastMission = null;
    persistSave();
    addExplosion(state.boss.x, state.boss.y, state.boss.color, 54, 250);
    state.boss = null;
    state.enemyShots.length = 0;
    showToast(`MISSION CLEAR · +${reward} CREDITS`, 2.2);
    playSfx("victory");
    setScreen(campaignEnding ? "victory" : "stageVictory", { focus: true });
  }

  function updateCampaign(delta) {
    if (!state.campaign) return;
    state.missionTimer += delta;
    if (state.boss) {
      updateBoss(delta);
      return;
    }
    const session = state.campaign;
    session.spawnTimer -= delta;
    if (session.waveIndex < session.mission.waves.length) {
      if (!session.waveActive && session.spawnTimer <= 0) {
        spawnFormation(session.mission.waves[session.waveIndex]);
        session.waveActive = true;
        state.waveIndex = session.waveIndex + 1;
        showToast(`WAVE ${state.waveIndex} / ${session.mission.waves.length}`, 1.1);
      } else if (session.waveActive && state.enemies.length === 0) {
        session.waveActive = false;
        session.waveIndex += 1;
        session.spawnTimer = 1.35;
      }
      return;
    }
    if (state.enemies.length === 0 && session.spawnTimer <= 0) spawnBoss();
  }

  function recordCelestialEvent(entity, stage) {
    state.celestialEvents.push({ id: entity.id, name: entity.name, stage, elapsed: state.elapsed });
    if (state.celestialEvents.length > 120) state.celestialEvents.shift();
  }

  function spawnCelestial(id, x = 70 + Math.random() * (WIDTH - 140), y) {
    const config = celestialById.get(id) || asteroidTypes.get(id);
    if (!config) throw new Error(`Unknown celestial object: ${id}`);
    const radius = config.kind === "asteroid" ? config.size : config.size / 2;
    const entity = {
      uid: state.nextEntityId++,
      id: config.id,
      name: config.name,
      kind: config.kind,
      config,
      x,
      y: y === undefined ? -radius - 2 : y,
      radius,
      health: config.health,
      maxHealth: config.health,
      stage: "intact",
      stageIndex: 0,
      targetStageIndex: 0,
      stageTimer: 0,
      phase: Math.random() * Math.PI * 2,
      speed: config.speed,
      slowed: 0,
      fireTimer: config.fireRate ? config.fireRate : 0,
      attackWarning: 0,
      attackTimer: 2 + Math.random() * 2,
      warningX: WIDTH / 2,
      hitFlash: 0,
      remove: false
    };
    state.celestialEntities.push(entity);
    recordCelestialEvent(entity, "intact");
    return entity;
  }

  function nextBodyId() {
    const bodies = celestialData.bodies.filter((body) => body.kind !== "sun");
    const body = bodies[state.nextCelestial % bodies.length];
    state.nextCelestial += 1;
    return body.id;
  }

  function spawnRandomAsteroid() {
    const type = celestialData.asteroids[Math.floor(Math.random() * celestialData.asteroids.length)];
    const entity = spawnCelestial(type.id);
    const scale = 0.78 + Math.random() * 0.55;
    entity.radius *= scale;
    entity.maxHealth = Math.max(5, Math.round(type.health * scale));
    entity.health = entity.maxHealth;
    entity.speed *= 0.82 + Math.random() * 0.38;
    entity.drift = (Math.random() - 0.5) * 55;
    entity.rotation = Math.random() * Math.PI * 2;
    entity.rotationSpeed = (Math.random() - 0.5) * 0.7;
  }

  function spawnCelestialWave() {
    if (state.elapsed >= 58 && !state.sunSpawned) {
      spawnCelestial("sun", WIDTH / 2, 116);
      state.sunSpawned = true;
      showToast("SOLAR SIGNATURE DETECTED · BOSS INBOUND", 2);
      return;
    }
    if (state.celestialEntities.filter((entity) => entity.kind !== "asteroid" && entity.stage !== "exploding").length >= 2) return;
    const id = nextBodyId();
    const entity = spawnCelestial(id);
    entity.drift = (Math.random() - 0.5) * 18;
    entity.rotationSpeed = (Math.random() - 0.5) * 0.12;
    entity.y = -entity.radius - 2;
    showToast(`${entity.name.toUpperCase()} INBOUND`, 1.1);
  }

  function advanceCelestialStage(entity, stage) {
    const stageOrder = ["intact", "cracked1", "cracked2", "breaking", "exploding"];
    const nextIndex = stageOrder.indexOf(stage);
    if (nextIndex < 0 || nextIndex <= entity.stageIndex) return;
    entity.stageIndex = nextIndex;
    entity.stage = stage;
    recordCelestialEvent(entity, stage);
    if (stage === "cracked1") {
      entity.stageTimer = 0.14;
      addExplosion(entity.x, entity.y, entity.config.light, 5, 65);
    } else if (stage === "cracked2") {
      entity.stageTimer = 0.14;
      addExplosion(entity.x, entity.y, entity.config.light, 9, 100);
    } else if (stage === "breaking") {
      entity.stageTimer = entity.kind === "asteroid" ? 0.16 : 0.42;
      addExplosion(entity.x, entity.y, entity.config.color, entity.kind === "sun" ? 28 : 14, 135);
    } else if (stage === "exploding") {
      entity.stageTimer = entity.kind === "sun" ? 1.15 : 0.65;
      const radius = entity.kind === "asteroid" ? 42 : Math.max(74, entity.radius * 1.65);
      state.shockwaves.push({ x: entity.x, y: entity.y, radius, current: 4, life: 0.6, maxLife: 0.6, damage: entity.config.damage * 0.65, hitPlayer: false });
      addExplosion(entity.x, entity.y, entity.config.light, entity.kind === "sun" ? 72 : entity.kind === "asteroid" ? 20 : 42, entity.kind === "sun" ? 290 : 210);
      if (entity.kind === "sun") showToast("SOLAR CORE BREACHED · EVACUATE THE FLARE", 2);
    }
  }

  function damageCelestial(entity, amount, color) {
    if (entity.remove || entity.health <= 0 || entity.stage === "breaking" || entity.stage === "exploding") return;
    entity.health = Math.max(0, entity.health - amount);
    entity.hitFlash = 0.12;
    const ratio = entity.health / entity.maxHealth;
    const cracked1 = celestialStages.find((stage) => stage.id === "cracked1").threshold;
    const cracked2 = celestialStages.find((stage) => stage.id === "cracked2").threshold;
    const breaking = celestialStages.find((stage) => stage.id === "breaking").threshold;
    if (ratio <= breaking) {
      entity.health = 0;
      entity.targetStageIndex = 3;
    } else if (ratio <= cracked2) entity.targetStageIndex = 2;
    else if (ratio <= cracked1) entity.targetStageIndex = 1;
    if (entity.stageIndex < entity.targetStageIndex && entity.stageTimer <= 0) {
      const order = ["intact", "cracked1", "cracked2", "breaking", "exploding"];
      advanceCelestialStage(entity, order[entity.stageIndex + 1]);
    }
    addExplosion(entity.x, entity.y, color || entity.config.light, entity.kind === "asteroid" ? 3 : 5, 45);
  }

  function createDebris(entity) {
    recordCelestialEvent(entity, "debris");
    const pieces = entity.kind === "asteroid" ? 5 : entity.kind === "sun" ? 26 : 12;
    for (let index = 0; index < pieces; index += 1) {
      const angle = (index / pieces) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 42 + Math.random() * (entity.kind === "sun" ? 200 : 115);
      const life = 0.9 + Math.random() * 1.8;
      state.debris.push({
        x: entity.x + Math.cos(angle) * entity.radius * 0.3,
        y: entity.y + Math.sin(angle) * entity.radius * 0.3,
        vx: Math.cos(angle) * speed + (entity.drift || 0) * 0.4,
        vy: Math.sin(angle) * speed + entity.speed * 0.4,
        size: 2 + Math.random() * (entity.kind === "sun" ? 7 : 5),
        color: index % 3 === 0 ? entity.config.light : entity.config.color,
        life,
        maxLife: life,
        damage: entity.config.damage * 0.22,
        remove: false
      });
    }
    if (entity.kind === "asteroid") {
      const reward = entity.config.credits || 0;
      state.score += entity.config.points || 0;
      state.credits += reward;
      persistSave();
    } else {
      state.score += entity.kind === "sun" ? 3000 : entity.kind === "planet" ? 550 : 280;
      state.credits += entity.kind === "sun" ? 450 : entity.kind === "planet" ? 85 : 45;
      persistSave();
      if (Math.random() < 0.55) spawnPickup(entity.x, entity.y, choosePickupWeapon());
      showToast(`${entity.name.toUpperCase()} DESTROYED`, 1.3);
    }
    entity.remove = true;
  }

  function updateCelestialDamageStages(delta) {
    for (const entity of state.celestialEntities) {
      if (entity.stage === "cracked1" || entity.stage === "cracked2") {
        entity.stageTimer -= delta;
        if (entity.stageTimer <= 0 && entity.stageIndex < entity.targetStageIndex) {
          const order = ["intact", "cracked1", "cracked2", "breaking", "exploding"];
          advanceCelestialStage(entity, order[entity.stageIndex + 1]);
        }
      } else if (entity.stage === "breaking") {
        entity.stageTimer -= delta;
        if (entity.stageTimer <= 0) advanceCelestialStage(entity, "exploding");
      } else if (entity.stage === "exploding") {
        entity.stageTimer -= delta;
        if (entity.stageTimer <= 0) createDebris(entity);
      }
    }
    state.celestialEntities = state.celestialEntities.filter((entity) => !entity.remove);
  }

  function updateCelestialSpawns(delta) {
    state.asteroidSpawnTimer -= delta;
    const asteroidLimit = state.campaign ? 4 : 7;
    if (state.asteroidSpawnTimer <= 0 && state.celestialEntities.filter((entity) => entity.kind === "asteroid").length < asteroidLimit) {
      spawnRandomAsteroid();
      state.asteroidSpawnTimer = state.campaign ? 5 + Math.random() * 3 : 2.6 + Math.random() * 2.1;
    }

    if (state.campaign) return;
    state.celestialSpawnTimer -= delta;
    if (state.celestialSpawnTimer <= 0) {
      spawnCelestialWave();
      state.celestialSpawnTimer = 18 + Math.random() * 9;
    }
  }

  function fireCelestialAttack(entity) {
    const dx = state.player.x - entity.x;
    const dy = state.player.y - entity.y;
    const angle = Math.atan2(dy, dx);
    const speed = entity.kind === "sun" ? 225 : 155;
    const shots = entity.kind === "sun" ? [-0.28, 0, 0.28] : [0];
    for (const offset of shots) {
      const direction = angle + offset;
      state.enemyShots.push({
        x: entity.x + Math.cos(direction) * entity.radius * 0.6,
        y: entity.y + Math.sin(direction) * entity.radius * 0.6,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed,
        radius: entity.kind === "sun" ? 7 : 5,
        color: entity.config.light,
        solar: entity.kind === "sun",
        sourceUid: entity.uid
      });
    }
  }

  function damageEntityByContact(entity) {
    if (state.invulnerable > 0) return;
    damagePlayer(entity.config.damage);
    if (entity.kind === "asteroid") damageCelestial(entity, Math.max(3, entity.maxHealth * 0.4));
    addExplosion(entity.x, entity.y, entity.config.color, 8, 95);
  }

  function updateCelestials(delta) {
    updateCelestialSpawns(delta);
    for (const entity of state.celestialEntities) {
      if (entity.stage === "breaking" || entity.stage === "exploding") continue;
      entity.phase += delta;
      entity.hitFlash = Math.max(0, entity.hitFlash - delta);
      entity.slowed = Math.max(0, entity.slowed - delta);
      if (entity.kind === "sun") {
        entity.x = WIDTH / 2 + Math.sin(state.elapsed * 0.23) * 205;
        entity.y = 119 + Math.sin(state.elapsed * 0.47) * 12;
        entity.attackTimer -= delta;
        if (entity.attackWarning > 0) {
          entity.attackWarning -= delta;
          if (entity.attackWarning <= 0) {
            if (Math.abs(state.player.x - entity.warningX) < 34) damagePlayer(entity.config.damage);
            state.shockwaves.push({ x: entity.warningX, y: HEIGHT * 0.56, radius: HEIGHT * 0.72, current: 6, life: 0.48, maxLife: 0.48, damage: 0, hitPlayer: true, vertical: true });
            entity.attackTimer = entity.config.fireRate;
          }
        } else if (entity.attackTimer <= 0) {
          entity.warningX = 120 + Math.random() * (WIDTH - 240);
          entity.attackWarning = 1.05;
        }
      } else {
        const slow = entity.slowed > 0 ? 0.35 : 1;
        entity.y += entity.speed * slow * delta;
        entity.x += Math.sin(entity.phase * 1.2) * (entity.drift || 10) * slow * delta;
        if (entity.kind === "planet" && entity.config.gravity) {
          const dx = entity.x - state.player.x;
          const dy = entity.y - state.player.y;
          const distance = Math.hypot(dx, dy);
          if (distance < entity.config.gravity + entity.radius) {
            state.player.x += (dx / Math.max(distance, 1)) * entity.config.gravity * 0.11 * delta;
          }
        }
        if (entity.config.fireRate) {
          entity.fireTimer -= delta;
          if (entity.fireTimer <= 0 && entity.y < HEIGHT * 0.68 && entity.y > -entity.radius) {
            fireCelestialAttack(entity);
            entity.fireTimer = entity.config.fireRate;
          }
        }
      }
      const collisionRadius = entity.radius * (entity.config.feature === "rings" ? 1.25 : 1);
      const distance = Math.hypot(entity.x - state.player.x, entity.y - state.player.y);
      if (distance < collisionRadius + 14) damageEntityByContact(entity);
      if (entity.kind !== "sun" && entity.y > HEIGHT + entity.radius + 3) entity.remove = true;
    }
    updateCelestialDamageStages(delta);

    for (const fragment of state.debris) {
      fragment.x += fragment.vx * delta;
      fragment.y += fragment.vy * delta;
      fragment.vx *= Math.max(0, 1 - delta * 0.5);
      fragment.vy *= Math.max(0, 1 - delta * 0.5);
      fragment.life -= delta;
      if ((fragment.x - state.player.x) ** 2 + (fragment.y - state.player.y) ** 2 < (fragment.size + 13) ** 2) {
        damagePlayer(fragment.damage);
        fragment.remove = true;
      }
      if (fragment.life <= 0 || fragment.x < -24 || fragment.x > WIDTH + 24 || fragment.y < -24 || fragment.y > HEIGHT + 24) {
        fragment.remove = true;
      }
    }
    state.debris = state.debris.filter((fragment) => !fragment.remove);

    for (const wave of state.shockwaves) {
      wave.current += (wave.radius / wave.maxLife) * delta;
      wave.life -= delta;
      if (!wave.hitPlayer && wave.damage > 0 &&
        Math.abs(Math.hypot(state.player.x - wave.x, state.player.y - wave.y) - wave.current) < 14) {
        wave.hitPlayer = true;
        damagePlayer(wave.damage);
      }
    }
    state.shockwaves = state.shockwaves.filter((wave) => wave.life > 0);
  }

  function addExplosion(x, y, color, count = 15, power = 150) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * power;
      const life = 0.28 + Math.random() * 0.6;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 2 + Math.floor(Math.random() * 3),
        color
      });
    }
  }

  function shipDamageMultiplier(weapon) {
    const ship = currentShip();
    let multiplier = ship.stats.damage * getShipDamageUpgrade() * getWeaponDamageUpgrade();
    if (ship.passive === "focus") multiplier *= 1.4;
    if (ship.passive === "heavy") multiplier *= 1.2;
    if (ship.passive === "crit" && Math.random() < 0.15) multiplier *= 2;
    if (ship.passive === "explosive" && weapon.behavior === "splash") multiplier *= 1.2;
    return multiplier;
  }

  function makeProjectile(x, y, weapon, angle, damageFactor = 1) {
    const speed = weapon.speed * (currentShip().id === "aquila" ? 1.22 : 1);
    const mine = weapon.behavior === "mine";
    return {
      x,
      y: y + (mine ? 22 : 0),
      vx: mine ? 0 : Math.sin(angle) * speed,
      vy: mine ? 0 : -Math.cos(angle) * speed,
      speed,
      angle,
      radius: weapon.radius,
      damage: weapon.damage * shipDamageMultiplier(weapon) * damageFactor,
      color: weapon.color,
      behavior: weapon.behavior,
      splash: weapon.splash || 0,
      pierce: (weapon.pierce || 0) + (currentShip().passive === "pierce" ? (currentShip().id === "aquila" ? 2 : 1) : 0),
      bounces: weapon.bounces || 0,
      chains: weapon.chains || 0,
      slow: weapon.slow || 0,
      turnRate: weapon.turnRate || 0,
      age: 0,
      hitIds: new Set()
    };
  }

  function firePlayerWeapon() {
    const weapon = currentWeapon();
    const ship = currentShip();
    const pattern = data.patterns[ship.pattern].angle;
    const mounts = ship.pattern === "alternating"
      ? [ship.mounts[state.firingIndex++ % ship.mounts.length]]
      : ship.mounts;
    const angles = weapon.behavior === "scatter"
      ? [-0.38, -0.19, 0, 0.19, 0.38]
      : pattern;
    if (weapon.behavior === "scatter") {
      const mount = mounts.reduce((closest, candidate) => Math.abs(candidate.x) < Math.abs(closest.x) ? candidate : closest);
      for (const angle of angles) {
        state.playerShots.push(makeProjectile(state.player.x + mount.x, state.player.y + mount.y, weapon, angle));
      }
    } else {
      for (const [index, mount] of mounts.entries()) {
        const mountAngles = angles.length === mounts.length ? [angles[index]] : angles;
        for (const angle of mountAngles) {
          let adjustedAngle = angle;
          if (ship.pattern === "converge") adjustedAngle += -mount.x * 0.012;
          state.playerShots.push(makeProjectile(state.player.x + mount.x, state.player.y + mount.y, weapon, adjustedAngle));
        }
      }
    }
    state.volleyCount += 1;
    if (ship.passive === "volley" && state.volleyCount % 4 === 0) {
      state.playerShots.push(makeProjectile(state.player.x, state.player.y - 12, weapon, 0, 0.65));
    }
    if (ship.passive === "overcharge" && state.volleyCount % 6 === 0) {
      const flare = makeProjectile(state.player.x, state.player.y - 13, weapon, 0, 0.7);
      flare.behavior = "splash";
      flare.splash = 48;
      state.playerShots.push(flare);
      addExplosion(state.player.x, state.player.y - 18, "#ffb467", 8, 60);
    }
    addExplosion(state.player.x, state.player.y - 26, weapon.color, 2, 28);
    playSfx("fire");
  }

  function fireEnemyWeapon(enemy) {
    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const speed = enemy.type === "dreadnought" ? 205 : 245;
    const slow = currentShip().passive === "slow" ? 0.82 : 1;
    state.enemyShots.push({
      x: enemy.x,
      y: enemy.y + enemy.size * 0.32,
      vx: (dx / distance) * speed * slow,
      vy: (dy / distance) * speed * slow,
      radius: enemy.type === "dreadnought" ? 5 : 4,
      color: enemyTypes[enemy.type].color
    });
  }

  function damagePlayer(amount) {
    if (state.invulnerable > 0 || state.mode !== "playing") return;
    const ship = currentShip();
    state.invulnerable = ship.passive === "evasive" ? 1.05 : 0.72;
    state.shieldDelay = 2.2;
    const absorbed = Math.min(state.player.shield, amount);
    state.player.shield -= absorbed;
    const hullDamage = amount - absorbed;
    const hullResistance = ship.passive === "armor" ? 0.75 : ship.passive === "starter" ? 0.9 : 1;
    state.player.health = Math.max(0, state.player.health - hullDamage * hullResistance);
    addExplosion(state.player.x, state.player.y, absorbed > 0 ? "#62e5ff" : "#ff637d", 10, 105);
    playSfx("hit");
    if (state.player.health <= 0) {
      addExplosion(state.player.x, state.player.y, "#a8dfff", 42, 270);
      setScreen("gameover", { focus: true });
    }
    updateHud();
  }

  function updatePlayer(delta) {
    const ship = currentShip();
    let speed = 300 * ship.stats.speed * (ship.passive === "speed" ? 1.15 : 1);
    if (state.celestialEntities.some((entity) =>
      entity.config.slowAura && Math.hypot(entity.x - state.player.x, entity.y - state.player.y) < entity.radius + 100
    )) speed *= 0.72;
    if (ship.passive === "pickup" && state.pickups.length) speed *= 1.05;
    let horizontal = Number(state.keys.has("ArrowRight") || state.keys.has("KeyD"))
      - Number(state.keys.has("ArrowLeft") || state.keys.has("KeyA")) + state.touch.x;
    let vertical = Number(state.keys.has("ArrowDown") || state.keys.has("KeyS"))
      - Number(state.keys.has("ArrowUp") || state.keys.has("KeyW")) + state.touch.y;
    const length = Math.hypot(horizontal, vertical);
    if (length > 0) {
      horizontal /= length;
      vertical /= length;
    }
    state.player.x += horizontal * speed * delta;
    state.player.y += vertical * speed * delta;
    state.player.x = Math.max(26, Math.min(WIDTH - 26, state.player.x));
    state.player.y = Math.max(30, Math.min(HEIGHT - 34, state.player.y));

    state.fireTimer -= delta;
    if (currentWeapon().behavior !== "beam" && (state.keys.has("Space") || state.touch.fire) && state.fireTimer <= 0) {
      firePlayerWeapon();
      state.fireTimer = currentWeapon().cooldown / ship.stats.fireRate;
    }

    state.shieldDelay = Math.max(0, state.shieldDelay - delta);
    const regenRate = ship.passive === "regen" ? 16.5 : 11;
    if (state.shieldDelay === 0 && state.player.shield < getMaxShield()) {
      state.player.shield = Math.min(getMaxShield(), state.player.shield + regenRate * delta);
    }
    state.invulnerable = Math.max(0, state.invulnerable - delta);
  }

  function choosePickupWeapon() {
    const locked = data.weapons.filter((weapon) => !state.ownedWeapons.has(weapon.id));
    const pool = locked.length ? locked : data.weapons;
    const total = pool.reduce((sum, weapon) => sum + weapon.dropWeight, 0);
    let roll = Math.random() * total;
    for (const weapon of pool) {
      roll -= weapon.dropWeight;
      if (roll <= 0) return weapon.id;
    }
    return pool[pool.length - 1].id;
  }

  function spawnPickup(x, y, forcedWeapon) {
    const id = forcedWeapon || choosePickupWeapon();
    state.pickups.push({
      type: "weapon",
      weaponId: id,
      x,
      y,
      vx: (Math.random() - 0.5) * 44,
      vy: 34 + Math.random() * 22,
      age: 0,
      phase: Math.random() * Math.PI * 2
    });
  }

  function rewardKill(enemy) {
    const spec = enemyTypes[enemy.type];
    const ship = currentShip();
    const multiplier = ship.passive === "salvage" ? 1.3 : 1;
    const bountyBonus = ship.passive === "bounty" && Math.random() < 0.2 ? 2 : 1;
    const pickupBonus = ship.passive === "pickup" ? 1.25 : 1;
    state.score += spec.points;
    state.credits += Math.max(1, Math.round(spec.credits * multiplier * bountyBonus * pickupBonus));
    if ((ship.passive === "lifesteal" || ship.passive === "repair") && state.player.health < MAX_HEALTH) {
      state.player.health = Math.min(MAX_HEALTH, state.player.health + (ship.passive === "lifesteal" ? 1.5 : 0.5));
    }
    if (Math.random() < (ship.passive === "pickup" ? 0.35 : 0.24)) spawnPickup(enemy.x, enemy.y);
    persistSave();
    showToast(`${spec.name} ELIMINATED · +${spec.credits} CREDITS`, 0.9);
  }

  function damageEnemy(enemy, damage, color) {
    if (enemy.remove) return;
    if (enemy.boss) {
      damageBoss(damage, color);
      return;
    }
    enemy.health -= damage;
    enemy.hitFlash = 0.1;
    addExplosion(enemy.x, enemy.y, color || "#d9faff", 3, 48);
    if (enemy.health <= 0) {
      enemy.remove = true;
      const spec = enemyTypes[enemy.type];
      addExplosion(enemy.x, enemy.y, spec.color, enemy.type === "dreadnought" ? 30 : 19, 190);
      playSfx("boom");
      rewardKill(enemy);
      if (currentShip().passive === "blast") {
        for (const neighbor of state.enemies) {
          if (neighbor.remove) continue;
          if (Math.hypot(neighbor.x - enemy.x, neighbor.y - enemy.y) < 82) {
            damageEnemy(neighbor, 1.2 * currentShip().stats.damage, currentShip().color);
          }
        }
      }
    }
  }

  function damageArea(x, y, radius, damage, color, pull) {
    for (const enemy of state.enemies) {
      if (enemy.remove) continue;
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance <= radius + enemy.size * 0.2) {
        const falloff = Math.max(0.25, 1 - distance / (radius * 1.35));
        damageEnemy(enemy, damage * falloff, color);
        if (pull && distance > 1) {
          enemy.pullX += (-dx / distance) * 125;
          enemy.pullY += (-dy / distance) * 125;
        }
      }
    }
    for (const entity of state.celestialEntities) {
      if (entity.remove || entity.stage === "breaking" || entity.stage === "exploding") continue;
      const distance = Math.hypot(entity.x - x, entity.y - y);
      if (distance <= radius + entity.radius) {
        const falloff = Math.max(0.25, 1 - distance / (radius + entity.radius));
        damageCelestial(entity, damage * falloff, color);
      }
    }
    if (state.boss) {
      const distance = Math.hypot(state.boss.x - x, state.boss.y - y);
      if (distance <= radius + state.boss.size * 0.3) {
        damageBoss(damage * Math.max(0.25, 1 - distance / (radius + state.boss.size)), color);
      }
    }
    addExplosion(x, y, color, pull ? 24 : 16, pull ? 145 : 190);
  }

  function detonateProjectile(shot) {
    const radius = shot.splash || 45;
    damageArea(shot.x, shot.y, radius, shot.damage, shot.color, shot.behavior === "vortex");
    if (shot.behavior === "freeze") {
      for (const enemy of state.enemies) {
        if (Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < radius) enemy.slowed = 2.2;
      }
    }
    shot.remove = true;
  }

  function splitCluster(shot) {
    for (const angle of [-0.48, -0.24, 0, 0.24, 0.48]) {
      const child = makeProjectile(shot.x, shot.y, currentWeapon(), angle, 0.55);
      child.behavior = "splash";
      child.splash = 28;
      child.age = 0.7;
      child.damage = shot.damage * 0.55;
      state.playerShots.push(child);
    }
    addExplosion(shot.x, shot.y, shot.color, 8, 90);
    shot.remove = true;
  }

  function chainProjectile(shot, target) {
    let origin = target;
    for (let index = 0; index < shot.chains; index += 1) {
      const next = state.enemies
        .filter((enemy) => !enemy.remove && !shot.hitIds.has(enemy))
        .map((enemy) => ({ enemy, distance: Math.hypot(enemy.x - origin.x, enemy.y - origin.y) }))
        .filter((item) => item.distance < 135)
        .sort((a, b) => a.distance - b.distance)[0];
      if (!next) break;
      shot.hitIds.add(next.enemy);
      damageEnemy(next.enemy, shot.damage * (0.72 ** (index + 1)), shot.color);
      state.beams.push({ x1: origin.x, y1: origin.y, x2: next.enemy.x, y2: next.enemy.y, color: shot.color, life: 0.12 });
      origin = next.enemy;
    }
  }

  function findNearestEnemy(x, y, excluded) {
    return state.enemies
      .filter((enemy) => !enemy.remove && !excluded.has(enemy))
      .map((enemy) => ({ enemy, distance: Math.hypot(enemy.x - x, enemy.y - y) }))
      .filter((item) => item.distance < 290)
      .sort((a, b) => a.distance - b.distance)[0]?.enemy || null;
  }

  function handleProjectileHit(shot, enemy) {
    shot.hitIds.add(enemy);
    damageEnemy(enemy, shot.damage, shot.color);
    if (shot.behavior === "freeze") enemy.slowed = Math.max(enemy.slowed, 2.2);
    if (shot.behavior === "splash" || shot.behavior === "nova" || shot.behavior === "vortex" || shot.behavior === "mine") {
      damageArea(shot.x, shot.y, shot.splash || 70, shot.damage * (shot.behavior === "nova" ? 1.35 : 0.7), shot.color, shot.behavior === "vortex");
      shot.remove = true;
    } else if (shot.behavior === "chain") {
      chainProjectile(shot, enemy);
      shot.remove = true;
    } else if (shot.behavior === "ricochet" && shot.bounces > 0) {
      shot.bounces -= 1;
      shot.damage *= 0.82;
      const target = findNearestEnemy(enemy.x, enemy.y, shot.hitIds) ||
        (state.boss && !shot.hitIds.has(state.boss) && Math.hypot(state.boss.x - enemy.x, state.boss.y - enemy.y) < 290 ? state.boss : null);
      if (target) {
        const angle = Math.atan2(target.x - enemy.x, enemy.y - target.y);
        shot.x = enemy.x;
        shot.y = enemy.y;
        shot.vx = Math.sin(angle) * shot.speed;
        shot.vy = -Math.cos(angle) * shot.speed;
      } else shot.remove = true;
    } else if (shot.pierce > 0) {
      shot.pierce -= 1;
      shot.damage *= 0.88;
    } else shot.remove = true;

    if (!shot.remove && currentShip().passive === "chain") chainProjectile({ ...shot, chains: 1 }, enemy);
    if (currentShip().passive === "explosive") {
      damageArea(shot.x, shot.y, 36, shot.damage * 0.35, currentShip().color, false);
    }
  }

  function handleCelestialProjectileHit(shot, entity) {
    shot.hitIds.add(entity.uid);
    if (shot.behavior === "splash" || shot.behavior === "nova" || shot.behavior === "vortex" || shot.behavior === "mine") {
      detonateProjectile(shot);
      return;
    }
    damageCelestial(entity, shot.damage, shot.color);
    if (shot.behavior === "freeze") entity.slowed = Math.max(entity.slowed, 2.2);
    if (shot.behavior === "chain") {
      const nearby = state.celestialEntities
        .filter((candidate) => candidate !== entity && !candidate.remove && candidate.stage !== "exploding")
        .map((candidate) => ({ candidate, distance: Math.hypot(candidate.x - entity.x, candidate.y - entity.y) }))
        .filter((item) => item.distance < 135)
        .sort((a, b) => a.distance - b.distance)[0];
      if (nearby) {
        damageCelestial(nearby.candidate, shot.damage * 0.65, shot.color);
        state.beams.push({ x1: entity.x, y1: entity.y, x2: nearby.candidate.x, y2: nearby.candidate.y, color: shot.color, life: 0.12 });
      }
    }
    if (shot.behavior === "ricochet" && shot.bounces > 0) {
      shot.bounces -= 1;
      shot.damage *= 0.82;
    } else if (shot.pierce > 0) {
      shot.pierce -= 1;
      shot.damage *= 0.88;
    } else shot.remove = true;
  }

  function fireBeam() {
    const weapon = currentWeapon();
    const ship = currentShip();
    const pattern = data.patterns[ship.pattern].angle;
    const mounts = ship.pattern === "alternating"
      ? [ship.mounts[state.firingIndex++ % ship.mounts.length]]
      : ship.mounts;
    const struck = new Set();
    for (const [index, mount] of mounts.entries()) {
      const angle = pattern.length === mounts.length ? pattern[index] : 0;
      const x1 = state.player.x + mount.x;
      const y1 = state.player.y + mount.y;
      const x2 = x1 + Math.tan(angle) * y1;
      const lineX = x2 - x1;
      const lineY = -y1;
      const lineLengthSquared = lineX * lineX + lineY * lineY;
      state.beams.push({ x1, y1, x2, y2: 0, color: weapon.color, life: 0.17, width: 5 });
      for (const enemy of state.enemies) {
        if (enemy.remove || struck.has(enemy)) continue;
        const along = Math.max(0, Math.min(1, ((enemy.x - x1) * lineX + (enemy.y - y1) * lineY) / lineLengthSquared));
        const nearestX = x1 + along * lineX;
        const nearestY = y1 + along * lineY;
        if (Math.hypot(enemy.x - nearestX, enemy.y - nearestY) < 5 + enemy.size * 0.18) {
          struck.add(enemy);
          damageEnemy(enemy, weapon.damage * shipDamageMultiplier(weapon), weapon.color);
        }
      }
      for (const entity of state.celestialEntities) {
        if (entity.remove || entity.stage === "breaking" || entity.stage === "exploding") continue;
        const along = Math.max(0, Math.min(1, ((entity.x - x1) * lineX + (entity.y - y1) * lineY) / lineLengthSquared));
        const nearestX = x1 + along * lineX;
        const nearestY = y1 + along * lineY;
        if (Math.hypot(entity.x - nearestX, entity.y - nearestY) < entity.radius + 3) {
          damageCelestial(entity, weapon.damage * shipDamageMultiplier(weapon), weapon.color);
        }
      }
      if (state.boss && !struck.has(state.boss)) {
        const boss = state.boss;
        const along = Math.max(0, Math.min(1, ((boss.x - x1) * lineX + (boss.y - y1) * lineY) / lineLengthSquared));
        const nearestX = x1 + along * lineX;
        const nearestY = y1 + along * lineY;
        if (Math.hypot(boss.x - nearestX, boss.y - nearestY) < boss.size * 0.38 + 4) {
          struck.add(boss);
          damageBoss(weapon.damage * shipDamageMultiplier(weapon), weapon.color);
        }
      }
    }
  }

  function updatePlayerShots(delta) {
    for (const shot of state.playerShots) {
      shot.age += delta;
      if (shot.behavior === "cluster" && shot.age > 0.52) {
        splitCluster(shot);
        continue;
      }
      if (shot.behavior === "mine") {
        shot.vy = 0;
        shot.vx = 0;
        if (state.enemies.some((enemy) => !enemy.remove && Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < 68) ||
          state.celestialEntities.some((entity) => !entity.remove && entity.stage !== "exploding" && Math.hypot(entity.x - shot.x, entity.y - shot.y) < 68) ||
          (state.boss && Math.hypot(state.boss.x - shot.x, state.boss.y - shot.y) < 82) ||
          shot.age > 3.2) {
          shot.behavior = "splash";
          detonateProjectile(shot);
        }
      } else if (shot.behavior === "homing" || currentShip().passive === "homing") {
        const target = findNearestEnemy(shot.x, shot.y, shot.hitIds) ||
          (state.boss && !shot.hitIds.has(state.boss) && Math.hypot(state.boss.x - shot.x, state.boss.y - shot.y) < 290 ? state.boss : null);
        if (target) {
          const desired = Math.atan2(target.x - shot.x, shot.y - target.y);
          const current = Math.atan2(shot.vx, -shot.vy);
          const deltaAngle = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
          const turn = Math.min(Math.abs(deltaAngle), (currentWeapon().turnRate || 1.8) * delta);
          const angle = current + Math.sign(deltaAngle) * turn;
          shot.vx = Math.sin(angle) * shot.speed;
          shot.vy = -Math.cos(angle) * shot.speed;
        }
      }
      shot.x += shot.vx * delta;
      shot.y += shot.vy * delta;
      if (shot.y < -30 || shot.x < -25 || shot.x > WIDTH + 25 || shot.y > HEIGHT + 35) shot.remove = true;
    }

    for (const shot of state.playerShots) {
      if (shot.remove) continue;
      for (const entity of state.celestialEntities) {
        if (entity.remove || entity.stage === "breaking" || entity.stage === "exploding" || shot.hitIds.has(entity.uid)) continue;
        const dx = shot.x - entity.x;
        const dy = shot.y - entity.y;
        if (dx * dx + dy * dy < (entity.radius + shot.radius) ** 2) {
          handleCelestialProjectileHit(shot, entity);
          if (shot.remove) break;
        }
      }
      if (shot.remove) continue;
      for (const enemy of state.enemies) {
        if (enemy.remove || shot.hitIds.has(enemy)) continue;
        const dx = shot.x - enemy.x;
        const dy = shot.y - enemy.y;
        const radius = enemy.size * 0.36 + shot.radius;
        if (dx * dx + dy * dy < radius * radius) {
          handleProjectileHit(shot, enemy);
          if (shot.remove) break;
        }
      }
      if (!shot.remove && state.boss && !shot.hitIds.has(state.boss)) {
        const boss = state.boss;
        const dx = shot.x - boss.x;
        const dy = shot.y - boss.y;
        if (dx * dx + dy * dy < (boss.size * 0.38 + shot.radius) ** 2) {
          handleProjectileHit(shot, boss);
        }
      }
    }
    state.playerShots = state.playerShots.filter((shot) => !shot.remove);
  }

  function updateEnemies(delta) {
    state.spawnTimer -= delta;
    if (!state.campaign && state.spawnTimer <= 0 && state.enemies.length < ENEMY_LIMIT) {
      spawnEnemy();
      state.spawnTimer = Math.max(0.38, 1.12 - state.elapsed * 0.009) * (0.72 + Math.random() * 0.62);
    }
    for (const enemy of state.enemies) {
      enemy.phase += delta * (enemy.type === "scout" ? 2.2 : 1.1);
      enemy.slowed = Math.max(0, enemy.slowed - delta);
      const movementScale = enemy.slowed > 0 ? 0.35 : 1;
      enemy.y += enemy.speed * movementScale * delta + enemy.pullY * delta;
      enemy.x += Math.sin(enemy.phase) * (enemy.type === "scout" ? 82 : 34) * delta + enemy.pullX * delta;
      enemy.pullX *= Math.max(0, 1 - 2.5 * delta);
      enemy.pullY *= Math.max(0, 1 - 2.5 * delta);
      enemy.x = Math.max(enemy.size / 2 + 5, Math.min(WIDTH - enemy.size / 2 - 5, enemy.x));
      enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
      if (enemy.type !== "scout") {
        enemy.fireTimer -= delta;
        if (enemy.fireTimer <= 0 && enemy.y > 0 && enemy.y < HEIGHT * 0.72) {
          fireEnemyWeapon(enemy);
          enemy.fireTimer = enemyTypes[enemy.type].fireRate * (0.85 + Math.random() * 0.45);
        }
      }
      if (enemy.y > HEIGHT + enemy.size) enemy.remove = true;
      const contactDistance = enemy.size * 0.36 + 15;
      if ((enemy.x - state.player.x) ** 2 + (enemy.y - state.player.y) ** 2 < contactDistance ** 2) {
        enemy.remove = true;
        damagePlayer(enemy.type === "dreadnought" ? 27 : 18);
        addExplosion(enemy.x, enemy.y, enemyTypes[enemy.type].color, 16, 150);
      }
    }
    state.enemies = state.enemies.filter((enemy) => !enemy.remove);
  }

  function updateEnemyShots(delta) {
    for (const shot of state.enemyShots) {
      shot.x += shot.vx * delta;
      shot.y += shot.vy * delta;
      if (shot.y > HEIGHT + 10 || shot.y < -10 || shot.x < -10 || shot.x > WIDTH + 10) shot.remove = true;
      if ((shot.x - state.player.x) ** 2 + (shot.y - state.player.y) ** 2 < (shot.radius + 13) ** 2) {
        shot.remove = true;
        damagePlayer(shot.radius > 4 ? 15 : 10);
      }
    }
    state.enemyShots = state.enemyShots.filter((shot) => !shot.remove);
  }

  function collectPickup(pickup) {
    const ship = currentShip();
    if (pickup.type === "weapon") {
      const weapon = weaponsById.get(pickup.weaponId);
      if (state.ownedWeapons.has(weapon.id)) {
        const reward = ship.passive === "pickup" ? 45 : 30;
        state.credits += reward;
        showToast(`${weapon.name.toUpperCase()} CACHE · +${reward} CREDITS`, 1.2);
      } else {
        state.ownedWeapons.add(weapon.id);
        state.equippedWeapon = weapon.id;
        state.fireTimer = 0;
        showToast(`${weapon.name.toUpperCase()} UNLOCKED · LOADOUT EQUIPPED`, 1.6);
      }
      if (ship.passive === "repair" && state.player.health < MAX_HEALTH) {
        state.player.health = Math.min(MAX_HEALTH, state.player.health + 12);
      }
      if (ship.passive === "pickup") state.credits += 15;
      persistSave();
      updateHud();
      playSfx("pickup");
    }
  }

  function updatePickups(delta) {
    for (const pickup of state.pickups) {
      pickup.age += delta;
      pickup.x += pickup.vx * delta;
      pickup.y += pickup.vy * delta;
      pickup.phase += delta * 3;
      const magnet = currentShip().passive === "magnet" ? 170 : 72;
      const dx = state.player.x - pickup.x;
      const dy = state.player.y - pickup.y;
      const distance = Math.hypot(dx, dy);
      if (distance < magnet) {
        const force = currentShip().passive === "magnet" ? 2.8 : 1.25;
        pickup.x += (dx / Math.max(distance, 1)) * force * 125 * delta;
        pickup.y += (dy / Math.max(distance, 1)) * force * 125 * delta;
      }
      if (distance < 27) {
        collectPickup(pickup);
        pickup.remove = true;
      }
      if (pickup.age > (currentShip().passive === "pickup" ? 19 : 13) || pickup.y > HEIGHT + 30) pickup.remove = true;
    }
    state.pickups = state.pickups.filter((pickup) => !pickup.remove);
  }

  function updateParticles(delta) {
    for (const particle of state.particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.life -= delta;
    }
    state.particles = state.particles.filter((particle) => particle.life > 0);
    for (const beam of state.beams) beam.life -= delta;
    state.beams = state.beams.filter((beam) => beam.life > 0);
  }

  function showToast(message, duration) {
    toast.textContent = message;
    toast.hidden = false;
    state.toastTimer = duration;
  }

  function update(delta) {
    if (state.mode !== "playing") return;
    state.elapsed += delta;
    for (const star of state.stars) {
      star.y += star.speed * delta;
      if (star.y > HEIGHT) {
        star.y = -2;
        star.x = Math.random() * WIDTH;
      }
    }
    updatePlayer(delta);
    updateCampaign(delta);
    updateEnemies(delta);
    updateEnemyShots(delta);
    updatePlayerShots(delta);
    updatePickups(delta);
    updateParticles(delta);
    if (state.toastTimer > 0) {
      state.toastTimer -= delta;
      if (state.toastTimer <= 0) toast.hidden = true;
    }
    updateHud();
  }

  function drawBackground() {
    ctx.drawImage(background, 0, 0);
    for (const star of state.stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = "#d9eaff";
      ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    if (state.invulnerable > 0 && Math.floor(state.invulnerable * 16) % 2 === 0) return;
    const maxShield = getMaxShield();
    if (state.player.shield > 0) {
      ctx.beginPath();
      ctx.ellipse(state.player.x, state.player.y, 29, 31, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(98, 229, 255, ${0.17 + (state.player.shield / maxShield) * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprites.player, Math.round(state.player.x - 24), Math.round(state.player.y - 24), 48, 48);
    ctx.restore();
  }

  function drawEnemies() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const enemy of state.enemies) {
      if (enemy.hitFlash > 0) ctx.globalAlpha = 0.62;
      ctx.drawImage(sprites[enemy.type], Math.round(enemy.x - enemy.size / 2), Math.round(enemy.y - enemy.size / 2), enemy.size, enemy.size);
      ctx.globalAlpha = 1;
      if (enemy.slowed > 0) {
        ctx.strokeStyle = "rgba(156, 234, 255, 0.8)";
        ctx.strokeRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
      }
      if (enemy.maxHealth > 1) {
        const barWidth = enemy.size * 0.8;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - enemy.size * 0.62;
        ctx.fillStyle = "rgba(4, 8, 18, 0.82)";
        ctx.fillRect(barX, barY, barWidth, 3);
        ctx.fillStyle = enemyTypes[enemy.type].color;
        ctx.fillRect(barX, barY, barWidth * (enemy.health / enemy.maxHealth), 3);
      }
    }
    ctx.restore();
  }

  function drawPickups() {
    for (const pickup of state.pickups) {
      const weapon = weaponsById.get(pickup.weaponId);
      const bob = Math.sin(pickup.phase) * 3;
      ctx.fillStyle = "rgba(255, 191, 105, 0.19)";
      ctx.fillRect(pickup.x - 14, pickup.y + bob - 14, 28, 28);
      ctx.strokeStyle = weapon.color;
      ctx.strokeRect(pickup.x - 9, pickup.y + bob - 9, 18, 18);
      ctx.fillStyle = weapon.color;
      ctx.fillRect(pickup.x - 2, pickup.y + bob - 5, 4, 10);
      ctx.fillRect(pickup.x - 5, pickup.y + bob - 2, 10, 4);
    }
  }

  function drawProjectiles() {
    for (const shot of state.playerShots) {
      ctx.fillStyle = `${shot.color}55`;
      ctx.fillRect(shot.x - shot.radius - 2, shot.y - shot.radius * 2, (shot.radius + 2) * 2, shot.radius * 4);
      ctx.fillStyle = shot.color;
      if (shot.behavior === "mine") {
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.radius + 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(Math.round(shot.x - shot.radius / 2), Math.round(shot.y - shot.radius), shot.radius, shot.radius * 2);
      }
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(Math.round(shot.x - 1), Math.round(shot.y - 2), 2, 3);
    }
    for (const shot of state.enemyShots) {
      ctx.fillStyle = shot.color;
      ctx.fillRect(Math.round(shot.x - shot.radius), Math.round(shot.y - shot.radius), shot.radius * 2, shot.radius * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(Math.round(shot.x - 1), Math.round(shot.y - 1), 2, 2);
    }
  }

  function drawEffects() {
    for (const beam of state.beams) {
      ctx.globalAlpha = Math.min(1, beam.life / 0.08);
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width || 3;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawBoss() {
    const boss = state.boss;
    if (!boss) return;
    const sprite = sprites[`boss-${boss.missionId}`];
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = boss.hitFlash > 0 ? 0.6 : 1;
    ctx.drawImage(sprite, Math.round(boss.x - boss.size * 0.65), Math.round(boss.y - boss.size * 0.5), boss.size * 1.3, boss.size);
    ctx.restore();

    const width = 300;
    const x = (WIDTH - width) / 2;
    ctx.fillStyle = "rgba(4,8,18,0.9)";
    ctx.fillRect(x, 15, width, 15);
    ctx.fillStyle = boss.color;
    ctx.fillRect(x + 2, 17, (width - 4) * Math.max(0, boss.health / boss.maxHealth), 5);
    ctx.fillStyle = "#e8f2ff";
    ctx.font = "bold 9px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${boss.name} · PHASE ${boss.phase}`, WIDTH / 2, 12);
    if (boss.warningTimer > 0) {
      ctx.globalAlpha = 0.28 + Math.sin(state.elapsed * 28) * 0.2;
      ctx.fillStyle = boss.color;
      ctx.fillRect(boss.warningX - 20, 0, 40, HEIGHT);
      ctx.globalAlpha = 1;
    }
  }

  function render() {
    drawBackground();
    drawEffects();
    drawPickups();
    drawProjectiles();
    drawEnemies();
    drawPlayer();
  }

  function renderHangarList() {
    const isShips = state.hangarTab === "ships";
    const items = isShips ? data.ships : data.weapons;
    const selectedId = state.hangarSelection;
    hangarList.replaceChildren();
    for (const item of items) {
      const owned = isShips ? state.ownedShips.has(item.id) : state.ownedWeapons.has(item.id);
      const equipped = isShips ? state.equippedShip === item.id : state.equippedWeapon === item.id;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `hangar-item${selectedId === item.id ? " selected" : ""}${owned ? "" : " locked"}`;
      button.dataset.itemId = item.id;
      if (isShips) {
        const image = document.createElement("img");
        image.src = spriteUrls[item.id];
        image.alt = "";
        button.append(image);
      } else {
        const emblem = document.createElement("span");
        emblem.className = "ammo-emblem";
        emblem.textContent = item.behavior === "beam" ? "╱" : item.behavior === "homing" ? "↗" : "✦";
        emblem.style.color = item.color;
        button.append(emblem);
      }
      const copy = document.createElement("span");
      copy.className = "hangar-item-copy";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const subline = document.createElement("small");
      subline.textContent = isShips ? item.role : item.family;
      copy.append(name, subline);
      button.append(copy);
      const mark = document.createElement("span");
      mark.className = "hangar-item-mark";
      mark.textContent = equipped ? "EQUIPPED" : owned ? "" : `${item.cost}¤`;
      button.append(mark);
      button.addEventListener("click", () => {
        state.hangarSelection = item.id;
        renderHangar();
      });
      hangarList.append(button);
    }
    updateHud();
  }

  function renderShipDetail(ship) {
    const owned = state.ownedShips.has(ship.id);
    const image = document.createElement("img");
    image.className = "hangar-preview";
    image.src = spriteUrls[ship.id];
    image.alt = `${ship.name} pixel-art starship`;
    const title = document.createElement("h3");
    title.textContent = ship.name.toUpperCase();
    const role = document.createElement("p");
    role.className = "detail-role";
    role.textContent = ship.role;
    const passive = document.createElement("p");
    passive.className = "detail-description";
    passive.textContent = ship.passiveDescription;
    const stats = document.createElement("div");
    stats.className = "detail-stats";
    const rows = [
      ["SPEED", ship.stats.speed],
      ["DAMAGE", ship.stats.damage],
      ["FIRE RATE", ship.stats.fireRate],
      ["SHIELD", ship.stats.shield]
    ];
    for (const [label, value] of rows) {
      const row = document.createElement("div");
      row.className = "detail-stat";
      const text = document.createElement("span");
      text.textContent = label;
      const meter = document.createElement("i");
      const bar = document.createElement("span");
      bar.style.width = `${Math.max(14, Math.min(100, value * 55))}%`;
      meter.append(bar);
      const number = document.createElement("strong");
      number.textContent = `${value.toFixed(1)}×`;
      row.append(text, meter, number);
      stats.append(row);
    }
    hangarDetail.replaceChildren(image, title, role, passive, stats);
    hangarHint.textContent = `${ship.mounts.length} WEAPON MOUNT${ship.mounts.length === 1 ? "" : "S"} · ${ship.pattern.toUpperCase()} FIRE`;
    hangarAction.disabled = !owned && state.credits < ship.cost;
    hangarAction.textContent = owned
      ? state.equippedShip === ship.id ? "SHIP EQUIPPED" : "EQUIP SHIP"
      : `UNLOCK · ${ship.cost} CREDITS`;
    const level = state.shipUpgrades[ship.id] || 0;
    const cost = getUpgradeCost(level);
    upgradeAction.hidden = !owned;
    upgradeAction.disabled = level >= 5 || state.credits < cost;
    upgradeAction.textContent = level >= 5 ? "CORE MAXED" : `CORE LV ${level} · ${cost} CREDITS`;
  }

  function renderWeaponDetail(weapon) {
    const owned = state.ownedWeapons.has(weapon.id);
    const emblem = document.createElement("div");
    emblem.className = "weapon-preview";
    emblem.style.color = weapon.color;
    emblem.textContent = weapon.behavior === "beam" ? "╱" : weapon.behavior === "homing" ? "↗" : "✦";
    const title = document.createElement("h3");
    title.textContent = weapon.name.toUpperCase();
    const role = document.createElement("p");
    role.className = "detail-role";
    role.textContent = `${weapon.family} · ${weapon.behavior.toUpperCase()}`;
    const description = document.createElement("p");
    description.className = "detail-description";
    description.textContent = weapon.description;
    const specs = document.createElement("div");
    specs.className = "weapon-specs";
    for (const [label, value] of [["DAMAGE", `${weapon.damage.toFixed(1)}×`], ["VELOCITY", `${weapon.speed}`], ["COOLDOWN", `${weapon.cooldown.toFixed(2)}s`], ["IMPACT", weapon.splash ? `${weapon.splash}px` : "DIRECT"]]) {
      const tile = document.createElement("div");
      const key = document.createElement("span");
      key.textContent = label;
      const content = document.createElement("strong");
      content.textContent = value;
      tile.append(key, content);
      specs.append(tile);
    }
    hangarDetail.replaceChildren(emblem, title, role, description, specs);
    hangarHint.textContent = owned ? "AMMUNITION PICKUPS EQUIP AUTOMATICALLY" : "UNLOCK HERE OR COLLECT THIS AMMO IN A MISSION";
    hangarAction.disabled = !owned && state.credits < weapon.cost;
    hangarAction.textContent = owned
      ? state.equippedWeapon === weapon.id ? "WEAPON EQUIPPED" : "EQUIP WEAPON"
      : `UNLOCK · ${weapon.cost} CREDITS`;
    const level = state.weaponUpgrades[weapon.id] || 0;
    const cost = getUpgradeCost(level);
    upgradeAction.hidden = !owned;
    upgradeAction.disabled = level >= 5 || state.credits < cost;
    upgradeAction.textContent = level >= 5 ? "WEAPON MAXED" : `DAMAGE LV ${level} · ${cost} CREDITS`;
  }

  function renderHangar() {
    const isShips = state.hangarTab === "ships";
    const selectedExists = isShips ? shipsById.has(state.hangarSelection) : weaponsById.has(state.hangarSelection);
    if (!selectedExists) state.hangarSelection = isShips ? state.equippedShip : state.equippedWeapon;
    $("#shipsTab").classList.toggle("selected", isShips);
    $("#shipsTab").setAttribute("aria-selected", String(isShips));
    $("#weaponsTab").classList.toggle("selected", !isShips);
    $("#weaponsTab").setAttribute("aria-selected", String(!isShips));
    renderHangarList();
    if (isShips) renderShipDetail(shipsById.get(state.hangarSelection));
    else renderWeaponDetail(weaponsById.get(state.hangarSelection));
  }

  function openHangar(tab = "ships") {
    state.hangarOrigin = state.mode;
    state.hangarTab = tab;
    state.hangarSelection = tab === "ships" ? state.equippedShip : state.equippedWeapon;
    state.mode = "hangar";
    state.keys.clear();
    clearTouchInputs();
    screen.hidden = true;
    touchControls.hidden = true;
    hangar.hidden = false;
    pauseButton.disabled = true;
    renderHangar();
    $("#closeHangar").focus();
  }

  function closeHangar() {
    hangar.hidden = true;
    const nextMode = state.hangarOrigin === "playing" ? "paused" : state.hangarOrigin;
    setScreen(nextMode === "hangar" ? "ready" : nextMode);
    updateHud();
  }

  function purchaseOrEquip() {
    const isShips = state.hangarTab === "ships";
    if (isShips) {
      const ship = shipsById.get(state.hangarSelection);
      if (!ship) throw new Error(`Unknown ship selection: ${state.hangarSelection}`);
      if (!state.ownedShips.has(ship.id)) {
        if (state.credits < ship.cost) {
          showToast("NOT ENOUGH CREDITS", 1.2);
          return;
        }
        state.credits -= ship.cost;
        state.ownedShips.add(ship.id);
      }
      state.equippedShip = ship.id;
      sprites.player = sprites[`ship-${ship.id}`];
      state.player.shield = Math.min(state.player.shield, getMaxShield());
      persistSave();
      showToast(`${ship.name.toUpperCase()} READY FOR FLIGHT`, 1.1);
    } else {
      const weapon = weaponsById.get(state.hangarSelection);
      if (!weapon) throw new Error(`Unknown weapon selection: ${state.hangarSelection}`);
      if (!state.ownedWeapons.has(weapon.id)) {
        if (state.credits < weapon.cost) {
          showToast("NOT ENOUGH CREDITS", 1.2);
          return;
        }
        state.credits -= weapon.cost;
        state.ownedWeapons.add(weapon.id);
      }
      state.equippedWeapon = weapon.id;
      state.fireTimer = 0;
      persistSave();
      showToast(`${weapon.name.toUpperCase()} ARMED`, 1.1);
    }
    renderHangar();
    updateHud();
  }

  function purchaseUpgrade() {
    const shipUpgrade = state.hangarTab === "ships";
    const id = state.hangarSelection;
    const levels = shipUpgrade ? state.shipUpgrades : state.weaponUpgrades;
    const owned = shipUpgrade ? state.ownedShips : state.ownedWeapons;
    if (!owned.has(id)) return;
    const level = levels[id] || 0;
    if (level >= 5) return;
    const cost = getUpgradeCost(level);
    if (state.credits < cost) {
      showToast("NOT ENOUGH CREDITS", 1.2);
      return;
    }
    state.credits -= cost;
    levels[id] = level + 1;
    persistSave();
    showToast(`${shipUpgrade ? "SHIP CORE" : "WEAPON"} UPGRADED · LEVEL ${level + 1}`, 1.4);
    renderHangar();
    updateHud();
  }

  function update(delta) {
    if (state.mode !== "playing") return;
    state.elapsed += delta;
    for (const star of state.stars) {
      star.y += star.speed * delta;
      if (star.y > HEIGHT) {
        star.y = -2;
        star.x = Math.random() * WIDTH;
      }
    }
    updatePlayer(delta);
    updateCampaign(delta);
    updateEnemies(delta);
    updateEnemyShots(delta);
    if (currentWeapon().behavior === "beam") {
      if ((state.keys.has("Space") || state.touch.fire) && state.fireTimer <= 0) {
        fireBeam();
        state.fireTimer = currentWeapon().cooldown / currentShip().stats.fireRate;
      }
    }
    updateCelestials(delta);
    updatePlayerShots(delta);
    updatePickups(delta);
    updateParticles(delta);
    if (state.toastTimer > 0) {
      state.toastTimer -= delta;
      if (state.toastTimer <= 0) toast.hidden = true;
    }
    updateHud();
  }

  function drawBackground() {
    ctx.drawImage(background, 0, 0);
    for (const star of state.stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = "#d9eaff";
      ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    if (state.invulnerable > 0 && Math.floor(state.invulnerable * 16) % 2 === 0) return;
    const maxShield = getMaxShield();
    if (state.player.shield > 0) {
      ctx.beginPath();
      ctx.ellipse(state.player.x, state.player.y, 29, 31, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(98, 229, 255, ${0.17 + (state.player.shield / maxShield) * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprites.player, Math.round(state.player.x - 24), Math.round(state.player.y - 24), 48, 48);
    ctx.restore();
  }

  function drawEnemies() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const enemy of state.enemies) {
      if (enemy.hitFlash > 0) ctx.globalAlpha = 0.62;
      ctx.drawImage(sprites[enemy.type], Math.round(enemy.x - enemy.size / 2), Math.round(enemy.y - enemy.size / 2), enemy.size, enemy.size);
      ctx.globalAlpha = 1;
      if (enemy.slowed > 0) {
        ctx.strokeStyle = "rgba(156, 234, 255, 0.8)";
        ctx.strokeRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
      }
      if (enemy.maxHealth > 1) {
        const barWidth = enemy.size * 0.8;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - enemy.size * 0.62;
        ctx.fillStyle = "rgba(4, 8, 18, 0.82)";
        ctx.fillRect(barX, barY, barWidth, 3);
        ctx.fillStyle = enemyTypes[enemy.type].color;
        ctx.fillRect(barX, barY, barWidth * (enemy.health / enemy.maxHealth), 3);
      }
    }
    ctx.restore();
  }

  function drawPickups() {
    for (const pickup of state.pickups) {
      const weapon = weaponsById.get(pickup.weaponId);
      const bob = Math.sin(pickup.phase) * 3;
      ctx.fillStyle = "rgba(255, 191, 105, 0.19)";
      ctx.fillRect(pickup.x - 14, pickup.y + bob - 14, 28, 28);
      ctx.strokeStyle = weapon.color;
      ctx.strokeRect(pickup.x - 9, pickup.y + bob - 9, 18, 18);
      ctx.fillStyle = weapon.color;
      ctx.fillRect(pickup.x - 2, pickup.y + bob - 5, 4, 10);
      ctx.fillRect(pickup.x - 5, pickup.y + bob - 2, 10, 4);
    }
  }

  function drawProjectiles() {
    for (const shot of state.playerShots) {
      ctx.fillStyle = `${shot.color}55`;
      ctx.fillRect(shot.x - shot.radius - 2, shot.y - shot.radius * 2, (shot.radius + 2) * 2, shot.radius * 4);
      ctx.fillStyle = shot.color;
      if (shot.behavior === "mine") {
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.radius + 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(Math.round(shot.x - shot.radius / 2), Math.round(shot.y - shot.radius), shot.radius, shot.radius * 2);
      }
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(Math.round(shot.x - 1), Math.round(shot.y - 2), 2, 3);
    }
    for (const shot of state.enemyShots) {
      ctx.fillStyle = shot.color;
      ctx.fillRect(Math.round(shot.x - shot.radius), Math.round(shot.y - shot.radius), shot.radius * 2, shot.radius * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(Math.round(shot.x - 1), Math.round(shot.y - 1), 2, 2);
    }
  }

  function drawEffects() {
    for (const beam of state.beams) {
      ctx.globalAlpha = Math.min(1, beam.life / 0.08);
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width || 3;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    drawBackground();
    drawEffects();
    drawPickups();
    drawProjectiles();
    drawEnemies();
    drawBoss();
    drawPlayer();
  }

  function drawCelestialOverlay() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const entity of state.celestialEntities) {
      if (entity.stage === "exploding") {
        const progress = 1 - entity.stageTimer / (entity.kind === "sun" ? 1.15 : 0.65);
        const radius = entity.radius * (0.65 + progress * 0.85);
        const gradient = ctx.createRadialGradient(entity.x, entity.y, 0, entity.x, entity.y, radius);
        gradient.addColorStop(0, "rgba(255,255,235,0.95)");
        gradient.addColorStop(0.35, `${entity.config.light}cc`);
        gradient.addColorStop(1, `${entity.config.color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      const shake = entity.stage === "breaking" ? (Math.random() - 0.5) * 5 : 0;
      const diameter = entity.radius * 2;
      ctx.save();
      ctx.translate(entity.x + shake, entity.y + shake);
      ctx.rotate(entity.rotation || entity.phase * 0.08);
      if (entity.hitFlash > 0) ctx.globalAlpha = 0.62;
      ctx.drawImage(sprites[`celestial-${entity.id}`], -diameter / 2, -diameter / 2, diameter, diameter);
      ctx.globalAlpha = 1;
      ctx.restore();

      if (entity.stage === "cracked1" || entity.stage === "cracked2" || entity.stage === "breaking") {
        ctx.save();
        ctx.translate(entity.x + shake, entity.y + shake);
        ctx.rotate(entity.rotation || entity.phase * 0.08);
        ctx.strokeStyle = entity.stage === "breaking" ? "#fff0bc" : "#18232e";
        ctx.lineWidth = entity.stage === "breaking" ? 2.4 : 1.6;
        ctx.beginPath();
        ctx.moveTo(-entity.radius * 0.48, -entity.radius * 0.9);
        ctx.lineTo(-entity.radius * 0.17, -entity.radius * 0.3);
        ctx.lineTo(-entity.radius * 0.31, entity.radius * 0.04);
        ctx.lineTo(entity.radius * 0.04, entity.radius * 0.28);
        ctx.lineTo(entity.radius * 0.17, entity.radius * 0.77);
        if (entity.stage !== "cracked1") {
          ctx.moveTo(entity.radius * 0.68, -entity.radius * 0.65);
          ctx.lineTo(entity.radius * 0.24, -entity.radius * 0.25);
          ctx.lineTo(entity.radius * 0.4, entity.radius * 0.04);
          ctx.lineTo(entity.radius * 0.12, entity.radius * 0.48);
          ctx.moveTo(-entity.radius * 0.88, entity.radius * 0.22);
          ctx.lineTo(-entity.radius * 0.42, entity.radius * 0.14);
          ctx.lineTo(-entity.radius * 0.19, entity.radius * 0.42);
        }
        ctx.stroke();
        ctx.restore();
      }

      if (entity.maxHealth > 18 || entity.kind === "sun") {
        const width = Math.max(36, entity.radius * 1.55);
        const y = entity.y - entity.radius - (entity.kind === "sun" ? 20 : 10);
        ctx.fillStyle = "rgba(4,8,18,0.85)";
        ctx.fillRect(entity.x - width / 2, y, width, 5);
        ctx.fillStyle = entity.kind === "sun" ? "#ffae3d" : entity.config.light;
        ctx.fillRect(entity.x - width / 2, y, width * Math.max(0, entity.health / entity.maxHealth), 5);
        if (entity.kind === "sun") {
          ctx.fillStyle = "#fff2bf";
          ctx.font = "bold 9px Segoe UI, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SOLAR CORE", entity.x, y - 5);
        }
      }

      if (entity.kind === "sun" && entity.attackWarning > 0) {
        ctx.globalAlpha = 0.35 + Math.sin(state.elapsed * 24) * 0.2;
        ctx.fillStyle = "#ff844c";
        ctx.fillRect(entity.warningX - 18, 0, 36, HEIGHT);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff2bf";
        ctx.fillRect(entity.warningX - 2, 0, 4, HEIGHT);
      }
    }

    for (const wave of state.shockwaves) {
      ctx.globalAlpha = Math.max(0, wave.life / wave.maxLife);
      ctx.strokeStyle = wave.damage ? "#ffd78a" : "#c5eaff";
      ctx.lineWidth = 3;
      if (wave.vertical) {
        ctx.beginPath();
        ctx.moveTo(wave.x, wave.y - wave.radius);
        ctx.lineTo(wave.x, wave.y + wave.radius);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.current, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (const fragment of state.debris) {
      ctx.globalAlpha = Math.max(0, fragment.life / fragment.maxLife);
      ctx.fillStyle = fragment.color;
      ctx.save();
      ctx.translate(fragment.x, fragment.y);
      ctx.rotate(fragment.life * 4);
      ctx.fillRect(-fragment.size / 2, -fragment.size / 2, fragment.size, fragment.size);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  let lastTime = 0;
  function frame(timestamp) {
    const delta = lastTime === 0 ? 0 : Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    update(delta);
    render();
    drawCelestialOverlay();
    requestAnimationFrame(frame);
  }

  $("#closeHangar").addEventListener("click", closeHangar);
  $("#shipsTab").addEventListener("click", () => {
    state.hangarTab = "ships";
    state.hangarSelection = state.equippedShip;
    renderHangar();
  });
  $("#weaponsTab").addEventListener("click", () => {
    state.hangarTab = "weapons";
    state.hangarSelection = state.equippedWeapon;
    renderHangar();
  });
  hangarAction.addEventListener("click", purchaseOrEquip);
  upgradeAction.addEventListener("click", purchaseUpgrade);
  screenActions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-menu-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.menuAction;
    if (event.isTrusted && (
      action === "continue" || action === "nextStage" || action === "retry" ||
      action.startsWith("stage:") || action.startsWith("moon:")
    )) requestLandscape();
    if (action === "continue") {
      if (state.lastMission?.kind === "moon") startMoonMission(state.lastMission.id);
      else if (state.lastMission?.kind === "campaign") {
        startCampaign(campaignStages.findIndex((stage) => stage.id === state.lastMission.id));
      } else startCampaign(state.campaignCompleted ? 0 : state.unlockedStage);
    }
    else if (action === "stages") setScreen("stageSelect");
    else if (action === "moons") setScreen("moonSelect");
    else if (action === "hangar") openHangar("ships");
    else if (action === "shop") openHangar("weapons");
    else if (action === "settings") {
      state.screenReturnMode = state.mode;
      setScreen("settings");
    } else if (action === "settingsBack") setScreen(state.screenReturnMode);
    else if (action === "mute") {
      state.settings.sfxVolume = state.settings.sfxVolume > 0 ? 0 : 0.45;
      persistSave();
      setScreen("settings");
    } else if (action === "resume") setScreen("playing");
    else if (action === "restart") retryMission();
    else if (action === "controls") {
      state.screenReturnMode = state.mode;
      setScreen("controls");
    } else if (action === "controlsBack") setScreen(state.screenReturnMode);
    else if (action === "retry") retryMission();
    else if (action === "main") {
      state.campaign = null;
      state.boss = null;
      state.lastMission = null;
      persistSave();
      setScreen("ready");
      updateHud();
    } else if (action === "nextStage") startCampaign(state.campaign.stageIndex + 1);
    else if (action.startsWith("stage:")) startCampaign(Number(action.slice(6)));
    else if (action.startsWith("moon:")) startMoonMission(action.slice(5));
  });
  actionButton.addEventListener("click", () => {
    if (state.mode === "paused") setScreen("playing");
    else startGame();
  });
  pauseButton.addEventListener("click", togglePause);

  document.addEventListener("keydown", (event) => {
    const controlKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"];
    if (state.mode === "playing" && controlKeys.includes(event.code)) event.preventDefault();
    if (event.repeat && ["KeyP", "Escape", "Enter", "KeyR"].includes(event.code)) return;
    if (state.mode === "playing") state.keys.add(event.code);
    if (state.mode === "hangar" && event.code === "Escape") closeHangar();
    else if (event.code === "KeyP" && (state.mode === "playing" || state.mode === "paused")) togglePause();
    else if (event.code === "Escape" && state.mode === "settings") setScreen(state.screenReturnMode);
    else if (event.code === "Escape" && state.mode === "controls") setScreen(state.screenReturnMode);
    else if (event.code === "Escape" && ["stageSelect", "moonSelect", "stageVictory", "victory", "gameover"].includes(state.mode)) setScreen("ready");
    else if (event.code === "Escape" && (state.mode === "playing" || state.mode === "paused")) togglePause();
    else if (event.code === "Enter" && state.mode === "ready") startGame();
    else if (event.code === "Enter" && state.mode === "gameover") retryMission();
    else if (event.code === "KeyR" && state.mode === "gameover") retryMission();
  });
  document.addEventListener("keyup", (event) => state.keys.delete(event.code));
  window.addEventListener("blur", () => {
    state.keys.clear();
    clearTouchInputs();
    if (state.mode === "playing") setScreen("paused");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.mode === "playing") togglePause();
    if (document.hidden) {
      state.keys.clear();
      clearTouchInputs();
    }
  });

  function setJoystickFromPointer(event) {
    const rect = joystick.getBoundingClientRect();
    const maxDistance = Math.max(1, rect.width * 0.34);
    let dx = event.clientX - (rect.left + rect.width / 2);
    let dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > maxDistance) {
      dx = dx / distance * maxDistance;
      dy = dy / distance * maxDistance;
    }
    const magnitude = Math.min(1, Math.hypot(dx, dy) / maxDistance);
    if (magnitude <= JOYSTICK_DEAD_ZONE) {
      state.touch.x = 0;
      state.touch.y = 0;
    } else {
      const adjustedMagnitude = (magnitude - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE);
      state.touch.x = dx / Math.max(1, Math.hypot(dx, dy)) * adjustedMagnitude;
      state.touch.y = dy / Math.max(1, Math.hypot(dx, dy)) * adjustedMagnitude;
    }
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joystick.classList.add("active");
  }

  joystick.addEventListener("pointerdown", (event) => {
    if (state.mode !== "playing" || joystickPointerId !== null) return;
    event.preventDefault();
    joystickPointerId = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    setJoystickFromPointer(event);
  });
  joystick.addEventListener("pointermove", (event) => {
    if (event.pointerId !== joystickPointerId || state.mode !== "playing") return;
    event.preventDefault();
    setJoystickFromPointer(event);
  });
  const releaseJoystick = (event) => {
    if (event.pointerId !== joystickPointerId) return;
    event.preventDefault();
    resetJoystickVisual();
    joystickPointerId = null;
  };
  joystick.addEventListener("pointerup", releaseJoystick);
  joystick.addEventListener("pointercancel", releaseJoystick);
  joystick.addEventListener("lostpointercapture", releaseJoystick);

  fireControl.addEventListener("pointerdown", (event) => {
    if (state.mode !== "playing") return;
    event.preventDefault();
    activeFirePointers.add(event.pointerId);
    fireControl.setPointerCapture(event.pointerId);
    state.touch.fire = true;
    fireControl.classList.add("pressed");
  });
  const releaseFire = (event) => {
    event.preventDefault();
    activeFirePointers.delete(event.pointerId);
    state.touch.fire = activeFirePointers.size > 0;
    if (!state.touch.fire) fireControl.classList.remove("pressed");
  };
  fireControl.addEventListener("pointerup", releaseFire);
  fireControl.addEventListener("pointercancel", releaseFire);
  fireControl.addEventListener("lostpointercapture", releaseFire);
  for (const control of [joystick, fireControl]) {
    control.addEventListener("contextmenu", (event) => event.preventDefault());
    control.addEventListener("dragstart", (event) => event.preventDefault());
  }

  function loadCatalogSprites() {
    for (const ship of data.ships) {
      sprites[`ship-${ship.id}`] = makeShipSprite(ship);
      spriteUrls[ship.id] = sprites[`ship-${ship.id}`].toDataURL();
    }
    createCelestialSprites();
    sprites.player = sprites[`ship-${state.equippedShip}`];
  }

  let configReport;
  try {
    configReport = validateCatalog();
  } catch (error) {
    console.error(error);
    initError.hidden = false;
    initError.textContent = error.message;
    return;
  }

  loadCatalogSprites();
  createSprites();
  createBossSprites();
  createBackground();
  createStars();
  state.player.shield = getMaxShield();
  updateHud();
  setScreen("ready");
  requestAnimationFrame(frame);

  window.COSMIC_DESTROYER = Object.freeze({
    catalog: data,
    celestialCatalog: celestialData,
    campaignCatalog: campaignData,
    validateCatalog,
    getConfigurationReport: () => ({ ...configReport }),
    getRuntimeSnapshot: () => ({
      mode: state.mode,
      elapsed: state.elapsed,
      score: state.score,
      credits: state.credits,
      lastMission: state.lastMission ? { ...state.lastMission } : null,
      unlockedStage: state.unlockedStage,
      campaignCompleted: state.campaignCompleted,
      campaign: state.campaign ? {
        kind: state.campaign.kind,
        id: state.campaign.mission.id,
        stageIndex: state.campaign.stageIndex,
        waveIndex: state.waveIndex,
        waves: state.campaign.mission.waves.length
      } : null,
      boss: state.boss ? {
        name: state.boss.name,
        health: state.boss.health,
        maxHealth: state.boss.maxHealth,
        phase: state.boss.phase,
        pattern: state.boss.pattern
      } : null,
      player: { x: state.player.x, y: state.player.y, health: state.player.health, shield: state.player.shield },
      enemies: state.enemies.length,
      playerShots: state.playerShots.length,
      enemyShots: state.enemyShots.length,
      celestials: state.celestialEntities.map((entity) => ({
        id: entity.id,
        uid: entity.uid,
        stage: entity.stage,
        health: entity.health,
        maxHealth: entity.maxHealth
      })),
      debris: state.debris.length,
      shockwaves: state.shockwaves.length,
      particles: state.particles.length,
      spriteCount: Object.keys(sprites).length,
      stageEvents: state.celestialEvents.map((event) => ({ ...event }))
    }),
    getLoadout: () => ({
      ship: state.equippedShip,
      weapon: state.equippedWeapon,
      ownedShips: [...state.ownedShips],
      ownedWeapons: [...state.ownedWeapons],
      credits: state.credits,
      shipUpgrades: { ...state.shipUpgrades },
      weaponUpgrades: { ...state.weaponUpgrades }
    })
  });

  if (new URLSearchParams(location.search).has("test")) {
    window.COSMIC_DESTROYER_TESTS = Object.freeze({
      getInputState: () => ({ ...state.touch, joystickPointerId, firePointers: activeFirePointers.size, mode: state.mode }),
      startCampaign,
      startMoonMission,
      spawnBossForCurrentMission: () => {
        if (!state.campaign) throw new Error("Start a mission before spawning its boss.");
        state.enemies.length = 0;
        state.campaign.waveIndex = state.campaign.mission.waves.length;
        state.campaign.waveActive = false;
        state.campaign.spawnTimer = 0;
        spawnBoss();
        return window.COSMIC_DESTROYER.getRuntimeSnapshot();
      },
      clearEnemyWave: () => {
        state.enemies.slice().forEach((enemy) => damageEnemy(enemy, enemy.health + 1, currentShip().color));
        state.enemies = state.enemies.filter((enemy) => !enemy.remove);
        return window.COSMIC_DESTROYER.getRuntimeSnapshot();
      },
      equipWeaponForTest: (id) => {
        if (!weaponsById.has(id)) throw new Error(`Unknown weapon ${id}.`);
        state.ownedWeapons.add(id);
        state.equippedWeapon = id;
        state.fireTimer = 0;
        return window.COSMIC_DESTROYER.getLoadout();
      },
      fireWeaponForTest: () => {
        const beforeShots = state.playerShots.length;
        const beforeBeams = state.beams.length;
        if (currentWeapon().behavior === "beam") fireBeam();
        else firePlayerWeapon();
        return {
          weapon: currentWeapon().id,
          behavior: currentWeapon().behavior,
          projectiles: state.playerShots.length - beforeShots,
          beams: state.beams.length - beforeBeams
        };
      },
      damageBoss,
      damagePlayer: (amount) => {
        state.invulnerable = 0;
        damagePlayer(amount);
        return window.COSMIC_DESTROYER.getRuntimeSnapshot();
      },
      spawnCelestial: (id, x = WIDTH / 2, y = HEIGHT / 2) => spawnCelestial(id, x, y).uid,
      damageCelestial: (uid, amount) => {
        const entity = state.celestialEntities.find((candidate) => candidate.uid === uid);
        if (!entity) throw new Error(`Unknown celestial entity ${uid}.`);
        damageCelestial(entity, amount);
        return entity.stage;
      },
      advance: (seconds) => {
        const steps = Math.ceil(seconds * 60);
        for (let step = 0; step < steps; step += 1) {
          update(Math.min(1 / 60, seconds - step / 60));
        }
        return window.COSMIC_DESTROYER.getRuntimeSnapshot();
      }
    });
  }
})();
