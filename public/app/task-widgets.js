import {
  CARGO_ITEMS,
  LIQUID_START,
  MATCHING_ICONS,
  PULSE_COLORS,
  SIGNAL_ICONS,
  SIGNAL_SET,
  WORD_GRIDS,
} from "./content.js";
import { escapeHtml, html, shuffle } from "./helpers.js";

export function mountTask(task, role, completeTask) {
  const mount = document.querySelector("#taskMount");
  if (!mount) return;
  if (task.type === "word-search") return mountWordSearch(mount, task, role, completeTask);
  if (task.type === "letter-bank") return mountLetterBank(mount, task, role, completeTask);
  if (task.type === "liquid-sort") return mountLiquidSort(mount, role, completeTask);
  if (task.type === "connect-dots") return mountConnectDots(mount, role, completeTask);
  if (task.type === "matching") return mountMatching(mount, role, completeTask);
  if (task.type === "signal-relay") return mountSignalRelay(mount, task, role, completeTask);
  if (task.type === "code-select") return mountCodeSelect(mount, task, role, completeTask);
  if (task.type === "breaker-balance") return mountBreakerBalance(mount, task, role, completeTask);
  if (task.type === "cargo-sort") return mountCargoSort(mount, role, completeTask);
  if (task.type === "sequence-repeat") return mountSequenceRepeat(mount, task, role, completeTask);
}

function mountWordSearch(mount, task, role, completeTask) {
  const grid = WORD_GRIDS[task.target] || WORD_GRIDS.RADIO;
  const target = task.target.split("");
  let selected = [];
  const draw = () => {
    const current = selected.map((cell) => grid[cell.r][cell.c]).join("");
    mount.innerHTML = html`<div class="target-word">Target: ${task.target}</div><div class="word-grid" style="grid-template-columns: repeat(${grid[0].length}, 1fr)">${grid.map((row, r) => row.map((letter, c) => `<button class="${selected.some((cell) => cell.r === r && cell.c === c) ? "selected" : ""}" data-r="${r}" data-c="${c}">${letter}</button>`).join("")).join("")}</div><div class="answer-strip">${current || "tap letters in order"}</div>`;
    mount.querySelectorAll("[data-r]").forEach((button) => button.addEventListener("click", () => {
      const r = Number(button.dataset.r);
      const c = Number(button.dataset.c);
      const letter = grid[r][c];
      if (letter === target[selected.length]) selected.push({ r, c });
      else selected = [];
      if (selected.map((cell) => grid[cell.r][cell.c]).join("") === task.target) {
        draw();
        setTimeout(() => completeTask(role, `decoded ${task.target}`), 250);
      } else draw();
    }));
  };
  draw();
}

function mountLetterBank(mount, task, role, completeTask) {
  const letters = task.letters.split("");
  let used = [];
  const draw = () => {
    const answer = used.map((item) => item.letter).join("");
    mount.innerHTML = html`<div class="target-word">Build: ${task.target}</div><div class="answer-strip large">${answer || "_".repeat(task.target.length)}</div><div class="letter-bank">${letters.map((letter, index) => `<button data-letter="${letter}" data-index="${index}" ${used.some((item) => item.index === index) ? "disabled" : ""}>${letter}</button>`).join("")}</div><button class="secondary-button" data-reset>Reset letters</button>`;
    mount.querySelectorAll("[data-letter]").forEach((button) => button.addEventListener("click", () => {
      used.push({ letter: button.dataset.letter, index: Number(button.dataset.index) });
      if (used.map((item) => item.letter).join("") === task.target) {
        draw();
        setTimeout(() => completeTask(role, `built ${task.target}`), 250);
      } else draw();
    }));
    mount.querySelector("[data-reset]").addEventListener("click", () => {
      used = [];
      draw();
    });
  };
  draw();
}

