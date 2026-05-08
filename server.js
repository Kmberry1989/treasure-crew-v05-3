import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3001;

const rooms = new Map();

const CHAPTERS = [
  {
    id: "harbor-launch",
    title: "Harbor Launch",
    theme: "cozy-launch",
    sceneState: "idle-cruise",
    briefing:
      "Warm up the crew. Captain restores the launch checklist while Engineer settles the cockpit systems.",
    captainDirective: "Recover the launch phrase and guide the first route callout.",
    engineerDirective: "Calm the cockpit by restoring order to the opening maintenance puzzle.",
    resolutionTitle: "Harbor Crew Harmony",
    resolutionBody:
      "The launch went smoothly. The crew trusts the shared routine: clue, response, confirm, commit.",
    rewardTreasure: 10,
    routes: ["treasure-waters", "storm-repair"],
    routeLabel: "Choose the first true voyage lane together.",
    timerMs: 150000,
    difficulty: 1,
    challengeType: "launch-sequence",
  },
  {
    id: "treasure-waters",
    title: "Treasure Waters",
    theme: "treasure-map",
    sceneState: "treasure-sighting",
    briefing:
      "A glittering island rises on the horizon. The Captain reads the clue while the Engineer works the grid.",
    captainDirective: "Decode the map phrase and call out the safe treasure path.",
    engineerDirective: "Keep the route tools clear and act on the Captain's clue.",
    resolutionTitle: "Treasure Signal Captured",
    resolutionBody:
      "The crew turns shared clues into action. Treasure is earned by careful listening, not by guessing fast.",
    rewardTreasure: 22,
    routes: ["pirate-intercept", "storm-repair"],
    routeLabel: "Commit to a richer route or take the safer weather lane.",
    timerMs: 165000,
    difficulty: 2,
    challengeType: "treasure-grid",
  },
  {
    id: "pirate-intercept",
    title: "Pirate Intercept",
    theme: "pirate-warning",
    sceneState: "pirate-approach",
    briefing:
      "A toy pirate crew drifts into view. Stay playful but sharp: Captain relays warnings while Engineer stabilizes defenses.",
    captainDirective: "Relay the defense signal before pirate pressure spikes.",
    engineerDirective: "Sort and route the defense systems while listening for the pirate callout.",
    resolutionTitle: "Playful Defense Drill",
    resolutionBody:
      "The pirate chapter proves the loop: one player reads intent, the other executes, then both confirm the next move.",
    rewardTreasure: 18,
    routes: ["storm-repair", "harbor-launch"],
    routeLabel: "Patch up now or loop back for a calmer supply run.",
    timerMs: 170000,
    difficulty: 3,
    challengeType: "pirate-defense",
  },
  {
    id: "storm-repair",
    title: "Storm Repair",
    theme: "storm-emergency",
    sceneState: "storm-emergency",
    briefing:
      "The sea turns rough. Captain keeps the route readable while Engineer reorders a cockpit under pressure.",
    captainDirective: "Recover the warning code and make the crew's route choice readable again.",
    engineerDirective: "Repair fast, then confirm the safe lane with the Captain.",
    resolutionTitle: "Storm Confidence",
    resolutionBody:
      "A soft failure is still a lesson. The boat bends, the crew adapts, and the voyage continues.",
    rewardTreasure: 14,
    routes: ["treasure-waters", "pirate-intercept"],
    routeLabel: "Take the recovered route and continue the voyage.",
    timerMs: 150000,
    difficulty: 2,
    challengeType: "storm-recovery",
  },
];

const CHAPTER_LOOKUP = Object.fromEntries(CHAPTERS.map((chapter) => [chapter.id, chapter]));

const VOYAGE_SCENES = {
  "idle-cruise": {
    id: "idle-cruise",
    title: "Idle Cruise",
    subtitle: "The crew glides into open water and checks every station before committing to the route.",
    mood: "clear-sky",
    callout: "Start with communication, not speed.",
  },
  "treasure-sighting": {
    id: "treasure-sighting",
    title: "Treasure Sighting",
    subtitle: "The island and its treasure clue appear together. One player reads; one player confirms.",
    mood: "gold-haze",
    callout: "Say the clue slowly and verify the grid before acting.",
  },
  "pirate-approach": {
    id: "pirate-approach",
    title: "Pirate Approach",
    subtitle: "Pirate toys drift into range. Keep the tone playful and the callouts exact.",
    mood: "warning-red",
    callout: "Defense works best when both roles repeat the plan.",
  },
  "storm-emergency": {
    id: "storm-emergency",
    title: "Storm Emergency",
    subtitle: "The cockpit shakes. Repair first, confirm second, and keep the route readable.",
    mood: "storm-blue",
    callout: "Soft failure is okay. Recover, confirm, continue.",
  },
};

