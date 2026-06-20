import { app, setActiveTab, setName, state } from "./state.js";
import { escapeHtml, html, safeClass } from "./helpers.js";
import { currentRoleTask, createRoom, joinRoom, leaveRoom, me, mySeat, action, shareRoom } from "./room-client.js";
import { handleLocalPreview } from "./assets.js";
import { persistentAvatarStrip, renderVoyageHero, renderVoyageTab } from "./tabs/voyage.js";
import { renderPuzzleTab } from "./tabs/puzzle.js";
import { renderHangarTab } from "./tabs/hangar.js";
import { renderManualTab } from "./tabs/manual.js";
import { teardownScenes, syncSceneRuntime } from "./scene-bridge.js";
import { mountTask } from "./task-widgets.js";

export function render() {
  if (!state.room) {
    teardownScenes();
    renderLanding();
    return;
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
        <p class="eyebrow">v1 co-op voyage adventure</p>
        <h1>Treasure Crew</h1>
        <p>Two players join by room code or QR, claim Captain and Engineer seats, then play through short voyage chapters filled with communication games, word play, sorting, and repair puzzles.</p>
        <label class="field-label">Crew name<input id="crewName" value="${escapeHtml(state.name)}" placeholder="Rochelle" /></label>
        <div class="landing-actions">
          <button class="primary-button" id="createRoom">Create Voyage Room</button>
          <div class="join-row"><input id="joinCode" placeholder="ROOM" maxlength="5" value="${escapeHtml(state.code)}" /><button id="joinRoom">Join Room</button></div>
        </div>
        <div class="landing-meta">
          <span class="status-pill">2-player communication-first co-op</span>
          <span class="status-pill">room code + QR join</span>
          <span class="status-pill">manifest-driven 3D loadout</span>
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

      ${renderVoyageHero(room, chapter)}

      <nav class="voyage-tabs">
        ${tabButton("voyage", "Voyage")}
        ${tabButton("puzzle", "Puzzle")}
        ${tabButton("hangar", "Hangar")}
        ${tabButton("manual", "Manual")}
      </nav>

      ${persistentAvatarStrip(room)}

      ${activeTab === "voyage" ? renderVoyageTab(room, seat, chapter) : ""}
      ${activeTab === "puzzle" ? renderPuzzleTab(room, seat, captainName, engineerName, task) : ""}
      ${activeTab === "hangar" ? renderHangarTab(room) : ""}
      ${activeTab === "manual" ? renderManualTab(room) : ""}

      ${state.error ? `<div class="toast-inline error-box">${escapeHtml(state.error)}</div>` : ""}
      ${room.lastSuccess ? `<div class="toast-success">${escapeHtml(room.lastSuccess.text)}</div>` : ""}
    </main>`;

  bindGameEvents();
  if (task && activeTab === "puzzle" && room.encounter.phase === "challenge" && seat) mountTask(task, seat, completeTask);
  syncSceneRuntime();
}

function tabButton(id, label) {
  return `<button class="voyage-tab ${state.ui.activeTab === id ? "active" : ""}" data-local="tab" data-tab="${id}">${label}</button>`;
}

function bindGameEvents() {
  document.querySelectorAll("[data-local='leave']").forEach((button) => button.addEventListener("click", leaveRoom));
  document.querySelectorAll("[data-local='tab']").forEach((button) => button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
    render();
  }));
  document.querySelectorAll("[data-local='share-room']").forEach((button) => button.addEventListener("click", shareRoom));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => handleActionButton(button)));
  document.querySelectorAll("[data-switch]").forEach((button) => button.addEventListener("click", () => action("switch:toggle", { id: button.dataset.switch })));
  document.querySelectorAll("[data-equip-category]").forEach((button) => button.addEventListener("click", () => action("cosmetic:equip", { category: button.dataset.equipCategory, id: button.dataset.equipId, target: button.dataset.equipTarget })));
  document.querySelectorAll("[data-hangar-tab]").forEach((button) => button.addEventListener("click", () => {
    state.ui.hangarCategory = button.dataset.hangarTab;
    localStorage.setItem("tcV1HangarCategory", state.ui.hangarCategory);
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
  if (type === "voyage:selectWaypoint" || type === "voyage:confirmWaypoint") return action(type, { nodeId: button.dataset.choiceId });
  if (type === "voyage:choosePort") return action(type, { portId: button.dataset.choiceId });
  if (type === "voyage:resolveHazard") return action(type, { optionId: button.dataset.choiceId });
  if (type === "seat:claim") return action(type, { seat: button.dataset.seat });
  return action(type);
}

function completeTask(role, note) {
  action("task:complete", { role, result: { note } });
}
