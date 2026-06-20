export const app = document.querySelector("#app");

export const state = {
  room: null,
  playerId: localStorage.getItem("tcV1PlayerId") || "",
  code: new URLSearchParams(location.search).get("room") || localStorage.getItem("tcV1RoomCode") || "",
  name: localStorage.getItem("tcCrewName") || "",
  stream: null,
  error: "",
  assetManifest: null,
  assetStatus: {},
  assetScanStarted: false,
  ui: {
    activeTab: localStorage.getItem("tcV1Tab") || "voyage",
    hangarCategory: localStorage.getItem("tcV1HangarCategory") || "players",
    hangarSelection: {},
    localPreview: null,
  },
};

export const sceneRuntime = {
  module: null,
  loading: null,
  enabled: true,
};

export function setName(value) {
  state.name = value;
  localStorage.setItem("tcCrewName", value);
}

export function setActiveTab(tab) {
  state.ui.activeTab = tab;
  localStorage.setItem("tcV1Tab", tab);
}

export function setHistoryRoom(code = "") {
  const next = new URL(location.href);
  if (code) next.searchParams.set("room", code);
  else next.searchParams.delete("room");
  history.replaceState({}, "", next);
}
