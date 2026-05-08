const app = document.querySelector("#app");

const ROLE_COPY = {
  captain: {
    eyebrow: "Radio + Navigation",
    title: "Captain Seat",
    description: "Reads clues, restores phrases, and keeps the shared route understandable.",
  },
  engineer: {
    eyebrow: "Maintenance + Repair",
    title: "Engineer Seat",
    description: "Sorts systems, balances repairs, and executes the Captain's callouts.",
  },
};

const WORD_GRIDS = {
  RADIO: ["R A D I O".split(" "), "W T S E A".split(" "), "P M A P L".split(" "), "C O D E K".split(" "), "B U O Y S".split(" ")],
  ANCHOR: ["A N C H O R".split(" "), "T I D E S X".split(" "), "M A S T S Y".split(" "), "B U O Y S Z".split(" "), "C O V E S Q".split(" "), "R O P E S P".split(" ")],
};

const LIQUID_START = [["sun", "sea", "rose", "sun"], ["sea", "rose", "mint", "mint"], ["rose", "sun", "sea", "mint"], []];
const MATCHING_ICONS = ["⚓", "🧭", "🔧", "💡"];
const MANUAL_SECTIONS = ["Launch Rituals", "Treasure Protocol", "Pirate Calm", "Storm Recovery", "Signal Etiquette", "Voyage Lore"];
const SIGNAL_SET = ["wave", "flag", "bell", "star", "sun", "anchor"];
const SIGNAL_ICONS = { wave: "〰️", flag: "🚩", bell: "🔔", star: "⭐", sun: "☀️", anchor: "⚓" };
const PULSE_COLORS = { amber: "🟡", blue: "🔵", green: "🟢", rose: "🩷" };
const CARGO_ITEMS = [
  { id: "apple", label: "Apple Crate", group: "fruit", icon: "🍎" },
  { id: "berry", label: "Berry Basket", group: "fruit", icon: "🫐" },
  { id: "pear", label: "Pear Box", group: "fruit", icon: "🍐" },
  { id: "hammer", label: "Hammer Kit", group: "tools", icon: "🔨" },
  { id: "wrench", label: "Wrench Tin", group: "tools", icon: "🔧" },
  { id: "bolt", label: "Bolt Jar", group: "tools", icon: "🪛" },
  { id: "coin", label: "Coin Chest", group: "treasure", icon: "🪙" },
  { id: "gem", label: "Gem Crate", group: "treasure", icon: "💎" },
  { id: "pearl", label: "Pearl Bowl", group: "treasure", icon: "🦪" },
];

