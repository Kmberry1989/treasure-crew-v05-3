import { escapeHtml } from "./helpers.js";
import { state } from "./state.js";

let rerender = () => {};

export function configureAssetRendering(callback) {
  rerender = callback;
}

export const FALLBACK_ASSET_MANIFEST = {
  version: "1.0.0",
  notes: "Canonical runtime asset manifest for Treasure Crew V1. IDs stay stable even as source art is replaced.",
  models: {
    players: [
      { id: "player-kyle", name: "Player Kyle", src: "assets/models/players/player_kyle.glb", thumbnail: "assets/thumbnails/players/player-captain.png", slot: "crew", sceneRole: "captain-player", animationSet: "crew-core", defaultIdle: "standing-greeting", supportedClips: ["standing-greeting", "walking", "jogging", "joyful-jump", "button-pushing"], characterRig: "crew-biped", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 0 },
      { id: "player-rochelle", name: "Player Rochelle", src: "assets/models/players/player_rochelle.glb", thumbnail: "", slot: "crew", sceneRole: "engineer-player", animationSet: "crew-core", defaultIdle: "sitting", supportedClips: ["sitting", "sitting-and-pointing", "opening", "pick-fruit", "dig-and-plant-seeds"], characterRig: "crew-biped", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 0 },
      { id: "player-vickie", name: "Player Vickie", src: "assets/models/players/player_vickie.glb", thumbnail: "", slot: "crew", sceneRole: "engineer-player", animationSet: "crew-core", defaultIdle: "sitting", supportedClips: ["sitting", "sitting-clap", "surprised", "climbing-ladder"], characterRig: "crew-biped", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 5 },
    ],
    pirates: [
      { id: "pirate-one", name: "Pirate Mate One", src: "assets/models/pirates/pirate_1.glb", thumbnail: "assets/thumbnails/pirates/pirate-default.png", slot: "enemy", sceneRole: "pirate-captain", animationSet: "pirate-core", defaultIdle: "hanging-idle", supportedClips: ["stable-sword-inward-slash", "surprised", "walking"], characterRig: "pirate-biped", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 3 },
      { id: "pirate-two", name: "Pirate Mate Two", src: "assets/models/pirates/pirate_2.glb", thumbnail: "", slot: "enemy", sceneRole: "pirate-captain", animationSet: "pirate-core", defaultIdle: "hanging-idle", supportedClips: ["stable-sword-inward-slash", "surprised", "walking"], characterRig: "pirate-biped", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 4 },
    ],
    boats: [
      { id: "boat-pirate-brown", name: "Brown Pirate Ship", src: "assets/models/boats/boat_pirate.glb", thumbnail: "assets/thumbnails/boats/boat-pirate-brown.png", slot: "player-boat", sceneRole: "player-boat", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, 0], unlockAtManualPages: 0 },
    ],
    islands: [
      { id: "island-castleberry-cove", name: "Castleberry Cove", src: "assets/models/islands/island-castleberry-cove.glb", thumbnail: "assets/thumbnails/islands/island-berry-cove.png", slot: "treasure-island", sceneRole: "treasure-island", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], unlockAtManualPages: 6 },
      { id: "island-bigleaf-bluff", name: "Bigleaf Bluff", src: "assets/models/islands/island-bigleaf-bluff.glb", thumbnail: "", slot: "treasure-island", sceneRole: "treasure-island", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], unlockAtManualPages: 2 },
      { id: "island-gemshine-cay", name: "Gemshine Cay", src: "assets/models/islands/island-gemshine-cay.glb", thumbnail: "", slot: "treasure-island", sceneRole: "treasure-island", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], unlockAtManualPages: 3 },
      { id: "island-lava-lump", name: "Lava Lump", src: "assets/models/islands/island-lava-lump.glb", thumbnail: "", slot: "treasure-island", sceneRole: "treasure-island", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], unlockAtManualPages: 4 },
      { id: "island-sandy-steps-isle", name: "Sandy Steps Isle", src: "assets/models/islands/island-sandy-steps-isle.glb", thumbnail: "", slot: "treasure-island", sceneRole: "treasure-island", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], unlockAtManualPages: 5 },
      { id: "island-skullbone-bay", name: "Skullbone Bay", src: "assets/models/islands/island-skullbone-bay.glb", thumbnail: "", slot: "treasure-island", sceneRole: "treasure-island", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], unlockAtManualPages: 5 },
      { id: "island-snowcap-nook", name: "Snowcap Nook", src: "assets/models/islands/island-snowcap-nook.glb", thumbnail: "", slot: "treasure-island", sceneRole: "treasure-island", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], unlockAtManualPages: 6 },
    ],
    environments: [
      { id: "env-boat-cockpit", name: "Boat Cockpit", src: "assets/models/environments/boat_cockpit.glb", thumbnail: "assets/thumbnails/environments/env-sky-cockpit.png", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 0 },
      { id: "env-boat-dashboard", name: "Boat Dashboard", src: "assets/models/environments/boat_dashboard.glb", thumbnail: "", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 1 },
      { id: "env-boat-radio", name: "Boat Radio", src: "assets/models/environments/boat_radio.glb", thumbnail: "", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 2 },
      { id: "env-boat-breakers", name: "Boat Breakers", src: "assets/models/environments/boat_breakers.glb", thumbnail: "", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 3 },
      { id: "env-boat-meters", name: "Boat Meters", src: "assets/models/environments/boat_meters.glb", thumbnail: "", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 4 },
      { id: "env-boat-shifter", name: "Boat Shifter", src: "assets/models/environments/boat_shifter.glb", thumbnail: "", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 5 },
      { id: "env-boat-extinguisher", name: "Boat Extinguisher", src: "assets/models/environments/boat_extinguisher.glb", thumbnail: "", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 5 },
      { id: "env-open-sea", name: "Open Sea", src: "assets/models/environments/sea.glb", thumbnail: "", slot: "environment", sceneRole: "environment", status: "runtime-ready", scale: 1, rotation: [0, 0, 0], unlockAtManualPages: 6 },
    ],
    steeringWheels: [
      { id: "wheel-classic", name: "Classic Toy Wheel", src: "assets/models/steering-wheels/wheel-classic.glb", thumbnail: "", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 0, status: "runtime-ready" },
      { id: "wheel-brass", name: "Royal Brass Wheel", src: "assets/models/steering-wheels/wheel-brass.glb", thumbnail: "assets/thumbnails/steering-wheels/wheel-brass.png", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 1, status: "runtime-ready" },
      { id: "wheel-pirate", name: "Pirate Bone Wheel", src: "assets/models/steering-wheels/wheel-pirate.glb", thumbnail: "assets/thumbnails/steering-wheels/wheel-pirate.png", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 3, status: "runtime-ready" },
      { id: "wheel-aqua", name: "Aqua Wheel", src: "assets/models/steering-wheels/wheel-aqua.glb", thumbnail: "", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 2, status: "runtime-ready" },
      { id: "wheel-simple", name: "Simple Wheel", src: "assets/models/steering-wheels/wheel-simple.glb", thumbnail: "", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 2, status: "runtime-ready" },
      { id: "wheel-traditional", name: "Traditional Wheel", src: "assets/models/steering-wheels/wheel-traditional.glb", thumbnail: "", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 4, status: "runtime-ready" },
      { id: "wheel-wooden", name: "Wooden Wheel", src: "assets/models/steering-wheels/wheel-wooden.glb", thumbnail: "", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 5, status: "runtime-ready" },
    ],
    seats: [
      { id: "seat-navy", name: "Navy Captain Chair", src: "assets/models/seats/seat-navy.glb", thumbnail: "", slot: "player-seat", sceneRole: "captain-seat", unlockAtManualPages: 0, status: "runtime-ready" },
      { id: "seat-cream", name: "Cloud Cream Chair", src: "assets/models/seats/seat-cream.glb", thumbnail: "assets/thumbnails/seats/seat-cream.png", slot: "player-seat", sceneRole: "engineer-seat", unlockAtManualPages: 2, status: "runtime-ready" },
      { id: "seat-pirate", name: "Pirate Red Chair", src: "assets/models/seats/seat-pirate.glb", thumbnail: "assets/thumbnails/seats/seat-pirate.png", slot: "player-seat", sceneRole: "engineer-seat", unlockAtManualPages: 4, status: "runtime-ready" },
      { id: "seat-executive", name: "Executive Chair", src: "assets/models/seats/seat-executive.glb", thumbnail: "", slot: "player-seat", sceneRole: "player-seat", unlockAtManualPages: 1, status: "runtime-ready" },
      { id: "seat-pleather", name: "Pleather Chair", src: "assets/models/seats/seat-pleather.glb", thumbnail: "", slot: "player-seat", sceneRole: "player-seat", unlockAtManualPages: 3, status: "runtime-ready" },
      { id: "seat-professional", name: "Professional Chair", src: "assets/models/seats/seat-professional.glb", thumbnail: "", slot: "player-seat", sceneRole: "player-seat", unlockAtManualPages: 4, status: "runtime-ready" },
      { id: "seat-royal", name: "Royal Chair", src: "assets/models/seats/seat-royal.glb", thumbnail: "", slot: "player-seat", sceneRole: "player-seat", unlockAtManualPages: 5, status: "runtime-ready" },
      { id: "seat-teal", name: "Teal Chair", src: "assets/models/seats/seat-teal.glb", thumbnail: "", slot: "player-seat", sceneRole: "player-seat", unlockAtManualPages: 6, status: "runtime-ready" },
    ],
  },
  gui: {
    coin: "assets/gui/coin.svg",
    pearl: "assets/gui/pearl.svg",
    gem: "assets/gui/gem.svg",
    berry: "assets/gui/berry.svg",
    pirateFlag: "assets/gui/pirate-flag.svg",
    radioWave: "assets/gui/radio-wave.svg",
  },
  minigames: {
    wordTileFrame: "assets/minigames/word/word-tile-frame.svg",
    liquidTube: "assets/minigames/maintenance/liquid-tube.svg",
    treasureX: "assets/minigames/treasure/treasure-x.svg",
  },
  animations: {
    sourceRoot: "assets/thumbnails/animations",
    runtimeRoot: "assets/animations/runtime",
    catalog: "assets/animations/animation-catalog.json",
  },
};

