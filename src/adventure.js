import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ---------- setup ----------
const container = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd8ff);
scene.fog = new THREE.Fog(0x8fd8ff, 40, 120);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);

const hemi = new THREE.HemisphereLight(0xbfe8ff, 0x8a6f4d, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2d8, 1.6);
sun.position.set(18, 30, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
scene.add(sun);

// ocean
const ocean = new THREE.Mesh(
  new THREE.CircleGeometry(150, 48),
  new THREE.MeshStandardMaterial({ color: 0x2a9dc4, roughness: 0.35, metalness: 0.1 })
);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.6;
ocean.receiveShadow = true;
scene.add(ocean);

const loader = new GLTFLoader();
function loadGLB(path) {
  return new Promise((resolve, reject) => {
    loader.load(path, (gltf) => resolve(gltf), undefined, reject);
  });
}

// ---------- game state ----------
const game = {
  char: null,
  player: null,
  playerMixer: null,
  walkAction: null,
  idleAction: null,
  target: null,
  speed: 4.2,
  hotspots: [],
  found: JSON.parse(localStorage.getItem("tc_found") || "[]"),
  raycaster: new THREE.Raycaster(),
  pointer: new THREE.Vector2(),
  groundMeshes: [],
};

function toast(msg, ms = 2200) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), ms);
}
function setHud(text) {
  document.getElementById("hudText").textContent = text;
}

// ---------- world building ----------
async function buildWorld() {
  // island
  try {
    const island = await loadGLB("/assets/models/islands/island-castleberry-cove.glb");
    island.scene.traverse((o) => {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; game.groundMeshes.push(o); }
    });
    // normalize scale: fit island to ~36 units wide
    const box = new THREE.Box3().setFromObject(island.scene);
    const size = box.getSize(new THREE.Vector3());
    const s = 36 / Math.max(size.x, size.z);
    island.scene.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(island.scene);
    island.scene.position.y = -box2.min.y + 0.2;
    scene.add(island.scene);
  } catch (e) {
    console.warn("island failed, using fallback disc", e);
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 20, 3, 32),
      new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 0.9 })
    );
    disc.position.y = -1.2;
    disc.receiveShadow = true;
    scene.add(disc);
    game.groundMeshes.push(disc);
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(17.5, 32),
      new THREE.MeshStandardMaterial({ color: 0x7cc46a, roughness: 0.9 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.32;
    grass.receiveShadow = true;
    scene.add(grass);
    game.groundMeshes.push(grass);
  }

  // treasure chest hotspot
  try {
    const chest = await loadGLB("/assets/models/items/treasure_chest.glb");
    chest.scene.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const cb = new THREE.Box3().setFromObject(chest.scene);
    const cs = 1.6 / Math.max(cb.getSize(new THREE.Vector3()).x, 0.001);
    chest.scene.scale.setScalar(cs);
    chest.scene.position.set(7, 0.6, 4);
    scene.add(chest.scene);
    addHotspot(chest.scene, "chest", "Treasure Chest", () => openPuzzle("shell"));
    addSparkle(chest.scene.position, 0xffd23f);
  } catch (e) { console.warn("chest failed", e); }

  // pirate hotspot (friendly)
  try {
    const pirate = await loadGLB("/assets/models/pirates/pirate_1.glb");
    pirate.scene.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const pb = new THREE.Box3().setFromObject(pirate.scene);
    const ps = 2.2 / (pb.getSize(new THREE.Vector3()).y || 1);
    pirate.scene.scale.setScalar(ps);
    pirate.scene.position.set(-6, 0.4, -3);
    pirate.scene.rotation.y = 0.7;
    scene.add(pirate.scene);
    addHotspot(pirate.scene, "pirate", "Old Salt Pete", () => openPuzzle("scramble"));
    addSparkle(pirate.scene.position, 0x7fd4ff);
  } catch (e) { console.warn("pirate failed", e); }

  // boat hotspot
  try {
    const boat = await loadGLB("/assets/models/boats/boat_pirate.glb");
    boat.scene.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const bb = new THREE.Box3().setFromObject(boat.scene);
    const bs = 5 / Math.max(bb.getSize(new THREE.Vector3()).x, 0.001);
    boat.scene.scale.setScalar(bs);
    boat.scene.position.set(-2, -0.4, 14);
    boat.scene.rotation.y = -0.4;
    scene.add(boat.scene);
    // gentle bobbing
    game.boat = boat.scene;
    addHotspot(boat.scene, "boat", "The Sloop", () => {
      toast("⛵ The sloop isn't ready to sail yet…");
    });
  } catch (e) { console.warn("boat failed", e); }
}