const TREASURE_ROUNDS = [
  {
    id: "berry-cove",
    title: "Berry Cove Cache",
    target: "B4",
    hazards: ["C3", "D2"],
    clue: "From the palm tree, sail two squares east, then one square south. Stop before the reef marker.",
    mapNote: "Palm tree starts at A3. Reef warning: C3. Whirlpool warning: D2.",
    reward: "A berry-stamped key and 18 gold coins slide into the toy treasure locker.",
  },
  {
    id: "pearl-bank",
    title: "Pearl Bank Marker",
    target: "D2",
    hazards: ["B2", "E4"],
    clue: "Find the pearl bank on row 2. Count four columns from the left edge and confirm the shark shadow first.",
    mapNote: "Pearl bank crosses row 2. Shark shadow at B2. Storm pocket at E4.",
    reward: "A pearl compass lens unlocks another owner's manual chapter.",
  },
  {
    id: "skull-sandbar",
    title: "Skull Sandbar Detour",
    target: "C5",
    hazards: ["C4", "A5"],
    clue: "Follow the bottom current to row 5. The safe X is centered on the map, just below the skull sandbar.",
    mapNote: "Safe row: 5. Center column: C. Skull sandbar at C4. Jagged rocks at A5.",
    reward: "A glossy ruby anchor charm is added to the boat shelf.",
  },
];

const COSMETIC_UNLOCKS = [
  { manualPage: 0, category: "steeringWheels", id: "wheel-classic", name: "Classic Toy Wheel" },
  { manualPage: 0, category: "seats", id: "seat-navy", name: "Navy Captain Chair" },
  { manualPage: 0, category: "players", id: "player-default", name: "Default Crew Toy" },
  { manualPage: 0, category: "players", id: "player-captain", name: "Captain Variant" },
  { manualPage: 0, category: "boats", id: "boat-glossy-sloop", name: "Glossy Sloop" },
  { manualPage: 0, category: "environments", id: "env-sky-cockpit", name: "Sky Cockpit Environment" },
  { manualPage: 1, category: "steeringWheels", id: "wheel-brass", name: "Royal Brass Wheel" },
  { manualPage: 2, category: "seats", id: "seat-cream", name: "Cloud Cream Chair" },
  { manualPage: 3, category: "steeringWheels", id: "wheel-pirate", name: "Pirate Bone Wheel" },
  { manualPage: 3, category: "pirates", id: "pirate-default", name: "Pirate Toy Enemy" },
  { manualPage: 4, category: "seats", id: "seat-pirate", name: "Pirate Red Chair" },
  { manualPage: 5, category: "boats", id: "boat-pirate-brown", name: "Brown Pirate Ship" },
  { manualPage: 6, category: "islands", id: "island-berry-cove", name: "Berry Cove Island" },
];

const SWITCHES = [
  "nav",
  "radio",
  "pump",
  "fuel",
  "lights",
  "gps",
  "manual",
  "defense",
  "aux-a",
  "aux-b",
  "aux-c",
  "aux-d",
].map((id, index) => ({ id, name: "", on: index % 3 !== 0, alert: index < 8 }));

