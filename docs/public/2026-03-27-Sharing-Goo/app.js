const CONFIG = {
    storage: {
        itemsKey: "sharing-goo-items-v1",
        muteKey: "sharing-goo-muted-v1",
    },
    scene: {
        maxDpr: 2,
        desktopMargin: 22,
        mobileMargin: 16,
        portraitSwitchRatio: 1.06,
        hintFadeAfterMs: 12000,
    },
    simulation: {
        gridLandscape: 92,
        gridPortrait: 76,
        stiffness: 0.11,
        damping: 0.968,
        edgeDamping: 0.78,
        pointerLag: 10.5,
        pointerRadius: 0.16,
        pointerLift: 0.00155,
        pointerWake: 0.00165,
        dragRadius: 0.2,
        dragLift: 0.0011,
        impactRadius: 0.18,
        impactStrength: 0.024,
        idleLift: 0.00022,
        idleSpeed: 0.55,
    },
    sink: {
        floatMs: 45 * 60 * 1000,
        lostMs: 24 * 60 * 60 * 1000,
    },
    tokens: {
        maxVisible: 24,
        baseFontPx: 14,
        minWidthPx: 88,
        maxWidthPx: 184,
        heightPx: 30,
        driftAmplitude: 0.046,
        depthShiftPx: 34,
        hoverLiftPx: 8,
    },
    audio: {
        masterGain: 0.055,
        droneGain: 0.026,
        noiseGain: 0.014,
        impactGain: 0.18,
    },
    palette: {
        valley: [29, 5, 30],
        deep: [62, 8, 48],
        mid: [136, 22, 95],
        high: [219, 62, 170],
        spark: [255, 181, 228],
    },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
    return t * t * (3 - 2 * t);
};

const cssColor = (rgb, alpha = 1) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

function hashString(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
}

function randomFromSeed(seed) {
    let value = Math.floor(seed * 2147483647) || 1;
    return () => {
        value ^= value << 13;
        value ^= value >>> 17;
        value ^= value << 5;
        return ((value >>> 0) % 10000) / 10000;
    };
}

function normalizeUrl(text) {
    if (!text) {
        return null;
    }
    const trimmed = text.trim().split(/\s+/)[0];
    if (!trimmed) {
        return null;
    }
    try {
        const url = new URL(trimmed);
        if (!/^https?:$/.test(url.protocol)) {
            return null;
        }
        return url.toString();
    } catch (error) {
        return null;
    }
}

function labelFromUrl(urlText) {
    const url = new URL(urlText);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    const summary = `${host}${path}` || urlText;
    if (summary.length <= 26) {
        return summary;
    }
    return `${summary.slice(0, 23)}...`;
}

function getUrlFromDataTransfer(dataTransfer) {
    if (!dataTransfer) {
        return null;
    }
    const uriList = dataTransfer.getData("text/uri-list");
    const plain = dataTransfer.getData("text/plain");
    return normalizeUrl(uriList || plain);
}

function nowMs() {
    return Date.now();
}

class VesselGeometry {
    constructor() {
        this.mode = "well";
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.outerRadius = 0;
        this.innerRadius = 0;
        this.rimWidth = 0;
        this.innerRect = null;
        this.outerRect = null;
        this.capsuleRadius = 0;
        this.capsuleBodyHalf = 0;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.mode = height / width > CONFIG.scene.portraitSwitchRatio ? "cistern" : "well";
        const margin = this.mode === "well" ? CONFIG.scene.desktopMargin : CONFIG.scene.mobileMargin;

        this.centerX = width * 0.5;
        this.centerY = height * 0.5;

        if (this.mode === "well") {
            this.outerRadius = Math.max(120, Math.min(width, height) * 0.48 - margin);
            this.rimWidth = this.outerRadius * 0.145;
            this.innerRadius = this.outerRadius - this.rimWidth;
            this.outerRect = {
                x: this.centerX - this.outerRadius,
                y: this.centerY - this.outerRadius,
                width: this.outerRadius * 2,
                height: this.outerRadius * 2,
            };
            this.innerRect = {
                x: this.centerX - this.innerRadius,
                y: this.centerY - this.innerRadius,
                width: this.innerRadius * 2,
                height: this.innerRadius * 2,
            };
            return;
        }

        const outerWidth = Math.min(width - margin * 2, width * 0.84);
        const outerHeight = Math.min(height - margin * 2, height * 0.94);
        this.rimWidth = Math.max(16, Math.min(outerWidth, outerHeight) * 0.085);
        this.outerRect = {
            x: this.centerX - outerWidth / 2,
            y: this.centerY - outerHeight / 2,
            width: outerWidth,
            height: outerHeight,
        };
        this.innerRect = {
            x: this.outerRect.x + this.rimWidth,
            y: this.outerRect.y + this.rimWidth,
            width: outerWidth - this.rimWidth * 2,
            height: outerHeight - this.rimWidth * 2,
        };
        this.capsuleRadius = this.innerRect.width * 0.5;
        this.capsuleBodyHalf = Math.max(0, this.innerRect.height * 0.5 - this.capsuleRadius);
    }

    appendShape(ctx, rect) {
        if (this.mode === "well") {
            ctx.moveTo(this.centerX + rect.width * 0.5, this.centerY);
            ctx.arc(this.centerX, this.centerY, rect.width * 0.5, 0, Math.PI * 2);
            return;
        }
        const radius = rect.width * 0.5;
        const centerX = rect.x + rect.width * 0.5;
        const topCenterY = rect.y + radius;
        const bottomCenterY = rect.y + rect.height - radius;
        ctx.moveTo(centerX - radius, topCenterY);
        ctx.arc(centerX, topCenterY, radius, Math.PI, 0);
        ctx.lineTo(rect.x + rect.width, bottomCenterY);
        ctx.arc(centerX, bottomCenterY, radius, 0, Math.PI);
        ctx.closePath();
    }

