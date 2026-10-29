(() => {
  "use strict";

  const stages = [
    { id: "mercury", title: "MERCURY RUN", body: "mercury", boss: { name: "CINDER WARDEN", color: "#e89a64", health: 250, pattern: "fan" }, reward: 280, waves: [["scout", "scout", "scout", "scout"], ["scout", "gunship", "scout", "gunship"], ["gunship", "scout", "dreadnought", "scout"]] },
    { id: "venus", title: "VENUS CLOUDSEA", body: "venus", boss: { name: "VAPOR MATRIARCH", color: "#f4c778", health: 310, pattern: "sweep" }, reward: 340, waves: [["scout", "gunship", "scout", "gunship"], ["gunship", "gunship", "scout", "scout", "scout"], ["dreadnought", "gunship", "gunship"]] },
    { id: "earth", title: "BLUE FRONTIER", body: "earth", boss: { name: "ABYSSAL CARRIER", color: "#56b9f4", health: 370, pattern: "barrage" }, reward: 400, waves: [["scout", "scout", "scout", "gunship", "scout"], ["gunship", "dreadnought", "gunship"], ["scout", "gunship", "dreadnought", "gunship", "scout"]] },
    { id: "mars", title: "RED DUST BELT", body: "mars", boss: { name: "IRONCLAD BEHEMOTH", color: "#f0785d", health: 430, pattern: "cross" }, reward: 460, waves: [["scout", "scout", "gunship", "scout", "scout"], ["dreadnought", "gunship", "gunship", "scout"], ["dreadnought", "dreadnought", "gunship"]] },
    { id: "jupiter", title: "JOVIAN STORM", body: "jupiter", boss: { name: "TEMPEST LEVIATHAN", color: "#d99b72", health: 510, pattern: "ring" }, reward: 530, waves: [["scout", "gunship", "scout", "gunship", "scout", "scout"], ["dreadnought", "gunship", "dreadnought"], ["gunship", "gunship", "dreadnought", "scout", "scout"]] },
    { id: "saturn", title: "RING SHADOW", body: "saturn", boss: { name: "CHRONO EXECUTOR", color: "#e2cf96", health: 590, pattern: "sweep" }, reward: 620, waves: [["gunship", "scout", "gunship", "scout", "gunship"], ["dreadnought", "dreadnought", "gunship"], ["scout", "gunship", "dreadnought", "dreadnought"]] },
    { id: "uranus", title: "URANIAN ICE GIANT", body: "uranus", boss: { name: "FROST ARCHON", color: "#7ce2e5", health: 650, pattern: "ring" }, reward: 680, waves: [["scout", "gunship", "scout", "dreadnought", "scout"], ["gunship", "dreadnought", "gunship", "dreadnought"], ["dreadnought", "gunship", "dreadnought", "gunship"]] },
    { id: "neptune", title: "NEPTUNE'S EDGE · LAST LIGHT", body: "neptune", boss: { name: "SOLAR DEVOURER", color: "#ff963e", health: 900, pattern: "flare" }, reward: 1400, waves: [["scout", "gunship", "scout", "dreadnought"], ["gunship", "gunship", "dreadnought", "scout", "scout"], ["dreadnought", "dreadnought", "gunship", "gunship"]] }
  ];

  const moonMissions = [
    { id: "moon", title: "LUNAR RELAY", body: "moon", boss: { name: "SILENT SENTINEL", color: "#c5e2ef", health: 240, pattern: "aimed" }, reward: 220, waves: [["scout", "scout", "gunship"], ["gunship", "dreadnought"]] },
    { id: "io", title: "IO VOLCANIC RUN", body: "io", boss: { name: "MAGMA TITAN", color: "#ff7952", health: 320, pattern: "cross" }, reward: 300, waves: [["scout", "gunship", "scout", "gunship"], ["dreadnought", "gunship", "dreadnought"]] },
    { id: "europa", title: "EUROPA ICE VEIL", body: "europa", boss: { name: "CRYO WRAITH", color: "#a6f1ff", health: 300, pattern: "sweep" }, reward: 280, waves: [["scout", "scout", "gunship", "scout"], ["gunship", "dreadnought", "gunship"]] },
    { id: "titan", title: "TITAN HAZE", body: "titan", boss: { name: "HAZE COLOSSUS", color: "#f2b66f", health: 350, pattern: "ring" }, reward: 330, waves: [["gunship", "scout", "gunship", "scout"], ["dreadnought", "gunship", "dreadnought"]] }
  ];

  window.COSMIC_CAMPAIGN_DATA = Object.freeze({ stages, moonMissions });
})();