const FALLBACK_ASSET_MANIFEST = {
  version: "0.7.0",
  notes: "Drop real GLB/GLTF files into the listed folders, then keep ids stable so unlocks and equipped loadouts remain valid.",
  models: {
    players: [
      { id: "player-default", name: "Default Crew Toy", src: "", thumbnail: "", slot: "crew", sceneRole: "captain-player", animationSet: "crew-core", defaultIdle: "sitting", supportedClips: ["sitting", "standing-greeting", "silly-dancing", "sitting-clap", "sitting-laughing"], characterRig: "crew-biped", status: "css-fallback", scale: 1, rotation: [0, 0, 0] },
      { id: "player-captain", name: "Captain Variant", src: "assets/models/players/player-captain.glb", thumbnail: "assets/thumbnails/players/player-captain.png", slot: "crew", sceneRole: "captain-player", animationSet: "crew-core", defaultIdle: "sitting", supportedClips: ["sitting", "standing-greeting", "silly-dancing", "sitting-clap", "sitting-laughing"], characterRig: "crew-biped", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], chapterTags: ["harbor-launch", "treasure-waters"] },
      { id: "sailor-kyle", name: "Sailor Kyle", src: "assets/models/players/sailor_kyle.glb", thumbnail: "", slot: "crew", sceneRole: "captain-player", animationSet: "crew-core", defaultIdle: "standing-greeting", supportedClips: ["standing-greeting", "walking", "jogging", "joyful-jump", "button-pushing"], characterRig: "crew-biped", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], chapterTags: ["harbor-launch", "storm-repair"] },
      { id: "sailor-rochelle", name: "Sailor Rochelle", src: "assets/models/players/sailor_rochelle.glb", thumbnail: "", slot: "crew", sceneRole: "engineer-player", animationSet: "crew-core", defaultIdle: "sitting", supportedClips: ["sitting", "sitting-and-pointing", "opening", "pick-fruit", "dig-and-plant-seeds"], characterRig: "crew-biped", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], chapterTags: ["treasure-waters"] },
      { id: "sailor-vickie", name: "Sailor Vickie", src: "assets/models/players/sailor_vickie.glb", thumbnail: "", slot: "crew", sceneRole: "engineer-player", animationSet: "crew-core", defaultIdle: "sitting", supportedClips: ["sitting", "sitting-clap", "surprised", "climbing-ladder"], characterRig: "crew-biped", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], chapterTags: ["pirate-intercept", "storm-repair"] },
    ],
    pirates: [
      { id: "pirate-default", name: "Pirate Toy Enemy", src: "assets/models/pirates/pirate-default.glb", thumbnail: "assets/thumbnails/pirates/pirate-default.png", slot: "enemy", sceneRole: "pirate-captain", animationSet: "pirate-core", defaultIdle: "hanging-idle", supportedClips: ["stable-sword-inward-slash", "surprised", "hanging-idle", "walking"], characterRig: "pirate-biped", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], chapterTags: ["pirate-intercept"] },
      { id: "pirate-one", name: "Pirate Mate One", src: "assets/models/pirates/pirate_1.glb", thumbnail: "", slot: "enemy", sceneRole: "pirate-captain", animationSet: "pirate-core", defaultIdle: "hanging-idle", supportedClips: ["stable-sword-inward-slash", "surprised", "walking"], characterRig: "pirate-biped", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], chapterTags: ["pirate-intercept"] },
      { id: "pirate-two", name: "Pirate Mate Two", src: "assets/models/pirates/pirate_2.glb", thumbnail: "", slot: "enemy", sceneRole: "pirate-captain", animationSet: "pirate-core", defaultIdle: "hanging-idle", supportedClips: ["stable-sword-inward-slash", "surprised", "walking"], characterRig: "pirate-biped", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], chapterTags: ["pirate-intercept"] },
    ],
    boats: [
      { id: "boat-glossy-sloop", name: "Glossy Sloop", src: "assets/models/boats/boat-glossy-sloop.glb", thumbnail: "assets/thumbnails/boats/boat-glossy-sloop.png", slot: "player-boat", sceneRole: "player-boat", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], position: [0, 0, 0] },
      { id: "boat-pirate-brown", name: "Brown Pirate Ship", src: "assets/models/boats/boat-pirate-brown.glb", thumbnail: "assets/thumbnails/boats/boat-pirate-brown.png", slot: "pirate-boat", sceneRole: "pirate-boat", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], position: [1, 0, 0], chapterTags: ["pirate-intercept"] },
    ],
    islands: [
      { id: "island-berry-cove", name: "Berry Cove Island", src: "assets/models/islands/island-berry-cove.glb", thumbnail: "assets/thumbnails/islands/island-berry-cove.png", slot: "treasure-island", sceneRole: "treasure-island", status: "drop-your-model", scale: 1, rotation: [0, 0, 0], position: [0, 0, -1], chapterTags: ["treasure-waters"] },
    ],
    environments: [
      { id: "env-sky-cockpit", name: "Sky Cockpit Environment", src: "assets/models/environments/env-sky-cockpit.glb", thumbnail: "assets/thumbnails/environments/env-sky-cockpit.png", slot: "environment", sceneRole: "environment", status: "drop-your-model", scale: 1, rotation: [0, 0, 0] },
    ],
    steeringWheels: [
      { id: "wheel-classic", name: "Classic Toy Wheel", src: "", thumbnail: "", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 0, status: "css-fallback" },
      { id: "wheel-brass", name: "Royal Brass Wheel", src: "assets/models/steering-wheels/wheel-brass.glb", thumbnail: "assets/thumbnails/steering-wheels/wheel-brass.png", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 1, status: "drop-your-model", chapterTags: ["harbor-launch"] },
      { id: "wheel-pirate", name: "Pirate Bone Wheel", src: "assets/models/steering-wheels/wheel-pirate.glb", thumbnail: "assets/thumbnails/steering-wheels/wheel-pirate.png", slot: "cockpit-wheel", sceneRole: "cockpit-wheel", unlockAtManualPages: 3, status: "drop-your-model", chapterTags: ["pirate-intercept"] },
    ],
    seats: [
      { id: "seat-navy", name: "Navy Captain Chair", src: "", thumbnail: "", slot: "player-seat", sceneRole: "captain-seat", unlockAtManualPages: 0, status: "css-fallback" },
      { id: "seat-cream", name: "Cloud Cream Chair", src: "assets/models/seats/seat-cream.glb", thumbnail: "assets/thumbnails/seats/seat-cream.png", slot: "player-seat", sceneRole: "engineer-seat", unlockAtManualPages: 2, status: "drop-your-model" },
      { id: "seat-pirate", name: "Pirate Red Chair", src: "assets/models/seats/seat-pirate.glb", thumbnail: "assets/thumbnails/seats/seat-pirate.png", slot: "player-seat", sceneRole: "engineer-seat", unlockAtManualPages: 4, status: "drop-your-model", chapterTags: ["pirate-intercept"] },
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

const HANGAR_CATEGORIES = [
  { key: "players", label: "Players", icon: "🧍", equipTargets: ["captain", "engineer"], folder: "assets/models/players" },
  { key: "boats", label: "Boats", icon: "⛵", equipTargets: ["boat"], folder: "assets/models/boats" },
  { key: "steeringWheels", label: "Wheels", icon: "☸", equipTargets: ["wheel"], folder: "assets/models/steering-wheels" },
  { key: "seats", label: "Seats", icon: "💺", equipTargets: ["captain", "engineer"], folder: "assets/models/seats" },
  { key: "pirates", label: "Pirates", icon: "☠️", equipTargets: ["pirate"], folder: "assets/models/pirates" },
  { key: "islands", label: "Islands", icon: "🏝️", equipTargets: ["island"], folder: "assets/models/islands" },
  { key: "environments", label: "Environments", icon: "🌤️", equipTargets: ["environment"], folder: "assets/models/environments" },
];

const state = {
  room: null,
  playerId: localStorage.getItem("tcV06PlayerId") || "",
  code: new URLSearchParams(location.search).get("room") || localStorage.getItem("tcV06RoomCode") || "",
  name: localStorage.getItem("tcCrewName") || "",
  stream: null,
  error: "",
  assetManifest: FALLBACK_ASSET_MANIFEST,
  assetStatus: {},
  assetScanStarted: false,
  ui: {
    activeTab: localStorage.getItem("tcV06Tab") || "voyage",
    hangarCategory: localStorage.getItem("tcV06HangarCategory") || "players",
    hangarSelection: {},
    localPreview: null,
  },
};

const sceneRuntime = {
  module: null,
  loading: null,
  enabled: true,
};

function html(strings, ...values) {
  return strings.reduce((result, string, index) => `${result}${string}${index < values.length ? values[index] ?? "" : ""}`, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) throw new Error(data.error || "Request failed.");
  return data;
}

function setHistoryRoom(code = "") {
  const next = new URL(location.href);
  if (code) next.searchParams.set("room", code);
  else next.searchParams.delete("room");
  history.replaceState({}, "", next);
}

function setName(value) {
  state.name = value;
  localStorage.setItem("tcCrewName", value);
}

function setActiveTab(tab) {
  state.ui.activeTab = tab;
  localStorage.setItem("tcV06Tab", tab);
  render();
}

function modelItems(category) {
  return state.assetManifest?.models?.[category] || [];
}

function modelById(category, id) {
  return modelItems(category).find((item) => item.id === id) || { id, name: id, src: "" };
}

function safeClass(value) {
  return String(value || "default").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

async function loadAssetManifest() {
  try {
    const response = await fetch("/assets/asset-manifest.json", { cache: "no-store" });
    if (!response.ok) {
      state.assetManifest = FALLBACK_ASSET_MANIFEST;
      state.assetScanStarted = false;
      scanAssetStatus();
      return;
    }
    const manifest = await response.json();
    state.assetManifest = mergeManifest(FALLBACK_ASSET_MANIFEST, manifest);
    state.assetScanStarted = false;
    render();
    scanAssetStatus();
  } catch {
    state.assetManifest = FALLBACK_ASSET_MANIFEST;
    state.assetScanStarted = false;
    scanAssetStatus();
  }
}

function mergeManifest(base, incoming) {
  return {
    ...base,
    ...incoming,
    models: { ...(base.models || {}), ...(incoming.models || {}) },
    gui: { ...(base.gui || {}), ...(incoming.gui || {}) },
    minigames: { ...(base.minigames || {}), ...(incoming.minigames || {}) },
    animations: { ...(base.animations || {}), ...(incoming.animations || {}) },
  };
}

async function ensureSceneRuntime() {
  if (!sceneRuntime.enabled) return null;
  if (sceneRuntime.module) return sceneRuntime.module;
  if (!sceneRuntime.loading) {
    sceneRuntime.loading = import("/scene-runtime.bundle.js")
      .then((module) => {
        sceneRuntime.module = module;
        return module;
      })
      .catch((error) => {
        console.error("Failed to load scene runtime", error);
        sceneRuntime.enabled = false;
        return null;
      });
  }
  return sceneRuntime.loading;
}

async function syncSceneRuntime() {
  const runtime = await ensureSceneRuntime();
  if (!runtime) return;

  const hosts = [...document.querySelectorAll("[data-scene-host]")];
  const activeModes = new Set(hosts.map((host) => host.dataset.sceneMode));

  ["dock", "hero", "preview"].forEach((mode) => {
    if (!activeModes.has(mode)) runtime.disposeScene(mode);
  });

  if (!state.room) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
  for (const host of hosts) {
    runtime.mountScene(host, host.dataset.sceneMode);
    runtime.setSceneLayout(host.dataset.sceneMode, window.innerWidth < 720 ? "compact" : "default");
    runtime.updateSceneFromRoom(state.room, {
      mode: host.dataset.sceneMode,
      manifest: state.assetManifest,
      previewCategory: host.dataset.previewCategory || null,
      previewAssetId: host.dataset.previewAssetId || null,
      reducedMotion,
    });
  }
}

function teardownScenes() {
  if (!sceneRuntime.module) return;
  ["dock", "hero", "preview"].forEach((mode) => sceneRuntime.module.disposeScene(mode));
}

function normalizeAssetPath(src) {
  return String(src || "").replace(/^\/+/, "");
}

function publicAssetPath(src) {
  if (!src) return "";
  return `/${normalizeAssetPath(src)}`;
}

function assetStatusFor(src) {
  if (!src) return "fallback";
  const key = normalizeAssetPath(src);
  if (!(key in state.assetStatus)) return "checking";
  return state.assetStatus[key] ? "ready" : "missing";
}

function statusLabel(status) {
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

async function scanAssetStatus() {
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
  render();
}

function connectStream(code) {
  if (state.stream) state.stream.close();
  state.stream = new EventSource(`/api/events/${encodeURIComponent(code)}`);
  state.stream.onmessage = (event) => {
    state.room = JSON.parse(event.data);
    state.code = state.room.code;
    localStorage.setItem("tcV06RoomCode", state.code);
    setHistoryRoom(state.code);
    render();
  };
  state.stream.onerror = () => {
    state.error = "Live sync is reconnecting. Refresh or rejoin if it stays paused.";
    render();
  };
}

async function createRoom() {
  try {
    state.error = "";
    const data = await api("/api/create", { name: state.name || "Captain" });
    state.room = data.room;
    state.playerId = data.playerId;
    state.code = data.code;
    localStorage.setItem("tcV06PlayerId", state.playerId);
    localStorage.setItem("tcV06RoomCode", state.code);
    setHistoryRoom(state.code);
    connectStream(state.code);
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

async function joinRoom() {
  const input = document.querySelector("#joinCode");
  try {
    state.error = "";
    const data = await api("/api/join", { code: input.value, name: state.name || "Crewmate" });
    state.room = data.room;
    state.playerId = data.playerId;
    state.code = data.code;
    localStorage.setItem("tcV06PlayerId", state.playerId);
    localStorage.setItem("tcV06RoomCode", state.code);
    setHistoryRoom(state.code);
    connectStream(state.code);
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

function action(type, payload = {}) {
  if (!state.room) return Promise.resolve();
  return api("/api/action", { code: state.room.code, playerId: state.playerId, type, payload }).catch((error) => {
    state.error = error.message;
    render();
  });
}

function leaveRoom() {
  if (state.stream) state.stream.close();
  state.room = null;
  state.playerId = "";
  state.code = "";
  localStorage.removeItem("tcV06PlayerId");
  localStorage.removeItem("tcV06RoomCode");
  setHistoryRoom("");
  render();
}

function roomJoinUrl(room) {
  return `${location.origin}${room.joinUrl || `/?room=${encodeURIComponent(room.code)}`}`;
}

function roleTask(room, role) {
  return room?.tasks?.[role];
}

function me() {
  return state.room?.players?.[state.playerId] || null;
}

function mySeat() {
  return me()?.seat || null;
}

function currentRoleTask(room) {
  const seat = mySeat();
  return seat ? roleTask(room, seat) : null;
}

function render() {
  if (!state.room) {
    teardownScenes();
    return renderLanding();
  }
  renderGame();
}

function renderLanding() {
  const invite = state.code ? `${location.origin}/?room=${encodeURIComponent(state.code)}` : "";
  const qrUrl = invite ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(invite)}` : "";
  app.innerHTML = html`
    <main class="app-shell sky-scene landing-scene">
      <section class="landing-card toy-gloss">
        <div class="logo-boat" aria-hidden="true"><div class="mini-mast"></div><div class="mini-sail"></div><div class="mini-hull"></div></div>
        <p class="eyebrow">v0.7.0 animated voyage adventure</p>
        <h1>Treasure Crew</h1>
        <p>Two players join by room code or QR, claim Captain and Engineer seats, then play through short voyage chapters filled with communication games, word play, sorting, and repair puzzles.</p>
        <label class="field-label">Crew name<input id="crewName" value="${escapeHtml(state.name)}" placeholder="Rochelle" /></label>
        <div class="landing-actions">
          <button class="primary-button" id="createRoom">Create Voyage Room</button>
          <div class="join-row"><input id="joinCode" placeholder="ROOM" maxlength="5" value="${escapeHtml(state.code)}" /><button id="joinRoom">Join Room</button></div>
        </div>
        <div class="landing-meta">
          <span class="status-pill">2-player cozy teamwork</span>
          <span class="status-pill">room code + QR join</span>
          <span class="status-pill">assets sync across the voyage</span>
        </div>
        ${invite ? `<div class="landing-qr-block"><img src="${escapeHtml(qrUrl)}" alt="QR join code" /><div><strong>Join link ready</strong><code>${escapeHtml(invite)}</code></div></div>` : ""}
        ${state.error ? `<p class="error-box">${escapeHtml(state.error)}</p>` : ""}
      </section>
    </main>`;

  const crewNameInput = app.querySelector("#crewName");
  const createRoomButton = app.querySelector("#createRoom");
  const joinRoomButton = app.querySelector("#joinRoom");
  const joinCodeInput = app.querySelector("#joinCode");

  if (!crewNameInput || !createRoomButton || !joinRoomButton || !joinCodeInput) return;
  crewNameInput.oninput = (event) => setName(event.target.value);
  createRoomButton.onclick = createRoom;
  joinRoomButton.onclick = joinRoom;
  joinCodeInput.oninput = (event) => {
    event.target.value = event.target.value.toUpperCase();
    state.code = event.target.value;
  };
}

function renderGame() {
  const room = state.room;
  const player = me();
  const seat = player?.seat || null;
  const chapter = room.currentChapter;
  const task = currentRoleTask(room);
  const activeTab = state.ui.activeTab;
  const captainName = room.seats.captain ? room.players[room.seats.captain]?.name : "Open";
  const engineerName = room.seats.engineer ? room.players[room.seats.engineer]?.name : "Open";

  app.innerHTML = html`
    <main class="app-shell sky-scene voyage-shell mood-${safeClass(room.sceneSnapshot?.mood || "clear-sky")}">
      <header class="topbar toy-gloss voyage-topbar">
        <div>
          <p class="eyebrow">room code</p>
          <h1>${room.code}</h1>
        </div>
        <div class="crew-list">${Object.values(room.players || {}).map((crew) => `<span class="crew-chip ${crew.id === state.playerId ? "active" : ""}">${escapeHtml(crew.name)} · ${crew.seat || "observer"}</span>`).join("")}</div>
        <div class="topbar-actions">
          <button data-action="seat:claim" data-seat="captain">Captain</button>
          <button data-action="seat:claim" data-seat="engineer">Engineer</button>
          <button class="accent-button" data-action="seat:swap">Swap</button>
          <button data-local="share-room">Share</button>
          <button data-local="leave">Leave</button>
        </div>
      </header>

      <section class="voyage-hero toy-gloss">
        <div>
          <p class="eyebrow">chapter ${room.campaign.chapterIndex + 1} · ${escapeHtml(chapter.theme)}</p>
          <h2>${escapeHtml(chapter.title)}</h2>
          <p>${escapeHtml(room.encounter.phase === "lobby" ? "Claim seats, inspect the route, and launch the voyage." : chapter.briefing)}</p>
        </div>
        <div class="voyage-status">
          <span>${escapeHtml(room.encounter.phase)}</span>
          <span>${escapeHtml(room.sceneSnapshot?.title || "")}</span>
          <span>${room.encounter.timerEndsAt ? timeRemaining(room.encounter.timerEndsAt) : "untimed"}</span>
        </div>
      </section>

      <nav class="voyage-tabs">
        ${tabButton("voyage", "Voyage")}
        ${tabButton("puzzle", "Puzzle")}
        ${tabButton("hangar", "Hangar")}
        ${tabButton("manual", "Manual")}
      </nav>

      ${persistentAvatarStrip(room)}

      ${activeTab === "voyage" ? renderVoyageTab(room, seat, chapter) : ""}
      ${activeTab === "puzzle" ? renderPuzzleTab(room, seat, captainName, engineerName, task) : ""}
      ${activeTab === "hangar" ? renderHangarTab(room, seat) : ""}
      ${activeTab === "manual" ? renderManualTab(room) : ""}

      ${state.error ? `<div class="toast-inline error-box">${escapeHtml(state.error)}</div>` : ""}
      ${room.lastSuccess ? `<div class="toast-success">${escapeHtml(room.lastSuccess.text)}</div>` : ""}
    </main>`;

  bindGameEvents();
  if (task && activeTab === "puzzle" && room.encounter.phase === "challenge" && seat) mountTask(task, seat);
  syncSceneRuntime();
}

function tabButton(id, label) {
  return `<button class="voyage-tab ${state.ui.activeTab === id ? "active" : ""}" data-local="tab" data-tab="${id}">${label}</button>`;
}

function renderVoyageTab(room, seat, chapter) {
  return html`
    <section class="voyage-grid">
      <section class="voyage-scene-card toy-gloss">
        ${voyageSceneMarkup(room)}
      </section>
      <aside class="voyage-sidebar">
        <section class="voyage-panel toy-gloss">
          <p class="eyebrow">shared briefing</p>
          <h3>${escapeHtml(room.sceneSnapshot?.title || chapter.title)}</h3>
          <p>${escapeHtml(room.sceneSnapshot?.callout || chapter.briefing)}</p>
          <div class="directive-card ${room.scene.acknowledgedBy?.includes("captain") && room.scene.acknowledgedBy?.includes("engineer") ? "complete" : ""}">
            <strong>${seat ? ROLE_COPY[seat].title : "Observer"}</strong>
            <span>${escapeHtml(seat ? chapter[`${seat}Directive`] : "Claim a seat to receive a role directive.")}</span>
          </div>
          ${voyageActionPanel(room)}
        </section>
        <section class="voyage-panel toy-gloss">
          <p class="eyebrow">voyage status</p>
          <div class="stat-stack">
            ${statMarkup("Hull", room.stats.hull)}
            ${statMarkup("Power", room.stats.power)}
            ${statMarkup("Morale", room.stats.morale)}
            ${statMarkup("Progress", room.stats.progress)}
            ${statMarkup("Treasure", room.stats.treasure, `${room.stats.treasure}`)}
          </div>
        </section>
        <section class="voyage-panel toy-gloss">
          <p class="eyebrow">join from phone</p>
          <div class="room-qr-card">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(roomJoinUrl(room))}" alt="QR join code" />
            <div>
              <strong>Scan or share</strong>
              <code>${escapeHtml(roomJoinUrl(room))}</code>
            </div>
          </div>
        </section>
      </aside>
    </section>`;
}

function voyageSceneMarkup(room) {
  const equipped = room.sceneSnapshot?.equipped || {};
  const entries = [
    ["Boat", modelById("boats", equipped.boat || "boat-glossy-sloop")],
    ["Captain", modelById("players", equipped.captainPlayer || "player-default")],
    ["Engineer", modelById("players", equipped.engineerPlayer || "player-default")],
    ["Pirate", modelById("pirates", equipped.pirate || "pirate-default")],
    ["Island", modelById("islands", equipped.island || "island-berry-cove")],
    ["Environment", modelById("environments", equipped.environment || "env-sky-cockpit")],
  ];
  return html`
    <div class="voyage-scene-head">
      <div>
        <p class="eyebrow">reactive diorama</p>
        <h2>${escapeHtml(room.sceneSnapshot?.chapterTitle || "Voyage Scene")}</h2>
        <p>${escapeHtml(room.sceneSnapshot?.subtitle || "")}</p>
      </div>
      <span class="scene-pill">${escapeHtml(room.sceneSnapshot?.state || "idle-cruise")}</span>
    </div>
    <div class="diorama-stage" data-scene-host="hero-scene" data-scene-mode="hero"></div>
    <div class="diorama-crew-grid">
      ${sceneAssetPill(entries[1][0], entries[1][1])}
      ${sceneAssetPill(entries[2][0], entries[2][1])}
      ${sceneAssetPill("Wheel", modelById("steeringWheels", equipped.steeringWheel || "wheel-classic"))}
      ${sceneAssetPill("Captain Seat", modelById("seats", equipped.captainSeat || "seat-navy"))}
      ${sceneAssetPill("Engineer Seat", modelById("seats", equipped.engineerSeat || "seat-navy"))}
    </div>`;
}

function sceneAssetPill(label, item, extraClass = "") {
  const status = assetStatusFor(item.src);
  return `<div class="scene-asset ${extraClass} ${status}">
    <div class="scene-asset-visual">${thumbnailMarkup(guessCategoryForItem(item), item, status)}</div>
    <strong>${escapeHtml(label)}</strong>
    <small>${escapeHtml(item.name || item.id)}</small>
  </div>`;
}

function voyageActionPanel(room) {
  const bothConfirmed = room.encounter.sharedConfirmedBy?.includes("captain") && room.encounter.sharedConfirmedBy?.includes("engineer");
  if (!room.campaign.started || room.encounter.phase === "lobby") {
    return `<button class="primary-button" data-action="campaign:start">Start Voyage</button>`;
  }
  if (room.encounter.phase === "briefing") {
    return `<button class="primary-button" data-action="encounter:begin">Begin Challenge</button>`;
  }
  if (room.encounter.phase === "challenge") {
    return `<div class="voyage-callout"><strong>Challenge live</strong><span>Open the Puzzle tab and complete both role assignments before the timer ends.</span></div>`;
  }
  return html`
    <div class="route-panel">
      <p class="eyebrow">shared route confirmation</p>
      <div class="route-choice-grid">${room.routeChoices.map((choice) => `<button class="${choice.selected ? "selected" : ""}" data-action="chapter:selectRoute" data-route="${choice.id}">${escapeHtml(choice.title)}</button>`).join("")}</div>
      <button class="secondary-button" data-action="scene:acknowledge">${bothConfirmed ? "Shared Callout Confirmed" : "Confirm Shared Callout"}</button>
      <button class="primary-button" data-action="reward:claim" ${bothConfirmed ? "" : "disabled"}>Claim Reward + Continue</button>
    </div>`;
}

function renderPuzzleTab(room, seat, captainName, engineerName, task) {
  return html`
    <section class="puzzle-layout">
      <section class="cockpit toy-gloss" aria-label="toy boat cockpit">
        <div class="window-row">
          <div class="cockpit-window"><div class="cloud cloud-a"></div><div class="horizon"></div></div>
          <div class="cockpit-window"><div class="cloud cloud-b"></div><div class="horizon"></div></div>
          <div class="cockpit-window"><div class="cloud cloud-c"></div><div class="horizon"></div></div>
        </div>
        <div class="upper-console">
          ${radioMarkup()}
          ${breakerMarkup(room.switches)}
          ${instrumentMarkup(room.gauges)}
          ${gpsMarkup()}
          ${shifterMarkup()}
        </div>
        <div class="lower-console">
          ${playerStationMarkup("captain", captainName, seat === "captain", room.cosmetics?.equipped?.captainSeat, room.cosmetics?.equipped?.captainPlayer)}
          ${wheelMarkup(room.cosmetics?.equipped?.steeringWheel)}
          ${playerStationMarkup("engineer", engineerName, seat === "engineer", room.cosmetics?.equipped?.engineerSeat, room.cosmetics?.equipped?.engineerPlayer)}
        </div>
        ${assetPreviewStripMarkup(room)}
      </section>

      <aside class="role-panel toy-gloss puzzle-role-panel">
        <p class="eyebrow">active encounter</p>
        <h2>${seat ? ROLE_COPY[seat].title : "Observer Mode"}</h2>
        <p>${seat ? ROLE_COPY[seat].description : "Claim a seat to receive a live puzzle assignment."}</p>
        ${directiveMarkup(room, seat)}
        ${room.treasureHunt?.active ? treasureHuntMarkup(room.treasureHunt, seat) : ""}
        ${seat && task && room.encounter.phase === "challenge" ? taskMarkup(task, seat) : `<div class="empty-note">${escapeHtml(puzzleStatusCopy(room, seat))}</div>`}
        ${assetSummaryMarkup(room)}
      </aside>
    </section>`;
}

function persistentAvatarStrip(room) {
  const anim = room.sceneSnapshot?.animationState || {};
  return html`<section class="avatar-dock-panel toy-gloss">
    <div class="avatar-dock-copy">
      <p class="eyebrow">live crew strip</p>
      <strong>${escapeHtml(room.currentChapter.title)}</strong>
      <span>${escapeHtml(anim.phase || room.encounter.phase)} · ${escapeHtml(anim.highlightSeat || "shared focus")}</span>
    </div>
    <div class="avatar-dock-host" data-scene-host="avatar-dock" data-scene-mode="dock"></div>
  </section>`;
}

function puzzleStatusCopy(room, seat) {
  if (!seat) return "Claim Captain or Engineer to receive a role-specific puzzle.";
  if (room.encounter.phase === "briefing") return "The shared briefing is live. Begin the challenge when both players are ready.";
  if (room.encounter.phase === "resolution") return "Your role work is complete. Return to Voyage to confirm the next route together.";
  return "This encounter does not currently need an active local puzzle.";
}

function renderHangarTab(room) {
  return `<section class="hangar-tab-shell">${hangarMarkup(room)}</section>`;
}

function renderManualTab(room) {
  return html`
    <section class="manual-layout">
      <section class="voyage-panel toy-gloss">
        <p class="eyebrow">owner's manual</p>
        ${manualMarkup(room.stats.manualPages)}
      </section>
      <section class="voyage-panel toy-gloss">
        <p class="eyebrow">chapter map</p>
        <div class="chapter-ribbon">${room.chapterSummaries.map((chapter) => `<span class="${room.campaign.completedChapterIds.includes(chapter.id) ? "complete" : room.campaign.currentChapterId === chapter.id ? "active" : room.campaign.unlockedChapters.includes(chapter.id) ? "unlocked" : ""}">${escapeHtml(chapter.title)}</span>`).join("")}</div>
        <p>Completed chapters: ${room.campaign.completedChapterIds.length}</p>
      </section>
      <section class="voyage-panel toy-gloss">
        <div class="log-head"><h2>Captain's Log</h2></div>
        ${room.log.map((item) => `<p>${escapeHtml(item.text)}</p>`).join("")}
      </section>
    </section>`;
}

function directiveMarkup(room, seat) {
  const chapter = room.currentChapter;
  const captainDone = room.encounter.captainComplete;
  const engineerDone = room.encounter.engineerComplete;
  const complete = seat === "captain" ? captainDone : seat === "engineer" ? engineerDone : false;
  const text = seat ? chapter[`${seat}Directive`] : "Claim a seat to receive your directive.";
  return html`<div class="directive-card ${complete ? "complete" : ""}">
    <p class="eyebrow">role directive</p>
    <strong>${complete ? "Complete — confirm the shared route next." : escapeHtml(text)}</strong>
  </div>`;
}

function taskMarkup(task, role) {
  return html`<div class="task-card" data-task-role="${role}">
    <p class="eyebrow">active assignment</p>
    <h3>${escapeHtml(task.title)}</h3>
    <p><strong>Step:</strong> ${escapeHtml(task.step || task.hint)}</p>
    <p>${escapeHtml(task.hint)}</p>
    <div id="taskMount"></div>
  </div>`;
}

function radioMarkup() {
  return html`<div class="radio-stack"><div class="handset"><span></span><span></span><span></span></div><div class="coil">∿∿∿∿∿</div><div class="radio-unit"><div class="radio-screen"></div><div class="radio-buttons">${Array.from({ length: 8 }, () => "<i></i>").join("")}</div></div></div>`;
}

function breakerMarkup(switches) {
  return html`<div class="breaker-panel"><div class="panel-title">12V DC</div><div class="switch-grid">${switches.map((item) => `<button class="switch ${item.on ? "on" : ""}" data-switch="${item.id}"><span class="red-light ${item.alert && !item.on ? "alert" : ""}"></span><span class="toggle"></span><span class="blank-label"></span></button>`).join("")}</div></div>`;
}

function instrumentMarkup(gauges) {
  return html`<div class="instrument-panel"><div class="meter-row">${blankMeter(gauges.left)}${blankMeter(gauges.center)}</div><div class="gauge-row">${blankGauge(gauges.left)}${blankGauge(gauges.center)}${blankGauge(gauges.right)}</div></div>`;
}

function blankMeter(value) {
  return `<div class="blank-meter"><span style="transform: rotate(${value * 1.2 - 60}deg)"></span></div>`;
}

function blankGauge(value) {
  return `<div class="blank-gauge"><span style="transform: rotate(${value * 1.8 - 90}deg)"></span></div>`;
}

function gpsMarkup() {
  return `<div class="gps-grid">${Array.from({ length: 48 }, (_, index) => `<span class="${index % 7 === 0 ? "route" : ""}"></span>`).join("")}</div>`;
}

function shifterMarkup() {
  return `<div class="shifter"><div class="shifter-slot"></div><div class="shifter-arm"></div><div class="shifter-knob"></div></div>`;
}

function wheelMarkup(wheelId = "wheel-classic") {
  const wheel = modelById("steeringWheels", wheelId);
  return html`<div class="wheel-wrap wheel-skin-${safeClass(wheelId)}" title="${escapeHtml(wheel.name)}"><div class="wheel">${Array.from({ length: 8 }, (_, index) => `<span style="transform: rotate(${index * 45}deg)"></span>`).join("")}<b></b></div><div class="small-gauges">${blankGauge(31)}${blankGauge(74)}</div><div class="equipped-tag">${escapeHtml(wheel.name)}</div></div>`;
}

function playerStationMarkup(role, occupied, active, seatId = "seat-navy", playerModelId = "player-default") {
  const tablets =
    role === "captain"
      ? tabletMarkup("RADIO", "radio") + tabletMarkup("WORDS", "word") + tabletMarkup("RELAY", "signals")
      : tabletMarkup("SORT", "liquid") + tabletMarkup("DOTS", "dots") + tabletMarkup("MATCH", "match");
  const seat = modelById("seats", seatId);
  const playerModel = modelById("players", playerModelId);
  const playerModelStatus = assetStatusFor(playerModel.src);
  return html`<div class="player-station seat-skin-${safeClass(seatId)} ${active ? "active" : ""}" title="${escapeHtml(seat.name)}"><div class="tablet-row">${tablets}</div><div class="seat-card"><div class="seat-back">⚓</div><div><p class="eyebrow">${ROLE_COPY[role].eyebrow}</p><h3>${ROLE_COPY[role].title}</h3><p>${escapeHtml(occupied || "Open")}</p><small>${escapeHtml(seat.name)} · ${escapeHtml(playerModel.name || playerModel.id)}</small></div><div class="player-avatar-badge ${playerModelStatus}">${thumbnailMarkup("players", playerModel, playerModelStatus)}</div></div></div>`;
}

function tabletMarkup(title, visual) {
  const visuals = {
    radio: `<div class="voice-wave"><b></b><b></b><b></b><b></b></div>`,
    word: `<div class="mini-word-grid">${"QWERTYASDFGHZXCV".split("").map((letter) => `<span>${letter}</span>`).join("")}</div>`,
    signals: `<div class="match-preview">${["🚩", "⭐", "🔔", "⚓"].map((icon) => `<span>${icon}</span>`).join("")}</div>`,
    liquid: `<div class="tube-preview"><span></span><span></span><span></span><span></span></div>`,
    dots: `<div class="dot-preview"><i></i><i></i><i></i><i></i></div>`,
    match: `<div class="match-preview"><span>⚓</span><span>🔧</span><span>🧭</span><span>💡</span></div>`,
  };
  return `<div class="tablet"><div class="tablet-title">${title}</div>${visuals[visual] || ""}</div>`;
}

function assetPreviewStripMarkup(room) {
  const equipped = room.cosmetics?.equipped || {};
  const items = [
    ["captain", modelById("players", equipped.captainPlayer || "player-default")],
    ["engineer", modelById("players", equipped.engineerPlayer || "player-default")],
    ["boat", modelById("boats", equipped.boat || "boat-glossy-sloop")],
    ["wheel", modelById("steeringWheels", equipped.steeringWheel || "wheel-classic")],
    ["island", modelById("islands", equipped.island || "island-berry-cove")],
    ["pirate", modelById("pirates", equipped.pirate || "pirate-default")],
  ];
  return `<div class="asset-preview-strip">${items.map(([label, item]) => `<div class="asset-pill ${assetStatusFor(item.src)}"><span>${label}</span><strong>${escapeHtml(item.name || item.id)}</strong></div>`).join("")}</div>`;
}

function manualMarkup(pages) {
  return html`<div class="manual-preview"><h3>Owner's Manual Builder</h3><p>${pages} unlocked page${pages === 1 ? "" : "s"}</p><div class="manual-pages">${MANUAL_SECTIONS.map((section, index) => `<span class="${index < pages ? "unlocked" : ""}">${section}</span>`).join("")}</div></div>`;
}

function statMarkup(name, value, suffix = `${value}%`) {
  return html`<div class="stat"><div class="stat-label"><span>${name}</span><span>${suffix}</span></div><div class="stat-track"><span style="width:${Math.min(100, value)}%"></span></div></div>`;
}

function treasureHuntMarkup(hunt, seat) {
  const guesses = hunt.guesses || [];
  const isCaptain = seat === "captain";
  const isEngineer = seat === "engineer";
  const cells = ["A1","B1","C1","D1","E1","A2","B2","C2","D2","E2","A3","B3","C3","D3","E3","A4","B4","C4","D4","E4","A5","B5","C5","D5","E5"];
  const guessMap = new Map(guesses.map((guess) => [guess.coordinate, guess]));
  const status = hunt.solved ? "Treasure found" : hunt.failed ? "Signal lost" : `${hunt.maxAttempts - hunt.attempts} guesses remaining`;
  const canTap = !hunt.solved && !hunt.failed && (isEngineer || !seat);

  return html`<section class="treasure-panel">
    <div class="treasure-head">
      <p class="eyebrow">active treasure hunt</p>
      <h3>${escapeHtml(hunt.title)}</h3>
      <span>${escapeHtml(status)}</span>
    </div>
    <div class="treasure-role-grid">
      <div class="map-clue-card ${isCaptain ? "spotlight" : "dimmed"}">
        <p class="eyebrow">Captain map clue</p>
        <div class="mini-map-art"><span class="palm">🌴</span><span class="reef">🪸</span><span class="xmark">X</span></div>
        ${isCaptain ? `<p>${escapeHtml(hunt.clue)}</p><div class="clue-strip small">${escapeHtml(hunt.mapNote)}</div>` : `<p>Captain sees the full clue. Ask them to read it aloud.</p>`}
      </div>
      <div class="gps-play-card ${isEngineer ? "spotlight" : ""}">
        <p class="eyebrow">Engineer GPS grid</p>
        <div class="treasure-grid">${cells.map((cell) => {
          const guess = guessMap.get(cell);
          const cls = guess ? (guess.correct ? "correct" : guess.hazard ? "hazard" : "miss") : "";
          return `<button class="${cls}" data-treasure-coordinate="${cell}" ${canTap ? "" : "disabled"}>${cell}</button>`;
        }).join("")}</div>
        <p class="grid-help">${isEngineer ? "Tap the coordinate your partner calls out." : "Engineer taps the coordinate. Solo testing is allowed before a second player joins."}</p>
      </div>
    </div>
    <div class="guess-log">${guesses.length ? guesses.slice(-4).map((guess) => `<span class="${guess.correct ? "correct" : guess.hazard ? "hazard" : "miss"}">${escapeHtml(guess.player)}: ${guess.coordinate}</span>`).join("") : `<span>No guesses yet.</span>`}</div>
    ${hunt.solved ? `<div class="treasure-result success"><strong>Cache opened.</strong><p>${escapeHtml(hunt.reward)}</p><button class="primary-button" data-action="treasure:clear">Collect Treasure</button></div>` : ""}
    ${hunt.failed ? `<div class="treasure-result"><strong>Signal lost.</strong><p>Relaunch the map to try another clue.</p><button class="primary-button" data-action="treasure:start">Relaunch Hunt</button><button class="secondary-button" data-action="treasure:clear">Close</button></div>` : ""}
  </section>`;
}

function assetSummaryMarkup(room) {
  const equipped = room.cosmetics?.equipped || {};
  const loadout = [
    ["Captain", modelById("players", equipped.captainPlayer || "player-default")],
    ["Engineer", modelById("players", equipped.engineerPlayer || "player-default")],
    ["Boat", modelById("boats", equipped.boat || "boat-glossy-sloop")],
    ["Wheel", modelById("steeringWheels", equipped.steeringWheel || "wheel-classic")],
    ["Pirate", modelById("pirates", equipped.pirate || "pirate-default")],
    ["Island", modelById("islands", equipped.island || "island-berry-cove")],
  ];
  return html`<section class="asset-summary">
    <div class="asset-locker-head">
      <p class="eyebrow">synced loadout</p>
      <h3>Voyage Asset Loadout</h3>
      <p>These equipped models drive the voyage scene, cockpit cosmetics, and chapter diorama.</p>
    </div>
    <div class="loadout-grid">${loadout.map(([label, item]) => loadoutPillMarkup(label, item)).join("")}</div>
  </section>`;
}

function loadoutPillMarkup(label, item) {
  const status = assetStatusFor(item.src);
  return `<div class="loadout-pill ${status}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(item.name || item.id)}</strong><small>${statusLabel(status)}</small></div>`;
}

function hangarMarkup(room) {
  const category = HANGAR_CATEGORIES.find((item) => item.key === state.ui.hangarCategory) || HANGAR_CATEGORIES[0];
  const items = modelItems(category.key);
  const selectedId = state.ui.hangarSelection[category.key] || items[0]?.id || "";
  const selected = items.find((item) => item.id === selectedId) || items[0] || { id: "empty", name: "No asset slot", src: "" };
  const status = assetStatusFor(selected.src);
  const cosmetics = room.cosmetics || { unlocked: {}, equipped: {} };
  const unlockedIds = cosmetics.unlocked?.[category.key] || [];
  const isUnlocked = !selected.id || unlockedIds.includes(selected.id);
  const gui = state.assetManifest?.gui || {};
  const minigames = state.assetManifest?.minigames || {};

  return html`<section class="hangar-section toy-gloss" id="assetHangar">
    <div class="hangar-head">
      <div>
        <p class="eyebrow">asset hangar</p>
        <h2>Model Gallery + Equipment Bay</h2>
        <p>Preview real GLB/GLTF assets, verify scene roles, and equip the loadout that powers the voyage diorama.</p>
      </div>
      <label class="local-preview-button">
        <input type="file" id="localModelPreview" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" />
        Preview local GLB/GLTF
      </label>
    </div>
    <div class="hangar-tabs">
      ${HANGAR_CATEGORIES.map((item) => `<button class="hangar-tab ${item.key === category.key ? "active" : ""}" data-hangar-tab="${item.key}"><span>${item.icon}</span>${item.label}</button>`).join("")}
    </div>
    <div class="hangar-grid">
      <div class="hangar-browser">
        <div class="hangar-browser-head">
          <h3>${category.icon} ${category.label}</h3>
          <code>${escapeHtml(category.folder)}</code>
        </div>
        <div class="asset-card-grid">${items.map((item) => hangarCardMarkup(category.key, item, selected.id, unlockedIds, cosmetics.equipped)).join("")}</div>
      </div>
      <div class="hangar-preview-card">
        ${largePreviewMarkup(category.key, selected, status)}
        <div class="asset-detail-panel">
          <p class="eyebrow">selected asset</p>
          <h3>${escapeHtml(selected.name || selected.id)}</h3>
          <p>${assetDescription(category.key, selected, status)}</p>
          <div class="asset-meta-grid">
            <span><strong>ID</strong><code>${escapeHtml(selected.id)}</code></span>
            <span><strong>Status</strong><code>${statusLabel(status)}</code></span>
            <span><strong>Scene role</strong><code>${escapeHtml(selected.sceneRole || selected.slot || category.key)}</code></span>
            <span><strong>Unlock</strong><code>${isUnlocked ? "available" : `manual page ${selected.unlockAtManualPages ?? "?"}`}</code></span>
          </div>
          ${selected.src ? `<div class="path-row"><code>${escapeHtml(selected.src)}</code><button data-copy-path="${escapeHtml(selected.src)}">Copy path</button></div>` : `<div class="path-row"><code>CSS fallback / no model file required</code></div>`}
          <div class="equip-actions">${equipButtonsMarkup(category.key, selected, cosmetics)}</div>
        </div>
      </div>
    </div>
    <details class="asset-intake-panel">
      <summary>Asset readiness + GUI/minigame asset map</summary>
      <div class="readiness-grid">${readinessMarkup()}</div>
      <h4>GUI assets</h4>
      <div class="gui-asset-row">${Object.entries(gui).map(([name, src]) => guiAssetMarkup(name, src)).join("")}</div>
      <h4>Mini-game assets</h4>
      <div class="gui-asset-row">${Object.entries(minigames).map(([name, src]) => guiAssetMarkup(name, src)).join("")}</div>
    </details>
  </section>`;
}

function hangarCardMarkup(category, item, selectedId, unlockedIds, equipped) {
  const status = assetStatusFor(item.src);
  const selected = item.id === selectedId;
  const unlocked = unlockedIds.includes(item.id);
  const equippedMark = equippedStateLabel(category, item.id, equipped);
  return `<button class="hangar-card ${selected ? "selected" : ""} ${unlocked ? "unlocked" : "locked"} ${status}" data-hangar-select="${category}" data-hangar-id="${escapeHtml(item.id)}">
    <span class="hangar-thumb">${thumbnailMarkup(category, item, status)}</span>
    <strong>${escapeHtml(item.name || item.id)}</strong>
    <small>${equippedMark || (unlocked ? statusLabel(status) : `Locked · page ${item.unlockAtManualPages ?? "?"}`)}</small>
  </button>`;
}

function thumbnailMarkup(category, item, status) {
  const thumbReady = item.thumbnail && state.assetStatus[normalizeAssetPath(item.thumbnail)];
  if (thumbReady) return `<img src="${publicAssetPath(item.thumbnail)}" alt="${escapeHtml(item.name)} thumbnail" />`;
  if (item.src && status === "ready") return modelViewerMarkup(item.src, item.name, "thumb");
  return `<span class="fallback-asset-icon">${previewIcon(category, item.id)}</span>`;
}

function largePreviewMarkup(category, item, status) {
  const local = state.ui.localPreview;
  if (local) {
    return `<div class="large-model-preview local"><div class="preview-badge">local preview only</div>${modelViewerMarkup(local.src, local.name, "large", true)}<strong>${escapeHtml(local.name)}</strong><small>This file is previewed from your device and is not uploaded. Copy it into the matching folder to make it part of the hosted game.</small></div>`;
  }
  if (["players", "pirates"].includes(category) && item.src && status === "ready") {
    return `<div class="large-model-preview ready animated-preview"><div class="preview-badge">animated preview</div><div class="character-scene-preview" data-scene-host="hangar-preview" data-scene-mode="preview" data-preview-category="${escapeHtml(category)}" data-preview-asset-id="${escapeHtml(item.id)}"></div><strong>${escapeHtml(item.name)}</strong><small>Character-ready preview using the Three.js runtime with animation fallbacks.</small></div>`;
  }
  if (item.src && status === "ready") {
    return `<div class="large-model-preview ready">${modelViewerMarkup(item.src, item.name, "large")}<strong>${escapeHtml(item.name)}</strong><small>Ready from manifest path</small></div>`;
  }
  return `<div class="large-model-preview fallback"><div class="fallback-turntable"><span>${previewIcon(category, item.id)}</span></div><strong>${escapeHtml(item.name || item.id)}</strong><small>${item.src ? "Model file is not present yet. Drop it into the listed path." : "This slot uses the CSS toy fallback."}</small></div>`;
}

function modelViewerMarkup(src, label, size = "thumb", alreadyPublic = false) {
  const safeSrc = alreadyPublic ? src : publicAssetPath(src);
  return `<model-viewer class="model-viewer-${size}" src="${escapeHtml(safeSrc)}" camera-controls auto-rotate interaction-prompt="none" shadow-intensity="0.65" exposure="1" alt="${escapeHtml(label || "3D model")}"></model-viewer>`;
}

function assetDescription(category, item, status) {
  const folder = HANGAR_CATEGORIES.find((entry) => entry.key === category)?.folder || "assets/models";
  if (!item.src) return "This is a built-in CSS fallback. Add a real model to the manifest to replace it later.";
  if (status === "ready") return `The model file is available and ready for the hosted game. This asset can now appear in the voyage scene and equipped loadout.`;
  if (status === "checking") return `Checking whether the file exists in ${folder}.`;
  return `Expected file is missing. Place the model at ${item.src}, then refresh the page.`;
}

function equipButtonsMarkup(category, item, cosmetics) {
  const unlocked = cosmetics.unlocked?.[category]?.includes(item.id);
  if (!unlocked) return `<button disabled>Locked</button>`;
  if (category === "players") return `<button data-equip-category="players" data-equip-id="${escapeHtml(item.id)}" data-equip-target="captain">Equip Captain</button><button data-equip-category="players" data-equip-id="${escapeHtml(item.id)}" data-equip-target="engineer">Equip Engineer</button>`;
  if (category === "seats") return `<button data-equip-category="seats" data-equip-id="${escapeHtml(item.id)}" data-equip-target="captain">Equip Captain Seat</button><button data-equip-category="seats" data-equip-id="${escapeHtml(item.id)}" data-equip-target="engineer">Equip Engineer Seat</button>`;
  if (category === "steeringWheels") return `<button data-equip-category="steeringWheels" data-equip-id="${escapeHtml(item.id)}" data-equip-target="wheel">Equip Wheel</button>`;
  if (category === "boats") return `<button data-equip-category="boats" data-equip-id="${escapeHtml(item.id)}" data-equip-target="boat">Equip Boat</button>`;
  if (category === "pirates") return `<button data-equip-category="pirates" data-equip-id="${escapeHtml(item.id)}" data-equip-target="pirate">Equip Pirate</button>`;
  if (category === "islands") return `<button data-equip-category="islands" data-equip-id="${escapeHtml(item.id)}" data-equip-target="island">Equip Island</button>`;
  if (category === "environments") return `<button data-equip-category="environments" data-equip-id="${escapeHtml(item.id)}" data-equip-target="environment">Equip Environment</button>`;
  return "";
}

function equippedStateLabel(category, id, equipped = {}) {
  if (category === "players") {
    const labels = [];
    if (equipped.captainPlayer === id) labels.push("Captain");
    if (equipped.engineerPlayer === id) labels.push("Engineer");
    return labels.length ? `Equipped · ${labels.join(" + ")}` : "";
  }
  if (category === "seats") {
    const labels = [];
    if (equipped.captainSeat === id) labels.push("Captain");
    if (equipped.engineerSeat === id) labels.push("Engineer");
    return labels.length ? `Equipped · ${labels.join(" + ")}` : "";
  }
  if (category === "steeringWheels" && equipped.steeringWheel === id) return "Equipped wheel";
  if (category === "boats" && equipped.boat === id) return "Equipped boat";
  if (category === "pirates" && equipped.pirate === id) return "Equipped pirate";
  if (category === "islands" && equipped.island === id) return "Equipped island";
  if (category === "environments" && equipped.environment === id) return "Equipped environment";
  return "";
}

function readinessMarkup() {
  return HANGAR_CATEGORIES.map((entry) => {
    const items = modelItems(entry.key);
    const withFiles = items.filter((item) => item.src).length;
    const ready = items.filter((item) => item.src && assetStatusFor(item.src) === "ready").length;
    const missing = items.filter((item) => item.src && assetStatusFor(item.src) === "missing").length;
    return `<div><strong>${entry.icon} ${entry.label}</strong><span>${ready}/${withFiles} model files ready${missing ? ` · ${missing} missing` : ""}</span><code>${entry.folder}</code></div>`;
  }).join("");
}

function guiAssetMarkup(name, src) {
  const status = assetStatusFor(src);
  return `<span class="${status}">${status === "ready" ? `<img src="/${normalizeAssetPath(src)}" alt="${escapeHtml(name)}" />` : `<b>${previewIcon("gui", name)}</b>`}${escapeHtml(name)}<small>${statusLabel(status)}</small></span>`;
}

function previewIcon(category, id) {
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

function guessCategoryForItem(item) {
  const groups = Object.entries(state.assetManifest.models || {});
  const found = groups.find(([, items]) => items.some((candidate) => candidate.id === item.id));
  return found?.[0] || "players";
}

function handleLocalPreview(file) {
  if (!file) return;
  if (state.ui.localPreview?.url) URL.revokeObjectURL(state.ui.localPreview.url);
  const url = URL.createObjectURL(file);
  state.ui.localPreview = { src: url, url, name: file.name };
  render();
}

function bindGameEvents() {
  document.querySelectorAll("[data-local='leave']").forEach((button) => button.addEventListener("click", leaveRoom));
  document.querySelectorAll("[data-local='tab']").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));
  document.querySelectorAll("[data-local='share-room']").forEach((button) => button.addEventListener("click", shareRoom));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => handleActionButton(button)));
  document.querySelectorAll("[data-switch]").forEach((button) => button.addEventListener("click", () => action("switch:toggle", { id: button.dataset.switch })));
  document.querySelectorAll("[data-equip-category]").forEach((button) => button.addEventListener("click", () => action("cosmetic:equip", { category: button.dataset.equipCategory, id: button.dataset.equipId, target: button.dataset.equipTarget })));
  document.querySelectorAll("[data-hangar-tab]").forEach((button) => button.addEventListener("click", () => {
    state.ui.hangarCategory = button.dataset.hangarTab;
    localStorage.setItem("tcV06HangarCategory", state.ui.hangarCategory);
    state.ui.localPreview = null;
    render();
  }));
  document.querySelectorAll("[data-hangar-select]").forEach((button) => button.addEventListener("click", () => {
    state.ui.hangarCategory = button.dataset.hangarSelect;
    state.ui.hangarSelection[button.dataset.hangarSelect] = button.dataset.hangarId;
    state.ui.localPreview = null;
    render();
  }));
  document.querySelectorAll("[data-copy-path]").forEach((button) => button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyPath);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Copy failed";
    }
  }));
  document.querySelectorAll("[data-treasure-coordinate]").forEach((button) => button.addEventListener("click", () => action("treasure:guess", { coordinate: button.dataset.treasureCoordinate })));
  const fileInput = document.querySelector("#localModelPreview");
  if (fileInput) fileInput.addEventListener("change", (event) => handleLocalPreview(event.target.files?.[0]));
}