    traceOuter(ctx) {
        ctx.beginPath();
        this.appendShape(ctx, this.outerRect);
    }

    traceInner(ctx) {
        ctx.beginPath();
        this.appendShape(ctx, this.innerRect);
    }

    traceRing(ctx) {
        ctx.beginPath();
        this.appendShape(ctx, this.outerRect);
        this.appendShape(ctx, this.innerRect);
    }

    clipInner(ctx) {
        this.traceInner(ctx);
        ctx.clip();
    }

    containsNormalized(nx, ny) {
        if (this.mode === "well") {
            return nx * nx + ny * ny <= 1;
        }
        const x = nx * (this.innerRect.width * 0.5);
        const y = ny * (this.innerRect.height * 0.5);
        const halfWidth = this.innerRect.width * 0.5;
        const radius = this.capsuleRadius;
        const bodyHalf = this.capsuleBodyHalf;
        if (Math.abs(y) <= bodyHalf) {
            return Math.abs(x) <= halfWidth;
        }
        const centerY = y < 0 ? -bodyHalf : bodyHalf;
        return x * x + (y - centerY) * (y - centerY) <= radius * radius;
    }

    clampNormalized(nx, ny) {
        if (this.containsNormalized(nx, ny)) {
            return { nx, ny };
        }
        if (this.mode === "well") {
            const length = Math.hypot(nx, ny) || 1;
            return {
                nx: (nx / length) * 0.985,
                ny: (ny / length) * 0.985,
            };
        }
        const halfWidth = this.innerRect.width * 0.5;
        const halfHeight = this.innerRect.height * 0.5;
        const radius = this.capsuleRadius;
        const bodyHalf = this.capsuleBodyHalf;
        let x = nx * halfWidth;
        let y = ny * halfHeight;
        if (Math.abs(y) <= bodyHalf) {
            x = clamp(x, -halfWidth * 0.985, halfWidth * 0.985);
            y = clamp(y, -bodyHalf, bodyHalf);
        } else {
            const centerY = y < 0 ? -bodyHalf : bodyHalf;
            const vectorX = x;
            const vectorY = y - centerY;
            const length = Math.hypot(vectorX, vectorY) || 1;
            x = (vectorX / length) * radius * 0.985;
            y = centerY + (vectorY / length) * radius * 0.985;
        }
        return {
            nx: x / halfWidth,
            ny: y / halfHeight,
        };
    }

    canvasToNormalized(x, y) {
        const halfWidth = this.innerRect.width * 0.5;
        const halfHeight = this.innerRect.height * 0.5;
        const nx = (x - (this.innerRect.x + halfWidth)) / halfWidth;
        const ny = (y - (this.innerRect.y + halfHeight)) / halfHeight;
        return this.clampNormalized(nx, ny);
    }

    normalizedToCanvas(nx, ny) {
        const halfWidth = this.innerRect.width * 0.5;
        const halfHeight = this.innerRect.height * 0.5;
        return {
            x: this.innerRect.x + halfWidth + nx * halfWidth,
            y: this.innerRect.y + halfHeight + ny * halfHeight,
        };
    }

    edgeFactor(nx, ny) {
        if (this.mode === "well") {
            return clamp(Math.hypot(nx, ny), 0, 1);
        }
        const x = nx * (this.innerRect.width * 0.5);
        const y = ny * (this.innerRect.height * 0.5);
        const halfWidth = this.innerRect.width * 0.5;
        const radius = this.capsuleRadius;
        const bodyHalf = this.capsuleBodyHalf;
        if (Math.abs(y) <= bodyHalf) {
            return clamp(Math.abs(x) / halfWidth, 0, 1);
        }
        const centerY = y < 0 ? -bodyHalf : bodyHalf;
        return clamp(Math.hypot(x, y - centerY) / radius, 0, 1);
    }
}

class AudioEngine {
    constructor(onState) {
        this.onState = onState;
        this.context = null;
        this.master = null;
        this.filter = null;
        this.droneGain = null;
        this.noiseGain = null;
        this.noiseSource = null;
        this.lfo = null;
        this.lfoDepth = null;
        this.unlocked = false;
        this.muted = this.readMute();
    }

    readMute() {
        try {
            return localStorage.getItem(CONFIG.storage.muteKey) === "true";
        } catch (error) {
            return false;
        }
    }

    writeMute() {
        try {
            localStorage.setItem(CONFIG.storage.muteKey, String(this.muted));
        } catch (error) {
            // Ignore storage failures.
        }
    }

    async unlock() {
        if (!this.context) {
            this.buildGraph();
        }
        if (!this.context) {
            return;
        }
        if (this.context.state !== "running") {
            await this.context.resume();
        }
        this.unlocked = true;
        this.applyMute();
        this.onState();
    }

