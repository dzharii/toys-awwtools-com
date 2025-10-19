(function() {
    'use strict';

    // Theme definitions
    window.TextshotThemes = [
        {
            id: "classic-light",
            name: "Classic Light",
            description: "Light background, dark text, generous line spacing.",
            tokens: {
                "--bg": "#ffffff",
                "--fg": "#1f2937",
                "--shadow": "0 4px 6px rgba(0, 0, 0, 0.1)",
                "--radius": "8px"
            },
            baseFontSizePx: 18,
            lineHeight: 1.6,
            fontFamilyStack: "ui-serif, Georgia, Times, serif",
            paddingPx: 32,
            maxContentWidthCh: 90
        },
        {
            id: "dark-mode",
            name: "Dark Mode",
            description: "Dark background with bright text.",
            tokens: {
                "--bg": "#1a1a1a",
                "--fg": "#e5e5e5",
                "--shadow": "0 4px 6px rgba(0, 0, 0, 0.3)",
                "--radius": "8px"
            },
            baseFontSizePx: 18,
            lineHeight: 1.6,
            fontFamilyStack: "ui-monospace, 'Cascadia Code', 'Courier New', monospace",
            paddingPx: 32,
            maxContentWidthCh: 90
        },
        {
            id: "high-contrast",
            name: "High Contrast",
            description: "Maximum contrast for visibility.",
            tokens: {
                "--bg": "#000000",
                "--fg": "#ffffff",
                "--shadow": "0 2px 4px rgba(255, 255, 255, 0.2)",
                "--radius": "4px"
            },
            baseFontSizePx: 20,
            lineHeight: 1.8,
            fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, sans-serif",
            paddingPx: 40,
            maxContentWidthCh: 80
        },
        {
            id: "minimal",
            name: "Minimal",
            description: "Clean and simple, no shadows.",
            tokens: {
                "--bg": "#fafafa",
                "--fg": "#333333",
                "--shadow": "none",
                "--radius": "0px"
            },
            baseFontSizePx: 16,
            lineHeight: 1.5,
            fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, sans-serif",
            paddingPx: 24,
            maxContentWidthCh: 100
        },
        {
            id: "warm-paper",
            name: "Warm Paper",
            description: "Soft warm tones like aged paper.",
            tokens: {
                "--bg": "#f5ebe0",
                "--fg": "#3e2723",
                "--shadow": "0 2px 8px rgba(62, 39, 35, 0.1)",
                "--radius": "12px"
            },
            baseFontSizePx: 18,
            lineHeight: 1.7,
            fontFamilyStack: "ui-serif, Georgia, Times, serif",
            paddingPx: 36,
            maxContentWidthCh: 85
        },
        {
            id: "blue-note",
            name: "Blue Note",
            description: "Cool blue background with dark text.",
            tokens: {
                "--bg": "#dbeafe",
                "--fg": "#1e3a8a",
                "--shadow": "0 4px 6px rgba(30, 58, 138, 0.15)",
                "--radius": "8px"
            },
            baseFontSizePx: 17,
            lineHeight: 1.6,
            fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, sans-serif",
            paddingPx: 32,
            maxContentWidthCh: 90
        },
        {
            id: "code-editor",
            name: "Code Editor",
            description: "Monospace font with code-like styling.",
            tokens: {
                "--bg": "#282c34",
                "--fg": "#abb2bf",
                "--shadow": "0 4px 8px rgba(0, 0, 0, 0.3)",
                "--radius": "6px"
            },
            baseFontSizePx: 16,
            lineHeight: 1.5,
            fontFamilyStack: "ui-monospace, 'Cascadia Code', Consolas, monospace",
            paddingPx: 28,
            maxContentWidthCh: 100
        },
        {
            id: "soft-gray",
            name: "Soft Gray",
            description: "Gentle gray tones for easy reading.",
            tokens: {
                "--bg": "#f3f4f6",
                "--fg": "#374151",
                "--shadow": "0 2px 4px rgba(0, 0, 0, 0.06)",
                "--radius": "10px"
            },
            baseFontSizePx: 18,
            lineHeight: 1.65,
            fontFamilyStack: "ui-sans-serif, system-ui, -apple-system, sans-serif",
            paddingPx: 32,
            maxContentWidthCh: 88
        },
        {
            id: "terminal",
            name: "Terminal",
            description: "Classic terminal green on black.",
            tokens: {
                "--bg": "#0a0e14",
                "--fg": "#00ff00",
                "--shadow": "0 0 20px rgba(0, 255, 0, 0.2)",
                "--radius": "4px"
            },
            baseFontSizePx: 16,
            lineHeight: 1.4,
            fontFamilyStack: "ui-monospace, 'Courier New', monospace",
            paddingPx: 24,
            maxContentWidthCh: 100
        },
        {
            id: "elegant-serif",
            name: "Elegant Serif",
            description: "Refined serif with generous spacing.",
            tokens: {
                "--bg": "#fffef9",
                "--fg": "#2d2d2d",
                "--shadow": "0 4px 12px rgba(0, 0, 0, 0.08)",
                "--radius": "8px"
            },
            baseFontSizePx: 19,
            lineHeight: 1.75,
            fontFamilyStack: "ui-serif, Georgia, 'Times New Roman', serif",
            paddingPx: 40,
            maxContentWidthCh: 75
        }
    ];

    // State management
    const state = {
        text: '',
        themeId: 'classic-light',
        textScale: 1.0,
        columns: 80,
        lines: 40,
        paddingPx: 32,
        watermarkText: '',
        renderScale: 3,
        lastCanvas: null,
        overflowFlag: false,
        autoFit: false
    };

    // DOM elements
    let elements = {};

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize
    function init(options) {
        options = options || {};

        // Get DOM elements
        elements = {
            app: document.getElementById('ts-app'),
            controls: document.getElementById('ts-controls'),
            themeSelect: document.getElementById('ts-theme'),
            textScaleInput: document.getElementById('ts-text-scale'),
            textScaleValue: document.getElementById('ts-text-scale-value'),
            colsInput: document.getElementById('ts-cols'),
            colsValue: document.getElementById('ts-cols-value'),
            rowsInput: document.getElementById('ts-rows'),
            rowsValue: document.getElementById('ts-rows-value'),
            paddingInput: document.getElementById('ts-padding'),
            paddingValue: document.getElementById('ts-padding-value'),
            watermarkInput: document.getElementById('ts-watermark'),
            autofitCheckbox: document.getElementById('ts-autofit'),
            generateButton: document.getElementById('ts-generate'),
            status: document.getElementById('ts-status'),
            editor: document.getElementById('ts-editor'),
            watermarkOverlay: document.getElementById('ts-watermark-overlay'),
            preview: document.getElementById('ts-preview')
        };

        // Detect mobile and set renderScale
        const isMobile = window.innerWidth < 768;
        state.renderScale = isMobile ? 2 : 3;

        // Apply options
        if (options.themeId) state.themeId = options.themeId;
        if (options.textScale) state.textScale = options.textScale;
        if (options.columns) state.columns = options.columns;
        if (options.lines) state.lines = options.lines;
        if (options.paddingPx) state.paddingPx = options.paddingPx;
        if (options.watermarkText) state.watermarkText = options.watermarkText;
        if (options.renderScale) state.renderScale = options.renderScale;

        // Populate theme selector
        populateThemeSelector();

        // Set initial values
        elements.textScaleInput.value = state.textScale;
        elements.textScaleValue.textContent = state.textScale.toFixed(2);
        elements.colsInput.value = state.columns;
        elements.colsValue.textContent = state.columns;
        elements.rowsInput.value = state.lines;
        elements.rowsValue.textContent = state.lines;
        elements.paddingInput.value = state.paddingPx;
        elements.paddingValue.textContent = state.paddingPx;
        elements.watermarkInput.value = state.watermarkText;

        // Bind events
        bindEvents();

        // Apply initial theme
        applyTheme();
        updateEditorSize();

        // Get initial text
        state.text = elements.editor.textContent;
    }

    function populateThemeSelector() {
        elements.themeSelect.innerHTML = '';
        window.TextshotThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.name;
            if (theme.id === state.themeId) {
                option.selected = true;
            }
            elements.themeSelect.appendChild(option);
        });
    }

    function bindEvents() {
        // Theme change
        elements.themeSelect.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });

        // Text scale
        elements.textScaleInput.addEventListener('input', debounce((e) => {
            setTextScale(parseFloat(e.target.value));
        }, 100));

        // Columns
        elements.colsInput.addEventListener('input', debounce((e) => {
            const cols = parseInt(e.target.value);
            elements.colsValue.textContent = cols;
            setColumnsLines(cols, state.lines);
        }, 100));

        // Lines
        elements.rowsInput.addEventListener('input', debounce((e) => {
            const rows = parseInt(e.target.value);
            elements.rowsValue.textContent = rows;
            setColumnsLines(state.columns, rows);
        }, 100));

        // Padding
        elements.paddingInput.addEventListener('input', debounce((e) => {
            const padding = parseInt(e.target.value);
            elements.paddingValue.textContent = padding;
            setPadding(padding);
        }, 100));

        // Watermark
        elements.watermarkInput.addEventListener('input', debounce((e) => {
            setWatermark(e.target.value);
        }, 300));

        // Auto-fit
        elements.autofitCheckbox.addEventListener('change', (e) => {
            state.autoFit = e.target.checked;
            checkOverflow();
        });

        // Editor paste
        elements.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            const sanitized = sanitizeText(text);
            document.execCommand('insertText', false, sanitized);
        });

        // Editor input
        elements.editor.addEventListener('input', debounce(() => {
            state.text = elements.editor.textContent;
            checkOverflow();
        }, 300));

        // Generate button
        elements.generateButton.addEventListener('click', () => {
            generate();
        });

        // Keyboard shortcut: Ctrl/Cmd + Enter
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                generate();
            }
        });
    }

    function sanitizeText(text) {
        // Strip HTML and keep only plain text
        const div = document.createElement('div');
        div.textContent = text;
        return div.textContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    function setTheme(themeId) {
        const theme = window.TextshotThemes.find(t => t.id === themeId);
        if (!theme) return;

        state.themeId = themeId;
        applyTheme();
    }

    function applyTheme() {
        const theme = window.TextshotThemes.find(t => t.id === state.themeId);
        if (!theme) return;

        // Apply CSS custom properties
        const editor = elements.editor;
        Object.keys(theme.tokens).forEach(key => {
            editor.style.setProperty(key, theme.tokens[key]);
        });

        // Apply styles
        editor.style.backgroundColor = theme.tokens['--bg'];
        editor.style.color = theme.tokens['--fg'];
        editor.style.fontFamily = theme.fontFamilyStack;
        editor.style.fontSize = (theme.baseFontSizePx * state.textScale) + 'px';
        editor.style.lineHeight = theme.lineHeight;
        editor.style.boxShadow = theme.tokens['--shadow'];
        editor.style.borderRadius = theme.tokens['--radius'];

        // Update padding if not manually changed
        if (state.paddingPx === parseInt(elements.paddingInput.value)) {
            state.paddingPx = theme.paddingPx;
            elements.paddingInput.value = theme.paddingPx;
            elements.paddingValue.textContent = theme.paddingPx;
        }

        updateEditorSize();
    }

    function setTextScale(multiplier) {
        state.textScale = multiplier;
        elements.textScaleValue.textContent = multiplier.toFixed(2);
        applyTheme();
    }

    function setColumnsLines(cols, rows) {
        state.columns = cols;
        state.lines = rows;
        updateEditorSize();
    }

    function setPadding(paddingPx) {
        state.paddingPx = paddingPx;
        elements.editor.style.padding = paddingPx + 'px';
        updateWatermarkPosition();
        updateEditorSize();
    }

    function setWatermark(text) {
        state.watermarkText = text;
        elements.watermarkOverlay.textContent = text;
        updateWatermarkPosition();
    }

    function updateWatermarkPosition() {
        if (state.watermarkText) {
            elements.watermarkOverlay.style.display = 'block';
            elements.watermarkOverlay.style.bottom = state.paddingPx + 'px';
            elements.watermarkOverlay.style.right = state.paddingPx + 'px';
        } else {
            elements.watermarkOverlay.style.display = 'none';
        }
    }

    function updateEditorSize() {
        const theme = window.TextshotThemes.find(t => t.id === state.themeId);
        if (!theme) return;

        // Create measurement span if not exists
        let measureSpan = document.getElementById('ts-measurement-span');
        if (!measureSpan) {
            measureSpan = document.createElement('span');
            measureSpan.id = 'ts-measurement-span';
            document.body.appendChild(measureSpan);
        }

        // Measure average character width
        measureSpan.style.fontFamily = theme.fontFamilyStack;
        measureSpan.style.fontSize = (theme.baseFontSizePx * state.textScale) + 'px';
        measureSpan.style.lineHeight = theme.lineHeight;
        measureSpan.textContent = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        const sampleWidth = measureSpan.offsetWidth;
        const sampleLength = measureSpan.textContent.length;
        const avgCharWidth = sampleWidth / sampleLength;

        // Calculate line height
        const fontSize = theme.baseFontSizePx * state.textScale;
        const lineHeight = fontSize * theme.lineHeight;

        // Calculate dimensions
        const contentWidth = Math.round(state.columns * avgCharWidth);
        const contentHeight = Math.round(state.lines * lineHeight);
        const totalWidth = contentWidth + (state.paddingPx * 2);
        const totalHeight = contentHeight + (state.paddingPx * 2);

        // Apply size
        elements.editor.style.width = totalWidth + 'px';
        elements.editor.style.height = totalHeight + 'px';
        elements.editor.style.maxWidth = '100%';

        // Check overflow after size update
        requestAnimationFrame(() => {
            checkOverflow();
        });
    }

    function checkOverflow() {
        const scrollHeight = elements.editor.scrollHeight;
        const clientHeight = elements.editor.clientHeight;

        state.overflowFlag = scrollHeight > clientHeight;

        if (state.overflowFlag && !state.autoFit) {
            const theme = window.TextshotThemes.find(t => t.id === state.themeId);
            const lineHeight = theme.baseFontSizePx * state.textScale * theme.lineHeight;
            const missingLines = Math.ceil((scrollHeight - clientHeight) / lineHeight);
            showStatus(`Text exceeds configured lines by approximately ${missingLines} line(s). Increase lines or enable Auto-fit.`, 'warning');
        } else if (state.overflowFlag && state.autoFit) {
            // Auto-fit: increase lines
            const theme = window.TextshotThemes.find(t => t.id === state.themeId);
            const lineHeight = theme.baseFontSizePx * state.textScale * theme.lineHeight;
            const neededLines = Math.ceil(scrollHeight / lineHeight) + 2; // Add buffer
            const cappedLines = Math.min(neededLines, 200); // Cap at max

            if (cappedLines !== state.lines) {
                state.lines = cappedLines;
                elements.rowsInput.value = cappedLines;
                elements.rowsValue.textContent = cappedLines;
                updateEditorSize();
            }
        }
    }

    function showStatus(message, type) {
        elements.status.textContent = message;
        elements.status.className = 'show ' + type;

        if (type === 'success') {
            setTimeout(() => {
                elements.status.classList.remove('show');
            }, 5000);
        }
    }

    function generate() {
        if (!state.text.trim()) {
            showStatus('Editor is empty. Please add text first.', 'error');
            return;
        }

        // Check safe limits
        const editorWidth = elements.editor.offsetWidth;
        const editorHeight = elements.editor.offsetHeight;
        const canvasWidth = editorWidth * state.renderScale;
        const canvasHeight = editorHeight * state.renderScale;
        const maxDimension = 8192;
        const maxArea = 32000000;

        if (canvasWidth > maxDimension || canvasHeight > maxDimension || (canvasWidth * canvasHeight) > maxArea) {
            showStatus('Output too large. Reduce columns, lines, or scale.', 'error');
            return;
        }

        // Show generating status
        showStatus('Generating image...', 'success');
        elements.generateButton.disabled = true;

        // Use html2canvas to render
        setTimeout(() => {
            html2canvas(elements.editor, {
                scale: state.renderScale,
                backgroundColor: null,
                logging: false,
                useCORS: true
            }).then(canvas => {
                state.lastCanvas = canvas;

                // Clear preview
                elements.preview.innerHTML = '';

                // Add canvas
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';
                elements.preview.appendChild(canvas);

                // Create mirror image for better copy support
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.style.display = 'none'; // Hide, but available for right-click
                elements.preview.appendChild(img);

                // Show success status
                showStatus(`Generated at ${canvas.width}×${canvas.height}px, scale ${state.renderScale}`, 'success');
                elements.generateButton.disabled = false;
            }).catch(err => {
                console.error('Generation error:', err);
                showStatus('Failed to generate image. Please try again.', 'error');
                elements.generateButton.disabled = false;
            });
        }, 100);
    }

    function getState() {
        return Object.assign({}, state);
    }

    // Public API
    window.Textshot = {
        init: init,
        generate: generate,
        setTheme: setTheme,
        setTextScale: setTextScale,
        setColumnsLines: setColumnsLines,
        setPadding: setPadding,
        setWatermark: setWatermark,
        getState: getState
    };

    // Auto-initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.Textshot.init();
        });
    } else {
        window.Textshot.init();
    }
})();
