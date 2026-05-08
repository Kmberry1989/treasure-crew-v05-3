const app = document.querySelector("#app");

const ROLE_COPY = {
  captain: {
    eyebrow: "Radio + Navigation",
    title: "Captain Seat",
    description: "Call out radio clues, solve word screens, and keep the GPS route readable.",
  },
  engineer: {
    eyebrow: "Maintenance + Repair",
    title: "Engineer Seat",
    description: "Sort fluids, repair circuits, match parts, and keep the boat alive.",
  },
};

const WORD_GRIDS = {
  RADIO: ["R A D I O".split(" "), "W T S E A".split(" "), "P M A P L".split(" "), "C O D E K".split(" "), "B U O Y S".split(" ")],
  ANCHOR: ["A N C H O R".split(" "), "T I D E S X".split(" "), "M A S T S Y".split(" "), "B U O Y S Z".split(" "), "C O V E S Q".split(" "), "R O P E S P".split(" ")],
};

const LIQUID_START = [["sun", "sea", "rose", "sun"], ["sea", "rose", "mint", "mint"], ["rose", "sun", "sea", "mint"], []];
const MATCHING_ICONS = ["⚓", "🧭", "🔧", "💡"];
const MANUAL_SECTIONS = ["Emergency Startup", "Navigation Glossary", "Treasure Protocol", "Pirate Defense", "Storm Calls", "Secret Upgrades"];


