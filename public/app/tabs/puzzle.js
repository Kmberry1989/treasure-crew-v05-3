import { assetStatusFor, modelById, statusLabel, thumbnailMarkup } from "../assets.js";
import { ROLE_COPY } from "../content.js";
import { escapeHtml, html, safeClass } from "../helpers.js";

const DEFAULTS = {
  captainPlayer: "player-kyle",
  engineerPlayer: "player-rochelle",
  pirate: "pirate-one",
  boat: "boat-pirate-brown",
  island: "island-castleberry-cove",
  steeringWheel: "wheel-classic",
  captainSeat: "seat-navy",
  engineerSeat: "seat-navy",
};

export function renderPuzzleTab(room, seat, captainName, engineerName, task) {
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

function directiveMarkup(room, seat) {
  const chapter = room.currentChapter;
  const captainDone = room.encounter.captainComplete;
  const engineerDone = room.encounter.engineerComplete;
  const complete = seat === "captain" ? captainDone : seat === "engineer" ? engineerDone : false;
  const text = seat ? room.voyage?.active ? room.voyage[`${seat}Directive`] : chapter[`${seat}Directive`] : "Claim a seat to receive your directive.";
  return html`<div class="directive-card ${complete ? "complete" : ""}">
    <p class="eyebrow">role directive</p>
    <strong>${complete ? "Complete — confirm the shared route next." : escapeHtml(text)}</strong>
  </div>`;
}

function puzzleStatusCopy(room, seat) {
  if (!seat) return "Claim Captain or Engineer to receive a role-specific puzzle.";
  if (room.encounter.phase === "briefing") return "The shared briefing is live. Begin the challenge when both players are ready.";
  if (room.encounter.phase === "resolution") return "Your role work is complete. Return to Voyage to confirm the next route together.";
  if (room.encounter.phase === "interlude") return "The chapter is clear. Return to Voyage and resolve the short interlude together.";
  return "This encounter does not currently need an active local puzzle.";
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

function wheelMarkup(wheelId = DEFAULTS.steeringWheel) {
  const wheel = modelById("steeringWheels", wheelId);
  return html`<div class="wheel-wrap wheel-skin-${safeClass(wheelId)}" title="${escapeHtml(wheel.name)}"><div class="wheel">${Array.from({ length: 8 }, (_, index) => `<span style="transform: rotate(${index * 45}deg)"></span>`).join("")}<b></b></div><div class="small-gauges">${blankGauge(31)}${blankGauge(74)}</div><div class="equipped-tag">${escapeHtml(wheel.name)}</div></div>`;
}

function playerStationMarkup(role, occupied, active, seatId = DEFAULTS.captainSeat, playerModelId = DEFAULTS.captainPlayer) {
  const tablets = role === "captain"
    ? tabletMarkup("RADIO", "radio") + tabletMarkup("WORDS", "word") + tabletMarkup("RELAY", "signals")
    : tabletMarkup("SORT", "liquid") + tabletMarkup("DOTS", "dots") + tabletMarkup("MATCH", "match");
  const seat = modelById("seats", seatId || DEFAULTS.captainSeat);
  const playerModel = modelById("players", playerModelId || DEFAULTS.captainPlayer);
  const playerModelStatus = assetStatusFor(playerModel.src);
  return html`<div class="player-station seat-skin-${safeClass(seat.id)} ${active ? "active" : ""}" title="${escapeHtml(seat.name)}"><div class="tablet-row">${tablets}</div><div class="seat-card"><div class="seat-back">⚓</div><div><p class="eyebrow">${ROLE_COPY[role].eyebrow}</p><h3>${ROLE_COPY[role].title}</h3><p>${escapeHtml(occupied || "Open")}</p><small>${escapeHtml(seat.name)} · ${escapeHtml(playerModel.name || playerModel.id)}</small></div><div class="player-avatar-badge ${playerModelStatus}">${thumbnailMarkup("players", playerModel)}</div></div></div>`;
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
    ["captain", modelById("players", equipped.captainPlayer || DEFAULTS.captainPlayer)],
    ["engineer", modelById("players", equipped.engineerPlayer || DEFAULTS.engineerPlayer)],
    ["boat", modelById("boats", equipped.boat || DEFAULTS.boat)],
    ["wheel", modelById("steeringWheels", equipped.steeringWheel || DEFAULTS.steeringWheel)],
    ["island", modelById("islands", equipped.island || DEFAULTS.island)],
    ["pirate", modelById("pirates", equipped.pirate || DEFAULTS.pirate)],
  ];
  return `<div class="asset-preview-strip">${items.map(([label, item]) => `<div class="asset-pill ${assetStatusFor(item.src)}"><span>${label}</span><strong>${escapeHtml(item.name || item.id)}</strong></div>`).join("")}</div>`;
}

function treasureHuntMarkup(hunt, seat) {
  const guesses = hunt.guesses || [];
  const isCaptain = seat === "captain";
  const isEngineer = seat === "engineer";
  const cells = ["A1", "B1", "C1", "D1", "E1", "A2", "B2", "C2", "D2", "E2", "A3", "B3", "C3", "D3", "E3", "A4", "B4", "C4", "D4", "E4", "A5", "B5", "C5", "D5", "E5"];
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
    ["Captain", modelById("players", equipped.captainPlayer || DEFAULTS.captainPlayer)],
    ["Engineer", modelById("players", equipped.engineerPlayer || DEFAULTS.engineerPlayer)],
    ["Boat", modelById("boats", equipped.boat || DEFAULTS.boat)],
    ["Wheel", modelById("steeringWheels", equipped.steeringWheel || DEFAULTS.steeringWheel)],
    ["Pirate", modelById("pirates", equipped.pirate || DEFAULTS.pirate)],
    ["Island", modelById("islands", equipped.island || DEFAULTS.island)],
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