const CAPTAIN_TASKS = [
  {
    id: "radio-check",
    role: "captain",
    type: "word-search",
    title: "Decode Radio Call",
    target: "RADIO",
    hint: "Tap R-A-D-I-O in order, then call the word out loud.",
    step: "Restore the comms word before the route fades.",
  },
  {
    id: "signal-flag",
    role: "captain",
    type: "word-search",
    title: "Signal Flag Scan",
    target: "ANCHOR",
    hint: "Trace A-N-C-H-O-R to recover the safe harbor signal.",
    step: "Read the target word, then tap each letter in order.",
  },
  {
    id: "plot-course",
    role: "captain",
    type: "letter-bank",
    title: "Build Navigation Term",
    target: "COMPASS",
    letters: "ASCOMPS",
    hint: "Use all letters to build the missing manual heading.",
    step: "Assemble the heading and confirm it with your partner.",
  },
  {
    id: "storm-phrase",
    role: "captain",
    type: "letter-bank",
    title: "Repair Radio Phrase",
    target: "MAYDAY",
    letters: "YDAMAY",
    hint: "Assemble the emergency radio call.",
    step: "Build the phrase and tell the engineer the warning is clear.",
  },
  {
    id: "treasure-term",
    role: "captain",
    type: "letter-bank",
    title: "Treasure Clue Phrase",
    target: "BERRY",
    letters: "RYEBR",
    hint: "Build the hidden clue word and say it slowly.",
    step: "Assemble the clue word to add it to the owner's manual.",
  },
  {
    id: "semaphore-relay",
    role: "captain",
    type: "signal-relay",
    title: "Semaphore Relay",
    targetSignals: ["wave", "flag", "bell", "star"],
    hint: "Repeat the signal order exactly so your partner can follow the lane.",
    step: "Read the signal order and confirm each icon in sequence.",
  },
  {
    id: "pirate-warning",
    role: "captain",
    type: "code-select",
    title: "Pirate Warning Phrase",
    prompt: "Which playful warning keeps the crew calm and precise?",
    options: ["RED SAIL", "HOLD FAST", "BONE BELL", "WAVE BRACE"],
    answer: "HOLD FAST",
    hint: "Pick the phrase that sounds like a calm defense callout.",
    step: "Choose the best pirate warning and speak it to the crew.",
  },
];

const ENGINEER_TASKS = [
  {
    id: "coolant-sort",
    role: "engineer",
    type: "liquid-sort",
    title: "Balance Coolant Tubes",
    hint: "Move matching liquid colors into clean tubes.",
    step: "Tap a tube to pick up the top liquid, then tap a valid tube to pour it.",
  },
  {
    id: "wire-route",
    role: "engineer",
    type: "connect-dots",
    title: "Reconnect Circuit",
    hint: "Tap dots 1 through 5 to restore the maintenance circuit.",
    step: "Follow the numbered route without skipping a dot.",
  },
  {
    id: "part-match",
    role: "engineer",
    type: "matching",
    title: "Match Spare Parts",
    hint: "Find all matching boat system icons.",
    step: "Flip two cards at a time and pair every icon.",
  },
  {
    id: "fuel-sort",
    role: "engineer",
    type: "liquid-sort",
    title: "Separate Fuel Additives",
    hint: "Sort the fluids before the engine clogs.",
    step: "Use the empty tube as your workspace.",
  },
  {
    id: "valve-route",
    role: "engineer",
    type: "connect-dots",
    title: "Trace Bilge Valve Path",
    hint: "Tap each numbered valve in order.",
    step: "The circuit glows as you trace the correct route.",
  },
  {
    id: "breaker-balance",
    role: "engineer",
    type: "breaker-balance",
    title: "Balance Breaker Panel",
    targetSwitches: ["nav", "fuel", "gps", "defense"],
    hint: "Activate the target breakers and leave the others resting.",
    step: "Read the target row and settle the right switches.",
  },
  {
    id: "cargo-sort",
    role: "engineer",
    type: "cargo-sort",
    title: "Cargo Grouping",
    targetGroups: { fruit: 3, tools: 3, treasure: 3 },
    hint: "Drag cargo into the matching hold lane by category.",
    step: "Group the crates before the boat lists.",
  },
  {
    id: "pulse-sequence",
    role: "engineer",
    type: "sequence-repeat",
    title: "Power Pulse Repeat",
    sequence: ["amber", "blue", "amber", "green"],
    hint: "Repeat the pulse lights in the same order.",
    step: "Watch once, then repeat the sequence cleanly.",
  },
];

function makeCosmeticState() {
  return {
    unlocked: {
      steeringWheels: ["wheel-classic"],
      seats: ["seat-navy"],
      players: ["player-default", "player-captain"],
      boats: ["boat-glossy-sloop"],
      pirates: [],
      islands: [],
      environments: ["env-sky-cockpit"],
      gui: ["coin", "pearl", "gem", "berry", "pirateFlag", "radioWave"],
    },
    equipped: {
      steeringWheel: "wheel-classic",
      captainSeat: "seat-navy",
      engineerSeat: "seat-navy",
      captainPlayer: "player-default",
      engineerPlayer: "player-default",
      boat: "boat-glossy-sloop",
      pirate: "pirate-default",
      island: "island-berry-cove",
      environment: "env-sky-cockpit",
    },
    recentlyUnlocked: [],
  };
}

