"use strict";

const SCENE = {
  width: 1672,
  height: 941,
  image: "assets/bunny_original.png"
};

const STORAGE_KEY = "bunnyVolleyball.v1";
const AUDIO_STORAGE_KEY = "bunnyVolleyball.audio.v1";

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

const PASSES = [
  {
    id: "left-to-middle",
    from: "left",
    to: "middle",
    durationMs: 1700,
    p0: { x: 170, y: 420 },
    c1: { x: 340, y: 265 },
    c2: { x: 650, y: 265 },
    p3: { x: 865, y: 402 }
  },
  {
    id: "middle-to-right",
    from: "middle",
    to: "right",
    durationMs: 1650,
    p0: { x: 865, y: 402 },
    c1: { x: 1010, y: 285 },
    c2: { x: 1250, y: 285 },
    p3: { x: 1445, y: 438 }
  },
  {
    id: "right-to-left",
    from: "right",
    to: "left",
    durationMs: 2400,
    p0: { x: 1445, y: 438 },
    c1: { x: 1210, y: 205 },
    c2: { x: 480, y: 205 },
    p3: { x: 170, y: 420 }
  }
];

const TIMING = {
  cycleMs: 5750,
  passesPerCycle: 3
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
let lastCompletedPasses = null;
let lastPassId = null;
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

function loadGameState() {
  const now = Date.now();
  const raw = safeStorageGet(STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (
        Number.isFinite(parsed.startEpochMs) &&
        parsed.startEpochMs > 0 &&
        parsed.startEpochMs <= now
      ) {
        return parsed;
      }
    } catch {
      // Invalid state is replaced below.
    }
  }

  const state = { startEpochMs: now };
  safeStorageSet(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function getCompletedPasses(elapsedMs) {
  const fullCycles = Math.floor(elapsedMs / TIMING.cycleMs);
  const remainder = elapsedMs % TIMING.cycleMs;
  let segmentPasses = 0;

  if (remainder >= PASSES[0].durationMs) {
    segmentPasses = 1;
  }
  if (remainder >= PASSES[0].durationMs + PASSES[1].durationMs) {
    segmentPasses = 2;
  }

  return fullCycles * TIMING.passesPerCycle + segmentPasses;
}

function resolveActivePass(elapsedMs) {
  const cycleElapsed = elapsedMs % TIMING.cycleMs;
  let passStartMs = 0;

  for (let index = 0; index < PASSES.length; index += 1) {
    const pass = PASSES[index];
    const passEndMs = passStartMs + pass.durationMs;
    if (cycleElapsed < passEndMs) {
      return {
        pass,
        passIndex: index,
        rawProgress: (cycleElapsed - passStartMs) / pass.durationMs
      };
    }
    passStartMs = passEndMs;
  }

  return { pass: PASSES[0], passIndex: 0, rawProgress: 0 };
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
  const trailSpan = pass.id === "right-to-left" ? 0.16 : 0.12;
  const sampleCount = pass.id === "right-to-left" ? 7 : 6;
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
  const width = pass.id === "right-to-left" ? 16 : pass.id === "middle-to-right" ? 14 : 12;

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
    this.musicBus.gain.setValueAtTime(0.11, this.ctx.currentTime);
    this.sfxBus.gain.setValueAtTime(0.18, this.ctx.currentTime);
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
    const duration = pass.id === "right-to-left" ? 0.52 : pass.id === "left-to-middle" ? 0.26 : 0.3;
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

    const elapsedMs = Math.max(0, Date.now() - gameState.startEpochMs);
    const motionElapsedMs = elapsedMs * (prefersReducedMotion ? 0.72 : 1);
    lastPassId = resolveActivePass(motionElapsedMs).pass.id;
    lastCompletedPasses = getCompletedPasses(motionElapsedMs);
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

function syncAudioWithGame(activePass, completedPasses) {
  if (!audioEngine.enabled) {
    return;
  }

  if (activePass.id !== lastPassId) {
    audioEngine.playLaunch(activePass.from);
    audioEngine.playWhoosh(activePass);
    lastPassId = activePass.id;
  }

  if (
    lastCompletedPasses !== null &&
    completedPasses === lastCompletedPasses + 1
  ) {
    const completedPass = PASSES[(completedPasses - 1) % PASSES.length];
    audioEngine.playHit(completedPass.to);
    audioEngine.playMilestone(completedPasses);
  }
}

function animate() {
  const elapsedMs = Math.max(0, Date.now() - gameState.startEpochMs);
  const motionElapsedMs = elapsedMs * (prefersReducedMotion ? 0.72 : 1);
  const { pass, rawProgress } = resolveActivePass(motionElapsedMs);
  const easedProgress = easeInOutSine(rawProgress);
  const point = cubicBezier(pass.p0, pass.c1, pass.c2, pass.p3, easedProgress);
  const arcHeight = Math.sin(Math.PI * easedProgress);
  const completedPasses = getCompletedPasses(motionElapsedMs);

  beachBall.style.left = xPct(point.x);
  beachBall.style.top = yPct(point.y);
  beachBall.style.setProperty(
    "--ball-rotation",
    `${(motionElapsedMs * 0.18) % 360}deg`
  );

  updateShadow(pass, easedProgress, arcHeight);
  updateTrail(pass, rawProgress);
  updatePortraitFollow(point.x);

  if (lastCompletedPasses === null) {
    lastCompletedPasses = completedPasses;
    lastPassId = pass.id;
    scoreNumber.textContent = formatPasses(completedPasses);
  } else if (completedPasses !== lastCompletedPasses) {
    scoreNumber.textContent = formatPasses(completedPasses);
    if (completedPasses === lastCompletedPasses + 1) {
      const completedPass = PASSES[(completedPasses - 1) % PASSES.length];
      triggerImpact(completedPass.to);
    }
    syncAudioWithGame(pass, completedPasses);
    lastCompletedPasses = completedPasses;
    lastPassId = pass.id;
  } else {
    syncAudioWithGame(pass, completedPasses);
  }

  window.requestAnimationFrame(animate);
}

reducedMotionQuery.addEventListener("change", (event) => {
  prefersReducedMotion = event.matches;
  lastCompletedPasses = null;
  lastPassId = null;
});

renderAudioControls();
addDebugMarkers();
window.requestAnimationFrame(animate);
