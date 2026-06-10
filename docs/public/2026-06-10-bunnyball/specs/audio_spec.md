2026-06-10
---

A00 Audio Addendum Purpose

---

Add a small, optional audio layer to `Bunny Volleyball`.

The audio should support the existing visual concept without changing the product identity. The main experience is still the photo, the rabbits, the ball, the pass counter, and the subtle animation. Audio should make the scene feel more alive, but it must not turn the page into a loud game.

The audio layer has three jobs:

```txt id="6l8kae"
Create a calm looped background music bed.
Add tiny pass and hit effects that reinforce ball motion.
Give the user direct control over sound and volume.
```

The audio should be off until the user enables it. Do not autoplay sound on page load.

---

B00 Product Audio Direction

---

The target mood is:

```txt id="qywdjz"
calm
small
playful
old-game inspired
non-intrusive
loopable
slightly whimsical
```

The audio should feel like a quiet retro handheld game running in the background, not like an arcade cabinet.

The correct impression is:

```txt id="knb5q7"
The rabbits are casually playing forever.
The music is there if the user wants it.
The sound effects confirm contact but do not demand attention.
```

Do not use dramatic music, dance music, heavy drums, loud coin sounds, or exaggerated arcade jingles.

---

C00 Runtime Audio Policy

---

The implementation must use the browser Web Audio API directly.

Use:

```txt id="yizh72"
AudioContext
GainNode
OscillatorNode
BiquadFilterNode
StereoPannerNode
AudioBufferSourceNode for generated noise only
AudioParam scheduling
```

Do not use:

```txt id="yc1fck"
external audio libraries
Tone.js
Howler.js
MP3 files
WAV files
remote audio assets
HTML canvas
autoplay without user activation
```

The audio must be procedural. The implementation should generate music and sound effects in code.

Add this comment near the audio constants:

```js id="m8n29l"
// Audio attribution: original procedural composition and procedural SFX for Bunny Volleyball.
// No external samples, recordings, or copied melodies are used.
```

---

D00 Audio Control UI

---

Add a compact sound control chip. It should be visually secondary to the pass counter.

Recommended placement:

```txt id="wh7e4r"
desktop: bottom-right inside the scene
x inset: 32 px from scene right edge
y inset: 32 px from scene bottom edge
mobile: bottom-right or fixed to visible viewport if portrait panning is active
```

The control must contain:

```txt id="58gxdt"
Sound toggle button
minus volume button
current volume display
plus volume button
```

Text-only control is preferred. Do not use external icons.

Recommended visual text:

```txt id="4w7trn"
Sound Off    -    35%    +
Sound On     -    35%    +
```

Use concise button labels:

```html id="gffg04"
<div class="audio-chip" id="audioChip">
  <button class="audio-toggle" id="audioToggle" type="button" aria-pressed="false">
    Sound Off
  </button>
  <button class="audio-volume-button" id="volumeDown" type="button" aria-label="Decrease volume">
    -
  </button>
  <output class="audio-volume-value" id="volumeValue" aria-label="Current volume">
    35%
  </output>
  <button class="audio-volume-button" id="volumeUp" type="button" aria-label="Increase volume">
    +
  </button>
</div>
```

The chip should be smaller than the score chip and should not cover any rabbit.

Visual style:

```css id="du5sco"
.audio-chip {
  position: absolute;
  right: 32px;
  bottom: 32px;
  z-index: 22;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 246, 225, 0.88);
  border: 1px solid rgba(92, 55, 24, 0.24);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
  color: #6b3f1f;
  font-family: "Comic Sans MS", "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif;
  font-size: clamp(13px, 1.1vw, 18px);
  line-height: 1;
}

.audio-chip button,
.audio-chip output {
  font: inherit;
}

.audio-chip button {
  border: 0;
  border-radius: 999px;
  padding: 6px 9px;
  color: #6b3f1f;
  background: rgba(255, 255, 255, 0.44);
  cursor: pointer;
}

.audio-chip button:focus-visible {
  outline: 2px solid #d94a1e;
  outline-offset: 2px;
}

.audio-volume-value {
  min-width: 3.2em;
  text-align: center;
  color: #d94a1e;
  font-weight: 800;
}
```

