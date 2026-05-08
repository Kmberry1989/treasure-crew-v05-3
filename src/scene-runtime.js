import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

const loader = new GLTFLoader();
const sceneControllers = new Map();
const assetCache = new Map();
const clock = new THREE.Clock();
const sharedAnimationFrame = { id: 0, running: false };

const SCENE_BACKGROUNDS = {
  "idle-cruise": 0x8fd8ff,
  "treasure-sighting": 0xffd181,
  "pirate-approach": 0x6f7bd7,
  "storm-emergency": 0x406280,
};

const MOOD_TINTS = {
  "clear-sky": 0xffffff,
  "golden-hour": 0xffe0b5,
  pirate: 0xffd0d0,
  storm: 0xc6d7ff,
};

function normalizePublicPath(src) {
  if (!src) return "";
  if (/^(blob:|data:|https?:)/.test(src)) return src;
  return `/${String(src).replace(/^\/+/, "")}`;
}

function safeNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function clipAliases(name) {
  const slug = slugify(name);
  return new Set([slug, slug.replace(/-+/g, ""), slug.replace(/-/g, " ")]);
}

function findMatchingClip(animations, clipName) {
  if (!clipName || !animations?.length) return null;
  const aliases = clipAliases(clipName);
  return animations.find((clip) => {
    const names = clipAliases(clip.name);
    for (const alias of aliases) {
      if (names.has(alias)) return true;
    }
    return false;
  }) || null;
}

function cloneAsset(asset) {
  const root = cloneSkinned(asset.scene);
  const animations = asset.animations || [];
  return { root, animations };
}

async function loadModelAsset(src) {
  const url = normalizePublicPath(src);
  if (!url) return null;
  if (!assetCache.has(url)) {
    assetCache.set(
      url,
      loader
        .loadAsync(url)
        .then((gltf) => ({ scene: gltf.scene, animations: gltf.animations || [] }))
        .catch((error) => {
          console.warn("3D asset failed to load", url, error);
          return null;
        }),
    );
  }
  const asset = await assetCache.get(url);
  return asset ? cloneAsset(asset) : null;
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    group.remove(child);
    disposeObject(child);
  }
}

function disposeObject(object) {
  object.traverse?.((node) => {
    if (node.geometry) node.geometry.dispose?.();
    if (node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) value.dispose?.();
        });
        material.dispose?.();
      });
    }
  });
}

function applyManifestTransform(object, item = {}) {
  const scale = Array.isArray(item.scale)
    ? item.scale
    : [safeNumber(item.scale, 1), safeNumber(item.scale, 1), safeNumber(item.scale, 1)];
  const rotation = Array.isArray(item.rotation) ? item.rotation : [0, 0, 0];
  const position = Array.isArray(item.position) ? item.position : [0, 0, 0];
  object.scale.multiply(new THREE.Vector3(scale[0], scale[1], scale[2]));
  object.rotation.set(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
  object.position.add(new THREE.Vector3(position[0] || 0, position[1] || 0, position[2] || 0));
}

function normalizeAssetRoot(root, targetHeight = 1.5) {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const dominantHeight = size.y || Math.max(size.x, size.z) || 1;
  const scale = targetHeight / dominantHeight;
  root.scale.multiplyScalar(scale);
  root.position.sub(center.multiplyScalar(scale));
  const normalized = new THREE.Box3().setFromObject(root);
  const min = normalized.min;
  if (Number.isFinite(min.y)) root.position.y -= min.y;
}

function makeGroundRing(color = 0xffd85f) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.42, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  return mesh;
}

