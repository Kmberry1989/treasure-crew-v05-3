import { state, sceneRuntime } from "./state.js";

export async function ensureSceneRuntime() {
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

export async function syncSceneRuntime() {
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
      previewSrc: host.dataset.previewSrc || null,
      previewName: host.dataset.previewName || null,
      reducedMotion,
    });
  }
}

export function teardownScenes() {
  if (!sceneRuntime.module) return;
  ["dock", "hero", "preview"].forEach((mode) => sceneRuntime.module.disposeScene(mode));
}
