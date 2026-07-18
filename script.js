"use strict";

const excuses = [
  "Still waking up",
  "Monday detected",
  "Finding motivation",
  "Coffee machine needs coffee",
  "Updating beans",
  "Cup not emotionally ready",
  "Brewing meeting in progress",
  "Please try after breakfast",
];

const progressStates = [
  { percent: 12, message: "Checking cup compatibility…", sound: "tick" },
  { percent: 31, message: "Preheating excuses…", sound: "tick" },
  { percent: 58, message: "Negotiating with beans…", sound: "shuffle" },
  { percent: 87, message: "Almost definitely brewing…", sound: "tick" },
];

const TOTAL_ATTEMPTS = 10;
const DROP_ATTEMPT = 5;

const elements = {
  machineWrap: document.querySelector("#machineWrap"),
  machineMood: document.querySelector("#machineMood"),
  progressScreen: document.querySelector(".progress-screen"),
  progressTrack: document.querySelector("#progressTrack"),
  progressFill: document.querySelector("#progressFill"),
  screenKicker: document.querySelector("#screenKicker"),
  statusMessage: document.querySelector("#statusMessage"),
  attemptCount: document.querySelector("#attemptCount"),
  attemptsRemaining: document.querySelector("#attemptsRemaining"),
  attemptLog: document.querySelector("#attemptLog"),
  emptyLog: document.querySelector("#emptyLog"),
  brewButton: document.querySelector("#brewButton"),
  brewButtonLabel: document.querySelector("#brewButton span:nth-child(2)"),
  soundButton: document.querySelector("#soundButton"),
  soundIcon: document.querySelector("#soundIcon"),
  soundLabel: document.querySelector("#soundLabel"),
  resetButton: document.querySelector("#resetButton"),
  announcement: document.querySelector("#announcement"),
};

const state = {
  attempts: 0,
  brewing: false,
  soundEnabled: true,
  previousExcuse: "",
};

let activeController = null;
let audioContext = null;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function wait(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException("Brewing cancelled", "AbortError"));
    };

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

function getStepDuration() {
  return reducedMotionQuery.matches ? 220 : 620;
}

function setProgress(percent, accessibleLabel) {
  elements.progressTrack.dataset.progress = String(percent);
  elements.progressTrack.setAttribute("aria-valuenow", String(percent));
  elements.progressTrack.setAttribute("aria-valuetext", accessibleLabel);
}

function updateAttemptDisplay() {
  const remaining = Math.max(TOTAL_ATTEMPTS - state.attempts, 0);
  elements.attemptCount.textContent = `${state.attempts} / ${TOTAL_ATTEMPTS}`;
  elements.attemptsRemaining.textContent = `${remaining} ${remaining === 1 ? "request" : "requests"} remaining`;
}

function chooseExcuse() {
  const availableExcuses = excuses.filter((excuse) => excuse !== state.previousExcuse);
  const choice = availableExcuses[Math.floor(Math.random() * availableExcuses.length)];
  state.previousExcuse = choice;
  return choice;
}

function addLogEntry(attempt, message, extraClass = "") {
  elements.emptyLog?.remove();

  const item = document.createElement("li");
  item.dataset.attempt = String(attempt).padStart(2, "0");
  item.textContent = message;

  if (extraClass) {
    item.classList.add(extraClass);
  }

  elements.attemptLog.prepend(item);
}

