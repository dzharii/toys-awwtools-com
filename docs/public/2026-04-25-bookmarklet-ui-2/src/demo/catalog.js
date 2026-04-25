import { TAGS } from "../core/constants.js";
import { registerAllComponents } from "../components/register-all.js";
import { acquireDesktopRoot, releaseDesktopRoot } from "../core/runtime.js";
import { buildExampleToolWindow } from "./example-tool.js";
import { showToast } from "../components/toast.js";

registerAllComponents();

const CATALOG_OWNER = "catalog-page";
acquireDesktopRoot(CATALOG_OWNER);

let serial = 0;

function nextOwner(prefix) {
  serial += 1;
  return `${prefix}-${serial}`;
}

function icon(path) {
  return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
}

function mountWindow(win, prefix) {
  const owner = nextOwner(prefix);
  const record = acquireDesktopRoot(owner);
  record.root.append(win);

  win.addEventListener("awwbookmarklet-window-closed", () => releaseDesktopRoot(owner), { once: true });
  return win;
}

function openExample() {
  mountWindow(buildExampleToolWindow({ title: "Example Tool" }), "example");
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
  win.setRect({ x: 110, y: 80, width: 420, height: 260 });
  mountWindow(win, "blank");
}

function specimen({ title, description, tag, span = 6, body, variant = "default", tone = "", footerNote = "" }) {
  const node = document.createElement("section");
  node.className = `specimen specimen--${variant} span-${span}${tone ? ` specimen--${tone}` : ""}`;
  node.innerHTML = `
    <header class="specimen-header">
      <div>
        <h3 class="specimen-title">${title}</h3>
        ${description ? `<p class="specimen-desc">${description}</p>` : ""}
      </div>
      <p class="specimen-tag">${tag}</p>
    </header>
    <div class="specimen-body"></div>
    ${footerNote ? `<footer class="specimen-footer">${footerNote}</footer>` : ""}
  `;
  node.querySelector(".specimen-body").append(body);
  return node;
}

