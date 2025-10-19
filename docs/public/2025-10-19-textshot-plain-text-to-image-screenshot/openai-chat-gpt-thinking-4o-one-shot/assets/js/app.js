// Application logic for Textshot
(function() {
  'use strict';

  // Mantra
  console.log('Textshot — Plain Text to Shareable Image. I WILL NOT BE LAZY. I WILL DO EXCELLENT RESEARCH.');

  // Themes definition
  window.TextshotThemes = [
    {
      id: "classic-light",
      name: "Classic Light",
      description: "Light background, dark text, generous line spacing.",
      tokens: {
        "--bg": "#ffffff",
        "--fg": "#111111",
        "--shadow": "none",
        "--radius": "4px"
      },
      baseFontSizePx: 18,
      lineHeight: 1.6,
      fontFamilyStack: "ui-serif, Georgia, Times, serif",
      paddingPx: 32,
      maxContentWidthCh: 90
    },
    {
      id: "classic-dark",
      name: "Classic Dark",
      description: "Dark background, light text.",
      tokens: {
        "--bg": "#111111",
        "--fg": "#eeeeee",
        "--shadow": "none",
        "--radius": "4px"
      },
      baseFontSizePx: 18,
      lineHeight: 1.6,
      fontFamilyStack: "ui-serif, Georgia, Times, serif",
      paddingPx: 32,
      maxContentWidthCh: 90
    },
    {
      id: "high-contrast",
      name: "High Contrast",
      description: "Black on white with strong contrast.",
      tokens: {
        "--bg": "#000000",
        "--fg": "#ffffff",
        "--shadow": "none",
        "--radius": "0px"
      },
      baseFontSizePx: 20,
      lineHeight: 1.5,
      fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif",
      paddingPx: 24,
      maxContentWidthCh: 70
    },
    {
      id: "serif-modern",
      name: "Serif Modern",
      description: "Serif fonts, subtle background.",
      tokens: {
        "--bg": "#f8f8f8",
        "--fg": "#222222",
        "--shadow": "0 2px 8px rgba(0,0,0,0.06)",
        "--radius": "8px"
      },
      baseFontSizePx: 19,
      lineHeight: 1.55,
      fontFamilyStack: "ui-serif, Georgia, Times, serif",
      paddingPx: 32,
      maxContentWidthCh: 85
    },
    {
      id: "mono-code",
      name: "Mono Code",
      description: "Monospaced style for code or quotes.",
      tokens: {
        "--bg": "#f0f0f0",
        "--fg": "#333333",
        "--shadow": "none",
        "--radius": "4px"
      },
      baseFontSizePx: 16,
      lineHeight: 1.5,
      fontFamilyStack: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
      paddingPx: 24,
      maxContentWidthCh: 90
    },
    {
      id: "cool-blue",
      name: "Cool Blue",
      description: "Soft blue background, dark text.",
      tokens: {
        "--bg": "#e6f7ff",
        "--fg": "#003a63",
        "--shadow": "none",
        "--radius": "4px"
      },
      baseFontSizePx: 18,
      lineHeight: 1.6,
      fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif",
      paddingPx: 32,
      maxContentWidthCh: 90
    },
    {
      id: "warm-paper",
      name: "Warm Paper",
      description: "Warm paper‑tone background with dark text.",
      tokens: {
        "--bg": "#fffaf0",
        "--fg": "#4a3f35",
        "--shadow": "none",
        "--radius": "4px"
      },
      baseFontSizePx: 18,
      lineHeight: 1.6,
      fontFamilyStack: "ui-serif, Georgia, Times, serif",
      paddingPx: 32,
      maxContentWidthCh: 90
    },
    {
      id: "vintage-green",
      name: "Vintage Green",
      description: "Soft green background with readable text.",
      tokens: {
        "--bg": "#edf9f5",
        "--fg": "#0a1f18",
        "--shadow": "none",
        "--radius": "4px"
      },
      baseFontSizePx: 18,
      lineHeight: 1.6,
      fontFamilyStack: "ui-serif, Georgia, Times, serif",
      paddingPx: 32,
      maxContentWidthCh: 90
    },
    {
      id: "dark-mode-blue",
      name: "Dark Mode Blue",
      description: "Dark blue background with light text.",
      tokens: {
        "--bg": "#0b1e3a",
        "--fg": "#e0e8f8",
        "--shadow": "none",
        "--radius": "4px"
      },
      baseFontSizePx: 18,
      lineHeight: 1.6,
      fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif",
      paddingPx: 32,
      maxContentWidthCh: 90
    },
    {
      id: "minimal-white",
      name: "Minimal White",
      description: "Ultra minimal — white background, subtle grey text.",
      tokens: {
        "--bg": "#ffffff",
        "--fg": "#555555",
        "--shadow": "none",
        "--radius": "0px"
      },
      baseFontSizePx: 18,
      lineHeight: 1.6,
      fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif",
      paddingPx: 32,
      maxContentWidthCh: 90
    }
  ];

  // State
  const state = {
    text: '',
    themeId: window.TextshotThemes[0].id,
    textScale: 1,
    columns: 80,
    lines: 40,
    paddingPx: 32,
    watermarkText: '',
    renderScale: 3,
    overflowFlag: false,
    autofit: false
  };

  // Cached DOM elements
  let elmTheme, elmTextScale, elmCols, elmRows, elmPadding, elmWatermark, elmAutofit, elmGenerate, elmStatus, elmEditor, elmPreview;
  let measurementSpan = null;

  // Utility: find theme object by id
  function getThemeById(id) {
    return window.TextshotThemes.find(t => t.id === id) || window.TextshotThemes[0];
  }

  // Utility: sanitize plain text for editor
  function sanitizeText(raw) {
    // Use only plain text, strip any HTML tags
    const div = document.createElement('div');
    div.innerHTML = raw;
    const text = div.textContent || div.innerText || '';
    // Normalize line breaks
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  // Apply theme: set CSS custom properties on editor container
  function applyTheme(theme) {
    const editor = elmEditor;
    // Set CSS variables
    Object.entries(theme.tokens).forEach(([key, value]) => {
      editor.style.setProperty(key, value);
    });
    // Set font family, base font size and line height via inline style
    editor.style.fontFamily = theme.fontFamilyStack;
    editor.style.fontSize = `${theme.baseFontSizePx * state.textScale}px`;
    editor.style.lineHeight = theme.lineHeight;
    // Also update padding default if paddingPx is currently equal to previous theme default
    state.paddingPx = theme.paddingPx;
    elmPadding.value = theme.paddingPx;
    // Store token for later use
    editor.style.setProperty('--paddingPx', `${state.paddingPx}px`);
    // Recalculate measurement span etc.
    recalcMeasurement();
    resizeEditor();
  }

  // Recalculate measurement span (average char width and line height)
  function recalcMeasurement() {
    if (!measurementSpan) {
      measurementSpan = document.createElement('span');
      measurementSpan.style.visibility = 'hidden';
      measurementSpan.style.position = 'absolute';
      measurementSpan.style.top = '-9999px';
      measurementSpan.style.left = '-9999px';
      document.body.appendChild(measurementSpan);
    }
    const theme = getThemeById(state.themeId);
    measurementSpan.style.fontFamily = theme.fontFamilyStack;
    measurementSpan.style.fontSize = `${theme.baseFontSizePx * state.textScale}px`;
    measurementSpan.style.lineHeight = theme.lineHeight;
    // Use string of 100 'M' for measurement
    const sample = 'M'.repeat(100);
    measurementSpan.textContent = sample;
    const width = measurementSpan.getBoundingClientRect().width;
    state._avgCharWidth = width / sample.length;
    state._lineBoxHeight = theme.baseFontSizePx * state.textScale * theme.lineHeight;
  }

  // Resize editor container based on columns, lines, padding
  function resizeEditor() {
    const cols = state.columns;
    const lines = state.lines;
    const padding = state.paddingPx;
    const avgCharWidth = state._avgCharWidth;
    const lineBoxHeight = state._lineBoxHeight;

    // Compute width and height
    const widthPx = Math.round(cols * avgCharWidth) + (2 * padding);
    const heightPx = Math.round(lines * lineBoxHeight) + (2 * padding);

    elmEditor.style.width = `${widthPx}px`;
    elmEditor.style.height = `${heightPx}px`;
    // Update padding CSS variable
    elmEditor.style.setProperty('--paddingPx', `${padding}px`);

    // After resizing, check overflow
    detectOverflow();
  }

  // Detect overflow of text in editor
  function detectOverflow() {
    const editor = elmEditor;
    // The watermark child should be excluded from content scroll measurement,
    // so ensure watermark has pointer‑events none and absolute positioning.
    const contentHeight = editor.clientHeight;
    const scrollHeight = editor.scrollHeight;
    if (scrollHeight > contentHeight) {
      state.overflowFlag = true;
      const missingLines = Math.ceil((scrollHeight - contentHeight) / (state._lineBoxHeight));
      if (state.autofit) {
        // adjust lines
        state.lines += missingLines;
        // reassure we keep within max safe limits
        if (state.lines > 2000) {
          state.lines = 2000;
        }
        elmRows.value = state.lines;
        resizeEditor();
        return;
      }
      updateStatus(`⚠️ Text exceeds configured lines by approximately ${missingLines} lines. Increase lines or enable Auto‑fit.`);
    } else {
      state.overflowFlag = false;
      updateStatus(``);
    }
  }

  // Update status message
  function updateStatus(msg) {
    elmStatus.textContent = msg;
  }

  // Handle control changes
  function handleThemeChange() {
    state.themeId = elmTheme.value;
    applyTheme(getThemeById(state.themeId));
  }

  function handleTextScaleChange() {
    const val = parseFloat(elmTextScale.value);
    if (!isNaN(val) && val > 0) {
      state.textScale = val;
      applyTheme(getThemeById(state.themeId));
    }
  }

  function handleColsChange() {
    const val = parseInt(elmCols.value, 10);
    if (!isNaN(val)) {
      state.columns = val;
      resizeEditor();
    }
  }

  function handleRowsChange() {
    const val = parseInt(elmRows.value, 10);
    if (!isNaN(val)) {
      state.lines = val;
      resizeEditor();
    }
  }

  function handlePaddingChange() {
    const val = parseInt(elmPadding.value, 10);
    if (!isNaN(val)) {
      state.paddingPx = val;
      resizeEditor();
    }
  }

  function handleWatermarkChange() {
    const val = elmWatermark.value;
    if (val.length <= 80) {
      state.watermarkText = val;
      renderWatermark();
    }
  }

  function handleAutofitChange() {
    state.autofit = elmAutofit.checked;
    detectOverflow();
  }

  // Render watermark inside the editor
  function renderWatermark() {
    let wm = elmEditor.querySelector('.ts‑watermark');
    if (state.watermarkText) {
      if (!wm) {
        wm = document.createElement('div');
        wm.className = 'ts‑watermark';
        elmEditor.appendChild(wm);
      }
      wm.textContent = state.watermarkText;
    } else {
      if (wm) {
        wm.remove();
      }
    }
  }

  // Public API: generate image
  function generateImage() {
    updateStatus('Generating image…');
    const editor = elmEditor;
    // Sanitize again plain text
    state.text = sanitizeText(editor.innerText || editor.textContent || '');
    if (!state.text.trim()) {
      updateStatus('Error: Text is empty. Please enter some text.');
      return Promise.reject(new Error('Text empty'));
    }

    // Determine renderScale based on viewport width
    const isMobile = window.innerWidth < 600;
    const baseScale = isMobile ? 2 : 3;
    state.renderScale = baseScale;

    // Get CSS size
    const rect = editor.getBoundingClientRect();
    let cssWidth = Math.round(rect.width);
    let cssHeight = Math.round(rect.height);

    // Apply safe limits
    const maxDimension = 8192;
    const maxArea = 32000000;
    let scale = state.renderScale;
    if (cssWidth * scale > maxDimension || cssHeight * scale > maxDimension || (cssWidth * cssHeight * scale * scale) > maxArea) {
      // reduce scale
      scale = Math.floor(Math.min(maxDimension / cssWidth, maxDimension / cssHeight, Math.sqrt(maxArea / (cssWidth * cssHeight))));
      if (scale < 1) scale = 1;
      updateStatus(`⚠️ Output too large for scale ${state.renderScale}. Reducing scale to ${scale}.`);
    }

    return window.html2canvas(editor, {
      scale: scale,
      width: cssWidth,
      height: cssHeight,
      backgroundColor: null,
      logging: false
    }).then(canvas => {
      // Clear previous preview
      elmPreview.innerHTML = '';
      // Append canvas
      elmPreview.appendChild(canvas);
      // Create mirrored image
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.src = dataUrl;
      elmPreview.appendChild(img);
      updateStatus(`Generated image at ${canvas.width} × ${canvas.height} px, scale ${scale}.`);
      return canvas;
    }).catch(err => {
      console.error('Error generating image:', err);
      updateStatus('Error: failed to generate image.');
      return Promise.reject(err);
    });
  }

  // Public API object
  window.Textshot = {
    init: function(options = {}) {
      // DOM references
      elmTheme = document.getElementById('ts-theme');
      elmTextScale = document.getElementById('ts-text-scale');
      elmCols = document.getElementById('ts-cols');
      elmRows = document.getElementById('ts-rows');
      elmPadding = document.getElementById('ts-padding');
      elmWatermark = document.getElementById('ts-watermark');
      elmAutofit = document.getElementById('ts-autofit');
      elmGenerate = document.getElementById('ts-generate');
      elmStatus = document.getElementById('ts-status');
      elmEditor = document.getElementById('ts-editor');
      elmPreview = document.getElementById('ts-preview');

      // Populate theme selector
      window.TextshotThemes.forEach(theme => {
        const opt = document.createElement('option');
        opt.value = theme.id;
        opt.textContent = theme.name;
        elmTheme.appendChild(opt);
      });

      // Set initial values from options or defaults
      if (options.themeId) state.themeId = options.themeId;
      if (options.textScale) state.textScale = options.textScale;
      if (options.columns) state.columns = options.columns;
      if (options.lines) state.lines = options.lines;
      if (options.paddingPx) state.paddingPx = options.paddingPx;
      if (options.watermarkText) state.watermarkText = options.watermarkText;
      if (options.renderScale) state.renderScale = options.renderScale;

      // Apply initial control values
      elmTheme.value = state.themeId;
      elmTextScale.value = state.textScale;
      elmCols.value = state.columns;
      elmRows.value = state.lines;
      elmPadding.value = state.paddingPx;
      elmWatermark.value = state.watermarkText;
      elmAutofit.checked = state.autofit;

      // Set event listeners
      elmTheme.addEventListener('change', handleThemeChange);
      elmTextScale.addEventListener('input', handleTextScaleChange);
      elmCols.addEventListener('input', handleColsChange);
      elmRows.addEventListener('input', handleRowsChange);
      elmPadding.addEventListener('input', handlePaddingChange);
      elmWatermark.addEventListener('input', handleWatermarkChange);
      elmAutofit.addEventListener('change', handleAutofitChange);
      elmGenerate.addEventListener('click', () => { window.Textshot.generate(); });

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          window.Textshot.generate();
        }
        if (e.key === 'Escape') {
          updateStatus('');
        }
      });

      // Paste sanitization
      elmEditor.addEventListener('paste', (e) => {
        e.preventDefault();
        const clipboard = (e.clipboardData || window.clipboardData);
        const text = clipboard.getData('text/plain');
        const sanitized = sanitizeText(text);
        // Insert at caret position
        const selection = window.getSelection();
        if (!selection.rangeCount) {
          elmEditor.textContent += sanitized;
        } else {
          selection.deleteFromDocument();
          const range = selection.getRangeAt(0);
          const frag = document.createTextNode(sanitized);
          range.insertNode(frag);
          // Move caret after inserted node
          range.setStartAfter(frag);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        // After input update model text and overflow
        state.text = sanitizeText(elmEditor.textContent);
        detectOverflow();
      });

      // Initial application
      applyTheme(getThemeById(state.themeId));
      // Also render watermark if provided
      renderWatermark();
      // Insert initial text if any
      if (options.text) {
        const sanitized = sanitizeText(options.text);
        elmEditor.textContent = sanitized;
        state.text = sanitized;
      }
      // Initial sizing
      recalcMeasurement();
      resizeEditor();
    },
    generate: generateImage,
    setTheme: function(themeId) {
      elmTheme.value = themeId;
      handleThemeChange();
    },
    setTextScale: function(mult) {
      elmTextScale.value = mult;
      handleTextScaleChange();
    },
    setColumnsLines: function(cols, rows) {
      elmCols.value = cols;
      elmRows.value = rows;
      handleColsChange();
      handleRowsChange();
    },
    setPadding: function(paddingPx) {
      elmPadding.value = paddingPx;
      handlePaddingChange();
    },
    setWatermark: function(text) {
      elmWatermark.value = text;
      handleWatermarkChange();
    },
    getState: function() {
      return { ...state };
    }
  };

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    window.Textshot.init({});
  });
})();