function addHotspot(obj, id, label, onTap) {
  // invisible larger hit-sphere for easy tapping
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(size * 0.7, 1.6), 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.copy(center);
  hit.userData.hotspot = { id, label, onTap };
  scene.add(hit);
  game.hotspots.push(hit);
}

function addSparkle(pos, color) {
  const geo = new THREE.BufferGeometry();
  const n = 24;
  const positions = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    positions[i * 3] = pos.x + (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = pos.y + Math.random() * 2.5 + 0.5;
    positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 3;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color, size: 0.28, transparent: true, opacity: 0.9 });
  const pts = new THREE.Points(geo, mat);
  pts.userData.sparkle = { base: positions.slice(), t: Math.random() * 10 };
  scene.add(pts);
  game.sparkles = game.sparkles || [];
  game.sparkles.push(pts);
}

// ---------- player ----------
async function spawnPlayer(charKey) {
  const path = charKey === "vickie"
    ? "/assets/models/players/player_vickie.glb"
    : "/assets/models/players/player_kyle.glb";
  const gltf = await loadGLB(path);
  const root = gltf.scene;
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const box = new THREE.Box3().setFromObject(root);
  const h = box.getSize(new THREE.Vector3()).y || 1;
  root.scale.setScalar(2.4 / h);
  root.position.set(0, 0.4, 8);
  scene.add(root);
  game.player = root;

  if (gltf.animations && gltf.animations.length) {
    game.playerMixer = new THREE.AnimationMixer(root);
    const walk = gltf.animations.find((c) => /walk/i.test(c.name));
    const idle = gltf.animations.find((c) => /idle/i.test(c.name)) || gltf.animations[0];
    if (walk) game.walkAction = game.playerMixer.clipAction(walk);
    if (idle) {
      game.idleAction = game.playerMixer.clipAction(idle);
      game.idleAction.play();
    }
  }
  setHud(`${charKey === "vickie" ? "Mom" : "Kyle"} · tap to walk`);
}

// ---------- tap to move ----------
const tapMarker = document.getElementById("tapMarker");
let downPos = null, downTime = 0;

renderer.domElement.addEventListener("pointerdown", (e) => {
  downPos = { x: e.clientX, y: e.clientY };
  downTime = performance.now();
});
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!downPos) return;
  const dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
  const dt = performance.now() - downTime;
  downPos = null;
  if (Math.hypot(dx, dy) > 12 || dt > 600) return; // it was a drag, not a tap
  handleTap(e.clientX, e.clientY);
});

function handleTap(x, y) {
  if (!game.player) return;
  game.pointer.x = (x / window.innerWidth) * 2 - 1;
  game.pointer.y = -(y / window.innerHeight) * 2 + 1;
  game.raycaster.setFromCamera(game.pointer, camera);

  // hotspots first
  const hits = game.raycaster.intersectObjects(game.hotspots, false);
  if (hits.length) {
    const hs = hits[0].object.userData.hotspot;
    // walk close, then trigger
    const target = hits[0].object.position.clone();
    game.target = { point: target, arriveRadius: 3.2, then: hs.onTap, label: hs.label };
    showTapMarker(x, y);
    return;
  }
  // ground
  const g = game.raycaster.intersectObjects(game.groundMeshes, false);
  if (g.length) {
    game.target = { point: g[0].point.clone(), arriveRadius: 0.4, then: null };
    showTapMarker(x, y);
  }
}

