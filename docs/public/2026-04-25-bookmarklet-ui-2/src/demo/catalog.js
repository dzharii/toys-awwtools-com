import { PUBLIC_TOKENS, TAGS } from "../core/constants.js";
import { registerAllComponents } from "../components/register-all.js";
import { acquireDesktopRoot, releaseDesktopRoot } from "../core/runtime.js";
import { applyThemePatch } from "../core/theme.js";
import { buildExampleToolWindow } from "./example-tool.js";
import { showToast } from "../components/toast.js";
import { iconSvg, ICON_NAMES } from "../icons/retro-icons.js";

registerAllComponents();

const CATALOG_OWNER = "catalog-page";
acquireDesktopRoot(CATALOG_OWNER);

let serial = 0;

function nextOwner(prefix) {
  serial += 1;
  return `${prefix}-${serial}`;
}

function mountWindow(win, prefix, theme = null) {
  const owner = nextOwner(prefix);
  const record = acquireDesktopRoot(owner);
  if (theme) applyThemePatch(win, theme);
  record.root.append(win);
  win.addEventListener("awwbookmarklet-window-closed", () => releaseDesktopRoot(owner), { once: true });
  return win;
}

function openExample() {
  mountWindow(buildExampleToolWindow({ title: "Session Capture Console" }), "example");
}

function openBlank() {
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", "Blank Shell");
  win.innerHTML = `
    <${TAGS.panel}>
      <span slot="title">Empty workspace</span>
      <p class="inline-note">Movable, resizable shell with optional regions.</p>
      <p class="inline-note">Resize this window to check narrow layout behavior.</p>
    </${TAGS.panel}>
    <${TAGS.statusbar} slot="statusbar"><span>Ready</span><span>Blank</span><span>No errors</span></${TAGS.statusbar}>
  `;
  win.setRect({ x: 110, y: 80, width: 430, height: 270 });
  mountWindow(win, "blank");
}

const THEME_RECIPES = {
  default: {},
  accent: {
    [PUBLIC_TOKENS.selectionBg]: "#2f6f4e",
    [PUBLIC_TOKENS.selectionFg]: "#f4fff8",
    [PUBLIC_TOKENS.focusRing]: "#1f7a4a",
    [PUBLIC_TOKENS.titlebarActiveBg]: "#d8e6dc",
    [PUBLIC_TOKENS.windowBg]: "#f1f5f2",
    [PUBLIC_TOKENS.panelBg]: "#fbfdfb"
  },
  compact: {
    [PUBLIC_TOKENS.space1]: "3px",
    [PUBLIC_TOKENS.space2]: "6px",
    [PUBLIC_TOKENS.space3]: "8px",
    [PUBLIC_TOKENS.controlHeight]: "26px",
    [PUBLIC_TOKENS.titleHeight]: "28px",
    [PUBLIC_TOKENS.controlPaddingX]: "8px",
    [PUBLIC_TOKENS.buttonPaddingX]: "8px",
    [PUBLIC_TOKENS.inputPaddingX]: "6px",
    [PUBLIC_TOKENS.windowBodyPadding]: "8px",
    [PUBLIC_TOKENS.panelPadding]: "6px",
    [PUBLIC_TOKENS.cardPadding]: "6px",
    [PUBLIC_TOKENS.menuItemHeight]: "26px"
  },
  rounded: {
    [PUBLIC_TOKENS.radiusControl]: "4px",
    [PUBLIC_TOKENS.radiusSurface]: "6px",
    [PUBLIC_TOKENS.radiusWindow]: "8px",
    [PUBLIC_TOKENS.windowBg]: "#f4f2f0",
    [PUBLIC_TOKENS.panelBg]: "#fbfaf8",
    [PUBLIC_TOKENS.selectionBg]: "#725c3a",
    [PUBLIC_TOKENS.focusRing]: "#8a6d3b",
    [PUBLIC_TOKENS.buttonShadow]: "none"
  },
  highContrast: {
    [PUBLIC_TOKENS.windowBg]: "#ffffff",
    [PUBLIC_TOKENS.panelBg]: "#ffffff",
    [PUBLIC_TOKENS.surfaceRaisedBg]: "#ffffff",
    [PUBLIC_TOKENS.surfaceInsetBg]: "#eeeeee",
    [PUBLIC_TOKENS.inputBg]: "#ffffff",
    [PUBLIC_TOKENS.inputFg]: "#000000",
    [PUBLIC_TOKENS.textMuted]: "#222222",
    [PUBLIC_TOKENS.borderStrong]: "#000000",
    [PUBLIC_TOKENS.borderSubtle]: "#333333",
    [PUBLIC_TOKENS.dividerColor]: "#333333",
    [PUBLIC_TOKENS.selectionBg]: "#003b8e",
    [PUBLIC_TOKENS.selectionFg]: "#ffffff",
    [PUBLIC_TOKENS.focusRing]: "#ffbf00",
    [PUBLIC_TOKENS.focusRingWidth]: "3px"
  }
};