export const HANGAR_CATEGORIES = [
  { key: "players", label: "Players", icon: "🧍", equipTargets: ["captain", "engineer"], folder: "assets/models/players" },
  { key: "boats", label: "Boats", icon: "⛵", equipTargets: ["boat"], folder: "assets/models/boats" },
  { key: "steeringWheels", label: "Wheels", icon: "☸", equipTargets: ["wheel"], folder: "assets/models/steering-wheels" },
  { key: "seats", label: "Seats", icon: "💺", equipTargets: ["captain", "engineer"], folder: "assets/models/seats" },
  { key: "pirates", label: "Pirates", icon: "☠️", equipTargets: ["pirate"], folder: "assets/models/pirates" },
  { key: "islands", label: "Islands", icon: "🏝️", equipTargets: ["island"], folder: "assets/models/islands" },
  { key: "environments", label: "Environments", icon: "🌤️", equipTargets: ["environment"], folder: "assets/models/environments" },
];

state.assetManifest = FALLBACK_ASSET_MANIFEST;

export function normalizeAssetPath(src) {
  return String(src || "").replace(/^\/+/, "");
}

export function publicAssetPath(src) {
  if (!src) return "";
  return `/${normalizeAssetPath(src)}`;
}

export function mergeManifest(base, incoming) {
  return {
    ...base,
    ...incoming,
    models: { ...(base.models || {}), ...(incoming.models || {}) },
    gui: { ...(base.gui || {}), ...(incoming.gui || {}) },
    minigames: { ...(base.minigames || {}), ...(incoming.minigames || {}) },
    animations: { ...(base.animations || {}), ...(incoming.animations || {}) },
  };
}