function showTapMarker(x, y) {
  tapMarker.style.display = "block";
  tapMarker.style.left = x + "px";
  tapMarker.style.top = y + "px";
  tapMarker.style.animation = "none";
  void tapMarker.offsetWidth;
  tapMarker.style.animation = "";
  clearTimeout(tapMarker._t);
  tapMarker._t = setTimeout(() => (tapMarker.style.display = "none"), 650);
}

// ---------- puzzles ----------
const puzzles = {
  shell: {
    title: "🦪 Shell Game",
    sub: "The chest rattles… which shell hides the pearl? No rush, just tap.",
    build(body, done) {
      const pearls = ["🦪", "🦪", "🦪"];
      const idx = Math.floor(Math.random() * 3);
      const msg = document.createElement("div");
      msg.id = "shellMsg";
      msg.textContent = "Pick a shell!";
      const row = document.createElement("div");
      row.id = "shellRow";
      pearls.forEach((s, i) => {
        const b = document.createElement("div");
        b.className = "shell";
        b.textContent = "🐚";
        b.onclick = () => {
          if (i === idx) {
            b.textContent = "🦪";
            msg.textContent = "🎉 You found the pearl!";
            msg.style.color = "#2a7a2a";
            done("pearl");
          } else {
            b.textContent = "❌";
            b.style.opacity = ".4";
            b.onclick = null;
            msg.textContent = "Not this one — try another!";
          }
        };
        row.appendChild(b);
      });
      body.append(row, msg);
    },
  },
  scramble: {
    title: "🗺️ Unscramble",
    sub: "Old Salt Pete found a word on his map. Can you unscramble it?",
    build(body, done) {
      const words = [["TREASURE", "RTAEESRU"], ["PIRATE", "RTAIEP"], ["ISLAND", "NDISLA"], ["COMPASS", "SAMPSCO"]];
      const [word, scrambled] = words[Math.floor(Math.random() * words.length)];
      const w = document.createElement("div");
      w.id = "scrambleWord";
      w.textContent = scrambled.split("").join(" ");
      const input = document.createElement("input");
      input.id = "scrambleInput";
      input.maxLength = word.length;
      input.autocomplete = "off";
      const msg = document.createElement("div");
      msg.id = "scrambleMsg";
      const btn = document.createElement("button");
      btn.className = "puzzle-close";
      btn.textContent = "Check";
      btn.style.marginTop = "12px";
      btn.onclick = () => {
        if (input.value.trim().toUpperCase() === word) {
          msg.textContent = "🎉 That's it! " + word;
          msg.style.color = "#2a7a2a";
          done("map-piece");
        } else {
          msg.textContent = "Not quite — try again!";
          msg.style.color = "#a33";
        }
      };
      body.append(w, input, document.createElement("br"), btn, msg);
      setTimeout(() => input.focus(), 300);
    },
  },
  match: {
    title: "🐠 Memory Match",
    sub: "Match the sea pairs. Take your time!",
    build(body, done) {
      const icons = ["🐠", "🐙", "🦀", "⚓", "🐠", "🐙", "🦀", "⚓"];
      icons.sort(() => Math.random() - 0.5);
      const grid = document.createElement("div");
      grid.id = "matchGrid";
      let first = null, lock = false, matched = 0;
      icons.forEach((icon) => {
        const c = document.createElement("div");
        c.className = "match-card";
        c.dataset.icon = icon;
        c.onclick = () => {
          if (lock || c.classList.contains("open") || c.classList.contains("done")) return;
          c.classList.add("open");
          c.textContent = icon;
          if (!first) { first = c; return; }
          if (first.dataset.icon === icon) {
            first.classList.add("done");
            c.classList.add("done");
            first = null;
            if (++matched === 4) { toast("🎉 All matched!"); done("starfish"); }
          } else {
            lock = true;
            const a = first; first = null;
            setTimeout(() => { a.classList.remove("open"); a.textContent = ""; c.classList.remove("open"); c.textContent = ""; lock = false; }, 900);
          }
        };
        grid.appendChild(c);
      });
      body.appendChild(grid);
    },
  },
};