function mountLiquidSort(mount, role, completeTask) {
  let tubes = LIQUID_START.map((tube) => [...tube]);
  let selected = null;
  const isSolved = () => tubes.every((tube) => tube.length === 0 || (tube.length === 4 && tube.every((item) => item === tube[0])));
  const draw = () => {
    mount.innerHTML = html`<div class="liquid-game">${tubes.map((tube, index) => `<button class="tube ${selected === index ? "selected" : ""}" data-tube="${index}">${Array.from({ length: 4 }, (_, slot) => `<span class="liquid ${tube[slot] || "empty"}"></span>`).join("")}</button>`).join("")}</div><button class="secondary-button" data-reset>Reset tubes</button>`;
    mount.querySelectorAll("[data-tube]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.tube);
      if (selected === null) {
        if (tubes[index].length) selected = index;
      } else if (selected === index) {
        selected = null;
      } else {
        const source = tubes[selected];
        const destination = tubes[index];
        const color = source[source.length - 1];
        if (color && destination.length < 4 && (!destination.length || destination[destination.length - 1] === color)) destination.push(source.pop());
        selected = null;
      }
      if (isSolved()) {
        draw();
        setTimeout(() => completeTask(role, "fluids balanced"), 300);
      } else draw();
    }));
    mount.querySelector("[data-reset]").addEventListener("click", () => {
      tubes = LIQUID_START.map((tube) => [...tube]);
      selected = null;
      draw();
    });
  };
  draw();
}

