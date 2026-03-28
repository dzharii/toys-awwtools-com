import { CONFIG, getReducedMotionPreference } from "./config.js";
import { ReservoirAudio } from "./audio.js";
import { VesselGeometry } from "./geometry.js";
import { InputController } from "./input.js";
import { LiquidSimulation } from "./liquid.js";
import { PersistenceStore } from "./persistence.js";
import { SceneRenderer } from "./renderer.js";
import {
  clamp,
  displayLabelFromUrl,
  formatRelativeSink,
  hashString,
  lerp,
  nowMs,
  performanceNow,
  setCanvasSize,
} from "./utils.js";

export class ReservoirScene {
  constructor(options) {
    this.canvas = options.canvas;
    this.pasteReceiver = options.pasteReceiver;
    this.liveRegion = options.liveRegion;
    this.statusEl = options.statusEl;
    this.ambientHint = options.ambientHint;
    this.accessibleLinks = options.accessibleLinks;
    this.muteToggle = options.muteToggle;

    this.ctx = this.canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    this.config = CONFIG;
    this.reducedMotion = getReducedMotionPreference();

    this.geometry = new VesselGeometry(this.config);
    this.store = new PersistenceStore(this.config);
    this.audio = new ReservoirAudio(this.config);
    this.simulation = new LiquidSimulation(this.config, this.geometry, this.reducedMotion);
    this.renderer = new SceneRenderer(this.config, this.geometry, this.simulation);

    this.items = this.store.load();
    this.tokenVisuals = new Map();
    this.dragOver = false;
    this.focused = false;
    this.dragGlow = 0;
    this.hoveredTokenId = null;
    this.pointerPixel = { x: 0, y: 0 };
    this.lastInteriorPoint = null;
    this.lastTime = performanceNow();
    this.running = false;
    this.frameTimes = [];
    this.qualityScale = 1;
    this.dpr = 1;

    this.input = new InputController({
      element: window,
      pasteReceiver: this.pasteReceiver,
      geometry: this.geometry,
      onPointer: this.#handlePointer,
      onPointerLeave: this.#handlePointerLeave,
      onDropUrl: this.#handleIncomingUrl,
      onTrustedInteraction: this.#handleTrustedInteraction,
      onDragStateChange: this.#handleDragStateChange,
      onFocusChange: this.#handleFocusChange,
    });

    this.canvas.addEventListener("click", this.#handleCanvasClick);
    this.canvas.addEventListener("mousemove", this.#handleCanvasHover, { passive: true });
    this.canvas.addEventListener("mouseleave", () => {
      this.hoveredTokenId = null;
    });

    this.muteToggle.addEventListener("click", () => {
      const nextMuted = !this.audio.getMuted();
      this.audio.setMuted(nextMuted);
      this.#syncMuteUi();
      this.#showStatus(nextMuted ? "sound muted" : "sound enabled");
    });

    window.addEventListener("resize", this.#handleResize, { passive: true });
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", this.#handleMotionChange);

    this.#syncMuteUi();
    this.#rehydrateVisuals();
    this.#syncAccessibleLinks(nowMs());
    this.#syncHintUi(this.items.length > 0 ? "hidden" : "visible");
  }

  start() {
    this.running = true;
    this.input.attach();
    this.#resize();
    this.lastTime = performanceNow();
    requestAnimationFrame(this.#frame);
  }

  stop() {
    this.running = false;
    this.input.detach();
  }

  #handleResize = () => {
    this.#resize();
  };

  #handleMotionChange = (event) => {
    this.reducedMotion = Boolean(event.matches);
    this.simulation.setReducedMotion(this.reducedMotion);
    this.#showStatus(this.reducedMotion ? "reduced motion active" : "full motion active");
  };

  #resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.dpr = setCanvasSize(
      this.canvas,
      width,
      height,
      window.devicePixelRatio || 1,
      this.config.maxDpr
    );
    this.geometry.resize(width, height, this.dpr);
    this.simulation.setQualityScale(this.qualityScale);
    this.simulation.resize();
    this.renderer.setQualityScale(this.qualityScale);
    this.renderer.resize(width, height, this.dpr);
    this.#updateTokenVisualTargets();
  }