function section({ label, title, description, children }) {
  const node = document.createElement("section");
  node.className = "catalog-section section-band";
  node.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="section-label">${label}</p>
        <h2>${title}</h2>
      </div>
      <p>${description}</p>
    </div>
    <div class="specimen-grid"></div>
  `;
  node.querySelector(".specimen-grid").append(...children);
  return node;
}

function htmlNode(markup, className = "demo-stack") {
  const node = document.createElement("div");
  node.className = className;
  node.innerHTML = markup;
  return node;
}

function componentTagList(items) {
  return `<div class="component-tags">${items.map((item) => `<span>${item}</span>`).join("")}</div>`;
}

function showcaseFrame(markup) {
  return htmlNode(`<div class="showcase-frame">${markup}</div>`, "showcase-wrap");
}

function toolCard({ name, legacy, components }) {
  return `
    <article class="migration-card">
      <h4>${name}</h4>
      <p>${legacy}</p>
      ${componentTagList(components)}
    </article>
  `;
}

function stateMatrix(items) {
  return htmlNode(`
    <div class="state-matrix">
      ${items.map((item) => `
        <div class="state-cell">
          <${TAGS.stateOverlay} state="${item.state}" label="${item.label}">
            ${item.actions ? `<${TAGS.toolbar} slot="actions" density="compact" wrap>${item.actions}</${TAGS.toolbar}>` : ""}
          </${TAGS.stateOverlay}>
        </div>
      `).join("")}
    </div>
  `);
}

const mockArticleSrcdoc = `<!doctype html>
<html><head><style>
body{margin:0;font:14px system-ui,sans-serif;color:#1a2433;background:#fff}
.wrap{padding:18px;display:grid;gap:12px}
h1{font-size:21px;margin:0}
p{margin:0;line-height:1.45;color:#3f4b5c}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.card{border:1px solid #b9c2ce;background:#f5f7fa;padding:10px}
.bar{height:10px;background:#2f6fb7;margin-top:6px}
table{width:100%;border-collapse:collapse;font-size:12px}
td,th{border:1px solid #cbd3de;padding:5px;text-align:left}
</style></head><body><main class="wrap">
<h1>Research Capture</h1>
<p>Mock loaded document for iframe, overflow, and blocked-preview workflows.</p>
<div class="grid"><div class="card">Selected text<div class="bar" style="width:78%"></div></div><div class="card">Images found<div class="bar" style="width:42%"></div></div></div>
<table><tr><th>Block</th><th>Status</th></tr><tr><td>Article heading</td><td>Captured</td></tr><tr><td>Long quote</td><td>Needs review</td></tr></table>
</main></body></html>`;
function hydrateMockBrowser(panel) {
  queueMicrotask(() => {
    if (panel.addressFallback) panel.addressFallback.textContent = "";
    panel.frame?.setAttribute("srcdoc", mockArticleSrcdoc);
  });
}

function buildShellDemo() {
  return htmlNode(`
    <div class="demo-row">
      <${TAGS.button} id="open-example" variant="primary">Open Example Tool</${TAGS.button}>
      <${TAGS.button} id="open-blank">Open Blank Window</${TAGS.button}>
    </div>
    <div class="callout">Floating windows are intentionally tested outside the document flow. Open both shells, then drag, resize, focus, and close them.</div>
    <div class="token-strip">
      <span class="token">${TAGS.window}</span>
      <span class="token">${TAGS.menubar}</span>
      <span class="token">${TAGS.statusbar}</span>
    </div>
  `);
}

function buildControlDemo() {
  return htmlNode(`
    <div class="demo-row">
      <${TAGS.button} variant="primary">Primary</${TAGS.button}>
      <${TAGS.button}>Default</${TAGS.button}>
      <${TAGS.button} variant="ghost">Ghost</${TAGS.button}>
      <${TAGS.button} tone="danger">Danger</${TAGS.button}>
      <${TAGS.button} disabled>Disabled</${TAGS.button}>
      <${TAGS.iconButton} label="Add">${icon("M8 3v10M3 8h10")}</${TAGS.iconButton}>
      <${TAGS.iconButton} label="Remove" tone="danger">${icon("M4 8h8")}</${TAGS.iconButton}>
    </div>
    <div class="demo-two-col">
      <div class="demo-stack">
        <${TAGS.input} value="Inline input"></${TAGS.input}>
        <${TAGS.textarea} rows="4" value="Inline textarea"></${TAGS.textarea}>
      </div>
      <div class="demo-stack">
        <${TAGS.select}><option selected>Preset 1</option><option>Preset 2</option></${TAGS.select}>
        <${TAGS.range} min="0" max="100" value="45"></${TAGS.range}>
        <${TAGS.progress} value="45" max="100"></${TAGS.progress}>
      </div>
    </div>
    <div class="demo-row">
      <${TAGS.checkbox} checked>Remember choice</${TAGS.checkbox}>
      <${TAGS.radio} name="demo-inline" checked>Text</${TAGS.radio}>
      <${TAGS.radio} name="demo-inline">HTML</${TAGS.radio}>
    </div>
  `);
}

function buildLayoutDemo() {
  return htmlNode(`
    <${TAGS.group} caption="Compact settings">
      <${TAGS.tabs}>
        <${TAGS.tabPanel} label="Settings" selected>
          <${TAGS.listbox}>
            <div role="option" aria-selected="true">Mode A</div>
            <div role="option">Mode B</div>
            <div role="option">Mode C</div>
          </${TAGS.listbox}>
        </${TAGS.tabPanel}>
        <${TAGS.tabPanel} label="Status">
          <${TAGS.statusbar}><span>Ready</span><span>3 items</span><span>Stable</span></${TAGS.statusbar}>
        </${TAGS.tabPanel}>
      </${TAGS.tabs}>
    </${TAGS.group}>
    <${TAGS.panel}>
      <span slot="title">Panel with actions</span>
      <span slot="subtitle">Header regions stay separate from body content.</span>
      <${TAGS.toolbar} slot="actions" density="compact" wrap>
        <${TAGS.button}>Apply</${TAGS.button}>
        <${TAGS.button} variant="ghost">Reset</${TAGS.button}>
      </${TAGS.toolbar}>
      <p class="inline-note">This compact composition validates group, panel, tabs, listbox, toolbar, and status surfaces without hiding their boundaries.</p>
    </${TAGS.panel}>
  `);
}

function buildWorkflowDemo() {
  const wrap = showcaseFrame(`
    <${TAGS.appShell}>
      <span slot="title">Session Capture Console</span>
      <span slot="subtitle">Mock workflow for screenshot, reminder, and content-selection tools.</span>
      <${TAGS.toolbar} slot="actions" wrap density="compact" align="end">
        <${TAGS.button} variant="primary" command="capture.collect">Collect</${TAGS.button}>
        <${TAGS.button} variant="ghost">Refresh</${TAGS.button}>
        <${TAGS.button} tone="danger">Clear</${TAGS.button}>
      </${TAGS.toolbar}>
      <${TAGS.statusLine} slot="status" tone="success">Ready. 3 mock rows loaded.</${TAGS.statusLine}>
      <div slot="body" class="demo-stack">
        <${TAGS.alert} tone="warning" title="Draft available" dismissible>
          A previous capture draft can be restored before starting a new run.
          <${TAGS.toolbar} slot="actions" density="compact" wrap>
            <${TAGS.button}>Restore</${TAGS.button}>
            <${TAGS.button} variant="ghost">Start fresh</${TAGS.button}>
          </${TAGS.toolbar}>
        </${TAGS.alert}>

        <${TAGS.panel}>
          <span slot="title">Capture settings</span>
          <${TAGS.toolbar} slot="actions" density="compact" wrap>
            <${TAGS.button} id="demo-toast" variant="primary">Show toast</${TAGS.button}>
            <${TAGS.button} id="demo-dialog-btn">Open dialog</${TAGS.button}>
          </${TAGS.toolbar}>
          <div class="field-grid">
            <${TAGS.field} label="JPEG quality" help="Used by session screenshot exports." suffix="%" required>
              <${TAGS.input} type="number" min="1" max="100" value="80"></${TAGS.input}>
              <span slot="suffix">%</span>
            </${TAGS.field}>
            <${TAGS.field} label="Reminder delay" error="Delay must be at least 1 minute.">
              <${TAGS.input} type="number" value="0"></${TAGS.input}>
              <span slot="suffix">min</span>
            </${TAGS.field}>
          </div>
        </${TAGS.panel}>
      </div>
    </${TAGS.appShell}>

    <${TAGS.dialog} id="demo-dialog" modal label="Demo dialog" close-on-backdrop>
      <span slot="title">Command-like dialog</span>
      <p class="inline-note">This dialog uses the shared overlay and focus-restoration path.</p>
      <${TAGS.toolbar} slot="footer" align="end">
        <${TAGS.button} id="demo-dialog-close">Close</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.dialog}>
  `);

  wrap.querySelector("#demo-toast").addEventListener("click", () => {
    showToast({ key: "demo", message: "Saved mock draft", tone: "success", timeout: 1800 });
  });
  wrap.querySelector("#demo-dialog-btn").addEventListener("click", () => wrap.querySelector("#demo-dialog").show());
  wrap.querySelector("#demo-dialog-close").addEventListener("click", () => wrap.querySelector("#demo-dialog").close("demo"));
  return wrap;
}

function buildFieldMatrixDemo() {
  return htmlNode(`
    <div class="field-grid">
      <${TAGS.field} label="Due at" help="This is the event deadline time." required>
        <${TAGS.input} type="datetime-local" value="2026-04-25T17:30"></${TAGS.input}>
      </${TAGS.field}>
      <${TAGS.field} label="JPEG quality" help="Screenshot export quality." orientation="horizontal">
        <${TAGS.input} type="number" min="1" max="100" value="82"></${TAGS.input}>
        <span slot="suffix">%</span>
      </${TAGS.field}>
      <${TAGS.field} label="Reminder offset" error="Offset must be between 0 and 10080 minutes.">
        <${TAGS.input} type="number" value="-1"></${TAGS.input}>
        <span slot="suffix">min</span>
      </${TAGS.field}>
      <${TAGS.field} label="Capture mode" orientation="inline">
        <${TAGS.select}><option selected>Visible viewport</option><option>Full page</option><option>Selected region</option></${TAGS.select}>
      </${TAGS.field}>
      <${TAGS.field} label="Disabled setting" help="Inherited from browser policy." disabled>
        <${TAGS.checkbox} checked>Enable page toolbar</${TAGS.checkbox}>
      </${TAGS.field}>
      <${TAGS.field} label="Filename prefix">
        <span slot="prefix">session-</span>
        <${TAGS.input} value="research"></${TAGS.input}>
      </${TAGS.field}>
    </div>
  `);
}

function buildFeedbackMatrixDemo() {
  return htmlNode(`
    <div class="demo-stack">
      <div class="status-strip">
        <${TAGS.statusLine}>Idle</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="info" busy>Loading suggestions</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="success">Saved</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="warning">Needs fallback</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="danger">Capture failed</${TAGS.statusLine}>
      </div>
      <${TAGS.alert} tone="info" title="Privacy note">Page content stays local until an explicit export action.</${TAGS.alert}>
      <${TAGS.alert} tone="success" title="Draft restored" dismissible>
        Previous session data is available.
        <${TAGS.toolbar} slot="actions" density="compact" wrap>
          <${TAGS.button}>Review</${TAGS.button}>
          <${TAGS.button} variant="ghost">Dismiss</${TAGS.button}>
        </${TAGS.toolbar}>
      </${TAGS.alert}>
      <${TAGS.alert} tone="warning" title="Browser blocked the preview">Open externally or retry after changing page policy.</${TAGS.alert}>
      <${TAGS.alert} tone="danger" title="Clipboard denied">Use manual copy to finish the operation.</${TAGS.alert}>
    </div>
  `);
}

function buildRowsDemo() {
  return htmlNode(`
    <${TAGS.list} empty-text="No captured pages">
      <${TAGS.listItem} selectable selected tone="success">
        <span slot="title">Current research page</span>
        <span slot="meta">example.com - captured just now</span>
        <span slot="description">A long captured page title and description wrap without breaking the row layout.</span>
        <${TAGS.statusLine} slot="status" tone="success" compact>Captured</${TAGS.statusLine}>
        <${TAGS.toolbar} slot="actions" density="compact">
          <${TAGS.iconButton} label="Copy">${icon("M5 3h7v9H5zM3 5h2v8h7")}</${TAGS.iconButton}>
          <${TAGS.iconButton} label="Delete" tone="danger">${icon("M4 5h8M6 5v7m4-7v7M6 3h4l1 2H5z")}</${TAGS.iconButton}>
        </${TAGS.toolbar}>
      </${TAGS.listItem}>
      <${TAGS.listItem} tone="warning">
        <span slot="title">Blocked iframe page</span>
        <span slot="meta">blocked.example</span>
        <span slot="description">The row keeps actions separate from row activation.</span>
        <${TAGS.statusLine} slot="status" tone="warning" compact>Needs fallback</${TAGS.statusLine}>
      </${TAGS.listItem}>
      <${TAGS.listItem} interactive tone="danger">
        <span slot="leading" class="token">404</span>
        <span slot="title">Untitled captured tab with a very long URL-only fallback title that still needs to wrap cleanly</span>
        <span slot="meta">https://example.invalid/research/very/long/path?with=query-string</span>
        <span slot="description">Failed captures, missing titles, and long URLs are normal data, not edge-case noise.</span>
        <${TAGS.statusLine} slot="status" tone="danger" compact>Failed</${TAGS.statusLine}>
      </${TAGS.listItem}>
    </${TAGS.list}>
    <${TAGS.card} tone="info">
      <span slot="title">Preview card</span>
      <span slot="meta">Reusable card shell</span>
      Cards provide a stable header, body, action, media, and footer surface for captured blocks or settings rows.
    </${TAGS.card}>
  `);
}

function buildMetricDemo() {
  return htmlNode(`
    <div class="metric-grid">
      <${TAGS.metricCard} label="Open tabs" value="9" delta="+2" tone="info" description="Browser surfaces in the workspace"></${TAGS.metricCard}>
      <${TAGS.metricCard} label="Captured blocks" value="34" delta="12 new" tone="success" description="Saved locally in this session"></${TAGS.metricCard}>
      <${TAGS.metricCard} label="Fallbacks" value="2" delta="Needs action" tone="warning" description="Iframe or clipboard policy issues"></${TAGS.metricCard}>
    </div>
  `);
}

function buildPreviewDemo() {
  const wrap = htmlNode(`
    <div class="preview-duo">
    <div class="surface-frame rich-preview-frame">
      <${TAGS.richPreview} id="kit-rich-preview" empty-text="No preview"></${TAGS.richPreview}>
    </div>
    <${TAGS.browserPanel} class="browser-demo" title="Mock browser panel" loading-label="Loading mock page">
      <span slot="address">https://example.com/research/capture</span>
      <${TAGS.toolbar} slot="actions" density="compact">
        <${TAGS.button} variant="ghost">Inspect</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.browserPanel}>
    </div>
  `);

  wrap.querySelector("#kit-rich-preview").html = `
    <h2>Quarterly research note</h2>
    <p>Captured content can include <a href="https://example.com">links</a>, tables, images, quotes, and code while staying inside the preview surface.</p>
    <table><tr><th>Page</th><th>Status</th></tr><tr><td>Very long table cell that should scroll instead of breaking the window</td><td>Captured</td></tr><tr><td>Follow-up checklist</td><td>Queued</td></tr></table>
    <blockquote>Imported page content is constrained by the component and remains readable beside browser chrome.</blockquote>
    <pre><code>const veryLongLine = "This code block is intentionally long so overflow stays inside the preview surface.";</code></pre>
  `;
  hydrateMockBrowser(wrap.querySelector(TAGS.browserPanel));
  return wrap;
}

function buildStateDemo() {
  const matrix = stateMatrix([
    { state: "empty", label: "No filtered results" },
    { state: "loading", label: "Loading page snapshot" },
    { state: "error", label: "Capture worker failed" },
    { state: "blocked", label: "Preview blocked by page policy", actions: `<${TAGS.button}>Retry</${TAGS.button}><${TAGS.button} variant="ghost">Open externally</${TAGS.button}>` }
  ]);
  matrix.insertAdjacentHTML("beforeend", `
    <${TAGS.manualCopy} label="Fallback copy" value="Manual fallback text from a failed clipboard write."></${TAGS.manualCopy}>
  `);
  return matrix;
}

function buildBrowserPanelStatesDemo() {
  const wrap = htmlNode(`
    <${TAGS.browserPanel} class="browser-demo" title="Loaded browser panel">
      <span slot="address">https://example.com/research</span>
      <${TAGS.toolbar} slot="actions" density="compact">
        <${TAGS.button} variant="ghost">Copy URL</${TAGS.button}>
        <${TAGS.button} variant="ghost">Open</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.browserPanel}>
    <div class="browser-state-grid">
      <div class="surface-frame">
        <${TAGS.stateOverlay} state="loading" label="Browser panel loading"></${TAGS.stateOverlay}>
      </div>
      <div class="surface-frame">
        <${TAGS.stateOverlay} state="blocked" label="Frame refused to load">
          <${TAGS.toolbar} slot="actions" density="compact" wrap>
            <${TAGS.button}>Retry</${TAGS.button}>
            <${TAGS.button} variant="ghost">Open externally</${TAGS.button}>
          </${TAGS.toolbar}>
        </${TAGS.stateOverlay}>
      </div>
    </div>
  `);
  hydrateMockBrowser(wrap.querySelector(TAGS.browserPanel));
  return wrap;
}

function buildCommandDemo() {
  const wrap = htmlNode(`
    <div class="command-showcase">
      <${TAGS.commandPalette} id="inline-command-palette" placeholder="Search workspace commands"></${TAGS.commandPalette}>
      <div class="demo-stack">
        <${TAGS.shortcutHelp} id="inline-shortcuts"></${TAGS.shortcutHelp}>
        <${TAGS.toolbar} density="compact" wrap>
          <${TAGS.button} id="open-palette" variant="primary">Open dialog</${TAGS.button}>
          <${TAGS.button} id="open-shortcuts">Shortcuts</${TAGS.button}>
          <${TAGS.button} id="toast-success">Toast</${TAGS.button}>
          <${TAGS.button} id="toast-warning" tone="warning">Warn</${TAGS.button}>
          <${TAGS.button} id="toast-danger" tone="danger">Fail</${TAGS.button}>
        </${TAGS.toolbar}>
      </div>
    </div>
    <${TAGS.dialog} id="palette-dialog" modal label="Command palette" close-on-backdrop>
      <span slot="title">Command palette</span>
      <div class="palette-dialog-body">
        <${TAGS.commandPalette} id="command-palette" placeholder="Type a command"></${TAGS.commandPalette}>
        <${TAGS.shortcutHelp} id="dialog-shortcuts"></${TAGS.shortcutHelp}>
      </div>
      <${TAGS.toolbar} slot="footer" align="end">
        <${TAGS.button} id="palette-close">Close</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.dialog}>
    <${TAGS.dialog} id="shortcut-dialog" modal label="Keyboard shortcuts" close-on-backdrop>
      <span slot="title">Keyboard shortcuts</span>
      <${TAGS.shortcutHelp} id="shortcut-help"></${TAGS.shortcutHelp}>
      <${TAGS.toolbar} slot="footer" align="end">
        <${TAGS.button} id="shortcut-close">Close</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.dialog}>
  `);
  const commands = [
    { id: "tile.add", label: "Add tile", group: "Workspace", shortcut: "Alt+T", description: "Create a browser tile from the URL field.", keywords: ["browser", "url"] },
    { id: "layout.monocle", label: "Switch to monocle", group: "Layout", shortcut: "Alt+M", description: "Focus one tile at a time." },
    { id: "capture.copy", label: "Copy current capture", group: "Capture", shortcut: "Alt+Shift+C", description: "Copy selected page content." },
    { id: "danger.clear", label: "Clear workspace", group: "Workspace", shortcut: "", description: "Remove all tiles after confirmation.", disabled: true }
  ];
  const shortcuts = [
    { group: "Workspace", shortcut: "Alt+J", description: "Focus next tile" },
    { group: "Workspace", shortcut: "Alt+K", description: "Focus previous tile" },
    { group: "Layout", shortcut: "Alt+Enter", description: "Promote tile to master area" },
    { group: "Tools", shortcut: "Alt+P", description: "Open command palette" }
  ];
  wrap.querySelector("#inline-command-palette").commands = commands;
  wrap.querySelector("#command-palette").commands = commands;
  wrap.querySelector("#inline-shortcuts").shortcuts = shortcuts.slice(0, 3);
  wrap.querySelector("#dialog-shortcuts").shortcuts = shortcuts.slice(0, 3);
  wrap.querySelector("#shortcut-help").shortcuts = shortcuts;
  wrap.querySelector("#open-palette").addEventListener("click", () => {
    wrap.querySelector("#palette-dialog").show();
    queueMicrotask(() => wrap.querySelector("#command-palette").focusInput());
  });
  wrap.querySelector("#open-shortcuts").addEventListener("click", () => wrap.querySelector("#shortcut-dialog").show());
  wrap.querySelector("#palette-close").addEventListener("click", () => wrap.querySelector("#palette-dialog").close("demo"));
  wrap.querySelector("#shortcut-close").addEventListener("click", () => wrap.querySelector("#shortcut-dialog").close("demo"));
  wrap.querySelector("#toast-success").addEventListener("click", () => showToast({ key: "demo-toast", message: "Copied current URL", tone: "success", timeout: 1800 }));
  wrap.querySelector("#toast-warning").addEventListener("click", () => showToast({ key: "demo-toast", message: "Preview needs fallback", tone: "warning", timeout: 2200 }));
  wrap.querySelector("#toast-danger").addEventListener("click", () => showToast({ key: "demo-toast", message: "Command failed", tone: "danger", timeout: 2600 }));
  wrap.querySelector("#command-palette").addEventListener("awwbookmarklet-command-palette-execute", (event) => {
    showToast({ key: "command", message: `Command: ${event.detail.commandId}`, tone: "info", timeout: 1600 });
  });
  wrap.querySelector("#inline-command-palette").addEventListener("awwbookmarklet-command-palette-execute", (event) => {
    showToast({ key: "command", message: `Command: ${event.detail.commandId}`, tone: "info", timeout: 1600 });
  });
  return wrap;
}

function buildUrlPickerDemo() {
  const wrap = htmlNode(`
    <div class="url-picker-showcase">
      <${TAGS.toolbar} density="compact" wrap>
        <${TAGS.iconButton} label="Back">${icon("M10 4L6 8l4 4")}</${TAGS.iconButton}>
        <${TAGS.iconButton} label="Forward">${icon("M6 4l4 4-4 4")}</${TAGS.iconButton}>
        <${TAGS.urlPicker} id="demo-url-picker" open value="notes about iframe fallback" placeholder="Type URL or search query"></${TAGS.urlPicker}>
        <${TAGS.button} variant="primary">Add tile</${TAGS.button}>
      </${TAGS.toolbar}>
      <${TAGS.statusLine} compact tone="info">Search fallback preview with recent pages and bookmarks</${TAGS.statusLine}>
    </div>
  `);
  wrap.querySelector("#demo-url-picker").suggestions = [
    { title: "AWW tools dashboard", url: "https://example.com/tools", description: "Recent workspace page" },
    { title: "Bookmark: CSS reference", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", description: "Manual bookmark" },
    { title: "Session snapshot notes", url: "https://example.com/sessions/current", description: "Open from saved session" }
  ];
  wrap.querySelector("#demo-url-picker").addEventListener("awwbookmarklet-url-picker-apply", (event) => {
    showToast({ key: "url-picker", message: `Navigate: ${event.detail.decision.targetUrl}`, tone: "info", timeout: 1800 });
  });
  return wrap;
}

function buildMiniBrowserSpecimen() {
  return showcaseFrame(`
    <div class="mini-browser-specimen">
      <${TAGS.toolbar} density="compact" wrap>
        <${TAGS.iconButton} label="Back">${icon("M10 4L6 8l4 4")}</${TAGS.iconButton}>
        <${TAGS.iconButton} label="Forward">${icon("M6 4l4 4-4 4")}</${TAGS.iconButton}>
        <${TAGS.urlPicker} id="mini-url-picker" value="https://example.com/research"></${TAGS.urlPicker}>
        <${TAGS.button} variant="ghost">Page actions</${TAGS.button}>
      </${TAGS.toolbar}>
      <${TAGS.statusLine} tone="success" compact>Loaded example.com/research</${TAGS.statusLine}>
      <div class="mini-browser-content">
        <div class="mini-browser-page">
          <header>
            <h4>Research workspace</h4>
            <p>Mock loaded page with selected article regions and page-action feedback.</p>
          </header>
          <div class="mini-browser-columns">
            <section>
              <strong>Captured blocks</strong>
              <p>Article heading, lead paragraph, comparison table, and code snippet.</p>
            </section>
            <section>
              <strong>Page actions</strong>
              <p>Copy markdown, open externally, pin tile, and retry blocked frame.</p>
            </section>
          </div>
          <div class="mini-browser-table">
            <span>Heading</span><span>Captured</span>
            <span>Quote</span><span>Review</span>
            <span>Image</span><span>Skipped</span>
          </div>
        </div>
      </div>
    </div>
  `);
}

function buildToolCoverageDemo() {
  return htmlNode(`
    <div class="migration-grid">
      ${toolCard({ name: "Rich Text to Markdown", legacy: "Local editor chrome and copy status.", components: ["app shell", "toolbar", "rich preview", "manual copy", "toast"] })}
      ${toolCard({ name: "Page Screenshot", legacy: "Capture form with preview and export states.", components: ["field", "status line", "browser panel", "state overlay"] })}
      ${toolCard({ name: "Page Content Select", legacy: "Selectable content rows and saved-session dialog.", components: ["list item", "card", "dialog", "rich preview"] })}
      ${toolCard({ name: "Session Snapshot", legacy: "Capture dashboard with warnings and ZIP export.", components: ["metric card", "alert", "field", "progress"] })}
      ${toolCard({ name: "Notifications", legacy: "Reminder forms, disabled policy states, and grouped results.", components: ["field", "alert", "list", "metric"] })}
      ${toolCard({ name: "Mini/Multi Browser", legacy: "Address bar, tile commands, iframe fallback, and shortcuts.", components: ["url picker", "browser panel", "command palette", "shortcut help"] })}
      ${toolCard({ name: "Bookmarks", legacy: "Searchable rows, setting forms, and danger confirmation.", components: ["toolbar", "list item", "empty state", "dialog"] })}
    </div>
  `);
}

function buildPage() {
  const componentCount = Object.keys(TAGS).length;
  const page = document.createElement("main");
  page.className = "catalog-page";
  page.innerHTML = `
    <header class="catalog-hero">
      <div>
        <p class="catalog-kicker">AWW Bookmarklet UI Framework</p>
        <h1 class="catalog-title">Component catalog for constrained bookmarklet tools</h1>
        <p class="catalog-lede">A compact retro desktop kit for bookmarklets and extension tools: primitives, app shells, content previews, command surfaces, and realistic fallback paths.</p>
      </div>
      <div class="hero-console" aria-hidden="true">
        <div class="hero-window-bar"><span></span><strong>Capture Console</strong><em>Ready</em></div>
        <div class="hero-window-body">
          <div class="hero-sidebar"><span></span><span></span><span></span></div>
          <div class="hero-panel">
            <div class="hero-line hero-line--wide"></div>
            <div class="hero-line"></div>
            <div class="hero-grid"><span></span><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <${TAGS.button} id="hero-example" variant="primary">Open Tool</${TAGS.button}>
        <${TAGS.button} id="hero-blank">Open Shell</${TAGS.button}>
      </div>
    </header>
    <div class="coverage-rail">
      <span><strong>${componentCount}</strong> custom elements</span>
      <span>Primitives</span>
      <span>App patterns</span>
      <span>Content states</span>
      <span>Command surfaces</span>
      <span>Migration proof</span>
    </div>
  `;

  page.append(
    section({
      label: "Foundation",
      title: "Shell and primitive controls",
      description: "The first section keeps low-level pieces visible and uncluttered before introducing composed app surfaces.",
      children: [
        specimen({ title: "Desktop shell", description: "Window runtime, focus, drag, resize, and status behavior.", tag: "runtime", span: 5, variant: "compact", body: buildShellDemo() }),
        specimen({ title: "Control primitives", description: "Buttons, inputs, selection controls, range, and progress.", tag: "forms", span: 7, variant: "compact", body: buildControlDemo() }),
        specimen({ title: "Grouped layout", description: "Groups, tabs, listbox, panel actions, and status composition.", tag: "layout", span: 12, variant: "compact", body: buildLayoutDemo() }),
        specimen({ title: "Field matrix", description: "Labels, help, errors, units, disabled, horizontal, and inline layouts.", tag: "fields", span: 7, variant: "compact", body: buildFieldMatrixDemo() }),
        specimen({ title: "Feedback matrix", description: "Status lines and alerts across tones and actions.", tag: "feedback", span: 5, variant: "compact", body: buildFeedbackMatrixDemo() })
      ]
    }),
    section({
      label: "Application Patterns",
      title: "Workflow surfaces without crowding",
      description: "Higher-order components are split into scan-friendly states so developers can inspect each responsibility.",
      children: [
        specimen({ title: "Application shell", description: "The reference composition for migrated tools.", tag: "workflow", span: 12, variant: "showcase", tone: "primary", footerNote: "Includes dialog and toast actions without introducing app-specific CSS.", body: buildWorkflowDemo() }),
        specimen({ title: "Rows and cards", description: "Selectable rows, row actions, status tones, imperfect data, and reusable content cards.", tag: "data", span: 8, body: buildRowsDemo() }),
        specimen({ title: "Metrics", description: "Readable stat cards for session and browser state.", tag: "metrics", span: 4, variant: "compact", body: buildMetricDemo() })
      ]
    }),
    section({
      label: "Content States",
      title: "Preview, browser, and fallback states",
      description: "The messy realities of injected tools need first-class demos: rich imported HTML, iframe surfaces, blocked previews, empty states, and manual copy fallback.",
      children: [
        specimen({ title: "Preview surfaces", description: "Nonblank rich content and iframe surfaces with overflow pressure.", tag: "content", span: 8, variant: "showcase", body: buildPreviewDemo() }),
        specimen({ title: "Browser panel states", description: "Loaded, loading, blocked, retry, and external-open states.", tag: "browser", span: 4, body: buildBrowserPanelStatesDemo() }),
        specimen({ title: "Empty and blocked states", description: "Fallback UI grouped as routine states, plus manual copy.", tag: "fallback", span: 12, variant: "compact", body: buildStateDemo() })
      ]
    }),
    section({
      label: "Command Surfaces",
      title: "Navigation, commands, shortcuts, and feedback",
      description: "Overlay-heavy browser tools need URL entry, command discovery, shortcut help, and toast feedback before tile workspace migration is credible.",
      children: [
        specimen({ title: "URL picker", description: "Suggestions are open by default so the address behavior is visible.", tag: "navigation", span: 5, variant: "showcase", body: buildUrlPickerDemo() }),
        specimen({ title: "Command palette and shortcuts", description: "Inline command discovery plus the interactive dialog path.", tag: "commands", span: 7, variant: "showcase", body: buildCommandDemo() })
      ]
    }),
    section({
      label: "Migration Proof",
      title: "Reference-tool coverage map",
      description: "These specimens show how the old local UI patterns map into shared components without copying app-specific CSS.",
      children: [
        specimen({ title: "Mini Browser composition", description: "Toolbar, URL picker, status, and page surface assembled with the shared grammar.", tag: "browser app", span: 6, variant: "showcase", body: buildMiniBrowserSpecimen() }),
        specimen({ title: "Migration cards", description: "Reference tools mapped to replacement components.", tag: "coverage", span: 6, body: buildToolCoverageDemo() })
      ]
    })
  );

  return page;
}

function initCatalog() {
  const root = document.getElementById("catalog-root") || document.body;
  root.append(buildPage());

  root.querySelector("#hero-example").addEventListener("click", openExample);
  root.querySelector("#hero-blank").addEventListener("click", openBlank);
  root.querySelector("#open-example").addEventListener("click", openExample);
  root.querySelector("#open-blank").addEventListener("click", openBlank);
}

initCatalog();

window.addEventListener("beforeunload", () => {
  releaseDesktopRoot(CATALOG_OWNER);
});