function handleActionButton(button) {
  const type = button.dataset.action;
  if (type === "chapter:selectRoute") return action(type, { chapterId: button.dataset.route });
  return action(type);
}

async function shareRoom() {
  if (!state.room) return;
  const url = roomJoinUrl(state.room);
  if (navigator.share) {
    try {
      await navigator.share({ title: "Treasure Crew Room", text: `Join my Treasure Crew room: ${state.room.code}`, url });
      return;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(url);
    state.error = "Join link copied to clipboard.";
    render();
  } catch {
    state.error = "Could not share the room link.";
    render();
  }
}

function completeTask(role, note) {
  action("task:complete", { role, result: { note } });
}

function mountTask(task, role) {
  const mount = document.querySelector("#taskMount");
  if (!mount) return;
  if (task.type === "word-search") return mountWordSearch(mount, task, role);
  if (task.type === "letter-bank") return mountLetterBank(mount, task, role);
  if (task.type === "liquid-sort") return mountLiquidSort(mount, role);
  if (task.type === "connect-dots") return mountConnectDots(mount, role);
  if (task.type === "matching") return mountMatching(mount, role);
  if (task.type === "signal-relay") return mountSignalRelay(mount, task, role);
  if (task.type === "code-select") return mountCodeSelect(mount, task, role);
  if (task.type === "breaker-balance") return mountBreakerBalance(mount, task, role);
  if (task.type === "cargo-sort") return mountCargoSort(mount, role);
  if (task.type === "sequence-repeat") return mountSequenceRepeat(mount, task, role);
}

function mountWordSearch(mount, task, role) {
  const grid = WORD_GRIDS[task.target] || WORD_GRIDS.RADIO;
  const target = task.target.split("");
  let selected = [];
  const draw = () => {
    const current = selected.map((cell) => grid[cell.r][cell.c]).join("");
    mount.innerHTML = html`<div class="target-word">Target: ${task.target}</div><div class="word-grid" style="grid-template-columns: repeat(${grid[0].length}, 1fr)">${grid.map((row, r) => row.map((letter, c) => `<button class="${selected.some((cell) => cell.r === r && cell.c === c) ? "selected" : ""}" data-r="${r}" data-c="${c}">${letter}</button>`).join("")).join("")}</div><div class="answer-strip">${current || "tap letters in order"}</div>`;
    mount.querySelectorAll("[data-r]").forEach((button) => button.addEventListener("click", () => {
      const r = Number(button.dataset.r);
      const c = Number(button.dataset.c);
      const letter = grid[r][c];
      if (letter === target[selected.length]) selected.push({ r, c });
      else selected = [];
      if (selected.map((cell) => grid[cell.r][cell.c]).join("") === task.target) {
        draw();
        setTimeout(() => completeTask(role, `decoded ${task.target}`), 250);
      } else draw();
    }));
  };
  draw();
}

function mountLetterBank(mount, task, role) {
  const letters = task.letters.split("");
  let used = [];
  const draw = () => {
    const answer = used.map((item) => item.letter).join("");
    mount.innerHTML = html`<div class="target-word">Build: ${task.target}</div><div class="answer-strip large">${answer || "_".repeat(task.target.length)}</div><div class="letter-bank">${letters.map((letter, index) => `<button data-letter="${letter}" data-index="${index}" ${used.some((item) => item.index === index) ? "disabled" : ""}>${letter}</button>`).join("")}</div><button class="secondary-button" data-reset>Reset letters</button>`;
    mount.querySelectorAll("[data-letter]").forEach((button) => button.addEventListener("click", () => {
      used.push({ letter: button.dataset.letter, index: Number(button.dataset.index) });
      if (used.map((item) => item.letter).join("") === task.target) {
        draw();
        setTimeout(() => completeTask(role, `built ${task.target}`), 250);
      } else draw();
    }));
    mount.querySelector("[data-reset]").addEventListener("click", () => { used = []; draw(); });
  };
  draw();
}

function mountLiquidSort(mount, role) {
  let tubes = LIQUID_START.map((tube) => [...tube]);
  let selected = null;
  const isSolved = () => tubes.every((tube) => tube.length === 0 || (tube.length === 4 && tube.every((item) => item === tube[0])));
  const draw = () => {
    mount.innerHTML = html`<div class="liquid-game">${tubes.map((tube, index) => `<button class="tube ${selected === index ? "selected" : ""}" data-tube="${index}">${Array.from({ length: 4 }, (_, slot) => `<span class="liquid ${tube[slot] || "empty"}"></span>`).join("")}</button>`).join("")}</div><button class="secondary-button" data-reset>Reset tubes</button>`;
    mount.querySelectorAll("[data-tube]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.tube);
      if (selected === null) {
        if (tubes[index].length) selected = index;
      } else if (selected === index) {
        selected = null;
      } else {
        const source = tubes[selected];
        const destination = tubes[index];
        const color = source[source.length - 1];
        if (color && destination.length < 4 && (!destination.length || destination[destination.length - 1] === color)) destination.push(source.pop());
        selected = null;
      }
      if (isSolved()) {
        draw();
        setTimeout(() => completeTask(role, "fluids balanced"), 300);
      } else draw();
    }));
    mount.querySelector("[data-reset]").addEventListener("click", () => { tubes = LIQUID_START.map((tube) => [...tube]); selected = null; draw(); });
  };
  draw();
}

