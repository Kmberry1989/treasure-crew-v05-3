import { assetStatusFor, guessCategoryForItem, modelById, thumbnailMarkup } from "../assets.js";
import { ROLE_COPY } from "../content.js";
import { escapeHtml, html, safeClass, timeRemaining } from "../helpers.js";
import { roomJoinUrl } from "../room-client.js";

const DEFAULTS = {
  captainPlayer: "player-kyle",
  engineerPlayer: "player-rochelle",
  pirate: "pirate-one",
  boat: "boat-pirate-brown",
  island: "island-castleberry-cove",
  environment: "env-boat-cockpit",
  steeringWheel: "wheel-classic",
  captainSeat: "seat-navy",
  engineerSeat: "seat-navy",
};

export function renderVoyageTab(room, seat, chapter) {
  return html`
    <section class="voyage-grid">
      <section class="voyage-scene-card toy-gloss">
        ${voyageSceneMarkup(room)}
      </section>
      <aside class="voyage-sidebar">
        <section class="voyage-panel toy-gloss">
          <p class="eyebrow">${room.voyage?.active ? "voyage interlude" : "shared briefing"}</p>
          <h3>${escapeHtml(room.sceneSnapshot?.title || chapter.title)}</h3>
          <p>${escapeHtml(room.sceneSnapshot?.callout || chapter.briefing)}</p>
          <div class="directive-card ${room.scene.acknowledgedBy?.includes("captain") && room.scene.acknowledgedBy?.includes("engineer") ? "complete" : ""}">
            <strong>${seat ? ROLE_COPY[seat].title : "Observer"}</strong>
            <span>${escapeHtml(activeDirective(room, seat, chapter))}</span>
          </div>
          ${voyageActionPanel(room, seat)}
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

function activeDirective(room, seat, chapter) {
  if (!seat) return "Claim a seat to receive a live directive.";
  if (room.voyage?.active) return room.voyage[`${seat}Directive`] || "Resolve the shared route choice.";
  return chapter[`${seat}Directive`];
}

function voyageSceneMarkup(room) {
  const equipped = room.sceneSnapshot?.equipped || {};
  const entries = [
    ["Boat", modelById("boats", equipped.boat || DEFAULTS.boat)],
    ["Captain", modelById("players", equipped.captainPlayer || DEFAULTS.captainPlayer)],
    ["Engineer", modelById("players", equipped.engineerPlayer || DEFAULTS.engineerPlayer)],
    ["Pirate", modelById("pirates", equipped.pirate || DEFAULTS.pirate)],
    ["Island", modelById("islands", equipped.island || DEFAULTS.island)],
    ["Environment", modelById("environments", equipped.environment || DEFAULTS.environment)],
  ];
  return html`
    <div class="voyage-scene-head">
      <div>
        <p class="eyebrow">${room.voyage?.active ? "route interlude" : "reactive diorama"}</p>
        <h2>${escapeHtml(room.sceneSnapshot?.chapterTitle || "Voyage Scene")}</h2>
        <p>${escapeHtml(room.sceneSnapshot?.subtitle || "")}</p>
      </div>
      <span class="scene-pill">${escapeHtml(room.sceneSnapshot?.state || "idle-cruise")}</span>
    </div>
    <div class="diorama-stage" data-scene-host="hero-scene" data-scene-mode="hero"></div>
    <div class="diorama-crew-grid">
      ${sceneAssetPill(entries[1][0], entries[1][1])}
      ${sceneAssetPill(entries[2][0], entries[2][1])}
      ${sceneAssetPill("Wheel", modelById("steeringWheels", equipped.steeringWheel || DEFAULTS.steeringWheel))}
      ${sceneAssetPill("Captain Seat", modelById("seats", equipped.captainSeat || DEFAULTS.captainSeat))}
      ${sceneAssetPill("Engineer Seat", modelById("seats", equipped.engineerSeat || DEFAULTS.engineerSeat))}
    </div>`;
}

function sceneAssetPill(label, item) {
  const status = assetStatusFor(item.src);
  return `<div class="scene-asset ${status}">
    <div class="scene-asset-visual">${thumbnailMarkup(guessCategoryForItem(item), item)}</div>
    <strong>${escapeHtml(label)}</strong>
    <small>${escapeHtml(item.name || item.id)}</small>
  </div>`;
}

function voyageActionPanel(room, seat) {
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
  if (room.encounter.phase === "interlude" && room.voyage?.active) {
    return voyageInterludeMarkup(room, seat);
  }
  return html`
    <div class="route-panel">
      <p class="eyebrow">shared route confirmation</p>
      <div class="route-choice-grid">${room.routeChoices.map((choice) => `<button class="${choice.selected ? "selected" : ""}" data-action="chapter:selectRoute" data-route="${choice.id}">${escapeHtml(choice.title)}</button>`).join("")}</div>
      <button class="secondary-button" data-action="scene:acknowledge">${bothConfirmed ? "Shared Callout Confirmed" : "Confirm Shared Callout"}</button>
      <button class="primary-button" data-action="reward:claim" ${bothConfirmed ? "" : "disabled"}>Claim Reward + Open Interlude</button>
    </div>`;
}

function voyageInterludeMarkup(room, seat) {
  const voyage = room.voyage;
  const captainPick = voyage.selections?.captain;
  const engineerPick = voyage.selections?.engineer;
  return html`
    <div class="route-panel voyage-interlude-panel">
      <p class="eyebrow">${escapeHtml(voyage.type)}</p>
      <h4>${escapeHtml(voyage.title)}</h4>
      <p>${escapeHtml(voyage.prompt)}</p>
      <div class="interlude-selection-strip">
        <span>Captain: <strong>${escapeHtml(captainPick || "pending")}</strong></span>
        <span>Engineer: <strong>${escapeHtml(engineerPick || "pending")}</strong></span>
      </div>
      <div class="route-choice-grid">${voyage.options.map((choice) => interludeChoiceButton(voyage, seat, choice, captainPick, engineerPick)).join("")}</div>
      <div class="voyage-callout">
        <strong>${seat ? ROLE_COPY[seat].title : "Observer"}</strong>
        <span>${escapeHtml(activeDirective(room, seat, room.currentChapter))}</span>
      </div>
    </div>`;
}

function interludeChoiceButton(voyage, seat, choice, captainPick, engineerPick) {
  const action = interludeActionType(voyage, seat);
  const selected = captainPick === choice.id || engineerPick === choice.id;
  return `<button class="${selected ? "selected" : ""}" data-action="${action}" data-choice-id="${escapeHtml(choice.id)}" ${action ? "" : "disabled"}><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.note || "")}</small></button>`;
}

function interludeActionType(voyage, seat) {
  if (!seat) return "";
  if (voyage.type === "waypoint") return seat === "captain" ? "voyage:selectWaypoint" : "voyage:confirmWaypoint";
  if (voyage.type === "port") return seat === "captain" ? "voyage:choosePort" : "voyage:confirmWaypoint";
  return "voyage:resolveHazard";
}

function statMarkup(name, value, suffix = `${value}%`) {
  return html`<div class="stat"><div class="stat-label"><span>${name}</span><span>${suffix}</span></div><div class="stat-track"><span style="width:${Math.min(100, value)}%"></span></div></div>`;
}

export function persistentAvatarStrip(room) {
  const anim = room.sceneSnapshot?.animationState || {};
  return html`<section class="avatar-dock-panel toy-gloss">
    <div class="avatar-dock-copy">
      <p class="eyebrow">live crew strip</p>
      <strong>${escapeHtml(room.voyage?.active ? room.voyage.title : room.currentChapter.title)}</strong>
      <span>${escapeHtml(anim.phase || room.encounter.phase)} · ${escapeHtml(anim.highlightSeat || "shared focus")}</span>
    </div>
    <div class="avatar-dock-host" data-scene-host="avatar-dock" data-scene-mode="dock"></div>
  </section>`;
}

export function renderVoyageHero(room, chapter) {
  const title = room.voyage?.active ? room.voyage.title : chapter.title;
  const body = room.voyage?.active ? room.voyage.subtitle : room.encounter.phase === "lobby" ? "Claim seats, inspect the route, and launch the voyage." : chapter.briefing;
  return html`
    <section class="voyage-hero toy-gloss">
      <div>
        <p class="eyebrow">${room.voyage?.active ? "voyage interlude" : `chapter ${room.campaign.chapterIndex + 1} · ${escapeHtml(chapter.theme)}`}</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(body)}</p>
      </div>
      <div class="voyage-status">
        <span>${escapeHtml(room.encounter.phase)}</span>
        <span>${escapeHtml(room.sceneSnapshot?.title || "")}</span>
        <span>${room.encounter.timerEndsAt ? timeRemaining(room.encounter.timerEndsAt) : room.voyage?.active ? "shared route check" : "untimed"}</span>
      </div>
    </section>`;
}
