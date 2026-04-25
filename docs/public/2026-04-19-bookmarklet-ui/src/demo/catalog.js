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

function specimen({ title, description, tag, span = 6, body }) {
  const node = document.createElement("section");
  node.className = `specimen span-${span}`;
  node.innerHTML = `
    <header class="specimen-header">
      <div>
        <h3 class="specimen-title">${title}</h3>
        <p class="specimen-desc">${description}</p>
      </div>
      <p class="specimen-tag">${tag}</p>
    </header>
    <div class="specimen-body"></div>
  `;
  node.querySelector(".specimen-body").append(body);
  return node;
}

function section({ label, title, description, children }) {
  const node = document.createElement("section");
  node.className = "catalog-section";
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
  const wrap = htmlNode(`
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
    </${TAGS.list}>
    <${TAGS.card} tone="info">
      <span slot="title">Preview card</span>
      <span slot="meta">Reusable card shell</span>
      Cards provide a stable header, body, action, media, and footer surface for captured blocks or settings rows.
    </${TAGS.card}>
  `);
}

function buildPreviewDemo() {
  const wrap = htmlNode(`
    <div class="surface-frame">
      <${TAGS.richPreview} id="kit-rich-preview" empty-text="No preview"></${TAGS.richPreview}>
    </div>
    <${TAGS.browserPanel} class="browser-demo" src="about:blank" title="Mock browser panel" loading-label="Loading mock page"></${TAGS.browserPanel}>
  `);

  wrap.querySelector("#kit-rich-preview").html = `
    <h2>Rich preview content</h2>
    <p>Captured content can include <a href="https://example.com">links</a>, tables, images, quotes, and code.</p>
    <table><tr><th>Page</th><th>Status</th></tr><tr><td>Very long table cell that should scroll instead of breaking the window</td><td>Captured</td></tr></table>
    <blockquote>Imported page content is constrained by the component.</blockquote>
    <pre><code>const veryLongLine = "This code block is intentionally long so overflow stays inside the preview surface.";</code></pre>
  `;
  return wrap;
}

function buildStateDemo() {
  return htmlNode(`
    <${TAGS.emptyState} title="No filtered results" description="Try another search or clear the active filter."></${TAGS.emptyState}>
    <div class="surface-frame">
      <${TAGS.stateOverlay} state="blocked" label="Preview is blocked by page policy"></${TAGS.stateOverlay}>
    </div>
    <${TAGS.manualCopy} label="Fallback copy" value="Manual fallback text from a failed clipboard write."></${TAGS.manualCopy}>
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
        <p class="catalog-lede">This page stages the framework as reusable developer specimens: compact controls, shell behavior, workflow layout, content previews, and failure states.</p>
      </div>
      <div class="hero-actions">
        <${TAGS.button} id="hero-example" variant="primary">Open Tool</${TAGS.button}>
        <${TAGS.button} id="hero-blank">Open Shell</${TAGS.button}>
      </div>
    </header>
    <div class="catalog-summary">
      <div class="summary-item"><span class="summary-value">${componentCount}</span><span class="summary-label">registered custom elements</span></div>
      <div class="summary-item"><span class="summary-value">3</span><span class="summary-label">showcase sections</span></div>
      <div class="summary-item"><span class="summary-value">0</span><span class="summary-label">marketing panels</span></div>
      <div class="summary-item"><span class="summary-value">1</span><span class="summary-label">shared overlay root</span></div>
    </div>
  `;

  page.append(
    section({
      label: "Foundation",
      title: "Shell and primitive controls",
      description: "The first section keeps low-level pieces visible and uncluttered before introducing composed app surfaces.",
      children: [
        specimen({ title: "Desktop shell", description: "Spawn windows in the shared overlay and validate focus, drag, resize, and status behavior.", tag: "runtime", span: 5, body: buildShellDemo() }),
        specimen({ title: "Control primitives", description: "Buttons, inputs, selection controls, range, and progress in one restrained specimen.", tag: "forms", span: 7, body: buildControlDemo() }),
        specimen({ title: "Grouped layout", description: "Compact grouping, tabs, listbox, panel actions, and status composition.", tag: "layout", span: 12, body: buildLayoutDemo() })
      ]
    }),
    section({
      label: "Application Patterns",
      title: "Workflow surfaces without crowding",
      description: "Higher-order components are split into scan-friendly states so developers can inspect each responsibility.",
      children: [
        specimen({ title: "Application shell", description: "Header, action area, status line, alert, fields, dialog, and toast behavior.", tag: "workflow", span: 7, body: buildWorkflowDemo() }),
        specimen({ title: "Rows and cards", description: "Selectable rows, row actions, status tones, and a reusable content card.", tag: "data", span: 5, body: buildRowsDemo() })
      ]
    }),
    section({
      label: "Content States",
      title: "Preview, browser, and fallback states",
      description: "The messy realities of injected tools need first-class demos: rich imported HTML, iframe surfaces, blocked previews, empty states, and manual copy fallback.",
      children: [
        specimen({ title: "Preview surfaces", description: "Rich content and browser iframe areas are given enough room to reveal overflow behavior.", tag: "content", span: 8, body: buildPreviewDemo() }),
        specimen({ title: "Empty and blocked states", description: "Fallback UI is visible as a normal part of the system, not an afterthought.", tag: "fallback", span: 4, body: buildStateDemo() })
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