function mountConnectDots(mount, role, completeTask) {
  const dots = [{ n: 1, x: 12, y: 62 }, { n: 2, x: 28, y: 22 }, { n: 3, x: 48, y: 72 }, { n: 4, x: 66, y: 28 }, { n: 5, x: 84, y: 58 }];
  let nextDot = 1;
  const draw = () => {
    const points = dots.filter((dot) => dot.n < nextDot).map((dot) => `${dot.x},${dot.y}`).join(" ");
    mount.innerHTML = html`<div class="dots-game"><svg viewBox="0 0 100 100"><polyline points="${points}"></polyline></svg>${dots.map((dot) => `<button class="dot ${dot.n < nextDot ? "complete" : ""}" style="left:${dot.x}%;top:${dot.y}%" data-dot="${dot.n}">${dot.n}</button>`).join("")}</div>`;
    mount.querySelectorAll("[data-dot]").forEach((button) => button.addEventListener("click", () => {
      const dot = Number(button.dataset.dot);
      nextDot = dot === nextDot ? nextDot + 1 : 1;
      if (nextDot > dots.length) {
        draw();
        setTimeout(() => completeTask(role, "circuit path restored"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountMatching(mount, role, completeTask) {
  const cards = shuffle([...MATCHING_ICONS, ...MATCHING_ICONS].map((icon, index) => ({ icon, id: `${icon}-${index}` })));
  let open = [];
  let matched = [];
  const draw = () => {
    mount.innerHTML = `<div class="matching-game">${cards.map((card, index) => {
      const visible = open.includes(index) || matched.includes(card.id);
      return `<button class="match-card ${visible ? "open" : ""}" data-card="${index}">${visible ? card.icon : "?"}</button>`;
    }).join("")}</div>`;
    mount.querySelectorAll("[data-card]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.card);
      if (open.includes(index) || matched.includes(cards[index].id) || open.length >= 2) return;
      open.push(index);
      draw();
      if (open.length === 2) {
        setTimeout(() => {
          const [a, b] = open;
          if (cards[a].icon === cards[b].icon) matched.push(cards[a].id, cards[b].id);
          open = [];
          if (matched.length === cards.length) {
            draw();
            setTimeout(() => completeTask(role, "parts matched"), 250);
          } else draw();
        }, 400);
      }
    }));
  };
  draw();
}

function mountSignalRelay(mount, task, role, completeTask) {
  let progress = 0;
  const draw = () => {
    mount.innerHTML = html`<div class="target-word">Repeat: ${task.targetSignals.map((item) => SIGNAL_ICONS[item]).join(" ")}</div><div class="signal-grid">${SIGNAL_SET.map((signal) => `<button data-signal="${signal}" class="${task.targetSignals[progress] === signal ? "suggested" : ""}">${SIGNAL_ICONS[signal]}<span>${signal}</span></button>`).join("")}</div><div class="answer-strip">${progress ? `Correct: ${progress}/${task.targetSignals.length}` : "tap the relay signals in order"}</div>`;
    mount.querySelectorAll("[data-signal]").forEach((button) => button.addEventListener("click", () => {
      const signal = button.dataset.signal;
      if (signal === task.targetSignals[progress]) progress += 1;
      else progress = 0;
      if (progress >= task.targetSignals.length) {
        draw();
        setTimeout(() => completeTask(role, "relayed the signal order"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountCodeSelect(mount, task, role, completeTask) {
  mount.innerHTML = html`<div class="target-word">${escapeHtml(task.prompt)}</div><div class="choice-grid">${task.options.map((option) => `<button data-choice="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}</div>`;
  mount.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.choice === task.answer) {
      button.classList.add("correct");
      setTimeout(() => completeTask(role, `selected ${task.answer}`), 250);
    } else {
      button.classList.add("wrong");
    }
  }));
}

function mountBreakerBalance(mount, task, role, completeTask) {
  const active = new Set();
  const target = new Set(task.targetSwitches);
  const allSwitches = ["nav", "fuel", "gps", "defense", "pump", "radio"];
  const solved = () => allSwitches.every((id) => active.has(id) === target.has(id));
  const draw = () => {
    mount.innerHTML = html`<div class="target-word">Activate: ${task.targetSwitches.join(", ")}</div><div class="breaker-balance-grid">${allSwitches.map((item) => `<button data-breaker="${item}" class="${active.has(item) ? "selected" : ""}">${item}</button>`).join("")}</div>`;
    mount.querySelectorAll("[data-breaker]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.breaker;
      if (active.has(id)) active.delete(id);
      else active.add(id);
      if (solved()) {
        draw();
        setTimeout(() => completeTask(role, "balanced the breakers"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountCargoSort(mount, role, completeTask) {
  const assignments = {};
  const groups = ["fruit", "tools", "treasure"];
  const solved = () => CARGO_ITEMS.every((item) => assignments[item.id] === item.group);
  const draw = () => {
    mount.innerHTML = html`<div class="cargo-grid">${CARGO_ITEMS.map((item) => `<div class="cargo-card"><strong>${item.icon} ${escapeHtml(item.label)}</strong><div class="cargo-choices">${groups.map((group) => `<button data-cargo="${item.id}" data-group="${group}" class="${assignments[item.id] === group ? "selected" : ""}">${group}</button>`).join("")}</div></div>`).join("")}</div>`;
    mount.querySelectorAll("[data-cargo]").forEach((button) => button.addEventListener("click", () => {
      assignments[button.dataset.cargo] = button.dataset.group;
      if (solved()) {
        draw();
        setTimeout(() => completeTask(role, "sorted the cargo hold"), 250);
      } else draw();
    }));
  };
  draw();
}

function mountSequenceRepeat(mount, task, role, completeTask) {
  let progress = [];
  mount.innerHTML = html`<div class="target-word">Memorize: ${task.sequence.map((item) => PULSE_COLORS[item]).join(" ")}</div><div class="signal-grid">${Object.entries(PULSE_COLORS).map(([color, icon]) => `<button data-pulse="${color}">${icon}<span>${color}</span></button>`).join("")}</div><button class="secondary-button" data-reset>Reset attempt</button>`;
  const update = () => {
    mount.querySelectorAll("[data-pulse]").forEach((button) => button.addEventListener("click", () => {
      progress.push(button.dataset.pulse);
      if (progress.join("|") === task.sequence.join("|")) {
        setTimeout(() => completeTask(role, "repeated the power pulse"), 250);
      } else if (progress.length >= task.sequence.length && progress.join("|") !== task.sequence.join("|")) {
        progress = [];
      }
    }));
    mount.querySelector("[data-reset]").addEventListener("click", () => {
      progress = [];
    });
  };
  update();
}