const FALLBACK_ASSET_MANIFEST = {
  version: "0.5.3",
  notes: "Drop real GLB/GLTF files into the listed folders, then keep ids stable so unlocks and equipped loadouts remain valid.",
  models: {
    players: [
      { id: "player-default", name: "Default Crew Toy", src: "", thumbnail: "", slot: "crew", status: "css-fallback", scale: 1, rotation: [0, 0, 0] },
      { id: "player-captain", name: "Captain Variant", src: "assets/models/players/player-captain.glb", thumbnail: "assets/thumbnails/players/player-captain.png", slot: "crew", status: "drop-your-model", scale: 1, rotation: [0, 0, 0] },
    ],
    pirates: [
      { id: "pirate-default", name: "Pirate Toy Enemy", src: "assets/models/pirates/pirate-default.glb", thumbnail: "assets/thumbnails/pirates/pirate-default.png", slot: "enemy", status: "drop-your-model", scale: 1, rotation: [0, 0, 0] },
    ],
    boats: [
      { id: "boat-glossy-sloop", name: "Glossy Sloop", src: "assets/models/boats/boat-glossy-sloop.glb", thumbnail: "assets/thumbnails/boats/boat-glossy-sloop.png", slot: "player-boat", status: "drop-your-model", scale: 1, rotation: [0, 0, 0] },
      { id: "boat-pirate-brown", name: "Brown Pirate Ship", src: "assets/models/boats/boat-pirate-brown.glb", thumbnail: "assets/thumbnails/boats/boat-pirate-brown.png", slot: "pirate-boat", status: "drop-your-model", scale: 1, rotation: [0, 0, 0] },
    ],
    islands: [
      { id: "island-berry-cove", name: "Berry Cove Island", src: "assets/models/islands/island-berry-cove.glb", thumbnail: "assets/thumbnails/islands/island-berry-cove.png", slot: "treasure-island", status: "drop-your-model", scale: 1, rotation: [0, 0, 0] },
    ],
    environments: [
      { id: "env-sky-cockpit", name: "Sky Cockpit Environment", src: "assets/models/environments/env-sky-cockpit.glb", thumbnail: "assets/thumbnails/environments/env-sky-cockpit.png", slot: "environment", status: "drop-your-model", scale: 1, rotation: [0, 0, 0] },
    ],
    steeringWheels: [
      { id: "wheel-classic", name: "Classic Toy Wheel", src: "", thumbnail: "", slot: "cockpit-wheel", unlockAtManualPages: 0, status: "css-fallback" },
      { id: "wheel-brass", name: "Royal Brass Wheel", src: "assets/models/steering-wheels/wheel-brass.glb", thumbnail: "assets/thumbnails/steering-wheels/wheel-brass.png", slot: "cockpit-wheel", unlockAtManualPages: 1, status: "drop-your-model" },
      { id: "wheel-pirate", name: "Pirate Bone Wheel", src: "assets/models/steering-wheels/wheel-pirate.glb", thumbnail: "assets/thumbnails/steering-wheels/wheel-pirate.png", slot: "cockpit-wheel", unlockAtManualPages: 3, status: "drop-your-model" },
    ],
    seats: [
      { id: "seat-navy", name: "Navy Captain Chair", src: "", thumbnail: "", slot: "player-seat", unlockAtManualPages: 0, status: "css-fallback" },
      { id: "seat-cream", name: "Cloud Cream Chair", src: "assets/models/seats/seat-cream.glb", thumbnail: "assets/thumbnails/seats/seat-cream.png", slot: "player-seat", unlockAtManualPages: 2, status: "drop-your-model" },
      { id: "seat-pirate", name: "Pirate Red Chair", src: "assets/models/seats/seat-pirate.glb", thumbnail: "assets/thumbnails/seats/seat-pirate.png", slot: "player-seat", unlockAtManualPages: 4, status: "drop-your-model" },
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
  playerId: localStorage.getItem("tcV05PlayerId") || "",
  code: localStorage.getItem("tcV05RoomCode") || "",
  name: localStorage.getItem("tcCrewName") || "",
  stream: null,
  error: "",
  assetManifest: FALLBACK_ASSET_MANIFEST,
  assetStatus: {},
  assetScanStarted: false,
  ui: {
    hangarCategory: localStorage.getItem("tcV05HangarCategory") || "players",
    hangarSelection: {},
    localPreview: null,
  },
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
  };
}

function safeClass(value) {
  return String(value || "default").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

function modelItems(category) {
  return state.assetManifest?.models?.[category] || [];
}

function modelById(category, id) {
  return modelItems(category).find((item) => item.id === id) || { id, name: id, src: "" };
}

function setName(value) {
  state.name = value;
  localStorage.setItem("tcCrewName", value);
}

function connectStream(code) {
  if (state.stream) state.stream.close();
  state.stream = new EventSource(`/api/events/${encodeURIComponent(code)}`);
  state.stream.onmessage = (event) => {
    state.room = JSON.parse(event.data);
    state.code = state.room.code;
    localStorage.setItem("tcV05RoomCode", state.code);
    render();
  };
  state.stream.onerror = () => {
    state.error = "Live sync is reconnecting. Refresh or rejoin if it stays paused.";
  };
}

async function createRoom() {
  try {
    state.error = "";
    const data = await api("/api/create", { name: state.name || "Captain" });
    state.room = data.room;
    state.playerId = data.playerId;
    state.code = data.code;
    localStorage.setItem("tcV05PlayerId", state.playerId);
    localStorage.setItem("tcV05RoomCode", state.code);
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
    localStorage.setItem("tcV05PlayerId", state.playerId);
    localStorage.setItem("tcV05RoomCode", state.code);
    connectStream(state.code);
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

function action(type, payload = {}) {
  if (!state.room || !state.playerId) return;
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
  localStorage.removeItem("tcV05PlayerId");
  localStorage.removeItem("tcV05RoomCode");
  render();
}

function render() {
  if (!state.room) return renderLanding();
  renderGame();
}

function renderLanding() {
  app.innerHTML = html`
    <main class="app-shell sky-scene">
      <section class="landing-card toy-gloss">
        <div class="logo-boat" aria-hidden="true"><div class="mini-mast"></div><div class="mini-sail"></div><div class="mini-hull"></div></div>
        <p class="eyebrow">v0.5.3 3D hangar + asset gallery</p>
        <h1>Treasure Crew Co-op</h1>
        <p>A two-player cockpit puzzle game with a built-in 3D hangar. Drop in your GLB/GLTF player, pirate, boat, island, environment, steering wheel, and seat models, then preview, equip, and sync them across the room.</p>
        <label class="field-label">Crew name<input id="crewName" value="${escapeHtml(state.name)}" placeholder="Rochelle" /></label>
        <div class="landing-actions">
          <button class="primary-button" id="createRoom">Create Room</button>
          <div class="join-row"><input id="joinCode" placeholder="ROOM" maxlength="5" value="${escapeHtml(state.code)}" /><button id="joinRoom">Join</button></div>
        </div>
        <div class="status-pill">Node multiplayer server ready</div>
        ${state.error ? `<p class="error-box">${escapeHtml(state.error)}</p>` : ""}
      </section>
    </main>`;
  const crewNameInput = app.querySelector("#crewName");
  const createRoomButton = app.querySelector("#createRoom");
  const joinRoomButton = app.querySelector("#joinRoom");
  const joinCodeInput = app.querySelector("#joinCode");

  if (!crewNameInput || !createRoomButton || !joinRoomButton || !joinCodeInput) {
    app.insertAdjacentHTML("beforeend", `<div class="mount-warning toy-gloss"><strong>Landing controls did not mount.</strong><br />Refresh once, then check that <code>/app.js</code> and <code>/styles.css</code> are loading from the same v0.5.3 folder.</div>`);
    return;
  }

  crewNameInput.oninput = (event) => setName(event.target.value);
  createRoomButton.onclick = createRoom;
  joinRoomButton.onclick = joinRoom;
  joinCodeInput.oninput = (event) => { event.target.value = event.target.value.toUpperCase(); };
}

function renderGame() {
  const room = state.room;
  const me = room.players[state.playerId];
  const mySeat = me?.seat || null;
  const players = Object.values(room.players || {});
  const activeRole = mySeat || "captain";
  const task = room.tasks[activeRole];
  const stage = room.currentStage;
  const captainName = room.seats.captain ? room.players[room.seats.captain]?.name : "Open";
  const engineerName = room.seats.engineer ? room.players[room.seats.engineer]?.name : "Open";

  app.innerHTML = html`
    <main class="app-shell sky-scene">
      <header class="topbar toy-gloss">
        <div><p class="eyebrow">room code</p><h1>${room.code}</h1></div>
        <div class="crew-list">${players.map((player) => `<span class="crew-chip ${player.id === state.playerId ? "active" : ""}">${escapeHtml(player.name)} · ${player.seat || "observer"}</span>`).join("")}</div>
        <div class="topbar-actions">
          <button data-action="seat:claim" data-seat="captain">Captain</button>
          <button data-action="seat:claim" data-seat="engineer">Engineer</button>
          <button class="accent-button" data-action="seat:swap">Swap seats</button>
          <button data-local="leave">Leave</button>
        </div>
      </header>

      ${missionBannerMarkup(room, mySeat)}

      <section class="game-layout">
        ${cockpitMarkup(room, mySeat, captainName, engineerName)}
        <aside class="role-panel toy-gloss">
          <p class="eyebrow">your touchscreen</p>
          <h2>${mySeat ? ROLE_COPY[mySeat].title : "Observer Mode"}</h2>
          <p>${mySeat ? ROLE_COPY[mySeat].description : "Claim a seat to control this side of the cockpit."}</p>
          ${mySeat ? directiveMarkup(room, mySeat) : `<p class="empty-note">Tap Captain or Engineer in the top bar to join a responsibility set.</p>`}
          ${room.treasureHunt?.active ? treasureHuntMarkup(room.treasureHunt, mySeat) : ""}
          ${mySeat && task && !room.treasureHunt?.active ? taskMarkup(task, activeRole) : ""}
          ${manualMarkup(room.stats.manualPages)}
          ${assetSummaryMarkup(room)}
        </aside>
      </section>

      ${hangarMarkup(room, mySeat)}

      <section class="mission-drawer toy-gloss">
        ${statMarkup("Hull", room.stats.hull)}
        ${statMarkup("Power", room.stats.power)}
        ${statMarkup("Morale", room.stats.morale)}
        ${statMarkup("Manual", Math.min(100, room.stats.manualPages * 18), `${room.stats.manualPages} pages`)}
        ${statMarkup("Treasure", room.stats.treasure)}
      </section>

      <section class="log-card toy-gloss">
        <div class="log-head"><h2>Captain's Log</h2><div class="quick-events"><button data-event="treasure-hunt">Treasure mode</button><button data-event="pirate-approach">Pirate mode</button></div></div>
        ${room.log.map((item) => `<p>${escapeHtml(item.text)}</p>`).join("")}
      </section>

      ${room.lastSuccess ? `<div class="toast-success">${escapeHtml(room.lastSuccess.text)}</div>` : ""}
      ${room.reveal ? revealMarkup(room.reveal) : ""}
      ${room.event ? eventMarkup(room.event) : ""}
    </main>`;

  bindGameEvents();
  if (mySeat && task) mountTask(task, activeRole);
}

function missionBannerMarkup(room, mySeat) {
  const stage = room.currentStage;
  const checklist = room.mission.checklist;
  const roleDirective = mySeat ? stage[mySeat] : "Claim a seat to see your role directive.";
  const started = room.mission.started;
  const stepNumber = room.mission.index + 1;
  return html`
    <section class="mission-banner toy-gloss ${started ? "active" : "waiting"}">
      <div>
        <p class="eyebrow">${started ? `mission ${stepNumber}` : "preflight"}</p>
        <h2>${started ? stage.title : "Start the First Voyage"}</h2>
        <p>${started ? stage.brief : "Claim seats, then begin the guided first 5-minute demo round."}</p>
      </div>
      <div class="mission-checklist">
        <span class="${checklist.captain ? "done" : ""}">Captain task</span>
        <span class="${checklist.engineer ? "done" : ""}">Engineer task</span>
      </div>
      <div class="mission-directive">
        <strong>Your directive</strong>
        <span>${escapeHtml(started ? roleDirective : "Press Start Voyage when both players are ready.")}</span>
      </div>
      <button class="primary-button" data-action="mission:start">${started ? "Restart Voyage" : "Start Voyage"}</button>
    </section>`;
}

function directiveMarkup(room, role) {
  const stage = room.currentStage;
  const complete = room.mission.checklist[role];
  return html`<div class="directive-card ${complete ? "complete" : ""}">
    <p class="eyebrow">current role goal</p>
    <strong>${complete ? "Complete — wait for your partner" : escapeHtml(stage[role])}</strong>
  </div>`;
}

function cockpitMarkup(room, mySeat, captainName, engineerName) {
  return html`
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
        ${playerStationMarkup("captain", captainName, mySeat === "captain", room.cosmetics?.equipped?.captainSeat, room.cosmetics?.equipped?.captainPlayer)}
        ${wheelMarkup(room.cosmetics?.equipped?.steeringWheel)}
        ${playerStationMarkup("engineer", engineerName, mySeat === "engineer", room.cosmetics?.equipped?.engineerSeat, room.cosmetics?.equipped?.engineerPlayer)}
      </div>
      ${assetPreviewStripMarkup(room)}
    </section>`;
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
  const isCaptain = role === "captain";
  const tablets = isCaptain
    ? tabletMarkup("RADIO", "radio") + tabletMarkup("WORDS", "word") + tabletMarkup("BUILD", "letters")
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
    letters: `<div class="letter-bank-preview"><span>B</span><span>O</span><span>A</span><span>T</span></div>`,
    liquid: `<div class="tube-preview"><span></span><span></span><span></span><span></span></div>`,
    dots: `<div class="dot-preview"><i></i><i></i><i></i><i></i></div>`,
    match: `<div class="match-preview"><span>⚓</span><span>🔧</span><span>🧭</span><span>💡</span></div>`,
  };
  return `<div class="tablet"><div class="tablet-title">${title}</div>${visuals[visual] || ""}</div>`;
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

function manualMarkup(pages) {
  return html`<div class="manual-preview"><h3>Owner's Manual Builder</h3><p>${pages} unlocked page${pages === 1 ? "" : "s"}</p><div class="manual-pages">${MANUAL_SECTIONS.map((section, index) => `<span class="${index < pages ? "unlocked" : ""}">${section}</span>`).join("")}</div></div>`;
}

function statMarkup(name, value, suffix = `${value}%`) {
  return html`<div class="stat"><div class="stat-label"><span>${name}</span><span>${suffix}</span></div><div class="stat-track"><span style="width:${value}%"></span></div></div>`;
}

function revealMarkup(reveal) {
  return html`<div class="event-backdrop reveal-layer"><section class="event-card manual-reveal toy-gloss">
    <p class="eyebrow">owner's manual page ${reveal.pageNumber}</p>
    <h2>${escapeHtml(reveal.title)}</h2>
    <p>${escapeHtml(reveal.body)}</p>
    <div class="clue-strip">${escapeHtml(reveal.clue)}</div>
    ${unlockRevealMarkup(reveal.unlocks || [])}
    <button class="primary-button" data-action="reveal:clear">Add to Manual</button>
  </section></div>`;
}

function eventMarkup(event) {
  const treasureButtons = event.id === "treasure-hunt"
    ? `<button class="primary-button" data-action="treasure:start">Launch Treasure Round</button><button class="secondary-button" data-action="event:clear">Not yet</button>`
    : `<button class="primary-button" data-action="event:clear">Back to cockpit</button>`;
  return html`<div class="event-backdrop"><section class="event-card toy-gloss">
    <p class="eyebrow">mode unlocked</p>
    <h2>${escapeHtml(event.title)}</h2>
    <p>${escapeHtml(event.subtitle)}</p>
    <div class="event-visual">${event.icon || "🧭"}</div>
    <div class="event-actions">${treasureButtons}</div>
  </section></div>`;
}

function treasureHuntMarkup(hunt, mySeat) {
  const guesses = hunt.guesses || [];
  const isCaptain = mySeat === "captain";
  const isEngineer = mySeat === "engineer";
  const cells = ["A1","B1","C1","D1","E1","A2","B2","C2","D2","E2","A3","B3","C3","D3","E3","A4","B4","C4","D4","E4","A5","B5","C5","D5","E5"];
  const guessMap = new Map(guesses.map((guess) => [guess.coordinate, guess]));
  const status = hunt.solved ? "Treasure found" : hunt.failed ? "Signal lost" : `${hunt.maxAttempts - hunt.attempts} guesses remaining`;
  const canTap = !hunt.solved && !hunt.failed && (isEngineer || !mySeat);

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
          const disabled = canTap ? "" : "disabled";
          return `<button class="${cls}" data-treasure-coordinate="${cell}" ${disabled}>${cell}</button>`;
        }).join("")}</div>
        <p class="grid-help">${isEngineer ? "Tap the coordinate your partner calls out." : "Engineer taps the coordinate. Solo testing is allowed before a second player joins."}</p>
      </div>
    </div>
    <div class="guess-log">
      ${guesses.length ? guesses.slice(-4).map((guess) => `<span class="${guess.correct ? "correct" : guess.hazard ? "hazard" : "miss"}">${escapeHtml(guess.player)}: ${guess.coordinate}</span>`).join("") : `<span>No guesses yet.</span>`}
    </div>
    ${hunt.solved ? `<div class="treasure-result success"><strong>Cache opened.</strong><p>${escapeHtml(hunt.reward)}</p><button class="primary-button" data-action="treasure:clear">Collect Treasure</button></div>` : ""}
    ${hunt.failed ? `<div class="treasure-result"><strong>Signal lost.</strong><p>Relaunch the map to try another clue.</p><button class="primary-button" data-action="treasure:start">Relaunch Hunt</button><button class="secondary-button" data-action="treasure:clear">Close</button></div>` : ""}
  </section>`;
}


function unlockRevealMarkup(unlocks = []) {
  if (!unlocks.length) return "";
  return `<div class="unlock-reveal"><p class="eyebrow">new cosmetic unlock</p>${unlocks.map((item) => `<span>${escapeHtml(item.name)}</span>`).join("")}</div>`;
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

function assetStatusFor(src) {
  if (!src) return "fallback";
  const key = normalizeAssetPath(src);
  if (!(key in state.assetStatus)) return "checking";
  return state.assetStatus[key] ? "ready" : "missing";
}

function normalizeAssetPath(src) {
  return String(src || "").replace(/^\/+/, "");
}

function publicAssetPath(src) {
  if (!src) return "";
  const clean = normalizeAssetPath(src);
  return `/${clean}`;
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
  await Promise.all(paths.map(async (src) => {
    try {
      const response = await fetch(`/${src}`, { method: "HEAD", cache: "no-store" });
      state.assetStatus[src] = response.ok;
    } catch {
      state.assetStatus[src] = false;
    }
  }));
  render();
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
      <p class="eyebrow">v0.5 loadout</p>
      <h3>3D Asset Loadout</h3>
      <p>Open the hangar below the cockpit to preview, rotate, test local files, and equip real models.</p>
    </div>
    <div class="loadout-grid">${loadout.map(([label, item]) => loadoutPillMarkup(label, item)).join("")}</div>
  </section>`;
}

function loadoutPillMarkup(label, item) {
  const status = assetStatusFor(item.src);
  return `<div class="loadout-pill ${status}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(item.name || item.id)}</strong><small>${statusLabel(status)}</small></div>`;
}

function hangarMarkup(room, mySeat) {
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
        <p class="eyebrow">v0.5 3D hangar</p>
        <h2>Model Gallery + Equipment Bay</h2>
        <p>Preview your real GLB/GLTF assets, verify file paths, equip unlocked cosmetics, and test a local model before copying it into the project.</p>
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
        <div class="asset-card-grid">
          ${items.map((item) => hangarCardMarkup(category.key, item, selected.id, unlockedIds, cosmetics.equipped)).join("")}
        </div>
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
            <span><strong>Slot</strong><code>${escapeHtml(selected.slot || category.key)}</code></span>
            <span><strong>Unlock</strong><code>${isUnlocked ? "available" : `manual page ${selected.unlockAtManualPages ?? "?"}`}</code></span>
          </div>
          ${selected.src ? `<div class="path-row"><code>${escapeHtml(selected.src)}</code><button data-copy-path="${escapeHtml(selected.src)}">Copy path</button></div>` : `<div class="path-row"><code>CSS fallback / no model file required</code></div>`}
          <div class="equip-actions">${equipButtonsMarkup(category.key, selected, cosmetics)}</div>
        </div>
      </div>
    </div>

    <details class="asset-intake-panel">
      <summary>Asset readiness + real GUI/minigame asset map</summary>
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
  if (!item.src) return `This is a built-in CSS fallback. Add a real model to the manifest to replace it later.`;
  if (status === "ready") return `The model file is available and ready for the hosted game. Use the equip buttons to assign it to the live room.`;
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

function statusLabel(status) {
  return { ready: "file ready", missing: "missing file", checking: "checking", fallback: "fallback" }[status] || status;
}

function guiAssetMarkup(name, src) {
  const status = assetStatusFor(src);
  return `<span class="${status}">${status === "ready" ? `<img src="/${normalizeAssetPath(src)}" alt="${escapeHtml(name)}" />` : `<b>${previewIcon("gui", name)}</b>`}${escapeHtml(name)}<small>${statusLabel(status)}</small></span>`;
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

function handleLocalPreview(file) {
  if (!file) return;
  if (state.ui.localPreview?.url) URL.revokeObjectURL(state.ui.localPreview.url);
  const url = URL.createObjectURL(file);
  state.ui.localPreview = { src: url, url, name: file.name };
  render();
}

function bindGameEvents() {
  document.querySelectorAll("[data-action='mission:start']").forEach((button) => button.addEventListener("click", () => action("mission:start")));
  document.querySelectorAll("[data-action='seat:claim']").forEach((button) => button.addEventListener("click", () => action("seat:claim", { seat: button.dataset.seat })));
  document.querySelectorAll("[data-action='seat:swap']").forEach((button) => button.addEventListener("click", () => action("seat:swap")));
  document.querySelectorAll("[data-action='event:clear']").forEach((button) => button.addEventListener("click", () => action("event:clear")));
  document.querySelectorAll("[data-action='reveal:clear']").forEach((button) => button.addEventListener("click", () => action("reveal:clear")));
  document.querySelectorAll("[data-action='treasure:start']").forEach((button) => button.addEventListener("click", () => action("treasure:start")));
  document.querySelectorAll("[data-action='treasure:clear']").forEach((button) => button.addEventListener("click", () => action("treasure:clear")));
  document.querySelectorAll("[data-treasure-coordinate]").forEach((button) => button.addEventListener("click", () => action("treasure:guess", { coordinate: button.dataset.treasureCoordinate })));
  document.querySelectorAll("[data-local='leave']").forEach((button) => button.addEventListener("click", leaveRoom));
  document.querySelectorAll("[data-switch]").forEach((button) => button.addEventListener("click", () => action("switch:toggle", { id: button.dataset.switch })));
  document.querySelectorAll("[data-event]").forEach((button) => button.addEventListener("click", () => action("event:trigger", { id: button.dataset.event })));
  document.querySelectorAll("[data-equip-category]").forEach((button) => button.addEventListener("click", () => action("cosmetic:equip", { category: button.dataset.equipCategory, id: button.dataset.equipId, target: button.dataset.equipTarget })));
  document.querySelectorAll("[data-hangar-tab]").forEach((button) => button.addEventListener("click", () => {
    state.ui.hangarCategory = button.dataset.hangarTab;
    localStorage.setItem("tcV05HangarCategory", state.ui.hangarCategory);
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
  const fileInput = document.querySelector("#localModelPreview");
  if (fileInput) fileInput.addEventListener("change", (event) => handleLocalPreview(event.target.files?.[0]));
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
        setTimeout(() => completeTask(role, `decoded ${task.target}`), 350);
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
        setTimeout(() => completeTask(role, `built ${task.target}`), 350);
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
        setTimeout(() => completeTask(role, "fluids balanced"), 500);
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
        setTimeout(() => completeTask(role, "circuit path restored"), 450);
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
            setTimeout(() => completeTask(role, "parts matched"), 400);
          } else draw();
        }, 500);
      }
    }));
  };
  draw();
}

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

render();
loadAssetManifest();