function unlockCosmeticsForPage(room, pageNumber) {
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

function cleanName(name, fallback = "Crewmate") {
  return String(name || fallback).trim().slice(0, 18) || fallback;
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

function makeLog(text) {
  return { id: crypto.randomUUID(), at: Date.now(), text };
}

function addLog(room, text) {
  room.log.unshift(makeLog(text));
  room.log = room.log.slice(0, 16);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function pickTask(role, used = [], challengeType = "general") {
  const deck = role === "captain" ? CAPTAIN_TASKS : ENGINEER_TASKS;
  const preferred = {
    "launch-sequence": role === "captain" ? ["radio-check", "plot-course", "semaphore-relay"] : ["breaker-balance", "wire-route", "pulse-sequence"],
    "treasure-grid": role === "captain" ? ["treasure-term", "signal-flag", "semaphore-relay"] : ["cargo-sort", "part-match", "fuel-sort"],
    "pirate-defense": role === "captain" ? ["pirate-warning", "signal-flag", "radio-check"] : ["breaker-balance", "cargo-sort", "pulse-sequence"],
    "storm-recovery": role === "captain" ? ["storm-phrase", "plot-course", "code-select"] : ["wire-route", "valve-route", "liquid-sort"],
  }[challengeType] || [];
  const boostedDeck = deck.filter((task) => preferred.includes(task.id));
  const sourceDeck = boostedDeck.length ? boostedDeck : deck;
  const options = sourceDeck.filter((task) => !used.includes(task.id));
  const pool = options.length ? options : sourceDeck;
  return { ...pool[Math.floor(Math.random() * pool.length)], nonce: crypto.randomUUID() };
}

function newPlayer(name, seat = null) {
  return { id: crypto.randomUUID(), name: cleanName(name), seat, score: 0, connectedAt: Date.now() };
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

function chapterById(id) {
  return CHAPTER_LOOKUP[id] || CHAPTERS[0];
}

function currentChapter(room) {
  return chapterById(room.campaign.currentChapterId);
}

function chapterSummaries() {
  return CHAPTERS.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    theme: chapter.theme,
    sceneState: chapter.sceneState,
  }));
}

function sceneSnapshotForRoom(room) {
  const chapter = currentChapter(room);
  const scene = VOYAGE_SCENES[room.scene.state] || VOYAGE_SCENES["idle-cruise"];
  return {
    state: scene.id,
    title: scene.title,
    subtitle: scene.subtitle,
    mood: scene.mood,
    callout: scene.callout,
    chapterTitle: chapter.title,
    challengeType: room.encounter.challengeType,
    equipped: { ...room.cosmetics.equipped },
  };
}

function assignEncounterTasks(room) {
  const chapter = currentChapter(room);
  room.tasks = {
    captain: pickTask("captain", room.completed.captain, chapter.challengeType),
    engineer: pickTask("engineer", room.completed.engineer, chapter.challengeType),
  };
}

function applySceneState(room, sceneState) {
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

function setupChapter(room, chapterId) {
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
  applySceneState(room, chapter.sceneState);
  assignEncounterTasks(room);
  addLog(room, `Chapter ready: ${chapter.title}. ${chapter.briefing}`);
}

function makeRoom(name) {
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
    stats: { hull: 82, power: 70, morale: 76, manualPages: 0, progress: 0, treasure: 0, piratePressure: 0 },
    gauges: { left: 44, center: 62, right: 38 },
    switches: SWITCHES.map((item) => ({ ...item })),
    completed: { captain: [], engineer: [] },
    tasks: { captain: pickTask("captain"), engineer: pickTask("engineer") },
    cosmetics: makeCosmeticState(),
    scene: initialScene(),
    treasureHunt: null,
    event: null,
    reveal: null,
    lastSuccess: null,
    log: [makeLog("Room created. Claim seats, inspect the chapter card, then launch the voyage.")],
  };
  rooms.set(code, room);
  return { room, playerId: host.id };
}

function joinExistingRoom(code, name) {
  const room = rooms.get(String(code || "").trim().toUpperCase());
  if (!room) return null;
  const seat = room.seats.engineer ? (room.seats.captain ? null : "captain") : "engineer";
  const player = newPlayer(name || "Crewmate", seat);
  room.players[player.id] = player;
  if (seat) room.seats[seat] = player.id;
  addLog(room, `${player.name} joined${seat ? ` as ${seat}` : " as observer"}.`);
  return { room, playerId: player.id };
}

function startCampaign(room) {
  room.campaign.started = true;
  room.campaign.voyageHistory = [];
  room.campaign.completedChapterIds = [];
  room.stats.progress = 0;
  room.rewardQueue = [];
  room.reveal = null;
  room.event = null;
  setupChapter(room, CHAPTERS[0].id);
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `Voyage launched: ${currentChapter(room).title}.`,
  };
}