The audio chip should become slightly more transparent when inactive.

```css id="49w7a4"
.audio-chip[data-enabled="false"] {
  opacity: 0.72;
}
```

---

E00 Audio State Persistence

---

Use a separate local storage key from the pass counter.

```js id="710f1v"
const AUDIO_STORAGE_KEY = "bunnyVolleyball.audio.v1";
```

Persist this state:

```json id="o6xtwa"
{
  "enabled": false,
  "volume": 0.35,
  "music": true,
  "sfx": true
}
```

Rules:

```txt id="iz1ozk"
enabled controls whether the user wants sound.
volume is the master volume, from 0.00 to 1.00.
music remains true in this version.
sfx remains true in this version.
```

Do not automatically produce sound on page load. If `enabled` is saved as true, the UI may show `Sound On`, but actual playback must still wait until the next valid user interaction if the browser requires it.

The first click on the sound toggle must create or resume the `AudioContext`.

The volume buttons should work before audio is started. They should update storage and the visible value immediately.

---

F00 Volume Behavior

---

Default volume:

```txt id="1ntatq"
35%
```

Volume range:

```txt id="dg3xwi"
minimum: 0%
maximum: 100%
step: 5%
```

Use this function:

```js id="xo4f6d"
function clampVolume(value) {
  return Math.max(0, Math.min(1, value));
}

function volumeToLabel(value) {
  return `${Math.round(value * 100)}%`;
}
```

Button behavior:

```txt id="ec9871"
plus button: volume += 0.05
minus button: volume -= 0.05
volume is clamped from 0.00 to 1.00
updated value is saved immediately
```

When volume reaches `0%`, keep `Sound On` if the user has not toggled sound off. Do not silently change enabled state. A user may want sound enabled but volume at zero.

When the user toggles `Sound Off`, stop or fade the music and prevent new SFX until toggled on again.

---

G00 Audio Graph

---

Create one audio engine object. Do not scatter audio nodes throughout animation code.

Required graph:

```txt id="vcjrvl"
AudioContext
  masterGain -> destination
  musicBus -> musicFilter -> masterGain
  sfxBus -> masterGain
```

Recommended setup:

```js id="q9emxe"
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
    if (this.ctx) return;

    this.ctx = new AudioContext();

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
}
```

Use gain ramps when changing volume.

```js id="f6oxwz"
function rampGain(gainNode, target, time = 0.04) {
  const now = gainNode.context.currentTime;
  const safeTarget = Math.max(0.0001, target);

  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(Math.max(0.0001, gainNode.gain.value), now);
  gainNode.gain.linearRampToValueAtTime(safeTarget, now + time);
}
```

Use `0.0001` instead of `0` for exponential-safe fade patterns. If using only `linearRampToValueAtTime`, zero is acceptable, but using a tiny positive minimum makes the helper reusable.

---

H00 Audio Start And Stop Rules

---

Audio must start only through user interaction.

Sound toggle behavior:

```txt id="5vcqb0"
If sound is off and user clicks Sound Off:
  initialize AudioContext if needed
  resume AudioContext if suspended
  set enabled true
  fade masterGain to selected volume
  start music scheduler
  update label to Sound On
  save state

If sound is on and user clicks Sound On:
  set enabled false
  fade masterGain down
  stop scheduler after fade
  update label to Sound Off
  save state
```

Recommended implementation:

```js id="fj30ct"
async function enableAudio() {
  await audioEngine.init();

  if (audioEngine.ctx.state === "suspended") {
    await audioEngine.ctx.resume();
  }

  audioEngine.enabled = true;
  rampGain(audioEngine.masterGain, audioEngine.volume, 0.08);
  audioEngine.startMusic();
  saveAudioState();
  renderAudioControls();
}

function disableAudio() {
  if (!audioEngine.ctx) return;

  audioEngine.enabled = false;
  rampGain(audioEngine.masterGain, 0.0001, 0.12);
  window.setTimeout(() => audioEngine.stopMusic(), 140);
  saveAudioState();
  renderAudioControls();
}
```

