import crypto from "node:crypto";

import {
  CAPTAIN_TASKS,
  CHAPTERS,
  CHAPTER_LOOKUP,
  COSMETIC_UNLOCKS,
  ENGINEER_TASKS,
  INTERLUDES,
  SWITCHES,
  TREASURE_ROUNDS,
  VOYAGE_SCENES,
} from "./config.js";

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function cleanName(name, fallback = "Crewmate") {
  return String(name || fallback).trim().slice(0, 18) || fallback;
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 5; index += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

function makeLog(text) {
  return { id: crypto.randomUUID(), at: Date.now(), text };
}

export function addLog(room, text) {
  room.log.unshift(makeLog(text));
  room.log = room.log.slice(0, 18);
}

export function chapterById(id) {
  return CHAPTER_LOOKUP[id] || CHAPTERS[0];
}

export function currentChapter(room) {
  return chapterById(room.campaign.currentChapterId);
}

export function chapterSummaries() {
  return CHAPTERS.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    theme: chapter.theme,
    sceneState: chapter.sceneState,
  }));
}

function newPlayer(name, seat = null) {
  return { id: crypto.randomUUID(), name: cleanName(name), seat, score: 0, connectedAt: Date.now() };
}

export function makeCosmeticState() {
  return {
    unlocked: {
      steeringWheels: ["wheel-classic"],
      seats: ["seat-navy"],
      players: ["player-kyle", "player-rochelle"],
      boats: ["boat-pirate-brown"],
      pirates: [],
      islands: [],
      environments: ["env-boat-cockpit"],
      gui: ["coin", "pearl", "gem", "berry", "pirateFlag", "radioWave"],
    },
    equipped: {
      steeringWheel: "wheel-classic",
      captainSeat: "seat-navy",
      engineerSeat: "seat-navy",
      captainPlayer: "player-kyle",
      engineerPlayer: "player-rochelle",
      boat: "boat-pirate-brown",
      pirate: "pirate-one",
      island: "island-castleberry-cove",
      environment: "env-boat-cockpit",
    },
    recentlyUnlocked: [],
  };
}

export function unlockCosmeticsForPage(room, pageNumber) {
  const unlockedNow = [];
  for (const unlock of COSMETIC_UNLOCKS.filter((item) => item.manualPage === pageNumber)) {
    const bucket = room.cosmetics.unlocked[unlock.category];
    if (bucket && !bucket.includes(unlock.id)) {
      bucket.push(unlock.id);
      unlockedNow.push(unlock);
    }
  }
  room.cosmetics.recentlyUnlocked = unlockedNow;
  return unlockedNow;
}

function pickTask(role, used = [], challengeType = "general") {
  const deck = role === "captain" ? CAPTAIN_TASKS : ENGINEER_TASKS;
  const preferred = {
    "launch-sequence": role === "captain" ? ["radio-check", "plot-course", "semaphore-relay"] : ["breaker-balance", "wire-route", "pulse-sequence"],
    "treasure-grid": role === "captain" ? ["treasure-term", "signal-flag", "semaphore-relay"] : ["cargo-sort", "part-match", "fuel-sort"],
    "pirate-defense": role === "captain" ? ["pirate-warning", "signal-flag", "radio-check"] : ["breaker-balance", "cargo-sort", "pulse-sequence"],
    "storm-recovery": role === "captain" ? ["storm-phrase", "plot-course", "signal-flag"] : ["wire-route", "valve-route", "coolant-sort"],
  }[challengeType] || [];
  const boosted = deck.filter((task) => preferred.includes(task.id));
  const source = boosted.length ? boosted : deck;
  const options = source.filter((task) => !used.includes(task.id));
  const pool = options.length ? options : source;
  return { ...pool[Math.floor(Math.random() * pool.length)], nonce: crypto.randomUUID() };
}

function initialScene() {
  return {
    state: "idle-cruise",
    title: VOYAGE_SCENES["idle-cruise"].title,
    subtitle: VOYAGE_SCENES["idle-cruise"].subtitle,
    mood: VOYAGE_SCENES["idle-cruise"].mood,
    callout: VOYAGE_SCENES["idle-cruise"].callout,
    acknowledgedBy: [],
  };
}