  #handlePointer = (nx, ny, clientX, clientY) => {
    this.pointerPixel.x = clientX;
    this.pointerPixel.y = clientY;
    this.lastInteriorPoint = { x: nx, y: ny };
    this.simulation.setPointer(nx, ny, true);
  };

  #handlePointerLeave = () => {
    this.simulation.setPointerOutside();
  };

  #handleFocusChange = (focused) => {
    this.focused = focused;
  };

  #handleDragStateChange = (isDragOver, normalized) => {
    this.dragOver = isDragOver;
    if (isDragOver && normalized) {
      this.lastInteriorPoint = normalized;
      this.simulation.setDragOver(true, normalized.x, normalized.y);
    } else {
      this.simulation.setDragOver(false);
    }
  };

  #handleTrustedInteraction = async () => {
    this.#syncHintUi("dimmed");
    await this.audio.unlock();
    this.#syncMuteUi();
  };

  #handleIncomingUrl = (normalizedUrl, point, source) => {
    const originPoint =
      source === "paste"
        ? this.lastInteriorPoint || this.#getPasteFallbackPoint()
        : point;
    const clampedPoint = this.geometry.getTokenSafePoint(originPoint.x, originPoint.y);
    const seed = hashString(`${normalizedUrl}|${Date.now()}|${Math.random()}`);
    const item = this.store.createItem(normalizedUrl, clampedPoint, seed);

    this.items.unshift(item);
    this.items = this.items.slice(0, this.config.maxPersistedItems);
    this.store.save(this.items);

    this.tokenVisuals.set(item.id, {
      x: clampedPoint.x,
      y: clampedPoint.y,
      offsetX: 0,
      offsetY: 0,
      sink: 0,
      seed,
      hovered: false,
    });

    const strength =
      source === "paste"
        ? this.config.simulation.pasteStrength
        : this.config.simulation.impactStrength;

    this.simulation.addImpulse(clampedPoint.x, clampedPoint.y, strength);

    const pan = (clampedPoint.x - 0.5) * 1.5;
    this.audio.playImpact(source === "paste" ? 0.92 : 1.08, pan);

    const label = displayLabelFromUrl(normalizedUrl, this.config.tokens.maxLabelChars);
    this.liveRegion.textContent = `Added link ${label}`;
    this.#showStatus(source === "paste" ? `accepted ${label}` : `dropped ${label}`);
    this.#updateTokenVisualTargets();
    this.#syncAccessibleLinks(nowMs());
    this.#syncHintUi("hidden");
  };

  #handleCanvasHover = (event) => {
    const tokenId = this.#pickTokenAt(event.clientX, event.clientY);
    this.hoveredTokenId = tokenId;
    this.canvas.style.cursor = tokenId ? "pointer" : "default";
  };

  #handleCanvasClick = (event) => {
    const tokenId = this.#pickTokenAt(event.clientX, event.clientY);
    if (!tokenId) {
      this.pasteReceiver.focus({ preventScroll: true });
      return;
    }
    const item = this.items.find((entry) => entry.id === tokenId);
    if (!item) return;
    window.open(item.url, "_blank", "noopener,noreferrer");
    this.liveRegion.textContent = `Opened ${item.label} in a new tab`;
    this.#showStatus(`opened ${item.label}`);
  };

  #pickTokenAt(clientX, clientY) {
    const visibleItems = this.#getVisibleItems(nowMs());
    for (const item of visibleItems) {
      const token = this.tokenVisuals.get(item.id);
      if (!token) continue;
      const pos = this.geometry.normalizedToPixel(token.x, token.y);
      const sink = clamp(token.sink, 0, 1);
      const scale = 1 - sink * 0.18 + (item.id === this.hoveredTokenId ? 0.03 : 0);
      const width = (86 + Math.min(54, item.label.length * 5.1)) * scale;
      const height = 24 * scale;
      const x = pos.x + token.offsetX;
      const y = pos.y + token.offsetY + sink * 8;
      if (
        clientX >= x - width * 0.5 &&
        clientX <= x + width * 0.5 &&
        clientY >= y - height * 0.5 &&
        clientY <= y + height * 0.5
      ) {
        if (sink <= this.config.tokens.visibleThreshold) {
          return item.id;
        }
      }
    }
    return null;
  }

  #rehydrateVisuals() {
    const now = nowMs();
    for (const item of this.items) {
      this.tokenVisuals.set(item.id, {
        x: item.x,
        y: item.y,
        offsetX: 0,
        offsetY: 0,
        sink: this.store.deriveSinkProgress(item, now),
        seed: item.seed,
        hovered: false,
      });
    }
  }

  #updateTokenVisualTargets() {
    for (const item of this.items) {
      if (!this.tokenVisuals.has(item.id)) {
        this.tokenVisuals.set(item.id, {
          x: item.x,
          y: item.y,
          offsetX: 0,
          offsetY: 0,
          sink: 0,
          seed: item.seed,
          hovered: false,
        });
      }
    }
  }

  #getVisibleItems(now) {
    return this.items
      .filter((item) => this.store.isVisible(item, now))
      .slice(0, this.config.maxVisibleItems);
  }

  #updateTokens(now) {
    const visibleItems = this.#getVisibleItems(now);
    for (const item of visibleItems) {
      const token = this.tokenVisuals.get(item.id);
      if (!token) continue;

      const sink = this.store.deriveSinkProgress(item, now);
      token.sink = sink;
      token.hovered = item.id === this.hoveredTokenId;

      const driftTime = now * this.config.tokens.driftSpeed + item.seed * 0.0001;
      const driftRadius = (1 - sink) * 0.016;
      const driftX = Math.cos(driftTime * 0.93 + item.seed * 0.000021) * driftRadius;
      const driftY = Math.sin(driftTime * 1.11 + item.seed * 0.000013) * driftRadius * 0.6;
      const safePoint = this.geometry.getTokenSafePoint(item.x + driftX, item.y + driftY);
      token.x = safePoint.x;
      token.y = safePoint.y;

      const localHeight = this.simulation.sample(token.x, token.y);
      token.offsetX = Math.sin(driftTime * 1.7 + item.seed * 0.0002) * (1 - sink) * 1.6;
      token.offsetY = localHeight * -26 + Math.cos(driftTime * 1.43) * (1 - sink) * 1.2;
    }
  }

  #showStatus(message) {
    this.statusEl.textContent = message;
    this.statusEl.dataset.visible = "true";
    clearTimeout(this.statusTimeout);
    this.statusTimeout = setTimeout(() => {
      this.statusEl.dataset.visible = "false";
    }, this.config.statusDurationMs);
  }

  #syncMuteUi() {
    const muted = this.audio.getMuted();
    const unlocked = this.audio.isUnlocked();
    const label = muted ? "sound off" : unlocked ? "sound on" : "sound ready";
    this.muteToggle.textContent = label;
    this.muteToggle.title = muted ? "enable sound" : "mute sound";
    this.muteToggle.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
    this.muteToggle.setAttribute("aria-pressed", String(!muted));
  }

  #measurePerformance(delta) {
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    if (this.frameTimes.length < 30) return;
    const avg = this.frameTimes.reduce((sum, value) => sum + value, 0) / this.frameTimes.length;
    const fps = 1000 / Math.max(1, avg);
    if (fps < this.config.targetFpsFloor && this.qualityScale === 1) {
      this.qualityScale = this.config.qualityFallbackScale;
      this.simulation.setQualityScale(this.qualityScale);
      this.renderer.setQualityScale(this.qualityScale);
      this.simulation.resize();
      this.#showStatus("adapting render density");
    }
  }

  #getPasteFallbackPoint() {
    const point =
      this.geometry.mode === "portrait"
        ? this.config.ui.pasteFallbackPointPortrait
        : this.config.ui.pasteFallbackPointDesktop;
    return this.geometry.getTokenSafePoint(point.x, point.y);
  }

  #syncHintUi(state) {
    if (!this.ambientHint) return;
    if (state === "hidden") {
      this.ambientHint.dataset.hidden = "true";
      delete this.ambientHint.dataset.dimmed;
      return;
    }
    if (state === "dimmed") {
      delete this.ambientHint.dataset.hidden;
      this.ambientHint.dataset.dimmed = "true";
      return;
    }
    delete this.ambientHint.dataset.hidden;
    delete this.ambientHint.dataset.dimmed;
  }

  #syncAccessibleLinks(now) {
    if (!this.accessibleLinks) return;
    const items = this.items.slice(0, this.config.maxPersistedItems);
    const nodes = items.map((item) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.label;
      li.append(link);

      const age = Math.max(0, now - item.createdAt);
      const status = document.createElement("span");
      status.textContent = `, ${formatRelativeSink(age, this.config.sink)}`;
      li.append(status);
      return li;
    });
    this.accessibleLinks.replaceChildren(...nodes);
  }

  #frame = (time) => {
    if (!this.running) return;

    const now = nowMs();
    const delta = Math.min(32, Math.max(8, time - this.lastTime || 16.67));
    this.lastTime = time;

    if (this.items.length === 0 && this.ambientHint?.dataset.hidden !== "true") {
      if (time > this.config.ui.hintHideMs) {
        this.#syncHintUi("hidden");
      } else if (time > this.config.ui.hintDimMs) {
        this.#syncHintUi("dimmed");
      }
    }

    this.dragGlow = lerp(this.dragGlow, this.dragOver ? 1 : 0, this.dragOver ? 0.08 : 0.04);

    this.simulation.step(delta);
    this.#updateTokens(now);

    const visibleItems = this.#getVisibleItems(now);
    for (const item of visibleItems) {
      const token = this.tokenVisuals.get(item.id);
      if (token) token.hovered = item.id === this.hoveredTokenId;
    }

    this.audio.tick(this.simulation.getActivity());

    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    this.renderer.draw(
      ctx,
      this.geometry.viewport.width,
      this.geometry.viewport.height,
      this.dpr,
      {
        now,
        time,
        dragOver: this.dragOver,
        dragGlow: this.dragGlow,
        visibleItems,
        tokenVisuals: this.tokenVisuals,
        focused: this.focused,
      }
    );

    this.#measurePerformance(delta);
    requestAnimationFrame(this.#frame);
  };
}