Do not create multiple `AudioContext` instances. Use one engine instance for the page.

---

I00 Background Music Design

---

The music should be an original procedural loop called:

```txt id="um0sab"
Backyard Pocket Loop
```

Add this comment near the music constants:

```js id="vx5e3z"
// Backyard Pocket Loop: original procedural 8-bar loop for Bunny Volleyball.
// Style target: calm old-game-inspired background bed.
// No external melody or recording is used.
```

Music parameters:

```txt id="7qccfl"
tempo: 96 BPM
meter: 4/4
loop length: 8 bars
step grid: eighth notes
steps per bar: 8
total loop steps: 64
key center: C major
primary melodic palette: C, D, E, G, A
overall loudness: very low
```

Chord progression:

```txt id="orqemz"
bar 1: C
bar 2: Am
bar 3: F
bar 4: G
bar 5: C
bar 6: Am
bar 7: F
bar 8: G
```

The melody should be simple and sparse. It should have small gaps. It must not play a note on every eighth note.

Recommended melody grid:

```js id="dq8jzq"
const MUSIC = {
  tempoBpm: 96,
  beatsPerBar: 4,
  stepsPerBeat: 2,
  bars: 8,
  lookaheadMs: 25,
  scheduleAheadSec: 0.22
};

const CHORDS = [
  { name: "C",  root: "C3", notes: ["C4", "E4", "G4"] },
  { name: "Am", root: "A2", notes: ["A3", "C4", "E4"] },
  { name: "F",  root: "F2", notes: ["F3", "A3", "C4"] },
  { name: "G",  root: "G2", notes: ["G3", "B3", "D4"] },
  { name: "C",  root: "C3", notes: ["C4", "E4", "G4"] },
  { name: "Am", root: "A2", notes: ["A3", "C4", "E4"] },
  { name: "F",  root: "F2", notes: ["F3", "A3", "C4"] },
  { name: "G",  root: "G2", notes: ["G3", "B3", "D4"] }
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
```

The melody is intentionally plain. Do not add virtuosic runs. The loop should be easy to ignore.

---

J00 Frequency Conversion

---

Use note names for readability and convert to frequency in code.

Recommended implementation:

```js id="fyeeqt"
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

function noteToFrequency(note) {
  const match = /^([A-G][b#]?)(-?\d+)$/.exec(note);
  if (!match) throw new Error(`Invalid note: ${note}`);

  const [, pitch, octaveText] = match;
  const octave = Number(octaveText);
  const midi = 12 * (octave + 1) + NOTE_INDEX[pitch];

  return 440 * 2 ** ((midi - 69) / 12);
}
```

---

K00 Music Voice Design

---

Use four quiet procedural voices.

| Voice  | Role                   | Waveform                                  | Bus      | Relative loudness |
| ------ | ---------------------- | ----------------------------------------- | -------- | ----------------: |
| Melody | Main old-game motif    | triangle with optional quiet square layer | musicBus |             0.026 |
| Arp    | Soft chord color       | sine or triangle                          | musicBus |             0.014 |
| Bass   | Gentle root support    | sine or triangle                          | musicBus |             0.020 |
| Tick   | Very soft time texture | filtered noise                            | musicBus |             0.006 |

The music should be soft enough that the user can leave it on.

Recommended note helper:

```js id="qe6biz"
function scheduleTone({
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
  const ctx = audioEngine.ctx;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const panner = ctx.createStereoPanner();

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
```

Do not keep oscillators alive permanently for individual notes. Create short scheduled source nodes and stop them.

---

L00 Music Scheduler

---

Use a lookahead scheduler. Do not rely on `setInterval` to play notes exactly at the moment they should sound. Use `setInterval` only to schedule future audio events.

Recommended scheduler:

```js id="f8goxw"
BunnyAudioEngine.prototype.startMusic = function startMusic() {
  if (this.schedulerId) return;

  const secondsPerBeat = 60 / MUSIC.tempoBpm;
  const secondsPerStep = secondsPerBeat / MUSIC.stepsPerBeat;

  this.stepIndex = 0;
  this.nextStepTime = this.ctx.currentTime + 0.05;

  this.schedulerId = window.setInterval(() => {
    while (this.nextStepTime < this.ctx.currentTime + MUSIC.scheduleAheadSec) {
      this.scheduleMusicStep(this.stepIndex, this.nextStepTime);

      this.stepIndex = (this.stepIndex + 1) % (MUSIC.bars * MUSIC.beatsPerBar * MUSIC.stepsPerBeat);
      this.nextStepTime += secondsPerStep;
    }
  }, MUSIC.lookaheadMs);
};

BunnyAudioEngine.prototype.stopMusic = function stopMusic() {
  if (!this.schedulerId) return;

  window.clearInterval(this.schedulerId);
  this.schedulerId = null;
};
```

Recommended step scheduling:

```js id="0o1qta"
BunnyAudioEngine.prototype.scheduleMusicStep = function scheduleMusicStep(step, time) {
  const bar = Math.floor(step / 8);
  const stepInBar = step % 8;
  const chord = CHORDS[bar];

  const melodyNote = MELODY_STEPS[step];
  if (melodyNote) {
    scheduleTone({
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
    scheduleTone({
      time,
      frequency: noteToFrequency(chord.root),
      duration: 0.34,
      type: "sine",
      gain: 0.020,
      destination: this.musicBus,
      pan: -0.08
    });
  }

  if (stepInBar === 2 || stepInBar === 5) {
    const note = chord.notes[(stepInBar === 2 ? 0 : 2)];
    scheduleTone({
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
};
```

The scheduler should keep looping forever while audio is enabled.

---

M00 Soft Tick Voice

---

The tick voice should be barely audible. It should not sound like a drum kit.

Use generated noise, filtered and extremely short.

```js id="r0j39z"
BunnyAudioEngine.prototype.createNoiseBuffer = function createNoiseBuffer(durationSec = 0.08) {
  const sampleRate = this.ctx.sampleRate;
  const frameCount = Math.floor(sampleRate * durationSec);
  const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

BunnyAudioEngine.prototype.scheduleSoftTick = function scheduleSoftTick(time) {
  if (!this.ctx || !this.musicBus) return;

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
};
```

If this tick makes the loop feel busy, remove it. Music must remain calm.

---

N00 Game Sound Effects

---

Add three categories of sound effects.

| Event                        | Sound                 | Purpose                                  | Loudness |
| ---------------------------- | --------------------- | ---------------------------------------- | -------: |
| Pass starts                  | Soft launch whoop     | Confirms the ball has left a rabbit      | Very low |
| Ball in flight               | Short airy whoosh     | Suggests motion, especially on long pass | Very low |
| Rabbit contact/pass complete | Tiny pop-chime        | Confirms hit and score increment         |      Low |
| Milestone every 10 passes    | Soft two-note sparkle | Rewards continuity without spam          | Very low |

Do not add separate loud sounds for every visual detail. The hit sound and score increment may be one combined sound.

SFX should respect the master volume and should not play when sound is disabled.

---

O00 Pass Launch Sound

---

Trigger at the beginning of each pass.

Design:

```txt id="2w9y32"
duration: 90 ms
waveform: triangle
pitch movement: 260 Hz to 390 Hz
gain: 0.018
pan: based on sender x position
```

Example:

```js id="mjm0xm"
BunnyAudioEngine.prototype.playLaunch = function playLaunch(senderName) {
  if (!this.canPlaySfx()) return;

  const now = this.ctx.currentTime;
  const sender = RABBITS[senderName];
  const pan = xToPan(sender.center.x);

  const osc = this.ctx.createOscillator();
  const amp = this.ctx.createGain();
  const panner = this.ctx.createStereoPanner();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.linearRampToValueAtTime(390, now + 0.09);

  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.linearRampToValueAtTime(0.018, now + 0.01);
  amp.gain.linearRampToValueAtTime(0.0001, now + 0.09);

  panner.pan.setValueAtTime(pan, now);

  osc.connect(amp);
  amp.connect(panner);
  panner.connect(this.sfxBus);

  osc.start(now);
  osc.stop(now + 0.11);
};
```

Pan conversion:

