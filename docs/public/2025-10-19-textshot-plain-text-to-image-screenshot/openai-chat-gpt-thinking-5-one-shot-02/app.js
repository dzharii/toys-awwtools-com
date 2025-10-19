/* Textshot — Plain Text to Shareable Image (single-folder build)
 * No external network, runs under file://
 * Rendering: SVG foreignObject → Canvas
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
      } catch {
        return `${prefix} ${ts()} — ${msg}`;
      }
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
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  function rafBatch(fn) {
    let scheduled = false;
    return function (...args) {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn.apply(this, args);
      });
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
    const cmd = e.ctrlKey || e.metaKey;
    if (!cmd) return false;
    const k = e.key.toLowerCase();
    return k === 'b' || k === 'i' || k === 'u' || k === 'k';
  }

  function svgToDataUrl(svgString) {
    const encoded = encodeURIComponent(svgString)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }

  const MAX_EDGE = 8192;
  const MAX_AREA = 32000000;

  /** ---------- Themes ---------- */
  window.TextshotThemes = [
    { id:"classic-light", name:"Classic Light", description:"Light background, deep gray text, generous leading.",
      tokens:{ "--bg":"#ffffff","--fg":"#111214","--accent":"#0a84ff","--shadow":"0 10px 40px rgba(0,0,0,0.12)","--radius":"18px","--watermark":"rgba(0,0,0,0.38)" },
      baseFontSizePx:18, lineHeight:1.6,
      fontFamilyStack:"ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", paddingPx:32, maxContentWidthCh:90 },
    { id:"classic-dark", name:"Classic Dark", description:"Nearly black background with near-white text.",
      tokens:{ "--bg":"#0e0f12","--fg":"#e9ecf1","--accent":"#5b9cff","--shadow":"0 10px 40px rgba(0,0,0,0.55)","--radius":"18px","--watermark":"rgba(255,255,255,0.40)" },
      baseFontSizePx:18, lineHeight:1.6,
      fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, Noto Sans, 'Apple Color Emoji','Segoe UI Emoji'", paddingPx:32, maxContentWidthCh:90 },
    { id:"cream-ink", name:"Cream & Ink", description:"Soft cream paper, ink black text.",
      tokens:{ "--bg":"#f7f3e9","--fg":"#1f2328","--accent":"#7d5fff","--shadow":"0 8px 28px rgba(68,48,0,0.18)","--radius":"16px","--watermark":"rgba(31,35,40,0.35)" },
      baseFontSizePx:19, lineHeight:1.56,
      fontFamilyStack:"ui-serif, Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif", paddingPx:36, maxContentWidthCh:80 },
    { id:"paper-gray", name:"Paper Gray", description:"Warm gray paper with charcoal text.",
      tokens:{ "--bg":"#efefef","--fg":"#202325","--accent":"#2563eb","--shadow":"0 8px 30px rgba(0,0,0,0.18)","--radius":"14px","--watermark":"rgba(0,0,0,0.38)" },
      baseFontSizePx:18, lineHeight:1.58,
      fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:88 },
    { id:"slate", name:"Slate", description:"Slate background, bright text, subtle blue accent.",
      tokens:{ "--bg":"#0f172a","--fg":"#e5e7eb","--accent":"#60a5fa","--shadow":"0 10px 40px rgba(0,0,0,0.55)","--radius":"16px","--watermark":"rgba(229,231,235,0.42)" },
      baseFontSizePx:18, lineHeight:1.62,
      fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:30, maxContentWidthCh:88 },
    { id:"ink-deck", name:"Ink Deck", description:"Dark deck with neutral text for high contrast.",
      tokens:{ "--bg":"#14161c","--fg":"#f3f4f6","--accent":"#22d3ee","--shadow":"0 12px 44px rgba(0,0,0,0.6)","--radius":"18px","--watermark":"rgba(243,244,246,0.42)" },
      baseFontSizePx:20, lineHeight:1.52,
      fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:84 },
    { id:"sunrise", name:"Sunrise", description:"Pale sunrise canvas with soft dark text.",
      tokens:{ "--bg":"#fff7ed","--fg":"#1f2937","--accent":"#f97316","--shadow":"0 8px 26px rgba(102,58,0,0.18)","--radius":"16px","--watermark":"rgba(31,41,55,0.35)" },
      baseFontSizePx:18, lineHeight:1.6,
      fontFamilyStack:"ui-serif, Georgia, Cambria, Times, serif", paddingPx:32, maxContentWidthCh:78 },
    { id:"mono-notes", name:"Mono Notes", description:"Soft light with readable monospaced stack.",
      tokens:{ "--bg":"#fafafa","--fg":"#111827","--accent":"#0ea5e9","--shadow":"0 8px 28px rgba(0,0,0,0.14)","--radius":"12px","--watermark":"rgba(17,24,39,0.35)" },
      baseFontSizePx:17, lineHeight:1.5,
      fontFamilyStack:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", paddingPx:24, maxContentWidthCh:90 },
    { id:"solarized-lite", name:"Solarized Lite", description:"Solarized-inspired light with strong contrast.",
      tokens:{ "--bg":"#fdf6e3","--fg":"#073642","--accent":"#268bd2","--shadow":"0 8px 28px rgba(7,54,66,0.16)","--radius":"14px","--watermark":"rgba(7,54,66,0.38)" },
      baseFontSizePx:18, lineHeight:1.58,
      fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:30, maxContentWidthCh:84 },
    { id:"high-contrast", name:"High Contrast", description:"Absolute black/white for maximum punch.",
      tokens:{ "--bg":"#ffffff","--fg":"#000000","--accent":"#000000","--shadow":"0 10px 40px rgba(0,0,0,0.2)","--radius":"0px","--watermark":"rgba(0,0,0,0.45)" },
      baseFontSizePx:19, lineHeight:1.55,
      fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:84 },
    { id:"night-contrast", name:"Night Contrast", description:"Black canvas, pure white text.",
      tokens:{ "--bg":"#000000","--fg":"#ffffff","--accent":"#ffffff","--shadow":"0 10px 40px rgba(0,0,0,0.65)","--radius":"0px","--watermark":"rgba(255,255,255,0.45)" },
      baseFontSizePx:19, lineHeight:1.55,
      fontFamilyStack:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial", paddingPx:28, maxContentWidthCh:84 }
  ];

  /** ---------- State ---------- */
  const state = {
    text: '',
    themeId: 'classic-light',
    textScale: 1,
    columns: 80,
    lines: 40,
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
    Object.assign(refs.measure.style, {
      position: 'absolute',
      visibility: 'hidden',
      whiteSpace: 'pre',
      left: '-9999px',
      top: '-9999px',
    });
    refs.measure.id = 'ts-measure-span';
    document.body.appendChild(refs.measure);
    Log.debug('Refs bound', { ids: Object.keys(refs) });
  }

  /** ---------- Theme handling ---------- */
  function populateThemeSelect() {
    refs.theme.innerHTML = '';
    window.TextshotThemes.forEach(theme => {
      const opt = document.createElement('option');
      opt.value = theme.id;
      opt.textContent = `${theme.name}`;
      opt.title = theme.description;
      refs.theme.appendChild(opt);
    });
    Log.debug('Theme select populated', { themeCount: window.TextshotThemes.length });
  }

  function applyTheme(themeId) {
    const theme = window.TextshotThemes.find(t => t.id === themeId);
    if (!theme) { Log.error('applyTheme: theme not found', { themeId }); return; }

    state.themeId = themeId;
    const tokens = theme.tokens || {};
    for (const [k, v] of Object.entries(tokens)) {
      refs.editorContainer.style.setProperty(k, v);
    }
    refs.editorContainer.style.setProperty('--font-stack', theme.fontFamilyStack);
    refs.editorContainer.style.setProperty('--line-height', String(theme.lineHeight));

    const fontSize = Math.round(theme.baseFontSizePx * state.textScale);
    refs.editorContainer.style.setProperty('--font-size', `${fontSize}px`);

    if (!state._userSetPadding) {
      state.paddingPx = theme.paddingPx;
      refs.padding.value = String(state.paddingPx);
    }
    refs.editorContainer.style.setProperty('--pad', `${state.paddingPx}px`);

    if (tokens['--watermark']) {
      refs.editorContainer.style.setProperty('--watermark', tokens['--watermark']);
    }

    refs.readoutScale.textContent = `× ${state.textScale.toFixed(2)}`;
    refs.readoutCols.textContent = `${state.columns}`;
    refs.readoutRows.textContent = `${state.lines}`;
    refs.readoutPadding.textContent = `${state.paddingPx}px`;

    measureTypography();
    scheduleSizeApply();

    Log.info('Theme applied', {
      themeId,
      baseFontSizePx: theme.baseFontSizePx,
      lineHeight: theme.lineHeight,
      fontFamilyStack: theme.fontFamilyStack,
      resolvedFontSizePx: fontSize,
      paddingPx: state.paddingPx
    });
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

    let lh = cs.lineHeight;
    let px = 0;
    if (lh.endsWith('px')) px = parseFloat(lh);
    else px = parseFloat(cs.fontSize) * (parseFloat(lh) || 1.5);
    state.lineBoxHeight = px;

    Log.debug('Typography measured', {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      lineHeightCSS: cs.lineHeight,
      avgCharWidth: Number(state.avgCharWidth.toFixed(4)),
      lineBoxHeight: Number(state.lineBoxHeight.toFixed(2))
    });
  }

  /** ---------- Sizing ---------- */
  function computeEditorCssSize() {
    const pad = state.paddingPx;
    const contentW = state.columns * state.avgCharWidth;
    const contentH = state.lines * state.lineBoxHeight;
    return {
      width: Math.round(contentW + pad * 2),
      height: Math.round(contentH + pad * 2)
    };
  }

  function applyEditorSize() {
    const { width, height } = computeEditorCssSize();
    refs.editorContainer.style.width = `${width}px`;
    refs.editorContainer.style.height = `${height}px`;
    detectOverflowAndUpdateReadout();
    updateGenerateEnabled();

    Log.debug('Editor size applied', {
      width, height,
      columns: state.columns, lines: state.lines,
      paddingPx: state.paddingPx,
      avgCharWidth: Number(state.avgCharWidth.toFixed(4)),
      lineBoxHeight: Number(state.lineBoxHeight.toFixed(2)),
      overflow: state.overflowFlag
    });
  }
  const scheduleSizeApply = rafBatch(applyEditorSize);

  /** ---------- Overflow detection ---------- */
  function detectOverflowAndUpdateReadout() {
    const clientH = refs.editorContainer.clientHeight;
    const scrollH = refs.editor.scrollHeight;
    state.overflowFlag = scrollH > clientH + 1;

    const { width, height } = computeEditorCssSize();
    const linesMissing = Math.max(0, Math.ceil((scrollH - clientH) / state.lineBoxHeight));
    refs.sizeReadout.textContent = `${width} × ${height} CSS px — ${state.columns} cols × ${state.lines} lines — ${state.overflowFlag ? `overflow by ~${linesMissing} line(s)` : 'fits'}`;

    if (state.overflowFlag) {
      setStatus(`Text exceeds configured lines. Increase lines or enable Auto-fit (overflow ~${linesMissing} line${linesMissing !== 1 ? 's' : ''}).`, 'warn');
    } else {
      clearStatusIfHint();
    }

    Log.debug('Overflow check', { clientHeight: clientH, scrollHeight: scrollH, linesMissing, overflow: state.overflowFlag });
  }

  /** ---------- Status ---------- */
  function setStatus(msg, kind = 'info') {
    refs.status.textContent = msg;
    refs.status.dataset.kind = kind;
    Log.info(`Status: ${kind}`, { msg });
  }
  function clearStatusIfHint() {
    if (!refs.status.dataset.locked) {
      refs.status.textContent = '';
      refs.status.dataset.kind = '';
    }
  }
  function clearStatusAll() {
    refs.status.textContent = '';
    refs.status.dataset.kind = '';
    delete refs.status.dataset.locked;
  }

  /** ---------- Editor sync & sanitization ---------- */
  function insertPlainTextAtSelection(text) {
    document.execCommand('insertText', false, text);
  }

  function syncStateFromEditor() {
    // Read live DOM (avoids debounce race).
    state.text = normalizePlainText(refs.editor.textContent || '');
    return state.text;
  }

  function onPastePlain(e) {
    e.preventDefault();
    const t = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
    insertPlainTextAtSelection(normalizePlainText(t));
    syncStateFromEditor();
    updateGenerateEnabled();
    detectOverflowAndUpdateReadout();
    Log.debug('Paste handled as plain text', { length: t.length });
  }

  function onDropPrevent(e) {
    e.preventDefault();
    e.stopPropagation();
    Log.warn('Drop prevented on editor');
  }

  function onKeydownEditor(e) {
    if (isForbiddenFormattingShortcut(e)) {
      e.preventDefault();
      Log.warn('Blocked formatting shortcut', { key: e.key, ctrl: e.ctrlKey, meta: e.metaKey });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      doGenerate();
    }
    if (e.key === 'Escape') {
      clearStatusAll();
    }
  }

  function onEditorInput() {
    // Debounced input for performance
    syncStateFromEditor();
    updateGenerateEnabled();
    detectOverflowAndUpdateReadout();
    Log.debug('Editor input', { length: state.text.length });
  }

  /** ---------- Controls binding ---------- */
  function bindControls() {
    refs.textScale.addEventListener('input', rafBatch(() => {
      const v = clamp(parseFloat(refs.textScale.value), parseFloat(refs.textScale.min), parseFloat(refs.textScale.max));
      state.textScale = v;
      refs.readoutScale.textContent = `× ${v.toFixed(2)}`;
      applyTheme(state.themeId);
    }));

    const onCols = rafBatch(() => {
      const v = clamp(Math.round(parseFloat(refs.cols.value)), parseFloat(refs.cols.min), parseFloat(refs.cols.max));
      state.columns = v;
      refs.readoutCols.textContent = `${v}`;
      scheduleSizeApply();
    });
    const onRows = rafBatch(() => {
      const v = clamp(Math.round(parseFloat(refs.rows.value)), parseFloat(refs.rows.min), parseFloat(refs.rows.max));
      state.lines = v;
      refs.readoutRows.textContent = `${v}`;
      scheduleSizeApply();
    });
    refs.cols.addEventListener('input', onCols);
    refs.rows.addEventListener('input', onRows);

    refs.padding.addEventListener('input', rafBatch(() => {
      const v = clamp(Math.round(parseFloat(refs.padding.value)), parseFloat(refs.padding.min), parseFloat(refs.padding.max));
      state.paddingPx = v;
      state._userSetPadding = true;
      refs.readoutPadding.textContent = `${v}px`;
      refs.editorContainer.style.setProperty('--pad', `${v}px`);
      scheduleSizeApply();
    }));

    refs.theme.addEventListener('change', () => setTheme(refs.theme.value));

    refs.watermark.addEventListener('input', debounce(() => setWatermark(refs.watermark.value || ''), 50));

    refs.autofit.addEventListener('change', () => {
      if (refs.autofit.checked) autoFitLinesIfNeeded();
      detectOverflowAndUpdateReadout();
    });

    refs.generate.addEventListener('click', doGenerate);

    // Editor events
    refs.editor.addEventListener('paste', onPastePlain);
    refs.editor.addEventListener('drop', onDropPrevent);
    refs.editor.addEventListener('dragover', onDropPrevent);
    refs.editor.addEventListener('keydown', onKeydownEditor);
    refs.editor.addEventListener('input', debounce(onEditorInput, 50));
    // Immediate sync on keyup and compositionend to avoid debounce races
    const immediateSync = () => { syncStateFromEditor(); updateGenerateEnabled(); };
    refs.editor.addEventListener('keyup', immediateSync);
    refs.editor.addEventListener('compositionend', immediateSync);

    // Shortcut globally
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        doGenerate();
      }
      if (e.key === 'Escape') {
        clearStatusAll();
      }
    });

    Log.debug('Controls & editor events bound');
  }

  /** ---------- Public setters ---------- */
  function setTheme(themeId) {
    Log.group('API setTheme()', { themeId });
    const exists = window.TextshotThemes.some(t => t.id === themeId);
    if (!exists) { Log.error('setTheme: invalid themeId', { themeId }); Log.groupEnd(); return; }
    refs.theme.value = themeId;
    applyTheme(themeId);
    Log.groupEnd();
  }

  function setTextScale(multiplier) {
    Log.group('API setTextScale()', { multiplier });
    const min = parseFloat(refs.textScale.min);
    const max = parseFloat(refs.textScale.max);
    const v = clamp(multiplier, min, max);
    state.textScale = v;
    refs.textScale.value = String(v);
    applyTheme(state.themeId);
    Log.groupEnd();
  }

  function setColumnsLines(cols, rows) {
    Log.group('API setColumnsLines()', { cols, rows });
    const c = clamp(Math.round(cols), parseFloat(refs.cols.min), parseFloat(refs.cols.max));
    const r = clamp(Math.round(rows), parseFloat(refs.rows.min), parseFloat(refs.rows.max));
    state.columns = c;
    state.lines = r;
    refs.cols.value = String(c);
    refs.rows.value = String(r);
    refs.readoutCols.textContent = `${c}`;
    refs.readoutRows.textContent = `${r}`;
    scheduleSizeApply();
    Log.groupEnd();
  }

  function setPadding(paddingPx) {
    Log.group('API setPadding()', { paddingPx });
    const v = clamp(Math.round(paddingPx), parseFloat(refs.padding.min), parseFloat(refs.padding.max));
    state.paddingPx = v;
    state._userSetPadding = true;
    refs.padding.value = String(v);
    refs.readoutPadding.textContent = `${v}px`;
    refs.editorContainer.style.setProperty('--pad', `${v}px`);
    scheduleSizeApply();
    Log.groupEnd();
  }

  function setWatermark(text) {
    const t = (text || '').slice(0, 80);
    state.watermarkText = t;
    refs.watermark.value = t;
    refs.watermarkNode.textContent = t;
    detectOverflowAndUpdateReadout();
    Log.info('Watermark updated', { watermarkText: t });
  }

  function getState() {
    const snapshot = { ...state, lastCanvas: !!state.lastCanvas };
    Log.debug('API getState()', snapshot);
    return { ...state, lastCanvas: state.lastCanvas };
  }

  /** ---------- Auto-fit ---------- */
  function autoFitLinesIfNeeded() {
    const clientH = refs.editorContainer.clientHeight;
    const scrollH = refs.editor.scrollHeight;
    if (scrollH <= clientH + 1) return;

    const missing = Math.ceil((scrollH - clientH) / state.lineBoxHeight);
    const newLines = clamp(state.lines + missing, parseFloat(refs.rows.min), parseFloat(refs.rows.max));
    if (newLines !== state.lines) {
      state.lines = newLines;
      refs.rows.value = String(newLines);
      refs.readoutRows.textContent = `${newLines}`;
      scheduleSizeApply();
      setStatus(`Auto-fit expanded to ${newLines} lines.`, 'info');
      Log.info('Auto-fit applied', { missing, newLines });
    }
  }

  /** ---------- Rendering (SVG → Canvas) ---------- */
  function buildSnapshotHTML(width, height) {
    const cs = getComputedStyle(refs.editor);
    const containerCS = getComputedStyle(refs.editorContainer);

    const pad = state.paddingPx;
    const radius = containerCS.getPropertyValue('border-radius') || '0px';
    const shadow = containerCS.getPropertyValue('box-shadow') || 'none';

    const fontFamily = cs.fontFamily;
    const fontSize = cs.fontSize;
    const lineHeight = cs.lineHeight;
    const color = containerCS.getPropertyValue('--fg') || '#000';
    const background = containerCS.getPropertyValue('--bg') || '#fff';
    const watermarkColor = containerCS.getPropertyValue('--watermark') || 'rgba(0,0,0,.35)';

    const text = state.text;

    const htmlText = text.split('\n').map(line => {
      const esc = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return esc || '<span style="white-space:pre;">\u200B</span>';
    }).join('<br/>');

    const wmHTML = state.watermarkText
      ? `<div style="position:absolute; right:${pad}px; bottom:${pad}px; color:${watermarkColor}; font-family:${fontFamily}; font-size:calc(${fontSize} * 0.8); line-height:1.2; pointer-events:none; user-select:none;">${escapeHtml(state.watermarkText)}</div>`
      : '';

    const inner = `
      <div xmlns="http://www.w3.org/1999/xhtml"
           style="position:relative;width:${width}px;height:${height}px;background:${background};color:${color};border-radius:${radius};box-shadow:${shadow};overflow:hidden;">
        <div style="font-family:${fontFamily};font-size:${fontSize};line-height:${lineHeight};color:${color};padding:${pad}px;white-space:pre-wrap;word-break:break-word;">
          ${htmlText}
        </div>
        ${wmHTML}
      </div>
    `;
    return inner;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  async function renderEditorToCanvas() {
    const { width, height } = computeEditorCssSize();
    let scale = state.renderScale;

    Log.group('Render begin', {
      cssWidth: width, cssHeight: height,
      requestedScale: scale,
      themeId: state.themeId,
      textScale: state.textScale,
      columns: state.columns, lines: state.lines,
      paddingPx: state.paddingPx,
      watermark: state.watermarkText,
      overflow: state.overflowFlag
    });

    const scaledW = (w, s) => Math.round(w * s);
    const scaledH = (h, s) => Math.round(h * s);
    function fitsLimits(s) {
      const W = scaledW(width, s);
      const H = scaledH(height, s);
      const area = W * H;
      return W <= MAX_EDGE && H <= MAX_EDGE && area <= MAX_AREA;
    }

    if (!fitsLimits(scale)) {
      const original = scale;
      const candidates = [2.5, 2, 1.75, 1.5, 1.25, 1, 0.85];
      const tried = [];
      for (const s of candidates) { tried.push(s); if (fitsLimits(s)) { scale = s; break; } }
      if (!fitsLimits(scale)) {
        const W = scaledW(width, scale), H = scaledH(height, scale);
        Log.error('LimitExceeded before render', { width, height, scale, scaledW: W, scaledH: H, MAX_EDGE, MAX_AREA });
        setStatus('Output too large. Reduce columns, lines, or scale.', 'error');
        Log.groupEnd();
        throw new Error('LimitExceeded');
      } else {
        setStatus(`Scale reduced from ${original} to ${scale} to respect limits.`, 'warn');
        Log.warn('Scale reduced to fit limits', { original, chosen: scale, tried });
      }
    }

    if (refs.autofit.checked) {
      Log.debug('Auto-fit is ON. Checking before snapshot…');
      autoFitLinesIfNeeded();
    }

    const svgW = Math.round(width);
    const svgH = Math.round(height);
    const html = buildSnapshotHTML(svgW, svgH);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}"><foreignObject x="0" y="0" width="100%" height="100%">${html}</foreignObject></svg>`;
    const url = svgToDataUrl(svg);

    Log.debug('Snapshot built', {
      svgW, svgH,
      htmlLength: html.length,
      svgLength: svg.length,
      dataUrlLength: url.length,
      svgStart: svg.slice(0, 200).replace(/\n/g, ' ')
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(svgW * scale);
    canvas.height = Math.round(svgH * scale);
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.save();
    ctx.scale(scale, scale);

    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0);
          ctx.restore();
          Log.info('SVG image loaded & drawn', { canvasW: canvas.width, canvasH: canvas.height, scale });
          resolve();
        } catch (err) {
          Log.error('Canvas draw failed', { message: err.message, stack: err.stack });
          reject(err);
        }
      };
      img.onerror = (e) => {
        Log.error('SVG image load failed', {
          event: String(e && e.type || e),
          cssW: svgW, cssH: svgH,
          scale,
          urlScheme: (function(){ try { return new URL(location.href).protocol; } catch { return 'unknown'; } })(),
          ua: navigator.userAgent,
          dataUrlLength: url.length,
          svgHead: svg.slice(0, 200).replace(/\n/g,' ')
        });
        reject(new Error('SVG image load failed'));
      };
      img.src = url; // data: URL
    });

    Log.groupEnd();
    return { canvas, scale };
  }

  /** ---------- Generate ---------- */
  function inputsAreValid() {
    const valid =
      state.text.trim().length > 0 &&
      Number.isInteger(state.columns) &&
      Number.isInteger(state.lines) &&
      isNumber(state.textScale) &&
      Number.isInteger(state.paddingPx) &&
      !!window.TextshotThemes.find(t => t.id === state.themeId);
    return !!valid;
  }

  async function doGenerate() {
    // Always sync text NOW to avoid debounce race (fix for “Generate disabled” confusion)
    syncStateFromEditor();
    updateGenerateEnabled();

    Log.group('Generate() called', {
      textLen: state.text.length,
      themeId: state.themeId,
      textScale: state.textScale,
      columns: state.columns,
      lines: state.lines,
      paddingPx: state.paddingPx,
      watermarkText: state.watermarkText,
      renderScale: state.renderScale,
      overflowFlag: state.overflowFlag
    });

    try {
      clearStatusAll();
      if (!inputsAreValid()) {
        setStatus('Please enter some text before generating.', 'warn');
        Log.groupEnd();
        return;
      }

      refs.generate.disabled = true;

      const { canvas, scale } = await renderEditorToCanvas();
      state.lastCanvas = canvas;

      refs.preview.innerHTML = '';
      refs.previewHint?.remove?.();

      const img = document.createElement('img');
      img.alt = 'Generated image for context-menu copy';
      img.src = canvas.toDataURL('image/png');

      refs.preview.appendChild(canvas);
      refs.preview.appendChild(img);

      setStatus(`Generated at ${canvas.width} × ${canvas.height} px, scale ×${Number(scale).toFixed(2)}.`, 'info');
      Log.info('Generation complete', { canvasW: canvas.width, canvasH: canvas.height, scale });
    } catch (err) {
      if (!String(err && err.message).includes('LimitExceeded')) {
        setStatus('Generation failed. Try reducing size or changing theme.', 'error');
      }
      Log.error('Generation error', { message: err && err.message, stack: err && err.stack });
    } finally {
      updateGenerateEnabled();
      Log.groupEnd();
    }
  }

  /** ---------- Enable/disable button ---------- */
  function updateGenerateEnabled() {
    refs.generate.disabled = !inputsAreValid();
  }

  /** ---------- Init ---------- */
  function init(options = {}) {
    Log.group('Init begin', {
      href: location.href,
      protocol: (function(){ try { return new URL(location.href).protocol; } catch { return 'unknown'; } })(),
      ua: navigator.userAgent,
      mobileByWidth: isMobileViewport()
    });

    bindRefs();
    populateThemeSelect();

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
    // Initial sync and size
    syncStateFromEditor();
    scheduleSizeApply();
    updateGenerateEnabled();

    // Focus editor on load
    setTimeout(() => refs.editor.focus(), 0);

    Log.info('Init complete', {
      themeId: state.themeId,
      textScale: state.textScale,
      columns: state.columns,
      lines: state.lines,
      paddingPx: state.paddingPx,
      renderScale: state.renderScale,
      watermarkText: state.watermarkText
    });
    Log.groupEnd();
  }

  /** ---------- Expose API ---------- */
  window.Textshot = {
    init,
    generate: async () => { await doGenerate(); return state.lastCanvas; },
    setTheme,
    setTextScale,
    setColumnsLines,
    setPadding,
    setWatermark,
    getState: () => ({ ...state, lastCanvas: state.lastCanvas }),
    setDebug: (enabled) => Log.setEnabled(!!enabled)
  };

  document.addEventListener('DOMContentLoaded', () => { window.Textshot.init({}); });
})();