    buildGraph() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }

        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = 0;
        this.filter = this.context.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.frequency.value = 180;
        this.filter.Q.value = 0.6;

        this.droneGain = this.context.createGain();
        this.droneGain.gain.value = CONFIG.audio.droneGain;
        this.noiseGain = this.context.createGain();
        this.noiseGain.gain.value = CONFIG.audio.noiseGain;

        const oscA = this.context.createOscillator();
        oscA.type = "triangle";
        oscA.frequency.value = 51;

        const oscB = this.context.createOscillator();
        oscB.type = "sine";
        oscB.frequency.value = 77.5;

        const oscBGain = this.context.createGain();
        oscBGain.gain.value = 0.48;

        oscA.connect(this.droneGain);
        oscB.connect(oscBGain);
        oscBGain.connect(this.droneGain);
        this.droneGain.connect(this.filter);

        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = this.createNoiseBuffer();
        noiseSource.loop = true;
        const noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 120;
        noiseFilter.Q.value = 0.7;
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(this.filter);

        this.lfo = this.context.createOscillator();
        this.lfo.type = "sine";
        this.lfo.frequency.value = 0.06;
        this.lfoDepth = this.context.createGain();
        this.lfoDepth.gain.value = 18;
        this.lfo.connect(this.lfoDepth);
        this.lfoDepth.connect(this.filter.frequency);

        this.filter.connect(this.master);
        this.master.connect(this.context.destination);

        oscA.start();
        oscB.start();
        noiseSource.start();
        this.lfo.start();

        this.noiseSource = noiseSource;
    }

    createNoiseBuffer() {
        const length = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let index = 0; index < length; index += 1) {
            const t = index / length;
            data[index] = (Math.random() * 2 - 1) * (0.7 + Math.sin(t * Math.PI * 10) * 0.08);
        }
        return buffer;
    }

    applyMute() {
        if (!this.master) {
            return;
        }
        const target = this.unlocked && !this.muted ? CONFIG.audio.masterGain : 0;
        this.master.gain.cancelScheduledValues(this.context.currentTime);
        this.master.gain.linearRampToValueAtTime(target, this.context.currentTime + 0.18);
        this.writeMute();
        this.onState();
    }

    toggleMute() {
        this.muted = !this.muted;
        this.applyMute();
    }

    setEnergy(energy) {
        if (!this.context || !this.unlocked || this.muted) {
            return;
        }
        const time = this.context.currentTime;
        this.filter.frequency.setTargetAtTime(170 + energy * 260, time, 0.12);
        this.droneGain.gain.setTargetAtTime(CONFIG.audio.droneGain + energy * 0.015, time, 0.18);
        this.noiseGain.gain.setTargetAtTime(CONFIG.audio.noiseGain + energy * 0.01, time, 0.24);
    }

    impact(strength = 1) {
        if (!this.context || !this.unlocked || this.muted) {
            return;
        }
        const time = this.context.currentTime;
        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(CONFIG.audio.impactGain * strength, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.48);

        const osc = this.context.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(142, time);
        osc.frequency.exponentialRampToValueAtTime(64, time + 0.36);

        const plunkFilter = this.context.createBiquadFilter();
        plunkFilter.type = "lowpass";
        plunkFilter.frequency.value = 540;
        osc.connect(plunkFilter);
        plunkFilter.connect(gain);
        gain.connect(this.master);

        const burst = this.context.createBufferSource();
        burst.buffer = this.createNoiseBuffer();
        const burstFilter = this.context.createBiquadFilter();
        burstFilter.type = "bandpass";
        burstFilter.frequency.value = 780;
        const burstGain = this.context.createGain();
        burstGain.gain.setValueAtTime(0.0001, time);
        burstGain.gain.exponentialRampToValueAtTime(0.03 * strength, time + 0.01);
        burstGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
        burst.connect(burstFilter);
        burstFilter.connect(burstGain);
        burstGain.connect(this.master);

        osc.start(time);
        osc.stop(time + 0.5);
        burst.start(time);
        burst.stop(time + 0.24);
    }
}

class SharingGooScene {
    constructor() {
        this.app = document.getElementById("app");
        this.canvas = document.getElementById("scene");
        this.ctx = this.canvas.getContext("2d");
        this.hint = document.getElementById("hint-text");
        this.pasteTrap = document.getElementById("paste-trap");
        this.pasteButton = document.getElementById("paste-button");
        this.muteButton = document.getElementById("mute-button");
        this.status = document.getElementById("status");
        this.accessibleLinks = document.getElementById("accessible-links");

        this.geometry = new VesselGeometry();
        this.audio = new AudioEngine(() => this.syncAudioButton());
        this.staticCanvas = document.createElement("canvas");
        this.staticCtx = this.staticCanvas.getContext("2d");
        this.liquidCanvas = document.createElement("canvas");
        this.liquidCtx = this.liquidCanvas.getContext("2d");
        this.tokenRects = [];
        this.pointer = {
            active: false,
            inside: false,
            target: { nx: 0, ny: 0 },
            lag: { nx: 0, ny: 0 },
            lastLag: { nx: 0, ny: 0 },
            lastMoveAt: 0,
        };
        this.dragState = {
            active: false,
            nx: 0,
            ny: 0,
            lastSeenAt: 0,
        };
        this.energy = 0;
        this.lastFrame = performance.now();
        this.dpr = 1;
        this.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.reducedMotion = this.reducedMotionQuery.matches;
        this.items = this.loadItems();
        this.sim = null;
        this.hintMuted = false;
        this.bindEvents();
        this.syncAudioButton();
        this.refreshAccessibleLinks();
        this.resize();
        requestAnimationFrame((time) => this.frame(time));
    }

