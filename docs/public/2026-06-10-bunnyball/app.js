"use strict";

const SCENE = {
  width: 1672,
  height: 941,
  image: "assets/bunny_original.png"
};

const GAME_STORAGE_KEY = "bunnyVolleyball.game.v2";
const OLD_GAME_STORAGE_KEY = "bunnyVolleyball.v1";
const AUDIO_STORAGE_KEY = "bunnyVolleyball.audio.v1";
const RABBIT_NAMES_STORAGE_KEY = "bunnyVolleyball.rabbitNames.v1";
const WATCH_TIME_STORAGE_KEY = "bunnyVolleyball.watchTime.v1";

const RABBITS = {
  left: {
    bbox: { x: 128, y: 430, w: 60, h: 49 },
    center: { x: 158, y: 455 },
    ballContact: { x: 170, y: 420 },
    ground: { x: 160, y: 477 },
    pulse: { x: 158, y: 455 }
  },
  middle: {
    bbox: { x: 847, y: 418, w: 34, h: 50 },
    center: { x: 864, y: 444 },
    ballContact: { x: 865, y: 402 },
    ground: { x: 864, y: 467 },
    pulse: { x: 864, y: 444 }
  },
  right: {
    bbox: { x: 1427, y: 456, w: 48, h: 48 },
    center: { x: 1450, y: 480 },
    ballContact: { x: 1445, y: 438 },
    ground: { x: 1452, y: 501 },
    pulse: { x: 1450, y: 480 }
  }
};

const BALL = {
  diameter: 64,
  minDiameter: 38,
  maxDiameter: 72
};

const RABBIT_IDS = ["left", "middle", "right"];

const ROUTE_OPTIONS = {
  left: ["middle", "right"],
  middle: ["left", "right"],
  right: ["left", "middle"]
};

const DEFAULT_RABBIT_NAMES = {
  left: "Clover",
  middle: "Pepper",
  right: "Hazel"
};

const RABBIT_LABELS = {
  left: { x: 204, y: 492, maxWidth: 180, align: "left" },
  middle: { x: 896, y: 505, maxWidth: 190, align: "center" },
  right: { x: 1326, y: 526, maxWidth: 190, align: "right" }
};

const IMPACT = {
  left: {
    pulseRadius: 42,
    sparkleRadius: 28,
    tapLineDirection: "up-right"
  },
  middle: {
    pulseRadius: 48,
    sparkleRadius: 34,
    tapLineDirection: "up-both"
  },
  right: {
    pulseRadius: 42,
    sparkleRadius: 28,
    tapLineDirection: "up-left"
  }
};

const HIT_PITCH = {
  left: 540,
  middle: 620,
  right: 700
};

// Audio attribution: original procedural composition and procedural SFX for Bunny Volleyball.
// No external samples, recordings, or copied melodies are used.
// Backyard Pocket Loop: original procedural 8-bar loop for Bunny Volleyball.
// Style target: calm old-game-inspired background bed.
// No external melody or recording is used.
const MUSIC = {
  tempoBpm: 96,
  beatsPerBar: 4,
  stepsPerBeat: 2,
  bars: 8,
  lookaheadMs: 25,
  scheduleAheadSec: 0.22
};

const AUDIO_MIX = {
  musicBusGain: 0.75,
  sfxBusGain: 0.9
};

const CHORDS = [
  { name: "C", root: "C3", notes: ["C4", "E4", "G4"] },
  { name: "Am", root: "A2", notes: ["A3", "C4", "E4"] },
  { name: "F", root: "F2", notes: ["F3", "A3", "C4"] },
  { name: "G", root: "G2", notes: ["G3", "B3", "D4"] },
  { name: "C", root: "C3", notes: ["C4", "E4", "G4"] },
  { name: "Am", root: "A2", notes: ["A3", "C4", "E4"] },
  { name: "F", root: "F2", notes: ["F3", "A3", "C4"] },
  { name: "G", root: "G2", notes: ["G3", "B3", "D4"] }
];

const MELODY_STEPS = [
  "E5", null, "G5", null, "A5", null, "G5", null,
  null, "E5", null, "D5", null, null, "C5", null,
  "D5", null, "E5", null, "G5", null, null, null,
  null, "A5", null, "G5", null, "E5", null, null,
  "E5", null, "G5", null, "A5", null, "C6", null,
  null, "A5", null, "G5", null, null, "E5", null,
  "D5", null, "E5", null, "G5", null, "E5", null,
  null, "D5", null, "C5", null, null, null, null
];

const NOTE_INDEX = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11
};

const SVG_NS = "http://www.w3.org/2000/svg";
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const portraitQuery = window.matchMedia("(orientation: portrait) and (max-width: 700px)");

let prefersReducedMotion = reducedMotionQuery.matches;
let manualScrollUntil = 0;