function buildThemeDemoWindow(label) {
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", `${label} Theme`);
  win.innerHTML = `
    <${TAGS.menubar} slot="menubar">
      <button type="button" data-menu="theme">Theme</button>
      <${TAGS.menu} name="theme">
        <button type="button" data-command="theme.apply">Apply recipe</button>
        <button type="button" data-command="theme.inspect">Inspect tokens</button>
      </${TAGS.menu}>
    </${TAGS.menubar}>
    <${TAGS.toolbar} slot="toolbar" wrap>
      <${TAGS.button} variant="primary">Primary</${TAGS.button}>
      <${TAGS.button}>Default</${TAGS.button}>
      <${TAGS.button} variant="ghost">Ghost</${TAGS.button}>
      <${TAGS.iconButton} label="Refresh">${iconSvg("refresh")}</${TAGS.iconButton}>
    </${TAGS.toolbar}>
    <${TAGS.appShell}>
      <span slot="title">${label} recipe</span>
      <span slot="subtitle">A real window-scoped theme using framework tokens.</span>
      <${TAGS.alert} tone="warning" title="Portal check">Open the Theme menu to verify the portaled menu keeps this window's theme.</${TAGS.alert}>
      <${TAGS.panel}>
        <span slot="title">Controls</span>
        <${TAGS.field} label="Search"><${TAGS.input} value="tokenized controls"></${TAGS.input}></${TAGS.field}>
        <${TAGS.field} label="Mode"><${TAGS.select}><option>Preview</option><option>Capture</option></${TAGS.select}></${TAGS.field}>
        <${TAGS.tabs}>
          <${TAGS.tabPanel} label="Cards" selected>
            <${TAGS.card} selected>
              <span slot="title">Selected card</span>
              <span slot="meta">Radius, padding, borders, and focus are token-driven.</span>
            </${TAGS.card}>
          </${TAGS.tabPanel}>
          <${TAGS.tabPanel} label="State">
            <${TAGS.statusLine} tone="success">Theme applied before visible mount.</${TAGS.statusLine}>
          </${TAGS.tabPanel}>
        </${TAGS.tabs}>
      </${TAGS.panel}>
    </${TAGS.appShell}>
    <${TAGS.statusbar} slot="statusbar"><span>${label}</span><span>window scoped</span><span>tokens</span></${TAGS.statusbar}>
  `;
  win.setRect({ x: 120 + serial * 18, y: 96 + serial * 18, width: 560, height: 460 });
  return win;
}

function openThemeDemo(name) {
  const label = name === "highContrast" ? "High Contrast" : name[0].toUpperCase() + name.slice(1);
  mountWindow(buildThemeDemoWindow(label), `theme-${name}`, THEME_RECIPES[name]);
}

function button(label, options = {}) {
  const { variant = "secondary", icon = "", id = "", disabled = false, aria = "" } = options;
  return `<button class="os-button os-button--${variant}"${id ? ` id="${id}"` : ""}${disabled ? " disabled" : ""}${aria ? ` aria-label="${aria}"` : ""}>${icon ? iconSvg(icon) : ""}<span>${label}</span></button>`;
}

function iconButton(label, name, options = {}) {
  const { id = "", pressed = false } = options;
  return `<button class="icon-button"${id ? ` id="${id}"` : ""} aria-label="${label}"${pressed ? ` aria-pressed="true"` : ""}>${iconSvg(name)}</button>`;
}

function keycap(text) {
  return `<kbd class="keycap">${text}</kbd>`;
}

function field(label, control, options = {}) {
  const { help = "", error = "", required = false, disabled = false } = options;
  return `
    <label class="field-row${disabled ? " is-disabled" : ""}${error ? " is-invalid" : ""}">
      <span class="field-label">${label}${required ? `<span aria-hidden="true">*</span>` : ""}</span>
      <span class="field-main">${control}${help ? `<small>${help}</small>` : ""}${error ? `<small class="field-error">${error}</small>` : ""}</span>
    </label>
  `;
}

function panel({ title, icon = "panel", meta = "", className = "", body = "", actions = "" }) {
  return `
    <section class="catalog-panel ${className}">
      <header class="panel-titlebar">
        <span class="panel-title">${iconSvg(icon)}<span>${title}</span></span>
        ${meta ? `<span class="panel-meta">${meta}</span>` : ""}
        ${actions ? `<span class="panel-actions">${actions}</span>` : ""}
      </header>
      <div class="panel-body">${body}</div>
    </section>
  `;
}

function miniWindow({ title, body, footer = "", className = "" }) {
  return `
    <div class="mini-window ${className}">
      <div class="mini-titlebar">
        <span>${iconSvg("window")} ${title}</span>
        <span class="window-controls" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
      <div class="mini-body">${body}</div>
      ${footer ? `<div class="mini-status">${footer}</div>` : ""}
    </div>
  `;
}

function stateCard(tone, icon, title, message, action = "") {
  return `
    <article class="state-card state-card--${tone}">
      <span class="state-icon">${iconSvg(icon)}</span>
      <span class="state-copy"><strong>${title}</strong><small>${message}</small></span>
      ${action ? `<span class="state-action">${action}</span>` : ""}
    </article>
  `;
}

function metricRegister(items) {
  return `<div class="metric-register">${items.map((item) => `
    <div><span>${item.label}</span><strong>${item.value}</strong><small>${item.detail}</small></div>
  `).join("")}</div>`;
}

function commandList(commands) {
  return `
    <div class="command-surface">
      <label class="search-box">${iconSvg("search")}<input value="" placeholder="Type a command or search..." aria-label="Command search" /><span>${keycap("Ctrl+K")}</span></label>
      <div class="command-list" role="listbox" aria-label="Commands">
        ${commands.map((cmd, index) => `
          <button class="command-row${index === 0 ? " is-selected" : ""}" type="button" role="option" aria-selected="${index === 0 ? "true" : "false"}">
            ${iconSvg(cmd.icon)}
            <span><strong>${cmd.title}</strong><small>${cmd.desc}</small></span>
            <span class="shortcut">${cmd.keys.map(keycap).join("")}</span>
          </button>
        `).join("")}
      </div>
      <footer class="command-footer"><span>${keycap("↑")} ${keycap("↓")} Navigate</span><span>${keycap("Enter")} Execute</span><span>${keycap("Esc")} Close</span></footer>
    </div>
  `;
}

