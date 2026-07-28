(() => {
  "use strict";

  const APP_KEY = "__FAVICON_FX_BOOKMARKLET__";
  const PUBLIC_KEY = "FaviconFX";

  if (window[APP_KEY]) {
    window[APP_KEY].togglePanel();
    return;
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const wave = (time, speed = 1, phase = 0) =>
    (Math.sin(time * speed * Math.PI * 2 + phase) + 1) / 2;

  function createEventBus() {
    const listeners = new Map();

    return {
      on(eventName, listener) {
        const group = listeners.get(eventName) || new Set();
        group.add(listener);
        listeners.set(eventName, group);
        return () => group.delete(listener);
      },
      emit(eventName, payload) {
        for (const listener of listeners.get(eventName) || []) {
          listener(payload);
        }
      },
      clear() {
        listeners.clear();
      },
    };
  }

  function createCanvas(size) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }

  async function loadImage(url, useCors) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      if (useCors) image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load favicon: ${url}`));
      image.src = url;
    });
  }

  function faviconCandidates() {
    const links = [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')];
    const ranked = links
      .map((link) => {
        const rawSize = link.getAttribute("sizes") || "0x0";
        const numericSize = Number.parseInt(rawSize, 10) || 0;
        return { url: link.href, size: numericSize };
      })
      .filter((item) => item.url)
      .sort((a, b) => b.size - a.size)
      .map((item) => item.url);

    try {
      ranked.push(new URL("/favicon.ico", location.href).href);
    } catch {
      // Non-HTTP documents such as about:blank have no usable origin fallback.
    }
    return [...new Set(ranked)];
  }

  function drawFallbackIcon(context, size) {
    const initial = (location.hostname.replace(/^www\./, "")[0] || "?").toUpperCase();
    const gradient = context.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#7c3aed");
    gradient.addColorStop(0.5, "#ec4899");
    gradient.addColorStop(1, "#f59e0b");

    context.clearRect(0, 0, size, size);
    context.fillStyle = gradient;
    context.beginPath();
    context.roundRect(2, 2, size - 4, size - 4, size * 0.22);
    context.fill();
    context.fillStyle = "white";
    context.font = `700 ${Math.round(size * 0.56)}px system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(initial, size / 2, size / 2 + size * 0.03);
  }

  async function createSourceCanvas(size) {
    const sourceCanvas = createCanvas(size);
    const context = sourceCanvas.getContext("2d", { willReadFrequently: true });

    for (const url of faviconCandidates()) {
      try {
        const parsed = new URL(url, location.href);
        const sameOrigin = parsed.origin === location.origin;
        const image = await loadImage(url, !sameOrigin);
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
        context.getImageData(0, 0, 1, 1);
        return { canvas: sourceCanvas, sourceUrl: url, usedFallback: false };
      } catch {
        sourceCanvas.width = size;
        sourceCanvas.height = size;
      }
    }

    drawFallbackIcon(context, size);
    return { canvas: sourceCanvas, sourceUrl: null, usedFallback: true };
  }

  function createFaviconEngine({ size = 64, fps = 30 } = {}) {
    const events = createEventBus();
    const frameCanvas = createCanvas(size);
    const scratchCanvas = createCanvas(size);
    const trailCanvas = createCanvas(size);
    const pixelCanvas = createCanvas(size);
    const frameContext = frameCanvas.getContext("2d");
    const scratchContext = scratchCanvas.getContext("2d");
    const trailContext = trailCanvas.getContext("2d");
    const pixelContext = pixelCanvas.getContext("2d");
    const originalLinks = [...document.querySelectorAll('link[rel~="icon"]')].map((link) => ({
      link,
      rel: link.getAttribute("rel"),
    }));

    const dynamicLink = document.createElement("link");
    dynamicLink.rel = "icon";
    dynamicLink.type = "image/png";
    dynamicLink.dataset.faviconFx = "true";

    const effects = new Map();
    const presets = new Map();
    let sourceCanvas = null;
    let running = false;
    let destroyed = false;
    let animationFrame = 0;
    let previousTimestamp = 0;
    let lastRenderedTimestamp = 0;
    let startTimestamp = 0;
    let masterSpeed = 1;
    let masterIntensity = 1;
    let sourceInfo = { sourceUrl: null, usedFallback: true };

    function registerEffect(name, definition) {
      effects.set(name, {
        name,
        label: definition.label || name,
        category: definition.category || "Other",
        enabled: false,
        params: { ...(definition.defaults || {}) },
        defaults: { ...(definition.defaults || {}) },
        apply: definition.apply,
      });
      return api;
    }

    function registerPreset(name, definition) {
      presets.set(name, { name, ...definition });
      return api;
    }

    function setEffect(name, enabled = true, params = {}) {
      const effect = effects.get(name);
      if (!effect) throw new Error(`Unknown favicon effect: ${name}`);
      effect.enabled = Boolean(enabled);
      Object.assign(effect.params, params);
      events.emit("statechange", getState());
      return api;
    }

    function toggleEffect(name) {
      const effect = effects.get(name);
      if (!effect) throw new Error(`Unknown favicon effect: ${name}`);
      return setEffect(name, !effect.enabled);
    }

    function setEffectParams(name, params) {
      const effect = effects.get(name);
      if (!effect) throw new Error(`Unknown favicon effect: ${name}`);
      Object.assign(effect.params, params);
      events.emit("statechange", getState());
      return api;
    }

    function clearEffects() {
      for (const effect of effects.values()) {
        effect.enabled = false;
        effect.params = { ...effect.defaults };
      }
      trailContext.clearRect(0, 0, size, size);
      events.emit("statechange", getState());
      return api;
    }

    function playPreset(name) {
      const preset = presets.get(name);
      if (!preset) throw new Error(`Unknown favicon preset: ${name}`);
      clearEffects();
      for (const [effectName, params] of Object.entries(preset.effects)) {
        setEffect(effectName, true, params === true ? {} : params);
      }
      events.emit("preset", { name, label: preset.label || name });
      return api;
    }

    function surprise() {
      const names = [...effects.keys()];
      clearEffects();
      const count = 2 + Math.floor(Math.random() * 4);
      const shuffled = names.sort(() => Math.random() - 0.5).slice(0, count);
      for (const name of shuffled) setEffect(name, true);
      return shuffled;
    }

    function disableOriginalLinks() {
      for (const { link } of originalLinks) {
        link.setAttribute("rel", "icon-disabled-by-favicon-fx");
      }
      if (!dynamicLink.isConnected) document.head.append(dynamicLink);
    }

    function restoreOriginalLinks() {
      dynamicLink.remove();
      for (const { link, rel } of originalLinks) {
        if (rel == null) link.removeAttribute("rel");
        else link.setAttribute("rel", rel);
      }
    }

    function copyFrameToScratch() {
      scratchContext.clearRect(0, 0, size, size);
      scratchContext.drawImage(frameCanvas, 0, 0);
    }

    function render(timestamp) {
      if (!running || destroyed) return;
      animationFrame = requestAnimationFrame(render);

      const interval = 1000 / fps;
      if (timestamp - lastRenderedTimestamp < interval) return;
      lastRenderedTimestamp = timestamp;

      if (!startTimestamp) startTimestamp = timestamp;
      const rawDelta = previousTimestamp ? (timestamp - previousTimestamp) / 1000 : 0;
      previousTimestamp = timestamp;
      const frame = {
        time: ((timestamp - startTimestamp) / 1000) * masterSpeed,
        delta: Math.min(rawDelta, 0.1),
        size,
        center: size / 2,
        intensity: masterIntensity,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        offsetX: 0,
        offsetY: 0,
        alpha: 1,
        filters: [],
        overlays: [],
        processors: [],
      };

      for (const effect of effects.values()) {
        if (effect.enabled) effect.apply(frame, effect.params);
      }

      frameContext.save();
      frameContext.clearRect(0, 0, size, size);
      frameContext.translate(frame.center + frame.offsetX, frame.center + frame.offsetY);
      frameContext.rotate(frame.rotation);
      frameContext.scale(frame.scaleX, frame.scaleY);
      frameContext.globalAlpha = clamp(frame.alpha, 0.02, 1);
      frameContext.filter = frame.filters.join(" ") || "none";
      frameContext.drawImage(sourceCanvas, -size / 2, -size / 2, size, size);
      frameContext.restore();
      frameContext.filter = "none";
      frameContext.globalAlpha = 1;

      for (const processor of frame.processors) processor(frameContext, frame, copyFrameToScratch);
      for (const overlay of frame.overlays) overlay(frameContext, frame);

      dynamicLink.href = frameCanvas.toDataURL("image/png");
      events.emit("frame", frame);
    }

    async function start() {
      if (destroyed || running) return api;
      if (!sourceCanvas) {
        const source = await createSourceCanvas(size);
        sourceCanvas = source.canvas;
        sourceInfo = { sourceUrl: source.sourceUrl, usedFallback: source.usedFallback };
      }
      disableOriginalLinks();
      running = true;
      previousTimestamp = 0;
      lastRenderedTimestamp = 0;
      startTimestamp = 0;
      animationFrame = requestAnimationFrame(render);
      events.emit("start", getState());
      return api;
    }

    function stop({ restore = true } = {}) {
      running = false;
      cancelAnimationFrame(animationFrame);
      if (restore) restoreOriginalLinks();
      events.emit("stop", getState());
      return api;
    }

    function destroy() {
      if (destroyed) return;
      stop({ restore: true });
      destroyed = true;
      events.clear();
      delete window[PUBLIC_KEY];
    }

    function getState() {
      return {
        running,
        size,
        fps,
        masterSpeed,
        masterIntensity,
        sourceInfo: { ...sourceInfo },
        effects: [...effects.values()].map(({ name, label, category, enabled, params }) => ({
          name,
          label,
          category,
          enabled,
          params: { ...params },
        })),
        presets: [...presets.values()].map(({ name, label }) => ({ name, label: label || name })),
      };
    }

    const api = {
      registerEffect,
      registerPreset,
      setEffect,
      toggleEffect,
      setEffectParams,
      clearEffects,
      playPreset,
      surprise,
      start,
      stop,
      destroy,
      getState,
      on: events.on,
      setMasterSpeed(value) {
        masterSpeed = clamp(Number(value) || 1, 0.1, 4);
        events.emit("statechange", getState());
        return api;
      },
      setMasterIntensity(value) {
        masterIntensity = clamp(Number(value) || 1, 0.1, 2);
        events.emit("statechange", getState());
        return api;
      },
    };

    registerEffect("spin", {
      label: "Spin",
      category: "Motion",
      defaults: { speed: 0.55, direction: 1 },
      apply(frame, params) {
        frame.rotation += frame.time * params.speed * params.direction * Math.PI * 2;
      },
    });

    registerEffect("wobble", {
      label: "Wobble",
      category: "Motion",
      defaults: { speed: 1.8, degrees: 18 },
      apply(frame, params) {
        frame.rotation += Math.sin(frame.time * params.speed * Math.PI * 2) *
          (params.degrees * Math.PI / 180) * frame.intensity;
      },
    });

    registerEffect("pulse", {
      label: "Pulse",
      category: "Motion",
      defaults: { speed: 1.2, amount: 0.24 },
      apply(frame, params) {
        const scale = 1 + Math.sin(frame.time * params.speed * Math.PI * 2) * params.amount * frame.intensity;
        frame.scaleX *= scale;
        frame.scaleY *= scale;
      },
    });

    registerEffect("orbit", {
      label: "Orbit",
      category: "Motion",
      defaults: { speed: 0.8, radius: 5 },
      apply(frame, params) {
        const angle = frame.time * params.speed * Math.PI * 2;
        frame.offsetX += Math.cos(angle) * params.radius * frame.intensity;
        frame.offsetY += Math.sin(angle) * params.radius * frame.intensity;
      },
    });

    registerEffect("shake", {
      label: "Shake",
      category: "Motion",
      defaults: { speed: 19, amount: 2.5 },
      apply(frame, params) {
        frame.offsetX += Math.sin(frame.time * params.speed * 7.13) * params.amount * frame.intensity;
        frame.offsetY += Math.cos(frame.time * params.speed * 5.71) * params.amount * frame.intensity;
      },
    });

    registerEffect("hue", {
      label: "Hue Cycle",
      category: "Color",
      defaults: { speed: 0.25, saturation: 1.45 },
      apply(frame, params) {
        frame.filters.push(`hue-rotate(${frame.time * params.speed * 360}deg)`);
        frame.filters.push(`saturate(${params.saturation})`);
      },
    });

    registerEffect("fade", {
      label: "Fade",
      category: "Color",
      defaults: { speed: 0.8, minimum: 0.16 },
      apply(frame, params) {
        frame.alpha *= lerp(params.minimum, 1, wave(frame.time, params.speed));
      },
    });

    registerEffect("negative", {
      label: "Negative",
      category: "Color",
      defaults: { speed: 1.1 },
      apply(frame, params) {
        frame.filters.push(`invert(${wave(frame.time, params.speed)})`);
      },
    });

    registerEffect("neon", {
      label: "Neon",
      category: "Color",
      defaults: { contrast: 1.55, saturation: 2.4 },
      apply(frame, params) {
        frame.filters.push(`contrast(${params.contrast})`);
        frame.filters.push(`saturate(${params.saturation})`);
        frame.filters.push("brightness(1.12)");
      },
    });

    registerEffect("pixelate", {
      label: "Pixelate",
      category: "Texture",
      defaults: { pixels: 9, speed: 0.6 },
      apply(frame, params) {
        frame.processors.push((context, currentFrame, copy) => {
          copy();
          const animated = Math.max(3, Math.round(params.pixels + wave(currentFrame.time, params.speed) * 7));
          pixelContext.clearRect(0, 0, size, size);
          pixelContext.imageSmoothingEnabled = false;
          pixelContext.drawImage(scratchCanvas, 0, 0, size, size, 0, 0, animated, animated);
          context.clearRect(0, 0, size, size);
          context.imageSmoothingEnabled = false;
          context.drawImage(pixelCanvas, 0, 0, animated, animated, 0, 0, size, size);
          context.imageSmoothingEnabled = true;
          pixelContext.imageSmoothingEnabled = true;
        });
      },
    });

    registerEffect("glitch", {
      label: "Glitch",
      category: "Texture",
      defaults: { slices: 7, amount: 8, speed: 11 },
      apply(frame, params) {
        frame.processors.push((context, currentFrame, copy) => {
          copy();
          const seed = Math.sin(currentFrame.time * params.speed * 91.7);
          for (let index = 0; index < params.slices; index += 1) {
            const y = Math.floor(((index * 17.3 + seed * 31) % size + size) % size);
            const height = 2 + (index % 4);
            const shift = Math.sin(currentFrame.time * params.speed + index * 4.7) * params.amount;
            context.drawImage(scratchCanvas, 0, y, size, height, shift, y, size, height);
          }
        });
      },
    });

    registerEffect("mirror", {
      label: "Mirror",
      category: "Texture",
      defaults: { speed: 0.5 },
      apply(frame, params) {
        frame.processors.push((context, currentFrame, copy) => {
          copy();
          const split = Math.round(lerp(size * 0.32, size * 0.68, wave(currentFrame.time, params.speed)));
          context.save();
          context.translate(size, 0);
          context.scale(-1, 1);
          context.globalAlpha = 0.72;
          context.drawImage(scratchCanvas, split, 0, size - split, size, split, 0, size - split, size);
          context.restore();
        });
      },
    });

    registerEffect("trail", {
      label: "Trail",
      category: "Texture",
      defaults: { persistence: 0.82 },
      apply(frame, params) {
        frame.processors.push((context) => {
          trailContext.globalCompositeOperation = "source-over";
          trailContext.fillStyle = `rgba(0, 0, 0, ${1 - params.persistence})`;
          trailContext.fillRect(0, 0, size, size);
          trailContext.globalCompositeOperation = "lighter";
          trailContext.globalAlpha = 0.72;
          trailContext.drawImage(frameCanvas, 0, 0);
          trailContext.globalAlpha = 1;
          context.clearRect(0, 0, size, size);
          context.drawImage(trailCanvas, 0, 0);
        });
      },
    });

    registerEffect("sparkles", {
      label: "Sparkles",
      category: "Overlay",
      defaults: { count: 7, speed: 1.5 },
      apply(frame, params) {
        frame.overlays.push((context, currentFrame) => {
          context.save();
          context.fillStyle = "white";
          context.shadowColor = "white";
          context.shadowBlur = 5;
          for (let index = 0; index < params.count; index += 1) {
            const angle = index * 2.399 + currentFrame.time * params.speed;
            const radius = 8 + ((index * 13) % 22);
            const x = currentFrame.center + Math.cos(angle) * radius;
            const y = currentFrame.center + Math.sin(angle * 1.17) * radius;
            const sparkleSize = 0.6 + wave(currentFrame.time, params.speed * 1.7, index) * 2.2;
            context.globalAlpha = wave(currentFrame.time, params.speed * 1.3, index * 0.8);
            context.fillRect(x - sparkleSize, y, sparkleSize * 2, 1);
            context.fillRect(x, y - sparkleSize, 1, sparkleSize * 2);
          }
          context.restore();
        });
      },
    });

    registerEffect("scanline", {
      label: "Scanline",
      category: "Overlay",
      defaults: { speed: 0.8, width: 9 },
      apply(frame, params) {
        frame.overlays.push((context, currentFrame) => {
          const y = ((currentFrame.time * params.speed * size) % (size + params.width)) - params.width;
          const gradient = context.createLinearGradient(0, y, 0, y + params.width);
          gradient.addColorStop(0, "rgba(255,255,255,0)");
          gradient.addColorStop(0.5, "rgba(255,255,255,0.65)");
          gradient.addColorStop(1, "rgba(255,255,255,0)");
          context.fillStyle = gradient;
          context.fillRect(0, y, size, params.width);
        });
      },
    });

    registerEffect("halo", {
      label: "Halo",
      category: "Overlay",
      defaults: { speed: 0.65 },
      apply(frame, params) {
        frame.overlays.push((context, currentFrame) => {
          context.save();
          context.strokeStyle = `hsl(${(currentFrame.time * params.speed * 180) % 360} 100% 65%)`;
          context.lineWidth = 2.5;
          context.globalAlpha = 0.55 + wave(currentFrame.time, params.speed) * 0.4;
          context.beginPath();
          context.arc(currentFrame.center, currentFrame.center, size * 0.44, 0, Math.PI * 2);
          context.stroke();
          context.restore();
        });
      },
    });

    registerEffect("badge", {
      label: "Alert Badge",
      category: "Overlay",
      defaults: { text: "!", speed: 1.3 },
      apply(frame, params) {
        frame.overlays.push((context, currentFrame) => {
          const radius = 9 + wave(currentFrame.time, params.speed) * 2;
          const x = size - radius - 2;
          const y = radius + 2;
          context.save();
          context.fillStyle = "#ef4444";
          context.shadowColor = "rgba(0,0,0,0.45)";
          context.shadowBlur = 4;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "white";
          context.font = `800 ${Math.round(radius * 1.25)}px system-ui, sans-serif`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(String(params.text).slice(0, 2), x, y + 0.5);
          context.restore();
        });
      },
    });

    registerEffect("eyes", {
      label: "Googly Eyes",
      category: "Overlay",
      defaults: { speed: 1.4 },
      apply(frame, params) {
        frame.overlays.push((context, currentFrame) => {
          const lookX = Math.sin(currentFrame.time * params.speed) * 2.2;
          const lookY = Math.cos(currentFrame.time * params.speed * 0.83) * 2.2;
          for (const x of [size * 0.36, size * 0.64]) {
            const y = size * 0.39;
            context.fillStyle = "white";
            context.beginPath();
            context.arc(x, y, size * 0.115, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = "#111827";
            context.beginPath();
            context.arc(x + lookX, y + lookY, size * 0.052, 0, Math.PI * 2);
            context.fill();
          }
        });
      },
    });

    registerPreset("disco", {
      label: "Disco",
      effects: { spin: { speed: 0.45 }, hue: true, pulse: true, sparkles: true, halo: true },
    });
    registerPreset("glitch-party", {
      label: "Glitch Party",
      effects: { glitch: true, hue: { speed: 0.7 }, shake: { amount: 1.5 }, scanline: true },
    });
    registerPreset("haunted", {
      label: "Haunted",
      effects: { wobble: { speed: 0.55, degrees: 24 }, fade: { speed: 0.3, minimum: 0.08 }, negative: { speed: 0.35 }, trail: true },
    });
    registerPreset("cosmic", {
      label: "Cosmic",
      effects: { orbit: { radius: 6 }, spin: { speed: -0.18 }, hue: { speed: 0.12 }, halo: true, sparkles: { count: 10 } },
    });
    registerPreset("alarm", {
      label: "Alarm",
      effects: { shake: { amount: 3.8 }, pulse: { speed: 2.2, amount: 0.18 }, badge: true, neon: true },
    });
    registerPreset("retro", {
      label: "Retro",
      effects: { pixelate: { pixels: 7 }, scanline: { speed: 0.42 }, neon: { saturation: 1.6 }, wobble: { degrees: 6 } },
    });

    return api;
  }

  function createPanel(engine, onDestroy) {
    const host = document.createElement("div");
    host.id = "favicon-fx-panel-host";
    host.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;display:block";
    document.documentElement.append(host);

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        * { box-sizing: border-box; }
        .panel {
          width: 320px;
          max-height: min(680px, calc(100vh - 32px));
          overflow: hidden;
          color: #f8fafc;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.42);
          backdrop-filter: blur(18px);
          font: 13px/1.35 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .header { display:flex; align-items:center; gap:10px; padding:12px 12px 10px 14px; cursor:move; user-select:none; }
        .title { flex:1; font-weight:750; letter-spacing:0.01em; }
        .window-button { width:28px; height:28px; padding:0; border-radius:9px; }
        .content { max-height: calc(min(680px, 100vh - 32px) - 51px); overflow:auto; padding:0 12px 12px; }
        .content[hidden] { display:none; }
        .status { padding:8px 10px; margin-bottom:10px; border-radius:10px; background:rgba(30,41,59,.75); color:#cbd5e1; font-size:12px; }
        .section { margin-top:12px; }
        .section-title { margin:0 0 7px 2px; color:#94a3b8; font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
        .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
        button {
          appearance:none; border:1px solid rgba(148,163,184,.24); color:#e2e8f0;
          background:rgba(30,41,59,.76); padding:8px 9px; border-radius:10px; cursor:pointer;
          font:inherit; transition:background .15s,border-color .15s,transform .15s;
        }
        button:hover { background:rgba(51,65,85,.95); border-color:rgba(148,163,184,.52); }
        button:active { transform:translateY(1px); }
        button.active { background:linear-gradient(135deg,#7c3aed,#db2777); border-color:rgba(255,255,255,.35); color:white; }
        button.primary { background:linear-gradient(135deg,#2563eb,#7c3aed); border-color:rgba(255,255,255,.3); color:white; }
        button.danger:hover { background:#7f1d1d; }
        .slider-row { display:grid; grid-template-columns:72px 1fr 35px; align-items:center; gap:8px; margin:8px 2px; color:#cbd5e1; }
        input[type="range"] { width:100%; accent-color:#a855f7; }
        output { color:#94a3b8; font-variant-numeric:tabular-nums; text-align:right; }
        .footer { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:12px; }
      </style>
      <section class="panel" aria-label="Favicon FX controls">
        <header class="header">
          <div class="title">Favicon FX Lab</div>
          <button class="window-button" data-action="collapse" title="Collapse">-</button>
          <button class="window-button danger" data-action="close" title="Close">x</button>
        </header>
        <div class="content">
          <div class="status" data-role="status">Loading the page favicon...</div>
          <div class="section">
            <div class="section-title">Presets</div>
            <div class="grid" data-role="presets"></div>
          </div>
          <div class="section">
            <div class="section-title">Surprise</div>
            <div class="grid">
              <button class="primary" data-action="surprise">Random combo</button>
              <button data-action="clear">Reset effects</button>
            </div>
          </div>
          <div data-role="effect-sections"></div>
          <div class="section">
            <div class="section-title">Master controls</div>
            <label class="slider-row">Speed<input data-role="speed" type="range" min="0.1" max="4" step="0.1" value="1"><output data-role="speed-output">1.0x</output></label>
            <label class="slider-row">Intensity<input data-role="intensity" type="range" min="0.1" max="2" step="0.1" value="1"><output data-role="intensity-output">1.0x</output></label>
          </div>
          <div class="footer">
            <button data-action="pause">Pause</button>
            <button data-action="restore">Restore favicon</button>
          </div>
        </div>
      </section>`;

    const content = shadow.querySelector(".content");
    const status = shadow.querySelector('[data-role="status"]');
    const presetRoot = shadow.querySelector('[data-role="presets"]');
    const effectSections = shadow.querySelector('[data-role="effect-sections"]');
    const speedInput = shadow.querySelector('[data-role="speed"]');
    const intensityInput = shadow.querySelector('[data-role="intensity"]');
    const pauseButton = shadow.querySelector('[data-action="pause"]');
    let paused = false;

    function renderControls(state) {
      status.textContent = state.sourceInfo.usedFallback
        ? "The original icon could not be read. A generated fallback is being animated."
        : `Animating: ${state.sourceInfo.sourceUrl || "page favicon"}`;

      presetRoot.replaceChildren(...state.presets.map((preset) => {
        const button = document.createElement("button");
        button.textContent = preset.label;
        button.addEventListener("click", () => engine.playPreset(preset.name));
        return button;
      }));

      const categories = new Map();
      for (const effect of state.effects) {
        const list = categories.get(effect.category) || [];
        list.push(effect);
        categories.set(effect.category, list);
      }

      effectSections.replaceChildren(...[...categories].map(([category, categoryEffects]) => {
        const section = document.createElement("div");
        section.className = "section";
        const heading = document.createElement("div");
        heading.className = "section-title";
        heading.textContent = category;
        const grid = document.createElement("div");
        grid.className = "grid";
        for (const effect of categoryEffects) {
          const button = document.createElement("button");
          button.textContent = effect.label;
          button.dataset.effect = effect.name;
          button.classList.toggle("active", effect.enabled);
          button.addEventListener("click", () => engine.toggleEffect(effect.name));
          grid.append(button);
        }
        section.append(heading, grid);
        return section;
      }));
    }

    shadow.addEventListener("click", (event) => {
      const action = event.target.closest("button")?.dataset.action;
      if (!action) return;
      if (action === "collapse") content.hidden = !content.hidden;
      if (action === "close") onDestroy();
      if (action === "surprise") engine.surprise();
      if (action === "clear") engine.clearEffects();
      if (action === "pause") {
        paused = !paused;
        if (paused) engine.stop({ restore: false });
        else engine.start();
        pauseButton.textContent = paused ? "Resume" : "Pause";
      }
      if (action === "restore") {
        engine.stop({ restore: true });
        paused = true;
        pauseButton.textContent = "Resume";
      }
    });

    speedInput.addEventListener("input", () => {
      engine.setMasterSpeed(speedInput.value);
      shadow.querySelector('[data-role="speed-output"]').value = `${Number(speedInput.value).toFixed(1)}x`;
    });
    intensityInput.addEventListener("input", () => {
      engine.setMasterIntensity(intensityInput.value);
      shadow.querySelector('[data-role="intensity-output"]').value = `${Number(intensityInput.value).toFixed(1)}x`;
    });

    const header = shadow.querySelector(".header");
    header.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const rect = host.getBoundingClientRect();
      header.setPointerCapture(event.pointerId);

      const move = (moveEvent) => {
        const left = clamp(rect.left + moveEvent.clientX - startX, 0, innerWidth - rect.width);
        const top = clamp(rect.top + moveEvent.clientY - startY, 0, innerHeight - 48);
        host.style.left = `${left}px`;
        host.style.top = `${top}px`;
        host.style.right = "auto";
      };
      const up = () => {
        header.removeEventListener("pointermove", move);
        header.removeEventListener("pointerup", up);
      };
      header.addEventListener("pointermove", move);
      header.addEventListener("pointerup", up);
    });

    const unsubscribe = engine.on("statechange", renderControls);
    engine.on("start", renderControls);
    renderControls(engine.getState());

    return {
      show() { host.style.display = "block"; },
      hide() { host.style.display = "none"; },
      toggle() { host.style.display = host.style.display === "none" ? "block" : "none"; },
      destroy() {
        unsubscribe();
        host.remove();
      },
    };
  }

  const engine = createFaviconEngine({ size: 64, fps: 30 });
  let panel;

  function destroyApplication() {
    panel?.destroy();
    engine.destroy();
    delete window[APP_KEY];
  }

  panel = createPanel(engine, destroyApplication);

  const application = {
    engine,
    panel,
    togglePanel: () => panel.toggle(),
    destroy: destroyApplication,
  };

  window[APP_KEY] = application;
  window[PUBLIC_KEY] = engine;

  engine.start().then(() => engine.playPreset("disco")).catch((error) => {
    console.error("Favicon FX could not start.", error);
  });
})();