function announce(message) {
  elements.announcement.textContent = "";
  window.requestAnimationFrame(() => {
    elements.announcement.textContent = message;
  });
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function playTone(frequency, duration, options = {}) {
  if (!state.soundEnabled) {
    return;
  }

  const context = getAudioContext();

  if (!context) {
    return;
  }

  const startTime = context.currentTime + (options.delay ?? 0);
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = options.type ?? "square";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  if (options.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, startTime + duration);
  }

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(options.volume ?? 0.035, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playGeneratedSound(name) {
  const sounds = {
    start() {
      playTone(165, 0.1, { type: "square", volume: 0.028 });
      playTone(220, 0.13, { type: "square", delay: 0.09, volume: 0.026 });
    },
    tick() {
      playTone(460, 0.055, { type: "sine", volume: 0.024 });
    },
    shuffle() {
      playTone(130, 0.18, { type: "sawtooth", endFrequency: 105, volume: 0.018 });
    },
    denied() {
      playTone(210, 0.15, { type: "square", volume: 0.025 });
      playTone(150, 0.22, { type: "square", delay: 0.13, volume: 0.025 });
    },
    drop() {
      playTone(720, 0.08, { type: "sine", volume: 0.032 });
      playTone(340, 0.12, { type: "sine", delay: 0.7, volume: 0.022 });
    },
    success() {
      playTone(262, 0.2, { type: "triangle", volume: 0.035 });
      playTone(330, 0.2, { type: "triangle", delay: 0.16, volume: 0.035 });
      playTone(392, 0.3, { type: "triangle", delay: 0.32, volume: 0.04 });
    },
    reset() {
      playTone(320, 0.12, { type: "sine", endFrequency: 180, volume: 0.024 });
    },
    toggle() {
      playTone(520, 0.08, { type: "sine", volume: 0.02 });
    },
  };

  sounds[name]?.();
}

function setBrewingUi(isBrewing) {
  state.brewing = isBrewing;
  elements.brewButton.disabled = isBrewing || state.attempts >= TOTAL_ATTEMPTS;
  elements.brewButton.classList.toggle("is-busy", isBrewing);
  elements.brewButton.setAttribute("aria-busy", String(isBrewing));
  elements.machineWrap.classList.toggle("is-brewing", isBrewing);
  elements.progressScreen.classList.toggle("is-working", isBrewing);

  if (isBrewing) {
    elements.brewButtonLabel.textContent = "Machine thinking…";
  } else if (state.attempts >= TOTAL_ATTEMPTS) {
    elements.brewButtonLabel.textContent = "Coffee made";
  } else {
    elements.brewButtonLabel.textContent = "Make Coffee";
  }
}

async function brewCoffee() {
  if (state.brewing || state.attempts >= TOTAL_ATTEMPTS) {
    return;
  }

  const controller = new AbortController();
  activeController = controller;
  state.attempts += 1;

  updateAttemptDisplay();
  setBrewingUi(true);
  elements.progressScreen.classList.remove("is-denied", "is-success");
  elements.screenKicker.textContent = "BREW CYCLE / ALLEGEDLY";
  elements.machineMood.textContent = "Mood: pretending";
  playGeneratedSound("start");

  try {
    for (const progressState of progressStates) {
      elements.statusMessage.textContent = progressState.message;
      setProgress(progressState.percent, progressState.message.replace("…", ""));
      playGeneratedSound(progressState.sound);
      await wait(getStepDuration(), controller.signal);
    }

    const currentAttempt = state.attempts;

    if (currentAttempt === TOTAL_ATTEMPTS) {
      elements.machineWrap.classList.remove("has-drop");
      elements.machineWrap.classList.add("is-success");
      elements.progressScreen.classList.add("is-success");
      elements.screenKicker.textContent = "COMPLIANCE ACHIEVED";
      elements.statusMessage.textContent = "Fine. Here is your coffee.";
      elements.machineMood.textContent = "Mood: deeply inconvenienced";
      setProgress(100, "Coffee finally ready");
      addLogEntry(currentAttempt, "Fine. Here is your coffee.", "success-entry");
      playGeneratedSound("success");
      announce("Attempt ten succeeded. Fine. Here is your coffee. The cup is full.");
      return;
    }

    const excuse = chooseExcuse();
    elements.progressScreen.classList.add("is-denied");
    elements.screenKicker.textContent = currentAttempt === DROP_ATTEMPT ? "MINIMUM EFFORT MODE" : "BREW DEFERRED";
    elements.statusMessage.textContent = excuse;
    elements.machineMood.textContent = currentAttempt === DROP_ATTEMPT ? "Mood: technically helpful" : "Mood: avoiding eye contact";
    setProgress(92, `Brewing stopped. ${excuse}`);

    if (currentAttempt === DROP_ATTEMPT) {
      elements.machineWrap.classList.add("has-drop");
      addLogEntry(currentAttempt, excuse, "drop-entry");
      playGeneratedSound("drop");
      announce(`Attempt ${currentAttempt}: ${excuse}. The machine produced exactly one drop.`);
    } else {
      addLogEntry(currentAttempt, excuse);
      playGeneratedSound("denied");
      announce(`Attempt ${currentAttempt}: ${excuse}. No coffee was made.`);
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("The machine found an unexpected excuse:", error);
      elements.statusMessage.textContent = "Unexpected excuse detected";
      announce("The brewing sequence stopped because of an unexpected error.");
    }
  } finally {
    if (activeController === controller) {
      activeController = null;
      setBrewingUi(false);
    }
  }
}

function resetMachine() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }

  state.attempts = 0;
  state.brewing = false;
  state.previousExcuse = "";

  elements.machineWrap.classList.remove("is-brewing", "has-drop", "is-success");
  elements.progressScreen.classList.remove("is-working", "is-denied", "is-success");
  elements.screenKicker.textContent = "READY / RELUCTANT";
  elements.statusMessage.textContent = "Machine present. Work ethic missing.";
  elements.machineMood.textContent = "Mood: unavailable";
  elements.attemptLog.replaceChildren();

  const emptyItem = document.createElement("li");
  emptyItem.className = "empty-log";
  emptyItem.id = "emptyLog";
  emptyItem.textContent = "No excuses filed yet.";
  elements.attemptLog.append(emptyItem);
  elements.emptyLog = emptyItem;

  setProgress(0, "Waiting to start");
  updateAttemptDisplay();
  setBrewingUi(false);
  playGeneratedSound("reset");
  announce("Coffee machine reset. Attempts are back to zero.");
}

function toggleSound() {
  if (state.soundEnabled) {
    playGeneratedSound("toggle");
    state.soundEnabled = false;
  } else {
    state.soundEnabled = true;
    playGeneratedSound("toggle");
  }

  elements.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
  elements.soundButton.setAttribute(
    "aria-label",
    state.soundEnabled ? "Turn generated sounds off" : "Turn generated sounds on",
  );
  elements.soundIcon.textContent = state.soundEnabled ? "♪" : "×";
  elements.soundLabel.textContent = state.soundEnabled ? "Sound on" : "Sound off";
  announce(`Generated sound ${state.soundEnabled ? "on" : "off"}.`);
}

elements.brewButton.addEventListener("click", () => {
  void brewCoffee();
});
elements.resetButton.addEventListener("click", resetMachine);
elements.soundButton.addEventListener("click", toggleSound);

updateAttemptDisplay();
setProgress(0, "Waiting to start");
