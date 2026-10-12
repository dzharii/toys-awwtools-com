(() => {
  'use strict';

  const THEMES = ['chrome', 'neon', 'glass', 'minimal'];
  const DEFAULT_ACCENTS = {
    chrome: '#a8c8f8', neon: '#b17bff', glass: '#9cdee6', minimal: '#ced1c9'
  };
  const DEFAULTS = Object.freeze({ theme: 'chrome', accent: DEFAULT_ACCENTS.chrome, motion: 'medium', seconds: true, format: '24' });
  const STORAGE_KEY = 'stilltime.settings.v1';
  const qs = (selector, root = document) => root.querySelector(selector);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const app = qs('#app');
  const toolbar = qs('#toolbar');
  const mainScene = qs('#mainScene');
  const pipButton = qs('#pipButton');
  const pipButtonText = qs('#pipButtonText');
  const video = qs('#pipVideo');
  const dialog = qs('#settingsDialog');
  const toastElement = qs('#toast');
  const views = new Set();
  let settings = readSettings();
  let logicalTime = Date.now();
  let lastTick = performance.now();
  let lastVisible = !document.hidden;
  let pipState = 'idle';
  let pipWindow = null;
  let pipView = null;
  let videoSession = null;
  let toastTimeout = 0;
  let lastRenderKey = '';
  let toolbarTimeout = 0;

  function validSettings(value) {
    const input = value && typeof value === 'object' ? value : {};
    const theme = THEMES.includes(input.theme) ? input.theme : DEFAULTS.theme;
    return {
      theme,
      accent: typeof input.accent === 'string' && /^#[0-9a-f]{6}$/i.test(input.accent) ? input.accent : DEFAULT_ACCENTS[theme],
      motion: ['low', 'medium', 'high'].includes(input.motion) ? input.motion : DEFAULTS.motion,
      seconds: typeof input.seconds === 'boolean' ? input.seconds : DEFAULTS.seconds,
      format: input.format === '12' || input.format === '24' ? input.format : DEFAULTS.format
    };
  }

  function readSettings() {
    try { return validSettings(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch { return { ...DEFAULTS }; }
  }

  function saveSettings() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
    catch { /* Storage may be disabled. The in-memory settings still work. */ }
  }

  function pad(value) { return String(value).padStart(2, '0'); }

  function timeString(milliseconds, options = settings) {
    const date = new Date(milliseconds);
    let hours = date.getHours();
    if (options.format === '12') hours = hours % 12 || 12;
    const result = `${pad(hours)}:${pad(date.getMinutes())}`;
    return options.seconds ? `${result}:${pad(date.getSeconds())}` : result;
  }

  function accessibleTime(milliseconds) {
    const date = new Date(milliseconds);
    const h = settings.format === '12' ? 'numeric' : '2-digit';
    return `Current local time: ${new Intl.DateTimeFormat(undefined, {
      hour: h, minute: '2-digit', ...(settings.seconds ? { second: '2-digit' } : {}),
      hour12: settings.format === '12'
    }).format(date)}`;
  }

  function createDigit(doc, character) {
    const digit = doc.createElement('span');
    digit.className = 'digit';
    digit.dataset.value = character;
    digit.setAttribute('aria-hidden', 'true');
    for (let layer = 5; layer >= 1; layer--) {
      const depth = doc.createElement('span');
      depth.className = 'digit-layer digit-depth';
      depth.style.setProperty('--layer', layer);
      depth.textContent = character;
      digit.append(depth);
    }
    const front = doc.createElement('span');
    front.className = 'digit-layer digit-front';
    front.textContent = character;
    digit.append(front);
    return digit;
  }

  function createSeparator(doc) {
    const colon = doc.createElement('span');
    colon.className = 'separator';
    colon.setAttribute('aria-hidden', 'true');
    colon.append(doc.createElement('span'), doc.createElement('span'));
    return colon;
  }

  function makeClockView(host) {
    const doc = host.ownerDocument;
    const view = {
      host,
      text: '',
      digitNodes: [],
      update(nextText, animate = true) {
        if (this.text === nextText) return;
        if (this.text.length !== nextText.length) {
          this.host.replaceChildren();
          this.digitNodes = [];
          for (const character of nextText) {
            const node = character === ':' ? createSeparator(doc) : createDigit(doc, character);
            this.host.append(node);
            this.digitNodes.push(node);
          }
          this.host.dataset.seconds = String(nextText.length > 5);
        } else {
          for (let i = 0; i < nextText.length; i++) {
            const node = this.digitNodes[i];
            if (nextText[i] === ':' || this.text[i] === nextText[i]) continue;
            const old = node.dataset.value;
            node.dataset.value = nextText[i];
            node.querySelectorAll('.digit-depth,.digit-front').forEach(layer => {
              layer.textContent = nextText[i];
            });
            node.querySelectorAll('.digit-exit').forEach(layer => layer.remove());
            node.classList.remove('is-changing');
            if (animate && !reducedMotion.matches) {
              const leaving = doc.createElement('span');
              leaving.className = 'digit-exit';
              leaving.textContent = old;
              node.append(leaving);
              leaving.addEventListener('animationend', () => leaving.remove(), { once: true });
              // Restart the CSS animation only for the digit that changed.
              void node.offsetWidth;
              node.classList.add('is-changing');
            }
          }
        }
        this.text = nextText;
      },
      destroy() { views.delete(this); this.host.replaceChildren(); }
    };
    views.add(view);
    return view;
  }

  const mainView = makeClockView(qs('#mainClock'));

  function applyThemeTo(root) {
    if (!root) return;
    root.dataset.theme = settings.theme;
    root.dataset.motion = settings.motion;
    root.style.setProperty('--accent', settings.accent);
  }

  function syncViews(animate = true, force = false) {
    const display = timeString(logicalTime);
    const key = `${display}|${settings.theme}|${settings.accent}|${settings.motion}|${settings.format}|${settings.seconds}`;
    if (!force && key === lastRenderKey) return;
    lastRenderKey = key;
    for (const view of views) {
      view.update(display, animate);
      view.host.setAttribute('aria-label', accessibleTime(logicalTime));
    }
    qs('#themeLabel').textContent = `${pad(THEMES.indexOf(settings.theme) + 1)} / ${settings.theme.toUpperCase()}`;
    qs('#formatLabel').textContent = `${settings.format} HOUR · ${settings.seconds ? 'WITH SECONDS' : 'NO SECONDS'}`;
    applyThemeTo(app);
    if (pipWindow && !pipWindow.closed) {
      applyThemeTo(pipWindow.document.querySelector('.pip-app'));
      const themeButton = pipWindow.document.querySelector('#pipThemeButton');
      const formatButton = pipWindow.document.querySelector('#pipFormatButton');
      if (themeButton) themeButton.textContent = `Theme: ${settings.theme}`;
      if (formatButton) formatButton.textContent = `${settings.format}h format`;
    }
    if (videoSession) videoSession.renderer.setScene(display, settings);
  }

  function syncSettingsControls() {
    qs('#accentColor').value = settings.accent;
    qs('#motionSelect').value = settings.motion;
    qs('#timeFormat').value = settings.format;
    qs('#showSeconds').checked = settings.seconds;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === settings.theme));
    });
  }

  function changeSettings(changes) {
    settings = validSettings({ ...settings, ...changes });
    saveSettings();
    syncSettingsControls();
    syncViews(!reducedMotion.matches);
    revealToolbar();
  }

  function tick() {
    const now = performance.now();
    const elapsed = Math.max(0, now - lastTick);
    lastTick = now;
    logicalTime += elapsed;
    const drift = Math.abs(Date.now() - logicalTime);
    if (elapsed > 1800 || drift > 1100) logicalTime = Date.now();
    syncViews();
  }

  function resynchronize() {
    lastTick = performance.now();
    logicalTime = Date.now();
    syncViews(false);
  }

  function showToast(message) {
    clearTimeout(toastTimeout);
    toastElement.textContent = message;
    toastElement.hidden = false;
    toastTimeout = setTimeout(() => { toastElement.hidden = true; }, 4800);
  }

  function revealToolbar() {
    app.classList.add('is-interacting');
    clearTimeout(toolbarTimeout);
    toolbarTimeout = setTimeout(() => {
      if (!dialog.open && !toolbar.matches(':focus-within')) app.classList.remove('is-interacting');
    }, 3000);
  }

  // Lightweight parallax: cosmetic transforms never affect logical time.
  let parallaxFrame = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  function animateParallax() {
    parallaxFrame = 0;
    if (reducedMotion.matches || app.dataset.pipActive === 'true') return;
    currentX += (targetX - currentX) * .15;
    currentY += (targetY - currentY) * .15;
    mainScene.style.setProperty('--tilt-x', `${currentX.toFixed(2)}deg`);
    mainScene.style.setProperty('--tilt-y', `${currentY.toFixed(2)}deg`);
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .04) {
      parallaxFrame = requestAnimationFrame(animateParallax);
    }
  }
  function setPointerTilt(clientX, clientY) {
    if (reducedMotion.matches) return;
    const rect = qs('#stage').getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - .5;
    const y = (clientY - rect.top) / rect.height - .5;
    const factor = settings.motion === 'high' ? 18 : settings.motion === 'low' ? 7 : 12;
    targetY = Math.max(-9, Math.min(9, x * factor));
    targetX = Math.max(-9, Math.min(9, -y * factor));
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(animateParallax);
  }
  function resetParallax() {
    targetX = 0;
    targetY = 0;
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(animateParallax);
  }

  function setPiPState(next) {
    pipState = next;
    const active = next === 'active-document' || next === 'active-video';
    app.dataset.pipActive = String(active);
    pipButton.disabled = ['opening', 'closing', 'preparing'].includes(next);
    pipButtonText.textContent = active ? 'Close floating' : pipButton.disabled ? 'Opening…' : 'Float clock';
    if (active) {
      cancelAnimationFrame(parallaxFrame); parallaxFrame = 0;
      currentX = currentY = targetX = targetY = 0;
      mainScene.style.setProperty('--tilt-x', '0deg');
      mainScene.style.setProperty('--tilt-y', '0deg');
      revealToolbar();
    }
  }

  function canDocumentPiP() {
    return Boolean(window.isSecureContext && window.documentPictureInPicture?.requestWindow);
  }
  function canVideoPiP() {
    return Boolean(document.pictureInPictureEnabled && HTMLVideoElement.prototype.requestPictureInPicture && HTMLCanvasElement.prototype.captureStream);
  }

  function endDocumentPiP() {
    if (pipView) { pipView.destroy(); pipView = null; }
    pipWindow = null;
    if (pipState === 'active-document' || pipState === 'closing') setPiPState('idle');
  }

  async function openDocumentPiP() {
    // This call must happen directly in the click path, before any other await.
    const floating = await window.documentPictureInPicture.requestWindow({ width: 480, height: 270 });
    pipWindow = floating;
    const doc = floating.document;
    doc.title = 'Stilltime · Floating clock';
    doc.body.className = 'pip-document';
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./styles.css', document.baseURI).href;
    doc.head.append(link);

    const root = doc.createElement('div');
    root.className = 'pip-app';
    const heading = doc.createElement('div');
    heading.className = 'pip-heading';
    heading.textContent = 'STILLTIME / LIVE';
    const scene = doc.createElement('div');
    scene.className = 'clock-scene';
    const face = doc.createElement('div');
    face.className = 'clock-face';
    face.setAttribute('role', 'timer');
    face.setAttribute('aria-live', 'off');
    scene.append(face);
    const footer = doc.createElement('div');
    footer.className = 'pip-controls';
    const themeButton = doc.createElement('button');
    themeButton.type = 'button';
    themeButton.id = 'pipThemeButton';
    themeButton.addEventListener('click', () => {
      const next = THEMES[(THEMES.indexOf(settings.theme) + 1) % THEMES.length];
      changeSettings({ theme: next, accent: DEFAULT_ACCENTS[next] });
    });
    const formatButton = doc.createElement('button');
    formatButton.type = 'button';
    formatButton.id = 'pipFormatButton';
    formatButton.addEventListener('click', () => changeSettings({ format: settings.format === '24' ? '12' : '24' }));
    footer.append(themeButton, formatButton);
    root.append(heading, scene, footer);
    doc.body.replaceChildren(root);
    pipView = makeClockView(face);
    floating.addEventListener('pagehide', endDocumentPiP, { once: true });
    syncViews(false, true);
    setPiPState('active-document');
  }

  function canvasPalette(theme, accent) {
    const palettes = {
      chrome: { bg: '#080d15', bg2: '#213248', face: '#f7fbff', mid: '#afc2da', depth: '#47607b' },
      neon: { bg: '#090617', bg2: '#291047', face: '#fff4ff', mid: '#d3a2ff', depth: '#452681' },
      glass: { bg: '#09191f', bg2: '#204f59', face: '#edffff', mid: '#9bd9e1', depth: '#426b78' },
      minimal: { bg: '#151716', bg2: '#303734', face: '#f6f5ee', mid: '#cdd2ca', depth: '#68736d' }
    };
    return { ...palettes[theme], accent };
  }

  class CanvasClockRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.text = '';
      this.previous = '';
      this.changedAt = new Map();
      this.options = settings;
      this.raf = 0;
      this.lastFrame = 0;
    }
    setScene(text, options) {
      if (this.text !== text) {
        const previous = this.text;
        this.previous = previous.length === text.length ? previous : text;
        const now = performance.now();
        for (let i = 0; i < text.length; i++) {
          if (this.previous[i] !== text[i]) this.changedAt.set(i, now);
        }
        this.text = text;
      }
      this.options = { ...options };
      if (!this.raf) this.draw(performance.now());
    }
    draw(timestamp) {
      const { ctx, canvas, options } = this;
      const w = canvas.width, h = canvas.height;
      const colors = canvasPalette(options.theme, options.accent);
      const bg = ctx.createRadialGradient(w / 2, h * .4, 5, w / 2, h * .5, w * .7);
      bg.addColorStop(0, colors.bg2); bg.addColorStop(1, colors.bg);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.strokeStyle = `${options.accent}20`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(w / 2, h * .53, w * .44, h * .29, -.15, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const characters = [...this.text];
      if (!characters.length) return;
      // Fit the actual glyph widths, including narrow colon separators.
      let fontSize = options.seconds ? 151 : 210;
      const maxWidth = w * .9;
      let slots;
      do {
        ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
        slots = characters.map(c => c === ':' ? fontSize * .27 : Math.max(fontSize * .55, ctx.measureText(c).width + fontSize * .02));
        if (slots.reduce((a,b) => a+b, 0) <= maxWidth) break;
        fontSize -= 2;
      } while (fontSize > 36);
      const total = slots.reduce((a,b) => a+b, 0);
      let cursor = (w - total) / 2;
      const duration = 570;
      characters.forEach((character, i) => {
        const width = slots[i];
        const x = cursor + width / 2;
        cursor += width;
        if (character === ':') {
          ctx.fillStyle = colors.face;
          ctx.shadowColor = options.accent; ctx.shadowBlur = 16;
          ctx.beginPath();ctx.arc(x, h*.44, fontSize*.036, 0, Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.arc(x, h*.60, fontSize*.036, 0, Math.PI*2);ctx.fill();
          ctx.shadowBlur = 0;
          return;
        }
        const started = this.changedAt.get(i);
        const progress = !started || reducedMotion.matches ? 1 : Math.min(1, (timestamp - started) / duration);
        if (progress >= 1) this.changedAt.delete(i);
        if (progress < 1 && this.previous[i] !== character) {
          this.drawGlyph(this.previous[i], x, h*.52 - 40*progress, fontSize, colors, 1-progress, 1+.075*progress);
        }
        this.drawGlyph(character, x, h*.52 + (1-progress)*28, fontSize, colors, progress, .92+.08*progress);
      });
      ctx.font = '600 15px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';ctx.fillStyle = colors.mid;ctx.globalAlpha = .65;
      ctx.fillText(`STILLTIME   /   ${options.theme.toUpperCase()}   /   ${options.format}H`, w/2, h*.85);
      ctx.globalAlpha = 1;
    }
    drawGlyph(character, x, y, size, colors, alpha, scale) {
      if (!character || alpha <= 0) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x,y);ctx.scale(scale,scale);
      ctx.font = `900 ${size}px Arial, Helvetica, sans-serif`;
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      for (let depth = 8; depth >= 1; depth--) {
        ctx.fillStyle = colors.depth;
        ctx.fillText(character, depth*.9, depth*1.35);
      }
      ctx.shadowColor = colors.accent;
      ctx.shadowBlur = this.options.theme === 'neon' ? 36 : this.options.theme === 'minimal' ? 5 : 17;
      const gradient = ctx.createLinearGradient(0, -size*.48, 0, size*.50);
      gradient.addColorStop(0, colors.face);gradient.addColorStop(.48, colors.mid);gradient.addColorStop(.59, colors.face);gradient.addColorStop(1, colors.depth);
      ctx.fillStyle = gradient;
      ctx.fillText(character, 0, 0);
      ctx.restore();
    }
    start() {
      if (this.raf) return;
      const frame = timestamp => {
        this.raf = requestAnimationFrame(frame);
        if (timestamp - this.lastFrame < 32) return;
        this.lastFrame = timestamp;
        this.draw(timestamp);
      };
      this.raf = requestAnimationFrame(frame);
    }
    stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; }
  }

  function disposeVideoSession() {
    if (!videoSession) return;
    videoSession.renderer.stop();
    for (const track of videoSession.stream.getTracks()) track.stop();
    video.pause();
    video.srcObject = null;
    videoSession = null;
  }

  async function prepareVideoSession() {
    if (videoSession) return videoSession;
    if (!canVideoPiP()) throw new Error('Video Picture-in-Picture is not supported.');
    const canvas = document.createElement('canvas');
    canvas.width = 960; canvas.height = 540;
    const renderer = new CanvasClockRenderer(canvas);
    renderer.setScene(timeString(logicalTime), settings);
    const stream = canvas.captureStream(30);
    const session = { canvas, renderer, stream };
    videoSession = session;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    renderer.start();
    try {
      await video.play();
      renderer.stop(); // Ready to enter PiP without continuously rendering while idle.
    } catch (error) {
      disposeVideoSession();
      throw error;
    }
    return session;
  }

  function endVideoPiP() {
    disposeVideoSession();
    if (pipState === 'active-video' || pipState === 'closing') setPiPState('idle');
  }

  async function openVideoPiP() {
    const session = await prepareVideoSession();
    session.renderer.start();
    // If media preparation used up transient activation, the user can retry.
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      throw new Error('Floating video is still preparing. Select Float clock again.');
    }
    await video.requestPictureInPicture();
    setPiPState('active-video');
  }

  async function closePiP() {
    setPiPState('closing');
    try {
      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      showToast(`Unable to close floating clock: ${error.message}`);
    } finally {
      endDocumentPiP();
      endVideoPiP();
      setPiPState('idle');
    }
  }

  async function togglePiP() {
    if (!['idle', 'active-document', 'active-video'].includes(pipState)) return;
    if (pipState !== 'idle') { await closePiP(); return; }
    if (!canDocumentPiP() && !canVideoPiP()) {
      showToast('Picture-in-Picture is not available in this browser or context. Try HTTPS or a supported desktop browser.');
      return;
    }
    setPiPState('opening');
    try {
      if (canDocumentPiP()) await openDocumentPiP();
      else await openVideoPiP();
    } catch (error) {
      if (pipWindow && !pipWindow.closed) pipWindow.close();
      endDocumentPiP();
      if (!document.pictureInPictureElement) disposeVideoSession();
      setPiPState('idle');
      const fallback = canDocumentPiP() && canVideoPiP()
        ? ' You can try video PiP in a browser where Document PiP is unavailable.' : '';
      showToast(`Could not open floating clock: ${error.message || 'Browser request was denied.'}${fallback}`);
    }
  }

  // UI bindings.
  qs('#settingsButton').addEventListener('click', () => { syncSettingsControls(); dialog.showModal(); revealToolbar(); });
  qs('#closeSettings').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', revealToolbar);
  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.themeChoice;
      changeSettings({ theme, accent: DEFAULT_ACCENTS[theme] });
    });
  });
  qs('#accentColor').addEventListener('input', event => changeSettings({ accent: event.target.value }));
  qs('#motionSelect').addEventListener('change', event => changeSettings({ motion: event.target.value }));
  qs('#timeFormat').addEventListener('change', event => changeSettings({ format: event.target.value }));
  qs('#showSeconds').addEventListener('change', event => changeSettings({ seconds: event.target.checked }));
  qs('#resetSettings').addEventListener('click', () => changeSettings({ ...DEFAULTS }));
  pipButton.addEventListener('click', togglePiP);
  // Warm the fallback video before a click when the browser lacks Document PiP.
  const warmVideo = () => {
    if (!canDocumentPiP() && canVideoPiP() && !videoSession && pipState === 'idle') {
      prepareVideoSession().catch(() => {});
    }
  };
  pipButton.addEventListener('pointerenter', warmVideo);
  pipButton.addEventListener('focus', warmVideo);
  video.addEventListener('leavepictureinpicture', endVideoPiP);
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') revealToolbar();
    if (event.target.closest('.stage')) setPointerTilt(event.clientX, event.clientY);
  }, { passive: true });
  qs('#stage').addEventListener('pointerleave', resetParallax);
  qs('#stage').addEventListener('pointerdown', event => {
    revealToolbar();
    if (event.pointerType === 'touch') setPointerTilt(event.clientX, event.clientY);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') revealToolbar(); });
  toolbar.addEventListener('focusout', () => setTimeout(revealToolbar, 0));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !lastVisible) resynchronize();
    lastVisible = !document.hidden;
  });
  window.addEventListener('pageshow', resynchronize);
  window.addEventListener('focus', () => { if (!document.hidden) resynchronize(); });
  window.addEventListener('pagehide', () => {
    if (pipWindow && !pipWindow.closed) pipWindow.close();
    disposeVideoSession();
  });
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(parallaxFrame); parallaxFrame = 0;
      currentX = currentY = targetX = targetY = 0;
      mainScene.style.setProperty('--tilt-x', '0deg');
      mainScene.style.setProperty('--tilt-y', '0deg');
    }
    syncViews(false);
  });

  // Startup.
  syncSettingsControls();
  syncViews(false);
  if (!reducedMotion.matches) {
    app.classList.add('is-starting');
    setTimeout(() => app.classList.remove('is-starting'), 1300);
  }
  revealToolbar();
  setInterval(tick, 250);
})();