function beginEncounter(room) {
  const chapter = currentChapter(room);
  room.encounter.phase = "challenge";
  room.encounter.startedAt = Date.now();
  room.encounter.timerEndsAt = Date.now() + chapter.timerMs;
  room.encounter.captainComplete = false;
  room.encounter.engineerComplete = false;
  room.encounter.sharedConfirmedBy = [];
  room.reveal = null;
  room.event = null;
  room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `${chapter.title} challenge started.` };
  addLog(room, `Challenge started for ${chapter.title}. Captain and Engineer must both complete their assignments.`);
}

function queueChapterRewards(room) {
  const chapter = currentChapter(room);
  room.stats.progress = clamp(room.stats.progress + 25);
  room.stats.treasure = clamp(room.stats.treasure + chapter.rewardTreasure);
  room.stats.manualPages += 1;
  room.stats.morale = clamp(room.stats.morale + 8);
  room.stats.power = clamp(room.stats.power + 6);
  const cosmeticUnlocks = unlockCosmeticsForPage(room, room.stats.manualPages);
  room.rewardQueue = [
    {
      id: crypto.randomUUID(),
      type: "manual",
      title: chapter.resolutionTitle,
      body: chapter.resolutionBody,
      pageNumber: room.stats.manualPages,
      unlocks: cosmeticUnlocks,
      treasure: chapter.rewardTreasure,
    },
  ];
  room.reveal = {
    id: crypto.randomUUID(),
    type: "manual",
    pageNumber: room.stats.manualPages,
    title: chapter.resolutionTitle,
    body: chapter.resolutionBody,
    clue: chapter.routeLabel,
    unlocks: cosmeticUnlocks,
  };
}

function completeChallengeIfReady(room) {
  if (room.encounter.phase !== "challenge") return;
  if (!room.encounter.captainComplete || !room.encounter.engineerComplete) return;
  room.encounter.phase = "resolution";
  room.encounter.timerEndsAt = null;
  room.encounter.sharedConfirmedBy = [];
  room.campaign.encounterIndex = 2;
  queueChapterRewards(room);
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `${currentChapter(room).title} cleared. Confirm the next route together.`,
  };
  addLog(room, `Challenge cleared: ${currentChapter(room).title}. Both roles completed their work.`);
}

function failCurrentChallenge(room) {
  const chapter = currentChapter(room);
  room.encounter.failedAttempts += 1;
  room.encounter.lastFailureAt = Date.now();
  room.encounter.phase = "briefing";
  room.encounter.timerEndsAt = null;
  room.encounter.captainComplete = false;
  room.encounter.engineerComplete = false;
  room.stats.power = clamp(room.stats.power - 10);
  room.stats.morale = clamp(room.stats.morale - 7);
  room.stats.hull = clamp(room.stats.hull - 5);
  assignEncounterTasks(room);
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `${chapter.title} slipped, but the crew can replay this encounter.`,
  };
  addLog(room, `${chapter.title} timed out. Soft failure applied; the encounter resets with a lighter penalty.`);
}

function chooseRoute(room, nextChapterId) {
  const chapter = chapterById(nextChapterId);
  if (!room.route.pendingOptions.includes(chapter.id)) return { ok: false, error: "That route is not available." };
  room.route.selected = chapter.id;
  room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `Route selected: ${chapter.title}.` };
  addLog(room, `The crew marked the next destination: ${chapter.title}.`);
  return { ok: true };
}

function claimRewardsAndAdvance(room) {
  const nextId = room.route.selected || room.route.pendingOptions[0] || CHAPTERS[0].id;
  const currentId = currentChapter(room).id;
  room.campaign.voyageHistory.push({
    chapterId: currentId,
    completedAt: Date.now(),
    rewards: room.rewardQueue.map((reward) => reward.title),
  });
  if (!room.campaign.completedChapterIds.includes(currentId)) room.campaign.completedChapterIds.push(currentId);
  if (!room.campaign.unlockedChapters.includes(nextId)) room.campaign.unlockedChapters.push(nextId);
  room.rewardQueue = [];
  room.reveal = null;
  setupChapter(room, nextId);
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `Course set for ${currentChapter(room).title}.`,
  };
}