function initialCampaign() {
  return {
    started: false,
    chapterOrder: CHAPTERS.map((chapter) => chapter.id),
    currentChapterId: CHAPTERS[0].id,
    chapterIndex: 0,
    encounterIndex: 0,
    unlockedChapters: [CHAPTERS[0].id, CHAPTERS[1].id],
    completedChapterIds: [],
    voyageHistory: [],
  };
}

function initialEncounter() {
  return {
    phase: "lobby",
    challengeType: null,
    difficulty: 1,
    startedAt: null,
    timerEndsAt: null,
    captainComplete: false,
    engineerComplete: false,
    failedAttempts: 0,
    sharedConfirmedBy: [],
    lastFailureAt: null,
  };
}

function initialRoute() {
  return { selected: null, pendingOptions: [CHAPTERS[1].id, CHAPTERS[3].id], prompt: CHAPTERS[0].routeLabel };
}

function initialVoyage() {
  return null;
}

export function applySceneState(room, sceneState) {
  const scene = VOYAGE_SCENES[sceneState] || VOYAGE_SCENES["idle-cruise"];
  room.scene = {
    state: scene.id,
    title: scene.title,
    subtitle: scene.subtitle,
    mood: scene.mood,
    callout: scene.callout,
    acknowledgedBy: [],
  };
}

function animationStateForRoom(room) {
  const phase = room.encounter.phase;
  const sceneState = room.scene.state;
  const bothComplete = room.encounter.captainComplete && room.encounter.engineerComplete;
  const captainOnly = room.encounter.captainComplete && !room.encounter.engineerComplete;
  const engineerOnly = room.encounter.engineerComplete && !room.encounter.captainComplete;

  let captain = "standing-greeting";
  let engineer = "sitting";
  let pirate = sceneState === "pirate-approach" ? "walking" : "hanging-idle";

  if (phase === "challenge") {
    captain = sceneState === "treasure-sighting" ? "sitting-and-pointing" : sceneState === "storm-emergency" ? "telling-a-secret" : "thoughtful-head-shake";
    engineer = sceneState === "storm-emergency" ? "button-pushing" : "seated-idle";
    pirate = sceneState === "pirate-approach" ? "offensive-idle" : pirate;
  }

  if (phase === "resolution" || phase === "interlude") {
    captain = "standing-clap";
    engineer = "sitting-clap";
    pirate = sceneState === "pirate-approach" ? "surprised" : pirate;
  }

  if (captainOnly) engineer = "clapping";
  if (engineerOnly) captain = "clapping";
  if (bothComplete) {
    captain = "standing-clap";
    engineer = "sitting-clap";
  }

  return {
    phase,
    sceneState,
    captain,
    engineer,
    pirate,
    highlightSeat: captainOnly ? "engineer" : engineerOnly ? "captain" : bothComplete ? "both" : room.voyage?.active ? "both" : null,
    celebration: phase === "resolution" && room.encounter.sharedConfirmedBy.includes("captain") && room.encounter.sharedConfirmedBy.includes("engineer"),
    piratePressure: room.stats.piratePressure,
    taskState: {
      captainComplete: room.encounter.captainComplete,
      engineerComplete: room.encounter.engineerComplete,
    },
  };
}

export function sceneSnapshotForRoom(room) {
  const chapter = currentChapter(room);
  const scene = VOYAGE_SCENES[room.scene.state] || VOYAGE_SCENES["idle-cruise"];
  return {
    state: scene.id,
    title: scene.title,
    subtitle: room.voyage?.active ? room.voyage.subtitle : scene.subtitle,
    mood: scene.mood,
    callout: room.voyage?.active ? room.voyage.prompt : scene.callout,
    chapterTitle: room.voyage?.active ? room.voyage.title : chapter.title,
    challengeType: room.encounter.challengeType,
    equipped: { ...room.cosmetics.equipped },
    animationState: animationStateForRoom(room),
  };
}

export function assignEncounterTasks(room) {
  const chapter = currentChapter(room);
  room.tasks = {
    captain: pickTask("captain", room.completed.captain, chapter.challengeType),
    engineer: pickTask("engineer", room.completed.engineer, chapter.challengeType),
  };
}