```js id="qd4y7s"
function xToPan(x) {
  return Math.max(-0.65, Math.min(0.65, (x / SCENE.width) * 2 - 1));
}
```

Do not pan fully hard-left or hard-right. Keep the range gentle.

---

P00 Flight Whoosh Sound

---

Trigger once per pass, not continuously every frame.

Design:

```txt id="ztl1zu"
duration: 260 ms to 520 ms depending on pass length
source: generated noise buffer
filter: bandpass or lowpass sweep
gain: 0.010 to 0.018
pan: interpolate from sender to receiver
```

Use this only if it remains subtle. The page should still feel pleasant if the ball passes every two seconds.

Recommended behavior:

```txt id="ql0i21"
left-to-middle: 260 ms whoosh
middle-to-right: 300 ms whoosh
right-to-left: 520 ms whoosh
```

Example:

```js id="yjftmc"
BunnyAudioEngine.prototype.playWhoosh = function playWhoosh(pass) {
  if (!this.canPlaySfx()) return;

  const now = this.ctx.currentTime;
  const duration = pass.id === "right-to-left" ? 0.52 : 0.30;

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
};
```

Do not call this from every animation frame. Call it once when a new pass segment starts.

---

Q00 Rabbit Hit And Score Sound

---

Trigger when the pass completes and the receiving rabbit gets the contact effect.

Design:

```txt id="igrttk"
duration: 130 ms
sound: soft pop plus tiny chime
base pitch: receiver-specific
gain: 0.030 maximum
pan: based on receiver x position
```

Receiver pitch map:

```js id="lndrun"
const HIT_PITCH = {
  left: 540,
  middle: 620,
  right: 700
};
```

Example:

```js id="77npzk"
BunnyAudioEngine.prototype.playHit = function playHit(receiverName) {
  if (!this.canPlaySfx()) return;

  const now = this.ctx.currentTime;
  const rabbit = RABBITS[receiverName];
  const pan = xToPan(rabbit.center.x);
  const base = HIT_PITCH[receiverName] || 620;

  scheduleTone({
    time: now,
    frequency: base,
    duration: 0.055,
    type: "triangle",
    gain: 0.030,
    destination: this.sfxBus,
    pan,
    attack: 0.004,
    release: 0.055
  });

  scheduleTone({
    time: now + 0.035,
    frequency: base * 1.5,
    duration: 0.050,
    type: "sine",
    gain: 0.014,
    destination: this.sfxBus,
    pan,
    attack: 0.004,
    release: 0.060
  });
};
```

This sound should represent both rabbit contact and normal pass counter increment. Do not add a second score sound on every pass.

---

R00 Milestone Sound

---

Every 10 completed passes, add a very soft two-note sparkle.

Rules:

```txt id="m1x0bx"
play only when completedPasses % 10 === 0
do not play at pass 0
gain must be lower than hit sound
duration must be under 300 ms
```

Example:

```js id="47nw9d"
BunnyAudioEngine.prototype.playMilestone = function playMilestone(completedPasses) {
  if (!this.canPlaySfx()) return;
  if (completedPasses <= 0 || completedPasses % 10 !== 0) return;

  const now = this.ctx.currentTime;

  scheduleTone({
    time: now,
    frequency: noteToFrequency("C6"),
    duration: 0.08,
    type: "sine",
    gain: 0.012,
    destination: this.sfxBus,
    pan: 0,
    attack: 0.006,
    release: 0.08
  });

  scheduleTone({
    time: now + 0.09,
    frequency: noteToFrequency("G6"),
    duration: 0.10,
    type: "sine",
    gain: 0.010,
    destination: this.sfxBus,
    pan: 0,
    attack: 0.006,
    release: 0.10
  });
};
```

Do not play milestone sounds every pass. They should be rare.

---

S00 Connecting Audio To Existing Animation

---

The visual animation already computes active pass and completed pass count. Audio should subscribe to those state transitions.

Track:

```js id="a6axts"
let lastPassId = null;
let lastCompletedPasses = null;
```

Inside the animation loop:

```js id="peeg63"
function syncAudioWithGame(activePass, completedPasses) {
  if (!audioEngine || !audioEngine.enabled) return;

  if (activePass.id !== lastPassId) {
    audioEngine.playLaunch(activePass.from);
    audioEngine.playWhoosh(activePass);
    lastPassId = activePass.id;
  }

  if (completedPasses !== lastCompletedPasses) {
    if (lastCompletedPasses !== null && completedPasses > lastCompletedPasses) {
      const receivingPass = getPassThatJustCompleted(completedPasses);
      audioEngine.playHit(receivingPass.to);
      audioEngine.playMilestone(completedPasses);
    }

    lastCompletedPasses = completedPasses;
  }
}
```

Implement `getPassThatJustCompleted` carefully. Completed pass 1 means `left-to-middle` completed, so receiver is `middle`. Completed pass 2 means `middle-to-right` completed, so receiver is `right`. Completed pass 3 means `right-to-left` completed, so receiver is `left`.

Example:

```js id="9skzsw"
function getPassThatJustCompleted(completedPasses) {
  const index = (completedPasses - 1) % PASSES.length;
  return PASSES[index];
}
```

Do not play sounds on initial load for all missed passes. If the stored pass count advanced while the page was closed, the page should not burst out a backlog of sounds. Only play sounds for live pass changes after the page has initialized.

---

T00 Audio Reduced-Motion And Accessibility Policy

---

Respect reduced-motion and user preference.

For `prefers-reduced-motion: reduce`:

```txt id="r3rlql"
music may remain available
SFX volume should be multiplied by 0.65
whoosh should be disabled
milestone sound should remain optional but quieter
auto-follow remains disabled as already specified
```

Add a separate reduced audio flag:

```js id="j3cbtw"
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sfxScale = prefersReducedMotion ? 0.65 : 1;
const whooshEnabled = !prefersReducedMotion;
```

Accessibility rules:

```txt id="nx403g"
Sound toggle must be keyboard reachable.
Plus and minus buttons must be keyboard reachable.
Buttons must have clear aria labels.
Do not use a live region for every pass sound.
Do not start audio from hover.
```

The audio chip must not trap focus. It should be simple tab-order controls.

---

U00 CSS Integration With Existing UI

---

The audio chip must not visually compete with the score chip.

Stacking:

```txt id="zq7xik"
score chip z-index: 20
audio chip z-index: 22
ball z-index: 16
effects layer z-index: 15
```

If the audio chip overlaps the ball during right-side passes, move the audio chip to the lower-left corner on narrow screens.

Responsive rule:

```css id="nwu4td"
@media (max-width: 700px) {
  .audio-chip {
    right: 12px;
    bottom: 12px;
    gap: 5px;
    padding: 6px 7px;
    font-size: 13px;
  }

  .audio-chip button {
    padding: 5px 7px;
  }
}
```

Portrait scroll mode rule:

```css id="8pv7jb"
@media (orientation: portrait) and (max-width: 700px) {
  .audio-chip {
    position: fixed;
    right: 12px;
    bottom: 12px;
  }
}
```

If fixed positioning is used in portrait, ensure the chip stays above the scrollable scene and does not block browser controls.

---

V00 Updated Implementation Work Plan

---

The coding agent should extend the existing project plan with these steps.

| Step | Action                                                                              |
| ---: | ----------------------------------------------------------------------------------- |
|    1 | Keep the existing visual implementation unchanged except for adding audio controls. |
|    2 | Add the audio chip markup to `index.html`.                                          |
|    3 | Add audio chip styles to `styles.css`.                                              |
|    4 | Add audio state loading and saving with `bunnyVolleyball.audio.v1`.                 |
|    5 | Add one `BunnyAudioEngine` class to the existing JavaScript.                        |
|    6 | Build the Web Audio graph only after a user gesture.                                |
|    7 | Implement the procedural music scheduler.                                           |
|    8 | Implement `playLaunch`, `playWhoosh`, `playHit`, and `playMilestone`.               |
|    9 | Connect audio events to pass-start and pass-complete transitions.                   |
|   10 | Add reduced-motion handling for audio.                                              |
|   11 | Validate that no sound plays before user activation.                                |
|   12 | Validate that no external audio assets or libraries were added.                     |