function makePlaceholder(category, accent = 0xffffff) {
  const group = new THREE.Group();
  const primary = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5, metalness: 0.08 });
  const secondary = new THREE.MeshStandardMaterial({ color: 0xfff7e6, roughness: 0.8 });
  if (category === "boats") {
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.8), primary);
    hull.position.y = 0.35;
    hull.rotation.z = 0.04;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 12), secondary);
    mast.position.set(0, 1.2, 0);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), new THREE.MeshStandardMaterial({ color: 0xfff3cb, side: THREE.DoubleSide }));
    sail.position.set(0.45, 1.25, 0);
    group.add(hull, mast, sail);
  } else if (category === "islands") {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.36, 24), new THREE.MeshStandardMaterial({ color: 0x6dbf60 }));
    base.position.y = 0.2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 10), new THREE.MeshStandardMaterial({ color: 0x8a5c2d }));
    trunk.position.set(-0.1, 0.82, 0);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.9, 7), new THREE.MeshStandardMaterial({ color: 0x2a934f }));
    leaves.position.set(-0.1, 1.58, 0);
    group.add(base, trunk, leaves);
  } else {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 5, 12), primary);
    body.position.y = 0.82;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), secondary);
    head.position.y = 1.72;
    group.add(body, head);
    if (category === "pirates") {
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.16, 18), new THREE.MeshStandardMaterial({ color: 0x23314d }));
      hat.position.y = 1.98;
      group.add(hat);
    }
  }
  return group;
}

function basePositions(mode, layout) {
  if (mode === "dock") {
    return {
      captain: { position: [-1.15, 0, 0.25], rotationY: 0.25, scale: 0.92 },
      engineer: { position: [1.15, 0, -0.15], rotationY: -0.28, scale: 0.92 },
      boat: { position: [0, -0.06, -1.8], rotationY: 0.08, scale: 0.86 },
    };
  }
  if (mode === "preview") {
    return {
      preview: { position: [0, 0, 0], rotationY: -0.18, scale: layout === "compact" ? 1.14 : 1.28 },
    };
  }
  return {
    boat: { position: [0, 0, 0.2], rotationY: 0.1, scale: layout === "compact" ? 1.06 : 1.2 },
    captain: { position: [-1.45, 0, 0.8], rotationY: 0.28, scale: 1.04 },
    engineer: { position: [1.28, 0, 0.95], rotationY: -0.32, scale: 1.02 },
    pirate: { position: [2.75, 0, -1.6], rotationY: -0.9, scale: 1.08 },
    island: { position: [-3.15, 0, -2.3], rotationY: 0.42, scale: 1.14 },
    environment: { position: [0, -0.22, -3.5], rotationY: 0, scale: 1.5 },
  };
}

function roleColor(role) {
  if (role === "captain") return 0xffca5a;
  if (role === "engineer") return 0x6ce6ff;
  if (role === "pirate") return 0xff7d78;
  return 0xffffff;
}

function targetClipForRole(role, animationState = {}, sceneState = "idle-cruise") {
  if (role === "captain") {
    if (animationState.captain) return animationState.captain;
    if (sceneState === "treasure-sighting") return "sitting-and-pointing";
    return "standing-greeting";
  }
  if (role === "engineer") {
    if (animationState.engineer) return animationState.engineer;
    return sceneState === "storm-emergency" ? "button-pushing" : "sitting";
  }
  if (role === "pirate") {
    if (animationState.pirate) return animationState.pirate;
    return sceneState === "pirate-approach" ? "stable-sword-inward-slash" : "hanging-idle";
  }
  return "sitting";
}

class SceneController {
  constructor(mode) {
    this.mode = mode;
    this.container = null;
    this.layout = "default";
    this.room = null;
    this.options = {};
    this.resizeObserver = null;
    this.syncToken = 0;
    this.assetGroups = new Map();
    this.mixers = new Map();
    this.assetState = new Map();
    this.dynamicNodes = [];
    this.renderDisabled = false;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x8fd8ff, 5, 15);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.shadowMap.enabled = false;

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.root.add(this.createAmbientShell());

    const hemi = new THREE.HemisphereLight(0xffffff, 0x2b588a, 1.35);
    hemi.position.set(0, 8, 0);
    const key = new THREE.DirectionalLight(0xfff5dd, 1.2);
    key.position.set(3.2, 4.6, 2.8);
    const fill = new THREE.DirectionalLight(0x97d8ff, 0.45);
    fill.position.set(-4.2, 2.4, -3.5);
    this.scene.add(hemi, key, fill);

