import { setHistoryRoom, state } from "./state.js";

let rerender = () => {};

export function configureRoomClient({ render }) {
  rerender = render;
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

export function connectStream(code) {
  if (state.stream) state.stream.close();
  state.stream = new EventSource(`/api/events/${encodeURIComponent(code)}`);
  state.stream.onmessage = (event) => {
    state.room = JSON.parse(event.data);
    state.code = state.room.code;
    localStorage.setItem("tcV1RoomCode", state.code);
    setHistoryRoom(state.code);
    rerender();
  };
  state.stream.onerror = () => {
    state.error = "Live sync is reconnecting. Refresh or rejoin if it stays paused.";
    rerender();
  };
}

export async function createRoom() {
  try {
    state.error = "";
    const data = await api("/api/create", { name: state.name || "Captain" });
    state.room = data.room;
    state.playerId = data.playerId;
    state.code = data.code;
    localStorage.setItem("tcV1PlayerId", state.playerId);
    localStorage.setItem("tcV1RoomCode", state.code);
    setHistoryRoom(state.code);
    connectStream(state.code);
    rerender();
  } catch (error) {
    state.error = error.message;
    rerender();
  }
}

export async function joinRoom() {
  const input = document.querySelector("#joinCode");
  try {
    state.error = "";
    const data = await api("/api/join", { code: input?.value, name: state.name || "Crewmate" });
    state.room = data.room;
    state.playerId = data.playerId;
    state.code = data.code;
    localStorage.setItem("tcV1PlayerId", state.playerId);
    localStorage.setItem("tcV1RoomCode", state.code);
    setHistoryRoom(state.code);
    connectStream(state.code);
    rerender();
  } catch (error) {
    state.error = error.message;
    rerender();
  }
}

export function action(type, payload = {}) {
  if (!state.room) return Promise.resolve();
  return api("/api/action", { code: state.room.code, playerId: state.playerId, type, payload }).catch((error) => {
    state.error = error.message;
    rerender();
  });
}

export function leaveRoom() {
  if (state.stream) state.stream.close();
  state.room = null;
  state.playerId = "";
  state.code = "";
  localStorage.removeItem("tcV1PlayerId");
  localStorage.removeItem("tcV1RoomCode");
  setHistoryRoom("");
  rerender();
}

export function roomJoinUrl(room) {
  return `${location.origin}${room.joinUrl || `/?room=${encodeURIComponent(room.code)}`}`;
}

export function me() {
  return state.room?.players?.[state.playerId] || null;
}

export function mySeat() {
  return me()?.seat || null;
}

export function currentRoleTask(room) {
  const seat = mySeat();
  return seat ? room?.tasks?.[seat] : null;
}

export async function shareRoom() {
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
    rerender();
  } catch {
    state.error = "Could not share the room link.";
    rerender();
  }
}