function urlPicker() {
  const rows = [
    ["url", "https://example.com/research", "Current page"],
    ["article", "https://example.com/research/notes", "Recent page"],
    ["table", "https://example.com/research/data", "Recent page"],
    ["clock", "https://example.com/research/archive", "Visited 2d ago"],
    ["search", "Search history for \"research\"", "Press Enter to search all history"]
  ];
  return `
    <div class="url-surface">
      <label class="select-like"><input value="https://example.com/research" aria-label="URL picker" /><button aria-label="Open URL suggestions">${iconSvg("menu")}</button></label>
      <div class="url-list" role="listbox" aria-label="URL suggestions">
        ${rows.map((row, index) => `
          <button class="url-row${index === 0 ? " is-selected" : ""}" type="button" role="option" aria-selected="${index === 0 ? "true" : "false"}">
            ${iconSvg(row[0])}<span><strong>${row[1]}</strong><small>${row[2]}</small></span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function browserToolbar(address = "https://example.com/research") {
  return `
    <div class="browser-toolbar">
      ${iconButton("Back", "back")}
      ${iconButton("Forward", "forward")}
      ${iconButton("Refresh", "refresh")}
      <label class="browser-address">${iconSvg("lock")}<input value="${address}" aria-label="Address" /></label>
      ${iconButton("Bookmark", "star")}
      ${iconButton("Fullscreen", "fullscreen", { pressed: true })}
      ${iconButton("More", "more")}
    </div>
  `;
}

function systemOverview() {
  return `
    <section class="system-overview">
      <div class="product-cell">
        <div class="app-logo">${iconSvg("logo", { label: "AWW" })}</div>
        <div>
          <h1>Component Catalog for Constrained Bookmarklet Tools</h1>
          <p>A curated set of primitives, patterns, and interaction tools for injection, capture, preview, commands, and resilient fallback paths.</p>
        </div>
        <div class="hero-actions">
          ${button("Open Sample Tool", { variant: "primary", id: "hero-example" })}
          ${button("Open Blank Window", { id: "hero-blank" })}
        </div>
      </div>
      ${miniWindow({
        title: "System Preview / Session Capture Console",
        className: "system-preview",
        body: `
          <div class="register-line"><span>Target</span><strong>https://example.org/reports</strong></div>
          <div class="register-line"><span>Mode</span><strong>Bookmarklet / constrained</strong></div>
          <div class="meter-row"><span>CPU</span><progress value="18" max="100"></progress><small>18%</small></div>
        `,
        footer: `<span>Ready</span><span>Policy: limited</span>`
      })}
      <div class="status-register">
        <fieldset>
          <legend>System Status</legend>
          <div><span>Environment</span><strong>Browser</strong></div>
          <div><span>Permissions</span><strong>Limited</strong></div>
          <div><span>Migration mode</span><strong>Enabled</strong></div>
          <div><span>Fallback mode</span><strong>Available</strong></div>
          <hr />
          <div><span>Last sync</span><strong>1m ago</strong></div>
          <div><span>Local cache</span><strong>128 items</strong></div>
        </fieldset>
      </div>
    </section>
  `;
}

function desktopShellPanel() {
  return panel({
    title: "Desktop Shell",
    icon: "window",
    meta: "runtime",
    body: `
      ${miniWindow({
        title: "Floating Shell",
        body: `
          <p class="inline-note">Window runtime, focus, drag, resize, and status behavior.</p>
          <div class="button-row">${button("Open Sample Tool", { variant: "primary", id: "open-example" })}${button("New Blank Window", { id: "open-blank" })}</div>
        `,
        footer: `<span>document: loaded</span><span>injection: active</span><span>mode: bookmarklet</span><span>statusbar: on</span>`
      })}
    `
  });
}

function controlsPanel() {
  return panel({
    title: "Control Primitives",
    icon: "sliders",
    meta: "forms",
    body: `
      <div class="tab-sample"><button class="is-active">Buttons</button><button>Inputs</button><button>Selects</button><button>Checks</button><button>Sliders</button><button>Misc</button></div>
      <div class="button-row">${button("Primary", { variant: "primary" })}${button("Default")}${button("Ghost", { variant: "ghost" })}${button("Danger", { variant: "danger" })}${button("Disabled", { disabled: true })}${iconButton("Add", "selected")}${iconButton("Remove", "minimize")}</div>
      <div class="control-grid">
        <input class="os-input" value="text input" aria-label="Text input" />
        <select class="os-input" aria-label="Select option"><option>Select option</option></select>
        <textarea class="os-input" rows="4" aria-label="Textarea">text area content...</textarea>
        <div class="range-stack"><label><input type="range" value="60" /> <span>60%</span></label><progress value="72" max="100"></progress></div>
      </div>
      <div class="button-row checks"><label><input type="checkbox" checked /> Checkbox</label><label><input type="radio" checked name="demo-radio" /> Radio A</label><label><input type="radio" name="demo-radio" /> Radio B</label></div>
    `
  });
}

function fieldMatrixPanel() {
  return panel({
    title: "Field Matrix",
    icon: "table",
    meta: "fields",
    body: `
      <div class="field-matrix">
        ${field("Label - required", `<input class="os-input" value="value" />`, { required: true })}
        ${field("URL picker", `<select class="os-input"><option>https://example.com</option></select>`)}
        ${field("Date and time", `<input class="os-input" type="datetime-local" value="2026-04-25T17:30" />`)}
        ${field("Capture mode", `<select class="os-input"><option>Visible viewport</option><option>Full page</option></select>`)}
        ${field("Reminder offset", `<input class="os-input" type="number" value="60" />`, { error: "Offset must be between 1 and 1680." })}
        ${field("Filename prefix", `<input class="os-input" value="session_" />`, { help: "Letters, numbers, dash and underscore." })}
        ${field("Disabled setting", `<label><input type="checkbox" disabled /> This option is disabled.</label>`, { disabled: true })}
        ${field("Help text", `<input class="os-input" value="readable" />`, { help: "Help text explains the expected value." })}
      </div>
    `
  });
}

function feedbackMatrixPanel() {
  return panel({
    title: "Feedback Matrix",
    icon: "info",
    meta: "states",
    body: `
      <div class="state-stack">
        ${stateCard("info", "info", "Private note saved", "Your private note was saved successfully.", button("View note"))}
        ${stateCard("warning", "warning", "Draft restored", "We restored a local draft from 2m ago.", button("Review"))}
        ${stateCard("success", "success", "Export completed", "Blocks exported to markdown.", button("Open folder"))}
        ${stateCard("danger", "error", "Upload denied", "Permissions policy blocked the upload.", button("Retry"))}
        ${stateCard("neutral", "selected", "Browser blocked frame", "The frame refused to load content.", button("Open externally"))}
      </div>
    `
  });
}

function appShellExamplePanel() {
  return panel({
    title: "Application Shell Example",
    icon: "console",
    meta: "workflow",
    className: "span-8",
    body: `
      ${miniWindow({
        title: "Session Capture Console",
        body: `
          <div class="menu-strip"><span>Console</span><span>Actions</span><span>View</span><span>Help</span><button>Collect</button><button>Refresh</button><button>Clear</button></div>
          ${stateCard("warning", "warning", "Draft available", "A previous capture draft can be restored before starting a new run.", button("Review"))}
          <div class="three-grid">
            <div class="group-box"><strong>Target</strong><input class="os-input" value="https://example.org/articles/12345" /><small>Mode: constrained<br />Viewport: 1280 x 800<br />Injected: active</small></div>
            <div class="group-box"><strong>Quick actions</strong>${button("Capture visible", { icon: "capture" })}${button("Open preview", { icon: "eye" })}${button("Copy as markdown", { icon: "markdown" })}</div>
            <div class="group-box"><strong>Activity log</strong><small>10:12:45 Capture completed<br />10:12:40 Preview opened<br />10:12:35 Commands loaded</small></div>
          </div>
        `,
        footer: `<span>Memory <progress value="34" max="100"></progress> 34%</span><span>DOM nodes: 1,842</span><span>Events: 24</span><span>Idle</span>`
      })}
    `
  });
}

function browserStatePanel() {
  return panel({
    title: "Browser State Preview",
    icon: "url",
    meta: "context",
    className: "span-4",
    body: `
      <div class="browser-panel-preview">
        ${browserToolbar("https://example.com/research")}
        <div class="metric-register three">
          <div>${iconSvg("info")}<span>Selected text</span><strong>142 chars</strong></div>
          <div>${iconSvg("image")}<span>Images found</span><strong>8</strong></div>
          <div>${iconSvg("link")}<span>Links found</span><strong>12</strong></div>
        </div>
        ${stateCard("warning", "warning", "Frame refused to load", "The frame blocked access to this resource.", button("Retry") + button("Open externally"))}
        <div class="mini-status"><span>Status: partially available</span><span>Policy: restricted</span></div>
      </div>
    `
  });
}

function overviewScreen() {
  return `
    <div class="screen-heading"><strong>Overview / Shell & Primitives</strong><span>Foundational shell, controls, fields, feedback, command preview, and browser state inventory.</span></div>
    <div class="screen-grid">
      ${desktopShellPanel()}
      ${controlsPanel()}
      ${fieldMatrixPanel()}
      ${feedbackMatrixPanel()}
      ${appShellExamplePanel()}
      ${browserStatePanel()}
    </div>
  `;
}

function primitivesScreen() {
  return `
    <div class="screen-heading"><strong>Primitives</strong><span>Strict control scale, field alignment, semantic feedback, state cues, and reusable pictogram assets.</span></div>
    <div class="screen-grid">
      ${desktopShellPanel()}
      ${controlsPanel()}
      ${fieldMatrixPanel()}
      ${feedbackMatrixPanel()}
      ${panel({
        title: "Command Palette Preview",
        icon: "console",
        className: "span-6",
        body: commandList(baseCommands().slice(0, 5))
      })}
      ${panel({
        title: "Icon Grammar",
        icon: "grid",
        className: "span-6",
        body: `<div class="icon-preview-grid">${ICON_NAMES.slice(0, 30).map((name) => `<span title="${name}">${iconSvg(name)}<small>${name}</small></span>`).join("")}</div>`
      })}
    </div>
  `;
}

function appPatternsScreen() {
  const commands = baseCommands();
  return `
    <div class="screen-heading"><strong>Application Patterns</strong><span>Composed patterns that solve common workflows in constrained environments.</span></div>
    <div class="screen-grid">
      ${appShellExamplePanel()}
      ${panel({
        title: "Rows & Cards",
        icon: "list",
        meta: "results",
        className: "span-8",
        body: `
          <div class="results-toolbar"><input class="os-input" placeholder="Search results..." /><button>Filter</button><button>Sort: Newest</button>${iconButton("List view", "list", { pressed: true })}${iconButton("Grid view", "grid")}</div>
          <div class="result-grid">${["Article Header", "Author Block", "Published Date", "Hero Image", "Summary Section", "Related Links"].map((title, index) => `
            <article class="result-card"><label><input type="checkbox" ${index === 0 ? "checked" : ""}/> <strong>${title}</strong></label><small>Selector: ${index === 0 ? "h1:title" : ".capture-item"}<br />Text nodes: ${index + 1}</small><span class="ok-dot"></span> Captured · 10:1${index} AM</article>
          `).join("")}</div>
          <div class="pager"><span>Showing 1-6 of 34</span><button>|&lt;</button><button>&lt;</button><button class="is-active">1</button><button>2</button><button>3</button><button>&gt;</button><button>&gt;|</button></div>
        `
      })}
      ${panel({ title: "Command Palette Preview", icon: "console", className: "span-4", body: commandList(commands.slice(0, 5)) })}
      ${panel({
        title: "Preview Pane",
        icon: "eye",
        className: "span-4",
        body: `
          <div class="document-surface compact">
            <div class="tab-sample"><button class="is-active">Preview</button><button>HTML</button><button>Text</button><button>Markdown</button></div>
            <article><h3>Understanding Constrained Environments</h3><p>Constrained bookmarklet tools run inside the page, not the page. Design for resilience, minimal footprint, and graceful fallbacks.</p><div class="image-placeholder"></div></article>
            <div class="mini-status"><span>Viewport: 1280x800</span><span>Zoom: 100%</span><span>Theme: Auto</span></div>
          </div>
        `
      })}
      ${panel({ title: "Metrics & Status Compact", icon: "metrics", className: "span-4", body: metricRegister([
        { label: "Captures", value: "24", detail: "+6 this hour" },
        { label: "Preview opens", value: "18", detail: "+4 this hour" },
        { label: "Commands run", value: "31", detail: "+9 this hour" },
        { label: "Errors", value: "0", detail: "No change" },
        { label: "Uptime", value: "2h 14m", detail: "Session time" }
      ]) })}
      ${panel({
        title: "Feedback Matrix Inline",
        icon: "info",
        className: "span-8",
        body: `<div class="inline-states">${stateCard("info", "info", "Private note saved", "Saved successfully.")}${stateCard("success", "success", "Export completed", "Markdown exported.")}${stateCard("warning", "warning", "Browser blocked frame", "Retry opened externally.")}${stateCard("danger", "error", "Upload denied", "Policy blocked upload.")}</div>`
      })}
    </div>
  `;
}

function contentStatesScreen() {
  return `
    <div class="screen-grid">
      ${panel({
        title: "Browser Panel Preview",
        icon: "url",
        className: "span-6",
        body: `
          ${browserToolbar("https://example.com/research/market-trends")}
          <div class="metric-register three"><div>${iconSvg("info")}<span>Selected text</span><strong>218 chars</strong></div><div>${iconSvg("image")}<span>Images found</span><strong>14</strong></div><div>${iconSvg("link")}<span>Links found</span><strong>9</strong></div></div>
          ${stateCard("success", "success", "Capture completed", "Blocks exported to markdown.", button("Open folder"))}
          ${stateCard("warning", "warning", "Draft restored", "We restored your draft from 2m ago.", button("Review draft"))}
        `
      })}
      ${panel({
        title: "Content State Matrix",
        icon: "table",
        className: "span-6",
        actions: button("Legend"),
        body: `
          <table class="state-table">
            <thead><tr><th>State</th><th>Preview panel</th><th>Document surface</th><th>Browser panel</th></tr></thead>
            <tbody>
              ${stateRow("Success", "success", ["Content captured", "Research Notes", "Capture completed"])}
              ${stateRow("Warning", "warning", ["Partial capture", "Missing elements", "Draft restored"])}
              ${stateRow("Error", "danger", ["Capture failed", "Unable to load", "Upload failed"])}
              ${stateRow("Neutral", "neutral", ["No selection", "No content yet", "Idle"])}
              ${stateRow("Blocked", "blocked", ["Preview blocked", "Access blocked", "Browser blocked frame"])}
            </tbody>
          </table>
        `
      })}
      ${panel({
        title: "Preview / Document Surface",
        icon: "article",
        className: "span-6",
        body: `
          <div class="document-surface">
            <div class="editor-toolbar"><select><option>Markdown</option></select><button>B</button><button>I</button><button>H1</button><button>H2</button><button>•</button><button>Preview</button><button>Split</button></div>
            <div class="split-doc"><section><h3># Market Research Notes</h3><p>This document captures key findings from the current session.</p><ul><li>Customer segments and behaviors</li><li>Competitive landscape</li><li>Opportunities and risks</li></ul></section><section><h3>Market Research Notes</h3><p>This document captures key findings from the current session.</p><ul><li>Customer segments and behaviors</li><li>Competitive landscape</li><li>Opportunities and risks</li></ul></section></div>
            <div class="mini-status"><span>Words: 132</span><span>Chars: 871</span><span>All changes saved</span></div>
          </div>
        `
      })}
      ${panel({
        title: "Fallback Copy & Manual Path",
        icon: "copy",
        className: "span-6",
        actions: button("Options"),
        body: `
          ${stateCard("info", "info", "Automatic capture is not available", "Use manual copy or export your own content.")}
          <div class="manual-grid"><div class="group-box"><strong>Manual copy steps</strong><ol><li>Select the content in the page.</li><li>Copy it to your clipboard (${keycap("Ctrl+C")}).</li><li>Paste into the document editor.</li><li>Add notes and export.</li></ol>${button("Open editor")}</div><div class="group-box"><strong>Helpful shortcuts</strong><dl><dt>Copy</dt><dd>Ctrl+C</dd><dt>Paste</dt><dd>Ctrl+V</dd><dt>Open editor</dt><dd>Ctrl+E</dd><dt>Export markdown</dt><dd>Ctrl+M</dd></dl></div></div>
        `
      })}
      ${panel({ title: "Empty States", icon: "noResults", className: "span-4", body: `<div class="empty-grid">${emptyState("noCaptures", "No captures yet", "Start by capturing content from the browser.", "Capture now")}${emptyState("noResults", "No results found", "Try adjusting your search or filters.", "Clear filters")}${emptyState("folder", "Folder is empty", "Exports will appear here after capture.", "Open folder")}</div>` })}
      ${panel({ title: "Blocked Preview States", icon: "blocked", className: "span-4", body: `<div class="empty-grid blocked">${emptyState("browserBlocked", "Frame refused to load", "The frame blocked access to this content.", "Open externally")}${emptyState("accessBlocked", "Preview blocked", "Your policy prevents previewing this content.", "Learn more")}${emptyState("frameBlocked", "Cross-origin blocked", "This content can't be previewed here.", "Try manual copy")}</div>` })}
      ${panel({ title: "Feedback / Status Surfaces", icon: "info", className: "span-4", body: `<div class="state-stack">${stateCard("success", "success", "Export completed", "34 blocks exported successfully.", button("Open folder"))}${stateCard("warning", "warning", "Sync delayed", "We'll retry in the background.", button("Details"))}${stateCard("danger", "error", "Upload denied", "Permissions policy blocked upload.", button("Retry"))}${stateCard("neutral", "neutral", "Idle", "System is ready.", `<span class="ok-led"></span>`)}</div>` })}
    </div>
  `;
}

function stateRow(label, tone, values) {
  const icon = tone === "blocked" ? "blocked" : tone === "danger" ? "error" : tone === "neutral" ? "neutral" : tone;
  return `<tr><th>${iconSvg(icon)} ${label}</th>${values.map((value) => `<td><span class="matrix-cell matrix-cell--${tone}"><strong>${value}</strong><small>${tone === "blocked" ? "Structured fallback." : "State cue and message."}</small></span></td>`).join("")}</tr>`;
}

function emptyState(icon, title, copy, action) {
  return `<article class="empty-state">${iconSvg(icon)}<strong>${title}</strong><small>${copy}</small>${button(action)}</article>`;
}

function commandSurfacesScreen() {
  return `
    <div class="screen-grid">
      ${panel({ title: "Command Palette Preview", icon: "console", className: "span-6", body: commandList(baseCommands()) })}
      ${panel({ title: "URL Picker / Suggestions", icon: "url", className: "span-3", body: urlPicker() })}
      ${panel({
        title: "Keyboard Shortcuts",
        icon: "table",
        className: "span-3",
        body: `<dl class="shortcut-list">${[
          ["Ctrl + K", "Open command palette"], ["Ctrl + Shift + C", "Capture visible content"], ["Ctrl + Alt + O", "Open capture console"], ["Ctrl + Shift + P", "Toggle preview pane"], ["Ctrl + C", "Copy selected text"], ["Ctrl + E", "Export as markdown"], ["Ctrl + F", "Search in page"], ["Ctrl + ,", "Open settings"], ["Esc", "Close overlays"], ["Enter", "Confirm / Execute"]
        ].map(([keys, desc]) => `<div><dt>${keys.split(" + ").map(keycap).join("<span>+</span>")}</dt><dd>${desc}</dd></div>`).join("")}</dl>`
      })}
      ${panel({
        title: "Browser Action Surface",
        icon: "capture",
        className: "span-7",
        body: `${browserToolbar()}<div class="action-grid">${button("Capture", { icon: "capture" })}${button("Preview", { icon: "eye" })}${button("Console", { icon: "console" })}${button("Export", { icon: "upload" })}${button("More", { icon: "more" })}</div><div class="inline-states">${stateCard("success", "success", "Capture completed", "Blocks exported to markdown.")}${stateCard("warning", "warning", "Python not detected", "Some features will be limited.", button("Open console"))}</div>`
      })}
      ${panel({
        title: "Compact Shell Preview",
        icon: "window",
        className: "span-5",
        body: miniWindow({
          title: "Mini Capture Shell",
          body: `<div class="shell-register"><span>doc: loaded</span><span>injection: active</span><span>mode: bookmarklet</span><span>statusbar: on</span><span>items: 34</span><span>last sync: 1m ago</span></div><div class="button-row">${button("Capture")}${button("Preview")}${button("Export")}${button("Settings")}</div>`
        })
      })}
      ${panel({ title: "Feedback & Action Strip", icon: "info", className: "span-12", body: `<div class="action-strip">${stateCard("success", "success", "Success", "Operation completed.")}${stateCard("info", "info", "Info", "This is an informational note.")}${stateCard("warning", "warning", "Warn", "This action may have limits.")}${stateCard("danger", "error", "Error", "Something prevented this.")}<span class="strip-buttons">${button("Open dialog", { variant: "primary", id: "open-demo-dialog" })}${button("Toast", { id: "toast-success" })}${button("Warn", { id: "toast-warning" })}${button("Export")}${button("...", { aria: "More actions" })}</span></div>` })}
    </div>
  `;
}

function themeDemoScreen() {
  return `
    <div class="screen-heading"><strong>Theming</strong><span>Window-scoped recipes using public tokens for accent, density, radius, and contrast.</span></div>
    <div class="screen-grid">
      ${panel({
        title: "Theme Recipes",
        icon: "gear",
        className: "span-12",
        body: `
          <div class="action-grid">
            ${button("Open Default", { id: "theme-default" })}
            ${button("Open Accent", { variant: "primary", id: "theme-accent" })}
            ${button("Open Compact", { id: "theme-compact" })}
            ${button("Open Rounded", { id: "theme-rounded" })}
            ${button("Open High Contrast", { variant: "danger", id: "theme-highContrast" })}
          </div>
          <div class="inline-states">
            ${stateCard("info", "info", "Root themes", "Use setTheme(theme) when every tool in a suite should share one look.")}
            ${stateCard("success", "success", "Window themes", "Use mountWindow(win, { theme }) for independent tools on one desktop root.")}
            ${stateCard("warning", "warning", "Escape hatch", "::part is available for rare local overrides after tokens solve the common case.")}
          </div>
        `
      })}
      ${panel({
        title: "Recipe Tokens",
        icon: "table",
        className: "span-6",
        body: `
          <table class="state-table">
            <thead><tr><th>Recipe</th><th>Primary tokens</th></tr></thead>
            <tbody>
              <tr><th>Accent</th><td><span class="matrix-cell matrix-cell--success"><strong>selectionBg, focusRing, windowBg</strong><small>Tool identity without changing layout.</small></span></td></tr>
              <tr><th>Compact</th><td><span class="matrix-cell matrix-cell--info"><strong>space*, controlHeight, menuItemHeight</strong><small>Denser operation surfaces.</small></span></td></tr>
              <tr><th>Rounded</th><td><span class="matrix-cell matrix-cell--neutral"><strong>radiusControl, radiusSurface, radiusWindow</strong><small>Softer shape while preserving structure.</small></span></td></tr>
              <tr><th>High contrast</th><td><span class="matrix-cell matrix-cell--warning"><strong>border*, focusRingWidth, state colors</strong><small>Stronger visibility and keyboard focus.</small></span></td></tr>
            </tbody>
          </table>
        `
      })}
      ${panel({
        title: "Scoped Theme Behavior",
        icon: "window",
        className: "span-6",
        body: miniWindow({
          title: "Two tools / one root",
          body: `<div class="shell-register"><span>root: shared</span><span>tool A: accent</span><span>tool B: compact</span><span>menus: copied context</span></div><p class="inline-note">Each themed window receives CSS variables on the window host before it is appended to the desktop root.</p>`,
          footer: `<span>No root repaint</span><span>Portal context copied</span>`
        })
      })}
    </div>
  `;
}

function migrationProofScreen() {
  const cards = [
    ["Rich Text to Markdown", "Local editor chrome, preview tabs, markdown export, and manual copy fallback.", ["app shell", "preview", "manual copy"]],
    ["Page Screenshot", "Capture form with browser preview, export states, and retry paths.", ["browser panel", "state"]],
    ["Form Context Select", "Selectable content rows and saved-session dialog.", ["rows", "dialog"]],
    ["Session Snapshot", "Capture dashboard with warnings and ZIP export.", ["register", "progress"]],
    ["Notifications", "Reminder forms, disabled policy states, and grouped results.", ["field", "alert"]],
    ["Mini/Multi Browser", "Address bar, tile commands, iframe fallback, and shortcuts.", ["url picker", "commands"]],
    ["Bookmarklet", "Injection active status, mode register, and compact shell controls.", ["shell", "status"]],
    ["Browser Panel", "Policy, cross-origin, and open-external states.", ["browser", "blocked"]],
    ["Command Palette", "Keyboard-first command discovery with keycaps and selected rows.", ["commands", "keys"]],
    ["Fallback Copy", "Manual path as resilient workflow, not panic state.", ["fallback", "copy"]],
    ["Metrics", "Status-register counters replacing generic KPI cards.", ["register", "metrics"]]
  ];
  return `
    <div class="screen-grid">
      ${panel({
        title: "Mini Browser Composition",
        icon: "url",
        className: "span-6",
        body: `
          <div class="mini-browser-composition">
            ${browserToolbar("https://example.com/research")}
            <div class="loaded-page">
              <main><h3>Research workspace</h3><p>Mock loaded page with selected article regions and page-action feedback.</p><section class="selected-region"><strong>Selected article</strong><p>Lead paragraph, comparison table, and code snippet are ready for capture.</p></section><div class="data-table"><span>Heading</span><span>Captured</span><span>Quote</span><span>Review</span><span>Image</span><span>Skipped</span></div></main>
              <aside><strong>Page actions</strong>${button("Copy markdown", { icon: "markdown" })}${button("Open externally", { icon: "external" })}${button("Retry blocked frame", { icon: "retry" })}</aside>
            </div>
            <div class="mini-status"><span>Loaded example.com/research</span><span>Selected blocks: 4</span><span>Policy: limited</span></div>
          </div>
        `
      })}
      ${panel({
        title: "Migration Cards",
        icon: "panel",
        className: "span-6",
        body: `<div class="migration-grid">${cards.map(([title, copy, tags]) => `<article class="migration-card"><h3>${title}</h3><p>${copy}</p><div>${tags.map((tag) => `<span>${tag}</span>`).join("")}</div></article>`).join("")}</div>`
      })}
      ${panel({
        title: "Icon System Preview",
        icon: "grid",
        className: "span-12",
        body: `<div class="icon-preview-grid">${ICON_NAMES.map((name) => `<span title="${name}">${iconSvg(name)}<small>${name}</small></span>`).join("")}</div>`
      })}
    </div>
  `;
}

function baseCommands() {
  return [
    { icon: "capture", title: "Capture visible content", desc: "Capture the currently visible portion of the page", keys: ["Ctrl", "Shift", "C"] },
    { icon: "console", title: "Open capture console", desc: "Open the session capture console", keys: ["Ctrl", "Alt", "O"] },
    { icon: "eye", title: "Toggle preview pane", desc: "Show or hide the preview panel", keys: ["Ctrl", "Shift", "P"] },
    { icon: "copy", title: "Copy selected text", desc: "Copy text from selection to clipboard", keys: ["Ctrl", "C"] },
    { icon: "markdown", title: "Export as markdown", desc: "Export captured content as markdown", keys: ["Ctrl", "E"] },
    { icon: "search", title: "Search in page", desc: "Find text within the current page", keys: ["Ctrl", "F"] },
    { icon: "gear", title: "Open settings", desc: "Open bookmarklet settings", keys: ["Ctrl", ","] }
  ];
}

function buildPage() {
  const page = document.createElement("main");
  page.className = "catalog-app";
  page.innerHTML = `
    <section class="app-frame" aria-label="AWW Bookmarklet component catalog">
      <header class="app-titlebar">
        <div class="title-identity">${iconSvg("logo")}<span>Component Catalog for Constrained Bookmarklet Tools</span></div>
        <div class="build-meta"><span>Build 0.9.0</span><span>RetroOS 3.11</span></div>
        <div class="window-controls" aria-hidden="true"><i></i><i></i><i></i></div>
      </header>
      <nav class="menu-row" aria-label="Application menu"><button>File</button><button>Edit</button><button>View</button><button>Tools</button><button>Window</button><button>Help</button></nav>
      ${systemOverview()}
      <div class="catalog-tabs" role="tablist" aria-label="Catalog sections">
        ${[
          ["overview", "Overview"],
          ["primitives", "Primitives"],
          ["patterns", "App Patterns"],
          ["states", "Content States"],
          ["commands", "Command Surfaces"],
          ["themes", "Theming"],
          ["migration", "Migration Proof"]
        ].map(([id, label], index) => `<button id="tab-${id}" role="tab" aria-controls="panel-${id}" aria-selected="${index === 0 ? "true" : "false"}" tabindex="${index === 0 ? "0" : "-1"}" data-tab="${id}">${label}</button>`).join("")}
      </div>
      <section class="tab-panels">
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" data-panel="overview">${overviewScreen()}</div>
        <div id="panel-primitives" role="tabpanel" aria-labelledby="tab-primitives" data-panel="primitives" hidden>${primitivesScreen()}</div>
        <div id="panel-patterns" role="tabpanel" aria-labelledby="tab-patterns" data-panel="patterns" hidden>${appPatternsScreen()}</div>
        <div id="panel-states" role="tabpanel" aria-labelledby="tab-states" data-panel="states" hidden>${contentStatesScreen()}</div>
        <div id="panel-commands" role="tabpanel" aria-labelledby="tab-commands" data-panel="commands" hidden>${commandSurfacesScreen()}</div>
        <div id="panel-themes" role="tabpanel" aria-labelledby="tab-themes" data-panel="themes" hidden>${themeDemoScreen()}</div>
        <div id="panel-migration" role="tabpanel" aria-labelledby="tab-migration" data-panel="migration" hidden>${migrationProofScreen()}</div>
      </section>
      <footer class="bottom-status"><span>Ready</span><span>RetroOS 3.11</span><span>CAPS</span><span>NUM</span><span>SCRL</span></footer>
    </section>
    <${TAGS.dialog} id="demo-dialog" modal label="Demo dialog" close-on-backdrop>
      <span slot="title">System dialog</span>
      <p class="inline-note">The dialog uses the shared overlay path and inherits the retro system tokens.</p>
      <${TAGS.toolbar} slot="footer" align="end"><${TAGS.button} id="demo-dialog-close">Close</${TAGS.button}></${TAGS.toolbar}>
    </${TAGS.dialog}>
  `;
  return page;
}

function selectTab(root, id, focus = false) {
  const tabs = [...root.querySelectorAll("[role='tab'][data-tab]")];
  const panels = [...root.querySelectorAll("[role='tabpanel'][data-panel]")];
  tabs.forEach((tab) => {
    const selected = tab.dataset.tab === id;
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  panels.forEach((panelNode) => {
    panelNode.hidden = panelNode.dataset.panel !== id;
  });
}

function wireInteractions(root) {
  root.querySelector("#hero-example")?.addEventListener("click", openExample);
  root.querySelector("#hero-blank")?.addEventListener("click", openBlank);
  root.querySelectorAll("#open-example").forEach((node) => node.addEventListener("click", openExample));
  root.querySelectorAll("#open-blank").forEach((node) => node.addEventListener("click", openBlank));
  root.addEventListener("click", (event) => {
    const tab = event.target.closest("[role='tab'][data-tab]");
    if (tab) selectTab(root, tab.dataset.tab, true);
    if (event.target.closest("#toast-success")) showToast({ key: "demo-toast", message: "Operation completed", tone: "success", timeout: 1800 });
    if (event.target.closest("#toast-warning")) showToast({ key: "demo-toast", message: "Manual fallback may be required", tone: "warning", timeout: 2200 });
    for (const name of Object.keys(THEME_RECIPES)) {
      if (event.target.closest(`#theme-${name}`)) openThemeDemo(name);
    }
    if (event.target.closest("#open-demo-dialog")) root.querySelector("#demo-dialog")?.show();
    if (event.target.closest("#demo-dialog-close")) root.querySelector("#demo-dialog")?.close("demo");
  });
  root.querySelector(".catalog-tabs")?.addEventListener("keydown", (event) => {
    const tabs = [...root.querySelectorAll("[role='tab'][data-tab]")];
    const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(root, tabs[next].dataset.tab, true);
  });
}

function initCatalog() {
  const root = document.getElementById("catalog-root") || document.body;
  const page = buildPage();
  root.append(page);
  wireInteractions(root);
}

initCatalog();

window.addEventListener("beforeunload", () => {
  releaseDesktopRoot(CATALOG_OWNER);
});
