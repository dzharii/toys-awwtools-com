/**
 * Scoped stylesheet for the Reading Navigator Shadow DOM UI.
 *
 * Exported as a string so it can be injected into the shadow root. All rules
 * are scoped under :host and app class names; nothing here targets page
 * content. An isolation baseline resets inherited page styles.
 */

export const STYLES = `
:host {
  all: initial;
  --rn-bg: #ffffff;
  --rn-fg: #1f2328;
  --rn-muted: #57606a;
  --rn-border: #d0d7de;
  --rn-accent: #2563eb;
  --rn-accent-fg: #ffffff;
  --rn-focus: #d97706;
  --rn-manual: #9333ea;
  --rn-panel-shadow: 0 8px 32px rgba(0,0,0,0.18);
  --rn-radius: 10px;
  --rn-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --rn-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --rn-font-scale: 1;
  --rn-opacity: 1;
  /* state colors */
  --rn-unseen: #e5e7eb;
  --rn-seen: #93c5fd;
  --rn-skimmed: #fcd34d;
  --rn-read: #34d399;
  --rn-reread: #059669;
  --rn-active: #2563eb;
  --rn-lastfocus: #d97706;
  --rn-mark: #9333ea;
}

.rn-root, .rn-root * {
  box-sizing: border-box;
}

.rn-root {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 340px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  background: var(--rn-bg);
  color: var(--rn-fg);
  font-family: var(--rn-font);
  font-size: calc(13px * var(--rn-font-scale));
  line-height: 1.45;
  border: 1px solid var(--rn-border);
  border-radius: var(--rn-radius);
  box-shadow: var(--rn-panel-shadow);
  opacity: var(--rn-opacity);
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:host([data-theme="dark"]) {
  --rn-bg: #161b22;
  --rn-fg: #e6edf3;
  --rn-muted: #9198a1;
  --rn-border: #30363d;
  --rn-accent: #4d8bf0;
  --rn-unseen: #30363d;
}

:host([data-contrast="high"]) {
  --rn-border: #000000;
  --rn-fg: #000000;
  --rn-panel-shadow: 0 0 0 2px #000000, 0 8px 32px rgba(0,0,0,0.4);
}
:host([data-theme="dark"][data-contrast="high"]) {
  --rn-border: #ffffff;
  --rn-fg: #ffffff;
}

/* Title bar */
.rn-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--rn-accent);
  color: var(--rn-accent-fg);
  cursor: grab;
  user-select: none;
  flex: 0 0 auto;
}
.rn-titlebar.rn-dragging { cursor: grabbing; }
.rn-title {
  font-weight: 600;
  font-size: calc(13px * var(--rn-font-scale));
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rn-titlebar-buttons { display: flex; gap: 4px; flex: 0 0 auto; }

.rn-iconbtn {
  all: unset;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--rn-accent-fg);
  font-size: 14px;
  line-height: 1;
}
.rn-iconbtn:hover { background: rgba(255,255,255,0.18); }
.rn-iconbtn:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }

/* Body scroll area */
.rn-body {
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
}

.rn-section { display: flex; flex-direction: column; gap: 6px; }
.rn-section-title {
  font-size: calc(11px * var(--rn-font-scale));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--rn-muted);
  font-weight: 600;
  margin: 0;
}

/* Status bar */
.rn-statusbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.rn-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: calc(11px * var(--rn-font-scale));
  font-weight: 600;
  background: var(--rn-unseen);
  color: var(--rn-fg);
}
.rn-pill.rn-tracking { background: #dcfce7; color: #166534; }
.rn-pill.rn-paused { background: #fef3c7; color: #92400e; }
.rn-pill.rn-idle, .rn-pill.rn-hidden, .rn-pill.rn-unfocused { background: #e5e7eb; color: #57606a; }
.rn-pill.rn-session-only { background: #fee2e2; color: #991b1b; }
.rn-pill.rn-saving { background: #dbeafe; color: #1e40af; }
.rn-pill.rn-saved { background: #dcfce7; color: #166534; }
:host([data-theme="dark"]) .rn-pill { background: #30363d; }

/* Heading context */
.rn-heading-path {
  font-size: calc(12px * var(--rn-font-scale));
  color: var(--rn-fg);
  word-break: break-word;
}
.rn-heading-path .rn-crumb { color: var(--rn-muted); }
.rn-heading-path .rn-crumb-current { color: var(--rn-fg); font-weight: 600; }

.rn-heading-list { display: flex; flex-direction: column; gap: 2px; }
.rn-heading-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.rn-heading-jump {
  all: unset;
  cursor: pointer;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 6px;
  min-width: 0;
}
.rn-heading-jump:hover { background: rgba(37,99,235,0.08); }
.rn-heading-jump:focus-visible { outline: 2px solid var(--rn-accent); }
.rn-heading-jump.rn-current { background: rgba(37,99,235,0.12); font-weight: 600; }
.rn-heading-text {
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: calc(12px * var(--rn-font-scale));
}
.rn-lvl { color: var(--rn-muted); font-size: calc(10px * var(--rn-font-scale)); font-family: var(--rn-mono); flex: 0 0 auto; }

.rn-progressbar {
  flex: 0 0 54px;
  height: 6px;
  background: var(--rn-unseen);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.rn-progressbar > i {
  display: block;
  height: 100%;
  background: var(--rn-read);
  width: 0%;
}
.rn-section-flags { display: inline-flex; gap: 3px; flex: 0 0 auto; }
.rn-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.rn-dot.rn-lf { background: var(--rn-lastfocus); }
.rn-dot.rn-mk { background: var(--rn-mark); }

/* Restore card */
.rn-card {
  border: 1px solid var(--rn-border);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(217,119,6,0.06);
}
.rn-card.rn-empty { background: transparent; color: var(--rn-muted); }
.rn-card-row { display: flex; justify-content: space-between; gap: 8px; font-size: calc(12px * var(--rn-font-scale)); }
.rn-card-label { color: var(--rn-muted); }
.rn-card-warn { color: #92400e; font-size: calc(11px * var(--rn-font-scale)); }

.rn-btn {
  all: unset;
  cursor: pointer;
  text-align: center;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: calc(12px * var(--rn-font-scale));
  font-weight: 600;
  background: var(--rn-unseen);
  color: var(--rn-fg);
  border: 1px solid var(--rn-border);
}
.rn-btn:hover { filter: brightness(0.97); }
.rn-btn:focus-visible { outline: 2px solid var(--rn-accent); outline-offset: 1px; }
.rn-btn.rn-primary { background: var(--rn-accent); color: var(--rn-accent-fg); border-color: transparent; }
.rn-btn.rn-danger { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
.rn-btn:disabled, .rn-btn[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }

/* Controls grid */
.rn-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.rn-controls .rn-wide { grid-column: 1 / -1; }

/* Settings */
.rn-setting-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rn-setting-row label { font-size: calc(12px * var(--rn-font-scale)); color: var(--rn-fg); }
.rn-setting-row input[type="range"] { flex: 1 1 auto; }
.rn-seg-toggle { display: inline-flex; border: 1px solid var(--rn-border); border-radius: 6px; overflow: hidden; }
.rn-seg-toggle button {
  all: unset; cursor: pointer; padding: 3px 8px; font-size: calc(11px * var(--rn-font-scale));
}
.rn-seg-toggle button.rn-on { background: var(--rn-accent); color: var(--rn-accent-fg); }

/* Minimap rail */
.rn-minimap-wrap { display: flex; gap: 8px; }
.rn-minimap {
  position: relative;
  flex: 0 0 22px;
  width: 22px;
  min-height: 160px;
  background: var(--rn-unseen);
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
}
.rn-mini-seg { position: absolute; left: 0; width: 100%; }
.rn-mini-seg.s-unseen { background: transparent; }
.rn-mini-seg.s-seen { background: var(--rn-seen); }
.rn-mini-seg.s-skimmed { background: var(--rn-skimmed); }
.rn-mini-seg.s-probably-read { background: var(--rn-read); }
.rn-mini-seg.s-reread { background: var(--rn-reread); }
.rn-mini-seg.s-active { background: var(--rn-active); }
.rn-mini-viewport {
  position: absolute; left: 0; width: 100%;
  background: rgba(37,99,235,0.18);
  border-top: 1px solid var(--rn-active);
  border-bottom: 1px solid var(--rn-active);
  pointer-events: none;
}
.rn-mini-marker { position: absolute; left: 0; width: 100%; height: 2px; pointer-events: none; }
.rn-mini-marker.rn-lf { background: var(--rn-lastfocus); box-shadow: 0 0 3px var(--rn-lastfocus); height: 3px; }
.rn-mini-marker.rn-mk { background: var(--rn-mark); box-shadow: 0 0 3px var(--rn-mark); height: 3px; }

.rn-legend { display: flex; flex-direction: column; gap: 3px; flex: 1 1 auto; justify-content: center; }
.rn-legend-item { display: flex; align-items: center; gap: 6px; font-size: calc(10px * var(--rn-font-scale)); color: var(--rn-muted); }
.rn-legend-swatch { width: 12px; height: 8px; border-radius: 2px; flex: 0 0 auto; }

/* Progress summary */
.rn-progress-summary { display: flex; height: 8px; border-radius: 4px; overflow: hidden; }
.rn-progress-summary > span { display: block; height: 100%; }

/* Debug */
.rn-debug { font-family: var(--rn-mono); font-size: calc(10px * var(--rn-font-scale)); color: var(--rn-muted); white-space: pre-wrap; }

/* Empty state */
.rn-empty-state { color: var(--rn-muted); font-size: calc(12px * var(--rn-font-scale)); text-align: center; padding: 8px; }

/* Compact mode */
:host([data-mode="compact"]) .rn-root { width: 210px; }
:host([data-mode="compact"]) .rn-collapsible { display: none; }
:host([data-mode="compact"]) .rn-minimap { min-height: 220px; }

/* Resize handle */
.rn-resize {
  position: absolute;
  width: 14px; height: 14px;
  right: 2px; bottom: 2px;
  cursor: nwse-resize;
  background:
    linear-gradient(135deg, transparent 50%, var(--rn-muted) 50%, var(--rn-muted) 60%, transparent 60%, transparent 70%, var(--rn-muted) 70%, var(--rn-muted) 80%, transparent 80%);
  opacity: 0.6;
}

/* ARIA live region visually hidden */
.rn-live {
  position: absolute !important;
  width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0);
  white-space: nowrap;
}

.rn-confirm {
  display: flex; flex-direction: column; gap: 8px;
  padding: 10px; border: 1px solid var(--rn-border); border-radius: 8px;
  background: var(--rn-bg);
}
.rn-confirm-actions { display: flex; gap: 6px; }
.rn-confirm-actions .rn-btn { flex: 1 1 0; }

@media (prefers-reduced-motion: reduce) {
  .rn-root, .rn-root * { transition: none !important; scroll-behavior: auto !important; }
}
`;