function startTreasureHunt(room) {
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
  applySceneState(room, "treasure-sighting");
  room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `Treasure map opened: ${round.title}` };
  addLog(room, `${round.title} started. Captain reads the clue; Engineer works the grid.`);
}

function resolveTreasureGuess(room, playerId, coordinate) {
  const player = room.players[playerId];
  const hunt = room.treasureHunt;
  if (!player || !hunt?.active) return { ok: false, error: "No active treasure hunt." };
  if (hunt.solved || hunt.failed) return { ok: true };

  const guess = String(coordinate || "").trim().toUpperCase();
  const correct = guess === hunt.target;
  const hazard = hunt.hazards.includes(guess);
  hunt.attempts += 1;
  hunt.guesses.push({ id: crypto.randomUUID(), coordinate: guess, correct, hazard, player: player.name, at: Date.now() });

  if (correct) {
    hunt.solved = true;
    room.stats.treasure = clamp(room.stats.treasure + 28);
    room.stats.morale = clamp(room.stats.morale + 12);
    room.stats.progress = clamp(room.stats.progress + 12);
    room.reveal = {
      id: crypto.randomUUID(),
      type: "treasure",
      pageNumber: room.stats.manualPages + 1,
      title: `Treasure Found: ${hunt.title}`,
      body: hunt.reward,
      clue: "The crew completed a real co-op map round.",
    };
    room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `${player.name} found the treasure at ${guess}.` };
    addLog(room, `${player.name} tapped ${guess}. Treasure found: ${hunt.reward}`);
    return { ok: true };
  }

  room.stats.power = clamp(room.stats.power - (hazard ? 10 : 5));
  room.stats.hull = clamp(room.stats.hull - (hazard ? 8 : 3));
  room.stats.piratePressure = clamp(room.stats.piratePressure + (hazard ? 8 : 3));
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: hazard ? `${guess} hit a hazard. Re-read the clue.` : `${guess} was not the X. Try again.`,
  };
  addLog(room, `${player.name} tapped ${guess}. ${hazard ? "Hazard triggered" : "No treasure there"}.`);

  if (hunt.attempts >= hunt.maxAttempts) {
    hunt.failed = true;
    addLog(room, `Treasure signal lost after ${hunt.attempts} guesses. Relaunch the hunt to try a new map.`);
  }

  return { ok: true };
}

function clearTreasureHunt(room) {
  room.treasureHunt = null;
  applySceneState(room, currentChapter(room).sceneState);
  addLog(room, "Treasure hunt closed. Back to the voyage flow.");
}

function publicRoom(room) {
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

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    Connection: "close",
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function broadcast(room) {
  const payload = `data: ${JSON.stringify(publicRoom(room))}\n\n`;
  for (const [clientId, res] of room.clients.entries()) {
    try {
      res.write(payload);
    } catch {
      room.clients.delete(clientId);
    }
  }
}

function completeTask(room, playerId, role, result = {}) {
  const player = room.players[playerId];
  const task = room.tasks[role];
  if (!player || !task) return { ok: false, error: "Task unavailable." };

  player.score += 1;
  room.completed[role].push(task.id);
  if (role === "captain") {
    room.encounter.captainComplete = true;
    room.stats.morale = clamp(room.stats.morale + 8);
    room.stats.progress = clamp(room.stats.progress + 6);
  } else {
    room.encounter.engineerComplete = true;
    room.stats.power = clamp(room.stats.power + 10);
    room.stats.hull = clamp(room.stats.hull + 8);
    room.stats.progress = clamp(room.stats.progress + 6);
  }
  room.stats.piratePressure = clamp(room.stats.piratePressure - 8);
  room.gauges.left = clamp(room.gauges.left + Math.floor(Math.random() * 15) - 5, 5, 95);
  room.gauges.center = clamp(room.gauges.center + Math.floor(Math.random() * 15) - 5, 5, 95);
  room.gauges.right = clamp(room.gauges.right + Math.floor(Math.random() * 15) - 5, 5, 95);

  const alertIndex = room.switches.findIndex((item) => item.alert && !item.on);
  if (alertIndex >= 0) {
    room.switches[alertIndex].on = true;
    room.switches[alertIndex].alert = false;
  }

  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `${player.name} completed ${task.title}.`,
  };

  const note = result.note ? `: ${result.note}` : "";
  addLog(room, `${player.name} completed ${task.title}${note}.`);
  completeChallengeIfReady(room);
  return { ok: true };
}