    this.cameraTargets = {
      dock: new THREE.Vector3(0, 1.1, 0),
      hero: new THREE.Vector3(0, 0.9, -0.2),
      preview: new THREE.Vector3(0, 1.05, 0),
    };

    this.updateCamera();
  }

  createAmbientShell() {
    const shell = new THREE.Group();
    const ocean = new THREE.Mesh(
      new THREE.CircleGeometry(7.6, 48),
      new THREE.MeshStandardMaterial({ color: 0x3fb1dc, roughness: 0.9, metalness: 0.04, transparent: true, opacity: 0.86 }),
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.02;
    ocean.userData.wave = { speed: 0.8, amplitude: 0.05 };

    const islandShadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 40),
      new THREE.MeshBasicMaterial({ color: 0x123a56, transparent: true, opacity: 0.07 }),
    );
    islandShadow.rotation.x = -Math.PI / 2;
    islandShadow.position.set(-2.2, 0.01, -2.2);

    shell.add(ocean, islandShadow);
    this.dynamicNodes.push(ocean);

    for (let index = 0; index < 5; index += 1) {
      const cloud = new THREE.Group();
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 });
      const puffA = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), material);
      const puffB = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), material);
      const puffC = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), material);
      puffA.position.set(0, 0.05, 0);
      puffB.position.set(0.38, 0.13, 0.05);
      puffC.position.set(-0.36, 0.12, -0.03);
      cloud.add(puffA, puffB, puffC);
      cloud.position.set(-4 + index * 2.1, 3.2 + (index % 2) * 0.32, -5.4 + (index % 3) * 0.35);
      cloud.scale.setScalar(0.8 + index * 0.08);
      cloud.userData.cloudOffset = index * 0.9;
      shell.add(cloud);
      this.dynamicNodes.push(cloud);
    }

    return shell;
  }

  mount(container) {
    if (!container) return;
    if (this.container !== container) {
      this.container = container;
      this.container.replaceChildren(this.renderer.domElement);
      this.observeResize();
    }
    this.updateCamera();
    startSharedLoop();
  }

  observeResize() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
  }

  resize() {
    if (!this.container) return;
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  setLayout(layout) {
    this.layout = layout || "default";
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.layout === "compact" ? 1.35 : 1.8));
    this.updateCamera();
    this.resize();
  }

  updateCamera() {
    if (this.mode === "dock") {
      this.camera.position.set(this.layout === "compact" ? 0 : 0.22, 2.3, 5.1);
      this.camera.lookAt(this.cameraTargets.dock);
      return;
    }
    if (this.mode === "preview") {
      this.camera.position.set(0.5, 2.15, this.layout === "compact" ? 4.6 : 4.2);
      this.camera.lookAt(this.cameraTargets.preview);
      return;
    }
    this.camera.position.set(this.layout === "compact" ? 0.3 : 0.9, 2.9, this.layout === "compact" ? 7 : 6.4);
    this.camera.lookAt(this.cameraTargets.hero);
  }

  async updateFromRoom(room, options = {}) {
    this.room = room;
    this.options = options;
    const syncToken = ++this.syncToken;
    const manifest = options.manifest || {};
    const plan = this.buildPlan(room, manifest, options);
    await Promise.all(plan.map((entry) => this.setSlot(entry, syncToken)));
    if (syncToken !== this.syncToken) return;
    this.pruneSlots(plan.map((entry) => entry.slot));
    this.applySceneMood();
  }

  buildPlan(room, manifest, options) {
    const models = manifest.models || {};
    const equipped = room?.sceneSnapshot?.equipped || room?.cosmetics?.equipped || {};
    const sceneState = room?.sceneSnapshot?.state || "idle-cruise";
    const previewCategory = options.previewCategory || "players";
    const previewAssetId = options.previewAssetId || "";
    if (this.mode === "preview") {
      const categoryItems = models[previewCategory] || [];
      const item = categoryItems.find((candidate) => candidate.id === previewAssetId) || categoryItems[0];
      return item ? [{ slot: "preview", category: previewCategory, item, role: previewCategory === "pirates" ? "pirate" : "captain" }] : [];
    }

    const captain = (models.players || []).find((item) => item.id === (equipped.captainPlayer || "player-default"));
    const engineer = (models.players || []).find((item) => item.id === (equipped.engineerPlayer || "player-default"));
    const boat = (models.boats || []).find((item) => item.id === (equipped.boat || "boat-glossy-sloop"));
    const pirate = (models.pirates || []).find((item) => item.id === (equipped.pirate || "pirate-default"));
    const island = (models.islands || []).find((item) => item.id === (equipped.island || "island-berry-cove"));
    const environment = (models.environments || []).find((item) => item.id === (equipped.environment || "env-sky-cockpit"));

    const plan = [];
    if (captain) plan.push({ slot: "captain", category: "players", item: captain, role: "captain" });
    if (engineer) plan.push({ slot: "engineer", category: "players", item: engineer, role: "engineer" });
    if (boat) plan.push({ slot: "boat", category: "boats", item: boat, role: "boat" });
    if (this.mode === "hero" && pirate && (sceneState === "pirate-approach" || room.sceneSnapshot?.mood === "pirate")) {
      plan.push({ slot: "pirate", category: "pirates", item: pirate, role: "pirate" });
    }
    if (this.mode === "hero" && island && (sceneState === "treasure-sighting" || room.currentChapter?.id === "treasure-waters")) {
      plan.push({ slot: "island", category: "islands", item: island, role: "island" });
    }
    if (this.mode === "hero" && environment) {
      plan.push({ slot: "environment", category: "environments", item: environment, role: "environment" });
    }
    return plan;
  }

  async setSlot(entry, syncToken) {
    const key = `${entry.category}:${entry.item?.id || "fallback"}`;
    const current = this.assetState.get(entry.slot);
    if (current?.key === key) {
      current.entry = entry;
      return;
    }

    const group = this.getSlotGroup(entry.slot);
    clearGroup(group);

    const wrapper = new THREE.Group();
    wrapper.userData.entry = entry;
    wrapper.userData.slot = entry.slot;
    wrapper.userData.role = entry.role;
    wrapper.userData.ring = makeGroundRing(roleColor(entry.role));
    wrapper.add(wrapper.userData.ring);

    const loaded = entry.item?.src ? await loadModelAsset(entry.item.src) : null;
    if (syncToken !== this.syncToken) return;

    const assetRoot = loaded?.root || makePlaceholder(entry.category, roleColor(entry.role));
    normalizeAssetRoot(assetRoot, entry.category === "boats" ? 1.5 : entry.category === "islands" ? 1.8 : 1.55);
    applyManifestTransform(assetRoot, entry.item);
    wrapper.add(assetRoot);
    wrapper.userData.assetRoot = assetRoot;

    if (loaded?.animations?.length) {
      const mixer = new THREE.AnimationMixer(assetRoot);
      const clip = findMatchingClip(loaded.animations, entry.item?.defaultIdle) || loaded.animations[0];
      if (clip) {
        mixer.clipAction(clip).reset().play();
        this.mixers.set(entry.slot, { mixer, animations: loaded.animations, currentClip: clip.name });
      }
    }

    group.add(wrapper);
    this.assetState.set(entry.slot, { key, entry, wrapper });
  }

  getSlotGroup(slot) {
    if (!this.assetGroups.has(slot)) {
      const group = new THREE.Group();
      this.assetGroups.set(slot, group);
      this.root.add(group);
    }
    return this.assetGroups.get(slot);
  }

  pruneSlots(activeSlots) {
    for (const [slot, state] of [...this.assetState.entries()]) {
      if (activeSlots.includes(slot)) continue;
      clearGroup(this.getSlotGroup(slot));
      this.assetState.delete(slot);
      this.mixers.delete(slot);
    }
  }

  applySceneMood() {
    const room = this.room;
    const sceneState = room?.sceneSnapshot?.state || "idle-cruise";
    const mood = room?.sceneSnapshot?.mood || "clear-sky";
    const background = SCENE_BACKGROUNDS[sceneState] || SCENE_BACKGROUNDS["idle-cruise"];
    const tint = MOOD_TINTS[mood] || 0xffffff;
    const color = new THREE.Color(background).lerp(new THREE.Color(tint), 0.18);
    this.scene.background = color;
    this.scene.fog.color.copy(color);
  }

  render(delta, elapsed) {
    if (!this.container || document.hidden || !this.room || this.renderDisabled) return;
    const animationState = this.room.sceneSnapshot?.animationState || {};
    const sceneState = this.room.sceneSnapshot?.state || "idle-cruise";
    const transforms = basePositions(this.mode, this.layout);
    const reducedMotion = this.options.reducedMotion;

    for (const cloud of this.dynamicNodes) {
      if (cloud.userData.wave) {
        cloud.position.y = -0.02 + Math.sin(elapsed * cloud.userData.wave.speed) * cloud.userData.wave.amplitude;
      } else if (cloud.userData.cloudOffset !== undefined) {
        cloud.position.x += Math.sin(elapsed * 0.16 + cloud.userData.cloudOffset) * 0.0018;
        cloud.position.y += Math.sin(elapsed * 0.23 + cloud.userData.cloudOffset) * 0.0009;
      }
    }

    for (const [slot, state] of this.assetState) {
      const { wrapper, entry } = state;
      const target = transforms[slot] || transforms.preview || { position: [0, 0, 0], rotationY: 0, scale: 1 };
      wrapper.position.set(target.position[0], target.position[1], target.position[2]);
      wrapper.rotation.y = target.rotationY || 0;
      wrapper.scale.setScalar(target.scale || 1);

      const ring = wrapper.userData.ring;
      if (ring) {
        const active =
          animationState.highlightSeat === entry.role ||
          (entry.role === "pirate" && sceneState === "pirate-approach") ||
          this.mode === "preview";
        ring.visible = active;
        ring.material.opacity = active ? 0.7 : 0.28;
      }

      const assetRoot = wrapper.userData.assetRoot;
      if (!assetRoot) continue;
      const bobStrength = reducedMotion ? 0.02 : entry.category === "boats" ? 0.07 : 0.045;
      const swayStrength = reducedMotion ? 0.02 : entry.category === "boats" ? 0.08 : 0.05;
      const phaseOffset = slot.length * 0.63;
      assetRoot.position.y = (assetRoot.userData.baseY || 0) + Math.sin(elapsed * 1.2 + phaseOffset) * bobStrength;
      assetRoot.rotation.z = Math.sin(elapsed * 0.82 + phaseOffset) * swayStrength * (entry.category === "boats" ? 0.7 : 0.45);

      if (entry.role === "captain" || entry.role === "engineer" || entry.role === "pirate") {
        const targetClip = targetClipForRole(entry.role, animationState, sceneState);
        this.updateMixerClip(slot, targetClip);
        this.applyProceduralCharacterMotion(assetRoot, entry.role, targetClip, elapsed, reducedMotion);
      }
    }

    this.mixers.forEach(({ mixer }) => mixer.update(delta));

    const target = this.cameraTargets[this.mode] || this.cameraTargets.hero;
    if (this.mode === "hero" && !reducedMotion) {
      this.camera.position.x += Math.sin(elapsed * 0.22) * 0.002;
      this.camera.position.y += Math.sin(elapsed * 0.34) * 0.0016;
    }
    this.camera.lookAt(target);
    this.renderer.render(this.scene, this.camera);
  }

  updateMixerClip(slot, desiredClip) {
    const mixerState = this.mixers.get(slot);
    if (!mixerState || mixerState.currentClip === desiredClip) return;
    const clip = findMatchingClip(mixerState.animations, desiredClip);
    if (!clip) return;
    mixerState.mixer.stopAllAction();
    mixerState.mixer.clipAction(clip).reset().play();
    mixerState.currentClip = clip.name;
  }

  applyProceduralCharacterMotion(assetRoot, role, clipName, elapsed, reducedMotion) {
    const lowMotion = reducedMotion ? 0.4 : 1;
    assetRoot.rotation.y = 0;
    if (clipName.includes("greeting") || clipName.includes("warning")) {
      assetRoot.rotation.y = Math.sin(elapsed * 2.1 + role.length) * 0.18 * lowMotion;
      assetRoot.position.x = Math.sin(elapsed * 1.6 + role.length) * 0.05 * lowMotion;
      return;
    }
    if (clipName.includes("point") || clipName.includes("opening")) {
      assetRoot.rotation.z = Math.sin(elapsed * 2.4 + role.length) * 0.09 * lowMotion;
      assetRoot.position.z = Math.sin(elapsed * 1.7 + role.length) * 0.08 * lowMotion;
      return;
    }
    if (clipName.includes("success") || clipName.includes("dance") || clipName.includes("clap") || clipName.includes("jump")) {
      assetRoot.position.y += Math.abs(Math.sin(elapsed * 3.1 + role.length)) * 0.16 * lowMotion;
      assetRoot.rotation.y = Math.sin(elapsed * 2.8 + role.length) * 0.24 * lowMotion;
      return;
    }
    if (clipName.includes("repair") || clipName.includes("button")) {
      assetRoot.rotation.x = Math.sin(elapsed * 2.2 + role.length) * 0.09 * lowMotion;
      assetRoot.position.z += Math.sin(elapsed * 2 + role.length) * 0.06 * lowMotion;
      return;
    }
    if (clipName.includes("sword") || clipName.includes("taunt")) {
      assetRoot.rotation.y = Math.sin(elapsed * 2.6 + role.length) * 0.28 * lowMotion;
      assetRoot.position.x += Math.sin(elapsed * 2.1 + role.length) * 0.08 * lowMotion;
      return;
    }
    if (clipName.includes("surprised") || clipName.includes("stressed")) {
      assetRoot.rotation.z = Math.sin(elapsed * 3.3 + role.length) * 0.11 * lowMotion;
      return;
    }
  }

  dispose() {
    this.resizeObserver?.disconnect();
    this.assetState.forEach((state) => clearGroup(this.getSlotGroup(state.entry.slot)));
    this.assetState.clear();
    this.mixers.clear();
    this.renderer.dispose();
    this.container?.replaceChildren();
    this.container = null;
  }
}

