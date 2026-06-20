import crypto from "node:crypto";

import { CHAPTERS } from "./config.js";
import {
  addLog,
  applySceneState,
  applyVoyageScene,
  assignEncounterTasks,
  chapterById,
  clamp,
  createVoyageInterlude,
  currentChapter,
  publicRoom,
  setupChapter,
  startTreasureHuntState,
  unlockCosmeticsForPage,
} from "./state.js";

function resetEncounterForRetry(room, chapter) {
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

function startCampaign(room) {
  room.campaign.started = true;
  room.campaign.voyageHistory = [];
  room.campaign.completedChapterIds = [];
  room.stats.progress = 0;
  room.rewardQueue = [];
  room.reveal = null;
  room.event = null;
  room.voyage = null;
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

function chooseRoute(room, nextChapterId) {
  const chapter = chapterById(nextChapterId);
  if (!room.route.pendingOptions.includes(chapter.id)) return { ok: false, error: "That route is not available." };
  room.route.selected = chapter.id;
  room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `Route selected: ${chapter.title}.` };
  addLog(room, `The crew marked the next destination: ${chapter.title}.`);
  return { ok: true };
}

function beginVoyageInterlude(room) {
  const nextId = room.route.selected || room.route.pendingOptions[0] || CHAPTERS[0].id;
  room.campaign.voyageHistory.push({
    chapterId: currentChapter(room).id,
    completedAt: Date.now(),
    rewards: room.rewardQueue.map((reward) => reward.title),
    nextChapterId: nextId,
  });
  room.voyage = createVoyageInterlude(room, nextId);
  room.encounter.phase = "interlude";
  room.rewardQueue = [];
  room.reveal = null;
  applyVoyageScene(room, nextId);
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `Voyage interlude ready: ${room.voyage.title}.`,
  };
  addLog(room, `Interlude active: ${room.voyage.title}. Resolve it together before the next chapter unlocks.`);
}

function completeVoyageInterlude(room) {
  const nextId = room.voyage?.nextChapterId || room.route.selected || room.route.pendingOptions[0] || CHAPTERS[0].id;
  const currentId = currentChapter(room).id;
  if (!room.campaign.completedChapterIds.includes(currentId)) room.campaign.completedChapterIds.push(currentId);
  if (!room.campaign.unlockedChapters.includes(nextId)) room.campaign.unlockedChapters.push(nextId);
  const voyageTitle = room.voyage?.title || "Voyage";
  room.voyage = null;
  setupChapter(room, nextId);
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `${voyageTitle} cleared. Course set for ${currentChapter(room).title}.`,
  };
}

function settleVoyageSelection(room) {
  const voyage = room.voyage;
  if (!voyage?.active) return { ok: false, error: "No active voyage interlude." };
  const captainSelection = voyage.selections.captain;
  const engineerSelection = voyage.selections.engineer;
  if (!captainSelection || !engineerSelection) return { ok: true };

  const matched = captainSelection === engineerSelection;
  const correct = matched && captainSelection === voyage.target;

  if (correct) {
    room.stats.progress = clamp(room.stats.progress + 8);
    room.stats.morale = clamp(room.stats.morale + 5);
    room.stats.piratePressure = clamp(room.stats.piratePressure - 6);
    addLog(room, `Interlude cleared: ${voyage.title}. Both roles matched ${voyage.target}.`);
    completeVoyageInterlude(room);
    return { ok: true };
  }

  voyage.attempts += 1;
  voyage.selections = { captain: null, engineer: null };
  room.stats.hull = clamp(room.stats.hull - 4);
  room.stats.power = clamp(room.stats.power - 5);
  room.stats.piratePressure = clamp(room.stats.piratePressure + 6);
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: matched ? "Wrong interlude call. Re-read the route." : "The crew did not match. Call the next move again.",
  };
  addLog(room, matched ? `Interlude miss: ${voyage.title}. Wrong response chosen.` : `Interlude mismatch: Captain and Engineer confirmed different options.`);
  return { ok: true };
}

function setVoyageSelection(room, player, choiceId) {
  if (!player.seat) return { ok: false, error: "Claim a seat first." };
  if (!room.voyage?.active) return { ok: false, error: "No voyage interlude is active." };
  if (!room.voyage.options.some((option) => option.id === choiceId)) return { ok: false, error: "That choice is not available." };
  room.voyage.selections[player.seat] = choiceId;
  room.lastSuccess = {
    id: crypto.randomUUID(),
    at: Date.now(),
    text: `${player.name} locked ${choiceId} for the shared interlude.`,
  };
  return settleVoyageSelection(room);
}

function startTreasureHunt(room) {
  startTreasureHuntState(room);
  applySceneState(room, "treasure-sighting");
  room.lastSuccess = { id: crypto.randomUUID(), at: Date.now(), text: `Treasure map opened: ${room.treasureHunt.title}` };
  addLog(room, `${room.treasureHunt.title} started. Captain reads the clue; Engineer works the grid.`);
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
    addLog(room, "Both roles confirmed the route briefing. Claim the reward to open the voyage interlude.");
  }
  return { ok: true };
}

export function handleAction(room, playerId, type, payload = {}) {
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

  if (type === "chapter:selectRoute") return chooseRoute(room, String(payload.chapterId || ""));

  if (type === "reward:claim") {
    if (room.encounter.phase !== "resolution") return { ok: false, error: "No reward is ready yet." };
    if (!(room.encounter.sharedConfirmedBy.includes("captain") && room.encounter.sharedConfirmedBy.includes("engineer"))) {
      return { ok: false, error: "Both roles must confirm the next route first." };
    }
    beginVoyageInterlude(room);
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

  if (type === "seat:release") {
    if (!player.seat) return { ok: true };
    room.seats[player.seat] = null;
    addLog(room, `${player.name} released the ${player.seat} seat.`);
    player.seat = null;
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

  if (type === "voyage:selectWaypoint" || type === "voyage:confirmWaypoint" || type === "voyage:choosePort" || type === "voyage:resolveHazard") {
    const choice = String(payload.choiceId || payload.nodeId || payload.portId || payload.optionId || "");
    return setVoyageSelection(room, player, choice);
  }

  return { ok: false, error: "Unknown action." };
}

export function tickRoom(room) {
  if (room.campaign.started && room.encounter.phase === "challenge") {
    room.stats.power = clamp(room.stats.power - 1);
    room.stats.piratePressure = clamp(room.stats.piratePressure + (currentChapter(room).id === "pirate-intercept" ? 2 : 1));
    if (room.encounter.timerEndsAt && room.encounter.timerEndsAt <= Date.now()) resetEncounterForRetry(room, currentChapter(room));
    if (Math.random() > 0.72) {
      const target = room.switches[Math.floor(Math.random() * room.switches.length)];
      target.alert = true;
      target.on = false;
    }
  }
  if (room.voyage?.active) {
    room.stats.piratePressure = clamp(room.stats.piratePressure + 1);
  }
  if (room.stats.power < 30) room.stats.hull = clamp(room.stats.hull - 2);
  return publicRoom(room);
}