function mountConnectDots(mount, role) {
  const dots = [{ n: 1, x: 12, y: 62 }, { n: 2, x: 28, y: 22 }, { n: 3, x: 48, y: 72 }, { n: 4, x: 66, y: 28 }, { n: 5, x: 84, y: 58 }];
  let nextDot = 1;
  const draw = () => {
    const points = dots.filter((dot) => dot.n < nextDot).map((dot) => `${dot.x},${dot.y}`).join(" ");
    mount.innerHTML = html`<div class="dots-game"><svg viewBox="0 0 100 100"><polyline points="${points}"></polyline></svg>${dots.map((dot) => `<button class="dot ${dot.n < nextDot ? "complete" : ""}" style="left:${dot.x}%;top:${dot.y}%" data-dot="${dot.n}">${dot.n}</button>`).join("")}</div>`;
    mount.querySelectorAll("[data-dot]").forEach((button) => button.addEventListener("click", () => {
      const dot = Number(button.dataset.dot);
      nextDot = dot === nextDot ? nextDot + 1 : 1;
      if (nextDot > dots.length) {
        draw();
        setTimeout(() => completeTask(role, "circuit path restored"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountMatching(mount, role) {
  const cards = shuffle([...MATCHING_ICONS, ...MATCHING_ICONS].map((icon, index) => ({ icon, id: `${icon}-${index}` })));
  let open = [];
  let matched = [];
  const draw = () => {
    mount.innerHTML = `<div class="matching-game">${cards.map((card, index) => {
      const visible = open.includes(index) || matched.includes(card.id);
      return `<button class="match-card ${visible ? "open" : ""}" data-card="${index}">${visible ? card.icon : "?"}</button>`;
    }).join("")}</div>`;
    mount.querySelectorAll("[data-card]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.card);
      if (open.includes(index) || matched.includes(cards[index].id) || open.length >= 2) return;
      open.push(index);
      draw();
      if (open.length === 2) {
        setTimeout(() => {
          const [a, b] = open;
          if (cards[a].icon === cards[b].icon) matched.push(cards[a].id, cards[b].id);
          open = [];
          if (matched.length === cards.length) {
            draw();
            setTimeout(() => completeTask(role, "parts matched"), 250);
          } else draw();
        }, 400);
      }
    }));
  };
  draw();
}

function mountSignalRelay(mount, task, role) {
  let progress = 0;
  const draw = () => {
    mount.innerHTML = html`<div class="target-word">Repeat: ${task.targetSignals.map((item) => SIGNAL_ICONS[item]).join(" ")}</div><div class="signal-grid">${SIGNAL_SET.map((signal) => `<button data-signal="${signal}" class="${task.targetSignals[progress] === signal ? "suggested" : ""}">${SIGNAL_ICONS[signal]}<span>${signal}</span></button>`).join("")}</div><div class="answer-strip">${progress ? `Correct: ${progress}/${task.targetSignals.length}` : "tap the relay signals in order"}</div>`;
    mount.querySelectorAll("[data-signal]").forEach((button) => button.addEventListener("click", () => {
      const signal = button.dataset.signal;
      if (signal === task.targetSignals[progress]) progress += 1;
      else progress = 0;
      if (progress >= task.targetSignals.length) {
        draw();
        setTimeout(() => completeTask(role, "relayed the signal order"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountCodeSelect(mount, task, role) {
  mount.innerHTML = html`<div class="target-word">${escapeHtml(task.prompt)}</div><div class="choice-grid">${task.options.map((option) => `<button data-choice="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}</div>`;
  mount.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.choice === task.answer) {
      button.classList.add("correct");
      setTimeout(() => completeTask(role, `selected ${task.answer}`), 250);
    } else {
      button.classList.add("wrong");
    }
  }));
}

function mountBreakerBalance(mount, task, role) {
  const active = new Set();
  const target = new Set(task.targetSwitches);
  const allSwitches = ["nav", "fuel", "gps", "defense", "pump", "radio"];
  const solved = () => allSwitches.every((id) => active.has(id) === target.has(id));
  const draw = () => {
    mount.innerHTML = html`<div class="target-word">Activate: ${task.targetSwitches.join(", ")}</div><div class="breaker-balance-grid">${allSwitches.map((item) => `<button data-breaker="${item}" class="${active.has(item) ? "selected" : ""}">${item}</button>`).join("")}</div>`;
    mount.querySelectorAll("[data-breaker]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.breaker;
      if (active.has(id)) active.delete(id);
      else active.add(id);
      if (solved()) {
        draw();
        setTimeout(() => completeTask(role, "balanced the breakers"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountCargoSort(mount, role) {
  const assignments = {};
  const groups = ["fruit", "tools", "treasure"];
  const solved = () => CARGO_ITEMS.every((item) => assignments[item.id] === item.group);
  const draw = () => {
    mount.innerHTML = html`<div class="cargo-grid">${CARGO_ITEMS.map((item) => `<div class="cargo-card"><strong>${item.icon} ${escapeHtml(item.label)}</strong><div class="cargo-choices">${groups.map((group) => `<button data-cargo="${item.id}" data-group="${group}" class="${assignments[item.id] === group ? "selected" : ""}">${group}</button>`).join("")}</div></div>`).join("")}</div>`;
    mount.querySelectorAll("[data-cargo]").forEach((button) => button.addEventListener("click", () => {
      assignments[button.dataset.cargo] = button.dataset.group;
      if (solved()) {
        draw();
        setTimeout(() => completeTask(role, "sorted the cargo hold"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountSequenceRepeat(mount, task, role) {
  let progress = [];
  mount.innerHTML = html`<div class="target-word">Memorize: ${task.sequence.map((item) => PULSE_COLORS[item]).join(" ")}</div><div class="signal-grid">${Object.entries(PULSE_COLORS).map(([color, icon]) => `<button data-pulse="${color}">${icon}<span>${color}</span></button>`).join("")}</div><button class="secondary-button" data-reset>Reset attempt</button>`;
  const update = () => {
    mount.querySelectorAll("[data-pulse]").forEach((button) => button.addEventListener("click", () => {
      progress.push(button.dataset.pulse);
      if (progress.join("|") === task.sequence.join("|")) {
        setTimeout(() => completeTask(role, "repeated the power pulse"), 250);
      } else if (progress.length >= task.sequence.length && progress.join("|") !== task.sequence.join("|")) {
        progress = [];
      }
    }));
    mount.querySelector("[data-reset]").addEventListener("click", () => { progress = []; });
  };
  update();
}

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function timeRemaining(targetTime) {
  const diff = Math.max(0, targetTime - Date.now());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")} left`;
}

if (state.code && state.playerId) connectStream(state.code);
render();
loadAssetManifest();
