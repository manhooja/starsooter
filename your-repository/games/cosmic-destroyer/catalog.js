(() => {
  "use strict";

  const silhouettes = [
    { hull: [[24, 2], [29, 17], [28, 35], [24, 43], [20, 35], [19, 17]], wings: [[20, 20], [5, 28], [8, 36], [21, 33], [24, 27]] },
    { hull: [[24, 3], [31, 16], [27, 38], [24, 45], [21, 38], [17, 16]], wings: [[21, 20], [3, 32], [7, 37], [21, 31], [24, 24]] },
    { hull: [[24, 2], [27, 15], [25, 41], [21, 41], [21, 15]], wings: [[21, 19], [1, 27], [8, 39], [22, 32], [24, 23]] },
    { hull: [[24, 4], [30, 18], [29, 37], [24, 43], [19, 37], [18, 18]], wings: [[19, 21], [2, 25], [6, 39], [22, 33], [24, 28]] },
    { hull: [[24, 2], [29, 14], [27, 43], [21, 43], [19, 14]], wings: [[21, 23], [2, 35], [5, 39], [22, 32], [24, 26]] },
    { hull: [[24, 3], [31, 17], [27, 40], [24, 45], [21, 40], [17, 17]], wings: [[19, 19], [3, 23], [7, 37], [22, 33], [24, 25]] },
    { hull: [[24, 3], [28, 17], [28, 40], [24, 45], [20, 40], [20, 17]], wings: [[20, 22], [2, 28], [8, 35], [21, 32], [24, 27]] },
    { hull: [[24, 2], [30, 16], [27, 39], [24, 43], [21, 39], [18, 16]], wings: [[21, 18], [4, 25], [1, 36], [22, 32], [24, 25]] },
    { hull: [[24, 4], [29, 19], [27, 40], [24, 44], [21, 40], [19, 19]], wings: [[21, 22], [4, 27], [10, 36], [22, 33], [24, 28]] },
    { hull: [[24, 2], [27, 15], [28, 38], [24, 45], [20, 38], [21, 15]], wings: [[20, 20], [1, 30], [5, 36], [22, 31], [24, 25]] },
    { hull: [[24, 3], [30, 19], [27, 38], [24, 43], [21, 38], [18, 19]], wings: [[21, 22], [2, 24], [8, 36], [23, 32], [24, 27]] },
    { hull: [[24, 4], [27, 18], [26, 42], [22, 42], [21, 18]], wings: [[21, 21], [4, 24], [2, 33], [22, 31], [24, 27]] },
    { hull: [[24, 2], [31, 18], [27, 37], [24, 43], [21, 37], [17, 18]], wings: [[21, 22], [2, 31], [10, 36], [22, 33], [24, 27]] },
    { hull: [[24, 3], [29, 17], [29, 41], [24, 45], [19, 41], [19, 17]], wings: [[20, 22], [0, 29], [8, 38], [22, 33], [24, 27]] },
    { hull: [[24, 1], [29, 15], [27, 38], [24, 44], [21, 38], [19, 15]], wings: [[21, 18], [3, 26], [6, 39], [23, 33], [24, 26]] },
    { hull: [[24, 5], [31, 18], [28, 39], [24, 44], [20, 39], [17, 18]], wings: [[20, 23], [1, 25], [5, 37], [22, 34], [24, 29]] },
    { hull: [[24, 2], [28, 17], [27, 43], [21, 43], [20, 17]], wings: [[20, 22], [3, 28], [11, 38], [22, 32], [24, 27]] },
    { hull: [[24, 3], [30, 16], [28, 40], [24, 46], [20, 40], [18, 16]], wings: [[20, 20], [2, 22], [7, 35], [22, 31], [24, 25]] },
    { hull: [[24, 2], [32, 18], [27, 41], [24, 45], [21, 41], [16, 18]], wings: [[20, 22], [1, 33], [9, 39], [23, 32], [24, 27]] },
    { hull: [[24, 4], [28, 16], [28, 42], [24, 45], [20, 42], [20, 16]], wings: [[20, 19], [1, 26], [5, 37], [22, 33], [24, 26]] },
    { hull: [[24, 2], [29, 18], [27, 39], [24, 44], [21, 39], [19, 18]], wings: [[21, 21], [2, 26], [8, 40], [23, 34], [24, 29]] },
    { hull: [[24, 3], [27, 15], [26, 44], [22, 44], [21, 15]], wings: [[21, 22], [0, 30], [9, 36], [22, 32], [24, 27]] },
    { hull: [[24, 2], [30, 17], [26, 42], [24, 46], [22, 42], [18, 17]], wings: [[22, 22], [4, 25], [1, 35], [22, 33], [24, 28]] },
    { hull: [[24, 3], [29, 16], [27, 40], [24, 45], [21, 40], [19, 16]], wings: [[21, 20], [2, 27], [10, 39], [23, 33], [24, 26]] },
    { hull: [[24, 2], [28, 16], [29, 40], [24, 46], [19, 40], [20, 16]], wings: [[20, 22], [0, 28], [7, 36], [22, 34], [24, 29]] },
    { hull: [[24, 4], [30, 18], [27, 42], [24, 45], [21, 42], [18, 18]], wings: [[21, 21], [3, 26], [6, 38], [23, 32], [24, 27]] },
    { hull: [[24, 2], [31, 16], [28, 37], [24, 45], [20, 37], [17, 16]], wings: [[20, 21], [2, 29], [10, 38], [23, 33], [24, 26]] },
    { hull: [[24, 3], [29, 18], [26, 43], [22, 43], [19, 18]], wings: [[20, 20], [0, 25], [8, 40], [23, 34], [24, 28]] }
  ];

  const ships = [
    ["nova", "Nova", "Balanced interceptor", "#62e5ff", 0, [-11, 11], "dual", [1, 1, 1, 1], "starter", "Reliable all-rounder; its reinforced core reduces hull damage.", 0],
    ["vortex", "Vortex", "Twin-rail duelist", "#a58bff", 1, [-10, 10], "converge", [1.02, 1, 1.15, 0.96], "pierce", "Charged bolts pierce one additional target.", 180],
    ["zephyr", "Zephyr", "Gale-wing skirmisher", "#79f2c0", 2, [-15, 0, 15], "fan", [1.18, 1.1, 0.92, 0.92], "speed", "Higher cruise speed and sharper handling.", 230],
    ["typhon", "Typhon", "Four-mount gunship", "#ff8b67", 3, [-16, -5, 5, 16], "quad", [0.86, 1.2, 0.88, 1.12], "salvage", "Hostiles pay 30% more credits when destroyed.", 280],
    ["eclipse", "Eclipse", "Phaseblade stealth craft", "#b6a1e8", 4, [-8, 8], "alternating", [1.12, 1.1, 1, 1.12], "evasive", "Longer invulnerability after a hit.", 320],
    ["razor", "Razor", "Needlepoint interceptor", "#ff536d", 5, [-7, 7], "converge", [1.22, 0.94, 1.26, 0.88], "crit", "Bolts have a 15% chance to deal double damage.", 360],
    ["specter", "Specter", "Silent long-range striker", "#9aa9df", 6, [0], "single", [0.98, 1, 1.5, 1.08], "focus", "The central cannon deals 40% extra damage.", 400],
    ["phoenix", "Phoenix", "Rebirth-class fighter", "#ff9660", 7, [-12, 12], "twinFan", [1, 1.05, 0.94, 1.2], "repair", "Collecting a pickup restores a little hull.", 440],
    ["orbit", "Orbit", "Satellite-wing defender", "#56d9c0", 8, [-17, 0, 17], "fan", [0.95, 1.1, 0.92, 1], "magnet", "Collects weapon drops from farther away.", 480],
    ["shadow", "Shadow", "Abyssal ambusher", "#7580c5", 9, [-9, 9], "alternating", [1.12, 1.15, 0.98, 1.04], "armor", "Reduces incoming hull damage by 15%.", 520],
    ["storm", "Storm", "Tempest barrage fighter", "#70baff", 10, [-16, -5, 5, 16], "quad", [0.92, 1, 1.12, 0.92], "volley", "Every fourth volley fires a bonus bolt.", 560],
    ["magnet", "Magnet", "Salvage collection rig", "#f0ca69", 11, [-10, 10], "dual", [1, 0.96, 1.06, 1.15], "magnet", "Pulls weapon pickups toward the ship.", 600],
    ["rift", "Rift", "Gravitic disruption craft", "#cc70ff", 12, [-13, 0, 13], "fan", [0.98, 1.08, 1.08, 1.04], "slow", "Enemy projectiles move 18% slower.", 640],
    ["valkyrie", "Valkyrie", "Winged ace fighter", "#f0a8ff", 13, [-17, -6, 6, 17], "quad", [1.06, 1.08, 1.02, 1.02], "shield", "Carries an additional 20 shield points.", 700],
    ["banshee", "Banshee", "Resonance lance craft", "#ff6eae", 14, [-12, 12], "twinFan", [0.94, 1.15, 1.15, 0.96], "blast", "Kills send an energy pulse into nearby enemies.", 740],
    ["titan", "Titan", "Heavy assault battleship", "#c5a5ff", 15, [-18, -9, 0, 9, 18], "spread", [0.7, 1.65, 0.78, 0.76], "armor", "Heavy plating reduces hull damage by 25%.", 820],
    ["arc", "Arc", "Chain-lightning interceptor", "#7eeeff", 16, [-12, 12], "converge", [1.15, 0.92, 1.12, 0.9], "chain", "Bolts arc to one nearby enemy after impact.", 850],
    ["seraph", "Seraph", "Radiant tri-wing guardian", "#ffe394", 17, [-15, 0, 15], "fan", [0.96, 1.1, 1, 1.06], "regen", "Shield regeneration is 50% faster.", 900],
    ["omega", "Omega", "Singularity siege vessel", "#d480ff", 18, [-16, -8, 8, 16], "quad", [0.78, 1.55, 0.86, 0.9], "heavy", "All attacks deal 20% more damage.", 980],
    ["celestial", "Celestial", "Astral prism cruiser", "#74e8dc", 19, [-14, 0, 14], "tri", [1.08, 1.02, 1.12, 1.1], "pickup", "Weapon pickups last longer and award bonus credits.", 1050],
    ["revenant", "Revenant", "Undying salvage fighter", "#a2b3c2", 20, [-10, 10], "alternating", [0.98, 1.2, 1, 1.12], "lifesteal", "Each enemy destroyed restores a small amount of hull.", 1120],
    ["lynx", "Lynx", "High-speed pouncer", "#9ae65f", 21, [-12, 12], "twinFan", [1.3, 0.92, 1.14, 0.94], "speed", "Exceptional speed; movement control is very responsive.", 1200],
    ["kaiser", "Kaiser", "Command-class dreadfighter", "#e7bb72", 22, [-18, -9, 0, 9, 18], "spread", [0.82, 1.45, 0.9, 0.94], "bounty", "A 20% chance to earn double credits from a kill.", 1300],
    ["wraith", "Wraith", "Ghost-matter phantom", "#85a4ff", 23, [-12, 12], "converge", [1.08, 1.08, 1.28, 1.08], "evasive", "Briefly phases through enemy fire more often.", 1400],
    ["solstice", "Solstice", "Solar flare carrier", "#ffb467", 24, [-17, -6, 6, 17], "quad", [0.96, 1.12, 1, 1.16], "overcharge", "Every sixth volley erupts in a damaging flare.", 1500],
    ["aquila", "Aquila", "Eagle-class marksman", "#8dd7ff", 25, [-9, 9], "converge", [0.92, 1.06, 1.42, 0.94], "pierce", "Shots pierce two extra targets and travel faster.", 1650],
    ["orion", "Orion", "Hunter constellation craft", "#a4edff", 26, [-14, 0, 14], "tri", [1.04, 1.12, 1.04, 1.02], "homing", "Projectiles gently track their nearest target.", 1800],
    ["draco", "Draco", "Dragon-bone assault ship", "#ff7964", 27, [-18, 0, 18], "fan", [0.92, 1.3, 1.05, 0.98], "explosive", "Direct hits erupt in a small area blast.", 2000]
  ].map(([id, name, role, color, design, mounts, pattern, stats, passive, passiveDescription, cost]) => ({
    id,
    name,
    role,
    color,
    design,
    silhouette: silhouettes[design],
    mounts: mounts.map((x, index) => ({ x, y: -11 - (index % 2) * 2 })),
    pattern,
    stats: { speed: stats[0], damage: stats[1], fireRate: stats[2], shield: stats[3] },
    passive,
    passiveDescription,
    cost
  }));

  const weapons = [
    { id: "pulse", name: "Pulse Bolt", family: "Plasma", description: "Dependable single-target energy bolts.", color: "#62e5ff", damage: 1, speed: 560, cooldown: 0.2, radius: 3, behavior: "standard", cost: 0, dropWeight: 18 },
    { id: "scatter", name: "Scattershot", family: "Kinetic", description: "Five pellets fan across a wide arc.", color: "#ffc469", damage: 0.72, speed: 410, cooldown: 0.48, radius: 3, behavior: "scatter", cost: 120, dropWeight: 11 },
    { id: "lance", name: "Ion Lance", family: "Ion", description: "A fast, long bolt that pierces two targets.", color: "#8bf6ff", damage: 2.2, speed: 780, cooldown: 0.72, radius: 4, behavior: "pierce", pierce: 2, cost: 200, dropWeight: 8 },
    { id: "plasma", name: "Plasma Orb", family: "Plasma", description: "Heavy orb bursts into a small impact blast.", color: "#c480ff", damage: 2.4, speed: 320, cooldown: 0.65, radius: 7, behavior: "splash", splash: 48, cost: 260, dropWeight: 8 },
    { id: "missile", name: "Rocket", family: "Explosive", description: "Explosive rockets deal area damage on impact.", color: "#ff9061", damage: 2.1, speed: 345, cooldown: 0.78, radius: 5, behavior: "splash", splash: 66, cost: 300, dropWeight: 7 },
    { id: "homing", name: "Seeker", family: "Guided", description: "Guided rounds steer toward nearby hostiles.", color: "#a6f478", damage: 1.25, speed: 310, cooldown: 0.5, radius: 4, behavior: "homing", turnRate: 3.2, cost: 340, dropWeight: 7 },
    { id: "cryo", name: "Cryo Shard", family: "Cryogenic", description: "Freezes hit targets, slowing them briefly.", color: "#9ceaff", damage: 0.9, speed: 480, cooldown: 0.38, radius: 4, behavior: "freeze", slow: 0.35, cost: 360, dropWeight: 6 },
    { id: "cluster", name: "Cluster Bomb", family: "Explosive", description: "Splits into a fan of child charges mid-flight.", color: "#ffb45c", damage: 0.92, speed: 330, cooldown: 0.9, radius: 6, behavior: "cluster", cost: 420, dropWeight: 5 },
    { id: "ricochet", name: "Ricochet Disc", family: "Kinetic", description: "Bounces between targets after each hit.", color: "#ffe07a", damage: 1.05, speed: 500, cooldown: 0.46, radius: 4, behavior: "ricochet", bounces: 3, cost: 460, dropWeight: 5 },
    { id: "piercer", name: "Void Piercer", family: "Void", description: "Pierces every target in a narrow lane.", color: "#d1a1ff", damage: 1.35, speed: 680, cooldown: 0.58, radius: 4, behavior: "pierce", pierce: 99, cost: 500, dropWeight: 5 },
    { id: "beam", name: "Prism Beam", family: "Energy", description: "Instant focused beam burns targets in line.", color: "#ff8be9", damage: 1.4, speed: 900, cooldown: 0.28, radius: 3, behavior: "beam", pierce: 99, cost: 560, dropWeight: 5 },
    { id: "mine", name: "Proximity Mine", family: "Explosive", description: "Drops behind the ship and detonates near a foe.", color: "#ff7b71", damage: 3, speed: 240, cooldown: 1.1, radius: 7, behavior: "mine", splash: 78, cost: 620, dropWeight: 4 },
    { id: "vortex", name: "Gravity Well", family: "Gravitic", description: "Pulls nearby enemies together and crushes them.", color: "#b58cff", damage: 1.4, speed: 260, cooldown: 1.05, radius: 9, behavior: "vortex", splash: 90, cost: 700, dropWeight: 4 },
    { id: "ion", name: "EMP Arc", family: "Ion", description: "Chains electrical damage to nearby enemies.", color: "#7bffc9", damage: 1.1, speed: 590, cooldown: 0.52, radius: 4, behavior: "chain", chains: 3, cost: 760, dropWeight: 4 },
    { id: "rail", name: "Rail Driver", family: "Kinetic", description: "Very fast armor-piercing shot hits hard.", color: "#f3f6ff", damage: 3.1, speed: 1100, cooldown: 0.9, radius: 4, behavior: "pierce", pierce: 99, cost: 850, dropWeight: 3 },
    { id: "nova", name: "Nova Burst", family: "Energy", description: "Explosive starburst damages everything nearby.", color: "#ffda7a", damage: 1.55, speed: 390, cooldown: 0.72, radius: 5, behavior: "nova", splash: 115, cost: 950, dropWeight: 3 }
  ];

  const patterns = {
    single: { angle: [0] },
    dual: { angle: [0] },
    converge: { angle: [0] },
    alternating: { angle: [0] },
    fan: { angle: [-0.24, 0, 0.24] },
    twinFan: { angle: [-0.17, 0.17] },
    quad: { angle: [-0.12, 0, 0, 0.12] },
    tri: { angle: [-0.12, 0, 0.12] },
    spread: { angle: [-0.3, -0.15, 0, 0.15, 0.3] }
  };

  window.COSMIC_DATA = Object.freeze({ ships, weapons, patterns });
})();
