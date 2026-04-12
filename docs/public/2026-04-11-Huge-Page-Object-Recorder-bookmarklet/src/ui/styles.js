import { TOOL_NAMESPACE } from "../utils.js";

export function getToolStyles() {
  return `
    :host {
      all: initial;
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      pointer-events: none;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    .${TOOL_NAMESPACE}-shell,
    .${TOOL_NAMESPACE}-shell * {
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    .${TOOL_NAMESPACE}-shell {
      position: fixed;
      inset: 0;
      pointer-events: none;
      color: var(--tool-text);
      --tool-radius-window: 16px;
      --tool-radius-panel: 12px;
      --tool-shadow: 0 18px 50px rgba(0, 0, 0, 0.26);
      --tool-window-bg: #ececec;
      --tool-window-panel: #f6f6f6;
      --tool-title-bg: linear-gradient(180deg, #fafafa, #dcdcdc);
      --tool-title-text: #121212;
      --tool-toolbar-bg: #e6e6e6;
      --tool-footer-bg: #e4e4e4;
      --tool-text: #161616;
      --tool-muted: #595959;
      --tool-border: #bdbdbd;
      --tool-border-strong: #8f8f8f;
      --tool-input-bg: #ffffff;
      --tool-button-bg: linear-gradient(180deg, #ffffff, #dddddd);
      --tool-button-active: linear-gradient(180deg, #d8ebff, #9bc0f1);
      --tool-button-text: #181818;
      --tool-focus: #0a84ff;
      --tool-list-selected: #dcecff;
      --tool-code-bg: #f4f4f4;
      --tool-code-text: #17212b;
      --tool-success: #1f7a48;
      --tool-warning: #9a5a00;
      --tool-danger: #9b2c2c;
      --tool-accent: #0a84ff;
      --tool-title-height: 38px;
      --tool-toolbar-height: 42px;
    }

    .${TOOL_NAMESPACE}-shell.theme-macos {
      --tool-radius-window: 18px;
      --tool-radius-panel: 13px;
      --tool-shadow: 0 24px 68px rgba(15, 18, 30, 0.24);
      --tool-window-bg: rgba(243, 243, 245, 0.98);
      --tool-window-panel: rgba(250, 250, 252, 0.98);
      --tool-title-bg: linear-gradient(180deg, rgba(249, 249, 251, 0.98), rgba(226, 226, 230, 0.98));
      --tool-title-text: #1e1e20;
      --tool-toolbar-bg: rgba(239, 239, 242, 0.98);
      --tool-footer-bg: rgba(238, 238, 241, 0.98);
      --tool-text: #1f2227;
      --tool-muted: #69707a;
      --tool-border: rgba(59, 63, 73, 0.2);
      --tool-border-strong: rgba(59, 63, 73, 0.34);
      --tool-input-bg: rgba(255, 255, 255, 0.96);
      --tool-button-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(229, 229, 233, 0.98));
      --tool-button-active: linear-gradient(180deg, #d9ebff, #abcaf7);
      --tool-focus: #0a84ff;
      --tool-list-selected: rgba(10, 132, 255, 0.14);
      --tool-code-bg: #f1f4f7;
      --tool-code-text: #102030;
      --tool-accent: #0a84ff;
    }

    .${TOOL_NAMESPACE}-shell.theme-windows-xp {
      --tool-radius-window: 9px;
      --tool-radius-panel: 8px;
      --tool-shadow: 0 18px 56px rgba(1, 20, 55, 0.38);
      --tool-window-bg: #ece9d8;
      --tool-window-panel: #f7f3e8;
      --tool-title-bg: linear-gradient(180deg, #2d78d6, #0b4fb3);
      --tool-title-text: #ffffff;
      --tool-toolbar-bg: #dfd8c3;
      --tool-footer-bg: #ddd6c1;
      --tool-text: #101820;
      --tool-muted: #544e42;
      --tool-border: #7f9db9;
      --tool-border-strong: #315b8d;
      --tool-input-bg: #ffffff;
      --tool-button-bg: linear-gradient(180deg, #fffef9, #d9d3c3);
      --tool-button-active: linear-gradient(180deg, #d7e6fb, #8db5e7);
      --tool-focus: #225db4;
      --tool-list-selected: rgba(76, 128, 196, 0.22);
      --tool-code-bg: #f5f5f5;
      --tool-code-text: #16212d;
      --tool-success: #1b6f34;
      --tool-warning: #8d5c00;
      --tool-danger: #8c1f15;
      --tool-accent: #1a5fb8;
      --tool-title-height: 32px;
      --tool-toolbar-height: 38px;
    }

    .${TOOL_NAMESPACE}-window {
      position: absolute;
      pointer-events: auto;
      display: grid;
      grid-template-rows: var(--tool-title-height) var(--tool-toolbar-height) minmax(0, 1fr) auto;
      min-width: 320px;
      min-height: 360px;
      background: var(--tool-window-bg);
      border: 1px solid var(--tool-border-strong);
      border-radius: var(--tool-radius-window);
      box-shadow: var(--tool-shadow);
      overflow: hidden;
      color: var(--tool-text);
      user-select: none;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-window {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      min-width: 0;
      min-height: 0;
      border-radius: 0;
      border: 0;
      box-shadow: none;
      background: linear-gradient(180deg, #f3f4f8 0%, #ecedf2 100%);
      grid-template-rows: 46px var(--tool-toolbar-height) minmax(0, 1fr) 44px;
    }

    .${TOOL_NAMESPACE}-titlebar,
    .${TOOL_NAMESPACE}-toolbar,
    .${TOOL_NAMESPACE}-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 10px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-titlebar {
      display: grid;
      background: var(--tool-title-bg);
      color: var(--tool-title-text);
      border-bottom: 1px solid var(--tool-border-strong);
      cursor: move;
      grid-template-columns: auto minmax(0, 1fr) auto;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-titlebar {
      cursor: default;
      grid-template-columns: minmax(0, 1fr) auto;
      min-height: 46px;
      padding: 0 14px;
      background: linear-gradient(180deg, #ffffff 0%, #eceef5 100%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-titlebar > .${TOOL_NAMESPACE}-chrome:first-child {
      display: none;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-toolbar {
      padding: 0 14px;
      min-height: 42px;
      border-top: 1px solid color-mix(in srgb, var(--tool-border-strong) 42%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--tool-border-strong) 58%, transparent);
      background: linear-gradient(180deg, #f7f8fc 0%, #eceff6 100%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-main {
      padding: 10px;
      gap: 10px;
      background: linear-gradient(180deg, #f4f5f9 0%, #eeeff4 100%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-navigator,
    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-inspector {
      border: 1px solid color-mix(in srgb, var(--tool-border-strong) 44%, transparent);
      border-radius: 10px;
      background: color-mix(in srgb, var(--tool-window-panel) 82%, white 18%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-navigator {
      border-right: 1px solid color-mix(in srgb, var(--tool-border-strong) 44%, transparent);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-footer {
      padding: 0 14px;
      min-height: 44px;
      border-top: 1px solid color-mix(in srgb, var(--tool-border-strong) 58%, transparent);
      background: linear-gradient(180deg, #f7f8fc 0%, #eceff6 100%);
    }

    .${TOOL_NAMESPACE}-titlemeta {
      min-width: 0;
      display: grid;
      gap: 1px;
    }

    .${TOOL_NAMESPACE}-title {
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-subtitle {
      font-size: 11px;
      color: color-mix(in srgb, var(--tool-title-text) 78%, transparent);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-chrome {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: none;
    }

    .${TOOL_NAMESPACE}-traffic {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      border: 1px solid rgba(0, 0, 0, 0.18);
      background: #ff5f57;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
    }

    .${TOOL_NAMESPACE}-traffic[data-kind="min"] {
      background: #febc2e;
    }

    .${TOOL_NAMESPACE}-traffic[data-kind="zoom"] {
      background: #28c840;
    }

    .${TOOL_NAMESPACE}-toolbar {
      display: flex;
      background: var(--tool-toolbar-bg);
      border-bottom: 1px solid var(--tool-border);
      justify-content: space-between;
    }

    .${TOOL_NAMESPACE}-toolbar-group,
    .${TOOL_NAMESPACE}-actions,
    .${TOOL_NAMESPACE}-statline,
    .${TOOL_NAMESPACE}-footer-group {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-main {
      min-height: 0;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(255px, 290px) minmax(0, 1fr);
      background: var(--tool-window-panel);
    }

    .${TOOL_NAMESPACE}-pane {
      min-width: 0;
      min-height: 0;
      overflow: auto;
      padding: 8px;
      display: grid;
      align-content: start;
      gap: 8px;
    }

    .${TOOL_NAMESPACE}-navigator {
      border-right: 1px solid var(--tool-border);
      background: color-mix(in srgb, var(--tool-window-panel) 86%, white 14%);
    }

    .${TOOL_NAMESPACE}-inspector {
      background: var(--tool-window-panel);
    }

    .${TOOL_NAMESPACE}-panel {
      border: 1px solid var(--tool-border);
      border-radius: var(--tool-radius-panel);
      background: color-mix(in srgb, var(--tool-window-panel) 70%, white 30%);
      padding: 8px;
      display: grid;
      gap: 7px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-panel-label,
    .${TOOL_NAMESPACE}-micro {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--tool-muted);
    }

    .${TOOL_NAMESPACE}-button,
    .${TOOL_NAMESPACE}-field,
    .${TOOL_NAMESPACE}-selector-editor,
    .${TOOL_NAMESPACE}-search {
      appearance: none;
      border: 1px solid var(--tool-border-strong);
      border-radius: 8px;
      background: var(--tool-input-bg);
      color: var(--tool-text);
      font: inherit;
    }

    .${TOOL_NAMESPACE}-button {
      background: var(--tool-button-bg);
      color: var(--tool-button-text);
      min-height: 27px;
      padding: 0 9px;
      cursor: pointer;
      white-space: nowrap;
      touch-action: manipulation;
      -webkit-tap-highlight-color: rgba(10, 132, 255, 0.18);
    }

    .${TOOL_NAMESPACE}-button[data-active="true"] {
      background: var(--tool-button-active);
      border-color: color-mix(in srgb, var(--tool-focus) 70%, black 20%);
    }

    .${TOOL_NAMESPACE}-button[data-variant="ghost"] {
      background: transparent;
    }

    .${TOOL_NAMESPACE}-button[data-variant="danger"] {
      color: var(--tool-danger);
    }

    .${TOOL_NAMESPACE}-close {
      min-width: 28px;
      padding: 0;
    }

    .${TOOL_NAMESPACE}-close-text {
      min-width: auto;
      padding: 0 10px;
    }

    .${TOOL_NAMESPACE}-field,
    .${TOOL_NAMESPACE}-search,
    .${TOOL_NAMESPACE}-selector-editor {
      width: 100%;
      padding: 7px 9px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-field,
    .${TOOL_NAMESPACE}-search {
      min-height: 30px;
    }

    .${TOOL_NAMESPACE}-selector-editor,
    .${TOOL_NAMESPACE}-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: var(--tool-code-bg);
      color: var(--tool-code-text);
      white-space: pre;
      overflow: auto;
      resize: vertical;
      min-height: 64px;
    }

    .${TOOL_NAMESPACE}-selector-editor {
      line-height: 1.45;
      tab-size: 2;
      wrap: off;
    }

    .${TOOL_NAMESPACE}-stack,
    .${TOOL_NAMESPACE}-list {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-selected-list {
      max-height: 100%;
      overflow: auto;
      align-content: start;
      gap: 8px;
    }

    .${TOOL_NAMESPACE}-object-group {
      display: grid;
      gap: 6px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-object-group-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 2px 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      color: var(--tool-muted);
      text-transform: uppercase;
    }

    .${TOOL_NAMESPACE}-object-row,
    .${TOOL_NAMESPACE}-alt-row {
      width: 100%;
      display: grid;
      gap: 4px;
      text-align: left;
      padding: 6px 8px;
      border-radius: 10px;
      border: 1px solid var(--tool-border);
      background: color-mix(in srgb, var(--tool-window-panel) 85%, white 15%);
      cursor: pointer;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-object-row-inner {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto auto auto;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-object-parent {
      font-size: 11px;
      color: var(--tool-muted);
      padding-left: 2px;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-object-name {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
    }

    .${TOOL_NAMESPACE}-object-chip {
      font-size: 11px;
      min-height: 19px;
      padding: 0 6px;
      border-radius: 999px;
      border: 1px solid var(--tool-border);
      color: var(--tool-muted);
      background: color-mix(in srgb, var(--tool-window-panel) 62%, white 38%);
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }

    .${TOOL_NAMESPACE}-object-remove {
      min-height: 19px;
      min-width: 19px;
      padding: 0;
      border-radius: 8px;
      border: 1px solid var(--tool-border);
      background: transparent;
      color: var(--tool-muted);
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
    }

    .${TOOL_NAMESPACE}-object-remove:hover {
      color: var(--tool-danger);
      border-color: color-mix(in srgb, var(--tool-danger) 60%, var(--tool-border-strong) 40%);
    }

    .${TOOL_NAMESPACE}-object-row[data-selected="true"] {
      background: var(--tool-list-selected);
      border-color: color-mix(in srgb, var(--tool-focus) 55%, var(--tool-border-strong) 45%);
    }

    .${TOOL_NAMESPACE}-row-head,
    .${TOOL_NAMESPACE}-summary-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-truncate {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-muted {
      color: var(--tool-muted);
      font-size: 12px;
    }

    .${TOOL_NAMESPACE}-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 21px;
      padding: 0 7px;
      border-radius: 999px;
      border: 1px solid var(--tool-border);
      background: color-mix(in srgb, var(--tool-window-panel) 66%, white 34%);
      color: var(--tool-muted);
      font-size: 11px;
      white-space: nowrap;
    }

    .${TOOL_NAMESPACE}-pill[data-tone="good"] {
      color: var(--tool-success);
    }

    .${TOOL_NAMESPACE}-pill[data-tone="warn"] {
      color: var(--tool-warning);
    }

    .${TOOL_NAMESPACE}-pill[data-tone="bad"] {
      color: var(--tool-danger);
    }

    .${TOOL_NAMESPACE}-footer {
      min-height: 42px;
      background: var(--tool-footer-bg);
      border-top: 1px solid var(--tool-border);
      justify-content: space-between;
    }

    .${TOOL_NAMESPACE}-status {
      font-size: 12px;
      color: var(--tool-muted);
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-heuristic-anchor {
      position: static;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-popover {
      position: static;
      margin-top: 6px;
      display: grid;
      gap: 6px;
      padding: 6px;
      border: 1px solid var(--tool-border-strong);
      border-radius: 8px;
      background: color-mix(in srgb, var(--tool-window-panel) 80%, white 20%);
    }

    .${TOOL_NAMESPACE}-heuristic-list {
      max-height: 176px;
      overflow: auto;
      display: grid;
      gap: 4px;
    }

    .${TOOL_NAMESPACE}-heuristic-option {
      display: grid;
      gap: 2px;
      text-align: left;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--tool-border);
      background: var(--tool-input-bg);
      cursor: pointer;
    }

    .${TOOL_NAMESPACE}-search {
      min-height: 28px;
      padding: 5px 8px;
    }

    .${TOOL_NAMESPACE}-alt-row .${TOOL_NAMESPACE}-selector-editor {
      min-height: 40px;
      resize: none;
      padding: 6px 8px;
    }

    .${TOOL_NAMESPACE}-heuristic-option[data-selected="true"] {
      background: var(--tool-list-selected);
      border-color: color-mix(in srgb, var(--tool-focus) 55%, var(--tool-border-strong) 45%);
    }

    .${TOOL_NAMESPACE}-resize {
      position: absolute;
      background: transparent;
      pointer-events: auto;
      z-index: 5;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-traffic,
    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-resize {
      display: none;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="n"],
    .${TOOL_NAMESPACE}-resize[data-edge="s"] {
      left: 10px;
      right: 10px;
      height: 10px;
      cursor: ns-resize;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="n"] { top: -5px; }
    .${TOOL_NAMESPACE}-resize[data-edge="s"] { bottom: -5px; }

    .${TOOL_NAMESPACE}-resize[data-edge="e"],
    .${TOOL_NAMESPACE}-resize[data-edge="w"] {
      top: 10px;
      bottom: 10px;
      width: 10px;
      cursor: ew-resize;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="e"] { right: -5px; }
    .${TOOL_NAMESPACE}-resize[data-edge="w"] { left: -5px; }

    .${TOOL_NAMESPACE}-resize[data-edge="ne"],
    .${TOOL_NAMESPACE}-resize[data-edge="nw"],
    .${TOOL_NAMESPACE}-resize[data-edge="se"],
    .${TOOL_NAMESPACE}-resize[data-edge="sw"] {
      width: 14px;
      height: 14px;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="ne"] { top: -7px; right: -7px; cursor: nesw-resize; }
    .${TOOL_NAMESPACE}-resize[data-edge="nw"] { top: -7px; left: -7px; cursor: nwse-resize; }
    .${TOOL_NAMESPACE}-resize[data-edge="se"] { bottom: -7px; right: -7px; cursor: nwse-resize; }
    .${TOOL_NAMESPACE}-resize[data-edge="sw"] { bottom: -7px; left: -7px; cursor: nesw-resize; }

    .${TOOL_NAMESPACE}-empty {
      padding: 10px;
      border: 1px dashed var(--tool-border);
      border-radius: 10px;
      color: var(--tool-muted);
      font-size: 12px;
    }

    .${TOOL_NAMESPACE}-window:focus-within {
      outline: 1px solid color-mix(in srgb, var(--tool-focus) 55%, transparent);
      outline-offset: -1px;
    }

    .${TOOL_NAMESPACE}-button:focus-visible,
    .${TOOL_NAMESPACE}-field:focus-visible,
    .${TOOL_NAMESPACE}-search:focus-visible,
    .${TOOL_NAMESPACE}-selector-editor:focus-visible,
    .${TOOL_NAMESPACE}-object-row:focus-visible,
    .${TOOL_NAMESPACE}-alt-row:focus-visible,
    .${TOOL_NAMESPACE}-heuristic-option:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--tool-focus) 75%, white 25%);
      outline-offset: 1px;
    }

    @media (max-width: 760px) {
      .${TOOL_NAMESPACE}-main {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(150px, 190px) minmax(0, 1fr);
      }

      .${TOOL_NAMESPACE}-navigator {
        border-right: 0;
        border-bottom: 1px solid var(--tool-border);
      }

      .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-main {
        padding: 8px;
      }
    }
  `;
}