    bindEvents() {
        window.addEventListener("resize", () => this.resize());
        if (this.reducedMotionQuery.addEventListener) {
            this.reducedMotionQuery.addEventListener("change", (event) => {
                this.reducedMotion = event.matches;
            });
        }

        this.app.addEventListener("pointermove", (event) => this.onPointerMove(event));
        this.app.addEventListener("pointerleave", () => {
            this.pointer.inside = false;
        });
        this.app.addEventListener("pointerdown", (event) => {
            this.unlockAudio();
            this.app.focus({ preventScroll: true });
            this.onPointerMove(event);
        });
        this.app.addEventListener("click", (event) => this.onClick(event));
        this.app.addEventListener("paste", (event) => this.onPaste(event));
        this.pasteTrap.addEventListener("paste", (event) => this.onPaste(event));

        this.app.addEventListener("keydown", (event) => {
            if (event.key.toLowerCase() === "m") {
                this.unlockAudio();
                this.audio.toggleMute();
            }
            if (event.key === "Enter") {
                this.pasteTrap.focus({ preventScroll: true });
            }
        });

        this.pasteButton.addEventListener("click", () => {
            this.app.focus({ preventScroll: true });
            this.announce("Paste a URL now.");
        });

        this.muteButton.addEventListener("click", async () => {
            await this.unlockAudio();
            this.audio.toggleMute();
        });

        window.addEventListener("dragover", (event) => this.onDragOver(event));
        window.addEventListener("drop", (event) => this.onDrop(event));
        window.addEventListener("dragend", () => {
            this.dragState.active = false;
        });
    }

    async unlockAudio() {
        try {
            await this.audio.unlock();
        } catch (error) {
            // Ignore audio unlock failures.
        }
    }

    syncAudioButton() {
        const { muted, unlocked } = this.audio;
        this.muteButton.dataset.muted = String(!muted && unlocked);
        this.muteButton.setAttribute("aria-pressed", String(!muted && unlocked));
        this.muteButton.textContent = !unlocked || muted ? "Sound off" : "Sound on";
    }

    announce(message) {
        this.status.textContent = "";
        window.setTimeout(() => {
            this.status.textContent = message;
        }, 20);
    }

