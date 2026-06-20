import {
  assetStatusFor,
  HANGAR_CATEGORIES,
  modelItems,
  normalizeAssetPath,
  previewIcon,
  statusLabel,
  thumbnailMarkup,
} from "../assets.js";
import { escapeHtml, html } from "../helpers.js";
import { state } from "../state.js";

export function renderHangarTab(room) {
  return `<section class="hangar-tab-shell">${hangarMarkup(room)}</section>`;
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
    <span class="hangar-thumb">${thumbnailMarkup(category, item)}</span>
    <strong>${escapeHtml(item.name || item.id)}</strong>
    <small>${equippedMark || (unlocked ? statusLabel(status) : `Locked · page ${item.unlockAtManualPages ?? "?"}`)}</small>
  </button>`;
}

function largePreviewMarkup(category, item, status) {
  const local = state.ui.localPreview;
  if (local) {
    return `<div class="large-model-preview ready animated-preview local"><div class="preview-badge">local preview only</div><div class="character-scene-preview" data-scene-host="hangar-preview" data-scene-mode="preview" data-preview-category="${escapeHtml(category)}" data-preview-src="${escapeHtml(local.src)}" data-preview-name="${escapeHtml(local.name)}"></div><strong>${escapeHtml(local.name)}</strong><small>This file is previewed from your device and is not uploaded. Copy it into the matching folder to make it part of the hosted game.</small></div>`;
  }
  if (item.src && status === "ready") {
    const badge = ["players", "pirates"].includes(category) ? "animated preview" : "runtime preview";
    const copy = ["players", "pirates"].includes(category)
      ? "Character-ready preview using the Three.js runtime with animation fallbacks."
      : "Runtime preview using the shared Three.js scene layer so hosted visuals match the live game.";
    return `<div class="large-model-preview ready animated-preview"><div class="preview-badge">${badge}</div><div class="character-scene-preview" data-scene-host="hangar-preview" data-scene-mode="preview" data-preview-category="${escapeHtml(category)}" data-preview-asset-id="${escapeHtml(item.id)}"></div><strong>${escapeHtml(item.name)}</strong><small>${copy}</small></div>`;
  }
  return `<div class="large-model-preview fallback"><div class="fallback-turntable"><span>${previewIcon(category, item.id)}</span></div><strong>${escapeHtml(item.name || item.id)}</strong><small>${item.src ? "Model file is not present yet. Drop it into the listed path." : "This slot uses the CSS toy fallback."}</small></div>`;
}

function assetDescription(category, item, status) {
  const folder = HANGAR_CATEGORIES.find((entry) => entry.key === category)?.folder || "assets/models";
  if (!item.src) return "This is a built-in CSS fallback. Add a real model to the manifest to replace it later.";
  if (status === "ready") return "The model file is available and ready for the hosted game. This asset can now appear in the voyage scene and equipped loadout.";
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
