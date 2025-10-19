/* Textshot — Plain Text to Shareable Image (single-folder build, hardened)

 * Runs under file:// ; No network; SVG foreignObject → Canvas

 * Public API: window.Textshot

 */

(function () {

  'use strict';



  /** ---------- Logging ---------- */

  const Log = (() => {

    let enabled = true;

    const prefix = '[Textshot]';

    const ts = () => new Date().toISOString().split('T')[1].replace('Z','');

    function fmt(msg, ctx) {

      try {

        const flat = ctx ? ` | ${JSON.stringify(ctx, (_, v) => (v instanceof Element ? v.id || v.tagName : v))}` : '';

        return `${prefix} ${ts()} — ${msg}${flat}`;

      } catch { return `${prefix} ${ts()} — ${msg}`; }

    }

    return {

      setEnabled(b){ enabled = !!b; },

      debug(msg, ctx){ if (enabled) console.debug(fmt(msg, ctx)); },

      info(msg, ctx){ if (enabled) console.info(fmt(msg, ctx)); },

      warn(msg, ctx){ if (enabled) console.warn(fmt(msg, ctx)); },

      error(msg, ctx){ console.error(fmt(msg, ctx)); },

      group(label, ctx){ if (enabled) console.groupCollapsed(fmt(label, ctx)); },

      groupEnd(){ if (enabled) console.groupEnd(); }

    };

  })();



  /** ---------- Utilities ---------- */

  const $ = (sel, root = document) => root.querySelector(sel);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const isNumber = (n) => typeof n === 'number' && Number.isFinite(n);



  function debounce(fn, wait = 120) {

    let t = null;

    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };

  }

  function rafBatch(fn) {

    let scheduled = false;

    return function (...args) {

      if (scheduled) return;

      scheduled = true;

      requestAnimationFrame(() => { scheduled = false; fn.apply(this, args); });

    };

  }

  const isMobileViewport = () => window.matchMedia('(max-width: 679px)').matches;



  function normalizePlainText(str) {

    if (typeof str !== 'string') return '';

    let s = str.replace(/\r\n?/g, '\n');

    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

    return s;

  }

  function isForbiddenFormattingShortcut(e) {

    const cmd = e.ctrlKey || e.metaKey; if (!cmd) return false;

    const k = e.key.toLowerCase();

    return k === 'b' || k === 'i' || k === 'u' || k === 'k';

  }

  function svgToDataUrl(svgString) {

    const encoded = encodeURIComponent(svgString).replace(/'/g, '%27').replace(/"/g, '%22');

    return `data:image/svg+xml;charset=utf-8,${encoded}`;

  }



  const MAX_EDGE = 8192;

  const MAX_AREA = 32000000;



  /** ---------- Themes ---------- */

  window.TextshotThemes = [

    // Classic Themes

    { id:"classic-light", name:"📄 Classic Light", group:"Classic", description:"Light background, deep gray text, generous leading.",

      tokens:{ "--bg":"#ffffff","--fg":"#111214","--accent":"#0a84ff","--shadow":"0 10px 40px rgba(0,0,0,0.12)","--radius":"18px","--watermark":"rgba(0,0,0,0.38)" },

      baseFontSizePx:18, lineHeight:1.6, fontFamilyStack:"ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", paddingPx:32, maxContentWidthCh:90 },

    { id:"classic-dark", name:"🌙 Classic Dark", group:"Classic", description:"Nearly black background with near-white text.",

      tokens:{ "--bg":"#0e0f12","--fg":"#e9ecf1","--accent":"#5b9cff","--shadow":"0 10px 40px rgba(0,0,0,0.55)","--radius":"18px","--watermark":"rgba(255,255,255,0.40)" },

      baseFontSizePx:18, lineHeight:1.6, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, Noto Sans, 'Apple Color Emoji','Segoe UI Emoji'", paddingPx:32, maxContentWidthCh:90 },

    { id:"cream-ink", name:"📜 Cream & Ink", group:"Classic", description:"Soft cream paper, ink black text.",

      tokens:{ "--bg":"#f7f3e9","--fg":"#1f2328","--accent":"#7d5fff","--shadow":"0 8px 28px rgba(68,48,0,0.18)","--radius":"16px","--watermark":"rgba(31,35,40,0.35)" },

      baseFontSizePx:19, lineHeight:1.56, fontFamilyStack:"ui-serif, Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif", paddingPx:36, maxContentWidthCh:80 },

    { id:"paper-gray", name:"📋 Paper Gray", group:"Classic", description:"Warm gray paper with charcoal text.",

      tokens:{ "--bg":"#efefef","--fg":"#202325","--accent":"#2563eb","--shadow":"0 8px 30px rgba(0,0,0,0.18)","--radius":"14px","--watermark":"rgba(0,0,0,0.38)" },

      baseFontSizePx:18, lineHeight:1.58, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:88 },



    // Dark Themes

    { id:"slate", name:"🌃 Slate", group:"Dark", description:"Slate background, bright text, subtle blue accent.",

      tokens:{ "--bg":"#0f172a","--fg":"#e5e7eb","--accent":"#60a5fa","--shadow":"0 10px 40px rgba(0,0,0,0.55)","--radius":"16px","--watermark":"rgba(229,231,235,0.42)" },

      baseFontSizePx:18, lineHeight:1.62, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:30, maxContentWidthCh:88 },

    { id:"ink-deck", name:"🖤 Ink Deck", group:"Dark", description:"Dark deck with neutral text for high contrast.",

      tokens:{ "--bg":"#14161c","--fg":"#f3f4f6","--accent":"#22d3ee","--shadow":"0 12px 44px rgba(0,0,0,0.6)","--radius":"18px","--watermark":"rgba(243,244,246,0.42)" },

      baseFontSizePx:20, lineHeight:1.52, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:84 },



    // Warm Themes

    { id:"sunrise", name:"🌅 Sunrise", group:"Warm", description:"Pale sunrise canvas with soft dark text.",

      tokens:{ "--bg":"#fff7ed","--fg":"#1f2937","--accent":"#f97316","--shadow":"0 8px 26px rgba(102,58,0,0.18)","--radius":"16px","--watermark":"rgba(31,41,55,0.35)" },

      baseFontSizePx:18, lineHeight:1.6, fontFamilyStack:"ui-serif, Georgia, Cambria, Times, serif", paddingPx:32, maxContentWidthCh:78 },



    // Special Themes

    { id:"mono-notes", name:"⌨️ Mono Notes", group:"Special", description:"Readable monospaced stack.",

      tokens:{ "--bg":"#fafafa","--fg":"#111827","--accent":"#0ea5e9","--shadow":"0 8px 28px rgba(0,0,0,0.14)","--radius":"12px","--watermark":"rgba(17,24,39,0.35)" },

      baseFontSizePx:17, lineHeight:1.5, fontFamilyStack:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", paddingPx:24, maxContentWidthCh:90 },

    { id:"solarized-lite", name:"☀️ Solarized Lite", group:"Special", description:"Solarized-inspired light.",

      tokens:{ "--bg":"#fdf6e3","--fg":"#073642","--accent":"#268bd2","--shadow":"0 8px 28px rgba(7,54,66,0.16)","--radius":"14px","--watermark":"rgba(7,54,66,0.38)" },

      baseFontSizePx:18, lineHeight:1.58, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:30, maxContentWidthCh:84 },

    { id:"high-contrast", name:"⚫ High Contrast", group:"Special", description:"Absolute black/white punch.",

      tokens:{ "--bg":"#ffffff","--fg":"#000000","--accent":"#000000","--shadow":"0 10px 40px rgba(0,0,0,0.2)","--radius":"0px","--watermark":"rgba(0,0,0,0.45)" },

      baseFontSizePx:19, lineHeight:1.55, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:84 },

    { id:"night-contrast", name:"⚪ Night Contrast", group:"Special", description:"Black canvas, white text.",

      tokens:{ "--bg":"#000000","--fg":"#ffffff","--accent":"#ffffff","--shadow":"0 10px 40px rgba(0,0,0,0.65)","--radius":"0px","--watermark":"rgba(255,255,255,0.45)" },

      baseFontSizePx:19, lineHeight:1.55, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:84 },



    // Procedural Gradient Themes

    { id:"gradient-ocean", name:"🌊 Ocean Wave", group:"Gradients", description:"Calm ocean gradient with excellent readability.",

      tokens:{ "--bg":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","--fg":"#ffffff","--accent":"#a5f3fc","--shadow":"0 10px 40px rgba(0,0,0,0.3)","--radius":"20px","--watermark":"rgba(255,255,255,0.5)" },

      baseFontSizePx:19, lineHeight:1.6, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:36, maxContentWidthCh:85, procedural:"gradient" },

    { id:"gradient-sunset", name:"🌇 Sunset Glow", group:"Gradients", description:"Warm sunset gradient, soft readable text.",

      tokens:{ "--bg":"linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)","--fg":"#1a1a1a","--accent":"#ffffff","--shadow":"0 10px 40px rgba(0,0,0,0.25)","--radius":"20px","--watermark":"rgba(26,26,26,0.4)" },

      baseFontSizePx:19, lineHeight:1.6, fontFamilyStack:"ui-serif, Georgia, Cambria, Times, serif", paddingPx:36, maxContentWidthCh:85, procedural:"gradient" },

    { id:"gradient-forest", name:"🌲 Forest Mist", group:"Gradients", description:"Deep forest greens with crisp white text.",

      tokens:{ "--bg":"linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)","--fg":"#e8f5e9","--accent":"#81c784","--shadow":"0 10px 40px rgba(0,0,0,0.5)","--radius":"18px","--watermark":"rgba(232,245,233,0.45)" },

      baseFontSizePx:18, lineHeight:1.62, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:32, maxContentWidthCh:88, procedural:"gradient" },

    { id:"gradient-lavender", name:"💜 Lavender Dream", group:"Gradients", description:"Soft lavender gradient with dark readable text.",

      tokens:{ "--bg":"linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)","--fg":"#1a202c","--accent":"#553c9a","--shadow":"0 8px 30px rgba(0,0,0,0.2)","--radius":"18px","--watermark":"rgba(26,32,44,0.35)" },

      baseFontSizePx:18, lineHeight:1.58, fontFamilyStack:"ui-serif, Georgia, Cambria, Times, serif", paddingPx:32, maxContentWidthCh:85, procedural:"gradient" },



    // Procedural Pattern Themes

    { id:"pattern-dots", name:"🔘 Subtle Dots", group:"Patterns", description:"Light dot pattern with solid readable background.",

      tokens:{ "--bg":"#f8fafc","--fg":"#0f172a","--accent":"#3b82f6","--shadow":"0 8px 28px rgba(0,0,0,0.15)","--radius":"16px","--watermark":"rgba(15,23,42,0.35)" },

      baseFontSizePx:18, lineHeight:1.6, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:32, maxContentWidthCh:88, procedural:"dots", patternOpacity:0.03 },

    { id:"pattern-grid", name:"📐 Minimal Grid", group:"Patterns", description:"Faint grid lines, maximum readability.",

      tokens:{ "--bg":"#ffffff","--fg":"#1e293b","--accent":"#0ea5e9","--shadow":"0 8px 28px rgba(0,0,0,0.12)","--radius":"14px","--watermark":"rgba(30,41,59,0.35)" },

      baseFontSizePx:18, lineHeight:1.58, fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:30, maxContentWidthCh:88, procedural:"grid", patternOpacity:0.04 },

    { id:"pattern-lines", name:"📏 Soft Lines", group:"Patterns", description:"Horizontal lines with clean text.",

      tokens:{ "--bg":"#fafafa","--fg":"#18181b","--accent":"#8b5cf6","--shadow":"0 8px 28px rgba(0,0,0,0.14)","--radius":"16px","--watermark":"rgba(24,24,27,0.35)" },

      baseFontSizePx:18, lineHeight:1.6, fontFamilyStack:"ui-serif, Georgia, Cambria, Times, serif", paddingPx:32, maxContentWidthCh:86, procedural:"lines", patternOpacity:0.05 },

    { id:"pattern-noise", name:"🌫️ Paper Texture", group:"Patterns", description:"Subtle paper texture for organic feel.",

      tokens:{ "--bg":"#fefefe","--fg":"#1c1917","--accent":"#dc2626","--shadow":"0 8px 28px rgba(0,0,0,0.15)","--radius":"12px","--watermark":"rgba(28,25,23,0.35)" },

      baseFontSizePx:18, lineHeight:1.58, fontFamilyStack:"ui-serif, Georgia, Cambria, Times, serif", paddingPx:32, maxContentWidthCh:86, procedural:"noise", patternOpacity:0.02 }

  ];



  /** ---------- State ---------- */

  const state = {

    text: '',

    themeId: 'classic-light',

    textScale: 1,

    columns: 50,

    lines: 5,

    paddingPx: 32,

    watermarkText: '',

    renderScale: isMobileViewport() ? 2 : 3,

    lastCanvas: null,

    overflowFlag: false,

    avgCharWidth: 10,

    lineBoxHeight: 20,

  };



  /** ---------- DOM refs ---------- */

  const refs = {};

  function bindRefs() {

    refs.app = $('#ts-app');

    refs.theme = $('#ts-theme');

    refs.textScale = $('#ts-text-scale');

    refs.cols = $('#ts-cols');

    refs.rows = $('#ts-rows');

    refs.padding = $('#ts-padding');

    refs.watermark = $('#ts-watermark');

    refs.autofit = $('#ts-autofit');

    refs.generate = $('#ts-generate');

    refs.status = $('#ts-status');

    refs.editor = $('#ts-editor');

    refs.editorContainer = $('#ts-editor-container');

    refs.watermarkNode = $('#ts-watermark-node');

    refs.sizeReadout = $('#ts-size-readout');

    refs.preview = $('#ts-preview');

    refs.previewHint = $('.ts-preview-hint', refs.preview);

    refs.readoutCols = $('#ts-cols-readout');

    refs.readoutRows = $('#ts-rows-readout');

    refs.readoutScale = $('#ts-text-scale-readout');

    refs.readoutPadding = $('#ts-padding-readout');



    refs.measure = document.createElement('span');

    Object.assign(refs.measure.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre', left: '-9999px', top: '-9999px' });

    refs.measure.id = 'ts-measure-span';

    document.body.appendChild(refs.measure);

    Log.debug('Refs bound', { ids: Object.keys(refs) });

  }



  /** ---------- Theme handling ---------- */

  function populateThemeSelect() {

    refs.theme.innerHTML = '';



    // Group themes by category

    const groups = {};

    window.TextshotThemes.forEach(theme => {

      const group = theme.group || 'Other';

      if (!groups[group]) groups[group] = [];

      groups[group].push(theme);

    });



    // Create optgroups for each category

    Object.keys(groups).forEach(groupName => {

      const optgroup = document.createElement('optgroup');

      optgroup.label = groupName;



      groups[groupName].forEach(theme => {

        const opt = document.createElement('option');

        opt.value = theme.id;

        opt.textContent = theme.name;

        opt.title = theme.description;

        optgroup.appendChild(opt);

      });



      refs.theme.appendChild(optgroup);

    });



    Log.debug('Theme select populated', { themeCount: window.TextshotThemes.length, groupCount: Object.keys(groups).length });

  }



  function applyTheme(themeId) {

    const theme = window.TextshotThemes.find(t => t.id === themeId);

    if (!theme) { Log.error('applyTheme: theme not found', { themeId }); return; }



    state.themeId = themeId;

    const tokens = theme.tokens || {};

    for (const [k, v] of Object.entries(tokens)) refs.editorContainer.style.setProperty(k, v);

    refs.editorContainer.style.setProperty('--font-stack', theme.fontFamilyStack);

    refs.editorContainer.style.setProperty('--line-height', String(theme.lineHeight));



    // Apply procedural patterns to editor preview

    if (theme.procedural && theme.procedural !== 'gradient') {

      const opacity = theme.patternOpacity || 0.05;

      let pattern = '';



      if (theme.procedural === 'dots') {

        pattern = `radial-gradient(circle at center, rgba(0,0,0,${opacity}) 2px, transparent 2px)`;

        refs.editorContainer.style.backgroundSize = '20px 20px';

      } else if (theme.procedural === 'grid') {

        pattern = `linear-gradient(rgba(0,0,0,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${opacity}) 1px, transparent 1px)`;

        refs.editorContainer.style.backgroundSize = '30px 30px';

      } else if (theme.procedural === 'lines') {

        pattern = `repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0,0,0,${opacity}) 23px, rgba(0,0,0,${opacity}) 24px)`;

        refs.editorContainer.style.backgroundSize = '100% 24px';

      } else if (theme.procedural === 'noise') {

        // For noise, we use a data URL with a tiny noise pattern

        const noiseCanvas = document.createElement('canvas');

        noiseCanvas.width = 64;

        noiseCanvas.height = 64;

        const noiseCtx = noiseCanvas.getContext('2d');

        const imageData = noiseCtx.createImageData(64, 64);

        for (let i = 0; i < imageData.data.length; i += 4) {

          const value = Math.random() * 255 * opacity;

          imageData.data[i] = value;

          imageData.data[i + 1] = value;

          imageData.data[i + 2] = value;

          imageData.data[i + 3] = 255;

        }

        noiseCtx.putImageData(imageData, 0, 0);

        pattern = `url(${noiseCanvas.toDataURL()})`;

        refs.editorContainer.style.backgroundSize = '64px 64px';

      }



      if (pattern) {

        const bgColor = tokens['--bg'] || '#fff';

        refs.editorContainer.style.background = `${pattern}, ${bgColor}`;

      }

    } else {

      // Reset background to just the color/gradient

      refs.editorContainer.style.background = '';

      refs.editorContainer.style.backgroundSize = '';

    }



    const fontSize = Math.round(theme.baseFontSizePx * state.textScale);

    refs.editorContainer.style.setProperty('--font-size', `${fontSize}px`);



    if (!state._userSetPadding) { state.paddingPx = theme.paddingPx; refs.padding.value = String(state.paddingPx); }

    refs.editorContainer.style.setProperty('--pad', `${state.paddingPx}px`);

    if (tokens['--watermark']) refs.editorContainer.style.setProperty('--watermark', tokens['--watermark']);



    refs.readoutScale.textContent = `× ${state.textScale.toFixed(2)}`;

    refs.readoutCols.textContent = `${state.columns}`;

    refs.readoutRows.textContent = `${state.lines}`;

    refs.readoutPadding.textContent = `${state.paddingPx}px`;



    measureTypography();

    scheduleSizeApply();



    Log.info('Theme applied', { themeId, baseFontSizePx: theme.baseFontSizePx, lineHeight: theme.lineHeight, fontFamilyStack: theme.fontFamilyStack, resolvedFontSizePx: fontSize, paddingPx: state.paddingPx });

  }



  /** ---------- Measurement ---------- */

  function measurementSample() {

    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    const nums = '0123456789';

    const sym = '.,;:!?@#$%&()[]{}<>+=-/\\ _—–“”"\'`|*';

    return (base + base + nums + nums + sym).repeat(6);

  }



  function measureTypography() {

    const cs = getComputedStyle(refs.editor);

    refs.measure.style.fontFamily = cs.fontFamily;

    refs.measure.style.fontSize = cs.fontSize;

    refs.measure.style.lineHeight = cs.lineHeight;

    refs.measure.textContent = measurementSample();



    const width = refs.measure.getBoundingClientRect().width;

    const len = refs.measure.textContent.length || 1;

    state.avgCharWidth = width / len;



    let px = 0;

    if (cs.lineHeight.endsWith('px')) px = parseFloat(cs.lineHeight);

    else px = parseFloat(cs.fontSize) * (parseFloat(cs.lineHeight) || 1.5);

    state.lineBoxHeight = px;



    Log.debug('Typography measured', { fontFamily: cs.fontFamily, fontSize: cs.fontSize, lineHeightCSS: cs.lineHeight, avgCharWidth: Number(state.avgCharWidth.toFixed(4)), lineBoxHeight: Number(state.lineBoxHeight.toFixed(2)) });

  }



  /** ---------- Sizing ---------- */

  function computeEditorCssSize() {

    const pad = state.paddingPx;

    const contentW = state.columns * state.avgCharWidth;

    const contentH = state.lines * state.lineBoxHeight;

    return { width: Math.round(contentW + pad * 2), height: Math.round(contentH + pad * 2) };

  }



  function applyEditorSize() {

    const { width, height } = computeEditorCssSize();

    refs.editorContainer.style.width = `${width}px`;

    refs.editorContainer.style.height = `${height}px`;

    detectOverflowAndUpdateReadout();

    updateGenerateEnabled();

    Log.debug('Editor size applied', { width, height, columns: state.columns, lines: state.lines, paddingPx: state.paddingPx, avgCharWidth: Number(state.avgCharWidth.toFixed(4)), lineBoxHeight: Number(state.lineBoxHeight.toFixed(2)), overflow: state.overflowFlag });

  }

  const scheduleSizeApply = rafBatch(applyEditorSize);



  /** ---------- Overflow ---------- */

  function detectOverflowAndUpdateReadout() {

    const clientH = refs.editorContainer.clientHeight;

    const scrollH = refs.editor.scrollHeight;

    state.overflowFlag = scrollH > clientH + 1;

    const { width, height } = computeEditorCssSize();

    const linesMissing = Math.max(0, Math.ceil((scrollH - clientH) / state.lineBoxHeight));

    refs.sizeReadout.textContent = `${width} × ${height} CSS px — ${state.columns} cols × ${state.lines} lines — ${state.overflowFlag ? `overflow by ~${linesMissing} line(s)` : 'fits'}`;

    if (state.overflowFlag) setStatus(`Text exceeds configured lines. Increase lines or enable Auto-fit (overflow ~${linesMissing} line${linesMissing !== 1 ? 's' : ''}).`, 'warn'); else clearStatusIfHint();

    Log.debug('Overflow check', { clientHeight: clientH, scrollHeight: scrollH, linesMissing, overflow: state.overflowFlag });

  }



  /** ---------- Status ---------- */

  function setStatus(msg, kind = 'info') { refs.status.textContent = msg; refs.status.dataset.kind = kind; Log.info(`Status: ${kind}`, { msg }); }

  function clearStatusIfHint() { if (!refs.status.dataset.locked) { refs.status.textContent = ''; refs.status.dataset.kind = ''; } }

  function clearStatusAll() { refs.status.textContent = ''; refs.status.dataset.kind = ''; delete refs.status.dataset.locked; }



  /** ---------- Editor sync & sanitization ---------- */

  function insertPlainTextAtSelection(text) { document.execCommand('insertText', false, text); }

  function syncStateFromEditor() {

    // Use innerText to preserve line breaks, or fallback to manual conversion

    let text = '';

    if ('innerText' in refs.editor) {

      text = refs.editor.innerText || '';

    } else {

      // Fallback: convert <br> and <div> to newlines

      const html = refs.editor.innerHTML || '';

      text = html

        .replace(/<br\s*\/?>/gi, '\n')

        .replace(/<\/div><div>/gi, '\n')

        .replace(/<div>/gi, '\n')

        .replace(/<[^>]+>/g, '');

    }

    state.text = normalizePlainText(text);

    return state.text;

  }



  // NEW: authoritative control sync right before render (fixes stale 80x40 logs)

  function syncStateFromControls() {

    const themeId = refs.theme.value;

    const textScale = clamp(parseFloat(refs.textScale.value), parseFloat(refs.textScale.min), parseFloat(refs.textScale.max));

    const columns = clamp(Math.round(parseFloat(refs.cols.value)), parseFloat(refs.cols.min), parseFloat(refs.cols.max));

    const lines = clamp(Math.round(parseFloat(refs.rows.value)), parseFloat(refs.rows.min), parseFloat(refs.rows.max));

    const paddingPx = clamp(Math.round(parseFloat(refs.padding.value)), parseFloat(refs.padding.min), parseFloat(refs.padding.max));



    let changed = false;

    if (state.themeId !== themeId) { state.themeId = themeId; changed = true; }

    if (state.textScale !== textScale) { state.textScale = textScale; changed = true; }

    if (state.columns !== columns) { state.columns = columns; changed = true; }

    if (state.lines !== lines) { state.lines = lines; changed = true; }

    if (state.paddingPx !== paddingPx) { state.paddingPx = paddingPx; state._userSetPadding = true; changed = true; }



    // Re-apply theme variables dependent on scale/padding

    if (changed) {

      refs.theme.value = state.themeId;

      refs.textScale.value = String(state.textScale);

      refs.cols.value = String(state.columns);

      refs.rows.value = String(state.lines);

      refs.padding.value = String(state.paddingPx);

      applyTheme(state.themeId);

      refs.editorContainer.style.setProperty('--pad', `${state.paddingPx}px`);

      scheduleSizeApply();

    }

    Log.debug('Controls synced', { themeId: state.themeId, textScale: state.textScale, columns: state.columns, lines: state.lines, paddingPx: state.paddingPx, changed });

  }



  function onPastePlain(e) { e.preventDefault(); const t = e.clipboardData ? e.clipboardData.getData('text/plain') : ''; insertPlainTextAtSelection(normalizePlainText(t)); syncStateFromEditor(); updateGenerateEnabled(); detectOverflowAndUpdateReadout(); Log.debug('Paste handled as plain text', { length: t.length }); }

  function onDropPrevent(e) { e.preventDefault(); e.stopPropagation(); Log.warn('Drop prevented on editor'); }

  function onKeydownEditor(e) {

    if (isForbiddenFormattingShortcut(e)) { e.preventDefault(); Log.warn('Blocked formatting shortcut', { key: e.key, ctrl: e.ctrlKey, meta: e.metaKey }); return; }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doGenerate(); }

    if (e.key === 'Escape') clearStatusAll();

  }

  function onEditorInput() {

    syncStateFromEditor();

    updateGenerateEnabled();

    detectOverflowAndUpdateReadout();

    if (refs.autofit.checked) {

      autoFitLinesIfNeeded();

    }

    Log.debug('Editor input', { length: state.text.length });

  }



  /** ---------- Controls binding ---------- */

  function bindControls() {

    refs.textScale.addEventListener('input', rafBatch(() => { state.textScale = clamp(parseFloat(refs.textScale.value), parseFloat(refs.textScale.min), parseFloat(refs.textScale.max)); refs.readoutScale.textContent = `× ${state.textScale.toFixed(2)}`; applyTheme(state.themeId); }));

    const onCols = rafBatch(() => { state.columns = clamp(Math.round(parseFloat(refs.cols.value)), parseFloat(refs.cols.min), parseFloat(refs.cols.max)); refs.readoutCols.textContent = `${state.columns}`; scheduleSizeApply(); });

    const onRows = rafBatch(() => { state.lines = clamp(Math.round(parseFloat(refs.rows.value)), parseFloat(refs.rows.min), parseFloat(refs.rows.max)); refs.readoutRows.textContent = `${state.lines}`; scheduleSizeApply(); });

    refs.cols.addEventListener('input', onCols); refs.rows.addEventListener('input', onRows);



    refs.padding.addEventListener('input', rafBatch(() => { state.paddingPx = clamp(Math.round(parseFloat(refs.padding.value)), parseFloat(refs.padding.min), parseFloat(refs.padding.max)); state._userSetPadding = true; refs.readoutPadding.textContent = `${state.paddingPx}px`; refs.editorContainer.style.setProperty('--pad', `${state.paddingPx}px`); scheduleSizeApply(); }));

    refs.theme.addEventListener('change', () => setTheme(refs.theme.value));

    refs.watermark.addEventListener('input', debounce(() => setWatermark(refs.watermark.value || ''), 50));

    refs.autofit.addEventListener('change', () => {

      if (refs.autofit.checked) {

        autoFitLinesIfNeeded();

      }

      detectOverflowAndUpdateReadout();

    });

    refs.generate.addEventListener('click', doGenerate);



    refs.editor.addEventListener('paste', onPastePlain);

    refs.editor.addEventListener('drop', onDropPrevent);

    refs.editor.addEventListener('dragover', onDropPrevent);

    refs.editor.addEventListener('keydown', onKeydownEditor);

    refs.editor.addEventListener('input', debounce(onEditorInput, 50));

    const immediateSync = () => { syncStateFromEditor(); updateGenerateEnabled(); };

    refs.editor.addEventListener('keyup', immediateSync);

    refs.editor.addEventListener('compositionend', immediateSync);



    document.addEventListener('keydown', (e) => {

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doGenerate(); }

      if (e.key === 'Escape') clearStatusAll();

    });



    Log.debug('Controls & editor events bound');

  }



  /** ---------- Public setters ---------- */

  function setTheme(themeId) {

    Log.group('API setTheme()', { themeId });

    const exists = window.TextshotThemes.some(t => t.id === themeId);

    if (!exists) { Log.error('setTheme: invalid themeId', { themeId }); Log.groupEnd(); return; }

    refs.theme.value = themeId; applyTheme(themeId); Log.groupEnd();

  }

  function setTextScale(multiplier) {

    Log.group('API setTextScale()', { multiplier });

    const min = parseFloat(refs.textScale.min), max = parseFloat(refs.textScale.max);

    state.textScale = clamp(multiplier, min, max); refs.textScale.value = String(state.textScale); applyTheme(state.themeId); Log.groupEnd();

  }

  function setColumnsLines(cols, rows) {

    Log.group('API setColumnsLines()', { cols, rows });

    state.columns = clamp(Math.round(cols), parseFloat(refs.cols.min), parseFloat(refs.cols.max));

    state.lines = clamp(Math.round(rows), parseFloat(refs.rows.min), parseFloat(refs.rows.max));

    refs.cols.value = String(state.columns); refs.rows.value = String(state.lines);

    refs.readoutCols.textContent = `${state.columns}`; refs.readoutRows.textContent = `${state.lines}`;

    scheduleSizeApply(); Log.groupEnd();

  }

  function setPadding(paddingPx) {

    Log.group('API setPadding()', { paddingPx });

    state.paddingPx = clamp(Math.round(paddingPx), parseFloat(refs.padding.min), parseFloat(refs.padding.max));

    state._userSetPadding = true; refs.padding.value = String(state.paddingPx);

    refs.readoutPadding.textContent = `${state.paddingPx}px`; refs.editorContainer.style.setProperty('--pad', `${state.paddingPx}px`);

    scheduleSizeApply(); Log.groupEnd();

  }

  function setWatermark(text) {

    const t = (text || '').slice(0, 80); state.watermarkText = t;

    refs.watermark.value = t; refs.watermarkNode.textContent = t; detectOverflowAndUpdateReadout();

    Log.info('Watermark updated', { watermarkText: t });

  }

  function getState() { const snapshot = { ...state, lastCanvas: !!state.lastCanvas }; Log.debug('API getState()', snapshot); return { ...state, lastCanvas: state.lastCanvas }; }



  /** ---------- Auto-fit ---------- */

  function autoFitLinesIfNeeded() {

    const clientH = refs.editorContainer.clientHeight;

    const scrollH = refs.editor.scrollHeight;

    const minLines = parseFloat(refs.rows.min);

    const maxLines = parseFloat(refs.rows.max);

    const pad = state.paddingPx;



    let newLines = state.lines;



    // If content overflows, grow

    if (scrollH > clientH + 1) {

      const missing = Math.ceil((scrollH - clientH) / state.lineBoxHeight);

      newLines = clamp(state.lines + missing, minLines, maxLines);

    }

    // If content fits with room to spare, try to shrink

    else {

      // scrollH is the content height inside the editor (which already has padding)

      // Container size formula: height = (lines × lineBoxHeight) + (2 × padding)

      // We want to find lines such that: (lines × lineBoxHeight) + (2 × padding) >= scrollH + (2 × padding)

      // Simplifies to: lines >= scrollH / lineBoxHeight

      const neededLines = Math.ceil(scrollH / state.lineBoxHeight);



      const targetLines = Math.max(neededLines, minLines);



      // Only shrink if we can reduce by at least 1 line (avoid constant jitter)

      if (state.lines > targetLines) {

        newLines = clamp(targetLines, minLines, maxLines);

      }

    }



    if (newLines !== state.lines) {

      state.lines = newLines;

      refs.rows.value = String(newLines);

      refs.readoutRows.textContent = `${newLines}`;

      scheduleSizeApply();

      setStatus(`Auto-fit adjusted to ${newLines} lines.`, 'info');

      Log.info('Auto-fit applied', { scrollH, clientH, newLines });

    }

  }



  /** ---------- Snapshot ---------- */

  function buildSnapshotHTML(width, height) {

    const cs = getComputedStyle(refs.editor);

    const containerCS = getComputedStyle(refs.editorContainer);

    const pad = state.paddingPx;

    const radius = containerCS.getPropertyValue('border-radius') || '0px';

    const shadow = containerCS.getPropertyValue('box-shadow') || 'none';

    const fontFamily = cs.fontFamily, fontSize = cs.fontSize, lineHeight = cs.lineHeight;

    const color = containerCS.getPropertyValue('--fg') || '#000';

    const background = containerCS.getPropertyValue('--bg') || '#fff';

    const watermarkColor = containerCS.getPropertyValue('--watermark') || 'rgba(0,0,0,.35)';

    const text = state.text;



    const htmlText = text.split('\n').map(line => {

      const esc = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

      return esc || '<span style="white-space:pre;">\u200B</span>';

    }).join('<br/>');



    const wmHTML = state.watermarkText

      ? `<div style="position:absolute; right:${pad}px; bottom:${pad}px; color:${watermarkColor}; font-family:${fontFamily}; font-size:calc(${fontSize} * 0.8); line-height:1.2; pointer-events:none; user-select:none;">${escapeHtml(state.watermarkText)}</div>`

      : '';



    return `

      <div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${width}px;height:${height}px;background:${background};color:${color};border-radius:${radius};box-shadow:${shadow};overflow:hidden;">

        <div style="font-family:${fontFamily};font-size:${fontSize};line-height:${lineHeight};color:${color};padding:${pad}px;white-space:pre-wrap;word-break:break-word;">

          ${htmlText}

        </div>

        ${wmHTML}

      </div>

    `;

  }

  function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }



  /** ---------- Procedural Background Generators ---------- */

  function drawProceduralBackground(ctx, width, height, theme) {

    if (!theme.procedural) return;



    const opacity = theme.patternOpacity || 0.05;



    if (theme.procedural === 'gradient') {

      // Gradient is handled in fillStyle directly

      return;

    }



    if (theme.procedural === 'dots') {

      ctx.save();

      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;

      const spacing = 20;

      for (let x = 0; x < width; x += spacing) {

        for (let y = 0; y < height; y += spacing) {

          ctx.beginPath();

          ctx.arc(x, y, 2, 0, Math.PI * 2);

          ctx.fill();

        }

      }

      ctx.restore();

    }



    if (theme.procedural === 'grid') {

      ctx.save();

      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;

      ctx.lineWidth = 1;

      const spacing = 30;



      for (let x = 0; x < width; x += spacing) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, height);

        ctx.stroke();

      }



      for (let y = 0; y < height; y += spacing) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(width, y);

        ctx.stroke();

      }

      ctx.restore();

    }



    if (theme.procedural === 'lines') {

      ctx.save();

      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;

      ctx.lineWidth = 1;

      const spacing = 24;



      for (let y = 0; y < height; y += spacing) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(width, y);

        ctx.stroke();

      }

      ctx.restore();

    }



    if (theme.procedural === 'noise') {

      ctx.save();

      const imageData = ctx.getImageData(0, 0, width, height);

      const data = imageData.data;



      for (let i = 0; i < data.length; i += 4) {

        const noise = (Math.random() - 0.5) * opacity * 255;

        data[i] += noise;     // R

        data[i + 1] += noise; // G

        data[i + 2] += noise; // B

      }



      ctx.putImageData(imageData, 0, 0);

      ctx.restore();

    }

  }



  /** ---------- Render (Direct Canvas) ---------- */

  async function renderEditorToCanvas() {

    const { width, height } = computeEditorCssSize();

    let scale = state.renderScale;



    Log.group('Render begin', { cssWidth: width, cssHeight: height, requestedScale: scale, themeId: state.themeId, textScale: state.textScale, columns: state.columns, lines: state.lines, paddingPx: state.paddingPx, watermark: state.watermarkText, overflow: state.overflowFlag });



    const scaledW = (w, s) => Math.round(w * s);

    const scaledH = (h, s) => Math.round(h * s);

    function fitsLimits(s) {

      const W = scaledW(width, s), H = scaledH(height, s);

      return W <= MAX_EDGE && H <= MAX_EDGE && (W * H) <= MAX_AREA;

    }



    if (!fitsLimits(scale)) {

      const original = scale, candidates = [2.5, 2, 1.75, 1.5, 1.25, 1, 0.85]; const tried = [];

      for (const s of candidates) { tried.push(s); if (fitsLimits(s)) { scale = s; break; } }

      if (!fitsLimits(scale)) {

        Log.error('LimitExceeded before render', { width, height, scale, scaledW: scaledW(width, scale), scaledH: scaledH(height, scale), MAX_EDGE, MAX_AREA });

        setStatus('Output too large. Reduce columns, lines, or scale.', 'error'); Log.groupEnd(); throw new Error('LimitExceeded');

      } else { setStatus(`Scale reduced from ${original} to ${scale} to respect limits.`, 'warn'); Log.warn('Scale reduced to fit limits', { original, chosen: scale, tried }); }

    }



    if (refs.autofit.checked) { Log.debug('Auto-fit is ON. Checking before snapshot…'); autoFitLinesIfNeeded(); }



    const theme = window.TextshotThemes.find(t => t.id === state.themeId);

    const cs = getComputedStyle(refs.editor);

    const containerCS = getComputedStyle(refs.editorContainer);

    const pad = state.paddingPx;

    const fontFamily = cs.fontFamily, fontSize = parseFloat(cs.fontSize), lineHeight = parseFloat(cs.lineHeight);

    const color = containerCS.getPropertyValue('--fg') || '#000';

    let background = containerCS.getPropertyValue('--bg') || '#fff';

    const watermarkColor = containerCS.getPropertyValue('--watermark') || 'rgba(0,0,0,.35)';

    const text = state.text;



    const canvas = document.createElement('canvas');

    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d', { alpha: true });

    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

    ctx.scale(scale, scale);



    // Fill background (handle gradients)

    if (background.includes('gradient')) {

      // Parse gradient for canvas

      const gradientMatch = background.match(/linear-gradient\(([^,]+),\s*([^)]+)\)/);

      if (gradientMatch) {

        const angle = parseFloat(gradientMatch[1]) || 135;

        const stops = gradientMatch[2];



        // Convert CSS angle to canvas coordinates

        const angleRad = ((angle - 90) * Math.PI) / 180;

        const x0 = width / 2 - Math.cos(angleRad) * width / 2;

        const y0 = height / 2 - Math.sin(angleRad) * height / 2;

        const x1 = width / 2 + Math.cos(angleRad) * width / 2;

        const y1 = height / 2 + Math.sin(angleRad) * height / 2;



        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);



        // Parse color stops

        const colorStops = stops.split(/,\s*(?![^(]*\))/);

        colorStops.forEach(stop => {

          const match = stop.match(/(.+?)\s+(\d+)%/);

          if (match) {

            const color = match[1].trim();

            const position = parseFloat(match[2]) / 100;

            gradient.addColorStop(position, color);

          }

        });



        ctx.fillStyle = gradient;

      } else {

        ctx.fillStyle = '#ffffff'; // Fallback

      }

    } else {

      ctx.fillStyle = background;

    }



    ctx.fillRect(0, 0, width, height);



    // Apply procedural patterns

    if (theme && theme.procedural) {

      drawProceduralBackground(ctx, width, height, theme);

    }



    // Set text style

    ctx.fillStyle = color;

    ctx.font = `${fontSize}px ${fontFamily}`;

    ctx.textBaseline = 'top';



    // Helper function to wrap text

    function wrapText(text, maxWidth) {

      const words = text.split(' ');

      const lines = [];

      let currentLine = '';



      for (const word of words) {

        const testLine = currentLine ? `${currentLine} ${word}` : word;

        const metrics = ctx.measureText(testLine);



        if (metrics.width > maxWidth && currentLine) {

          lines.push(currentLine);

          currentLine = word;

        } else {

          currentLine = testLine;

        }

      }



      if (currentLine) {

        lines.push(currentLine);

      }



      return lines;

    }



    // Draw text lines with word wrapping

    const textLines = text.split('\n');

    const maxTextWidth = width - (pad * 2);

    let y = pad;



    for (const line of textLines) {

      if (y + lineHeight > height - pad) break; // Stop if exceeding bounds



      if (!line) {

        // Empty line

        y += lineHeight;

        continue;

      }



      // Wrap the line if needed

      const wrappedLines = wrapText(line, maxTextWidth);



      for (const wrappedLine of wrappedLines) {

        if (y + lineHeight > height - pad) break;

        ctx.fillText(wrappedLine, pad, y);

        y += lineHeight;

      }

    }



    // Draw watermark if present

    if (state.watermarkText) {

      ctx.fillStyle = watermarkColor;

      ctx.font = `${fontSize * 0.8}px ${fontFamily}`;

      ctx.textAlign = 'right';

      ctx.fillText(state.watermarkText, width - pad, height - pad - fontSize * 0.8);

      ctx.textAlign = 'left'; // Reset

    }



    Log.info('Canvas rendered directly', { canvasW: canvas.width, canvasH: canvas.height, scale, lineCount: textLines.length });

    Log.groupEnd();

    return { canvas, scale };

  }



  /** ---------- Validation ---------- */

  function inputsAreValid() {

    return (

      state.text.trim().length > 0 &&

      Number.isInteger(state.columns) &&

      Number.isInteger(state.lines) &&

      isNumber(state.textScale) &&

      Number.isInteger(state.paddingPx) &&

      !!window.TextshotThemes.find(t => t.id === state.themeId)

    );

  }



  /** ---------- Generate ---------- */

  async function doGenerate() {

    // Authoritative sync to avoid races and stale values

    syncStateFromControls();

    syncStateFromEditor();

    updateGenerateEnabled();



    Log.group('Generate() called AFTER SYNC', {

      textLen: state.text.length, themeId: state.themeId, textScale: state.textScale,

      columns: state.columns, lines: state.lines, paddingPx: state.paddingPx,

      watermarkText: state.watermarkText, renderScale: state.renderScale, overflowFlag: state.overflowFlag

    });



    try {

      clearStatusAll();

      if (!inputsAreValid()) { setStatus('Please enter some text before generating.', 'warn'); Log.groupEnd(); return; }



      refs.generate.disabled = true;



      const { canvas, scale } = await renderEditorToCanvas();

      state.lastCanvas = canvas;



      refs.preview.innerHTML = '';

      refs.previewHint?.remove?.();



      const canvasLabel = document.createElement('div');

      canvasLabel.className = 'preview-label';

      canvasLabel.textContent = 'Canvas (primary output)';



      const img = document.createElement('img');

      img.alt = 'Generated image for context-menu copy';

      img.src = canvas.toDataURL('image/png');



      const imgLabel = document.createElement('div');

      imgLabel.className = 'preview-label';

      imgLabel.textContent = 'Image (right-click to copy)';



      refs.preview.appendChild(canvasLabel);

      refs.preview.appendChild(canvas);

      refs.preview.appendChild(imgLabel);

      refs.preview.appendChild(img);



      setStatus(`Generated at ${canvas.width} × ${canvas.height} px, scale ×${Number(scale).toFixed(2)}.`, 'info');

      Log.info('Generation complete', { canvasW: canvas.width, canvasH: canvas.height, scale });

    } catch (err) {

      const errorMsg = err && err.message ? err.message : String(err);

      if (!errorMsg.includes('LimitExceeded')) {

        // Show detailed error message to help users understand what went wrong

        const userMsg = `Generation failed: ${errorMsg}. Check console for details.`;

        setStatus(userMsg, 'error');

      }

      Log.error('Generation error', { message: errorMsg, stack: err && err.stack });

    } finally {

      updateGenerateEnabled();

      Log.groupEnd();

    }

  }



  /** ---------- Enable/disable button ---------- */

  function updateGenerateEnabled() { refs.generate.disabled = !inputsAreValid(); }



  /** ---------- Init ---------- */

  function populateThemeSelectAndApplyInitial() {

    populateThemeSelect();

    refs.theme.value = state.themeId;

    applyTheme(state.themeId);

  }



  function init(options = {}) {

    Log.group('Init begin', { href: location.href, protocol: (function(){ try { return new URL(location.href).protocol; } catch { return 'unknown'; } })(), ua: navigator.userAgent, mobileByWidth: isMobileViewport() });



    bindRefs();

    populateThemeSelectAndApplyInitial();



    state.themeId = options.initialThemeId || state.themeId;

    state.textScale = clamp(options.initialTextScale ?? state.textScale, parseFloat(refs.textScale.min), parseFloat(refs.textScale.max));

    state.columns = clamp(Math.round(options.initialColumns ?? state.columns), parseFloat(refs.cols.min), parseFloat(refs.cols.max));

    state.lines = clamp(Math.round(options.initialLines ?? state.lines), parseFloat(refs.rows.min), parseFloat(refs.rows.max));

    state.paddingPx = clamp(Math.round(options.initialPaddingPx ?? state.paddingPx), parseFloat(refs.padding.min), parseFloat(refs.padding.max));

    state.watermarkText = (options.initialWatermarkText || '').slice(0,80);

    state.renderScale = clamp(options.initialRenderScale ?? state.renderScale, 0.5, 4);



    refs.textScale.value = String(state.textScale);

    refs.cols.value = String(state.columns);

    refs.rows.value = String(state.lines);

    refs.padding.value = String(state.paddingPx);

    refs.watermark.value = state.watermarkText;

    refs.autofit.checked = !!options.initialAutoFit;

    refs.theme.value = state.themeId;



    applyTheme(state.themeId);

    setWatermark(state.watermarkText);

    bindControls();



    // Initial sync and layout

    syncStateFromEditor();

    scheduleSizeApply();

    updateGenerateEnabled();



    setTimeout(() => refs.editor.focus(), 0);



    Log.info('Init complete', { themeId: state.themeId, textScale: state.textScale, columns: state.columns, lines: state.lines, paddingPx: state.paddingPx, renderScale: state.renderScale, watermarkText: state.watermarkText });

    Log.groupEnd();

  }



  /** ---------- API ---------- */

  window.Textshot = {

    init,

    generate: async () => { await doGenerate(); return state.lastCanvas; },

    setTheme, setTextScale, setColumnsLines, setPadding, setWatermark,

    getState: () => ({ ...state, lastCanvas: state.lastCanvas }),

    setDebug: (enabled) => Log.setEnabled(!!enabled)

  };



  document.addEventListener('DOMContentLoaded', () => { window.Textshot.init({}); });

})();