function equipCosmetic(room, player, payload = {}) {
  const category = String(payload.category || "");
  const id = String(payload.id || "");
  const target = String(payload.target || "");
  const allowedCategories = ["steeringWheels", "seats", "players", "boats", "pirates", "islands", "environments"];
  if (!allowedCategories.includes(category)) return { ok: false, error: "Unknown cosmetic category." };
  if (!room.cosmetics.unlocked[category]?.includes(id)) return { ok: false, error: "That asset is still locked." };

  if (category === "steeringWheels") room.cosmetics.equipped.steeringWheel = id;
  if (category === "seats") {
    if (target === "engineer") room.cosmetics.equipped.engineerSeat = id;
    else room.cosmetics.equipped.captainSeat = id;
  }
  if (category === "players") {
    if (target === "engineer") room.cosmetics.equipped.engineerPlayer = id;
    else room.cosmetics.equipped.captainPlayer = id;
  }
  if (category === "boats") room.cosmetics.equipped.boat = id;
  if (category === "pirates") room.cosmetics.equipped.pirate = id;
  if (category === "islands") room.cosmetics.equipped.island = id;
  if (category === "environments") room.cosmetics.equipped.environment = id;

  room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `${player.name} equipped ${id}.` };
  addLog(room, `${player.name} equipped ${id}.`);
  return { ok: true };
}

function acknowledgeScene(room, player) {
  if (!player.seat) return { ok: false, error: "Claim a seat first." };
  if (!room.scene.acknowledgedBy.includes(player.seat)) room.scene.acknowledgedBy.push(player.seat);
  if (!room.encounter.sharedConfirmedBy.includes(player.seat)) room.encounter.sharedConfirmedBy.push(player.seat);
  room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `${player.name} confirmed the shared callout.` };
  if (room.encounter.phase === "resolution" && room.encounter.sharedConfirmedBy.includes("captain") && room.encounter.sharedConfirmedBy.includes("engineer")) {
    addLog(room, "Both roles confirmed the route briefing. Claim the reward and continue.");
  }
  return { ok: true };
}