export function setupChapter(room, chapterId) {
  const chapter = chapterById(chapterId);
  room.campaign.currentChapterId = chapter.id;
  room.campaign.chapterIndex = room.campaign.chapterOrder.indexOf(chapter.id);
  room.campaign.encounterIndex = 0;
  room.encounter = {
    phase: "briefing",
    challengeType: chapter.challengeType,
    difficulty: chapter.difficulty,
    startedAt: Date.now(),
    timerEndsAt: null,
    captainComplete: false,
    engineerComplete: false,
    failedAttempts: 0,
    sharedConfirmedBy: [],
    lastFailureAt: null,
  };
  room.route = {
    selected: null,
    pendingOptions: chapter.routes,
    prompt: chapter.routeLabel,
  };
  room.rewardQueue = [];
  room.reveal = null;
  room.event = null;
  room.voyage = initialVoyage();
  applySceneState(room, chapter.sceneState);
  assignEncounterTasks(room);
  addLog(room, `Chapter ready: ${chapter.title}. ${chapter.briefing}`);
}

export function createVoyageInterlude(room, nextChapterId) {
  const base = INTERLUDES[nextChapterId] || INTERLUDES["treasure-waters"];
  return {
    id: crypto.randomUUID(),
    active: true,
    nextChapterId,
    type: base.type,
    title: base.title,
    subtitle: base.subtitle,
    prompt: base.prompt,
    captainDirective: base.captainDirective,
    engineerDirective: base.engineerDirective,
    options: base.options.map((option) => ({ ...option })),
    target: base.target,
    selections: { captain: null, engineer: null },
    attempts: 0,
    resolvedAt: null,
  };
}

export function applyVoyageScene(room, nextChapterId) {
  const base = INTERLUDES[nextChapterId] || INTERLUDES["treasure-waters"];
  applySceneState(room, base.sceneState);
}

export function makeRoom(rooms, name) {
  let code = randomCode();
  while (rooms.has(code)) code = randomCode();
  const host = newPlayer(name || "Captain", "captain");
  const room = {
    code,
    createdAt: Date.now(),
    clients: new Map(),
    players: { [host.id]: host },
    seats: { captain: host.id, engineer: null },
    campaign: initialCampaign(),
    encounter: initialEncounter(),
    route: initialRoute(),
    rewardQueue: [],
    stats: { hull: 82, power: 70, morale: 76, progress: 0, manualPages: 0, treasure: 0, piratePressure: 0 },
    gauges: { left: 44, center: 62, right: 38 },
    switches: SWITCHES.map((item) => ({ ...item })),
    completed: { captain: [], engineer: [] },
    tasks: { captain: pickTask("captain"), engineer: pickTask("engineer") },
    cosmetics: makeCosmeticState(),
    scene: initialScene(),
    voyage: initialVoyage(),
    treasureHunt: null,
    event: null,
    reveal: null,
    lastSuccess: null,
    log: [makeLog("Room created. Claim seats, inspect the chapter card, then launch the voyage.")],
  };
  rooms.set(code, room);
  return { room, playerId: host.id };
}

export function joinExistingRoom(rooms, code, name) {
  const room = rooms.get(String(code || "").trim().toUpperCase());
  if (!room) return null;
  const seat = room.seats.engineer ? (room.seats.captain ? null : "captain") : "engineer";
  const player = newPlayer(name || "Crewmate", seat);
  room.players[player.id] = player;
  if (seat) room.seats[seat] = player.id;
  addLog(room, `${player.name} joined${seat ? ` as ${seat}` : " as observer"}.`);
  return { room, playerId: player.id };
}

export function startTreasureHuntState(room) {
  const round = TREASURE_ROUNDS[(room.stats.manualPages + room.campaign.voyageHistory.length) % TREASURE_ROUNDS.length];
  room.treasureHunt = {
    ...round,
    active: true,
    solved: false,
    failed: false,
    attempts: 0,
    maxAttempts: 3,
    guesses: [],
    startedAt: Date.now(),
  };
}

export function publicRoom(room) {
  const { clients, ...safe } = room;
  const chapter = currentChapter(room);
  const joinUrl = `/?room=${encodeURIComponent(room.code)}`;
  return {
    ...safe,
    currentChapter: chapter,
    sceneSnapshot: sceneSnapshotForRoom(room),
    routeChoices: room.route.pendingOptions.map((id) => ({
      id,
      title: chapterById(id).title,
      theme: chapterById(id).theme,
      selected: room.route.selected === id,
    })),
    joinUrl,
    chapterSummaries: chapterSummaries(),
  };
}
