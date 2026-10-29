(() => {
  "use strict";

  const bodies = [
    { id: "mercury", name: "Mercury", kind: "planet", size: 38, health: 54, speed: 44, color: "#b8a18e", dark: "#665c58", light: "#e5ccb0", feature: "crater", mechanic: "Small, fast-moving rocky world.", damage: 18 },
    { id: "venus", name: "Venus", kind: "planet", size: 52, health: 82, speed: 35, color: "#e7b66b", dark: "#926039", light: "#ffdf9a", feature: "cloud", mechanic: "Dense cloud bands hide its cracked surface.", damage: 22 },
    { id: "earth", name: "Earth", kind: "planet", size: 58, health: 105, speed: 31, color: "#438ee6", dark: "#183e78", light: "#82dcf0", feature: "ocean", mechanic: "Armored oceans absorb sustained fire.", damage: 24 },
    { id: "mars", name: "Mars", kind: "planet", size: 46, health: 72, speed: 38, color: "#e66d4e", dark: "#85383a", light: "#ffad75", feature: "crater", mechanic: "A compact world with a brittle crust.", damage: 20 },
    { id: "jupiter", name: "Jupiter", kind: "planet", size: 78, health: 220, speed: 20, color: "#d8a27a", dark: "#84534b", light: "#f4d0a1", feature: "bands", mechanic: "Massive gas giant; its gravity tugs nearby craft.", damage: 30, gravity: 82 },
    { id: "saturn", name: "Saturn", kind: "planet", size: 72, health: 190, speed: 22, color: "#e2cf96", dark: "#8c784d", light: "#fff0bc", feature: "rings", mechanic: "Wide icy rings sweep a dangerous collision path.", damage: 28 },
    { id: "uranus", name: "Uranus", kind: "planet", size: 58, health: 140, speed: 25, color: "#72d3d8", dark: "#347a91", light: "#b5fff1", feature: "bands", mechanic: "Ice giant emits a slowing cryogenic field.", damage: 25, slowAura: true },
    { id: "neptune", name: "Neptune", kind: "planet", size: 58, health: 150, speed: 25, color: "#557bea", dark: "#293875", light: "#95bdff", feature: "storm", mechanic: "A storm giant lashes the field with blue bolts.", damage: 27, fireRate: 3.8 },
    { id: "sun", name: "The Sun", kind: "sun", size: 92, health: 520, speed: 0, color: "#ffad32", dark: "#d64e35", light: "#fff3a0", feature: "solar", mechanic: "Solar boss: telegraphs sweeping flare lanes before firing.", damage: 36, fireRate: 4.1 },
    { id: "moon", name: "The Moon", kind: "moon", size: 34, health: 38, speed: 50, color: "#c5c6c2", dark: "#737b83", light: "#f0eee0", feature: "crater", mechanic: "A low-mass satellite; quick to break apart.", damage: 16 },
    { id: "io", name: "Io", kind: "moon", size: 36, health: 48, speed: 47, color: "#edc343", dark: "#ad5937", light: "#fff19b", feature: "volcanic", mechanic: "Volcanic plumes erupt into short-lived hazards.", damage: 18, fireRate: 5.2 },
    { id: "europa", name: "Europa", kind: "moon", size: 35, health: 44, speed: 48, color: "#d0d6d3", dark: "#778c9c", light: "#f4e3b4", feature: "ice", mechanic: "Ice fragments scatter when its shell breaks.", damage: 17 },
    { id: "ganymede", name: "Ganymede", kind: "moon", size: 43, health: 62, speed: 40, color: "#a99886", dark: "#625e65", light: "#d6c6ad", feature: "grooves", mechanic: "A ridged, heavy moon with a resilient crust.", damage: 20 },
    { id: "callisto", name: "Callisto", kind: "moon", size: 41, health: 56, speed: 41, color: "#8d817d", dark: "#494f59", light: "#c7b9aa", feature: "crater", mechanic: "Ancient crater fields shed dense rock fragments.", damage: 19 },
    { id: "titan", name: "Titan", kind: "moon", size: 48, health: 76, speed: 35, color: "#dc9a4e", dark: "#89523c", light: "#f6ca7c", feature: "haze", mechanic: "Thick haze obscures a durable hydrocarbon crust.", damage: 21 }
  ];

  const asteroids = [
    { id: "asteroid-rock", name: "Basalt Asteroid", kind: "asteroid", size: 17, health: 12, speed: 88, color: "#87919d", dark: "#394654", light: "#c0cad1", feature: "rock", damage: 12, points: 35, credits: 3 },
    { id: "asteroid-iron", name: "Iron Asteroid", kind: "asteroid", size: 24, health: 24, speed: 62, color: "#b88964", dark: "#584444", light: "#e1bd92", feature: "iron", damage: 17, points: 65, credits: 6 },
    { id: "asteroid-ice", name: "Ice Asteroid", kind: "asteroid", size: 20, health: 16, speed: 74, color: "#86d9ec", dark: "#426f91", light: "#d2fcff", feature: "ice", damage: 14, points: 50, credits: 5 }
  ];

  const stages = [
    { id: "intact", threshold: 1 },
    { id: "cracked1", threshold: 0.7 },
    { id: "cracked2", threshold: 0.4 },
    { id: "breaking", threshold: 0.12 },
    { id: "exploding", threshold: 0 },
    { id: "debris", threshold: 0 }
  ];

  const validatedBodies = bodies.map((body) => ({
    ...body,
    pattern: body.feature,
    dimensions: { width: body.size * 2, height: body.size * 2 }
  }));
  window.COSMIC_CELESTIAL_DATA = Object.freeze({ bodies: validatedBodies, asteroids, stages });
})();