export function modelItems(category) {
  return state.assetManifest?.models?.[category] || [];
}

export function modelById(category, id) {
  return modelItems(category).find((item) => item.id === id) || { id, name: id, src: "" };
}

export function assetStatusFor(src) {
  if (!src) return "fallback";
  const key = normalizeAssetPath(src);
  if (!(key in state.assetStatus)) return "checking";
  return state.assetStatus[key] ? "ready" : "missing";
}

export function statusLabel(status) {
  return { ready: "file ready", missing: "missing file", checking: "checking", fallback: "fallback" }[status] || status;
}

function collectAssetPaths() {
  const modelPaths = Object.values(state.assetManifest?.models || {})
    .flat()
    .flatMap((item) => [item.src, item.thumbnail])
    .filter(Boolean);
  const guiPaths = Object.values(state.assetManifest?.gui || {}).filter(Boolean);
  const minigamePaths = Object.values(state.assetManifest?.minigames || {}).filter(Boolean);
  return [...new Set([...modelPaths, ...guiPaths, ...minigamePaths].map(normalizeAssetPath))];
}

export async function scanAssetStatus() {
  if (state.assetScanStarted) return;
  state.assetScanStarted = true;
  const paths = collectAssetPaths();
  await Promise.all(
    paths.map(async (src) => {
      try {
        const response = await fetch(`/${src}`, { method: "HEAD", cache: "no-store" });
        state.assetStatus[src] = response.ok;
      } catch {
        state.assetStatus[src] = false;
      }
    }),
  );
  rerender();
}

