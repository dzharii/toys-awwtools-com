import { TAGS } from "../core/constants.js";
import { registerAllComponents } from "../components/register-all.js";
import { acquireDesktopRoot, releaseDesktopRoot } from "../core/runtime.js";
import { buildExampleToolWindow } from "./example-tool.js";

registerAllComponents();

const CATALOG_OWNER = "catalog-page";
acquireDesktopRoot(CATALOG_OWNER);

let serial = 0;

function nextOwner(prefix) {
  serial += 1;
  return `${prefix}-${serial}`;
}

function card(title, body) {
  const node = document.createElement("section");
  node.style.border = "1px solid #2a3340";
  node.style.background = "rgba(248, 252, 255, 0.66)";
  node.style.backdropFilter = "blur(2px)";
  node.style.boxShadow = "0 8px 26px rgba(0,0,0,0.15)";
  node.style.padding = "14px";
  node.style.display = "grid";
  node.style.gap = "10px";
  node.innerHTML = `<h2 style="margin:0;font-size:16px;">${title}</h2><p style="margin:0;line-height:1.4;">${body}</p>`;
  return node;
}

function mountWindow(win, prefix) {
  const owner = nextOwner(prefix);
  const record = acquireDesktopRoot(owner);
  record.root.append(win);

  const release = () => releaseDesktopRoot(owner);
  win.addEventListener("awwbookmarklet-window-closed", release, { once: true });
  return win;
}

function openExample() {
  const win = buildExampleToolWindow({ title: "Example Tool" });
  mountWindow(win, "example");
}

function openBlank() {
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", "Blank Shell");
  win.innerHTML = `<${TAGS.panel}><p style="margin:0 0 8px;">Movable, resizable shell with optional regions.</p><p style="margin:0;">Try narrow width to validate constrained layout behavior.</p></${TAGS.panel}><${TAGS.statusbar} slot="statusbar"><span>Ready</span><span>Blank</span><span>No errors</span></${TAGS.statusbar}>`;
  win.setRect({ x: 110, y: 80, width: 420, height: 260 });
  mountWindow(win, "blank");
}

function buildInlineControls() {
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gap = "8px";
  wrap.innerHTML = `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;"><${TAGS.button}>Primary</${TAGS.button}><${TAGS.button} disabled>Disabled</${TAGS.button}><${TAGS.iconButton} aria-label="Add"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" fill="none"/></svg></${TAGS.iconButton}></div><div style="display:grid; gap:8px; max-width:380px;"><${TAGS.input} value="Inline input"></${TAGS.input}><${TAGS.textarea} rows="4" value="Inline textarea"></${TAGS.textarea}></div><div style="display:flex; gap:10px; flex-wrap:wrap;"><${TAGS.checkbox} checked>Checkbox</${TAGS.checkbox}><${TAGS.radio} name="demo-inline" checked>Radio A</${TAGS.radio}><${TAGS.radio} name="demo-inline">Radio B</${TAGS.radio}></div><div style="display:grid; gap:8px; max-width:340px;"><${TAGS.select}><option selected>Preset 1</option><option>Preset 2</option></${TAGS.select}><${TAGS.range} min="0" max="100" value="45"></${TAGS.range}><${TAGS.progress} value="45" max="100"></${TAGS.progress}></div>`;
  return wrap;
}

function initCatalog() {
  const root = document.getElementById("catalog-root") || document.body;

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gap = "14px";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";

  const shellCard = card("Desktop Shell", "Open floating windows and validate drag, resize, focus, menu, and status behavior.");
  const shellActions = document.createElement("div");
  shellActions.style.display = "flex";
  shellActions.style.gap = "8px";
  shellActions.innerHTML = `<${TAGS.button} id="open-example">Open Example Tool</${TAGS.button}><${TAGS.button} id="open-blank">Open Blank Window</${TAGS.button}>`;
  shellCard.append(shellActions);

  const controlsCard = card("Controls", "Buttons, text fields, checks, radios, select, range, and progress primitives.");
  controlsCard.append(buildInlineControls());

  const layoutCard = card("Grouped Layout", "Groups, panels, tabs, listbox, and compact shell composition for constrained spaces.");
  layoutCard.innerHTML += `<${TAGS.group} caption="Compact Example"><div style="display:grid; gap:8px;"><${TAGS.tabs}><${TAGS.tabPanel} label="Settings" selected><${TAGS.listbox}><div role="option" aria-selected="true">Mode A</div><div role="option">Mode B</div><div role="option">Mode C</div></${TAGS.listbox}></${TAGS.tabPanel}><${TAGS.tabPanel} label="Status"><${TAGS.statusbar}><span>Ready</span><span>3 items</span><span>Stable</span></${TAGS.statusbar}></${TAGS.tabPanel}></${TAGS.tabs}></div></${TAGS.group}>`;

  grid.append(shellCard, controlsCard, layoutCard);
  root.append(grid);

  shellCard.querySelector("#open-example").addEventListener("click", openExample);
  shellCard.querySelector("#open-blank").addEventListener("click", openBlank);
}

initCatalog();

window.addEventListener("beforeunload", () => {
  releaseDesktopRoot(CATALOG_OWNER);
});