function tick() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;
  sceneControllers.forEach((controller) => controller.render(delta, elapsed));
  if (sceneControllers.size) {
    sharedAnimationFrame.id = requestAnimationFrame(tick);
    sharedAnimationFrame.running = true;
  } else {
    sharedAnimationFrame.running = false;
  }
}

function startSharedLoop() {
  if (sharedAnimationFrame.running) return;
  sharedAnimationFrame.running = true;
  sharedAnimationFrame.id = requestAnimationFrame(tick);
}

export function mountScene(container, mode) {
  if (!container || !mode) return null;
  let controller = sceneControllers.get(mode);
  if (!controller) {
    try {
      controller = new SceneController(mode);
      sceneControllers.set(mode, controller);
    } catch (error) {
      console.error("Failed to initialize scene controller", error);
      return null;
    }
  }
  controller.mount(container);
  return controller;
}

export function updateSceneFromRoom(room, options = {}) {
  const mode = options.mode;
  const controller = mode ? sceneControllers.get(mode) : null;
  if (!controller) return;
  controller.updateFromRoom(room, options);
}

export function setSceneLayout(mode, layoutMode) {
  const controller = sceneControllers.get(mode);
  controller?.setLayout(layoutMode);
}

export function disposeScene(mode) {
  const controller = sceneControllers.get(mode);
  if (!controller) return;
  controller.dispose();
  sceneControllers.delete(mode);
  if (!sceneControllers.size && sharedAnimationFrame.running) {
    cancelAnimationFrame(sharedAnimationFrame.id);
    sharedAnimationFrame.running = false;
  }
}