export async function loadAssetManifest() {
  try {
    const response = await fetch("/assets/asset-manifest.json", { cache: "no-store" });
    if (!response.ok) {
      state.assetManifest = FALLBACK_ASSET_MANIFEST;
      state.assetScanStarted = false;
      await scanAssetStatus();
      return;
    }
    const manifest = await response.json();
    state.assetManifest = mergeManifest(FALLBACK_ASSET_MANIFEST, manifest);
    state.assetScanStarted = false;
    rerender();
    await scanAssetStatus();
  } catch {
    state.assetManifest = FALLBACK_ASSET_MANIFEST;
    state.assetScanStarted = false;
    await scanAssetStatus();
  }
}

export function previewIcon(category, id) {
  if (category === "players") return "🧍";
  if (category === "steeringWheels") return "☸";
  if (category === "seats") return "💺";
  if (category === "boats") return String(id).includes("pirate") ? "🏴‍☠️" : "⛵";
  if (category === "pirates") return "☠️";
  if (category === "islands") return "🏝️";
  if (category === "environments") return "🌤️";
  if (String(id).toLowerCase().includes("coin")) return "🟡";
  if (String(id).toLowerCase().includes("gem")) return "💎";
  return "⬡";
}

export function guessCategoryForItem(item) {
  const groups = Object.entries(state.assetManifest.models || {});
  const found = groups.find(([, items]) => items.some((candidate) => candidate.id === item.id));
  return found?.[0] || "players";
}

export function thumbnailMarkup(category, item) {
  const thumbReady = item.thumbnail && state.assetStatus[normalizeAssetPath(item.thumbnail)];
  if (thumbReady) return `<img src="${publicAssetPath(item.thumbnail)}" alt="${escapeHtml(item.name)} thumbnail" />`;
  return `<span class="fallback-asset-icon">${previewIcon(category, item.id)}</span>`;
}

export function handleLocalPreview(file) {
  if (!file) return;
  if (state.ui.localPreview?.url) URL.revokeObjectURL(state.ui.localPreview.url);
  const url = URL.createObjectURL(file);
  state.ui.localPreview = { src: url, url, name: file.name };
  rerender();
}