function handleAction(room, playerId, type, payload = {}) {
  const player = room.players[playerId];
  if (!["treasure:clear"].includes(type) && !player && type !== "campaign:start") return { ok: false, error: "Player not found." };

  if (type === "campaign:start" || type === "mission:start") {
    startCampaign(room);
    return { ok: true };
  }

  if (type === "encounter:begin") {
    beginEncounter(room);
    return { ok: true };
  }

  if (type === "chapter:selectRoute") {
    return chooseRoute(room, String(payload.chapterId || ""));
  }

  if (type === "reward:claim") {
    if (room.encounter.phase !== "resolution") return { ok: false, error: "No reward is ready yet." };
    if (!(room.encounter.sharedConfirmedBy.includes("captain") && room.encounter.sharedConfirmedBy.includes("engineer"))) {
      return { ok: false, error: "Both roles must confirm the next route first." };
    }
    claimRewardsAndAdvance(room);
    return { ok: true };
  }

  if (type === "scene:acknowledge") return acknowledgeScene(room, player);

  if (type === "qr:join") return { ok: true, joinUrl: `/?room=${encodeURIComponent(room.code)}` };

  if (type === "seat:claim") {
    const seat = payload.seat;
    if (!["captain", "engineer"].includes(seat)) return { ok: false, error: "Unknown seat." };
    const oldSeat = player.seat;
    const displacedId = room.seats[seat];
    if (oldSeat === seat) return { ok: true };
    if (oldSeat) room.seats[oldSeat] = null;
    if (displacedId && room.players[displacedId]) {
      room.players[displacedId].seat = oldSeat;
      if (oldSeat) room.seats[oldSeat] = displacedId;
    }
    player.seat = seat;
    room.seats[seat] = player.id;
    addLog(room, `${player.name} moved to the ${seat} seat.`);
    return { ok: true };
  }

  if (type === "seat:swap") {
    const captain = room.seats.captain;
    const engineer = room.seats.engineer;
    room.seats.captain = engineer;
    room.seats.engineer = captain;
    if (captain && room.players[captain]) room.players[captain].seat = "engineer";
    if (engineer && room.players[engineer]) room.players[engineer].seat = "captain";
    addLog(room, "The crew swapped seats and exchanged cockpit responsibilities.");
    return { ok: true };
  }

  if (type === "switch:toggle") {
    const item = room.switches.find((switchItem) => switchItem.id === payload.id);
    if (!item) return { ok: false, error: "Switch not found." };
    item.on = !item.on;
    item.alert = !item.on;
    room.stats.power = clamp(room.stats.power + (item.on ? 3 : -4));
    room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `Breaker ${item.on ? "restored" : "tripped"}.` };
    addLog(room, `${player.name} toggled a cockpit breaker ${item.on ? "on" : "off"}.`);
    return { ok: true };
  }

  if (type === "cosmetic:equip") return equipCosmetic(room, player, payload);

  if (type === "task:complete") return completeTask(room, playerId, payload.role, payload.result);

  if (type === "treasure:start") {
    startTreasureHunt(room);
    return { ok: true };
  }

  if (type === "treasure:guess") return resolveTreasureGuess(room, playerId, payload.coordinate);

  if (type === "treasure:clear") {
    clearTreasureHunt(room);
    return { ok: true };
  }

  return { ok: false, error: "Unknown action." };
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".bin": "application/octet-stream",
    ".hdr": "application/octet-stream",
  }[ext] || "application/octet-stream";

  if (req.method === "HEAD") {
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { "Cache-Control": "no-store" });
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size, "Cache-Control": "no-store" });
      res.end();
    });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/health") {
      if (req.method === "HEAD") {
        const payload = JSON.stringify({ ok: true, version: "0.6.0" });
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(payload),
          "Cache-Control": "no-store",
        });
        res.end();
        return;
      }
      return sendJson(res, 200, { ok: true, version: "0.6.0" });
    }

    if (req.method === "POST" && url.pathname === "/api/create") {
      const body = await readJson(req);
      const { room, playerId } = makeRoom(body.name);
      broadcast(room);
      return sendJson(res, 200, { ok: true, code: room.code, playerId, room: publicRoom(room) });
    }

    if (req.method === "POST" && url.pathname === "/api/join") {
      const body = await readJson(req);
      const result = joinExistingRoom(body.code, body.name);
      if (!result) return sendJson(res, 404, { ok: false, error: "Room not found. Check the code or create a new room." });
      broadcast(result.room);
      return sendJson(res, 200, { ok: true, code: result.room.code, playerId: result.playerId, room: publicRoom(result.room) });
    }

    if (req.method === "POST" && url.pathname === "/api/action") {
      const body = await readJson(req);
      const room = rooms.get(String(body.code || "").trim().toUpperCase());
      if (!room) return sendJson(res, 404, { ok: false, error: "Room not found." });
      const result = handleAction(room, body.playerId, body.type, body.payload);
      broadcast(room);
      return sendJson(res, result.ok ? 200 : 400, { ...result, room: publicRoom(room) });
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/events/")) {
      const code = url.pathname.split("/").pop()?.toUpperCase();
      const room = rooms.get(code);
      if (!room) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Room not found");
        return;
      }
      const clientId = crypto.randomUUID();
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.write(`data: ${JSON.stringify(publicRoom(room))}\n\n`);
      room.clients.set(clientId, res);
      req.on("close", () => room.clients.delete(clientId));
      return;
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { ok: false, error: "Server error." });
  }
});

setInterval(() => {
  for (const room of rooms.values()) {
    if (room.campaign.started && room.encounter.phase === "challenge") {
      room.stats.power = clamp(room.stats.power - 1);
      room.stats.piratePressure = clamp(room.stats.piratePressure + (currentChapter(room).id === "pirate-intercept" ? 2 : 1));
      if (room.encounter.timerEndsAt && room.encounter.timerEndsAt <= Date.now()) failCurrentChallenge(room);
      if (Math.random() > 0.72) {
        const target = room.switches[Math.floor(Math.random() * room.switches.length)];
        target.alert = true;
        target.on = false;
      }
    }
    if (room.stats.power < 30) room.stats.hull = clamp(room.stats.hull - 2);
    broadcast(room);
  }
}, 9000);

server.listen(PORT, () => {
  console.log(`Treasure Crew Co-op v0.6.0 running at http://localhost:${PORT}`);
});