---

W00 Updated File Output Rules

---

The project file structure remains:

```txt id="45s9fi"
D:.
|   index.html
|   styles.css
|
+---assets
|       bunny_original.png
|
\---specs
        bunny_mockup.png
        bunny_original.png
        design_spec.md
```

Do not add audio files.

Do not add a package manager.

Do not add any CDN references.

The complete audio implementation should live inside the existing JavaScript in `index.html`, unless the project later decides to split JavaScript into a separate local file.

---

X00 Updated Acceptance Checklist For Audio

---

The coding agent must validate these checks before reporting audio work complete.

| Check                   | Required verification                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Audio control exists    | Verify the page includes a visible sound chip, and verify the chip contains a sound toggle, minus button, volume display, and plus button.      |
| No autoplay             | Verify no audible sound plays on page load, and verify audio starts only after click, tap, or keyboard activation.                              |
| Web Audio API use       | Verify the implementation uses `AudioContext`, and verify it does not import any external audio library.                                        |
| No audio assets         | Verify no MP3, WAV, OGG, or remote audio file is used, and verify music and SFX are generated procedurally.                                     |
| Audio graph             | Verify there is one master gain path to destination, and verify music and SFX have separate gain buses.                                         |
| Volume persistence      | Verify volume is saved under `bunnyVolleyball.audio.v1`, and verify refresh preserves the displayed volume value.                               |
| Volume controls         | Verify plus increases volume by 5%, and verify minus decreases volume by 5% with clamping from 0% to 100%.                                      |
| Toggle persistence      | Verify the enabled state is saved, and verify saved enabled state does not bypass browser user-activation requirements.                         |
| Music loop              | Verify music loops continuously after sound is enabled, and verify the loop is procedural rather than a copied or loaded song.                  |
| Music restraint         | Verify music is quiet relative to visual focus, and verify it does not use aggressive drums or loud arcade melodies.                            |
| Pass launch SFX         | Verify a launch sound plays once at the beginning of a pass, and verify it does not replay every animation frame.                               |
| Whoosh SFX              | Verify the whoosh is short and subtle, and verify it is disabled or reduced under reduced-motion preference.                                    |
| Rabbit hit SFX          | Verify a hit sound plays when a pass completes, and verify its stereo pan follows the receiving rabbit position.                                |
| Score milestone SFX     | Verify milestone sparkle plays only every 10 passes, and verify it does not play on pass 0 or every pass.                                       |
| No backlog sounds       | Verify refresh does not play missed sounds for old stored passes, and verify sounds are only emitted for live transitions after initialization. |
| Gain smoothing          | Verify volume changes use ramps or smoothing, and verify changing volume does not create audible clicks.                                        |
| Keyboard accessibility  | Verify every audio button is reachable by keyboard, and verify every button has a clear accessible label or text.                               |
| Visual restraint        | Verify the audio chip does not cover any rabbit, and verify it is smaller and less visually dominant than the score chip.                       |
| Portrait behavior       | Verify the audio chip remains reachable in portrait mode, and verify it does not block the main rabbit/ball interaction area.                   |
| Sound-off behavior      | Verify toggling sound off fades or stops music, and verify no new SFX play while sound is disabled.                                             |
| Reduced-motion behavior | Verify reduced-motion mode reduces audio intensity, and verify the game remains understandable with reduced audio effects.                      |
| Completion report       | Verify every audio checklist item was tested, and verify completion is not reported if any audio behavior is missing.                           |

---

Y00 Updated Completion Report Format

---

When the coding agent finishes audio implementation, report:

```txt id="klk2zi"
Implemented Bunny Volleyball audio layer.

Created or updated:
- index.html
- styles.css

Verified:
- sound chip appears
- audio starts only after user interaction
- procedural music loop plays
- pass launch, whoosh, hit, and milestone SFX work
- volume plus/minus controls work
- audio state persists in localStorage
- no external audio files or libraries are used
- reduced-motion audio behavior is implemented
- audio chip remains non-distracting and responsive

Acceptance checklist:
- all audio checks passed
```

If any check fails, report the failed check and the exact fix needed.