    loadItems() {
        try {
            const raw = localStorage.getItem(CONFIG.storage.itemsKey);
            if (!raw) {
                return [];
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed.filter((item) => item && item.url && item.id).slice(-64);
        } catch (error) {
            return [];
        }
    }

    saveItems() {
        try {
            localStorage.setItem(CONFIG.storage.itemsKey, JSON.stringify(this.items.slice(-64)));
        } catch (error) {
            // Ignore storage failures.
        }
    }

    refreshAccessibleLinks() {
        this.accessibleLinks.replaceChildren();
        const fragment = document.createDocumentFragment();
        this.items
            .slice()
            .reverse()
            .forEach((item) => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = item.url;
                a.target = "_blank";
                a.rel = "noreferrer";
                a.textContent = item.label;
                li.appendChild(a);
                fragment.appendChild(li);
            });
        this.accessibleLinks.appendChild(fragment);
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, CONFIG.scene.maxDpr);
        this.canvas.width = Math.round(width * this.dpr);
        this.canvas.height = Math.round(height * this.dpr);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.staticCanvas.width = this.canvas.width;
        this.staticCanvas.height = this.canvas.height;
        this.staticCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.geometry.resize(width, height);
        this.buildStaticScene();
        this.buildSimulation();
    }

    buildSimulation() {
        const landscapeGrid = this.reducedMotion ? CONFIG.simulation.gridLandscape - 16 : CONFIG.simulation.gridLandscape;
        const portraitGrid = this.reducedMotion ? CONFIG.simulation.gridPortrait - 12 : CONFIG.simulation.gridPortrait;
        const cols = this.geometry.mode === "well" ? landscapeGrid : portraitGrid;
        const rows = clamp(Math.round(cols * (this.geometry.innerRect.height / this.geometry.innerRect.width)), 54, 132);
        const size = cols * rows;
        const mask = new Uint8Array(size);
        const edge = new Float32Array(size);
        const height = new Float32Array(size);
        const velocity = new Float32Array(size);
        const aspect = this.geometry.innerRect.width / this.geometry.innerRect.height;

        for (let y = 0; y < rows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const nx = cols === 1 ? 0 : (x / (cols - 1)) * 2 - 1;
                const ny = rows === 1 ? 0 : (y / (rows - 1)) * 2 - 1;
                const index = y * cols + x;
                if (this.geometry.containsNormalized(nx, ny)) {
                    mask[index] = 1;
                    edge[index] = this.geometry.edgeFactor(nx, ny);
                }
            }
        }

        this.liquidCanvas.width = cols;
        this.liquidCanvas.height = rows;
        this.sim = {
            cols,
            rows,
            mask,
            edge,
            height,
            velocity,
            image: this.liquidCtx.createImageData(cols, rows),
            aspect,
        };
    }

    buildStaticScene() {
        const ctx = this.staticCtx;
        const { width, height } = this.geometry;
        ctx.clearRect(0, 0, width, height);

        const backdrop = ctx.createRadialGradient(
            width * 0.5,
            height * 0.45,
            Math.min(width, height) * 0.08,
            width * 0.5,
            height * 0.52,
            Math.max(width, height) * 0.66
        );
        backdrop.addColorStop(0, "rgba(28, 12, 24, 0.45)");
        backdrop.addColorStop(0.52, "rgba(9, 6, 10, 0.78)");
        backdrop.addColorStop(1, "rgba(3, 2, 4, 1)");
        ctx.fillStyle = backdrop;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        this.geometry.traceOuter(ctx);
        ctx.shadowColor = "rgba(0, 0, 0, 0.48)";
        ctx.shadowBlur = this.geometry.rimWidth * 1.8;
        ctx.shadowOffsetY = this.geometry.rimWidth * 0.22;
        ctx.fillStyle = "rgba(13, 11, 12, 0.94)";
        ctx.fill();
        ctx.restore();

        const ringGradient = ctx.createLinearGradient(
            this.geometry.outerRect.x,
            this.geometry.outerRect.y,
            this.geometry.outerRect.x + this.geometry.outerRect.width,
            this.geometry.outerRect.y + this.geometry.outerRect.height
        );
        ringGradient.addColorStop(0, "rgba(112, 99, 89, 0.94)");
        ringGradient.addColorStop(0.28, "rgba(68, 59, 54, 0.96)");
        ringGradient.addColorStop(0.62, "rgba(42, 35, 34, 0.98)");
        ringGradient.addColorStop(1, "rgba(93, 79, 71, 0.9)");

        ctx.save();
        this.geometry.traceRing(ctx);
        ctx.fillStyle = ringGradient;
        ctx.fill("evenodd");
        ctx.restore();

        this.paintStoneTexture(ctx);

        ctx.save();
        this.geometry.traceInner(ctx);
        ctx.strokeStyle = "rgba(7, 5, 8, 0.82)";
        ctx.lineWidth = this.geometry.rimWidth * 0.54;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        this.geometry.traceInner(ctx);
        ctx.clip();
        const throat = ctx.createRadialGradient(
            this.geometry.centerX,
            this.geometry.centerY,
            Math.min(this.geometry.innerRect.width, this.geometry.innerRect.height) * 0.12,
            this.geometry.centerX,
            this.geometry.centerY,
            Math.max(this.geometry.innerRect.width, this.geometry.innerRect.height) * 0.55
        );
        throat.addColorStop(0, "rgba(6, 3, 8, 0)");
        throat.addColorStop(0.68, "rgba(9, 6, 12, 0.14)");
        throat.addColorStop(1, "rgba(2, 1, 3, 0.55)");
        ctx.fillStyle = throat;
        ctx.fillRect(this.geometry.innerRect.x, this.geometry.innerRect.y, this.geometry.innerRect.width, this.geometry.innerRect.height);

        const openingGlow = ctx.createRadialGradient(
            this.geometry.centerX,
            this.geometry.innerRect.y + this.geometry.innerRect.height * 0.2,
            0,
            this.geometry.centerX,
            this.geometry.centerY,
            Math.max(this.geometry.innerRect.width, this.geometry.innerRect.height) * 0.7
        );
        openingGlow.addColorStop(0, "rgba(255, 255, 255, 0.12)");
        openingGlow.addColorStop(0.35, "rgba(255, 255, 255, 0.04)");
        openingGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = openingGlow;
        ctx.fillRect(this.geometry.innerRect.x, this.geometry.innerRect.y, this.geometry.innerRect.width, this.geometry.innerRect.height);
        ctx.restore();
    }

    paintStoneTexture(ctx) {
        const seed = randomFromSeed(0.6180339);
        ctx.save();
        this.geometry.traceRing(ctx);
        ctx.clip("evenodd");

        for (let index = 0; index < 180; index += 1) {
            const alpha = 0.02 + seed() * 0.05;
            const size = 4 + seed() * this.geometry.rimWidth * 0.22;
            ctx.fillStyle = `rgba(255, 245, 233, ${alpha})`;
            const x = this.geometry.outerRect.x + seed() * this.geometry.outerRect.width;
            const y = this.geometry.outerRect.y + seed() * this.geometry.outerRect.height;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * (0.4 + seed() * 0.8), seed() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = "rgba(255, 245, 233, 0.04)";
        for (let index = 0; index < 32; index += 1) {
            const startX = this.geometry.outerRect.x + seed() * this.geometry.outerRect.width;
            const startY = this.geometry.outerRect.y + seed() * this.geometry.outerRect.height;
            const drift = this.geometry.rimWidth * (0.35 + seed() * 0.35);
            ctx.lineWidth = 1 + seed() * 2.6;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + (seed() - 0.5) * drift, startY + (seed() - 0.5) * drift);
            ctx.stroke();
        }

        ctx.restore();

        ctx.save();
        this.geometry.traceOuter(ctx);
        ctx.strokeStyle = "rgba(255, 243, 231, 0.08)";
        ctx.lineWidth = Math.max(1.2, this.geometry.rimWidth * 0.06);
        ctx.stroke();
        ctx.restore();
    }

    onPointerMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const halfWidth = this.geometry.innerRect.width * 0.5;
        const halfHeight = this.geometry.innerRect.height * 0.5;
        const nx = (x - (this.geometry.innerRect.x + halfWidth)) / halfWidth;
        const ny = (y - (this.geometry.innerRect.y + halfHeight)) / halfHeight;
        this.pointer.inside = this.geometry.containsNormalized(nx, ny);
        if (!this.pointer.inside) {
            return;
        }
        this.pointer.active = true;
        this.pointer.lastMoveAt = performance.now();
        this.pointer.target = { nx, ny };
    }

    onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const hit = this.tokenRects.find((token) => x >= token.x && x <= token.x + token.width && y >= token.y && y <= token.y + token.height);
        if (!hit) {
            return;
        }
        window.open(hit.url, "_blank", "noopener,noreferrer");
    }

    onPaste(event) {
        const url = normalizeUrl(event.clipboardData?.getData("text/plain"));
        if (!url) {
            this.announce("Paste a valid http or https URL.");
            return;
        }
        event.preventDefault();
        this.addItem(url, this.pointer.inside ? this.pointer.target : { nx: 0, ny: -0.04 });
    }

    onDragOver(event) {
        const url = getUrlFromDataTransfer(event.dataTransfer);
        if (!url) {
            return;
        }
        event.preventDefault();
        const point = this.geometry.canvasToNormalized(event.clientX, event.clientY);
        this.dragState.active = true;
        this.dragState.nx = point.nx;
        this.dragState.ny = point.ny;
        this.dragState.lastSeenAt = performance.now();
    }

    onDrop(event) {
        const url = getUrlFromDataTransfer(event.dataTransfer);
        this.dragState.active = false;
        if (!url) {
            return;
        }
        event.preventDefault();
        this.unlockAudio();
        const point = this.geometry.canvasToNormalized(event.clientX, event.clientY);
        this.addItem(url, point);
    }

    addItem(url, point) {
        this.unlockAudio();
        const cleanPoint = this.geometry.clampNormalized(point.nx, point.ny);
        const id = `${nowMs().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const item = {
            id,
            url,
            label: labelFromUrl(url),
            createdAt: nowMs(),
            position: cleanPoint,
            seed: hashString(`${url}:${id}`),
        };
        this.items.push(item);
        this.items = this.items.slice(-64);
        this.saveItems();
        this.refreshAccessibleLinks();
        this.applyImpact(cleanPoint.nx, cleanPoint.ny, 1.1);
        this.audio.impact(1);
        this.hintMuted = true;
        this.hint.classList.add("is-muted");
        this.announce(`Added ${item.label}.`);
    }

    getSinkState(item, time) {
        const elapsed = Math.max(0, time - item.createdAt);
        const normalized = clamp((elapsed - CONFIG.sink.floatMs) / (CONFIG.sink.lostMs - CONFIG.sink.floatMs), 0, 1);
        const depth = smoothstep(0, 1, normalized);
        let phase = "floating";
        if (elapsed < 90 * 1000) {
            phase = "fresh";
        } else if (depth > 0.82) {
            phase = "deep";
        } else if (depth > 0.22) {
            phase = "submerging";
        }
        return { elapsed, depth, phase };
    }

    applyImpact(nx, ny, scale = 1) {
        this.applyImpulse(nx, ny, CONFIG.simulation.impactStrength * scale, CONFIG.simulation.impactRadius);
    }

    applyImpulse(nx, ny, strength, radius) {
        if (!this.sim) {
            return;
        }
        const { cols, rows, velocity, mask, aspect } = this.sim;
        const scaledRadius = radius;
        for (let y = 0; y < rows; y += 1) {
            const cellNy = rows === 1 ? 0 : (y / (rows - 1)) * 2 - 1;
            for (let x = 0; x < cols; x += 1) {
                const index = y * cols + x;
                if (!mask[index]) {
                    continue;
                }
                const cellNx = cols === 1 ? 0 : (x / (cols - 1)) * 2 - 1;
                const distance = Math.hypot((cellNx - nx) * aspect, cellNy - ny);
                if (distance > scaledRadius) {
                    continue;
                }
                const center = Math.exp(-(distance * distance) / (scaledRadius * scaledRadius * 0.34));
                const ringDistance = distance - scaledRadius * 0.46;
                const ring = Math.exp(-(ringDistance * ringDistance) / (scaledRadius * scaledRadius * 0.08));
                velocity[index] += -strength * center + strength * 0.34 * ring;
            }
        }
    }

    updateSimulation(dt, time) {
        if (!this.sim) {
            return;
        }
        const { cols, rows, height, velocity, mask, edge } = this.sim;
        const lagStrength = 1 - Math.exp(-dt * CONFIG.simulation.pointerLag);
        this.pointer.lag.nx = lerp(this.pointer.lag.nx, this.pointer.target.nx, lagStrength);
        this.pointer.lag.ny = lerp(this.pointer.lag.ny, this.pointer.target.ny, lagStrength);

        if (this.pointer.inside && performance.now() - this.pointer.lastMoveAt < 180) {
            const deltaX = this.pointer.lag.nx - this.pointer.lastLag.nx;
            const deltaY = this.pointer.lag.ny - this.pointer.lastLag.ny;
            const speed = Math.hypot(deltaX, deltaY) / Math.max(dt, 0.001);
            this.applyImpulse(
                this.pointer.lag.nx,
                this.pointer.lag.ny,
                CONFIG.simulation.pointerLift + speed * CONFIG.simulation.pointerWake * (this.reducedMotion ? 0.35 : 1),
                CONFIG.simulation.pointerRadius
            );
        }
        this.pointer.lastLag.nx = this.pointer.lag.nx;
        this.pointer.lastLag.ny = this.pointer.lag.ny;

        if (this.dragState.active && performance.now() - this.dragState.lastSeenAt < 180) {
            this.applyImpulse(
                this.dragState.nx,
                this.dragState.ny,
                CONFIG.simulation.dragLift * (this.reducedMotion ? 0.5 : 1),
                CONFIG.simulation.dragRadius
            );
        } else {
            this.dragState.active = false;
        }

        const idleAmplitude = this.reducedMotion ? CONFIG.simulation.idleLift * 0.45 : CONFIG.simulation.idleLift;
        const idleA = {
            nx: Math.sin(time * 0.00021 * CONFIG.simulation.idleSpeed) * 0.26,
            ny: Math.cos(time * 0.00017 * CONFIG.simulation.idleSpeed) * 0.24,
        };
        const idleB = {
            nx: Math.cos(time * 0.00013 * CONFIG.simulation.idleSpeed + 1.7) * 0.33,
            ny: Math.sin(time * 0.00019 * CONFIG.simulation.idleSpeed + 0.4) * 0.18,
        };
        this.applyImpulse(idleA.nx, idleA.ny, idleAmplitude, 0.16);
        this.applyImpulse(idleB.nx, idleB.ny, idleAmplitude * 0.82, 0.14);

        let energy = 0;
        const nextHeight = new Float32Array(height.length);
        for (let y = 1; y < rows - 1; y += 1) {
            for (let x = 1; x < cols - 1; x += 1) {
                const index = y * cols + x;
                if (!mask[index]) {
                    continue;
                }
                const left = index - 1;
                const right = index + 1;
                const top = index - cols;
                const bottom = index + cols;
                const center = height[index];
                const neighborAverage =
                    (height[left] + height[right] + height[top] + height[bottom]) * 0.25;
                let nextVelocity = velocity[index] + (neighborAverage - center) * CONFIG.simulation.stiffness;
                const edgeDamp = lerp(1, CONFIG.simulation.edgeDamping, smoothstep(0.7, 1, edge[index]));
                nextVelocity *= CONFIG.simulation.damping * edgeDamp;
                const nextValue = center + nextVelocity;
                velocity[index] = nextVelocity;
                nextHeight[index] = nextValue;
                energy += Math.abs(nextVelocity) + Math.abs(nextValue) * 0.55;
            }
        }

        height.set(nextHeight);
        this.energy = lerp(this.energy, energy / Math.max(1, cols * rows), 0.08);
        this.audio.setEnergy(this.energy);
    }

    renderLiquid(time) {
        const { cols, rows, height, mask, image, edge } = this.sim;
        const pixels = image.data;
        const dragGlow = this.dragState.active ? 1 : 0;

        for (let y = 0; y < rows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const index = y * cols + x;
                const pixelIndex = index * 4;
                if (!mask[index]) {
                    pixels[pixelIndex + 3] = 0;
                    continue;
                }
                const h = height[index];
                const left = x > 0 ? height[index - 1] : h;
                const right = x < cols - 1 ? height[index + 1] : h;
                const top = y > 0 ? height[index - cols] : h;
                const bottom = y < rows - 1 ? height[index + cols] : h;
                const gradientX = right - left;
                const gradientY = bottom - top;
                const nx = cols === 1 ? 0 : (x / (cols - 1)) * 2 - 1;
                const ny = rows === 1 ? 0 : (y / (rows - 1)) * 2 - 1;
                const edgeMix = edge[index];
                const level = clamp(0.44 + h * 18 + (1 - edgeMix) * 0.12 - gradientX * 2.8 + gradientY * 1.3, 0, 1);
                let color = blendPalette(level);
                const sparkle = clamp((gradientY - gradientX) * 2.8 + h * 12 + Math.sin(time * 0.0012 + nx * 3 + ny * 2.5) * 0.04, 0, 1);
                color = mixColor(color, CONFIG.palette.spark, sparkle * 0.2);
                const rimDarkness = smoothstep(0.7, 1, edgeMix) * 0.22;
                const alpha = 255;
                pixels[pixelIndex] = Math.round(color[0] * (1 - rimDarkness));
                pixels[pixelIndex + 1] = Math.round(color[1] * (1 - rimDarkness));
                pixels[pixelIndex + 2] = Math.round(color[2] * (1 - rimDarkness));
                pixels[pixelIndex + 3] = alpha;

                if (dragGlow > 0) {
                    const distance = Math.hypot(nx - this.dragState.nx, ny - this.dragState.ny);
                    const pull = Math.max(0, 1 - distance / 0.35) * 28;
                    pixels[pixelIndex] = clamp(pixels[pixelIndex] + pull, 0, 255);
                    pixels[pixelIndex + 1] = clamp(pixels[pixelIndex + 1] + pull * 0.2, 0, 255);
                    pixels[pixelIndex + 2] = clamp(pixels[pixelIndex + 2] + pull * 0.45, 0, 255);
                }
            }
        }

        this.liquidCtx.putImageData(image, 0, 0);

        this.ctx.save();
        this.geometry.clipInner(this.ctx);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.drawImage(
            this.liquidCanvas,
            this.geometry.innerRect.x,
            this.geometry.innerRect.y,
            this.geometry.innerRect.width,
            this.geometry.innerRect.height
        );

        const innerGlow = this.ctx.createRadialGradient(
            this.geometry.centerX,
            this.geometry.innerRect.y + this.geometry.innerRect.height * 0.24,
            0,
            this.geometry.centerX,
            this.geometry.centerY,
            Math.max(this.geometry.innerRect.width, this.geometry.innerRect.height) * 0.58
        );
        innerGlow.addColorStop(0, "rgba(255, 172, 232, 0.16)");
        innerGlow.addColorStop(0.34, "rgba(255, 128, 197, 0.06)");
        innerGlow.addColorStop(1, "rgba(255, 128, 197, 0)");
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.fillStyle = innerGlow;
        this.ctx.fillRect(this.geometry.innerRect.x, this.geometry.innerRect.y, this.geometry.innerRect.width, this.geometry.innerRect.height);

        const throatShadow = this.ctx.createRadialGradient(
            this.geometry.centerX,
            this.geometry.centerY,
            Math.min(this.geometry.innerRect.width, this.geometry.innerRect.height) * 0.28,
            this.geometry.centerX,
            this.geometry.centerY,
            Math.max(this.geometry.innerRect.width, this.geometry.innerRect.height) * 0.62
        );
        throatShadow.addColorStop(0, "rgba(7, 2, 10, 0)");
        throatShadow.addColorStop(0.72, "rgba(7, 2, 10, 0.12)");
        throatShadow.addColorStop(1, "rgba(0, 0, 0, 0.38)");
        this.ctx.globalCompositeOperation = "multiply";
        this.ctx.fillStyle = throatShadow;
        this.ctx.fillRect(this.geometry.innerRect.x, this.geometry.innerRect.y, this.geometry.innerRect.width, this.geometry.innerRect.height);
        this.ctx.restore();
    }

    renderTokens(time) {
        this.tokenRects = [];
        const visibleItems = this.items
            .map((item) => ({
                item,
                sink: this.getSinkState(item, nowMs()),
            }))
            .filter((entry) => entry.sink.depth < 0.985)
            .slice(-CONFIG.tokens.maxVisible)
            .sort((a, b) => b.sink.depth - a.sink.depth);

        this.ctx.save();
        this.geometry.clipInner(this.ctx);
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${CONFIG.tokens.baseFontPx}px "Avenir Next Condensed", "Trebuchet MS", sans-serif`;

        for (const entry of visibleItems) {
            const { item, sink } = entry;
            const t = (time * 0.001 + item.seed * 10) * (sink.depth > 0.2 ? 0.35 : 0.5);
            const driftScale = CONFIG.tokens.driftAmplitude * (1 - sink.depth * 0.75) * (this.reducedMotion ? 0.4 : 1);
            const rawNx = item.position.nx + Math.sin(t) * driftScale + Math.cos(t * 0.71) * driftScale * 0.42;
            const rawNy = item.position.ny + Math.cos(t * 0.84) * driftScale * 0.6;
            const position = this.geometry.clampNormalized(rawNx, rawNy);
            const screen = this.geometry.normalizedToCanvas(position.nx, position.ny);
            const depthShift = sink.depth * CONFIG.tokens.depthShiftPx;
            const bob = (1 - sink.depth) * Math.sin(t * 1.8) * (this.reducedMotion ? 1.5 : 3.8);
            const y = screen.y + depthShift - bob;
            const width = clamp(this.ctx.measureText(item.label).width + 28, CONFIG.tokens.minWidthPx, CONFIG.tokens.maxWidthPx);
            const height = CONFIG.tokens.heightPx - sink.depth * 4;
            const x = screen.x - width * 0.5;
            const radius = height * 0.5;
            const visibility = 1 - smoothstep(0.55, 1, sink.depth);
            const blurAlpha = 0.22 + (1 - sink.depth) * 0.32;
            const tint = mixColor([32, 24, 30], [91, 35, 70], 1 - sink.depth);

            this.ctx.save();
            this.ctx.globalAlpha = 0.22 + visibility * 0.74;
            this.ctx.shadowColor = cssColor(CONFIG.palette.spark, blurAlpha * 0.8);
            this.ctx.shadowBlur = 18 * visibility;
            this.ctx.fillStyle = cssColor([8, 6, 9], 0.74);
            roundRect(this.ctx, x, y - height * 0.5, width, height, radius);
            this.ctx.fill();

            this.ctx.shadowBlur = 0;
            const plaque = this.ctx.createLinearGradient(x, y - height * 0.5, x, y + height * 0.5);
            plaque.addColorStop(0, cssColor(mixColor(tint, CONFIG.palette.spark, 0.06), 0.92));
            plaque.addColorStop(1, cssColor(mixColor(tint, [10, 7, 10], 0.35), 0.92));
            this.ctx.fillStyle = plaque;
            roundRect(this.ctx, x, y - height * 0.5, width, height, radius);
            this.ctx.fill();

            this.ctx.strokeStyle = cssColor([245, 214, 235], visibility * 0.22);
            this.ctx.lineWidth = 1;
            roundRect(this.ctx, x + 0.5, y - height * 0.5 + 0.5, width - 1, height - 1, radius - 0.5);
            this.ctx.stroke();

            this.ctx.fillStyle = cssColor([255, 236, 246], 0.84 * visibility + 0.12);
            this.ctx.fillText(item.label, x + 14, y + 0.5);
            this.ctx.restore();

            if (visibility > 0.06) {
                this.tokenRects.push({
                    id: item.id,
                    url: item.url,
                    x,
                    y: y - height * 0.5,
                    width,
                    height,
                });
            }
        }

        this.ctx.restore();
    }

    updateHintState(time) {
        const shouldMute =
            this.hintMuted ||
            this.items.length > 0 ||
            time > CONFIG.scene.hintFadeAfterMs;
        if (shouldMute) {
            this.hint.classList.add("is-muted");
        } else {
            this.hint.classList.remove("is-muted");
        }
    }

    frame(time) {
        const dt = clamp((time - this.lastFrame) / 1000, 0.001, 0.033);
        this.lastFrame = time;
        this.updateSimulation(dt, time);

        this.ctx.clearRect(0, 0, this.geometry.width, this.geometry.height);
        this.ctx.drawImage(this.staticCanvas, 0, 0, this.geometry.width, this.geometry.height);
        this.renderLiquid(time);
        this.renderTokens(time);
        this.updateHintState(time);

        requestAnimationFrame((nextTime) => this.frame(nextTime));
    }
}

function blendPalette(level) {
    if (level < 0.35) {
        return mixColor(CONFIG.palette.valley, CONFIG.palette.deep, level / 0.35);
    }
    if (level < 0.7) {
        return mixColor(CONFIG.palette.deep, CONFIG.palette.mid, (level - 0.35) / 0.35);
    }
    return mixColor(CONFIG.palette.mid, CONFIG.palette.high, (level - 0.7) / 0.3);
}

function mixColor(a, b, t) {
    return [
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
        lerp(a[2], b[2], t),
    ];
}

function roundRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.max(0, Math.min(radius, width * 0.5, height * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
    ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
    ctx.arcTo(x, y + height, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();
}

new SharingGooScene();