const pageShell = document.querySelector("#pageShell");
const scene = document.querySelector("#scene");
const beachBall = document.querySelector("#beachBall");
const ballShadow = document.querySelector("#ballShadow");
const motionTrail = document.querySelector("#motionTrail");
const motionTrailSoft = document.querySelector("#motionTrailSoft");
const impactEffects = document.querySelector("#impactEffects");
const scoreChip = document.querySelector("#scoreChip");
const scoreNumber = document.querySelector("#scoreNumber");
const audioChip = document.querySelector("#audioChip");
const audioToggle = document.querySelector("#audioToggle");
const volumeDown = document.querySelector("#volumeDown");
const volumeUp = document.querySelector("#volumeUp");
const volumeValue = document.querySelector("#volumeValue");
const rabbitNameLabels = [...document.querySelectorAll(".rabbit-name")];
const clockHoursMinutes = document.querySelector("#clockHoursMinutes");
const clockSeconds = document.querySelector("#clockSeconds");
const clockDate = document.querySelector("#clockDate");
const watchTime = document.querySelector("#watchTime");

function xPct(x) {
  return `${(x / SCENE.width) * 100}%`;
}

function yPct(y) {
  return `${(y / SCENE.height) * 100}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from, to, progress) {
  return from + (to - from) * progress;
}

function randomRange(rng, min, max) {
  return min + (max - min) * rng();
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function cubicBezier(p0, c1, c2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + ttt * p3.y
  };
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function createMulberry32(seed) {
  let state = seed >>> 0;

  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState() {
      return state >>> 0;
    },
    setState(nextState) {
      state = nextState >>> 0;
    }
  };
}

function createInitialSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

function chooseNextRabbit(from, rng) {
  const options = ROUTE_OPTIONS[from];
  return options[Math.floor(rng() * options.length)];
}

function generatePass({ from, to, passNumber, startEpochMs, rng }) {
  const p0 = { ...RABBITS[from].ballContact };
  const p3 = { ...RABBITS[to].ballContact };
  const dist = distance(p0, p3);
  const speedFactor = randomRange(rng, 0.88, 1.16);
  const baseDuration = 1180 + dist * 0.86;
  const durationMs = Math.round(clamp(baseDuration * speedFactor, 1350, 2950));
  const baseLift = clamp(92 + dist * 0.13, 118, 270);
  const arcLift = baseLift * randomRange(rng, 0.84, 1.18);
  const peakY = clamp(Math.min(p0.y, p3.y) - arcLift, 175, 365);
  const xJitter = randomRange(rng, -34, 34);
  const yJitterA = randomRange(rng, -18, 22);
  const yJitterB = randomRange(rng, -18, 22);

  return {
    id: `${from}-to-${to}-${passNumber}`,
    passNumber,
    from,
    to,
    startEpochMs,
    durationMs,
    p0,
    c1: {
      x: p0.x + (p3.x - p0.x) * 0.3 + xJitter * 0.35,
      y: clamp(peakY + yJitterA, 175, 365)
    },
    c2: {
      x: p0.x + (p3.x - p0.x) * 0.7 - xJitter * 0.35,
      y: clamp(peakY + yJitterB, 175, 365)
    },
    p3,
    arcLift: Math.round(arcLift),
    speedFactor: Number(speedFactor.toFixed(3))
  };
}

function isPoint(value) {
  return value && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function isValidPass(pass) {
  return Boolean(
    pass &&
    Number.isInteger(pass.passNumber) &&
    RABBIT_IDS.includes(pass.from) &&
    ROUTE_OPTIONS[pass.from].includes(pass.to) &&
    Number.isFinite(pass.startEpochMs) &&
    Number.isFinite(pass.durationMs) &&
    pass.durationMs >= 1350 &&
    pass.durationMs <= 2950 &&
    isPoint(pass.p0) &&
    isPoint(pass.c1) &&
    isPoint(pass.c2) &&
    isPoint(pass.p3)
  );
}

function saveGameState(state) {
  safeStorageSet(GAME_STORAGE_KEY, JSON.stringify(state));
}

function createGameState(now = Date.now(), migration = null) {
  const seed = createInitialSeed();
  const rng = createMulberry32(seed);
  const completedPasses = migration?.completedPasses || 0;
  const currentHolder = migration?.currentHolder || "left";
  const to = chooseNextRabbit(currentHolder, () => rng.next());
  const currentPass = generatePass({
    from: currentHolder,
    to,
    passNumber: completedPasses + 1,
    startEpochMs: now,
    rng: () => rng.next()
  });

  return {
    version: 2,
    seed,
    rngState: rng.getState(),
    completedPasses,
    currentHolder,
    currentPass
  };
}

function getLegacyMigration(now) {
  const raw = safeStorageGet(OLD_GAME_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(parsed.startEpochMs) || parsed.startEpochMs > now) {
      return null;
    }
    const elapsed = Math.max(0, now - parsed.startEpochMs);
    const cycleMs = 5750;
    const remainder = elapsed % cycleMs;
    const completedPasses =
      Math.floor(elapsed / cycleMs) * 3 +
      (remainder >= 1700 ? 1 : 0) +
      (remainder >= 3350 ? 1 : 0);
    const holders = ["left", "middle", "right"];
    return {
      completedPasses,
      currentHolder: holders[completedPasses % holders.length]
    };
  } catch {
    return null;
  }
}

function advancePass(state, startEpochMs) {
  const rng = createMulberry32(state.seed);
  rng.setState(state.rngState);
  state.completedPasses += 1;
  state.currentHolder = state.currentPass.to;
  const to = chooseNextRabbit(state.currentHolder, () => rng.next());
  state.currentPass = generatePass({
    from: state.currentHolder,
    to,
    passNumber: state.completedPasses + 1,
    startEpochMs,
    rng: () => rng.next()
  });
  state.rngState = rng.getState();
}

function fastForwardGameState(state, now) {
  let iterations = 0;
  while (
    now >= state.currentPass.startEpochMs + state.currentPass.durationMs &&
    iterations < 5000
  ) {
    const nextStart = state.currentPass.startEpochMs + state.currentPass.durationMs;
    advancePass(state, nextStart);
    iterations += 1;
  }

  if (now >= state.currentPass.startEpochMs + state.currentPass.durationMs) {
    // Extremely stale sessions are rebased to avoid blocking startup with unbounded work.
    const skippedEstimate = Math.floor(
      (now - state.currentPass.startEpochMs) / 2050
    );
    state.completedPasses += skippedEstimate;
    state.currentHolder = state.currentPass.to;
    const rng = createMulberry32(state.seed);
    rng.setState(state.rngState);
    const to = chooseNextRabbit(state.currentHolder, () => rng.next());
    state.currentPass = generatePass({
      from: state.currentHolder,
      to,
      passNumber: state.completedPasses + 1,
      startEpochMs: now,
      rng: () => rng.next()
    });
    state.rngState = rng.getState();
  }

  return iterations;
}

function loadGameState() {
  const now = Date.now();
  const raw = safeStorageGet(GAME_STORAGE_KEY);
  let state = null;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed.version === 2 &&
        Number.isInteger(parsed.seed) &&
        Number.isInteger(parsed.rngState) &&
        Number.isInteger(parsed.completedPasses) &&
        parsed.completedPasses >= 0 &&
        RABBIT_IDS.includes(parsed.currentHolder) &&
        isValidPass(parsed.currentPass)
      ) {
        state = parsed;
      }
    } catch {
      // Invalid state is replaced below.
    }
  }

  if (!state) {
    state = createGameState(now, getLegacyMigration(now));
  }
  fastForwardGameState(state, now);
  saveGameState(state);
  return state;
}

function formatPasses(value) {
  return String(value).padStart(6, "0");
}

function restartClass(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function createSvgElement(name, attributes) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

function triggerImpact(receiverName) {
  const rabbit = RABBITS[receiverName];
  const tuning = IMPACT[receiverName];

  restartClass(beachBall, "is-squashing");
  if (!prefersReducedMotion) {
    restartClass(scoreChip, "is-bumping");
  }

  impactEffects.replaceChildren();

  const pulse = createSvgElement("ellipse", {
    class: "impact-pulse",
    cx: rabbit.pulse.x,
    cy: rabbit.ground.y + 5,
    rx: tuning.pulseRadius,
    ry: tuning.pulseRadius * 0.27
  });
  impactEffects.append(pulse);

  if (!prefersReducedMotion) {
    const rayCount = receiverName === "middle" ? 6 : 5;
    for (let index = 0; index < rayCount; index += 1) {
      const angle = (-145 + (110 / (rayCount - 1)) * index) * (Math.PI / 180);
      const innerRadius = tuning.sparkleRadius * 0.42;
      const outerRadius = tuning.sparkleRadius;
      impactEffects.append(createSvgElement("line", {
        class: "impact-ray",
        x1: rabbit.pulse.x + Math.cos(angle) * innerRadius,
        y1: rabbit.pulse.y + Math.sin(angle) * innerRadius,
        x2: rabbit.pulse.x + Math.cos(angle) * outerRadius,
        y2: rabbit.pulse.y + Math.sin(angle) * outerRadius
      }));
    }

    const direction = tuning.tapLineDirection === "up-left" ? -1 : 1;
    const both = tuning.tapLineDirection === "up-both";
    for (let index = 0; index < 3; index += 1) {
      const side = both && index === 0 ? -1 : direction;
      const offset = (index - 1) * 9;
      const startX = rabbit.ballContact.x + side * (14 + Math.abs(offset) * 0.25);
      const startY = rabbit.ballContact.y - 4 - Math.abs(offset) * 0.12;
      const endX = startX + side * (20 + index * 3);
      const endY = startY - 20 - index * 4;
      const path = createSvgElement("path", {
        class: "impact-tap",
        d: `M ${startX} ${startY} Q ${startX + side * 12} ${startY - 7} ${endX} ${endY}`,
        "stroke-dasharray": 24,
        "stroke-dashoffset": 24
      });
      impactEffects.append(path);
    }
  }

  window.setTimeout(() => impactEffects.replaceChildren(), 400);
}

function updateTrail(pass, rawProgress) {
  const routeDistance = distance(pass.p0, pass.p3);
  const distanceScale = clamp(routeDistance / 1275, 0.45, 1);
  const trailSpan = lerp(0.11, 0.16, distanceScale);
  const sampleCount = routeDistance > 900 ? 7 : 6;
  const points = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const sampleProgress = clamp(
      rawProgress - trailSpan + (trailSpan * index) / (sampleCount - 1),
      0,
      1
    );
    points.push(cubicBezier(
      pass.p0,
      pass.c1,
      pass.c2,
      pass.p3,
      easeInOutSine(sampleProgress)
    ));
  }

  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const arrivalFade = 1 - clamp((rawProgress - 0.8) / 0.2, 0, 1);
  const launchFade = clamp(rawProgress / 0.08, 0, 1);
  const opacity = launchFade * arrivalFade * (prefersReducedMotion ? 0.22 : 1);
  const width = lerp(12, 16, distanceScale);

  motionTrail.setAttribute("d", pathData);
  motionTrailSoft.setAttribute("d", pathData);
  scene.style.setProperty("--trail-opacity", opacity.toFixed(3));
  scene.style.setProperty("--trail-width", String(width));
}

function updateShadow(pass, easedProgress, arcHeight) {
  const from = RABBITS[pass.from].ground;
  const to = RABBITS[pass.to].ground;
  const shadowX = lerp(from.x, to.x, easedProgress);
  const shadowY = lerp(from.y, to.y, easedProgress);
  const width = lerp(46, 20, arcHeight);
  const height = lerp(13, 6, arcHeight);
  const opacity = lerp(0.26, 0.07, arcHeight);

  ballShadow.style.left = xPct(shadowX);
  ballShadow.style.top = yPct(shadowY);
  ballShadow.style.setProperty("--shadow-width", width.toFixed(2));
  ballShadow.style.setProperty("--shadow-height", height.toFixed(2));
  ballShadow.style.setProperty("--shadow-opacity", opacity.toFixed(3));
}

function updatePortraitFollow(ballX) {
  if (!portraitQuery.matches || prefersReducedMotion || Date.now() < manualScrollUntil) {
    return;
  }

  const sceneWidth = scene.getBoundingClientRect().width;
  const ballPixelX = (ballX / SCENE.width) * sceneWidth;
  const maxScroll = Math.max(0, sceneWidth - pageShell.clientWidth);
  const target = clamp(ballPixelX - pageShell.clientWidth / 2, 0, maxScroll);
  pageShell.scrollLeft += (target - pageShell.scrollLeft) * 0.06;
}

function markManualScroll() {
  manualScrollUntil = Date.now() + 6000;
}

pageShell.addEventListener("touchstart", markManualScroll, { passive: true });
pageShell.addEventListener("pointerdown", markManualScroll, { passive: true });
pageShell.addEventListener("wheel", markManualScroll, { passive: true });

function addDebugMarkers() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("debug") !== "1") {
    return;
  }

  scene.classList.add("is-debug");
  const anchors = document.querySelector("#rabbitAnchors");

  for (const rabbit of Object.values(RABBITS)) {
    const marker = document.createElement("span");
    marker.className = "debug-anchor";
    marker.style.left = xPct(rabbit.ballContact.x);
    marker.style.top = yPct(rabbit.ballContact.y);
    anchors.append(marker);

    const box = document.createElement("span");
    box.className = "debug-box";
    box.style.left = xPct(rabbit.bbox.x);
    box.style.top = yPct(rabbit.bbox.y);
    box.style.width = xPct(rabbit.bbox.w);
    box.style.height = yPct(rabbit.bbox.h);
    anchors.append(box);
  }
}

function clampVolume(value) {
  return Math.max(0, Math.min(1, value));
}

function volumeToLabel(value) {
  return `${Math.round(value * 100)}%`;
}

function loadAudioState() {
  const defaults = {
    enabled: false,
    volume: 0.35,
    music: true,
    sfx: true
  };
  const raw = safeStorageGet(AUDIO_STORAGE_KEY);

  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      volume: Number.isFinite(parsed.volume) ? clampVolume(parsed.volume) : defaults.volume,
      music: true,
      sfx: true
    };
  } catch {
    return defaults;
  }
}

function noteToFrequency(note) {
  const match = /^([A-G][b#]?)(-?\d+)$/.exec(note);
  if (!match) {
    throw new Error(`Invalid note: ${note}`);
  }

  const [, pitch, octaveText] = match;
  const octave = Number(octaveText);
  const midi = 12 * (octave + 1) + NOTE_INDEX[pitch];
  return 440 * 2 ** ((midi - 69) / 12);
}

function xToPan(x) {
  return clamp((x / SCENE.width) * 2 - 1, -0.65, 0.65);
}

class BunnyAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicBus = null;
    this.musicFilter = null;
    this.sfxBus = null;
    this.enabled = false;
    this.volume = 0.35;
    this.schedulerId = null;
    this.nextStepTime = 0;
    this.stepIndex = 0;
  }

  async init() {
    if (this.ctx) {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Web Audio API is not supported in this browser.");
    }

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.musicBus = this.ctx.createGain();
    this.musicFilter = this.ctx.createBiquadFilter();
    this.sfxBus = this.ctx.createGain();

    this.musicFilter.type = "lowpass";
    this.musicFilter.frequency.setValueAtTime(4200, this.ctx.currentTime);
    this.musicFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);
    this.musicBus.gain.setValueAtTime(AUDIO_MIX.musicBusGain, this.ctx.currentTime);
    this.sfxBus.gain.setValueAtTime(AUDIO_MIX.sfxBusGain, this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    this.musicBus.connect(this.musicFilter);
    this.musicFilter.connect(this.masterGain);
    this.sfxBus.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  rampMaster(target, time = 0.04) {
    if (!this.masterGain || !this.ctx) {
      return;
    }
    const now = this.ctx.currentTime;
    const gain = this.masterGain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(0.0001, gain.value), now);
    gain.linearRampToValueAtTime(Math.max(0.0001, target), now + time);
  }

  setVolume(value) {
    this.volume = clampVolume(value);
    if (this.enabled) {
      this.rampMaster(this.volume, 0.05);
    }
  }

  scheduleTone({
    time,
    frequency,
    duration,
    type = "triangle",
    gain = 0.02,
    destination,
    pan = 0,
    attack = 0.008,
    release = 0.08
  }) {
    if (!this.ctx) {
      return;
    }

    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, time);
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.linearRampToValueAtTime(gain, time + attack);
    amp.gain.linearRampToValueAtTime(0.0001, time + duration + release);
    panner.pan.setValueAtTime(pan, time);
    osc.connect(amp);
    amp.connect(panner);
    panner.connect(destination);
    osc.start(time);
    osc.stop(time + duration + release + 0.02);
  }

  createNoiseBuffer(durationSec = 0.08) {
    const sampleRate = this.ctx.sampleRate;
    const frameCount = Math.floor(sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  scheduleSoftTick(time) {
    const source = this.ctx.createBufferSource();
    const amp = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    source.buffer = this.createNoiseBuffer(0.06);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(0.8, time);
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.linearRampToValueAtTime(0.006, time + 0.006);
    amp.gain.linearRampToValueAtTime(0.0001, time + 0.05);
    source.connect(filter);
    filter.connect(amp);
    amp.connect(this.musicBus);
    source.start(time);
    source.stop(time + 0.07);
  }

  scheduleMusicStep(step, time) {
    const bar = Math.floor(step / 8);
    const stepInBar = step % 8;
    const chord = CHORDS[bar];
    const melodyNote = MELODY_STEPS[step];

    if (melodyNote) {
      this.scheduleTone({
        time,
        frequency: noteToFrequency(melodyNote),
        duration: 0.16,
        type: "triangle",
        gain: 0.026,
        destination: this.musicBus,
        pan: 0.08
      });
    }

    if (stepInBar === 0) {
      this.scheduleTone({
        time,
        frequency: noteToFrequency(chord.root),
        duration: 0.34,
        type: "sine",
        gain: 0.02,
        destination: this.musicBus,
        pan: -0.08
      });
    }

    if (stepInBar === 2 || stepInBar === 5) {
      const note = chord.notes[stepInBar === 2 ? 0 : 2];
      this.scheduleTone({
        time,
        frequency: noteToFrequency(note),
        duration: 0.12,
        type: "triangle",
        gain: 0.014,
        destination: this.musicBus,
        pan: -0.03
      });
    }

    if (stepInBar === 4) {
      this.scheduleSoftTick(time);
    }
  }

  startMusic() {
    if (this.schedulerId || !this.ctx) {
      return;
    }

    const secondsPerBeat = 60 / MUSIC.tempoBpm;
    const secondsPerStep = secondsPerBeat / MUSIC.stepsPerBeat;
    this.stepIndex = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    const schedule = () => {
      if (this.nextStepTime < this.ctx.currentTime - 0.5) {
        this.nextStepTime = this.ctx.currentTime + 0.05;
      }
      while (this.nextStepTime < this.ctx.currentTime + MUSIC.scheduleAheadSec) {
        this.scheduleMusicStep(this.stepIndex, this.nextStepTime);
        this.stepIndex = (this.stepIndex + 1) % (
          MUSIC.bars * MUSIC.beatsPerBar * MUSIC.stepsPerBeat
        );
        this.nextStepTime += secondsPerStep;
      }
    };

    schedule();
    this.schedulerId = window.setInterval(schedule, MUSIC.lookaheadMs);
  }

  stopMusic() {
    if (!this.schedulerId) {
      return;
    }
    window.clearInterval(this.schedulerId);
    this.schedulerId = null;
  }

  canPlaySfx() {
    return Boolean(this.enabled && this.ctx && this.ctx.state === "running");
  }

  playLaunch(senderName) {
    if (!this.canPlaySfx()) {
      return;
    }
    const now = this.ctx.currentTime;
    const pan = xToPan(RABBITS[senderName].center.x);
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();
    const scale = prefersReducedMotion ? 0.65 : 1;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(390, now + 0.09);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.linearRampToValueAtTime(0.018 * scale, now + 0.01);
    amp.gain.linearRampToValueAtTime(0.0001, now + 0.09);
    panner.pan.setValueAtTime(pan, now);
    osc.connect(amp);
    amp.connect(panner);
    panner.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playWhoosh(pass) {
    if (!this.canPlaySfx() || prefersReducedMotion) {
      return;
    }
    const now = this.ctx.currentTime;
    const duration = clamp(pass.durationMs / 5600, 0.26, 0.52);
    const source = this.ctx.createBufferSource();
    const amp = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner();
    source.buffer = this.createNoiseBuffer(duration);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(1800, now + duration);
    filter.Q.setValueAtTime(0.8, now);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.linearRampToValueAtTime(0.014, now + 0.06);
    amp.gain.linearRampToValueAtTime(0.0001, now + duration);
    panner.pan.setValueAtTime(xToPan(pass.p0.x), now);
    panner.pan.linearRampToValueAtTime(xToPan(pass.p3.x), now + duration);
    source.connect(filter);
    filter.connect(amp);
    amp.connect(panner);
    panner.connect(this.sfxBus);
    source.start(now);
    source.stop(now + duration + 0.02);
  }

  playHit(receiverName) {
    if (!this.canPlaySfx()) {
      return;
    }
    const now = this.ctx.currentTime;
    const pan = xToPan(RABBITS[receiverName].center.x);
    const base = HIT_PITCH[receiverName] || 620;
    const scale = prefersReducedMotion ? 0.65 : 1;

    this.scheduleTone({
      time: now,
      frequency: base,
      duration: 0.055,
      type: "triangle",
      gain: 0.03 * scale,
      destination: this.sfxBus,
      pan,
      attack: 0.004,
      release: 0.055
    });
    this.scheduleTone({
      time: now + 0.035,
      frequency: base * 1.5,
      duration: 0.05,
      type: "sine",
      gain: 0.014 * scale,
      destination: this.sfxBus,
      pan,
      attack: 0.004,
      release: 0.06
    });
  }

  playMilestone(completedPasses) {
    if (!this.canPlaySfx() || completedPasses <= 0 || completedPasses % 10 !== 0) {
      return;
    }
    const now = this.ctx.currentTime;
    const scale = prefersReducedMotion ? 0.5 : 1;
    this.scheduleTone({
      time: now,
      frequency: noteToFrequency("C6"),
      duration: 0.08,
      type: "sine",
      gain: 0.012 * scale,
      destination: this.sfxBus,
      attack: 0.006,
      release: 0.08
    });
    this.scheduleTone({
      time: now + 0.09,
      frequency: noteToFrequency("G6"),
      duration: 0.1,
      type: "sine",
      gain: 0.01 * scale,
      destination: this.sfxBus,
      attack: 0.006,
      release: 0.1
    });
  }
}

const gameState = loadGameState();
const audioState = loadAudioState();
const audioEngine = new BunnyAudioEngine();
audioEngine.volume = audioState.volume;
let gameInitialized = false;

function saveAudioState() {
  safeStorageSet(AUDIO_STORAGE_KEY, JSON.stringify(audioState));
}

function renderAudioControls() {
  audioToggle.textContent = audioState.enabled ? "Sound On" : "Sound Off";
  audioToggle.setAttribute("aria-pressed", String(audioState.enabled));
  audioChip.dataset.enabled = String(audioState.enabled);
  volumeValue.value = volumeToLabel(audioState.volume);
  volumeValue.textContent = volumeToLabel(audioState.volume);
}

async function enableAudio() {
  try {
    await audioEngine.init();
    if (audioEngine.ctx.state === "suspended") {
      await audioEngine.ctx.resume();
    }
    audioState.enabled = true;
    audioEngine.enabled = true;
    audioEngine.setVolume(audioState.volume);
    audioEngine.rampMaster(audioState.volume, 0.08);
    audioEngine.startMusic();
    saveAudioState();
    renderAudioControls();
  } catch {
    audioState.enabled = false;
    audioEngine.enabled = false;
    saveAudioState();
    renderAudioControls();
  }
}

function disableAudio() {
  audioState.enabled = false;
  audioEngine.enabled = false;
  if (audioEngine.ctx) {
    audioEngine.rampMaster(0.0001, 0.12);
    window.setTimeout(() => audioEngine.stopMusic(), 140);
  }
  saveAudioState();
  renderAudioControls();
}

audioToggle.addEventListener("click", () => {
  if (audioState.enabled && !audioEngine.enabled) {
    enableAudio();
  } else if (audioState.enabled) {
    disableAudio();
  } else {
    enableAudio();
  }
});

function changeVolume(delta) {
  audioState.volume = clampVolume(Math.round((audioState.volume + delta) * 20) / 20);
  audioEngine.setVolume(audioState.volume);
  saveAudioState();
  renderAudioControls();
}

volumeDown.addEventListener("click", () => changeVolume(-0.05));
volumeUp.addEventListener("click", () => changeVolume(0.05));

document.addEventListener("click", () => {
  if (audioState.enabled && !audioEngine.enabled) {
    enableAudio();
  }
});

function processPassBoundaries(now) {
  let boundaryCount = 0;
  let liveCompletedPass = null;

  while (
    now >= gameState.currentPass.startEpochMs + gameState.currentPass.durationMs &&
    boundaryCount < 5000
  ) {
    const completedPass = gameState.currentPass;
    const completedAt = completedPass.startEpochMs + completedPass.durationMs;
    advancePass(gameState, completedAt);
    saveGameState(gameState);
    boundaryCount += 1;

    if (
      boundaryCount === 1 &&
      now - completedAt < 250 &&
      document.visibilityState === "visible"
    ) {
      liveCompletedPass = completedPass;
    } else {
      liveCompletedPass = null;
    }
  }

  if (boundaryCount === 5000) {
    fastForwardGameState(gameState, now);
    saveGameState(gameState);
    liveCompletedPass = null;
  }

  if (gameInitialized && liveCompletedPass) {
    triggerImpact(liveCompletedPass.to);
    audioEngine.playHit(liveCompletedPass.to);
    if (gameState.completedPasses > 0 && gameState.completedPasses % 10 === 0) {
      audioEngine.playMilestone(gameState.completedPasses);
    }
    audioEngine.playLaunch(gameState.currentPass.from);
    audioEngine.playWhoosh(gameState.currentPass);
  }
}

function animate() {
  const now = Date.now();
  processPassBoundaries(now);
  const pass = gameState.currentPass;
  const rawProgress = clamp(
    (now - pass.startEpochMs) / pass.durationMs,
    0,
    1
  );
  const easedProgress = prefersReducedMotion ? rawProgress : easeInOutSine(rawProgress);
  const point = cubicBezier(pass.p0, pass.c1, pass.c2, pass.p3, easedProgress);
  const arcHeight = Math.sin(Math.PI * easedProgress);

  beachBall.style.left = xPct(point.x);
  beachBall.style.top = yPct(point.y);
  beachBall.style.setProperty(
    "--ball-rotation",
    `${(now * 0.18) % 360}deg`
  );

  updateShadow(pass, easedProgress, arcHeight);
  updateTrail(pass, rawProgress);
  updatePortraitFollow(point.x);
  scoreNumber.textContent = formatPasses(gameState.completedPasses);
  gameInitialized = true;

  window.requestAnimationFrame(animate);
}

reducedMotionQuery.addEventListener("change", (event) => {
  prefersReducedMotion = event.matches;
});

function sanitizeRabbitName(value) {
  return String(value)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function loadRabbitNames() {
  const raw = safeStorageGet(RABBIT_NAMES_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_RABBIT_NAMES };
  }

  try {
    const parsed = JSON.parse(raw);
    return Object.fromEntries(
      RABBIT_IDS.map((rabbitId) => [
        rabbitId,
        sanitizeRabbitName(parsed[rabbitId]) || DEFAULT_RABBIT_NAMES[rabbitId]
      ])
    );
  } catch {
    return { ...DEFAULT_RABBIT_NAMES };
  }
}

const rabbitNames = loadRabbitNames();
let rabbitNameSaveTimer = null;

function saveRabbitNames() {
  safeStorageSet(RABBIT_NAMES_STORAGE_KEY, JSON.stringify(rabbitNames));
}

function debounceSaveRabbitNames() {
  window.clearTimeout(rabbitNameSaveTimer);
  rabbitNameSaveTimer = window.setTimeout(saveRabbitNames, 180);
}

function placeCaretAtEnd(element) {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function insertPlainText(element, text) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !element.contains(selection.anchorNode)) {
    element.textContent += text;
    placeCaretAtEnd(element);
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function placeRabbitNameLabel(element, config) {
  const transforms = {
    left: "translate(0, -50%)",
    center: "translate(-50%, -50%)",
    right: "translate(-100%, -50%)"
  };
  element.style.left = xPct(config.x);
  element.style.top = yPct(config.y);
  element.style.setProperty("--label-max-width", xPct(config.maxWidth));
  element.style.setProperty("--label-transform", transforms[config.align]);
}

function bindRabbitNameLabel(element) {
  const rabbitId = element.dataset.rabbitId;
  placeRabbitNameLabel(element, RABBIT_LABELS[rabbitId]);
  element.textContent = rabbitNames[rabbitId];

  element.addEventListener("input", () => {
    const clean = sanitizeRabbitName(element.textContent);
    if (element.textContent !== clean) {
      element.textContent = clean;
      placeCaretAtEnd(element);
    }
    rabbitNames[rabbitId] = clean || DEFAULT_RABBIT_NAMES[rabbitId];
    debounceSaveRabbitNames();
  });

  element.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = sanitizeRabbitName(event.clipboardData.getData("text/plain"));
    insertPlainText(element, text);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });

  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      element.blur();
    } else if (event.key === "Escape") {
      element.blur();
    }
  });

  element.addEventListener("blur", () => {
    const clean = sanitizeRabbitName(element.textContent);
    rabbitNames[rabbitId] = clean || DEFAULT_RABBIT_NAMES[rabbitId];
    element.textContent = rabbitNames[rabbitId];
    saveRabbitNames();
  });
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function getClockParts(now = new Date()) {
  return {
    hoursMinutes: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
    seconds: `:${pad2(now.getSeconds())}`,
    dateLabel: new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(now)
  };
}

function loadWatchState() {
  const raw = safeStorageGet(WATCH_TIME_STORAGE_KEY);
  let totalVisibleMs = 0;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Number.isFinite(parsed.totalVisibleMs) && parsed.totalVisibleMs >= 0) {
        totalVisibleMs = parsed.totalVisibleMs;
      }
    } catch {
      // Invalid state starts from zero.
    }
  }
  return {
    totalVisibleMs,
    visibleStartedAtMs: document.hidden ? null : Date.now()
  };
}

const watchState = loadWatchState();

function getVisibleWatchMs() {
  if (watchState.visibleStartedAtMs === null) {
    return watchState.totalVisibleMs;
  }
  return watchState.totalVisibleMs + (Date.now() - watchState.visibleStartedAtMs);
}

function saveWatchTime() {
  safeStorageSet(WATCH_TIME_STORAGE_KEY, JSON.stringify({
    totalVisibleMs: Math.max(0, Math.round(getVisibleWatchMs())),
    updatedEpochMs: Date.now()
  }));
}

function startVisibleWatch() {
  if (watchState.visibleStartedAtMs === null) {
    watchState.visibleStartedAtMs = Date.now();
  }
}

function stopVisibleWatch() {
  if (watchState.visibleStartedAtMs !== null) {
    watchState.totalVisibleMs += Date.now() - watchState.visibleStartedAtMs;
    watchState.visibleStartedAtMs = null;
  }
  saveWatchTime();
}

function formatWatchTime(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  return `Watching: ${days} days ${pad2(hours)} hours ${pad2(minutes)} minutes`;
}

let clockTickTimer = null;
let secondsClassTimer = null;

function renderClock() {
  const parts = getClockParts(new Date());
  clockHoursMinutes.textContent = parts.hoursMinutes;

  if (clockSeconds.textContent !== parts.seconds) {
    clockSeconds.textContent = parts.seconds;
    clockSeconds.classList.remove("is-ticking");
    if (!prefersReducedMotion) {
      void clockSeconds.offsetWidth;
      clockSeconds.classList.add("is-ticking");
      window.clearTimeout(secondsClassTimer);
      secondsClassTimer = window.setTimeout(() => {
        clockSeconds.classList.remove("is-ticking");
      }, 170);
    }
  }

  clockDate.textContent = parts.dateLabel;
  watchTime.textContent = formatWatchTime(getVisibleWatchMs());
  window.clearTimeout(clockTickTimer);
  clockTickTimer = window.setTimeout(renderClock, 1000 - (Date.now() % 1000) + 12);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopVisibleWatch();
  } else {
    startVisibleWatch();
    renderClock();
  }
});
window.addEventListener("pagehide", stopVisibleWatch);
window.addEventListener("pageshow", () => {
  if (!document.hidden) {
    startVisibleWatch();
  }
});
window.setInterval(saveWatchTime, 15000);

for (const label of rabbitNameLabels) {
  bindRabbitNameLabel(label);
}

renderAudioControls();
addDebugMarkers();
renderClock();

if (new URLSearchParams(window.location.search).get("debug") === "1") {
  window.__bunnyVolleyballDebug = {
    gameState,
    createMulberry32,
    chooseNextRabbit,
    generatePass,
    processPassBoundaries,
    getVisibleWatchMs,
    audioEngine
  };
}

window.requestAnimationFrame(animate);