const puzzleOrder = ["shell", "scramble", "match"];
function openPuzzle(kind) {
  // cycle: if the requested kind is done, offer the next unfinished one
  let key = kind;
  if (game.found.includes(key + ":done")) {
    key = puzzleOrder.find((k) => !game.found.includes(k + ":done")) || kind;
  }
  const p = puzzles[key];
  document.getElementById("puzzleTitle").textContent = p.title;
  document.getElementById("puzzleSub").textContent = p.sub;
  const body = document.getElementById("puzzleBody");
  body.innerHTML = "";
  document.getElementById("puzzleOverlay").classList.remove("hidden");
  p.build(body, (reward) => {
    if (!game.found.includes(key + ":done")) {
      game.found.push(key + ":done");
      localStorage.setItem("tc_found", JSON.stringify(game.found));
    }
    toast(`✨ Found: ${reward}! (${game.found.length}/3)`);
    if (game.found.length >= 3) setTimeout(() => toast("🏆 All treasures found! Amazing!"), 2500);
  });
}
document.getElementById("puzzleClose").onclick = () => {
  document.getElementById("puzzleOverlay").classList.add("hidden");
};

// ---------- character select ----------
document.querySelectorAll(".char-btn").forEach((btn) => {
  btn.onclick = async () => {
    const char = btn.dataset.char;
    document.getElementById("charSelect").classList.add("hidden");
    toast("Loading…");
    try {
      await spawnPlayer(char);
      game.char = char;
      toast(char === "vickie" ? "Ahoy, Mom! Tap to explore 🏝️" : "Ahoy, Captain! Tap to explore 🏝️");
    } catch (e) {
      console.error(e);
      toast("Couldn't load the pirate — try again");
      document.getElementById("charSelect").classList.remove("hidden");
    }
  };
});

// ---------- main loop ----------
const clock = new THREE.Clock();
const camOffset = new THREE.Vector3(0, 11, 13);

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // player movement
  if (game.player && game.target) {
    const p = game.player.position;
    const tp = game.target.point;
    const dx = tp.x - p.x, dz = tp.z - p.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= game.target.arriveRadius) {
      const cb = game.target.then;
      game.target = null;
      if (game.walkAction) game.walkAction.stop();
      if (game.idleAction && !game.idleAction.isRunning()) game.idleAction.play();
      if (cb) setTimeout(cb, 350);
    } else {
      const step = Math.min(game.speed * dt, dist);
      p.x += (dx / dist) * step;
      p.z += (dz / dist) * step;
      // face movement
      game.player.rotation.y = Math.atan2(dx, dz);
      // keep on ground
      p.y = 0.4 + Math.sin(t * 8) * 0.03;
      if (game.walkAction && !game.walkAction.isRunning()) {
        if (game.idleAction) game.idleAction.stop();
        game.walkAction.play();
      }
    }
  }

  // camera follows player
  if (game.player) {
    const target = game.player.position.clone().add(camOffset);
    camera.position.lerp(target, 1 - Math.pow(0.001, dt));
    camera.lookAt(game.player.position.x, 1.2, game.player.position.z);
  } else {
    camera.position.set(0, 14, 20);
    camera.lookAt(0, 1, 0);
  }

  // sparkles float
  if (game.sparkles) {
    for (const s of game.sparkles) {
      s.userData.sparkle.t += dt;
      s.position.y = Math.sin(s.userData.sparkle.t * 1.4) * 0.35;
      s.material.opacity = 0.65 + Math.sin(s.userData.sparkle.t * 2.2) * 0.25;
    }
  }
  // boat bob
  if (game.boat) {
    game.boat.position.y = -0.4 + Math.sin(t * 0.9) * 0.18;
    game.boat.rotation.z = Math.sin(t * 0.7) * 0.03;
  }

  if (game.playerMixer) game.playerMixer.update(dt);
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// boot
buildWorld().then(() => animate()).catch((e) => {
  console.error(e);
  animate();
});
